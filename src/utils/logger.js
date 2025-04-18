const winston = require('winston');
const path = require('path');
const config = require('../config/config');

/**
 * Logger service for the application
 */

// Get logging configuration
const loggingConfig = config.getLoggingConfig();
const logDir = loggingConfig.directory;
const logLevel = loggingConfig.level;

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'genbi-data-engine' },
  transports: [
    // Write logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    }),
  ],
});

// If we're not in production, also log to the console
if (!config.isProduction()) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Log directory is created by the config service

module.exports = logger;
