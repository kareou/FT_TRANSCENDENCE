from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.serializers import TokenVerifySerializer

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
        data = super().validate(attrs)
        try:
            token = UntypedToken(attrs['token'])
            userId = token['user_id']
            user = User.objects.filter(id=userId).first()
            user_serializer = UserSerializer(user)
            data['user'] = user_serializer.data
        except User.DoesNotExist:
            data['user'] = None
        return data
