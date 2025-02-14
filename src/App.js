import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import EventForm from './components/EventForm/EventForm';  // Updated path


function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Event Management Form</h1>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/event-form">Create Event</Link></li>
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<div><h2>Welcome to the Event Management Dashboard</h2><p>Navigate to the <Link to="/event-form">Create Event</Link> page to add a new event.</p></div>} />
            {/* Correctly rendering EventForm on the /event-form path */}
            <Route path="/event-form" element={<EventForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
