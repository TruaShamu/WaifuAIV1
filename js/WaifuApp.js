/**
 * Waifu AI Application Coordinator
 * Main application class that coordinates all managers and services
 */

import { CONFIG } from './config.js';
import { WaifuSpriteManager } from './managers/WaifuSpriteManager.js';
import { AffectionManager } from './managers/AffectionManager.js';
import { TodoManager } from './managers/TodoManager.js';

export class WaifuApp {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    
    // Initialize managers
    this.waifuManager = new WaifuSpriteManager(
      document.getElementById('waifu-sprite'),
      logger
    );
    
    this.affectionManager = new AffectionManager(storageProvider, logger);
    this.todoManager = new TodoManager(storageProvider, logger);
    
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
    });
    
    // Override todo manager event handlers to include affection logic
    this.todoManager.onToggle = (index) => {
      const completedTask = this.todoManager.toggle(index);
      if (completedTask) {
        this.affectionManager.increase(
          CONFIG.AFFECTION.TASK_COMPLETION,
          document.getElementById('waifu-container')
        );
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

  destroy() {
    this.waifuManager.stopCycling();
    this.logger.log('Application destroyed');
  }
}
