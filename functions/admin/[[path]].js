/* Admin panel on Cloudflare Pages Functions.

   Storage is the GitHub repo (see _lib/github.js for why, not KV). Saving
   commits content/team.json, events.json or articles.json — and any uploaded
   image or PDF —
   which triggers a Pages rebuild, so the change is live in about a minute.

   Required Pages environment variables:
     ADMIN_PASSWORD   secret
     SESSION_SECRET   secret — any long random string
     GITHUB_TOKEN     secret — fine-grained PAT, Contents: read and write
     GITHUB_OWNER     e.g. mertfilizoglu
     GITHUB_REPO      e.g. sabaozmen-web
     GITHUB_BRANCH    optional, defaults to main
*/

import * as UI from "../../shared/admin-ui.mjs";
import * as auth from "../_lib/auth.js";
import * as gh from "../_lib/github.js";
import DATA from "../../site/content/data.js";

const AREAS = DATA.areas.map((a) => ({ slug: a.slug, name: a.name.tr }));
const esc = UI.esc;

const TEAM_PATH = "site/content/team.json";
const EVENTS_PATH = "site/content/events.json";
const ARTICLES_PATH = "site/content/articles.json";
const UPLOAD_DIR = "site/public/uploads";
const MAX_UPLOAD = 6 * 1024 * 1024;

const html = (body, status, extra) =>
  new Response(body, {
    status: status || 200,
    headers: Object.assign({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy":
        "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; " +
        "form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; font-src 'self'; connect-src 'self'",
    }, extra || {}),
  });

const redirect = (to, extra) =>
  new Response(null, {
    status: 302,
    headers: Object.assign({ Location: to, "Cache-Control": "no-store" }, extra || {}),
  });

function configError(missing) {
  return html(`<!doctype html><meta charset="utf-8"><title>Yapılandırma eksik</title>
<body style="font:15px/1.6 system-ui;max-width:34rem;margin:12vh auto;padding:0 1.5rem;color:#3a3330">
<h1 style="font:500 1.4rem Georgia,serif;color:#14100f">Yönetim paneli yapılandırılmamış</h1>
<p>Cloudflare Pages projesinde şu ortam değişkenleri tanımlanmalıdır:</p>
<ul>${missing.map((m) => `<li><code>${m}</code></li>`).join("")}</ul>
<p class="ad-muted" style="color:#99908b">Pages → Settings → Environment variables</p>
</body>`, 503);
}

/* ------------------------------------------------------------- form input */
async function readForm(request) {
  const fields = {};
  const files = {};
  const fd = await request.formData();
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") {
      if (Object.prototype.hasOwnProperty.call(fields, k)) {
        if (!Array.isArray(fields[k])) fields[k] = [fields[k]];
        fields[k].push(v);
      } else {
        fields[k] = v;
      }
    } else if (v && v.size) {
      // Article PDFs may be up to 20 MB (measured: well within a Worker's
      // limits); images stay at 6 MB.
      if (k === "pdf" ? v.size > UI.PDF_MAX : v.size > MAX_UPLOAD) {
        throw new Error(k === "pdf" ? "PDF çok büyük (en fazla 20 MB)." : "Dosya çok büyük (en fazla 6 MB).");
      }
      files[k] = { name: v.name, bytes: new Uint8Array(await v.arrayBuffer()) };
    }
  }
  return { fields, files };
}

async function randomName(ext) {
  const b = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("") + ext;
}

