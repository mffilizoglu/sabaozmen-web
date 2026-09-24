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

/* Event vocabulary — the single source for the admin form, the save logic and
   the public pages (which read labels for EN/DE from i18n.js). */
export const EVENT_TYPES = [
  "kongre", "sempozyum", "konferans", "panel", "seminer",
  "egitim", "webinar", "soylesi", "tv", "etkinlik",
];
export const TYPE_TR = {
  kongre: "Kongre", sempozyum: "Sempozyum", konferans: "Konferans", panel: "Panel",
  seminer: "Seminer", egitim: "Eğitim Programı", webinar: "Çevrimiçi Eğitim",
  soylesi: "Söyleşi", tv: "TV Programı", etkinlik: "Etkinlik",
};
/* The firm member's part in the event. */
export const EVENT_ROLES = ["konusmaci", "egitmen", "oturum-baskani", "moderator", "bilim-kurulu", "konuk"];
export const ROLE_TR = {
  konusmaci: "Konuşmacı", egitmen: "Eğitmen", "oturum-baskani": "Oturum Başkanı",
  moderator: "Moderatör", "bilim-kurulu": "Bilim Kurulu Üyesi", konuk: "Konuk",
};
/* Maps to schema.org eventAttendanceMode. */
export const EVENT_FORMATS = ["yuz-yuze", "cevrimici", "hibrit"];
export const FORMAT_TR = { "yuz-yuze": "Yüz yüze", cevrimici: "Çevrimiçi", hibrit: "Hibrit (yüz yüze + çevrimiçi)" };

