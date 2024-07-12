from django.conf import settings
from .models import User, Stats
from rest_framework import serializers
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer, TokenVerifySerializer

class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'username', 'email', 'password', 'profile_pic', 'level', 'exp', '_2fa_enabled']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    full_name = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(required=False, write_only=True, min_length=8)
    _2fa_enabled = serializers.BooleanField(read_only=True)

    def validate(self, data):
        if not self.context.get('partial') and not ('full_name' in data and 'username' in data and 'email' in data and 'password' in data):
            raise serializers.ValidationError('All fields are required to create an account.')
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user
    
    def update(self, instance, validated_data):

        # Update fields if they are present in validated_data
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance

class CustomVerifyTokenSerializer(TokenVerifySerializer):
    token = serializers.CharField(write_only=True, required=False)
    def validate(self, attrs):
        token = self.context.get('request').COOKIES.get('access')
        if not token:
            raise serializers.ValidationError('No token provided.')
        data = {}
        try:
            valid_token = UntypedToken(token)
            if (settings.SIMPLE_JWT.get('BLACKLIST_AFTER_ROTATION') and "rest_framework_simplejwt.token_blacklist" in settings.INSTALLED_APPS):
                jti = valid_token.get(settings.SIMPLE_JWT.JTI_CLAIM)
                if BlacklistedToken.objects.filter(token__jti=jti).exists():
                    raise TokenError("Token is blacklisted")
            user = User.objects.get(id=valid_token['user_id'])
            user_serializer = UserSerializer(user)
            data['user'] = user_serializer.data
        except TokenError as e:
            raise InvalidToken(e)
        except User.DoesNotExist:
            raise InvalidToken('No user found for the provided token.')
        return data

class CustomRefreshTokenSerializer(TokenRefreshSerializer):
    refresh = serializers.CharField(required=False)
    def validate(self, attrs):
        request = self.context.get('request')
        refresh = request.COOKIES.get('refresh')

        if not refresh:
            raise serializers.ValidationError('No refresh token provided.')
        attrs['refresh'] = refresh

        return super().validate(attrs)

class StatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stats
        fields = '__all__'

    def create(self, validated_data):
        if validated_data.get('user') is None:
            raise serializers.ValidationError('User is required')
        if Stats.objects.filter(user=validated_data.get('user')).exists():
            raise serializers.ValidationError('User already have stats')
        return super().create(validated_data)
