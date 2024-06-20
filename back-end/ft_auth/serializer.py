from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.serializers import TokenVerifySerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError,InvalidToken
from rest_framework_simplejwt.tokens import UntypedToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenVerifySerializer(TokenVerifySerializer):
    def validate(self, attrs):
        request = self.context.get('request')
        token = request.data.get('token')
        if not token:
            raise serializers.ValidationError('No token provided.')
        data = {}
        try:
            validated_token = UntypedToken(token)
            user = User.objects.get(id=validated_token['user_id'])
            user_serializer = UserSerializer(user)
            data['user'] = user_serializer.data
        except User.DoesNotExist:
            raise serializers.ValidationError('No user found for the provided token.')
        except TokenError as e:
            raise InvalidToken(e)
        return data

class CustomeTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        request = self.context.get('request')
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            raise serializers.ValidationError('No refresh token provided.')
        data = {}
        try:
            access_token = refresh_token.access_token
        except TokenError as e:
            raise InvalidToken(e)

        return data
