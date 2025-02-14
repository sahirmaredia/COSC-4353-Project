import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventForm.css';
import Notification from './Notification'; 



const EventForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    eventLocation: '',
    requiredSkills: [],
    urgency: '',
    eventDate: ''
  });

  const [notification, setNotification] = useState(null); // For holding the notification
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'requiredSkills') {
      const selectedSkills = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prevData) => ({ ...prevData, [name]: selectedSkills }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Display notification for different scenarios
  const showNotification = (type, message) => {
    setNotification({
      message,
      type, // new-assignment, update, reminder
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.eventName || !formData.eventDescription || !formData.eventLocation || formData.requiredSkills.length === 0 || !formData.urgency || !formData.eventDate) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // Example of triggering notification based on event type
    // Show notification for a new event assignment
    showNotification('new-assignment', `New event "${formData.eventName}" has been assigned!`);

    // Simulate form submission
    setTimeout(() => {
      navigate('/'); // Redirect to home page after success
    }, 1000);
  };

  // Simulate event update (for demonstration purposes)
  const handleUpdate = () => {
    showNotification('update', `The event "${formData.eventName}" has been updated.`);
  };

  // Check if the event is coming up and show reminder notification (if within 2 days)
  const checkEventReminder = () => {
    const currentDate = new Date();
    const eventDate = new Date(formData.eventDate);
    const timeDiff = eventDate - currentDate;
    const daysUntilEvent = timeDiff / (1000 * 3600 * 24);

    if (daysUntilEvent <= 2 && daysUntilEvent >= 0) {
      // Show reminder notification if event is within 2 days
      showNotification('reminder', `Reminder: The event "${formData.eventName}" is coming up soon!`);
    }
  };

  useEffect(() => {
    checkEventReminder();
  }, [formData.eventDate]); // Re-check when event date changes

  return (
    <div className="event-form-container">
      <h2>Event Management Form</h2>
      <form className="event-form" onSubmit={handleSubmit}>
        {errorMessage && <p className="error-msg">{errorMessage}</p>}

        {/* Event Name */}
        <div className="form-control">
          <label>Event Name:</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            maxLength="100"
            required
          />
        </div>

        {/* Event Description */}
        <div className="form-control">
          <label>Event Description:</label>
          <textarea
            name="eventDescription"
            value={formData.eventDescription}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Event Location */}
        <div className="form-control">
          <label>Event Location:</label>
          <textarea
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {/* Required Skills */}
        <div className="form-control">
          <label>Required Skills:</label>
          <select
            name="requiredSkills"
            multiple
            value={formData.requiredSkills}
            onChange={handleChange}
            required
          >
            <option value="Communication">Communication</option>
            <option value="Teamwork">Teamwork</option>
            <option value="Problem Solving">Problem Solving</option>
            <option value="Technical">Technical</option>
            <option value="Leadership">Leadership</option>
            <option value="Project Management">Project Management</option>
          </select>
        </div>

        {/* Urgency */}
        <div className="form-control">
          <label>Urgency:</label>
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
          >
            <option value="">Select Urgency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Event Date */}
        <div className="form-control">
          <label>Event Date:</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Create Event</button>
        <button type="button" onClick={handleUpdate}>Update Event</button> {/* Button for updating event */}
      </form>

      {/* Show notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type} // Determine type: new-assignment, update, reminder
          onClose={() => setNotification(null)} // Close notification when dismissed
        />
      )}
    </div>
  );
};

export default EventForm;
