// world/frontier.js — Section 7 walkable level: "The French and Indian War" (1753–1763).
// Abigail is a frontier girl of the 1750s. A walk, south to north: a frontier farm in Virginia (1753) → the Ohio Company
// trading post at Wills Creek on the Potomac (1754) → Washington's round Fort Necessity at the Great Meadows (July 1754) →
// the Forks of the Ohio and France's Fort Duquesne (1754–1758) → Albany (the Albany Congress, June–July 1754) → a story
// jump to 1759: Point Lévis on the St. Lawrence → a boat across to the Anse au Foulon, the steep cliff path, and the
// Plains of Abraham outside Quebec (the Trial).
// Map directions follow the earlier levels: north = +z, WEST = +x. Distances are shrunk enormously.
// Accuracy: Fort Necessity was a small ROUND stockade (about 53 ft across) with a little storehouse inside, built in the
// Great Meadows in June 1754 and surrendered by Washington on July 3, 1754. At the Forks the Allegheny (from the north)
// and the Monongahela (from the south) join to make the Ohio, flowing west; Fort Duquesne was a square fort of logs and
// earth with four bastions on the point. French flags are the white flag of the Bourbon kings with gold fleurs-de-lis;
// British flags are the Union flag of 1707 (St George + St Andrew, no St Patrick saltire, which came in 1801).
// Uniforms: French troupes de la Marine in grey-white coats with blue cuffs; Canadian militia in blanket coats (capotes)
// with sashes and wool caps; Washington's Virginians of 1754 in their own clothes and hunting shirts; British regulars in
// red coats. On September 13, 1759, Wolfe's soldiers crossed the St. Lawrence by boat at night, climbed a narrow path up
// the cliff at the Anse au Foulon and formed on the Plains of Abraham, west of the walled city of Quebec.
// Nothing here touches the save.
import * as THREE from 'three';
import { vc, P, M, rng, CYL, BOX, roofGeo, houseGeo, makeRing, barrelGeo, crateGeo, labelSprite, setRingState, RING_COL, shipGeo } from './voyage.js';
export { labelSprite, setRingState, RING_COL };

