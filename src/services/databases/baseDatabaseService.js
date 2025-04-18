const logger = require('../../utils/logger');
const { ApiError } = require('../../utils/errorHandler');

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
   * @returns {Promise<Array>} - Query results
   */
  async executeQuery(db, query, params = []) {
    throw new ApiError(500, 'Method not implemented');
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
