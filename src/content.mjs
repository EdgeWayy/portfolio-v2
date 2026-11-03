/* All site copy and data. Run `node tools/build.mjs` after editing.
   Projects and process come from the old portfolio. Prices and durations live in src/prices.mjs. */
import { item, price, term, usd } from "./prices.mjs";

export const BASE = "https://edgewayy.github.io/portfolio-v2/"; // change when the repo name is final
export const TG = "KrieWoo";
export const GITHUB = "https://github.com/EdgeWayy";
export const WHATSAPP = ""; // no number in the old portfolio: fill "https://wa.me/<number>" to show the button

/* Languages the stat on Home claims. The big number is derived from this list. */
export const PROJECT_LANGS = ["RU", "UZ", "EN", "KZ", "TR"];
const langList = PROJECT_LANGS.join("\u00A0· "); // no-break space before each dot, so lines only break after a dot

export const nav = [
  { href: "index.html", id: "index", ru: "Главная", en: "Home" },
  { href: "projects.html", id: "projects", ru: "Проекты", en: "Projects" },
  { href: "services.html", id: "services", ru: "Услуги", en: "Services" },
  { href: "why.html", id: "why", ru: "Почему я", en: "Why me" },
  { href: "process.html", id: "process", ru: "Процесс", en: "Process" },
  { href: "prices.html", id: "prices", ru: "Цены", en: "Prices" },
  { href: "contacts.html", id: "contacts", ru: "Контакты", en: "Contacts" },
];

export const meta = {
  index: { title: { ru: "Акбар: сайты для бизнеса в Узбекистане", en: "Akbar: websites for businesses in Uzbekistan" }, desc: { ru: "Акбар, fullstack-разработчик из Узбекистана. Сайты, интернет-магазины, Telegram-боты и админ-панели для местного бизнеса.", en: "Akbar, a full-stack developer from Uzbekistan. Websites, online stores, Telegram bots and admin panels for local businesses." } },
  projects: { title: { ru: "Проекты: Акбар", en: "Projects: Akbar" }, desc: { ru: "Шесть живых демо: ресторан, фитнес-клуб, кофейня, бронирование авиабилетов, торговый центр и магазин цветов.", en: "Six live demos: a restaurant, a fitness club, a coffee shop, flight booking, a shopping mall and a flower shop." } },
  services: { title: { ru: "Услуги: Акбар", en: "Services: Akbar" }, desc: { ru: "Сайты, лендинги, магазины, Telegram-боты, админ-панели и интеграции с Click, Payme и Uzum.", en: "Websites, landing pages, stores, Telegram bots, admin panels and Click, Payme and Uzum integrations." } },
  why: { title: { ru: "Почему я: Акбар", en: "Why me: Akbar" }, desc: { ru: "Дизайн с чистого листа, сначала телефон, видимый прогресс и один человек на весь проект.", en: "Design from a blank page, phones first, visible progress and one person on the whole project." } },
  process: { title: { ru: "Процесс: Акбар", en: "Process: Akbar" }, desc: { ru: "Пять шагов работы: знакомство, первый экран, разработка, запуск и поддержка.", en: "Five steps of work: intro, first screen, build, launch and support." } },
  prices: { title: { ru: "Цены: Акбар", en: "Prices: Akbar" }, desc: { ru: `Сайт от $${usd("bizsite")}, магазин от $${usd("store")}, админ-панель от $${usd("admin")}. Точную сумму называю до начала работы.`, en: `A site from $${usd("bizsite")}, a store from $${usd("store")}, an admin panel from $${usd("admin")}. You get the exact amount before work starts.` } },
  contacts: { title: { ru: "Контакты: Акбар", en: "Contacts: Akbar" }, desc: { ru: "Напишите в Telegram @KrieWoo. Обычно отвечаю в тот же день.", en: "Message @KrieWoo on Telegram. I usually reply the same day." } },
  404: { title: { ru: "Страница не найдена: Акбар", en: "Page not found: Akbar" }, desc: { ru: "Такой страницы нет.", en: "This page does not exist." } },
};

