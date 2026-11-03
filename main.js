/* Shared runtime. Plain JS, classic script so the site also opens from disk.
   Sections: season config · modes · i18n · split-flap · lamp · menu · reveals · count-up ·
             marquee/badge · magnetic/parallax · portrait · background leaves · copy · secret + hint · reveal */
(function () {
  "use strict";

  /* ================= SEASON CONFIG =================
     Everything season-specific lives here (plus the CSS custom properties it sets).
     A winter entry would add snowflake shapes, an ice-blue accent and its own gate texts. */
  const CURRENT_SEASON = "autumn";

  /** Serrated blade around a vertical midrib from (50,6) to (50,80). width(t) is half-width at t in 0..1. */
  function serratedLeaf(width, teeth, depth, leftScale = 1) {
    const side = (dir, k) => {
      const pts = [];
      for (let i = 1; i < teeth * 2; i++) {
        const t = i / (teeth * 2), w = width(t) * k + (i % 2 ? depth : 0);
        pts.push(`${(50 + dir * w).toFixed(1)} ${(6 + 74 * t).toFixed(1)}`);
      }
      return pts;
    };
    return `M50 6L${side(1, 1).join("L")}L50 80L${side(-1, leftScale).reverse().join("L")}Z`;
  }
  /** Midrib plus side veins that rise toward the blade edge. */
  function featherVeins(width, pairs) {
    let d = "M50 80V9";
    for (let i = 1; i <= pairs; i++) {
      const t = 0.2 + (0.62 * i) / pairs, y = 6 + 74 * t, e = width(t - 0.13) * 0.86, top = 6 + 74 * (t - 0.13);
      d += `M50 ${y.toFixed(1)}Q${(50 + e * 0.5).toFixed(1)} ${(y - 5).toFixed(1)} ${(50 + e).toFixed(1)} ${top.toFixed(1)}`;
      d += `M50 ${y.toFixed(1)}Q${(50 - e * 0.5).toFixed(1)} ${(y - 5).toFixed(1)} ${(50 - e).toFixed(1)} ${top.toFixed(1)}`;
    }
    return d;
  }
  const mirrored = (right) => {
    const left = right.slice(1, -1).reverse().map(([x, y]) => [100 - x, y]);
    return "M" + right.concat(left).map(([x, y]) => `${x} ${y}`).join("L") + "Z";
  };
  const STEM = "M50 78Q49.4 90 47 98";
  const widthOf = {
    birch: (t) => 31 * Math.sin(Math.PI * Math.pow(t, 0.72)),
    elm: (t) => 27 * Math.sin(Math.PI * Math.pow(t, 0.82)),
    aspen: (t) => 38 * Math.sin(Math.PI * Math.pow(t, 0.62)),
    beech: (t) => 24 * Math.sin(Math.PI * Math.pow(t, 0.92)),
  };
  const SEASONS = {
    autumn: {
      css: { "--season-accent": "#D98E04" },
      // role "word" leaves can fly into the letters; "back" leaves stay in the pile's back layer
      palette: [
        { name: "tomato", fill: "#E4432D", role: "word", weight: 30 },
        { name: "mustard", fill: "#D98E04", role: "word", weight: 20 },
        { name: "golden", fill: "#F0C96B", role: "word", weight: 28 },
        { name: "orange", fill: "#E08A1E", role: "word", weight: 22 },
        { name: "deep red", fill: "#A32A1C", role: "back", weight: 40 },
        { name: "rust", fill: "#B5441F", role: "back", weight: 40 },
        { name: "brown", fill: "#5A3A22", role: "back", weight: 20 },
      ],
      // lightness shifts per leaf, in percent; the first is the back layer's darker tone
      tints: [-16, -8, 0, 8],
      // Original shapes in a 100x100 box, stem down.
      shapes: {
        maple: {
          d: mirrored([[50, 4], [54, 17], [60, 13], [57, 28], [65, 24], [62, 37], [72, 30], [75, 39], [92, 30], [86, 44], [95, 46], [84, 57], [88, 64], [70, 64], [72, 74], [55, 69], [50, 82]]),
          veins: "M50 80V10M50 66 84 36M50 66 16 36M50 72 74 68M50 72 26 68M50 50 62 28M50 50 38 28M66 52 80 57M34 52 20 57",
        },
        oak: {
          d: "M50 5C58 5 62 12 60 20 68 16 76 22 72 31 68 36 63 37 61 38 70 36 82 40 78 51 75 58 66 57 61 57 69 58 77 63 73 72 69 79 60 76 55 74 56 77 54 80 50 82 46 80 44 77 45 74 40 76 31 79 27 72 23 63 31 58 39 57 34 57 25 58 22 51 18 40 30 36 39 38 37 37 32 36 28 31 24 22 32 16 40 20 38 12 42 5 50 5Z",
          veins: "M50 80V10M50 68 66 66M50 68 34 66M50 48 72 46M50 48 28 46M50 30 64 25M50 30 36 25",
        },
        birch: { d: serratedLeaf(widthOf.birch, 13, 2.4), veins: featherVeins(widthOf.birch, 4) },
        ginkgo: {
          d: "M50 66C42 58 18 50 5 34 8 28 11 24 15 20 18 21 20 18 24 14 27 15 30 12 34 10 37 11 40 9 44 10 46 16 48 24 50 32 52 24 54 16 56 10 60 9 63 11 66 10 70 12 73 15 76 14 80 18 82 21 85 20 89 24 92 28 95 34 82 50 58 58 50 66Z",
          veins: "M50 66 12 30M50 66 22 22M50 66 33 16M50 66 43 15M50 66V36M50 66 57 15M50 66 67 16M50 66 78 22M50 66 88 30",
        },
        elm: { d: serratedLeaf(widthOf.elm, 16, 2.8, 0.84), veins: featherVeins(widthOf.elm, 4) },
        aspen: { d: serratedLeaf(widthOf.aspen, 9, 2), veins: featherVeins(widthOf.aspen, 3) },
        beech: { d: serratedLeaf(widthOf.beech, 8, 1.4), veins: featherVeins(widthOf.beech, 4) },
      },
      gate: {
        ru: { name: "АКБАР", word: "ПОРТФОЛИО", split: ["ПОРТ", "ФОЛИО"], hint: "Удерживай: листья сложат слово. Отпустишь, всё упадёт.", hintReduced: "Нажми, чтобы войти на сайт." },
        en: { name: "AKBAR", word: "PORTFOLIO", split: ["PORT", "FOLIO"], hint: "Hold: leaves build the word. Let go and they fall.", hintReduced: "Press to enter the site." },
      },
      background: { type: "leaves", count: 12, opacity: 0.14, minSize: 26, maxSize: 54, speed: 16 },
      acidPalette: [
        { name: "lime", fill: "#B6FF00", role: "word", weight: 50 },
        { name: "deep lime", fill: "#6E9E00", role: "word", weight: 30 },
        { name: "dark green", fill: "#3D5A00", role: "word", weight: 20 },
      ],
    },
  };
  const season = SEASONS[CURRENT_SEASON];
  const html = document.documentElement;
  Object.entries(season.css).forEach(([k, v]) => html.style.setProperty(k, v));

  const acidHandlers = [];
  /* ================= MODES ================= */
  const fullQuery = matchMedia("(hover:hover) and (pointer:fine) and (min-width:1024px)");
  const reducedQuery = matchMedia("(prefers-reduced-motion:reduce)");
  const modeOf = () => (fullQuery.matches && !reducedQuery.matches ? "full" : "lite");
  const modeHandlers = [];
  let mode = modeOf();
  html.dataset.perf = mode;
  function syncMode() {
    const next = modeOf();
    if (next === mode) return;
    mode = next;
    html.dataset.perf = mode;
    modeHandlers.forEach((fn) => fn(mode));
  }
  fullQuery.addEventListener("change", syncMode);
  reducedQuery.addEventListener("change", syncMode);

  /* ================= SPRITES (shared with the gate) ================= */
  function shade(hex, percent, hueShift = 0) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, c = max - min;
    let h = 0;
    if (c) h = max === r ? ((g - b) / c) % 6 : max === g ? (b - r) / c + 2 : (r - g) / c + 4;
    const sat = c ? c / (1 - Math.abs(2 * l - 1)) : 0;
    return `hsl(${(h * 60 + hueShift + 360) % 360} ${(sat * 100).toFixed(1)}% ${(l * 100 + percent).toFixed(1)}%)`;
  }
  const spriteCache = {};
  /** What the hardware says before anything runs: weak machines start with less hidden work. */
  const weakDevice = () => (navigator.deviceMemory || 8) <= 2 || (navigator.hardwareConcurrency || 8) <= 2;
  /** One atlas per size: every leaf draws from the same image, and a tile is painted only when first asked for.
      leaf() and shadow() return the tile's top-left corner; draw with drawImage(img, x, y, tile, tile, ...). */
  function buildSprites(logical, palette) {
    const cacheKey = logical + (palette ? "a" : "");
    if (spriteCache[cacheKey]) return spriteCache[cacheKey];
    const px = logical * 2, pad = 2, cell = px + pad * 2, k = px / 100;
    const pal = palette || season.palette, tints = season.tints, shapes = Object.values(season.shapes);
    const perShape = pal.length * tints.length + 1, total = shapes.length * perShape, cols = Math.ceil(Math.sqrt(total));
    const img = document.createElement("canvas");
    img.width = cols * cell;
    img.height = Math.ceil(total / cols) * cell;
    const x = img.getContext("2d");
    const stem = new Path2D(STEM), parts = shapes.map((sh) => ({ body: new Path2D(sh.d), veins: new Path2D(sh.veins) }));
    const painted = new Uint8Array(total), corners = new Float32Array(total * 2);
    const place = (i) => { const c = i % cols, r = (i - c) / cols; corners[i * 2] = c * cell + pad; corners[i * 2 + 1] = r * cell + pad; };
    for (let i = 0; i < total; i++) place(i);
    function paint(i, shape, ci, ti) {
      if (painted[i]) return;
      painted[i] = 1;
      const { body, veins } = parts[shape];
      x.save();
      x.translate(corners[i * 2], corners[i * 2 + 1]);
      x.beginPath(); x.rect(0, 0, px, px); x.clip();
      x.scale(k, k);
      if (ci < 0) {
        x.fillStyle = x.strokeStyle = "rgba(10,8,6,.62)";
        x.fill(body);
        x.lineWidth = 2.4;
        x.stroke(stem);
      } else {
        const c = pal[ci], t = tints[ti], hue = (ti - 1.5) * 3 * (ci % 2 ? 1 : -1);
        x.lineCap = "round";
        x.strokeStyle = shade(c.fill, t - 22, hue);
        x.lineWidth = 2.6;
        x.stroke(stem);
        x.fillStyle = shade(c.fill, t, hue);
        x.fill(body);
        x.clip(body);
        x.fillStyle = shade(c.fill, t - 8, hue); // two-tone split along the midrib
        x.fillRect(50, 0, 50, 100);
        x.strokeStyle = shade(c.fill, t - 24, hue);
        x.lineWidth = 1.5;
        x.stroke(veins);
      }
      x.restore();
    }
    const tile = (i) => ({ x: corners[i * 2], y: corners[i * 2 + 1] });
    return (spriteCache[cacheKey] = {
      img, tile: px, shapes: shapes.length,
      leaf(shape, color, tint) { const i = shape * perShape + color * tints.length + tint; paint(i, shape, color, tint); return tile(i); },
      shadow(shape) { const i = shape * perShape + perShape - 1; paint(i, shape, -1, 0); return tile(i); },
    });
  }
  /** The gate's atlas is large and has no use once the gate is gone. */
  const freeSprites = (logical) => { delete spriteCache[String(logical)]; };
  /** Index of a palette colour with the given role, by weight. */
  function pickColor(role = "word", palette) {
    const list = (palette || season.palette).map((c, i) => ({ c, i })).filter((e) => e.c.role === role);
    let r = Math.random() * list.reduce((a, e) => a + e.c.weight, 0);
    for (const e of list) {
      r -= e.c.weight;
      if (r <= 0) return e.i;
    }
    return list[0].i;
  }

  /* ================= I18N ================= */
  const dict = window.I18N || {};
  const langHandlers = [];
  let lang = "ru";
  try { lang = localStorage.getItem("akbar-lang") === "en" ? "en" : "ru"; } catch (e) {}
  const tr = (k) => (dict[k] ? dict[k][lang] : "");

  function wrapWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) =>
      `<span class="w"><span class="w__in" style="--i:${i}">${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span></span>`).join(" ");
  }
  function applyLang() {
    html.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = tr(el.dataset.i18n);
      if (v && el.textContent !== v) el.textContent = v;
      if (el.hasAttribute("data-words")) wrapWords(el);
    });
    document.querySelectorAll("[data-i18n-rich]").forEach((el) => {
      const v = tr(el.dataset.i18nRich).replace(/&/g, "&amp;").replace(/</g, "&lt;");
      el.innerHTML = v.replace(/\[\[(.+?)\]\]/g, "<em>$1</em>");
    });
    for (const attr of ["aria-label", "alt"]) {
      document.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => {
        const v = tr(el.getAttribute(`data-i18n-${attr}`));
        if (v) el.setAttribute(attr, v);
      });
    }
    document.title = html.getAttribute(`data-title-${lang}`) || document.title;
    syncThemeBtn();
    html.classList.remove("lang-pending");
  }
  function setLang(next) {
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem("akbar-lang", lang); } catch (e) {}
    applyLang();
    const live = document.querySelector("[data-lang-live]");
    if (live) live.textContent = lang === "en" ? "English" : "Русский";
    langHandlers.forEach((fn) => fn(lang));
  }

  /* ================= SPLIT-FLAP LANGUAGE SWITCH =================
     The page text swaps at once; the flip only follows. Any click mid-flip cancels, snaps the cells
     to the previous target and starts again from there, so a wrong letter can never stay. */
  const FLAP_MS = 62, FLAP_STAGGER = 70, FLAP_ROLL = "ABKMNOPSTXZ";
  function initFlap(btn) {
    const cells = [...btn.querySelectorAll(".flap__cell")].map((root) => {
      const [top, bot, leafTop, leafBot] = root.children;
      return { root, top: top.firstChild, bot: bot.firstChild, leafTop, leafBot, leafTopB: leafTop.firstChild, leafBotB: leafBot.firstChild };
    });
    const word = () => (lang === "en" ? "EN" : "RU");
    let run = 0, anims = [], shownWord = word();
    const setCell = (c, ch) => { c.top.textContent = c.bot.textContent = c.leafTopB.textContent = c.leafBotB.textContent = ch; };
    const snap = (w) => { run++; anims.forEach((a) => a.cancel()); anims = []; cells.forEach((c, i) => setCell(c, w[i])); shownWord = w; };
    function label() {
      btn.setAttribute("aria-label", lang === "en" ? "Переключить язык на русский" : "Switch language to English");
      btn.lang = lang === "en" ? "ru" : "en";
    }
    function flipCell(c, path, i, delay, my) {
      if (my !== run) return;
      const from = path[i], to = path[i + 1];
      if (to === undefined) return setCell(c, from);
      c.top.textContent = to; c.bot.textContent = from;
      c.leafTopB.textContent = from; c.leafBotB.textContent = to;
      const half = FLAP_MS / 2;
      const a = c.leafTop.animate({ transform: ["rotateX(0deg)", "rotateX(-90deg)"] }, { duration: half, delay, easing: "ease-in", fill: "both" });
      const b = c.leafBot.animate({ transform: ["rotateX(90deg)", "rotateX(0deg)"] }, { duration: half, delay: delay + half, easing: "ease-out", fill: "both" });
      anims.push(a, b);
      b.onfinish = () => {
        if (my !== run) return;
        c.bot.textContent = to;
        a.cancel(); b.cancel();
        flipCell(c, path, i + 1, 0, my);
      };
    }
    function flip() {
      const target = word();
      label();
      snap(shownWord);
      if (reducedQuery.matches) {
        snap(target);
        cells.forEach((c) => c.root.animate({ opacity: [0.2, 1] }, { duration: 100 }));
        return;
      }
      if (!btn.offsetParent) return snap(target);
      const from = shownWord, steps = mode === "full" ? 4 : 2, my = run;
      shownWord = target;
      cells.forEach((c, i) => {
        const path = [from[i]];
        for (let k = 0; k < steps; k++) {
          let ch;
          do ch = FLAP_ROLL[Math.floor(Math.random() * FLAP_ROLL.length)]; while (ch === path[path.length - 1] || ch === target[i]);
          path.push(ch);
        }
        path.push(target[i]);
        flipCell(c, path, 0, i * FLAP_STAGGER, my);
      });
    }
    btn.addEventListener("click", () => setLang(lang === "en" ? "ru" : "en"));
    langHandlers.push(flip);
    snap(shownWord);
    label();
  }

  /* ================= THEME ================= */
  const themeHandlers = [];
  let theme = html.dataset.theme === "dark" ? "dark" : "light";
  let vtRunning = 0;
  function revealFrom(x, y, duration, change) {
    if (!document.startViewTransition || reducedQuery.matches) {
      const quick = reducedQuery.matches;
      html.classList.add(quick ? "theme-fade--quick" : "theme-fade");
      setTimeout(() => html.classList.remove("theme-fade", "theme-fade--quick"), quick ? 170 : 380);
      return change();
    }
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    html.classList.add("vt-reveal");
    vtRunning++;
    const vt = document.startViewTransition(change);
    vt.ready.then(() => {
      html.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] }, { duration, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
    // a quick second pull skips the first transition; only the last one may drop the class
    vt.finished.catch(() => {}).then(() => { if (--vtRunning === 0) html.classList.remove("vt-reveal"); });
  }
  function setThemeColor() {
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = theme === "dark" ? "#121212" : "#1A1A1A";
  }
  function setTheme(next, x, y) {
    if (next === theme) return;
    theme = next;
    try { localStorage.setItem("akbar-theme", theme); } catch (e) {}
    themeHandlers.forEach((fn) => fn(theme));
    syncThemeBtn();
    revealFrom(x, y, 500, () => { html.dataset.theme = theme; setThemeColor(); });
  }
  function syncThemeBtn() {
    document.querySelectorAll("[data-theme-btn]").forEach((b) => {
      b.setAttribute("aria-checked", String(theme === "dark"));
      const name = tr(theme === "dark" ? "theme.toLight" : "theme.toDark");
      if (name) b.setAttribute("aria-label", name);
    });
  }

  /* ================= LAMP CORD THEME TOGGLE =================
     FULL: a 6-segment verlet rope, stepped at a fixed 120 Hz, asleep when still.
     LITE: a straight cord and a CSS spring on the handle. Reduced motion: 8 px there and back. */
  const LAMP = { segments: 6, gravity: 22000, damp: 0.89, yank: 24, dragToggle: 16, dragMax: 48, kick: 520, stretchK: 900, stretchC: 34, reducedPull: 8 };
  function initLamp(root) {
    const svg = root.querySelector(".lamp__svg"), cord = root.querySelector(".lamp__cord"), bead = root.querySelector(".lamp__bead");
    const shade = root.querySelector(".lamp__shade"), glow = root.querySelector(".lamp__glow"), hit = root.querySelector(".lamp__hit");
    let ax = 0, ay = 0, L = 60, pts = [], raf = 0, last = 0, acc = 0, stretch = 1, stretchV = 0, stretchTo = 1;
    let down = false, dragging = false, sx = 0, sy = 0, tipX = 0, tipY = 0, side = 1, pointerType = "";
    const sim = () => mode === "full" && !reducedQuery.matches;

    function measure() {
      const cs = getComputedStyle(root);
      L = parseFloat(cs.getPropertyValue("--cord")) || 60;
      ay = parseFloat(cs.getPropertyValue("--shade")) || 14;
      ax = root.clientWidth / 2;
      svg.setAttribute("viewBox", `0 0 ${root.clientWidth} ${root.clientHeight}`);
      const w = ay * 1.25;
      shade.setAttribute("d", `M${ax - w} 0H${ax + w}A${w} ${ay} 0 0 1 ${ax - w} 0Z`.replace("H", "H"));
      glow.setAttribute("d", `M${ax - w * 0.8} ${ay * 0.6}L${ax - w * 1.6} ${ay * 2.6}H${ax + w * 1.6}L${ax + w * 0.8} ${ay * 0.6}Z`);
      bead.setAttribute("r", String(parseFloat(cs.getPropertyValue("--bead")) || 7));
      root.style.setProperty("--pull-s", "1");
      pts = [];
      for (let i = 0; i <= LAMP.segments; i++) { const y = ay + (L * i) / LAMP.segments; pts.push({ x: ax, y, px: ax, py: y }); }
      draw();
    }
    function draw() {
      if (!sim()) {
        cord.setAttribute("d", `M${ax} ${ay}V${ay + L}`);
        bead.setAttribute("cx", String(ax)); bead.setAttribute("cy", String(ay + L));
        return;
      }
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
        d += `Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      const e = pts[pts.length - 1];
      d += `L${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
      cord.setAttribute("d", d);
      bead.setAttribute("cx", e.x.toFixed(1)); bead.setAttribute("cy", e.y.toFixed(1));
    }
    function stepRope(h) {
      const n = pts.length - 1, g = LAMP.gravity * h * h, seg = (L * stretch) / LAMP.segments;
      for (let i = 1; i <= n; i++) {
        if (i === n && dragging) continue;
        const p = pts[i], vx = (p.x - p.px) * LAMP.damp, vy = (p.y - p.py) * LAMP.damp;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + g;
      }
      if (dragging) { pts[n].x = pts[n].px = tipX; pts[n].y = pts[n].py = tipY; }
      for (let it = 0; it < 8; it++) {
        for (let i = 0; i < n; i++) {
          const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 1;
          const diff = (dist - seg) / dist, mA = i === 0 ? 0 : 0.5, mB = i + 1 === n && dragging ? 0 : i === 0 ? 1 : 0.5;
          a.x += dx * diff * mA; a.y += dy * diff * mA;
          b.x -= dx * diff * mB; b.y -= dy * diff * mB;
        }
      }
      if (!dragging) {
        stretchV += (LAMP.stretchK * (stretchTo - stretch) - LAMP.stretchC * stretchV) * h;
        stretch += stretchV * h;
      }
    }
    function frame(t) {
      raf = 0;
      if (!sim()) return;
      acc += Math.min(0.05, Math.max(0, (t - last) / 1000));
      last = t;
      const h = 1 / 120;
      while (acc >= h) { stepRope(h); acc -= h; }
      draw();
      const calm = !dragging && Math.abs(stretch - stretchTo) < 0.001 && Math.abs(stretchV) < 0.01 &&
        pts.every((p) => Math.abs(p.x - ax) < 0.06 && Math.abs(p.x - p.px) < 0.02 && Math.abs(p.y - p.py) < 0.02);
      if (!calm) raf = requestAnimationFrame(frame);
    }
    function wake() { if (sim() && !raf) { last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); } }
    function kick(amount) {
      side = -side;
      const n = pts.length - 1, v = (amount * side) / 120;
      pts.forEach((p, i) => { p.px = p.x - (v * i) / n; });
      wake();
    }
    /* Non-simulated handle: CSS does the spring. */
    function cssPull(px, fast) {
      root.classList.toggle("is-fast", !!fast);
      root.style.setProperty("--pull", px + "px");
      root.style.setProperty("--pull-s", String((L + px) / L));
    }
    function lampPoint() { const r = bead.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
    function toggle() {
      const [x, y] = lampPoint(), to = theme === "dark" ? "light" : "dark";
      setTheme(to, x, y);
      if (reducedQuery.matches) return;
      if (to === "light") glow.animate({ opacity: [0, 1, 0] }, { duration: 700, easing: "ease-out" });
      else shade.animate({ opacity: [1, 0.45, 1] }, { duration: 700, easing: "ease-out" });
    }
    /* Click, tap or key: down to the bottom of the pull, the theme flips there, then the cord springs back. */
    function pull() {
      if (sim()) {
        stretchTo = (L + LAMP.yank) / L;
        stretchV = 0;
        wake();
        setTimeout(() => { toggle(); stretchTo = 1; kick(LAMP.kick); }, 80);
      } else {
        const px = reducedQuery.matches ? LAMP.reducedPull : LAMP.yank;
        cssPull(px, true);
        setTimeout(() => { toggle(); cssPull(0, false); }, 80);
      }
    }
    hit.addEventListener("pointerdown", (e) => {
      down = true; dragging = false; sx = e.clientX; sy = e.clientY; pointerType = e.pointerType;
      root.classList.add("is-down");
      try { hit.setPointerCapture(e.pointerId); } catch (err) {}
    });
    hit.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!dragging && Math.hypot(dx, dy) < 4) return;
      dragging = true;
      const extra = Math.max(0, Math.min(LAMP.dragMax, dy));
      if (sim()) {
        tipX = ax + Math.max(-28, Math.min(28, dx));
        tipY = ay + L + extra;
        stretch = Math.max(1, Math.hypot(tipX - ax, tipY - ay) / L);
        stretchV = 0;
        wake();
      } else if (!reducedQuery.matches) cssPull(extra, true);
    });
    function up(e, cancelled) {
      if (!down) return;
      down = false;
      root.classList.remove("is-down");
      const wasDrag = dragging, dy = e.clientY - sy;
      dragging = false;
      if (!wasDrag) { if (!cancelled) pull(); return; }
      if (sim()) { stretchTo = 1; kick(LAMP.kick * 0.7); } else cssPull(0, false);
      if (!cancelled && dy > LAMP.dragToggle) toggle();
    }
    hit.addEventListener("pointerup", (e) => up(e, false));
    hit.addEventListener("pointercancel", (e) => up(e, true));
    // pointer presses are handled above; a click with no detail is the keyboard or assistive tech
    hit.addEventListener("click", (e) => { if (e.detail === 0) pull(); });
    const canHover = matchMedia("(hover:hover)");
    hit.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || !canHover.matches || down || reducedQuery.matches) return;
      if (sim()) { stretchTo = (L + 3) / L; kick(150); } else cssPull(3, false);
    });
    hit.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse" || down) return;
      if (sim()) { stretchTo = 1; wake(); } else cssPull(0, false);
    });
    modeHandlers.push(measure);
    let timer = 0;
    addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(measure, 120); });
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  /* ================= MENU ================= */
  function initMenu() {
    const btn = document.querySelector("[data-menu-btn]");
    const close = document.querySelector("[data-menu-close]");
    if (!btn || !close) return;
    const main = document.getElementById("main");
    const setOpen = (open) => {
      html.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (main) main.inert = open;
      (open ? close : btn).focus();
    };
    btn.addEventListener("click", () => setOpen(true));
    close.addEventListener("click", () => setOpen(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && html.classList.contains("nav-open")) setOpen(false); });
    matchMedia("(min-width:1180px)").addEventListener("change", (e) => { if (e.matches && html.classList.contains("nav-open")) setOpen(false); });
  }

  /* ================= REVEALS ================= */
  let revealsStarted = false;
  function initReveals() {
    if (revealsStarted) return;
    revealsStarted = true;
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("in"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    els.forEach((el) => {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--d", `${Math.min(i % 4, 3) * 70}ms`);
      io.observe(el);
    });
  }

  /* ================= COUNT-UP ================= */
  function runCounts() {
    if (mode !== "full") return;
    document.querySelectorAll("[data-count]").forEach((el, n) => {
      const to = +el.dataset.count, t0 = performance.now() + n * 80, dur = 900;
      const tick = (t) => {
        const u = Math.min(1, Math.max(0, (t - t0) / dur));
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - u, 3))));
        if (u < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ================= PAUSE OFF-SCREEN ================= */
  function initPausers() {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("paused", !e.isIntersecting)));
    document.querySelectorAll(".marquee,.badge").forEach((el) => io.observe(el));
  }

  /* ================= MAGNETIC + PARALLAX (FULL only) ================= */
  function initMagnetic() {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        if (mode !== "full") return;
        const r = el.getBoundingClientRect(), max = 6;
        const pull = (d, half) => Math.max(-max, Math.min(max, (d / half) * max));
        el.style.setProperty("--mx", pull(e.clientX - (r.left + r.width / 2), r.width / 2).toFixed(1) + "px");
        el.style.setProperty("--my", pull(e.clientY - (r.top + r.height / 2), r.height / 2).toFixed(1) + "px");
      });
      el.addEventListener("pointerleave", () => { el.style.removeProperty("--mx"); el.style.removeProperty("--my"); });
    });
  }
  function initParallax() {
    const els = [...document.querySelectorAll("[data-parallax]")];
    if (!els.length) return;
    let queued = false;
    const draw = () => {
      queued = false;
      const y = scrollY;
      els.forEach((el) => { el.style.translate = mode === "full" ? `0 ${y * el.dataset.parallax}px` : ""; });
    };
    addEventListener("scroll", () => { if (mode === "full" && !queued) { queued = true; requestAnimationFrame(draw); } }, { passive: true });
    modeHandlers.push(draw);
  }

  /* ================= DOT PORTRAIT ================= */
  const portrait = (function () {
    const fig = document.getElementById("portrait");
    if (!fig || !window.PORTRAIT) return { start() {}, useSkull() {} };
    const canvas = fig.querySelector("canvas"), ctx = canvas.getContext("2d");
    const data = window.PORTRAIT;
    // Variant a: ink + bone dots on a tomato blob. Variant b: ink dots on a bone blob.
    const variant = fig.dataset.variant || "b";
    fig.dataset.variant = variant;
    if (fig.parentElement) fig.parentElement.dataset.variant = variant;
    const dotColor = () => getComputedStyle(fig).getPropertyValue("--dot").trim() || "#1A1A1A";
    let COLORS = [dotColor()];
    const refreshColors = () => { COLORS = variant === "a" ? ["#1A1A1A", "#EDE8DD"] : [dotColor()]; };
    let alt = null, morphEnd = 0;
    let W = 0, H = 0, dpr = 1, dots = [], raf = 0, visible = true, started = false;
    let mx = -9999, my = -9999, assembleUntil = 0;

    function gridDots() {
      const src = alt || data, set = src[mode === "full" ? "full" : "lite"], p = set.pitch * W, rowH = (p * Math.sqrt(3)) / 2, out = [];
      set.rows.forEach((row, j) => {
        for (let i = 0; i < row.length; i++) {
          if (row[i] === ".") continue;
          const lv = +row[i];
          let r = 0, tone = 0;
          if (variant === "a") {
            if (lv >= 5) r = Math.sqrt((lv - 4) / 5) * p * 0.64;
            else if (lv <= 2) { r = Math.sqrt((3 - lv) / 3) * p * 0.52; tone = 1; }
          } else r = Math.sqrt(lv / 9) * p * 0.66;
          if (!r) continue;
          out.push({ hx: (i + 0.5 + (j % 2 ? 0.5 : 0)) * p, hy: (j + 0.5) * rowH, r, tone });
        }
      });
      return out;
    }
    /** Dots flow to the new positions with the gate's kind of motion: soft spring, staggered start, small overshoot. */
    function morph(animated) {
      refreshColors();
      if (!started || !W) return;
      assembleUntil = 0;
      const next = gridDots();
      if (!animated) {
        dots = next.map((d) => Object.assign(d, { x: d.hx, y: d.hy, vx: 0, vy: 0, sx: 0, sy: 0, d: 0 }));
        return paint();
      }
      const byX = (a, b) => a.x - b.x || a.y - b.y;
      const from = dots.slice().sort(byX), to = next.map((d) => Object.assign(d, { x: d.hx, y: d.hy })).sort(byX);
      const n = Math.max(from.length, to.length), t0 = performance.now(), cx = W / 2, cy = H * 0.45, far = Math.hypot(cx, cy);
      const pair = [];
      let lastA = -1;
      for (let i = 0; i < n; i++) {
        const fromIdx = Math.floor((i * from.length) / n), a = from[fromIdx], b = to[Math.floor((i * to.length) / n)];
        // when one side has fewer dots, the extra dots grow out of a neighbour, so no target stays empty
        const d = fromIdx === lastA ? Object.assign({}, a, { r: 0 }) : a;
        lastA = fromIdx;
        d.tx = b.x; d.ty = b.y; d.fr = d.r; d.tr = b.r; d.tone = b.tone;
        d.start = t0 + (Math.hypot(b.x - cx, b.y - cy) / far) * 320 + Math.random() * 200;
        d.vx = d.vx || 0; d.vy = d.vy || 0;
        pair.push(d);
      }
      dots = pair;
      morphEnd = t0 + 1500;
      wake();
    }
    function layout() {
      const box = fig.getBoundingClientRect();
      W = box.width; H = W * data.ar;
      if (!W) return false;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      dots = gridDots().map((d) => Object.assign(d, { x: d.hx, y: d.hy, vx: 0, vy: 0, sx: 0, sy: 0, d: 0 }));
      return true;
    }
    function paint() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      COLORS.forEach((color, tone) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (const d of dots) {
          if (d.tone !== tone) continue;
          ctx.moveTo(d.x + d.r, d.y);
          ctx.arc(d.x, d.y, d.r, 0, 6.2832);
        }
        ctx.fill();
      });
    }
    function frame(t) {
      raf = 0;
      if (!visible) return;
      let busy = false;
      if (morphEnd) {
        const steps = 1;
        for (const d of dots) {
          if (t >= d.start) {
            d.hx = d.tx; d.hy = d.ty;
            const u = Math.min(1, (t - d.start) / 900);
            d.r = d.fr + (d.tr - d.fr) * (u * u * (3 - 2 * u));
          }
          for (let k = 0; k < steps; k++) {
            d.vx = (d.vx + (d.hx - d.x) * 0.052) * 0.82;
            d.vy = (d.vy + (d.hy - d.y) * 0.052) * 0.82;
            d.x += d.vx;
            d.y += d.vy;
          }
        }
        busy = true;
        if (t >= morphEnd) {
          morphEnd = 0;
          dots = dots.filter((d) => d.tr > 0);
          for (const d of dots) { d.r = d.tr; d.x = d.hx; d.y = d.hy; d.vx = d.vy = 0; }
        }
      } else if (t < assembleUntil) {
        const total = assembleUntil - assembleStart;
        for (const d of dots) {
          const u = Math.min(1, Math.max(0, (t - assembleStart - d.d) / (total - d.d)));
          const e = 1 - Math.pow(1 - u, 3);
          d.x = d.sx + (d.hx - d.sx) * e;
          d.y = d.sy + (d.hy - d.sy) * e;
        }
        busy = true;
      } else if (assembleUntil) {
        for (const d of dots) { d.x = d.hx; d.y = d.hy; }
        assembleUntil = 0;
        busy = true;
      } else if (mode === "full") {
        const R = Math.max(70, W * 0.17), R2 = R * R;
        for (const d of dots) {
          const dx = d.x - mx, dy = d.y - my, q = dx * dx + dy * dy;
          if (q < R2 && q > 0.01) {
            const dist = Math.sqrt(q), f = (1 - dist / R) * 3.2;
            d.vx += (dx / dist) * f;
            d.vy += (dy / dist) * f;
          }
          d.vx = (d.vx + (d.hx - d.x) * 0.075) * 0.8;
          d.vy = (d.vy + (d.hy - d.y) * 0.075) * 0.8;
          d.x += d.vx;
          d.y += d.vy;
          if (Math.abs(d.vx) + Math.abs(d.vy) > 0.03) busy = true;
        }
        if (!busy) for (const d of dots) { d.x = d.hx; d.y = d.hy; d.vx = d.vy = 0; }
      }
      paint();
      if (busy) wake();
    }
    function wake() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    let assembleStart = 0;
    function start(animated) {
      if (started) return; // a second start would rebuild the dots and cut a running assembly
      started = true;
      if (!layout()) return;
      refreshColors();
      fig.classList.add("ready");
      if (animated && !reducedQuery.matches) {
        assembleStart = performance.now();
        const dur = mode === "full" ? 1500 : 800;
        assembleUntil = assembleStart + dur;
        for (const d of dots) {
          const a = Math.random() * 6.2832, r = W * (0.5 + Math.random() * 0.6);
          d.sx = d.hx + Math.cos(a) * r;
          d.sy = d.hy + Math.sin(a) * r;
          d.x = d.sx; d.y = d.sy;
          d.d = Math.random() * dur * 0.45;
        }
        wake();
      } else paint();
    }
    const hero = fig.closest(".panel") || fig;
    addEventListener("pointermove", (e) => {
      if (mode !== "full" || !started || e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      if (morphEnd) return;
      if (mx > -120 && my > -120 && mx < W + 120 && my < H + 120) wake();
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { mx = my = -9999; wake(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(canvas);
    }
    let lastW = 0, timer = 0;
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        const w = fig.getBoundingClientRect().width;
        if (!started || Math.abs(w - lastW) < 1) { lastW = w; return; }
        lastW = w;
        clearTimeout(timer);
        timer = setTimeout(() => { assembleUntil = 0; morphEnd = 0; if (layout()) paint(); }, 120);
      }).observe(fig);
    }
    modeHandlers.push(() => { if (started) { assembleUntil = 0; morphEnd = 0; mx = my = -9999; if (layout()) paint(); } });
    return {
      start,
      useSkull(grid, animated) { alt = grid; if (!started) return; morph(animated); },
    };
  })();

  /* ================= BACKGROUND PARTICLES (FULL only) ================= */
  let backgroundStarted = false;
  function initBackground() {
    if (backgroundStarted) return;
    backgroundStarted = true;
    const canvas = document.querySelector(".bg-leaves");
    if (!canvas) return;
    const cfg = season.background, ctx = canvas.getContext("2d");
    // very faint and slow: 1.5x resolution is enough, and half the frame rate on a weak machine reads the same
    const everyMs = weakDevice() ? 30 : 0;
    let sprites = null, leaves = [], raf = 0, last = 0, visible = true, W = 0, H = 0, dpr = 1, acidOn = html.dataset.mode === "acid";
    const size = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    const seed = (anywhere) => {
      const sp = Math.floor(Math.random() * sprites.shapes), c = pickColor("word", acidOn ? season.acidPalette : null);
      return {
        x: Math.random() * W, y: anywhere ? Math.random() * H : -60,
        s: cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize),
        a: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.6, ph: Math.random() * 6.28,
        v: cfg.speed * (0.7 + Math.random() * 0.7),
        tile: sprites.leaf(sp, c, 2),
      };
    };
    function frame(t) {
      raf = 0;
      if (!visible || mode !== "full") return;
      if (t - last < everyMs) { raf = requestAnimationFrame(frame); return; }
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = cfg.opacity;
      const img = sprites.img, T = sprites.tile;
      for (let i = 0; i < leaves.length; i++) {
        const l = leaves[i];
        l.y += l.v * dt; l.a += l.spin * dt; l.ph += dt * 0.7;
        const x = l.x + Math.sin(l.ph) * 26;
        if (l.y > H + 60) leaves[i] = seed(false);
        const cos = Math.cos(l.a) * dpr, sin = Math.sin(l.a) * dpr;
        ctx.setTransform(cos, sin, -sin, cos, x * dpr, l.y * dpr);
        ctx.drawImage(img, l.tile.x, l.tile.y, T, T, -l.s / 2, -l.s / 2, l.s, l.s);
      }
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      if (mode === "full") {
        if (!sprites) sprites = buildSprites(32, acidOn ? season.acidPalette : null);
        size();
        if (!leaves.length) leaves = Array.from({ length: cfg.count }, () => seed(true));
        if (!raf && visible) raf = requestAnimationFrame(frame);
      } else {
        leaves = [];
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => {
        visible = es[0].isIntersecting;
        if (visible && mode === "full" && !raf) raf = requestAnimationFrame(frame);
      }).observe(canvas);
    }
    addEventListener("resize", () => { if (mode === "full") size(); });
    modeHandlers.push(sync);
    acidHandlers.push((on) => { acidOn = on; sprites = null; leaves = []; sync(); });
    sync();
  }

  /* ================= COPY HANDLE ================= */
  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      const status = document.querySelector("[data-copy-status]");
      btn.addEventListener("click", async () => {
        const text = btn.dataset.copy;
        let ok = false;
        try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.cssText = "position:fixed;opacity:0";
          document.body.append(ta);
          ta.select();
          try { ok = document.execCommand("copy"); } catch (e2) {}
          ta.remove();
        }
        if (status) status.textContent = tr(ok ? "contacts.copied" : "contacts.copyFail");
        btn.classList.toggle("done", ok);
        setTimeout(() => { btn.classList.remove("done"); if (status) status.textContent = ""; }, 2600);
      });
    });
  }

  /* ================= SERVICE FILTER ================= */
  function initFilters() {
    const box = document.querySelector("[data-filters]"), grid = document.querySelector("[data-svc]");
    if (!box || !grid) return;
    const cards = [...grid.children];
    box.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      box.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      let i = 0;
      cards.forEach((c) => {
        const show = btn.dataset.filter === "all" || c.dataset.cat === btn.dataset.filter;
        c.hidden = !show;
        c.classList.add("in");
        if (show && !reducedQuery.matches) {
          c.animate([{ opacity: 0, transform: "translateY(14px) scale(.98)" }, { opacity: 1, transform: "none" }], { duration: 220, delay: i++ * 26, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
        }
      });
    });
  }

  /* ================= SECRET: only the triggers live here, the rest loads on demand ================= */
  let acidLoad = null;
  function loadScript(src) {
    return new Promise((ok, fail) => {
      const el = document.createElement("script");
      el.src = src; el.onload = ok; el.onerror = fail;
      document.head.append(el);
    });
  }
  function loadAcid() {
    return acidLoad || (acidLoad = loadScript("js/acid-gl.js").then(() => loadScript("js/acid.js")).then(() => window.AcidMode));
  }
  /** first sign of the secret: fetch code and fonts now, so they are ready when it fires */
  function acidHint() {
    loadAcid().catch(() => {});
    if (document.fonts) { document.fonts.load('40px "Rubik Wet Paint"', "АБ").catch(() => {}); document.fonts.load('40px "Rubik Wet Paint"', "ab").catch(() => {}); document.fonts.load('16px "JetBrains Mono"', "Аb").catch(() => {}); }
  }
  let acidBusy = false;
  function acidToggle(x, y) {
    if (acidBusy || gateUp()) return;
    acidBusy = true;
    loadAcid().then((a) => a.toggle(x, y)).catch(() => {}).then(() => { acidBusy = false; });
  }
  /* The hint says 3 seconds and the real hold is 2 s. That is deliberate, do not align them. */
  const LEAF_HOLD_MS = 2000, HINT_KEY = "akbar-leaf-hint";
  const gateUp = () => html.classList.contains("gate-on") || html.classList.contains("build");
  let hintAuto = () => {};
  function initSecret() {
    const logo = document.querySelector(".logo"), mark = document.querySelector(".logo__mark"), hint = document.getElementById("leaf-hint");
    if (logo && mark) {
      const leaf = mark.querySelector("svg:not(.logo__ring)"), ring = mark.querySelector(".logo__ring circle");

      /* ---------- hint ---------- */
      let hideTimer = 0, hoverTimer = 0, sticky = false;
      const showHint = (ms) => {
        if (gateUp() || html.dataset.mode === "acid") return;
        clearTimeout(hideTimer);
        hint.classList.add("is-on");
        hint.setAttribute("aria-hidden", "false");
        if (ms) hideTimer = setTimeout(hideHint, ms);
      };
      const hideHint = () => {
        clearTimeout(hideTimer);
        if (sticky) return;
        hint.classList.remove("is-on");
        hint.setAttribute("aria-hidden", "true");
      };
      mark.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") hoverTimer = setTimeout(() => showHint(0), 600);
      });
      mark.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "mouse") { clearTimeout(hoverTimer); hideHint(); }
      });
      mark.addEventListener("focus", () => { if (mark.matches(":focus-visible")) { sticky = true; showHint(0); } });
      mark.addEventListener("blur", () => { sticky = false; hideHint(); });
      /* first visit only, once ever */
      hintAuto = () => {
        let seen = false;
        try { seen = !!localStorage.getItem(HINT_KEY); } catch (e) { return; }
        if (seen) return;
        setTimeout(() => {
          if (html.dataset.mode === "acid") return;
          try { localStorage.setItem(HINT_KEY, "1"); } catch (e) {}
          showHint(4000);
        }, 6000);
      };

      /* ---------- hold: the ring finishing is what fires the secret ---------- */
      let anim = null, raf = 0, t0 = 0, fired = false, holding = false, sx = 0, sy = 0, lastPointer = "";
      const stopTremble = () => { cancelAnimationFrame(raf); raf = 0; leaf.style.transform = ""; };
      const tremble = (t) => {
        const u = Math.min(1, (t - t0) / LEAF_HOLD_MS), a = u * u * 2.6;
        leaf.style.transform = `translate(${(Math.random() - 0.5) * a}px,${(Math.random() - 0.5) * a}px) rotate(${(Math.random() - 0.5) * a * 5}deg)`;
        raf = requestAnimationFrame(tremble);
      };
      function begin(x, y) {
        if (holding) return;
        holding = true; fired = false; sx = x; sy = y; t0 = performance.now();
        acidHint();
        if (anim) anim.cancel();
        mark.classList.add("is-hold");
        if (!reducedQuery.matches) raf = requestAnimationFrame(tremble);
        anim = ring.animate({ strokeDashoffset: [100, 0] }, { duration: LEAF_HOLD_MS, easing: "linear", fill: "forwards" });
        anim.onfinish = () => {
          holding = false; fired = true;
          stopTremble();
          try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}
          acidToggle(sx, sy);
          const done = anim;
          ring.animate({ opacity: [1, 0] }, { duration: 300 }).onfinish = () => { done.cancel(); mark.classList.remove("is-hold"); };
        };
      }
      function cancelHold() {
        if (!holding) return;
        holding = false;
        stopTremble();
        const a = anim; // runs back quickly instead of jumping to empty
        a.onfinish = () => { a.cancel(); mark.classList.remove("is-hold"); };
        a.updatePlaybackRate(-3);
      }
      mark.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        lastPointer = e.pointerType;
        try { mark.setPointerCapture(e.pointerId); } catch (err) {}
        begin(e.clientX, e.clientY);
      });
      mark.addEventListener("pointermove", (e) => { if (holding && Math.hypot(e.clientX - sx, e.clientY - sy) > 14) cancelHold(); });
      for (const ev of ["pointerup", "pointercancel"]) mark.addEventListener(ev, cancelHold);
      addEventListener("scroll", cancelHold, { passive: true });
      mark.addEventListener("contextmenu", (e) => e.preventDefault());
      mark.addEventListener("keydown", (e) => {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (e.repeat) return;
        const r = mark.getBoundingClientRect();
        begin(r.left + r.width / 2, r.top + r.height / 2);
      });
      mark.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); cancelHold(); } });
      mark.addEventListener("blur", cancelHold);
      logo.addEventListener("dragstart", (e) => e.preventDefault());

      /* ---------- five quick presses, on the leaf or the word. The count survives the one navigation
         from an inner page to Home. A gap over 1.2 s starts the count again. ---------- */
      const countTap = () => {
        const now = Date.now();
        let list = [];
        try { list = JSON.parse(sessionStorage.getItem("akbar-taps") || "[]"); } catch (err) {}
        list = list.filter((t) => now - t < 2500);
        if (list.length && now - list[list.length - 1] > 1200) list = [];
        list.push(now);
        try { sessionStorage.setItem("akbar-taps", JSON.stringify(list)); } catch (err) {}
        if (list.length >= 2) acidHint();
        if (list.length >= 5) { try { sessionStorage.removeItem("akbar-taps"); } catch (err) {} }
        return list.length;
      };
      mark.addEventListener("click", (e) => {
        if (fired) { fired = false; return; }
        if (e.detail === 0) return showHint(3000); // assistive tech: no hold possible from here
        if (lastPointer === "touch") showHint(3000);
        if (countTap() >= 5) acidToggle(e.clientX || innerWidth / 2, e.clientY || 60);
      });
      logo.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        const n = countTap();
        if (html.dataset.page === "index") {
          e.preventDefault();
          if (n < 2) scrollTo({ top: 0, behavior: reducedQuery.matches ? "auto" : "smooth" });
        }
        if (n >= 5) {
          e.preventDefault();
          acidToggle(e.clientX || innerWidth / 2, e.clientY || 60);
        }
      });
    }
    // type "acid" anywhere. Key positions, so it also works on a Russian layout.
    const word = ["KeyA", "KeyC", "KeyI", "KeyD"];
    let at = 0, lastKey = 0;
    addEventListener("keydown", (e) => {
      const el = e.target;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))) return;
      const now = Date.now();
      if (now - lastKey > 1500) at = 0;
      lastKey = now;
      at = e.code === word[at] ? at + 1 : e.code === word[0] ? 1 : 0;
      if (at === 2) acidHint();
      if (at === word.length) { at = 0; acidToggle(innerWidth / 2, innerHeight / 3); }
    });
  }

  /* ================= REVEAL ORCHESTRATOR =================
     One timeline. Every animation is created in the same tick with fill: backwards, so an element is
     hidden only by its own pending animation: nothing is ever left hidden by a style, and cancelling or
     finishing the lot always shows the page. "gate" follows the leaf scatter, "skip" is the short version.
     With the gate already passed in this session there is no reveal: the page wipe is the transition. */
  const REVEAL_SAFETY_MS = 4000;
  let revealed = false;
  function fontsReady() {
    if (!document.fonts) return Promise.resolve();
    return Promise.race([
      Promise.all([document.fonts.load(window.SITE.displayFont(100), "АКБАР ПОРТФОЛИО"), document.fonts.load(window.SITE.displayFont(100), "AKBAR PORTFOLIO")]).catch(() => {}),
      new Promise((ok) => setTimeout(ok, 1500)),
    ]);
  }
  function reveal(kind) {
    if (revealed) return;
    revealed = true;
    html.classList.remove("gate-on");
    const after = () => { initReveals(); initBackground(); hintAuto(); };
    if (reducedQuery.matches) { portrait.start(false); after(); return; }
    const OUT = "cubic-bezier(.2,.8,.2,1)", POP = "cubic-bezier(.34,1.56,.64,1)";
    const all = [], cues = [];
    const anim = (sel, keyframes, at, duration, easing = OUT, each = 0) => {
      document.querySelectorAll(sel).forEach((el, i) => all.push(el.animate(keyframes, { delay: at + i * each, duration, easing, fill: "backwards" })));
    };
    const cue = (at, fn) => {
      let ran = false;
      const once = () => { if (!ran) { ran = true; fn(); } };
      const a = html.animate([], { duration: at });
      a.finished.then(once, once);
      all.push(a);
      cues.push(once);
    };
    const rise = (y) => ({ opacity: [0, 1], translate: [`0 ${y}`, "0 0"] });
    const pop = { opacity: [0, 1], scale: [0.72, 1] };
    if (kind === "gate" && mode === "full") {
      anim(".top__notch, .top__lang", { opacity: [0, 1], translate: ["0 -110%", "0 0"] }, 0, 520);
      anim(".panel--hero", { opacity: [0, 1, 1], scale: [0.985, 1, 1], clipPath: ["inset(6% 4% 6% 4% round 3rem)", "inset(0% 0% 0% 0% round 0rem)", "inset(-30% -30% -30% -30% round 0rem)"], offset: [0, 0.97, 1] }, 120, 700);
      anim(".blob", { opacity: [0, 1], scale: [0.82, 1] }, 300, 600);
      anim("#portrait", { opacity: [0, 1] }, 360, 200, "linear");
      cue(360, () => portrait.start(true));
      anim(".giant--hero .w__in", { transform: ["translateY(110%)", "none"] }, 380, 520, OUT, 90);
      anim(".status", rise("1rem"), 480, 420);
      anim(".panel--hero .lead", rise("1rem"), 760, 440);
      anim(".hero__cta", rise("1rem"), 850, 440);
      anim(".stats li", rise("1rem"), 940, 440, OUT, 90);
      cue(940, runCounts);
      anim(".tagpill", pop, 1100, 360, POP, 70);
      anim(".round", pop, 1180, 360, POP, 60);
      anim(".badge", { opacity: [0, 1], scale: [0.72, 1] }, 1240, 360, POP);
      anim(".marquee", { opacity: [0, 1], translate: ["-6% 0", "0 0"] }, 1180, 520);
      anim(".fab", pop, 1500, 360, POP);
      cue(1400, initReveals);
      cue(1700, initBackground);
    } else {
      anim(".top__notch, .top__lang", rise("-1rem"), 0, 300);
      anim(".panel--hero", { opacity: [0, 1] }, 40, 300);
      anim(".giant--hero, .status, .panel--hero .lead", rise(".75rem"), 140, 320, OUT, 50);
      anim(".hero__art", { opacity: [0, 1] }, 200, 320);
      cue(200, () => portrait.start(mode !== "full"));
      anim(".hero__cta, .stats li", rise(".75rem"), 300, 300, OUT, 50);
      anim(".marquee", { opacity: [0, 1] }, 420, 280);
      anim(".fab", pop, 520, 300, POP);
      cue(500, initReveals);
      cue(700, initBackground);
    }
    let settled = false;
    const finishAll = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      all.forEach((a) => { try { a.finish(); } catch (e) {} });
      cues.forEach((c) => c());
      after();
    };
    const safety = setTimeout(finishAll, REVEAL_SAFETY_MS);
    Promise.all(all.map((a) => a.finished)).then(finishAll, finishAll);
  }

  /* ================= BOOT ================= */
  applyLang();
  document.querySelectorAll("[data-flap]").forEach(initFlap);
  document.querySelectorAll("[data-lamp]").forEach(initLamp);
  syncThemeBtn();
  setThemeColor();
  initMenu();
  initPausers();
  initMagnetic();
  initParallax();
  initCopy();
  initFilters();
  initSecret();

  window.SITE = {
    season, buildSprites, freeSprites, pickColor, reveal, fontsReady,
    deviceHint: () => ((navigator.deviceMemory || 8) <= 2 || (navigator.hardwareConcurrency || 8) <= 2 ? 2 : (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4 ? 1 : 0),
    displayFont: (px) => `1000 ${px}px "Roboto Flex", "Arial Black", sans-serif`,
    get mode() { return mode; },
    get lang() { return lang; },
    onMode: (fn) => modeHandlers.push(fn),
    onLang: (fn) => langHandlers.push(fn),
    reduced: () => reducedQuery.matches,
    portrait,
    acidChanged: (on) => acidHandlers.forEach((fn) => fn(on)),
    setTheme,
    get theme() { return theme; },
  };
  if (html.dataset.mode === "acid") {
    const boot = () => loadAcid().then((a) => a.restore()).catch(() => { delete html.dataset.mode; });
    if (html.classList.contains("gate-on")) { delete html.dataset.mode; try { sessionStorage.removeItem("akbar-acid"); } catch (e) {} } else boot();
  }

  /* Gate or no gate, the page has to come up. No gate: everything is simply there. */
  if (html.classList.contains("gate-on")) {
    addEventListener("load", () => { if (!window.__gateReady) reveal("skip"); }); // gate.js failed to load
  } else {
    revealed = true;
    initReveals();
    initBackground();
    addEventListener("DOMContentLoaded", () => { portrait.start(false); hintAuto(); });
  }
})();
