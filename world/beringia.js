// world/beringia.js — Section 1 walkable level: "Beringia, about 20,000–13,000 years ago".
// Marker order (one path, south → north): 1 camp START → 2 herds → 3 steppe / caribou trail → 4 hearth →
// 5 river ford → 6 pole gate in the glacier pass → 7 ice-free corridor → 8 Trial Cave.
// Accuracy (see /workspace/abrpg-design/graphics-kit-review.md §3): hide tents on wooden poles, stone & bone
// tools, mammoths / steppe bison / caribou, willow scrub, snow and glacier ice. NO horses, metal, wheels, planks,
// castles or candles. Nothing here reads or writes the progress save.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

export const WATER_Y = -0.22, CAVE_X = 4000;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const riverZ = x => 105 + 2.2 * Math.sin(x * 0.045 + 0.6);
// distance from the river's centre line, scaled so the channel is wider (about 11 m) at the ford, where the stepping-stone timeline sits
export const riverS = (x, z) => Math.abs(z - riverZ(x)) / (1 + 0.45 * smooth(9, 3.5, Math.abs(x + 5)));
// station centres (flattened ground)
export const STATIONS = {
  camp: { x: 0, z: 3, r: 13, label: 'Camp', n: 1 }, herds: { x: 30, z: 26, r: 9, label: 'Herd lookout', n: 2 },
  steppe: { x: 14, z: 58, r: 9, label: 'Caribou trail', n: 3 }, hearth: { x: -15, z: 85, r: 9, label: 'Toolmakers’ hearth', n: 4 },
  ford: { x: -5, z: 105, r: 0, label: 'River ford', n: 5 }, gate: { x: -5, z: 123.5, r: 0, label: 'Glacier pass', n: 6 },
  corridor: { x: -5, z: 160, r: 0, label: 'Ice-free corridor', n: 7 }, cave: { x: -5, z: 187.5, r: 0, label: 'Trial Cave', n: 8 }
};
// the trail the girl follows (also darkens the ground colour)
export const PATH = [[0, -6], [0, 3], [8, 12], [24, 22], [20, 40], [14, 58], [2, 70], [-15, 85], [-8, 94], [-5, 98], [-5, 113], [-5, 123], [-5, 150], [-5, 187]];
function distSeg(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz; let t = L ? ((px - ax) * dx + (pz - az) * dz) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); }
export function pathDist(x, z) { let d = 1e9; for (let i = 1; i < PATH.length; i++) d = Math.min(d, distSeg(x, z, PATH[i - 1][0], PATH[i - 1][1], PATH[i][0], PATH[i][1])); return d; }
// play area (outdoors): south of the ice the steppe; north of z = 120 only the corridor x ∈ [-12, 2]
export const BOUNDS = { x0: -56, x1: 78, z0: -18, z1: 189.4, iceZ: 120, cx0: -12, cx1: 2 };
export function groundH(x, z) {
  let h = 0.8 * Math.sin(x * 0.05 + 1) * Math.cos(z * 0.043) + 0.5 * Math.sin((x - z) * 0.031) + 0.25 * Math.sin(x * 0.13) * Math.sin(z * 0.11);
  for (const k in STATIONS) { const s = STATIONS[k]; if (!s.r) continue; const w = smooth(s.r, s.r * 0.45, Math.hypot(x - s.x, z - s.z)); h *= 1 - 0.85 * w; }
  const pd = pathDist(x, z); h *= 0.55 + 0.45 * smooth(1.5, 5, pd);
  if (z > 114) h = h * (1 - smooth(114, 122, z)) + smooth(114, 122, z) * (0.25 + 0.15 * Math.sin(x * 0.4) * Math.sin(z * 0.3));
  const s = riverS(x, z);
  h += (0.12 - h) * smooth(12, 6, s);
  h -= 0.85 * smooth(4.6, 3.2, s);
  const r = Math.max(0, BOUNDS.x0 - x, x - BOUNDS.x1, BOUNDS.z0 - z);
  if (r > 0) h += r * 0.55 + r * r * 0.03;
  return h;
}
// stepping stones across the ford: 8 rows, one per timeline event, oldest on the south bank. Rows 0–6 have two stones
// (the right event and a later one); the last row has one. Which side is right is chosen each visit (world.js).
export const FORD_ROWS = 8, FORD_DZ = 1.35;
export const STONES = (() => { const zc = riverZ(-5), out = []; for (let k = 0; k < FORD_ROWS; k++) { const z = zc + (k - (FORD_ROWS - 1) / 2) * FORD_DZ, j = 0.12 * Math.sin(k * 2.3);
  if (k < FORD_ROWS - 1) for (const side of [0, 1]) out.push({ x: -5 + (side ? 1.15 : -1.15) + j, z, r: 0.6, top: 0.1, row: k, side });
  else out.push({ x: -5 + j, z, r: 0.62, top: 0.1, row: k, side: -1 }); } return out; })();
export const FORD_RESPAWN = { x: -5, z: riverZ(-5) - 8.6, yaw: 0 };
export function onStone(x, z, pad = 0) { for (const s of STONES) if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return s; return null; }

// ---------------- geometry helpers ----------------
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

