const { volunteers, events, matches } = require('../data/mockData');
const matchingService = require('../services/matchingService');

// Get all matches
const getAllMatches = (req, res) => {
    try {
        return res.status(200).json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        return res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

// Get match by ID
const getMatchById = (req, res) => {
    try {
        const { id } = req.params;
        const match = matches.find(m => m.id === id);

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        return res.status(200).json(match);
    } catch (error) {
        console.error('Error fetching match:', error);
        return res.status(500).json({ error: 'Failed to fetch match' });
    }
};

// Create a match manually
const createMatch = (req, res) => {
    try {
        const { volunteerId, eventId } = req.body;

        // Check if volunteer exists
        const volunteer = volunteers.find(v => v.id === volunteerId);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Check if event exists
        const event = events.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if match already exists
        const existingMatch = matches.find(m =>
            m.volunteerId === volunteerId && m.eventId === eventId
        );

        if (existingMatch) {
            return res.status(400).json({
                error: 'Match already exists',
                matchId: existingMatch.id
            });
        }

        // Calculate match score
        const matchScore = matchingService.calculateMatchScore(volunteer, event);

        // Generate a unique ID (in a real app, this would be handled by the database)
        const id = `m${matches.length + 1}`;

        const now = new Date().toISOString().split('T')[0];

        const newMatch = {
            id,
            volunteerId,
            eventId,
            status: 'Matched',
            matchScore,
            createdAt: now,
            updatedAt: now
        };

        // In a real app, this would be a database insert
        matches.push(newMatch);

        // Replace notification with console log
        console.log(`Match notification sent to volunteer ${volunteerId} for event ${event.name}`);

        return res.status(201).json(newMatch);
    } catch (error) {
        console.error('Error creating match:', error);
        return res.status(500).json({ error: 'Failed to create match' });
    }
};

// Update match status
const updateMatchStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Matched', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const matchIndex = matches.findIndex(m => m.id === id);

        if (matchIndex === -1) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Update the match status
        matches[matchIndex] = {
            ...matches[matchIndex],
            status,
            updatedAt: new Date().toISOString().split('T')[0]
        };

        // Replace notification with console log
        const match = matches[matchIndex];
        const event = events.find(e => e.id === match.eventId);

        if (status === 'Completed') {
            console.log(`Status update for volunteer ${match.volunteerId}: ${event ? event.name : 'the event'} has been marked as completed`);
        } else if (status === 'Cancelled') {
            console.log(`Status update for volunteer ${match.volunteerId}: ${event ? event.name : 'the event'} has been cancelled`);
        }

        return res.status(200).json(matches[matchIndex]);
    } catch (error) {
        console.error('Error updating match status:', error);
        return res.status(500).json({ error: 'Failed to update match status' });
    }
};

// Delete a match
const deleteMatch = (req, res) => {
    try {
        const { id } = req.params;

        const matchIndex = matches.findIndex(m => m.id === id);

        if (matchIndex === -1) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // In a real app, this would be a database delete
        const deletedMatch = matches[matchIndex];
        matches.splice(matchIndex, 1);

        // Replace notification with console log
        const event = events.find(e => e.id === deletedMatch.eventId);
        console.log(`Status update for volunteer ${deletedMatch.volunteerId}: match with ${event ? event.name : 'an event'} has been removed`);

        return res.status(200).json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('Error deleting match:', error);
        return res.status(500).json({ error: 'Failed to delete match' });
    }
};

// Get recommended volunteers for an event
const getRecommendedVolunteers = (req, res) => {
    try {
        const { eventId } = req.params;

        // Check if event exists
        const event = events.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get volunteers with calculated match scores
        const recommendations = matchingService.findVolunteersForEvent(eventId);

        return res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error getting volunteer recommendations:', error);
        return res.status(500).json({ error: 'Failed to get volunteer recommendations' });
    }
};

// Get recommended events for a volunteer
const getRecommendedEvents = (req, res) => {
    try {
        const { volunteerId } = req.params;

        // Check if volunteer exists
        const volunteer = volunteers.find(v => v.id === volunteerId);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Get events with calculated match scores
        const recommendations = matchingService.findEventsForVolunteer(volunteerId);

        return res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error getting event recommendations:', error);
        return res.status(500).json({ error: 'Failed to get event recommendations' });
    }
};

// Get all match history
const getAllMatchHistory = (req, res) => {
    try {
        // Build comprehensive history with volunteer and event details
        const history = matches.map(match => {
            const volunteer = volunteers.find(v => v.id === match.volunteerId);
            const event = events.find(e => e.id === match.eventId);

            return {
                matchId: match.id,
                volunteerId: match.volunteerId,
                volunteerName: volunteer ? volunteer.name : 'Unknown Volunteer',
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
        console.error('Error fetching match history:', error);
        return res.status(500).json({ error: 'Failed to fetch match history' });
    }
};

module.exports = {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatchStatus,
    deleteMatch,
    getRecommendedVolunteers,
    getRecommendedEvents,
    getAllMatchHistory
};