"use strict";

/* Events (Etkinlikler) and individual attorney profiles.
   Both are driven by content/team.json and content/events.json, which the
   admin panel rewrites — so everything here reads through lib/store.js at
   render time rather than capturing a snapshot at require time. */

const { T } = require("../content/i18n");
const D = require("../content/data");
const { firm } = D;
const L = require("./layout");
const { esc, attr, url, icon } = L;
const store = require("./store");

const ART = require("../content/articles.json");
const ARTICLES = ART.articles;
const BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));

/* Shared helpers are passed in from pages.js to avoid a require cycle. */
let H = null;
function bind(helpers) { H = helpers; }

const typeLabel = (t, lang) => T("ev.type." + t, lang);

function evUrl(e, lang) { return url(lang, "events", e.slug); }
function memberUrl(m, lang) { return url(lang, "team", m.slug); }

function alts(key, slug) {
  const o = {};
  D.LANGS.forEach((l) => { o[l] = url(l, key, slug); });
  return o;
}

function loc(v, lang) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[lang] || v.tr || v.en || v.de || "";
}

/* ---------------------------------------------------------------- events */
function eventCard(e, lang) {
  const d = H.fmtDate(e.date, lang);
  const title = loc(e.title, lang);
  return `<a class="ev-card rv" href="${evUrl(e, lang)}">
    <div class="ev-card__poster">
      ${e.poster
        ? `<img src="${attr(e.poster)}" alt="${attr(title)}" loading="lazy">`
        : `<div class="ev-card__noposter" aria-hidden="true">${icon.doc}</div>`}
      <span class="ev-card__type">${esc(typeLabel(e.type, lang))}</span>
    </div>
    <div class="ev-card__body">
      <div class="ev-card__date">${esc(d || T("art.noDate", lang))}</div>
      <h3 class="ev-card__t">${esc(title)}</h3>
      ${loc(e.venue, lang) ? `<div class="ev-card__venue">${esc(loc(e.venue, lang))}</div>` : ""}
    </div>
  </a>`;
}

function eventList(lang) {
  const all = store.events.published();
  const counts = {};
  all.forEach((e) => { counts[e.type] = (counts[e.type] || 0) + 1; });
  const types = store.EVENT_TYPES.filter((t) => counts[t]);

  const body = H.phero(lang, {
    title: T("nav.events", lang), lede: T("ev.lede", lang),
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") },
             { label: T("nav.events", lang) }],
  }) + `
<section class="section">
  <div class="wrap">
    ${all.length ? `
    ${types.length > 1 ? `<div class="filters rv">
      ${types.map((t) => `<button class="chip" type="button" data-evtype="${attr(t)}" aria-pressed="false">${esc(typeLabel(t, lang))}<span class="chip__n">${counts[t]}</span></button>`).join("")}
    </div>` : ""}
    <p class="small muted rv"><strong data-evcount>${all.length}</strong> ${esc(T("ev.count", lang))}</p>
    <div class="grid grid--3 mt-2" data-evgrid>${all.map((e) => eventCard(e, lang)).join("")}</div>
    <div class="empty" data-evempty hidden>${esc(T("art.none", lang))}</div>
    ` : `<div class="empty">${esc(T("ev.none", lang))}</div>`}
  </div>
</section>`;

  return {
    body,
    title: `${T("nav.events", lang)} — ${firm.name[lang]}`,
    description: H.trunc(T("ev.lede", lang), 175),
    active: "events",
    altPaths: alts("events"),
  };
}

