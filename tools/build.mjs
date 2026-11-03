// Generates the static pages from src/content.mjs. No runtime dependency: output is plain HTML.
// node tools/build.mjs
import fs from "node:fs";
import { createHash } from "node:crypto";
import * as C from "../src/content.mjs";

const { S, nav, meta, BASE, TG, GITHUB, WHATSAPP } = C;
const dict = {}; // every translatable string ends up here, then in js/i18n.js
let auto = 0;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** register a {ru,en} pair, return its key */
const reg = (pair, key) => { const k = key || `x${++auto}`; dict[k] = pair; return k; };
/** <span data-i18n>RU</span> from a shared key or an inline pair */
const t = (keyOrPair, tag = "span", attrs = "") => {
  const k = typeof keyOrPair === "string" ? keyOrPair : reg(keyOrPair);
  const pair = typeof keyOrPair === "string" ? S[k] : keyOrPair;
  if (!pair) throw new Error("missing string " + k);
  if (typeof keyOrPair === "string") dict[k] = pair;
  return `<${tag} data-i18n="${k}"${attrs ? " " + attrs : ""}>${esc(pair.ru)}</${tag}>`;
};
/** statement block with [[highlighted]] words; main.js re-renders it on language change */
const rich = (key) => { dict[key] = S[key]; return esc(S[key].ru).replace(/\[\[(.+?)\]\]/g, "<em>$1</em>"); };
const TILE = `<svg class="about__tile" aria-hidden="true"><defs><pattern id="tile" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M28 6 34 22 50 28 34 34 28 50 22 34 6 28 22 22ZM12 12 22 22M44 12 34 22M12 44 22 34M44 44 34 34" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M0 0H8L0 8ZM56 0V8L48 0ZM0 56V48L8 56ZM56 56H48L56 48Z" fill="currentColor"/></pattern></defs><rect width="100%" height="100%" fill="url(#tile)"/></svg>`;
const about = () => `<section class="about">
  <div class="about__quote" data-reveal>
    ${TILE}
    <span class="cut tl tab about__tab">${t("about.tab")}</span>
    <p class="about__q" data-i18n-rich="manifesto">${rich("manifesto")}</p>
  </div>
  <div class="about__me" data-reveal>
    ${t("intro.kicker", "p", 'class="kicker kicker--ink"')}
    ${t("intro.h2", "h2", 'class="about__h"')}
    ${t("intro.p1", "p")}
    ${t("intro.p2", "p")}
    <span class="cut br about__cut" aria-hidden="true"></span>
    ${t("intro.sticker", "p", 'class="sticker about__sticker"')}
  </div>
</section>`;
/** attribute variant: data-i18n-aria-label="key" aria-label="RU" */
const ta = (attr, key) => { dict[key] = S[key]; return `${attr}="${esc(S[key].ru)}" data-i18n-${attr}="${key}"`; };

const ICON = {
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  tg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.5c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.3 13.2 1.5 11.7c-1-.3-1-1 .2-1.5L20.4 3c.9-.3 1.7.2 1.5 1.3z"/></svg>`,
  gh: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.6 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.2.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>`,
  leaf: `<svg viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" d="M50 3 57 20 65 15 62 36 74 29 78 38 93 35 88 47 94 52 73 66 77 75 55 71 52 84 51 98H49L48 84 45 71 23 75 27 66 6 52 12 47 7 35 22 38 26 29 38 36 35 15 43 20Z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.4" fill="currentColor"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 14.6A9 9 0 0 1 9.4 3.5a9 9 0 1 0 11.1 11.1z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
};

const LEAF_D = "M50 3 57 20 65 15 62 36 74 29 78 38 93 35 88 47 94 52 73 66 77 75 55 71 52 84H48L45 71 23 75 27 66 6 52 12 47 7 35 22 38 26 29 38 36 35 15 43 20Z";

