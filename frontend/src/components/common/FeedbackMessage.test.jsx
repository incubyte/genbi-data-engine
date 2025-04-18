import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackMessage from './FeedbackMessage';

// Mock Material-UI Snackbar to avoid transition issues in tests
jest.mock('@mui/material/Snackbar', () => {
  return function MockSnackbar(props) {
    if (!props.open) return null;
    return (
      <div data-testid="mock-snackbar" onClick={props.onClose}>
        {props.children}
      </div>
    );
  };
});

describe('FeedbackMessage Component', () => {
  test('renders message when open is true', () => {
    render(
      <FeedbackMessage
        open={true}
        message="Test message"
        severity="info"
      />
    );
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('does not render message when open is false', () => {
    render(
      <FeedbackMessage
        open={false}
        message="Test message"
        severity="info"
      />
    );
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  test('calls onClose when closed', async () => {
    const handleClose = jest.fn();
    
    render(
      <FeedbackMessage
        open={true}
        message="Test message"
        severity="error"
        onClose={handleClose}
      />
    );
    
    // Click on the snackbar to close it
    fireEvent.click(screen.getByTestId('mock-snackbar'));
    
    // Wait for the onClose to be called
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled();
    });
  });

  test('renders with different severity levels', () => {
    const { rerender } = render(
      <FeedbackMessage
        open={true}
        message="Success message"
        severity="success"
      />
    );
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    rerender(
      <FeedbackMessage
        open={true}
        message="Error message"
        severity="error"
      />
    );
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    
    rerender(
      <FeedbackMessage
        open={true}
        message="Warning message"
        severity="warning"
      />
    );
    
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });
});
