// Marketing and AIDA flow functionality
class Marketing {
  constructor() {
    this.buyButtons = document.querySelectorAll("[data-track]");
    this.findForm = document.getElementById("findForm");
    this.shareButton = document.getElementById("shareMoment");
    this.newsletterEmail = document.getElementById("newsletterEmail");
    this.subscribeBtn = document.getElementById("subscribeBtn");
    this.init();
  }

  init() {
    this.bindEvents();
    this.initScrollTriggers();
    this.initIntersectionObserver();
  }

  bindEvents() {
    // Buy buttons
    this.buyButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const source = e.currentTarget.getAttribute("data-track");
        this.handleBuyClick(source);
      });
    });

    // Find form submission
    this.findForm.addEventListener("submit", (e) => this.handleFindForm(e));

    // Share moment
    this.shareButton.addEventListener("click", () => this.showShareModal());

    // Newsletter subscription
    this.subscribeBtn.addEventListener("click", () =>
      this.handleNewsletterSubscription()
    );
  }

  handleBuyClick(source) {
    // Track purchase intent
    if (typeof trackEvent === "function") {
      trackEvent("purchase_intent", { source: source, timestamp: Date.now() });
    }

    // Show purchase modal
    this.showPurchaseModal();
  }

  showPurchaseModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2 style="margin-bottom: 15px; color: #333;">🚀 Get Funju Now!</h2>
                <p style="color: #666; margin-bottom: 25px; font-size: 14px;">⚡ Limited stock available at these locations</p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="store-btn" data-store="silpo">🏪 Silpo - Available Now</button>
                    <button class="store-btn" data-store="auchan">🛒 Auchan - In Stock</button>
                    <button class="store-btn" data-store="novus">🏬 Novus - Order Online</button>
                    <div style="margin: 15px 0; padding: 10px; background: #f0f8ff; border-radius: 8px; border-left: 4px solid #667eea;">
                        <small style="color: #667eea; font-weight: 600;">💎 Use code FUNJU15 for 15% off your first purchase!</small>
                    </div>
                </div>
                <button class="btn-secondary" style="margin-top: 15px; width: 100%;">Maybe Later</button>
            </div>
        `;

    document.body.appendChild(modal);
    this.bindPurchaseModalEvents(modal);
  }

  bindPurchaseModalEvents(modal) {
    const closeBtn = modal.querySelector(".modal-close");
    const laterBtn = modal.querySelector(".btn-secondary");
    const storeBtns = modal.querySelectorAll(".store-btn");

    const closeModal = () => {
      modal.style.animation = "slideDown 0.3s ease";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", closeModal);
    laterBtn.addEventListener("click", closeModal);

    storeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const store = btn.getAttribute("data-store");
        this.redirectToStore(store);
        closeModal();
      });
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  redirectToStore(store) {
    const storeUrls = {
      silpo: "https://silpo.ua",
      auchan: "https://auchan.ua",
      novus: "https://novus.ua",
    };

    if (typeof trackEvent === "function") {
      trackEvent("partner_click", { partner: store });
    }

    window.open(storeUrls[store], "_blank");
  }

  handleFindForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);

    // Track lead generation
    if (typeof trackEvent === "function") {
      trackEvent("lead_generated", {
        ...userData,
        source: "store_locator",
        timestamp: Date.now(),
      });
    }

    // Update map with store locations
    this.updateStoreMap(userData.city);

    // Show success message
    showNotification(
      "🎉 Amazing! Check your email for your personal discount code and party invitations!",
      "success"
    );

    // Auto-scroll to events section
    setTimeout(() => {
      document.getElementById("events").scrollIntoView({ behavior: "smooth" });
      showNotification("👇 Ready for exclusive Funju experiences?", "info");
    }, 3000);
  }

  updateStoreMap(city) {
    const mapElement = document.getElementById("storeMap");
    mapElement.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 15px; text-align: left; width: 100%; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="color: #667eea; margin-bottom: 20px;">🎯 Funju Available Near You in ${city}:</h3>
                <div style="margin-bottom: 20px;">
                    <div style="margin: 12px 0; padding: 15px; background: linear-gradient(45deg, #f8f9ff, #e8ebff); border-radius: 10px; border-left: 4px solid #667eea;">
                        📍 <strong>Silpo</strong> - Maidan Nezalezhnosti, 1<br>
                        <small style="color: #667eea;">✅ In Stock • 🚗 5 min away</small>
                    </div>
                    <div style="margin: 12px 0; padding: 15px; background: linear-gradient(45deg, #f8f9ff, #e8ebff); border-radius: 10px; border-left: 4px solid #667eea;">
                        📍 <strong>Auchan</strong> - Prospekt Stepana Bandery, 34<br>
                        <small style="color: #667eea;">✅ In Stock • 🚗 8 min away</small>
                    </div>
                    <div style="margin: 12px 0; padding: 15px; background: linear-gradient(45deg, #f8f9ff, #e8ebff); border-radius: 10px; border-left: 4px solid #667eea;">
                        📍 <strong>Novus</strong> - Khreshchatyk Street, 15<br>
                        <small style="color: #667eea;">✅ In Stock • 🚗 3 min away</small>
                    </div>
                </div>
                <div style="background: linear-gradient(45deg, #667eea, #764ba2); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                    <h4 style="margin-bottom: 10px;">🎁 EXCLUSIVE BONUS FOR ${userData.name.toUpperCase()}!</h4>
                    <p style="margin-bottom: 15px; font-size: 14px;">Your personal 15% discount code:</p>
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; font-weight: 800; font-size: 18px; letter-spacing: 2px;">FUNJU15-${city.toUpperCase()}</div>
                    <small style="opacity: 0.9; margin-top: 10px; display: block;">✉️ Code also sent to your email!</small>
                </div>
            </div>
        `;
  }

  showShareModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2 style="margin-bottom: 15px; color: #333;">📸 Share & Get Rewarded!</h2>
                <p style="margin-bottom: 25px; color: #666; font-size: 14px; line-height: 1.5;">
                    Post your Funju moment with <strong>#FunjuMoments</strong> and <strong>@funju_ukraine</strong> to get featured on our page + win exclusive prizes!
                </p>
                
                <div style="background: linear-gradient(45deg, #f8f9ff, #e8ebff); padding: 20px; border-radius: 15px; margin-bottom: 25px;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">🎁 What You Can Win:</h3>
                    <div style="text-align: left; font-size: 14px; color: #333;">
                        • 🍾 <strong>Free Funju bottles</strong><br>
                        • 🎫 <strong>VIP party invitations</strong><br>
                        • 👕 <strong>Exclusive merchandise</strong><br>
                        • 📱 <strong>Feature on our social media</strong>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                    <button class="share-btn" data-platform="instagram">📷 Share on Instagram</button>
                    <button class="share-btn" data-platform="tiktok">🎵 Share on TikTok</button>
                    <button class="share-btn" data-platform="facebook">📘 Share on Facebook</button>
                </div>
                
                <button class="btn-secondary" style="width: 100%;">Close</button>
            </div>
        `;

    document.body.appendChild(modal);
    this.bindShareModalEvents(modal);
  }

  bindShareModalEvents(modal) {
    const closeBtn = modal.querySelector(".modal-close");
    const closeBtn2 = modal.querySelector(".btn-secondary");
    const shareBtns = modal.querySelectorAll(".share-btn");

    const closeModal = () => {
      modal.style.animation = "slideDown 0.3s ease";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", closeModal);
    closeBtn2.addEventListener("click", closeModal);

    shareBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const platform = btn.getAttribute("data-platform");
        this.handleShare(platform);
        closeModal();
      });
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  handleShare(platform) {
    const shareUrls = {
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      facebook: "https://facebook.com",
    };

    if (typeof trackEvent === "function") {
      trackEvent("social_share", { platform: platform });
    }

    window.open(shareUrls[platform], "_blank");
  }

  handleNewsletterSubscription() {
    const email = this.newsletterEmail.value.trim();

    if (!email) {
      showNotification(
        "💌 Please enter your email to join the Funju family!",
        "error"
      );
      return;
    }

    if (typeof trackEvent === "function") {
      trackEvent("newsletter_signup", { email: email });
    }

    showNotification(
      "🎉 Welcome to the family! Check your email for your welcome gift!",
      "success"
    );

    // Clear input
    this.newsletterEmail.value = "";

    // Follow-up notification
    setTimeout(() => {
      showNotification(
        "📱 Follow @funju_ukraine for daily party inspiration!",
        "info"
      );
    }, 3000);
  }

  initScrollTriggers() {
    let hasTriggeredInterest = false;
    let hasTriggeredDesire = false;
    let hasTriggeredAction = false;

    window.addEventListener("scroll", () => {
      const scrollPercent =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;

      // INTEREST trigger (25% scroll)
      if (scrollPercent > 25 && !hasTriggeredInterest) {
        hasTriggeredInterest = true;
        setTimeout(() => {
          showNotification(
            "🇰🇷 Did you know? Funju uses traditional Korean distillation methods!",
            "info"
          );
        }, 1000);
      }

      // DESIRE trigger (50% scroll)
      if (scrollPercent > 50 && !hasTriggeredDesire) {
        hasTriggeredDesire = true;
        if (typeof trackEvent === "function") {
          trackEvent("middle_page_reached");
        }
        setTimeout(() => {
          showNotification(
            "💡 Pro tip: Use code FUNJU15 for 15% off your first bottle!",
            "success"
          );
        }, 1500);
      }

      // ACTION trigger (75% scroll)
      if (scrollPercent > 75 && !hasTriggeredAction) {
        hasTriggeredAction = true;
        if (typeof trackEvent === "function") {
          trackEvent("bottom_page_reached");
        }
        setTimeout(() => {
          if (!document.querySelector(".modal-overlay")) {
            showNotification(
              "🔥 Ready to join the Funju experience? Tap the Buy button!",
              "info"
            );
          }
        }, 2000);
      }
    });
  }

  initIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animation
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";

          // Track section views
          const sectionId =
            entry.target.id || entry.target.className.split(" ")[0];
          if (typeof trackEvent === "function") {
            trackEvent("section_view", { section: sectionId });
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll("section").forEach((section) => {
      section.style.opacity = "0";
      section.style.transform = "translateY(30px)";
      section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(section);
    });
  }
}

// Initialize marketing when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Marketing();
});
