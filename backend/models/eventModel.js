const { executeQuery } = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

// Get all events
const getAllEvents = async () => {
    const sql = `
        SELECT 
            e.id, 
            e.name, 
            e.description, 
            DATE_FORMAT(e.date, '%Y-%m-%d') AS date, 
            e.location, 
            e.urgency, 
            e.status,
            GROUP_CONCAT(DISTINCT s.skill_name) AS requiredSkills,
            DATE_FORMAT(e.created_at, '%Y-%m-%d') AS createdAt
        FROM events e
        LEFT JOIN event_required_skills ers ON e.id = ers.event_id
        LEFT JOIN skills s ON ers.skill_id = s.id
        GROUP BY e.id
        ORDER BY e.date ASC
    `;

    const events = await executeQuery(sql);

    // Parse the requiredSkills string into an array
    return events.map(event => ({
        ...event,
        requiredSkills: event.requiredSkills ? event.requiredSkills.split(',') : []
    }));
};

// Get event by ID
const getEventById = async (id) => {
    const sql = `
        SELECT 
            e.id, 
            e.name, 
            e.description, 
            DATE_FORMAT(e.date, '%Y-%m-%d') AS date, 
            e.location, 
            e.urgency, 
            e.status,
            GROUP_CONCAT(DISTINCT s.skill_name) AS requiredSkills,
            DATE_FORMAT(e.created_at, '%Y-%m-%d') AS createdAt
        FROM events e
        LEFT JOIN event_required_skills ers ON e.id = ers.event_id
        LEFT JOIN skills s ON ers.skill_id = s.id
        WHERE e.id = ?
        GROUP BY e.id
    `;

    const events = await executeQuery(sql, [id]);

    if (events.length === 0) {
        return null;
    }

    // Parse the requiredSkills string into an array
    const event = events[0];
    return {
        ...event,
        requiredSkills: event.requiredSkills ? event.requiredSkills.split(',') : []
    };
};

// Create event
const createEvent = async (eventData) => {
    const { name, description, date, location, requiredSkills, urgency } = eventData;
    const id = uuidv4();
    const connection = await require('../config/dbConfig').pool.getConnection();

    try {
        await connection.beginTransaction();

        // Insert event
        await connection.execute(
            'INSERT INTO events (id, name, description, date, location, urgency, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, description, date, location, urgency, 'Active']
        );

        // Insert required skills
        if (requiredSkills && requiredSkills.length > 0) {
            for (const skill of requiredSkills) {
                // Get skill ID (create if doesn't exist)
                const [skillRows] = await connection.execute(
                    'SELECT id FROM skills WHERE skill_name = ?',
                    [skill]
                );

                let skillId;
                if (skillRows.length === 0) {
                    const [insertResult] = await connection.execute(
                        'INSERT INTO skills (skill_name) VALUES (?)',
                        [skill]
                    );
                    skillId = insertResult.insertId;
                } else {
                    skillId = skillRows[0].id;
                }

                // Insert event-skill relationship
                await connection.execute(
                    'INSERT INTO event_required_skills (event_id, skill_id) VALUES (?, ?)',
                    [id, skillId]
                );
            }
        }

        await connection.commit();

        // Return created event
        return getEventById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Update event
const updateEvent = async (id, eventData) => {
    const { name, description, date, location, requiredSkills, urgency, status } = eventData;
    const connection = await require('../config/dbConfig').pool.getConnection();

    try {
        await connection.beginTransaction();

        // Update event information if provided
        const updateFields = [];
        const updateParams = [];

        if (name) {
            updateFields.push('name = ?');
            updateParams.push(name);
        }

        if (description) {
            updateFields.push('description = ?');
            updateParams.push(description);
        }

        if (date) {
            updateFields.push('date = ?');
            updateParams.push(date);
        }

        if (location) {
            updateFields.push('location = ?');
            updateParams.push(location);
        }

        if (urgency) {
            updateFields.push('urgency = ?');
            updateParams.push(urgency);
        }

        if (status) {
            updateFields.push('status = ?');
            updateParams.push(status);
        }

        if (updateFields.length > 0) {
            const sql = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`;
            updateParams.push(id);
            await connection.execute(sql, updateParams);
        }

        // Update required skills if provided
        if (requiredSkills && requiredSkills.length > 0) {
            // Remove existing skills
            await connection.execute('DELETE FROM event_required_skills WHERE event_id = ?', [id]);

            // Add new skills
            for (const skill of requiredSkills) {
                // Get skill ID (create if doesn't exist)
                const [skillRows] = await connection.execute(
                    'SELECT id FROM skills WHERE skill_name = ?',
                    [skill]
                );

                let skillId;
                if (skillRows.length === 0) {
                    const [insertResult] = await connection.execute(
                        'INSERT INTO skills (skill_name) VALUES (?)',
                        [skill]
                    );
                    skillId = insertResult.insertId;
                } else {
                    skillId = skillRows[0].id;
                }

                // Insert event-skill relationship
                await connection.execute(
                    'INSERT INTO event_required_skills (event_id, skill_id) VALUES (?, ?)',
                    [id, skillId]
                );
            }
        }

        await connection.commit();

        // Return updated event
        return getEventById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Delete event
const deleteEvent = async (id) => {
    return await executeQuery('DELETE FROM events WHERE id = ?', [id]);
};

// Get volunteers for an event
const getEventVolunteers = async (id) => {
    const sql = `
        SELECT 
            m.id AS matchId,
            m.volunteer_id AS volunteerId,
            up.name AS volunteerName,
            up.location,
            m.status,
            m.match_score AS matchScore,
            GROUP_CONCAT(DISTINCT s.skill_name) AS skills
        FROM matches m
        JOIN user_profile up ON m.volunteer_id = up.id
        LEFT JOIN user_skills us ON up.id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.id
        WHERE m.event_id = ?
        GROUP BY m.id
    `;

    const volunteers = await executeQuery(sql, [id]);

    // Parse the skills string into an array
    return volunteers.map(volunteer => ({
        ...volunteer,
        skills: volunteer.skills ? volunteer.skills.split(',') : []
    }));
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventVolunteers
};