// Custom Video Player with Mobile-Optimized Controls
class VideoPlayer {
  constructor() {
    this.heroVideo = document.querySelector('.hero-video');
    this.heroContainer = document.querySelector('.hero-video-container');
    this.productVideo = document.querySelector('.product-video');
    this.isMuted = true;
    this.hasPlayedOnce = false;
    this.init();
  }

  init() {
    // Setup hero video controls
    if (this.heroVideo && this.heroContainer) {
      if (window.innerWidth <= 768) {
        this.setupHeroControls();
      } else {
        // Add controls for desktop
        this.heroVideo.setAttribute('controls', 'controls');
      }
    }

    // Setup product video (autoplay loop on all devices)
    if (this.productVideo) {
      this.setupProductVideo();
    }
  }

  setupHeroControls() {
    // Ensure video is properly configured for iOS
    this.heroVideo.muted = true;
    this.heroVideo.setAttribute('muted', 'muted');
    this.heroVideo.setAttribute('playsinline', 'playsinline');
    this.heroVideo.setAttribute('webkit-playsinline', 'webkit-playsinline');
    this.heroVideo.load(); // Force reload with correct attributes

    // Create unmute button
    this.unmuteBtn = document.createElement('button');
    this.unmuteBtn.className = 'video-unmute-btn';
    this.unmuteBtn.innerHTML = '🔊';
    this.unmuteBtn.setAttribute('aria-label', 'Unmute video');
    this.heroContainer.appendChild(this.unmuteBtn);

    // Create replay button (hidden initially)
    this.replayBtn = document.createElement('button');
    this.replayBtn.className = 'video-replay-btn';
    this.replayBtn.innerHTML = '↻';
    this.replayBtn.setAttribute('aria-label', 'Replay video');
    this.replayBtn.style.display = 'none';
    this.heroContainer.appendChild(this.replayBtn);

    // Try autoplay after short delay (iOS fix)
    setTimeout(() => {
      const playPromise = this.heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Hero video autoplay prevented:', error);
        });
      }
    }, 300);

    // Event listeners
    this.unmuteBtn.addEventListener('click', () => this.toggleMute());
    this.replayBtn.addEventListener('click', () => this.replay());

    // Stop video and show replay button when it ends (plays once only)
    this.heroVideo.addEventListener('ended', () => {
      this.showReplayButton();
    });
  }

  setupProductVideo() {
    // Ensure product video loops continuously on mobile
    this.productVideo.setAttribute('autoplay', 'autoplay');
    this.productVideo.setAttribute('loop', 'loop');
    this.productVideo.setAttribute('muted', 'muted');
    this.productVideo.setAttribute('playsinline', 'playsinline');
    this.productVideo.muted = true;

    // Force play if autoplay fails
    setTimeout(() => {
      if (this.productVideo.paused) {
        const playPromise = this.productVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Product video autoplay prevented:', error);
          });
        }
      }
    }, 300);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.heroVideo.muted = this.isMuted;
    this.unmuteBtn.innerHTML = this.isMuted ? '🔊' : '🔇';
    this.unmuteBtn.setAttribute('aria-label', this.isMuted ? 'Unmute video' : 'Mute video');
  }

  showReplayButton() {
    this.replayBtn.style.display = 'flex';
    this.replayBtn.style.animation = 'fadeIn 0.5s ease';
    this.unmuteBtn.style.display = 'none'; // Hide unmute button when video ends
  }

  replay() {
    this.heroVideo.currentTime = 0;
    this.heroVideo.play();
    this.replayBtn.style.display = 'none';
    this.unmuteBtn.style.display = 'flex'; // Show unmute button again
    this.hasPlayedOnce = false;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VideoPlayer();
});