const cta = (href, label, cls = "", extra = "") =>
  `<a class="cta ix ix--pill ${cls}" href="${href}" ${extra}><span class="cta__pill">${label}</span><span class="cta__round">${ICON.arrow}</span></a>`;

const flapCell = (ch) => `<span class="flap__cell"><span class="flap__half flap__top"><b>${ch}</b></span><span class="flap__half flap__bot"><b>${ch}</b></span><span class="flap__half flap__top flap__leaf"><b>${ch}</b></span><span class="flap__half flap__bot flap__leaf"><b>${ch}</b></span></span>`;
const langSwitch = () => `<button class="flap" type="button" data-flap aria-label="Switch language to English" lang="en"><span class="flap__cells" aria-hidden="true">${flapCell("R")}${flapCell("U")}</span></button>`;

const lamp = () => `<div class="lamp" data-lamp>
  <svg class="lamp__svg" aria-hidden="true"><path class="lamp__glow"/><path class="lamp__shade"/><path class="lamp__cord"/><circle class="lamp__bead"/></svg>
  <button class="lamp__hit" type="button" role="switch" aria-checked="false" data-theme-btn ${(dict["theme.toDark"] = S["theme.toDark"], dict["theme.toLight"] = S["theme.toLight"], `aria-label="${esc(S["theme.toDark"].ru)}"`)}></button>
</div>`;

const header = (page) => `<header class="top">
  <div class="top__notch cut tl">
    <div class="brand">
      <button class="logo__mark ix ix--logo" type="button" ${ta("aria-label", "secret.label")} aria-describedby="leaf-hint"><svg class="logo__ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="16.5" pathLength="100"/></svg>${ICON.leaf}</button>
      <a class="logo ix" href="index.html" ${ta("aria-label", "nav.home")}><span class="logo__word">${t("home.name")}</span></a>
      <span class="leaf-hint" id="leaf-hint" aria-hidden="true"><svg class="leaf-hint__arrow" viewBox="0 0 24 20"><path pathLength="1" d="M22 16C14 18 6 15 5 4M1.5 8 5 3.5 9 7.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>${t("secret.hint")}</span>
    </div>
    <button class="menu-btn ix ix--round" type="button" aria-expanded="false" aria-controls="site-nav" ${ta("aria-label", "nav.menu")} data-menu-btn>${ICON.menu}</button>
    <nav id="site-nav" class="nav" ${ta("aria-label", "nav.label")}>
      <button class="nav__close ix ix--round" type="button" ${ta("aria-label", "nav.close")} data-menu-close>${ICON.close}</button>
      <ul>${nav.map((n, i) => `<li><a href="${n.href}"${n.id === page ? ' aria-current="page"' : ""}><i aria-hidden="true">0${i + 1}</i>${t({ ru: n.ru, en: n.en })}</a></li>`).join("")}</ul>
    </nav>
  </div>
  <div class="top__lang cut tr">${langSwitch()}${lamp()}</div>
</header>`;

const footer = () => `<footer class="foot">
  <div class="foot__panel" data-reveal>
    <span class="cut tr foot__cut" aria-hidden="true"></span>
    ${t("foot.big", "p", 'class="foot__big"')}
    ${cta(`https://t.me/${TG}`, t("foot.cta"), "cta--ink magnetic", 'target="_blank" rel="noopener"')}
  </div>
  <div class="foot__row">
    ${t("foot.copy")}
    ${t("foot.made")}
    <a class="link ix--link" href="https://t.me/${TG}" target="_blank" rel="noopener">Telegram @${TG}</a>
    <a class="link ix--link" href="${GITHUB}" target="_blank" rel="noopener">GitHub EdgeWayy</a>
    <a class="link ix--link" href="#top">${t("foot.top")}</a>
  </div>
</footer>
<a class="fab ix ix--round magnetic" href="https://t.me/${TG}" target="_blank" rel="noopener" ${ta("aria-label", "float.tg")}>${ICON.tg}</a>`;

const head = (id, file, extra = "") => {
  const m = meta[id];
  return `<!doctype html>
