const userDataService = require('../services/userDataService');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errorHandler');

/**
 * Controller for managing saved database connections
 */
class ConnectionController {
  /**
   * Get all saved connections
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllConnections(req, res, next) {
    try {
      logger.info('Getting all saved connections');
      
      const connections = await userDataService.getSavedConnections();
      
      res.status(200).json({
        status: 'success',
        data: {
          connections
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a saved connection by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getConnectionById(req, res, next) {
    try {
      const { id } = req.params;
      
      logger.info(`Getting connection with ID: ${id}`);
      
      const connection = await userDataService.getSavedConnectionById(id);
      
      res.status(200).json({
        status: 'success',
        data: {
          connection
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save a new connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async saveConnection(req, res, next) {
    try {
      const { name, type, connection } = req.body;
      
      if (!name || !type || !connection) {
        throw new ApiError(400, 'Name, type, and connection are required');
      }
      
      logger.info(`Saving new connection: ${name}`);
      
      const savedConnection = await userDataService.saveConnection({
        name,
        type,
        connection
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          connection: savedConnection
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a saved connection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteConnection(req, res, next) {
    try {
      const { id } = req.params;
      
      logger.info(`Deleting connection with ID: ${id}`);
      
      await userDataService.deleteConnection(id);
      
      res.status(200).json({
        status: 'success',
        message: `Connection with ID ${id} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConnectionController();
