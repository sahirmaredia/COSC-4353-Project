const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const volunteerRoutes = require('./routes/volunteerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const matchingRoutes = require('./routes/matchingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/matching', matchingRoutes);

// Basic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;