const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const { promisify } = require('util');
const logger = require('../utils/logger');
const config = require('../config/config');
const { createDatabaseError } = require('../utils/errorHandler');

/**
 * Connection Pool Manager for managing database connections
 */
class ConnectionPoolManager {
  constructor() {
    // Initialize connection pools
    this.pools = {
      sqlite: new Map(), // Map of database path to connection
      postgres: new Map(), // Map of connection string/config hash to pool
      mysql: new Map() // Map of connection string/config hash to pool
    };
    
    // Set pool configuration
    this.poolConfig = {
      postgres: {
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
        connectionTimeoutMillis: 2000 // How long to wait for a connection to become available
      },
      mysql: {
        connectionLimit: 20, // Maximum number of connections in the pool
        queueLimit: 0, // Unlimited queue
        waitForConnections: true // Wait for connections to become available
      }
    };
    
    // Set connection cleanup interval
    this.cleanupInterval = 60 * 60 * 1000; // 1 hour
    
    // Start cleanup timer
    this.startCleanupTimer();
    
    logger.info('Connection Pool Manager initialized');
  }
  
  /**
   * Get a connection hash for identifying unique connections
   * @param {string|Object} connectionInfo - Connection string or config object
   * @returns {string} - Connection hash
   */
  getConnectionHash(connectionInfo) {
    if (typeof connectionInfo === 'string') {
      return connectionInfo;
    } else {
      // Create a hash from the connection config
      return JSON.stringify(connectionInfo);
    }
  }
  
