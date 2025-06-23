import random
from django.core.management.base import BaseCommand
from rooms.models import Room
from userauth.models import User

class Command(BaseCommand):
    help = 'Generate 500 dummy room listings for testing'

    def handle(self, *args, **kwargs):
        # ✅ Use your actual admin user
        admin_email = "sharmasresta01@gmail.com"
        admin_user = User.objects.filter(email=admin_email).first()

        if not admin_user:
            self.stdout.write(self.style.ERROR(f"❌ Admin user '{admin_email}' not found. Please create it first."))
            return

        locations = [
            "Kathmandu", "Lalitpur", "Bhaktapur", "Baneshwor", "Boudha", "Kalanki",
            "Chabahil", "Kirtipur", "Maharajgunj", "Jawalakhel"
        ]
        room_type = ["1BHK", "2BHK", "3BHK", "4BHK"]

        Room.objects.all().delete()  # Optional: remove old rooms

        for i in range(500):
            Room.objects.create(
                title=f"Room {i+1} - {random.choice(room_type)}",
                description="Spacious and affordable room near public transport.",
                price=random.randint(5000, 30000),
                location=random.choice(locations),
                contact_number=f"+977-98{random.randint(10000000, 99999999)}",
                room_type=random.choice(room_type),
                owner=admin_user
            )

        self.stdout.write(self.style.SUCCESS("✅ Successfully generated 500 dummy rooms."))
