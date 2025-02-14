import React, { useState } from 'react';
import Notification from '../EventForm/Notification';

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = (message, type) => {
    const newNotification = {
      id: Date.now(), // Unique ID for each notification
      message,
      type, // 'success', 'error', 'info'
    };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
  };

  // Close a specific notification
  const closeNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() => closeNotification(notif.id)}
        />
      ))}
      {/* Example of adding a notification on demand */}
      <button
        onClick={() => addNotification('Success! Your event has been created.', 'success')}
      >
        Show Success
      </button>
      <button
        onClick={() => addNotification('Error! Something went wrong.', 'error')}
      >
        Show Error
      </button>
    </div>
  );
};

export default NotificationContainer;
