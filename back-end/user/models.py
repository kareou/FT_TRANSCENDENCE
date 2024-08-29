from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from typing import Iterable
from io import BytesIO
import requests

class UserManager(BaseUserManager):
    def create_user(self, email, username, full_name='', password=None, profile_pic_url=None):
        if not email:
            raise ValueError('User must have an email address')
        if not username:
            raise ValueError('User must have a username')
        user = self.model(
            email=self.normalize_email(email),
            username=username,
            full_name=full_name,
            profile_pic_url=profile_pic_url
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    email = models.EmailField(verbose_name='email', max_length=60, unique=True)
    username = models.CharField(max_length=30, unique=True, default='')
    full_name = models.CharField(max_length=60, default='')
    profile_pic_url = models.URLField(default=None, null=True)
    profile_pic = models.ImageField(upload_to='users_pfp/', default=None)
    level = models.IntegerField(default=1)
    exp = models.IntegerField(default=0)
    online = models.BooleanField(default=False) 
    is_email_verified = models.BooleanField(default=False)
    _2fa_enabled = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.profile_pic:
            if not self.profile_pic_url:
                self.profile_pic_url = f'https://api.dicebear.com/8.x/bottts-neutral/svg?seed={self.username}'
                response = requests.get(self.profile_pic_url)
                if response.status_code == 200:
                    self.profile_pic.save(f'{self.username}.svg', BytesIO(response.content), save=False)
                    self.profile_pic.name = f'users_pfp/{self.username}.svg'
            else:
                response = requests.get(self.profile_pic_url)
                if response.status_code == 200:
                    self.profile_pic.save(f'{self.username}.jpg', BytesIO(response.content), save=False)
                    self.profile_pic.name = f'users_pfp/{self.username}.jpg'
    
        if self.exp >= 100:
            self.level += 1
            self.exp = 0
        super().save(*args, **kwargs)
        if not Stats.objects.filter(user=self).exists():
            Stats.objects.create(user=self)

    def __str__(self):
        return self.username

class Stats(models.Model):
    matche_played = models.IntegerField(default=0)
    matche_won = models.IntegerField(default=0)
    matche_lost = models.IntegerField(default=0)
    matche_draw = models.IntegerField(default=0)
    goals_scored = models.IntegerField(default=0)
    goals_conceded = models.IntegerField(default=0)
    goals_difference = models.IntegerField(default=0)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return self.matche_played

    def save(self, *args, **kwargs):
        self.goals_difference = self.goals_scored - self.goals_conceded
        super().save(*args, **kwargs)