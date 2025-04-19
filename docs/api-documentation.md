# GenBI Data Engine API Documentation

_Version: 1.1.0 (Last updated: May 2025)_

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
          "sql_query": "SELECT id, name, email, signup_date FROM users WHERE signup_date >= date('now', '-1 month')",
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

#### Get a Saved Query by ID

Retrieves a specific saved query by its ID.

- **URL**: `/api/saved-queries/:id`
- **Method**: `GET`
- **URL Parameters**: `id` - The ID of the query to retrieve
- **Response (Basic Query)**:
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
        "sql_query": "SELECT id, name, email, signup_date FROM users WHERE signup_date >= date('now', '-1 month')",
        "created_at": "2023-06-03T12:00:00.000Z"
      }
    }
  }
  ```

- **Response (Visualization)**:
  ```json
  {
    "status": "success",
    "data": {
      "query": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "Product Sales Visualization",
        "query": "Show me top selling products",
        "connection_id": "550e8400-e29b-41d4-a716-446655440001",
        "connection_name": "Production PostgreSQL",
        "connection_type": "postgres",
        "sql_query": "SELECT product_name, SUM(quantity) as total_sold FROM sales GROUP BY product_name ORDER BY total_sold DESC LIMIT 10",
        "results": [
          {"product_name": "Product A", "total_sold": 1250},
          {"product_name": "Product B", "total_sold": 1100},
          {"product_name": "Product C", "total_sold": 950}
        ],
        "chart_type": "bar",
        "visualization_config": {
          "xAxis": "product_name",
          "yAxis": "total_sold",
          "title": "Top Selling Products"
        },
        "description": "Visualization of top selling products by quantity",
        "created_at": "2023-06-04T12:00:00.000Z"
      }
    }
  }
  ```

#### Save a New Query

Saves a new query or visualization.

- **URL**: `/api/saved-queries`
- **Method**: `POST`
- **Request Body (Basic Query)**:
  ```json
  {
    "name": "Monthly Users",
    "query": "Show me all users who signed up last month",
    "connection_id": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```

- **Request Body (Visualization with Bar Chart)**:
  ```json
  {
    "name": "Monthly Revenue by Category",
    "query": "Show me monthly revenue by product category",
    "connection_id": "550e8400-e29b-41d4-a716-446655440000",
    "sql_query": "SELECT category, SUM(price) as revenue, strftime('%Y-%m', purchase_date) as month FROM sales GROUP BY category, month ORDER BY month",
    "results": [{"category": "Electronics", "revenue": 12500, "month": "2023-05"}, {"category": "Clothing", "revenue": 8300, "month": "2023-05"}],
    "chart_type": "bar",
    "visualization_config": {
      "xAxis": "category",
      "yAxis": "revenue",
      "title": "Revenue by Category"
    },
    "description": "Monthly revenue breakdown by product category"
  }
  ```

- **Request Body (Visualization with Pie Chart)**:
  ```json
  {
    "name": "Sales Distribution by Region",
    "query": "Show me sales distribution by region",
    "connection_id": "550e8400-e29b-41d4-a716-446655440001",
    "sql_query": "SELECT region, SUM(amount) as total_sales FROM sales GROUP BY region ORDER BY total_sales DESC",
    "results": [
      {"region": "North", "total_sales": 45000},
      {"region": "South", "total_sales": 38000},
      {"region": "East", "total_sales": 42000},
      {"region": "West", "total_sales": 53000}
    ],
    "chart_type": "pie",
    "visualization_config": {
      "labels": "region",
      "values": "total_sales",
      "title": "Sales Distribution by Region"
    },
    "description": "Pie chart showing the distribution of sales across different regions"
  }
  ```

- **Request Body (Visualization with Line Chart)**:
  ```json
  {
    "name": "Monthly Sales Trend",
    "query": "Show me monthly sales trend for the past year",
    "connection_id": "550e8400-e29b-41d4-a716-446655440000",
    "sql_query": "SELECT strftime('%Y-%m', sale_date) as month, SUM(amount) as total_sales FROM sales WHERE sale_date >= date('now', '-1 year') GROUP BY month ORDER BY month",
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
      {"month": "2023-03", "total_sales": 159000},
      {"month": "2023-04", "total_sales": 165000},
      {"month": "2023-05", "total_sales": 178000}
    ],
    "chart_type": "line",
    "visualization_config": {
      "xAxis": "month",
      "yAxis": "total_sales",
      "title": "Monthly Sales Trend (Last 12 Months)"
    },
    "description": "Line chart showing the trend of monthly sales over the past year"
  }
  ```
- **Response (Basic Query)**:
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

- **Response (Visualization)**:
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

#### Refresh a Saved Query

Refreshes a saved query by re-executing the SQL query against the associated database and updating the results.

- **URL**: `/api/saved-queries/:id/refresh`
- **Method**: `POST`
- **URL Parameters**: `id` - The ID of the query to refresh
- **Response**:
  ```json
  {
    "status": "success",
    "data": {
      "query": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "Product Sales Visualization",
        "query": "Show me top selling products",
        "connection_id": "550e8400-e29b-41d4-a716-446655440001",
        "connection_name": "Production PostgreSQL",
        "connection_type": "postgres",
        "sql_query": "SELECT product_name, SUM(quantity) as total_sold FROM sales GROUP BY product_name ORDER BY total_sold DESC LIMIT 10",
        "results": [
          {"product_name": "Product A", "total_sold": 1350},
          {"product_name": "Product B", "total_sold": 1200},
          {"product_name": "Product C", "total_sold": 1050}
        ],
        "chart_type": "bar",
        "visualization_config": {
          "xAxis": "product_name",
          "yAxis": "total_sold",
          "title": "Top Selling Products"
        },
        "description": "Visualization of top selling products by quantity",
        "created_at": "2023-06-04T12:00:00.000Z",
        "last_refreshed": "2023-06-10T15:30:00.000Z"
      },
      "results": [
        {"product_name": "Product A", "total_sold": 1350},
        {"product_name": "Product B", "total_sold": 1200},
        {"product_name": "Product C", "total_sold": 1050}
      ]
    }
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

