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
    participants_data = {}
    tournamen_data = {
        "first_round": [],
        "second_round": []
    }
    matchs = {}
    ####################################################################### TOOLS ##############################################################
    #################################### MATCH TOOLS ####################################
    @database_sync_to_async
    def get_all_matches(self):
        return list(Match.objects.all())
    
    @database_sync_to_async
    def create_match(self, player1, player2):
        match = Match.objects.create(player1=player1, player2=player2, winner=player1)
        match.save()
        return match

    async def delete_all_matches(self):
        try:
            matches = await self.get_all_matches()
            if matches is not None:
                for match in matches:
                    print(f"Match {match.id} removed.", flush=True)
                    await database_sync_to_async(match.delete)()
                return True
        except Match.DoesNotExist:
            return False
    
    async def save_match(self, player1, player2):
        print(f'player=0=id====>[{player1.id}]', flush=True)
        print(f'player=1=id====>[{player2.id}]', flush=True)

        p1 = await self.get_player_by_id(player1.id)
        p2 = await self.get_player_by_id(player2.id)
        return await self.create_match(p1, p2)

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
    #################################### PARTICIPANT TOOLS ##############################
    @database_sync_to_async
    def get_player_by_id(self, player_id):
        return User.objects.get(pk=player_id)
    
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
    def get_all_participants(self):
        return list(TournamentParticipant.objects.all())

    async def delete_all_participants(self):
        try:
            players = await self.get_all_participants()
            for player in players:
                await self.remove_player_from_participants(player)
            return True
        except TournamentParticipant.DoesNotExist:
            return False

    async def remove_player_from_participants(self, player):
        try:
            print(f"Player {player.id} removed.", flush=True)
            await database_sync_to_async(player.delete)()
            await self.disconnect(1800)
        except TournamentParticipant.DoesNotExist:
            print(f"Failed to remove player {player.id}.", flush=True)
            return False

    async def change_participant_status(self, user_id, online=False):
        for i in range(0, len(self.tournamen_data['first_round']), 1):
            if self.tournamen_data['first_round'][i]['id'] == user_id:
                if online == True:
                    self.tournamen_data['first_round'][i]['online'] = True
                    print(f"Player {user_id} back to the tournament.", flush=True)
                else:
                    self.tournamen_data['first_round'][i]['online'] = False
                    print(f"Player {user_id} removed from tournament.", flush=True)
                await self.sent_participants_data()
    
    async def sent_participants_data(self):
        print("about to sent users data 222222222222222", flush=True)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'players_status_changed',
                'players_data': self.tournamen_data
            }
        )
    
    async def serialize_players_data(self, player):
        self.participants_data[player.id] = "in_waiting"
        player_data = {
            'id': player.id,
            'username': player.username,
            'image': player.image,
            'win': False,
            'online': True
        }
        self.tournamen_data['first_round'].append(player_data)
            # elif self.participants_data.__len__() >= 4 and player.id in self.participants_data:
            #     self.participants_data[player.id]['round'] = 'second_round'
            #     self.participants_data[player.id]['winner'] = True
    
    async def players_status_changed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'players_status_changed',
            'players_data': event['players_data']
        }))
    ################################################################## WEBSOCKET METHODS ############################################################
    async def connect(self):
        # self.match_id = self.scope['url_route']['kwargs'].get('match_id')
        self.room_group_name = "tournament"
        user = await self.get_user_from_scope(self.scope)
        print(f"User id: {user.id}", flush=True)
        await self.accept()
        

    async def disconnect(self, code):
        print(code, flush=True)
        user = await self.get_user_from_scope(self.scope)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if code != 1800:
            if user.id in self.participants_data.keys() and code != 1800:
                await self.change_participant_status(user.id)
            print(f"User id desconnet=--=--=-=-=-=-=-=--=--==-=-=-=->: {user.id}", flush=True)
        await self.close()
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        command = data.get('command')
        if command == "join":
            user = await self.get_user_from_scope(self.scope)
            print(f'about to join match ========================{user.id}', flush=True)
            if self.matchs.__len__() > 0:
                print('turnament is full please wait...')
                await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            elif user.id in self.participants_data.keys():
                print("#####################Player exist and he is about to join match", flush=True)
                await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                await self.change_participant_status(user.id, online=True)
            elif user.id not in self.participants_data.keys():
                print("#####################Player not exist and he is about to join match", flush=True)
                await self.join_match(user.id)
            else:
                print('none of theas conditions :(', flush=True)
    ################################################################## MATCH METHODS ############################################################
    async def join_match(self, player_id):
            ###############collect player data################
        user = await self.get_player_by_id(player_id)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        self.player_channels[user.id] = self.channel_name
            ###############collect player data################
        print(f"========>player id: {user.id} joined", flush=True)
        player, created = await database_sync_to_async(TournamentParticipant.objects.get_or_create)(player=user, id=user.id, username=user.username, image=user.profile_pic_url)

        await database_sync_to_async(player.save)()
        players = await self.get_all_participants()

        await self.serialize_players_data(player)

        print('about to sent users data ========================', flush=True)
        await self.sent_participants_data()

        print(f'waiting players len +++++> {len(players)}', flush=True)
        if len(players) == 4:
            print(">>>>>>>>>>>>>>>>>>>>>>joined<<<<<<<<<<<<<<<<<<<<<<", flush=True)
            for i in range(0, len(players), 2):
                print(f'-------------------------------------->{i}', flush=True)
                match = await self.save_match(players[i], players[i+1])
                self.matchs[match.id] = match

                if players[i].id not in self.player_channels.keys() or players[i+1].id not in self.player_channels.keys():
                    print("Player not in channel", flush=True)
                    break

                await self.sent_match_data(players[i].id, players[i+1].id)
            ##################################clear data##################################
            print(">>>>>>>>>>>>>>>>>>>>>>clear data<<<<<<<<<<<<<<<<<<<<<<", flush=True)
            await self.delete_all_matches()
            await self.delete_all_participants()
            self.matchs.clear()
            self.participants_data.clear()
            self.tournamen_data['first_round'].clear()
            self.tournamen_data['second_round'].clear()
            self.player_channels.clear()
            ##################################clear data##################################
