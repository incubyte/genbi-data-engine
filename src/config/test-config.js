const path = require('path');
const fs = require('fs');

/**
 * Test configuration for the application
 */
const testConfig = {
  // Server configuration
  server: {
    port: 3001, // Use a different port for testing
    env: 'test'
  },
  
  // Database configuration
  database: {
    userDataPath: path.join(process.cwd(), 'data', 'test-user-data.db')
  },
  
  // API configuration
  api: {
    anthropic: {
      apiKey: 'test_api_key',
      model: 'claude-3-opus-20240229'
    }
  },
  
  // Logging configuration
  logging: {
    level: 'error', // Only log errors during tests
    directory: path.join(process.cwd(), 'logs')
  },
  
  // Test data
  testData: {
    connections: [
      {
        id: 'test-conn-1',
        name: 'Test SQLite Connection',
        type: 'sqlite',
        connection: path.join(process.cwd(), 'test.db')
      },
      {
        id: 'test-conn-2',
        name: 'Test PostgreSQL Connection',
        type: 'postgres',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          user: 'postgres',
          password: 'postgres'
        }
      }
    ],
    queries: [
      {
        id: 'test-query-1',
        name: 'Test Query 1',
        query: 'Show me all users',
        connection_id: 'test-conn-1'
      },
      {
        id: 'test-query-2',
        name: 'Test Query 2',
        query: 'List all products',
        connection_id: null
      }
    ]
  }
};

/**
 * Setup test environment
 */
const setupTestEnvironment = () => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.PORT = testConfig.server.port;
  
  // Create test data directory if it doesn't exist
  const dataDir = path.dirname(testConfig.database.userDataPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  return testConfig;
};

/**
 * Cleanup test environment
 */
const cleanupTestEnvironment = () => {
  // Remove test database if it exists
  if (fs.existsSync(testConfig.database.userDataPath)) {
    fs.unlinkSync(testConfig.database.userDataPath);
  }
};

module.exports = {
  testConfig,
  setupTestEnvironment,
  cleanupTestEnvironment
};
