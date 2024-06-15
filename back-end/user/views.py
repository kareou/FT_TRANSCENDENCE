from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Stats
from ft_auth.models import User
from .serializer import StatsSerializer

# Create your views here.
class StatsViewSet(viewsets.ViewSet):
    queryset = Stats.objects.all()
    serializer_class = StatsSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        return Response(status=status.HTTP_403_FORBIDDEN)

    def list(self, request):
        return Response(status=status.HTTP_403_FORBIDDEN)

    def retrieve(self, request, pk=None):
        user = get_object_or_404(User, pk=request.user.id)
        stats = get_object_or_404(Stats, user_id=user)
        serializer = StatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, pk=None):
        user = get_object_or_404(User, pk=request.user.id)
        stats = get_object_or_404(Stats, user_id=user)
        serializer = StatsSerializer(stats, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
