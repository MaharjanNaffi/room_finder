from django.urls import path
from .views import RoomListCreateAPI, ReviewCreateAPI, RoomReviewListAPI, MyRoomsAPI, RoomDetailAPI, RoomRecommendationAPI, BookmarkToggleAPI, MyBookmarksAPI, UserProfileAPI

urlpatterns = [
    path('', RoomListCreateAPI.as_view(), name='room-list-create'),
    path('my-rooms/', MyRoomsAPI.as_view(), name='my-rooms'),
    path('<int:room_id>/reviews/', RoomReviewListAPI.as_view(), name='room-reviews'),
    path('<int:room_id>/review/', ReviewCreateAPI.as_view(), name='create-review'),
    path('<int:pk>/', RoomDetailAPI.as_view(), name='room-detail'),
    path('<int:room_id>/recommend/', RoomRecommendationAPI.as_view(), name='room-recommend'),
    path('bookmark/<int:room_id>/', BookmarkToggleAPI.as_view(), name='bookmark-toggle'),
    path('my-bookmarks/', MyBookmarksAPI.as_view(), name='my-bookmarks'),
    path('profile/', UserProfileAPI.as_view(), name='user-profile'),
]
