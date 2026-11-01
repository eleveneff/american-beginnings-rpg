// world/empires.js — Section 4 walkable level: "Three Empires c. 1610" (Spain, France and the Netherlands in North America).
// St. Augustine, Florida (south-east, 1565) → Santa Fe, New Mexico (far west, about 1610) → a beaver pond (the fur trade)
// → the St. Lawrence River and Quebec (north, 1608, by canoe) → New Amsterdam on Manhattan (east, 1624–26) → the palisade
// gate (Trial). Map directions are real: north = +z, WEST = +x. Distances are shrunk enormously; the help card says so.
// Accuracy: St. Augustine's first forts were wooden (the stone Castillo de San Marcos came 1672–95); Santa Fe's Palace of
// the Governors is adobe with a wooden portal, in juniper and piñon country with mesas (no saguaro cactus there); Quebec
// is named for the narrows ("Kébec", where the river narrows) and Champlain's Habitation stood at the foot of the cliff;
// New Amsterdam had a windmill and an earthen Fort Amsterdam (begun 1625). Spain flies the Cross of Burgundy, France a
// white royal flag with gold lilies, the Dutch the orange-white-blue Prince's Flag. Nothing here reads or writes the save.
import * as THREE from 'three';
import { vc, P, M, rng, tube, CYL, BOX, tris, roofGeo, houseGeo, makeRing, barrelGeo, crateGeo, palmGeo, bohioGeo, labelSprite, setRingState, RING_COL } from './voyage.js';
export { labelSprite, setRingState, RING_COL };

