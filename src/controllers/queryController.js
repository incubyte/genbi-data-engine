const databaseService = require('../services/databaseService');
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
    
    try {
      // Validate request body
      const { userQuery, connectionString } = req.body;
      
      if (!userQuery) {
        throw new ApiError(400, 'User query is required');
      }
      
      if (!connectionString) {
        throw new ApiError(400, 'Database connection string is required');
      }
      
      logger.info('Processing natural language query');
      logger.debug('Request body:', { userQuery, connectionString: '***' });
      
      // Connect to the database
      db = await databaseService.connect(connectionString);
      
      // Extract database schema
      const schema = await databaseService.extractSchema(db);
      
      // Generate SQL query using Anthropic
      const sqlQuery = await anthropicService.generateSqlQuery(userQuery, schema);
      
      // Execute the generated SQL query
      const results = await databaseService.executeQuery(db, sqlQuery);
      
      // Return the results and the generated SQL query
      res.status(200).json({
        status: 'success',
        data: {
          results,
          sqlQuery,
        },
      });
    } catch (error) {
      next(error);
    } finally {
      // Close the database connection
      if (db) {
        databaseService.closeConnection(db);
      }
    }
  }
}

module.exports = new QueryController();
