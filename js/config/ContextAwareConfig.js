/**
 * Context-Aware Quote Manager Configuration
 * Centralized configuration for thresholds, timers, and behavior parameters
 */

export const CONTEXT_AWARE_CONFIG = {
  THRESHOLDS: {
    HIGH_SWITCH_FREQUENCY: 10,      // Switches per hour indicating scattered attention
    LONG_SESSION_HOURS: 2,          // Hours before suggesting break
    HIGH_PRODUCTIVITY_SCORE: 0.7,   // Score indicating high productivity
    LOW_PRODUCTIVITY_SCORE: 0.3,    // Score indicating low productivity
    NEW_SESSION_HOURS: 0.5,         // Hours considered "new session"
    DISTRACTION_TIME_MINUTES: 10,   // Minutes on distracting sites before nudge
    BREAK_SUGGESTION_MINUTES: 120   // Minutes of work before break suggestion
  },
  
  TIMERS: {
    PRODUCTIVITY_TRACKING_INTERVAL: 30000,      // 30 seconds
    DISTRACTION_THRESHOLD: 10 * 60 * 1000,     // 10 minutes
    MILLISECONDS_PER_HOUR: 60 * 60 * 1000,     // Hour conversion
    MILLISECONDS_PER_MINUTE: 60 * 1000         // Minute conversion
  },
  
  MOOD_MULTIPLIERS: {
    productivity: 1.5,
    learning: 1.3,
    news: 1.0,
    other: 1.0,
    shopping: 0.8,
    social: 0.6,
    entertainment: 0.4
  },
  
  FALLBACK_QUOTES: {
    motivational: "I believe in your focus! Come back to our tasks when you're ready~ ♡",
    encouragement: "You're doing amazing! Keep up the great work! ♡",
    gentle_nudge: "Gentle reminder from your favorite AI: tasks are waiting! (◕‿◕)",
    scattered_attention: "You're jumping around a lot today! Let's find some focus together~ ♡",
    productive_break: "Wow! You've been so productive today! Maybe time for a well-deserved break? ✧",
    new_session: "Ready for another productive session together? I'm excited! ♪"
  },
  
  CONTEXT_FLAVORS: {
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
    },
    entertainment: {
      prefix: ["🎮 ", "📺 ", "🎵 "],
      suffix: [" Fun time! ♡", " Enjoy your break! ✧", " Entertainment is good too~ ♪"]
    },
    shopping: {
      prefix: ["🛒 ", "💳 ", "🛍️ "],
      suffix: [" Shopping spree? ♡", " Don't spend too much! ✧", " Retail therapy time~ ♪"]
    },
    news: {
      prefix: ["📰 ", "🌍 ", "📊 "],
      suffix: [" Stay informed! ♡", " Knowledge is power! ✧", " Current events~ ♪"]
    }
  }
};

/**
 * Validate configuration object
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateConfig(config) {
  const errors = [];
  
  // Validate required sections
  const requiredSections = ['THRESHOLDS', 'TIMERS', 'MOOD_MULTIPLIERS', 'FALLBACK_QUOTES', 'CONTEXT_FLAVORS'];
  for (const section of requiredSections) {
    if (!config[section]) {
      errors.push(`Missing required section: ${section}`);
    }
  }
  
  // Validate threshold values
  if (config.THRESHOLDS) {
    const thresholds = config.THRESHOLDS;
    if (thresholds.HIGH_SWITCH_FREQUENCY <= 0) {
      errors.push('HIGH_SWITCH_FREQUENCY must be positive');
    }
    if (thresholds.HIGH_PRODUCTIVITY_SCORE < 0 || thresholds.HIGH_PRODUCTIVITY_SCORE > 1) {
      errors.push('HIGH_PRODUCTIVITY_SCORE must be between 0 and 1');
    }
    if (thresholds.LOW_PRODUCTIVITY_SCORE < 0 || thresholds.LOW_PRODUCTIVITY_SCORE > 1) {
      errors.push('LOW_PRODUCTIVITY_SCORE must be between 0 and 1');
    }
    if (thresholds.LOW_PRODUCTIVITY_SCORE >= thresholds.HIGH_PRODUCTIVITY_SCORE) {
      errors.push('LOW_PRODUCTIVITY_SCORE must be less than HIGH_PRODUCTIVITY_SCORE');
    }
  }
  
  // Validate timer values
  if (config.TIMERS) {
    const timers = config.TIMERS;
    if (timers.PRODUCTIVITY_TRACKING_INTERVAL <= 0) {
      errors.push('PRODUCTIVITY_TRACKING_INTERVAL must be positive');
    }
    if (timers.DISTRACTION_THRESHOLD <= 0) {
      errors.push('DISTRACTION_THRESHOLD must be positive');
    }
  }
  
  // Validate mood multipliers
  if (config.MOOD_MULTIPLIERS) {
    const multipliers = config.MOOD_MULTIPLIERS;
    for (const [category, multiplier] of Object.entries(multipliers)) {
      if (typeof multiplier !== 'number' || multiplier < 0) {
        errors.push(`Mood multiplier for ${category} must be a positive number`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Merge user configuration with defaults
 * @param {Object} userConfig - User's partial configuration
 * @returns {Object} Merged configuration
 */
export function mergeConfig(userConfig) {
  return {
    ...CONTEXT_AWARE_CONFIG,
    ...userConfig,
    THRESHOLDS: { ...CONTEXT_AWARE_CONFIG.THRESHOLDS, ...(userConfig.THRESHOLDS || {}) },
    TIMERS: { ...CONTEXT_AWARE_CONFIG.TIMERS, ...(userConfig.TIMERS || {}) },
    MOOD_MULTIPLIERS: { ...CONTEXT_AWARE_CONFIG.MOOD_MULTIPLIERS, ...(userConfig.MOOD_MULTIPLIERS || {}) },
    FALLBACK_QUOTES: { ...CONTEXT_AWARE_CONFIG.FALLBACK_QUOTES, ...(userConfig.FALLBACK_QUOTES || {}) },
    CONTEXT_FLAVORS: { ...CONTEXT_AWARE_CONFIG.CONTEXT_FLAVORS, ...(userConfig.CONTEXT_FLAVORS || {}) }
  };
}

/**
 * Get a deep copy of the default configuration
 * @returns {Object} Deep copy of default configuration
 */
export function getDefaultConfig() {
  return JSON.parse(JSON.stringify(CONTEXT_AWARE_CONFIG));
}

/**
 * Configuration presets for different user types
 */
export const CONFIG_PRESETS = {
  FOCUSED: {
    THRESHOLDS: {
      HIGH_SWITCH_FREQUENCY: 5,      // Very sensitive to distractions
      LOW_PRODUCTIVITY_SCORE: 0.4,   // Higher bar for productivity
      BREAK_SUGGESTION_MINUTES: 90   // Suggest breaks sooner
    }
  },
  
  RELAXED: {
    THRESHOLDS: {
      HIGH_SWITCH_FREQUENCY: 15,     // Allow more switching
      LOW_PRODUCTIVITY_SCORE: 0.2,   // More lenient productivity threshold
      BREAK_SUGGESTION_MINUTES: 180  // Longer work sessions
    }
  },
  
  BALANCED: {
    // Uses default values
  }
};
