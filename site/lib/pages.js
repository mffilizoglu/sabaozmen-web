"use strict";

const { T } = require("../content/i18n");
const D = require("../content/data");
const { firm, areas, pages: P, home: H } = D;
const store = require("./store");
const L = require("./layout");
const { esc, attr, url, icon } = L;

const ART = require("../content/articles.json");
const ARTICLES = ART.articles;
const TAGS = ART.tags;
const TAG_BY = Object.fromEntries(TAGS.map((t) => [t.slug, t]));

/* Topic labels in EN/DE. Turkish comes from the extraction. */
const TAG_I18N = {
  "kat-mulkiyeti": { en: "Condominium Ownership", de: "Wohnungseigentum" },
  "arsa-payi": { en: "Land-Share Construction", de: "Grundstücksanteil-Bau" },
  "kentsel-donusum": { en: "Urban Transformation", de: "Stadterneuerung" },
  "tapu-tescil": { en: "Land Registry", de: "Grundbuch" },
  "ipotek-rehin": { en: "Mortgage & Pledge", de: "Hypothek & Pfandrecht" },
  "intifa": { en: "Usufruct & Limited Rights", de: "Nießbrauch & beschränkte Rechte" },
  "kooperatif": { en: "Cooperatives", de: "Genossenschaften" },
  "kamulastirma": { en: "Expropriation & Zoning", de: "Enteignung & Bauplanung" },
  "payli-mulkiyet": { en: "Co-ownership & Partition", de: "Miteigentum & Teilung" },
  "sozlesmeler": { en: "Contract Law", de: "Vertragsrecht" },
  "tarim-arazi": { en: "Agricultural Land", de: "Landwirtschaftsflächen" },
  "miras-aile": { en: "Inheritance & Family", de: "Erb- & Familienrecht" },
  "icra-iflas": { en: "Enforcement & Bankruptcy", de: "Vollstreckung & Insolvenz" },
  "tuketici": { en: "Consumer Law", de: "Verbraucherrecht" },
  "yargi-elestirisi": { en: "Case-Law Critique", de: "Rechtsprechungskritik" },
  "devre-mulk": { en: "Timeshare", de: "Teilzeitwohnrecht" },
  "noterlik": { en: "Notarial Practice", de: "Notarielle Praxis" },
  "meslek": { en: "Profession & Legal Education", de: "Beruf & Juristenausbildung" },
  "vekalet": { en: "Agency & Power of Attorney", de: "Vertretung & Vollmacht" },
  "orman": { en: "Forestry & 2-B Land", de: "Forst & 2-B-Flächen" },
};

const tagLabel = (slug, lang) =>
  lang === "tr" ? (TAG_BY[slug] ? TAG_BY[slug].tr : slug)
                : (TAG_I18N[slug] ? TAG_I18N[slug][lang] : (TAG_BY[slug] ? TAG_BY[slug].tr : slug));

/* --------------------------------------------------------------- utilities */
const MONTHS = {
  tr: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  de: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
};

/** Render a partial date consistently. The live site prints three different
 *  formats on one page (v4 §3.11 / evidence #4); everything here uses one. */
function fmtDate(d, lang) {
  if (!d) return null;
  const p = d.split("-");
  const y = p[0];
  if (p.length === 1) return y;
  const m = MONTHS[lang][parseInt(p[1], 10) - 1];
  if (p.length === 2) return `${m} ${y}`;
  return lang === "tr" ? `${parseInt(p[2], 10)} ${m} ${y}` : `${parseInt(p[2], 10)} ${m} ${y}`;
}

const artTitle = (a, lang) => a.title[lang] || a.title.tr;
const artUrl = (a, lang) => url(lang, "articles", a.slug);
const areaUrl = (a, lang) => url(lang, "areas", a.slug);

function trunc(s, n) {
  if (!s) return "";
  s = String(s).replace(/\s+/g, " ").trim();
  return s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)) + "…";
}

/** Alternate-language paths, so the language switcher lands on the same page. */
function alts(key, extraByLang) {
  const o = {};
  D.LANGS.forEach((l) => { o[l] = url(l, key, extraByLang ? extraByLang[l] : undefined); });
  return o;
}

