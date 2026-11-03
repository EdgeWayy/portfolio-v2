/* Secret acid mode: layout measuring, the original procedural skull, enter and exit.
   Loaded only after the first sign of the secret, or when the session already has it on. */
(function () {
  "use strict";
  const html = document.documentElement, SITE = window.SITE, GL = window.AcidGL;
  const KEY = "akbar-acid";
  /* surfaces with their own solid background: text on them never touches the acid */
  const SOLID = ".top__notch,.top__lang,.cta,.round,.tagpill,.badge,.marquee,.plan,.svcard,.hubcard,.whycard,.about__quote,.about__me,.stack-card,.sticker,.contact,.foot__panel,.fab,.gate,.skip,.acid-chip,.nav";
  let canvas = null, engine = null, chip = null, active = false, lastW = 0, timer = 0, pouring = false, inkQueue = [];
  function followFront() {
    if (!engine || !pouring) return;
    const y = engine.frontY;
    while (inkQueue.length && inkQueue[0][1] - 10 <= y) inkQueue.shift()[0].classList.add("acid-ink");
    if (engine.time > 3.1) { pouring = false; inkQueue.forEach(([el]) => el.classList.add("acid-ink")); inkQueue = []; return; }
    requestAnimationFrame(followFront);
  }

  /* ---------- where the acid may stop ---------- */
  function freeRects() {
    const out = [], walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), range = document.createRange();
    while (walk.nextNode()) {
      const n = walk.currentNode, el = n.parentElement;
      if (!n.textContent.trim() || !el || el.closest(SOLID) || el.closest("script,style,[hidden]")) continue;
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width && r.height) out.push({ el, left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY });
      }
    }
    return out;
  }
  function measure() {
    const vh = innerHeight, rects = freeRects();
    const rows = rects.slice().sort((a, b) => a.top - b.top), bands = [];
    for (const r of rows) {
      const b = bands[bands.length - 1];
      if (b && r.top <= b.bottom + 8) b.bottom = Math.max(b.bottom, r.bottom);
      else bands.push({ top: r.top, bottom: r.bottom });
    }
    // gaps between rows of open text: the edge must fall in one, so no line is ever cut
    const gaps = [];
    let prev = 0;
    for (const b of bands) { gaps.push({ top: prev, bottom: b.top }); prev = b.bottom; }
    gaps.push({ top: prev, bottom: 1e6 });
    const lo = vh * 0.5, hi = vh * 0.65, cost = (g) => {
      const a = Math.max(g.top + 24, lo), z = Math.min(g.bottom - 24, hi);
      return a <= z ? 0 : Math.min(Math.abs(g.top + 24 - hi), Math.abs(g.bottom - 24 - lo));
    };
    const usable = gaps.filter((g) => g.bottom - g.top >= 56 && g.top > 0);
    const g = (usable.length ? usable : gaps).reduce((best, x) => (cost(x) < cost(best) ? x : best));
    const edge = clamp(clamp(g.top + 24, lo, hi), g.top + 24, Math.max(g.top + 24, g.bottom - 24));
    return { edge, rects, band: g };
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function applyLayout(full) {
    if (!engine) return;
    document.querySelectorAll(".acid-ink").forEach((e) => e.classList.remove("acid-ink"));
    const { edge, rects } = measure();
    const below = rects.filter((r) => r.top > edge);
    // text turns ink only when the acid has reached it; until then it stays light on black
    const lowest = new Map();
    for (const r of rects) if (r.bottom <= edge) lowest.set(r.el, Math.max(lowest.get(r.el) || 0, r.bottom));
    for (const r of rects) if (r.bottom > edge && lowest.has(r.el)) lowest.delete(r.el);
    inkQueue = pouring ? [...lowest].sort((a, b) => a[1] - b[1]) : [];
    if (!pouring) lowest.forEach((_, el) => el.classList.add("acid-ink"));
    const H = Math.round(Math.min(edge + 340, document.documentElement.scrollHeight));
    const floor = (x) => {
      let y = H - 8;
      for (const r of below) if (x > r.left - 10 && x < r.right + 10 && r.top - 10 < y) y = r.top - 10;
      return y;
    };
    engine.setLayout(edge, floor);
    window.__acidEdge = edge;
    if (full) { engine.resize(document.documentElement.clientWidth, H); engine.rebuild(); }
    lastW = innerWidth;
  }

  /* ---------- the skull: original procedural artwork ---------- */
  function buildSkull() {
    const W = 240, H = 300;
    const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c.getContext("2d", { willReadFrequently: true }); };
    const read = (x) => { const d = x.getImageData(0, 0, W, H).data, a = new Float32Array(W * H); for (let i = 0; i < a.length; i++) a[i] = d[i * 4] / 255; return a; };
    function blur(a, r) {
      if (r < 1) return a;
      let src = a;
      for (let pass = 0; pass < 2; pass++) {
        const t = new Float32Array(W * H), out = new Float32Array(W * H);
        for (let y = 0; y < H; y++) { let s = 0; for (let x = -r; x < W; x++) { if (x + r < W) s += src[y * W + x + r]; if (x - r - 1 >= 0) s -= src[y * W + x - r - 1]; if (x >= 0) t[y * W + x] = s / (2 * r + 1); } }
        for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y < H; y++) { if (y + r < H) s += t[(y + r) * W + x]; if (y - r - 1 >= 0) s -= t[(y - r - 1) * W + x]; if (y >= 0) out[y * W + x] = s / (2 * r + 1); } }
        src = out;
      }
      return src;
    }
    const shape = (draw) => { const x = mk(); x.fillStyle = "#000"; x.fillRect(0, 0, W, H); x.fillStyle = x.strokeStyle = "#fff"; draw(x); return read(x); };
    const both = (fn) => { fn(1); fn(-1); };
    const mir = (x) => (s) => (s > 0 ? x : 240 - x);

    // silhouette: cranium, cheekbones, upper jaw, mandible
    const mask = shape((x) => {
      x.beginPath(); x.ellipse(120, 100, 88, 90, 0, 0, 6.2832); x.fill();
      x.beginPath(); x.moveTo(40, 112); x.bezierCurveTo(34, 150, 44, 178, 68, 190); x.lineTo(76, 226); x.lineTo(164, 226); x.lineTo(172, 190); x.bezierCurveTo(196, 178, 206, 150, 200, 112); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(62, 186); x.bezierCurveTo(60, 226, 74, 286, 120, 292); x.bezierCurveTo(166, 286, 180, 226, 178, 186); x.closePath(); x.fill();
    });

    // darkness layers, from broad form to details
    let dark = new Float32Array(W * H);
    const add = (a, k) => { for (let i = 0; i < dark.length; i++) dark[i] = Math.max(dark[i], a[i] * k); };
    const soft = blur(mask, 9);
    for (let i = 0; i < dark.length; i++) dark[i] = Math.max(0, Math.min(1, (1 - soft[i]) * 1.5)); // the form turns away at its edges
    add(blur(shape((x) => { both((s) => { x.beginPath(); x.ellipse(mir(44)(s), 122, 16, 34, s * 0.16, 0, 6.2832); x.fill(); }); }), 8), 0.6); // temples
    add(blur(shape((x) => { both((s) => { x.beginPath(); x.ellipse(mir(66)(s), 193, 17, 15, 0, 0, 6.2832); x.fill(); }); }), 5), 0.95); // hollows under the cheekbones
    add(blur(shape((x) => { x.beginPath(); x.ellipse(120, 266, 34, 10, 0, 0, 6.2832); x.fill(); }), 5), 0.32); // under the chin bulge
    add(blur(shape((x) => { both((s) => { x.beginPath(); x.ellipse(mir(84)(s), 136, 37, 31, s * 0.2, 0, 6.2832); x.fill(); }); }), 5), 0.5); // brow shadow around the sockets
    add(blur(shape((x) => { both((s) => { // deep eye sockets, slanted, heavier at the outer corner
      const X = mir; x.beginPath();
      x.moveTo(X(106)(s), 124); x.bezierCurveTo(X(100)(s), 112, X(74)(s), 108, X(60)(s), 122); x.bezierCurveTo(X(50)(s), 136, X(56)(s), 158, X(74)(s), 162); x.bezierCurveTo(X(92)(s), 166, X(110)(s), 148, X(106)(s), 124); x.fill();
    }); }), 1), 1);
    add(blur(shape((x) => { // nasal cavity: an upside-down heart with a thin septum
      x.beginPath(); x.moveTo(120, 160); x.bezierCurveTo(112, 170, 102, 190, 106, 199); x.bezierCurveTo(110, 205, 117, 201, 120, 192); x.bezierCurveTo(123, 201, 130, 205, 134, 199); x.bezierCurveTo(138, 190, 128, 170, 120, 160); x.fill();
    }), 1), 1);
    add(blur(shape((x) => { // crack across the forehead
      x.lineWidth = 2.6; x.lineJoin = "round"; x.beginPath(); x.moveTo(166, 30); x.lineTo(156, 50); x.lineTo(165, 62); x.lineTo(150, 82); x.lineTo(155, 96); x.stroke();
      x.lineWidth = 2; x.beginPath(); x.moveTo(165, 62); x.lineTo(178, 72); x.stroke();
    }), 0), 0.95);
    add(shape((x) => { // gap between the jaws, wide open at the corners
      x.beginPath(); x.moveTo(70, 221); x.bezierCurveTo(90, 231, 150, 231, 170, 221); x.lineTo(176, 238); x.bezierCurveTo(150, 246, 90, 246, 64, 238); x.closePath(); x.fill();
    }), 1);
    const teeth = (y0, y1, count, x0, x1) => shape((x) => {
      const w = (x1 - x0) / count;
      for (let i = 0; i < count; i++) { x.beginPath(); x.roundRect(x0 + i * w + 2.1, y0, w - 4.2, y1 - y0, 2.4); x.fill(); }
    });
    const up = teeth(211, 231, 8, 76, 164), low = teeth(235, 252, 8, 80, 160);
    for (let i = 0; i < dark.length; i++) dark[i] = Math.max(dark[i] * (1 - Math.max(up[i], low[i])), Math.max(up[i], low[i]) * 0.04);
    add(shape((x) => { for (let i = 0; i <= 8; i++) { const X = 76 + i * 11; x.fillRect(X - 1.9, 209, 3.8, 23); } for (let i = 0; i <= 8; i++) { const X = 80 + i * 10; x.fillRect(X - 1.9, 234, 3.8, 18); } }), 1);

    const sample = (pitchFrac) => {
      const cols = Math.floor(1 / pitchFrac), rowH = pitchFrac * Math.sqrt(3) / 2, rowsN = Math.floor(1.25 / rowH), s = W, rows = [];
      const k = Math.max(1, Math.round(pitchFrac * s * 0.42));
      const d = blur(dark, k > 1 ? 1 : 0), m = blur(mask, 1);
      // the skull art is 240 x 300, the same 4:5 box as the portrait
      for (let j = 0; j < rowsN; j++) {
        let line = "";
        for (let i = 0; i < cols; i++) {
          const x = (i + 0.5 + (j % 2 ? 0.5 : 0)) * pitchFrac * s, y = (j + 0.5) * rowH * s;
          const xi = Math.min(W - 1, x | 0), yi = Math.min(H - 1, y | 0);
          if (x >= W || m[yi * W + xi] < 0.5) { line += "."; continue; }
          line += String(Math.round(Math.pow(d[yi * W + xi], 0.85) * 9));
        }
        rows.push(line);
      }
      return { pitch: pitchFrac, rows };
    };
    const P = window.PORTRAIT;
    return { ar: 1.25, full: sample(P.full.pitch), lite: sample(P.lite.pitch) };
  }
  let skull = null;
  const getSkull = () => (window.PORTRAIT ? skull || (skull = buildSkull()) : null); // only Home has the portrait

  /* ---------- reveal ---------- */
  function reveal(x, y, duration, change) {
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    if (!document.startViewTransition || SITE.reduced()) { change(); return Promise.resolve(); }
    html.classList.add("vt-reveal");
    const vt = document.startViewTransition(change);
    vt.ready.then(() => {
      html.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] }, { duration, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
    vt.finished.finally(() => html.classList.remove("vt-reveal"));
    return vt.updateCallbackDone;
  }

  /* ---------- enter and exit ---------- */
  function mount(pour) {
    canvas = document.createElement("canvas");
    canvas.className = "acid-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    engine = GL.create(canvas, { lite: SITE.mode !== "full" });
    if (!engine) { canvas.remove(); canvas = null; return false; }
    chip = document.createElement("button");
    chip.type = "button";
    chip.className = "acid-chip ix";
    chip.textContent = "ACID ×";
    chip.setAttribute("aria-label", SITE.lang === "ru" ? "Выключить режим ACID" : "Turn off ACID mode");
    chip.addEventListener("click", () => { const r = chip.getBoundingClientRect(); exit(r.left + r.width / 2, r.top + r.height / 2); });
    document.body.append(chip);
    pouring = !!pour && !SITE.reduced();
    applyLayout(true);
    if (!pouring) { engine.seek(30); if (!SITE.reduced()) engine.start(true); }
    else { engine.seek(0); engine.start(false); requestAnimationFrame(followFront); }
    return true;
  }
  function unmount() {
    if (engine) engine.destroy();
    if (canvas) canvas.remove();
    if (chip) chip.remove();
    engine = canvas = chip = null;
    pouring = false; inkQueue = [];
    document.querySelectorAll(".acid-ink").forEach((e) => e.classList.remove("acid-ink"));
  }
  const store = (on) => { try { if (on) sessionStorage.setItem(KEY, "1"); else sessionStorage.removeItem(KEY); } catch (e) {} };

  async function fontsReady() {
    if (!document.fonts) return;
    await Promise.race([
      Promise.all([document.fonts.load('40px "Rubik Wet Paint"', "АБab0"), document.fonts.load('40px "Rubik Wet Paint"', "ab"), document.fonts.load('400 16px "JetBrains Mono"', "АБ"), document.fonts.load('400 16px "JetBrains Mono"', "ab")]),
      new Promise((r) => setTimeout(r, 1200)),
    ]).catch(() => {});
  }
  async function enter(x, y) {
    if (active || !GL.supported()) return false;
    await fontsReady();
    active = true;
    store(true);
    SITE.portrait.useSkull(getSkull(), !SITE.reduced());
    SITE.acidChanged(true);
    await reveal(x, y, 700, () => {
      html.dataset.mode = "acid";
      if (!mount(true)) { delete html.dataset.mode; active = false; store(false); SITE.portrait.useSkull(null, false); SITE.acidChanged(false); }
    });
    return active;
  }
  function exit(x, y) {
    if (!active) return;
    active = false;
    store(false);
    SITE.portrait.useSkull(null, !SITE.reduced());
    SITE.acidChanged(false);
    reveal(x, y, 700, () => { delete html.dataset.mode; unmount(); });
  }
  /** the session already has the mode on: finished state at once, on this page too */
  async function restore() {
    if (!GL.supported()) { delete html.dataset.mode; store(false); return; }
    active = true;
    SITE.portrait.useSkull(getSkull(), false);
    SITE.acidChanged(true);
    await fontsReady();
    if (!mount(false)) { delete html.dataset.mode; active = false; store(false); }
  }

  addEventListener("resize", () => {
    if (!active) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!engine) return;
      const wide = innerWidth !== lastW;
      pouring = false;
      applyLayout(wide);
      engine.seek(30);
    }, 160);
  });
  SITE.onLang(() => {
    if (!active || !engine) return;
    if (chip) chip.setAttribute("aria-label", SITE.lang === "ru" ? "Выключить режим ACID" : "Turn off ACID mode");
    applyLayout(false);
    engine.redraw();
  });

  window.AcidMode = {
    enter, exit, restore,
    toggle(x, y) { return active ? (exit(x, y), Promise.resolve(false)) : enter(x, y); },
    get active() { return active; },
    get engine() { return engine; },
    buildSkull,
  };
})();
