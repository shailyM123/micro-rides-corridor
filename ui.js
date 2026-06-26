// js/ui.js
// ============================================================
//  UI CONTROLLER  —  Macro Rides
// ============================================================

const UI = (() => {

  // ── Element refs ──────────────────────────────────────────
  const $ = id => document.getElementById(id);

  const els = {
    routeLength:    $('routeLength'),
    eligibleCount:  $('eligibleCount'),
    totalPickups:   $('totalPickups'),
    h3Count:        $('h3Count'),
    bufferSlider:   $('bufferSlider'),
    bufferVal:      $('bufferVal'),
    resolutionSlider:$('resolutionSlider'),
    resolutionVal:  $('resolutionVal'),
    btnSimulate:    $('btnSimulate'),
    btnPause:       $('btnPause'),
    btnReset:       $('btnReset'),
    btnFit:         $('btnFit'),
    simFill:        $('simFill'),
    simThumb:       $('simThumb'),
    simStep:        $('simStep'),
    simTotal:       $('simTotal'),
    statusDot:      $('statusDot'),
    statusLabel:    $('statusLabel'),
    statusTime:     $('statusTime'),
    toast:          $('toast'),
    sidebar:        $('sidebar'),
    sidebarToggle:  $('sidebarToggle'),
    expandSidebar:  $('expandSidebar'),
    speedBtns:      document.querySelectorAll('.speed-btn'),
    pillBtns:       document.querySelectorAll('.pill')
  };

  // ── Metrics ───────────────────────────────────────────────
  function setRouteLength(km) {
    els.routeLength.textContent = km;
  }

  function setEligibleCount(n, total) {
    animateNumber(els.eligibleCount, n);
    animateNumber(els.totalPickups, total);
  }

  function setH3Count(n) {
    animateNumber(els.h3Count, n);
  }

  function animateNumber(el, target) {
    const start = parseInt(el.textContent) || 0;
    const diff  = target - start;
    if (diff === 0) return;
    const steps = 12;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      el.textContent = Math.round(start + diff * (i / steps));
      if (i >= steps) clearInterval(iv);
    }, 20);
  }

  // ── Status Bar ────────────────────────────────────────────
  function setStatus(state) {
    // state: 'idle' | 'live' | 'paused' | 'done'
    const labels = { idle: 'Idle', live: 'Simulating…', paused: 'Paused', done: 'Complete' };
    els.statusDot.className = `status-dot ${state}`;
    els.statusLabel.textContent = labels[state] || state;
    updateClock();
  }

  function updateClock() {
    const now = new Date();
    els.statusTime.textContent =
      now.getHours().toString().padStart(2,'0') + ':' +
      now.getMinutes().toString().padStart(2,'0');
  }

  setInterval(updateClock, 30000);
  updateClock();

  // ── Progress Bar ──────────────────────────────────────────
  function setProgress(step, total) {
    const pct = total > 0 ? (step / total) * 100 : 0;
    els.simFill.style.width  = pct + '%';
    els.simThumb.style.left  = pct + '%';
    els.simStep.textContent  = step;
    els.simTotal.textContent = total;
  }

  // ── Button States ─────────────────────────────────────────
  function setSimRunning(isRunning, isPaused) {
    if (isRunning) {
      els.btnSimulate.disabled = true;
      els.btnPause.disabled    = false;
      els.btnPause.innerHTML   = isPaused
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
    } else {
      els.btnSimulate.disabled = false;
      els.btnPause.disabled    = true;
      els.btnPause.innerHTML   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
    }
  }

  // ── Slider Labels ─────────────────────────────────────────
  function getBufferRadius()   { return parseInt(els.bufferSlider.value); }
  function getH3Resolution()   { return parseInt(els.resolutionSlider.value); }

  function bindSliders(onChange) {
    els.bufferSlider.addEventListener('input', () => {
      els.bufferVal.textContent = els.bufferSlider.value + ' m';
      onChange('buffer', parseInt(els.bufferSlider.value));
    });

    els.resolutionSlider.addEventListener('input', () => {
      els.resolutionVal.textContent = els.resolutionSlider.value;
      onChange('resolution', parseInt(els.resolutionSlider.value));
    });
  }

  // ── Speed Buttons ─────────────────────────────────────────
  function bindSpeedBtns(onChange) {
    els.speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        els.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onChange(parseFloat(btn.dataset.speed));
      });
    });
  }

  // ── Layer Toggle Pills ────────────────────────────────────
  function bindPills(onChange) {
    els.pillBtns.forEach(pill => {
      pill.addEventListener('click', () => {
        const isActive = pill.classList.toggle('active');
        onChange(pill.dataset.layer, isActive);
      });
    });
  }

  // ── Sidebar Toggle ────────────────────────────────────────
  function bindSidebarToggle() {
    els.sidebarToggle.addEventListener('click', () => {
      els.sidebar.classList.add('collapsed');
      els.expandSidebar.style.display = 'flex';
    });

    els.expandSidebar.addEventListener('click', () => {
      els.sidebar.classList.remove('collapsed');
      els.expandSidebar.style.display = 'none';
    });
  }

  // ── Toast ─────────────────────────────────────────────────
  let toastTimer = null;
  function toast(msg, duration = 2800) {
    clearTimeout(toastTimer);
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), duration);
  }

  // ── Bind Buttons ──────────────────────────────────────────
  function bindBtn(id, fn) {
    $(id).addEventListener('click', fn);
  }

  return {
    els,
    setRouteLength,
    setEligibleCount,
    setH3Count,
    setStatus,
    setProgress,
    setSimRunning,
    getBufferRadius,
    getH3Resolution,
    bindSliders,
    bindSpeedBtns,
    bindPills,
    bindSidebarToggle,
    bindBtn,
    toast
  };
})();
