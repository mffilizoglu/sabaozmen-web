"use strict";

/* ============================================================================
   Saba Özmen Avukatlık Ortaklığı — site content
   ----------------------------------------------------------------------------
   TERMINOLOGY NOTE (v4 analysis §3.8)
   The firm chose the regulation-safe wording. "Uzmanlık Alanlarımız" is now
   "Çalışma Alanlarımız", the "Uzmana Danış" button is now "Bize Ulaşın", and the
   "Yasal Güvenceniz" heading is replaced by a descriptive one. All three are
   single variables here, so the wording can be reverted in one place.
   ============================================================================ */

const LANGS = ["tr", "en", "de"];

const firm = {
  name: {
    tr: "Saba Özmen Avukatlık Ortaklığı",
    // Registered-title translation, made consistent across the site (v4 §3.2 / evidence #25)
    en: "Saba Özmen Attorney Partnership",
    de: "Saba Özmen Rechtsanwaltspartnerschaft",
  },
  short: "Saba Özmen",
  founded: 2004,
  bar: {
    tr: "İstanbul Barosu",
    en: "Istanbul Bar Association",
    de: "Anwaltskammer Istanbul",
  },
  address: {
    street: "Erenköy Mah. Ethemefendi Cad. Anzaf Rezidans No: 101 D: 1",
    district: "Kadıköy / İstanbul",
    country: { tr: "Türkiye", en: "Türkiye", de: "Türkei" },
  },
  phones: ["+90 (216) 469 45 23", "+90 (216) 469 45 25"],
  emails: {
    general: "sabaozmen@sabaozmen.av.tr",
    office: "seldaaltun@sabaozmen.av.tr",
  },
  linkedin: "https://www.linkedin.com/company/sabaozmenavukatlikortakligi/",
  // Query string used for the map embed and for turn-by-turn directions.
  mapsQuery: "Erenköy Mah. Ethemefendi Cad. Anzaf Rezidans No:101 D:1 Kadıköy İstanbul",
  maps: "https://maps.google.com/?q=Erenk%C3%B6y%20Mah.%20Ethemefendi%20Cad.%20Anzaf%20Rezidans%20No%3A101%20D%3A1%20Kad%C4%B1k%C3%B6y%20%C4%B0stanbul",
};

/* ---------------------------------------------------------------------------
   Route table. One entry per page, in three languages.
   Slugs mirror the live site's own EN/DE paths where they already exist.
   --------------------------------------------------------------------------- */
const routes = {
  home:      { tr: "",                    en: "",                    de: "" },
  about:     { tr: "kurumsal/hakkimizda", en: "corporate/about",     de: "ueber-uns/ueber-uns" },
  vision:    { tr: "kurumsal/vizyon-misyon", en: "corporate/vision-mission", de: "ueber-uns/vision-mission" },
  quality:   { tr: "kurumsal/kalite-politikamiz", en: "corporate/quality-policy", de: "ueber-uns/qualitaetspolitik" },
  career:    { tr: "kurumsal/kariyer",    en: "corporate/career",    de: "ueber-uns/karriere" },
  areas:     { tr: "calisma-alanlarimiz", en: "practice-areas",      de: "taetigkeitsfelder" },
  team:      { tr: "ekibimiz",            en: "our-team",            de: "unser-team" },
  articles:  { tr: "makaleler",           en: "articles",            de: "publikationen" },
  events:    { tr: "egitim-ve-kongreler",  en: "training-and-congresses", de: "fortbildung-und-kongresse" },
  contact:   { tr: "iletisim",            en: "contact",             de: "kontakt" },
  privacy:   { tr: "kvkk-aydinlatma-metni", en: "privacy-notice",    de: "datenschutzhinweis" },
  cookies:   { tr: "cerez-politikasi",    en: "cookie-policy",       de: "cookie-richtlinie" },
};

/* ---------------------------------------------------------------------------
   Practice areas — 24, matching the live site exactly.
   The live detail pages carry a title and nothing else; these descriptions are
   new. They are deliberately descriptive of work done, with no expertise,
   success or guarantee claims (TBB Reklam Yasağı Yönetmeliği).
   --------------------------------------------------------------------------- */
