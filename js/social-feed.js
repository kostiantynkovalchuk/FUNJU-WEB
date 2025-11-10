// Social Media Feed - Instagram & TikTok Embeds
class SocialFeed {
  constructor() {
    this.feedContainer = document.getElementById("socialFeed");

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
        type: "instagram",
        url: "https://www.instagram.com/reel/DQJMwjgjLtY/",
      },
      {
        type: "instagram",
        url: "https://www.instagram.com/reel/DQb1GQZDBVn/",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@sviiiiy/video/7565947315932925196",
      },
      {
        type: "instagram",
        url: "https://www.instagram.com/reel/DQEztMRCmZ9/",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@xyda_ja_sterva/video/7563294418929847608",
      },
      {
        type: "tiktok",
        url: "https://www.tiktok.com/@xrama.soma/video/7564444213828439307",
      },
    ];

    this.init();
  }

  init() {
    // Only render if feed container exists
    if (this.feedContainer) {
      this.renderFeed();
    }
  }

  renderFeed() {
    this.feedContainer.innerHTML = "";

    this.posts.forEach((post, index) => {
      const card = this.createSocialCard(post, index);
      this.feedContainer.appendChild(card);
    });

    // Reload embed scripts after rendering
    this.loadEmbeds();
  }

  createSocialCard(post, index) {
    const card = document.createElement("div");
    card.className = `social-card ${post.type}-card`;

    const header = this.createHeader(post.type);
    const content =
      post.type === "instagram"
        ? this.createInstagramEmbed(post.url)
        : this.createTikTokEmbed(post.url);

    card.appendChild(header);
    card.appendChild(content);

    return card;
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
        <h4>@funju.soju</h4>
        <span>${platformName}</span>
      </div>
    `;

    return header;
  }

  createInstagramEmbed(url) {
    const container = document.createElement("div");

    if (url) {
      // Real Instagram embed
      container.innerHTML = `
        <blockquote
          class="instagram-media"
          data-instgrm-captioned
          data-instgrm-permalink="${url}"
          data-instgrm-version="14"
          style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 0; max-width:100%; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
        </blockquote>
      `;
    } else {
      // Placeholder when no URL provided
      container.className = "social-media-placeholder instagram-placeholder";
      container.innerHTML = `
        <div class="placeholder-icon">📷</div>
        <p>Instagram Post</p>
        <a href="https://www.instagram.com/funju.soju" target="_blank" class="view-post-btn">
          Переглянути в Instagram
        </a>
      `;
    }

    return container;
  }

  createTikTokEmbed(url) {
    const container = document.createElement("div");

    if (url) {
      // Extract video ID from URL
      const videoId = url.match(/\/(video|photo)\/(\d+)/)?.[2];

      // Real TikTok embed - supports both video and photo
      container.innerHTML = `
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
    } else {
      // Placeholder when no URL provided
      container.className = "social-media-placeholder tiktok-placeholder";
      container.innerHTML = `
        <div class="placeholder-icon">🎵</div>
        <p>TikTok Post</p>
        <a href="https://www.tiktok.com/@funju.soju" target="_blank" class="view-post-btn">
          Переглянути в TikTok
        </a>
      `;
    }

    return container;
  }

  loadEmbeds() {
    // Reload Instagram embeds
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }

    // Reload TikTok embeds
    if (window.tiktokEmbed) {
      window.tiktokEmbed.lib.render(document.querySelectorAll(".tiktok-embed"));
    }

    // Force masonry reflow after embeds load
    setTimeout(() => {
      const grid = document.querySelector(".fans-grid");
      if (grid) {
        grid.style.display = "none";
        grid.offsetHeight; // Force reflow
        grid.style.display = "";
      }
    }, 1000);
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
