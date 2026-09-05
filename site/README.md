# Saba Özmen Avukatlık Ortaklığı — yeni site

Üç dilli (TR / EN / DE) hukuk bürosu sitesi. Bağımlılığı yoktur; `node` yeterlidir.

## Çalıştırma

```bash
node site/server.js
```

- http://127.0.0.1:4321/tr
- http://127.0.0.1:4321/en
- http://127.0.0.1:4321/de
- http://127.0.0.1:4321/admin — yönetim paneli

Parola: ilk çalıştırmada rastgele üretilir ve **yalnızca bir kez** konsola yazılır.
Kendi parolanızı belirlemek için:

```bash
ADMIN_PASSWORD=secme-parolaniz node site/server.js
```

Parolayı sıfırlamak için `site/content/admin.json` dosyasını silip yeniden başlatın.

Port değiştirmek için `PORT=8080 node site/server.js`.

İletişim formundan gelen mesajlar `site/messages/` klasörüne JSON olarak yazılır
(bu ortamda e-posta sunucusu yok — yayına alırken SMTP bağlanmalıdır).

## Yapı

```
site/
  server.js              Yönlendirme, statik dosyalar, form uç noktası, sitemap
  content/
    data.js              Firma bilgisi, 25 çalışma alanı, kurumsal metinler
    i18n.js              Tüm arayüz metinleri, üç dilde — şablonlarda sabit metin yok
    legal.js             KVKK ve çerez politikası TASLAKLARI
    articles.json        46 makale (üretilir — aşağıya bakınız)
    team.json            Avukatlar — panelden düzenlenir
    events.json          Etkinlikler — panelden düzenlenir
    admin.json           Parola özeti + oturum anahtarı (git'e girmez)
  lib/
    layout.js            <head>, başlık, alt bilgi, logo, ikonlar
    pages.js             Sayfa şablonları
    pages-extra.js       Etkinlik ve avukat profili sayfaları
    store.js             team.json / events.json okuma-yazma (atomik)
    admin.js             Yönetim paneli arayüzü ve kayıt işlemleri
    auth.js              Parola (scrypt) + imzalı oturum çerezi + CSRF
    multipart.js         Dosya yükleme çözümleyici (bağımlılıksız)
    mark.inline.txt      Logo işareti (SVG, tek path)
    lockup.inline.txt    Logo + yazı kilidi (SVG)
  public/
    css/main.css         Tasarım sistemi
    css/admin.css        Panel arayüzü
    js/main.js           Etkileşim katmanı
    js/admin.js          Panel etkileşimleri
    fonts/               Inter + Source Serif 4 + Cormorant (yerel)
    img/                 Logo, favicon, OG görseli, ekip fotoğrafları
    uploads/             Panelden yüklenen fotoğraf ve afişler
    makaleler/pdf/       46 makale PDF'i
```

## İçerik nasıl güncellenir

| Ne | Nerede |
|---|---|
| Telefon, adres, e-posta | `content/data.js` → `firm` |
| Çalışma alanı ekleme/düzenleme | `content/data.js` → `areas` |
| Avukat ekleme/düzenleme | **Yönetim paneli** → Avukatlarımız (veya `content/team.json`) |
| Etkinlik ekleme/düzenleme | **Yönetim paneli** → Etkinlikler (veya `content/events.json`) |
| Kurumsal sayfa metinleri | `content/data.js` → `pages` |
| Menü, buton, etiket metinleri | `content/i18n.js` |
| KVKK / çerez metinleri | `content/legal.js` |
| Makale özeti, tarihi, künyesi | `content/articles.json` |

Yeni makale eklemek: `content/articles.json` içindeki `articles` dizisine bir kayıt
ekleyin ve PDF'i `public/makaleler/pdf/` altına koyun. Zorunlu alanlar `slug`,
`title.tr`, `topics`, `pdf`. Sayfa, arşiv listesi, filtre, site haritası ve
yapılandırılmış veri otomatik oluşur.

