from django.urls import path
from .views import RoomListCreateAPI, ReviewCreateAPI, RoomReviewListAPI, MyRoomsAPI, RoomDetailAPI, RoomRecommendationAPI

urlpatterns = [
    path('', RoomListCreateAPI.as_view(), name='room-list-create'),
    path('my-rooms/', MyRoomsAPI.as_view(), name='my-rooms'),
    path('<int:room_id>/reviews/', RoomReviewListAPI.as_view(), name='room-review-list'),
    path('<int:room_id>/review/', ReviewCreateAPI.as_view(), name='room-review-create'),
    path('<int:pk>/', RoomDetailAPI.as_view(), name='room-detail'),
    path('<int:room_id>/recommend/', RoomRecommendationAPI.as_view(), name='room-recommend'),
]
