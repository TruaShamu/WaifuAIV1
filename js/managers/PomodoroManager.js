/**
 * Pomodoro Manager
 * Manages Pomodoro timer functionality and UI integration
 */

import { PomodoroTimer } from '../models/PomodoroTimer.js';
import { CONFIG } from '../config.js';

export class PomodoroManager {
  constructor(storageProvider, logger) {
    this.storageProvider = storageProvider;
    this.logger = logger;
    this.timer = new PomodoroTimer();
    this.timerInterval = null;
    
    // UI elements
    this.timerDisplay = null;
    this.sessionDisplay = null;
    this.progressBar = null;
    this.startButton = null;
    this.pauseButton = null;
    this.stopButton = null;
    this.resetButton = null;
    this.statsDisplay = null;
    
    // Event callbacks
    this.onSessionComplete = null;
    this.onTick = null;
    this.onStateChange = null;
    
    // Notifications
    this.notificationsEnabled = true;
  }

  setUIElements(elements) {
    this.timerDisplay = elements.timerDisplay;
    this.sessionDisplay = elements.sessionDisplay;
    this.progressBar = elements.progressBar;
    this.startButton = elements.startButton;
    this.pauseButton = elements.pauseButton;
    this.stopButton = elements.stopButton;
    this.resetButton = elements.resetButton;
    this.statsDisplay = elements.statsDisplay;
    
    this.setupEventHandlers();
    this.updateUI();
  }

  setupEventHandlers() {
    if (this.startButton) {
      this.startButton.addEventListener('click', () => this.start());
    }
    
    if (this.pauseButton) {
      this.pauseButton.addEventListener('click', () => this.pause());
    }
    
    if (this.stopButton) {
      this.stopButton.addEventListener('click', () => this.stop());
    }
    
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.reset());
    }
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
    
    // Show notification
    this.showNotification(state);
    
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

  showNotification(state) {
    if (!this.notificationsEnabled) return;
    
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
    
    // Browser notification (if permissions granted)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: 'assets/saber_happy.png' // Use happy waifu for notifications
      });
    }
    
    this.logger.log(`Notification: ${notification.title} - ${notification.message}`);
  }

  updateUI(state = null) {
    const currentState = state || this.timer.getCurrentState();
    
    // Update timer display
    if (this.timerDisplay) {
      this.timerDisplay.textContent = currentState.timeDisplay;
    }
    
    // Update session display
    if (this.sessionDisplay) {
      this.sessionDisplay.textContent = currentState.sessionDisplay;
    }
    
    // Update progress bar
    if (this.progressBar) {
      const progressPercent = currentState.progress * 100;
      this.progressBar.style.width = `${progressPercent}%`;
      
      // Color coding for different sessions
      const colors = {
        work: '#ff69b4',
        shortBreak: '#4CAF50',
        longBreak: '#2196F3'
      };
      this.progressBar.style.backgroundColor = colors[currentState.currentSession] || colors.work;
    }
    
    // Update button states
    this.updateButtonStates(currentState);
    
    // Update stats
    this.updateStats(currentState);
  }

  updateButtonStates(state) {
    if (this.startButton) {
      this.startButton.disabled = state.isRunning;
      this.startButton.textContent = state.isPaused ? 'Resume' : 'Start';
    }
    
    if (this.pauseButton) {
      this.pauseButton.disabled = !state.isRunning;
    }
    
    if (this.stopButton) {
      this.stopButton.disabled = !state.isRunning && !state.isPaused;
    }
    
    if (this.resetButton) {
      this.resetButton.disabled = state.isRunning;
    }
  }

  updateStats(state) {
    const stats = this.timer.getStats();
    
    if (this.statsDisplay) {
      if (this.statsDisplay.workSessions) {
        this.statsDisplay.workSessions.textContent = stats.totalWorkSessions;
      }
      if (this.statsDisplay.totalSessions) {
        this.statsDisplay.totalSessions.textContent = stats.completedSessions;
      }
      if (this.statsDisplay.productiveTime) {
        this.statsDisplay.productiveTime.textContent = `${Math.round(stats.estimatedProductiveTime)}m`;
      }
    }
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
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.notificationsEnabled = permission === 'granted';
      this.logger.log(`Notification permission: ${permission}`);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
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
      this.notificationsEnabled = settings.notificationsEnabled;
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

  destroy() {
    this.stopTimer();
    this.save();
    this.logger.log('Pomodoro manager destroyed');
  }
}