`articles.json` ilk hâli `../ref/` altındaki betiklerle PDF'lerden üretilmiştir
(`fetch_pdfs.py` → `extract_meta.py` → `gen_articles.py`). Elle düzenlemek
güvenlidir; betikleri yeniden çalıştırmak elle yapılan düzenlemeleri siler.

## Terminoloji anahtarı

Reklam yasağı gerekçesiyle değiştirilen üç ifade tek yerdedir — `content/i18n.js`:

| Anahtar | Şimdiki | Eski site |
|---|---|---|
| `nav.areas` | Çalışma Alanlarımız | Uzmanlık Alanlarımız |
| `cta.contact` | Bize Ulaşın | Uzmana Danış |
| `home.aboutHeading` (`data.js`) | Ortaklığımız hakkında | Yasal Güvenceniz |

## Notlar

- Sayfalar sunucuda üretilir; JavaScript kapalıyken de tam okunur
  (animasyonlar `js` sınıfına bağlıdır).
- `prefers-reduced-motion` tercih eden ziyaretçilerde tüm hareket kapanır.
- `/sitemap.xml` ve `/robots.txt` otomatik üretilir; site haritası üç dilin
  `hreflang` eşlemesini içerir.
- Yazı tipleri yereldir; site internet bağlantısı olmadan da doğru görünür.

## Yönetim paneli

`/admin` — Türkçe arayüz, iki bölüm:

**Avukatlarımız.** Fotoğraf yükleme, görev ve akademik unvan (üç dilde), özgeçmiş
metni (üç dilde), mevzuatın izin verdiği bilgiler (baro sicil no, mesleğe başlama,
fakülte, yabancı diller, ORCID), sıralama, yayında/gizli. Her avukata 46 makale
içinden yayınları işaretlenebilir; işaretlenenler avukatın profil sayfasında
(`/tr/ekibimiz/<slug>`) listelenir.

**Etkinlikler.** TV programı / konferans / kongre / etkinlik türleri, afiş yükleme,
tarih ve bitiş tarihi, yer, şehir, katılımcılar, bağlantı, kısa özet ve ayrıntılı
metin (üç dilde), makale eşleştirme, yayında/gizli.

Güvenlik: parola scrypt ile özetlenir (düz metin saklanmaz), oturum HMAC imzalı
`HttpOnly` + `SameSite=Strict` çerezle taşınır ve 8 saatte sona erer, tüm formlar
CSRF jetonu taşır, yüklenen dosyalar uzantıya değil **dosya imzasına** bakılarak
doğrulanır (JPG/PNG/GIF/WebP, en fazla 6 MB), panel `noindex` işaretlidir ve site
haritasında yer almaz.

## Logo

`logosabaozmen.png` vektöre çevrildi: `public/img/mark.svg` — tek bir 448 baytlık
path (en küçük kareler ile bulunan çember + `fill-rule="evenodd"` ile delinen iki
kama, çembere analitik olarak kırpıldığı için `<clipPath>` kimliğine ihtiyaç yok).
Kaynak PNG ile %98,9 örtüşür ve her boyutta nettir.

Yazılı kilit (`logowithtextsabaozmen.png`) 887×181 piksellik bir görseldi ve
büyütüldüğünde bulanıklaşıyordu. Harf biçimleri ölçülerek on aday yazı tipiyle
karşılaştırıldı (S, Ö, Z, M, E, N harflerinin mürekkep genişliği / büyük harf
yüksekliği oranı); en yakın eşleşme **Cormorant** oldu. Yazı yeniden dizildi:

- `public/img/lockup.svg` / `lockup-white.svg` — harfler eğriye çevrildi, yazı
  tipi gerekmez; baskı, e-posta imzası ve üçüncü taraflar için.
- Sitenin başlığında işaret SVG olarak gömülü, yazı ise gerçek metin (Cormorant),
  iki satır aynı ölçüye tracklenmiş durumda.

Marka rengi, verilen logo dosyasından alındı: **#A01944**.