const areas = [
  {
    slug: "gayrimenkul-hukuku-ve-kentsel-donusum",
    name: {
      tr: "Gayrimenkul Hukuku ve Kentsel Dönüşüm",
      en: "Real Estate Law and Urban Transformation",
      de: "Immobilienrecht und Stadterneuerung",
    },
    desc: {
      tr: "Taşınmaz mülkiyetinin kazanılması, devri ve sınırlandırılmasına ilişkin uyuşmazlıklar ile 6306 sayılı Kanun kapsamındaki riskli yapı süreçlerinde hukuki danışmanlık ve dava takibi.",
      en: "Advice and litigation on the acquisition, transfer and restriction of immovable property, and on risky-structure procedures under Law No. 6306.",
      de: "Beratung und Prozessführung zum Erwerb, zur Übertragung und Beschränkung von Grundeigentum sowie zu Verfahren über gefährdete Bauten nach Gesetz Nr. 6306.",
    },
    featured: true,
  },
  {
    slug: "kat-mulkiyeti-hukuku",
    name: { tr: "Kat Mülkiyeti Hukuku", en: "Condominium Law", de: "Wohnungseigentumsrecht" },
    desc: {
      tr: "634 sayılı Kat Mülkiyeti Kanunu uygulamaları; arsa payının düzeltilmesi, ortak yer ve eklenti ayrımı, genel gider ve avansa katılma borcu ile yönetim uyuşmazlıkları.",
      en: "Application of Condominium Law No. 634: correction of land shares, the distinction between common areas and appurtenances, common-expense obligations and management disputes.",
      de: "Anwendung des Wohnungseigentumsgesetzes Nr. 634: Berichtigung von Grundstücksanteilen, Abgrenzung von Gemeinschafts- und Sondereigentum, Kostenbeteiligung und Verwaltungsstreitigkeiten.",
    },
    featured: true,
  },
  {
    slug: "toplu-yapilarda-yonetim-plani",
    name: {
      tr: "Toplu Yapılarda Yönetim Planı ve Yönetim Hizmet Sözleşmeleri",
      en: "Management Plans and Management Service Contracts for Complex Buildings",
      de: "Verwaltungspläne und Verwaltungsdienstverträge für Gebäudekomplexe",
    },
    desc: {
      tr: "Toplu yapılarda yönetim planlarının hazırlanması ve değiştirilmesi, yönetim hizmet sözleşmelerinin düzenlenmesi ve uygulamadan doğan uyuşmazlıklar.",
      en: "Drafting and amendment of management plans for complex developments, preparation of management service contracts and related disputes.",
      de: "Erstellung und Änderung von Verwaltungsplänen für Gebäudekomplexe, Gestaltung von Verwaltungsdienstverträgen und daraus entstehende Streitigkeiten.",
    },
    featured: true,
  },
  {
    slug: "insaat-hukuku",
    name: { tr: "İnşaat Hukuku", en: "Construction Law", de: "Baurecht" },
    desc: {
      tr: "Arsa payı karşılığı inşaat sözleşmeleri başta olmak üzere eser sözleşmelerinin kurulması, ifası, ayıp ve gecikmeden doğan sorumluluk ile tapu devri uyuşmazlıkları.",
      en: "Formation and performance of construction contracts — in particular land-share-for-construction agreements — liability for defects and delay, and title transfer disputes.",
      de: "Abschluss und Erfüllung von Bauverträgen, insbesondere Grundstücksanteil-gegen-Bau-Verträge, Haftung für Mängel und Verzug sowie Streitigkeiten über Eigentumsübertragung.",
    },
    featured: true,
  },
  {
    slug: "ticaret-ve-sirketler-hukuku",
    name: { tr: "Ticaret ve Şirketler Hukuku", en: "Commercial and Corporate Law", de: "Handels- und Gesellschaftsrecht" },
    desc: {
      tr: "Şirket kuruluşu, pay devri, genel kurul ve yönetim kurulu işlemleri, ortaklar arası uyuşmazlıklar ve ticari sözleşmelerin hazırlanması.",
      en: "Company formation, share transfers, general assembly and board procedures, shareholder disputes and the drafting of commercial agreements.",
      de: "Gesellschaftsgründung, Anteilsübertragungen, Haupt­versammlungs- und Vorstandsverfahren, Gesellschafterstreitigkeiten und Gestaltung von Handelsverträgen.",
    },
    featured: true,
  },
  {
    slug: "sozlesmeler-hukuku",
    name: { tr: "Sözleşmeler Hukuku", en: "Contract Law", de: "Vertragsrecht" },
    desc: {
      tr: "Sözleşmelerin kurulması, şekil şartları, temerrüt, cezai şart ve fesih sonuçlarına ilişkin danışmanlık ile sözleşmeden doğan davaların takibi.",
      en: "Advice on contract formation, formal requirements, default, penalty clauses and the consequences of termination, together with contractual litigation.",
      de: "Beratung zu Vertragsschluss, Formerfordernissen, Verzug, Vertragsstrafen und Kündigungsfolgen sowie Führung vertragsrechtlicher Prozesse.",
    },
    featured: true,
  },
  {
    slug: "arabuluculuk",
    name: { tr: "Arabuluculuk", en: "Mediation", de: "Mediation" },
    desc: {
      tr: "Dava şartı ve ihtiyari arabuluculuk süreçlerinde taraf vekilliği, müzakere yürütülmesi ve anlaşma belgesinin hazırlanması.",
      en: "Representation in mandatory and voluntary mediation, conduct of negotiations and preparation of settlement documents.",
      de: "Vertretung in obligatorischen und freiwilligen Mediationsverfahren, Verhandlungsführung und Erstellung der Vergleichsurkunde.",
    },
  },
  {
    slug: "imar-hukuku",
    name: { tr: "İmar Hukuku", en: "Zoning Law", de: "Bauplanungsrecht" },
    desc: {
      tr: "İmar planlarının iptali, plan değişikliklerinin taşınmaz ve sözleşmeler üzerindeki etkisi, ruhsat ve yapı kayıt belgesi uyuşmazlıkları.",
      en: "Annulment of zoning plans, the effect of plan amendments on property and contracts, and disputes over building permits and registration certificates.",
      de: "Aufhebung von Bebauungsplänen, Auswirkungen von Planänderungen auf Grundstücke und Verträge, Streitigkeiten über Baugenehmigungen.",
    },
  },
  {
    slug: "kamulastirma-hukuku",
    name: { tr: "Kamulaştırma Hukuku", en: "Expropriation Law", de: "Enteignungsrecht" },
    desc: {
      tr: "Kamulaştırma bedelinin tespiti ve tescili davaları, kamulaştırmasız el atma ve acele kamulaştırma süreçleri.",
      en: "Actions for determination and registration of expropriation compensation, de facto expropriation and urgent expropriation procedures.",
      de: "Verfahren zur Festsetzung und Eintragung der Enteignungsentschädigung, faktische Enteignung und Eilenteignung.",
    },
  },
  {
    slug: "kadastro-hukuku",
    name: { tr: "Kadastro Hukuku", en: "Cadastre Law", de: "Katasterrecht" },
    desc: {
      tr: "Kadastro tespitine itiraz, tespit öncesi ayni hak iddiaları, sınır ve yüzölçümü uyuşmazlıkları ile Hazine sorumluluğu.",
      en: "Objections to cadastral determination, pre-determination claims to rights in rem, boundary and area disputes, and Treasury liability.",
      de: "Einsprüche gegen Katasterfeststellungen, dingliche Ansprüche vor der Feststellung, Grenz- und Flächenstreitigkeiten sowie Staatshaftung.",
    },
  },
  {
    slug: "kooperatifler-hukuku",
    name: { tr: "Kooperatifler Hukuku", en: "Cooperative Law", de: "Genossenschaftsrecht" },
    desc: {
      tr: "Yapı kooperatiflerinde ortaklık ilişkisi, ortaklık payı dışındaki ödemeler, temerrüt ve ihraç işlemleri ile kat mülkiyetine geçiş.",
      en: "Membership relations in building cooperatives, payments beyond the share contribution, default and expulsion procedures, and transition to condominium ownership.",
      de: "Mitgliedschaftsverhältnisse in Baugenossenschaften, Zahlungen über den Geschäftsanteil hinaus, Verzug und Ausschluss sowie Übergang zum Wohnungseigentum.",
    },
  },
  {
    slug: "barter-mortgage-tasinmaz-rehni-ve-ipotek",
    name: {
      tr: "Barter, Mortgage, Taşınmaz Rehni ve İpotek",
      en: "Barter, Mortgage and Real Estate Pledge",
      de: "Tauschhandel, Hypothek und Immobilienpfandrecht",
    },
    desc: {
      tr: "İpoteğin kurulması, derecesi ve terkini, ipotekle yüklü taşınmazın devri, ipoteğin birden çok taşınmaza dağıtılması ve paraya çevrilmesi.",
      en: "Creation, ranking and discharge of mortgages, transfer of encumbered property, distribution of a mortgage over several properties and its enforcement.",
      de: "Bestellung, Rang und Löschung von Hypotheken, Übertragung belasteter Grundstücke, Verteilung einer Hypothek auf mehrere Grundstücke und Verwertung.",
    },
  },
  {
    slug: "gayrimenkul-yatirim-ortakligi",
    name: {
      tr: "Gayrimenkul Yatırım Ortaklığı Kuruluşu, İşlemleri ve Danışmanlığı",
      en: "Real Estate Investment Trust Formation, Transactions and Advisory",
      de: "Gründung, Transaktionen und Beratung von Immobilien-Investmentgesellschaften",
    },
    desc: {
      tr: "GYO kuruluş ve dönüşüm işlemleri, portföy edinimi, Sermaye Piyasası mevzuatına uyum ve pay sahipliğine ilişkin danışmanlık.",
      en: "REIT formation and conversion, portfolio acquisition, capital markets compliance and shareholder advisory.",
      de: "Gründung und Umwandlung von REITs, Portfolioerwerb, kapitalmarktrechtliche Compliance und Aktionärsberatung.",
    },
  },
  {
    slug: "orman-hukuku-ve-2b",
    name: {
      tr: "Orman Hukuku ve 6292 Sayılı Kanun Kapsamında 2-B Arazileri",
      en: "Forestry Law and 2-B Lands under Law No. 6292",
      de: "Forstrecht und 2-B-Grundstücke nach Gesetz Nr. 6292",
    },
    desc: {
      tr: "Orman sınırları dışına çıkarılan taşınmazların satın alınması, hak sahipliği tespiti ve orman kadastrosuna ilişkin uyuşmazlıklar.",
      en: "Purchase of land excluded from forest boundaries, determination of entitlement, and forest cadastre disputes.",
      de: "Erwerb von aus dem Waldbestand ausgegliederten Grundstücken, Feststellung der Berechtigung und Streitigkeiten zum Waldkataster.",
    },
  },
  {
    slug: "devre-mulk-ve-devre-tatil-hukuku",
    name: { tr: "Devre Mülk ve Devre Tatil Hukuku", en: "Timeshare and Holiday Ownership Law", de: "Teilzeitwohnrecht und Timesharing" },
    desc: {
      tr: "Devre mülk hakkının kurulması, devri ve sona ermesi; devre tatil sözleşmelerinde cayma hakkı ve tüketici mevzuatına uyum.",
      en: "Creation, transfer and termination of timeshare rights; rights of withdrawal in holiday contracts and consumer law compliance.",
      de: "Begründung, Übertragung und Beendigung von Teilzeitwohnrechten; Widerrufsrechte bei Ferienverträgen und Verbraucherschutz.",
    },
  },
  {
    slug: "yabancilara-tasinmaz-satisi",
    name: {
      tr: "Yabancılara Taşınmaz Satışına İlişkin Hukuki Danışmanlık",
      en: "Legal Advisory on Real Estate Sales to Foreign Nationals",
      de: "Rechtsberatung beim Immobilienverkauf an ausländische Staatsangehörige",
    },
    desc: {
      tr: "Yabancı gerçek ve tüzel kişilerin taşınmaz edinimi, askeri yasak bölge ve karşılıklılık incelemesi, tapu işlemleri ve vatandaşlık başvurularına bağlı süreçler.",
      en: "Property acquisition by foreign individuals and entities, military zone and reciprocity checks, title procedures and citizenship-linked processes.",
      de: "Immobilienerwerb durch ausländische Personen und Gesellschaften, Prüfung militärischer Sperrzonen und Gegenseitigkeit, Grundbuchverfahren und staatsbürgerschaftsbezogene Abläufe.",
    },
    featured: true,
  },
  {
    slug: "tahkim",
    name: { tr: "Tahkim", en: "Arbitration", de: "Schiedsverfahren" },
    desc: {
      tr: "Tahkim şartının düzenlenmesi, ulusal ve milletlerarası tahkim yargılamasında taraf vekilliği, hakem kararlarının tanınması ve tenfizi.",
      en: "Drafting of arbitration clauses, representation in domestic and international arbitration, and recognition and enforcement of awards.",
      de: "Gestaltung von Schiedsklauseln, Vertretung in nationalen und internationalen Schiedsverfahren sowie Anerkennung und Vollstreckung von Schiedssprüchen.",
    },
  },
  {
    slug: "icra-ve-iflas-hukuku",
    name: { tr: "İcra ve İflas Hukuku", en: "Enforcement and Bankruptcy Law", de: "Vollstreckungs- und Insolvenzrecht" },
    desc: {
      tr: "İlamlı ve ilamsız takip, haciz ve satış işlemleri, istihkak ve şikâyet davaları ile konkordato süreçleri.",
      en: "Enforcement with and without judgment, attachment and sale procedures, recovery and complaint actions, and composition proceedings.",
      de: "Vollstreckung mit und ohne Titel, Pfändungs- und Verwertungsverfahren, Aussonderungs- und Beschwerdeklagen sowie Nachlassverfahren.",
    },
  },
  {
    slug: "is-ve-sosyal-guvenlik-hukuku",
    name: { tr: "İş ve Sosyal Güvenlik Hukuku", en: "Labour and Social Security Law", de: "Arbeits- und Sozialversicherungsrecht" },
    desc: {
      tr: "İş sözleşmelerinin kurulması ve sona ermesi, işçilik alacakları, iş kazası sorumluluğu ve sosyal güvenlik uyuşmazlıkları.",
      en: "Formation and termination of employment contracts, employee claims, occupational accident liability and social security disputes.",
      de: "Begründung und Beendigung von Arbeitsverträgen, Arbeitnehmeransprüche, Haftung bei Arbeitsunfällen und sozialversicherungsrechtliche Streitigkeiten.",
    },
  },
  {
    slug: "aile-hukuku",
    name: { tr: "Aile Hukuku", en: "Family Law", de: "Familienrecht" },
    desc: {
      tr: "Boşanma, mal rejiminin tasfiyesi, nafaka ve velayet uyuşmazlıkları ile aile konutu ve edinilmiş mallara ilişkin talepler.",
      en: "Divorce, liquidation of the matrimonial property regime, maintenance and custody disputes, and claims concerning the family residence and acquired property.",
      de: "Scheidung, Auseinandersetzung des Güterstands, Unterhalts- und Sorgerechtsstreitigkeiten sowie Ansprüche zur Familienwohnung und zum Errungenschaftsvermögen.",
    },
  },
  {
    slug: "miras-hukuku",
    name: { tr: "Miras Hukuku", en: "Inheritance Law", de: "Erbrecht" },
    desc: {
      tr: "Vasiyetname ve miras sözleşmeleri, tenkis ve muvazaa davaları, mirasın paylaşılması ve terekenin tasfiyesi.",
      en: "Wills and inheritance agreements, abatement and simulation actions, division of the estate and its liquidation.",
      de: "Testamente und Erbverträge, Herabsetzungs- und Scheingeschäftsklagen, Erbteilung und Nachlassabwicklung.",
    },
  },
  {
    slug: "vakiflar-ve-dernekler-hukuku",
    name: { tr: "Vakıflar ve Dernekler Hukuku", en: "Foundations and Associations Law", de: "Stiftungs- und Vereinsrecht" },
    desc: {
      tr: "Vakıf ve dernek kuruluşu, senet ve tüzük hazırlanması, organ işlemleri, denetim ve mal edinimine ilişkin danışmanlık.",
      en: "Establishment of foundations and associations, drafting of deeds and statutes, organ procedures, supervision and asset acquisition.",
      de: "Gründung von Stiftungen und Vereinen, Erstellung von Satzungen, Organverfahren, Aufsicht und Vermögenserwerb.",
    },
  },
  {
    slug: "calisma-ve-oturma-izinleri",
    name: { tr: "Çalışma ve Oturma İzinleri", en: "Work and Residence Permits", de: "Arbeits- und Aufenthaltsgenehmigungen" },
    desc: {
      tr: "Yabancıların çalışma ve ikamet izni başvuruları, uzatma ve iptal işlemleri ile idari itiraz süreçleri.",
      en: "Work and residence permit applications for foreign nationals, extensions and cancellations, and administrative appeals.",
      de: "Arbeits- und Aufenthaltserlaubnisanträge für Ausländer, Verlängerungen und Widerrufe sowie Verwaltungsrechtsbehelfe.",
    },
  },
  {
    slug: "tuketici-hukuku",
    name: { tr: "Tüketici Hukuku", en: "Consumer Law", de: "Verbraucherrecht" },
    desc: {
      tr: "Konut satış sözleşmelerinden doğan ayıp ve gecikme talepleri, tüketici hakem heyeti ve mahkeme süreçleri.",
      en: "Defect and delay claims arising from residential sale contracts, consumer arbitration committee and court proceedings.",
      de: "Mängel- und Verzugsansprüche aus Wohnungskaufverträgen, Verfahren vor Verbraucherschlichtungsstellen und Gerichten.",
    },
  },
  {
    slug: "kisisel-verilerin-korunmasi-hukuku",
    name: { tr: "Kişisel Verilerin Korunması Hukuku", en: "Data Protection Law", de: "Datenschutzrecht" },
    desc: {
      tr: "VERBİS kaydı, aydınlatma ve açık rıza metinleri, veri envanteri, ihlal bildirimi ve Kurul kararlarına ilişkin danışmanlık.",
      en: "VERBİS registration, privacy notices and consent texts, data inventories, breach notification and advice on Board decisions.",
      de: "VERBİS-Registrierung, Datenschutzhinweise und Einwilligungstexte, Datenverzeichnisse, Meldung von Verletzungen und Beratung zu Behördenentscheidungen.",
    },
  },
];

