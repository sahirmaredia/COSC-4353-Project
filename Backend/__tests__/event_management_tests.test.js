const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // ✅ Import only the app (not the server)
const Event = require('../models/Event');

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://127.0.0.1:27017/eventManagementTest');
    }
});

// Clear the events collection before each test
beforeEach(async () => {
    await Event.deleteMany({});
});


afterAll(async () => {
    await mongoose.connection.close();
});

// Test for creating an event
describe('POST /events', () => {
    it('should create a new event successfully', async () => {
        const response = await request(app)
            .post('/events')
            .send({
                eventName: 'Test Event',
                eventDescription: 'This is a test event.',
                eventLocation: 'Test Location', // ✅ Required Field Added
                requiredSkills: ['Leadership', 'Communication'], // ✅ Required Field Added
                urgency: 'High', // ✅ Required Field Added
                eventDate: '2025-05-01', // ✅ Required Field Added
            });
    
        expect(response.status).toBe(201);
        expect(response.body.event.eventName).toBe('Test Event');
    });

    it('should return a 400 error when required fields are missing', async () => {
        const response = await request(app)
            .post('/events')
            .send({
                eventName: '', // Missing required fields
                eventDescription: 'No event name provided'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });
});

// Test for retrieving all events
describe('GET /events', () => {
    it('should return an empty array if no events exist', async () => {
        const response = await request(app).get('/events');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should return an array of events', async () => {
        await Event.create({
            eventName: 'Sample Event',
            eventDescription: 'Sample description',
            eventLocation: 'New York',
            requiredSkills: ['Problem Solving'],
            urgency: 'Medium',
            eventDate: '2025-05-10'
        });

        const response = await request(app).get('/events');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });
});

// Test for updating an event
describe('PUT /events/:id', () => {
    it('should update an existing event', async () => {
        // ✅ Create an event before attempting to update it
        const event = await Event.create({
            eventName: 'Original Event',
            eventDescription: 'This event will be updated',
            eventLocation: 'Test Location',
            requiredSkills: ['Leadership'],
            urgency: 'Medium',
            eventDate: '2025-06-15',
        });

        // ✅ Make sure the event was created before proceeding
        const createdEvent = await Event.findById(event._id);
        expect(createdEvent).not.toBeNull(); // Ensure event exists

        // ✅ Use the correct event ID for updating
        const response = await request(app)
            .put(`/events/${event._id}`)
            .send({ eventName: 'Updated Event' });

        expect(response.status).toBe(200);
        expect(response.body.event.eventName).toBe('Updated Event');
    });
});


// Test for deleting an event
describe('DELETE /events/:id', () => {
    it('should delete an existing event', async () => {
        // ✅ Create an event before deleting
        const event = await Event.create({
            eventName: 'Event to Delete',
            eventDescription: 'This event will be deleted',
            eventLocation: 'Austin',
            requiredSkills: ['Technical'],
            urgency: 'High',
            eventDate: '2025-07-20',
        });
    
        // ✅ Delete the event
        const response = await request(app).delete(`/events/${event._id}`);
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Event deleted successfully');
    });

    it('should return 404 if event does not exist', async () => {
        const response = await request(app).delete('/events/650c451b8f1b2a39aabcde12'); // Non-existing ID
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Event not found');
    });
});
