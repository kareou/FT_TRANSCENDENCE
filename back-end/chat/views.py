from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Max, Case, When
from .serializers import ConversationSerializer, ChatMessageSerializer
from .models import Conversation, ChatMessage
from django.contrib.auth import get_user_model
from user.serializers import UserSerializer
from django.db import models

User = get_user_model()

class UserConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'], url_path='fetch_or_create')
    def fetch_or_create_conversation(self, request):
        sender_id = request.data.get('sender')
        receiver_id = request.data.get('receiver')

        if not sender_id or not receiver_id:
            return Response({"detail": "sender and receiver are required."}, status=status.HTTP_400_BAD_REQUEST)

        conversation = Conversation.objects.filter(
            (Q(sender_id=sender_id) & Q(receiver_id=receiver_id)) | 
            (Q(sender_id=receiver_id) & Q(receiver_id=sender_id))
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(sender_id=sender_id, receiver_id=receiver_id)

        return Response(ConversationSerializer(conversation).data, status=status.HTTP_200_OK)




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
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Get conversations where the logged-in user is either sender or receiver, ordered by last_message_time
        conversations = Conversation.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-last_message_time')

        # Maintain an ordered list of active user IDs based on the conversation order
        ordered_user_ids = []
        for conversation in conversations:
            if conversation.sender.id != user.id:
                ordered_user_ids.append(conversation.sender.id)
            if conversation.receiver.id != user.id:
                ordered_user_ids.append(conversation.receiver.id)

        # Use Django's `Case` and `When` to maintain the order
        preserved_order = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(ordered_user_ids)])

        # Queryset of users who have had conversations with the logged-in user, ordered by last_message_time
        active_users = User.objects.filter(id__in=ordered_user_ids).order_by(preserved_order)

        return active_users

# class UserViewSet(viewsets.ModelViewSet):
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user

#         conversations = Conversation.objects.filter(
#             Q(sender=user) | Q(receiver=user)
#         ).annotate(
#             last_message_time=Max('chatmessage__timestamp')
#         ).order_by('-last_message_time')

#         ordered_user_ids = []
#         for conversation in conversations:
#             if conversation.sender.id != user.id:
#                 ordered_user_ids.append(conversation.sender.id)
#             if conversation.receiver.id != user.id:
#                 ordered_user_ids.append(conversation.receiver.id)

#         seen = set()
#         ordered_user_ids = [x for x in ordered_user_ids if not (x in seen or seen.add(x))]

#         active_users = User.objects.filter(id__in=ordered_user_ids).order_by(
#             models.Case(
#                 *[models.When(id=pk, then=pos) for pos, pk in enumerate(ordered_user_ids)]
#             )
#         )

#         return active_users

# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.AllowAny]