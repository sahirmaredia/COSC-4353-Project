const jwt = require('jsonwebtoken');
const volunteerModel = require('../models/volunteerModel');

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Verify credentials
        const user = await volunteerModel.verifyCredentials(email, password);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'default_secret_key',
            { expiresIn: '24h' }
        );

        // Return user info and token
        const userDetails = await volunteerModel.getVolunteerById(user.id);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: userDetails
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Login failed due to server error' });
    }
};

module.exports = {
    login
};