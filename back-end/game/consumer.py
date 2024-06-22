import json
from channels.generic.websocket import AsyncWebsocketConsumer
import random
from rest_framework_simplejwt.tokens import UntypedToken
from ft_auth.models import User
from ft_auth.serializer import UserSerializer
from django.shortcuts import get_object_or_404
from channels.db import database_sync_to_async
from .models import Match

@database_sync_to_async
def GetUser(scope):
    token = scope["cookies"].get("access_token")
    try:
        validated_token = UntypedToken(token)
        user_id = validated_token["user_id"]
        user = get_object_or_404(User, id=user_id)
        return (user, user_id)
    except Exception as e:
        return None

class GameConsumer(AsyncWebsocketConsumer):

    # Static variable to keep track of the number of connections
    game_users_count = {}

    async def connect(self):
        self.user = self.scope["user"]
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]

        # Increment the connection count
        if self.game_id in GameConsumer.game_users_count and GameConsumer.game_users_count[self.game_id] >= 2:
            return

        if self.game_id in GameConsumer.game_users_count:
            GameConsumer.game_users_count[self.game_id] += 1
        else:
            GameConsumer.game_users_count[self.game_id] = 1
        role = "player1" if GameConsumer.game_users_count[self.game_id] == 1 else "player2"
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )
        await self.accept()
        await self.send(text_data=json.dumps({"role": role}))
        if GameConsumer.game_users_count[self.game_id] == 2:
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_start",
                    "message": "Game is starting"
                }
            )

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        try:
            data = text_data_json["data"]
        except:
            data = None
        try:
            ball = text_data_json["ball"]
        except:
            ball = None
        
        if data is not None:
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_state",
                    "data": data,
                }
            )
        elif ball is not None:
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_state",
                    "ball": ball,
                }
            )

    async def game_state(self, event):
        if "data" in event:
            data = event["data"]
            await self.send(text_data=json.dumps({"data": data}))
        elif "ball" in event:
            ball = event["ball"]
            await self.send(text_data=json.dumps({"ball": ball}))


    async def game_start(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))



@database_sync_to_async
def generateGameId(user1, user2):
    game = Match.objects.create(player1=user1, player2=user2, player1_score=0, player2_score=0, winner=user1)
    return game.id

@database_sync_to_async
def deleteGame(game_id):
    print(game_id, flush=True)
    try:
        game = get_object_or_404(Match, id=game_id)
        game.delete()
    except Exception as e:
        pass

class MatchMakingConsumer(AsyncWebsocketConsumer):
    player_conections = {}
    player_peered = {}

    async def connect(self):
        self.user, self.user_id = await GetUser(self.scope)
        await self.accept()
        MatchMakingConsumer.player_conections[self.user_id] = (self.channel_name, self.user)
        if len(MatchMakingConsumer.player_conections) >= 2:
            player1 = random.choice(list(MatchMakingConsumer.player_conections.keys()))
            player2 = random.choice(list(MatchMakingConsumer.player_conections.keys()))
            while player1 == player2:
                player2 = random.choice(list(MatchMakingConsumer.player_conections.keys()))
            player1_data = MatchMakingConsumer.player_conections[player1]
            player2_data = MatchMakingConsumer.player_conections[player2]
            game_id = await generateGameId(player1_data[1], player2_data[1])
            MatchMakingConsumer.player_peered[player1] = (player2, game_id)
            MatchMakingConsumer.player_peered[player2] = (player1, game_id)
            game_id = f"player1_{player1}_player2_{player2}_game_{game_id}"
            await self.channel_layer.send(
                player1_data[0],
                {
                    "type": "match_request",
                    "player2": player2_data[1],
                    "game_id": game_id,
                }
            )
            await self.channel_layer.send(
                player2_data[0],
                {
                    "type": "match_request",
                    "player2": player1_data[1],
                    "game_id": game_id,
                }
            )


    async def disconnect(self, close_code):
        print(close_code, flush=True)
        if close_code != 3000:
            if self.user_id in MatchMakingConsumer.player_peered:
                opponent = MatchMakingConsumer.player_peered[self.user_id][0]
                game_id = MatchMakingConsumer.player_peered[self.user_id][1]
                await self.channel_layer.send(
                    MatchMakingConsumer.player_conections[opponent][0],
                    {
                        "type": "match_request",
                        "player2": None,
                        "game_id": None,
                    }
                )
                del MatchMakingConsumer.player_peered[self.user_id]
                del MatchMakingConsumer.player_peered[opponent]
                await deleteGame(game_id)
        if self.user_id in MatchMakingConsumer.player_conections:
            del MatchMakingConsumer.player_conections[self.user_id]
        self.close()

    async def receive(self, text_data):
        pass

    async def match_request(self, event):
        player2 = event["player2"]
        game_id = event["game_id"]
        await self.send(text_data=json.dumps({"player2": UserSerializer(player2).data, "game_id": game_id}))

