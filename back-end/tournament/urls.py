from django.urls import path
from . import views

urlpatterns = [
    path('', views.join_tournament, name='join_tournament'),
]
