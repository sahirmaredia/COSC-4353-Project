import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add auth token to all requests
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
            // Redirect to login page if unauthorized
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth services
const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/register', userData);
        return response.data;
    }
};

// Volunteer services
const volunteerService = {
    getAllVolunteers: async () => {
        const response = await api.get('/volunteers');
        return response.data;
    },

    getVolunteerById: async (id) => {
        const response = await api.get(`/volunteers/${id}`);
        return response.data;
    },

    updateVolunteer: async (id, data) => {
        const response = await api.put(`/volunteers/${id}`, data);
        return response.data;
    },

    deleteVolunteer: async (id) => {
        const response = await api.delete(`/volunteers/${id}`);
        return response.data;
    },

    getVolunteerHistory: async (id) => {
        const response = await api.get(`/volunteers/${id}/history`);
        return response.data;
    }
};

// Event services
const eventService = {
    getAllEvents: async () => {
        const response = await api.get('/events');
        return response.data;
    },

    getEventById: async (id) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    createEvent: async (data) => {
        const response = await api.post('/events', data);
        return response.data;
    },

    updateEvent: async (id, data) => {
        const response = await api.put(`/events/${id}`, data);
        return response.data;
    },

    deleteEvent: async (id) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },

    getEventVolunteers: async (id) => {
        const response = await api.get(`/events/${id}/volunteers`);
        return response.data;
    }
};

// Matching services
const matchingService = {
    getAllMatches: async () => {
        const response = await api.get('/matching');
        return response.data;
    },

    getMatchById: async (id) => {
        const response = await api.get(`/matching/${id}`);
        return response.data;
    },

    createMatch: async (data) => {
        const response = await api.post('/matching', data);
        return response.data;
    },

    updateMatchStatus: async (id, status) => {
        const response = await api.put(`/matching/${id}/status`, { status });
        return response.data;
    },

    deleteMatch: async (id) => {
        const response = await api.delete(`/matching/${id}`);
        return response.data;
    },

    calculateMatchScore: async (volunteerId, eventId) => {
        const response = await api.post('/matching/calculate-score', {
            volunteerId,
            eventId
        });
        return response.data;
    },

    getRecommendedVolunteers: async (eventId) => {
        const response = await api.get(`/matching/recommendations/event/${eventId}`);
        return response.data;
    },

    getRecommendedEvents: async (volunteerId) => {
        const response = await api.get(`/matching/recommendations/volunteer/${volunteerId}`);
        return response.data;
    },

    getAllMatchHistory: async () => {
        const response = await api.get('/matching/history/all');
        return response.data;
    }
};

export {
    api,
    authService,
    volunteerService,
    eventService,
    matchingService
};