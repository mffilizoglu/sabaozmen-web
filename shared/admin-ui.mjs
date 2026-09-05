/* Admin panel markup — shared by the Node dev server and the Cloudflare Worker.

   Pure rendering only: every function takes its data as arguments and returns a
   string. No file system, no fetch, no runtime-specific API, so the identical
   module runs under Node (via require(), supported from Node 22) and in the
   Workers runtime (via import). One implementation, so the two cannot drift.

   Turkish interface throughout — the people using it are the firm's own staff.
*/

export const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const attr = esc;

export const EVENT_TYPES = ["tv", "konferans", "kongre", "etkinlik"];
export const TYPE_TR = {
  tv: "TV Programı", konferans: "Konferans", kongre: "Kongre", etkinlik: "Etkinlik",
};

/* ------------------------------------------------------------------ shell */
export function shell(o) {
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
      <input type="hidden" name="_csrf" value="${attr(o.csrf)}">
      <button class="ad-btn ad-btn--quiet" type="submit">Çıkış</button>
    </form>
  </div>
</header>
<main class="ad-main">
  ${o.flash ? `<div class="ad-flash ad-flash--${esc(o.flash.kind)}">${esc(o.flash.text)}</div>` : ""}
  ${o.body}
</main>
<script src="/js/admin.js" defer></script>
</body>
</html>`;
}

export function loginPage(err, csrf) {
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
    <input type="hidden" name="_csrf" value="${attr(csrf)}">
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

const articlePicker = (id, articles, chosenSet) => `
  <div class="ad-search"><input type="search" data-filter="#${id}" placeholder="Makalelerde ara…"></div>
  <div class="ad-picklist" id="${id}">
    ${articles.map((a) => `<label class="ad-pick" data-text="${attr(a.title.tr + " " + (a.coAuthor || ""))}">
      <input type="checkbox" name="articleSlugs" value="${attr(a.slug)}"${chosenSet.has(a.slug) ? " checked" : ""}>
      <span>${esc(a.title.tr)}${a.coAuthor ? ` <em class="ad-muted">— ${esc(a.coAuthor)}</em>` : ""}</span>
    </label>`).join("")}
  </div>`;

/* ============================================================== ATTORNEYS */
export function teamList({ members, csrf, flash }) {
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
  return shell({ title: "Avukatlarımız", active: "/admin/avukatlar", body, flash, csrf });
}

export function teamForm({ member, articles, csrf, flash }) {
  const isNew = !member;
  const v = member || { role: {}, academic: {}, bio: {}, articleSlugs: [], published: true };
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
    <input type="hidden" name="_csrf" value="${attr(csrf)}">

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
      ${articlePicker("artpick", articles, chosen)}
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
  return shell({ title: isNew ? "Yeni avukat" : v.name, active: "/admin/avukatlar", body, flash, csrf });
}

/* ================================================================= EVENTS */
export function eventList({ events, csrf, flash }) {
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
      <input type="hidden" name="_csrf" value="${attr(csrf)}">
      <button class="ad-btn" type="submit">Örnek kayıtlarla doldur</button>
    </form>
    <br><span class="ad-small ad-muted">Örnekler açıkça “ÖRNEK” etiketlidir ve gizli oluşturulur; düzenleyip yayına alabilir veya silebilirsiniz.</span></p>`}`;
  return shell({ title: "Etkinlikler", active: "/admin/etkinlikler", body, flash, csrf });
}

export function eventForm({ event, articles, csrf, flash }) {
  const isNew = !event;
  const v = event || { title: {}, venue: {}, summary: {}, body: {}, type: "etkinlik", articleSlugs: [], published: true };
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
    <input type="hidden" name="_csrf" value="${attr(csrf)}">

    <section class="ad-card">
      <h2>Tür ve tarih</h2>
      <div class="ad-grid2">
        <label class="ad-field">
          <span>Tür</span>
          <select name="type">
            ${EVENT_TYPES.map((t) => `<option value="${attr(t)}"${v.type === t ? " selected" : ""}>${esc(TYPE_TR[t])}</option>`).join("")}
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
      ${articlePicker("evartpick", articles, chosen)}
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
  return shell({ title: isNew ? "Yeni etkinlik" : (v.title && v.title.tr) || "Etkinlik", active: "/admin/etkinlikler", body, flash, csrf });
}

/* ------------------------------------------------------- shared save logic */
export const TR_MAP = {
  "ı": "i", "İ": "i", "ş": "s", "Ş": "s", "ğ": "g", "Ğ": "g",
  "ü": "u", "Ü": "u", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c",
  "â": "a", "î": "i", "û": "u",
};

export function slugify(s, maxLen) {
  const out = String(s || "")
    .split("").map((c) => (TR_MAP[c] !== undefined ? TR_MAP[c] : c)).join("")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return out.slice(0, maxLen || 70).replace(/-+$/, "") || "kayit";
}

export function uniqueSlug(slug, taken, selfSlug) {
  const set = new Set(taken.filter((s) => s !== selfSlug));
  if (!set.has(slug)) return slug;
  let n = 2;
  while (set.has(slug + "-" + n)) n++;
  return slug + "-" + n;
}

export function pickLangs(f, base) {
  const g = (k) => String(f[base + "_" + k] || "").trim();
  return { tr: g("tr"), en: g("en"), de: g("de") };
}

export function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/** Sample events, created hidden and clearly labelled. */
export function sampleEvents() {
  const samples = [
    { type: "konferans", tr: "ÖRNEK — Kat Mülkiyetinde Arsa Payının Düzeltilmesi Paneli",
      venue: "Örnek Üniversitesi Hukuk Fakültesi", city: "İstanbul", date: "2026-04-18" },
    { type: "tv", tr: "ÖRNEK — Kentsel Dönüşümde Hak Sahipliği (TV programı)",
      venue: "Örnek TV — Hukuk Gündemi", city: "İstanbul", date: "2026-02-06" },
    { type: "kongre", tr: "ÖRNEK — Taşınmaz Hukuku Kongresi",
      venue: "Örnek Kongre Merkezi", city: "Ankara", date: "2025-11-21" },
  ];
  const taken = [];
  return samples.map((s, i) => {
    const slug = uniqueSlug(slugify(s.tr), taken);
    taken.push(slug);
    return {
      slug, type: s.type,
      title: { tr: s.tr, en: "", de: "" },
      venue: { tr: s.venue, en: "", de: "" },
      summary: { tr: "Bu bir örnek kayıttır. Düzenleyip yayına alabilir veya silebilirsiniz.", en: "", de: "" },
      body: { tr: "", en: "", de: "" },
      city: s.city, date: s.date, endDate: "", link: "",
      speakers: [], articleSlugs: [], poster: "",
      published: false, order: i + 1,
    };
  });
}

/* Image sniffing — trust the bytes, not the extension or Content-Type. */
export function sniffImage(bytes) {
  if (!bytes || bytes.length < 12) return null;
  const b = bytes;
  const ascii = (a, n) => String.fromCharCode(...b.subarray(a, a + n));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: ".jpg", type: "image/jpeg" };
  if (b[0] === 0x89 && ascii(1, 3) === "PNG") return { ext: ".png", type: "image/png" };
  if (/^GIF8[79]a$/.test(ascii(0, 6))) return { ext: ".gif", type: "image/gif" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return { ext: ".webp", type: "image/webp" };
  return null;
}
