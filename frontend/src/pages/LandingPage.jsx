// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 flex flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-6">
        Welcome to Room Finder 🏠
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl leading-relaxed mb-8">
        Find clean, affordable rooms in Kathmandu Valley with just a few clicks.
        Filter by location, budget, or type — and explore all listings visually on a map.
      </p>
      <Link
        to="/home"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition"
      >
        Start Searching
      </Link>
    </div>
  );
};

export default LandingPage;
