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
    
    // Notifications and Audio
    this.notificationsEnabled = true;
    this.audioEnabled = true;
    this.audioContext = null;
    this.completionAudio = null;
    
    this.initializeAudio();
  }

  /**
   * Initialize audio system for timer completion sounds
   */
  initializeAudio() {
    try {
      // Try to load a custom audio file first
      this.completionAudio = new Audio();
      
      // Check if there's a custom audio file in assets
      const audioFiles = [
        'assets/pomodoro-chime.mp3',
        'assets/pomodoro-chime.wav',
        'assets/chime.mp3',
        'assets/chime.wav',
        'assets/ding.mp3',
        'assets/ding.wav'
      ];
      
      // Try to find an existing audio file
      this.loadAudioFile(audioFiles);
      
      // Initialize Web Audio API as fallback for generated chimes
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        this.audioContext = new (AudioContext || webkitAudioContext)();
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize audio system:', error);
      this.audioEnabled = false;
    }
  }

  /**
   * Try to load an audio file from the available options
   */
  async loadAudioFile(audioFiles) {
    for (const audioFile of audioFiles) {
      try {
        const testAudio = new Audio(audioFile);
        
        // Test if the file exists and can be loaded
        await new Promise((resolve, reject) => {
          testAudio.addEventListener('canplaythrough', resolve);
          testAudio.addEventListener('error', reject);
          testAudio.load();
        });
        
        // If we get here, the file loaded successfully
        this.completionAudio.src = audioFile;
        this.completionAudio.volume = 0.7; // Set reasonable volume
        this.logger.log(`Loaded audio file: ${audioFile}`);
        return true;
        
      } catch (error) {
        // Continue to next file
        continue;
      }
    }
    
    // No audio file found, will use Web Audio API fallback
    this.logger.log('No audio file found, will use generated chimes');
    return false;
  }

  /**
   * Play completion sound - either file or generated chime
   */
  playCompletionSound(sessionType = 'work') {
    if (!this.audioEnabled) return;
    
    try {
      // Try to play custom audio file first
      if (this.completionAudio && this.completionAudio.src) {
        this.completionAudio.currentTime = 0; // Reset to beginning
        this.completionAudio.play().catch(error => {
          this.logger.error('Failed to play audio file:', error);
          // Fallback to generated chime
          this.playGeneratedChime(sessionType);
        });
      } else {
        // Use generated chime
        this.playGeneratedChime(sessionType);
      }
    } catch (error) {
      this.logger.error('Failed to play completion sound:', error);
    }
  }

  /**
   * Generate and play a chime sound using Web Audio API
   */
  playGeneratedChime(sessionType = 'work') {
    if (!this.audioContext) return;
    
    try {
      // Different chime patterns for different session types
      const chimePatterns = {
        work: [800, 1000, 1200], // Rising tones for work completion
        shortBreak: [1000, 800], // Two-tone for break completion
        longBreak: [600, 800, 1000, 1200] // Longer sequence for long break
      };
      
      const frequencies = chimePatterns[sessionType] || chimePatterns.work;
      
      frequencies.forEach((frequency, index) => {
        setTimeout(() => {
          this.playTone(frequency, 0.3, 0.1); // 300ms tone with 100ms attack/decay
        }, index * 200); // 200ms between each tone
      });
      
    } catch (error) {
      this.logger.error('Failed to generate chime:', error);
    }
  }

  /**
   * Play a single tone using Web Audio API
   */
  playTone(frequency, duration, volume = 0.1) {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set up the tone
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine'; // Smooth sine wave
      
      // Set up volume envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01); // Quick attack
      gainNode.gain.linearRampToValueAtTime(volume * 0.8, this.audioContext.currentTime + duration * 0.8); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration); // Decay
      
      // Play the tone
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
    } catch (error) {
      this.logger.error('Failed to play tone:', error);
    }
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
    
    // Play completion sound
    this.playCompletionSound(state.completedSessionType);
    
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
    if (!this.notificationsEnabled) {
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
    this.logger.log(`Attempting to show notification - Enabled: ${this.notificationsEnabled}`);
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
    
    // Update audio settings
    if (settings.audioEnabled !== undefined) {
      this.audioEnabled = settings.audioEnabled;
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
