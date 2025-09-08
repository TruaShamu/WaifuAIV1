/**
 * Manager Factory
 * Standardized factory for creating and initializing managers
 */

import { ServiceContainer } from '../services/ServiceContainer.js';

export class ManagerFactory {
  constructor(container) {
    this.container = container;
    this.managers = new Map();
    this.initializationOrder = [];
  }

  /**
   * Register a manager with the factory
   * @param {string} name - Manager name
   * @param {Function} ManagerClass - Manager constructor
   * @param {Object} options - Manager options
   */
  registerManager(name, ManagerClass, options = {}) {
    this.managers.set(name, {
      ManagerClass,
      dependencies: options.dependencies || [],
      uiElements: options.uiElements || null,
      initializeEarly: options.initializeEarly || false,
      loadData: options.loadData !== false, // Default to true
      configOverride: options.configOverride || null,
      instance: null
    });

    // Track initialization order
    if (options.initializeEarly) {
      this.initializationOrder.unshift(name);
    } else {
      this.initializationOrder.push(name);
    }
  }

  /**
   * Create a manager instance
   * @param {string} name - Manager name
   * @returns {*} Manager instance
   */
  createManager(name) {
    const managerConfig = this.managers.get(name);
    if (!managerConfig) {
      throw new Error(`Manager "${name}" not registered`);
    }

    if (managerConfig.instance) {
      return managerConfig.instance;
    }

    // Create dependencies object
    const dependencies = this.container.createDependencies();
    
    // Add specific dependencies for this manager
    for (const dep of managerConfig.dependencies) {
      if (this.container.has(dep)) {
        dependencies[dep] = this.container.get(dep);
      }
    }

    // Add config overrides if provided
    if (managerConfig.configOverride) {
      dependencies.configOverride = managerConfig.configOverride;
    }

    // Create manager instance
    const instance = new managerConfig.ManagerClass(dependencies);
    managerConfig.instance = instance;

    // Set UI elements if provided
    if (managerConfig.uiElements) {
      const elements = this.resolveUIElements(managerConfig.uiElements);
      if (elements && Object.keys(elements).length > 0) {
        instance.setUIElements(elements);
      }
    }

    return instance;
  }

  /**
   * Initialize all managers in the correct order
   * @returns {Promise<Object>} Object containing all manager instances
   */
  async initializeAll() {
    const instances = {};
    
    this.container.get('logger').log('Starting manager initialization...');

    // Create all instances first
    for (const name of this.initializationOrder) {
      instances[name] = this.createManager(name);
    }

    // Initialize managers that need early initialization
    for (const name of this.initializationOrder) {
      const managerConfig = this.managers.get(name);
      if (managerConfig.initializeEarly) {
        await instances[name].initialize();
      }
    }

    // Load data for managers that need it
    const loadPromises = [];
    for (const name of this.initializationOrder) {
      const managerConfig = this.managers.get(name);
      if (managerConfig.loadData && instances[name].load) {
        loadPromises.push(instances[name].load());
      }
    }
    await Promise.all(loadPromises);

    // Initialize remaining managers
    for (const name of this.initializationOrder) {
      const managerConfig = this.managers.get(name);
      if (!managerConfig.initializeEarly) {
        await instances[name].initialize();
      }
    }

    this.container.get('logger').log('All managers initialized successfully');
    return instances;
  }

  /**
   * Destroy all managers in reverse order
   * @param {Object} instances - Manager instances to destroy
   * @returns {Promise<void>}
   */
  async destroyAll(instances) {
    const destructionOrder = [...this.initializationOrder].reverse();
    
    for (const name of destructionOrder) {
      if (instances[name] && instances[name].destroy) {
        try {
          await instances[name].destroy();
        } catch (error) {
          this.container.get('logger').error(`Failed to destroy ${name}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Resolve UI elements from selectors
   * @param {Object} elementConfig - Element configuration
   * @returns {Object} Resolved DOM elements
   */
  resolveUIElements(elementConfig) {
    const elements = {};
    
    for (const [key, selector] of Object.entries(elementConfig)) {
      if (typeof selector === 'string') {
        elements[key] = document.getElementById(selector) || document.querySelector(selector);
      } else if (typeof selector === 'object') {
        // Nested element structure
        elements[key] = this.resolveUIElements(selector);
      } else {
        elements[key] = selector;
      }
    }
    
    return elements;
  }

  /**
   * Get status of all managers
   * @param {Object} instances - Manager instances
   * @returns {Array} Status array
   */
  getManagerStatuses(instances) {
    return Object.entries(instances).map(([name, instance]) => ({
      name,
      ...instance.getStatus()
    }));
  }
}
