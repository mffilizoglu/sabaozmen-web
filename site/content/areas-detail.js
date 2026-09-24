"use strict";

/* Practice-area pages: overview, typical matters and key legislation.

   Informational in tone on purpose — the Union of Turkish Bar Associations'
   advertising rules allow describing fields of activity, not claims of
   expertise or results. Keep it that way when editing: no "leading",
   "best", "guaranteed", no case outcomes. */

const A = {};

A["gayrimenkul-hukuku-ve-kentsel-donusum"] = {
  tr: {
    intro: [
      "Gayrimenkul hukuku; taşınmaz mülkiyetinin kazanılması, devri, sınırlandırılması ve tapu siciline ilişkin kuralları kapsar. Satış vaadi ve satış sözleşmeleri, paylı ve elbirliği mülkiyet, tapu iptali ve tescil talepleri, ortaklığın giderilmesi ve önalım hakkı bu alanın başlıca konularıdır.",
      "Kentsel dönüşüm, 6306 sayılı Kanun uyarınca riskli yapıların ve alanların yenilenmesi sürecidir. Riskli yapı tespiti, malikler arasında salt çoğunlukla karar alınması, arsa payı karşılığı inşaat sözleşmeleri, kira yardımı ve hak sahipliği gibi konular, özellikle 7471 sayılı Kanun'la yapılan değişikliklerden sonra ayrıntılı bir hukuki değerlendirme gerektirir.",
    ],
    scope: [
      "Taşınmaz satış vaadi ve satış sözleşmelerinin hazırlanması ve incelenmesi",
      "Tapu iptali ve tescil, tescilin düzeltilmesi ve el atmanın önlenmesi davaları",
      "Ortaklığın giderilmesi (izale-i şuyu) ve yasal önalım (şufa) davaları",
      "Riskli yapı tespitine itiraz ve 6306 sayılı Kanun kapsamındaki süreçler",
      "Kentsel dönüşümde malikler kurulu kararları ve paydaş uyuşmazlıkları",
      "Tapu kayıtlarındaki şerh, ipotek ve sınırlı aynî hakların incelenmesi",
    ],
    laws: [
      "6306 sayılı Afet Riski Altındaki Alanların Dönüştürülmesi Hakkında Kanun",
      "4721 sayılı Türk Medeni Kanunu (eşya hukuku)",
      "2644 sayılı Tapu Kanunu",
      "6098 sayılı Türk Borçlar Kanunu",
    ],
  },
  en: {
    intro: [
      "Real estate law covers the acquisition, transfer and restriction of ownership of land and buildings and the rules of the land register. Promises to sell and contracts of sale, co-ownership and joint ownership, actions to cancel and correct registrations, partition and pre-emption rights are its main subjects.",
      "Urban regeneration is the renewal of risky buildings and areas under Law No. 6306. Risk assessments, decisions taken by a simple majority of owners, land-share-for-construction contracts, rent assistance and entitlement all call for careful legal assessment, particularly since the amendments made by Law No. 7471.",
    ],
    scope: [
      "Drafting and reviewing promises to sell and contracts for the sale of real property",
      "Actions for cancellation and registration, rectification of the register and trespass",
      "Partition of co-owned property and statutory pre-emption actions",
      "Objections to risk assessments and procedures under Law No. 6306",
      "Owners' decisions and disputes between co-owners in urban regeneration",
      "Review of annotations, mortgages and limited real rights in the land register",
    ],
    laws: [
      "Law No. 6306 on the Transformation of Areas under Disaster Risk",
      "Turkish Civil Code No. 4721 (property law)",
      "Land Registry Law No. 2644",
      "Turkish Code of Obligations No. 6098",
    ],
  },
  de: {
    intro: [
      "Das Immobilienrecht regelt Erwerb, Übertragung und Beschränkung des Grundeigentums sowie das Grundbuch. Kaufversprechen und Kaufverträge, Mit- und Gesamteigentum, Klagen auf Löschung und Berichtigung von Eintragungen, Teilungsklagen und Vorkaufsrechte gehören zu den Kernthemen.",
      "Stadterneuerung bezeichnet die Erneuerung gefährdeter Gebäude und Gebiete nach dem Gesetz Nr. 6306. Gefährdungsfeststellungen, Mehrheitsbeschlüsse der Eigentümer, Bauleistungsverträge gegen Grundstücksanteil, Mietbeihilfen und Anspruchsberechtigung erfordern — besonders nach den Änderungen durch das Gesetz Nr. 7471 — eine sorgfältige rechtliche Prüfung.",
    ],
    scope: [
      "Entwurf und Prüfung von Kaufversprechen und Grundstückskaufverträgen",
      "Klagen auf Löschung und Eintragung, Grundbuchberichtigung und Besitzstörung",
      "Aufhebung von Miteigentum und gesetzliche Vorkaufsrechte",
      "Einwendungen gegen Gefährdungsfeststellungen und Verfahren nach Gesetz Nr. 6306",
      "Eigentümerbeschlüsse und Streitigkeiten unter Miteigentümern bei der Stadterneuerung",
      "Prüfung von Vormerkungen, Hypotheken und beschränkten dinglichen Rechten",
    ],
    laws: [
      "Gesetz Nr. 6306 über die Umgestaltung katastrophengefährdeter Gebiete",
      "Türkisches Zivilgesetzbuch Nr. 4721 (Sachenrecht)",
      "Grundbuchgesetz Nr. 2644",
      "Türkisches Obligationengesetz Nr. 6098",
    ],
  },
};

A["kat-mulkiyeti-hukuku"] = {
  tr: {
    intro: [
      "Kat mülkiyeti hukuku, bir yapının bağımsız bölümleri üzerinde ayrı mülkiyet ve bu bölümlere bağlı arsa payı üzerinde paylı mülkiyet ilişkisini düzenler. Kat irtifakının ve kat mülkiyetinin kurulması, yönetim planı, ortak yerlerin kullanımı ve ortak giderlere katılma bu alanın temel konularıdır.",
      "Kat malikleri kurulu kararlarının iptali, aidat ve avans alacakları, ortak yerlere yapılan müdahaleler ve arsa paylarının düzeltilmesi, apartman ve sitelerde en sık karşılaşılan uyuşmazlıklardandır. 2023'ten bu yana Kat Mülkiyeti Kanunu'ndan doğan birçok uyuşmazlıkta dava açmadan önce arabulucuya başvurmak zorunludur.",
    ],
    scope: [
      "Kat irtifakı ve kat mülkiyetinin kurulması ve tapuya tescili",
      "Yönetim planlarının hazırlanması ve değiştirilmesi",
      "Kat malikleri kurulu kararlarının iptali davaları",
      "Ortak gider ve avans alacaklarının takibi",
      "Arsa payının düzeltilmesi ve ortak yerlere müdahalenin önlenmesi",
      "Kat mülkiyeti uyuşmazlıklarında dava şartı arabuluculuk süreçleri",
    ],
    laws: [
      "634 sayılı Kat Mülkiyeti Kanunu",
      "4721 sayılı Türk Medeni Kanunu (paylı mülkiyet)",
      "6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu",
    ],
  },
  en: {
    intro: [
      "Condominium law governs separate ownership of the independent units of a building and co-ownership of the land share attached to each unit. Creating floor easements and condominium ownership, the management plan, use of common areas and contributions to common expenses are its core subjects.",
      "Actions to annul owners' assembly decisions, service-charge and advance claims, interference with common areas and correction of land shares are among the most frequent disputes in apartment buildings and residential sites. Since 2023 many disputes under the Condominium Law must first go to mediation before a lawsuit can be filed.",
    ],
    scope: [
      "Establishing floor easements and condominium ownership and registering them",
      "Drafting and amending management plans",
      "Actions to annul decisions of the owners' assembly",
      "Recovering common-expense and advance contributions",
      "Correction of land shares and preventing interference with common areas",
      "Mandatory mediation in condominium disputes",
    ],
    laws: [
      "Condominium Law No. 634",
      "Turkish Civil Code No. 4721 (co-ownership)",
      "Law No. 6325 on Mediation in Civil Disputes",
    ],
  },
  de: {
    intro: [
      "Das Wohnungseigentumsrecht regelt das Sondereigentum an den Einheiten eines Gebäudes und das Miteigentum am zugehörigen Grundstücksanteil. Begründung von Wohnungseigentum und Stockwerksdienstbarkeit, Verwaltungsplan, Nutzung des Gemeinschaftseigentums und Beteiligung an den gemeinsamen Kosten sind die Kernthemen.",
      "Anfechtungen von Eigentümerbeschlüssen, Hausgeld- und Vorschussforderungen, Eingriffe in das Gemeinschaftseigentum und die Berichtigung von Grundstücksanteilen zählen zu den häufigsten Streitigkeiten. Seit 2023 ist bei vielen Streitigkeiten nach dem Wohnungseigentumsgesetz vor der Klage ein Mediationsversuch vorgeschrieben.",
    ],
    scope: [
      "Begründung und Eintragung von Stockwerksdienstbarkeit und Wohnungseigentum",
      "Erstellung und Änderung von Verwaltungsplänen",
      "Anfechtung von Beschlüssen der Eigentümerversammlung",
      "Beitreibung gemeinsamer Kosten und Vorschüsse",
      "Berichtigung von Grundstücksanteilen und Abwehr von Eingriffen in das Gemeinschaftseigentum",
      "Pflichtmediation bei Wohnungseigentumsstreitigkeiten",
    ],
    laws: [
      "Wohnungseigentumsgesetz Nr. 634",
      "Türkisches Zivilgesetzbuch Nr. 4721 (Miteigentum)",
      "Gesetz Nr. 6325 über die Mediation in Zivilsachen",
    ],
  },
};

