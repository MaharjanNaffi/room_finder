from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

User = get_user_model()

# REGISTER
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('name', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Token.objects.create(user=user)  # create token on register
        return user

# LOGIN
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'name']  # include more fields if needed