function eventDetail(lang, e, origin) {
  const d = H.fmtDate(e.date, lang);
  const end = e.endDate ? H.fmtDate(e.endDate, lang) : null;
  const title = loc(e.title, lang);
  const related = (e.articleSlugs || []).map((s) => BY_SLUG[s]).filter(Boolean);
  const others = store.events.published().filter((x) => x.slug !== e.slug).slice(0, 3);

  const body = H.phero(lang, {
    title,
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") },
             { label: T("nav.events", lang), href: url(lang, "events") },
             { label: H.trunc(title, 60) }],
    extra: `<div class="art-meta" style="margin-top:1.25rem;color:rgba(255,255,255,.72)">
        <span class="tag">${esc(typeLabel(e.type, lang))}</span>
        ${d ? `<span>${esc(d)}${end ? " – " + esc(end) : ""}</span>` : ""}
        ${loc(e.venue, lang) ? `<span>${esc(loc(e.venue, lang))}</span>` : ""}
      </div>`,
  }) + `
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="doc">
        ${e.poster ? `<figure class="ev-poster rv">
          <img src="${attr(e.poster)}" alt="${attr(title)} — ${esc(T("ev.poster", lang))}">
        </figure>` : ""}
        ${loc(e.summary, lang) ? `<p class="lede rv">${esc(loc(e.summary, lang))}</p>` : ""}
        ${loc(e.body, lang) ? loc(e.body, lang).split(/\n{2,}/).map((x) => `<p class="rv">${esc(x)}</p>`).join("") : ""}
        ${e.link ? `<div class="btn-row mt-3 rv">
          <a class="btn btn--ghost" href="${attr(e.link)}" target="_blank" rel="noopener noreferrer">${esc(T("ev.link", lang))} ${icon.arrow}</a>
        </div>` : ""}
        ${related.length ? `
        <hr class="divider">
        <h2 class="rv">${esc(T("ev.related", lang))}</h2>
        <ul class="art-list rv">${related.map((a) => H.artItem(a, lang)).join("")}</ul>` : ""}
      </div>
      <div class="split__aside">
        <div class="aside-card rv">
          <h3>${esc(T("art.details", lang))}</h3>
          <table class="meta-table">
            <tr><th>${esc(T("ev.type", lang))}</th><td>${esc(typeLabel(e.type, lang))}</td></tr>
            <tr><th>${esc(T("ev.date", lang))}</th><td>${d ? esc(d) + (end ? " – " + esc(end) : "") : `<span class="muted">${esc(T("art.noDate", lang))}</span>`}</td></tr>
            ${loc(e.venue, lang) ? `<tr><th>${esc(T("ev.venue", lang))}</th><td>${esc(loc(e.venue, lang))}</td></tr>` : ""}
            ${e.city ? `<tr><th>${lang === "tr" ? "Şehir" : lang === "de" ? "Stadt" : "City"}</th><td>${esc(e.city)}</td></tr>` : ""}
            ${(e.speakers || []).length ? `<tr><th>${esc(T("ev.speakers", lang))}</th><td>${esc((e.speakers || []).join(", "))}</td></tr>` : ""}
          </table>
        </div>
        ${others.length ? `<div class="aside-card rv">
          <h3>${esc(T("nav.events", lang))}</h3>
          <ul style="list-style:none;margin:0;padding:0;display:grid;gap:.7rem">
            ${others.map((o) => `<li><a class="ul-link" style="color:var(--ink-2);font-weight:400;font-size:.9rem" href="${evUrl(o, lang)}">${esc(H.trunc(loc(o.title, lang), 64))}</a></li>`).join("")}
          </ul>
        </div>` : ""}
      </div>
    </div>
  </div>
</section>`;

  const desc = loc(e.summary, lang)
    || `${title} — ${typeLabel(e.type, lang)}${d ? ", " + d : ""}${loc(e.venue, lang) ? ", " + loc(e.venue, lang) : ""}.`;

  return {
    body,
    title: `${H.trunc(title, 70)} — ${firm.name[lang]}`,
    description: H.trunc(desc, 175),
    active: "events",
    ogType: "article",
    altPaths: alts("events", e.slug),
    jsonLd: [eventLd(e, lang, origin)],
  };
}

