# Generated by Django 3.2.25 on 2024-06-11 10:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ft_auth', '0002_auto_20240607_1509'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='exp',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='level',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='user',
            name='profile_pic',
            field=models.ImageField(default=None, upload_to='media/users/pfp'),
        ),
    ]