export const WATER_Y = -0.4, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const STATIONS = {
  farm: { x: -14, z: -58, r: 8, label: 'A frontier farm, 1753', n: 1, dir: 'start' },
  willscreek: { x: -34, z: -34, r: 9, label: 'Wills Creek trading post, 1754', n: 2, dir: 'north-east, to the Potomac' },
  meadows: { x: 2, z: -14, r: 10, label: 'Fort Necessity, 1754', n: 3, dir: 'north-west, over the ridges' },
  forks: { x: 30, z: 10, r: 9, label: 'The Forks of the Ohio', n: 4, dir: 'north-west, to the rivers' },
  albany: { x: -30, z: 30, r: 10, label: 'Albany, 1754', n: 5, dir: 'north-east, to the Hudson' },
  levis: { x: -8, z: 43, r: 5, label: 'Point Lévis, 1759', n: 6, dir: 'north: a story jump to 1759' },
  gate: { x: 8, z: 79, r: 8, label: 'The Plains of Abraham, 1759', n: 7, dir: 'across the river and up the cliff (Trial)' }
};
export const ROADS = [
  [[-14, -61], [-14, -52], [-26, -44], [-34, -34]],
  [[-34, -34], [-16, -26], [2, -14]],
  [[2, -14], [18, -4], [30, 10]],
  [[30, 10], [10, 22], [-30, 30]],
  [[-30, 30], [-18, 38], [-8, 43], [-8, 47]],
  [[3, 61.6], [14, 61.6], [14, 70], [8, 79]]
];
export function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
const polyDist = (x, z, pts) => { let d = 1e9; for (let i = 1; i < pts.length; i++) d = Math.min(d, distSeg(x, z, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])); return d; };
export const PATH = ROADS[0];
export const BOUNDS = { x0: -70, x1: 70, z0: -72, z1: 90 };
// the rivers: the Forks of the Ohio (the point at FORK), the Hudson at Albany, and the St. Lawrence below Quebec
export const FORK = [50, 16];
const ALLEGHENY = [FORK, [45, 30], [42, 46]], MONONGAHELA = [FORK, [45, 2], [47, -24], [55, -60], [58, -80]], OHIO = [FORK, [62, 26], [80, 40]];
const HUDSON = [[-47, 8], [-47.5, 30], [-49, 46]];
export const RIVER_S = 49.6, RIVER_N = 59.8, CLIFF_Z0 = 63.0, CLIFF_Z1 = 66.6, PLATEAU = 6.5, RAMP_X = 14;
const rampW = x => smooth(3.2, 1.8, Math.abs(x - RAMP_X));
export const riverZ = () => -9999;
function rawH(x, z) {
  let h = 0.6 + 0.35 * Math.sin(x * 0.08) * Math.cos(z * 0.07);
  h += 1.5 * smooth(-30, 30, z) * smooth(46, 40, z) * (0.5 + 0.5 * Math.sin(x * 0.07 + z * 0.12)) * smooth(2, 8, pathDist(x, z));   // Appalachian ridges
  h += 0.9 * (1 - smooth(-60, -40, z)) * (0.5 + 0.5 * Math.sin(x * 0.13 + 1.2)) * smooth(3, 9, pathDist(x, z));                   // the Virginia hills
  let w = 0;
  w = Math.max(w, smooth(3.6, 1.7, polyDist(x, z, ALLEGHENY)) * smooth(46, 40, z));
  w = Math.max(w, smooth(3.8, 1.8, polyDist(x, z, MONONGAHELA)));
  w = Math.max(w, smooth(4.6, 2.2, polyDist(x, z, OHIO)));
  w = Math.max(w, smooth(3.4, 1.6, polyDist(x, z, HUDSON)) * smooth(8, 14, z) * smooth(46, 41, z));
  // north of the St. Lawrence: a narrow beach, then the cliff (with one steep path at RAMP_X), then the plateau
  if (z > RIVER_S - 3) {
    const beach = 0.35, cliff = smooth(CLIFF_Z0 + 0.2, CLIFF_Z1 - 0.4, z), ramp = smooth(60.8, 70.5, z), b = rampW(x);
    const north = beach + (PLATEAU - beach) * (cliff * (1 - b) + ramp * b) + 0.25 * smooth(68, 80, z) * Math.sin(x * 0.1 + z * 0.08);
    h = h * (1 - smooth(RIVER_S - 3, RIVER_S, z)) + (z > RIVER_N ? north : 0.4) * smooth(RIVER_S - 3, RIVER_S, z);
    w = Math.max(w, smooth(RIVER_S - 0.6, RIVER_S + 1.2, z) * smooth(RIVER_N + 0.6, RIVER_N - 1.2, z));
  }
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
export const STONES = [], FORD_ROWS = 0, FORD_RESPAWN = { x: -14, z: -58, yaw: 0 };
export function onStone() { return null; }
export function walkY(x, z) { return groundH(x, z); }
// the cliff face blocks her except on the one steep path the soldiers climbed
export function cliffAt(x, z) { return z > CLIFF_Z0 - 0.2 && z < CLIFF_Z1 + 0.2 && rampW(x) < 0.5; }
export function solid(x, z) { return groundH(x, z) < WATER_Y + 0.25 || cliffAt(x, z); }
// the story-jump crossing of the St. Lawrence (the boat rings fade her across; nothing is saved but at.s7)
export const HARBORS = {
  south: { x: -8, z: 46.2, yaw: Math.PI, label: 'Point Lévis, the south shore' },
  north: { x: 6.5, z: 61.6, yaw: 0, label: 'The Anse au Foulon, below the cliff' }
};
export const MATS = [];
export const MAT_HALF = 1.2;
export const RING_AT = {
  l0: [-14, -53.5], mission: [-9.5, -55.5], cabin: [-18.5, -55.5],
  l2: [-33.5, -31.8], sides: [-37, -33], furtrade7: [-29.5, -36], market: [-38.5, -36.5],
  l1: [-2.5, -15.5], l7: [1.5, -19], washington: [6, -17], necessity: [10, -14],
  l4: [27, 14], duquesne: [34.5, 15.5], braddock: [29.5, 5],
  l3: [-27.5, 32.3], l8: [-33, 34.5], hendrick: [-24.5, 29.5], snake7: [-35.5, 29.5],
  wolfe: [-12, 44], 'boat-south': [-5, 47.4], 'boat-north': [3, 61.6],
  l5: [4, 76], l6: [12, 76], plains: [8, 72.2], geomap: [3.5, 81.5], timeline: [12.5, 81.5], trial: [8, 85.5]
};

// ---------------- props ----------------
function unionFlagGeo(h = 7) {   // the British Union flag of 1707 (crosses of St. George and St. Andrew)
  const g = [P(CYL(0.07, 0.09, h, 6), '#6b4f36', 0, h / 2, 0)], fy = h - 0.6, fx = 1.0;
  g.push(P(BOX(1.9, 1.2, 0.04), '#1f3a7a', fx, fy, 0), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, 0.56), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, -0.56));
  g.push(P(BOX(1.9, 0.32, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(0.36, 1.2, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(1.9, 0.18, 0.07), '#c0302a', fx, fy, 0), P(BOX(0.2, 1.2, 0.07), '#c0302a', fx, fy, 0));
  return M(g);
}
let FR_TEX = null;
function frenchFlagTex() {   // the white flag of the Bourbon kings, sown with gold fleurs-de-lis
  if (FR_TEX) return FR_TEX;
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d');
  x.fillStyle = '#f6f3ea'; x.fillRect(0, 0, 256, 160);
  const lis = (cx, cy, s) => { x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = '#c9a227'; x.strokeStyle = '#8a6a12'; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(0, -18); x.bezierCurveTo(7, -10, 6, -2, 0, 6); x.bezierCurveTo(-6, -2, -7, -10, 0, -18); x.fill(); x.stroke();
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 2, 2); x.bezierCurveTo(sd * 14, -8, sd * 20, 2, sd * 12, 10); x.bezierCurveTo(sd * 12, 4, sd * 8, 2, sd * 2, 6); x.fill(); x.stroke(); }
    x.fillRect(-9, 5, 18, 4); x.beginPath(); x.moveTo(-3, 9); x.lineTo(3, 9); x.lineTo(0, 18); x.fill(); x.restore(); };
  for (const [px, py] of [[64, 50], [192, 50], [128, 110], [64, 140], [192, 140], [128, 20]]) lis(px, py, 1.25);
  FR_TEX = new THREE.CanvasTexture(c); FR_TEX.colorSpace = THREE.SRGBColorSpace; FR_TEX.generateMipmaps = false; FR_TEX.minFilter = THREE.LinearFilter; return FR_TEX;
}
function frenchFlag(scene, x, y, z, ry = 0, h = 7) {   // a pole (merged by the caller) + the flag cloth (its own mesh, both sides)
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.25), new THREE.MeshLambertMaterial({ map: frenchFlagTex(), side: THREE.DoubleSide }));
  m.position.set(x + Math.cos(ry) * 1.05, y + h - 0.6, z - Math.sin(ry) * 1.05); m.rotation.y = ry; m.userData.noMerge = true; m.name = 'french-flag'; scene.add(m); return m;
}
function logCabinGeo(w, d, h, rnd, roof = '#6a5a4a') {   // a log cabin: notched logs, a shake roof and a stick-and-clay chimney
  const g = [P(BOX(w, h, d), '#7a5a3a', 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd)];
  for (let i = 0; i < 6; i++) { const y = 0.25 + i * (h / 6); g.push(P(CYL(0.16, 0.16, w + 0.5, 5), i % 2 ? '#6a4a2e' : '#80603e', 0, y, d / 2 + 0.02, 0, 0, Math.PI / 2), P(CYL(0.16, 0.16, w + 0.5, 5), '#6a4a2e', 0, y, -d / 2 - 0.02, 0, 0, Math.PI / 2)); }
  for (const p of roofGeo(w, d, 1.3, roof)) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(0.9, 1.6, 0.08), '#4a3420', 0, 0.8, d / 2 + 0.2), P(BOX(0.55, 0.5, 0.08), '#2a2018', w * 0.3, h * 0.6, d / 2 + 0.2));
  g.push(P(BOX(0.9, h + 1.9, 0.8), '#8a7a62', w / 2 + 0.45, (h + 1.9) / 2, 0, 0, 0, 0, 1, 1, 1, 0.1, rnd));
  return M(g);
}
function wormFenceGeo(len) {   // a zig-zag split-rail ("worm") fence along local x
  const g = [], seg = 1.6, n = Math.round(len / seg);
  for (let i = 0; i < n; i++) { const a = i % 2 ? 0.35 : -0.35; for (let r = 0; r < 3; r++) g.push(P(BOX(seg * 1.08, 0.08, 0.1), '#7a6248', (i + 0.5) * seg - len / 2, 0.25 + r * 0.28, 0, 0, a, 0)); }
  return M(g);
}
function personGeo(coat, hat = '#2a2622') { return M([P(CYL(0.18, 0.24, 0.9, 6), coat, 0, 0.45, 0), P(new THREE.SphereGeometry(0.15, 6, 5), '#e0b890', 0, 1.05, 0), P(CYL(0.2, 0.2, 0.06, 8), hat, 0, 1.18, 0)]); }
// soldiers: coat, cuff/facing colour, hat ('tri' tricorne, 'cap' wool tuque, 'round' felt hat), musket on the shoulder
function soldierGeo(coat, cuff, hat = 'tri', legs = '#e8e2d2', sash) {
  const g = [P(CYL(0.08, 0.08, 0.5, 5), legs, -0.09, 0.25, 0), P(CYL(0.08, 0.08, 0.5, 5), legs, 0.09, 0.25, 0), P(CYL(0.17, 0.26, 0.62, 6), coat, 0, 0.72, 0),
    P(BOX(0.1, 0.42, 0.12), coat, -0.25, 0.8, 0), P(BOX(0.1, 0.42, 0.12), coat, 0.25, 0.8, 0), P(BOX(0.12, 0.1, 0.14), cuff, -0.25, 0.6, 0), P(BOX(0.12, 0.1, 0.14), cuff, 0.25, 0.6, 0),
    P(new THREE.SphereGeometry(0.14, 6, 5), '#e0b890', 0, 1.15, 0), P(CYL(0.012, 0.016, 1.2, 4), '#4a3a2a', 0.27, 1.0, -0.05, 0.12, 0, 0)];
  if (sash) g.push(P(CYL(0.2, 0.22, 0.08, 6), sash, 0, 0.6, 0));
  if (hat === 'tri') g.push(P(CYL(0.24, 0.24, 0.07, 3), '#1e1c1a', 0, 1.27, 0));
  else if (hat === 'cap') g.push(P(new THREE.ConeGeometry(0.14, 0.3, 6), '#b8302a', 0, 1.34, -0.04, -0.4, 0, 0));
  else g.push(P(CYL(0.22, 0.22, 0.04, 8), '#3a3026', 0, 1.24, 0), P(CYL(0.12, 0.13, 0.12, 8), '#3a3026', 0, 1.3, 0));
  return M(g);
}
function nativeGeo(shirt = '#e8e0d0', legs = '#6a4a2e', blanket) {   // a man of the Ohio nations or the Haudenosaunee: trade shirt, leggings, a feather
  const g = [P(CYL(0.08, 0.08, 0.5, 5), legs, -0.09, 0.25, 0), P(CYL(0.08, 0.08, 0.5, 5), legs, 0.09, 0.25, 0), P(CYL(0.17, 0.24, 0.62, 6), shirt, 0, 0.72, 0),
    P(new THREE.SphereGeometry(0.14, 6, 5), '#b8825a', 0, 1.15, 0), P(BOX(0.03, 0.26, 0.06), '#f2eee2', 0, 1.36, -0.08, -0.3, 0, 0)];
  if (blanket) g.push(P(CYL(0.22, 0.27, 0.5, 6, 1, true), blanket, 0, 0.8, 0));
  return M(g);
}
function canoeGeo() { return M([P(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#8a6a42', 0, 0.38, 0, Math.PI, 0, 0, 0.55, 0.3, 2.8)]); }
function bateauGeo() { return M([P(BOX(1.3, 0.45, 4.2), '#6a4a2c', 0, 0.2, 0), P(BOX(1.1, 0.06, 3.8), '#4a3420', 0, 0.42, 0), P(new THREE.ConeGeometry(0.65, 0.9, 4), '#6a4a2c', 0, 0.2, 2.5, Math.PI / 2, Math.PI / 4, 0, 1, 1, 0.45)]); }
function steepleGeo(w, d, h, rnd, wall = '#c8c0b0', tower = 4.5, spire = 3.2) {
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)];
  for (const p of roofGeo(w, d, 2.4, '#5a5450')) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(1.8, tower, 1.8), wall, 0, tower / 2, d / 2 + 0.9), P(BOX(1.3, 1.2, 1.3), '#b8b0a0', 0, tower + 0.6, d / 2 + 0.9), P(new THREE.ConeGeometry(0.75, spire, 8), '#4a4e58', 0, tower + 1.2 + spire / 2, d / 2 + 0.9));
  return M(g);
}
function joinOrDieTex() {   // Franklin's cartoon (Pennsylvania Gazette, May 9, 1754): a snake cut into 8 pieces
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#efe4c8'; x.fillRect(0, 0, 512, 256); x.strokeStyle = '#2a2018'; x.lineWidth = 14; x.lineCap = 'round';
  const segs = ['S.C.', 'N.C.', 'V.', 'M.', 'P.', 'N.J.', 'N.Y.', 'N.E.'];
  segs.forEach((s, i) => { const x0 = 30 + i * 58; x.beginPath(); x.moveTo(x0, 130 + 30 * Math.sin(i)); x.quadraticCurveTo(x0 + 22, 130 + 30 * Math.sin(i + 0.5) - 20, x0 + 44, 130 + 30 * Math.sin(i + 1)); x.stroke(); x.fillStyle = '#2a2018'; x.font = 'bold 18px Georgia, serif'; x.fillText(s, x0 + 4, 205); });
  x.font = 'bold 44px Georgia, serif'; x.textAlign = 'center'; x.fillText('JOIN, or DIE.', 256, 60);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshLambertMaterial({ map: tex })); m.userData.noMerge = true; return m;
}

