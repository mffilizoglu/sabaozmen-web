# -*- coding: utf-8 -*-
import json, re
from collections import Counter

d = json.load(open('pdf_text.json', encoding='utf-8'))

# Legacy Turkish PostScript font mapping seen in older PDFs (say>l> -> sayili)
LEGACY = {'›': 'ı', 'ﬂ': 'ş', '¤': 'ğ', '‹': 'İ',
          'ƒ': 'Ş', '‰': 'Ğ'}


def fixlegacy(t):
    if not t:
        return t
    hits = sum(t.count(k) for k in ('›', 'ﬂ', '¤'))
    if hits < 5:                       # only touch clearly-legacy text
        return t
    for k, v in LEGACY.items():
        t = t.replace(k, v)
    return t


def trlower(s):
    """Turkish-aware lowercase. Plain .lower() turns 'İ' into 'i'+U+0307,
    which silently breaks every regex starting with 'i' (e.g. 'ipotek')."""
    return s.replace('İ', 'i').replace('I', 'ı').lower()


def clean(t):
    if not t:
        return ""
    t = t.replace('\xa0', ' ')
    # Rejoin words split across lines BEFORE dropping soft hyphens — stripping
    # them first leaves "ger çekleştirilmesinde" instead of the whole word.
    t = re.sub(r'(\w)[­\-‐‑]\s*\n\s*(\w)', r'\1\2', t)
    t = t.replace('­', '')
    t = re.sub(r'\s*\n\s*', ' ', t)
    t = re.sub(r'\s{2,}', ' ', t)
    return t.strip(' .;:,')


def grab(txt, starts, stops, maxlen=1600, minlen=90):
    for sp in starts:
        for m in re.finditer(sp, txt, re.I):
            rest = txt[m.end():]
            cut = len(rest)
            for stop in stops:
                s = re.search(stop, rest, re.I)
                if s and 60 < s.start() < cut:
                    cut = s.start()
            seg = clean(rest[:min(cut, maxlen)])
            if len(seg) >= minlen:
                return seg
    return ""


STOP_TR = [r'\bAbstract\b', r'Anahtar\s*Kelime', r'\bKeywords?\b', r'\bGIRIS\b',
           r'\bGİRİŞ\b', r'Genel\s*Olarak\s*Konunun']
STOP_EN = [r'Anahtar\s*Kelime', r'\bKeywords?\b', r'\bÖzet?\b', r'\bGİRİŞ\b']

JOURNALS = [
    (r'İzmir\s*Barosu\s*Dergisi', 'İzmir Barosu Dergisi'),
    (r'Türkiye\s*Barolar\s*Birliği\s*Dergisi|TBB\s*Dergisi', 'Türkiye Barolar Birliği Dergisi'),
    (r'Maltepe\s*Üniversitesi[^\n]{0,40}Dergisi|MHFD', 'Maltepe Üniversitesi Hukuk Fakültesi Dergisi'),
    (r'Bahçeşehir[^\n]{0,60}Dergisi', 'Bahçeşehir Üniversitesi Hukuk Fakültesi Dergisi'),
    (r'Marmara\s*Üniversitesi[^\n]{0,80}Dergisi', 'Marmara Üniversitesi Hukuk Araştırmaları Dergisi'),
    (r'Legal[^\n]{0,30}Dergisi|Legal\s*Temmuz', 'Legal Hukuk Dergisi'),
    (r'Terazi\s*Hukuk\s*Dergisi', 'Terazi Hukuk Dergisi'),
    (r'Ankara\s*Barosu\s*Dergisi', 'Ankara Barosu Dergisi'),
    (r'İstanbul\s*Barosu\s*Dergisi', 'İstanbul Barosu Dergisi'),
    (r'Kadir\s*Has[^\n]{0,60}Dergisi', 'Kadir Has Üniversitesi Hukuk Fakültesi Dergisi'),
    (r'Armağan', 'Armağan'),
]

