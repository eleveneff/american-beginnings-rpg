// world/nations.js — Section 2 walkable level: "Native Nations of North America, about 1000 to 1500s".
// A council fire hub with a road to each culture region (map directions are real: north = +z, WEST = +x, so when she
// faces north at the start, west is on her left exactly as on a map):
//   1 council fire START (centre) → 2 Northwest Coast (north-west, by the sea) → 3 Great Plains (west) →
//   4 Southwest (south-west) → 5 Eastern Woodlands (north-east) → 6 Mississippian mound town (south-east) →
//   7 trade plaza (east, in front of the mound town) → 8 tree-ring meeting ground (east-north-east: the Trial).
// The regions are really hundreds of miles apart; the game sets them side by side and says so (help card, hub sign).
// Accuracy: cedar plank houses with carved house posts (not log cabins); dugout canoes; salmon racks; small hide tepees
// and a DOG travois on the Plains (no horses before the Spanish brought them); terraced adobe pueblos entered by
// ladders through roof hatches, maize grown by dry farming and with an irrigation ditch; a kiva seen from outside only;
// bark longhouses with rounded roofs inside a log palisade (a plain gap for a gate: no towers, no castle gate) and the
// Three Sisters; a flat-topped earthen platform mound with a thatched temple on top, a plaza, market shades and a
// chunkey yard. No metal tools, wheels, glass, horses, sheep or log cabins. Nothing here reads or writes the progress save.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

export const WATER_Y = -0.55, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// station centres (flattened ground). n = marker number on the banner.
export const STATIONS = {
  fire: { x: 0, z: 0, r: 11, label: 'Council fire', n: 1, dir: 'centre' },
  nw: { x: 38, z: 57, r: 9, label: 'Northwest Coast', n: 2, dir: 'north-west' },
  plains: { x: 52, z: -1, r: 12, label: 'Great Plains', n: 3, dir: 'west' },
  sw: { x: 37, z: -42, r: 11, label: 'Southwest', n: 4, dir: 'south-west' },
  ew: { x: -36, z: 44, r: 14, label: 'Eastern Woodlands', n: 5, dir: 'north-east' },
  mound: { x: -41, z: -40, r: 10, label: 'Mississippian mound town', n: 6, dir: 'south-east' },
  plaza: { x: -58, z: -12, r: 11, label: 'Trade plaza', n: 7, dir: 'east' },
  council: { x: -60, z: 17, r: 10, label: 'Tree-ring meeting ground', n: 8, dir: 'east' }
};
// roads (each a polyline). Every ring sits on or beside one (world-test checks this).
export const ROADS = [
  [[0, -9], [0, 0]],
  [[0, 0], [14, 20], [24, 38], [25, 55], [40, 58], [50, 57.5]],          // → Northwest Coast (round the house ends to the beach)
  [[0, 0], [24, -1], [46, -1], [52, -1]],                                // → Great Plains
  [[0, 0], [18, -20], [35, -40], [37, -42]], [[35, -40], [30, -49.5]],   // → Southwest (+ the kiva path)
  [[0, 0], [-20, 22], [-32.1, 36.7], [-31, 42], [-34, 48], [-44, 48]],    // → Eastern Woodlands, through the palisade gap
  [[-20, 22], [-25, 32]],                                                // → the Tree of Peace
  [[0, 0], [-20, -22], [-40, -38]], [[-40, -38], [-47, -39]],            // → mound town
  [[0, 0], [-28, -8], [-47, -11], [-62, -12]], [[-40, -38], [-50, -22], [-55, -20]],   // → trade plaza (+ from the mound)
  [[-58, -5], [-60, 7], [-60, 14]],                                      // plaza → meeting ground
  [[-60, 24], [-48, 27], [-35, 31], [-32.1, 36.7]]                       // meeting ground → woodlands gate
];
function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz; let t = L ? ((px - ax) * dx + (pz - az) * dz) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
export const PATH = ROADS[0];
export const BOUNDS = { x0: -80, x1: 86, z0: -66, z1: 70 };
// the Pacific: north of the beach on the north-west side only (x > ~14)
export const shoreZ = x => 64 + 2.2 * Math.sin(x * 0.09) + 60 * smooth(16, 6, x);
export function solid(x, z) { return z > shoreZ(x) - 1.6; }
// the Eastern Woodlands palisade (one ring of posts with a plain gap toward the council fire)
export const PALISADE = { x: -42, z: 48, r: 15, gapA: Math.atan2(36.7 - 48, -32.1 + 42), gapHalf: 0.15 };
// mound (truncated pyramid) + ramp footprint
export const MOUND = { x: -44, z: -54, hx: 9, hz: 7, h: 6, ramp: { x0: -45.5, x1: -42.5, z0: -47, z1: -41 } };
// plaza puzzle: six woven mats laid out like a map (north row: Northwest Coast, Arctic, Eastern Woodlands; south row:
// Southwest, Great Plains, Southeast; west is +x), and the trader's blanket of clue bundles between them
export const MATS = [{ bin: 'nw', x: -51, z: -8.5 }, { bin: 'arctic', x: -58, z: -8.5 }, { bin: 'ew', x: -65, z: -8.5 },
  { bin: 'sw', x: -51, z: -16 }, { bin: 'plains', x: -58, z: -16 }, { bin: 'se', x: -65, z: -16 }];
export const MAT_HALF = 1.2;
export const RING_AT = {
  'l0': [-4, -5.5], 'geomap': [2.6, 6.6], 'map': [-2.6, 6.6],
  'l1': [40, 57.4], 'l2': [46, 2.2], 'l3': [34, -42.5], 'kiva': [30.6, -48.6],
  'l4': [-34.5, 47.5], 'clanmother': [-31.2, 54.2], 'l6': [-25.5, 30.6],
  'l5': [-40, -38.6], 'moundinfo': [-47.5, -39.5],
  'clues': [-58, -12.25], 'market': [-58, -3.6], 'chunkey': [-52.5, -20.4],
  'timeline': [-60, 8.6], 'trial': [-60, 14.2]
};
export function groundH(x, z) {
  let h = 0.7 * Math.sin(x * 0.045 + 0.7) * Math.cos(z * 0.05) + 0.4 * Math.sin((x + z) * 0.033) + 0.22 * Math.sin(x * 0.12) * Math.sin(z * 0.1);
  h *= 1 - 0.55 * smooth(30, 10, Math.hypot(x - 60, z + 2));                // the Plains are flat and open
  h += 0.25;
  for (const k in STATIONS) { const s = STATIONS[k]; const w = smooth(s.r + 3, s.r * 0.5, Math.hypot(x - s.x, z - s.z)); h = h * (1 - 0.9 * w) + 0.2 * w; }
  { const w = smooth(19, 15, Math.hypot(x - PALISADE.x, z - PALISADE.z)); h = h * (1 - 0.9 * w) + 0.2 * w; }
  { const w = smooth(13, 9, Math.max(Math.abs(x - MOUND.x) - MOUND.hx, Math.abs(z - MOUND.z) - MOUND.hz, 0) + 9); h = h * (1 - 0.9 * w) + 0.2 * w; }
  const pd = pathDist(x, z); h = h * (0.5 + 0.5 * smooth(1.5, 5, pd)) + 0.1 * (1 - smooth(1.5, 5, pd));
  h = Math.max(h, -0.3);
  // beach slopes down into the sea
  const sz = shoreZ(x); h = h * (1 - smooth(sz - 9, sz - 3, z)) + smooth(sz - 9, sz - 3, z) * 0.12; h -= smooth(sz - 2.5, sz + 6, z) * 2.2;
  // hills beyond the edges (not on the sea side)
  const r = Math.max(0, BOUNDS.x0 - x, x - BOUNDS.x1, BOUNDS.z0 - z, z - BOUNDS.z1) * (1 - smooth(sz - 12, sz, z));
  if (r > 0) h += r * 0.5 + r * r * 0.03;
  return h;
}
// no ford / stones in this level (world.js shares the Beringia code paths)
export const FORD_ROWS = 0, STONES = [], FORD_RESPAWN = { x: 0, z: -8, yaw: 0 };
export function onStone() { return null; }
export function riverZ() { return -9999; }

