import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Runs when app loads or refreshes
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          email: decoded.email || '',
          username: decoded.username || decoded.email?.split('@')[0] || 'User',
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Invalid token:", error);
        logout();
      }
    }
  }, []);

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      const username = decoded.username || decoded.email?.split('@')[0] || 'User';

      setUser({ email: decoded.email || '', username });
      setIsAuthenticated(true);
      localStorage.setItem('access_token', token);
    } catch (error) {
      console.error("❌ Login failed - invalid token:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
