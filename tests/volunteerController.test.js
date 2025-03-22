const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Mock data
const mockData = {
    volunteers: [
        {
            id: 'v1',
            name: 'Test Volunteer',
            email: 'test@example.com',
            password: 'password',
            skills: ['First Aid'],
            location: 'Test Location',
            availability: ['2023-11-15']
        }
    ],
    events: [
        {
            id: 'e1',
            name: 'Test Event',
            requiredSkills: ['First Aid'],
            location: 'Test Location',
            date: '2023-11-15'
        }
    ],
    matches: [
        {
            id: 'm1',
            volunteerId: 'v1',
            eventId: 'e1',
            status: 'Matched',
            matchScore: 90,
            createdAt: '2023-11-01',
            updatedAt: '2023-11-01'
        }
    ]
};

describe('Volunteer Controller', () => {
    let req, res;
    let volunteerController;

    beforeEach(() => {
        // Create controller with mock data
        volunteerController = proxyquire('../backend/controllers/volunteerController', {
            '../data/mockData': mockData
        });

        // Mock request and response objects
        req = {
            params: {},
            body: {}
        };

        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        sinon.stub(res.status, 'calledWith').returns(true);
    });

    afterEach(() => {
        // Clean up all sinon stubs, spies, and mocks
        sinon.restore();
    });

    describe('getAllVolunteers', () => {
        it('should return all volunteers without passwords', () => {
            volunteerController.getAllVolunteers(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedVolunteers = res.json.firstCall.args[0];
            expect(returnedVolunteers).to.be.an('array');
            expect(returnedVolunteers[0]).to.not.have.property('password');
        });

        it('should handle errors', () => {
            // Create a separate controller for error testing
            const consoleError = sinon.stub(console, 'error');

            // Force an error safely
            const errorController = proxyquire('../backend/controllers/volunteerController', {
                '../data/mockData': {
                    events: [],
                    volunteers: [],
                    matches: []
                },
                '../models/volunteerModel': {
                    getAllVolunteers: () => { throw new Error('Test error'); }
                }
            });

            errorController.getAllVolunteers(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('getVolunteerById', () => {
        it('should return a volunteer by ID without password', () => {
            req.params.id = 'v1';

            volunteerController.getVolunteerById(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedVolunteer = res.json.firstCall.args[0];
            expect(returnedVolunteer).to.be.an('object');
            expect(returnedVolunteer.id).to.equal('v1');
            expect(returnedVolunteer).to.not.have.property('password');
        });

        it('should return 404 for non-existent volunteer', () => {
            req.params.id = 'nonexistent';

            volunteerController.getVolunteerById(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('createVolunteer', () => {
        it('should create a new volunteer', () => {
            req.body = {
                name: 'New Volunteer',
                email: 'new@example.com',
                password: 'password',
                skills: ['Cooking'],
                location: 'New Location',
                availability: ['2023-12-01'],
                preferences: { maxDistance: 30 }
            };

            const originalLength = mockData.volunteers.length;

            volunteerController.createVolunteer(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedVolunteer = res.json.firstCall.args[0];
            expect(returnedVolunteer).to.be.an('object');
            expect(returnedVolunteer.name).to.equal('New Volunteer');
            expect(returnedVolunteer).to.not.have.property('password');

            // Restore the original data after test
            mockData.volunteers.length = originalLength;
        });

        it('should prevent duplicate emails', () => {
            req.body = {
                name: 'Duplicate Email',
                email: 'test@example.com', // This email already exists
                password: 'password',
                skills: ['Cooking'],
                location: 'New Location',
                availability: ['2023-12-01']
            };

            volunteerController.createVolunteer(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
            expect(res.json.firstCall.args[0].error).to.include('Email already in use');
        });
    });

    describe('updateVolunteer', () => {
        it('should update a volunteer', () => {
            req.params.id = 'v1';
            req.body = {
                name: 'Updated Name'
            };

            volunteerController.updateVolunteer(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedVolunteer = res.json.firstCall.args[0];
            expect(returnedVolunteer).to.be.an('object');
            expect(returnedVolunteer.name).to.equal('Updated Name');

            // Reset the name
            mockData.volunteers[0].name = 'Test Volunteer';
        });

        it('should return 404 for non-existent volunteer', () => {
            req.params.id = 'nonexistent';
            req.body = {
                name: 'Updated Name'
            };

            volunteerController.updateVolunteer(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('deleteVolunteer', () => {
        it('should delete a volunteer', () => {
            // First add a volunteer that we can delete
            mockData.volunteers.push({
                id: 'v-to-delete',
                name: 'To Be Deleted',
                email: 'delete@example.com',
                skills: []
            });

            req.params.id = 'v-to-delete';

            volunteerController.deleteVolunteer(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('message');
            expect(res.json.firstCall.args[0].message).to.include('deleted successfully');

            // Verify volunteer was removed
            const deletedVolunteer = mockData.volunteers.find(v => v.id === 'v-to-delete');
            expect(deletedVolunteer).to.be.undefined;
        });

        it('should return 404 for non-existent volunteer', () => {
            req.params.id = 'nonexistent';

            volunteerController.deleteVolunteer(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('getVolunteerHistory', () => {
        it('should return volunteer history', () => {
            req.params.id = 'v1';

            volunteerController.getVolunteerHistory(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const history = res.json.firstCall.args[0];
            expect(history).to.be.an('array');
            expect(history.length).to.be.at.least(1);
            expect(history[0]).to.have.property('volunteerId', 'v1');
            expect(history[0]).to.have.property('eventId', 'e1');
        });

        it('should return 404 for non-existent volunteer', () => {
            req.params.id = 'nonexistent';

            volunteerController.getVolunteerHistory(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });
});