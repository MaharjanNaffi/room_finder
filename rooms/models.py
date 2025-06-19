from django.db import models
from django.conf import settings

class Room(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rooms'
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class Review(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.email} for {self.room.title} - {self.rating}★"
