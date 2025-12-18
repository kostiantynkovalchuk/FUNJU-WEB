// Product Carousel Functionality
const products = [
  {
    tasteKey: "productTasteApple",
    videoWebm: "assets/product-mobile.webm",
    videoMp4: "assets/product-mobile.mp4",
  },
  {
    tasteKey: "productTasteCitrus",
    videoWebm: "assets/citrus.webm",
    videoMp4: "assets/citrus.mp4",
  },
  {
    tasteKey: "productTasteMango",
    videoWebm: "assets/mango.webm",
    videoMp4: "assets/mango.mp4",
  },
  {
    tasteKey: "productTastePeach",
    videoWebm: "assets/peach.webm",
    videoMp4: "assets/peach.mp4",
  },
  {
    tasteKey: "productTastePineapple",
    videoWebm: "assets/pineapple.webm",
    videoMp4: "assets/pineapple.mp4",
  },
  {
    tasteKey: "productTasteWatermelon",
    videoWebm: "assets/watermelon.webm",
    videoMp4: "assets/watermelon.mp4",
  },
];

let currentProductIndex = 0;
let isTransitioning = false;

function updateProduct(index) {
  // Prevent multiple rapid clicks
  if (isTransitioning) return;
  isTransitioning = true;

  const product = products[index];
  const tasteElement = document.querySelector(".product-taste");
  const videoElements = document.querySelectorAll(".product-video");

  // Find active and inactive video elements
  const activeVideo = document.querySelector(".product-video.active");
  const inactiveVideo = Array.from(videoElements).find(
    (v) => !v.classList.contains("active")
  );

  if (!activeVideo || !inactiveVideo) return;

  const inactiveSources = inactiveVideo.querySelectorAll("source");

  // Step 1: Load new video in background (invisible)
  inactiveSources[0].src = product.videoWebm;
  inactiveSources[1].src = product.videoMp4;
  inactiveVideo.load();

  // Step 2: Wait for new video to be ready
  inactiveVideo.onloadeddata = () => {
    // Start playing the new video (still invisible)
    inactiveVideo
      .play()
      .then(() => {
        // Step 3: Crossfade - fade out old, fade in new
        // Fade out active video
        activeVideo.classList.remove("active");

        // Fade in new video
        inactiveVideo.classList.add("active");

        // Step 4: Update taste text with fade
        // Use visibility + opacity to prevent layout shift during text change
        tasteElement.style.transition = "opacity 0.15s ease, visibility 0.15s ease";
        tasteElement.style.opacity = "0";
        tasteElement.style.visibility = "hidden";

        setTimeout(() => {
          // Change text while invisible (prevents layout shift flash)
          tasteElement.textContent = window.t ? window.t(product.tasteKey) : product.tasteKey;

          // Small delay to ensure DOM has updated
          requestAnimationFrame(() => {
            tasteElement.style.opacity = "1";
            tasteElement.style.visibility = "visible";
          });
        }, 150);

        // Step 5: Clean up after transition completes
        setTimeout(() => {
          // Pause the old video to save resources
          activeVideo.pause();
          activeVideo.currentTime = 0;
          isTransitioning = false;
        }, 500);
      })
      .catch(() => {
        // Fallback if autoplay fails
        inactiveVideo.classList.add("active");
        activeVideo.classList.remove("active");
        tasteElement.textContent = window.t ? window.t(product.tasteKey) : product.tasteKey;
        isTransitioning = false;
      });
  };

  // Handle error case
  inactiveVideo.onerror = () => {
    console.error("Failed to load video:", product.videoWebm);
    isTransitioning = false;
  };
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

  // Listen for language changes and update current taste
  window.addEventListener("languageChanged", () => {
    const tasteElement = document.querySelector(".product-taste");
    const product = products[currentProductIndex];
    if (tasteElement && product) {
      tasteElement.textContent = window.t ? window.t(product.tasteKey) : product.tasteKey;
    }
  });
});
