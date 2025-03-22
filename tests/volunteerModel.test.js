const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const bcrypt = require('bcrypt');

// Mock database connection and queries
const dbConfigMock = {
    executeQuery: sinon.stub(),
    pool: {
        getConnection: sinon.stub().resolves({
            beginTransaction: sinon.stub().resolves(),
            execute: sinon.stub().resolves([[], []]),
            commit: sinon.stub().resolves(),
            rollback: sinon.stub().resolves(),
            release: sinon.stub().resolves()
        })
    }
};

// Mock uuid
const uuidStub = sinon.stub().returns('test-uuid-1234');

// Create the volunteer model with our mocks
const volunteerModel = proxyquire('../backend/models/volunteerModel', {
    '../config/dbConfig': dbConfigMock,
    'uuid': { v4: uuidStub }
});

describe('Volunteer Model', () => {
    afterEach(() => {
        sinon.restore();
        dbConfigMock.executeQuery.reset();
    });

    describe('getAllVolunteers', () => {
        it('should get all volunteers without passwords', async () => {
            const mockVolunteers = [
                { id: 'v1', name: 'Test Volunteer', email: 'test@example.com' }
            ];

            dbConfigMock.executeQuery.resolves(mockVolunteers);

            const result = await volunteerModel.getAllVolunteers();

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockVolunteers);
        });

        it('should handle database errors', async () => {
            dbConfigMock.executeQuery.rejects(new Error('Database error'));

            try {
                await volunteerModel.getAllVolunteers();
                // If we reach here, test should fail
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('getVolunteerById', () => {
        it('should get a volunteer by ID with skills and availability', async () => {
            const mockVolunteer = { id: 'v1', name: 'Test Volunteer', email: 'test@example.com' };
            const mockSkills = [{ skill_name: 'First Aid' }, { skill_name: 'Driving' }];
            const mockAvailability = [{ date: '2023-11-15' }, { date: '2023-11-30' }];
            const mockPreferences = [{ max_distance: 30, type_name: 'Disaster Relief' }];

            // Setup stubs for sequential calls
            dbConfigMock.executeQuery.onFirstCall().resolves([mockVolunteer]);
            dbConfigMock.executeQuery.onSecondCall().resolves(mockSkills);
            dbConfigMock.executeQuery.onThirdCall().resolves(mockAvailability);
            dbConfigMock.executeQuery.onCall(3).resolves(mockPreferences);

            const result = await volunteerModel.getVolunteerById('v1');

            expect(dbConfigMock.executeQuery.callCount).to.equal(4);
            expect(result.id).to.equal('v1');
            expect(result.skills).to.deep.equal(['First Aid', 'Driving']);
            expect(result.availability).to.deep.equal(['2023-11-15', '2023-11-30']);
            expect(result.preferences.maxDistance).to.equal(30);
            expect(result.preferences.eventTypes).to.deep.equal(['Disaster Relief']);
        });

        it('should return null if volunteer not found', async () => {
            dbConfigMock.executeQuery.resolves([]);

            const result = await volunteerModel.getVolunteerById('nonexistent');

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result).to.be.null;
        });
    });

    describe('createVolunteer', () => {
        it('should create a volunteer and return the created volunteer', async () => {
            const mockVolunteerData = {
                name: 'New Volunteer',
                email: 'new@example.com',
                password: 'password123',
                skills: ['First Aid'],
                location: 'New York',
                availability: ['2023-11-15'],
                preferences: {
                    maxDistance: 30,
                    eventTypes: ['Disaster Relief']
                }
            };

            const mockCreatedVolunteer = {
                id: 'test-uuid-1234',
                name: 'New Volunteer',
                email: 'new@example.com',
                skills: ['First Aid'],
                location: 'New York',
                availability: ['2023-11-15'],
                preferences: {
                    maxDistance: 30,
                    eventTypes: ['Disaster Relief']
                }
            };

            // Mock bcrypt hash
            sinon.stub(bcrypt, 'hash').resolves('hashed_password');

            // Mock connection and transaction methods
            const connectionMock = {
                beginTransaction: sinon.stub().resolves(),
                execute: sinon.stub().resolves([[{ id: 1 }], []]),
                commit: sinon.stub().resolves(),
                rollback: sinon.stub().resolves(),
                release: sinon.stub().resolves()
            };

            dbConfigMock.pool.getConnection.resolves(connectionMock);

            // Mock getVolunteerById properly
            const getVolunteerByIdStub = sinon.stub(volunteerModel, 'getVolunteerById');
            getVolunteerByIdStub.withArgs('test-uuid-1234').resolves(mockCreatedVolunteer);

            const result = await volunteerModel.createVolunteer(mockVolunteerData);

            expect(uuidStub.calledOnce).to.be.true;
            expect(bcrypt.hash.calledOnce).to.be.true;
            expect(connectionMock.beginTransaction.calledOnce).to.be.true;
            expect(connectionMock.commit.calledOnce).to.be.true;
            expect(connectionMock.release.calledOnce).to.be.true;
            expect(getVolunteerByIdStub.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockCreatedVolunteer);

            // Restore the stub at the end of the test
            getVolunteerByIdStub.restore();
        });

        it('should rollback transaction on error', async () => {
            const mockVolunteerData = {
                name: 'New Volunteer',
                email: 'new@example.com',
                password: 'password123'
            };

            // Mock bcrypt hash
            sinon.stub(bcrypt, 'hash').resolves('hashed_password');

            // Mock connection and transaction methods with execute throwing an error
            const connectionMock = {
                beginTransaction: sinon.stub().resolves(),
                execute: sinon.stub().rejects(new Error('Database error')),
                commit: sinon.stub().resolves(),
                rollback: sinon.stub().resolves(),
                release: sinon.stub().resolves()
            };

            dbConfigMock.pool.getConnection.resolves(connectionMock);

            try {
                await volunteerModel.createVolunteer(mockVolunteerData);
                // If we reach here, test should fail
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(connectionMock.rollback.calledOnce).to.be.true;
                expect(connectionMock.release.calledOnce).to.be.true;
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('getVolunteerHistory', () => {
        it('should get volunteer history with required skills as arrays', async () => {
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

            const result = await volunteerModel.getVolunteerHistory('v1');

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result[0].requiredSkills).to.deep.equal(['First Aid', 'Driving']);
        });
    });

    describe('verifyCredentials', () => {
        it('should verify correct credentials and return user ID', async () => {
            const mockUser = { id: 'v1', password: 'hashed_password' };

            dbConfigMock.executeQuery.resolves([mockUser]);

            // Mock bcrypt compare
            sinon.stub(bcrypt, 'compare').resolves(true);

            const result = await volunteerModel.verifyCredentials('test@example.com', 'password123');

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(bcrypt.compare.calledOnce).to.be.true;
            expect(result).to.deep.equal({ id: 'v1' });
        });

        it('should return null for incorrect password', async () => {
            const mockUser = { id: 'v1', password: 'hashed_password' };

            dbConfigMock.executeQuery.resolves([mockUser]);

            // Mock bcrypt compare
            sinon.stub(bcrypt, 'compare').resolves(false);

            const result = await volunteerModel.verifyCredentials('test@example.com', 'wrong_password');

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(bcrypt.compare.calledOnce).to.be.true;
            expect(result).to.be.null;
        });

        it('should return null for non-existent user', async () => {
            dbConfigMock.executeQuery.resolves([]);

            const result = await volunteerModel.verifyCredentials('nonexistent@example.com', 'password');

            expect(dbConfigMock.executeQuery.calledOnce).to.be.true;
            expect(result).to.be.null;
        });
    });
});