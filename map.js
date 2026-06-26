// js/map.js
// ============================================================
//  MAP RENDERING  —  Macro Rides
// ============================================================

const MapManager = (() => {

  let map, layers = {};
  let layerVisible = { route: true, buffer: true, h3: true, pickups: true };

  // ── Init ──────────────────────────────────────────────────
  function init(center, zoom) {
    map = L.map('map', {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    layers = {
      route:   L.layerGroup().addTo(map),
      buffer:  L.layerGroup().addTo(map),
      h3:      L.layerGroup().addTo(map),
      pickups: L.layerGroup().addTo(map),
      driver:  L.layerGroup().addTo(map)
    };
  }

  // ── Route polyline ────────────────────────────────────────
  function drawRoute(coords, progress) {
    layers.route.clearLayers();

    // Completed segment (bright blue)
    if (progress > 0) {
      const done = coords.slice(0, progress + 1);
      L.polyline(done, {
        color: '#38bdf8',
        weight: 4,
        opacity: 1,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(layers.route);
    }

    // Remaining segment (dim)
    const remaining = coords.slice(progress);
    if (remaining.length > 1) {
      L.polyline(remaining, {
        color: '#334155',
        weight: 4,
        opacity: 0.7,
        dashArray: '6 4',
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(layers.route);
    }

    // Start / End markers
    if (coords.length > 0) {
      addEndpointMarker(coords[0], '▶', '#00ff88', 'Start').addTo(layers.route);
      addEndpointMarker(coords[coords.length - 1], '■', '#f59e0b', 'End').addTo(layers.route);
    }
  }

  function addEndpointMarker(latlng, symbol, color, label) {
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:10px;height:10px;border-radius:50%;
        background:${color};border:2px solid #fff;
        box-shadow:0 0 10px ${color};
      "></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });
    return L.marker(latlng, { icon }).bindTooltip(label, { permanent: false, direction: 'top', className: 'mr-tip' });
  }

  // ── Corridor buffer ───────────────────────────────────────
  function drawBuffer(coords, radiusMetres) {
    layers.buffer.clearLayers();

    // Simple visual corridor: offset polyline pairs
    // For a real buffer, use turf.js; here we approximate with a thickened line
    L.polyline(coords, {
      color: '#a855f7',
      weight: radiusMetres / 10,   // visual approximation
      opacity: 0.18,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(layers.buffer);

    // Outline
    L.polyline(coords, {
      color: '#a855f7',
      weight: radiusMetres / 10 + 2,
      opacity: 0.08,
      fill: false,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(layers.buffer);
  }

  // ── H3 Cells ──────────────────────────────────────────────
  function drawH3Cells(cells) {
    layers.h3.clearLayers();
    const polygons = H3Utils.cellsToPolygons(cells);
    polygons.forEach(ring => {
      L.polygon(ring, {
        color:       '#f59e0b',
        weight:      0.6,
        opacity:     0.5,
        fillColor:   '#f59e0b',
        fillOpacity: 0.04
      }).addTo(layers.h3);
    });
  }

  // ── Pickup Markers ────────────────────────────────────────
  function drawPickups(pickups, bufferRadius, route, h3Cells, resolution) {
    layers.pickups.clearLayers();
    let eligible = 0;

    pickups.forEach(p => {
      const dist = H3Utils.minDistToRoute(p.lat, p.lng, route);
      const isEligible = dist <= bufferRadius;
      if (isEligible) eligible++;

      const color  = isEligible ? '#00ff88' : '#ff4444';
      const glow   = isEligible ? '0 0 10px #00ff88' : '0 0 8px #ff4444';
      const size   = isEligible ? 12 : 9;

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${color};border:2px solid rgba(255,255,255,0.3);
          box-shadow:${glow};
          cursor:pointer;
        "></div>`,
        iconSize:   [size, size],
        iconAnchor: [size/2, size/2]
      });

      const tipHtml = `
        <div class="mr-popup">
          <div class="mr-popup-name">${p.name}</div>
          <div class="mr-popup-row">
            <span class="mr-popup-badge ${isEligible ? 'eligible' : 'ineligible'}">
              ${isEligible ? '✓ Eligible' : '✗ Not Eligible'}
            </span>
          </div>
          <div class="mr-popup-meta">Type: ${p.type}</div>
          <div class="mr-popup-meta">Distance from route: <strong>${Math.round(dist)} m</strong></div>
        </div>
      `;

      L.marker([p.lat, p.lng], { icon })
        .bindPopup(tipHtml, { className: 'mr-popup-wrap', maxWidth: 220 })
        .addTo(layers.pickups);
    });

    return eligible;
  }

  // ── Driver Icon ───────────────────────────────────────────
  function drawDriver(latlng, heading) {
    layers.driver.clearLayers();

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:24px;height:24px;">
          <div class="driver-ring"></div>
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%) rotate(${heading}deg);
            width:24px;height:24px;
            background:linear-gradient(135deg,#00ff88,#00c4ff);
            border-radius:50% 50% 0 50%;
            border:2px solid rgba(255,255,255,0.5);
            box-shadow:0 0 12px rgba(0,255,136,0.8);
          "></div>
        </div>`,
      iconSize:   [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker(latlng, { icon })
      .bindTooltip('Driver', { permanent: false, direction: 'top', className: 'mr-tip' })
      .addTo(layers.driver);
  }

  // ── Layer Toggle ──────────────────────────────────────────
  function toggleLayer(name) {
    layerVisible[name] = !layerVisible[name];
    if (layerVisible[name]) {
      map.addLayer(layers[name]);
    } else {
      map.removeLayer(layers[name]);
    }
    return layerVisible[name];
  }

  // ── Fit Bounds ────────────────────────────────────────────
  function fitRoute(coords) {
    if (!coords || coords.length === 0) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  return { init, drawRoute, drawBuffer, drawH3Cells, drawPickups, drawDriver, toggleLayer, fitRoute };
})();

// ── Popup / Tooltip CSS injected at runtime ───────────────
const popupStyle = document.createElement('style');
popupStyle.textContent = `
  .mr-popup-wrap .leaflet-popup-content-wrapper {
    background: #1e2330;
    border: 1px solid #2a3040;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    color: #e2e8f0;
    padding: 0;
  }
  .mr-popup-wrap .leaflet-popup-tip { background: #1e2330; }
  .mr-popup-wrap .leaflet-popup-content { margin: 0; }
  .mr-popup { padding: 12px 14px; font-family: Inter, sans-serif; }
  .mr-popup-name { font-size: 13px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px; }
  .mr-popup-row { margin-bottom: 6px; }
  .mr-popup-badge {
    font-size: 11px; font-weight: 600;
    padding: 3px 8px; border-radius: 20px;
  }
  .mr-popup-badge.eligible   { background: rgba(0,255,136,0.15); color: #00ff88; }
  .mr-popup-badge.ineligible { background: rgba(255,68,68,0.15);  color: #ff4444; }
  .mr-popup-meta { font-size: 11px; color: #8b98b0; margin-top: 3px; }
  .mr-popup-meta strong { color: #e2e8f0; }

  .mr-tip {
    background: rgba(30,35,48,0.95) !important;
    border: 1px solid #353d50 !important;
    color: #e2e8f0 !important;
    font-size: 11px !important;
    font-family: Inter, sans-serif !important;
    border-radius: 6px !important;
    padding: 4px 8px !important;
    box-shadow: none !important;
  }
  .mr-tip::before { display:none; }
`;
document.head.appendChild(popupStyle);
