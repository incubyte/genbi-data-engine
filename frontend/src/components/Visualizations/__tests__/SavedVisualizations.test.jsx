import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SavedVisualizations from '../SavedVisualizations';
import ApiService from '../../../services/api';

// Mock the API service
jest.mock('../../../services/api', () => {
  return {
    __esModule: true,
    default: {
      getAllSavedQueries: jest.fn(),
      refreshQuery: jest.fn(),
      deleteQuery: jest.fn()
    }
  };
});

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('SavedVisualizations Component', () => {
  const mockVisualizations = [
    {
      id: '1',
      name: 'Test Visualization 1',
      query: 'Show me test data 1',
      sql_query: 'SELECT * FROM test_table',
      chart_type: 'bar',
      visualization_config: JSON.stringify({
        xAxis: 'name',
        yAxis: 'value'
      }),
      results: JSON.stringify([
        { name: 'A', value: 10 },
        { name: 'B', value: 20 }
      ]),
      createdAt: '2023-06-01T12:00:00.000Z',
      lastRefreshed: '2023-06-01T12:00:00.000Z'
    },
    {
      id: '2',
      name: 'Test Visualization 2',
      query: 'Show me test data 2',
      sql_query: 'SELECT * FROM another_table',
      chart_type: 'pie',
      visualization_config: JSON.stringify({
        labels: 'category',
        values: 'count'
      }),
      results: JSON.stringify([
        { category: 'X', count: 30 },
        { category: 'Y', count: 40 }
      ]),
      createdAt: '2023-06-02T12:00:00.000Z',
      lastRefreshed: '2023-06-02T12:00:00.000Z'
    }
  ];

  beforeEach(() => {
    // Mock the API service methods
    ApiService.getAllSavedQueries.mockResolvedValue({
      success: true,
      data: {
        queries: mockVisualizations
      }
    });

    ApiService.refreshQuery.mockResolvedValue({
      success: true,
      data: {
        query: {
          ...mockVisualizations[0],
          results: JSON.stringify([
            { name: 'A', value: 15 },
            { name: 'B', value: 25 }
          ]),
          last_refreshed: '2023-06-03T12:00:00.000Z'
        }
      }
    });

    ApiService.deleteQuery.mockResolvedValue({
      success: true,
      message: 'Query deleted successfully'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders saved visualizations', async () => {
    render(
      <BrowserRouter>
        <SavedVisualizations />
      </BrowserRouter>
    );

    // Wait for visualizations to load
    await waitFor(() => {
      expect(screen.getByText('Test Visualization 1')).toBeInTheDocument();
      expect(screen.getByText('Test Visualization 2')).toBeInTheDocument();
    });

    // Check if refresh buttons are present
    const refreshButtons = screen.getAllByRole('button', { name: /refresh/i });
    expect(refreshButtons.length).toBeGreaterThan(0);
  });

  test('refreshes a visualization when refresh button is clicked', async () => {
    render(
      <BrowserRouter>
        <SavedVisualizations />
      </BrowserRouter>
    );

    // Wait for visualizations to load
    await waitFor(() => {
      expect(screen.getByText('Test Visualization 1')).toBeInTheDocument();
    });

    // Find and click the refresh button for the first visualization
    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find(button =>
      button.querySelector('svg') &&
      button.getAttribute('aria-label') === 'refresh'
    );

    if (refreshButton) {
      fireEvent.click(refreshButton);
    } else {
      // If we can't find the button by aria-label, try to find it by its position
      const visualizationCards = screen.getAllByTestId('visualization-card');
      const firstCard = visualizationCards[0];
      const buttons = firstCard.querySelectorAll('button');
      const refreshBtn = Array.from(buttons).find(btn =>
        btn.querySelector('svg') && !btn.textContent.includes('View')
      );

      if (refreshBtn) {
        fireEvent.click(refreshBtn);
      } else {
        throw new Error('Could not find refresh button');
      }
    }

    // Verify the API was called
    await waitFor(() => {
      expect(ApiService.refreshQuery).toHaveBeenCalledWith('1');
    });

    // Verify success notification is shown
    await waitFor(() => {
      expect(screen.getByText(/visualization refreshed successfully/i)).toBeInTheDocument();
    });
  });

  test('shows error notification when refresh fails', async () => {
    // Mock the API to return an error
    ApiService.refreshQuery.mockResolvedValue({
      success: false,
      error: 'Failed to refresh visualization'
    });

    render(
      <BrowserRouter>
        <SavedVisualizations />
      </BrowserRouter>
    );

    // Wait for visualizations to load
    await waitFor(() => {
      expect(screen.getByText('Test Visualization 1')).toBeInTheDocument();
    });

    // Find and click the refresh button for the first visualization
    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find(button =>
      button.querySelector('svg') &&
      button.getAttribute('aria-label') === 'refresh'
    );

    if (refreshButton) {
      fireEvent.click(refreshButton);
    } else {
      // If we can't find the button by aria-label, try to find it by its position
      const visualizationCards = screen.getAllByTestId('visualization-card');
      const firstCard = visualizationCards[0];
      const buttons = firstCard.querySelectorAll('button');
      const refreshBtn = Array.from(buttons).find(btn =>
        btn.querySelector('svg') && !btn.textContent.includes('View')
      );

      if (refreshBtn) {
        fireEvent.click(refreshBtn);
      } else {
        throw new Error('Could not find refresh button');
      }
    }

    // Verify the API was called
    await waitFor(() => {
      expect(ApiService.refreshQuery).toHaveBeenCalledWith('1');
    });

    // Verify error notification is shown
    await waitFor(() => {
      expect(screen.getByText(/failed to refresh visualization/i)).toBeInTheDocument();
    });
  });
});