/* --------------------------------------------------------------- shared bits */
function phero(lang, o) {
  const crumbs = (o.crumbs || []).map((c, i, arr) =>
    (c.href && i < arr.length - 1)
      ? `<a href="${c.href}">${esc(c.label)}</a><span>/</span>`
      : `<span style="color:rgba(255,255,255,.85)">${esc(c.label)}</span>`
  ).join("");

  return `
<section class="phero">
  <div class="phero__bg" aria-hidden="true">${motif()}</div>
  <div class="wrap phero__in">
    ${crumbs ? `<nav class="crumb" aria-label="breadcrumb">${crumbs}</nav>` : ""}
    <h1 class="rv" data-stagger="off">${esc(o.title)}</h1>
    ${o.lede ? `<p class="rv" style="--d:90ms">${esc(o.lede)}</p>` : ""}
    ${o.extra || ""}
  </div>
</section>`;
}

/** Brand motif behind the heroes instead of stock photography: the firm's own
 *  disc-and-bands mark, tiled at very low contrast. */
function motif() {
  return `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 600" aria-hidden="true" style="position:absolute;inset:0">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#5c0e26"/><stop offset="55%" stop-color="#20181a"/><stop offset="100%" stop-color="#14100f"/>
      </linearGradient>
      <pattern id="pt" width="190" height="190" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="#fff" stroke-opacity=".055" stroke-width="1.6">
          <circle cx="95" cy="95" r="46"/>
          <path d="M52 79h86M50 96h90"/>
        </g>
      </pattern>
      <radialGradient id="gl" cx="18%" cy="8%" r="70%">
        <stop offset="0" stop-color="#a01944" stop-opacity=".42"/><stop offset="1" stop-color="#a01944" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="600" fill="url(#g1)"/>
    <rect width="1200" height="600" fill="url(#pt)"/>
    <rect width="1200" height="600" fill="url(#gl)"/>
  </svg>`;
}

function areaCard(a, lang, i) {
  return `<a class="card rv" href="${areaUrl(a, lang)}">
    <div class="card__num">${String(i + 1).padStart(2, "0")}</div>
    <h3 class="card__t">${esc(a.name[lang])}</h3>
    <p class="card__d">${esc(trunc(a.desc[lang], 132))}</p>
    <span class="card__more">${esc(T("cta.more", lang))} ${icon.arrow}</span>
  </a>`;
}

function artItem(a, lang) {
  const d = fmtDate(a.date, lang);
  const searchBlob = [
    a.title.tr, a.title.en, a.title.de, a.coAuthor, a.journal,
    (a.keywords.tr || []).join(" "), a.topics.map((t) => tagLabel(t, lang)).join(" "),
  ].filter(Boolean).join(" ");

  return `<li class="art-item" data-topics="${attr(a.topics.join(" "))}" data-search="${attr(searchBlob)}">
    <a class="art-link" href="${artUrl(a, lang)}">
      <div class="art-date${d ? "" : " art-date--none"}">${esc(d || T("art.noDate", lang))}</div>
      <div>
        <h3 class="art-t">${esc(artTitle(a, lang))}</h3>
        <div class="art-meta">
          ${a.coAuthor ? `<span><b>${esc(a.coAuthor)}</b> ${lang === "tr" ? "ile" : lang === "de" ? "mit" : "with"}</span>` : ""}
          ${a.journal ? `<span>${esc(a.journal)}</span>` : ""}
          ${a.topics.slice(0, 2).map((t) => `<span class="tag">${esc(tagLabel(t, lang))}</span>`).join("")}
        </div>
      </div>
      <span class="art-go">${icon.arrow}</span>
    </a>
  </li>`;
}

/* =========================================================================
   HOME
   ========================================================================= */
