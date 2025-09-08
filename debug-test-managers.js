/**
 * Simple test to debug manager initialization issues
 */

// Import the main dependencies
import { WaifuApp } from './js/WaifuApp.js';
import { ChromeStorageProvider } from './js/providers/ChromeStorageProvider.js';
import { ConsoleLogger } from './js/providers/ConsoleLogger.js';

console.log('Starting WaifuAI Debug Test...');

try {
  // Mock chrome API for testing
  if (typeof chrome === 'undefined') {
    window.chrome = {
      storage: {
        local: {
          get: (keys, callback) => callback({}),
          set: (data, callback) => callback && callback(),
          getBytesInUse: (keys, callback) => callback(0),
          QUOTA_BYTES: 5242880
        }
      }
    };
  }

  // Create mock DOM elements for testing
  if (!document.getElementById('todo-list')) {
    const todoList = document.createElement('div');
    todoList.id = 'todo-list';
    document.body.appendChild(todoList);
  }

  if (!document.getElementById('task-count')) {
    const taskCount = document.createElement('div');
    taskCount.id = 'task-count';
    document.body.appendChild(taskCount);
  }

  if (!document.getElementById('waifu-sprite')) {
    const waifuSprite = document.createElement('div');
    waifuSprite.id = 'waifu-sprite';
    document.body.appendChild(waifuSprite);
  }

  // Create dependencies
  const storageProvider = new ChromeStorageProvider();
  const logger = new ConsoleLogger();
  
  console.log('Dependencies created:', { storageProvider, logger });
  
  // Create and test app
  const app = new WaifuApp(storageProvider, logger);
  console.log('WaifuApp created:', app);
  
  // Test initialization
  app.initialize().then(() => {
    console.log('✅ WaifuApp initialized successfully!');
    console.log('Managers:', app.managers);
    console.log('TodoManager:', app.todoManager);
    
    // Test addTodo
    if (app.todoManager) {
      console.log('Testing addTodo...');
      const result = app.todoManager.add('Test todo item');
      console.log('AddTodo result:', result);
    }
    
  }).catch(error => {
    console.error('❌ WaifuApp initialization failed:', error);
    console.error('Stack trace:', error.stack);
  });
  
} catch (error) {
  console.error('❌ Setup failed:', error);
  console.error('Stack trace:', error.stack);
}
