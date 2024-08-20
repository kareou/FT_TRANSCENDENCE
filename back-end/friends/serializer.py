from rest_framework import serializers
from  user.serializers import UserSerializer   
from .models import friendList

class friendListSerializer(serializers.ModelSerializer):
    class Meta:
        model = friendList
        fields = '__all__'
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user1'] = UserSerializer(instance.user1).data
        representation['user2'] = UserSerializer(instance.user2).data
        return representation