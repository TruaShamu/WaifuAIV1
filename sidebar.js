/**
 * SOLID/DRY Refactored Waifu AI Sidebar
 * Following Single Responsibility, Open/Closed, Liskov Substitution, 
 * Interface Segregation, and Dependency Inversion principles
 */

// ========== CONSTANTS & CONFIGURATION ==========
const CONFIG = {
  SPRITES: [
    'assets/saber_neutral.png',
    'assets/saber_plooshie.png',
    'assets/saber_pouting.png',
    'assets/saber_angry.png',
    'assets/saber_happy.png'
  ],
  AFFECTION: {
    MAX: 100,
    TASK_COMPLETION: 5,
    WAIFU_CLICK: 2
  },
  SPRITE_CYCLE_INTERVAL: 5000,
  ANIMATION_DURATION: 300,
  AFFECTION_LEVELS: {
    VERY_HIGH: 80,
    HIGH: 60,
    MEDIUM: 30,
    LOW: 20
  }
};

// ========== INTERFACES & ABSTRACTIONS ==========
class IStorageProvider {
  async load(key) { throw new Error('Must implement load method'); }
  async save(key, data) { throw new Error('Must implement save method'); }
  onChange(callback) { throw new Error('Must implement onChange method'); }
}

class ILogger {
  log(message) { throw new Error('Must implement log method'); }
  error(message) { throw new Error('Must implement error method'); }
  warn(message) { throw new Error('Must implement warn method'); }
}

// ========== CONCRETE IMPLEMENTATIONS ==========
class ChromeStorageProvider extends IStorageProvider {
  async load(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          throw new Error(`Storage load error: ${chrome.runtime.lastError.message}`);
        }
        resolve(result[key]);
      });
    });
  }

  async save(key, data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          throw new Error(`Storage save error: ${chrome.runtime.lastError.message}`);
        }
        resolve();
      });
    });
  }

  onChange(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        callback(changes);
      }
    });
  }
}

class ConsoleLogger extends ILogger {
  log(message) { console.log(`[WaifuAI] ${message}`); }
  error(message) { console.error(`[WaifuAI ERROR] ${message}`); }
  warn(message) { console.warn(`[WaifuAI WARN] ${message}`); }
}

// ========== DOMAIN MODELS ==========
class Todo {
  constructor(text, id = null, completed = false, createdAt = null) {
    this.text = String(text || '').trim();
    this.completed = Boolean(completed);
    this.id = id || Date.now();
    this.createdAt = createdAt || new Date().toISOString();
  }

  static fromObject(obj) {
    if (!obj || typeof obj !== 'object' || !obj.text) {
      return null;
    }
    return new Todo(obj.text, obj.id, obj.completed, obj.createdAt);
  }

  toggle() {
    this.completed = !this.completed;
    return this.completed;
  }

  isValid() {
    return this.text.length > 0;
  }
}

class AffectionLevel {
  constructor(level = 0, max = CONFIG.AFFECTION.MAX) {
    this.level = Math.max(0, Math.min(max, level));
    this.max = max;
  }

  increase(amount) {
    const oldLevel = this.level;
    this.level = Math.min(this.max, this.level + amount);
    return this.level !== oldLevel;
  }

  getPercentage() {
    return (this.level / this.max) * 100;
  }

  getMoodLevel() {
    if (this.level >= CONFIG.AFFECTION_LEVELS.VERY_HIGH) return 'very_high';
    if (this.level >= CONFIG.AFFECTION_LEVELS.HIGH) return 'high';
    if (this.level >= CONFIG.AFFECTION_LEVELS.MEDIUM) return 'medium';
    if (this.level >= CONFIG.AFFECTION_LEVELS.LOW) return 'low';
    return 'very_low';
  }
}

// ========== SERVICES (Single Responsibility) ==========
class DataValidationService {
  static validateTodos(todos) {
    if (!Array.isArray(todos)) {
      return [];
    }
    
    return todos
      .map(todo => Todo.fromObject(todo))
      .filter(todo => todo && todo.isValid());
  }

