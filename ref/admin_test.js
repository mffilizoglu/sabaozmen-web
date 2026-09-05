/* End-to-end exercise of the admin panel: login, upload, publish, verify, delete. */
const http = require("http");
const crypto = require("crypto");

const BASE = { host: "127.0.0.1", port: 4321 };
let COOKIE = "";

function req(method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const r = http.request(Object.assign({ method, path, headers: Object.assign({
      ...(COOKIE ? { Cookie: COOKIE } : {}),
    }, headers || {}) }, BASE), (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const sc = res.headers["set-cookie"];
        if (sc) COOKIE = sc.map((c) => c.split(";")[0]).join("; ");
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") });
      });
    });
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}

function csrfFrom(html) {
  const m = /name="_csrf" value="([^"]+)"/.exec(html);
  return m ? m[1] : null;
}

/* A real 1x1 PNG, so the image sniffer has genuine bytes to check. */
const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a4944415478da6360000002000100" +
  "05fe02fea70000000049454e44ae426082", "hex");

function multipart(fields, files) {
  const b = "----so" + crypto.randomBytes(8).toString("hex");
  const parts = [];
  for (const [k, vs] of Object.entries(fields)) {
    for (const v of [].concat(vs)) {
      parts.push(Buffer.from(`--${b}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`, "utf8"));
    }
  }
  for (const [k, f] of Object.entries(files || {})) {
    parts.push(Buffer.from(`--${b}\r\nContent-Disposition: form-data; name="${k}"; filename="${f.name}"\r\nContent-Type: ${f.type}\r\n\r\n`, "utf8"));
    parts.push(f.data);
    parts.push(Buffer.from("\r\n", "utf8"));
  }
  parts.push(Buffer.from(`--${b}--\r\n`, "utf8"));
  return { body: Buffer.concat(parts), type: `multipart/form-data; boundary=${b}` };
}

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

