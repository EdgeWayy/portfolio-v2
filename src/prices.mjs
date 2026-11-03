/* The one place for prices and durations. Edit a number here, then run `node tools/build.mjs`.
   Services, packages, the price list, the FAQ, meta descriptions and project terms all read from it.
   `source: "old"` came from the old portfolio. `source: "market"` was set from research: see docs-internal/RESEARCH.md. */

export const PRICES = {
  bizsite:  { label: { ru: "Сайт-визитка", en: "Business website" }, usd: 150, term: { ru: "3–7 дней", en: "3–7 days" }, source: "old" },
  landing:  { label: { ru: "Лендинг", en: "Landing page" }, usd: 150, term: { ru: "3–7 дней", en: "3–7 days" }, source: "old" },
  store:    { label: { ru: "Интернет-магазин и каталог", en: "Online store and catalog" }, usd: 400, term: { ru: "2–4 недели", en: "2–4 weeks" }, source: "old" },
  bot:      { label: { ru: "Telegram-бот", en: "Telegram bot" }, usd: 150, term: { ru: "1–2 недели", en: "1–2 weeks" }, source: "old" },
  miniapp:  { label: { ru: "Telegram Mini App", en: "Telegram Mini App" }, usd: 350, term: { ru: "2–3 недели", en: "2–3 weeks" }, source: "market" },
  admin:    { label: { ru: "Админ-панель", en: "Admin panel" }, usd: 250, term: { ru: "1–2 недели", en: "1–2 weeks" }, source: "old" },
  apps:     { label: { ru: "Веб- и мобильные приложения", en: "Web and mobile apps" }, usd: 800, term: { ru: "4–8 недель", en: "4–8 weeks" }, source: "market" },
  payments: { label: { ru: "Приём оплаты", en: "Online payments" }, usd: 100, term: { ru: "3–5 дней", en: "3–5 days" }, source: "old" },
  api:      { label: { ru: "Кассы и API", en: "Cash registers and APIs" }, usd: 150, term: { ru: "3–7 дней", en: "3–7 days" }, source: "market" },
  booking:  { label: { ru: "Онлайн-запись и бронирование", en: "Online booking" }, usd: 250, term: { ru: "1–3 недели", en: "1–3 weeks" }, source: "old" },
  qr:       { label: { ru: "QR-меню для кафе", en: "QR menu for cafes" }, usd: 100, term: { ru: "3–5 дней", en: "3–5 days" }, source: "old" },
  redesign: { label: { ru: "Редизайн и ускорение", en: "Redesign and speed-up" }, usd: 200, term: { ru: "1–3 недели", en: "1–3 weeks" }, source: "old" },
  seo:      { label: { ru: "SEO и карты", en: "SEO and maps" }, usd: 80, term: { ru: "3–7 дней", en: "3–7 days" }, source: "old" },
  support:  { label: { ru: "Поддержка сайта", en: "Site support" }, usd: 30, per: { ru: " / мес", en: " / mo" }, term: { ru: "ежемесячно", en: "monthly" }, source: "old" },
};

/** { ru: "от $150", en: "from $150" } */
export const price = (id) => {
  const p = PRICES[id], per = p.per || { ru: "", en: "" };
  return { ru: `от $${p.usd}${per.ru}`, en: `from $${p.usd}${per.en}` };
};
export const term = (id) => PRICES[id].term;
export const usd = (id) => PRICES[id].usd;
/** title, price and term for a service row */
export const item = (id) => ({ title: PRICES[id].label, price: price(id), term: term(id) });
