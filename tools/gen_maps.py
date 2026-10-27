"""Generate simplified Natural Earth (public domain) outlines for the v2.1 map challenges.
Equirectangular projection scaled by cos(center latitude). Output: content/v21-maps.js"""
import json, math
NE = '/tmp/ne/'
land50 = json.load(open(NE + 'ne_50m_land.geojson'))
land110 = json.load(open(NE + 'ne_110m_land.geojson'))
lakes = json.load(open(NE + 'ne_50m_lakes.geojson'))
rivers = json.load(open(NE + 'ne_50m_rivers_lake_centerlines.geojson'))
FRAMES = {
  's1': dict(lon0=-200, lon1=-25, lat0=-56, lat1=75, maxw=960, maxh=760, land='50', tol=0.9, rivers=['Mississippi', 'Missouri'], lakemin=60),
  's2': dict(lon0=-170, lon1=-50, lat0=15, lat1=73, maxw=960, maxh=700, land='50', tol=0.8, rivers=['Mississippi', 'Missouri', 'Columbia', 'Rio Grande', 'St. Lawrence', 'Colorado', 'Ohio'], lakemin=40),
  's3': dict(lon0=-135, lon1=160, lat0=-60, lat1=72, maxw=1000, maxh=700, land='50', tol=0.8, rivers=[], lakemin=60),
  's4': dict(lon0=-125, lon1=-52, lat0=17, lat1=56, maxw=960, maxh=700, land='50', tol=0.7, rivers=['Mississippi', 'Missouri', 'Rio Grande', 'St. Lawrence', 'Hudson', 'Ohio', 'Arkansas'], lakemin=30),
  's5': dict(lon0=-78.6, lon1=-69.4, lat0=34.8, lat1=43.4, maxw=960, maxh=900, land='50', tol=0.6, rivers=['Hudson', 'Potomac'], lakemin=60),
  's6': dict(lon0=-85, lon1=-66.5, lat0=31, lat1=45.6, maxw=960, maxh=900, land='50', tol=0.6, rivers=['Hudson', 'Potomac', 'Savannah', 'Ohio', 'St. Lawrence'], lakemin=40),
}
def rings(g):
    if g['type'] == 'Polygon': return [g['coordinates']]
    if g['type'] == 'MultiPolygon': return g['coordinates']
    return []
def lines(g):
    if g['type'] == 'LineString': return [g['coordinates']]
    if g['type'] == 'MultiLineString': return g['coordinates']
    return []
def clip_poly(pts, W, H, m=3):
    def clip(pts, inside, inter):
        out = []
        if not pts: return out
        prev = pts[-1]
        for cur in pts:
            if inside(cur):
                if not inside(prev): out.append(inter(prev, cur))
                out.append(cur)
            elif inside(prev): out.append(inter(prev, cur))
            prev = cur
        return out
    def ix(a, b, x): t = (x - a[0]) / (b[0] - a[0]); return (x, a[1] + t * (b[1] - a[1]))
    def iy(a, b, y): t = (y - a[1]) / (b[1] - a[1]); return (a[0] + t * (b[0] - a[0]), y)
    x0, y0, x1, y1 = -m, -m, W + m, H + m
    pts = clip(pts, lambda p: p[0] >= x0, lambda a, b: ix(a, b, x0))
    pts = clip(pts, lambda p: p[0] <= x1, lambda a, b: ix(a, b, x1))
    pts = clip(pts, lambda p: p[1] >= y0, lambda a, b: iy(a, b, y0))
    pts = clip(pts, lambda p: p[1] <= y1, lambda a, b: iy(a, b, y1))
    return pts
def dp(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy)
    best, bi = -1, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = abs(dy * (p[0] - a[0]) - dx * (p[1] - a[1])) / L if L else math.hypot(p[0] - a[0], p[1] - a[1])
        if d > best: best, bi = d, i
    if best > tol: return dp(pts[:bi + 1], tol)[:-1] + dp(pts[bi:], tol)
    return [a, b]