// ---------------- build ----------------
export function buildFrontier({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(17541759);
  const scene = new THREE.Scene(); scene.name = 'frontier';
  const SKY_TOP = new THREE.Color('#5d9bd2'), SKY_H = new THREE.Color('#f0e6d4');
  scene.fog = new THREE.Fog(SKY_H, 90, 300);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), LOW = new THREE.Color('#a8a890');
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; if (y < 0) c.copy(SKY_H).lerp(LOW, Math.min(1, -y * 6)); else c.copy(SKY_H).lerp(SKY_TOP, Math.pow(y, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky; }
  const hemi = new THREE.HemisphereLight('#f2f0ff', '#857a5a', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe8c8', 2.1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  const C = k => new THREE.Color(k);
  const GREEN = C('#6f8f3f'), OLIVE = C('#8a8a42'), GOLD = C('#b09040'), RUST = C('#a86a34'), MEADOW = C('#9aae5a'), SAND = C('#d8c8a0'), ROCK = C('#8a8478'), PATHC = C('#a8906a'), SHALLOW = C('#5a98a4'), DEEP = C('#1f4c66'), FIELD = C('#c8a860');
  const terrColor = (x, z, c) => {
    const h = groundH(x, z);
    if (h < WATER_Y) { c.copy(DEEP).lerp(SHALLOW, smooth(-3.0, -0.8, h)); return c; }
    const f = 0.5 + 0.5 * Math.sin(x * 0.19 + z * 0.13);
    c.copy(GREEN).lerp(OLIVE, smooth(-40, 20, z) * 0.6).lerp(f > 0.6 ? RUST : GOLD, 0.22 + 0.2 * f);
    c.multiplyScalar(0.93 + 0.09 * Math.sin(x * 0.23) * Math.cos(z * 0.19));
    c.lerp(SAND, 1 - smooth(0.2, 0.75, h));
    if (Math.hypot(x - 4, z + 10) < 13) c.lerp(MEADOW, 0.5 * smooth(13, 8, Math.hypot(x - 4, z + 10)));   // the Great Meadows
    if (z > CLIFF_Z0 - 0.5 && z < CLIFF_Z1 + 0.3) c.lerp(ROCK, 0.85 * (1 - rampW(x) * 0.6));             // the cliff face
    if (x > -8 && x < -1 && z > -66 && z < -59) c.lerp(FIELD, 0.6);                                       // the farm's corn patch
    const pd = pathDist(x, z); c.lerp(PATHC, (1 - smooth(1.0, 2.4, pd)) * 0.7);
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
  { const g = new THREE.PlaneGeometry(1000, 1000); g.rotateX(-Math.PI / 2); const f = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#1f4c66' })); f.position.y = -3.05; f.userData.noMerge = true; f.name = 'river-bed'; scene.add(f); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 1, 1), new THREE.MeshLambertMaterial({ color: '#3a7f9a', transparent: true, opacity: 0.8, depthWrite: false }));
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
  // uniforms
  const MARINE = () => soldierGeo('#d8d4c8', '#2a3f8a', 'tri', '#d8d4c8');          // troupes de la Marine: grey-white, blue cuffs
  const MILITIA = () => soldierGeo('#3a5a8a', '#3a5a8a', 'cap', '#5a4a3a', '#c0302a'); // Canadian militia: blanket coat, sash, tuque
  const VIRGINIAN = i => soldierGeo(i % 2 ? '#c8b88a' : '#6a5a44', '#c8b88a', 'round', '#8a7a62');   // Virginians of 1754: hunting shirts, own clothes
  const REDCOAT = () => soldierGeo('#b22222', '#d8b84a', 'tri', '#e8e2d2');            // British regulars
  const FR_REG = () => soldierGeo('#e2ded2', '#b8302a', 'tri', '#e2ded2');             // French regulars at Quebec (troupes de terre)

  // ===== 1 · A frontier farm in Virginia, 1753: a log cabin, a worm fence, a corn patch, stumps of new-cleared land
  { const { x: cx, z: cz } = STATIONS.farm;
    building(logCabinGeo(4.4, 3.4, 2.4, rnd), cx - 1, cz - 6.5, 0, 5.6, 3.6, 4.2);
    add(wormFenceGeo(9), cx + 9, cz - 6.6, Math.PI / 2, 1, false); box(cx + 8.7, cx + 9.3, cz - 11, cz - 2);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) add(M([P(CYL(0.04, 0.05, 1.5, 4), '#b8a050', 0, 0.75, 0), P(BOX(0.5, 0.05, 0.12), '#c8a858', 0, 1.0, 0, 0, i, 0.5)]), cx + 7 - i * 1.1, cz - 7.5 + r * 1.4 - 0.5, 0, 1, false);
    for (const [sx, sz] of [[cx - 7, cz + 2], [cx - 5, cz + 5], [cx + 4, cz + 4.5], [cx - 8, cz - 3]]) { add(M([P(CYL(0.3, 0.36, 0.45, 7), '#7a5a3a', 0, 0.22, 0), P(CYL(0.3, 0.3, 0.02, 7), '#d8c098', 0, 0.45, 0)]), sx, sz); circ(sx, sz, 0.4); }
    add(M([0, 1, 2].map(i => P(CYL(0.12, 0.12, 1.6, 5), '#8a6a44', 0, 0.15 + i * 0.22, 0, 0, 0, Math.PI / 2))), cx - 5.5, cz - 4, 0.3); box(cx - 6.4, cx - 4.6, cz - 4.5, cz - 3.5);
    add(unionFlagGeo(5), cx + 3.5, cz - 4.5);
    labels.push([STATIONS.farm, '1 · A frontier farm, 1753', 'Virginia · rivals for the Ohio Valley']);
  }
  // ===== 2 · The Ohio Company trading post at Wills Creek on the Potomac (later Fort Cumberland)
  { const { x: cx, z: cz } = STATIONS.willscreek;
    building(logCabinGeo(5.4, 3.8, 2.6, rnd, '#5a4a3a'), cx - 1, cz + 7, Math.PI, 6.6, 4, 4.4);   // the storehouse
    building(logCabinGeo(3.6, 3.0, 2.2, rnd), cx + 7, cz + 4, -Math.PI / 2, 3.8, 4.6, 3.9);
    for (let i = 0; i < 4; i++) add(M([P(BOX(0.9, 0.35, 0.6), i % 2 ? '#6a4a2e' : '#8a6038', 0, 0.18, 0), P(BOX(0.92, 0.04, 0.62), '#3a2a1a', 0, 0.3, 0)]), cx + 3 + (i % 2) * 1.0, cz + 2.5 + Math.floor(i / 2) * 0.7, 0.2);   // bundled beaver pelts
    box(cx + 2.4, cx + 4.6, cz + 2.1, cz + 3.9);
    add(barrelGeo(), cx - 5, cz + 3.6); add(barrelGeo(), cx - 5.8, cz + 3.0); add(crateGeo('#8a6a48'), cx - 4.6, cz + 2.6, 0.3); box(cx - 6.3, cx - 4.1, cz + 2.2, cz + 4.1);
    figure(nativeGeo('#e8e0d0', '#5a3a28', '#2a4a7a'), cx + 4.8, cz + 0.6, [cx + 3.5, cz + 3]); figure(nativeGeo('#d8c8a8', '#6a4a2e'), cx + 2.2, cz + 0.4, [cx + 3.5, cz + 3]);
    figure(personGeo('#5a4a3a'), cx + 3.6, cz + 4.6, [cx + 3.5, cz + 2]);
    labels.push([STATIONS.willscreek, '2 · Wills Creek trading post', 'the fur trade · Native allies']);
  }
  // ===== 3 · The Great Meadows: Fort Necessity, a small ROUND stockade with a storehouse inside (June–July 1754)
  { const { x: cx, z: cz } = STATIONS.meadows, fx = cx + 5, fz = cz + 7, R = 4.2, g = [];
    for (let a = 0; a < Math.PI * 2; a += 0.12) { if (Math.abs(((a - Math.PI * 1.5) + Math.PI * 3) % (Math.PI * 2) - Math.PI) < 0.28) continue;   // the gate gap faces south
      const px = Math.cos(a) * R, pz = Math.sin(a) * R, hh = 2.3 + rnd() * 0.3; g.push(P(CYL(0.13, 0.15, hh, 5), '#7a5a3a', px, hh / 2, pz, 0, 0, 0, 1, 1, 1, 0.08, rnd), P(new THREE.ConeGeometry(0.14, 0.3, 5), '#6a4a2e', px, hh + 0.15, pz)); }
    g.push(P(BOX(2.6, 1.6, 2.0), '#80603e', 0, 0.8, 0.6, 0, 0, 0, 1, 1, 1, 0.06, rnd)); for (const p of roofGeo(2.6, 2.0, 0.8, '#6a5a44')) { p.translate(0, 1.6, 0.6); g.push(p); }   // the storehouse
    add(M(g), fx, fz);
    for (let a = 0; a < Math.PI * 2; a += 0.12) { if (Math.abs(((a - Math.PI * 1.5) + Math.PI * 3) % (Math.PI * 2) - Math.PI) < 0.4) continue; circ(fx + Math.cos(a) * R, fz + Math.sin(a) * R, 0.26); }
    circ(fx, fz + 0.6, 1.5);
    add(M([P(new THREE.TorusGeometry(6.4, 0.45, 5, 40, Math.PI * 1.6), '#7a6a44', 0, 0, 0, Math.PI / 2, 0, 0, 1, 1, 0.6)]), fx, fz, -Math.PI * 0.2 + Math.PI, 1, false);   // the shallow trenches outside
    add(unionFlagGeo(6), fx + 1.2, fz - 1.2);
    line(VIRGINIAN, fx - 3, fz + 7, fx + 3, fz + 7.6, 4, [fx, fz]);
    add(M([P(CYL(0.12, 0.16, 1.3, 6), '#3a3a3a', 0, 0.35, 0, Math.PI / 2 - 0.1, 0, 0), P(CYL(0.3, 0.3, 0.12, 8), '#5a3d24', 0.25, 0.3, 0.2, 0, 0, Math.PI / 2), P(CYL(0.3, 0.3, 0.12, 8), '#5a3d24', -0.25, 0.3, 0.2, 0, 0, Math.PI / 2)]), fx - 3.2, fz - 3.6, Math.PI + 0.6);   // a swivel gun
    labels.push([STATIONS.meadows, '3 · Fort Necessity, 1754', 'the Great Meadows · George Washington']);
  }
  // ===== 4 · The Forks of the Ohio: Fort Duquesne on the point (French, 1754–1758)
  { const { x: cx, z: cz } = STATIONS.forks, fx = 41.5, fz = 16, s = 3.2, g = [];
    for (const [x, z, w, d] of [[0, s, 2 * s, 0.6], [0, -s, 2 * s, 0.6], [s, 0, 0.6, 2 * s], [-s, 0, 0.6, 2 * s]]) { g.push(P(BOX(w, 1.8, d), '#7a5a3a', x, 0.9, z, 0, 0, 0, 1, 1, 1, 0.06, rnd)); for (let i = 0; i < 4; i++) g.push(P(BOX(w + 0.02, 0.06, d + 0.02), '#5a4028', x, 0.3 + i * 0.42, z)); }
    for (const [x, z] of [[s, s], [s, -s], [-s, s], [-s, -s]]) g.push(P(BOX(1.9, 1.9, 1.9), '#6e5034', x, 0.95, z, 0, Math.PI / 4, 0, 1, 1, 1, 0.06, rnd));
    g.push(P(BOX(3.0, 1.8, 1.6), '#c8c0b0', 0, 0.9, -1.2)); for (const p of roofGeo(3.0, 1.6, 0.9, '#5a4a3a')) { p.translate(0, 1.8, -1.2); g.push(p); }
    g.push(P(BOX(1.8, 0.5, 0.06), '#3a2a1a', 0, 0.25, s + 0.32));   // the gate (east, toward the land)
    g.push(P(CYL(0.07, 0.09, 7, 6), '#6b4f36', 0.6, 3.5, 0.6));
    add(M(g), fx, fz, -Math.PI / 2, 1, true, gy(fx, fz)); box(fx - s - 1.2, fx + s + 1.2, fz - s - 1.2, fz + s + 1.2); occBox(fx - s - 1, fx + s + 1, fz - s - 1, fz + s + 1, gy(fx, fz) + 3);
    frenchFlag(scene, fx + 0.6, gy(fx, fz), fz - 0.6, 0, 7);
    line(() => MARINE(), fx - 5.5, fz - 4.5, fx - 5.5, fz + 3, 4, [cx, cz]);
    figure(MILITIA(), fx - 7.2, fz + 5.2, [cx, cz]); figure(MILITIA(), fx - 3.5, fz - 6.2, [cx, cz]);
    figure(nativeGeo('#e8d8b8', '#5a3a28', '#7a2a24'), cx + 3, cz - 3, [cx, cz]);
    add(canoeGeo(), 50, 4, 0.1, 1, true, WATER_Y + 0.05); add(canoeGeo(), 53, 25, 0.9, 1, true, WATER_Y + 0.05);
    labels.push([STATIONS.forks, '4 · The Forks of the Ohio', 'Fort Duquesne · the war begins']);
  }
  // ===== 5 · Albany, June–July 1754: the Albany Congress at the Stadt Huys beside the Hudson, with Haudenosaunee leaders
  { const { x: cx, z: cz } = STATIONS.albany, g = [P(BOX(6, 4.2, 5), '#b8a088', 0, 2.1, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
    for (let i = 0; i < 4; i++) g.push(P(BOX(6 - i * 1.4, 0.7, 0.4), '#b8a088', 0, 4.55 + i * 0.7, 2.3));   // a Dutch stepped gable
    for (const p of roofGeo(6, 5, 2.8, '#6a4a3a')) { p.translate(0, 4.2, 0); g.push(p); }
    g.push(P(BOX(1.1, 2.0, 0.08), '#3a2a1a', 0, 1.0, 2.53), P(BOX(0.7, 0.9, 0.06), '#2a3440', -1.8, 2.8, 2.53), P(BOX(0.7, 0.9, 0.06), '#2a3440', 1.8, 2.8, 2.53));
    building(M(g), cx, cz + 9, Math.PI, 6, 5, 8);
    for (const [hx, hz] of [[cx - 9, cz + 7], [cx + 8, cz + 8]]) { const h2 = [P(BOX(3.4, 3.4, 3.2), '#a8553a', 0, 1.7, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)]; for (let i = 0; i < 3; i++) h2.push(P(BOX(3.4 - i * 1.0, 0.6, 0.3), '#a8553a', 0, 3.7 + i * 0.6, 1.5)); for (const p of roofGeo(3.4, 3.2, 2.2, '#5a4a44')) { p.translate(0, 3.4, 0); h2.push(p); } h2.push(P(BOX(0.8, 1.6, 0.06), '#3a2a1a', 0, 0.8, 1.62)); building(M(h2), hx, hz, Math.PI, 3.4, 3.2, 6.2); }
    const jd = joinOrDieTex(); jd.position.set(cx - 5.5, gy(cx - 5.5, cz - 2) + 1.9, cz - 2); jd.rotation.y = Math.PI; jd.name = 'join-or-die'; scene.add(jd);
    add(M([P(CYL(0.06, 0.06, 2.6, 5), '#5a3d24', -1.6, 1.3, 0), P(CYL(0.06, 0.06, 2.6, 5), '#5a3d24', 1.6, 1.3, 0)]), cx - 5.5, cz - 1.9, 0); box(cx - 7.3, cx - 3.7, cz - 2.1, cz - 1.7);
    add(unionFlagGeo(), cx + 4, cz + 5);
    for (let i = 0; i < 3; i++) figure(nativeGeo(['#e8e0d0', '#3a4a6a', '#7a2a24'][i], '#5a3a28', i === 1 ? null : '#2a3a5a'), cx - 1.5 + i * 1.5, cz + 5.2, [cx, cz]);
    figure(personGeo('#3a3a4a'), cx + 3.2, cz + 5.0, [cx, cz]); figure(personGeo('#6a3a2a'), cx + 4.4, cz + 4.4, [cx, cz]);
    add(canoeGeo(), -47.5, 24, 0.05, 1, true, WATER_Y + 0.05); add(canoeGeo(), -46.8, 34, -0.1, 1, true, WATER_Y + 0.05);
    labels.push([STATIONS.albany, '5 · Albany, 1754', 'the Albany Congress · Join, or Die']);
  }
  // ===== 6 · Point Lévis, 1759 (a story jump): the British camp on the south shore, ships and boats in the St. Lawrence
  { const { x: cx, z: cz } = STATIONS.levis;
    for (const [tx, tz] of [[cx - 5, cz - 3], [cx - 7.5, cz - 1], [cx + 4.5, cz - 3.5]]) { add(M([P(new THREE.ConeGeometry(1.1, 1.5, 4), '#efe8d6', 0, 0.75, 0, 0, Math.PI / 4, 0, 1, 1, 1.4)]), tx, tz); circ(tx, tz, 1.0); }   // bell tents
    figure(REDCOAT(), cx - 2.5, cz - 1.5, [cx, cz + 10]); figure(REDCOAT(), cx + 2.8, cz - 0.5, [cx, cz + 10]);
    add(unionFlagGeo(6), cx + 3.5, cz - 3);
    add(shipGeo('nao', 'square', { flag: 'britain', furled: true }), 26, 55, Math.PI / 2 + 0.1, 0.7, true, WATER_Y - 0.15); occBox(20, 32, 52, 58, WATER_Y + 4.5);
    add(shipGeo('caravel', 'square', { flag: 'britain', furled: true }), -30, 54.5, Math.PI / 2 - 0.1, 0.6, true, WATER_Y - 0.15); occBox(-35, -25, 52, 57, WATER_Y + 4);
    add(bateauGeo(), -5, 50.8, 0.2, 1, true, WATER_Y - 0.05); add(bateauGeo(), 4, 59.2, 0.4, 1, true, WATER_Y - 0.05); add(bateauGeo(), 8, 58.8, -0.3, 1, true, WATER_Y - 0.05);
    labels.push([STATIONS.levis, '6 · Point Lévis, 1759', 'story jump · across the St. Lawrence']);
  }
  // ===== 7 · Quebec, September 13, 1759: the cliff path, the Plains of Abraham, the two armies, the walled city to the east
  { const { x: cx, z: cz } = STATIONS.gate, wx = -16;
    add(M([P(BOX(1.2, 3.4, 24), '#a8a090', 0, 1.7, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd), P(BOX(1.4, 0.4, 24), '#8a8478', 0, 3.5, 0)]), wx, 79); box(wx - 0.7, wx + 0.7, 67, 91); occBox(wx - 0.7, wx + 0.7, 67, 91, gy(wx, 79) + 4);
    building(steepleGeo(4, 6, 3.8, rnd), wx - 6, 78, -Math.PI / 2, 6, 6, 9.5);
    for (const [hx, hz] of [[wx - 4, 70.5], [wx - 5, 86], [wx - 11, 84], [wx - 11, 72]]) building(houseGeo(3.6, 3.2, 3.2, '#c8c0b0', '#3a3e48', rnd), hx, hz, -Math.PI / 2, 3.6, 3.2, 4.6);
    add(M([P(CYL(0.07, 0.09, 7, 6), '#6b4f36', 0, 3.5, 0)]), wx - 2.2, 79); frenchFlag(scene, wx - 2.2, gy(wx - 2.2, 79), 79, -Math.PI / 2, 7);
    line(() => FR_REG(), -5, 73, -5, 86, 7, [cx, 79]);
    line(i => i % 3 === 2 ? MILITIA() : MARINE(), -8, 75, -8, 84, 4, [cx, 79]);
    line(() => REDCOAT(), 23, 72, 23, 87, 8, [cx, 79]);
    add(unionFlagGeo(6), 25.5, 79);
    labels.push([STATIONS.gate, '7 · The Plains of Abraham, 1759', 'the fall of Quebec · the Trial']);
  }

  // ===== scatter: the eastern woodlands in autumn: maples, oaks, white pines, birches in the north
  const near = (x, z, pad) => { for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return true; } return false; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const keepOut = (x, z) => (z > CLIFF_Z0 - 4 && z < CLIFF_Z1 + 1) || (x > -26 && x < 30 && z > 68) || Math.hypot(x - 7, z + 7) < 9 || (x > -9 && x < 0 && z > -67 && z < -58);
  const spots = (count, ok, minPath = 3, pad = 1.5) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 80) {
      const x = -92 + rnd() * 184, z = -92 + rnd() * 184, h = groundH(x, z);
      if (h < 0.15 || pathDist(x, z) < minPath || near(x, z, 2) || blocked(x, z, pad) || keepOut(x, z) || !ok(x, z, h)) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name; scene.add(m); return m; };
  const sc = () => 0.8 + rnd() * 0.45;
  const pines = spots(70, () => true).map(([x, z]) => [x, z, sc()]);
  const oaks = spots(55, (x, z) => z < 50).map(([x, z]) => [x, z, sc()]);
  const maples = spots(60, () => true).map(([x, z]) => [x, z, sc()]);
  const birches = spots(24, (x, z) => z > 20, 2.5, 1.2).map(([x, z]) => [x, z, 0.8 + rnd() * 0.3]);
  const oakGeo = M([P(CYL(0.2, 0.28, 2.0, 6), '#5e4a34', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.9, 1), '#8a7a2e', 0, 2.8, 0, 0, 0, 0, 1.3, 0.7, 1.3, 0.25, rnd)]);
  const mapleGeo = M([P(CYL(0.18, 0.26, 2.0, 6), '#5a4634', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.7, 1), '#c8502a', 0, 3.0, 0, 0, 0, 0, 1.1, 0.9, 1.1, 0.3, rnd)]);
  const birchGeo = M([P(CYL(0.1, 0.14, 3.4, 6), '#e8e4da', 0, 1.7, 0), P(new THREE.IcosahedronGeometry(1.1, 0), '#d8b03a', 0, 3.8, 0, 0, 0, 0, 0.9, 1.2, 0.9, 0.2, rnd)]);
  const pineGeo = M([P(CYL(0.14, 0.2, 3.2, 6), '#6e5038', 0, 1.6, 0), P(new THREE.ConeGeometry(1.4, 2.6, 7), '#2f5a32', 0, 3.8, 0, 0, 0, 0, 1, 1, 1, 0.15, rnd), P(new THREE.ConeGeometry(1.0, 2.0, 7), '#36643a', 0, 5.0, 0)]);
  inst(pineGeo, pines, true, 'pines'); inst(oakGeo, oaks, true, 'oaks'); inst(mapleGeo, maples, true, 'maples'); inst(birchGeo, birches, true, 'birches');
  for (const L of [pines, oaks, maples, birches]) for (const [x, z, s] of L) { circ(x, z, 0.28 * s + 0.12); occC(x, z, 1.6 * s, groundH(x, z) + 4.5 * s, groundH(x, z) + 1.8 * s); }
  const tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#9a9a50', 0.2, rnd), rockGeo = vc(new THREE.DodecahedronGeometry(0.6, 0), '#8a8076', 0.2, rnd);
  inst(tuftGeo, spots(340, (x, z, h) => h < 8, 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6]), false, 'tufts');
  inst(rockGeo, spots(40, () => true, 2.2, 0.6).map(([x, z]) => [x, z, 0.4 + rnd() * 0.6]), true, 'rocks');
  { const g = []; for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, R = 190 + rnd() * 40, x = Math.cos(a) * R, z = Math.sin(a) * R; const h = 12 + rnd() * 14;   // the Appalachians and the Laurentians
      const cone = vc(new THREE.ConeGeometry(h * 2.6, h, 7, 2), '#7a8a7a', 0.1, rnd); cone.translate(x, h / 2 - 3, z); g.push(cone); }
    const far = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); far.userData.noMerge = true; far.name = 'far'; scene.add(far); }
  // river names float over the water
  for (const [t, x, z] of [['Allegheny River', 45, 36], ['Monongahela River', 48, -14], ['Ohio River', 64, 30], ['Hudson River', -48, 20], ['St. Lawrence River', -22, 55]]) { const sp = labelSprite(t, 5); sp.position.set(x, 3.2, z); sp.name = 'river-label'; scene.add(sp); }
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
