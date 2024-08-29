from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from .models import Notification
from .serializer import NotificationSerializer
from user.models import User
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user_id = self.scope['url_route']['kwargs']['user_id']
		self.group_name = 'notification_%s' % self.user_id

		await self.channel_layer.group_add(
			self.group_name,
			self.channel_name
		)

		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.group_name,
			self.channel_name
		)

	@database_sync_to_async
	def create_notification(self, message, notification_type, receiver, sender):
		Notification.objects.create(
			message=message,
			type=notification_type,
			receiver=receiver,
			sender=sender
		)


	async def receive(self, text_data):
		notification = json.loads(text_data)
		message = notification['message'] or None
		notification_type = notification['type'] or None
		receiver = notification['receiver'] or None
		sender = notification['sender'] or None
		self.group_name = f"notification_{receiver}"
		print(f"Notification: {notification}", flush=True)
		if notification_type != "game_invite" and notification_type != "remove_friend":
			try:
				receiver_obj = await database_sync_to_async(User.objects.get)(id=receiver)
				sender_obj = await database_sync_to_async(User.objects.get)(id=sender)
				await self.create_notification(message, notification_type, receiver_obj, sender_obj)
			except User.DoesNotExist:
				return
		await self.channel_layer.group_send(
			self.group_name,{
			'type': 'notification_message',
			'message': message,
			'notification_type': notification_type,
			'receiver': receiver
			}
		)

	async def notification_message(self, event):
		message = event['message']
		notification_type = event['notification_type']
		receiver = event['receiver']

		await self.send(text_data=json.dumps({
			'message': message,
			'type': notification_type,
			'receiver': receiver
		}))
