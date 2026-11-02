// world/boston74.js — Section 8 walkable level: "The Road to Revolution" (1763–1775).
// Abigail is a Boston girl of the 1760s–70s. A walk, south to north through the town: the Liberty Tree at Hanover Square
// (1765) → Long Wharf, where British troops landed in October 1768 → King Street and the Old State House (the Boston
// Massacre, March 5, 1770) → the Old South Meeting House (December 16, 1773) → Griffin's Wharf and the three tea ships →
// Faneuil Hall, 1774, as gifts arrive for the closed port → a story jump: the post road to Philadelphia, September 1774 →
// Carpenters' Hall, the First Continental Congress (the Trial).
// Map directions follow the earlier levels: north = +z, WEST = +x, so Boston Harbor is to the EAST (−x). Distances are
// shrunk enormously, and the town is simplified (no street grid).
// Accuracy: the Liberty Tree was a great elm near Hanover Square where the Sons of Liberty posted notices. The Old State
// House (1713) is brick with a stepped tower and a lion and a unicorn on its east gable; the Custom House stood a little
// down King Street. The Old South Meeting House (1729) is brick with a tall white steeple. The tea ships Dartmouth, Eleanor,
// and Beaver lay at Griffin's Wharf. Faneuil Hall had a gilded grasshopper weathervane. Carpenters' Hall (1770–74) is a
// Georgian brick hall in the shape of a cross with a cupola. British flags are the Union flag of 1707 (no St Patrick's
// saltire, added 1801). British regulars wear red coats; Bostonians wear their own wool and linen.
// Nothing here touches the save.
import * as THREE from 'three';
import { vc, P, M, rng, CYL, BOX, roofGeo, houseGeo, makeRing, barrelGeo, crateGeo, labelSprite, setRingState, RING_COL, shipGeo } from './voyage.js';
export { labelSprite, setRingState, RING_COL };

export const WATER_Y = -0.4, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const STATIONS = {
  libertytree: { x: -6, z: -58, r: 8, label: 'The Liberty Tree, 1765', n: 1, dir: 'start' },
  longwharf: { x: -28, z: -34, r: 9, label: 'Long Wharf, 1768', n: 2, dir: 'north-east, to the harbor' },
  kingstreet: { x: 2, z: -12, r: 10, label: 'King Street, 1770', n: 3, dir: 'north-west, up King Street' },
  oldsouth: { x: 28, z: 8, r: 9, label: 'Old South Meeting House, 1773', n: 4, dir: 'north-west' },
  griffins: { x: -28, z: 22, r: 9, label: "Griffin's Wharf, 1773", n: 5, dir: 'east, to the harbor' },
  faneuil: { x: 2, z: 36, r: 8, label: 'Faneuil Hall, 1774', n: 6, dir: 'north-west, to the market hall' },
  gate: { x: 8, z: 74, r: 9, label: "Carpenters' Hall, Philadelphia, 1774", n: 7, dir: 'the post road to Philadelphia (Trial)' }
};
export const ROADS = [
  [[-6, -62], [-6, -52], [-18, -44], [-28, -34]],
  [[-28, -34], [-14, -24], [2, -12]],
  [[2, -12], [16, -2], [28, 8]],
  [[28, 8], [0, 16], [-28, 22]],
  [[-28, 22], [-12, 30], [2, 36], [6, 41]],
  [[8, 60], [8, 74]]
];
export function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
export const PATH = ROADS[0];
export const BOUNDS = { x0: -70, x1: 70, z0: -72, z1: 92 };
// Boston Harbor to the east (−x); a broad river band (the long road south, shrunk) between Boston and Philadelphia
export const SHORE_X = z => -41 + 2.2 * Math.sin(z * 0.09) + 1.2 * Math.sin(z * 0.23);
export const RIVER_S = 47, RIVER_N = 56;
export const riverZ = () => -9999;
function rawH(x, z) {
  let h = 0.6 + 0.3 * Math.sin(x * 0.08) * Math.cos(z * 0.07);
  h += 2.6 * smooth(30, 55, x) * smooth(-20, 0, z) * smooth(40, 25, z) * smooth(3, 9, pathDist(x, z));   // Beacon Hill, west of town
  let w = smooth(SHORE_X(z) + 1.2, SHORE_X(z) - 2.4, x);                                                // the harbor
  w = Math.max(w, smooth(RIVER_S - 0.6, RIVER_S + 1.4, z) * smooth(RIVER_N + 0.6, RIVER_N - 1.4, z));      // the river band
  return h * (1 - w) + -3.0 * w;
}
const FLAT = {}; for (const k in STATIONS) { const s = STATIONS[k]; FLAT[k] = rawH(s.x, s.z); }
export function groundH(x, z) {
  let h = rawH(x, z);
  for (const k in STATIONS) { const s = STATIONS[k], d = Math.hypot(x - s.x, z - s.z); if (d < s.r + 4) h += (FLAT[k] - h) * smooth(s.r + 4, s.r - 1, d) * (h > -0.5 ? 1 : 0); }
  const pd = pathDist(x, z); if (pd < 3 && h > 0) h -= 0.05 * smooth(3, 1, pd);
  return h;
}
export const shoreZ = () => 9999;
export const STONES = [], FORD_ROWS = 0, FORD_RESPAWN = { x: -6, z: -60, yaw: 0 };
export function onStone() { return null; }
export function walkY(x, z) { return groundH(x, z); }
export function solid(x, z) { return groundH(x, z) < WATER_Y + 0.25; }
// the story jump: the post road from Boston to Philadelphia (the ride rings fade her across; nothing is saved but at.s8)
export const HARBORS = {
  south: { x: 9, z: 43.5, yaw: Math.PI, label: 'Boston, the post road south' },
  north: { x: 8, z: 59.5, yaw: 0, label: 'Philadelphia, Second Street' }
};
export const MATS = [];
export const MAT_HALF = 1.2;
export const RING_AT = {
  l0: [-1.5, -55], tree: [-10.5, -54], l1: [-6, -51.5], lawprotest: [-1.5, -61], l7: [-10.5, -61],
  l2: [-24.4, -30.9], troops: [-31, -27.5], market: [-23.4, -36.1], l8: [-31.8, -37.7],
  l3: [6.5, -9], massacre: [-2.5, -5], samadams: [7, -15.5], engraving: [-2.5, -15.5],
  oldsouth: [24.7, 11.3], teaparty: [32.5, 11.5], meeting: [28, 3.5],
  l4: [-24, 25.5], teaships: [-32, 27.5], tea: [-25, 18],
  l5: [-2.4, 38.6], gifts: [6, 39], edenton: [-2.5, 32.5], 'ride-south': [9, 41],
  'ride-north': [8, 62], l6: [3.5, 77], carpenters: [12.5, 77], geomap: [3, 82.5], timeline: [13, 82.5], trial: [8, 79]
};

