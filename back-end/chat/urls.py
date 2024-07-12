from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, UserConversationViewSet

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'users/conversations', UserConversationViewSet, basename='user-conversations')

urlpatterns = [
    path('', include(router.urls)),
]
