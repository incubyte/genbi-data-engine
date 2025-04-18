const logger = require('../../utils/logger');

/**
 * PromptBuilder for constructing prompts for the Anthropic API
 * This class handles the construction of prompts with examples and chain-of-thought reasoning
 */
class PromptBuilder {
  /**
   * Create a new PromptBuilder
   * @param {Object} options - Options for the prompt builder
   * @param {boolean} options.includeExamples - Whether to include examples in the prompt
   * @param {boolean} options.includeChainOfThought - Whether to include chain-of-thought reasoning
   */
  constructor(options = {}) {
    this.includeExamples = options.includeExamples !== false; // Default to true
    this.includeChainOfThought = options.includeChainOfThought !== false; // Default to true
    logger.debug('PromptBuilder initialized', {
      includeExamples: this.includeExamples,
      includeChainOfThought: this.includeChainOfThought
    });
  }

  /**
   * Build a system prompt for SQL generation
   * @param {Object} options - Options for the prompt
   * @param {Object} options.schema - Database schema
   * @param {string} options.dbType - Database type ('sqlite', 'postgres', or 'mysql')
   * @returns {string} - System prompt
   */
  buildSqlGenerationPrompt({ schema, dbType }) {
    logger.debug('Building SQL generation prompt', { dbType });

    // Format the schema as a string
    const schemaString = JSON.stringify(schema, null, 2);

    // Get database-specific instructions
    const dbSpecificInstructions = this.getDatabaseSpecificInstructions(dbType);

    // Build the base prompt
    let prompt = this.buildBasePrompt(dbType, schemaString, dbSpecificInstructions);

    // Add examples if enabled
    if (this.includeExamples) {
      prompt += this.getExamples(dbType);
    }

    // Add chain-of-thought instructions if enabled
    if (this.includeChainOfThought) {
      prompt += this.getChainOfThoughtInstructions();
    }
    logger.info('SQL generation prompt built', { prompt });
    return prompt;
  }

  /**
   * Build the base prompt
   * @param {string} dbType - Database type
   * @param {string} schemaString - Database schema as a string
   * @param {string} dbSpecificInstructions - Database-specific instructions
   * @returns {string} - Base prompt
   */
  buildBasePrompt(dbType, schemaString, dbSpecificInstructions) {
    return `You are an expert SQL query generator and data visualization advisor. Your task is to convert natural language queries into valid SQL queries and recommend appropriate visualizations for the results.

You will be provided with:
1. A user's natural language query describing what data they want
2. A database schema that includes tables, columns, and relationships
3. The database type (${dbType})

Your job is to:
1. Analyze the user's query and understand what data they're looking for
2. Examine the database schema to understand the available tables and their relationships
3. Generate a valid SQL query that will retrieve the requested data
4. Recommend appropriate chart types for visualizing the query results
5. Ensure the query is optimized and follows best practices
6. Return your response in a specific JSON format

Here is the database schema:
${schemaString}

Remember:${dbSpecificInstructions}
- Ensure proper handling of potential SQL injection by using parameterized queries where appropriate
- Return your response in the following JSON format with sql and visualization fields

For the visualization recommendations:
- Recommend chart types based on the expected structure of the query results
- Common chart types include: "bar", "line", "pie", "scatter", "table"
- For time series data, recommend "line" charts
- For categorical comparisons, recommend "bar" charts
- For part-to-whole relationships, recommend "pie" charts
- For data with many dimensions or complex relationships, recommend "table" view
- Specify which columns should be used for x-axis and y-axis (or labels and values for pie charts)
- Provide brief reasoning for your recommendations`;
  }

  /**
   * Get database-specific instructions
   * @param {string} dbType - Database type
   * @returns {string} - Database-specific instructions
   */
  getDatabaseSpecificInstructions(dbType) {
    if (dbType === 'postgres') {
      return `
- Generate SQL that works with PostgreSQL
- You can use PostgreSQL-specific features when appropriate
- Use $1, $2, etc. for parameterized queries in PostgreSQL`;
    } else if (dbType === 'mysql') {
      return `
- Generate SQL that works with MySQL
- You can use MySQL-specific features when appropriate
- Use ? for parameterized queries in MySQL`;
    } else {
      return `
- Generate only standard SQL that works with SQLite
- Do not use any database-specific features that might not be supported by SQLite
- Use ? for parameterized queries in SQLite`;
    }
  }

  /**
   * Get examples for the prompt
   * @param {string} dbType - Database type
   * @returns {string} - Examples
   */
  getExamples(dbType) {
    // Base examples that work for all database types
    let examples = `

Here are some examples of natural language queries and their corresponding SQL queries:

Example 1:
User query: "Show me all users who are older than 30"
SQL query: SELECT * FROM users WHERE age > 30;

Example 2:
User query: "Find the total sales for each user"
SQL query: SELECT users.name, SUM(orders.total_amount) as total_sales FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id;

Example 3:
User query: "List all products that have never been ordered"
SQL query: SELECT products.* FROM products LEFT JOIN order_items ON products.id = order_items.product_id WHERE order_items.id IS NULL;
`;

    // Add database-specific examples
    if (dbType === 'postgres') {
      examples += `
Example 4 (PostgreSQL):
User query: "Find users who made a purchase in the last 7 days"
SQL query: SELECT DISTINCT users.* FROM users JOIN orders ON users.id = orders.user_id WHERE orders.created_at > CURRENT_DATE - INTERVAL '7 days';

Example 5 (PostgreSQL):
User query: "Get the top 5 products by sales volume"
SQL query: SELECT products.name, SUM(order_items.quantity) as total_quantity FROM products JOIN order_items ON products.id = order_items.product_id GROUP BY products.id ORDER BY total_quantity DESC LIMIT 5;
`;
    } else if (dbType === 'mysql') {
      examples += `
Example 4 (MySQL):
User query: "Find users who made a purchase in the last 7 days"
SQL query: SELECT DISTINCT users.* FROM users JOIN orders ON users.id = orders.user_id WHERE orders.created_at > DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY);

Example 5 (MySQL):
User query: "Get the top 5 products by sales volume"
SQL query: SELECT products.name, SUM(order_items.quantity) as total_quantity FROM products JOIN order_items ON products.id = order_items.product_id GROUP BY products.id ORDER BY total_quantity DESC LIMIT 5;
`;
    } else {
      examples += `
Example 4 (SQLite):
User query: "Find users who made a purchase in the last 7 days"
SQL query: SELECT DISTINCT users.* FROM users JOIN orders ON users.id = orders.user_id WHERE orders.created_at > date('now', '-7 days');

Example 5 (SQLite):
User query: "Get the top 5 products by sales volume"
SQL query: SELECT products.name, SUM(order_items.quantity) as total_quantity FROM products JOIN order_items ON products.id = order_items.product_id GROUP BY products.id ORDER BY total_quantity DESC LIMIT 5;
`;
    }

    return examples;
  }

  /**
   * Get chain-of-thought instructions
   * @returns {string} - Chain-of-thought instructions
   */
  getChainOfThoughtInstructions() {
    return `

When generating SQL queries, follow this step-by-step reasoning process:

1. First, identify the main entities (tables) involved in the query
2. Determine the relationships between these entities
3. Identify any filtering conditions that need to be applied
4. Determine if aggregation, grouping, or ordering is required
5. Construct the SQL query with proper JOIN clauses, WHERE conditions, and other elements
6. Verify that the query addresses all aspects of the user's request
7. Ensure the query follows best practices for the specific database type

After going through this reasoning process, provide ONLY the final SQL query without any explanations.`;
  }
}

module.exports = PromptBuilder;
