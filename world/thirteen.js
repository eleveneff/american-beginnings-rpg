// world/thirteen.js — Section 6 walkable level: "The Thirteen Colonies Grow" (about 1700–1754).
// A walk up the Atlantic coast, south to north: Charles Town (Southern Colonies) → Williamsburg's Capitol (the House of
// Burgesses) → a field meeting of the Great Awakening (George Whitefield, 1739–40) → Philadelphia (Middle Colonies,
// Penn's city, Franklin's print shop and library) → a colonial village lane (daily life, crafts, the schoolhouse) →
// Boston (New England: the harbor, the meetinghouse, the town meeting) → Albany, 1754 (the Albany Congress: the Trial).
// Map directions are real: north = +z, WEST = +x (the Atlantic is east, toward -x). Distances are shrunk enormously.
// Accuracy: Williamsburg became Virginia's capital in 1699 and its Capitol was finished about 1705; Whitefield preached
// to huge outdoor crowds in 1739–40; Franklin's Library Company was founded in 1731; Penn's Charter of Privileges 1701;
// Eliza Lucas grew indigo in South Carolina in the 1740s; rice fields were worked by enslaved Africans, many of whom
// brought rice-growing skill from West Africa; Boston's King Street ran up from Long Wharf to the Town House (1713);
// the Albany Congress met in June–July 1754 with Haudenosaunee (Iroquois) leaders such as Hendrick Theyanoguin; Franklin's
// "Join, or Die" snake ran in the Pennsylvania Gazette on May 9, 1754. Flags are the British Union flag of 1707.
// Nothing here touches the save.
import * as THREE from 'three';
import { vc, P, M, rng, CYL, BOX, roofGeo, houseGeo, makeRing, barrelGeo, crateGeo, labelSprite, setRingState, RING_COL, shipGeo } from './voyage.js';
export { labelSprite, setRingState, RING_COL };

