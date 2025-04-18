# GenBI - AI-Powered Business Intelligence

GenBI is an AI-powered Business Intelligence platform that turns natural language questions into powerful analytics. It consists of a Node.js backend API that interfaces with Anthropic's API to generate SQL queries from natural language, and a React frontend that provides a user-friendly interface for connecting to databases and querying them.

## Project Structure

This project is organized into two main components:

- **Backend API**: A Node.js server that handles database connections, schema extraction, and natural language to SQL conversion
- **Frontend**: A React application that provides the user interface for database connections and natural language queries

## Features

### Backend API
- Express.js server with proper middleware (CORS, Helmet, etc.)
- Database integration with schema extraction for:
  - SQLite
  - PostgreSQL
  - MySQL
- Anthropic API integration for natural language to SQL conversion
- Main endpoint that processes user queries and returns results
- Comprehensive error handling and logging

### Frontend
- User-friendly interface for database connections
- Natural language query interface with suggested examples
- Results display with tabbed views for data, SQL, and explanations
- Export functionality for query results
- Saved connections and queries management
- Responsive design for both desktop and mobile use

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/genbi-data-engine.git
   cd genbi-data-engine
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Anthropic API key:
     ```
     PORT=3000
     ANTHROPIC_API_KEY=your_anthropic_api_key_here
     LOG_LEVEL=info
     ```

4. Install frontend dependencies:
   ```
   cd frontend
   npm install
   cd ..
   ```

## Usage

### Starting the Backend Server

```
npm start
```

For development with auto-reload:
```
npm run dev
```

The backend API will be available at http://localhost:3000/

### Starting the Frontend

```
cd frontend
npm run dev
```

The frontend application will be available at http://localhost:5173/

### API Endpoints

#### Generate SQL Query from Natural Language

**Endpoint:** `POST /api/query`

**Request Body:**

For SQLite:
```json
{
  "userQuery": "Show me all users older than 30",
  "connection": "path/to/your/database.db"
}
```

Or with explicit type:
```json
{
  "userQuery": "Show me all users older than 30",
  "connection": {
    "type": "sqlite",
    "connection": "path/to/your/database.db"
  }
}
```

For PostgreSQL:
```json
{
  "userQuery": "Show me all users older than 30",
  "connection": {
    "type": "postgres",
    "connection": "postgresql://postgres:postgres@localhost:5432/rolai?schema=public"
  }
}
```

For MySQL:
```json
{
  "userQuery": "Show me all users older than 30",
  "connection": {
    "type": "mysql",
    "connection": "mysql://root:password@localhost:3306/testdb"
  }
}
```

Or with connection object:
```json
{
  "userQuery": "Show me all users older than 30",
  "connection": {
    "type": "postgres", // or "mysql"
    "connection": {
      "host": "localhost",
      "port": 5432, // 3306 for MySQL
      "database": "database",
      "user": "username",
      "password": "password"
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "age": 30,
        "created_at": "2023-04-18 12:00:00"
      },
      ...
    ],
    "sqlQuery": "SELECT * FROM users WHERE age > 30;",
    "databaseType": "sqlite"
  }
}
```

### Testing

1. Set up test databases:
   ```
   npm run setup-sqlite-db  # For SQLite
   npm run setup-postgres-db  # For PostgreSQL (requires PostgreSQL installed)
   npm run setup-mysql-db  # For MySQL (requires MySQL installed)
   ```

2. Run the test queries:
   ```
   npm run test-query  # Tests with SQLite by default
   npm run test:sqlite  # Tests with SQLite
   npm run test:postgres  # Tests with PostgreSQL
   npm run test:mysql  # Tests with MySQL
   ```

3. Run both setup and tests:
   ```
   npm test  # Uses SQLite by default
   ```

## Mock Mode

If you don't have an Anthropic API key, the server will run in mock mode, which provides predefined SQL queries for testing purposes.

## Frontend Usage Workflow

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

## Error Handling

The server includes comprehensive error handling for:
- Database connection issues
- API failures
- SQL execution errors

## Security

- Uses Helmet for security headers
- Prevents SQL injection through parameterized queries
- Stores API keys in environment variables

## License

ISC
