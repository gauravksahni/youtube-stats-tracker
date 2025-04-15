import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaYoutube, FaHome, FaPlus } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FaYoutube className="logo-icon" />
        <span className="logo-text">YouTube Stats Tracker</span>
      </div>
      
      <ul className="navbar-links">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">
            <FaHome className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Link>
        </li>
        <li className={location.pathname === '/add-channel' ? 'active' : ''}>
          <Link to="/add-channel">
            <FaPlus className="nav-icon" />
            <span className="nav-text">Add Channel</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
