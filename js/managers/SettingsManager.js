/**
 * Settings Manager
 * Manages application settings and preferences
 */

import { CONFIG } from '../config.js';
import { DataValidationService } from '../services/DataValidationService.js';

export class SettingsManager {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    
    // Initialize with default settings
    this.settings = SettingsManager.getDefaultSettings();
    
    // UI elements
    this.settingsPanel = null;
    this.onSettingsChange = null;
  }

  async load() {
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

  async save() {
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

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.save();
  }

  getSettings() {
    return { ...this.settings };
  }

  resetToDefaults() {
    this.settings = SettingsManager.getDefaultSettings();
    this.save();
    this.logger.log('Settings reset to defaults');
  }

  exportSettings() {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(settingsJson) {
    try {
      const importedSettings = JSON.parse(settingsJson);
      // Validate and merge with current settings
      const validatedSettings = this.validateSettings(importedSettings);
      this.settings = { ...this.settings, ...validatedSettings };
      this.save();
      this.logger.log('Settings imported successfully');
      return true;
    } catch (error) {
      this.logger.error(`Failed to import settings: ${error.message}`);
      return false;
    }
  }

  validateSettings(settings) {
    const result = DataValidationService.validateSettings(settings);
    
    if (!result.isValid) {
      this.logger.warn('Some settings failed validation:', result.errors);
    }
    
    return result.validated;
  }

  // Helper methods for getting converted values
  getPomodoroWorkDurationMs() {
    return SettingsConverter.minutesToMs(this.settings.pomodoroWorkDuration);
  }

  getPomodoroShortBreakMs() {
    return SettingsConverter.minutesToMs(this.settings.pomodoroShortBreak);
  }

  getPomodoroLongBreakMs() {
    return SettingsConverter.minutesToMs(this.settings.pomodoroLongBreak);
  }

  getQuoteRandomIntervalMs() {
    return SettingsConverter.secondsToMs(this.settings.quoteRandomInterval);
  }

  getQuoteDisplayDurationMs() {
    return SettingsConverter.secondsToMs(this.settings.quoteDisplayDuration);
  }

  getQuoteEventDurationMs() {
    return SettingsConverter.secondsToMs(this.settings.quoteEventDuration);
  }

  getSpriteCycleIntervalMs() {
    return SettingsConverter.secondsToMs(this.settings.spriteCycleInterval);
  }

  /**
   * Get default settings configuration
   * @returns {Object} Default settings object
   */
  static getDefaultSettings() {
    return {
      // Pomodoro Settings
      pomodoroWorkDuration: CONFIG.POMODORO.WORK_DURATION,
      pomodoroShortBreak: CONFIG.POMODORO.SHORT_BREAK,
      pomodoroLongBreak: CONFIG.POMODORO.LONG_BREAK,
      pomodoroSessionsUntilLongBreak: CONFIG.POMODORO.SESSIONS_UNTIL_LONG_BREAK,
      pomodoroNotificationsEnabled: CONFIG.POMODORO.NOTIFICATIONS_ENABLED,
      pomodoroAutoStartBreaks: CONFIG.POMODORO.AUTO_START_BREAKS,
      pomodoroAutoStartWork: CONFIG.POMODORO.AUTO_START_WORK,
      
      // Affection Settings
      affectionTaskCompletion: CONFIG.AFFECTION.TASK_COMPLETION,
      affectionWaifuClick: CONFIG.AFFECTION.WAIFU_CLICK,
      affectionPomodoroWork: CONFIG.AFFECTION.POMODORO_WORK_SESSION,
      affectionPomodoroBreak: CONFIG.AFFECTION.POMODORO_BREAK_SESSION,
      
      // Quote Settings
      quoteRandomInterval: SettingsConverter.msToSeconds(CONFIG.TOOLTIP.RANDOM_INTERVAL),
      quoteDisplayDuration: SettingsConverter.msToSeconds(CONFIG.TOOLTIP.DISPLAY_DURATION),
      quoteEventDuration: SettingsConverter.msToSeconds(CONFIG.TOOLTIP.EVENT_DURATION),
      quoteAutoEnabled: CONFIG.TOOLTIP.AUTO_ENABLED,
      contextAwareQuotes: CONFIG.PRIVACY.CONTEXT_AWARE_QUOTES,
      
      // Privacy & Context Settings
      tabSpyEnabled: CONFIG.PRIVACY.TAB_SPY_ENABLED,
      productivityTracking: CONFIG.PRIVACY.PRODUCTIVITY_TRACKING,
      
      // Sprite Settings
      spriteCycleInterval: SettingsConverter.msToSeconds(CONFIG.SPRITE_CYCLE_INTERVAL),
      
      // AI Integration Settings
      customInstructions: '',
      aiDialoguePercentage: 0, // 0-100% AI vs static dialogue
      
      // Feature Flags
      enableExperimentalFeatures: false,
      enableDebugMode: false,
      enableSoundEffects: false,
      enableVoiceQuotes: false,
      enableCustomThemes: false,
      enableAdvancedStats: false
    };
  }
}

/**
 * Utility class for converting between time units
 */
class SettingsConverter {
  static secondsToMs(seconds) {
    return seconds * 1000;
  }

  static msToSeconds(ms) {
    return ms / 1000;
  }

  static minutesToMs(minutes) {
    return minutes * 60 * 1000;
  }

  static msToMinutes(ms) {
    return ms / (60 * 1000);
  }
}
