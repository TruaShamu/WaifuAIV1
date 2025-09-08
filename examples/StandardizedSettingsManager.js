/**
 * Example: Migrated Settings Manager
 * Shows how to convert existing managers to use BaseManager pattern
 * 
 * This is an EXAMPLE ONLY - not replacing the existing SettingsManager
 */

import { BaseManager } from './BaseManager.js';
import { DataValidationService } from '../services/DataValidationService.js';

export class StandardizedSettingsManager extends BaseManager {
  constructor(dependencies) {
    super(dependencies);
    
    // Initialize with default settings
    this.settings = StandardizedSettingsManager.getDefaultSettings();
    
    // UI elements
    this.settingsPanel = null;
    this.onSettingsChange = null;
  }

  /**
   * Initialization logic - overrides BaseManager.onInitialize()
   */
  async onInitialize() {
    // Any initialization logic that doesn't involve data loading
    this.logger.log('Settings manager ready for use');
  }

  /**
   * Data loading logic - overrides BaseManager.onLoad()
   */
  async onLoad() {
    try {
      const savedSettings = await this.storageProvider.get('appSettings');
      if (savedSettings && savedSettings.appSettings) {
        // Merge saved settings with defaults
        this.settings = { ...this.settings, ...savedSettings.appSettings };
        this.logger.log('Settings loaded from storage');
      }
    } catch (error) {
      this.logger.error(`Failed to load settings: ${error.message}`);
    }
  }

  /**
   * Data saving logic - overrides BaseManager.onSave()
   */
  async onSave() {
    try {
      await this.storageProvider.set('appSettings', this.settings);
      this.logger.log('Settings saved to storage');
      
      // Trigger callback if settings change
      if (this.onSettingsChange) {
        this.onSettingsChange(this.settings);
      }
    } catch (error) {
      this.logger.error(`Failed to save settings: ${error.message}`);
    }
  }

  /**
   * Cleanup logic - overrides BaseManager.onDestroy()
   */
  async onDestroy() {
    this.onSettingsChange = null;
    this.settingsPanel = null;
  }

  // ... rest of the existing SettingsManager methods would remain the same
  
  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.save(); // This now calls the standardized save method
  }

  getSettings() {
    return { ...this.settings };
  }

  // Example of how the static method would remain unchanged
  static getDefaultSettings() {
    return {
      pomodoroWorkDuration: 25,
      pomodoroShortBreak: 5,
      // ... other defaults
    };
  }
}

/**
 * Benefits of this migration:
 * 
 * 1. Consistent lifecycle management
 * 2. Standardized error handling
 * 3. Built-in status checking
 * 4. Automatic cleanup coordination
 * 5. Dependency injection through constructor
 * 6. Clear separation of concerns (init/load/save/destroy)
 */
