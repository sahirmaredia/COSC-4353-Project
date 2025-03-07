import React from 'react';
import Navbar from './Navbar';
import '../App.css';

const About = () => {
  return (
    <div>
      <Navbar />
      <section className="about-section">
        <h2>About Us</h2>
        <p>Welcome to Volunteer App, where we help you give back to your communities.</p>
        <div className="team">
          <h3>Founded by Our Team</h3>
          <div className="team-members">
            <div className="team-member">
              <h4>Sahir Maredia</h4>
              <p>Member 1</p>
            </div>
            <div className="team-member">
              <h4>Nhi Truong</h4>
              <p>Member 2</p>
            </div>
            <div className="team-member">
              <h4>Nahom Teka</h4>
              <p>Member 3</p>
            </div>
            <div className="team-member">
              <h4>Muna Onuorah</h4>
              <p>Member 4</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;