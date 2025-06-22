from rest_framework import serializers
from .models import Room, Review

class RoomSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ['created_at', 'owner_email']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Show user's email

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']
