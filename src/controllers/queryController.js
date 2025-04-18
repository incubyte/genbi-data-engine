const databaseFactory = require('../services/databaseFactory');
const anthropicService = require('../services/anthropicService');
const userDataService = require('../services/userDataService');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errorHandler');
const { validateUserQuery } = require('../utils/validationService');

/**
 * Controller for handling natural language to SQL query conversion and saved queries
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
    let connectionInfo = null;

    try {
      // Validate request body
      const { userQuery, connection } = req.body;

      // Validate user query
      const queryValidation = validateUserQuery(userQuery);
      if (!queryValidation.isValid) {
        throw new ApiError(400, 'Invalid user query', true, '', queryValidation.errors);
      }

      if (!connection) {
        throw new ApiError(400, 'Database connection information is required');
      }

      logger.info('Processing natural language query');
      logger.debug('Request body:', { userQuery, connection: '***' });

      // Parse connection info and create appropriate database service
      const connectionInfo = databaseFactory.parseConnectionInfo(connection);
      dbService = databaseFactory.createDatabaseService(connectionInfo);

      // Generate a simple connection ID for caching
      const connectionId = `${connectionInfo.type}-${Date.now()}`;

      // Connect to the database
      db = await dbService.connect(connectionInfo.connection);

      // Extract database schema
      const schema = await dbService.extractSchema(db);

      // Get database type
      const dbType = dbService.getDatabaseType();

      // Check if this is a connection test query
      const isConnectionTest = userQuery.toLowerCase().includes('connection test');

      let sqlQuery, results, visualization = null;

      if (isConnectionTest) {
        // For connection tests, use a simple query that works on any database
        sqlQuery = 'SELECT 1 AS connection_test';
        results = await dbService.executeQuery(db, sqlQuery, [], { useCache: false });
      } else {
        // Generate SQL query and visualization recommendations using Anthropic for regular queries
        const generatedResponse = await anthropicService.generateSqlQuery(userQuery, schema, dbType, {
          optimizeSchema: true, 
          maxTables: 20
        });
        sqlQuery = generatedResponse.sqlQuery;
        visualization = generatedResponse.visualization;

        // Execute the generated SQL query with caching
        results = await dbService.executeQuery(db, sqlQuery, [], {
          useCache: true,
          connectionId
        });
      }

      // Return the results, SQL query, and visualization recommendations
      res.status(200).json({
        status: 'success',
        data: {
          results,
          sqlQuery,
          databaseType: dbType,
          visualization
        },
      });
    } catch (error) {
      next(error);
    } finally {
      // Close the database connection
      if (db && dbService) {
        dbService.closeConnection(db, connectionInfo?.connection);
      }
    }
  }

  /**
   * Get all saved queries
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllQueries(req, res, next) {
    try {
      logger.info('Getting all saved queries');

      const queries = await userDataService.getSavedQueries();

      res.status(200).json({
        status: 'success',
        data: {
          queries
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a saved query by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getQueryById(req, res, next) {
    try {
      const { id } = req.params;

      logger.info(`Getting query with ID: ${id}`);

      const query = await userDataService.getSavedQueryById(id);

      res.status(200).json({
        status: 'success',
        data: {
          query
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save a new query
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async saveQuery(req, res, next) {
    try {
      const { name, query, connection_id } = req.body;

      if (!name || !query) {
        throw new ApiError(400, 'Name and query are required');
      }

      logger.info(`Saving new query: ${name}`);

      const savedQuery = await userDataService.saveQuery({
        name,
        query,
        connection_id
      });

      res.status(201).json({
        status: 'success',
        data: {
          query: savedQuery
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a saved query
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteQuery(req, res, next) {
    try {
      const { id } = req.params;

      logger.info(`Deleting query with ID: ${id}`);

      await userDataService.deleteQuery(id);

      res.status(200).json({
        status: 'success',
        message: `Query with ID ${id} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QueryController();