A["toplu-yapilarda-yonetim-plani"] = {
  tr: {
    intro: [
      "Birden fazla bina ya da bloktan oluşan siteler, Kat Mülkiyeti Kanunu'nda \"toplu yapı\" olarak ayrıca düzenlenmiştir. Toplu yapılarda yönetim; blok temsilcileri kurulu, toplu yapı temsilciler kurulu ve yönetim planı üzerinden yürür.",
      "Yönetim planı, malikler arasında bir sözleşme niteliğindedir ve ortak alanların kullanımı, gider paylaşımı ile yönetim organlarının yetkilerini belirler. Site yönetimi ile hizmet sağlayıcılar arasındaki yönetim hizmet sözleşmeleri de bu kapsamdadır.",
    ],
    scope: [
      "Toplu yapı yönetim planlarının hazırlanması ve tapuya tescili",
      "Yönetim planı değişiklikleri ve bunlara ilişkin uyuşmazlıklar",
      "Temsilciler kurulu kararları ve bu kararların iptali",
      "Site yönetimi ile hizmet firmaları arasındaki yönetim hizmet sözleşmeleri",
      "Ortak tesis ve alanların kullanımı ile gider dağılımı",
    ],
    laws: [
      "634 sayılı Kat Mülkiyeti Kanunu, Ek Madde 66–74 (toplu yapılar)",
      "6098 sayılı Türk Borçlar Kanunu",
    ],
  },
  en: {
    intro: [
      "Residential sites made up of several buildings or blocks are regulated separately as \"collective buildings\" under the Condominium Law. They are managed through block representative boards, a collective-building representative board and a management plan.",
      "The management plan is contractual in nature: it sets out the use of common facilities, the allocation of costs and the powers of the management bodies. Management service contracts between a site and its service providers fall within this field too.",
    ],
    scope: [
      "Drafting and registering management plans for collective buildings",
      "Amendments to management plans and related disputes",
      "Decisions of representative boards and actions to annul them",
      "Management service contracts between sites and service companies",
      "Use of shared facilities and allocation of costs",
    ],
    laws: [
      "Condominium Law No. 634, Additional Articles 66–74 (collective buildings)",
      "Turkish Code of Obligations No. 6098",
    ],
  },
  de: {
    intro: [
      "Wohnanlagen aus mehreren Gebäuden oder Blöcken regelt das Wohnungseigentumsgesetz gesondert als \"Gesamtanlagen\". Verwaltet werden sie über Blockvertreterräte, einen Vertreterrat der Gesamtanlage und einen Verwaltungsplan.",
      "Der Verwaltungsplan hat vertraglichen Charakter und legt die Nutzung gemeinsamer Einrichtungen, die Kostenverteilung und die Befugnisse der Verwaltungsorgane fest. Auch Verwaltungsdienstleistungsverträge zwischen Anlagen und Dienstleistern gehören hierher.",
    ],
    scope: [
      "Erstellung und Eintragung von Verwaltungsplänen für Gesamtanlagen",
      "Änderungen von Verwaltungsplänen und damit verbundene Streitigkeiten",
      "Beschlüsse der Vertreterräte und deren Anfechtung",
      "Verwaltungsdienstleistungsverträge zwischen Anlagen und Dienstleistern",
      "Nutzung gemeinsamer Einrichtungen und Kostenverteilung",
    ],
    laws: [
      "Wohnungseigentumsgesetz Nr. 634, Zusatzartikel 66–74 (Gesamtanlagen)",
      "Türkisches Obligationengesetz Nr. 6098",
    ],
  },
};

A["insaat-hukuku"] = {
  tr: {
    intro: [
      "İnşaat hukuku, yapı yapım süreçlerinde taraflar arasındaki ilişkileri düzenler. Arsa sahibi ile yüklenici arasındaki arsa payı karşılığı inşaat sözleşmeleri, gelir paylaşımlı modeller ve eser sözleşmeleri bu alanın merkezindedir.",
      "Sözleşmenin kurulması ve şekli, gecikme ve ayıplı ifa, sözleşmenin feshi, yüklenicinin üçüncü kişilere yaptığı devirler ve bağımsız bölüm alıcılarının durumu uygulamada sık görülen sorunlardır. Yargıtay'ın 2025 tarihli içtihadı birleştirme kararı, yükleniciye yapılan erken tapu devirlerini yeniden gündeme getirmiştir.",
    ],
    scope: [
      "Arsa payı karşılığı inşaat ve gelir paylaşımlı sözleşmelerin hazırlanması",
      "Gecikme, eksik ve ayıplı iş nedeniyle doğan uyuşmazlıklar",
      "Sözleşmenin feshi ve sona ermesinin sonuçları",
      "Yüklenicinin üçüncü kişilere yaptığı temlik ve devirler",
      "Bağımsız bölüm alıcılarının hakları ve tapu devri talepleri",
      "Yapı ruhsatı, iskân ve yapı denetimine ilişkin hukuki sorunlar",
    ],
    laws: [
      "6098 sayılı Türk Borçlar Kanunu (eser sözleşmesi, m. 470 vd.)",
      "3194 sayılı İmar Kanunu",
      "4708 sayılı Yapı Denetimi Hakkında Kanun",
    ],
  },
  en: {
    intro: [
      "Construction law governs the relationships between the parties to a building project. Land-share-for-construction contracts between landowner and contractor, revenue-sharing models and contracts for work are at its centre.",
      "Formation and form of the contract, delay and defective performance, termination, the contractor's transfers to third parties and the position of unit buyers are frequent issues. The Court of Cassation's 2025 decision unifying case law has brought early title transfers to contractors back into focus.",
    ],
    scope: [
      "Drafting land-share-for-construction and revenue-sharing contracts",
      "Disputes over delay and incomplete or defective work",
      "Termination and the consequences of ending the contract",
      "Assignments and transfers by the contractor to third parties",
      "Rights of unit buyers and claims for transfer of title",
      "Legal issues of building permits, occupancy permits and building inspection",
    ],
    laws: [
      "Turkish Code of Obligations No. 6098 (contract for work, Art. 470 ff.)",
      "Zoning Law No. 3194",
      "Law No. 4708 on Building Inspection",
    ],
  },
  de: {
    intro: [
      "Das Baurecht regelt die Beziehungen der Beteiligten eines Bauvorhabens. Im Mittelpunkt stehen Bauleistungsverträge gegen Grundstücksanteil zwischen Eigentümer und Bauunternehmer, Erlösbeteiligungsmodelle und Werkverträge.",
      "Zustandekommen und Form des Vertrags, Verzug und mangelhafte Leistung, Kündigung, Übertragungen des Bauunternehmers an Dritte und die Stellung der Erwerber von Einheiten sind häufige Fragen. Die Vereinheitlichungsentscheidung des Kassationshofs von 2025 hat vorzeitige Eigentumsübertragungen an Bauunternehmer erneut in den Fokus gerückt.",
    ],
    scope: [
      "Entwurf von Bauleistungsverträgen gegen Grundstücksanteil und Erlösbeteiligung",
      "Streitigkeiten wegen Verzugs und unvollständiger oder mangelhafter Leistung",
      "Kündigung und Folgen der Vertragsbeendigung",
      "Abtretungen und Übertragungen des Bauunternehmers an Dritte",
      "Rechte der Erwerber und Ansprüche auf Eigentumsübertragung",
      "Rechtsfragen zu Baugenehmigung, Nutzungserlaubnis und Bauaufsicht",
    ],
    laws: [
      "Türkisches Obligationengesetz Nr. 6098 (Werkvertrag, Art. 470 ff.)",
      "Baugesetz Nr. 3194",
      "Gesetz Nr. 4708 über die Bauaufsicht",
    ],
  },
};

A["ticaret-ve-sirketler-hukuku"] = {
  tr: {
    intro: [
      "Ticaret ve şirketler hukuku, ticari işletmelerin ve şirketlerin kuruluşundan tasfiyesine kadar geçen süreçleri kapsar. Anonim ve limited şirketlerin kuruluşu, esas sözleşme değişiklikleri, pay devirleri ve genel kurul işlemleri bu alanın başlıca konularıdır.",
      "Ortaklar arasındaki uyuşmazlıklar, yönetim organlarının sorumluluğu ve ticari sözleşmeler de bu kapsamda değerlendirilir. Ticari davaların önemli bir bölümünde dava açmadan önce arabulucuya başvuru zorunludur.",
    ],
    scope: [
      "Şirket kuruluşu, esas sözleşme ve tadil işlemleri",
      "Pay devirleri ve ortaklık sözleşmeleri",
      "Genel kurul kararlarının iptali ve ortaklar arası uyuşmazlıklar",
      "Yönetim kurulu üyeleri ve müdürlerin sorumluluğu",
      "Ticari sözleşmelerin hazırlanması ve incelenmesi",
    ],
    laws: [
      "6102 sayılı Türk Ticaret Kanunu",
      "6098 sayılı Türk Borçlar Kanunu",
    ],
  },
  en: {
    intro: [
      "Commercial and corporate law covers the life of businesses and companies from formation to liquidation. Setting up joint-stock and limited companies, amending articles of association, share transfers and general-assembly procedures are its main subjects.",
      "Disputes between shareholders, the liability of management bodies and commercial contracts are also part of this field. For many commercial disputes, mediation is a precondition to filing a lawsuit.",
    ],
    scope: [
      "Company formation, articles of association and amendments",
      "Share transfers and shareholder agreements",
      "Actions to annul general-assembly resolutions and shareholder disputes",
      "Liability of board members and managers",
      "Drafting and reviewing commercial contracts",
    ],
    laws: [
      "Turkish Commercial Code No. 6102",
      "Turkish Code of Obligations No. 6098",
    ],
  },
  de: {
    intro: [
      "Das Handels- und Gesellschaftsrecht umfasst die Unternehmen und Gesellschaften von der Gründung bis zur Liquidation. Gründung von Aktiengesellschaften und GmbH, Satzungsänderungen, Anteilsübertragungen und Hauptversammlungen sind zentrale Themen.",
      "Auch Gesellschafterstreitigkeiten, die Haftung der Organe und Handelsverträge gehören dazu. Bei vielen Handelssachen ist vor der Klage ein Mediationsversuch vorgeschrieben.",
    ],
    scope: [
      "Gesellschaftsgründung, Satzung und Satzungsänderungen",
      "Anteilsübertragungen und Gesellschaftervereinbarungen",
      "Anfechtung von Hauptversammlungsbeschlüssen und Gesellschafterstreitigkeiten",
      "Haftung von Vorstandsmitgliedern und Geschäftsführern",
      "Entwurf und Prüfung von Handelsverträgen",
    ],
    laws: [
      "Türkisches Handelsgesetzbuch Nr. 6102",
      "Türkisches Obligationengesetz Nr. 6098",
    ],
  },
};

