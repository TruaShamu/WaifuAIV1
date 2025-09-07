/**
 * Chrome Storage Provider
 * Concrete implementation for Chrome extension storage
 */

import { IStorageProvider } from '../interfaces/IStorageProvider.js';

export class ChromeStorageProvider extends IStorageProvider {
  async get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage load error: ${chrome.runtime.lastError.message}`));
        } else {
          resolve(result);
        }
      });
    });
  }

  async set(key, data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage save error: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  async load(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage load error: ${chrome.runtime.lastError.message}`));
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  async save(key, data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Storage save error: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
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
