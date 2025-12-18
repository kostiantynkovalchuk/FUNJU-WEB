// Custom Video Player - UI Only
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
    if (this.heroVideo && this.heroContainer) {
      if (window.innerWidth <= 768) {
        this.setupHeroControls();
      } else {
        this.heroVideo.setAttribute('controls', 'controls');
      }
    }

    // Handle screen unlock
    this.handleVisibilityChange();
  }

  setupHeroControls() {
    // Create unmute button
    this.unmuteBtn = document.createElement('button');
    this.unmuteBtn.className = 'video-unmute-btn';
    this.unmuteBtn.innerHTML = '🔇';
    this.heroContainer.appendChild(this.unmuteBtn);

    // Create replay button
    this.replayBtn = document.createElement('button');
    this.replayBtn.className = 'video-replay-btn';
    this.replayBtn.innerHTML = '↻';
    this.replayBtn.style.display = 'none';
    this.heroContainer.appendChild(this.replayBtn);

    // Event listeners
    this.unmuteBtn.addEventListener('click', () => this.toggleMute());
    this.replayBtn.addEventListener('click', () => this.replay());
    this.heroVideo.addEventListener('ended', () => this.showReplayButton());
  }

  handleVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Resume videos if they were playing before (but don't reset them with .load())
        setTimeout(() => {
          if (this.heroVideo && this.heroVideo.paused && !this.hasPlayedOnce) {
            this.heroVideo.play().catch(e => console.log('Hero resume blocked:', e));
          }
          if (this.productVideo && this.productVideo.paused) {
            this.productVideo.play().catch(e => console.log('Product resume blocked:', e));
          }
        }, 100);
      }
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.heroVideo.muted = this.isMuted;
    this.unmuteBtn.innerHTML = this.isMuted ? '🔇' : '🔊';
  }

  showReplayButton() {
    this.hasPlayedOnce = true;
    this.replayBtn.style.display = 'flex';
    this.unmuteBtn.style.display = 'none';
  }

  replay() {
    this.heroVideo.currentTime = 0;
    this.heroVideo.play();
    this.replayBtn.style.display = 'none';
    this.unmuteBtn.style.display = 'flex';
    this.hasPlayedOnce = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new VideoPlayer();
});
