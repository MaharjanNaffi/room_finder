// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://127.0.0.1:8000/api/userauth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.access) {
        // Save tokens to localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('email', email);

        alert("Login successful!");
        navigate('/');
      } else {
        alert("Login failed. Check credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-lg p-8 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
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
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
