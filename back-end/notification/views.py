from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializer import NotificationSerializer
from rest_framework.decorators import action
# Create your views here.

class NotificationViewSet(viewsets.ModelViewSet):
	queryset = Notification.objects.all()
	serializer_class = NotificationSerializer
	permission_classes = [IsAuthenticated]

	def create(self, request):
		return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

	def update(self, request, pk=None):
		return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

	def destroy(self, request, pk=None):
		return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

	def get_queryset(self):
		return Notification.objects.filter(receiver=self.request.user).order_by('-created_at')[0:8]
