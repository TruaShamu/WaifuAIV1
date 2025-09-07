/**
 * UI Manager
 * Manages view switching between main interface and settings panel
 */

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
    this.settingsButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 8v6m8-12h-6m-8 0h6m7.07-7.07l-4.24 4.24m-5.66 0L4.93 4.93m12.02 12.02l-4.24-4.24m-5.66 0L4.93 19.07"></path>
      </svg>
    `;
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
    this.settingsContainer.innerHTML = `
      <div class="settings-header">
        <button class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h2>Settings</h2>
      </div>
      
      <div class="settings-content">
        <div class="settings-section">
          <h3>Pomodoro Timer</h3>
          <div class="setting-item">
            <label for="work-duration">Work Duration (minutes):</label>
            <input type="number" id="work-duration" min="1" max="120" step="1">
          </div>
          <div class="setting-item">
            <label for="short-break">Short Break (minutes):</label>
            <input type="number" id="short-break" min="1" max="30" step="1">
          </div>
          <div class="setting-item">
            <label for="long-break">Long Break (minutes):</label>
            <input type="number" id="long-break" min="1" max="60" step="1">
          </div>
          <div class="setting-item">
            <label for="sessions-until-long">Sessions until Long Break:</label>
            <input type="number" id="sessions-until-long" min="2" max="10" step="1">
          </div>
          <div class="setting-item checkbox-item">
            <label for="notifications-enabled">
              <input type="checkbox" id="notifications-enabled">
              Enable Notifications
            </label>
          </div>
          <div class="setting-item checkbox-item">
            <label for="auto-start-breaks">
              <input type="checkbox" id="auto-start-breaks">
              Auto-start Breaks
            </label>
          </div>
          <div class="setting-item checkbox-item">
            <label for="auto-start-work">
              <input type="checkbox" id="auto-start-work">
              Auto-start Work Sessions
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h3>Affection Rewards</h3>
          <div class="setting-item">
            <label for="affection-task">Task Completion Reward:</label>
            <input type="number" id="affection-task" min="1" max="100" step="1">
          </div>
          <div class="setting-item">
            <label for="affection-click">Waifu Click Reward:</label>
            <input type="number" id="affection-click" min="1" max="50" step="1">
          </div>
          <div class="setting-item">
            <label for="affection-work">Work Session Reward:</label>
            <input type="number" id="affection-work" min="1" max="100" step="1">
          </div>
          <div class="setting-item">
            <label for="affection-break">Break Session Reward:</label>
            <input type="number" id="affection-break" min="1" max="50" step="1">
          </div>
        </div>

        <div class="settings-section">
          <h3>Quotes & Tooltips</h3>
          <div class="setting-item">
            <label for="quote-interval">Random Quote Interval (seconds):</label>
            <input type="number" id="quote-interval" min="5" max="300" step="5">
          </div>
          <div class="setting-item">
            <label for="quote-duration">Quote Display Duration (seconds):</label>
            <input type="number" id="quote-duration" min="1" max="30" step="1">
          </div>
          <div class="setting-item checkbox-item">
            <label for="quotes-auto">
              <input type="checkbox" id="quotes-auto">
              Enable Auto Quotes
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h3>Appearance</h3>
          <div class="setting-item">
            <label for="sprite-cycle">Sprite Cycle Interval (seconds):</label>
            <input type="number" id="sprite-cycle" min="1" max="60" step="1">
          </div>
        </div>

        <div class="settings-section">
          <h3>Feature Flags</h3>
          <div class="setting-item checkbox-item">
            <label for="experimental-features">
              <input type="checkbox" id="experimental-features">
              Enable Experimental Features
            </label>
          </div>
          <div class="setting-item checkbox-item">
            <label for="debug-mode">
              <input type="checkbox" id="debug-mode">
              Debug Mode
            </label>
          </div>
          <div class="setting-item checkbox-item">
            <label for="sound-effects">
              <input type="checkbox" id="sound-effects">
              Sound Effects (Coming Soon)
            </label>
          </div>
          <div class="setting-item checkbox-item">
            <label for="voice-quotes">
              <input type="checkbox" id="voice-quotes">
              Voice Quotes (Coming Soon)
            </label>
          </div>
          <div class="setting-item checkbox-item">
            <label for="custom-themes">
              <input type="checkbox" id="custom-themes">
              Custom Themes (Coming Soon)
            </label>
          </div>
          <div class="setting-item checkbox-item">
            <label for="advanced-stats">
              <input type="checkbox" id="advanced-stats">
              Advanced Statistics (Coming Soon)
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h3>Data Management</h3>
          <div class="setting-buttons">
            <button class="action-button" id="reset-settings">Reset to Defaults</button>
            <button class="action-button" id="export-settings">Export Settings</button>
            <button class="action-button" id="import-settings">Import Settings</button>
          </div>
          <input type="file" id="import-file" accept=".json" style="display: none;">
        </div>
      </div>
    `;
    
    // Insert settings container into document
    document.body.appendChild(this.settingsContainer);
    
    // Get back button reference
    this.backButton = this.settingsContainer.querySelector('.back-button');
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
    document.getElementById('quotes-auto').checked = settings.quoteAutoEnabled;

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
      quoteAutoEnabled: document.getElementById('quotes-auto').checked,

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
