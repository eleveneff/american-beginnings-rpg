// world/independence.js — Section 9 walkable level: "Independence Declared" (1775–1776).
// Abigail walks, south to north, in story order (distances shrunk; directions true: north = +z, WEST = +x):
// Lexington Green, April 19, 1775 → Concord and the North Bridge → Breed's Hill, June 17 (the Battle of
// Bunker Hill) → Cambridge Common, where Washington took command on July 3, 1775 → a story jump down
// the post road to Philadelphia, 1776 → the Pennsylvania State House (Independence Hall) and the Trial.
// Accuracy: the battle called Bunker Hill was fought on Breed's Hill. Revere was captured; Prescott
// reached Concord. The Second Congress met in the State House, not Carpenters' Hall. British flags are
// the Union flag of 1707 (no St Patrick saltire). No Stars and Stripes (that flag is 1777). In July 1776
// the State House yard has no national flag (we do not invent one). The 1776 wooden steeple — already
// decaying, taken down in 1781 and rebuilt in 1828 — is shown as it stood that summer: a full brick
// clock tower with a white wooden belfry, cupola and spire. Nothing here touches the save.
import * as THREE from 'three';
import { vc, P, M, rng, CYL, BOX, roofGeo, houseGeo, makeRing, barrelGeo, crateGeo, labelSprite, setRingState, RING_COL } from './voyage.js';
export { labelSprite, setRingState, RING_COL };

export const WATER_Y = -0.4, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const STATIONS = {
  lexington: { x: -6, z: -58, r: 9, label: 'Lexington Green, April 19, 1775', n: 1, dir: 'start' },
  concord: { x: -26, z: -26, r: 20, label: 'Concord, the North Bridge', n: 2, dir: 'north-west, up the Bay Road' },
  bunkerhill: { x: 16, z: 6, r: 10, label: "Breed's Hill, June 17, 1775", n: 3, dir: 'north-east, to Charlestown' },
  cambridge: { x: -12, z: 34, r: 9, label: 'Cambridge Common, July 3, 1775', n: 4, dir: 'north-west, to Cambridge' },
  gate: { x: 8, z: 74, r: 10, label: 'Independence Hall, Philadelphia, 1776', n: 5, dir: 'the post road to Philadelphia (Trial)' }
};
export const ROADS = [
  // Lexington Green → east bank of the Concord River → over the North Bridge to the west (far) bank → Breed's Hill
  [[-6, -66], [-6, -58], [-14, -44], [-44, -36], [-44, -24], [-26, -24], [-26, -26]],
  [[-26, -26], [-26, -16], [-8, -10], [16, 6]],
  [[16, 6], [2, 20], [-12, 34], [6, 41]],
  [[8, 60], [8, 74], [8, 90]]
];
export function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
export function pathDist(x, z) { let d = 1e9; for (const R of ROADS) for (let i = 1; i < R.length; i++) d = Math.min(d, distSeg(x, z, R[i - 1][0], R[i - 1][1], R[i][0], R[i][1])); return d; }
export const PATH = ROADS[0];
export const BOUNDS = { x0: -70, x1: 70, z0: -72, z1: 112 };
export const RIVER_S = 47, RIVER_N = 56;
export const riverZ = () => -9999;
export const SHORE_X = () => -999;   // no harbor in this countryside / Philadelphia level
// Concord River: a slow, gently curving north–south stream. West is +x (militia, the far bank); east is −x (regulars).
export const CONCORD_RX = -32, CONCORD_HW = 4.2, CONCORD_Z0 = -46, CONCORD_Z1 = -6, CONCORD_BZ = -24;
export function concordCenterX(z) {
  const dz = z - CONCORD_BZ;
  return CONCORD_RX
    + 3.4 * Math.sin(dz * 0.11)
    + 1.0 * (Math.sin(z * 0.05 + 0.8) - Math.sin(CONCORD_BZ * 0.05 + 0.8))
    + 0.7 * (Math.sin(z * 0.37 + 1.7) - Math.sin(CONCORD_BZ * 0.37 + 1.7));
}
export function concordHW(z) { return CONCORD_HW + 1.05 * Math.sin(z * 0.19 + 0.4) + 0.5 * Math.sin(z * 0.73 + 1.1); }
export function concordRiverW(x, z) {
  const along = smooth(CONCORD_Z0 - 4, CONCORD_Z0 + 6, z) * smooth(CONCORD_Z1 + 4, CONCORD_Z1 - 6, z);
  const hw = concordHW(z) + 0.55 * Math.sin(z * 0.91 + x * 0.15);
  const across = smooth(hw + 2.5, hw - 0.15, Math.abs(x - concordCenterX(z)));
  return along * across;
}
export function concordWestRise(x, z) {
  const cx = concordCenterX(CONCORD_BZ) + 12, cz = CONCORD_BZ + 7;
  const d = Math.hypot(x - cx, z - cz);
  return 3.4 * smooth(12, 3.5, d) * (1 - concordRiverW(x, z));
}
export const BRIDGE = { x0: CONCORD_RX - 10, x1: CONCORD_RX + 10, z0: CONCORD_BZ - 1.35, z1: CONCORD_BZ + 1.35, top: 1.18 };
function rawH(x, z) {
  let h = 0.55 + 0.28 * Math.sin(x * 0.07) * Math.cos(z * 0.06);
  // Breed's Hill: a real rise around station bunkerhill, flattened on top for the redoubt
  const dh = Math.hypot(x - STATIONS.bunkerhill.x, z - STATIONS.bunkerhill.z);
  h += 4.4 * smooth(18, 7, dh);
  // a low field ridge west of Lexington
  h += 0.8 * smooth(20, 40, x) * smooth(-70, -50, z) * smooth(-40, -62, z);
  // the story-jump river band between Cambridge and Philadelphia
  const w = smooth(RIVER_S - 0.6, RIVER_S + 1.4, z) * smooth(RIVER_N + 0.6, RIVER_N - 1.4, z);
  h = h * (1 - w) + -3.0 * w;
  // the Concord River under the North Bridge (and beyond it, both ways)
  const cr = concordRiverW(x, z);
  h = h * (1 - cr) + -1.8 * cr;
  return h;
}
const FLAT = {}; for (const k in STATIONS) { const s = STATIONS[k]; FLAT[k] = rawH(s.x, s.z); }
// flatten Lexington, Concord, Cambridge, and the State House yard; keep Breed's Hill high but level on top
FLAT.bunkerhill = rawH(STATIONS.bunkerhill.x, STATIONS.bunkerhill.z);
FLAT.concord = Math.max(0.55, rawH(-18, -20));   // dry west-bank field, not a river-shoulder sample
export function groundH(x, z) {
  let h = rawH(x, z);
  for (const k in STATIONS) {
    const s = STATIONS[k], d = Math.hypot(x - s.x, z - s.z);
    const flattenR = k === 'concord' ? 8 : s.r + 4;
    if (d < flattenR && concordRiverW(x, z) < 0.06) h += (FLAT[k] - h) * smooth(flattenR, Math.max(2, flattenR - 4), d) * (h > -0.5 ? 1 : 0);
  }
  const pd = pathDist(x, z); if (pd < 3 && h > 0) h -= 0.05 * smooth(3, 1, pd);
  h += concordWestRise(x, z);
  return h;
}
export const shoreZ = () => 9999;
export const STONES = [], FORD_ROWS = 0, FORD_RESPAWN = { x: -6, z: -64, yaw: 0 };
export function onStone(x, z, pad = 0) { const p = BRIDGE; if (x > p.x0 - pad && x < p.x1 + pad && z > p.z0 - pad && z < p.z1 + pad) return p; return null; }
export function walkY(x, z) { const s = onStone(x, z); return s ? s.top : groundH(x, z); }
export function solid(x, z) { if (onStone(x, z)) return false; return groundH(x, z) < WATER_Y + 0.25; }
export const HARBORS = {
  south: { x: 6, z: 43.5, yaw: Math.PI, label: 'Cambridge, the post road south' },
  north: { x: 8, z: 59.5, yaw: 0, label: 'Philadelphia, Chestnut Street' }
};
export const MATS = [];
export const MAT_HALF = 1.2;
export const RING_AT = {
  l0: [-1.5, -55], buckman: [-10.5, -54], riders: [-1.5, -61], l7: [-10.5, -61],
  l1: [-21, -22], bridge: [-25, -24], sequence: [-22, -31], adams: [-20, -34],
  l3: [10, 14], hill: [22, 10],
  l2: [-12, 37], washington: [-5, 34], 'ride-south': [6, 41],
  'ride-north': [8, 62], l4: [3, 77], hall: [13, 77], l5: [3, 70], l6: [13, 70],
  market: [-2, 74], l8: [3, 82.5], geomap: [13, 82.5], timeline: [8, 85], trial: [8, 79]
};