/* ------------------------------------------------------------------ shell */
export function shell(o) {
  const nav = [
    ["/admin/avukatlar", "Avukatlarımız"],
    ["/admin/makaleler", "Makaleler"],
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
        ${field("Ad Soyad (unvanla birlikte)", "name", v.name, { required: true, ph: "Prof. Dr. Etem Saba Özmen" })}
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

export function eventForm({ event, articles, team, areas, csrf, flash }) {
  const isNew = !event;
  const v = event || {
    title: {}, venue: {}, summary: {}, body: {}, talks: [], type: "seminer", format: "yuz-yuze",
    roles: ["konusmaci"], articleSlugs: [], teamSlugs: [], areaSlugs: [], organizers: [], published: true,
  };
  const chosen = new Set(v.articleSlugs || []);
  const roles = new Set(v.roles || []);
  const teamSet = new Set(v.teamSlugs || []);
  const areaSet = new Set(v.areaSlugs || []);
  const talkLines = (l) => (v.talks || []).map((t) => (t && t[l]) || "").filter(Boolean).join("\n");
  const body = `
  <div class="ad-head">
    <div>
      <h1>${isNew ? "Yeni etkinlik" : esc((v.title && v.title.tr) || v.slug)}</h1>
      <p class="ad-muted">${isNew ? "Yeni kayıt oluşturun." : `Sitedeki adresi: <a class="ad-link" href="/tr/egitim-ve-kongreler/${attr(v.slug)}" target="_blank" rel="noopener">/tr/egitim-ve-kongreler/${esc(v.slug)} ↗</a>`}</p>
    </div>
    <a class="ad-link" href="/admin/etkinlikler">← Listeye dön</a>
  </div>

  <form class="ad-form" method="post" action="/admin/etkinlikler/${isNew ? "yeni" : attr(v.slug)}" enctype="multipart/form-data">
    <input type="hidden" name="_csrf" value="${attr(csrf)}">

    <section class="ad-card">
      <h2>Tür, tarih ve biçim</h2>
      <div class="ad-grid2">
        <label class="ad-field">
          <span>Tür</span>
          <select name="type">
            ${EVENT_TYPES.map((t) => `<option value="${attr(t)}"${v.type === t ? " selected" : ""}>${esc(TYPE_TR[t])}</option>`).join("")}
          </select>
        </label>
        <label class="ad-field">
          <span>Biçim</span>
          <select name="format">
            ${EVENT_FORMATS.map((f) => `<option value="${attr(f)}"${(v.format || "yuz-yuze") === f ? " selected" : ""}>${esc(FORMAT_TR[f])}</option>`).join("")}
          </select>
        </label>
        ${field("Tarih", "date", v.date, { type: "date" })}
        ${field("Bitiş tarihi (çok günlü ise)", "endDate", v.endDate, { type: "date" })}
        ${field("Başlangıç saati", "startTime", v.startTime, { type: "time" })}
        ${field("Bitiş saati", "endTime", v.endTime, { type: "time" })}
      </div>
    </section>

    <section class="ad-card">
      <h2>Başlık ve düzenleyen</h2>
      ${langTabs("title", v.title, "Etkinlik başlığı (Türkçe zorunlu)")}
      ${field("Düzenleyen kurumlar (her satıra bir kurum)", "organizers", (v.organizers || []).join("\n"), { rows: 3, wide: true, ph: "İstanbul Barosu\nÇevre Kent ve İmar Hukuku Komisyonu" })}
    </section>

    <section class="ad-card">
      <h2>Yer</h2>
      ${langTabs("venue", v.venue, "Salon / program adı (çevrimiçi ise platform, ör. Zoom)")}
      <div class="ad-grid2">
        ${field("Şehir", "city", v.city, { ph: "İstanbul" })}
        ${field("Açık adres (varsa)", "address", v.address, { ph: "İstiklal Cad. … Beyoğlu" })}
      </div>
    </section>

    <section class="ad-card">
      <h2>Katılım</h2>
      <p class="ad-small ad-muted">Etkinlikte yer alan avukatlarımız ve üstlendikleri görev. Seçilen avukatların profil sayfasında bu etkinlik listelenir.</p>
      <div class="ad-checks">
        ${(team || []).map((m) => `<label class="ad-check"><input type="checkbox" name="teamSlugs" value="${attr(m.slug)}"${teamSet.has(m.slug) ? " checked" : ""}> ${esc(m.name)}</label>`).join("")}
      </div>
      <div class="ad-checks" style="margin-top:1rem">
        ${EVENT_ROLES.map((r) => `<label class="ad-check"><input type="checkbox" name="roles" value="${attr(r)}"${roles.has(r) ? " checked" : ""}> ${esc(ROLE_TR[r])}</label>`).join("")}
      </div>
      <div class="ad-i18n" style="margin-top:1rem">
        <div class="ad-i18n__label">Sunum / tebliğ başlıkları <em class="ad-muted">(her satıra bir başlık)</em></div>
        <div class="ad-i18n__grid">
          ${["tr", "en", "de"].map((l) => `<label class="ad-field"><span>${l.toUpperCase()}</span>
            <textarea name="talks_${l}" rows="3">${esc(talkLines(l))}</textarea></label>`).join("")}
        </div>
      </div>
      ${field("Diğer katılımcılar (virgülle)", "speakers", (v.speakers || []).join(", "), { ph: "Av. Ayça Yakupoğlu, …", wide: true })}
    </section>

    <section class="ad-card">
      <h2>Program</h2>
      <p class="ad-small ad-muted">İsteğe bağlı. Oturum başlığı <code>## </code> ile, konuşma <code>- </code> ile başlar:<br>
        <code>## 10:30–12:00 | Birinci Oturum | Oturum Başkanı: Prof. Dr. …</code><br>
        <code>- Prof. Dr. … (Kurum) — Sunum başlığı</code></p>
      ${field("Program", "program", v.program, { rows: 10, wide: true })}
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
          <p class="ad-small ad-muted">Zoom kimliği, parola, IBAN gibi bilgiler içeren afişleri yüklemeden önce bu kısımları kırpın.</p>
          ${v.poster ? `<label class="ad-check"><input type="checkbox" name="poster_clear" value="1"> Mevcut afişi kaldır</label>` : ""}
        </div>
      </div>
    </section>

    <section class="ad-card">
      <h2>Metin</h2>
      ${langTabs("summary", v.summary, "Kısa özet — arama motorları ve paylaşımlar için (en fazla ~155 karakter)", { rows: 3 })}
      ${langTabs("body", v.body, "Ayrıntılı metin (boş satır bırakarak paragraf ayırın)", { rows: 7 })}
      ${field("Bağlantı (varsa)", "link", v.link, { type: "url", ph: "https://…", wide: true })}
    </section>

    <section class="ad-card">
      <h2>İlişkili içerik</h2>
      <p class="ad-small ad-muted">Çalışma alanı ve makale sayfalarından bu etkinliğe bağlantı verilir.</p>
      <div class="ad-checks">
        ${(areas || []).map((a) => `<label class="ad-check"><input type="checkbox" name="areaSlugs" value="${attr(a.slug)}"${areaSet.has(a.slug) ? " checked" : ""}> ${esc(a.name)}</label>`).join("")}
      </div>
      <div style="margin-top:1rem">${articlePicker("evartpick", articles, chosen)}</div>
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
    <p class="ad-small ad-muted">Kaydettikten sonra değişiklik yaklaşık 1–2 dakika içinde sitede görünür.</p>
  </form>`;
  return shell({ title: isNew ? "Yeni etkinlik" : (v.title && v.title.tr) || "Etkinlik", active: "/admin/etkinlikler", body, flash, csrf });
}

/* Event save logic — pure, shared by both storage back-ends. */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function buildEvent(f, prev, list, known) {
  const title = pickLangs(f, "title");
  if (!title.tr) throw new Error("Türkçe başlık zorunludur.");
  const date = String(f.date || "").trim();
  const endDate = String(f.endDate || "").trim();
  if (date && !DAY_RE.test(date)) throw new Error("Tarih geçersiz.");
  if (endDate && (!DAY_RE.test(endDate) || (date && endDate < date))) throw new Error("Bitiş tarihi başlangıçtan önce olamaz.");
  const startTime = String(f.startTime || "").trim();
  const endTime = String(f.endTime || "").trim();
  if ((startTime && !TIME_RE.test(startTime)) || (endTime && !TIME_RE.test(endTime))) throw new Error("Saat SS:DD biçiminde olmalı.");
  const link = String(f.link || "").trim();
  if (link && !/^https:\/\/[^\s]+$/.test(link)) throw new Error("Bağlantı https:// ile başlamalı.");

  const k = known || {};
  const only = (vals, allowed) => asArray(vals).filter((x) => !allowed || allowed.includes(x));
  const talks = {};
  ["tr", "en", "de"].forEach((l) => { talks[l] = lineList(f["talks_" + l]); });
  const p = prev || {};

  return Object.assign({}, p, {
    slug: prev ? p.slug : uniqueSlug(slugify(title.tr), list.map((x) => x.slug)),
    type: EVENT_TYPES.includes(f.type) ? f.type : "etkinlik",
    format: EVENT_FORMATS.includes(f.format) ? f.format : "yuz-yuze",
    title,
    venue: pickLangs(f, "venue"),
    summary: pickLangs(f, "summary"),
    body: pickLangs(f, "body"),
    city: String(f.city || "").trim(),
    address: String(f.address || "").trim(),
    date, endDate, startTime, endTime, link,
    organizers: lineList(f.organizers),
    roles: only(f.roles, EVENT_ROLES),
    talks: talks.tr.map((t, i) => ({ tr: t, en: talks.en[i] || "", de: talks.de[i] || "" })),
    program: String(f.program || "").replace(/\r\n/g, "\n").trim(),
    speakers: String(f.speakers || "").split(",").map((s) => s.trim()).filter(Boolean),
    teamSlugs: only(f.teamSlugs, k.team),
    areaSlugs: only(f.areaSlugs, k.areas),
    articleSlugs: asArray(f.articleSlugs),
    published: f.published === "1",
    poster: p.poster || "",
  });
}

/* Program mini-markup → sessions. Kept tolerant: anything unrecognised is a note.
     ## 10:30–12:00 | Birinci Oturum | Oturum Başkanı: Prof. Dr. X
     - Prof. Dr. Y (Kurum) — Başlık                                      */
export function parseProgram(text) {
  const sessions = [];
  let cur = null;
  const start = (head) => {
    const parts = head.split("|").map((s) => s.trim()).filter(Boolean);
    const time = parts[0] && /^\d{1,2}[.:]\d{2}/.test(parts[0]) ? parts.shift() : "";
    cur = { time, title: parts.shift() || "", meta: parts, items: [] };
    sessions.push(cur);
  };
  String(text || "").split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("## ")) return start(line.slice(3));
    if (!cur) start("");
    if (line.startsWith("- ")) {
      const s = line.slice(2);
      const m = s.split(/\s+[—–]\s+/);
      cur.items.push(m.length > 1 ? { who: m[0].trim(), what: m.slice(1).join(" — ").trim() } : { who: s.trim(), what: "" });
    } else {
      cur.items.push({ who: "", what: line, note: true });
    }
  });
  return sessions;
}

