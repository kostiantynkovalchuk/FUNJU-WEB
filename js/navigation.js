// Navigation and mobile menu functionality
class Navigation {
  constructor() {
    this.hamburger = document.getElementById("hamburger");
    this.navMenu = document.getElementById("navMenu");
    this.navLinks = document.querySelectorAll(".nav a");
    this.header = document.querySelector(".header");
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    // Hamburger menu toggle
    this.hamburger.addEventListener("click", () => this.toggleMenu());

    // Close menu when clicking on links
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => this.closeMenu());
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => this.handleClickOutside(e));

    // Language switcher
    document
      .getElementById("switchLang")
      .addEventListener("click", () => this.switchLanguage());

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => this.handleSmoothScroll(e));
    });

    // Header scroll effect
    window.addEventListener("scroll", () => this.handleScroll());
  }

  toggleMenu() {
    this.navMenu.classList.toggle("active");
    this.hamburger.classList.toggle("active");

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.navMenu.classList.contains("active")
      ? "hidden"
      : "auto";
  }

  closeMenu() {
    this.navMenu.classList.remove("active");
    this.hamburger.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  handleClickOutside(e) {
    if (
      !this.navMenu.contains(e.target) &&
      !this.hamburger.contains(e.target)
    ) {
      this.closeMenu();
    }
  }

  handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href");

    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerHeight = this.header.offsetHeight;
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        20;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  }

  handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      this.header.classList.add("scrolled");
    } else {
      this.header.classList.remove("scrolled");
    }

    // Update active navigation link based on scroll position
    this.updateActiveNavLink();
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav a");

    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;

      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  switchLanguage() {
    const currentLang = document.querySelector(
      ".lang-switcher .active"
    ).textContent;
    const newLang = currentLang === "EN" ? "UA" : "EN";

    // Update active language
    document.querySelectorAll(".lang-switcher span").forEach((span) => {
      span.classList.remove("active");
      if (span.textContent === newLang) {
        span.classList.add("active");
      }
    });

    // Track language switch
    if (typeof trackEvent === "function") {
      trackEvent("language_switch", { from: currentLang, to: newLang });
    }

    // Here you would implement actual language switching
    console.log(`Switching to ${newLang}`);

    // Show notification
    showNotification(`Language switched to ${newLang}`, "info");
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Navigation();
});
