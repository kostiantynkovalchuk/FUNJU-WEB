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

  // Fade out video and text
  videoElement.style.opacity = "0";
  tasteElement.style.opacity = "0";

  setTimeout(() => {
    // Update taste description
    tasteElement.textContent = product.taste;

    // Update video sources
    videoSources[0].src = product.videoWebm;
    videoSources[1].src = product.videoMp4;

    // Reload video
    videoElement.load();

    // Wait for video to be loaded before showing
    videoElement.onloadeddata = () => {
      videoElement.play();
      // Fade in video and text together
      videoElement.style.opacity = "1";
      tasteElement.style.opacity = "1";
      videoElement.classList.remove('switching');
    };
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
