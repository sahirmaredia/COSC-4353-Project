const express = require('express');
const eventController = require('../controllers/eventController');
const { validateEvent } = require('../middleware/validation');

const router = express.Router();

// Get all events
router.get('/', eventController.getAllEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Create new event
router.post('/', validateEvent, eventController.createEvent);

// Update event
router.put('/:id', validateEvent, eventController.updateEvent);

// Delete event
router.delete('/:id', eventController.deleteEvent);

// Get volunteers for an event
router.get('/:id/volunteers', eventController.getEventVolunteers);

module.exports = router;