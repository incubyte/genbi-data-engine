const logger = require('../../utils/logger');
const { ApiError } = require('../../utils/errorHandler');
const BaseDatabaseService = require('./baseDatabaseService');
const connectionPoolManager = require('../connectionPoolManager');
const queryCacheService = require('../queryCacheService');

/**
 * MySQL database service
 */
class MySQLService extends BaseDatabaseService {
  /**
   * Connect to a MySQL database
   * @param {string|Object} connectionInfo - MySQL connection string or config object
   * @returns {Promise<Object>} - Database connection pool
   */
  async connect(connectionInfo) {
    try {
      logger.info('Connecting to MySQL database');

      // Get connection pool from pool manager
      const pool = await connectionPoolManager.getConnection('mysql', connectionInfo);

      return pool;
    } catch (error) {
      logger.error('MySQL connection error:', error);
      throw new ApiError(500, `Failed to connect to MySQL database: ${error.message}`);
    }
  }

  /**
   * Extract database schema information from MySQL
   * @param {Pool} pool - Database connection pool
   * @returns {Promise<Object>} - Database schema information
   */
  async extractSchema(pool) {
    try {
      logger.info('Extracting MySQL database schema');

      const connection = await pool.getConnection();

      try {
        // Get current database name
        const [dbResult] = await connection.query('SELECT DATABASE() as db_name');
        const dbName = dbResult[0].db_name;

        // Get all tables
        const [tablesResult] = await connection.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = ?
          AND table_type = 'BASE TABLE'
        `, [dbName]);

        const schema = {};

        // Log the number of tables found
        logger.info(`Found ${tablesResult.length} tables in database ${dbName}`);

        // If no tables found, return empty schema
        if (tablesResult.length === 0) {
          logger.info('No tables found in database, returning empty schema');
          return schema;
        }

        // For each table, get its columns and constraints
        for (const table of tablesResult) {
          const tableName = table.table_name;

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
          `, [dbName, tableName]);

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
          `, [dbName, tableName]);

          // Get indexes
          const [indexesResult] = await connection.query(`
            SELECT
              index_name,
              non_unique
            FROM information_schema.statistics
            WHERE table_schema = ?
              AND table_name = ?
            GROUP BY index_name, non_unique
          `, [dbName, tableName]);

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

        logger.info('MySQL schema extraction complete');
        return schema;
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('MySQL schema extraction error:', error);
      throw new ApiError(500, `Failed to extract MySQL database schema: ${error.message}`);
    }
  }

  /**
   * Execute a SQL query on MySQL
   * @param {Pool} pool - Database connection pool
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @param {Object} options - Query options
   * @param {boolean} options.useCache - Whether to use the query cache
   * @param {string} options.connectionId - Connection ID for cache key
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(pool, query, params = [], options = {}) {
    try {
      const { useCache = true, connectionId = '' } = options;

      // Check if query is cacheable and we should use cache
      const isCacheable = useCache && this.isCacheableQuery(query);

      // Try to get from cache first
      if (isCacheable) {
        const cachedResults = queryCacheService.get(query, params, connectionId);
        if (cachedResults) {
          logger.info(`Using cached results for MySQL query: ${query}`);
          return cachedResults;
        }
      }

      // Execute the query
      logger.info(`Executing MySQL query: ${query}`);
      logger.debug('Query parameters:', params);

      const connection = await pool.getConnection();

      try {
        const startTime = Date.now();
        const [rows] = await connection.query(query, params);
        const executionTime = Date.now() - startTime;

        logger.info(`MySQL query executed successfully in ${executionTime}ms, returned ${rows.length} rows`);

        // Cache the results if cacheable
        if (isCacheable) {
          queryCacheService.set(query, params, rows, connectionId);
        }

        return rows;
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('MySQL query execution error:', error);
      throw new ApiError(500, `Failed to execute MySQL query: ${error.message}`);
    }
  }

  /**
   * Close the MySQL database connection pool
   * @param {Pool} pool - Database connection pool
   * @param {string|Object} connectionInfo - Connection info used to create the pool
   */
  closeConnection(pool, connectionInfo) {
    if (pool) {
      // Release connection back to the pool
      connectionPoolManager.releaseConnection('mysql', pool);
      logger.debug('MySQL database connection released back to pool');
    }
  }

  /**
   * Get the database type
   * @returns {string} - Database type
   */
  getDatabaseType() {
    return 'mysql';
  }
}

module.exports = MySQLService;
