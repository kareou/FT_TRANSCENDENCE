from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework import permissions
from ft_auth.serializer import UserSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Adjust permission as needed


from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.contrib.auth.models import AnonymousUser
from .models import ChatMessage, Conversation
from .serializers import ChatMessageSerializer, ConversationSerializer
import logging

logger = logging.getLogger(__name__)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        sender_id = request.data.get('sender')
        receiver_id = request.data.get('receiver')
        content = request.data.get('content')

        if not sender_id or not receiver_id or not content:
            return Response({"detail": "sender, receiver, and content are required."}, status=status.HTTP_400_BAD_REQUEST)

        logger.debug(f"Sender: {sender_id}, Receiver: {receiver_id}, Content: {content}")

        # Check if a conversation exists
        conversation = Conversation.objects.filter(
            (Q(sender_id=sender_id) & Q(receiver_id=receiver_id)) | 
            (Q(sender_id=receiver_id) & Q(receiver_id=sender_id))
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(sender_id=sender_id, receiver_id=receiver_id)

        message = ChatMessage.objects.create(
            sender_id=sender_id,
            content=content,
            conv_id=conversation
        )

        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def conversations(self, request):
        user = request.user
        if isinstance(user, AnonymousUser):
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        conversations = Conversation.objects.filter(Q(sender=user) | Q(receiver=user)).distinct()
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        try:
            conversation_id = request.query_params.get('conversation_id')

            if not conversation_id:
                return Response({"detail": "conversation_id must be provided as a query parameter."}, status=400)

            conversation = Conversation.objects.get(id=conversation_id)
            messages = ChatMessage.objects.filter(conv_id=conversation)

            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            logger.error(f"Error fetching conversation: {str(e)}")
            return Response({"detail": "An error occurred while fetching the conversation."}, status=500)


from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation
from .serializers import ConversationSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny

User = get_user_model()

class UserConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def fetch_or_create_conversation(self, request):
        sender_id = request.data.get('sender')
        receiver_id = request.data.get('receiver')

        if not sender_id or not receiver_id:
            return Response({"detail": "sender and receiver are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a conversation exists
        # conversation = Conversation.objects.filter(
        #     (Q(sender_id=sender_id) & Q(receiver_id=receiver_id)) | 
        #     (Q(sender_id=receiver_id) & Q(receiver_id=sender_id))
        # ).first()

        # If not, create a new conversation
        # if not conversation:
        conversation = Conversation.objects.create(sender_id=sender_id, receiver_id=receiver_id)

        return Response(ConversationSerializer(conversation).data, status=status.HTTP_200_OK)

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Conversation
from .serializers import ConversationSerializer

class ConversationViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def fetch_or_create(self, request):
        sender_id = request.data.get('sender')
        receiver_id = request.data.get('receiver')

        if not sender_id or not receiver_id:
            return Response({"detail": "sender and receiver are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a conversation exists between these two users
        conversation = Conversation.objects.filter(
            (Q(sender_id=sender_id) & Q(receiver_id=receiver_id)) |
            (Q(sender_id=receiver_id) & Q(receiver_id=sender_id))
        ).first()

        if conversation:
            # Conversation already exists, return its details
            serializer = ConversationSerializer(conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Create a new conversation
            new_conversation = Conversation.objects.create(sender_id=sender_id, receiver_id=receiver_id)
            serializer = ConversationSerializer(new_conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

# from rest_framework import viewsets, permissions
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from django.db.models import Q
# from .models import ChatMessage
# from .serializers import ChatMessageSerializer, UserSerializer
# import logging
# from django.contrib.auth import get_user_model

# User = get_user_model()
# logger = logging.getLogger(__name__)

# class MessageViewSet(viewsets.ModelViewSet):
#     queryset = ChatMessage.objects.all()
#     serializer_class = ChatMessageSerializer
#     permission_classes = [permissions.AllowAny]

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

#     @action(detail=False, methods=['get'])
#     def conversation(self, request):
#         try:
#             sender_id = request.query_params.get('sender_id')
#             receiver_id = request.query_params.get('receiver_id')

#             if not sender_id or not receiver_id:
#                 return Response({"detail": "Both sender_id and receiver_id must be provided as query parameters."}, status=400)

#             messages = ChatMessage.objects.filter(
#                 Q(sender_id=sender_id, receiver_id=receiver_id) |
#                 Q(sender_id=receiver_id, receiver_id=sender_id)
#             )

#             serializer = self.get_serializer(messages, many=True)
#             return Response(serializer.data)
        
#         except Exception as e:
#             logger.error(f"Error fetching conversation: {str(e)}")
#             return Response({"detail": "An error occurred while fetching conversation."}, status=500)



# # this view just get the users who the logged user already had a conversation with witout any constaraints

# # from rest_framework import viewsets, permissions
# # from rest_framework.response import Response
# # from .models import ChatMessage
# # from .serializers import UserSerializer, ChatMessageSerializer

# # class UserConversationViewSet(viewsets.ViewSet):
# #     permission_classes = [permissions.AllowAny]

# #     def list(self, request):
# #         user = request.user

# #         # Retrieve users with whom the logged-in user has had conversations
# #         sender_conversations = ChatMessage.objects.filter(sender=user).values('receiver').distinct()
# #         receiver_conversations = ChatMessage.objects.filter(receiver=user).values('sender').distinct()
# #         user_ids = set([conv['receiver'] for conv in sender_conversations] + [conv['sender'] for conv in receiver_conversations])

# #         # Exclude current logged-in user from the list
# #         user_ids.discard(user.id)

# #         # Fetch the user objects based on the retrieved user IDs
# #         users = User.objects.filter(id__in=user_ids)

# #         # Serialize the user objects
# #         serializer = UserSerializer(users, many=True)

# #         return Response(serializer.data)
# from django.db.models import OuterRef, Subquery, Q
# from django.db.models.functions import Coalesce
# from rest_framework import viewsets, permissions
# from rest_framework.response import Response
# from .models import ChatMessage
# from .serializers import UserSerializer
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class UserConversationViewSet(viewsets.ViewSet):
#     permission_classes = [permissions.AllowAny]

#     def list(self, request):
#         user = request.user


#         sender_conversations = ChatMessage.objects.filter(sender=user).values('receiver').distinct()
#         receiver_conversations = ChatMessage.objects.filter(receiver=user).values('sender').distinct()
#         user_ids = set([conv['receiver'] for conv in sender_conversations] + [conv['sender'] for conv in receiver_conversations])
#         user_ids.discard(user.id)

#         latest_sender_message = ChatMessage.objects.filter(sender=user, receiver=OuterRef('pk')).order_by('-timestamp')
#         latest_receiver_message = ChatMessage.objects.filter(receiver=user, sender=OuterRef('pk')).order_by('-timestamp')

#         users = User.objects.filter(id__in=user_ids).annotate(
#             latest_message_timestamp=Coalesce(
#                 Subquery(latest_sender_message.values('timestamp')[:1]),
#                 Subquery(latest_receiver_message.values('timestamp')[:1])
#             )
#         ).order_by('-latest_message_timestamp')

#         serializer = UserSerializer(users, many=True)

#         return Response(serializer.data)
