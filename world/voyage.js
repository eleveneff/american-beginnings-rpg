// world/voyage.js — Section 3 walkable level: "The Voyage of 1492" (Section 3, Chapter 1).
// Palos de la Frontera, Spain (north-east corner) → the Canary Islands (mid-ocean) → San Salvador / Guanahaní (west)
// → Hispaniola (south-west). Map directions are real: north = +z, WEST = +x. The ocean is shrunk enormously (the real
// crossing from La Gomera to San Salvador was more than 3,000 miles and took 33 days); the help card says so.
// Accuracy: the Santa María was a nao (bigger, a forecastle, square sails); the Niña and Pinta were caravels. At Palos the
// Niña still carries her triangular lateen sails; at the Canaries she was re-rigged with square sails for the trade winds.
// San Salvador is low and flat (no mountains), with Taíno round houses (bohíos), dugout canoes and hammocks. At
// Hispaniola only the Niña is afloat: the Santa María lies wrecked on the reef (December 25, 1492) and the Pinta was away
// until January 6, 1493. La Navidad is a small timber stockade, not a castle. Nothing here reads or writes the save.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

export const WATER_Y = -0.4, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const STATIONS = {
  church: { x: -38, z: 52, r: 9, label: 'Palos town square', n: 1, dir: 'start' },
  rabida: { x: -62, z: 72, r: 8, label: 'La Rábida friary', n: 2, dir: 'north-east, up the hill' },
  tower: { x: -73, z: 33, r: 6, label: 'Lookout tower', n: 3, dir: 'south-east, on the point' },
  rope: { x: -53, z: 36, r: 8, label: 'Rope & sail workshop', n: 4, dir: 'south of town' },
  pier: { x: -34, z: 30, r: 6, label: 'Pier: the three ships', n: 5, dir: 'south of the square' },
  canary: { x: -2, z: -5, r: 6, label: 'Canary Islands (La Gomera)', n: 6, dir: 'by ship' },
  ss: { x: 58, z: 9, r: 9, label: 'San Salvador (Guanahaní)', n: 7, dir: 'by ship, far west' },
  hisp: { x: 56, z: -43, r: 9, label: 'Hispaniola', n: 8, dir: 'by ship, south-west' }
};
export const ROADS = [
  [[-38, 44], [-38, 52], [-46, 60], [-55, 66], [-62, 72]],
  [[-62, 72], [-66, 58], [-71, 44], [-73, 33]],
  [[-73, 33], [-63, 34], [-53, 36], [-44, 33], [-34, 30], [-34, 24]],
  [[-38, 52], [-36, 40], [-34, 30]],
  [[-11, -3], [-2, -5]],
  [[49, 8], [58, 9], [66, 10]],
  [[50, -36], [56, -43], [62, -45]]
];
export function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
export const PATH = ROADS[0];
export const BOUNDS = { x0: -92, x1: 92, z0: -72, z1: 92 };
// islands: centre, radii, top height, wobble seed. e < 1 is land; the beach shelf runs out to e = 1.35.
const ISLES = [
  { k: 'palos', x: -60, z: 60, rx: 46, rz: 38, top: 1.1, w: 1 },
  { k: 'point', x: -75, z: 28, rx: 9, rz: 8, top: 2.2, w: 2 },
  { k: 'gomera', x: 2, z: -8, rx: 15, rz: 11, top: 2.4, w: 3 },
  { k: 'ss', x: 66, z: 8, rx: 17, rz: 10, top: 0.9, w: 4 },
  { k: 'hisp', x: 64, z: -62, rx: 36, rz: 24, top: 2.0, w: 5 },
  { k: 'tenerife', x: -26, z: -30, rx: 12, rz: 11, top: 1.5, w: 6 },
  { k: 'grancanaria', x: -48, z: -16, rx: 7, rz: 6, top: 1.5, w: 7 }
];
function isleE(I, x, z) { return Math.hypot((x - I.x) / I.rx, (z - I.z) / I.rz) + 0.04 * Math.sin(x * 0.31 + I.w) * Math.cos(z * 0.27 - I.w); }
function rawH(x, z) {
  let h = -3.4;
  for (const I of ISLES) { const e = isleE(I, x, z); if (e > 1.4) continue;
    let v = -3.4 + 3.75 * smooth(1.38, 0.97, e) + (I.top - 0.35) * smooth(0.95, 0.45, e);
    if (I.k === 'tenerife') v += 20 * Math.pow(smooth(0.95, 0.0, e), 1.6);   // Teide's volcano (seen from the sea; not walkable)
    if (I.k === 'grancanaria') v += 6 * smooth(0.9, 0.1, e);
    if (I.k === 'gomera') v += 5 * smooth(0.8, 0.1, Math.hypot((x - 8) / 9, (z + 10) / 7));   // La Gomera's high wooded middle
    if (I.k === 'hisp') v += 13 * smooth(0.75, 0.15, Math.hypot((x - 66) / 30, (z + 68) / 15)) * (0.8 + 0.2 * Math.sin(x * 0.4) * Math.sin(z * 0.5));
    h = Math.max(h, v); }
  h += 5.5 * Math.exp(-((x + 64) ** 2 + (z - 78) ** 2) / 160);   // the hill of La Rábida
  return h;
}
const FLAT = {}; for (const k in STATIONS) { const s = STATIONS[k]; FLAT[k] = rawH(s.x, s.z); }
export function groundH(x, z) {
  let h = rawH(x, z);
  for (const k in STATIONS) { const s = STATIONS[k], d = Math.hypot(x - s.x, z - s.z); if (d < s.r + 4) h += (FLAT[k] - h) * smooth(s.r + 4, s.r - 1, d) * (h > -0.5 ? 1 : 0); }
  const pd = pathDist(x, z); if (pd < 3 && h > 0) h -= 0.05 * smooth(3, 1, pd);
  return h;
}
export const shoreZ = () => 9999;
// the pier at Palos: a plank deck on piles running south into the harbor
export const PIER = { x0: -35.6, x1: -32.4, z0: 9, z1: 27, top: 0.62 };
export const STONES = [], FORD_ROWS = 0, FORD_RESPAWN = { x: -34, z: 34, yaw: 0 };
export function onStone(x, z, pad = 0) { const p = PIER; if (x > p.x0 - pad && x < p.x1 + pad && z > p.z0 - pad && z < p.z1 + pad && groundH(x, z) < p.top) return p; return null; }
export function riverZ() { return -9999; }
export function walkY(x, z) { const s = onStone(x, z); return s ? s.top : groundH(x, z); }
export function solid(x, z) { if (onStone(x, z)) return false; return groundH(x, z) < WATER_Y + 0.25; }
// where each ship-to-island trip lands (the "Set sail" card teleports here)
export const HARBORS = {
  palos: { x: -34, z: 12, yaw: 0, label: 'Palos, Spain' },
  canary: { x: -10.5, z: -2.5, yaw: 1.86, label: 'La Gomera, Canary Islands' },
  ss: { x: 51.5, z: 8.5, yaw: Math.PI / 2, label: 'San Salvador (Guanahaní)' },
  hisp: { x: 52, z: -37.5, yaw: Math.PI * 0.8, label: 'Hispaniola, north coast' }
};
// two dock mats on the Hispaniola beach for the Columbian Exchange carry puzzle (bins from content s3-exchange)
export const MATS = [{ bin: 'west', x: 50.5, z: -41 }, { bin: 'east', x: 61, z: -41 }];
export const MAT_HALF = 1.2;
export const RING_AT = {
  l0: [-36, 46.8], royal: [-41, 48], l2: [-59, 69], perez: [-65, 69.5], geomap: [-62, 66],
  l1: [-70, 31], stars: [-73, 38.6], sails: [-50, 33], market: [-55.2, 31.8],
  ships: [-38, 31], caravel: [-30, 31], l6: [-34, 21], 'sail-palos': [-34, 14],
  rudder: [1, -2], l5: [-4, -8.5], pigafetta: [2, -8], 'sail-canary': [-10, -6],
  l3: [61, 12], taino: [56, 13], after: [61, 6], 'sail-ss': [53, 5],
  l4: [53, -46], wreck: [51, -37.5], exchange: [55.5, -40], timeline: [60, -48.2], trial: [64, -44], 'sail-hisp': [56, -37]
};

