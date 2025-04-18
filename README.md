# GenBI Data Engine

A Node.js server that interfaces with Anthropic's API to generate SQL queries from natural language.

## Features

- Express.js server with proper middleware (CORS, Helmet, etc.)
- SQLite database integration with schema extraction
- Anthropic API integration for natural language to SQL conversion
- Main endpoint that processes user queries and returns results
- Comprehensive error handling and logging

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

## Usage

### Starting the Server

```
npm start
```

For development with auto-reload:
```
npm run dev
```

### API Endpoints

#### Generate SQL Query from Natural Language

**Endpoint:** `POST /api/query`

**Request Body:**
```json
{
  "userQuery": "Show me all users older than 30",
  "connectionString": "path/to/your/database.db"
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
    "sqlQuery": "SELECT * FROM users WHERE age > 30;"
  }
}
```

### Testing

1. Set up a test database:
   ```
   npm run setup-test-db
   ```

2. Run the test queries:
   ```
   npm run test-query
   ```

3. Run both setup and tests:
   ```
   npm test
   ```

## Mock Mode

If you don't have an Anthropic API key, the server will run in mock mode, which provides predefined SQL queries for testing purposes.

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
