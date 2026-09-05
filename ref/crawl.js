/* Crawl every route the site can serve and check it renders correctly. */
const http = require("http");
const path = require("path");

const SITE = path.join(__dirname, "..", "site");
const D = require(path.join(SITE, "content", "data.js"));
const ART = require(path.join(SITE, "content", "articles.json"));
const store = require(path.join(SITE, "lib", "store.js"));
const TEAM = store.team.published();
const EVENTS = store.events.published();
const BASE = process.env.CRAWL_BASE || "http://127.0.0.1:4321";

function get(u, depth) {
  return new Promise((res) => {
    http.get(BASE + u, (r) => {
      // static hosts 301 /a/b -> /a/b/ ; follow so both servers are comparable
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location && (depth || 0) < 3) {
        r.resume();
        const loc = r.headers.location.replace(BASE, "");
        return res(get(loc, (depth || 0) + 1));
      }
      let b = "";
      r.on("data", (c) => (b += c));
      r.on("end", () => res({ status: r.statusCode, body: b, type: r.headers["content-type"] }));
    }).on("error", (e) => res({ status: 0, body: String(e), type: "" }));
  });
}

const urls = [];
D.LANGS.forEach((l) => {
  Object.keys(D.routes).forEach((k) => {
    const s = D.routes[k][l];
    urls.push({ u: "/" + l + (s ? "/" + s : ""), lang: l, kind: k });
  });
  D.areas.forEach((a) => urls.push({ u: `/${l}/${D.routes.areas[l]}/${a.slug}`, lang: l, kind: "area" }));
  ART.articles.forEach((a) => urls.push({ u: `/${l}/${D.routes.articles[l]}/${a.slug}`, lang: l, kind: "article" }));
  TEAM.forEach((m) => urls.push({ u: `/${l}/${D.routes.team[l]}/${m.slug}`, lang: l, kind: "profile" }));
  EVENTS.forEach((e) => urls.push({ u: `/${l}/${D.routes.events[l]}/${e.slug}`, lang: l, kind: "event" }));
});
urls.push({ u: "/sitemap.xml", lang: "-", kind: "sitemap" });
urls.push({ u: "/robots.txt", lang: "-", kind: "robots" });
urls.push({ u: "/tr/bulunmayan-sayfa", lang: "tr", kind: "404-expected" });
urls.push({ u: "/img/og.png", lang: "-", kind: "asset" });
urls.push({ u: "/img/mark.svg", lang: "-", kind: "asset" });
urls.push({ u: "/img/lockup.svg", lang: "-", kind: "asset" });
urls.push({ u: "/css/main.css", lang: "-", kind: "asset" });
urls.push({ u: "/js/main.js", lang: "-", kind: "asset" });
urls.push({ u: "/makaleler/pdf/01.pdf", lang: "-", kind: "asset" });

const LANG_ATTR = { tr: 'lang="tr"', en: 'lang="en"', de: 'lang="de"' };

(async () => {
  const problems = [];
  let ok = 0;
  for (const { u, lang, kind } of urls) {
    const r = await get(u);
    const expect404 = kind === "404-expected";
    const want = expect404 ? 404 : 200;

    if (r.status !== want) { problems.push(`${r.status} (want ${want})  ${u}`); continue; }
    if (kind === "asset" || kind === "sitemap" || kind === "robots") { ok++; continue; }

    const b = r.body;
    const fail = [];
    if (!b.includes("<!doctype html>")) fail.push("no doctype");
    if (!b.includes(LANG_ATTR[lang])) fail.push("wrong html lang");

    // meta description must be a complete, page-specific sentence
    const m = b.match(/<meta name="description" content="([^"]*)"/);
    if (!m) fail.push("no description");
    else {
      const d = m[1];
      if (d.length < 50) fail.push("description too short: " + d.length);
      if (d.length > 200) fail.push("description too long: " + d.length);
      if (/hükümlerine göre"?$/.test(d)) fail.push("truncated description (old-site bug)");
    }
    if (!/<link rel="canonical"/.test(b)) fail.push("no canonical");
    if ((b.match(/hreflang=/g) || []).length < 4) fail.push("missing hreflang set");
    if (!/og:image" content="[^"]+\.png"/.test(b)) fail.push("no og:image png");

    // regressions from the old site that must not reappear
    if (b.includes("javascript:;") || b.includes('href="https://www.sabaozmen.av.tr/javascript:')) fail.push("javascript: link");
    if (b.includes("Roto Çelik")) fail.push("Roto Çelik alt text");
    if (b.includes("noimagelist") || b.includes("noimage.png")) fail.push("noimage placeholder");
    if (/revisit-after/.test(b)) fail.push("revisit-after meta");
    if (/myfcyazilim|İstanbul Web Tasarım/.test(b)) fail.push("agency backlink");
    if (/Uzmanlık Alanlarımız|Uzmana Danış|Yasal Güvenceniz/.test(b)) fail.push("regulated wording present");
    if (/src="[^"]*site_images\/"/.test(b)) fail.push("empty image src");
    // Turkish UI text leaking into EN/DE pages
    if (lang !== "tr") {
      ["Makale Başlığı", "Görüntüle", "Size daha iyi bir deneyim", "Bize Ulaşın", "Anasayfa", "Makaleler</"]
        .forEach((s) => { if (b.includes(s)) fail.push("Turkish leak: " + s); });
    }
    // every internal link must resolve to a route we serve
    const hrefs = [...b.matchAll(/href="(\/[^"#]*)"/g)].map((x) => x[1]);
    hrefs.forEach((h) => {
      if (/\.(css|js|png|svg|pdf|xml|txt|jpg|ico|woff2?)$/.test(h)) return;
      if (h.startsWith("/api/")) return;
      if (!urls.some((x) => x.u === h)) fail.push("dangling link " + h);
    });

    if (fail.length) problems.push(`${u}\n      → ${[...new Set(fail)].join("\n      → ")}`);
    else ok++;
  }

  console.log(`checked ${urls.length} urls · ${ok} clean · ${problems.length} with problems\n`);
  problems.slice(0, 40).forEach((p) => console.log("  ✗ " + p));
  if (problems.length > 40) console.log(`  … and ${problems.length - 40} more`);
})();
