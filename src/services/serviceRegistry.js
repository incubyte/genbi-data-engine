/**
 * Service Registry for dependency injection and service management
 * This allows for easier testing and mocking of services
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.factories = new Map();
  }

  /**
   * Register a service instance
   * @param {string} name - Service name
   * @param {Object} instance - Service instance
   */
  register(name, instance) {
    this.services.set(name, instance);
  }

  /**
   * Register a factory function for a service
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service
   */
  registerFactory(name, factory) {
    this.factories.set(name, factory);
  }

  /**
   * Get a service instance
   * @param {string} name - Service name
   * @returns {Object} - Service instance
   * @throws {Error} - If service is not registered
   */
  get(name) {
    // If service instance exists, return it
    if (this.services.has(name)) {
      return this.services.get(name);
    }
    
    // If factory exists, create instance, register it, and return it
    if (this.factories.has(name)) {
      const factory = this.factories.get(name);
      const instance = factory(this);
      this.register(name, instance);
      return instance;
    }
    
    throw new Error(`Service '${name}' is not registered`);
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean} - True if service is registered
   */
  has(name) {
    return this.services.has(name) || this.factories.has(name);
  }

  /**
   * Remove a service
   * @param {string} name - Service name
   */
  remove(name) {
    this.services.delete(name);
    this.factories.delete(name);
  }

  /**
   * Clear all services
   */
  clear() {
    this.services.clear();
    this.factories.clear();
  }
}

// Export a singleton instance
const registry = new ServiceRegistry();

module.exports = registry;
