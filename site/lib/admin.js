"use strict";

/* Admin panel — attorneys and events.
   Turkish interface: the people using it are the firm's own staff. */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const D = require("../content/data");
const store = require("./store");
const auth = require("./auth");
const mp = require("./multipart");
const { esc, attr } = require("./layout");

const ART = require("../content/articles.json");
const ARTICLES = ART.articles;

const UPLOADS = path.join(__dirname, "..", "public", "uploads");
const TYPE_TR = { tv: "TV Programı", konferans: "Konferans", kongre: "Kongre", etkinlik: "Etkinlik" };

/* ------------------------------------------------------------------ shell */
function shell(o) {
  const nav = [
    ["/admin/avukatlar", "Avukatlarımız"],
    ["/admin/etkinlikler", "Etkinlikler"],
  ];
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${esc(o.title)} — Yönetim</title>
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body>
<header class="ad-hdr">
  <a class="ad-brand" href="/admin/avukatlar">
    <img src="/img/mark.svg" alt="" width="26" height="26">
    <span>Saba Özmen <b>Yönetim</b></span>
  </a>
  <nav class="ad-nav">
    ${nav.map(([h, l]) => `<a href="${h}"${o.active === h ? ' class="is-on"' : ""}>${esc(l)}</a>`).join("")}
  </nav>
  <div class="ad-hdr__end">
    <a class="ad-link" href="/tr" target="_blank" rel="noopener">Siteyi gör ↗</a>
    <form method="post" action="/admin/cikis" style="display:inline">
      <input type="hidden" name="_csrf" value="${attr(auth.csrfToken())}">
      <button class="ad-btn ad-btn--quiet" type="submit">Çıkış</button>
    </form>
  </div>
</header>
<main class="ad-main">
  ${o.flash ? `<div class="ad-flash ad-flash--${o.flash.kind}">${esc(o.flash.text)}</div>` : ""}
  ${o.body}
</main>
<script src="/js/admin.js" defer></script>
</body>
</html>`;
}

function loginPage(err) {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Giriş — Saba Özmen Yönetim</title>
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body class="ad-login-body">
  <form class="ad-login" method="post" action="/admin/giris">
    <img src="/img/mark.svg" alt="" width="46" height="46">
    <h1>Yönetim paneli</h1>
    <p class="ad-muted">Devam etmek için parolanızı girin.</p>
    ${err ? `<div class="ad-flash ad-flash--bad">${esc(err)}</div>` : ""}
    <input type="hidden" name="_csrf" value="${attr(auth.csrfToken())}">
    <label class="ad-field">
      <span>Parola</span>
      <input type="password" name="password" autocomplete="current-password" required autofocus>
    </label>
    <button class="ad-btn ad-btn--primary" type="submit">Giriş yap</button>
  </form>
</body>
</html>`;
}

/* ------------------------------------------------------------- form parts */
const field = (label, name, value, opts) => {
  const o = opts || {};
  return `<label class="ad-field${o.wide ? " ad-field--wide" : ""}">
    <span>${esc(label)}${o.hint ? ` <em>${esc(o.hint)}</em>` : ""}</span>
    ${o.rows
      ? `<textarea name="${attr(name)}" rows="${o.rows}"${o.ph ? ` placeholder="${attr(o.ph)}"` : ""}>${esc(value || "")}</textarea>`
      : `<input type="${o.type || "text"}" name="${attr(name)}" value="${attr(value || "")}"${o.ph ? ` placeholder="${attr(o.ph)}"` : ""}${o.required ? " required" : ""}>`}
  </label>`;
};

const langTabs = (base, values, label, opts) => {
  const o = opts || {};
  return `<div class="ad-i18n">
    <div class="ad-i18n__label">${esc(label)}</div>
    <div class="ad-i18n__grid">
      ${["tr", "en", "de"].map((l) => `<label class="ad-field">
        <span>${l.toUpperCase()}</span>
        ${o.rows
          ? `<textarea name="${attr(base)}_${l}" rows="${o.rows}">${esc((values && values[l]) || "")}</textarea>`
          : `<input type="text" name="${attr(base)}_${l}" value="${attr((values && values[l]) || "")}">`}
      </label>`).join("")}
    </div>
  </div>`;
};

