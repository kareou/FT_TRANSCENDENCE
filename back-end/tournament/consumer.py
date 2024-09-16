from channels.generic.websocket import AsyncWebsocketConsumer
from .models import TournamentParticipant
from channels.db import database_sync_to_async
from game.models import Match
from user.models import User
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import UntypedToken
import asyncio
import json
import copy


class TournamentConsumer(AsyncWebsocketConsumer):
    tournament_max_participants = 4
    player_channels = {}
    participants_data = {}
    tournament_data = {
        "first_round": [],
        "second_round": []
    }
    old_tournament_data = {
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

    async def save_match(self, player1, player2):


        p1 = await self.get_player_by_id(player1.id)
        p2 = await self.get_player_by_id(player2.id)
        return await self.create_match(p1, p2)

    async def sent_match_data(self, user1_id, user2_id=None):
        for match in self.matchs.values():
            if user2_id is not None and user1_id == match.player1.id and user2_id == match.player2.id:
                await self.channel_layer.group_send(
                    f'notification_{match.player1.id}',
                    {
                        'type': 'notification_message',
                        'message': match.id,
                        'notification_type': "tournament_match",
                        'receiver': match.player1.id,
                        'sender': match.player1.id                    }
                )
                await self.channel_layer.group_send(
                    f'notification_{match.player2.id}',
                    {
                        'type': 'notification_message',
                        'message': match.id,
                        'notification_type': "tournament_match",
                        'receiver': match.player2.id,
                        'sender': match.player1.id                    }
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
                            'receiver': match.player1.id,
                            'sender': match.player1.id
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
                            'receiver': match.player2.id,
                            'sender': match.player1.id
                        }
                    )
                    return
                return
    #################################### PARTICIPANT TOOLS ##############################
    @database_sync_to_async
    def get_player_by_id(self, player_id):
        try:
            return User.objects.get(pk=player_id)
        except User.DoesNotExist:
            return None

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
            await database_sync_to_async(player.delete)()
            await self.disconnect(1800)
        except TournamentParticipant.DoesNotExist:
            return False

    async def change_participant_status(self, user_id, online=False):
        for i in range(0, len(self.tournament_data['first_round']), 1):
            if self.tournament_data['first_round'][i]['id'] == user_id:
                if online == True:
                    self.tournament_data['first_round'][i]['online'] = True
                else:
                    self.tournament_data['first_round'][i]['online'] = False

    async def sent_participants_data(self):
        for player in self.tournament_data['first_round']:
            await self.channel_layer.group_send(
                f'notification_{player["id"]}',
                {
                    'type': 'notification_message',
                    'message': self.tournament_data,
                    'notification_type': "players_status_changed",
                    'receiver': player["id"],
                    'sender': player["id"]
                }
            )

        self.old_tournament_data = copy.deepcopy(self.tournament_data)

    async def serialize_players_data(self, player):
        if self.tournament_max_participants == 2:
            player_data_second_round = {
                'id': player.id,
                'username': player.username,
                'image': player.image,
                'online': True,
                'win': False
            }
            self.tournament_data['second_round'].append(player_data_second_round)
        else:
            player_data_first_round = {
                'id': player.id,
                'username': player.username,
                'image': player.image,
                'online': True,
                'win': False
            }
            self.tournament_data['first_round'].append(player_data_first_round)
    ################################################################## WEBSOCKET METHODS ############################################################
    async def connect(self):
        self.room_group_name = "tournament"
        user = await self.get_user_from_scope(self.scope)
        if user is None:
            self.close()
            return
        if self.get_player_by_id(user.id) is None:
            self.close()
            return
        await self.accept()

    async def disconnect(self, code):
        try:
            user = await self.get_user_from_scope(self.scope)
            # await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            if code != 1800:
                if user and user.id in self.participants_data.keys() and code != 1800:
                    await self.change_participant_status(user.id)
        except Exception as e:
            print(f"Error in disconnect: {e}", flush=True)
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        command = data.get('command')
        if command == "join":
            user = await self.get_user_from_scope(self.scope)
            if self.matchs.__len__() > 0:
                pass
            elif user.id in self.participants_data.keys():
                await self.change_participant_status(user.id, online=True)
            elif user.id not in self.participants_data.keys():
                await self.join_match(user.id)
    ################################################################## MATCH METHODS ############################################################
    async def join_match(self, player_id):
        self.participants_data[player_id] = "is_waiting"
            ###############collect player data################
        user = await self.get_player_by_id(player_id)
        self.player_channels[user.id] = self.channel_name
        if len(self.player_channels) == 1:
            self.check_players_status__ = asyncio.create_task(self.check_for_players_status_changes())
            ###############collect player data################
        player, created = await database_sync_to_async(TournamentParticipant.objects.get_or_create)(player=user, id=user.id, username=user.username, image=user.profile_pic_url)

        await database_sync_to_async(player.save)()
        players = await self.get_all_participants()
        players = [p for p in players if p.id in self.participants_data.keys()]

        await self.serialize_players_data(player)
        if len(players) == self.tournament_max_participants:
            
            if self.tournament_max_participants == 1:
                for i in range(len(self.tournament_data['second_round'])):
                    if player.id == self.tournament_data['second_round'][i]['id']:
                        self.tournament_data['second_round'][i]['win'] = True
                await asyncio.sleep(3)
                try:
                    self.check_players_status__.cancel()
                    await self.check_players_status__
                except Exception as e:
                    print("Task already cancelled or Finished", flush=True)
                self.participants_data.clear()
                self.matchs.clear()
                self.tournament_data['second_round'].clear()
                self.tournament_data['first_round'].clear()
                self.player_channels.clear()
                await self.delete_all_participants()
                await self.disconnect(300)
                return
            self.matchs.clear()
            await asyncio.sleep(10)
            for i in range(0, len(players), 2):
                match = await self.save_match(players[i], players[i+1])
                self.matchs[match.id] = match

                if players[i].id not in self.player_channels.keys() or players[i+1].id not in self.player_channels.keys():
                    break
                await self.sent_match_data(players[i].id, players[i+1].id)
            self.tournament_max_participants //= 2
            try:
                self.send_state_task.cancel()
            except Exception as e:
                print("Task already cancelled or Finished", flush=True)
            self.update_match_status_task = asyncio.create_task(self.update_match_status())
            self.send_state_task = asyncio.create_task(self.check_match_status())
    ################################################################## background-tasks ############################################################
    async def check_match_status(self):
        end = False
        old_winner_id = None
        count = self.tournament_max_participants
        self.participants_data.clear()

        while not end:
            await asyncio.sleep(3)
            matchs = await self.get_all_matches()
            matchs = [match for match in matchs if match.id in self.matchs.keys()]
            for match in matchs:
                match_status = await database_sync_to_async(lambda: match.status)()
                if match_status == 'end':
                    winner = await database_sync_to_async(lambda: match.winner)()
                    if old_winner_id != winner.id:
                        old_winner_id = winner.id
                        if self.tournament_max_participants == 2:
                            for i in range(len(self.tournament_data['first_round'])):
                                if winner.id == self.tournament_data['first_round'][i]['id']:
                                    self.tournament_data['first_round'][i]['win'] = True
                        await self.join_match(winner.id)
                        count -= 1
                        if not count:
                            end = True
                            break

    async def check_for_players_status_changes(self):
        while True:
            try:
                await asyncio.sleep(2)
                if len(self.old_tournament_data['first_round']) != len(self.tournament_data['first_round']):
                    await self.sent_participants_data()
                else:
                    for i in range(0, len(self.tournament_data['first_round']), 1):
                        if self.old_tournament_data['first_round'][i]['online'] != self.tournament_data['first_round'][i]['online']:
                            await self.sent_participants_data()
                        if self.old_tournament_data['first_round'][i]['win'] != self.tournament_data['first_round'][i]['win']:
                            await self.sent_participants_data()
                if len(self.old_tournament_data['second_round']) != len(self.tournament_data['second_round']):
                    await self.sent_participants_data()
                else:
                    for i in range(0, len(self.tournament_data['second_round']), 1):
                        if self.old_tournament_data['second_round'][i]['online'] != self.tournament_data['second_round'][i]['online']:
                            await self.sent_participants_data()
                        if self.old_tournament_data['second_round'][i]['win'] != self.tournament_data['second_round'][i]['win']:
                            await self.sent_participants_data()
            except Exception as e:
                print(f"Error in check_for_players_status_changes: {e}", flush=True)
            if self.player_channels.__len__() == 0:
                break

    @database_sync_to_async
    def _update_match_status_(self, match_id):
        try:
            # Fetch the match object, raise 404 if not found
            match = get_object_or_404(Match, id=match_id)

            if match.status == 'pending':
                match.status = 'end'
                match.winner = match.player1
                match.save()
        except Exception as e:
            print(f"Error: {e}", flush=True)
            

    async def update_match_status(self):
        await asyncio.sleep(120)
        matchs = await self.get_all_matches()
        matchs = [match for match in matchs if match.id in self.matchs.keys()]
        try:
            for value in matchs:
                await self._update_match_status_(value.id)
        except Exception as e:
            print(f"An error occurred: {e}", flush=True)

