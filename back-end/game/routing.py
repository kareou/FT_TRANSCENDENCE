from django.urls import re_path
from . import consumer

websocket_urlpatterns = [
    re_path(r"ws/gamematch/(?P<game_id>\w+)/$",consumer.GameConsumer.as_asgi()),
    re_path(r"ws/matchmaking/",consumer.MatchMakingConsumer.as_asgi()),
]
