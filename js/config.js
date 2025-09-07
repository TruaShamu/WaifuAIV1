/**
 * Application Configuration
 * Centralized configuration for the Waifu AI application
 */

export const CONFIG = {
  SPRITES: [
    'assets/saber_neutral.png',
    'assets/saber_plooshie.png',
    'assets/saber_pouting.png',
    'assets/saber_angry.png',
    'assets/saber_happy.png'
  ],
  AFFECTION: {
    MAX: 100,
    TASK_COMPLETION: 5,
    WAIFU_CLICK: 2, // Deprecated - use INTERACTION instead
    INTERACTION: 10, // New timed interaction system
    POMODORO_WORK_SESSION: 8,
    POMODORO_BREAK_SESSION: 3
  },
  INTERACTION: {
    INTERVAL: 5 * 60 * 1000, // 5 minutes between interaction opportunities
    REWARD: 10, // Affection reward for timed interactions
    INDICATOR_DURATION: 30 * 1000, // 30 seconds to interact
    MAX_MISSED: 3 // Reduce interval after missing this many
  },
  SPRITE_CYCLE_INTERVAL: 5000,
  ANIMATION_DURATION: 300,
  AFFECTION_LEVELS: {
    VERY_HIGH: 80,
    HIGH: 60,
    MEDIUM: 30,
    LOW: 20
  },
  TOOLTIP: {
    RANDOM_INTERVAL: 10000, // 10 seconds
    DISPLAY_DURATION: 4000, // 4 seconds
    EVENT_DURATION: 3000,   // 3 seconds for event-triggered quotes
    AUTO_ENABLED: true
  },
  PRIVACY: {
    TAB_SPY_ENABLED: true,
    CONTEXT_AWARE_QUOTES: true,
    PRODUCTIVITY_TRACKING: true
  },
  POMODORO: {
    WORK_DURATION: 3,      // minutes
    SHORT_BREAK: 1,         // minutes
    LONG_BREAK: 2,         // minutes
    SESSIONS_UNTIL_LONG_BREAK: 2,
    NOTIFICATIONS_ENABLED: true,
    AUTO_START_BREAKS: false,
    AUTO_START_WORK: false
  }
};
