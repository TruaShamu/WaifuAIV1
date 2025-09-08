/**
 * Waifu Sprite Manager
 * Manages sprite cycling, mood-based sprite selection, and interactions
 */

import { BaseManager } from './BaseManager.js';
import { CONFIG } from '../config.js';
import { AnimationService } from '../services/AnimationService.js';

export class WaifuSpriteManager extends BaseManager {
  constructor(dependencies) {
    super(dependencies);
    
    this.imageElement = dependencies.waifuSprite || dependencies.imageElement;
    this.currentSprite = CONFIG.SPRITES[0];
    this.cycleInterval = null;
  }

  /**
   * Initialization logic
   */
  async onInitialize() {
    if (this.imageElement) {
      this.imageElement.src = this.currentSprite;
    }
    this.logger.log('Waifu sprite manager ready');
  }

  /**
   * Cleanup logic
   */
  async onDestroy() {
    this.stopCycling();
  }

  startCycling() {
    this.cycleInterval = setInterval(() => {
      this.cycleRandomSprite();
    }, CONFIG.SPRITE_CYCLE_INTERVAL);
  }

  stopCycling() {
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
  }

  updateCycleInterval(newInterval) {
    this.stopCycling();
    this.cycleInterval = setInterval(() => {
      this.cycleRandomSprite();
    }, newInterval);
    this.logger.log(`Sprite cycle interval updated to ${newInterval}ms`);
  }

  cycleRandomSprite() {
    const randomIndex = Math.floor(Math.random() * CONFIG.SPRITES.length);
    this.setSprite(CONFIG.SPRITES[randomIndex]);
  }

  setSprite(spritePath) {
    this.currentSprite = spritePath;
    this.imageElement.src = spritePath;
    this.logger.log(`Sprite changed to: ${spritePath}`);
  }

  setSpriteByMood(taskProgress, affectionMood) {
    let sprite;
    
    // Task-based mood has priority
    if (taskProgress.total === 0) {
      sprite = 'assets/saber_neutral.png';
    } else if (taskProgress.completed === taskProgress.total) {
      sprite = 'assets/saber_happy.png';
    } else if (taskProgress.completed === 0) {
      sprite = 'assets/saber_pouting.png';
    } else {
      // Use affection-based mood for partial completion
      switch (affectionMood) {
        case 'very_high':
          sprite = 'assets/saber_happy.png';
          break;
        case 'high':
        case 'medium':
          sprite = 'assets/saber_neutral.png';
          break;
        default:
          sprite = 'assets/saber_pouting.png';
      }
    }
    
    this.setSprite(sprite);
  }

  addClickHandler(callback) {
    this.imageElement.addEventListener('click', () => {
      AnimationService.bounce(this.imageElement);
      callback();
    });
  }
}
