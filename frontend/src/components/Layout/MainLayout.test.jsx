import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './MainLayout';

// Mock the child components
jest.mock('./Header', () => {
  return function MockHeader({ title }) {
    return <div data-testid="mock-header">Header: {title}</div>;
  };
});

jest.mock('./Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="mock-sidebar">Sidebar</div>;
  };
});

// Mock the Outlet from react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Outlet: () => <div data-testid="mock-outlet">Outlet Content</div>,
  useLocation: () => ({ pathname: '/dashboard' }),
}));

describe('MainLayout Component', () => {
  test('renders header, sidebar and outlet', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Check if the header is rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();

    // Check if the sidebar is rendered
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();

    // Check if the outlet is rendered
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    expect(screen.getByText('Outlet Content')).toBeInTheDocument();
  });

  test('sets the correct page title based on route', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Check if the header has the correct title
    expect(screen.getByTestId('mock-header')).toHaveTextContent('Header: Dashboard');
  });
});
