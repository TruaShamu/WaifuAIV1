/**
 * Data Validation Service
 * Provides validation and sanitization utilities
 */

import { Todo } from '../models/Todo.js';
import { CONFIG } from '../config.js';

export class DataValidationService {
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
