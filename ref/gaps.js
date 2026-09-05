/* Produce the "what the firm still needs to supply" report from the real data. */
const fs = require("fs");
const path = require("path");
const SITE = path.join(__dirname, "..", "site");
const ART = require(path.join(SITE, "content", "articles.json"));
const D = require(path.join(SITE, "content", "data.js"));

const A = ART.articles;
const line = (s) => out.push(s);
const out = [];

const noSummary = A.filter((a) => a.needs.summary);
const noDate = A.filter((a) => a.needs.date);
const noJournal = A.filter((a) => a.needs.journal);
const scanned = A.filter((a) => a.needs.scanned);
const introOnly = A.filter((a) => a.summarySource === "pdf-intro");
const realAbstract = A.filter((a) => a.summarySource === "pdf");

line("# Eksik veriler — ortaklıktan beklenenler");
line("");
line("Bu liste, 46 makalenin PDF'lerinden otomatik olarak çıkarılabilen bilgiden sonra");
line("geriye kalan boşlukları gösterir. Site bu boşluklarla da çalışır; alanlar");
line("dolduruldukça makale sayfaları ve arama motoru görünürlüğü güçlenir.");
line("");
line("## Özet");
line("");
line("| Alan | Hazır | Eksik |");
line("|---|---:|---:|");
line(`| Makale özeti | ${A.length - noSummary.length} | **${noSummary.length}** |`);
line(`| — bunun dergiden gelen gerçek \`Özet\` bölümü | ${realAbstract.length} | — |`);
line(`| — bunun makalenin giriş paragrafından üretileni | ${introOnly.length} | — |`);
line(`| İngilizce özet | ${A.filter((a) => a.summary.en).length} | ${A.length - A.filter((a) => a.summary.en).length} |`);
line(`| Yayın tarihi | ${A.length - noDate.length} | **${noDate.length}** |`);
line(`| Yayımlandığı dergi | ${A.length - noJournal.length} | **${noJournal.length}** |`);
line(`| Konu etiketi | ${A.length} | 0 |`);
line(`| TR / EN / DE başlık | ${A.length} | 0 |`);
line("");
line(`PDF'lerin ${scanned.length} tanesi taranmış görüntüdür (metin katmanı yoktur), bu yüzden`);
line("bu makalelerden hiçbir bilgi otomatik çıkarılamamıştır.");
line("");

line("## 1. Özeti yazılması gereken makaleler (" + noSummary.length + ")");
line("");
line("Bu PDF'ler taranmış görüntü olduğu için metinleri okunamadı. Her biri için");
line("3–5 cümlelik bir özet yeterlidir.");
line("");
noSummary.forEach((a, i) => line(`${i + 1}. **${a.title.tr}**${a.coAuthor ? ` — ${a.coAuthor} ile` : ""}  \n   \`site/content/articles.json\` → id ${a.id} → \`summary.tr\``));
line("");

line("## 2. Tarihi belirlenemeyen makaleler (" + noDate.length + ")");
line("");
line("Sitede bugün bu makalelerin hiçbirinde tarih yok; bu listedekilerin tarihi");
line("PDF'ten de okunamadı. Yayın yılı — mümkünse ay — gerekiyor.");
line("");
noDate.forEach((a, i) => line(`${i + 1}. ${a.title.tr}  \n   → id ${a.id} → \`date\` (\`"2019"\` veya \`"2019-06"\` biçiminde)`));
line("");

line("## 3. Dergi künyesi eksik olanlar (" + noJournal.length + ")");
line("");
noJournal.forEach((a, i) => line(`${i + 1}. ${a.title.tr} → id ${a.id} → \`journal\`, \`volume\`, \`issue\``));
line("");

line("## 4. Ekip bilgileri");
line("");
line("TBB Reklam Yasağı Yönetmeliği'nin internet sitesinde yer almasına açıkça izin");
line("verdiği bilgiler. Alanlar sitede hazır; içerik ortaklıktan gelmelidir.");
line("");
line("| Avukat | Eksik |");
line("|---|---|");
D.team.forEach((m) => {
  const map = { photo: "profesyonel portre", email: "e-posta", barNo: "baro sicil no",
                startYear: "mesleğe başlama tarihi", faculty: "mezun olunan fakülte",
                languages: "yabancı diller", bio: "kısa özgeçmiş" };
  line(`| ${m.name} | ${(m.pending || []).map((k) => map[k] || k).join(", ") || "—"} |`);
});
line("");
line("Not: Türkan Aktaş'ın mevcut sitedeki portresi 2019 tarihli bir WhatsApp");
line("görüntüsüdür; Tuğba Kaya Filizoğlu ve Satvet Can Ariz'in görsel adresleri ise");
line("boştur (kırık görsel). Yeni sitede üçü de baş harf yer tutucusu ile gösteriliyor —");
line("kırık görsel çıkmıyor. Beş kişi için tek oturumda çekilmiş portreler önerilir.");
line("");

line("## 5. Ortaklığın karar vermesi gerekenler");
line("");
line("1. **KVKK Aydınlatma Metni ve Çerez Politikası.** Site bu iki sayfayı doğru");
line("   başlıklar ve KVKK m. 11 hakları ile birlikte **taslak** olarak içeriyor ve her");
line("   sayfada görünür bir TASLAK uyarısı taşıyor. Metinleri ortaklığın kendi");
line("   hukukçuları tamamlamalı ve uyarıyı kaldırmalıdır.");
line("   → `site/content/legal.js`, uyarı metni `i18n.js` → `legal.draft`");
line("2. **Terminoloji.** Reklam yasağı gerekçesiyle \"Uzmanlık Alanlarımız\" →");
line("   \"Çalışma Alanlarımız\", \"Uzmana Danış\" → \"Bize Ulaşın\" olarak değiştirildi ve");
line("   \"Yasal Güvenceniz\" başlığı kaldırıldı. Karar ortaklığındır; geri almak");
line("   isterseniz `i18n.js` içindeki üç anahtar yeterlidir.");
line("3. **EN / DE hukuki metinler.** Kurumsal sayfaların İngilizce ve Almanca");
line("   çevirileri tarafımızdan hazırlandı; yayına almadan önce bir hukukçunun");
line("   gözden geçirmesi gerekir. (46 makale başlığının EN/DE çevirileri ortaklığın");
line("   mevcut sitesinden alınmıştır.)");
line("4. **Form e-postası.** Şu an form mesajları `site/messages/` klasörüne JSON");
line("   olarak yazılıyor. Yayına alırken bir SMTP hesabı bağlanmalıdır.");
line("   → `site/server.js` → `handleContact`");
line("");

fs.writeFileSync(path.join(__dirname, "..", "EKSIK-VERILER.md"), out.join("\n"), "utf8");
console.log(out.join("\n").slice(0, 1600));
console.log("\n… written to EKSIK-VERILER.md");
