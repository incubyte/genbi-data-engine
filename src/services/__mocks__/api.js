/**
 * Mock API service for testing
 */
class MockApiService {
  /**
   * Test a database connection
   */
  async testConnection() {
    return {
      success: true,
      data: { message: 'Connection successful' }
    };
  }

  /**
   * Process a natural language query
   */
  async processQuery() {
    return {
      success: true,
      data: {
        sql: 'SELECT * FROM test',
        results: [
          { id: 1, name: 'Test 1' },
          { id: 2, name: 'Test 2' }
        ],
        visualization: {
          type: 'bar',
          config: {
            xAxis: 'name',
            yAxis: 'id'
          }
        }
      }
    };
  }

  /**
   * Get all saved connections
   */
  async getSavedConnections() {
    return {
      success: true,
      data: [
        { id: '1', name: 'Test Connection 1', type: 'sqlite' },
        { id: '2', name: 'Test Connection 2', type: 'mysql' }
      ]
    };
  }

  /**
   * Save a database connection
   */
  async saveConnection() {
    return {
      success: true,
      data: { id: '3', name: 'New Connection', type: 'sqlite' }
    };
  }

  /**
   * Delete a saved connection
   */
  async deleteConnection() {
    return {
      success: true,
      message: 'Connection deleted'
    };
  }

  /**
   * Get all saved queries
   */
  async getSavedQueries() {
    return {
      success: true,
      data: [
        { id: '1', name: 'Test Query 1', query: 'Show me all users' },
        { id: '2', name: 'Test Query 2', query: 'Show me all products' }
      ]
    };
  }

  /**
   * Save a query
   */
  async saveQuery() {
    return {
      success: true,
      data: { id: '3', name: 'New Query', query: 'Show me all orders' }
    };
  }

  /**
   * Save a visualization with query results
   */
  async saveVisualization() {
    return {
      success: true,
      data: {
        id: '4',
        name: 'New Visualization',
        query: 'Show me sales by month',
        chart_type: 'bar',
        visualization_config: {
          xAxis: 'month',
          yAxis: 'sales'
        }
      }
    };
  }

  /**
   * Delete a saved query
   */
  async deleteQuery() {
    return {
      success: true,
      message: 'Query deleted'
    };
  }
}

export default new MockApiService();
