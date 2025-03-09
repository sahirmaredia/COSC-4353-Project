const { volunteers, events, matches } = require('../data/mockData');

/**
 * Calculate match score between volunteer and event
 * @param {Object} volunteer - Volunteer object
 * @param {Object} event - Event object
 * @returns {Number} - Match score (0-100)
 */
const calculateMatchScore = (volunteer, event) => {
    if (!volunteer || !event) return 0;

    let score = 0;

    // Check skills match (60% of total score)
    if (event.requiredSkills.length === 0) {
        // No skills required, so give full points for skills match
        score += 60;
    } else {
        const matchingSkills = event.requiredSkills.filter(skill =>
            volunteer.skills.includes(skill)
        );
        score += (matchingSkills.length / event.requiredSkills.length) * 60;
    }

    // Check availability match (30% of total score)
    if (volunteer.availability.includes(event.date)) {
        score += 30;
    }

    // Check location match (10% of total score)
    if (volunteer.location === event.location) {
        score += 10;
    }

    return Math.round(score);
};

/**
 * Find the best volunteers for a specific event
 * @param {String} eventId - Event ID
 * @returns {Array} - Array of volunteers with match scores
 */
const findVolunteersForEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) {
        return [];
    }

    // Get existing matches for this event to avoid recommending already matched volunteers
    const existingMatches = matches.filter(m =>
        m.eventId === eventId && ['Matched', 'Completed'].includes(m.status)
    );
    const alreadyMatchedVolunteerIds = existingMatches.map(m => m.volunteerId);

    // Calculate match scores for all volunteers not already matched
    const recommendations = volunteers
        .filter(volunteer => !alreadyMatchedVolunteerIds.includes(volunteer.id))
        .map(volunteer => {
            const matchScore = calculateMatchScore(volunteer, event);

            // Don't include sensitive volunteer information
            const { password, ...sanitizedVolunteer } = volunteer;

            return {
                ...sanitizedVolunteer,
                eventId,
                eventName: event.name,
                matchScore
            };
        })
        .filter(recommendation => recommendation.matchScore > 0) // Only include if there's some match
        .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending

    return recommendations;
};

/**
 * Find the best events for a specific volunteer
 * @param {String} volunteerId - Volunteer ID
 * @returns {Array} - Array of events with match scores
 */
const findEventsForVolunteer = (volunteerId) => {
    const volunteer = volunteers.find(v => v.id === volunteerId);
    if (!volunteer) {
        return [];
    }

    // Get existing matches for this volunteer to avoid recommending already matched events
    const existingMatches = matches.filter(m =>
        m.volunteerId === volunteerId && ['Matched', 'Completed'].includes(m.status)
    );
    const alreadyMatchedEventIds = existingMatches.map(m => m.eventId);

    // Only consider active events that haven't happened yet
    const today = new Date().toISOString().split('T')[0];

    // Calculate match scores for all suitable events not already matched
    const recommendations = events
        .filter(event =>
            !alreadyMatchedEventIds.includes(event.id) &&
            event.status === 'Active' &&
            event.date >= today
        )
        .map(event => {
            const matchScore = calculateMatchScore(volunteer, event);

            return {
                ...event,
                volunteerId,
                volunteerName: volunteer.name,
                matchScore
            };
        })
        .filter(recommendation => recommendation.matchScore > 0) // Only include if there's some match
        .sort((a, b) => b.matchScore - a.matchScore); // Sort by score descending

    return recommendations;
};

/**
 * Automatically match all available volunteers to suitable events
 * @returns {Array} - Array of created matches
 */
const autoMatchAll = () => {
    const today = new Date().toISOString().split('T')[0];
    const newMatches = [];

    // Get active events
    const activeEvents = events.filter(event => event.status === 'Active' && event.date >= today);

    // For each volunteer, find the best matching event
    volunteers.forEach(volunteer => {
        // Skip volunteers who are already at capacity (have too many active matches)
        const activeVolunteerMatches = matches.filter(m =>
            m.volunteerId === volunteer.id &&
            ['Pending', 'Matched'].includes(m.status)
        );

        if (activeVolunteerMatches.length >= 3) {
            return; // Skip this volunteer if they already have 3 active matches
        }

        // Find events this volunteer is not already matched with
        const alreadyMatchedEventIds = matches
            .filter(m => m.volunteerId === volunteer.id)
            .map(m => m.eventId);

        const availableEvents = activeEvents.filter(event =>
            !alreadyMatchedEventIds.includes(event.id)
        );

        // Find the best matching event
        let bestMatch = null;
        let bestScore = 0;

        availableEvents.forEach(event => {
            const score = calculateMatchScore(volunteer, event);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = event;
            }
        });

        // Create a match if score is above threshold
        if (bestMatch && bestScore >= 50) {
            const id = `m${matches.length + newMatches.length + 1}`;
            const now = new Date().toISOString().split('T')[0];

            const newMatch = {
                id,
                volunteerId: volunteer.id,
                eventId: bestMatch.id,
                status: 'Pending', // Start as pending until confirmed
                matchScore: bestScore,
                createdAt: now,
                updatedAt: now
            };

            newMatches.push(newMatch);
        }
    });

    // In a real application, these would be saved to the database
    // For now, we'll add them to our mock data
    newMatches.forEach(match => matches.push(match));

    return newMatches;
};

module.exports = {
    calculateMatchScore,
    findVolunteersForEvent,
    findEventsForVolunteer,
    autoMatchAll
};