/* Shared strings: key -> { ru, en } */
export const S = {
  skip: { ru: "Перейти к содержимому", en: "Skip to content" },
  "nav.label": { ru: "Страницы сайта", en: "Site pages" },
  "nav.menu": { ru: "Меню", en: "Menu" },
  "nav.close": { ru: "Закрыть", en: "Close" },
  "nav.home": { ru: "Акбар, на главную", en: "Akbar, go home" },
    "float.tg": { ru: "Написать в Telegram", en: "Message on Telegram" },
  "foot.copy": { ru: "© 2026 Акбар. Все права защищены.", en: "© 2026 Akbar. All rights reserved." },
  "foot.made": { ru: "Сделано вручную в Узбекистане", en: "Made by hand in Uzbekistan" },
  "foot.top": { ru: "Наверх", en: "Back to top" },
  "foot.big": { ru: "Обсудим проект?", en: "Discuss a project?" },
  "foot.cta": { ru: "Написать", en: "Message me" },

  "theme.toDark": { ru: "Включить тёмную тему", en: "Switch to dark theme" },
  "theme.toLight": { ru: "Включить светлую тему", en: "Switch to light theme" },
  "secret.label": { ru: "Секрет: удерживай листик", en: "Secret: hold the leaf" },
  "secret.hint": { ru: "Удерживай 3 секунды", en: "Hold for 3 seconds" }, // on purpose: the real hold is 2 s
  "gate.skip": { ru: "Пропустить", en: "Skip" },
  "gate.hold": { ru: "Держи", en: "Hold" },
  "gate.enter": { ru: "Войти", en: "Enter" },
  "gate.label": { ru: "Удерживай, чтобы войти", en: "Hold to enter" },

  "home.status": { ru: "Принимаю заказы · ноябрь 2026", en: "Taking projects · November 2026" },
  "home.place": { ru: "Узбекистан", en: "Uzbekistan" },
  "home.h1": { ru: "Сайты, которые продают", en: "Websites that sell" },
  "home.lead": { ru: "Делаю быстрые сайты, магазины и админ-панели для кафе, клубов, ресторанов и магазинов. Дизайн с нуля, три языка, оплата Click и Payme.", en: "I build fast websites, online stores and admin panels for cafes, clubs, restaurants and shops. Custom design, three languages, Click and Payme payments." },
  "home.cta": { ru: "Портфолио", en: "Portfolio" },
  "home.name": { ru: "Акбар", en: "Akbar" },
  "home.role": { ru: "Fullstack-разработчик", en: "Full-stack developer" },
  "home.alt": { ru: "Портрет Акбара из точек", en: "Portrait of Akbar made of dots" },
  "home.badge": { ru: "ПРИНИМАЮ ЗАКАЗЫ • ПРИНИМАЮ ЗАКАЗЫ • ", en: "AVAILABLE FOR ORDERS • AVAILABLE FOR ORDERS • " },
  "stats.demos": { ru: "живых демо на этом сайте", en: "live demos on this site" },
  "stats.langs": { ru: `языков в проектах: ${langList}`, en: `languages in projects: ${langList}` },
  "stats.templates": { ru: "шаблонов: каждый дизайн с чистого листа", en: "templates: every design from a blank page" },
  "marquee.a": { ru: "САЙТЫ", en: "WEBSITES" },
  "marquee.b": { ru: "БОТЫ", en: "BOTS" },
  "marquee.c": { ru: "АДМИНКИ", en: "ADMIN PANELS" },
  // from the old portfolio (about.big); [[ ]] marks the words set in tomato
  manifesto: { ru: "Я собираю сайты так, как [[мастер]] собирает [[узор]] на стене Самарканда: из [[сотни точных деталей]], где каждая на своём месте.", en: "I build websites the way a [[craftsman]] builds a [[pattern]] on a Samarkand wall: from [[a hundred precise pieces]], each in its place." },
  "intro.kicker": { ru: "Коротко обо мне", en: "About me, briefly" },
  "intro.h2": { ru: "Привет, я Акбар", en: "Hi, I'm Akbar" },
  "intro.p1": { ru: "Я fullstack-разработчик из Узбекистана. Делаю сайты, интернет-магазины и Telegram-ботов для местного бизнеса: кофеен, фитнес-клубов, ресторанов, магазинов. Веду проект целиком, от идеи и дизайна до запуска и поддержки.", en: "I'm a full-stack developer from Uzbekistan. I build websites, online stores and Telegram bots for local businesses: coffee shops, fitness clubs, restaurants, stores. I run the whole project, from the idea and design to launch and support." },
  "intro.p2": { ru: "Я сам веду все этапы: дизайн, фронтенд, бэкенд и запуск, поэтому вы получаете продуманный сайт быстрее и без переплаты агентству.", en: "I handle every stage myself: design, front end, back end and launch, so you get a well-thought-out site faster and without agency overhead." },
  "about.tab": { ru: "Манифест", en: "Manifesto" },
  "intro.sticker": { ru: "Первый экран через 2–3 дня", en: "First screen in 2–3 days" },
  "hub.h2": { ru: "Куда дальше", en: "Where next" },
  "hub.projects": { ru: "Шесть живых демо: магазины, кафе, бронирование", en: "Six live demos: stores, cafes, booking" },
  "hub.services": { ru: "Что я делаю и сколько это стоит", en: "What I do and what it costs" },
  "hub.why": { ru: "Четыре причины работать со мной", en: "Four reasons to work with me" },
  "hub.process": { ru: "Пять шагов от разговора до поддержки", en: "Five steps from the first chat to support" },
  "hub.prices": { ru: "Пакеты, сроки и частые вопросы", en: "Packages, terms and common questions" },
  "hub.contacts": { ru: "Расскажите о задаче, отвечу в Telegram", en: "Tell me about the task, I'll reply on Telegram" },

  "projects.h1": { ru: "Проекты", en: "Projects" },
  "projects.lead": { ru: "Каждое демо открывается прямо с этого сайта. Нажмите и попробуйте настоящий интерфейс, а не его картинку.", en: "Every demo opens right from this site. Click and try the real interface, not a picture of it." },
  "projects.task": { ru: "Задача", en: "Task" },
  "projects.solution": { ru: "Решение", en: "Solution" },
  "projects.result": { ru: "Результат", en: "Result" },
  "projects.term": { ru: "Типовой срок", en: "Typical term" },
  "projects.open": { ru: "Открыть демо", en: "Open live demo" },

  "services.h1": { ru: "Услуги", en: "Services" },
  "services.lead": { ru: "Цены ориентировочные. Точную сумму называю после короткого разговора о задаче, бесплатно и без обязательств.", en: "Prices are estimates. I name the exact amount after a short talk about the task, free and with no obligation." },
  "services.main": { ru: "Основные пакеты", en: "Main packages" },
  "services.all": { ru: "Все услуги", en: "All services" },
  "filter.label": { ru: "Фильтр услуг", en: "Filter services" },
  "filter.all": { ru: "Все", en: "All" },
  "filter.web": { ru: "Сайты", en: "Websites" },
  "filter.bots": { ru: "Боты и приложения", en: "Bots and apps" },
  "filter.int": { ru: "Интеграции", en: "Integrations" },
  "filter.sup": { ru: "Поддержка", en: "Support" },
  "services.term": { ru: "Срок", en: "Term" },

  "why.h1": { ru: "Почему я", en: "Why me" },
  "why.lead": { ru: "Четыре вещи, которые вы получаете на каждом проекте.", en: "Four things you get on every project." },
  "why.1t": { ru: "С чистого листа", en: "From a blank page" },
  "why.1": { ru: "Дизайн, структура и каждое решение мои. Каждый проект начинаю с нуля, поэтому среди демо нет двух похожих.", en: "The design, structure and every decision are mine. Every project starts from zero, so no two demos are alike." },
  "why.2t": { ru: "Сначала телефон", en: "Phones first" },
  "why.2": { ru: "Сначала телефон, потом ноутбук. Каждый сайт проверяю вручную на реальных телефонах.", en: "The phone first, then the laptop. I test every site by hand on real phones." },
  "why.3t": { ru: "Виден прогресс", en: "Visible progress" },
  "why.3": { ru: "Первый экран через 2–3 дня, дальше ссылка на рабочую версию. Вы видите прогресс, а не ждёте вслепую.", en: "The first screen in 2–3 days, then a link to the working version. You see progress instead of waiting blind." },
  "why.4t": { ru: "Один человек на всё", en: "One person throughout" },
  "why.4": { ru: "Веду проект от идеи до поддержки и сам проверяю дизайн, логику и качество. Поэтому быстрее и дешевле, чем в агентстве.", en: "I run the project from idea to support and check the design, logic and quality myself. So it's faster and cheaper than an agency." },
  "skills.h2": { ru: "Навыки и инструменты", en: "Skills and tools" },
  "skills.front": { ru: "Сайты и интерфейсы", en: "Websites and interfaces" },
  "skills.back": { ru: "Боты и сервер", en: "Bots and server" },
  "skills.launch": { ru: "Запуск и рост", en: "Launch and growth" },

  "process.h1": { ru: "Процесс", en: "Process" },
  "process.lead": { ru: "Как мы будем работать.", en: "How we'll work." },
  "process.1t": { ru: "Знакомство", en: "Intro" },
  "process.1": { ru: "15 минут в Telegram: что за бизнес, кто клиенты, что сайт должен делать. Называю цену и срок.", en: "15 minutes on Telegram: your business, your customers, what the site must do. I name the price and the deadline." },
  "process.2t": { ru: "Первый экран", en: "First screen" },
  "process.2": { ru: "Через 2–3 дня показываю дизайн главного экрана на вашем телефоне. Правим, пока не понравится.", en: "In 2–3 days I show the main screen design on your phone. We adjust until you like it." },
  "process.3t": { ru: "Разработка", en: "Build" },
  "process.3": { ru: "Собираю весь сайт и присылаю ссылку на рабочую версию. Вы видите прогресс, а не ждёте вслепую.", en: "I build the whole site and send a link to the working version. You see progress instead of waiting blind." },
  "process.4t": { ru: "Запуск", en: "Launch" },
  "process.4": { ru: "Домен, хостинг, карта, аналитика, оплата. Проверяю скорость и работу на разных телефонах.", en: "Domain, hosting, map, analytics, payments. I check the speed and test on different phones." },
  "process.5t": { ru: "Поддержка", en: "Support" },
  "process.5": { ru: "После запуска остаюсь на связи: мелкие правки, новые цены и фото. Объясню, как менять тексты самому.", en: "After launch I stay in touch: small edits, new prices and photos. I show you how to change texts yourself." },

  "prices.h1": { ru: "Цены", en: "Prices" },
  "prices.lead": { ru: "Цены ориентировочные и зависят от количества страниц, языков и интеграций. Точную сумму называю до начала работы.", en: "Prices are estimates and depend on pages, languages and integrations. You get the exact amount before any work starts." },
  "prices.pick": { ru: "Заказать", en: "Order" },
  "prices.more": { ru: "Отдельные услуги", en: "Individual services" },
  "prices.faq": { ru: "Частые вопросы", en: "Frequent questions" },

  "contacts.h1": { ru: "Контакты", en: "Contacts" },
  "contacts.h2": { ru: "Расскажите о задаче, отвечу в Telegram", en: "Tell me about the task, I'll reply on Telegram" },
  "contacts.resp": { ru: "Обычно отвечаю в тот же день. Пишите на русском, узбекском или английском.", en: "I usually reply the same day. Write in Russian, Uzbek or English." },
  "contacts.copy": { ru: "Скопировать @KrieWoo", en: "Copy @KrieWoo" },
  "contacts.copied": { ru: "Скопировано: @KrieWoo", en: "Copied: @KrieWoo" },
  "contacts.copyFail": { ru: "Не удалось скопировать. Ник: @KrieWoo", en: "Could not copy. The handle is @KrieWoo" },
  "contacts.write": { ru: "Написать в Telegram", en: "Message on Telegram" },
  "contacts.links": { ru: "Ссылки", en: "Links" },

  "404.h1": { ru: "Лист улетел", en: "Leaf blown away" },
  "404.lead": { ru: "Такой страницы нет. Зато главная на месте.", en: "This page doesn't exist. The home page is still here." },
  "404.cta": { ru: "На главную", en: "Go home" },
};

