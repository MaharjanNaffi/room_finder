// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import RoomCard from '../components/RoomCard';
import MapView from '../components/MapView';
import '../index.css';
import { useLocation, useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [budget, setBudget] = useState('');
  const [roomType, setRoomType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const roomsPerPage = 12;

  // Read URL query params on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
    setBudget(params.get('budget') || '');
    setRoomType(params.get('roomType') || '');
    setCurrentPage(parseInt(params.get('page')) || 1);
  }, [location.search]);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);

      let url = `http://127.0.0.1:8000/api/rooms/?search=${search}&page=${currentPage}`;
      if (budget) url += `&max_price=${budget}`;
      if (roomType) url += `&room_type=${roomType}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setRooms(data.results || data);
        setTotalPages(Math.ceil((data.count || (data.length || 0)) / roomsPerPage));
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }

      try {
        const responseAll = await fetch(`http://127.0.0.1:8000/api/rooms/rooms/all/`);
        const dataAll = await responseAll.json();
        setAllRooms(dataAll);
      } catch (err) {
        console.error('Error fetching all rooms for map:', err);
      }
    };

    fetchRooms();

    // Update URL query params
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (budget) params.set('budget', budget);
    if (roomType) params.set('roomType', roomType);
    params.set('page', currentPage);
    navigate({ pathname: '/home', search: params.toString() }, { replace: true });
  }, [search, budget, roomType, currentPage, navigate]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const getPagination = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l > 2) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-600">
          Room Finder
        </h1>
        <p className="text-base sm:text-lg mt-2 text-gray-600">Find clean, affordable rooms near you</p>
      </header>

      {/* 🔍 Filter Section */}
      <section className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 mb-10">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            placeholder="📍Search by location"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            type="number"
            placeholder="💰Max Budget (Rs)"
            min="5000"
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
            <option value="">🏘️ All Room Types</option>
            <option value="1BHK">1BHK</option>
            <option value="2BHK">2BHK</option>
            <option value="3BHK">3BHK</option>
            <option value="4BHK">4BHK</option>
          </select>
        </div>
      </section>

      {/* 🏠 Room List */}
      {loading ? (
        <p className="text-center text-gray-600">Loading rooms...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Array.isArray(rooms) && rooms.length > 0 ? (
            rooms.map(room => <RoomCard key={room.id} room={room} />)
          ) : (
            <p className="col-span-full text-center text-gray-500">No rooms found.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            &lt;
          </button>
          {getPagination().map((page, idx) =>
            page === '...' ? (
              <span key={idx} className="px-3 py-1">...</span>
            ) : (
              <button
                key={idx}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            &gt;
          </button>
        </div>
      )}

      {/* 🗺️ Map Section */}
      <section className="mt-16 w-full max-w-6xl mx-auto px-2 sm:px-4">
        <h2 className="text-2xl sm:text-2xl font-bold mb-4 text-gray-700">Map View</h2>
        <div className="rounded-xl overflow-hidden">
          <MapView rooms={allRooms} />
        </div>
      </section>

      {/* Scroll-to-top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          ⬆️
        </button>
      )}
    </div>
  );
}

export default HomePage;
