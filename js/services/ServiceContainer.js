/**
 * Service Container
 * Simple dependency injection container for standardized manager initialization
 */

export class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a service with the container
   * @param {string} name - Service name
   * @param {Function} factory - Factory function to create the service
   * @param {boolean} singleton - Whether to create only one instance
   */
  register(name, factory, singleton = true) {
    this.services.set(name, { factory, singleton });
  }

  /**
   * Get a service from the container
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  get(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not found`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }

    return service.factory(this);
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Create dependencies object for consistent manager initialization
   * @returns {Object} Dependencies object
   */
  createDependencies() {
    return {
      storageProvider: this.get('storageProvider'),
      logger: this.get('logger'),
      config: this.get('config'),
      container: this
    };
  }
}
