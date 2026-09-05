# Yeni site — v4 analizindeki bulgulara karşılık

Analiz: *Saba Özmen Analiz v4*, 17 Ağustos 2026.
Yeni site: `site/` — `node site/server.js` ile çalışır.

Renk kimliği korunmuştur (bordo — ikinci turda logo dosyanızdaki `#A01944`
değeriyle güncellendi). Değişen; tipografi, düzen, hareket ve altyapıdır.

> **Not:** 3. bölümdeki logo önerisi ikinci turda geçersiz kaldı. Kendi logonuz
> esas alındı; ayrıntı için belgenin sonundaki *İkinci tur → 2. Logo* bölümü.

---

## 1. Analizdeki bulgular

| # | Bulgu | Durum |
|---|---|---|
| 3.1 | 46 makale yalnızca PDF bağlantısı; ayrı sayfa, özet, tasnif, arama yok | **Çözüldü** — her makalenin kalıcı adresi, sayfası, künyesi, konu etiketleri var; arşivde arama ve 19 konu başlığıyla filtre çalışıyor |
| 3.1 | PDF'ler `site_images/` klasöründe | **Çözüldü** — `/makaleler/pdf/` altında, sıralı adlarla |
| 3.1 | Atıf verisi makine tarafından okunamıyor | **Çözüldü** — her makale sayfasında `ScholarlyArticle` JSON-LD (yazarlar, dergi, tarih, özet, anahtar kelimeler) |
| 3.2 | EN/DE başlıklar çevrili ama bağlantılar Türkçe PDF'e gidiyor, uyarı yok | **Çözüldü** — EN/DE sayfalarda "The full text is in Turkish." / "Der Volltext ist auf Türkisch." notu; 15 makalede PDF'ten çıkarılan gerçek İngilizce özet İngilizce sayfada başa alındı |
| 3.2 | Tablo başlığı "Makale Başlığı", bağlantı "Görüntüle" — EN sayfada bile Türkçe | **Çözüldü** — arayüzde tek bir sabit metin yok; hepsi `i18n.js` içinde üç dilde |
| 3.2 | Çerez bildirimi EN/DE sayfalarda Türkçe | **Çözüldü** — bildirim sayfanın dilinde |
| 3.2 | Unvan çevirisi tutarsız ("Lawyer" / "Attorney Partnership") | **Çözüldü** — tek çeviri, `data.js` → `firm.name` |
| 3.3 | "Kurumsal" menüsü `…/javascript:` adresine gidiyor (üç dilde) | **Çözüldü** — gerçek sayfaya bağlı; sitede hiç `javascript:` bağlantısı yok (otomatik denetleniyor) |
| 3.4 | `meta description` yarım cümle, site genelinde tek | **Çözüldü** — her sayfaya özgü, tamamlanmış açıklama; makale sayfalarınınki kendi özetinden üretiliyor |
| 3.5 | `og:image` adresi tanımsız, Twitter kartında SVG | **Çözüldü** — 1200×630 PNG kart üretildi (`/img/og.png`), `summary_large_image` |
| 3.6 | İki avukatın fotoğrafı kırık, biri WhatsApp görüntüsü | **Kısmen** — kırık görsel kalmadı; fotoğrafı olmayan üç avukat baş harf yer tutucusuyla gösteriliyor. Portre çekimi ortaklıktan bekleniyor |
| 3.7 | Mevzuatın izin verdiği kimlik bilgileri sitede yok | **Yapı hazır** — sicil no, mesleğe başlama, fakülte, yabancı dil alanları tanımlı; içerik bekleniyor (`EKSIK-VERILER.md` §4) |
| 3.8 | "Uzmanlık Alanlarımız", "Uzmana Danış", "Yasal Güvenceniz" | **Uygulandı** — sırasıyla "Çalışma Alanlarımız", "Bize Ulaşın" ve tanımlayıcı bir başlık. Üçü de tek dosyada, geri alınabilir |
| 3.9 | KVKK/gizlilik metni yok; çerez bandında yalnızca "Kabul Ediyorum", `javascript:;` | **Kısmen** — gerçek seçim sunan bant ("Tümünü kabul et" / "Yalnızca gerekli", tercih tarayıcıda saklanır); KVKK ve çerez sayfaları doğru başlıklar ve KVKK m. 11 haklarıyla **taslak** hâlde, görünür TASLAK uyarısıyla. Metinleri ortaklık tamamlamalı |
| 3.10 | "Roto Çelik" alt metni, ajans bağlantısı, `noimagelist.png`, `revisit-after`, boş doğrulama etiketleri | **Çözüldü** — hiçbiri yok; her biri otomatik denetleniyor |
| 3.10 | Alan başlıkları tıklanabilir değil | **Çözüldü** — kartın tamamı bağlantı |
| 3.11 | Tarihler üç ayrı biçimde; makale sayfasında hiç yok | **Çözüldü** — tek biçim, sayfanın dilinde. Tarihi bilinmeyen 26 makale "Tarih belirtilmemiş" olarak dürüstçe gösteriliyor |
| 3.12 | Ana sayfa ne yapıldığını söylemeden alıntıyla açılıyor | **Çözüldü** — tanımlayıcı bir konumlandırma cümlesi başa alındı; Moliérac alıntısı korunup ikinci sıraya taşındı |