// ---------------- props ----------------
function unionFlagGeo(h = 7) {   // the British Union flag of 1707 (crosses of St. George and St. Andrew)
  const g = [P(CYL(0.07, 0.09, h, 6), '#6b4f36', 0, h / 2, 0)], fy = h - 0.6, fx = 1.0;
  g.push(P(BOX(1.9, 1.2, 0.04), '#1f3a7a', fx, fy, 0), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, 0.56), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, -0.56));
  g.push(P(BOX(1.9, 0.32, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(0.36, 1.2, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(1.9, 0.18, 0.07), '#c0302a', fx, fy, 0), P(BOX(0.2, 1.2, 0.07), '#c0302a', fx, fy, 0));
  return M(g);
}
function personGeo(coat, hat = '#2a2622', skirt) {   // a Bostonian; with `skirt` a woman or girl in a cap
  if (skirt) return M([P(CYL(0.2, 0.34, 0.7, 7), skirt, 0, 0.35, 0), P(CYL(0.15, 0.2, 0.36, 6), coat, 0, 0.86, 0), P(new THREE.SphereGeometry(0.14, 6, 5), '#e0b890', 0, 1.15, 0), P(new THREE.SphereGeometry(0.15, 6, 4, 0, 6.3, 0, 1.6), '#f2eee2', 0, 1.2, 0)]);
  return M([P(CYL(0.18, 0.24, 0.9, 6), coat, 0, 0.45, 0), P(new THREE.SphereGeometry(0.15, 6, 5), '#e0b890', 0, 1.05, 0), P(CYL(0.24, 0.24, 0.06, 3), hat, 0, 1.18, 0)]);
}
function soldierGeo(coat, cuff, legs = '#e8e2d2') {   // a British regular: red coat, tricorne, musket on the shoulder
  return M([P(CYL(0.08, 0.08, 0.5, 5), legs, -0.09, 0.25, 0), P(CYL(0.08, 0.08, 0.5, 5), legs, 0.09, 0.25, 0), P(CYL(0.17, 0.26, 0.62, 6), coat, 0, 0.72, 0),
    P(BOX(0.1, 0.42, 0.12), coat, -0.25, 0.8, 0), P(BOX(0.1, 0.42, 0.12), coat, 0.25, 0.8, 0), P(BOX(0.12, 0.1, 0.14), cuff, -0.25, 0.6, 0), P(BOX(0.12, 0.1, 0.14), cuff, 0.25, 0.6, 0),
    P(BOX(0.36, 0.05, 0.05), '#f2eee2', 0, 0.8, 0.2, 0, 0, 0.7), P(new THREE.SphereGeometry(0.14, 6, 5), '#e0b890', 0, 1.15, 0), P(CYL(0.012, 0.016, 1.2, 4), '#4a3a2a', 0.27, 1.0, -0.05, 0.12, 0, 0),
    P(CYL(0.24, 0.24, 0.07, 3), '#1e1c1a', 0, 1.27, 0)]);
}
function brickHouseGeo(w, d, h, rnd, wall = '#9a4a32', roof = '#3a3e48') {   // a Boston brick or clapboard house, with chimneys
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
  for (const p of roofGeo(w, d, 1.4, roof)) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(0.6, 1.4, 0.6), '#7a3a2a', -w / 2 + 0.5, h + 0.9, 0), P(BOX(0.6, 1.4, 0.6), '#7a3a2a', w / 2 - 0.5, h + 0.9, 0));
  g.push(P(BOX(0.9, 1.7, 0.08), '#2a3a2a', 0, 0.85, d / 2 + 0.02));
  for (const sx of [-1, 1]) for (const fy of [0.45, 0.78]) g.push(P(BOX(0.55, 0.75, 0.06), '#e8e4da', sx * w * 0.3, h * fy, d / 2 + 0.03), P(BOX(0.42, 0.62, 0.07), '#2a3440', sx * w * 0.3, h * fy, d / 2 + 0.04));
  return M(g);
}
function towerHallGeo(w, d, h, rnd, { wall = '#9a4a32', trim = '#efe8d6', tower = 3.2, spire = 4.5, spireCol = '#efe8d6', lion = false } = {}) {   // a brick hall with a tower and spire (Old State House, Old South)
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)];
  for (const p of roofGeo(w, d, 2.2, '#3a3e48')) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(w + 0.1, 0.18, d + 0.1), trim, 0, h, 0));
  for (let i = -2; i <= 2; i++) g.push(P(BOX(0.6, 1.0, 0.06), '#e8e4da', i * w / 5.5, h * 0.62, d / 2 + 0.03), P(BOX(0.46, 0.86, 0.07), '#2a3440', i * w / 5.5, h * 0.62, d / 2 + 0.04));
  const tz = -d / 2 - 0.9, ty = h + 2.2;
  g.push(P(BOX(1.9, h + 1.4, 1.9), wall, 0, (h + 1.4) / 2, tz), P(BOX(1.5, tower, 1.5), trim, 0, h + 1.4 + tower / 2, tz), P(BOX(1.1, 1.0, 1.1), trim, 0, h + 1.4 + tower + 0.5, tz));
  g.push(P(new THREE.ConeGeometry(0.6, spire, 8), spireCol, 0, h + 1.4 + tower + 1.0 + spire / 2, tz));
  g.push(P(BOX(1.0, 1.9, 0.08), '#2a3a2a', 0, 0.95, d / 2 + 0.02));
  if (lion) g.push(P(BOX(0.7, 0.8, 0.2), '#c9a227', -1.0, ty, d / 2 + 0.1), P(BOX(0.7, 0.8, 0.2), '#e8e4da', 1.0, ty, d / 2 + 0.1));   // the lion (gold) and the unicorn (silver-white) on the gable
  return M(g);
}
function carpentersHallGeo(rnd) {   // Carpenters' Hall: Georgian brick, a cross-shaped plan, a white cupola
  const g = [P(BOX(6, 4.2, 3.4), '#a5523a', 0, 2.1, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd), P(BOX(3.4, 4.2, 6), '#a5523a', 0, 2.1, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)];
  for (const p of roofGeo(6, 3.4, 1.8, '#3a3e48')) { p.translate(0, 4.2, 0); g.push(p); }
  for (const p of roofGeo(3.4, 6, 1.8, '#3a3e48')) { p.rotateY(0); p.translate(0, 4.2, 0); g.push(p); }
  g.push(P(CYL(0.6, 0.7, 1.0, 8), '#f2eee2', 0, 6.3, 0), P(new THREE.SphereGeometry(0.62, 8, 5, 0, 6.3, 0, 1.6), '#f2eee2', 0, 6.8, 0), P(CYL(0.03, 0.03, 0.8, 4), '#c9a227', 0, 7.5, 0));
  g.push(P(BOX(1.2, 2.2, 0.08), '#f2eee2', 0, 1.1, 3.02), P(BOX(1.0, 2.0, 0.09), '#2a3a2a', 0, 1.0, 3.03), P(new THREE.ConeGeometry(1.0, 0.6, 3), '#f2eee2', 0, 2.6, 3.02, 0, 0, 0, 1.2, 1, 0.1));
  for (const sx of [-2.3, 2.3]) g.push(P(BOX(0.6, 1.1, 0.06), '#e8e4da', sx, 2.6, 1.73), P(BOX(0.46, 0.96, 0.07), '#2a3440', sx, 2.6, 1.74));
  return M(g);
}
function elmGeo(rnd) {   // the Liberty Tree: a great old elm, vase-shaped
  const g = [P(CYL(0.6, 0.85, 4.2, 8), '#5a4634', 0, 2.1, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd)];
  for (const [a, l] of [[0, 3.4], [2.1, 3.0], [4.2, 3.2]]) g.push(P(CYL(0.22, 0.34, l, 6), '#5a4634', Math.cos(a) * 0.9, 4.9, Math.sin(a) * 0.9, Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45));
  for (const [x, y, z, s] of [[0, 7.6, 0, 3.4], [2.0, 6.6, 1.2, 2.4], [-2.0, 6.8, -0.6, 2.5], [0.6, 6.4, -2.0, 2.3], [-0.8, 6.2, 2.0, 2.2]]) g.push(P(new THREE.IcosahedronGeometry(s, 1), '#5f8a3a', x, y, z, 0, 0, 0, 1, 0.75, 1, 0.25, rnd));
  return M(g);
}
function teaChestGeo() { return M([P(BOX(0.7, 0.55, 0.55), '#8a5a32', 0, 0.28, 0), P(BOX(0.72, 0.05, 0.57), '#3a2a1a', 0, 0.56, 0), P(BOX(0.3, 0.2, 0.02), '#e8dcc0', 0, 0.3, 0.29)]); }
function sheepGeo() { return M([P(new THREE.SphereGeometry(0.42, 7, 5), '#ece6d6', 0, 0.55, 0, 0, 0, 0, 1, 0.85, 1.35), P(new THREE.SphereGeometry(0.16, 6, 4), '#3a3530', 0, 0.68, 0.56), ...[[-0.2, -0.3], [0.2, -0.3], [-0.2, 0.3], [0.2, 0.3]].map(([x, z]) => P(CYL(0.05, 0.05, 0.36, 4), '#3a3530', x, 0.18, z))]); }
function broadsideTex(title, lines) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320; const x = c.getContext('2d');
  x.fillStyle = '#efe4c8'; x.fillRect(0, 0, 256, 320); x.fillStyle = '#2a2018'; x.textAlign = 'center';
  x.font = 'bold 30px Georgia, serif'; x.fillText(title, 128, 52); x.fillRect(30, 68, 196, 3);
  x.font = '20px Georgia, serif'; lines.forEach((l, i) => x.fillText(l, 128, 112 + i * 34));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), new THREE.MeshLambertMaterial({ map: tex })); m.userData.noMerge = true; return m;
}

