"use strict";

const fs = require("fs");
const path = require("path");

const { T } = require("../content/i18n");
const { firm, routes, LANGS } = require("../content/data");

/* --------------------------------------------------------------- helpers */
const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const attr = (s) => esc(s);

/** Build a path for a named route in a given language. */
function url(lang, key, extra) {
  const slug = routes[key] != null ? routes[key][lang] : key;
  const parts = ["/" + lang];
  if (slug) parts.push(slug);
  if (extra) parts.push(extra);
  return parts.join("/").replace(/\/+$/, "") || "/" + lang;
}

const LANG_LABEL = { tr: "Türkçe", en: "English", de: "Deutsch" };
const LANG_SHORT = { tr: "TR", en: "EN", de: "DE" };
const HTML_LANG = { tr: "tr", en: "en", de: "de" };

/* --------------------------------------------------------------- icons */
const icon = {
  arrow: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg class="chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 4l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true"><circle cx="7.3" cy="7.3" r="5.3" stroke="currentColor" stroke-width="1.5"/><path d="M11.4 11.4L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  mail: '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="1.5" y="3.5" width="15" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 5l7 5 7-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 3.8c0-.7.6-1.3 1.3-1.3h1.9c.5 0 1 .4 1.1.9l.7 2.7c.1.4 0 .9-.4 1.1l-1.3.9a10 10 0 004.6 4.6l.9-1.3c.3-.3.7-.5 1.1-.4l2.7.7c.5.1.9.6.9 1.1v1.9c0 .7-.6 1.3-1.3 1.3A12.7 12.7 0 013 3.8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  pin: '<svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 16s5.5-4.6 5.5-9A5.5 5.5 0 003.5 7c0 4.4 5.5 9 5.5 9z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="9" cy="7" r="2" stroke="currentColor" stroke-width="1.4"/></svg>',
  doc: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 2h6l4 4v10H4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M10 2v4h4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  dl: '<svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 2v9m0 0l3.2-3.2M9 11L5.8 7.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 13v1.5A1.5 1.5 0 004.5 16h9a1.5 1.5 0 001.5-1.5V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  li: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.4 5.3h2.2V13H3.4zM4.5 1.9a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6zM7.2 5.3h2.1v1.05h.03c.3-.55 1.02-1.13 2.1-1.13 2.24 0 2.65 1.4 2.65 3.24V13h-2.2V8.9c0-.98-.02-2.24-1.4-2.24-1.4 0-1.6 1.06-1.6 2.16V13H7.2z"/></svg>',
};

/* --------------------------------------------------------------- logo
   The firm's own mark, traced from logosabaozmen.png into a single 448-byte
   path (least-squares circle + two wedges punched with fill-rule="evenodd",
   clipped to the disc analytically so no <clipPath> id is needed). 98.9%
   identical to the source PNG and crisp at any size.
   `logo__mark-p` is the only painted element, so one class inverts the mark. */
const logoMark = (() => {
  const svg = fs.readFileSync(path.join(__dirname, "mark.inline.txt"), "utf8").trim();
  return (cls) => (cls ? svg.replace('class="logo__mark"', `class="logo__mark ${cls}"`) : svg);
})();

/* The wordmark is set live in Cormorant rather than shipped as the supplied
   887x181 raster, which blurred as soon as it was scaled. "AVUKATLIK
   ORTAKLIĞI" stays Turkish in every language — it is part of the registered
   mark, not interface copy. */
function logo(lang, opts) {
  const o = opts || {};
  return `<a class="logo ${o.cls || ""}" href="${url(lang, "home")}" aria-label="${attr(firm.name[lang])}">
    ${logoMark()}
    <span class="logo__txt" aria-hidden="true">
      <span class="logo__name">SABA ÖZMEN</span>
      <span class="logo__rule"></span>
      <span class="logo__sub">AVUKATLIK ORTAKLIĞI</span>
    </span>
  </a>`;
}