A["sozlesmeler-hukuku"] = {
  tr: {
    intro: [
      "Sözleşmeler hukuku, tarafların hak ve yükümlülüklerini belirleyen sözleşmelerin kurulması, yorumlanması ve ifasıyla ilgilidir. Sözleşmenin şekli, geçerliliği, ifa ve temerrüt, uyarlama ile sona erme bu alanın temel başlıklarıdır.",
      "Özellikle taşınmazlara ilişkin sözleşmelerde resmî şekil şartı, alacağın devri ve ortaklık ilişkileri uygulamada önemli sonuçlar doğurur. Sözleşme metninin baştan doğru kurulması, ileride doğabilecek uyuşmazlıkların önüne geçmenin en etkili yoludur.",
    ],
    scope: [
      "Sözleşmelerin hazırlanması, incelenmesi ve müzakeresi",
      "Temerrüt, ifa imkânsızlığı ve tazminat talepleri",
      "Aşırı ifa güçlüğü nedeniyle sözleşmenin uyarlanması",
      "Alacağın devri ve borcun üstlenilmesi",
      "Adi ortaklık sözleşmeleri ve ortaklar arası ilişkiler",
    ],
    laws: [
      "6098 sayılı Türk Borçlar Kanunu",
      "4721 sayılı Türk Medeni Kanunu",
    ],
  },
  en: {
    intro: [
      "Contract law deals with the formation, interpretation and performance of the agreements that define the parties' rights and duties. Form and validity, performance and default, adaptation and termination are its core headings.",
      "In contracts concerning real property in particular, the requirement of official form, the assignment of claims and partnership relationships have significant consequences. Getting the contract right from the outset is the most effective way to prevent later disputes.",
    ],
    scope: [
      "Drafting, reviewing and negotiating contracts",
      "Default, impossibility of performance and damages claims",
      "Adaptation of contracts for excessive hardship",
      "Assignment of claims and assumption of debt",
      "Simple partnership agreements and relations between partners",
    ],
    laws: [
      "Turkish Code of Obligations No. 6098",
      "Turkish Civil Code No. 4721",
    ],
  },
  de: {
    intro: [
      "Das Vertragsrecht befasst sich mit Abschluss, Auslegung und Erfüllung der Verträge, die Rechte und Pflichten der Parteien bestimmen. Form und Wirksamkeit, Erfüllung und Verzug, Anpassung und Beendigung sind zentrale Themen.",
      "Besonders bei Immobilienverträgen haben das Erfordernis der öffentlichen Form, die Forderungsabtretung und Gesellschaftsverhältnisse erhebliche Folgen. Ein von Anfang an sorgfältig gestalteter Vertrag beugt späteren Streitigkeiten am wirksamsten vor.",
    ],
    scope: [
      "Entwurf, Prüfung und Verhandlung von Verträgen",
      "Verzug, Unmöglichkeit und Schadensersatzansprüche",
      "Vertragsanpassung wegen übermäßiger Erschwerung",
      "Forderungsabtretung und Schuldübernahme",
      "Verträge einfacher Gesellschaften und Beziehungen der Gesellschafter",
    ],
    laws: [
      "Türkisches Obligationengesetz Nr. 6098",
      "Türkisches Zivilgesetzbuch Nr. 4721",
    ],
  },
};

A["arabuluculuk"] = {
  tr: {
    intro: [
      "Arabuluculuk, uyuşmazlığın tarafsız bir üçüncü kişinin yardımıyla, tarafların kendi iradeleriyle çözülmesini sağlayan bir yöntemdir. Ticari, işçi-işveren ve tüketici uyuşmazlıklarının yanı sıra 2023'ten itibaren kira, ortaklığın giderilmesi, kat mülkiyeti ve komşuluk hukukundan doğan uyuşmazlıklarda da dava açmadan önce arabulucuya başvurmak zorunludur.",
      "Arabuluculuk sürecinde taraf vekili olarak hazırlık, müzakere ve anlaşma belgesinin hazırlanması, sonucun icra edilebilirliği bakımından belirleyicidir.",
    ],
    scope: [
      "Dava şartı arabuluculuk süreçlerinde taraf vekilliği",
      "İhtiyari arabuluculuk ve müzakere süreçleri",
      "Kat mülkiyeti ve ortaklığın giderilmesi uyuşmazlıklarında arabuluculuk",
      "Anlaşma belgelerinin hazırlanması ve icra edilebilirlik şerhi",
    ],
    laws: [
      "6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu",
      "7445 sayılı Kanun (2023 değişiklikleri)",
      "7036 sayılı İş Mahkemeleri Kanunu",
      "6102 sayılı Türk Ticaret Kanunu, m. 5/A",
    ],
  },
  en: {
    intro: [
      "Mediation lets the parties resolve a dispute themselves with the help of a neutral third party. Besides commercial, employment and consumer disputes, since 2023 mediation is also mandatory before litigation in tenancy, partition, condominium and neighbour-law disputes.",
      "As counsel in mediation, preparation, negotiation and drafting the settlement agreement are decisive for whether the outcome can be enforced.",
    ],
    scope: [
      "Acting for parties in mandatory mediation",
      "Voluntary mediation and negotiation",
      "Mediation in condominium and partition disputes",
      "Drafting settlement agreements and obtaining enforceability",
    ],
    laws: [
      "Law No. 6325 on Mediation in Civil Disputes",
      "Law No. 7445 (2023 amendments)",
      "Labour Courts Law No. 7036",
      "Turkish Commercial Code No. 6102, Art. 5/A",
    ],
  },
  de: {
    intro: [
      "Mediation ermöglicht es den Parteien, einen Streit mit Hilfe eines neutralen Dritten selbst zu lösen. Neben Handels-, Arbeits- und Verbrauchersachen ist seit 2023 auch in Miet-, Teilungs-, Wohnungseigentums- und Nachbarrechtsstreitigkeiten vor der Klage eine Mediation vorgeschrieben.",
      "Als Parteivertreter entscheiden Vorbereitung, Verhandlung und die Abfassung der Vereinbarung darüber, ob das Ergebnis vollstreckbar ist.",
    ],
    scope: [
      "Vertretung in der Pflichtmediation",
      "Freiwillige Mediation und Verhandlungen",
      "Mediation in Wohnungseigentums- und Teilungsstreitigkeiten",
      "Abfassung von Vereinbarungen und Vollstreckbarerklärung",
    ],
    laws: [
      "Gesetz Nr. 6325 über die Mediation in Zivilsachen",
      "Gesetz Nr. 7445 (Änderungen 2023)",
      "Arbeitsgerichtsgesetz Nr. 7036",
      "Türkisches Handelsgesetzbuch Nr. 6102, Art. 5/A",
    ],
  },
};

