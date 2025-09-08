/**
 * Base Manager Interface
 * Standardized interface for all managers to ensure consistent lifecycle
 */

export class BaseManager {
  constructor(dependencies = {}) {
    this.storageProvider = dependencies.storageProvider;
    this.logger = dependencies.logger || console; // Fallback to console if logger is undefined
    this.config = dependencies.config;
    this.container = dependencies.container;
    
    this.isInitialized = false;
    this.isDestroyed = false;
    
    // Standard lifecycle hooks
    this.onInitialized = null;
    this.onDestroyed = null;
  }

  /**
   * Initialize the manager - to be overridden by subclasses
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger?.warn(`${this.constructor.name} already initialized`);
      return;
    }

    try {
      await this.onInitialize();
      this.isInitialized = true;
      
      if (this.onInitialized) {
        this.onInitialized();
      }
      
      this.logger?.log(`${this.constructor.name} initialized`);
    } catch (error) {
      this.logger?.error(`Failed to initialize ${this.constructor.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Override this method in subclasses for initialization logic
   * @returns {Promise<void>}
   */
  async onInitialize() {
    // Default implementation - override in subclasses
  }

  /**
   * Set UI elements - standardized method for managers that need DOM elements
   * @param {Object} elements - UI elements object
   */
  setUIElements(elements) {
    this.uiElements = elements;
    this.onUIElementsSet?.(elements);
  }

  /**
   * Load data - standardized method for managers that need to load persisted data
   * @returns {Promise<void>}
   */
  async load() {
    if (!this.storageProvider) {
      this.logger?.warn(`${this.constructor.name} has no storage provider`);
      return;
    }
    
    await this.onLoad();
  }

  /**
   * Override this method in subclasses for load logic
   * @returns {Promise<void>}
   */
  async onLoad() {
    // Default implementation - override in subclasses
  }

  /**
   * Save data - standardized method for managers that need to persist data
   * @returns {Promise<void>}
   */
  async save() {
    if (!this.storageProvider) {
      this.logger?.warn(`${this.constructor.name} has no storage provider`);
      return;
    }
    
    await this.onSave();
  }

  /**
   * Override this method in subclasses for save logic
   * @returns {Promise<void>}
   */
  async onSave() {
    // Default implementation - override in subclasses
  }

  /**
   * Cleanup and destroy the manager
   * @returns {Promise<void>}
   */
  async destroy() {
    if (this.isDestroyed) {
      this.logger?.warn(`${this.constructor.name} already destroyed`);
      return;
    }

    try {
      await this.onDestroy();
      this.isDestroyed = true;
      
      if (this.onDestroyed) {
        this.onDestroyed();
      }
      
      this.logger?.log(`${this.constructor.name} destroyed`);
    } catch (error) {
      this.logger?.error(`Failed to destroy ${this.constructor.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Override this method in subclasses for cleanup logic
   * @returns {Promise<void>}
   */
  async onDestroy() {
    // Default implementation - override in subclasses
  }

  /**
   * Check if manager is ready for use
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && !this.isDestroyed;
  }

  /**
   * Get manager status for debugging
   * @returns {Object}
   */
  getStatus() {
    return {
      name: this.constructor.name,
      initialized: this.isInitialized,
      destroyed: this.isDestroyed,
      ready: this.isReady()
    };
  }
}
