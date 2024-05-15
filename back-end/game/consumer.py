import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    # Static variable to keep track of the number of connections
    game_users_count = {}

    async def connect(self):
        self.user = self.scope["user"]
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]

        # Increment the connection count
        if self.game_id in GameConsumer.game_users_count and GameConsumer.game_users_count[self.game_id] >= 2:
            return

        print(GameConsumer.game_users_count)
        if self.game_id in GameConsumer.game_users_count:
            GameConsumer.game_users_count[self.game_id] += 1
        else:
            GameConsumer.game_users_count[self.game_id] = 1
        print(GameConsumer.game_users_count)
        # self.connection_count += 1
        # Assign roles based on the connection count
        role = "player1" if GameConsumer.game_users_count[self.game_id] == 1 else "player2"
        # role = "player1" if self.connection_count == 1 else "player2"
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )
        await self.accept()
        await self.send(text_data=json.dumps({"role": role, "game_id": self.channel_name}))
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
        # if self.game_id in GameConsumer.game_users_count:
        #     GameConsumer.game_users_count[self.game_id] -= 1

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        move = text_data_json["move"]
        
        await self.channel_layer.group_send(
            self.game_id,
            {
                "type": "game_move",
                "move": move,
                "sender": self.channel_name
            }
        )

    async def game_move(self, event):
        move = event["move"]
        sender = event["sender"]

        await self.send(text_data=json.dumps({"move": move, "sender": sender}))
    
    async def game_start(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))