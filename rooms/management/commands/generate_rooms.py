import random
import time
from django.core.management.base import BaseCommand
from rooms.models import Room
from userauth.models import User
from geopy.geocoders import Nominatim

class Command(BaseCommand):
    help = 'Generate 500 dummy room listings for testing with geocoded coordinates'

    def handle(self, *args, **kwargs):
        # Use your admin user
        admin_email = "sharmasresta01@gmail.com"
        admin_user = User.objects.filter(email=admin_email).first()

        if not admin_user:
            self.stdout.write(self.style.ERROR(f"❌ Admin user '{admin_email}' not found. Please create it first."))
            return

        geolocator = Nominatim(user_agent="clean_room_finder")

        # Kathmandu Valley locations
        locations = ["Baneshwor", "New Baneshwor", "Old Baneshwor", "Mid Baneshwor", "Tinkune", "Shankhamul", "Thapagaun", "Putalisadak", "Kalanki", "Kalopul", "Chabahil", "Boudha", "Kapan", "Jorpati", "Sundarijal", "Budhanilkantha", "Gongabu", "Balaju", "Swayambhu", "Nayabazar", "Lainchaur", "Maharajgunj", "Basundhara", "Gausala", "Gaushala", "Gaurighat", "Thamel", "Kamaladi", "Durbar Marg", "Naxal", "Dillibazar", "Hattisar", "Tripureshwor", "Ratnapark", "Singhadurbar", "Teku", "Kuleshwor", "Thankot", "Sano Bharyang", "Banasthali", "Nagarjun", "Koteshwor", "Balkumari", "Gwarko", "Satdobato", "Imadol", "Ekantakuna", "Lagankhel", "Jawalakhel", "Pulchowk", "Bakhundole", "Kupondole", "Jhamsikhel", "Dhobighat", "Nakhipot", "Bhaisepati", "Thasikhel", "Kumaripati", "Patan", "Mangal Bazar", "Sundhara", "Balkhu", "Kalimati", "Sorhakhutte", "Sankata", "Bhaktapur", "Kamalbinayak", "Thimi", "Sallaghari", "Jagati" ]

        # Room types and descriptions
        room_type = ["1BHK", "2BHK", "3BHK", "4BHK"]
        descriptions = [ "Peaceful residential area, perfect for students.", "Close to Ring Road and all public transport routes.", "Affordable space for students and workers.", "Room with attached kitchen and bathroom.", "Spacious room with southern sunlight and ventilation.", "Newly painted room near Kathmandu Medical College.", "Safe neighborhood, ideal for girls.", "Furnished room with wooden flooring and Wi-Fi.", "Located close to Big Mart and local shops.", "Perfect for office-going bachelors.", "Budget friendly flat with 24/7 water.", "Includes bed, table, and wardrobe.", "High speed internet included in rent.", "5 mins walk from main road and bus stop.", "Peaceful yet central location near Kalanki chowk.", "Well-ventilated and clean space for small family.", "Separate electricity meter. Pay as you go.", "Shared kitchen but private bedroom.", "Single room, newly built, clean and bright.", "Modern tiled bathroom, western toilet.", "Spacious balcony with view of Swayambhunath.", "5 minute walk to UN Park.", "Only for girls, secure and calm locality.", "Low cost room for job holders.", "Includes shared fridge and induction stove.", "Freshly painted, suitable for 2 people.", "Quiet area behind Bhatbhateni Supermarket.", "Sunny room with private terrace access.", "Room in 2nd floor, no lift available.", "Top floor room, no disturbance from neighbors.", "In-house parking available for scooter.", "Room close to TU, Kirtipur.", "Natural light, airy room, peaceful ambiance.", "Separate entrance, full privacy guaranteed.", "Ideal for students of Patan Campus.", "Room available in 3BHK flat share.", "CCTV secured building with night guard.", "Kitchen has marble counters and tiles.", "Geyser included in attached bathroom.", "Furnished with single bed and mattress.", "Spacious study area and enough shelves.", "For rent: Room with common kitchen and hall.", "Quiet and friendly landlord family.", "Near Pashupati temple, holy and calm vibes.", "Room near college area, discounts for students.", "Price negotiable for long-term stay.", "Light and water bill not included.", "Gated community, access via smart lock.", "Shared bathroom, but very clean and modern.", "Located on ground floor, no stairs.", "Lush green surroundings, zero noise pollution.", "New construction, earthquake resistant.", "Minimalist and clean room, no clutter.", "Private room inside hostel building.", "Close to cafes, bakeries and ATM.", "Ideal for couples or newly married.", "Rent includes maintenance charge.", "Call only during working hours.", "Water supply 2 times a day.", "No pets allowed.", "Smoking not allowed inside premises.", "Located near hospital, pharmacy nearby.", "Beautiful area with view of Shivapuri.", "Bike parking available inside gate.", "Walking distance from City Centre Mall.", "Security deposit required: 1 month rent.", "Looking for female tenant only.", "Great view of city skyline at night.", "Calm and peaceful surroundings with park nearby.", "Available from 1st of next month.", "Old building but newly renovated room.", "Spacious 2 rooms set with attached bathroom.", "Shared with one girl only.", "Free access to rooftop terrace.", "Fast internet and TV connection included." ]
        Room.objects.all().delete()  # Optional: clear old rooms

        for i in range(500):
            location_name = random.choice(locations)

            try:
                geocoded = geolocator.geocode(f"{location_name}, Kathmandu, Nepal")
                if geocoded:
                    latitude = geocoded.latitude
                    longitude = geocoded.longitude
                else:
                    latitude, longitude = 27.7172, 85.3240  # default Kathmandu center
                    self.stdout.write(self.style.WARNING(f"Could not geocode {location_name}, using default coordinates"))
            except Exception as e:
                latitude, longitude = 27.7172, 85.3240
                self.stdout.write(self.style.WARNING(f"Error geocoding {location_name}: {e}"))

            Room.objects.create(
                title=f"Room {i+1}",
                description=f"{random.choice(descriptions)} {random.choice(descriptions)}",
                price=random.randint(5000, 30000),
                location=location_name,
                latitude=latitude,
                longitude=longitude,
                contact_number=f"+977-98{random.randint(10000000, 99999999)}",
                room_type=random.choice(room_type),
                owner=admin_user
            )

            time.sleep(1)  # Respect Nominatim API rate limit

        self.stdout.write(self.style.SUCCESS("✅ Successfully generated 500 dummy rooms with coordinates!"))
