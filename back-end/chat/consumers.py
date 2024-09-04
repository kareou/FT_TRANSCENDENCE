import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Conversation, ChatMessage
from django.db.models import Q

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        
        self.user_id = int(self.scope['url_route']['kwargs']['user_id'])
        self.receiver_id = int(self.scope['url_route']['kwargs']['receiver_id'])
        self.room_name = f"private_chat_{min(self.user_id, self.receiver_id)}_{max(self.user_id, self.receiver_id)}"
        self.room_group_name = f"chat_{self.room_name}"


        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            sender = text_data_json['sender']
            type = text_data_json['type']

            if int(sender) not in [self.user_id, self.receiver_id]:
                await self.send(text_data=json.dumps({
                    'error': 'User not part of the conversation'
                }))
                return
            
            if type == "message":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'send_message',
                        'sender': text_data_json['sender'],
                        'message': text_data_json['message'],
                        'timestamp': text_data_json['timestamp']
                    }
                )
                
            elif type == "block_notification":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'send_block_notification',
                        'sender': sender,
                        'blocker': text_data_json['blocker'],
                        'blocked': text_data_json['blocked']
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid message format'
            }))

    async def send_message(self, event):
        message= event['message'],
        sender= event['sender']

        if int(sender) not in [self.user_id, self.receiver_id]:
            await self.send(text_data=json.dumps({
                'error': 'User not part of the conversation'
            }))
            return

        await self.send(text_data=json.dumps({
            'type': 'message',
            'sender': event['sender'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def send_block_notification(self, event):
        sender= event['sender']

        if int(sender) not in [self.user_id, self.receiver_id]:
            await self.send(text_data=json.dumps({
                'error': 'User not part of the conversation'
            }))
            return

        await self.send(text_data=json.dumps({
            'type': 'block_notification',
            'sender': sender,
            'blocker': event['blocker'],
            'blocked': event['blocked']
        }))