TAGS = [
    ('kat-mulkiyeti', 'Kat Mülkiyeti',
     r'kat mülkiyet|kat irtifak|634|ortak yer|eklenti|yönetim plan|toplu yapı|genel gider|avansa katılma'),
    ('arsa-payi', 'Arsa Payı Karşılığı İnşaat',
     r'arsa pay|apkse|karşılığı inşaat|yüklenici|avans tapu'),
    ('kentsel-donusum', 'Kentsel Dönüşüm',
     r'kentsel dönüşüm|6306|riskli yap|afet riski'),
    ('tapu-tescil', 'Tapu ve Tescil',
     r'tapu|tescil|kadastro|şerh|yolsuz|taşınmaz satış'),
    ('ipotek-rehin', 'İpotek ve Rehin',
     r'ipote[kğ]|rehn|rehin|haciz|mortgage|teminat|dağıtılmasına bağlı'),
    ('intifa', 'İntifa ve Sınırlı Ayni Haklar',
     r'intifa|üst hakk|irtifak|sükna'),
    ('kooperatif', 'Kooperatifler', r'kooperatif'),
    ('kamulastirma', 'Kamulaştırma ve İmar', r'kamulaştırma|imar plan|imar hukuku|imar planındaki'),
    ('payli-mulkiyet', 'Paylı Mülkiyet ve Ortaklığın Giderilmesi',
     r'paylı mülkiyet|birlikte mülkiyet|elbirliği|izale|şuyu|paydaş|paylı halin'),
    ('sozlesmeler', 'Sözleşmeler Hukuku',
     r'sözleşme|akdi|akdinde|temerrüt|cezai şart|ceza koşulu|satış vaad|şekline|bağışlama|cayma'),
    ('tarim-arazi', 'Tarım Arazileri', r'tarım arazi|toprak koruma|5403'),
    ('miras-aile', 'Miras ve Aile Hukuku',
     r'miras|aile hukuku|manevi tazminat|evli kişi|nişan'),
    ('icra-iflas', 'İcra ve İflas', r'icra|iflas|cebri|paraya çevril'),
    ('tuketici', 'Tüketici Hukuku', r'tüketici'),
    ('yargi-elestirisi', 'Yargı Kararı Eleştirisi',
     r'yargıtay|anayasa mahkemesi|hukuk genel kurulu|eleştiri|içtihat'),
    ('devre-mulk', 'Devre Mülk ve Devre Tatil', r'devre mülk|devre tatil'),
    ('noterlik', 'Noterlik İşlemleri', r'noter'),
    ('meslek', 'Meslek ve Hukuk Eğitimi',
     r'genç hukukçu|öğüt|avukatlık ücret|hukuk eğitim'),
    ('vekalet', 'Temsil ve Vekâlet', r'temsil yetkis|vekaletname|vekâletname'),
    ('orman', 'Orman ve 2-B Arazileri', r'orman hukuku|2-b|6292'),
]

# Dates published on the firm's own homepage listing — authoritative.
HOME_DATES = {35: "2022-10-17", 36: "2022-12-12", 37: "2023-09-11",
              38: "2024-03-20", 39: "2024-03-20", 40: "2024-06-07",
              41: "2025-10", 42: "2025-08"}
MONTH = {'Ocak': 1, 'Şubat': 2, 'Mart': 3, 'Nisan': 4, 'Mayıs': 5, 'Haziran': 6,
         'Temmuz': 7, 'Ağustos': 8, 'Eylül': 9, 'Ekim': 10, 'Kasım': 11, 'Aralık': 12}

