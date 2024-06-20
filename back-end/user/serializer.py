from rest_framework import serializers
from .models import Stats

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
