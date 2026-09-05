"use strict";

/* Saba Özmen Avukatlık Ortaklığı — dev/preview server.
   Zero dependencies: `node server.js` and open the printed URL. */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const D = require("./content/data");
const { LANGS, routes, areas } = D;
const P = require("./lib/pages");
const layout = require("./lib/layout");

const PORT = parseInt(process.env.PORT || "4321", 10);
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC = path.join(__dirname, "public");
const INBOX = path.join(__dirname, "messages");

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".pdf": "application/pdf",
  ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/* Reverse lookup: for a language, map a URL slug back to a route key. */
const slugToKey = {};
LANGS.forEach((l) => {
  slugToKey[l] = {};
  Object.keys(routes).forEach((k) => { slugToKey[l][routes[k][l]] = k; });
});

const areaBySlug = Object.fromEntries(areas.map((a) => [a.slug, a]));
const artBySlug = Object.fromEntries(P.ARTICLES.map((a) => [a.slug, a]));
const store = require("./lib/store");
const auth = require("./lib/auth");
const admin = require("./lib/admin");
const mp = require("./lib/multipart");

function send(res, status, body, type, extra) {
  const headers = Object.assign({
    "Content-Type": type || "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  }, extra || {});
  res.writeHead(status, headers);
  res.end(body);
}

function serveStatic(req, res, pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, "");
  const file = path.join(PUBLIC, rel);
  // never escape the public root
  if (!file.startsWith(PUBLIC)) return send(res, 403, "Forbidden", "text/plain");

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return false || notFoundPage(req, res);
    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const cache = /\.(woff2?|png|jpe?g|svg|webp|pdf)$/.test(ext)
      ? "public, max-age=604800"
      : "public, max-age=0, must-revalidate";
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": st.size,
      "Cache-Control": cache,
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(file).pipe(res);
  });
}

function origin(req) {
  const host = req.headers.host || `${HOST}:${PORT}`;
  return `http://${host}`;
}

function render(req, res, view, status) {
  const html = layout.page(Object.assign({ origin: origin(req) }, view));
  send(res, status || 200, html);
}

function pickLang(req) {
  const al = (req.headers["accept-language"] || "").toLowerCase();
  if (/^de\b|,de\b/.test(al)) return "de";
  if (/^en\b|,en\b/.test(al)) return "en";
  return "tr";
}

function notFoundPage(req, res, lang) {
  const l = lang || pickLang(req);
  const view = P.notFound(l);
  view.lang = l;
  view.path = req.url;
  render(req, res, view, 404);
}

