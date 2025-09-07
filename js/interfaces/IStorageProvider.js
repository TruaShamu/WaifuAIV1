/**
 * Storage Provider Interface
 * Defines the contract for storage operations
 */

export class IStorageProvider {
  async load(key) { 
    throw new Error('Must implement load method'); 
  }
  
  async save(key, data) { 
    throw new Error('Must implement save method'); 
  }
  
  onChange(callback) { 
    throw new Error('Must implement onChange method'); 
  }
}
