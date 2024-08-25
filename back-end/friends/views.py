from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.response import Response
from .models import friendList
from .serializer import friendListSerializer
from django.db.models import Q
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class friends_viewset(viewsets.ModelViewSet):
    queryset = friendList.objects.all()
    serializer_class = friendListSerializer

    def list(self, request):
        if request.user.is_authenticated:
            queryset = friendList.objects.filter(
                ((Q(user1=request.user) & Q(user1_blocked_user2=False)) |
                (Q(user2=request.user) & Q(user2_blocked_user1=False))) &
                Q(are_friends=True)
            )
        else:
            return Response({"error": "User not authenticated"}, status=status.HTTP_404_NOT_FOUND)
        serializer = friendListSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = friendListSerializer(data=request.data)
        if serializer.is_valid():
            user1 = serializer.validated_data['user1']
            user2 = serializer.validated_data['user2']
            if friendList.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).exists():
                return Response({"error": "already friends"}, status=status.HTTP_400_BAD_REQUEST)
            if user1 != user2:
                if request.user == user1:
                    serializer.save(user1_invited_user2=True)
                elif request.user == user2:
                    serializer.save(user2_invited_user1=True)
                return Response(serializer.data, status=201)
        return Response(serializer.errors, status=401)

    def destroy(self, request, pk=None):
        try:
            if not request.user.is_authenticated:
                return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            queryset = friendList.objects.get(pk=pk)
            if queryset is not None and queryset.are_friends == True:
                queryset.delete()
                return Response(status=200)
        except friendList.DoesNotExist:
            return Response(status=400)
        return Response(status=400)

    @action(detail=False, methods=['GET', 'POST'])
    def block(self, request, pk=None):
        if request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            serializer = friendListSerializer(data=request.data)
            if serializer.is_valid():
                user1 = serializer.validated_data['user1']
                user2 = serializer.validated_data['user2']
                friendShip = friendList.objects.filter(Q(user1=user1, user2=user2)).first()
                if friendShip:
                    friendShip.user1_blocked_user2 = True
                    friendShip.are_friends = False
                    friendShip.save()
                    return Response(status=200)
                friendShip = friendList.objects.filter(Q(user1=user2, user2=user1)).first()
                if friendShip:
                    friendShip.user2_blocked_user1 = True
                    friendShip.are_friends = False
                    friendShip.save()
                    return Response(status=200)
        if request.method == 'GET':
            if request.user.is_authenticated:
                queryset = friendList.objects.filter(
                    (Q(user1=request.user) & Q(user1_blocked_user2=True)) |
                    (Q(user2=request.user) & Q(user2_blocked_user1=True))
                )
            else:
                return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            blockList = friendListSerializer(queryset, many=True)
            return Response(blockList.data)
        return Response(status=400)

    @action(detail=False, methods=['GET', 'POST'])
    def unblock(self, request, pk=None):
        if request.method == 'POST':
            if request.user.is_authenticated:
                queryset = friendList.objects.filter(
                (Q(user1=request.user) & Q(user1_blocked_user2=True)) |
                (Q(user2=request.user) & Q(user2_blocked_user1=True))
            )
            else:
                return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            if queryset:
                queryset.delete()
                return Response(status=200)
        return Response(status=400)

    @action(detail=False, methods=['GET', 'POST'])
    def accept(self, request, pk=None):
        if request.method == 'POST':
            if request.user.is_authenticated:
                queryset = friendList.objects.filter(
                    (Q(user1=request.user) & Q(user2_invited_user1=True)) |
                    (Q(user2=request.user) & Q(user1_invited_user2=True))
                ).first()
            else:
                return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            if not queryset:
                return Response({"detail": "No pending invitation found."}, status=400)
            queryset.are_friends = True
            queryset.user1_invited_user2 = False
            queryset.user2_invited_user1 = False
            queryset.save()
            serializer = friendListSerializer(queryset)
            return Response(serializer.data, status=200)
        if request.method == 'GET':
            if request.user.is_authenticated:
                queryset = friendList.objects.filter(
                    (Q(user1=request.user) & Q(user2_invited_user1=True)) |
                    (Q(user2=request.user) & Q(user1_invited_user2=True))
                )
            else:
                return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            if queryset:
                serializer = friendListSerializer(queryset, many=True)
                return (Response(serializer.data))
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
