import React from 'react';
import { Link } from 'react-router-dom';

// const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

const Header = () => (
  <header className="bg-white shadow-md py-4 mb-6">
    <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
      {/* <Link to="/" className="text-2xl font-bold text-blue-700">RoomFinder</Link> */}
      <div className="space-x-4">
        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        <Link to="/register" className="text-purple-600 hover:underline">Register</Link>
      </div>
    </div>
  </header>
);

export default Header;
