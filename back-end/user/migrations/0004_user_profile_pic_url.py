# Generated by Django 3.2.25 on 2024-08-15 16:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0003_auto_20240716_0844'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='profile_pic_url',
            field=models.URLField(default=None),
        ),
    ]