/* ------------------------------------------------------------------ save */
async function saveRecord(env, kind, slug, fields, files, commitFiles) {
  const isTeam = kind === "team";
  const path = isTeam ? TEAM_PATH : EVENTS_PATH;
  const key = isTeam ? "team" : "events";
  const { data, sha } = await gh.getJson(env, path, { [key]: [] });
  const list = data[key] || [];

  const isNew = slug === "yeni";
  const idx = isNew ? -1 : list.findIndex((x) => x.slug === slug);
  if (!isNew && idx === -1) throw new Error("Kayıt bulunamadı.");
  const prev = isNew ? {} : list[idx];

  let rec;
  if (isTeam) {
    const name = String(fields.name || "").trim();
    if (!name) throw new Error("Ad Soyad zorunludur.");
    rec = Object.assign({}, prev, {
      name,
      slug: isNew ? UI.uniqueSlug(UI.slugify(name), list.map((x) => x.slug)) : prev.slug,
      role: UI.pickLangs(fields, "role"),
      academic: UI.pickLangs(fields, "academic"),
      bio: UI.pickLangs(fields, "bio"),
      email: String(fields.email || "").trim(),
      barNo: String(fields.barNo || "").trim(),
      startYear: String(fields.startYear || "").trim(),
      faculty: String(fields.faculty || "").trim(),
      languages: String(fields.languages || "").trim(),
      orcid: String(fields.orcid || "").trim(),
      articleSlugs: UI.asArray(fields.articleSlugs),
      published: fields.published === "1",
      photo: prev.photo || "",
    });
    rec.order = isNew ? list.length + 1 : (parseInt(fields.order, 10) || prev.order || 0);
  } else {
    const { data: td } = await gh.getJson(env, TEAM_PATH, { team: [] });
    rec = UI.buildEvent(fields, isNew ? null : prev, list, {
      team: (td.team || []).map((m) => m.slug), areas: AREAS.map((a) => a.slug),
    });
  }

  const imgField = isTeam ? "photo" : "poster";
  const sub = isTeam ? "team" : "events";
  const file = files[imgField];
  if (file) {
    const sig = UI.sniffImage(file.bytes);
    if (!sig) throw new Error("Yalnızca JPG, PNG, GIF veya WebP yükleyebilirsiniz.");
    const name = await randomName(sig.ext);
    commitFiles.push({ path: `${UPLOAD_DIR}/${sub}/${name}`, content: file.bytes });
    rec[imgField] = `/uploads/${sub}/${name}`;
    if (!isTeam) {
      const dim = UI.imageSize(file.bytes);
      rec.posterW = dim ? dim.w : undefined;
      rec.posterH = dim ? dim.h : undefined;
    }
    if (prev[imgField] && prev[imgField].startsWith("/uploads/")) {
      commitFiles.push({ path: `site/public${prev[imgField]}`, delete: true });
    }
  } else if (fields[imgField + "_clear"] === "1") {
    if (prev[imgField] && prev[imgField].startsWith("/uploads/")) {
      commitFiles.push({ path: `site/public${prev[imgField]}`, delete: true });
    }
    rec[imgField] = "";
    if (!isTeam) { delete rec.posterW; delete rec.posterH; }
  }

  if (isNew) list.push(rec); else list[idx] = rec;
  commitFiles.push({ path, content: JSON.stringify({ [key]: list }, null, 1) + "\n" });
  return rec;
}

async function deleteRecord(env, kind, slug, commitFiles) {
  const isTeam = kind === "team";
  const path = isTeam ? TEAM_PATH : EVENTS_PATH;
  const key = isTeam ? "team" : "events";
  const { data } = await gh.getJson(env, path, { [key]: [] });
  const list = data[key] || [];
  const rec = list.find((x) => x.slug === slug);
  const img = rec && (isTeam ? rec.photo : rec.poster);
  if (img && img.startsWith("/uploads/")) commitFiles.push({ path: `site/public${img}`, delete: true });
  commitFiles.push({
    path,
    content: JSON.stringify({ [key]: list.filter((x) => x.slug !== slug) }, null, 1) + "\n",
  });
}

