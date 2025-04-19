const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errorHandler');
const { initUserDatabase } = require('../db/init-user-db');

/**
 * Service for managing user data (saved connections and queries)
 */
class UserDataService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize the user data service
   * @returns {Promise<void>}
   */
  async init() {
    if (!this.initialized) {
      try {
        this.db = await initUserDatabase();
        this.initialized = true;
        logger.info('UserDataService initialized');
      } catch (error) {
        logger.error('Failed to initialize UserDataService:', error);
        throw new ApiError(500, `Failed to initialize user data service: ${error.message}`);
      }
    }
  }

  /**
   * Ensure the service is initialized
   * @returns {Promise<void>}
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  /**
   * Get all saved connections
   * @returns {Promise<Array>} - Array of saved connections
   */
  async getSavedConnections() {
    await this.ensureInitialized();

    try {
      logger.info('Getting all saved connections');

      const connections = await this.db.allAsync(
        'SELECT id, name, type, connection, created_at FROM saved_connections ORDER BY created_at DESC'
      );

      // Parse the connection string for each connection
      return connections.map(conn => {
        try {
          return {
            ...conn,
            connection: JSON.parse(conn.connection)
          };
        } catch (error) {
          // If parsing fails, return the connection as is
          return conn;
        }
      });
    } catch (error) {
      logger.error('Error getting saved connections:', error);
      throw new ApiError(500, `Failed to get saved connections: ${error.message}`);
    }
  }

  /**
   * Get a saved connection by ID
   * @param {string} id - Connection ID
   * @returns {Promise<Object>} - Saved connection
   */
  async getSavedConnectionById(id) {
    await this.ensureInitialized();

    try {
      logger.info(`Getting saved connection with ID: ${id}`);

      const connection = await this.db.getAsync(
        'SELECT id, name, type, connection, created_at FROM saved_connections WHERE id = ?',
        [id]
      );

      if (!connection) {
        throw new ApiError(404, `Connection with ID ${id} not found`);
      }

      // Parse the connection string
      try {
        return {
          ...connection,
          connection: JSON.parse(connection.connection)
        };
      } catch (error) {
        // If parsing fails, return the connection as is
        return connection;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error getting saved connection with ID ${id}:`, error);
      throw new ApiError(500, `Failed to get saved connection: ${error.message}`);
    }
  }

  /**
   * Save a new connection
   * @param {Object} connectionData - Connection data to save
   * @param {string} connectionData.name - Connection name
   * @param {string} connectionData.type - Connection type (sqlite, postgres, mysql)
   * @param {Object} connectionData.connection - Connection details
   * @returns {Promise<Object>} - Saved connection
   */
  async saveConnection(connectionData) {
    await this.ensureInitialized();

    try {
      const { name, type, connection } = connectionData;

      if (!name || !type || !connection) {
        throw new ApiError(400, 'Name, type, and connection are required');
      }

      logger.info(`Saving new connection: ${name}`);

      const id = uuidv4();
      const now = new Date().toISOString();

      // Stringify the connection object for storage
      const connectionStr = JSON.stringify(connection);

      await this.db.runAsync(
        'INSERT INTO saved_connections (id, name, type, connection, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, name, type, connectionStr, now]
      );

      return {
        id,
        name,
        type,
        connection,
        created_at: now
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error saving connection:', error);
      throw new ApiError(500, `Failed to save connection: ${error.message}`);
    }
  }

  /**
   * Delete a saved connection
   * @param {string} id - Connection ID
   * @returns {Promise<void>}
   */
  async deleteConnection(id) {
    await this.ensureInitialized();

    try {
      logger.info(`Deleting connection with ID: ${id}`);

      // Check if connection exists
      const connection = await this.db.getAsync(
        'SELECT id FROM saved_connections WHERE id = ?',
        [id]
      );

      if (!connection) {
        throw new ApiError(404, `Connection with ID ${id} not found`);
      }

      // Delete the connection
      await this.db.runAsync(
        'DELETE FROM saved_connections WHERE id = ?',
        [id]
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error deleting connection with ID ${id}:`, error);
      throw new ApiError(500, `Failed to delete connection: ${error.message}`);
    }
  }

  /**
   * Get all saved queries
   * @returns {Promise<Array>} - Array of saved queries
   */
  async getSavedQueries() {
    await this.ensureInitialized();

    try {
      logger.info('Getting all saved queries');

      const queries = await this.db.allAsync(`
        SELECT q.id, q.name, q.query, q.connection_id, q.created_at,
               q.sql_query, q.results, q.chart_type, q.visualization_config, q.description,
               c.name as connection_name, c.type as connection_type
        FROM saved_queries q
        LEFT JOIN saved_connections c ON q.connection_id = c.id
        ORDER BY q.created_at DESC
      `);

      // Parse JSON fields if they exist
      return queries.map(query => {
        const parsedQuery = { ...query };

        // Parse results if it exists
        if (parsedQuery.results) {
          try {
            parsedQuery.results = JSON.parse(parsedQuery.results);
          } catch (parseError) {
            logger.warn(`Failed to parse results JSON for query ${parsedQuery.id}:`, parseError);
          }
        }

        // Parse visualization_config if it exists
        if (parsedQuery.visualization_config) {
          try {
            parsedQuery.visualization_config = JSON.parse(parsedQuery.visualization_config);
          } catch (parseError) {
            logger.warn(`Failed to parse visualization_config JSON for query ${parsedQuery.id}:`, parseError);
          }
        }

        return parsedQuery;
      });
    } catch (error) {
      logger.error('Error getting saved queries:', error);
      throw new ApiError(500, `Failed to get saved queries: ${error.message}`);
    }
  }

  /**
   * Get a saved query by ID
   * @param {string} id - Query ID
   * @returns {Promise<Object>} - Saved query
   */
  async getSavedQueryById(id) {
    await this.ensureInitialized();

    try {
      logger.info(`Getting saved query with ID: ${id}`);

      const query = await this.db.getAsync(`
        SELECT q.id, q.name, q.query, q.connection_id, q.created_at,
               q.sql_query, q.results, q.chart_type, q.visualization_config, q.description,
               c.name as connection_name, c.type as connection_type
        FROM saved_queries q
        LEFT JOIN saved_connections c ON q.connection_id = c.id
        WHERE q.id = ?
      `, [id]);

      if (!query) {
        throw new ApiError(404, `Query with ID ${id} not found`);
      }

      // Parse JSON fields if they exist
      if (query.results) {
        try {
          query.results = JSON.parse(query.results);
        } catch (parseError) {
          logger.warn(`Failed to parse results JSON for query ${id}:`, parseError);
        }
      }

      if (query.visualization_config) {
        try {
          query.visualization_config = JSON.parse(query.visualization_config);
        } catch (parseError) {
          logger.warn(`Failed to parse visualization_config JSON for query ${id}:`, parseError);
        }
      }

      return query;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error getting saved query with ID ${id}:`, error);
      throw new ApiError(500, `Failed to get saved query: ${error.message}`);
    }
  }

  /**
   * Save a new query
   * @param {Object} queryData - Query data to save
   * @param {string} queryData.name - Query name
   * @param {string} queryData.query - Query text
   * @param {string} [queryData.connection_id] - Associated connection ID (optional)
   * @param {string} [queryData.sql_query] - Generated SQL query
   * @param {Object} [queryData.results] - Query results
   * @param {string} [queryData.chart_type] - Chart type (bar, line, pie)
   * @param {Object} [queryData.visualization_config] - Visualization configuration
   * @param {string} [queryData.description] - Visualization description
   * @returns {Promise<Object>} - Saved query
   */
  async saveQuery(queryData) {
    await this.ensureInitialized();

    try {
      const {
        name,
        query,
        connection_id,
        sql_query,
        results,
        chart_type,
        visualization_config,
        description
      } = queryData;

      if (!name || !query) {
        throw new ApiError(400, 'Name and query are required');
      }

      logger.info(`Saving new query/visualization: ${name}`);

      // If connection_id is provided, check if it exists
      if (connection_id) {
        const connection = await this.db.getAsync(
          'SELECT id FROM saved_connections WHERE id = ?',
          [connection_id]
        );

        if (!connection) {
          throw new ApiError(404, `Connection with ID ${connection_id} not found`);
        }
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      // Stringify JSON fields
      const resultsStr = results ? JSON.stringify(results) : null;
      const visualizationConfigStr = visualization_config ? JSON.stringify(visualization_config) : null;

      await this.db.runAsync(
        `INSERT INTO saved_queries (
          id, name, query, connection_id, sql_query, results,
          chart_type, visualization_config, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, name, query, connection_id || null, sql_query || null,
          resultsStr, chart_type || null, visualizationConfigStr, description || null, now
        ]
      );

      // Get the saved query with connection details
      return this.getSavedQueryById(id);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error saving query:', error);
      throw new ApiError(500, `Failed to save query: ${error.message}`);
    }
  }

  /**
   * Delete a saved query
   * @param {string} id - Query ID
   * @returns {Promise<void>}
   */
  async deleteQuery(id) {
    await this.ensureInitialized();

    try {
      logger.info(`Deleting query with ID: ${id}`);

      // Check if query exists
      const query = await this.db.getAsync(
        'SELECT id FROM saved_queries WHERE id = ?',
        [id]
      );

      if (!query) {
        throw new ApiError(404, `Query with ID ${id} not found`);
      }

      // Delete the query
      await this.db.runAsync(
        'DELETE FROM saved_queries WHERE id = ?',
        [id]
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`Error deleting query with ID ${id}:`, error);
      throw new ApiError(500, `Failed to delete query: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new UserDataService();
