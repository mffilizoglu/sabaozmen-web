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
const UI = require("../../shared/admin-ui.mjs");

const ART = require("../content/articles.json");
const ARTICLES = ART.articles.filter((a) => a.published !== false);
const BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));

/* Authorship. An attorney's publications are every article whose author line
   names them (every article is by Prof. Özmen; some have a co-author from the
   team) plus any linked by hand in the admin panel. Deriving it means a new
   article appears on the right profiles without anyone remembering to tick a box. */
const fold = (s) => String(s || "").toLocaleLowerCase("tr")
  .replace(/[âä]/g, "a").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g")
  .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/î/g, "i")
  .replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const TITLES = /\b(prof|dr|doc|av|stj|ars|aras|gor|ogr|gorevlisi|uyesi|arb|yrd|y)\b/g;
const bareName = (n) => fold(n).replace(TITLES, " ").replace(/\s+/g, " ").trim();
const LEAD_AUTHOR = "Prof. Dr. Etem Saba Özmen";
const authorsOf = (a) => [LEAD_AUTHOR].concat(a.coAuthor ? [a.coAuthor] : []);

function wrote(member, a) {
  const k = bareName(member.name);
  return !!k && authorsOf(a).some((n) => bareName(n) === k || bareName(n).endsWith(" " + k));
}
function articlesOf(member) {
  const manual = new Set(member.articleSlugs || []);
  return ARTICLES.filter((a) => manual.has(a.slug) || wrote(member, a));
}
/* The team member behind an author name on an article, if any. */
function memberFor(authorName) {
  const k = bareName(authorName);
  return store.team.published().find((m) => {
    const b = bareName(m.name);
    return b && (b === k || k.endsWith(" " + b));
  }) || null;
}

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
const AREA_BY = Object.fromEntries(D.areas.map((a) => [a.slug, a]));
const formatLabel = (f, lang) => T("ev.format." + (f || "yuz-yuze"), lang);
const roleLabel = (r, lang) => T("ev.role." + r, lang);
const isOnline = (e) => e.format === "cevrimici";

/* "12 Aralık 2023, 16:00" · "24–26 Ekim 2024" · "6–13 Aralık 2025" */
function evWhen(e, lang, withTime) {
  if (!e.date) return "";
  let s = H.fmtDate(e.date, lang);
  if (e.endDate && e.endDate !== e.date) s += " – " + H.fmtDate(e.endDate, lang);
  if (withTime && e.startTime) s += ", " + e.startTime + (e.endTime ? "–" + e.endTime : "");
  return s;
}
const evYear = (e) => (e.date ? e.date.slice(0, 4) : "");

/* ISO 8601 with Istanbul's offset (+03:00, no DST since 2016). */
function isoAt(date, time) {
  if (!date) return undefined;
  return time ? `${date}T${time}:00+03:00` : date;
}

function posterImg(e, alt, extra) {
  const wh = e.posterW && e.posterH ? ` width="${e.posterW}" height="${e.posterH}"` : "";
  return `<img src="${attr(e.poster)}" alt="${attr(alt)}"${wh}${extra || ""}>`;
}

function eventCard(e, lang) {
  const title = loc(e.title, lang);
  const org = (e.organizers || [])[0];
  // Landscape posters would lose half their width to the portrait frame:
  // they are shown whole, over a blurred copy of themselves.
  const wide = e.poster && e.posterW && e.posterH && e.posterW / e.posterH > 1.15;
  return `<a class="ev-card rv" href="${evUrl(e, lang)}" data-evtype="${attr(e.type)}" data-year="${attr(evYear(e) || "none")}">
    <div class="ev-card__poster${wide ? " is-wide" : ""}"${wide ? ` style="--poster:url('${attr(e.poster)}')"` : ""}>
      ${e.poster
        ? posterImg(e, title, ' loading="lazy" decoding="async"')
        : `<div class="ev-card__noposter" aria-hidden="true">${icon.doc}</div>`}
      <span class="ev-card__type">${esc(typeLabel(e.type, lang))}</span>
      ${isOnline(e) ? `<span class="ev-card__online">${esc(formatLabel(e.format, lang))}</span>` : ""}
    </div>
    <div class="ev-card__body">
      <div class="ev-card__date">${esc(evWhen(e, lang) || T("ev.noDate", lang))}${e.city ? " · " + esc(e.city) : ""}</div>
      <h3 class="ev-card__t">${esc(title)}</h3>
      ${org ? `<div class="ev-card__venue">${esc(org)}</div>` : ""}
    </div>
  </a>`;
}