/* --------------------------------------------------------------- nav model */
function navModel(lang) {
  return [
    { key: "home", href: url(lang, "home"), label: T("nav.home", lang) },
    {
      key: "corporate", label: T("nav.corporate", lang),
      // The live site links this to "https://www.sabaozmen.av.tr/javascript:" in
      // all three languages (v4 §3.3 / evidence #8). Here it points at a real page.
      href: url(lang, "about"),
      children: [
        { key: "about",   href: url(lang, "about"),   label: T("nav.about", lang) },
        { key: "vision",  href: url(lang, "vision"),  label: T("nav.vision", lang) },
        { key: "quality", href: url(lang, "quality"), label: T("nav.quality", lang) },
        { key: "career",  href: url(lang, "career"),  label: T("nav.career", lang) },
      ],
    },
    { key: "areas",    href: url(lang, "areas"),    label: T("nav.areas", lang) },
    { key: "team",     href: url(lang, "team"),     label: T("nav.team", lang) },
    { key: "articles", href: url(lang, "articles"), label: T("nav.articles", lang) },
    { key: "events",   href: url(lang, "events"),   label: T("nav.events", lang) },
    { key: "contact",  href: url(lang, "contact"),  label: T("nav.contact", lang) },
  ];
}

/* --------------------------------------------------------------- header */
function header(lang, active, altPaths) {
  const nav = navModel(lang);

  const navHtml = nav.map((n) => {
    const cur = n.key === active || (n.children || []).some((c) => c.key === active);
    if (!n.children) {
      return `<div class="nav__item"><a class="nav__link" href="${n.href}"${cur ? ' aria-current="page"' : ""}>${esc(n.label)}</a></div>`;
    }
    return `<div class="nav__item">
      <a class="nav__link" href="${n.href}"${cur ? ' aria-current="page"' : ""}>${esc(n.label)}${icon.chev}</a>
      <div class="nav__menu">${n.children.map((c) => `<a href="${c.href}">${esc(c.label)}</a>`).join("")}</div>
    </div>`;
  }).join("");

  const langHtml = LANGS.map((l) =>
    `<a href="${(altPaths && altPaths[l]) || ("/" + l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ""}>${LANG_LABEL[l]}<span>${LANG_SHORT[l]}</span></a>`
  ).join("");

  const drawer = nav.map((n) => {
    if (!n.children) return `<a href="${n.href}">${esc(n.label)}</a>`;
    return `<div class="drawer__group-t">${esc(n.label)}</div><div class="sub">${n.children.map((c) => `<a href="${c.href}">${esc(c.label)}</a>`).join("")}</div>`;
  }).join("");

  return `
<a class="skip" href="#main">${esc(T("nav.skip", lang))}</a>
<header class="hdr">
  <div class="wrap hdr__in">
    ${logo(lang)}
    <nav class="nav" aria-label="${esc(T("nav.menu", lang))}">${navHtml}</nav>
    <div class="hdr__act">
      <div class="lang">
        <button class="lang__btn" type="button" aria-expanded="false" aria-haspopup="true">
          <span>${LANG_SHORT[lang]}</span>${icon.chev}
        </button>
        <div class="lang__menu">${langHtml}</div>
      </div>
      <a class="btn btn--primary hdr__cta" href="${url(lang, "contact")}">${esc(T("cta.contactShort", lang))}</a>
      <button class="burger" type="button" aria-expanded="false" aria-label="${esc(T("nav.menu", lang))}" aria-controls="drawer">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer">
  <div>${drawer}</div>
  <div class="btn-row mt-4"><a class="btn btn--primary" href="${url(lang, "contact")}">${esc(T("cta.contact", lang))}</a></div>
</div>`;
}

