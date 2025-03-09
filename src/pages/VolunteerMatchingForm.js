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
    Chip
} from '@mui/material';
import { mockVolunteers, mockEvents, statusOptions } from '../mockData';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../css/VolunteerMatchingForm.css';

const VolunteerMatchingForm = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState('');
    const [matchedEvent, setMatchedEvent] = useState('');
    const [notification, setNotification] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [matchScore, setMatchScore] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch volunteers
                const volunteersResponse = await fetch('http://localhost:5000/api/volunteers');
                const volunteersData = await volunteersResponse.json();
                setVolunteers(volunteersData); // Add this line

                // Fetch events
                const eventsResponse = await fetch('http://localhost:5000/api/events');
                const eventsData = await eventsResponse.json();
                setEvents(eventsData); // Add this line

                setIsLoading(false); // Add this line to end loading state
            } catch (error) {
                console.error('Error loading data:', error);
                // Fallback to mock data in case of error
                setVolunteers(mockVolunteers);
                setEvents(mockEvents);
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const calculateMatchScore = (volunteer, event) => {
        if (!volunteer || !event) return 0;

        let score = 0;
        // Check skills match (60% of total score)
        const matchingSkills = event.requiredSkills.filter(skill =>
            volunteer.skills.includes(skill)
        );
        score += (matchingSkills.length / event.requiredSkills.length) * 60;

        // Check availability match (40% of total score)
        if (volunteer.availability.includes(event.date)) {
            score += 40;
        }

        return Math.round(score);
    };

    const handleVolunteerSelect = (event) => {
        const volunteerId = event.target.value;
        setSelectedVolunteer(volunteerId);

        // Find best matching event
        const volunteer = volunteers.find(v => v.id === volunteerId);
        if (volunteer) {
            const bestMatch = events.reduce((best, current) => {
                const currentScore = calculateMatchScore(volunteer, current);
                const bestScore = best ? calculateMatchScore(volunteer, best) : 0;
                return currentScore > bestScore ? current : best;
            }, null);

            if (bestMatch) {
                setMatchedEvent(bestMatch.id);
                setMatchScore(calculateMatchScore(volunteer, bestMatch));
            }
        }
    };

    const handleEventSelect = (event) => {
        const eventId = event.target.value;
        setMatchedEvent(eventId);

        const volunteer = volunteers.find(v => v.id === selectedVolunteer);
        const selectedEvent = events.find(e => e.id === eventId);
        if (volunteer && selectedEvent) {
            setMatchScore(calculateMatchScore(volunteer, selectedEvent));
        }
    };

    const handleMatch = async () => {
        if (selectedVolunteer && matchedEvent) {
            try {
                const response = await fetch('http://localhost:5000/api/matching', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        volunteerId: selectedVolunteer,
                        eventId: matchedEvent
                    })
                });

                if (response.ok) {
                    setNotification('Successfully matched volunteer to event!');
                    setTimeout(() => setNotification(''), 3000);
                }
            } catch (error) {
                console.error('Error creating match:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg">
                <Typography sx={{ mt: 4 }}>Loading...</Typography>
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
                                        >
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
                                            <Box sx={{ mt: 1 }}>
                                                <Typography component="span">Skills: </Typography>
                                                {selectedVolunteerData.skills.map(skill => (
                                                    <Chip
                                                        key={skill}
                                                        label={skill}
                                                        size="small"
                                                        color={selectedEventData?.requiredSkills.includes(skill) ? "success" : "default"}
                                                        sx={{ mr: 0.5, mb: 0.5 }}
                                                    />
                                                ))}
                                            </Box>
                                            <Typography>
                                                Available Dates: {selectedVolunteerData.availability.join(', ')}
                                            </Typography>
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
                                                        color={selectedVolunteerData?.skills.includes(skill) ? "success" : "default"}
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
                                            Based on skills and availability
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