// ---------------- geometry helpers (same as nations.js) ----------------
function vc(geo, color, jitter = 0, rnd = Math.random) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  const c = new THREE.Color(color), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 3) { const j = 1 + (rnd() - 0.5) * jitter; for (let v = 0; v < 3 && i + v < n; v++) { a[(i + v) * 3] = c.r * j; a[(i + v) * 3 + 1] = c.g * j; a[(i + v) * 3 + 2] = c.b * j; } }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo;
}
function P(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, jitter = 0, rnd) {
  const g = vc(geo.clone(), color, jitter, rnd); g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz))); return g;
}
const M = list => mergeGeometries(list.filter(Boolean), false);
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function tube(points, r, color, seg = 8) { const c = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))); return vc(new THREE.TubeGeometry(c, seg, r, 6, false), color); }
const CYL = (r0, r1, h, s = 6) => new THREE.CylinderGeometry(r0, r1, h, s);
const BOX = (x, y, z) => new THREE.BoxGeometry(x, y, z);
// a raw triangle list (both windings, so sails and hulls read from either side) with one colour per vertex
function tris(pts, colorFn) {
  const pos = [], col = [];
  for (let i = 0; i < pts.length; i += 3) { const t = [pts[i], pts[i + 1], pts[i + 2]]; for (const o of [t, [t[0], t[2], t[1]]]) for (const p of o) { pos.push(p[0], p[1], p[2]); const c = colorFn(p); col.push(c.r, c.g, c.b); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
const quad = (out, a, b, c, d) => out.push(a, b, c, a, c, d);

// ---------------- ships ----------------
// A lofted wooden hull (bow = +z), deck, stern castle, masts, yards and sails. kind 'nao' (Santa María: forecastle,
// bowsprit, three masts) or 'caravel' (Niña, Pinta). rig 'square' (square fore and main sails, a lateen mizzen) or
// 'lateen' (all triangular: the Niña before her refit at the Canaries).
const HULL_DK = new THREE.Color('#3e2c1e'), HULL_LT = new THREE.Color('#7a5534'), WALE = new THREE.Color('#2a1d14');
function shipGeo(kind, rig, opts = {}) {
  const nao = kind === 'nao', L = nao ? 17 : 14.5, W = nao ? 5.4 : 4.4, fb = nao ? 2.0 : 1.6, dr = 1.5, N = 14;
  const sec = [];
  for (let i = 0; i <= N; i++) { const t = i / N, z = -L / 2 + t * L, w = W / 2 * Math.pow(Math.max(0.001, Math.sin(Math.PI * (0.2 + 0.8 * t))), 0.5);
    const top = fb + 0.9 * Math.pow(1 - t, 3) + 0.6 * Math.pow(t, 4), bot = -dr * Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * t)), 0.35);
    sec.push([[-w, top, z], [-w * 1.02, fb * 0.35, z], [-w * 0.7, bot * 0.75, z], [0, bot, z], [w * 0.7, bot * 0.75, z], [w * 1.02, fb * 0.35, z], [w, top, z]]); }
  const hp = []; for (let i = 0; i < N; i++) for (let j = 0; j < 6; j++) quad(hp, sec[i][j], sec[i + 1][j], sec[i + 1][j + 1], sec[i][j + 1]);
  // transom (flat stern)
  const s0 = sec[0]; for (let j = 1; j < 6; j++) hp.push(s0[3], s0[j], s0[j + 1]); hp.push(s0[0], s0[1], s0[6]); hp.push(s0[1], s0[5], s0[6]);
  const hull = tris(hp, p => p[1] > fb * 0.55 && p[1] < fb * 0.75 ? WALE : p[1] > fb * 0.2 ? HULL_LT : HULL_DK);
  const dp = []; for (let i = 0; i < N; i++) { const a = sec[i], b = sec[i + 1], y = fb - 0.25; quad(dp, [a[0][0] * 0.96, y, a[0][2]], [b[0][0] * 0.96, y, b[0][2]], [b[6][0] * 0.96, y, b[6][2]], [a[6][0] * 0.96, y, a[6][2]]); }
  const deck = tris(dp, () => new THREE.Color('#a58256'));
  const g = [hull, deck];
  // stern castle (both kinds) and the nao's forecastle
  const ac = nao ? 4.2 : 3.4; g.push(P(BOX(W * 0.82, 1.1, ac), '#6e4b2e', 0, fb + 0.75, -L / 2 + ac / 2 + 0.2), P(BOX(W * 0.86, 0.12, ac + 0.1), '#4a3220', 0, fb + 1.32, -L / 2 + ac / 2 + 0.2));
  for (const sx of [-1, 1]) g.push(P(BOX(0.1, 0.5, ac), '#4a3220', sx * W * 0.42, fb + 1.6, -L / 2 + ac / 2 + 0.2));
  if (nao) { g.push(P(BOX(W * 0.55, 1.0, 2.6), '#6e4b2e', 0, fb + 0.95, L / 2 - 2.6), P(BOX(0.12, 0.12, 4.2), '#5a3d24', 0, fb + 1.1, L / 2 + 0.9, -0.35, 0, 0)); }
  // rudder, and a ship's boat lashed amidships
  g.push(P(BOX(0.18, 2.6, 0.9), '#4a3220', 0, fb * 0.2 - 0.3, -L / 2 - 0.35));
  if (!opts.wreck) g.push(P(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#6e4b2e', 0, fb - 0.05, 0.6, Math.PI, 0, 0, 0.7, 0.35, 1.7));
  // masts: [z, height, kind of sail]
  const masts = nao ? [[L * 0.32, 10, 'sq'], [L * 0.03, 14, 'sq'], [-L * 0.3, 8.5, 'lat']] : rig === 'lateen' ? [[L * 0.2, 11, 'lat'], [-L * 0.1, 9, 'lat'], [-L * 0.33, 7, 'lat']] : [[L * 0.24, 10, 'sq'], [-L * 0.04, 12, 'sq'], [-L * 0.32, 8, 'lat']];
  const SAIL = new THREE.Color(opts.wreck ? '#9a8f78' : '#efe6cf'), SAIL_D = new THREE.Color(opts.wreck ? '#8a8068' : '#d9ccb0');
  masts.forEach(([mz, mh, sk], mi) => {
    if (opts.wreck && mi === 0) mh *= 0.4;   // the wreck's foremast is broken off
    g.push(P(CYL(0.11, 0.17, mh, 7), '#5a3d24', 0, fb + mh / 2 - 0.3, mz));
    if (opts.wreck && mi === 0) return;
    if (sk === 'sq') { const sw = (nao ? 5.6 : 4.8) * (mi === 1 ? 1.1 : 0.85), sh = mh * 0.48, yt = fb + mh - 1.0;
      g.push(P(CYL(0.08, 0.08, sw + 0.8, 5), '#5a3d24', 0, yt, mz + 0.18, 0, 0, Math.PI / 2));
      const sp = [], R = 4, C = 4; for (let a = 0; a < R; a++) for (let b = 0; b < C; b++) { const pt = (u, v) => [(-0.5 + u / C) * sw * (1 - 0.06 * v / R), yt - 0.1 - v / R * sh, mz + 0.3 + (opts.furled ? 0 : 0.9 * Math.sin(Math.PI * u / C) * Math.sin(Math.PI * (0.15 + 0.85 * v / R)))]; quad(sp, pt(b, a), pt(b + 1, a), pt(b + 1, a + 1), pt(b, a + 1)); }
      if (opts.furled) g.push(P(CYL(0.3, 0.3, sw, 6), SAIL.getStyle(), 0, yt - 0.3, mz + 0.18, 0, 0, Math.PI / 2)); else g.push(tris(sp, p => p[1] > yt - sh * 0.5 ? SAIL : SAIL_D));
    } else { const yl = mh * 1.15, ya = [0, fb + mh * 0.95, mz - yl * 0.45], yb = [0, fb + mh * 0.35, mz + yl * 0.55], clew = [0, fb + 1.2, mz - yl * 0.38];
      g.push(tube([ya, [(ya[0] + yb[0]) / 2, (ya[1] + yb[1]) / 2, (ya[2] + yb[2]) / 2], yb], 0.06, '#5a3d24', 2));
      if (!opts.furled) { const mid = [0.5, (ya[1] + clew[1]) / 2 + 0.2, (ya[2] + yb[2]) / 2 - 0.4]; g.push(tris([ya, yb, mid, ya, mid, clew, mid, yb, clew], p => p[1] > fb + mh * 0.5 ? SAIL : SAIL_D)); } }
    g.push(P(BOX(0.04, 0.4, 0.9), '#b0302a', 0, fb + mh - 0.1, mz - 0.5));   // pennant
  });
  // shrouds (rigging lines) to the main mast
  const mm = masts[nao ? 1 : rig === 'lateen' ? 0 : 1]; for (const sx of [-1, 1]) for (const dz of [-1.2, 0, 1.2]) g.push(tube([[sx * W * 0.48, fb + 0.1, mm[0] + dz], [0, fb + mm[1] * 0.8, mm[0]]], 0.02, '#3a2a1a', 1));
  return M(g);
}

// ---------------- land props ----------------
function roofGeo(w, d, h, col) { const a = Math.atan2(h, d / 2), sl = Math.hypot(h, d / 2) + 0.15; return [P(BOX(w + 0.3, 0.14, sl), col, 0, h / 2, d / 4, a, 0, 0), P(BOX(w + 0.3, 0.14, sl), col, 0, h / 2, -d / 4, -a, 0, 0)]; }
function houseGeo(w, d, h, wall = '#efe9dc', roof = '#b5603a', rnd) {
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
  for (const p of roofGeo(w, d, 0.9, roof)) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(0.9, 1.7, 0.08), '#5a3a22', 0, 0.85, d / 2 + 0.02), P(BOX(0.6, 0.6, 0.08), '#3a2a1a', w * 0.28, h * 0.62, d / 2 + 0.02));
  return M(g);
}
function palmGeo(rnd, h = 6) {
  const lean = 0.6 + rnd() * 0.8, g = [tube([[0, 0, 0], [lean * 0.3, h * 0.5, 0], [lean, h, 0]], 0.18, '#8a7356', 6)];
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + rnd() * 0.3; g.push(P(new THREE.ConeGeometry(0.35, 3.0, 4), '#3f8a3a', lean + Math.cos(a) * 1.2, h - 0.25, Math.sin(a) * 1.2, 0, -a, Math.PI / 2 + 0.45, 1, 1, 0.25, 0.2, rnd)); }
  g.push(P(new THREE.SphereGeometry(0.35, 6, 4), '#5a4a2a', lean, h - 0.1, 0));
  return M(g);
}
function bohioGeo(r = 1.8, rnd) {   // Taíno round house: cane walls, a tall cone of thatch
  const g = [P(CYL(r, r, 1.7, 14, true), '#b39a6a', 0, 0.85, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd), P(new THREE.ConeGeometry(r * 1.3, r * 1.35, 14), '#c8ad72', 0, 1.7 + r * 0.67, 0, 0, 0, 0, 1, 1, 1, 0.1, rnd), P(BOX(0.8, 1.4, 0.1), '#3a2a1a', 0, 0.7, r - 0.02)];
  return M(g);
}
function canoeGeo() { return M([P(CYL(0.42, 0.42, 6, 10), '#6a4a2c', 0, 0.25, 0, Math.PI / 2, 0, 0, 1, 1, 0.7), P(BOX(0.55, 0.12, 5.2), '#3a2616', 0, 0.55, 0), P(new THREE.ConeGeometry(0.42, 0.8, 10), '#6a4a2c', 0, 0.25, 3.4, Math.PI / 2, 0, 0, 1, 1, 0.7), P(new THREE.ConeGeometry(0.42, 0.8, 10), '#6a4a2c', 0, 0.25, -3.4, -Math.PI / 2, 0, 0, 1, 1, 0.7)]); }
function hammockGeo() { return M([P(CYL(0.08, 0.1, 2.0, 6), '#6b4f30', -1.6, 1.0, 0), P(CYL(0.08, 0.1, 2.0, 6), '#6b4f30', 1.6, 1.0, 0), tube([[-1.55, 1.55, 0], [0, 0.85, 0], [1.55, 1.55, 0]], 0.3, '#e8dcc0', 10)].map((g, i) => { if (i === 2) g.scale(1, 0.35, 1.6); return g; })); }
function barrelGeo() { return M([P(CYL(0.36, 0.36, 0.9, 10), '#8a6038', 0, 0.45, 0), P(CYL(0.38, 0.38, 0.06, 10), '#3a2a1a', 0, 0.2, 0), P(CYL(0.38, 0.38, 0.06, 10), '#3a2a1a', 0, 0.7, 0)]); }
function crateGeo(col = '#9a7448') { return M([P(BOX(0.8, 0.6, 0.6), col), P(BOX(0.84, 0.06, 0.64), '#5a3d24', 0, 0.3, 0)]); }
function ropeCoil() { return M([P(new THREE.TorusGeometry(0.38, 0.1, 6, 14), '#b89a62', 0, 0.1, 0, Math.PI / 2, 0, 0), P(new THREE.TorusGeometry(0.3, 0.1, 6, 12), '#a88a52', 0, 0.26, 0, Math.PI / 2, 0, 0)]); }

