/* Events from the firm's poster archive (AFİŞLER.e.saba özmen.rar, 2026-09-24).

   Facts are read off the posters and programme files; nothing is invented.
   Summaries and body text are built from those facts by the templates below,
   so every sentence stays true to the record. Where a poster was a phone
   screenshot the crop keeps only the poster; "blank" paints over Zoom IDs,
   passwords and phone numbers (fractions of the original image).

   src prefixes (resolved by ref/make_event_posters.py):
     AFIS:<path>          image inside the archive
     PDF:<path>#<page>    page of a PDF in the archive (0-based)
     DOCX:<path>          largest image embedded in a Word file            */

const UI = require("../shared/admin-ui.mjs");

const MONTH = {
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
};
function day(d, l) {
  const [y, m, dd] = d.split("-").map(Number);
  return l === "de" ? `${dd}. ${MONTH.de[m - 1]} ${y}` : `${dd} ${MONTH[l][m - 1]} ${y}`;
}

const ROLE_DID = {
  tr: { konusmaci: "konuşmacı olarak katıldı", egitmen: "eğitmen olarak yer aldı", "oturum-baskani": "oturum başkanlığı yaptı",
        moderator: "moderatörlük yaptı", "bilim-kurulu": "bilim kurulunda yer aldı", konuk: "konuk olarak katıldı" },
  en: { konusmaci: "spoke", egitmen: "taught", "oturum-baskani": "chaired a session",
        moderator: "moderated", "bilim-kurulu": "served on the scientific committee", konuk: "appeared as a guest" },
  de: { konusmaci: "trug vor", egitmen: "unterrichtete", "oturum-baskani": "leitete eine Sitzung",
        moderator: "moderierte", "bilim-kurulu": "gehörte dem wissenschaftlichen Beirat an", konuk: "war zu Gast" },
};
const joinL = (arr, l) => arr.length < 2 ? arr.join("") :
  arr.slice(0, -1).join(", ") + (l === "tr" ? " ve " : l === "de" ? " und " : " and ") + arr[arr.length - 1];

