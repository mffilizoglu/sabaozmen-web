# Yayına alma — GitHub + Cloudflare Pages

Tamamı ücretsiz paketlerle çalışır. Ölçüler doğrulandı:

| Sınır | Ücretsiz paket | Bu site |
|---|---|---|
| Cloudflare Pages — dosya başına | 25 MiB | en büyüğü **19,7 MB** (`32.pdf`) |
| Cloudflare Pages — dosya sayısı | 20.000 | **361** |
| Cloudflare Pages — derleme | 500 / ay | panelden her kayıt 1 derleme |
| Workers (Functions) | 100.000 istek / gün | panel + form |
| Bant genişliği | sınırsız | — |
| GitHub deposu | 1 GB önerilen | **~145 MB** |

## Mimari

```
GitHub deposu ──push──> Cloudflare Pages ──derleme──> dist/  (267 statik sayfa)
      ▲                        │
      │                        ├── functions/api/contact.js     iletişim formu
      └────commit──────────────┴── functions/admin/[[path]].js  yönetim paneli
```

Panelde bir kayıt kaydedildiğinde Function, `site/content/team.json` veya
`events.json` dosyasını (ve yüklenen görseli) GitHub'a **commit eder**. Bu push
Pages derlemesini tetikler ve değişiklik yaklaşık **60–90 saniye** içinde
yayına girer.

Neden KV değil: genel sayfalar derleme anında üretiliyor. İçerik KV'de dursaydı
derleme onu göremezdi; görebilmesi için ya derlemeye KV anahtarı vermek ya da
tüm şablon katmanını Workers'a taşımak gerekirdi. Depoya yazmak, hâlihazırda
sınanmış derlemeyi tek üretici olarak bırakır ve her içerik değişikliğinin
sürüm geçmişini verir.

## Adımlar

### 1. Kimlik doğrulama (sizin yapmanız gereken tek adım)

Terminalde:

```bash
gh auth login
```

Sonra:

```bash
npx wrangler login
```

Her ikisi de tarayıcı açar. Bunlar tamamlandığında geri kalanı ben yapabilirim.

### 2. Depo ve ilk gönderim

```bash
gh repo create sabaozmen-web --private --source=. --remote=origin --push
```

### 3. Cloudflare Pages projesi

```bash
npx wrangler pages project create sabaozmen --production-branch=main
```

Pages panelinde depoyu bağlayın ve derleme ayarları:

| Ayar | Değer |
|---|---|
| Build command | `node site/build.js` |
| Build output directory | `dist` |
| Root directory | *(boş)* |

`functions/` klasörü otomatik algılanır.

### 4. Ortam değişkenleri

Pages → Settings → Environment variables → **Production** ve **Preview**:

| Değişken | Tür | Açıklama |
|---|---|---|
| `ADMIN_PASSWORD` | Secret | Panel parolası |
| `SESSION_SECRET` | Secret | Uzun rastgele dizi (`openssl rand -hex 32`) |
| `GITHUB_TOKEN` | Secret | Fine-grained PAT — yalnızca bu depo, **Contents: read and write** |
| `GITHUB_OWNER` | Plain | GitHub kullanıcı adı |
| `GITHUB_REPO` | Plain | `sabaozmen-web` |
| `SITE_ORIGIN` | Plain | Gerçek alan adı bağlanınca; yoksa `CF_PAGES_URL` kullanılır |
| `RESEND_API_KEY` | Secret | İletişim formu e-postası (resend.com, 100 e-posta/gün ücretsiz) |
| `CONTACT_TO` | Plain | Formun düşeceği adres |

`GITHUB_TOKEN` olmadan panel açılır ama kaydedemez ve bunu açıkça yazar.
`RESEND_API_KEY` olmadan form, ziyaretçiye doğrudan e-posta adresini söyler —
sessizce kaybolmaz.

### 5. Doğrulama

```bash
for u in / /tr /en /de /tr/makaleler /tr/etkinlikler /sitemap.xml /robots.txt; do
  printf "%-22s %s\n" "$u" "$(curl -sL -o /dev/null -w '%{http_code}' https://<proje>.pages.dev$u)"
done
```

Yerelde:

```bash
npm run build          # 267 sayfa üretir, boyut sınırlarını denetler
npm run preview        # wrangler ile Functions dahil yerel sunum
npm run test:functions # 13 denetim
npm run test:admin     # 23 denetim (önce npm run dev)
```

## Alan adı

Şu an hedef `*.pages.dev`. **`sabaozmen.av.tr` alan adına dokunulmadı** —
büronun e-postası o alan adı üzerinden akıyor.

Gerçek alan adına geçilecekse önce şunlar kaydedilmeli (geri dönüş planı):

```bash
nslookup -type=MX  sabaozmen.av.tr 8.8.8.8
nslookup -type=TXT sabaozmen.av.tr 8.8.8.8
nslookup -type=NS  sabaozmen.av.tr 8.8.8.8
```

Dikkat: Cloudflare Pages'e özel alan adı bağlamak, alan adının **Cloudflare
nameserver'larına taşınmasını** gerektirir — bu, e-posta yönlendirmesini de
taşır. MX ve SPF/DKIM/DMARC kayıtları birebir aktarılmadan yapılmamalıdır.
Riski sıfırlamak isterseniz `yeni.sabaozmen.av.tr` gibi bir alt alan adı tek bir
CNAME ile bağlanır ve MX kayıtlarına hiç dokunulmaz.
