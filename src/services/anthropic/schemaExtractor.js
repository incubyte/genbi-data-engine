const logger = require('../../utils/logger');
const config = require('../../config/config');
const Anthropic = require('@anthropic-ai/sdk');
const RetryUtils = require('../../utils/retryUtils');

/**
 * Utility for extracting relevant schema information based on user queries
 * This helps optimize prompt size when dealing with very large database schemas
 */
class SchemaExtractor {
  constructor() {
    // Create a dedicated Anthropic client for schema extraction
    const anthropicConfig = config.getConfig().api?.anthropic || {};
    const apiKey = anthropicConfig.apiKey || 'dummy_key_for_testing';
    const model = anthropicConfig.model || 'claude-3-7-sonnet-20250219';

    this.anthropicClient = new Anthropic({
      apiKey: apiKey
    });

    this.model = model;
    this.dummyMode = !apiKey || apiKey === 'dummy_key_for_testing';

    // Initialize retry configuration
    this.retryConfig = anthropicConfig.retry || {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    };

    logger.info('SchemaExtractor initialized with Anthropic client', {
      model: this.model,
      dummyMode: this.dummyMode
    });
    logger.debug('Retry configuration:', this.retryConfig);
  }

  /**
   * Extract relevant schema portions based on a user query using Anthropic API
   * @param {Object} schema - Complete database schema
   * @param {string} userQuery - User's natural language query
   * @param {Object} options - Options for extraction
   * @param {number} options.maxTables - Maximum number of tables to include (default: 20)
   * @param {boolean} options.includeForeignKeys - Whether to include foreign key relationships (default: true)
   * @returns {Object} - Filtered schema with only relevant tables
   */
  async extractRelevantSchema(schema, userQuery, options = {}) {
    const maxTables = options.maxTables || 20;
    const includeForeignKeys = options.includeForeignKeys !== false;

    logger.debug('Extracting relevant schema based on user query', {
      maxTables,
      includeForeignKeys,
      schemaSize: Object.keys(schema).length
    });

    // Skip extraction if schema is small enough
    if (Object.keys(schema).length <= maxTables) {
      logger.debug('Schema is small enough, returning full schema');
      return schema;
    }

    try {
      // Generate a prompt for schema extraction
      const systemPrompt = this._buildSchemaExtractionPrompt(schema, maxTables, includeForeignKeys);

      // Create the messages array
      const messages = [
        { role: 'user', content: userQuery }
      ];

      // Call Anthropic API to get relevant tables
      logger.info('Calling Anthropic API to extract relevant schema');

      let response;
      if (this.dummyMode) {
        // If in dummy mode, return a mock response
        logger.info('Using dummy mode for schema extraction');
        response = {
          content: [{
            type: 'text',
            text: JSON.stringify(Object.keys(schema).slice(0, maxTables))
          }]
        };
      } else {
        // Call the real Anthropic API with retry mechanism
        try {
          // Create a function that will be retried
          const makeApiCall = async () => {
            return await this.anthropicClient.messages.create({
              model: this.model,
              max_tokens: 1000,
              system: systemPrompt,
              messages: messages,
            });
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
              logger.warn(`Schema extraction API call failed (${errorInfo.category}). Retrying (${attempt}/${this.retryConfig.maxAttempts}) in ${delay}ms`, {
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
          response = await RetryUtils.retry(makeApiCall, retryOptions);
          logger.debug('Received schema extraction response from Anthropic API');
        } catch (apiError) {
          // If all retries failed, log the error and fall back to a subset of tables
          const errorInfo = RetryUtils.categorizeError(apiError);
          logger.error(`Schema extraction API call failed after ${this.retryConfig.maxAttempts} attempts:`, {
            errorType: apiError.type || apiError.name,
            errorMessage: apiError.message,
            statusCode: apiError.status || apiError.statusCode,
            isRetryable: errorInfo.isRetryable,
            category: errorInfo.category,
            description: errorInfo.description
          });

          // Return a fallback response in case of API error
          response = {
            content: [{
              type: 'text',
              text: JSON.stringify(Object.keys(schema).slice(0, maxTables))
            }]
          };
        }
      }

      // Parse the response to get the list of relevant tables
      const relevantTables = this._parseRelevantTablesFromResponse(response, schema);

      // Build the filtered schema
      const filteredSchema = {};
      for (const tableName of relevantTables) {
        if (schema[tableName]) {
          filteredSchema[tableName] = schema[tableName];
        }
      }

      logger.info(`Extracted schema with ${Object.keys(filteredSchema).length} tables from original schema with ${Object.keys(schema).length} tables`);

      // If no tables were extracted, return a subset of the original schema
      if (Object.keys(filteredSchema).length === 0) {
        logger.warn('No tables extracted by Anthropic, falling back to returning a subset of the schema');
        const allTables = Object.keys(schema).slice(0, maxTables);
        for (const tableName of allTables) {
          filteredSchema[tableName] = schema[tableName];
        }
      }

      return filteredSchema;
    } catch (error) {
      logger.error('Error extracting schema with Anthropic:', error);

      // Fall back to returning a subset of the schema
      logger.warn('Falling back to returning a subset of the schema');
      const filteredSchema = {};
      const allTables = Object.keys(schema).slice(0, maxTables);
      for (const tableName of allTables) {
        filteredSchema[tableName] = schema[tableName];
      }

      return filteredSchema;
    }
  }

  /**
   * Build a system prompt for schema extraction
   * @param {Object} schema - Complete database schema
   * @param {number} maxTables - Maximum number of tables to include
   * @param {boolean} includeForeignKeys - Whether to include foreign key relationships
   * @returns {string} - System prompt for Anthropic API
   * @private
   */
  _buildSchemaExtractionPrompt(schema, maxTables, includeForeignKeys) {
    // Format the schema as a string
    const schemaString = JSON.stringify(schema, null, 2);

    return `You are an expert database analyst. Your task is to identify the most relevant tables from a database schema based on a user's natural language query.

Here is the complete database schema:
${schemaString}

Your job is to:
1. Analyze the user's query and understand what data they're looking for
2. Examine the database schema to understand the available tables and their relationships
3. Identify up to ${maxTables} tables that are most relevant to the user's query
${includeForeignKeys ? '4. Include tables that have foreign key relationships with the relevant tables' : ''}

Return your response as a JSON array of table names, like this: ["table1", "table2", "table3"]

Do not include any explanations or additional text in your response, just the JSON array of table names.`;
  }

  /**
   * Parse the response from Anthropic API to extract relevant table names
   * @param {Object} response - Response from Anthropic API
   * @param {Object} schema - Complete database schema
   * @returns {Array<string>} - Array of relevant table names
   * @private
   */
  _parseRelevantTablesFromResponse(response, schema) {
    try {
      // Extract the text content from the response
      const textContent = response.content[0]?.text || '';

      // Try to parse the response as JSON
      let relevantTables = [];

      // Clean up the response text to extract just the JSON array
      const jsonMatch = textContent.match(/\[\s*".*"\s*\]/s);
      const jsonText = jsonMatch ? jsonMatch[0] : textContent;

      try {
        relevantTables = JSON.parse(jsonText);
      } catch (jsonError) {
        // If JSON parsing fails, try to extract table names using regex
        logger.warn('Failed to parse JSON response, trying regex extraction', { error: jsonError.message });

        const tableMatches = textContent.match(/"([^"]+)"/g);
        if (tableMatches) {
          relevantTables = tableMatches.map(match => match.replace(/"/g, ''));
        }
      }

      // Filter out any table names that don't exist in the schema
      relevantTables = relevantTables.filter(tableName => schema[tableName]);

      logger.debug('Extracted relevant tables from Anthropic response', { relevantTables });

      return relevantTables;
    } catch (error) {
      logger.error('Error parsing relevant tables from Anthropic response:', error);
      return [];
    }
  }


}

module.exports = new SchemaExtractor();