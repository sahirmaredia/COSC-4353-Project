const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Mock database connection and queries
const dbConfigMock = {
    executeQuery: sinon.stub()
};

// Mock uuid
const uuidStub = sinon.stub().returns('test-uuid-1234');

// Mock volunteer and event models
const volunteerModelMock = {
    getVolunteerById: sinon.stub(),
    getAllVolunteers: sinon.stub()
};

const eventModelMock = {
    getEventById: sinon.stub(),
    getAllEvents: sinon.stub()
};

// Set up default return values for the stubs
volunteerModelMock.getVolunteerById.returns({
    id: 'v1',
    name: 'Test Volunteer',
    skills: ['First Aid'],
    location: 'New York',
    availability: ['2023-11-15']
});

eventModelMock.getEventById.returns({
    id: 'e1',
    name: 'Test Event',
    requiredSkills: ['First Aid'],
    location: 'New York',
    date: '2023-11-15'
});

// Create the matching model with our mocks
const matchingModel = proxyquire('../backend/models/matchingModel', {
    '../config/dbConfig': dbConfigMock,
    'uuid': { v4: uuidStub },
    './volunteerModel': volunteerModelMock,
    './eventModel': eventModelMock
});

describe('Matching Model', () => {
    afterEach(() => {
        sinon.restore();
        dbConfigMock.executeQuery.reset();
        volunteerModelMock.getVolunteerById.reset();
        volunteerModelMock.getAllVolunteers.reset();
        eventModelMock.getEventById.reset();
        eventModelMock.getAllEvents.reset();
    });

    describe('getAllMatches', () => {
        it('should get all matches', async () => {
            const mockMatches = [
                { id: 'm1', volunteerId: 'v1', eventId: 'e1', status: 'Matched' }
            ];

            dbConfigMock.executeQuery.resolves(mockMatches);

            const result = await matchingModel.getAllMatches();

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockMatches);
        });
    });

    describe('getMatchById', () => {
        it('should get a match by ID', async () => {
            const mockMatch = { id: 'm1', volunteerId: 'v1', eventId: 'e1', status: 'Matched' };

            dbConfigMock.executeQuery.resolves([mockMatch]);

            const result = await matchingModel.getMatchById('m1');

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockMatch);
        });

        it('should return null if match not found', async () => {
            dbConfigMock.executeQuery.resolves([]);

            const result = await matchingModel.getMatchById('nonexistent');

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result).to.be.null;
        });
    });

    describe('createMatch', () => {
        it('should create a match and return the created match', async () => {
            const mockMatchData = {
                volunteerId: 'v1',
                eventId: 'e1',
                matchScore: 85
            };

            const mockCreatedMatch = {
                id: 'test-uuid-1234',
                volunteerId: 'v1',
                eventId: 'e1',
                status: 'Matched',
                matchScore: 85
            };

            dbConfigMock.executeQuery.resolves();

            sinon.stub(matchingModel, 'getMatchById').resolves({
                id: 'test-uuid-1234',
                volunteerId: 'v1',
                eventId: 'e1',
                status: 'Matched',
                matchScore: 85
            });

            const result = await matchingModel.createMatch(mockMatchData);

            expect(uuidStub.calledOnce).to.be.true;
            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(matchingModel.getMatchById.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockCreatedMatch);
        });
    });

    describe('calculateMatchScore', () => {
        it('should calculate a perfect match score correctly', async () => {
            const mockVolunteer = {
                id: 'v1',
                name: 'Test Volunteer',
                skills: ['First Aid', 'Driving'],
                location: 'New York',
                availability: ['2023-11-15']
            };

            const mockEvent = {
                id: 'e1',
                name: 'Test Event',
                requiredSkills: ['First Aid', 'Driving'],
                location: 'New York',
                date: '2023-11-15'
            };

            volunteerModelMock.getVolunteerById.resolves(mockVolunteer);
            eventModelMock.getEventById.resolves(mockEvent);

            const result = await matchingModel.calculateMatchScore('v1', 'e1');

            expect(volunteerModelMock.getVolunteerById.calledOnce).to.be.true;
            expect(eventModelMock.getEventById.calledOnce).to.be.true;
            expect(result).to.equal(100); // Perfect match: 60 (skills) + 30 (availability) + 10 (location)
        });

        it('should calculate a partial match score', async () => {
            const mockVolunteer = {
                id: 'v1',
                name: 'Test Volunteer',
                skills: ['First Aid'], // Only one skill match
                location: 'Boston', // Different location
                availability: ['2023-11-15'] // Same date
            };

            const mockEvent = {
                id: 'e1',
                name: 'Test Event',
                requiredSkills: ['First Aid', 'Driving'],
                location: 'New York',
                date: '2023-11-15'
            };

            volunteerModelMock.getVolunteerById.resolves(mockVolunteer);
            eventModelMock.getEventById.resolves(mockEvent);

            const result = await matchingModel.calculateMatchScore('v1', 'e1');

            // 30 (half of skills) + 30 (availability) + 0 (location) = 60
            expect(result).to.equal(60);
        });

        it('should return 0 if volunteer or event not found', async () => {
            volunteerModelMock.getVolunteerById.resolves(null);
            eventModelMock.getEventById.resolves({
                id: 'e1',
                requiredSkills: ['First Aid']
            });

            const result = await matchingModel.calculateMatchScore('nonexistent', 'e1');

            expect(result).to.equal(0);
        });
    });

    describe('getAllMatchHistory', () => {
        it('should get all match history with required skills as arrays', async () => {
            const mockHistory = [
                {
                    matchId: 'm1',
                    volunteerId: 'v1',
                    volunteerName: 'Test Volunteer',
                    eventId: 'e1',
                    eventName: 'Test Event',
                    requiredSkills: 'First Aid,Driving'
                }
            ];

            dbConfigMock.executeQuery.resolves(mockHistory);

            const result = await matchingModel.getAllMatchHistory();

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result[0].requiredSkills).to.deep.equal(['First Aid', 'Driving']);
        });
    });

    describe('getRecommendedVolunteers', () => {
        it('should return recommended volunteers sorted by match score', async () => {
            const mockEvent = {
                id: 'e1',
                name: 'Test Event',
                requiredSkills: ['First Aid', 'Driving'],
                location: 'New York',
                date: '2023-11-15'
            };

            const mockVolunteers = [
                { id: 'v1', name: 'Volunteer 1' },
                { id: 'v2', name: 'Volunteer 2' }
            ];

            const mockVolunteerDetails1 = {
                id: 'v1',
                name: 'Volunteer 1',
                skills: ['First Aid', 'Driving'],
                location: 'New York',
                availability: ['2023-11-15']
            };

            const mockVolunteerDetails2 = {
                id: 'v2',
                name: 'Volunteer 2',
                skills: ['First Aid'],
                location: 'Boston',
                availability: ['2023-11-15']
            };

            // Mock existing matches to exclude already matched volunteers
            dbConfigMock.executeQuery.resolves([]);

            eventModelMock.getEventById.resolves(mockEvent);
            volunteerModelMock.getAllVolunteers.resolves(mockVolunteers);

            // Mock getVolunteerById for detailed volunteer info
            volunteerModelMock.getVolunteerById
                .withArgs('v1').resolves(mockVolunteerDetails1)
                .withArgs('v2').resolves(mockVolunteerDetails2);

            // Mock calculateMatchScore
            sinon.stub(matchingModel, 'calculateMatchScore')
                .withArgs('v1', 'e1').resolves(100)
                .withArgs('v2', 'e1').resolves(60);

            const result = await matchingModel.getRecommendedVolunteers('e1');

            expect(eventModelMock.getEventById.calledOnce).to.be.true;
            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(volunteerModelMock.getAllVolunteers.calledOnce).to.be.true;
            expect(volunteerModelMock.getVolunteerById.callCount).to.equal(2);
            expect(matchingModel.calculateMatchScore.callCount).to.equal(2);

            // Check results are sorted by score (highest first)
            expect(result.length).to.equal(2);
            expect(result[0].id).to.equal('v1');
            expect(result[0].matchScore).to.equal(100);
            expect(result[1].id).to.equal('v2');
            expect(result[1].matchScore).to.equal(60);
        });

        it('should return empty array if event not found', async () => {
            eventModelMock.getEventById.resolves(null);

            const result = await matchingModel.getRecommendedVolunteers('nonexistent');

            expect(eventModelMock.getEventById.calledOnce).to.be.true;
            expect(result).to.be.an('array').that.is.empty;
        });
    });
});