export const WATER_Y = -0.4, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const STATIONS = {
  charleston: { x: -42, z: -54, r: 9, label: 'Charles Town, 1740s', n: 1, dir: 'start' },
  williamsburg: { x: -14, z: -30, r: 9, label: 'Williamsburg, Virginia', n: 2, dir: 'north up the coast road' },
  revival: { x: 24, z: -10, r: 8, label: 'A field meeting, 1740', n: 3, dir: 'north-west, inland' },
  philadelphia: { x: -28, z: 8, r: 10, label: 'Philadelphia, 1740s', n: 4, dir: 'north-east, on the Delaware' },
  village: { x: 14, z: 26, r: 9, label: 'A colonial village lane', n: 5, dir: 'west, inland' },
  boston: { x: -42, z: 44, r: 9, label: 'Boston, 1740s', n: 6, dir: 'north-east, on the coast' },
  gate: { x: 26, z: 52, r: 7, label: 'Albany, 1754', n: 7, dir: 'west, up the Hudson (Trial)' }
};
export const ROADS = [
  [[-42, -64], [-42, -54], [-30, -42], [-14, -30]],
  [[-14, -30], [4, -20], [24, -10]],
  [[24, -10], [2, 2], [-28, 8]],
  [[-28, 8], [-8, 18], [14, 26]],
  [[14, 26], [-14, 36], [-42, 44]],
  [[-42, 44], [-16, 54], [26, 52]]
];
export function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
export const PATH = ROADS[0];
export const BOUNDS = { x0: -70, x1: 70, z0: -72, z1: 70 };
// the coast runs north–south on the east (-x); Delaware Bay bites in south of Philadelphia but ends well before the road
export const riverZ = x => -8 + 0.04 * x;
const coastX = z => -60 + 2.5 * Math.sin(z * 0.06);
function rawH(x, z) {
  let h = 0.6 + 0.35 * Math.sin(x * 0.08) * Math.cos(z * 0.07) + 0.6 * smooth(-10, 50, x);
  h += 1.6 * smooth(36, 64, x) * (0.5 + 0.5 * Math.sin(z * 0.09));                          // the hills inland (west)
  h += 1.0 * smooth(30, 60, z) * (0.5 + 0.5 * Math.sin(x * 0.11 + z * 0.06));              // rolling New England ground
  let w = smooth(coastX(z) + 6, coastX(z) - 2, x);                                           // the Atlantic
  if (x < -36) w = Math.max(w, smooth(3.8, 1.8, Math.abs(z - riverZ(x))) * smooth(-34, -40, x));   // Delaware Bay
  w = Math.max(w, smooth(3.4, 1.6, Math.abs(x - 40 - 0.15 * (z - 52))) * smooth(40, 46, z));         // the Hudson at Albany
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
export const STONES = [], FORD_ROWS = 0, FORD_RESPAWN = { x: -30, z: -42, yaw: 0 };
export function onStone() { return null; }
export function walkY(x, z) { return groundH(x, z); }
export function solid(x, z) { return groundH(x, z) < WATER_Y + 0.25; }
export const HARBORS = {};
export const MATS = [];
export const MAT_HALF = 1.2;
export const RING_AT = {
  l2: [-40, -49], rice: [-35.5, -55], indigo: [-27, -55], port6: [-48.5, -50],
  l3: [-14, -27], capitol: [-19, -27], trade6: [-9, -27.5],
  l5: [20, -6], whitefield: [25.5, -4.5],
  l1: [-24, 4], l8: [-28.5, 3.5], press: [-33, 4], franklin: [-19.5, 4.5], library: [-24, 12.5], penn: [-32.5, 12],
  l4: [10, 22], candle: [16.5, 23.5], hornbook: [13, 29],
  l0: [-38, 40], l7: [-42.5, 39.5], townmeeting: [-46.5, 40], colonies: [-37.5, 48], market: [-42, 48.5],
  l6: [22, 48], geomap: [18, 51.5], timeline: [21.5, 55.5], joinordie: [27, 47.5], trial: [26, 55.2]
};

// ---------------- props ----------------
function brickHouseGeo(w, d, h, rnd, wall = '#a8553a', roof = '#5a4a44') {   // a Georgian brick house: two storeys, rows of sash windows, end chimneys
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
  for (const p of roofGeo(w, d, 1.5, roof)) { p.translate(0, h, 0); g.push(p); }
  for (const fl of [0.3, 0.72]) for (let i = -1; i <= 1; i++) if (!(fl === 0.3 && i === 0)) g.push(P(BOX(0.55, 0.8, 0.06), '#f0ece0', i * w * 0.3, h * fl, d / 2 + 0.03), P(BOX(0.42, 0.66, 0.07), '#2a3440', i * w * 0.3, h * fl, d / 2 + 0.04));
  g.push(P(BOX(0.8, 1.5, 0.08), '#3a5a4a', 0, 0.75, d / 2 + 0.05), P(BOX(1.1, 0.12, 0.3), '#e8e2d0', 0, 1.6, d / 2 + 0.12));
  for (const sx of [-1, 1]) g.push(P(BOX(0.6, 1.4, 0.8), '#8a4a34', sx * (w / 2 - 0.3), h + 0.9, 0));
  return M(g);
}
function steepleGeo(w, d, h, rnd, wall = '#f2efe6', tower = 4.5, spire = 3.2) {   // a white meetinghouse or church with a tower and spire
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)];
  for (const p of roofGeo(w, d, 1.8, '#6a6460')) { p.translate(0, h, 0); g.push(p); }
  for (let i = -1; i <= 1; i += 2) g.push(P(BOX(0.6, 1.6, 0.06), '#2a3440', i * w * 0.28, h * 0.55, d / 2 + 0.03));
  g.push(P(BOX(1.8, tower, 1.8), wall, 0, tower / 2, d / 2 + 0.9), P(BOX(1.3, 1.2, 1.3), '#e8e4da', 0, tower + 0.6, d / 2 + 0.9), P(new THREE.ConeGeometry(0.75, spire, 8), '#e8e4da', 0, tower + 1.2 + spire / 2, d / 2 + 0.9), P(BOX(0.8, 1.6, 0.06), '#5a3d24', 0, 0.8, d / 2 + 1.82));
  return M(g);
}
function unionFlagGeo() {   // the British Union flag of 1707 (crosses of St. George and St. Andrew)
  const g = [P(CYL(0.07, 0.09, 7, 6), '#6b4f36', 0, 3.5, 0)], fy = 6.4, fx = 1.0;
  g.push(P(BOX(1.9, 1.2, 0.04), '#1f3a7a', fx, fy, 0), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, 0.56), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, -0.56));
  g.push(P(BOX(1.9, 0.32, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(0.36, 1.2, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(1.9, 0.18, 0.07), '#c0302a', fx, fy, 0), P(BOX(0.2, 1.2, 0.07), '#c0302a', fx, fy, 0));
  return M(g);
}
function riceGeo(rnd) { const g = []; for (let i = 0; i < 5; i++) { const a = rnd() * 6, x = Math.cos(a) * 0.15, z = Math.sin(a) * 0.15; g.push(P(CYL(0.015, 0.02, 0.9, 3), '#9ab04a', x, 0.45, z, (rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3), P(BOX(0.05, 0.2, 0.05), '#d8c878', x, 0.92, z)); } return M(g); }
function vatGeo() { return M([P(BOX(2.2, 0.6, 1.4), '#7a5a3a', 0, 0.3, 0), P(BOX(2.0, 0.05, 1.2), '#2a3a7a', 0, 0.58, 0)]); }   // an indigo steeping vat
function pressGeo() {   // a wooden hand press: two uprights, the head, the screw and the bed
  return M([P(BOX(0.25, 2.4, 0.25), '#5a3d24', -0.7, 1.2, 0), P(BOX(0.25, 2.4, 0.25), '#5a3d24', 0.7, 1.2, 0), P(BOX(1.7, 0.3, 0.4), '#5a3d24', 0, 2.25, 0), P(CYL(0.08, 0.08, 0.7, 6), '#3a3a3a', 0, 1.75, 0), P(BOX(0.9, 0.12, 0.6), '#6b4f36', 0, 1.35, 0), P(BOX(1.9, 0.18, 0.9), '#6b4f36', 0, 0.9, 0.2), P(BOX(0.5, 0.06, 0.05), '#3a3a3a', 0.35, 1.75, 0.05)]);
}
function stallGeo(rnd, cloth = '#c8a24a') { return M([P(BOX(2.4, 0.9, 1.0), '#7a5a3a', 0, 0.45, 0, 0, 0, 0, 1, 1, 1, 0.06, rnd), P(CYL(0.05, 0.05, 2.2, 5), '#5a3d24', -1.1, 1.1, -0.4), P(CYL(0.05, 0.05, 2.2, 5), '#5a3d24', 1.1, 1.1, -0.4), P(BOX(2.6, 0.06, 1.3), cloth, 0, 2.2, 0, 0.2, 0, 0)]); }
function pulpitGeo() { return M([P(BOX(1.6, 0.5, 1.2), '#7a5a3a', 0, 0.25, 0), P(BOX(0.9, 1.0, 0.6), '#6b4f36', 0, 1.0, -0.1), P(BOX(1.0, 0.08, 0.4), '#5a3d24', 0, 1.5, 0.1, -0.4, 0, 0)]); }
function personGeo(coat, rnd) { return M([P(CYL(0.18, 0.24, 0.9, 6), coat, 0, 0.45, 0), P(new THREE.SphereGeometry(0.15, 6, 5), '#e0b890', 0, 1.05, 0), P(CYL(0.2, 0.2, 0.06, 8), '#2a2622', 0, 1.18, 0)]); }
function joinOrDieTex() {   // Franklin's cartoon (1754): a snake cut into pieces labelled with colonies' initials
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#efe4c8'; x.fillRect(0, 0, 512, 256); x.strokeStyle = '#2a2018'; x.lineWidth = 14; x.lineCap = 'round';
  const segs = ['S.C.', 'N.C.', 'V.', 'M.', 'P.', 'N.J.', 'N.Y.', 'N.E.'];
  segs.forEach((s, i) => { const x0 = 30 + i * 58; x.beginPath(); x.moveTo(x0, 130 + 30 * Math.sin(i)); x.quadraticCurveTo(x0 + 22, 130 + 30 * Math.sin(i + 0.5) - 20, x0 + 44, 130 + 30 * Math.sin(i + 1)); x.stroke(); x.fillStyle = '#2a2018'; x.font = 'bold 18px Georgia, serif'; x.fillText(s, x0 + 4, 205); });
  x.font = 'bold 44px Georgia, serif'; x.textAlign = 'center'; x.fillText('JOIN, or DIE.', 256, 60);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshLambertMaterial({ map: tex })); m.userData.noMerge = true; return m;
}

// ---------------- build ----------------
export function buildThirteen({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(20261754);
  const scene = new THREE.Scene(); scene.name = 'thirteen';
  const SKY_TOP = new THREE.Color('#5a9ed8'), SKY_H = new THREE.Color('#eaece4');
  scene.fog = new THREE.Fog(SKY_H, 90, 300);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), LOW = new THREE.Color('#9fb3a0');
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; if (y < 0) c.copy(SKY_H).lerp(LOW, Math.min(1, -y * 6)); else c.copy(SKY_H).lerp(SKY_TOP, Math.pow(y, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky; }
  const hemi = new THREE.HemisphereLight('#eef4ff', '#7f9a7a', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d6', 2.1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  const C = k => new THREE.Color(k);
  const SOUTH = C('#7aa048'), MID = C('#6f9a46'), NE = C('#7a8a46'), FALL = C('#9a8a46'), SAND = C('#e2d3a2'), PATHC = C('#a8906a'), SHALLOW = C('#5aa6b4'), DEEP = C('#1f5470'), RICE = C('#7aa860'), FIELD = C('#8a6a42');
  const terrColor = (x, z, c) => {
    const h = groundH(x, z);
    if (h < WATER_Y) { c.copy(DEEP).lerp(SHALLOW, smooth(-3.0, -0.8, h)); return c; }
    const north = smooth(20, 46, z), mid = smooth(-40, -10, z);
    c.copy(SOUTH).lerp(MID, mid).lerp(NE, north).lerp(FALL, north * (0.35 + 0.25 * Math.sin(x * 0.21 + z * 0.17)));
    c.multiplyScalar(0.93 + 0.09 * Math.sin(x * 0.23) * Math.cos(z * 0.19));
    c.lerp(SAND, 1 - smooth(0.2, 0.75, h));
    if (x > -38 && x < -28 && z > -62 && z < -52) c.lerp(RICE, 0.55);        // the rice field
    if (x > 2 && x < 10 && z > 28 && z < 34) c.lerp(FIELD, 0.5);              // the village garden
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
  const shipOcc = (k, x, z, sc) => { const hl = (k === 'nao' ? 17 : 14.5) * sc / 2 + 0.3, hw = (k === 'nao' ? 5.4 : 4.4) * sc / 2 + 0.6; occBox(x - hl, x + hl, z - hw, z + hw, WATER_Y + 6 * sc); };
  const labels = [], gy = (x, z) => groundH(x, z);
  const building = (geo, x, z, ry, w, d, h) => { add(geo, x, z, ry); const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = (w * c + d * s) / 2, hz = (w * s + d * c) / 2; box(x - hx, x + hx, z - hz, z + hz); occBox(x - hx, x + hx, z - hz, z + hz, gy(x, z) + h + 1); };
  const crowd = (cx, cz, n, rad, face) => { const cols = ['#5a4a3a', '#3a4a5a', '#6a3a2a', '#4a5a3a', '#7a6a4a']; for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r = 1.2 + rnd() * rad, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; add(personGeo(cols[i % 5], rnd), x, z, Math.atan2(face[0] - x, face[1] - z), 1.0 + rnd() * 0.15); circ(x, z, 0.3); } };

  // ===== 1 · Charles Town, 1740s: the harbor wharf, a brick row, the rice field and indigo vats
  { const { x: cx, z: cz } = STATIONS.charleston;
    add(M([P(BOX(8, 0.3, 3), '#7a5a3a', 0, 0, 0)]), -54, cz + 2, 0, 1, true, 0.05); box(-58, -50, cz + 0.5, cz + 3.5);
    add(shipGeo('nao', 'square'), -60, cz + 6, Math.PI / 2, 0.7, true, WATER_Y - 0.15); shipOcc('nao', -60, cz + 6, 0.7);
    for (const [hx, hz] of [[-50, -41], [-45, -41], [-40, -41]]) building(brickHouseGeo(4, 3.4, 4.4, rnd, '#e0c8a0', '#6a5a4a'), hx, hz, Math.PI, 4, 3.4, 5.9);
    for (let r = 0; r < 6; r++) for (let i = 0; i < 9; i++) add(riceGeo(rnd), -37.5 + i * 1.1, -61.5 + r * 1.5, 0, 1, false);
    add(vatGeo(), -27, -58, 0.1); add(vatGeo(), -27, -60.2, 0.1); box(-28.3, -25.7, -61.2, -57.0);
    add(unionFlagGeo(), -51, cz - 2); add(barrelGeo(), -50, cz + 0.2); add(barrelGeo(), -51, cz + 0.6); add(crateGeo('#8a6a48'), -49, cz - 0.6, 0.3);
    labels.push([STATIONS.charleston, '1 · Charles Town, 1740s', 'the Southern Colonies · rice and indigo']);
  }
  // ===== 2 · Williamsburg: the Capitol, where the House of Burgesses met (capital from 1699)
  { const { x: cx, z: cz } = STATIONS.williamsburg, g = [];
    for (const sx of [-1, 1]) { const bx = sx * 3.2; g.push(P(BOX(4, 4.6, 5), '#a8553a', bx, 2.3, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)); for (const p of roofGeo(4, 5, 1.6, '#5a4a44')) { p.translate(bx, 4.6, 0); g.push(p); } g.push(P(CYL(2.0, 2.0, 4.6, 12, 1, false, 0, Math.PI), '#a8553a', bx, 2.3, -2.5, 0, Math.PI / 2 * (1 + sx), 0)); }
    g.push(P(BOX(2.4, 4.6, 2.4), '#a8553a', 0, 2.3, 0), P(BOX(1.6, 1.6, 1.6), '#f2efe6', 0, 5.4, 0), P(new THREE.ConeGeometry(0.6, 1.6, 6), '#e8e4da', 0, 7.0, 0), P(BOX(1.0, 2.0, 0.08), '#3a5a4a', 0, 1.0, 1.24));
    for (const sx of [-1, 1]) for (const fl of [1.4, 3.3]) g.push(P(BOX(0.6, 0.9, 0.06), '#2a3440', sx * 3.2, fl, 2.53));
    building(M(g), cx - 2, cz + 8, 0, 10.5, 5, 7.6);
    add(unionFlagGeo(), cx + 4.5, cz + 4.4);
    building(brickHouseGeo(3.6, 3, 4, rnd), cx + 7, cz - 6, Math.PI / 2, 3.6, 3, 5.5);
    labels.push([STATIONS.williamsburg, '2 · Williamsburg, Virginia', 'the House of Burgesses · trade']);
  }
  // ===== 3 · A field meeting of the Great Awakening (George Whitefield preached outdoors to huge crowds, 1739–40)
  { const { x: cx, z: cz } = STATIONS.revival;
    add(pulpitGeo(), cx + 12, cz + 12, Math.PI + 0.6); box(cx + 11.1, cx + 12.9, cz + 11.3, cz + 12.7);
    crowd(cx + 7, cz + 9, 16, 3.5, [cx + 12, cz + 12]);
    add(M([P(CYL(0.08, 0.08, 1.4, 5), '#5a3d24', 0, 0.7, 0), P(BOX(1.2, 0.08, 0.6), '#7a5a3a', 0, 0.7, 0)]), cx - 4.5, cz + 5);   // a wagon bench
    labels.push([STATIONS.revival, '3 · A field meeting, 1740', 'the Great Awakening · George Whitefield']);
  }
  // ===== 4 · Philadelphia: Penn's grid of brick houses, a Quaker meetinghouse, Franklin's print shop, the Library Company
  { const { x: cx, z: cz } = STATIONS.philadelphia;
    for (const [hx, hz, ry] of [[-22, 0, 0], [-28, -0.5, 0], [-34, 0, 0], [-20, 16, Math.PI], [-32, 16.5, Math.PI]]) building(brickHouseGeo(4.2, 3.4, 4.6, rnd), hx, hz, ry, 4.2, 3.4, 6.1);
    building(brickHouseGeo(4.6, 3.6, 4.2, rnd, '#b46a4a'), -26, 17, Math.PI, 4.6, 3.6, 5.7);   // the Library Company (1731)
    add(pressGeo(), -35.5, 5.5, 0.4); box(-36.6, -34.4, 4.8, 6.4);
    add(M([P(BOX(1.4, 0.8, 0.7), '#6b4f36', 0, 0.4, 0), P(BOX(1.2, 0.05, 0.5), '#e8e0c8', 0, 0.82, 0)]), -36.5, 2.6, 0.2);   // a table of printed sheets
    building(M([P(BOX(5, 2.6, 3.6), '#a8553a', 0, 1.3, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd), ...roofGeo(5, 3.6, 1.1, '#5a4a44').map(p => { p.translate(0, 2.6, 0); return p; }), P(BOX(0.9, 1.6, 0.06), '#5a3d24', -1.2, 0.8, 1.82), P(BOX(0.9, 1.6, 0.06), '#5a3d24', 1.2, 0.8, 1.82)]), -38, 12, Math.PI / 2, 5, 3.6, 3.7);   // the plain Quaker meetinghouse
    add(unionFlagGeo(), cx + 5, cz - 3);
    labels.push([STATIONS.philadelphia, '4 · Philadelphia, 1740s', 'the Middle Colonies · Penn · Franklin']);
  }
  // ===== 5 · A colonial village lane: the chandler's shop, a smithy, the schoolhouse, a garden
  { const { x: cx, z: cz } = STATIONS.village;
    building(houseGeo(4, 3.4, 2.6, '#c8b890', '#6a5a4a', rnd), cx + 1, cz - 8, 0, 4, 3.4, 4.4);
    add(stallGeo(rnd, '#d8c070'), cx, cz - 5, 0); box(cx - 1.2, cx + 1.2, cz - 5.5, cz - 4.5);
    for (let i = 0; i < 6; i++) add(M([P(CYL(0.04, 0.05, 0.5, 6), '#f4ecd0', 0, 0.25, 0)]), cx - 0.9 + i * 0.36, cz - 5.3, 0, 1, false, gy(cx, cz - 5) + 0.9);   // dipped candles on the stall
    building(houseGeo(3.6, 3, 2.4, '#8a7a64', '#5a4a3a', rnd), cx + 8, cz + 1, -Math.PI / 2, 3.6, 3, 4.2);   // the smithy
    add(M([P(BOX(0.8, 0.5, 0.4), '#3a3a3a', 0, 0.75, 0), P(CYL(0.25, 0.3, 0.5, 6), '#5a3d24', 0, 0.25, 0)]), cx + 5.5, cz + 1.5); circ(cx + 5.5, cz + 1.5, 0.5);   // anvil on its stump
    building(houseGeo(4.4, 3.6, 2.6, '#a8202a', '#5a4a3a', rnd), cx - 1, cz + 7, Math.PI, 4.4, 3.6, 4.4);   // the little red schoolhouse
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) add(M([P(new THREE.SphereGeometry(0.3, 6, 4), '#5a8a3a', 0, 0.2, 0, 0, 0, 0, 1, 0.6, 1)]), 3 + i * 1.4, 29 + r * 1.6, 0, 1, false);
    labels.push([STATIONS.village, '5 · A colonial village lane', 'daily life and crafts']);
  }
  // ===== 6 · Boston: Long Wharf, King Street up to the Town House, a steepled meetinghouse, fishing boats
  { const { x: cx, z: cz } = STATIONS.boston;
    add(M([P(BOX(10, 0.3, 2.6, ), '#7a5a3a', 0, 0, 0)]), -55, cz, 0, 1, true, 0.05); box(-60, -50, cz - 1.3, cz + 1.3);
    add(shipGeo('caravel', 'square'), -60, cz - 5, Math.PI / 2 + 0.1, 0.55, true, WATER_Y - 0.15); shipOcc('caravel', -60, cz - 5, 0.55); add(shipGeo('nao', 'square'), -62, cz + 6, Math.PI / 2 - 0.1, 0.65, true, WATER_Y - 0.15); shipOcc('nao', -62, cz + 6, 0.65);
    building(brickHouseGeo(5, 3.6, 4.8, rnd, '#a8553a'), -48, cz + 3.5, Math.PI / 2, 5, 3.6, 6.3);   // the Town House (1713), at the head of King Street
    building(steepleGeo(5, 7, 3.6, rnd), -44, 34, Math.PI, 5, 9, 9.5);   // the meetinghouse
    for (const [hx, hz, ry] of [[-36, 52, Math.PI], [-30, 52, Math.PI], [-50, 37, 0]]) building(houseGeo(3.8, 3.2, 2.6, '#9a8a70', '#5a4a3a', rnd), hx, hz, ry, 3.8, 3.2, 4.4);
    for (let i = 0; i < 3; i++) add(M([P(BOX(2.2, 0.05, 0.05), '#5a3d24', 0, 1.2, 0), P(CYL(0.04, 0.04, 1.2, 4), '#5a3d24', -1, 0.6, 0), P(CYL(0.04, 0.04, 1.2, 4), '#5a3d24', 1, 0.6, 0), ...[-0.6, 0, 0.6].map(x => P(BOX(0.12, 0.45, 0.04), '#c8c0a8', x, 0.95, 0))]), -49, cz - 4 + i * 1.4, 0.1);   // cod drying on a flake
    add(unionFlagGeo(), -50.5, cz + 2);
    labels.push([STATIONS.boston, '6 · Boston, 1740s', 'New England · the town meeting']);
  }
  // ===== 7 · Albany, 1754: the Albany Congress met in the Stadt Huys (city hall) beside the Hudson, with Haudenosaunee leaders
  { const { x: cx, z: cz } = STATIONS.gate, g = [P(BOX(6, 4.2, 5), '#b8a088', 0, 2.1, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
    for (let i = 0; i < 4; i++) g.push(P(BOX(6 - i * 1.4, 0.7, 0.4), '#b8a088', 0, 4.55 + i * 0.7, 2.3));   // a Dutch stepped gable
    for (const p of roofGeo(6, 5, 2.8, '#6a4a3a')) { p.translate(0, 4.2, 0); g.push(p); }
    g.push(P(BOX(1.1, 2.0, 0.08), '#3a2a1a', 0, 1.0, 2.53), P(BOX(0.7, 0.9, 0.06), '#2a3440', -1.8, 2.8, 2.53), P(BOX(0.7, 0.9, 0.06), '#2a3440', 1.8, 2.8, 2.53));
    building(M(g), cx, cz + 7, Math.PI, 6, 5, 8);
    const jd = joinOrDieTex(); jd.position.set(cx + 3.5, gy(cx + 3.5, cz - 1.6) + 1.9, cz - 1.6); jd.rotation.y = Math.PI; jd.name = 'join-or-die'; scene.add(jd);
    add(M([P(CYL(0.06, 0.06, 2.6, 5), '#5a3d24', -1.6, 1.3, 0), P(CYL(0.06, 0.06, 2.6, 5), '#5a3d24', 1.6, 1.3, 0)]), cx + 3.5, cz - 1.5, 0);
    add(unionFlagGeo(), cx - 4, cz + 4);
    add(M([P(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), '#8a6a42', 0, 0.38, 0, Math.PI, 0, 0, 0.55, 0.3, 2.8)]), 37.5, 50, 0.15, 1, true, WATER_Y + 0.05);   // a bark canoe on the Hudson
    labels.push([STATIONS.gate, '7 · Albany, 1754', 'the Albany Congress · the Trial']);
  }

  // ===== scatter: pines and live oaks in the south, oaks everywhere, maples and birches in New England
  const near = (x, z, pad) => { for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return true; } return false; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const fieldZone = (x, z) => (x > -39 && x < -27 && z > -63 && z < -51) || (x > 1 && x < 11 && z > 27 && z < 35);
  const spots = (count, ok, minPath = 3, pad = 1.5) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 80) {
      const x = -92 + rnd() * 184, z = -92 + rnd() * 184, h = groundH(x, z);
      if (h < 0.15 || pathDist(x, z) < minPath || near(x, z, 2) || blocked(x, z, pad) || fieldZone(x, z) || !ok(x, z, h)) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name; scene.add(m); return m; };
  const sc = () => 0.8 + rnd() * 0.45;
  const pines = spots(70, (x, z) => z < 20).map(([x, z]) => [x, z, sc()]);
  const oaks = spots(60, () => true).map(([x, z]) => [x, z, sc()]);
  const maples = spots(50, (x, z) => z >= 16).map(([x, z]) => [x, z, sc()]);
  const birches = spots(24, (x, z) => z > 34, 2.5, 1.2).map(([x, z]) => [x, z, 0.8 + rnd() * 0.3]);
  const oakGeo = M([P(CYL(0.2, 0.28, 2.0, 6), '#5e4a34', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.9, 1), '#4a6e36', 0, 2.8, 0, 0, 0, 0, 1.3, 0.7, 1.3, 0.2, rnd)]);
  const mapleGeo = M([P(CYL(0.18, 0.26, 2.0, 6), '#5a4634', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.7, 1), '#c8642a', 0, 3.0, 0, 0, 0, 0, 1.1, 0.9, 1.1, 0.25, rnd)]);
  const birchGeo = M([P(CYL(0.1, 0.14, 3.4, 6), '#e8e4da', 0, 1.7, 0), P(new THREE.IcosahedronGeometry(1.1, 0), '#d8b03a', 0, 3.8, 0, 0, 0, 0, 0.9, 1.2, 0.9, 0.2, rnd)]);
  const pineGeo = M([P(CYL(0.14, 0.2, 3.2, 6), '#6e5038', 0, 1.6, 0), P(new THREE.ConeGeometry(1.4, 2.6, 7), '#2f5a32', 0, 3.8, 0, 0, 0, 0, 1, 1, 1, 0.15, rnd), P(new THREE.ConeGeometry(1.0, 2.0, 7), '#36643a', 0, 5.0, 0)]);
  inst(pineGeo, pines, true, 'pines'); inst(oakGeo, oaks, true, 'oaks'); inst(mapleGeo, maples, true, 'maples'); inst(birchGeo, birches, true, 'birches');
  for (const L of [pines, oaks, maples, birches]) for (const [x, z, s] of L) { circ(x, z, 0.28 * s + 0.12); occC(x, z, 1.6 * s, groundH(x, z) + 4.5 * s, groundH(x, z) + 1.8 * s); }
  const tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#8a9a50', 0.2, rnd), rockGeo = vc(new THREE.DodecahedronGeometry(0.6, 0), '#8a8076', 0.2, rnd);
  inst(tuftGeo, spots(360, (x, z, h) => h < 6, 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6]), false, 'tufts');
  inst(rockGeo, spots(40, (x, z) => z > 10, 2.2, 0.6).map(([x, z]) => [x, z, 0.4 + rnd() * 0.6]), true, 'rocks');
  { const g = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, R = 190 + rnd() * 40, x = Math.cos(a) * R, z = Math.sin(a) * R; if (x < -60) continue; const h = 10 + rnd() * 12;   // the Appalachians, far to the west
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
  }
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen() {}, tracks: [], herds: {}, flames: [], water, fogColor: SKY_H, sky: scene.userData.sky, mats: [], dropBundle() {}, clearBundles() {}, regionLabels };
}
