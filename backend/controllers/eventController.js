const eventModel = require('../models/eventModel');

// Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await eventModel.getAllEvents();
        return res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// Get event by ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await eventModel.getEventById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        return res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return res.status(500).json({ error: 'Failed to fetch event' });
    }
};

// Create new event
const createEvent = async (req, res) => {
    try {
        const { name, description, date, location, requiredSkills, urgency } = req.body;

        const newEvent = await eventModel.createEvent({
            name,
            description,
            date,
            location,
            requiredSkills,
            urgency
        });

        return res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ error: 'Failed to create event' });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, date, location, requiredSkills, urgency, status } = req.body;

        // Check if event exists
        const event = await eventModel.getEventById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = await eventModel.updateEvent(id, {
            name,
            description,
            date,
            location,
            requiredSkills,
            urgency,
            status
        });

        return res.status(200).json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({ error: 'Failed to update event' });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if event exists
        const event = await eventModel.getEventById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        await eventModel.deleteEvent(id);

        return res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({ error: 'Failed to delete event' });
    }
};

// Get volunteers for an event
const getEventVolunteers = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if event exists
        const event = await eventModel.getEventById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const volunteers = await eventModel.getEventVolunteers(id);

        return res.status(200).json(volunteers);
    } catch (error) {
        console.error('Error fetching event volunteers:', error);
        return res.status(500).json({ error: 'Failed to fetch event volunteers' });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventVolunteers
};