const IAnthropicClient = require('./iAnthropicClient');
const logger = require('../../../utils/logger');

/**
 * Mock implementation of the Anthropic API client
 * This class simulates API calls for testing and development
 */
class MockAnthropicClient extends IAnthropicClient {
  /**
   * Create a new MockAnthropicClient
   * @param {Object} config - Configuration object
   * @param {string} config.model - Anthropic model to simulate
   */
  constructor(config = {}) {
    super();
    this.model = config.model || 'claude-3-opus-20240229';
    logger.info(`MockAnthropicClient initialized with model: ${this.model}`);
  }

  /**
   * Generate a mock response
   * @param {Object} options - Options for the mock API call
   * @param {string} options.systemPrompt - System prompt
   * @param {Array<Object>} options.messages - Messages
   * @returns {Promise<Object>} - Mock API response
   */
  async generateResponse({ systemPrompt, messages }) {
    logger.info('Generating mock response');
    logger.debug('Mock request:', {
      model: this.model,
      systemPrompt: systemPrompt.substring(0, 100) + '...',
      messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 50) + '...' }))
    });

    // Extract the user query from the messages
    const userQuery = messages.find(m => m.role === 'user')?.content || '';

    // Generate a mock response based on the user query
    const mockResponse = this.generateMockResponse(userQuery);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return a response object that mimics the Anthropic API response structure
    return {
      id: `mock-${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model: this.model,
      content: [
        {
          type: 'text',
          text: mockResponse
        }
      ],
      usage: {
        input_tokens: 100,
        output_tokens: 50
      }
    };
  }

  /**
   * Generate a mock response based on the user query
   * @param {string} userQuery - User query
   * @returns {string} - Mock response in JSON format with SQL and visualization recommendations
   */
  generateMockResponse(userQuery) {
    const userQueryLower = userQuery.toLowerCase();
    let sqlQuery, visualization;

    // Simple pattern matching to generate mock responses
    if (userQueryLower.includes('hello') || userQueryLower.includes('hi')) {
      return 'Hello! How can I help you today?';
    } else if (userQueryLower.includes('help')) {
      return 'I can help you with generating SQL queries from natural language. Just describe what data you want to retrieve.';
    } else if (userQueryLower.includes('users') && userQueryLower.includes('older than')) {
      sqlQuery = 'SELECT * FROM users WHERE age > 30;';
      visualization = {
        recommendedChartTypes: ['bar', 'table'],
        xAxis: 'name',
        yAxis: 'age',
        reasoning: 'Bar chart is recommended to compare ages across different users.'
      };
    } else if (userQueryLower.includes('products') && userQueryLower.includes('electronics')) {
      sqlQuery = "SELECT * FROM products WHERE category = 'Electronics';";
      visualization = {
        recommendedChartTypes: ['table'],
        reasoning: 'Table view is recommended for displaying detailed product information.'
      };
    } else if (userQueryLower.includes('total sales') && userQueryLower.includes('user')) {
      sqlQuery = 'SELECT users.name, SUM(orders.total_amount) as total_sales FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id;';
      visualization = {
        recommendedChartTypes: ['bar', 'pie'],
        xAxis: 'name',
        yAxis: 'total_sales',
        reasoning: 'Bar chart is recommended to compare sales across different users. Pie chart can show the proportion of sales by user.'
      };
    } else if (userQueryLower.includes('orders') && userQueryLower.includes('greater than')) {
      sqlQuery = 'SELECT * FROM orders WHERE total_amount > 1000;';
      visualization = {
        recommendedChartTypes: ['table'],
        reasoning: 'Table view is recommended for displaying detailed order information.'
      };
    } else if (userQueryLower.includes('products') && userQueryLower.includes('never been ordered')) {
      sqlQuery = 'SELECT products.* FROM products LEFT JOIN order_items ON products.id = order_items.product_id WHERE order_items.id IS NULL;';
      visualization = {
        recommendedChartTypes: ['table'],
        reasoning: 'Table view is recommended for displaying detailed product information.'
      };
    } else if (userQueryLower.includes('first row') && userQueryLower.includes('any table')) {
      return 'SELECT 1 AS connection_test;';
    } else if (userQueryLower.includes('monthly') || userQueryLower.includes('yearly') || userQueryLower.includes('daily')) {
      sqlQuery = 'SELECT date, SUM(amount) as total FROM sales GROUP BY date ORDER BY date;';
      visualization = {
        recommendedChartTypes: ['line', 'bar'],
        xAxis: 'date',
        yAxis: 'total',
        reasoning: 'Line chart is recommended for time series data to show trends over time.'
      };
    } else if (userQueryLower.includes('category') || userQueryLower.includes('group')) {
      sqlQuery = 'SELECT category, COUNT(*) as count FROM products GROUP BY category;';
      visualization = {
        recommendedChartTypes: ['bar', 'pie'],
        xAxis: 'category',
        yAxis: 'count',
        reasoning: 'Bar chart is recommended for comparing counts across categories. Pie chart can show the proportion of each category.'
      };
    } else {
      sqlQuery = 'SELECT * FROM table LIMIT 10;';
      visualization = {
        recommendedChartTypes: ['table'],
        reasoning: 'Table view is recommended for displaying general query results.'
      };
    }

    // For regular queries, return a JSON response with SQL and visualization
    if (sqlQuery) {
      return `{
  "sql": "${sqlQuery}",
  "visualization": ${JSON.stringify(visualization, null, 2)}
}`;
    }

    // For other queries, return just the text
    return sqlQuery || 'SELECT * FROM table LIMIT 10;';
  }

  /**
   * Check if the client is in mock mode
   * @returns {boolean} - Always true for mock client
   */
  isMockMode() {
    return true;
  }

  /**
   * Get the model being used
   * @returns {string} - Model name
   */
  getModel() {
    return this.model;
  }
}

module.exports = MockAnthropicClient;
