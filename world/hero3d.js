// world/hero3d.js — Abigail in 3D (American Beginnings RPG v2.2).
// Built from smooth primitives (lathe / capsule / sphere), ~1.5 m tall: a 7th-grade girl at real scale.
// Parts are merged per moving limb with vertex colours, so the whole hero is ~7 draw calls before outlines.
// Gear comes from the save's S.equip; world.js passes only art from the level's era (Section 1 in Beringia; Sections
// 1–2 in the Native Nations level), so later-era items (metal, cloth, hats…) never appear anachronistically.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

const SKIN = '#a8714a', HAIR = '#1d1410', HIDE = '#9b7448', HIDE_D = '#6e5032', LEG = '#7a5a3a', MOC = '#5a3d24';

function colored(geo, color) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  const c = new THREE.Color(color), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo;
}
function part(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  const g = colored(geo.clone(), color); g.applyMatrix4(m); return g;
}
const lathe = (pts, seg = 18) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
const merge = list => mergeGeometries(list.filter(Boolean), false);

// ---------------- gear builders (Section 1 art keys from content/v2-s1.js) ----------------
const GEAR = {
  'fur-cloak': (col) => {             // body slot: a fur cloak over the shoulders, open at the front
    const back = new THREE.CylinderGeometry(0.2, 0.29, 0.66, 18, 1, true, Math.PI * 0.32, Math.PI * 1.36);
    return { body: [part(back, col || '#8a5a32', 0, 0.9, -0.005), part(new THREE.TorusGeometry(0.17, 0.05, 8, 18), '#c9a77c', 0, 1.22, -0.01, Math.PI / 2, 0, 0, 1, 1, 0.8)] };
  },
  'spear': () => {                    // right-hand slot: ~1.6 m wooden spear, fluted stone point lashed with sinew
    const shaft = part(new THREE.CylinderGeometry(0.012, 0.014, 1.6, 6), '#8b6a43', 0, 0.5, 0);
    const point = part(new THREE.OctahedronGeometry(0.05, 0), '#8f9198', 0, 1.33, 0, 0, 0, 0, 0.5, 1.6, 0.18);
    const lash = part(new THREE.CylinderGeometry(0.017, 0.017, 0.06, 6), '#d8c39a', 0, 1.27, 0);
    return { rhand: [shaft, point, lash] };
  },
  'basket': (col) => {                // back slot: twined basket with darker bands and two cord straps
    const b = lathe([[0, 0], [0.09, 0.0], [0.12, 0.08], [0.135, 0.22], [0.13, 0.3], [0.118, 0.31]], 14);
    const out = [part(b, col || '#c79a4a', 0, 0.78, -0.24)];
    for (const y of [0.86, 0.95, 1.03]) out.push(part(new THREE.TorusGeometry(0.128, 0.008, 4, 14), '#8a6224', 0, y, -0.24, Math.PI / 2));
    for (const x of [-0.08, 0.08]) out.push(part(new THREE.TorusGeometry(0.15, 0.007, 4, 12, Math.PI), '#6a4a26', x, 1.06, -0.1, 0, Math.PI / 2, 0));
    return { body: out };
  },
  'shell-necklace': (col) => {        // neck slot: a loop of small shell beads
    const out = []; for (let i = 0; i < 13; i++) { const a = Math.PI * (0.15 + 0.7 * i / 12); out.push(part(new THREE.SphereGeometry(0.014, 6, 4), col || '#f3e6c8', Math.cos(a) * 0.1 - 0.0, 1.16 - Math.sin(a) * 0.04, Math.sin(a) * 0.12 + 0.02, 0, 0, 0, 1, 0.8, 1)); }
    return { body: out };
  },
  'feather-band': (col) => {          // head slot: a woven band with one upright feather at the back
    const band = part(new THREE.TorusGeometry(0.124, 0.014, 6, 20), col || '#d9472b', 0, 1.41, -0.005, Math.PI / 2 - 0.08, 0, 0);
    const f = part(new THREE.ConeGeometry(0.025, 0.2, 6), '#f1ead8', 0.02, 1.53, -0.12, -0.35, 0, 0.15, 1, 1, 0.3);
    const tip = part(new THREE.ConeGeometry(0.018, 0.06, 6), '#3a2a22', 0.04, 1.62, -0.155, -0.35, 0, 0.15, 1, 1, 0.3);
    return { body: [band, f, tip] };
  },
  // ---- v2.4: Section 2 (Native Nations, about 1000 to 1500s) art keys from content/v2-s2.js; drawn only in Level 2 ----
  'wampum-belt': (col) => {           // belt slot: a woven band of purple and white shell beads at the waist
    const out = [];
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; out.push(part(new THREE.BoxGeometry(0.05, 0.05, 0.02), i % 4 < 2 ? (col || '#5a3ea8') : '#f1ead8', Math.sin(a) * 0.162, 0.95, Math.cos(a) * 0.162, 0, a, 0)); }
    return { body: out };
  },
  'paddle': (col) => {                // back slot: a carved cedar canoe paddle slung diagonally across her back
    const c = col || '#a0522d';
    return { body: [part(new THREE.CylinderGeometry(0.018, 0.02, 1.0, 6), c, 0, 0.98, -0.2, 0, 0, 0.55), part(new THREE.SphereGeometry(0.1, 10, 8), c, -0.3, 0.55, -0.205, 0, 0, 0.55, 0.65, 1.7, 0.16), part(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 6), c, 0.27, 1.4, -0.2, 0, 0, 0.55)] };
  },
  'buffalo-robe': (col) => {          // cloak slot: a painted bison-hide robe over the shoulders (painted bands)
    const back = new THREE.CylinderGeometry(0.2, 0.3, 0.68, 18, 1, true, Math.PI * 0.3, Math.PI * 1.4);
    const out = [part(back, col || '#9c6b3c', 0, 0.9, -0.006)];
    for (const [y, c] of [[1.02, '#b8452c'], [0.86, '#2f4f6a'], [0.74, '#e0c48a']]) out.push(part(new THREE.CylinderGeometry(0.2 + (1.22 - y) * 0.15 + 0.004, 0.2 + (1.22 - y) * 0.15 + 0.006, 0.03, 18, 1, true, Math.PI * 0.75, Math.PI * 0.5), c, 0, y, -0.006));
    return { body: out };
  },
  'turquoise': (col) => {             // neck slot: a cord with one turquoise pendant
    const out = []; for (let i = 0; i < 11; i++) { const a = Math.PI * (0.15 + 0.7 * i / 10); out.push(part(new THREE.SphereGeometry(0.008, 4, 3), '#3a2a1a', Math.cos(a) * 0.1, 1.16 - Math.sin(a) * 0.05, Math.sin(a) * 0.12 + 0.02)); }
    out.push(part(new THREE.OctahedronGeometry(0.03, 0), col || '#2ec4b6', 0, 1.09, 0.145, 0, 0, 0, 0.9, 1.2, 0.5));
    return { body: out };
  },
  // ---- v2.5: Section 3 (Age of Exploration, 1492) art keys from content/v2-s3.js; drawn in Level 3 ----
  'compass': (col) => {               // belt slot: a little round boxwood compass on a cord at her hip
    return { body: [part(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 14), col || '#b8893a', 0.13, 0.9, 0.09, Math.PI / 2, 0, 0.3), part(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 14), '#f1ead8', 0.135, 0.9, 0.105, Math.PI / 2, 0, 0.3), part(new THREE.BoxGeometry(0.004, 0.05, 0.004), '#a8352a', 0.137, 0.9, 0.11, 0, 0, 0.3)] };
  },
  'astrolabe': (col) => {             // off-hand slot: a brass mariner's astrolabe hanging from her belt on the left side
    const c = col || '#c99a3a';
    return { body: [part(new THREE.TorusGeometry(0.07, 0.01, 6, 20), c, -0.2, 0.8, 0.02, 0, Math.PI / 2, 0), part(new THREE.BoxGeometry(0.008, 0.13, 0.008), c, -0.2, 0.8, 0.02), part(new THREE.BoxGeometry(0.008, 0.008, 0.13), c, -0.2, 0.8, 0.02, 0.5, 0, 0), part(new THREE.TorusGeometry(0.015, 0.004, 4, 8), c, -0.2, 0.88, 0.02, 0, Math.PI / 2, 0)] };
  },
  'map-tube': (col) => {              // back slot: a leather chart case slung across her back
    const c = col || '#7a4a2a';
    return { body: [part(new THREE.CylinderGeometry(0.045, 0.045, 0.6, 10), c, 0, 0.95, -0.2, 0, 0, 0.7), part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), '#c99a3a', -0.2, 1.18, -0.2, 0, 0, 0.7), part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), '#c99a3a', 0.2, 0.72, -0.2, 0, 0, 0.7), part(new THREE.TorusGeometry(0.22, 0.008, 4, 16), '#4a2e1a', 0, 1.0, -0.02, 0, 0, 0.75, 1, 1.25, 0.95)] };
  },
  'sounding-lead': (col) => {         // right-hand slot: a coil of line and the lead weight used to measure the water's depth
    return { rhand: [part(new THREE.TorusGeometry(0.06, 0.014, 6, 14), '#c8aa72', 0, 0.02, 0, Math.PI / 2), part(new THREE.CylinderGeometry(0.004, 0.004, 0.25, 4), '#c8aa72', 0.05, -0.1, 0.02), part(new THREE.CylinderGeometry(0.022, 0.03, 0.09, 8), col || '#6a6e74', 0.05, -0.25, 0.02)] };
  },
  'nav-cap': (col) => {               // head slot: a sailor's soft wool cap
    return { body: [part(new THREE.SphereGeometry(0.132, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), col || '#a8352a', 0, 1.415, -0.01, -0.2, 0, 0, 1, 0.95, 1), part(new THREE.TorusGeometry(0.125, 0.016, 6, 20), col || '#a8352a', 0, 1.44, 0, Math.PI / 2 - 0.2, 0, 0)] };
  },
  // ---- v2.6: Section 4 (Three Empires) art keys from content/v2-s4.js; drawn in Level 4 ----
  'beaver-cap': (col) => {            // head slot: a round beaver-fur cap with a thick fur brim
    const c = col || '#6b4226';
    return { body: [part(new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), c, 0, 1.4, -0.005, -0.12, 0, 0, 1, 1.05, 1), part(new THREE.TorusGeometry(0.13, 0.03, 6, 20), '#7d5030', 0, 1.41, 0, Math.PI / 2 - 0.12, 0, 0), part(new THREE.SphereGeometry(0.02, 6, 4), '#4a2c18', 0, 1.545, -0.01)] };
  },
  'journal': (col) => {               // belt slot: a small leather-bound journal clipped at her right hip
    const c = col || '#7a3b2e';
    return { body: [part(new THREE.BoxGeometry(0.09, 0.12, 0.03), c, 0.15, 0.86, 0.08, 0, -0.35, 0), part(new THREE.BoxGeometry(0.082, 0.112, 0.024), '#efe6cf', 0.153, 0.86, 0.081, 0, -0.35, 0), part(new THREE.BoxGeometry(0.012, 0.05, 0.034), '#5a3a22', 0.15, 0.93, 0.08, 0, -0.35, 0)] };
  },
  'lantern': (col) => {               // off-hand slot: a small tin lantern hanging from her belt on the left side
    const c = col || '#ffb703';
    return { body: [part(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4), '#3a3a3a', -0.19, 0.86, 0.04), part(new THREE.BoxGeometry(0.07, 0.09, 0.07), c, -0.19, 0.78, 0.04), part(new THREE.BoxGeometry(0.078, 0.012, 0.078), '#4a4a48', -0.19, 0.83, 0.04), part(new THREE.BoxGeometry(0.078, 0.012, 0.078), '#4a4a48', -0.19, 0.73, 0.04), part(new THREE.ConeGeometry(0.05, 0.04, 4), '#4a4a48', -0.19, 0.855, 0.04, 0, Math.PI / 4, 0)] };
  },
  // ---- v2.7: Section 5 (Jamestown and Plymouth) art keys from content/v2-s5.js; drawn in Level 5 ----
  'collar': (col) => {                // neck slot: a white linen falling band, laid flat over the shoulders, two points in front
    const c = col || '#ffffff';
    return { body: [part(new THREE.CylinderGeometry(0.135, 0.205, 0.05, 20, 1, true), c, 0, 1.215, 0), part(new THREE.CylinderGeometry(0.205, 0.205, 0.012, 20), c, 0, 1.19, 0, 0, 0, 0, 1, 1, 0.9),
      part(new THREE.BoxGeometry(0.075, 0.09, 0.012), c, -0.045, 1.15, 0.155, 0.25, 0, 0.12), part(new THREE.BoxGeometry(0.075, 0.09, 0.012), c, 0.045, 1.15, 0.155, 0.25, 0, -0.12)] };
  },
  'hoe': (col) => {                   // right-hand slot: a garden hoe, ash handle and a flat iron blade
    const c = col || '#5b5b5b';
    return { rhand: [part(new THREE.CylinderGeometry(0.012, 0.014, 1.25, 6), '#8b6a43', 0, 0.35, 0), part(new THREE.BoxGeometry(0.16, 0.1, 0.012), c, 0, 0.98, 0.05, 0.35, 0, 0), part(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 6), '#3a3a3a', 0, 0.96, 0.015, Math.PI / 2, 0, 0)] };
  },
  'capotain': (col) => {              // head slot: a tall-crowned felt hat with a plain band and a round brim (no buckle)
    const c = col || '#2b2b2b';
    return { body: [part(new THREE.CylinderGeometry(0.098, 0.118, 0.17, 18), c, 0, 1.53, -0.01, -0.1, 0, 0), part(new THREE.CylinderGeometry(0.2, 0.2, 0.014, 22), c, 0, 1.445, -0.005, -0.1, 0, 0),
      part(new THREE.CylinderGeometry(0.117, 0.119, 0.03, 18), '#4a3a2a', 0, 1.47, -0.008, -0.1, 0, 0)] };
  },
  'charter': (col) => {               // off-hand slot: a rolled parchment charter tied with a ribbon and a red wax seal, at her left hip
    const c = col || '#e8d9a8';
    return { body: [part(new THREE.CylinderGeometry(0.026, 0.026, 0.2, 10), c, -0.19, 0.82, 0.05, 0, 0, 0.35), part(new THREE.CylinderGeometry(0.029, 0.029, 0.02, 10), '#7a2a22', -0.19, 0.82, 0.05, 0, 0, 0.35), part(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 10), '#b3261e', -0.205, 0.78, 0.08, Math.PI / 2, 0, 0), part(new THREE.ConeGeometry(0.014, 0.16, 4), '#f4f1ea', -0.16, 0.93, 0.03, 0, 0, -0.3)] };
  },
  'satchel': (col) => {               // back slot: a leather satchel at her hip, its strap across her chest
    const c = col || '#8d6e4a';
    return { body: [part(new THREE.BoxGeometry(0.2, 0.15, 0.07), c, -0.17, 0.82, -0.06, 0, 0, 0.05), part(new THREE.BoxGeometry(0.205, 0.07, 0.075), '#6e5236', -0.17, 0.87, -0.06, 0, 0, 0.05), part(new THREE.TorusGeometry(0.21, 0.012, 4, 28).scale(1, 0.62, 1).rotateX(Math.PI / 2).rotateZ(0.85), '#5a3d24', 0, 1.0, 0)] };
  },
  // ---- v2.8: Section 6 (The Thirteen Colonies) art keys from content/s6.js; drawn in Level 6 ----
  'apron': (col) => {                 // belt slot: a linen apron tied at the waist, a little stitched sampler square on it
    const c = col || '#e8d7b5';
    return { body: [part(new THREE.CylinderGeometry(0.172, 0.215, 0.36, 18, 1, true, -Math.PI * 0.32, Math.PI * 0.64), c, 0, 0.74, 0.004), part(new THREE.TorusGeometry(0.168, 0.01, 4, 22), c, 0, 0.92, 0, Math.PI / 2, 0, 0),
      part(new THREE.BoxGeometry(0.08, 0.07, 0.006), '#b3261e', 0.03, 0.76, 0.196, -0.12, 0, 0), part(new THREE.BoxGeometry(0.066, 0.056, 0.008), '#f6f0e0', 0.03, 0.76, 0.198, -0.12, 0, 0)] };
  },
  'candle': (col) => {                // right-hand slot: a hand-dipped beeswax candle in a pewter holder, its flame glowing
    return { rhand: [part(new THREE.CylinderGeometry(0.05, 0.055, 0.014, 12), '#9aa0a6', 0, 0.0, 0.03), part(new THREE.TorusGeometry(0.03, 0.006, 4, 10), '#9aa0a6', 0.06, 0.0, 0.03, Math.PI / 2), part(new THREE.CylinderGeometry(0.016, 0.019, 0.16, 8), col || '#ffe08a', 0, 0.087, 0.03),
      part(new THREE.ConeGeometry(0.012, 0.04, 6), '#ffb703', 0, 0.19, 0.03)] };
  },
  'almanack': (col) => {              // off-hand slot: a little almanack with a leather cover, tucked at her left hip
    const c = col || '#6b3a2a';
    return { body: [part(new THREE.BoxGeometry(0.03, 0.13, 0.095), c, -0.19, 0.82, 0.05, 0, 0, 0.12), part(new THREE.BoxGeometry(0.034, 0.122, 0.087), '#efe6cf', -0.193, 0.82, 0.05, 0, 0, 0.12)] };
  },
  'tricorn': (col) => {               // head slot: a three-cornered felt hat, the brim turned up on three sides
    const c = col || '#1d1d2b', out = [part(new THREE.CylinderGeometry(0.11, 0.124, 0.1, 18), c, 0, 1.49, -0.01, -0.1, 0, 0)];
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; out.push(part(new THREE.BoxGeometry(0.24, 0.085, 0.016), c, Math.sin(a) * 0.12, 1.475, Math.cos(a) * 0.12 - 0.01, -0.35 * Math.cos(a), a, 0)); }
    out.push(part(new THREE.CylinderGeometry(0.125, 0.125, 0.012, 18), '#c99a3a', 0, 1.452, -0.01, -0.1, 0, 0));
    return { body: out };
  },
  'kite': (col) => {                  // back slot: a diamond silk kite on her back with a key hanging from its string
    const c = col || '#d94f4f';
    return { body: [part(new THREE.OctahedronGeometry(0.22, 0).scale(0.75, 1.1, 0.05), c, 0, 1.05, -0.2), part(new THREE.BoxGeometry(0.008, 0.46, 0.008), '#5a3d24', 0, 1.05, -0.215), part(new THREE.BoxGeometry(0.32, 0.008, 0.008), '#5a3d24', 0, 1.08, -0.215),
      part(new THREE.CylinderGeometry(0.003, 0.003, 0.3, 4), '#e8e2d0', 0, 0.7, -0.22), part(new THREE.TorusGeometry(0.018, 0.005, 4, 10), '#c99a3a', 0, 0.54, -0.22), part(new THREE.BoxGeometry(0.008, 0.05, 0.006), '#c99a3a', 0, 0.5, -0.22)] };
  },
  // ---- v2.9: market wardrobe. Builders may also return outfit/hair overrides (applied before the body is built):
  //   outfit: {tunic, top, skirt, hem, sleeve, fringe, long, collar, leg, shoe}; hair: {color} or {style}; cover: true hides her hair ----
  'dye': (col) => ({ outfit: { tunic: col, hem: shade(col, -0.25) } }),
  'haircolor': (col) => ({ hair: { color: col } }),
  'parka': (col) => ({ outfit: { tunic: col, hem: '#efe8dc', sleeve: col, fringe: true, collar: '#efe8dc' } }),
  'manta': (col) => ({ outfit: { tunic: col, hem: '#2a2a2a', sleeve: col, fringe: false, sash: '#b3261e' } }),
  'quill-dress': (col) => ({ outfit: { tunic: col, hem: shade(col, -0.3), sleeve: col, fringe: true, band: ['#b3261e', '#f3efe6', '#1f3f8a', '#e8b923'] } }),
  'saya': (col) => ({ outfit: { tunic: col, top: shade(col, -0.12), hem: '#1a1a1a', sleeve: shade(col, -0.12), long: true, collar: '#f6efe0' } }),
  'jak': (col, d) => ({ outfit: { tunic: col, top: d.top || shade(col, -0.2), hem: shade(col, -0.3), sleeve: d.top || col, long: true, collar: '#f6efe0', peplum: true } }),
  'waistcoat-dress': (col, d) => ({ outfit: { tunic: col, top: d.top || col, hem: shade(col, -0.3), sleeve: d.top || col, long: true, collar: '#f6efe0', peplum: true } }),
  /* v3.0: frontier short gown: a hip-length jacket (top) over a wool petticoat (tunic/skirt) */
  'short-gown': (col, d) => ({ outfit: { tunic: d.skirt || '#3a4a6a', top: d.top || col, hem: shade(d.skirt || '#3a4a6a', -0.3), sleeve: d.top || col, long: true, collar: '#fbf8f0', peplum: true } }),
  'gown': (col, d) => ({ outfit: { tunic: col, top: d.top || col, skirt: d.skirt || '#8a2b3a', hem: shade(col, -0.3), sleeve: d.top || col, long: true, collar: '#fbf8f0', stomacher: '#e8d18a' } }),
  'plain-gown': (col) => ({ outfit: { tunic: col, hem: shade(col, -0.25), sleeve: col, long: true, collar: '#fbf8f0' } }),
  'jerkin': (col) => ({ outfit: { top: col, sleeve: col } }),
  'waistcoat': (col) => ({ outfit: { top: col } }),
  // hair styles (shown only when no cap covers her hair)
  'loose': () => ({ hair: { style: 'loose' } }), 'one-braid': () => ({ hair: { style: 'one-braid' } }), 'tranzado': () => ({ hair: { style: 'tranzado' } }),
  'bun': () => ({ hair: { style: 'bun' } }), 'pinned': () => ({ hair: { style: 'pinned' } }), 'ribbon': () => ({ hair: { style: 'ribbon' } }), 'center-part': () => ({ hair: { style: 'center-part' } }),
  // caps that cover the hair
  'fox-hood': (col) => { const c = col || '#ece8e0', out = [part(new THREE.SphereGeometry(0.152, 20, 14, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0, Math.PI * 0.78), c, 0, 1.39, -0.01),
      part(new THREE.TorusGeometry(0.105, 0.03, 6, 20), c, 0, 1.38, 0.09, 0, 0, 0, 1, 1.15, 1)];
    for (const s of [-1, 1]) out.push(part(new THREE.ConeGeometry(0.04, 0.08, 6), c, s * 0.08, 1.54, -0.02, 0, 0, -s * 0.35));
    return { body: out, cover: true }; },
  'toca': (col) => { const c = col || '#f4efe4'; return { body: [part(new THREE.SphereGeometry(0.135, 18, 12, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, Math.PI * 0.62), c, 0, 1.395, -0.008), part(new THREE.SphereGeometry(0.133, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.32), c, 0, 1.4, 0),
      part(new THREE.BoxGeometry(0.1, 0.36, 0.014), shade(c, -0.06), 0.06, 1.18, -0.14, 0.15, 0, -0.08)], cover: true }; },
  'dutch-cap': (col) => { const c = col || '#fbf8f0'; return { body: [part(new THREE.SphereGeometry(0.134, 18, 12, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8, 0, Math.PI * 0.66), c, 0, 1.392, -0.006), part(new THREE.SphereGeometry(0.132, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.3), c, 0, 1.4, 0),
      ...[-1, 1].map(s => part(new THREE.SphereGeometry(0.012, 6, 4), '#c9a227', s * 0.105, 1.34, 0.06))], cover: true }; },
  'coif': (col) => { const c = col || '#fbf8f0'; return { body: [part(new THREE.SphereGeometry(0.133, 18, 12, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8, 0, Math.PI * 0.62), c, 0, 1.395, -0.006), part(new THREE.SphereGeometry(0.131, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.3), c, 0, 1.4, 0),
      part(new THREE.TorusGeometry(0.1, 0.005, 4, 16, Math.PI), '#e8e0d0', 0, 1.33, 0.03, 0, 0, Math.PI)], cover: true }; },
  'mob-cap': (col) => { const c = col || '#fbf8f0'; return { body: [part(new THREE.SphereGeometry(0.15, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), c, 0, 1.4, -0.02, -0.2, 0, 0, 1, 1.12, 1), part(new THREE.TorusGeometry(0.14, 0.022, 6, 24), c, 0, 1.41, 0.0, Math.PI / 2 - 0.2, 0, 0),
      part(new THREE.TorusGeometry(0.142, 0.01, 4, 24), '#c0392b', 0, 1.44, -0.02, Math.PI / 2 - 0.2, 0, 0)], cover: true }; },
  // hats worn over her hair
  'basket-hat': (col) => { const c = col || '#c8a060'; return { body: [part(lathe([[0.001, 0.13], [0.07, 0.13], [0.12, 0.03], [0.145, 0.0], [0.13, 0.0], [0.001, 0.0]]), c, 0, 1.45, -0.01, -0.1, 0, 0), part(new THREE.TorusGeometry(0.105, 0.012, 4, 20), '#3b2414', 0, 1.51, -0.015, Math.PI / 2 - 0.1, 0, 0)] }; },
  'straw-hat': (col) => { const c = col || '#d9b86a'; return { body: [part(new THREE.CylinderGeometry(0.1, 0.115, 0.12, 18), c, 0, 1.51, -0.01, -0.1, 0, 0), part(new THREE.CylinderGeometry(0.24, 0.24, 0.012, 24), c, 0, 1.455, -0.005, -0.1, 0, 0), part(new THREE.CylinderGeometry(0.116, 0.116, 0.025, 18), '#3b2414', 0, 1.47, -0.008, -0.1, 0, 0)] }; },
  'bergere': (col) => { const c = col || '#e0c27a'; return { body: [part(new THREE.CylinderGeometry(0.27, 0.27, 0.01, 26), c, 0, 1.5, 0, -0.18, 0, 0.08), part(new THREE.CylinderGeometry(0.1, 0.11, 0.04, 18), c, 0, 1.52, -0.005, -0.18, 0, 0.08), part(new THREE.CylinderGeometry(0.112, 0.112, 0.02, 18), '#2b5fae', 0, 1.515, -0.005, -0.18, 0, 0.08),
      ...[-1, 1].map(s => part(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 4), '#2b5fae', s * 0.11, 1.38, 0.03, 0, 0, s * 0.15))] }; },
  'wool-cap': (col) => { const c = col || '#b3261e'; return { body: [part(new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), c, 0.01, 1.41, -0.02, -0.25, 0, -0.15, 1, 1.15, 1), part(new THREE.TorusGeometry(0.128, 0.018, 6, 20), shade(c, -0.25), 0, 1.43, 0, Math.PI / 2 - 0.2, 0, 0)] }; },
  'beaver-hat': (col) => { const c = col || '#3a2a1e'; return { body: [part(new THREE.CylinderGeometry(0.1, 0.112, 0.2, 18), c, 0, 1.55, -0.01, -0.1, 0, 0), part(new THREE.CylinderGeometry(0.22, 0.22, 0.014, 22), c, 0, 1.45, -0.005, -0.1, 0, 0), part(new THREE.CylinderGeometry(0.113, 0.113, 0.03, 18), '#1a120c', 0, 1.475, -0.008, -0.1, 0, 0)] }; },
  'copper-plume': (col) => { const out = [part(new THREE.TorusGeometry(0.124, 0.014, 6, 20), '#7a3b1e', 0, 1.41, -0.005, Math.PI / 2 - 0.08, 0, 0), part(new THREE.BoxGeometry(0.07, 0.09, 0.008), col || '#c87533', 0, 1.47, 0.115, -0.15, 0, 0)];
    for (const [x, c] of [[-0.03, '#2f2f2f'], [0, '#f4f1e8'], [0.03, '#2f2f2f']]) out.push(part(new THREE.ConeGeometry(0.02, 0.2, 6), c, x, 1.58, -0.06, -0.25, 0, -x * 4, 1, 1, 0.35));
    return { body: out }; },
  // cloaks
  'cedar-cape': (col) => { const c = col || '#a87a4a', out = [part(new THREE.CylinderGeometry(0.15, 0.27, 0.3, 20, 1, true), c, 0, 1.08, 0)];
    for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; out.push(part(new THREE.BoxGeometry(0.012, 0.07, 0.006), shade(c, -0.2), Math.sin(a) * 0.27, 0.9, Math.cos(a) * 0.27, 0, a, 0)); }
    return { body: out }; },
  'huik': (col) => { const c = col || '#1d1d24'; return { body: [part(new THREE.CylinderGeometry(0.2, 0.32, 1.05, 18, 1, true, Math.PI * 0.32, Math.PI * 1.36), c, 0, 0.72, -0.006), part(new THREE.SphereGeometry(0.145, 18, 12, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8, 0, Math.PI * 0.7), c, 0, 1.4, -0.01),
      part(new THREE.ConeGeometry(0.03, 0.08, 6), c, 0, 1.56, 0.02, 0.4, 0, 0)], hair: { hat: true } }; },
  'wool-cape': (col) => cloak3(col || '#1e3a6e', 0.62, '#c9a227'),
  'blanket-coat': (col) => { const o = cloak3(col || '#2b4a8a', 0.7); o.body.push(part(new THREE.CylinderGeometry(0.287, 0.29, 0.035, 18, 1, true, Math.PI * 0.32, Math.PI * 1.36), '#c0392b', 0, 0.62, -0.004)); return o; },
  'hooded-cloak': (col) => { const o = cloak3(col || '#b3261e', 0.72); o.body.push(part(new THREE.SphereGeometry(0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), col || '#b3261e', 0, 1.27, -0.15, -1.2, 0, 0)); return o; },
  'feather-mantle': (col) => { const o = cloak3(col || '#5a4a3a', 0.66); for (let r = 0; r < 4; r++) o.body.push(part(new THREE.CylinderGeometry(0.21 + r * 0.02, 0.215 + r * 0.02, 0.06, 18, 1, true, Math.PI * 0.32, Math.PI * 1.36), shade(col || '#5a4a3a', r % 2 ? 0.2 : -0.1), 0, 1.1 - r * 0.15, -0.006)); return o; },
  // necklaces and neckwear
  'ivory-beads': (col) => beads3(col || '#efe6cf', 12, 0.018, 0.06, 1.3),
  'coral-beads': (col) => beads3(col || '#d9472b', 15, 0.012, 0.035, 1),
  'bead-necklace': (col) => beads3(col || '#2e6fd1', 15, 0.013, 0.05, 1, ['#2b5fae', '#e8452c', '#f3efe6', '#2ec4b6']),
  'gorget': (col) => { const o = beads3('#3b2414', 11, 0.006, 0.05, 1); o.body.push(part(new THREE.CylinderGeometry(0.045, 0.045, 0.008, 16), col || '#efe6d2', 0, 1.1, 0.15, Math.PI / 2 - 0.25, 0, 0)); return o; },
  'kerchief': (col) => { const c = col || '#fbf8f0'; return { body: [part(new THREE.CylinderGeometry(0.11, 0.205, 0.08, 20, 1, true), c, 0, 1.2, 0), part(new THREE.ConeGeometry(0.07, 0.14, 3), c, 0, 1.1, 0.15, Math.PI, 0, 0, 1, 1, 0.15)] }; },
  // belts
  'sash': (col) => { const c = col || '#a8452c'; return { body: [part(new THREE.CylinderGeometry(0.162, 0.17, 0.06, 20, 1, true), c, 0, 0.95, 0), part(new THREE.BoxGeometry(0.03, 0.16, 0.01), c, 0.08, 0.85, 0.16, 0, 0, 0.1), part(new THREE.BoxGeometry(0.03, 0.14, 0.01), c, 0.12, 0.86, 0.15, 0, 0, -0.1)] }; },
  'girdle': (col) => ({ body: [part(new THREE.TorusGeometry(0.16, 0.008, 4, 20), col || '#6b4226', 0, 0.95, 0, Math.PI / 2), part(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 4), col || '#6b4226', 0, 0.86, 0.17), part(new THREE.SphereGeometry(0.035, 8, 6), '#7a1f2b', 0, 0.76, 0.18, 0, 0, 0, 1, 1.2, 0.6)] }),
  'chatelaine': (col) => { const c = col || '#c8ccd2'; return { body: [part(new THREE.TorusGeometry(0.16, 0.012, 4, 20), '#3b2414', 0, 0.95, 0, Math.PI / 2), part(new THREE.BoxGeometry(0.04, 0.04, 0.01), c, 0.1, 0.94, 0.13, 0, -0.6, 0),
      ...[0.08, 0.1, 0.12].map((x, i) => part(new THREE.CylinderGeometry(0.003, 0.003, 0.14 + i * 0.03, 4), c, x, 0.86 - i * 0.015, 0.14)), part(new THREE.TorusGeometry(0.015, 0.004, 4, 10), c, 0.1, 0.76, 0.14), part(new THREE.SphereGeometry(0.014, 6, 4), '#b3261e', 0.12, 0.74, 0.14)] }; },
  'tie-pocket': (col) => ({ body: [part(new THREE.TorusGeometry(0.16, 0.006, 4, 20), '#e8e0d0', 0, 0.95, 0, Math.PI / 2), part(new THREE.SphereGeometry(0.06, 10, 8), col || '#d8c2a0', 0.14, 0.85, 0.1, 0, -0.6, 0, 0.9, 1.3, 0.3)] }),
  'plain-apron': (col) => ({ apron: col || '#efe8da' }),        // drawn in createHero so it follows the skirt it covers
  'pouch': (col) => ({ body: [part(new THREE.SphereGeometry(0.05, 10, 8), col || '#8d6e4a', 0.15, 0.86, 0.08, 0, 0, 0, 1, 1.2, 0.6)] }),
  'wampum-purse': (col) => ({ body: [part(new THREE.BoxGeometry(0.08, 0.1, 0.02), col || '#5a3ea8', 0.15, 0.86, 0.09, 0, -0.4, 0), part(new THREE.BoxGeometry(0.084, 0.015, 0.022), '#f3efe6', 0.15, 0.88, 0.09, 0, -0.4, 0)] }),
  // shoes (recolor her feet; boots also wrap the shin)
  'fur-boots': (col) => ({ outfit: { shoe: col || '#6e5034', boot: col || '#6e5034' } }),
  'sandals': (col) => ({ outfit: { shoe: col || '#c8b080' } }), 'moccasins': (col) => ({ outfit: { shoe: col || '#c9a06a' } }),
  'chapines': (col) => ({ outfit: { shoe: col || '#b8452c', sole: '#c8a27a' } }), 'pattens': (col) => ({ outfit: { shoe: '#3a2a1e', sole: col || '#8a6a3a' } }),
  'clogs': (col) => ({ outfit: { shoe: col || '#d9b27a' } }), 'latchet-shoes': (col) => ({ outfit: { shoe: col || '#3a2a1e' } }), 'buckle-shoes': (col) => ({ outfit: { shoe: col || '#2b2b2b' } }),
  // hand tools
  'atlatl': (col) => ({ rhand: [part(new THREE.BoxGeometry(0.03, 0.5, 0.015), col || '#8b6a43', 0, 0.2, 0), part(new THREE.CylinderGeometry(0.008, 0.008, 1.3, 5), '#a07040', 0.025, 0.4, 0.02), part(new THREE.OctahedronGeometry(0.03, 0), '#3a3a40', 0.025, 1.06, 0.02, 0, 0, 0, 0.5, 1.5, 0.2)] }),
  'chert-hoe': (col) => ({ rhand: [part(new THREE.CylinderGeometry(0.012, 0.014, 1.2, 6), '#8b6a43', 0, 0.35, 0), part(new THREE.BoxGeometry(0.14, 0.11, 0.02), col || '#6a6458', 0, 0.96, 0.05, 0.35, 0, 0), part(new THREE.CylinderGeometry(0.017, 0.017, 0.06, 6), '#c8a060', 0, 0.94, 0.015, Math.PI / 2, 0, 0)] }),
  'bow': (col) => ({ rhand: [part(new THREE.TorusGeometry(0.5, 0.012, 4, 20, Math.PI * 0.7), col || '#7a4a24', -0.36, 0.25, 0, 0, Math.PI / 2, Math.PI * 0.65 + Math.PI / 2), part(new THREE.CylinderGeometry(0.002, 0.002, 0.88, 3), '#f3e6c8', 0.0, 0.25, -0.13)] }),
  'axe': (col) => ({ rhand: [part(new THREE.CylinderGeometry(0.014, 0.016, 0.55, 6), '#a07040', 0, -0.1, 0.05, Math.PI / 2 - 0.3, 0, 0), part(new THREE.BoxGeometry(0.02, 0.1, 0.12), col || '#5b5b5b', 0, -0.17, 0.3)] }),
  'quadrant': (col) => ({ body: [part(new THREE.CylinderGeometry(0.09, 0.09, 0.008, 12, 1, false, 0, Math.PI / 2), col || '#c9a227', -0.2, 0.8, 0.03, 0, 0, Math.PI / 2)] }),
  'hornbook': (col) => ({ body: [part(new THREE.BoxGeometry(0.012, 0.13, 0.09), col || '#a0522d', -0.2, 0.82, 0.05, 0, 0, 0.12), part(new THREE.BoxGeometry(0.014, 0.1, 0.07), '#f8f1dc', -0.202, 0.83, 0.05, 0, 0, 0.12)] })
};
function shade(hex, k) { const c = new THREE.Color(hex); return '#' + (k < 0 ? c.lerp(new THREE.Color('#000000'), -k) : c.lerp(new THREE.Color('#ffffff'), k)).getHexString(); }
function cloak3(c, len, clasp) { const out = [part(new THREE.CylinderGeometry(0.2, 0.2 + len * 0.16, len, 18, 1, true, Math.PI * 0.32, Math.PI * 1.36), c, 0, 1.22 - len / 2, -0.006), part(new THREE.TorusGeometry(0.17, 0.035, 8, 18), c, 0, 1.22, -0.01, Math.PI / 2, 0, 0, 1, 1, 0.8)];
  if (clasp) out.push(part(new THREE.SphereGeometry(0.018, 8, 6), clasp, 0, 1.2, 0.15)); return { body: out }; }
