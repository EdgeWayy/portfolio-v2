# Akbar portfolio v2

Static multi-page site: plain HTML, CSS and JS, no frameworks, ready for GitHub Pages.

## Run locally

    node tools/serve.mjs . 5173

Then open http://localhost:5173/

## Edit

- Prices and durations: `src/prices.mjs`, the one place for them. All other copy and projects: `src/content.mjs`. Then run `node tools/build.mjs`, which regenerates the HTML pages, `js/i18n.js`, the sitemap and robots.txt.
- Do not edit the generated `*.html` files by hand.
- Set `BASE` in `src/content.mjs` to the real site URL before publishing. Add `WHATSAPP` there to show the WhatsApp button.
- Styles: `styles.css`. Runtime and the season config: `main.js`. Entry gate: `js/gate.js`.

## Tools

`tools/build.mjs` builds the site and `tools/serve.mjs` serves it locally. Screenshot and QA scripts are kept out of this repository.

## Fonts

Self-hosted woff2 files from Google Fonts, in `fonts/`. Both are under the SIL Open Font License 1.1, which allows commercial use and self-hosting.

- Display: Roboto Flex, fixed at `wdth 151`, `wght 1000`, `opsz 144`
- Body: Golos Text, variable `wght 400..700`

## Portrait

`js/portrait-data.js` holds dot sizes only. The photo itself is not in this repo.

Secret mode fonts, loaded only when it is used: Rubik Wet Paint and JetBrains Mono, both SIL OFL 1.1, from Google Fonts.

## Theme and secret mode

- Theme: `data-theme` on `<html>`, set by the head script before first paint and saved in localStorage. Tokens are at the top of `styles.css`.
- Performance mode moved from `data-mode` to `data-perf`. `data-mode="acid"` is now the secret mode, saved in sessionStorage only.
- Secret triggers: hold the logo leaf 2 s, press the logo 5 times within 2.5 s, or type "acid".
- `js/acid-gl.js` is the shader, `js/acid.js` the layout, skull and switching. Both load on demand.