def area(pts): return abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))) / 2
def fmt(v): return ('%.1f' % v).rstrip('0').rstrip('.')
def path_closed(polys): return ''.join('M' + 'L'.join(fmt(x) + ' ' + fmt(y) for x, y in p) + 'Z' for p in polys)
def path_open(ls): return ''.join('M' + 'L'.join(fmt(x) + ' ' + fmt(y) for x, y in p) for p in ls)
out = {}
for key, F in FRAMES.items():
    latc = (F['lat0'] + F['lat1']) / 2; c = math.cos(math.radians(latc))
    k = min(F['maxw'] / ((F['lon1'] - F['lon0']) * c), F['maxh'] / (F['lat1'] - F['lat0']))
    W, H = (F['lon1'] - F['lon0']) * c * k, (F['lat1'] - F['lat0']) * k
    def P(lon, lat): return ((lon - F['lon0']) * c * k, (F['lat1'] - lat) * k)
    shifts = [0] + ([-360] if F['lon0'] < -180 else []) + ([360] if F['lon1'] > 180 else [])
    def polys_of(fc, minarea, namefilter=None):
        res = []
        for f in fc['features']:
            if namefilter and not namefilter(f['properties']): continue
            for poly in rings(f['geometry']):
                ring = poly[0]
                for sh in shifts:
                    lons = [p[0] + sh for p in ring]
                    if max(lons) < F['lon0'] - 1 or min(lons) > F['lon1'] + 1: continue
                    lats = [p[1] for p in ring]
                    if max(lats) < F['lat0'] - 1 or min(lats) > F['lat1'] + 1: continue
                    pts = [P(p[0] + sh, p[1]) for p in ring]
                    pts = clip_poly(pts, W, H)
                    if len(pts) < 3: continue
                    pts = dp(pts + [pts[0]], F['tol'])[:-1]
                    if len(pts) >= 3 and area(pts) >= minarea: res.append(pts)
        return res
    landp = polys_of(land50 if F['land'] == '50' else land110, 3)
    lakep = polys_of(lakes, F['lakemin'], lambda p: not any(w in (p.get('name') or '') for w in ('Réservoir', 'Reservoir', 'Res.')))
    rl = []
    for f in rivers['features']:
        if (f['properties'].get('name') or '') not in F['rivers']: continue
        for ln in lines(f['geometry']):
            seg = []
            for lon, lat in ln:
                x, y = P(lon, lat)
                if -2 <= x <= W + 2 and -2 <= y <= H + 2: seg.append((x, y))
                else:
                    if len(seg) > 1: rl.append(dp(seg, F['tol']))
                    seg = []
            if len(seg) > 1: rl.append(dp(seg, F['tol']))
    out[key] = dict(w=round(W, 1), h=round(H, 1), lon0=F['lon0'], lat1=F['lat1'], kx=round(c * k, 5), ky=round(k, 5),
                    land=path_closed(landp), lakes=path_closed(lakep), rivers=path_open(rl))
    print(key, 'W', round(W), 'H', round(H), 'k', round(k, 2), 'land', len(landp), 'lakes', len(lakep), 'rivers', len(rl), 'bytes', len(out[key]['land']) + len(out[key]['lakes']) + len(out[key]['rivers']))
js = ('/* v2.1 map outlines generated by gen_maps.py from Natural Earth 1:50m land, lakes, and rivers (public domain, naturalearthdata.com).\n'
      '   Projection: equirectangular, x = (lon - lon0) * kx, y = (lat1 - lat) * ky. Modern coastlines; rivers and lakes are today\'s. */\n'
      'GAME_CONTENT.mapGeo = ' + json.dumps(out, separators=(',', ':')) + ';\n')
open('/workspace/american-beginnings-rpg/content/v21-geo.js', 'w').write(js)
print('total', len(js))