// labels and icons (same look as the earlier levels)
const ICONS = {};
function iconTex(txt) {
  if (ICONS[txt]) return ICONS[txt];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,247,226,0.95)'; x.strokeStyle = '#2a1a0c'; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2); x.fill(); x.stroke();
  x.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (ICONS[txt] = t);
}
export function labelSprite(text, w = 6, sub) {
  const c = document.createElement('canvas'); c.width = 512; c.height = sub ? 150 : 110; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,247,226,0.93)'; x.strokeStyle = '#2a1a0c'; x.lineWidth = 6; const r = 26;
  x.beginPath(); x.roundRect ? x.roundRect(6, 6, 500, c.height - 12, r) : x.rect(6, 6, 500, c.height - 12); x.fill(); x.stroke();
  x.fillStyle = '#2a1a0c'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 44px "Segoe UI","Noto Sans",sans-serif, "Noto Color Emoji"';
  x.fillText(text, 256, sub ? 56 : c.height / 2 + 2, 480);
  if (sub) { x.font = '32px "Segoe UI","Noto Sans",sans-serif'; x.fillStyle = '#5a4126'; x.fillText(sub, 256, 108, 480); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true })); s.scale.set(w, w * c.height / 512, 1); s.userData.noMerge = true; return s;
}
let BEAM_TEX = null;
function beamTex() { if (BEAM_TEX) return BEAM_TEX; const c = document.createElement('canvas'); c.width = 4; c.height = 64; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 64, 0, 0); g.addColorStop(0, 'rgba(255,255,255,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); BEAM_TEX = new THREE.CanvasTexture(c); return BEAM_TEX; }
export const RING_COL = { new: '#ffc83a', done: '#5ab0ff', star: '#ffe680', locked: '#9aa0a6' };
function makeRing(scene, def, y) {
  const g = new THREE.Group(); g.position.set(def.x, y, def.z); g.userData.noMerge = true; g.name = 'ring:' + def.id;
  const disc = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.45, 40), new THREE.MeshBasicMaterial({ color: RING_COL.new, transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; g.add(disc);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 2.4, 24, 1, true), new THREE.MeshBasicMaterial({ color: RING_COL.new, map: beamTex(), transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  beam.position.y = 1.2; g.add(beam);
  const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex(def.icon || '✨'), depthWrite: false })); icon.scale.set(0.9, 0.9, 1); icon.position.y = 2.9; g.add(icon);
  scene.add(g); return { def, group: g, disc, beam, icon, state: 'new' };
}
export function setRingState(r, state) {
  if (r.state === state) return; r.state = state; const c = RING_COL[state] || RING_COL.new;
  r.disc.material.color.set(c); r.beam.material.color.set(c); r.beam.material.opacity = state === 'locked' ? 0.25 : state === 'new' ? 0.6 : 0.4;
}

