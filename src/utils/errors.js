/**
 * Custom API error class
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @param {boolean} isOperational - Whether the error is operational
   */
  constructor(statusCode, message, details = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
class ValidationError extends ApiError {
  /**
   * Create a new validation error
   * @param {string} message - Error message
   * @param {Object} details - Validation error details
   */
  constructor(message, details = null) {
    super(400, message, details, true);
    this.name = this.constructor.name;
  }
}

/**
 * Database error class
 */
class DatabaseError extends ApiError {
  /**
   * Create a new database error
   * @param {string} message - Error message
   * @param {Object} details - Database error details
   */
  constructor(message, details = null) {
    super(500, message, details, true);
    this.name = this.constructor.name;
  }
}

/**
 * Not found error class
 */
class NotFoundError extends ApiError {
  /**
   * Create a new not found error
   * @param {string} message - Error message
   */
  constructor(message) {
    super(404, message, null, true);
    this.name = this.constructor.name;
  }
}

module.exports = {
  ApiError,
  ValidationError,
  DatabaseError,
  NotFoundError
};
