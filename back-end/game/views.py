from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .models import Match
from .serializer import MatchSerializer
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from ft_auth.models import User

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
                return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

            return super().create(request, *args, **kwargs)
        except:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def getUserMatches(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        if user is None:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)
        serializer = MatchSerializer(Match.objects.filter(player1=user) | Match.objects.filter(player2=user), many=True)
        return HttpResponse(serializer.data)