/* ============================================================== ATTORNEYS */
function teamList(flash) {
  const members = store.team.all();
  const body = `
  <div class="ad-head">
    <div><h1>Avukatlarımız</h1><p class="ad-muted">Sıra, fotoğraf, metin ve eşleştirilmiş makaleler.</p></div>
    <a class="ad-btn ad-btn--primary" href="/admin/avukatlar/yeni">+ Yeni avukat</a>
  </div>
  <table class="ad-table">
    <thead><tr><th></th><th>Ad</th><th>Görev</th><th>Makale</th><th>Durum</th><th></th></tr></thead>
    <tbody>
      ${members.map((m) => `<tr>
        <td class="ad-thumb">${m.photo
          ? `<img src="${attr(m.photo)}" alt="">`
          : `<span class="ad-thumb__none">—</span>`}</td>
        <td><strong>${esc(m.name)}</strong><br><span class="ad-muted ad-small">${esc(m.slug)}</span></td>
        <td>${esc((m.role && m.role.tr) || "")}</td>
        <td>${(m.articleSlugs || []).length}</td>
        <td>${m.published === false ? '<span class="ad-pill ad-pill--off">Gizli</span>' : '<span class="ad-pill">Yayında</span>'}</td>
        <td class="ad-right"><a class="ad-btn" href="/admin/avukatlar/${attr(m.slug)}">Düzenle</a></td>
      </tr>`).join("")}
    </tbody>
  </table>
  ${members.length ? "" : '<p class="ad-empty">Henüz avukat kaydı yok.</p>'}`;
  return shell({ title: "Avukatlarımız", active: "/admin/avukatlar", body, flash });
}

function teamForm(m, flash) {
  const isNew = !m;
  const v = m || { role: {}, academic: {}, bio: {}, articleSlugs: [], published: true };
  const chosen = new Set(v.articleSlugs || []);
  const body = `
  <div class="ad-head">
    <div>
      <h1>${isNew ? "Yeni avukat" : esc(v.name)}</h1>
      <p class="ad-muted">${isNew ? "Yeni kayıt oluşturun." : "Bilgileri güncelleyin."}</p>
    </div>
    <a class="ad-link" href="/admin/avukatlar">← Listeye dön</a>
  </div>

  <form class="ad-form" method="post" action="/admin/avukatlar/${isNew ? "yeni" : attr(v.slug)}" enctype="multipart/form-data">
    <input type="hidden" name="_csrf" value="${attr(auth.csrfToken())}">

    <section class="ad-card">
      <h2>Kimlik</h2>
      <div class="ad-grid2">
        ${field("Ad Soyad (unvanla birlikte)", "name", v.name, { required: true, ph: "Prof. Dr. Etem Sabâ Özmen" })}
        ${field("E-posta", "email", v.email, { type: "email" })}
      </div>
      ${langTabs("role", v.role, "Görev / sıfat")}
      ${langTabs("academic", v.academic, "Akademik görev (varsa)")}
    </section>

    <section class="ad-card">
      <h2>Fotoğraf</h2>
      <div class="ad-photo">
        <div class="ad-photo__prev">
          ${v.photo ? `<img src="${attr(v.photo)}" alt=""><span class="ad-small ad-muted">${esc(v.photo)}</span>`
                    : `<span class="ad-thumb__none">Fotoğraf yok</span>`}
        </div>
        <div class="ad-photo__ctl">
          <label class="ad-field">
            <span>Yeni fotoğraf yükle <em>JPG / PNG / WebP, en fazla 6 MB</em></span>
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp">
          </label>
          <p class="ad-small ad-muted">Portreler 3:4 oranında kırpılarak gösterilir. Beş avukat için aynı ışıkta çekilmiş portreler önerilir.</p>
          ${v.photo ? `<label class="ad-check"><input type="checkbox" name="photo_clear" value="1"> Mevcut fotoğrafı kaldır</label>` : ""}
        </div>
      </div>
    </section>

    <section class="ad-card">
      <h2>Mevzuatın izin verdiği bilgiler</h2>
      <p class="ad-small ad-muted">TBB Reklam Yasağı Yönetmeliği bu bilgilerin internet sitesinde yer almasına açıkça izin verir. Boş bırakılan alanlar sitede görünmez.</p>
      <div class="ad-grid2">
        ${field("Baro sicil no", "barNo", v.barNo)}
        ${field("Mesleğe başlama", "startYear", v.startYear, { ph: "2004" })}
        ${field("Mezun olduğu fakülte", "faculty", v.faculty)}
        ${field("Yabancı diller", "languages", v.languages, { ph: "İngilizce, Almanca" })}
        ${field("ORCID", "orcid", v.orcid, { ph: "0000-0002-8622-9660" })}
      </div>
    </section>

    <section class="ad-card">
      <h2>Özgeçmiş metni</h2>
      ${langTabs("bio", v.bio, "Kısa özgeçmiş", { rows: 5 })}
    </section>

    <section class="ad-card">
      <h2>Makale eşleştirme</h2>
      <p class="ad-small ad-muted">Bu avukata ait yayınları işaretleyin; profil sayfasında listelenir.</p>
      <div class="ad-search"><input type="search" data-filter="#artpick" placeholder="Makalelerde ara…"></div>
      <div class="ad-picklist" id="artpick">
        ${ARTICLES.map((a) => `<label class="ad-pick" data-text="${attr(a.title.tr + " " + (a.coAuthor || ""))}">
          <input type="checkbox" name="articleSlugs" value="${attr(a.slug)}"${chosen.has(a.slug) ? " checked" : ""}>
          <span>${esc(a.title.tr)}${a.coAuthor ? ` <em class="ad-muted">— ${esc(a.coAuthor)}</em>` : ""}</span>
        </label>`).join("")}
      </div>
    </section>

    <section class="ad-card">
      <h2>Yayın durumu</h2>
      <label class="ad-check"><input type="checkbox" name="published" value="1"${v.published !== false ? " checked" : ""}> Sitede görünsün</label>
      ${isNew ? "" : field("Sıra", "order", v.order, { type: "number" })}
    </section>

    <div class="ad-actions">
      <button class="ad-btn ad-btn--primary" type="submit">Kaydet</button>
      <a class="ad-btn" href="/admin/avukatlar">Vazgeç</a>
      ${isNew ? "" : `<button class="ad-btn ad-btn--danger" type="submit" formaction="/admin/avukatlar/${attr(v.slug)}/sil"
        data-confirm="${attr(v.name + " kaydı silinecek. Emin misiniz?")}">Sil</button>`}
    </div>
  </form>`;
  return shell({ title: isNew ? "Yeni avukat" : v.name, active: "/admin/avukatlar", body, flash });
}

