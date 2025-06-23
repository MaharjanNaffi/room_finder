// src/pages/AboutUs.jsx
import React from "react";
import wall from "../assets/wall.jpg"; // 🖼️ Replace with your actual logo path

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-100 flex flex-col items-center justify-center text-center px-6 py-20">
      <img
        src={wall}
        alt="Project Logo"
        className="w-32 md:w-48 mb-8 rounded-xl shadow-lg"
      />

      <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
        About Room Finder
      </h1>
      <p className="text-gray-700 text-lg max-w-2xl leading-relaxed">
        Room Finder is a modern web application built for the residents of Kathmandu Valley,
        helping them discover clean, affordable rooms through smart search filters and
        geolocation-based recommendations. Built with Django and React, the system supports
        secure login, real-time room listings, and a map-based view — with a user-friendly design.
      </p>
    </div>
  );
};

export default AboutUs;
