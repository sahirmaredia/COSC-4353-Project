const express = require('express');
const matchingController = require('../controllers/matchingController');
const { validateMatching } = require('../middleware/validation');

const router = express.Router();

// Specific paths first to avoid route conflicts
router.get('/history/all', matchingController.getAllMatchHistory);
router.get('/recommendations/event/:eventId', matchingController.getRecommendedVolunteers);
router.get('/recommendations/volunteer/:volunteerId', matchingController.getRecommendedEvents);

// Then generic routes
router.get('/', matchingController.getAllMatches);
router.get('/:id', matchingController.getMatchById);
router.post('/', validateMatching, matchingController.createMatch);
router.put('/:id/status', matchingController.updateMatchStatus);
router.delete('/:id', matchingController.deleteMatch);

module.exports = router;