/* ================================================================= EVENTS */
function eventList(flash) {
  const events = store.events.all();
  const body = `
  <div class="ad-head">
    <div><h1>Etkinlikler</h1><p class="ad-muted">TV programları, konferanslar, kongreler ve etkinlikler.</p></div>
    <a class="ad-btn ad-btn--primary" href="/admin/etkinlikler/yeni">+ Yeni etkinlik</a>
  </div>
  <table class="ad-table">
    <thead><tr><th></th><th>Başlık</th><th>Tür</th><th>Tarih</th><th>Durum</th><th></th></tr></thead>
    <tbody>
      ${events.map((e) => `<tr>
        <td class="ad-thumb">${e.poster ? `<img src="${attr(e.poster)}" alt="">` : `<span class="ad-thumb__none">—</span>`}</td>
        <td><strong>${esc((e.title && e.title.tr) || "(başlıksız)")}</strong><br><span class="ad-muted ad-small">${esc(e.slug)}</span></td>
        <td>${esc(TYPE_TR[e.type] || e.type)}</td>
        <td>${esc(e.date || "—")}</td>
        <td>${e.published === false ? '<span class="ad-pill ad-pill--off">Gizli</span>' : '<span class="ad-pill">Yayında</span>'}</td>
        <td class="ad-right"><a class="ad-btn" href="/admin/etkinlikler/${attr(e.slug)}">Düzenle</a></td>
      </tr>`).join("")}
    </tbody>
  </table>
  ${events.length ? "" : `<p class="ad-empty">Henüz etkinlik yok.
    <form method="post" action="/admin/etkinlikler/ornek" style="display:inline">
      <input type="hidden" name="_csrf" value="${attr(auth.csrfToken())}">
      <button class="ad-btn" type="submit">Örnek kayıtlarla doldur</button>
    </form>
    <br><span class="ad-small ad-muted">Örnekler açıkça “ÖRNEK” etiketlidir ve gizli oluşturulur; düzenleyip yayına alabilir veya silebilirsiniz.</span></p>`}`;
  return shell({ title: "Etkinlikler", active: "/admin/etkinlikler", body, flash });
}

