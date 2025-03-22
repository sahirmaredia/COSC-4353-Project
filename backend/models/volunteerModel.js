const { executeQuery } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Get all volunteers
const getAllVolunteers = async () => {
    const sql = `
        SELECT up.id, up.name, up.location, up.created_at, uc.email
        FROM user_profile up
        JOIN user_credentials uc ON up.id = uc.id
    `;
    return await executeQuery(sql);
};

// Get volunteer by ID with skills and availability
const getVolunteerById = async (id) => {
    // Get volunteer profile and credentials
    const volunteerSql = `
        SELECT up.id, up.name, up.location, up.created_at, uc.email
        FROM user_profile up
        JOIN user_credentials uc ON up.id = uc.id
        WHERE up.id = ?
    `;

    const volunteers = await executeQuery(volunteerSql, [id]);

    if (volunteers.length === 0) {
        return null;
    }

    const volunteer = volunteers[0];

    // Get volunteer skills
    const skillsSql = `
        SELECT s.skill_name
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id = ?
    `;

    const skills = await executeQuery(skillsSql, [id]);
    volunteer.skills = skills.map(skill => skill.skill_name);

    // Get volunteer availability
    const availabilitySql = `
        SELECT DATE_FORMAT(available_date, '%Y-%m-%d') as date
        FROM user_availability
        WHERE user_id = ?
    `;

    const availability = await executeQuery(availabilitySql, [id]);
    volunteer.availability = availability.map(a => a.date);

    // Get volunteer preferences
    const preferencesSql = `
        SELECT up.max_distance, et.type_name
        FROM user_preferences up
        LEFT JOIN user_preferred_event_types upet ON up.user_id = upet.user_id
        LEFT JOIN event_types et ON upet.event_type_id = et.id
        WHERE up.user_id = ?
    `;

    const preferences = await executeQuery(preferencesSql, [id]);

    if (preferences.length > 0) {
        volunteer.preferences = {
            maxDistance: preferences[0].max_distance,
            eventTypes: preferences.filter(p => p.type_name).map(p => p.type_name)
        };
    }

    return volunteer;
};

