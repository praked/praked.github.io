"""Build _includes/world-map-paths.svg for the travel map on /misc/.

    curl -LO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ind.geojson
    python tools/make-world-map.py ne_10m_admin_0_countries_ind.geojson paths.svgfrag

Natural Earth 1:10m countries, India point of view (public domain), Miller
projection, simplified to a few hundred KB. Prints the map height; the
viewBox in _includes/travel-map.html must match it. Prepend the Liquid
comment header from the current _includes/world-map-paths.svg to the output.
"""
import json, math, sys, html
src, out = sys.argv[1], sys.argv[2]
fc = json.load(open(src, encoding='utf-8'))
W = 1010.0
LAT_MIN, LAT_MAX = -57.0, 84.0
def my(lat):
    lat = max(min(lat, LAT_MAX), LAT_MIN)
    return 1.25 * math.log(math.tan(math.pi / 4 + 0.4 * math.radians(lat)))
S = W / 360.0 * (180 / math.pi)   # px per radian of longitude
Y0 = my(LAT_MAX)
H = (Y0 - my(LAT_MIN)) * S
def proj(lon, lat):
    return ((lon + 180) / 360 * W, (Y0 - my(lat)) * S)

def dp(pts, tol):
    n = len(pts)
    if n < 3: return pts
    keep = [False] * n; keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy)
        idx, dmax = -1, 0.0
        for k in range(a + 1, b):
            x, y = pts[k]
            d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L if L > 1e-12 else math.hypot(x - x1, y - y1)
            if d > dmax: idx, dmax = k, d
        if dmax > tol and idx > 0:
            keep[idx] = True; stack += [(a, idx), (idx, b)]
    return [p for p, k in zip(pts, keep) if k]

def area(r):
    return 0.5 * abs(sum(r[i][0] * r[i-1][1] - r[i-1][0] * r[i][1] for i in range(len(r))))

TOL, MIN_AREA = 0.3, 0.6
f = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')
parts, centres = [], {}
for ft in fc['features']:
    p = ft['properties']
    code = p.get('ISO_A2_EH') or p.get('ISO_A2')
    # A few bits (bases, disputed reefs) have no ISO code: give them their
    # 3-letter code so they cannot collide with a real country's.
    if not code or code == '-99': code = p.get('ADM0_A3') or 'x'
    code = code.lower()
    name = p.get('NAME_EN') or p.get('NAME')
    if p.get('ADM0_A3') == 'ATA': continue
    g = ft['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    rings = []
    for poly in polys:
        for ring in poly:
            pr = [proj(lon, lat) for lon, lat in ring]
            rings.append(pr)
    if not rings: continue
    biggest = max(rings, key=area)
    xs = [q[0] for q in biggest]; ys = [q[1] for q in biggest]
    centres[code] = (round((min(xs)+max(xs))/2, 1), round((min(ys)+max(ys))/2, 1))
    segs = []
    for r in rings:
        if r is not biggest and area(r) < MIN_AREA: continue
        s = dp(r, TOL)
        if len(s) < 4: s = r if len(r) < 12 else dp(r, TOL / 4)
        if s[0] == s[-1]: s = s[:-1]
        if len(s) < 3: continue
        segs.append('M' + ' '.join(f(x) + ',' + f(y) for x, y in s) + 'Z')
    if segs:
        parts.append('  <path data-c="%s" d="%s"><title>%s</title></path>' % (code, ''.join(segs), html.escape(name)))
open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(parts) + '\n')
json.dump({'H': round(H, 1), 'centres': centres}, open(out + '.json', 'w'))
print(len(parts), 'features, height', round(H, 1))
