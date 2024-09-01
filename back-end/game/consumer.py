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
from autobahn.exception import Disconnected
import asyncio

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
def updateGameScore(game_id, gameState, playerLeave=None):
    try:
        with transaction.atomic():
            game = get_object_or_404(Match, id=game_id)
            game.status = "end"
            game.player1_score = gameState.p1score
            game.player2_score = gameState.p2score
            if playerLeave:
                game.winner = game.player2 if playerLeave == game.player1 else game.player1
            else:
                game.winner = game.player1 if gameState.p1score > gameState.p2score else game.player2
            game.save()
            return game.winner
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

class GameState():
    def __init__(self):
        self.screen_width = 800
        self.screen_height = 600
        self.p1x = 40
        self.p1y = self.screen_height / 2 - 50
        self.p2x = self.screen_width - 50
        self.p2y = self.screen_height / 2 - 50
        self.ballx = self.screen_width / 2
        self.bally = self.screen_height / 2
        self.ballvx = 1
        self.ballvy = 1
        self.p1score = 0
        self.p2score = 0
        self.game_progress = "playing"

    def __json__(self):
        return {"p1": {"x": self.p1x, "y": self.p1y}, "p2": {"x": self.p2x, "y": self.p2y}, "ball": {"x": self.ballx, "y": self.bally}, "p1score": self.p1score, "p2score": self.p2score, "screen_width": self.screen_width, "screen_height": self.screen_height, "game_progress": self.game_progress}

    def __str__(self) -> str:
        return f"p1: {self.p1}, p2: {self.p2}, ball: {self.ball}"

    def __repr__(self) -> str:
        return f"p1: {self.p1}, p2: {self.p2}, ball: {self.ball}"

def MovePlayer(state, direction, player):
    if player == "player1":
        if direction == "up":
            state.p1y -= 10
        elif direction == "down":
            state.p1y += 10
        if state.p1y < 0:
            state.p1y = 0
        elif state.p1y > state.screen_height - 100:
            state.p1y = state.screen_height - 100
    elif player == "player2":
        if direction == "up":
            state.p2y -= 10
        elif direction == "down":
            state.p2y += 10
        if state.p2y < 0:
            state.p2y = 0
        elif state.p2y > state.screen_height - 100:
            state.p2y = state.screen_height - 100
    return state

def check_game_end(state):
    if state.p1score == 3:
        return "player1"
    elif state.p2score == 3:
        return "player2"
    return None

def update_game_state(state: GameState):
    state.ballx += state.ballvx
    state.bally += state.ballvy
    if state.bally <= 0 or state.bally >= state.screen_height:
        state.ballvy *= -1
    if state.ballx <= 0:
        state.p2score += 1
        state.ballx = state.screen_width / 2
        state.bally = state.screen_height / 2
        state.ballvx *= -1
        if check_game_end(state):
            state.game_progress = "end"
        else:
            state.game_progress = "pause"
    elif state.ballx >= state.screen_width:
        state.p1score += 1
        state.ballx = state.screen_width / 2
        state.bally = state.screen_height / 2
        state.ballvx *= -1
        if check_game_end(state):
            state.game_progress = "end"
        else:
            state.game_progress = "pause"
    if state.ballx <= 40 + 10 and state.p1y <= state.bally <= state.p1y + 100:
        state.ballvx *= -1
    if state.ballx >= state.screen_width - 40 - 10 and state.p2y <= state.bally <= state.p2y + 100:
        state.ballvx *= -1
    return state

@database_sync_to_async
def checkPlayerBelongsToGame(user, game_id):
    try:
        game = get_object_or_404(Match, id=game_id)
        if game.status == "end" or game.status == "ongoing":
            return False
        if game.player1 == user or game.player2 == user:
            return True
        return False
    except Exception as e:
        return False

@database_sync_to_async
def startGame(game_id):
    try:
        game = get_object_or_404(Match, id=game_id)
        game.status = "ongoing"
        game.save()
    except Exception as e:
        pass

