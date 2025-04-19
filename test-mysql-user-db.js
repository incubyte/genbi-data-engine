/**
 * Test script for MySQL schema extraction on a user database
 * This script creates a test database with sample tables and then extracts the schema
 */
const mysql = require('mysql2/promise');
const logger = require('./src/utils/logger');

// MySQL connection configuration
const connectionConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Empty password
  database: 'mysql' // Using the default 'mysql' database initially
};

// Test database name
const TEST_DB_NAME = 'genbi_test_db';

/**
 * Create a test database with sample tables
 */
async function createTestDatabase(connection) {
  try {
    console.log(`Creating test database: ${TEST_DB_NAME}...`);

    // Drop the database if it exists
    await connection.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME}`);

    // Create the database
    await connection.query(`CREATE DATABASE ${TEST_DB_NAME}`);
    console.log(`Database ${TEST_DB_NAME} created successfully!`);

    // Switch to the test database
    await connection.query(`USE ${TEST_DB_NAME}`);
    console.log(`Switched to database: ${TEST_DB_NAME}`);

    // Create users table
    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    console.log('Creating products table...');
    await connection.query(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    console.log('Creating orders table...');
    await connection.query(`
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create order_items table
    console.log('Creating order_items table...');
    await connection.query(`
      CREATE TABLE order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      )
    `);

    console.log('Test database and tables created successfully!');
  } catch (error) {
    console.error('Error creating test database:', error);
    throw error;
  }
}

/**
 * Extract schema from the test database
 */
async function extractTestDatabaseSchema(connection) {
  try {
    console.log(`Extracting schema for database: ${TEST_DB_NAME}`);

    // Get all tables
    const [tablesResult] = await connection.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ?
      AND table_type = 'BASE TABLE'
    `, [TEST_DB_NAME]);

    console.log(`Found ${tablesResult.length} tables in database ${TEST_DB_NAME}`);

    const schema = {};

    // For each table, get its columns and constraints
    for (const table of tablesResult) {
      const tableName = table.table_name;
      console.log(`\nExtracting schema for table: ${tableName}`);

      // Get table columns
      const [columnsResult] = await connection.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          column_key
        FROM information_schema.columns
        WHERE table_schema = ?
        AND table_name = ?
        ORDER BY ordinal_position
      `, [TEST_DB_NAME, tableName]);

      // Get foreign keys
      const [foreignKeysResult] = await connection.query(`
        SELECT
          k.constraint_name,
          column_name,
          k.referenced_table_name,
          referenced_column_name,
          update_rule,
          delete_rule
        FROM information_schema.key_column_usage k
        JOIN information_schema.referential_constraints r
          ON k.constraint_name = r.constraint_name
          AND k.constraint_schema = r.constraint_schema
        WHERE k.table_schema = ?
          AND k.table_name = ?
          AND k.referenced_table_name IS NOT NULL
      `, [TEST_DB_NAME, tableName]);

      // Get indexes
      const [indexesResult] = await connection.query(`
        SELECT
          index_name,
          non_unique
        FROM information_schema.statistics
        WHERE table_schema = ?
          AND table_name = ?
        GROUP BY index_name, non_unique
      `, [TEST_DB_NAME, tableName]);

      schema[tableName] = {
        columns: columnsResult.map(col => ({
          name: col.column_name,
          type: col.data_type,
          notNull: col.is_nullable === 'NO',
          defaultValue: col.column_default,
          primaryKey: col.column_key === 'PRI'
        })),
        foreignKeys: foreignKeysResult.map(fk => ({
          name: fk.constraint_name,
          column: fk.column_name,
          foreignTable: fk.referenced_table_name,
          foreignColumn: fk.referenced_column_name,
          onUpdate: fk.update_rule,
          onDelete: fk.delete_rule
        })),
        indexes: indexesResult.map(idx => ({
          name: idx.index_name,
          unique: idx.non_unique === 0
        }))
      };
    }

    console.log('\nExtracted Schema:');
    console.log(JSON.stringify(schema, null, 2));

    return schema;
  } catch (error) {
    console.error('Error extracting test database schema:', error);
    throw error;
  }
}

/**
 * Main test function
 */
async function testMySQLUserDatabase() {
  let pool = null;
  let connection = null;

  try {
    console.log('Creating MySQL connection pool...');

    // Create a connection pool
    pool = mysql.createPool({
      ...connectionConfig,
      connectionLimit: 10
    });

    // Get a connection from the pool
    console.log('Getting connection from pool...');
    connection = await pool.getConnection();
    console.log('Connection obtained successfully!');

    // Create test database and tables
    await createTestDatabase(connection);

    // Extract schema
    const schema = await extractTestDatabaseSchema(connection);

    // Verify schema
    console.log('\nVerifying schema...');

    // Check if all tables exist
    const expectedTables = ['users', 'products', 'orders', 'order_items'];
    const actualTables = Object.keys(schema);

    console.log(`Expected tables: ${expectedTables.join(', ')}`);
    console.log(`Actual tables: ${actualTables.join(', ')}`);

    const missingTables = expectedTables.filter(table => !actualTables.includes(table));
    if (missingTables.length > 0) {
      console.error(`Missing tables: ${missingTables.join(', ')}`);
    } else {
      console.log('All expected tables found!');
    }

    // Check foreign keys
    console.log('\nVerifying foreign keys...');

    // orders table should have a foreign key to users
    const ordersForeignKeys = schema.orders?.foreignKeys || [];
    console.log(`Orders table foreign keys: ${ordersForeignKeys.length}`);

    const hasUserForeignKey = ordersForeignKeys.some(fk =>
      fk.column === 'user_id' && fk.foreignTable === 'users' && fk.foreignColumn === 'id'
    );

    console.log(`Foreign key from orders to users: ${hasUserForeignKey ? 'Found' : 'Not found'}`);

    // order_items table should have foreign keys to orders and products
    const orderItemsForeignKeys = schema.order_items?.foreignKeys || [];
    console.log(`Order items table foreign keys: ${orderItemsForeignKeys.length}`);

    const hasOrderForeignKey = orderItemsForeignKeys.some(fk =>
      fk.column === 'order_id' && fk.foreignTable === 'orders' && fk.foreignColumn === 'id'
    );

    const hasProductForeignKey = orderItemsForeignKeys.some(fk =>
      fk.column === 'product_id' && fk.foreignTable === 'products' && fk.foreignColumn === 'id'
    );

    console.log(`Foreign key from order_items to orders: ${hasOrderForeignKey ? 'Found' : 'Not found'}`);
    console.log(`Foreign key from order_items to products: ${hasProductForeignKey ? 'Found' : 'Not found'}`);

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing MySQL user database:', error);
  } finally {
    // Release the connection
    if (connection) {
      try {
        connection.release();
        console.log('Connection released.');
      } catch (error) {
        console.error('Error releasing connection:', error);
      }
    }

    // Close the pool
    if (pool) {
      try {
        await pool.end();
        console.log('Connection pool closed.');
      } catch (error) {
        console.error('Error closing connection pool:', error);
      }
    }
  }
}

// Run the test
testMySQLUserDatabase();
