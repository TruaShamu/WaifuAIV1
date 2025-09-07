/**
 * Animation Service
 * Provides reusable animation utilities
 */

import { CONFIG } from '../config.js';

export class AnimationService {
  static fadeIn(element, duration = CONFIG.ANIMATION_DURATION) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 10);
  }

  static slideOut(element, direction = 'left', duration = CONFIG.ANIMATION_DURATION) {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
      element.style.opacity = '0';
      element.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
      
      setTimeout(resolve, duration);
    });
  }

  static bounce(element, scale = 1.1, duration = 200) {
    element.style.transform = `scale(${scale})`;
    setTimeout(() => {
      element.style.transform = '';
    }, duration);
  }

  static createAffectionBoost(container, amount) {
    if (!document.querySelector('#affection-boost-style')) {
      const style = document.createElement('style');
      style.id = 'affection-boost-style';
      style.textContent = `
        @keyframes affectionBoost {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -70%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -90%) scale(0.8); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const boost = document.createElement('div');
    boost.textContent = `+${amount}`;
    boost.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%); color: #ff69b4;
      font-weight: bold; font-size: 18px; pointer-events: none;
      z-index: 1000; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      animation: affectionBoost 1.5s ease-out forwards;
    `;
    
    container.style.position = 'relative';
    container.appendChild(boost);
    setTimeout(() => boost.remove(), 1500);
  }

  static addFloatingAnimation(element) {
    element.classList.add('floating-animation');
  }

  static removeFloatingAnimation(element) {
    element.classList.remove('floating-animation');
  }
}