export const stats = [
  { n: 6, key: "stats.demos" },
  { n: PROJECT_LANGS.length, key: "stats.langs" },
  { n: 0, key: "stats.templates" },
];

/* term comes from the matching service in src/prices.mjs. No per-project deadlines exist in the old portfolio. */
export const projects = [
  {
    slug: "nagiwa-sushi", title: "Nagiwa",
    kind: { ru: "Сайт японского ресторана", en: "Japanese restaurant website" },
    task: { ru: "Ресторану нужен атмосферный сайт, который продаёт ужин ещё до визита.", en: "The restaurant needs an atmospheric site that sells the dinner before the guest arrives." },
    solution: { ru: "Прелоадер и анимация первого экрана, меню с вкладками, галерея с лайтбоксом, кнопка Telegram и три языка.", en: "A preloader and hero animation, a tabbed menu, a gallery with lightbox, a Telegram button and three languages." },
    result: { ru: "Тёмная премиальная подача и меню, которое удобно листать одной рукой.", en: "A dark premium look and a menu that is easy to browse with one hand." },
    tags: ["HTML", "CSS", "GSAP", "i18n"],
    term: term("bizsite"),
  },
  {
    slug: "vortaq-fitness", title: "Vortaq",
    kind: { ru: "Сайт фитнес-клуба", en: "Fitness club website" },
    task: { ru: "Клубу нужен сайт, который продаёт пробную тренировку и сразу передаёт заявку менеджеру.", en: "The club needs a site that sells a trial workout and passes the lead to a manager right away." },
    solution: { ru: "Абонементы с расчётом выгоды, расписание по дням со свайпом, тренеры, галерея и форма заявки с защитой от спама.", en: "Membership plans with savings, a day-by-day schedule with swipe, coaches, a gallery and a lead form with spam protection." },
    result: { ru: "В рабочей версии заявка уходит в Telegram менеджеру через серверную функцию. В демо форма работает в тестовом режиме.", en: "In production a serverless function sends each lead to the manager's Telegram. In the demo the form runs in test mode." },
    tags: ["JavaScript", "Serverless", "Lead form", "i18n"],
    term: term("bizsite"),
  },
  {
    slug: "brumelle-coffee", title: "Brumelle",
    kind: { ru: "Сайт кофейни", en: "Coffee shop website" },
    task: { ru: "Кофейне нужна быстрая визитка: меню, часы работы и кнопка звонка прямо на первом экране.", en: "A coffee shop needs a fast site: the menu, opening hours and a call button right on the first screen." },
    solution: { ru: "Меню по категориям, карусель хитов, статус «открыто сейчас» по времени Ташкента, галерея с лайтбоксом и счётчики.", en: "A menu by category, a favourites carousel, a live open-now status in Tashkent time, a gallery with lightbox and counters." },
    result: { ru: "Код сайта весит около 100 КБ, фото подгружаются по мере прокрутки: открывается почти мгновенно даже на мобильном интернете.", en: "The code weighs about 100 KB and photos load as you scroll, so it opens almost instantly, even on mobile data." },
    tags: ["HTML", "CSS", "JavaScript", "i18n"],
    term: term("bizsite"),
  },
  {
    slug: "skynavoi-flights", title: "SkyNavoi",
    kind: { ru: "Бронирование авиабилетов", en: "Flight booking" },
    task: { ru: "Региональной авиакомпании нужен понятный путь покупки билета с телефона, без звонков в кассу.", en: "A regional airline needs a clear way to buy a ticket on a phone, without calling the ticket office." },
    solution: { ru: "Поиск рейсов, фильтры по цене, пересадкам и времени, выбор места на схеме салона, форма пассажира с проверкой и электронный билет.", en: "Flight search, filters by price, stops and time, seat selection on a cabin map, a validated passenger form and an e-ticket." },
    result: { ru: "Полный сценарий из 5 шагов на тестовых данных. Видео в шапке не грузится на медленном интернете и в режиме экономии трафика.", en: "A full 5-step flow on mock data. The hero video is skipped on slow connections and in Data Saver mode." },
    tags: ["JavaScript", "JSON data", "sessionStorage", "Video"],
    term: term("apps"),
  },
  {
    slug: "lumina-mall", title: "Lumina Mall",
    kind: { ru: "Интерактивная карта ТЦ и админ-панель", en: "Interactive mall map and admin panel" },
    task: { ru: "Посетитель не может быстро найти магазин, а владельцу ТЦ нечем самому обновлять витрины, товары и фото.", en: "Visitors can't find a store quickly, and the mall owner has no simple way to update storefronts, products and photos." },
    solution: { ru: "Атриум на 4 этажа с лифтом и свайпом, поиск на трёх языках с транслитом и опечатками, страницы магазинов с корзиной и админ-панель.", en: "A 4-floor atrium with an elevator and swipe, search in three languages with transliteration and typos, store pages with a cart, and an admin panel." },
    result: { ru: "Работает без сервера: данные и фото хранятся в браузере, есть экспорт и импорт. Облегчённый режим для слабых телефонов.", en: "Runs with no server: data and photos live in the browser, with export and import. A lite mode for weak phones." },
    tags: ["JavaScript", "IndexedDB", "Search", "i18n", "Admin"],
    term: term("apps"),
    note: { ru: "Пароль админки в демо: admin123", en: "Demo admin password: admin123" },
  },
  {
    slug: "lirevo-flowers", title: "Lirevo",
    kind: { ru: "Интернет-магазин цветов", en: "Flower shop online store" },
    task: { ru: "Заказы приходят в переписку, и каждый раз приходится вручную уточнять букет, адрес, время и текст открытки.", en: "Orders arrive in chat, and every time someone has to ask about the bouquet, address, time and card text by hand." },
    solution: { ru: "Каталог с категориями, поиском, фильтром цены и сортировкой. Корзина с отменой удаления и оформление по шагам: слоты доставки и промокод.", en: "A catalog with categories, search, a price filter and sorting. A cart with undo and step-by-step checkout with delivery slots and a promo code." },
    result: { ru: "Клиент собирает заказ сам, а владелец получает его уже со всеми деталями. Три языка.", en: "The customer builds the order alone, and the owner gets it with every detail filled in. Three languages." },
    tags: ["JavaScript", "GSAP", "Cart", "Checkout", "i18n"],
    term: term("store"),
  },
];

