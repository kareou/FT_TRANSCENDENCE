from rest_framework import serializers
from .models import friendList

class friendListSerializer(serializers.ModelSerializer):
    class Meta:
        model = friendList
        fields = '__all__'
