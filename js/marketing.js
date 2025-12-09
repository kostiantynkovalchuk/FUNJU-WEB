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

    // Find form submission - Disabled (handled by store-finder.js)
    // this.findForm.addEventListener("submit", (e) => this.handleFindForm(e));

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
                <h2 style="margin-bottom: 15px; color: #333;">${window.t('buyModalTitle')}</h2>
                <p style="color: #666; margin-bottom: 25px; font-size: 14px;">${window.t('buyModalDescription')}</p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <a href="https://rozetka.com.ua/ua/vodka/c4649154/producer=funju/" target="_blank" class="store-btn" style="text-decoration: none; display: block; text-align: center; padding: 15px 20px; background: linear-gradient(45deg, #4CAF50, #45a049); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s;">
                        ${window.t('buyModalRozetka')}
                    </a>
                </div>
                <button class="btn-secondary" style="margin-top: 15px; width: 100%;">${window.t('buyModalLater')}</button>
            </div>
        `;

    document.body.appendChild(modal);
    this.bindPurchaseModalEvents(modal);
  }

  bindPurchaseModalEvents(modal) {
    const closeBtn = modal.querySelector(".modal-close");
    const laterBtn = modal.querySelector(".btn-secondary");
    let isClosing = false;

    const closeModal = () => {
      if (isClosing) return;
      isClosing = true;
      modal.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });

    laterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
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
                <h2 style="margin-bottom: 15px; color: #333;">${window.t('shareModalTitle')}</h2>
                <p style="margin-bottom: 25px; color: #666; font-size: 14px; line-height: 1.5;">
                    ${window.t('shareModalDescription')}
                </p>

                <div style="background: linear-gradient(45deg, #f8f9ff, #e8ebff); padding: 20px; border-radius: 15px; margin-bottom: 25px;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">${window.t('shareModalPrizes')}</h3>
                    <div style="text-align: left; font-size: 14px; color: #333;">
                        ${window.t('shareModalPrize1')}
                        ${window.t('shareModalPrize2')}
                        ${window.t('shareModalPrize3')}
                        ${window.t('shareModalPrize4')}
                    </div>
                </div>

                <form id="ugcSubmissionForm">
                    <div style="margin-bottom: 15px;">
                        <input type="text" name="userName" placeholder="${window.t('shareModalYourName')}" required
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <input type="email" name="userEmail" placeholder="${window.t('shareModalYourEmail')}" required
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <select name="platform" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                            <option value="">${window.t('shareModalPlatform')}</option>
                            <option value="instagram">${window.t('shareModalPlatformInstagram')}</option>
                            <option value="tiktok">${window.t('shareModalPlatformTiktok')}</option>
                            <option value="youtube">${window.t('shareModalPlatformYoutube')}</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <input type="url" name="contentUrl" placeholder="${window.t('shareModalContentUrl')}" required
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                        <small style="color: #999; font-size: 12px; display: block; margin-top: 5px;">${window.t('shareModalUrlHint')}</small>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 1; padding: 15px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 16px;">${window.t('shareModalSubmit')}</button>
                        <button type="button" class="btn-secondary" style="padding: 15px 20px;">${window.t('eventModalCancel')}</button>
                    </div>
                </form>
            </div>
        `;

    document.body.appendChild(modal);
    this.bindShareModalEvents(modal);
  }

  bindShareModalEvents(modal) {
    const closeBtn = modal.querySelector(".modal-close");
    const closeBtn2 = modal.querySelector(".btn-secondary");
    const form = modal.querySelector("#ugcSubmissionForm");
    let isClosing = false;

    const closeModal = () => {
      if (isClosing) return;
      isClosing = true;
      modal.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });

    closeBtn2.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleUGCSubmission(e, modal);
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  async handleUGCSubmission(e, modal) {
    const formData = new FormData(e.target);
    const ugcData = Object.fromEntries(formData);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = window.t('shareModalSubmitting');
    submitBtn.disabled = true;

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('ugc_submissions')
        .insert([
          {
            user_name: ugcData.userName,
            user_email: ugcData.userEmail,
            platform: ugcData.platform,
            content_url: ugcData.contentUrl,
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Send email notification via backend endpoint
      await fetch('/api/send-ugc-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'sojufunju@gmail.com',
          subject: `New UGC Submission - ${ugcData.platform}`,
          userName: ugcData.userName,
          userEmail: ugcData.userEmail,
          platform: ugcData.platform,
          contentUrl: ugcData.contentUrl,
        }),
      }).catch(err => {
        console.error('Email notification failed:', err);
        // Continue even if email fails - data is saved in DB
      });

      // Track submission
      if (typeof trackEvent === "function") {
        trackEvent("ugc_submission", {
          platform: ugcData.platform,
          timestamp: Date.now(),
        });
      }

      // Close modal
      modal.style.animation = "slideDown 0.3s ease";
      setTimeout(() => modal.remove(), 300);

      // Show success message
      if (typeof showNotification === "function") {
        showNotification(window.t('shareModalSuccess'), "success");
      } else {
        alert(window.t('shareModalSuccess'));
      }
    } catch (error) {
      console.error('UGC submission error:', error);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (typeof showNotification === "function") {
        showNotification(window.t('shareModalError'), "error");
      } else {
        alert(window.t('shareModalError'));
      }
    }
  }

  handleNewsletterSubscription() {
    const email = this.newsletterEmail.value.trim();

    if (!email) {
      alert("Please enter your email to join the Funju family!");
      return;
    }

    if (typeof trackEvent === "function") {
      trackEvent("newsletter_signup", { email: email });
    }

    // Clear input
    this.newsletterEmail.value = "";

    alert("🎉 Welcome to the family! Check your email for your welcome gift!");
  }

  initScrollTriggers() {
    // Scroll triggers disabled - no automatic notifications
    window.addEventListener("scroll", () => {
      const scrollPercent =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;

      // Track scroll events without notifications
      if (scrollPercent > 25 && typeof trackEvent === "function") {
        trackEvent("quarter_page_reached");
      }
      if (scrollPercent > 50 && typeof trackEvent === "function") {
        trackEvent("middle_page_reached");
      }
      if (scrollPercent > 75 && typeof trackEvent === "function") {
        trackEvent("bottom_page_reached");
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
