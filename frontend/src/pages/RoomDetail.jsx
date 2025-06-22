// src/pages/RoomDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/rooms/${id}/`)
      .then(res => res.json())
      .then(data => setRoom(data));

    fetch(`http://127.0.0.1:8000/api/rooms/${id}/reviews/`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, [id]);

  const handleRatingClick = (value) => {
    setRating(value);
  };

 const handleSubmitReview = () => {
  const token = localStorage.getItem('token'); // assume token is stored at login

  if (!token) {
    alert('You must be logged in to submit a review.');
    return;
  }

  fetch(`http://127.0.0.1:8000/api/rooms/${id}/review/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      rating,
      comment
    })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to submit review');
      }
      return res.json();
    })
    .then(data => {
      setReviews(prev => [data, ...prev]);
      setRating(0);
      setComment('');
    })
    .catch(err => {
      console.error(err);
      alert('Error submitting review');
    });
};

  if (!room) return <div className="text-center mt-10">Loading room...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">{room.title}</h1>
      <p className="text-gray-700 mb-1">{room.description}</p>
      <p className="text-purple-700 font-semibold">Price: Rs. {room.price}</p>
      <p className="text-gray-500">Location: {room.location}</p>
      <p className="text-gray-500 mb-4">Contact: {room.contact_number}</p>

      {/* ⭐ Review Section */}
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

      {/* ✏️ Add Review */}
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2 text-purple-700">Leave a Review</h3>
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
      </div>
    </div>
  );
};

export default RoomDetail;
