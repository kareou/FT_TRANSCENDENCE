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

	def get_queryset(self):
		return Notification.objects.filter(receiver=self.request.user)

	@action(detail=False, methods=['get'])
	def get_unread(self, request):
		unread = Notification.objects.filter(receiver=self.request.user, read=False)
		return Response(self.get_serializer(unread, many=True).data, status=status.HTTP_200_OK)
	
	@action(detail=False, methods=['PUT'])
	def mark_all_read(self, request):
		Notification.objects.filter(receiver=self.request.user).update(read=True)
		return Response(status=status.HTTP_200_OK)