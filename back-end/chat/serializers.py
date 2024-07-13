from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatMessage, Conversation

class ChatMessageSerializer(serializers.ModelSerializer):
    conversation = serializers.PrimaryKeyRelatedField(queryset=Conversation.objects.all())

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'timestamp', 'conversation']

    def create(self, validated_data):
        return ChatMessage.objects.create(**validated_data)

class ConversationSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True, source='chatmessage_set')

    class Meta:
        model = Conversation
        fields = ['id', 'sender', 'receiver', 'last_message_time', 'messages']