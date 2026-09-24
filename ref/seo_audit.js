/* Static SEO audit over a built site directory (default dist-domain).
   Checks every real page — not the legacy redirect stubs or 404 copies.

   Usage: node ref/seo_audit.js [dir] [origin]                              */

const fs = require("fs");
const path = require("path");

const DIR = path.resolve(process.argv[2] || "dist-domain");
const ORIGIN = (process.argv[3] || "https://sabaozmen.av.tr").replace(/\/$/, "");

const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/[\\/](modul)$/.test(p)) walk(p); }
    else if (e.name === "index.html") {
      const rel = "/" + path.relative(DIR, path.dirname(p)).split(path.sep).join("/");
      if (rel === "/" || /\/404$/.test(rel)) continue;
      pages.push({ url: rel, html: fs.readFileSync(p, "utf8") });
    }
  }
})(DIR);

const exists = (u) => {
  const clean = u.split("#")[0].split("?")[0];
  if (!clean.startsWith("/")) return true;
  const f = path.join(DIR, clean);
  return fs.existsSync(f) && fs.statSync(f).isFile() || fs.existsSync(path.join(f, "index.html")) || fs.existsSync(f + ".html");
};

const problems = {};
const add = (k, v) => { (problems[k] = problems[k] || []).push(v); };
const titles = new Map(), descs = new Map();
let ldCount = 0; const ldTypes = {};

for (const p of pages) {
  const h = p.html;
  const one = (re) => ((h.match(re) || [])[1] || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const title = one(/<title>([^<]*)<\/title>/);
  const desc = one(/<meta name="description" content="([^"]*)"/);
  const canon = one(/<link rel="canonical" href="([^"]*)"/);
  const lang = one(/<html lang="([^"]*)"/);

  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) add("h1 count != 1", `${p.url} (${h1})`);
  if (!title) add("missing <title>", p.url);
  if (title.length > 78) add("title > 78 chars", `${p.url} (${title.length})`);
  if (!desc) add("missing description", p.url);
  else if (desc.length < 50 || desc.length > 160) add("description length outside 50–160", `${p.url} (${desc.length})`);
  if (canon !== ORIGIN + p.url) add("canonical mismatch", `${p.url} → ${canon}`);
  if (!lang) add("missing html lang", p.url);
  (titles.get(title) || titles.set(title, []).get(title)).push(p.url);
  (descs.get(desc) || descs.set(desc, []).get(desc)).push(p.url);

  // hreflang: three languages + x-default, every target exists
  const alts = [...h.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)];
  if (alts.length < 4) add("hreflang incomplete", p.url);
  alts.forEach(([, , href]) => { if (!exists(href.replace(ORIGIN, ""))) add("hreflang target missing", `${p.url} → ${href}`); });

  // JSON-LD must parse; spot-check required fields
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ldCount++;
    let j;
    try { j = JSON.parse(m[1]); } catch (e) { add("JSON-LD does not parse", p.url); continue; }
    const t = [].concat(j["@type"]).join("+");
    ldTypes[t] = (ldTypes[t] || 0) + 1;
    if (/Event/.test(t)) {
      if (!j.name || !j.startDate || !j.location) add("Event JSON-LD missing name/startDate/location", p.url);
      if (!j.organizer) add("Event JSON-LD without organizer", p.url);
      if (!j.image) add("Event JSON-LD without image", p.url);
    }
    if (t === "BreadcrumbList" && !(j.itemListElement || []).every((x, i) => x.position === i + 1 && /^https?:/.test(x.item))) {
      add("BreadcrumbList malformed", p.url);
    }
    if (t === "ScholarlyArticle" && (!j.author || !j.headline)) add("ScholarlyArticle missing author/headline", p.url);
  }

  // images: alt text, and explicit size on content images (layout shift)
  for (const [tag] of h.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(tag)) add("img without alt", `${p.url} ${tag.slice(0, 80)}`);
    if (/\/img\/events\//.test(tag) && !/\swidth="\d+"/.test(tag)) add("event poster without width/height", p.url);
  }

  // internal links resolve
  for (const [, href] of h.matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)) {
    if (!exists(href)) add("broken internal link", `${p.url} → ${href}`);
  }

  // og:image file exists
  const og = one(/<meta property="og:image" content="([^"]*)"/);
  if (!og || !exists(og.replace(ORIGIN, ""))) add("og:image missing", `${p.url} → ${og}`);

  // article pages carry Google Scholar tags
  if (/^\/(tr|en|de)\/(makaleler|articles|publikationen)\/.+/.test(p.url) && !/citation_title/.test(h)) add("article without citation_* tags", p.url);
}

for (const [t, list] of titles) if (list.length > 1) add("duplicate <title>", `${list.length}× "${t.slice(0, 70)}" e.g. ${list.slice(0, 2).join(", ")}`);
for (const [d, list] of descs) if (d && list.length > 1) add("duplicate description", `${list.length}× "${d.slice(0, 60)}…" e.g. ${list.slice(0, 2).join(", ")}`);

// machine-facing files
const robots = fs.readFileSync(path.join(DIR, "robots.txt"), "utf8");
if (!/Sitemap: https?:\/\//.test(robots)) add("robots.txt without absolute Sitemap", "");
if (!/User-agent: GPTBot/.test(robots) || !/User-agent: ClaudeBot/.test(robots)) add("robots.txt does not name AI crawlers", "");
if (!fs.existsSync(path.join(DIR, "llms.txt"))) add("llms.txt missing", "");
const sm = fs.readFileSync(path.join(DIR, "sitemap.xml"), "utf8");
const smUrls = (sm.match(/<loc>/g) || []).length;

console.log("pages audited: %d · JSON-LD blocks: %d · sitemap URLs: %d", pages.length, ldCount, smUrls);
console.log("JSON-LD types:", Object.entries(ldTypes).map(([k, v]) => `${k} ${v}`).join(", "));
const keys = Object.keys(problems);
if (!keys.length) { console.log("\nno problems found"); process.exit(0); }
for (const k of keys) {
  console.log(`\n${k}: ${problems[k].length}`);
  problems[k].slice(0, 6).forEach((x) => console.log("   " + x));
}
process.exit(1);