/* --------------------------------------------------------------- footer */
function footer(lang) {
  const y = new Date().getFullYear();
  const a = firm.address;
  return `
<footer class="ftr">
  <div class="wrap">
    <div class="ftr__grid">
      <div class="ftr__brand">
        ${logo(lang)}
        <p class="ftr__about">${esc(T("ftr.about", lang))}</p>
        <div class="social">
          <a href="${firm.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${esc(T("ftr.linkedin", lang))}">${icon.li}</a>
        </div>
      </div>
      <div>
        <h4>${esc(T("ftr.explore", lang))}</h4>
        <ul>
          <li><a href="${url(lang, "areas")}">${esc(T("nav.areas", lang))}</a></li>
          <li><a href="${url(lang, "team")}">${esc(T("nav.team", lang))}</a></li>
          <li><a href="${url(lang, "articles")}">${esc(T("nav.articles", lang))}</a></li>
          <li><a href="${url(lang, "events")}">${esc(T("nav.events", lang))}</a></li>
          <li><a href="${url(lang, "contact")}">${esc(T("nav.contact", lang))}</a></li>
        </ul>
      </div>
      <div>
        <h4>${esc(T("ftr.corporate", lang))}</h4>
        <ul>
          <li><a href="${url(lang, "about")}">${esc(T("nav.about", lang))}</a></li>
          <li><a href="${url(lang, "vision")}">${esc(T("nav.vision", lang))}</a></li>
          <li><a href="${url(lang, "quality")}">${esc(T("nav.quality", lang))}</a></li>
          <li><a href="${url(lang, "career")}">${esc(T("nav.career", lang))}</a></li>
        </ul>
      </div>
      <div>
        <h4>${esc(T("ftr.contact", lang))}</h4>
        <ul>
          <li><a href="tel:${firm.phones[0].replace(/[^\d+]/g, "")}">${esc(firm.phones[0])}</a></li>
          <li><a href="mailto:${firm.emails.general}">${esc(firm.emails.general)}</a></li>
          <li style="margin-top:.35rem;line-height:1.55">${esc(a.street)}<br>${esc(a.district)}</li>
        </ul>
      </div>
    </div>
    <div class="ftr__bottom">
      <span>© ${y} ${esc(firm.name[lang])}. ${esc(T("ftr.rights", lang))}</span>
      <span class="ftr__legal">
        <a href="${url(lang, "privacy")}">${esc(T("legal.privacy", lang))}</a>
        <a href="${url(lang, "cookies")}">${esc(T("legal.cookies", lang))}</a>
      </span>
    </div>
  </div>
</footer>

<div class="cookie" role="dialog" aria-live="polite" aria-label="${esc(T("ck.title", lang))}">
  <h4>${esc(T("ck.title", lang))}</h4>
  <p>${esc(T("ck.body", lang))} <a class="ul-link" href="${url(lang, "cookies")}">${esc(T("ck.details", lang))}</a></p>
  <div class="btn-row">
    <button class="btn btn--primary" type="button" data-consent="all">${esc(T("ck.accept", lang))}</button>
    <button class="btn btn--ghost" type="button" data-consent="necessary">${esc(T("ck.reject", lang))}</button>
  </div>
</div>`;
}

/* --------------------------------------------------------------- document */
/**
 * @param {object} o
 *  lang, title, description, path, active, body, altPaths, jsonLd, ogType,
 *  bodyClass, progress
 */
function page(o) {
  const lang = o.lang;
  const origin = o.origin || "";
  const canonical = origin + o.path;

  // hreflang alternates for all three languages plus x-default (v4: the live
  // site has canonical but the EN/DE descriptions are just the firm name)
  const alts = LANGS.map((l) =>
    `<link rel="alternate" hreflang="${l}" href="${attr(origin + ((o.altPaths && o.altPaths[l]) || "/" + l))}">`
  ).join("\n  ") +
  `\n  <link rel="alternate" hreflang="x-default" href="${attr(origin + ((o.altPaths && o.altPaths.tr) || "/tr"))}">`;

  const ogImg = origin + "/img/og.png";
  const title = o.title;
  const desc = o.description;

  const ld = (o.jsonLd || []).map(
    (j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`
  ).join("\n  ");

  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}">
  <link rel="canonical" href="${attr(canonical)}">
  ${alts}

  <meta property="og:type" content="${o.ogType || "website"}">
  <meta property="og:site_name" content="${attr(firm.name[lang])}">
  <meta property="og:locale" content="${lang === "tr" ? "tr_TR" : lang === "de" ? "de_DE" : "en_GB"}">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(desc)}">
  <meta property="og:url" content="${attr(canonical)}">
  <meta property="og:image" content="${attr(ogImg)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${attr(desc)}">
  <meta name="twitter:image" content="${attr(ogImg)}">

  <meta name="theme-color" content="#a01944">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <!-- Scroll-reveal hides content until it animates in; gate that on JS being
       alive so a script failure can never leave the page blank. -->
  <script>document.documentElement.className+=" js";</script>
  <link rel="preload" as="style" href="/css/main.css">
  <link rel="stylesheet" href="/css/main.css">
</head>
<body class="${o.bodyClass || ""}">
${o.progress ? '<div class="progress" aria-hidden="true"></div>' : ""}
${header(lang, o.active, o.altPaths)}
<main id="main">
${o.body}
</main>
${footer(lang)}
${ld}
<script src="/js/main.js" defer></script>
</body>
</html>`;
}

module.exports = { page, header, footer, logo, logoMark, icon, url, esc, attr, navModel, LANG_LABEL, LANG_SHORT };