/* Slug from the Turkish title, cut at a word boundary, year appended once. */
function makeSlug(t, year) {
  let s = UI.slugify(t.replace(/['’]/g, ""));
  if (s.length > 64) s = s.slice(0, 65).replace(/-[^-]*$/, "");
  return year && !s.endsWith(year) ? s + "-" + year : s;
}

/* Role notes after speakers' names, in the page language. */
const ROLE_WORD = {
  "moderatör": { en: "moderator", de: "Moderation" }, "oturum başkanı": { en: "session chair", de: "Sitzungsleitung" },
  "açılış": { en: "opening remarks", de: "Eröffnung" }, "kolaylaştırıcı": { en: "facilitator", de: "Moderation" },
  "yönlendirici": { en: "facilitator", de: "Moderation" }, "sunucu": { en: "presenter", de: "Moderation" },
};
function people(p, l) {
  if (l === "tr") return p;
  return p.replace(/\(([^)]*)\)$/, (m, inner) => {
    const w = ROLE_WORD[inner.trim()];
    return w ? "(" + w[l] + ")" : m;
  });
}

function build(x) {
  const title = x.title;
  const talks = (x.talks || []).map((t) => (typeof t === "string" ? { tr: t, en: "", de: "" } : Object.assign({ de: "" }, t)));
  const roles = x.roles || [x.type === "egitim" || x.type === "seminer" || x.type === "webinar" ? "egitmen" : "konusmaci"];
  const org = x.org || [];
  const when = (l) => x.date ? day(x.date, l) + (x.endDate && x.endDate !== x.date ? " – " + day(x.endDate, l) : "") : "";
  const place = [x.venue, x.city].filter(Boolean).join(", ");
  const summary = {}, body = {};
  ["tr", "en", "de"].forEach((l) => {
    const t = title[l] || title.tr;
    const did = joinL(roles.map((r) => ROLE_DID[l][r]), l);
    const talk = talks.length ? (talks[0][l] || talks[0].tr) : "";
    const orgTxt = org.length ? joinL(org, l) : "";
    const head = [org[0], when(l)].filter(Boolean).join(", ");
    const where = x.format === "cevrimici"
      ? { tr: "Program çevrimiçi yapıldı.", en: "The event was held online.", de: "Die Veranstaltung fand online statt." }[l]
      : place ? { tr: "Yer: ", en: "Venue: ", de: "Ort: " }[l] + place + "." : "";
    const talkLine = talks.length
      ? { tr: "Sunum" + (talks.length > 1 ? "lar" : ""), en: "Presentation" + (talks.length > 1 ? "s" : ""), de: "Vortr" + (talks.length > 1 ? "äge" : "ag") }[l]
        + ": " + talks.map((k) => (l === "de" ? "„" + (k.de || k.en || k.tr) + "“" : '"' + (k[l] || k.en || k.tr) + '"')).join("; ") + "."
      : "";
    const sp = x.team ? [] : (x.speakers || []).map((p) => people(p, l));   // team talks are told in the note
    const others = sp.length
      ? { tr: `Programda ayrıca ${joinL(sp, "tr")} yer aldı.`, en: `The programme also featured ${joinL(sp, "en")}.`, de: `Außerdem wirkten ${joinL(sp, "de")} mit.` }[l]
      : "";
    if (l === "tr") {
      summary.tr = talk ? `${t}: Prof. Dr. Etem Saba Özmen "${talk}" başlıklı sunumu yaptı.`
        : `${t}${head ? " — " + head : ""}. Prof. Dr. Etem Saba Özmen ${did}.`;
      body.tr = `${orgTxt ? orgTxt + " tarafından " : ""}${when("tr") ? when("tr") + " tarihinde " : ""}düzenlenen "${t}" programında Prof. Dr. Etem Saba Özmen ${did}.`;
    } else if (l === "en") {
      summary.en = talk ? `${t}: Prof. Dr. Etem Saba Özmen presented "${talk}".`
        : `${t}${head ? " — " + head : ""}. Prof. Dr. Etem Saba Özmen ${did}.`;
      body.en = `Prof. Dr. Etem Saba Özmen ${did} at "${t}"${orgTxt ? ", organised by " + orgTxt : ""}${when("en") ? ", on " + when("en") : ""}.`;
    } else {
      summary.de = talk ? `${t}: Prof. Dr. Etem Saba Özmen referierte über „${talk}“.`
        : `${t}${head ? " — " + head : ""}. Prof. Dr. Etem Saba Özmen ${did}.`;
      body.de = `Prof. Dr. Etem Saba Özmen ${did}: „${t}“${orgTxt ? ", veranstaltet von " + orgTxt : ""}${when("de") ? ", " + when("de") : ""}.`;
    }
    body[l] = [body[l], where, talkLine, others, x.note && x.note[l] ? x.note[l] : ""].filter(Boolean).join(" ");
  });
  const slug = x.slug || makeSlug(title.tr, (x.date || "").slice(0, 4));
  return {
    slug, src: x.poster ? x.poster.src : null, crop: x.poster && x.poster.crop, blank: x.poster && x.poster.blank,
    type: x.type, format: x.format || "yuz-yuze", date: x.date || "", endDate: x.endDate || "",
    startTime: x.start || "", endTime: x.end || "", city: x.city || "", address: x.address || "",
    roles, teamSlugs: ["etem-saba-ozmen"].concat(x.team || []), organizers: org,
    talks: talks.map((k) => ({ tr: k.tr, en: k.en || k.tr, de: k.de || k.en || k.tr })),
    speakers: x.speakers || [], areaSlugs: x.areas || [], articleSlugs: [],
    program: x.program || "", link: "",
    title: { tr: title.tr, en: title.en, de: title.de },
    venue: { tr: x.format === "cevrimici" ? (x.venue || "Çevrimiçi") : (x.venue || ""), en: x.format === "cevrimici" ? (x.venue || "Online") : (x.venue || ""), de: x.format === "cevrimici" ? (x.venue || "Online") : (x.venue || "") },
    summary, body, published: x.published !== false,
  };
}

const A = (s) => ({ src: "AFIS:" + s });
const TBB = "Türkiye Barolar Birliği";
const IST = "İstanbul Barosu";
const HE = "Hukukeğitim";
const ARISTO = ["Aristo Akademi", "Hukukfuar"];
const KAT = "kat-mulkiyeti-hukuku", KD = "gayrimenkul-hukuku-ve-kentsel-donusum", KAM = "kamulastirma-hukuku",
  IMAR = "imar-hukuku", INS = "insaat-hukuku", SOZ = "sozlesmeler-hukuku", TUK = "tuketici-hukuku",
  DEV = "devre-mulk-ve-devre-tatil-hukuku", TOP = "toplu-yapilarda-yonetim-plani", IPO = "barter-mortgage-tasinmaz-rehni-ve-ipotek",
  KOOP = "kooperatifler-hukuku", MIRAS = "miras-hukuku", AILE = "aile-hukuku", TIC = "ticaret-ve-sirketler-hukuku",
  ICRA = "icra-ve-iflas-hukuku", YAB = "yabancilara-tasinmaz-satisi", ORMAN = "orman-hukuku-ve-2b";

const L = [
  /* ------------------------------------------------------------ 2017 */
  { slug: "kat-mulkiyeti-hukuku-meslek-ici-egitim-semineri-mugla-barosu-2017", type: "seminer", date: "2017-02-04", start: "10:30", city: "Bodrum, Muğla", org: [TBB, "Muğla Barosu"],
    venue: "Bodrum Ticaret Odası Konferans Salonu", speakers: ["Mahir Ersin Germeç (Yargıtay Hukuk Dairesi Onursal Başkanı)", "Av. M. Şeref Kısacık"],
    areas: [KAT], poster: { src: "PDF:2017/KAT MÜLKİYETİ- MUĞLA.04.02.2017.tbb.pdf#0" },
    title: { tr: "Muğla Barosu: Kat Mülkiyeti Hukuku Meslek İçi Eğitim Semineri", en: "Muğla Bar: Condominium Law Training Seminar", de: "Anwaltskammer Muğla: Fortbildungsseminar Wohnungseigentumsrecht" } },
  { slug: "kat-mulkiyeti-hukuku-ve-kentsel-donusum-aydin-barosu-2017", type: "seminer", date: "2017-02-25", start: "10:00", city: "Aydın", org: [TBB, "Aydın Barosu"],
    venue: "Aydın Barosu Staj Eğitim ve Konferans Salonu", speakers: ["Av. Ali Rıza İlgezdi", "Av. M. Şeref Kısacık"],
    areas: [KAT, KD], poster: { src: "PDF:2017/KENTSEL.AYDIN.25.02.2017.tbb.pdf#0" },
    title: { tr: "Aydın Barosu: Kat Mülkiyeti Hukuku ve Kentsel Dönüşüm Semineri", en: "Aydın Bar: Condominium Law and Urban Regeneration Seminar", de: "Anwaltskammer Aydın: Seminar Wohnungseigentum und Stadterneuerung" } },
  { slug: "kamulastirma-hukuku-ve-kentsel-donusum-adana-barosu-2017", type: "seminer", date: "2017-11-18", start: "10:30", city: "Adana", org: [TBB, "Adana Barosu"],
    venue: "Adana Barosu Sosyal Tesisleri", speakers: ["Av. Ali Rıza İlgezdi"], areas: [KAM, KD],
    poster: { src: "PDF:2017/ADANA.18.11.2017.tbb.pdf#0" },
    title: { tr: "Adana Barosu: Kamulaştırma Hukuku ve Kentsel Dönüşüm Semineri", en: "Adana Bar: Expropriation Law and Urban Regeneration Seminar", de: "Anwaltskammer Adana: Seminar Enteignungsrecht und Stadterneuerung" } },
  { slug: "kamulastirma-hukuku-ve-kentsel-donusum-edirne-barosu-2017", type: "seminer", date: "2017-12-02", start: "10:30", city: "Edirne", org: [TBB, "Edirne Barosu"],
    venue: "Edirne Barosu Konferans Salonu", address: "İstasyon Mahallesi, Hakim Çağlar Işık Caddesi, Edirne",
    speakers: ["Av. Ali Rıza İlgezdi"], areas: [KAM, KD], poster: { src: "PDF:2017/edirne.02.12.2017.tbb.pdf#0" },
    title: { tr: "Edirne Barosu: Kamulaştırma Hukuku ve Kentsel Dönüşüm Semineri", en: "Edirne Bar: Expropriation Law and Urban Regeneration Seminar", de: "Anwaltskammer Edirne: Seminar Enteignungsrecht und Stadterneuerung" } },

  /* ------------------------------------------------------------ 2018 */
  { type: "sempozyum", date: "2018-05-03", endDate: "2018-05-04", start: "09:30", city: "İstanbul",
    org: ["Maltepe Üniversitesi Hukuk Fakültesi"], venue: "Marma Otel İstanbul", roles: ["konusmaci", "oturum-baskani"],
    talks: [{ tr: "Kamu Taşınmazlarında Bağımsız ve Sürekli Üst Hakkının Sona Ermesine Dayalı Sorunlar", en: "Problems Arising from the Termination of Independent and Permanent Building Rights on Public Land" }],
    areas: [KD], poster: A("2018/maltepe üni sempozyum afiş.03.04..05.2018.jpg"),
    program: [
      "## 3 Mayıs 2018 | I. Oturum (10:30–12:00) | Oturum Başkanı: Prof. Dr. Etem Saba Özmen",
      "- Prof. Dr. Alper Gümüş (İstanbul Şehir Üniversitesi) — Yargıtay Kararları Işığında Kiraya Verenin Maliki Olmadığı veya Maliklerinden Birisi Olduğu Taşınmaza İlişkin Akdettiği Kira Sözleşmesi Karşısında Taşınmazın Maliki veya Diğer Maliklerinin Hukuksal Konumu",
      "- Doç. Dr. Sezer Çabri (Kocaeli Üniversitesi) — İmar Hukukunda Düzenleme Ortaklık Payının Eşya Hukukuna İlişkin Sonuçları",
      "- Dr. Öğr. Üyesi Duygu Koçak Diker (Kocaeli Üniversitesi) — Rekabet Kurumunca Süresinden Önce Sona Erdirilen İntifa Hakkı Bedelinin İadesine Dayalı Hukuki Sorunlar",
      "## 4 Mayıs 2018 | I. Oturum (10:00–12:00) | Oturum Başkanı: Prof. Dr. Saibe Oktay Özdemir",
      "- Prof. Dr. Etem Saba Özmen (Maltepe Üniversitesi) — Kamu Taşınmazlarında Bağımsız ve Sürekli Üst Hakkının Sona Ermesine Dayalı Sorunlar",
      "- Prof. Dr. Faruk Acar (Marmara Üniversitesi) — Ticari İşlemlerde Taşınır Rehni Kanunu Çerçevesinde Taşınmazların Rehni",
      "- Dr. Öğr. Üyesi Müge Ürem (Maltepe Üniversitesi) — 6306 Sayılı Kanun Uyarınca Riskli Yapı Kararlarının Mevcut Şerhlere Etkisi",
    ].join("\n"),
    title: { tr: "Taşınmaz Hukukunun Güncel Sorunları Sempozyumu (Maltepe Üniversitesi, 2018)", en: "Symposium on Current Issues in Real Property Law (Maltepe University, 2018)", de: "Symposium zu aktuellen Fragen des Immobilienrechts (Maltepe-Universität, 2018)" } },
  { type: "seminer", date: "2018-09-29", start: "10:00", city: "Kayseri", org: ["Kayseri Barosu", "TBB Eğitim Merkezi"],
    venue: "Kadir Has Kültür Sanat ve Kongre Merkezi", speakers: ["Mahir Ersin Germeç", "Prof. Dr. Abdülkadir Arpacı", "Av. M. Şeref Kısacık"],
    talks: [{ tr: "Kentsel Dönüşüm ve İmar Barışı Uygulamaları", en: "Urban Regeneration and the Zoning Amnesty in Practice" }],
    areas: [KAT, KD, IMAR], poster: A("2018/kmh.kayseri.29.09.2018.tbb.jpg"),
    title: { tr: "Kat Mülkiyeti Hukuku: Kentsel Dönüşüm ve İmar Barışı Uygulamaları (Kayseri Barosu)", en: "Condominium Law: Urban Regeneration and the Zoning Amnesty (Kayseri Bar)", de: "Wohnungseigentum: Stadterneuerung und Bau-Amnestie (Anwaltskammer Kayseri)" } },
  { type: "seminer", date: "2018-10-06", start: "10:00", city: "Van", org: [TBB, "Van Barosu"], venue: "Elite World Otel Van",
    speakers: ["Mahir Ersin Germeç", "Av. Ali Rıza İlgezdi", "Av. M. Şeref Kısacık"], areas: [KAT, KD, IMAR],
    poster: { src: "PDF:2018/van.06.10.2018.tbb.pdf#0" },
    title: { tr: "Kat Mülkiyeti Hukuku: Kentsel Dönüşüm, İmar Barışı ve 18. Madde Uygulamaları (Van Barosu)", en: "Condominium Law: Regeneration, Zoning Amnesty and Article 18 Readjustment (Van Bar)", de: "Wohnungseigentum: Stadterneuerung, Bau-Amnestie und Umlegung nach Art. 18 (Anwaltskammer Van)" } },
  { type: "sempozyum", date: "2018-11-02", start: "15:00", end: "16:15", city: "İstanbul", org: ["Yeditepe Üniversitesi Hukuk Fakültesi"],
    venue: "Yeditepe Üniversitesi Güzel Sanatlar Fakültesi Konferans Salonu",
    talks: [{ tr: "İmar Barışının Türk Eşya Hukukuna İlişkin Hüküm ve Sonuçları", en: "The Zoning Amnesty and its Consequences for Turkish Property Law" }],
    areas: [IMAR, KD], poster: A("2018/yeditepe üni.ulusal sempozyum.02.11.2018.jpg"),
    title: { tr: "Yargıtay Uygulaması Çerçevesinde Borçlar Hukuku ve Eşya Hukukundaki Güncel Gelişmeler Sempozyumu", en: "Symposium on Current Developments in the Law of Obligations and Property Law in Court of Cassation Practice", de: "Symposium zu aktuellen Entwicklungen im Schuld- und Sachenrecht in der Rechtsprechung des Kassationshofs" } },
  { type: "sempozyum", date: "2018-11-07", start: "10:00", end: "18:00", city: "İstanbul", org: ["İstanbul Okan Üniversitesi Hukuk Fakültesi"],
    venue: "İstanbul Okan Üniversitesi Tuzla Kampüsü, Mevlana Konferans Salonu",
    speakers: ["Prof. Dr. Baki Kuru", "Mahir Ersin Germeç", "Prof. Dr. Abdülkadir Arpacı", "Dr. Öğr. Üyesi Ahmet Ayar", "Av. M. Şeref Kısacık"],
    areas: [KAT, KD], poster: A("2018/okan sempozyum 07.11.2018.jpg"),
    title: { tr: "Kat Mülkiyeti Hukuku ve Kentsel Dönüşüm Uygulamaları Sempozyumu (Okan Üniversitesi)", en: "Symposium on Condominium Law and Urban Regeneration Practice (Okan University)", de: "Symposium zu Wohnungseigentum und Stadterneuerung (Okan-Universität)" } },
  { type: "sempozyum", date: "2018-11-08", endDate: "2018-11-09", start: "09:00", end: "10:40", city: "İstanbul",
    org: ["Özyeğin Üniversitesi Hukuk Fakültesi", IST], venue: "İstanbul Barosu Merkez Binası Konferans Salonu, Beyoğlu",
    talks: [{ tr: "Bozucu Yenilik Doğurucu Hakkın Yargı Denetimine Tabi Olması ve Yargıtay Kararlarının Eleştirisi", en: "Judicial Review of Extinctive Formative Rights: a Critique of Court of Cassation Decisions" }],
    areas: [SOZ], poster: { src: "PDF:2018/özyegin.baro.Yargıtay Kararları Işığında Güncel Medeni Hukuk Problemleri Sempozyumu Afiş.8.9..11.2018.pdf#0" },
    title: { tr: "Yargıtay Kararları Işığında Güncel Medeni Hukuk Problemleri Sempozyumu", en: "Symposium on Current Civil Law Problems in the Light of Court of Cassation Decisions", de: "Symposium zu aktuellen zivilrechtlichen Problemen im Licht der Rechtsprechung des Kassationshofs" } },

  /* ------------------------------------------------------------ 2019 */
  { type: "sempozyum", date: "2019-01-11", start: "09:30", end: "17:00", city: "İstanbul", org: ["Kadir Has Üniversitesi Hukuk Fakültesi", IST],
    venue: "Kadir Has Üniversitesi Cibali Kampüsü, D Blok Büyük Salon",
    talks: [{ tr: "Toplu Yapı Yönetim Planlarının 5711/5912 Sayılı Kanunlarla Değişik Kat Mülkiyeti Kanununa Uyarlanması Yolunda Fahiş Hatalı Uygulamaların Değerlendirilmesi", en: "Serious Errors in Adapting Collective-Building Management Plans to the Condominium Law as Amended by Laws No. 5711 and 5912" }],
    areas: [KAT, TOP], poster: { src: "PDF:2019/09.01.19/20190111KATMULKIYETI.pdf#0" },
    title: { tr: "Kat Mülkiyeti Hukuku Uygulamaları Sempozyumu (Kadir Has Üniversitesi ve İstanbul Barosu)", en: "Symposium on Condominium Law in Practice (Kadir Has University and Istanbul Bar)", de: "Symposium zur Praxis des Wohnungseigentumsrechts (Kadir-Has-Universität und Anwaltskammer Istanbul)" } },
  { type: "sempozyum", date: "2019-03-08", endDate: "2019-03-09", city: "Antalya", org: ["Antalya Bilim Üniversitesi Hukuk Fakültesi"],
    venue: "Antalya Esnaf ve Sanatkârlar Odaları Birliği Konferans Salonu",
    talks: [
      { tr: "Kentsel Dönüşüm Uygulama Yönetmeliğine Yönelik Eleştiriler ve Çözüm Önerileri", en: "Critique of the Urban Regeneration Implementing Regulation and Proposed Solutions" },
      { tr: "Yargıtay Uygulaması Çerçevesinde Avans Tapu Sorunu", en: "The 'Advance Title Deed' Problem in Court of Cassation Practice" },
    ],
    areas: [KD, INS], poster: A("2019/antalya.edu.tr.sempozyum.jpg"),
    title: { tr: "Kentsel Dönüşüm ve Hukuk Sempozyumu (Antalya Bilim Üniversitesi)", en: "Symposium on Urban Regeneration and Law (Antalya Bilim University)", de: "Symposium Stadterneuerung und Recht (Antalya-Bilim-Universität)" } },
  { type: "konferans", date: "2019-04-05", start: "10:30", end: "13:30", city: "İstanbul", org: ["İstanbul Barosu Banka ve Finans Hukuku Komisyonu"],
    venue: "Çağlayan Adliyesi Konferans Salonu",
    talks: [{ tr: "Taşınmaz Yatırımlarında Garantör Firma (Trustee Company) ve Sulh ve Tahkime Aracılık (Arbitration Court) Hizmeti Zorunluluğu Üzerine Düşünceler", en: "Thoughts on Requiring Trustee Companies and Settlement/Arbitration Services in Real Estate Investment" }],
    areas: [KD, "tahkim"],
    title: { tr: "Gayrimenkul Finansmanının Hukuki Boyutu ve Uygulama Modelleri", en: "Real Estate Finance: Legal Dimension and Practical Models", de: "Immobilienfinanzierung: rechtliche Dimension und Praxismodelle" } },
  { type: "seminer", date: "2019-04-19", start: "15:30", end: "17:00", city: "İstanbul", org: ["Özyeğin Üniversitesi Alp Alkaş Perakende ve Gayrimenkul Merkezi"],
    venue: "Özyeğin Üniversitesi", roles: ["egitmen"], areas: [KD, INS],
    title: { tr: "Gayrimenkul Geliştirme Sürecinde Karşılaşılan Hukuki Sorunlar (Özyeğin Üniversitesi)", en: "Legal Problems in Real Estate Development (Özyeğin University)", de: "Rechtsprobleme der Projektentwicklung (Özyeğin-Universität)" } },
  { type: "sempozyum", date: "2019-04-26", start: "13:00", end: "14:45", city: "İstanbul", org: ["Marmara Üniversitesi Hukuk Fakültesi"],
    talks: [{ tr: "Arsa Payı Karşılığı İnşaat Sözleşmesinde Temel Yanılgılar", en: "Fundamental Misconceptions in Land-Share-for-Construction Contracts" }],
    areas: [INS], poster: { src: "AFIS:2019/marmara üniversitesi inşaat hukuku sempozyumu.jpg", crop: [0.01, 0.2, 0.955, 0.745] },
    title: { tr: "İnşaat Hukuku Sempozyumu (Marmara Üniversitesi, 2019)", en: "Construction Law Symposium (Marmara University, 2019)", de: "Symposium zum Baurecht (Marmara-Universität, 2019)" } },
  { type: "sempozyum", date: "2019-05-08", city: "İstanbul", org: ["İstanbul Arel Üniversitesi", "Galatasaray Üniversitesi Medeni Hukuk Anabilim Dalı"],
    venue: "Galatasaray Üniversitesi Aydın Doğan Salonu",
    talks: [{ tr: "6502 Sayılı Tüketicinin Korunması Hakkında Kanunda Yer Alan Ön Ödemeli Konut Satışına İlişkin Kanun Değişikliği Önerileri", en: "Proposed Amendments to the Rules on Pre-paid Home Sales in Consumer Protection Law No. 6502" }],
    areas: [TUK], poster: A("2019/gs sempozyum.jpeg"),
    title: { tr: "Tüketici Hukukunun Güncel Sorunları Sempozyumu (Galatasaray Üniversitesi, 2019)", en: "Symposium on Current Issues in Consumer Law (Galatasaray University, 2019)", de: "Symposium zu aktuellen Fragen des Verbraucherrechts (Galatasaray-Universität, 2019)" } },
  { type: "sempozyum", date: "2019-10-31", start: "09:30", end: "17:30", city: "İstanbul", org: ["Maltepe Üniversitesi Hukuk Fakültesi İdare Hukuku Anabilim Dalı"],
    venue: "Marma Hotel İstanbul Asia", roles: ["konusmaci", "oturum-baskani"],
    talks: [{ tr: "İmar Kanunu'nda Değişiklik Önerileri", en: "Proposed Amendments to the Zoning Law" }],
    areas: [IMAR], poster: { src: "PDF:2019/31 10 2019 maltepe sempozyum.pdf#0" },
    title: { tr: "İmar Hukukunda Güncel Sorunlar Sempozyumu (Maltepe Üniversitesi)", en: "Symposium on Current Issues in Zoning Law (Maltepe University)", de: "Symposium zu aktuellen Fragen des Baurechts (Maltepe-Universität)" } },
  { type: "sempozyum", date: "2019-11-15", endDate: "2019-11-16", city: "İzmir", org: ["Dokuz Eylül Üniversitesi Hukuk Fakültesi"],
    venue: "Dokuz Eylül Üniversitesi Rektörlüğü, DESEM 15 Temmuz Şehitler Salonu, Alsancak", roles: ["konusmaci", "bilim-kurulu"],
    talks: [{ tr: "Kamu Arazilerinde Üst Hakkı Uygulamalarına Yönelik Eleştiriler", en: "A Criticism on the Right of Construction Applications on Public Lands" }],
    areas: [KD], poster: A("2019/İZMİR SEMPOZYUM.15_16 kasım 2019/Uluslararası Eşya Hukuku Sempozyumu Afişi.deü.jpg"),
    note: { tr: "Sempozyum 10 farklı ülkeden bilim insanının katkısıyla gerçekleşti.", en: "Scholars from ten countries contributed to the symposium.", de: "Wissenschaftler aus zehn Ländern trugen zum Symposium bei." },
    title: { tr: "Uluslararası Eşya Hukuku Sempozyumu (Dokuz Eylül Üniversitesi)", en: "International Symposium on Property Law (Dokuz Eylül University)", de: "Internationales Symposium zum Sachenrecht (Dokuz-Eylül-Universität)" } },
  { type: "egitim", date: "2019-11-30", endDate: "2019-12-01", start: "09:30", end: "16:30", city: "İstanbul", org: ARISTO,
    venue: "Aristo Kitabevi & Coffee, Çağlayan", areas: [KD], poster: { src: "AFIS:2019_ARİSTO AKADEMİ/tasinmaz-egitim.aristo akademi.jpg", blank: [[0.05, 0.795, 0.66, 0.842]] },
    note: { tr: "İki gün süren 12 saatlik eğitim.", en: "A 12-hour course over two days.", de: "Zwölfstündiger Kurs an zwei Tagen." },
    title: { tr: "Taşınmaz Davaları Şematik Anlatımı Eğitimi (Aristo Akademi)", en: "Real Property Litigation: a Schematic Course (Aristo Academy)", de: "Immobilienprozesse im Überblick (Aristo-Akademie)" } },
  { type: "egitim", date: "2019-12-14", endDate: "2019-12-15", start: "09:30", end: "16:30", city: "İstanbul", org: ARISTO,
    venue: "Aristo Kitabevi & Coffee, Çağlayan", areas: [KAT], poster: { src: "AFIS:2019_ARİSTO AKADEMİ/kat-mulkiyeti.aristo akademi.jpg", blank: [[0.05, 0.795, 0.66, 0.842]] },
    note: { tr: "İki gün süren 12 saatlik eğitim.", en: "A 12-hour course over two days.", de: "Zwölfstündiger Kurs an zwei Tagen." },
    title: { tr: "Kat Mülkiyeti Hukuku Eğitimi (Aristo Akademi)", en: "Condominium Law Course (Aristo Academy)", de: "Kurs Wohnungseigentumsrecht (Aristo-Akademie)" } },
  { type: "egitim", date: "2019-12-28", endDate: "2019-12-29", start: "09:30", end: "16:30", city: "İstanbul", org: ARISTO,
    venue: "Aristo Kitabevi & Coffee, Çağlayan", areas: [INS, SOZ], poster: { src: "AFIS:2019_ARİSTO AKADEMİ/APKİS.ARİSTO AKADEMİ.jpg", blank: [[0.05, 0.807, 0.66, 0.854]] },
    note: { tr: "İki gün süren 12 saatlik eğitim.", en: "A 12-hour course over two days.", de: "Zwölfstündiger Kurs an zwei Tagen." },
    title: { tr: "Arsa Payı Karşılığı İnşaat Sözleşmeleri Bazlı Sözleşme Yapma Teknikleri (Aristo Akademi)", en: "Drafting Land-Share-for-Construction Contracts (Aristo Academy)", de: "Aristo-Akademie: Gestaltung von Bauleistungsverträgen gegen Grundstücksanteil" } },

  /* ------------------------------------------------------------ 2020 */
  { type: "egitim", date: "2020-01-11", endDate: "2020-01-12", start: "09:30", end: "16:30", city: "İstanbul", org: ARISTO,
    venue: "Aristo Kitabevi & Coffee, Çağlayan", speakers: ["Av. Serkan Çakmaklı"], areas: [KD, IMAR], poster: { src: "AFIS:2020/KENTSEL.ARİSTO AKADEMİ.jpg", blank: [[0.05, 0.846, 0.66, 0.9]] },
    title: { tr: "Kentsel Dönüşüm Hukuku Çerçevesinde İmar Barışı Uygulamaları ve Özel Hukuk Uyuşmazlıkları (Aristo Akademi)", en: "Zoning Amnesty in Urban Regeneration Law and the Resulting Private-Law Disputes (Aristo Academy)", de: "Bau-Amnestie im Stadterneuerungsrecht und privatrechtliche Streitigkeiten (Aristo-Akademie)" } },
  { type: "egitim", date: "2020-01-25", endDate: "2020-01-26", start: "09:30", end: "16:30", city: "İstanbul", org: ARISTO,
    venue: "Aristo Kitabevi & Coffee, Çağlayan", speakers: ["Av. Sezgi Cihan Ernas"], areas: [KAM], poster: { src: "AFIS:2020/KAMULAŞTIRMA.ARİSTO AKADEMİ.jpg", blank: [[0.05, 0.846, 0.66, 0.9]] },
    title: { tr: "Kamulaştırma Hukuku ve Kamulaştırmasız El Atma Davaları (Aristo Akademi)", en: "Expropriation Law and De Facto Expropriation Actions (Aristo Academy)", de: "Enteignungsrecht und Klagen wegen faktischer Enteignung (Aristo-Akademie)" } },
  { type: "egitim", date: "2020-02-08", endDate: "2020-02-09", start: "09:30", end: "16:30", city: "İstanbul", org: ARISTO,
    venue: "Aristo Kitabevi & Coffee, Çağlayan", speakers: ["Doç. Dr. Sezer Çabri"], areas: [IMAR], poster: { src: "AFIS:2020/İMAR HUKUKU.ARİSTO AKADEMİ.jpg", blank: [[0.05, 0.834, 0.66, 0.9]] },
    title: { tr: "İmar Hukukuna İlişkin Davalar ve İmar Kanunundaki Son Değişiklikler (Aristo Akademi)", en: "Zoning Litigation and the Latest Amendments to the Zoning Law (Aristo Academy)", de: "Bauplanungsrechtliche Klagen und jüngste Änderungen des Baugesetzes (Aristo-Akademie)" } },
  { type: "konferans", date: "2020-02-14", start: "10:00", end: "16:30", city: "Eskişehir", org: ["Eskişehir Barosu"],
    venue: "Eskişehir Barosu Hizmet Binası", areas: [KAM], poster: A("2020/eskişehir baro konferans_kamulaştırma.14.02.2020.jpeg"),
    title: { tr: "Kamulaştırma Hukuku ve Kamulaştırmasız El Atma Davaları — Eskişehir Barosu Konferansı", en: "Expropriation Law and De Facto Expropriation Actions — Eskişehir Bar Conference", de: "Enteignungsrecht und faktische Enteignung — Konferenz der Anwaltskammer Eskişehir" } },
  { type: "konferans", date: "2020-02-21", start: "14:00", city: "İstanbul", org: ["Maltepe Üniversitesi Hukuk Fakültesi Medeni Hukuk Anabilim Dalı"],
    venue: "Anadolu Adalet Sarayı, Şehit Murat Uzun Konferans Salonu", speakers: ["Dr. Öğr. Üyesi Gülşah Vardar Hamamcıoğlu"], areas: [INS],
    title: { tr: "Arsa Payı Karşılığı İnşaat Sözleşmeleri ve Güncel Hukuki Sorunları (Anadolu Adliyesi)", en: "Land-Share-for-Construction Contracts and Current Legal Issues (Anatolian Courthouse)", de: "Bauleistungsverträge gegen Grundstücksanteil und aktuelle Rechtsfragen (Justizgebäude Anadolu)" } },
  { type: "egitim", date: "2020-02-22", endDate: "2020-02-23", start: "09:30", end: "16:30", city: "İstanbul", org: ARISTO,
    venue: "Aristo Kitabevi & Coffee, Çağlayan", speakers: ["Dr. Öğr. Üyesi Gülşah Vardar Hamamcıoğlu"], areas: [TUK, INS], poster: { src: "AFIS:2020/ÖN ÖDEMELİ KONUT.ARİSTO AKADEMİ.jpg", blank: [[0.05, 0.779, 0.66, 0.824]] },
    title: { tr: "Ön Ödemeli Konut Satış Sözleşmeleri (Aristo Akademi)", en: "Pre-paid Home Sale Contracts (Aristo Academy)", de: "Wohnungskaufverträge mit Vorauszahlung (Aristo-Akademie)" } },
  { type: "webinar", format: "cevrimici", date: "2020-04-13", endDate: "2020-04-17", start: "14:00", end: "15:30", org: ["Aristo Hukuk"],
    areas: [ORMAN, KAT, KD], poster: { src: "DOCX:2020/saba özmen .aristo.hukuk.canlı eğitim.3ders.docx" },
    program: [
      "## 13 Nisan 2020, 14:00–15:30",
      "- Prof. Dr. Etem Saba Özmen — 2/B Arazilerine Dayalı Güncel Uyuşmazlıklar",
      "## 16 Nisan 2020, 14:00–15:30",
      "- Prof. Dr. Etem Saba Özmen — Kat Mülkiyeti Teorisi ve Arsa Payı Düzeltilmesi Davaları",
      "## 17 Nisan 2020, 14:00–15:30",
      "- Prof. Dr. Etem Saba Özmen — Taşınmaza Yönelik Ayni Neticeli Davalara İlişkin Pratik Bilgiler",
    ].join("\n"),
    title: { tr: "Aristo Hukuk Canlı Eğitim Serisi (Nisan 2020)", en: "Aristo Law Live Course Series (April 2020)", de: "Aristo-Live-Kursreihe (April 2020)" } },
  { type: "webinar", format: "cevrimici", date: "2020-05-08", start: "21:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Kerem Donat (moderatör)"], roles: ["konusmaci"], areas: [KAT], poster: A("2020/eğitim afiş.08.05.2020.jpg"),
    title: { tr: "Kat Mülkiyeti Teorisi ve Temel Kavramlar (İstanbul Barosu Canlı Yayını)", en: "Condominium Theory and Core Concepts (Istanbul Bar Live Broadcast)", de: "Theorie und Grundbegriffe des Wohnungseigentums (Livesendung der Anwaltskammer Istanbul)" } },
  { type: "webinar", format: "cevrimici", date: "2020-05-15", start: "21:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Tuğçe Özsürücü (moderatör)"], roles: ["konusmaci"], areas: [SOZ],
    poster: { src: "AFIS:2020/15.05.2020 baro.jpg", crop: [0, 0.19, 1, 0.755] },
    title: { tr: "Sözleşme Yapma Teknikleri (İstanbul Barosu Canlı Yayını)", en: "Contract Drafting Techniques (Istanbul Bar Live Broadcast)", de: "Techniken der Vertragsgestaltung (Livesendung der Anwaltskammer Istanbul)" } },
  { type: "webinar", format: "cevrimici", date: "2020-06-01", endDate: "2020-06-08", org: ["Aristo Hukuk"], areas: [KAM, KAT, DEV],
    program: [
      "## 1 Haziran 2020, 17:30–19:00", "- Kamulaştırmasız El Atma Davası Esasları ve Strateji Oluşturma",
      "## 2 Haziran 2020, 19:30–21:00", "- Paylı (Müşterek) – Elbirliği (İştirak Halinde) Mülkiyet Ayrımı Esasları",
      "## 3 Haziran 2020, 19:30–21:00", "- Kat Mülkiyetinde Eklenti ve Tahsisli Alan Uygulaması",
      "## 5 Haziran 2020, 19:30–21:00", "- Kamulaştırma Davası Açmadan Önce Satın Alma Usulü Stratejileri",
      "## 8 Haziran 2020, 19:30–21:00", "- Devreli Tatil Sistemleri (Devre Mülk / Devre Tatil) Uyuşmazlıkları",
    ].join("\n"),
    title: { tr: "Aristo Hukuk Canlı Eğitim Serisi (Haziran 2020)", en: "Aristo Law Live Course Series (June 2020)", de: "Aristo-Live-Kursreihe (Juni 2020)" } },
  { type: "soylesi", format: "cevrimici", date: "2020-06-04", start: "11:00", org: ["TÜROFED — Türkiye Otelciler Federasyonu"], venue: "Zoom",
    roles: ["konuk"], speakers: ["Sururi Çorabatır (TÜROFED Başkanı)"], areas: [SOZ],
    poster: { src: "AFIS:2020/türofed video konferans.jpg", blank: [[0.33, 0.87, 0.72, 0.975]] },
    title: { tr: "TÜROFED İcra Kurulu Toplantısı", en: "TÜROFED Executive Board Meeting", de: "Sitzung des Exekutivrats von TÜROFED" } },
  { type: "soylesi", format: "cevrimici", date: "2020-06-05", start: "13:30", end: "15:30", org: ["ETİK Zoom TV Buluşmaları"], venue: "Zoom ve Facebook canlı yayın",
    roles: ["konuk"], speakers: ["Mehmet İşler (TÜROFED Başkan Yardımcısı, ETİK Başkanı; moderatör)"], areas: [SOZ],
    poster: { src: "AFIS:2020/türofed_etik...konuşma.jpg", blank: [[0.66, 0.18, 1.0, 0.225]] },
    title: { tr: "Normalleşme ve Tesislerin Açıldığı Evrede Karşılaşılabilecek Hukuksal Sorunlar", en: "Legal Issues as Hotels Reopen after the Lockdown", de: "Rechtsfragen bei der Wiedereröffnung von Hotels nach dem Lockdown" } },
  { type: "webinar", format: "cevrimici", date: "2020-12-05", start: "11:00", org: ["TBB Eğitim Merkezi"], venue: "TBB çevrimiçi eğitim programı",
    speakers: ["Av. Şadan Tutumlu (moderatör)"], areas: [KD], poster: A("2020/05 aralık 2020_tbb_ankara_online eğitim (1).jpg"),
    title: { tr: "Kentsel Dönüşümdeki Uyuşmazlıklar ve Çözüm Yolları (TBB Online Eğitim)", en: "Disputes in Urban Regeneration and How to Resolve Them (TBB Online Course)", de: "Streitigkeiten in der Stadterneuerung und Lösungswege (Online-Kurs der TBB)" } },
  { type: "webinar", format: "cevrimici", date: "2020-12-13", start: "11:00", end: "15:00", org: ["TBB Eğitim Merkezi"], venue: "TBB çevrimiçi eğitim programı",
    speakers: ["Av. Şadan Tutumlu (moderatör)"], areas: [KD, INS], poster: A("2020/13 aralık_tbb_ankara_online eğitim (2).jpg"),
    title: { tr: "Deprem: Özel Hukuka İlişkin Sorunlar (TBB Online Eğitim)", en: "Earthquakes: Private-Law Issues (TBB Online Course)", de: "Erdbeben: privatrechtliche Fragen (Online-Kurs der TBB)" } },
  { type: "webinar", format: "cevrimici", date: "2020-12-14", start: "17:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Ömeralp Pulatoğlu (moderatör)"], roles: ["konusmaci"], areas: [KD], poster: A("2020/14.12.2020_ist.baro online eğitim_1.hafta.jpg"),
    title: { tr: "20 Soruda 6306 Sayılı Kanun Çerçevesinde Kentsel Dönüşüm", en: "Urban Regeneration under Law No. 6306 in 20 Questions", de: "Stadterneuerung nach Gesetz Nr. 6306 in 20 Fragen" } },
  { type: "webinar", format: "cevrimici", date: "2020-12-21", start: "17:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Ömeralp Pulatoğlu (moderatör)"], roles: ["konusmaci"], areas: [IMAR], poster: A("2020/21.12.2020_ist. baro online eğitim_2.hafta.jpg"),
    title: { tr: "20 Soruda İmar Barışı Sonrası Yaşanan Güncel Uyuşmazlıkların Çözüm Yolları", en: "Resolving Disputes after the Zoning Amnesty in 20 Questions", de: "Streitigkeiten nach der Bau-Amnestie in 20 Fragen" } },
  { type: "webinar", format: "cevrimici", date: "2020-12-28", start: "17:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Ömeralp Pulatoğlu (moderatör)"], roles: ["konusmaci"], areas: [INS, SOZ], poster: A("2020/28.12.2020_ist. baro 3.ders_online.jpg"),
    title: { tr: "20 Soruda Arsa Payı Karşılığı İnşaat Sözleşmesinin Hazırlanmasında İzlenecek Strateji", en: "Drafting Strategy for Land-Share-for-Construction Contracts in 20 Questions", de: "Strategie beim Entwurf von Bauleistungsverträgen gegen Grundstücksanteil in 20 Fragen" } },

  /* ------------------------------------------------------------ 2021 */
  { type: "webinar", format: "cevrimici", date: "2021-01-11", start: "17:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Ömeralp Pulatoğlu (moderatör)"], roles: ["konusmaci"], areas: [KAT, TOP], poster: A("2021/11.01.2021_ist baro online eğitim_4.ders.jpg"),
    title: { tr: "20 Soruda Kat Mülkiyetinde Yönetim Planı Sorunları ve Hazırlama Teknikleri", en: "Management Plans in Condominiums: Problems and Drafting, in 20 Questions", de: "Verwaltungspläne im Wohnungseigentum: Probleme und Entwurf, in 20 Fragen" } },
  { type: "webinar", format: "cevrimici", date: "2021-01-25", start: "18:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Ömeralp Pulatoğlu (moderatör)"], roles: ["konusmaci"], areas: [DEV, TUK], poster: A("2021/25.01.2021_ist.baro online eğitim_5.ders.jpg"),
    title: { tr: "20 Soruda Devreli Tatil Sistemi Hukuku ve Uyuşmazlıkların Çözüm Yolları", en: "Timeshare Law and Resolving Timeshare Disputes in 20 Questions", de: "Timesharing-Recht und Streitlösung in 20 Fragen" } },
  { type: "webinar", format: "cevrimici", date: "2021-02-08", start: "18:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Ömeralp Pulatoğlu (moderatör)"], roles: ["konusmaci"], areas: [SOZ], poster: A("2021/08.02.2021_ist baro_online eğitim.jpg"),
    title: { tr: "20 Soruda Ceza Koşulu Türleri ve Sözleşmelerde Ceza Koşuluna Dayalı Stratejiler", en: "Penalty Clauses and Contract Strategy in 20 Questions", de: "Vertragsstrafen und Vertragsstrategie in 20 Fragen" } },
  { type: "webinar", format: "cevrimici", date: "2021-02-13", start: "13:00", end: "15:00", org: ["TBB Eğitim Merkezi"], venue: "TBB çevrimiçi eğitim programı",
    speakers: ["Av. Sezgi Cihan Ernas", "Av. Şadan Tutumlu (moderatör)"], areas: [KAM], poster: A("2021/13.02.2021_kamulaştırma_tbb eğitim_online.jpg"),
    title: { tr: "Kamulaştırmasız El Atma (TBB Online Eğitim)", en: "De Facto Expropriation (TBB Online Course)", de: "Faktische Enteignung (Online-Kurs der TBB)" } },
  { type: "webinar", format: "cevrimici", date: "2021-02-15", start: "18:00", org: [IST], venue: "İstanbul Barosu canlı yayın",
    speakers: ["Av. Ömeralp Pulatoğlu (moderatör)"], roles: ["konusmaci"], areas: [KD], poster: A("2021/15.02.2021_ist baro_online eğitim.jpg"),
    title: { tr: "20 Soruda Hatalı Tabirle Kullanılan Tapu İptal Davaları", en: "Actions Wrongly Called 'Land Registry Cancellation' in 20 Questions", de: "Fälschlich so genannte Grundbuchlöschungsklagen in 20 Fragen" } },
  { type: "webinar", format: "cevrimici", date: "2021-02-17", start: "15:00", org: ["Tekirdağ Barosu", HE], areas: [INS],
    poster: A("2021/17.02.2021_tekirdağ barosu_online eğitim.jpg"),
    title: { tr: "Arsa Payı Karşılığı İnşaat Sözleşmeleri Uyuşmazlıkları (Tekirdağ Barosu Online Eğitim)", en: "Disputes over Land-Share-for-Construction Contracts (Tekirdağ Bar Online Course)", de: "Streitigkeiten aus Bauleistungsverträgen gegen Grundstücksanteil (Online-Kurs der Anwaltskammer Tekirdağ)" } },
  { type: "webinar", format: "cevrimici", date: "2021-02-24", start: "20:00", org: ["Diyarbakır Barosu"], venue: "Diyarbakır Barosu canlı yayın",
    speakers: ["Doç. Dr. Gülşah Vardar Hamamcıoğlu", "Av. Mehmet Erdem (moderatör)"], areas: [IPO],
    poster: A("2021/diyarbakır baro_24.02.2021_taşınmaz rehni ve ipotek_meslek içi eğitim.jpg"),
    title: { tr: "Taşınmaz Rehni ve İpotek (Diyarbakır Barosu Meslek İçi Eğitim)", en: "Real Property Pledges and Mortgages (Diyarbakır Bar Training)", de: "Grundpfandrechte und Hypotheken (Fortbildung der Anwaltskammer Diyarbakır)" } },
  { type: "seminer", format: "cevrimici", date: "2021-03-23", start: "16:40", end: "18:30", org: ["Özyeğin Üniversitesi — Sectoral Orienteering (SO 20-21 Spring)"],
    roles: ["konusmaci"], areas: [SOZ], poster: A("2021/online eğitim_Prof  Dr  Etem Saba Özmen- 23 Mart 2021.jpg"),
    title: { tr: "Sözleşmelerde Borca Aykırılık Hallerinin Sınıflandırılması (Özyeğin Üniversitesi)", en: "Classifying Breaches of Contract (Özyeğin University)", de: "Klassifizierung von Vertragsverletzungen (Özyeğin-Universität)" } },
  { type: "konferans", format: "cevrimici", date: "2021-10-30", org: [HE], roles: ["konusmaci"],
    speakers: ["Doç. Dr. Mehmet Şengül", "Doç. Dr. Ali Hulki Cihan", "Dr. Öğr. Üyesi Mete Tevetoğlu", "Dr. Öğr. Üyesi Ahmet Ayar"],
    areas: [KAT], poster: A("2021/30.10.2021_Kat Mülkiyeti Zirvesi_Online_hukuk eğitim.jpg"),
    title: { tr: "Kat Mülkiyeti Hukuku Zirvesi (Hukukeğitim)", en: "Condominium Law Summit (Hukukeğitim)", de: "Gipfel zum Wohnungseigentumsrecht (Hukukeğitim)" } },
  { type: "seminer", date: "2021-11-27", start: "10:30", city: "Mersin", org: [TBB, "Mersin Barosu"],
    venue: "Mersin Barosu Hizmet Birimi, Gökdelen 16. Kat", speakers: ["Av. Ali Rıza İlgezdi", "Av. Şadan Tutumlu (moderatör)"], areas: [KAM],
    poster: { src: "AFIS:2021/mersin barosu seminer_27.11.2021.jpg", crop: [0, 0.114, 1, 0.896] },
    title: { tr: "Kamulaştırma Hukuku — Meslek İçi Eğitim Semineri (Mersin Barosu)", en: "Expropriation Law — Professional Training Seminar (Mersin Bar)", de: "Enteignungsrecht — Fortbildungsseminar (Anwaltskammer Mersin)" } },
  { type: "soylesi", format: "cevrimici", date: "2021-12-12", start: "13:30", org: ["Siyaset Üstü Düşünce Derneği"], venue: "Zoom",
    roles: ["konusmaci"], speakers: ["Hüseyin Avni Yardımcı (moderatör)"], areas: [KD],
    poster: { src: "AFIS:2021/dernek_konuşma_12.12.2021.jpeg", blank: [[0.3, 0.945, 1.0, 0.995]] },
    title: { tr: "Afet Riski Konseptinde Kentsel Yenileme ve Mülkiyet Yönetim Stratejisi (Webinar Söyleşileri-7)", en: "Urban Renewal and Property Management Strategy under Disaster Risk (Webinar Talks 7)", de: "Stadterneuerung und Eigentumsstrategie bei Katastrophenrisiko (Webinar-Gespräche 7)" } },

  /* ------------------------------------------------------------ 2022 */
  { type: "webinar", format: "cevrimici", date: "2022-01-15", endDate: "2022-03-12", start: "14:00", org: ["Ankara Barosu"], venue: "Ankara Barosu YouTube canlı yayın",
    roles: ["konusmaci"], speakers: ["Av. Dr. Mahcemal Seyhan (moderatör)"], areas: [INS, KAM, KAT, KD],
    poster: { src: "AFIS:2022/ankara barosu eğitim_ankarada_6adet paket_6 İPTAL.jpg", blank: [[0.0, 0.945, 1.0, 1.0]] },
    program: [
      "## 15 Ocak 2022, 14:00", "- Arsa Payı Karşılığı İnşaat Sözleşmesi Bazlı Sözleşmeleri Hazırlama Teknikleri",
      "## 29 Ocak 2022, 14:00", "- Taşınmaz Davaları (Şematik Anlatım) ve Eski Hukuktan Gelen Tapu Sorunları",
      "## 12 Şubat 2022, 14:00", "- Kamulaştırma Hukuku Esasları",
      "## 26 Şubat 2022, 14:00", "- Kat Mülkiyeti Hukukunun Esasları ve Güncel Sorunları",
      "## 12 Mart 2022, 14:00", "- 6306 Sayılı Kanun Çerçevesinde Kentsel Dönüşüm ve Yaşanan Uyuşmazlıklara Dayalı Çözüm Yolları",
    ].join("\n"),
    title: { tr: "Saba Özmen ile Taşınmaz Hukuku (Ankara Barosu Eğitim Serisi)", en: "Real Property Law with Saba Özmen (Ankara Bar Course Series)", de: "Immobilienrecht mit Saba Özmen (Kursreihe der Anwaltskammer Ankara)" } },
  { type: "konferans", format: "cevrimici", date: "2022-02-13", start: "13:00", end: "17:30", org: [HE, "Aristo Yayınevi"],
    speakers: ["Prof. Dr. Turgut Öz (oturum başkanı)", "Prof. Dr. Şebnem Akipek", "Prof. Dr. Sezer Çabri"],
    talks: [{ tr: "Tapu İptal Davası Tabiri Altında Yolsuz Tescilin Düzeltilmesi ile Tescili İsteme Davaları", en: "Rectification of Unlawful Entries and Actions for Registration under the Label 'Land Registry Cancellation'" }],
    areas: [KD],
    title: { tr: "Taşınmaz Hukuku Zirvesi (Hukukeğitim, 2022)", en: "Real Property Law Summit (Hukukeğitim, 2022)", de: "Gipfel zum Immobilienrecht (Hukukeğitim, 2022)" } },
  { type: "seminer", date: "2022-02-19", start: "10:30", city: "Rize", org: [TBB, "Rize Barosu"], venue: "Rize Adliyesi Konferans Salonu",
    areas: [INS, SOZ], poster: { src: "PDF:2022/tbb rize_seminer.pdf#0" },
    title: { tr: "Satış Vaadi Sözleşmesi ve Arsa Payı Karşılığı İnşaat Sözleşmesi (Rize Barosu)", en: "Promise-to-Sell and Land-Share-for-Construction Contracts (Rize Bar)", de: "Kaufversprechen und Bauleistungsvertrag gegen Grundstücksanteil (Anwaltskammer Rize)" } },
  { type: "egitim", date: "2022-03-26", endDate: "2022-03-27", city: "Düzce",
    org: ["TRKTYD — Türkiye Kentsel Tesis Yönetim Derneği", "Düzce Belediyesi", "Düzce Bahçeşehir Yönetim A.Ş."],
    areas: [TOP, KAT], poster: A("2022/düzce belediyesi_sertifika programı_eğitim.jpg"),
    title: { tr: "Bina, Site ve Tesis Yönetimi Eğitim ve Sertifika Programı (Düzce)", en: "Building, Estate and Facility Management Certificate Programme (Düzce)", de: "Zertifikatsprogramm Gebäude-, Wohnanlagen- und Facility-Management (Düzce)" } },
  { type: "webinar", format: "cevrimici", date: "2022-03-30", start: "18:00", end: "20:00", org: ["İstanbul Barosu Genç Avukatlar Merkezi"], venue: "İstanbul Barosu YouTube ve Instagram",
    roles: ["konusmaci"], speakers: ["Av. Kerem Donat (moderatör)", "Dr. Ahmet Ayar (açılış)"], areas: [KAT, INS],
    poster: A("2022/30.03.2022 istanbul barosu eğitim.jpg"),
    title: { tr: "Tamamlanmayan, Yarım Kalmış Yapıların Kat Mülkiyetine Geçiş Sorunları", en: "Converting Unfinished Buildings to Condominium Ownership", de: "Überführung unfertiger Bauten in Wohnungseigentum" } },
  { type: "sempozyum", format: "cevrimici", date: "2022-05-10", endDate: "2022-05-11", start: "14:30", end: "15:50", org: ["İstanbul Aydın Üniversitesi Hukuk Fakültesi"],
    talks: [{ tr: "Bir Asırlık Garabet: Taşınmaz Aynî Hak Sözleşmelerinde Şekil Sorunu", en: "A Century-old Anomaly: the Form of Contracts Creating Real Rights in Land" }],
    areas: [KD, SOZ], poster: { src: "PDF:2022/10.11 mayıs 2022_sempozyum_Türk Medeni Kanunu Program_ist.aydın üni..pdf#0" },
    title: { tr: "Türk Medeni Kanunu'nun Yürürlüğe Girişinin 20. Yılı Sempozyumu", en: "Symposium on the 20th Anniversary of the Turkish Civil Code in Force", de: "Symposium zum 20. Jahrestag des Inkrafttretens des Türkischen Zivilgesetzbuchs" } },
  { type: "seminer", date: "2022-06-04", start: "10:30", city: "Çorlu, Tekirdağ", org: [TBB, "Tekirdağ Barosu"], venue: "Çorlu Adliyesi Konferans Salonu",
    areas: [KAM], poster: { src: "PDF:2022/tbb_tekirdağ seminer.pdf#0" },
    title: { tr: "Kamulaştırma Hukuku — Meslek İçi Eğitim Semineri (Tekirdağ Barosu)", en: "Expropriation Law — Professional Training Seminar (Tekirdağ Bar)", de: "Enteignungsrecht — Fortbildungsseminar (Anwaltskammer Tekirdağ)" } },
  { type: "sempozyum", date: "2022-09-09", start: "13:00", city: "İstanbul", org: ["Önce İlke Çağdaş Avukatlar Grubu"], venue: "İstanbul Barosu Konferans Salonu, Beyoğlu",
    talks: [{ tr: "Notere Taşınmaz Satış Sözleşmesi Düzenleme Yetkisi Veren Noterlik Kanunu Değişikliğine İlişkin Düşünceler", en: "Thoughts on the Amendment Allowing Notaries to Execute Real Property Sales" }],
    areas: [KD, SOZ], poster: A("2022/sempozyum_saba özmen_09.09.2022.jpg"),
    title: { tr: "Av. Müşir Kaya Canpolat Anısına Türk Borçlar Kanunu'nun Onuncu Yılı Sempozyumu", en: "Symposium on the Tenth Anniversary of the Turkish Code of Obligations, in Memory of Av. Müşir Kaya Canpolat", de: "Symposium zum zehnten Jahrestag des Türkischen Obligationengesetzes zum Gedenken an Av. Müşir Kaya Canpolat" } },
  { type: "seminer", date: "2022-10-13", start: "19:00", city: "İstanbul", org: [IST, "İstanbul Barosu Staj Eğitim Merkezi (SEM)"], venue: "İstanbul Barosu Merkez Bina Konferans Salonu",
    speakers: ["Burhan Üstün (Anayasa Mahkemesi Onursal Başkan Vekili)", "Av. Ali Rıza İlgezdi", "Av. Gülderen Zerrin Kavak Yıldırım (moderatör)"],
    roles: ["konusmaci"], areas: [KAM], poster: A("2022/13 ekim 2022_ sem_seminer.jpeg"),
    title: { tr: "Anayasa Mahkemesinin Son İptal Kararları Doğrultusunda Kamulaştırmasız El Atma Davaları (SEM 26)", en: "De Facto Expropriation Actions after the Constitutional Court's Latest Annulments (SEM 26)", de: "Klagen wegen faktischer Enteignung nach den jüngsten Aufhebungen des Verfassungsgerichts (SEM 26)" } },
  { type: "kongre", format: "cevrimici", date: "2022-10-20", endDate: "2022-10-22", start: "13:30", end: "15:00", org: [HE], roles: ["konusmaci", "oturum-baskani"],
    talks: [{ tr: "Birlikte (Paylı/Elbirliği) Mülkiyette Paydaş ve Ortakların Sözleşme Tarafı Olarak Hukuki Statülerinin İrdelenmesi", en: "The Legal Status of Co-owners and Joint Owners as Parties to Contracts" }],
    areas: [SOZ, KD],
    note: { tr: "Prof. Dr. Etem Saba Özmen 21 Ekim'de 6. oturumda konuştu ve 7. oturuma (Taşınmaz Hukuku – 2) başkanlık etti.", en: "He spoke in session 6 on 21 October and chaired session 7 (Real Property Law 2).", de: "Er sprach am 21. Oktober in der 6. Sitzung und leitete die 7. Sitzung (Immobilienrecht 2)." },
    title: { tr: "III. Borçlar Hukuku Kongresi", en: "3rd Congress of the Law of Obligations", de: "3. Kongress zum Schuldrecht" } },
  { type: "sempozyum", date: "2022-11-03", endDate: "2022-11-06", start: "14:00", end: "16:00", city: "Mersin",
    org: ["Sempozyum Düzenleme Kurulu (Başkan: Prof. Dr. Çetin Arslan)"], roles: ["konusmaci", "bilim-kurulu"],
    talks: [{ tr: "7413 Sayılı Kanun ile Taşınmaz Satışına İlişkin Getirilen Değişikliklerin Medenî Kanun Hükümleri Bağlamında Değerlendirilmesi", en: "The Changes to Real Property Sales by Law No. 7413 Assessed against the Civil Code" }],
    areas: [KD, SOZ],
    note: { tr: "Sempozyumun onursal başkanları Yargıtay Başkanı ve Türkiye Noterler Birliği Başkanıydı.", en: "The honorary chairs were the President of the Court of Cassation and the President of the Union of Turkish Notaries.", de: "Ehrenvorsitzende waren der Präsident des Kassationshofs und der Präsident der Türkischen Notarkammer." },
    title: { tr: "Noterin Taşınmaz Satışından ve Diğer Noterlik İşlemlerinden Doğan Hukuki ve Cezai Sorumluluğu Sempozyumu", en: "Symposium on Notaries' Civil and Criminal Liability for Real Property Sales and Other Notarial Acts", de: "Symposium zur zivil- und strafrechtlichen Haftung von Notaren bei Immobilienverkäufen" } },
  { type: "sempozyum", date: "2022-11-04", endDate: "2022-11-05", city: "İstanbul", org: ["Marmara Üniversitesi Hukuk Fakültesi"],
    venue: "Marmara Üniversitesi Göztepe Yerleşkesi, Hukuk Fakültesi Konferans Salonu",
    talks: [{ tr: "Noterlere Verilen Taşınmaz Satış Yetkisine İlişkin Kanun Değişikliğine İlişkin Düşünceler", en: "Thoughts on the Amendment Giving Notaries Authority over Real Property Sales" }],
    areas: [KD], poster: { src: "PDF:2022/marmara üni. kutlama afişi_sempozyum_05 kasım 2022.pdf#0" },
    title: { tr: "Türk Medeni Hukuku'ndaki Güncel Gelişmeler Sempozyumu (VIII) — Marmara Üniversitesi", en: "8th Symposium on Current Developments in Turkish Civil Law — Marmara University", de: "8. Symposium zu aktuellen Entwicklungen im türkischen Zivilrecht — Marmara-Universität" } },
  { type: "kongre", format: "cevrimici", date: "2022-11-24", endDate: "2022-11-26", start: "15:00", end: "17:30", org: [HE],
    talks: [{ tr: "TKHK'nda Son Yapılan Değişiklikler Uyarınca Devreli Tatil Sistemleri", en: "Timeshare Systems under the Latest Amendments to the Consumer Protection Law" }],
    areas: [DEV, TUK],
    title: { tr: "11. Tüketici Hukuku Kongresi", en: "11th Consumer Law Congress", de: "11. Kongress zum Verbraucherrecht" } },
  { type: "kongre", format: "cevrimici", date: "2022-12-22", endDate: "2022-12-24", start: "15:30", end: "17:00", org: [HE], roles: ["konusmaci", "oturum-baskani"],
    talks: [{ tr: "Taşınmazın Bütününe İlişkin İpoteğin Bölünme ve Arazide Kat Mülkiyeti Kurulmasına İlişkin Sonuçları", en: "Consequences for a Mortgage over the Whole Parcel of Subdivision and of Creating Condominium on the Land" }],
    areas: [IPO, KAT],
    note: { tr: "Prof. Dr. Etem Saba Özmen 23 Aralık'ta Aynî Haklar oturumunda konuştu ve Kat Mülkiyeti Hukuku oturumuna başkanlık etti.", en: "On 23 December he spoke in the real-rights session and chaired the condominium-law session.", de: "Am 23. Dezember sprach er in der Sitzung zu dinglichen Rechten und leitete die Sitzung zum Wohnungseigentum." },
    title: { tr: "III. Medeni Hukuk Kongresi", en: "3rd Civil Law Congress", de: "3. Kongress zum Zivilrecht" } },

  /* ------------------------------------------------------------ 2023 */
  { type: "webinar", format: "cevrimici", date: "2023-01-25", start: "19:00", org: [HE], areas: [SOZ], poster: A("2023/25.01.2023_19.00_hukuk eğitim_online.jpg"),
    title: { tr: "Sözleşmelere Ceza Koşulu Hükümlerinin Konulmasına İlişkin Stratejiler", en: "Strategies for Including Penalty Clauses in Contracts", de: "Strategien für Vertragsstrafenklauseln" } },
  { type: "webinar", format: "cevrimici", date: "2023-02-01", start: "19:00", org: [HE], areas: [INS], poster: A("2023/01.02.2023_19.00_hukuk eğitim_online.jpg"),
    title: { tr: "Arsa Payı Karşılığı İnşaat Sözleşmelerinde Yüklenicinin Temerrüdüne Karşı Arsa Sahibinin Stratejileri", en: "The Landowner's Options against a Contractor in Default under Land-Share-for-Construction Contracts", de: "Handlungsoptionen des Eigentümers bei Verzug des Bauunternehmers" } },
  { type: "seminer", date: "2023-03-18", start: "09:30", city: "İzmir", org: [TBB, "İzmir Barosu"], venue: "İzmir Barosu Konferans Salonu, Bitişik Barohan 6. Kat",
    speakers: ["Av. Elçin Kılınçer Ot (moderatör)"], areas: [KAM], poster: A("2023/izmir_tbb_eğitim_18.03.2023.jpg"),
    title: { tr: "Kamulaştırma Hukuku — Meslek İçi Eğitim Semineri (İzmir Barosu, 2023)", en: "Expropriation Law — Professional Training Seminar (İzmir Bar, 2023)", de: "Enteignungsrecht — Fortbildungsseminar (Anwaltskammer İzmir, 2023)" } },
  { type: "webinar", format: "cevrimici", date: "2023-04-25", start: "19:00", end: "20:30", org: [HE], areas: [KD, INS],
    note: { tr: "Eğitim ücretsizdi.", en: "The course was free of charge.", de: "Der Kurs war kostenlos." },
    title: { tr: "Güncel Deprem Hukuku Sorunları", en: "Current Issues in Earthquake Law", de: "Aktuelle Fragen des Erdbebenrechts" } },
  { type: "konferans", date: "2023-05-12", start: "13:30", city: "İzmir", org: ["İzmir Barosu"], venue: "İzmir Barosu Konferans Salonu, Barohan 6. Kat, Alsancak",
    roles: ["konusmaci"], areas: [KAT], poster: A("2023/12.05.2023_İZMİR BARO EĞİTİM.jpg"),
    title: { tr: "Kat Mülkiyeti Hukuku'ndan Doğan Uyuşmazlıklar (İzmir Barosu)", en: "Disputes under Condominium Law (İzmir Bar)", de: "Streitigkeiten aus dem Wohnungseigentumsrecht (Anwaltskammer İzmir)" } },
  { type: "panel", date: "2023-06-06", start: "13:30", end: "15:30", city: "Kocaeli", org: ["Kocaeli Üniversitesi"], venue: "Kocaeli Kongre Merkezi (Seka Park)",
    roles: ["konusmaci"], speakers: ["Prof. Dr. Bayram Keskin (moderatör)", "Prof. Dr. Gürsel Üngören", "Dr. Öğr. Üyesi Faruk Y. Turinay"], areas: [KD, INS],
    poster: A("2023/kocaeli panel_ 06.06.2023.jpeg"),
    title: { tr: "Depremin Hukuki Boyutu — 120. Günde Sesimizi Duyan Var mı? Kocaeli'den Depremlere Bakış", en: "The Legal Dimension of the Earthquake — Kocaeli Looks Back, 120 Days On", de: "Die rechtliche Dimension des Erdbebens — Kocaeli, 120 Tage danach" } },
  { type: "tv", date: "2023-07-01", start: "14:10", org: ["TGRT Haber"], venue: "TGRT Haber", roles: ["konuk"],
    speakers: ["Suat Sandalcı (Türkiye Kentsel Tesis Yönetim Derneği Genel Başkanı)", "Yaprak Hırka Yıldız (sunucu)"], areas: [KAT, TOP],
    poster: { src: "AFIS:2023/tgrt canlı _01 temmuz 2023.png", crop: [0, 0.265, 1, 0.715] },
    title: { tr: "TGRT Haber: Site Aidatlarına Fahiş Zamlar Nasıl Önlenecek?", en: "TGRT Haber: How Can Excessive Service-Charge Increases Be Prevented?", de: "TGRT Haber: Wie lassen sich überhöhte Hausgelderhöhungen verhindern?" } },
  { type: "kongre", format: "cevrimici", date: "2023-10-19", endDate: "2023-10-21", start: "16:30", end: "18:00", org: [HE],
    talks: [{ tr: "Arsa Payı Karşılığı İnşaat Sözleşmesinden Doğan Yüklenicinin Alacak Hakkının Devrine İlişkin Hüküm ve Sonuçlar", en: "Assignment of the Contractor's Claim under a Land-Share-for-Construction Contract" }],
    areas: [INS, SOZ],
    title: { tr: "IV. Borçlar Hukuku Kongresi", en: "4th Congress of the Law of Obligations", de: "4. Kongress zum Schuldrecht" } },
  { type: "egitim", date: "2023-12-20", start: "13:30", end: "15:30", city: "Gaziantep", venue: "Shimall Otel",
    talks: [{ tr: "Kamulaştırma", en: "Expropriation" }, { tr: "Mültecilerin Taşınmaz Edinimi", en: "Acquisition of Real Property by Refugees" }],
    speakers: ["Prof. Dr. Melek Bilgin Yüce (Maltepe Üniversitesi)"], areas: [KAM, YAB],
    note: { tr: "Eğitim, deprem bölgesinde çalışan sivil toplum kuruluşlarının ve uluslararası kurumların avukatlarına yönelikti.", en: "The course was for lawyers of NGOs and international organisations working in the earthquake region.", de: "Der Kurs richtete sich an Anwälte von NGOs und internationalen Organisationen im Erdbebengebiet." },
    title: { tr: "Kira Hukuku ve Deprem Sonrası Ortaya Çıkan Hukuki Sorunlar Eğitimi (Gaziantep)", en: "Course on Tenancy Law and Legal Issues after the Earthquake (Gaziantep)", de: "Kurs zu Mietrecht und Rechtsfragen nach dem Erdbeben (Gaziantep)" } },
  { type: "kongre", format: "cevrimici", date: "2023-12-21", endDate: "2023-12-23", start: "16:30", end: "18:30", org: [HE, "Tüketici Hukuku Enstitüsü"],
    talks: [{ tr: "Elbirliği Ortaklığında Sermaye Olarak Taşınmaz Konmasına İlişkin Hüküm ve Sonuçlar", en: "Contributing Real Property as Capital to a Joint Ownership" }],
    areas: [KD, MIRAS],
    title: { tr: "IV. Medeni Hukuk Kongresi", en: "4th Civil Law Congress", de: "4. Kongress zum Zivilrecht" } },

  /* ------------------------------------------------------------ 2024 */
  { type: "konferans", date: "2024-02-09", start: "18:00", city: "İzmir", org: ["İzmir Barosu"], venue: "İzmir Barosu Konferans Salonu, Barohan, Alsancak",
    roles: ["konusmaci"], areas: [KD],
    poster: { src: "AFIS:2024/2024_ 19 adet eğitim kontrol ettim/09.02.2024 izmir baro konferans.png", crop: [0, 0.26, 1, 0.735] },
    title: { tr: "Tapu İptal Tabiri Altında Farklılaşan Dava Türleri ve Usul Hukukuna İlişkin Sonuçları (İzmir Barosu)", en: "Actions Grouped as 'Land Registry Cancellation' and their Procedural Consequences (İzmir Bar)", de: "Die unter 'Grundbuchlöschung' zusammengefassten Klagen und ihre Verfahrensfolgen (Anwaltskammer İzmir)" } },
  { type: "panel", date: "2024-02-22", start: "14:00", city: "İstanbul", org: ["Kadir Has Üniversitesi Hukuk Fakültesi"], venue: "Kadir Has Üniversitesi, D Büyük Salon",
    speakers: ["Prof. Dr. Başak Baysal (oturum başkanı)", "Prof. Dr. Suat Sarı", "Doç. Dr. Ahmet Ayar"],
    talks: [{ tr: "Kat Mülkiyeti Kanunu Değişiklikleri Çerçevesinde İçtihat Değişikliği İhtiyacı", en: "Why the Condominium Law Amendments Call for a Change in Case Law" }],
    areas: [KAT], poster: A("2024/2024_ 19 adet eğitim kontrol ettim/22.02.2024_kadir has_panel.jpg"),
    title: { tr: "Prof. Dr. Mustafa Dural'ı Anma Paneli: Özel Hukukta Güncel Gelişmeler VIII — Kat Mülkiyeti Hukuku", en: "Panel in Memory of Prof. Dr. Mustafa Dural: Current Developments in Private Law VIII — Condominium Law", de: "Gedenkpodium für Prof. Dr. Mustafa Dural: Aktuelle Entwicklungen im Privatrecht VIII — Wohnungseigentum" } },
  { type: "sempozyum", date: "2024-04-20", start: "11:30", end: "12:30", city: "Kocaeli",
    org: ["Kocaeli Barosu", "Kocaeli Üniversitesi Hukuk Fakültesi", "Özyeğin Üniversitesi Hukuk Fakültesi", "İstanbul Medeniyet Üniversitesi Hukuk Fakültesi"],
    venue: "Kocaeli Ticaret Odası Konferans Salonu",
    talks: [{ tr: "Medeni Kanun Hükümlerine Aykırılığı Bir Asırdır Giderilemeyen Taşınmaz Hukuku Uygulama Hataları", en: "Real Property Practice that Has Contradicted the Civil Code for a Century" }],
    areas: [KD], poster: A("2024/2024_ 19 adet eğitim kontrol ettim/20.04.2024_KOCAELİ BAROSU_SEMPOZYUM.jpg"),
    title: { tr: "Cumhuriyetle Bir Asır: Reformlardan Medeni Hukuk Sempozyumu", en: "A Century of the Republic: Symposium on Civil Law after the Reforms", de: "Ein Jahrhundert Republik: Symposium zum Zivilrecht nach den Reformen" } },
  { type: "seminer", date: "2024-04-26", start: "10:00", end: "16:30", city: "İzmir", org: ["İZGADER — İzmir Gayrimenkul Hukuku Derneği"], venue: "İzmir Kültürpark Gençlik Tiyatrosu",
    roles: ["konusmaci"], areas: [KD],
    poster: { src: "AFIS:2024/2024_ 19 adet eğitim kontrol ettim/26.04.2024_izmir eğitim.jpg", crop: [0.05, 0.12, 0.96, 0.83], blank: [[0.09, 0.745, 0.78, 0.805]] },
    title: { tr: "Taşınmaz Davaları Şematik Anlatım (İZGADER)", en: "Real Property Litigation: a Schematic Overview (İZGADER)", de: "Immobilienprozesse im Überblick (İZGADER)" } },
  { type: "webinar", format: "cevrimici", date: "2024-05-22", start: "19:00", org: [HE, "AristoOFFICE"], areas: [SOZ],
    poster: A("2024/2024_ 19 adet eğitim kontrol ettim/22 mayıs 2024_ aristo eğitim.png"),
    note: { tr: "Eğitim ücretsizdi.", en: "The course was free of charge.", de: "Der Kurs war kostenlos." },
    title: { tr: "Alacağın Devrine Dayalı Kavram Kargaşaları ve Noter İşlemlerine Konu Olması", en: "Conceptual Confusion around Assignment of Claims and Notarial Practice", de: "Begriffsverwirrung bei der Forderungsabtretung und notarielle Praxis" } },
  { type: "konferans", date: "2024-09-06", start: "18:00", city: "İzmir", org: ["İzmir Barosu"], venue: "İzmir Barosu Konferans Salonu, Barohan, Alsancak",
    roles: ["konusmaci"], areas: [INS, SOZ],
    poster: { src: "AFIS:2024/2024_ 19 adet eğitim kontrol ettim/06.09.2024_izmir eğitim 1.png", crop: [0, 0.26, 1, 0.735] },
    title: { tr: "Arsa Payı Karşılığı İnşaat Sözleşmesi Bazlı Sözleşme Yapma Teknikleri (İzmir Barosu)", en: "Drafting Land-Share-for-Construction Contracts (İzmir Bar)", de: "Anwaltskammer İzmir: Gestaltung von Bauleistungsverträgen gegen Grundstücksanteil" } },
  { type: "seminer", date: "2024-09-07", start: "10:00", end: "16:00", city: "İzmir", org: ["İZGADER — İzmir Gayrimenkul Hukuku Derneği"],
    venue: "Konak Belediyesi Türkan Saylan Kültür Merkezi", address: "Kıbrıs Şehitler Caddesi No: 12 K. 5, Alsancak / İzmir",
    roles: ["konusmaci"], speakers: ["Av. Hakan Dimdik (yönlendirici)"], areas: [KAM],
    poster: { src: "AFIS:2024/2024_ 19 adet eğitim kontrol ettim/07.09.2024_izmir eğitim 2.png", crop: [0, 0.26, 1, 0.735], blank: [[0.47, 0.6, 0.9, 0.68]] },
    title: { tr: "Kamulaştırma Hukukunun Esasları (İZGADER)", en: "Principles of Expropriation Law (İZGADER)", de: "Grundsätze des Enteignungsrechts (İZGADER)" } },
  { type: "seminer", date: "2024-10-09", start: "17:00", city: "İstanbul", org: [IST, "İstanbul Barosu Staj Eğitim Merkezi (SEM)"], venue: "İstanbul Barosu Merkez Bina Konferans Salonu",
    roles: ["konusmaci"], speakers: ["Av. Ali Rıza İlgezdi (moderatör)", "Av. Filiz Saraç (açılış)"], areas: [KD],
    poster: A("2024/2024_ 19 adet eğitim kontrol ettim/istanbul barosu 09 ekim 2024 seminer.jpg"),
    title: { tr: "Uygulamada Yanlış Tabir ile Tapu İptal Davası Başlığı Altında Farklılaşan Dava Türleri (SEM 48)", en: "The Different Actions Wrongly Called 'Land Registry Cancellation' (SEM 48)", de: "Die fälschlich als 'Grundbuchlöschung' bezeichneten Klagen (SEM 48)" } },
  { type: "kongre", format: "cevrimici", date: "2024-11-21", endDate: "2024-11-23", start: "11:00", end: "12:00", org: [HE],
    talks: [{ tr: "Devre Mülk Hakkının Kullanımının Devrinin 7464 Sayılı Kanuna Tabi Olması ve Emlak Vergisi Muafiyetini Kaldırmasına Dayalı Garabet Sonuçlar", en: "Anomalous Results of Subjecting Timeshare Use Transfers to Law No. 7464 and Removing the Property-Tax Exemption" }],
    areas: [DEV, TUK],
    title: { tr: "12. Tüketici Hukuku Kongresi", en: "12th Consumer Law Congress", de: "12. Kongress zum Verbraucherrecht" } },

  /* ------------------------------------------------------------ 2025 */
  { type: "kongre", format: "cevrimici", date: "2025-02-20", endDate: "2025-02-22", start: "18:00", end: "19:15", org: [HE],
    talks: [{ tr: "Kambiyo Taahhütlerinin İfaya Yönelik ve İfa Yerini Tutan Edim İlişkisine Bağlı Sonuçları", en: "Consequences of Bills of Exchange Given for or in Lieu of Performance" }],
    areas: [TIC, ICRA],
    title: { tr: "V. Ticaret Hukuku Kongresi", en: "5th Commercial Law Congress", de: "5. Kongress zum Handelsrecht" } },
  { type: "seminer", date: "2025-02-26", start: "13:30", end: "14:00", city: "İstanbul", org: ["Marmara Belediyeler Birliği Hukuk Platformu"],
    venue: "Bakırköy Belediye Başkanlığı Konferans ve Eğitim Salonu",
    talks: [{ tr: "Kamulaştırma Hukuku — Kamulaştırmasız El Atma", en: "Expropriation Law — De Facto Expropriation" }], areas: [KAM],
    title: { tr: "Marmara Belediyeler Birliği Hukuk Platformu Seminer ve İstişare Toplantısı", en: "Marmara Municipalities Union Legal Platform: Seminar and Consultation Meeting", de: "Rechtsplattform des Marmara-Städtebunds: Seminar und Beratungstreffen" } },
  { type: "seminer", date: "2025-05-17", start: "10:30", end: "12:00", city: "İstanbul", org: ["Fenerbahçe Spor Kulübü"],
    venue: "Fenerbahçe Şükrü Saracoğlu Stadı, Maraton Tribünü 2. Kat VIP Salon", roles: ["konusmaci"],
    speakers: ["Av. Ali Rıza İlgezdi", "Av. Mustafa Berkay İnce (moderatör)"], areas: [KD], poster: A("2025/mayıs 2025/17.05.2025_FB Seminer.jpg"),
    title: { tr: "Deprem ve Kentsel Dönüşümde Hukuki Sorunlar Semineri (Fenerbahçe)", en: "Seminar on Legal Issues in Earthquakes and Urban Regeneration (Fenerbahçe)", de: "Seminar zu Rechtsfragen bei Erdbeben und Stadterneuerung (Fenerbahçe)" } },
  { type: "konferans", date: "2025-10-18", start: "11:00", end: "13:00", city: "İstanbul", org: ["GHD — Gayrimenkul Hukuku Derneği"], venue: "Caddebostan Kültür Merkezi, A Salonu",
    roles: ["konusmaci"], speakers: ["Prof. Dr. Emrehan İnal", "Av. Elif Coşkun", "Av. Azize Şencan (moderatör)"], areas: [INS, TUK],
    poster: A("2025/ekim 2025/18.10.2025_ckm_konferans_apkis.jpeg"),
    note: { tr: "Katılım ücretsizdi.", en: "Attendance was free.", de: "Die Teilnahme war kostenlos." },
    title: { tr: "Yargıtay Son İBK Işığında APKİS'ler: Arsa Sahipleri ve Tüketici Hakları", en: "Land-Share Contracts after the Latest Unifying Decision: Landowners and Consumer Rights", de: "Bauleistungsverträge nach der jüngsten Vereinheitlichungsentscheidung: Eigentümer und Verbraucherrechte" } },
  { slug: "kentsel-donusum-uygulamalari-egitimi-istanbul-barosu-kasim-2025", type: "egitim", date: "2025-11-08", endDate: "2025-11-09", start: "11:00", end: "13:00", city: "İstanbul", org: ["İstanbul Barosu Çevre Kent ve İmar Hukuku Komisyonu"],
    venue: "İstanbul Barosu Konferans Salonu", address: "Orhan Adli Apaydın Sokak, Beyoğlu / İstanbul", roles: ["konusmaci"],
    speakers: ["Av. Ayça Yakupoğlu (kolaylaştırıcı)"], areas: [KD],
    talks: [{ tr: "Kentsel Dönüşümde Birlikte Mülkiyette Yeniden Değerlendirme Kararlarının Sonuçlandırılamamasından Kaynaklanan Uyuşmazlıklar", en: "Disputes when Co-owners' Revaluation Decisions in Urban Regeneration Cannot Be Concluded" }],
    poster: { src: "DOCX:2025/kasım 2025/09.11.2025 eğitim_kentsel dönüşüm_ist.baro.docx", crop: [0.06, 0.11, 0.95, 0.885], blank: [[0.54, 0.745, 0.86, 0.79]] },
    title: { tr: "Kentsel Dönüşüm Uygulamaları Eğitimi, Kasım 2025 (İstanbul Barosu)", en: "Urban Regeneration in Practice, November 2025 (Istanbul Bar)", de: "Stadterneuerung in der Praxis, November 2025 (Anwaltskammer Istanbul)" } },
  { type: "konferans", date: "2025-11-13", endDate: "2025-11-14", start: "10:30", end: "12:30", city: "Ankara",
    org: ["Ankara Barosu Mülkiyet Hukuku Kurulu", "Ankara Barosu İş ve Sosyal Güvenlik Hukuku Kurulu"], venue: "ABEM Av. Rahmi Mağat Konferans Salonu",
    roles: ["konusmaci"], speakers: ["Av. Serhat Menzilcioğlu (moderatör)", "Gülsüm Kütahya", "Nur Hilal Mermer"], areas: [KAM],
    talks: [{ tr: "Kamulaştırma ve Kamulaştırmasız El Atma Davalarından Kaynaklı Alacaklarda Munzam Zarar", en: "Additional Damages on Claims from Expropriation and De Facto Expropriation Actions" }],
    poster: { src: "PDF:2025/kasım 2025/14 Kasım 2025 ankara baro.pdf#0", crop: [0.11, 0.1, 0.88, 0.99] },
    note: { tr: "Konferans yalnızca yargı mensupları ve hukuk fakültesi öğretim üyelerinin katılımına açıktı.", en: "The conference was open only to members of the judiciary and law faculty.", de: "Die Konferenz stand nur Richtern und Hochschullehrern offen." },
    title: { tr: "Anayasa Mahkemesi Kararları Işığında Munzam Zarar Sorunu ve Yargısal Çözüm Önerileri Konferansı", en: "Conference on Additional Damages in the Light of Constitutional Court Decisions", de: "Konferenz zum weitergehenden Verzugsschaden im Licht der Verfassungsgerichtsrechtsprechung" } },
  { type: "kongre", format: "cevrimici", date: "2025-11-22", start: "14:30", end: "16:00", org: [HE, "Tüketici Hukuku Enstitüsü"],
    talks: [{ tr: "Devreli Tatil Sistemlerine İlişkin TKHK'da Yeni Düzenleme İhtiyacı Doğuran Sebepler", en: "Why Timeshare Systems Need New Rules in the Consumer Protection Law" }],
    areas: [DEV, TUK],
    title: { tr: "Tüketici Hukuku Kongresi (Kasım 2025)", en: "Consumer Law Congress (November 2025)", de: "Kongress zum Verbraucherrecht (November 2025)" } },
  { type: "sempozyum", date: "2025-12-19", start: "09:15", end: "10:30", city: "İstanbul", org: ["İstanbul 29 Mayıs Üniversitesi Hukuk Fakültesi"], venue: "AE115",
    roles: ["oturum-baskani"], areas: [AILE, MIRAS], team: ["turkan-aktas"],
    speakers: ["Dr. Öğr. Üyesi Cemile Turgut", "Av. Türkan Aktaş Güner"],
    note: {
      tr: "Prof. Dr. Etem Saba Özmen'in başkanlık ettiği 1. oturumda (09:15–10:30) Dr. Öğr. Üyesi Cemile Turgut ve ekibimizden Av. Türkan Aktaş Güner \"Mal Ortaklığı Rejiminin Seçilmesinin Taşınmaz Hukukuna İlişkin Sonuçları\" başlıklı ortak bildiriyi sundu.",
      en: "In session 1 (09:15–10:30), chaired by Prof. Dr. Etem Saba Özmen, Dr. Cemile Turgut and our colleague Av. Türkan Aktaş Güner presented a joint paper on the consequences for real property law of choosing the community-of-property regime.",
      de: "In der von Prof. Dr. Etem Saba Özmen geleiteten 1. Sitzung (09:15–10:30) stellten Dr. Cemile Turgut und unsere Kollegin Av. Türkan Aktaş Güner einen gemeinsamen Beitrag über die Folgen der Wahl der Gütergemeinschaft für das Immobilienrecht vor.",
    },
    poster: A("2025/aralık 2025/19.12.2025/aile_hukuku_gundemleri_sempozyumu_i_-_19_aralik_2025_copy.jpg"),
    title: { tr: "Aile Hukuku Gündemleri Sempozyumu I (İstanbul 29 Mayıs Üniversitesi)", en: "Family Law Agenda Symposium I (Istanbul 29 Mayıs University)", de: "Symposium Familienrecht aktuell I (Istanbul-29-Mayıs-Universität)" } },

  /* ------------------------------------------------------------ 2026 */
  { type: "webinar", format: "cevrimici", date: "2026-01-06", start: "20:00", end: "22:00", org: ["SİYÖMDER — Site Yöneticileri ve Müdürleri Yardımlaşma ve Dayanışma Derneği"], venue: "Zoom",
    roles: ["konusmaci"], areas: [KAT, TOP],
    poster: { src: "AFIS:2026/06.01.2026 ZOOM EĞİTİM_Siyomder.jpg", blank: [[0.0, 0.415, 0.7, 0.48]] },
    title: { tr: "Kat Malikleri Kurulu Gündeminde İşletme Projesi Kavramı ve Aidata Etkileri (SİYÖMDER)", en: "The Operating Budget on the Owners' Assembly Agenda and its Effect on Service Charges (SİYÖMDER)", de: "Wirtschaftsplan auf der Eigentümerversammlung und Folgen für das Hausgeld (SİYÖMDER)" } },
  { type: "sempozyum", date: "2026-03-26", endDate: "2026-03-27", start: "10:45", end: "12:00", city: "Tokat", org: ["Tokat Gaziosmanpaşa Üniversitesi"],
    venue: "Tokat Gaziosmanpaşa Üniversitesi 15 Temmuz Kongre ve Kültür Merkezi", roles: ["konusmaci", "oturum-baskani"],
    talks: [{ tr: "Hatalı Tapu İptal Tabiri Altında Farklılaşan Dava Türlerine Bağlı Hüküm ve Sonuçlar", en: "Actions Wrongly Grouped as 'Land Registry Cancellation': Rules and Consequences" }],
    areas: [KD], poster: { src: "PDF:2026/26.03.26_tokat sempozyum.pdf#0" },
    note: { tr: "Prof. Dr. Etem Saba Özmen 26 Mart'ta I. oturumda konuştu, III. oturuma başkanlık etti; bildiri özeti sempozyumun Özet Bildiri Kitabı'nda yer aldı.", en: "On 26 March he spoke in session I and chaired session III; his abstract appears in the symposium's book of abstracts.", de: "Am 26. März sprach er in Sitzung I und leitete Sitzung III; seine Kurzfassung erschien im Abstractband des Symposiums." },
    title: { tr: "Türk Medenî Kanunu'nun Kabulünün Yüzüncü Yılı Sempozyumu (Tokat)", en: "Symposium on the Centenary of the Adoption of the Turkish Civil Code (Tokat)", de: "Symposium zum 100. Jahrestag der Annahme des Türkischen Zivilgesetzbuchs (Tokat)" } },
  { type: "seminer", date: "2026-03-28", start: "13:00", city: "İzmir", org: [TBB, "İzmir Barosu"], venue: "Barohan Av. Nevzat Erdemir Salonu",
    speakers: ["Av. Emre Öktem (İzmir Barosu Başkan Yardımcısı; moderatör)"], areas: [KAM],
    poster: { src: "AFIS:2026/28.03.2026_izmir eğitim.png", crop: [0, 0.155, 1, 0.785] },
    title: { tr: "Kamulaştırma Hukuku ve Kamulaştırmasız El Atma Esasları — Meslek İçi Eğitim (İzmir Barosu, 2026)", en: "Expropriation and De Facto Expropriation — Professional Training (İzmir Bar, 2026)", de: "Enteignung und faktische Enteignung — Fortbildung (Anwaltskammer İzmir, 2026)" } },
];

