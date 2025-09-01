import requests
from math import radians, sin, cos, sqrt, atan2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from django.db.models import Q
from .models import Room, Review, Bookmark
from .serializers import RoomSerializer, ReviewSerializer, BookmarkSerializer
from .permissions import IsOwnerOrReadOnly
from fuzzywuzzy import fuzz
from Levenshtein import distance as levenshtein_distance
from fuzzywuzzy import process
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from userauth.serializers import RegisterSerializer, LoginSerializer
from rest_framework.pagination import PageNumberPagination

class NearbyRoomsAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request, room_id):
        try:
            current_room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)

        if not current_room.latitude or not current_room.longitude:
            return Response([], status=200)

        # Get radius from query params (default 1 km)
        try:
            radius = float(request.query_params.get('radius', 1))
        except ValueError:
            radius = 1

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371  # Earth radius in km
            d_lat = radians(lat2 - lat1)
            d_lon = radians(lon2 - lon1)
            a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return R * c

        nearby_rooms = []
        for room in Room.objects.exclude(id=room_id):
            if room.latitude and room.longitude:
                distance = haversine(current_room.latitude, current_room.longitude, room.latitude, room.longitude)
                if distance <= radius:
                    nearby_rooms.append(room)

        serializer = RoomSerializer(nearby_rooms, many=True)
        return Response(serializer.data, status=200)
    
class RoomListAllAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        rooms = Room.objects.all().order_by('-created_at')
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

class RoomListCreateAPI(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        query = request.query_params.get('search')
        max_price = request.query_params.get('max_price')
        room_type = request.query_params.get('room_type')

        rooms = Room.objects.all()

        # 🔍 Apply fuzzy filtering if search query exists
        if query:
            all_rooms = list(rooms)
            matched_ids = []

            for room in all_rooms:
                room_location = room.location.lower()
                query_lower = query.lower()
                # Compute Levenshtein distance
                distance = levenshtein_distance(query_lower, room_location)
                # Keep match if distance is 2 or 3
                if distance <= 3:
                    matched_ids.append(room.id)

            rooms = rooms.filter(id__in=matched_ids)

        if max_price:
            try:
                rooms = rooms.filter(price__lte=float(max_price))
            except ValueError:
                pass

        if room_type:
            rooms = rooms.filter(room_type__iexact=room_type)

        rooms = rooms.order_by('-created_at')
        # ⚡ Apply pagination
        paginator = PageNumberPagination()
        paginator.page_size = 12  # or use settings PAGE_SIZE
        result_page = paginator.paginate_queryset(rooms, request)
        serializer = RoomSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        location = data.get('location')

        # Call Nominatim API to get lat, lon from location text
        lat, lon = self.get_lat_lon_from_nominatim(location)
        data['latitude'] = lat
        data['longitude'] = lon

        serializer = RoomSerializer(data=data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
def get_lat_lon_from_nominatim(self, location):
        try:
            url = f"https://nominatim.openstreetmap.org/search?q={location}&format=json"
            headers = {'User-Agent': 'clean-room-finder-app'}
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()
            results = response.json()
            if results:
                return float(results[0]['lat']), float(results[0]['lon'])
        except Exception as e:
            print(f"Nominatim API error: {e}")
        # Default to Kathmandu coords if failure
        return 27.7172, 85.3240

# View to post a review for a room (Login required)
class ReviewCreateAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)

        serializer = ReviewSerializer(
            data=request.data,
            context={'request': request, 'room': room}
        )

        if serializer.is_valid():
            serializer.save(user=request.user, room=room)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
# View to list all reviews for a room (Open to all)
class RoomReviewListAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=404)

        reviews = room.reviews.all().order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
class MyRoomsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = Room.objects.filter(owner=request.user).order_by('-created_at')
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    
class RoomDetailAPI(RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

class RoomRecommendationAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request, room_id):
        try:
            target_room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"detail": "Room not found"}, status=404)

        rooms = Room.objects.exclude(id=room_id)

        if not rooms.exists():
            return Response({"detail": "No other rooms to compare for recommendation."}, status=200)

        all_rooms = [target_room] + list(rooms)
        texts = [f"{room.title} {room.description} {room.location} {room.price}" for room in all_rooms]

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(texts)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        # Sort by similarity score
        similar_indices = cosine_sim.argsort()[::-1]
        
        # Get top 5 similar rooms
        similar_rooms = [rooms[int(i)] for i in similar_indices[:5]]
        serializer = RoomSerializer(similar_rooms, many=True)
        return Response(serializer.data)

class BookmarkToggleAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, room_id):
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return Response({"error": "Room not found."}, status=404)

        bookmark, created = Bookmark.objects.get_or_create(user=request.user, room=room)

        if not created:
            # Already bookmarked — remove it
            bookmark.delete()
            return Response({"message": "Bookmark removed."}, status=200)

        return Response({"message": "Room bookmarked."}, status=201)


class MyBookmarksAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookmarks = Bookmark.objects.filter(user=request.user).order_by('-created_at')
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)

class UserProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Rooms reviewed by this user
        reviewed_rooms = Room.objects.filter(reviews__user=user).distinct()

        # Rooms bookmarked by this user
        bookmarked_rooms = Room.objects.filter(bookmarked_by__user=user).distinct()

        reviewed_serializer = RoomSerializer(reviewed_rooms, many=True)
        bookmarked_serializer = RoomSerializer(bookmarked_rooms, many=True)

        return Response({
            "email": user.email,
            "reviewed_rooms": reviewed_serializer.data,
            "bookmarked_rooms": bookmarked_serializer.data
        })

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        # Send welcome email
        try:
            send_mail(
                subject='Welcome to Room Finder!',
                message=f'Hi {user.first_name},\n\nWelcome to Room Finder! Your account has been created successfully.\n\nBest regards,\nRoom Finder Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending failed: {e}")
        
        return Response({
            'message': 'User registered successfully',
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}"
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'access': token.key,  # Using token instead of JWT for simplicity
            'refresh': token.key,  # You can implement JWT later if needed
            'user': {
                'id': user.id,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}"
            }
        })
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link (you'll need to handle this in your frontend)
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
        
        # Send password reset email
        send_mail(
            subject='Password Reset - Room Finder',
            message=f'''Hi {user.first_name},

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

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
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
                message=f'''Hi {user.first_name},

Your password has been successfully reset.

If you didn't make this change, please contact us immediately.

Best regards,
Room Finder Team''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({'message': 'Password reset successful'})
        else:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
            
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Password reset failed: {e}")
        return Response({'error': 'Password reset failed. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)