function eventList(lang) {
  const all = store.events.published();
  const counts = {};
  all.forEach((e) => { counts[e.type] = (counts[e.type] || 0) + 1; });
  const types = store.EVENT_TYPES.filter((t) => counts[t]);
  const years = [];
  all.forEach((e) => { const y = evYear(e); if (!years.includes(y)) years.push(y); });

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
    <div class="archive-top rv">
      ${L.yearSelect(lang, L.yearCounts(all, evYear), "evyear")}
      <p class="archive-count"><strong data-evcount>${all.length}</strong> ${esc(T("ev.count", lang))}</p>
    </div>
    <div data-evgrid>
      ${years.map((y) => `<section class="ev-year" data-evyear>
        <h2 class="ev-year__h">${esc(y || T("ev.noDate", lang))}</h2>
        <div class="grid grid--3">${all.filter((e) => evYear(e) === y).map((e) => eventCard(e, lang)).join("")}</div>
      </section>`).join("")}
    </div>
    <div class="empty" data-evempty hidden>${esc(T("art.none", lang))}</div>
    ` : `<div class="empty">${esc(T("ev.none", lang))}</div>`}
  </div>
</section>`;

  const crumbs = [{ label: T("nav.home", lang), href: url(lang, "home") },
                  { label: T("nav.events", lang), href: url(lang, "events") }];
  return {
    body,
    title: `${T("nav.events", lang)} — ${firm.name[lang]}`,
    description: H.trunc(T("ev.lede", lang), 155),
    active: "events",
    altPaths: alts("events"),
    breadcrumbs: crumbs,
  };
}

function programHtml(e, lang) {
  const sessions = UI.parseProgram(e.program);
  if (!sessions.length) return "";
  return `<hr class="divider">
    <h2 class="rv">${esc(T("ev.program", lang))}</h2>
    ${lang !== "tr" ? `<p class="small muted rv">${esc(T("ev.programLang", lang))}</p>` : ""}
    <div class="ev-program rv" lang="tr">
      ${sessions.map((s) => `<div class="ev-program__s">
        ${s.time || s.title ? `<div class="ev-program__h">
          ${s.time ? `<span class="ev-program__time">${esc(s.time)}</span>` : ""}
          ${s.title ? `<strong>${esc(s.title)}</strong>` : ""}
          ${s.meta.map((m) => `<span class="ev-program__meta">${esc(m)}</span>`).join("")}
        </div>` : ""}
        <ul class="ev-program__list">
          ${s.items.map((it) => it.note
            ? `<li class="ev-program__note">${esc(it.what)}</li>`
            : `<li${/Etem Sab[aâ] Özmen|Tuğba Kaya Filizoğlu/i.test(it.who) ? ' class="is-ours"' : ""}>
                <span class="ev-program__who">${esc(it.who)}</span>
                ${it.what ? `<span class="ev-program__what">${esc(it.what)}</span>` : ""}
              </li>`).join("")}
        </ul>
      </div>`).join("")}
    </div>`;
}