function home(lang, origin) {
  const featured = areas.filter((a) => a.featured).slice(0, 6);
  const recent = ARTICLES.filter((a) => a.date).slice(0, 5);

  const body = `
<section class="hero">
  <div class="hero__bg">${motif()}</div>
  <div class="wrap hero__in">
    <p class="eyebrow hero__eyebrow rv-h">${esc(H.eyebrow[lang])}</p>
    <h1 class="rv-h">${esc(H.h1[lang])}</h1>
    <blockquote class="hero__quote rv-h">
      <p>${esc(H.quote[lang])}</p>
      <cite>${esc(H.quoteBy)}</cite>
    </blockquote>
    <p class="hero__lede rv-h">${esc(H.lede[lang])}</p>
    <div class="btn-row rv-h">
      <a class="btn btn--primary" href="${url(lang, "areas")}">${esc(T("nav.areas", lang))} ${icon.arrow}</a>
      <a class="btn btn--onDark" href="${url(lang, "articles")}">${esc(T("nav.articles", lang))}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split">
      <div>
        <p class="eyebrow rv">${esc(H.aboutHeading[lang])}</p>
        <h2 class="rv">${esc(P.about.lead[lang])}</h2>
        <div class="lede mt-3 rv"><p>${esc(P.about.body[lang][0])}</p></div>
        <div class="btn-row mt-4 rv">
          <a class="btn btn--ghost" href="${url(lang, "about")}">${esc(T("cta.more", lang))} ${icon.arrow}</a>
        </div>
      </div>
      <div class="split__aside">
        <div class="aside-card rv">
          <h3>${esc(T("art.details", lang))}</h3>
          <table class="meta-table">
            <tr><th>${lang === "tr" ? "Kuruluş" : lang === "de" ? "Gegründet" : "Founded"}</th><td>${firm.founded}</td></tr>
            <tr><th>${lang === "tr" ? "Baro" : lang === "de" ? "Kammer" : "Bar"}</th><td>${esc(firm.bar[lang])}</td></tr>
            <tr><th>${esc(T("label.address", lang))}</th><td>${esc(firm.address.street)}<br>${esc(firm.address.district)}</td></tr>
            <tr><th>${esc(T("label.phone", lang))}</th><td><a href="tel:${firm.phones[0].replace(/[^\d+]/g, "")}">${esc(firm.phones[0])}</a></td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="stats">
      ${H.stats.map((s) => `<div class="stat rv">
        <div class="stat__n"${s.count === false ? "" : ` data-countto="${s.n}" data-suffix="${attr(s.suffix)}"`}>${s.n}</div>
        <div class="stat__l">${esc(s.l[lang])}</div>
      </div>`).join("")}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow rv">${esc(T("home.areasTitle", lang))}</p>
      <h2 class="rv">${esc(T("home.areasLede", lang))}</h2>
    </div>
    <div class="grid grid--3">${featured.map((a, i) => areaCard(a, lang, i)).join("")}</div>
    <div class="btn-row mt-4 rv"><a class="btn btn--ghost" href="${url(lang, "areas")}">${esc(T("cta.all", lang))} ${icon.arrow}</a></div>
  </div>
</section>

<section class="section section--sand">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow rv">${esc(T("home.articlesTitle", lang))}</p>
      <h2 class="rv">${esc(T("home.articlesLede", lang))}</h2>
    </div>
    <ul class="art-list rv">${recent.map((a) => artItem(a, lang)).join("")}</ul>
    <div class="btn-row mt-4 rv"><a class="btn btn--ghost" href="${url(lang, "articles")}">${esc(T("cta.all", lang))} ${icon.arrow}</a></div>
  </div>
</section>`;

  return {
    body,
    title: `${firm.name[lang]} — ${H.h1[lang]}`,
    description: trunc(H.lede[lang], 175),
    active: "home",
    altPaths: alts("home"),
    jsonLd: [legalServiceLd(lang, origin)],
  };
}

/* =========================================================================
   CORPORATE PAGES
   ========================================================================= */
function about(lang) {
  const p = P.about;
  const body = phero(lang, {
    title: p.title[lang], lede: p.lead[lang],
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: p.title[lang] }],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="doc">
        ${p.body[lang].map((x) => `<p class="rv">${esc(x)}</p>`).join("")}
        <blockquote class="quote mt-4 rv"><p>${esc(D.home.quote[lang])}</p><cite>${esc(D.home.quoteBy)}</cite></blockquote>
      </div>
      <div class="split__aside">
        <div class="aside-card rv">
          <h3>${esc(T("art.details", lang))}</h3>
          <table class="meta-table">
            <tr><th>${lang === "tr" ? "Kuruluş" : lang === "de" ? "Gegründet" : "Founded"}</th><td>${firm.founded}</td></tr>
            <tr><th>${lang === "tr" ? "Baro" : lang === "de" ? "Kammer" : "Bar"}</th><td>${esc(firm.bar[lang])}</td></tr>
            <tr><th>${lang === "tr" ? "Unvan" : lang === "de" ? "Bezeichnung" : "Title"}</th><td>${esc(firm.name[lang])}</td></tr>
            <tr><th>${esc(T("label.address", lang))}</th><td>${esc(firm.address.street)}<br>${esc(firm.address.district)}</td></tr>
          </table>
          <div class="btn-row mt-3"><a class="btn btn--primary" href="${url(lang, "contact")}">${esc(T("cta.contact", lang))}</a></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

  return { body, title: `${p.title[lang]} — ${firm.name[lang]}`,
    description: trunc(p.body[lang][2], 175), active: "about", altPaths: alts("about") };
}

