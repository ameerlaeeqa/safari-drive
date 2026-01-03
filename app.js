function renderGates() {
  const container = document.getElementById("gates");
  container.innerHTML = "";

  GATES.forEach(g => {
    const destination = encodeURIComponent(g.placeQuery || `${g.lat},${g.lon}`);

    // Google Maps APP (best: uses real GPS if the app has permission)
    const googleApp = `comgooglemaps://?saddr=Current+Location&daddr=${destination}&directionsmode=driving`;

    // Google Maps WEB fallback
    const googleWeb = `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${destination}&travelmode=driving`;

    // Apple Maps (always solid)
    const apple = `https://maps.apple.com/?saddr=Current%20Location&daddr=${g.lat},${g.lon}&dirflg=d`;

    const div = document.createElement("div");
    div.className = "gate-card";
    div.innerHTML = `
      <div class="gate-title">${g.name}</div>
      <div class="gate-sub">${g.note}</div>
      <div class="gate-actions">
        <a href="${googleApp}">Google (App)</a>
        <a href="${googleWeb}" target="_blank" rel="noopener">Google (Web)</a>
      </div>
      <div class="gate-actions" style="margin-top:10px;">
        <a href="${apple}" target="_blank" rel="noopener">Apple Maps</a>
      </div>
    `;
    container.appendChild(div);
  });
}
