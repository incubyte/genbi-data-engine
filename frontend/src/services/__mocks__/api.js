/**
 * Mock API service for testing
 */
class ApiService {
  /**
   * Test a database connection
   */
  async testConnection() {
    return {
      success: true,
      data: {
        results: [],
        sqlQuery: 'SELECT 1',
        databaseType: 'sqlite'
      }
    };
  }

  /**
   * Process a natural language query
   */
  async processQuery() {
    return {
      success: true,
      data: {
        results: [
          { name: 'Test 1', value: 100 },
          { name: 'Test 2', value: 200 }
        ],
        sqlQuery: 'SELECT * FROM test_table',
        databaseType: 'sqlite',
        visualization: {
          recommendedChartTypes: ['bar'],
          xAxis: 'name',
          yAxis: 'value'
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
        {
          id: '1',
          name: 'Test Connection',
          type: 'sqlite',
          connection: 'test.db'
        }
      ]
    };
  }

  /**
   * Save a database connection
   */
  async saveConnection() {
    return {
      success: true,
      data: {
        id: '1',
        name: 'Test Connection',
        type: 'sqlite',
        connection: 'test.db'
      }
    };
  }

  /**
   * Delete a saved connection
   */
  async deleteConnection() {
    return {
      success: true,
      message: 'Connection deleted successfully'
    };
  }

  /**
   * Get all saved queries
   */
  async getSavedQueries() {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Test Query',
          query: 'Show me test data',
          sql_query: 'SELECT * FROM test_table',
          chart_type: 'bar',
          visualization_config: JSON.stringify({
            xAxis: 'name',
            yAxis: 'value'
          }),
          results: JSON.stringify([
            { name: 'A', value: 10 },
            { name: 'B', value: 20 }
          ]),
          createdAt: '2023-06-01T12:00:00.000Z',
          lastRefreshed: '2023-06-01T12:00:00.000Z'
        }
      ]
    };
  }

  /**
   * Save a query
   */
  async saveQuery() {
    return {
      success: true,
      data: {
        id: '1',
        name: 'Test Query',
        query: 'Show me test data'
      }
    };
  }

  /**
   * Save a visualization with query results
   */
  async saveVisualization() {
    return {
      success: true,
      data: {
        id: '1',
        name: 'Test Visualization',
        query: 'Show me test data',
        sql_query: 'SELECT * FROM test_table',
        chart_type: 'bar',
        visualization_config: JSON.stringify({
          xAxis: 'name',
          yAxis: 'value'
        }),
        results: JSON.stringify([
          { name: 'A', value: 10 },
          { name: 'B', value: 20 }
        ])
      }
    };
  }

  /**
   * Delete a saved query
   */
  async deleteQuery() {
    return {
      success: true,
      message: 'Query deleted successfully'
    };
  }

  /**
   * Refresh a saved query by re-executing it
   */
  async refreshQuery() {
    return {
      success: true,
      data: {
        query: {
          id: '1',
          name: 'Test Visualization',
          query: 'Show me test data',
          sql_query: 'SELECT * FROM test_table',
          chart_type: 'bar',
          visualization_config: JSON.stringify({
            xAxis: 'name',
            yAxis: 'value'
          }),
          results: JSON.stringify([
            { name: 'A', value: 15 },
            { name: 'B', value: 25 }
          ]),
          last_refreshed: '2023-06-03T12:00:00.000Z'
        },
        results: [
          { name: 'A', value: 15 },
          { name: 'B', value: 25 }
        ]
      }
    };
  }
}

export default new ApiService();
