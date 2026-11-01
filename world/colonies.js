// world/colonies.js — Section 5 walkable level: "Jamestown and Plymouth" (the first lasting English colonies).
// Roanoke Island (south-east, 1587, the Lost Colony) → by ship up the James River → James Fort (1607) → tobacco fields and a
// Powhatan town → Cape Cod Harbor and the Mayflower (November 1620) → Plymouth's first street → a Wampanoag homesite →
// the fort-meetinghouse on the hill (Trial). Map directions are real: north = +z, WEST = +x. Distances are shrunk
// enormously; the help card says so.
// Accuracy: James Fort was a triangle of upright logs with a round bulwark at each corner (1607); the three ships were the
// Susan Constant, Godspeed and Discovery; Powhatan towns had long, rounded houses covered with bark or reed mats
// (yehakins); John Rolfe's sweeter tobacco from 1612; the General Assembly met in the church at James Towne on
// July 30, 1619; John White found "CROATOAN" carved on a post at the abandoned Roanoke fort in 1590; the Mayflower
// (a three-masted merchant ship) anchored in Cape Cod Harbor, where the Compact was signed on November 11, 1620;
// Plymouth's first street ran up from the shore to the hill where the fort-meetinghouse was built in 1622; Wampanoag
// homes were domed wetus covered with bark or mats, beside fields of corn, beans and squash planted in hills. No
// Plymouth Rock landing scene, no buckled hats. English flags are the red cross of St. George. Nothing here touches the save.
import * as THREE from 'three';
import { vc, P, M, rng, tube, CYL, BOX, roofGeo, houseGeo, makeRing, barrelGeo, crateGeo, labelSprite, setRingState, RING_COL, shipGeo } from './voyage.js';
export { labelSprite, setRingState, RING_COL };

