/**
 * Notification Manager
 * Handles browser notifications and permission management
 */

export class NotificationManager {
  constructor(logger) {
    this.logger = logger;
    this.enabled = true;
  }

  /**
   * Show a Pomodoro session completion notification
   */
  showSessionComplete(state) {
    if (!this.enabled) {
      this.logger.log('Notifications disabled in settings');
      return;
    }
    
    const messages = {
      work: {
        title: "Work Session Complete! 🍅",
        message: `Great job! Time for a ${state.sessionDisplay.toLowerCase()}.`,
        icon: "🎉"
      },
      shortBreak: {
        title: "Break Complete! ☕",
        message: "Ready to get back to work?",
        icon: "💪"
      },
      longBreak: {
        title: "Long Break Complete! 🌟",
        message: "Refreshed and ready for more productivity!",
        icon: "✨"
      }
    };

    const notification = messages[state.completedSessionType] || messages.work;
    
    // Debug logging
    this.logger.log(`Attempting to show notification - Enabled: ${this.enabled}`);
    this.logger.log(`Notification API available: ${typeof Notification !== 'undefined'}`);
    this.logger.log(`Notification permission: ${Notification?.permission}`);
    
    // Browser notification (if permissions granted)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        const iconUrl = chrome?.runtime?.getURL ? chrome.runtime.getURL('assets/saber_happy.png') : 'assets/saber_happy.png';
        
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: iconUrl,
          tag: 'pomodoro-completion', // Prevent duplicate notifications
          requireInteraction: false // Don't require user interaction to dismiss
        });
        
        // Add event listeners for debugging
        browserNotification.onshow = () => {
          this.logger.log('✅ Browser notification successfully displayed');
        };
        
        browserNotification.onerror = (error) => {
          this.logger.error('❌ Browser notification error:', error);
        };
        
        browserNotification.onclick = () => {
          this.logger.log('🖱️ Notification clicked');
          browserNotification.close();
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
        
        this.logger.log(`🔔 Browser notification created: ${notification.title}`);
      } catch (error) {
        this.logger.error('❌ Failed to display browser notification:', error);
      }
    } else {
      this.logger.warn(`⚠️ Notification not displayed - Permission: ${Notification?.permission || 'undefined'}, API: ${typeof Notification}`);
    }
    
    this.logger.log(`Notification: ${notification.title} - ${notification.message}`);
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.enabled = permission === 'granted';
      this.logger.log(`Notification permission: ${permission}`);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  /**
   * Enable or disable notifications
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Check if notification permission is granted
   */
  hasPermission() {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }
}
