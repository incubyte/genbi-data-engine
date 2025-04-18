const AnthropicService = require('./anthropicService');
const PromptBuilder = require('./promptBuilder');
const ResponseParser = require('./responseParser');
const RealAnthropicClient = require('./clients/realAnthropicClient');
const MockAnthropicClient = require('./clients/mockAnthropicClient');
const logger = require('../../utils/logger');

/**
 * Factory for creating AnthropicService instances
 * This class handles the creation of AnthropicService instances with the appropriate dependencies
 */
class AnthropicServiceFactory {
  /**
   * Create a new AnthropicService instance
   * @param {Object} config - Configuration object
   * @param {Object} config.anthropic - Anthropic API configuration
   * @param {string} config.anthropic.apiKey - Anthropic API key
   * @param {string} config.anthropic.model - Anthropic model to use
   * @param {Object} options - Additional options
   * @param {boolean} options.forceMockMode - Force mock mode even if API key is provided
   * @param {boolean} options.includeExamples - Whether to include examples in prompts
   * @param {boolean} options.includeChainOfThought - Whether to include chain-of-thought reasoning
   * @param {boolean} options.validateSql - Whether to validate SQL queries
   * @returns {AnthropicService} - AnthropicService instance
   */
  static create(config, options = {}) {
    logger.debug('Creating AnthropicService instance', {
      forceMockMode: options.forceMockMode,
      includeExamples: options.includeExamples,
      includeChainOfThought: options.includeChainOfThought,
      validateSql: options.validateSql
    });

    // Create the prompt builder
    const promptBuilder = new PromptBuilder({
      includeExamples: options.includeExamples,
      includeChainOfThought: options.includeChainOfThought
    });

    // Create the response parser
    const responseParser = new ResponseParser({
      validateSql: options.validateSql
    });

    // Extract Anthropic config from the config object
    const anthropicConfig = config.api ? config.api.anthropic : (config.anthropic || {});
    const apiKey = anthropicConfig.apiKey;
    const model = anthropicConfig.model || 'claude-3-opus-20240229';

    // Determine if we should use mock mode
    const useMockMode = options.forceMockMode ||
      !apiKey ||
      apiKey === 'your_anthropic_api_key_here';

    // Create the appropriate client
    let client;
    if (useMockMode) {
      logger.info('Using mock Anthropic client');
      client = new MockAnthropicClient({
        model: model
      });
    } else {
      logger.info('Using real Anthropic client');
      client = new RealAnthropicClient({
        apiKey: apiKey,
        model: model
      });
    }

    // Create and return the service
    return new AnthropicService(client, promptBuilder, responseParser);
  }
}

module.exports = AnthropicServiceFactory;