export const WATER_Y = -0.4, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const STATIONS = {
  roanoke: { x: -42, z: -58, r: 7, label: 'Roanoke Island, 1587', n: 1, dir: 'start' },
  jamestown: { x: -22, z: -24, r: 10, label: 'James Fort, 1607', n: 2, dir: 'north, by ship up the James River' },
  fields: { x: 14, z: -21, r: 9, label: 'Tobacco fields and a Powhatan town', n: 3, dir: 'west of the fort' },
  mayflower: { x: -46, z: 22, r: 7, label: 'Cape Cod Harbor, November 1620', n: 4, dir: 'north, on the coast' },
  plymouth: { x: -19, z: 40, r: 9, label: 'Plymouth, 1620s', n: 5, dir: 'north-west of the harbor' },
  wampanoag: { x: 27, z: 30, r: 8, label: 'A Wampanoag homesite', n: 6, dir: 'west of Plymouth' },
  gate: { x: 2, z: 50, r: 6, label: 'The fort-meetinghouse', n: 7, dir: 'on the hill (Trial)' }
};
export const ROADS = [
  [[-42, -64], [-42, -58], [-35, -53], [-30, -49.5]], [[-42, -58], [-46, -56]],
  [[-30, -33], [-22, -33.5], [-22, -24], [-15.6, -23.4], [-4, -22], [14, -21]],
  [[14, -21], [6, -6], [-14, 4], [-34, 12], [-46, 22]],
  [[-46, 22], [-38, 33], [-30, 40], [-6, 40], [2, 47]],
  [[-6, 40], [10, 36], [27, 30]],
  [[27, 30], [16, 44], [4, 48]],
  [[-27.5, -22], [-35, -23.5]]
];
export function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
export const PATH = ROADS[0];
export const BOUNDS = { x0: -70, x1: 70, z0: -72, z1: 70 };
// the James River runs east (toward -x) to Chesapeake Bay and the Atlantic; Cape Cod Bay bites into the coast in the north
export const riverZ = x => -40 + 0.05 * x;
const riverHW = x => 4.2 + 0.03 * Math.max(0, -x);
const coastX = z => -66 + 2 * Math.sin(z * 0.07);
const bayX = z => -53 - 4 * Math.cos((z - 22) * 0.12);
function rawH(x, z) {
  let h = 0.6 + 0.35 * Math.sin(x * 0.08) * Math.cos(z * 0.07) + 0.5 * smooth(-10, 40, x);
  h += 3.2 * smooth(16, 4, Math.hypot(x - 4, z - 55));                                   // the hill above Plymouth
  h += 1.2 * smooth(30, 60, z) * (0.5 + 0.5 * Math.sin(x * 0.11 + z * 0.06));             // rolling New England ground
  let w = smooth(coastX(z) + 6, coastX(z) - 2, x);                                        // Atlantic
  if (z > 6 && z < 38) w = Math.max(w, smooth(bayX(z) + 5, bayX(z) - 1, x) * smooth(6, 12, z) * smooth(38, 32, z));   // Cape Cod Bay
  const rw = riverHW(x); w = Math.max(w, smooth(rw + 1.6, rw - 0.6, Math.abs(z - riverZ(x))));   // James River
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
export const STONES = [], FORD_ROWS = 0, FORD_RESPAWN = { x: -30, z: -32, yaw: 0 };
export function onStone() { return null; }
export function walkY(x, z) { return groundH(x, z); }
export function solid(x, z) { return groundH(x, z) < WATER_Y + 0.25; }
// the ship crossing of the James River (the "Sail" rings fade her across; nothing is saved but at.s5)
export const HARBORS = {
  south: { x: -30, z: -51, yaw: Math.PI, label: 'Roanoke, the south shore' },
  north: { x: -30, z: -32.5, yaw: 0, label: 'James Fort, the north bank' }
};
// no carry puzzle in Level 5 (Section 5 has no sort activity, and a new one would add save data): the colony mats stay
// empty, and the "Two colonies" ring on Plymouth's street is an info card instead.
export const MATS = [];
export const MAT_HALF = 1.2;
export const RING_AT = {
  l0: [-48, -56], croatoan: [-40.6, -57.4], 'ship-south': [-27, -50],
  'ship-north': [-38, -34], ships: [-16, -33.5], l1: [-22, -27.5], jamestown: [-26.8, -27.5], market: [-22, -24.1], l9: [-17.2, -27.5], starving: [-17.5, -24], fort5: [-26.4, -23.6],
  assembly: [-34.6, -25.5], l7: [-38, -24.8],
  l2: [8, -18], l3: [12, -16.5], tobacco: [16, -24.5], powhatan: [20, -17],
  l4: [-43.5, 25], compact: [-48.5, 19], l8: [-43.5, 19], mayship: [-49, 25.5],
  l5: [-25, 40], plymouth: [-29, 37.5], colonies: [-17, 40],
  squanto: [23.5, 30], wampanoag: [29, 27], cornhills: [22, 25.5],
  l6: [-2.5, 47.5], geomap: [2, 44.5], timeline: [6.5, 47.5], trial: [2, 48.2]
};

// ---------------- props ----------------
function palisadeGeo(len, h = 2.8, rnd) {   // a wall of upright split logs along local x
  const g = []; const n = Math.round(len / 0.42);
  for (let i = 0; i < n; i++) { const hh = h * (0.92 + rnd() * 0.12), x = -len / 2 + 0.21 + i * 0.42; g.push(P(CYL(0.2, 0.22, hh, 5), '#7a5a3a', x, hh / 2, 0, 0, 0, 0, 1, 1, 1, 0.1, rnd), P(new THREE.ConeGeometry(0.2, 0.4, 5), '#6a4a2e', x, hh + 0.2, 0)); }
  g.push(P(BOX(len, 0.18, 0.12), '#5a3d24', 0, h * 0.7, 0.22)); return M(g);
}
function englishHouseGeo(w, d, h, rnd, wall = '#b8a27c') {   // a one-room timber-framed house, clapboard walls, steep thatched roof, a chimney
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
  for (const p of roofGeo(w, d, 2.0, '#b39a5e')) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(w + 0.05, 0.12, 0.12), '#4a3220', 0, h * 0.5, d / 2 + 0.02), P(BOX(0.12, h, 0.12), '#4a3220', -w / 2 + 0.06, h / 2, d / 2 + 0.02), P(BOX(0.12, h, 0.12), '#4a3220', w / 2 - 0.06, h / 2, d / 2 + 0.02));
  g.push(P(BOX(0.8, 1.6, 0.08), '#4a3220', 0, 0.8, d / 2 + 0.05), P(BOX(0.5, 0.45, 0.08), '#2a2018', -w * 0.3, h * 0.62, d / 2 + 0.05));
  g.push(P(BOX(0.7, 1.6, 0.7), '#7a5a46', w / 2 - 0.5, h + 1.2, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd));
  return M(g);
}
function yehakinGeo(len, rnd) {   // a Powhatan house: bent saplings covered with bark and reed mats, rounded roof
  return M([P(CYL(1.6, 1.6, len, 10, 1, false, 0, Math.PI), '#a08a62', 0, 0.7, 0, Math.PI / 2, 0, Math.PI / 2, 1, 1, 1, 0.1, rnd), P(BOX(3.2, 0.7, len), '#94805a', 0, 0.35, 0), P(BOX(0.8, 1.2, 0.08), '#3a2a1a', 0, 0.6, len / 2 + 0.03)]);
}
function wetuGeo(r, rnd) {   // a Wampanoag wetu: a dome of bent saplings covered with bark or cattail mats, smoke hole
  return M([P(new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), '#9c8458', 0, 0, 0, 0, 0, 0, 1, 0.78, 1, 0.1, rnd), P(BOX(0.8, 1.2, 0.3), '#3a2a1a', 0, 0.6, r * 0.95), P(CYL(0.25, 0.25, 0.1, 8), '#3a2a1a', 0, r * 0.78, 0)]);
}
function flagGeo() {   // the English flag of St. George: a red cross on white
  const g = [P(CYL(0.07, 0.09, 7, 6), '#6b4f36', 0, 3.5, 0)], fy = 6.4, fx = 1.0;
  g.push(P(BOX(1.9, 1.2, 0.04), '#f4f1e6', fx, fy, 0), P(BOX(1.9, 0.24, 0.06), '#c0302a', fx, fy, 0), P(BOX(0.28, 1.2, 0.06), '#c0302a', fx, fy, 0));
  return M(g);
}
function cornHillGeo(rnd) {   // a planting hill: corn stalks with beans climbing them and squash leaves at the foot
  const g = [P(new THREE.SphereGeometry(0.45, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), '#7a5a3a', 0, 0, 0, 0, 0, 0, 1, 0.5, 1)];
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + rnd(), x = Math.cos(a) * 0.18, z = Math.sin(a) * 0.18; g.push(P(CYL(0.035, 0.05, 1.9, 4), '#8aa04a', x, 0.95, z), P(BOX(0.5, 0.04, 0.12), '#7a9a42', x, 1.0 + i * 0.2, z, 0, a, 0.5), P(BOX(0.08, 0.2, 0.06), '#d8c068', x, 1.4, z + 0.05)); }
  g.push(P(new THREE.SphereGeometry(0.22, 6, 4), '#5a8a3a', 0.4, 0.12, 0.1, 0, 0, 0, 1.4, 0.4, 1), P(new THREE.SphereGeometry(0.16, 6, 4), '#d89a3a', -0.35, 0.12, -0.2));
  return M(g);
}
function tobaccoGeo(rnd) {   // a tobacco plant: a stalk with big broad leaves
  const g = [P(CYL(0.03, 0.05, 1.3, 4), '#7a9a4a', 0, 0.65, 0)];
  for (let i = 0; i < 4; i++) { const a = i * 1.7 + rnd(); g.push(P(BOX(0.7, 0.03, 0.3), i % 2 ? '#6e9a40' : '#7aa848', Math.cos(a) * 0.3, 0.3 + i * 0.25, Math.sin(a) * 0.3, 0, -a, 0.35)); }
  return M(g);
}
function carvedPost(text) {   // a post with letters cut into it (a canvas texture on its face)
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#9a7a52'; x.fillRect(0, 0, 64, 512); for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(70,45,25,' + (0.08 + Math.random() * 0.1) + ')'; x.fillRect(Math.random() * 64, 0, 2, 512); }
  x.fillStyle = '#3a2412'; x.font = 'bold 50px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  [...text].forEach((ch, i) => x.fillText(ch, 32, 36 + i * 56));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 3.4), new THREE.MeshLambertMaterial({ map: tex })); m.userData.noMerge = true; return m;
}

