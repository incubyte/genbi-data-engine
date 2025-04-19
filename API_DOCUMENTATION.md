# GenBI Data Engine - UI Features and API Documentation

This document provides a comprehensive overview of the GenBI Data Engine's UI features and backend API endpoints.

## Table of Contents

- [UI Features](#ui-features)
  - [Dashboard](#dashboard)
  - [Database Connections](#database-connections)
  - [Query Interface](#query-interface)
  - [Results Display](#results-display)
  - [Visualizations](#visualizations)
  - [Settings](#settings)
- [API Endpoints](#api-endpoints)
  - [Query Processing](#query-processing)
  - [Connections Management](#connections-management)
  - [Saved Queries Management](#saved-queries-management)

## UI Features

GenBI is an AI-powered Business Intelligence platform that turns natural language questions into powerful analytics. The frontend provides a user-friendly interface for connecting to databases and querying them using natural language.

### Dashboard

The Dashboard provides an overview of your data environment:

- **Statistics Cards**: Shows the number of database connections, saved queries, and visualizations
- **Recent Connections**: Displays your most recently used database connections
- **Recent Queries**: Shows your most recently executed queries
- **Quick Actions**: Provides shortcuts to create new connections, run queries, and view visualizations
- **Getting Started Tips**: Offers guidance for new users

### Database Connections

The Database Connection interface allows you to:

- **Connect to Multiple Database Types**:
  - SQLite (file-based)
  - PostgreSQL
  - MySQL
- **Connection Management**:
  - Create new connections
  - Test connections before saving
  - Save connections for future use
  - View saved connections
  - Delete connections

### Query Interface

The Query Interface enables natural language interaction with your databases:

- **Natural Language Input**: Ask questions about your data in plain English
- **Suggested Examples**: Get inspiration from example queries
- **Connection Selection**: Choose from saved connections or create a new one
- **Query History**: Access your previously executed queries
- **Saved Queries**: Save frequently used queries for quick access

### Results Display

The Results Display presents query results in multiple formats:

- **Data Table**: View query results in a tabular format with pagination
- **SQL View**: See the generated SQL query with syntax highlighting
- **Explanation**: Read an explanation of how the query works
- **Export Options**: Export results to CSV, JSON, or Excel
- **Save Options**: Save queries and results for future reference

### Visualizations

The Visualization system automatically generates appropriate charts:

- **Smart Chart Selection**: Automatically selects the best chart type based on data
- **Multiple Chart Types**:
  - Bar charts
  - Line charts
  - Pie charts
  - Tables
- **Chart Customization**: Adjust chart settings, labels, and colors
- **Save Visualizations**: Save visualizations along with queries and results
- **Visualization Gallery**: Browse and manage saved visualizations

### Settings

The Settings page allows you to customize your experience:

- **Account Settings**: Manage user preferences
- **Theme Selection**: Choose between light and dark themes
- **Default Connection**: Set a default database connection
- **Export Preferences**: Configure default export formats

## API Endpoints

The GenBI Data Engine provides a RESTful API for interacting with the backend services. All endpoints return JSON responses.

### Query Processing

#### Process Natural Language Query

Converts a natural language query to SQL and executes it against the specified database.

**Endpoint:** `POST /api/query`

**Request:**

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "Show me all users who signed up last month",
    "connection": {
      "type": "sqlite",
      "connection": "path/to/database.db"
    }
  }'
```

**Alternative Request Formats:**

For PostgreSQL:
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

For MySQL:
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
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
    "databaseType": "sqlite",
    "visualization": {
      "recommendedChartTypes": ["bar", "table"],
      "xAxis": "name",
      "yAxis": "id",
      "reasoning": "Bar chart is recommended to compare the number of users by name."
    }
  }
}
```

### Connections Management

#### Get All Connections

Retrieves all saved database connections.

**Endpoint:** `GET /api/connections`

**Request:**

```bash
curl -X GET http://localhost:3000/api/connections
```

**Response:**

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
          "password": "********"
        },
        "created_at": "2023-06-02T12:00:00.000Z"
      }
    ]
  }
}
```

#### Get Connection by ID

Retrieves a specific saved connection by its ID.

**Endpoint:** `GET /api/connections/:id`

**Request:**

```bash
curl -X GET http://localhost:3000/api/connections/550e8400-e29b-41d4-a716-446655440000
```

**Response:**

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

#### Save Connection

Saves a new database connection.

**Endpoint:** `POST /api/connections`

**Request:**

```bash
curl -X POST http://localhost:3000/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Local SQLite Database",
    "type": "sqlite",
    "connection": "path/to/database.db"
  }'
```

**Alternative Request Formats:**

For PostgreSQL:
```bash
curl -X POST http://localhost:3000/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production PostgreSQL",
    "type": "postgres",
    "connection": {
      "host": "localhost",
      "port": 5432,
      "database": "mydb",
      "user": "postgres",
      "password": "password"
    }
  }'
```

For MySQL:
```bash
curl -X POST http://localhost:3000/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development MySQL",
    "type": "mysql",
    "connection": {
      "host": "localhost",
      "port": 3306,
      "database": "mydb",
      "user": "root",
      "password": "password"
    }
  }'
```

**Response:**

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

#### Delete Connection

Deletes a saved connection.

**Endpoint:** `DELETE /api/connections/:id`

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/connections/550e8400-e29b-41d4-a716-446655440000
```

**Response:**

```json
{
  "status": "success",
  "message": "Connection with ID 550e8400-e29b-41d4-a716-446655440000 deleted successfully"
}
```

### Saved Queries Management

#### Get All Saved Queries

Retrieves all saved queries.

**Endpoint:** `GET /api/saved-queries`

**Request:**

```bash
curl -X GET http://localhost:3000/api/saved-queries
```

**Response:**

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
        "name": "Product Sales Visualization",
        "query": "Show me top selling products",
        "connection_id": "550e8400-e29b-41d4-a716-446655440001",
        "connection_name": "Production PostgreSQL",
        "connection_type": "postgres",
        "sql_query": "SELECT product_name, SUM(quantity) as total_sold FROM sales GROUP BY product_name ORDER BY total_sold DESC LIMIT 10",
        "chart_type": "bar",
        "visualization_config": {
          "xAxis": "product_name",
          "yAxis": "total_sold",
          "title": "Top Selling Products"
        },
        "description": "Visualization of top selling products by quantity",
        "created_at": "2023-06-04T12:00:00.000Z"
      }
    ]
  }
}
```

#### Get Query by ID

Retrieves a specific saved query by its ID.

**Endpoint:** `GET /api/saved-queries/:id`

**Request:**

```bash
curl -X GET http://localhost:3000/api/saved-queries/550e8400-e29b-41d4-a716-446655440002
```

**Response:**

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

#### Save Query

Saves a new query or visualization.

**Endpoint:** `POST /api/saved-queries`

**Request (Basic Query):**

```bash
curl -X POST http://localhost:3000/api/saved-queries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Users",
    "query": "Show me all users who signed up last month",
    "connection_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Request (Visualization with Bar Chart):**

