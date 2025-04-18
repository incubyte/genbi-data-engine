const logger = require('../../utils/logger');
const { ApiError } = require('../../utils/errorHandler');
const queryCacheService = require('../queryCacheService');

/**
 * Base database service interface
 */
class BaseDatabaseService {
  /**
   * Connect to a database
   * @param {string|Object} connectionInfo - Database connection information
   * @returns {Promise<Object>} - Database connection
   */
  async connect(connectionInfo) {
    throw new ApiError(500, 'Method not implemented');
  }

  /**
   * Extract database schema information
   * @param {Object} db - Database connection
   * @returns {Promise<Object>} - Database schema information
   */
  async extractSchema(db) {
    throw new ApiError(500, 'Method not implemented');
  }

  /**
   * Execute a SQL query
   * @param {Object} db - Database connection
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @param {Object} options - Query options
   * @param {boolean} options.useCache - Whether to use the query cache
   * @param {string} options.connectionId - Connection ID for cache key
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(db, query, params = [], options = {}) {
    throw new ApiError(500, 'Method not implemented');
  }

  /**
   * Check if a query is cacheable
   * @param {string} query - SQL query
   * @returns {boolean} - Whether the query is cacheable
   */
  isCacheableQuery(query) {
    // Only cache SELECT queries
    const isSelect = query.trim().toUpperCase().startsWith('SELECT');

    // Don't cache queries with functions that might return different results each time
    const hasNonCacheableFunctions = [
      'RANDOM(', 'RAND(', 'NOW(', 'CURRENT_TIMESTAMP', 'CURRENT_DATE', 'CURRENT_TIME',
      'SYSDATE', 'GETDATE', 'NEWID', 'UUID', 'LAST_INSERT_ID'
    ].some(func => query.toUpperCase().includes(func));

    return isSelect && !hasNonCacheableFunctions;
  }

  /**
   * Close the database connection
   * @param {Object} db - Database connection
   */
  closeConnection(db) {
    throw new ApiError(500, 'Method not implemented');
  }

  /**
   * Get the database type
   * @returns {string} - Database type
   */
  getDatabaseType() {
    throw new ApiError(500, 'Method not implemented');
  }
}

module.exports = BaseDatabaseService;