A["imar-hukuku"] = {
  tr: {
    intro: [
      "İmar hukuku, yerleşim alanlarının planlanmasını ve yapılaşmayı düzenleyen kuralları kapsar. İmar planları, parselasyon işlemleri, yapı ruhsatı ve yapı kullanma izni bu alanın temel konularıdır.",
      "İmar planlarına ve uygulama işlemlerine karşı idari yargıda açılan iptal davaları, düzenleme ortaklık payı kesintileri, plan kısıtlılığı ve imar hakkı aktarımı, taşınmaz sahiplerinin haklarını doğrudan etkileyen başlıklardır.",
    ],
    scope: [
      "İmar planlarına ve parselasyon işlemlerine karşı iptal davaları",
      "Yapı ruhsatı ve yapı kullanma izni süreçleri",
      "Kaçak yapı ve yıkım kararlarına itiraz",
      "Plan kısıtlılığı ve imar hakkı aktarımı",
      "Düzenleme ortaklık payı uyuşmazlıkları",
    ],
    laws: [
      "3194 sayılı İmar Kanunu",
      "Planlı Alanlar İmar Yönetmeliği",
      "2577 sayılı İdari Yargılama Usulü Kanunu",
    ],
  },
  en: {
    intro: [
      "Zoning law covers the rules on planning settlements and on building. Zoning plans, land readjustment, building permits and occupancy permits are its core subjects.",
      "Annulment actions in the administrative courts against plans and their implementation, land-readjustment deductions, plan restrictions and the transfer of development rights directly affect property owners' rights.",
    ],
    scope: [
      "Annulment actions against zoning plans and land readjustment",
      "Building permit and occupancy permit procedures",
      "Challenging unauthorised-building and demolition decisions",
      "Plan restrictions and transfer of development rights",
      "Disputes over land-readjustment deductions",
    ],
    laws: [
      "Zoning Law No. 3194",
      "Regulation on Zoning in Planned Areas",
      "Administrative Procedure Law No. 2577",
    ],
  },
  de: {
    intro: [
      "Das Baurecht im öffentlichen Sinn regelt die Planung von Siedlungsflächen und die Bebauung. Bebauungspläne, Umlegung, Baugenehmigung und Nutzungserlaubnis sind die Kernthemen.",
      "Anfechtungsklagen vor den Verwaltungsgerichten gegen Pläne und deren Umsetzung, Umlegungsabzüge, Planbeschränkungen und die Übertragung von Baurechten berühren die Rechte der Eigentümer unmittelbar.",
    ],
    scope: [
      "Anfechtungsklagen gegen Bebauungspläne und Umlegungen",
      "Verfahren zu Baugenehmigung und Nutzungserlaubnis",
      "Rechtsbehelfe gegen Schwarzbau- und Abrissverfügungen",
      "Planbeschränkungen und Übertragung von Baurechten",
      "Streitigkeiten über Umlegungsabzüge",
    ],
    laws: [
      "Baugesetz Nr. 3194",
      "Verordnung über Bauen in beplanten Gebieten",
      "Verwaltungsprozessgesetz Nr. 2577",
    ],
  },
};

A["kamulastirma-hukuku"] = {
  tr: {
    intro: [
      "Kamulaştırma, kamu yararının gerektirdiği hallerde özel mülkiyetteki taşınmazın bedeli ödenerek idare tarafından edinilmesidir. Süreç, kamu yararı kararından başlayarak bedelin tespiti ve tescil davasıyla tamamlanır.",
      "Kamulaştırma bedelinin tespiti, kamulaştırma işlemine karşı iptal davaları ve idarenin kamulaştırma yapmadan taşınmaza el atması halinde açılan davalar, Anayasa Mahkemesi'nin son kararlarıyla birlikte önemli değişiklikler geçirmiştir.",
    ],
    scope: [
      "Kamulaştırma bedelinin tespiti ve tescil davaları",
      "Kamulaştırma işlemine karşı idari yargıda iptal davaları",
      "Kamulaştırmasız el atma nedeniyle tazminat davaları",
      "Uzlaşma görüşmeleri ve bedel artırım talepleri",
      "Plan kısıtlılığı nedeniyle doğan talepler",
    ],
    laws: [
      "2942 sayılı Kamulaştırma Kanunu",
      "Türkiye Cumhuriyeti Anayasası, m. 46",
    ],
  },
  en: {
    intro: [
      "Expropriation is the acquisition of privately owned property by the State for public purposes against compensation. The process runs from the public-interest decision through to the action for valuation and registration.",
      "Valuation, annulment actions against expropriation and claims where the authority takes possession without expropriating (de facto expropriation) have changed considerably following recent Constitutional Court decisions.",
    ],
    scope: [
      "Actions for valuation and registration of expropriated property",
      "Annulment actions against expropriation in the administrative courts",
      "Compensation for de facto expropriation",
      "Settlement negotiations and claims for higher compensation",
      "Claims arising from plan restrictions",
    ],
    laws: [
      "Expropriation Law No. 2942",
      "Constitution of the Republic of Türkiye, Art. 46",
    ],
  },
  de: {
    intro: [
      "Enteignung ist der Erwerb von Privateigentum durch den Staat für öffentliche Zwecke gegen Entschädigung. Das Verfahren reicht vom Beschluss über das öffentliche Interesse bis zur Klage auf Festsetzung der Entschädigung und Eintragung.",
      "Die Festsetzung der Entschädigung, Anfechtungsklagen gegen Enteignungen und Ansprüche bei Inbesitznahme ohne Enteignung (faktische Enteignung) haben sich durch neuere Entscheidungen des Verfassungsgerichts erheblich verändert.",
    ],
    scope: [
      "Klagen auf Festsetzung der Entschädigung und Eintragung",
      "Anfechtungsklagen gegen Enteignungen vor den Verwaltungsgerichten",
      "Entschädigung bei faktischer Enteignung",
      "Vergleichsverhandlungen und Ansprüche auf höhere Entschädigung",
      "Ansprüche aus Planbeschränkungen",
    ],
    laws: [
      "Enteignungsgesetz Nr. 2942",
      "Verfassung der Republik Türkei, Art. 46",
    ],
  },
};

A["kadastro-hukuku"] = {
  tr: {
    intro: [
      "Kadastro, taşınmazların sınırlarının ve hukuki durumlarının belirlenerek tapu siciline kaydedilmesi işlemidir. Kadastro tespitine itiraz, tespit tarihinden önceki sebeplere dayanan davalar ve sınır uyuşmazlıkları bu alanın temel konularıdır.",
      "Tapu sicilinin hatalı tutulmasından doğan zararlarda Devlet'in sorumluluğu ve sicildeki hataların düzeltilmesi de kadastro hukuku kapsamında değerlendirilir.",
    ],
    scope: [
      "Kadastro tespitine itiraz ve kadastro mahkemesi davaları",
      "Tapu iptali ve tescil, sınır ve yüzölçümü düzeltme davaları",
      "Tapu sicilinin hatalı tutulmasından doğan tazminat davaları",
      "Hazine ve orman kadastrosuna ilişkin uyuşmazlıklar",
    ],
    laws: [
      "3402 sayılı Kadastro Kanunu",
      "2644 sayılı Tapu Kanunu",
      "4721 sayılı Türk Medeni Kanunu, m. 1007",
    ],
  },
  en: {
    intro: [
      "Cadastre is the process of establishing the boundaries and legal status of land and entering them in the land register. Objections to cadastral surveys, claims based on grounds predating the survey and boundary disputes are its core subjects.",
      "The State's liability for loss caused by errors in the land register, and correcting such errors, are also part of cadastral law.",
    ],
    scope: [
      "Objections to cadastral surveys and cadastral court proceedings",
      "Cancellation and registration, boundary and area correction actions",
      "Compensation claims for errors in the land register",
      "Disputes involving Treasury land and forest cadastre",
    ],
    laws: [
      "Cadastre Law No. 3402",
      "Land Registry Law No. 2644",
      "Turkish Civil Code No. 4721, Art. 1007",
    ],
  },
  de: {
    intro: [
      "Das Kataster erfasst die Grenzen und die Rechtsverhältnisse von Grundstücken und überträgt sie ins Grundbuch. Einwendungen gegen die Katasteraufnahme, Ansprüche aus Gründen vor der Aufnahme und Grenzstreitigkeiten sind die Kernthemen.",
      "Auch die Haftung des Staates für Schäden aus fehlerhafter Grundbuchführung und die Berichtigung solcher Fehler gehören zum Katasterrecht.",
    ],
    scope: [
      "Einwendungen gegen die Katasteraufnahme und Verfahren vor dem Katastergericht",
      "Klagen auf Löschung und Eintragung, Grenz- und Flächenberichtigung",
      "Schadensersatz wegen fehlerhafter Grundbuchführung",
      "Streitigkeiten über Staatsland und Waldkataster",
    ],
    laws: [
      "Katastergesetz Nr. 3402",
      "Grundbuchgesetz Nr. 2644",
      "Türkisches Zivilgesetzbuch Nr. 4721, Art. 1007",
    ],
  },
};

A["kooperatifler-hukuku"] = {
  tr: {
    intro: [
      "Kooperatifler hukuku, özellikle konut yapı kooperatiflerinin kuruluşu, yönetimi ve tasfiyesini düzenler. Ortaklık hakları, aidat ve ek ödeme yükümlülükleri, genel kurul kararları ve yönetim kurulunun sorumluluğu başlıca konulardır.",
      "Kooperatif üyeliği yoluyla taşınmaz edinmede, özellikle arazi payı veya kooperatif üyeliği vaadiyle yapılan satışlarda, yatırımcıların hukuki riskleri dikkatle değerlendirilmelidir.",
    ],
    scope: [
      "Konut yapı kooperatiflerinde ortaklık hakları ve üyelikten çıkarma",
      "Genel kurul kararlarının iptali",
      "Yönetim kurulu üyelerinin sorumluluğu",
      "Kooperatif tasfiyesi ve konut tahsisine ilişkin uyuşmazlıklar",
    ],
    laws: [
      "1163 sayılı Kooperatifler Kanunu",
    ],
  },
  en: {
    intro: [
      "Cooperative law governs the formation, management and liquidation of cooperatives, housing cooperatives in particular. Members' rights, contributions and additional payments, general-assembly resolutions and the liability of the board are the main subjects.",
      "Where property is acquired through cooperative membership — especially when land shares or memberships are sold with promises — investors' legal risks call for careful assessment.",
    ],
    scope: [
      "Members' rights and expulsion in housing cooperatives",
      "Actions to annul general-assembly resolutions",
      "Liability of board members",
      "Liquidation of cooperatives and disputes over allocation of homes",
    ],
    laws: [
      "Cooperatives Law No. 1163",
    ],
  },
  de: {
    intro: [
      "Das Genossenschaftsrecht regelt Gründung, Verwaltung und Liquidation von Genossenschaften, insbesondere Wohnungsbaugenossenschaften. Mitgliedschaftsrechte, Beiträge und Nachschüsse, Beschlüsse der Generalversammlung und die Haftung des Vorstands sind zentrale Themen.",
      "Beim Erwerb von Immobilien über Genossenschaftsmitgliedschaften — vor allem bei Verkäufen mit Versprechen — sind die rechtlichen Risiken für Anleger sorgfältig zu prüfen.",
    ],
    scope: [
      "Mitgliedschaftsrechte und Ausschluss in Wohnungsbaugenossenschaften",
      "Anfechtung von Beschlüssen der Generalversammlung",
      "Haftung der Vorstandsmitglieder",
      "Liquidation und Streitigkeiten über die Zuteilung von Wohnungen",
    ],
    laws: [
      "Genossenschaftsgesetz Nr. 1163",
    ],
  },
};

