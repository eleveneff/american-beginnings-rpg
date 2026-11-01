// world/scenery.js — v2.6.1 graphics pass 1 (background landscape), shared by all four outdoor levels.
// Added after a level is built, with no new save data and no new colliders:
//  • ground: soft patchy colour variation baked into the terrain vertex colours, plus a fine grain texture on the terrain only;
//  • far scenery: a painted horizon band of layered ridges (pre-hazed toward the fog colour, flat toon bands) that rides
//    with the sky dome, so there is always land behind the level's own far hills; each level paints its own true geography;
//  • sky: a few flat toon clouds drifting slowly round the sky;
//  • water: a light ripple texture that drifts;
//  • small walk-through detail: pebbles, grass clumps, low plants and wildflowers of the right region and era,
//    kept off roads, stations, rings, mats and buildings. Instanced, no shadow casting, so frame time barely moves.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const hash = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
const fbm = (x, z) => 0.55 * vnoise(x, z) + 0.3 * vnoise(x * 2.1 + 17, z * 2.1 - 9) + 0.15 * vnoise(x * 4.3 - 31, z * 4.3 + 5);
const C = h => new THREE.Color(h);

// ---------- per-level looks (true geography: north = +z, west = +x; angle a = atan2(x, z): 0 north, +90° west, ±180° south, -90° east)
const deg = d => d * Math.PI / 180;
const LOOK = {
  s1: {   // Beringia: snowy ranges all round, ice sheet country to the north (no forests: open steppe-tundra)
    bands: [{ col: '#c9d3dd', snow: '#f1f5f8', kind: () => 'peaks', amp: 0.9 }, { col: '#a9b5c0', snow: '#e8eef3', kind: () => 'peaks', amp: 0.6 }],
    tint: ['#c2b472', '#8f9a58'], grass: '#a99d62', plant: null,
    flowers: ['#f2d046', '#f4f1e6', '#9a6cc0'],   // arctic poppy, mountain avens, pasqueflower
    rock: '#8a8780', clouds: '#f4f6f8', cloudN: 9, density: 1.0 },
  s2: {   // the Native Nations map: sea to the north, Rocky Mountains far west, mesas south-west, rolling Appalachian ridges east
    bands: [{ col: '#bfcad3', snow: '#eef2f5', kind: a => (a > deg(-50) && a < deg(45)) ? 'sea' : a > deg(45) && a < deg(115) ? 'peaks' : a >= deg(115) && a < deg(165) ? 'mesa' : 'ridge', amp: 0.85 },
            { col: '#9fb0b8', snow: '#e4eaee', kind: a => (a > deg(-60) && a < deg(55)) ? 'sea' : a > deg(55) && a < deg(110) ? 'peaks' : a >= deg(110) && a < deg(170) ? 'mesa' : 'ridge', amp: 0.55 }],
    tint: ['#a8a46a', '#6f9150'], grass: '#7f9452', plant: null,
    flowers: ['#e8b830', '#8f7ad0', '#f2eee2'],   // goldenrod, aster, yarrow
    rock: '#8d857a', clouds: '#ffffff', cloudN: 10, density: 0.8 },
  s3: { bands: [], tint: ['#c7b277', '#8fa35e'], grass: '#9aa060', plant: '#5f8a45',
    // Spain and the Canaries (x < 20): red poppies and yellow broom; the Caribbean islands: beach morning glory (pink-purple)
    flowers: (x) => x < 20 ? ['#d8402a', '#f0c93a', '#f3efe3'] : ['#c46aa8', '#f3efe3'],
    rock: '#9a9286', clouds: '#ffffff', cloudN: 12, density: 0.7 },
  s4: {   // east (-x) the Atlantic; west the desert mountains and mesas of New Mexico; north the Laurentian hills; south low Florida pinewoods
    bands: [{ col: '#c3cdd4', snow: '#eef1f3', kind: a => (a > deg(-150) && a < deg(-30)) ? 'sea' : a > deg(50) && a < deg(150) ? 'mesa' : a >= deg(-30) && a <= deg(50) ? 'ridge' : 'low', amp: 0.8 },
            { col: '#a4b3b6', snow: '#e6ebee', kind: a => (a > deg(-160) && a < deg(-20)) ? 'sea' : a > deg(55) && a < deg(145) ? 'peaks' : a >= deg(-20) && a <= deg(55) ? 'ridge' : 'low', amp: 0.5 }],
    tint: ['#b6a46c', '#6f8f4c'], grass: '#7f9450', plant: '#557a3c',
    flowers: (x, z) => x > 35 ? ['#e9c43a'] : z > 30 ? ['#f2eee2', '#8f7ad0'] : z < -25 ? ['#f2eee2', '#e9c43a'] : ['#f2eee2', '#e9c43a', '#8f7ad0'],   // chamisa in the desert; asters north; Florida white and yellow
    plantCol: (x, z) => x > 35 ? '#8f9c7a' : z > 30 ? '#4e7d3c' : z < -25 && x < 10 ? '#4f7a3a' : null,   // sagebrush / ferns / saw palmetto
    rock: (x) => x > 35 ? '#a07a5c' : '#8b867e', clouds: '#ffffff', cloudN: 10, density: 0.7 }
};

