/**
 * Waifu AI Application Coordinator
 * Main application class that coordinates all managers and services
 */

import { CONFIG } from './config.js';
import { WaifuSpriteManager } from './managers/WaifuSpriteManager.js';
import { AffectionManager } from './managers/AffectionManager.js';
import { TodoManager } from './managers/TodoManager.js';
import { TooltipManager } from './managers/TooltipManager.js';
import { QuoteService } from './services/QuoteService.js';

export class WaifuApp {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    
    // Initialize services
    this.quoteService = new QuoteService(logger);
    
    // Initialize managers
    this.waifuManager = new WaifuSpriteManager(
      document.getElementById('waifu-sprite'),
      logger
    );
    
    this.affectionManager = new AffectionManager(storageProvider, logger);
    this.todoManager = new TodoManager(storageProvider, logger);
    this.tooltipManager = new TooltipManager(logger);
    
    // Quote timer for random quotes
    this.quoteTimer = null;
    
    // Set up UI elements
    this.affectionManager.setUIElements(
      document.getElementById('affection-fill'),
      document.getElementById('affection-text')
    );
    
    this.todoManager.setUIElements(
      document.getElementById('todo-list'),
      document.getElementById('task-count')
    );
    
    this.setupEventHandlers();
  }

  async initialize() {
    try {
      this.logger.log('Initializing Waifu AI Application...');
      
      // Load data
      await Promise.all([
        this.affectionManager.load(),
        this.todoManager.load()
      ]);
      
      // Start waifu cycling
      this.waifuManager.startCycling();
      
      // Start quote system
      this.startQuoteSystem();
      
      // Set up storage sync
      this.setupStorageSync();
      
      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      // Check storage usage
      await this.checkStorageUsage();
      
      this.logger.log('Application initialized successfully');
    } catch (error) {
      this.logger.error(`Initialization failed: ${error.message}`);
    }
  }

  setupEventHandlers() {
    // Add todo button
    document.getElementById('add-todo-btn').addEventListener('click', () => {
      this.addTodo();
    });
    
    // Todo input enter key
    document.getElementById('todo-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTodo();
      }
    });
    
    // Waifu click for affection
    this.waifuManager.addClickHandler(() => {
      this.affectionManager.increase(
        CONFIG.AFFECTION.WAIFU_CLICK,
        document.getElementById('waifu-container')
      );
      this.updateWaifuMood();
      
      // Show random waifu click quote
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
  }

  addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    
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
    if (!CONFIG.TOOLTIP.AUTO_ENABLED) return;
    
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

  showRandomQuote() {
    if (this.tooltipManager.isCurrentlyVisible()) {
      this.logger.log('Tooltip already visible, skipping random quote');
      return;
    }

    const moodLevel = this.getMoodBasedOnProgress();
    const quote = this.quoteService.getRandomQuote(moodLevel);
    
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
    
    // Determine mood based on tasks and affection
    if (affectionLevel >= CONFIG.AFFECTION_LEVELS.VERY_HIGH && taskProgress.completed > taskProgress.total * 0.7) {
      return 'happy';
    } else if (affectionLevel <= CONFIG.AFFECTION_LEVELS.LOW || taskProgress.total > 10) {
      return 'sad';
    } else {
      return 'neutral';
    }
  }

  stopQuoteSystem() {
    if (this.quoteTimer) {
      clearInterval(this.quoteTimer);
      this.quoteTimer = null;
      this.logger.log('Quote system stopped');
    }
  }

  destroy() {
    this.waifuManager.stopCycling();
    this.stopQuoteSystem();
    
    if (this.tooltipManager) {
      this.tooltipManager.destroy();
    }
    
    this.logger.log('Application destroyed');
  }
}