  /**
   * Get a SQLite connection
   * @param {string} dbPath - Path to SQLite database
   * @returns {Promise<Object>} - SQLite database connection
   */
  async getSQLiteConnection(dbPath) {
    try {
      // Check if connection exists in pool
      if (this.pools.sqlite.has(dbPath)) {
        logger.debug(`Reusing existing SQLite connection for ${dbPath}`);
        return this.pools.sqlite.get(dbPath);
      }
      
      // Create a new connection
      logger.info(`Creating new SQLite connection for ${dbPath}`);
      
      return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            const errorMsg = `Error connecting to SQLite database: ${err.message}`;
            logger.error(errorMsg);
            reject(createDatabaseError(errorMsg, { path: dbPath }));
            return;
          }
          
          // Promisify database methods
          db.allAsync = promisify(db.all).bind(db);
          db.runAsync = promisify(db.run).bind(db);
          db.getAsync = promisify(db.get).bind(db);
          
          // Enable foreign keys
          db.run('PRAGMA foreign_keys = ON');
          
          // Add connection to pool
          this.pools.sqlite.set(dbPath, db);
          
          // Set last used timestamp
          db.lastUsed = Date.now();
          
          logger.info(`Connected to SQLite database at ${dbPath}`);
          resolve(db);
        });
      });
    } catch (error) {
      logger.error(`Error getting SQLite connection: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get a PostgreSQL connection pool
   * @param {string|Object} connectionInfo - PostgreSQL connection string or config object
   * @returns {Promise<Pool>} - PostgreSQL connection pool
   */
  async getPostgresPool(connectionInfo) {
    try {
      const connectionHash = this.getConnectionHash(connectionInfo);
      
      // Check if pool exists
      if (this.pools.postgres.has(connectionHash)) {
        logger.debug('Reusing existing PostgreSQL connection pool');
        const pool = this.pools.postgres.get(connectionHash);
        pool.lastUsed = Date.now();
        return pool;
      }
      
      // Create a new pool
      logger.info('Creating new PostgreSQL connection pool');
      
      const poolConfig = {
        ...this.poolConfig.postgres,
        ...(typeof connectionInfo === 'string' 
          ? { connectionString: connectionInfo } 
          : connectionInfo)
      };
      
      const pool = new Pool(poolConfig);
      
      // Test the connection
      const client = await pool.connect();
      client.release();
      
      // Add pool to pools map
      this.pools.postgres.set(connectionHash, pool);
      
      // Set last used timestamp
      pool.lastUsed = Date.now();
      
      logger.info('PostgreSQL connection pool created successfully');
      return pool;
    } catch (error) {
      logger.error(`Error getting PostgreSQL connection pool: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get a MySQL connection pool
   * @param {string|Object} connectionInfo - MySQL connection string or config object
   * @returns {Promise<Pool>} - MySQL connection pool
   */
  async getMySQLPool(connectionInfo) {
    try {
      const connectionHash = this.getConnectionHash(connectionInfo);
      
      // Check if pool exists
      if (this.pools.mysql.has(connectionHash)) {
        logger.debug('Reusing existing MySQL connection pool');
        const pool = this.pools.mysql.get(connectionHash);
        pool.lastUsed = Date.now();
        return pool;
      }
      
      // Create a new pool
      logger.info('Creating new MySQL connection pool');
      
      // Parse connection string if provided as string
      let poolConfig = this.poolConfig.mysql;
      
      if (typeof connectionInfo === 'string') {
        // Parse MySQL connection string (mysql://username:password@hostname:port/database)
        const url = new URL(connectionInfo);
        poolConfig = {
          ...poolConfig,
          host: url.hostname,
          port: url.port || 3306,
          user: url.username,
          password: url.password,
          database: url.pathname.substring(1), // Remove leading slash
          ssl: url.searchParams.get('ssl') === 'true' ? {} : undefined
        };
      } else {
        poolConfig = {
          ...poolConfig,
          ...connectionInfo
        };
      }
      
      const pool = mysql.createPool(poolConfig);
      
      // Test the connection
      const connection = await pool.getConnection();
      connection.release();
      
      // Add pool to pools map
      this.pools.mysql.set(connectionHash, pool);
      
      // Set last used timestamp
      pool.lastUsed = Date.now();
      
      logger.info('MySQL connection pool created successfully');
      return pool;
    } catch (error) {
      logger.error(`Error getting MySQL connection pool: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get a database connection based on type
   * @param {string} type - Database type ('sqlite', 'postgres', or 'mysql')
   * @param {string|Object} connectionInfo - Connection string or config object
   * @returns {Promise<Object>} - Database connection or pool
   */
  async getConnection(type, connectionInfo) {
    switch (type.toLowerCase()) {
      case 'sqlite':
        return this.getSQLiteConnection(connectionInfo);
      case 'postgres':
      case 'postgresql':
        return this.getPostgresPool(connectionInfo);
      case 'mysql':
        return this.getMySQLPool(connectionInfo);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
  
  /**
   * Release a connection back to the pool
   * @param {string} type - Database type ('sqlite', 'postgres', or 'mysql')
   * @param {Object} connection - Database connection or pool
   * @param {string|Object} connectionInfo - Connection string or config object
   */
  releaseConnection(type, connection) {
    // For SQLite, we don't need to release the connection
    // For PostgreSQL and MySQL, the connection is released back to the pool automatically
    // Just update the last used timestamp
    if (connection) {
      connection.lastUsed = Date.now();
    }
  }
  
  /**
   * Close a specific connection
   * @param {string} type - Database type ('sqlite', 'postgres', or 'mysql')
   * @param {string|Object} connectionInfo - Connection string or config object
   */
  async closeConnection(type, connectionInfo) {
    try {
      const connectionHash = this.getConnectionHash(connectionInfo);
      
      switch (type.toLowerCase()) {
        case 'sqlite':
          if (this.pools.sqlite.has(connectionInfo)) {
            const db = this.pools.sqlite.get(connectionInfo);
            await new Promise((resolve, reject) => {
              db.close((err) => {
                if (err) {
                  logger.error(`Error closing SQLite connection: ${err.message}`);
                  reject(err);
                } else {
                  logger.info(`Closed SQLite connection for ${connectionInfo}`);
                  resolve();
                }
              });
            });
            this.pools.sqlite.delete(connectionInfo);
          }
          break;
        case 'postgres':
        case 'postgresql':
          if (this.pools.postgres.has(connectionHash)) {
            const pool = this.pools.postgres.get(connectionHash);
            await pool.end();
            this.pools.postgres.delete(connectionHash);
            logger.info('Closed PostgreSQL connection pool');
          }
          break;
        case 'mysql':
          if (this.pools.mysql.has(connectionHash)) {
            const pool = this.pools.mysql.get(connectionHash);
            await pool.end();
            this.pools.mysql.delete(connectionHash);
            logger.info('Closed MySQL connection pool');
          }
          break;
        default:
          logger.warn(`Unsupported database type for closing connection: ${type}`);
      }
    } catch (error) {
      logger.error(`Error closing connection: ${error.message}`);
    }
  }
  
  /**
   * Close all connections
   */
  async closeAllConnections() {
    try {
      logger.info('Closing all database connections');
      
      // Close SQLite connections
      for (const [path, db] of this.pools.sqlite.entries()) {
        try {
          await new Promise((resolve, reject) => {
            db.close((err) => {
              if (err) {
                logger.error(`Error closing SQLite connection: ${err.message}`);
                reject(err);
              } else {
                resolve();
              }
            });
          });
          logger.debug(`Closed SQLite connection for ${path}`);
        } catch (error) {
          logger.error(`Error closing SQLite connection: ${error.message}`);
        }
      }
      this.pools.sqlite.clear();
      
      // Close PostgreSQL pools
      for (const pool of this.pools.postgres.values()) {
        try {
          await pool.end();
        } catch (error) {
          logger.error(`Error closing PostgreSQL pool: ${error.message}`);
        }
      }
      this.pools.postgres.clear();
      
      // Close MySQL pools
      for (const pool of this.pools.mysql.values()) {
        try {
          await pool.end();
        } catch (error) {
          logger.error(`Error closing MySQL pool: ${error.message}`);
        }
      }
      this.pools.mysql.clear();
      
      logger.info('All database connections closed');
    } catch (error) {
      logger.error(`Error closing all connections: ${error.message}`);
    }
  }
  
  /**
   * Clean up idle connections
   */
  async cleanupIdleConnections() {
    try {
      logger.debug('Cleaning up idle connections');
      
      const now = Date.now();
      const idleThreshold = now - this.cleanupInterval;
      
      // Clean up SQLite connections
      for (const [path, db] of this.pools.sqlite.entries()) {
        if (db.lastUsed < idleThreshold) {
          try {
            await new Promise((resolve, reject) => {
              db.close((err) => {
                if (err) {
                  logger.error(`Error closing idle SQLite connection: ${err.message}`);
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
            this.pools.sqlite.delete(path);
            logger.debug(`Closed idle SQLite connection for ${path}`);
          } catch (error) {
            logger.error(`Error closing idle SQLite connection: ${error.message}`);
          }
        }
      }
      
      // Clean up PostgreSQL pools
      for (const [hash, pool] of this.pools.postgres.entries()) {
        if (pool.lastUsed < idleThreshold) {
          try {
            await pool.end();
            this.pools.postgres.delete(hash);
            logger.debug('Closed idle PostgreSQL connection pool');
          } catch (error) {
            logger.error(`Error closing idle PostgreSQL pool: ${error.message}`);
          }
        }
      }
      
      // Clean up MySQL pools
      for (const [hash, pool] of this.pools.mysql.entries()) {
        if (pool.lastUsed < idleThreshold) {
          try {
            await pool.end();
            this.pools.mysql.delete(hash);
            logger.debug('Closed idle MySQL connection pool');
          } catch (error) {
            logger.error(`Error closing idle MySQL pool: ${error.message}`);
          }
        }
      }
      
      logger.debug('Idle connection cleanup complete');
    } catch (error) {
      logger.error(`Error cleaning up idle connections: ${error.message}`);
    }
  }
  
  /**
   * Start the cleanup timer
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupIdleConnections();
    }, this.cleanupInterval);
    
    // Ensure the timer doesn't prevent the process from exiting
    this.cleanupTimer.unref();
  }
  
  /**
   * Stop the cleanup timer
   */
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  
  /**
   * Get connection pool statistics
   * @returns {Object} - Connection pool statistics
   */
  getStats() {
    return {
      sqlite: this.pools.sqlite.size,
      postgres: this.pools.postgres.size,
      mysql: this.pools.mysql.size,
      total: this.pools.sqlite.size + this.pools.postgres.size + this.pools.mysql.size
    };
  }
}

// Export a singleton instance
module.exports = new ConnectionPoolManager();
