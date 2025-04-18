const config = require('../config/config');
const serviceRegistry = require('./serviceRegistry');
const AnthropicServiceFactory = require('./anthropic/anthropicServiceFactory');

/**
 * This file provides a singleton instance of the AnthropicService
 * It uses the AnthropicServiceFactory to create the service with the appropriate dependencies
 */

// Create the service with the factory
const anthropicService = AnthropicServiceFactory.create(
  config.getConfig(),
  {
    includeExamples: true,
    includeChainOfThought: true,
    validateSql: true
  }
);

// Register the service in the registry
serviceRegistry.register('anthropicService', anthropicService);

// Export the service
module.exports = anthropicService;
