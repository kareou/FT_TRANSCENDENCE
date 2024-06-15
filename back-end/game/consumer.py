import json
from channels.generic.websocket import AsyncWebsocketConsumer
import random

class GameConsumer(AsyncWebsocketConsumer):

    # Static variable to keep track of the number of connections
    default_start_state = {
        "player1": {
            "y": 400,
            "score": 0,
        },
        "player2": {
            "y": 400,
            "score": 0,
        },
        "ball": {
            "x": 4,
            "y": 4,
            "dx": 1,
            "dy": 1,
        },
    }
    game_users_count = {}
    game_rooms_state = {}

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
        await self.send(text_data=json.dumps({"role": role, "game_id": self.game_id}))
        if GameConsumer.game_users_count[self.game_id] == 2:
            GameConsumer.game_rooms_state[self.game_id] = GameConsumer.default_start_state
            await self.channel_layer.group_send(
                self.game_id,
                {
                    "type": "game_start",
                    "message": "Game is starting"
                }
            )

    async def disconnect(self, close_code):
        pass
        # if self.game_id in GameConsumer.game_users_count:
        #     GameConsumer.game_users_count[self.game_id] -= 1

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        state = text_data_json["state"]
        game_id = text_data_json["game_id"]
        await self.channel_layer.group_send(
            self.game_id,
            {
                "type": "game_state",
                "state": state,
                "game_id": game_id,
            }
        )

    async def game_state(self, event):
        state = event["state"]
        game_id = event["game_id"]

        # Initialize the game room state if it doesn't exist yet
        if game_id not in GameConsumer.game_rooms_state:
            GameConsumer.game_rooms_state[game_id] = GameConsumer.default_start_state.copy()

        state = self.handle_state_merge(GameConsumer.game_rooms_state[game_id], state)
        await self.send(text_data=json.dumps({"state": state}))


    async def game_start(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))

    def handle_state_merge(self,state1, state2):
        for key in state2:
            if key in state1:
                if isinstance(state2[key], dict):
                    self.handle_state_merge(state1[key], state2[key])
                else:
                    state1[key] = state2[key]
        return state1


class MatchMakingConsumer(AsyncWebsocketConsumer):
    player_conections = {}

    async def connect(self):
        # self.user = self.scope["request"].user
        print(self.scope,flush=True)
        await self.accept()
        # MatchMakingConsumer.player_conections[self.user.username] = self.channel_name
        # if len(MatchMakingConsumer.player_conections) >= 2:
        #     player1, player2 = random.sample(MatchMakingConsumer.player_conections.keys(), 2)
        #     player1_channel = MatchMakingConsumer.player_conections.pop(player1)
        #     player2_channel = MatchMakingConsumer.player_conections.pop(player2)
        #     await self.channel_layer.send(
        #         player1_channel,
        #         {
        #             "type": "match_request",
        #             "player2": player2,
        #         }
        #     )
        #     await self.channel_layer.send(
        #         player2_channel,
        #         {
        #             "type": "match_request",
        #             "player2": player1,
        #         }
        #     )

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        player2 = text_data_json["player2"]
        player2_channel = MatchMakingConsumer.player_conections[player2]
        await self.channel_layer.send(
            player2_channel,
            {
                "type": "match_request",
                "player1": self.user.username,
            }
        )

    async def match_request(self, event):
        player1 = event["player1"]
        await self.send(text_data=json.dumps({"player1": player1}))
