const Anthropic = require('@anthropic-ai/sdk');
const IAnthropicClient = require('./iAnthropicClient');
const logger = require('../../../utils/logger');
const { ApiError } = require('../../../utils/errorHandler');

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
      throw new Error('Anthropic API key is required');
    }
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    
    this.model = config.model || 'claude-3-opus-20240229';
    logger.info(`RealAnthropicClient initialized with model: ${this.model}`);
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
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages,
      });
      
      logger.debug('Received response from Anthropic API');
      return response;
    } catch (error) {
      logger.error('Error calling Anthropic API:', error);
      
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
   * Check if the client is in mock mode
   * @returns {boolean} - Always false for real client
   */
  isMockMode() {
    return false;
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