(async () => {
  // 1. protected before login
  let r = await req("POST", "/admin/etkinlikler/yeni", "x=1", { "Content-Type": "application/x-www-form-urlencoded" });
  check("POST without session is rejected", r.status === 401, "status " + r.status);

  // 2. wrong password
  let login = await req("GET", "/admin");
  const csrf = csrfFrom(login.body);
  let form = new URLSearchParams({ _csrf: csrf, password: "wrong-password" }).toString();
  r = await req("POST", "/admin/giris", form, { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(form) });
  check("wrong password rejected", r.status === 401, "status " + r.status);

  // 3. correct password
  form = new URLSearchParams({ _csrf: csrf, password: process.env.ADMIN_PASSWORD || "demo1234" }).toString();
  r = await req("POST", "/admin/giris", form, { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(form) });
  check("login succeeds and sets cookie", r.status === 302 && !!COOKIE, "status " + r.status);

  // 4. list pages now render
  r = await req("GET", "/admin/avukatlar");
  check("attorneys list renders", r.status === 200 && r.body.includes("Etem Sab"), "status " + r.status);
  r = await req("GET", "/admin/etkinlikler");
  check("events list renders", r.status === 200 && r.body.includes("Etkinlikler"), "status " + r.status);

  // 5. CSRF is enforced
  const evForm = await req("GET", "/admin/etkinlikler/yeni");
  const evCsrf = csrfFrom(evForm.body);
  let mpBad = multipart({ _csrf: "bogus", title_tr: "X", type: "etkinlik" }, {});
  r = await req("POST", "/admin/etkinlikler/yeni", mpBad.body, { "Content-Type": mpBad.type, "Content-Length": mpBad.body.length });
  check("bad CSRF token rejected", r.status === 403, "status " + r.status);

  // 6. create an event WITH a poster upload
  let mpOk = multipart({
    _csrf: evCsrf, type: "konferans",
    title_tr: "Otomatik Test Konferansı", title_en: "Automated Test Conference", title_de: "Automatisierte Testkonferenz",
    venue_tr: "Test Salonu", city: "İstanbul", date: "2026-05-12",
    summary_tr: "Bu kayıt otomatik test tarafından oluşturulmuştur.",
    body_tr: "Birinci paragraf.\n\nİkinci paragraf.",
    speakers: "Prof. Dr. Etem Sabâ Özmen, Av. Test",
    published: "1",
  }, { poster: { name: "afis.png", type: "image/png", data: PNG } });
  r = await req("POST", "/admin/etkinlikler/yeni", mpOk.body, { "Content-Type": mpOk.type, "Content-Length": mpOk.body.length });
  const slug = (r.headers.location || "").split("/").pop();
  check("event created with poster", r.status === 302 && !!slug, "→ " + r.headers.location);

  // 7. poster is stored and served
  const store = require("../site/lib/store.js");
  const ev = store.events.bySlug(decodeURIComponent(slug || ""));
  check("event persisted to events.json", !!ev, ev ? ev.slug : "not found");
  if (ev && ev.poster) {
    const p = await req("GET", ev.poster);
    check("uploaded poster is served", p.status === 200 && p.headers["content-type"] === "image/png", ev.poster);
  } else {
    check("uploaded poster is served", false, "no poster recorded");
  }

  // 8. it appears on the public pages, in all three languages.
  // Routes come from data.js so a rename cannot silently invalidate this test.
  const ROUTES = require("../site/content/data.js").routes;
  for (const lang of ["tr", "en", "de"]) {
    const path = `/${lang}/${ROUTES.events[lang]}`;
    const pub = await req("GET", path);
    const want = { tr: "Otomatik Test Konferansı", en: "Automated Test Conference", de: "Automatisierte Testkonferenz" }[lang];
    check(`event listed on ${path}`, pub.status === 200 && pub.body.includes(want));
  }
  const detail = await req("GET", `/tr/${ROUTES.events.tr}/` + slug);
  check("event detail page renders", detail.status === 200 && detail.body.includes("Test Salonu"), "status " + detail.status);
  check("event detail has Event JSON-LD", detail.body.includes('"@type":"Event"'));
  check("multi-paragraph body split correctly", (detail.body.match(/İkinci paragraf\./g) || []).length === 1);

  // 9. non-image upload is refused
  const evForm2 = await req("GET", "/admin/etkinlikler/yeni");
  let mpEvil = multipart({ _csrf: csrfFrom(evForm2.body), type: "etkinlik", title_tr: "Kötü Yükleme" },
                         { poster: { name: "x.png", type: "image/png", data: Buffer.from("<?php echo 1; ?>", "utf8") } });
  r = await req("POST", "/admin/etkinlikler/yeni", mpEvil.body, { "Content-Type": mpEvil.type, "Content-Length": mpEvil.body.length });
  check("non-image upload refused", r.status === 400 && /Yalnızca JPG/.test(r.body), "status " + r.status);

  // 10. attorney edit: link articles, toggle publish
  const tForm = await req("GET", "/admin/avukatlar/etem-saba-ozmen");
  const tCsrf = csrfFrom(tForm.body);
  const someSlugs = require("../site/content/articles.json").articles.slice(0, 3).map((a) => a.slug);
  let mpT = multipart({
    _csrf: tCsrf, name: "Prof. Dr. Etem Sabâ Özmen",
    role_tr: "Kurucu Ortak", role_en: "Founding Partner", role_de: "Gründungspartner",
    email: "sabaozmen@sabaozmen.av.tr", barNo: "12345", startYear: "1990",
    faculty: "Test Hukuk Fakültesi", languages: "Almanca, İngilizce",
    orcid: "0000-0002-8622-9660",
    articleSlugs: someSlugs, published: "1", order: "1",
  }, {});
  r = await req("POST", "/admin/avukatlar/etem-saba-ozmen", mpT.body, { "Content-Type": mpT.type, "Content-Length": mpT.body.length });
  check("attorney saved", r.status === 302, "status " + r.status);
  const m = store.team.bySlug("etem-saba-ozmen");
  check("article links persisted", m && m.articleSlugs.length === 3, m ? m.articleSlugs.length + " linked" : "missing");
  check("regulation fields persisted", m && m.barNo === "12345" && m.faculty === "Test Hukuk Fakültesi");

  const prof = await req("GET", "/tr/ekibimiz/etem-saba-ozmen");
  check("profile shows linked articles", prof.status === 200 && prof.body.includes("art-list"), "status " + prof.status);
  check("profile shows bar number", prof.body.includes("12345"));

  // 11. clean up the test records
  const delForm = await req("GET", "/admin/etkinlikler/" + slug);
  let mpDel = multipart({ _csrf: csrfFrom(delForm.body) }, {});
  r = await req("POST", "/admin/etkinlikler/" + slug + "/sil", mpDel.body, { "Content-Type": mpDel.type, "Content-Length": mpDel.body.length });
  check("event deleted", r.status === 302 && !store.events.bySlug(slug));

  // 12. logout
  const anyForm = await req("GET", "/admin/avukatlar");
  let mpOut = multipart({ _csrf: csrfFrom(anyForm.body) }, {});
  r = await req("POST", "/admin/cikis", mpOut.body, { "Content-Type": mpOut.type, "Content-Length": mpOut.body.length });
  COOKIE = "";
  r = await req("GET", "/admin/avukatlar");
  check("logout clears access", r.status === 200 && r.body.includes("name=\"password\""));

  const failed = results.filter((r) => !r.pass);
  console.log(`\n  ${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error("ERROR", e); process.exit(1); });