function eventForm(e, flash) {
  const isNew = !e;
  const v = e || { title: {}, venue: {}, summary: {}, body: {}, type: "etkinlik", articleSlugs: [], published: true };
  const chosen = new Set(v.articleSlugs || []);
  const body = `
  <div class="ad-head">
    <div>
      <h1>${isNew ? "Yeni etkinlik" : esc((v.title && v.title.tr) || v.slug)}</h1>
      <p class="ad-muted">${isNew ? "Yeni kayıt oluşturun." : "Bilgileri güncelleyin."}</p>
    </div>
    <a class="ad-link" href="/admin/etkinlikler">← Listeye dön</a>
  </div>

  <form class="ad-form" method="post" action="/admin/etkinlikler/${isNew ? "yeni" : attr(v.slug)}" enctype="multipart/form-data">
    <input type="hidden" name="_csrf" value="${attr(auth.csrfToken())}">

    <section class="ad-card">
      <h2>Tür ve tarih</h2>
      <div class="ad-grid2">
        <label class="ad-field">
          <span>Tür</span>
          <select name="type">
            ${store.EVENT_TYPES.map((t) => `<option value="${attr(t)}"${v.type === t ? " selected" : ""}>${esc(TYPE_TR[t])}</option>`).join("")}
          </select>
        </label>
        ${field("Şehir", "city", v.city, { ph: "İstanbul" })}
        ${field("Tarih", "date", v.date, { type: "date" })}
        ${field("Bitiş tarihi (çok günlü ise)", "endDate", v.endDate, { type: "date" })}
      </div>
    </section>

    <section class="ad-card">
      <h2>Başlık ve yer</h2>
      ${langTabs("title", v.title, "Başlık")}
      ${langTabs("venue", v.venue, "Yer / program adı")}
      ${field("Bağlantı (varsa)", "link", v.link, { type: "url", ph: "https://…", wide: true })}
      ${field("Katılımcılar", "speakers", (v.speakers || []).join(", "), { ph: "Prof. Dr. Etem Sabâ Özmen, …", wide: true })}
    </section>

    <section class="ad-card">
      <h2>Afiş</h2>
      <div class="ad-photo">
        <div class="ad-photo__prev ad-photo__prev--poster">
          ${v.poster ? `<img src="${attr(v.poster)}" alt=""><span class="ad-small ad-muted">${esc(v.poster)}</span>`
                     : `<span class="ad-thumb__none">Afiş yok</span>`}
        </div>
        <div class="ad-photo__ctl">
          <label class="ad-field">
            <span>Afiş yükle <em>JPG / PNG / WebP, en fazla 6 MB</em></span>
            <input type="file" name="poster" accept="image/jpeg,image/png,image/webp">
          </label>
          <p class="ad-small ad-muted">Liste görünümünde 4:5 oranında kırpılır; detay sayfasında tam boy gösterilir.</p>
          ${v.poster ? `<label class="ad-check"><input type="checkbox" name="poster_clear" value="1"> Mevcut afişi kaldır</label>` : ""}
        </div>
      </div>
    </section>

    <section class="ad-card">
      <h2>Metin</h2>
      ${langTabs("summary", v.summary, "Kısa özet (liste ve arama motorları için)", { rows: 3 })}
      ${langTabs("body", v.body, "Ayrıntılı metin (boş satır bırakarak paragraf ayırın)", { rows: 7 })}
    </section>

    <section class="ad-card">
      <h2>Makale eşleştirme</h2>
      <div class="ad-search"><input type="search" data-filter="#evartpick" placeholder="Makalelerde ara…"></div>
      <div class="ad-picklist" id="evartpick">
        ${ARTICLES.map((a) => `<label class="ad-pick" data-text="${attr(a.title.tr + " " + (a.coAuthor || ""))}">
          <input type="checkbox" name="articleSlugs" value="${attr(a.slug)}"${chosen.has(a.slug) ? " checked" : ""}>
          <span>${esc(a.title.tr)}</span>
        </label>`).join("")}
      </div>
    </section>

    <section class="ad-card">
      <h2>Yayın durumu</h2>
      <label class="ad-check"><input type="checkbox" name="published" value="1"${v.published !== false ? " checked" : ""}> Sitede görünsün</label>
    </section>

    <div class="ad-actions">
      <button class="ad-btn ad-btn--primary" type="submit">Kaydet</button>
      <a class="ad-btn" href="/admin/etkinlikler">Vazgeç</a>
      ${isNew ? "" : `<button class="ad-btn ad-btn--danger" type="submit" formaction="/admin/etkinlikler/${attr(v.slug)}/sil"
        data-confirm="Bu etkinlik silinecek. Emin misiniz?">Sil</button>`}
    </div>
  </form>`;
  return shell({ title: isNew ? "Yeni etkinlik" : (v.title && v.title.tr) || "Etkinlik", active: "/admin/etkinlikler", body, flash });
}

/* ---------------------------------------------------------------- saving */
function pickLangs(f, base) {
  return { tr: (f[base + "_tr"] || "").trim(), en: (f[base + "_en"] || "").trim(), de: (f[base + "_de"] || "").trim() };
}

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function saveUpload(file, kind) {
  const sig = mp.sniffImage(file.data);
  if (!sig) throw new Error("Yalnızca JPG, PNG, GIF veya WebP yükleyebilirsiniz.");
  const dir = path.join(UPLOADS, kind);
  fs.mkdirSync(dir, { recursive: true });
  const name = crypto.randomBytes(8).toString("hex") + sig.ext;
  fs.writeFileSync(path.join(dir, name), file.data);
  return "/uploads/" + kind + "/" + name;
}