function beads3(c, n, r, depth, sy, cols) { const out = []; for (let i = 0; i < n; i++) { const a = Math.PI * (0.12 + 0.76 * i / (n - 1)); out.push(part(new THREE.SphereGeometry(r, 6, 4), cols ? cols[i % cols.length] : c, Math.cos(a) * 0.105, 1.18 - Math.sin(a) * depth, Math.sin(a) * 0.125 + 0.025, 0, 0, 0, 1, sy, 1)); } return { body: out }; }

export const S1_ART = ['fur-cloak', 'spear', 'basket', 'shell-necklace', 'feather-band'];
export const S2_ART = ['wampum-belt', 'paddle', 'buffalo-robe', 'turquoise'];
export const S3_ART = ['compass', 'astrolabe', 'map-tube', 'sounding-lead', 'nav-cap'];
export const S4_ART = ['beaver-cap', 'journal', 'lantern', 'satchel'];
export const S5_ART = ['collar', 'hoe', 'capotain', 'charter'];
export const S6_ART = ['apron', 'candle', 'almanack', 'tricorn', 'kite'];
// outfits: the hide tunic of Levels 1–2, and (v2.5) a wool dress and linen collar for Spain in 1492
const OUTFITS = { hide: { tunic: HIDE, hem: HIDE_D, fringe: true, sleeve: HIDE, leg: LEG, shoe: MOC }, wool: { tunic: '#3f5f7a', hem: '#2c4258', fringe: false, sleeve: '#ece3cf', leg: '#4a3a2e', shoe: '#2e2219' } };