// ---------- painted horizon band
function ridgeH(kind, a, layer, amp) {   // a = angle round the horizon; noise is sampled on a circle so the band has no seam
  const cx = Math.cos(a), sz = Math.sin(a), N = (k, o) => vnoise(cx * k + o, sz * k - o * 0.7);
  const n1 = N(6 + layer, layer * 3 + 1), n2 = N(18 + layer, 9 + layer), n3 = N(1.5, 4 + layer), u = (a / (Math.PI * 2) + 1) % 1;
  if (kind === 'sea') return -1;
  if (kind === 'peaks') { const t = Math.abs(((u * 60 + layer * 0.37) % 1) - 0.5) * 2; return amp * (0.35 + 0.45 * n3 + 0.35 * (1 - t) * n1 + 0.08 * n2); }
  if (kind === 'mesa') { const s = N(4 + layer, 2 + layer * 5); return amp * (s > 0.55 ? 0.5 + 0.05 * n2 : 0.14 + 0.05 * n2); }
  if (kind === 'ridge') return amp * (0.24 + 0.24 * n3 + 0.14 * n1 + 0.03 * n2);
  return amp * (0.07 + 0.06 * n1 + 0.05 * n2);   // 'low': flat country with a distant tree line
}
function backdrop(look, fog) {   // v2: real geometry (one opaque strip per layer, vertex colours): no texture, no alpha test, cheap to draw
  if (!look.bands.length) return null;
  const grp = new THREE.Group(); grp.name = 'far-band'; grp.userData.noMerge = true;
  const N = 360, h0 = 70, H1 = 92 * 0.45;   // local units inside the sky dome (scaled 0.76 by world.js)
  look.bands.forEach((b, li) => {
    const R = 480 - li * 14, col = C(b.col).lerp(fog, li === 0 ? 0.45 : 0.25), base = col.clone().lerp(fog, 0.35), snow = C(b.snow).lerp(fog, li === 0 ? 0.35 : 0.2);
    const pk = []; for (let i = 0; i < N; i++) { const a = Math.atan2(Math.sin(i / N * Math.PI * 2), Math.cos(i / N * Math.PI * 2)), k = b.kind(a); pk.push([ridgeH(k, a, li, b.amp), k]); }
    const hs = pk.map((_, i) => { let sm = 0; for (let d = -2; d <= 2; d++) { const v = pk[(i + d + N) % N][0]; sm += v < 0 ? -0.15 : v; } return sm / 5; });
    // three rows per column: foot (below the horizon, hidden by the level's own land), snowline, crest
    const pos = [], cols = [], idx = [];
    for (let i = 0; i <= N; i++) { const j = i % N, u = i / N * Math.PI * 2, x = Math.sin(u) * R, z = Math.cos(u) * R, h = Math.max(-0.02, hs[j]), top = h * H1;
      const snowy = pk[j][1] === 'peaks' && h > b.amp * 0.55, sl = snowy ? top - (h - b.amp * 0.5) * H1 * 0.7 : top;
      pos.push(x, -h0, z, x, sl, z, x, top, z);
      const c2 = snowy ? snow : col; cols.push(base.r, base.g, base.b, col.r, col.g, col.b, c2.r, c2.g, c2.b);
      if (i < N) { const q = i * 3; idx.push(q, q + 3, q + 1, q + 1, q + 3, q + 4, q + 1, q + 4, q + 2, q + 2, q + 4, q + 5); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false, depthWrite: false }));
    m.renderOrder = 5 + li; m.frustumCulled = false; m.userData.noMerge = true; m.name = 'far-band-' + li; grp.add(m); });
  return grp;
}