function eventDetail(lang, e, origin) {
  const title = loc(e.title, lang);
  const when = evWhen(e, lang, true);
  const related = (e.articleSlugs || []).map((s) => BY_SLUG[s]).filter(Boolean);
  const members = (e.teamSlugs || []).map((s) => store.team.bySlug(s)).filter((m) => m && m.published !== false);
  const areas = (e.areaSlugs || []).map((s) => AREA_BY[s]).filter(Boolean);
  const talks = (e.talks || []).map((t) => loc(t, lang)).filter(Boolean);
  const all = store.events.published();
  const others = all.filter((x) => x.slug !== e.slug &&
    ((x.areaSlugs || []).some((a) => (e.areaSlugs || []).includes(a)) || x.type === e.type)).slice(0, 4);
  const place = loc(e.venue, lang);

  const crumbs = [{ label: T("nav.home", lang), href: url(lang, "home") },
                  { label: T("nav.events", lang), href: url(lang, "events") },
                  { label: title, href: evUrl(e, lang) }];

  const body = H.phero(lang, {
    title,
    crumbs: [crumbs[0], crumbs[1], { label: H.trunc(title, 60) }],
    extra: `<div class="art-meta" style="margin-top:1.25rem;color:rgba(255,255,255,.72)">
        <span class="tag">${esc(typeLabel(e.type, lang))}</span>
        ${when ? `<span>${esc(when)}</span>` : ""}
        ${place ? `<span>${esc(place)}</span>` : ""}
      </div>`,
  }) + `
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="doc">
        ${loc(e.summary, lang) ? `<p class="lede rv">${esc(loc(e.summary, lang))}</p>` : ""}
        ${talks.length ? `<div class="ev-talk rv">
          <div class="ev-talk__label">${esc(T(talks.length > 1 ? "ev.talks" : "ev.talk", lang))}</div>
          ${talks.map((t) => `<p class="ev-talk__t">${esc(t)}</p>`).join("")}
        </div>` : ""}
        ${loc(e.body, lang) ? loc(e.body, lang).split(/\n{2,}/).map((x) => `<p class="rv">${esc(x)}</p>`).join("") : ""}
        ${e.poster ? `<figure class="ev-poster rv">
          ${posterImg(e, title + " — " + T("ev.poster", lang), ' loading="lazy" decoding="async"')}
        </figure>` : ""}
        ${e.link ? `<div class="btn-row mt-3 rv">
          <a class="btn btn--ghost" href="${attr(e.link)}" target="_blank" rel="noopener noreferrer">${esc(T("ev.link", lang))} ${icon.arrow}</a>
        </div>` : ""}
        ${programHtml(e, lang)}
        ${related.length ? `
        <hr class="divider">
        <h2 class="rv">${esc(T("ev.related", lang))}</h2>
        <ul class="art-list rv">${related.map((a) => H.artItem(a, lang)).join("")}</ul>` : ""}
      </div>
      <div class="split__aside">
        <div class="aside-card rv">
          <h3>${esc(T("ev.details", lang))}</h3>
          <table class="meta-table">
            <tr><th>${esc(T("ev.type", lang))}</th><td>${esc(typeLabel(e.type, lang))}</td></tr>
            <tr><th>${esc(T("ev.format", lang))}</th><td>${esc(formatLabel(e.format, lang))}</td></tr>
            <tr><th>${esc(T("ev.date", lang))}</th><td>${e.date ? esc(evWhen(e, lang)) : `<span class="muted">${esc(T("ev.noDate", lang))}</span>`}</td></tr>
            ${e.startTime ? `<tr><th>${esc(T("ev.time", lang))}</th><td>${esc(e.startTime + (e.endTime ? "–" + e.endTime : ""))}</td></tr>` : ""}
            ${place ? `<tr><th>${esc(T("ev.venue", lang))}</th><td>${esc(place)}</td></tr>` : ""}
            ${e.address ? `<tr><th>${esc(T("ev.address", lang))}</th><td>${esc(e.address)}</td></tr>` : ""}
            ${e.city ? `<tr><th>${lang === "tr" ? "Şehir" : lang === "de" ? "Stadt" : "City"}</th><td>${esc(e.city)}</td></tr>` : ""}
            ${(e.organizers || []).length ? `<tr><th>${esc(T("ev.organizer", lang))}</th><td>${e.organizers.map(esc).join("<br>")}</td></tr>` : ""}
            ${(e.roles || []).length ? `<tr><th>${esc(T("ev.role", lang))}</th><td>${e.roles.map((r) => esc(roleLabel(r, lang))).join(", ")}</td></tr>` : ""}
            ${(e.speakers || []).length ? `<tr><th>${esc(T("ev.speakers", lang))}</th><td>${e.speakers.map(esc).join("<br>")}</td></tr>` : ""}
          </table>
        </div>
        ${members.length ? `<div class="aside-card rv">
          <h3>${esc(T("ev.team", lang))}</h3>
          <ul class="aside-links">
            ${members.map((m) => `<li><a class="ul-link" href="${memberUrl(m, lang)}">${esc(m.name)}</a></li>`).join("")}
          </ul>
        </div>` : ""}
        ${areas.length ? `<div class="aside-card rv">
          <h3>${esc(T("ev.areas", lang))}</h3>
          <ul class="aside-links">
            ${areas.map((a) => `<li><a class="ul-link" href="${url(lang, "areas", a.slug)}">${esc(a.name[lang])}</a></li>`).join("")}
          </ul>
        </div>` : ""}
        ${others.length ? `<div class="aside-card rv">
          <h3>${esc(T("ev.more", lang))}</h3>
          <ul class="aside-links">
            ${others.map((o) => `<li><a class="ul-link" href="${evUrl(o, lang)}">${esc(H.trunc(loc(o.title, lang), 72))}</a>
              <span class="small muted">${esc(evWhen(o, lang))}</span></li>`).join("")}
          </ul>
        </div>` : ""}
      </div>
    </div>
  </div>
</section>`;

  const desc = loc(e.summary, lang)
    || `${title} — ${typeLabel(e.type, lang)}${when ? ", " + when : ""}${place ? ", " + place : ""}.`;

  return {
    body,
    title: `${H.trunc(title, 62)} | Saba Özmen`,
    description: H.trunc(desc, 155),
    active: "events",
    ogType: "article",
    ogImage: e.poster ? { path: e.poster, w: e.posterW, h: e.posterH } : null,
    altPaths: alts("events", e.slug),
    breadcrumbs: crumbs,
    jsonLd: [eventLd(e, lang, origin, members)],
  };
}