A["barter-mortgage-tasinmaz-rehni-ve-ipotek"] = {
  tr: {
    intro: [
      "Taşınmaz rehni (ipotek), bir alacağı güvence altına almak için taşınmaz üzerinde kurulan sınırlı aynî haktır. Konut kredilerinde (mortgage) ve ticari finansmanda ipotek, en yaygın teminat türüdür.",
      "Takas (trampa) yoluyla taşınmaz edinme, ipotek tesisi ve fekki, ipoteğin paraya çevrilmesi yoluyla takip ve bu süreçlerde doğan uyuşmazlıklar bu alanın kapsamındadır.",
    ],
    scope: [
      "İpotek tesisi, derece ve fek işlemleri",
      "Konut finansmanı (mortgage) sözleşmelerinin incelenmesi",
      "İpoteğin paraya çevrilmesi yoluyla takip ve itirazlar",
      "Takas (trampa) sözleşmeleri",
    ],
    laws: [
      "4721 sayılı Türk Medeni Kanunu, m. 850 vd. (taşınmaz rehni)",
      "5582 sayılı Konut Finansmanı Sistemine İlişkin Çeşitli Kanunlarda Değişiklik Yapılması Hakkında Kanun",
      "2004 sayılı İcra ve İflas Kanunu",
    ],
  },
  en: {
    intro: [
      "A mortgage (taşınmaz rehni, ipotek) is a limited real right over land that secures a debt. It is the most common form of security in home loans and commercial finance.",
      "Acquiring property by exchange (barter), creating and releasing mortgages, enforcement by realising a mortgage and the disputes that arise along the way fall within this field.",
    ],
    scope: [
      "Creating, ranking and releasing mortgages",
      "Reviewing housing finance (mortgage) agreements",
      "Enforcement by realisation of a mortgage and objections",
      "Exchange (barter) contracts",
    ],
    laws: [
      "Turkish Civil Code No. 4721, Art. 850 ff. (charges on land)",
      "Law No. 5582 Amending Various Laws on the Housing Finance System",
      "Enforcement and Bankruptcy Law No. 2004",
    ],
  },
  de: {
    intro: [
      "Die Grundpfandverschreibung (Hypothek) ist ein beschränktes dingliches Recht an einem Grundstück zur Sicherung einer Forderung. Sie ist die häufigste Sicherheit bei Wohnungsbaukrediten und in der Unternehmensfinanzierung.",
      "Erwerb durch Tausch, Bestellung und Löschung von Hypotheken, die Zwangsvollstreckung aus Grundpfandrechten und die dabei entstehenden Streitigkeiten gehören in diesen Bereich.",
    ],
    scope: [
      "Bestellung, Rang und Löschung von Hypotheken",
      "Prüfung von Wohnungsbaufinanzierungsverträgen",
      "Vollstreckung aus Grundpfandrechten und Einwendungen",
      "Tauschverträge",
    ],
    laws: [
      "Türkisches Zivilgesetzbuch Nr. 4721, Art. 850 ff. (Grundpfand)",
      "Gesetz Nr. 5582 zur Änderung von Gesetzen über das Wohnungsbaufinanzierungssystem",
      "Vollstreckungs- und Konkursgesetz Nr. 2004",
    ],
  },
};

A["gayrimenkul-yatirim-ortakligi"] = {
  tr: {
    intro: [
      "Gayrimenkul yatırım ortaklıkları (GYO), gayrimenkul, gayrimenkule dayalı sermaye piyasası araçları ve projelerden oluşan portföyü işletmek amacıyla kurulan sermaye piyasası kurumlarıdır.",
      "GYO'ların kuruluşu, esas sözleşmeleri, portföy sınırlamaları ve Sermaye Piyasası Kurulu'na karşı yükümlülükleri özel bir mevzuata tabidir.",
    ],
    scope: [
      "GYO kuruluş ve esas sözleşme süreçlerinde danışmanlık",
      "Portföy işlemleri ve gayrimenkul projelerinin sözleşme yapısı",
      "Sermaye piyasası mevzuatına uyum",
    ],
    laws: [
      "6362 sayılı Sermaye Piyasası Kanunu",
      "Gayrimenkul Yatırım Ortaklıklarına İlişkin Esaslar Tebliği (III-48.1)",
    ],
  },
  en: {
    intro: [
      "Real estate investment trusts (REITs, GYO) are capital-market institutions set up to manage portfolios of real estate, real-estate-based capital-market instruments and projects.",
      "Their formation, articles of association, portfolio limits and obligations towards the Capital Markets Board are governed by specific legislation.",
    ],
    scope: [
      "Advice on REIT formation and articles of association",
      "Portfolio transactions and the contractual structure of real estate projects",
      "Compliance with capital-markets legislation",
    ],
    laws: [
      "Capital Markets Law No. 6362",
      "Communiqué on Principles for Real Estate Investment Trusts (III-48.1)",
    ],
  },
  de: {
    intro: [
      "Immobilien-Investmentgesellschaften (REIT, GYO) sind Kapitalmarktinstitute, die Portfolios aus Immobilien, immobilienbasierten Kapitalmarktinstrumenten und Projekten verwalten.",
      "Gründung, Satzung, Portfoliogrenzen und Pflichten gegenüber der Kapitalmarktaufsicht unterliegen besonderen Vorschriften.",
    ],
    scope: [
      "Beratung bei Gründung und Satzung",
      "Portfoliotransaktionen und Vertragsstruktur von Immobilienprojekten",
      "Einhaltung des Kapitalmarktrechts",
    ],
    laws: [
      "Kapitalmarktgesetz Nr. 6362",
      "Kommuniqué über Immobilien-Investmentgesellschaften (III-48.1)",
    ],
  },
};

A["orman-hukuku-ve-2b"] = {
  tr: {
    intro: [
      "Orman hukuku, orman sayılan yerlerin korunmasını ve orman sınırlarının belirlenmesini düzenler. Orman kadastrosuna itiraz ve orman sınırı dışına çıkarılan yerler bu alanın başlıca konularıdır.",
      "Bilim ve fen bakımından orman niteliğini kaybettiği için orman sınırları dışına çıkarılan \"2B\" arazilerinin hak sahiplerine satışı, 6292 sayılı Kanun ile düzenlenmiştir.",
    ],
    scope: [
      "Orman kadastrosuna itiraz ve orman sınırı davaları",
      "2B arazilerinde hak sahipliği ve satış süreçleri",
      "Hazine ile kullanıcılar arasındaki uyuşmazlıklar",
    ],
    laws: [
      "6831 sayılı Orman Kanunu",
      "6292 sayılı Kanun (2B arazileri)",
    ],
  },
  en: {
    intro: [
      "Forestry law protects land classed as forest and governs how forest boundaries are drawn. Objections to forest cadastre and land removed from forest boundaries are its main subjects.",
      "The sale to entitled users of \"2B\" land — removed from forest boundaries because it has lost its forest character — is regulated by Law No. 6292.",
    ],
    scope: [
      "Objections to forest cadastre and forest boundary actions",
      "Entitlement and sale procedures for 2B land",
      "Disputes between the Treasury and users",
    ],
    laws: [
      "Forest Law No. 6831",
      "Law No. 6292 (2B land)",
    ],
  },
  de: {
    intro: [
      "Das Forstrecht schützt als Wald eingestufte Flächen und regelt die Festlegung der Waldgrenzen. Einwendungen gegen das Waldkataster und aus den Waldgrenzen herausgenommene Flächen sind zentrale Themen.",
      "Der Verkauf der sogenannten \"2B\"-Flächen, die ihren Waldcharakter verloren haben, an die Berechtigten ist im Gesetz Nr. 6292 geregelt.",
    ],
    scope: [
      "Einwendungen gegen das Waldkataster und Waldgrenzklagen",
      "Berechtigung und Verkaufsverfahren für 2B-Flächen",
      "Streitigkeiten zwischen Staatskasse und Nutzern",
    ],
    laws: [
      "Forstgesetz Nr. 6831",
      "Gesetz Nr. 6292 (2B-Flächen)",
    ],
  },
};

