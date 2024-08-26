from django.urls import re_path
from .consumer import TournamentConsumer

websocket_urlpatterns = [
    re_path('ws/tournament/', TournamentConsumer.as_asgi()),
]
