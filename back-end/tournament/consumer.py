from channels.generic.websocket import AsyncWebsocketConsumer
from .models import TournamentParticipant
from channels.db import database_sync_to_async
from game.models import Match
from user.models import User
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import UntypedToken
import json

class TournamentConsumer(AsyncWebsocketConsumer):
    player_channels = {}
    waiting_players_data = {}
    tournamen_data = {
        "first_round": [],
        "second_round": []
    }
    matchs = {}
    ################## tools
    @database_sync_to_async
    def get_player_by_id(self, player_id):
        return User.objects.get(pk=player_id)

    @database_sync_to_async
    def get_all_players(self):
        return list(TournamentParticipant.objects.all())
    
    @database_sync_to_async
    def get_user_from_scope(self, scope):
        token = scope.get("cookies", {}).get("access")
        try:
            validated_token = UntypedToken(token)
            user_id = validated_token["user_id"]
            user = get_object_or_404(User, id=user_id)
            return user
        except Exception:
            return None
    
    @database_sync_to_async
    def delete_player(self, player_id):
        try:
            participant = TournamentParticipant.objects.get(player_id=player_id)
            participant.delete()
            return True
        except TournamentParticipant.DoesNotExist:
            return False

    async def remove_all_players(self):
        players = await self.get_all_players()
        for player in players:
            success = await self.delete_player(player.id)
            if success:
                print(f"Player {player.id} removed.", flush=True)
            else:
                print(f"Failed to remove player {player.id}.", flush=True)
        print("All players have been removed.", flush=True)

    @database_sync_to_async
    def get_all_matches(self):
        return Match.objects.all()

    @database_sync_to_async
    def delete_all_matches(self):
        try:
            matches = Match.objects.all()
            for match in matches:
                match.delete()
            return True
        except Match.DoesNotExist:
            return False

    async def remove_player_from_tournament(self, user_id, online=False):
        print("<===if online or not===>", flush=True)
        for i in range(0, len(self.tournamen_data['first_round']), 1):
            if self.tournamen_data['first_round'][i]['id'] == user_id:
                if online == True:
                    print("<===player already exist 22222===>", flush=True)
                    self.tournamen_data['first_round'][i]['online'] = True
                    print(f"Player {user_id} back to the tournament.", flush=True)
                else:
                    self.tournamen_data['first_round'][i]['online'] = False
                    print(f"Player {user_id} removed from tournament.", flush=True)

    ################# end tools

    ################# websocket methods
    async def sent_participants_data(self):
        print("about to sent users data 222222222222222", flush=True)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'players_status_changed',
                'players_data': self.tournamen_data
            }
        )

    async def sent_match_data(self, user1_id, user2_id=None):
        for match in self.matchs.values():
            if user2_id is not None and user1_id == match.player1.id and user2_id == match.player2.id:
                print(f"player1=={user1_id}-----player2=={user2_id}", flush=True)
                await self.channel_layer.group_send(
                    f'notification_{match.player1.id}',
                    {
                        'type': 'notification_message',
                        'message': match.id,
                        'notification_type': "tournament_match",
                        'receiver': match.player1.id
                    }
                )
                await self.channel_layer.group_send(
                    f'notification_{match.player2.id}',
                    {
                        'type': 'notification_message',
                        'message': match.id,
                        'notification_type': "tournament_match",
                        'receiver': match.player2.id
                    }
                )
                return
            elif not user2_id and (user1_id == match.player1.id or user1_id == match.player2.id):
                if user1_id == match.player1.id:
                    await self.channel_layer.group_send(
                        f'notification_{match.player1.id}',
                        {
                            'type': 'notification_message',
                            'message': match.id,
                            'notification_type': "tournament_match",
                            'receiver': match.player1.id
                        }
                    )
                    return
                if user1_id == match.player2.id:
                    await self.channel_layer.group_send(
                        f'notification_{match.player2.id}',
                        {
                            'type': 'notification_message',
                            'message': match.id,
                            'notification_type': "tournament_match",
                            'receiver': match.player2.id
                        }
                    )
                    return
                return

    async def connect(self):
        # self.match_id = self.scope['url_route']['kwargs'].get('match_id')
        self.room_group_name = "tournament"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        user = await self.get_user_from_scope(self.scope)
        print(f"User id: {user.id}", flush=True)
        self.player_channels[user.id] = self.channel_name
        await self.accept()
        

    async def disconnect(self, code):
        print(code, flush=True)
        user = await self.get_user_from_scope(self.scope)
        print(f"User id desconnet=--=--=-=-=-=-=-=--=--==-=-=-=->: {user.id}", flush=True)
        await self.remove_player_from_tournament(user.id)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.close()
        # await self.remove_all_players()
        # await self.delete_all_matches()
        # self.matchs.clear()
        # self.waiting_players_data.clear()
        # self.tournamen_data['first_round'].clear()
        # self.player_channels.clear()
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        command = data.get('command')
        if command == "join":
            print('about to join match ========================', flush=True)
            user = await self.get_user_from_scope(self.scope)
            if user.id not in self.waiting_players_data.keys():
                await self.join_match(user.id)
            elif self.matchs.__len__() > 0:
                print("#####################Player already in match", flush=True)
                await self.remove_player_from_tournament(user.id, online=True)
                await self.sent_participants_data()
                await self.sent_match_data(user.id)
            else:
                print("#####################Player exist and he is about to join match", flush=True)
                await self.remove_player_from_tournament(user.id, online=True)
                await self.sent_participants_data()
    ################# end websocket methods

    ################# match methods
                
    async def serialize_players_data(self, players):
        for player in players:
            if self.waiting_players_data.__len__() < 4:
                if player.id not in self.waiting_players_data.keys():
                    self.waiting_players_data[player.id] = "in_waiting"
                    player_data = {
                        'id': player.id,
                        'username': player.username,
                        'image': player.image,
                        'win': False,
                        'online': True
                    }
                    self.tournamen_data['first_round'].append(player_data)
            # elif self.waiting_players_data.__len__() >= 4 and player.id in self.waiting_players_data:
            #     self.waiting_players_data[player.id]['round'] = 'second_round'
            #     self.waiting_players_data[player.id]['winner'] = True

    async def join_match(self, player_id):
        user = await self.get_player_by_id(player_id)
        print(f"player id: {user.id}", flush=True)
        player, created = await database_sync_to_async(TournamentParticipant.objects.get_or_create)(player=user, id=user.id, username=user.username, image=user.profile_pic_url)

        await database_sync_to_async(player.save)()
        players = await self.get_all_players()

        await self.serialize_players_data(players)

        print('about to sent users data ========================', flush=True)
        await self.sent_participants_data()

        print(f'waiting players len +++++> {len(players)}', flush=True)
        if len(players) == 4:
            print(">>>>>>>>>>>>>>>>>>>>>>joined<<<<<<<<<<<<<<<<<<<<<<", flush=True)
            for i in range(0, len(players), 2):
                print(f'-------------------------------------->{i}', flush=True)
                match = await self.create_match(players[i], players[i+1])
                self.matchs[match.id] = match

                if players[i].id not in self.player_channels.keys() or players[i+1].id not in self.player_channels.keys():
                    print("Player not in channel", flush=True)
                    return

                await self.sent_match_data(players[i].id, players[i+1].id)
    @database_sync_to_async
    def create_match(self, player1, player2):
        print(f'player=0=id====>[{player1.id}]', flush=True)
        print(f'player=1=id====>[{player2.id}]', flush=True)

        p1 = User.objects.get(pk=player1.id)
        p2 = User.objects.get(pk=player2.id)
        return Match.objects.create(player1=p1, player2=p2, winner=p1)

    async def players_status_changed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'players_status_changed',
            'players_data': event['players_data']
        }))
    ################# end match methods
