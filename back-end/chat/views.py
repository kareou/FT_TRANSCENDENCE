from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Max, Case, When
from .serializers import ConversationSerializer, ChatMessageSerializer
from .models import Conversation, ChatMessage
from user.models import User
from django.contrib.auth import get_user_model
from user.serializers import UserSerializer
from django.db import models
from django.contrib.auth.decorators import login_required
User = get_user_model()
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from friends.models import FriendList

class UserConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'], url_path='fetch_or_create')
    def fetch_or_create_conversation(self, request):
        sender_id = request.data.get('sender')
        receiver_id = request.data.get('receiver')

        if not sender_id or not receiver_id:
            return Response({"detail": "Missing sender or receiver", "case": "missing_data"}, status=status.HTTP_400_BAD_REQUEST)

        conversation = Conversation.objects.filter(
            (Q(sender_id=sender_id) & Q(receiver_id=receiver_id)) |
            (Q(sender_id=receiver_id) & Q(receiver_id=sender_id))
        ).first()

        try:
            sender = User.objects.get(pk=sender_id)
            receiver = User.objects.get(pk=receiver_id)
        except ObjectDoesNotExist:
            return Response({"detail": "One of the users does not exist", "case": "user_not_found"}, status=status.HTTP_400_BAD_REQUEST)

        if conversation:       
            if FriendList.objects.filter(
                (Q(user1=receiver, user2=sender, user1_blocked_user2=True) |
                Q(user1=sender, user2=receiver, user2_blocked_user1=True))
            ).exists():
                return Response({"detail": "You are blocked by this user", "case": "receiver_blocked_sender", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)
            if FriendList.objects.filter(
                (Q(user1=sender, user2=receiver, user1_blocked_user2=True) |
                Q(user1=receiver, user2=sender, user2_blocked_user1=True))
            ).exists():
                return Response({"detail": "You have blocked this user", "case": "sender_blocked_receiver", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)

        if not conversation:
            conversation = Conversation.objects.create(sender_id=sender_id, receiver_id=receiver_id)
            return Response({"detail": "Conversation created", "case": "conversation_created", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_201_CREATED)

        return Response({"detail": "Conversation fetched", "case": "conversation_fetched", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)




class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def fetch_messages(self, request):
        conversation_id = request.query_params.get('conversation_id')

        if not conversation_id:
            return Response({"detail": "Conversation ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        messages = ChatMessage.objects.filter(conversation_id=conversation_id).order_by('timestamp')
        return Response(ChatMessageSerializer(messages, many=True).data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        try:
            user = self.request.user
            if user is not None:
                conversations = Conversation.objects.filter(
                    Q(sender=user) | Q(receiver=user)
                ).order_by('-last_message_time')

                ordered_user_ids = []
                for conversation in conversations:
                    if conversation.sender.id != user.id:
                        ordered_user_ids.append(conversation.sender.id)
                    if conversation.receiver.id != user.id:
                        ordered_user_ids.append(conversation.receiver.id)

                preserved_order = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(ordered_user_ids)])

                active_users = User.objects.filter(id__in=ordered_user_ids).order_by(preserved_order)

                return active_users
        except Exception as e:
            pass

