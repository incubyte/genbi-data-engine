const logger = require('./logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error handler middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
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

module.exports = {
  ApiError,
  errorHandler,
  setupErrorHandlers,
};
