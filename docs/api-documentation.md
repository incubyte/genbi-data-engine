# GenBI Data Engine API Documentation

_Version: 1.0.0 (Last updated: April 2025)_

This document provides comprehensive documentation for the GenBI Data Engine API.

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [API Endpoints](#api-endpoints)
   - [Query Processing](#query-processing)
   - [Connections Management](#connections-management)
   - [Saved Queries Management](#saved-queries-management)
5. [Data Models](#data-models)
6. [Examples](#examples)

## Introduction

The GenBI Data Engine API provides endpoints for natural language to SQL conversion, database connection management, and saved query management. The API is RESTful and uses JSON for request and response bodies.

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain a JSON object with the following structure:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message"
}
```

For validation errors, the response will also include a `details` field with specific validation errors:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation error",
  "details": {
    "field1": "Error message for field1",
    "field2": "Error message for field2"
  }
}
```

## API Endpoints

### Query Processing

#### Process a Natural Language Query

Converts a natural language query to SQL and executes it against the specified database.

- **URL**: `/api/query`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "userQuery": "Show me all users who signed up last month",
    "connection": {
      "type": "sqlite",
      "connection": "path/to/database.db"
    }
  }
  ```
  or
  ```json
  {
    "userQuery": "Show me all users who signed up last month",
    "connection": {
      "type": "postgres",
      "connection": {
        "host": "localhost",
        "port": 5432,
        "database": "mydb",
        "user": "postgres",
        "password": "password"
      }
    }
  }
  ```
  or
  ```json
  {
    "userQuery": "Show me all users who signed up last month",
    "connection": {
      "type": "mysql",
      "connection": {
        "host": "localhost",
        "port": 3306,
        "database": "mydb",
        "user": "root",
        "password": "password"
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "results": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "signup_date": "2023-05-15"
        },
        {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com",
          "signup_date": "2023-05-20"
        }
      ],
      "sqlQuery": "SELECT id, name, email, signup_date FROM users WHERE signup_date >= date('now', '-1 month')",
      "databaseType": "sqlite"
    }
  }
  ```

### Connections Management

#### Get All Saved Connections

Retrieves all saved database connections.

- **URL**: `/api/connections`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "connections": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Local SQLite Database",
          "type": "sqlite",
          "connection": "path/to/database.db",
          "created_at": "2023-06-01T12:00:00.000Z"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Production PostgreSQL",
          "type": "postgres",
          "connection": {
            "host": "localhost",
            "port": 5432,
            "database": "mydb",
            "user": "postgres",
            "password": "password"
          },
          "created_at": "2023-06-02T12:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get a Saved Connection by ID

Retrieves a specific saved connection by its ID.

- **URL**: `/api/connections/:id`
- **Method**: `GET`
- **URL Parameters**: `id` - The ID of the connection to retrieve
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "connection": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Local SQLite Database",
        "type": "sqlite",
        "connection": "path/to/database.db",
        "created_at": "2023-06-01T12:00:00.000Z"
      }
    }
  }
  ```

#### Save a New Connection

Saves a new database connection.

- **URL**: `/api/connections`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Local SQLite Database",
    "type": "sqlite",
    "connection": "path/to/database.db"
  }
  ```
  or
  ```json
  {
    "name": "Production PostgreSQL",
    "type": "postgres",
    "connection": {
      "host": "localhost",
      "port": 5432,
      "database": "mydb",
      "user": "postgres",
      "password": "password"
    }
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "connection": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Local SQLite Database",
        "type": "sqlite",
        "connection": "path/to/database.db",
        "created_at": "2023-06-01T12:00:00.000Z"
      }
    }
  }
  ```

#### Delete a Saved Connection

Deletes a saved connection.

- **URL**: `/api/connections/:id`
- **Method**: `DELETE`
- **URL Parameters**: `id` - The ID of the connection to delete
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Connection with ID 550e8400-e29b-41d4-a716-446655440000 deleted successfully"
  }
  ```

### Saved Queries Management

#### Get All Saved Queries

Retrieves all saved queries.

- **URL**: `/api/saved-queries`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "queries": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "Monthly Users",
          "query": "Show me all users who signed up last month",
          "connection_id": "550e8400-e29b-41d4-a716-446655440000",
          "connection_name": "Local SQLite Database",
          "connection_type": "sqlite",
          "created_at": "2023-06-03T12:00:00.000Z"
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "name": "Product Sales",
          "query": "Show me top selling products",
          "connection_id": "550e8400-e29b-41d4-a716-446655440001",
          "connection_name": "Production PostgreSQL",
          "connection_type": "postgres",
          "created_at": "2023-06-04T12:00:00.000Z"
        }
      ]
    }
  }
  ```

#### Get a Saved Query by ID

Retrieves a specific saved query by its ID.

- **URL**: `/api/saved-queries/:id`
- **Method**: `GET`
- **URL Parameters**: `id` - The ID of the query to retrieve
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "query": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Monthly Users",
        "query": "Show me all users who signed up last month",
        "connection_id": "550e8400-e29b-41d4-a716-446655440000",
        "connection_name": "Local SQLite Database",
        "connection_type": "sqlite",
        "created_at": "2023-06-03T12:00:00.000Z"
      }
    }
  }
  ```

#### Save a New Query

Saves a new query.

- **URL**: `/api/saved-queries`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Monthly Users",
    "query": "Show me all users who signed up last month",
    "connection_id": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "query": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Monthly Users",
        "query": "Show me all users who signed up last month",
        "connection_id": "550e8400-e29b-41d4-a716-446655440000",
        "connection_name": "Local SQLite Database",
        "connection_type": "sqlite",
        "created_at": "2023-06-03T12:00:00.000Z"
      }
    }
  }
  ```

#### Delete a Saved Query

Deletes a saved query.

- **URL**: `/api/saved-queries/:id`
- **Method**: `DELETE`
- **URL Parameters**: `id` - The ID of the query to delete
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Query with ID 550e8400-e29b-41d4-a716-446655440002 deleted successfully"
  }
  ```

## Data Models

### Connection

A database connection.

- `id` (string): Unique identifier for the connection
- `name` (string): User-friendly name for the connection
- `type` (string): Database type (sqlite, postgres, mysql)
- `connection` (string|object): Connection details (file path for SQLite, connection object for PostgreSQL and MySQL)
- `created_at` (string): Creation timestamp

### Query

A saved query.

- `id` (string): Unique identifier for the query
- `name` (string): User-friendly name for the query
- `query` (string): The natural language query
- `connection_id` (string, optional): ID of the associated connection
- `connection_name` (string, optional): Name of the associated connection
- `connection_type` (string, optional): Type of the associated connection
- `created_at` (string): Creation timestamp

## Examples

### Example 1: Process a Natural Language Query

```javascript
// Example using fetch API
const response = await fetch('/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userQuery: 'Show me all users who signed up last month',
    connection: {
      type: 'sqlite',
      connection: 'path/to/database.db'
    }
  })
});

const data = await response.json();
console.log(data.data.results);
console.log(data.data.sqlQuery);
```

### Example 2: Save a Connection and Query

```javascript
// Save a connection
const connectionResponse = await fetch('/api/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Local SQLite Database',
    type: 'sqlite',
    connection: 'path/to/database.db'
  })
});

const connectionData = await connectionResponse.json();
const connectionId = connectionData.data.connection.id;

// Save a query associated with the connection
const queryResponse = await fetch('/api/saved-queries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Monthly Users',
    query: 'Show me all users who signed up last month',
    connection_id: connectionId
  })
});

const queryData = await queryResponse.json();
console.log(queryData.data.query);
```
