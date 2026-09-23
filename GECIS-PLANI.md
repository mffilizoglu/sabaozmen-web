# sabaozmen.av.tr — yeni siteye geçiş planı

Amaç: alan adının yeni tasarımı göstermesi; **e-posta (Microsoft 365 / Exchange)
bir saniye bile kesintiye uğramadan**. Mevcut kayıtların tam listesi ve geri
dönüş kaydı: [DNS-KAYITLARI.md](DNS-KAYITLARI.md).

## Kim ne yapıyor?

| Taraf | Rol |
|---|---|
| DNS sağlayıcısı (alan adı isim hakkı + DNS) | Web kayıtlarını değiştirir. İletişim bilgisi repoda tutulmaz. |
| Eski barındırma 5.2.84.41 | Eski PHP site. Geçişte dokunulmaz; 2 hafta sonra kapatılabilir. |
| GitHub Pages (mffilizoglu/sabaozmen-web) | Yeni site. Ücretsiz, Türkiye'den erişilir, sabit IP'li, otomatik HTTPS. |

Eski MyFC yönetim paneli (`/__myDB/`) ve cPanel geçiş için **gerekmez**.

## Adım 1 — DNS değişikliği (DNS sağlayıcısı yapar)

Yalnızca iki web kaydı değişir:

| Ad | Şu an | Yeni |
|---|---|---|
| `sabaozmen.av.tr` (@) | A 5.2.84.41 | A 185.199.108.153 · A 185.199.109.153 · A 185.199.110.153 · A 185.199.111.153 |
| `www` | A 5.2.84.41 | CNAME `mffilizoglu.github.io` |

Dokunulmayacaklar: MX, SPF TXT, `selector1/selector2._domainkey` CNAME'leri,
`autodiscover` CNAME. CAA kaydı yok (Let's Encrypt sertifikası engelsiz).

## Adım 2 — GitHub tarafı (ben yaparım, e-posta gönderildiği anda)

1. Repo değişkeni `CUSTOM_DOMAIN=sabaozmen.av.tr` → iş akışı siteyi kök yola,
   `CNAME` dosyasıyla yayınlar.
2. Repo Pages ayarı: custom domain `sabaozmen.av.tr`; DNS yayıldıktan sonra
   **Enforce HTTPS**.
3. Cloudflare iş akışı için `SITE_ORIGIN=https://sabaozmen.av.tr` (canonical'lar
   gerçek alan adını gösterir).

Adım 2 DNS'ten *önce* yapılır: böylece DNS değiştiği anda GitHub alan adını
tanır, "site bulunamadı" sayfası hiç görünmez. Bedeli: o arada önizleme adresi
(github.io) alan adına yönlenir ve DNS değişene kadar eski siteyi gösterir.

## Adım 3 — Doğrulama (ben yaparım)

- `nslookup sabaozmen.av.tr 8.8.8.8` → 185.199.x.153; MX değişmemiş olmalı.
- HTTPS sertifikası: DNS'ten sonra genelde 15–60 dk. Bu sürede `https://`
  sertifika uyarısı verebilir; `http://` çalışır.
- Sayfalar: `/tr`, `/en`, `/de`, `/tr/makaleler`, bir makale, `/tr/iletisim`, 404.
- Eski adresler: `/tr/modul/kurumsal/vizyon-misyon` vb. 261 eski URL yeni
  sayfalarına yönlenir (Google'daki bağlantılar kırılmaz).
- Bir test e-postası gönder/al.
- Google Search Console: alan adı eklenir, yeni sitemap gönderilir.

## Bilinen sınırlar (GitHub Pages)

- **/admin alan adında yok** (statik barındırma). Panel seçenekleri: Cloudflare'deki
  panel (Türkiye dışından / VPN ile), bilgisayardaki `Yonetim-Panelini-Baslat.cmd`,
  ya da ileride alan adını Cloudflare DNS'e taşıyıp `sabaozmen.av.tr/admin`.
  Panelden yapılan her kayıt GitHub'a işlenir ve ~1 dk içinde alan adında yayınlanır.
- **İletişim formu** sunucusuz çalışır: ziyaretçinin e-posta programını mesaj
  hazır halde açar. Doğrudan gönderim için ileride bir form servisi eklenebilir.
- Güvenlik başlıkları: CSP her sayfada meta etiket olarak var; `X-Frame-Options`
  ve HSTS başlığı GitHub Pages'te ayarlanamaz (HTTPS zorunlu kılma açılır).

## Geri dönüş

DNS sağlayıcısından `@` ve `www` kayıtlarını tekrar **A 5.2.84.41** yapmalarını
istemek yeterli. E-posta kayıtları hiçbir senaryoda değişmez. Eski barındırmayı
geçişten en az 2 hafta sonra kapatın.
