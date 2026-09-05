# -*- coding: utf-8 -*-
"""Generate the Open Graph card and touch icon.

The live site defines og:image *dimensions* but no og:image URL, and gives
Twitter an SVG (unsupported) — so link shares render blank (v4 §3.5 / ev. #12).
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join("..", "site", "public", "img")
FONTS = r"C:\Windows\Fonts"
SERIF = os.path.join(FONTS, "constan.ttf")     # Constantia — has Ğ, İ, ş
SERIF_B = os.path.join(FONTS, "constanb.ttf")
SANS = os.path.join(FONTS, "calibri.ttf")

BORDO = (160, 25, 68)
DEEP = (92, 14, 38)
INK = (20, 16, 15)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def gradient(size, c0, c1):
    """Diagonal gradient."""
    w, h = size
    img = Image.new("RGB", size, c1)
    d = ImageDraw.Draw(img)
    steps = 220
    for i in range(steps):
        t = i / (steps - 1)
        # draw diagonal bands
        x = int(-h + (w + h) * t)
        d.polygon([(x, 0), (x + (w + h) // steps + 2, 0),
                   (x + (w + h) // steps + 2 - h, h), (x - h, h)],
                  fill=lerp(c0, c1, t))
    return img


def glow(img, cx, cy, radius, color, strength=0.5):
    """Soft radial glow drawn as concentric translucent discs."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    steps = 60
    for i in range(steps, 0, -1):
        r = radius * i / steps
        a = int(255 * strength * (1 - i / steps) ** 2.2)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (a,))
    return Image.alpha_composite(img.convert("RGBA"), layer)


def motif(img, alpha=10):
    """The firm's disc mark, tiled very faintly as a background texture."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    W, H = img.size
    step, r = 170, 40
    for y in range(-40, H + step, step):
        for x in range(-40, W + step, step):
            cx, cy = x + step / 2, y + step / 2
            d.ellipse([cx - r, cy - r, cx + r, cy + r],
                      outline=(255, 255, 255, alpha), width=2)
            for dy, hw in ((-13, 3), (2, 5)):
                d.line([cx - r * 0.92, cy + dy, cx + r * 0.92, cy + dy + 4],
                       fill=(255, 255, 255, alpha), width=hw)
    return Image.alpha_composite(img.convert("RGBA"), layer)


def draw_mark(d, x, y, s, bg=(255, 255, 255), fg=BORDO):
    """The firm's mark: a disc with two wedge bands cut through it.
    Same geometry as mark.svg, expressed on a 0..100 grid scaled to size s."""
    k = s / 100.0
    r = 36.25 * k
    # NB: do not fill the disc here — the masked paste below is what draws it.
    # Filling first would make the punched-out bands impossible to see.

    def wedge(apex_x, band_cy, slope):
        # half-width grows linearly from the apex; draw as a polygon in px
        pts = []
        for gx in (-40.0, 140.0):
            h = abs(slope * (gx - apex_x))
            pts.append((x + gx * k, y + (band_cy - h) * k))
        for gx in (140.0, -40.0):
            h = abs(slope * (gx - apex_x))
            pts.append((x + gx * k, y + (band_cy + h) * k))
        return pts

    # punch the bands by painting them in the surrounding colour, clipped to the disc
    from PIL import Image as _I, ImageDraw as _D
    m = _I.new("L", (int(s) + 4, int(s) + 4), 0)
    md = _D.Draw(m)
    md.ellipse([50 * k - r, 49.65 * k - r, 50 * k + r, 49.65 * k + r], fill=255)
    for apex, bcy, sl in ((-1.67, 25.91, 0.032130), (96.35, 37.55, 0.032058)):
        md.polygon([(px - x, py - y) for px, py in wedge(apex, bcy, sl)], fill=0)
    disc = _I.new("RGB", m.size, bg)
    d._image.paste(disc, (int(x), int(y)), m)


def tracked(d, xy, text, font, fill, tracking=0):
    """Draw text with letter-spacing; returns the width drawn."""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + tracking
    return x - xy[0] - tracking


def text_w(d, text, font, tracking=0):
    return sum(d.textlength(c, font=font) for c in text) + tracking * (len(text) - 1)


# --------------------------------------------------------------- OG card
W, H = 1200, 630
img = gradient((W, H), DEEP, INK)
img = motif(img, 11)
img = glow(img, 190, 60, 760, BORDO, 0.42)
d = ImageDraw.Draw(img)

PAD = 88
draw_mark(d, PAD, 92, 92)

f_name = ImageFont.truetype(SERIF, 78)
f_sub = ImageFont.truetype(SANS, 25)
f_tag = ImageFont.truetype(SERIF, 37)
f_foot = ImageFont.truetype(SANS, 25)

tracked(d, (PAD, 232), "SABA ÖZMEN", f_name, (255, 255, 255), 5)
tracked(d, (PAD + 3, 330), "AVUKATLIK ORTAKLIĞI", f_sub, (255, 255, 255, 200), 6.5)

d.line([PAD, 392, PAD + 96, 392], fill=BORDO, width=3)

d.text((PAD, 424), "Taşınmaz hukukunda öğreti ve uygulama.", font=f_tag, fill=(255, 255, 255))
d.text((PAD, 520), "İstanbul Barosu'na kayıtlı avukatlık ortaklığı · 2004", font=f_foot, fill=(212, 200, 198))

img.convert("RGB").save(os.path.join(OUT, "og.png"), "PNG", optimize=True)
print("og.png", os.path.getsize(os.path.join(OUT, "og.png")))

# --------------------------------------------------------------- touch icon
for size, name in [(180, "apple-touch-icon.png"), (512, "icon-512.png"), (192, "icon-192.png")]:
    ic = Image.new("RGB", (size, size), BORDO)
    di = ImageDraw.Draw(ic)
    # the mark, drawn white on the burgundy ground with the bands showing through
    pad = size * 0.10
    draw_mark(di, pad, pad, size - 2 * pad, bg=(255, 255, 255))
    ic.save(os.path.join(OUT, name), "PNG", optimize=True)
    print(name, os.path.getsize(os.path.join(OUT, name)))