class GameConsumer(AsyncWebsocketConsumer):

    # Static variable to keep track of the number of connections
    game_users_count = {}
    game_users_data = {}
    game_state_ = {}

    async def check_second_player_join(self):
        await asyncio.sleep(30)
        if GameConsumer.game_users_count[self.game_id] == 1:
            GameConsumer.game_state[self.game_id].game_progress = "end"
            winner = await updateGameScore(self.game_id, GameConsumer.game_state_[self.game_id])
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_end",
                    "winner": winner,
                }
            )
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_state",
                    "state": GameConsumer.game_state_[self.game_id].__json__()
                }
            )

    async def connect(self):
        self.user,self.user_id = await GetUser(self.scope)
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        # Increment the connection count
        player_belongs_to_game = await checkPlayerBelongsToGame(self.user, self.game_id)
        if not player_belongs_to_game:
            return await self.close()
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
        if role == "player1":
            GameConsumer.game_state_[self.game_id] = GameState()
            asyncio.create_task(self.check_second_player_join())
        if GameConsumer.game_users_count[self.game_id] == 2:
            await startGame(self.game_id)
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_start",
                    "message": "Game is starting",
                    "users": GameConsumer.game_users_data[self.game_id]
                }
            )
            async def send_state():
                while GameConsumer.game_state_[self.game_id].game_progress != "end":
                    game_state = GameConsumer.game_state_[self.game_id]
                    game_state = update_game_state(game_state)
                    GameConsumer.game_state_[self.game_id] = game_state

                    try:
                        await self.channel_layer.group_send(
                            self.game_id,
                            {
                                "type": "game_state",
                                "state": GameConsumer.game_state_[self.game_id].__json__()
                            }
                        )
                    except Disconnected as e:
                        print("User Disconnected", flush=True)
                    if GameConsumer.game_state_[self.game_id].game_progress == "pause":
                        await asyncio.sleep(3)  # Sleep for 3 seconds
                        GameConsumer.game_state_[self.game_id].game_progress = "playing"
                    elif GameConsumer.game_state_[self.game_id].game_progress == "end":
                        await self.handleGmaeEnd()
                    else:
                        await asyncio.sleep(0.0016)

                if GameConsumer.game_state_[self.game_id].game_progress == "end":
                    try:
                        await self.send_state_task.cancel()
                    except Exception as e:
                        print("Task already cancelled or Finished", flush=True)
            await asyncio.sleep(1)
            self.send_state_task = asyncio.create_task(send_state())

    @database_sync_to_async
    def GameEnded(self):
        try:
            game = get_object_or_404(Match, id=self.game_id)
            if game.status == "end":
                return True
            return False
        except Exception as e:
            return False

    async def disconnect(self, close_code):
        try:
            GameConsumer.game_users_count[self.game_id] -= 1
            await self.channel_layer.group_discard(
                self.game_id,
                self.channel_name
            )
            await self.close()
        except Exception as e:
            pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        direction = text_data_json.get("direction")
        sender = text_data_json.get("sender")
        new_game_state = GameConsumer.game_state_[self.game_id]
        new_game_state = MovePlayer(new_game_state, direction, sender)
        await self.channel_layer.group_send(
            self.game_id,
            {
                "type": "game_state",
                "state": new_game_state.__json__()
            }
        )



    async def game_state(self, event):
        state = event["state"]

        state["p1"]["x"] = state["p1"]["x"] / state["screen_width"]
        state["p1"]["y"] = state["p1"]["y"] / state["screen_height"]
        state["p2"]["x"] = state["p2"]["x"] / state["screen_width"]
        state["p2"]["y"] = state["p2"]["y"] / state["screen_height"]
        state["ball"]["x"] = state["ball"]["x"] / state["screen_width"]
        state["ball"]["y"] = state["ball"]["y"] / state["screen_height"]
        await self.send(text_data=json.dumps({"state": state}))

    async def handleGmaeEnd(self):
        winner = await updateGameScore(self.game_id, GameConsumer.game_state_[self.game_id])
        await updateUserStats(GameConsumer.game_users_data[self.game_id][0]["player1"], winner, GameConsumer.game_state_[self.game_id].p1score, GameConsumer.game_state_[self.game_id].p2score)
        await updateUserStats(GameConsumer.game_users_data[self.game_id][1]["player2"], winner, GameConsumer.game_state_[self.game_id].p2score, GameConsumer.game_state_[self.game_id].p1score)

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