```bash
curl -X POST http://localhost:3000/api/saved-queries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Revenue by Category",
    "query": "Show me monthly revenue by product category",
    "connection_id": "550e8400-e29b-41d4-a716-446655440000",
    "sql_query": "SELECT category, SUM(price) as revenue, strftime('\''%Y-%m'\'', purchase_date) as month FROM sales GROUP BY category, month ORDER BY month",
    "results": [{"category": "Electronics", "revenue": 12500, "month": "2023-05"}, {"category": "Clothing", "revenue": 8300, "month": "2023-05"}],
    "chart_type": "bar",
    "visualization_config": {
      "xAxis": "category",
      "yAxis": "revenue",
      "title": "Revenue by Category"
    },
    "description": "Monthly revenue breakdown by product category"
  }'
```

**Request (Visualization with Line Chart):**

```bash
curl -X POST http://localhost:3000/api/saved-queries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Sales Trend",
    "query": "Show me monthly sales trend for the past year",
    "connection_id": "550e8400-e29b-41d4-a716-446655440000",
    "sql_query": "SELECT strftime('\''%Y-%m'\'', sale_date) as month, SUM(amount) as total_sales FROM sales WHERE sale_date >= date('\''now'\'', '\''-1 year'\'') GROUP BY month ORDER BY month",
    "results": [
      {"month": "2022-06", "total_sales": 125000},
      {"month": "2022-07", "total_sales": 131000},
      {"month": "2022-08", "total_sales": 142000},
      {"month": "2022-09", "total_sales": 138000},
      {"month": "2022-10", "total_sales": 155000},
      {"month": "2022-11", "total_sales": 168000},
      {"month": "2022-12", "total_sales": 182000},
      {"month": "2023-01", "total_sales": 145000},
      {"month": "2023-02", "total_sales": 152000},
      {"month": "2023-03", "total_sales": 165000},
      {"month": "2023-04", "total_sales": 172000},
      {"month": "2023-05", "total_sales": 185000}
    ],
    "chart_type": "line",
    "visualization_config": {
      "xAxis": "month",
      "yAxis": "total_sales",
      "title": "Monthly Sales Trend",
      "grid": true,
      "animation": true
    },
    "description": "Monthly sales trend for the past year"
  }'
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "query": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Monthly Revenue by Category",
      "query": "Show me monthly revenue by product category",
      "connection_id": "550e8400-e29b-41d4-a716-446655440000",
      "connection_name": "Local SQLite Database",
      "connection_type": "sqlite",
      "sql_query": "SELECT category, SUM(price) as revenue, strftime('%Y-%m', purchase_date) as month FROM sales GROUP BY category, month ORDER BY month",
      "chart_type": "bar",
      "visualization_config": {
        "xAxis": "category",
        "yAxis": "revenue",
        "title": "Revenue by Category"
      },
      "description": "Monthly revenue breakdown by product category",
      "created_at": "2023-06-03T12:00:00.000Z"
    }
  }
}
```

#### Delete Query

Deletes a saved query.

**Endpoint:** `DELETE /api/saved-queries/:id`

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/saved-queries/550e8400-e29b-41d4-a716-446655440002
```

**Response:**

```json
{
  "status": "success",
  "message": "Query with ID 550e8400-e29b-41d4-a716-446655440002 deleted successfully"
}
```