// ---------- toon clouds
function cloudTex(col) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const g = cv.getContext('2d'), r = rng(7);
  const base = C(col), shade = base.clone().lerp(C('#b8c4d2'), 0.45);
  const puffs = []; for (let i = 0; i < 7; i++) puffs.push([40 + i * 28 + r() * 10, 78 - Math.sin(i / 6 * Math.PI) * 26 - r() * 8, 22 + Math.sin(i / 6 * Math.PI) * 18 + r() * 6]);
  g.fillStyle = '#' + shade.getHexString(); for (const [x, y, rr] of puffs) { g.beginPath(); g.arc(x, y + 6, rr, 0, 7); g.fill(); }
  g.fillRect(36, 84, 190, 16);
  g.fillStyle = '#' + base.getHexString(); for (const [x, y, rr] of puffs) { g.beginPath(); g.arc(x - 2, y, rr * 0.92, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function clouds(look) {   // v2: all clouds in ONE mesh (flat cards facing the middle of the sky dome, where the camera always is)
  const tex = cloudTex(look.clouds), r = rng(31), geos = [];
  for (let i = 0; i < look.cloudN; i++) {
    const a = i / look.cloudN * Math.PI * 2 + r() * 0.4, el = deg(7 + r() * 16), R = 430, w = 70 + r() * 60, g = new THREE.PlaneGeometry(w, w * 0.5);
    const o = new THREE.Object3D(); o.position.set(Math.sin(a) * R * Math.cos(el), R * Math.sin(el), Math.cos(a) * R * Math.cos(el)); o.lookAt(0, o.position.y * 0.6, 0); o.updateMatrix(); g.applyMatrix4(o.matrix); geos.push(g); }
  const m = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshBasicMaterial({ map: tex, fog: false, depthWrite: false, transparent: true, opacity: 0.92, side: THREE.DoubleSide }));
  m.name = 'clouds'; m.userData.noMerge = true; m.renderOrder = 4; m.frustumCulled = false; m.userData.n = look.cloudN; return m;
}

// ---------- water ripples (a drifting texture on the existing water; no extra layer)
function rippleTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), r = rng(5);
  g.fillStyle = '#e4e4e4'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 46; i++) { const x = r() * 128, y = r() * 128, w = 6 + r() * 16; g.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.95)' : 'rgba(190,190,190,0.7)'; g.lineWidth = 1.2 + r() * 1.3;
    for (const dx of [0, -128, 128]) for (const dy of [0, -128, 128]) { g.beginPath(); g.moveTo(x + dx - w / 2, y + dy); g.quadraticCurveTo(x + dx, y + dy - 2.2, x + dx + w / 2, y + dy); g.stroke(); } }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 1;
  t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;   // v2.6.1b: no mipmaps / anisotropy: the trilinear lookups cost ~3 fps on soft GL
  return t;
}

