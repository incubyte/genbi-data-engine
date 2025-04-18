# Frontend Testing Guide

This document provides an overview of the testing setup for the GenBI frontend application.

## Testing Stack

The frontend tests are built using the following technologies:

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **Jest DOM**: Custom Jest matchers for DOM testing

## Running Tests

To run the tests, use the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

The tests are organized alongside the components they test. For example:

- `src/components/common/NotFound.jsx` has a corresponding test file `src/components/common/NotFound.test.jsx`
- `src/theme.js` has a corresponding test file `src/theme.test.js`

## Test Types

### Unit Tests

Unit tests focus on testing individual components in isolation. These tests verify that components render correctly and respond to user interactions as expected.

Example:
```jsx
// LoadingIndicator.test.jsx
test('renders loading indicator when loading', () => {
  render(
    <LoadingIndicator loading={true}>
      <div data-testid="child-content">Child Content</div>
    </LoadingIndicator>
  );
  
  expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### Integration Tests

Integration tests verify that multiple components work together correctly. These tests focus on component interactions and data flow.

Example:
```jsx
// Dashboard.test.jsx
test('renders stats cards with correct data', async () => {
  // Mock API responses
  apiService.getSavedConnections.mockResolvedValue({
    success: true,
    data: [{ id: 1, name: 'Test Connection', connection: { type: 'sqlite' } }]
  });
  
  render(<Dashboard />);
  
  // Wait for API calls to resolve
  await waitFor(() => {
    expect(screen.getAllByText(/Database Connections/i)[0]).toBeInTheDocument();
  });
  
  // Check if stats cards are displayed with correct data
  expect(screen.getByText('Database Connections')).toBeInTheDocument();
});
```

## Mocking

The tests use Jest's mocking capabilities to mock:

1. **API Services**: To avoid making actual API calls during tests
2. **React Router**: To simulate navigation and routing
3. **External Components**: To isolate the component being tested

Example of mocking an API service:
```jsx
// Mock the API service
jest.mock('../../services/api', () => ({
  getSavedConnections: jest.fn(),
  getSavedQueries: jest.fn(),
}));
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on testing what the component does, not how it does it.
2. **Use Data Attributes**: Use `data-testid` attributes to select elements for testing.
3. **Mock External Dependencies**: Mock API calls and external services to isolate the component being tested.
4. **Test Edge Cases**: Test error states, loading states, and empty states.
5. **Keep Tests Independent**: Each test should be independent of others and should not rely on the state from previous tests.

## Adding New Tests

When adding new components, follow these steps to create tests:

1. Create a test file with the same name as the component, but with a `.test.jsx` extension.
2. Import the component and any necessary testing utilities.
3. Write tests that verify the component's behavior.
4. Run the tests to ensure they pass.

Example:
```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
});
```
