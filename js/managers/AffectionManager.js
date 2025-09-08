/**
 * Affection Manager
 * Manages affection levels, persistence, and UI updates
 */

import { BaseManager } from './BaseManager.js';
import { AffectionLevel } from '../models/AffectionLevel.js';
import { DataValidationService } from '../services/DataValidationService.js';
import { AnimationService } from '../services/AnimationService.js';

export class AffectionManager extends BaseManager {
  constructor(dependencies) {
    super(dependencies);
    
    this.affection = new AffectionLevel();
    this.fillElement = null;
    this.textElement = null;
  }

  /**
   * Initialization logic
   */
  async onInitialize() {
    this.logger.log('Affection manager ready');
  }

  /**
   * Data loading logic
   */
  async onLoad() {
    try {
      const level = await this.storageProvider.load('affectionLevel') || 0;
      this.affection = new AffectionLevel(DataValidationService.validateAffectionLevel(level));
      this.updateUI();
      this.logger.log(`Loaded affection level: ${this.affection.level}`);
    } catch (error) {
      this.logger.error(`Failed to load affection: ${error.message}`);
      this.affection = new AffectionLevel();
    }
  }

  /**
   * Data saving logic
   */
  async onSave() {
    try {
      await this.storageProvider.save('affectionLevel', this.affection.level);
      this.logger.log(`Saved affection level: ${this.affection.level}`);
    } catch (error) {
      this.logger.error(`Failed to save affection: ${error.message}`);
    }
  }

  /**
   * UI elements setup - backward compatible and new pattern
   */
  onUIElementsSet(elements) {
    this.fillElement = elements.fill;
    this.textElement = elements.text;
    this.updateUI();
  }

  setUIElements(fillElement, textElement) {
    this.fillElement = fillElement;
    this.textElement = textElement;
    this.updateUI();
  }

  increase(amount, container = null) {
    if (this.affection.increase(amount)) {
      this.updateUI();
      this.triggerShimmerEffect(); // Add shimmer effect on increase
      this.save();
      
      if (container) {
        AnimationService.createAffectionBoost(container, amount);
      }
      
      this.logger.log(`Affection increased by ${amount} to ${this.affection.level}`);
      return true;
    }
    return false;
  }

  triggerShimmerEffect() {
    if (!this.fillElement) return;
    
    // Add shimmer class
    this.fillElement.classList.add('affection-boost');
    
    // Remove the class after animation completes
    setTimeout(() => {
      this.fillElement.classList.remove('affection-boost');
    }, 1500); // Match the CSS animation duration
  }

  updateUI() {
    if (!this.fillElement || !this.textElement) return;
    
    const percentage = this.affection.getPercentage();
    this.fillElement.style.width = `${percentage}%`;
    this.textElement.textContent = this.affection.level;
    
    // Update color based on level
    const mood = this.affection.getMoodLevel();
    const colors = {
      very_high: 'linear-gradient(90deg, #ff1493 0%, #ff69b4 50%, #ffc0cb 100%)',
      high: 'linear-gradient(90deg, #ff69b4 0%, #ff1493 50%, #ff69b4 100%)',
      medium: 'linear-gradient(90deg, #ff69b4 0%, #ff69b4 50%, #ff8fa3 100%)',
      low: 'linear-gradient(90deg, #ff69b4 0%, #ff8fa3 50%, #ffb6c1 100%)',
      very_low: 'linear-gradient(90deg, #666 0%, #888 50%, #666 100%)'
    };
    
    this.fillElement.style.background = colors[mood];
  }

  getMoodLevel() {
    return this.affection.getMoodLevel();
  }

  getLevel() {
    return this.affection.level;
  }

  sync(newLevel) {
    this.affection = new AffectionLevel(newLevel);
    this.updateUI();
    this.logger.log(`Synced affection level: ${this.affection.level}`);
  }
}
