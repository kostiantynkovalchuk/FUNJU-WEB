// ============================================
// FUNJU STORE FINDER - Supabase Integration
// ============================================

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  SUPABASE_URL: 'https://luucktzqourzszzxzlyn.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dWNrdHpxb3VyenN6enh6bHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzA3NjAsImV4cCI6MjA3ODcwNjc2MH0.rungPxQ4hzZGVWhdf2mlkujkq9UuLVKYQFFX4626hR4'
};

// Initialize Supabase client
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// ============================================
// STATE
// ============================================
let map;
let markers = [];
let userLocation = null;
let userData = null;
let cityStores = [];

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate promo code - DISABLED
function generatePromoCode(name) {
  return null; // Feature disabled
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ============================================
// SUPABASE INTEGRATION
// ============================================

async function saveUserToDatabase(user) {
  try {
    const { data, error } = await supabase
      .from('user_leads')
      .insert([{
        name: user.name,
        email: user.email,
        city: user.city,
        consent_location: user.consentLocation,
        promo_code: user.promoCode
      }]);

    if (error) {
      console.error('Supabase Error:', error);
      return false;
    }

    console.log('User saved to Supabase:', data);
    return true;
  } catch (err) {
    console.error('Error saving user:', err);
    return false;
  }
}

async function fetchStoresFromDatabase(city) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('city', city)
      .eq('in_stock', true);

    if (error) {
      console.error('Supabase Error:', error);
      return [];
    }

    console.log('Stores fetched from Supabase:', data);
    return data;
  } catch (err) {
    console.error('Error fetching stores:', err);
    return [];
  }
}

// ============================================
// MAP FUNCTIONS
// ============================================

function initMap() {
  map = L.map('storeMap', {
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true
  }).setView([48.3794, 31.1656], 6); // Ukraine center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  console.log('Map initialized');
}

function displayStoresOnMap(stores, highlightNearest = false) {
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  stores.forEach((store, index) => {
    const isNearest = highlightNearest && index === 0;

    const icon = L.divIcon({
      html: `<div style="background: ${isNearest ? '#4CAF50' : store.in_stock ? 'var(--primary-color)' : '#f44336'}; width: ${isNearest ? '40px' : '30px'}; height: ${isNearest ? '40px' : '30px'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3); font-size: ${isNearest ? '18px' : '14px'};">${isNearest ? '★' : 'F'}</div>`,
      className: 'custom-marker',
      iconSize: [isNearest ? 40 : 30, isNearest ? 40 : 30]
    });

    const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);

    const distance = userLocation ?
      calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng) : null;

    const popupContent = `
      <div class="popup-content">
        <h4>${store.name}</h4>
        <p style="margin: 5px 0;">${store.address}</p>
        ${store.hours ? `<p style="color: #999; font-size: 12px;">${store.hours}</p>` : ''}
        ${distance ? `<span class="popup-distance">📍 ${distance.toFixed(1)} км від вас</span>` : ''}
      </div>
    `;

    marker.bindPopup(popupContent);

    if (isNearest) {
      marker.openPopup();
    }

    markers.push(marker);
  });

  console.log(`Displayed ${stores.length} stores on map`);
}

function displayStoreInfo(store) {
  const panel = document.getElementById('storePanel');
  const infoDiv = document.getElementById('storeInfo');

  infoDiv.innerHTML = `
    <span class="status-badge ${store.in_stock ? 'in-stock' : 'out-stock'}">
      ${store.in_stock ? '✅ В наявності' : '❌ Немає в наявності'}
    </span>
    <div class="info-row">
      <span class="info-icon">🏪</span>
      <div>
        <strong>${store.name}</strong>${store.type ? ` - ${store.type}` : ''}<br>
        <span style="color: #999; font-size: 13px;">${store.address}</span>
      </div>
    </div>
    <div class="info-row">
      <span class="info-icon">📍</span>
      <span><strong>${store.distance.toFixed(2)} км</strong> від вас</span>
    </div>
    ${store.phone ? `
    <div class="info-row">
      <span class="info-icon">📞</span>
      <span>${store.phone}</span>
    </div>
    ` : ''}
    ${store.hours ? `
    <div class="info-row">
      <span class="info-icon">🕒</span>
      <span>${store.hours}</span>
    </div>
    ` : ''}
    <button class="directions-btn" onclick="openDirections(${store.lat}, ${store.lng})">
      <span>🧭</span>
      <span>Прокласти маршрут</span>
    </button>
  `;

  panel.classList.add('visible');
  console.log('Displaying store info', store);
}

