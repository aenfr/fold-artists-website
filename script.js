/* Fold Artists — site behaviour. No dependencies. Spec: DESIGN.md */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

  /* ---------- Analytics hook: events only, never form content ---------- */
  function track(name, props) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, props || {}));
    } catch (e) { /* no-op */ }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (el) track('cta_click', { cta: el.getAttribute('data-cta'), page: location.pathname });
  });

  /* ---------- Nav: scrolled state + mobile sheet ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    doc.classList.toggle('nav-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && links) { var first = links.querySelector('a'); if (first) first.focus(); }
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () { setMenu(!doc.classList.contains('nav-open')); });
    document.addEventListener('keydown', function (e) {
      if (!doc.classList.contains('nav-open')) return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); }
      if (e.key === 'Tab') {
        var f = [toggle].concat(Array.prototype.slice.call(links.querySelectorAll('a')));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal, .lines');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) {
      // anything already on screen at load shows right away (never wait on the observer for above-the-fold copy)
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      else io.observe(el);
    });
    // safety net: if the observer is throttled (background tab, embedded preview), reveal everything after 2.5s
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  }

  /* ---------- Influence Field (the subject, middle plane) ---------- */
  var SPECTRUM = [[220, 24, 40], [255, 194, 26], [155, 227, 195], [143, 176, 255], [183, 155, 255]];
  function spectrumAt(t) {
    t = Math.max(0, Math.min(0.9999, t)) * (SPECTRUM.length - 1);
    var i = Math.floor(t), f = t - i, a = SPECTRUM[i], b = SPECTRUM[i + 1];
    return [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), Math.round(a[2] + (b[2] - a[2]) * f)];
  }
  // deterministic PRNG so every load composes similarly
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  function InfluenceField(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = canvas.getAttribute('data-field') || 'hero';
    this.running = false;
    this.t0 = performance.now();
    this.resize();
    var self = this;
    this._tick = function (now) { self.frame(now); };
  }
  InfluenceField.prototype.resize = function () {
    var r = this.c.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.narrow = this.w < 760;
    this.portrait = this.w / this.h < 1;
    this.layout();
  };
  InfluenceField.prototype.layout = function () {
    var w = this.w, h = this.h, rand = rng(7), n = this.narrow ? 180 : 520;
    var hero = this.mode === 'hero';
    // Output waveform geometry
    if (this.portrait) {
      this.wave = { x0: w * 0.18, x1: w * 0.92, y: hero ? Math.max(96, h * 0.1) : h * 0.18, amp: Math.min(22, h * 0.03) };
    } else {
      this.wave = { x0: w * (hero ? 0.66 : 0.64), x1: w * 0.94, y: h * (hero ? 0.34 : 0.46), amp: Math.min(34, h * 0.05) };
    }
    // Corpus points
    this.pts = [];
    for (var i = 0; i < n; i++) {
      var x, y;
      if (this.portrait) { x = w * (0.04 + rand() * 0.92); y = h * (0.32 + rand() * 0.64); }
      else { x = w * (0.03 + Math.pow(rand(), 0.85) * (hero ? 0.56 : 0.52)); y = h * (0.08 + rand() * 0.84); }
      this.pts.push({ x: x, y: y, ph: rand() * Math.PI * 2, sp: 0.15 + rand() * 0.35, r: 0.6 + rand() * 1.1, a: 0.12 + rand() * 0.28 });
    }
    this.cycleLen = 5200;
    this.cycle = -1;
    this.sel = [];
  };
  InfluenceField.prototype.waveY = function (x, tt) {
    var wv = this.wave, u = (x - wv.x0) / (wv.x1 - wv.x0);
    var env = Math.sin(Math.PI * Math.max(0, Math.min(1, u)));
    return wv.y + env * wv.amp * (0.55 * Math.sin(u * 19 + tt * 1.3) + 0.3 * Math.sin(u * 41 - tt * 0.9) + 0.15 * Math.sin(u * 83 + tt * 2.1));
  };
  InfluenceField.prototype.pick = function (cycle) {
    var rand = rng(1000 + cycle * 7919), k = this.narrow ? 5 : 8, sel = [], used = {};
    var raw = [], sum = 0;
    for (var i = 0; i < k; i++) { var v = Math.pow(rand(), 2.2) + 0.04; raw.push(v); sum += v; }
    raw.sort(function (a, b) { return b - a; });
    for (var j = 0; j < k; j++) {
      var idx; do { idx = Math.floor(rand() * this.pts.length); } while (used[idx]);
      used[idx] = 1;
      sel.push({ i: idx, wgt: raw[j] / sum, tx: this.wave.x0 + (0.12 + rand() * 0.76) * (this.wave.x1 - this.wave.x0), hue: j / Math.max(1, k - 1) });
    }
    return sel;
  };
  InfluenceField.prototype.frame = function (now) {
    if (!this.running) return;
    var tt = reduceMotion ? 2.0 : (now - this.t0) / 1000;
    this.draw(tt, now);
    if (!reduceMotion) requestAnimationFrame(this._tick); else this.running = false;
  };
  InfluenceField.prototype.draw = function (tt, now) {
    var ctx = this.ctx, w = this.w, h = this.h, wv = this.wave;
    ctx.clearRect(0, 0, w, h);

    var elapsed = reduceMotion ? 2600 : (now - this.t0);
    var cycle = Math.floor(elapsed / this.cycleLen);
    if (cycle !== this.cycle) { this.cycle = cycle; this.sel = this.pick(cycle); }
    var phase = (elapsed % this.cycleLen) / this.cycleLen;          // 0..1
    var life = phase < 0.18 ? phase / 0.18 : phase > 0.78 ? Math.max(0, (1 - phase) / 0.22) : 1;
    var ease = life * life * (3 - 2 * life);

    // Corpus
    var drift = reduceMotion ? 0 : 1;
    for (var i = 0; i < this.pts.length; i++) {
      var p = this.pts[i];
      var x = p.x + drift * Math.sin(tt * p.sp + p.ph) * 4;
      var y = p.y + drift * Math.cos(tt * p.sp * 0.8 + p.ph) * 3;
      ctx.fillStyle = 'rgba(242,237,228,' + p.a + ')';
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.2832); ctx.fill();
    }

    // Threads (spectral) from resolved works to the output
    for (var s = 0; s < this.sel.length; s++) {
      var sel = this.sel[s], q = this.pts[sel.i];
      var sx = q.x + drift * Math.sin(tt * q.sp + q.ph) * 4, sy = q.y + drift * Math.cos(tt * q.sp * 0.8 + q.ph) * 3;
      var ex = sel.tx, ey = this.waveY(ex, tt);
      var col = spectrumAt(sel.hue);
      var stagger = Math.max(0, Math.min(1, ease * 1.6 - s * 0.07));
      if (stagger <= 0) continue;
      var a = (0.4 + sel.wgt * 1.8) * stagger;
      var cx1 = sx + (ex - sx) * 0.45, cy1 = sy, cx2 = sx + (ex - sx) * 0.7, cy2 = ey;
      if (this.portrait) { cx1 = sx; cy1 = sy + (ey - sy) * 0.5; cx2 = ex; cy2 = ey + (sy - ey) * 0.35; }
      var g = ctx.createLinearGradient(sx, sy, ex, ey);
      g.addColorStop(0, 'rgba(' + col + ',0)');
      g.addColorStop(0.35, 'rgba(' + col + ',' + (a * 0.55).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + col + ',' + Math.min(1, a).toFixed(3) + ')');
      ctx.strokeStyle = g;
      ctx.lineWidth = 0.6 + sel.wgt * 7;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey); ctx.stroke();
      // resolved work: halo
      ctx.fillStyle = 'rgba(' + col + ',' + (0.85 * stagger).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(sx, sy, 1.6 + sel.wgt * 5, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = 'rgba(' + col + ',' + (0.35 * stagger).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(sx, sy, 5 + sel.wgt * 14, 0, 6.2832); ctx.stroke();
      // landing tick on the waveform
      ctx.fillStyle = 'rgba(' + col + ',' + (0.9 * stagger).toFixed(3) + ')';
      ctx.fillRect(ex - 0.75, ey - 7, 1.5, 14);
    }

    // Output waveform (ink, calibrated)
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(242,237,228,0.9)';
    ctx.beginPath();
    for (var x2 = wv.x0; x2 <= wv.x1; x2 += 2) { var y2 = this.waveY(x2, tt); if (x2 === wv.x0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2); }
    ctx.stroke();
    // read-out ticks (scale, no numbers)
    ctx.fillStyle = 'rgba(242,237,228,0.28)';
    var base = wv.y + wv.amp + 22;
    for (var k = 0; k <= 24; k++) {
      var tx = wv.x0 + (wv.x1 - wv.x0) * (k / 24);
      ctx.fillRect(tx, base, 1, k % 6 === 0 ? 8 : 4);
    }
    ctx.fillRect(wv.x0, base, wv.x1 - wv.x0, 1);
  };
  InfluenceField.prototype.start = function () { if (this.running) return; this.running = true; requestAnimationFrame(this._tick); };
  InfluenceField.prototype.stop = function () { this.running = false; };

  var fields = [];
  document.querySelectorAll('canvas[data-field]').forEach(function (c) {
    if (!c.getContext) { c.hidden = true; return; }
    var f = new InfluenceField(c);
    fields.push(f);
    if (reduceMotion) { f.running = true; f.frame(performance.now()); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en.forEach(function (x) { x.isIntersecting && !document.hidden ? f.start() : f.stop(); }); }, { threshold: 0 }).observe(c);
    } else { f.start(); }
  });
  document.addEventListener('visibilitychange', function () {
    fields.forEach(function (f) {
      if (document.hidden) f.stop();
      else { var r = f.c.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) f.start(); }
    });
  });
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { fields.forEach(function (f) { f.resize(); if (reduceMotion) { f.running = true; f.frame(performance.now()); } }); }, 150);
  });

  /* ---------- Contact form (mailto fallback) ---------- */
  var CONTACT_EMAIL = 'info@foldartists.com'; // TODO: confirm address, or swap for a form endpoint
  var form = document.getElementById('briefing-form');
  if (form) {
    var params = new URLSearchParams(location.search);
    var preset = params.get('inquiry');
    var map = { lumina: 'LUMINA Technical Evaluation', rights: 'Rights & Licensing', ai: 'AI Technology', distribution: 'Distribution', investment: 'Investment' };
    if (preset && map[preset]) {
      var radio = form.querySelector('input[name="inquiry"][value="' + map[preset] + '"]');
      if (radio) radio.checked = true;
    }
    function setErr(field, msg) {
      var wrap = field.closest('.field'), err = wrap && wrap.querySelector('.err');
      if (!wrap || !err) return;
      if (msg) { wrap.setAttribute('data-invalid', ''); err.textContent = msg; field.setAttribute('aria-invalid', 'true'); }
      else { wrap.removeAttribute('data-invalid'); err.textContent = ''; field.removeAttribute('aria-invalid'); }
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      ['name', 'company', 'email', 'message'].forEach(function (n) {
        var el = form.elements[n], v = (el.value || '').trim(), msg = '';
        if (!v) msg = 'Required.';
        else if (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid work email.';
        setErr(el, msg);
        if (msg) { ok = false; first = first || el; }
      });
      if (!ok) { first.focus(); return; }
      var inquiry = (form.querySelector('input[name="inquiry"]:checked') || {}).value || 'Other';
      var body = [
        'Name: ' + form.elements.name.value.trim(),
        'Company: ' + form.elements.company.value.trim(),
        'Work email: ' + form.elements.email.value.trim(),
        'Inquiry: ' + inquiry,
        '',
        form.elements.message.value.trim()
      ].join('\n');
      track('briefing_form_submit', { inquiry: inquiry });
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Private briefing — ' + inquiry) + '&body=' + encodeURIComponent(body);
      var status = document.getElementById('form-status');
      if (status) status.textContent = 'Your email app should open with the message ready to send.';
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
