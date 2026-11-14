"""Generate _sass/_backdrop.scss: the faint water/chart backdrop behind pages.

The drawings are SVG masks, so their colour comes from CSS (var(--body-color))
and they follow the light/dark theme without a second set of images. Line
strength is the stroke-opacity written here.

    python tools/make-backdrop.py

Each layer is switched on by a bdx-* class on <html> (_layouts/base.html).
"""
import math
from pathlib import Path
from urllib.parse import quote


def uri(svg):
    return 'url("data:image/svg+xml,' + quote(" ".join(svg.split()), safe=" =:/,.'-()") + '")'


def wave(y, amp, x0, x1, step=50):
    return f"M{x0},{y} q{step/2},{-amp} {step},0" + f" t{step},0" * int((x1 - x0) / step)


SVG = "<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}' viewBox='0 0 {w} {h}'>{body}</svg>"

import random

rng = random.Random(7)   # fixed seed: the same drawing on every build


def swell(x0, y0, length, amp, wl):
    """One swell: a run of crests whose height rises and falls along it,
    with the wavelength drifting a little, so no two look alike."""
    d, x, n = f"M{x0:.1f},{y0:.1f}", 0.0, 0
    while x < length:
        w = wl * rng.uniform(.8, 1.25)
        env = math.sin(math.pi * min(1, (x + w / 2) / length))   # taper at both ends
        h = amp * env * rng.uniform(.6, 1.3) * (1 if n % 2 == 0 else -1)
        d += f" q{w/2:.1f},{-h:.1f} {w:.1f},{rng.uniform(-.6, .6):.1f}"
        x += w; n += 1
    return d


def dashes(total=900):
    """An irregular dash pattern: long and short strokes, uneven gaps."""
    out = []
    while sum(out) < total:
        out += [rng.choice([30, 60, 110, 170, 240]), rng.choice([25, 45, 80, 130])]
    return " ".join(str(v) for v in out)


# 1. Horizon band: horizon line + three wave rows of uneven dashes, fading
#    downwards. Rows are wider than the tile so the seams do not line up.
rows = []
for y, amp, wl, op in [(70, 1.6, 46, .26), (98, 2.6, 62, .22), (134, 3.6, 84, .18)]:
    rows.append(f"<path d='{swell(-40, y, 880, amp, wl)}' stroke-opacity='{op}' stroke-dasharray='{dashes()}'/>")
band = SVG.format(w=800, h=190, body=f"""
<defs><linearGradient id='f' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='white' stop-opacity='1'/>
<stop offset='1' stop-color='white' stop-opacity='0'/></linearGradient>
<mask id='m'><rect width='800' height='190' fill='url(#f)'/></mask></defs>
<g mask='url(#m)' fill='none' stroke='black' stroke-width='1.2'>
<path d='M0,46 H800' stroke-opacity='.32'/>
{''.join(rows)}
</g>""")

# 2. Margin waves: one large tile of scattered swells that differ in length,
#    height, wavelength and strength. Large enough that the repeat is not
#    noticed; placed on a jittered grid so they never clump or align.
MW, MH = 960, 840
parts = []
for gy in range(7):
    for gx in range(4):
        if rng.random() < .25:
            continue   # leave some cells empty
        x = gx * MW / 4 + rng.uniform(0, MW / 4 - 60)
        y = gy * MH / 7 + rng.uniform(10, MH / 7 - 10)
        length = rng.uniform(60, 190)
        if x + length > MW:
            x = MW - length - 4
        parts.append(f"<path d='{swell(x, y, length, rng.uniform(1.6, 4.2), rng.uniform(28, 52))}' "
                     f"stroke-opacity='{rng.uniform(.11, .2):.3f}'/>")
waves = SVG.format(w=MW, h=MH, body=f"<g fill='none' stroke='black' stroke-width='1.1' stroke-linecap='round'>{''.join(parts)}</g>")

