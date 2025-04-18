const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Database file path
const dbDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dbDir, 'user-data.db');

/**
 * Initialize the user data database
 * @returns {Promise<void>}
 */
async function initUserDatabase() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    logger.info(`Created data directory at ${dbDir}`);
  }

  // Check if database already exists
  const dbExists = fs.existsSync(dbPath);
  
  // Create a new database connection
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      logger.error(`Error connecting to user database: ${err.message}`);
      throw err;
    }
    logger.info(`Connected to the user database at ${dbPath}`);
  });
  
  // Promisify database methods
  db.runAsync = promisify(db.run).bind(db);
  db.allAsync = promisify(db.all).bind(db);
  db.getAsync = promisify(db.get).bind(db);
  
  try {
    // Enable foreign keys
    await db.runAsync('PRAGMA foreign_keys = ON');
    
    // Only create tables if the database doesn't exist
    if (!dbExists) {
      logger.info('Creating user database tables...');
      
      // Create saved_connections table
      await db.runAsync(`
        CREATE TABLE saved_connections (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          connection TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      logger.info('Created saved_connections table');
      
      // Create saved_queries table
      await db.runAsync(`
        CREATE TABLE saved_queries (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          query TEXT NOT NULL,
          connection_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (connection_id) REFERENCES saved_connections(id) ON DELETE SET NULL
        )
      `);
      logger.info('Created saved_queries table');
      
      logger.info('User database initialization complete');
    } else {
      logger.info('User database already exists, skipping initialization');
    }
    
    return db;
  } catch (error) {
    logger.error('Error initializing user database:', error);
    throw error;
  }
}

// Export the initialization function
module.exports = {
  initUserDatabase,
  dbPath
};

// If this script is run directly, initialize the database
if (require.main === module) {
  initUserDatabase()
    .then(db => {
      logger.info('Database initialization successful');
      db.close();
    })
    .catch(err => {
      logger.error('Database initialization failed:', err);
      process.exit(1);
    });
}