/* --------------------------------------------------------------- articles */
async function saveArticle(env, slug, fields, files, commitFiles) {
  const { data: doc } = await gh.getJson(env, ARTICLES_PATH, { tags: [], articles: [] });
  const list = doc.articles || [];
  const isNew = slug === "yeni";
  const idx = isNew ? -1 : list.findIndex((a) => a.slug === slug);
  if (!isNew && idx === -1) throw new Error("Kayıt bulunamadı.");
  const rec = UI.buildArticle(fields, isNew ? null : list[idx], list, doc.tags);

  if (files.pdf) {
    if (!UI.isPdf(files.pdf.bytes)) throw new Error("Yüklenen dosya PDF değil.");
    rec.pdf = UI.pdfPathFor(rec.id);
    commitFiles.push({ path: "site/public" + rec.pdf, content: files.pdf.bytes });
  }

  if (isNew) list.push(rec); else list[idx] = rec;
  commitFiles.push({ path: ARTICLES_PATH, content: UI.articlesDoc(doc, list) });

  const { data: td } = await gh.getJson(env, TEAM_PATH, { team: [] });
  const team = UI.linkMembers(td.team || [], rec.slug, fields.teamSlugs);
  if (team) commitFiles.push({ path: TEAM_PATH, content: JSON.stringify({ team }, null, 1) + "\n" });
  return rec;
}

async function deleteArticle(env, slug, commitFiles) {
  const { data: doc } = await gh.getJson(env, ARTICLES_PATH, { tags: [], articles: [] });
  const list = doc.articles || [];
  const rec = list.find((a) => a.slug === slug);
  if (!rec) return;
  if (rec.pdf && rec.pdf.startsWith("/makaleler/pdf/")) commitFiles.push({ path: "site/public" + rec.pdf, delete: true });
  commitFiles.push({ path: ARTICLES_PATH, content: UI.articlesDoc(doc, list.filter((a) => a.slug !== slug)) });
  // nothing may keep pointing at a removed article
  const { data: td } = await gh.getJson(env, TEAM_PATH, { team: [] });
  const team = UI.unlinkEverywhere(td.team || [], slug);
  if (team) commitFiles.push({ path: TEAM_PATH, content: JSON.stringify({ team }, null, 1) + "\n" });
  const { data: ed } = await gh.getJson(env, EVENTS_PATH, { events: [] });
  const events = UI.unlinkEverywhere(ed.events || [], slug);
  if (events) commitFiles.push({ path: EVENTS_PATH, content: JSON.stringify({ events }, null, 1) + "\n" });
}

