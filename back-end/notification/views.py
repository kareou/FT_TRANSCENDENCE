from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializer import NotificationSerializer
# Create your views here.

class NotificationViewSet(viewsets.ModelViewSet):
	queryset = Notification.objects.all()
	serializer_class = NotificationSerializer
	permission_classes = [IsAuthenticated]

	def create(self, request, *args, **kwargs):
		data = request.data
		if data['receiver'] == request.user.id:
			Response(status=status.HTTP_400_BAD_REQUEST)

		serializer = NotificationSerializer(data=data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	def list(self, request, *args, **kwargs):
		queryset = Notification.objects.filter(receiver=request.user, status='U')
		serializer = NotificationSerializer(queryset, many=True)
		return Response(serializer.data)
