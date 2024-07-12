from django.urls import path, include
from django.contrib.auth.models import AbstractBaseUser
from rest_framework.routers import DefaultRouter
from . import views

# URL configuration for game app.

router = DefaultRouter()
router.register(r'matche', views.GameViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('matche/history/<int:user_id>', views.GameViewSet.as_view({'get': 'getUserMatches'})),
]

