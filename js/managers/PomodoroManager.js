/**
 * Pomodoro Manager
 * Manages Pomodoro timer functionality and UI integration
 */

import { BaseManager } from './BaseManager.js';
import { PomodoroTimer } from '../models/PomodoroTimer.js';
import { PomodoroUIManager } from './pomodoro/PomodoroUIManager.js';
import { AudioManager } from './pomodoro/AudioManager.js';
import { NotificationManager } from './pomodoro/NotificationManager.js';

export class PomodoroManager extends BaseManager {
  constructor(dependencies) {
    super(dependencies);
    
    this.timer = new PomodoroTimer();
    this.timerInterval = null;
    this.uiManager = new PomodoroUIManager();
    this.audioManager = new AudioManager(this.logger);
    this.notificationManager = new NotificationManager(this.logger);
    
    // Event callbacks
    this.onSessionComplete = null;
    this.onTick = null;
    this.onStateChange = null;
    
    this.setupUICallbacks();
  }

  /**
   * Initialization logic
   */
  async onInitialize() {
    this.logger.log('Pomodoro manager ready');
  }

  /**
   * Data loading logic
   */
  async onLoad() {
    try {
      const savedData = await this.storageProvider.get('pomodoroData');
      if (savedData) {
        this.timer.setState(savedData.timer || {});
        this.logger.log('Pomodoro data loaded from storage');
      }
    } catch (error) {
      this.logger.error(`Failed to load pomodoro data: ${error.message}`);
    }
  }

  /**
   * Data saving logic
   */
  async onSave() {
    try {
      const dataToSave = {
        timer: this.timer.getState(),
        timestamp: Date.now()
      };
      await this.storageProvider.set('pomodoroData', dataToSave);
      this.logger.log('Pomodoro data saved to storage');
    } catch (error) {
      this.logger.error(`Failed to save pomodoro data: ${error.message}`);
    }
  }

  /**
   * Cleanup logic
   */
  async onDestroy() {
    this.stopTimer();
    if (this.audioManager) {
      // Clean up audio resources if needed
    }
  }

  /**
   * Setup UI manager callbacks
   */
  setupUICallbacks() {
    this.uiManager.setCallbacks({
      onStart: () => this.start(),
      onPause: () => this.pause(),
      onStop: () => this.stop(),
      onReset: () => this.reset(),
      getStats: () => this.timer.getStats()
    });
  }

  setUIElements(elements) {
    this.uiManager.setElements(elements);
    this.updateUI();
  }

  async load() {
    try {
      const data = await this.storageProvider.get('pomodoroState');
      if (data && data.pomodoroState) {
        const state = data.pomodoroState;
        this.timer.completedSessions = state.completedSessions || 0;
        this.timer.totalWorkSessions = state.totalWorkSessions || 0;
        this.timer.currentSession = state.currentSession || 'work';
        this.timer.currentTime = this.timer.getCurrentSessionDuration();
        
        this.logger.log('Pomodoro state loaded from storage');
      }
      this.updateUI();
    } catch (error) {
      this.logger.error(`Failed to load Pomodoro state: ${error.message}`);
    }
  }

  async save() {
    try {
      const state = {
        completedSessions: this.timer.completedSessions,
        totalWorkSessions: this.timer.totalWorkSessions,
        currentSession: this.timer.currentSession,
        lastSaved: new Date().toISOString()
      };
      
      await this.storageProvider.set('pomodoroState', state);
      this.logger.log('Pomodoro state saved to storage');
    } catch (error) {
      this.logger.error(`Failed to save Pomodoro state: ${error.message}`);
    }
  }

  start() {
    const state = this.timer.start();
    this.startTimer();
    this.updateUI(state);
    this.save();
    
    if (this.onStateChange) {
      this.onStateChange('started', state);
    }
    
    this.logger.log(`Pomodoro ${state.currentSession} session started`);
  }

  pause() {
    const state = this.timer.pause();
    if (state) {
      this.stopTimer();
      this.updateUI(state);
      this.save();
      
      if (this.onStateChange) {
        this.onStateChange('paused', state);
      }
      
      this.logger.log('Pomodoro timer paused');
    }
  }

