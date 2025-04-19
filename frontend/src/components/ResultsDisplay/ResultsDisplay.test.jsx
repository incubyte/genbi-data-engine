import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ResultsDisplay from './ResultsDisplay';

// Mock the api service
jest.mock('../../services/api', () => ({
  processQuery: jest.fn().mockResolvedValue({
    success: true,
    data: {
      results: [
        { id: 1, name: 'John Doe', age: 30 },
        { id: 2, name: 'Jane Smith', age: 25 }
      ],
      sqlQuery: 'SELECT * FROM users;',
      visualization: {
        recommendedChartTypes: ['bar', 'table'],
        xAxis: 'name',
        yAxis: 'age',
        reasoning: 'Bar chart is recommended to compare ages across different users.'
      }
    }
  }),
  saveVisualization: jest.fn().mockResolvedValue({
    success: true,
    data: { id: '123', name: 'Saved Visualization' }
  }),
  saveQuery: jest.fn().mockResolvedValue({
    success: true,
    data: { id: '123', name: 'Saved Query' }
  })
}));

// Mock the SmartChart component
jest.mock('../Visualizations/SmartChart', () => {
  return function MockSmartChart(props) {
    return (
      <div data-testid="mock-smart-chart">
        <div>Mock Smart Chart</div>
        <div>Data Length: {props.data?.length || 0}</div>
        <div>Initial Chart Type: {props.initialChartType || 'none'}</div>
        <div>Recommendation Reason: {props.recommendationReason || 'none'}</div>
      </div>
    );
  };
});

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    state: null
  })
}));

describe('ResultsDisplay Component', () => {
  const mockResults = {
    results: [
      { id: 1, name: 'John Doe', age: 30 },
      { id: 2, name: 'Jane Smith', age: 25 }
    ],
    sqlQuery: 'SELECT * FROM users;',
    databaseType: 'sqlite',
    visualization: {
      recommendedChartTypes: ['bar', 'table'],
      xAxis: 'name',
      yAxis: 'age',
      reasoning: 'Bar chart is recommended to compare ages across different users.'
    }
  };

  test('renders no results message when no results provided', () => {
    render(
      <BrowserRouter>
        <ResultsDisplay results={null} />
      </BrowserRouter>
    );

    expect(screen.getByText('No Results Yet')).toBeInTheDocument();
    expect(screen.getByText('Connect to a database and run a query to see results here.')).toBeInTheDocument();
  });

  test('renders results with data table', () => {
    render(
      <BrowserRouter>
        <ResultsDisplay results={mockResults} />
      </BrowserRouter>
    );

    // Check if the database type is displayed
    expect(screen.getByText(/database type/i)).toBeInTheDocument();
    expect(screen.getByText(/sqlite/i)).toBeInTheDocument();

    // Check if the tabs are displayed
    expect(screen.getByRole('tab', { name: /results/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /visualizations/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /generated sql/i })).toBeInTheDocument();
  });

  test('switches to visualization tab when clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResultsDisplay results={mockResults} />
      </BrowserRouter>
    );

    // Click on the visualizations tab
    const visualizationsTab = screen.getByRole('tab', { name: /visualizations/i });
    await user.click(visualizationsTab);

    // Check if the SmartChart component is rendered with the correct props
    expect(screen.getByTestId('mock-smart-chart')).toBeInTheDocument();
    expect(screen.getByText('Data Length: 2')).toBeInTheDocument();
    expect(screen.getByText('Initial Chart Type: bar')).toBeInTheDocument();
    expect(screen.getByText('Recommendation Reason: Bar chart is recommended to compare ages across different users.')).toBeInTheDocument();
  });

  test('switches to SQL tab when clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResultsDisplay results={mockResults} />
      </BrowserRouter>
    );

    // Click on the SQL tab
    const sqlTab = screen.getByRole('tab', { name: /generated sql/i });
    await user.click(sqlTab);

    // Check if the SQL query section is displayed
    expect(screen.getByText('Generated SQL Query')).toBeInTheDocument();
  });

  test('handles results without visualization data', async () => {
    const user = userEvent.setup();
    const resultsWithoutVisualization = {
      ...mockResults,
      visualization: null
    };

    render(
      <BrowserRouter>
        <ResultsDisplay results={resultsWithoutVisualization} />
      </BrowserRouter>
    );

    // Click on the visualizations tab
    const visualizationsTab = screen.getByRole('tab', { name: /visualizations/i });
    await user.click(visualizationsTab);

    // Check if the SmartChart component is rendered with default props
    expect(screen.getByTestId('mock-smart-chart')).toBeInTheDocument();
    expect(screen.getByText('Initial Chart Type: none')).toBeInTheDocument();
    expect(screen.getByText('Recommendation Reason: none')).toBeInTheDocument();
  });
});
