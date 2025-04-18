const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const { testConfig } = require('../config/test-config');

/**
 * Create a test database with sample data
 * @returns {Promise<sqlite3.Database>} - Database connection
 */
const createTestDatabase = async () => {
  return new Promise((resolve, reject) => {
    // Create a new database connection
    const db = new sqlite3.Database(testConfig.database.userDataPath, async (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Promisify database methods
      db.runAsync = promisify(db.run).bind(db);
      db.allAsync = promisify(db.all).bind(db);
      db.getAsync = promisify(db.get).bind(db);
      
      try {
        // Enable foreign keys
        await db.runAsync('PRAGMA foreign_keys = ON');
        
        // Create saved_connections table
        await db.runAsync(`
          CREATE TABLE saved_connections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            connection TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Create saved_queries table
        await db.runAsync(`
          CREATE TABLE saved_queries (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            query TEXT NOT NULL,
            connection_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (connection_id) REFERENCES saved_connections(id) ON DELETE SET NULL
          )
        `);
        
        // Insert test connections
        for (const conn of testConfig.testData.connections) {
          await db.runAsync(
            'INSERT INTO saved_connections (id, name, type, connection) VALUES (?, ?, ?, ?)',
            [
              conn.id,
              conn.name,
              conn.type,
              typeof conn.connection === 'string' ? conn.connection : JSON.stringify(conn.connection)
            ]
          );
        }
        
        // Insert test queries
        for (const query of testConfig.testData.queries) {
          await db.runAsync(
            'INSERT INTO saved_queries (id, name, query, connection_id) VALUES (?, ?, ?, ?)',
            [query.id, query.name, query.query, query.connection_id]
          );
        }
        
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * Close and delete the test database
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
const cleanupTestDatabase = (db) => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

/**
 * Create a mock request object for testing
 * @param {Object} options - Request options
 * @returns {Object} - Mock request object
 */
const createMockRequest = (options = {}) => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    get: (header) => (options.headers || {})[header],
    ...options
  };
};

/**
 * Create a mock response object for testing
 * @returns {Object} - Mock response object with jest spies
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create a mock next function for testing
 * @returns {Function} - Mock next function
 */
const createMockNext = () => jest.fn();

module.exports = {
  createTestDatabase,
  cleanupTestDatabase,
  createMockRequest,
  createMockResponse,
  createMockNext
};
