from django.db import models
from user.models import User
from django.utils.translation import gettext_lazy as _

# Create your models here.

class NotificationType(models.TextChoices):
    MESSAGE = 'MSG', _('Message')
    TOURNAMENT = 'TRN', _('Tournament')
    PLAY_REQUEST = 'PRQ', _('Play Request')
    FRIEND_ALERT = 'FAL', _('Friend Alert')

class Notification(models.Model):
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=2, choices=NotificationType.choices, default=NotificationType.MESSAGE)
    status = models.booleanField(default=False)
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.message
