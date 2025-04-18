const schemaExtractor = require('./src/services/anthropic/schemaExtractor');
const logger = require('./src/utils/logger');

// Sample large schema for testing
const testSchema = {
  users: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'username', type: 'TEXT', notNull: true },
      { name: 'email', type: 'TEXT', notNull: true },
      { name: 'created_at', type: 'TIMESTAMP', notNull: true }
    ],
    foreignKeys: [],
    indexes: []
  },
  products: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'name', type: 'TEXT', notNull: true },
      { name: 'price', type: 'REAL', notNull: true },
      { name: 'description', type: 'TEXT' },
      { name: 'category_id', type: 'INTEGER' },
      { name: 'created_at', type: 'TIMESTAMP', notNull: true }
    ],
    foreignKeys: [
      { id: 0, table: 'categories', from: 'category_id', to: 'id' }
    ],
    indexes: []
  },
  categories: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'name', type: 'TEXT', notNull: true }
    ],
    foreignKeys: [],
    indexes: []
  },
  orders: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'user_id', type: 'INTEGER', notNull: true },
      { name: 'total_amount', type: 'REAL', notNull: true },
      { name: 'status', type: 'TEXT', notNull: true },
      { name: 'created_at', type: 'TIMESTAMP', notNull: true }
    ],
    foreignKeys: [
      { id: 0, table: 'users', from: 'user_id', to: 'id' }
    ],
    indexes: []
  },
  order_items: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'order_id', type: 'INTEGER', notNull: true },
      { name: 'product_id', type: 'INTEGER', notNull: true },
      { name: 'quantity', type: 'INTEGER', notNull: true },
      { name: 'unit_price', type: 'REAL', notNull: true }
    ],
    foreignKeys: [
      { id: 0, table: 'orders', from: 'order_id', to: 'id' },
      { id: 1, table: 'products', from: 'product_id', to: 'id' }
    ],
    indexes: []
  },
  // Add more tables to test with larger schemas
  reviews: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'product_id', type: 'INTEGER', notNull: true },
      { name: 'user_id', type: 'INTEGER', notNull: true },
      { name: 'rating', type: 'INTEGER', notNull: true },
      { name: 'comment', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP', notNull: true }
    ],
    foreignKeys: [
      { id: 0, table: 'products', from: 'product_id', to: 'id' },
      { id: 1, table: 'users', from: 'user_id', to: 'id' }
    ],
    indexes: []
  },
  unrelated_table1: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'data', type: 'TEXT', notNull: true }
    ],
    foreignKeys: [],
    indexes: []
  },
  unrelated_table2: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'data', type: 'TEXT', notNull: true }
    ],
    foreignKeys: [],
    indexes: []
  },
  unrelated_table3: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'data', type: 'TEXT', notNull: true }
    ],
    foreignKeys: [],
    indexes: []
  },
  unrelated_table4: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'data', type: 'TEXT', notNull: true }
    ],
    foreignKeys: [],
    indexes: []
  },
  unrelated_table5: {
    columns: [
      { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
      { name: 'data', type: 'TEXT', notNull: true }
    ],
    foreignKeys: [],
    indexes: []
  }
};

// Test the extractor with different queries
const testQueries = [
  "Show me all users",
  "List all products with their categories",
  "What is the total sales amount for each user?",
  "Show me the top 5 products by sales volume",
  "Which users have made a purchase in the last 7 days?",
  "Calculate the average rating for each product"
];

// Log the results for each query
console.log("\nSchema Extractor Test Results:");
console.log("==============================\n");
console.log(`Total tables in schema: ${Object.keys(testSchema).length}\n`);

testQueries.forEach(query => {
  console.log(`Query: "${query}"`);
  
  // Extract relevant schema with default options
  const result = schemaExtractor.extractRelevantSchema(testSchema, query, {
    maxTables: 5,
    includeForeignKeys: true
  });
  
  // Log the included tables
  console.log(`Selected tables (${Object.keys(result).length}): ${Object.keys(result).join(', ')}`);
  console.log("------------------------------\n");
});

// Exit the process
process.exit(0);