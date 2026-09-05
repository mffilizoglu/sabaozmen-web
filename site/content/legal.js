"use strict";

/* ============================================================================
   KVKK aydınlatma metni + çerez politikası — DRAFTS.

   The live site has both pages, but both say only "Kvkk sayfa içeriği yakında
   güncellenecektir..." while a working contact form collects personal data
   (v4 §3.9 / evidence #20, #21). These are structured drafts carrying the
   correct headings and the Article 11 rights, so the firm's own lawyers edit
   rather than start from a blank page. Every page renders them under a visible
   DRAFT banner (i18n key legal.draft).
   ============================================================================ */

const { firm } = require("./data");
const A = `${firm.address.street}, ${firm.address.district}`;
const MAIL = firm.emails.general;

const privacy = {
  tr: {
    title: "KVKK Aydınlatma Metni",
    blocks: [
      { p: [`Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m. 10 uyarınca, ${firm.name.tr} tarafından yürütülen kişisel veri işleme faaliyetleri hakkında ilgili kişileri bilgilendirmek amacıyla hazırlanmıştır.`] },
      { h: "1. Veri sorumlusu", p: [`Veri sorumlusu, 1136 sayılı Avukatlık Kanunu m. 44 uyarınca tescilli ${firm.name.tr}'dır. Adres: ${A}. E-posta: <a href="mailto:${MAIL}">${MAIL}</a>.`] },
      { h: "2. İşlenen kişisel veriler", p: ["Sitemizdeki iletişim formu aracılığıyla ilettiğiniz;"], ul: ["kimlik verisi (ad, soyad),", "iletişim verisi (e-posta adresi, telefon numarası),", "mesajınızın içeriğinde yer alan ve tarafınızca paylaşılan diğer veriler", "işlenmektedir. Sitemiz, zorunlu çerezler dışında ziyaretçi verisi toplamamaktadır."] },
      { h: "3. İşleme amaçları", p: ["Kişisel verileriniz; başvurunuzun ve talebinizin değerlendirilmesi, tarafınıza dönüş yapılması, hukuki danışmanlık ilişkisinin kurulup kurulamayacağının değerlendirilmesi ve mevzuattan doğan yükümlülüklerin yerine getirilmesi amaçlarıyla işlenmektedir."] },
      { h: "4. Hukuki sebep", p: ["Verileriniz, KVKK m. 5/2-(c) uyarınca bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması, m. 5/2-(ç) uyarınca veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi ve m. 5/2-(f) uyarınca meşru menfaat hukuki sebeplerine dayanılarak; bunların dışında kalan hâllerde ise açık rızanıza dayanılarak işlenmektedir."] },
      { h: "5. Aktarım", p: ["Kişisel verileriniz, yalnızca kanunen yetkili kamu kurum ve kuruluşları ile mahkemelere, mevzuatın öngördüğü hâl ve sınırlar dâhilinde aktarılabilir. Verileriniz yurt dışına aktarılmamaktadır."] },
      { h: "6. Toplama yöntemi", p: ["Kişisel verileriniz, internet sitemizdeki iletişim formu, e-posta ve telefon aracılığıyla, elektronik ortamda otomatik ve kısmen otomatik yollarla toplanmaktadır."] },
      { h: "7. Saklama süresi", p: ["Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri sonuna kadar saklanır; sürenin dolması hâlinde silinir, yok edilir veya anonim hâle getirilir."] },
      { h: "8. İlgili kişinin hakları", p: ["KVKK m. 11 uyarınca veri sorumlusuna başvurarak;"], ul: ["kişisel verinizin işlenip işlenmediğini öğrenme,", "işlenmişse buna ilişkin bilgi talep etme,", "işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,", "yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,", "eksik veya yanlış işlenmişse düzeltilmesini isteme,", "Kanun'un 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,", "düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,", "münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç doğmasına itiraz etme,", "kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme", "haklarına sahipsiniz."] },
      { h: "9. Başvuru", p: [`Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'de öngörülen usullere uygun olarak yazılı biçimde ${A} adresine veya <a href="mailto:${MAIL}">${MAIL}</a> adresine iletebilirsiniz. Başvurunuz en geç otuz gün içinde sonuçlandırılır.`] },
    ],
  },
  en: {
    title: "Privacy Notice",
    blocks: [
      { p: [`This notice is issued by ${firm.name.en} under Article 10 of the Turkish Personal Data Protection Law No. 6698 ("KVKK") to inform data subjects about its personal data processing.`] },
      { h: "1. Data controller", p: [`The data controller is ${firm.name.en}, registered under Article 44 of Attorneyship Law No. 1136. Address: ${A}. E-mail: <a href="mailto:${MAIL}">${MAIL}</a>.`] },
      { h: "2. Personal data processed", p: ["Through the contact form on this site we process:"], ul: ["identity data (first name, surname);", "contact data (e-mail address, telephone number);", "any further data you choose to include in your message.", "Apart from strictly necessary cookies, the site collects no visitor data."] },
      { h: "3. Purposes of processing", p: ["Your data is processed in order to assess your enquiry, respond to you, evaluate whether a legal advisory relationship can be established, and meet obligations arising from legislation."] },
      { h: "4. Legal basis", p: ["Processing is based on Article 5/2-(c) (directly related to the conclusion or performance of a contract), Article 5/2-(ç) (compliance with a legal obligation) and Article 5/2-(f) (legitimate interests) of the KVKK; in all other cases it is based on your explicit consent."] },
      { h: "5. Transfers", p: ["Your data may be disclosed only to public authorities and courts legally entitled to receive it, within the limits set by legislation. Your data is not transferred abroad."] },
      { h: "6. Method of collection", p: ["Data is collected electronically, by automated and partly automated means, through the contact form on this website, by e-mail and by telephone."] },
      { h: "7. Retention", p: ["Your data is retained for as long as the purpose of processing requires and until the end of the limitation periods laid down in the applicable legislation, after which it is erased, destroyed or anonymised."] },
      { h: "8. Your rights", p: ["Under Article 11 of the KVKK you may apply to the data controller to:"], ul: ["learn whether your personal data is processed;", "request information if it has been processed;", "learn the purpose of processing and whether the data is used accordingly;", "know the third parties to whom it is transferred at home or abroad;", "request rectification where it is incomplete or inaccurate;", "request erasure or destruction under the conditions of Article 7;", "request that rectification, erasure and destruction be notified to third parties;", "object to a result adverse to you arising from analysis solely by automated systems;", "claim compensation for damage suffered due to unlawful processing."] },
      { h: "9. Applications", p: [`Requests may be submitted in writing, in the manner set out in the Communiqué on Application Procedures to the Data Controller, to ${A}, or to <a href="mailto:${MAIL}">${MAIL}</a>. Applications are concluded within thirty days at the latest.`] },
    ],
  },
  de: {
    title: "Datenschutzhinweis",
    blocks: [
      { p: [`Dieser Hinweis wird von der ${firm.name.de} gemäß Artikel 10 des türkischen Gesetzes Nr. 6698 zum Schutz personenbezogener Daten („KVKK“) erteilt, um betroffene Personen über die Verarbeitung ihrer Daten zu informieren.`] },
      { h: "1. Verantwortlicher", p: [`Verantwortlicher ist die nach Artikel 44 des Anwaltsgesetzes Nr. 1136 eingetragene ${firm.name.de}. Anschrift: ${A}. E-Mail: <a href="mailto:${MAIL}">${MAIL}</a>.`] },
      { h: "2. Verarbeitete Daten", p: ["Über das Kontaktformular dieser Website verarbeiten wir:"], ul: ["Identitätsdaten (Vorname, Nachname);", "Kontaktdaten (E-Mail-Adresse, Telefonnummer);", "weitere Angaben, die Sie in Ihrer Nachricht mitteilen.", "Abgesehen von unbedingt erforderlichen Cookies erhebt die Website keine Besucherdaten."] },
      { h: "3. Zwecke der Verarbeitung", p: ["Ihre Daten werden verarbeitet, um Ihre Anfrage zu prüfen, Ihnen zu antworten, zu beurteilen, ob ein Mandatsverhältnis begründet werden kann, und um gesetzliche Pflichten zu erfüllen."] },
      { h: "4. Rechtsgrundlage", p: ["Die Verarbeitung stützt sich auf Artikel 5/2-(c) (unmittelbarer Zusammenhang mit Abschluss oder Erfüllung eines Vertrags), Artikel 5/2-(ç) (Erfüllung einer rechtlichen Verpflichtung) und Artikel 5/2-(f) (berechtigte Interessen) KVKK; im Übrigen auf Ihre ausdrückliche Einwilligung."] },
      { h: "5. Weitergabe", p: ["Ihre Daten dürfen ausschließlich an gesetzlich befugte Behörden und Gerichte im gesetzlich vorgesehenen Rahmen weitergegeben werden. Eine Übermittlung ins Ausland findet nicht statt."] },
      { h: "6. Art der Erhebung", p: ["Die Erhebung erfolgt elektronisch, automatisiert und teilautomatisiert, über das Kontaktformular dieser Website sowie per E-Mail und Telefon."] },
      { h: "7. Speicherdauer", p: ["Ihre Daten werden so lange gespeichert, wie der Verarbeitungszweck es erfordert, längstens bis zum Ablauf der gesetzlichen Verjährungsfristen; danach werden sie gelöscht, vernichtet oder anonymisiert."] },
      { h: "8. Ihre Rechte", p: ["Nach Artikel 11 KVKK können Sie beim Verantwortlichen beantragen:"], ul: ["zu erfahren, ob Sie betreffende Daten verarbeitet werden;", "Auskunft über eine erfolgte Verarbeitung zu erhalten;", "den Zweck der Verarbeitung und die zweckgemäße Verwendung zu erfahren;", "die Empfänger im In- und Ausland zu kennen;", "die Berichtigung unvollständiger oder unrichtiger Daten zu verlangen;", "die Löschung oder Vernichtung nach Artikel 7 zu verlangen;", "die Mitteilung von Berichtigung, Löschung und Vernichtung an Dritte zu verlangen;", "einem Sie benachteiligenden Ergebnis ausschließlich automatisierter Analyse zu widersprechen;", "Ersatz eines durch rechtswidrige Verarbeitung entstandenen Schadens zu verlangen."] },
      { h: "9. Antragstellung", p: [`Anträge können schriftlich nach den Vorgaben der Mitteilung über das Antragsverfahren beim Verantwortlichen an ${A} oder an <a href="mailto:${MAIL}">${MAIL}</a> gerichtet werden. Die Bearbeitung erfolgt spätestens innerhalb von dreißig Tagen.`] },
    ],
  },
};

