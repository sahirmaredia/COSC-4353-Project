// Mock data for volunteers
export const mockVolunteers = [
    {
        id: 1,
        name: 'John Doe',
        skills: ['Teaching', 'First Aid'],
        availability: ['2024-03-15', '2024-03-16', '2024-03-17'],
        location: 'Houston, TX'
    },
    {
        id: 2,
        name: 'Jane Smith',
        skills: ['Cooking', 'Driving'],
        availability: ['2024-03-14', '2024-03-15', '2024-03-16'],
        location: 'Austin, TX'
    },
    {
        id: 3,
        name: 'Bob Johnson',
        skills: ['First Aid', 'Construction'],
        availability: ['2024-03-16', '2024-03-17', '2024-03-18'],
        location: 'Dallas, TX'
    }
];

// Mock data for events
export const mockEvents = [
    {
        id: 1,
        name: 'Community Teaching Workshop',
        description: 'Teaching basic math to elementary students',
        requiredSkills: ['Teaching'],
        date: '2024-03-15',
        location: 'Houston Downtown Community Center',
        urgency: 'Medium'
    },
    {
        id: 2,
        name: 'Local Food Drive',
        description: 'Collecting and distributing food to local families',
        requiredSkills: ['Cooking', 'Driving'],
        date: '2024-03-16',
        location: 'Austin Food Bank',
        urgency: 'High'
    },
    {
        id: 3,
        name: 'Hurricane Relief',
        description: 'Providing first aid and construction help',
        requiredSkills: ['First Aid', 'Construction'],
        date: '2024-03-17',
        location: 'Dallas Relief Center',
        urgency: 'High'
    }
];

// Mock status options
export const statusOptions = [
    'Pending',
    'Matched',
    'Completed',
    'Cancelled'
];