// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-16 p-8 text-gray-700">
      <div className="flex flex-col sm:flex-row justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold mb-4">📍 RoomFinder</div>
          <div className="flex gap-3 text-2xl">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-linkedin"></i>
            <i className="fab fa-instagram"></i>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {["Topic", "Topic", "Topic"].map((topic, idx) => (
            <div key={idx}>
              <p className="font-semibold">{topic}</p>
              <p className="text-sm">Page</p>
              <p className="text-sm">Page</p>
              <p className="text-sm">Page</p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
