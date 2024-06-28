from typing import Any, Dict
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializer import UserSerializer, CustomTokenVerifySerializer
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView
from datetime import datetime

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST, data={'message': str(e)})

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        user = User.objects.filter(email=email).first()
        if not user:
            return Response(status=status.HTTP_404_NOT_FOUND, data={'message': 'User not found'})
        if not user.check_password(password):
            return Response(status=status.HTTP_404_BAD_REQUEST, data={'message': 'Incorrect password'})
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        serializer = UserSerializer(user)
        response = Response(serializer.data, status=status.HTTP_200_OK)
        print(refresh.access_token.lifetime,flush=True)
        response.set_cookie(key='access_token', value=access_token, expires=(datetime.now() + refresh.access_token.lifetime).strftime('%a, %d-%b-%Y %H:%M:%S GMT'),httponly=True, secure=True, samesite='lax')
        response.set_cookie(key='refresh_token', value=str(refresh), expires=(datetime.now() + refresh.lifetime).strftime('%a, %d-%b-%Y %H:%M:%S GMT'), httponly=True, secure=True, samesite='lax')
        return response

    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected(request):
    return Response({'message': 'You are authenticated'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'message': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)
        response = Response(status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST, data={'message': str(e)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user(request):
    user = User.objects.get(id=request.user.id)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = User.objects.get(id=request.user.id)
    serializer = UserSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TokenVerify(TokenVerifyView):
    serializer_class = CustomTokenVerifySerializer
    def post(self, request, *args, **kwargs):
        token = request.COOKIES.get('access_token')
        if not token:
            return Response({'message': 'No access token provided'}, status=status.HTTP_400_BAD_REQUEST)
        request.data['token'] = token
        return super().post(request, *args, **kwargs)

class TokenRefresh(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        token = request.COOKIES.get('refresh_token')
        if not token:
            return Response({'message': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)
        request.data['refresh'] = token
        response = super().post(request, *args, **kwargs)
        response.set_cookie(
            'access_token',
            response.data['access'],
            expires=(datetime.now() + AccessToken(response.data['access']).lifetime).strftime('%a, %d-%b-%Y %H:%M:%S GMT'),
            httponly=True,
            secure=True,
            samesite='lax'
        )
        return response