// ---------------- build ----------------
export function buildVoyage({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(20261492);
  const scene = new THREE.Scene(); scene.name = 'voyage';
  const SKY_TOP = new THREE.Color('#3f93e0'), SKY_H = new THREE.Color('#e6eef2');
  scene.fog = new THREE.Fog(SKY_H, 90, 320);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), SEA = new THREE.Color('#9fbfcf');
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; if (y < 0) c.copy(SKY_H).lerp(SEA, Math.min(1, -y * 6)); else c.copy(SKY_H).lerp(SKY_TOP, Math.pow(y, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky;
    const gc = document.createElement('canvas'); gc.width = gc.height = 64; const x = gc.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,246,220,1)'); gr.addColorStop(0.25, 'rgba(255,238,204,0.6)'); gr.addColorStop(1, 'rgba(255,232,194,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), fog: false, depthWrite: false, transparent: true })); glow.scale.set(90, 90, 1); glow.position.set(170, 160, 120); glow.userData.noMerge = true; scene.add(glow); scene.userData.glow = glow; }
  const hemi = new THREE.HemisphereLight('#eef4ff', '#7f9a8a', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d6', 2.1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  // terrain colour: dry Andalusian fields and lanes at Palos, green La Gomera, white-sand Caribbean beaches, coral shallows
  const C = k => new THREE.Color(k);
  const PALOS = C('#a9a865'), GREEN = C('#5e9a4a'), TROP = C('#4f9a44'), SAND = C('#e6d7a6'), WSAND = C('#f1e8c8'), PATHC = C('#b29a72'), PLAZA = C('#c9b48e'), SHALLOW = C('#58c2bf'), DEEP = C('#1f5d86'), ROCK = C('#6d5a4a'), LAVA = C('#5b4b44');
  const terrColor = (x, z, c) => {
    const h = groundH(x, z), trop = x > 25, gom = x > -60 && x <= 25 && z < 10;
    if (h < WATER_Y) { c.copy(DEEP).lerp(SHALLOW, smooth(-3.0, -0.8, h)); if (trop) c.lerp(C('#7fe0d0'), smooth(-1.6, -0.6, h) * 0.6); return c; }
    c.copy(trop ? TROP : gom ? GREEN : PALOS); c.multiplyScalar(0.94 + 0.08 * Math.sin(x * 0.21) * Math.cos(z * 0.17));
    if (gom && h > 7) c.lerp(LAVA, smooth(7, 12, h)); if (trop && h > 8) c.lerp(C('#2f6a32'), 0.5);
    c.lerp(trop ? WSAND : SAND, 1 - smooth(0.25, 0.75, h));
    if (!trop && !gom && Math.hypot(x - STATIONS.church.x, z - STATIONS.church.z + 3) < 8) c.lerp(PLAZA, 0.8);
    const pd = pathDist(x, z); c.lerp(PATHC, (1 - smooth(1.0, 2.4, pd)) * (trop ? 0.35 : 0.7));
    return c; };
  const terrNormals = geo => { const p = geo.attributes.position, n = p.count, nrm = new Float32Array(n * 3), e = 0.5, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); v.set(groundH(x - e, z) - groundH(x + e, z), 2 * e, groundH(x, z - e) - groundH(x, z + e)).normalize(); nrm.set([v.x, v.y, v.z], i * 3); }
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); };
  const terrain = new THREE.Group(); terrain.name = 'terrain'; scene.add(terrain);
  for (let tx = 0; tx < 5; tx++) for (let tz = 0; tz < 5; tz++) { const W = 52, D = 48, geo = new THREE.PlaneGeometry(W, D, 34, 32); geo.rotateX(-Math.PI / 2); geo.translate(-130 + W * (tx + 0.5), 0, -110 + D * (tz + 0.5));
    const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, groundH(x, z)); terrColor(x, z, c); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); terrNormals(geo); geo.computeBoundingSphere();
    const t = new THREE.Mesh(geo, lam); t.receiveShadow = true; t.name = 'terrain-tile'; t.userData.noMerge = true; terrain.add(t); }
  { const g = new THREE.PlaneGeometry(1000, 1000); g.rotateX(-Math.PI / 2); const f = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#1f5d86' })); f.position.y = -3.45; f.userData.noMerge = true; f.name = 'sea-floor'; scene.add(f); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshLambertMaterial({ color: '#2f86b8', transparent: true, opacity: 0.8, depthWrite: false }));
  water.geometry.rotateX(-Math.PI / 2); water.position.y = WATER_Y; water.userData.noMerge = true; water.renderOrder = 2; water.name = 'sea'; scene.add(water);

  const statics = new THREE.Group(); statics.name = 'statics'; scene.add(statics);
  const add = (geo, x, z, ry = 0, s = 1, cast = true, y = null) => { const m = new THREE.Mesh(geo, lam); m.position.set(x, y == null ? groundH(x, z) : y, z); m.rotation.y = ry; m.scale.setScalar(s); m.castShadow = cast; m.receiveShadow = true; statics.add(m); return m; };
  const colliders = { out: [], cave: [] };
  const circ = (x, z, r) => { const c = { type: 'c', x, z, r }; colliders.out.push(c); return c; };
  const box = (x0, x1, z0, z1, tag) => { const b = { type: 'b', x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, tag }; colliders.out.push(b); return b; };
  const camOcc = [];
  const occBox = (x0, x1, z0, z1, y1) => camOcc.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, y0: -5, y1 });
  const occC = (x, z, r, y1, y0 = -5) => camOcc.push({ x, z, r, y0, y1 });
  const labels = [], gy = (x, z) => groundH(x, z);
  // a building: placed, rotated by ry (0 = door faces south... see houseGeo: door on local +z), collides and blocks the camera
  const building = (geo, x, z, ry, w, d, h) => { add(geo, x, z, ry); const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = (w * c + d * s) / 2, hz = (w * s + d * c) / 2; box(x - hx, x + hx, z - hz, z + hz); occBox(x - hx, x + hx, z - hz, z + hz, gy(x, z) + h + 1); };

  // ===== 1 · Palos town square and the Church of San Jorge (its door faces the square, to the south)
  { const { x: cx, z: cz } = STATIONS.church, ch = [], W = 7, D = 14, H = 6;
    ch.push(P(BOX(W, H, D), '#dcc39a', 0, H / 2, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)); for (const p of roofGeo(W, D, 2.2, '#a9573a')) { p.rotateY(Math.PI / 2); p.translate(0, H, 0); ch.push(p); }
    ch.push(P(BOX(2.2, 3.4, 0.2), '#5a3a22', 0, 1.7, -D / 2 - 0.05), P(CYL(1.1, 1.1, 0.2, 12, 1, false), '#5a3a22', 0, 3.4, -D / 2 - 0.05, Math.PI / 2, 0, 0, 1, 1, 1), P(BOX(3.0, 0.4, 0.3), '#b89a72', 0, 4.9, -D / 2 - 0.1));
    ch.push(P(BOX(2.8, 10, 2.8), '#d4b98e', W / 2 + 0.6, 5, D / 2 - 2), P(BOX(3.1, 0.3, 3.1), '#b89a72', W / 2 + 0.6, 10.1, D / 2 - 2), P(new THREE.ConeGeometry(2.1, 2.2, 4), '#a9573a', W / 2 + 0.6, 11.3, D / 2 - 2, 0, Math.PI / 4, 0));
    for (const sx of [-1, 1]) ch.push(P(BOX(0.1, 1.4, 0.9), '#2a1d14', W / 2 + 0.6 + sx * 1.42, 8.6, D / 2 - 2));
    add(M(ch), cx, cz + 10, 0); box(cx - W / 2, cx + W / 2 + 2.1, cz + 3, cz + 17); occBox(cx - W / 2, cx + W / 2 + 2.1, cz + 3, cz + 17, gy(cx, cz) + 12);
    // plaza well and a notice board (the royal order was read aloud here in May 1492)
    add(M([P(CYL(0.9, 1.0, 0.8, 12), '#b8ab94', 0, 0.4, 0), P(CYL(0.06, 0.06, 1.8, 5), '#5a3d24', -0.8, 1.3, 0), P(CYL(0.06, 0.06, 1.8, 5), '#5a3d24', 0.8, 1.3, 0), P(CYL(0.05, 0.05, 1.8, 5), '#5a3d24', 0, 2.2, 0, 0, 0, Math.PI / 2)]), cx + 3.5, cz - 3); circ(cx + 3.5, cz - 3, 1.1);
    add(M([P(CYL(0.08, 0.08, 2.2, 5), '#5a3d24', -0.7, 1.1, 0), P(CYL(0.08, 0.08, 2.2, 5), '#5a3d24', 0.7, 1.1, 0), P(BOX(1.8, 1.1, 0.08), '#e9dfc4', 0, 1.6, 0.05), P(BOX(1.9, 0.12, 0.2), '#5a3d24', 0, 2.25, 0)]), cx - 6.5, cz + 0.5, Math.PI); circ(cx - 6.5, cz + 0.5, 0.5);
    // whitewashed houses with red tile roofs around the square and along the lanes
    for (const [x, z, ry, w, d] of [[-27, 54, -Math.PI / 2, 6, 4.5], [-27, 46.5, -Math.PI / 2, 5, 4.5], [-48.5, 49, Math.PI / 2, 5.5, 4.5], [-47, 57.5, Math.PI / 2, 5, 4.2], [-28, 39, -Math.PI / 2, 5, 4], [-44.5, 41, Math.PI / 2, 4.5, 4], [-30, 63, Math.PI, 6, 4.5], [-22, 50, -Math.PI / 2, 5, 4], [-41, 64, Math.PI * 0.75, 5, 4]])
      building(houseGeo(w, d, 3.2 + rnd() * 0.8, rnd() < 0.3 ? '#f2e3c4' : '#f3efe6', '#b5603a', rnd), x, z, ry, w, d, 4.2);
    labels.push([STATIONS.church, '1 · Palos de la Frontera', 'Church of San Jorge · town square']); }

  // ===== 2 · La Rábida friary on its hill: white walls, tiled roofs, a bell gable, a cloister courtyard (seen from outside)
  { const { x: cx, z: cz } = STATIONS.rabida, g = [];
    g.push(P(BOX(12, 4, 0.8), '#f3efe6', 0, 2, 6), P(BOX(12, 4, 0.8), '#f3efe6', 0, 2, -0.5), P(BOX(0.8, 4, 7.3), '#f3efe6', 6, 2, 2.75), P(BOX(0.8, 4, 7.3), '#f3efe6', -6, 2, 2.75));
    for (const p of roofGeo(12.8, 2.4, 0.7, '#b5603a')) { p.translate(0, 4, 6); g.push(p.clone()); p.translate(0, 0, -6.5); g.push(p); }
    g.push(P(BOX(5, 6, 9), '#f3efe6', -9, 3, 3)); for (const p of roofGeo(9, 5, 1.6, '#b5603a')) { p.rotateY(Math.PI / 2); p.translate(-9, 6, 3); g.push(p); }
    g.push(P(BOX(3.6, 3.2, 0.7), '#f3efe6', -9, 7.6, -1.2)); for (const sx of [-0.8, 0.8]) g.push(P(BOX(0.7, 1.1, 0.75), '#3a2a1a', -9 + sx, 7.9, -1.2), P(CYL(0.25, 0.3, 0.45, 8), '#9a7a3a', -9 + sx, 7.6, -1.2));
    g.push(P(BOX(1.6, 2.4, 0.1), '#5a3a22', 0, 1.2, -0.95), P(BOX(1.6, 2.4, 0.1), '#5a3a22', -9, 1.2, -1.55));
    for (let i = 0; i < 4; i++) g.push(P(CYL(0.2, 0.2, 2.8, 8), '#e6dccb', -3 + i * 2, 1.4, 2.6));
    add(M(g), cx, cz + 4, 0); box(cx - 11.5, cx + 6.4, cz + 3, cz + 10.4); occBox(cx - 11.5, cx + 6.4, cz + 3, cz + 10.4, gy(cx, cz) + 9);
    for (const [x, z] of [[-55, 79], [-69, 77], [-57, 64], [-69, 63]]) { add(M([P(CYL(0.12, 0.16, 2.2, 5), '#6e5a3a', 0, 1.1, 0), P(new THREE.IcosahedronGeometry(1.1, 0), '#7a8c4a', 0, 2.6, 0, 0, 0, 0, 1, 0.8, 1, 0.2, rnd)]), x, z); circ(x, z, 0.4); }   // olive trees
    labels.push([STATIONS.rabida, '2 · La Rábida friary', 'Fray Juan Pérez · the road to the Queen']); }

  // ===== 3 · lookout tower on the point: a plain round stone watchtower, and a stand with a quadrant and an astrolabe
  { const { x: cx, z: cz } = STATIONS.tower;
    add(M([P(CYL(1.9, 2.2, 9, 14), '#b9ac93', 0, 4.5, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd), P(CYL(2.15, 2.0, 0.5, 14), '#a89c84', 0, 9.2, 0), P(BOX(1.0, 1.9, 0.2), '#4a3220', 0, 0.95, -2.1), P(BOX(0.35, 0.8, 0.2), '#2a1d14', 0, 6.5, -1.95)]), cx - 2.5, cz + 2.5); circ(cx - 2.5, cz + 2.5, 2.3); occC(cx - 2.5, cz + 2.5, 2.3, gy(cx, cz) + 9.5);
    add(M([P(CYL(0.08, 0.1, 1.2, 6), '#5a3d24', 0, 0.6, 0), P(new THREE.TorusGeometry(0.45, 0.05, 6, 24), '#c99a3a', 0, 1.65, 0), P(BOX(0.85, 0.04, 0.04), '#c99a3a', 0, 1.65, 0, 0, 0, 0.5), P(CYL(0.03, 0.03, 0.4, 4), '#c99a3a', 0, 1.15, 0)]), cx + 1.8, cz - 1.5, 0.4); circ(cx + 1.8, cz - 1.5, 0.35);
    labels.push([STATIONS.tower, '3 · Lookout tower', 'the North Star · latitude']); }

  // ===== 4 · rope and sail workshop: an open tiled shed (a ropewalk), coils of hemp rope, sailcloth; a ship's-stores stall
  { const { x: cx, z: cz } = STATIONS.rope, g = [];
    for (const sx of [-5, -1.7, 1.7, 5]) for (const sz of [-1.8, 1.8]) g.push(P(CYL(0.12, 0.14, 2.8, 6), '#6b4f30', sx, 1.4, sz));
    for (const p of roofGeo(10.6, 4.2, 0.8, '#b5603a')) { p.translate(0, 2.8, 0); g.push(p); }
    g.push(tube([[-5, 1.0, 0], [0, 0.95, 0], [5, 1.0, 0]], 0.04, '#c8aa72', 4), P(BOX(0.4, 1.2, 0.8), '#6b4f30', -5.2, 0.6, 0), P(BOX(0.4, 1.2, 0.8), '#6b4f30', 5.2, 0.6, 0));
    add(M(g), cx, cz + 4.5, 0); for (const sx of [-5, -1.7, 1.7, 5]) for (const sz of [-1.8, 1.8]) circ(cx + sx, cz + 4.5 + sz, 0.2); occBox(cx - 5.5, cx + 5.5, cz + 2.3, cz + 6.7, gy(cx, cz) + 3.8);
    for (const [dx, dz] of [[-3, 4], [-2.2, 5.2], [3.5, 3.6]]) add(ropeCoil(), cx + dx, cz + dz);
    add(M([P(CYL(0.35, 0.35, 2.6, 8), '#efe6cf', 0, 0.35, 0, 0, 0, Math.PI / 2), P(CYL(0.35, 0.35, 2.6, 8), '#e6dcc2', 0, 0.35, 0.75, 0, 0, Math.PI / 2), P(CYL(0.35, 0.35, 2.6, 8), '#efe6cf', 0, 0.95, 0.38, 0, 0, Math.PI / 2)]), cx + 1, cz + 5.3); box(cx - 0.4, cx + 2.4, cz + 4.9, cz + 6.4);
    // model rigs on two little masts: a square sail and a triangular lateen sail (west of the shed)
    { const sq = [P(CYL(0.06, 0.08, 3.6, 6), '#5a3d24', 0, 1.8, 0), P(CYL(0.04, 0.04, 2.2, 5), '#5a3d24', 0, 3.3, 0.1, 0, 0, Math.PI / 2), P(BOX(2.0, 1.8, 0.04), '#efe6cf', 0, 2.3, 0.15)];
      const lt = [P(CYL(0.06, 0.08, 3.0, 6), '#5a3d24', 0, 1.5, 0), tube([[0, 3.6, -1.2], [0, 2.4, 0], [0, 1.2, 1.4]], 0.04, '#5a3d24', 2), tris([[0.05, 3.55, -1.15], [0.05, 1.25, 1.35], [0.05, 1.3, -0.9]], () => new THREE.Color('#efe6cf'))];
      add(M(sq), cx + 4.5, cz - 1.8, Math.PI); circ(cx + 4.5, cz - 1.8, 0.3); add(M(lt), cx + 7, cz - 1.5, 0); circ(cx + 7, cz - 1.5, 0.3); }
    // ship's stores stall: barrels of water and wine, biscuit, salted fish, beans
    add(M([P(CYL(0.08, 0.08, 2.4, 5), '#6b4f30', -1.4, 1.2, -0.8), P(CYL(0.08, 0.08, 2.4, 5), '#6b4f30', 1.4, 1.2, -0.8), P(CYL(0.08, 0.08, 2.4, 5), '#6b4f30', -1.4, 1.2, 0.8), P(CYL(0.08, 0.08, 2.4, 5), '#6b4f30', 1.4, 1.2, 0.8), P(BOX(3.2, 0.06, 2.0), '#c9a35a', 0, 2.42, 0, 0.08, 0, 0), P(BOX(2.6, 0.8, 0.9), '#8a6038', 0, 0.4, 0)]), cx - 5.5, cz - 1.5, 0); box(cx - 7, cx - 4, cz - 2.5, cz - 0.5); occBox(cx - 7, cx - 4, cz - 2.5, cz - 0.5, gy(cx, cz) + 2.6);
    for (const [dx, dz] of [[-7.6, -1], [-7.8, 0.2], [-3.4, -2.6]]) { add(barrelGeo(), cx + dx, cz + dz); circ(cx + dx, cz + dz, 0.4); }
    labels.push([STATIONS.rope, '4 · Rope & sail workshop', 'square sails · lateen sails · ship’s stores']); }

  // ===== 5 · the pier and the three ships of 1492 (at Palos the Niña still has her lateen sails)
  { const p = PIER, len = p.z1 - p.z0, g = [P(BOX(p.x1 - p.x0, 0.2, len), '#9a7a52', 0, p.top - 0.1, 0)];
    for (let i = 0; i < len / 0.5; i++) g.push(P(BOX(p.x1 - p.x0 + 0.02, 0.03, 0.04), '#5a3d24', 0, p.top + 0.005, -len / 2 + i * 0.5));
    for (let z = 0; z <= len; z += 3) for (const sx of [-1, 1]) g.push(P(CYL(0.16, 0.18, 4.2, 6), '#5a4126', sx * ((p.x1 - p.x0) / 2 - 0.1), p.top - 2.2, -len / 2 + z), P(CYL(0.12, 0.12, 0.7, 6), '#5a4126', sx * ((p.x1 - p.x0) / 2 - 0.1), p.top + 0.3, -len / 2 + z));
    add(M(g), (p.x0 + p.x1) / 2, (p.z0 + p.z1) / 2, 0, 1, true, 0);
    for (let z = p.z0; z <= p.z1; z += 3) for (const x of [p.x0 + 0.1, p.x1 - 0.1]) circ(x, z, 0.14);
    const ships = [['caravel', 'lateen', -28.3, 15, 'Niña', 'caravel'], ['caravel', 'square', -39.7, 16, 'Pinta', 'caravel'], ['nao', 'square', -46, 10, 'Santa María', 'nao (the flagship)']];
    for (const [k, rig, x, z, name, type] of ships) { add(shipGeo(k, rig), x, z, rnd() * 0.06 - 0.03, 0.8, true, WATER_Y - 0.15); const lab = labelSprite(name, 4.2, type); lab.position.set(x, 12.5, z); lab.name = 'ship-label'; scene.add(lab); occC(x, z, 2.6, 2.5); }
    add(M([barrelGeo(), (() => { const b = barrelGeo(); b.translate(0.8, 0, 0.2); return b; })(), (() => { const c = crateGeo(); c.translate(-0.2, 0, 1.0); return c; })()]), -36.5, 27.5); circ(-36.2, 28, 1.1);
    labels.push([STATIONS.pier, '5 · Pier', 'Niña · Pinta · Santa María']); }

  // a fleet sprite-free helper: the ships moored at each landing
  const fleet = (list) => { for (const [k, rig, x, z, ry, s, extra] of list) add(shipGeo(k, rig, extra || {}), x, z, ry, s || 0.8, true, WATER_Y - 0.15 + (extra && extra.dy || 0)); };

  // ===== 6 · Canary Islands: La Gomera (walkable), Tenerife's volcano and Gran Canaria (seen from the sea). The fleet rides at
  // anchor; here the Niña wears square sails now (she was re-rigged at Gran Canaria) and the Pinta's rudder was repaired.
  { const { x: cx, z: cz } = STATIONS.canary;
    fleet([['caravel', 'square', -20, -3, 0.4], ['caravel', 'square', -18, 6, 0.2, 0.8, { furled: true }], ['nao', 'square', -23, -11, 0.5, 0.8, { furled: true }]]);
    for (const [x, z, ry] of [[3, 1.5, Math.PI], [7, -1, Math.PI * 0.8], [-1, -10.5, 0]]) building(houseGeo(4.2, 3.6, 3, '#f3efe6', '#b5603a', rnd), x, z, ry, 4.2, 3.6, 3.8);
    add(M([P(CYL(0.8, 0.9, 0.7, 10), '#9a8f7a', 0, 0.35, 0), P(CYL(0.6, 0.6, 0.05, 10), '#3d6f8a', 0, 0.68, 0)]), cx + 3.5, cz - 1); circ(cx + 3.5, cz - 1, 0.95);   // a well: fresh water for the crossing
    for (const [dx, dz] of [[-4.5, 2.2], [-3.7, 2.8], [-5.2, 3.0]]) { add(barrelGeo(), cx + dx, cz + dz); circ(cx + dx, cz + dz, 0.4); }
    add(M([P(BOX(0.4, 0.3, 2.6), '#4a3220', 0, 0.15, 0), P(BOX(0.18, 2.4, 0.9), '#4a3220', 0, 0.5, -1.2, Math.PI / 2 - 0.2, 0, 0)]), cx - 1, cz + 4.3, 0.6); circ(cx - 1, cz + 4.3, 1.1);   // a spare rudder on the beach
    labels.push([STATIONS.canary, '6 · Canary Islands', 'last stop before the open ocean']); }

  // ===== 7 · San Salvador (Guanahaní): low and flat, white sand, palms, a Taíno village with bohíos, dugout canoes and hammocks
  { const { x: cx, z: cz } = STATIONS.ss;
    fleet([['caravel', 'square', 41, 4, Math.PI / 2, 0.8, { furled: true }], ['caravel', 'square', 40, 14, Math.PI / 2 + 0.2, 0.8, { furled: true }], ['nao', 'square', 37, -5, Math.PI / 2 - 0.2, 0.8, { furled: true }]]);
    for (const [x, z, r] of [[68, 13, 1.9], [72, 7, 1.8], [67, 3, 1.7], [75, 12, 1.6]]) { add(bohioGeo(r, rnd), x, z, Math.atan2(cx - x, cz - z)); circ(x, z, r + 0.1); occC(x, z, r, gy(x, z) + 1.7 + r * 1.35); }
    { const x = 71, z = 16.5; add(bohioGeo(2.6, rnd), x, z, Math.atan2(cx - x, cz - z)); circ(x, z, 2.7); occC(x, z, 2.6, gy(x, z) + 5.2); }   // the cacique's larger house
    add(hammockGeo(), 63.5, 15, 0.3); circ(62, 14.5, 0.2); circ(65, 15.5, 0.2);
    add(M([P(CYL(0.08, 0.1, 2.2, 6), '#6b4f30', -1.5, 1.1, -1.5), P(CYL(0.08, 0.1, 2.2, 6), '#6b4f30', 1.5, 1.1, -1.5), P(CYL(0.08, 0.1, 2.2, 6), '#6b4f30', -1.5, 1.1, 1.5), P(CYL(0.08, 0.1, 2.2, 6), '#6b4f30', 1.5, 1.1, 1.5), P(BOX(3.6, 0.15, 3.6), '#c8ad72', 0, 2.25, 0)]), 64, 4.5); for (const sx of [-1.5, 1.5]) for (const sz of [-1.5, 1.5]) circ(64 + sx, 4.5 + sz, 0.15);   // a shade ramada
    add(M([P(CYL(0.55, 0.55, 0.06, 14), '#6a5a4a', 0, 0.45, 0), P(CYL(0.12, 0.12, 0.4, 5), '#7a6a5a', 0.35, 0.2, 0.2), P(CYL(0.12, 0.12, 0.4, 5), '#7a6a5a', -0.35, 0.2, 0.2), P(CYL(0.12, 0.12, 0.4, 5), '#7a6a5a', 0, 0.2, -0.4)]), 64, 4.5);   // burén: clay griddle for cassava bread
    for (const [x, z, ry] of [[49.5, 12, 0.2], [48.8, 15, -0.1]]) { add(canoeGeo(), x, z, ry); box(x - 0.55, x + 0.55, z - 3.5, z + 3.5); }
    for (let i = 0; i < 14; i++) { const x = 74 + (i % 4) * 1.6, z = 1 - Math.floor(i / 4) * 1.6; add(M([P(new THREE.SphereGeometry(0.55, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), '#8a6a44'), P(new THREE.ConeGeometry(0.25, 0.7, 5), '#4f8a3a', 0, 0.7, 0)]), x, z); }   // conucos: mounds of cassava (yuca)
    labels.push([STATIONS.ss, '7 · San Salvador (Guanahaní)', 'landfall · October 12, 1492']); }

  // ===== 8 · Hispaniola: the north coast; the Santa María wrecked on the reef; the Niña at anchor; La Navidad, a small stockade
  { const { x: cx, z: cz } = STATIONS.hisp;
    fleet([['caravel', 'square', 40, -32, Math.PI / 2 + 0.3, 0.8, { furled: true }], ['nao', 'square', 42, -22, 0.9, 0.8, { wreck: true, furled: true, dy: -0.9 }]]);
    { const wr = statics.children[statics.children.length - 1]; wr.rotation.set(0.05, 0.9, 0.28); wr.name = 'wreck'; }
    const reef = []; for (let i = 0; i < 16; i++) { const a = rnd() * 6.28, r = 2 + rnd() * 6; reef.push(P(new THREE.IcosahedronGeometry(0.6 + rnd() * 0.7, 0), rnd() < 0.5 ? '#c99a7a' : '#b0806a', Math.cos(a) * r, 0, Math.sin(a) * r, 0, rnd() * 3, 0, 1, 0.5, 1, 0.2, rnd)); }
    add(M(reef), 42, -22, 0, 1, false, WATER_Y - 0.2);
    { const fx = 63, fz = -48, g = [];   // La Navidad: a palisade of timbers around a hut, a gap for a gate
      for (let i = 0; i < 40; i++) { const t = i / 40, side = Math.floor(t * 4), u = (t * 4) % 1, x = side === 0 ? -3 + u * 6 : side === 1 ? 3 : side === 2 ? 3 - u * 6 : -3, z = side === 0 ? -3 : side === 1 ? -3 + u * 6 : side === 2 ? 3 : 3 - u * 6; if (side === 3 && u > 0.35 && u < 0.65) continue; g.push(P(CYL(0.13, 0.15, 2.2 + rnd() * 0.3, 5), '#6b4f30', x, 1.1, z)); }
      g.push(P(BOX(2.6, 1.8, 2.2), '#8a6a44', 0.4, 0.9, 0.5)); for (const p of roofGeo(2.9, 2.4, 0.8, '#c8ad72')) { p.translate(0.4, 1.8, 0.5); g.push(p); }
      add(M(g), fx, fz); box(fx - 3.2, fx + 3.2, fz - 3.2, fz - 2.8); box(fx - 3.2, fx + 3.2, fz + 2.8, fz + 3.2); box(fx + 2.8, fx + 3.2, fz - 3.2, fz + 3.2); box(fx - 3.2, fx - 2.8, fz - 3.2, fz - 1); box(fx - 3.2, fx - 2.8, fz + 1, fz + 3.2); box(fx - 0.9, fx + 1.7, fz - 0.6, fz + 1.6); occBox(fx - 3.2, fx + 3.2, fz - 3.2, fz + 3.2, gy(fx, fz) + 2.6);
      const lab = labelSprite('La Navidad', 3.6, 'built from the wreck’s timbers'); lab.position.set(fx, gy(fx, fz) + 4.2, fz); scene.add(lab); }
    labels.push([STATIONS.hisp, '8 · Hispaniola', 'the wreck · the storm home (Trial)']); }

  // Columbian Exchange dock mats (the carry puzzle) on the Hispaniola beach
  const mats = MATS.map(m => {
    const g = [P(BOX(MAT_HALF * 2, 0.05, MAT_HALF * 2), { west: '#5a9a4a', east: '#b88a4a' }[m.bin] || '#a08a5a', 0, 0.03, 0)];
    for (let i = 0; i < 5; i++) g.push(P(BOX(MAT_HALF * 2, 0.055, 0.08), '#5a4126', 0, 0.035, -MAT_HALF + 0.25 + i * 0.48));
    const mesh = new THREE.Mesh(M(g), lam); mesh.position.set(m.x, gy(m.x, m.z), m.z); mesh.receiveShadow = true; mesh.userData.noMerge = true; scene.add(mesh);
    const glow = new THREE.Mesh(new THREE.RingGeometry(MAT_HALF * 1.05, MAT_HALF * 1.35, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.set(m.x, gy(m.x, m.z) + 0.09, m.z); glow.userData.noMerge = true; scene.add(glow);
    const lab = labelSprite(matLabels[m.bin] || m.bin, 3.6); lab.position.set(m.x, gy(m.x, m.z) + 1.7, m.z); scene.add(lab);
    return { ...m, mesh, glow, label: lab, bundles: 0 };
  });
  const bundleGeo = crateGeo('#b08a5c'); bundleGeo.scale(0.6, 0.6, 0.6);
  function dropBundle(bin) { const m = mats.find(q => q.bin === bin); if (!m) return; const k = m.bundles++; const b = new THREE.Mesh(bundleGeo, lam); b.position.set(m.x - 0.6 + (k % 3) * 0.6, gy(m.x, m.z) + 0.04, m.z - 0.5 + Math.floor(k / 3) * 0.6); b.userData.noMerge = true; b.castShadow = true; b.name = 'bundle'; scene.add(b); (m.objs || (m.objs = [])).push(b); }
  function clearBundles() { for (const m of mats) { (m.objs || []).forEach(o => scene.remove(o)); m.objs = []; m.bundles = 0; m.glow.material.opacity = 0; } }

  // ===== scatter: palms on the Caribbean islands, laurel trees and broom on La Gomera, pines and olives near Palos
  const near = (x, z, pad) => { for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return true; } return false; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const spots = (count, ok, minPath = 3, pad = 1.5) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 80) {
      const x = -125 + rnd() * 255, z = -110 + rnd() * 235, h = groundH(x, z);
      if (h < 0.15 || pathDist(x, z) < minPath || near(x, z, 2) || blocked(x, z, pad) || (x > PIER.x0 - 3 && x < PIER.x1 + 3 && z < 30 && z > 5) || !ok(x, z, h)) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name; scene.add(m); return m; };
  const trop = (x, z) => x > 25, gom = (x, z) => x > -60 && x <= 25 && z < 10, spain = (x, z) => z >= 10 && x < -10;
  const palms = spots(120, (x, z, h) => trop(x, z) && h < 9 && Math.hypot(x - 56, z + 41) > 15 && Math.hypot(x - 58, z - 9) > 12, 3, 1.2).map(([x, z]) => [x, z, 0.8 + rnd() * 0.45]);
  const laurels = spots(70, (x, z, h) => gom(x, z) && h < 9 && Math.hypot(x + 26, z + 30) > 10, 3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.5]);
  const pines = spots(60, (x, z, h) => spain(x, z) && (z > 62 || x < -66 || x > -26), 3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.5]);
  const pineGeo = M([P(CYL(0.15, 0.22, 3.6, 6), '#6e5038', 0, 1.8, 0), P(new THREE.SphereGeometry(1.6, 7, 4), '#3f6a3a', 0, 4.0, 0, 0, 0, 0, 1.2, 0.45, 1.2, 0.15, rnd)]);   // umbrella (stone) pines
  const laurelGeo = M([P(CYL(0.14, 0.2, 2.4, 6), '#5e4a34', 0, 1.2, 0), P(new THREE.IcosahedronGeometry(1.5, 1), '#2f6a36', 0, 3.0, 0, 0, 0, 0, 1, 1.1, 1, 0.2, rnd)]);
  inst(palmGeo(rnd), palms, true, 'palms'); inst(laurelGeo, laurels, true, 'laurels'); inst(pineGeo, pines, true, 'pines');
  for (const [x, z, s] of palms) circ(x, z, 0.25 * s + 0.1);
  for (const [x, z, s] of laurels) { circ(x, z, 0.25 * s + 0.15); occC(x, z, 1.5 * s, groundH(x, z) + 4.5 * s, groundH(x, z) + 1.8 * s); }
  for (const [x, z, s] of pines) { circ(x, z, 0.25 * s + 0.15); occC(x, z, 1.8 * s, groundH(x, z) + 4.8 * s, groundH(x, z) + 3.2 * s); }
  const tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#a8a060', 0.2, rnd), shrubGeo = vc(new THREE.IcosahedronGeometry(1, 0), '#6f8a46', 0.2, rnd);
  inst(tuftGeo, spots(500, (x, z, h) => h < 6, 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6]), false, 'tufts');
  inst(shrubGeo, spots(90, (x, z, h) => h < 8, 2.2, 0.6).map(([x, z]) => [x, z, 0.35 + rnd() * 0.3]), true, 'shrubs');
  // far scenery: the coast of Spain running off to the east and north, distant blue islands elsewhere
  { const g = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, R = 200 + rnd() * 40, x = Math.cos(a) * R, z = Math.sin(a) * R, spainSide = x < -40 && z > -40, h = spainSide ? 18 + rnd() * 16 : 6 + rnd() * 8;
      const cone = vc(new THREE.ConeGeometry(h * (spainSide ? 2.2 : 3), h, 7, 2), spainSide ? '#8e9a6a' : '#6f8fa8', 0.1, rnd); cone.translate(x, h / 2 - 3, z); g.push(cone); }
    const far = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); far.userData.noMerge = true; far.name = 'far'; scene.add(far); }
  // gulls wheeling over each harbor
  const gullGeo = M([P(BOX(0.9, 0.03, 0.18), '#f4f4f0', 0, 0, 0, 0, 0, 0.25), P(BOX(0.9, 0.03, 0.18), '#f4f4f0', 0, 0, 0, 0, 0, -0.25)]);
  const gulls = new THREE.InstancedMesh(gullGeo, lam, 12); gulls.userData.noMerge = true; gulls.name = 'gulls'; gulls.frustumCulled = false; scene.add(gulls);
  const gullAt = [[-34, 14], [-14, -2], [46, 8], [46, -34]].flatMap(([x, z]) => [0, 1, 2].map(k => ({ x, z, r: 5 + k * 2.5, w: 0.3 + k * 0.08, h: 7 + k * 1.5, p: k * 2 })));
  const _o = new THREE.Object3D();
  function stepGulls(t) { gullAt.forEach((g, i) => { const a = g.p + t * g.w; _o.position.set(g.x + Math.cos(a) * g.r, g.h + Math.sin(t * 1.7 + i) * 0.4, g.z + Math.sin(a) * g.r); _o.rotation.set(0, -a, Math.sin(t * 5 + i) * 0.25); _o.updateMatrix(); gulls.setMatrixAt(i, _o.matrix); }); gulls.instanceMatrix.needsUpdate = true; }
  stepGulls(0);
  // station name boards float high over each station (seen from afar, hidden up close)
  const regionLabels = labels.map(([s, t, sub]) => { const sp = labelSprite(t, 9, sub); sp.position.set(s.x, Math.max(0, groundH(s.x, s.z)) + 9.5, s.z); sp.name = 'region-label'; scene.add(sp); return { s, sp }; });

  const rings = ringDefs.map(d => makeRing(scene, d, walkY(d.x, d.z)));
  mergeAO.buildAO();
  mergeAO.mergeStatic(statics, { cell: 40 });

  let t = 0;
  function update(dt, hero) {
    t += dt; stepGulls(t);
    for (const r of rings) { r.beam.material.opacity = (r.state === 'locked' ? 0.22 : r.state === 'new' ? 0.5 : 0.35) + 0.12 * Math.sin(t * 2.4 + r.def.x); r.icon.position.y = 2.9 + 0.12 * Math.sin(t * 1.8 + r.def.z); }
    water.position.y = WATER_Y + Math.sin(t * 1.1) * 0.03;
    if (hero) for (const L of regionLabels) { const d = Math.hypot(hero.x - L.s.x, hero.z - L.s.z); L.sp.visible = d > L.s.r + 6; }
    for (const m of mats) if (m.glowOn) m.glow.material.opacity = 0.55 + 0.35 * Math.sin(t * 6); else if (m.glow.material.opacity) m.glow.material.opacity = 0;
  }
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen() {}, tracks: [], herds: {}, flames: [], water, fogColor: SKY_H, sky: scene.userData.sky, mats, dropBundle, clearBundles, regionLabels };
}
