"use strict";

/* Machine-facing files: robots.txt and llms.txt / llms-full.txt.

   One module so the dev server and the static build serve identical text.

   robots.txt names the AI crawlers explicitly. "User-agent: *" already allows
   them, but several operators document their bots by name, and naming them
   makes the firm's intent unambiguous: the public pages may be read, cited and
   used to answer questions; only /admin is off limits.

   llms.txt follows the llmstxt.org proposal: a short Markdown map of the site
   that AI assistants can read in one request. llms-full.txt carries the text
   itself (practice areas, abstracts, event summaries) for the same purpose. */

const D = require("../content/data");
const { T } = require("../content/i18n");
const { url } = require("./layout");
const store = require("./store");
const AREA_TEXT = require("../content/areas-detail");
const ART = require("../content/articles.json");

const ARTICLES = () => ART.articles.filter((a) => a.published !== false);

const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot",
];

function robots(origin) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "",
    "# AI search and assistants are welcome to read and cite the public pages.",
    ...AI_BOTS.flatMap((b) => [`User-agent: ${b}`, "Allow: /", "Disallow: /admin", ""]),
    `Sitemap: ${origin}/sitemap.xml`,
    `# Site summary for AI assistants: ${origin}/llms.txt`,
    "",
  ].join("\n");
}

const f = D.firm;
const loc = (v, l) => (v && (v[l] || v.tr)) || "";
const fmtDay = (d) => d || "";

function llms(origin) {
  const L = "tr";
  const events = store.events.published();
  const team = store.team.published();
  const lines = [
    `# ${f.name.tr}`,
    "",
    `> ${f.name.tr} (${f.name.en}), ${f.founded} yılından bu yana İstanbul Kadıköy'de faaliyet gösteren, İstanbul Barosu'na kayıtlı bir avukatlık ortaklığıdır. Kurucu ortak Prof. Dr. Etem Saba Özmen, Maltepe Üniversitesi Hukuk Fakültesi öğretim üyesidir. Ortaklık; taşınmaz hukuku, kat mülkiyeti, kentsel dönüşüm, inşaat sözleşmeleri, kamulaştırma ve imar hukuku başta olmak üzere hukuki danışmanlık ve dava takibi yürütür.`,
    "",
    `Site Türkçe, İngilizce ve Almanca yayımlanır: ${origin}/tr, ${origin}/en, ${origin}/de. Makalelerin tam metinleri Türkçedir (PDF).`,
    "",
    `İletişim: ${f.address.street} · ${f.phones.join(", ")} · ${f.emails.general}`,
    "",
    "## Kurumsal",
    `- [Hakkımızda](${origin}${url(L, "about")})`,
    `- [Vizyon ve Misyon](${origin}${url(L, "vision")})`,
    `- [Ekibimiz](${origin}${url(L, "team")}): ${team.map((m) => m.name).join(", ")}`,
    `- [İletişim](${origin}${url(L, "contact")})`,
    "",
    "## Çalışma alanları",
    ...D.areas.map((a) => `- [${a.name.tr}](${origin}${url(L, "areas", a.slug)}): ${a.desc.tr}`),
    "",
    "## Makaleler",
    `Prof. Dr. Etem Saba Özmen'in hukuk dergilerinde yayımlanan çalışmaları (${ARTICLES().length} yayın): ${origin}${url(L, "articles")}`,
    "",
    ...ARTICLES().map((a) => `- [${a.title.tr}](${origin}${url(L, "articles", a.slug)})${[a.journal, a.year, a.coAuthor ? a.coAuthor + " ile" : ""].filter(Boolean).length ? ": " + [a.journal, a.year, a.coAuthor ? a.coAuthor + " ile" : ""].filter(Boolean).join(", ") : ""}`),
    "",
    "## Eğitim ve kongreler",
    `Ekibimizin konuşmacı, eğitmen veya oturum başkanı olarak yer aldığı etkinlikler (${events.length} kayıt): ${origin}${url(L, "events")}`,
    "",
    ...events.map((e) => `- [${loc(e.title, L)}](${origin}${url(L, "events", e.slug)}): ${[fmtDay(e.date), (e.organizers || [])[0]].filter(Boolean).join(", ")}`),
    "",
    "## Optional",
    `- [Tam metin özeti (llms-full.txt)](${origin}/llms-full.txt): çalışma alanlarının açıklamaları, makale özetleri ve etkinlik bilgileri`,
    `- [English site](${origin}/en)`,
    `- [Deutsche Website](${origin}/de)`,
    "",
  ];
  return lines.join("\n");
}

function llmsFull(origin) {
  const L = "tr";
  const out = [
    `# ${f.name.tr} — tam metin özeti`,
    "",
    `Kaynak: ${origin}/tr · Bu dosya sitenin herkese açık içeriğinin düz metin özetidir.`,
    "",
    "## Çalışma alanları",
    "",
  ];
  D.areas.forEach((a) => {
    const t = (AREA_TEXT[a.slug] || {})[L];
    out.push(`### ${a.name.tr}`, `URL: ${origin}${url(L, "areas", a.slug)}`, "", a.desc.tr, "");
    if (t) {
      t.intro.forEach((p) => out.push(p, ""));
      out.push("Başlıca konular:", ...t.scope.map((s) => "- " + s), "");
      if (t.laws && t.laws.length) out.push("Temel mevzuat:", ...t.laws.map((s) => "- " + s), "");
    }
  });
  out.push("## Makaleler", "");
  ARTICLES().forEach((a) => {
    out.push(`### ${a.title.tr}`, `URL: ${origin}${url(L, "articles", a.slug)}`);
    const meta = [
      "Yazar: Prof. Dr. Etem Saba Özmen" + (a.coAuthor ? ", " + a.coAuthor : ""),
      a.journal ? "Yayımlandığı yer: " + a.journal : "",
      a.date ? "Tarih: " + a.date : "",
      a.pdf ? "PDF: " + origin + a.pdf : "",
    ].filter(Boolean);
    out.push(...meta, "");
    if (a.summary && a.summary.tr) out.push(a.summary.tr, "");
  });
  out.push("## Eğitim ve kongreler", "");
  store.events.published().forEach((e) => {
    out.push(`### ${loc(e.title, L)}`, `URL: ${origin}${url(L, "events", e.slug)}`);
    out.push(...[
      e.date ? "Tarih: " + e.date + (e.endDate ? " – " + e.endDate : "") + (e.startTime ? ", " + e.startTime : "") : "",
      (e.organizers || []).length ? "Düzenleyen: " + e.organizers.join(", ") : "",
      loc(e.venue, L) ? "Yer: " + loc(e.venue, L) + (e.city ? ", " + e.city : "") : "",
      (e.roles || []).length ? "Görev: " + e.roles.map((r) => T("ev.role." + r, L)).join(", ") : "",
      ...(e.talks || []).map((t) => "Sunum: " + loc(t, L)),
    ].filter(Boolean), "");
    if (loc(e.body, L)) out.push(loc(e.body, L), "");
  });
  return out.join("\n");
}

module.exports = { robots, llms, llmsFull, AI_BOTS };