// ---------------- geometry helpers (same as beringia.js) ----------------
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
function inkMat(width) {
  const m = new THREE.MeshBasicMaterial({ color: '#2a1a0c', side: THREE.BackSide, fog: true });
  m.onBeforeCompile = s => { s.uniforms.uW = { value: width }; s.vertexShader = 'uniform float uW;\n' + s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * uW;'); };
  m.customProgramCacheKey = () => 'abInk' + width; return m;
}
function herd(geo, n, mat, ink) {
  const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = true; m.userData.noMerge = true;
  const i = new THREE.InstancedMesh(geo, ink, n); i.userData.noMerge = true; i.userData.ink = true;
  return { mesh: m, ink: i, items: [] };
}
// ---------------- animals ----------------
function plainsBisonGeo() {   // modern Plains bison: big shaggy hump and head, SHORT curved horns (not the long Ice Age horns)
  const B = '#6a4a2c', D = '#3b2614', H = '#24190f';
  const g = [P(new THREE.SphereGeometry(1, 12, 9), D, 0, 1.35, 0.5, 0, 0, 0, 0.62, 0.66, 0.78, 0.12), P(new THREE.SphereGeometry(1, 12, 9), B, 0, 1.05, -0.45, 0, 0, 0, 0.46, 0.46, 0.85, 0.1),
    P(new THREE.SphereGeometry(0.36, 10, 8), D, 0, 0.82, 1.22, 0.5, 0, 0, 0.85, 0.95, 1.05), P(new THREE.SphereGeometry(0.3, 8, 6), D, 0, 0.55, 1.22, 0, 0, 0, 0.7, 1, 0.8),
    tube([[0.22, 1.0, 1.28], [0.38, 1.04, 1.3], [0.4, 1.2, 1.26]], 0.04, H, 5), tube([[-0.22, 1.0, 1.28], [-0.38, 1.04, 1.3], [-0.4, 1.2, 1.26]], 0.04, H, 5), tube([[0, 1.15, -1.2], [0, 0.65, -1.28]], 0.035, D)];
  for (const [x, z] of [[0.27, 0.5], [-0.27, 0.5], [0.24, -0.75], [-0.24, -0.75]]) g.push(P(CYL(0.1, 0.075, 0.95, 8), x * z > 0 ? B : D, x, 0.47, z));
  return M(g);
}
function dogTravoisGeo() {    // a dog harnessed to a small travois: two poles crossed over the shoulders, a frame carrying a hide bundle
  const T = '#8a6a44', W = '#6b4f30', g = [];
  g.push(P(new THREE.SphereGeometry(0.22, 9, 7), T, 0, 0.42, 0, 0, 0, 0, 0.75, 0.8, 1.5), P(new THREE.SphereGeometry(0.13, 8, 6), T, 0, 0.58, 0.36, 0, 0, 0, 0.9, 0.9, 1.1), P(new THREE.ConeGeometry(0.06, 0.16, 5), '#3a2a1a', 0, 0.56, 0.5, Math.PI / 2, 0, 0),
    P(new THREE.ConeGeometry(0.04, 0.1, 4), T, 0.07, 0.7, 0.34), P(new THREE.ConeGeometry(0.04, 0.1, 4), T, -0.07, 0.7, 0.34), tube([[0, 0.48, -0.3], [0, 0.6, -0.42]], 0.025, T, 4));
  for (const [x, z] of [[0.09, 0.18], [-0.09, 0.18], [0.09, -0.18], [-0.09, -0.18]]) g.push(P(CYL(0.035, 0.03, 0.32, 5), T, x, 0.16, z));
  for (const s of [-1, 1]) g.push(tube([[s * 0.08, 0.62, 0.25], [s * 0.18, 0.45, -0.4], [s * 0.42, 0.02, -1.7]], 0.025, W, 6));
  g.push(P(CYL(0.02, 0.02, 0.62, 4), W, 0, 0.27, -0.95, 0, 0, Math.PI / 2), P(CYL(0.02, 0.02, 0.78, 4), W, 0, 0.12, -1.35, 0, 0, Math.PI / 2));
  g.push(P(new THREE.SphereGeometry(0.22, 8, 6), '#b08a5c', 0, 0.3, -1.15, 0.3, 0, 0, 1.2, 0.6, 1.4, 0.12)); return M(g);
}
// ---------------- props ----------------
function fireRing(rnd) {
  const g = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.push(P(new THREE.DodecahedronGeometry(0.2, 0), '#7f7c76', Math.sin(a) * 0.7, 0.1, Math.cos(a) * 0.7, rnd(), rnd(), 0, 1, 0.75, 1, 0.2, rnd)); }
  for (let i = 0; i < 4; i++) g.push(P(CYL(0.06, 0.07, 0.9, 5), '#5a3f26', 0, 0.14, 0, Math.PI / 2, i * 0.8, 0));
  g.push(P(new THREE.CircleGeometry(0.6, 12), '#2a2420', 0, 0.03, 0, -Math.PI / 2)); return M(g);
}
function logGeo(len, r = 0.22) { return M([P(CYL(r, r, len, 8), '#6e5032', 0, r, 0, 0, 0, Math.PI / 2, 1, 1, 1, 0.1), P(new THREE.CircleGeometry(r * 0.9, 8), '#b8945e', len / 2 + 0.01, r, 0, 0, Math.PI / 2, 0), P(new THREE.CircleGeometry(r * 0.9, 8), '#b8945e', -len / 2 - 0.01, r, 0, 0, -Math.PI / 2, 0)]); }
function tepeeGeo(rnd, paint) {   // a dog-days hide tepee (smaller than later horse-era ones): poles, smoke flaps, painted band, door flap
  const g = [], hide = '#d8c49a';
  g.push(P(new THREE.ConeGeometry(1.9, 3.6, 14, 3, true), hide, 0, 1.8, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd));
  if (paint) { g.push(P(new THREE.CylinderGeometry(1.06, 1.36, 0.42, 14, 1, true), paint, 0, 1.15, 0, 0, 0, 0, 1.01, 1, 1.01)); g.push(P(new THREE.CylinderGeometry(0.44, 0.6, 0.2, 14, 1, true), '#2f4f6a', 0, 2.75, 0, 0, 0, 0, 1.02, 1, 1.02)); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3; g.push(P(CYL(0.03, 0.04, 4.6, 5), '#7a5a36', Math.sin(a) * 0.95, 2.25, Math.cos(a) * 0.95, Math.cos(a) * -0.46, 0, Math.sin(a) * 0.46)); }
  for (const s of [-1, 1]) g.push(P(new THREE.PlaneGeometry(0.5, 0.9), '#cbb688', s * 0.32, 3.1, 0.42, -0.35, s * 0.5, 0));
  g.push(P(new THREE.CircleGeometry(0.42, 10), '#3a2818', 0, 0.5, 1.68, -0.48, 0, 0, 1, 1.3, 1));
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.push(P(new THREE.DodecahedronGeometry(0.13, 0), '#8c8a84', Math.sin(a) * 1.95, 0.06, Math.cos(a) * 1.95, rnd(), rnd(), 0, 1, 0.7, 1, 0.2, rnd)); }
  return M(g);
}
function meatRackGeo(meat = '#7a2e22') {   // drying rack: forked poles, cross pole, strips of meat (Plains) or split salmon (coast)
  const W = '#6b4f30', g = [P(CYL(0.04, 0.05, 1.9, 5), W, -1.1, 0.95, 0, 0, 0, 0.06), P(CYL(0.04, 0.05, 1.9, 5), W, 1.1, 0.95, 0, 0, 0, -0.06), P(CYL(0.035, 0.035, 2.6, 5), W, 0, 1.82, 0, 0, 0, Math.PI / 2)];
  for (let i = 0; i < 6; i++) g.push(P(BOX(0.16, 0.6, 0.02), meat, -0.85 + i * 0.34, 1.5, 0.02, 0, 0, 0, 1, 1, 1, 0.15));
  return M(g);
}
function salmonRackGeo() {    // salmon split and hung to dry/smoke on a two-tier pole rack
  const W = '#5f4630', g = []; for (const x of [-1.4, 1.4]) for (const z of [-0.5, 0.5]) g.push(P(CYL(0.05, 0.06, 2.4, 5), W, x, 1.2, z));
  for (const y of [1.3, 2.1]) for (const z of [-0.5, 0.5]) g.push(P(CYL(0.035, 0.035, 3.0, 5), W, 0, y, z, 0, 0, Math.PI / 2));
  for (const y of [1.3, 2.1]) for (let i = 0; i < 7; i++) { const x = -1.15 + i * 0.38; g.push(P(new THREE.SphereGeometry(0.16, 6, 5), i % 3 ? '#d4573a' : '#e2774f', x, y - 0.3, 0, 0, 0, 0, 0.55, 1.7, 0.25)); }
  return M(g);
}
function canoeGeo() {         // cedar dugout canoe (one log, hollowed), high carved prow and stern
  const C = '#7c4a2a', g = [];
  g.push(P(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), C, 0, 0.55, 0, 0, 0, 0, 0.62, 0.55, 3.6, 0.06));
  g.push(P(new THREE.PlaneGeometry(1.0, 6.2), '#3a2416', 0, 0.42, 0, -Math.PI / 2, 0, 0));
  for (const s of [-1, 1]) g.push(P(BOX(0.12, 0.9, 0.9), C, 0, 0.8, s * 3.45, s * 0.6, 0, 0), P(BOX(0.13, 0.2, 0.5), '#1e1612', 0, 1.15, s * 3.7, s * 0.6, 0, 0), P(BOX(0.13, 0.15, 0.4), '#a8352a', 0, 0.85, s * 3.55, s * 0.6, 0, 0));
  for (const z of [-1.3, 0, 1.3]) g.push(P(BOX(1.05, 0.06, 0.22), '#8d5a36', 0, 0.48, z));
  g.push(P(CYL(0.03, 0.03, 1.5, 5), '#a0522d', 0.25, 0.52, 0.6, Math.PI / 2, 0.3, 0)); return M(g);
}
function postGeo(h, rnd, frontal) {   // carved cedar post: stacked crest figures (abstract here), painted black, red and blue-green
  const g = [], wood = '#8a5a3a', n = Math.round(h / 1.25);
  g.push(P(CYL(0.36, 0.42, h, 10), wood, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd));
  for (let i = 0; i < n; i++) { const y = 0.7 + i * (h - 1.0) / n, f = 0.41;
    g.push(P(new THREE.SphereGeometry(0.34, 10, 8), wood, 0, y + 0.25, f - 0.1, 0, 0, 0, 1.15, 0.85, 0.7, 0.06, rnd));
    for (const s of [-1, 1]) { g.push(P(new THREE.CircleGeometry(0.11, 10), '#f2ead8', s * 0.16, y + 0.32, f + 0.05)); g.push(P(new THREE.CircleGeometry(0.06, 8), '#141010', s * 0.16, y + 0.32, f + 0.06)); g.push(P(BOX(0.14, 0.06, 0.04), '#141010', s * 0.16, y + 0.47, f + 0.02)); }
    g.push(P(BOX(0.34, 0.07, 0.05), i % 2 ? '#a8352a' : '#2f6b6a', 0, y + 0.08, f + 0.02));
    for (const s of [-1, 1]) g.push(P(BOX(0.14, 0.5, 0.18), i % 2 ? '#2f6b6a' : '#7a4a2e', s * 0.36, y, f - 0.12)); }
  if (frontal) { for (const s of [-1, 1]) g.push(P(BOX(0.8, 0.12, 0.35), '#141010', s * 0.5, h - 0.25, 0.18, 0, 0, s * 0.35)); g.push(P(new THREE.ConeGeometry(0.12, 0.45, 6), '#e0a23a', 0, h - 0.4, 0.62, Math.PI / 2, 0, 0)); }
  return M(g);
}
function plankHouseGeo(rnd, W = 12, D = 9, H = 3.2) {   // cedar plank house: wide split planks, low gable roof (ridge front-to-back), round door, smoke hole
  const g = [], cs = ['#8c5c3c', '#9a6644', '#7e5236', '#a26d46'];
  const ridge = H + 1.5;
  for (let x = -W / 2 + 0.3; x < W / 2; x += 0.6) { const hh = H + (1 - Math.abs(x) / (W / 2)) * 1.5; for (const z of [-D / 2, D / 2]) g.push(P(BOX(0.58, hh, 0.16), cs[Math.floor(rnd() * 4)], x, hh / 2, z)); }
  for (let z = -D / 2 + 0.3; z < D / 2; z += 0.6) for (const x of [-W / 2, W / 2]) g.push(P(BOX(0.16, H, 0.58), cs[Math.floor(rnd() * 4)], x, H / 2, z));
  const slope = Math.atan2(1.5, W / 2), L = Math.hypot(1.5, W / 2) + 0.5;
  for (const s of [-1, 1]) for (let z = -D / 2 - 0.4; z < D / 2 + 0.4; z += 0.7) g.push(P(BOX(L, 0.1, 0.68), cs[Math.floor(rnd() * 4)], s * (W / 4), H + 0.8, z + 0.35, 0, 0, -s * slope, 1, 1, 1, 0.08, rnd));
  g.push(P(BOX(1.4, 0.3, 1.2), '#5a3a26', 0, ridge + 0.15, 0));
  g.push(P(new THREE.CircleGeometry(0.62, 14), '#1d140e', 0, 0.75, D / 2 + 0.1));                // round doorway in the front
  for (const s of [-1, 1]) g.push(P(BOX(1.6, 0.18, 0.06), '#141010', s * 2.4, H - 0.4, D / 2 + 0.1), P(BOX(1.0, 0.14, 0.06), '#a8352a', s * 2.4, H - 0.75, D / 2 + 0.1));   // painted front design (abstract)
  return M(g);
}
function coniferGeo(rnd) { return M([P(CYL(0.22, 0.32, 3.0, 6), '#5a3d28', 0, 1.5, 0), P(new THREE.ConeGeometry(2.0, 4.2, 8), '#2f5a3a', 0, 3.6, 0, 0, 0, 0, 1, 1, 1, 0.12, rnd), P(new THREE.ConeGeometry(1.6, 3.6, 8), '#356644', 0, 5.6, 0, 0, 0.3, 0, 1, 1, 1, 0.12, rnd), P(new THREE.ConeGeometry(1.1, 2.8, 8), '#3b7049', 0, 7.4, 0, 0, 0.6, 0, 1, 1, 1, 0.12, rnd)]); }
function decidGeo(rnd, c = '#4f8a3c') { return M([P(CYL(0.22, 0.3, 2.6, 6), '#5e452e', 0, 1.3, 0), P(new THREE.IcosahedronGeometry(1.7, 0), c, 0, 3.6, 0, 0, 0, 0, 1, 0.85, 1, 0.14, rnd), P(new THREE.IcosahedronGeometry(1.25, 0), c, 0.9, 3.0, 0.5, 0, 0, 0, 1, 0.9, 1, 0.14, rnd), P(new THREE.IcosahedronGeometry(1.2, 0), c, -0.7, 3.2, -0.6, 0, 0, 0, 1, 0.9, 1, 0.14, rnd)]); }
function whitePineGeo(rnd) {  // the Great White Pine (Tree of Peace): tall, with layered flat branch tiers
  const g = [P(CYL(0.4, 0.6, 12, 8), '#5a4232', 0, 6, 0)];
  for (let i = 0; i < 6; i++) { const y = 4.5 + i * 1.6, r = 3.4 - i * 0.45; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + i * 0.7; g.push(P(new THREE.SphereGeometry(1, 8, 5), '#2c5a3a', Math.cos(a) * r * 0.55, y, Math.sin(a) * r * 0.55, 0, a, 0, r * 0.6, 0.35, r * 0.4, 0.14, rnd)); } }
  return M(g);
}
function juniperGeo(rnd) { return M([P(CYL(0.12, 0.18, 0.8, 5), '#6a4e36', 0, 0.4, 0, 0, 0, 0.2), P(new THREE.DodecahedronGeometry(0.9, 0), '#5e7448', 0.1, 1.3, 0, 0, 0, 0, 1, 1.2, 1, 0.16, rnd), P(new THREE.DodecahedronGeometry(0.6, 0), '#677d4e', -0.4, 1.0, 0.3, 0, 0, 0, 1, 1, 1, 0.16, rnd)]); }
function cornGeo(rnd, h = 1.7) {    // a maize plant: stalk, long leaves, an ear and a tassel
  const g = [P(CYL(0.025, 0.035, h, 4), '#6f9a3a', 0, h / 2, 0)];
  for (let i = 0; i < 4; i++) { const a = i * 2.1 + rnd(), y = 0.4 + i * h * 0.18; g.push(P(BOX(0.06, 0.02, 0.6), '#7caa42', Math.cos(a) * 0.22, y + 0.1, Math.sin(a) * 0.22, 0.5, -a + Math.PI / 2, 0)); }
  g.push(P(CYL(0.05, 0.04, 0.24, 5), '#d8c060', 0.07, h * 0.55, 0, 0, 0, 0.4), P(new THREE.ConeGeometry(0.08, 0.25, 4), '#c9a94a', 0, h + 0.1, 0)); return M(g);
}
function threeSistersGeo(rnd) {   // one planting hill: corn stalks, a bean vine climbing them, squash leaves spread on the ground
  const g = [P(new THREE.SphereGeometry(0.55, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), '#6e5236', 0, 0, 0, 0, 0, 0, 1, 0.4, 1)];
  for (let i = 0; i < 3; i++) { const a = i * 2.1; const c = cornGeo(rnd, 1.6 + rnd() * 0.3); c.translate(Math.cos(a) * 0.18, 0.15, Math.sin(a) * 0.18); g.push(c); g.push(tube([[Math.cos(a) * 0.2, 0.2, Math.sin(a) * 0.2], [Math.cos(a + 1) * 0.2, 0.7, Math.sin(a + 1) * 0.2], [Math.cos(a + 2) * 0.18, 1.2, Math.sin(a + 2) * 0.18]], 0.018, '#3f7a2a', 6)); }
  for (let i = 0; i < 4; i++) { const a = i * 1.6 + rnd(); g.push(P(new THREE.CircleGeometry(0.3, 6), '#4c8a34', Math.cos(a) * 0.75, 0.12, Math.sin(a) * 0.75, -Math.PI / 2 + 0.2, 0, 0)); }
  g.push(P(new THREE.SphereGeometry(0.2, 8, 6), '#e0a03a', 0.7, 0.18, -0.3, 0, 0, 0, 1.2, 0.8, 1)); return M(g);
}
function ladderGeo(h, tilt = 0.18) { const W = '#7a5a3a', g = []; for (const s of [-0.28, 0.28]) g.push(P(CYL(0.045, 0.05, h + 0.9, 5), W, s, (h + 0.9) / 2, 0)); for (let y = 0.35; y < h; y += 0.4) g.push(P(CYL(0.03, 0.03, 0.6, 4), W, 0, y, 0, 0, 0, Math.PI / 2)); const L = M(g); L.applyMatrix4(new THREE.Matrix4().makeRotationX(-tilt)); return L; }
function thatchHutGeo(rnd, w = 4, d = 4) {   // Mississippian house: wattle-and-daub walls, steep thatched roof
  return M([P(BOX(w, 2.0, d), '#c4a47a', 0, 1.0, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd), P(new THREE.ConeGeometry(Math.max(w, d) * 0.82, 2.6, 4), '#b8994e', 0, 3.25, 0, 0, Math.PI / 4, 0, w / Math.max(w, d), 1, d / Math.max(w, d), 0.1, rnd), P(new THREE.PlaneGeometry(0.9, 1.4), '#2a1c12', 0, 0.7, d / 2 + 0.02)]);
}
function rampGeo() { const r = MOUND.ramp, len = Math.hypot(MOUND.h, (r.z1 - r.z0) + 3.5), ang = Math.atan2(MOUND.h, (r.z1 - r.z0) + 3.5); const g = [P(BOX(r.x1 - r.x0, 0.6, len), '#7d9a4a', 0, 0, 0, ang, 0, 0)]; for (let i = 1; i < 14; i++) g.push(P(CYL(0.12, 0.12, r.x1 - r.x0 - 0.2, 6), '#6e5032', 0, 0.32, -len / 2 + i * len / 14, ang, 0, Math.PI / 2)); return M(g); }
function stallGeo(rnd, goods) {    // pole-and-mat shade with trade goods laid out on mats
  const g = [], W = '#7a5a3a';
  for (const x of [-1.6, 1.6]) for (const z of [-1.2, 1.2]) g.push(P(CYL(0.06, 0.07, 2.6, 5), W, x, 1.3, z));
  g.push(P(BOX(3.8, 0.08, 3.0), '#c8b07a', 0, 2.62, 0, 0.05, 0, 0, 1, 1, 1, 0.1, rnd));
  for (let i = 0; i < 5; i++) g.push(P(BOX(3.8, 0.05, 0.06), '#9a7e4e', 0, 2.68, -1.2 + i * 0.6));
  g.push(P(BOX(2.8, 0.03, 1.8), '#b88a4a', 0, 0.02, 0.1));
  goods.forEach((k, i) => { const x = -1 + (i % 3), z = -0.4 + Math.floor(i / 3) * 0.9;
    if (k === 'shell') for (let j = 0; j < 3; j++) g.push(P(new THREE.ConeGeometry(0.1, 0.32, 7), '#f1e6d2', x - 0.15 + j * 0.15, 0.1, z, Math.PI / 2, j, 0));
    if (k === 'copper') g.push(P(BOX(0.36, 0.03, 0.26), '#c8743a', x, 0.05, z), P(new THREE.CircleGeometry(0.12, 10), '#d98a48', x + 0.2, 0.07, z + 0.2, -Math.PI / 2, 0, 0));
    if (k === 'obsidian') for (let j = 0; j < 3; j++) g.push(P(new THREE.OctahedronGeometry(0.1, 0), '#1a1a22', x - 0.15 + j * 0.15, 0.08, z, 0, j, 0, 0.6, 1, 0.4));
    if (k === 'turquoise') for (let j = 0; j < 4; j++) g.push(P(new THREE.DodecahedronGeometry(0.06, 0), '#2ec4b6', x - 0.15 + j * 0.1, 0.06, z + (j % 2) * 0.1));
    if (k === 'mica') g.push(P(BOX(0.3, 0.02, 0.3), '#d8d6cc', x, 0.04, z, 0, 0.4, 0));
    if (k === 'pot') g.push(P(new THREE.SphereGeometry(0.22, 10, 8), '#a0623a', x, 0.22, z, 0, 0, 0, 1, 0.9, 1), P(CYL(0.12, 0.15, 0.1, 10), '#a0623a', x, 0.44, z));
    if (k === 'corn') for (let j = 0; j < 3; j++) g.push(P(CYL(0.05, 0.04, 0.26, 6), ['#e0c050', '#c0402a', '#5a3a8a'][j], x - 0.12 + j * 0.12, 0.06, z, Math.PI / 2, 0, 0));
    if (k === 'basket') g.push(P(CYL(0.24, 0.18, 0.28, 10), '#b89458', x, 0.14, z));
  });
  return M(g);
}
// labels and icons (canvas sprites, same look as Beringia's)
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
// painted hide map (drawn in code, north up and WEST ON THE LEFT, like any map): region symbols in red ochre and black
function hideMapTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 400; const x = c.getContext('2d');
  x.fillStyle = '#e2cfa4'; x.beginPath(); x.moveTo(40, 30); x.quadraticCurveTo(256, 0, 472, 30); x.quadraticCurveTo(505, 200, 472, 370); x.quadraticCurveTo(256, 400, 40, 370); x.quadraticCurveTo(5, 200, 40, 30); x.fill();
  x.strokeStyle = '#7a3a22'; x.lineWidth = 5; x.stroke();
  const ink = '#2a1a0c', red = '#a8352a';
  x.lineWidth = 4; x.strokeStyle = ink; x.fillStyle = red;
  // Arctic (top): snow house dome
  x.beginPath(); x.arc(256, 90, 26, Math.PI, 0); x.closePath(); x.stroke();
  // Northwest Coast (top left): a salmon
  x.beginPath(); x.ellipse(110, 120, 34, 12, -0.2, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(140, 112); x.lineTo(162, 98); x.lineTo(160, 126); x.closePath(); x.fill();
  // Plains (middle left): a tepee
  x.beginPath(); x.moveTo(170, 240); x.lineTo(196, 180); x.lineTo(222, 240); x.closePath(); x.fill(); x.beginPath(); x.moveTo(190, 172); x.lineTo(206, 196); x.moveTo(202, 172); x.lineTo(186, 196); x.stroke();
  // Southwest (bottom left): stepped pueblo
  x.beginPath(); x.moveTo(80, 330); x.lineTo(80, 300); x.lineTo(110, 300); x.lineTo(110, 280); x.lineTo(140, 280); x.lineTo(140, 300); x.lineTo(160, 300); x.lineTo(160, 330); x.closePath(); x.fill();
  // Eastern Woodlands (top right): longhouse
  x.beginPath(); x.moveTo(340, 160); x.lineTo(340, 140); x.quadraticCurveTo(380, 105, 420, 140); x.lineTo(420, 160); x.closePath(); x.fill();
  // Southeast / Mississippian (bottom right): a platform mound with a temple
  x.beginPath(); x.moveTo(320, 330); x.lineTo(345, 290); x.lineTo(395, 290); x.lineTo(420, 330); x.closePath(); x.fill(); x.fillStyle = ink; x.fillRect(358, 270, 24, 20);
  // council fire at the centre + north arrow
  x.fillStyle = '#e07a2a'; x.beginPath(); x.arc(256, 220, 12, 0, Math.PI * 2); x.fill();
  x.fillStyle = ink; x.beginPath(); x.moveTo(470, 60); x.lineTo(458, 92); x.lineTo(482, 92); x.closePath(); x.fill(); x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.fillText('N', 470, 122);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// the compass painted on the ground around the council fire (labels drawn in code: N, E, S, W; west = +x)
function compassTex() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.strokeStyle = 'rgba(90,60,30,0.55)'; x.lineWidth = 10; x.beginPath(); x.arc(S / 2, S / 2, S * 0.4, 0, Math.PI * 2); x.stroke();
  // canvas → world on the ground plane (see the decal's rotation): canvas right = world +x (west), canvas down = world +z (north)
  const L = [['N', 0, 1], ['S', 0, -1], ['W', 1, 0], ['E', -1, 0]];
  x.font = 'bold 84px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (const [t, wx, wz] of L) { const px = S / 2 + wx * S * 0.4, py = S / 2 + wz * S * 0.4; x.save(); x.translate(px, py); x.rotate(Math.atan2(wx, -wz)); x.fillStyle = 'rgba(255,247,226,0.9)'; x.beginPath(); x.arc(0, 0, 52, 0, Math.PI * 2); x.fill(); x.fillStyle = t === 'N' ? '#a8352a' : '#2a1a0c'; x.fillText(t, 0, 4); x.restore(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------- build ----------------
export function buildNations({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(20261101);
  const scene = new THREE.Scene(); scene.name = 'nations';
  const SKY_TOP = new THREE.Color('#5ea6e6'), SKY_H = new THREE.Color('#e9eee8');
  scene.fog = new THREE.Fog(SKY_H, 80, 300);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; c.copy(SKY_H).lerp(SKY_TOP, Math.pow(Math.max(0, y), 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky;
    const gc = document.createElement('canvas'); gc.width = gc.height = 64; const x = gc.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,246,220,1)'); gr.addColorStop(0.25, 'rgba(255,238,204,0.6)'); gr.addColorStop(1, 'rgba(255,232,194,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), fog: false, depthWrite: false, transparent: true })); glow.scale.set(90, 90, 1); glow.position.set(170, 160, 120); glow.userData.noMerge = true; scene.add(glow); scene.userData.glow = glow; }
  const hemi = new THREE.HemisphereLight('#eef4ff', '#8f8a66', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d6', 2.1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  // terrain colour: each region blends into the next; worn earth roads; clay plaza; beach; planting fields
  const REG = { fire: '#8fae5a', nw: '#4e7a46', plains: '#c4b46c', sw: '#c9a06c', ew: '#5d8f45', mound: '#7ea452', plaza: '#a98b62', council: '#6a9a4e' };
  const REGC = {}; for (const k in REG) REGC[k] = new THREE.Color(REG[k]);
  const PATHC = new THREE.Color('#9b8160'), SAND = new THREE.Color('#d8c79a'), WET = new THREE.Color('#8f8a6c'), CLAY = new THREE.Color('#b8a078'), SOIL = new THREE.Color('#7a5a3a'), RED = new THREE.Color('#b8804e'), YARD = new THREE.Color('#d2bc96');
  const FIELDS = [{ x0: -24, x1: -14, z0: 44, z1: 58, c: SOIL }, { x0: 16, x1: 28, z0: -46, z1: -38, c: RED }, { x0: 44, x1: 56, z0: -38, z1: -30, c: SOIL }, { x0: -26, x1: -20, z0: -47, z1: -39, c: SOIL }];
  const inRect = (x, z, r, pad = 0) => x > r.x0 - pad && x < r.x1 + pad && z > r.z0 - pad && z < r.z1 + pad;
  const _t = new THREE.Color();
  const terrColor = (x, z, c) => {
    let wsum = 0; c.setRGB(0, 0, 0);
    for (const k in STATIONS) { const s = STATIONS[k], d = Math.hypot(x - s.x, z - s.z), w = Math.exp(-Math.pow(d / 26, 2)) + 1e-6; c.r += REGC[k].r * w; c.g += REGC[k].g * w; c.b += REGC[k].b * w; wsum += w; }
    c.multiplyScalar(1 / wsum); c.multiplyScalar(0.94 + 0.08 * Math.sin(x * 0.21) * Math.cos(z * 0.17));
    c.lerp(CLAY, smooth(13, 10, Math.hypot(x - STATIONS.plaza.x, z - STATIONS.plaza.z)) * 0.8);
    if (x > -67 && x < -49 && z > -23 && z < -19) c.lerp(YARD, 0.85);
    for (const f of FIELDS) if (inRect(x, z, f, 0.5)) c.lerp(f.c, 0.7);
    const pd = pathDist(x, z); c.lerp(PATHC, (1 - smooth(1.0, 2.6, pd)) * 0.7);
    const sz = shoreZ(x); c.lerp(SAND, smooth(sz - 10, sz - 6, z)); c.lerp(WET, smooth(sz - 2, sz + 1, z));
    return c; };
  const terrNormals = geo => { const p = geo.attributes.position, n = p.count, nrm = new Float32Array(n * 3), e = 0.5, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); v.set(groundH(x - e, z) - groundH(x + e, z), 2 * e, groundH(x, z - e) - groundH(x, z + e)).normalize(); nrm.set([v.x, v.y, v.z], i * 3); }
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); };
  const terrain = new THREE.Group(); terrain.name = 'terrain'; scene.add(terrain);
  for (let tx = 0; tx < 5; tx++) for (let tz = 0; tz < 5; tz++) { const W = 52, D = 48, geo = new THREE.PlaneGeometry(W, D, 26, 24); geo.rotateX(-Math.PI / 2); geo.translate(-125 + W * (tx + 0.5), 0, -116 + D * (tz + 0.5));
    const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, groundH(x, z)); terrColor(x, z, c); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); terrNormals(geo); geo.computeBoundingSphere();
    const t = new THREE.Mesh(geo, lam); t.receiveShadow = true; t.name = 'terrain-tile'; t.userData.noMerge = true; terrain.add(t); }
  // the Pacific (north of the Northwest Coast beach) + the irrigation ditch and spring
  const water = new THREE.Mesh(new THREE.PlaneGeometry(240, 200, 1, 1), new THREE.MeshLambertMaterial({ color: '#4f8fb0', transparent: true, opacity: 0.88, depthWrite: false }));
  water.geometry.rotateX(-Math.PI / 2); water.geometry.translate(14 + 120, 0, 52 + 100); water.position.y = WATER_Y; water.userData.noMerge = true; water.renderOrder = 2; water.name = 'sea'; scene.add(water);

  const statics = new THREE.Group(); statics.name = 'statics'; scene.add(statics);
  const add = (geo, x, z, ry = 0, s = 1, cast = true, y = null) => { const m = new THREE.Mesh(geo, lam); m.position.set(x, y == null ? groundH(x, z) : y, z); m.rotation.y = ry; m.scale.setScalar(s); m.castShadow = cast; m.receiveShadow = true; statics.add(m); return m; };
  const colliders = { out: [], cave: [] };
  const circ = (x, z, r) => { const c = { type: 'c', x, z, r }; colliders.out.push(c); return c; };
  const box = (x0, x1, z0, z1, tag) => { const b = { type: 'b', x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, tag }; colliders.out.push(b); return b; };
  const camOcc = [];
  const occBox = (x0, x1, z0, z1, y1) => camOcc.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, y0: -5, y1 });
  const occC = (x, z, r, y1, y0 = -5) => camOcc.push({ x, z, r, y0, y1 });
  const labels = [];
  const gy = (x, z) => groundH(x, z);

  // ===== 1 · council fire hub: fire, log benches, painted hide map (faces south, so west is on her left), ground compass
  add(fireRing(rnd), 0, 0, 0, 1.3, false); circ(0, 0, 1.0);
  for (const [x, z] of [[4.4, 1.6], [-4.4, 1.6], [4.4, -2.2], [-4.4, -2.2]]) { add(logGeo(2.2), x, z, Math.PI / 2); circ(x, z - 0.6, 0.38); circ(x, z + 0.6, 0.38); }
  { const g = [P(CYL(0.08, 0.1, 4.2, 6), '#6b4f30', -2.5, 2.1, 0), P(CYL(0.08, 0.1, 4.2, 6), '#6b4f30', 2.5, 2.1, 0), P(CYL(0.06, 0.06, 5.4, 6), '#6b4f30', 0, 3.75, 0, 0, 0, Math.PI / 2), P(CYL(0.06, 0.06, 5.4, 6), '#6b4f30', 0, 0.55, 0, 0, 0, Math.PI / 2)];
    for (let i = 0; i < 12; i++) { const t = i / 11; g.push(P(CYL(0.012, 0.012, 0.6, 3), '#d9c9a6', -2.2 + t * 4.4, 3.5, 0, 0, 0, 0.3)); }
    add(M(g), 0, 9.6, 0); box(-2.8, 2.8, 9.3, 9.9);
    const hm = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.0), new THREE.MeshLambertMaterial({ map: hideMapTex(), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide }));
    hm.position.set(0, gy(0, 9.6) + 2.15, 9.58); hm.rotation.y = Math.PI; hm.userData.noMerge = true; hm.castShadow = true; hm.name = 'hide-map'; scene.add(hm);
    occBox(-2.8, 2.8, 9.3, 9.9, gy(0, 9.6) + 3.9);
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 8.4), mergeAO.decal(new THREE.MeshBasicMaterial({ map: compassTex(), transparent: true, depthWrite: false }), -2, -4));
    cm.rotation.x = -Math.PI / 2; cm.position.set(0, gy(0, 0) + 0.04, 0); cm.userData.noMerge = true; cm.name = 'compass'; scene.add(cm); }

  // ===== 2 · Northwest Coast: two cedar plank houses facing the beach, carved house posts, dugout canoes, salmon racks
  const plank = plankHouseGeo(rnd);
  for (const [cx, cz] of [[34, 50], [48, 49]]) { add(plank, cx, cz); box(cx - 6.1, cx + 6.1, cz - 4.6, cz + 4.6); occBox(cx - 6.1, cx + 6.1, cz - 4.6, cz + 4.6, gy(cx, cz) + 4.9); mergeAO.addAO({ x: cx, z: cz }, 7.5, 1.0); }
  for (const [x, z, h, f] of [[34, 55.25, 7, true], [48, 54.25, 6, true], [28.6, 54.9, 3.6, false], [39.4, 54.9, 3.6, false]]) { add(postGeo(h, rnd, f), x, z); circ(x, z, 0.5); occC(x, z, 0.6, gy(x, z) + h); }
  const canoe = canoeGeo();
  for (const [x, z] of [[31, 60.4], [45, 60.5]]) { add(canoe, x, z, Math.PI / 2, 1, true, gy(x, z) - 0.05); box(x - 3.8, x + 3.8, z - 0.65, z + 0.65); }
  for (const [x, z] of [[37.5, 61.2], [56, 56.5]]) { add(salmonRackGeo(), x, z); box(x - 1.6, x + 1.6, z - 0.7, z + 0.7); occBox(x - 1.6, x + 1.6, z - 0.7, z + 0.7, gy(x, z) + 2.4); }
  labels.push([STATIONS.nw, '2 · Northwest Coast', 'cedar plank houses · salmon · canoes']);

  // ===== 3 · Great Plains: small hide tepees (dog days, before horses), a dog travois, a meat rack, bison grazing to the west
  for (const [x, z, p, ry] of [[55, 6, '#a8352a', 2.6], [61, -4, null, 1.4], [54, -10, '#2f4f6a', 0.4]]) { add(tepeeGeo(rnd, p), x, z, ry); circ(x, z, 2.0); occC(x, z, 2.0, gy(x, z) + 4.2); mergeAO.addAO({ x, z }, 2.6, 1.0); }
  add(fireRing(rnd), 57.5, -1.5, 0, 1, false); circ(57.5, -1.5, 0.9);
  add(dogTravoisGeo(), 48.5, 6.5, 2.5); circ(48.5, 6.5, 0.55); circ(49.6, 7.6, 0.45);
  add(meatRackGeo(), 59, 4.5, 0.4); box(57.8, 60.2, 3.9, 5.1);
  labels.push([STATIONS.plains, '3 · Great Plains', 'tepees · bison · dog travois']);

  // ===== 4 · Southwest: a terraced adobe pueblo (ladders and roof hatches, vigas, T-shaped doorways), a kiva (outside only), fields
  { const g = [], AD = ['#c8996a', '#d2a676', '#bf8f60'], lv = [[36, 52, -60, -50, 0, 2.6], [38, 52, -60, -54, 2.6, 2.6], [42, 50, -60, -57, 5.2, 2.6]];
    lv.forEach(([x0, x1, z0, z1, y0, h], i) => {
      for (let x = x0; x < x1 - 0.01; x += 4) g.push(P(BOX(Math.min(4, x1 - x), h, z1 - z0), AD[(i + Math.round(x)) % 3], x + Math.min(4, x1 - x) / 2, y0 + h / 2, (z0 + z1) / 2, 0, 0, 0, 1, 1, 1, 0.06, rnd));
      g.push(P(BOX(x1 - x0 + 0.1, 0.25, 0.25), '#b8875a', (x0 + x1) / 2, y0 + h + 0.12, z1 - 0.1));                                   // parapet
      for (let x = x0 + 0.6; x < x1; x += 1.1) g.push(P(CYL(0.08, 0.08, 0.6, 5), '#7a5a3a', x, y0 + h - 0.3, z1 + 0.2, Math.PI / 2, 0, 0));   // vigas (roof beams poking out)
      if (i > 0) for (const dx of [2.5, 6.5]) { const x = x0 + dx; if (x > x1 - 1) continue;                                         // T-shaped doorways
        g.push(P(new THREE.PlaneGeometry(0.9, 0.45), '#2a1c12', x, y0 + 1.45, z1 + 0.02), P(new THREE.PlaneGeometry(0.5, 0.95), '#2a1c12', x, y0 + 0.75, z1 + 0.02)); }
      else for (let x = x0 + 1.5; x < x1; x += 3.2) g.push(P(new THREE.PlaneGeometry(0.35, 0.3), '#2a1c12', x, y0 + 1.7, z1 + 0.02));        // small vents, no ground doors
    });
    for (const [x, z, y] of [[48.5, -52, 2.6], [39, -51.6, 2.6], [44, -55.6, 5.2], [49, -55.5, 5.2], [46, -58.5, 7.8]]) { g.push(P(BOX(1.0, 0.06, 1.0), '#2a1c12', x, y + 0.03, z)); for (const s of [-0.3, 0.3]) g.push(P(CYL(0.045, 0.05, 2.6, 5), '#7a5a3a', x + s, y + 1.0, z, -0.15, 0, 0)); }
    const L1 = ladderGeo(2.6), L2 = ladderGeo(2.6);
    for (const x of [40, 47.5]) g.push(L1.clone().translate(x, 0, -49.45));
    g.push(L2.clone().translate(45.5, 2.6, -53.45), L2.clone().translate(48, 5.2, -56.45));
    const pb = add(M(g), 0, 0, 0, 1, true, gy(44, -52) - 0.1); pb.name = 'pueblo';
    const yb = gy(44, -52) - 0.1; box(36, 52, -60, -50); occBox(36, 52, -60, -50, yb + 2.7); occBox(38, 52, -60, -54, yb + 5.3); occBox(42, 50, -60, -57, yb + 7.9);
    for (const x of [40, 47.5]) { circ(x, -49.3, 0.45); occC(x, -49.3, 0.5, yb + 3.4); }
    mergeAO.addAO({ x: 44, z: -55 }, 10, 1.0); }
  { const g = [P(CYL(3.2, 3.45, 0.7, 22), '#b08b62', 0, 0.3, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd), P(CYL(3.1, 3.1, 0.08, 22), '#a38058', 0, 0.68, 0), P(BOX(1.1, 0.06, 1.1), '#2a1c12', 0, 0.74, 0)];
    for (const s of [-0.32, 0.32]) g.push(P(CYL(0.05, 0.06, 4.4, 5), '#7a5a3a', s, 2.2, 0, -0.12, 0, 0));
    add(M(g), 28, -56); circ(28, -56, 3.5); occC(28, -56, 3.5, gy(28, -56) + 1.0); occC(28, -56, 0.5, gy(28, -56) + 4.4); }
  { const g = []; for (let x = 17.5; x < 28; x += 2.6) for (let z = -45; z < -38.5; z += 2.6) for (let k = 0; k < 3; k++) { const c = cornGeo(rnd, 1.1 + rnd() * 0.3); c.translate(x + Math.cos(k * 2.1) * 0.25, 0, z + Math.sin(k * 2.1) * 0.25); g.push(c); } add(M(g), 0, 0, 0, 1, true, gy(22, -42)); }     // dry-farmed corn: wide-spaced clumps, planted deep
  { const g = []; for (let x = 44.6; x < 56; x += 1.05) for (let z = -37.4; z < -30.4; z += 1.25) { const c = cornGeo(rnd, 1.6 + rnd() * 0.4); c.translate(x, 0, z); g.push(c); } add(M(g), 0, 0, 0, 1, true, gy(50, -34)); box(44, 56, -38, -30); }
  { const ditch = new THREE.Mesh(M([P(BOX(22, 0.04, 0.9), '#5d8fb0', 0, 0, 0), P(BOX(0.7, 0.04, 8), '#5d8fb0', -10.6, 0, -4), P(new THREE.CircleGeometry(1.8, 14), '#5d8fb0', 11.5, 0.01, 0, -Math.PI / 2, 0, 0)]), new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }));
    ditch.position.set(55, gy(55, -29) + 0.03, -29); ditch.userData.noMerge = true; ditch.receiveShadow = true; ditch.name = 'irrigation'; scene.add(ditch);
    add(M([P(BOX(23, 0.12, 0.25), '#8a6a44', 0, 0.06, 0.6), P(BOX(23, 0.12, 0.25), '#8a6a44', 0, 0.06, -0.6)]), 55, -29, 0, 1, false); }
  labels.push([STATIONS.sw, '4 · Southwest', 'adobe pueblo · maize · kiva']);

  // ===== 5 · Eastern Woodlands: a log palisade ring (a plain gap, no gatehouse), two bark longhouses, Three Sisters, the Great White Pine
  { const g = [], { x: cx, z: cz, r, gapA, gapHalf } = PALISADE, N = Math.round(2 * Math.PI * r / 0.36);
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; let d = Math.atan2(Math.sin(a - gapA), Math.cos(a - gapA)); if (Math.abs(d) < gapHalf) continue;
      const h = 3.4 + rnd() * 0.5, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, y = gy(x, z);
      g.push(P(CYL(0.15, 0.17, h, 6), rnd() < 0.5 ? '#6e5236' : '#5f4630', x, y + h / 2 - 0.2, z), P(new THREE.ConeGeometry(0.15, 0.4, 6), '#7a5a3a', x, y + h, z)); }
    for (const y of [1.2, 2.5]) { const pts = []; for (let i = 0; i <= 64; i++) { const a = gapA + gapHalf + i / 64 * (Math.PI * 2 - 2 * gapHalf); pts.push([cx + Math.cos(a) * (r - 0.2), y + 0.2, cz + Math.sin(a) * (r - 0.2)]); } g.push(tube(pts, 0.05, '#5a4232', 96)); }
    const pal = new THREE.Mesh(M(g), lam); pal.castShadow = true; pal.receiveShadow = true; pal.name = 'palisade'; statics.add(pal);
    colliders.out.push({ type: 'arc', x: cx, z: cz, r, w: 0.25, gapA, gapHalf });
    for (const s of [-1, 1]) { const a = gapA + s * gapHalf; circ(cx + Math.cos(a) * r, cz + Math.sin(a) * r, 0.3); }
    camOcc.push({ arc: true, x: cx, z: cz, r, w: 0.3, gapA, gapHalf, y0: -5, y1: gy(cx, cz) + 3.9 }); }
  { const longhouse = (L) => {     // bark longhouse: rounded roof over a bent-sapling frame, elm-bark sheets, doors at both ends, smoke holes
      const sh = new THREE.Shape(); sh.moveTo(-3, 0); sh.lineTo(-3, 1.6); for (let i = 1; i <= 12; i++) { const t = Math.PI - i / 12 * Math.PI; sh.lineTo(3 * Math.cos(t), 1.6 + 3.4 * Math.sin(t)); } sh.lineTo(3, 0); sh.lineTo(-3, 0);
      const ex = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false }); ex.translate(0, 0, -L / 2);
      const g = [vc(ex, '#7a6650', 0.1, rnd)];
      for (let i = 1; i < 12; i += 2) { const t = Math.PI - i / 12 * Math.PI, x = 3.04 * Math.cos(t), y = 1.6 + 3.44 * Math.sin(t); g.push(P(CYL(0.05, 0.05, L, 5), '#4e3e2e', x, y, 0, Math.PI / 2, 0, 0)); }
      for (let z = -L / 2 + 1; z < L / 2; z += 2) g.push(tube(Array.from({ length: 9 }, (_, k) => { const t = Math.PI - k / 8 * Math.PI; return [3.06 * Math.cos(t), 1.6 + 3.46 * Math.sin(t), z]; }).concat([]), 0.05, '#4e3e2e', 12), P(CYL(0.05, 0.05, 1.6, 4), '#4e3e2e', -3.06, 0.8, z), P(CYL(0.05, 0.05, 1.6, 4), '#4e3e2e', 3.06, 0.8, z));
      for (const z of [-L / 3, 0, L / 3]) g.push(P(BOX(0.9, 0.08, 0.9), '#2a1c12', 0, 5.02, z), P(BOX(1.1, 0.06, 0.7), '#6a5640', 0, 5.35, z + 0.6, 0.4, 0, 0));
      for (const s of [-1, 1]) g.push(P(new THREE.PlaneGeometry(1.2, 2.0), '#1d140e', 0, 1.0, s * (L / 2 + 0.02), 0, s < 0 ? Math.PI : 0, 0), P(new THREE.PlaneGeometry(1.4, 1.8), '#9a7a58', 0.75, 1.0, s * (L / 2 + 0.05), 0, s < 0 ? Math.PI : 0, 0.05));
      const m = M(g); m.rotateY(Math.PI / 2); return m; };
    for (const [cx, cz, L] of [[-42, 54, 18], [-42, 42, 16]]) { add(longhouse(L), cx, cz); box(cx - L / 2 - 0.1, cx + L / 2 + 0.1, cz - 3.1, cz + 3.1); occBox(cx - L / 2, cx + L / 2, cz - 3.1, cz + 3.1, gy(cx, cz) + 5.3); mergeAO.addAO({ x: cx, z: cz }, L * 0.55, 1.0); } }
  { const g = []; for (let x = -23; x < -14; x += 2.4) for (let z = 45; z < 58; z += 2.4) { const t = threeSistersGeo(rnd); t.translate(x, 0, z); g.push(t); } add(M(g), 0, 0, 0, 1, true, gy(-19, 51)); box(-24, -14, 44, 58); }
  add(whitePineGeo(rnd), -22.5, 34.5); circ(-22.5, 34.5, 0.7); occC(-22.5, 34.5, 3.4, gy(-22.5, 34.5) + 14, gy(-22.5, 34.5) + 3.6); occC(-22.5, 34.5, 0.7, gy(-22.5, 34.5) + 4);
  labels.push([STATIONS.ew, '5 · Eastern Woodlands', 'longhouses · palisade · Three Sisters']);

  // ===== 6 · Mississippian mound town: a flat-topped earthen platform mound with a log-step ramp and a thatched temple on top
  { const { x, z, hx, hz, h } = MOUND, y = gy(x, z) - 0.2;
    const fr = new THREE.CylinderGeometry(Math.SQRT2 * 0.5, Math.SQRT2, h, 4, 3); fr.rotateY(Math.PI / 4); fr.scale(hx, 1, hz);
    const mg = vc(fr, '#7d9a4a', 0.08, rnd); mg.translate(0, h / 2, 0);
    const temple = M([P(BOX(6, 2.6, 4.5), '#cdb48e', 0, h + 1.3, -0.5, 0, 0, 0, 1, 1, 1, 0.06, rnd), P(new THREE.ConeGeometry(4.6, 3.6, 4), '#b8994e', 0, h + 2.6 + 1.8, -0.5, 0, Math.PI / 4, 0, 1, 1, 0.78, 0.1, rnd), P(new THREE.PlaneGeometry(1.0, 1.7), '#2a1c12', 0, h + 0.85, 1.77), P(CYL(0.06, 0.06, 1.2, 5), '#5a4232', 0, h + 2.6 + 3.9, -0.5)]);
    const rp = rampGeo(); const r = MOUND.ramp; rp.translate(0, MOUND.h / 2 + 0.1, 0); rp.translate((r.x0 + r.x1) / 2 - x, 0, (r.z1 + (z + hz * 0.5)) / 2 - z + 0.3);
    const mm = add(M([mg, temple, rp]), x, z, 0, 1, true, y); mm.name = 'mound';
    box(x - hx, x + hx, z - hz, z + hz); box(r.x0, r.x1, r.z0, r.z1);
    occBox(x - hx, x + hx, z - hz, z + hz, y + h * 0.8); occBox(x - hx * 0.5, x + hx * 0.5, z - hz * 0.5, z + hz * 0.5, y + h + 6.5); occBox(r.x0, r.x1, r.z0, r.z1, y + 2.5);
    mergeAO.addAO({ x, z }, 11, 1.0); }
  for (const [x, z, ry] of [[-29, -50, 0.3], [-31, -60, -0.2], [-58, -46, 0.1], [-57, -58, 0.5]]) { add(thatchHutGeo(rnd), x, z, ry); circ(x, z, 2.6); occC(x, z, 2.7, gy(x, z) + 4.5); }
  { const g = []; for (let x = -25.5; x < -20; x += 1.1) for (let z = -46.5; z < -39.5; z += 1.2) { const c = cornGeo(rnd, 1.6 + rnd() * 0.4); c.translate(x, 0, z); g.push(c); } add(M(g), 0, 0, 0, 1, true, gy(-23, -43)); box(-26, -20, -47, -39); }
  labels.push([STATIONS.mound, '6 · Mound town', 'platform mound · temple · plaza']);

  // ===== 7 · trade plaza: pole-and-mat shades with goods traded over long distances, a chunkey yard, the six region mats
  for (const [x, z, goods] of [[-52, -2.5, ['shell', 'copper', 'obsidian', 'mica', 'pot', 'basket']], [-64, -2.5, ['turquoise', 'corn', 'pot', 'shell', 'basket', 'copper']]]) { add(stallGeo(rnd, goods), x, z); for (const dx of [-1.6, 1.6]) for (const dz of [-1.2, 1.2]) circ(x + dx, z + dz, 0.2); occBox(x - 2, x + 2, z - 1.6, z + 1.6, gy(x, z) + 2.8); }
  add(M([P(CYL(0.42, 0.42, 0.14, 16), '#cfc6b2', 0, 0.42, 0, Math.PI / 2, 0, 0), P(CYL(0.12, 0.12, 0.15, 12), '#9a9284', 0, 0.42, 0, Math.PI / 2, 0, 0), P(CYL(0.04, 0.05, 3.0, 5), '#6e5032', 0.7, 0.05, 0.5, 0, 0.2, Math.PI / 2), P(CYL(0.04, 0.05, 3.0, 5), '#6e5032', 0.9, 0.05, -0.4, 0, -0.15, Math.PI / 2)]), -58.5, -21, 0);
  const mats = MATS.map(m => {
    const g = [P(BOX(MAT_HALF * 2, 0.05, MAT_HALF * 2), { arctic: '#dfe6ec', nw: '#3f7a66', plains: '#c49a5a', sw: '#c47a4a', ew: '#6a8a3a', se: '#c49440' }[m.bin], 0, 0.03, 0)];
    for (let i = 0; i < 5; i++) g.push(P(BOX(MAT_HALF * 2, 0.055, 0.08), '#5a4126', 0, 0.035, -MAT_HALF + 0.25 + i * 0.48));
    const mesh = new THREE.Mesh(M(g), lam); mesh.position.set(m.x, gy(m.x, m.z), m.z); mesh.receiveShadow = true; mesh.userData.noMerge = true; scene.add(mesh);
    const glow = new THREE.Mesh(new THREE.RingGeometry(MAT_HALF * 1.05, MAT_HALF * 1.35, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.set(m.x, gy(m.x, m.z) + 0.09, m.z); glow.userData.noMerge = true; scene.add(glow);
    const lab = labelSprite(matLabels[m.bin] || m.bin, 3.2); lab.position.set(m.x, gy(m.x, m.z) + 1.7, m.z); scene.add(lab);
    return { ...m, mesh, glow, label: lab, bundles: 0 };
  });
  const bundleGeo = M([P(new THREE.SphereGeometry(0.2, 8, 6), '#b08a5c', 0, 0.18, 0, 0, 0, 0, 1.2, 0.8, 1, 0.12, rnd), P(CYL(0.02, 0.02, 0.5, 4), '#5a3a22', 0, 0.2, 0, 0, 0, Math.PI / 2)]);
  function dropBundle(bin) { const m = mats.find(q => q.bin === bin); if (!m) return; const k = m.bundles++; const b = new THREE.Mesh(bundleGeo, lam); b.position.set(m.x - 0.6 + (k % 3) * 0.6, gy(m.x, m.z) + 0.04, m.z - 0.5 + Math.floor(k / 3) * 0.6); b.userData.noMerge = true; b.castShadow = true; b.name = 'bundle'; scene.add(b); (m.objs || (m.objs = [])).push(b); }
  function clearBundles() { for (const m of mats) { (m.objs || []).forEach(o => scene.remove(o)); m.objs = []; m.bundles = 0; m.glow.material.opacity = 0; } }
  labels.push([STATIONS.plaza, '7 · Trade plaza', 'trade goods · chunkey · clue mats']);

  // ===== 8 · tree-ring meeting ground: a circle of big trees, log benches, a small fire (the Trial)
  { const { x: cx, z: cz } = STATIONS.council, dec = decidGeo(rnd, '#4a8a3c');
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.11, sa = Math.sin(a); if (Math.abs(sa) > 0.93) continue; const x = cx + Math.cos(a) * 9.5, z = cz + sa * 9.5; add(dec, x, z, a, 1.25); circ(x, z, 0.5); occC(x, z, 2.4, gy(x, z) + 6.5, gy(x, z) + 2.6); occC(x, z, 0.5, gy(x, z) + 3); }
    for (const deg of [0, 50, 130, 180, 230, 310]) { const a = deg * Math.PI / 180, x = cx + Math.cos(a) * 5, z = cz + Math.sin(a) * 5, ry = -a - Math.PI / 2; add(logGeo(2.0), x, z, ry); const tx = -Math.sin(a), tz = Math.cos(a); circ(x + tx * 0.55, z + tz * 0.55, 0.4); circ(x - tx * 0.55, z - tz * 0.55, 0.4); }
    add(fireRing(rnd), cx, cz + 2.2, 0, 1, false); circ(cx, cz + 2.2, 0.9); }
  labels.push([STATIONS.council, '8 · Meeting ground', 'the Trial']);

  // ===== scatter: trees, shrubs, grass (walk-around trees collide; the camera pulls in front of trunks and crowns)
  const regionOf = (x, z) => { let best = 'fire', bd = 1e9; for (const k in STATIONS) { const s = STATIONS[k], d = Math.hypot(x - s.x, z - s.z) - (k === 'plains' ? 8 : 0); if (d < bd) { bd = d; best = k; } } return best; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const spots = (count, ok, minPath, pad = 1.5, edge = 10) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 60) {
      const x = BOUNDS.x0 - edge + rnd() * (BOUNDS.x1 - BOUNDS.x0 + 2 * edge), z = BOUNDS.z0 - edge + rnd() * (BOUNDS.z1 - BOUNDS.z0 + 2 * edge);
      if (pathDist(x, z) < minPath || z > shoreZ(x) - 9) continue;
      let near = false; for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + 2) near = true; } if (near) continue;
      if (Math.hypot(x - PALISADE.x, z - PALISADE.z) < PALISADE.r + 2.5 || (Math.abs(x - MOUND.x) < MOUND.hx + 3 && Math.abs(z - MOUND.z) < MOUND.hz + 3)) continue;
      if (FIELDS.some(f => inRect(x, z, f, 1.5)) || blocked(x, z, pad) || (ok && !ok(x, z, regionOf(x, z)))) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s, sy], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.set(s, s * (sy || 1), s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name || 'scatter'; scene.add(m); return m; };
  const inB = (x, z) => x > BOUNDS.x0 && x < BOUNDS.x1 && z > BOUNDS.z0 && z < BOUNDS.z1;
  const conifers = spots(110, (x, z, r) => r === 'nw' || (r === 'ew' && rnd() < 0.35) || (!inB(x, z) && z > 20), 4).map(([x, z]) => [x, z, 0.85 + rnd() * 0.5, 1]);
  const decids = spots(95, (x, z, r) => r === 'ew' || r === 'council' || r === 'mound' || (r === 'fire' && rnd() < 0.4) || (r === 'plaza' && rnd() < 0.5), 4).map(([x, z]) => [x, z, 0.85 + rnd() * 0.45, 1]);
  const junip = spots(45, (x, z, r) => r === 'sw' || (r === 'plains' && rnd() < 0.15), 3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6, 1]);
  inst(coniferGeo(rnd), conifers, true, 'conifers'); inst(decidGeo(rnd), decids, true, 'trees'); inst(juniperGeo(rnd), junip, true, 'junipers');
  for (const [x, z, s] of conifers) if (inB(x, z)) { circ(x, z, 0.35 * s + 0.15); occC(x, z, 2.0 * s, groundH(x, z) + 9 * s, groundH(x, z) + 1.6 * s); occC(x, z, 0.35 * s, groundH(x, z) + 2 * s); }
  for (const [x, z, s] of decids) if (inB(x, z)) { circ(x, z, 0.3 * s + 0.15); occC(x, z, 1.9 * s, groundH(x, z) + 5.2 * s, groundH(x, z) + 2.0 * s); occC(x, z, 0.3 * s, groundH(x, z) + 2.4 * s); }
  for (const [x, z, s] of junip) if (inB(x, z)) circ(x, z, 0.6 * s);
  const shrubGeo = vc(new THREE.IcosahedronGeometry(1, 0), '#7a8a4a', 0.2, rnd), sageGeo = vc(new THREE.IcosahedronGeometry(1, 0), '#a3ad86', 0.15, rnd), tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#b8aa6a', 0.2, rnd), tallGeo = vc(new THREE.ConeGeometry(0.1, 0.8, 4), '#c8b46a', 0.2, rnd);
  inst(sageGeo, spots(70, (x, z, r) => r === 'sw', 2.2, 0.6).map(([x, z]) => [x, z, 0.35 + rnd() * 0.3, 0.6]), true, 'sage');
  inst(shrubGeo, spots(70, (x, z, r) => r !== 'sw' && r !== 'plains', 2.2, 0.6).map(([x, z]) => [x, z, 0.4 + rnd() * 0.4, 0.6]), true, 'shrubs');
  inst(tallGeo, spots(650, (x, z, r) => r === 'plains', 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.7, 1]), false, 'tallgrass');
  inst(tuftGeo, spots(450, (x, z, r) => r === 'fire' || r === 'council' || r === 'mound' || r === 'ew', 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6, 1]), false, 'tufts');
  // far scenery: hills to the east and north, mesas to the south-west, mountains far to the west
  { const g = []; for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, R = 190 + rnd() * 50, x = 5 + Math.cos(a) * R, z = Math.sin(a) * R; if (z > shoreZ(x) + 20 && x > 0) continue;
      const west = x > 60, sw = x > 30 && z < -40, h = west && !sw ? 50 + rnd() * 40 : sw ? 18 + rnd() * 14 : 16 + rnd() * 18;
      if (sw) { const m = vc(new THREE.CylinderGeometry(h * 1.2, h * 1.5, h, 7, 2), '#b9724a', 0.1, rnd); m.translate(x, h / 2 - 2, z); g.push(m); }
      else { const cone = vc(new THREE.ConeGeometry(h * (west ? 0.9 : 1.8), h, 7, 3), west ? '#7d8693' : '#5f7f55', 0.1, rnd); if (west) { const pos = cone.attributes.position, col = cone.attributes.color; for (let k = 0; k < pos.count; k++) if (pos.getY(k) > h * 0.2) col.setXYZ(k, 0.93, 0.95, 0.98); } cone.translate(x, h / 2 - 2, z); g.push(cone); } }
    const mts = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); mts.userData.noMerge = true; mts.name = 'far'; scene.add(mts); }

  // bison herd (Plains), with ink outlines like Beringia's animals
  const ink = inkMat(0.05);
  const herds = { bison: herd(plainsBisonGeo(), 10, lam, ink) };
  for (let i = 0; i < 10; i++) { const a = rnd() * 6.28, r = 8 * (0.4 + rnd() * 0.6); herds.bison.items.push({ cx: 73, cz: -4, a, r, w: 0.06 * (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.6), s: 0.95 + rnd() * 0.15, ph: rnd() * 6 }); }
  { const h = herds.bison; h.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(73, groundH(73, -4) + 1.5, -4), 12); h.ink.boundingSphere = h.mesh.boundingSphere; scene.add(h.mesh); scene.add(h.ink); }
  const _o = new THREE.Object3D();
  function stepHerds(t) { for (const k in herds) { const h = herds[k]; h.items.forEach((it, i) => { const a = it.a + t * it.w, x = it.cx + Math.cos(a) * it.r, z = it.cz + Math.sin(a) * it.r;
      _o.position.set(x, groundH(x, z), z); _o.rotation.set(0, Math.atan2(-Math.sin(a) * Math.sign(it.w), Math.cos(a) * Math.sign(it.w)), 0); _o.scale.setScalar(it.s); _o.updateMatrix(); it.x = x; it.z = z; h.mesh.setMatrixAt(i, _o.matrix); h.ink.setMatrixAt(i, _o.matrix); });
    h.mesh.instanceMatrix.needsUpdate = true; h.ink.instanceMatrix.needsUpdate = true; } }
  stepHerds(0);
  const flameMat = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const flames = []; for (const [x, z, s] of [[0, 0, 1.3], [57.5, -1.5, 1], [STATIONS.council.x, STATIONS.council.z + 2.2, 1]]) { const f = new THREE.Group(); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.22 - i * 0.04, 0.8 - i * 0.15, 7), flameMat); c.position.set((i - 1) * 0.12, 0.45, (i % 2) * 0.1); f.add(c); } f.scale.setScalar(s); f.position.set(x, groundH(x, z), z); f.userData.noMerge = true; scene.add(f); flames.push(f); }
  // region name boards float high over each station (seen from afar, hidden up close)
  const regionLabels = labels.map(([s, t, sub]) => { const sp = labelSprite(t, 9, sub); sp.position.set(s.x, groundH(s.x, s.z) + 9.5, s.z); sp.name = 'region-label'; scene.add(sp); return { s, sp }; });

  const rings = ringDefs.map(d => makeRing(scene, d, groundH(d.x, d.z)));
  mergeAO.buildAO();
  mergeAO.mergeStatic(statics, { cell: 40 });

  let t = 0;
  function update(dt, hero) {
    t += dt; stepHerds(t);
    for (const f of flames) f.children.forEach((c, i) => { c.scale.y = 0.85 + 0.25 * Math.sin(t * (9 + i * 3) + i); c.scale.x = c.scale.z = 0.9 + 0.12 * Math.sin(t * 7 + i * 2); });
    for (const r of rings) { r.beam.material.opacity = (r.state === 'locked' ? 0.22 : r.state === 'new' ? 0.5 : 0.35) + 0.12 * Math.sin(t * 2.4 + r.def.x); r.icon.position.y = 2.9 + 0.12 * Math.sin(t * 1.8 + r.def.z); }
    water.position.y = WATER_Y + Math.sin(t * 1.1) * 0.03;
    if (hero) for (const L of regionLabels) { const d = Math.hypot(hero.x - L.s.x, hero.z - L.s.z); L.sp.visible = d > L.s.r + 6; }
    for (const m of mats) if (m.glowOn) m.glow.material.opacity = 0.55 + 0.35 * Math.sin(t * 6); else if (m.glow.material.opacity) m.glow.material.opacity = 0;
  }
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen() {}, tracks: [], herds, flames, water, fogColor: SKY_H, sky: scene.userData.sky, mats, dropBundle, clearBundles, regionLabels };
}