A["devre-mulk-ve-devre-tatil-hukuku"] = {
  tr: {
    intro: [
      "Devre mülk, bir bağımsız bölüm üzerinde yılın belirli dönemlerinde kullanım hakkı veren ve tapuya kaydedilen bir irtifak hakkıdır; devre tatil ise çoğunlukla tapu kaydı olmayan, sözleşmeye dayalı bir kullanım hakkıdır.",
      "Devre tatil sözleşmeleri tüketici mevzuatında özel olarak düzenlenmiştir: cayma hakkı, ön bilgilendirme ve ödeme yasağı gibi kurallar tüketiciyi korur. Devre mülkün vergi ve kira hukukundaki sonuçları da ayrıca değerlendirilmelidir.",
    ],
    scope: [
      "Devre mülk hakkının kurulması ve devri",
      "Devre tatil sözleşmelerinde cayma, fesih ve iade talepleri",
      "Tüketici hakem heyeti ve tüketici mahkemesi süreçleri",
      "Devre mülkün vergi ve kiralama boyutları",
    ],
    laws: [
      "634 sayılı Kat Mülkiyeti Kanunu, m. 57–64 (devre mülk)",
      "6502 sayılı Tüketicinin Korunması Hakkında Kanun",
      "Devre Tatil ve Uzun Süreli Tatil Hizmeti Sözleşmeleri Yönetmeliği",
    ],
  },
  en: {
    intro: [
      "A timeshare (devre mülk) is a registered easement giving the right to use a unit for set periods each year; a timeshare holiday (devre tatil) is usually an unregistered contractual right of use.",
      "Timeshare-holiday contracts are regulated in consumer law: rules on withdrawal, pre-contractual information and the ban on advance payments protect the consumer. The tax and tenancy consequences of timeshares also need separate assessment.",
    ],
    scope: [
      "Creating and transferring timeshare rights",
      "Withdrawal, termination and refund claims under timeshare-holiday contracts",
      "Consumer arbitration committee and consumer court proceedings",
      "Tax and letting aspects of timeshares",
    ],
    laws: [
      "Condominium Law No. 634, Arts. 57–64 (timeshare)",
      "Consumer Protection Law No. 6502",
      "Regulation on Timeshare and Long-term Holiday Contracts",
    ],
  },
  de: {
    intro: [
      "Das Timesharing-Eigentum (devre mülk) ist eine eingetragene Dienstbarkeit mit einem Nutzungsrecht an einer Einheit zu bestimmten Zeiten; das Timesharing-Urlaubsrecht (devre tatil) ist meist ein nicht eingetragenes vertragliches Nutzungsrecht.",
      "Timesharing-Verträge sind im Verbraucherrecht besonders geregelt: Widerrufsrecht, vorvertragliche Information und Anzahlungsverbot schützen die Verbraucher. Steuer- und mietrechtliche Folgen sind gesondert zu prüfen.",
    ],
    scope: [
      "Begründung und Übertragung von Timesharing-Rechten",
      "Widerruf, Kündigung und Rückforderung bei Timesharing-Verträgen",
      "Verfahren vor Verbraucherschlichtungsstellen und Verbrauchergerichten",
      "Steuer- und Vermietungsfragen beim Timesharing",
    ],
    laws: [
      "Wohnungseigentumsgesetz Nr. 634, Art. 57–64 (Timesharing)",
      "Verbraucherschutzgesetz Nr. 6502",
      "Verordnung über Timesharing- und langfristige Urlaubsverträge",
    ],
  },
};

A["yabancilara-tasinmaz-satisi"] = {
  tr: {
    intro: [
      "Yabancı uyruklu gerçek kişiler ve yabancı sermayeli şirketler, Türkiye'de kanunda öngörülen sınırlamalar çerçevesinde taşınmaz edinebilir. Edinim süreci; tapu işlemleri, değerleme raporu ve askerî yasak bölgeler gibi kontrolleri içerir.",
      "Taşınmaz edinimi yoluyla Türk vatandaşlığı başvurusu, belirli bir değerin üzerindeki alımlarda ayrı şartlara bağlıdır.",
    ],
    scope: [
      "Yabancıların taşınmaz ediniminde hukuki inceleme ve tapu süreçleri",
      "Satış öncesi tapu kaydı ve imar durumunun incelenmesi",
      "Yatırım yoluyla vatandaşlık başvurularına ilişkin hukuki süreçler",
    ],
    laws: [
      "2644 sayılı Tapu Kanunu, m. 35",
      "5901 sayılı Türk Vatandaşlığı Kanunu",
    ],
  },
  en: {
    intro: [
      "Foreign individuals and foreign-capital companies may acquire real property in Türkiye within the limits set by law. The process involves land-registry procedures, a valuation report and checks such as military restricted zones.",
      "Applying for Turkish citizenship through property acquisition is subject to separate conditions for purchases above a set value.",
    ],
    scope: [
      "Legal due diligence and land-registry procedures for foreign buyers",
      "Pre-purchase review of the title and zoning status",
      "Legal steps in citizenship-by-investment applications",
    ],
    laws: [
      "Land Registry Law No. 2644, Art. 35",
      "Turkish Citizenship Law No. 5901",
    ],
  },
  de: {
    intro: [
      "Ausländische natürliche Personen und Gesellschaften mit Auslandskapital können in der Türkei innerhalb gesetzlicher Grenzen Immobilien erwerben. Dazu gehören Grundbuchverfahren, ein Bewertungsgutachten und Prüfungen etwa militärischer Sperrgebiete.",
      "Die Einbürgerung über einen Immobilienerwerb ist bei Käufen ab einem bestimmten Wert an gesonderte Voraussetzungen geknüpft.",
    ],
    scope: [
      "Rechtliche Prüfung und Grundbuchverfahren für ausländische Käufer",
      "Prüfung von Grundbuchlage und Bebauungsstatus vor dem Kauf",
      "Rechtliche Schritte bei der Einbürgerung durch Investition",
    ],
    laws: [
      "Grundbuchgesetz Nr. 2644, Art. 35",
      "Türkisches Staatsangehörigkeitsgesetz Nr. 5901",
    ],
  },
};

A["tahkim"] = {
  tr: {
    intro: [
      "Tahkim, tarafların uyuşmazlıklarını devlet mahkemeleri yerine seçtikleri hakemlere çözdürmeleridir. Ticari sözleşmelerde ve inşaat projelerinde tahkim şartı sıkça yer alır.",
      "Tahkim sözleşmesinin kurulması, hakem seçimi, yargılama süreci ve hakem kararının iptali ya da tanınması ve tenfizi bu alanın başlıca konularıdır.",
    ],
    scope: [
      "Tahkim şartlarının hazırlanması",
      "Ulusal ve milletlerarası tahkim yargılamalarında taraf vekilliği",
      "Hakem kararlarının iptali ve yabancı hakem kararlarının tenfizi",
    ],
    laws: [
      "6100 sayılı Hukuk Muhakemeleri Kanunu, m. 407–444",
      "4686 sayılı Milletlerarası Tahkim Kanunu",
    ],
  },
  en: {
    intro: [
      "In arbitration, the parties have their dispute decided by arbitrators of their choosing rather than the state courts. Arbitration clauses are common in commercial contracts and construction projects.",
      "Drafting the arbitration agreement, appointing arbitrators, the proceedings and setting aside or recognising and enforcing awards are its main subjects.",
    ],
    scope: [
      "Drafting arbitration clauses",
      "Representation in domestic and international arbitration",
      "Setting aside awards and enforcing foreign awards",
    ],
    laws: [
      "Code of Civil Procedure No. 6100, Arts. 407–444",
      "International Arbitration Law No. 4686",
    ],
  },
  de: {
    intro: [
      "Beim Schiedsverfahren lassen die Parteien ihren Streit von selbst gewählten Schiedsrichtern statt von staatlichen Gerichten entscheiden. Schiedsklauseln sind in Handelsverträgen und Bauprojekten verbreitet.",
      "Abschluss der Schiedsvereinbarung, Bestellung der Schiedsrichter, das Verfahren sowie Aufhebung oder Anerkennung und Vollstreckung von Schiedssprüchen sind zentrale Themen.",
    ],
    scope: [
      "Entwurf von Schiedsklauseln",
      "Vertretung in nationalen und internationalen Schiedsverfahren",
      "Aufhebung von Schiedssprüchen und Vollstreckung ausländischer Schiedssprüche",
    ],
    laws: [
      "Zivilprozessgesetz Nr. 6100, Art. 407–444",
      "Gesetz Nr. 4686 über die internationale Schiedsgerichtsbarkeit",
    ],
  },
};

A["icra-ve-iflas-hukuku"] = {
  tr: {
    intro: [
      "İcra ve iflas hukuku, alacakların devlet eliyle zorla tahsilini ve borçlunun ödeme güçlüğü halinde uygulanacak usulleri düzenler. İlamlı ve ilamsız takipler, haciz, satış ve sıra cetveli bu alanın temel işlemleridir.",
      "Takibe itiraz, itirazın iptali ve kaldırılması, menfi tespit ve istirdat davaları ile ipoteğin paraya çevrilmesi yoluyla takipler, taşınmaz hukuku ile iç içe geçen başlıklardır.",
    ],
    scope: [
      "İlamlı ve ilamsız icra takipleri",
      "İtirazın iptali, itirazın kaldırılması ve menfi tespit davaları",
      "Haciz, satış ve sıra cetveline ilişkin şikâyet ve itirazlar",
      "Rehnin ve ipoteğin paraya çevrilmesi yoluyla takipler",
    ],
    laws: [
      "2004 sayılı İcra ve İflas Kanunu",
    ],
  },
  en: {
    intro: [
      "Enforcement and bankruptcy law governs the compulsory collection of debts through the State and the procedures that apply when a debtor cannot pay. Enforcement with and without a judgment, attachment, sale and the ranking of creditors are its core steps.",
      "Objections to enforcement, actions to annul or lift objections, negative declaratory and restitution actions, and enforcement by realising a mortgage all intersect with property law.",
    ],
    scope: [
      "Enforcement proceedings with and without a judgment",
      "Actions to annul or lift objections and negative declaratory actions",
      "Complaints about attachment, sale and ranking of creditors",
      "Enforcement by realising pledges and mortgages",
    ],
    laws: [
      "Enforcement and Bankruptcy Law No. 2004",
    ],
  },
  de: {
    intro: [
      "Das Vollstreckungs- und Konkursrecht regelt die staatliche Zwangsbeitreibung von Forderungen und die Verfahren bei Zahlungsunfähigkeit des Schuldners. Vollstreckung mit und ohne Titel, Pfändung, Verwertung und Verteilungsplan sind die Kernschritte.",
      "Rechtsvorschlag, Klagen auf Aufhebung oder Beseitigung des Rechtsvorschlags, negative Feststellungs- und Rückforderungsklagen sowie die Vollstreckung aus Grundpfandrechten berühren das Immobilienrecht.",
    ],
    scope: [
      "Vollstreckung mit und ohne Titel",
      "Klagen gegen Rechtsvorschläge und negative Feststellungsklagen",
      "Beschwerden zu Pfändung, Verwertung und Verteilungsplan",
      "Vollstreckung aus Pfand- und Grundpfandrechten",
    ],
    laws: [
      "Vollstreckungs- und Konkursgesetz Nr. 2004",
    ],
  },
};