## 2. Analizde olmayan, çalışırken bulunanlar

1. **25 çalışma alanı sayfasının tamamı boştu** — canlı sitede yalnızca başlık ve
   yan menü vardı, gövde metni yoktu. Her biri için mevzuata uygun, uzmanlık
   iddiası içermeyen tanım yazıldı (üç dilde) ve o alandaki yayınlarla bağlandı.
2. **KVKK ve Çerez Politikası sayfaları vardı ama içerikleri
   "Kvkk sayfa içeriği yakında güncellenecektir…" idi.** Analiz bu sayfaları hiç
   görmediğini yazıyor; durum bir adım daha kötü — sayfa var, metin yok.
3. **Almanca menüde iki hata:** "Zuhause" (ev anlamında; doğrusu *Startseite*) ve
   "Unsere Anwalte" (umlaut eksik; doğrusu *Anwälte*). İkisi de düzeltildi.
4. **İletişim sayfasındaki ikinci telefon ve ikinci e-posta** (`+90 (216) 469 45 25`,
   `seldaaltun@`) sitenin başka hiçbir yerinde görünmüyordu. Yeni sitede iletişim
   sayfasında açıkça yer alıyor.
5. **Altı makale başlığı TAMAMEN BÜYÜK HARFLE yazılmış.** Arşiv listesinde tutarsız
   duruyordu; Türkçe, İngilizce ve Almanca kurallarına göre ayrı ayrı düzeltildi.

## 3. Yeni logo — ~~ilk öneri~~ (GEÇERSİZ, bkz. İkinci tur → 2. Logo)

> Bu bölüm ilk turda önerilen ve **kullanılmayan** markayı anlatır. Sitede
> ortaklığın kendi logosu kullanılıyor.

Eski marka, iki beyaz eğik çizgi taşıyan degrade bir daireydi ve bir şey anlatmıyordu.

Yeni marka, bordo bir kare içinde **paylara bölünmüş bir parsel**: yatay ve dikey bir
çizgiyle dörde ayrılmış bir çerçeve ve dolu tek bir pay. Aynı anda kat mülkiyetindeki
katmanları ve arsa payını okutur — ortaklığın asıl çalışma alanı. Eski markanın bordo
rengini ve "bölünmüş biçim" fikrini sürdürür, ama 16 pikselde de okunur.

Dosyalar: `site/public/img/mark.svg`, `mark-inverse.svg`, `favicon.svg`,
`apple-touch-icon.png`, `og.png`. Başlıktaki kilit (marka + "SABA ÖZMEN" +
"AVUKATLIK ORTAKLIĞI") koyu ve açık zeminde kendini ters çevirir.

Yazı ailesi: başlıklarda **Source Serif 4**, arayüzde **Inter**. Eski sitedeki
Poppins, akademik ağırlığı olan bir büroya göre fazla geometrikti.

## 4. Hareket

Apple'a yakın bir his hedeflendi: `cubic-bezier(.22, 1, .36, 1)` yumuşamaları,
kaydırdıkça beliren bölümler (sıralı gecikmeyle), kahramanda hafif paralaks,
başlıkta bulanık cam etkisi ve aşağı kaydırırken gizlenme, butonlarda basma
tepkisi, soldan büyüyen bağlantı altı çizgileri.

- `prefers-reduced-motion` seçen ziyaretçide tüm hareket kapanır.
- Animasyonlar `js` sınıfına bağlıdır: JavaScript çalışmazsa sayfa boş kalmaz,
  tüm içerik doğrudan görünür.

