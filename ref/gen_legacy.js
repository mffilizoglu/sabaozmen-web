/* Maps every URL in the old site's sitemap (saved in ref/old_sitemap_urls.txt)
   to its page on the new site, so links already indexed by Google and shared
   elsewhere keep working after the domain moves.
   Output: site/content/legacy-redirects.json  { "/old/path": { lang, key, slug } } */

const fs = require("fs");
const path = require("path");
const D = require("../site/content/data.js");
const articles = require("../site/content/articles.json");
const team = require("../site/content/team.json").team;
const ARTS = articles.articles || articles;

const old = fs.readFileSync(path.join(__dirname, "old_sitemap_urls.txt"), "utf8")
  .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

// old section segment → new route key, per language
const SECTION = {
  kurumsal: "about", corporate: "about", "uber-uns": "about",
  ekibimiz: "team", "our-team": "team", "unsere-anwalte": "team",
  "uzmanlik-alanlarimiz": "areas", "our-areas-of-expertise": "areas", "unsere-fachgebiete": "areas",
  makaleler: "articles", articles: "articles", artikel: "articles",
};
// old corporate sub-pages → route key
const CORP = {
  "saba-ozmen-hakkinda": "about", "about-saba-ozmen": "about", "uber-saba-ozmen": "about",
  "vizyon-misyon": "vision", "vision-mission": "vision",
  "kalite-politikamiz": "quality", "quality-policy": "quality", "unsere-qualitatspolitik": "quality",
  kariyer: "career", career: "career", karriere: "career",
  kvkk: "privacy", "personal-data-protection": "privacy", "schutz-personenbezogener-daten": "privacy",
  "cerez-politikasi": "cookies", "cookie-policy": "cookies", "cookie-richtlinie": "cookies",
};

// Old sitemaps list areas and articles in the same order in every language,
// so the TR slug (which matches ours) resolves the EN/DE ones by position.
const order = { areas: {}, articles: {} };
for (const u of old) {
  const m = u.match(/^\/(tr|en|de)\/modul\/([^/]+)\/([^/]+)$/);
  if (!m) continue;
  const key = SECTION[m[2]];
  if (key === "areas" || key === "articles") (order[key][m[1]] = order[key][m[1]] || []).push(m[3]);
}

const norm = (s) => s.replace(/-+/g, "-");

function matchArticle(oldSlug) {
  oldSlug = norm(oldSlug);
  // our slugs are the TR title slug cut at a word boundary
  let best = null, bestLen = 0;
  for (const a of ARTS) {
    let n = 0;
    while (n < a.slug.length && a.slug[n] === oldSlug[n]) n++;
    if (n === a.slug.length) return a.slug;
    if (n > bestLen) { best = a.slug; bestLen = n; }
  }
  return bestLen >= 25 ? best : null;
}
// A few area slugs were shortened on the new site; the rest are identical.
const AREA_ALIAS = {
  "toplu-yapilarda-yonetim-plani-ve-yonetim-hizmet-sozlesmelerinin-hazirlanmasi": "toplu-yapilarda-yonetim-plani",
  "gayrimenkul-yatirim-ortakligi-kurulusu-islemleri-ve-danismanligi": "gayrimenkul-yatirim-ortakligi",
  "orman-hukuku-6292-sayili-kanun-kapsaminda-2-b-arazileri-hakkinda-her-turlu-hukuki-danismanlik-hizmetleri": "orman-hukuku-ve-2b",
  "yabancilara-tasinmaz-satisina-iliskin-her-turlu-hukuki-danismanlik-hizmetleri": "yabancilara-tasinmaz-satisi",
  "icra-iflas-hukuku": "icra-ve-iflas-hukuku",
};
function matchArea(trSlug) {
  const a = D.areas.find((x) => x.slug === (AREA_ALIAS[trSlug] || trSlug));
  return a ? a.slug : null;
}
function matchTeam(oldSlug) {
  const t = team.find((x) => x.slug === oldSlug || oldSlug.endsWith(x.slug));
  return t ? t.slug : null;
}

const out = {}, loose = [];
for (const u of old) {
  let m;
  if ((m = u.match(/^\/(tr|en|de)\/iletisim$/))) { out[u] = { lang: m[1], key: "contact" }; continue; }
  if (!(m = u.match(/^\/(tr|en|de)\/modul\/([^/]+)(?:\/([^/]+))?$/))) continue;
  const [, lang, sec, sub] = m;
  const key = SECTION[sec];
  if (!key) { loose.push(u); continue; }
  if (!sub) { out[u] = { lang, key }; continue; }
  if (key === "about") { out[u] = { lang, key: CORP[sub] || "about" }; if (!CORP[sub]) loose.push(u); continue; }
  let slug = null;
  if (key === "team") slug = matchTeam(sub);
  else {
    const i = order[key][lang].indexOf(sub);
    const tr = order[key].tr[i];
    slug = key === "areas" ? matchArea(tr) : matchArticle(tr);
  }
  if (slug) out[u] = { lang, key, slug };
  else { out[u] = { lang, key }; loose.push(u); }
}

fs.writeFileSync(path.join(__dirname, "..", "site", "content", "legacy-redirects.json"),
  JSON.stringify(out, null, 1) + "\n", "utf8");
console.log("mapped %d of %d old URLs (%d to a section index instead of the exact page)",
  Object.keys(out).length, old.filter((u) => u !== "/tr" && u !== "/en" && u !== "/de").length, loose.length);
loose.forEach((u) => console.log("  →index", u));