  static validateAffectionLevel(level) {
    const numLevel = Number(level);
    return isNaN(numLevel) ? 0 : Math.max(0, Math.min(CONFIG.AFFECTION.MAX, numLevel));
  }
}

class AnimationService {
  static fadeIn(element, duration = CONFIG.ANIMATION_DURATION) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 10);
  }

  static slideOut(element, direction = 'left', duration = CONFIG.ANIMATION_DURATION) {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      element.style.opacity = '0';
      element.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
      
      setTimeout(resolve, duration);
    });
  }

  static bounce(element, scale = 1.1, duration = 200) {
    element.style.transform = `scale(${scale})`;
    setTimeout(() => {
      element.style.transform = '';
    }, duration);
  }

  static createAffectionBoost(container, amount) {
    if (!document.querySelector('#affection-boost-style')) {
      const style = document.createElement('style');
      style.id = 'affection-boost-style';
      style.textContent = `
        @keyframes affectionBoost {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -70%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -90%) scale(0.8); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const boost = document.createElement('div');
    boost.textContent = `+${amount}`;
    boost.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); color: #ff69b4;
      font-weight: bold; font-size: 18px; pointer-events: none;
      z-index: 1000; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      animation: affectionBoost 1.5s ease-out forwards;
    `;
    
    container.style.position = 'relative';
    container.appendChild(boost);
    setTimeout(() => boost.remove(), 1500);
  }
}

// ========== BUSINESS LOGIC CLASSES (Single Responsibility) ==========
class WaifuSpriteManager {
  constructor(imageElement, logger) {
    this.imageElement = imageElement;
    this.logger = logger;
    this.currentSprite = CONFIG.SPRITES[0];
    this.cycleInterval = null;
  }

  startCycling() {
    this.cycleInterval = setInterval(() => {
      this.cycleRandomSprite();
    }, CONFIG.SPRITE_CYCLE_INTERVAL);
  }

  stopCycling() {
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
  }

  cycleRandomSprite() {
    const randomIndex = Math.floor(Math.random() * CONFIG.SPRITES.length);
    this.setSprite(CONFIG.SPRITES[randomIndex]);
  }

  setSprite(spritePath) {
    this.currentSprite = spritePath;
    this.imageElement.src = spritePath;
    this.logger.log(`Sprite changed to: ${spritePath}`);
  }

  setSpriteByMood(taskProgress, affectionMood) {
    let sprite;
    
    // Task-based mood has priority
    if (taskProgress.total === 0) {
      sprite = 'assets/saber_neutral.png';
    } else if (taskProgress.completed === taskProgress.total) {
      sprite = 'assets/saber_happy.png';
    } else if (taskProgress.completed === 0) {
      sprite = 'assets/saber_pouting.png';
    } else {
      // Use affection-based mood for partial completion
      switch (affectionMood) {
        case 'very_high':
          sprite = 'assets/saber_happy.png';
          break;
        case 'high':
        case 'medium':
          sprite = 'assets/saber_neutral.png';
          break;
        default:
          sprite = 'assets/saber_pouting.png';
      }
    }
    
    this.setSprite(sprite);
  }

  addClickHandler(callback) {
    this.imageElement.addEventListener('click', () => {
      AnimationService.bounce(this.imageElement);
      callback();
    });
  }
}