// ---------------- animals (one merged geometry each, instanced) ----------------
function mammothGeo() {   // woolly mammoth, ~3 m at the shoulder, facing +z
  const W = '#5b3a22', D = '#3f2716', T = '#efe6cf';
  const g = [P(new THREE.SphereGeometry(1, 14, 10), W, 0, 2.15, 0, 0, 0, 0, 1.25, 1.15, 1.9, 0.12),
    P(new THREE.SphereGeometry(1, 12, 10), W, 0, 2.55, 1.0, 0, 0, 0, 1.0, 1.05, 1.0, 0.12),           // high shoulder hump
    P(new THREE.SphereGeometry(0.75, 12, 10), W, 0, 2.75, 2.05, 0, 0, 0, 0.9, 1.05, 0.9, 0.1),        // head
    P(new THREE.SphereGeometry(0.42, 10, 8), D, 0, 3.4, 1.95, 0, 0, 0, 0.9, 0.8, 0.9),                // domed crown
    tube([[0, 2.55, 2.65], [0, 1.9, 2.95], [0, 1.0, 2.85], [0, 0.55, 2.6]], 0.17, D),                // trunk
    tube([[0.32, 2.35, 2.45], [0.6, 1.6, 3.0], [0.45, 1.25, 3.55], [0.05, 1.45, 3.75]], 0.07, T),    // tusks
    tube([[-0.32, 2.35, 2.45], [-0.6, 1.6, 3.0], [-0.45, 1.25, 3.55], [-0.05, 1.45, 3.75]], 0.07, T),
    P(new THREE.SphereGeometry(0.22, 8, 6), D, 0.62, 2.85, 1.85, 0, 0, 0, 0.4, 1, 0.8), P(new THREE.SphereGeometry(0.22, 8, 6), D, -0.62, 2.85, 1.85, 0, 0, 0, 0.4, 1, 0.8),
    P(new THREE.ConeGeometry(1.45, 1.2, 14, 1, true), D, 0, 1.4, 0.1, 0, 0, 0, 1, 1, 1.45, 0.15),       // long hair skirt
    tube([[0, 2.2, -1.85], [0, 1.6, -2.0]], 0.06, D)];
  for (const [x, z] of [[0.6, 1.0], [-0.6, 1.0], [0.6, -1.0], [-0.6, -1.0]]) g.push(P(new THREE.CylinderGeometry(0.3, 0.27, 1.7, 10), W, x, 0.85, z, 0, 0, 0, 1, 1, 1, 0.1));
  return M(g);
}
function bisonGeo() {     // steppe bison, ~1.9 m at the hump
  const B = '#6b4a2e', D = '#3e2816', H = '#2a2018';
  const g = [P(new THREE.SphereGeometry(1, 12, 9), D, 0, 1.4, 0.55, 0, 0, 0, 0.62, 0.62, 0.8, 0.1), P(new THREE.SphereGeometry(1, 12, 9), B, 0, 1.15, -0.45, 0, 0, 0, 0.5, 0.52, 0.85, 0.1),
    P(new THREE.SphereGeometry(0.38, 10, 8), D, 0, 0.95, 1.3, 0.5, 0, 0, 0.8, 0.9, 1.1), P(new THREE.SphereGeometry(0.3, 8, 6), D, 0, 0.62, 1.35, 0, 0, 0, 0.7, 1, 0.8),   // head + beard
    P(new THREE.ConeGeometry(0.06, 0.55, 6), H, 0.42, 1.18, 1.3, 0, 0, -1.1), P(new THREE.ConeGeometry(0.06, 0.55, 6), H, -0.42, 1.18, 1.3, 0, 0, 1.1), tube([[0, 1.25, -1.2], [0, 0.7, -1.3]], 0.04, D)];
  for (const [x, z] of [[0.28, 0.55], [-0.28, 0.55], [0.26, -0.75], [-0.26, -0.75]]) g.push(P(new THREE.CylinderGeometry(0.1, 0.08, 1.0, 8), B, x, 0.5, z));
  return M(g);
}
function caribouGeo() {   // caribou, ~1.2 m at the shoulder, antlers
  const B = '#7d6c55', L = '#d8cfbd', A = '#cdbb94';
  const g = [P(new THREE.SphereGeometry(1, 12, 9), B, 0, 1.05, 0, 0, 0, 0, 0.36, 0.38, 0.85, 0.08), P(new THREE.CylinderGeometry(0.14, 0.2, 0.6, 8), L, 0, 1.35, 0.7, 0.7, 0, 0), P(new THREE.SphereGeometry(0.2, 8, 6), B, 0, 1.6, 0.98, 0.3, 0, 0, 0.8, 0.8, 1.4)];
  for (const s of [-1, 1]) { g.push(tube([[s * 0.08, 1.75, 0.95], [s * 0.35, 2.15, 0.8], [s * 0.45, 2.55, 0.55], [s * 0.3, 2.8, 0.75]], 0.03, A)); g.push(tube([[s * 0.3, 2.2, 0.82], [s * 0.2, 2.45, 1.1]], 0.022, A)); g.push(tube([[s * 0.42, 2.45, 0.6], [s * 0.65, 2.6, 0.75]], 0.022, A)); }
  for (const [x, z] of [[0.17, 0.5], [-0.17, 0.5], [0.17, -0.55], [-0.17, -0.55]]) g.push(P(new THREE.CylinderGeometry(0.05, 0.04, 0.85, 6), L, x, 0.45, z));
  g.push(P(new THREE.SphereGeometry(0.12, 8, 6), L, 0, 1.12, -0.85));
  return M(g);
}
// instanced outline hull for herds (the kit's toon.js only handles single meshes)
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

// ---------------- props ----------------
function tentGeo(rnd) {   // conical hide tent: hides stitched over a cone of wooden poles, rocks holding the hem
  const g = [], hides = ['#b08a5c', '#a07c50', '#bc9868', '#9a7449'];
  const cone = new THREE.ConeGeometry(1.75, 3.0, 12, 3, true); g.push(P(cone, hides[0], 0, 1.5, 0, 0, 0, 0, 1, 1, 1, 0.16, rnd));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.2; g.push(P(new THREE.CylinderGeometry(0.035, 0.045, 3.9, 5), '#6b4f30', Math.sin(a) * 0.62, 1.95, Math.cos(a) * 0.62, Math.cos(a) * -0.46, 0, Math.sin(a) * 0.46)); }
  g.push(P(new THREE.PlaneGeometry(0.9, 1.3), '#3a2818', 0, 0.62, 1.42, -0.5, 0, 0));                                       // door opening (dark)
  g.push(P(new THREE.PlaneGeometry(0.6, 1.2), hides[3], 0.62, 0.7, 1.32, -0.45, 0.55, 0.2));                                 // door flap pinned back
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.push(P(new THREE.DodecahedronGeometry(0.17, 0), '#8c8a84', Math.sin(a) * 1.78, 0.08, Math.cos(a) * 1.78, rnd(), rnd(), 0, 1, 0.7, 1, 0.2, rnd)); }
  return M(g);
}
function fireRing(rnd) {
  const g = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.push(P(new THREE.DodecahedronGeometry(0.2, 0), '#7f7c76', Math.sin(a) * 0.7, 0.1, Math.cos(a) * 0.7, rnd(), rnd(), 0, 1, 0.75, 1, 0.2, rnd)); }
  for (let i = 0; i < 4; i++) g.push(P(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 5), i % 2 ? '#5a3f26' : '#e6dcc4', 0, 0.14, 0, Math.PI / 2, i * 0.8, 0)); // willow sticks + bone fuel
  g.push(P(new THREE.CircleGeometry(0.6, 12), '#2a2420', 0, 0.03, 0, -Math.PI / 2));
  return M(g);
}
function rackGeo() {      // drying rack: two forked poles + cross pole, strips of meat and a hide
  const W = '#6b4f30', g = [P(new THREE.CylinderGeometry(0.04, 0.05, 1.9, 5), W, -1.1, 0.95, 0, 0, 0, 0.06), P(new THREE.CylinderGeometry(0.04, 0.05, 1.9, 5), W, 1.1, 0.95, 0, 0, 0, -0.06), P(new THREE.CylinderGeometry(0.035, 0.035, 2.6, 5), W, 0, 1.82, 0, 0, 0, Math.PI / 2)];
  for (let i = 0; i < 5; i++) g.push(P(new THREE.BoxGeometry(0.1, 0.55, 0.02), '#7a2e22', -0.8 + i * 0.32, 1.52, 0.02));
  g.push(P(new THREE.PlaneGeometry(1.1, 0.9), '#c3a072', 0.0, 1.35, -0.05, 0, 0, 0)); return M(g);
}
function boneToolsGeo(rnd) {  // anvil stone, flakes, bone tools, a mammoth tusk
  const g = [P(new THREE.DodecahedronGeometry(0.45, 0), '#7d7a74', 0, 0.2, 0, 0, 0, 0, 1.2, 0.5, 1, 0.15, rnd)];
  for (let i = 0; i < 12; i++) g.push(P(new THREE.TetrahedronGeometry(0.06, 0), i % 3 ? '#5c5e66' : '#8a8178', (rnd() - 0.5) * 1.6, 0.03, (rnd() - 0.5) * 1.6, rnd() * 3, rnd() * 3, 0, 1, 0.3, 1));
  g.push(tube([[0.9, 0.08, -0.4], [1.4, 0.35, 0.1], [1.5, 0.3, 0.8]], 0.08, '#efe6cf'));
  for (let i = 0; i < 3; i++) g.push(P(new THREE.CylinderGeometry(0.025, 0.03, 0.45, 5), '#e6dcc4', -0.7 + i * 0.18, 0.04, 0.6, Math.PI / 2, 0.3 * i, 0));
  return M(g);
}
function cairnGeo(rnd, h = 5) { const g = []; for (let i = 0; i < h; i++) g.push(P(new THREE.DodecahedronGeometry(0.42 - i * 0.05, 0), '#8a8782', (rnd() - 0.5) * 0.1, 0.25 + i * 0.36, (rnd() - 0.5) * 0.1, rnd(), rnd(), 0, 1, 0.65, 1, 0.15, rnd)); return M(g); }

