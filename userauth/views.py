from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.conf import settings
from django.core.mail import send_mail
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from rooms.models import Review
from rooms.serializers import ReviewSerializer

class RegisterAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "Send a POST request to register a new user."})
   
    def post(self, request):
        print("Registration data received:", request.data)  # Debug print
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Send welcome email
            try:
                send_mail(
                    subject='Welcome to Room Finder!',
                    message=f'Hi {user.first_name or user.name},\n\nWelcome to Room Finder! Your account has been created successfully.\n\nBest regards,\nRoom Finder Team',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")
            
            # Get or create token
            token, created = Token.objects.get_or_create(user=user)
            
            # Create JWT tokens for compatibility
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "token": token.key,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)
        
        print("Serializer errors:", serializer.errors)  # Debug print
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPI(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            
            # Also create/get token for compatibility
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
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

# Password Reset Views
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model

User = get_user_model()

class ForgotPasswordAPI(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create reset link
            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
            
            # Send password reset email
            send_mail(
                subject='Password Reset - Room Finder',
                message=f'''Hi {user.first_name or user.name},

You requested a password reset for your Room Finder account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Room Finder Team''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Password reset email sent successfully'})
            
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({'message': 'If an account with this email exists, a password reset link has been sent.'})
        except Exception as e:
            print(f"Email sending failed: {e}")
            return Response({'error': 'Failed to send email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordAPI(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uid, token, new_password]):
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Decode the user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Check if token is valid
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                
                # Send confirmation email
                send_mail(
                    subject='Password Reset Successful - Room Finder',
                    message=f'''Hi {user.first_name or user.name},

Your password has been successfully reset.

If you didn't make this change, please contact us immediately.

Best regards,
Room Finder Team''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
                
                return Response({'message': 'Password reset successful'})
            else:
                return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Password reset failed: {e}")
            return Response({'error': 'Password reset failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)