class AffectionManager {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    this.affection = new AffectionLevel();
    this.fillElement = null;
    this.textElement = null;
  }

  setUIElements(fillElement, textElement) {
    this.fillElement = fillElement;
    this.textElement = textElement;
  }

  async load() {
    try {
      const level = await this.storageProvider.load('affectionLevel') || 0;
      this.affection = new AffectionLevel(DataValidationService.validateAffectionLevel(level));
      this.updateUI();
      this.logger.log(`Loaded affection level: ${this.affection.level}`);
    } catch (error) {
      this.logger.error(`Failed to load affection: ${error.message}`);
      this.affection = new AffectionLevel();
    }
  }

  async save() {
    try {
      await this.storageProvider.save('affectionLevel', this.affection.level);
      this.logger.log(`Saved affection level: ${this.affection.level}`);
    } catch (error) {
      this.logger.error(`Failed to save affection: ${error.message}`);
    }
  }

  increase(amount, container = null) {
    if (this.affection.increase(amount)) {
      this.updateUI();
      this.save();
      
      if (container) {
        AnimationService.createAffectionBoost(container, amount);
      }
      
      this.logger.log(`Affection increased by ${amount} to ${this.affection.level}`);
      return true;
    }
    return false;
  }

  updateUI() {
    if (!this.fillElement || !this.textElement) return;
    
    const percentage = this.affection.getPercentage();
    this.fillElement.style.width = `${percentage}%`;
    this.textElement.textContent = this.affection.level;
    
    // Update color based on level
    const mood = this.affection.getMoodLevel();
    const colors = {
      very_high: 'linear-gradient(90deg, #ff1493 0%, #ff69b4 50%, #ffc0cb 100%)',
      high: 'linear-gradient(90deg, #ff69b4 0%, #ff1493 50%, #ff69b4 100%)',
      medium: 'linear-gradient(90deg, #ff69b4 0%, #ff69b4 50%, #ff8fa3 100%)',
      low: 'linear-gradient(90deg, #ff69b4 0%, #ff8fa3 50%, #ffb6c1 100%)',
      very_low: 'linear-gradient(90deg, #666 0%, #888 50%, #666 100%)'
    };
    
    this.fillElement.style.background = colors[mood];
  }

  getMoodLevel() {
    return this.affection.getMoodLevel();
  }

  sync(newLevel) {
    this.affection = new AffectionLevel(newLevel);
    this.updateUI();
    this.logger.log(`Synced affection level: ${this.affection.level}`);
  }
}

