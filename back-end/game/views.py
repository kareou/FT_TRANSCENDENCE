from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .models import Match
from .serializer import MatchSerializer
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from user.models import User
from .serializer import MatchSerializer
from django.db.models import Q
from rest_framework.response import Response


# Create your views here.
class GameViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    def create(self, request, *args, **kwargs):
        try:
            player1 = request.data.get('player1')
            player2 = request.data.get('player2')
            # winner = request.data.get('player1')

            user = MatchSerializer(data=request.data)
            if user.is_valid():
                user.save()
                return Response(user.data, status=status.HTTP_201_CREATED)
            return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def getUserMatches(self, request, username):
        user = get_object_or_404(User, username=username)
        if user is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        matches = Match.objects.filter(Q(player1=user) | Q(player2=user)).order_by('-created_at')
        if matches is None:
            print("User not found",flush=True)
            return Response(status=status.HTTP_404_NOT_FOUND)
        serialized = MatchSerializer(matches, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)
