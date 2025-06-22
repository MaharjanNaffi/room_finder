// src/components/RoomCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const RoomCard = ({ room }) => {
  return (
    <Link to={`/room/${room.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300">
        <h2 className="text-xl font-semibold mb-2">{room.title}</h2>
        <p className="text-gray-600 mb-2">{room.description.slice(0, 60)}...</p>
        <p className="text-blue-700 font-semibold">Rs. {room.price}</p>
        <p className="text-sm text-gray-500">📍 {room.location}</p>
      </div>
    </Link>
  );
};

export default RoomCard;
