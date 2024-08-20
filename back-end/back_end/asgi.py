"""
ASGI config for back_end project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

from game.routing import websocket_urlpatterns as game_websocket_urlpatterns
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from notification.routing import notificationn_urlpatterns as notification_websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back_end.settings')

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(game_websocket_urlpatterns + chat_websocket_urlpatterns + notification_websocket_urlpatterns))
        ),
        # Just HTTP for now. (We can add other protocols later.)
    }
)
