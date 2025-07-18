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
from fuzzywuzzy import process

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
                combined_text = f"{room.title} {room.description} {room.location}"
                score = fuzz.partial_ratio(query.lower(), combined_text.lower())
                if score >= 60:  # You can adjust threshold
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
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

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
