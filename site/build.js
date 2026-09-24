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

/* Origin, in order of preference:
     --origin flag  →  SITE_ORIGIN  →  CF_PAGES_URL (set by Cloudflare at build
   time; it is the per-deployment URL, so a production build should set
   SITE_ORIGIN to the real domain once one exists). */
const ORIGIN = String(
  argOf("origin", process.env.SITE_ORIGIN || process.env.CF_PAGES_URL || "")
).replace(/\/+$/, "");
/* Optional path prefix, for hosts that serve a project under a sub-path
   (GitHub Pages project sites). Emitted HTML has absolute URLs, so they are
   rewritten once at the end rather than threaded through every template. */
const BASE = String(argOf("base", process.env.SITE_BASE || "")).replace(/\/+$/, "");
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
    writePage(p, render(P.areaDetail(lang, a, ORIGIN), lang, p));
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
<meta http-equiv="refresh" content="0; url=${BASE}/tr">
<meta name="robots" content="noindex">
<script>
  var l = (navigator.language || "tr").slice(0, 2).toLowerCase();
  location.replace(${JSON.stringify(BASE)} + (l === "de" ? "/de" : l === "en" ? "/en" : "/tr"));
</script>
</head>
<body><a href="/tr">Saba Özmen Avukatlık Ortaklığı</a></body>
</html>`, "utf8");

// Cloudflare Pages / Netlify serve this file as the 404 document.
fs.copyFileSync(path.join(OUT, "tr", "404", "index.html"), path.join(OUT, "404.html"));

// Old site's URLs (/tr/modul/...) — already indexed by Google and linked from
// elsewhere. Static hosts such as GitHub Pages cannot answer with a 301, so each
// one also gets a stub page: meta-refresh plus a canonical pointing at the new
// page, which search engines treat as a permanent redirect.
const LEGACY = JSON.parse(fs.readFileSync(path.join(__dirname, "content", "legacy-redirects.json"), "utf8"));
const legacyLines = [];
const legacyNoFile = {};
for (const [from, to] of Object.entries(LEGACY)) {
  let target = layout.url(to.lang, to.key, to.slug);
  if (!fs.existsSync(path.join(OUT, target.slice(1), "index.html"))) {
    // the page was hidden or deleted since the map was made: use the section
    target = layout.url(to.lang, to.key);
    if (!fs.existsSync(path.join(OUT, target.slice(1), "index.html"))) {
      console.error("  x legacy redirect %s has no target (not even %s)", from, target);
      process.exitCode = 1;
      continue;
    }
  }
  // "/tr/modul/x" -> tr/modul/x.html: both GitHub Pages and Cloudflare serve an
  // extensionless URL from the matching .html file, without a trailing-slash hop.
  // Old and new URL are the same (e.g. /tr/iletisim): a stub would loop.
  if (from === target) continue;
  // A section URL that also has children (/tr/modul/kurumsal) is a directory
  // too; hosts differ on whether x.html or x/index.html wins, so write both.
  const isDir = Object.keys(LEGACY).some((k) => k.startsWith(from + "/"));
  const files = [path.join(OUT, from.slice(1) + ".html")];
  if (isDir) files.push(path.join(OUT, from.slice(1), "index.html"));
  // Some old article slugs exceed the 255-byte filename limit of every
  // filesystem (and Windows caps whole paths at 260). Those are resolved by the
  // 404 page instead, which carries a small lookup table.
  const tooLong = Buffer.byteLength(path.basename(files[0])) > 250 ||
    (process.platform === "win32" && files.some((f) => f.length >= 259));
  if (tooLong) { legacyNoFile[from] = target; legacyLines.push(`${from}  ${target}  301`); continue; }
  for (const file of files) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file,
`<!doctype html>
<html lang="${to.lang}">
<head>
<meta charset="utf-8">
<title>Saba Özmen Avukatlık Ortaklığı</title>
<link rel="canonical" href="${ORIGIN}${target}">
<meta http-equiv="refresh" content="0; url=${BASE}${target}">
<meta name="robots" content="noindex">
</head>
<body><a href="${target}">${target}</a></body>
</html>`, "utf8");
  }
  legacyLines.push(`${from}  ${target}  301`);
}
console.log("  %d legacy URLs redirected", legacyLines.length);
if (Object.keys(legacyNoFile).length) {
  const f404 = path.join(OUT, "404.html");
  const body = "(function(){var m=" + JSON.stringify(legacyNoFile) +
    ",b=" + JSON.stringify(BASE) + ",p=location.pathname.replace(/[/]+$/,'');" +
    "if(b&&p.indexOf(b)===0)p=p.slice(b.length);try{p=decodeURIComponent(p)}catch(e){}" +
    "if(m[p])location.replace(b+m[p]);})();";
  // Escaping mistakes in generated JS fail silently in the browser; parse it here.
  try { new Function(body); } catch (e) {
    console.error("  x 404 redirect script does not parse: %s", e.message);
    process.exitCode = 1;
  }
  fs.writeFileSync(f404, fs.readFileSync(f404, "utf8")
    .replace("</head>", "<script>" + body + "</script>\n</head>"), "utf8");
  console.log("  %d legacy URLs too long for a file; resolved by 404.html", Object.keys(legacyNoFile).length);
}

fs.writeFileSync(path.join(OUT, "_redirects"),
`/  /tr  302
${legacyLines.join("\n")}
`, "utf8");

// Custom domain for GitHub Pages. It lives in the published branch, so it has
// to be part of every build or a redeploy silently drops the domain.
const CNAME = String(argOf("cname", process.env.SITE_CNAME || "")).trim();
if (CNAME) fs.writeFileSync(path.join(OUT, "CNAME"), CNAME + "\n", "utf8");
// GitHub Pages must not run Jekyll over the output (it would hide _headers etc.)
fs.writeFileSync(path.join(OUT, ".nojekyll"), "", "utf8");

fs.writeFileSync(path.join(OUT, "_headers"),
`/*
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com; font-src 'self'; connect-src 'self'; frame-src https://www.google.com https://maps.google.com; upgrade-insecure-requests
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
  const each = (items, key, pri, img) => items.forEach((it) => {
    const alts = {};
    LANGS.forEach((x) => { alts[x] = ORIGIN + layout.url(x, key, it.slug); });
    const images = img ? [img(it)].filter(Boolean).map((p) => ORIGIN + p) : [];
    urls.push({ loc: ORIGIN + layout.url(lang, key, it.slug), pri, alts, images });
  });
  each(areas, "areas", "0.6");
  each(P.ARTICLES, "articles", "0.8");
  each(store.team.published(), "team", "0.6", (m) => m.photo);
  each(store.events.published(), "events", "0.6", (e) => e.poster);
}

fs.writeFileSync(path.join(OUT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
${LANGS.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${u.alts[x]}"/>`).join("\n")}
${(u.images || []).map((i) => `    <image:image><image:loc>${i}</image:loc></image:image>\n`).join("")}    <priority>${u.pri}</priority>
  </url>`).join("\n")}
</urlset>
`, "utf8");

// robots.txt and llms.txt come from lib/seo.js, shared with the dev server
const SEO = require("./lib/seo");
fs.writeFileSync(path.join(OUT, "robots.txt"), SEO.robots(ORIGIN), "utf8");
fs.writeFileSync(path.join(OUT, "llms.txt"), SEO.llms(ORIGIN), "utf8");
fs.writeFileSync(path.join(OUT, "llms-full.txt"), SEO.llmsFull(ORIGIN), "utf8");
console.log("  sitemap: %d urls", urls.length);

/* ------------------------------------------- policy that survives any host */
// A static host has no /api/contact, so the form can post to the Cloudflare
// function instead: CONTACT_ENDPOINT=https://sabaozmen.pages.dev/api/contact
const CONTACT_ENDPOINT = String(argOf("contact-endpoint", process.env.CONTACT_ENDPOINT || "")).trim();
const CONTACT_ORIGIN = CONTACT_ENDPOINT ? new URL(CONTACT_ENDPOINT).origin : "";
// GitHub Pages ignores _headers, so the Content-Security-Policy is also put in
// every page. frame-ancestors is not allowed in a meta tag; everything else is.
{
  const extra = CONTACT_ORIGIN ? " " + CONTACT_ORIGIN : "";
  const CSP_META = "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" + extra + "; " +
    "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com; " +
    "font-src 'self'; connect-src 'self'" + extra + "; frame-src https://www.google.com https://maps.google.com; " +
    "upgrade-insecure-requests";
  const tag = '<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="' + CSP_META + '">\n' +
    '<meta name="referrer" content="strict-origin-when-cross-origin">';
  let n = 0;
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) {
        const html = fs.readFileSync(p, "utf8");
        if (html.includes("Content-Security-Policy")) continue;
        let out = html.replace(/<meta charset="utf-8">(\s*<meta name="referrer"[^>]*>)?/i, tag);
        if (CONTACT_ENDPOINT) out = out.replace(/action="\/api\/contact"/g, `action="${CONTACT_ENDPOINT}"`);
        if (out !== html) { fs.writeFileSync(p, out, "utf8"); n++; }
      }
    }
  })(OUT);
  console.log("  CSP meta added to %d pages", n);
  if (CONTACT_ENDPOINT) {
    const contact = fs.readFileSync(path.join(OUT, "tr", "iletisim", "index.html"), "utf8");
    if (!contact.includes(`action="${CONTACT_ENDPOINT}"`)) {
      console.error("  x contact form was not pointed at %s", CONTACT_ENDPOINT);
      process.exitCode = 1;
    } else {
      console.log("  contact form → %s", CONTACT_ENDPOINT);
    }
  }
}

