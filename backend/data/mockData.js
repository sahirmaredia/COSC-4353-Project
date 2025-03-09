// Mock data to simulate database

const volunteers = [
    {
        id: 'v1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'hashed_password_1', // In real implementation, passwords would be hashed
        skills: ['First Aid', 'Driving', 'Cooking'],
        location: 'New York',
        availability: ['2023-11-01', '2023-11-15', '2023-11-30'],
        preferences: {
            eventTypes: ['Disaster Relief', 'Community Service'],
            maxDistance: 30 // miles
        },
        createdAt: '2023-10-01'
    },
    {
        id: 'v2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'hashed_password_2',
        skills: ['Teaching', 'Counseling', 'Organization'],
        location: 'Boston',
        availability: ['2023-11-05', '2023-11-10', '2023-11-20'],
        preferences: {
            eventTypes: ['Education', 'Healthcare'],
            maxDistance: 20
        },
        createdAt: '2023-10-05'
    },
    {
        id: 'v3',
        name: 'Michael Johnson',
        email: 'michael.j@example.com',
        password: 'hashed_password_3',
        skills: ['Construction', 'Heavy Lifting', 'First Aid'],
        location: 'Chicago',
        availability: ['2023-11-03', '2023-11-17', '2023-11-25'],
        preferences: {
            eventTypes: ['Disaster Relief', 'Construction'],
            maxDistance: 50
        },
        createdAt: '2023-10-10'
    }
];

const events = [
    {
        id: 'e1',
        name: 'Community Food Drive',
        description: 'Collecting and distributing food to local shelters',
        date: '2023-11-15',
        location: 'New York',
        requiredSkills: ['Organization', 'Cooking', 'Driving'],
        urgency: 'Medium',
        status: 'Active',
        createdAt: '2023-10-15'
    },
    {
        id: 'e2',
        name: 'Disaster Response Training',
        description: 'Training session for emergency response volunteers',
        date: '2023-11-10',
        location: 'Boston',
        requiredSkills: ['First Aid', 'Organization', 'Teaching'],
        urgency: 'High',
        status: 'Active',
        createdAt: '2023-10-18'
    },
    {
        id: 'e3',
        name: 'School Renovation Project',
        description: 'Repairs and updates to local elementary school',
        date: '2023-11-25',
        location: 'Chicago',
        requiredSkills: ['Construction', 'Heavy Lifting', 'Organization'],
        urgency: 'Medium',
        status: 'Active',
        createdAt: '2023-10-20'
    }
];

const statusOptions = ['Pending', 'Matched', 'Completed', 'Cancelled'];

// This will store volunteer-event matches
const matches = [
    {
        id: 'm1',
        volunteerId: 'v1',
        eventId: 'e1',
        status: 'Completed',
        matchScore: 85,
        createdAt: '2023-10-25',
        updatedAt: '2023-11-16'
    },
    {
        id: 'm2',
        volunteerId: 'v2',
        eventId: 'e2',
        status: 'Matched',
        matchScore: 92,
        createdAt: '2023-10-27',
        updatedAt: '2023-10-27'
    }
];

// This will store notifications
const notifications = [
    {
        id: 'n1',
        userId: 'v1',
        message: 'You have been matched with Community Food Drive',
        type: 'match',
        read: true,
        createdAt: '2023-10-25'
    },
    {
        id: 'n2',
        userId: 'v2',
        message: 'You have been matched with Disaster Response Training',
        type: 'match',
        read: false,
        createdAt: '2023-10-27'
    }
];

// Authentication tokens (would be JWT in real implementation)
const tokens = {
    'v1': 'mock-auth-token-1',
    'v2': 'mock-auth-token-2',
    'v3': 'mock-auth-token-3'
};

module.exports = {
    volunteers,
    events,
    statusOptions,
    matches,
    notifications,
    tokens
};