## 5. Doğrulama

`ref/crawl.js` her açılışta üç dildeki tüm sayfaları gezer ve denetler:

```
checked 273 urls · 273 clean · 0 with problems
```

273 adres = 3 dil × (12 sayfa + 25 çalışma alanı + 46 makale + 5 avukat profili)
+ varlıklar.
Denetlenenler: HTTP durumu, doğru `html lang`, 50–200 karakter arası ve sayfaya
özgü açıklama, `canonical`, üç dilin `hreflang` eşlemesi, PNG `og:image`,
kırık iç bağlantı olmaması ve eski sitenin bulgularının geri gelmemesi
(`javascript:` bağlantısı, "Roto Çelik", `noimagelist`, `revisit-after`, ajans
bağlantısı, düzeltilen terminoloji, EN/DE sayfalara sızan Türkçe arayüz metni).

Ayrıca elle sınandı: iletişim formu (geçerli gönderim, eksik onay, hatalı e-posta,
bot tuzağı), arşiv araması (Türkçe karakterden bağımsız — "muge urem" ile
"Müge Ürem" aynı 5 sonucu veriyor), konu filtresi, filtre + arama birlikte,
sonuç bulunamadı durumu, mobil düzen.

## 6. Ortaklıktan beklenenler

Ayrıntılı liste: **`EKSIK-VERILER.md`**