const cookies = {
  tr: {
    title: "Çerez Politikası",
    blocks: [
      { p: ["Çerez (cookie), ziyaret ettiğiniz internet siteleri tarafından tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Bu politika, internet sitemizde hangi çerezlerin hangi amaçla kullanıldığını ve tercihlerinizi nasıl yönetebileceğinizi açıklamaktadır."] },
      { h: "1. Kullandığımız çerezler", p: ["Sitemizde iki tür çerez bulunmaktadır:"], ul: ["<strong>Zorunlu çerezler.</strong> Sitenin çalışması ve tercihlerinizin (dil seçimi, çerez tercihiniz) hatırlanması için gereklidir. Bu çerezler kapatılamaz ve kimlik tespitine imkân vermez.", "<strong>İsteğe bağlı ölçüm çerezleri.</strong> Sayfaların nasıl kullanıldığını anlamamıza yardımcı olur. Bunlar yalnızca açık onayınız hâlinde yerleştirilir; onay vermemeniz sitenin kullanımını etkilemez."] },
      { h: "2. Tercihinizin saklanması", p: ["Çerez bandındaki seçiminiz tarayıcınızda saklanır ve yalnızca sizin cihazınızda tutulur. Bu tercih tarafımıza iletilmez."] },
      { h: "3. Tercihinizi değiştirme", p: ["Tarayıcınızın ayarlar bölümünden çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz. Site verilerini temizlemeniz hâlinde çerez tercihiniz sıfırlanır ve bant yeniden gösterilir."] },
      { h: "4. Üçüncü taraf çerezleri", p: ["Sitemizde reklam ağı, sosyal medya izleyicisi veya profilleme amaçlı üçüncü taraf çerezi kullanılmamaktadır."] },
      { h: "5. Kişisel verilerin korunması", p: [`Çerezler yoluyla kişisel veri işlenmesi hâlinde, işleme faaliyeti KVKK Aydınlatma Metnimizde açıklanan esaslara tabidir. Sorularınız için <a href="mailto:${MAIL}">${MAIL}</a> adresine yazabilirsiniz.`] },
    ],
  },
  en: {
    title: "Cookie Policy",
    blocks: [
      { p: ["Cookies are small text files placed on your browser by the websites you visit. This policy explains which cookies this site uses, for what purpose, and how you can manage your choice."] },
      { h: "1. Cookies we use", p: ["This site uses two kinds of cookie:"], ul: ["<strong>Strictly necessary cookies.</strong> Required for the site to work and to remember your choices (language, cookie preference). They cannot be switched off and do not identify you.", "<strong>Optional measurement cookies.</strong> These help us understand how pages are used. They are set only with your explicit consent; declining them does not affect your use of the site."] },
      { h: "2. Storing your choice", p: ["Your selection in the cookie banner is stored in your own browser and remains on your device. It is not transmitted to us."] },
      { h: "3. Changing your choice", p: ["You may delete or block cookies at any time in your browser settings. Clearing site data resets your cookie preference and the banner will appear again."] },
      { h: "4. Third-party cookies", p: ["This site uses no advertising network, social media tracker or profiling cookies."] },
      { h: "5. Data protection", p: [`Where cookies involve the processing of personal data, that processing is governed by our Privacy Notice. For questions, write to <a href="mailto:${MAIL}">${MAIL}</a>.`] },
    ],
  },
  de: {
    title: "Cookie-Richtlinie",
    blocks: [
      { p: ["Cookies sind kleine Textdateien, die von den von Ihnen besuchten Websites in Ihrem Browser abgelegt werden. Diese Richtlinie erläutert, welche Cookies diese Website zu welchem Zweck verwendet und wie Sie Ihre Auswahl verwalten können."] },
      { h: "1. Verwendete Cookies", p: ["Diese Website verwendet zwei Arten von Cookies:"], ul: ["<strong>Unbedingt erforderliche Cookies.</strong> Notwendig für den Betrieb der Website und zum Speichern Ihrer Auswahl (Sprache, Cookie-Einstellung). Sie lassen sich nicht abschalten und identifizieren Sie nicht.", "<strong>Optionale Messcookies.</strong> Sie helfen uns zu verstehen, wie Seiten genutzt werden. Sie werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt; eine Ablehnung beeinträchtigt die Nutzung nicht."] },
      { h: "2. Speicherung Ihrer Auswahl", p: ["Ihre Auswahl im Cookie-Banner wird in Ihrem Browser gespeichert und verbleibt auf Ihrem Gerät. Sie wird nicht an uns übermittelt."] },
      { h: "3. Auswahl ändern", p: ["Sie können Cookies jederzeit in den Einstellungen Ihres Browsers löschen oder blockieren. Beim Löschen der Websitedaten wird Ihre Auswahl zurückgesetzt und das Banner erneut angezeigt."] },
      { h: "4. Cookies Dritter", p: ["Diese Website verwendet keine Cookies von Werbenetzwerken, Social-Media-Trackern oder zu Profilbildungszwecken."] },
      { h: "5. Datenschutz", p: [`Soweit über Cookies personenbezogene Daten verarbeitet werden, gilt hierfür unser Datenschutzhinweis. Bei Fragen schreiben Sie an <a href="mailto:${MAIL}">${MAIL}</a>.`] },
    ],
  },
};

module.exports = { privacy, cookies };
