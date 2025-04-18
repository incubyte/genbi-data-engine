import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator Component', () => {
  test('renders children when not loading', () => {
    render(
      <LoadingIndicator loading={false}>
        <div data-testid="child-content">Child Content</div>
      </LoadingIndicator>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders loading indicator when loading', () => {
    render(
      <LoadingIndicator loading={true}>
        <div data-testid="child-content">Child Content</div>
      </LoadingIndicator>
    );
    
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders custom loading message', () => {
    render(
      <LoadingIndicator loading={true} message="Custom loading message">
        <div>Child Content</div>
      </LoadingIndicator>
    );
    
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders full page loading indicator', () => {
    render(
      <LoadingIndicator loading={true} fullPage={true}>
        <div>Child Content</div>
      </LoadingIndicator>
    );
    
    // Check if the full page overlay is rendered
    const overlay = screen.getByText('Loading...').closest('div');
    expect(overlay).toHaveStyle({ position: 'fixed' });
  });
});