# 3a. Chart grid: graticule every 180px with small ticks.
ticks = "".join(f"<path d='M{x},0 v5 M{x},180 v-5'/>" for x in range(30, 180, 30))
ticks += "".join(f"<path d='M0,{y} h5 M180,{y} h-5'/>" for y in range(30, 180, 30))
grid = SVG.format(w=180, h=180, body=f"""
<g fill='none' stroke='black' stroke-width='1' stroke-opacity='.09'>
<path d='M0,.5 H180 M.5,0 V180'/>{ticks}</g>""")

# 3b. Depth contours: nested wobbly rings in the bottom-right corner.
rings = []
for k in range(1, 9):
    r = 40 + k * 34
    pts = []
    for i in range(73):
        a = i / 72 * 2 * math.pi
        rr = r * (1 + .10 * math.sin(3 * a + k * .35) + .06 * math.cos(5 * a - k * .5))
        pts.append(f"{560 + rr * math.cos(a) * 1.25:.1f},{470 + rr * math.sin(a):.1f}")
    rings.append(f"<path stroke-opacity='{.17 - k * .011:.3f}' d='M{' L'.join(pts)}Z'/>")
contours = SVG.format(w=560, h=470, body=f"<g fill='none' stroke='black' stroke-width='1.1'>{''.join(rings)}</g>")

# Section motifs (idea "motif"): replace the margin waves on some pages.
# PCB traces (Tools): 45-degree bends ending in vias.
pcb = SVG.format(w=240, h=240, body="""
<g fill='none' stroke='black' stroke-width='1.2' stroke-opacity='.15'>
<path d='M0,40 H70 L100,70 H170'/><circle cx='174' cy='70' r='4'/>
<path d='M240,40 H200 L180,20 V0'/>
<path d='M30,240 V170 L60,140 V110'/><circle cx='60' cy='106' r='4'/>
<path d='M240,190 H150 L120,160 H90'/><circle cx='86' cy='160' r='4'/>
<path d='M0,190 H20'/><path d='M200,240 V215'/></g>""")

# Honeycomb (bee projects): pointy-top hexagons.
R = 22
HW, HH = math.sqrt(3) * R, 3 * R


def hexagon(cx, cy):
    pts = [f"{cx + R * math.cos(math.radians(60 * i - 30)):.1f},{cy + R * math.sin(math.radians(60 * i - 30)):.1f}"
           for i in range(6)]
    return f"<path d='M{' L'.join(pts)}Z'/>"


cells = "".join(hexagon(cx, cy) for cx, cy in [(0, 0), (HW, 0), (HW / 2, HH / 2), (0, HH), (HW, HH)])
honey = SVG.format(w=f"{HW:.2f}", h=HH,
                   body=f"<g fill='none' stroke='black' stroke-width='1' stroke-opacity='.12'>{cells}</g>")

# Wind rose (SailSwarm): one 32-point rose per large tile.
spokes = []
for i in range(32):
    a = math.radians(i * 11.25)
    L = 120 if i % 8 == 0 else 85 if i % 4 == 0 else 60 if i % 2 == 0 else 40
    spokes.append(f"M260,260 L{260 + L * math.sin(a):.1f},{260 - L * math.cos(a):.1f}")
rose = SVG.format(w=520, h=520, body=f"""
<g fill='none' stroke='black' stroke-width='1' stroke-opacity='.15'>
<circle cx='260' cy='260' r='100'/><circle cx='260' cy='260' r='104'/><circle cx='260' cy='260' r='30'/>
<path d='{' '.join(spokes)}'/></g>""")

TEMPLATE = Path(__file__).with_name("backdrop.scss.tmpl").read_text(encoding="utf-8")
scss = (TEMPLATE
        .replace("@@BAND@@", uri(band))
        .replace("@@WAVES@@", uri(waves))
        .replace("@@GRID@@", uri(grid))
        .replace("@@CONTOURS@@", uri(contours))
        .replace("@@PCB@@", uri(pcb))
        .replace("@@HONEY@@", uri(honey))
        .replace("@@ROSE@@", uri(rose))
        .replace("@@HONEY_SIZE@@", f"{HW:.2f}px {HH}px"))
Path("_sass/_backdrop.scss").write_text(scss, encoding="utf-8", newline="\n")
print("wrote _sass/_backdrop.scss", len(scss), "bytes")