/* Changes to events already on the site, from better sources in the archive. */
const UPDATES = {
  "online-zirve-hukuk-semineri-kentsel-donusumde-kat-mulkiyeti": {
    date: "2026-05-15", published: true,
    poster: { src: "AFIS:2026/15.05.2026 zoom.jpg", crop: [0, 0, 1, 0.925] },
  },
  /* The firm confirmed the archive poster's date (7 Nisan 2026, 20:30). */
  "payli-mulkiyette-yasal-onalim-hakkinin-kullanilmasi-2026": { date: "2026-04-07", startTime: "20:30" },
  "sorumluluk-hukuku-sempozyumu-istanbul-gedik-universitesi-2025": {
    poster: { src: "AFIS:2025/mart 2025/21 mart 2025_gedik üniversitesi.jpg" },
  },
};

const ARCHIVE = L.map(build);

/* Added after the first import: re-apply to the already imported record. */
["aile-hukuku-gundemleri-sempozyumu-i-istanbul-29-mayis-2025"].forEach((slug) => {
  const e = ARCHIVE.find((x) => x.slug === slug);
  UPDATES[slug] = { teamSlugs: e.teamSlugs, speakers: e.speakers, body: e.body };
});
module.exports = { ARCHIVE, UPDATES };

/* node ref/events_archive.js  — adds the archive events to events.json and
   applies UPDATES. Events already in the file (by slug) are left alone, so
   edits made in the admin panel survive a re-run. Run
   `python ref/make_event_posters.py --archive <folder>` first.            */
