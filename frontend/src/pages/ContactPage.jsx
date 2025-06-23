// src/pages/ContactPage.jsx
import React from "react";
import sresta from "../assets/sresta.jpg";
import prastab from "../assets/prastab.jpg";
import nafisha from "../assets/nafisha.png";

const teamMembers = [
  {
    name: "Sresta Sharma",
    phone: "9849998816",
    image: sresta,
  },
  {
    name: "Prastab Maharjan",
    phone: "9800000003",
    image: prastab,
  },
  {
    name: "Nafisha Maharjan",
    phone: "9840389611",
    image: nafisha,
  },
];

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-100 py-20 px-6">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-purple-700 mb-10">
        Meet the Team 👥
      </h1>
      <p className="text-center text-lg text-gray-700 max-w-2xl mx-auto mb-12">
        We are a dedicated group of students who created Room Finder to make it easier for people
        in Kathmandu to find rooms based on budget, location, and preference. Feel free to reach out to us!
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-10 max-w-5xl mx-auto">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="bg-white shadow-xl rounded-2xl p-6 text-center w-72"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-md"
            />
            <h2 className="text-xl font-semibold text-purple-700">{member.name}</h2>
            <p className="text-gray-600 mt-2">📞 {member.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactPage;
