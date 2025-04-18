const logger = require('../../utils/logger');
const { ApiError } = require('../../utils/errorHandler');
const BaseDatabaseService = require('./baseDatabaseService');
const connectionPoolManager = require('../connectionPoolManager');
const queryCacheService = require('../queryCacheService');

/**
 * PostgreSQL database service
 */
class PostgresService extends BaseDatabaseService {
  /**
   * Connect to a PostgreSQL database
   * @param {string|Object} connectionInfo - PostgreSQL connection string or config object
   * @returns {Promise<Object>} - Database connection pool
   */
  async connect(connectionInfo) {
    try {
      logger.info('Connecting to PostgreSQL database');

      // Get connection pool from pool manager
      const pool = await connectionPoolManager.getConnection('postgres', connectionInfo);

      return pool;
    } catch (error) {
      logger.error('PostgreSQL connection error:', error);
      throw new ApiError(500, `Failed to connect to PostgreSQL database: ${error.message}`);
    }
  }

  /**
   * Extract database schema information from PostgreSQL
   * @param {Pool} pool - Database connection pool
   * @returns {Promise<Object>} - Database schema information
   */
  async extractSchema(pool) {
    try {
      logger.info('Extracting PostgreSQL database schema');

      const client = await pool.connect();

      try {
        // Get current database name
        const dbResult = await client.query('SELECT current_database()');
        const dbName = dbResult.rows[0].current_database;

        // Get all tables in the public schema
        const tablesQuery = `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        `;
        const tablesResult = await client.query(tablesQuery);

        const schema = {};

        // For each table, get its columns and constraints
        for (const table of tablesResult.rows) {
          const tableName = table.table_name;

          // Get table columns
          const columnsQuery = `
            SELECT
              column_name,
              data_type,
              is_nullable,
              column_default,
              (SELECT EXISTS (
                SELECT 1
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu
                  ON tc.constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_name = c.table_name
                  AND ccu.column_name = c.column_name
              )) as is_primary_key
            FROM information_schema.columns c
            WHERE table_schema = 'public'
            AND table_name = $1
            ORDER BY ordinal_position
          `;
          const columnsResult = await client.query(columnsQuery, [tableName]);

          // Get foreign keys
          const foreignKeysQuery = `
            SELECT
              tc.constraint_name,
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name,
              rc.update_rule,
              rc.delete_rule
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
            JOIN information_schema.referential_constraints rc
              ON tc.constraint_name = rc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = $1
          `;
          const foreignKeysResult = await client.query(foreignKeysQuery, [tableName]);

          // Get indexes
          const indexesQuery = `
            SELECT
              i.relname as index_name,
              ix.indisunique as is_unique
            FROM pg_class t
            JOIN pg_index ix ON t.oid = ix.indrelid
            JOIN pg_class i ON i.oid = ix.indexrelid
            JOIN pg_namespace n ON n.oid = t.relnamespace
            WHERE t.relname = $1
              AND n.nspname = 'public'
              AND t.relkind = 'r'
          `;
          const indexesResult = await client.query(indexesQuery, [tableName]);

          schema[tableName] = {
            columns: columnsResult.rows.map(col => ({
              name: col.column_name,
              type: col.data_type,
              notNull: col.is_nullable === 'NO',
              defaultValue: col.column_default,
              primaryKey: col.is_primary_key
            })),
            foreignKeys: foreignKeysResult.rows.map(fk => ({
              name: fk.constraint_name,
              column: fk.column_name,
              foreignTable: fk.foreign_table_name,
              foreignColumn: fk.foreign_column_name,
              onUpdate: fk.update_rule,
              onDelete: fk.delete_rule
            })),
            indexes: indexesResult.rows.map(idx => ({
              name: idx.index_name,
              unique: idx.is_unique
            }))
          };
        }

        logger.info('PostgreSQL schema extraction complete');
        return schema;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('PostgreSQL schema extraction error:', error);
      throw new ApiError(500, `Failed to extract PostgreSQL database schema: ${error.message}`);
    }
  }

  /**
   * Execute a SQL query on PostgreSQL
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
          logger.info(`Using cached results for PostgreSQL query: ${query}`);
          return cachedResults;
        }
      }

      // Execute the query
      logger.info(`Executing PostgreSQL query: ${query}`);
      logger.debug('Query parameters:', params);

      const client = await pool.connect();

      try {
        const startTime = Date.now();
        const result = await client.query(query, params);
        const executionTime = Date.now() - startTime;

        logger.info(`PostgreSQL query executed successfully in ${executionTime}ms, returned ${result.rows.length} rows`);

        // Cache the results if cacheable
        if (isCacheable) {
          queryCacheService.set(query, params, result.rows, connectionId);
        }

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('PostgreSQL query execution error:', error);
      throw new ApiError(500, `Failed to execute PostgreSQL query: ${error.message}`);
    }
  }

  /**
   * Close the PostgreSQL database connection pool
   * @param {Pool} pool - Database connection pool
   * @param {string|Object} connectionInfo - Connection info used to create the pool
   */
  closeConnection(pool, connectionInfo) {
    if (pool) {
      // Release connection back to the pool
      connectionPoolManager.releaseConnection('postgres', pool);
      logger.debug('PostgreSQL database connection released back to pool');
    }
  }

  /**
   * Get the database type
   * @returns {string} - Database type
   */
  getDatabaseType() {
    return 'postgres';
  }
}

module.exports = PostgresService;
