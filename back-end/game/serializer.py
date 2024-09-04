from rest_framework import serializers
from .models import Match
from user.serializers import UserSerializer

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response["player1"] = UserSerializer(instance.player1).data
        response["player2"] = UserSerializer(instance.player2).data
        response["winner"] = UserSerializer(instance.winner).data
        return response
