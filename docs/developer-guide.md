# GenBI Developer Guide

_Version: 1.0.0 (Last updated: April 2025)_

This guide provides information for developers who want to contribute to or extend the GenBI application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setting Up the Development Environment](#setting-up-the-development-environment)
3. [Project Structure](#project-structure)
4. [Backend Development](#backend-development)
   - [Database Services](#database-services)
   - [API Endpoints](#api-endpoints)
   - [Natural Language Processing](#natural-language-processing)
5. [Frontend Development](#frontend-development)
   - [Component Structure](#component-structure)
   - [State Management](#state-management)
   - [API Integration](#api-integration)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

GenBI is a full-stack application with a Node.js backend and a React frontend. The application follows a client-server architecture:

- **Backend**: Node.js with Express, providing RESTful API endpoints for database connections, query processing, and data management.
- **Frontend**: React with Material-UI, providing a user-friendly interface for interacting with the application.
- **Database**: SQLite for storing user data (saved connections and queries).
- **External Services**: Anthropic Claude API for natural language to SQL conversion.

The application follows these key design principles:
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
- **Clean Architecture**: Separation of concerns with clear boundaries between layers.
- **Factory Pattern**: For creating database service instances based on the database type.
- **Repository Pattern**: For data access and persistence.

## Setting Up the Development Environment

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/genbi-data-engine.git
   cd genbi-data-engine
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   NODE_ENV=development
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ANTHROPIC_MODEL=claude-3-opus-20240229
   LOG_LEVEL=debug
   ```

5. Start the development servers:
   ```bash
   # In one terminal, start the backend
   npm run dev

   # In another terminal, start the frontend
   cd frontend
   npm run dev
   ```

## Project Structure

The project is organized as follows:

```
genbi-data-engine/
├── data/                  # Database files
├── docs/                  # Documentation
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main application component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
├── logs/                  # Application logs
├── src/                   # Backend source code
│   ├── config/            # Configuration
│   ├── controllers/       # API controllers
│   ├── db/                # Database initialization
│   ├── services/          # Business logic
│   │   ├── databases/     # Database services
│   │   └── ...            # Other services
│   └── utils/             # Utility functions
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── api/               # API tests
├── .env                   # Environment variables
├── package.json           # Backend dependencies
└── server.js              # Entry point
```

## Backend Development

### Database Services

The backend uses a factory pattern to create database service instances based on the database type. Each database service extends a base service class and implements specific methods for connecting to and querying the database.

To add support for a new database type:

1. Create a new service class in `src/services/databases/` that extends `BaseDatabaseService`
2. Implement the required methods:
   - `connect(connectionInfo)`: Connect to the database
   - `executeQuery(db, query, params, options)`: Execute a query
   - `extractSchema(db)`: Extract the database schema
   - `closeConnection(db)`: Close the database connection
   - `getDatabaseType()`: Return the database type
3. Update the `databaseFactory.js` file to include the new database type

Example:
```javascript
// src/services/databases/newDatabaseService.js
const BaseDatabaseService = require('./baseDatabaseService');

class NewDatabaseService extends BaseDatabaseService {
  // Implement required methods
}

module.exports = NewDatabaseService;

// src/services/databaseFactory.js
case 'newdatabase':
  return new NewDatabaseService();
```

### API Endpoints

The backend provides RESTful API endpoints for database connections, query processing, and data management. Each endpoint is implemented in a controller class.

To add a new endpoint:

1. Create a new controller method in the appropriate controller file
2. Add the route to `server.js`

Example:
```javascript
// src/controllers/queryController.js
async newEndpoint(req, res, next) {
  try {
    // Implementation
    res.status(200).json({
      status: 'success',
      data: {
        // Response data
      }
    });
  } catch (error) {
    next(error);
  }
}

// server.js
app.get('/api/new-endpoint', queryController.newEndpoint);
```

### Natural Language Processing

The backend uses the Anthropic Claude API to convert natural language queries to SQL. The `anthropicService.js` file handles the communication with the API.

#### Schema Optimization

For large database schemas, the application includes a schema extractor that identifies relevant tables based on the user's natural language query. This helps optimize prompt size and improve response quality.

The schema extractor analyzes the user's query and scores tables based on relevance:
- Direct matches with table/column names
- Semantic relevance to query keywords
- Foreign key relationships between tables

To customize the schema extraction:

1. Modify the `schemaExtractor.js` file in `src/services/anthropic/`
2. Adjust scoring weights and relevance logic in the `extractRelevantSchema` method
3. Update the maximum number of tables or other configuration options

#### Modifying NLP Processing

To modify the natural language processing:

1. Update the `generateSqlQuery` method in `src/services/anthropic/anthropicService.js`
2. Modify the prompt template in `src/services/anthropic/promptBuilder.js`
3. Adjust schema extraction options when calling the service

Example:
```javascript
// src/services/anthropic/anthropicService.js
async generateSqlQuery(userQuery, schema, dbType, options = {}) {
  // Schema optimization for large databases
  const optimizeSchema = options.optimizeSchema !== false;
  const schemaSize = Object.keys(schema).length;
  let optimizedSchema = schema;
  
  if (optimizeSchema && schemaSize > 10) {
    optimizedSchema = schemaExtractor.extractRelevantSchema(schema, userQuery, {
      maxTables: options.maxTables || 20,
      includeForeignKeys: true
    });
  }
  
  // Generate SQL with optimized schema
  // ...
}
```

## Frontend Development

### Component Structure

The frontend is built with React and follows a component-based architecture. Components are organized by feature and reusability.

- **Common Components**: Reusable UI components like buttons, forms, and dialogs
- **Feature Components**: Components specific to a feature, like database connection or query interface
- **Layout Components**: Components that define the layout of the application

To add a new component:

1. Create a new component file in the appropriate directory
2. Import and use the component in other components

Example:
```jsx
// frontend/src/components/common/NewComponent.jsx
import React from 'react';

const NewComponent = ({ prop1, prop2 }) => {
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};

export default NewComponent;
```

### State Management

The frontend uses React's built-in state management (useState, useEffect) for component-level state. For more complex state management, consider using React Context or a state management library like Redux.

Example:
```jsx
// Using useState
const [state, setState] = useState(initialState);

// Using useEffect
useEffect(() => {
  // Effect implementation
}, [dependencies]);
```

### API Integration

The frontend communicates with the backend using the `api.js` service, which provides methods for calling the API endpoints.

To add a new API method:

1. Add a new method to the `ApiService` class in `frontend/src/services/api.js`
2. Use the method in your components

Example:
```javascript
// frontend/src/services/api.js
async newApiMethod(param1, param2) {
  try {
    const response = await axios.get(`${API_URL}/new-endpoint`, {
      params: { param1, param2 }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}
```

## Testing

The project uses Jest for testing. Tests are organized into three categories:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test the interaction between different parts of the application
- **API Tests**: Test the API endpoints

To run tests:

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run API tests
npm run test:api

# Run tests with coverage
npm run test:coverage
```

To add a new test:

1. Create a new test file in the appropriate directory
2. Write your tests using Jest

Example:
```javascript
// tests/unit/newService.test.js
const newService = require('../../src/services/newService');

describe('New Service', () => {
  test('should do something', () => {
    // Test implementation
    expect(newService.doSomething()).toBe(expectedResult);
  });
});
```

## Deployment

To deploy the application to production:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. Set environment variables for production:
   ```
   NODE_ENV=production
   PORT=3000
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ANTHROPIC_MODEL=claude-3-opus-20240229
   LOG_LEVEL=info
   ```

3. Start the server:
   ```bash
   npm start
   ```

For containerized deployment, a Dockerfile is provided:

```bash
# Build the Docker image
docker build -t genbi-data-engine .

# Run the container
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your_key genbi-data-engine
```

## Contributing Guidelines

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write tests for your changes
5. Run the tests to ensure they pass
6. Update documentation to reflect your changes
7. Commit your changes with a descriptive commit message
8. Push your branch to your fork
9. Create a pull request

Please follow these guidelines when contributing:

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new features or bug fixes
- Keep pull requests focused on a single feature or bug fix

### Documentation Guidelines

When updating documentation:

1. **Version Updates**: Update the version number and date at the top of the documentation file
2. **Code Examples**: Ensure code examples match the current implementation
3. **API Changes**: Document any changes to API endpoints, parameters, or responses
4. **Database Support**: Update database-related documentation when adding or modifying database support
5. **Testing**: Update testing documentation when changing test procedures or adding new test cases
6. **Screenshots**: Update screenshots if UI changes are made

All documentation files should be kept in sync with the codebase. If you make changes to the code that affect the behavior described in the documentation, you must update the documentation as part of your pull request.
