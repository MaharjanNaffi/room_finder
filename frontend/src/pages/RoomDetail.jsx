// src/pages/RoomDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoomCard from '../components/RoomCard';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Component to update map center when room changes
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [recommendedRooms, setRecommendedRooms] = useState([]);

  const [nearbyRooms, setNearbyRooms] = useState([]);
  const [radius, setRadius] = useState(1); // default 1 km

  // Fetch room and related data whenever ID changes
  useEffect(() => {
    setRoom(null);
    setReviews([]);
    setNearbyRooms([]);
    setRecommendedRooms([]);
    setRating(0);
    setComment('');
    setErrorMessage('');
    setHasReviewed(false);
    setIsBookmarked(false);

    // Fetch room data
    fetch(`http://127.0.0.1:8000/api/rooms/${id}/`)
      .then(res => res.json())
      .then(data => setRoom(data))
      .catch(err => console.error(err));

    // Fetch reviews
    fetch(`http://127.0.0.1:8000/api/rooms/${id}/reviews/`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        const currentUser = localStorage.getItem('user_email');
        setHasReviewed(data.some(review => review.user === currentUser));
      })
      .catch(err => console.error(err));

    // Fetch bookmarks if logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`http://127.0.0.1:8000/api/rooms/my-bookmarks/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const bookmarked = data.some(b => b.room.id === parseInt(id));
          setIsBookmarked(bookmarked);
        })
        .catch(err => console.error(err));
    }

    // Fetch recommended rooms (top 5 similar)
    fetch(`http://127.0.0.1:8000/api/rooms/${id}/recommend/`)
      .then(res => res.json())
      .then(data => setRecommendedRooms(data))
      .catch(err => console.error(err));

  }, [id]);

  // Fetch nearby rooms whenever room loads or radius changes
  useEffect(() => {
    if (room?.latitude && room?.longitude) {
      fetch(`http://127.0.0.1:8000/api/rooms/${id}/nearby/?radius=${radius}`)
        .then(res => res.json())
        .then(data => setNearbyRooms(data))
        .catch(err => console.error(err));
    }
  }, [room, radius, id]);

  if (!room) {
    return (
      <div className="flex items-center justify-center h-64 text-lg text-gray-500 animate-pulse">
        ⏳ Loading room details...
      </div>
    );
  }

  const handleRatingClick = (value) => setRating(value);

  const handleSubmitReview = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return setErrorMessage('🔒 You must be logged in to submit a review.');
    if (hasReviewed) return setErrorMessage('✅ You have already submitted a review for this room.');

    fetch(`http://127.0.0.1:8000/api/rooms/${id}/review/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating, comment })
    })
      .then(res =>
        res.ok
          ? res.json()
          : res.json().then(err => { throw new Error(JSON.stringify(err)) })
      )
      .then(data => {
        setReviews(prev => [data, ...prev]);
        setRating(0);
        setComment('');
        setErrorMessage('');
        setHasReviewed(true);
        toast.success("✅ Review submitted!");
      })
      .catch(err => {
        console.error('Review error:', err);
        toast.error('❌ Error submitting review. Please try again.');
      });
  };

  const handleBookmarkToggle = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return toast.error("🔒 Please login to bookmark rooms.");

    fetch(`http://127.0.0.1:8000/api/rooms/bookmark/${id}/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => {
        setIsBookmarked(!isBookmarked);
        toast.success(!isBookmarked ? '✅ Added to bookmark!' : '💔 Removed from bookmark!');
      })
      .catch(() => toast.error('❌ Failed to update bookmark.'));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">{room.title}</h1>
      <p className="text-gray-700 mb-1">{room.description}</p>
      <p className="text-purple-700 font-semibold mb-1">Price: Rs. {room.price}</p>
      <p className="text-gray-500 mb-2">Location: {room.location}</p>
      <p className="text-gray-600 mb-4">Room Type: {room.room_type || "Not specified"}</p>

      {isAuthenticated ? (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <p className="text-gray-700 font-semibold mb-0"> 📞 {room.contact_number} </p>
          <a
            href={`tel:${room.contact_number}`}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition text-sm"
          >
            Call Owner
          </a>
          <button
            onClick={handleBookmarkToggle}
            className={`px-4 py-2 rounded-md text-sm transition ${isBookmarked ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-800'}`}
          >
            {isBookmarked ? '🔖 Bookmarked' : '➕ Bookmark'}
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">🔒 Login to view contact details and leave reviews</p>
      )}

      {/* Radius selector */}
      <div className="mb-4">
        <label className="font-semibold mr-2 text-gray-700">Nearby Radius:</label>
        <select
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} km</option>)}
        </select>
      </div>

      {/* Map */}
      {room.latitude && room.longitude ? (
        <div className="w-full h-64 rounded-xl overflow-hidden mb-6">
          <MapContainer
            key={room.id} 
            center={[parseFloat(room.latitude), parseFloat(room.longitude)]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <MapUpdater center={[parseFloat(room.latitude), parseFloat(room.longitude)]} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Current room marker */}
            <Marker
              position={[parseFloat(room.latitude), parseFloat(room.longitude)]}
              icon={new L.Icon({
                iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              })}
            >
              <Popup>
                <strong>{room.title}</strong><br />{room.location}
              </Popup>
            </Marker>

            {/* Nearby rooms markers (always visible) */}
            {nearbyRooms.filter(r => r?.latitude && r?.longitude).map(r => (
              <Marker
                key={r.id}
                position={[parseFloat(r.latitude), parseFloat(r.longitude)]}
                icon={new L.Icon({
                  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  iconSize: [28, 28],
                  iconAnchor: [14, 28],
                  popupAnchor: [0, -28],
                })}
                eventHandlers={{ click: () => navigate(`/rooms/${r.id}`) }}
              >
                <Popup>
                  <strong>{r.title}</strong><br />{r.location}<br />
                  <button className="text-blue-600 underline mt-1" onClick={() => navigate(`/rooms/${r.id}`)}>View Details</button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500 font-medium mb-6">
          📍 No location data available
        </div>
      )}

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-pink-700 mb-4">Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <div key={idx} className="mb-4 p-4 bg-white rounded-xl shadow">
              <p className="text-sm text-gray-600">By: {review.user}</p>
              <p className="text-yellow-500 mb-1">Rating: {'⭐'.repeat(review.rating)}</p>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : <p className="text-gray-500">No reviews yet.</p>}
      </div>

      {/* Add Review */}
      {isAuthenticated && (
        <div className="mt-10 bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2 text-purple-700">Leave a Review</h3>
          {errorMessage && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow">{errorMessage}</div>}
          <div className="flex items-center mb-2">
            {[1,2,3,4,5].map(star => (
              <span key={star} onClick={() => handleRatingClick(star)} className={`text-2xl cursor-pointer ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
            ))}
          </div>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 mb-3"
            rows="3"
            placeholder="Write your review..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-90" onClick={handleSubmitReview}>
            Submit Review
          </button>
        </div>
      )}

      {/* Recommended Rooms */}
      {recommendedRooms.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">🏠 Similar Rooms You Might Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedRooms.map(r => <RoomCard key={r.id} room={r} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