/* ---------------------------------------------------------------------------
   Team.
   `photo: null` marks the two portraits that are broken on the live site
   (v4 §3.6 / evidence #13); the template renders an initials placeholder
   rather than a broken image, and the handover lists them.
   `pending` fields are the details the TBB regulation expressly permits and
   the current site omits (v4 §3.7 / evidence #15).
   --------------------------------------------------------------------------- */
/* Team members moved to content/team.json — the admin panel rewrites that file,
   so it cannot live in this module. Read them through lib/store.js. */

/* ---------------------------------------------------------------------------
   Corporate page copy. Turkish is the firm's own wording, lightly corrected for
   punctuation only. EN/DE are translations for review by the firm.
   --------------------------------------------------------------------------- */
const pages = {
  about: {
    title: { tr: "Hakkımızda", en: "About Us", de: "Über uns" },
    lead: {
      tr: "İstanbul Barosu'na kayıtlı ilk avukatlık ortaklıklarından biri olarak 2004 yılından bu yana faaliyet gösteriyoruz.",
      en: "One of the first attorney partnerships registered with the Istanbul Bar Association, in practice since 2004.",
      de: "Als eine der ersten bei der Anwaltskammer Istanbul eingetragenen Anwaltspartnerschaften seit 2004 tätig.",
    },
    body: {
      tr: [
        "Ortaklığımız 1136 sayılı Avukatlık Kanunu'nun 44. maddesi hükümlerine göre “Saba Özmen Avukatlık Ortaklığı” unvanı ile mesleki faaliyette bulunmak üzere 2004 yılında kurulmuştur.",
        "Ağırlıklı olarak gayrimenkul hukukunun tüm alanları başta olmak üzere; kat mülkiyeti hukuku, yönetim planı hazırlanması, yeniden yapılandırmalar, inşaat hukuku, kamulaştırma hukuku, imar hukuku, kadastro hukuku, orman hukuku, kooperatif hukuku, gayrimenkul yatırım ortaklığı kuruluşu ve işlemleri, devre mülk ve devre tatil hukuku, barter ve mortgage, yabancılara taşınmaz satışına ilişkin danışmanlık, banka ve finans hukuku, sermaye piyasası hukuku, ticaret ve şirketler hukuku, icra ve iflas hukuku, iş ve sosyal güvenlik hukuku, miras hukuku, aile hukuku, dernekler ve vakıflar hukuku, fikri ve sınai haklar hukuku, tüketici hukuku, tahkim ve dava hukuku ile sözleşmeler hukuku konularında hukuki danışmanlık ve avukatlık hizmeti vermekteyiz.",
        "İstanbul Barosu'na kayıtlı ilk avukatlık ortaklıklarından olan hukuk büromuz, kurulduğundan bugüne dek genç ve dinamik kadrosu ile ilkeli, dürüst ve hukuka saygılı olarak Türk hukukuna hizmet etmektedir. Daima hukukun üstünlüğünü ön planda tutan Saba Özmen Avukatlık Ortaklığı, kişi ve kuruluşlara çözüm odaklı hizmet vermekte, bunun yanında ortakları tarafından düzenlenen sürekli yayın ve konferanslar ile de ülkemizde hukukun gelişmesi için çalışmalarını sürdürmektedir.",
      ],
      en: [
        "The partnership was established in 2004 to practise under the title “Saba Özmen Attorney Partnership” pursuant to Article 44 of Attorneyship Law No. 1136.",
        "We advise and represent clients principally across all areas of real estate law, together with condominium law, preparation of management plans, restructurings, construction law, expropriation law, zoning law, cadastre law, forestry law, cooperative law, REIT formation and transactions, timeshare and holiday ownership law, barter and mortgage, advisory on real estate sales to foreign nationals, banking and finance law, capital markets law, commercial and corporate law, enforcement and bankruptcy law, labour and social security law, inheritance law, family law, associations and foundations law, intellectual and industrial property law, consumer law, arbitration and litigation, and contract law.",
        "One of the first attorney partnerships registered with the Istanbul Bar Association, our office has served Turkish law with a principled and honest approach since its foundation. Placing the rule of law first, the partnership provides solution-focused service to individuals and institutions, while its partners continue to contribute to the development of law in Türkiye through their ongoing publications and conferences.",
      ],
      de: [
        "Die Partnerschaft wurde 2004 gegründet, um gemäß Artikel 44 des Anwaltsgesetzes Nr. 1136 unter der Bezeichnung „Saba Özmen Rechtsanwaltspartnerschaft“ tätig zu sein.",
        "Wir beraten und vertreten vorrangig in allen Bereichen des Immobilienrechts sowie im Wohnungseigentumsrecht, bei der Erstellung von Verwaltungsplänen, Umstrukturierungen, im Baurecht, Enteignungsrecht, Bauplanungsrecht, Katasterrecht, Forstrecht, Genossenschaftsrecht, bei Gründung und Transaktionen von Immobilien-Investmentgesellschaften, im Teilzeitwohnrecht, bei Tauschhandel und Hypothek, in der Beratung zum Immobilienverkauf an Ausländer, im Bank- und Finanzrecht, Kapitalmarktrecht, Handels- und Gesellschaftsrecht, Vollstreckungs- und Insolvenzrecht, Arbeits- und Sozialversicherungsrecht, Erbrecht, Familienrecht, Vereins- und Stiftungsrecht, im Recht des geistigen Eigentums, Verbraucherrecht, in Schiedsverfahren und Prozessführung sowie im Vertragsrecht.",
        "Als eine der ersten bei der Anwaltskammer Istanbul eingetragenen Anwaltspartnerschaften dient unsere Kanzlei dem türkischen Recht seit ihrer Gründung mit einem prinzipientreuen und redlichen Ansatz. Die Partnerschaft stellt die Rechtsstaatlichkeit in den Vordergrund, arbeitet lösungsorientiert für Privatpersonen und Institutionen und trägt durch die fortlaufenden Veröffentlichungen und Vorträge ihrer Partner zur Entwicklung des Rechts in der Türkei bei.",
      ],
    },
  },

  vision: {
    title: { tr: "Vizyon & Misyon", en: "Vision & Mission", de: "Vision & Mission" },
    lead: {
      tr: "Ortaklığımızı yönlendiren iki temel taahhüt.",
      en: "The two commitments that guide the partnership.",
      de: "Die beiden Verpflichtungen, die unsere Partnerschaft leiten.",
    },
    /* `p` is the firm's own statement, kept word for word. `body` expands it —
       descriptive of how the firm works, with no success, guarantee or
       specialisation claim (TBB Reklam Yasağı Yönetmeliği). */
    blocks: [
      {
        h: { tr: "Vizyonumuz", en: "Our Vision", de: "Unsere Vision" },
        p: {
          tr: "Yılların getirdiği tecrübe ve bilgi birikimi ile, farkının ve sorumluluklarının bilinci içinde, müvekkilleri için en güvenilir çözüm ortağı olmak.",
          en: "To be the most dependable partner for our clients, drawing on years of experience and accumulated knowledge, and conscious of our distinction and our responsibilities.",
          de: "Auf der Grundlage langjähriger Erfahrung und gewachsenen Wissens sowie im Bewusstsein unserer Besonderheit und Verantwortung der verlässlichste Partner unserer Mandanten zu sein.",
        },
        body: {
          tr: [
            "Bu vizyon, ortaklığın 2004'ten bu yana taşınmaz hukuku alanında sürdürdüğü çalışmanın doğal sonucudur. Güvenilirlik bizim için bir iddia değil; dosyanın hukuki dayanağının açıkça ortaya konması, riskin baştan söylenmesi ve müvekkilin kendi kararını bilerek verebilmesi anlamına gelir.",
            "Ortaklarımızın hukuk dergilerinde yayımlanan çalışmaları bu yaklaşımın yazılı kaydıdır: uygulamada karşılaştığımız sorunları önce inceler, sonra savunuruz.",
          ],
          en: [
            "This follows naturally from the work the partnership has done in property law since 2004. Dependability, for us, is not a claim: it means setting out the legal basis of a matter plainly, naming the risk at the outset, and leaving the client able to decide knowingly.",
            "The studies our partners publish in legal journals are the written record of that approach — we examine the problems we meet in practice before we argue them.",
          ],
          de: [
            "Diese Vision folgt aus der Arbeit, die die Partnerschaft seit 2004 im Immobilienrecht leistet. Verlässlichkeit ist für uns keine Behauptung: Sie bedeutet, die rechtliche Grundlage einer Sache klar darzulegen, das Risiko von Anfang an zu benennen und der Mandantschaft eine informierte Entscheidung zu ermöglichen.",
            "Die in Fachzeitschriften veröffentlichten Arbeiten unserer Partner sind das schriftliche Zeugnis dieses Vorgehens: Wir untersuchen die Probleme der Praxis, bevor wir sie vertreten.",
          ],
        },
      },
      {
        h: { tr: "Misyonumuz", en: "Our Mission", de: "Unsere Mission" },
        p: {
          tr: "Dinamik ve proje odaklı esnek yapımızla, faaliyet gösterdiğimiz alanlarda iş ortaklarımızla tamamladığımız her projeden memnuniyet düzeyi yüksek paydaşlar oluşturmak.",
          en: "Through our dynamic, project-focused and flexible structure, to create highly satisfied stakeholders from every project we complete with our business partners.",
          de: "Mit unserer dynamischen, projektorientierten und flexiblen Struktur aus jedem gemeinsam mit unseren Geschäftspartnern abgeschlossenen Projekt hochzufriedene Beteiligte hervorzubringen.",
        },
        body: {
          tr: [
            "Her dosyayı, tarafların ticari ve ailevi gerçekliğini gözeterek ele alırız. Taşınmaz uyuşmazlıklarında çözüm çoğu zaman yalnızca mahkeme kararında değildir; sözleşmenin baştan doğru kurulmasında, arsa payının doğru hesaplanmasında ve tarafların birbirini anlamasındadır.",
            "Türkçe, İngilizce ve Almanca çalışıyor olmamız, yurt dışında yaşayan taşınmaz sahipleri ve yabancı yatırımcılarla çeviri kaybı olmadan doğrudan iletişim kurmamızı sağlar.",
          ],
          en: [
            "We take each matter with the commercial and family reality of the parties in view. In property disputes the resolution often does not lie in the judgment alone, but in drafting the contract correctly at the outset, calculating the land share correctly, and the parties understanding one another.",
            "Working in Turkish, English and German lets us deal directly with property owners living abroad and with foreign investors, without anything lost in translation.",
          ],
          de: [
            "Wir bearbeiten jede Sache mit Blick auf die geschäftliche und familiäre Wirklichkeit der Beteiligten. Bei Immobilienstreitigkeiten liegt die Lösung häufig nicht allein im Urteil, sondern in der von Anfang an richtigen Vertragsgestaltung, der zutreffenden Berechnung des Grundstücksanteils und im gegenseitigen Verständnis der Parteien.",
            "Dass wir auf Türkisch, Englisch und Deutsch arbeiten, erlaubt den unmittelbaren Austausch mit im Ausland lebenden Eigentümern und ausländischen Investoren — ohne Verluste durch Übersetzung.",
          ],
        },
      },
    ],
  },

  quality: {
    title: { tr: "Kalite Politikamız", en: "Quality Policy", de: "Qualitätspolitik" },
    lead: {
      tr: "Saba Özmen Avukatlık Ortaklığı, aşağıdaki ilkelerle Kalite Yönetim Sistemine uymayı ve sistemin sürekli iyileştirilmesini taahhüt eder.",
      en: "Saba Özmen Attorney Partnership undertakes to comply with its Quality Management System and to improve it continuously, on the following principles.",
      de: "Die Saba Özmen Rechtsanwaltspartnerschaft verpflichtet sich, ihr Qualitätsmanagementsystem einzuhalten und nach folgenden Grundsätzen fortlaufend zu verbessern.",
    },
    /* The firm's seven principles, each with a sentence saying what it means in
       practice — as bare labels they read as a checklist rather than a policy.
       NOTE: items 6 and 7 were near-duplicates on the live site ("Her düzeyde
       eğitim" / "Eğitim faaliyetleri"). Both are kept, but distinguished:
       6 is internal training, 7 is the partners' academic and conference work. */
    list: {
      tr: [
        { t: "Müvekkil memnuniyeti ve geri bildirim",
          d: "Dosya kapandıktan sonra sürecin nasıl yürüdüğünü sorar, gelen eleştiriyi çalışma biçimimize yansıtırız." },
        { t: "Rekabetçi kalite",
          d: "Ölçümüz, benzer dosyalarda ulaşılabilecek en iyi hukuki sonuç ve o sonuca giden yolun müvekkil için anlaşılır olmasıdır." },
        { t: "Kararlara ekip katılımı",
          d: "Dosya stratejisi tek bir kişinin değil, üzerinde çalışan ekibin ortak değerlendirmesiyle belirlenir." },
        { t: "Sürekli araştırma ve geliştirme",
          d: "Mevzuat değişikliklerini ve Yargıtay içtihadındaki dönüşleri düzenli olarak izler, dosya yönetimini buna göre günceller." },
        { t: "Enerjinin verimli kullanımı ve çevre",
          d: "Dosya ve yazışmaları mümkün olduğunca elektronik ortamda yürütür, kâğıt tüketimini sınırlarız." },
        { t: "Her düzeyde eğitim",
          d: "Stajyer avukattan ortağa kadar herkes düzenli iç eğitime katılır; bilgi ekip içinde kalmaz, paylaşılır." },
        { t: "Eğitim faaliyetlerinin sürdürülmesi",
          d: "Ortaklarımız üniversitelerde ders verir, kongre ve konferanslara katılır. Bu çalışmalar Eğitim ve Kongreler bölümünde yer alır." },
      ],
      en: [
        { t: "Client feedback",
          d: "Once a matter closes we ask how the process went, and let the criticism shape how we work." },
        { t: "Competitive quality",
          d: "Our measure is the best legal outcome reachable in comparable matters — and the route to it being intelligible to the client." },
        { t: "Team participation in decisions",
          d: "Case strategy is set by the joint assessment of the team working on it, not by one person." },
        { t: "Continuous research and development",
          d: "We follow legislative change and reversals in Court of Cassation case law as a matter of routine, and update how matters are run accordingly." },
        { t: "Efficient use of energy, and the environment",
          d: "Files and correspondence are handled electronically wherever possible, keeping paper use down." },
        { t: "Training at every level",
          d: "Everyone from trainee to partner takes part in regular internal training; knowledge is shared rather than held." },
        { t: "Continuing academic activity",
          d: "Our partners teach at universities and take part in congresses and conferences. That work is listed under Training & Congresses." },
      ],
      de: [
        { t: "Mandantenrückmeldung",
          d: "Nach Abschluss einer Sache fragen wir nach dem Verlauf und lassen die Kritik in unsere Arbeitsweise einfließen." },
        { t: "Wettbewerbsfähige Qualität",
          d: "Unser Maßstab ist das in vergleichbaren Fällen erreichbare beste rechtliche Ergebnis — und ein für die Mandantschaft nachvollziehbarer Weg dorthin." },
        { t: "Beteiligung des Teams an Entscheidungen",
          d: "Die Fallstrategie ergibt sich aus der gemeinsamen Einschätzung des bearbeitenden Teams, nicht aus der einer einzelnen Person." },
        { t: "Fortlaufende Forschung und Entwicklung",
          d: "Gesetzesänderungen und Wendungen in der Rechtsprechung des Kassationshofs verfolgen wir regelmäßig und passen die Fallbearbeitung daran an." },
        { t: "Energieeffizienz und Umwelt",
          d: "Akten und Korrespondenz führen wir soweit möglich elektronisch und begrenzen so den Papierverbrauch." },
        { t: "Aus- und Weiterbildung auf allen Ebenen",
          d: "Von der Referendarin bis zum Partner nehmen alle an regelmäßigen internen Fortbildungen teil; Wissen wird geteilt, nicht gehortet." },
        { t: "Fortführung der akademischen Tätigkeit",
          d: "Unsere Partner lehren an Universitäten und wirken an Kongressen und Konferenzen mit. Diese Arbeit ist unter Fortbildung & Kongresse aufgeführt." },
      ],
    },
  },

  career: {
    title: { tr: "Kariyer", en: "Careers", de: "Karriere" },
    lead: {
      tr: "Ortaklığımızın rekabet gücünü koruması ve adının kalite kavramıyla özdeşleşmesinde temel unsur, insan kaynağımızdır.",
      en: "Our people are the foundation of the partnership's standing and of the association of our name with quality.",
      de: "Unsere Mitarbeitenden sind die Grundlage für die Stellung der Partnerschaft und für die Verbindung unseres Namens mit Qualität.",
    },
    body: {
      tr: [
        "İnsan kaynakları politikamız; takım çalışmasına istekli, hedeflerine odaklanabilen, etkili iletişime önem veren, gelişime açık, sevgi ve saygı bağları ile kenetlenmiş, kurum kültürümüze bağlı ve hedeflerimizi benimsemiş bir işgücü oluşturmaktır.",
        "Saba Özmen Avukatlık Ortaklığı ailesine katılanlardan beklentilerimizin başında dürüst ve açık olmaları, güçlü bir başarma azmine sahip olmaları, bireysel inisiyatif ve sorumluluk alabilmeleri ve yüksek vasıfta liderlik sergileyebilme yeteneğine sahip olmaları gelmektedir. Müvekkil ve hizmet odaklı olmak, takım çalışmasına uyum sağlayabilmek ve yeniliklere açık olmak da öncelikli önem verdiğimiz nitelikler arasındadır.",
        "Bu özelliklere sahip her yeni çalışma arkadaşımız, insanı iş sürecinin odağına alan ve insan kaynağını geliştirmek için modern yöntemler kullanan bir kurumsal yaklaşımla karşılaşacaktır.",
      ],
      en: [
        "Our human resources policy is to build a workforce that is willing to work as a team, able to focus on its goals, attentive to effective communication, open to development, bound by affection and respect, committed to our institutional culture and aligned with our objectives.",
        "From those joining the Saba Özmen Attorney Partnership we look first for honesty and openness, a strong determination to succeed, the ability to take individual initiative and responsibility, and the capacity for high-calibre leadership. Being client- and service-focused, adapting to teamwork and remaining open to innovation are also qualities we prioritise.",
        "Every new colleague with these qualities will find an institutional approach that places people at the centre of the working process and uses modern methods to develop them.",
      ],
      de: [
        "Unsere Personalpolitik zielt darauf, ein Team aufzubauen, das zur Zusammenarbeit bereit ist, sich auf seine Ziele konzentrieren kann, Wert auf wirksame Kommunikation legt, entwicklungsoffen ist, durch Zuneigung und Respekt verbunden bleibt und sich unserer Unternehmenskultur und unseren Zielen verpflichtet fühlt.",
        "Von denjenigen, die zur Saba Özmen Rechtsanwaltspartnerschaft stoßen, erwarten wir zuallererst Ehrlichkeit und Offenheit, einen ausgeprägten Erfolgswillen, die Fähigkeit zu eigener Initiative und Verantwortung sowie zu hochwertiger Führung. Mandanten- und Serviceorientierung, Teamfähigkeit und Aufgeschlossenheit für Neues zählen ebenfalls zu den von uns besonders geschätzten Eigenschaften.",
        "Jede neue Kollegin und jeder neue Kollege mit diesen Eigenschaften trifft auf einen institutionellen Ansatz, der den Menschen in den Mittelpunkt des Arbeitsprozesses stellt und moderne Methoden zu seiner Förderung einsetzt.",
      ],
    },
    cta: {
      tr: "Özgeçmişinizi insan kaynakları adresimize iletebilirsiniz.",
      en: "You may send your CV to our human resources address.",
      de: "Sie können Ihren Lebenslauf an unsere Personaladresse senden.",
    },
  },
};

