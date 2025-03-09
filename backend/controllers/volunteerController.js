const { volunteers, matches, events } = require('../data/mockData');

// Get all volunteers
const getAllVolunteers = (req, res) => {
    try {
        // In a real application, you might want to exclude sensitive information like passwords
        const sanitizedVolunteers = volunteers.map(({ password, ...rest }) => rest);
        return res.status(200).json(sanitizedVolunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        return res.status(500).json({ error: 'Failed to fetch volunteers' });
    }
};

// Get volunteer by ID
const getVolunteerById = (req, res) => {
    try {
        const { id } = req.params;
        const volunteer = volunteers.find(v => v.id === id);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Don't send the password back
        const { password, ...sanitizedVolunteer } = volunteer;
        return res.status(200).json(sanitizedVolunteer);
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        return res.status(500).json({ error: 'Failed to fetch volunteer' });
    }
};

// Create new volunteer
const createVolunteer = (req, res) => {
    try {
        const { name, email, password, skills, location, availability, preferences } = req.body;

        // Check if email is already in use
        if (volunteers.some(v => v.email === email)) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Generate a unique ID (in a real app, this would be handled by the database)
        const id = `v${volunteers.length + 1}`;

        const newVolunteer = {
            id,
            name,
            email,
            password, // In a real app, this would be hashed
            skills,
            location,
            availability,
            preferences,
            createdAt: new Date().toISOString().split('T')[0]
        };

        // In a real app, this would be a database insert
        volunteers.push(newVolunteer);

        // Don't send the password back
        const { password: _, ...sanitizedVolunteer } = newVolunteer;
        return res.status(201).json(sanitizedVolunteer);
    } catch (error) {
        console.error('Error creating volunteer:', error);
        return res.status(500).json({ error: 'Failed to create volunteer' });
    }
};

// Update volunteer
const updateVolunteer = (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, skills, location, availability, preferences } = req.body;

        const volunteerIndex = volunteers.findIndex(v => v.id === id);

        if (volunteerIndex === -1) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Check if trying to update to an email that's already in use by someone else
        if (email && email !== volunteers[volunteerIndex].email &&
            volunteers.some(v => v.email === email && v.id !== id)) {
            return res.status(400).json({ error: 'Email already in use by another volunteer' });
        }

        // Update the volunteer (in a real app, this would be a database update)
        volunteers[volunteerIndex] = {
            ...volunteers[volunteerIndex],
            name: name || volunteers[volunteerIndex].name,
            email: email || volunteers[volunteerIndex].email,
            skills: skills || volunteers[volunteerIndex].skills,
            location: location || volunteers[volunteerIndex].location,
            availability: availability || volunteers[volunteerIndex].availability,
            preferences: preferences || volunteers[volunteerIndex].preferences
        };

        // Don't send the password back
        const { password, ...sanitizedVolunteer } = volunteers[volunteerIndex];
        return res.status(200).json(sanitizedVolunteer);
    } catch (error) {
        console.error('Error updating volunteer:', error);
        return res.status(500).json({ error: 'Failed to update volunteer' });
    }
};

// Delete volunteer
const deleteVolunteer = (req, res) => {
    try {
        const { id } = req.params;

        const volunteerIndex = volunteers.findIndex(v => v.id === id);

        if (volunteerIndex === -1) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // In a real app, this would be a database delete
        volunteers.splice(volunteerIndex, 1);

        return res.status(200).json({ message: 'Volunteer deleted successfully' });
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        return res.status(500).json({ error: 'Failed to delete volunteer' });
    }
};

// Get volunteer history
const getVolunteerHistory = (req, res) => {
    try {
        const { id } = req.params;

        // Check if volunteer exists
        const volunteer = volunteers.find(v => v.id === id);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Get all matches for this volunteer
        const volunteerMatches = matches.filter(match => match.volunteerId === id);

        // Build history with event details
        const history = volunteerMatches.map(match => {
            const event = events.find(e => e.id === match.eventId);

            return {
                matchId: match.id,
                volunteerId: match.volunteerId,
                volunteerName: volunteer.name,
                eventId: match.eventId,
                eventName: event ? event.name : 'Unknown Event',
                eventDate: event ? event.date : 'Unknown Date',
                location: event ? event.location : 'Unknown Location',
                requiredSkills: event ? event.requiredSkills : [],
                urgency: event ? event.urgency : 'Unknown',
                status: match.status,
                matchScore: match.matchScore,
                createdAt: match.createdAt,
                updatedAt: match.updatedAt
            };
        });

        return res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching volunteer history:', error);
        return res.status(500).json({ error: 'Failed to fetch volunteer history' });
    }
};

module.exports = {
    getAllVolunteers,
    getVolunteerById,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getVolunteerHistory
};