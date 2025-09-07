/**
 * UI Manager
 * Manages view switching between main interface and settings panel
 */

import { IconMapper } from '../services/IconMapper.js';

export class UIManager {
  constructor(logger) {
    this.logger = logger;
    this.currentView = 'main';
    this.mainContainer = null;
    this.settingsContainer = null;
    this.settingsButton = null;
    this.backButton = null;
    
    this.onViewChange = null;
  }

  initialize() {
    this.createSettingsButton();
    this.createSettingsContainer();
    this.attachEventListeners();
    
    // Get references to main elements
    this.mainContainer = document.querySelector('.sidebar-container');
    
    this.logger.log('UI Manager initialized');
  }

  createSettingsButton() {
    // Create settings button
    this.settingsButton = document.createElement('button');
    this.settingsButton.className = 'settings-button';
    this.settingsButton.innerHTML = IconMapper.getIcon('settings');
    this.settingsButton.title = 'Settings';
    
    // Add to header
    const header = document.querySelector('.header') || this.createHeader();
    header.appendChild(this.settingsButton);
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'header';
    
    const title = document.createElement('h1');
    title.textContent = 'Waifu AI';
    header.appendChild(title);
    
    // Insert at top of main container
    const container = document.querySelector('.sidebar-container');
    container.insertBefore(header, container.firstChild);
    
    return header;
  }

  createSettingsContainer() {
    this.settingsContainer = document.createElement('div');
    this.settingsContainer.className = 'settings-container hidden';
    this.settingsContainer.innerHTML = this.buildSettingsHTML();
    
    // Insert settings container into document
    document.body.appendChild(this.settingsContainer);
    
    // Get back button reference
    this.backButton = this.settingsContainer.querySelector('.back-button');
  }

  buildSettingsHTML() {
    return `
      ${this.buildSettingsHeader()}
      <div class="settings-content">
        ${this.buildPomodoroSection()}
        ${this.buildAffectionSection()}
        ${this.buildQuotesSection()}
        ${this.buildAppearanceSection()}
        ${this.buildFeatureFlagsSection()}
        ${this.buildManagementSection()}
      </div>
    `;
  }

  buildSettingsHeader() {
    return `
      <div class="settings-header">
        <button class="back-button">
          ${IconMapper.getIcon('arrow-left')}
        </button>
        <h2>Settings</h2>
      </div>
    `;
  }

  buildPomodoroSection() {
    return `
      <div class="settings-section">
        <h3>Pomodoro Timer</h3>
        ${this.createNumberInput('work-duration', 'Work Duration (minutes):', 1, 120, 1)}
        ${this.createNumberInput('short-break', 'Short Break (minutes):', 1, 30, 1)}
        ${this.createNumberInput('long-break', 'Long Break (minutes):', 1, 60, 1)}
        ${this.createNumberInput('sessions-until-long', 'Sessions until Long Break:', 2, 10, 1)}
        ${this.createCheckboxInput('notifications-enabled', 'Enable Notifications')}
        ${this.createCheckboxInput('auto-start-breaks', 'Auto-start Breaks')}
        ${this.createCheckboxInput('auto-start-work', 'Auto-start Work Sessions')}
      </div>
    `;
  }

  buildAffectionSection() {
    return `
      <div class="settings-section">
        <h3>Affection Rewards</h3>
        ${this.createNumberInput('affection-task', 'Task Completion Reward:', 1, 100, 1)}
        ${this.createNumberInput('affection-click', 'Waifu Click Reward:', 1, 50, 1)}
        ${this.createNumberInput('affection-work', 'Work Session Reward:', 1, 100, 1)}
        ${this.createNumberInput('affection-break', 'Break Session Reward:', 1, 50, 1)}
      </div>
    `;
  }

  buildQuotesSection() {
    return `
      <div class="settings-section">
        <h3>Quotes & Tooltips</h3>
        ${this.createNumberInput('quote-interval', 'Random Quote Interval (seconds):', 5, 300, 5)}
        ${this.createNumberInput('quote-duration', 'Quote Display Duration (seconds):', 1, 30, 1)}
        ${this.createCheckboxInput('quotes-auto', 'Enable Auto Quotes')}
      </div>
    `;
  }

  buildAppearanceSection() {
    return `
      <div class="settings-section">
        <h3>Appearance</h3>
        ${this.createNumberInput('sprite-cycle', 'Sprite Cycle Interval (seconds):', 1, 60, 1)}
      </div>
    `;
  }

  buildFeatureFlagsSection() {
    return `
      <div class="settings-section">
        <h3>Feature Flags</h3>
        ${this.createCheckboxInput('experimental-features', 'Enable Experimental Features')}
        ${this.createCheckboxInput('debug-mode', 'Debug Mode')}
        ${this.createCheckboxInput('sound-effects', 'Sound Effects (Coming Soon)')}
        ${this.createCheckboxInput('voice-quotes', 'Voice Quotes (Coming Soon)')}
        ${this.createCheckboxInput('custom-themes', 'Custom Themes (Coming Soon)')}
        ${this.createCheckboxInput('advanced-stats', 'Advanced Statistics (Coming Soon)')}
      </div>
    `;
  }

  // Helper methods for creating form elements
  createNumberInput(id, label, min, max, step) {
    return `
      <div class="setting-item">
        <label for="${id}">${label}</label>
        <input type="number" id="${id}" min="${min}" max="${max}" step="${step}">
      </div>
    `;
  }

  createCheckboxInput(id, label) {
    return `
      <div class="setting-item checkbox-item">
        <label for="${id}">
          <input type="checkbox" id="${id}">
          ${label}
        </label>
      </div>
    `;
  }