A["is-ve-sosyal-guvenlik-hukuku"] = {
  tr: {
    intro: [
      "İş hukuku, işçi ile işveren arasındaki ilişkiyi; sosyal güvenlik hukuku ise sigortalılık, prim ve sosyal güvenlik haklarını düzenler. İş sözleşmelerinin kurulması, feshi ve işçilik alacakları bu alanın temel konularıdır.",
      "İşçilik alacakları ve işe iade taleplerinde dava açmadan önce arabulucuya başvurmak zorunludur.",
    ],
    scope: [
      "İş sözleşmelerinin hazırlanması ve feshi",
      "Kıdem ve ihbar tazminatı ile diğer işçilik alacakları",
      "İşe iade davaları",
      "Sosyal güvenlik kurumu işlemlerine itiraz",
    ],
    laws: [
      "4857 sayılı İş Kanunu",
      "5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu",
      "7036 sayılı İş Mahkemeleri Kanunu",
    ],
  },
  en: {
    intro: [
      "Labour law governs the employer–employee relationship; social security law governs insurance status, contributions and social security entitlements. Concluding and terminating employment contracts and employee claims are its core subjects.",
      "For employee claims and reinstatement, mediation is mandatory before a lawsuit.",
    ],
    scope: [
      "Drafting and terminating employment contracts",
      "Severance and notice pay and other employee claims",
      "Reinstatement actions",
      "Objections to social security authority decisions",
    ],
    laws: [
      "Labour Law No. 4857",
      "Social Insurance and General Health Insurance Law No. 5510",
      "Labour Courts Law No. 7036",
    ],
  },
  de: {
    intro: [
      "Das Arbeitsrecht regelt das Verhältnis zwischen Arbeitgeber und Arbeitnehmer, das Sozialversicherungsrecht Versicherungsstatus, Beiträge und Leistungsansprüche. Abschluss und Kündigung von Arbeitsverträgen und Arbeitnehmerforderungen sind Kernthemen.",
      "Für Arbeitnehmerforderungen und Wiedereinstellungsklagen ist vor der Klage eine Mediation vorgeschrieben.",
    ],
    scope: [
      "Entwurf und Kündigung von Arbeitsverträgen",
      "Abfindungs-, Kündigungsfrist- und andere Arbeitnehmerforderungen",
      "Wiedereinstellungsklagen",
      "Einwendungen gegen Entscheidungen der Sozialversicherungsanstalt",
    ],
    laws: [
      "Arbeitsgesetz Nr. 4857",
      "Gesetz Nr. 5510 über Sozial- und allgemeine Krankenversicherung",
      "Arbeitsgerichtsgesetz Nr. 7036",
    ],
  },
};

A["aile-hukuku"] = {
  tr: {
    intro: [
      "Aile hukuku; evlilik, boşanma, mal rejimi, velayet ve nafaka gibi aile ilişkilerinden doğan hakları düzenler. Boşanma davalarında mal paylaşımı, özellikle taşınmazlar söz konusu olduğunda eşya hukukuyla iç içe geçer.",
      "Edinilmiş mallara katılma rejiminin tasfiyesi, aile konutu şerhi ve eşler arasındaki taşınmaz devirleri bu alanın uygulamada önem taşıyan konularındandır.",
    ],
    scope: [
      "Anlaşmalı ve çekişmeli boşanma davaları",
      "Mal rejiminin tasfiyesi ve katılma alacağı",
      "Velayet ve nafaka talepleri",
      "Aile konutu şerhi ve eşler arası taşınmaz uyuşmazlıkları",
    ],
    laws: [
      "4721 sayılı Türk Medeni Kanunu, m. 118 vd. (aile hukuku)",
      "6284 sayılı Ailenin Korunması ve Kadına Karşı Şiddetin Önlenmesine Dair Kanun",
    ],
  },
  en: {
    intro: [
      "Family law governs rights arising from family relationships — marriage, divorce, matrimonial property, custody and maintenance. Dividing assets on divorce, especially real property, overlaps with property law.",
      "Liquidating the participation-in-acquired-property regime, the family-home annotation and transfers of property between spouses are of particular practical importance.",
    ],
    scope: [
      "Uncontested and contested divorce proceedings",
      "Liquidation of the matrimonial property regime",
      "Custody and maintenance claims",
      "Family-home annotations and property disputes between spouses",
    ],
    laws: [
      "Turkish Civil Code No. 4721, Art. 118 ff. (family law)",
      "Law No. 6284 on the Protection of the Family and Prevention of Violence against Women",
    ],
  },
  de: {
    intro: [
      "Das Familienrecht regelt Rechte aus Familienbeziehungen — Ehe, Scheidung, Güterstand, Sorgerecht und Unterhalt. Die Vermögensteilung bei Scheidung, besonders bei Immobilien, berührt das Sachenrecht.",
      "Die Auseinandersetzung der Errungenschaftsbeteiligung, die Familienwohnungsvormerkung und Immobilienübertragungen zwischen Ehegatten sind in der Praxis besonders wichtig.",
    ],
    scope: [
      "Einvernehmliche und streitige Scheidungsverfahren",
      "Auseinandersetzung des Güterstands",
      "Sorgerechts- und Unterhaltsansprüche",
      "Familienwohnung und Immobilienstreitigkeiten zwischen Ehegatten",
    ],
    laws: [
      "Türkisches Zivilgesetzbuch Nr. 4721, Art. 118 ff. (Familienrecht)",
      "Gesetz Nr. 6284 zum Schutz der Familie und zur Verhütung von Gewalt gegen Frauen",
    ],
  },
};

A["miras-hukuku"] = {
  tr: {
    intro: [
      "Miras hukuku, bir kişinin ölümüyle malvarlığının mirasçılarına geçişini düzenler. Yasal ve atanmış mirasçılık, saklı paylar, vasiyetname ve miras sözleşmeleri bu alanın temel konularıdır.",
      "Mirasçılık belgesi, terekenin paylaşımı, tenkis ve muris muvazaası davaları, taşınmazların mirasçılar arasında devri ve ortaklığın giderilmesiyle doğrudan bağlantılıdır.",
    ],
    scope: [
      "Mirasçılık belgesi ve tereke tespiti",
      "Vasiyetname ve miras sözleşmelerinin hazırlanması",
      "Tenkis ve muris muvazaası davaları",
      "Terekenin paylaşımı ve miras ortaklığının giderilmesi",
    ],
    laws: [
      "4721 sayılı Türk Medeni Kanunu, m. 495 vd. (miras hukuku)",
    ],
  },
  en: {
    intro: [
      "Inheritance law governs how a person's estate passes to their heirs on death. Statutory and appointed heirs, reserved shares, wills and contracts of inheritance are its core subjects.",
      "Certificates of inheritance, dividing the estate, abatement and actions against sham transfers by the deceased connect directly with transfers of property among heirs and the partition of co-ownership.",
    ],
    scope: [
      "Certificates of inheritance and establishing the estate",
      "Drafting wills and contracts of inheritance",
      "Abatement actions and claims against sham transfers by the deceased",
      "Dividing the estate and dissolving the community of heirs",
    ],
    laws: [
      "Turkish Civil Code No. 4721, Art. 495 ff. (inheritance law)",
    ],
  },
  de: {
    intro: [
      "Das Erbrecht regelt den Übergang des Vermögens einer Person auf ihre Erben mit dem Tod. Gesetzliche und eingesetzte Erben, Pflichtteile, Testamente und Erbverträge sind Kernthemen.",
      "Erbschein, Nachlassteilung, Herabsetzungsklagen und Klagen wegen Scheingeschäften des Erblassers hängen unmittelbar mit Immobilienübertragungen unter Erben und der Aufhebung des Miteigentums zusammen.",
    ],
    scope: [
      "Erbschein und Feststellung des Nachlasses",
      "Entwurf von Testamenten und Erbverträgen",
      "Herabsetzungsklagen und Klagen wegen Scheingeschäften des Erblassers",
      "Nachlassteilung und Auflösung der Erbengemeinschaft",
    ],
    laws: [
      "Türkisches Zivilgesetzbuch Nr. 4721, Art. 495 ff. (Erbrecht)",
    ],
  },
};

