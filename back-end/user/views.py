import os
from .models import User, Stats
from .twoFactorAuth import generate_qr, verify_otp
from .serializers import UserSerializer, CustomVerifyTokenSerializer, CustomRefreshTokenSerializer, StatsSerializer
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, permission_classes

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
        return Response(status=status.HTTP_403_FORBIDDEN)

class UserAction(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'retrieve' or self.action == 'list' or self.action == 'update':
            self.permission_classes = [IsAuthenticated,]
        return super(UserAction, self).get_permissions()

    def list(self, request):
        return Response({'detail': 'forbidden.'}, status=status.HTTP_403_FORBIDDEN)

    def retrieve(self, request, *args, **kwargs):
        # this is the case when the retrieve method is called with the pk as 'update'
        if kwargs['pk'] == 'update':
            return Response({'detail': 'Method \"GET\" not allowed.'}, status=status.HTTP_200_OK)
        try:
            user = User.objects.get(username=kwargs['pk'])
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, *args, **kwargs):
        user = request.user
        if "password" in request.data:
            return Response({'message': 'Password cannot be updated using this endpoint'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserSerializer(user, data=request.data, context={'partial': True})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User updated successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        return Response({'message': 'Method \"PATCH\" not allowed.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, *args, **kwargs):
        user = request.user
        if "password" not in request.data:
            return Response({'message': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if "old_password" not in request.data:
            return Response({'message': 'Old password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(request.data['old_password']):
            return Response({'message': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(request.data['password'])
        user.save()
        return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserSerializer(data=request.data, context={'partial': False})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Account created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        try:
            email = request.data['email']
            password = request.data['password']
            user = User.objects.filter(email=email).first()
            if not user or not user.check_password(password):
                return Response({'message': 'incorrect email or password'}, status=status.HTTP_401_UNAUTHORIZED)
            if user._2fa_enabled:
                code = request.data['otp']
                if not verify_otp(code):
                    return Response({'message': '2FA verification failed'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = UserSerializer(user)
            refresh_token = RefreshToken.for_user(user)
            access_token = str(refresh_token.access_token)
            response  = Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
            response.data = {"user": serializer.data}
            response.set_cookie(key='refresh', value=str(refresh_token), httponly=True)
            response.set_cookie(key='access', value=access_token, httponly=True)
            return response
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def enable_2fa(self, request):
        user = request.user
        if user._2fa_enabled:
            return Response({'message': '2FA already enabled'}, status=status.HTTP_200_OK)
        generate_qr(user.username, 'ft_transcendence')
        user._2fa_enabled = True
        user.save()
        return Response({'message': '2FA enabled', 'detail': 'scan the qrcode \'ft_transcendence/back-end/user/'+user.username+'_2fa.png\''}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def disable_2fa(self, request):
        user = request.user
        if not user._2fa_enabled:
            return Response({'message': '2FA already disabled'}, status=status.HTTP_200_OK)
        user._2fa_enabled = False
        user.save()
        # Remove the 2FA QR code file
        qr_code_path = './media/2fa/'+user.username+'_2fa.png'
        if os.path.exists(qr_code_path):
            os.remove(qr_code_path)
        return Response({'message': '2FA disabled'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = RefreshToken(request.data.get('refresh'))
            refresh_token.blacklist()
            response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
            response.delete_cookie('refresh')
            response.delete_cookie('access')
            return response
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenVerifyView(TokenVerifyView):
    serializer_class = CustomVerifyTokenSerializer

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomRefreshTokenSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        response = super().post(request, *args, **kwargs)
        access = response.data['access']
        response.set_cookie(key='access', value=access, httponly=True)
        response.data = {}
        return response