function removeUpload(rel) {
  // only ever delete inside public/uploads
  if (!rel || !rel.startsWith("/uploads/")) return;
  const p = path.join(__dirname, "..", "public", rel.replace(/^\//, ""));
  if (!p.startsWith(UPLOADS)) return;
  try { fs.unlinkSync(p); } catch (e) { /* already gone */ }
}

function saveTeam(slug, fields, files) {
  const list = store.team.all();
  const isNew = slug === "yeni";
  const idx = isNew ? -1 : list.findIndex((m) => m.slug === slug);
  if (!isNew && idx === -1) throw new Error("Kayıt bulunamadı.");

  const name = (fields.name || "").trim();
  if (!name) throw new Error("Ad Soyad zorunludur.");

  const prev = isNew ? {} : list[idx];
  const m = Object.assign({}, prev, {
    name,
    slug: isNew ? store.uniqueSlug(store.slugify(name), list.map((x) => x.slug)) : prev.slug,
    role: pickLangs(fields, "role"),
    academic: pickLangs(fields, "academic"),
    bio: pickLangs(fields, "bio"),
    email: (fields.email || "").trim(),
    barNo: (fields.barNo || "").trim(),
    startYear: (fields.startYear || "").trim(),
    faculty: (fields.faculty || "").trim(),
    languages: (fields.languages || "").trim(),
    orcid: (fields.orcid || "").trim(),
    articleSlugs: asArray(fields.articleSlugs),
    published: fields.published === "1",
    photo: prev.photo || "",
  });
  if (!isNew && fields.order) m.order = parseInt(fields.order, 10) || prev.order || 0;
  if (isNew) m.order = list.length + 1;

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

  const title = pickLangs(fields, "title");
  if (!title.tr) throw new Error("Türkçe başlık zorunludur.");
  const type = store.EVENT_TYPES.includes(fields.type) ? fields.type : "etkinlik";

  const prev = isNew ? {} : list[idx];
  const e = Object.assign({}, prev, {
    slug: isNew ? store.uniqueSlug(store.slugify(title.tr), list.map((x) => x.slug)) : prev.slug,
    type, title,
    venue: pickLangs(fields, "venue"),
    summary: pickLangs(fields, "summary"),
    body: pickLangs(fields, "body"),
    city: (fields.city || "").trim(),
    date: (fields.date || "").trim(),
    endDate: (fields.endDate || "").trim(),
    link: (fields.link || "").trim(),
    speakers: (fields.speakers || "").split(",").map((s) => s.trim()).filter(Boolean),
    articleSlugs: asArray(fields.articleSlugs),
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

/* Sample events — created hidden and clearly labelled, so nothing invented
   can reach the public site by accident. */
function seedEvents() {
  const list = store.events.all();
  if (list.length) return 0;
  const samples = [
    { type: "konferans", tr: "ÖRNEK — Kat Mülkiyetinde Arsa Payının Düzeltilmesi Paneli",
      venue: "Örnek Üniversitesi Hukuk Fakültesi", city: "İstanbul", date: "2026-04-18" },
    { type: "tv", tr: "ÖRNEK — Kentsel Dönüşümde Hak Sahipliği (TV programı)",
      venue: "Örnek TV — Hukuk Gündemi", city: "İstanbul", date: "2026-02-06" },
    { type: "kongre", tr: "ÖRNEK — Taşınmaz Hukuku Kongresi",
      venue: "Örnek Kongre Merkezi", city: "Ankara", date: "2025-11-21" },
  ];
  const out = samples.map((s, i) => ({
    slug: store.uniqueSlug(store.slugify(s.tr), list.map((x) => x.slug)),
    type: s.type,
    title: { tr: s.tr, en: "", de: "" },
    venue: { tr: s.venue, en: "", de: "" },
    summary: { tr: "Bu bir örnek kayıttır. Düzenleyip yayına alabilir veya silebilirsiniz.", en: "", de: "" },
    body: { tr: "", en: "", de: "" },
    city: s.city, date: s.date, endDate: "", link: "",
    speakers: [], articleSlugs: [], poster: "",
    published: false,
    order: i + 1,
  }));
  store.events.save(out);
  return out.length;
}

module.exports = {
  shell, loginPage, teamList, teamForm, eventList, eventForm,
  saveTeam, saveEvent, deleteTeam, deleteEvent, seedEvents,
};
