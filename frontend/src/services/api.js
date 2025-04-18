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
      const response = await axios.post(`${API_URL}/query`, {
        userQuery: 'Show me the first row of any table',
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
}

export default new ApiService();