<html lang="ru" data-page="${id}" data-title-en="${esc(m.title.en)}" data-title-ru="${esc(m.title.ru)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${extra}<title>${esc(m.title.ru)}</title>
<meta name="description" content="${esc(m.desc.ru)}">
<meta name="theme-color" content="#1A1A1A">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(m.title.ru)}">
<meta property="og:description" content="${esc(m.desc.ru)}">
<meta property="og:url" content="${BASE}${file}">
<meta property="og:image" content="${BASE}img/og.jpg">
<meta property="og:locale" content="ru_RU">
<meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${BASE}${file}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/roboto-flex-wide-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/golos-text-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<script>(function(){var d=document.documentElement,l;d.classList.add("js");try{l=localStorage.getItem("akbar-lang")}catch(e){}if(l==="en"){d.lang="en";d.classList.add("lang-pending");var k=document.createElement("link");k.rel="preload";k.as="font";k.type="font/woff2";k.crossOrigin="";k.href="fonts/roboto-flex-wide-latin.woff2";document.head.appendChild(k)}
var t;try{t=localStorage.getItem("akbar-theme")}catch(e){}if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";d.dataset.theme=t;
var a;try{a=sessionStorage.getItem("akbar-acid")}catch(e){}if(a==="1")d.dataset.mode="acid";
var m=matchMedia("(hover:hover) and (pointer:fine) and (min-width:1024px)").matches&&!matchMedia("(prefers-reduced-motion:reduce)").matches;d.dataset.perf=m?"full":"lite";
${id === "index" ? `var p;try{p=sessionStorage.getItem("gate-passed")}catch(e){}if(!p)d.classList.add("gate-on");` : ""}setTimeout(function(){if(!window.SITE)d.classList.remove("js","gate-on")},3000)})()</script>
<link rel="stylesheet" href="styles.css">
</head>
<body id="top">
<a class="skip" href="#main">${t("skip")}</a>
<span class="vh" aria-live="polite" data-lang-live></span>`;
};

const scripts = (before = "", after = "") => `
<script src="js/i18n.js" defer></script>${before}
<script src="main.js" defer></script>${after}
</body>
</html>
`;

/* ---------- page helpers ---------- */
const pageHero = (n, h1, lead) => `<section class="panel panel--page">
  <span class="shape shape--a" data-parallax="-.06" aria-hidden="true"></span>
  <span class="shape shape--b" data-parallax=".05" aria-hidden="true"></span>
  <div class="panel__in">
    <p class="kicker"><i>${n}</i></p>
    ${t(h1, "h1", 'class="giant" data-words')}
    ${t(lead, "p", 'class="lead"')}
  </div>
</section>`;

/* ---------- pages ---------- */
const pages = {};

pages.index = () => head("index", "") + `
<div class="gate" id="gate">
  <canvas class="gate__canvas" aria-hidden="true"></canvas>
  <div class="gate__top">
    ${langSwitch()}
    <a class="gate__skip ix ix--text" href="#main" data-gate-skip>${t("gate.skip")}</a>
  </div>
  <div class="gate__bottom">
    <button class="hold" type="button" data-hold data-auto ${ta("aria-label", "gate.label")}>
      <span class="hold__leaf" data-hold-leaf>
        <svg class="hold__svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs><clipPath id="hold-clip"><path d="${LEAF_D}"/></clipPath></defs>
          <path class="hold__stem" d="M50 78Q50.5 90 47 99"/>
          <path class="hold__body" d="${LEAF_D}"/>
          <g clip-path="url(#hold-clip)"><rect class="hold__fill" x="0" y="0" width="100" height="100"/></g>
          <path class="hold__veins" d="M50 80V60M50 33V12M50 66 82 46M50 66 18 46M50 28 63 16M50 28 37 16M50 74 72 68M50 74 28 68"/>
        </svg>
        <span class="hold__in"><span data-hold-word>${t("gate.hold")}</span><b data-hold-pct aria-hidden="true">0%</b></span>
      </span>
    </button>
    <span class="vh" aria-live="polite" data-hold-live></span>
    <p class="gate__hint" data-gate-hint></p>
  </div>
