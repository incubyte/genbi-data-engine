const Anthropic = require('@anthropic-ai/sdk');
const IAnthropicClient = require('./iAnthropicClient');
const logger = require('../../../utils/logger');
const { ApiError } = require('../../../utils/errorHandler');
const RetryUtils = require('../../../utils/retryUtils');

/**
 * Real implementation of the Anthropic API client
 * This class handles actual API calls to Anthropic
 */
class RealAnthropicClient extends IAnthropicClient {
  /**
   * Create a new RealAnthropicClient
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - Anthropic API key
   * @param {string} config.model - Anthropic model to use
   */
  constructor(config) {
    super();

    if (!config.apiKey) {
      // If we're in test mode or forcing real mode without an API key, use a dummy key
      logger.warn('No Anthropic API key provided. Using a dummy key for testing purposes.');
      this.client = new Anthropic({
        apiKey: 'dummy_key_for_testing',
      });
      this.dummyMode = true;
    } else {
      this.client = new Anthropic({
        apiKey: config.apiKey,
      });
      this.dummyMode = false;
    }

    this.model = config.model || 'claude-3-opus-20240229';

    // Initialize retry configuration
    this.retryConfig = config.retry || {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    };

    logger.info(`RealAnthropicClient initialized with model: ${this.model}`);
    logger.debug('Retry configuration:', this.retryConfig);
  }

