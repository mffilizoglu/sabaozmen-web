/* Security / SEO / a11y audit against the running site.
   Checks the served HTML, not the source. */

const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE = process.env.AUDIT_BASE || "http://127.0.0.1:4321";
const SITE = path.join(__dirname, "..", "site");
const D = require(path.join(SITE, "content", "data.js"));

function get(p, opts) {
  return new Promise((res) => {
    const r = http.request(BASE + p, Object.assign({ method: "GET" }, opts || {}), (x) => {
      let b = "";
      x.on("data", (c) => (b += c));
      x.on("end", () => res({ status: x.statusCode, headers: x.headers, body: b }));
    });
    r.on("error", (e) => res({ status: 0, headers: {}, body: String(e) }));
    r.end();
  });
}

const rows = [];
const t = (group, name, pass, detail) => rows.push({ group, name, pass, detail });

(async () => {
  const home = await get("/tr");
  const article = await get("/tr/makaleler/kentsel-donusum-uygulamalarinda-eski-arsa-payindan-payli-mulkiyete-ve");
  const contact = await get("/tr/iletisim");
  const events = await get("/tr/egitim-ve-kongreler");
  const admin = await get("/admin");

  /* ---------------------------------------------------------- SECURITY */
  const G = "security";
  t(G, "admin requires auth", admin.body.includes('name="password"'));
  t(G, "admin is noindex", (admin.headers["x-robots-tag"] || "").includes("noindex"));
  t(G, "admin not cached", (admin.headers["cache-control"] || "").includes("no-store"));
  t(G, "X-Content-Type-Options on pages", (home.headers["x-content-type-options"] || "") === "nosniff");
  t(G, "Referrer-Policy set", !!home.headers["referrer-policy"]);
  const csp = home.headers["content-security-policy"] || "";
  t(G, "CSP present", !!csp);
  t(G, "CSP: object-src none", /object-src 'none'/.test(csp));
  t(G, "CSP: base-uri locked", /base-uri 'self'/.test(csp));
  t(G, "CSP: form-action locked", /form-action 'self'/.test(csp));
  t(G, "CSP: no external script origins", !/script-src[^;]*https?:/.test(csp));
  t(G, "X-Frame-Options set", !!home.headers["x-frame-options"]);
  t(G, "Permissions-Policy set", !!home.headers["permissions-policy"]);
  t(G, "admin CSP denies framing", /frame-ancestors 'none'/.test(admin.headers["content-security-policy"] || ""));

  // path traversal
  for (const p of ["/../site/content/admin.json", "/uploads/../../content/admin.json", "/%2e%2e/package.json"]) {
    const r = await get(p);
    t(G, "traversal blocked " + p, r.status === 404 || r.status === 403, "status " + r.status);
  }

  // secrets must never appear in served HTML
  const secretish = /(ghp_|gho_|cfut_|ADMIN_PASSWORD|SESSION_SECRET|GITHUB_TOKEN|-----BEGIN)/;
  t(G, "no secrets in served HTML", !secretish.test(home.body + article.body + contact.body));

  // XSS: reflected input
  const xss = await get("/tr/makaleler/%3Cscript%3Ealert(1)%3C%2Fscript%3E");
  t(G, "unknown slug does not reflect script", !/<script>alert\(1\)<\/script>/.test(xss.body),
    "status " + xss.status);

  // method handling
  const put = await get("/tr", { method: "PUT" });
  t(G, "unsafe methods rejected", put.status === 405, "status " + put.status);

  // contact endpoint validation
  const bad = await new Promise((res) => {
    const body = JSON.stringify({ lang: "tr", name: "x", email: "bad", message: "y" });
    const r = http.request(BASE + "/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    }, (x) => { let b = ""; x.on("data", (c) => (b += c)); x.on("end", () => res({ status: x.statusCode, body: b })); });
    r.on("error", () => res({ status: 0, body: "" }));
    r.write(body); r.end();
  });
  t(G, "contact rejects invalid input", bad.status === 400, "status " + bad.status);

  // third-party requests before consent
  const thirdParty = (home.body.match(/https?:\/\/(?!(?:www\.)?(?:sabaozmen|localhost|127\.0\.0\.1))[^"' )]+/g) || [])
    .filter((u) => !/schema\.org|linkedin\.com|maps\.google|www\.google\.com\/maps|doblin|strategyzer|orcid/.test(u));
  t(G, "no third-party scripts/styles on page load", thirdParty.length === 0, thirdParty.slice(0, 3).join(" "));
  // The map is embedded directly now, deferred natively rather than by a click.
  t(G, "map iframe is lazy-loaded", /<iframe[^>]+loading="lazy"/.test(contact.body));
  t(G, "map iframe origin is allowed by CSP",
    !/<iframe[^>]+src="(?!https:\/\/(?:www|maps)\.google\.com)/.test(contact.body));
  t(G, "map iframe declares a title", /<iframe[^>]+title="/.test(contact.body));
  t(G, "visitor is told the map is Google's",
    /Google/.test(contact.body) && /map__note/.test(contact.body));
  t(G, "external links use rel=noopener",
    !/target="_blank"(?![^>]*rel="[^"]*noopener)/.test(home.body + contact.body));

  /* --------------------------------------------------------------- SEO */
  const S = "seo";
  const pages = { "/tr": home, "/tr/iletisim": contact, "/tr/egitim-ve-kongreler": events, article: article };
  for (const [name, r] of Object.entries(pages)) {
    const one = (re) => (r.body.match(re) || []).length;
    t(S, `${name}: exactly one <h1>`, one(/<h1[ >]/g) === 1, one(/<h1[ >]/g) + " found");
    const d = (r.body.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
    t(S, `${name}: description 50-160 chars`, d.length >= 50 && d.length <= 160, d.length + " chars");
    t(S, `${name}: canonical present`, /<link rel="canonical"/.test(r.body));
    t(S, `${name}: og:image is png/jpg`, /og:image" content="[^"]+\.(png|jpg)"/.test(r.body));
    t(S, `${name}: hreflang x3 + x-default`, (r.body.match(/hreflang=/g) || []).length >= 4);
    t(S, `${name}: html lang set`, /<html lang="(tr|en|de)">/.test(r.body));
  }
  t(S, "article has ScholarlyArticle JSON-LD", article.body.includes('"ScholarlyArticle"'));
  t(S, "home has LegalService JSON-LD", home.body.includes('"LegalService"'));
  t(S, "sitemap lists new events URL",
    (await get("/sitemap.xml")).body.includes("/tr/egitim-ve-kongreler"));
  t(S, "robots.txt has sitemap", (await get("/robots.txt")).body.includes("Sitemap:"));
  t(S, "no stale 'etkinlikler' URLs anywhere",
    !home.body.includes("/etkinlikler") && !events.body.includes("/tr/etkinlikler"));

  // icons
  t(S, "favicon referenced", /rel="icon"/.test(home.body));
  t(S, "apple-touch-icon referenced", /apple-touch-icon/.test(home.body));
  for (const f of ["/img/favicon.svg", "/img/apple-touch-icon.png", "/img/og.png", "/img/mark.svg"]) {
    const r = await get(f);
    t(S, "icon exists " + f, r.status === 200, "status " + r.status);
  }
  for (const w of [800, 1280, 1920]) {
    for (const ext of ["webp", "jpg"]) {
      const r = await get(`/img/hero-${w}.${ext}`);
      t(S, `hero image ${w}.${ext}`, r.status === 200, "status " + r.status);
    }
  }

  /* ------------------------------------------------------------- A11Y */
  const A = "a11y";
  const imgs = (home.body.match(/<img [^>]*>/g) || []);
  t(A, "every img has alt", imgs.every((i) => /\salt=/.test(i)), imgs.length + " images");
  t(A, "skip link present", /class="skip"/.test(home.body));
  t(A, "hero image has width/height (no layout shift)", /<img[^>]+width="1920"[^>]+height="1080"/.test(home.body));
  t(A, "buttons have accessible text", !/<button[^>]*>\s*<\/button>/.test(home.body));
  t(A, "lang switcher marks current", /aria-current="true"/.test(home.body));
  const css = await get("/css/main.css");
  t(A, "color-scheme declared (blocks Chrome auto-dark inversion)",
    /color-scheme:\s*light/.test(css.body));

  /* ------------------------------------------------------------ report */
  const byGroup = {};
  rows.forEach((r) => { (byGroup[r.group] = byGroup[r.group] || []).push(r); });
  let failed = 0;
  for (const [g, list] of Object.entries(byGroup)) {
    const bad = list.filter((r) => !r.pass);
    failed += bad.length;
    console.log(`\n${g.toUpperCase()}  ${list.length - bad.length}/${list.length}`);
    bad.forEach((r) => console.log(`   FAIL  ${r.name}${r.detail ? "  — " + r.detail : ""}`));
  }
  console.log(`\n${rows.length - failed}/${rows.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
