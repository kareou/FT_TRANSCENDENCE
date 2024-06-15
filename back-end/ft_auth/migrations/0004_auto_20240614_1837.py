# Generated by Django 3.2.25 on 2024-06-14 18:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
        ('ft_auth', '0003_auto_20240611_1055'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='stats',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='user.stats'),
        ),
        migrations.AlterField(
            model_name='user',
            name='profile_pic',
            field=models.ImageField(default=None, upload_to='users_pfp/'),
        ),
    ]