// ---------------- build ----------------
export function buildBoston({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(17651774);
  const scene = new THREE.Scene(); scene.name = 'boston74';
  const SKY_TOP = new THREE.Color('#6a9ccc'), SKY_H = new THREE.Color('#e8e6e0');
  scene.fog = new THREE.Fog(SKY_H, 90, 300);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), LOW = new THREE.Color('#9aa0a0');
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; if (y < 0) c.copy(SKY_H).lerp(LOW, Math.min(1, -y * 6)); else c.copy(SKY_H).lerp(SKY_TOP, Math.pow(y, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky; }
  const hemi = new THREE.HemisphereLight('#f2f0ff', '#857a6a', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0dc', 2.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  const C = k => new THREE.Color(k);
  const GREEN = C('#6f8a48'), OLIVE = C('#8a8a5a'), SAND = C('#c8b898'), PATHC = C('#9a8a78'), COBBLE = C('#8a847a'), SHALLOW = C('#5a8a98'), DEEP = C('#1f4458'), SNOW = C('#f2f2f0');
  const terrColor = (x, z, c) => {
    const h = groundH(x, z);
    if (h < WATER_Y) { c.copy(DEEP).lerp(SHALLOW, smooth(-3.0, -0.8, h)); return c; }
    const f = 0.5 + 0.5 * Math.sin(x * 0.19 + z * 0.13);
    c.copy(GREEN).lerp(OLIVE, 0.3 + 0.3 * f);
    c.multiplyScalar(0.93 + 0.09 * Math.sin(x * 0.23) * Math.cos(z * 0.19));
    c.lerp(SAND, 1 - smooth(0.2, 0.75, h));
    const pd = pathDist(x, z); c.lerp(z < RIVER_S ? COBBLE : PATHC, (1 - smooth(1.2, 2.8, pd)) * 0.75);
    const dk = Math.hypot(x - STATIONS.kingstreet.x, z - STATIONS.kingstreet.z); if (dk < 12) c.lerp(SNOW, 0.75 * smooth(12, 7, dk) * (0.7 + 0.3 * f));   // snow on King Street, March 1770
    return c; };
  const terrNormals = geo => { const p = geo.attributes.position, n = p.count, nrm = new Float32Array(n * 3), e = 0.5, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); v.set(groundH(x - e, z) - groundH(x + e, z), 2 * e, groundH(x, z - e) - groundH(x, z + e)).normalize(); nrm.set([v.x, v.y, v.z], i * 3); }
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); };
  const terrain = new THREE.Group(); terrain.name = 'terrain'; scene.add(terrain);
  for (let tx = 0; tx < 4; tx++) for (let tz = 0; tz < 4; tz++) { const W = 46, D = 46, geo = new THREE.PlaneGeometry(W, D, 40, 40); geo.rotateX(-Math.PI / 2); geo.translate(-92 + W * (tx + 0.5), 0, -92 + D * (tz + 0.5));
    const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, groundH(x, z)); terrColor(x, z, c); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); terrNormals(geo); geo.computeBoundingSphere();
    const t = new THREE.Mesh(geo, lam); t.receiveShadow = true; t.name = 'terrain-tile'; t.userData.noMerge = true; terrain.add(t); }
  { const g = new THREE.PlaneGeometry(1000, 1000); g.rotateX(-Math.PI / 2); const f = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#1f4458' })); f.position.y = -3.05; f.userData.noMerge = true; f.name = 'river-bed'; scene.add(f); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshLambertMaterial({ color: '#3a7088', transparent: true, opacity: 0.82, depthWrite: false }));
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
  const figure = (geo, x, z, face, s = 1) => { add(geo, x, z, Math.atan2(face[0] - x, face[1] - z), s); circ(x, z, 0.3); };
  const line = (geoFn, x0, z0, x1, z1, n, face) => { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; figure(geoFn(i), x, z, face); } };
  const poster = (title, lines, x, z, ry, y = 1.7) => { const m = broadsideTex(title, lines); m.position.set(x, gy(x, z) + y, z); m.rotation.y = ry; m.name = 'broadside'; scene.add(m); return m; };
  const REDCOAT = () => soldierGeo('#b22222', '#e8d27a');   // 29th Regiment of Foot (yellow facings)
  const TOWN = i => personGeo(['#4a3a2a', '#2a3a5a', '#5a2a2a', '#3a4a3a', '#6a5a44'][i % 5], '#2a2622', i % 3 === 1 ? ['#6a3a3a', '#3a4a6a', '#7a6a4a'][i % 3] : null);
  const wharf = (x0, x1, z0, z1) => { add(M([P(BOX(x1 - x0, 0.25, z1 - z0), '#7a6448', 0, 0, 0), ...Array.from({ length: Math.round((x1 - x0) / 2) }, (_, i) => P(CYL(0.15, 0.15, 3, 5), '#5a4632', -(x1 - x0) / 2 + 1 + i * 2, -1.4, (z1 - z0) / 2))]), (x0 + x1) / 2, (z0 + z1) / 2, 0, 1, true, 0.05); };

  // ===== 1 · The Liberty Tree, 1765: the great elm at Hanover Square, broadsides nailed to the trunk, houses around
  { const { x: cx, z: cz } = STATIONS.libertytree, tx = cx - 4.5, tz = cz + 2;
    add(elmGeo(rnd), tx, tz); circ(tx, tz, 1.0); occC(tx, tz, 3.2, gy(tx, tz) + 9, gy(tx, tz) + 4);
    poster('LIBERTY,', ['PROPERTY,', 'and', 'NO STAMPS.'], tx + 0.92, tz, Math.PI / 2, 1.8);
    add(M([P(CYL(0.08, 0.1, 6, 6), '#6b4f36', 0, 3, 0), P(BOX(0.5, 0.3, 0.06), '#e8d9a8', 0.3, 5.7, 0)]), tx + 2.6, tz - 2.6);   // a flagstaff on the tree (the Sons raised a flag here when they met)
    for (const [hx, hz, ry, wall] of [[cx + 9, cz + 1, -Math.PI / 2, '#9a4a32'], [cx + 9, cz - 6, -Math.PI / 2, '#b8a888'], [cx - 13, cz + 6, Math.PI / 2, '#8a8478'], [cx + 3, cz + 10, Math.PI, '#9a4a32']]) building(brickHouseGeo(4, 3.4, 3.4, rnd, wall), hx, hz, ry, 4, 3.4, 5.4);
    line(TOWN, cx - 1, cz + 4, cx + 2, cz + 5.5, 3, [tx, tz]);
    labels.push([STATIONS.libertytree, '1 · The Liberty Tree, 1765', 'Hanover Square · the Stamp Act']);
  }
  // ===== 2 · Long Wharf, October 1768: warehouses and shops along the wharf, troop ships, redcoats coming ashore
  { const { x: cx, z: cz } = STATIONS.longwharf, sx = SHORE_X(cz);
    wharf(sx - 20, sx + 1.5, cz - 1.6, cz + 1.6);
    for (let i = 0; i < 4; i++) add(M([P(BOX(2.6, 2.2, 2.2), i % 2 ? '#9a4a32' : '#8a7a62', 0, 1.1, 0), ...roofGeo(2.6, 2.2, 0.9, '#3a3e48').map(p => p.translate(0, 2.2, 0))]), sx - 3 - i * 3.6, cz + 0.5, Math.PI / 2, 1, true, 0.15);   // warehouses on the wharf
    add(shipGeo('nao', 'square', { flag: 'britain', furled: true }), sx - 12, cz + 6.5, -Math.PI / 2, 0.7, true, WATER_Y - 0.15); occBox(sx - 18, sx - 6, cz + 4, cz + 9, WATER_Y + 4.5);
    add(shipGeo('caravel', 'square', { flag: 'britain', furled: true }), sx - 9, cz - 6.5, -Math.PI / 2 + 0.1, 0.6, true, WATER_Y - 0.15); occBox(sx - 14, sx - 4, cz - 9, cz - 4, WATER_Y + 4);
    add(unionFlagGeo(6), cx - 6, cz + 3.5);
    line(() => REDCOAT(), cx - 8, cz - 2.5, cx - 3, cz - 2.5, 5, [cx + 10, cz]);
    building(brickHouseGeo(5, 3.6, 3.2, rnd, '#8a7a62'), cx + 6, cz + 6, Math.PI, 5, 3.6, 5.2);
    building(brickHouseGeo(4, 3.4, 3.2, rnd, '#9a4a32'), cx + 7.5, cz - 4, -Math.PI / 2, 4, 3.4, 5.2);
    add(barrelGeo(), cx - 3.5, cz + 3.8); add(barrelGeo(), cx - 2.8, cz + 4.4); add(crateGeo('#8a6a48'), cx - 4.2, cz + 4.6, 0.3); box(cx - 4.9, cx - 2.2, cz + 3.2, cz + 5.2);
    labels.push([STATIONS.longwharf, '2 · Long Wharf, 1768', 'redcoats land · homespun and boycotts']);
  }
  // ===== 3 · King Street, March 5, 1770: the Old State House at the head of the street, the Custom House, the sentry box, snow
  { const { x: cx, z: cz } = STATIONS.kingstreet;
    building(towerHallGeo(6, 4, 4.2, rnd, { lion: true, tower: 2.6, spire: 2.2 }), cx + 2, cz + 9, Math.PI, 6, 6.2, 11);   // the Old State House (tower behind, lion and unicorn facing the street)
    building(brickHouseGeo(5.5, 3.6, 3.8, rnd, '#8a5a42'), cx - 8, cz + 2, Math.PI / 2, 5.5, 3.6, 5.8);   // the Custom House
    add(M([P(BOX(0.9, 2.0, 0.9), '#6a4a3a', 0, 1.0, 0), P(new THREE.ConeGeometry(0.75, 0.6, 4), '#3a3e48', 0, 2.3, 0, 0, Math.PI / 4, 0)]), cx - 5.6, cz + 4.6); box(cx - 6.1, cx - 5.1, cz + 4.1, cz + 5.1);   // the sentry box
    line(() => REDCOAT(), cx - 6, cz + 1.0, cx - 6.4, cz + 6.4, 6, [cx + 6, cz + 3]);
    for (const [hx, hz, ry] of [[cx + 11, cz - 2, -Math.PI / 2], [cx + 11, cz - 9, -Math.PI / 2], [cx - 9, cz - 8, Math.PI / 2]]) building(brickHouseGeo(4, 3.4, 3.4, rnd, rnd() > 0.5 ? '#9a4a32' : '#b8a888'), hx, hz, ry, 4, 3.4, 5.4);
    add(M([P(BOX(1.4, 0.06, 1.0), '#f2f2f0', 0, 0.03, 0)]), cx - 1.5, cz + 3.6, 0.4, 1, false);   // a snow drift
    labels.push([STATIONS.kingstreet, '3 · King Street, March 5, 1770', 'the Old State House · the Boston Massacre']);
  }
  // ===== 4 · The Old South Meeting House, December 16, 1773: brick, with its tall white steeple; a crowd at the doors
  { const { x: cx, z: cz } = STATIONS.oldsouth;
    building(towerHallGeo(6.4, 5, 4.6, rnd, { tower: 3.6, spire: 6, spireCol: '#efe8d6' }), cx + 1, cz + 8.5, Math.PI, 6.4, 7.0, 15);
    line(TOWN, cx - 4, cz + 4.4, cx + 5, cz + 4.4, 7, [cx + 1, cz + 8]);
    for (const [hx, hz, ry] of [[cx + 10, cz + 2, -Math.PI / 2], [cx - 9, cz + 5, Math.PI / 2]]) building(brickHouseGeo(4, 3.4, 3.4, rnd, '#b8a888'), hx, hz, ry, 4, 3.4, 5.4);
    poster('TEA!', ['A meeting at', 'the Old South,', 'Dec. 16, 1773'], cx - 4.4, cz + 6, 0.2, 1.6);
    labels.push([STATIONS.oldsouth, '4 · The Old South Meeting House', 'December 16, 1773']);
  }
  // ===== 5 · Griffin's Wharf: the Dartmouth, Eleanor, and Beaver; tea chests on the deck, the dock, and in the water
  { const { x: cx, z: cz } = STATIONS.griffins, sx = SHORE_X(cz);
    wharf(sx - 14, sx + 1.5, cz - 1.4, cz + 1.4);
    const ships = [['nao', sx - 6, cz + 5.8, 'Dartmouth'], ['caravel', sx - 6, cz - 5.6, 'Eleanor'], ['caravel', sx - 15.5, cz + 6.2, 'Beaver']];
    for (const [k, x, z, n] of ships) { add(shipGeo(k, 'square', { flag: 'britain', furled: true }), x, z, -Math.PI / 2, 0.6, true, WATER_Y - 0.15); occBox(x - 6, x + 6, z - 2.5, z + 2.5, WATER_Y + 4); const sp = labelSprite(n, 4); sp.position.set(x, 6.4, z); sp.name = 'ship-label'; scene.add(sp); }
    for (let i = 0; i < 9; i++) add(teaChestGeo(), sx - 3 - rnd() * 14, cz + (rnd() - 0.5) * 9, rnd() * 3, 1, false, WATER_Y - 0.25);   // chests floating in the harbor
    for (let i = 0; i < 4; i++) add(teaChestGeo(), cx - 4.5 + (i % 2) * 0.8, cz + 2.8 + Math.floor(i / 2) * 0.62, 0.1); box(cx - 5, cx - 3.3, cz + 2.4, cz + 4.1);
    line(i => personGeo(['#5a4a3a', '#3a3a4a', '#6a4a2a'][i % 3], '#3a3026'), cx - 6, cz - 3, cx - 3, cz - 4.5, 3, [sx - 6, cz]);   // protesters (simplified; the disguises were rough blankets and soot)
    labels.push([STATIONS.griffins, "5 · Griffin's Wharf, 1773", 'the Boston Tea Party']);
  }
  // ===== 6 · Faneuil Hall, 1774: the market hall with its grasshopper vane; sheep and rice barrels sent for the closed port
  { const { x: cx, z: cz } = STATIONS.faneuil;
    const g = [P(BOX(7, 4, 4), '#9a4a32', 0, 2, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)]; for (const p of roofGeo(7, 4, 1.6, '#3a3e48')) { p.translate(0, 4, 0); g.push(p); }
    for (let i = -3; i <= 3; i++) g.push(P(BOX(0.7, 1.4, 0.06), '#2a3440', i, 1.0, 2.02), P(BOX(0.55, 0.9, 0.06), '#2a3440', i, 3.0, 2.02));
    g.push(P(CYL(0.55, 0.6, 1.2, 8), '#efe8d6', 0, 6.2, 0), P(new THREE.ConeGeometry(0.6, 0.8, 8), '#efe8d6', 0, 7.2, 0), P(BOX(0.5, 0.14, 0.12), '#c9a227', 0, 7.8, 0));   // cupola + the gilded grasshopper
    building(M(g), cx - 1, cz + 7.5, Math.PI, 7, 4, 8.2);
    for (let i = 0; i < 5; i++) add(sheepGeo(), cx + 6 + (i % 3) * 1.2, cz - 4 + Math.floor(i / 3) * 1.4, rnd() * 6);   // sheep driven from Connecticut towns
    box(cx + 5.2, cx + 9.4, cz - 4.8, cz - 1.8);
    for (let i = 0; i < 3; i++) add(barrelGeo(), cx - 7 + i * 0.8, cz - 3); box(cx - 7.6, cx - 4.8, cz - 3.6, cz - 2.4);   // rice from South Carolina
    add(M([P(BOX(1.6, 0.9, 2.4), '#7a5a3a', 0, 0.9, 0), P(CYL(0.45, 0.45, 0.12, 10), '#3a2a1a', 0.85, 0.45, 0.8, 0, 0, Math.PI / 2), P(CYL(0.45, 0.45, 0.12, 10), '#3a2a1a', -0.85, 0.45, 0.8, 0, 0, Math.PI / 2), P(CYL(0.45, 0.45, 0.12, 10), '#3a2a1a', 0.85, 0.45, -0.8, 0, 0, Math.PI / 2), P(CYL(0.45, 0.45, 0.12, 10), '#3a2a1a', -0.85, 0.45, -0.8, 0, 0, Math.PI / 2)]), cx + 11, cz + 6.5, 0.1); box(cx + 10, cx + 12, cz + 5.1, cz + 7.9);   // the post rider's wagon (the post road south)
    line(TOWN, cx - 3, cz + 3.6, cx + 2, cz + 3.6, 4, [cx, cz]);
    // a British warship closing the harbor (the Boston Port Act, June 1, 1774)
    add(shipGeo('nao', 'square', { flag: 'britain', furled: true }), SHORE_X(cz) - 14, cz, -Math.PI / 2, 0.8, true, WATER_Y - 0.15); occBox(SHORE_X(cz) - 21, SHORE_X(cz) - 7, cz - 3, cz + 3, WATER_Y + 5);
    labels.push([STATIONS.faneuil, '6 · Faneuil Hall, 1774', 'the port is closed · the colonies help']);
  }
  // ===== 7 · Philadelphia, September 1774: Carpenters' Hall in its courtyard off Chestnut Street; delegates arriving
  { const { x: cx, z: cz } = STATIONS.gate;
    building(carpentersHallGeo(rnd), cx, cz + 13, Math.PI, 6, 6, 7.8);
    for (const [hx, hz, ry] of [[cx + 11, cz + 4, -Math.PI / 2], [cx - 11, cz + 4, Math.PI / 2], [cx + 11, cz + 13, -Math.PI / 2], [cx - 11, cz + 13, Math.PI / 2]]) building(brickHouseGeo(4.4, 3.6, 3.8, rnd, '#a5523a'), hx, hz, ry, 4.4, 3.6, 5.8);
    line(i => personGeo(['#2a2a3a', '#4a3a2a', '#5a2a2a', '#3a4a5a'][i % 4]), cx - 4, cz + 7, cx + 4, cz + 7, 5, [cx, cz + 13]);
    add(M([P(BOX(0.12, 1.0, 14), '#2a2a2a', 0, 0.5, 0)]), cx - 7, cz - 2, 0, 1, false); add(M([P(BOX(0.12, 1.0, 14), '#2a2a2a', 0, 0.5, 0)]), cx + 7, cz - 2, 0, 1, false);   // iron railings of the court
    box(cx - 7.2, cx - 6.8, cz - 9, cz + 5); box(cx + 6.8, cx + 7.2, cz - 9, cz + 5);
    labels.push([STATIONS.gate, "7 · Carpenters' Hall, 1774", 'the First Continental Congress · the Trial']);
  }

  // ===== scatter: elms and maples along the streets and on the hill, a few rocks, grass tufts
  const near = (x, z, pad) => { for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return true; } return false; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const spots = (count, ok, minPath = 3, pad = 1.5) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 80) {
      const x = -92 + rnd() * 184, z = -92 + rnd() * 184, h = groundH(x, z);
      if (h < 0.15 || pathDist(x, z) < minPath || near(x, z, 2) || blocked(x, z, pad) || !ok(x, z, h)) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name; scene.add(m); return m; };
  // town houses fill the blocks between stations (Boston was a crowded port of about 16,000 people)
  const houses = spots(46, (x, z) => z < RIVER_S - 3 && x > SHORE_X(z) + 4, 4.5, 2.6);
  const hA = brickHouseGeo(3.6, 3.2, 3.2, rnd, '#9a4a32'), hB = houseGeo(3.4, 3.0, 2.8, '#b8a888', '#4a4a50', rnd);
  inst(hA, houses.filter((_, i) => i % 2).map(([x, z]) => [x, z, 1]), true, 'houses-brick'); inst(hB, houses.filter((_, i) => !(i % 2)).map(([x, z]) => [x, z, 1]), true, 'houses-wood');
  for (const [x, z] of houses) { circ(x, z, 2.3); occC(x, z, 2.4, groundH(x, z) + 5.2); }
  const sc = () => 0.8 + rnd() * 0.45;
  const elms = spots(40, () => true).map(([x, z]) => [x, z, sc()]);
  const maples = spots(30, (x, z) => z > RIVER_N || x > 20).map(([x, z]) => [x, z, sc()]);
  const elmS = M([P(CYL(0.2, 0.28, 2.4, 6), '#5a4634', 0, 1.2, 0), P(new THREE.IcosahedronGeometry(1.8, 1), '#6a8a3a', 0, 3.4, 0, 0, 0, 0, 1.2, 0.8, 1.2, 0.25, rnd)]);
  const mapleGeo = M([P(CYL(0.18, 0.26, 2.0, 6), '#5a4634', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.6, 1), '#8a9a3a', 0, 3.0, 0, 0, 0, 0, 1.1, 0.9, 1.1, 0.3, rnd)]);
  inst(elmS, elms, true, 'elms'); inst(mapleGeo, maples, true, 'maples');
  for (const L of [elms, maples]) for (const [x, z, s] of L) { circ(x, z, 0.28 * s + 0.12); occC(x, z, 1.6 * s, groundH(x, z) + 4.5 * s, groundH(x, z) + 1.8 * s); }
  const tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#8a9a50', 0.2, rnd), rockGeo = vc(new THREE.DodecahedronGeometry(0.6, 0), '#8a8076', 0.2, rnd);
  inst(tuftGeo, spots(260, (x, z, h) => h < 8, 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6]), false, 'tufts');
  inst(rockGeo, spots(24, () => true, 2.2, 0.6).map(([x, z]) => [x, z, 0.4 + rnd() * 0.6]), true, 'rocks');
  { const g = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, R = 190 + rnd() * 40, x = Math.cos(a) * R, z = Math.sin(a) * R; const h = 8 + rnd() * 10;   // far hills
      const cone = vc(new THREE.ConeGeometry(h * 3, h, 7, 2), '#7a8a7a', 0.1, rnd); cone.translate(x, h / 2 - 3, z); g.push(cone); }
    const far = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); far.userData.noMerge = true; far.name = 'far'; scene.add(far); }
  for (const [t, x, z] of [['Boston Harbor', -52, -8], ['The post road south (story jump)', 24, 51.5]]) { const sp = labelSprite(t, 6); sp.position.set(x, 3.2, z); sp.name = 'river-label'; scene.add(sp); }
  const regionLabels = labels.map(([s, t, sub]) => { const sp = labelSprite(t, 9, sub); sp.position.set(s.x, Math.max(0, groundH(s.x, s.z)) + 9.5, s.z); sp.name = 'region-label'; scene.add(sp); return { s, sp }; });

  const rings = ringDefs.map(d => makeRing(scene, d, walkY(d.x, d.z)));
  mergeAO.buildAO();
  mergeAO.mergeStatic(statics, { cell: 40 });

  let t = 0;
  function update(dt, hero) {
    t += dt;
    for (const r of rings) { r.beam.material.opacity = (r.state === 'locked' ? 0.22 : r.state === 'new' ? 0.5 : 0.35) + 0.12 * Math.sin(t * 2.4 + r.def.x); r.icon.position.y = 2.9 + 0.12 * Math.sin(t * 1.8 + r.def.z); }
    water.position.y = WATER_Y + Math.sin(t * 1.1) * 0.03;
    if (hero) for (const L of regionLabels) { const d = Math.hypot(hero.x - L.s.x, hero.z - L.s.z); L.sp.visible = d > L.s.r + 6; }
  }
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen() {}, tracks: [], herds: {}, flames: [], water, fogColor: SKY_H, sky: scene.userData.sky, mats: [], dropBundle() {}, clearBundles() {}, regionLabels };
}
