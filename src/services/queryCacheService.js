const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Query Cache Service for caching query results
 */
class QueryCacheService {
  constructor() {
    // Initialize cache
    this.cache = new Map();
    
    // Cache configuration
    this.config = {
      enabled: true,
      maxSize: 100, // Maximum number of entries in the cache
      ttl: 5 * 60 * 1000, // Time to live in milliseconds (5 minutes)
      cleanupInterval: 10 * 60 * 1000 // Cleanup interval in milliseconds (10 minutes)
    };
    
    // Start cleanup timer
    this.startCleanupTimer();
    
    logger.info('Query Cache Service initialized');
  }
  
  /**
   * Generate a cache key for a query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {string} connectionId - Connection ID or hash
   * @returns {string} - Cache key
   */
  generateCacheKey(query, params = [], connectionId = '') {
    // Create a string representation of the query and parameters
    const paramsStr = JSON.stringify(params);
    return `${connectionId}:${query}:${paramsStr}`;
  }
  
  /**
   * Get a cached query result
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {string} connectionId - Connection ID or hash
   * @returns {Object|null} - Cached result or null if not found
   */
  get(query, params = [], connectionId = '') {
    if (!this.config.enabled) {
      return null;
    }
    
    const key = this.generateCacheKey(query, params, connectionId);
    const cached = this.cache.get(key);
    
    if (!cached) {
      logger.debug(`Cache miss for query: ${query}`);
      return null;
    }
    
    // Check if the cached result has expired
    if (Date.now() > cached.expiresAt) {
      logger.debug(`Cache expired for query: ${query}`);
      this.cache.delete(key);
      return null;
    }
    
    logger.debug(`Cache hit for query: ${query}`);
    
    // Update access time
    cached.lastAccessed = Date.now();
    
    return cached.result;
  }
  
  /**
   * Set a query result in the cache
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {Object} result - Query result
   * @param {string} connectionId - Connection ID or hash
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(query, params = [], result, connectionId = '', ttl = null) {
    if (!this.config.enabled) {
      return;
    }
    
    // Skip caching for large result sets
    if (Array.isArray(result) && result.length > 1000) {
      logger.debug(`Skipping cache for large result set (${result.length} rows)`);
      return;
    }
    
    const key = this.generateCacheKey(query, params, connectionId);
    const now = Date.now();
    
    // Check if we need to evict entries to make room
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldestEntry();
    }
    
    // Set the cached result with expiration time
    this.cache.set(key, {
      result,
      createdAt: now,
      lastAccessed: now,
      expiresAt: now + (ttl || this.config.ttl)
    });
    
    logger.debug(`Cached query result: ${query}`);
  }
  
  /**
   * Invalidate a cached query result
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @param {string} connectionId - Connection ID or hash
   */
  invalidate(query, params = [], connectionId = '') {
    const key = this.generateCacheKey(query, params, connectionId);
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
      logger.debug(`Invalidated cache for query: ${query}`);
    }
  }
  
  /**
   * Invalidate all cached results for a connection
   * @param {string} connectionId - Connection ID or hash
   */
  invalidateConnection(connectionId) {
    let count = 0;
    
    // Find all keys that start with the connection ID
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${connectionId}:`)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      logger.debug(`Invalidated ${count} cached queries for connection: ${connectionId}`);
    }
  }
  
  /**
   * Clear the entire cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cleared query cache (${size} entries)`);
  }
  
  /**
   * Evict the oldest entry from the cache
   */
  evictOldestEntry() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    // Find the oldest entry based on last accessed time
    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestKey = key;
        oldestTime = value.lastAccessed;
      }
    }
    
    // Delete the oldest entry
    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('Evicted oldest cache entry');
    }
  }
  
  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    let count = 0;
    
    // Find all expired entries
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      logger.debug(`Cleaned up ${count} expired cache entries`);
    }
  }
  
  /**
   * Start the cleanup timer
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
    
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
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    return {
      enabled: this.config.enabled,
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      cleanupInterval: this.config.cleanupInterval
    };
  }
  
  /**
   * Enable or disable the cache
   * @param {boolean} enabled - Whether the cache is enabled
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
    logger.info(`Query cache ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export a singleton instance
module.exports = new QueryCacheService();
