"use strict";

/* Static export.

   Renders every route, in every language, to dist/ as real HTML files so the
   site can be served by any static host (Cloudflare Pages, GitHub Pages,
   Netlify) with no server running. The same lib/pages.js templates produce
   these files and the dev server's responses, so there is one source of truth.

   Clean URLs come from directory/index.html rather than host-specific rewrite
   rules, so /tr/makaleler/<slug> works identically everywhere.

   Usage:  node site/build.js [--origin https://example.com] [--out dist]
*/

const fs = require("fs");
const path = require("path");

const D = require("./content/data");
const { LANGS, routes, areas } = D;
const P = require("./lib/pages");
const layout = require("./lib/layout");
const store = require("./lib/store");

const argv = process.argv.slice(2);
const argOf = (name, dflt) => {
  const i = argv.indexOf("--" + name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : dflt;
};

const ORIGIN = String(argOf("origin", "")).replace(/\/+$/, "");
const OUT = path.resolve(__dirname, "..", argOf("out", "dist"));
const PUBLIC = path.join(__dirname, "public");

let written = 0;

function writePage(urlPath, html) {
  // "/tr/makaleler/x" -> dist/tr/makaleler/x/index.html
  const rel = urlPath.replace(/^\/+/, "");
  const dir = path.join(OUT, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  written++;
}

function render(view, lang, urlPath) {
  view.lang = lang;
  view.path = urlPath;
  view.origin = ORIGIN;
  return layout.page(view);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ------------------------------------------------------------------ build */
console.log("building →", OUT);
if (ORIGIN) console.log("origin  →", ORIGIN);
else console.log("origin  →  (relative; pass --origin for absolute canonical/og URLs)");

// On Windows a process with dist/ as its cwd (a preview server, an open shell)
// locks the directory and rmSync fails with EPERM. Retry, then say plainly what
// is wrong rather than dumping a stack trace.
for (let attempt = 1; ; attempt++) {
  try {
    fs.rmSync(OUT, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    break;
  } catch (e) {
    if (attempt >= 3) {
      console.error("\n  Cannot clear %s\n  %s", OUT, e.message);
      console.error("  Something is holding that directory open — a preview server,");
      console.error("  a terminal sitting inside dist/, or a file browser. Close it and retry.");
      process.exit(1);
    }
  }
}
fs.mkdirSync(OUT, { recursive: true });

// 1. static assets — but never the admin's uploads directory listing or secrets
copyDir(PUBLIC, OUT);
console.log("  assets copied");

// 2. every page, every language
const PAGE_FNS = {
  home: (l) => P.home(l, ORIGIN),
  about: P.about, vision: P.vision, quality: P.quality, career: P.career,
  areas: P.areaList, team: P.teamPage, articles: P.articleList,
  events: P.eventList, contact: P.contact,
  privacy: (l) => P.legal(l, "privacy"),
  cookies: (l) => P.legal(l, "cookies"),
};

for (const lang of LANGS) {
  for (const key of Object.keys(routes)) {
    const fn = PAGE_FNS[key];
    if (!fn) throw new Error("no renderer for route: " + key);
    const p = layout.url(lang, key);
    writePage(p, render(fn(lang), lang, p));
  }
  for (const a of areas) {
    const p = layout.url(lang, "areas", a.slug);
    writePage(p, render(P.areaDetail(lang, a), lang, p));
  }
  for (const a of P.ARTICLES) {
    const p = layout.url(lang, "articles", a.slug);
    writePage(p, render(P.articleDetail(lang, a, ORIGIN), lang, p));
  }
  for (const m of store.team.published()) {
    const p = layout.url(lang, "team", m.slug);
    writePage(p, render(P.teamDetail(lang, m, ORIGIN), lang, p));
  }
  for (const e of store.events.published()) {
    const p = layout.url(lang, "events", e.slug);
    writePage(p, render(P.eventDetail(lang, e, ORIGIN), lang, p));
  }
  // 404 for this language, used by the host's not-found handler
  const nf = P.notFound(lang);
  writePage("/" + lang + "/404", render(nf, lang, "/" + lang + "/404"));
}
console.log("  %d pages rendered", written);

// 3. root: send visitors to their language. A meta-refresh works on every host;
//    _redirects gives Cloudflare/Netlify a real 302 before the HTML is served.
fs.writeFileSync(path.join(OUT, "index.html"),
`<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Saba Özmen Avukatlık Ortaklığı</title>
<link rel="canonical" href="${ORIGIN}/tr">
<meta http-equiv="refresh" content="0; url=/tr">
<meta name="robots" content="noindex">
<script>
  var l = (navigator.language || "tr").slice(0, 2).toLowerCase();
  location.replace(l === "de" ? "/de" : l === "en" ? "/en" : "/tr");
</script>
</head>
<body><a href="/tr">Saba Özmen Avukatlık Ortaklığı</a></body>
</html>`, "utf8");

// Cloudflare Pages / Netlify serve this file as the 404 document.
fs.copyFileSync(path.join(OUT, "tr", "404", "index.html"), path.join(OUT, "404.html"));

fs.writeFileSync(path.join(OUT, "_redirects"),
`/  /tr  302
`, "utf8");

fs.writeFileSync(path.join(OUT, "_headers"),
`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/img/*
  Cache-Control: public, max-age=604800

/makaleler/pdf/*
  Cache-Control: public, max-age=604800
`, "utf8");

// 4. sitemap + robots, with absolute URLs
const urls = [];
for (const lang of LANGS) {
  const add = (p, pri) => {
    const alts = {};
    LANGS.forEach((x) => { alts[x] = ORIGIN + p.replace("/" + lang, "/" + x); });
    urls.push({ loc: ORIGIN + p, pri, alts });
  };
  for (const key of Object.keys(routes)) {
    const alts = {};
    LANGS.forEach((x) => { alts[x] = ORIGIN + layout.url(x, key); });
    urls.push({ loc: ORIGIN + layout.url(lang, key), pri: key === "home" ? "1.0" : "0.7", alts });
  }
  const each = (items, key, pri) => items.forEach((it) => {
    const alts = {};
    LANGS.forEach((x) => { alts[x] = ORIGIN + layout.url(x, key, it.slug); });
    urls.push({ loc: ORIGIN + layout.url(lang, key, it.slug), pri, alts });
  });
  each(areas, "areas", "0.6");
  each(P.ARTICLES, "articles", "0.8");
  each(store.team.published(), "team", "0.6");
  each(store.events.published(), "events", "0.6");
}

fs.writeFileSync(path.join(OUT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
${LANGS.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${u.alts[x]}"/>`).join("\n")}
    <priority>${u.pri}</priority>
  </url>`).join("\n")}
</urlset>
`, "utf8");

fs.writeFileSync(path.join(OUT, "robots.txt"),
`User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${ORIGIN}/sitemap.xml
`, "utf8");

console.log("  sitemap: %d urls", urls.length);

/* ------------------------------------------------------------ self-checks */
const problems = [];
const mustExist = [
  "index.html", "404.html", "sitemap.xml", "robots.txt", "_headers", "_redirects",
  "tr/index.html", "en/index.html", "de/index.html",
  "css/main.css", "js/main.js", "img/mark.svg", "img/og.png",
  "fonts/fonts.css", "makaleler/pdf/01.pdf",
];
mustExist.forEach((f) => {
  if (!fs.existsSync(path.join(OUT, f))) problems.push("missing " + f);
});

// the admin panel must not be exported, and no secret may be copied
["admin", "admin.json", "content"].forEach((f) => {
  if (fs.existsSync(path.join(OUT, f))) problems.push("must not be in dist: " + f);
});

let bytes = 0, files = 0, biggest = { size: 0, name: "" };
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else {
      const st = fs.statSync(p);
      files++; bytes += st.size;
      if (st.size > biggest.size) biggest = { size: st.size, name: path.relative(OUT, p) };
    }
  }
})(OUT);

const MiB = 1048576;
if (biggest.size > 25 * MiB) problems.push(`file over Cloudflare Pages' 25 MiB limit: ${biggest.name}`);
if (files > 20000) problems.push(`over Cloudflare Pages' 20,000 file limit: ${files}`);

console.log("");
console.log("  %d files · %s MB · largest %s (%s MB)",
  files, (bytes / MiB).toFixed(1), biggest.name, (biggest.size / MiB).toFixed(2));

if (problems.length) {
  console.error("\n  BUILD PROBLEMS:");
  problems.forEach((p) => console.error("   ✗ " + p));
  process.exit(1);
}
console.log("  build OK");
