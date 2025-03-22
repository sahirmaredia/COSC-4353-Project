const { executeQuery } = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const volunteerModel = require('./volunteerModel');
const eventModel = require('./eventModel');

// Get all matches
const getAllMatches = async () => {
    const sql = `
        SELECT 
            m.id,
            m.volunteer_id AS volunteerId,
            m.event_id AS eventId,
            m.status,
            m.match_score AS matchScore,
            DATE_FORMAT(m.created_at, '%Y-%m-%d') AS createdAt,
            DATE_FORMAT(m.updated_at, '%Y-%m-%d') AS updatedAt
        FROM matches m
        ORDER BY m.created_at DESC
    `;

    return await executeQuery(sql);
};

// Get match by ID
const getMatchById = async (id) => {
    const sql = `
        SELECT 
            m.id,
            m.volunteer_id AS volunteerId,
            m.event_id AS eventId,
            m.status,
            m.match_score AS matchScore,
            DATE_FORMAT(m.created_at, '%Y-%m-%d') AS createdAt,
            DATE_FORMAT(m.updated_at, '%Y-%m-%d') AS updatedAt
        FROM matches m
        WHERE m.id = ?
    `;

    const matches = await executeQuery(sql, [id]);

    if (matches.length === 0) {
        return null;
    }

    return matches[0];
};

// Create a match
const createMatch = async (matchData) => {
    const { volunteerId, eventId, matchScore } = matchData;
    const id = uuidv4();

    // Insert match
    await executeQuery(
        'INSERT INTO matches (id, volunteer_id, event_id, status, match_score) VALUES (?, ?, ?, ?, ?)',
        [id, volunteerId, eventId, 'Matched', matchScore]
    );

    return getMatchById(id);
};

// Update match status
const updateMatchStatus = async (id, status) => {
    await executeQuery(
        'UPDATE matches SET status = ? WHERE id = ?',
        [status, id]
    );

    return getMatchById(id);
};

// Delete a match
const deleteMatch = async (id) => {
    return await executeQuery('DELETE FROM matches WHERE id = ?', [id]);
};

// Calculate match score between volunteer and event
const calculateMatchScore = async (volunteerId, eventId) => {
    // Get volunteer and event data
    const volunteer = await volunteerModel.getVolunteerById(volunteerId);
    const event = await eventModel.getEventById(eventId);

    if (!volunteer || !event) {
        return 0;
    }

    let score = 0;

    // Check skills match (60% of total score)
    const matchingSkills = event.requiredSkills.filter(skill =>
        volunteer.skills.includes(skill)
    );
    score += (matchingSkills.length / event.requiredSkills.length) * 60;

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

// Get recommended volunteers for an event
const getRecommendedVolunteers = async (eventId) => {
    // Get event details
    const event = await eventModel.getEventById(eventId);

    if (!event) {
        return [];
    }

    // Get existing matches for this event to exclude already matched volunteers
    const existingMatchSql = `
        SELECT volunteer_id
        FROM matches
        WHERE event_id = ? AND status IN ('Matched', 'Completed')
    `;

    const existingMatches = await executeQuery(existingMatchSql, [eventId]);
    const alreadyMatchedVolunteers = existingMatches.map(match => match.volunteer_id);

    // Get all volunteers
    const volunteers = await volunteerModel.getAllVolunteers();

    // Calculate match scores and prepare results
    const recommendations = [];

    for (const volunteer of volunteers) {
        // Skip already matched volunteers
        if (alreadyMatchedVolunteers.includes(volunteer.id)) {
            continue;
        }

        // Get volunteer details with skills and availability
        const volunteerDetails = await volunteerModel.getVolunteerById(volunteer.id);
        const matchScore = await calculateMatchScore(volunteer.id, eventId);

        if (matchScore > 0) {
            recommendations.push({
                ...volunteerDetails,
                eventId,
                eventName: event.name,
                matchScore
            });
        }
    }

    // Sort by match score (highest first)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
};

// Get recommended events for a volunteer
const getRecommendedEvents = async (volunteerId) => {
    // Get volunteer details
    const volunteer = await volunteerModel.getVolunteerById(volunteerId);

    if (!volunteer) {
        return [];
    }

    // Get existing matches for this volunteer to exclude already matched events
    const existingMatchSql = `
        SELECT event_id
        FROM matches
        WHERE volunteer_id = ? AND status IN ('Matched', 'Completed')
    `;

    const existingMatches = await executeQuery(existingMatchSql, [volunteerId]);
    const alreadyMatchedEvents = existingMatches.map(match => match.event_id);

    // Get only active events that haven't happened yet
    const today = new Date().toISOString().split('T')[0];

    const eventsSql = `
        SELECT 
            id, 
            name, 
            description, 
            DATE_FORMAT(date, '%Y-%m-%d') AS date, 
            location, 
            urgency, 
            status
        FROM events
        WHERE status = 'Active' AND date >= ?
    `;

    const events = await executeQuery(eventsSql, [today]);

    // Calculate match scores and prepare results
    const recommendations = [];

    for (const event of events) {
        // Skip already matched events
        if (alreadyMatchedEvents.includes(event.id)) {
            continue;
        }

        // Get event details with required skills
        const eventDetails = await eventModel.getEventById(event.id);
        const matchScore = await calculateMatchScore(volunteerId, event.id);

        if (matchScore > 0) {
            recommendations.push({
                ...eventDetails,
                volunteerId,
                volunteerName: volunteer.name,
                matchScore
            });
        }
    }

    // Sort by match score (highest first)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
};

// Get all match history
const getAllMatchHistory = async () => {
    const sql = `
        SELECT 
            m.id AS matchId,
            m.volunteer_id AS volunteerId,
            up.name AS volunteerName,
            m.event_id AS eventId,
            e.name AS eventName,
            DATE_FORMAT(e.date, '%Y-%m-%d') AS eventDate,
            e.location,
            e.urgency,
            m.status,
            m.match_score AS matchScore,
            GROUP_CONCAT(DISTINCT s.skill_name) AS requiredSkills,
            DATE_FORMAT(m.created_at, '%Y-%m-%d') AS createdAt,
            DATE_FORMAT(m.updated_at, '%Y-%m-%d') AS updatedAt
        FROM matches m
        JOIN user_profile up ON m.volunteer_id = up.id
        JOIN events e ON m.event_id = e.id
        LEFT JOIN event_required_skills ers ON e.id = ers.event_id
        LEFT JOIN skills s ON ers.skill_id = s.id
        GROUP BY m.id
        ORDER BY e.date DESC
    `;

    const history = await executeQuery(sql);

    // Parse the requiredSkills string into an array
    return history.map(record => ({
        ...record,
        requiredSkills: record.requiredSkills ? record.requiredSkills.split(',') : []
    }));
};

module.exports = {
    getAllMatches,
    getMatchById,
    createMatch,
    updateMatchStatus,
    deleteMatch,
    calculateMatchScore,
    getRecommendedVolunteers,
    getRecommendedEvents,
    getAllMatchHistory
};