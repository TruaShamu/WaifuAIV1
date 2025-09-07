/**
 * Affection Level Domain Model
 * Represents and manages affection level state
 */

import { CONFIG } from '../config.js';

export class AffectionLevel {
  constructor(level = 0, max = CONFIG.AFFECTION.MAX) {
    this.level = Math.max(0, Math.min(max, level));
    this.max = max;
  }

  increase(amount) {
    const oldLevel = this.level;
    this.level = Math.min(this.max, this.level + amount);
    return this.level !== oldLevel;
  }

  getPercentage() {
    return (this.level / this.max) * 100;
  }

  getMoodLevel() {
    if (this.level >= CONFIG.AFFECTION_LEVELS.VERY_HIGH) return 'very_high';
    if (this.level >= CONFIG.AFFECTION_LEVELS.HIGH) return 'high';
    if (this.level >= CONFIG.AFFECTION_LEVELS.MEDIUM) return 'medium';
    if (this.level >= CONFIG.AFFECTION_LEVELS.LOW) return 'low';
    return 'very_low';
  }
}
