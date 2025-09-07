/**
 * Waifu AI Main Bootstrap
 * Entry point for the modular application
 */

import { WaifuApp } from './WaifuApp.js';
import { ChromeStorageProvider } from './providers/ChromeStorageProvider.js';
import { ConsoleLogger } from './providers/ConsoleLogger.js';

// Load PanelManager as a script (not ES module)
const panelManagerScript = document.createElement('script');
panelManagerScript.src = './js/managers/PanelManager.js';
document.head.appendChild(panelManagerScript);

// Initialize the application
let app = null;

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait for PanelManager script to load
    await new Promise((resolve) => {
      if (panelManagerScript.readyState === 'complete' || window.PanelManager) {
        resolve();
      } else {
        panelManagerScript.onload = resolve;
      }
    });
    
    // Create dependencies
    const storageProvider = new ChromeStorageProvider();
    const logger = new ConsoleLogger();
    
    // Create and initialize app
    app = new WaifuApp(storageProvider, logger);
    await app.initialize();
    
    // Make app globally accessible for testing
    window.app = app;
    
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