// ---------------- props ----------------
function unionFlagGeo(h = 7) {   // the British Union flag of 1707 (crosses of St. George and St. Andrew)
  const g = [P(CYL(0.07, 0.09, h, 6), '#6b4f36', 0, h / 2, 0)], fy = h - 0.6, fx = 1.0;
  g.push(P(BOX(1.9, 1.2, 0.04), '#1f3a7a', fx, fy, 0), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, 0.56), P(BOX(2.2, 0.16, 0.05), '#f4f1e6', fx, fy, 0, 0, 0, -0.56));
  g.push(P(BOX(1.9, 0.32, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(0.36, 1.2, 0.06), '#f4f1e6', fx, fy, 0), P(BOX(1.9, 0.18, 0.07), '#c0302a', fx, fy, 0), P(BOX(0.2, 1.2, 0.07), '#c0302a', fx, fy, 0));
  return M(g);
}
function personGeo(coat, hat = '#2a2622', skirt) {
  if (skirt) return M([P(CYL(0.2, 0.34, 0.7, 7), skirt, 0, 0.35, 0), P(CYL(0.15, 0.2, 0.36, 6), coat, 0, 0.86, 0), P(new THREE.SphereGeometry(0.14, 6, 5), '#e0b890', 0, 1.15, 0), P(new THREE.SphereGeometry(0.15, 6, 4, 0, 6.3, 0, 1.6), '#f2eee2', 0, 1.2, 0)]);
  return M([P(CYL(0.18, 0.24, 0.9, 6), coat, 0, 0.45, 0), P(new THREE.SphereGeometry(0.15, 6, 5), '#e0b890', 0, 1.05, 0), P(CYL(0.24, 0.24, 0.06, 3), hat, 0, 1.18, 0)]);
}
function soldierGeo(coat, cuff, legs = '#e8e2d2') {
  return M([P(CYL(0.08, 0.08, 0.5, 5), legs, -0.09, 0.25, 0), P(CYL(0.08, 0.08, 0.5, 5), legs, 0.09, 0.25, 0), P(CYL(0.17, 0.26, 0.62, 6), coat, 0, 0.72, 0),
    P(BOX(0.1, 0.42, 0.12), coat, -0.25, 0.8, 0), P(BOX(0.1, 0.42, 0.12), coat, 0.25, 0.8, 0), P(BOX(0.12, 0.1, 0.14), cuff, -0.25, 0.6, 0), P(BOX(0.12, 0.1, 0.14), cuff, 0.25, 0.6, 0),
    P(BOX(0.36, 0.05, 0.05), '#f2eee2', 0, 0.8, 0.2, 0, 0, 0.7), P(new THREE.SphereGeometry(0.14, 6, 5), '#e0b890', 0, 1.15, 0), P(CYL(0.012, 0.016, 1.2, 4), '#4a3a2a', 0.27, 1.0, -0.05, 0.12, 0, 0),
    P(CYL(0.24, 0.24, 0.07, 3), '#1e1c1a', 0, 1.27, 0)]);
}
function militiaGeo(coat = '#c8b888') {   // a colonial militiaman in a hunting shirt, no formal uniform
  return M([P(CYL(0.08, 0.08, 0.5, 5), '#3a2a1a', -0.09, 0.25, 0), P(CYL(0.08, 0.08, 0.5, 5), '#3a2a1a', 0.09, 0.25, 0), P(CYL(0.2, 0.26, 0.7, 6), coat, 0, 0.75, 0),
    P(new THREE.SphereGeometry(0.14, 6, 5), '#e0b890', 0, 1.18, 0), P(CYL(0.2, 0.2, 0.08, 3), '#3a2a1a', 0, 1.3, 0), P(CYL(0.012, 0.016, 1.15, 4), '#4a3a2a', 0.26, 1.0, -0.05, 0.12, 0, 0)]);
}
function brickHouseGeo(w, d, h, rnd, wall = '#9a4a32', roof = '#3a3e48') {
  const g = [P(BOX(w, h, d), wall, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
  for (const p of roofGeo(w, d, 1.4, roof)) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(0.6, 1.4, 0.6), '#7a3a2a', -w / 2 + 0.5, h + 0.9, 0), P(BOX(0.6, 1.4, 0.6), '#7a3a2a', w / 2 - 0.5, h + 0.9, 0));
  g.push(P(BOX(0.9, 1.7, 0.08), '#2a3a2a', 0, 0.85, d / 2 + 0.02));
  for (const sx of [-1, 1]) for (const fy of [0.45, 0.78]) g.push(P(BOX(0.55, 0.75, 0.06), '#e8e4da', sx * w * 0.3, h * fy, d / 2 + 0.03), P(BOX(0.42, 0.62, 0.07), '#2a3440', sx * w * 0.3, h * fy, d / 2 + 0.04));
  return M(g);
}
function meetinghouseGeo(rnd) {   // a New England meetinghouse: wooden, a square tower and a modest steeple
  const g = [P(BOX(5.2, 3.6, 3.6), '#d8cbb0', 0, 1.8, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)];
  for (const p of roofGeo(5.2, 3.6, 1.6, '#4a3a32')) { p.translate(0, 3.6, 0); g.push(p); }
  g.push(P(BOX(1.7, 3.2, 1.7), '#efe8d6', 0, 3.6 + 1.6, -0.4), P(new THREE.ConeGeometry(0.7, 2.4, 8), '#efe8d6', 0, 3.6 + 1.6 + 1.6 + 1.2, -0.4));
  g.push(P(BOX(1.0, 2.0, 0.08), '#2a3a2a', 0, 1.0, 1.82));
  for (const sx of [-1.5, 1.5]) g.push(P(BOX(0.55, 0.9, 0.06), '#e8e4da', sx, 2.2, 1.83), P(BOX(0.42, 0.76, 0.07), '#2a3440', sx, 2.2, 1.84));
  return M(g);
}
function tavernGeo(rnd) {   // Buckman Tavern: a long clapboard inn
  const g = [P(BOX(6.4, 3.4, 3.2), '#c8b490', 0, 1.7, 0, 0, 0, 0, 1, 1, 1, 0.05, rnd)];
  for (const p of roofGeo(6.4, 3.2, 1.5, '#4a3e38')) { p.translate(0, 3.4, 0); g.push(p); }
  g.push(P(BOX(0.55, 1.3, 0.55), '#7a3a2a', -2.4, 4.7, 0), P(BOX(0.9, 1.8, 0.08), '#2a3a2a', 0, 0.9, 1.62));
  for (const sx of [-2.0, 2.0]) g.push(P(BOX(0.5, 0.7, 0.06), '#e8e4da', sx, 2.1, 1.63), P(BOX(0.38, 0.58, 0.07), '#2a3440', sx, 2.1, 1.64));
  return M(g);
}
function independenceHallGeo(rnd) {   // Pennsylvania State House as it stood in 1776: long brick hall, a full brick clock tower, and the original wooden steeple (already decaying; taken down in 1781, rebuilt 1828 — we show the 1776 one, not Strickland's)
  const w = 16, d = 5.0, h = 5.0, brick = '#a5523a', wood = '#efe6d0', woodDark = '#e6d9b8';
  const g = [P(BOX(w, h, d), brick, 0, h / 2, 0, 0, 0, 0, 1, 1, 1, 0.04, rnd)];
  for (const p of roofGeo(w, d, 1.8, '#3a3e48')) { p.translate(0, h, 0); g.push(p); }
  g.push(P(BOX(w + 0.12, 0.2, d + 0.12), '#efe8d6', 0, h, 0));
  for (let i = -5; i <= 5; i++) if (i && Math.abs(i) > 1) g.push(P(BOX(0.55, 1.0, 0.06), '#e8e4da', i * 1.28, h * 0.62, d / 2 + 0.03), P(BOX(0.42, 0.86, 0.07), '#2a3440', i * 1.28, h * 0.62, d / 2 + 0.04));
  g.push(P(BOX(1.5, 2.5, 0.08), '#f2eee2', 0, 1.25, d / 2 + 0.02), P(BOX(1.25, 2.3, 0.09), '#2a3a2a', 0, 1.15, d / 2 + 0.03));
  // full brick clock tower, from the ground, slightly proud of the south facade, rising well above the roof
  const tw = 3.5, td = 3.6, th = 11.2, tz = d / 2 - td / 2 + 0.15;
  g.push(P(BOX(tw, th, td), brick, 0, th / 2, tz, 0, 0, 0, 1, 1, 1, 0.04, rnd));
  g.push(P(BOX(tw + 0.15, 0.22, td + 0.15), '#efe8d6', 0, th, tz));
  // clock faces (south facade and north)
  for (const fz of [tz + td / 2 + 0.04, tz - td / 2 - 0.04]) {
    g.push(P(CYL(0.7, 0.7, 0.08, 12), '#efe8d6', 0, 9.0, fz));
    g.push(P(BOX(0.06, 0.45, 0.04), '#2a2018', 0, 9.15, fz + (fz > 0 ? 0.02 : -0.02)));
    g.push(P(BOX(0.32, 0.06, 0.04), '#2a2018', 0.12, 9.0, fz + (fz > 0 ? 0.02 : -0.02)));
  }
  // white wooden belfry (arched openings) — the 1776 wooden steeple, slightly weathered
  const by = th + 1.5;
  g.push(P(BOX(2.7, 3.0, 2.7), wood, 0, by, tz, 0, 0, 0, 1, 1, 1, 0.03, rnd));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const ox = Math.sin(a) * 1.38, oz = tz + Math.cos(a) * 1.38;
    g.push(P(BOX(a % Math.PI === 0 ? 1.0 : 0.1, 1.7, a % Math.PI === 0 ? 0.1 : 1.0), '#3a2a22', ox, by - 0.15, oz));
  }
  // smaller lantern / cupola
  const ly = th + 3.0 + 1.15;
  g.push(P(BOX(1.7, 1.8, 1.7), woodDark, 0, ly, tz));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const ox = Math.sin(a) * 0.88, oz = tz + Math.cos(a) * 0.88;
    g.push(P(BOX(a % Math.PI === 0 ? 0.7 : 0.08, 1.1, a % Math.PI === 0 ? 0.08 : 0.7), '#3a2a22', ox, ly, oz));
  }
  // slender wooden spire and gold finial
  const sy = th + 3.0 + 1.8 + 2.3;
  g.push(P(new THREE.ConeGeometry(1.05, 4.6, 8), wood, 0, sy, tz));
  g.push(P(CYL(0.04, 0.04, 1.1, 4), '#c9a227', 0, sy + 2.3 + 0.5, tz));
  return M(g);
}
function elmGeo(rnd) {
  const g = [P(CYL(0.6, 0.85, 4.2, 8), '#5a4634', 0, 2.1, 0, 0, 0, 0, 1, 1, 1, 0.08, rnd)];
  for (const [a, l] of [[0, 3.4], [2.1, 3.0], [4.2, 3.2]]) g.push(P(CYL(0.22, 0.34, l, 6), '#5a4634', Math.cos(a) * 0.9, 4.9, Math.sin(a) * 0.9, Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45));
  for (const [x, y, z, s] of [[0, 7.6, 0, 3.4], [2.0, 6.6, 1.2, 2.4], [-2.0, 6.8, -0.6, 2.5], [0.6, 6.4, -2.0, 2.3], [-0.8, 6.2, 2.0, 2.2]]) g.push(P(new THREE.IcosahedronGeometry(s, 1), '#5f8a3a', x, y, z, 0, 0, 0, 1, 0.75, 1, 0.25, rnd));
  return M(g);
}
function bridgeGeo() {   // wooden trestle on piers spanning the Concord River, east–west (along +x = west)
  const span = 20, width = 2.6, deckY = 1.08, thick = 0.18;
  const g = [];
  for (let i = 0; i < 16; i++) {
    const x = -span / 2 + 0.55 + i * ((span - 0.2) / 16);
    g.push(P(BOX(0.95, thick, width - 0.08), i % 2 ? '#7a6448' : '#6e5a40', x, deckY, 0));
  }
  g.push(P(BOX(span, 0.2, 0.16), '#5a4632', 0, deckY - 0.14, width / 2 - 0.08));
  g.push(P(BOX(span, 0.2, 0.16), '#5a4632', 0, deckY - 0.14, -width / 2 + 0.08));
  for (const z of [width / 2 - 0.08, -width / 2 + 0.08]) {
    g.push(P(BOX(span - 0.4, 0.08, 0.08), '#6a5438', 0, deckY + 0.72, z));
    g.push(P(BOX(span - 0.4, 0.06, 0.06), '#6a5438', 0, deckY + 0.38, z));
    for (let i = 0; i <= 10; i++) g.push(P(CYL(0.045, 0.05, 0.78, 5), '#5a4632', -span / 2 + 0.8 + i * (span - 1.6) / 10, deckY + 0.4, z));
  }
  for (const x of [-6.2, -2.1, 2.1, 6.2]) {
    for (const z of [-0.9, 0.9]) g.push(P(CYL(0.22, 0.26, 3.8, 6), '#6a5440', x, deckY - 1.85, z));
    g.push(P(BOX(0.1, 0.1, 1.9), '#5a4632', x, deckY - 0.85, 0, 0.4, 0, 0));
  }
  return M(g);
}
function reedClump(rnd) {
  const g = [];
  const n = 5 + (rnd() * 5 | 0);
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.28, r = 0.08 + rnd() * 0.42, h = 0.65 + rnd() * 1.0;
    const col = rnd() < 0.45 ? '#3a5a2c' : (rnd() < 0.5 ? '#4a6a34' : '#5a6e38');
    g.push(P(new THREE.ConeGeometry(0.035 + rnd() * 0.03, h, 4), col, Math.cos(a) * r, h / 2, Math.sin(a) * r));
  }
  return M(g);
}
function makeConcordWater() {
  const z0 = CONCORD_Z0 - 2, z1 = CONCORD_Z1 + 2, segs = 56, across = 10;
  const pos = [], uvs = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const z = z0 + (z1 - z0) * (i / segs), cx = concordCenterX(z), hw = concordHW(z) + 2.6;
    for (let j = 0; j <= across; j++) {
      const tt = j / across * 2 - 1;
      pos.push(cx + tt * hw, WATER_Y + 0.06, z);
      uvs.push((tt + 1) / 2, i / segs);
    }
  }
  const cols = across + 1;
  for (let i = 0; i < segs; i++) for (let j = 0; j < across; j++) {
    const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: '#152e30', transparent: true, opacity: 0.98, depthWrite: false }));
  mesh.userData.noMerge = true; mesh.name = 'concord-water'; mesh.renderOrder = 3;
  mesh.userData.baseY = Float32Array.from(pos.filter((_, i) => i % 3 === 1));
  return mesh;
}
function redoubtGeo() {   // a low earth wall on Breed's Hill
  const g = [];
  for (const [x, z, w, d] of [[0, -3.2, 8, 1.2], [-4.2, 0, 1.2, 6], [4.2, 0, 1.2, 6]]) g.push(P(BOX(w, 1.1, d), '#6a5a3a', x, 0.45, z));
  return M(g);
}
function stoneWallGeo(len = 4) {
  return M([P(BOX(len, 0.7, 0.4), '#8a8278', 0, 0.35, 0), P(BOX(len * 0.9, 0.25, 0.35), '#9a9288', 0, 0.72, 0)]);
}
function broadsideTex(title, lines) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320; const x = c.getContext('2d');
  x.fillStyle = '#efe4c8'; x.fillRect(0, 0, 256, 320); x.fillStyle = '#2a2018'; x.textAlign = 'center';
  x.font = 'bold 30px Georgia, serif'; x.fillText(title, 128, 52); x.fillRect(30, 68, 196, 3);
  x.font = '20px Georgia, serif'; lines.forEach((l, i) => x.fillText(l, 128, 112 + i * 34));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), new THREE.MeshLambertMaterial({ map: tex })); m.userData.noMerge = true; return m;
}