  createIconButton(id, iconName, text, className = 'action-button') {
    return `
      <button class="${className}" id="${id}">
        ${IconMapper.getIcon(iconName)} ${text}
      </button>
    `;
  }

  buildManagementSection() {
    return `
      <div class="settings-section">
        <h3>Save & Management</h3>
        <div class="setting-buttons">
          ${this.createIconButton('save-settings', 'save', 'Save Settings', 'action-button primary')}
          ${this.createIconButton('reset-settings', 'refresh-cw', 'Reset to Defaults')}
          ${this.createIconButton('export-settings', 'download', 'Export Settings')}
          ${this.createIconButton('import-settings', 'upload', 'Import Settings')}
        </div>
        <input type="file" id="import-file" accept=".json" style="display: none;">
      </div>
    `;
  }

  attachEventListeners() {
    // Settings button click
    this.settingsButton.addEventListener('click', () => {
      this.showSettings();
    });

    // Back button click
    this.backButton.addEventListener('click', () => {
      this.showMain();
    });

    // ESC key to go back
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentView === 'settings') {
        this.showMain();
      }
    });
  }

  showSettings() {
    if (this.currentView === 'settings') return;
    
    this.currentView = 'settings';
    this.mainContainer.classList.add('hidden');
    this.settingsContainer.classList.remove('hidden');
    
    this.logger.log('Switched to settings view');
    
    if (this.onViewChange) {
      this.onViewChange('settings');
    }
  }

  showMain() {
    if (this.currentView === 'main') return;
    
    this.currentView = 'main';
    this.settingsContainer.classList.add('hidden');
    this.mainContainer.classList.remove('hidden');
    
    this.logger.log('Switched to main view');
    
    if (this.onViewChange) {
      this.onViewChange('main');
    }
  }

  getCurrentView() {
    return this.currentView;
  }

  setViewChangeCallback(callback) {
    this.onViewChange = callback;
  }

  // Methods for updating settings UI
  populateSettings(settings) {
    // Pomodoro settings
    document.getElementById('work-duration').value = settings.pomodoroWorkDuration;
    document.getElementById('short-break').value = settings.pomodoroShortBreak;
    document.getElementById('long-break').value = settings.pomodoroLongBreak;
    document.getElementById('sessions-until-long').value = settings.pomodoroSessionsUntilLongBreak;
    document.getElementById('notifications-enabled').checked = settings.pomodoroNotificationsEnabled;
    document.getElementById('auto-start-breaks').checked = settings.pomodoroAutoStartBreaks;
    document.getElementById('auto-start-work').checked = settings.pomodoroAutoStartWork;

    // Affection settings
    document.getElementById('affection-task').value = settings.affectionTaskCompletion;
    document.getElementById('affection-click').value = settings.affectionWaifuClick;
    document.getElementById('affection-work').value = settings.affectionPomodoroWork;
    document.getElementById('affection-break').value = settings.affectionPomodoroBreak;

    // Quote settings
    document.getElementById('quote-interval').value = settings.quoteRandomInterval;
    document.getElementById('quote-duration').value = settings.quoteDisplayDuration;
    const quotesAutoCheckbox = document.getElementById('quotes-auto');
    if (quotesAutoCheckbox) {
      quotesAutoCheckbox.checked = settings.quoteAutoEnabled;
    }

    // Appearance settings
    document.getElementById('sprite-cycle').value = settings.spriteCycleInterval;

    // Feature flags
    document.getElementById('experimental-features').checked = settings.enableExperimentalFeatures;
    document.getElementById('debug-mode').checked = settings.enableDebugMode;
    document.getElementById('sound-effects').checked = settings.enableSoundEffects;
    document.getElementById('voice-quotes').checked = settings.enableVoiceQuotes;
    document.getElementById('custom-themes').checked = settings.enableCustomThemes;
    document.getElementById('advanced-stats').checked = settings.enableAdvancedStats;
  }

  getSettingsFromUI() {
    return {
      // Pomodoro settings
      pomodoroWorkDuration: parseInt(document.getElementById('work-duration').value),
      pomodoroShortBreak: parseInt(document.getElementById('short-break').value),
      pomodoroLongBreak: parseInt(document.getElementById('long-break').value),
      pomodoroSessionsUntilLongBreak: parseInt(document.getElementById('sessions-until-long').value),
      pomodoroNotificationsEnabled: document.getElementById('notifications-enabled').checked,
      pomodoroAutoStartBreaks: document.getElementById('auto-start-breaks').checked,
      pomodoroAutoStartWork: document.getElementById('auto-start-work').checked,

      // Affection settings
      affectionTaskCompletion: parseInt(document.getElementById('affection-task').value),
      affectionWaifuClick: parseInt(document.getElementById('affection-click').value),
      affectionPomodoroWork: parseInt(document.getElementById('affection-work').value),
      affectionPomodoroBreak: parseInt(document.getElementById('affection-break').value),

      // Quote settings
      quoteRandomInterval: parseInt(document.getElementById('quote-interval').value),
      quoteDisplayDuration: parseInt(document.getElementById('quote-duration').value),
      quoteAutoEnabled: document.getElementById('quotes-auto')?.checked || false,

      // Appearance settings
      spriteCycleInterval: parseInt(document.getElementById('sprite-cycle').value),

      // Feature flags
      enableExperimentalFeatures: document.getElementById('experimental-features').checked,
      enableDebugMode: document.getElementById('debug-mode').checked,
      enableSoundEffects: document.getElementById('sound-effects').checked,
      enableVoiceQuotes: document.getElementById('voice-quotes').checked,
      enableCustomThemes: document.getElementById('custom-themes').checked,
      enableAdvancedStats: document.getElementById('advanced-stats').checked
    };
  }
}
