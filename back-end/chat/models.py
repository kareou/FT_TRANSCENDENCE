
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Conversation(models.Model):
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='conv_starter')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='conv_participant')

    def __str__(self):
        return str(self.id)

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp',]

    def __str__(self):
        return self.content