/* ---------------------------------------------------------------- router */
export async function onRequest(context) {
  const { request, env } = context;

  const missing = ["ADMIN_PASSWORD", "SESSION_SECRET", "GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"]
    .filter((k) => !env[k]);
  if (missing.length) return configError(missing);

  const url = new URL(request.url);
  const sub = url.pathname.split("/").filter(Boolean).slice(1);   // after "admin"
  const csrf = await auth.csrfToken(env);
  const authed = await auth.isAuthed(request, env);

  /* -- login / logout -- */
  if (request.method === "POST" && sub[0] === "giris") {
    const { fields } = await readForm(request);
    if (!(await auth.csrfOk(env, fields._csrf))) {
      return html(UI.loginPage("Oturum süresi doldu, tekrar deneyin.", csrf), 403);
    }
    if (!auth.verifyPassword(env, fields.password || "")) {
      return html(UI.loginPage("Parola hatalı.", csrf), 401);
    }
    return redirect("/admin/avukatlar", { "Set-Cookie": await auth.loginCookie(env) });
  }
  if (request.method === "POST" && sub[0] === "cikis") {
    return redirect("/admin", { "Set-Cookie": auth.logoutCookie() });
  }

  if (!authed) {
    if (request.method !== "GET") return html(UI.loginPage("Önce giriş yapın.", csrf), 401);
    return html(UI.loginPage(null, csrf));
  }

  const loadTeam = async () => {
    const { data } = await gh.getJson(env, TEAM_PATH, { team: [] });
    return (data.team || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  };
  const loadArticleDoc = async () => (await gh.getJson(env, ARTICLES_PATH, { tags: [], articles: [] })).data;
  const loadArticles = async () => (await loadArticleDoc()).articles || [];
  const articleForm = async (a, flash) => {
    const [doc, team] = await Promise.all([loadArticleDoc(), loadTeam()]);
    return UI.articleForm({ article: a, tags: doc.tags, team, csrf, flash });
  };
  const loadEvents = async () => {
    const { data } = await gh.getJson(env, EVENTS_PATH, { events: [] });
    return (data.events || []).slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  };

  /* If GitHub is unreachable or the token has expired, say so in plain Turkish.
     An unhandled 500 here would read as "the panel is broken" when the real
     cause is a credential that needs renewing. */
  function storageError(err) {
    const detail = String((err && err.message) || err);
    const expired = /\b(401|403)\b/.test(detail);
    return html(`<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>İçeriğe ulaşılamadı — Yönetim</title>
<link rel="stylesheet" href="/css/admin.css"></head>
<body><main class="ad-main">
<div class="ad-flash ad-flash--bad">İçerik deposuna (GitHub) ulaşılamadı.</div>
<h1>İçeriğe şu anda ulaşılamıyor</h1>
<p class="ad-muted">${expired
  ? "GitHub erişim anahtarı geçersiz veya süresi dolmuş görünüyor. Cloudflare Pages → Settings → Environment variables altındaki <code>GITHUB_TOKEN</code> değerini yenileyin."
  : "Site içeriği GitHub deposunda tutulur ve bu isteğe yanıt alınamadı. Birkaç dakika sonra tekrar deneyin."}</p>
<p class="ad-small ad-muted" style="margin-top:1.5rem">Teknik ayrıntı: ${esc(detail).slice(0, 300)}</p>
<p style="margin-top:1.5rem"><a class="ad-btn" href="/admin/avukatlar">Tekrar dene</a></p>
</main></body></html>`, 502);
  }

  /* -- GET -- */
  if (request.method === "GET") {
    if (!sub.length) return redirect("/admin/avukatlar");
    try {
    if (sub[0] === "avukatlar") {
      const members = await loadTeam();
      if (sub.length === 1) return html(UI.teamList({ members, csrf }));
      const articles = await loadArticles();
      if (sub[1] === "yeni") return html(UI.teamForm({ member: null, articles, csrf }));
      const m = members.find((x) => x.slug === sub[1]);
      if (!m) return html(UI.teamList({ members, csrf, flash: { kind: "bad", text: "Kayıt bulunamadı." } }), 404);
      return html(UI.teamForm({ member: m, articles, csrf }));
    }

    if (sub[0] === "makaleler") {
      const articles = await loadArticles();
      if (sub.length === 1) return html(UI.articleList({ articles, csrf }));
      if (sub[1] === "yeni") return html(await articleForm(null));
      const a = articles.find((x) => x.slug === sub[1]);
      if (!a) return html(UI.articleList({ articles, csrf, flash: { kind: "bad", text: "Kayıt bulunamadı." } }), 404);
      return html(await articleForm(a));
    }

    if (sub[0] === "etkinlikler") {
      const events = await loadEvents();
      if (sub.length === 1) return html(UI.eventList({ events, csrf }));
      const articles = await loadArticles();
      const team = await loadTeam();
      if (sub[1] === "yeni") return html(UI.eventForm({ event: null, articles, team, areas: AREAS, csrf }));
      const e = events.find((x) => x.slug === sub[1]);
      if (!e) return html(UI.eventList({ events, csrf, flash: { kind: "bad", text: "Kayıt bulunamadı." } }), 404);
      return html(UI.eventForm({ event: e, articles, team, areas: AREAS, csrf }));
    }
    return redirect("/admin/avukatlar");
    } catch (err) {
      return storageError(err);
    }
  }

  /* -- POST -- */
  const listPage = async (flash) => {
    if (sub[0] === "etkinlikler") return UI.eventList({ events: await loadEvents(), csrf, flash });
    if (sub[0] === "makaleler") return UI.articleList({ articles: await loadArticles(), csrf, flash });
    return UI.teamList({ members: await loadTeam(), csrf, flash });
  };

  if (request.method === "POST") {
    let parsed;
    try {
      parsed = await readForm(request);
    } catch (err) {
      return html(await listPage({ kind: "bad", text: err.message || "Form okunamadı." }), 413);
    }
    const { fields, files } = parsed;
    if (!(await auth.csrfOk(env, fields._csrf))) {
      return html(await listPage({ kind: "bad", text: "Oturum doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin." }), 403);
    }

    if (sub[0] === "makaleler") {
      const commitFiles = [];
      try {
        if (sub[2] === "sil") {
          await deleteArticle(env, sub[1], commitFiles);
          if (commitFiles.length) await gh.commitFiles(env, commitFiles, `Yönetim: makale silindi (${sub[1]})`);
          return redirect("/admin/makaleler");
        }
        const rec = await saveArticle(env, sub[1], fields, files, commitFiles);
        await gh.commitFiles(env, commitFiles, `Yönetim: makale güncellendi (${rec.slug})`);
        return redirect("/admin/makaleler/" + encodeURIComponent(rec.slug));
      } catch (err) {
        const text = err.message === "conflict"
          ? "Başka bir değişiklik araya girdi. Sayfayı yenileyip tekrar kaydedin."
          : (err.message || "Kaydedilemedi.");
        try {
          const a = sub[1] === "yeni" ? UI.draftArticle(fields) : (await loadArticles()).find((x) => x.slug === sub[1]);
          return html(await articleForm(a || null, { kind: "bad", text }), 400);
        } catch (inner) {
          return storageError(err);
        }
      }
    }

    const isTeam = sub[0] === "avukatlar";
    const kind = isTeam ? "team" : "events";
    const back = isTeam ? "/admin/avukatlar" : "/admin/etkinlikler";
    const commitFiles = [];

    try {
      if (sub[0] === "etkinlikler" && sub[1] === "ornek") {
        const events = await loadEvents();
        if (!events.length) {
          commitFiles.push({
            path: EVENTS_PATH,
            content: JSON.stringify({ events: UI.sampleEvents() }, null, 1) + "\n",
          });
          await gh.commitFiles(env, commitFiles, "Yönetim: örnek etkinlikler eklendi");
        }
        return redirect(back);
      }

      if (sub[2] === "sil") {
        await deleteRecord(env, kind, sub[1], commitFiles);
        await gh.commitFiles(env, commitFiles, `Yönetim: ${isTeam ? "avukat" : "etkinlik"} silindi (${sub[1]})`);
        return redirect(back);
      }

      const rec = await saveRecord(env, kind, sub[1], fields, files, commitFiles);
      await gh.commitFiles(env, commitFiles,
        `Yönetim: ${isTeam ? "avukat" : "etkinlik"} güncellendi (${rec.slug})`);
      return redirect(back + "/" + encodeURIComponent(rec.slug));
    } catch (err) {
      const text = err.message === "conflict"
        ? "Başka bir değişiklik araya girdi. Sayfayı yenileyip tekrar kaydedin."
        : (err.message || "Kaydedilemedi.");
      const flash = { kind: "bad", text };
      try {
        if (isTeam) {
          const members = await loadTeam();
          const m = sub[1] === "yeni" ? null : members.find((x) => x.slug === sub[1]);
          return html(UI.teamForm({ member: m, articles: await loadArticles(), csrf, flash }), 400);
        }
        const events = await loadEvents();
        const e = sub[1] === "yeni" ? null : events.find((x) => x.slug === sub[1]);
        return html(UI.eventForm({ event: e, articles: await loadArticles(), team: await loadTeam(), areas: AREAS, csrf, flash }), 400);
      } catch (inner) {
        return storageError(err);
      }
    }
  }

  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, POST" } });
}
