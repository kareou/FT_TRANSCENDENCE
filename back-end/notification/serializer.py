from rest_framework import serializers
from .models import Notification
from user.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

    # extra_kwargs = {
    #     'read': {'required': False},
    #     'receiver': {'required': False},
    #     'sender': {'required': False},
    #     'type': {'required': False},
    #     'data': {'required': False},
    # }

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['sender'] = UserSerializer(instance.sender).data
        response['receiver'] = UserSerializer(instance.receiver).data
        return response
