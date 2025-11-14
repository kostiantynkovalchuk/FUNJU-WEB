// Main application functionality and utilities
class FunjuApp {
  constructor() {
    this.init();
  }

  init() {
    this.trackPageLoad();
    this.initServiceWorker();
    this.initPerformanceMonitoring();
    this.initTouchImprovements();
    this.initErrorHandling();
  }

  trackPageLoad() {
    if (typeof trackEvent === "function") {
      trackEvent("page_load", {
        referrer: document.referrer,
        page_title: document.title,
        language: navigator.language,
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        device_type: this.getDeviceType(),
      });
    }

    // Track page fully loaded
    window.addEventListener("load", () => {
      if (typeof trackEvent === "function") {
        trackEvent("page_fully_loaded", {
          load_time: Date.now() - performance.timeOrigin,
        });
      }
    });
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  }

  initServiceWorker() {
    // Register service worker for PWA capabilities
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }

  initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (typeof trackEvent === "function") {
            trackEvent("performance_metric", {
              metric: entry.name,
              value: entry.value,
              rating: this.getPerformanceRating(entry.value, entry.name),
            });
          }
        });
      });

      observer.observe({
        entryTypes: [
          "paint",
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
        ],
      });
    }
  }

  getPerformanceRating(value, metric) {
    // Simple rating system for performance metrics
    const thresholds = {
      "first-contentful-paint": { good: 1000, poor: 3000 },
      "largest-contentful-paint": { good: 2500, poor: 4000 },
      "first-input-delay": { good: 100, poor: 300 },
      "cumulative-layout-shift": { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return "unknown";

    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  }

  initTouchImprovements() {
    // Enhance touch interactions for mobile
    if (this.getDeviceType() === "mobile") {
      document
        .querySelectorAll(".btn, .cta-buy, .event-register")
        .forEach((element) => {
          element.addEventListener("touchstart", function () {
            this.style.transform = "scale(0.98)";
          });

          element.addEventListener("touchend", function () {
            this.style.transform = "scale(1)";
          });
        });

      // Prevent zoom on double-tap
      let lastTouchEnd = 0;
      document.addEventListener(
        "touchend",
        (event) => {
          const now = Date.now();
          if (now - lastTouchEnd <= 300) {
            event.preventDefault();
          }
          lastTouchEnd = now;
        },
        false
      );
    }
  }

  initErrorHandling() {
    // Global error handler
    window.addEventListener("error", (event) => {
      if (typeof trackEvent === "function") {
        trackEvent("javascript_error", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    });

    // Promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      if (typeof trackEvent === "function") {
        trackEvent("promise_rejection", {
          reason: event.reason?.toString() || "Unknown error",
        });
      }
    });
  }
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  const bgColor =
    type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#667eea";

  notification.className = "notification";
  notification.classList.add(type);
  notification.innerHTML = `
        <span style="font-size: 14px; line-height: 1.4;">${message}</span>
        <button class="notification-close">&times;</button>
    `;

  document.body.appendChild(notification);

  // Close button event
  notification
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Analytics tracking function
function trackEvent(eventName, properties = {}) {
  const eventData = {
    event: eventName,
    timestamp: Date.now(),
    url: window.location.href,
    ...properties,
  };

  console.log("📊 Analytics Event:", eventData);

  // Here you would send to your analytics service
  // Example: gtag('event', eventName, properties);
  // Example: mixpanel.track(eventName, eventData);

  // Send to backend API (example)
  this.sendToBackend(eventData);
}

// Example backend integration
function sendToBackend(eventData) {
  // Skip analytics when running locally (file:// protocol)
  if (window.location.protocol === 'file:') {
    return;
  }

  // This would be your actual backend endpoint
  const endpoint = "/api/analytics";

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  }).catch((error) => {
    console.error("Analytics error:", error);
  });
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FunjuApp();
});

// Export functions for global access (if needed)
window.showNotification = showNotification;
window.trackEvent = trackEvent;
