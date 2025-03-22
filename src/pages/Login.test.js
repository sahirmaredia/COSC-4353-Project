import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { authService } from '../services/api';

// Mock the authService
jest.mock('../services/api', () => ({
    authService: {
        login: jest.fn()
    }
}));

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

describe('Login Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('renders login form', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('shows error for empty fields', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
    });

    test('successful login redirects', async () => {
        // Mock successful login
        authService.login.mockResolvedValue({
            token: 'fake-token',
            user: { id: '1', name: 'Test User' }
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Fill in login form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });

        // Click login
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // Wait for navigation
        await waitFor(() => {
            expect(mockedUsedNavigate).toHaveBeenCalledWith('/');
            expect(localStorage.getItem('token')).toBe('fake-token');
        });
    });

    test('shows error on login failure', async () => {
        // Mock login failure
        authService.login.mockRejectedValue({
            response: {
                data: { error: 'Invalid credentials' }
            }
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Fill in login form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'wrongpassword' }
        });

        // Click login
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });
});