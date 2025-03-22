import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    Box,
    Paper,
    Breadcrumbs,
    Link,
    Chip,
    CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { volunteerService, eventService, matchingService } from '../services/api';
import '../css/VolunteerMatchingForm.css';

const VolunteerMatchingForm = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState('');
    const [matchedEvent, setMatchedEvent] = useState('');
    const [notification, setNotification] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [matchScore, setMatchScore] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [volunteers, events] = await Promise.all([
                    volunteerService.getAllVolunteers(),
                    eventService.getAllEvents()
                ]);

                setVolunteers(volunteers);
                setEvents(events);
                setIsLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load volunteers and events data');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleVolunteerSelect = async (event) => {
        const volunteerId = event.target.value;
        setSelectedVolunteer(volunteerId);
        setMatchedEvent('');
        setMatchScore(null);

        if (!volunteerId) return;

        try {
            const recommendations = await matchingService.getRecommendedEvents(volunteerId);

            if (recommendations.length > 0) {
                const bestMatch = recommendations[0];
                setMatchedEvent(bestMatch.id);
                setMatchScore(bestMatch.matchScore);
            }
        } catch (err) {
            console.error('Error getting recommendations:', err);
            setError('Failed to get recommended events');
        }
    };

    const handleEventSelect = async (event) => {
        const eventId = event.target.value;
        setMatchedEvent(eventId);

        if (!selectedVolunteer || !eventId) {
            setMatchScore(null);
            return;
        }

        try {
            const response = await matchingService.calculateMatchScore(selectedVolunteer, eventId);
            setMatchScore(response.matchScore);
        } catch (err) {
            console.error('Error calculating match score:', err);
            setMatchScore(null);
        }
    };

    const handleMatch = async () => {
        if (!selectedVolunteer || !matchedEvent) return;

        try {
            await matchingService.createMatch({
                volunteerId: selectedVolunteer,
                eventId: matchedEvent
            });

            setNotification('Successfully matched volunteer to event!');
            setTimeout(() => setNotification(''), 3000);
        } catch (err) {
            console.error('Error creating match:', err);

            const errorMessage = err.response?.data?.error || 'Failed to create match';
            setError(errorMessage);
            setTimeout(() => setError(null), 3000);
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading volunteer matching data...</Typography>
            </Container>
        );
    }

    if (error && !notification) {
        return (
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            </Container>
        );
    }

    const selectedVolunteerData = volunteers.find(v => v.id === selectedVolunteer);
    const selectedEventData = events.find(e => e.id === matchedEvent);

    return (
        <>
            <div className="banner-section">
                <Box sx={{ mt: 4, mb: 4, paddingLeft: '5%' }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link color="inherit" href="/">
                            Dashboard
                        </Link>
                        <Typography color="text.primary">Volunteer Matching</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" sx={{ mt: 2 }}>
                        Volunteer Matching
                    </Typography>
                </Box>
            </div>

            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Match Volunteers to Events
                                    </Typography>

                                    <Box sx={{ mt: 2 }}>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Volunteer Name</InputLabel>
                                            <Select
                                                value={selectedVolunteer}
                                                label="Volunteer Name"
                                                onChange={handleVolunteerSelect}
                                            >
                                                <MenuItem value="">Select a volunteer</MenuItem>
                                                {volunteers.map((volunteer) => (
                                                    <MenuItem key={volunteer.id} value={volunteer.id}>
                                                        {volunteer.name} - {volunteer.location}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Matched Event</InputLabel>
                                            <Select
                                                value={matchedEvent}
                                                label="Matched Event"
                                                onChange={handleEventSelect}
                                                disabled={!selectedVolunteer}
                                            >
                                                <MenuItem value="">Select an event</MenuItem>
                                                {events.map((event) => (
                                                    <MenuItem key={event.id} value={event.id}>
                                                        {event.name} - {event.date}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={handleMatch}
                                                disabled={!selectedVolunteer || !matchedEvent}
                                            >
                                                Match Volunteer to Event
                                            </Button>

                                            {notification && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                                    <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                                                    <Typography>{notification}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Match Details
                                    </Typography>

                                    {selectedVolunteerData && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle1" color="primary">
                                                Volunteer Details
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                <Typography>Name: {selectedVolunteerData.name}</Typography>
                                                <Typography>Location: {selectedVolunteerData.location}</Typography>
                                                {selectedVolunteerData.skills && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography component="span">Skills: </Typography>
                                                        {selectedVolunteerData.skills.map(skill => (
                                                            <Chip
                                                                key={skill}
                                                                label={skill}
                                                                size="small"
                                                                color={selectedEventData?.requiredSkills?.includes(skill) ? "success" : "default"}
                                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                                {selectedVolunteerData.availability && (
                                                    <Typography>
                                                        Available Dates: {selectedVolunteerData.availability.join(', ')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {selectedEventData && (
                                        <Box>
                                            <Typography variant="subtitle1" color="primary">
                                                Event Details
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                <Typography>Name: {selectedEventData.name}</Typography>
                                                <Typography>Description: {selectedEventData.description}</Typography>
                                                <Typography>Location: {selectedEventData.location}</Typography>
                                                <Typography>Date: {selectedEventData.date}</Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography component="span">Required Skills: </Typography>
                                                    {selectedEventData.requiredSkills.map(skill => (
                                                        <Chip
                                                            key={skill}
                                                            label={skill}
                                                            size="small"
                                                            color={selectedVolunteerData?.skills?.includes(skill) ? "success" : "default"}
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))}
                                                </Box>
                                                <Typography>Urgency: {selectedEventData.urgency}</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {matchScore !== null && selectedVolunteer && matchedEvent && (
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Match Score: {matchScore}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Based on skills, availability, and location
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </>
    );
};

export default VolunteerMatchingForm;