from django.db import models

class Match(models.Model):
    player1 = models.CharField(max_length=100)
    player2 = models.CharField(max_length=100)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    winner = models.CharField(max_length=100)
    created_at = models.DateField(auto_now_add=True)
