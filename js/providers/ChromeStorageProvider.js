/**
 * Chrome Storage Provider
 * Concrete implementation for Chrome extension storage
 */

import { IStorageProvider } from '../interfaces/IStorageProvider.js';

export class ChromeStorageProvider extends IStorageProvider {
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          throw new Error(`Storage load error: ${chrome.runtime.lastError.message}`);
        }
        resolve(result);
      });
    });
  }

  async set(key, data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          throw new Error(`Storage save error: ${chrome.runtime.lastError.message}`);
        }
        resolve();
      });
    });
  }

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
