// Social Media Feed - Instagram & TikTok Embeds with Lazy Loading
class SocialFeed {
  constructor() {
    this.feedContainer = document.getElementById("socialFeed");
    this.loadedCards = new Set();

    // TODO: Replace these with actual post URLs from your Instagram/TikTok
    // Instagram: Use full post URL: https://www.instagram.com/p/POST_ID/
    // TikTok Video: Use full URL: https://www.tiktok.com/@username/video/VIDEO_ID
    // TikTok Photo: Use full URL: https://www.tiktok.com/@username/photo/PHOTO_ID
    this.posts = [
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@slesariusss/video/7565118925277580600",
      },
      {
        type: "instagram",
        url: "https://www.instagram.com/reel/DQCaP03DF6k/",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@lessyk_inst/video/7568907598938869003",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@sviiiiy/video/7565947315932925196",
      },
      {
        type: "instagram",
        url: "https://www.instagram.com/reel/DQb1GQZDBVn/",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@xyda_ja_sterva/video/7563294418929847608",
      },
    ];

    this.init();
  }

  init() {
    // Only render if feed container exists
    if (this.feedContainer) {
      this.renderFeed();
      this.setupLazyLoading();
    }
  }

  renderFeed() {
    this.feedContainer.innerHTML = "";

    this.posts.forEach((post, index) => {
      const card = this.createSocialCard(post, index);
      this.feedContainer.appendChild(card);
    });

    // Load TikTok embeds immediately
    this.loadTikTokEmbeds();
  }

  setupLazyLoading() {
    const options = {
      root: null,
      rootMargin: "50px",
      threshold: 0.01,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.loadedCards.has(entry.target)) {
          this.loadedCards.add(entry.target);
          this.loadCardEmbed(entry.target);
        }
      });
    }, options);

    // Only observe Instagram cards for lazy loading
    const instagramCards = this.feedContainer.querySelectorAll(".instagram-card");
    instagramCards.forEach((card) => observer.observe(card));
  }

  loadTikTokEmbeds() {
    const tiktokCards = this.feedContainer.querySelectorAll(".tiktok-card");
    tiktokCards.forEach((card) => {
      this.loadCardEmbed(card);
    });
  }

  loadCardEmbed(card) {
    const embedContainer = card.querySelector('[data-embed-url]');
    if (!embedContainer) return;

    const url = embedContainer.dataset.embedUrl;
    const type = embedContainer.dataset.embedType;

    if (type === "instagram") {
      embedContainer.innerHTML = `
        <blockquote
          class="instagram-media"
          data-instgrm-captioned
          data-instgrm-permalink="${url}"
          data-instgrm-version="14"
          style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 0; max-width:100%; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
        </blockquote>
      `;
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    } else if (type === "tiktok") {
      const videoId = url.match(/\/(video|photo)\/(\d+)/)?.[2];
      embedContainer.innerHTML = `
        <blockquote
          class="tiktok-embed"
          cite="${url}"
          data-video-id="${videoId}"
          style="max-width: 605px; min-width: 325px;">
          <section>
            <a target="_blank" href="${url}">@funju.soju</a>
          </section>
        </blockquote>
      `;
      if (window.tiktokEmbed) {
        window.tiktokEmbed.lib.render(embedContainer.querySelector(".tiktok-embed"));
      }
    }
  }

  createSocialCard(post, index) {
    const card = document.createElement("div");
    card.className = `social-card ${post.type}-card`;

    const header = this.createHeader(post.type);
    const placeholder = this.createPlaceholder(post.type, post.url);

    card.appendChild(header);
    card.appendChild(placeholder);

    return card;
  }

  createPlaceholder(type, url) {
    const container = document.createElement("div");
    container.className = `social-media-placeholder ${type}-placeholder`;
    container.setAttribute("data-embed-url", url);
    container.setAttribute("data-embed-type", type);

    const icon = type === "instagram" ? "📷" : "🎵";
    const text = type === "instagram" ? "Instagram Post" : "TikTok Video";

    container.innerHTML = `
      <div class="placeholder-icon">${icon}</div>
      <p>${text}</p>
      <div style="font-size: 12px; color: #999; margin-top: 10px;">Loading...</div>
    `;

    return container;
  }

  createHeader(type) {
    const header = document.createElement("div");
    header.className = "social-header";

    const avatarClass =
      type === "instagram" ? "instagram-avatar" : "tiktok-avatar";
    const platformName = type === "instagram" ? "Instagram" : "TikTok";

    header.innerHTML = `
      <div class="social-avatar ${avatarClass}"></div>
      <div class="social-info">
        <span>${platformName}</span>
      </div>
    `;

    return header;
  }


  // Method to add new posts dynamically
  addPost(type, url) {
    const newPost = {
      type: type,
      url: url,
    };

    this.posts.unshift(newPost); // Add to beginning
    this.renderFeed();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.socialFeed = new SocialFeed();
});

// Example usage (you can call this from console to test):
// window.socialFeed.addPost('instagram', 'https://www.instagram.com/p/YOUR_POST_ID/');
// window.socialFeed.addPost('tiktok', 'https://www.tiktok.com/@funju.soju/video/YOUR_VIDEO_ID');
// window.socialFeed.addPost('tiktok', 'https://www.tiktok.com/@funju.soju/photo/YOUR_PHOTO_ID');
