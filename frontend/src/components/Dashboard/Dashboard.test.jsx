import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import apiService from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  getSavedConnections: jest.fn(),
  getSavedQueries: jest.fn(),
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => jest.fn(),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Mock API responses
    apiService.getSavedConnections.mockResolvedValue({ success: true, data: [] });
    apiService.getSavedQueries.mockResolvedValue({ success: true, data: [] });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check if loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders welcome message when no connections exist', async () => {
    // Mock API responses
    apiService.getSavedConnections.mockResolvedValue({ success: true, data: [] });
    apiService.getSavedQueries.mockResolvedValue({ success: true, data: [] });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for the API calls to resolve
    await waitFor(() => {
      expect(screen.getByText('Welcome to GenBI!')).toBeInTheDocument();
    });

    expect(screen.getByText('Create your first database connection to start generating insights from your data.')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  test('renders stats cards with correct data', async () => {
    // Mock API responses
    apiService.getSavedConnections.mockResolvedValue({
      success: true,
      data: [{ id: 1, name: 'Test Connection', connection: { type: 'sqlite' }, createdAt: new Date().toISOString() }]
    });
    apiService.getSavedQueries.mockResolvedValue({
      success: true,
      data: [{ id: 1, name: 'Test Query', createdAt: new Date().toISOString() }]
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for the API calls to resolve
    await waitFor(() => {
      expect(screen.getAllByText(/Database Connections/i)[0]).toBeInTheDocument();
    });

    // Check if stats cards are displayed with correct data
    expect(screen.getByText('Database Connections')).toBeInTheDocument();
    expect(screen.getByText('Saved Queries')).toBeInTheDocument();
    expect(screen.getByText('Saved Visualizations')).toBeInTheDocument();
  });

  test('renders error message when API fails', async () => {
    // Mock API error
    apiService.getSavedConnections.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for the API calls to resolve
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
  });
});
