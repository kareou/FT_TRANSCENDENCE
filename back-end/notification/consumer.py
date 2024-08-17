from channels.generic.websocket import AsyncWebsocketConsumer
import json

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

	async def receive(self, text_data):
		notification = json.loads(text_data)
		message = notification['message'] or None
		notification_type = notification['type'] or None
		receiver = notification['receiver'] or None
		print(receiver, flush=True)
		self.group_name = f"notification_{receiver}"

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
