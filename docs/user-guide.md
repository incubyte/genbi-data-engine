# GenBI User Guide

_Version: 1.0.0 (Last updated: April 2025)_

Welcome to GenBI, an AI-powered Business Intelligence platform that allows you to query your databases using natural language.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Connecting to Databases](#connecting-to-databases)
   - [SQLite Connections](#sqlite-connections)
   - [PostgreSQL Connections](#postgresql-connections)
   - [MySQL Connections](#mysql-connections)
   - [Managing Saved Connections](#managing-saved-connections)
4. [Querying Your Data](#querying-your-data)
   - [Writing Effective Queries](#writing-effective-queries)
   - [Understanding Query Results](#understanding-query-results)
   - [Saving and Managing Queries](#saving-and-managing-queries)
5. [Data Visualization](#data-visualization)
   - [Smart Chart Selection](#smart-chart-selection)
   - [Customizing Visualizations](#customizing-visualizations)
   - [Exporting Charts](#exporting-charts)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

## Introduction

GenBI is a powerful tool that combines the simplicity of natural language with the power of SQL. It allows you to query your databases using plain English, making data analysis accessible to everyone, regardless of their SQL knowledge.

Key features:
- Connect to SQLite, PostgreSQL, and MySQL databases
- Query your data using natural language
- Automatic data visualization with smart chart selection
- Save and manage database connections
- Save and reuse queries and visualizations
- View query results in a user-friendly format
- Export data and visualizations
- Access saved visualizations without re-running queries
- Refresh saved visualizations with current data

## Getting Started

To get started with GenBI, follow these steps:

1. Launch the GenBI application
2. Connect to a database
3. Ask questions about your data using natural language
4. View and analyze the results

## Connecting to Databases

GenBI supports three types of databases: SQLite, PostgreSQL, and MySQL. You can connect to any of these databases and save the connections for future use.

### SQLite Connections

To connect to a SQLite database:

1. From the main screen, select "Connect to Database"
2. Choose "SQLite" as the database type
3. Enter the path to your SQLite database file
4. Click "Connect"

Example:
```
Database Type: SQLite
Database Path: C:/path/to/your/database.db
```

### PostgreSQL Connections

To connect to a PostgreSQL database:

1. From the main screen, select "Connect to Database"
2. Choose "PostgreSQL" as the database type
3. Enter the connection details:
   - Host: The hostname or IP address of your PostgreSQL server
   - Port: The port number (default: 5432)
   - Database: The name of your database
   - Username: Your PostgreSQL username
   - Password: Your PostgreSQL password
4. Click "Connect"

Example:
```
Database Type: PostgreSQL
Host: localhost
Port: 5432
Database: mydatabase
Username: postgres
Password: ********
```

### MySQL Connections

To connect to a MySQL database:

1. From the main screen, select "Connect to Database"
2. Choose "MySQL" as the database type
3. Enter the connection details:
   - Host: The hostname or IP address of your MySQL server
   - Port: The port number (default: 3306)
   - Database: The name of your database
   - Username: Your MySQL username
   - Password: Your MySQL password
4. Click "Connect"

Example:
```
Database Type: MySQL
Host: localhost
Port: 3306
Database: mydatabase
Username: root
Password: ********
```

### Managing Saved Connections

You can save your database connections for future use:

1. After entering your connection details, click "Save Connection"
2. Enter a name for the connection
3. Click "Save"

To use a saved connection:
1. From the main screen, click "Saved Connections"
2. Select the connection you want to use
3. Click "Connect"

To delete a saved connection:
1. From the main screen, click "Saved Connections"
2. Find the connection you want to delete
3. Click the delete icon (trash can)
4. Confirm the deletion

## Querying Your Data

Once you're connected to a database, you can start querying your data using natural language.

### Writing Effective Queries

GenBI works best with clear, specific questions. Here are some tips for writing effective queries:

- Be specific about what you're looking for
- Mention table names if you know them
- Specify any filters or conditions
- Use proper grammar and punctuation

Examples of good queries:
- "Show me all users who signed up in the last month"
- "What are the top 10 products by sales in 2023?"
- "Count the number of orders by status"
- "Show me the average age of users by country"

### Understanding Query Results

After submitting a query, GenBI will:
1. Convert your natural language query to SQL
2. Execute the SQL query against your database
3. Display the results in a table format

The results page shows:
- The original natural language query
- The query results in a table format
- Smart visualizations of your data
- The generated SQL query
- Options to save the query or export the results

### Saving and Managing Queries and Visualizations

You can save your queries for future use:

1. After getting query results, click "Save Query"
2. Enter a name for the query
3. Click "Save"

To use a saved query:
1. From the query screen, click "Saved Queries"
2. Select the query you want to use
3. The query will be loaded into the query box
4. Click "Submit" to run the query

You can also save visualizations along with query results:

1. After getting query results, go to the "Visualizations" tab
2. Click "Save Visualization" in the top-right corner
3. Enter a name and optional description for the visualization
4. Click "Save"

To view saved visualizations:
1. From the main navigation, click "Visualizations"
2. Browse through your saved visualizations
3. Click "View" on any visualization to see it without re-running the query

To refresh a saved visualization with current data:
1. From the Visualizations screen, find the visualization you want to refresh
2. Click the refresh icon on the visualization card, or
3. Click "View" to open the visualization, then click the "Refresh Data" button, or
4. Click the menu icon (three dots) and select "Refresh Data"
5. The visualization will be updated with the latest data from the database

To delete a saved query or visualization:
1. From the respective screen (Saved Queries or Visualizations)
2. Find the item you want to delete
3. Click the menu icon (three dots) and select "Delete"
4. Confirm the deletion

## Data Visualization

GenBI includes a powerful data visualization system that automatically generates appropriate charts based on your query results. This makes it easy to gain insights from your data without having to manually create charts.

### Smart Chart Selection

When you run a query, GenBI analyzes your data and automatically selects the most appropriate chart type:

- **Line Charts**: For time series data and trends over time
- **Bar Charts**: For comparing values across categories
- **Pie Charts**: For showing part-to-whole relationships

GenBI considers factors like data types, cardinality (number of unique values), and patterns in your data to recommend the best visualization. If multiple chart types are suitable, you can easily switch between them using the chart type selector.

### Customizing Visualizations

You can customize your visualizations to better suit your needs:

1. Click the "Show Chart Settings" button above the chart
2. Use the configuration panel to adjust:
   - Data mapping (which columns to use for axes and values)
   - Chart title and labels
   - Appearance settings (legend position, colors, etc.)
3. Click "Apply" to update the chart with your changes

The changes you make are applied in real-time, allowing you to experiment with different configurations.

### Exporting Charts

You can export your visualizations for use in presentations or reports:

1. Click the menu icon (three dots) in the top-right corner of the chart
2. Select "Export as PNG" or "Export as SVG"
3. The chart will be downloaded to your computer

PNG format is best for general use, while SVG is ideal for high-quality printing or further editing in vector graphics software.

## Troubleshooting

### Connection Issues

If you're having trouble connecting to a database:

1. Verify that your database server is running
2. Check that your connection details are correct
3. Ensure that your database user has the necessary permissions
4. Check if there are any firewall rules blocking the connection
5. Try connecting with a different client to verify the connection details

### Query Issues

If your queries aren't returning the expected results:

1. Try rephrasing your query to be more specific
2. Check that the tables and columns you're referring to exist in your database
3. Verify that your database contains the data you're looking for
4. Look at the generated SQL query to understand how GenBI interpreted your question
5. Try a simpler query first, then gradually add complexity

## FAQ

### What databases does GenBI support?
GenBI currently supports SQLite, PostgreSQL, and MySQL databases.

### Do I need to know SQL to use GenBI?
No, GenBI is designed to be used without SQL knowledge. You can query your data using natural language.

### How does GenBI convert natural language to SQL?
GenBI uses advanced AI models to understand your questions and convert them to SQL queries.

### Is my data secure?
Yes, GenBI processes your queries locally and does not send your data to external servers. Your database credentials are stored securely.

### Can I export the query results?
Yes, GenBI allows you to export your query results as CSV files. You can also export visualizations as PNG or SVG images.

### Does GenBI support joins across multiple tables?
Yes, GenBI can generate SQL queries that join multiple tables based on your natural language query.

### What if GenBI generates incorrect SQL?
If GenBI generates incorrect SQL, try rephrasing your query to be more specific. You can also view the generated SQL and modify it if needed.