function vision(lang) {
  const p = P.vision;
  const body = phero(lang, {
    title: p.title[lang], lede: p.lead[lang],
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: T("nav.corporate", lang), href: url(lang, "about") }, { label: p.title[lang] }],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="grid grid--2">
      ${p.blocks.map((b) => `<div class="card rv" style="padding:clamp(1.75rem,3vw,2.5rem)">
        <h3 class="card__t" style="font-size:1.4rem;margin-bottom:.9rem">${esc(b.h[lang])}</h3>
        <p class="card__d" style="font-size:1rem">${esc(b.p[lang])}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;
  return { body, title: `${p.title[lang]} — ${firm.name[lang]}`,
    description: trunc(p.blocks[0].p[lang], 175), active: "vision", altPaths: alts("vision") };
}

function quality(lang) {
  const p = P.quality;
  const body = phero(lang, {
    title: p.title[lang], lede: p.lead[lang],
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: T("nav.corporate", lang), href: url(lang, "about") }, { label: p.title[lang] }],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="grid grid--3">
      ${p.list[lang].map((x, i) => `<div class="card rv">
        <div class="card__num">${String(i + 1).padStart(2, "0")}</div>
        <h3 class="card__t" style="font-size:1.05rem">${esc(x)}</h3>
      </div>`).join("")}
    </div>
  </div>
</section>`;
  return { body, title: `${p.title[lang]} — ${firm.name[lang]}`,
    description: trunc(p.lead[lang], 175), active: "quality", altPaths: alts("quality") };
}

function career(lang) {
  const p = P.career;
  const body = phero(lang, {
    title: p.title[lang], lede: p.lead[lang],
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: T("nav.corporate", lang), href: url(lang, "about") }, { label: p.title[lang] }],
  }) + `
<section class="section">
  <div class="wrap wrap-narrow">
    <div class="doc">
      ${p.body[lang].map((x) => `<p class="rv">${esc(x)}</p>`).join("")}
      <div class="aside-card mt-4 rv">
        <h3>${esc(T("label.email", lang))}</h3>
        <p style="margin:0">${esc(p.cta[lang])}</p>
        <div class="btn-row mt-3"><a class="btn btn--primary" href="mailto:${firm.emails.general}">${esc(firm.emails.general)}</a></div>
      </div>
    </div>
  </div>
</section>`;
  return { body, title: `${p.title[lang]} — ${firm.name[lang]}`,
    description: trunc(p.lead[lang], 175), active: "career", altPaths: alts("career") };
}

/* =========================================================================
   PRACTICE AREAS
   ========================================================================= */
