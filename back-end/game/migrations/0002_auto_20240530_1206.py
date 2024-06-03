# Generated by Django 3.2.25 on 2024-05-30 12:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ft_auth', '0001_initial'),
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='player1',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player1', to='ft_auth.user'),
        ),
        migrations.AlterField(
            model_name='match',
            name='player2',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player2', to='ft_auth.user'),
        ),
        migrations.AlterField(
            model_name='match',
            name='winner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ft_auth.user'),
        ),
    ]
