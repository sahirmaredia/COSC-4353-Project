import React from 'react';
import { Link } from 'react-router-dom'; // For navigation
import '../App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Volunteer App</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;