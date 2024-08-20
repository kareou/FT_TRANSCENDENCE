import json
from channels.generic.websocket import AsyncWebsocketConsumer
import random
from rest_framework_simplejwt.tokens import UntypedToken
from user.models import User
from user.serializers import UserSerializer
from django.shortcuts import get_object_or_404
from channels.db import database_sync_to_async
from user.models import Stats
from user.serializers import StatsSerializer
from django.db import transaction
from .models import Match

@database_sync_to_async
def GetUser(scope):
    token = scope["cookies"].get("access")
    try:
        validated_token = UntypedToken(token)
        user_id = validated_token["user_id"]
        user = get_object_or_404(User, id=user_id)
        return (user, user_id)
    except Exception as e:
        return (None, None)

@database_sync_to_async
def updateGameScore(game_id, player1_score = None, player2_score = None, player1 = None, player2 = None, winner = None):
    try:
        with transaction.atomic():
            game = get_object_or_404(Match, id=game_id)
            if player1_score is not None:
                game.player1_score += player1_score
            if player2_score is not None:
                game.player2_score += player2_score
            if game.player1_score == 3:
                winner = player1
            elif game.player2_score == 3:
                winner = player2
            if winner is not None:
                game.winner = winner
            game.save()
            print(winner, flush=True)
            return winner
    except Exception as e:
        return None

@database_sync_to_async
def updateUserStats(user, winner, goals_scored, goals_conceded):
    try:
        with transaction.atomic():
            stats = get_object_or_404(Stats, user_id=user)
            stats.goals_scored += goals_scored
            stats.goals_conceded += goals_conceded
            if winner is not None:
                stats.matche_played += 1
                if user == winner:
                    stats.matche_won += 1
                    user.exp += 10
                else:
                    stats.matche_lost += 1
                    user.exp += 5
                user.save()
            stats.save()

    except Exception as e:
        pass

class GameConsumer(AsyncWebsocketConsumer):

    # Static variable to keep track of the number of connections
    game_users_count = {}
    game_users_data = {}

    async def connect(self):
        self.user,self.user_id = await GetUser(self.scope)
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]

        # Increment the connection count
        if self.game_id in GameConsumer.game_users_count and GameConsumer.game_users_count[self.game_id] >= 2:
            return
        if self.game_id not in GameConsumer.game_users_data:
            GameConsumer.game_users_data[self.game_id] = []
        if self.game_id in GameConsumer.game_users_count:
            GameConsumer.game_users_count[self.game_id] += 1
        else:
            GameConsumer.game_users_count[self.game_id] = 1
        role = "player1" if GameConsumer.game_users_count[self.game_id] == 1 else "player2"
        GameConsumer.game_users_data[self.game_id].append({role: self.user})
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
                    "message": "Game is starting",
                    "users": GameConsumer.game_users_data[self.game_id]
                }
            )

    async def disconnect(self, close_code):
        GameConsumer.game_users_count[self.game_id] -= 1
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )
        if close_code != 3000:
            opponent = GameConsumer.game_users_data[self.game_id][0]["player1"] if self.user == GameConsumer.game_users_data[self.game_id][1]["player2"] else GameConsumer.game_users_data[self.game_id][1]["player2"]
            await updateGameScore(game_id=self.game_id, winner=opponent)
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_end",
                    "winner": opponent,
                }
            )
        await self.close()


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        try:
            state = text_data_json["state"]
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_state",
                    "state": state,
                }
            )
        except:
            pass
        try:
            ball = text_data_json["ball"]
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_state",
                    "ball": ball,
                }
            )
        except:
            pass
        try:
            score = text_data_json["score"]
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_state",
                    "score": score,
                }
            )
        except:
            pass


    async def game_state(self, event):
        try:
            state = event["state"]
            await self.send(text_data=json.dumps({"state": state}))
        except:
            pass

        try:
            ball = event["ball"]
            await self.send(text_data=json.dumps({"ball": ball}))
        except:
            pass

        try:
            score = event["score"]
            await self.send(text_data=json.dumps({"score": score}))
            await self.checkGameEnd(event)
        except:
            pass

    async def checkGameEnd(self, event):
        p1 = GameConsumer.game_users_data[self.game_id][0]["player1"]
        p2 = GameConsumer.game_users_data[self.game_id][1]["player2"]
        winner = None
        if self.user == GameConsumer.game_users_data[self.game_id][0]["player1"]:
            winner = await updateGameScore(self.game_id, event["score"]["p1"], event["score"]["p2"], p1, p2, None)
            await updateUserStats(p2, winner, event["score"]["p2"], event["score"]["p1"])
            await updateUserStats(p1, winner, event["score"]["p1"], event["score"]["p2"])
        if winner is not None:
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_end",
                    "winner": winner,
                }
            )

    async def game_end(self, event):
        winner = event["winner"]
        await self.send(text_data=json.dumps({"winner": UserSerializer(winner).data}))
        await self.close()

    async def game_start(self, event):
        message = event["message"]
        users = event["users"]
        await self.send(text_data=json.dumps({"message": message, "users": {"player1": UserSerializer(users[0]["player1"]).data, "player2": UserSerializer(users[1]["player2"]).data}}))




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
            # game_id = f"player1_{player1}_player2_{player2}_game_{game_id}"
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
        del MatchMakingConsumer.player_conections[self.user_id]
        await self.close()

    async def receive(self, text_data):
        pass

    async def match_request(self, event):
        player2 = event["player2"]
        game_id = event["game_id"]
        await self.send(text_data=json.dumps({"player2": UserSerializer(player2).data, "game_id": game_id}))

