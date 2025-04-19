const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration service for the application
 */
class ConfigService {
  constructor() {
    this.config = {
      // Server configuration
      server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
      },

      // Database configuration
      database: {
        userDataPath: process.env.USER_DATA_DB_PATH || path.join(process.cwd(), 'data', 'user-data.db')
      },

      // API configuration
      api: {
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY || 'your_anthropic_api_key_here',
          model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
          // Retry configuration
          retry: {
            maxAttempts: parseInt(process.env.ANTHROPIC_RETRY_MAX_ATTEMPTS || '3'),
            initialDelay: parseInt(process.env.ANTHROPIC_RETRY_INITIAL_DELAY || '1000'),
            maxDelay: parseInt(process.env.ANTHROPIC_RETRY_MAX_DELAY || '10000'),
            backoffMultiplier: parseFloat(process.env.ANTHROPIC_RETRY_BACKOFF_MULTIPLIER || '2')
          }
        }
      },

      // Logging configuration
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        directory: process.env.LOG_DIR || path.join(process.cwd(), 'logs')
      }
    };

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.config.logging.directory)) {
      fs.mkdirSync(this.config.logging.directory, { recursive: true });
    }

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(this.config.database.userDataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  /**
   * Get the entire configuration
   * @returns {Object} - Configuration object
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get server configuration
   * @returns {Object} - Server configuration
   */
  getServerConfig() {
    return this.config.server;
  }

  /**
   * Get database configuration
   * @returns {Object} - Database configuration
   */
  getDatabaseConfig() {
    return this.config.database;
  }

  /**
   * Get API configuration
   * @returns {Object} - API configuration
   */
  getApiConfig() {
    return this.config.api;
  }

  /**
   * Get logging configuration
   * @returns {Object} - Logging configuration
   */
  getLoggingConfig() {
    return this.config.logging;
  }

  /**
   * Check if the application is running in development mode
   * @returns {boolean} - True if in development mode
   */
  isDevelopment() {
    return this.config.server.env === 'development';
  }

  /**
   * Check if the application is running in production mode
   * @returns {boolean} - True if in production mode
   */
  isProduction() {
    return this.config.server.env === 'production';
  }

  /**
   * Check if the application is running in test mode
   * @returns {boolean} - True if in test mode
   */
  isTest() {
    return this.config.server.env === 'test';
  }
}

// Export a singleton instance
module.exports = new ConfigService();
