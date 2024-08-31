import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back_end.settings')

django_asgi_app = get_asgi_application()

from game.routing import websocket_urlpatterns as game_websocket_urlpatterns
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from notification.routing import notificationn_urlpatterns as notification_websocket_urlpatterns
from tournament.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(
                    game_websocket_urlpatterns +
                    chat_websocket_urlpatterns +
                    notification_websocket_urlpatterns +
                    websocket_urlpatterns
                )
            )
        ),
    }
)
