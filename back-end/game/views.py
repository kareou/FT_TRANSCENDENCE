from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .models import Match
from .serializer import MatchSerializer
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from ft_auth.models import User
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
            p1_score = int(request.data.get('player1_score'))
            p2_score = int(request.data.get('player2_score'))
            if player1 == player2 or p1_score < 0 or p2_score < 0:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            return super().create(request, *args, **kwargs)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def getUserMatches(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        if user is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        matches = Match.objects.filter(Q(player1=user) | Q(player2=user)).order_by('-created_at')
        if matches is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serialized = MatchSerializer(matches, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)
