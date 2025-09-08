/**
 * Tooltip Manager
 * Manages tooltip display, positioning, and animations
 */

import { BaseManager } from './BaseManager.js';
import { AnimationService } from '../services/AnimationService.js';
import { DataValidationService } from '../services/DataValidationService.js';

export class TooltipManager extends BaseManager {
  constructor(dependencies) {
    super(dependencies);
    
    this.tooltip = null;
    this.isVisible = false;
    this.hideTimeout = null;
    this.currentQuote = '';
  }

  /**
   * Initialization logic
   */
  async onInitialize() {
    this.createTooltipElement();
    this.logger.log('Tooltip manager ready');
  }

  /**
   * Cleanup logic
   */
  async onDestroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }

  createTooltipElement() {
    // Remove existing tooltip if any
    const existing = document.getElementById('waifu-tooltip');
    if (existing) {
      existing.remove();
    }

    // Create tooltip element
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'waifu-tooltip';
    this.tooltip.className = 'waifu-tooltip hidden';
    
    // Create speech bubble structure
    this.tooltip.innerHTML = `
      <div class="tooltip-content">
        <span class="tooltip-text"></span>
        <div class="tooltip-arrow"></div>
      </div>
    `;
    
    // Add click handler to hide tooltip
    this.tooltip.addEventListener('click', () => {
      this.hide();
      this.logger.log('Tooltip dismissed by click');
    });
    
    // Add visual feedback for clickability
    this.tooltip.style.cursor = 'pointer';
    
    document.body.appendChild(this.tooltip);
    this.logger.log('Tooltip element created with click handler');
  }

  show(text, duration = 4000, targetElement = null) {
    if (!this.tooltip) {
      this.createTooltipElement();
    }

    // Validate text parameter
    const validation = DataValidationService.validateText(text, { 
      required: true,
      maxLength: 500 
    });
    
    if (!validation.isValid) {
      this.logger.error('TooltipManager.show() called with invalid text:', validation.error);
      return;
    }

    const validatedText = validation.value;

    // Clear any existing hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    // Update text
    const textElement = this.tooltip.querySelector('.tooltip-text');
    textElement.textContent = validatedText;
    this.currentQuote = validatedText;

    // Position tooltip
    this.positionTooltip(targetElement);

    // Show with animation
    this.tooltip.classList.remove('hidden');
    this.tooltip.classList.add('visible');
    this.isVisible = true;

    // Add floating animation
    AnimationService.addFloatingAnimation(this.tooltip);

    this.logger.log(`Showing tooltip: ${validatedText.substring(0, 30)}...`);

    // Auto-hide after duration
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    if (!this.tooltip || !this.isVisible) return;

    this.tooltip.classList.remove('visible');
    this.tooltip.classList.add('hidden');
    this.isVisible = false;

    // Remove floating animation
    AnimationService.removeFloatingAnimation(this.tooltip);

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    this.logger.log('Tooltip hidden');
  }

  positionTooltip(targetElement = null) {
    if (!this.tooltip) return;

    // Default to waifu container if no target specified
    const target = targetElement || document.getElementById('waifu-container');
    if (!target) {
      // Fallback to center of screen
      this.tooltip.style.top = '50px';
      this.tooltip.style.left = '50%';
      this.tooltip.style.transform = 'translateX(-50%)';
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    // Position above the target element
    const top = targetRect.top - tooltipRect.height - 10;
    const left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    
    // Adjust if tooltip would go off screen
    const adjustedLeft = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
    const adjustedTop = Math.max(10, top);
    
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.top = `${adjustedTop}px`;
    this.tooltip.style.left = `${adjustedLeft}px`;
    this.tooltip.style.transform = 'none';
  }

  isCurrentlyVisible() {
    return this.isVisible;
  }

  getCurrentQuote() {
    return this.currentQuote;
  }

  updatePosition() {
    if (this.isVisible) {
      this.positionTooltip();
    }
  }

  destroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
    
    this.isVisible = false;
    this.logger.log('Tooltip manager destroyed');
  }
}
