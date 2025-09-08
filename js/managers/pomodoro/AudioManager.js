/**
 * Audio Manager
 * Handles audio playback for notifications and alerts
 */

export class AudioManager {
  constructor(logger) {
    this.logger = logger;
    this.enabled = true;
  }

  /**
   * Play a simple completion sound
   */
  playCompletionSound() {
    if (!this.enabled) return;
    
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (AudioContext || webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Simple beep sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Quick fade in and out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      this.logger.error('Failed to play completion sound:', error);
    }
  }

  /**
   * Enable or disable audio
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if audio is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}
