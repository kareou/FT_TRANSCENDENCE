from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StatsViewSet

router = DefaultRouter()
router.register('stats', StatsViewSet, basename='stats')

urlpatterns = [
	path('', include(router.urls))
]

