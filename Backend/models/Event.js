const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventDescription: { type: String, required: true },
    eventLocation: { type: String, required: true },
    requiredSkills: { type: [String], required: true },
    urgency: { type: String, required: true },
    eventDate: { type: Date, required: true }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; // ✅ Export the model