function openDirections(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
  console.log(`Opening directions to: ${lat}, ${lng}`);
}

// Make openDirections globally available
window.openDirections = openDirections;

// ============================================
// EVENT HANDLERS
// ============================================

document.getElementById('findForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('userName').value.trim();
  const city = document.getElementById('userCity').value;
  const email = document.getElementById('userEmail').value.trim();

  // Validate inputs
  if (!name || !city || !email) {
    alert('Будь ласка, заповни всі поля');
    return;
  }

  // Show loading
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="loading"></span> Шукаємо...';
  submitBtn.disabled = true;

  try {
    // Store user data (promo code feature disabled)
    userData = {
      name,
      city,
      email,
      promoCode: null,
      consentLocation: true,
      timestamp: new Date().toISOString()
    };

    // Save to database
    await saveUserToDatabase(userData);

    // Fetch stores
    cityStores = await fetchStoresFromDatabase(city);

    if (cityStores.length > 0) {
      const isMobile = window.innerWidth < 768;
      const mapContainer = document.querySelector('.map-container');

      // Initialize map on mobile if not already initialized
      if (isMobile && !map) {
        mapContainer.classList.add('active');

        // Wait for CSS to apply, then initialize map
        setTimeout(() => {
          initMap();

          if (map) {
            // Now zoom to city and show stores
            const cityCenter = [cityStores[0].lat, cityStores[0].lng];
            map.setView(cityCenter, 12);
            displayStoresOnMap(cityStores);

            // Hide form (no scroll to keep success message visible)
            document.getElementById('formCard').style.display = 'none';

            // Stop spinner
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
        }, 200);
      } else {
        // Desktop or map already initialized
        if (map) {
          map.invalidateSize();

          // Zoom to city and show stores
          const cityCenter = [cityStores[0].lat, cityStores[0].lng];
          map.setView(cityCenter, 12);
          displayStoresOnMap(cityStores);

          // Stop spinner
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }

      // Show "My Location" button
      document.getElementById('locationBtn').classList.add('visible');

      // Show success message
      const successMsg = document.getElementById('successMessage');
      document.getElementById('successText').textContent =
        `Привіт, ${name}! Знайдено ${cityStores.length} магазинів у місті ${city}.`;
      successMsg.classList.add('visible');

      setTimeout(() => {
        successMsg.classList.remove('visible');
      }, 15000);

      console.log('Form submitted successfully', userData);
    } else {
      alert(`На жаль, у місті ${city} ще немає магазинів з Funju.`);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Form submission error:', error);
    alert('Сталася помилка. Спробуй ще раз.');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

document.getElementById('locationBtn').addEventListener('click', function() {
  if (!navigator.geolocation) {
    alert('Геолокація не підтримується вашим браузером');
    return;
  }

  const btn = this;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading"></span> Шукаю...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log('User location detected', userLocation);

      // Sort stores by distance
      const storesWithDistance = cityStores.map(store => ({
        ...store,
        distance: calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng)
      })).sort((a, b) => a.distance - b.distance);

      // Show nearest store
      const nearest = storesWithDistance[0];

      // Update map
      map.setView([nearest.lat, nearest.lng], 14);
      displayStoresOnMap(storesWithDistance, true);

      // Show store info panel
      displayStoreInfo(nearest);

      btn.innerHTML = originalHTML;
      btn.disabled = false;
    },
    (error) => {
      console.error('Geolocation error:', error);
      alert('Не вдалося визначити вашу локацію. Переконайтеся, що ви дали дозвіл на геолокацію.');
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  );
});

// ============================================
// INITIALIZATION
// ============================================

// Use DOMContentLoaded instead of 'load' for faster initialization
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize map on desktop (where it's visible)
  // On mobile, we'll initialize it when the form is submitted
  if (window.innerWidth >= 768) {
    // Initialize immediately, don't wait
    initMap();
    // Invalidate size after a short delay to ensure container is rendered
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }

  console.log('Funju Store Finder loaded successfully');
});
