/**
 * Logger Interface
 * Defines the contract for logging operations
 */

export class ILogger {
  log(message) { 
    throw new Error('Must implement log method'); 
  }
  
  error(message) { 
    throw new Error('Must implement error method'); 
  }
  
  warn(message) { 
    throw new Error('Must implement warn method'); 
  }
}