// ---------------- rings ----------------
const ICONS = {};
function iconTex(txt) {
  if (ICONS[txt]) return ICONS[txt];
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,247,226,0.95)'; x.strokeStyle = '#2a1a0c'; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2); x.fill(); x.stroke();
  x.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (ICONS[txt] = t);
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
export function buildBeringia({ mergeAO, rings: ringDefs }) {
  const rnd = rng(20261031);
  const scene = new THREE.Scene(); scene.name = 'beringia';
  const SKY_TOP = new THREE.Color('#6fa6d6'), SKY_H = new THREE.Color('#dde6ea');
  scene.fog = new THREE.Fog(SKY_H, 70, 260);
  // sky dome (vertex gradient) + sun glow
  { const geo = new THREE.SphereGeometry(500, 24, 12); const n = geo.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const y = geo.attributes.position.getY(i) / 500; c.copy(SKY_H).lerp(SKY_TOP, Math.pow(Math.max(0, y), 0.6)); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.name = 'sky'; sky.userData.noMerge = true; sky.renderOrder = -10; scene.add(sky); scene.userData.sky = sky;
    const gc = document.createElement('canvas'); gc.width = gc.height = 64; const x = gc.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,244,214,1)'); gr.addColorStop(0.25, 'rgba(255,236,200,0.6)'); gr.addColorStop(1, 'rgba(255,230,190,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), fog: false, depthWrite: false, transparent: true })); glow.scale.set(90, 90, 1); glow.position.set(170, 150, 120); glow.userData.noMerge = true; scene.add(glow); scene.userData.glow = glow; }
  const hemi = new THREE.HemisphereLight('#e4eefc', '#9a8f74', 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe9d0', 2.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });

  // terrain (vertex coloured: steppe tan → grass → snow patches; the trail is worn darker earth, no planks)
  // v2.2 perf: built as 5 × 6 tiles (same 2 m grid) so the camera culls the ones out of view; normals come from groundH so tile seams match
  // terrain colour and normals as functions, so the corridor floor can blend into the ground seamlessly
  const TAN = new THREE.Color('#b8a468'), GR = new THREE.Color('#9aa25e'), SNOW = new THREE.Color('#e9eef3'), BLUE = new THREE.Color('#c4d2e0'), PATHC = new THREE.Color('#8b7652'), BED = new THREE.Color('#6d6a5e'), MUD = new THREE.Color('#857b5e');
  const terrColor = (x, z, c) => { const nz = Math.sin(x * 0.21) * Math.cos(z * 0.17) + Math.sin(x * 0.07 + z * 0.09);
    c.copy(TAN).lerp(GR, 0.5 + 0.35 * Math.sin(x * 0.11 + z * 0.05));
    const snowAmt = Math.max(smooth(0.9, 1.6, nz + (z - 40) * 0.012), smooth(108, 121, z), smooth(3, 14, Math.max(BOUNDS.x0 - x, x - BOUNDS.x1, BOUNDS.z0 - z)));
    c.lerp(nz > 1.3 ? BLUE : SNOW, snowAmt);
    const pd = pathDist(x, z); c.lerp(z > 114 ? BLUE : PATHC, (1 - smooth(1.0, 2.6, pd)) * 0.75);
    const s = riverS(x, z); c.lerp(MUD, smooth(6, 4.4, s) * 0.8); c.lerp(BED, smooth(4.4, 3.4, s)); return c; };
  const terrNormals = geo => { const p = geo.attributes.position, n = p.count, nrm = new Float32Array(n * 3), e = 0.5, v = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i); v.set(groundH(x - e, z) - groundH(x + e, z), 2 * e, groundH(x, z - e) - groundH(x, z + e)).normalize(); nrm.set([v.x, v.y, v.z], i * 3); }
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); };
  const terrain = new THREE.Group(); terrain.name = 'terrain'; scene.add(terrain);
  for (let tx = 0; tx < 5; tx++) for (let tz = 0; tz < 6; tz++) { const W = 50, D = 45, geo = new THREE.PlaneGeometry(W, D, 25, 23); geo.rotateX(-Math.PI / 2); geo.translate(10 - 125 + W * (tx + 0.5), 0, 92 - 135 + D * (tz + 0.5));
    const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const x = p.getX(i), z = p.getZ(i), h = groundH(x, z); p.setY(i, h);
      terrColor(x, z, c); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    terrNormals(geo);
    { // the corridor floor (below) replaces the ground between the ice walls: drop those triangles so nothing is drawn twice
      const ix = geo.index.array, keep = [], inF = k => { const x = p.getX(k), z = p.getZ(k); return x > -11.9 && x < 1.9 && z > 124.5 && z < 188.5; };
      for (let i = 0; i < ix.length; i += 3) if (!(inF(ix[i]) && inF(ix[i + 1]) && inF(ix[i + 2]))) keep.push(ix[i], ix[i + 1], ix[i + 2]);
      if (keep.length < ix.length) geo.setIndex(keep); }
    geo.computeBoundingSphere();
    const t = new THREE.Mesh(geo, lam); t.receiveShadow = true; t.name = 'terrain-tile'; t.userData.noMerge = true; terrain.add(t); }
  // river water (gently animated), ice-cold blue-grey
  const water = new THREE.Mesh(new THREE.PlaneGeometry(250, 16, 125, 1), new THREE.MeshLambertMaterial({ color: '#7fa6bf', transparent: true, opacity: 0.82, depthWrite: false }));
  { const p = water.geometry.attributes.position; water.geometry.rotateX(-Math.PI / 2); for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + riverZ(p.getX(i) + 10)); water.geometry.translate(10, 0, 0); water.position.y = WATER_Y; water.userData.noMerge = true; water.renderOrder = 2; scene.add(water); }

  const statics = new THREE.Group(); statics.name = 'statics'; scene.add(statics);
  const add = (geo, x, z, ry = 0, s = 1, cast = true, y = null) => { const m = new THREE.Mesh(geo, lam); m.position.set(x, y == null ? groundH(x, z) : y, z); m.rotation.y = ry; m.scale.setScalar(s); m.castShadow = cast; m.receiveShadow = true; statics.add(m); return m; };
  const colliders = { out: [], cave: [] };    // {type:'c', x, z, r} or {type:'b', x, z, hx, hz} (axis-aligned box)
  const circ = (x, z, r, zone = 'out') => colliders[zone].push({ type: 'c', x, z, r });
  const box = (x0, x1, z0, z1, zone = 'out', tag) => { const b = { type: 'b', x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, tag }; colliders[zone].push(b); return b; };

  // 1 · camp
  const tent = tentGeo(rnd);
  for (const [x, z, ry] of [[-7.5, 7, 0.9], [7.5, 8, -0.7], [0, 14, 3.1]]) { add(tent, x, z, ry); circ(x, z, 1.85); mergeAO.addAO({ x, z }, 2.3, 1.1); }
  const fire = fireRing(rnd); add(fire, 0, 5, 0, 1, false); circ(0, 5, 0.9);
  add(rackGeo(), -6.5, -1.5, 0.5); box(-7.7, -5.3, -2.1, -0.9);
  add(boneToolsGeo(rnd), 5.5, -1, 0.4, 1, true); circ(5.5, -1, 0.6);
  // 4 · hearth (toolmakers)
  add(fireRing(rnd), -15, 85.5, 0, 1, false); circ(-15, 85.5, 0.9);
  add(boneToolsGeo(rnd), -19.5, 87.5, 1.2); circ(-19.5, 87.5, 0.6);
  add(tent, -22, 80, 1.4); circ(-22, 80, 1.85); mergeAO.addAO({ x: -22, z: 80 }, 2.3, 1.1);
  add(rackGeo(), -9.5, 89.5, -0.6); box(-10.7, -8.3, 88.9, 90.1);
  let flagMesh = null;
  // 6 · pole gate in the glacier pass (wooden poles, lashed cross-pole, hide flags; no planks)
  { const W = '#6b4f30', g = [];
    for (const x of [-11.2, 1.2]) { g.push(P(new THREE.CylinderGeometry(0.11, 0.14, 4.4, 6), W, x, 2.2, 126)); g.push(cairnGeo(rnd).translate(x, 0, 126.9)); }
    g.push(P(new THREE.CylinderGeometry(0.08, 0.08, 13.2, 6), W, -5, 4.0, 126, 0, 0, Math.PI / 2));
    // v2.3: the six hide flags are real cloth now (own mesh, moved on the CPU every frame near the gate): tied at
    // both top corners to the cross-pole with sinew, sagging between the ties and billowing in the glacier wind
    const FX = [], gateMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) { const x = -9.4 + i * 1.75 + (i > 2 ? 1.4 : 0), h = 1.0 + (i % 2) * 0.3; FX.push({ x, h, col: ['#b08a5c', '#c3a072', '#8f6a40'][i % 3] });
      for (const dx of [-0.33, 0.33]) g.push(P(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 4), '#d9c9a6', x + dx, 3.92, 126)); }
    const gate = new THREE.Mesh(M(g), gateMat); gate.position.y = groundH(-5, 126); gate.castShadow = true; statics.add(gate);
    { const parts = FX.map(f => { const q = vc(new THREE.PlaneGeometry(0.7, f.h, 4, 6), f.col, 0.08, rnd); q.translate(f.x, 3.87 - f.h / 2, 126); return q; });
      const geo = M(parts), base = geo.attributes.position.array.slice(), info = [];
      for (let k = 0; k < base.length / 3; k++) { const x = base[k * 3], y = base[k * 3 + 1]; let f = FX[0]; for (const q of FX) if (Math.abs(q.x - x) < 0.36) f = q;
        info.push({ v: (3.87 - y) / f.h, u: (x - f.x) / 0.35, ph: f.x * 1.7 }); }
      flagMesh = new THREE.Mesh(geo, gateMat); flagMesh.position.y = gate.position.y; flagMesh.castShadow = true; flagMesh.userData.noMerge = true; flagMesh.name = 'hide-flags'; geo.computeBoundingSphere(); geo.boundingSphere.radius += 0.6; scene.add(flagMesh);
      flagMesh.userData.cloth = { base, info }; }
    circ(-11.2, 126, 0.3); circ(1.2, 126, 0.3); }
  // wind-snow curtain shown while the pass is closed (this is what the invisible barrier looks like)
  const windTexC = document.createElement('canvas'); windTexC.width = 128; windTexC.height = 64; { const x = windTexC.getContext('2d'); for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.6})`; x.fillRect(Math.random() * 128, Math.random() * 64, 6 + Math.random() * 18, 1 + Math.random() * 1.5); } }
  const windTex = new THREE.CanvasTexture(windTexC); windTex.wrapS = windTex.wrapT = THREE.RepeatWrapping; windTex.repeat.set(2, 1);
  const wind = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.6), new THREE.MeshBasicMaterial({ map: windTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, color: '#eef6ff' }));
  wind.position.set(-5, groundH(-5, 126) + 1.8, 126.15); wind.userData.noMerge = true; scene.add(wind);
  const gateWall = box(-12, 2, 125.7, 126.5, 'out', 'gate');
  // 7 · corridor theory stone + Journey South cairn
  add(P(new THREE.BoxGeometry(1.4, 2.0, 0.35), '#8b8781', 0, 1.0, 0, 0.05, 0, 0.03, 1, 1, 1, 0.1, rnd), -9.6, 150, 0.35); circ(-9.6, 150, 0.85);
  add(P(new THREE.CircleGeometry(0.28, 10), '#a5452c', 0, 1.25, 0.18), -9.6, 150, 0.35, 1, false);   // red-ochre mark painted on the stone
  add(cairnGeo(rnd, 6), -0.5, 172, 0); circ(-0.5, 172, 0.55);
  // v2.3 glacier: the ice faces are displaced grids whose inner face sits exactly on the collider planes
  // (x = -12 / x = 2 in the corridor, z = 120 on the south face) and only bulges outward, into the ice. Irregular
  // tops with serac teeth, deep-blue crevasses, dirty debris bands near the foot, a snow cap on top. Built in
  // ~20 m segments (each mesh centred on its segment) so the camera culls the ones out of view.
  { const grnd = rng(1200), lamIce = lam;
    const C = { dirt: new THREE.Color('#8e9aa3'), ice: new THREE.Color('#bcd6ea'), pale: new THREE.Color('#dbe9f4'), blue: new THREE.Color('#6fa8d8'), deep: new THREE.Color('#2f6aa3'), band: new THREE.Color('#9aa3a6'), snow: new THREE.Color('#f1f5f9') };
    const n1 = (u, s) => Math.sin(u * 0.11 + s) * 0.5 + Math.sin(u * 0.27 + s * 2.1) * 0.3 + Math.sin(u * 0.63 + s * 0.7) * 0.2;
    function wall({ a0, a1, along, face, out, hMin, hMax, capW, step, seed, cornerA, segLen = 20 }) {
      const crev = []; for (let a = a0 + 2 + grnd() * 4; a < a1 - 1; a += 4 + grnd() * 6) crev.push({ a, w: 0.35 + grnd() * 0.25, d: 1.2 + grnd() * 1.4, h: 0.55 + grnd() * 0.4 });
      const near = a => cornerA == null ? 1 : smooth(0, 3, Math.abs(a - cornerA));
      const top = a => { const k = near(a); return (hMin + (hMax - hMin) * (0.5 + 0.5 * n1(a, seed)) + 2.2 * Math.pow(Math.max(0, Math.sin(a * 0.83 + seed)), 8) + 1.2 * Math.pow(Math.max(0, Math.sin(a * 2.3 + seed * 3)), 12)) * k + 13 * (1 - k); };
      const R = 11, CAP = 5, meshes = [];
      for (let s0 = a0; s0 < a1 - 0.01; s0 += segLen) { const s1 = Math.min(a1, s0 + segLen), nu = Math.max(2, Math.round((s1 - s0) / step));
        const pos = [], col = [], idx = [], c = new THREE.Color(), mid = (s0 + s1) / 2;
        for (let i = 0; i <= nu; i++) { const a = s0 + (s1 - s0) * i / nu, k = near(a);
          let cg = 0, ch = 0; for (const q of crev) { const g = Math.exp(-Math.pow((a - q.a) / q.w, 2)); if (g > cg) { cg = g; ch = q.h; } }
          const T = top(a) - 1.8 * cg * k;   // crevasses notch the top edge too
          for (let v = 0; v <= R + CAP; v++) { let y, d;
            if (v <= R) { const f = v / R; y = -0.9 + (T + 0.9) * Math.pow(f, 0.92);
              const cgy = cg * (f < ch ? 1 : Math.max(0, 1 - (f - ch) * 6)), bump = 0.2 + 0.8 * smooth(0.1, 0.45, f), foot = 0.3 + 0.7 * smooth(0.08, 0.4, f);   // flat-ish foot: the face meets the ground on the collider line
              d = (0.08 + bump * (0.45 * (0.5 + 0.5 * Math.sin(a * 0.37 + seed)) + 0.3 * Math.pow(Math.sin(a * 1.7 + y * 0.35 + seed), 2)) + 0.06 * Math.max(0, y) + 0.5 * Math.pow(f, 3) + bump * 0.45 * Math.max(0, Math.sin(y * 0.75 + 3 * n1(a, seed + 3)))) * k + 1.6 * cgy * k * foot - 0.12;   // the foot sits a hand's width inside the collider line, so she never stands off the visible ice
              const rf = Math.max(0, Math.min(1, (d - 0.35) / 1.1));
              c.copy(C.dirt).lerp(C.ice, smooth(0.6, 2.6, y)).lerp(C.pale, smooth(0.5, 1, f) * 0.6 * (0.5 + 0.5 * Math.sin(a * 0.5 + y * 0.2)));
              c.lerp(C.blue, rf * 0.75); c.lerp(C.deep, cgy * 0.9);
              const bandF = ((y * 0.21 + Math.sin(a * 0.05 + seed) * 0.4) % 1 + 1) % 1; if (y > 1.5 && bandF < 0.08) c.lerp(C.band, 0.35);
              c.lerp(C.snow, smooth(T - 1.0, T - 0.1, y) * 0.9);
            } else { const e = (v - R) / CAP; y = T + 0.35 * Math.sin(e * 3.1) + 0.25 * Math.sin(a * 0.9 + e * 4) * e; d = 0.6 * k + 0.6 + capW * e; c.copy(C.snow).lerp(C.pale, 0.25 * Math.sin(a * 0.7 + e * 5) ** 2); }
            const w = face + out * d;
            if (along === 'z') pos.push(w, y, a - mid); else pos.push(a - mid, y, w);
            col.push(c.r, c.g, c.b); }
        }
        const NV = R + CAP + 1; for (let i = 0; i < nu; i++) for (let v = 0; v < R + CAP; v++) { const p00 = i * NV + v, p10 = (i + 1) * NV + v, p01 = p00 + 1, p11 = p10 + 1; idx.push(p00, p10, p01, p10, p11, p01); }
        const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx);
        // winding: the wall must face the open side (away from the ice)
        { const P0 = new THREE.Vector3().fromArray(pos, 0), P1 = new THREE.Vector3().fromArray(pos, NV * 3), P2 = new THREE.Vector3().fromArray(pos, 3), nrm = P1.sub(P0).cross(P2.sub(P0));
          const want = along === 'z' ? new THREE.Vector3(-out, 0, 0) : new THREE.Vector3(0, 0, -out); if (nrm.dot(want) < 0) { for (let q = 0; q < idx.length; q += 3) { const t = idx[q + 1]; idx[q + 1] = idx[q + 2]; idx[q + 2] = t; } geo.setIndex(idx); } }
        const ng = geo.toNonIndexed(); ng.computeVertexNormals(); ng.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(ng.attributes.position.count * 2), 2)); ng.computeBoundingSphere();
        const m = new THREE.Mesh(ng, lamIce); if (along === 'z') m.position.set(0, 0, mid); else m.position.set(mid, 0, 0); m.castShadow = true; m.receiveShadow = true; m.name = 'glacier-wall'; statics.add(m); meshes.push(m); }
      return { top, meshes };
    }
    const wl = wall({ a0: 120, a1: 200, along: 'z', face: -12, out: -1, hMin: 10, hMax: 16, capW: 18, step: 0.65, seed: 1.3, cornerA: 120 });
    const wr = wall({ a0: 120, a1: 200, along: 'z', face: 2, out: 1, hMin: 10, hMax: 15, capW: 18, step: 0.65, seed: 4.1, cornerA: 120 });
    wall({ a0: -110, a1: -12, along: 'x', face: 120, out: 1, hMin: 13, hMax: 21, capW: 20, step: 1.3, seed: 2.2, cornerA: -12 });
    wall({ a0: 2, a1: 130, along: 'x', face: 120, out: 1, hMin: 13, hMax: 21, capW: 20, step: 1.3, seed: 5.7, cornerA: 2 });
    // seracs: leaning blocks of ice standing on the cap, set back from the edge (never over the corridor)
    { const SG = new THREE.BoxGeometry(1, 1, 1, 1, 2, 1);
      for (let i = 0; i < 30; i++) { const left = i % 2 === 0, z = 124 + grnd() * 70, W = left ? wl : wr, T = W.top(z), back = 2.2 + grnd() * 7, x = left ? -12 - back : 2 + back;
        const g = P(SG, grnd() < 0.5 ? '#d8e8f5' : '#a9cbe8', 0, 0, 0, (grnd() - 0.5) * 0.5, grnd() * 3, (grnd() - 0.5) * 0.5, 1.2 + grnd() * 1.8, 2 + grnd() * 3.2, 1.2 + grnd() * 1.6, 0.08, grnd);
        const m = new THREE.Mesh(g, lam); m.position.set(x, T + 0.6, z); m.castShadow = true; m.receiveShadow = true; m.name = 'serac'; statics.add(m); } }
    // the old massive ice behind the faces (seen from far off) stays: the high inland ice sheet
    const g = [], ICE = ['#e6eef6', '#d6e4f0', '#c7dbee', '#f3f7fb'];
    const block = (x0, x1, z0, z1, h) => g.push(P(new THREE.BoxGeometry(x1 - x0, h, z1 - z0, 2, 3, 2), ICE[Math.floor(grnd() * 4)], (x0 + x1) / 2, h / 2 - 0.5, (z0 + z1) / 2, 0, 0, 0, 1, 1, 1, 0.06, grnd));
    block(-110, -30, 140, 240, 26); block(20, 130, 140, 240, 26); block(-30, -12, 200, 240, 22); block(2, 20, 200, 240, 22);
    const ice = new THREE.Mesh(M(g), lam); ice.castShadow = true; ice.receiveShadow = true; ice.name = 'glacier'; statics.add(ice);
    box(-200, -12, 120, 300); box(2, 200, 120, 300); }
  // v2.3 corridor floor: outwash gravel with tundra (moss / sedge) patches and drifted snow along the ice foot, a
  // pebble texture on a fine grid laid just above the terrain; plus a meltwater runnel flowing south out of the ice
  let melt = null;
  { const tc = document.createElement('canvas'); tc.width = tc.height = 256; const x = tc.getContext('2d'); const gr = rng(77);
    x.fillStyle = '#b9b1a4'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) { const r = 1.5 + gr() * 5.5, px = gr() * 256, py = gr() * 256, l = 120 + gr() * 110 | 0, w = gr() * 30 | 0;
      x.fillStyle = `rgb(${l + w * 0.4 | 0},${l | 0},${l - w * 0.5 | 0})`; x.beginPath(); x.ellipse(px, py, r, r * (0.6 + gr() * 0.4), gr() * 3, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(40,34,28,0.25)'; x.beginPath(); x.ellipse(px + r * 0.25, py + r * 0.3, r, r * 0.5, 0, 0, Math.PI); x.fill(); }
    const tex = new THREE.CanvasTexture(tc); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(14 / 3, 70 / 3); tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(14.6, 70, 15, 70); geo.rotateX(-Math.PI / 2); geo.translate(-5, 0, 155);
    const p = geo.attributes.position, n = p.count, col = new Float32Array(n * 4), c = new THREE.Color(), GRV = new THREE.Color('#a49a8a'), TUN = new THREE.Color('#7f8254'), MOSS = new THREE.Color('#6d7a4a'), SN = new THREE.Color('#f4f7fa'), WET = new THREE.Color('#7d776d'), TC = new THREE.Color();
    for (let i = 0; i < n; i++) { const X = p.getX(i), Z = p.getZ(i); p.setY(i, groundH(X, Z) + 0.06);
      const nz = Math.sin(X * 0.9 + Z * 0.31) * Math.cos(Z * 0.23 - X * 0.4) + 0.5 * Math.sin(Z * 0.71 + X * 1.7);
      c.copy(GRV).lerp(nz > 0.6 ? MOSS : TUN, smooth(0.35, 0.9, nz) * 0.85);
      c.lerp(WET, (1 - smooth(1.0, 2.2, Math.abs(X + 5))) * 0.35);                                  // the trodden line of the trail
      const mx = 0.9 + 0.35 * Math.sin(Z * 0.13); c.lerp(WET, (1 - smooth(0.4, 1.1, Math.abs(X - mx))) * 0.5);   // damp gravel by the runnel
      const wd = Math.min(X + 12, 2 - X); c.lerp(SN, smooth(1.6, 0.3, wd + 0.25 * Math.sin(Z * 0.8)) * 0.95);  // drifted snow at the ice foot
      // at both ends the floor turns into exactly the terrain colour with no pebble texture (alpha = texture amount), so it is opaque yet seamless
      const a = smooth(120, 124, Z) * smooth(190.5, 188.5, Z); c.lerp(terrColor(X, Z, TC), 1 - a);
      col.set([c.r, c.g, c.b, a], i * 4); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 4)); terrNormals(geo); geo.computeBoundingSphere();
    const fm = new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
    fm.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\n diffuseColor.rgb *= mix(vec3(1.0), texture2D(map, vMapUv).rgb, vColor.a);\n#endif'); };
    fm.customProgramCacheKey = () => 'corridor-floor';
    // opaque and drawn before the terrain so the ground under it is depth-rejected (no double fill)
    const floor = new THREE.Mesh(geo, fm); floor.receiveShadow = true; floor.userData.noMerge = true; floor.name = 'corridor-floor'; floor.renderOrder = -1; scene.add(floor);
    // meltwater runnel (about 60 cm wide, a few cm deep) along the east side of the corridor
    const mc = document.createElement('canvas'); mc.width = 32; mc.height = 128; { const y = mc.getContext('2d'); y.fillStyle = '#ffffff'; y.fillRect(0, 0, 32, 128); for (let i = 0; i < 40; i++) { y.fillStyle = `rgba(150,190,220,${0.3 + gr() * 0.5})`; y.fillRect(gr() * 32, gr() * 128, 2 + gr() * 6, 6 + gr() * 18); } }
    const mt = new THREE.CanvasTexture(mc); mt.wrapS = mt.wrapT = THREE.RepeatWrapping; mt.repeat.set(1, 18);
    const pts = []; for (let z = 188; z >= 121; z -= 0.8) pts.push(z);
    const pos = [], uv = [], idx = [];
    pts.forEach((z, i) => { const mx = 0.9 + 0.35 * Math.sin(z * 0.13), w = 0.32 * smooth(121, 126, z) + 0.08 * Math.sin(z * 0.5); for (const sd of [-1, 1]) { pos.push(mx + sd * w, groundH(mx + sd * w, z) + 0.05, z); uv.push(sd < 0 ? 0 : 1, i / (pts.length - 1)); } if (i) { const q = (i - 1) * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); } });
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); mg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); mg.setIndex(idx); mg.computeVertexNormals(); if (mg.attributes.normal.getY(0) < 0) { idx.reverse(); mg.setIndex(idx); mg.computeVertexNormals(); }
    melt = new THREE.Mesh(mg, new THREE.MeshLambertMaterial({ color: '#8fc1e2', map: mt, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 }));
    melt.userData.noMerge = true; melt.name = 'meltwater'; melt.renderOrder = 2; scene.add(melt); }
  // 8 · Trial Cave hill with a dark entrance at the corridor's end
  { const g = [];
    for (let i = 0; i < 9; i++) g.push(P(new THREE.DodecahedronGeometry(3 + rnd() * 2.5, 1), '#7b7266', -5 + (i - 4) * 2.6, 2.5 + rnd() * 2, 194 + rnd() * 4, rnd(), rnd(), 0, 1, 0.9, 1, 0.12, rnd));
    g.push(P(new THREE.CircleGeometry(1.6, 16, 0, Math.PI), '#140d08', -5, 0.2, 190.35));
    g.push(P(new THREE.PlaneGeometry(3.2, 0.2), '#140d08', -5, 0.1, 190.35));
    const hill = new THREE.Mesh(M(g), lam); hill.castShadow = true; hill.receiveShadow = true; statics.add(hill);
    box(-200, 200, 190.2, 300); }
  // scattered boulders (collide), dwarf willow scrub and grass tufts (walk-through), far mountains
  const boulderGeo = vc(new THREE.DodecahedronGeometry(1, 0), '#86827b', 0.15, rnd), shrubGeo = vc(new THREE.IcosahedronGeometry(1, 0), '#6f7a45', 0.2, rnd), tuftGeo = vc(new THREE.ConeGeometry(0.12, 0.45, 4), '#b3a56a', 0.2, rnd);
  const spots = (count, ok, minPath) => { const out = []; let guard = 0; while (out.length < count && guard++ < count * 40) { const x = BOUNDS.x0 + rnd() * (BOUNDS.x1 - BOUNDS.x0), z = BOUNDS.z0 + rnd() * (118 - BOUNDS.z0); if (pathDist(x, z) < minPath) continue; if (riverS(x, z) < 5.5) continue; let near = false; for (const k in STATIONS) { const s = STATIONS[k]; if (Math.hypot(x - s.x, z - s.z) < 11) near = true; } if (near || (ok && !ok(x, z))) continue; out.push([x, z]); } return out; };
  const inst = (geo, list, scl, cast) => { const m = new THREE.InstancedMesh(geo, lam, list.length), o = new THREE.Object3D(); list.forEach(([x, z, s, sy], i) => { o.position.set(x, groundH(x, z), z); o.rotation.set(0, rnd() * 6.28, 0); o.scale.set(s, s * (sy || 1), s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = cast; m.receiveShadow = true; m.userData.noMerge = true; scene.add(m); return m; };
  const bould = spots(34, null, 6).map(([x, z]) => [x, z, 0.6 + rnd() * 1.1, 0.7]); inst(boulderGeo, bould, 1, true); bould.forEach(([x, z, s]) => { circ(x, z, s * 0.95); mergeAO.addAO({ x, z }, s * 1.5, 0.9); });
  const shrubs = spots(80, null, 3).map(([x, z]) => [x, z, 0.45 + rnd() * 0.5, 0.55]);
  for (let i = 0; i < 26; i++) { const x = -50 + rnd() * 125, z = riverZ(x) + (rnd() < 0.5 ? -1 : 1) * (5.6 + rnd() * 3); if (Math.abs(x + 5) > 9) shrubs.push([x, z, 0.5 + rnd() * 0.5, 0.6]); }
  inst(shrubGeo, shrubs, 1, true);
  inst(tuftGeo, spots(700, (x, z) => z < 108, 1.8).map(([x, z]) => [x, z, 0.8 + rnd() * 0.8, 1]), 1, false);
  { const g = []; for (let i = 0; i < 26; i++) { const a = -Math.PI * 0.05 + i / 25 * Math.PI * 1.1, R = 175 + rnd() * 40, h = 30 + rnd() * 45; const x = 10 + Math.cos(a) * R * 1.2, z = 70 - Math.sin(a) * R; const cone = new THREE.ConeGeometry(h * 0.9, h, 7, 3); const base = vc(cone, '#7d8693', 0.1, rnd); const pos = base.attributes.position, col = base.attributes.color; for (let k = 0; k < pos.count; k++) if (pos.getY(k) > h * 0.12) col.setXYZ(k, 0.93, 0.95, 0.98); base.translate(x, h / 2 - 2, z); g.push(base); }
    const mts = new THREE.Mesh(M(g), new THREE.MeshLambertMaterial({ vertexColors: true, fog: true })); mts.userData.noMerge = true; scene.add(mts); }
  // stepping stones
  { const g = STONES.map(s => P(new THREE.CylinderGeometry(s.r, s.r * 1.12, 0.6, 12), '#8d8a84', s.x, s.top - 0.3, s.z, 0, rnd(), 0, 1, 1, 1, 0.12, rnd)); const st = new THREE.Mesh(M(g), lam); st.receiveShadow = true; st.castShadow = true; statics.add(st); }

  // herds
  const ink = inkMat(0.05), inkS = inkMat(0.03);
  const herds = { mammoth: herd(mammothGeo(), 5, lam, ink), bison: herd(bisonGeo(), 9, lam, ink), caribou: herd(caribouGeo(), 8, lam, inkS) };
  const H = (h, cx, cz, rad, n, speed, scale) => { for (let i = 0; i < n; i++) { const a = rnd() * 6.28, r = rad * (0.4 + rnd() * 0.6); h.items.push({ cx, cz, a, r, w: speed * (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.6), s: scale * (0.9 + rnd() * 0.2), x: 0, z: 0, yaw: 0, ph: rnd() * 6 }); } };
  H(herds.mammoth, 52, 30, 11, 5, 0.05, 1); H(herds.bison, 44, 52, 9, 9, 0.07, 1); H(herds.caribou, 34, 72, 8, 8, 0.11, 1);
  // v2.3: each herd wanders a fixed circle, so one fixed bounding sphere per herd lets three.js skip herds that are
  // off screen (and outside the shadow box) instead of drawing all 22 animals + ink hulls every pass
  for (const [k, cx, cz, rad] of [['mammoth', 52, 30, 11], ['bison', 44, 52, 9], ['caribou', 34, 72, 8]]) { const h = herds[k]; h.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, groundH(cx, cz) + 1.5, cz), rad + 4); h.ink.boundingSphere = h.mesh.boundingSphere; h.mesh.frustumCulled = h.ink.frustumCulled = true; scene.add(h.mesh); scene.add(h.ink); }
  const _o = new THREE.Object3D();
  function stepHerds(t) {
    for (const k in herds) { const h = herds[k]; h.items.forEach((it, i) => {
      const a = it.a + t * it.w, x = it.cx + Math.cos(a) * it.r, z = it.cz + Math.sin(a) * it.r;
      const yaw = Math.atan2(-Math.sin(a) * it.w, Math.cos(a) * it.w) + 0;   // facing along the walk direction
      _o.position.set(x, groundH(x, z) + Math.abs(Math.sin(t * 2.2 + it.ph)) * 0.03, z); _o.rotation.set(0, Math.atan2(-Math.sin(a) * Math.sign(it.w), Math.cos(a) * Math.sign(it.w)) , 0); _o.scale.setScalar(it.s); _o.updateMatrix();
      it.x = x; it.z = z; it.yaw = yaw; h.mesh.setMatrixAt(i, _o.matrix); h.ink.setMatrixAt(i, _o.matrix); });
      h.mesh.instanceMatrix.needsUpdate = true; h.ink.instanceMatrix.needsUpdate = true; }
  }
  stepHerds(0);
  // caribou tracks (season walk, exploratory): hoof-print decals
  const TRACKS = [{ id: 't1', x: 8, z: 64 }, { id: 't2', x: 21, z: 66 }, { id: 't3', x: 11, z: 50 }];
  { const tc = document.createElement('canvas'); tc.width = tc.height = 64; const x = tc.getContext('2d'); x.fillStyle = 'rgba(60,40,24,0.85)'; for (const [px, py] of [[20, 14], [30, 14], [36, 40], [46, 40], [16, 50], [26, 50]]) { x.beginPath(); x.ellipse(px, py, 4, 6, 0, 0, Math.PI * 2); x.fill(); }
    const tmat = mergeAO.decal(new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tc), transparent: true, depthWrite: false }), -2, -4);
    for (const t of TRACKS) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), tmat); m.rotation.x = -Math.PI / 2; m.rotation.z = rnd() * 6; m.position.set(t.x, groundH(t.x, t.z) + 0.04, t.z); m.userData.noMerge = true; scene.add(m); t.mesh = m; } }

  // flames (additive, flicker) at both fires
  const flameMat = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const flames = []; for (const [x, z] of [[0, 5], [-15, 85.5]]) { const f = new THREE.Group(); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.22 - i * 0.04, 0.8 - i * 0.15, 7), flameMat); c.position.set((i - 1) * 0.12, 0.45, (i % 2) * 0.1); f.add(c); } f.position.set(x, groundH(x, z), z); f.userData.noMerge = true; scene.add(f); flames.push(f); }

  // rings (glowing; Use opens the existing panels unchanged)
  const rings = ringDefs.filter(d => d.zone !== 'cave').map(d => makeRing(scene, d, d.y != null ? d.y : (onStone(d.x, d.z) ? onStone(d.x, d.z).top : groundH(d.x, d.z))));
  mergeAO.buildAO();
  mergeAO.mergeStatic(statics, { cell: 40 });

  let t = 0;
  function update(dt, hero) {
    t += dt; stepHerds(t);
    windTex.offset.x = (windTex.offset.x - dt * 0.9) % 1; windTex.offset.y = Math.sin(t * 3) * 0.03;
    for (const f of flames) f.children.forEach((c, i) => { c.scale.y = 0.85 + 0.25 * Math.sin(t * (9 + i * 3) + i); c.scale.x = c.scale.z = 0.9 + 0.12 * Math.sin(t * 7 + i * 2); });
    for (const r of rings) { r.beam.material.opacity = (r.state === 'locked' ? 0.22 : r.state === 'new' ? 0.5 : 0.35) + 0.12 * Math.sin(t * 2.4 + r.def.x); r.icon.position.y = 2.9 + 0.12 * Math.sin(t * 1.8 + r.def.z); }
    water.position.y = WATER_Y + Math.sin(t * 1.3) * 0.015;
    if (melt) melt.material.map.offset.y = (melt.material.map.offset.y + dt * 0.35) % 1;
    if (flagMesh && hero && Math.abs(hero.z - 126) < 45) clothStep(t);
  }
  let clothN = 0;
  function clothStep(t) {      // tied at both top corners: the top edge sags, the free bottom billows south with the wind off the ice
    const { base, info } = flagMesh.userData.cloth, a = flagMesh.geometry.attributes.position.array;
    for (let k = 0; k < info.length; k++) { const { v, u, ph } = info[k], sag = 0.06 * (1 - u * u) * (0.4 + 0.6 * Math.min(1, v * 3 + 0.3));
      const gust = 0.55 + 0.45 * Math.sin(t * 0.9 + ph * 0.3) * Math.sin(t * 0.37 + 1.3), bill = Math.pow(v, 1.4) * (0.26 * gust + 0.1 * Math.sin(t * 4.2 + ph + v * 3.5));
      a[k * 3] = base[k * 3] + 0.06 * v * Math.sin(t * 3.1 + ph + v * 5);
      a[k * 3 + 1] = base[k * 3 + 1] - sag - 0.05 * bill;
      a[k * 3 + 2] = base[k * 3 + 2] - bill - 0.03 * (1 - u * u) * v * Math.sin(t * 5 + ph); }
    flagMesh.geometry.attributes.position.needsUpdate = true;
    if ((clothN++ & 1) === 0) flagMesh.geometry.computeVertexNormals();
  }
  function setGateOpen(open) { gateWall.disabled = !!open; wind.visible = !open; }
  // v2.3: camera occluders (the follow camera pulls in front of these instead of clipping through them)
  const gy = groundH(-5, 126), camOcc = [
    { x: -5, z: 126, hx: 6.8, hz: 0.55, y0: gy + 2.3, y1: gy + 4.6 },      // cross-pole + hanging hides
    { x: -11.2, z: 126, r: 0.45, y0: -5, y1: gy + 4.6 }, { x: 1.2, z: 126, r: 0.45, y0: -5, y1: gy + 4.6 },
    { x: -9.6, z: 150, r: 0.95, y0: -5, y1: groundH(-9.6, 150) + 2.1 }];
  for (const [x, z] of [[-7.5, 7], [7.5, 8], [0, 14], [-22, 80]]) camOcc.push({ x, z, r: 2.0, y0: -5, y1: groundH(x, z) + 4.0 });
  return { scene, sun, hemi, rings, colliders, camOcc, update, setGateOpen, tracks: TRACKS, herds, flames, water, fogColor: SKY_H, sky: scene.userData.sky };
}

// ---------------- Trial Cave interior (own scene; collider zone 'cave' around x = 4000) ----------------
export function buildCave({ rings: ringDefs }) {
  const rnd = rng(13000);
  const scene = new THREE.Scene(); scene.name = 'trial-cave'; scene.background = new THREE.Color('#1a120c'); scene.fog = new THREE.Fog('#1a120c', 9, 26);
  scene.add(new THREE.HemisphereLight('#6b5a48', '#2a1d14', 0.7));
  const fireL = new THREE.PointLight('#ffa257', 30, 18, 1.6); fireL.position.set(CAVE_X, 1.3, 0.5); scene.add(fireL);
  const day = new THREE.DirectionalLight('#cfe2ff', 0.6); day.position.set(CAVE_X, 6, 20); day.target.position.set(CAVE_X, 0, 0); scene.add(day); scene.add(day.target);
  const lam = new THREE.MeshLambertMaterial({ vertexColors: true });
  const g = [];
  { const fl = new THREE.CircleGeometry(10, 36, 0, Math.PI * 2); fl.rotateX(-Math.PI / 2); g.push(vc(fl, '#5c4b3c', 0.12, rnd)); }
  { const dome = new THREE.SphereGeometry(10, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2); const p = dome.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.05; p.setXYZ(i, p.getX(i) * k, p.getY(i) * 0.5 * k, p.getZ(i) * k); } dome.computeVertexNormals(); g.push(vc(dome, '#6e5d4c', 0.15, rnd).scale(1, 1, 1)); }
  for (let i = 0; i < 7; i++) { const a = Math.PI * (0.7 + i / 6 * 1.6); g.push(P(new THREE.DodecahedronGeometry(0.55, 0), '#7d7366', Math.cos(a) * 3.2, 0.5, -5 + Math.sin(a) * 1.8 + 1.0, rnd(), rnd(), 0, 0.8, 1.4, 0.8, 0.12, rnd)); }
  g.push(P(new THREE.CylinderGeometry(0.9, 1.0, 0.45, 10), '#857a6c', 0, 0.22, -5.6, 0, 0, 0, 1.3, 1, 1, 0.1, rnd));   // the Elders' speaking stone
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.push(P(new THREE.DodecahedronGeometry(0.18, 0), '#6f6a64', Math.sin(a) * 0.7, 0.1, 0.5 + Math.cos(a) * 0.7, rnd(), rnd(), 0, 1, 0.7, 1)); }
  for (let i = 0; i < 4; i++) g.push(P(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 5), i % 2 ? '#5a3f26' : '#e6dcc4', 0, 0.14, 0.5, Math.PI / 2, i * 0.8, 0));
  for (const [x, z, ry] of [[-6.2, -1, 0.4], [6, -1.5, -0.5], [-5, 3.5, 1.2]]) g.push(P(new THREE.CircleGeometry(1.1, 10), '#a07c50', x, 0.04, z, -Math.PI / 2, 0, ry, 1.3, 1, 1, 0.12, rnd));  // hide bedding
  for (let i = 0; i < 4; i++) g.push(P(new THREE.CylinderGeometry(0.02, 0.025, 1.8, 5), '#8b6a43', 7.3 + i * 0.12, 0.9, -3 + i * 0.25, 0.1, 0, 0.32));   // spears leaning on the wall
  g.push(P(new THREE.PlaneGeometry(3.4, 2.4), '#dfeaf5', 0, 1.2, 9.6, 0, Math.PI, 0));   // daylight in the entrance
  const geo = M(g); geo.translate(CAVE_X, 0, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); mesh.receiveShadow = true; scene.add(mesh);
  const flameMat = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const fl = new THREE.Group(); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.24 - i * 0.04, 0.85 - i * 0.15, 7), flameMat); c.position.set((i - 1) * 0.12, 0.45, (i % 2) * 0.1); fl.add(c); } fl.position.set(CAVE_X, 0, 0.5); scene.add(fl);
  const colliders = [{ type: 'c', x: CAVE_X, z: 0.5, r: 0.9 }, { type: 'c', x: CAVE_X, z: -5.6, r: 1.25 }];
  const rings = ringDefs.filter(d => d.zone === 'cave').map(d => makeRing(scene, d, 0));
  let t = 0;
  function update(dt) { t += dt; fl.children.forEach((c, i) => { c.scale.y = 0.85 + 0.25 * Math.sin(t * (9 + i * 3) + i); }); fireL.intensity = 26 + 5 * Math.sin(t * 11) + 3 * Math.sin(t * 17); for (const r of rings) r.beam.material.opacity = 0.4 + 0.12 * Math.sin(t * 2.4); }
  return { scene, rings, colliders, update, radius: 8.4, fireLight: fireL };
}
