from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.response import Response
from .models import friendList
from .serializer import friendListSerializer
from django.db.models import Q
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

class friends_viewset(viewsets.ModelViewSet):
    queryset = friendList.objects.all()
    serializer_class = friendListSerializer

    def list(self, request):
        queryset = friendList.objects.filter(
            ((Q(user1=request.user) & Q(user1_blocked_user2=False)) |
            (Q(user2=request.user) & Q(user2_blocked_user1=False))) &
            Q(are_friends=True)
        )
        serializer = friendListSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = friendListSerializer(data=request.data)
        if serializer.is_valid():
            user1 = serializer.validated_data['user1']
            user2 = serializer.validated_data['user2']
            if friendList.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).first():
                return Response(status=400)
            if user1 != user2:
                serializer.save(are_friends=True)
                return Response(serializer.data, status=201)
        return Response(serializer.errors, status=401)

    def destroy(self, request, pk=None):
        try:
            queryset = friendList.objects.get(pk=pk)
            if queryset is not None and queryset.are_friends == True:
                queryset.delete()
                return Response(status=200)
        except friendList.DoesNotExist:
            return Response(status=400)
        return Response(status=400)

    @action(detail=True, methods=['GET', 'POST'])
    def block(self, request, pk=None):
        if request.method == 'POST':
            serializer = friendListSerializer(data=request.data)
            if serializer.is_valid():
                user1 = serializer.validated_data['user1']
                user2 = serializer.validated_data['user2']
                friendShip = friendList.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).first()
                if friendShip and friendShip.user1_blocked_user2 == False and friendShip.user2_blocked_user1 == False and user1 != user2:
                    if request.user == user1:
                        friendShip.user1_blocked_user2 = True
                    elif request.user == user2:
                        friendShip.user2_blocked_user1 = True
                    friendShip.are_friends = False
                    friendShip.save()
                    return Response(status=200)
            # f = open('POST', 'a')
            # f.write(serializer.__str__())
        if request.method == 'GET':
            queryset = friendList.objects.filter(
                ((Q(user1=request.user) & Q(user1_blocked_user2=True)) |
                (Q(user2=request.user) & Q(user2_blocked_user1=True)))
            )
            blockList = friendListSerializer(queryset, many=True)
            return Response(blockList.data)
        return Response(status=400)

    @action(detail=True, methods=['GET', 'POST'])
    def unblock(self, request, pk=None):
        if request.method == 'POST':
            queryset = friendList.objects.filter(
                (Q(user1=request.user) & Q(user1_blocked_user2=True)) |
                (Q(user2=request.user) & Q(user2_blocked_user1=True))
            )
            queryset.delete()
            return Response(status=200)
        # GET
        return Response(status=400)
