from django.db import models
from django.conf import settings


class FriendList(models.Model):
    """Model for friend list"""
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user2')
    are_friends = models.BooleanField(default=False)

    user1_blocked_user2 = models.BooleanField(default=False)
    user2_blocked_user1 = models.BooleanField(default=False)

    user1_invited_user2 = models.BooleanField(default=False)
    user2_invited_user1 = models.BooleanField(default=False)

    def __str__(self):
        return self.user1.username