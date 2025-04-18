const logger = require('../../utils/logger');
const { ApiError, ValidationError } = require('../../utils/errorHandler');
const { validateUserQuery } = require('../../utils/validationService');
const schemaExtractor = require('./schemaExtractor');

/**
 * Service for interacting with Anthropic's API
 * This class handles the generation of SQL queries from natural language
 */
class AnthropicService {
  /**
   * Create a new AnthropicService
   * @param {Object} client - Anthropic client (real or mock)
   * @param {Object} promptBuilder - Prompt builder
   * @param {Object} responseParser - Response parser
   */
  constructor(client, promptBuilder, responseParser) {
    this.client = client;
    this.promptBuilder = promptBuilder;
    this.responseParser = responseParser;

    logger.info('AnthropicService initialized', {
      mockMode: this.client.isMockMode(),
      model: this.client.getModel()
    });
  }

  /**
   * Generate a SQL query and visualization recommendations from natural language
   * @param {string} userQuery - User's natural language query
   * @param {Object} schema - Database schema
   * @param {string} dbType - Database type ('sqlite', 'postgres', or 'mysql')
   * @param {Object} options - Additional options
   * @param {boolean} options.optimizeSchema - Whether to optimize schema for large databases (default: true)
   * @param {number} options.maxTables - Maximum tables to include in optimized schema (default: 20)
   * @returns {Promise<Object>} - Object containing SQL query and visualization recommendations
   * @throws {ValidationError} - If the user query is invalid
   * @throws {ApiError} - If there is an error generating the SQL query
   */
  async generateSqlQuery(userQuery, schema, dbType = 'sqlite', options = {}) {
    try {
      // Validate user query
      const validation = validateUserQuery(userQuery);
      if (!validation.isValid) {
        throw new ValidationError('Invalid user query', validation.errors);
      }

      logger.info('Generating SQL query and visualization recommendations from natural language');
      logger.debug('User query:', userQuery);

      // Extract relevant schema if optimization is enabled
      const optimizeSchema = options.optimizeSchema !== false;
      const schemaSize = Object.keys(schema).length;
      let optimizedSchema = schema;

      if (optimizeSchema && schemaSize > 10) {
        logger.info(`Large schema detected (${schemaSize} tables). Optimizing schema for prompt.`);
        const startTime = Date.now();

        optimizedSchema = await schemaExtractor.extractRelevantSchema(schema, userQuery, {
          maxTables: options.maxTables || 20,
          includeForeignKeys: true
        });

        const extractionTime = Date.now() - startTime;
        logger.info(`Schema optimization complete. Reduced from ${schemaSize} to ${Object.keys(optimizedSchema).length} tables in ${extractionTime}ms`);
      }

      // Build the system prompt with the optimized schema
      const systemPrompt = this.promptBuilder.buildSqlGenerationPrompt({
        schema: optimizedSchema,
        dbType
      });

      // Create the messages array
      const messages = [
        { role: 'user', content: userQuery }
      ];

      // Generate the response
      const response = await this.client.generateResponse({
        systemPrompt,
        messages,
        maxTokens: 1500 // Increased token limit to accommodate visualization recommendations
      });
      logger.info('Received response from Anthropic API:', response);

      // Parse the response to extract the SQL query and visualization recommendations
      const parsedResponse = this.responseParser.parseResponse(response);

      logger.info('SQL query and visualization recommendations generated successfully');
      logger.debug('Generated SQL query:', parsedResponse.sqlQuery);
      logger.debug('Visualization recommendations:', parsedResponse.visualization);

      return parsedResponse;
    } catch (error) {
      // Handle different types of errors
      if (error instanceof ValidationError) {
        // Pass through validation errors
        throw error;
      } else if (error instanceof ApiError) {
        // Pass through API errors
        throw error;
      } else {
        // Handle other errors
        logger.error('Error generating SQL query and visualization recommendations:', error);
        throw new ApiError(500, `Failed to generate SQL query and visualization recommendations: ${error.message}`);
      }
    }
  }

  /**
   * Check if the service is in mock mode
   * @returns {boolean} - True if in mock mode
   */
  isMockMode() {
    return this.client.isMockMode();
  }

  /**
   * Get the model being used
   * @returns {string} - Model name
   */
  getModel() {
    return this.client.getModel();
  }
}

module.exports = AnthropicService;
