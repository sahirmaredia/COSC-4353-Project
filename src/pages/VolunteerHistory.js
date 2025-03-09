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
    Chip
} from '@mui/material';
import { mockEvents, mockVolunteers, statusOptions } from '../mockData';
import '../css/VolunteerHistory.css';

const VolunteerHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:5000/api/matching/history/all');
                const data = await response.json();
                setHistory(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching history:', error);
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
            <Container maxWidth="lg">
                <Typography sx={{ mt: 4 }}>Loading...</Typography>
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
                                {history.map((record, index) => (
                                    <TableRow key={index}>
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
                                                color={record.urgency === 'High' ? 'error' : 'warning'}
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
                </Paper>
            </Container>
        </>
    );
};

export default VolunteerHistory;