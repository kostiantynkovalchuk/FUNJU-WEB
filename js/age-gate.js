// Age Gate functionality
class AgeGate {
  constructor() {
    this.ageGate = document.getElementById("ageGate");
    this.ageYes = document.getElementById("ageYes");
    this.ageNo = document.getElementById("ageNo");
    this.init();
  }

  init() {
    // Check if age has already been verified
    if (this.isAgeVerified()) {
      this.hideAgeGate();

      // CRITICAL: Play videos for returning visitors
      this.playVideos();
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    this.ageYes.addEventListener("click", () => this.verifyAge());
    this.ageNo.addEventListener("click", () => this.redirectUnderage());

    // Prevent right-click and other context menus
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Prevent keyboard shortcuts that might bypass age gate
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
      }
    });
  }

  verifyAge() {
    this.setAgeVerified();
    this.hideAgeGate();
    this.trackVerification("verified");

    // Play videos for first-time visitors
    this.playVideos();
  }

  // NEW METHOD: Centralized video play logic
  playVideos() {
    setTimeout(() => {
      const heroVideo = document.querySelector('.hero-video');
      const productVideo = document.querySelector('.product-video');

      const playWhenReady = (video) => {
        if (video.readyState >= 2) {
          video.play().catch(e => console.log('Play blocked:', e));
        } else {
          video.addEventListener('loadeddata', () => {
            video.play().catch(e => console.log('Play blocked:', e));
          }, { once: true });
        }
      };

      if (heroVideo) playWhenReady(heroVideo);
      if (productVideo) playWhenReady(productVideo);
    }, 500);
  }

  redirectUnderage() {
    this.trackVerification("underage");
    window.location.href = "https://google.com";
  }

  hideAgeGate() {
    this.ageGate.classList.add("hidden");
    document.body.style.overflow = "auto"; // Re-enable scrolling
  }

  isAgeVerified() {
    return (
      localStorage.getItem("funju_age_verified") === "true" ||
      document.cookie.includes("funju_age_verified=true")
    );
  }

  setAgeVerified() {
    // Set both cookie and localStorage for redundancy
    localStorage.setItem("funju_age_verified", "true");

    // Set cookie that expires in 30 days
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `funju_age_verified=true; expires=${date.toUTCString()}; path=/; Secure; SameSite=Strict`;
  }

  trackVerification(status) {
    if (typeof trackEvent === "function") {
      trackEvent("age_verification", { status: status });
    }
  }
}

// Initialize age gate when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AgeGate();
});
