const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errorHandler');

/**
 * Database service for SQLite interactions
 */
class DatabaseService {
  /**
   * Connect to a SQLite database
   * @param {string} connectionString - SQLite database connection string
   * @returns {Promise<sqlite3.Database>} - Database connection
   */
  async connect(connectionString) {
    try {
      logger.info(`Connecting to database: ${connectionString}`);
      
      // Create a new database connection
      const db = new sqlite3.Database(connectionString, (err) => {
        if (err) {
          throw new ApiError(500, `Error connecting to database: ${err.message}`);
        }
        logger.info('Connected to the SQLite database');
      });
      
      // Promisify database methods
      db.allAsync = promisify(db.all).bind(db);
      db.runAsync = promisify(db.run).bind(db);
      db.getAsync = promisify(db.get).bind(db);
      
      return db;
    } catch (error) {
      logger.error('Database connection error:', error);
      throw new ApiError(500, `Failed to connect to database: ${error.message}`);
    }
  }

  /**
   * Extract database schema information
   * @param {sqlite3.Database} db - Database connection
   * @returns {Promise<Object>} - Database schema information
   */
  async extractSchema(db) {
    try {
      logger.info('Extracting database schema');
      
      // Get all tables
      const tables = await db.allAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      
      const schema = {};
      
      // For each table, get its columns and foreign keys
      for (const table of tables) {
        const tableName = table.name;
        
        // Get table columns
        const columns = await db.allAsync(`PRAGMA table_info(${tableName})`);
        
        // Get foreign keys
        const foreignKeys = await db.allAsync(`PRAGMA foreign_key_list(${tableName})`);
        
        // Get indexes
        const indexes = await db.allAsync(`PRAGMA index_list(${tableName})`);
        
        schema[tableName] = {
          columns: columns.map(col => ({
            name: col.name,
            type: col.type,
            notNull: col.notnull === 1,
            defaultValue: col.dflt_value,
            primaryKey: col.pk === 1
          })),
          foreignKeys: foreignKeys.map(fk => ({
            id: fk.id,
            seq: fk.seq,
            table: fk.table,
            from: fk.from,
            to: fk.to,
            onUpdate: fk.on_update,
            onDelete: fk.on_delete,
            match: fk.match
          })),
          indexes: indexes.map(idx => ({
            name: idx.name,
            unique: idx.unique === 1
          }))
        };
      }
      
      logger.info('Schema extraction complete');
      return schema;
    } catch (error) {
      logger.error('Schema extraction error:', error);
      throw new ApiError(500, `Failed to extract database schema: ${error.message}`);
    }
  }

  /**
   * Execute a SQL query
   * @param {sqlite3.Database} db - Database connection
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(db, query, params = []) {
    try {
      logger.info(`Executing query: ${query}`);
      logger.debug('Query parameters:', params);
      
      const results = await db.allAsync(query, params);
      logger.info(`Query executed successfully, returned ${results.length} rows`);
      
      return results;
    } catch (error) {
      logger.error('Query execution error:', error);
      throw new ApiError(500, `Failed to execute query: ${error.message}`);
    }
  }

  /**
   * Close the database connection
   * @param {sqlite3.Database} db - Database connection
   */
  closeConnection(db) {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database connection:', err);
        } else {
          logger.info('Database connection closed');
        }
      });
    }
  }
}

module.exports = new DatabaseService();
