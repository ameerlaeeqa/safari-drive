// ===================
// GATE DATA (OFFICIAL)
// ===================
const GATES = [
  {
    name: "Nyalazi Gate - Hluhluwe-iMfolozi Game Reserve",
    note: "Best Big 5 odds (open terrain)",
    lat: -28.007222,
    lon: 31.685833,
    placeQuery: "Nyalazi Gate - Hluhluwe-iMfolozi Game Reserve"
  },
  {
    name: "Memorial Gate (Hluhluwe)",
    note: "Scenic hills, good alternative",
    lat: -28.2198,
    lon: 31.9519
  },
  {
    name: "Cengeni Gate (West)",
    note: "Used from Ulundi side",
    lat: -28.341667,
    lon: 31.705556
  }
];

let map, meMarker, accuracyCircle, lastPos;

// ===================
// GOOGLE MAPS FIX
// ===================
function openGoogleMaps(destinationText) {
  const appUrl =
    `comgooglemaps://?saddr=Current+Location&daddr=${destinationText}&directionsmode=driving`;

  const webUrl =
    `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${destinationText}&travelmode=driving`;

  window.location.href = appUrl;
  setTimeout(() => {
    window.location.href = webUrl;
  }, 600);
}

// ===================
// MAP INIT
// ===================
function initMap() {
  map = L.map("map").setView([-28.15, 31.82], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(map);

  GATES.forEach(g => {
    L.marker([g.lat, g.lon]).addTo(map).bindPopup(g.name);
  });
}

// ===================
// GPS TRACKING
// ===================
function startGPS() {
  const status = document.getElementById("gpsStatus");

  navigator.geolocation.watchPosition(
    pos => {
      const { latitude, longitude, accuracy } = pos.coords;
      lastPos = [latitude, longitude];

      status.textContent = `GPS active (±${Math.round(accuracy)}m)`;

      if (!meMarker) {
        meMarker = L.circleMarker(lastPos, { radius: 8 }).addTo(map);
        accuracyCircle = L.circle(lastPos, { radius: accuracy }).addTo(map);
        map.setView(lastPos, 14);
      } else {
        meMarker.setLatLng(lastPos);
        accuracyCircle.setLatLng(lastPos);
        accuracyCircle.setRadius(accuracy);
      }
    },
    () => {
      status.textContent = "Location blocked – enable in Safari settings";
    },
    { enableHighAccuracy: true }
  );
}

// ===================
// UI RENDER
// ===================
function renderGates() {
  const container = document.getElementById("gates");
  container.innerHTML = "";

  GATES.forEach(g => {
    const destination = encodeURIComponent(
      g.placeQuery || `${g.lat},${g.lon}`
    );

    const div = document.createElement("div");
    div.className = "gate-card";
    div.innerHTML = `
      <div class="gate-title">${g.name}</div>
      <div class="gate-sub">${g.note}</div>
      <div class="gate-actions">
        <a href="#" onclick="openGoogleMaps('${destination}');return false;">
          Google Maps
        </a>
        <a href="https://maps.apple.com/?saddr=Current%20Location&daddr=${g.lat},${g.lon}&dirflg=d" target="_blank">
          Apple Maps
        </a>
      </div>
    `;
    container.appendChild(div);
  });
}

// ===================
// MODE LOGIC
// ===================
function updateMode() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  let text = "General drive mode";

  if (mins >= 360 && mins <= 570)
    text = "🟢 PRIME DRIVE – predators active";
  else if (mins >= 600 && mins <= 870)
    text = "🟡 MIDDAY – focus waterholes";
  else if (mins >= 930 && mins <= 1050)
    text = "🟠 AFTERNOON – movement increases";

  document.getElementById("modeText").textContent = text;
}

// ===================
// HELPERS
// ===================
function centerOnMe() {
  if (lastPos) map.setView(lastPos, 14);
}

function fitGates() {
  const bounds = L.latLngBounds(GATES.map(g => [g.lat, g.lon]));
  map.fitBounds(bounds.pad(0.2));
}

// ===================
// START
// ===================
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  renderGates();
  startGPS();
  updateMode();
  setInterval(updateMode, 60000);
});