// ---------- small detail geometry (vertex coloured white where an instance colour tints it)
function vcol(geo, hex) { geo = geo.index ? geo.toNonIndexed() : geo; const c = C(hex), n = geo.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3); geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo; }
// v2: flat toon blades and leaves (one triangle each, with a back face): a sixth of the triangles of v1, so the
// walk-through detail costs little on soft GL
function blade(w, h, lean, rot, dx = 0, dz = 0, hex = '#ffffff') { const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-w / 2, 0, 0, w / 2, 0, 0, lean, h, 0, -w / 2, 0, 0, lean, h, 0, w / 2, 0, 0], 3)); g.computeVertexNormals(); g.rotateY(rot); g.translate(dx, 0, dz); return vcol(g, hex); }
function grassGeo() { const g = []; for (let i = 0; i < 4; i++) g.push(blade(0.09, 0.4 + (i % 3) * 0.1, (i - 1.5) * 0.08, i * 0.8)); return mergeGeometries(g); }
function plantGeo() { const g = []; for (let i = 0; i < 6; i++) { const b = blade(0.26, 0.62, 0, 0); b.rotateX(-0.7); b.rotateY(i / 6 * Math.PI * 2); g.push(b); } return mergeGeometries(g); }
function flowerStem() { const g = []; for (let i = 0; i < 3; i++) g.push(blade(0.03, 0.26, 0, i * 1.1, Math.cos(i * 2.1) * 0.09, Math.sin(i * 2.1) * 0.09, '#5f8a3e')); g.push(blade(0.16, 0.1, 0, 0.4, 0, 0, '#6c9446')); return mergeGeometries(g); }
function flowerHeads() { const g = []; for (let i = 0; i < 3; i++) {   // v2.6.1b: one flat upward-facing diamond per bloom (2 triangles, was an 8-triangle octahedron)
    const c = new THREE.BufferGeometry(), r = 0.075, h = 0.27, x = Math.cos(i * 2.1) * 0.09, z = Math.sin(i * 2.1) * 0.09;
    c.setAttribute('position', new THREE.Float32BufferAttribute([x - r, h, z, x, h + 0.01, z + r, x + r, h, z, x - r, h, z, x + r, h, z, x, h + 0.01, z - r], 3)); c.computeVertexNormals(); g.push(vcol(c, '#ffffff')); }
  return mergeGeometries(g); }
function boulderGeo() { const c = new THREE.DodecahedronGeometry(1, 0), p = c.attributes.position, r = rng(11);
  for (let i = 0; i < p.count; i++) { const k = 0.82 + 0.3 * hash(Math.round(p.getX(i) * 50), Math.round(p.getZ(i) * 50 + p.getY(i) * 7)); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.62, p.getZ(i) * k); }
  c.computeVertexNormals(); return vcol(c, '#ffffff'); }
function pebbleGeo() { const c = new THREE.OctahedronGeometry(1, 0); c.scale(1, 0.5, 0.8); c.rotateY(0.4); return vcol(c, '#ffffff'); }

