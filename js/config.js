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
  }
};
