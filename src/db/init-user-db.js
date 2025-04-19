const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { createDbLogger } = require('../utils/dbLogger');
const config = require('../config/config');
const { createDatabaseError } = require('../utils/errorHandler');

// Create a database logger for initialization
const dbLogger = createDbLogger('UserDatabaseInit');

// Get database configuration
const dbConfig = config.getDatabaseConfig();
const dbPath = dbConfig.userDataPath;
const dbDir = path.dirname(dbPath);

/**
 * Initialize the user data database
 * @returns {Promise<void>}
 */
async function initUserDatabase() {
  // Data directory is created by the config service

  // Log database initialization start
  logger.info('Initializing user database', { path: dbPath, exists: fs.existsSync(dbPath) });

  // Check if database already exists
  const dbExists = fs.existsSync(dbPath);

  // Log database directory status
  const dirExists = fs.existsSync(dbDir);
  logger.info('Database directory status', { path: dbDir, exists: dirExists });

  // Create directory if it doesn't exist (as a backup to config service)
  if (!dirExists) {
    logger.info('Creating database directory', { path: dbDir });
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create a new database connection
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      const errorMsg = `Error connecting to user database: ${err.message}`;
      dbLogger.logError('connect', err, { path: dbPath });
      throw createDatabaseError(errorMsg, { path: dbPath });
    }
    dbLogger.logOperation('connect', `Connected to the user database at ${dbPath}`);
    logger.info(`Connected to the user database at ${dbPath}`);
  });

  // Promisify database methods
  db.runAsync = promisify(db.run).bind(db);
  db.allAsync = promisify(db.all).bind(db);
  db.getAsync = promisify(db.get).bind(db);

  try {
    // Enable foreign keys
    await db.runAsync('PRAGMA foreign_keys = ON');
    dbLogger.logOperation('pragma', 'Enabled foreign keys');

    // Get database information
    const dbInfo = await db.getAsync('PRAGMA database_list');
    dbLogger.logOperation('info', 'Database information', { info: dbInfo });

    // Only create tables if the database doesn't exist
    if (!dbExists) {
      logger.info('Creating user database tables...');
      dbLogger.logOperation('create_tables', 'Creating user database tables');

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
      dbLogger.logOperation('create_table', 'Created saved_connections table');

      // Create saved_queries table
      await db.runAsync(`
        CREATE TABLE saved_queries (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          query TEXT NOT NULL,
          connection_id TEXT,
          sql_query TEXT,
          results TEXT,
          chart_type TEXT,
          visualization_config TEXT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (connection_id) REFERENCES saved_connections(id) ON DELETE SET NULL
        )
      `);
      logger.info('Created saved_queries table');
      dbLogger.logOperation('create_table', 'Created saved_queries table');

      logger.info('User database initialization complete');
      dbLogger.logOperation('init_complete', 'User database initialization complete');
    } else {
      logger.info('User database already exists, skipping initialization');
      dbLogger.logOperation('skip_init', 'User database already exists');

      // Verify tables exist
      const tables = await db.allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('saved_connections', 'saved_queries')");
      dbLogger.logOperation('verify_tables', 'Verified existing tables', { tables: tables.map(t => t.name) });

      if (tables.length !== 2) {
        logger.warn('Database exists but tables are missing', { found: tables.map(t => t.name) });
        dbLogger.logOperation('tables_missing', 'Database exists but tables are missing', { found: tables.map(t => t.name) });
      }
    }

    return db;
  } catch (error) {
    const errorMsg = `Error initializing user database: ${error.message}`;
    logger.error(errorMsg, { error });
    dbLogger.logError('init', error, { path: dbPath });
    throw createDatabaseError(errorMsg, { path: dbPath });
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