export function enhanceScenery({ lvl, B, sid, rings = [] }) {
  const look = LOOK[sid]; if (!look || !lvl || !lvl.scene) return { update() {} };
  const scene = lvl.scene, fog = (scene.fog && scene.fog.color) ? scene.fog.color.clone() : C('#e4ecef'), out = { parts: {} };
  const WY = typeof B.WATER_Y === 'number' ? B.WATER_Y : -0.3;
  // 1 · ground: drier / greener patches and light shading baked into the terrain vertex colours (no texture: a texture on
  //     the whole ground cost about 5 fps on soft GL)
  const tA = C(look.tint[0]), tB = C(look.tint[1]), c = new THREE.Color();
  let terrMat = null; const gcol = new Map(), gk = (x, z) => Math.round(x / 2) * 4096 + Math.round(z / 2);
  scene.traverse(o => {
    if (o.name !== 'terrain-tile' || !o.geometry) return;
    const g = o.geometry, p = g.attributes.position, col = g.attributes.color; if (!col) return;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i); if (y < WY - 0.2) continue;   // sea bed: unchanged
      const road = B.pathDist ? Math.max(0, 1 - Math.max(0, B.pathDist(x, z) - 0.8) / 2.2) : 0, n = fbm(x * 0.06, z * 0.06), m = fbm(x * 0.21 + 40, z * 0.21 - 12);
      c.setRGB(col.getX(i), col.getY(i), col.getZ(i));
      const keep = 1 - road * 0.85, k = Math.max(-0.5, Math.min(0.5, (n - 0.5) * 2.4 * keep));   // v2.6.1b: stronger patches (0.44 was invisible in QC shots)   // drier / greener patches
      c.lerp(k > 0 ? tA : tB, Math.abs(k)); const sh = 1 + (m - 0.5) * 0.5 * keep; c.multiplyScalar(sh);
      col.setXYZ(i, c.r, c.g, c.b); gcol.set(gk(x, z), [c.r, c.g, c.b]); }
    col.needsUpdate = true;
    terrMat = true;
  });
  out.parts.terrain = !!terrMat;
  // 2 · far horizon band and clouds ride with the sky dome (world.js keeps the sky on the camera every frame)
  const sky = lvl.sky || scene.getObjectByName('sky');
  if (sky) { const band = backdrop(look, fog); if (band) { sky.add(band); out.parts.band = true; }
    const cl = clouds(look); sky.add(cl); out.clouds = cl; out.parts.clouds = cl.userData.n; }
  // 3 · water ripples
  const waters = [lvl.water, scene.getObjectByName('meltwater')].filter(Boolean), rip = rippleTex(); out.water = [];
  for (const w of waters) { if (!w.material || w.material.map) continue; w.geometry.computeBoundingBox(); const bb = w.geometry.boundingBox, sx = (bb.max.x - bb.min.x) / 7, sz = (bb.max.z - bb.min.z || bb.max.y - bb.min.y) / 7;
    const t = rip.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, sx), Math.max(1, sz)); w.material.map = t; w.material.color.multiplyScalar(1.06); w.material.needsUpdate = true; out.water.push(t); }
  out.parts.water = out.water.length;
  // 4 · walk-through ground detail
  const rnd = rng(sid.charCodeAt(1) * 977), bounds = B.BOUNDS || { x0: -60, x1: 60, z0: -60, z1: 60 };
  const cols = (lvl.colliders && (lvl.colliders.out || lvl.colliders)) || [], st = B.STATIONS || {}, mats = B.MATS || [];
  const ringPts = (rings || []).map(r => r.pos || r.position || r).filter(r => r && typeof r.x === 'number');
  const free = (x, z, roadPad) => {
    const h = B.groundH(x, z); if (h < WY + 0.35) return false; if (B.solid && B.solid(x, z)) return false; if (B.riverS && B.riverS(x, z) < 5.5) return false;
    if (B.pathDist && B.pathDist(x, z) < roadPad) return false;
    if (sid === 's1' && z > 108) return false;   // ice and the corridor stay bare
    const gc = gcol.get(gk(x, z)); if (gc && gc[2] > gc[1] * 0.98 && gc[2] > 0.45) return false;   // no plants on snow
    for (const k in st) { const s = st[k]; if (Math.hypot(x - s.x, z - s.z) < (s.r || 0) + 3.5) return false; }
    for (const r of ringPts) if (Math.hypot(x - r.x, z - r.z) < 3) return false;
    for (const m of mats) if (Math.abs(x - m.x) < 3 && Math.abs(z - m.z) < 3) return false;
    for (const o of cols) { if (o.type === 'c' ? Math.hypot(x - o.x, z - o.z) < o.r + 0.8 : Math.abs(x - o.x) < o.hx + 0.8 && Math.abs(z - o.z) < o.hz + 0.8) return false; }
    // not on steep slopes
    const e = 0.6, sl = Math.hypot(B.groundH(x + e, z) - B.groundH(x - e, z), B.groundH(x, z + e) - B.groundH(x, z - e)) / (2 * e); return sl < 0.6; };
  const spots = (n, roadPad) => { const o = []; let guard = 0; while (o.length < n && guard++ < n * 30) { const x = bounds.x0 + rnd() * (bounds.x1 - bounds.x0), z = bounds.z0 + rnd() * (bounds.z1 - bounds.z0); if (free(x, z, roadPad)) o.push([x, z]); } return o; };
  // v2.6.1b: most of what she sees is the ground beside the trails, so half the tufts and flowers go within 9 m of a road
  const spotsNear = (n, roadPad) => { if (!B.pathDist) return spots(n, roadPad); const o = []; let guard = 0;
    while (o.length < n && guard++ < n * 60) { const x = bounds.x0 + rnd() * (bounds.x1 - bounds.x0), z = bounds.z0 + rnd() * (bounds.z1 - bounds.z0); if (B.pathDist(x, z) < 9 && free(x, z, roadPad)) o.push([x, z]); } return o; };
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true }), obj = new THREE.Object3D();
  // every tuft, plant, flower and pebble is baked into ONE static mesh: on soft GL each extra draw call cost 1-5 fps,
  // while the triangles themselves (about 10,000) cost almost nothing
  const bake = [];
  const inst = (geo, list, colorOf, name, yOff = 0) => { if (!list.length) return; const g0 = geo.index ? geo.toNonIndexed() : geo; if (g0.attributes.uv) g0.deleteAttribute('uv');
    list.forEach(([x, z, s, sy, ry], i) => { obj.position.set(x, B.groundH(x, z) + yOff * s, z); obj.rotation.set(0, ry, 0); obj.scale.set(s, s * (sy || 1), s); obj.updateMatrix();
      const g = g0.clone(); g.applyMatrix4(obj.matrix); if (colorOf) { const k = colorOf(x, z, i), cc = g.attributes.color; for (let j = 0; j < cc.count; j++) cc.setXYZ(j, cc.getX(j) * k.r, cc.getY(j) * k.g, cc.getZ(j) * k.b); } bake.push(g); });
    out.parts[name] = list.length; };
  const D = look.density * 1.1, pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const rockC = (x, z) => C(typeof look.rock === 'function' ? look.rock(x, z) : look.rock).multiplyScalar(0.85 + rnd() * 0.3);
  inst(pebbleGeo(), spots(Math.round(240 * D), 1.2).map(([x, z]) => [x, z, 0.1 + rnd() * rnd() * 0.32, 1, rnd() * 6.28]), rockC, 'gfx-pebbles', 0.1);
  // v2.6.1b: low boulder clusters (bedded about a third into the ground, knee height at most, so walking through one never looks odd)
  { const bl = []; for (const [x0, z0] of spots(Math.round(34 * D), 2.2)) { const n = 1 + Math.floor(rnd() * 3), s0 = 0.35 + rnd() * 0.4;
      for (let i = 0; i < n; i++) { const x = x0 + (rnd() - 0.5) * 2.2 * (i ? 1 : 0), z = z0 + (rnd() - 0.5) * 2.2 * (i ? 1 : 0); if (i && !free(x, z, 2.2)) continue; bl.push([x, z, s0 * (i ? 0.45 + rnd() * 0.4 : 1), 1, rnd() * 6.28]); } }
    inst(boulderGeo(), bl, rockC, 'gfx-boulders', -0.12); }
  const grassC = (x, z) => { const gc = gcol.get(gk(x, z)), k = C(look.grass); if (gc) k.lerp(new THREE.Color(gc[0] * 0.78, gc[1] * 0.82, gc[2] * 0.7), 0.6); return k.multiplyScalar(0.85 + rnd() * 0.25); };   // tufts take the colour of the ground they grow on
  inst(grassGeo(), spots(Math.round(320 * D), 1.0).concat(spotsNear(Math.round(520 * D), 1.0)).map(([x, z]) => [x, z, 1.0 + rnd() * 0.9, 0.8 + rnd() * 0.6, rnd() * 6.28]), grassC, 'gfx-grass', -0.02);
  const plantAt = (x, z) => look.plantCol ? look.plantCol(x, z) : look.plant;
  const pl = spots(Math.round(260 * D), 1.4).filter(([x, z]) => plantAt(x, z)).map(([x, z]) => [x, z, 0.7 + rnd() * 0.7, 0.8 + rnd() * 0.4, rnd() * 6.28]);
  inst(plantGeo(), pl, (x, z) => C(plantAt(x, z)).multiplyScalar(0.85 + rnd() * 0.3), 'gfx-plants', -0.02);
  const greenAt = (x, z) => { const gc = gcol.get(gk(x, z)); return !gc || gc[1] >= gc[0] * 0.9; };
  const fl = spots(Math.round(300 * D), 1.4).concat(spotsNear(Math.round(240 * D), 1.4)).filter(([x, z]) => sid !== 's2' || greenAt(x, z)).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6, 1, rnd() * 6.28]);
  const flowerCol = fl.map(([x, z]) => C(pick(typeof look.flowers === 'function' ? look.flowers(x, z) : look.flowers)));
  inst(flowerStem(), fl, null, 'gfx-flower-stems', 0);
  inst(flowerHeads(), fl, (x, z, i) => flowerCol[i], 'gfx-flowers', 0);
  if (bake.length) { const m = new THREE.Mesh(mergeGeometries(bake), mat); m.name = 'gfx-detail'; m.castShadow = false; m.receiveShadow = false; m.userData.noMerge = true; scene.add(m); out.parts.detailTris = m.geometry.attributes.position.count / 3; }
  // animation: clouds creep round the sky; ripples drift
  let t = 0;
  out.update = dt => { t += dt || 0; if (out.clouds) out.clouds.rotation.y = t * 0.004; for (const w of out.water) { w.offset.x = t * 0.012; w.offset.y = t * 0.02; } };
  out.setTime = v => { t = v; out.update(0); };   // v2.6.2 QC freeze
  return out;
}
