// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-700">Room Finder</Link>
      <div className="space-x-4">
        <Link to="/login" className="text-gray-700 hover:text-blue-500">Login</Link>
        <Link to="/register" className="text-gray-700 hover:text-blue-500">Register</Link>
        <Link to="/about" className="text-gray-700 hover:text-blue-500">About</Link>
      </div>
    </nav>
  );
};

export default Navbar;
