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
  }
};
export const S1_ART = ['fur-cloak', 'spear', 'basket', 'shell-necklace', 'feather-band'];
export const S2_ART = ['wampum-belt', 'paddle', 'buffalo-robe', 'turquoise'];
export const S3_ART = ['compass', 'astrolabe', 'map-tube', 'sounding-lead', 'nav-cap'];
export const S4_ART = ['beaver-cap', 'journal', 'lantern', 'satchel'];
export const S5_ART = ['collar', 'hoe', 'capotain', 'charter'];
// outfits: the hide tunic of Levels 1–2, and (v2.5) a wool dress and linen collar for Spain in 1492
const OUTFITS = { hide: { tunic: HIDE, hem: HIDE_D, fringe: true, sleeve: HIDE, leg: LEG, shoe: MOC }, wool: { tunic: '#3f5f7a', hem: '#2c4258', fringe: false, sleeve: '#ece3cf', leg: '#4a3a2e', shoe: '#2e2219' } };

export function createHero({ gender = 'girl', gearArt = [], outfit = 'hide' } = {}) {
  const O = OUTFITS[outfit] || OUTFITS.hide;
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const root = new THREE.Group(); root.name = 'abigail';
  const body = [], rhand = [];
  // torso: hide tunic (flares to the knees) + darker fringe hem + belt
  body.push(part(lathe([[0.001, 0.6], [0.23, 0.6], [0.2, 0.7], [0.16, 0.9], [0.152, 0.97], [0.165, 1.1], [0.17, 1.2], [0.1, 1.255], [0.001, 1.26]]), O.tunic));
  body.push(part(new THREE.TorusGeometry(0.218, 0.018, 4, 20), O.hem, 0, 0.62, 0, Math.PI / 2));
  if (!O.fringe) body.push(part(new THREE.TorusGeometry(0.11, 0.02, 4, 18), '#f1ead8', 0, 1.235, 0, Math.PI / 2));   // linen collar
  if (O.fringe) for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; body.push(part(new THREE.ConeGeometry(0.015, 0.07, 3), HIDE_D, Math.sin(a) * 0.222, 0.575, Math.cos(a) * 0.222, Math.PI)); }
  body.push(part(new THREE.TorusGeometry(0.156, 0.016, 4, 18), '#5a3a20', 0, 0.95, 0, Math.PI / 2));
  // neck + head
  body.push(part(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 10), SKIN, 0, 1.26, 0));
  body.push(part(new THREE.SphereGeometry(0.118, 20, 16), SKIN, 0, 1.385, 0.005, 0, 0, 0, 1, 1.06, 1));
  body.push(part(new THREE.SphereGeometry(0.02, 8, 6), SKIN, 0, 1.36, 0.118, 0, 0, 0, 1, 1.1, 0.9));          // nose
  for (const s of [-1, 1]) body.push(part(new THREE.SphereGeometry(0.022, 8, 6), SKIN, s * 0.116, 1.37, 0));  // ears
  body.push(part(new THREE.TorusGeometry(0.026, 0.006, 4, 10, Math.PI), '#7a3a2a', 0, 1.33, 0.108, 0, 0, Math.PI)); // smile
  for (const s of [-1, 1]) body.push(part(new THREE.BoxGeometry(0.04, 0.008, 0.01), '#2a1a12', s * 0.045, 1.425, 0.108, 0, 0, s * -0.12)); // brows
  // hair: cap + bangs; girl = two braids down the back, boy = short
  body.push(part(new THREE.SphereGeometry(0.126, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), HAIR, 0, 1.4, -0.006, -0.25));
  body.push(part(new THREE.SphereGeometry(0.12, 14, 10), HAIR, 0, 1.38, -0.035, 0, 0, 0, 1.02, 1, 0.92));
  if (gender !== 'boy') {
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) body.push(part(new THREE.SphereGeometry(0.03 - i * 0.002, 8, 6), HAIR, s * 0.06, 1.3 - i * 0.05, -0.12 - i * 0.012));
    for (const s of [-1, 1]) body.push(part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), '#b84a2a', s * 0.06, 1.0, -0.19));      // braid ties
  }
  // eyes are their own mesh (blink)
  const eyeGeo = merge([-1, 1].flatMap(s => [part(new THREE.SphereGeometry(0.019, 10, 8), '#ffffff', s * 0.044, 1.385, 0.1, 0, 0, 0, 1, 1.15, 0.6), part(new THREE.SphereGeometry(0.012, 8, 6), '#2a1a12', s * 0.044, 1.385, 0.112)]));
  // gear (only the era art world.js passes in)
  for (const g of gearArt) { const b = GEAR[g.art]; if (!b) continue; const o = b(g.color); if (o.body) body.push(...o.body); if (o.rhand) rhand.push(...o.rhand); }

  const torso = new THREE.Group(); root.add(torso);
  const torsoMesh = new THREE.Mesh(merge(body), mat); torsoMesh.castShadow = true; torso.add(torsoMesh);
  const eyes = new THREE.Mesh(eyeGeo, mat); torso.add(eyes);
  const limb = (geos, px, py, pz) => { const piv = new THREE.Group(); piv.position.set(px, py, pz); const m = new THREE.Mesh(merge(geos), mat); m.castShadow = true; piv.add(m); return piv; };
  const legs = [-1, 1].map(s => limb([part(new THREE.CapsuleGeometry(0.056, 0.52, 4, 10), O.leg, 0, -0.33, 0), part(new THREE.SphereGeometry(0.07, 10, 8), O.shoe, 0, -0.66, 0.035, 0, 0, 0, 0.9, 0.62, 1.45)], s * 0.08, 0.72, 0));
  const arms = [-1, 1].map(s => limb([part(new THREE.CapsuleGeometry(0.044, 0.38, 4, 10), O.sleeve, 0, -0.22, 0), part(new THREE.SphereGeometry(0.045, 10, 8), SKIN, 0, -0.45, 0), ...(s === 1 ? rhand.map(g => g.clone().translate(0, -0.65, 0.05)) : [])], s * 0.205, 1.19, 0));
  legs.forEach(l => root.add(l)); arms.forEach(a => torso.add(a));
  for (const a of arms) a.rotation.z = 0;
  arms[0].rotation.z = -0.08; arms[1].rotation.z = 0.08;
  root.userData.parts = { torso, eyes, legs, arms };
  let t = 0, blinkT = 2 + Math.random() * 2;
  function animate(dt, speed) {               // speed in m/s
    t += dt; const k = Math.min(1, speed / 3.2), ph = t * (5 + 4 * k);
    const sw = Math.sin(ph) * 0.62 * k;
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
