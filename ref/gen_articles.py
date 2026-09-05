# -*- coding: utf-8 -*-
"""Assemble the final article dataset for the new site."""
import json, re, os

meta = json.load(open('article_meta.json', encoding='utf-8'))
titles = json.load(open('titles_endr.json', encoding='utf-8'))
EN, DE = titles['en'], titles['de']
arts, TAGS = meta['articles'], meta['tags']

TR_MAP = str.maketrans({'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g',
                        'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c',
                        'â': 'a', 'î': 'i', 'û': 'u'})


def slugify(s, maxlen=70):
    s = s.translate(TR_MAP).lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    words, out = s.split('-'), []
    for w in words:
        if len('-'.join(out + [w])) > maxlen:
            break
        out.append(w)
    return '-'.join(out) or 'makale'



# --- Turkish-aware case handling -------------------------------------------
def tr_lower(s):
    return s.replace('İ', 'i').replace('I', 'ı').lower()


def tr_upper_first(w):
    if not w:
        return w
    first = w[0]
    first = 'İ' if first == 'i' else ('I' if first == 'ı' else first.upper())
    return first + w[1:]


# Legal abbreviations and statute numbers that must stay uppercase.
KEEP = {"TMK", "MK", "KMK", "TBK", "TTK", "HGK", "AYM", "TBB", "APKSE", "GYO",
        "KVKK", "SPK", "İİK", "HMK", "AİHM", "II", "III", "IV", "VI", "VII"}
SMALL = {"ve", "ile", "veya", "ya", "da", "de", "ki"}


SMALL_EN = {"of", "in", "on", "the", "and", "or", "to", "for", "a", "an",
            "with", "at", "by", "from", "as", "into"}
SMALL_DE = {"und", "oder", "der", "die", "das", "des", "dem", "den", "im",
            "in", "an", "auf", "zu", "zum", "zur", "bei", "beim", "von",
            "vom", "mit", "für", "am", "im", "ins", "ans"}


def _cap(word, lang):
    if lang == "tr":
        return tr_upper_first(tr_lower(word))
    # Turkish 'İ' lowercases to 'i' + U+0307 in non-Turkish locales; drop the
    # stray combining dot so Turkish proper names read correctly in EN/DE.
    w = word.lower().replace("̇", "")
    return w[:1].upper() + w[1:]


def title_case(s, lang):
    """Six source titles are typed in ALL CAPS; the rest are mixed case.
    Normalise only the shouting ones, using each language's own casing rules —
    Turkish 'I' lowercases to 'ı', which would wreck English and German words."""
    letters = [c for c in s if c.isalpha()]
    if not letters:
        return s
    if sum(1 for c in letters if c.isupper()) / len(letters) < 0.7:
        return s                       # already mixed case — leave it alone

    small = {"tr": SMALL, "en": SMALL_EN, "de": SMALL_DE}[lang]
    lower = tr_lower if lang == "tr" else str.lower

    out = []
    for i, tok in enumerate(s.split(" ")):
        core = tok.strip("().,:;–—’'\"")
        if not core:
            out.append(tok)
            continue
        if core in KEEP or any(ch.isdigit() for ch in core):
            out.append(tok)            # TMK, 6306, 2014/12321, 2-B …
            continue
        if lower(core) in small and i > 0:
            new_core = lower(core)
        else:                          # capitalise across hyphens too
            new_core = "-".join(_cap(part, lang) for part in core.split("-"))
        out.append(tok.replace(core, new_core, 1))
    return " ".join(out)


def strip_paren(t):
    """Remove the trailing '(… ile)' / '(With …)' / '(mit …)' co-author note,
    plus footnote asterisks that leaked in from the journal typesetting."""
    t = re.sub(r'\s*\([^()]*\b(ile|With|with|mit|Mit)\b[^()]*\)\s*$', '', t)
    t = re.sub(r'[\s*∗·]+$', '', t)
    t = re.sub(r'\s{2,}', ' ', t)
    return t.strip()


# Turkish month names for display
def year_of(d):
    return int(d[:4]) if d else None


seen = set()
out = []
for i, a in enumerate(arts):
    tr = title_case(strip_paren(a['title']), 'tr')
    en = title_case(strip_paren(EN[i]), 'en') if i < len(EN) else None
    de = title_case(strip_paren(DE[i]), 'de') if i < len(DE) else None

    slug = slugify(tr)
    base, n = slug, 2
    while slug in seen:
        slug = f"{base}-{n}"
        n += 1
    seen.add(slug)

    # local PDF copy path (the originals live in /site_images on the old site)
    local_pdf = f"/makaleler/pdf/{a['id']:02d}.pdf"

    kw = a['keywordsTr'] or []
    kw = [k for k in kw if len(k) > 2][:8]

    rec = {
        "id": a['id'],
        "slug": slug,
        "title": {"tr": tr, "en": en, "de": de},
        "coAuthor": a['coAuthor'],
        "date": a['date'],
        "year": year_of(a['date']),
        "dateSource": a['dateSource'],
        "journal": a['journal'],
        "volume": a['volume'],
        "issue": a['issue'],
        "orcids": a['orcids'],
        "topics": a['topics'],
        "keywords": {"tr": kw, "en": a['keywordsEn'][:8]},
        "summary": {"tr": a['ozet'] or None, "en": a['abstract'] or None},
        "summarySource": a['abstractSource'],
        "pages": a['pages'],
        "pdf": local_pdf,
        "pdfOriginal": a['pdf'],
        # editorial flags surfaced in the handover report
        "needs": {
            "summary": a['needsAbstract'],
            "date": a['date'] is None,
            "journal": a['journal'] is None,
            "scanned": not a['hasText'],
        },
    }
    out.append(rec)

out.sort(key=lambda r: (r['date'] or '0000'), reverse=True)

payload = {
    "tags": TAGS,
    "articles": out,
    "stats": {
        "total": len(out),
        "withSummary": sum(1 for r in out if r['summary']['tr']),
        "withEnglishAbstract": sum(1 for r in out if r['summary']['en']),
        "withDate": sum(1 for r in out if r['date']),
        "withJournal": sum(1 for r in out if r['journal']),
        "scanned": sum(1 for r in out if r['needs']['scanned']),
    },
}

dest = '../site/content/articles.json'
os.makedirs(os.path.dirname(dest), exist_ok=True)
json.dump(payload, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(payload['stats'], indent=1))
print("slugs unique:", len(set(r['slug'] for r in out)) == len(out))
print("sample:", out[0]['slug'], '|', out[0]['date'], '|', out[0]['topics'])
print("no EN title:", [r['id'] for r in out if not r['title']['en']])
print("no DE title:", [r['id'] for r in out if not r['title']['de']])
