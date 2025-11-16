// Events and registration functionality (English version)
class Events {
  constructor() {
    this.eventButtons = document.querySelectorAll(".event-register");
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.eventButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const eventId = e.target.getAttribute("data-event");
        this.showRegistrationModal(eventId);
      });
    });
  }

  showRegistrationModal(eventId) {
    const eventTitles = {
      "summer-party": "Kyiv Rooftop Experience",
      "lviv-launch": "Lviv Launch Party",
      "odesa-beach": "Odesa Beach Festival",
    };

    const socialProof = {
      "summer-party": "🔥 127 people already registered!",
      "lviv-launch": "⚡ Only 23 spots left!",
      "odesa-beach": "🌊 85% full - hurry!",
    };

    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 style="margin-bottom: 10px; color: #333;">🎉 Join ${eventTitles[eventId]}!</h2>
                    <p style="color: #667eea; font-weight: 600; font-size: 14px;">${socialProof[eventId]}</p>
                </div>
                <form id="eventRegistrationForm">
                    <input type="hidden" name="eventId" value="${eventId}">
                    <div style="margin-bottom: 15px;">
                        <input type="text" name="name" placeholder="Your Name *" required
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <input type="email" name="email" placeholder="Your Email *" required
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <input type="tel" name="phone" placeholder="Your Phone (for event updates)"
                               style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <select name="age" required style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; box-sizing: border-box;">
                            <option value="">Select Your Age Range *</option>
                            <option value="18-24">18-24 years old</option>
                            <option value="25-34">25-34 years old</option>
                            <option value="35-44">35-44 years old</option>
                            <option value="45+">45+ years old</option>
                        </select>
                    </div>
                    <div style="background: #f8f9ff; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e8ebff;">
                        <label style="display: flex; align-items: center; font-size: 14px; color: #666;">
                            <input type="checkbox" name="marketing" value="yes" checked style="margin-right: 10px;">
                            📱 Get exclusive Funju party invites & offers
                        </label>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 1; padding: 15px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 16px;">🎊 Secure My Spot!</button>
                        <button type="button" class="btn-secondary" style="padding: 15px 20px;">Cancel</button>
                    </div>
                </form>
            </div>
        `;

    document.body.appendChild(modal);

    // Bind modal events
    this.bindModalEvents(modal, eventId);
  }

  bindModalEvents(modal, eventId) {
    const closeBtn = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-secondary");
    const form = modal.querySelector("#eventRegistrationForm");

    const closeModal = () => {
      modal.style.animation = "slideDown 0.3s ease";
      setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleRegistration(e, eventId, modal);
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  async handleRegistration(e, eventId, modal) {
    const formData = new FormData(e.target);
    const registrationData = Object.fromEntries(formData);

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Saving...';
    submitBtn.disabled = true;

    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([
          {
            event_id: registrationData.eventId,
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone || null,
            age_range: registrationData.age,
            marketing_consent: registrationData.marketing === 'yes',
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Track registration
      if (typeof trackEvent === "function") {
        trackEvent("event_registration", {
          event_id: eventId,
          ...registrationData,
          timestamp: Date.now(),
        });
      }

      // Close modal with success animation
      modal.style.animation = "slideDown 0.3s ease";
      setTimeout(() => modal.remove(), 300);

      // Show success message
      if (typeof showNotification === "function") {
        showNotification("🎉 You're IN! Check your email for event details and your FREE welcome drink voucher!", "success");
      } else {
        alert("🎉 You're IN! Check your email for event details and your FREE welcome drink voucher!");
      }
    } catch (error) {
      console.error('Registration error:', error);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (typeof showNotification === "function") {
        showNotification("❌ Registration failed. Please try again or contact us.", "error");
      } else {
        alert("❌ Registration failed. Please try again or contact us.");
      }
    }
  }
}

// Initialize events when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Events();
});
