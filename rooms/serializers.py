from rest_framework import serializers
from .models import Room, Review, Bookmark

class RoomSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ['created_at', 'owner_email']

    def get_latitude(self, obj):
        return float(obj.latitude) if obj.latitude is not None else None

    def get_longitude(self, obj):
        return float(obj.longitude) if obj.longitude is not None else None


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'room', 'user', 'created_at', 'is_owner']
        read_only_fields = ['user', 'room', 'created_at']

    def validate(self, data):
        request = self.context.get('request')
        room = self.context.get('room')

        if not request or not room:
            raise serializers.ValidationError("Missing context for validation.")

        user = request.user
        if Review.objects.filter(user=user, room=room).exists():
            raise serializers.ValidationError("You have already reviewed this room.")
        return data

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request.user == obj.user if request else False


class BookmarkSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)  # Nested room details

    class Meta:
        model = Bookmark
        fields = ['id', 'room', 'created_at']