// ---------------- build ----------------
export function buildColonies({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(20261607);
  const scene = new THREE.Scene(); scene.name = 'colonies';
  const SKY_TOP = new THREE.Color('#4f98d8'), SKY_H = new THREE.Color('#e6ebe8');
  scene.fog = new THREE.Fog(SKY_H, 90, 300);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), LOW = new THREE.Color('#9fb3a0');
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; if (y < 0) c.copy(SKY_H).lerp(LOW, Math.min(1, -y * 6)); else c.copy(SKY_H).lerp(SKY_TOP, Math.pow(y, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky; }
  const hemi = new THREE.HemisphereLight('#eef4ff', '#7f9a7a', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d6', 2.1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  // terrain colour: Virginia green and tidewater marsh in the south, autumn New England in the north, sandy shores
  const C = k => new THREE.Color(k);
  const VA = C('#6f9a46'), MARSH = C('#8a9a52'), NE = C('#7a8a46'), FALL = C('#9a8a46'), SAND = C('#e2d3a2'), PATHC = C('#a8906a'), SHALLOW = C('#5aa6b4'), DEEP = C('#1f5470'), FIELD = C('#8a6a42');
  const terrColor = (x, z, c) => {
    const h = groundH(x, z);
    if (h < WATER_Y) { c.copy(DEEP).lerp(SHALLOW, smooth(-3.0, -0.8, h)); return c; }
    const north = smooth(0, 24, z), marsh = (1 - north) * smooth(5, 1, Math.abs(z - riverZ(x)) - riverHW(x)) ;
    c.copy(VA).lerp(MARSH, marsh * 0.7).lerp(NE, north).lerp(FALL, north * (0.35 + 0.25 * Math.sin(x * 0.21 + z * 0.17)));
    c.multiplyScalar(0.93 + 0.09 * Math.sin(x * 0.23) * Math.cos(z * 0.19));
    c.lerp(SAND, 1 - smooth(0.2, 0.75, h));
    if (x > 7 && x < 21 && z > -31 && z < -25.5) c.lerp(FIELD, 0.6);       // tobacco field
    if (x > 15 && x < 25 && z > 17 && z < 24) c.lerp(FIELD, 0.6);           // Wampanoag cornfield
    const pd = pathDist(x, z); c.lerp(PATHC, (1 - smooth(1.0, 2.4, pd)) * 0.7);
    return c; };
  const terrNormals = geo => { const p = geo.attributes.position, n = p.count, nrm = new Float32Array(n * 3), e = 0.5, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); v.set(groundH(x - e, z) - groundH(x + e, z), 2 * e, groundH(x, z - e) - groundH(x, z + e)).normalize(); nrm.set([v.x, v.y, v.z], i * 3); }
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); };
  const terrain = new THREE.Group(); terrain.name = 'terrain'; scene.add(terrain);
  for (let tx = 0; tx < 4; tx++) for (let tz = 0; tz < 4; tz++) { const W = 46, D = 46, geo = new THREE.PlaneGeometry(W, D, 34, 34); geo.rotateX(-Math.PI / 2); geo.translate(-92 + W * (tx + 0.5), 0, -92 + D * (tz + 0.5));
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
  // a moored ship keeps the camera out of its hull and lower sails (length runs along x: every ship here lies at about π/2)
  const shipOcc = (k, x, z, sc) => { const hl = (k === 'nao' ? 17 : 14.5) * sc / 2 + 0.3, hw = (k === 'nao' ? 5.4 : 4.4) * sc / 2 + 0.6; occBox(x - hl, x + hl, z - hw, z + hw, WATER_Y + 6 * sc); };
  const labels = [], gy = (x, z) => groundH(x, z);
  const building = (geo, x, z, ry, w, d, h) => { add(geo, x, z, ry); const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = (w * c + d * s) / 2, hz = (w * s + d * c) / 2; box(x - hx, x + hx, z - hz, z + hz); occBox(x - hx, x + hx, z - hz, z + hz, gy(x, z) + h + 1); };
  const wall = (x0, z0, x1, z1, h = 2.8) => { const len = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; add(palisadeGeo(len, h, rnd), mx, mz, ry);
    const n = Math.ceil(len / 1.5); for (let i = 0; i <= n; i++) { const t = i / n; circ(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 0.5); } occBox(Math.min(x0, x1) - 0.3, Math.max(x0, x1) + 0.3, Math.min(z0, z1) - 0.3, Math.max(z0, z1) + 0.3, gy(mx, mz) + h); };
  const gapWall = (a, b, gapAt, gap) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]), t0 = (gapAt * len - gap / 2) / len, t1 = (gapAt * len + gap / 2) / len, L = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const p0 = L(t0), p1 = L(t1); wall(a[0], a[1], p0[0], p0[1]); wall(p1[0], p1[1], b[0], b[1]); };

  // ===== 1 · Roanoke Island, 1587: the empty fort John White found in 1590, with CROATOAN carved on a post
  { const { x: cx, z: cz } = STATIONS.roanoke;
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; if (a < 0.7 || a > 5.6) continue; const x = cx - 6 + Math.cos(a) * 4.5, z = cz + 2 + Math.sin(a) * 3.6; if (i % 4 === 2) continue;   // a broken ring of posts, open toward the trail
      const hh = 1.2 + rnd() * 1.6; add(M([P(CYL(0.2, 0.22, hh, 5), '#6e5236', 0, hh / 2, 0, (rnd() - 0.5) * 0.25, 0, (rnd() - 0.5) * 0.25, 1, 1, 1, 0.12, rnd)]), x, z); circ(x, z, 0.35); }
    const px = cx + 1, pz = cz + 3.5; add(M([P(BOX(0.5, 3.6, 0.5), '#8a6a46', 0, 1.8, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd)]), px, pz); circ(px, pz, 0.45);
    const cp = carvedPost('CROATOAN'); cp.position.set(px, gy(px, pz) + 1.85, pz - 0.27); cp.rotation.y = Math.PI; cp.name = 'croatoan'; scene.add(cp);
    add(M([P(CYL(0.35, 0.45, 5, 7), '#5e4a34', 0, 2.5, 0), P(new THREE.IcosahedronGeometry(2.0, 1), '#4a6e36', 0, 5.4, 0, 0, 0, 0, 1.2, 0.8, 1.2, 0.2, rnd)]), cx - 9, cz + 9); circ(cx - 9, cz + 9, 0.6); occC(cx - 9, cz + 9, 2.2, gy(cx - 9, cz + 9) + 7, gy(cx - 9, cz + 9) + 3);
    add(crateGeo('#7a6a4a'), cx - 7.5, cz + 4.2, 0.4); add(barrelGeo(), cx - 8.8, cz + 3.4);
    labels.push([STATIONS.roanoke, '1 · Roanoke Island, 1587', 'the Lost Colony']);
    // the ship that carries her up the river to Jamestown, waiting off the south shore
    add(shipGeo('caravel', 'square'), -24, -45.4, Math.PI / 2 + 0.1, 0.55, true, WATER_Y - 0.15); shipOcc('caravel', -24, -45.4, 0.55);
  }
  // ===== 2 · James Fort, 1607: a triangle of upright logs, a round bulwark at each corner, the three ships in the river
  { const A = [-33, -31], B = [-11, -31], T = [-22, -13];
    gapWall(A, B, 0.5, 3.2);                    // the river side, with the main gate
    gapWall(B, T, 0.42, 3.0);                   // the west side, a gate toward the fields
    gapWall(T, A, 0.5, 2.6);                    // the east side, a gate toward the church
    for (const [x, z] of [A, B, T]) { const g = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.push(P(CYL(0.2, 0.22, 2.9, 5), '#7a5a3a', Math.cos(a) * 2.1, 1.45, Math.sin(a) * 2.1, 0, 0, 0, 1, 1, 1, 0.1, rnd)); } g.push(P(CYL(1.9, 1.9, 0.2, 12), '#6b4f36', 0, 1.6, 0));
      add(M(g), x, z); circ(x, z, 2.3); occC(x, z, 2.3, gy(x, z) + 3); }
    building(englishHouseGeo(3.6, 3.0, 2.3, rnd, '#a89068'), -22, -19.5, Math.PI, 3.6, 3.0, 4.4);   // the storehouse, its door toward the gate
    add(flagGeo(), -28.5, -29.2); add(barrelGeo(), -19.4, -21.6); add(barrelGeo(), -18.9, -22.4); add(crateGeo(), -25, -21.5, 0.3);
    labels.push([STATIONS.jamestown, '2 · James Fort, 1607', 'Virginia · the first lasting English colony']);
    // the church outside the fort, where the General Assembly met on July 30, 1619
    building(M([englishHouseGeo(4, 7, 2.8, rnd, '#c0aa82'), P(BOX(1.2, 1.2, 1.2), '#8a6a46', 0, 4.6, 3.0), P(new THREE.ConeGeometry(0.95, 1.5, 4), '#5a4a3a', 0, 5.9, 3.0, 0, Math.PI / 4, 0)]), -38, -18.5, Math.PI, 4, 7, 6);
    // the three ships of 1607 at anchor in the James River: the Susan Constant, the Godspeed and the Discovery
    const ships = [['nao', 'square', -12, -41.4, 'Susan Constant', 'about 120 tons', 0.72], ['caravel', 'square', -23, -41.9, 'Godspeed', 'about 40 tons', 0.6], ['caravel', 'square', -33, -42.4, 'Discovery', 'a small pinnace, about 20 tons', 0.45]];
    for (const [k, rig, x, z, name, type, s] of ships) { add(shipGeo(k, rig), x, z, Math.PI / 2 + (rnd() - 0.5) * 0.1, s, true, WATER_Y - 0.15); shipOcc(k, x, z, s); const lab = labelSprite(name, 4.2, type); lab.position.set(x, 10.5 * s / 0.72, z); lab.name = 'ship-label'; scene.add(lab); }
  }
  // ===== 3 · Tobacco fields and a Powhatan town
  { for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) add(tobaccoGeo(rnd), 8.5 + i * 1.4 + (r % 2) * 0.7, -30 + r * 1.3, rnd() * 6, 0.9 + rnd() * 0.2, false);
    add(M([P(BOX(3.6, 2.2, 2.4), '#8a6e4c', 0, 1.1, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd), ...roofGeo(3.6, 2.4, 1.2, '#7a6a4a').map(p => { p.translate(0, 2.2, 0); return p; }), P(BOX(3.2, 0.06, 0.06), '#3a2a1a', 0, 1.9, 1.25)]), 4.5, -29, 0); box(2.6, 6.4, -30.3, -27.7); occBox(2.6, 6.4, -30.3, -27.7, gy(4.5, -29) + 3.6);   // a drying barn
    for (const [hx, hz, ry] of [[22, -12.5, 0.3], [25.5, -18, 1.4], [19, -9, -0.4]]) { add(yehakinGeo(5, rnd), hx, hz, ry); const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx2 = (3.2 * c + 5 * s) / 2, hz2 = (3.2 * s + 5 * c) / 2; box(hx - hx2, hx + hx2, hz - hz2, hz + hz2); occBox(hx - hx2, hx + hx2, hz - hz2, hz + hz2, gy(hx, hz) + 2.8); }
    add(M([P(CYL(0.6, 0.7, 0.25, 8), '#5a4a3a', 0, 0.12, 0), P(new THREE.ConeGeometry(0.35, 0.5, 5), '#e0802a', 0, 0.45, 0)]), 22.5, -16);
    labels.push([STATIONS.fields, '3 · Tobacco fields', 'John Rolfe · the Powhatan']);
  }
  // ===== 4 · Cape Cod Harbor, November 1620: the Mayflower at anchor, her shallop pulled up on the beach
  { add(shipGeo('nao', 'square'), -61, 22, Math.PI / 2 + 0.15, 0.85, true, WATER_Y - 0.15); shipOcc('nao', -61, 22, 0.85);
    const lab = labelSprite('Mayflower', 4.6, 'a merchant ship · 102 passengers'); lab.position.set(-61, 13, 22); lab.name = 'ship-label'; scene.add(lab);
    add(M([P(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#5a3d24', 0, 0.45, 0, Math.PI, 0, 0, 0.9, 0.45, 2.6), P(BOX(1.6, 0.06, 0.2), '#7a5a38', 0, 0.42, 0.6)]), -51.5, 17, 0.4, 1, true, gy(-51.5, 17) + 0.02); circ(-51.5, 17, 1.0);
    add(barrelGeo(), -50, 27); add(crateGeo('#8a6a48'), -49.4, 28.2, 0.3);
    labels.push([STATIONS.mayflower, '4 · Cape Cod Harbor, 1620', 'the Mayflower · the Compact']);
  }
  // ===== 5 · Plymouth, 1620s: the first street, rising from the shore toward the hill
  { const { x: cx, z: cz } = STATIONS.plymouth;
    for (const [hx, hz, ry] of [[-30, 33.5, 0], [-23, 33.5, 0], [-9.5, 33.5, 0], [-30, 46.5, Math.PI], [-23, 46.5, Math.PI], [-16, 46.5, Math.PI], [-9.5, 46.5, Math.PI]]) building(englishHouseGeo(4.2, 3.6, 2.3, rnd), hx, hz, ry, 4.2, 3.6, 4.4);
    for (const [x0, x1, z] of [[-33, -5, 31.2], [-33, -5, 48.8]]) { add(M([P(BOX(x1 - x0, 0.9, 0.08), '#7a6044', 0, 0.45, 0), P(BOX(x1 - x0, 0.08, 0.1), '#5a4430', 0, 0.85, 0)]), (x0 + x1) / 2, z); }   // garden fences behind the houses
    add(M([P(CYL(0.05, 0.05, 1.6, 5), '#5a4430', -0.9, 0.8, 0), P(CYL(0.05, 0.05, 1.6, 5), '#5a4430', 0.9, 0.8, 0), P(BOX(2.2, 0.1, 0.5), '#6b4f36', 0, 1.6, 0)]), cx + 4.5, cz - 6.6);
    add(flagGeo(), cx - 15, cz + 4.4);
    labels.push([STATIONS.plymouth, '5 · Plymouth, 1620s', 'the Pilgrims · William Bradford']);
  }
  // ===== 6 · A Wampanoag homesite: wetus, a cooking fire, a field of corn, beans and squash planted in hills
  { const { x: cx, z: cz } = STATIONS.wampanoag;
    for (const [hx, hz, r] of [[cx + 6, cz + 4.5, 2.4], [cx + 7.5, cz - 3, 2.2], [cx + 1, cz + 7.5, 2.0]]) { add(wetuGeo(r, rnd), hx, hz, rnd() * 6); circ(hx, hz, r + 0.1); occC(hx, hz, r, gy(hx, hz) + r); }
    add(M([P(CYL(0.6, 0.7, 0.25, 8), '#5a4a3a', 0, 0.12, 0), P(new THREE.ConeGeometry(0.35, 0.5, 5), '#e0802a', 0, 0.45, 0)]), cx + 2, cz + 1.5);
    add(M([P(CYL(0.5, 0.35, 0.8, 8), '#5a4a3a', 0, 0.4, 0), P(BOX(1.2, 0.08, 0.08), '#5a3d24', 0, 1.1, 0)]), cx + 3.5, cz - 6);   // a mortar for pounding corn
    for (let r = 0; r < 4; r++) for (let i = 0; i < 5; i++) add(cornHillGeo(rnd), 16 + i * 2 + (r % 2), 18 + r * 1.8, rnd() * 6, 0.95, false);
    add(M([P(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#6a4a2e', 0, 0.38, 0, Math.PI, 0, 0, 0.55, 0.32, 2.5)]), cx + 11, cz + 8.5, 0.6);   // a dugout canoe
    labels.push([STATIONS.wampanoag, '6 · A Wampanoag homesite', 'Massasoit · Tisquantum']);
  }
  // ===== 7 · The fort-meetinghouse on the hill (1622): a square timber building, cannon on its flat roof
  { const fx = 2, fz = 53.5, S = 6, H = 4.2, g = [P(BOX(S, H, S), '#8a6a46', 0, H / 2, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd), P(BOX(S + 0.6, 0.3, S + 0.6), '#6b4f36', 0, H + 0.15, 0)];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.push(P(BOX(0.25, 0.9, 0.25), '#5a3d24', sx * S / 2, H + 0.6, sz * S / 2));
    for (const sx of [-1, 1]) g.push(P(CYL(0.16, 0.2, 1.6, 8), '#2a2622', sx * 1.4, H + 0.6, -S / 2 + 0.2, Math.PI / 2, 0, 0), P(BOX(0.6, 0.35, 1.0), '#5a3d24', sx * 1.4, H + 0.45, -S / 2 + 1.0));
    g.push(P(BOX(1.1, 2.0, 0.1), '#3a2a1a', 0, 1.0, -S / 2 - 0.03));
    building(M(g), fx, fz, 0, S, S, H + 1);
    labels.push([STATIONS.gate, '7 · The fort-meetinghouse', 'built 1622 · the Trial']);
  }

  // colony mats (the carry puzzle) on Plymouth's street
  const MATCOL = { jamestown: '#c9a24a', plymouth: '#5a7ac0' };
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

  // ===== scatter: loblolly pines and oaks in Virginia, cypress by the river; oaks, autumn maples, birches and white
  // pines in New England
  const near = (x, z, pad) => { for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return true; } return false; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const fieldZone = (x, z) => (x > 2 && x < 23 && z > -32 && z < -24) || (x > 13 && x < 27 && z > 15 && z < 26);
  const spots = (count, ok, minPath = 3, pad = 1.5) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 80) {
      const x = -92 + rnd() * 184, z = -92 + rnd() * 184, h = groundH(x, z);
      if (h < 0.15 || pathDist(x, z) < minPath || near(x, z, 2) || blocked(x, z, pad) || fieldZone(x, z) || !ok(x, z, h)) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name; scene.add(m); return m; };
  const sc = () => 0.8 + rnd() * 0.45;
  const south = (x, z) => z < 2, nth = (x, z) => z >= 2;
  const pines = spots(80, (x, z, h) => south(x, z)).map(([x, z]) => [x, z, sc()]);
  const oaks = spots(55, () => true).map(([x, z]) => [x, z, sc()]);
  const maples = spots(55, (x, z, h) => nth(x, z)).map(([x, z]) => [x, z, sc()]);
  const birches = spots(30, (x, z, h) => nth(x, z) && z > 20, 2.5, 1.2).map(([x, z]) => [x, z, 0.8 + rnd() * 0.3]);
  const cypress = spots(20, (x, z, h) => south(x, z) && Math.abs(z - riverZ(x)) - riverHW(x) < 5, 2.5, 1.0).map(([x, z]) => [x, z, 0.8 + rnd() * 0.3]);
  const oakGeo = M([P(CYL(0.2, 0.28, 2.0, 6), '#5e4a34', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.9, 1), '#4a6e36', 0, 2.8, 0, 0, 0, 0, 1.3, 0.7, 1.3, 0.2, rnd)]);
  const mapleGeo = M([P(CYL(0.18, 0.26, 2.0, 6), '#5a4634', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.7, 1), '#c8642a', 0, 3.0, 0, 0, 0, 0, 1.1, 0.9, 1.1, 0.25, rnd)]);
  const birchGeo = M([P(CYL(0.1, 0.14, 3.4, 6), '#e8e4da', 0, 1.7, 0), P(new THREE.IcosahedronGeometry(1.1, 0), '#d8b03a', 0, 3.8, 0, 0, 0, 0, 0.9, 1.2, 0.9, 0.2, rnd)]);
  const pineGeo = M([P(CYL(0.14, 0.2, 3.2, 6), '#6e5038', 0, 1.6, 0), P(new THREE.ConeGeometry(1.4, 2.6, 7), '#2f5a32', 0, 3.8, 0, 0, 0, 0, 1, 1, 1, 0.15, rnd), P(new THREE.ConeGeometry(1.0, 2.0, 7), '#36643a', 0, 5.0, 0)]);
  const cypGeo = M([P(CYL(0.3, 0.55, 1.2, 7), '#6a5444', 0, 0.6, 0), P(CYL(0.16, 0.26, 3.2, 6), '#6a5444', 0, 2.4, 0), P(new THREE.ConeGeometry(1.4, 2.6, 7), '#4a6a3e', 0, 4.4, 0, 0, 0, 0, 1, 0.6, 1, 0.15, rnd)]);
  inst(pineGeo, pines, true, 'pines'); inst(oakGeo, oaks, true, 'oaks'); inst(mapleGeo, maples, true, 'maples'); inst(birchGeo, birches, true, 'birches'); inst(cypGeo, cypress, true, 'cypress');
  for (const L of [pines, oaks, maples, birches, cypress]) for (const [x, z, s] of L) { circ(x, z, 0.28 * s + 0.12); occC(x, z, 1.6 * s, groundH(x, z) + 4.5 * s, groundH(x, z) + 1.8 * s); }
  const tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#8a9a50', 0.2, rnd), rockGeo = vc(new THREE.DodecahedronGeometry(0.6, 0), '#8a8076', 0.2, rnd);
  inst(tuftGeo, spots(380, (x, z, h) => h < 6, 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6]), false, 'tufts');
  inst(rockGeo, spots(50, (x, z, h) => z > 0, 2.2, 0.6).map(([x, z]) => [x, z, 0.4 + rnd() * 0.6]), true, 'rocks');
  // far scenery: low blue hills inland (to the west, +x); open sea to the east
  { const g = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, R = 190 + rnd() * 40, x = Math.cos(a) * R, z = Math.sin(a) * R; if (x < -60) continue; const h = 9 + rnd() * 10;
      const cone = vc(new THREE.ConeGeometry(h * 2.6, h, 7, 2), '#6f8a7a', 0.1, rnd); cone.translate(x, h / 2 - 3, z); g.push(cone); }
    const far = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); far.userData.noMerge = true; far.name = 'far'; scene.add(far); }
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
    for (const m of mats) if (m.glowOn) m.glow.material.opacity = 0.55 + 0.35 * Math.sin(t * 6); else if (m.glow.material.opacity) m.glow.material.opacity = 0;
  }
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen() {}, tracks: [], herds: {}, flames: [], water, fogColor: SKY_H, sky: scene.userData.sky, mats, dropBundle, clearBundles, regionLabels };
}
