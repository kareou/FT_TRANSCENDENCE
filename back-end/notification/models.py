from django.db import models
from user.models import User

# Create your models here.
class Notification(models.Model):
    NOTIFICATION_TYPE = (
        ('FR', 'Friend Request'),
        ('GI', 'game Invite'),
        ('ME', 'Message'),
	)
    NOTIFICATION_STATUS = (
		('U', 'Unread'),
		('R', 'Read'),
	)

    message = models.CharField(max_length=255)
    type = models.CharField(max_length=255, choices=NOTIFICATION_TYPE)
    status = models.CharField(max_length=255, choices=NOTIFICATION_STATUS)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.message
