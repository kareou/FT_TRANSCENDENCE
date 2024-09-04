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
		self.global_group_name = 'global_notification'

		await self.channel_layer.group_add(
			self.group_name,
			self.channel_name
		)
		await self.channel_layer.group_add(
			self.global_group_name,
			self.channel_name
		)
		await self.accept()
		await self.setOnlineTrue()

	async def disconnect(self, close_code):
		print("disconnected", flush=True)
		await self.channel_layer.group_discard(
			self.group_name,
			self.channel_name
		)
		await self.setOnlineFalse()
		if close_code == 3001:
			await self.channel_layer.group_send(
				self.global_group_name,{
				'type': 'status_update',
				'user_id': self.user_id
				}
			)
		await self.channel_layer.group_discard(
			self.global_group_name,
			self.channel_name
		)
		self.close()

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
		if notification_type != "game_invite" and notification_type != "remove_friend" and notification_type != "status_update" and notification_type != "tournament_match":
			try:
				receiver_obj = await database_sync_to_async(User.objects.get)(id=receiver)
				sender_obj = await database_sync_to_async(User.objects.get)(id=sender)
				await self.create_notification(message, notification_type, receiver_obj, sender_obj)
			except User.DoesNotExist:
				return
		if notification_type == "status_update":
			await self.channel_layer.group_send(
				self.global_group_name,{
				'type': 'status_update',
				'user_id': sender
				}
			)
		else:
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

	@database_sync_to_async
	def setOnlineTrue(self):
		try:
			user =	User.objects.get(id=self.user_id)
			user.online = True
			user.save()

		except User.DoesNotExist:
			return

	@database_sync_to_async
	def setOnlineFalse(self):
		try:
			user =	User.objects.get(id=self.user_id)
			user.online = False
			user.save()
		except User.DoesNotExist:
			return

	async def status_update(self, event):
		user_id = event['user_id']
		await self.send(text_data=json.dumps({
			'type': 'status_update',
			'user_id': user_id
		}))
