/**
 * Interaction Manager
 * Manages timed interaction opportunities with the waifu
 */

import { AnimationService } from '../services/AnimationService.js';

export class InteractionManager {
    constructor(logger, config = {}) {
        this.logger = logger;
        
        // Configuration with defaults
        this.config = {
            interactionInterval: config.interactionInterval || 5 * 60 * 1000, // 5 minutes default
            interactionReward: config.interactionReward || 10, // Higher reward for timed interactions
            indicatorDuration: config.indicatorDuration || 30 * 1000, // 30 seconds to interact
            maxMissedInteractions: config.maxMissedInteractions || 3,
            ...config
        };
        
        // State
        this.isInteractionAvailable = false;
        this.interactionTimer = null;
        this.indicatorTimer = null;
        this.missedInteractions = 0;
        this.totalInteractions = 0;
        this.successfulInteractions = 0;
        
        // UI elements
        this.waifuContainer = null;
        this.indicator = null;
        
        // Callbacks
        this.onInteractionCallback = null;
    }

    /**
     * Initialize the interaction manager
     * @param {HTMLElement} waifuContainer - The waifu container element
     * @param {Function} onInteraction - Callback when interaction occurs
     */
    initialize(waifuContainer, onInteraction) {
        this.waifuContainer = waifuContainer;
        this.onInteractionCallback = onInteraction;
        
        this.createIndicator();
        this.setupClickHandler();
        this.startInteractionTimer();
        
        this.logger.log('InteractionManager initialized');
    }

