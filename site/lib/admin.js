"use strict";

/* Admin panel — Node dev-server side.

   The markup and the slug/language/image helpers come from
   shared/admin-ui.mjs, which the Cloudflare Worker imports too, so the local
   panel and the deployed one cannot drift apart. This file only supplies the
   storage half: the local filesystem instead of a GitHub commit.

   (Node 22+ can require() an ESM module, which is what makes one shared file
   possible; the runtime is pinned to >=18 in package.json but this path needs
   the newer behaviour and the dev server is the only consumer.)
*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const store = require("./store");
const auth = require("./auth");
const mp = require("./multipart");
const UI = require("../../shared/admin-ui.mjs");

const UPLOADS = path.join(__dirname, "..", "public", "uploads");
const ARTICLES_FILE = path.join(__dirname, "..", "content", "articles.json");
const PDF_DIR = path.join(__dirname, "..", "public", "makaleler", "pdf");

/* Read fresh on every request: the panel edits this file, so a copy cached at
   startup would show stale titles in the pickers. */
const readArticles = () => JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf8"));
const liveArticles = () => readArticles().articles || [];

function writeText(file, text) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, text, "utf8");
  fs.renameSync(tmp, file);
}

/* --------------------------------------------------------------- rendering */
const csrf = () => auth.csrfToken();

const loginPage = (err) => UI.loginPage(err, csrf());
const teamList = (flash) => UI.teamList({ members: store.team.all(), csrf: csrf(), flash });
const teamForm = (m, flash) => UI.teamForm({ member: m, articles: liveArticles(), csrf: csrf(), flash });
const eventList = (flash) => UI.eventList({ events: store.events.all(), csrf: csrf(), flash });
const eventForm = (e, flash) => UI.eventForm({ event: e, articles: liveArticles(), csrf: csrf(), flash });
const articleList = (flash) => UI.articleList({ articles: liveArticles(), csrf: csrf(), flash });
const articleForm = (a, flash) =>
  UI.articleForm({ article: a, tags: readArticles().tags, team: store.team.all(), csrf: csrf(), flash });
const articleBySlug = (slug) => liveArticles().find((a) => a.slug === slug) || null;

/* ----------------------------------------------------------------- saving */
function saveUpload(file, kind) {
  const sig = UI.sniffImage(file.data);
  if (!sig) throw new Error("Yalnızca JPG, PNG, GIF veya WebP yükleyebilirsiniz.");
  const dir = path.join(UPLOADS, kind);
  fs.mkdirSync(dir, { recursive: true });
  const name = crypto.randomBytes(8).toString("hex") + sig.ext;
  fs.writeFileSync(path.join(dir, name), file.data);
  return "/uploads/" + kind + "/" + name;
}

