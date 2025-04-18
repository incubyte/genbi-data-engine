const logger = require('../../utils/logger');
const { ApiError } = require('../../utils/errorHandler');
const BaseDatabaseService = require('./baseDatabaseService');
const connectionPoolManager = require('../connectionPoolManager');
const queryCacheService = require('../queryCacheService');

/**
 * SQLite database service
 */
class SQLiteService extends BaseDatabaseService {
  /**
   * Connect to a SQLite database
   * @param {string} connectionString - SQLite database connection string (file path)
   * @returns {Promise<sqlite3.Database>} - Database connection
   */
  async connect(connectionString) {
    try {
      logger.info(`Connecting to SQLite database: ${connectionString}`);

      // Get connection from pool manager
      const db = await connectionPoolManager.getConnection('sqlite', connectionString);

      return db;
    } catch (error) {
      logger.error('SQLite connection error:', error);
      throw new ApiError(500, `Failed to connect to SQLite database: ${error.message}`);
    }
  }

  /**
   * Extract database schema information from SQLite
   * @param {sqlite3.Database} db - Database connection
   * @returns {Promise<Object>} - Database schema information
   */
  async extractSchema(db) {
    try {
      logger.info('Extracting SQLite database schema');

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

      logger.info('SQLite schema extraction complete');
      return schema;
    } catch (error) {
      logger.error('SQLite schema extraction error:', error);
      throw new ApiError(500, `Failed to extract SQLite database schema: ${error.message}`);
    }
  }

  /**
   * Execute a SQL query on SQLite
   * @param {sqlite3.Database} db - Database connection
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @param {Object} options - Query options
   * @param {boolean} options.useCache - Whether to use the query cache
   * @param {string} options.connectionId - Connection ID for cache key
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(db, query, params = [], options = {}) {
    try {
      const { useCache = true, connectionId = '' } = options;

      // Check if query is cacheable and we should use cache
      const isCacheable = useCache && this.isCacheableQuery(query);

      // Try to get from cache first
      if (isCacheable) {
        const cachedResults = queryCacheService.get(query, params, connectionId);
        if (cachedResults) {
          logger.info(`Using cached results for SQLite query: ${query}`);
          return cachedResults;
        }
      }

      // Execute the query
      logger.info(`Executing SQLite query: ${query}`);
      logger.debug('Query parameters:', params);

      const startTime = Date.now();
      const results = await db.allAsync(query, params);
      const executionTime = Date.now() - startTime;

      logger.info(`SQLite query executed successfully in ${executionTime}ms, returned ${results.length} rows`);

      // Cache the results if cacheable
      if (isCacheable) {
        queryCacheService.set(query, params, results, connectionId);
      }

      return results;
    } catch (error) {
      logger.error('SQLite query execution error:', error);
      throw new ApiError(500, `Failed to execute SQLite query: ${error.message}`);
    }
  }

  /**
   * Close the SQLite database connection
   * @param {sqlite3.Database} db - Database connection
   * @param {string} connectionString - Connection string used to create the connection
   */
  closeConnection(db, connectionString) {
    if (db) {
      // Release connection back to the pool
      connectionPoolManager.releaseConnection('sqlite', db);
      logger.debug('SQLite database connection released back to pool');
    }
  }

  /**
   * Get the database type
   * @returns {string} - Database type
   */
  getDatabaseType() {
    return 'sqlite';
  }
}

module.exports = SQLiteService;