/* Pixel size from the file header (JPEG / PNG / WebP), for width/height attributes. */
export function imageSize(b) {
  if (!b || b.length < 30) return null;
  if (b[0] === 0x89 && b[1] === 0x50) return { w: (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0, h: (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0 };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { h: b[i + 5] << 8 | b[i + 6], w: b[i + 7] << 8 | b[i + 8] };
      }
      i += 2 + (b[i + 2] << 8 | b[i + 3]);
    }
    return null;
  }
  const ascii = (a, n) => String.fromCharCode(...b.subarray(a, a + n));
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const kind = ascii(12, 4);
    if (kind === "VP8X") return { w: 1 + (b[24] | b[25] << 8 | b[26] << 16), h: 1 + (b[27] | b[28] << 8 | b[29] << 16) };
    if (kind === "VP8 ") return { w: (b[26] | b[27] << 8) & 0x3fff, h: (b[28] | b[29] << 8) & 0x3fff };
    if (kind === "VP8L") { const x = b[21] | b[22] << 8 | b[23] << 16 | b[24] << 24; return { w: (x & 0x3fff) + 1, h: ((x >> 14) & 0x3fff) + 1 }; }
  }
  return null;
}

/* =============================================================== ARTICLES */
export const PDF_MAX = 20 * 1024 * 1024;

