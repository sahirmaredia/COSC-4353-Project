// setting up Node.js
const express = require('express');
const app = express();

app.use(express.json());

// hard coded data for notifications
let notifications = [
    { id: 1, userID: 1, message: "You've successfully signed up for the Food Bank Event!", type: "new-assignment", timestamp: "2025-03-06T12:00:00Z" },
    { id: 2, userID: 2, message: "Food Drive starts in an hour!", type: "reminder", timestamp: "2025-03-07T10:00:00Z" }
];

// get notifications 
app.get('/api/notifications/:userID', (req,res) => {
    const userID = parseInt(req.params.userID);
    const userNotifs = notifications.filter(notification => notification.userID === userID);
    res.json(userNotifs);
});

// creates new notifications
app.post('/api/notifications', (req,res) => {
    const {userID, message, type} = req.body;
    if (!userID || !message || !type) {
        return res.status(400).json({ error: "Missing required fields: userID, message, type" });
    }

    const newNotif = {
        id: notifications.length + 1,
        userID,
        message,
        type,
        timestamp: new Date().toISOString()
    };
    notifications.push(newNotif);
    res.status(201).json(newNotif);
});

// deletes notifications
app.delete('/api/notifications/:id', (req, res) => {
    const id = parseInt(req.params.id);
    notifications = notifications.filter(notification => notification.id !== id);
    res.status(204).send(); // returns nothing
});

// starts the server
const PORT = 5001;
/* app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); */

// export app for testing
module.exports = app;
