from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

userRouter = DefaultRouter()
userRouter.register(r'user', views.UserAction, 'user')

statRouter = DefaultRouter()
statRouter.register('stats', views.StatsViewSet, basename='stats')

urlpatterns = [
	path('', include(statRouter.urls)),
	path('', include(userRouter.urls))
]
