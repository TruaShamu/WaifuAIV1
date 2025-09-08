/**
 * Pomodoro UI Manager
 * Handles all UI elements and interactions for the Pomodoro timer
 */

export class PomodoroUIManager {
  constructor() {
    this.elements = {
      timerDisplay: null,
      sessionDisplay: null,
      progressBar: null,
      startButton: null,
      pauseButton: null,
      stopButton: null,
      resetButton: null,
      statsDisplay: null
    };
    
    this.callbacks = {};
  }

  /**
   * Set UI elements from DOM
   */
  setElements(elementMap) {
    Object.assign(this.elements, elementMap);
    this.setupEventHandlers();
  }

  /**
   * Set callback functions for button interactions
   */
  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Setup event handlers for all buttons
   */
  setupEventHandlers() {
    if (this.elements.startButton && this.callbacks.onStart) {
      this.elements.startButton.addEventListener('click', this.callbacks.onStart);
    }
    
    if (this.elements.pauseButton && this.callbacks.onPause) {
      this.elements.pauseButton.addEventListener('click', this.callbacks.onPause);
    }
    
    if (this.elements.stopButton && this.callbacks.onStop) {
      this.elements.stopButton.addEventListener('click', this.callbacks.onStop);
    }
    
    if (this.elements.resetButton && this.callbacks.onReset) {
      this.elements.resetButton.addEventListener('click', this.callbacks.onReset);
    }
  }

  /**
   * Update all UI elements with current timer state
   */
  update(state) {
    this.updateTimerDisplay(state);
    this.updateSessionDisplay(state);
    this.updateProgressBar(state);
    this.updateButtonStates(state);
    this.updateStats(state);
  }

  /**
   * Update timer display
   */
  updateTimerDisplay(state) {
    if (this.elements.timerDisplay) {
      this.elements.timerDisplay.textContent = state.timeDisplay;
    }
  }

  /**
   * Update session display
   */
  updateSessionDisplay(state) {
    if (this.elements.sessionDisplay) {
      this.elements.sessionDisplay.textContent = state.sessionDisplay;
    }
  }

  /**
   * Update progress bar
   */
  updateProgressBar(state) {
    if (!this.elements.progressBar) return;
    
    const progressPercent = state.progress * 100;
    this.elements.progressBar.style.width = `${progressPercent}%`;
    
    // Color coding for different sessions
    const colors = {
      work: '#ff69b4',
      shortBreak: '#4CAF50',
      longBreak: '#2196F3'
    };
    this.elements.progressBar.style.backgroundColor = colors[state.currentSession] || colors.work;
  }

  /**
   * Update button states based on timer state
   */
  updateButtonStates(state) {
    if (this.elements.startButton) {
      this.elements.startButton.disabled = state.isRunning;
      this.elements.startButton.textContent = state.isPaused ? 'Resume' : 'Start';
    }
    
    if (this.elements.pauseButton) {
      this.elements.pauseButton.disabled = !state.isRunning;
    }
    
    if (this.elements.stopButton) {
      this.elements.stopButton.disabled = !state.isRunning && !state.isPaused;
    }
    
    if (this.elements.resetButton) {
      this.elements.resetButton.disabled = state.isRunning;
    }
  }

  /**
   * Update statistics display
   */
  updateStats(state) {
    if (!this.elements.statsDisplay) return;
    
    // Assuming stats come from timer.getStats()
    if (this.callbacks.getStats) {
      const stats = this.callbacks.getStats();
      
      if (this.elements.statsDisplay.workSessions) {
        this.elements.statsDisplay.workSessions.textContent = stats.totalWorkSessions;
      }
      if (this.elements.statsDisplay.totalSessions) {
        this.elements.statsDisplay.totalSessions.textContent = stats.completedSessions;
      }
      if (this.elements.statsDisplay.productiveTime) {
        this.elements.statsDisplay.productiveTime.textContent = `${Math.round(stats.estimatedProductiveTime)}m`;
      }
    }
  }

  /**
   * Get a specific UI element
   */
  getElement(name) {
    return this.elements[name];
  }

  /**
   * Check if all required elements are set
   */
  hasRequiredElements() {
    const required = ['timerDisplay', 'startButton'];
    return required.every(name => this.elements[name] !== null);
  }
}