export const services = [
  { cat: "web", ...item("bizsite"), short: { ru: "Меню, цены, адрес, карта и кнопки связи.", en: "Menu, prices, address, map and contact buttons." }, text: { ru: "Меню, цены, адрес, карта, кнопки звонка и Telegram. Быстро открывается с телефона.", en: "Menu, prices, address, map, call and Telegram buttons. Opens fast on a phone." } },
  { cat: "web", ...item("landing"), short: { ru: "Одна страница под одну цель: заявка или звонок.", en: "One page for one goal: a request or a call." }, text: { ru: "Одна страница под одну цель: заявка, звонок или сообщение в Telegram.", en: "One page for one goal: a request, a call or a Telegram message." } },
  { cat: "web", ...item("store"), short: { ru: "Каталог, корзина, заказ и заявки в Telegram.", en: "Catalog, cart, checkout and orders in Telegram." }, text: { ru: "Каталог с фильтрами и поиском, корзина, оформление заказа, заявки в Telegram.", en: "A catalog with filters and search, a cart, checkout, orders delivered to Telegram." } },
  { cat: "bots", ...item("bot"), short: { ru: "Заказы, запись, ответы и уведомления вам в чат.", en: "Orders, bookings, answers and chat notifications." }, text: { ru: "Приём заказов и заявок, запись, ответы на частые вопросы и уведомления вам в чат.", en: "Takes orders and requests, books appointments, answers common questions and notifies you in a chat." } },
  { cat: "bots", ...item("miniapp"), short: { ru: "Приложение прямо внутри Telegram, без установки.", en: "An app right inside Telegram, nothing to install." }, text: { ru: "Приложение прямо внутри Telegram: каталог, заказ или запись без установки.", en: "An app right inside Telegram: a catalog, an order or a booking with nothing to install." } },
  { cat: "web", ...item("admin"), short: { ru: "Меняйте товары, цены, фото и тексты сами.", en: "Change products, prices, photos and texts yourself." }, text: { ru: "Меняйте товары, цены, фото и тексты сами, без программиста. На любом из трёх языков.", en: "Change products, prices, photos and texts yourself, without a developer. In any of three languages." } },
  { cat: "bots", ...item("apps"), short: { ru: "Личные кабинеты, сервисы и внутренние инструменты.", en: "Customer accounts, services and internal tools." }, text: { ru: "Личные кабинеты, сервисы и внутренние инструменты под вашу задачу.", en: "Customer accounts, services and internal tools built around your task." } },
  { cat: "int", ...item("payments"), short: { ru: "Click, Payme, Uzum, Uzcard, Humo, Visa и Mastercard.", en: "Click, Payme, Uzum, Uzcard, Humo, Visa and Mastercard." }, text: { ru: "Click, Payme, Uzum, карты Uzcard и Humo, Visa и Mastercard: оплата на сайте с понятным статусом заказа для вас и клиента.", en: "Click, Payme, Uzum, Uzcard and Humo cards, Visa and Mastercard: payment on the site with a clear order status for you and the customer." } },
  { cat: "int", ...item("api"), short: { ru: "Онлайн-кассы и сторонние сервисы.", en: "Cash registers and third-party services." }, text: { ru: "Подключение онлайн-касс и сторонних сервисов: заказы и данные сами попадают куда нужно.", en: "Connecting cash registers and third-party services, so orders and data reach the right place on their own." } },
  { cat: "bots", ...item("booking"), short: { ru: "Выбор времени, подтверждение и напоминание.", en: "Pick a time, get a confirmation and a reminder." }, text: { ru: "Запись в салон, клуб или клинику, бронь столика: выбор времени, подтверждение и напоминание.", en: "Bookings for a salon, club or clinic, table reservations: pick a time, get a confirmation and a reminder." } },
  { cat: "web", ...item("qr"), short: { ru: "Меню по QR-коду: фото, цены, три языка.", en: "A QR code menu: photos, prices, three languages." }, text: { ru: "Меню по QR-коду на столе: фото, цены, три языка. Меняете позиции сами, без перепечатки.", en: "A menu behind a QR code on the table: photos, prices, three languages. Change items yourself, no reprinting." } },
  { cat: "web", ...item("redesign"), short: { ru: "Современный дизайн и быстрая загрузка старого сайта.", en: "A modern design and fast loading for an old site." }, text: { ru: "Обновлю старый сайт: современный дизайн, удобство на телефоне, быстрая загрузка.", en: "I refresh an old site: a modern design, comfortable on phones, fast to load." } },
  { cat: "sup", ...item("seo"), short: { ru: "Поиск Google и Яндекс, Google Maps, Яндекс Карты, 2GIS.", en: "Google and Yandex search, Google Maps, Yandex Maps, 2GIS." }, text: { ru: "Чтобы вас находили: настройка поиска Google и Яндекс, карточки в Google Maps, Яндекс Картах и 2GIS.", en: "So people find you: Google and Yandex search setup, listings on Google Maps, Yandex Maps and 2GIS." } },
  { cat: "sup", ...item("support"), short: { ru: "Домен, хостинг, правки и резервные копии.", en: "Domain, hosting, edits and backups." }, text: { ru: "Домен, хостинг, обновления, правки текстов и цен, резервные копии. Вы занимаетесь бизнесом, сайт работает.", en: "Domain, hosting, updates, text and price edits, backups. You run the business, the site keeps working." } },
];

