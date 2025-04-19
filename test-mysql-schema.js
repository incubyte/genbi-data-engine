/**
 * Test script for MySQL schema extraction
 * This script focuses on debugging the schema extraction process
 */
const mysql = require('mysql2/promise');
const logger = require('./src/utils/logger');

// MySQL connection configuration
const connectionConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Empty password
  database: 'mysql' // Using the default 'mysql' database for testing
};

/**
 * Test MySQL schema extraction directly
 */
async function testMySQLSchemaExtraction() {
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

    // Get current database name
    console.log('Getting current database name...');
    const [dbResult] = await connection.query('SELECT DATABASE() as db_name');
    const dbName = dbResult[0].db_name;
    console.log(`Current database: ${dbName}`);

    // Get all tables
    console.log('Getting all tables...');
    const [tablesResult] = await connection.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ?
      AND table_type = 'BASE TABLE'
    `, [dbName]);

    console.log(`Found ${tablesResult.length} tables in database ${dbName}`);

    // Print table names
    console.log('Tables:');
    tablesResult.forEach(table => {
      console.log(`  ${table.table_name}`);
    });

    // If no tables found, return empty schema
    if (tablesResult.length === 0) {
      console.log('No tables found in database.');
      return;
    }

    // For each table, get its columns and constraints
    for (const table of tablesResult) {
      const tableName = table.table_name;
      console.log(`\nExtracting schema for table: ${tableName}`);

      // Get table columns
      console.log('Getting columns...');
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
      `, [dbName, tableName]);

      console.log(`Found ${columnsResult.length} columns in table ${tableName}`);

      // Print column details
      console.log('Columns:');
      columnsResult.forEach(col => {
        console.log(`  ${col.column_name} (${col.data_type})${col.column_key === 'PRI' ? ' [PK]' : ''}${col.is_nullable === 'NO' ? ' [NOT NULL]' : ''}`);
      });

      // Get foreign keys
      console.log('Getting foreign keys...');
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
      `, [dbName, tableName]);

      console.log(`Found ${foreignKeysResult.length} foreign keys in table ${tableName}`);

      // Print foreign key details
      if (foreignKeysResult.length > 0) {
        console.log('Foreign Keys:');
        foreignKeysResult.forEach(fk => {
          console.log(`  ${fk.constraint_name}: ${fk.column_name} -> ${fk.referenced_table_name}.${fk.referenced_column_name}`);
        });
      }

      // Get indexes
      console.log('Getting indexes...');
      const [indexesResult] = await connection.query(`
        SELECT
          index_name,
          non_unique
        FROM information_schema.statistics
        WHERE table_schema = ?
          AND table_name = ?
        GROUP BY index_name, non_unique
      `, [dbName, tableName]);

      console.log(`Found ${indexesResult.length} indexes in table ${tableName}`);

      // Print index details
      if (indexesResult.length > 0) {
        console.log('Indexes:');
        indexesResult.forEach(idx => {
          console.log(`  ${idx.index_name}${idx.non_unique === 0 ? ' [UNIQUE]' : ''}`);
        });
      }
    }

    console.log('\nSchema extraction test completed successfully!');
  } catch (error) {
    console.error('Error testing MySQL schema extraction:', error);
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
testMySQLSchemaExtraction();
