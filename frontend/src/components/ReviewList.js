// src/components/ReviewList.js
import React from 'react';

const ReviewList = ({ reviews }) => {
  if (reviews.length === 0) return <p className="text-sm text-gray-400 mt-4">No reviews yet.</p>;

  return (
    <div className="mt-4">
      <h3 className="text-md font-semibold text-blue-700 mb-1">Recent Reviews:</h3>
      <ul className="space-y-2">
        {reviews.slice(0, 2).map((review) => (
          <li key={review.id} className="text-sm bg-gray-50 p-2 rounded shadow-sm">
            <p className="text-gray-800">✍️ {review.comment}</p>
            <p className="text-yellow-600">⭐ {review.rating} by {review.user}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewList;