A saved query or visualization.

- `id` (string): Unique identifier for the query
- `name` (string): User-friendly name for the query
- `query` (string): The natural language query
- `connection_id` (string, optional): ID of the associated connection
- `connection_name` (string, optional): Name of the associated connection
- `connection_type` (string, optional): Type of the associated connection
- `sql_query` (string, optional): The generated SQL query
- `results` (array, optional): The query results
- `chart_type` (string, optional): Type of chart (bar, line, pie)
- `visualization_config` (object, optional): Configuration for the visualization
  - `xAxis` (string, optional): Field to use for x-axis in bar and line charts
  - `yAxis` (string, optional): Field to use for y-axis in bar and line charts
  - `labels` (string, optional): Field to use for labels (pie charts)
  - `values` (string, optional): Field to use for values (pie charts)
  - `title` (string, optional): Chart title
  - `colors` (array, optional): Custom colors for the chart
  - `legend` (boolean, optional): Whether to show the legend
  - `grid` (boolean, optional): Whether to show grid lines
  - `stacked` (boolean, optional): Whether to stack bars in a bar chart
  - `animation` (boolean, optional): Whether to animate the chart
  - `aspectRatio` (number, optional): Aspect ratio of the chart
- `description` (string, optional): Description of the visualization
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

### Example 3: Save a Visualization with Results

