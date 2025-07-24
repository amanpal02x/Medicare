// Notification sound utility using Web Audio API
class NotificationSound {
  constructor() {
    this.audioContext = null;
    this.isSupported = typeof window !== 'undefined' && window.AudioContext;
    this.fallbackAudio = null;
    
    // Create fallback HTML5 audio element
    if (typeof window !== 'undefined') {
      this.fallbackAudio = new Audio();
      this.fallbackAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      this.fallbackAudio.volume = 0.3;
    }
  }

  // Initialize audio context (required for user interaction)
  init() {
    if (!this.isSupported || this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🔊 Audio context created successfully');
      
      // Add event listener for user interaction to resume audio context
      const resumeAudioContext = () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
          console.log('🔊 Audio context resumed on user interaction');
        }
        // Remove listeners after first interaction
        document.removeEventListener('click', resumeAudioContext);
        document.removeEventListener('keydown', resumeAudioContext);
        document.removeEventListener('touchstart', resumeAudioContext);
      };
      
      document.addEventListener('click', resumeAudioContext);
      document.addEventListener('keydown', resumeAudioContext);
      document.addEventListener('touchstart', resumeAudioContext);
      
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Play notification sound
  play() {
    console.log('🔊 Attempting to play notification sound...');
    
    if (!this.isSupported) {
      console.warn('Web Audio API not supported');
      return;
    }

    // Check user settings
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.soundEnabled === false) {
      console.log('Sound notifications disabled by user');
      return;
    }

    // Initialize if not already done
    this.init();

    // Resume audio context if suspended (required for autoplay policies)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      console.log('🔊 Resuming suspended audio context...');
      this.audioContext.resume().then(() => {
        console.log('🔊 Audio context resumed successfully');
        // Try to play sound again after resume
        setTimeout(() => this.playSoundInternal(), 100);
      }).catch(error => {
        console.error('🔊 Failed to resume audio context:', error);
        // Use fallback
        this.playFallback();
      });
      return;
    }

    console.log('🔊 Audio context state:', this.audioContext?.state);
    
    // Play sound immediately if context is ready
    this.playSoundInternal();
  }

  // Play pharmacist-specific notification sound (urgent, attention-grabbing)
  playPharmacistSound() {
    console.log('👨‍⚕️ Playing pharmacist notification sound...');
    
    if (!this.isSupported) return;

    // Check user settings
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.soundEnabled === false) {
      console.log('Sound notifications disabled by user');
      return;
    }

    this.init();

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('🔊 Audio context resumed for pharmacist sound');
        this.playPharmacistSoundInternal();
      }).catch(error => {
        console.error('🔊 Failed to resume audio context for pharmacist sound:', error);
        this.playFallback();
      });
      return;
    }

    this.playPharmacistSoundInternal();
  }

  // Play delivery-specific notification sound (distinctive, order-focused)
  playDeliverySound() {
    console.log('🚚 Playing delivery notification sound...');
    
    if (!this.isSupported) return;

    // Check user settings
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.soundEnabled === false) {
      console.log('Sound notifications disabled by user');
      return;
    }

    this.init();

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('🔊 Audio context resumed for delivery sound');
        this.playDeliverySoundInternal();
      }).catch(error => {
        console.error('🔊 Failed to resume audio context for delivery sound:', error);
        this.playFallback();
      });
      return;
    }

    this.playDeliverySoundInternal();
  }

  // Internal method to actually play the sound
  playSoundInternal() {
    try {
      // Create oscillator for the notification sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // 800 Hz
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1); // 600 Hz
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2); // Back to 800 Hz
      
      // Get user volume setting
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      const volume = settings.volume || 0.5;
      
      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3 * volume, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.3 * volume, this.audioContext.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);

      // Start and stop the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      // Clean up
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        console.log('🔊 Notification sound finished playing');
      };

      console.log('🔊 Notification sound started successfully');

    } catch (error) {
      console.warn('Failed to play notification sound:', error);
      
      // Fallback: try to resume audio context and play again
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('🔊 Trying to resume audio context and play again...');
        this.audioContext.resume().then(() => {
          setTimeout(() => this.play(), 100);
        });
      } else {
        // Use HTML5 audio fallback
        this.playFallback();
      }
    }
  }

  // Internal method for pharmacist-specific sound (urgent, medical-like)
  playPharmacistSoundInternal() {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Pharmacist sound: Medical alert-like pattern (higher frequency, urgent)
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime); // 1000 Hz
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1); // 1200 Hz
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.2); // Back to 1000 Hz
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.3); // 1200 Hz again
      
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      const volume = settings.volume || 0.5;
      
      // Configure volume envelope for pharmacist sound (longer duration)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4 * volume, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.4 * volume, this.audioContext.currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.4);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.4);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        console.log('👨‍⚕️ Pharmacist notification sound finished playing');
      };

      console.log('👨‍⚕️ Pharmacist notification sound started successfully');

    } catch (error) {
      console.warn('Failed to play pharmacist notification sound:', error);
      this.playFallback();
    }
  }

  // Internal method for delivery-specific sound (distinctive, order-focused)
  playDeliverySoundInternal() {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Delivery sound: Distinctive pattern (lower frequency, delivery-like)
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime); // 600 Hz
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.15); // 800 Hz
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.3); // Back to 600 Hz
      
      const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      const volume = settings.volume || 0.5;
      
      // Configure volume envelope for delivery sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.35 * volume, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.35 * volume, this.audioContext.currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.35);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.35);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        console.log('🚚 Delivery notification sound finished playing');
      };

      console.log('🚚 Delivery notification sound started successfully');

    } catch (error) {
      console.warn('Failed to play delivery notification sound:', error);
      this.playFallback();
    }
  }

  // Play a more attention-grabbing sound for high priority notifications
  playHighPriority() {
    console.log('🔊 Playing high priority notification sound...');
    
    if (!this.isSupported) return;

    // Check user settings
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.soundEnabled === false) {
      console.log('Sound notifications disabled by user');
      return;
    }

    this.init();

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('🔊 Audio context resumed for high priority sound');
        // Play multiple beeps for high priority
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.playSoundInternal();
          }, i * 200);
        }
      }).catch(error => {
        console.error('🔊 Failed to resume audio context for high priority:', error);
        // Use fallback
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.playFallback();
          }, i * 200);
        }
      });
      return;
    }

    try {
      // Play multiple beeps for high priority
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.playSoundInternal();
        }, i * 200);
      }
    } catch (error) {
      console.warn('Failed to play high priority notification sound:', error);
    }
  }

  // Play fallback HTML5 audio
  playFallback() {
    if (this.fallbackAudio) {
      console.log('🔊 Playing fallback HTML5 audio...');
      this.fallbackAudio.currentTime = 0;
      this.fallbackAudio.play().catch(error => {
        console.warn('Failed to play fallback audio:', error);
      });
    }
  }

  // Stop all sounds
  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.fallbackAudio) {
      this.fallbackAudio.pause();
      this.fallbackAudio.currentTime = 0;
    }
  }
}

// Create singleton instance
const notificationSound = new NotificationSound();

export default notificationSound; 