/**
 * 🧠 Context-Aware Quote Manager
 * Provides intelligent, context-sensitive quotes based on user's current activity
 */

import { TabSpyService } from './TabSpyService.js';
import { DataValidationService } from './DataValidationService.js';
import { 
  CONTEXT_AWARE_CONFIG, 
  validateConfig, 
  mergeConfig, 
  getDefaultConfig 
} from '../config/ContextAwareConfig.js';

export class ContextAwareQuoteManager {
  constructor(logger, quoteService) {
    this.logger = logger;
    this.quoteService = quoteService;
    this.tabSpy = new TabSpyService(logger);
    this.isEnabled = true;
    this.config = getDefaultConfig();
    
    // Track user patterns for smarter quotes
    this.patterns = {
      sessionStart: Date.now(),
      siteSwitches: 0,
      productiveTime: 0,
      distractedTime: 0,
      lastProductivityCheck: Date.now()
    };
  }

  /**
   * Initialize the context-aware system
   */
  async initialize() {
    await this.tabSpy.initialize();
    
    // Listen for tab changes to update patterns
    this.tabSpy.addObserver((event, data) => {
      this.handleTabChange(event, data);
    });
    
    // Start productivity tracking
    this.startProductivityTracking();
    
    this.logger.log('🧠 Context-aware quote manager initialized');
  }

  /**
   * Handle tab change events
   */
  handleTabChange(event, data) {
    if (event === 'tab_changed') {
      this.patterns.siteSwitches++;
      
      // Update time tracking
      const now = Date.now();
      const timeDiff = now - this.patterns.lastProductivityCheck;
      
      if (data.previous) {
        if (['productivity', 'learning'].includes(data.previous.category)) {
          this.patterns.productiveTime += timeDiff;
        } else if (['social', 'entertainment'].includes(data.previous.category)) {
          this.patterns.distractedTime += timeDiff;
        }
      }
      
      this.patterns.lastProductivityCheck = now;
      
      const productiveMinutes = Math.round(this.patterns.productiveTime / this.config.TIMERS.MILLISECONDS_PER_MINUTE);
      this.logger.log(`🧠 Tab pattern update: ${this.patterns.siteSwitches} switches, ${productiveMinutes}m productive`);
    }
  }

  /**
   * Get context-aware quote with personality
   */
  getContextualQuote() {
    if (!this.isEnabled) {
      return this.quoteService.getRandomQuote();
    }

    const context = this.tabSpy.getContext();
    const productivity = this.getProductivityInsight();
    
    // Choose quote strategy based on context using configuration thresholds
    if (context?.isDistraction && productivity.score < this.config.THRESHOLDS.LOW_PRODUCTIVITY_SCORE) {
      return this.getMotivationalQuote(context);
    } else if (context?.isProductive) {
      return this.getEncouragementQuote(context);
    } else if (this.tabSpy.isDistractedTooLong(this.config.TIMERS.DISTRACTION_THRESHOLD)) {
      return this.getGentleNudgeQuote();
    } else {
      return this.getPersonalizedQuote(context, productivity);
    }
  }

  /**
   * Get motivational quote for when user is distracted
   */
  getMotivationalQuote(context) {
    const quotes = this.tabSpy.getMotivationalQuotes();
    
    if (quotes.length === 0) {
      // Fallback if dialogue not loaded
      return this.config.FALLBACK_QUOTES.motivational;
    }
    
    const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return this.addContextFlavor(selectedQuote, context);
  }

  /**
   * Get encouragement quote for productive work
   */
  getEncouragementQuote(context) {
    const quotes = this.tabSpy.getEncouragementQuotes();
    
    if (quotes.length === 0) {
      // Fallback if dialogue not loaded
      return this.config.FALLBACK_QUOTES.encouragement;
    }
    
    const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return this.addContextFlavor(selectedQuote, context);
  }