const missingPills = (a) => {
  const out = [];
  if (!a.summary || !a.summary.tr) out.push("Özet yok");
  if (!a.date) out.push("Tarih yok");
  if (!a.journal) out.push("Dergi yok");
  if (!a.pdf) out.push("PDF yok");
  return out.map((t) => `<span class="ad-pill ad-pill--warn">${esc(t)}</span>`).join(" ");
};

export function articleList({ articles, csrf, flash }) {
  const body = `
  <div class="ad-head">
    <div><h1>Makaleler</h1><p class="ad-muted">${articles.length} yayın. Başlık, özet, künye bilgileri ve PDF.</p></div>
    <a class="ad-btn ad-btn--primary" href="/admin/makaleler/yeni">+ Yeni makale</a>
  </div>
  <div class="ad-search"><input type="search" data-filter="#artlist" placeholder="Başlık, yazar veya dergide ara…"></div>
  <table class="ad-table" id="artlist">
    <thead><tr><th>Başlık</th><th>Tarih</th><th>Dergi</th><th>Eksikler</th><th>Durum</th><th></th></tr></thead>
    <tbody>
      ${articles.map((a) => `<tr class="ad-pick-row" data-text="${attr([a.title && a.title.tr, a.coAuthor, a.journal].filter(Boolean).join(" "))}">
        <td><strong>${esc((a.title && a.title.tr) || "(başlıksız)")}</strong>${a.coAuthor ? `<br><span class="ad-muted ad-small">${esc(a.coAuthor)} ile</span>` : ""}</td>
        <td class="ad-nowrap">${esc(a.date || "—")}</td>
        <td>${esc(a.journal || "—")}</td>
        <td>${missingPills(a)}</td>
        <td>${a.published === false ? '<span class="ad-pill ad-pill--off">Gizli</span>' : '<span class="ad-pill">Yayında</span>'}</td>
        <td class="ad-right"><a class="ad-btn" href="/admin/makaleler/${attr(a.slug)}">Düzenle</a></td>
      </tr>`).join("")}
    </tbody>
  </table>
  ${articles.length ? "" : '<p class="ad-empty">Henüz makale yok.</p>'}`;
  return shell({ title: "Makaleler", active: "/admin/makaleler", body, flash, csrf });
}

