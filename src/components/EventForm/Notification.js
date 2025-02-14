import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    // Automatically close notification after 7 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 7000);
    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>X</button>
    </div>
  );
}; 

export default Notification;