</div>
<div class="wrap">
${header("index")}
<main id="main">
  <section class="panel panel--hero" data-hero>
    <canvas class="bg-leaves" aria-hidden="true"></canvas>
    <div class="hero">
      <div class="hero__text">
        <p class="status"><i class="status__dot" aria-hidden="true"></i>${t("home.status")}</p>
        ${t("home.h1", "h1", 'class="giant giant--hero" data-words')}
        ${t("home.lead", "p", 'class="lead"')}
        <div class="hero__cta">
          ${cta("projects.html", t("home.cta"), "magnetic")}
        </div>
        <ul class="stats">
          ${C.stats.map((s) => `<li><b data-count="${s.n}">${s.n}</b>${t(s.key)}</li>`).join("")}
        </ul>
      </div>
      <div class="hero__art">
        <div class="blob" data-parallax=".04" aria-hidden="true"></div>
        <figure class="portrait" id="portrait" data-variant="b">
          <img src="img/portrait-dots.webp" width="640" height="800" ${ta("alt", "home.alt")} decoding="async">
          <canvas aria-hidden="true"></canvas>
        </figure>
        <p class="tagpill tagpill--name">${t("home.name")}</p>
        <p class="tagpill tagpill--role">${t("home.role")}</p>
        <div class="hero__social">
          <a class="round ix ix--round" href="https://t.me/${TG}" target="_blank" rel="noopener" aria-label="Telegram">${ICON.tg}</a>
          ${WHATSAPP ? `<a class="round ix ix--round" href="${WHATSAPP}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.wa}</a>` : `<a class="round ix ix--round" href="${GITHUB}" target="_blank" rel="noopener" aria-label="GitHub">${ICON.gh}</a>`}
        </div>
        <svg class="badge" viewBox="0 0 160 160" aria-hidden="true">
          <circle cx="80" cy="80" r="80"/>
          <defs><path id="badge-path" d="M80 80m-60 0a60 60 0 1 1 120 0a60 60 0 1 1-120 0"/></defs>
          <text><textPath href="#badge-path" data-i18n="home.badge" textLength="372">${esc(S["home.badge"].ru)}</textPath></text>
          <g transform="translate(55 55) scale(.5)"><path d="M50 3 57 20 65 15 62 36 74 29 78 38 93 35 88 47 94 52 73 66 77 75 55 71 52 84 51 98H49L48 84 45 71 23 75 27 66 6 52 12 47 7 35 22 38 26 29 38 36 35 15 43 20Z"/></g>
        </svg>
      </div>
    </div>
  </section>
  ${(dict["home.badge"] = S["home.badge"], "")}
  <div class="marquee" data-marquee aria-hidden="true"><div class="marquee__track">
    ${Array(16).fill(0).map(() => `<span>${t("marquee.a")}</span><i>•</i><span>${t("marquee.b")}</span><i>•</i><span>${t("marquee.c")}</span><i>•</i>`).join("")}
  </div></div>
  ${about()}
  <section class="hub">
    ${t("hub.h2", "h2", 'class="h2" data-reveal')}
    <div class="hub__grid">
      ${nav.slice(1).map((n, i) => `<a class="hubcard ix ix--card" href="${n.href}" data-reveal>
        <span class="cut tl tab" aria-hidden="true">0${i + 2}</span>
        ${t({ ru: n.ru, en: n.en }, "b")}
        ${t(`hub.${n.id}`, "span", 'class="hubcard__t"')}
        <span class="cta__round">${ICON.arrow}</span>
      </a>`).join("")}
    </div>
  </section>
