/**
 * Validate volunteer data
 */
const validateVolunteer = (req, res, next) => {
    const { name, email, skills, location, availability } = req.body;
    const errors = [];

    // Name validation
    if (!name) {
        errors.push('Name is required');
    } else if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
        errors.push('Name must be a string between 2 and 100 characters');
    }

    // Email validation
    if (!email) {
        errors.push('Email is required');
    } else if (typeof email !== 'string' || !isValidEmail(email)) {
        errors.push('Email must be a valid email address');
    }

    // Skills validation
    if (!skills) {
        errors.push('Skills are required');
    } else if (!Array.isArray(skills) || skills.length === 0) {
        errors.push('Skills must be a non-empty array');
    } else {
        for (const skill of skills) {
            if (typeof skill !== 'string' || skill.length < 2 || skill.length > 50) {
                errors.push('Each skill must be a string between 2 and 50 characters');
                break;
            }
        }
    }

    // Location validation
    if (!location) {
        errors.push('Location is required');
    } else if (typeof location !== 'string' || location.length < 2 || location.length > 100) {
        errors.push('Location must be a string between 2 and 100 characters');
    }

    // Availability validation
    if (!availability) {
        errors.push('Availability is required');
    } else if (!Array.isArray(availability) || availability.length === 0) {
        errors.push('Availability must be a non-empty array');
    } else {
        for (const date of availability) {
            if (typeof date !== 'string' || !isValidDate(date)) {
                errors.push('Each availability date must be a valid date string (YYYY-MM-DD)');
                break;
            }
        }
    }

    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // If all validations pass, proceed
    next();
};

/**
 * Validate event data
 */
const validateEvent = (req, res, next) => {
    const { name, description, date, location, requiredSkills, urgency } = req.body;
    const errors = [];

    // Name validation
    if (!name) {
        errors.push('Name is required');
    } else if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
        errors.push('Name must be a string between 2 and 100 characters');
    }

    // Description validation
    if (!description) {
        errors.push('Description is required');
    } else if (typeof description !== 'string' || description.length < 10 || description.length > 500) {
        errors.push('Description must be a string between 10 and 500 characters');
    }

    // Date validation
    if (!date) {
        errors.push('Date is required');
    } else if (typeof date !== 'string' || !isValidDate(date)) {
        errors.push('Date must be a valid date string (YYYY-MM-DD)');
    }

    // Location validation
    if (!location) {
        errors.push('Location is required');
    } else if (typeof location !== 'string' || location.length < 2 || location.length > 100) {
        errors.push('Location must be a string between 2 and 100 characters');
    }

    // Required Skills validation
    if (!requiredSkills) {
        errors.push('Required skills are required');
    } else if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        errors.push('Required skills must be a non-empty array');
    } else {
        for (const skill of requiredSkills) {
            if (typeof skill !== 'string' || skill.length < 2 || skill.length > 50) {
                errors.push('Each required skill must be a string between 2 and 50 characters');
                break;
            }
        }
    }

    // Urgency validation
    if (!urgency) {
        errors.push('Urgency is required');
    } else if (typeof urgency !== 'string' || !['Low', 'Medium', 'High'].includes(urgency)) {
        errors.push('Urgency must be one of: Low, Medium, High');
    }

    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // If all validations pass, proceed
    next();
};

/**
 * Validate matching data
 */
const validateMatching = (req, res, next) => {
    const { volunteerId, eventId } = req.body;
    const errors = [];

    // Volunteer ID validation
    if (!volunteerId) {
        errors.push('Volunteer ID is required');
    } else if (typeof volunteerId !== 'string') {
        errors.push('Volunteer ID must be a string');
    }

    // Event ID validation
    if (!eventId) {
        errors.push('Event ID is required');
    } else if (typeof eventId !== 'string') {
        errors.push('Event ID must be a string');
    }

    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // If all validations pass, proceed
    next();
};

/**
 * Helper function to validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Helper function to validate date format (YYYY-MM-DD)
 */
const isValidDate = (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

module.exports = {
    validateVolunteer,
    validateEvent,
    validateMatching
};