import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:8000/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      alert("Registration successful! Please login.");
      navigate('/login');
    } else {
      alert("Registration failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-lg p-8 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-4 py-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-4 py-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
