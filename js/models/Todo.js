/**
 * Todo Domain Model
 * Represents a single todo item with its operations
 */

export class Todo {
  constructor(text, id = null, completed = false, createdAt = null) {
    this.text = String(text || '').trim();
    this.completed = Boolean(completed);
    this.id = id || Date.now();
    this.createdAt = createdAt || new Date().toISOString();
  }

  static fromObject(obj) {
    if (!obj || typeof obj !== 'object' || !obj.text) {
      return null;
    }
    return new Todo(obj.text, obj.id, obj.completed, obj.createdAt);
  }

  toggle() {
    this.completed = !this.completed;
    return this.completed;
  }

  isValid() {
    return this.text.length > 0;
  }
}
