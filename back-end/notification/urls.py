from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

notificationRouter = DefaultRouter()
notificationRouter.register(r'notification', views.NotificationViewSet, 'notification')

urlpatterns = [
    path('', include(notificationRouter.urls))
]