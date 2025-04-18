# GenBI Frontend

This is the frontend application for GenBI, an AI-powered Business Intelligence platform that turns natural language questions into powerful analytics. The frontend provides a user-friendly interface for connecting to databases and querying them using natural language.

## Features

- Database connection form with support for SQLite, PostgreSQL, and MySQL
- Natural language query interface with suggested examples
- Results display with tabbed views for data, SQL, and explanations
- Export functionality for query results
- Saved connections and queries management
- Responsive design for both desktop and mobile use

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API server running (see instructions below)

## Installation

1. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Starting the Frontend

To start the frontend development server:

```
cd frontend
npm run dev
```

The application will be available at http://localhost:5173/

### Starting the Backend API

The frontend requires the backend API server to be running. To start the backend server:

```
# From the project root directory
npm run dev
```

The backend API will be available at http://localhost:3000/

## Usage

1. **Connect to a Database**:
   - Select your database type (SQLite, PostgreSQL, MySQL)
   - Enter the connection details
   - Test the connection
   - Save the connection for future use (optional)

2. **Ask Questions**:
   - Enter your question in plain English
   - Use suggested examples for inspiration
   - Save frequently used queries (optional)

3. **View Results**:
   - See the data in a tabular format
   - View the generated SQL query
   - Export results to CSV or PDF

## Development

### Project Structure

```
src/
├── components/
│   ├── DatabaseConnection/  # Database connection components
│   ├── QueryInterface/      # Natural language query components
│   └── ResultsDisplay/      # Results display components
├── services/                # API services
├── utils/                   # Utility functions
└── styles/                  # CSS styles
```

### Testing

The frontend uses Jest and React Testing Library for unit and integration tests.

To run the tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

For more details on the testing setup and best practices, see [TESTING.md](./TESTING.md).

### Adding New Database Types

To add support for a new database type:

1. Update the database type selector in `DatabaseConnection/ConnectionForm.jsx`
2. Add the appropriate form fields for the new database type
3. Update the connection info preparation in the `prepareConnectionInfo` function
4. Update the backend API to support the new database type

## License

ISC
