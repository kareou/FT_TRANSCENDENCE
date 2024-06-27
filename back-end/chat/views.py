from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import ChatMessage
from .serializers import ChatMessageSerializer, UserSerializer
import logging
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.AllowAny]

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



# this view just get the users who the logged user already had a conversation with witout any constaraints

# from rest_framework import viewsets, permissions
# from rest_framework.response import Response
# from .models import ChatMessage
# from .serializers import UserSerializer, ChatMessageSerializer

# class UserConversationViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.AllowAny]

#     def list(self, request):
#         user = request.user

#         # Retrieve users with whom the logged-in user has had conversations
#         sender_conversations = ChatMessage.objects.filter(sender=user).values('receiver').distinct()
#         receiver_conversations = ChatMessage.objects.filter(receiver=user).values('sender').distinct()
#         user_ids = set([conv['receiver'] for conv in sender_conversations] + [conv['sender'] for conv in receiver_conversations])

#         # Exclude current logged-in user from the list
#         user_ids.discard(user.id)

#         # Fetch the user objects based on the retrieved user IDs
#         users = User.objects.filter(id__in=user_ids)

#         # Serialize the user objects
#         serializer = UserSerializer(users, many=True)

#         return Response(serializer.data)
from django.db.models import OuterRef, Subquery, Q
from django.db.models.functions import Coalesce
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserConversationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        user = request.user

        sender_conversations = ChatMessage.objects.filter(sender=user).values('receiver').distinct()
        receiver_conversations = ChatMessage.objects.filter(receiver=user).values('sender').distinct()
        user_ids = set([conv['receiver'] for conv in sender_conversations] + [conv['sender'] for conv in receiver_conversations])

        user_ids.discard(user.id)

        latest_sender_message = ChatMessage.objects.filter(sender=user, receiver=OuterRef('pk')).order_by('-timestamp')
        latest_receiver_message = ChatMessage.objects.filter(receiver=user, sender=OuterRef('pk')).order_by('-timestamp')

        users = User.objects.filter(id__in=user_ids).annotate(
            latest_message_timestamp=Coalesce(
                Subquery(latest_sender_message.values('timestamp')[:1]),
                Subquery(latest_receiver_message.values('timestamp')[:1])
            )
        ).order_by('-latest_message_timestamp')

        serializer = UserSerializer(users, many=True)

        return Response(serializer.data)