```javascript
// Save a visualization with query results
const visualizationResponse = await fetch('/api/saved-queries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Monthly Revenue by Category',
    query: 'Show me monthly revenue by product category',
    connection_id: connectionId,
    sql_query: 'SELECT category, SUM(price) as revenue, strftime(\'%Y-%m\', purchase_date) as month FROM sales GROUP BY category, month ORDER BY month',
    results: [{"category": "Electronics", "revenue": 12500, "month": "2023-05"}, {"category": "Clothing", "revenue": 8300, "month": "2023-05"}],
    chart_type: 'bar',
    visualization_config: {
      xAxis: 'category',
      yAxis: 'revenue',
      title: 'Revenue by Category'
    },
    description: 'Monthly revenue breakdown by product category'
  })
});

const visualizationData = await visualizationResponse.json();
console.log(visualizationData.data.query);
```

### Example 4: Retrieve and Display Saved Visualizations

```javascript
// Fetch all saved visualizations
const fetchVisualizations = async () => {
  try {
    // Get all saved queries
    const response = await fetch('/api/saved-queries');
    const data = await response.json();

    if (data.status === 'success') {
      // Filter queries that have visualization data
      const visualizations = data.data.queries.filter(query =>
        query.chart_type && query.visualization_config
      );

      // Process visualization data
      const processedVisualizations = visualizations.map(query => {
        // Parse JSON fields if they're strings
        let parsedResults = query.results;
        let parsedConfig = query.visualization_config;

        try {
          if (query.results && typeof query.results === 'string') {
            parsedResults = JSON.parse(query.results);
          }
        } catch (err) {
          console.warn(`Failed to parse results for query ${query.id}:`, err);
        }

        try {
          if (query.visualization_config && typeof query.visualization_config === 'string') {
            parsedConfig = JSON.parse(query.visualization_config);
          }
        } catch (err) {
          console.warn(`Failed to parse visualization_config for query ${query.id}:`, err);
        }

        return {
          id: query.id,
          title: query.name,
          description: query.description || `Visualization for: ${query.query}`,
          type: query.chart_type,
          createdAt: query.created_at,
          query: query.query,
          sqlQuery: query.sql_query,
          results: parsedResults,
          config: parsedConfig
        };
      });

      return processedVisualizations;
    } else {
      throw new Error(data.message || 'Failed to fetch visualizations');
    }
  } catch (error) {
    console.error('Error fetching visualizations:', error);
    throw error;
  }
};

// Get a specific visualization by ID
const getVisualizationById = async (id) => {
  try {
    const response = await fetch(`/api/saved-queries/${id}`);
    const data = await response.json();

    if (data.status === 'success') {
      const query = data.data.query;

      // Ensure results and visualization_config are parsed objects
      let parsedResults = query.results;
      let parsedConfig = query.visualization_config;

      if (typeof parsedResults === 'string') {
        parsedResults = JSON.parse(parsedResults);
      }

      if (typeof parsedConfig === 'string') {
        parsedConfig = JSON.parse(parsedConfig);
      }

      return {
        id: query.id,
        title: query.name,
        description: query.description,
        type: query.chart_type,
        query: query.query,
        sqlQuery: query.sql_query,
        results: parsedResults,
        config: parsedConfig,
        createdAt: query.created_at
      };
    } else {
      throw new Error(data.message || `Failed to fetch visualization with ID ${id}`);
    }
  } catch (error) {
    console.error(`Error fetching visualization with ID ${id}:`, error);
    throw error;
  }
};
```

### Example 5: Delete a Saved Visualization

```javascript
// Delete a saved visualization
const deleteVisualization = async (id) => {
  try {
    const response = await fetch(`/api/saved-queries/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log(`Visualization with ID ${id} deleted successfully`);
      return true;
    } else {
      throw new Error(data.message || `Failed to delete visualization with ID ${id}`);
    }
  } catch (error) {
    console.error(`Error deleting visualization with ID ${id}:`, error);
    throw error;
  }
};
```

### Example 6: MySQL-Specific Query Examples

```javascript
// Example 1: Connect to MySQL database and run a query
const mysqlQueryResponse = await fetch('/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userQuery: 'Show me sales by region for the last quarter',
    connection: {
      type: 'mysql',
      connection: {
        host: 'localhost',
        port: 3306,
        database: 'sales_db',
        user: 'sales_user',
        password: 'password123'
      }
    }
  })
});

