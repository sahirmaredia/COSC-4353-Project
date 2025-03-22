const matchingModel = require('../models/matchingModel');
const volunteerModel = require('../models/volunteerModel');
const eventModel = require('../models/eventModel');

// Get all matches
const getAllMatches = async (req, res) => {
    try {
        const matches = await matchingModel.getAllMatches();
        return res.status(200).json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        return res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

// Get match by ID
const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await matchingModel.getMatchById(id);

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
const createMatch = async (req, res) => {
    try {
        const { volunteerId, eventId } = req.body;

        // Check if volunteer exists
        const volunteer = await volunteerModel.getVolunteerById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Check if event exists
        const event = await eventModel.getEventById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if match already exists
        const matches = await matchingModel.getAllMatches();
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
        const matchScore = await matchingModel.calculateMatchScore(volunteerId, eventId);

        // Create match
        const newMatch = await matchingModel.createMatch({
            volunteerId,
            eventId,
            matchScore
        });

        // Log notification (in a real system, this would store to the notifications table)
        console.log(`Match notification sent to volunteer ${volunteerId} for event ${event.name}`);

        return res.status(201).json(newMatch);
    } catch (error) {
        console.error('Error creating match:', error);
        return res.status(500).json({ error: 'Failed to create match' });
    }
};

// Update match status
const updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Matched', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Check if match exists
        const match = await matchingModel.getMatchById(id);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Update match status
        const updatedMatch = await matchingModel.updateMatchStatus(id, status);

        // Log notification (in a real system, this would store to the notifications table)
        const event = await eventModel.getEventById(match.eventId);

        if (status === 'Completed') {
            console.log(`Status update for volunteer ${match.volunteerId}: ${event ? event.name : 'the event'} has been marked as completed`);
        } else if (status === 'Cancelled') {
            console.log(`Status update for volunteer ${match.volunteerId}: ${event ? event.name : 'the event'} has been cancelled`);
        }

        return res.status(200).json(updatedMatch);
    } catch (error) {
        console.error('Error updating match status:', error);
        return res.status(500).json({ error: 'Failed to update match status' });
    }
};

// Delete a match
const deleteMatch = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if match exists
        const match = await matchingModel.getMatchById(id);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Store match details before deletion for notification purposes
        const volunteerId = match.volunteerId;
        const eventId = match.eventId;

        // Delete match
        await matchingModel.deleteMatch(id);

        // Log notification (in a real system, this would store to the notifications table)
        const event = await eventModel.getEventById(eventId);
        console.log(`Status update for volunteer ${volunteerId}: match with ${event ? event.name : 'an event'} has been removed`);

        return res.status(200).json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('Error deleting match:', error);
        return res.status(500).json({ error: 'Failed to delete match' });
    }
};

// Get recommended volunteers for an event
const getRecommendedVolunteers = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Check if event exists
        const event = await eventModel.getEventById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get recommended volunteers
        const recommendations = await matchingModel.getRecommendedVolunteers(eventId);

        return res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error getting volunteer recommendations:', error);
        return res.status(500).json({ error: 'Failed to get volunteer recommendations' });
    }
};

// Get recommended events for a volunteer
const getRecommendedEvents = async (req, res) => {
    try {
        const { volunteerId } = req.params;

        // Check if volunteer exists
        const volunteer = await volunteerModel.getVolunteerById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Get recommended events
        const recommendations = await matchingModel.getRecommendedEvents(volunteerId);

        return res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error getting event recommendations:', error);
        return res.status(500).json({ error: 'Failed to get event recommendations' });
    }
};

// Get all match history
const getAllMatchHistory = async (req, res) => {
    try {
        const history = await matchingModel.getAllMatchHistory();

        console.log('Match History Query Result:', history);
        if (history.length === 0) {
            return res.status(404).json({ error: 'No match history found' });
        }

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