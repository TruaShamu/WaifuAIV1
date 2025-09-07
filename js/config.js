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
    WAIFU_CLICK: 2
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
  }
};
