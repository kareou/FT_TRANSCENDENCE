# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "chat_room"
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"WebSocket connection established for {self.channel_name}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket connection closed for {self.channel_name}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            print(f"Received message: {message}")

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        except json.JSONDecodeError:
            print("Received non-JSON message or empty message:", text_data)
            await self.send(text_data=json.dumps({
                'error': 'Invalid message format'
            }))

    async def chat_message(self, event):
        message = event['message']
        print(f"Sending message to WebSocket: {message}")

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
