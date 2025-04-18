import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SmartChart from './SmartChart';

// Mock the chart.js library
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
  })),
  registerables: []
}));

// Sample data for testing
const sampleTimeSeriesData = [
  { date: '2023-01-01', sales: 100, category: 'Electronics' },
  { date: '2023-02-01', sales: 150, category: 'Electronics' },
  { date: '2023-03-01', sales: 200, category: 'Electronics' },
  { date: '2023-04-01', sales: 180, category: 'Electronics' },
  { date: '2023-05-01', sales: 220, category: 'Electronics' }
];

const sampleCategoricalData = [
  { category: 'Electronics', sales: 1200 },
  { category: 'Clothing', sales: 800 },
  { category: 'Food', sales: 600 },
  { category: 'Books', sales: 400 }
];

describe('SmartChart Component', () => {
  test('renders loading state initially', () => {
    render(<SmartChart data={sampleTimeSeriesData} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders chart with time series data', async () => {
    render(<SmartChart data={sampleTimeSeriesData} />);
    
    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if chart container is rendered
    expect(screen.getByText(/sales over date/i, { exact: false })).toBeInTheDocument();
    
    // Check if chart explanation is shown
    expect(screen.getByText(/why this visualization/i)).toBeInTheDocument();
  });

  test('renders chart with categorical data', async () => {
    render(<SmartChart data={sampleCategoricalData} />);
    
    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if chart container is rendered
    expect(screen.getByText(/sales by category/i, { exact: false })).toBeInTheDocument();
  });

  test('shows chart settings when button is clicked', async () => {
    const user = userEvent.setup();
    render(<SmartChart data={sampleCategoricalData} />);
    
    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Click on the settings button
    const settingsButton = screen.getByText(/show chart settings/i);
    await user.click(settingsButton);
    
    // Check if chart configuration panel is shown
    expect(screen.getByText(/chart configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/data mapping/i)).toBeInTheDocument();
  });

  test('handles empty data gracefully', async () => {
    render(<SmartChart data={[]} />);
    
    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check if error message is shown
    expect(screen.getByText(/no visualization available/i)).toBeInTheDocument();
  });
});