</main>
${footer()}
</div>` + scripts(`
<script src="js/portrait-data.js" defer></script>`, `
<script src="js/gate.js" defer></script>`);

pages.projects = () => head("projects", "projects.html") + `
<div class="wrap">
${header("projects")}
<main id="main">
${pageHero("01", "projects.h1", "projects.lead")}
<section class="stack" data-stack style="timeline-scope:${C.projects.slice(1).map((_, i) => "--m" + (i + 1)).join(",")}">
${C.projects.map((p, i) => {
  const total = C.projects.length, nn = String(i + 1).padStart(2, "0"), tt = String(total).padStart(2, "0"), last = i === total - 1;
  const words = p.title.split(" ").map((w, k) => `<span class="w"><span class="w__in" style="--i:${k}">${esc(w)}</span></span>`).join(" ");
  return `${i ? `<span class="stack__mark" style="view-timeline-name:--m${i}" aria-hidden="true"></span>` : ""}<article class="stack-card${i % 2 ? " stack-card--alt" : ""}${last ? " stack-card--last" : ""}${i ? "" : " stack-card--first"}" style="--i:${i};${i ? `--self:--m${i};` : ""}${last ? "" : `--next:--m${i + 1};`}">
  <div class="stack-card__frame">
    <p class="stack-tab stack-tab--n"><span data-count-to="${i + 1}">${nn}</span> / ${tt}</p>
    ${t(p.kind, "p", 'class="stack-tab stack-tab--kind"')}
    <div class="stack-card__surface">
      <svg class="stack-card__line" aria-hidden="true"><path/></svg>
      <div class="stack-card__info">
        <h2 class="stack-card__title">${words}</h2>
        <dl class="stack-card__rows">
          <div><dt>${t("projects.task")}</dt><dd>${t(p.task)}</dd></div>
          <div><dt>${t("projects.solution")}</dt><dd>${t(p.solution)}</dd></div>
          <div><dt>${t("projects.result")}</dt><dd>${t(p.result)}</dd></div>
          <div><dt>${t("projects.term")}</dt><dd><b>${t(p.term)}</b></dd></div>
        </dl>
        <ul class="tags stack-card__tags">${p.tags.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        ${p.note ? t(p.note, "p", 'class="sticker sticker--small stack-card__note"') : ""}
        ${cta(`demos/${p.slug}/index.html`, t("projects.open"))}
      </div>
      <a class="shots ix ix--card" href="demos/${p.slug}/index.html" aria-label="${esc(p.title)}">
        <span class="browser"><span class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><span>demo / ${esc(p.title)}</span></span><span class="browser__view"><img src="img/work/${p.slug}-desktop.webp" width="1280" height="800" loading="lazy" decoding="async" alt="${esc(p.title)}, desktop"></span></span>
        <span class="mock-phone"><img src="img/work/${p.slug}-mobile.webp" width="520" height="1125" loading="lazy" decoding="async" alt="${esc(p.title)}, mobile"></span>
      </a>
      <div class="stack-card__dim" aria-hidden="true"></div>
    </div>
  </div>
</article>`;
}).join("\n")}
</section>
</main>
${footer()}
</div>` + scripts("", `
<script src="js/stack.js" defer></script>`);

const planCards = () => C.packages.map((p, i) => `<article class="plan ${p.hot ? "plan--hot" : ""}" data-reveal>
    <span class="cut tl tab" aria-hidden="true">0${i + 1}</span>
    ${t(p.title, "h3", 'class="h3"')}
    <p class="plan__price">${t(p.price)}</p>
    <p class="plan__term">${t(p.term)}</p>
    <ul>${p.items.map((x) => t(x, "li")).join("")}</ul>
    ${cta(`https://t.me/${TG}`, t("prices.pick"), p.hot ? "" : "cta--ink", 'target="_blank" rel="noopener"')}
  </article>`).join("\n");

const FILTERS = [["all", "filter.all"], ["web", "filter.web"], ["bots", "filter.bots"], ["int", "filter.int"], ["sup", "filter.sup"]];

pages.services = () => head("services", "services.html") + `
<div class="wrap">
${header("services")}
<main id="main">
${pageHero("02", "services.h1", "services.lead")}
<section class="plans" ${ta("aria-label", "services.main")}>
${planCards()}
</section>
<section class="svc-wrap">
  ${t("services.all", "h2", 'class="h2" data-reveal')}
  <div class="chips" role="group" ${ta("aria-label", "filter.label")} data-filters>
    ${FILTERS.map(([id, key], i) => `<button class="chip ix" type="button" data-filter="${id}" aria-pressed="${i === 0}">${t(key)}</button>`).join("")}
  </div>
  <div class="svc" data-svc>
  ${C.services.map((s, i) => `<a class="svcard ix ix--card" href="https://t.me/${TG}" target="_blank" rel="noopener" data-cat="${s.cat}" data-reveal>
    <span class="cut tl tab" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
    ${t(s.title, "h3", 'class="svcard__t"')}
    ${t(s.short, "p", 'class="svcard__d"')}
    <div class="svcard__meta">
      <b class="svcard__price">${t(s.price)}</b>
      <span class="svcard__term">${t(s.term)}</span>
    </div>
    <span class="cta__round" aria-hidden="true">${ICON.arrow}</span>
  </a>`).join("\n")}
  </div>
