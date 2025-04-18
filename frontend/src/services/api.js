import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

/**
 * API service for communicating with the backend
 */
class ApiService {
  /**
   * Test a database connection
   * @param {Object} connectionInfo - Database connection information
   * @returns {Promise<Object>} - Response from the server
   */
  async testConnection(connectionInfo) {
    try {
      // For testing connection, we'll use a simple query that should work on any database
      // This query is specifically handled in the backend to avoid table-specific operations
      const response = await axios.post(`${API_URL}/query`, {
        userQuery: 'Show me the first row of any table - CONNECTION TEST',
        connection: connectionInfo
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Process a natural language query
   * @param {string} userQuery - User's natural language query
   * @param {Object} connectionInfo - Database connection information
   * @returns {Promise<Object>} - Response from the server
   */
  async processQuery(userQuery, connectionInfo) {
    try {
      const response = await axios.post(`${API_URL}/query`, {
        userQuery,
        connection: connectionInfo
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get all saved connections
   * @returns {Promise<Object>} - Response from the server
   */
  async getSavedConnections() {
    try {
      const response = await axios.get(`${API_URL}/connections`);

      return {
        success: true,
        data: response.data.data.connections
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Save a database connection
   * @param {Object} connectionInfo - Connection information to save
   * @param {string} name - Name for the saved connection
   * @returns {Promise<Object>} - Response from the server
   */
  async saveConnection(connectionInfo, name) {
    try {
      const response = await axios.post(`${API_URL}/connections`, {
        name,
        type: connectionInfo.type || 'sqlite',
        connection: connectionInfo
      });

      return {
        success: true,
        data: response.data.data.connection
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Delete a saved connection
   * @param {string} id - ID of the connection to delete
   * @returns {Promise<Object>} - Response from the server
   */
  async deleteConnection(id) {
    try {
      const response = await axios.delete(`${API_URL}/connections/${id}`);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get all saved queries
   * @returns {Promise<Object>} - Response from the server
   */
  async getSavedQueries() {
    try {
      const response = await axios.get(`${API_URL}/saved-queries`);

      return {
        success: true,
        data: response.data.data.queries
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Save a query
   * @param {string} query - Query text to save
   * @param {string} name - Name for the saved query
   * @param {string} [connectionId] - ID of the associated connection (optional)
   * @returns {Promise<Object>} - Response from the server
   */
  async saveQuery(query, name, connectionId = null) {
    try {
      const response = await axios.post(`${API_URL}/saved-queries`, {
        name,
        query,
        connection_id: connectionId
      });

      return {
        success: true,
        data: response.data.data.query
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Delete a saved query
   * @param {string} id - ID of the query to delete
   * @returns {Promise<Object>} - Response from the server
   */
  async deleteQuery(id) {
    try {
      const response = await axios.delete(`${API_URL}/saved-queries/${id}`);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export default new ApiService();
