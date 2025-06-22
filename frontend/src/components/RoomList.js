// src/components/RoomList.js
import React from 'react';
import RoomCard from './RoomCard';

const RoomList = ({ rooms }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.length > 0 ? (
        rooms.map(room => <RoomCard key={room.id} room={room} />)
      ) : (
        <p className="col-span-full text-center text-gray-500">No rooms found.</p>
      )}
    </div>
  );
};

export default RoomList;
