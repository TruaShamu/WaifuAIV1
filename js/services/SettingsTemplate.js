/**
 * Settings Template System
 * Provides a clean, data-driven approach to building settings UI
 */

import { IconMapper } from './IconMapper.js';

export class SettingsTemplate {
  constructor() {
    this.sections = this.defineSettingsSections();
  }

  /**
   * Define the settings configuration in a clean, declarative way
   */
  defineSettingsSections() {
    return [
      {
        id: 'pomodoro',
        title: 'Pomodoro Timer',
        settings: [
          { type: 'number', id: 'work-duration', label: 'Work Duration (minutes):', min: 1, max: 120, step: 1 },
          { type: 'number', id: 'short-break', label: 'Short Break (minutes):', min: 1, max: 30, step: 1 },
          { type: 'number', id: 'long-break', label: 'Long Break (minutes):', min: 1, max: 60, step: 1 },
          { type: 'number', id: 'sessions-until-long', label: 'Sessions until Long Break:', min: 2, max: 10, step: 1 },
          { type: 'checkbox', id: 'notifications-enabled', label: 'Enable Notifications' },
          { type: 'checkbox', id: 'auto-start-breaks', label: 'Auto-start Breaks' },
          { type: 'checkbox', id: 'auto-start-work', label: 'Auto-start Work Sessions' }
        ]
      },
      {
        id: 'affection',
        title: 'Affection Rewards',
        settings: [
          { type: 'number', id: 'affection-task', label: 'Task Completion Reward:', min: 1, max: 100, step: 1 },
          { type: 'number', id: 'affection-click', label: 'Waifu Click Reward:', min: 1, max: 50, step: 1 },
          { type: 'number', id: 'affection-work', label: 'Work Session Reward:', min: 1, max: 100, step: 1 },
          { type: 'number', id: 'affection-break', label: 'Break Session Reward:', min: 1, max: 50, step: 1 }
        ]
      },
      {
        id: 'quotes',
        title: 'Quotes & Tooltips',
        settings: [
          { type: 'number', id: 'quote-interval', label: 'Random Quote Interval (seconds):', min: 5, max: 300, step: 5 },
          { type: 'number', id: 'quote-duration', label: 'Quote Display Duration (seconds):', min: 1, max: 30, step: 1 },
          { type: 'checkbox', id: 'quotes-auto', label: 'Enable Auto Quotes' }
        ]
      },
      {
        id: 'appearance',
        title: 'Appearance',
        settings: [
          { type: 'number', id: 'sprite-cycle', label: 'Sprite Cycle Interval (seconds):', min: 1, max: 60, step: 1 }
        ]
      },
      {
        id: 'features',
        title: 'Feature Flags',
        settings: [
          { type: 'checkbox', id: 'experimental-features', label: 'Enable Experimental Features' },
          { type: 'checkbox', id: 'debug-mode', label: 'Debug Mode' },
          { type: 'checkbox', id: 'sound-effects', label: 'Sound Effects (Coming Soon)' },
          { type: 'checkbox', id: 'voice-quotes', label: 'Voice Quotes (Coming Soon)' },
          { type: 'checkbox', id: 'custom-themes', label: 'Custom Themes (Coming Soon)' },
          { type: 'checkbox', id: 'advanced-stats', label: 'Advanced Statistics (Coming Soon)' }
        ]
      }
    ];
  }

  /**
   * Define action buttons configuration
   */
  getActionButtons() {
    return [
      { id: 'save-settings', icon: 'save', text: 'Save Settings', className: 'action-button primary' },
      { id: 'reset-settings', icon: 'refresh-cw', text: 'Reset to Defaults', className: 'action-button' },
      { id: 'export-settings', icon: 'download', text: 'Export Settings', className: 'action-button' },
      { id: 'import-settings', icon: 'upload', text: 'Import Settings', className: 'action-button' }
    ];
  }

