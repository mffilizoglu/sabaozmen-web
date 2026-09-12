# sabaozmen.av.tr — DNS envanteri (değişiklik ÖNCESİ, geri dönüş kaydı)

Alındığı tarih: 2026-09-12 · Kaynak: 8.8.8.8 üzerinden canlı sorgu

## Yetki
| Kayıt | Değer |
|---|---|
| NS | ns1.metunic.com.tr, ns2.metunic.com.tr |
| SOA primary | sabaozmen.av.tr (cPanel tarzı zone) |

## Web (taşınacak olanlar — SADECE bu ikisi)
| Ad | Tip | Değer | TTL |
|---|---|---|---|
| sabaozmen.av.tr | A | 5.2.84.41 | ~3600 |
| www.sabaozmen.av.tr | A | 5.2.84.41 | ~3600 |

Eski barındırma: 5.2.84.41 (PTR poine.alastyr.com) — cPanel/WHM, LiteSpeed, PHP CMS (MyFC Medya, /__myDB/).

## E-posta — Microsoft 365 (DOKUNULMAYACAK)
| Ad | Tip | Değer |
|---|---|---|
| sabaozmen.av.tr | MX 0 | sabaozmen-av-tr.mail.protection.outlook.com |
| sabaozmen.av.tr | TXT | v=spf1 include:spf.protection.outlook.com -all |
| selector1._domainkey | CNAME | selector1-sabaozmen-av-tr._domainkey.sabaozmen.a-v1.dkim.mail.microsoft |
| selector2._domainkey | CNAME | selector2-sabaozmen-av-tr._domainkey.sabaozmen.a-v1.dkim.mail.microsoft |
| autodiscover | CNAME | autodiscover.outlook.com |
| _dmarc | — | (yok — ileride eklenmesi önerilir: `v=DMARC1; p=none; rua=mailto:...`) |

Bulunmayan alt alan adları: mail, webmail, ftp, cpanel, smtp, pop, imap.

## Geri dönüş
Yeni site istenmediğinde tek yapılacak: apex ve www A kayıtlarını tekrar 5.2.84.41 yapmak.
E-posta kayıtları hiçbir senaryoda değişmez.
