// Custom Video Player with Mobile-Optimized Controls
class VideoPlayer {
  constructor() {
    this.video = document.querySelector('.hero-video');
    this.container = document.querySelector('.hero-video-container');
    this.isMuted = true;
    this.hasPlayedOnce = false;
    this.init();
  }

  init() {
    if (!this.video || !this.container) return;

    // Setup custom controls on mobile
    if (window.innerWidth <= 768) {
      this.setupCustomControls();
    } else {
      // Add controls for desktop
      this.video.setAttribute('controls', 'controls');
    }
  }

  setupCustomControls() {
    // Ensure video is properly configured for iOS
    this.video.muted = true;
    this.video.setAttribute('muted', 'muted');
    this.video.setAttribute('playsinline', 'playsinline');
    this.video.setAttribute('webkit-playsinline', 'webkit-playsinline');
    this.video.load(); // Force reload with correct attributes

    // Create unmute button
    this.unmuteBtn = document.createElement('button');
    this.unmuteBtn.className = 'video-unmute-btn';
    this.unmuteBtn.innerHTML = '🔊';
    this.unmuteBtn.setAttribute('aria-label', 'Unmute video');
    this.container.appendChild(this.unmuteBtn);

    // Create replay button (hidden initially)
    this.replayBtn = document.createElement('button');
    this.replayBtn.className = 'video-replay-btn';
    this.replayBtn.innerHTML = '↻';
    this.replayBtn.setAttribute('aria-label', 'Replay video');
    this.replayBtn.style.display = 'none';
    this.container.appendChild(this.replayBtn);

    // Try autoplay after short delay (iOS fix)
    setTimeout(() => {
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay prevented:', error);
        });
      }
    }, 300);

    // Event listeners
    this.unmuteBtn.addEventListener('click', () => this.toggleMute());
    this.replayBtn.addEventListener('click', () => this.replay());

    // Show replay button after 7 seconds
    this.video.addEventListener('timeupdate', () => {
      if (this.video.currentTime >= 7 && !this.hasPlayedOnce) {
        this.hasPlayedOnce = true;
        this.showReplayButton();
      }
    });

    // Also show replay when video ends
    this.video.addEventListener('ended', () => {
      this.showReplayButton();
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.video.muted = this.isMuted;
    this.unmuteBtn.innerHTML = this.isMuted ? '🔊' : '🔇';
    this.unmuteBtn.setAttribute('aria-label', this.isMuted ? 'Unmute video' : 'Mute video');
  }

  showReplayButton() {
    this.replayBtn.style.display = 'flex';
    this.replayBtn.style.animation = 'fadeIn 0.5s ease';
  }

  replay() {
    this.video.currentTime = 0;
    this.video.play();
    this.replayBtn.style.display = 'none';
    this.hasPlayedOnce = false;
    // Maintain audio state - don't reset mute
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VideoPlayer();
});
