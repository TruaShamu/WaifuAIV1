/**
 * Waifu AI Application Coordinator
 * Main application class that coordinates all managers and services
 */

import { CONFIG } from './config.js';
import { DataValidationService } from './services/DataValidationService.js';
import { ServiceContainer } from './services/ServiceContainer.js';
import { ManagerFactory } from './services/ManagerFactory.js';

// Manager imports
import { WaifuSpriteManager } from './managers/WaifuSpriteManager.js';
import { AffectionManager } from './managers/AffectionManager.js';
import { TodoManager } from './managers/TodoManager.js';
import { TooltipManager } from './managers/TooltipManager.js';
import { PomodoroManager } from './managers/PomodoroManager.js';
import { SettingsManager } from './managers/SettingsManager.js';
import { UIManager } from './managers/UIManager.js';
import { InteractionManager } from './managers/InteractionManager.js';
import { NotepadManager } from './managers/NotepadManager.js';
import { ShareManager } from './managers/ShareManager.js';
import { MoodTracker } from './managers/MoodTracker.js';

// Service imports
import { QuoteService } from './services/QuoteService.js';
import { ContextAwareQuoteManager } from './services/ContextAwareQuoteManager.js';

export class WaifuApp {
  constructor(storageProvider, logger) {
    // Create service container and register core services
    this.container = new ServiceContainer();
    this.setupServices(storageProvider, logger);
    
    // Create manager factory and register managers
    this.managerFactory = new ManagerFactory(this.container);
    this.setupManagers();
    
    // Manager instances (will be populated during initialization)
    this.managers = {};
    
    // Quote timer for random quotes
    this.quoteTimer = null;
  }

  /**
   * Setup core services in the container
   */
  setupServices(storageProvider, logger) {
    // Register core services
    this.container.register('storageProvider', () => storageProvider);
    this.container.register('logger', () => logger);
    this.container.register('config', () => CONFIG);
    this.container.register('app', () => this);

    // Register service instances
    this.container.register('quoteService', (container) => 
      new QuoteService(container.get('logger'))
    );
    
    this.container.register('contextAwareQuotes', (container) => 
      new ContextAwareQuoteManager(container.get('logger'), container.get('quoteService'))
    );
  }

  /**
   * Register all managers with the factory
   */
  setupManagers() {
    // UI Manager - needs early initialization
    this.managerFactory.registerManager('uiManager', UIManager, {
      initializeEarly: true,
      loadData: false
    });

    // Settings Manager - needs early initialization and data loading
    this.managerFactory.registerManager('settingsManager', SettingsManager, {
      initializeEarly: true
    });

    // Core data managers
    this.managerFactory.registerManager('affectionManager', AffectionManager, {
      uiElements: {
        fill: 'affection-fill',
        text: 'affection-text'
      }
    });

    this.managerFactory.registerManager('todoManager', TodoManager, {
      uiElements: {
        list: 'todo-list',
        count: 'task-count'
      }
    });

    // Pomodoro Manager with complex UI elements
    this.managerFactory.registerManager('pomodoroManager', PomodoroManager, {
      uiElements: {
        timerDisplay: 'timer-time',
        sessionDisplay: 'timer-session',
        progressBar: 'timer-fill',
        startButton: 'pomodoro-start',
        pauseButton: 'pomodoro-pause',
        stopButton: 'pomodoro-stop',
        resetButton: 'pomodoro-reset',
        statsDisplay: {
          workSessions: 'work-sessions',
          totalSessions: 'total-sessions',
          productiveTime: 'productive-time'
        }
      }
    });

    // Feature managers
    this.managerFactory.registerManager('waifuManager', WaifuSpriteManager, {
      dependencies: ['waifuSprite'],
      loadData: false
    });

    this.managerFactory.registerManager('tooltipManager', TooltipManager, {
      loadData: false
    });

    this.managerFactory.registerManager('interactionManager', InteractionManager, {
      loadData: false,
      configOverride: {
        interactionInterval: CONFIG.INTERACTION.INTERVAL,
        interactionReward: CONFIG.INTERACTION.REWARD,
        indicatorDuration: CONFIG.INTERACTION.INDICATOR_DURATION,
        maxMissedInteractions: CONFIG.INTERACTION.MAX_MISSED
      }
    });

    this.managerFactory.registerManager('notepadManager', NotepadManager);

    this.managerFactory.registerManager('shareManager', ShareManager, {
      dependencies: ['app'],
      loadData: false
    });

    this.managerFactory.registerManager('moodTracker', MoodTracker);

    // Register waifu sprite element as a service
    this.container.register('waifuSprite', () => document.getElementById('waifu-sprite'));
  }