function eventLd(e, lang, origin, members) {
  const pageUrl = origin + evUrl(e, lang);
  const place = loc(e.venue, lang);
  const physical = {
    "@type": "Place",
    name: place || e.city || undefined,
    address: {
      "@type": "PostalAddress",
      ...(e.address ? { streetAddress: e.address } : {}),
      ...(e.city ? { addressLocality: e.city } : {}),
      addressCountry: "TR",
    },
  };
  const virtual = { "@type": "VirtualLocation", url: e.link || pageUrl };
  const o = {
    "@context": "https://schema.org",
    "@type": e.type === "egitim" || e.type === "webinar" ? ["Event", "EducationEvent"] : "Event",
    name: loc(e.title, lang),
    url: pageUrl,
    inLanguage: "tr",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: e.format === "cevrimici" ? "https://schema.org/OnlineEventAttendanceMode"
      : e.format === "hibrit" ? "https://schema.org/MixedEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: e.format === "cevrimici" ? virtual : e.format === "hibrit" ? [physical, virtual] : physical,
  };
  if (e.date) o.startDate = isoAt(e.date, e.startTime);
  if (e.endDate || e.endTime) o.endDate = isoAt(e.endDate || e.date, e.endTime);
  o.image = [origin + (e.poster || "/img/og.png")];
  if (loc(e.summary, lang)) o.description = loc(e.summary, lang);
  if ((e.organizers || []).length) {
    o.organizer = e.organizers.map((n) => ({ "@type": "Organization", name: n }));
  }
  if (members.length) {
    o.performer = members.map((m) => ({ "@type": "Person", name: m.name, url: origin + memberUrl(m, lang) }));
  }
  const talks = (e.talks || []).map((t) => loc(t, lang)).filter(Boolean);
  if (talks.length) o.about = talks.map((t) => ({ "@type": "Thing", name: t }));
  o.isAccessibleForFree = /ücretsiz|free|kostenlos/i.test(`${loc(e.summary, lang)} ${loc(e.body, lang)}`) || undefined;
  return o;
}

