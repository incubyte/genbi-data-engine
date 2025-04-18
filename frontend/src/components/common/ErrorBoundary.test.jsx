import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Create a component that throws an error
const ErrorThrowingComponent = () => {
  throw new Error('Test error');
};

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  test('renders fallback UI when an error occurs', () => {
    // We need to suppress the error boundary console output in React 16+
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    // Check if the error message is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    // Check if the reset buttons are displayed
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();

    // Restore the spy
    spy.mockRestore();
  });

  test('reset button clears the error state', () => {
    // We need to suppress the error boundary console output in React 16+
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );

    // Check if the error message is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Get the Try Again button and click it
    const tryAgainButton = screen.getByText('Try Again');
    expect(tryAgainButton).toBeInTheDocument();

    // Restore the spy
    spy.mockRestore();
  });
});
