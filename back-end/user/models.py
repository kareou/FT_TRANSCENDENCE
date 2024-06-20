from django.db import models
from django.conf import settings

# Create your models here.
class Stats(models.Model):
    matche_played = models.IntegerField(default=0)
    matche_won = models.IntegerField(default=0)
    matche_lost = models.IntegerField(default=0)
    matche_draw = models.IntegerField(default=0)
    goals_scored = models.IntegerField(default=0)
    goals_conceded = models.IntegerField(default=0)
    goals_difference = models.IntegerField(default=0)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return self.matche_played

    def save(self, *args, **kwargs):
        self.goals_difference = self.goals_scored - self.goals_conceded
        super().save(*args, **kwargs)
