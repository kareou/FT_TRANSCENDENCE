# Generated by Django 3.2.25 on 2024-08-27 13:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_auto_20240628_1141'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='status',
            field=models.CharField(default='pending', max_length=10),
        ),
    ]