/**
 * This script verifies that the user data database is properly initialized.
 * It can be run manually to check the database status.
 */

const { initUserDatabase } = require('./src/db/init-user-db');
const logger = require('./src/utils/logger');

async function verifyDatabase() {
  try {
    logger.info('Verifying user data database...');
    
    // Initialize the database (this will connect to the existing database or create a new one)
    const db = await initUserDatabase();
    
    // Check if the required tables exist
    const tables = await db.allAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('saved_connections', 'saved_queries')
    `);
    
    if (tables.length === 2) {
      logger.info('Database verification successful: All required tables exist');
      
      // Count records in each table
      const connectionCount = await db.getAsync('SELECT COUNT(*) as count FROM saved_connections');
      const queryCount = await db.getAsync('SELECT COUNT(*) as count FROM saved_queries');
      
      logger.info(`Database contains ${connectionCount.count} saved connections and ${queryCount.count} saved queries`);
    } else {
      logger.error('Database verification failed: Missing tables', { 
        foundTables: tables.map(t => t.name).join(', ') 
      });
    }
    
    // Close the database connection
    db.close();
    
  } catch (error) {
    logger.error('Database verification failed with error:', error);
    process.exit(1);
  }
}

// Run the verification
verifyDatabase();
