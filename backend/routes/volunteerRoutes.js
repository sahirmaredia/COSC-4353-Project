const express = require('express');
const volunteerController = require('../controllers/volunteerController');
const { validateVolunteer } = require('../middleware/validation');

const router = express.Router();

// Get all volunteers
router.get('/', volunteerController.getAllVolunteers);

// Get volunteer by ID
router.get('/:id', volunteerController.getVolunteerById);

// Create new volunteer
router.post('/', validateVolunteer, volunteerController.createVolunteer);

// Update volunteer
router.put('/:id', validateVolunteer, volunteerController.updateVolunteer);

// Delete volunteer
router.delete('/:id', volunteerController.deleteVolunteer);

// Get volunteer history (all events for a volunteer)
router.get('/:id/history', volunteerController.getVolunteerHistory);

module.exports = router;