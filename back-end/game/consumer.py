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


class LobbyConsumer(AsyncWebsocketConsumer):

    game_data = {}
    lobby_count = {}
    def merge_dict(self,dict1, dict2):
        res = {**dict1, **dict2}
        return res
    async def connect(self):
        self.user = self.scope["user"]
        self.lobby_id = self.scope["url_route"]["kwargs"]["lobby_id"]
        if self.lobby_id in LobbyConsumer.lobby_count and LobbyConsumer.lobby_count[self.lobby_id] >= 2:
            return

        if self.lobby_id in LobbyConsumer.lobby_count:
            LobbyConsumer.lobby_count[self.lobby_id] += 1
        else:
            LobbyConsumer.lobby_count[self.lobby_id] = 1

        role = "player1" if LobbyConsumer.lobby_count[self.lobby_id] == 1 else "player2"
        await self.channel_layer.group_add(
            self.lobby_id,
            self.channel_name
        )
        await self.accept()
        await self.send(text_data=json.dumps({"role": role}))

    async def disconnect(self, close_code):
        if self.lobby_id in LobbyConsumer.lobby_count:
            LobbyConsumer.lobby_count[self.lobby_id] -= 1

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if "game_data" in text_data_json:
            game_data = text_data_json["game_data"]
            if self.lobby_id in LobbyConsumer.game_data:
                LobbyConsumer.game_data[self.lobby_id] = self.merge_dict(LobbyConsumer.game_data[self.lobby_id], game_data)
            else:
                LobbyConsumer.game_data[self.lobby_id] = game_data
            print(LobbyConsumer.game_data[self.lobby_id])
            if len(LobbyConsumer.game_data[self.lobby_id]) == 2:
                await self.channel_layer.group_send(
                    self.lobby_id,
                    {
                        "type": "lobby_message",
                        "game_data": game_data
                    }
                )
        elif "start_game" in text_data_json:
            await self.channel_layer.group_send(
                self.lobby_id,
                {
                    "type": "start_game",
                    "game_data": text_data_json
                }
            )

    async def lobby_message(self, event):
        game_data = event["game_data"]
        await self.send(text_data=json.dumps({"game_data": game_data}))

    async def start_game(self, event):
        game_session = random.randint(1000, 9999)
        await self.send(text_data=json.dumps({"start_game": game_session}))