// ---------------- build ----------------
export function buildIndependence({ mergeAO, rings: ringDefs, matLabels = {} }) {
  const rnd = rng(17751776);
  const scene = new THREE.Scene(); scene.name = 'independence76';
  const SKY_TOP = new THREE.Color('#6a9ccc'), SKY_H = new THREE.Color('#e8e6e0');
  scene.fog = new THREE.Fog(SKY_H, 90, 300);
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), LOW = new THREE.Color('#9aa0a0');
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; if (y < 0) c.copy(SKY_H).lerp(LOW, Math.min(1, -y * 6)); else c.copy(SKY_H).lerp(SKY_TOP, Math.pow(y, 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky; }
  const hemi = new THREE.HemisphereLight('#e8eef8', '#6a7a4a', 0.72); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff4dc', 0.95); sun.position.set(-40, 70, 30); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = sun.shadow.camera.bottom = -90; sun.shadow.camera.right = sun.shadow.camera.top = 90; sun.shadow.camera.near = 1; sun.shadow.camera.far = 200; scene.add(sun);

  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });
  const GRASS = new THREE.Color('#6a8a46'), PATH = new THREE.Color('#9b7a52'), DIRT = new THREE.Color('#7a6a4a'), HILL = new THREE.Color('#7a8a50'), WATERISH = new THREE.Color('#4a6a58'), MUD = new THREE.Color('#6b5a3c'), WETGRASS = new THREE.Color('#5a6a40');
  function terrColor(x, z, c) {
    const h = groundH(x, z), pd = pathDist(x, z);
    c.copy(GRASS);
    if (pd < 2.4) c.lerp(PATH, smooth(2.4, 0.6, pd));
    const dh = Math.hypot(x - STATIONS.bunkerhill.x, z - STATIONS.bunkerhill.z);
    if (dh < 16) c.lerp(HILL, smooth(16, 6, dh) * 0.6);
    const cr = concordRiverW(x, z);
    if (cr > 0.04 && h > -0.35) c.lerp(MUD, Math.min(0.85, cr * 1.2)).lerp(WETGRASS, 0.3);
    if (h < 0.2) c.lerp(WATERISH, smooth(0.2, -0.5, h));
    const f = (Math.sin(x * 1.7) * Math.cos(z * 1.3) + 1) * 0.5;
    c.offsetHSL(0, 0, (f - 0.5) * 0.06);
    return c;
  }
  function terrNormals(geo) { geo.computeVertexNormals(); }
  const terrain = new THREE.Group(); terrain.name = 'terrain'; scene.add(terrain);
  for (let tx = 0; tx < 4; tx++) for (let tz = 0; tz < 5; tz++) {   // 5 tiles in z so the State House yard (BOUNDS.z1 = 112) is on land, not water
    const W = 46, D = 46, geo = new THREE.PlaneGeometry(W, D, 40, 40); geo.rotateX(-Math.PI / 2); geo.translate(-92 + W * (tx + 0.5), 0, -92 + D * (tz + 0.5));
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

  // 1 · Lexington Green
  { const { x: cx, z: cz } = STATIONS.lexington;
    add(elmGeo(rnd), cx - 8, cz + 3, 0, 0.85);
    building(meetinghouseGeo(rnd), cx + 8, cz + 6, Math.PI, 5.2, 3.6, 7.2);
    building(tavernGeo(rnd), cx - 11, cz - 2, Math.PI / 2, 6.4, 3.2, 5.2);
    add(stoneWallGeo(8), cx + 2, cz + 8, 0.2); box(cx - 2, cx + 6, cz + 7.7, cz + 8.3);
    line(i => militiaGeo(['#c8b888', '#8a6a44', '#4a3a2a'][i % 3]), cx - 13, cz + 1, cx - 13, cz + 6, 5, [cx, cz]);   // west of the Green, keep the road at x=-6 clear
    line(i => soldierGeo('#b22222', '#e8d27a'), cx - 4, cz - 10, cx + 4, cz - 10, 6, [cx, cz]);
    add(unionFlagGeo(6.5), cx + 6, cz - 9, 0, 1, true);
    circ(cx + 6, cz - 9, 0.3);
    poster('ALARM', ['The Regulars', 'are out!', 'April 19, 1775'], cx - 9.6, cz + 1, Math.PI / 2);
    labels.push([STATIONS.lexington, '1 · Lexington Green, April 19, 1775', 'Parker’s men · the first shot']);
  }

  // 2 · Concord North Bridge — a natural river flowing across the view; a trestle crosses it toward the militia
  { const { x: cx, z: cz } = STATIONS.concord;
    const cWater = makeConcordWater();
    scene.add(cWater);
    scene.userData.concordWater = cWater;
    add(bridgeGeo(), CONCORD_RX, CONCORD_BZ, 0, 1, true, 0);
    // Concord village houses sit on the east bank, off the sightline down the path to the bridge
    building(houseGeo(4.0, 3.2, 3.0, '#c8b490', '#4a3e38', rnd), CONCORD_RX - 18, CONCORD_BZ + 14, 0.4, 4.0, 3.2, 5.0);
    building(houseGeo(3.6, 3.0, 2.8, '#b8a888', '#3a3a40', rnd), CONCORD_RX - 17, CONCORD_BZ - 16, -0.3, 3.6, 3.0, 4.6);
    add(stoneWallGeo(6), cx + 10, cz + 14, 0.4); box(cx + 7, cx + 13, cz + 13.7, cz + 14.3);
    const hx = concordCenterX(CONCORD_BZ) + 11, hz = CONCORD_BZ + 6;
    line(i => militiaGeo('#8a6a44'), hx - 2.5, hz + 2, hx + 2, hz - 1.5, 5, [CONCORD_RX, CONCORD_BZ]);   // west-bank rise, visible past the far end of the trestle
    line(i => soldierGeo('#b22222', '#e8d27a'), CONCORD_RX - 12, CONCORD_BZ + 2.6, CONCORD_RX - 14.5, CONCORD_BZ + 2.6, 4, [CONCORD_RX, CONCORD_BZ]);   // east bank, north of the path
    line(i => soldierGeo('#b22222', '#e8d27a'), CONCORD_RX - 12.5, CONCORD_BZ - 2.8, CONCORD_RX - 14.5, CONCORD_BZ - 2.8, 3, [CONCORD_RX, CONCORD_BZ]);   // east bank, south of the path
    for (let i = 0; i < 40; i++) {
      const z = CONCORD_Z0 + 4 + (CONCORD_Z1 - CONCORD_Z0 - 8) * (i / 39);
      for (const side of [-1, 1]) {
        if (rnd() < 0.2) continue;
        const x = concordCenterX(z) + side * (concordHW(z) + 0.5 + rnd() * 1.6);
        if (pathDist(x, z) < 2.2 || onStone(x, z, 1.4)) continue;
        const h = groundH(x, z);
        if (h < WATER_Y - 0.05 || h > 0.95) continue;
        add(reedClump(rnd), x, z, rnd() * 6.28, 0.9 + rnd() * 0.35);
      }
    }
    labels.push([STATIONS.concord, '2 · Concord, the North Bridge', 'the shot heard round the world']);
  }

  // 3 · Breed's Hill
  { const { x: cx, z: cz } = STATIONS.bunkerhill;
    add(redoubtGeo(), cx, cz + 2, 0, 1, true, gy(cx, cz + 2));
    box(cx - 4.4, cx + 4.4, cz - 1.6, cz + 0.0);
    box(cx - 5.0, cx - 3.4, cz - 1, cz + 5);
    box(cx + 3.4, cx + 5.0, cz - 1, cz + 5);
    line(i => militiaGeo(['#c8b888', '#6a5a3a'][i % 2]), cx - 3, cz + 1, cx + 3, cz + 1, 5, [cx, cz - 8]);
    line(i => soldierGeo('#b22222', '#e8d27a'), cx - 6, cz - 9, cx + 6, cz - 9, 7, [cx, cz]);
    add(unionFlagGeo(7), cx + 9, cz - 8, 0, 1, true);
    circ(cx + 9, cz - 8, 0.3);
    labels.push([STATIONS.bunkerhill, "3 · Breed's Hill, June 17, 1775", 'the Battle of Bunker Hill']);
  }

  // 4 · Cambridge Common
  { const { x: cx, z: cz } = STATIONS.cambridge;
    add(elmGeo(rnd), cx + 4, cz + 3, 0.4, 1.05);
    circ(cx + 4, cz + 3, 1.4); occC(cx + 4, cz + 3, 2.2, gy(cx + 4, cz + 3) + 9);
    building(houseGeo(4.4, 3.4, 3.2, '#d0c4a8', '#4a3e38', rnd), cx - 10, cz + 6, 0.3, 4.4, 3.4, 5.2);
    building(houseGeo(3.8, 3.2, 3.0, '#c4b898', '#3a3a40', rnd), cx + 11, cz + 2, -0.5, 3.8, 3.2, 5.0);
    figure(militiaGeo('#2a4a7a'), cx, cz + 1, [cx, cz + 8]);   // Washington in a deep-blue coat, standing under the elm
    line(i => militiaGeo(['#c8b888', '#4a3a2a', '#2a4a7a'][i % 3]), cx - 4, cz - 3, cx + 4, cz - 3, 6, [cx, cz + 3]);
    labels.push([STATIONS.cambridge, '4 · Cambridge Common, July 3, 1775', 'Washington takes command']);
  }

  // 5 · Independence Hall (after the story jump). Set well back from the yard so the 1776 steeple clears the HUD.
  { const { x: cx, z: cz } = STATIONS.gate;
    const hx0 = cx, hz0 = cz + 24;   // hall center ~ (8, 98); south facade faces the yard
    building(independenceHallGeo(rnd), hx0, hz0, Math.PI, 16, 5.0, 22);
    for (const [hx, hz, ry] of [[cx + 18, cz + 8, -Math.PI / 2], [cx - 18, cz + 8, Math.PI / 2], [cx + 18, cz + 22, -Math.PI / 2], [cx - 18, cz + 22, Math.PI / 2]]) building(brickHouseGeo(4.6, 3.8, 4.0, rnd, '#a5523a'), hx, hz, ry, 4.6, 3.8, 6.2);
    // no flag in the State House yard in July 1776: the Stars and Stripes is 1777; we do not invent one
    line(i => personGeo(['#2a2a3a', '#4a3a2a', '#5a2a2a', '#3a4a5a'][i % 4]), cx - 4, cz + 8, cx + 4, cz + 8, 5, [hx0, hz0]);
    poster('IN CONGRESS', ['July 4, 1776', 'A Declaration'], cx + 8, cz + 10, Math.PI);
    labels.push([STATIONS.gate, '5 · Independence Hall, 1776', 'the Declaration · the Trial']);
  }

  const near = (x, z, pad) => { for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return true; } return false; };
  const blocked = (x, z, pad) => { for (const c of colliders.out) { if (c.type === 'c' && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true; if (c.type === 'b' && Math.abs(x - c.x) < c.hx + pad && Math.abs(z - c.z) < c.hz + pad) return true; } return false; };
  const spots = (count, ok, minPath = 3, pad = 1.5) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 80) {
      const x = -92 + rnd() * 184, z = -92 + rnd() * 220, h = groundH(x, z);   // scatter covers the extended State House yard
      if (h < 0.15 || pathDist(x, z) < minPath || near(x, z, 2) || blocked(x, z, pad) || !ok(x, z, h)) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, cast, name) => { const m = new THREE.InstancedMesh(geo, lam, list.length || 1), o = new THREE.Object3D(); list.forEach(([x, z, s], i) => { o.position.set(x, groundH(x, z) - 0.05, z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; m.name = name; scene.add(m); return m; };
  const housesS = spots(18, (x, z) => z < RIVER_S - 3 && z > -70, 5.0, 2.8);
  const housesN = spots(22, (x, z) => z > RIVER_N + 2, 4.5, 2.6);
  const hA = brickHouseGeo(3.6, 3.2, 3.2, rnd, '#9a4a32'), hB = houseGeo(3.4, 3.0, 2.8, '#b8a888', '#4a4a50', rnd);
  inst(hB, housesS.map(([x, z]) => [x, z, 1]), true, 'houses-wood');
  inst(hA, housesN.map(([x, z]) => [x, z, 1]), true, 'houses-brick');
  for (const [x, z] of housesS.concat(housesN)) { circ(x, z, 2.3); occC(x, z, 2.4, groundH(x, z) + 5.2); }
  const sc = () => 0.8 + rnd() * 0.45;
  const elms = spots(50, (x, z) => z < RIVER_S - 2, 3.2, 1.6).map(([x, z]) => [x, z, sc()]);
  const maples = spots(24, (x, z) => z > RIVER_N, 3.2, 1.6).map(([x, z]) => [x, z, sc()]);
  const elmS = M([P(CYL(0.2, 0.28, 2.4, 6), '#5a4634', 0, 1.2, 0), P(new THREE.IcosahedronGeometry(1.8, 1), '#6a8a3a', 0, 3.4, 0, 0, 0, 0, 1.2, 0.8, 1.2, 0.25, rnd)]);
  const mapleGeo = M([P(CYL(0.18, 0.26, 2.0, 6), '#5a4634', 0, 1.0, 0), P(new THREE.IcosahedronGeometry(1.6, 1), '#8a9a3a', 0, 3.0, 0, 0, 0, 0, 1.1, 0.9, 1.1, 0.3, rnd)]);
  inst(elmS, elms, true, 'elms'); inst(mapleGeo, maples, true, 'maples');
  for (const L of [elms, maples]) for (const [x, z, s] of L) { circ(x, z, 0.28 * s + 0.12); occC(x, z, 1.6 * s, groundH(x, z) + 4.5 * s, groundH(x, z) + 1.8 * s); }
  const tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.5, 4), '#8a9a50', 0.2, rnd), rockGeo = vc(new THREE.DodecahedronGeometry(0.6, 0), '#8a8076', 0.2, rnd);
  inst(tuftGeo, spots(260, (x, z, h) => h < 8, 1.8, 0.3).map(([x, z]) => [x, z, 0.8 + rnd() * 0.6]), false, 'tufts');
  inst(rockGeo, spots(24, () => true, 2.2, 0.6).map(([x, z]) => [x, z, 0.4 + rnd() * 0.6]), true, 'rocks');
  { const g = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, R = 190 + rnd() * 40, x = Math.cos(a) * R, z = Math.sin(a) * R; const h = 8 + rnd() * 10;
      const cone = vc(new THREE.ConeGeometry(h * 3, h, 7, 2), '#7a8a7a', 0.1, rnd); cone.translate(x, h / 2 - 3, z); g.push(cone); }
    const far = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); far.userData.noMerge = true; far.name = 'far'; scene.add(far); }
  for (const [t, x, z] of [['The post road south (story jump)', 24, 51.5], ['Philadelphia, 1776', 24, 68]]) { const sp = labelSprite(t, 6); sp.position.set(x, 3.2, z); sp.name = 'river-label'; scene.add(sp); }
  const regionLabels = labels.map(([s, t, sub]) => { const sp = labelSprite(t, 9, sub); sp.position.set(s.x, Math.max(0, groundH(s.x, s.z)) + 5.8, s.z); sp.name = 'region-label'; scene.add(sp); return { s, sp }; });

  const rings = ringDefs.map(d => makeRing(scene, d, walkY(d.x, d.z)));
  mergeAO.buildAO();
  mergeAO.mergeStatic(statics, { cell: 40 });

  let t = 0;
  function update(dt, hero) {
    t += dt;
    for (const r of rings) { r.beam.material.opacity = (r.state === 'locked' ? 0.22 : r.state === 'new' ? 0.5 : 0.35) + 0.12 * Math.sin(t * 2.4 + r.def.x); r.icon.position.y = 2.9 + 0.12 * Math.sin(t * 1.8 + r.def.z); }
    water.position.y = WATER_Y + Math.sin(t * 1.1) * 0.03;
    const cw = scene.userData.concordWater;
    if (cw) {
      const p = cw.geometry.attributes.position, base = cw.userData.baseY;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), z = p.getZ(i);
        p.setY(i, base[i] + 0.025 * Math.sin(t * 1.15 + x * 0.55 + z * 0.7) + 0.014 * Math.sin(t * 0.75 + z * 0.9));
      }
      p.needsUpdate = true;
    }
    if (hero) for (const L of regionLabels) { const d = Math.hypot(hero.x - L.s.x, hero.z - L.s.z); L.sp.visible = d > L.s.r + 14 && d < 38; }
  }
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen() {}, tracks: [], herds: {}, flames: [], water, fogColor: SKY_H, sky: scene.userData.sky, mats: [], dropBundle() {}, clearBundles() {}, regionLabels };
}
