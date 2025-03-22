const volunteerModel = require('../models/volunteerModel');

// Get all volunteers
const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await volunteerModel.getAllVolunteers();
        return res.status(200).json(volunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        return res.status(500).json({ error: 'Failed to fetch volunteers' });
    }
};

// Get volunteer by ID
const getVolunteerById = async (req, res) => {
    try {
        const { id } = req.params;
        const volunteer = await volunteerModel.getVolunteerById(id);

        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        return res.status(200).json(volunteer);
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        return res.status(500).json({ error: 'Failed to fetch volunteer' });
    }
};

// Create new volunteer
const createVolunteer = async (req, res) => {
    try {
        const { name, email, password, skills, location, availability, preferences } = req.body;

        // Check if the email is already in use
        // (This will be caught by unique constraint but it's more user-friendly to check it explicitly)
        try {
            const volunteers = await volunteerModel.getAllVolunteers();
            const emailExists = volunteers.some(v => v.email === email);

            if (emailExists) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        } catch (error) {
            console.error('Error checking for existing email:', error);
        }

        const newVolunteer = await volunteerModel.createVolunteer({
            name,
            email,
            password,
            skills,
            location,
            availability,
            preferences
        });

        return res.status(201).json(newVolunteer);
    } catch (error) {
        console.error('Error creating volunteer:', error);
        return res.status(500).json({ error: 'Failed to create volunteer' });
    }
};

// Update volunteer
const updateVolunteer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, skills, location, availability, preferences } = req.body;

        // Check if volunteer exists
        const volunteer = await volunteerModel.getVolunteerById(id);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        // Check if trying to update to an email that's already in use by someone else
        if (email && email !== volunteer.email) {
            try {
                const volunteers = await volunteerModel.getAllVolunteers();
                const emailExists = volunteers.some(v => v.email === email && v.id !== id);

                if (emailExists) {
                    return res.status(400).json({ error: 'Email already in use by another volunteer' });
                }
            } catch (error) {
                console.error('Error checking for existing email:', error);
            }
        }

        const updatedVolunteer = await volunteerModel.updateVolunteer(id, {
            name,
            email,
            skills,
            location,
            availability,
            preferences
        });

        return res.status(200).json(updatedVolunteer);
    } catch (error) {
        console.error('Error updating volunteer:', error);
        return res.status(500).json({ error: 'Failed to update volunteer' });
    }
};

// Delete volunteer
const deleteVolunteer = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if volunteer exists
        const volunteer = await volunteerModel.getVolunteerById(id);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        await volunteerModel.deleteVolunteer(id);

        return res.status(200).json({ message: 'Volunteer deleted successfully' });
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        return res.status(500).json({ error: 'Failed to delete volunteer' });
    }
};

// Get volunteer history
const getVolunteerHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if volunteer exists
        const volunteer = await volunteerModel.getVolunteerById(id);
        if (!volunteer) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }

        const history = await volunteerModel.getVolunteerHistory(id);

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