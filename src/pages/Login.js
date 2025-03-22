import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { email, password } = formData;

            // Validate inputs
            if (!email || !password) {
                setError('Please enter both email and password');
                setIsLoading(false);
                return;
            }

            // Login user
            const response = await authService.login(email, password);

            // Store the token
            localStorage.setItem('token', response.token);

            // Store user info if needed
            localStorage.setItem('user', JSON.stringify(response.user));

            // Redirect to dashboard
            navigate('/volunteer-matching');
        } catch (err) {
            console.error('Login error:', err);

            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Login failed. Please try again.');
            }

            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Login
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />

                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                    />

                    <Box sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isLoading}
                            sx={{ py: 1.5 }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                        </Button>
                    </Box>
                </form>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <Button
                            color="primary"
                            onClick={() => navigate('/register')}
                            sx={{ textTransform: 'none' }}
                        >
                            Register
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;