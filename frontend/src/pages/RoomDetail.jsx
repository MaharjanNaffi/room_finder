import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RoomCard from '../components/RoomCard'; // ✅ Needed to display recommended rooms

const RoomDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [recommendedRooms, setRecommendedRooms] = useState([]); // ✅ NEW
  
  useEffect(() => {
    setRoom(null); // 👈 Force loading screen when id changes
    setReviews([]); // 👈 Reset reviews (optional but cleaner)
    
    fetch(`http://127.0.0.1:8000/api/rooms/${id}/`)
      .then(res => res.json())
      .then(data => setRoom(data));

    fetch(`http://127.0.0.1:8000/api/rooms/${id}/reviews/`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        const currentUser = localStorage.getItem('user_email');
        const alreadyReviewed = data.some(review => review.user === currentUser);
        setHasReviewed(alreadyReviewed);
      });

    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`http://127.0.0.1:8000/api/rooms/my-bookmarks/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const bookmarked = data.some(b => b.room.id === parseInt(id));
          setIsBookmarked(bookmarked);
        });
    }

    // ✅ FETCH SIMILAR ROOMS
    fetch(`http://127.0.0.1:8000/api/rooms/${id}/recommend/`)

      .then(res => res.json())
      .then(data => setRecommendedRooms(data))
      .catch(err => {
        console.error('Failed to fetch similar rooms:', err);
      });

  }, [id]);

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
    if (!token) {
      setErrorMessage('🔒 You must be logged in to submit a review.');
      return;
    }

    if (hasReviewed) {
      setErrorMessage('✅ You have already submitted a review for this room.');
      return;
    }

    fetch(`http://127.0.0.1:8000/api/rooms/${id}/review/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating, comment })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(JSON.stringify(err)); });
        }
        return res.json();
      })
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
        if (err.message.includes("token_not_valid")) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          toast.error('🔒 Session expired. Please log in again.');
        } else if (err.message.includes("You have already reviewed this room")) {
          toast.warn('⚠️ You have already reviewed this room.');
        } else {
          toast.error('❌ Error submitting review. Please try again.');
        }
      });
  };

  const handleBookmarkToggle = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error("🔒 Please login to bookmark rooms.");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/rooms/bookmark/${id}/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        const newStatus = !isBookmarked;
        setIsBookmarked(newStatus);
        toast.success(newStatus ? '✅ Added to bookmark!' : '💔 Removed from bookmark!');
      })
      .catch(() => {
        toast.error('❌ Failed to update bookmark.');
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">{room.title}</h1>
      <p className="text-gray-700 mb-1">{room.description}</p>
      <p className="text-purple-700 font-semibold">Price: Rs. {room.price}</p>
      <p className="text-gray-500">Location: {room.location}</p>
      <p className="text-gray-500 mb-4">Contact: {room.contact_number}</p>

      <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-medium mb-6">
        🗺️ Map integration coming soon...
      </div>

      {isAuthenticated && (
        <div className="flex gap-4 mb-6">
          <a
            href={`tel:+977${room.contact_number}`}
            className="inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
          >
            📞 Call Room Owner
          </a>
          <button
            onClick={handleBookmarkToggle}
            className={`px-6 py-2 rounded-md transition ${
              isBookmarked ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-800'
            }`}
          >
            {isBookmarked ? '🔖 Bookmarked' : '➕ Bookmark'}
          </button>
        </div>
      )}

      {/* ⭐ Reviews Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-pink-700 mb-4">Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="mb-4 p-4 bg-white rounded-xl shadow">
              <p className="text-sm text-gray-600">By: {review.user}</p>
              <p className="text-yellow-500 mb-1">Rating: {'⭐'.repeat(review.rating)}</p>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>

      {/* ✏️ Add Review Form */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2 text-purple-700">Leave a Review</h3>
        {!isAuthenticated ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded shadow mb-4">
            🔐 Please login to leave a review.
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 shadow">
                {errorMessage}
              </div>
            )}
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className={`text-2xl cursor-pointer ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mb-3"
              rows="3"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded hover:opacity-90"
              onClick={handleSubmitReview}
            >
              Submit Review
            </button>
          </>
        )}
      </div>

      {/* 🧠 Similar Rooms Section */}
      {recommendedRooms.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">🏠 Similar Rooms You Might Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedRooms.map(r => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
