"use strict";

/* Interface strings.
   Every string here exists in all three languages — the live site leaks Turkish
   into the English and German pages ("Makale Başlığı", "Görüntüle", the entire
   cookie banner; v4 §3.2 / evidence #6, #7). Nothing is hard-coded in templates. */

const t = {
  /* --- navigation --- */
  "nav.home":      { tr: "Anasayfa",           en: "Home",            de: "Startseite" }, // live DE says "Zuhause" — wrong sense
  "nav.corporate": { tr: "Kurumsal",           en: "The Firm",        de: "Die Kanzlei" },
  "nav.about":     { tr: "Hakkımızda",         en: "About Us",        de: "Über uns" },
  "nav.vision":    { tr: "Vizyon & Misyon",    en: "Vision & Mission",de: "Vision & Mission" },
  "nav.quality":   { tr: "Kalite Politikamız", en: "Quality Policy",  de: "Qualitätspolitik" },
  "nav.career":    { tr: "Kariyer",            en: "Careers",         de: "Karriere" },
  // Regulation-safe wording chosen by the firm (v4 §3.8)
  "nav.areas":     { tr: "Çalışma Alanlarımız",en: "Practice Areas",  de: "Tätigkeitsfelder" },
  "nav.team":      { tr: "Ekibimiz",           en: "Our Team",        de: "Unser Team" }, // live DE "Unsere Anwalte" missing umlaut
  "nav.articles":  { tr: "Makaleler",          en: "Articles",        de: "Publikationen" },
  "nav.contact":   { tr: "İletişim",           en: "Contact",         de: "Kontakt" },
  "nav.menu":      { tr: "Menü",               en: "Menu",            de: "Menü" },
  "nav.close":     { tr: "Kapat",              en: "Close",           de: "Schließen" },
  "nav.skip":      { tr: "İçeriğe geç",        en: "Skip to content", de: "Zum Inhalt springen" },

  /* --- generic --- */
  "cta.contact":   { tr: "Bize Ulaşın",        en: "Contact Us",      de: "Kontakt aufnehmen" }, // replaces "Uzmana Danış"
  // Header button only. The full German label ("Kontakt aufnehmen") is half as
  // wide again as the Turkish and pushed the nav out of the bar.
  "cta.contactShort": { tr: "İletişim",          en: "Contact",         de: "Kontakt" },
  "cta.all":       { tr: "Tümünü Gör",         en: "View All",        de: "Alle anzeigen" },
  "cta.more":      { tr: "Devamını Oku",       en: "Read More",       de: "Mehr lesen" },
  "cta.back":      { tr: "Geri",               en: "Back",            de: "Zurück" },
  "label.email":   { tr: "E-posta",            en: "E-mail",          de: "E-Mail" },
  "label.phone":   { tr: "Telefon",            en: "Telephone",       de: "Telefon" },
  "label.address": { tr: "Adres",              en: "Address",         de: "Adresse" },

  /* --- home --- */
  "home.areasTitle": { tr: "Çalışma alanlarımız", en: "Practice areas", de: "Tätigkeitsfelder" },
  "home.areasLede": {
    tr: "Ortaklığımızın hukuki danışmanlık ve dava takibi yürüttüğü başlıca alanlar.",
    en: "The principal fields in which the partnership advises and litigates.",
    de: "Die wichtigsten Felder, in denen die Partnerschaft berät und Prozesse führt.",
  },
  "home.articlesTitle": { tr: "Yayınlarımızdan", en: "From our publications", de: "Aus unseren Publikationen" },
  "home.articlesLede": {
    tr: "Ortaklarımız tarafından, büyük bölümü akademisyenlerle ortak kaleme alınan ve hukuk dergilerinde yayımlanan çalışmalar.",
    en: "Studies written by our partners, largely with academic co-authors, and published in legal journals.",
    de: "Von unseren Partnern — überwiegend mit akademischen Ko-Autoren — verfasste und in Fachzeitschriften veröffentlichte Arbeiten.",
  },

  /* --- articles --- */
  "art.title":     { tr: "Makaleler",          en: "Articles",        de: "Publikationen" },
  "art.lede": {
    tr: "Ortaklarımızın hukuk dergilerinde yayımlanan çalışmaları. Konuya göre süzebilir, başlık ve özet içinde arama yapabilirsiniz.",
    en: "Studies by our partners published in legal journals. Filter by subject, or search titles and abstracts.",
    de: "In Fachzeitschriften veröffentlichte Arbeiten unserer Partner. Nach Thema filtern oder Titel und Zusammenfassungen durchsuchen.",
  },
  "art.search":    { tr: "Başlık, yazar veya konu içinde ara…", en: "Search titles, authors or subjects…", de: "Titel, Autoren oder Themen durchsuchen…" },
  "art.searchLbl": { tr: "Makalelerde ara",    en: "Search articles", de: "Publikationen durchsuchen" },
  "art.all":       { tr: "Tümü",               en: "All",             de: "Alle" },
  "art.filterBy":  { tr: "Konuya göre süz",    en: "Filter by subject", de: "Nach Thema filtern" },
  "art.count":     { tr: "makale listeleniyor",en: "articles listed", de: "Publikationen gelistet" },
  "art.none":      { tr: "Aramanıza uyan makale bulunamadı.", en: "No articles match your search.", de: "Keine Publikationen entsprechen Ihrer Suche." },
  "art.readPdf":   { tr: "PDF olarak oku",     en: "Read as PDF",     de: "Als PDF lesen" },
  "art.download":  { tr: "PDF'i indir",        en: "Download PDF",    de: "PDF herunterladen" },
  "art.abstract":  { tr: "Özet",               en: "Abstract",        de: "Zusammenfassung" },
  "art.abstractEn":{ tr: "İngilizce özet",     en: "Abstract (English)", de: "Zusammenfassung (Englisch)" },
  "art.abstractTr":{ tr: "Özet",               en: "Abstract (Turkish)", de: "Zusammenfassung (Türkisch)" },
  "art.details":   { tr: "Künye",              en: "Publication details", de: "Angaben zur Veröffentlichung" },
  "art.authors":   { tr: "Yazarlar",           en: "Authors",         de: "Autoren" },
  "art.coauthor":  { tr: "Ortak yazar",        en: "Co-author",       de: "Ko-Autor" },
  "art.journal":   { tr: "Yayımlandığı yer",   en: "Published in",    de: "Veröffentlicht in" },
  "art.date":      { tr: "Tarih",              en: "Date",            de: "Datum" },
  "art.pages":     { tr: "Sayfa",              en: "Pages",           de: "Seiten" },
  "art.topics":    { tr: "Konular",            en: "Subjects",        de: "Themen" },
  "art.keywords":  { tr: "Anahtar kelimeler",  en: "Keywords",        de: "Schlagwörter" },
  "art.related":   { tr: "İlgili makaleler",   en: "Related articles",de: "Verwandte Publikationen" },
  "art.noDate":    { tr: "Tarih belirtilmemiş",en: "Date not stated", de: "Datum nicht angegeben" },
  // Honest, translated statement of the PDF's language — the live site links
  // English and German titles straight to a Turkish PDF (v4 §3.2 / evidence #5).
  "art.langNoteTr":{ tr: "Tam metin Türkçedir.", en: "The full text is in Turkish.", de: "Der Volltext ist auf Türkisch." },
  "art.summaryPending": {
    tr: "Bu çalışmanın özeti hazırlanmaktadır. Tam metne PDF bağlantısından ulaşabilirsiniz.",
    en: "An abstract for this study is in preparation. The full text is available via the PDF link.",
    de: "Eine Zusammenfassung dieser Arbeit wird vorbereitet. Der Volltext ist über den PDF-Link abrufbar.",
  },
  "art.summaryIntro": {
    tr: "Aşağıdaki metin, çalışmanın giriş bölümünden alınmıştır.",
    en: "The text below is taken from the introduction to the study.",
    de: "Der folgende Text stammt aus der Einleitung der Arbeit.",
  },

  /* --- areas --- */
  "areas.lede": {
    tr: "Ortaklığımızın hukuki danışmanlık ve dava takibi yürüttüğü alanlar. Bu liste, faaliyet gösterilen alanları tanıtmak amacıyla hazırlanmış olup uzmanlık beyanı niteliği taşımaz.",
    en: "The fields in which the partnership advises and litigates. This list describes areas of activity and is not a claim of specialisation.",
    de: "Die Felder, in denen die Partnerschaft berät und Prozesse führt. Diese Liste beschreibt Tätigkeitsbereiche und stellt keine Spezialisierungsbehauptung dar.",
  },
  "areas.related": { tr: "Bu alandaki yayınlarımız", en: "Our publications in this field", de: "Unsere Publikationen in diesem Bereich" },
  "areas.other":   { tr: "Diğer çalışma alanları", en: "Other practice areas", de: "Weitere Tätigkeitsfelder" },

  /* --- team --- */
  "team.lede": {
    tr: "Ortaklığımızın avukatları.",
    en: "The attorneys of the partnership.",
    de: "Die Anwältinnen und Anwälte der Partnerschaft.",
  },
  "team.pubs":     { tr: "Yayınları",          en: "Publications",    de: "Publikationen" },
  "team.pubsCount":{ tr: "yayın",              en: "publications",    de: "Publikationen" },
  "team.barNo":    { tr: "Baro sicil no",      en: "Bar registration no.", de: "Kammer-Registriernummer" },
  "team.startYear":{ tr: "Mesleğe başlama",    en: "Admitted",        de: "Zulassung" },
  "team.faculty":  { tr: "Mezuniyet",          en: "Education",       de: "Ausbildung" },
  "team.languages":{ tr: "Yabancı diller",     en: "Languages",       de: "Sprachen" },
  "team.academic": { tr: "Akademik görev",     en: "Academic post",   de: "Akademische Funktion" },

  /* --- events --- */
  "nav.events":    { tr: "Eğitim ve Kongreler", en: "Training & Congresses", de: "Fortbildung & Kongresse" },
  "ev.lede": {
    tr: "Ortaklarımızın katıldığı kongreler, konferanslar, eğitim programları ve televizyon yayınları.",
    en: "Congresses, conferences, training programmes and broadcast appearances our partners take part in.",
    de: "Kongresse, Konferenzen, Fortbildungen und Sendungen, an denen unsere Partner teilnehmen.",
  },
  "ev.type.tv":        { tr: "TV Programı",     en: "TV Appearance",   de: "TV-Auftritt" },
  "ev.type.konferans": { tr: "Konferans",       en: "Conference",      de: "Konferenz" },
  "ev.type.kongre":    { tr: "Kongre",          en: "Congress",        de: "Kongress" },
  "ev.type.etkinlik":  { tr: "Etkinlik",        en: "Event",           de: "Veranstaltung" },
  "ev.upcoming":   { tr: "Yaklaşan",           en: "Upcoming",        de: "Bevorstehend" },
  "ev.past":       { tr: "Geçmiş",             en: "Past",            de: "Vergangen" },
  "ev.venue":      { tr: "Yer",                en: "Venue",           de: "Ort" },
  "ev.date":       { tr: "Tarih",              en: "Date",            de: "Datum" },
  "ev.type":       { tr: "Tür",                en: "Type",            de: "Art" },
  "ev.speakers":   { tr: "Katılımcılar",       en: "Participants",    de: "Teilnehmende" },
  "ev.poster":     { tr: "Afiş",               en: "Poster",          de: "Plakat" },
  "ev.link":       { tr: "Etkinlik bağlantısı",en: "Event link",      de: "Veranstaltungslink" },
  "ev.related":    { tr: "İlgili makaleler",   en: "Related articles",de: "Verwandte Publikationen" },
  "ev.none": {
    tr: "Bu bölüm yakında yayımlanacak kayıtlarla güncellenecektir.",
    en: "This section will be updated with entries shortly.",
    de: "Dieser Bereich wird in Kürze mit Einträgen ergänzt.",
  },
  "ev.count":      { tr: "kayıt listeleniyor", en: "entries listed", de: "Einträge gelistet" },

  /* --- team profiles --- */
  "team.profile":  { tr: "Profil",             en: "Profile",         de: "Profil" },
  "team.articlesOf": { tr: "Yayınları",        en: "Publications",    de: "Publikationen" },
  "team.noArticles": {
    tr: "Bu avukat için henüz yayın eşleştirilmemiştir.",
    en: "No publications have been linked to this attorney yet.",
    de: "Diesem Anwalt wurden noch keine Publikationen zugeordnet.",
  },
  "team.contactVia": { tr: "İletişim",          en: "Contact",         de: "Kontakt" },

  /* --- contact --- */
  "ct.lede": {
    tr: "Ortaklığımıza aşağıdaki bilgilerden ulaşabilir veya formu doldurabilirsiniz.",
    en: "You may reach the partnership using the details below, or complete the form.",
    de: "Sie erreichen die Partnerschaft über die folgenden Angaben oder über das Formular.",
  },
  "ct.name":       { tr: "Ad Soyad",           en: "Full name",       de: "Name" },
  "ct.email":      { tr: "E-posta",            en: "E-mail",          de: "E-Mail" },
  "ct.phone":      { tr: "Telefon",            en: "Telephone",       de: "Telefon" },
  "ct.subject":    { tr: "Konu",               en: "Subject",         de: "Betreff" },
  "ct.message":    { tr: "Mesajınız",          en: "Your message",    de: "Ihre Nachricht" },
  "ct.send":       { tr: "Gönder",             en: "Send",            de: "Senden" },
  "ct.sending":    { tr: "Gönderiliyor…",      en: "Sending…",        de: "Wird gesendet…" },
  "ct.ok":         { tr: "Mesajınız tarafımıza ulaştı. En kısa sürede dönüş yapacağız.", en: "Your message has reached us. We will respond as soon as possible.", de: "Ihre Nachricht ist bei uns eingegangen. Wir melden uns so bald wie möglich." },
  "ct.err":        { tr: "Mesaj gönderilemedi. Lütfen tekrar deneyin veya doğrudan e-posta yazın.", en: "The message could not be sent. Please try again or write to us directly.", de: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt." },
  "ct.required":   { tr: "Bu alan zorunludur.",en: "This field is required.", de: "Dieses Feld ist erforderlich." },
  "ct.consent": {
    tr: "Aydınlatma Metni'ni okudum; mesajımdaki kişisel verilerin başvuruma cevap verilmesi amacıyla işlenmesini kabul ediyorum.",
    en: "I have read the Privacy Notice and consent to the personal data in my message being processed in order to respond to my enquiry.",
    de: "Ich habe den Datenschutzhinweis gelesen und willige ein, dass die in meiner Nachricht enthaltenen personenbezogenen Daten zur Beantwortung meiner Anfrage verarbeitet werden.",
  },
  "ct.office":     { tr: "Büro yönetimi",      en: "Office administration", de: "Büroverwaltung" },
  "ct.hours":      { tr: "Çalışma saatleri",   en: "Office hours",    de: "Bürozeiten" },
  "ct.hoursVal":   { tr: "Pazartesi – Cuma, 09.00 – 18.00", en: "Monday – Friday, 09:00 – 18:00", de: "Montag – Freitag, 09:00 – 18:00" },
  "ct.map":        { tr: "Haritada göster",    en: "View on map",     de: "Auf der Karte ansehen" },
  "ct.directions": { tr: "Yol tarifi al",       en: "Get directions",  de: "Route berechnen" },
  "ct.mapLoad":    { tr: "Haritayı yükle",      en: "Load the map",    de: "Karte laden" },
  "ct.mapNotice": {
    tr: "Harita Google tarafından sağlanmaktadır; görüntülendiğinde Google'a bağlantı kurulur ve çerez yerleştirilebilir.",
    en: "The map is provided by Google; displaying it contacts Google and may set cookies.",
    de: "Die Karte stammt von Google; bei der Anzeige wird eine Verbindung zu Google hergestellt und es können Cookies gesetzt werden.",
  },

  /* --- cookies / legal --- */
  "ck.title":      { tr: "Çerez tercihiniz",   en: "Your cookie choice", de: "Ihre Cookie-Einstellung" },
  "ck.body": {
    tr: "Bu sitede yalnızca sitenin çalışması için gerekli çerezler kullanılır. İsteğe bağlı ölçüm çerezlerini kabul edip etmemekte serbestsiniz.",
    en: "This site uses only the cookies necessary for it to function. You are free to accept or decline optional measurement cookies.",
    de: "Diese Website verwendet nur die für ihren Betrieb erforderlichen Cookies. Optionale Messcookies können Sie annehmen oder ablehnen.",
  },
  "ck.accept":     { tr: "Tümünü kabul et",    en: "Accept all",      de: "Alle annehmen" },
  "ck.reject":     { tr: "Yalnızca gerekli",   en: "Necessary only",  de: "Nur notwendige" },
  "ck.details":    { tr: "Çerez Politikası",   en: "Cookie Policy",   de: "Cookie-Richtlinie" },
  "legal.privacy": { tr: "KVKK Aydınlatma Metni", en: "Privacy Notice", de: "Datenschutzhinweis" },
  "legal.cookies": { tr: "Çerez Politikası",   en: "Cookie Policy",   de: "Cookie-Richtlinie" },
  "legal.draft": {
    tr: "TASLAK — Bu metin ortaklığın kendi incelemesi ve onayı için hazırlanmış bir iskelettir; yayına alınmadan önce ortaklık tarafından tamamlanmalıdır.",
    en: "DRAFT — This text is a skeleton prepared for the partnership's own review and approval; it must be completed by the partnership before publication.",
    de: "ENTWURF — Dieser Text ist ein Gerüst zur Prüfung und Freigabe durch die Partnerschaft und muss vor der Veröffentlichung von ihr vervollständigt werden.",
  },

  /* --- footer --- */
  "ftr.explore":   { tr: "Keşfet",             en: "Explore",         de: "Entdecken" },
  "ftr.corporate": { tr: "Kurumsal",           en: "The Firm",        de: "Die Kanzlei" },
  "ftr.contact":   { tr: "İletişim",           en: "Contact",         de: "Kontakt" },
  "ftr.about": {
    tr: "1136 sayılı Avukatlık Kanunu'nun 44. maddesi uyarınca tescilli avukatlık ortaklığı. İstanbul Barosu'na kayıtlıdır.",
    en: "An attorney partnership registered under Article 44 of Attorneyship Law No. 1136, enrolled with the Istanbul Bar Association.",
    de: "Eine nach Artikel 44 des Anwaltsgesetzes Nr. 1136 eingetragene Anwaltspartnerschaft, Mitglied der Anwaltskammer Istanbul.",
  },
  "ftr.rights":    { tr: "Tüm hakları saklıdır.", en: "All rights reserved.", de: "Alle Rechte vorbehalten." },
  "ftr.linkedin":  { tr: "LinkedIn sayfamız",  en: "Our LinkedIn page", de: "Unsere LinkedIn-Seite" },

  /* --- errors --- */
  "e404.title": {
    tr: "Bu sayfayı bulamadık.",
    en: "We could not find this page.",
    de: "Diese Seite konnten wir nicht finden.",
  },
  "e404.body": {
    tr: "Aradığınız sayfayı bulamadık — ama hakkınızı aramanıza yardımcı olabiliriz. Aşağıdaki bölümlerden devam edebilir veya doğrudan bize ulaşabilirsiniz.",
    en: "We could not find the page you were looking for — but finding what you are entitled to is rather more our field. Continue from the sections below, or write to us directly.",
    de: "Die gesuchte Seite haben wir nicht gefunden — Ihr Recht zu finden liegt uns allerdings näher. Nutzen Sie die folgenden Bereiche oder schreiben Sie uns direkt.",
  },
  "e404.home":     { tr: "Anasayfaya dön",     en: "Return to home",  de: "Zur Startseite" },
  "e404.helpful":  { tr: "Sık aranan sayfalar", en: "Frequently visited", de: "Häufig besucht" },
};

function T(key, lang) {
  const e = t[key];
  if (!e) throw new Error("Missing i18n key: " + key);
  return e[lang] || e.tr;
}

module.exports = { T, strings: t };
