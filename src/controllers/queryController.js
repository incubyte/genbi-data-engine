const databaseFactory = require('../services/databaseFactory');
const anthropicService = require('../services/anthropicService');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errorHandler');

/**
 * Controller for handling natural language to SQL query conversion
 */
class QueryController {
  /**
   * Process a natural language query and convert it to SQL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async processQuery(req, res, next) {
    let db = null;
    let dbService = null;

    try {
      // Validate request body
      const { userQuery, connection } = req.body;

      if (!userQuery) {
        throw new ApiError(400, 'User query is required');
      }

      if (!connection) {
        throw new ApiError(400, 'Database connection information is required');
      }

      logger.info('Processing natural language query');
      logger.debug('Request body:', { userQuery, connection: '***' });

      // Parse connection info and create appropriate database service
      const connectionInfo = databaseFactory.parseConnectionInfo(connection);
      dbService = databaseFactory.createDatabaseService(connectionInfo);

      // Connect to the database
      db = await dbService.connect(connectionInfo.connection);

      // Extract database schema
      const schema = await dbService.extractSchema(db);

      // Get database type
      const dbType = dbService.getDatabaseType();

      // Generate SQL query using Anthropic
      const sqlQuery = await anthropicService.generateSqlQuery(userQuery, schema, dbType);

      // Execute the generated SQL query
      const results = await dbService.executeQuery(db, sqlQuery);

      // Return the results and the generated SQL query
      res.status(200).json({
        status: 'success',
        data: {
          results,
          sqlQuery,
          databaseType: dbType
        },
      });
    } catch (error) {
      next(error);
    } finally {
      // Close the database connection
      if (db && dbService) {
        dbService.closeConnection(db);
      }
    }
  }
}

module.exports = new QueryController();