  stop() {
    const state = this.timer.stop();
    this.stopTimer();
    this.updateUI(state);
    this.save();
    
    if (this.onStateChange) {
      this.onStateChange('stopped', state);
    }
    
    this.logger.log('Pomodoro timer stopped');
  }

  reset() {
    const state = this.timer.reset();
    this.stopTimer();
    this.updateUI(state);
    this.save();
    
    if (this.onStateChange) {
      this.onStateChange('reset', state);
    }
    
    this.logger.log('Pomodoro timer reset');
  }

  startTimer() {
    this.stopTimer(); // Clear any existing timer
    
    this.timerInterval = setInterval(() => {
      const state = this.timer.tick();
      
      if (state) {
        this.updateUI(state);
        
        if (this.onTick) {
          this.onTick(state);
        }
        
        // Check for session completion
        if (state.sessionCompleted) {
          this.handleSessionComplete(state);
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleSessionComplete(state) {
    this.stopTimer();
    this.save();
    
    // Play completion sound
    this.audioManager.playCompletionSound();
    
    // Show notification
    this.notificationManager.showSessionComplete(state);
    
    // Trigger callbacks
    if (this.onSessionComplete) {
      this.onSessionComplete(state);
    }
    
    if (this.onStateChange) {
      this.onStateChange('sessionComplete', state);
    }
    
    this.logger.log(`${state.completedSessionType} session completed. Next: ${state.sessionDisplay}`);
    this.updateUI(state);
  }

  updateUI(state = null) {
    const currentState = state || this.timer.getCurrentState();
    this.uiManager.update(currentState);
  }

  getCurrentState() {
    return this.timer.getCurrentState();
  }

  getStats() {
    return this.timer.getStats();
  }

  setCustomDurations(work, shortBreak, longBreak) {
    return this.timer.setCustomDurations(work, shortBreak, longBreak);
  }

  async requestNotificationPermission() {
    return await this.notificationManager.requestPermission();
  }

  updateSettings(settings) {
    // Update timer durations (convert minutes to seconds)
    if (settings.workDuration) {
      this.timer.workDuration = settings.workDuration * 60;
    }
    if (settings.shortBreak) {
      this.timer.shortBreakDuration = settings.shortBreak * 60;
    }
    if (settings.longBreak) {
      this.timer.longBreakDuration = settings.longBreak * 60;
    }
    if (settings.sessionsUntilLongBreak) {
      this.timer.sessionsUntilLongBreak = settings.sessionsUntilLongBreak;
    }
    
    // Update notification settings
    if (settings.notificationsEnabled !== undefined) {
      this.notificationManager.setEnabled(settings.notificationsEnabled);
    }
    
    // Update audio settings
    if (settings.audioEnabled !== undefined) {
      this.audioManager.setEnabled(settings.audioEnabled);
    }
    
    // Update auto-start settings
    if (settings.autoStartBreaks !== undefined) {
      this.timer.autoStartBreaks = settings.autoStartBreaks;
    }
    if (settings.autoStartWork !== undefined) {
      this.timer.autoStartWork = settings.autoStartWork;
    }
    
    // Reset timer to new duration if not running
    if (!this.timer.isRunning) {
      this.timer.currentTime = this.timer.getCurrentSessionDuration();
      this.updateUI();
    }
    
    this.logger.log('Pomodoro settings updated');
  }

  /**
   * Get work sessions count (for external access)
   */
  get workSessions() {
    return this.timer ? this.timer.totalWorkSessions || 0 : 0;
  }

  /**
   * Get total sessions count (for external access)
   */
  get totalSessions() {
    return this.timer ? this.timer.completedSessions || 0 : 0;
  }

  /**
   * Get productive time in minutes (for external access)
   */
  get productiveTime() {
    if (!this.timer) return 0;
    const stats = this.timer.getStats();
    return stats.totalProductiveTime || 0;
  }

  destroy() {
    this.stopTimer();
    this.save();
    this.logger.log('Pomodoro manager destroyed');
  }
}
