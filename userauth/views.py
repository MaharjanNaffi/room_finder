from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer

# REGISTER API (BEGINNER-FRIENDLY)
class RegisterAPI(APIView):
    def get(self, request):
        return Response({"message": "Send a POST request to register a new user."})
   
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = Token.objects.get(user=user)
            return Response({
                "user": {
                    "name": user.name,
                    "email": user.email
                },
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# LOGIN API (BEGINNER-FRIENDLY)
class LoginAPI(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)