/* ---------------------------------------------------------------------------
   Homepage copy.
   The positioning sentence is new (v4 §3.12 / evidence #27): the live homepage
   opens on the Moliérac quotation with no statement of what the firm does.
   The quotation is kept, moved to second position.
   --------------------------------------------------------------------------- */
const home = {
  eyebrow: {
    tr: "İstanbul · 2004'ten bu yana",
    en: "Istanbul · Since 2004",
    de: "Istanbul · Seit 2004",
  },
  h1: {
    tr: "Taşınmaz hukukunda öğreti ve uygulama.",
    en: "Doctrine and practice in property law.",
    de: "Lehre und Praxis im Immobilienrecht.",
  },
  lede: {
    tr: "2004'ten bu yana İstanbul Barosu'na kayıtlı bir avukatlık ortaklığı olarak; kat mülkiyeti, arsa payı karşılığı inşaat, kentsel dönüşüm, tapu ve ipotek hukuku alanlarında taşınmaz sahiplerine, yüklenicilere, kooperatiflere, site yönetimlerine ve şirketlere hukuki danışmanlık ve avukatlık hizmeti veriyoruz.",
    en: "An attorney partnership registered with the Istanbul Bar Association since 2004, advising and representing property owners, contractors, cooperatives, building managements and companies in condominium law, land-share construction contracts, urban transformation, land registry and mortgage law.",
    de: "Eine seit 2004 bei der Anwaltskammer Istanbul eingetragene Anwaltspartnerschaft, die Grundeigentümer, Bauunternehmen, Genossenschaften, Hausverwaltungen und Unternehmen im Wohnungseigentumsrecht, bei Grundstücksanteil-Bauverträgen, in der Stadterneuerung sowie im Grundbuch- und Hypothekenrecht berät und vertritt.",
  },
  quote: {
    tr: "Görevimizi yaparken kimseye, ne müvekkile, ne hâkime, hele ne iktidara tabiyiz. Bizim aşağımızda kişilerin varlığı iddiasında değiliz. Fakat hiçbir hiyerarşik üst de tanımıyoruz. En kıdemsizin en kıdemliden, hatta isim yapmış olandan farkı yoktur. Avukatlar köle kullanmadılar, fakat efendileri de olmadı.",
    en: "In carrying out our duty we are subject to no one — neither to the client, nor to the judge, and least of all to those in power. We do not claim that anyone stands beneath us. But we recognise no hierarchical superior either. The most junior differs in nothing from the most senior, nor even from the celebrated. Lawyers have kept no slaves, but neither have they had masters.",
    de: "Bei der Erfüllung unserer Pflicht sind wir niemandem unterworfen — weder dem Mandanten noch dem Richter und am wenigsten der Macht. Wir behaupten nicht, dass jemand unter uns stünde. Doch erkennen wir auch keinen hierarchischen Vorgesetzten an. Der Jüngste unterscheidet sich in nichts vom Ältesten, ja nicht einmal vom Berühmten. Anwälte hielten keine Sklaven, doch hatten sie auch keine Herren.",
  },
  quoteBy: "Jean Moliérac",
  // Replaces the "Yasal Güvenceniz" heading (v4 §3.8).
  aboutHeading: {
    tr: "Ortaklığımız hakkında",
    en: "About the partnership",
    de: "Über die Partnerschaft",
  },
  stats: [
    // A year is not a quantity — counting up to it reads as a glitch.
    { n: 2004, suffix: "", count: false, l: { tr: "Kuruluş yılı — İstanbul Barosu'na kayıtlı ilk avukatlık ortaklıklarından biri", en: "Founded — among the first attorney partnerships registered with the Istanbul Bar", de: "Gegründet — eine der ersten bei der Anwaltskammer Istanbul eingetragenen Partnerschaften" } },
    { n: 46, suffix: "", l: { tr: "Yayımlanmış hukuk makalesi, büyük bölümü akademisyenlerle ortak", en: "Published legal articles, most co-authored with academics", de: "Veröffentlichte Fachaufsätze, überwiegend gemeinsam mit Hochschullehrern" } },
    { n: areas.length, suffix: "", l: { tr: "Hukuki danışmanlık ve dava takibi yürüttüğümüz çalışma alanı", en: "Practice areas in which we advise and litigate", de: "Tätigkeitsfelder in Beratung und Prozessführung" } },
    { n: 3, suffix: "", l: { tr: "Yayın ve iletişim dili: Türkçe, İngilizce, Almanca", en: "Languages of publication and correspondence: Turkish, English, German", de: "Sprachen für Veröffentlichung und Korrespondenz: Türkisch, Englisch, Deutsch" } },
  ],
};

module.exports = { LANGS, firm, routes, areas, pages, home };