out = []
for r in d:
    head = fixlegacy(r.get('head', '') or '')
    rec = {"id": r["id"], "title": clean(r["title"]), "pdf": r["pdf"],
           "pages": r.get("pages"), "hasText": len(head.strip()) >= 200}

    m = re.search(r'\(([^)]*\bile)\)\s*$', r["title"])
    coauth = None
    if m:
        coauth = re.sub(r'\s*ile\s*$', '', m.group(1)).strip()
        coauth = re.sub(r'^(Legal\s+\w+\s+\d{4}\s*-\s*)', '', coauth).strip()
    rec["coAuthor"] = coauth
    rec["titleClean"] = clean(re.sub(r'\s*\([^)]*\bile\)\s*$', '', r["title"]))

    j = None
    for pat, name in JOURNALS:
        if re.search(pat, head, re.I):
            j = name
            break
    rec["journal"] = j

    m = re.search(r'(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s*(20\d\d)', head)
    rec["issueLabel"] = m.group(0) if m else None
    m2 = re.search(r'Kabul\s*Tarihi\s*[:：]?\s*(\d{2})\.(\d{2})\.(\d{4})', head)
    rec["acceptedDate"] = "{}-{}-{}".format(m2.group(3), m2.group(2), m2.group(1)) if m2 else None
    yrs = sorted(set(int(y) for y in re.findall(r'\b(19[89]\d|20[0-2]\d)\b', head[:3000])))
    rec["yearsSeen"] = yrs
    def small_num(pat, limit):
        mm = re.search(pat, head)
        if not mm:
            return None
        v = int(mm.group(1))
        return str(v) if 0 < v <= limit else None   # guards against gazette nos.

    rec["volume"] = small_num(r'Cilt\s*[:：]?\s*(\d+)', 200)
    rec["issue"] = small_num(r'Sayı\s*[:：]?\s*(\d+)', 500)
    rec["orcids"] = list(dict.fromkeys(re.findall(r'([\d]{4}-[\d]{4}-[\d]{4}-[\dXx]{4})', head)))

    if rec["id"] in HOME_DATES:
        rec["date"] = HOME_DATES[rec["id"]]
        rec["dateSource"] = "site"
    elif rec["issueLabel"]:
        mm = re.match(r'(\w+)\s*(\d{4})', rec["issueLabel"])
        rec["date"] = "{}-{:02d}".format(mm.group(2), MONTH.get(mm.group(1), 1))
        rec["dateSource"] = "pdf-issue"
    elif rec["acceptedDate"]:
        rec["date"] = rec["acceptedDate"]
        rec["dateSource"] = "pdf-accepted"
    elif yrs:
        rec["date"] = str(max(yrs))
        rec["dateSource"] = "pdf-inferred"
    else:
        rec["date"] = None
        rec["dateSource"] = None

    rec["ozet"] = grab(head, [r'\bÖ\s*Z\s*E\s*T\b\s*[:：]?', r'\bÖzet\s*[:：]', r'\bÖz\s*[:：]'], STOP_TR)
    rec["abstract"] = grab(head, [r'\bA\s*B\s*S\s*T\s*R\s*A\s*C\s*T\b\s*[:：]?', r'\bAbstract\s*[:：]'], STOP_EN)
    rec["abstractSource"] = "pdf" if rec["ozet"] else None
    if not rec["ozet"] and rec["hasText"]:
        body = grab(head, [r'Genel\s*Olarak\s*Konunun\s*Sunumu', r'\bGİRİŞ\b',
                           r'\bGiriş\b', r'GENEL\s*OLARAK'], [], 1200, 150)
        if not body:
            paras = [clean(p) for p in re.split(r'\n\s*\n', head) if len(clean(p)) > 200]
            paras = [p for p in paras if not re.search(r'ORCID|e-?posta|@|Hakem denetimi|Anabilim Dalı', p)]
            body = paras[0] if paras else ""
        if len(body) >= 150:
            rec["ozet"] = body[:900]
            rec["abstractSource"] = "pdf-intro"
    rec["needsAbstract"] = not rec["ozet"]

    def sp(s):
        return [x.strip(' .;') for x in re.split(r'[,;]', s) if 2 < len(x.strip()) < 70]

    rec["keywordsTr"] = sp(grab(head, [r'Anahtar\s*Kelimeler\s*[:：]'],
                                [r'\bAbstract\b', r'\bKeywords?\b', r'\bGİRİŞ\b'], 500, 10))[:8]
    rec["keywordsEn"] = sp(grab(head, [r'\bKeywords\s*[:：]'],
                                [r'Anahtar', r'\bÖzet?\b', r'\bGİRİŞ\b'], 500, 10))[:8]

    rec["titleEn"] = None
    for line in head.split('\n'):
        L = line.strip()
        if (25 < len(L) < 200 and L.upper() == L
                and not re.search(r'[ÇĞİÖŞÜçğışöü]', L)
                and re.search(r'\b(OF|IN|THE|AND|TO|FOR|ON)\b', L)):
            rec["titleEn"] = L.title()
            break

    basis = trlower(r["title"] + " " + " ".join(rec["keywordsTr"]))
    rec["topics"] = [t[0] for t in TAGS if re.search(t[2], basis, re.I)]
    if not rec["topics"]:
        rec["topics"] = ["sozlesmeler"]
    out.append(rec)

json.dump({"tags": [{"slug": a, "tr": b} for a, b, _ in TAGS], "articles": out},
          open('article_meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

def ok(k):
    return sum(1 for r in out if r.get(k))

print("total", len(out))
for k in ["hasText", "journal", "ozet", "abstract", "keywordsTr", "titleEn", "date", "coAuthor"]:
    print("  %-13s %s" % (k, ok(k)))
print("  needsAbstract", sum(1 for r in out if r['needsAbstract']),
      [r['id'] for r in out if r['needsAbstract']])
print("  dateSources", Counter(r['dateSource'] for r in out))
print("  topicSpread", Counter(t for r in out for t in r['topics']).most_common())
