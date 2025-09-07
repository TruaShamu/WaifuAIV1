/**
 * Waifu AI Application Coordinator
 * Main application class that coordinates all managers and services
 */

import { CONFIG } from './config.js';
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
import { QuoteService } from './services/QuoteService.js';
import { ContextAwareQuoteManager } from './services/ContextAwareQuoteManager.js';

export class WaifuApp {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    
    // Initialize services
    this.quoteService = new QuoteService(logger);
    this.contextAwareQuotes = new ContextAwareQuoteManager(logger, this.quoteService);
    
    // Initialize managers
    this.settingsManager = new SettingsManager(storageProvider, logger);
    this.uiManager = new UIManager(logger);
    
    this.waifuManager = new WaifuSpriteManager(
      document.getElementById('waifu-sprite'),
      logger
    );
    
    this.affectionManager = new AffectionManager(storageProvider, logger);
    this.todoManager = new TodoManager(storageProvider, logger);
    this.tooltipManager = new TooltipManager(logger);
    this.pomodoroManager = new PomodoroManager(storageProvider, logger);
    this.notepadManager = new NotepadManager(storageProvider, logger);
    this.shareManager = new ShareManager(logger, this);
    this.moodTracker = new MoodTracker(storageProvider, logger);
    
    // Initialize interaction manager
    this.interactionManager = new InteractionManager(logger, {
      interactionInterval: CONFIG.INTERACTION.INTERVAL,
      interactionReward: CONFIG.INTERACTION.REWARD,
      indicatorDuration: CONFIG.INTERACTION.INDICATOR_DURATION,
      maxMissedInteractions: CONFIG.INTERACTION.MAX_MISSED
    });
    
    // Quote timer for random quotes
    this.quoteTimer = null;
    
    // Set up UI elements with null checks
    const affectionFill = document.getElementById('affection-fill');
    const affectionText = document.getElementById('affection-text');
    if (affectionFill && affectionText) {
      this.affectionManager.setUIElements(affectionFill, affectionText);
    }
    
    const todoList = document.getElementById('todo-list');
    const taskCount = document.getElementById('task-count');
    if (todoList && taskCount) {
      this.todoManager.setUIElements(todoList, taskCount);
    }
    
    // Set up Pomodoro UI elements with null checks
    const pomodoroElements = {
      timerDisplay: document.getElementById('timer-time'),
      sessionDisplay: document.getElementById('timer-session'),
      progressBar: document.getElementById('timer-fill'),
      startButton: document.getElementById('pomodoro-start'),
      pauseButton: document.getElementById('pomodoro-pause'),
      stopButton: document.getElementById('pomodoro-stop'),
      resetButton: document.getElementById('pomodoro-reset'),
      statsDisplay: {
        workSessions: document.getElementById('work-sessions'),
        totalSessions: document.getElementById('total-sessions'),
        productiveTime: document.getElementById('productive-time')
      }
    };
    
    // Only set UI elements if they exist
    if (Object.values(pomodoroElements).every(Boolean)) {
      this.pomodoroManager.setUIElements(pomodoroElements);
    } else {
      this.logger.warn('Some Pomodoro UI elements are missing');
    }
    
    this.setupEventHandlers();
  }

  async initialize() {
    try {
      this.logger.log('Initializing Waifu AI Application...');
      
      // Initialize PanelManager first (for UI setup)
      if (window.PanelManager) {
        await window.PanelManager.init();
        window.PanelManager.setupKeyboardShortcuts();
      }
      
      // Initialize UI Manager
      this.uiManager.initialize();
      
      // Load settings first
      await this.settingsManager.load();
      
      // Load data
      await Promise.all([
        this.affectionManager.load(),
        this.todoManager.load(),
        this.pomodoroManager.load(),
        this.notepadManager.load(),
        this.moodTracker.initialize()
      ]);
      
      // Initialize notepad manager
      await this.notepadManager.initialize();
      
      // Initialize mood tracker UI
      this.initializeMoodTracker();
      
      // Initialize share manager
      this.shareManager.initialize();
      
      // Set up settings integration (this applies loaded settings)
      this.setupSettingsIntegration();
      
      // Start waifu cycling - DISABLED
      // this.waifuManager.startCycling();
      // Ensure cycling is stopped
      this.waifuManager.stopCycling();
      
      // Note: Quote system is started conditionally in setupSettingsIntegration() -> applySettings()
      // Don't start it here unconditionally
      
      // Set up storage sync
      this.setupStorageSync();
      
      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      // Check storage usage
      await this.checkStorageUsage();
      
      // Initialize context-aware quotes
      await this.contextAwareQuotes.initialize();
      
      // Request notification permission for Pomodoro
      await this.pomodoroManager.requestNotificationPermission();
      
      this.logger.log('Application initialized successfully');
    } catch (error) {
      this.logger.error(`Initialization failed: ${error.message}`);
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
    if (waifuContainer) {
      this.interactionManager.initialize(waifuContainer, (reward) => {
        this.affectionManager.increase(reward, waifuContainer);
        this.updateWaifuMood();
        this.showEventQuote('waifuInteraction');
      });
    }
    
    // Still allow direct clicking but with no reward (just animation)
    this.waifuManager.addClickHandler(() => {
      // Just show animation and quote, no affection gain
      this.showEventQuote('waifuClick');
    });
    
    // Override todo manager event handlers to include affection logic
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
    
    // Set up Pomodoro event handlers
    this.pomodoroManager.onSessionComplete = (state) => {
      this.handlePomodoroSessionComplete(state);
    };
    
    this.pomodoroManager.onStateChange = (action, state) => {
      this.handlePomodoroStateChange(action, state);
    };
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
    // Validate numeric settings are within reasonable bounds
    const validations = [
      { key: 'pomodoroWorkDuration', min: 1, max: 120 },
      { key: 'pomodoroShortBreak', min: 1, max: 30 },
      { key: 'pomodoroLongBreak', min: 1, max: 60 },
      { key: 'pomodoroSessionsUntilLongBreak', min: 2, max: 10 },
      { key: 'affectionTaskCompletion', min: 1, max: 100 },
      { key: 'affectionWaifuClick', min: 1, max: 50 },
      { key: 'quoteRandomInterval', min: 5, max: 300 },
      { key: 'quoteDisplayDuration', min: 1, max: 30 },
      { key: 'spriteCycleInterval', min: 1, max: 60 }
    ];

    for (const validation of validations) {
      const value = settings[validation.key];
      if (value < validation.min || value > validation.max) {
        this.logger.error(`${validation.key} must be between ${validation.min} and ${validation.max}`);
        return false;
      }
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

  destroy() {
    this.waifuManager.stopCycling();
    this.stopQuoteSystem();
    
    if (this.tooltipManager) {
      this.tooltipManager.destroy();
    }
    
    if (this.pomodoroManager) {
      this.pomodoroManager.destroy();
    }
    
    if (this.interactionManager) {
      this.interactionManager.cleanup();
    }
    
    if (this.notepadManager) {
      this.notepadManager.cleanup();
    }
    
    if (this.shareManager) {
      this.shareManager.cleanup();
    }
    
    this.logger.log('Application destroyed');
  }
}
