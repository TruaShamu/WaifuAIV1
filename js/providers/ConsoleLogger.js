/**
 * Console Logger
 * Concrete implementation for console-based logging
 */

import { ILogger } from '../interfaces/ILogger.js';

export class ConsoleLogger extends ILogger {
  log(message) { 
    console.log(`[WaifuAI] ${message}`); 
  }
  
  error(message) { 
    console.error(`[WaifuAI ERROR] ${message}`); 
  }
  
  warn(message) { 
    console.warn(`[WaifuAI WARN] ${message}`); 
  }
}