// Create new volunteer
const createVolunteer = async (volunteerData) => {
    const { name, email, password, skills, location, availability, preferences } = volunteerData;
    const id = uuidv4();
    const connection = await require('../config/dbConfig').pool.getConnection();

    try {
        await connection.beginTransaction();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user credentials
        await connection.execute(
            'INSERT INTO user_credentials (id, email, password) VALUES (?, ?, ?)',
            [id, email, hashedPassword]
        );

        // Insert user profile
        await connection.execute(
            'INSERT INTO user_profile (id, name, location) VALUES (?, ?, ?)',
            [id, name, location]
        );

        // Insert skills
        if (skills && skills.length > 0) {
            for (const skill of skills) {
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

                // Insert user-skill relationship
                await connection.execute(
                    'INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)',
                    [id, skillId]
                );
            }
        }

        // Insert availability
        if (availability && availability.length > 0) {
            for (const date of availability) {
                await connection.execute(
                    'INSERT INTO user_availability (user_id, available_date) VALUES (?, ?)',
                    [id, date]
                );
            }
        }

        // Insert preferences
        if (preferences) {
            await connection.execute(
                'INSERT INTO user_preferences (user_id, max_distance) VALUES (?, ?)',
                [id, preferences.maxDistance || 30]
            );

            if (preferences.eventTypes && preferences.eventTypes.length > 0) {
                for (const eventType of preferences.eventTypes) {
                    // Get event type ID (create if doesn't exist)
                    const [typeRows] = await connection.execute(
                        'SELECT id FROM event_types WHERE type_name = ?',
                        [eventType]
                    );

                    let typeId;
                    if (typeRows.length === 0) {
                        const [insertResult] = await connection.execute(
                            'INSERT INTO event_types (type_name) VALUES (?)',
                            [eventType]
                        );
                        typeId = insertResult.insertId;
                    } else {
                        typeId = typeRows[0].id;
                    }

                    // Insert user-event type relationship
                    await connection.execute(
                        'INSERT INTO user_preferred_event_types (user_id, event_type_id) VALUES (?, ?)',
                        [id, typeId]
                    );
                }
            }
        }

        await connection.commit();

        // Return created volunteer (without password)
        return getVolunteerById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Update volunteer
const updateVolunteer = async (id, volunteerData) => {
    const { name, email, skills, location, availability, preferences } = volunteerData;
    const connection = await require('../config/dbConfig').pool.getConnection();

    try {
        await connection.beginTransaction();

        // Update profile information if provided
        if (name || location) {
            let sql = 'UPDATE user_profile SET ';
            const params = [];
            const updates = [];

            if (name) {
                updates.push('name = ?');
                params.push(name);
            }

            if (location) {
                updates.push('location = ?');
                params.push(location);
            }

            sql += updates.join(', ') + ' WHERE id = ?';
            params.push(id);

            await connection.execute(sql, params);
        }

        // Update email if provided
        if (email) {
            await connection.execute(
                'UPDATE user_credentials SET email = ? WHERE id = ?',
                [email, id]
            );
        }

        // Update skills if provided
        if (skills && skills.length > 0) {
            // Remove existing skills
            await connection.execute('DELETE FROM user_skills WHERE user_id = ?', [id]);

            // Add new skills
            for (const skill of skills) {
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

                // Insert user-skill relationship
                await connection.execute(
                    'INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)',
                    [id, skillId]
                );
            }
        }

        // Update availability if provided
        if (availability && availability.length > 0) {
            // Remove existing availability
            await connection.execute('DELETE FROM user_availability WHERE user_id = ?', [id]);

            // Add new availability
            for (const date of availability) {
                await connection.execute(
                    'INSERT INTO user_availability (user_id, available_date) VALUES (?, ?)',
                    [id, date]
                );
            }
        }

        // Update preferences if provided
        if (preferences) {
            // Update max distance
            const [prefRows] = await connection.execute(
                'SELECT user_id FROM user_preferences WHERE user_id = ?',
                [id]
            );

            if (prefRows.length === 0) {
                await connection.execute(
                    'INSERT INTO user_preferences (user_id, max_distance) VALUES (?, ?)',
                    [id, preferences.maxDistance || 30]
                );
            } else {
                await connection.execute(
                    'UPDATE user_preferences SET max_distance = ? WHERE user_id = ?',
                    [preferences.maxDistance || 30, id]
                );
            }

            // Update event types if provided
            if (preferences.eventTypes && preferences.eventTypes.length > 0) {
                // Remove existing event types
                await connection.execute(
                    'DELETE FROM user_preferred_event_types WHERE user_id = ?',
                    [id]
                );

                // Add new event types
                for (const eventType of preferences.eventTypes) {
                    // Get event type ID (create if doesn't exist)
                    const [typeRows] = await connection.execute(
                        'SELECT id FROM event_types WHERE type_name = ?',
                        [eventType]
                    );

                    let typeId;
                    if (typeRows.length === 0) {
                        const [insertResult] = await connection.execute(
                            'INSERT INTO event_types (type_name) VALUES (?)',
                            [eventType]
                        );
                        typeId = insertResult.insertId;
                    } else {
                        typeId = typeRows[0].id;
                    }

                    // Insert user-event type relationship
                    await connection.execute(
                        'INSERT INTO user_preferred_event_types (user_id, event_type_id) VALUES (?, ?)',
                        [id, typeId]
                    );
                }
            }
        }

        await connection.commit();

        // Return updated volunteer
        return getVolunteerById(id);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Delete volunteer
const deleteVolunteer = async (id) => {
    // We'll just delete from user_credentials since it cascades to all related tables
    return await executeQuery('DELETE FROM user_credentials WHERE id = ?', [id]);
};

// Get volunteer history
const getVolunteerHistory = async (id) => {
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
        WHERE m.volunteer_id = ?
        GROUP BY m.id
        ORDER BY e.date DESC
    `;

    const history = await executeQuery(sql, [id]);

    // Parse the requiredSkills string into an array
    return history.map(record => ({
        ...record,
        requiredSkills: record.requiredSkills ? record.requiredSkills.split(',') : []
    }));
};

// Verify user credentials
const verifyCredentials = async (email, password) => {
    console.log('Login attempt:', { email, password });
    const sql = 'SELECT id, password FROM user_credentials WHERE email = ?';
    const users = await executeQuery(sql, [email]);
    console.log('Found users:', users);

    if (users.length === 0) {
        console.log('No user found with this email');
        return null;
    }

    const user = users[0];
    try {
        const match = await bcrypt.compare(password, user.password);
        console.log('Bcrypt compare result:', match);

        if (match) {
            return { id: user.id };
        }
    } catch (error) {
        console.error('Bcrypt comparison error:', error);
    }

    return null;
};

module.exports = {
    getAllVolunteers,
    getVolunteerById,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getVolunteerHistory,
    verifyCredentials
};