const linesOf = (arr) => (arr || []).join("\n");

/* A failed "new article" save re-renders the form with what was typed. */
export function draftArticle(f) {
  return {
    isDraft: true, slug: "",
    title: pickLangs(f, "title"), summary: pickLangs(f, "summary"),
    keywords: { tr: lineList(f.keywords_tr), en: lineList(f.keywords_en), de: lineList(f.keywords_de) },
    coAuthor: f.coAuthor, date: f.date, journal: f.journal, volume: f.volume, issue: f.issue,
    pages: f.pages, orcids: String(f.orcids || "").split(/[,\s]+/).filter(Boolean),
    topics: asArray(f.topics), published: f.published === "1",
  };
}

export function articleForm({ article, tags, team, csrf, flash }) {
  const isNew = !article || article.isDraft;
  const v = article || { title: {}, summary: {}, keywords: {}, topics: [], orcids: [], published: true };
  const topics = new Set(v.topics || []);
  const linked = new Set((team || []).filter((m) => (m.articleSlugs || []).includes(v.slug)).map((m) => m.slug));
  const body = `
  <div class="ad-head">
    <div>
      <h1>${isNew ? "Yeni makale" : esc((v.title && v.title.tr) || v.slug)}</h1>
      <p class="ad-muted">${isNew ? "Yeni yayın ekleyin." : `Sitedeki adresi: <a class="ad-link" href="/tr/makaleler/${attr(v.slug)}" target="_blank" rel="noopener">/tr/makaleler/${esc(v.slug)} ↗</a>`}</p>
    </div>
    <a class="ad-link" href="/admin/makaleler">← Listeye dön</a>
  </div>

  <form class="ad-form" method="post" action="/admin/makaleler/${isNew ? "yeni" : attr(v.slug)}" enctype="multipart/form-data">
    <input type="hidden" name="_csrf" value="${attr(csrf)}">

    <section class="ad-card">
      <h2>Başlık</h2>
      ${langTabs("title", v.title, "Makale başlığı (Türkçe zorunlu)")}
      ${field("Birlikte yazan (varsa)", "coAuthor", v.coAuthor, { ph: "Doç. Dr. Müge Ürem", wide: true })}
    </section>

    <section class="ad-card">
      <h2>Yayın bilgileri</h2>
      <div class="ad-grid2">
        ${field("Yayın tarihi", "date", v.date, { ph: "2025-10", hint: "YYYY, YYYY-AA veya YYYY-AA-GG" })}
        ${field("Dergi / kitap", "journal", v.journal, { ph: "İzmir Barosu Dergisi" })}
        ${field("Cilt", "volume", v.volume)}
        ${field("Sayı", "issue", v.issue)}
        ${field("Sayfa sayısı", "pages", v.pages, { type: "number" })}
        ${field("ORCID numaraları", "orcids", (v.orcids || []).join(", "), { ph: "0000-0002-8622-9660, …" })}
      </div>
    </section>

    <section class="ad-card">
      <h2>Konular</h2>
      <p class="ad-small ad-muted">Makaleler sayfasındaki filtrelerde kullanılır. En az bir konu seçin.</p>
      <div class="ad-checks">
        ${(tags || []).map((t) => `<label class="ad-check"><input type="checkbox" name="topics" value="${attr(t.slug)}"${topics.has(t.slug) ? " checked" : ""}> ${esc(t.tr)}</label>`).join("")}
      </div>
    </section>

    <section class="ad-card">
      <h2>Özet ve anahtar kelimeler</h2>
      ${langTabs("summary", v.summary, "Özet / abstract", { rows: 7 })}
      <div class="ad-i18n">
        <div class="ad-i18n__label">Anahtar kelimeler <em class="ad-muted">(her satıra bir tane)</em></div>
        <div class="ad-i18n__grid">
          ${["tr", "en", "de"].map((l) => `<label class="ad-field"><span>${l.toUpperCase()}</span>
            <textarea name="keywords_${l}" rows="5">${esc(linesOf(v.keywords && v.keywords[l]))}</textarea></label>`).join("")}
        </div>
      </div>
    </section>

    <section class="ad-card">
      <h2>PDF</h2>
      <p class="ad-small">${v.pdf
        ? `Mevcut dosya: <a class="ad-link" href="${attr(v.pdf)}" target="_blank" rel="noopener">${esc(v.pdf)} ↗</a>`
        : `<span class="ad-muted">Henüz PDF yok.</span>`}</p>
      <label class="ad-field">
        <span>${v.pdf ? "PDF'i değiştir" : "PDF yükle"} <em>en fazla 20 MB</em></span>
        <input type="file" name="pdf" accept="application/pdf" data-maxmb="20">
      </label>
      <p class="ad-small ad-muted">Büyük taranmış dosyalar yavaş açılır; mümkünse metni seçilebilen (taranmamış) PDF yükleyin.</p>
    </section>

    ${(team || []).length ? `<section class="ad-card">
      <h2>Avukat profilleri</h2>
      <p class="ad-small ad-muted">İşaretlenen avukatların profil sayfasında bu makale listelenir.</p>
      <div class="ad-checks">
        ${team.map((m) => `<label class="ad-check"><input type="checkbox" name="teamSlugs" value="${attr(m.slug)}"${linked.has(m.slug) ? " checked" : ""}> ${esc(m.name)}</label>`).join("")}
      </div>
    </section>` : ""}

    <section class="ad-card">
      <h2>Yayın durumu</h2>
      <label class="ad-check"><input type="checkbox" name="published" value="1"${v.published !== false ? " checked" : ""}> Sitede görünsün</label>
    </section>

    <div class="ad-actions">
      <button class="ad-btn ad-btn--primary" type="submit">Kaydet</button>
      <a class="ad-btn" href="/admin/makaleler">Vazgeç</a>
      ${isNew ? "" : `<button class="ad-btn ad-btn--danger" type="submit" formaction="/admin/makaleler/${attr(v.slug)}/sil"
        data-confirm="Bu makale ve PDF dosyası siteden kaldırılacak. Emin misiniz?">Sil</button>`}
    </div>
    <p class="ad-small ad-muted">Kaydettikten sonra değişiklik yaklaşık 1–2 dakika içinde sitede görünür.</p>
  </form>`;
  return shell({ title: isNew ? "Yeni makale" : (v.title && v.title.tr) || "Makale", active: "/admin/makaleler", body, flash, csrf });
}

