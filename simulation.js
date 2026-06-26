// js/simulation.js
// ============================================================
//  SIMULATION ENGINE  —  Macro Rides
// ============================================================

const SimEngine = (() => {

  let state = {
    running:   false,
    paused:    false,
    step:      0,
    total:     0,
    speed:     1,
    timer:     null,
    route:     [],
    onStep:    null,   // callback(step, total)
    onDone:    null    // callback()
  };

  // ── Start ─────────────────────────────────────────────────
  function start(route, speed, onStep, onDone) {
    stop();
    state.route   = route;
    state.total   = route.length - 1;
    state.step    = 0;
    state.speed   = speed || 1;
    state.running = true;
    state.paused  = false;
    state.onStep  = onStep;
    state.onDone  = onDone;
    tick();
  }

  // ── Tick ──────────────────────────────────────────────────
  function tick() {
    if (!state.running || state.paused) return;

    // Fire callback for current step
    if (state.onStep) {
      state.onStep(state.step, state.total);
    }

    if (state.step >= state.total) {
      state.running = false;
      if (state.onDone) state.onDone();
      return;
    }

    state.step++;
    const delay = Math.max(50, 400 / state.speed);
    state.timer = setTimeout(tick, delay);
  }

  // ── Pause / Resume ────────────────────────────────────────
  function pause() {
    if (!state.running) return;
    state.paused = true;
    clearTimeout(state.timer);
  }

  function resume() {
    if (!state.running || !state.paused) return;
    state.paused = false;
    tick();
  }

  function isPaused() { return state.paused; }
  function isRunning() { return state.running; }

  // ── Stop / Reset ──────────────────────────────────────────
  function stop() {
    state.running = false;
    state.paused  = false;
    clearTimeout(state.timer);
  }

  // ── Speed ─────────────────────────────────────────────────
  function setSpeed(s) {
    state.speed = s;
  }

  // ── Heading (degrees) between two [lat,lng] points ────────
  function bearing([lat1, lon1], [lat2, lon2]) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  }

  return { start, pause, resume, stop, setSpeed, isPaused, isRunning, bearing };
})();
