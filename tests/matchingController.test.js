const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Mock matchingService
const matchingServiceStub = {
    calculateMatchScore: sinon.stub().returns(75),
    findVolunteersForEvent: sinon.stub().returns([{ id: 'v1', matchScore: 75 }]),
    findEventsForVolunteer: sinon.stub().returns([{ id: 'e1', matchScore: 75 }])
};

// Mock data
const mockData = {
    volunteers: [
        {
            id: 'v1',
            name: 'Test Volunteer',
            skills: ['First Aid'],
            location: 'New York',
            availability: ['2023-11-15']
        }
    ],
    events: [
        {
            id: 'e1',
            name: 'Test Event',
            description: 'Test event description',
            requiredSkills: ['First Aid'],
            location: 'New York',
            date: '2023-11-15',
            urgency: 'Medium'
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

describe('Matching Controller', () => {
    let req, res;
    let matchingController;

    beforeEach(() => {
        // Reset stubs
        matchingServiceStub.calculateMatchScore.reset();
        matchingServiceStub.findVolunteersForEvent.reset();
        matchingServiceStub.findEventsForVolunteer.reset();

        // Create controller with mocked dependencies
        matchingController = proxyquire('../backend/controllers/matchingController', {
            '../data/mockData': mockData,
            '../services/matchingService': matchingServiceStub
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
    });

    afterEach(() => {
        // Clean up all sinon stubs, spies, and mocks
        sinon.restore();
    });

    describe('getAllMatches', () => {
        it('should return all matches', () => {
            matchingController.getAllMatches(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedMatches = res.json.firstCall.args[0];
            expect(returnedMatches).to.be.an('array');
            expect(returnedMatches.length).to.equal(mockData.matches.length);
        });
    });

    describe('getMatchById', () => {
        it('should return a match by ID', () => {
            req.params.id = 'm1';

            matchingController.getMatchById(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedMatch = res.json.firstCall.args[0];
            expect(returnedMatch).to.be.an('object');
            expect(returnedMatch.id).to.equal('m1');
        });

        it('should return 404 for non-existent match', () => {
            req.params.id = 'nonexistent';

            matchingController.getMatchById(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('createMatch', () => {
        it('should create a new match', () => {
            req.body = {
                volunteerId: 'v1',
                eventId: 'e1'
            };

            // Set up unique case for this test to avoid duplicate match error
            const testMockData = {
                volunteers: [...mockData.volunteers],
                events: [...mockData.events],
                matches: [] // Empty matches to avoid duplicate error
            };

            const testController = proxyquire('../backend/controllers/matchingController', {
                '../data/mockData': testMockData,
                '../services/matchingService': matchingServiceStub
            });

            testController.createMatch(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedMatch = res.json.firstCall.args[0];
            expect(returnedMatch).to.be.an('object');
            expect(returnedMatch.volunteerId).to.equal('v1');
            expect(returnedMatch.eventId).to.equal('e1');
            expect(returnedMatch.status).to.equal('Matched');

            // Verify matchingService was called
            expect(matchingServiceStub.calculateMatchScore.calledOnce).to.be.true;
        });

        it('should return 404 if volunteer not found', () => {
            req.body = {
                volunteerId: 'nonexistent',
                eventId: 'e1'
            };

            matchingController.createMatch(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
            expect(res.json.firstCall.args[0].error).to.include('Volunteer not found');
        });

        it('should return 404 if event not found', () => {
            req.body = {
                volunteerId: 'v1',
                eventId: 'nonexistent'
            };

            matchingController.createMatch(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
            expect(res.json.firstCall.args[0].error).to.include('Event not found');
        });

        it('should return 400 if match already exists', () => {
            req.body = {
                volunteerId: 'v1',
                eventId: 'e1'
            };

            matchingController.createMatch(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
            expect(res.json.firstCall.args[0].error).to.include('Match already exists');
        });
    });

    describe('updateMatchStatus', () => {
        it('should update a match status', () => {
            req.params.id = 'm1';
            req.body = {
                status: 'Completed'
            };

            matchingController.updateMatchStatus(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const returnedMatch = res.json.firstCall.args[0];
            expect(returnedMatch).to.be.an('object');
            expect(returnedMatch.id).to.equal('m1');
            expect(returnedMatch.status).to.equal('Completed');

            // Reset status
            mockData.matches[0].status = 'Matched';
        });

        it('should return 400 for invalid status', () => {
            req.params.id = 'm1';
            req.body = {
                status: 'InvalidStatus'
            };

            matchingController.updateMatchStatus(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
            expect(res.json.firstCall.args[0].error).to.include('Invalid status');
        });

        it('should return 404 for non-existent match', () => {
            req.params.id = 'nonexistent';
            req.body = {
                status: 'Completed'
            };

            matchingController.updateMatchStatus(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('deleteMatch', () => {
        it('should delete a match', () => {
            // First add a match that we can delete
            mockData.matches.push({
                id: 'm-to-delete',
                volunteerId: 'v1',
                eventId: 'e1'
            });

            req.params.id = 'm-to-delete';

            matchingController.deleteMatch(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('message');
            expect(res.json.firstCall.args[0].message).to.include('deleted successfully');

            // Verify match was removed
            const deletedMatch = mockData.matches.find(m => m.id === 'm-to-delete');
            expect(deletedMatch).to.be.undefined;
        });

        it('should return 404 for non-existent match', () => {
            req.params.id = 'nonexistent';

            matchingController.deleteMatch(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('getRecommendedVolunteers', () => {
        it('should return recommended volunteers for an event', () => {
            req.params.eventId = 'e1';

            // Ensure the stub returns an array for this test
            matchingServiceStub.findVolunteersForEvent.returns([
                { id: 'v1', name: 'Test Volunteer', matchScore: 85 }
            ]);

            matchingController.getRecommendedVolunteers(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const recommendations = res.json.firstCall.args[0];
            expect(recommendations).to.be.an('array');

            // Verify service was called
            expect(matchingServiceStub.findVolunteersForEvent.calledOnce).to.be.true;
            expect(matchingServiceStub.findVolunteersForEvent.calledWith('e1')).to.be.true;
        });

        it('should return 404 for non-existent event', () => {
            req.params.eventId = 'nonexistent';

            matchingController.getRecommendedVolunteers(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('getRecommendedEvents', () => {
        it('should return recommended events for a volunteer', () => {
            req.params.volunteerId = 'v1';

            // Ensure the stub returns an array for this test
            matchingServiceStub.findEventsForVolunteer.returns([
                { id: 'e1', name: 'Test Event', matchScore: 85 }
            ]);

            matchingController.getRecommendedEvents(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const recommendations = res.json.firstCall.args[0];
            expect(recommendations).to.be.an('array');

            // Verify service was called
            expect(matchingServiceStub.findEventsForVolunteer.calledOnce).to.be.true;
            expect(matchingServiceStub.findEventsForVolunteer.calledWith('v1')).to.be.true;
        });

        it('should return 404 for non-existent volunteer', () => {
            req.params.volunteerId = 'nonexistent';

            matchingController.getRecommendedEvents(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });
    });

    describe('getAllMatchHistory', () => {
        it('should return all match history', () => {
            matchingController.getAllMatchHistory(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const history = res.json.firstCall.args[0];
            expect(history).to.be.an('array');
            expect(history.length).to.equal(mockData.matches.length);
            expect(history[0]).to.have.property('volunteerName');
            expect(history[0]).to.have.property('eventName');
        });
    });
});