/* Article save logic — pure, shared by both storage back-ends. */
const orNull = (s) => { const t = String(s == null ? "" : s).trim(); return t || null; };
const lineList = (s) => String(s || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
const DATE_RE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

/** Build the stored record from the form. `prev` is null for a new article. */
export function buildArticle(f, prev, list, tags) {
  const title = pickLangs(f, "title");
  if (!title.tr) throw new Error("Türkçe başlık zorunludur.");
  const date = String(f.date || "").trim();
  if (date && !DATE_RE.test(date)) throw new Error("Tarih YYYY, YYYY-AA veya YYYY-AA-GG biçiminde olmalı (ör. 2025-10).");
  const valid = new Set((tags || []).map((t) => t.slug));
  const topics = asArray(f.topics).filter((t) => valid.has(t));
  if (!topics.length) throw new Error("En az bir konu seçin.");

  const p = prev || {};
  const summary = {
    tr: orNull(f.summary_tr), en: orNull(f.summary_en), de: orNull(f.summary_de),
  };
  const ps = p.summary || {};
  const summaryChanged = ["tr", "en", "de"].some((l) => (summary[l] || null) !== (ps[l] || null));
  const pages = parseInt(f.pages, 10);

  const rec = Object.assign({}, p, {
    id: prev ? p.id : list.reduce((m, a) => Math.max(m, a.id || 0), 0) + 1,
    slug: prev ? p.slug : uniqueSlug(slugify(title.tr, 65), list.map((a) => a.slug)),
    title: { tr: title.tr, en: title.en || null, de: title.de || null },
    coAuthor: orNull(f.coAuthor),
    date: date || null,
    year: date ? parseInt(date.slice(0, 4), 10) : null,
    dateSource: !date ? null : (p.date === date ? p.dateSource || "admin" : "admin"),
    journal: orNull(f.journal),
    volume: orNull(f.volume),
    issue: orNull(f.issue),
    orcids: String(f.orcids || "").split(/[,\s]+/).map((s) => s.trim()).filter(Boolean),
    topics,
    keywords: { tr: lineList(f.keywords_tr), en: lineList(f.keywords_en), de: lineList(f.keywords_de) },
    summary,
    summarySource: summaryChanged ? (summary.tr || summary.en ? "admin" : null) : (p.summarySource || null),
    pages: Number.isFinite(pages) && pages > 0 ? pages : null,
    pdf: p.pdf || null,
    published: f.published === "1",
  });
  rec.needs = {
    summary: !summary.tr, date: !rec.date, journal: !rec.journal,
    scanned: !!(p.needs && p.needs.scanned),
  };
  return rec;
}

/** Newest first; undated keep their relative order at the end. */
export function sortArticles(list) {
  return list.slice().sort((a, b) =>
    (b.date ? 1 : 0) - (a.date ? 1 : 0) ||
    (a.date && b.date ? String(b.date).localeCompare(String(a.date)) : 0));
}

export function articleStats(list) {
  return {
    total: list.length,
    withSummary: list.filter((a) => a.summary && a.summary.tr).length,
    withEnglishAbstract: list.filter((a) => a.summary && a.summary.en).length,
    withDate: list.filter((a) => a.date).length,
    withJournal: list.filter((a) => a.journal).length,
    scanned: list.filter((a) => a.needs && a.needs.scanned).length,
  };
}

/** Serialise articles.json the way the generator did. */
export function articlesDoc(doc, list) {
  const sorted = sortArticles(list);
  return JSON.stringify(Object.assign({}, doc, { articles: sorted, stats: articleStats(sorted) }), null, 1) + "\n";
}

/** Point exactly the chosen members at `slug`. Returns null when nothing changed. */
export function linkMembers(team, slug, chosen) {
  const want = new Set(asArray(chosen));
  let changed = false;
  const out = team.map((m) => {
    const has = (m.articleSlugs || []).includes(slug);
    if (has === want.has(m.slug)) return m;
    changed = true;
    const rest = (m.articleSlugs || []).filter((s) => s !== slug);
    return Object.assign({}, m, { articleSlugs: want.has(m.slug) ? [slug].concat(rest) : rest });
  });
  return changed ? out : null;
}

/** Drop `slug` from every record's articleSlugs. Returns null when nothing changed. */
export function unlinkEverywhere(records, slug) {
  let changed = false;
  const out = records.map((r) => {
    if (!(r.articleSlugs || []).includes(slug)) return r;
    changed = true;
    return Object.assign({}, r, { articleSlugs: r.articleSlugs.filter((s) => s !== slug) });
  });
  return changed ? out : null;
}

export const pdfPathFor = (id) => `/makaleler/pdf/${String(id).padStart(2, "0")}.pdf`;

/** Trust the bytes, not the extension: "%PDF-" must appear within the first 1 KB. */
export function isPdf(bytes) {
  const s = String.fromCharCode(...bytes.subarray(0, 1024));
  return s.indexOf("%PDF-") !== -1;
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
