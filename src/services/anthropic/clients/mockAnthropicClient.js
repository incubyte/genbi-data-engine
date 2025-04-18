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
   * @returns {string} - Mock response
   */
  generateMockResponse(userQuery) {
    const userQueryLower = userQuery.toLowerCase();
    
    // Simple pattern matching to generate mock responses
    if (userQueryLower.includes('hello') || userQueryLower.includes('hi')) {
      return 'Hello! How can I help you today?';
    } else if (userQueryLower.includes('help')) {
      return 'I can help you with generating SQL queries from natural language. Just describe what data you want to retrieve.';
    } else if (userQueryLower.includes('users') && userQueryLower.includes('older than')) {
      return 'SELECT * FROM users WHERE age > 30;';
    } else if (userQueryLower.includes('products') && userQueryLower.includes('electronics')) {
      return "SELECT * FROM products WHERE category = 'Electronics';";
    } else if (userQueryLower.includes('total sales') && userQueryLower.includes('user')) {
      return 'SELECT users.name, SUM(orders.total_amount) as total_sales FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id;';
    } else if (userQueryLower.includes('orders') && userQueryLower.includes('greater than')) {
      return 'SELECT * FROM orders WHERE total_amount > 1000;';
    } else if (userQueryLower.includes('products') && userQueryLower.includes('never been ordered')) {
      return 'SELECT products.* FROM products LEFT JOIN order_items ON products.id = order_items.product_id WHERE order_items.id IS NULL;';
    } else if (userQueryLower.includes('first row') && userQueryLower.includes('any table')) {
      return 'SELECT 1 AS connection_test;';
    } else {
      return 'SELECT * FROM table LIMIT 10;';
    }
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
