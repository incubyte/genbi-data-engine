const logger = require('./logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends ApiError {
  constructor(message, details) {
    super(400, message, true, '', details);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for database errors
 */
class DatabaseError extends ApiError {
  constructor(message, details = null) {
    super(500, message, true, '', details);
    this.name = 'DatabaseError';
  }
}

/**
 * Custom error class for not found errors
 */
class NotFoundError extends ApiError {
  constructor(message) {
    super(404, message, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Error handler middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  // Determine error type and log appropriately
  const errorType = err.name || 'Error';
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // Create structured log entry
  const logEntry = {
    errorType,
    message: err.message,
    statusCode,
    isOperational,
    stack: err.stack,
    request: {
      path: req.path,
      method: req.method,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  };

  // Add details if available
  if (err.details) {
    logEntry.details = err.details;
  }

  // Log with appropriate level based on status code and operational status
  if (statusCode >= 500) {
    logger.error(logEntry);
  } else if (statusCode >= 400) {
    logger.warn(logEntry);
  } else {
    logger.info(logEntry);
  }

  // Default error message for non-operational errors in production
  const message = isOperational || process.env.NODE_ENV === 'development'
    ? err.message
    : 'Internal Server Error';

  // Prepare response
  const errorResponse = {
    status: 'error',
    statusCode,
    message
  };

  // Add details for validation errors
  if (err instanceof ValidationError) {
    errorResponse.details = err.details;
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
const setupErrorHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION:', error);
    // Give the logger time to log the error before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (error) => {
    logger.error('UNHANDLED REJECTION:', error);
    // Give the logger time to log the error before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

/**
 * Create a validation error
 * @param {string} message - Error message
 * @param {Object} details - Validation error details
 * @returns {ValidationError} - Validation error
 */
const createValidationError = (message, details) => {
  return new ValidationError(message, details);
};

/**
 * Create a not found error
 * @param {string} resource - Resource that was not found
 * @param {string} id - ID of the resource
 * @returns {NotFoundError} - Not found error
 */
const createNotFoundError = (resource, id) => {
  return new NotFoundError(`${resource} with ID ${id} not found`);
};

/**
 * Create a database error
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @returns {DatabaseError} - Database error
 */
const createDatabaseError = (message, details = null) => {
  return new DatabaseError(message, details);
};

module.exports = {
  ApiError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  errorHandler,
  setupErrorHandlers,
  createValidationError,
  createNotFoundError,
  createDatabaseError
};
