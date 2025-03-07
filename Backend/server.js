const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Event = require('./models/Event');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect('mongodb://127.0.0.1:27017/eventManagement')
        .then(() => console.log('✅ MongoDB Connected'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// Routes
app.get('/', (req, res) => {
    res.send('Backend is running...');
});

app.post('/events', async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(400).json({ error: error.message });
    }
});

app.put('/events/:id', async (req, res) => {
    try {
        // ✅ Find and update the event
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // ✅ If event does not exist, return 404
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: error.message });
    }
});



// Fetch all events
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/events/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' }); // ✅ Ensure response matches test
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: error.message });
    }
});


// ✅ Fix: Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// ✅ Fix: Export only `app`, not the server
module.exports = app;
