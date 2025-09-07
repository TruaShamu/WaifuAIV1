/**
 * Pomodoro Timer Model
 * Handles Pomodoro session timing and state management
 */

export class PomodoroTimer {
  constructor() {
    this.workDuration = 25 * 60; // 25 minutes in seconds
    this.shortBreakDuration = 5 * 60; // 5 minutes in seconds
    this.longBreakDuration = 15 * 60; // 15 minutes in seconds
    this.sessionsUntilLongBreak = 4;
    
    this.currentTime = this.workDuration;
    this.isRunning = false;
    this.isPaused = false;
    this.currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
    this.completedSessions = 0;
    this.totalWorkSessions = 0;
    
    this.startTime = null;
    this.pausedTime = 0;
  }

  start() {
    if (this.isPaused) {
      // Resume from pause
      this.isPaused = false;
      this.startTime = Date.now() - this.pausedTime;
    } else {
      // Fresh start
      this.startTime = Date.now();
      this.pausedTime = 0;
    }
    this.isRunning = true;
    return this.getCurrentState();
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.isRunning = false;
      this.pausedTime = Date.now() - this.startTime;
      return this.getCurrentState();
    }
    return null;
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentTime = this.getCurrentSessionDuration();
    this.startTime = null;
    this.pausedTime = 0;
    return this.getCurrentState();
  }

  tick() {
    if (!this.isRunning || this.isPaused) return null;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const sessionDuration = this.getCurrentSessionDuration();
    this.currentTime = Math.max(0, sessionDuration - elapsed);

    if (this.currentTime <= 0) {
      return this.completeSession();
    }

    return this.getCurrentState();
  }

  completeSession() {
    this.isRunning = false;
    this.completedSessions++;
    
    const completedSessionType = this.currentSession;
    
    if (this.currentSession === 'work') {
      this.totalWorkSessions++;
      // Determine next break type
      if (this.totalWorkSessions % this.sessionsUntilLongBreak === 0) {
        this.currentSession = 'longBreak';
      } else {
        this.currentSession = 'shortBreak';
      }
    } else {
      // Break completed, back to work
      this.currentSession = 'work';
    }

    this.currentTime = this.getCurrentSessionDuration();
    this.startTime = null;
    this.pausedTime = 0;

    return {
      ...this.getCurrentState(),
      sessionCompleted: true,
      completedSessionType,
      autoStartNext: false
    };
  }

  getCurrentSessionDuration() {
    switch (this.currentSession) {
      case 'work': return this.workDuration;
      case 'shortBreak': return this.shortBreakDuration;
      case 'longBreak': return this.longBreakDuration;
      default: return this.workDuration;
    }
  }

  getCurrentState() {
    return {
      currentTime: this.currentTime,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentSession: this.currentSession,
      completedSessions: this.completedSessions,
      totalWorkSessions: this.totalWorkSessions,
      sessionDuration: this.getCurrentSessionDuration(),
      progress: 1 - (this.currentTime / this.getCurrentSessionDuration()),
      timeDisplay: this.formatTime(this.currentTime),
      sessionDisplay: this.getSessionDisplayName()
    };
  }

  getSessionDisplayName() {
    switch (this.currentSession) {
      case 'work': return 'Work Time';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Work Time';
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  setCustomDurations(work, shortBreak, longBreak) {
    if (!this.isRunning) {
      this.workDuration = work * 60;
      this.shortBreakDuration = shortBreak * 60;
      this.longBreakDuration = longBreak * 60;
      this.currentTime = this.getCurrentSessionDuration();
      return true;
    }
    return false;
  }

  reset() {
    this.stop();
    this.currentSession = 'work';
    this.completedSessions = 0;
    this.totalWorkSessions = 0;
    this.currentTime = this.workDuration;
    return this.getCurrentState();
  }

  getStats() {
    return {
      totalWorkSessions: this.totalWorkSessions,
      completedSessions: this.completedSessions,
      currentStreak: this.totalWorkSessions,
      estimatedProductiveTime: this.totalWorkSessions * (this.workDuration / 60) // in minutes
    };
  }
}
