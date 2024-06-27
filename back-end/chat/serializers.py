from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatMessage

User = get_user_model()

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'receiver', 'message', 'timestamp']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ConversationSerializer(serializers.Serializer):
    user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    def get_user(self, obj):
        user = obj['user']
        return UserSerializer(user).data

    def get_last_message(self, obj):
        last_message = obj['last_message']
        return ChatMessageSerializer(last_message).data