/* Events a member took part in — for the profile page and its Person JSON-LD. */
function eventsOf(member) {
  return store.events.published().filter((e) => (e.teamSlugs || []).includes(member.slug));
}
/* Events tied to a practice area — for the area pages. */
function eventsForArea(areaSlug) {
  return store.events.published().filter((e) => (e.areaSlugs || []).includes(areaSlug));
}
function eventRow(e, lang) {
  return `<li class="ev-row">
    <a href="${evUrl(e, lang)}">
      <span class="ev-row__date">${esc(evWhen(e, lang) || T("ev.noDate", lang))}</span>
      <span class="ev-row__t">${esc(loc(e.title, lang))}</span>
      <span class="ev-row__org">${esc([typeLabel(e.type, lang), (e.organizers || [])[0]].filter(Boolean).join(" · "))}</span>
    </a>
  </li>`;
}

/* ------------------------------------------------------- attorney profile */
function teamDetail(lang, m, origin) {
  const arts = articlesOf(m);
  const evs = eventsOf(m);
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
                           : ""}
        ${loc(m.bio, lang) ? `<hr class="divider">` : ""}
        <h2 class="rv">${esc(T("team.articlesOf", lang))}</h2>
        ${arts.length
          ? `<ul class="art-list rv">${arts.map((a) => H.artItem(a, lang)).join("")}</ul>`
          : `<p class="note rv">${esc(T("team.noArticles", lang))}</p>`}
        ${evs.length ? `<hr class="divider">
        <h2 class="rv">${esc(T("team.eventsOf", lang))} <span class="muted small">(${evs.length})</span></h2>
        <ul class="ev-rows rv">${evs.map((e) => eventRow(e, lang)).join("")}</ul>` : ""}
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
    description: H.trunc(desc, 155),
    active: "team",
    altPaths: alts("team", m.slug),
    breadcrumbs: [
      { label: T("nav.home", lang), href: url(lang, "home") },
      { label: T("nav.team", lang), href: url(lang, "team") },
      { label: m.name, href: memberUrl(m, lang) },
    ],
    jsonLd: [{
      "@context": "https://schema.org", "@type": "Person",
      "@id": origin + memberUrl(m, "tr") + "#person",
      name: m.name, jobTitle: loc(m.role, lang),
      worksFor: { "@type": "LegalService", name: firm.name[lang], url: origin + "/" + lang },
      url: origin + memberUrl(m, lang),
      ...(m.photo ? { image: origin + m.photo } : {}),
      ...(m.email ? { email: m.email } : {}),
      ...(m.orcid ? { identifier: "https://orcid.org/" + m.orcid, sameAs: ["https://orcid.org/" + m.orcid] } : {}),
      ...(loc(m.academic, lang) ? { affiliation: { "@type": "Organization", name: loc(m.academic, lang) } } : {}),
      ...(arts.length ? { subjectOf: arts.slice(0, 20).map((a) => ({
        "@type": "ScholarlyArticle", name: loc(a.title, lang), url: origin + url(lang, "articles", a.slug) })) } : {}),
      ...(evs.length ? { performerIn: evs.slice(0, 20).map((e) => ({
        "@type": "Event", name: loc(e.title, lang), url: origin + evUrl(e, lang),
        ...(e.date ? { startDate: e.date } : {}) })) } : {}),
    }],
  };
}

module.exports = { bind, eventList, eventDetail, teamDetail, typeLabel, loc, eventsOf, eventsForArea, eventRow,
  articlesOf, memberFor, authorsOf };
