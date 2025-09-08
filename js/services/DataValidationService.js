/**
 * Data Validation Service
 * Provides validation and sanitization utilities
 */

import { Todo } from '../models/Todo.js';
import { CONFIG } from '../config.js';

export class DataValidationService {
  // Existing methods
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

  // Settings validation schema
  static SETTINGS_SCHEMA = {
    numeric: {
      pomodoroWorkDuration: { min: 1, max: 120, default: 25 },
      pomodoroShortBreak: { min: 1, max: 30, default: 5 },
      pomodoroLongBreak: { min: 1, max: 60, default: 15 },
      pomodoroSessionsUntilLongBreak: { min: 2, max: 10, default: 4 },
      affectionTaskCompletion: { min: 1, max: 100, default: 10 },
      affectionWaifuClick: { min: 1, max: 50, default: 5 },
      affectionPomodoroWork: { min: 1, max: 50, default: 15 },
      affectionPomodoroBreak: { min: 1, max: 25, default: 5 },
      quoteRandomInterval: { min: 5, max: 300, default: 60 },
      quoteDisplayDuration: { min: 1, max: 30, default: 4 },
      quoteEventDuration: { min: 1, max: 30, default: 6 },
      spriteCycleInterval: { min: 1, max: 60, default: 30 },
      aiDialoguePercentage: { min: 0, max: 100, default: 25 }
    },
    boolean: [
      'pomodoroNotificationsEnabled', 'pomodoroAutoStartBreaks', 'pomodoroAutoStartWork',
      'quoteAutoEnabled', 'enableExperimentalFeatures', 'enableDebugMode',
      'enableSoundEffects', 'enableVoiceQuotes', 'enableCustomThemes', 'enableAdvancedStats'
    ]
  };

  /**
   * Comprehensive settings validation with bounds checking
   */
  static validateSettings(settings) {
    const validated = {};
    const errors = [];

    // Validate numeric settings
    Object.entries(this.SETTINGS_SCHEMA.numeric).forEach(([key, schema]) => {
      if (settings[key] !== undefined) {
        const value = this.validateNumeric(settings[key], schema);
        if (value.isValid) {
          validated[key] = value.value;
        } else {
          errors.push(`${key}: ${value.error}`);
        }
      }
    });

    // Validate boolean settings
    this.SETTINGS_SCHEMA.boolean.forEach(key => {
      if (settings[key] !== undefined) {
        const value = this.validateBoolean(settings[key]);
        if (value.isValid) {
          validated[key] = value.value;
        } else {
          errors.push(`${key}: ${value.error}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      validated,
      errors
    };
  }

  /**
   * Validate numeric value with bounds
   */
  static validateNumeric(value, schema) {
    const { min, max, default: defaultValue } = schema;
    
    // Convert to number
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `must be a valid number, using default: ${defaultValue}`,
        value: defaultValue
      };
    }
    
    if (numValue < min || numValue > max) {
      return {
        isValid: false,
        error: `must be between ${min} and ${max}`,
        value: Math.max(min, Math.min(max, numValue))
      };
    }
    
    return {
      isValid: true,
      value: numValue
    };
  }

  /**
   * Validate boolean value
   */
  static validateBoolean(value) {
    if (typeof value === 'boolean') {
      return { isValid: true, value };
    }
    
    // Handle string representations
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true') return { isValid: true, value: true };
      if (lower === 'false') return { isValid: true, value: false };
    }
    
    return {
      isValid: false,
      error: 'must be a boolean value',
      value: false
    };
  }

  /**
   * Validate text input (non-empty string)
   */
  static validateText(text, options = {}) {
    const { minLength = 1, maxLength = 1000, required = true } = options;
    
    if (!text || typeof text !== 'string') {
      return {
        isValid: !required,
        error: 'must be a valid string',
        value: ''
      };
    }
    
    const trimmed = text.trim();
    
    if (required && trimmed.length === 0) {
      return {
        isValid: false,
        error: 'cannot be empty',
        value: trimmed
      };
    }
    
    if (trimmed.length < minLength) {
      return {
        isValid: false,
        error: `must be at least ${minLength} characters`,
        value: trimmed
      };
    }
    
    if (trimmed.length > maxLength) {
      return {
        isValid: false,
        error: `must be no more than ${maxLength} characters`,
        value: trimmed.substring(0, maxLength)
      };
    }
    
    return {
      isValid: true,
      value: trimmed
    };
  }

  /**
   * Validate array with optional element validation
   */
  static validateArray(arr, elementValidator = null) {
    if (!Array.isArray(arr)) {
      return {
        isValid: false,
        error: 'must be an array',
        value: []
      };
    }
    
    if (!elementValidator) {
      return { isValid: true, value: arr };
    }
    
    const validatedElements = [];
    const errors = [];
    
    arr.forEach((element, index) => {
      const result = elementValidator(element);
      if (result.isValid) {
        validatedElements.push(result.value);
      } else {
        errors.push(`Element ${index}: ${result.error}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      value: validatedElements,
      errors
    };
  }

  /**
   * Sanitize HTML input to prevent XSS
   */
  static sanitizeHtml(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Parse integer with fallback
   */
  static safeParseInt(value, fallback = 0) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Parse float with fallback
   */
  static safeParseFloat(value, fallback = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Validate email format (basic)
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = typeof email === 'string' && emailRegex.test(email);
    
    return {
      isValid,
      error: isValid ? null : 'must be a valid email address',
      value: isValid ? email.toLowerCase().trim() : ''
    };
  }

  /**
   * Validate URL format
   */
  static validateUrl(url) {
    try {
      new URL(url);
      return { isValid: true, value: url };
    } catch {
      return {
        isValid: false,
        error: 'must be a valid URL',
        value: ''
      };
    }
  }
}