function eventLd(e, lang, origin) {
  const o = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: loc(e.title, lang),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@type": "Organization", name: firm.name[lang] },
    url: origin + evUrl(e, lang),
  };
  if (e.date) o.startDate = e.date;
  if (e.endDate) o.endDate = e.endDate;
  if (e.poster) o.image = origin + e.poster;
  if (loc(e.summary, lang)) o.description = loc(e.summary, lang);
  if (loc(e.venue, lang)) {
    o.location = { "@type": "Place", name: loc(e.venue, lang) };
    if (e.city) o.location.address = { "@type": "PostalAddress", addressLocality: e.city };
  }
  return o;
}

/* ------------------------------------------------------- attorney profile */
function teamDetail(lang, m, origin) {
  const arts = (m.articleSlugs || []).map((s) => BY_SLUG[s]).filter(Boolean);
  const initials = m.name.replace(/(Prof\.|Dr\.|Av\.)\s*/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  const rows = [
    ["team.barNo", m.barNo],
    ["team.startYear", m.startYear],
    ["team.faculty", m.faculty],
    ["team.languages", m.languages],
  ].filter((r) => r[1]);

  const body = H.phero(lang, {
    title: m.name,
    crumbs: [{ label: T("nav.home", lang), href: url(lang, "home") },
             { label: T("nav.team", lang), href: url(lang, "team") },
             { label: m.name }],
    extra: `<div class="art-meta" style="margin-top:1rem;color:rgba(255,255,255,.75)">
      <span>${esc(loc(m.role, lang))}</span>
      ${loc(m.academic, lang) ? `<span>${esc(loc(m.academic, lang))}</span>` : ""}
    </div>`,
  }) + `
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="doc">
        ${loc(m.bio, lang) ? loc(m.bio, lang).split(/\n{2,}/).map((x) => `<p class="rv">${esc(x)}</p>`).join("")
                           : `<p class="note rv">${esc(T("team.noArticles", lang))}</p>`}
        <hr class="divider">
        <h2 class="rv">${esc(T("team.articlesOf", lang))}</h2>
        ${arts.length
          ? `<ul class="art-list rv">${arts.map((a) => H.artItem(a, lang)).join("")}</ul>`
          : `<p class="note rv">${esc(T("team.noArticles", lang))}</p>`}
      </div>
      <div class="split__aside">
        <div class="aside-card rv" style="padding-top:1.5rem">
          <div class="person__ph${m.photo ? "" : " person__ph--empty"}" style="margin-bottom:1.2rem">
            ${m.photo
              ? `<img src="${attr(m.photo)}" alt="${attr(m.name)}" width="450" height="600">`
              : `<span class="person__initials" aria-hidden="true">${esc(initials)}</span>`}
          </div>
          <table class="meta-table">
            ${rows.map((r) => `<tr><th>${esc(T(r[0], lang))}</th><td>${esc(r[1])}</td></tr>`).join("")}
            ${m.orcid ? `<tr><th>ORCID</th><td>${esc(m.orcid)}</td></tr>` : ""}
            ${m.email ? `<tr><th>${esc(T("label.email", lang))}</th><td><a href="mailto:${attr(m.email)}">${esc(m.email)}</a></td></tr>` : ""}
          </table>
        </div>
      </div>
    </div>
  </div>
</section>`;

  const desc = loc(m.bio, lang)
    || `${m.name} — ${loc(m.role, lang)}, ${firm.name[lang]}${loc(m.academic, lang) ? ". " + loc(m.academic, lang) : ""}.`;

  return {
    body,
    title: `${m.name} — ${firm.name[lang]}`,
    description: H.trunc(desc, 175),
    active: "team",
    altPaths: alts("team", m.slug),
    jsonLd: [{
      "@context": "https://schema.org", "@type": "Person",
      name: m.name, jobTitle: loc(m.role, lang),
      worksFor: { "@type": "Organization", name: firm.name[lang] },
      url: origin + memberUrl(m, lang),
      ...(m.email ? { email: m.email } : {}),
      ...(m.orcid ? { identifier: "https://orcid.org/" + m.orcid } : {}),
    }],
  };
}

module.exports = { bind, eventList, eventDetail, teamDetail, typeLabel, loc };
