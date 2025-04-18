const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const MySQLService = require('./src/services/databases/mysqlService');

// Load environment variables
dotenv.config();

// MySQL connection info
const connectionInfo = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'hrms',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'your_password'
};

// Test MySQL service
async function testMySQLService() {
  console.log('Testing MySQL service...');
  
  // Create MySQL service
  const mysqlService = new MySQLService();
  let connection = null;
  
  try {
    // Connect to MySQL
    console.log('Connecting to MySQL...');
    connection = await mysqlService.connect(connectionInfo);
    console.log('Connected to MySQL successfully!');
    
    // Extract schema
    console.log('\nExtracting schema...');
    const schema = await mysqlService.extractSchema(connection);
    console.log('Schema extracted successfully!');
    console.log('Tables found:', Object.keys(schema).join(', '));
    
    // Execute a test query
    console.log('\nExecuting test query...');
    const query = 'SELECT * FROM users WHERE age > 30';
    const results = await mysqlService.executeQuery(connection, query);
    console.log('Query executed successfully!');
    console.log('Results:', JSON.stringify(results, null, 2));
    
    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('Error testing MySQL service:', error);
  } finally {
    // Close connection
    if (connection) {
      mysqlService.closeConnection(connection);
      console.log('MySQL connection closed');
    }
  }
}

// Run the test
testMySQLService();