A["vakiflar-ve-dernekler-hukuku"] = {
  tr: {
    intro: [
      "Vakıflar ve dernekler hukuku, tüzel kişiliğe sahip bu kuruluşların kuruluşunu, yönetimini ve denetimini düzenler. Vakıf senedi ve dernek tüzüğünün hazırlanması, organ kararları ve mülk edinimi başlıca konulardır.",
      "Vakıflar Genel Müdürlüğü ve il sivil toplumla ilişkiler müdürlükleri nezdindeki işlemler de bu kapsamdadır.",
    ],
    scope: [
      "Vakıf ve dernek kuruluşu, vakıf senedi ve tüzük hazırlanması",
      "Genel kurul ve yönetim organı kararları",
      "Vakıf ve derneklerin taşınmaz edinimi ve yönetimi",
    ],
    laws: [
      "4721 sayılı Türk Medeni Kanunu, m. 56–117",
      "5737 sayılı Vakıflar Kanunu",
      "5253 sayılı Dernekler Kanunu",
    ],
  },
  en: {
    intro: [
      "The law of foundations and associations governs the formation, management and supervision of these legal entities. Drafting foundation deeds and statutes, decisions of their bodies and acquiring property are the main subjects.",
      "Dealings with the General Directorate of Foundations and the provincial directorates for civil-society relations also fall within this field.",
    ],
    scope: [
      "Forming foundations and associations, drafting deeds and statutes",
      "Decisions of general assemblies and management bodies",
      "Acquisition and management of real property by foundations and associations",
    ],
    laws: [
      "Turkish Civil Code No. 4721, Arts. 56–117",
      "Foundations Law No. 5737",
      "Associations Law No. 5253",
    ],
  },
  de: {
    intro: [
      "Das Stiftungs- und Vereinsrecht regelt Gründung, Verwaltung und Aufsicht dieser juristischen Personen. Stiftungsurkunde und Satzung, Organbeschlüsse und Immobilienerwerb sind zentrale Themen.",
      "Auch Verfahren vor der Generaldirektion für Stiftungen und den Provinzdirektionen für Zivilgesellschaft gehören dazu.",
    ],
    scope: [
      "Gründung von Stiftungen und Vereinen, Stiftungsurkunde und Satzung",
      "Beschlüsse von Mitgliederversammlung und Vorstand",
      "Erwerb und Verwaltung von Immobilien durch Stiftungen und Vereine",
    ],
    laws: [
      "Türkisches Zivilgesetzbuch Nr. 4721, Art. 56–117",
      "Stiftungsgesetz Nr. 5737",
      "Vereinsgesetz Nr. 5253",
    ],
  },
};

A["calisma-ve-oturma-izinleri"] = {
  tr: {
    intro: [
      "Türkiye'de çalışmak veya yaşamak isteyen yabancıların çalışma izni ve ikamet izni süreçleri ayrı mevzuata tabidir. Başvuru türleri, gerekli belgeler ve izinlerin uzatılması bu alanın başlıca konularıdır.",
      "Başvuruların reddi halinde idari itiraz ve idari yargı yolları da süreç planlamasının bir parçasıdır.",
    ],
    scope: [
      "Çalışma izni başvuruları ve uzatma işlemleri",
      "Kısa dönem ve uzun dönem ikamet izinleri",
      "Ret kararlarına itiraz ve iptal davaları",
    ],
    laws: [
      "6735 sayılı Uluslararası İşgücü Kanunu",
      "6458 sayılı Yabancılar ve Uluslararası Koruma Kanunu",
    ],
  },
  en: {
    intro: [
      "Work permits and residence permits for foreigners who wish to work or live in Türkiye are governed by separate legislation. Application types, required documents and extensions are its main subjects.",
      "Where an application is refused, administrative objection and judicial review are part of planning the process.",
    ],
    scope: [
      "Work permit applications and extensions",
      "Short-term and long-term residence permits",
      "Objections to refusals and annulment actions",
    ],
    laws: [
      "International Labour Force Law No. 6735",
      "Law No. 6458 on Foreigners and International Protection",
    ],
  },
  de: {
    intro: [
      "Arbeits- und Aufenthaltserlaubnisse für Ausländer, die in der Türkei arbeiten oder leben möchten, sind gesondert geregelt. Antragsarten, erforderliche Unterlagen und Verlängerungen sind zentrale Themen.",
      "Bei einer Ablehnung gehören Widerspruch und verwaltungsgerichtliche Klage zur Verfahrensplanung.",
    ],
    scope: [
      "Anträge auf Arbeitserlaubnis und Verlängerungen",
      "Kurz- und langfristige Aufenthaltserlaubnisse",
      "Rechtsbehelfe gegen Ablehnungen und Anfechtungsklagen",
    ],
    laws: [
      "Gesetz Nr. 6735 über internationale Arbeitskräfte",
      "Gesetz Nr. 6458 über Ausländer und internationalen Schutz",
    ],
  },
};

A["tuketici-hukuku"] = {
  tr: {
    intro: [
      "Tüketici hukuku, mal ve hizmet alımlarında tüketiciyi koruyan kuralları düzenler. Ayıplı mal ve hizmet, mesafeli ve kapıdan satışlar, konut satışında ön ödemeli sözleşmeler ile devre tatil sözleşmeleri bu alanın başlıca konularıdır.",
      "Belirli bir değerin altındaki uyuşmazlıklarda tüketici hakem heyetlerine, üzerindekilerde ise arabuluculuk sonrasında tüketici mahkemelerine başvurulur.",
    ],
    scope: [
      "Ayıplı mal ve hizmet nedeniyle doğan talepler",
      "Ön ödemeli konut satışı sözleşmeleri",
      "Devre tatil ve uzun süreli tatil hizmeti sözleşmeleri",
      "Tüketici hakem heyeti ve tüketici mahkemesi süreçleri",
    ],
    laws: [
      "6502 sayılı Tüketicinin Korunması Hakkında Kanun",
      "Ön Ödemeli Konut Satışları Hakkında Yönetmelik",
    ],
  },
  en: {
    intro: [
      "Consumer law protects consumers who buy goods and services. Defective goods and services, distance and off-premises sales, off-plan home sales and timeshare-holiday contracts are its main subjects.",
      "Disputes below a set value go to consumer arbitration committees; above it, to the consumer courts after mediation.",
    ],
    scope: [
      "Claims for defective goods and services",
      "Off-plan (pre-paid) home sale contracts",
      "Timeshare and long-term holiday contracts",
      "Consumer arbitration committee and consumer court proceedings",
    ],
    laws: [
      "Consumer Protection Law No. 6502",
      "Regulation on Pre-paid Home Sales",
    ],
  },
  de: {
    intro: [
      "Das Verbraucherrecht schützt Käufer von Waren und Dienstleistungen. Mangelhafte Waren und Leistungen, Fernabsatz- und Haustürgeschäfte, Wohnungskäufe mit Vorauszahlung und Timesharing-Verträge sind zentrale Themen.",
      "Streitigkeiten unter einem bestimmten Wert gehen an Verbraucherschlichtungsstellen, darüber nach einer Mediation an die Verbrauchergerichte.",
    ],
    scope: [
      "Ansprüche wegen mangelhafter Waren und Dienstleistungen",
      "Wohnungskaufverträge mit Vorauszahlung",
      "Timesharing- und langfristige Urlaubsverträge",
      "Verfahren vor Verbraucherschlichtungsstellen und Verbrauchergerichten",
    ],
    laws: [
      "Verbraucherschutzgesetz Nr. 6502",
      "Verordnung über Wohnungsverkäufe mit Vorauszahlung",
    ],
  },
};

A["kisisel-verilerin-korunmasi-hukuku"] = {
  tr: {
    intro: [
      "Kişisel verilerin korunması hukuku, gerçek kişilere ait verilerin işlenmesine ilişkin kuralları belirler. Veri sorumlularının aydınlatma, açık rıza, veri güvenliği ve kayıt yükümlülükleri bu alanın temel konularıdır.",
      "Kişisel Verileri Koruma Kurulu'na yapılan başvurular ve şikâyetler ile veri ihlali bildirimleri de bu kapsamdadır.",
    ],
    scope: [
      "Aydınlatma metinleri ve açık rıza süreçlerinin hazırlanması",
      "Veri işleme envanteri ve VERBİS kayıt yükümlülüğü",
      "Kişisel veri ihlali bildirimleri",
      "Kurul'a başvuru ve şikâyet süreçleri",
    ],
    laws: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu",
    ],
  },
  en: {
    intro: [
      "Data protection law sets the rules for processing data about natural persons. Controllers' duties to inform, obtain explicit consent, keep data secure and register are its core subjects.",
      "Applications and complaints to the Personal Data Protection Board and notifications of data breaches also fall within this field.",
    ],
    scope: [
      "Drafting privacy notices and consent procedures",
      "Processing inventories and the VERBİS registration duty",
      "Personal data breach notifications",
      "Applications and complaints to the Board",
    ],
    laws: [
      "Personal Data Protection Law No. 6698",
    ],
  },
  de: {
    intro: [
      "Das Datenschutzrecht regelt die Verarbeitung von Daten natürlicher Personen. Informationspflichten, ausdrückliche Einwilligung, Datensicherheit und Registrierungspflichten der Verantwortlichen sind Kernthemen.",
      "Auch Anträge und Beschwerden bei der Datenschutzbehörde sowie Meldungen von Datenschutzverletzungen gehören dazu.",
    ],
    scope: [
      "Datenschutzhinweise und Einwilligungsverfahren",
      "Verarbeitungsverzeichnis und VERBİS-Registrierungspflicht",
      "Meldung von Datenschutzverletzungen",
      "Anträge und Beschwerden bei der Behörde",
    ],
    laws: [
      "Datenschutzgesetz Nr. 6698",
    ],
  },
};

module.exports = A;
