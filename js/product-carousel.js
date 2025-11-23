// Product Carousel Functionality
const products = [
  {
    taste: "Яблуко",
    videoWebm: "assets/product-mobile.webm",
    videoMp4: "assets/product-mobile.mp4",
  },
  {
    taste: "Цитрус",
    videoWebm: "assets/citrus.webm",
    videoMp4: "assets/citrus.mp4",
  },
  {
    taste: "Манго-маракуйя",
    videoWebm: "assets/mango.webm",
    videoMp4: "assets/mango.mp4",
  },
  {
    taste: "Персик",
    videoWebm: "assets/peach.webm",
    videoMp4: "assets/peach.mp4",
  },
  {
    taste: "Ананас",
    videoWebm: "assets/pineapple.webm",
    videoMp4: "assets/pineapple.mp4",
  },
  {
    taste: "Кавун",
    videoWebm: "assets/watermelon.webm",
    videoMp4: "assets/watermelon.mp4",
  },
];

let currentProductIndex = 0;

function updateProduct(index) {
  const product = products[index];
  const tasteElement = document.querySelector(".product-taste");
  const videoElement = document.querySelector(".product-video");
  const videoContainer = document.querySelector(".product-visual");
  const videoSources = videoElement.querySelectorAll("source");

  // Prevent multiple rapid clicks
  if (videoElement.classList.contains('switching')) return;
  videoElement.classList.add('switching');

  // Step 1: Fade out current content
  videoElement.style.opacity = "0";
  tasteElement.style.opacity = "0";

  // Add min-height to prevent container collapse
  videoContainer.style.minHeight = videoContainer.offsetHeight + 'px';

  // Step 2: After fade out completes, update content
  setTimeout(() => {
    // Preload new video in background
    const tempVideo = document.createElement('video');
    tempVideo.muted = true;
    tempVideo.playsInline = true;
    tempVideo.preload = "auto";

    const sourceWebm = document.createElement('source');
    sourceWebm.src = product.videoWebm;
    sourceWebm.type = 'video/webm';

    const sourceMp4 = document.createElement('source');
    sourceMp4.src = product.videoMp4;
    sourceMp4.type = 'video/mp4';

    tempVideo.appendChild(sourceWebm);
    tempVideo.appendChild(sourceMp4);

    // Step 3: When new video is ready, swap and fade in
    tempVideo.onloadeddata = () => {
      // Update taste text (instant, but invisible)
      tasteElement.textContent = product.taste;

      // Update actual video sources
      videoSources[0].src = product.videoWebm;
      videoSources[1].src = product.videoMp4;
      videoElement.load();

      // Play the video
      videoElement.play().then(() => {
        // Step 4: Fade in new content together
        videoElement.style.opacity = "1";
        tasteElement.style.opacity = "1";

        // Remove min-height after transition
        setTimeout(() => {
          videoContainer.style.minHeight = '';
          videoElement.classList.remove('switching');
        }, 300);
      }).catch(() => {
        // Fallback if autoplay fails
        videoElement.style.opacity = "1";
        tasteElement.style.opacity = "1";
        setTimeout(() => {
          videoContainer.style.minHeight = '';
          videoElement.classList.remove('switching');
        }, 300);
      });
    };

    // Handle error case
    tempVideo.onerror = () => {
      // Still update even if preload fails
      tasteElement.textContent = product.taste;
      videoSources[0].src = product.videoWebm;
      videoSources[1].src = product.videoMp4;
      videoElement.load();
      videoElement.play();
      videoElement.style.opacity = "1";
      tasteElement.style.opacity = "1";
      setTimeout(() => {
        videoContainer.style.minHeight = '';
        videoElement.classList.remove('switching');
      }, 300);
    };

    // Start loading the temp video
    tempVideo.load();
  }, 300);
}

function nextProduct() {
  currentProductIndex = (currentProductIndex + 1) % products.length;
  updateProduct(currentProductIndex);
}

function prevProduct() {
  currentProductIndex =
    (currentProductIndex - 1 + products.length) % products.length;
  updateProduct(currentProductIndex);
}

// Initialize carousel
document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", prevProduct);
    nextBtn.addEventListener("click", nextProduct);

    // Set initial taste description
    updateProduct(0);
  }

  // Optional: Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevProduct();
    } else if (e.key === "ArrowRight") {
      nextProduct();
    }
  });

  // Optional: Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const productVisual = document.querySelector(".product-visual");

  if (productVisual) {
    productVisual.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    productVisual.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next product
          nextProduct();
        } else {
          // Swipe right - previous product
          prevProduct();
        }
      }
    }
  }
});
