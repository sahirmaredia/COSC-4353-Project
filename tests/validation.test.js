const { expect } = require('chai');
const sinon = require('sinon');
const { validateVolunteer, validateEvent, validateMatching } = require('../backend/middleware/validation');

describe('Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {}
        };

        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        next = sinon.spy();
    });

    describe('validateVolunteer', () => {
        it('should pass valid volunteer data', () => {
            req.body = {
                name: 'Test Volunteer',
                email: 'test@example.com',
                skills: ['First Aid', 'Cooking'],
                location: 'New York',
                availability: ['2023-11-15', '2023-11-16']
            };

            validateVolunteer(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should reject missing name', () => {
            req.body = {
                email: 'test@example.com',
                skills: ['First Aid'],
                location: 'New York',
                availability: ['2023-11-15']
            };

            validateVolunteer(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors).to.include.members(['Name is required']);
        });

        it('should reject invalid email', () => {
            req.body = {
                name: 'Test Volunteer',
                email: 'not-an-email',
                skills: ['First Aid'],
                location: 'New York',
                availability: ['2023-11-15']
            };

            validateVolunteer(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors.some(error => error.includes('Email'))).to.be.true;
        });

        it('should reject empty skills array', () => {
            req.body = {
                name: 'Test Volunteer',
                email: 'test@example.com',
                skills: [],
                location: 'New York',
                availability: ['2023-11-15']
            };

            validateVolunteer(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors.some(error => error.includes('Skills'))).to.be.true;
        });

        it('should reject invalid date format', () => {
            req.body = {
                name: 'Test Volunteer',
                email: 'test@example.com',
                skills: ['First Aid'],
                location: 'New York',
                availability: ['11/15/2023'] // Wrong format
            };

            validateVolunteer(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors.some(error => error.includes('date'))).to.be.true;
        });
    });

    describe('validateEvent', () => {
        it('should pass valid event data', () => {
            req.body = {
                name: 'Test Event',
                description: 'This is a test event description',
                date: '2023-11-15',
                location: 'New York',
                requiredSkills: ['First Aid', 'Cooking'],
                urgency: 'Medium'
            };

            validateEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should reject missing required fields', () => {
            req.body = {
                name: 'Test Event',
                // Missing description, date, etc.
            };

            validateEvent(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors.length).to.be.at.least(1);
        });

        it('should reject invalid urgency value', () => {
            req.body = {
                name: 'Test Event',
                description: 'This is a test event description',
                date: '2023-11-15',
                location: 'New York',
                requiredSkills: ['First Aid'],
                urgency: 'Invalid' // Not in Low, Medium, High
            };

            validateEvent(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors.some(error => error.includes('Urgency'))).to.be.true;
        });
    });

    describe('validateMatching', () => {
        it('should pass valid matching data', () => {
            req.body = {
                volunteerId: 'v1',
                eventId: 'e1'
            };

            validateMatching(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should reject missing volunteerId', () => {
            req.body = {
                eventId: 'e1'
                // Missing volunteerId
            };

            validateMatching(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors.some(error => error.includes('Volunteer ID'))).to.be.true;
        });

        it('should reject missing eventId', () => {
            req.body = {
                volunteerId: 'v1'
                // Missing eventId
            };

            validateMatching(req, res, next);

            expect(next.called).to.be.false;
            expect(res.status.calledWith(400)).to.be.true;

            const errors = res.json.firstCall.args[0].errors;
            expect(errors.some(error => error.includes('Event ID'))).to.be.true;
        });
    });
});