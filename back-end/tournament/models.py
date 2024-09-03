from django.db import models
from django.conf import settings
from user.models import User
from game.models import Match

class TournamentParticipant(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE, default=None)
    id = models.IntegerField(primary_key=True, default=0)
    username = models.CharField(max_length=100, default='')
    image = models.CharField(max_length=100, default='')