  async initialize() {
    try {
      this.container.get('logger').log('Initializing Waifu AI Application...');
      
      // Initialize PanelManager first (for UI setup)
      if (window.PanelManager) {
        await window.PanelManager.init();
        window.PanelManager.setupKeyboardShortcuts();
      }
      
      // Initialize all managers using the factory
      this.managers = await this.managerFactory.initializeAll();
      
      // Store manager references for backward compatibility
      this.uiManager = this.managers.uiManager;
      this.settingsManager = this.managers.settingsManager;
      this.affectionManager = this.managers.affectionManager;
      this.todoManager = this.managers.todoManager;
      this.pomodoroManager = this.managers.pomodoroManager;
      this.waifuManager = this.managers.waifuManager;
      this.tooltipManager = this.managers.tooltipManager;
      this.interactionManager = this.managers.interactionManager;
      this.notepadManager = this.managers.notepadManager;
      this.shareManager = this.managers.shareManager;
      this.moodTracker = this.managers.moodTracker;
      
      // Get service references
      this.quoteService = this.container.get('quoteService');
      this.contextAwareQuotes = this.container.get('contextAwareQuotes');
      
      // Initialize services
      await this.quoteService.initialize();
      await this.contextAwareQuotes.initialize();
      
      // Initialize mood tracker UI
      this.initializeMoodTracker();
      
      // Set up post-initialization integrations
      this.setupEventHandlers();
      this.setupSettingsIntegration();
      this.setupStorageSync();
      this.setupKeyboardShortcuts();
      
      // Ensure cycling is stopped (as per existing behavior)
      this.waifuManager.stopCycling();
      
      // Check storage usage
      await this.checkStorageUsage();
      
      // Request notification permission for Pomodoro
      await this.pomodoroManager.requestNotificationPermission();
      
      this.container.get('logger').log('Application initialized successfully');
    } catch (error) {
      this.container.get('logger').error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  setupEventHandlers() {
    // Add todo button with null check
    const addTodoBtn = document.getElementById('add-todo-btn');
    if (addTodoBtn) {
      addTodoBtn.addEventListener('click', () => {
        this.addTodo();
      });
    }
    
    // Todo input enter key with null check
    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
      todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addTodo();
        }
      });
    }
    
    // Initialize interaction manager with waifu container
    const waifuContainer = document.getElementById('waifu-container');
    if (waifuContainer && this.interactionManager) {
      this.interactionManager.initialize(waifuContainer, (reward) => {
        this.affectionManager.increase(reward, waifuContainer);
        this.updateWaifuMood();
        this.showEventQuote('waifuInteraction');
      });
    }
    
    // Still allow direct clicking but with no reward (just animation)
    if (this.waifuManager) {
      this.waifuManager.addClickHandler(() => {
        // Just show animation and quote, no affection gain
        this.showEventQuote('waifuClick');
      });
    }
    
    // Override todo manager event handlers to include affection logic
    if (this.todoManager) {
      this.todoManager.onToggle = (index) => {
        const completedTask = this.todoManager.toggle(index);
        if (completedTask) {
          this.affectionManager.increase(
            CONFIG.AFFECTION.TASK_COMPLETION,
            document.getElementById('waifu-container')
          );
          // Show task completion quote
          this.showEventQuote('taskComplete');
        }
        this.updateWaifuMood();
      };
      
      this.todoManager.onDelete = (index) => {
        this.todoManager.delete(index);
        this.updateWaifuMood();
      };
    }
    
    // Set up Pomodoro event handlers
    if (this.pomodoroManager) {
      this.pomodoroManager.onSessionComplete = (state) => {
        this.handlePomodoroSessionComplete(state);
      };
      
      this.pomodoroManager.onStateChange = (action, state) => {
        this.handlePomodoroStateChange(action, state);
      };
    }
  }

  addTodo() {
    const input = document.getElementById('todo-input');
    if (!input) {
      this.logger.error('Todo input element not found');
      return;
    }
    
    const text = input.value.trim();
    
    // Additional validation
    if (text.length > 500) {
      alert('Task description is too long (max 500 characters)');
      return;
    }
    
    if (this.todoManager.add(text)) {
      input.value = '';
      this.updateWaifuMood();
      // Show new task quote
      this.showEventQuote('newTask');
    }
  }

  updateWaifuMood() {
    const taskProgress = this.todoManager.getProgress();
    const affectionMood = this.affectionManager.getMoodLevel();
    this.waifuManager.setSpriteByMood(taskProgress, affectionMood);
  }

  setupSettingsIntegration() {
    // Set up UI Manager callbacks
    this.uiManager.setViewChangeCallback((view) => {
      if (view === 'settings') {
        // Populate settings UI with current values
        this.uiManager.populateSettings(this.settingsManager.getSettings());
        this.setupSettingsEventHandlers();
      }
    });

    // Set up settings change callback
    this.settingsManager.onSettingsChange = (settings) => {
      this.applySettings(settings);
    };

    // Apply initial settings
    this.applySettings(this.settingsManager.getSettings());
  }

  initializeMoodTracker() {
    const moodContent = document.getElementById('mood-content');
    if (moodContent) {
      // Generate and insert the calendar HTML
      moodContent.innerHTML = this.moodTracker.generateCalendarHTML();
      
      // Attach event listeners
      this.moodTracker.attachEventListeners();
      
      this.logger.log('Mood tracker initialized');
    }
  }

  setupSettingsEventHandlers() {
    const container = document.querySelector('.settings-container');
    
    // Save button - apply all settings at once with null check
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const newSettings = this.uiManager.getSettingsFromUI();
        
        // Validate settings
        if (!this.validateSettings(newSettings)) {
          alert('Please check your settings. Some values are invalid.');
          return;
        }
        
        // Update all settings
        Object.keys(newSettings).forEach(key => {
          this.settingsManager.set(key, newSettings[key]);
        });
        
        // Apply the settings immediately
        this.applySettings(newSettings);
        
        // Show success message
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
          const originalText = saveBtn.textContent;
          saveBtn.textContent = '✅ Saved!';
          saveBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
          
          setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
          }, 2000);
        }
        
        this.logger.log('Settings saved and applied');
      });
    }
    
    // Real-time preview mode (optional - can be disabled for performance)
    const inputs = container.querySelectorAll('input[type="number"], input[type="checkbox"], input[type="range"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        // Update range slider display
        if (input.type === 'range') {
          const valueDisplay = document.getElementById(`${input.id}-value`);
          if (valueDisplay) {
            valueDisplay.textContent = input.value;
          }
        }
        
        // Optional: Show preview without saving
        // this.previewSettings();
      });
    });

    // Data management buttons
    document.getElementById('reset-settings').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all settings to defaults?')) {
        this.settingsManager.resetToDefaults();
        this.uiManager.populateSettings(this.settingsManager.getSettings());
        this.applySettings(this.settingsManager.getSettings());
      }
    });

    document.getElementById('export-settings').addEventListener('click', () => {
      const settingsJson = this.settingsManager.exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waifu-ai-settings.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('import-settings').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = this.settingsManager.importSettings(event.target.result);
          if (success) {
            this.uiManager.populateSettings(this.settingsManager.getSettings());
            alert('Settings imported successfully!');
          } else {
            alert('Failed to import settings. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  applySettings(settings) {
    // Apply Pomodoro settings (pass in minutes, PomodoroManager will convert to seconds)
    if (this.pomodoroManager.timer) {
      this.pomodoroManager.updateSettings({
        workDuration: settings.pomodoroWorkDuration,
        shortBreak: settings.pomodoroShortBreak,
        longBreak: settings.pomodoroLongBreak,
        sessionsUntilLongBreak: settings.pomodoroSessionsUntilLongBreak,
        notificationsEnabled: settings.pomodoroNotificationsEnabled,
        autoStartBreaks: settings.pomodoroAutoStartBreaks,
        autoStartWork: settings.pomodoroAutoStartWork
      });
    }

    // Apply Affection settings
    CONFIG.AFFECTION.TASK_COMPLETION = settings.affectionTaskCompletion;
    CONFIG.AFFECTION.WAIFU_CLICK = settings.affectionWaifuClick;
    CONFIG.AFFECTION.POMODORO_WORK_SESSION = settings.affectionPomodoroWork;
    CONFIG.AFFECTION.POMODORO_BREAK_SESSION = settings.affectionPomodoroBreak;

    // Apply Quote settings
    CONFIG.TOOLTIP.RANDOM_INTERVAL = settings.quoteRandomInterval * 1000;
    CONFIG.TOOLTIP.DISPLAY_DURATION = settings.quoteDisplayDuration * 1000;
    CONFIG.TOOLTIP.EVENT_DURATION = settings.quoteEventDuration * 1000;
    CONFIG.TOOLTIP.AUTO_ENABLED = settings.quoteAutoEnabled;

    this.logger.log(`Quote auto-enabled setting: ${settings.quoteAutoEnabled}`);

    // Apply Privacy & Context settings
    CONFIG.PRIVACY.TAB_SPY_ENABLED = settings.tabSpyEnabled;
    CONFIG.PRIVACY.CONTEXT_AWARE_QUOTES = settings.contextAwareQuotes;
    CONFIG.PRIVACY.PRODUCTIVITY_TRACKING = settings.productivityTracking;

    // Update context-aware quotes based on settings
    if (this.contextAwareQuotes) {
      if (settings.tabSpyEnabled && settings.contextAwareQuotes) {
        this.contextAwareQuotes.enable();
        this.logger.log('Context-aware quotes enabled');
      } else {
        this.contextAwareQuotes.disable();
        this.logger.log('Context-aware quotes disabled');
      }
    }

    // Apply Sprite settings
    CONFIG.SPRITE_CYCLE_INTERVAL = settings.spriteCycleInterval * 1000;

    // Restart quote system with new settings
    this.stopQuoteSystem(); // Stop current system
    if (settings.quoteAutoEnabled) {
      this.startQuoteSystem(); // Restart with new intervals
    } else {
      this.logger.log('Quote system disabled by settings');
    }

    // this.waifuManager.updateCycleInterval(CONFIG.SPRITE_CYCLE_INTERVAL); // DISABLED - No auto cycling

    this.logger.log('Settings applied successfully');
  }

  previewSettings() {
    // Preview settings changes without saving (for real-time feedback)
    const tempSettings = this.uiManager.getSettingsFromUI();
    
    // Apply only visual/immediate changes for preview
    CONFIG.TOOLTIP.DISPLAY_DURATION = tempSettings.quoteDisplayDuration * 1000;
    CONFIG.TOOLTIP.EVENT_DURATION = tempSettings.quoteEventDuration * 1000;
    
    // Don't restart systems during preview to avoid performance issues
    this.logger.log('Settings previewed (not saved)');
  }

  validateSettings(settings) {
    const result = DataValidationService.validateSettings(settings);
    
    if (!result.isValid) {
      this.logger.error('Settings validation failed:', result.errors);
      return false;
    }
    
    return true;
  }

  setupStorageSync() {
    this.storageProvider.onChange((changes) => {
      if (changes.todos) {
        this.todoManager.sync(changes.todos.newValue || []);
        this.updateWaifuMood();
      }
      
      if (changes.affectionLevel) {
        this.affectionManager.sync(changes.affectionLevel.newValue || 0);
        this.updateWaifuMood();
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const todoInput = document.getElementById('todo-input');
        if (document.activeElement !== todoInput) {
          todoInput.focus();
          e.preventDefault();
        }
      }
      
      // Escape to clear input
      if (e.key === 'Escape') {
        const todoInput = document.getElementById('todo-input');
        if (document.activeElement === todoInput) {
          todoInput.value = '';
          todoInput.blur();
        }
      }
    });
  }

  async checkStorageUsage() {
    try {
      const bytesInUse = await new Promise((resolve) => {
        chrome.storage.local.getBytesInUse(['todos', 'affectionLevel'], resolve);
      });
      
      this.logger.log(`Storage used: ${bytesInUse} bytes`);
      
      if (chrome.storage.local.QUOTA_BYTES) {
        const percentage = ((bytesInUse / chrome.storage.local.QUOTA_BYTES) * 100).toFixed(2);
        this.logger.log(`Storage quota: ${chrome.storage.local.QUOTA_BYTES} bytes (${percentage}% used)`);
      }
    } catch (error) {
      this.logger.error(`Failed to check storage usage: ${error.message}`);
    }
  }

  // Quote System Methods
  startQuoteSystem() {
    if (!CONFIG.TOOLTIP.AUTO_ENABLED) {
      this.logger.log('Quote system start requested but AUTO_ENABLED is false - skipping');
      return;
    }
    
    this.logger.log('Starting quote system...');
    
    // Show initial quote after a short delay
    setTimeout(() => {
      this.showRandomQuote();
    }, 5000);
    
    // Set up regular quote timer
    this.quoteTimer = setInterval(() => {
      this.showRandomQuote();
    }, CONFIG.TOOLTIP.RANDOM_INTERVAL);
  }

  stopQuoteSystem() {
    if (this.quoteTimer) {
      clearInterval(this.quoteTimer);
      this.quoteTimer = null;
      this.logger.log('Quote system stopped');
    }
  }

  showRandomQuote() {
    // Double-check that auto quotes are enabled before showing
    if (!CONFIG.TOOLTIP.AUTO_ENABLED) {
      this.logger.log('Auto quotes disabled, skipping random quote');
      return;
    }
    
    if (this.tooltipManager.isCurrentlyVisible()) {
      this.logger.log('Tooltip already visible, skipping random quote');
      return;
    }

    const moodLevel = this.getMoodBasedOnProgress();
    
    // Use context-aware quotes if available, fallback to regular quotes
    let quote;
    try {
      quote = this.contextAwareQuotes.getContextualQuote();
    } catch (error) {
      this.logger.warn('Context-aware quotes failed, using fallback');
      quote = this.quoteService.getRandomQuote(moodLevel);
    }
    
    this.tooltipManager.show(
      quote,
      CONFIG.TOOLTIP.DISPLAY_DURATION,
      document.getElementById('waifu-container')
    );
  }

  showEventQuote(eventType) {
    const quote = this.quoteService.getQuoteByEvent(eventType);
    
    this.tooltipManager.show(
      quote,
      CONFIG.TOOLTIP.EVENT_DURATION,
      document.getElementById('waifu-container')
    );
  }

  getMoodBasedOnProgress() {
    const taskProgress = this.todoManager.getProgress();
    const affectionLevel = this.affectionManager.getLevel();
    
    // Get context-aware mood multiplier
    let moodMultiplier = 1.0;
    try {
      moodMultiplier = this.contextAwareQuotes.getMoodMultiplier();
    } catch (error) {
      // Context-aware quotes might not be initialized yet
    }
    
    // Base mood calculation
    let baseMood = 'neutral';
    if (affectionLevel >= CONFIG.AFFECTION_LEVELS.VERY_HIGH && taskProgress.completed > taskProgress.total * 0.7) {
      baseMood = 'happy';
    } else if (affectionLevel <= CONFIG.AFFECTION_LEVELS.LOW || taskProgress.total > 10) {
      baseMood = 'sad';
    }
    
    // Adjust mood based on browsing context
    if (moodMultiplier >= 1.2) {
      // User is being productive - boost mood
      baseMood = baseMood === 'sad' ? 'neutral' : 'happy';
    } else if (moodMultiplier <= 0.6) {
      // User is on distracting sites - lower mood slightly
      baseMood = baseMood === 'happy' ? 'neutral' : 'sad';
    }
    
    return baseMood;
  }

  // Pomodoro Integration Methods
  handlePomodoroSessionComplete(state) {
    // Award affection for completed sessions
    if (state.completedSessionType === 'work') {
      this.affectionManager.increase(
        CONFIG.AFFECTION.POMODORO_WORK_SESSION,
        document.getElementById('waifu-container')
      );
      this.showEventQuote('pomodoroWorkComplete');
    } else {
      this.affectionManager.increase(
        CONFIG.AFFECTION.POMODORO_BREAK_SESSION,
        document.getElementById('waifu-container')
      );
      this.showEventQuote('pomodoroBreakComplete');
    }
    
    this.updateWaifuMood();
    this.updatePomodoroUI(state);
  }

  handlePomodoroStateChange(action, state) {
    // Handle different Pomodoro state changes
    switch (action) {
      case 'started':
        if (state.currentSession === 'work') {
          this.showEventQuote('pomodoroWorkStart');
        } else if (state.currentSession === 'longBreak') {
          this.showEventQuote('pomodoroLongBreakStart');
        } else {
          this.showEventQuote('pomodoroBreakStart');
        }
        break;
      
      case 'paused':
        // Optionally show a pause quote
        break;
      
      case 'stopped':
      case 'reset':
        // Update UI state
        break;
    }
    
    this.updatePomodoroUI(state);
    this.updateWaifuMood();
  }

  updatePomodoroUI(state) {
    const timerCircle = document.getElementById('timer-circle');
    const timerFill = document.getElementById('timer-fill');
    
    if (timerCircle) {
      // Remove existing timer state classes
      timerCircle.classList.remove('timer-work', 'timer-break', 'timer-long-break', 'timer-running');
      
      // Add appropriate state classes
      if (state.currentSession === 'work') {
        timerCircle.classList.add('timer-work');
      } else if (state.currentSession === 'longBreak') {
        timerCircle.classList.add('timer-long-break');
      } else {
        timerCircle.classList.add('timer-break');
      }
      
      if (state.isRunning) {
        timerCircle.classList.add('timer-running');
      }
    }
    
    // Update progress bar
    if (timerFill) {
      const progressDegrees = state.progress * 360;
      timerFill.style.setProperty('--progress', `${progressDegrees}deg`);
    }
  }

  async destroy() {
    this.stopQuoteSystem();
    
    // Use manager factory for standardized cleanup
    if (this.managers) {
      await this.managerFactory.destroyAll(this.managers);
    }
    
    this.container.get('logger').log('Application destroyed');
  }

  /**
   * Get debug information about all managers
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      managers: this.managerFactory.getManagerStatuses(this.managers),
      services: Array.from(this.container.services.keys()),
      config: {
        quoteSystemRunning: !!this.quoteTimer,
        autoQuotesEnabled: CONFIG.TOOLTIP.AUTO_ENABLED
      }
    };
  }
}
