/* Projects page: sticky stacking cards. Native scroll only.
   CSS scroll-driven animations do the covering where supported; this file draws the notched
   silhouettes, decides per card whether it can pin, runs the entrance, and is the fallback. */
(function () {
  "use strict";
  const stack = document.querySelector("[data-stack]");
  if (!stack || !window.SITE) return;
  const SITE = window.SITE;
  const cards = [...stack.querySelectorAll(".stack-card")];
  const canScrollDrive = !!(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()"));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  /* ---------- silhouette: concave notches top-left and top-right, drawn at the real size ---------- */
  function shape(card) {
    const surface = card.querySelector(".stack-card__surface"), n = card.querySelector(".stack-tab--n"), k = card.querySelector(".stack-tab--kind");
    const W = surface.offsetWidth, H = surface.offsetHeight;
    if (!W || !H) return;
    const u = rem(), gap = u * 0.5, R = parseFloat(getComputedStyle(surface).borderBottomRightRadius) || u * 2;
    const nw = n.offsetWidth + gap, nh = n.offsetHeight + gap, tw = k.offsetWidth + gap, th = k.offsetHeight + gap;
    const r1 = u * 0.75, r2 = u * 0.875; // convex shoulder, concave inner corner
    const d = [
      `M${nw + r1} 0`, `H${W - tw - r1}`,
      `A${r1} ${r1} 0 0 1 ${W - tw} ${r1}`, `V${th - r2}`, `A${r2} ${r2} 0 0 0 ${W - tw + r2} ${th}`,
      `H${W - R}`, `A${R} ${R} 0 0 1 ${W} ${th + R}`,
      `V${H - R}`, `A${R} ${R} 0 0 1 ${W - R} ${H}`,
      `H${R}`, `A${R} ${R} 0 0 1 0 ${H - R}`,
      `V${nh + r1}`, `A${r1} ${r1} 0 0 1 ${r1} ${nh}`,
      `H${nw - r2}`, `A${r2} ${r2} 0 0 0 ${nw} ${nh - r2}`,
      `V${r1}`, `A${r1} ${r1} 0 0 1 ${nw + r1} 0`, "Z",
    ].join("");
    surface.style.clipPath = `path("${d}")`;
    surface.style.setProperty("--notch-h", Math.max(nh, th) + "px");
    const svg = surface.querySelector(".stack-card__line");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.firstElementChild.setAttribute("d", d);
  }

  /* ---------- pin or flow ---------- */
  /* A card pins only if it fits and everything after it pins too: a pinned card under a
     taller flowing one would stay stuck behind it until the end of the stack. */
  function decide() {
    const reduced = SITE.reduced();
    let pinLater = true;
    for (let i = cards.length - 1; i >= 0; i--) {
      const c = cards[i], top = parseFloat(getComputedStyle(c).top) || 0;
      const fits = c.querySelector(".stack-card__frame").offsetHeight <= innerHeight - top - 8;
      const pin = !reduced && fits && pinLater;
      c.classList.toggle("is-flow", !pin);
      pinLater = pin;
    }
    cards.forEach(shape);
    if (!canScrollDrive) draw();
  }

  /* ---------- entrance ---------- */
  function tick(card) {
    const el = card.querySelector("[data-count-to]"), to = +el.dataset.countTo;
    if (SITE.reduced() || to < 2) return;
    const t0 = performance.now(), ms = 360;
    const run = (t) => {
      const u = clamp((t - t0) / ms, 0, 1);
      el.textContent = String(Math.max(1, Math.round(to * u))).padStart(2, "0");
      if (u < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }
  if ("IntersectionObserver" in window && !SITE.reduced()) {
    const seen = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      tick(e.target);
      seen.unobserve(e.target);
    }), { threshold: 0.12 });
    cards.forEach((c) => seen.observe(c));
  } else cards.forEach((c) => c.classList.add("is-in"));

  /* ---------- fallback for browsers without scroll-driven animations ---------- */
  let active = true, queued = false;
  function draw() {
    queued = false;
    if (!active || SITE.reduced()) return;
    const vh = innerHeight, full = SITE.mode === "full", s = full ? 0.93 : 0.96, y = full ? -12 : 0;
    cards.forEach((c, i) => {
      const frame = c.querySelector(".stack-card__frame"), dim = c.querySelector(".stack-card__dim"), tabs = c.querySelectorAll(".stack-tab");
      const next = cards[i + 1], mark = next && next.previousElementSibling;
      const browser = c.querySelector(".browser"), self = i ? c.previousElementSibling : null;
      if (browser) browser.style.transform = full && self && !c.classList.contains("is-flow")
        ? `translateY(${(1 - clamp((vh - self.getBoundingClientRect().top) / (vh - parseFloat(getComputedStyle(c).top)), 0, 1)) * 24}px)` : "";
      if (!mark || c.classList.contains("is-flow")) {
        frame.style.transform = ""; dim.style.opacity = ""; tabs.forEach((t) => { t.style.opacity = ""; });
        return;
      }
      const end = parseFloat(getComputedStyle(next).top) || 0, p = clamp((vh - mark.getBoundingClientRect().top) / (vh - end), 0, 1);
      frame.style.transform = `translateY(${y * p}px) scale(${1 - (1 - s) * p})`;
      dim.style.opacity = String(0.55 * p);
      tabs.forEach((t) => { t.style.opacity = String(1 - p); });
    });
  }
  if (!canScrollDrive) {
    addEventListener("scroll", () => { if (active && !queued) { queued = true; requestAnimationFrame(draw); } }, { passive: true });
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => { active = es[0].isIntersecting; if (active) draw(); }).observe(stack);
  }

  /* ---------- keyboard: a focused control must never stay under another card ---------- */
  stack.addEventListener("focusin", (e) => {
    const card = e.target.closest(".stack-card");
    if (!card || card.classList.contains("is-flow")) return;
    requestAnimationFrame(() => {
      const r = e.target.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (hit && (e.target === hit || e.target.contains(hit))) return;
      const mark = card.previousElementSibling;
      const flowTop = mark ? mark.getBoundingClientRect().bottom : stack.getBoundingClientRect().top + parseFloat(getComputedStyle(stack).paddingTop);
      const top = parseFloat(getComputedStyle(card).top) || 0;
      scrollTo({ top: flowTop + scrollY - top, behavior: SITE.reduced() ? "auto" : "smooth" });
    });
  });

  /* ---------- tall captures scroll on hover (FULL, CSS does the motion) ---------- */
  cards.forEach((c) => {
    const img = c.querySelector(".browser__view img"), mark = () => c.querySelector(".shots").classList.toggle("is-tall", img.naturalWidth > 0 && img.naturalHeight / img.naturalWidth > 0.8);
    if (img.complete) mark(); else img.addEventListener("load", mark, { once: true });
  });

  /* ---------- keep it measured ---------- */
  let timer = 0, lastW = innerWidth, lastH = innerHeight;
  const later = () => { clearTimeout(timer); timer = setTimeout(decide, 120); };
  addEventListener("resize", () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 80) return; // a phone's address bar
    lastW = innerWidth; lastH = innerHeight;
    later();
  });
  if (window.ResizeObserver) { const ro = new ResizeObserver(later); cards.forEach((c) => ro.observe(c.querySelector(".stack-tab--kind"))); }
  SITE.onLang(later);
  SITE.onMode(later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(decide);
  decide();
})();
