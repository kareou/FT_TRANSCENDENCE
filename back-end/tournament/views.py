from django.shortcuts import render
from rest_framework.response import Response
from game.models import Match
from tournament.models import TournamentParticipant
from django.db.models import Q
from django.shortcuts import redirect
from rest_framework import status
from .models import Tournament
from django.http import HttpResponse

def join_tournament(request):
    return HttpResponse('TOURNAMENT SECCTION')

#     if TournamentParticipant.objects.filter(Q(player=player)).exists():
#         redirect('waiting_for_participants')

#     TournamentParticipant.objects.create(player=player)
#     players = TournamentParticipant.objects.all()
#     if TournamentParticipant.objects.count() >= 2:
#         Match.objects.create(
#             player1=players[0].player,
#             player2=players[1].player,
#         )
#         players[0].delete()
#         players[1].delete()

#     if Match.objects.count() == 4:
#         tournament = tournament.objects.create

# def waiting_for_participants():
#     return Response(
#         {"Waiting": "waiting for other participants to join the game"},
#         TournamentParticipant.count,
#         status=status.HTTP_200_OK,
#     )