/* The old portfolio has no named packages, only per-service prices.
   These three are its main service lines; features are its own wording. */
export const packages = [
  {
    title: { ru: "Сайт-визитка и лендинг", en: "Business site and landing page" },
    price: price("bizsite"), term: term("bizsite"),
    items: [
      { ru: "Меню, цены, адрес, карта", en: "Menu, prices, address, map" },
      { ru: "Кнопки звонка и Telegram", en: "Call and Telegram buttons" },
      { ru: "Быстро открывается с телефона", en: "Opens fast on a phone" },
    ],
  },
  {
    title: { ru: "Интернет-магазин и каталог", en: "Online store and catalog" }, hot: true,
    price: price("store"), term: term("store"),
    items: [
      { ru: "Каталог с фильтрами и поиском", en: "A catalog with filters and search" },
      { ru: "Корзина и оформление заказа", en: "A cart and checkout" },
      { ru: "Заявки в Telegram", en: "Orders delivered to Telegram" },
    ],
  },
  {
    title: { ru: "Админ-панель", en: "Admin panel" },
    price: price("admin"), term: term("admin"),
    items: [
      { ru: "Меняйте товары, цены, фото и тексты сами", en: "Change products, prices, photos and texts yourself" },
      { ru: "Без программиста", en: "No developer needed" },
      { ru: "На любом из трёх языков", en: "In any of three languages" },
    ],
  },
];

