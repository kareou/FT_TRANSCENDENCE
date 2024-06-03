from django.db import models
from ft_auth.models import User

class Match(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="player1")
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="player2")
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    winner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self) -> str:
        return f"matche between ${self.player1} and ${self.player2}"
