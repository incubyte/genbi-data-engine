import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SmartChart from './SmartChart';

// Mock the chart.js library and its components
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
  register: jest.fn(),
  registerables: [],
  LinearScale: jest.fn(),
  CategoryScale: jest.fn(),
  BarController: jest.fn(),
  LineController: jest.fn(),
  PieController: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Title: jest.fn(),
}));

// Mock chart.js/auto
jest.mock('chart.js/auto', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  })),
  register: jest.fn(),
  registerables: [],
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
  test('renders initially', () => {
    render(<SmartChart data={sampleTimeSeriesData} />);
    // Just check that the component renders without crashing
    expect(screen.getByText(/show chart settings/i)).toBeInTheDocument();
  });

  test('renders chart with time series data', async () => {
    render(<SmartChart data={sampleTimeSeriesData} />);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if chart container is rendered
    expect(screen.getByText(/sales over time/i, { exact: false })).toBeInTheDocument();

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
    expect(screen.getByText(/visualization error/i)).toBeInTheDocument();
    expect(screen.getByText(/no data available for visualization/i)).toBeInTheDocument();
  });

  test('uses recommended chart type from API', async () => {
    // Render with recommended chart type from API
    render(
      <SmartChart
        data={sampleCategoricalData}
        initialChartType="pie"
        recommendedConfig={{
          labels: 'category',
          values: 'sales',
          title: 'Sales Distribution by Category'
        }}
        recommendationReason="Pie chart is recommended to show the distribution of sales across categories."
      />
    );

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if the recommended chart title is used
    expect(screen.getByText('Sales Distribution by Category')).toBeInTheDocument();

    // Check if the recommendation reason is shown
    expect(screen.getByText('Pie chart is recommended to show the distribution of sales across categories.')).toBeInTheDocument();
  });

  test('falls back to automatic analysis when no recommendations provided', async () => {
    // Render without recommendations
    render(<SmartChart data={sampleCategoricalData} />);

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if automatic analysis is used
    expect(screen.getByText(/sales by category/i, { exact: false })).toBeInTheDocument();
  });
});
