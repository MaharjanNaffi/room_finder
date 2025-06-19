from django.contrib import admin
from .models import Room
from .models import Review

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'location', 'price', 'created_at')
    list_filter = ('location', 'created_at')
    search_fields = ('title', 'description', 'location', 'owner__email')
    readonly_fields = ('created_at',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('room__title', 'user__email', 'comment')
    readonly_fields = ('created_at',)