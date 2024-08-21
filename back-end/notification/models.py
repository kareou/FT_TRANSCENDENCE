from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

# Create your models here.

class NotificationType(models.TextChoices):
    MESSAGE = 'MSG', _('Message')
    TOURNAMENT = 'TRN', _('Tournament')
    FRIEND_ALERT = 'FRQ', _('Friend Request')

class Notification(models.Model):
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=3, choices=NotificationType.choices, default=NotificationType.MESSAGE)
    read = models.BooleanField(default=False)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sender', default=1)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='receiver', default=1)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.message
