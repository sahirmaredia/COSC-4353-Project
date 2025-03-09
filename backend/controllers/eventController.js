const { events, matches, volunteers } = require('../data/mockData');

// Get all events
const getAllEvents = (req, res) => {
    try {
        return res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// Get event by ID
const getEventById = (req, res) => {
    try {
        const { id } = req.params;
        const event = events.find(e => e.id === id);

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
const createEvent = (req, res) => {
    try {
        const { name, description, date, location, requiredSkills, urgency } = req.body;

        // Generate a unique ID (in a real app, this would be handled by the database)
        const id = `e${events.length + 1}`;

        const newEvent = {
            id,
            name,
            description,
            date,
            location,
            requiredSkills,
            urgency,
            status: 'Active',
            createdAt: new Date().toISOString().split('T')[0]
        };

        // In a real app, this would be a database insert
        events.push(newEvent);

        return res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({ error: 'Failed to create event' });
    }
};

// Update event
const updateEvent = (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, date, location, requiredSkills, urgency, status } = req.body;

        const eventIndex = events.findIndex(e => e.id === id);

        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Update the event (in a real app, this would be a database update)
        events[eventIndex] = {
            ...events[eventIndex],
            name: name || events[eventIndex].name,
            description: description || events[eventIndex].description,
            date: date || events[eventIndex].date,
            location: location || events[eventIndex].location,
            requiredSkills: requiredSkills || events[eventIndex].requiredSkills,
            urgency: urgency || events[eventIndex].urgency,
            status: status || events[eventIndex].status
        };

        return res.status(200).json(events[eventIndex]);
    } catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({ error: 'Failed to update event' });
    }
};

// Delete event
const deleteEvent = (req, res) => {
    try {
        const { id } = req.params;

        const eventIndex = events.findIndex(e => e.id === id);

        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // In a real app, this would be a database delete
        events.splice(eventIndex, 1);

        return res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({ error: 'Failed to delete event' });
    }
};

// Get volunteers for an event
const getEventVolunteers = (req, res) => {
    try {
        const { id } = req.params;

        // Check if event exists
        const event = events.find(e => e.id === id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get all matches for this event
        const eventMatches = matches.filter(match => match.eventId === id);

        // Build volunteer list with details
        const eventVolunteers = eventMatches.map(match => {
            const volunteer = volunteers.find(v => v.id === match.volunteerId);

            if (!volunteer) {
                return {
                    matchId: match.id,
                    volunteerId: match.volunteerId,
                    volunteerName: 'Unknown Volunteer',
                    status: match.status,
                    matchScore: match.matchScore
                };
            }

            // Don't include sensitive volunteer information
            return {
                matchId: match.id,
                volunteerId: volunteer.id,
                volunteerName: volunteer.name,
                location: volunteer.location,
                skills: volunteer.skills,
                status: match.status,
                matchScore: match.matchScore
            };
        });

        return res.status(200).json(eventVolunteers);
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