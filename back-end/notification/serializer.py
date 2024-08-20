from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

    extra_kwargs = {
        'read': {'required': False},
        'receiver': {'required': False},
        'type': {'required': False},
        'data': {'required': False},
    }
