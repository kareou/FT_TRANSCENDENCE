from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import MessageViewSet, UserConversationViewSet
from .views import MessageViewSet, UserViewSet, UserConversationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'conversations', UserConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('conversations/fetch_or_create/', UserConversationViewSet.as_view({'post': 'fetch_or_create_conversation'}), name='fetch_or_create_conversation'),
]