function areaList(lang) {
  const body = phero(lang, {
    title: T("nav.areas", lang), lede: T("areas.lede", lang),
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: T("nav.areas", lang) }],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="grid grid--3">${areas.map((a, i) => areaCard(a, lang, i)).join("")}</div>
  </div>
</section>`;
  return { body, title: `${T("nav.areas", lang)} — ${firm.name[lang]}`,
    description: trunc(T("areas.lede", lang), 175), active: "areas", altPaths: alts("areas") };
}

function areaDetail(lang, area) {
  // Articles whose topics overlap this area, matched by slug keyword.
  const map = {
    "kat-mulkiyeti-hukuku": ["kat-mulkiyeti"],
    "gayrimenkul-hukuku-ve-kentsel-donusum": ["kentsel-donusum", "tapu-tescil"],
    "insaat-hukuku": ["arsa-payi"],
    "toplu-yapilarda-yonetim-plani": ["kat-mulkiyeti"],
    "sozlesmeler-hukuku": ["sozlesmeler"],
    "kooperatifler-hukuku": ["kooperatif"],
    "kamulastirma-hukuku": ["kamulastirma"],
    "imar-hukuku": ["kamulastirma"],
    "kadastro-hukuku": ["tapu-tescil"],
    "barter-mortgage-tasinmaz-rehni-ve-ipotek": ["ipotek-rehin"],
    "icra-ve-iflas-hukuku": ["icra-iflas"],
    "miras-hukuku": ["miras-aile"],
    "aile-hukuku": ["miras-aile"],
    "tuketici-hukuku": ["tuketici"],
    "devre-mulk-ve-devre-tatil-hukuku": ["devre-mulk"],
    "orman-hukuku-ve-2b": ["orman", "tarim-arazi"],
  };
  const topics = map[area.slug] || [];
  const related = ARTICLES.filter((a) => a.topics.some((t) => topics.includes(t))).slice(0, 6);
  const others = areas.filter((a) => a.slug !== area.slug).slice(0, 8);

  const body = phero(lang, {
    title: area.name[lang],
    crumbs: [
      { label: T("nav.home", lang), href: url(lang, "home") },
      { label: T("nav.areas", lang), href: url(lang, "areas") },
      { label: area.name[lang] },
    ],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="doc">
        <p class="lede rv">${esc(area.desc[lang])}</p>
        ${related.length ? `
        <h2 class="mt-4 rv">${esc(T("areas.related", lang))}</h2>
        <ul class="art-list rv">${related.map((a) => artItem(a, lang)).join("")}</ul>` : ""}
        <div class="btn-row mt-4 rv"><a class="btn btn--primary" href="${url(lang, "contact")}">${esc(T("cta.contact", lang))} ${icon.arrow}</a></div>
      </div>
      <div class="split__aside">
        <div class="aside-card rv">
          <h3>${esc(T("areas.other", lang))}</h3>
          <ul style="list-style:none;margin:0;padding:0;display:grid;gap:.6rem">
            ${others.map((a) => `<li><a class="ul-link" style="color:var(--ink-2);font-weight:400;font-size:.9rem" href="${areaUrl(a, lang)}">${esc(a.name[lang])}</a></li>`).join("")}
          </ul>
          <div class="btn-row mt-3"><a class="btn btn--ghost" href="${url(lang, "areas")}">${esc(T("cta.all", lang))}</a></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

  return {
    body,
    title: `${area.name[lang]} — ${firm.name[lang]}`,
    description: trunc(area.desc[lang], 175),
    active: "areas",
    altPaths: alts("areas", { tr: area.slug, en: area.slug, de: area.slug }),
  };
}

/* =========================================================================
   TEAM
   ========================================================================= */
function teamPage(lang) {
  const members = store.team.published();
  const pubCount = (m) => (m.articleSlugs || []).length;

  const body = phero(lang, {
    title: T("nav.team", lang), lede: T("team.lede", lang),
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: T("nav.team", lang) }],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="grid grid--team">
      ${members.map((m) => {
        const initials = m.name.replace(/(Prof\.|Dr\.|Av\.)\s*/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
        const n = pubCount(m);
        const role = (m.role && (m.role[lang] || m.role.tr)) || "";
        const acad = (m.academic && (m.academic[lang] || m.academic.tr)) || "";
        return `<article class="person rv">
          <a class="person__link" href="${url(lang, "team", m.slug)}">
            <div class="person__ph${m.photo ? "" : " person__ph--empty"}">
              ${m.photo
                ? `<img src="${attr(m.photo)}" alt="${attr(m.name)}" loading="lazy" width="450" height="600">`
                : `<span class="person__initials" aria-hidden="true">${esc(initials)}</span>`}
            </div>
            <h3 class="person__n">${esc(m.name)}</h3>
          </a>
          <p class="person__r">${esc(role)}</p>
          <div class="person__meta">
            ${acad ? `<span>${esc(acad)}</span>` : ""}
            ${m.email ? `<a href="mailto:${attr(m.email)}">${esc(m.email)}</a>` : ""}
            ${n ? `<a class="ul-link small mt-1" href="${url(lang, "team", m.slug)}">${n} ${esc(T("team.pubsCount", lang))}</a>` : ""}
          </div>
        </article>`;
      }).join("")}
    </div>
  </div>
</section>`;

  return { body, title: `${T("nav.team", lang)} — ${firm.name[lang]}`,
    description: trunc(T("team.lede", lang) + " " + members.map((m) => m.name).join(", "), 175),
    active: "team", altPaths: alts("team") };
}

/* =========================================================================
   ARTICLE ARCHIVE
   ========================================================================= */