const mysqlData = await mysqlQueryResponse.json();
console.log(mysqlData.data.results);
console.log(mysqlData.data.sqlQuery);

// Example 2: Save a MySQL connection
const mysqlConnectionResponse = await fetch('/api/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Sales Database',
    type: 'mysql',
    connection: {
      host: 'localhost',
      port: 3306,
      database: 'sales_db',
      user: 'sales_user',
      password: 'password123',
      connectionLimit: 10 // Optional: specify connection pool limit
    }
  })
});

const mysqlConnectionData = await mysqlConnectionResponse.json();
const mysqlConnectionId = mysqlConnectionData.data.connection.id;

// Example 3: Create a line chart visualization from MySQL data
const mysqlVisualizationResponse = await fetch('/api/saved-queries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Quarterly Sales Trend',
    query: 'Show me quarterly sales trend for the past year',
    connection_id: mysqlConnectionId,
    sql_query: 'SELECT CONCAT(YEAR(order_date), "-Q", QUARTER(order_date)) as quarter, SUM(amount) as total_sales FROM orders WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR) GROUP BY quarter ORDER BY order_date',
    results: [
      {"quarter": "2022-Q2", "total_sales": 125000},
      {"quarter": "2022-Q3", "total_sales": 142000},
      {"quarter": "2022-Q4", "total_sales": 168000},
      {"quarter": "2023-Q1", "total_sales": 152000}
    ],
    chart_type: 'line',
    visualization_config: {
      xAxis: 'quarter',
      yAxis: 'total_sales',
      title: 'Quarterly Sales Trend',
      grid: true,
      animation: true
    },
    description: 'Line chart showing quarterly sales trend from MySQL data'
  })
});

const mysqlVisualizationData = await mysqlVisualizationResponse.json();
console.log(mysqlVisualizationData.data.query);
```

### Example 7: PostgreSQL-Specific Query Examples

```javascript
// Example 1: Connect to PostgreSQL database and run a query
const pgQueryResponse = await fetch('/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userQuery: 'Show me customer distribution by country',
    connection: {
      type: 'postgres',
      connection: {
        host: 'localhost',
        port: 5432,
        database: 'customers_db',
        user: 'postgres',
        password: 'postgres123'
      }
    }
  })
});

const pgData = await pgQueryResponse.json();
console.log(pgData.data.results);
console.log(pgData.data.sqlQuery);

// Example 2: Save a PostgreSQL connection
const pgConnectionResponse = await fetch('/api/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Customer Database',
    type: 'postgres',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'customers_db',
      user: 'postgres',
      password: 'postgres123',
      ssl: false // Optional: specify SSL settings
    }
  })
});

const pgConnectionData = await pgConnectionResponse.json();
const pgConnectionId = pgConnectionData.data.connection.id;

// Example 3: Create a pie chart visualization from PostgreSQL data
const pgVisualizationResponse = await fetch('/api/saved-queries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Customer Distribution by Country',
    query: 'Show me customer distribution by country',
    connection_id: pgConnectionId,
    sql_query: 'SELECT country, COUNT(*) as customer_count FROM customers GROUP BY country ORDER BY customer_count DESC LIMIT 10',
    results: [
      {"country": "United States", "customer_count": 1250},
      {"country": "United Kingdom", "customer_count": 850},
      {"country": "Canada", "customer_count": 750},
      {"country": "Australia", "customer_count": 650},
      {"country": "Germany", "customer_count": 550}
    ],
    chart_type: 'pie',
    visualization_config: {
      labels: 'country',
      values: 'customer_count',
      title: 'Customer Distribution by Country',
      legend: true,
      colors: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f']
    },
    description: 'Pie chart showing distribution of customers by country from PostgreSQL data'
  })
});

const pgVisualizationData = await pgVisualizationResponse.json();
console.log(pgVisualizationData.data.query);
```
