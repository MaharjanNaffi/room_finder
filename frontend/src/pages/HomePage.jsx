import React, { useEffect, useState } from 'react';
import RoomCard from '../components/RoomCard';
import '../index.css';

<div className="flex justify-end gap-4 mb-6">
  <a href="/login" className="text-blue-600 font-semibold hover:underline">Login</a>
  <a href="/register" className="text-purple-600 font-semibold hover:underline">Register</a>
</div>


function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [budget, setBudget] = useState('');
  const [roomType, setRoomType] = useState('');

  useEffect(() => {
    let url = `http://127.0.0.1:8000/api/rooms/?search=${search}`;

    if (budget) {
      url += `&max_price=${budget}`;
    }
    if (roomType) {
      url += `&room_type=${roomType}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setRooms(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      });
  }, [search, budget, roomType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-600">
          Room Finder
        </h1>
        <p className="text-lg mt-2 text-gray-600">Find clean, affordable rooms near you</p>
      </header>

      {/* 🔍 Filter Section */}
      <section className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 mb-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Search by keyword or location"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Budget (Rs)"
            min="1000"
            step="100"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          />


          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={roomType}
            onChange={e => setRoomType(e.target.value)}
          >
            <option value="">All Room Types</option>
            <option value="Single">1BHK</option>
            <option value="Shared">2BHK</option>
            <option value="Flat">3BHK</option>
            <option value="Hostel">4BHK</option>
          </select>
        </div>
      </section>

      {/* 🏠 Room List */}
      {loading ? (
        <p className="text-center text-gray-600">Loading rooms...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {rooms.length > 0 ? (
            rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No rooms found.</p>
          )}
        </div>
      )}

      {/* 🗺️ Map Placeholder */}
      <section className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Map View (Coming Soon)</h2>
        <div className="h-64 bg-gradient-to-br from-purple-200 via-blue-100 to-pink-200 rounded-xl flex items-center justify-center text-gray-600">
          Map integration placeholder
        </div>
      </section>
    </div>
  );
}

export default HomePage;