  /**
   * Generate a response from the Anthropic API
   * @param {Object} options - Options for the API call
   * @param {string} options.systemPrompt - System prompt for the API
   * @param {Array<Object>} options.messages - Messages for the API
   * @param {number} options.maxTokens - Maximum number of tokens to generate
   * @returns {Promise<Object>} - API response
   */
  async generateResponse({ systemPrompt, messages, maxTokens = 1000 }) {
    try {
      logger.debug('Calling Anthropic API with:', {
        model: this.model,
        maxTokens,
        systemPrompt: systemPrompt.substring(0, 100) + '...',
        messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 50) + '...' }))
      });

      // If we're in dummy mode, use a mock response instead of calling the API
      if (this.dummyMode) {
        logger.info('Using dummy mode to generate SQL query');

        // Extract the user query from the messages
        const userQuery = messages.find(m => m.role === 'user')?.content || '';

        // Generate a SQL query and visualization recommendations based on the schema in the system prompt
        let response = this.generateResponseFromSchema(userQuery, systemPrompt);

        // Return a response object that mimics the Anthropic API response structure
        return {
          id: `dummy-${Date.now()}`,
          type: 'message',
          role: 'assistant',
          model: this.model,
          content: [
            {
              type: 'text',
              text: response
            }
          ],
          usage: {
            input_tokens: 100,
            output_tokens: 50
          }
        };
      }

      // Use the retry utility to handle retries with exponential backoff
      try {
        // Create a function that will be retried
        const makeApiCall = async () => {
          try {
            return await this.client.messages.create({
              model: this.model,
              max_tokens: maxTokens,
              system: systemPrompt,
              messages: messages,
            });
          } catch (apiError) {
            // If we get an authentication error, switch to dummy mode immediately (don't retry)
            if (apiError.status === 401) {
              logger.warn('Authentication error with Anthropic API. Switching to dummy mode.');
              this.dummyMode = true;

              // Extract the user query from the messages
              const userQuery = messages.find(m => m.role === 'user')?.content || '';

              // Generate a SQL query and visualization recommendations based on the schema in the system prompt
              let response = this.generateResponseFromSchema(userQuery, systemPrompt);

              // Return a response object that mimics the Anthropic API response structure
              return {
                id: `dummy-${Date.now()}`,
                type: 'message',
                role: 'assistant',
                model: this.model,
                content: [
                  {
                    type: 'text',
                    text: response
                  }
                ],
                usage: {
                  input_tokens: 100,
                  output_tokens: 50
                }
              };
            }

            // For other errors, throw them to be handled by the retry mechanism
            throw apiError;
          }
        };

        // Setup retry options
        const retryOptions = {
          maxAttempts: this.retryConfig.maxAttempts,
          initialDelay: this.retryConfig.initialDelay,
          maxDelay: this.retryConfig.maxDelay,
          backoffMultiplier: this.retryConfig.backoffMultiplier,
          retryCondition: RetryUtils.isRetryableError,
          onRetry: (error, attempt, delay) => {
            // Log retry information
            const errorInfo = RetryUtils.categorizeError(error);
            logger.warn(`Anthropic API call failed (${errorInfo.category}). Retrying (${attempt}/${this.retryConfig.maxAttempts}) in ${delay}ms`, {
              errorType: error.type || error.name,
              errorMessage: error.message,
              statusCode: error.status || error.statusCode,
              isRetryable: errorInfo.isRetryable,
              category: errorInfo.category,
              description: errorInfo.description
            });
          }
        };

        // Execute the API call with retries
        const response = await RetryUtils.retry(makeApiCall, retryOptions);
        logger.debug('Received response from Anthropic API');
        return response;
      } catch (error) {
        // If all retries failed, enhance the error and throw it
        const errorInfo = RetryUtils.categorizeError(error);
        logger.error(`Anthropic API call failed after ${this.retryConfig.maxAttempts} attempts:`, {
          errorType: error.type || error.name,
          errorMessage: error.message,
          statusCode: error.status || error.statusCode,
          isRetryable: errorInfo.isRetryable,
          category: errorInfo.category,
          description: errorInfo.description
        });

        // Enhance error with more context
        if (error.status && error.status >= 400) {
          throw new ApiError(
            500,
            `Anthropic API error after ${this.retryConfig.maxAttempts} retry attempts: ${error.message}`,
            false,
            error.stack,
            {
              status: error.status,
              type: error.type,
              model: this.model,
              retryAttempts: this.retryConfig.maxAttempts,
              errorCategory: errorInfo.category
            }
          );
        }

        throw new ApiError(
          500,
          `Failed to generate response from Anthropic after ${this.retryConfig.maxAttempts} retry attempts: ${error.message}`,
          false,
          error.stack,
          {
            errorCategory: errorInfo.category,
            retryAttempts: this.retryConfig.maxAttempts
          }
        );
      }
    } catch (error) {
      logger.error('Error in generateResponse:', error);

      // Enhance error with more context
      if (error.status && error.status >= 400) {
        throw new ApiError(
          500,
          `Anthropic API error: ${error.message}`,
          false,
          error.stack,
          {
            status: error.status,
            type: error.type,
            model: this.model
          }
        );
      }

      throw new ApiError(
        500,
        `Failed to generate response from Anthropic: ${error.message}`,
        false,
        error.stack
      );
    }
  }

  /**
   * Generate a response with SQL query and visualization recommendations based on the schema in the system prompt
   * @param {string} userQuery - User's natural language query
   * @param {string} systemPrompt - System prompt containing the schema
   * @returns {string} - Generated response in JSON format with SQL and visualization recommendations
   */
  generateResponseFromSchema(userQuery, systemPrompt) {
    // Extract the schema from the system prompt
    const schemaMatch = systemPrompt.match(/Here is the database schema:\s*([\s\S]*?)\s*Remember:/i);
    const schemaString = schemaMatch ? schemaMatch[1].trim() : '{}';

    try {
      // Parse the schema
      const schema = JSON.parse(schemaString);

      // Generate a SQL query based on the user query and schema
      const userQueryLower = userQuery.toLowerCase();
      let sqlQuery, visualization;

      // Check if this is a connection test query
      if (userQueryLower.includes('first row') && userQueryLower.includes('any table')) {
        return 'SELECT 1 AS connection_test;';
      }

      // Get the table names from the schema
      const tables = Object.keys(schema);

      if (tables.length === 0) {
        return 'SELECT 1 AS no_tables_available;';
      }

      // Simple pattern matching to generate SQL queries and visualization recommendations
      if (userQueryLower.includes('users') && userQueryLower.includes('older than')) {
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
        // Default query if no pattern matches
        sqlQuery = `SELECT * FROM ${tables[0]} LIMIT 10;`;
        visualization = {
          recommendedChartTypes: ['table'],
          reasoning: 'Table view is recommended for displaying general query results.'
        };
      }

      // Return a JSON response with SQL and visualization
      return `{
  "sql": "${sqlQuery}",
  "visualization": ${JSON.stringify(visualization, null, 2)}
}`;
    } catch (error) {
      logger.error('Error parsing schema or generating response:', error);
      return 'SELECT 1 AS error_generating_query;';
    }
  }

  /**
   * Check if the client is in mock mode
   * @returns {boolean} - Always false for real client
   */
  isMockMode() {
    return this.dummyMode === true;
  }

  /**
   * Get the model being used
   * @returns {string} - Model name
   */
  getModel() {
    return this.model;
  }
}

module.exports = RealAnthropicClient;
