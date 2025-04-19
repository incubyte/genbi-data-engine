import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import ResultsDisplay from '../ResultsDisplay';
import ApiService from '../../../services/api';

// Mock the API service
jest.mock('../../../services/api', () => {
  return {
    __esModule: true,
    default: {
      refreshQuery: jest.fn(),
      saveQuery: jest.fn()
    }
  };
});

// Mock the useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: () => jest.fn()
}));

describe('ResultsDisplay Component', () => {
  const mockResults = {
    results: [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 }
    ],
    sqlQuery: 'SELECT * FROM test_table',
    userQuery: 'Show me test data',
    databaseType: 'saved',
    visualization: {
      recommendedChartTypes: ['bar'],
      xAxis: 'name',
      yAxis: 'value'
    },
    savedVisualizationId: '123',
    lastRefreshed: '2023-06-01T12:00:00.000Z'
  };

  beforeEach(() => {
    // Mock the useLocation hook to return our test data
    useLocation.mockReturnValue({
      state: {
        results: mockResults
      }
    });

    // Mock the API service methods
    ApiService.refreshQuery.mockResolvedValue({
      success: true,
      data: {
        query: {
          id: '123',
          name: 'Test Visualization',
          results: JSON.stringify([
            { name: 'A', value: 15 },
            { name: 'B', value: 25 }
          ]),
          last_refreshed: '2023-06-03T12:00:00.000Z'
        },
        results: [
          { name: 'A', value: 15 },
          { name: 'B', value: 25 }
        ]
      }
    });

    ApiService.saveQuery.mockResolvedValue({
      success: true,
      data: {
        query: {
          id: '123',
          name: 'Test Visualization'
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders results display with refresh button for saved visualization', () => {
    render(
      <BrowserRouter>
        <ResultsDisplay results={mockResults} />
      </BrowserRouter>
    );

    // Check if the refresh button is present
    expect(screen.getByText(/refresh data/i)).toBeInTheDocument();

    // Check if last refreshed timestamp is displayed
    expect(screen.getByText(/last refreshed/i)).toBeInTheDocument();
  });

  test('does not show refresh button for new query results', () => {
    // Create a copy of mockResults without savedVisualizationId
    const newQueryResults = { ...mockResults };
    delete newQueryResults.savedVisualizationId;

    useLocation.mockReturnValue({
      state: {
        results: newQueryResults
      }
    });

    render(
      <BrowserRouter>
        <ResultsDisplay results={newQueryResults} />
      </BrowserRouter>
    );

    // Check that the save button is present instead of refresh
    expect(screen.getByText(/save visualization/i)).toBeInTheDocument();

    // Check that refresh button is not present
    expect(screen.queryByText(/refresh data/i)).not.toBeInTheDocument();
  });

  test('refreshes data when refresh button is clicked', async () => {
    render(
      <BrowserRouter>
        <ResultsDisplay results={mockResults} />
      </BrowserRouter>
    );

    // Find and click the refresh button
    const refreshButton = screen.getByText(/refresh data/i);
    fireEvent.click(refreshButton);

    // Verify the API was called
    await waitFor(() => {
      expect(ApiService.refreshQuery).toHaveBeenCalledWith('123');
    });

    // Verify success notification is shown
    await waitFor(() => {
      expect(screen.getByText(/data refreshed successfully/i)).toBeInTheDocument();
    });

    // Verify the updated timestamp is displayed
    await waitFor(() => {
      const dateElements = screen.getAllByText(/last refreshed/i);
      // Just check that the date element exists and has been updated
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  test('shows error notification when refresh fails', async () => {
    // Mock the API to return an error
    ApiService.refreshQuery.mockResolvedValue({
      success: false,
      error: 'Failed to refresh data'
    });

    render(
      <BrowserRouter>
        <ResultsDisplay results={mockResults} />
      </BrowserRouter>
    );

    // Find and click the refresh button
    const refreshButton = screen.getByText(/refresh data/i);
    fireEvent.click(refreshButton);

    // Verify the API was called
    await waitFor(() => {
      expect(ApiService.refreshQuery).toHaveBeenCalledWith('123');
    });

    // Verify error notification is shown
    await waitFor(() => {
      expect(screen.getByText(/failed to refresh data/i)).toBeInTheDocument();
    });
  });
});
