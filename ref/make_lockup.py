# -*- coding: utf-8 -*-
"""Rebuild the wordmark lockup as real type instead of an 887x181 raster.

logowithtextsabaozmen.png blurs as soon as it is scaled. The letterforms were
matched against ten candidates by ink-width-to-cap-height ratio per glyph
(S, Ö, Z, M, E, N — the six that segment cleanly). Cormorant wins at mean|Δ|
0.032, roughly half the error of the next candidate; it is SIL OFL licensed and
covers Turkish completely, so it can be embedded and handed to third parties.

Geometry measured from the PNG, normalised to mark height = 100:
    mark          100.59 x 100
    gap            13.02
    text block    406.51 wide, starting at x 113.02
    line 1        cap height 40.83, baseline 49.11   (SABA ÖZMEN)
    rule          y 56.21, height 2.37
    line 2        cap height 23.67, baseline 88.76   (AVUKATLIK ORTAKLIĞI)

Note the cap heights are TRUE cap heights, taken from M and A. Measuring the
full ink height instead would include the umlaut and the breve and blow the
type up by a third.

Outputs:
  public/img/lockup.svg        outlines, no font needed — print, e-mail, third parties
  lib/lockup.inline.txt        live <text> for the site, selectable and CSS-colourable
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen

WEIGHT = int(os.environ.get("LOCKUP_WEIGHT", "500"))
SRC = os.path.join("fonttest", "Cormorant.ttf")
MARK = open(os.path.join("..", "site", "lib", "mark.inline.txt"), encoding="utf-8").read()

L1, L2 = "SABA ÖZMEN", "AVUKATLIK ORTAKLIĞI"
MARK_W = 100.59
TEXT_X, TEXT_W = 113.02, 406.51
CAP1, BASE1 = 40.83, 49.11
CAP2, BASE2 = 23.67, 88.76
RULE_Y, RULE_H = 56.21, 2.37
VB_W, VB_H = TEXT_X + TEXT_W, 100.0

font = instancer.instantiateVariableFont(TTFont(SRC, fontNumber=0), {"wght": WEIGHT})
upem = font["head"].unitsPerEm
cap = font["OS/2"].sCapHeight or int(upem * 0.7)
cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]
print("Cormorant wght=%d  upem=%d capHeight=%d (%.3f em)" % (WEIGHT, upem, cap, cap / upem))

size1, size2 = CAP1 / (cap / upem), CAP2 / (cap / upem)


def advances(text, size):
    out = []
    for ch in text:
        gn = cmap.get(ord(ch))
        if gn is None:
            raise SystemExit("font is missing %r" % ch)
        out.append((gn, hmtx[gn][0] * size / upem))
    return out


def ink_bearings(text, size):
    """Left bearing of the first glyph and right bearing of the last, in user
    units. TEXT_W was measured ink-to-ink on the PNG, so tracking has to be
    solved on ink extents — using advance widths instead leaves the line short
    by both side bearings and pushes the tracking negative."""
    gl = glyf = font["glyf"] if "glyf" in font else None
    first, last = cmap[ord(text[0])], cmap[ord(text[-1])]
    s = size / upem
    lsb = hmtx[first][1] * s
    adv_last, lsb_last = hmtx[last][0] * s, hmtx[last][1] * s
    xmax = 0
    if gl is not None and gl[last].numberOfContours:
        xmax = (gl[last].xMax - gl[last].xMin) * s
    rsb = adv_last - lsb_last - xmax
    return lsb, rsb


def tracking_for(text, size, target_w):
    adv = advances(text, size)
    lsb, rsb = ink_bearings(text, size)
    ink_natural = sum(a for _, a in adv) - lsb - rsb
    return (target_w - ink_natural) / (len(text) - 1), ink_natural, lsb


tr1, nat1, lsb1 = tracking_for(L1, size1, TEXT_W)
tr2, nat2, lsb2 = tracking_for(L2, size2, TEXT_W)
print("size %.2f / %.2f | tracking %+.3f (nat %.1f) / %+.3f (nat %.1f)"
      % (size1, size2, tr1, nat1, tr2, nat2))
if tr1 < 0 or tr2 < 0:
    print("  !! negative tracking — the face is too wide for this lockup")


def outline(text, size, tracking, x, baseline):
    parts, pen_x, s = [], x, size / upem
    for gn, adv in advances(text, size):
        pen = SVGPathPen(gs)
        gs[gn].draw(pen)
        d = pen.getCommands()
        if d:
            parts.append('<g transform="translate(%.4f %.4f) scale(%.6f %.6f)">'
                         '<path d="%s"/></g>' % (pen_x, baseline, s, -s, d))
        pen_x += adv + tracking
    return "".join(parts)


mark_svg = (MARK.replace('class="logo__mark" ', "")
                .replace('<svg ', '<svg width="%.2f" height="100" x="0" y="0" ' % MARK_W))
rule = '<rect x="%.3f" y="%.3f" width="%.3f" height="%.3f"/>' % (TEXT_X, RULE_Y, TEXT_W, RULE_H)

outlined = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.2f %.2f">' % (VB_W, VB_H)
            + mark_svg.replace('class="logo__mark-p" ', 'fill="#a01944" ')
            + '<g fill="#14100f">'
            + outline(L1, size1, tr1, TEXT_X - lsb1, BASE1) + rule
            + outline(L2, size2, tr2, TEXT_X - lsb2, BASE2) + '</g></svg>\n')

OUT = os.path.join("..", "site", "public", "img")
open(os.path.join(OUT, "lockup.svg"), "w", encoding="utf-8").write(outlined)
white = outlined.replace('fill="#14100f"', 'fill="#ffffff"').replace('fill="#a01944"', 'fill="#ffffff"')
open(os.path.join(OUT, "lockup-white.svg"), "w", encoding="utf-8").write(white)
print("lockup.svg / lockup-white.svg written (%d bytes, outlined)" % len(outlined))

live = ('<svg class="lockup" viewBox="0 0 %.2f %.2f" role="img" '
        'aria-label="Saba Özmen Avukatlık Ortaklığı">' % (VB_W, VB_H)
        + mark_svg
        + '<text class="lockup__l1" x="%.3f" y="%.3f" textLength="%.3f" lengthAdjust="spacing">%s</text>'
          % (TEXT_X, BASE1, TEXT_W, L1)
        + '<rect class="lockup__rule" x="%.3f" y="%.3f" width="%.3f" height="%.3f"/>'
          % (TEXT_X, RULE_Y, TEXT_W, RULE_H)
        + '<text class="lockup__l2" x="%.3f" y="%.3f" textLength="%.3f" lengthAdjust="spacing">%s</text>'
          % (TEXT_X, BASE2, TEXT_W, L2)
        + '</svg>')
open(os.path.join("..", "site", "lib", "lockup.inline.txt"), "w", encoding="utf-8").write(live)
print("lockup.inline.txt written (%d bytes, live text)" % len(live))
print("CSS font-size: line1 %.3f  line2 %.3f (SVG user units)" % (size1, size2))
