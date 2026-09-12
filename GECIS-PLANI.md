# sabaozmen.av.tr — yeni siteye geçiş planı

Amaç: alan adının yeni tasarımı göstermesi; **e-posta (Microsoft 365) bir saniye
bile kesintiye uğramadan**. Mevcut kayıtların tam listesi ve geri dönüş kaydı:
[DNS-KAYITLARI.md](DNS-KAYITLARI.md).

## Kim ne yapabilir?

| Erişim | Nerede | Ne için gerekli |
|---|---|---|
| Eski site yönetim paneli (MyFC) | sabaozmen.av.tr/__myDB/ | **Hiçbir şey.** Sadece eski içeriği yönetir; alan adı yönlendirmesi yapamaz. |
| Metunic hesabı (alan adı + DNS) | metunic.com.tr müşteri paneli | Geçişin **tek** gereksinimi. NS ya da A kaydı buradan değişir. |
| cPanel (5.2.84.41:2083) | Alastyr sunucusu | Gerekli değil; eski dosyaların yedeği istenirse. |

Metunic girişi büromuzda yoksa: alan adı ya doğrudan Saba Özmen adına ya da
MyFC Medya'nın bayi hesabında. MyFC'ye "Metunic panel girişini bize devredin
**veya** aşağıdaki Adım 3'teki değişikliği yapın" demek yeterli.

## Önerilen yol: Cloudflare (site + /admin + iletişim formu, ücretsiz)

Alan adı Cloudflare DNS'e taşınır; site Cloudflare Pages'ten yayınlanır.
Böylece `sabaozmen.av.tr/admin` Türkiye'den erişilir olur (pages.dev engeli
yalnızca o alt alan adına özgü; Cloudflare'in kendi IP'leri engelli değil).

### Adım 1 — Cloudflare'de bölgeyi hazırla (canlıya etkisi YOK)
Cloudflare panelinde **Add a site → sabaozmen.av.tr → Free**. Cloudflare iki
ad sunucusu atar (`xxx.ns.cloudflare.com`, `yyy.ns.cloudflare.com`) — not al.

### Adım 2 — Kayıtları Cloudflare'e gir (hâlâ canlıya etkisi YOK)
Cloudflare'in otomatik taraması eksik bırakabilir; **her satır tek tek kontrol edilir.**

| Tip | Ad | Değer | Proxy |
|---|---|---|---|
| MX | `@` | `sabaozmen-av-tr.mail.protection.outlook.com` (öncelik 0) | — |
| TXT | `@` | `v=spf1 include:spf.protection.outlook.com -all` | — |
| CNAME | `selector1._domainkey` | `selector1-sabaozmen-av-tr._domainkey.sabaozmen.a-v1.dkim.mail.microsoft` | **DNS only (gri)** |
| CNAME | `selector2._domainkey` | `selector2-sabaozmen-av-tr._domainkey.sabaozmen.a-v1.dkim.mail.microsoft` | **DNS only (gri)** |
| CNAME | `autodiscover` | `autodiscover.outlook.com` | **DNS only (gri)** |
| CNAME | `@` | `sabaozmen.pages.dev` | Proxied (turuncu) |
| CNAME | `www` | `sabaozmen.pages.dev` | Proxied (turuncu) |

E-posta kayıtlarında proxy AÇIK kalırsa DKIM ve Outlook otomatik kurulum bozulur — gri olmalı.
İsteğe bağlı iyileştirme (sonra): `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:sabaozmen@sabaozmen.av.tr`.

Ardından Cloudflare Pages → proje **sabaozmen** → Custom domains → `sabaozmen.av.tr`
ve `www.sabaozmen.av.tr` eklenir (CNAME kayıtları otomatik doğrulanır).

### Adım 3 — Tek canlı değişiklik: Metunic'te ad sunucuları
Metunic panelinde alan adının NS kayıtları:
`ns1.metunic.com.tr`, `ns2.metunic.com.tr` → Cloudflare'in verdiği iki sunucu.

Yayılma: NS TTL ≈ 20 dk, çoğu yerde 1–2 saat, en geç 24 saat. Bu sürede
ziyaretçi eski **ya da** yeni siteyi görür; e-posta iki tarafta da aynı
kayıtlara gittiği için etkilenmez.

### Adım 4 — Geçiş sonrası (ben yaparım)
- GitHub repo değişkeni `SITE_ORIGIN=https://sabaozmen.av.tr` → canonical/sitemap
  adresleri gerçek alan adına döner; yeniden dağıtım ~40 sn.
- Cloudflare Pages ortam değişkenleri: `ADMIN_PASSWORD`, `SESSION_SECRET`,
  `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`.
- Cloudflare'de SSL/TLS **Full (strict)**, "Always Use HTTPS", HSTS.
- Doğrulama: `https://sabaozmen.av.tr/tr`, `/en`, `/de`, `/tr/makaleler`,
  `/tr/iletisim` (form), `/admin` (giriş), `/sitemap.xml`; ayrıca bir test
  e-postası gönder/al, `nslookup -type=MX sabaozmen.av.tr` eski değeri vermeli.
- Google Search Console'a alan adı eklenir, sitemap gönderilir.
- İletişim formu için Resend hesabı + `RESEND_API_KEY`; gönderici alan adı
  doğrulaması için Resend'in vereceği 3 DNS kaydı Cloudflare'e eklenir.

### Geri dönüş
Metunic'te NS'yi tekrar `ns1/ns2.metunic.com.tr` yapmak yeterli — eski bölge
Metunic'te silinmediği sürece olduğu gibi durur. **Eski bölgeyi ve Alastyr
barındırmasını geçişten en az 2 hafta sonra kapatın.**

## Alternatif yol: yalnızca A kaydı (GitHub Pages)

Ad sunucuları Metunic'te kalır; sadece iki web kaydı değişir. Daha küçük
değişiklik ama **/admin ve form arka ucu olmaz** (form, ziyaretçinin e-posta
programına düşer — bu yedek davranış sitede hazır).

Metunic DNS'te:
- `@` A `5.2.84.41` → **sil**, yerine dört A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `www` A `5.2.84.41` → **sil**, yerine CNAME `mffilizoglu.github.io`
- Diğer hiçbir kayda dokunulmaz.

Sonra ben: repo Pages ayarında custom domain `sabaozmen.av.tr` + Enforce HTTPS,
`gh-pages` dalını kök yol (`--base` yok, `--origin https://sabaozmen.av.tr`) ve
`CNAME` dosyasıyla yeniden yayınlarım.
