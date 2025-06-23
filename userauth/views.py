from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from rooms.models import Review
from rooms.serializers import ReviewSerializer

class RegisterAPI(APIView):
    permission_classes = [AllowAny]  # ✅ Allow unauthenticated access

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
    permission_classes = [AllowAny] 
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
class MyReviewsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reviews = Review.objects.filter(user=request.user).select_related('room')
        data = []
        for review in reviews:
            review_data = ReviewSerializer(review).data
            review_data['room_title'] = review.room.title
            data.append(review_data)
        return Response(data)