import React from 'react';
import Navbar from './Navbar';
import '../App.css';

const Home = () => {
  return (
    <div>
      <Navbar />
      <section className="welcome">
        <h1>Welcome to Volunteer App!</h1>
        <p>Sign up and find volunteering opportunities near you!</p>
        <div className="links">
          <a href="/login" className="btn">Login</a>
          <a href="/register" className="btn">Register</a>
        </div>
      </section>

      <section id="events" className="events-section">
        <h2>Upcoming Events</h2>
        <div className="event-list">
          <div className="event-card">
            <h3>Animal Shelter</h3>
            <p>Date: February 20, 2025</p>
            <p>Location: Pals Rescue</p>
          </div>
          <div className="event-card">
            <h3>Food Bank</h3>
            <p>Date: March 1, 2025</p>
            <p>Location: City Food Bank</p>
          </div>
          <div className="event-card">
            <h3>Charity Run</h3>
            <p>Date: March 10, 2025</p>
            <p>Location: Downtown</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Volunteer App by Sahir Maredia, Muna Onuorah, Nahom Teka, and Nhi Truong</p>
      </footer>
    </div>
  );
};

export default Home;