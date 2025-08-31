// src/components/RoomCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RoomCard = ({ room }) => {
  return (
    <Link to={`/rooms/${room.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300 cursor-pointer">
        <h2 className="text-xl font-semibold mb-2">{room.title}</h2>
        <p className="text-gray-600 mb-1">{room.description.slice(0, 60)}...</p>
        <p className="text-purple-700 font-medium mb-1">🏘️ {room.room_type}</p>
        <p className="text-blue-700 font-semibold mb-1">Rs. {room.price}</p>
        <p className="text-sm text-gray-500">📍 {room.location}</p>
      </div>
    </Link>
  );
};

export default RoomCard;
