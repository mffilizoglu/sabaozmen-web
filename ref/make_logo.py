# -*- coding: utf-8 -*-
"""Trace the supplied logosabaozmen.png into an exact vector mark.

Fitted from the 2000x2000 original (least squares, sub-pixel):
  disc    centre (999.56, 991.43)  radius 726.06   fill #A01944 (flat, one colour)
  band 1  centre-line y=518.29, apex x=-33.43,   half-width 0.032130*(x+33.43)
  band 2  centre-line y=750.90, apex x=1926.94,  half-width 0.032058*(1926.94-x)

The two bands cut clean through the disc. They are punched out with
fill-rule="evenodd" so the mark stays transparent and sits on any background.

Each band is clipped to the circle ANALYTICALLY rather than with <clipPath>:
the wedge edges are intersected with the disc and the region is closed with real
arcs. That keeps the mark a single self-contained path with no ids, so it renders
identically in browsers, PDF, print and older SVG renderers alike.
"""
import math
import os

S = 20.0                      # 2000 -> 100 unit viewBox
CX0, CY0, R0 = 1000.06, 992.93, 725.06          # in original pixels
BRAND = "#a01944"


def line_circle(m, c, cx, cy, r):
    """Intersections of y = m*x + c with the circle, left point first."""
    A = 1 + m * m
    B = 2 * (m * (c - cy) - cx)
    C = cx * cx + (c - cy) ** 2 - r * r
    disc = B * B - 4 * A * C
    if disc <= 0:
        raise ValueError("line misses the circle")
    sq = math.sqrt(disc)
    xs = sorted(((-B - sq) / (2 * A), (-B + sq) / (2 * A)))
    return [(x, m * x + c) for x in xs]


def band_region(apex_x, cy, slope):
    """The part of one wedge that lies inside the disc, as an SVG subpath.

    Upper edge y = cy - slope*(x - apex_x); lower edge y = cy + slope*(x - apex_x).
    Walk: upper-left -> upper-right -> arc -> lower-right -> lower-left -> arc.
    """
    mu, cu = -slope, cy + slope * apex_x          # upper edge
    ml, cl = slope, cy - slope * apex_x           # lower edge
    ul, ur = line_circle(mu, cu, CX0, CY0, R0)
    ll, lr = line_circle(ml, cl, CX0, CY0, R0)

    def P(p):
        return "%.4f,%.4f" % (p[0] / S, p[1] / S)

    r = R0 / S
    # Both arcs are minor (the band is far thinner than the disc), and we travel
    # right-hand-side downward then left-hand-side upward.
    return ("M" + P(ul)
            + "L" + P(ur)
            + "A%.4f,%.4f 0 0,1 " % (r, r) + P(lr)
            + "L" + P(ll)
            + "A%.4f,%.4f 0 0,1 " % (r, r) + P(ul)
            + "Z")


CX, CY, R = CX0 / S, CY0 / S, R0 / S
circle = ("M%.4f,%.4f" % (CX - R, CY)
          + "a%.4f,%.4f 0 1,0 %.4f,0" % (R, R, 2 * R)
          + "a%.4f,%.4f 0 1,0 %.4f,0Z" % (R, R, -2 * R))

path = (circle
        + band_region(-33.43, 518.29, 0.032130)
        + band_region(1926.94, 750.90, -0.032058))


def svg(fill):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
            '<path fill="%s" fill-rule="evenodd" d="%s"/></svg>\n' % (fill, path))


OUT = os.path.join("..", "site", "public", "img")
os.makedirs(OUT, exist_ok=True)
for name, fill in {"mark.svg": BRAND, "mark-white.svg": "#ffffff",
                   "favicon.svg": BRAND}.items():
    body = svg(fill)
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(body)
    print(name, len(body), "bytes")

inline = ('<svg class="logo__mark" viewBox="0 0 100 100" aria-hidden="true" '
          'focusable="false"><path class="logo__mark-p" fill-rule="evenodd" '
          'd="%s"/></svg>' % path)
with open(os.path.join("..", "site", "lib", "mark.inline.txt"), "w", encoding="utf-8") as f:
    f.write(inline)
print("inline mark written,", len(inline), "bytes")
