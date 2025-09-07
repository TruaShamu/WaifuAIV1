/**
 * Waifu AI Main Bootstrap
 * Entry point for the modular application
 */

import { WaifuApp } from './WaifuApp.js';
import { ChromeStorageProvider } from './providers/ChromeStorageProvider.js';
import { ConsoleLogger } from './providers/ConsoleLogger.js';

// Initialize the application
let app = null;

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Create dependencies
    const storageProvider = new ChromeStorageProvider();
    const logger = new ConsoleLogger();
    
    // Create and initialize app
    app = new WaifuApp(storageProvider, logger);
    await app.initialize();
    
  } catch (error) {
    console.error('Failed to start Waifu AI:', error);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy();
  }
});
