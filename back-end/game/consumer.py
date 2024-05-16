import json
from channels.generic.websocket import AsyncWebsocketConsumer

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
