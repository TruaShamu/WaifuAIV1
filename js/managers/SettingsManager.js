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
    
    // Default settings (can be overridden by user)
    this.settings = {
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
      quoteRandomInterval: CONFIG.TOOLTIP.RANDOM_INTERVAL / 1000, // Convert to seconds for UI
      quoteDisplayDuration: CONFIG.TOOLTIP.DISPLAY_DURATION / 1000,
      quoteEventDuration: CONFIG.TOOLTIP.EVENT_DURATION / 1000,
      quoteAutoEnabled: CONFIG.TOOLTIP.AUTO_ENABLED,
      contextAwareQuotes: CONFIG.PRIVACY.CONTEXT_AWARE_QUOTES,
      
      // Privacy & Context Settings
      tabSpyEnabled: CONFIG.PRIVACY.TAB_SPY_ENABLED,
      productivityTracking: CONFIG.PRIVACY.PRODUCTIVITY_TRACKING,
      
      // Sprite Settings
      spriteCycleInterval: CONFIG.SPRITE_CYCLE_INTERVAL / 1000, // Convert to seconds for UI
      
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
    const defaultSettings = {
      pomodoroWorkDuration: CONFIG.POMODORO.WORK_DURATION,
      pomodoroShortBreak: CONFIG.POMODORO.SHORT_BREAK,
      pomodoroLongBreak: CONFIG.POMODORO.LONG_BREAK,
      pomodoroSessionsUntilLongBreak: CONFIG.POMODORO.SESSIONS_UNTIL_LONG_BREAK,
      pomodoroNotificationsEnabled: CONFIG.POMODORO.NOTIFICATIONS_ENABLED,
      pomodoroAutoStartBreaks: CONFIG.POMODORO.AUTO_START_BREAKS,
      pomodoroAutoStartWork: CONFIG.POMODORO.AUTO_START_WORK,
      affectionTaskCompletion: CONFIG.AFFECTION.TASK_COMPLETION,
      affectionWaifuClick: CONFIG.AFFECTION.WAIFU_CLICK,
      affectionPomodoroWork: CONFIG.AFFECTION.POMODORO_WORK_SESSION,
      affectionPomodoroBreak: CONFIG.AFFECTION.POMODORO_BREAK_SESSION,
      quoteRandomInterval: CONFIG.TOOLTIP.RANDOM_INTERVAL / 1000,
      quoteDisplayDuration: CONFIG.TOOLTIP.DISPLAY_DURATION / 1000,
      quoteEventDuration: CONFIG.TOOLTIP.EVENT_DURATION / 1000,
      quoteAutoEnabled: CONFIG.TOOLTIP.AUTO_ENABLED,
      spriteCycleInterval: CONFIG.SPRITE_CYCLE_INTERVAL / 1000,
      enableExperimentalFeatures: false,
      enableDebugMode: false,
      enableSoundEffects: false,
      enableVoiceQuotes: false,
      enableCustomThemes: false,
      enableAdvancedStats: false
    };
    
    this.settings = defaultSettings;
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
    return this.settings.pomodoroWorkDuration * 60 * 1000;
  }

  getPomodoroShortBreakMs() {
    return this.settings.pomodoroShortBreak * 60 * 1000;
  }

  getPomodoroLongBreakMs() {
    return this.settings.pomodoroLongBreak * 60 * 1000;
  }

  getQuoteRandomIntervalMs() {
    return this.settings.quoteRandomInterval * 1000;
  }

  getQuoteDisplayDurationMs() {
    return this.settings.quoteDisplayDuration * 1000;
  }

  getQuoteEventDurationMs() {
    return this.settings.quoteEventDuration * 1000;
  }

  getSpriteCycleIntervalMs() {
    return this.settings.spriteCycleInterval * 1000;
  }
}
