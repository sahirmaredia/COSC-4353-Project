import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Breadcrumbs,
    Link,
    Chip,
    CircularProgress
} from '@mui/material';
import { matchingService } from '../services/api';
import '../css/VolunteerHistory.css';

const VolunteerHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    console.error('No authentication token found');
                    setError('Please log in to view volunteer history');
                    setIsLoading(false);
                    return;
                }

                const response = await matchingService.getAllMatchHistory();

                console.log('Received Match History:', response); // Add this logging

                setHistory(response);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching volunteer history:', err);

                // More detailed error handling
                if (err.response) {
                    // The request was made and the server responded with a status code
                    setError(err.response.data.error || 'Failed to fetch volunteer history');
                } else if (err.request) {
                    // The request was made but no response was received
                    setError('No response received from server');
                } else {
                    // Something happened in setting up the request
                    setError('Error setting up the request');
                }

                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'success';
            case 'Matched':
                return 'primary';
            case 'Pending':
                return 'warning';
            case 'Cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading volunteer history...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <>
            <div className="banner-section">
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" href="/">
                        Dashboard
                    </Link>
                    <Typography color="text.primary">Volunteer History</Typography>
                </Breadcrumbs>
                <Typography variant="h4" sx={{ mt: 2 }}>
                    Volunteer Participation History
                </Typography>
            </div>

            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: 3 }}>
                    {history.length === 0 ? (
                        <Typography variant="h6" sx={{ textAlign: 'center', py: 4 }}>
                            No volunteer history found
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Volunteer Name</TableCell>
                                        <TableCell>Event Name</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Location</TableCell>
                                        <TableCell>Required Skills</TableCell>
                                        <TableCell>Urgency</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((record) => (
                                        <TableRow key={record.matchId}>
                                            <TableCell>{record.volunteerName}</TableCell>
                                            <TableCell>{record.eventName}</TableCell>
                                            <TableCell>{record.eventDate}</TableCell>
                                            <TableCell>{record.location}</TableCell>
                                            <TableCell>
                                                {record.requiredSkills.map(skill => (
                                                    <Chip
                                                        key={skill}
                                                        label={skill}
                                                        size="small"
                                                        sx={{ mr: 0.5, mb: 0.5 }}
                                                    />
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={record.urgency}
                                                    color={record.urgency === 'High' ? 'error' : record.urgency === 'Medium' ? 'warning' : 'info'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={record.status}
                                                    color={getStatusColor(record.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>
        </>
    );
};

export default VolunteerHistory;