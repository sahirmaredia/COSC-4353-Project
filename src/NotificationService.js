/* Notifications Functions */

// new event notification
const sendNewEventNotif = (userID, nameEvent) => {
    const message = `You've successfully signed up for the "${nameEvent}" event.`;
    const type = "new-assignment";
    fetch('http://localhost:5001/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, message, type })
    });
};

// reminder notification
const sendReminder = (userID, nameEvent) => {
    const message = `Reminder: The event "${nameEvent}" is about to start!`;
    const type = "reminder";
    fetch('http://localhost:5001/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, message, type })
    });
}

// event update notification
const sendUpdate = (userID, nameEvent) => {
    const message = `The event "${nameEvent}" has been updated.`;
    const type = "update";
    fetch('http://localhost:5001/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID, message, type })
    });
};
