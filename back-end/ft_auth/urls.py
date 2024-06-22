from django.urls import path
from . import views

urlpatterns = [
    path('', views.user),
    path('register/', views.register),
    path('login/', views.login),
    path('logout/', views.logout),
    path('protected/', views.protected),
]
