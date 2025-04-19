/**
 * Database operation logger
 * This module provides logging for database operations
 */

const logger = require('./logger');

/**
 * Log database operations
 * @param {string} operation - The database operation being performed
 * @param {string} details - Additional details about the operation
 * @param {Object} [metadata] - Optional metadata about the operation
 */
function logDbOperation(operation, details, metadata = {}) {
  logger.debug(`DB Operation: ${operation} - ${details}`, metadata);
}

/**
 * Log database errors
 * @param {string} operation - The database operation that failed
 * @param {Error} error - The error that occurred
 * @param {Object} [metadata] - Optional metadata about the operation
 */
function logDbError(operation, error, metadata = {}) {
  logger.error(`DB Error: ${operation} - ${error.message}`, {
    ...metadata,
    stack: error.stack
  });
}

/**
 * Create a database logger for a specific context
 * @param {string} context - The context for the logger (e.g., 'UserDataService')
 * @returns {Object} - Database logger object
 */
function createDbLogger(context) {
  return {
    /**
     * Log a database operation
     * @param {string} operation - The database operation being performed
     * @param {string} details - Additional details about the operation
     * @param {Object} [metadata] - Optional metadata about the operation
     */
    logOperation: (operation, details, metadata = {}) => {
      logDbOperation(operation, details, { context, ...metadata });
    },

    /**
     * Log a database error
     * @param {string} operation - The database operation that failed
     * @param {Error} error - The error that occurred
     * @param {Object} [metadata] - Optional metadata about the operation
     */
    logError: (operation, error, metadata = {}) => {
      logDbError(operation, error, { context, ...metadata });
    }
  };
}

module.exports = {
  logDbOperation,
  logDbError,
  createDbLogger
};
