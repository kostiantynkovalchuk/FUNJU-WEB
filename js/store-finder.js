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

// Initialize Supabase client (or use existing one from app.js)
let supabaseClient;
if (window.supabaseClient) {
  supabaseClient = window.supabaseClient;
} else if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;
} else {
  console.error('Supabase library not loaded');
}

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
    const { data, error } = await supabaseClient
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
    const { data, error } = await supabaseClient
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

async function fetchAllStores() {
  try {
    const { data, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('in_stock', true);

    if (error) {
      console.error('Supabase Error:', error);
      return [];
    }

    console.log('All stores fetched from Supabase:', data?.length || 0);
    return data;
  } catch (err) {
    console.error('Error fetching all stores:', err);
    return [];
  }
}

// ============================================
// MAP FUNCTIONS
// ============================================

function initMap() {
  // Check if Leaflet is available
  if (typeof L === 'undefined') {
    console.error('Leaflet library not loaded yet');
    return false;
  }

  try {
    map = L.map('storeMap', {
      zoomControl: true,
      scrollWheelZoom: false, // Disable scroll zoom initially
      dragging: false, // Disable dragging initially
      touchZoom: false, // Disable touch zoom initially
      doubleClickZoom: false, // Disable double click zoom initially
      boxZoom: false, // Disable box zoom initially
      keyboard: false // Disable keyboard navigation initially
    }).setView([48.3794, 31.1656], 6); // Ukraine center

    // Use CartoDB tiles which have better English label support
    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    console.log('Map initialized (interactions disabled)');
    return true;
  } catch (error) {
    console.error('Error initializing map:', error);
    return false;
  }
}

function enableMapInteractions() {
  if (map) {
    map.scrollWheelZoom.enable();
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    // Remove disabled class from map container
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.classList.remove('disabled');
    }

    console.log('Map interactions enabled');
  }
}

function displayStoresOnMap(stores, highlightNearest = false) {
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // Get current language from i18n system
  const currentLang = window.getCurrentLang ? window.getCurrentLang() : 'ua';
  const isEnglish = currentLang === 'en';

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

    // Use language-specific fields if available, fallback to default
    const storeName = isEnglish && store.name_en ? store.name_en : store.name;
    const storeAddress = isEnglish && store.address_en ? store.address_en : store.address;
    const storeHours = isEnglish && store.hours_en ? store.hours_en : store.hours;

    // Translate distance text
    const distanceText = isEnglish ? 'km from you' : 'км від вас';

    const popupContent = `
      <div class="popup-content">
        <h4>${storeName}</h4>
        <p style="margin: 5px 0;">${storeAddress}</p>
        ${storeHours ? `<p style="color: #999; font-size: 12px;">${storeHours}</p>` : ''}
        ${distance ? `<span class="popup-distance">📍 ${distance.toFixed(1)} ${distanceText}</span>` : ''}
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

  // Get current language from i18n system
  const currentLang = window.getCurrentLang ? window.getCurrentLang() : 'ua';
  const isEnglish = currentLang === 'en';

  // Use language-specific fields if available
  const storeName = isEnglish && store.name_en ? store.name_en : store.name;
  const storeAddress = isEnglish && store.address_en ? store.address_en : store.address;
  const storeHours = isEnglish && store.hours_en ? store.hours_en : store.hours;
  const storeType = isEnglish && store.type_en ? store.type_en : store.type;

  // Translate button text
  const directionsText = isEnglish ? 'Get Directions' : 'Прокласти маршрут';
  const distanceUnit = isEnglish ? 'km' : 'км';

  infoDiv.innerHTML = `
    <span class="status-badge ${store.in_stock ? 'in-stock' : 'out-stock'}">
      ${store.in_stock ? window.t('findInStock') : window.t('findOutOfStock')}
    </span>
    <div class="info-row">
      <span class="info-icon">🏪</span>
      <div>
        <strong>${storeName}</strong>${storeType ? ` - ${storeType}` : ''}<br>
        <span style="color: #999; font-size: 13px;">${storeAddress}</span>
      </div>
    </div>
    <div class="info-row">
      <span class="info-icon">📍</span>
      <span><strong>${store.distance.toFixed(2)} ${distanceUnit}</strong> ${window.t('findFromYou')}</span>
    </div>
    ${store.phone ? `
    <div class="info-row">
      <span class="info-icon">📞</span>
      <span>${store.phone}</span>
    </div>
    ` : ''}
    ${storeHours ? `
    <div class="info-row">
      <span class="info-icon">🕒</span>
      <span>${storeHours}</span>
    </div>
    ` : ''}
    <button class="directions-btn" onclick="openDirections(${store.lat}, ${store.lng})">
      <span>🧭</span>
      <span>${directionsText}</span>
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
    alert(window.t('findAllFields'));
    return;
  }

  // Show loading
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<span class="loading"></span> ${window.t('findSearching')}`;
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
          const success = initMap();

          if (success && map) {
            // Now zoom to city and show stores
            const cityCenter = [cityStores[0].lat, cityStores[0].lng];
            map.setView(cityCenter, 12);
            displayStoresOnMap(cityStores);

            // Enable map interactions after form submission
            enableMapInteractions();

            // Hide form (no scroll to keep success message visible)
            document.getElementById('formCard').style.display = 'none';

            // Stop spinner
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          } else {
            alert(window.t('findError'));
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

          // Enable map interactions after form submission
          enableMapInteractions();

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
        window.t('findSuccess', { name: name, count: cityStores.length, city: city });
      successMsg.classList.add('visible');

      setTimeout(() => {
        successMsg.classList.remove('visible');
      }, 15000);

      console.log('Form submitted successfully', userData);
    } else {
      alert(window.t('findNoStores', { city: city }));
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('Form submission error:', error);
    alert(window.t('findError'));
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

document.getElementById('locationBtn').addEventListener('click', function() {
  if (!navigator.geolocation) {
    alert(window.t('findGeoError'));
    return;
  }

  const btn = this;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span class="loading"></span> ${window.t('findLocating')}`;
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

      // Smooth scroll to store panel
      const storePanel = document.getElementById('storePanel');
      storePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      btn.innerHTML = originalHTML;
      btn.disabled = false;
    },
    (error) => {
      console.error('Geolocation error:', error);
      alert(window.t('findGeoPermission'));
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  );
});

