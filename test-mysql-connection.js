/**
 * Test script for MySQL connection and schema extraction
 */
const MySQLService = require('./src/services/databases/mysqlService');
const logger = require('./src/utils/logger');

// MySQL connection configuration
const connectionConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root', // Try with 'root' as password
  database: 'mysql' // Using the default 'mysql' database for testing
};

// Create an instance of the MySQL service
const mysqlService = new MySQLService();

/**
 * Test MySQL connection and schema extraction
 */
async function testMySQLConnection() {
  let pool = null;

  try {
    console.log('Testing MySQL connection...');

    // Connect to MySQL
    pool = await mysqlService.connect(connectionConfig);
    console.log('MySQL connection successful!');

    // Test a simple query
    console.log('Testing a simple query...');
    const result = await mysqlService.executeQuery(pool, 'SELECT VERSION() as version');
    console.log('MySQL version:', result[0].version);

    // Extract schema
    console.log('Extracting database schema...');
    const schema = await mysqlService.extractSchema(pool);

    // Print schema details
    console.log('\nDatabase Schema:');
    console.log(JSON.stringify(schema, null, 2));

    // Print table count
    const tableCount = Object.keys(schema).length;
    console.log(`\nFound ${tableCount} tables in the database.`);

    // Print details for each table
    for (const [tableName, tableInfo] of Object.entries(schema)) {
      console.log(`\nTable: ${tableName}`);
      console.log(`  Columns: ${tableInfo.columns.length}`);
      console.log(`  Foreign Keys: ${tableInfo.foreignKeys.length}`);
      console.log(`  Indexes: ${tableInfo.indexes.length}`);

      // Print column details
      console.log('  Column details:');
      tableInfo.columns.forEach(column => {
        console.log(`    ${column.name} (${column.type})${column.primaryKey ? ' [PK]' : ''}${column.notNull ? ' [NOT NULL]' : ''}`);
      });
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing MySQL connection:', error);
  } finally {
    // Close the connection
    if (pool) {
      try {
        mysqlService.closeConnection(pool, connectionConfig);
        console.log('MySQL connection closed.');
      } catch (error) {
        console.error('Error closing MySQL connection:', error);
      }
    }
  }
}

// Run the test
testMySQLConnection();