  /**
   * Generate complete settings HTML from configuration
   */
  generateHTML() {
    return `
      <div class="settings-header">
        <button class="back-button">
          ${IconMapper.getIcon('arrow-left')}
        </button>
        <h2>Settings</h2>
      </div>
      <div class="settings-content">
        ${this.sections.map(section => this.generateSection(section)).join('')}
        ${this.generateManagementSection()}
      </div>
    `;
  }

  /**
   * Generate a settings section from configuration
   */
  generateSection(section) {
    return `
      <div class="settings-section" data-section="${section.id}">
        <h3>${section.title}</h3>
        ${section.settings.map(setting => this.generateSetting(setting)).join('')}
      </div>
    `;
  }

  /**
   * Generate a single setting input from configuration
   */
  generateSetting(setting) {
    switch (setting.type) {
      case 'number':
        return this.generateNumberInput(setting);
      case 'checkbox':
        return this.generateCheckboxInput(setting);
      case 'select':
        return this.generateSelectInput(setting);
      case 'text':
        return this.generateTextInput(setting);
      default:
        console.warn(`Unknown setting type: ${setting.type}`);
        return '';
    }
  }

  generateNumberInput(setting) {
    return `
      <div class="setting-item" data-setting="${setting.id}">
        <label for="${setting.id}">${setting.label}</label>
        <input type="number" id="${setting.id}" 
               min="${setting.min}" max="${setting.max}" step="${setting.step}"
               ${setting.placeholder ? `placeholder="${setting.placeholder}"` : ''}>
      </div>
    `;
  }

  generateCheckboxInput(setting) {
    return `
      <div class="setting-item checkbox-item" data-setting="${setting.id}">
        <label for="${setting.id}">
          <input type="checkbox" id="${setting.id}">
          ${setting.label}
        </label>
      </div>
    `;
  }

  generateSelectInput(setting) {
    return `
      <div class="setting-item" data-setting="${setting.id}">
        <label for="${setting.id}">${setting.label}</label>
        <select id="${setting.id}">
          ${setting.options.map(option => 
            `<option value="${option.value}">${option.text}</option>`
          ).join('')}
        </select>
      </div>
    `;
  }

  generateTextInput(setting) {
    return `
      <div class="setting-item" data-setting="${setting.id}">
        <label for="${setting.id}">${setting.label}</label>
        <input type="text" id="${setting.id}" 
               ${setting.placeholder ? `placeholder="${setting.placeholder}"` : ''}>
      </div>
    `;
  }

  generateManagementSection() {
    return `
      <div class="settings-section" data-section="management">
        <h3>Save & Management</h3>
        <div class="setting-buttons">
          ${this.getActionButtons().map(button => 
            `<button class="${button.className}" id="${button.id}">
              ${IconMapper.getIcon(button.icon)} ${button.text}
            </button>`
          ).join('')}
        </div>
        <input type="file" id="import-file" accept=".json" style="display: none;">
      </div>
    `;
  }

  /**
   * Get all setting IDs for validation and data binding
   */
  getAllSettingIds() {
    const ids = [];
    this.sections.forEach(section => {
      section.settings.forEach(setting => {
        ids.push(setting.id);
      });
    });
    return ids;
  }

  /**
   * Validate settings configuration
   */
  validateConfiguration() {
    const errors = [];
    const usedIds = new Set();

    this.sections.forEach(section => {
      section.settings.forEach(setting => {
        // Check for duplicate IDs
        if (usedIds.has(setting.id)) {
          errors.push(`Duplicate setting ID: ${setting.id}`);
        }
        usedIds.add(setting.id);

        // Check required fields
        if (!setting.type || !setting.id || !setting.label) {
          errors.push(`Missing required fields for setting: ${setting.id}`);
        }

        // Type-specific validation
        if (setting.type === 'number') {
          if (setting.min >= setting.max) {
            errors.push(`Invalid range for ${setting.id}: min must be less than max`);
          }
        }
      });
    });

    return errors;
  }
}
