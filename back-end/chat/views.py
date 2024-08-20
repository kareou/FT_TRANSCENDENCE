from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Max, Case, When
# from user.serializers import BlockUserSerializer
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
from friends.models import friendList

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
            if friendList.objects.filter(
               (Q(user1=sender) & Q(user2=receiver) & Q(user1_blocked_user2=True))
            ).exists():
                return Response({"detail": "You have blocked this user", "case": "sender_blocked_receiver", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)
            if friendList.objects.filter(
               (Q(user1=receiver) & Q(user2=sender) & Q(user2_blocked_user1=True))
            ).exists():
                return Response({"detail": "You are blocked by this user", "case": "receiver_blocked_sender", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)
                # return Response({"detail": "You have blocked this user", "case": "sender_blocked_receiver", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)
            # if receiver in sender.blocked_users.all():
            #     return Response({"detail": "You have blocked this user", "case": "sender_blocked_receiver", "conversation": ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)
            # if sender in receiver.blocked_users.all():

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

#     @action(detail=False, methods=['post'])
#     def block(self, request, pk=None):
#         data = request.data
#         user_to_block_id = data.get('blocked')
#         blocker_id = data.get('blocker')

#         required_fields = {'blocked', 'blocker'}
#         if not required_fields.issubset(data.keys()):
#             return Response({"detail": "User To Block ID and Blocker ID are required."}, status=status.HTTP_400_BAD_REQUEST)

#         user_to_block = get_object_or_404(User, pk=user_to_block_id)
#         user = get_object_or_404(User, pk=blocker_id)
#         user.blocked_users.add(user_to_block)
#         user.save()

#         return Response({'status': 'success', 'message': 'User blocked successfully.', 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)

#     @action(detail=False, methods=['post'])
#     def unblock(self, request, pk=None):
#         data = request.data
#         user_to_unblock_id = data.get('blocked')
#         blocker_id = data.get('blocker')

#         required_fields = {'blocked', 'blocker'}
#         if not required_fields.issubset(data.keys()):
#             return Response({"detail": "User To Block ID and Blocker ID are required."}, status=status.HTTP_400_BAD_REQUEST)

#         user_to_unblock = get_object_or_404(User, pk=user_to_unblock_id)
#         user = get_object_or_404(User, pk=blocker_id)
#         user.blocked_users.remove(user_to_unblock)

#         user.save()

#         return Response({'status': 'success', 'message': 'User unblocked successfully.', 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)



#     @action(detail=False, methods=['get'])
#     def blocked_users(self, request):
#         user_id = request.query_params.get('user_id')

#         if not user_id:
#             return Response({"detail": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)

#         user = get_object_or_404(User, pk=user_id)
#         blocked_users = user.blocked_users.all()cf
#         serializer = UserSerializer(blocked_users, many=True)
#         return Response(serializer.data)


# class BlockUserView(viewsets.ViewSet):
#     permission_classes = [permissions.IsAuthenticated]

#     @action(detail=True, methods=['POST'])
#     def block(self, request, pk=None):
#         blocker = request.user
#         user_to_block = get_object_or_404(User, pk=pk)
#         if user_to_block == blocker:
#             return Response({'error': 'You cannot block yourself.'}, status=status.HTTP_400_BAD_REQUEST)
#         if user_to_block in blocker.blocked_users.all():
#             return Response({'error': 'User already blocked.'}, status=status.HTTP_400_BAD_REQUEST)
#         blocker.blocked_users.add(user_to_block)
#         return Response({'status': 'success', 'message': 'User blocked successfully.'}, status=status.HTTP_200_OK)

#     @action(detail=False, methods=['GET'])
#     def blocked_users(self, request):
#         user = request.user
#         blocked_users = user.blocked_users.all()
#         serializer = self.get_serializer(blocked_users, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
