const axios = require('axios');
const path = require('path');

// Test function
async function testQuery() {
  try {
    console.log('Testing the natural language to SQL query API...');

    // Database connection configurations
    const connections = [
      {
        type: 'sqlite',
        connection: path.join(__dirname, 'test.db'),
        label: 'SQLite'
      },
      // Uncomment to test with PostgreSQL
      // {
      //   type: 'postgres',
      //   connection: {
      //     host: process.env.PG_HOST || 'localhost',
      //     port: process.env.PG_PORT || 5432,
      //     database: process.env.PG_DATABASE || 'testdb',
      //     user: process.env.PG_USER || 'postgres',
      //     password: process.env.PG_PASSWORD || 'postgres'
      //   },
      //   label: 'PostgreSQL'
      // },
      // Uncomment to test with MySQL
      // {
      //   type: 'mysql',
      //   connection: {
      //     host: process.env.MYSQL_HOST || 'localhost',
      //     port: process.env.MYSQL_PORT || 3306,
      //     database: process.env.MYSQL_DATABASE || 'testdb',
      //     user: process.env.MYSQL_USER || 'root',
      //     password: process.env.MYSQL_PASSWORD || 'password'
      //   },
      //   label: 'MySQL'
      // }
    ];

    // Example natural language queries to test
    const queries = [
      'Show me all users older than 30',
      'List all products in the Electronics category',
      'What are the total sales for each user?',
      'Find all orders with a total amount greater than 1000',
      'Which products have never been ordered?'
    ];

    // Test each connection type
    for (const conn of connections) {
      console.log(`\n\n=== Testing with ${conn.label} database ===\n`);

      // Test each query
      for (const userQuery of queries) {
        console.log(`\nTesting query: "${userQuery}"`);

        // Make API request
        const response = await axios.post('http://localhost:3000/api/query', {
          userQuery,
          connection: conn
        });

        // Log results
        console.log(`Database Type: ${response.data.data.databaseType}`);
        console.log('Generated SQL:');
        console.log(response.data.data.sqlQuery);
        console.log('\nResults:');
        // Limit the output to avoid overwhelming the console
        const limitedResults = response.data.data.results.slice(0, 5);
        console.log(JSON.stringify(limitedResults, null, 2));
        if (response.data.data.results.length > 5) {
          console.log(`...and ${response.data.data.results.length - 5} more rows`);
        }
        console.log('-'.repeat(80));
      }
    }

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing API:');
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Make sure the server is running on port 3000.');
    } else if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else {
      console.error('Error details:', error.message);
    }
  }
}

// Run the test
testQuery();
