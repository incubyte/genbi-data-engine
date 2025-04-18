const logger = require('../../utils/logger');
const { ApiError } = require('../../utils/errorHandler');

/**
 * ResponseParser for parsing responses from the Anthropic API
 * This class handles the extraction and validation of SQL queries from API responses
 */
class ResponseParser {
  /**
   * Create a new ResponseParser
   * @param {Object} options - Options for the response parser
   * @param {boolean} options.validateSql - Whether to validate SQL queries
   */
  constructor(options = {}) {
    this.validateSql = options.validateSql !== false; // Default to true
    logger.debug('ResponseParser initialized', { validateSql: this.validateSql });
  }

  /**
   * Parse a response from the Anthropic API
   * @param {Object} response - API response
   * @returns {string} - Extracted SQL query
   * @throws {ApiError} - If the response is invalid or cannot be parsed
   */
  parseResponse(response) {
    try {
      logger.debug('Parsing Anthropic API response');
      
      // Check if response is valid
      if (!response || !response.content || !Array.isArray(response.content) || response.content.length === 0) {
        throw new ApiError(500, 'Invalid response from Anthropic API: Missing content');
      }
      
      // Extract the text from the response
      const text = response.content[0].text;
      
      if (!text) {
        throw new ApiError(500, 'Invalid response from Anthropic API: Empty content');
      }
      
      // Extract the SQL query from the text
      const sqlQuery = this.extractSqlQuery(text);
      
      // Validate the SQL query if enabled
      if (this.validateSql) {
        this.validateSqlQuery(sqlQuery);
      }
      
      logger.debug('Successfully parsed SQL query from response');
      return sqlQuery;
    } catch (error) {
      logger.error('Error parsing Anthropic API response:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        500,
        `Failed to parse response from Anthropic: ${error.message}`,
        false,
        error.stack
      );
    }
  }

  /**
   * Extract a SQL query from text
   * @param {string} text - Text to extract from
   * @returns {string} - Extracted SQL query
   */
  extractSqlQuery(text) {
    // Trim the text
    const trimmedText = text.trim();
    
    // Check if the text is wrapped in code blocks
    const codeBlockRegex = /```sql\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```/i;
    const codeBlockMatch = trimmedText.match(codeBlockRegex);
    
    if (codeBlockMatch) {
      // Extract the SQL from the code block
      return (codeBlockMatch[1] || codeBlockMatch[2]).trim();
    }
    
    // If no code block, return the entire text
    return trimmedText;
  }

  /**
   * Validate a SQL query
   * @param {string} sqlQuery - SQL query to validate
   * @throws {ApiError} - If the SQL query is invalid
   */
  validateSqlQuery(sqlQuery) {
    // Check if the query is empty
    if (!sqlQuery || sqlQuery.trim() === '') {
      throw new ApiError(500, 'Invalid SQL query: Empty query');
    }
    
    // Check if the query is too short
    if (sqlQuery.length < 10) {
      throw new ApiError(500, `Invalid SQL query: Query too short (${sqlQuery.length} characters)`);
    }
    
    // Check if the query starts with SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, etc.
    const validStartKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 
      'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 
      'BEGIN', 'COMMIT', 'ROLLBACK', 'WITH'
    ];
    
    const startsWithValidKeyword = validStartKeywords.some(keyword => 
      sqlQuery.trim().toUpperCase().startsWith(keyword)
    );
    
    if (!startsWithValidKeyword) {
      throw new ApiError(
        500, 
        `Invalid SQL query: Query does not start with a valid SQL keyword. Query: ${sqlQuery.substring(0, 50)}...`
      );
    }
    
    // More validation could be added here
  }
}

module.exports = ResponseParser;
