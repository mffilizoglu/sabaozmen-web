# -*- coding: utf-8 -*-
"""Prepare event posters for the web from the originals the firm sent.

Reads the crop / blank specs from ref/events_seed.js (via node), then for each
event: crops screenshots down to the poster, paints over private details
(Zoom IDs and passwords, an IBAN, a private phone number), scales to at most
1200 px and writes site/public/img/events/<slug>.jpg.

Writes ref/event_posters.json  {slug: {path, w, h}}  for events_seed.js.

Usage: python ref/make_event_posters.py "<folder with the WhatsApp images>"
"""
import json, os, subprocess, sys
from PIL import Image, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "site", "public", "img", "events")
os.makedirs(OUT, exist_ok=True)

spec = json.loads(subprocess.check_output(
    ["node", "-e", "const {E}=require('./ref/events_seed.js');"
                   "console.log(JSON.stringify(E.map(e=>({slug:e.slug,src:e.src,crop:e.crop||null,blank:e.blank||[]}))))"],
    cwd=ROOT).decode("utf-8"))


def load(src):
    if src == "HKU_AFIS":
        # the university's public poster (the WhatsApp image was a private invitation)
        import pymupdf
        pdf = os.path.join(os.environ["TEMP"], "hku_afis.pdf")
        pix = pymupdf.open(pdf)[0].get_pixmap(dpi=160)
        return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    return Image.open(os.path.join(SRC, src)).convert("RGB")


def paint(im, box):
    """Cover a region with the median colour of the strip just above it."""
    w, h = im.size
    x0, y0, x1, y1 = int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)
    strip = im.crop((x0, max(0, y0 - 8), x1, max(1, y0 - 2)))
    colour = tuple(int(c) for c in ImageStat.Stat(strip).median)
    im.paste(colour, (x0, y0, x1, y1))


out = {}
for e in spec:
    im = load(e["src"])
    for b in e["blank"]:
        paint(im, b)                     # blanks are fractions of the original
    if e["crop"]:
        w, h = im.size
        c = e["crop"]
        im = im.crop((int(c[0] * w), int(c[1] * h), int(c[2] * w), int(c[3] * h)))
    w, h = im.size
    s = min(1.0, 1200 / max(w, h))
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    name = e["slug"] + ".jpg"
    im.save(os.path.join(OUT, name), "JPEG", quality=80, optimize=True, progressive=True)
    out[e["slug"]] = {"path": "/img/events/" + name, "w": im.size[0], "h": im.size[1]}
    print("%-86s %4dx%-4d %4d KB" % (e["slug"][:86], im.size[0], im.size[1],
                                     os.path.getsize(os.path.join(OUT, name)) // 1024))

with open(os.path.join(ROOT, "ref", "event_posters.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("%d posters" % len(out))