export const WATER_Y = -0.4, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const STATIONS = {
  staug: { x: -56, z: -48, r: 9, label: 'St. Augustine, 1565', n: 1, dir: 'start' },
  santafe: { x: 60, z: -20, r: 9, label: 'Santa Fe, about 1610', n: 2, dir: 'far west' },
  beaver: { x: 18, z: 13, r: 7, label: 'Beaver pond', n: 3, dir: 'north-west' },
  landing: { x: -12, z: 37, r: 5, label: 'Canoe landing', n: 4, dir: 'north, on the St. Lawrence' },
  quebec: { x: -12, z: 57.5, r: 6, label: 'Quebec, 1608', n: 4, dir: 'across the river, by canoe' },
  market: { x: -58, z: 16, r: 7, label: 'New Amsterdam market', n: 5, dir: 'east, on Manhattan' },
  fort: { x: -58, z: 4.5, r: 5, label: 'Fort Amsterdam', n: 6, dir: 'the tip of Manhattan' },
  gate: { x: -24, z: -18, r: 7, label: 'Palisade gate', n: 7, dir: 'south of Manhattan (Trial)' }
};
export const ROADS = [
  [[-56, -56], [-56, -48], [-40, -40], [-20, -36], [5, -34], [30, -28], [60, -20]],
  [[60, -20], [42, -4], [18, 13]],
  [[18, 13], [2, 27], [-12, 37]],
  [[-12, 37], [-30, 37], [-46, 37], [-56, 30], [-58, 16], [-58, 4.5]],
  [[-56, 30], [-40, 31], [-32, 12], [-24, -14], [-24, -22], [-36, -38], [-40, -40]],
  [[-12, 55], [-12, 59]]
];
export function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
export const PATH = ROADS[0];
export const BOUNDS = { x0: -68, x1: 92, z0: -72, z1: 63 };
// rivers and coasts. The St. Lawrence runs east to the sea and narrows at Quebec; the Hudson runs south past Manhattan
// into the harbor; the Atlantic is the whole east edge.
export const riverZ = x => 48 + 0.03 * x;
const riverHW = x => 5.5 + 0.05 * Math.max(0, -x - 20) - 1.5 * Math.exp(-(((x + 12) / 14) ** 2));
const HUD_X = -42, coastX = z => -72 + 2.5 * Math.sin(z * 0.07);
const MESAS = [[78, -46, 11, 8], [82, 4, 9, 12], [50, -52, 8, 6], [88, -24, 7, 9], [70, 22, 8, 7]];
function rawH(x, z) {
  let h = 0.55 + 0.3 * Math.sin(x * 0.09) * Math.cos(z * 0.08) + 1.6 * smooth(28, 60, x);
  h += 1.2 * smooth(-10, 30, z) * smooth(-30, 10, x) * (0.5 + 0.5 * Math.sin(x * 0.13 + z * 0.05));   // rolling woods
  for (const [mx, mz, rx, rz] of MESAS) { const e = Math.hypot((x - mx) / rx, (z - mz) / rz) + 0.05 * Math.sin(x * 0.7 + z); h += 8 * smooth(1.05, 0.82, e); }
  // Quebec: Cap Diamant, the cliff above the narrows (not walkable: a collider runs along its foot)
  if (z > 60) h += (4 + 10 * smooth(18, 6, Math.abs(x + 12))) * smooth(63.5, 69, z);
  let w = smooth(coastX(z) + 6, coastX(z) - 2, x);                                             // Atlantic
  w = Math.max(w, smooth(-37, -41, x) * smooth(-19, -15, z) * smooth(-3.5, -7, z));            // the harbor (Upper Bay)
  const hw = 3.2 * smooth(34, 24, z); if (z > -9) w = Math.max(w, smooth(hw + 1.6, hw - 0.4, Math.abs(x - HUD_X)) * (hw > 0.3 ? 1 : 0));   // Hudson
  const rw = riverHW(x); w = Math.max(w, smooth(rw + 1.6, rw - 0.6, Math.abs(z - riverZ(x))));   // St. Lawrence
  const pond = smooth(6.2, 4.2, Math.hypot(x - 23, z - 20));
  h = h * (1 - w) + -3.0 * w;
  h = h * (1 - pond) + -1.2 * pond;
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
export const STONES = [], FORD_ROWS = 0, FORD_RESPAWN = { x: -12, z: 38, yaw: Math.PI };
export function onStone() { return null; }
export function walkY(x, z) { return groundH(x, z); }
export function solid(x, z) { return groundH(x, z) < WATER_Y + 0.25; }
// the canoe crossing of the St. Lawrence (the "Paddle across" ring teleports here)
export const HARBORS = {
  south: { x: -12, z: 39.5, yaw: Math.PI, label: 'the south bank' },
  north: { x: -12, z: 55.2, yaw: 0, label: 'Quebec, the north bank' }
};
// three empire mats in the New Amsterdam market for the "What did each empire want?" carry puzzle (bins from s4-goals),
// laid out like the map: Spain to the west (+x), France to the north, the Dutch to the east.
export const MATS = [{ bin: 'spain', x: -52.5, z: 19.5 }, { bin: 'france', x: -58, z: 22.5 }, { bin: 'dutch', x: -63.5, z: 19.5 }];
export const MAT_HALF = 1.2;
export const RING_AT = {
  l0: [-55, -51.5], l1: [-50.5, -46.5], map: [-58.5, -43.5], fort: [-59.8, -48.5], timucua: [-49.5, -41.5],
  l2: [56.5, -21.5], palace: [60.5, -20.6], adobe: [64.5, -23],
  beaver: [16, 15.5], furtrade: [20.5, 11],
  'canoe-south': [-12, 41],
  l3: [-7, 57], champlain: [-12, 57.8], l6: [-17, 57], wendat: [-21.5, 57.2], 'canoe-north': [-3, 55.5],
  market: [-55, 13.2], windmill: [-51.5, 23], goals: [-61, 13.2],
  l4: [-54.5, 6.2], geomap: [-58, 7.5], manhattan: [-61.5, 6.2],
  l5: [-28.5, -19], timeline: [-19.5, -19], trial: [-24, -14.6]
};

// ---------------- props ----------------
function adobeGeo(w, d, h, rnd) {   // flat-roofed adobe with protruding vigas (roof beams) and a low parapet
  const g = [P(BOX(w, h, d), '#c79a6a', 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd), P(BOX(w + 0.1, 0.35, d + 0.1), '#b98a5c', 0, h + 0.1, 0)];
  for (let i = 0; i < Math.floor(w / 1.1); i++) g.push(P(CYL(0.09, 0.09, d + 0.9, 5), '#6b4a2c', -w / 2 + 0.55 + i * 1.1, h - 0.35, 0, Math.PI / 2, 0, 0));
  g.push(P(BOX(0.9, 1.8, 0.08), '#5a3a22', 0, 0.9, d / 2 + 0.03), P(BOX(0.55, 0.55, 0.08), '#3a2a1a', w * 0.3, h * 0.55, d / 2 + 0.03), P(BOX(0.55, 0.55, 0.08), '#3a2a1a', -w * 0.3, h * 0.55, d / 2 + 0.03));
  return M(g);
}
function dutchHouseGeo(w, d, h, col, rnd) {   // brick house with a stepped gable facing the street (local +z)
  const g = [P(BOX(w, h, d), col, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
  for (const p of roofGeo(d, w, 1.9, '#5a4a44')) { p.rotateY(Math.PI / 2); p.translate(0, h, 0); g.push(p); }
  for (let s = 0; s < 4; s++) { const sw = w * (1 - s * 0.24); g.push(P(BOX(sw, 0.55, 0.3), col, 0, h + 0.27 + s * 0.52, d / 2 + 0.02, 0, 0, 0, 1, 1, 1, 0.04, rnd)); }
  g.push(P(BOX(0.8, 1.6, 0.08), '#3e5a3a', 0, 0.8, d / 2 + 0.19), P(BOX(0.6, 0.7, 0.08), '#f0ead8', -w * 0.27, h * 0.62, d / 2 + 0.19), P(BOX(0.6, 0.7, 0.08), '#f0ead8', w * 0.27, h * 0.62, d / 2 + 0.19));
  return M(g);
}
function windmillGeo(rnd) {   // a wooden smock mill: eight-sided tower, cap; the sails are a separate spinning mesh
  return M([P(CYL(1.5, 2.1, 6, 8), '#8a6e52', 0, 3, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd), P(CYL(2.3, 2.3, 0.3, 8), '#6b4f36', 0, 1.6, 0), P(new THREE.ConeGeometry(1.7, 1.8, 8), '#5a4a3a', 0, 6.9, 0), P(BOX(0.6, 1.4, 0.1), '#3a2a1a', 0, 0.7, 2.0)]);
}
function canoeBirchGeo() {   // an Algonquian / Wendat birch-bark canoe: light bark, dark gum seams, raised ends
  const g = [P(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#e4d6b0', 0, 0.42, 0, Math.PI, 0, 0, 0.55, 0.38, 2.6)];
  for (const s of [-1, 1]) g.push(P(BOX(0.12, 0.55, 0.3), '#d8c89e', 0, 0.55, s * 2.5, s * 0.5, 0, 0), P(BOX(0.04, 0.4, 0.04), '#3a2a1a', 0, 0.3, s * 1.2));
  g.push(P(BOX(1.0, 0.05, 0.12), '#8a6038', 0, 0.38, 0.6), P(BOX(1.0, 0.05, 0.12), '#8a6038', 0, 0.38, -0.6));
  return M(g);
}
function flagGeo(kind) {   // a flag on a pole; the cloth hangs toward +x
  const g = [P(CYL(0.07, 0.09, 7, 6), '#6b4f36', 0, 3.5, 0)], fy = 6.4, fx = 1.0;
  if (kind === 'spain') { g.push(P(BOX(1.9, 1.2, 0.04), '#f2eee2', fx, fy, 0)); for (const r of [-0.6, 0.6]) g.push(P(BOX(2.0, 0.17, 0.06), '#b0302a', fx, fy, 0, 0, 0, r)); }
  else if (kind === 'france') { g.push(P(BOX(1.9, 1.2, 0.04), '#f4f1e6', fx, fy, 0)); for (const [a, b] of [[-0.45, 0.25], [0.45, 0.25], [0, -0.25]]) g.push(P(BOX(0.22, 0.28, 0.07), '#d4a62a', fx + a, fy + b, 0)); }
  else { g.push(P(BOX(1.9, 0.4, 0.04), '#e07a1f', fx, fy + 0.4, 0), P(BOX(1.9, 0.4, 0.04), '#f4f1e6', fx, fy, 0), P(BOX(1.9, 0.4, 0.04), '#2a4f8f', fx, fy - 0.4, 0)); }
  return M(g);
}
function palisadeGeo(len, h = 2.8, rnd) {   // a wall of upright pointed logs along local x
  const g = []; const n = Math.round(len / 0.42);
  for (let i = 0; i < n; i++) { const hh = h * (0.92 + rnd() * 0.12), x = -len / 2 + 0.21 + i * 0.42; g.push(P(CYL(0.2, 0.22, hh, 5), '#7a5a3a', x, hh / 2, 0, 0, 0, 0, 1, 1, 1, 0.1, rnd), P(new THREE.ConeGeometry(0.2, 0.45, 5), '#6a4a2e', x, hh + 0.22, 0)); }
  g.push(P(BOX(len, 0.18, 0.12), '#5a3d24', 0, h * 0.7, 0.22)); return M(g);
}
function longhouseGeo(len, rnd) {   // a bark-covered longhouse, rounded roof (Wendat and Algonquin camps came to trade at Quebec)
  return M([P(CYL(1.8, 1.8, len, 10, 1, false, 0, Math.PI), '#9a8466', 0, 0.9, 0, Math.PI / 2, 0, Math.PI / 2, 1, 1, 1, 0.08, rnd), P(BOX(3.6, 0.9, len), '#8a7458', 0, 0.45, 0), P(BOX(0.9, 1.4, 0.08), '#3a2a1a', 0, 0.7, len / 2 + 0.03)]);
}

// ---------------- build ----------------
export function buildEmpires({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(20261610);
  const scene = new THREE.Scene(); scene.name = 'empires';
  const SKY_TOP = new THREE.Color('#4a96dc'), SKY_H = new THREE.Color('#e4ecef');
  scene.fog = new THREE.Fog(SKY_H, 90, 300);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), LOW = new THREE.Color('#9fb7a8');
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; if (y < 0) c.copy(SKY_H).lerp(LOW, Math.min(1, -y * 6)); else c.copy(SKY_H).lerp(SKY_TOP, Math.pow(y, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky; }
  const hemi = new THREE.HemisphereLight('#eef4ff', '#7f9a7a', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d6', 2.1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  // terrain colour: Florida sand and green, red-tan high desert in the west, northern woods, a sandy Manhattan shore
  const C = k => new THREE.Color(k);
  const FL = C('#7fa24e'), DES = C('#c09a6a'), DESG = C('#9a9a5a'), WOOD = C('#5a8a42'), NORTH = C('#4f7a44'), SAND = C('#e2d3a2'), PATHC = C('#a8906a'), SHALLOW = C('#5aa6b4'), DEEP = C('#1f5470'), ROCK = C('#7a6e62'), MESA = C('#b0704a'), PLAZA = C('#cfae80');
  const terrColor = (x, z, c) => {
    const h = groundH(x, z);
    if (h < WATER_Y) { c.copy(DEEP).lerp(SHALLOW, smooth(-3.0, -0.8, h)); return c; }
    const des = smooth(30, 46, x), fl = smooth(-28, -40, z) * (1 - des), north = smooth(40, 56, z);
    c.copy(WOOD).lerp(FL, fl).lerp(NORTH, north).lerp(DESG, des).lerp(DES, des * (0.5 + 0.3 * Math.sin(x * 0.3 + z * 0.2)));
    c.multiplyScalar(0.93 + 0.09 * Math.sin(x * 0.23) * Math.cos(z * 0.19));
    if (des > 0.5 && h > 3.2) c.lerp(MESA, smooth(3.2, 5, h)).lerp(C('#c8946a'), smooth(8.5, 9.5, h) * 0.6);
    if (z > 63) c.lerp(ROCK, smooth(63.5, 66, z) * 0.85);
    c.lerp(SAND, 1 - smooth(0.2, 0.7, h));
    if (Math.hypot(x - 60, z + 20) < 6) c.lerp(PLAZA, 0.75);
    const pd = pathDist(x, z); c.lerp(PATHC, (1 - smooth(1.0, 2.4, pd)) * 0.7);
    return c; };
  const terrNormals = geo => { const p = geo.attributes.position, n = p.count, nrm = new Float32Array(n * 3), e = 0.5, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); v.set(groundH(x - e, z) - groundH(x + e, z), 2 * e, groundH(x, z - e) - groundH(x, z + e)).normalize(); nrm.set([v.x, v.y, v.z], i * 3); }
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); };
  const terrain = new THREE.Group(); terrain.name = 'terrain'; scene.add(terrain);
  for (let tx = 0; tx < 5; tx++) for (let tz = 0; tz < 4; tz++) { const W = 46, D = 46, geo = new THREE.PlaneGeometry(W, D, 34, 34); geo.rotateX(-Math.PI / 2); geo.translate(-100 + W * (tx + 0.5), 0, -90 + D * (tz + 0.5));
    const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, groundH(x, z)); terrColor(x, z, c); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); terrNormals(geo); geo.computeBoundingSphere();
    const t = new THREE.Mesh(geo, lam); t.receiveShadow = true; t.name = 'terrain-tile'; t.userData.noMerge = true; terrain.add(t); }
  { const g = new THREE.PlaneGeometry(1000, 1000); g.rotateX(-Math.PI / 2); const f = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#1f5470' })); f.position.y = -3.05; f.userData.noMerge = true; f.name = 'sea-floor'; scene.add(f); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshLambertMaterial({ color: '#2f7fa8', transparent: true, opacity: 0.8, depthWrite: false }));
  water.geometry.rotateX(-Math.PI / 2); water.position.y = WATER_Y; water.userData.noMerge = true; water.renderOrder = 2; water.name = 'water'; scene.add(water);

  const statics = new THREE.Group(); statics.name = 'statics'; scene.add(statics);
  const add = (geo, x, z, ry = 0, s = 1, cast = true, y = null) => { const m = new THREE.Mesh(geo, lam); m.position.set(x, y == null ? groundH(x, z) : y, z); m.rotation.y = ry; m.scale.setScalar(s); m.castShadow = cast; m.receiveShadow = true; statics.add(m); return m; };
  const colliders = { out: [], cave: [] };
  const circ = (x, z, r) => { const c = { type: 'c', x, z, r }; colliders.out.push(c); return c; };
  const box = (x0, x1, z0, z1, tag) => { const b = { type: 'b', x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, tag }; colliders.out.push(b); return b; };
  const camOcc = [];
  const occBox = (x0, x1, z0, z1, y1) => camOcc.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, y0: -5, y1 });
  const occC = (x, z, r, y1, y0 = -5) => camOcc.push({ x, z, r, y0, y1 });
  const labels = [], gy = (x, z) => groundH(x, z);
  const building = (geo, x, z, ry, w, d, h) => { add(geo, x, z, ry); const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = (w * c + d * s) / 2, hz = (w * s + d * c) / 2; box(x - hx, x + hx, z - hz, z + hz); occBox(x - hx, x + hx, z - hz, z + hz, gy(x, z) + h + 1); };
  const wall = (x0, z0, x1, z1, h = 2.8) => { const len = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; add(palisadeGeo(len, h, rnd), mx, mz, ry);
    const n = Math.ceil(len / 1.5); for (let i = 0; i <= n; i++) { const t = i / n; circ(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 0.5); } occBox(Math.min(x0, x1) - 0.3, Math.max(x0, x1) + 0.3, Math.min(z0, z1) - 0.3, Math.max(z0, z1) + 0.3, gy(mx, mz) + h); };
  // the cliff at Quebec and the mesa sides cannot be climbed
  box(-95, 95, 63.6, 120, 'cliff');
  for (const [mx, mz, rx, rz] of MESAS) for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; circ(mx + Math.cos(t) * rx * 0.9, mz + Math.sin(t) * rz * 0.9, Math.min(rx, rz) * 0.32); }

  // ===== 1 · St. Augustine 1565: a wooden fort by the inlet, the Mission of Nombre de Dios, a Timucua village
  { const { x: cx, z: cz } = STATIONS.staug, fx = cx - 9.5, fz = cz - 1.5, S = 4.2;
    wall(fx - S, fz - S, fx + S, fz - S); wall(fx - S, fz + S, fx + S, fz + S); wall(fx - S, fz - S, fx - S, fz + S); wall(fx + S, fz - S, fx + S, fz - 0.9); wall(fx + S, fz + 0.9, fx + S, fz + S);   // gate faces west, toward town
    add(M([P(BOX(2.2, 0.2, 2.2), '#6b4f36', 0, 4.4, 0), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P(CYL(0.13, 0.15, 4.4, 5), '#6b4f36', a, 2.2, b)), P(new THREE.ConeGeometry(1.8, 1.4, 4), '#8a7a56', 0, 5.2, 0, 0, Math.PI / 4, 0)]), fx - S + 1.2, fz + S - 1.2);
    add(houseGeo(3.2, 2.6, 2.2, '#cbb894', '#8f8456', rnd), fx - 1, fz - 1.2, Math.PI / 2);
    add(flagGeo('spain'), fx + 1.8, fz + 2.2); add(barrelGeo(), fx + 2.5, fz - 2.6); add(crateGeo(), fx + 1.6, fz - 2.9);
    // the mission: a small wooden chapel with a thatched roof and a cross (a Mass was said here on September 8, 1565)
    const mx = cx + 3, mz = cz + 9.5; building(M([houseGeo(3.6, 5.5, 2.6, '#c9b08a', '#a89a60', rnd), P(BOX(0.15, 1.6, 0.15), '#5a3d24', 0, 4.4, 2.2), P(BOX(0.9, 0.15, 0.15), '#5a3d24', 0, 4.8, 2.2)]), mx, mz, Math.PI, 3.6, 5.5, 4);
    labels.push([STATIONS.staug, '1 · St. Augustine, 1565', 'Spain · the oldest city · the Timucua']);
    // Timucua village: round palmetto-thatched houses, a little west of the Spanish town
    for (const [hx, hz] of [[cx + 10, cz + 5], [cx + 13, cz + 0.5], [cx + 9, cz + 10.5]]) { add(bohioGeo(1.8, rnd), hx, hz, rnd() * 6); circ(hx, hz, 2.0); occC(hx, hz, 2, gy(hx, hz) + 4.5); }
    add(canoeBirchGeo(), cx - 14.5, cz + 3, 0.2, 1, true, gy(cx - 14.5, cz + 3) + 0.05);
  }
  // ===== 2 · Santa Fe about 1610: the adobe Palace of the Governors with its portal, a plaza, adobe bricks drying
  { const { x: cx, z: cz } = STATIONS.santafe, px = cx, pz = cz + 6.2, W = 16, D = 4.5, H = 3.2;
    building(adobeGeo(W, D, H, rnd), px, pz, Math.PI, W, D, H);   // the front (and portal) faces the plaza, to the south
    const por = [P(BOX(W, 0.25, 2.4), '#7a5a3a', 0, 2.8, 0)]; for (let i = 0; i <= 8; i++) por.push(P(CYL(0.14, 0.14, 2.7, 6), '#6b4a2c', -W / 2 + 0.2 + i * (W - 0.4) / 8, 1.35, -1.0), P(BOX(0.5, 0.18, 0.5), '#6b4a2c', -W / 2 + 0.2 + i * (W - 0.4) / 8, 2.7, -1.0));
    add(M(por), px, pz - D / 2 - 1.2); occBox(px - W / 2, px + W / 2, pz - D / 2 - 2.4, pz - D / 2, gy(px, pz) + 3.2);
    building(adobeGeo(5, 4, 2.8, rnd), cx + 10, cz - 4, -Math.PI / 2, 5, 4, 2.8); building(adobeGeo(4, 4, 2.6, rnd), cx - 9, cz - 3, Math.PI / 2, 4, 4, 2.6);
    add(flagGeo('spain'), cx - 1.5, cz + 2.5);
    const bricks = [P(BOX(1.0, 0.1, 0.5), '#6b4a2c', 0, 0.25, 0.9)]; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) bricks.push(P(BOX(0.45, 0.16, 0.24), j === 2 ? '#8a6a48' : '#a98058', -0.75 + i * 0.5, 0.08, -0.4 + j * 0.32));
    add(M(bricks), cx + 6.5, cz - 4.6, 0.2, 1.3);
    labels.push([STATIONS.santafe, '2 · Santa Fe, about 1610', 'Spain · the Palace of the Governors · the Pueblo peoples']);
    // a Pueblo village on the mesa edge: stepped, flat-roofed adobe homes with ladders
    { const vx = cx + 15, vz = cz + 12, g = []; for (const [a, b, w, h] of [[0, 0, 6, 2.6], [0.5, 0.3, 4, 5.0], [1, 0.6, 2.4, 7.2]]) g.push(P(BOX(w, h, 4 - b * 2), '#c4986a', a, h / 2, b, 0, 0, 0, 1, 1, 1, 0.05, rnd));
      g.push(P(BOX(0.08, 3, 0.08), '#6b4a2c', -1.4, 3.4, -2.0, 0.25, 0, 0), P(BOX(0.08, 3, 0.08), '#6b4a2c', -0.9, 3.4, -2.0, 0.25, 0, 0)); building(M(g), vx, vz, 0.3, 6.5, 4.5, 7); }
  }
  // ===== 3 · Beaver pond: a dam, a lodge of sticks and mud, beavers on the bank
  { add(M([P(new THREE.SphereGeometry(2.2, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), '#5e4630', 0, 0, 0, 0, 0, 0, 1, 0.75, 1, 0.25, rnd), ...Array.from({ length: 14 }, (_, i) => P(CYL(0.06, 0.06, 2.4, 4), '#7a5a3a', Math.cos(i) * 1.5, 0.6, Math.sin(i) * 1.5, rnd(), i, rnd()))]), 24, 21.5, 0, 1, true, -0.55);
    const dam = []; for (let i = 0; i < 26; i++) dam.push(P(CYL(0.08, 0.1, 2.0, 4), i % 3 ? '#6e5236' : '#5a4630', -3.5 + i * 0.28, 0.25 + rnd() * 0.15, rnd() * 0.5, rnd() * 0.6, rnd() * 3, Math.PI / 2 + (rnd() - 0.5) * 0.4));
    add(M(dam), 23, 14.9, 0.15, 1, true, -0.55);
    const beaverGeo = M([P(new THREE.SphereGeometry(0.42, 8, 6), '#6b4528', 0, 0.32, 0, 0, 0, 0, 0.9, 0.75, 1.3), P(new THREE.SphereGeometry(0.24, 7, 5), '#6b4528', 0, 0.45, 0.55), P(BOX(0.36, 0.06, 0.55), '#3a2a1e', 0, 0.12, -0.7), P(BOX(0.12, 0.08, 0.05), '#f0e6c8', 0, 0.36, 0.76)]);
    add(beaverGeo, 18.5, 18.5, 2.4); add(beaverGeo, 15.5, 19, -0.6, 0.9);
    const stump = M([P(CYL(0.28, 0.33, 0.5, 7), '#8a6a48', 0, 0.25, 0), P(new THREE.ConeGeometry(0.28, 0.35, 7), '#d8b48a', 0, 0.62, 0)]); add(stump, 13.5, 17.5); add(stump, 21, 8.5);
    labels.push([STATIONS.beaver, '3 · Beaver pond', 'the fur trade: why Europe wanted beaver']);
  }
  // ===== 4 · The St. Lawrence and Quebec 1608: canoes at both landings, Champlain's Habitation at the foot of the cliff
  { add(canoeBirchGeo(), -14.5, 41.8, 0.1, 1, true, WATER_Y - 0.12); add(canoeBirchGeo(), -9.5, 42.2, -0.2, 1, true, WATER_Y - 0.12);
    add(canoeBirchGeo(), -6, 53.6, 1.4, 1, true, WATER_Y - 0.12); add(canoeBirchGeo(), -25.5, 54.6, 1.5);
    labels.push([STATIONS.landing, '4 · Canoe landing', 'paddle across the St. Lawrence to Quebec']);
    const hx = -12, hz = 61.3, g = [];
    for (const [bx, bz, w, d] of [[-3.2, 0, 2.8, 3.6], [0, 0.6, 3.6, 2.6], [3.2, 0, 2.8, 3.6]]) { g.push(P(BOX(w, 4.2, d), '#9a7a58', bx, 2.1, bz, 0, 0, 0, 1, 1, 1, 0.06, rnd)); for (const p of roofGeo(w, d, 1.8, '#5a4a40')) { p.translate(bx, 4.2, bz); g.push(p); } g.push(P(BOX(0.6, 0.6, 0.08), '#3a2a1a', bx, 3.1, bz + d / 2 + 0.03)); }
    g.push(P(BOX(9.6, 0.15, 1.0), '#6b4f36', 0, 2.3, -2.0), ...[-4.6, -2.3, 0, 2.3, 4.6].map(x => P(CYL(0.08, 0.08, 2.3, 5), '#5a3d24', x, 1.15, -2.4)), P(BOX(9.6, 0.5, 0.08), '#6b4f36', 0, 2.6, -2.5));   // the gallery around the upper floor
    g.push(P(CYL(0.7, 0.7, 5.6, 8), '#a08462', 5.6, 2.8, 1.4), P(new THREE.ConeGeometry(1.0, 1.4, 8), '#5a4a40', 5.6, 6.3, 1.4));   // the dovecote
    g.push(P(BOX(0.9, 1.7, 0.08), '#4a3420', 0, 0.85, -0.7));
    building(M(g), hx, hz, Math.PI, 10, 4.6, 6.5);
    add(flagGeo('france'), hx - 6.4, hz - 1.6);
    building(longhouseGeo(6, rnd), -25.5, 60.5, 0.1, 3.8, 6.2, 2.8);
    labels.push([STATIONS.quebec, '4 · Quebec, 1608', 'France · Champlain · the Wendat and Algonquin']);
  }
  // ===== 5 · New Amsterdam: stepped-gable houses around the market, a windmill. 6 · Fort Amsterdam, earthen bastions
  { const mx = STATIONS.market.x, mz = STATIONS.market.z;
    const cols = ['#a8553e', '#b8704e', '#9a4a3a', '#c07a5a'];
    [[-65.5, 12, Math.PI / 2], [-65.5, 16.5, Math.PI / 2], [-50.5, 12.5, -Math.PI / 2], [-50.5, 17, -Math.PI / 2]].forEach(([x, z, ry], i) => building(dutchHouseGeo(3.6, 4, 3.8, cols[i], rnd), x, z, ry, 3.6, 4, 5.5));
    const stall = M([P(BOX(2.4, 0.9, 1.0), '#8a6a48', 0, 0.45, 0), P(BOX(2.6, 0.1, 1.4), '#c9b48e', 0, 2.1, 0), ...[[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]].map(([a, b]) => P(CYL(0.05, 0.05, 2.1, 4), '#5a3d24', a, 1.05, b))]);
    add(stall, mx - 4.5, mz + 1.5, Math.PI / 2); circ(mx - 4.5, mz + 1.5, 1.3); add(barrelGeo(), mx + 3.5, mz - 1); add(crateGeo('#b08a5c'), mx + 4, mz + 0.4);
    const wx = -50.5, wz = 27; building(windmillGeo(rnd), wx, wz, 0, 4, 4, 8);
    const sails = new THREE.Mesh(M([0, 1, 2, 3].map(k => { const g = M([P(BOX(0.18, 4.4, 0.06), '#6b4f36', 0, 2.3, 0), P(BOX(1.1, 3.6, 0.04), '#e8dfc8', 0.62, 2.6, 0)]); g.rotateZ(k * Math.PI / 2); return g; })), lam);
    sails.position.set(wx, gy(wx, wz) + 5.6, wz - 2.1); sails.userData.noMerge = true; sails.castShadow = true; sails.name = 'mill-sails'; scene.add(sails);
    labels.push([STATIONS.market, '5 · New Amsterdam, 1624–26', 'the Dutch · trade · the Lenape']);
    // Fort Amsterdam: four earthen walls with corner bastions, a flagpole and a gate toward the town
    const fx = -58, fz = -0.5, S = 3.3, g = [];
    const bank = (x, z, w, d) => g.push(P(BOX(w, 1.6, d), '#7a8a4a', x, 0.8, z, 0, 0, 0, 1, 1, 1, 0.08, rnd), P(BOX(w - 0.4, 0.2, d - 0.4), '#8a9a56', x, 1.65, z));
    bank(0, -S, 2 * S, 1.2); bank(-S, 0, 1.2, 2 * S); bank(S, 0, 1.2, 2 * S); bank(-2.1, S, 2.4, 1.2); bank(2.1, S, 2.4, 1.2);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.push(P(CYL(1.6, 1.9, 1.7, 4), '#7a8a4a', a * S, 0.85, b * S, 0, Math.PI / 4, 0));
    add(M(g), fx, fz); box(fx - S - 1.6, fx + S + 1.6, fz - S - 1.6, fz + S + 0.6); occBox(fx - S - 1.6, fx + S + 1.6, fz - S - 1.6, fz + S + 0.6, gy(fx, fz) + 2.2);
    add(houseGeo(2.6, 2.2, 2.0, '#b0603e', '#5a4a44', rnd), fx, fz - 0.8); add(flagGeo('dutch'), fx + 1.8, fz + 1.4);
    labels.push([STATIONS.fort, '6 · Fort Amsterdam', 'begun 1625 · Manhattan, 1626']);
    add(canoeBirchGeo(), -67, 8, 0.3, 1, true, gy(-67, 8) + 0.02);
  }
  // ===== 7 · The palisade gate (Trial)
  { const gx = STATIONS.gate.x, gz = -14;
    wall(gx - 14, gz, gx - 1.8, gz, 3.2); wall(gx + 1.8, gz, gx + 14, gz, 3.2);
    for (const s of [-1, 1]) { add(M([P(BOX(1.6, 4.6, 1.6), '#6b4f36', 0, 2.3, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd), P(new THREE.ConeGeometry(1.4, 1.2, 4), '#5a4a3a', 0, 5.2, 0, 0, Math.PI / 4, 0)]), gx + s * 2.6, gz); circ(gx + s * 2.6, gz, 1.1); occC(gx + s * 2.6, gz, 1.1, gy(gx, gz) + 5.5); }
    add(P(BOX(5.2, 0.4, 0.4), '#5a3d24', 0, 4.0, 0), gx, gz);
    labels.push([STATIONS.gate, '7 · Palisade gate', 'the Trial']);
  }

  // empire mats (the carry puzzle) in the market
  const MATCOL = { spain: '#c9a24a', france: '#5a7ac0', dutch: '#d8803a' };
  const mats = MATS.map(m => {
    const g = [P(BOX(MAT_HALF * 2, 0.05, MAT_HALF * 2), MATCOL[m.bin] || '#a08a5a', 0, 0.03, 0)];
    for (let i = 0; i < 5; i++) g.push(P(BOX(MAT_HALF * 2, 0.055, 0.08), '#5a4126', 0, 0.035, -MAT_HALF + 0.25 + i * 0.48));
    const mesh = new THREE.Mesh(M(g), lam); mesh.position.set(m.x, gy(m.x, m.z), m.z); mesh.receiveShadow = true; mesh.userData.noMerge = true; scene.add(mesh);
    const glow = new THREE.Mesh(new THREE.RingGeometry(MAT_HALF * 1.05, MAT_HALF * 1.35, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.set(m.x, gy(m.x, m.z) + 0.09, m.z); glow.userData.noMerge = true; scene.add(glow);
    const lab = labelSprite(matLabels[m.bin] || m.bin, 3.6); lab.position.set(m.x, gy(m.x, m.z) + 1.7, m.z); scene.add(lab);
    return { ...m, mesh, glow, label: lab, bundles: 0 };
  });
  const bundleGeo = crateGeo('#b08a5c'); bundleGeo.scale(0.6, 0.6, 0.6);
  function dropBundle(bin) { const m = mats.find(q => q.bin === bin); if (!m) return; const k = m.bundles++; const b = new THREE.Mesh(bundleGeo, lam); b.position.set(m.x - 0.6 + (k % 3) * 0.6, gy(m.x, m.z) + 0.04, m.z - 0.5 + Math.floor(k / 3) * 0.6); b.userData.noMerge = true; b.castShadow = true; b.name = 'bundle'; scene.add(b); (m.objs || (m.objs = [])).push(b); }
  function clearBundles() { for (const m of mats) { (m.objs || []).forEach(o => scene.remove(o)); m.objs = []; m.bundles = 0; m.glow.material.opacity = 0; } }

  // ===== scatter: sabal palms and live oaks in Florida, juniper and piñon in New Mexico, pines and birches in the
  // middle woods, spruce north of the river
  const near = (x, z, pad) => { for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return true; } return false; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.tag === 'cliff') continue; if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const spots = (count, ok, minPath = 3, pad = 1.5) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 80) {
      const x = -100 + rnd() * 230, z = -90 + rnd() * 184, h = groundH(x, z);
      if (h < 0.15 || pathDist(x, z) < minPath || near(x, z, 2) || blocked(x, z, pad) || Math.hypot(x - 23, z - 20) < 8 || !ok(x, z, h)) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name; scene.add(m); return m; };
  const sc = () => 0.8 + rnd() * 0.45;
  const fl = (x, z) => z < -28 && x < 25, des = (x, z) => x > 36, mid = (x, z) => !fl(x, z) && !des(x, z) && z < 44, nor = (x, z) => z > 52 && z < 63;
  const palms = spots(45, (x, z, h) => fl(x, z) && x < -20 && !near(x, z, 5) && pathDist(x, z) > 4.5).map(([x, z]) => [x, z, 0.7 + rnd() * 0.35]);
  const oaks = spots(40, (x, z, h) => fl(x, z) || (mid(x, z) && z < -5)).map(([x, z]) => [x, z, sc()]);
  const junipers = spots(80, (x, z, h) => des(x, z) && h < 4.5, 3, 1).map(([x, z]) => [x, z, 0.6 + rnd() * 0.5]);
  const pines = spots(90, (x, z, h) => mid(x, z) && z > -10).map(([x, z]) => [x, z, sc()]);
  const spruces = spots(36, (x, z, h) => nor(x, z) && Math.abs(x + 12) > 14, 2.5, 1.2).map(([x, z]) => [x, z, sc()]);
  const oakGeo = M([P(CYL(0.2, 0.28, 2.0, 6), '#5e4a34', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.9, 1), '#4a6e36', 0, 2.8, 0, 0, 0, 0, 1.3, 0.7, 1.3, 0.2, rnd)]);
  const junGeo = M([P(CYL(0.1, 0.16, 0.8, 5), '#6e5a44', 0, 0.4, 0), P(new THREE.IcosahedronGeometry(0.9, 0), '#4e6a44', 0, 1.3, 0, 0, 0, 0, 1, 0.9, 1, 0.25, rnd)]);
  const pineGeo = M([P(CYL(0.14, 0.2, 2.0, 6), '#6e5038', 0, 1.0, 0), P(new THREE.ConeGeometry(1.5, 3.2, 7), '#2f5a32', 0, 3.2, 0, 0, 0, 0, 1, 1, 1, 0.15, rnd), P(new THREE.ConeGeometry(1.1, 2.4, 7), '#36643a', 0, 4.6, 0)]);
  const spruceGeo = M([P(CYL(0.12, 0.16, 1.2, 5), '#5a4030', 0, 0.6, 0), P(new THREE.ConeGeometry(1.1, 4.6, 6), '#24482e', 0, 3.0, 0, 0, 0, 0, 1, 1, 1, 0.12, rnd)]);
  inst(palmGeo(rnd, 5), palms, true, 'palms'); inst(oakGeo, oaks, true, 'oaks'); inst(junGeo, junipers, true, 'junipers'); inst(pineGeo, pines, true, 'pines'); inst(spruceGeo, spruces, true, 'spruces');
  for (const [x, z, s] of palms) circ(x, z, 0.25 * s + 0.1);
  for (const L of [oaks, pines, spruces]) for (const [x, z, s] of L) { circ(x, z, 0.28 * s + 0.12); occC(x, z, 1.6 * s, groundH(x, z) + 4.5 * s, groundH(x, z) + 1.8 * s); }
  for (const [x, z, s] of junipers) circ(x, z, 0.5 * s);
  const tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#8a9a50', 0.2, rnd), rockGeo = vc(new THREE.DodecahedronGeometry(0.6, 0), '#8a8076', 0.2, rnd);
  inst(tuftGeo, spots(420, (x, z, h) => h < 6, 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6]), false, 'tufts');
  inst(rockGeo, spots(60, (x, z, h) => h < 9, 2.2, 0.6).map(([x, z]) => [x, z, 0.4 + rnd() * 0.6]), true, 'rocks');
  // far scenery: the Appalachians to the west of the coast, desert mountains in the far west, northern hills
  { const g = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, R = 190 + rnd() * 40, x = Math.cos(a) * R, z = Math.sin(a) * R, west = x > 60, sea = x < -60, h = sea ? 0 : west ? 16 + rnd() * 14 : 10 + rnd() * 10;
      if (!h) continue; const cone = vc(new THREE.ConeGeometry(h * 2.4, h, 7, 2), west ? '#b08a6a' : '#6f8a7a', 0.1, rnd); cone.translate(x, h / 2 - 3, z); g.push(cone); }
    const far = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); far.userData.noMerge = true; far.name = 'far'; scene.add(far); }
  const regionLabels = labels.map(([s, t, sub]) => { const sp = labelSprite(t, 9, sub); sp.position.set(s.x, Math.max(0, groundH(s.x, s.z)) + 9.5, s.z); sp.name = 'region-label'; scene.add(sp); return { s, sp }; });

  const rings = ringDefs.map(d => makeRing(scene, d, walkY(d.x, d.z)));
  mergeAO.buildAO();
  mergeAO.mergeStatic(statics, { cell: 40 });

  let t = 0;
  function update(dt, hero) {
    t += dt; sails.rotation.z = -t * 0.6;
    for (const r of rings) { r.beam.material.opacity = (r.state === 'locked' ? 0.22 : r.state === 'new' ? 0.5 : 0.35) + 0.12 * Math.sin(t * 2.4 + r.def.x); r.icon.position.y = 2.9 + 0.12 * Math.sin(t * 1.8 + r.def.z); }
    water.position.y = WATER_Y + Math.sin(t * 1.1) * 0.03;
    if (hero) for (const L of regionLabels) { const d = Math.hypot(hero.x - L.s.x, hero.z - L.s.z); L.sp.visible = d > L.s.r + 6; }
    for (const m of mats) if (m.glowOn) m.glow.material.opacity = 0.55 + 0.35 * Math.sin(t * 6); else if (m.glow.material.opacity) m.glow.material.opacity = 0;
  }
  const sails = scene.getObjectByName('mill-sails');
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen() {}, tracks: [], herds: {}, flames: [], water, fogColor: SKY_H, sky: scene.userData.sky, mats, dropBundle, clearBundles, regionLabels };
}
