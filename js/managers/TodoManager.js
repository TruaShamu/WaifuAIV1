/**
 * Todo Manager
 * Handles todo CRUD operations, rendering, and persistence
 */

import { Todo } from '../models/Todo.js';
import { DataValidationService } from '../services/DataValidationService.js';
import { AnimationService } from '../services/AnimationService.js';

export class TodoManager {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    this.todos = [];
    this.listElement = null;
    this.countElement = null;
  }

  setUIElements(listElement, countElement) {
    this.listElement = listElement;
    this.countElement = countElement;
  }

  async load() {
    try {
      const rawTodos = await this.storageProvider.load('todos') || [];
      this.todos = DataValidationService.validateTodos(rawTodos);
      this.updateUI();
      this.logger.log(`Loaded ${this.todos.length} todos`);
    } catch (error) {
      this.logger.error(`Failed to load todos: ${error.message}`);
      this.todos = [];
    }
  }

  async save() {
    try {
      const todoData = this.todos.map(todo => ({
        text: todo.text,
        completed: todo.completed,
        id: todo.id,
        createdAt: todo.createdAt
      }));
      
      await this.storageProvider.save('todos', todoData);
      await this.storageProvider.save('lastSaved', new Date().toISOString());
      this.logger.log(`Saved ${this.todos.length} todos`);
    } catch (error) {
      this.logger.error(`Failed to save todos: ${error.message}`);
      // Try to save essential data only
      await this.saveEssentialData();
    }
  }

  async saveEssentialData() {
    try {
      const essentialTodos = this.todos.map(todo => ({
        text: todo.text,
        completed: todo.completed,
        id: todo.id
      }));
      await this.storageProvider.save('todos', essentialTodos);
      this.logger.warn('Saved essential todos only due to storage constraints');
    } catch (error) {
      this.logger.error(`Failed to save even essential data: ${error.message}`);
    }
  }

  add(text) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return false;
    }

    const todo = new Todo(text.trim());
    this.todos.push(todo);
    this.save();
    this.updateUI();
    this.logger.log(`Added todo: ${todo.text}`);
    return true;
  }

  toggle(index) {
    if (index < 0 || index >= this.todos.length) {
      this.logger.error(`Invalid todo index: ${index}`);
      return false;
    }

    const todo = this.todos[index];
    const wasCompleted = todo.completed;
    const isNowCompleted = todo.toggle();
    
    this.save();
    this.updateUI();
    
    this.logger.log(`Toggled todo ${index}: ${todo.text} - ${isNowCompleted ? 'completed' : 'uncompleted'}`);
    
    // Return completion status change for affection handling
    return !wasCompleted && isNowCompleted;
  }

  async delete(index) {
    if (index < 0 || index >= this.todos.length) {
      this.logger.error(`Invalid todo index: ${index}`);
      return false;
    }

    const todoItems = this.listElement.querySelectorAll('.todo-item');
    const todoItem = todoItems[index];
    
    if (todoItem) {
      await AnimationService.slideOut(todoItem);
    }
    
    const deletedTodo = this.todos.splice(index, 1)[0];
    this.save();
    this.updateUI();
    this.logger.log(`Deleted todo: ${deletedTodo.text}`);
    return true;
  }

  getProgress() {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;
    return { total, completed, remaining: total - completed };
  }

  updateUI() {
    if (!this.listElement || !this.countElement) return;
    
    this.renderList();
    this.updateCount();
  }

  renderList() {
    this.listElement.innerHTML = '';
    
    this.todos.forEach((todo, index) => {
      const li = this.createTodoElement(todo, index);
      this.listElement.appendChild(li);
      AnimationService.fadeIn(li);
    });
  }

  createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    const checkbox = this.createCheckbox(todo.completed, () => this.onToggle(index));
    const textSpan = this.createTextSpan(todo.text);
    const deleteBtn = this.createDeleteButton(() => this.onDelete(index));
    
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    
    return li;
  }

  createCheckbox(checked, onToggle) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = checked;
    checkbox.addEventListener('change', onToggle);
    return checkbox;
  }

  createTextSpan(text) {
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = text;
    return span;
  }

  createDeleteButton(onDelete) {
    const button = document.createElement('button');
    button.className = 'todo-delete';
    button.textContent = '×';
    button.title = 'Delete task';
    button.addEventListener('click', onDelete);
    return button;
  }

  updateCount() {
    const progress = this.getProgress();
    const flavorText = this.generateFlavorText(progress);
    this.countElement.textContent = flavorText;
  }

  generateFlavorText(progress) {
    const { total, completed, remaining } = progress;
    
    if (total === 0) {
      return '✨ No tasks yet - ready to start!';
    } else if (completed === 0) {
      return `📝 ${total} task${total > 1 ? 's' : ''} waiting`;
    } else if (completed === total) {
      return `🎉 All ${total} task${total > 1 ? 's' : ''} completed!`;
    } else {
      return `📊 ${completed}/${total} done (${remaining} remaining)`;
    }
  }

  // Event handlers that can be overridden
  onToggle(index) {
    this.toggle(index);
  }

  onDelete(index) {
    this.delete(index);
  }

  sync(newTodos) {
    this.todos = DataValidationService.validateTodos(newTodos);
    this.updateUI();
    this.logger.log(`Synced ${this.todos.length} todos from another instance`);
  }
}
