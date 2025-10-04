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
    // Set cookie/localStorage to remember verification
    this.setAgeVerified();
    this.hideAgeGate();
    this.trackVerification("verified");

    // Show welcome message
    setTimeout(() => {
      if (typeof showNotification === "function") {
        showNotification(
          "🎉 Welcome! Scroll down to discover what makes Funju special",
          "success"
        );
      }
    }, 1000);
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