/* ------------------------------------------------------- base-path rewrite */
if (BASE) {
  let touched = 0;
  const rewrite = (html) => html
    .replace(/(\s(?:href|src|content)=")\/(?!\/)/g, `$1${BASE}/`)
    // srcset holds a comma-separated list, so every entry needs prefixing —
    // missing this left the responsive hero sources pointing outside the base
    // path and the image silently failed to load.
    .replace(/\ssrcset="([^"]+)"/g, (m, list) =>
      ' srcset="' + list.split(",").map((part) => {
        const t = part.trim();
        return t.startsWith("/") && !t.startsWith("//") ? BASE + t : t;
      }).join(", ") + '"')
    .replace(/(url\(")\/(?!\/)/g, `$1${BASE}/`);
  (function walkHtml(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walkHtml(p);
      else if (/\.(html|xml|txt)$/.test(e.name)) {
        const before = fs.readFileSync(p, "utf8");
        const after = rewrite(before);
        if (after !== before) { fs.writeFileSync(p, after, "utf8"); touched++; }
      }
    }
  })(OUT);
  // CSS references fonts with absolute paths too
  const css = path.join(OUT, "css", "main.css");
  fs.writeFileSync(css, fs.readFileSync(css, "utf8").replace(/url\("\//g, `url("${BASE}/`), "utf8");
  const fcss = path.join(OUT, "fonts", "fonts.css");
  fs.writeFileSync(fcss, fs.readFileSync(fcss, "utf8").replace(/url\(\//g, `url(${BASE}/`), "utf8");
  console.log("  base path %s applied to %d files", BASE, touched);
  // Assert nothing escaped the rewrite. Built with RegExp() because a regex
  // *literal* does not interpolate ${...} — the first version of this check
  // silently matched nothing and reported every URL as stray.
  const sample = fs.readFileSync(path.join(OUT, "tr", "index.html"), "utf8");
  const esc = BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const strayAttr = new RegExp('(?:src|href)="/(?!' + esc.slice(1) + '/)[a-z]', "g");
  const stray = sample.match(strayAttr) || [];
  // srcset is a comma-separated list, so each candidate is checked on its own —
  // one regex over the whole attribute misses everything after the first entry.
  for (const m of sample.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (u.startsWith("/") && !u.startsWith("//") && !u.startsWith(BASE + "/")) stray.push(u);
    }
  }
  if (stray.length) {
    console.error("  x %d absolute URL(s) escaped the base path rewrite: %s",
      stray.length, [...new Set(stray)].slice(0, 5).join(" "));
    process.exitCode = 1;
  } else {
    console.log("  base path verified: no absolute URLs escaped");
  }

}

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
