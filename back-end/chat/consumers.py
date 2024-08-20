import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Conversation, ChatMessage
from django.db.models import Q

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(f"Connecting .......")
        self.user_id = int(self.scope['url_route']['kwargs']['user_id'])
        self.receiver_id = int(self.scope['url_route']['kwargs']['receiver_id'])
        self.room_name = f"private_chat_{min(self.user_id, self.receiver_id)}_{max(self.user_id, self.receiver_id)}"
        self.room_group_name = f"chat_{self.room_name}"
        
        print(f"Chat group name = {self.room_group_name}")
        print(f"User ID: {self.user_id}, Receiver ID: {self.receiver_id}")


        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print(f"WebSocket connection established for {self.channel_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket connection closed for {self.channel_name}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            sender = text_data_json['sender']
            print(f"Received message: {message}")

            if int(sender) not in [self.user_id, self.receiver_id]:
                print(f"User {sender} is not part of the conversation.")
                await self.send(text_data=json.dumps({
                    'error': 'User not part of the conversation'
                }))
                return

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'sender': sender,
                    'message': message
                }
            )
        except json.JSONDecodeError:
            print("Received non-JSON message or empty message:", text_data)
            await self.send(text_data=json.dumps({
                'error': 'Invalid message format'
            }))

    async def send_message(self, event):
        message = event['message']
        sender = event['sender']
        print(f"Sending message to WebSocket: {message}")

        if int(sender) not in [self.user_id, self.receiver_id]:
            print(f"User {sender} is not part of the conversation.")
            await self.send(text_data=json.dumps({
                'error': 'User not part of the conversation'
            }))
            return

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))