// ============================================
// INITIALIZATION
// ============================================

// Wait for both DOM and Leaflet to be ready
function initializeApp() {
  console.log('🗺️ Store Finder: Initializing app...', {
    width: window.innerWidth,
    isDesktop: window.innerWidth >= 768,
    leafletAvailable: typeof L !== 'undefined',
    supabaseAvailable: typeof window.supabase !== 'undefined'
  });

  // Only initialize map on desktop (where it's visible)
  // On mobile, we'll initialize it when the form is submitted
  if (window.innerWidth >= 768) {
    console.log('🗺️ Store Finder: Desktop view detected, initializing map...');

    // Check if map container exists
    const mapContainer = document.getElementById('storeMap');
    if (!mapContainer) {
      console.error('❌ Map container #storeMap not found!');
      return;
    }
    console.log('✅ Map container found:', mapContainer);

    // Try to initialize map
    const success = initMap();
    console.log('🗺️ Map initialization result:', success);

    if (success && map) {
      console.log('✅ Map object created successfully');

      // Invalidate size after a short delay to ensure container is rendered
      requestAnimationFrame(() => {
        map.invalidateSize();
        console.log('🗺️ Map size invalidated');
      });

      // Add disabled class to map container initially
      const mapContainerParent = document.querySelector('.map-container');
      if (mapContainerParent) {
        mapContainerParent.classList.add('disabled');
        console.log('🗺️ Map container set to disabled mode');
      }

      // Load and display all stores on the map (non-interactive)
      console.log('🗺️ Fetching stores from database...');
      fetchAllStores().then(allStores => {
        if (allStores && allStores.length > 0) {
          displayStoresOnMap(allStores);
          console.log(`✅ Loaded ${allStores.length} stores on map (non-interactive)`);
        } else {
          console.warn('⚠️ No stores found in database');
        }
      }).catch(err => {
        console.error('❌ Error fetching stores:', err);
      });
    } else {
      console.error('❌ Failed to initialize map');
    }
  } else {
    console.log('📱 Mobile view detected, map will initialize on form submit');
  }

  console.log('✅ Funju Store Finder loaded successfully');
}

// Use window.onload to ensure Leaflet library is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for external scripts to load
    setTimeout(initializeApp, 100);
  });
} else {
  // DOM already loaded
  setTimeout(initializeApp, 100);
}
