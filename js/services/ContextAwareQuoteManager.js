/**
 * 🧠 Context-Aware Quote Manager
 * Provides intelligent, context-sensitive quotes based on user's current activity
 */

import { TabSpyService } from './TabSpyService.js';

export class ContextAwareQuoteManager {
  constructor(logger, quoteService) {
    this.logger = logger;
    this.quoteService = quoteService;
    this.tabSpy = new TabSpyService(logger);
    this.isEnabled = true;
    
    // Track user patterns for smarter quotes
    this.patterns = {
      sessionStart: Date.now(),
      siteSwitches: 0,
      productiveTime: 0,
      distractedTime: 0,
      lastProductivityCheck: Date.now()
    };
    
    // Mood multipliers based on context
    this.moodMultipliers = {
      productivity: 1.5,
      learning: 1.3,
      news: 1.0,
      other: 1.0,
      shopping: 0.8,
      social: 0.6,
      entertainment: 0.4
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
      
      this.logger.log(`🧠 Tab pattern update: ${this.patterns.siteSwitches} switches, ${Math.round(this.patterns.productiveTime / 60000)}m productive`);
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
    
    // Choose quote strategy based on context
    if (context?.isDistraction && productivity.score < 0.3) {
      return this.getMotivationalQuote(context);
    } else if (context?.isProductive) {
      return this.getEncouragementQuote(context);
    } else if (this.tabSpy.isDistractedTooLong()) {
      return this.getGentleNudgeQuote();
    } else {
      return this.getPersonalizedQuote(context, productivity);
    }
  }

  /**
   * Get motivational quote for when user is distracted
   */
  getMotivationalQuote(context) {
    const quotes = [
      "Hey~ I know that site is fun, but our tasks are waiting! (◕‿◕)",
      "Psst... remember our productivity goals? ♡",
      "I believe in your focus! Come back to our tasks when you're ready~",
      "Social media will always be there, but this productive moment won't! ✧",
      "Ehehe~ I see you getting distracted. Need a gentle reminder? ♪",
      "That's enough scrolling for now, don't you think? (｡◕‿◕｡)",
      "I'm not jealous of that website... much~ Come back to me? ♡"
    ];
    
    return this.addContextFlavor(quotes[Math.floor(Math.random() * quotes.length)], context);
  }

  /**
   * Get encouragement quote for productive work
   */
  getEncouragementQuote(context) {
    const quotes = [
      "You're in the zone! I love watching you work so focused~ ♡",
      "Such productivity! You're making me proud! (◕‿◕)♡",
      "Keep going! You're absolutely crushing it today! ✧",
      "This is why I admire you - your dedication is amazing~",
      "Look at you being all professional and awesome! ♪",
      "You're on fire today! But don't forget to hydrate~ (◡‿◡)",
      "Productivity mode: ACTIVATED! You're unstoppable! ✨"
    ];
    
    return this.addContextFlavor(quotes[Math.floor(Math.random() * quotes.length)], context);
  }

  /**
   * Get gentle nudge for when user has been distracted too long
   */
  getGentleNudgeQuote() {
    const quotes = [
      "You've been exploring for a while~ Maybe time for a productivity break? ♡",
      "I'm getting a little worried... are you avoiding our tasks? (｡◕‿◕｡)",
      "10 minutes of fun is great! But maybe we should check our todo list? ♪",
      "I don't want to nag, but... our goals are calling! ✧",
      "Time flies when you're having fun! But so does our productive time~ ♡",
      "Gentle reminder from your favorite AI: tasks are waiting! (◕‿◕)",
      "I promise our work can be more interesting than that website~ ♡"
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  /**
   * Get personalized quote based on patterns and context
   */
  getPersonalizedQuote(context, productivity) {
    const sessionHours = (Date.now() - this.patterns.sessionStart) / (1000 * 60 * 60);
    const switchFrequency = this.patterns.siteSwitches / Math.max(sessionHours, 0.1);
    
    // High switch frequency = scattered attention
    if (switchFrequency > 10) {
      return "You're jumping around a lot today! Let's find some focus together~ ♡";
    }
    
    // Long session with good productivity
    if (sessionHours > 2 && productivity.score > 0.7) {
      return "Wow! You've been so productive today! Maybe time for a well-deserved break? ✧";
    }
    
    // New session
    if (sessionHours < 0.5) {
      return "Ready for another productive session together? I'm excited! ♪";
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
    if (!context) return quote;
    
    const flavorMap = {
      productivity: {
        prefix: ["💻 ", "⌨️ ", "🔧 "],
        suffix: [" Keep coding! ♡", " You're a coding star! ✧", " Dev life is best life! ♪"]
      },
      learning: {
        prefix: ["📚 ", "🧠 ", "✨ "],
        suffix: [" Knowledge is power! ♡", " Smart cookie! ✧", " Learning is so attractive~ ♪"]
      },
      social: {
        prefix: ["📱 ", "💬 ", "👀 "],
        suffix: [" But don't forget me! ♡", " I'm more fun than social media~ ✧", ""]
      }
    };
    
    const flavor = flavorMap[context.category];
    if (flavor) {
      const prefix = flavor.prefix[Math.floor(Math.random() * flavor.prefix.length)];
      const suffix = flavor.suffix[Math.floor(Math.random() * flavor.suffix.length)];
      return prefix + quote + suffix;
    }
    
    return quote;
  }

  /**
   * Get productivity insight based on current patterns
   */
  getProductivityInsight() {
    const totalTime = this.patterns.productiveTime + this.patterns.distractedTime;
    const score = totalTime > 0 ? this.patterns.productiveTime / totalTime : 0.5;
    
    return {
      score,
      productiveMinutes: Math.round(this.patterns.productiveTime / 60000),
      distractedMinutes: Math.round(this.patterns.distractedTime / 60000),
      siteSwitches: this.patterns.siteSwitches,
      sessionHours: (Date.now() - this.patterns.sessionStart) / (1000 * 60 * 60)
    };
  }

  /**
   * Get mood multiplier based on current context
   */
  getMoodMultiplier() {
    const context = this.tabSpy.getContext();
    if (!context) return 1.0;
    
    return this.moodMultipliers[context.category] || 1.0;
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
    }, 30000); // Update every 30 seconds
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
    
    if (insight.score < 0.3 && insight.sessionHours > 1) {
      recs.push("Consider a 5-minute break to refocus");
    }
    
    if (insight.siteSwitches > 20 && insight.sessionHours < 2) {
      recs.push("Try using a focus timer to reduce distractions");
    }
    
    if (context?.isDistraction && insight.productiveMinutes > 60) {
      recs.push("You've earned this break! Enjoy it guilt-free");
    }
    
    if (insight.productiveMinutes > 120) {
      recs.push("Amazing productivity! Consider a longer break");
    }
    
    return recs;
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