if (require.main === module) {
  const fs = require("fs"), path = require("path");
  const file = path.join(__dirname, "..", "site", "content", "events.json");
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  const bySlug = new Map(doc.events.map((e) => [e.slug, e]));
  const posters = JSON.parse(fs.readFileSync(path.join(__dirname, "event_posters.json"), "utf8"));
  let order = Math.max(0, ...doc.events.map((e) => e.order || 0)), added = 0, updated = 0;
  ARCHIVE.forEach((e) => {
    if (bySlug.has(e.slug)) return;
    const rec = Object.assign({}, e, { order: ++order });
    delete rec.src; delete rec.crop; delete rec.blank;
    const p = posters[e.slug];
    if (p) { rec.poster = p.path; rec.posterW = p.w; rec.posterH = p.h; }
    bySlug.set(e.slug, rec);
    added++;
  });
  for (const [slug, u] of Object.entries(UPDATES)) {
    const rec = bySlug.get(slug);
    if (!rec) continue;
    Object.keys(u).forEach((k) => { if (k !== "poster") rec[k] = u[k]; });
    const p = posters[slug];
    if (u.poster && p) { rec.poster = p.path; rec.posterW = p.w; rec.posterH = p.h; }
    updated++;
  }
  const all = [...bySlug.values()].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  fs.writeFileSync(file, JSON.stringify({ events: all }, null, 1) + "\n", "utf8");
  console.log("events.json: %d total, %d added, %d updated", all.length, added, updated);
}