</section>
</main>
${footer()}
</div>` + scripts();

pages.why = () => head("why", "why.html") + `
<div class="wrap">
${header("why")}
<main id="main">
${pageHero("03", "why.h1", "why.lead")}
<section class="why">
${[1, 2, 3, 4].map((n) => `<article class="whycard" data-reveal>
    <span class="cut tl tab" aria-hidden="true">0${n}</span>
    ${t(`why.${n}t`, "h2", 'class="h3"')}
    ${t(`why.${n}`, "p")}
  </article>`).join("\n")}
</section>
${about()}
<section class="skills">
  ${t("skills.h2", "h2", 'class="h2" data-reveal')}
  <div class="skills__grid">
    ${C.skills.map((g) => `<div data-reveal>${t(g.key, "h3", 'class="skills__t"')}<ul class="tags">${g.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}
  </div>
</section>
</main>
${footer()}
</div>` + scripts();

pages.process = () => head("process", "process.html") + `
<div class="wrap">
${header("process")}
<main id="main">
${pageHero("04", "process.h1", "process.lead")}
<ol class="steps">
${[1, 2, 3, 4, 5].map((n) => `<li class="step" data-reveal>
    <span class="step__n">0${n}</span>
    ${t(`process.${n}t`, "h2", 'class="step__t"')}
    ${t(`process.${n}`, "p")}
  </li>`).join("\n")}
</ol>
</main>
${footer()}
</div>` + scripts();

pages.prices = () => head("prices", "prices.html") + `
<div class="wrap">
${header("prices")}
<main id="main">
${pageHero("05", "prices.h1", "prices.lead")}
<section class="plans">
${planCards()}
</section>
<section class="pricelist">
  ${t("prices.more", "h2", 'class="h2" data-reveal')}
  <ul>
  ${C.services.filter((s) => !["Сайт-визитка", "Лендинг", "Интернет-магазин и каталог", "Админ-панель"].includes(s.title.ru)).map((s) => `<li data-reveal>${t(s.title, "b")}<span>${t(s.term)}</span><strong>${t(s.price)}</strong></li>`).join("\n")}
  </ul>
</section>
<section class="faq">
  ${t("prices.faq", "h2", 'class="h2" data-reveal')}
  ${C.faq.map((f) => `<details data-reveal><summary>${t(f.q)}<i class="faq__x" aria-hidden="true"></i></summary>${t(f.a, "p")}</details>`).join("\n")}
</section>
</main>
${footer()}
</div>` + scripts();

pages.contacts = () => head("contacts", "contacts.html") + `
<div class="wrap">
${header("contacts")}
<main id="main">
${pageHero("06", "contacts.h1", "contacts.resp")}
<section class="contact" data-reveal>
  <span class="cut tr contact__cut" aria-hidden="true"></span>
  <span class="cut bl contact__cut2" aria-hidden="true"></span>
  ${t("contacts.h2", "h2", 'class="contact__h"')}
  <a class="contact__handle ix ix--text" href="https://t.me/${TG}" target="_blank" rel="noopener">@${TG}</a>
  <div class="contact__btns">
    ${cta(`https://t.me/${TG}`, t("contacts.write"), "cta--ink magnetic", 'target="_blank" rel="noopener"')}
    <button class="pillbtn ix ix--pill" type="button" data-copy="@${TG}">${t("contacts.copy")}</button>
  </div>
  <p class="contact__status" role="status" aria-live="polite" data-copy-status></p>
  <span hidden>${t("contacts.copied")}${t("contacts.copyFail")}</span>
  <ul class="contact__links">
    <li><a class="link ix--link" href="${GITHUB}" target="_blank" rel="noopener">GitHub: EdgeWayy</a></li>
  </ul>
</section>
</main>
${footer()}
</div>` + scripts();

pages[404] = () => head(404, "404.html", `<script>(function(){var h=location.hostname,s=location.pathname.split("/")[1];if(/github\\.io$/.test(h)&&/^[\\w.-]+$/.test(s)){var b=document.createElement("base");b.href="/"+s+"/";document.head.appendChild(b)}})()</script>\n`) + `
<div class="wrap">
${header("")}
<main id="main">
<section class="panel panel--page">
  <span class="shape shape--a" aria-hidden="true"></span>
  <div class="panel__in">
    <p class="kicker"><i>404</i></p>
    ${t("404.h1", "h1", 'class="giant" data-words')}
    ${t("404.lead", "p", 'class="lead"')}
    ${cta("index.html", t("404.cta"))}
  </div>
</section>
</main>
${footer()}
</div>` + scripts();

/* ---------- output ---------- */
const files = { index: "index.html", projects: "projects.html", services: "services.html", why: "why.html", process: "process.html", prices: "prices.html", contacts: "contacts.html", 404: "404.html" };
/* No HTTP headers on GitHub Pages, so the policy ships as a meta tag. Inline scripts are allowed by hash only. */
const withPolicy = (html) => {
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`);
  const csp = `default-src 'self'; script-src 'self' ${hashes.join(" ")}; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`;
  return html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`);
};
for (const [id, file] of Object.entries(files)) {
  fs.writeFileSync(file, withPolicy(pages[id]()));
}
dict["gate.enter"] = S["gate.enter"]; // only used from gate.js
fs.writeFileSync("js/i18n.js", "/* Built by tools/build.mjs. Edit src/content.mjs. */\nwindow.I18N=" + JSON.stringify(dict) + ";\n");
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.values(files).filter((f) => f !== "404.html").map((f) => `  <url><loc>${BASE}${f === "index.html" ? "" : f}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${BASE}sitemap.xml\n`);
fs.writeFileSync(".nojekyll", "");
fs.writeFileSync("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#1A1A1A"/><g transform="translate(12 12) scale(.76)"><path fill="#E4432D" d="M50 3 57 20 65 15 62 36 74 29 78 38 93 35 88 47 94 52 73 66 77 75 55 71 52 84 51 98H49L48 84 45 71 23 75 27 66 6 52 12 47 7 35 22 38 26 29 38 36 35 15 43 20Z"/></g></svg>\n`);
console.log("built", Object.keys(files).length, "pages,", Object.keys(dict).length, "strings");
