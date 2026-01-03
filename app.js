// --- Gate data (coords) ---
const GATES = [
  {
    name: "Nyalazi Gate (Imfolozi)",
    note: "Best Big 5 odds (open terrain).",
    lat: -28.007222,
    lon: 31.685833
  },
  {
    name: "Memorial Gate (Hluhluwe)",
    note: "Good alternative, scenic hills.",
    lat: -28.2198,
    lon: 31.9519
  },
  {
    name: "Cengeni Gate (West)",
    note: "Often used from Ulundi side.",
    lat: -28.341667,
    lon: 31.705556
  }
];

// --- Map setup ---
let map, meMarker, meAccuracy, gateLayer;
let lastPos = null;

function initMap() {
  map = L.map("map", { zoomControl: true }).setView([-28.15, 31.82], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  gateLayer = L.layerGroup().addTo(map);

  // Add gate pins
  GATES.forEach(g => {
    const m = L.marker([g.lat, g.lon]).addTo(gateLayer);
    m.bindPopup(`<strong>${g.name}</strong><br>${g.note}`);
  });

  fitGates();
}

function fitGates() {
  const bounds = L.latLngBounds(GATES.map(g => [g.lat, g.lon]));
  map.fitBounds(bounds.pad(0.2));
}

function centerOnMe() {
  if (lastPos) {
    map.setView([lastPos.lat, lastPos.lon], 14);
  }
}

// --- GPS tracking ---
function startGPS() {
  const status = document.getElementById("gpsStatus");

  if (!navigator.geolocation) {
    status.textContent = "GPS not supported on this device.";
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      lastPos = { lat: latitude, lon: longitude, acc: accuracy };

      status.textContent = `GPS OK • Accuracy ~${Math.round(accuracy)}m`;

      const latlng = [latitude, longitude];

      if (!meMarker) {
        meMarker = L.circleMarker(latlng, {
          radius: 8
        }).addTo(map);

        meAccuracy = L.circle(latlng, { radius: accuracy }).addTo(map);

        map.setView(latlng, 14);
      } else {
        meMarker.setLatLng(latlng);
        meAccuracy.setLatLng(latlng);
        meAccuracy.setRadius(accuracy);
      }
    },
    (err) => {
      status.textContent =
        "Location blocked. iPhone: Settings → Safari → Location (Allow) then reload.";
      console.error(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    }
  );
}

// --- Gate cards (Apple Maps + Google Maps) ---
function renderGates() {
  const container = document.getElementById("gates");
  container.innerHTML = "";

  GATES.forEach(g => {
    const apple = `https://maps.apple.com/?daddr=${g.lat},${g.lon}&dirflg=d`;
    const google = `https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lon}&travelmode=driving`;

    const div = document.createElement("div");
    div.className = "gate-card";
    div.innerHTML = `
      <div class="gate-title">${g.name}</div>
      <div class="gate-sub">${g.note}</div>
      <div class="gate-actions">
        <a href="${apple}" target="_blank">Apple Maps</a>
        <a href="${google}" target="_blank">Google Maps</a>
      </div>
    `;
    container.appendChild(div);
  });
}

// --- Time-based mode ---
function getMode(now = new Date()) {
  const h = now.getHours();
  const m = now.getMinutes();
  const minutes = h * 60 + m;

  // Prime: 06:00–09:30
  if (minutes >= 360 && minutes <= 570) {
    return {
      label: "🟢 PRIME DRIVE (06:00–09:30)",
      tip: "Predators most active. Drive slow, scan shade + road edges."
    };
  }
  // Midday: 10:00–14:30
  if (minutes >= 600 && minutes <= 870) {
    return {
      label: "🟡 MIDDAY MODE (10:00–14:30)",
      tip: "Predators resting. Focus waterholes, elephants, rhino, buffalo."
    };
  }
  // Afternoon: 15:30–closing-ish
  if (minutes >= 930 && minutes <= 1050) {
    return {
      label: "🟠 AFTERNOON DRIVE (15:30–17:30)",
      tip: "Movement increases again. Re-check ‘hot roads’ + scan crossings."
    };
  }
  return {
    label: "🔵 GENERAL MODE",
    tip: "Still good—just manage expectations outside prime times."
  };
}

function renderModeAndChecklist() {
  const mode = getMode();
  document.getElementById("modeText").textContent = `${mode.label}\n${mode.tip}`;

  const list = document.getElementById("checklist");
  const items = [
    "Enter via <strong>Nyalazi Gate</strong> if Big 5 is the priority.",
    "Drive <strong>20–30 km/h</strong> (spot more, stress less).",
    "Scan <strong>road edges</strong> + <strong>shaded bushes</strong>.",
    "Slow down at <strong>waterholes</strong> and river crossings.",
    "If cars are stopped → <strong>pause</strong> and observe (safe distance).",
    "If alarm calls / animals running → <strong>STOP & SCAN</strong>."
  ];

  list.innerHTML = items.map(t => `<li><input type="checkbox" /> <span>${t}</span></li>`).join("");
}

// --- PWA (service worker) ---
function setupPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  }
}

// --- Boot ---
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  renderGates();
  renderModeAndChecklist();
  startGPS();
  setupPWA();

  document.getElementById("btnCenterMe").addEventListener("click", centerOnMe);
  document.getElementById("btnFitGates").addEventListener("click", fitGates);

  // Update mode every 60s
  setInterval(renderModeAndChecklist, 60000);
});
