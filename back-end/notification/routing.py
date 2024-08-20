from django.urls import re_path
from . import consumer

notificationn_urlpatterns = [
    re_path(r'ws/notification/(?P<user_id>\w+)/$', consumer.NotificationConsumer.as_asgi()),
]