function articleList(lang) {
  const counts = {};
  ARTICLES.forEach((a) => a.topics.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  const ordered = TAGS.filter((t) => counts[t.slug]).sort((a, b) => counts[b.slug] - counts[a.slug]);

  const body = phero(lang, {
    title: T("art.title", lang), lede: T("art.lede", lang),
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: T("art.title", lang) }],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="searchbar rv">
      ${icon.search}
      <label class="skip" for="artq">${esc(T("art.searchLbl", lang))}</label>
      <input id="artq" type="search" data-search placeholder="${attr(T("art.search", lang))}" autocomplete="off">
    </div>
    <div class="filters rv">
      ${ordered.map((t) => `<button class="chip" type="button" data-topic="${attr(t.slug)}" aria-pressed="false">${esc(tagLabel(t.slug, lang))}<span class="chip__n">${counts[t.slug]}</span></button>`).join("")}
    </div>
    <p class="small muted rv"><strong data-count>${ARTICLES.length}</strong> ${esc(T("art.count", lang))}</p>
    <ul class="art-list rv" data-archive>${ARTICLES.map((a) => artItem(a, lang)).join("")}</ul>
    <div class="empty" data-empty hidden>${esc(T("art.none", lang))}</div>
  </div>
</section>`;

  return { body, title: `${T("art.title", lang)} — ${firm.name[lang]}`,
    description: trunc(T("art.lede", lang), 175), active: "articles", altPaths: alts("articles") };
}

/* =========================================================================
   ARTICLE DETAIL
   ========================================================================= */
function articleDetail(lang, a, origin) {
  const d = fmtDate(a.date, lang);
  const authors = ["Prof. Dr. Etem Sabâ Özmen"].concat(a.coAuthor ? [a.coAuthor] : []);
  const related = ARTICLES.filter((x) => x.slug !== a.slug && x.topics.some((t) => a.topics.includes(t))).slice(0, 4);

  // Abstracts, in the order that serves the reader of THIS language: the
  // reader's own language first, the other one clearly labelled underneath.
  const block = (labelKey, text, noteKey) => `<div class="abstract rv">
      <h3>${esc(T(labelKey, lang))}</h3>
      ${noteKey ? `<p class="small muted" style="margin-bottom:.75rem">${esc(T(noteKey, lang))}</p>` : ""}
      <p>${esc(text)}</p>
    </div>`;

  const introNote = a.summarySource === "pdf-intro" ? "art.summaryIntro" : null;
  const parts = [];

  if (lang === "tr") {
    if (a.summary.tr) parts.push(block("art.abstract", a.summary.tr, introNote));
    if (a.summary.en) parts.push(block("art.abstractEn", a.summary.en));
  } else {
    // On an EN/DE page the English abstract leads; the Turkish one is labelled
    // as Turkish rather than presented as if the reader could read it.
    if (a.summary.en) parts.push(block("art.abstract", a.summary.en));
    if (a.summary.tr) parts.push(block("art.abstractTr", a.summary.tr, introNote));
  }
  if (!parts.length) parts.push(`<div class="note rv">${esc(T("art.summaryPending", lang))}</div>`);

  const summaryHtml = parts.join("\n");
  const enAbstract = "";

  const body = phero(lang, {
    title: artTitle(a, lang),
    crumbs: [
      { label: T("nav.home", lang), href: url(lang, "home") },
      { label: T("art.title", lang), href: url(lang, "articles") },
      { label: trunc(artTitle(a, lang), 60) },
    ],
    extra: `<div class="art-meta" style="margin-top:1.25rem;color:rgba(255,255,255,.7)">
        <span>${esc(authors.join(" · "))}</span>
        ${d ? `<span>${esc(d)}</span>` : ""}
        ${a.journal ? `<span>${esc(a.journal)}</span>` : ""}
      </div>`,
  }) + `
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="doc">
        ${summaryHtml}
        ${enAbstract}
        ${lang !== "tr" ? `<p class="small muted rv">${esc(T("art.langNoteTr", lang))}</p>` : ""}
        <div class="btn-row mt-4 rv">
          <a class="btn btn--primary" href="${attr(a.pdf)}" target="_blank" rel="noopener">${icon.doc} ${esc(T("art.readPdf", lang))}</a>
          <a class="btn btn--ghost" href="${attr(a.pdf)}" download>${icon.dl} ${esc(T("art.download", lang))}</a>
        </div>
        ${related.length ? `
        <hr class="divider">
        <h2 class="rv">${esc(T("art.related", lang))}</h2>
        <ul class="art-list rv">${related.map((x) => artItem(x, lang)).join("")}</ul>` : ""}
      </div>
      <div class="split__aside">
        <div class="aside-card rv">
          <h3>${esc(T("art.details", lang))}</h3>
          <table class="meta-table">
            <tr><th>${esc(T("art.authors", lang))}</th><td>${esc(authors.join(", "))}</td></tr>
            ${a.journal ? `<tr><th>${esc(T("art.journal", lang))}</th><td>${esc(a.journal)}${a.volume ? `, ${lang === "tr" ? "C." : "Vol."} ${esc(a.volume)}` : ""}${a.issue ? `, ${lang === "tr" ? "S." : "No."} ${esc(a.issue)}` : ""}</td></tr>` : ""}
            <tr><th>${esc(T("art.date", lang))}</th><td>${d ? esc(d) : `<span class="muted">${esc(T("art.noDate", lang))}</span>`}</td></tr>
            ${a.pages ? `<tr><th>${esc(T("art.pages", lang))}</th><td>${a.pages}</td></tr>` : ""}
            <tr><th>${esc(T("art.topics", lang))}</th><td>${a.topics.map((t) => `<span class="tag" style="margin:0 .25rem .25rem 0">${esc(tagLabel(t, lang))}</span>`).join("")}</td></tr>
          </table>
        </div>
        ${(a.keywords.tr && a.keywords.tr.length) ? `<div class="aside-card rv">
          <h3>${esc(T("art.keywords", lang))}</h3>
          <div>${a.keywords.tr.map((k) => `<span class="tag tag--muted" style="margin:0 .25rem .35rem 0">${esc(k)}</span>`).join("")}</div>
        </div>` : ""}
      </div>
    </div>
  </div>
</section>`;

  const desc = a.summary.tr
    ? trunc(a.summary.tr, 175)
    : trunc(`${artTitle(a, lang)} — ${authors.join(", ")}${a.journal ? ", " + a.journal : ""}.`, 175);

  return {
    body, progress: true,
    title: `${trunc(artTitle(a, lang), 70)} — ${firm.name[lang]}`,
    description: desc,
    active: "articles",
    ogType: "article",
    altPaths: alts("articles", { tr: a.slug, en: a.slug, de: a.slug }),
    jsonLd: [scholarlyLd(a, lang, origin, authors)],
  };
}

/* =========================================================================
   CONTACT
   ========================================================================= */
function contact(lang) {
  const a = firm.address;
  const body = phero(lang, {
    title: T("nav.contact", lang), lede: T("ct.lede", lang),
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: T("nav.contact", lang) }],
  }) + `
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="rv">
        <form data-contact action="/api/contact" method="post" novalidate
              data-sending="${attr(T("ct.sending", lang))}" data-error="${attr(T("ct.err", lang))}">
          <input type="hidden" name="lang" value="${lang}">
          <div style="display:none" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <div class="grid grid--2" style="gap:0 1.25rem">
            <div class="field">
              <label for="f-name">${esc(T("ct.name", lang))} <span class="req">*</span></label>
              <input id="f-name" name="name" type="text" required autocomplete="name">
              <span class="field__err">${esc(T("ct.required", lang))}</span>
            </div>
            <div class="field">
              <label for="f-mail">${esc(T("ct.email", lang))} <span class="req">*</span></label>
              <input id="f-mail" name="email" type="email" required autocomplete="email">
              <span class="field__err">${esc(T("ct.required", lang))}</span>
            </div>
            <div class="field">
              <label for="f-tel">${esc(T("ct.phone", lang))}</label>
              <input id="f-tel" name="phone" type="tel" autocomplete="tel">
            </div>
            <div class="field">
              <label for="f-sub">${esc(T("ct.subject", lang))}</label>
              <input id="f-sub" name="subject" type="text">
            </div>
          </div>
          <div class="field">
            <label for="f-msg">${esc(T("ct.message", lang))} <span class="req">*</span></label>
            <textarea id="f-msg" name="message" required></textarea>
            <span class="field__err">${esc(T("ct.required", lang))}</span>
          </div>
          <label class="consent">
            <input type="checkbox" name="consent" value="1" required>
            <span>${esc(T("ct.consent", lang))} <a class="ul-link" href="${url(lang, "privacy")}">${esc(T("legal.privacy", lang))}</a></span>
          </label>
          <button class="btn btn--primary" type="submit">${esc(T("ct.send", lang))} ${icon.arrow}</button>
          <div class="form-msg" data-formmsg hidden></div>
        </form>
      </div>
      <div class="split__aside">
        <div class="aside-card rv">
          <h3>${esc(T("nav.contact", lang))}</h3>
          <div class="contact-line">${icon.pin}<div><div class="contact-line__l">${esc(T("label.address", lang))}</div>
            <div class="contact-line__v">${esc(a.street)}<br>${esc(a.district)}<br>${esc(a.country[lang])}</div></div></div>
          <div class="contact-line">${icon.phone}<div><div class="contact-line__l">${esc(T("label.phone", lang))}</div>
            <div class="contact-line__v">${firm.phones.map((p) => `<a href="tel:${p.replace(/[^\d+]/g, "")}">${esc(p)}</a>`).join("<br>")}</div></div></div>
          <div class="contact-line">${icon.mail}<div><div class="contact-line__l">${esc(T("label.email", lang))}</div>
            <div class="contact-line__v"><a href="mailto:${firm.emails.general}">${esc(firm.emails.general)}</a><br>
            <a href="mailto:${firm.emails.office}">${esc(firm.emails.office)}</a> <span class="small muted">(${esc(T("ct.office", lang))})</span></div></div></div>
          <div class="contact-line"><span style="width:17px"></span><div><div class="contact-line__l">${esc(T("ct.hours", lang))}</div>
            <div class="contact-line__v">${esc(T("ct.hoursVal", lang))}</div></div></div>
          <div class="btn-row mt-3"><a class="btn btn--ghost" href="${firm.maps}" target="_blank" rel="noopener">${esc(T("ct.map", lang))} ${icon.arrow}</a></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

  return { body, title: `${T("nav.contact", lang)} — ${firm.name[lang]}`,
    description: trunc(`${T("ct.lede", lang)} ${a.street}, ${a.district}. ${firm.phones[0]}`, 175),
    active: "contact", altPaths: alts("contact") };
}

/* =========================================================================
   LEGAL PAGES — drafts, clearly marked
   ========================================================================= */
const LEGAL = require("../content/legal");

function legal(lang, which) {
  const doc = LEGAL[which][lang];
  const key = which === "privacy" ? "privacy" : "cookies";
  const body = phero(lang, {
    title: doc.title,
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") }, { label: doc.title }],
  }) + `
<section class="section">
  <div class="wrap wrap-narrow">
    <div class="note rv" style="margin-bottom:2.5rem"><strong>${esc(T("legal.draft", lang))}</strong></div>
    <div class="doc">
      ${doc.blocks.map((b) =>
        b.h ? `<h2 class="rv">${esc(b.h)}</h2>` + (b.p || []).map((x) => `<p class="rv">${x}</p>`).join("")
              + (b.ul ? `<ul class="rv">${b.ul.map((x) => `<li>${x}</li>`).join("")}</ul>` : "")
            : (b.p || []).map((x) => `<p class="rv">${x}</p>`).join("")
      ).join("")}
    </div>
  </div>
</section>`;
  return { body, title: `${doc.title} — ${firm.name[lang]}`,
    description: trunc(doc.blocks[0].p ? doc.blocks[0].p[0].replace(/<[^>]+>/g, "") : doc.title, 175),
    active: null, altPaths: alts(key) };
}

/* =========================================================================
   404
   ========================================================================= */
function notFound(lang) {
  const body = `
<section class="phero"><div class="phero__bg" aria-hidden="true">${motif()}</div>
  <div class="wrap phero__in">
    <h1>${esc(T("e404.title", lang))}</h1>
    <p>${esc(T("e404.body", lang))}</p>
    <div class="btn-row mt-3"><a class="btn btn--onDark" href="${url(lang, "home")}">${esc(T("e404.home", lang))} ${icon.arrow}</a></div>
  </div>
</section>`;
  return { body, title: `${T("e404.title", lang)} — ${firm.name[lang]}`,
    description: T("e404.body", lang), active: null, altPaths: alts("home") };
}

/* =========================================================================
   Structured data
   ========================================================================= */
function legalServiceLd(lang, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: firm.name[lang],
    url: origin + "/" + lang,
    foundingDate: String(firm.founded),
    email: firm.emails.general,
    telephone: firm.phones[0],
    image: origin + "/img/og.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: firm.address.street,
      addressLocality: "Kadıköy",
      addressRegion: "İstanbul",
      addressCountry: "TR",
    },
    sameAs: [firm.linkedin],
    areaServed: "TR",
    knowsLanguage: ["tr", "en", "de"],
    memberOf: { "@type": "Organization", name: firm.bar[lang] },
  };
}

function scholarlyLd(a, lang, origin, authors) {
  const o = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: artTitle(a, lang),
    inLanguage: "tr",
    author: authors.map((n) => ({ "@type": "Person", name: n })),
    url: origin + artUrl(a, lang),
    publisher: { "@type": "Organization", name: firm.name[lang] },
    associatedMedia: { "@type": "MediaObject", contentUrl: origin + a.pdf, encodingFormat: "application/pdf" },
  };
  if (a.date) o.datePublished = a.date;
  if (a.summary.tr) o.abstract = a.summary.tr;
  if (a.journal) o.isPartOf = { "@type": "Periodical", name: a.journal };
  if (a.keywords.tr && a.keywords.tr.length) o.keywords = a.keywords.tr.join(", ");
  return o;
}

const extra = require("./pages-extra");
extra.bind({ phero, motif, fmtDate, trunc, artItem, alts });

module.exports = {
  home, about, vision, quality, career,
  areaList, areaDetail, teamPage, articleList, articleDetail,
  contact, legal, notFound,
  eventList: extra.eventList, eventDetail: extra.eventDetail, teamDetail: extra.teamDetail,
  ARTICLES, TAGS, fmtDate, tagLabel,
};
