// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";
import { toast } from "react-toastify";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    logout();
    toast.info("👋 Logged out");
    closeMenu();
    navigate("/home");
  };

  const handleHomeClick = () => {
    closeMenu();
    navigate("/home", { replace: true }); // resets HomePage filters
  };

  const navLinkStyles =
    "text-white hover:text-yellow-300 transition duration-200";

  return (
    <nav className="bg-purple-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button onClick={handleHomeClick} className="text-2xl font-bold text-white hover:opacity-90">
          Room Finder
        </button>

        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <ul
          className={`${menuOpen ? "block" : "hidden"} md:flex items-center space-y-4 md:space-y-0 md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-purple-700 md:bg-transparent px-6 md:px-0 py-4 md:py-0 z-40 text-lg text-center md:text-left`}
        >
          <li><button onClick={handleHomeClick} className={navLinkStyles}>Home</button></li>
          <li><Link to="/about" onClick={closeMenu} className={navLinkStyles}>About Us</Link></li>
          <li><Link to="/contact" onClick={closeMenu} className={navLinkStyles}>Contact</Link></li>

          {isAuthenticated ? (
            <>
              <li><Link to="/profile" onClick={closeMenu} className={navLinkStyles}>Profile</Link></li>
              <li>
                <button onClick={handleLogout} className={`${navLinkStyles} bg-transparent border-none`}>
                  Logout
                </button>
              </li>
              <li className="text-white font-medium text-sm">
                Hello, {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Guest"}
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={closeMenu} className={navLinkStyles}>Login</Link></li>
              <li><Link to="/register" onClick={closeMenu} className={navLinkStyles}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