class TodoManager {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    this.todos = [];
    this.listElement = null;
    this.countElement = null;
  }

  setUIElements(listElement, countElement) {
    this.listElement = listElement;
    this.countElement = countElement;
  }

  async load() {
    try {
      const rawTodos = await this.storageProvider.load('todos') || [];
      this.todos = DataValidationService.validateTodos(rawTodos);
      this.updateUI();
      this.logger.log(`Loaded ${this.todos.length} todos`);
    } catch (error) {
      this.logger.error(`Failed to load todos: ${error.message}`);
      this.todos = [];
    }
  }

  async save() {
    try {
      const todoData = this.todos.map(todo => ({
        text: todo.text,
        completed: todo.completed,
        id: todo.id,
        createdAt: todo.createdAt
      }));
      
      await this.storageProvider.save('todos', todoData);
      await this.storageProvider.save('lastSaved', new Date().toISOString());
      this.logger.log(`Saved ${this.todos.length} todos`);
    } catch (error) {
      this.logger.error(`Failed to save todos: ${error.message}`);
      // Try to save essential data only
      await this.saveEssentialData();
    }
  }

  async saveEssentialData() {
    try {
      const essentialTodos = this.todos.map(todo => ({
        text: todo.text,
        completed: todo.completed,
        id: todo.id
      }));
      await this.storageProvider.save('todos', essentialTodos);
      this.logger.warn('Saved essential todos only due to storage constraints');
    } catch (error) {
      this.logger.error(`Failed to save even essential data: ${error.message}`);
    }
  }

  add(text) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return false;
    }

    const todo = new Todo(text.trim());
    this.todos.push(todo);
    this.save();
    this.updateUI();
    this.logger.log(`Added todo: ${todo.text}`);
    return true;
  }

  toggle(index) {
    if (index < 0 || index >= this.todos.length) {
      this.logger.error(`Invalid todo index: ${index}`);
      return false;
    }

    const todo = this.todos[index];
    const wasCompleted = todo.completed;
    const isNowCompleted = todo.toggle();
    
    this.save();
    this.updateUI();
    
    this.logger.log(`Toggled todo ${index}: ${todo.text} - ${isNowCompleted ? 'completed' : 'uncompleted'}`);
    
    // Return completion status change for affection handling
    return !wasCompleted && isNowCompleted;
  }

  async delete(index) {
    if (index < 0 || index >= this.todos.length) {
      this.logger.error(`Invalid todo index: ${index}`);
      return false;
    }

    const todoItems = this.listElement.querySelectorAll('.todo-item');
    const todoItem = todoItems[index];
    
    if (todoItem) {
      await AnimationService.slideOut(todoItem);
    }
    
    const deletedTodo = this.todos.splice(index, 1)[0];
    this.save();
    this.updateUI();
    this.logger.log(`Deleted todo: ${deletedTodo.text}`);
    return true;
  }

  getProgress() {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;
    return { total, completed, remaining: total - completed };
  }

  updateUI() {
    if (!this.listElement || !this.countElement) return;
    
    this.renderList();
    this.updateCount();
  }

  renderList() {
    this.listElement.innerHTML = '';
    
    this.todos.forEach((todo, index) => {
      const li = this.createTodoElement(todo, index);
      this.listElement.appendChild(li);
      AnimationService.fadeIn(li);
    });
  }

  createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    const checkbox = this.createCheckbox(todo.completed, () => this.onToggle(index));
    const textSpan = this.createTextSpan(todo.text);
    const deleteBtn = this.createDeleteButton(() => this.onDelete(index));
    
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    
    return li;
  }

  createCheckbox(checked, onToggle) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = checked;
    checkbox.addEventListener('change', onToggle);
    return checkbox;
  }

  createTextSpan(text) {
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = text;
    return span;
  }

  createDeleteButton(onDelete) {
    const button = document.createElement('button');
    button.className = 'todo-delete';
    button.textContent = '×';
    button.title = 'Delete task';
    button.addEventListener('click', onDelete);
    return button;
  }

  updateCount() {
    const progress = this.getProgress();
    const flavorText = this.generateFlavorText(progress);
    this.countElement.textContent = flavorText;
  }

  generateFlavorText(progress) {
    const { total, completed, remaining } = progress;
    
    if (total === 0) {
      return '✨ No tasks yet - ready to start!';
    } else if (completed === 0) {
      return `📝 ${total} task${total > 1 ? 's' : ''} waiting`;
    } else if (completed === total) {
      return `🎉 All ${total} task${total > 1 ? 's' : ''} completed!`;
    } else {
      return `📊 ${completed}/${total} done (${remaining} remaining)`;
    }
  }

  // Event handlers that can be overridden
  onToggle(index) {
    this.toggle(index);
  }

  onDelete(index) {
    this.delete(index);
  }

  sync(newTodos) {
    this.todos = DataValidationService.validateTodos(newTodos);
    this.updateUI();
    this.logger.log(`Synced ${this.todos.length} todos from another instance`);
  }
}

// ========== APPLICATION COORDINATOR (Dependency Inversion) ==========
class WaifuApp {
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
      
      // Initialize PanelManager first (for UI setup)
      if (window.PanelManager) {
        await window.PanelManager.init();
        window.PanelManager.setupKeyboardShortcuts();
      }
      
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

// ========== APPLICATION BOOTSTRAP ==========
(async function bootstrap() {
  // Dependency injection setup
  const logger = new ConsoleLogger();
  const storageProvider = new ChromeStorageProvider();
  
  // Create and initialize application
  const app = new WaifuApp(storageProvider, logger);
  
  try {
    await app.initialize();
  } catch (error) {
    logger.error(`Bootstrap failed: ${error.message}`);
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.destroy();
  });
})();
