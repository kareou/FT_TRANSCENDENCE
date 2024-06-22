from typing import Iterable
from django.db import models
from django.contrib.auth.models import BaseUserManager , AbstractBaseUser
from io import BytesIO
import requests

class UserManagment(BaseUserManager):
    def create_user(self, email, username=None, full_name='', password=None):
        if not email:
            raise ValueError('Email is required')
        if not username:
            raise ValueError('Username is required')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            full_name=full_name
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    full_name = models.CharField(max_length=255, default='')
    profile_pic = models.ImageField(upload_to='users_pfp/', default=None)
    level = models.IntegerField(default=1)
    exp = models.IntegerField(default=0)

    objects = UserManagment()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.profile_pic:
            url = f'https://api.dicebear.com/8.x/bottts-neutral/svg?seed={self.username}'
            response = requests.get(url)
            if response.status_code == 200:
                self.profile_pic.save(f'{self.username}.svg', BytesIO(response.content), save=False)
                self.profile_pic.name = f'users_pfp/{self.username}.svg'
        else:
            self.profile_pic.save(self.profile_pic.name, self.profile_pic, save=False)

        super().save(*args, **kwargs)
