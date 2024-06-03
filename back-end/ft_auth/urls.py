from django.urls import path
from .views import UserViewSet

urlpatterns = [
    path('signin/', UserViewSet.as_view({'post': 'create', 'get': 'list'})),
]
