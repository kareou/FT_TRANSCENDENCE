from django.db import models
from django.contrib.auth.models import BaseUserManager , AbstractBaseUser

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
    profile_pic = models.ImageField(upload_to='media/users/pfp', default='https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${username}')
    level = models.IntegerField(default=1)
    exp = models.IntegerField(default=0)

    objects = UserManagment()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username