export const faq = [
  { q: { ru: "Сколько стоит сайт?", en: "How much does a website cost?" }, a: { ru: `Простой сайт-визитка от $${usd("bizsite")}, магазин от $${usd("store")}. Цена зависит от количества страниц, языков и интеграций. Точную сумму называю после 15-минутного разговора, до начала работы.`, en: `A simple business site starts at $${usd("bizsite")}, a store at $${usd("store")}. The price depends on pages, languages and integrations. I give the exact amount after a 15-minute chat, before any work starts.` } },
  { q: { ru: "Как быстро будет готово?", en: "How fast will it be ready?" }, a: { ru: `Лендинг обычно за неделю, магазин за ${term("store").ru}. Первый экран вы увидите уже через 2–3 дня.`, en: `A landing page usually takes a week, a store ${term("store").en}. You see the first screen in 2–3 days.` } },
  { q: { ru: "Это не готовый шаблон?", en: "Isn't it just a template?" }, a: { ru: "Нет. Дизайн, структура и каждое решение мои, каждый проект делаю с чистого листа и проверяю вручную на реальных телефонах. Посмотрите демо в проектах: среди них нет двух похожих.", en: "No. The design, structure and every decision are mine: every project starts from a blank page, and I test it by hand on real phones. Look at the demos in Projects: no two are alike." } },
  { q: { ru: "Нужны ли мне хостинг и домен?", en: "Do I need hosting and a domain?" }, a: { ru: "Помогу с обоими. Многие сайты можно бесплатно разместить на GitHub Pages или Cloudflare. Домен .uz или .com стоит примерно $10–20 в год.", en: "I help with both. Many sites can be hosted for free on GitHub Pages or Cloudflare. A .uz or .com domain costs about $10–20 a year." } },
  { q: { ru: "Можно принимать оплату через Click или Payme?", en: "Can I accept Click or Payme payments?" }, a: { ru: "Да. Подключаю Click, Payme и Uzum. Для этого нужен договор вашего бизнеса с платёжной системой, подскажу, как его оформить.", en: "Yes. I connect Click, Payme and Uzum. Your business needs a contract with the payment provider, and I explain how to get one." } },
  { q: { ru: "Сайт будет на узбекском?", en: "Will the site be in Uzbek?" }, a: { ru: "Да, если нужно. Обычно делаю три языка: русский, узбекский и английский, с переключателем, который запоминает выбор.", en: "Yes, if you need it. I usually build three languages, Russian, Uzbek and English, with a switcher that remembers the choice." } },
  { q: { ru: "Что, если потом нужно что-то поменять?", en: "What if I need changes later?" }, a: { ru: "Пишите в Telegram. Мелкие правки делаю быстро, а с админ-панелью цены, фото и тексты вы меняете сами.", en: "Message me on Telegram. Small edits are quick, and with an admin panel you change prices, photos and texts yourself." } },
];

export const skills = [
  { key: "skills.front", items: ["HTML", "CSS", "JavaScript", "GSAP", "WebGL", "Vite", "IndexedDB"] },
  { key: "skills.back", items: ["Python", "FastAPI", "Telegram Bot API", "Click · Payme · Uzum"] },
  { key: "skills.launch", items: ["SEO", "Google Maps · 2GIS", "RU · UZ · EN", "Mobile-first", "GitHub Pages"] },
];