export function createHero({ gender = 'girl', gearArt = [], outfit = 'hide' } = {}) {
  const O = Object.assign({}, OUTFITS[outfit] || OUTFITS.hide);
  // v2.9: run the builders first; dresses, dyes, shoes and hair overrides change the base outfit before it is built
  const built = []; let hairCol = HAIR, hairStyle = '', cover = false, hatted = false;
  for (const g of gearArt) { const b = GEAR[g.art]; if (!b) continue; const o = b(g.color, g) || {}; built.push(o);
    if (o.outfit) Object.assign(O, o.outfit); if (o.hair && o.hair.color) hairCol = o.hair.color; if (o.hair && o.hair.style) hairStyle = o.hair.style; if (o.hair && o.hair.hat) hatted = true; if (o.cover) cover = true;
    if (o.body && !o.cover && !o.outfit && /hat|cap|plume|band|bergere|tricorn|capotain/.test(g.art)) hatted = true; }
  if (O.top && !O.sleeve) O.sleeve = O.top;
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const root = new THREE.Group(); root.name = 'abigail';
  const body = [], rhand = [];
  // torso: tunic (flares to the knees), or (v2.9) a long skirt to the ankles with a bodice; hem band, fringe, collar, belt
  const top = O.top || O.tunic, skirt = O.tunic, hemY = O.long ? 0.17 : 0.6, hemR = O.long ? 0.31 : 0.218;
  const prof = O.long ? [[0.32, 0.15], [0.3, 0.3], [0.24, 0.55], [0.18, 0.8], [0.156, 0.95]] : [[0.23, 0.6], [0.2, 0.7], [0.16, 0.9], [0.156, 0.95]];
  body.push(part(lathe([[0.001, prof[0][1]], ...prof, [0.001, 0.95]], O.long ? 22 : 18), skirt));
  const panel = (d, a, col, y0) => part(new THREE.LatheGeometry(prof.filter(p => p[1] >= y0 - 0.01).map(p => new THREE.Vector2(p[0] + d, p[1])), 10, -a, 2 * a), col);   // a front panel that follows the skirt
  const apron = built.find(o => o.apron);
  if (O.skirt && O.long) body.push(panel(0.005, 0.5, O.skirt, 0));
  if (apron) body.push(panel(0.012, 0.78, apron.apron, O.long ? 0.3 : 0), part(new THREE.TorusGeometry(0.162, 0.01, 4, 22), apron.apron, 0, 0.94, 0, Math.PI / 2, 0, 0));
  body.push(part(lathe([[0.001, 0.93], [0.157, 0.93], [0.152, 0.97], [0.165, 1.1], [0.17, 1.2], [0.1, 1.255], [0.001, 1.26]]), top));
  if (O.peplum) body.push(part(new THREE.CylinderGeometry(0.16, 0.2, 0.09, 20, 1, true), top, 0, 0.9, 0));
  if (O.stomacher) body.push(part(new THREE.BoxGeometry(0.08, 0.22, 0.01), O.stomacher, 0, 1.07, 0.163, -0.05, 0, 0));
  if (O.band) for (let i = 0; i < 12; i++) body.push(part(new THREE.BoxGeometry(0.02, 0.05, 0.01), O.band[i % 4], Math.sin((i - 5.5) * 0.16) * 0.17, 1.12, Math.cos((i - 5.5) * 0.16) * 0.17));
  body.push(part(new THREE.TorusGeometry(hemR, 0.018, 4, 22), O.hem, 0, hemY + 0.02, 0, Math.PI / 2));
  if (O.collar || !O.fringe) body.push(part(new THREE.TorusGeometry(0.11, 0.02, 4, 18), O.collar || '#f1ead8', 0, 1.235, 0, Math.PI / 2));   // linen collar
  if (O.fringe) for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; body.push(part(new THREE.ConeGeometry(0.015, 0.07, 3), O.hem === '#efe8dc' ? '#d8cfbf' : HIDE_D, Math.sin(a) * 0.222, 0.575, Math.cos(a) * 0.222, Math.PI)); }
  body.push(part(new THREE.TorusGeometry(0.156, 0.016, 4, 18), O.sash || '#5a3a20', 0, 0.95, 0, Math.PI / 2));
  // neck + head
  body.push(part(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 10), SKIN, 0, 1.26, 0));
  body.push(part(new THREE.SphereGeometry(0.118, 20, 16), SKIN, 0, 1.385, 0.005, 0, 0, 0, 1, 1.06, 1));
  body.push(part(new THREE.SphereGeometry(0.02, 8, 6), SKIN, 0, 1.36, 0.118, 0, 0, 0, 1, 1.1, 0.9));          // nose
  for (const s of [-1, 1]) body.push(part(new THREE.SphereGeometry(0.022, 8, 6), SKIN, s * 0.116, 1.37, 0));  // ears
  body.push(part(new THREE.TorusGeometry(0.026, 0.006, 4, 10, Math.PI), '#7a3a2a', 0, 1.33, 0.108, 0, 0, Math.PI)); // smile
  for (const s of [-1, 1]) body.push(part(new THREE.BoxGeometry(0.04, 0.008, 0.01), '#2a1a12', s * 0.045, 1.425, 0.108, 0, 0, s * -0.12)); // brows
  // hair: cap + bangs; girl = two braids down the back (her own look) or a bought style; boy = short. A covering cap hides it.
  const HC = hairCol;
  body.push(part(new THREE.SphereGeometry(cover ? 0.122 : 0.126, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), HC, 0, 1.4, -0.006, -0.25));
  if (!cover) body.push(part(new THREE.SphereGeometry(0.12, 14, 10), HC, 0, 1.38, -0.035, 0, 0, 0, 1.02, 1, 0.92));
  if (gender !== 'boy' && !cover) {
    const chain = (x0, y0, z0, x1, y1, z1, n, r0, col) => { for (let i = 0; i < n; i++) { const t = i / (n - 1); body.push(part(new THREE.SphereGeometry(r0 * (1 - t * 0.3), 8, 6), col, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0 + (z1 - z0) * t)); } };
    if (!hairStyle) {
      for (const s of [-1, 1]) chain(s * 0.06, 1.3, -0.12, s * 0.06, 1.05, -0.18, 6, 0.03, HC);
      for (const s of [-1, 1]) body.push(part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), '#b84a2a', s * 0.06, 1.0, -0.19));      // braid ties
    } else if (hairStyle === 'loose' || hairStyle === 'ribbon') {
      const len = hairStyle === 'loose' ? 0.42 : 0.26;
      body.push(part(new THREE.CylinderGeometry(0.125, 0.19, len, 16, 1, true, Math.PI * 0.5, Math.PI), HC, 0, 1.38 - len / 2, -0.02));
      if (hairStyle === 'ribbon') for (const s of [-1, 1]) body.push(part(new THREE.ConeGeometry(0.03, 0.07, 6), '#2b5fae', s * 0.035, 1.44, -0.13, 0, 0, s * Math.PI / 2));
    } else if (hairStyle === 'one-braid') { chain(0.07, 1.3, 0.02, 0.1, 1.0, 0.15, 7, 0.032, HC); body.push(part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), '#a8452c', 0.1, 0.97, 0.155)); }
    else if (hairStyle === 'tranzado') { body.push(part(new THREE.CylinderGeometry(0.03, 0.028, 0.6, 8), '#f6f1e6', 0, 1.0, -0.17, -0.12)); for (let i = 0; i < 5; i++) body.push(part(new THREE.TorusGeometry(0.031, 0.005, 4, 10), '#c8b89a', 0, 1.22 - i * 0.11, -0.145 - i * 0.012, Math.PI / 2 - 0.12)); }
    else if (hairStyle === 'bun' && !hatted) body.push(part(new THREE.SphereGeometry(0.06, 12, 8), HC, 0, 1.42, -0.13));
    else if (hairStyle === 'pinned' && !hatted) body.push(part(new THREE.SphereGeometry(0.05, 12, 8), HC, 0, 1.53, -0.04));
    else if (hairStyle === 'center-part') { body.push(part(new THREE.SphereGeometry(0.045, 10, 8), HC, 0, 1.3, -0.12)); body.push(part(new THREE.BoxGeometry(0.004, 0.004, 0.1), shade(HC, -0.3), 0, 1.515, 0.02, -0.5, 0, 0)); }
  }
  // eyes are their own mesh (blink)
  const eyeGeo = merge([-1, 1].flatMap(s => [part(new THREE.SphereGeometry(0.019, 10, 8), '#ffffff', s * 0.044, 1.385, 0.1, 0, 0, 0, 1, 1.15, 0.6), part(new THREE.SphereGeometry(0.012, 8, 6), '#2a1a12', s * 0.044, 1.385, 0.112)]));
  // gear (only the era art world.js passes in)
  for (const o of built) { if (o.body) body.push(...o.body); if (o.rhand) rhand.push(...o.rhand); }

  const torso = new THREE.Group(); root.add(torso);
  const torsoMesh = new THREE.Mesh(merge(body), mat); torsoMesh.castShadow = true; torso.add(torsoMesh);
  const eyes = new THREE.Mesh(eyeGeo, mat); torso.add(eyes);
  const limb = (geos, px, py, pz) => { const piv = new THREE.Group(); piv.position.set(px, py, pz); const m = new THREE.Mesh(merge(geos), mat); m.castShadow = true; piv.add(m); return piv; };
  const legs = [-1, 1].map(s => limb([part(new THREE.CapsuleGeometry(0.056, 0.52, 4, 10), O.leg, 0, -0.33, 0), part(new THREE.SphereGeometry(0.07, 10, 8), O.shoe, 0, -0.66, 0.035, 0, 0, 0, 0.9, 0.62, 1.45),
    O.boot ? part(new THREE.CylinderGeometry(0.068, 0.066, 0.3, 10), O.boot, 0, -0.52, 0) : null, O.boot ? part(new THREE.TorusGeometry(0.068, 0.02, 4, 12), '#efe8dc', 0, -0.37, 0, Math.PI / 2) : null,
    O.sole ? part(new THREE.BoxGeometry(0.09, 0.04, 0.17), O.sole, 0, -0.71, 0.035) : null].filter(Boolean), s * 0.08, 0.72, 0));
  const arms = [-1, 1].map(s => limb([part(new THREE.CapsuleGeometry(0.044, 0.38, 4, 10), O.sleeve, 0, -0.22, 0), part(new THREE.SphereGeometry(0.045, 10, 8), SKIN, 0, -0.45, 0), ...(s === 1 ? rhand.map(g => g.clone().translate(0, -0.65, 0.05)) : [])], s * 0.205, 1.19, 0));
  legs.forEach(l => root.add(l)); arms.forEach(a => torso.add(a));
  for (const a of arms) a.rotation.z = 0;
  arms[0].rotation.z = -0.08; arms[1].rotation.z = 0.08;
  root.userData.parts = { torso, eyes, legs, arms };
  let t = 0, blinkT = 2 + Math.random() * 2;
  function animate(dt, speed) {               // speed in m/s
    t += dt; const k = Math.min(1, speed / 3.2), ph = t * (5 + 4 * k);
    const sw = Math.sin(ph) * (O.long ? 0.34 : 0.62) * k;     // v2.9: a shorter stride inside a long skirt (no clipping)
    legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
    arms[0].rotation.x = -sw * 0.8; arms[1].rotation.x = sw * 0.55 - (rhand.length ? 0.12 : 0);
    torso.position.y = Math.abs(Math.cos(ph)) * 0.035 * k + Math.sin(t * 2) * 0.004 * (1 - k);
    torso.rotation.y = Math.sin(ph) * 0.06 * k;
    blinkT -= dt; const b = blinkT < 0.12 ? 0.1 : 1; if (blinkT < 0) blinkT = 2.5 + Math.random() * 2.5;
    eyes.scale.y = b; eyes.position.y = (1 - b) * 1.385;
  }
  function dispose() { root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); mat.dispose(); }
  return { root, animate, dispose, height: 1.5, chars: () => [root] };
}