    /**
     * Create the interaction indicator element
     */
    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'interaction-indicator';
        this.indicator.innerHTML = '💖';
        this.indicator.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            width: 30px;
            height: 30px;
            background: linear-gradient(45deg, #ff69b4, #ff1493);
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 0 20px rgba(255, 105, 180, 0.6);
            animation: pulse 1s infinite;
            cursor: pointer;
            z-index: 1000;
            user-select: none;
        `;
        
        // Add CSS animation if not already present
        this.addIndicatorStyles();
        
        if (this.waifuContainer) {
            this.waifuContainer.style.position = 'relative';
            this.waifuContainer.appendChild(this.indicator);
        }
    }

    /**
     * Add CSS styles for the indicator
     */
    addIndicatorStyles() {
        const styleId = 'interaction-indicator-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.8;
                }
            }
            
            .interaction-indicator:hover {
                transform: scale(1.1);
                box-shadow: 0 0 25px rgba(255, 105, 180, 0.8);
            }
            
            .interaction-indicator:active {
                transform: scale(0.95);
            }
            
            @keyframes bounce-in {
                0% {
                    transform: scale(0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes fade-out {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                100% {
                    transform: scale(0.8);
                    opacity: 0;
                }
            }
            
            .interaction-indicator.appearing {
                animation: bounce-in 0.5s ease-out;
            }
            
            .interaction-indicator.disappearing {
                animation: fade-out 0.3s ease-in;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Set up click handler for the indicator
     */
    setupClickHandler() {
        if (this.indicator) {
            this.indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleInteraction();
            });
        }
    }

    /**
     * Start the interaction timer
     */
    startInteractionTimer() {
        this.stopInteractionTimer();
        
        this.interactionTimer = setTimeout(() => {
            this.showInteractionOpportunity();
        }, this.config.interactionInterval);
        
        this.logger.log(`Next interaction opportunity in ${this.config.interactionInterval / 1000}s`);
    }

    /**
     * Stop the interaction timer
     */
    stopInteractionTimer() {
        if (this.interactionTimer) {
            clearTimeout(this.interactionTimer);
            this.interactionTimer = null;
        }
    }

    /**
     * Show an interaction opportunity
     */
    showInteractionOpportunity() {
        if (this.isInteractionAvailable) return;
        
        this.isInteractionAvailable = true;
        this.totalInteractions++;
        
        // Show the indicator
        this.showIndicator();
        
        // Set up timeout to hide the indicator
        this.indicatorTimer = setTimeout(() => {
            this.hideInteractionOpportunity(true); // true = missed
        }, this.config.indicatorDuration);
        
        this.logger.log('Interaction opportunity available');
    }

    /**
     * Show the interaction indicator
     */
    showIndicator() {
        if (this.indicator) {
            this.indicator.classList.add('appearing');
            this.indicator.style.display = 'flex';
            
            // Remove appearing class after animation
            setTimeout(() => {
                this.indicator.classList.remove('appearing');
            }, 500);
        }
    }

    /**
     * Hide the interaction opportunity
     * @param {boolean} missed - Whether the interaction was missed
     */
    hideInteractionOpportunity(missed = false) {
        if (!this.isInteractionAvailable) return;
        
        this.isInteractionAvailable = false;
        
        // Clear the indicator timer
        if (this.indicatorTimer) {
            clearTimeout(this.indicatorTimer);
            this.indicatorTimer = null;
        }
        
        // Hide the indicator
        this.hideIndicator();
        
        if (missed) {
            this.missedInteractions++;
            this.logger.log(`Interaction missed (${this.missedInteractions}/${this.config.maxMissedInteractions})`);
            
            // Optionally adjust timing based on missed interactions
            this.handleMissedInteraction();
        }
        
        // Schedule next interaction
        this.startInteractionTimer();
    }

    /**
     * Hide the interaction indicator
     */
    hideIndicator() {
        if (this.indicator) {
            this.indicator.classList.add('disappearing');
            
            setTimeout(() => {
                this.indicator.style.display = 'none';
                this.indicator.classList.remove('disappearing');
            }, 300);
        }
    }

    /**
     * Handle a successful interaction
     */
    handleInteraction() {
        if (!this.isInteractionAvailable) return;
        
        this.successfulInteractions++;
        
        // Trigger the interaction callback
        if (this.onInteractionCallback) {
            this.onInteractionCallback(this.config.interactionReward);
        }
        
        // Hide the opportunity
        this.hideInteractionOpportunity(false);
        
        // Add some visual feedback
        this.showInteractionFeedback();
        
        this.logger.log(`Interaction successful! +${this.config.interactionReward} affection`);
    }

    /**
     * Show visual feedback for successful interaction
     */
    showInteractionFeedback() {
        if (!this.waifuContainer) return;
        
        // Create floating text
        const feedback = document.createElement('div');
        feedback.textContent = `+${this.config.interactionReward} 💖`;
        feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff69b4;
            font-weight: bold;
            font-size: 18px;
            pointer-events: none;
            z-index: 1001;
            animation: float-up 2s ease-out forwards;
        `;
        
        // Add float-up animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float-up {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -150%) scale(1.2);
                }
            }
        `;
        document.head.appendChild(style);
        
        this.waifuContainer.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 2000);
        
        // Bounce the waifu
        const waifuImage = this.waifuContainer.querySelector('img');
        if (waifuImage) {
            AnimationService.bounce(waifuImage);
        }
    }

    /**
     * Handle missed interactions
     */
    handleMissedInteraction() {
        // If too many missed interactions, slightly reduce the interval
        if (this.missedInteractions >= this.config.maxMissedInteractions) {
            const reduction = Math.min(0.8, this.missedInteractions * 0.1);
            this.config.interactionInterval *= (1 - reduction);
            this.missedInteractions = 0; // Reset counter
            
            this.logger.log(`Interaction interval reduced to ${this.config.interactionInterval / 1000}s due to missed interactions`);
        }
    }

    /**
     * Get interaction statistics
     */
    getStats() {
        return {
            totalInteractions: this.totalInteractions,
            successfulInteractions: this.successfulInteractions,
            missedInteractions: this.missedInteractions,
            successRate: this.totalInteractions > 0 ? 
                (this.successfulInteractions / this.totalInteractions * 100).toFixed(1) + '%' : '0%',
            nextInteractionIn: this.interactionTimer ? 
                Math.ceil((this.config.interactionInterval - (Date.now() % this.config.interactionInterval)) / 1000) : 0
        };
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.logger.log('InteractionManager configuration updated');
    }

    /**
     * Force an interaction opportunity (for testing)
     */
    forceInteraction() {
        this.showInteractionOpportunity();
    }

    /**
     * Reset all statistics
     */
    resetStats() {
        this.totalInteractions = 0;
        this.successfulInteractions = 0;
        this.missedInteractions = 0;
        this.logger.log('Interaction statistics reset');
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.stopInteractionTimer();
        
        if (this.indicatorTimer) {
            clearTimeout(this.indicatorTimer);
        }
        
        if (this.indicator && this.indicator.parentNode) {
            this.indicator.parentNode.removeChild(this.indicator);
        }
        
        this.logger.log('InteractionManager cleaned up');
    }
}