/* --------------------------------------------------------------- sitemap */
function sitemap(req, res) {
  const o = origin(req);
  const urls = [];
  const add = (loc, priority, alts) => urls.push({ loc, priority, alts });

  LANGS.forEach((l) => {
    Object.keys(routes).forEach((k) => {
      const alts = {};
      LANGS.forEach((x) => { alts[x] = o + layout.url(x, k); });
      add(o + layout.url(l, k), k === "home" ? "1.0" : "0.7", alts);
    });
    areas.forEach((a) => {
      const alts = {};
      LANGS.forEach((x) => { alts[x] = o + layout.url(x, "areas", a.slug); });
      add(o + layout.url(l, "areas", a.slug), "0.6", alts);
    });
    P.ARTICLES.forEach((a) => {
      const alts = {};
      LANGS.forEach((x) => { alts[x] = o + layout.url(x, "articles", a.slug); });
      add(o + layout.url(l, "articles", a.slug), "0.8", alts);
    });
    store.team.published().forEach((m) => {
      const alts = {};
      LANGS.forEach((x) => { alts[x] = o + layout.url(x, "team", m.slug); });
      add(o + layout.url(l, "team", m.slug), "0.6", alts);
    });
    store.events.published().forEach((e) => {
      const alts = {};
      LANGS.forEach((x) => { alts[x] = o + layout.url(x, "events", e.slug); });
      add(o + layout.url(l, "events", e.slug), "0.6", alts);
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
${LANGS.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${u.alts[x]}"/>`).join("\n")}
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
  send(res, 200, xml, MIME[".xml"]);
}

/* --------------------------------------------------------------- contact */
function handleContact(req, res) {
  let raw = "";
  req.on("data", (c) => {
    raw += c;
    if (raw.length > 20000) { req.destroy(); }
  });
  req.on("end", () => {
    let d = {};
    try { d = JSON.parse(raw || "{}"); } catch (e) { d = {}; }
    const lang = LANGS.includes(d.lang) ? d.lang : "tr";
    const { T } = require("./content/i18n");

    // honeypot: silently accept, never store
    if (d.website) return send(res, 200, JSON.stringify({ ok: true, message: T("ct.ok", lang) }), MIME[".json"]);

    const ok = d.name && d.email && d.message && d.consent &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email));
    if (!ok) {
      return send(res, 400, JSON.stringify({ ok: false, message: T("ct.err", lang) }), MIME[".json"]);
    }

    // No mail server in this environment — messages are written to ./messages
    // so nothing is silently lost. Replace with SMTP when the site goes live.
    try {
      fs.mkdirSync(INBOX, { recursive: true });
      const f = path.join(INBOX, new Date().toISOString().replace(/[:.]/g, "-") + ".json");
      fs.writeFileSync(f, JSON.stringify({ at: new Date().toISOString(), ip: req.socket.remoteAddress, ...d }, null, 1), "utf8");
      console.log("  ✉  message saved →", path.relative(__dirname, f));
    } catch (e) {
      console.error("  ✉  could not save message:", e.message);
      return send(res, 500, JSON.stringify({ ok: false, message: T("ct.err", lang) }), MIME[".json"]);
    }
    send(res, 200, JSON.stringify({ ok: true, message: T("ct.ok", lang) }), MIME[".json"]);
  });
}

/* ----------------------------------------------------------------- admin */
function adminHtml(res, html, status, extraHeaders) {
  send(res, status || 200, html, "text/html; charset=utf-8",
       Object.assign({ "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" }, extraHeaders || {}));
}

function redirect(res, to, extraHeaders) {
  res.writeHead(302, Object.assign({ Location: to, "Cache-Control": "no-store" }, extraHeaders || {}));
  res.end();
}

async function handleAdmin(req, res, seg) {
  const sub = seg.slice(1);                       // after "admin"
  const authed = auth.isAuthed(req);

  /* ---- login / logout ---- */
  if (req.method === "POST" && sub[0] === "giris") {
    const { fields } = await mp.parseRequest(req);
    if (!auth.csrfOk(fields._csrf)) return adminHtml(res, admin.loginPage("Oturum süresi doldu, tekrar deneyin."), 403);
    if (!auth.verify(fields.password || "")) {
      console.log("  ⚠  admin: hatalı parola denemesi (" + req.socket.remoteAddress + ")");
      return adminHtml(res, admin.loginPage("Parola hatalı."), 401);
    }
    return redirect(res, "/admin/avukatlar", { "Set-Cookie": auth.loginCookie() });
  }
  if (req.method === "POST" && sub[0] === "cikis") {
    return redirect(res, "/admin", { "Set-Cookie": auth.logoutCookie() });
  }

  if (!authed) {
    if (req.method !== "GET") return adminHtml(res, admin.loginPage("Önce giriş yapın."), 401);
    return adminHtml(res, admin.loginPage(null), 200);
  }

  /* ---- authenticated ---- */
  if (req.method === "GET") {
    if (!sub.length) return redirect(res, "/admin/avukatlar");
    if (sub[0] === "avukatlar") {
      if (sub.length === 1) return adminHtml(res, admin.teamList(null));
      if (sub[1] === "yeni") return adminHtml(res, admin.teamForm(null, null));
      const m = store.team.bySlug(sub[1]);
      if (!m) return adminHtml(res, admin.teamList({ kind: "bad", text: "Kayıt bulunamadı." }), 404);
      return adminHtml(res, admin.teamForm(m, null));
    }
    if (sub[0] === "etkinlikler") {
      if (sub.length === 1) return adminHtml(res, admin.eventList(null));
      if (sub[1] === "yeni") return adminHtml(res, admin.eventForm(null, null));
      const e = store.events.bySlug(sub[1]);
      if (!e) return adminHtml(res, admin.eventList({ kind: "bad", text: "Kayıt bulunamadı." }), 404);
      return adminHtml(res, admin.eventForm(e, null));
    }
    return adminHtml(res, admin.teamList({ kind: "bad", text: "Sayfa bulunamadı." }), 404);
  }

  if (req.method === "POST") {
    let parsed;
    try {
      parsed = await mp.parseRequest(req);
    } catch (err) {
      const msg = err.message === "too-large" || err.message === "file-too-large"
        ? "Dosya çok büyük (en fazla 6 MB)." : "Form okunamadı.";
      const back = sub[0] === "etkinlikler" ? admin.eventList : admin.teamList;
      return adminHtml(res, back({ kind: "bad", text: msg }), 413);
    }
    const { fields, files } = parsed;
    if (!auth.csrfOk(fields._csrf)) {
      const back = sub[0] === "etkinlikler" ? admin.eventList : admin.teamList;
      return adminHtml(res, back({ kind: "bad", text: "Oturum doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin." }), 403);
    }

    try {
      if (sub[0] === "avukatlar") {
        if (sub[2] === "sil") { admin.deleteTeam(sub[1]); return redirect(res, "/admin/avukatlar"); }
        const m = admin.saveTeam(sub[1], fields, files);
        return redirect(res, "/admin/avukatlar/" + encodeURIComponent(m.slug));
      }
      if (sub[0] === "etkinlikler") {
        if (sub[1] === "ornek") { admin.seedEvents(); return redirect(res, "/admin/etkinlikler"); }
        if (sub[2] === "sil") { admin.deleteEvent(sub[1]); return redirect(res, "/admin/etkinlikler"); }
        const e = admin.saveEvent(sub[1], fields, files);
        return redirect(res, "/admin/etkinlikler/" + encodeURIComponent(e.slug));
      }
    } catch (err) {
      const isTeam = sub[0] === "avukatlar";
      const flash = { kind: "bad", text: err.message || "Kaydedilemedi." };
      if (isTeam) {
        const m = sub[1] === "yeni" ? null : store.team.bySlug(sub[1]);
        return adminHtml(res, admin.teamForm(m, flash), 400);
      }
      const e = sub[1] === "yeni" ? null : store.events.bySlug(sub[1]);
      return adminHtml(res, admin.eventForm(e, flash), 400);
    }
  }
  return send(res, 405, "Method Not Allowed", "text/plain");
}

/* --------------------------------------------------------------- router */
const server = http.createServer((req, res) => {
  const u = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = u.pathname;

  const segAll = pathname.split("/").filter(Boolean);
  if (segAll[0] === "admin") {
    return handleAdmin(req, res, segAll).catch((e) => {
      console.error("  ! admin error:", e);
      send(res, 500, "Sunucu hatası", "text/plain");
    });
  }

  if (req.method === "POST" && pathname === "/api/contact") return handleContact(req, res);
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method Not Allowed", "text/plain");

  if (pathname === "/robots.txt") {
    return send(res, 200, `User-agent: *\nAllow: /\n\nSitemap: ${origin(req)}/sitemap.xml\n`, MIME[".txt"]);
  }
  if (pathname === "/sitemap.xml") return sitemap(req, res);

  // static assets
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return serveStatic(req, res, pathname);

  const seg = pathname.split("/").filter(Boolean);

  // "/" → language redirect
  if (seg.length === 0) {
    res.writeHead(302, { Location: "/" + pickLang(req) });
    return res.end();
  }

  const lang = seg[0];
  if (!LANGS.includes(lang)) return notFoundPage(req, res);

  const rest = seg.slice(1);
  const mk = (view) => {
    view.lang = lang;
    view.path = pathname;
    return render(req, res, view);
  };

  // /:lang
  if (rest.length === 0) return mk(P.home(lang, origin(req)));

  // Resolve the longest matching slug (corporate routes have two segments)
  const two = rest.slice(0, 2).join("/");
  const one = rest[0];
  let key = slugToKey[lang][two];
  let tail = rest.slice(2);
  if (!key) { key = slugToKey[lang][one]; tail = rest.slice(1); }
  if (!key) return notFoundPage(req, res, lang);

  switch (key) {
    case "home":    return mk(P.home(lang, origin(req)));
    case "about":   return mk(P.about(lang));
    case "vision":  return mk(P.vision(lang));
    case "quality": return mk(P.quality(lang));
    case "career":  return mk(P.career(lang));
    case "team":
      if (!tail.length) return mk(P.teamPage(lang));
      { const m = store.team.bySlug(tail[0]);
        if (m && m.published !== false) return mk(P.teamDetail(lang, m, origin(req))); }
      return notFoundPage(req, res, lang);
    case "events":
      if (!tail.length) return mk(P.eventList(lang));
      { const e = store.events.bySlug(tail[0]);
        if (e && e.published !== false) return mk(P.eventDetail(lang, e, origin(req))); }
      return notFoundPage(req, res, lang);
    case "contact": return mk(P.contact(lang));
    case "privacy": return mk(P.legal(lang, "privacy"));
    case "cookies": return mk(P.legal(lang, "cookies"));
    case "areas":
      if (!tail.length) return mk(P.areaList(lang));
      if (areaBySlug[tail[0]]) return mk(P.areaDetail(lang, areaBySlug[tail[0]]));
      return notFoundPage(req, res, lang);
    case "articles":
      if (!tail.length) return mk(P.articleList(lang));
      if (artBySlug[tail[0]]) return mk(P.articleDetail(lang, artBySlug[tail[0]], origin(req)));
      return notFoundPage(req, res, lang);
    default:
      return notFoundPage(req, res, lang);
  }
});

server.listen(PORT, HOST, () => {
  const n = P.ARTICLES.length;
  console.log("");
  console.log("  Saba Özmen Avukatlık Ortaklığı");
  console.log("  ──────────────────────────────────────────────");
  console.log(`  ▸  http://${HOST}:${PORT}/tr`);
  console.log(`  ▸  http://${HOST}:${PORT}/en`);
  console.log(`  ▸  http://${HOST}:${PORT}/de`);
  console.log(`  ▸  http://${HOST}:${PORT}/admin   — yönetim paneli`);
  console.log("");
  console.log(`  ${n} makale · ${areas.length} çalışma alanı · ${store.team.all().length} avukat · ${store.events.all().length} etkinlik`);
  console.log("  Form mesajları ./messages klasörüne yazılır.");
  console.log("");
});
