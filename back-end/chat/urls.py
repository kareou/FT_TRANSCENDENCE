from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, UserConversationViewSet, UserViewSet,ConversationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'messages', MessageViewSet, basename='message')
# router.register(r'users/conversations', UserConversationViewSet, basename='user-conversations')
# router.register(r'conversations', ConversationViewSet, basename='conversation')
urlpatterns = [
    path('', include(router.urls)),
    path('conversations/fetch_or_create/', UserConversationViewSet.as_view({'post': 'fetch_or_create_conversation'})),
]
