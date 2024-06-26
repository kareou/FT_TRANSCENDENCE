from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import ChatMessage
from .serializers import ChatMessageSerializer, UserSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.AllowAny]  # Adjust permissions as needed

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        user = request.user
        sent_messages = ChatMessage.objects.filter(sender=user).values('receiver').distinct()
        received_messages = ChatMessage.objects.filter(receiver=user).values('sender').distinct()

        user_ids = set()
        user_ids.update(msg['receiver'] for msg in sent_messages)
        user_ids.update(msg['sender'] for msg in received_messages)

        users = User.objects.filter(id__in=user_ids)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        try:
            sender_id = request.query_params.get('sender_id')
            receiver_id = request.query_params.get('receiver_id')

            if not sender_id or not receiver_id:
                return Response({"detail": "Both sender_id and receiver_id must be provided as query parameters."}, status=400)

            messages = ChatMessage.objects.filter(
                Q(sender_id=sender_id, receiver_id=receiver_id) |
                Q(sender_id=receiver_id, receiver_id=sender_id)
            )

            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            logger.error(f"Error fetching conversation: {str(e)}")
            return Response({"detail": "An error occurred while fetching conversation."}, status=500)



# from rest_framework import viewsets, permissions
# from .models import ChatMessage
# from .serializers import ChatMessageSerializer, UserSerializer
# from django.contrib.auth import get_user_model
# from rest_framework.decorators import action
# from rest_framework.response import Response

# User = get_user_model()

# class MessageViewSet(viewsets.ModelViewSet):
#     queryset = ChatMessage.objects.all()
#     serializer_class = ChatMessageSerializer

#     def get_permissions(self):
#         if self.action in ['create']:
#             self.permission_classes = [permissions.AllowAny]
#         else:
#             self.permission_classes = [permissions.IsAuthenticated]
#         return super().get_permissions()

#     @action(detail=False, methods=['get'])
#     def conversations(self, request):
#         user = request.user
#         sent_messages = ChatMessage.objects.filter(sender=user).values('receiver').distinct()
#         received_messages = ChatMessage.objects.filter(receiver=user).values('sender').distinct()

#         user_ids = set()
#         user_ids.update(msg['receiver'] for msg in sent_messages)
#         user_ids.update(msg['sender'] for msg in received_messages)

#         users = User.objects.filter(id__in=user_ids)
#         serializer = UserSerializer(users, many=True)
#         return Response(serializer.data)

#     @action(detail=True, methods=['get'])
#     def conversation(self, request, pk=None):
#         user = request.user
#         other_user = User.objects.get(pk=pk)
#         messages = ChatMessage.objects.filter(
#             (models.Q(sender=user) & models.Q(receiver=other_user)) |
#             (models.Q(sender=other_user) & models.Q(receiver=user))
#         )
#         serializer = self.get_serializer(messages, many=True)
#         return Response(serializer.data)

# viewsets.py

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import UserSerializer, ChatMessageSerializer

class UserConversationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user

        # Retrieve users with whom the logged-in user has had conversations
        sender_conversations = ChatMessage.objects.filter(sender=user).values('receiver').distinct()
        receiver_conversations = ChatMessage.objects.filter(receiver=user).values('sender').distinct()
        user_ids = set([conv['receiver'] for conv in sender_conversations] + [conv['sender'] for conv in receiver_conversations])

        # Exclude current logged-in user from the list
        user_ids.discard(user.id)

        # Fetch the user objects based on the retrieved user IDs
        users = User.objects.filter(id__in=user_ids)

        # Serialize the user objects
        serializer = UserSerializer(users, many=True)

        return Response(serializer.data)
