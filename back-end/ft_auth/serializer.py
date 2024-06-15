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
        token = request.COOKIES.get('access_token')
        if not token:
            raise serializers.ValidationError('No access token provided.')
        attrs["token"] = token
        _valid_data = super().validate(attrs)
        try:
            validated_token = UntypedToken(token)
            userId = validated_token['user_id']
            user = User.objects.filter(id=userId).first()
            user_serializer = UserSerializer(user)
            _valid_data['user'] = user_serializer.data
        except User.DoesNotExist:
            _valid_data['user'] = None

        return _valid_data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        request = self.context.get('request')
        token = request.COOKIES.get('refresh_token')
        if not token:
            raise serializers.ValidationError('No refresh token provided.')
        attrs['refresh'] = token
        try:
            super().validate(attrs)
        except TokenError as e:
            raise serializers.ValidationError(e.args[0])
        return attrs
