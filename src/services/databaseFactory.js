const logger = require('../utils/logger');
const { ApiError } = require('../utils/errorHandler');
const SQLiteService = require('./databases/sqliteService');
const PostgresService = require('./databases/postgresService');

/**
 * Database factory service to create appropriate database service based on connection type
 */
class DatabaseFactory {
  /**
   * Create a database service based on the connection info
   * @param {Object} connectionInfo - Database connection information
   * @param {string} connectionInfo.type - Database type ('sqlite' or 'postgres')
   * @param {string|Object} connectionInfo.connection - Connection string or object
   * @returns {Object} - Database service instance
   */
  createDatabaseService(connectionInfo) {
    try {
      logger.info(`Creating database service for type: ${connectionInfo.type}`);
      
      switch (connectionInfo.type.toLowerCase()) {
        case 'sqlite':
          return new SQLiteService();
        case 'postgres':
        case 'postgresql':
          return new PostgresService();
        default:
          throw new ApiError(400, `Unsupported database type: ${connectionInfo.type}`);
      }
    } catch (error) {
      logger.error('Error creating database service:', error);
      throw new ApiError(500, `Failed to create database service: ${error.message}`);
    }
  }
  
  /**
   * Parse connection string or object to determine database type
   * @param {string|Object} connection - Connection string or object
   * @returns {Object} - Connection info with type and connection details
   */
  parseConnectionInfo(connection) {
    try {
      // If connection is already an object with type specified
      if (typeof connection === 'object' && connection.type) {
        return connection;
      }
      
      // If connection is a string
      if (typeof connection === 'string') {
        // Check if it's a PostgreSQL connection string
        if (connection.startsWith('postgres://') || 
            connection.startsWith('postgresql://')) {
          return {
            type: 'postgres',
            connection
          };
        }
        
        // Otherwise assume it's a SQLite file path
        return {
          type: 'sqlite',
          connection
        };
      }
      
      throw new ApiError(400, 'Invalid connection information provided');
    } catch (error) {
      logger.error('Error parsing connection info:', error);
      throw new ApiError(400, `Failed to parse connection information: ${error.message}`);
    }
  }
}

module.exports = new DatabaseFactory();
