// js/app.js
// ============================================================
//  APP ORCHESTRATOR  —  Macro Rides
//  Wires together MapManager, SimEngine, H3Utils, UI
// ============================================================

(function () {

  // ── State ─────────────────────────────────────────────────
  const state = {
    bufferRadius: DEFAULT_SETTINGS.bufferRadius,
    h3Resolution: DEFAULT_SETTINGS.h3Resolution,
    speed:        DEFAULT_SETTINGS.simSpeed,
    route:        DEFAULT_SETTINGS.route,
    pickups:      DEFAULT_SETTINGS.pickups,
    h3Cells:      [],
    simStep:      0
  };

  // ── Boot ──────────────────────────────────────────────────
  function init() {
    // Centre map on route midpoint
    const mid = state.route[Math.floor(state.route.length / 2)];
    MapManager.init(mid, 14);

    // Initial full render
    fullRender(0);

    // Fit to route
    MapManager.fitRoute(state.route);

    // Wire UI
    UI.bindSliders(onSettingChange);
    UI.bindSpeedBtns(onSpeedChange);
    UI.bindPills(onLayerToggle);
    UI.bindSidebarToggle();

    UI.bindBtn('btnSimulate', onSimulate);
    UI.bindBtn('btnPause',    onPause);
    UI.bindBtn('btnReset',    onReset);
    UI.bindBtn('btnFit',      () => MapManager.fitRoute(state.route));

    UI.setStatus('idle');
    UI.toast('Dashboard ready — click Simulate to start', 3000);
  }

  // ── Full Render ───────────────────────────────────────────
  function fullRender(progress) {
    const route  = state.route;
    const radius = state.bufferRadius;
    const res    = state.h3Resolution;

    // 1. Route
    MapManager.drawRoute(route, progress);

    // 2. Buffer corridor
    MapManager.drawBuffer(route.slice(0, progress + 1), radius);

    // 3. H3 Cells (only around completed portion)
    const partial = route.slice(0, progress + 1);
    if (partial.length > 1) {
      state.h3Cells = H3Utils.routeToCells(partial, radius, res);
    } else {
      state.h3Cells = [];
    }
    MapManager.drawH3Cells(state.h3Cells);

    // 4. Pickups
    const eligible = MapManager.drawPickups(
      state.pickups, radius, partial.length > 1 ? partial : route, state.h3Cells, res
    );

    // 5. Driver icon (only during sim)
    if (progress > 0 && progress < route.length - 1) {
      const heading = SimEngine.bearing(route[progress - 1], route[progress]);
      MapManager.drawDriver(route[progress], heading);
    }

    // 6. Update metrics
    UI.setRouteLength(H3Utils.routeLength(route));
    UI.setEligibleCount(eligible, state.pickups.length);
    UI.setH3Count(state.h3Cells.length);
  }

  // ── Simulation Callbacks ──────────────────────────────────
  function onSimStep(step, total) {
    state.simStep = step;
    fullRender(step);
    UI.setProgress(step, total);
    UI.setSimRunning(true, false);
    UI.setStatus('live');
  }

  function onSimDone() {
    UI.setSimRunning(false, false);
    UI.setStatus('done');
    UI.setProgress(state.route.length - 1, state.route.length - 1);
    UI.toast('Simulation complete ✓');
    fullRender(state.route.length - 1);
  }

  // ── Button Handlers ───────────────────────────────────────
  function onSimulate() {
    SimEngine.start(
      state.route,
      state.speed,
      onSimStep,
      onSimDone
    );
    UI.setSimRunning(true, false);
    UI.setStatus('live');
    UI.toast('Simulation started');
  }

  function onPause() {
    if (SimEngine.isPaused()) {
      SimEngine.resume();
      UI.setSimRunning(true, false);
      UI.setStatus('live');
      UI.toast('Resumed');
    } else {
      SimEngine.pause();
      UI.setSimRunning(true, true);
      UI.setStatus('paused');
      UI.toast('Paused');
    }
  }

  function onReset() {
    SimEngine.stop();
    state.simStep = 0;
    fullRender(0);
    UI.setSimRunning(false, false);
    UI.setStatus('idle');
    UI.setProgress(0, state.route.length - 1);
    MapManager.fitRoute(state.route);
    UI.toast('Reset');
  }

  // ── Setting Changes ───────────────────────────────────────
  function onSettingChange(type, value) {
    if (type === 'buffer')     state.bufferRadius = value;
    if (type === 'resolution') state.h3Resolution = value;
    // Re-render at current sim step
    fullRender(state.simStep);
    UI.toast(type === 'buffer'
      ? `Buffer: ${value} m`
      : `H3 Resolution: ${value}`
    , 1500);
  }

  function onSpeedChange(speed) {
    state.speed = speed;
    SimEngine.setSpeed(speed);
    UI.toast(`Speed: ${speed}×`, 1200);
  }

  // ── Layer Visibility ──────────────────────────────────────
  function onLayerToggle(layer, visible) {
    MapManager.toggleLayer(layer);
    UI.toast(`${layer.charAt(0).toUpperCase() + layer.slice(1)} ${visible ? 'shown' : 'hidden'}`, 1200);
  }

  // ── Boot ──────────────────────────────────────────────────
  // Wait for DOM + Leaflet + H3 to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