  /**
   * Get gentle nudge for when user has been distracted too long
   */
  getGentleNudgeQuote() {
    const quotes = this.tabSpy.getGentleNudgeQuotes();
    
    if (quotes.length === 0) {
      // Fallback if dialogue not loaded
      return this.config.FALLBACK_QUOTES.gentle_nudge;
    }
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  /**
   * Get personalized quote based on patterns and context
   */
  getPersonalizedQuote(context, productivity) {
    const sessionHours = (Date.now() - this.patterns.sessionStart) / this.config.TIMERS.MILLISECONDS_PER_HOUR;
    const switchFrequency = this.patterns.siteSwitches / Math.max(sessionHours, 0.1);
    
    // Get personalized pattern quotes from dialogue collection
    const personalizedQuotes = this.quoteService.getQuotesByCategory('personalized');
    
    // High switch frequency = scattered attention
    if (switchFrequency > this.config.THRESHOLDS.HIGH_SWITCH_FREQUENCY && personalizedQuotes.length > 0) {
      return personalizedQuotes[0] || this.config.FALLBACK_QUOTES.scattered_attention;
    }
    
    // Long session with good productivity
    if (sessionHours > this.config.THRESHOLDS.LONG_SESSION_HOURS && 
        productivity.score > this.config.THRESHOLDS.HIGH_PRODUCTIVITY_SCORE && 
        personalizedQuotes.length > 1) {
      return personalizedQuotes[1] || this.config.FALLBACK_QUOTES.productive_break;
    }
    
    // New session
    if (sessionHours < this.config.THRESHOLDS.NEW_SESSION_HOURS && personalizedQuotes.length > 2) {
      return personalizedQuotes[2] || this.config.FALLBACK_QUOTES.new_session;
    }
    
    // Default contextual quote
    const contextualQuotes = this.tabSpy.getContextualQuotes();
    if (contextualQuotes.length > 0) {
      return contextualQuotes[Math.floor(Math.random() * contextualQuotes.length)];
    }
    
    return this.quoteService.getRandomQuote();
  }

  /**
   * Add context-specific flavor to quotes
   */
  addContextFlavor(quote, context) {
    const validation = DataValidationService.validateText(quote, { required: true });
    
    if (!validation.isValid) {
      this.logger.error('addContextFlavor called with invalid quote:', validation.error);
      return this.config.FALLBACK_QUOTES.motivational || 'Stay focused! You can do this!';
    }
    
    const validatedQuote = validation.value;
    
    if (!context) return validatedQuote;
    
    const flavor = this.config.CONTEXT_FLAVORS[context.category];
    if (flavor) {
      const prefix = flavor.prefix[Math.floor(Math.random() * flavor.prefix.length)];
      const suffix = flavor.suffix[Math.floor(Math.random() * flavor.suffix.length)];
      return prefix + validatedQuote + suffix;
    }
    
    return validatedQuote;
  }

  /**
   * Get productivity insight based on current patterns
   */
  getProductivityInsight() {
    const totalTime = this.patterns.productiveTime + this.patterns.distractedTime;
    const score = totalTime > 0 ? this.patterns.productiveTime / totalTime : 0.5;
    
    return {
      score,
      productiveMinutes: Math.round(this.patterns.productiveTime / this.config.TIMERS.MILLISECONDS_PER_MINUTE),
      distractedMinutes: Math.round(this.patterns.distractedTime / this.config.TIMERS.MILLISECONDS_PER_MINUTE),
      siteSwitches: this.patterns.siteSwitches,
      sessionHours: (Date.now() - this.patterns.sessionStart) / this.config.TIMERS.MILLISECONDS_PER_HOUR
    };
  }

  /**
   * Get mood multiplier based on current context
   */
  getMoodMultiplier() {
    const context = this.tabSpy.getContext();
    if (!context) return 1.0;
    
    return this.config.MOOD_MULTIPLIERS[context.category] || 1.0;
  }

  /**
   * Start productivity tracking timer
   */
  startProductivityTracking() {
    setInterval(() => {
      const context = this.tabSpy.getContext();
      if (context) {
        const now = Date.now();
        const timeDiff = now - this.patterns.lastProductivityCheck;
        
        if (context.isProductive) {
          this.patterns.productiveTime += timeDiff;
        } else if (context.isDistraction) {
          this.patterns.distractedTime += timeDiff;
        }
        
        this.patterns.lastProductivityCheck = now;
      }
    }, this.config.TIMERS.PRODUCTIVITY_TRACKING_INTERVAL);
  }

  /**
   * Get detailed activity report
   */
  getActivityReport() {
    const insight = this.getProductivityInsight();
    const context = this.tabSpy.getContext();
    
    return {
      current: context,
      productivity: insight,
      patterns: this.patterns,
      recommendations: this.getRecommendations(insight, context)
    };
  }

  /**
   * Get smart recommendations based on activity
   */
  getRecommendations(insight, context) {
    const recs = [];
    
    if (insight.score < this.config.THRESHOLDS.LOW_PRODUCTIVITY_SCORE && 
        insight.sessionHours > 1) {
      recs.push("Consider a 5-minute break to refocus");
    }
    
    if (insight.siteSwitches > (this.config.THRESHOLDS.HIGH_SWITCH_FREQUENCY * 2) && 
        insight.sessionHours < this.config.THRESHOLDS.LONG_SESSION_HOURS) {
      recs.push("Try using a focus timer to reduce distractions");
    }
    
    if (context?.isDistraction && 
        insight.productiveMinutes > 60) {
      recs.push("You've earned this break! Enjoy it guilt-free");
    }
    
    if (insight.productiveMinutes > this.config.THRESHOLDS.BREAK_SUGGESTION_MINUTES) {
      recs.push("Amazing productivity! Consider a longer break");
    }
    
    return recs;
  }

  /**
   * Update configuration values
   * @param {Object} newConfig - Partial configuration object to merge
   */
  updateConfiguration(newConfig) {
    const mergedConfig = mergeConfig(newConfig);
    const validation = validateConfig(mergedConfig);
    
    if (!validation.isValid) {
      this.logger.error('Invalid configuration:', validation.errors);
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }
    
    this.config = mergedConfig;
    this.logger.log('🧠 Context-aware configuration updated and validated');
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration object
   */
  getConfiguration() {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Reset configuration to defaults
   */
  resetConfiguration() {
    this.config = getDefaultConfig();
    this.logger.log('🧠 Context-aware configuration reset to defaults');
  }

  /**
   * Load configuration preset
   * @param {string} presetName - Name of the preset (FOCUSED, RELAXED, BALANCED)
   */
  loadConfigurationPreset(presetName) {
    const { CONFIG_PRESETS } = require('../config/ContextAwareConfig.js');
    
    if (!CONFIG_PRESETS[presetName]) {
      throw new Error(`Unknown configuration preset: ${presetName}`);
    }
    
    this.updateConfiguration(CONFIG_PRESETS[presetName]);
    this.logger.log(`🧠 Loaded configuration preset: ${presetName}`);
  }

  /**
   * Add custom context flavor configuration
   * @param {string} category - Context category
   * @param {Object} flavor - Flavor object with prefix and suffix arrays
   */
  addCustomContextFlavor(category, flavor) {
    if (!this.config.CONTEXT_FLAVORS[category]) {
      this.config.CONTEXT_FLAVORS[category] = flavor;
      this.logger.log(`🧠 Added context flavor for category: ${category}`);
    }
  }

  /**
   * Disable context awareness
   */
  disable() {
    this.isEnabled = false;
    this.tabSpy.disable();
    this.logger.log('🧠 Context-aware quotes disabled');
  }

  /**
   * Enable context awareness
   */
  enable() {
    this.isEnabled = true;
    this.tabSpy.enable();
    this.logger.log('🧠 Context-aware quotes enabled');
  }
}
