const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errorHandler');

/**
 * Service for interacting with Anthropic's API
 */
class AnthropicService {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      logger.warn('Anthropic API key not provided or using placeholder. Using mock mode.');
      this.mockMode = true;
    } else {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.mockMode = false;
      logger.info('Anthropic client initialized');
    }
  }

  /**
   * Generate a SQL query from natural language using Anthropic's API
   * @param {string} userQuery - User's natural language query
   * @param {Object} schema - Database schema information
   * @param {string} dbType - Database type ('sqlite', 'postgres', or 'mysql')
   * @returns {Promise<string>} - Generated SQL query
   */
  async generateSqlQuery(userQuery, schema, dbType = 'sqlite') {
    try {
      logger.info('Generating SQL query from natural language');
      logger.debug('User query:', userQuery);

      // Format the schema as a string for the prompt
      const schemaString = JSON.stringify(schema, null, 2);

      // If in mock mode, return a mock SQL query based on the user query
      if (this.mockMode) {
        logger.info('Using mock mode to generate SQL query');
        return this.generateMockSqlQuery(userQuery, schema, dbType);
      }

      // Create the system prompt based on database type
      let dbSpecificInstructions = '';
      if (dbType === 'postgres') {
        dbSpecificInstructions = `
- Generate SQL that works with PostgreSQL
- You can use PostgreSQL-specific features when appropriate
- Use $1, $2, etc. for parameterized queries in PostgreSQL`;
      } else if (dbType === 'mysql') {
        dbSpecificInstructions = `
- Generate SQL that works with MySQL
- You can use MySQL-specific features when appropriate
- Use ? for parameterized queries in MySQL`;
      } else {
        dbSpecificInstructions = `
- Generate only standard SQL that works with SQLite
- Do not use any database-specific features that might not be supported by SQLite
- Use ? for parameterized queries in SQLite`;
      }

      const systemPrompt = `You are an expert SQL query generator. Your task is to convert natural language queries into valid SQL queries.

You will be provided with:
1. A user's natural language query describing what data they want
2. A database schema that includes tables, columns, and relationships
3. The database type (${dbType})

Your job is to:
1. Analyze the user's query and understand what data they're looking for
2. Examine the database schema to understand the available tables and their relationships
3. Generate a valid SQL query that will retrieve the requested data
4. Ensure the query is optimized and follows best practices
5. Return ONLY the SQL query without any explanations or additional text

Here is the database schema:
${schemaString}

Remember:${dbSpecificInstructions}
- Ensure proper handling of potential SQL injection by using parameterized queries where appropriate
- Return ONLY the SQL query without any explanations or additional text`;

      // Make the API call to Anthropic
      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userQuery }
        ],
      });

      // Extract the SQL query from the response
      const sqlQuery = response.content[0].text.trim();
      logger.info('SQL query generated successfully');
      logger.debug('Generated SQL query:', sqlQuery);

      return sqlQuery;
    } catch (error) {
      logger.error('Error generating SQL query:', error);
      throw new ApiError(500, `Failed to generate SQL query: ${error.message}`);
    }
  }

  /**
   * Generate a mock SQL query for testing purposes
   * @param {string} userQuery - User's natural language query
   * @param {Object} schema - Database schema information
   * @param {string} dbType - Database type ('sqlite', 'postgres', or 'mysql')
   * @returns {string} - Generated mock SQL query
   */
  generateMockSqlQuery(userQuery, schema, dbType = 'sqlite') {
    logger.info('Generating mock SQL query');

    // Simple pattern matching to generate mock queries
    const userQueryLower = userQuery.toLowerCase();
    const isPostgres = dbType === 'postgres';
    const isMysql = dbType === 'mysql';

    logger.debug(`Generating mock SQL query for ${dbType} database`);

    if (userQueryLower.includes('users') && userQueryLower.includes('older than')) {
      return 'SELECT * FROM users WHERE age > 30;';
    } else if (userQueryLower.includes('products') && userQueryLower.includes('electronics')) {
      return isPostgres
        ? "SELECT * FROM products WHERE category = 'Electronics';"
        : "SELECT * FROM products WHERE category = 'Electronics';";
    } else if (userQueryLower.includes('total sales') && userQueryLower.includes('user')) {
      if (isPostgres) {
        return 'SELECT users.name, SUM(orders.total_amount) as total_sales FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id;';
      } else if (isMysql) {
        return 'SELECT users.name, SUM(orders.total_amount) as total_sales FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id, users.name;';
      } else {
        return 'SELECT users.name, SUM(orders.total_amount) as total_sales FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id;';
      }
    } else if (userQueryLower.includes('orders') && userQueryLower.includes('greater than')) {
      return 'SELECT * FROM orders WHERE total_amount > 1000;';
    } else if (userQueryLower.includes('products') && userQueryLower.includes('never been ordered')) {
      if (isPostgres) {
        return 'SELECT p.* FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id WHERE oi.product_id IS NULL;';
      } else if (isMysql) {
        return 'SELECT p.* FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id WHERE oi.product_id IS NULL;';
      } else {
        return 'SELECT products.* FROM products LEFT JOIN order_items ON products.id = order_items.product_id WHERE order_items.id IS NULL;';
      }
    } else {
      // Default query if no pattern matches
      const tables = Object.keys(schema);
      if (tables.length > 0) {
        return `SELECT * FROM ${tables[0]} LIMIT 10;`;
      } else {
        return 'SELECT 1;';
      }
    }
  }
}

module.exports = new AnthropicService();
