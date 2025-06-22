// src/components/SearchBar.jsx
import React from 'react';

const SearchBar = () => {
  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-md mt-6 text-center max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Search Rooms Using :</h2>
      <div className="flex flex-wrap justify-center gap-4">
        <input className="px-4 py-2 border rounded-lg w-48" placeholder="Location 📍" />
        <input className="px-4 py-2 border rounded-lg w-48" placeholder="Select Budget 💰" />
        <input className="px-4 py-2 border rounded-lg w-48" placeholder="Room Type 🏘️" />
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Search</button>
      </div>
    </div>
  );
};

export default SearchBar;
