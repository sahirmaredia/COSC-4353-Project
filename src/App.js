import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Notifications from "./components/Notifications";
import VolunteerHistory from "./components/VolunteerHistory";
import VolunteerMatchingForm from "./components/VolunteerMatchingForm";
import EventManagementForm from "./components/EventManagementForm";
import ProfileForm from "./components/ProfileForm";
import './App.css';

function App() {
  const userRole = localStorage.getItem("userRole");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/volunteer-history" element={<VolunteerHistory />} />

        {/* Protect /event-management route */}
        <Route
          path="/event-management"
          element={userRole === "admin" ? <EventManagementForm /> : <Navigate to="/profile" />}
        />

        <Route
          path="/volunteer-matching"
          element={userRole === "admin" ? <VolunteerMatchingForm /> : <Navigate to="/profile" />}
        />

        <Route path="/profile-form" element={<ProfileForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
