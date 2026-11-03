/* Entry gate: autumn leaves on one canvas. Hold to build the words, let go and they fall.
   Physics is continuous: every leaf always keeps its position, velocity and rotation. Pressing and
   releasing only change what pulls on it, so a falling leaf can be caught in mid-air.
   At 100% the word holds briefly, the leaves scatter and fade, and the site's own reveal runs. */
(function () {
  "use strict";
  const html = document.documentElement;
  const root = document.getElementById("gate");
  if (!root) return;
  if (!html.classList.contains("gate-on")) { root.remove(); return; }
  window.__gateReady = true;

  const SITE = window.SITE;
  const canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const btn = root.querySelector("[data-hold]");
  const fill = root.querySelector(".hold__fill");
  const live = root.querySelector("[data-hold-live]");
  const pctEl = root.querySelector("[data-hold-pct]");
  const hintEl = root.querySelector("[data-gate-hint]");
  const bottomEl = root.querySelector(".gate__bottom");

  const HOLD_SECONDS = 3.45; // FULL mode: press to 100% before the display catches up. The one number to tweak; everything below scales from it.
  const SMOOTH = 0.2;      // displayed percentage follows progress, about 0.2 s behind
  const ZETA = 0.7;        // spring damping ratio: settle overshoot about 4.6%
  const BLEND_S = 0.15;    // forces cross over this fast on press and release
  const DECAY = 0.7;       // progress lost per second after release
  const GRAVITY = 900, DRAG = 1.6; // px/s2 and 1/s: terminal speed about 560 px/s
  const FORMED_HOLD = 0.3 * HOLD_SECONDS / 3.9, SITE_AFTER = 0.4; // word holds, then the site starts this long into the scatter
  const SAFETY_MS = 4000;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const smoothstep = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const isLite = () => SITE.mode !== "full";
  /* Stage lengths, plateaus and start-delay spread, as shares of the hold: the rhythm stays the same at any
     HOLD_SECONDS. LITE keeps its own shorter rhythm, about 0.8 of FULL. Omega is the leaf spring, not timing. */
  const timingMemo = {};
  const timing = () => {
    const lite = isLite();
    if (timingMemo[lite]) return timingMemo[lite];
    const total = HOLD_SECONDS * (lite ? 3.1 / 3.9 : 1), base = lite ? 3.1 : 3.9;
    const stage = total * (lite ? 1.2 : 1.6) / base, hold = total * 0.5 / base, last = total * 0.2 / base;
    return (timingMemo[lite] = { stage, hold, last, spread: stage * 0.5, omega: lite ? 8.4 : 6.3, total, second: stage + hold });
  };

  /* Quality tier: only hidden cost changes, the look stays. 0 full. 1 and 2: lower canvas resolution, a smaller share
     of the ground pile stirring, and fewer ground leaves flying in the scatter. Set from the hardware at start, raised
     by the first drawing's cost and by slow frames while holding; never lowered, so nothing visibly changes back. */
  const TIERS = [
    { dpr: 2, stir: 0.25, fly: 1 },
    { dpr: 1.5, stir: 0.15, fly: 0.5 },
    { dpr: 1.25, stir: 0.08, fly: 0.25 },
  ];
  let spriteKey = 0, tier = SITE.deviceHint(), pile = null, pileY = 0, pileH = 0, slowFrames = 0, frameCount = 0, tierAt = 0;

  let W = 0, H = 0, dpr = 1, leaves = [], order = [], draw = [], sprites = null, step = 10, base2 = null, baseAlpha = 1;
  let state = "boot"; // boot · live · formed · scatter · done
  let progress = 0, shown = 0, vel = 0, stir = 0, last = 0, stateStart = 0, raf = 0, holding = false;
  let siteStarted = false, scatterEnd = 0, safety = 0, wordCx = 0, wordCy = 0;

  /* ---------- text sampling ---------- */
  const wordsNow = () => SITE.season.gate[SITE.lang];

  const rendered = new Map(); // a word's pixels, kept for the whole build: finding a grid step needs many passes
  function renderWord(lines, cy, maxH) {
    const key = lines.join("|");
    if (rendered.has(key)) return rendered.get(key);
    const off = document.createElement("canvas");
    off.width = Math.ceil(W);
    off.height = Math.ceil(H);
    const c = off.getContext("2d", { willReadFrequently: true });
    c.font = SITE.displayFont(100);
    const m = lines.map((l) => c.measureText(l));
    const widest = Math.max(...m.map((x) => x.width));
    const cap = Math.max(...m.map((x) => x.actualBoundingBoxAscent || 72));
    const gap = 0.16; // line gap in units of cap height
    const blockAt100 = cap * (lines.length + gap * (lines.length - 1));
    const px = Math.min(Math.min(W * 0.92, 1325) / widest, maxH / blockAt100) * 100;
    c.font = SITE.displayFont(px);
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    c.fillStyle = "#000";
    const capPx = (cap * px) / 100, lineStep = capPx * (1 + gap);
    const top = cy - (capPx * lines.length + capPx * gap * (lines.length - 1)) / 2;
    lines.forEach((l, i) => c.fillText(l, W / 2, top + capPx + i * lineStep));
    const out = { img: c.getImageData(0, 0, off.width, off.height).data, w: off.width, h: off.height };
    rendered.set(key, out);
    return out;
  }
  function samplePoints(lines, gridStep, cy, maxH) {
    const { img, w: off_w, h: off_h } = renderWord(lines, cy, maxH), off = { width: off_w, height: off_h };
    const pts = [], jitter = gridStep * 0.14, inset = Math.min(gridStep, step) * 0.3;
    const inside = (x, y) => x >= 0 && y >= 0 && x < off.width && y < off.height && img[((y | 0) * off.width + (x | 0)) * 4 + 3] > 128;
    for (let x = gridStep / 2; x < off.width; x += gridStep) {
      for (let y = gridStep / 2; y < off.height; y += gridStep) {
        if (inside(x, y) && inside(x - inset, y) && inside(x + inset, y) && inside(x, y - inset) && inside(x, y + inset)) {
          pts.push({ x: x + rand(-jitter, jitter), y: y + rand(-jitter, jitter) });
        }
      }
    }
    // left to right, then top to bottom: leaf i keeps its horizontal rank in both words
    pts.sort((a, b) => a.x - b.x || a.y - b.y);
    return { pts };
  }

  /* ---------- build ---------- */
  function moundHeight(x, pileH) {
    const u = (2 * x) / W - 1;
    const bumps = 1 + 0.07 * Math.sin(x * 0.021) + 0.05 * Math.sin(x * 0.047 + 1.3);
    return pileH * (0.2 + 0.8 * Math.pow(Math.max(0, 1 - u * u), 0.85)) * bumps;
  }

  function build() {
    const box = root.getBoundingClientRect();
    W = box.width; H = box.height;
    rendered.clear();
    const lite = isLite(), tm = timing();

    const w = wordsNow();
    const narrow = W < 760;
    pileH = H * (H < 520 ? 0.2 : 0.28);
    root.style.setProperty("--pile-h", pileH.toFixed(0) + "px");
    const controls = bottomEl.getBoundingClientRect().height || 180;
    const topGap = 72, room = Math.max(90, H - pileH - controls - topGap - 22);
    const cy = topGap + room / 2, maxH = Math.min(H * 0.55, room * 0.94);
    wordCx = W / 2; wordCy = cy;
    const lines2 = narrow ? w.split : [w.word];

    // Narrow screens go finer than the usual 7 px minimum: at 7 px the Cyrillic word was not readable.
    step = narrow ? 5.6 : clamp(W / 70, 7, 12);
    const liteMax = narrow ? 620 : 440;
    let a = samplePoints([w.name], step, cy, maxH), b = samplePoints(lines2, step, cy, maxH);
    if (lite) {
      let guard = 0;
      while (Math.max(a.pts.length, b.pts.length) > liteMax && guard++ < 24) {
        step *= 1.07;
        a = samplePoints([w.name], step, cy, maxH);
        b = samplePoints(lines2, step, cy, maxH);
      }
    }
    const need = Math.max(a.pts.length, b.pts.length);
    const count = lite ? clamp(need, 300, narrow ? 600 : 420) : Math.round(clamp(need, 700, 1100) * clamp(W / 1440, 1, 1.8));
    // A word with fewer points than leaves gets a finer grid, so leaves spread evenly instead of stacking.
    const refine = (s, lines) => (s.pts.length < count * 0.9 ? samplePoints(lines, Math.max(4, step * Math.sqrt(s.pts.length / count)), cy, maxH) : s);
    a = refine(a, [w.name]);
    b = refine(b, lines2);

    const base = Math.max(step * 1.5, 13); // "current" pile size; front leaves go 1.6 to 2.2x
    // tiles as big as the largest leaf actually drawn, no bigger: less to paint and to sample every frame
    const need2x = Math.ceil(base * 2.2 * Math.min(devicePixelRatio || 1, TIERS[tier].dpr) / 2);
    const logical = clamp(need2x, 16, lite ? 32 : 48);
    if (spriteKey && spriteKey !== logical) SITE.freeSprites(spriteKey);
    spriteKey = logical;
    sprites = SITE.buildSprites(logical);
    const common = (layer) => ({
      shape: Math.floor(Math.random() * sprites.shapes), roll: Math.random(),
      rest: rand(-Math.PI, Math.PI),
      flat: Math.random() < 0.85 ? rand(0.45, 0.9) : 1,
      layer, ph: rand(0, 6.28), arc: 0, spin: rand(-1, 1),
      x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, size: 0, sq: 1, air: 0, q: 0, alpha: 1,
      b: 0, slot: 0, d0: 1, awake: false, gf: rand(0.75, 1.25), // b: 0 falling, 1 pulled to its slot
    });

    // Back layer: darker, smaller, stays on the ground while the bright leaves fly.
    const backCount = Math.round(count * (lite ? 0.62 : 0.7) * (tier === 2 ? 0.75 : 1));
    const back = [];
    for (let i = 0; i < backCount; i++) {
      const x = Math.random() * W, h = moundHeight(x, pileH);
      back.push(Object.assign(common(0), {
        gx: x, gy: H - h * 0.97 * Math.pow(Math.random(), 0.62) + 6,
        pile: base * rand(0.95, 1.3), color: SITE.pickColor("back"), tint: Math.random() < 0.7 ? 0 : 1, stays: true,
      }));
    }

    // Word leaves: sorted by x so rising leaves never cross the whole screen.
    const spots = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * W, h = moundHeight(x, pileH), kind = Math.random();
      if (kind < 0.035) spots.push({ x, y: H - h * rand(1.02, 1.14), layer: 1 }); // loose, further up the slopes
      else if (kind < 0.6) spots.push({ x, y: H - h * 0.97 * Math.pow(Math.random(), 0.62) + 4, layer: 1 });
      else spots.push({ x, y: H - h * 0.72 * Math.pow(Math.random(), 0.9) + 6, layer: 2 });
    }
    spots.sort((p, q) => p.x - q.x);
    const far = Math.hypot(W / 2, H / 2);
    const front = spots.map((s, i) => {
      const A = a.pts[Math.floor((i * a.pts.length) / count)] || s;
      const B = b.pts[Math.floor((i * b.pts.length) / count)] || s;
      const spring = tm.omega * tm.omega * rand(0.8, 1.2); // own strength, +/- 20%
      // start delay: 3/4 from the distance to the word centre, 1/4 random
      const delay = (P) => (clamp(Math.hypot(P.x - W / 2, P.y - cy) / far, 0, 1) * 0.75 + Math.random() * 0.25) * tm.spread;
      return Object.assign(common(s.layer), {
        gx: s.x, gy: s.y, ax: A.x, ay: A.y, bx: B.x, by: B.y,
        pile: base * (s.layer === 2 ? rand(1.6, 2.2) : rand(1.3, 1.7)),
        word: Math.min(step * 1.5 * rand(0.8, 1.25), step * 2), // never above 2x the grid step
        color: SITE.pickColor("word"),
        tint: s.layer === 2 ? (Math.random() < 0.6 ? 3 : 2) : (Math.random() < 0.6 ? 2 : 1),
        d1: delay(A), d2: delay(B),
        k: spring, c: 2 * ZETA * Math.sqrt(spring),
        arc: rand(0.12, 0.4) * (i % 2 ? 1 : -1),
        r1: rand(-Math.PI, Math.PI), r2: rand(-Math.PI, Math.PI),
      });
    });
    leaves = back.concat(front);
    // Back layer first, then each layer from the top of the mound down, so it reads as a real pile.
    order = leaves.slice().sort((p, q) => p.layer - q.layer || p.gy - q.gy);
    for (const l of leaves) { l.tile = sprites.leaf(l.shape, l.color, l.tint); l.shade = sprites.shadow(l.shape); }
    rendered.clear();
    progress = shown = vel = stir = 0;
    baseAlpha = 1;
    setRing(0);
    state = "live";
    hintEl.textContent = SITE.reduced() ? w.hintReduced : w.hint;
    for (const l of leaves) restAt(l);
    applyTier();
    drawLeaves();
    probe();
    if (holding) wake();
  }
  /* The mound's base and the still part of the ground pile go into one image, drawn once per frame instead of two
     images per leaf. A share of the ground leaves stays live, so the pile still rustles. */
  function applyTier() {
    const q = TIERS[tier];
    dpr = Math.min(devicePixelRatio || 1, q.dpr);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    base2 = new Path2D();
    base2.moveTo(0, (H + 4) * dpr);
    for (let x = 0; x <= W + 12; x += 12) base2.lineTo(x * dpr, (H - moundHeight(x, pileH) * 0.8) * dpr);
    base2.lineTo(W * dpr + 12, (H + 4) * dpr);
    base2.closePath();
    for (const l of leaves) if (l.stays) l.live = l.roll < q.stir;
    bakePile();
  }
  function bakePile() {
    const t0 = performance.now();
    pileY = Math.max(0, Math.floor((H - pileH * 1.35 - 40) * dpr));
    // its own layer under the leaves: the compositor shows it, so it costs nothing per frame
    if (!pile) {
      pile = document.createElement("canvas");
      pile.className = "gate__pile";
      pile.setAttribute("aria-hidden", "true");
      canvas.before(pile);
    }
    pile.width = canvas.width;
    pile.height = Math.max(1, canvas.height - pileY);
    pile.style.top = pileY / dpr + "px";
    pile.style.height = pile.height / dpr + "px";
    const c = pile.getContext("2d");
    c.translate(0, -pileY);
    c.fillStyle = "#2A1B10";
    c.fill(base2);
    const list = order.filter((l) => l.stays && !l.live);
    drawInto(c, list);
    draw = order.filter((l) => !l.stays || l.live);
    return performance.now() - t0;
  }
  /* A short check at start: redraw the resting pile a few times and see how long a frame really takes. */
  function probe() {
    if (SITE.reduced()) return;
    const gaps = [];
    let prev = 0;
    const f = (t) => {
      if (state !== "live" || holding) return;
      if (prev) gaps.push(t - prev);
      prev = t;
      if (gaps.length < 11) { drawLeaves(); return requestAnimationFrame(f); }
      gaps.sort((a, b) => a - b); // the median: the first frames always pay for painting the atlas
      const mid = gaps[5];
      if (mid > 24) raiseTier(mid > 50 ? 2 : tier + 1);
    };
    requestAnimationFrame(f);
  }
  function raiseTier(to) {
    if (to <= tier || tier >= 2) return;
    tier = Math.min(2, to);
    tierAt = performance.now();
    applyTier();
  }
  /* While holding: sustained slow frames step the quality down once per second at most. */
  function watchFrames(dt, now) {
    slowFrames = dt > 0.03 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
    if (slowFrames >= 20 && tier < 2 && now - tierAt > 1000) { slowFrames = 0; raiseTier(tier + 1); }
  }
  function restAt(l) {
    l.x = l.gx; l.y = l.gy; l.rot = l.rest; l.size = l.pile; l.sq = l.flat; l.air = 0; l.q = 0; l.b = 0; l.slot = 0;
    l.vx = l.vy = l.vr = 0; l.awake = false;
  }

  /* ---------- wind ---------- */
  /** Curl of a smooth moving potential: a wind field with no sources, so leaves swirl and never bunch up. */
  const NS = 0.0042;
  let cx = 0, cy = 0;
  function curl(x, y, t) {
    const a = x * NS + t * 0.35, b = y * NS - t * 0.27, c = (x + y) * NS * 0.6 + t * 0.2, k = Math.cos(c) * 0.3;
    cx = -Math.sin(a) * Math.sin(b) + k;
    cy = -Math.cos(a) * Math.cos(b) - k;
  }

  /* ---------- the one force model for word leaves ---------- */
  function stepLeaf(l, slot, t, dt, windAmp, sway) {
    if (slot !== l.slot) { // a new target: measure the flight so wind can fade on approach
      l.slot = slot;
      if (slot) l.d0 = Math.max(40, Math.hypot((slot === 2 ? l.bx : l.ax) - l.x, (slot === 2 ? l.by : l.ay) - l.y));
    }
    const want = slot ? 1 : 0;
    if (!want && !l.awake) return;
    l.awake = true;
    l.b = want > l.b ? Math.min(1, l.b + dt / BLEND_S) : Math.max(0, l.b - dt / BLEND_S);

    const b = l.b, r = 1 - b;
    const tx = (slot === 2 ? l.bx : l.ax) + Math.sin(t * 1.5 + l.ax * 0.012) * sway;
    const ty = (slot === 2 ? l.by : l.ay) + Math.cos(t * 1.2 + l.ph) * sway * 0.7;
    const dist = slot ? Math.hypot(tx - l.x, ty - l.y) : 0;
    // wind and arc peak mid-flight and fade near the slot. Wind scales with the flight length:
    // at full strength on a short hop it would beat the spring and the leaf would never land.
    const f = slot ? Math.sin(Math.PI * clamp(1 - dist / l.d0, 0, 1)) : 0, amp = windAmp * Math.min(1, l.d0 / 500) * f;
    curl(l.x, l.y, t);
    const wx = cx * amp, wy = cy * amp;
    const flutter = Math.sin(t * 2.6 + l.ph) * 140;
    const n = dt > 0.0125 ? (dt > 0.025 ? 3 : 2) : 1, h = dt / n; // capped, so a slow frame cannot cost more than a fast one
    for (let i = 0; i < n; i++) {
      let ax = 0, ay = 0;
      if (b > 0) {
        const ex = tx - l.x, ey = ty - l.y;
        ax += b * (l.k * ex - l.c * l.vx + wx - ey * l.k * l.arc * f); // the perpendicular push bends the path
        ay += b * (l.k * ey - l.c * l.vy + wy + ex * l.k * l.arc * f);
      }
      if (r > 0) {
        const dy = l.gy - l.y, near = smoothstep(1 - dy / 70); // free fall, then a soft landing on the pile slot
        ax += r * ((6 + 54 * near) * (l.gx - l.x) - (1.6 + 13.9 * near) * l.vx + flutter * (1 - near));
        ay += r * ((1 - near) * (GRAVITY * l.gf - DRAG * l.vy) + near * (60 * dy - 15.5 * l.vy));
      }
      l.vx += ax * h; l.vy += ay * h;
      l.x += l.vx * h; l.y += l.vy * h;
    }
    const rotTo = slot === 2 ? l.r2 : slot === 1 ? l.r1 : l.rest;
    l.vr += ((rotTo - l.rot) * 14 - l.vr * 6.5 + l.spin * (f * 8 + r * Math.sin(t * 3 + l.ph) * 5)) * dt;
    l.rot += l.vr * dt;
    l.q += (want - l.q) * (1 - Math.exp(-dt / (want ? 0.35 : 0.45)));
    l.air = l.q;
    l.sq = l.flat + (1 - l.flat) * l.q;
    l.size = l.pile + (l.word - l.pile) * smoothstep(l.q);
    if (!want && b === 0 && Math.hypot(l.gx - l.x, l.gy - l.y) < 0.5 && Math.abs(l.vx) + Math.abs(l.vy) < 6 && Math.abs(l.rot - l.rest) < 0.03 && l.q < 0.02) {
      restAt(l);
    }
  }

  function stepLive(t, dt) {
    const tm = timing();
    progress = holding ? Math.min(1, progress + dt / tm.total) : Math.max(0, progress - DECAY * dt);
    follow(progress, dt);
    setRing(shown);
    const clock = progress * tm.total;
    stir += ((holding || progress > 0 ? 1 : 0) - stir) * (1 - Math.exp(-dt / 0.25));
    if (stir < 0.002 && !holding && progress === 0) stir = 0;
    const wind = 1500 * clamp(W / 1440, 0.55, 1.3), sway = step * 0.2;
    let busy = holding || progress > 0 || shown > 0 || stir > 0;
    for (const l of leaves) {
      if (l.stays) {
        if (!l.live) continue; // part of the baked pile
        l.x = l.gx + Math.sin(t * 1.4 + l.ph) * stir * (0.8 + progress * 2.4); // ground leaves only stir
        l.rot = l.rest + Math.sin(t * 1.7 + l.ph) * stir * (0.05 + progress * 0.12);
      } else {
        const slot = !holding ? 0 : clock >= tm.second + l.d2 ? 2 : clock >= l.d1 ? 1 : 0;
        stepLeaf(l, slot, t, dt, wind, sway);
        if (l.awake) busy = true;
      }
    }
    if (holding && progress >= 1 && shown >= 0.985) { formed(); return true; }
    return busy;
  }

  /* ---------- the ending ---------- */
  function formed() {
    state = "formed";
    stateStart = performance.now();
    holding = false;
    btn.classList.remove("down");
    remember();
    live.textContent = "100%";
    setRing(1);
    if (!SITE.reduced()) svgEl.animate({ scale: [1, 1.1, 1], opacity: [1, 0.55, 1] }, { duration: 240, easing: "ease-out" });
  }
  function startScatter(now) {
    state = "scatter";
    stateStart = now;
    root.classList.add("leaving");
    const tm = isLite() ? 0.8 : 1, far = Math.hypot(W / 2, H / 2), speedK = clamp(W / 1440, 0.6, 1.3);
    scatterEnd = 0;
    const fly = TIERS[tier].fly;
    for (const l of leaves) if (l.stays) l.live = l.roll < fly;
    bakePile(); // the leaves that fly leave the image, so nothing shows twice
    leaves = draw;
    for (const l of leaves) {
      const dx = l.x - wordCx, dy = l.y - wordCy, d = Math.hypot(dx, dy) || 1, near = 1 - clamp(d / far, 0, 1);
      const dirX = dx / d, dirY = dy / d, swirl = rand(0.2, 0.55) * (l.spin > 0 ? 1 : -1);
      // nearer the centre flies faster; the ground pile gets a softer push
      const v = rand(320, 720) * (0.35 + near) * speedK * (l.stays ? 0.5 : 1);
      l.vx = (dirX - dirY * swirl) * v;
      l.vy = (dirY + dirX * swirl) * v;
      l.floats = Math.random() < 0.25; // some float up, most drift down and out
      l.grav = l.floats ? rand(-90, -20) : rand(180, 520);
      l.vr = rand(-5, 5);
      l.fadeAt = rand(0.45, 1.05) * tm;
      l.fadeFor = rand(0.5, 0.85) * tm;
      l.drag = rand(0.9, 1.5);
      scatterEnd = Math.max(scatterEnd, l.fadeAt + l.fadeFor);
    }
    safety = setTimeout(finish, SAFETY_MS);
  }
  function stepScatter(T, t, dt) {
    baseAlpha = clamp(1 - T / 0.6, 0, 1);
    if (!siteStarted && T >= SITE_AFTER) startSite();
    for (const l of leaves) {
      curl(l.x, l.y, t);
      l.vx += (cx * 180 + 70 - l.vx * l.drag) * dt;
      l.vy += (cy * 180 + l.grav - l.vy * l.drag) * dt;
      l.x += l.vx * dt; l.y += l.vy * dt;
      l.rot += l.vr * dt;
      l.air = Math.max(l.air, Math.min(1, T * 3));
      l.sq += (1 - l.sq) * Math.min(1, dt * 3);
      l.alpha = 1 - smoothstep((T - l.fadeAt) / l.fadeFor);
    }
    if (T >= scatterEnd) finish();
  }
  /* The page's own reveal. The gate stays on top, its ink crossfades to the theme's page colour, and the
     width is pinned so the scrollbar coming back does not stretch the canvas. */
  function startSite() {
    siteStarted = true;
    root.style.width = W + "px";
    scrollTo({ top: 0, behavior: "instant" });
    html.classList.add("build");
    SITE.reveal("gate"); // removes .gate-on and creates every animation in one tick
    root.style.backgroundColor = "transparent";
  }
  /** Always ends with the site visible and the overlay gone. */
  function finish() {
    if (state === "done") return;
    state = "done";
    clearTimeout(safety);
    cancelAnimationFrame(raf);
    if (!siteStarted) { siteStarted = true; SITE.reveal("skip"); }
    html.classList.remove("build", "gate-on");
    const hadFocus = document.activeElement === btn || document.activeElement === document.body;
    root.remove();
    SITE.freeSprites(spriteKey);
    if (hadFocus) {
      const m = document.getElementById("main");
      if (m) { m.setAttribute("tabindex", "-1"); m.focus({ preventScroll: true }); }
    }
    sprites = null; leaves = []; order = []; draw = []; pile = null;
  }
  /** Skip link, reduced motion, or anything going wrong: fade the overlay, short reveal. */
  function enterQuietly() {
    if (state === "done" || siteStarted) return;
    remember();
    state = "done";
    siteStarted = true;
    holding = false;
    cancelAnimationFrame(raf);
    root.classList.add("fade");
    html.classList.add("build");
    const fonts = SITE.fontsReady();
    fonts.then(() => {
      SITE.reveal("skip");
      setTimeout(() => {
        html.classList.remove("build", "gate-on");
        root.remove();
        pile = null;
        SITE.freeSprites(spriteKey);
        const m = document.getElementById("main");
        if (m) { m.setAttribute("tabindex", "-1"); m.focus({ preventScroll: true }); }
      }, SITE.reduced() ? 170 : 320);
    });
  }
  function remember() { try { sessionStorage.setItem("gate-passed", "1"); } catch (e) {} }

  /* ---------- drawing ---------- */
  /** One image source for everything; transforms and alpha only change when needed. */
  function drawInto(c, list) {
    const img = sprites.img, T = sprites.tile, cw = c.canvas.width + 200, ch = c.canvas.height + 200 + pileYFor(c);
    const shadowUntil = tier === 2 && c === ctx ? 0.3 : 0.7; // on a weak device a rising leaf's shadow goes a little sooner
    let alpha = 1;
    c.globalAlpha = 1;
    for (let i = 0; i < list.length; i++) {
      const l = list[i], al = l.alpha;
      if (al <= 0.004) continue;
      const x = l.x * dpr, y = l.y * dpr, s = l.size * dpr;
      if (x < -200 || y < -200 || x > cw || y > ch) continue; // flown off screen
      const cos = Math.cos(l.rot) * s, sin = Math.sin(l.rot) * s;
      // lying flat: rotate in the plane, then squash along the screen's vertical
      const b = sin * l.sq, d = cos * l.sq, offset = c === ctx ? 0 : pileY;
      if (l.air < shadowUntil) { // flat offset copy under each leaf, fading as it lifts
        const sa = (1 - l.air / shadowUntil) * al;
        if (sa !== alpha) c.globalAlpha = alpha = sa;
        c.setTransform(cos, b, -sin, d, x + s * 0.07, y + s * 0.11 - offset);
        c.drawImage(img, l.shade.x, l.shade.y, T, T, -0.5, -0.5, 1, 1);
      }
      if (al !== alpha) c.globalAlpha = alpha = al;
      c.setTransform(cos, b, -sin, d, x, y - offset);
      c.drawImage(img, l.tile.x, l.tile.y, T, T, -0.5, -0.5, 1, 1);
    }
    c.globalAlpha = 1;
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
  const pileYFor = (c) => (c === ctx ? 0 : pileY);
  function drawLeaves() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pile && baseAlpha !== shownBase) { shownBase = baseAlpha; pile.style.opacity = baseAlpha; }
    drawInto(ctx, draw);
  }
  let lastPct = -1, lastFill = -1, shownBase = 1;
  /* The leaf charges from the stem up: the bone rect's top edge goes from y 99 to y 3 in leaf units. */
  let announced = 0;
  function setRing(p) {
    const f = Math.round((3 + 96 * (1 - p)) * 50) / 50, pct = Math.round(p * 100);
    if (f !== lastFill) { lastFill = f; fill.style.transform = "translateY(" + f + "px)"; }
    if (pct !== lastPct) { lastPct = pct; pctEl.textContent = pct + "%"; }
    const q = Math.floor(p * 4 + 0.02); // read out at 25, 50, 75 and 100 on the way up
    if (q > announced && holding) live.textContent = q * 25 + "%";
    announced = q > announced && !holding ? announced : q;
  }
  /** Critically damped follow of the target, frame-rate independent. */
  function follow(target, dt) {
    const omega = 2 / SMOOTH, x = omega * dt, k = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = shown - target, temp = (vel + omega * change) * dt;
    vel = (vel - omega * temp) * k;
    shown = target + (change + temp) * k;
    if (Math.abs(shown) < 0.0005 && target === 0) { shown = 0; vel = 0; }
  }

  function frame(now) {
    raf = 0;
    if (state === "done" || state === "boot") return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000 || 0.016));
    last = now;
    const t = now / 1000;
    let more = true;
    try {
      if (state === "live") { more = stepLive(t, dt); if (holding) watchFrames(dt, now); }
      else if (state === "formed") {
        const tm = timing(), wind = 1500 * clamp(W / 1440, 0.55, 1.3);
        for (const l of leaves) if (!l.stays) stepLeaf(l, 2, t, dt, wind, step * 0.2);
        if ((now - stateStart) / 1000 >= FORMED_HOLD) startScatter(now);
        void tm;
      } else stepScatter((now - stateStart) / 1000, t, dt);
      if (state === "done") return;
      drawLeaves();
    } catch (err) { return enterQuietly(); }
    if (more) wake(); // at progress 0 with everything resting the loop sleeps until the next press
  }
  function wake() {
    if (raf || state === "done" || state === "boot") return;
    if (!last || performance.now() - last > 100) last = performance.now(); // waking from sleep: no time jump
    raf = requestAnimationFrame(frame);
  }

  /* ---------- input ---------- */
  function press() {
    if (state !== "live") return;
    if (SITE.reduced()) return enterQuietly();
    holding = true;
    btn.classList.add("down");
    wake();
  }
  function release() {
    if (!holding) return;
    holding = false;
    btn.classList.remove("down");
    wake();
  }

  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    btn.focus({ preventScroll: true });
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
    press();
  });
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
  btn.addEventListener("keydown", (e) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (!e.repeat) press();
  });
  btn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(); } });
  btn.addEventListener("blur", release);
  // A screen reader or switch "click" has no duration: treat it as entering.
  btn.addEventListener("click", (e) => { if (e.detail === 0 && !holding && state === "live" && progress === 0) enterQuietly(); });
  root.querySelector("[data-gate-skip]").addEventListener("click", (e) => { e.preventDefault(); enterQuietly(); });
  // back/forward cache can restore this page mid-hold, with the pointerup lost
  addEventListener("pageshow", (e) => { if (e.persisted) release(); });

  const rebuildable = () => state === "live";
  let lastW = 0, lastH = 0, timer = 0;
  addEventListener("resize", () => {
    if (!rebuildable()) return;
    // ignore a phone's address bar sliding in and out
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!rebuildable()) return;
      lastW = innerWidth; lastH = innerHeight;
      holding = false;
      btn.classList.remove("down");
      try { build(); } catch (err) { enterQuietly(); }
    }, 140);
  });
  const rebuildNow = () => {
    if (!rebuildable()) return;
    holding = false;
    btn.classList.remove("down");
    try { build(); } catch (err) { enterQuietly(); }
  };
  SITE.onLang(rebuildNow);
  SITE.onMode(rebuildNow);

  /* ---------- the leaf button's own motion (FULL only; the canvas loop never touches it) ---------- */
  const leafEl = root.querySelector("[data-hold-leaf]"), svgEl = root.querySelector(".hold__svg");
  const fine = matchMedia("(hover:hover) and (pointer:fine)");
  const LEAF = { k: 160, c: 18, lift: 10, sway: 8, bobY: 3, bobR: 2, tilt: 10, tremble: 3, scale: 0.06 }; // spring settles in about 400 ms
  let leafRaf = 0, leafLast = 0, hover = 0, hoverV = 0, pressV = 0, pressed = 0, tiltX = 0, tiltY = 0, tiltXV = 0, tiltYV = 0, aimX = 0, aimY = 0, over = false;
  const leafWanted = () => SITE.mode === "full" && !SITE.reduced() && !document.hidden && (state === "boot" || state === "live" || state === "formed");
  function leafFrame(t) {
    leafRaf = 0;
    if (!leafWanted()) { leafEl.style.transform = ""; return; }
    const dt = Math.min(0.05, Math.max(0.001, (t - leafLast) / 1000 || 0.016)), s = t / 1000;
    leafLast = t;
    const n = Math.ceil(dt * 240), h = dt / n;
    for (let i = 0; i < n; i++) {
      hoverV += (LEAF.k * ((over ? 1 : 0) - hover) - LEAF.c * hoverV) * h; hover += hoverV * h;
      pressV += (LEAF.k * ((holding ? 1 : 0) - pressed) - LEAF.c * pressV) * h; pressed += pressV * h;
      tiltXV += (LEAF.k * (aimX - tiltX) - LEAF.c * tiltXV) * h; tiltX += tiltXV * h;
      tiltYV += (LEAF.k * (aimY - tiltY) - LEAF.c * tiltYV) * h; tiltY += tiltYV * h;
    }
    const bob = (Math.PI * 2 * s) / 3.2, sway = (Math.PI * 2 * s) / 1.6, amp = LEAF.tremble * shown * Math.max(0, pressed);
    const x = Math.sin(s * 47) * amp, y = Math.sin(bob) * LEAF.bobY - LEAF.lift * hover + Math.sin(s * 61) * amp;
    const r = Math.sin(bob + 0.6) * LEAF.bobR + Math.sin(sway) * LEAF.sway * hover;
    leafEl.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) perspective(600px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${(1 + LEAF.scale * pressed).toFixed(4)})`;
    leafRaf = requestAnimationFrame(leafFrame);
  }
  function leafWake() { if (!leafRaf && leafWanted()) { leafLast = performance.now(); leafRaf = requestAnimationFrame(leafFrame); } }
  btn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && fine.matches) over = true; });
  btn.addEventListener("pointerleave", () => { over = false; aimX = aimY = 0; });
  btn.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !fine.matches) return;
    const b = btn.getBoundingClientRect(), u = clamp((e.clientX - b.left) / b.width * 2 - 1, -1, 1), v = clamp((e.clientY - b.top) / b.height * 2 - 1, -1, 1);
    aimY = u * LEAF.tilt; aimX = -v * LEAF.tilt;
  });
  document.addEventListener("visibilitychange", leafWake);
  SITE.onMode(leafWake);
  addEventListener("keydown", () => btn.removeAttribute("data-auto"), { once: true });
  leafWake();

  if (window.__GATE_QA === true) window.__GATE_QA = () => ({ leaves, progress, raf, state, tier, dpr, drawn: draw.length }); // tools/qa-gate.mjs only

  /* ---------- start ---------- */
  btn.classList.toggle("quiet", SITE.reduced());
  if (SITE.reduced()) {
    const word = root.querySelector("[data-hold-word] [data-i18n]");
    if (word) { word.dataset.i18n = "gate.enter"; word.textContent = window.I18N["gate.enter"][SITE.lang]; }
  }
  SITE.fontsReady().then(() => {
    if (state !== "boot") return;
    lastW = innerWidth; lastH = innerHeight;
    try { build(); } catch (err) { return enterQuietly(); }
    btn.focus({ preventScroll: true });
    // the font missed the 1.5 s wait: resample once it lands, if nothing has moved yet
    if (document.fonts) document.fonts.ready.then(() => { if (state === "live" && progress === 0 && !holding) rebuildNow(); });
  });
})();