Özetle: 16 makalenin özeti (PDF'leri taranmış görüntü olduğu için okunamadı),
26 makalenin tarihi, 32 makalenin dergi künyesi, beş avukatın sicil/fakülte/dil
bilgileri ve portreleri, KVKK ile çerez metinlerinin tamamlanması, EN/DE
kurumsal metinlerin bir hukukçu tarafından gözden geçirilmesi.

Site bu boşluklarla da eksiksiz çalışır; boşluklar kullanıcıya dürüstçe gösterilir,
uydurma bilgi yoktur.

---

# İkinci tur — 5 Eylül 2026

## 1. Almanca "Bize Ulaşın" butonu

Başlıktaki buton için ayrı, kısa bir metin anahtarı eklendi
(`cta.contactShort`): **İletişim / Contact / Kontakt**. Sayfa içindeki butonlar
tam metni ("Kontakt aufnehmen") kullanmaya devam ediyor. Almanca başlıkta menüyü
taşıran uzunluk böylece ortadan kalktı. 560 pikselin altında başlık butonu
tamamen gizleniyor — mobil menüde zaten yer alıyor.

## 2. Logo

Gönderdiğiniz iki dosya esas alındı.

**İşaret.** `logosabaozmen.png` vektöre çevrildi. Çemberin merkezi ve yarıçapı en
küçük kareler ile (ortalama sapma 1,3 piksel), iki kama bandının orta çizgisi ve
açılma eğimi ise 1.026 ve 1.349 sütunluk ölçümden doğrusal regresyonla bulundu
(sapma 0,25 piksel). Sonuç tek bir 448 baytlık SVG path; kaynak PNG ile **%98,9**
örtüşüyor ve her boyutta net.

Kamalar `fill-rule="evenodd"` ile deliniyor, dolayısıyla işaret şeffaf — her
zemine oturuyor. Kamalar çemberin dışına taştığı için `<clipPath>` yerine
kesişimler analitik olarak hesaplanıp gerçek yaylarla kapatıldı; böylece dosyada
hiçbir `id` yok ve tarayıcı, PDF, baskı ve eski SVG işleyicilerinde aynı görünüyor.

**Yazı.** `logowithtextsabaozmen.png` 887×181 pikseldi; büyütüldüğünde
bulanıklaşıyordu. Yazı tipini bulmak için temiz ayrılabilen altı harfin (S, Ö, Z,
M, E, N) mürekkep genişliği / büyük harf yüksekliği oranı ölçülüp on adayla
karşılaştırıldı. **Cormorant** açık farkla en yakın çıktı (ortalama sapma 0,032;
ikinci sıradakinin yarısı). Cormorant SIL Open Font License ile dağıtılıyor ve
Türkçe karakterlerin tamamını içeriyor, dolayısıyla gömülebilir ve üçüncü
taraflara verilebilir.

> Ara bir ölçümde Cambria öne çıkmıştı; büyük harf yüksekliği yerine yanlışlıkla
> umlaut dahil toplam mürekkep yüksekliğine bölündüğü için oluşan bir hataydı.
> Düzeltildiğinde Cambria sonuncu sıraya düştü — Cambria'nın O harfi belirgin
> biçimde dar, orijinaldeki O ise geniş ve yuvarlak.

Üretilen dosyalar:

| Dosya | Ne için |
|---|---|
| `img/mark.svg`, `mark-white.svg` | İşaret, tek path |
| `img/favicon.svg` | Sekme simgesi |
| `img/lockup.svg`, `lockup-white.svg` | İşaret + yazı, **harfler eğriye çevrilmiş** — yazı tipi gerekmez; baskı, e-posta imzası, üçüncü taraflar |
| `img/og.png` | 1200×630 paylaşım kartı |
| `img/apple-touch-icon.png`, `icon-192/512.png` | Uygulama simgeleri |

Sitenin başlığında işaret SVG olarak gömülü, yazı ise gerçek metin — iki satır
aynı ölçüye tracklendi (ölçülen fark 0,09 piksel), araya saç teli çizgi kondu.

**Marka rengi** logo dosyasından alındı: `#A01944`. Site genelinde güncellendi
(önceki değer canlı siteden örneklenen `#A12E4D` idi).

## 3. Hero'daki alıntı

Moliérac pasajı hero bölümüne alındı; konumlandırma cümlesi onun **altına**,
ince bir ayraç çizgisiyle yerleştirildi. Alıntı ana sayfanın "Ortaklığımız
hakkında" bölümünden kaldırıldı (iki kez görünmüyor); o bölümün yan sütununda
artık kuruluş, baro, adres ve telefon künyesi duruyor.

## 4. Etkinlikler

Yeni bölüm: `/tr/etkinlikler`, `/en/events`, `/de/veranstaltungen`.

Dört tür: **TV Programı, Konferans, Kongre, Etkinlik**. Her kaydın afişi, tarihi
(çok günlü etkinlikler için bitiş tarihi), yeri, şehri, katılımcıları, bağlantısı,
üç dilde özeti ve ayrıntılı metni olabiliyor; ilgili makalelerle eşleştirilebiliyor.
Liste sayfasında türe göre süzme, detay sayfasında `Event` yapılandırılmış verisi
var. Kayıt yokken sayfa dürüst bir boş durum gösteriyor.

## 5. Yönetim paneli

`/admin` — Türkçe arayüz.

**Avukatlarımız.** Fotoğraf yükleme ve kaldırma, görev ve akademik unvan (üç
dilde), özgeçmiş metni (üç dilde), mevzuatın izin verdiği bilgiler (baro sicil no,
mesleğe başlama tarihi, fakülte, yabancı diller, ORCID), sıralama, yayında/gizli.
46 makale içinden arama yapılabilen bir listeden o avukata ait yayınlar
işaretleniyor.

Bunun bir yan faydası: her avukatın artık kendi profil sayfası var
(`/tr/ekibimiz/<slug>`) ve işaretlenen yayınlar orada listeleniyor — analizin
7.B maddesinde "akademik otoritenin kurumsallaşması" başlığıyla önerilen hamle.

**Etkinlikler.** Yukarıdaki alanların tamamı için tam CRUD, afiş yükleme dahil.

**Güvenlik.** Parola scrypt ile özetleniyor (düz metin hiçbir yerde durmuyor,
`content/admin.json` git'e girmiyor); oturum HMAC imzalı `HttpOnly` +
`SameSite=Strict` çerezle taşınıyor ve 8 saatte doluyor; bütün formlar CSRF jetonu
taşıyor; yüklenen dosyalar uzantıya değil **dosya imzasına** bakılarak
doğrulanıyor; panel `noindex` ve site haritasında yok.

## 6. Doğrulama

```
crawl        273 adres · 273 temiz · 0 sorun
admin e2e    23/23 geçti
```

Panel testi giriş/çıkış, hatalı parola, oturumsuz istek, CSRF jetonu, afiş
yükleme, yüklenen dosyanın sunulması, üç dilde yayına çıkma, `Event`
yapılandırılmış verisi, görüntü olmayan dosyanın reddi, makale eşleştirmenin
kaydı ve silme akışını kapsıyor. Ayrıca `content/admin.json` dosyasının dizin
aşımıyla (`../`, yüzde kodlaması dahil) sunulamadığı sınandı.