function removeUpload(rel) {
  if (!rel || !rel.startsWith("/uploads/")) return;
  const p = path.join(__dirname, "..", "public", rel.replace(/^\//, ""));
  if (!p.startsWith(UPLOADS)) return;               // never delete outside uploads
  try { fs.unlinkSync(p); } catch (e) { /* already gone */ }
}

function saveTeam(slug, fields, files) {
  const list = store.team.all();
  const isNew = slug === "yeni";
  const idx = isNew ? -1 : list.findIndex((m) => m.slug === slug);
  if (!isNew && idx === -1) throw new Error("Kayıt bulunamadı.");

  const name = String(fields.name || "").trim();
  if (!name) throw new Error("Ad Soyad zorunludur.");

  const prev = isNew ? {} : list[idx];
  const m = Object.assign({}, prev, {
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
  m.order = isNew ? list.length + 1 : (parseInt(fields.order, 10) || prev.order || 0);

  if (files.photo) {
    const next = saveUpload(files.photo, "team");
    removeUpload(prev.photo);
    m.photo = next;
  } else if (fields.photo_clear === "1") {
    removeUpload(prev.photo);
    m.photo = "";
  }

  if (isNew) list.push(m); else list[idx] = m;
  store.team.save(list);
  return m;
}

function saveEvent(slug, fields, files) {
  const list = store.events.all();
  const isNew = slug === "yeni";
  const idx = isNew ? -1 : list.findIndex((e) => e.slug === slug);
  if (!isNew && idx === -1) throw new Error("Kayıt bulunamadı.");

  const title = UI.pickLangs(fields, "title");
  if (!title.tr) throw new Error("Türkçe başlık zorunludur.");

  const prev = isNew ? {} : list[idx];
  const e = Object.assign({}, prev, {
    slug: isNew ? UI.uniqueSlug(UI.slugify(title.tr), list.map((x) => x.slug)) : prev.slug,
    type: UI.EVENT_TYPES.includes(fields.type) ? fields.type : "etkinlik",
    title,
    venue: UI.pickLangs(fields, "venue"),
    summary: UI.pickLangs(fields, "summary"),
    body: UI.pickLangs(fields, "body"),
    city: String(fields.city || "").trim(),
    date: String(fields.date || "").trim(),
    endDate: String(fields.endDate || "").trim(),
    link: String(fields.link || "").trim(),
    speakers: String(fields.speakers || "").split(",").map((s) => s.trim()).filter(Boolean),
    articleSlugs: UI.asArray(fields.articleSlugs),
    published: fields.published === "1",
    poster: prev.poster || "",
  });

  if (files.poster) {
    const next = saveUpload(files.poster, "events");
    removeUpload(prev.poster);
    e.poster = next;
  } else if (fields.poster_clear === "1") {
    removeUpload(prev.poster);
    e.poster = "";
  }

  if (isNew) list.push(e); else list[idx] = e;
  store.events.save(list);
  return e;
}

function deleteTeam(slug) {
  const list = store.team.all();
  const m = list.find((x) => x.slug === slug);
  if (m) removeUpload(m.photo);
  store.team.save(list.filter((x) => x.slug !== slug));
}

function deleteEvent(slug) {
  const list = store.events.all();
  const e = list.find((x) => x.slug === slug);
  if (e) removeUpload(e.poster);
  store.events.save(list.filter((x) => x.slug !== slug));
}

function saveArticle(slug, fields, files) {
  const doc = readArticles();
  const list = doc.articles || [];
  const isNew = slug === "yeni";
  const idx = isNew ? -1 : list.findIndex((a) => a.slug === slug);
  if (!isNew && idx === -1) throw new Error("Kayıt bulunamadı.");
  const rec = UI.buildArticle(fields, isNew ? null : list[idx], list, doc.tags);

  if (files.pdf) {
    if (!UI.isPdf(files.pdf.data)) throw new Error("Yüklenen dosya PDF değil.");
    rec.pdf = UI.pdfPathFor(rec.id);
    fs.mkdirSync(PDF_DIR, { recursive: true });
    fs.writeFileSync(path.join(PDF_DIR, path.basename(rec.pdf)), files.pdf.data);
  }

  if (isNew) list.push(rec); else list[idx] = rec;
  writeText(ARTICLES_FILE, UI.articlesDoc(doc, list));
  const team = UI.linkMembers(store.team.all(), rec.slug, fields.teamSlugs);
  if (team) store.team.save(team);
  return rec;
}

function deleteArticle(slug) {
  const doc = readArticles();
  const list = doc.articles || [];
  const rec = list.find((a) => a.slug === slug);
  if (!rec) return;
  if (rec.pdf && rec.pdf.startsWith("/makaleler/pdf/")) {
    try { fs.unlinkSync(path.join(PDF_DIR, path.basename(rec.pdf))); } catch (e) { /* already gone */ }
  }
  writeText(ARTICLES_FILE, UI.articlesDoc(doc, list.filter((a) => a.slug !== slug)));
  // nothing may keep pointing at a removed article
  const team = UI.unlinkEverywhere(store.team.all(), slug);
  if (team) store.team.save(team);
  const events = UI.unlinkEverywhere(store.events.all(), slug);
  if (events) store.events.save(events);
}

function seedEvents() {
  if (store.events.all().length) return 0;
  const out = UI.sampleEvents();
  store.events.save(out);
  return out.length;
}

module.exports = {
  loginPage, teamList, teamForm, eventList, eventForm,
  articleList, articleForm, articleBySlug,
  saveTeam, saveEvent, deleteTeam, deleteEvent, seedEvents,
  saveArticle, deleteArticle,
};
