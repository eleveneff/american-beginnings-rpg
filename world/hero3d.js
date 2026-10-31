// world/hero3d.js — Abigail in 3D (American Beginnings RPG v2.2).
// Built from smooth primitives (lathe / capsule / sphere), ~1.5 m tall: a 7th-grade girl at real scale.
// Parts are merged per moving limb with vertex colours, so the whole hero is ~7 draw calls before outlines.
// Gear comes from the save's S.equip, but ONLY Section 1 (Ice Age) art is drawn here — later-era items
// (metal, cloth, hats…) are ignored so nothing anachronistic ever appears in Beringia.
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
  }
};
export const S1_ART = Object.keys(GEAR);

export function createHero({ gender = 'girl', gearArt = [] } = {}) {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const root = new THREE.Group(); root.name = 'abigail';
  const body = [], rhand = [];
  // torso: hide tunic (flares to the knees) + darker fringe hem + belt
  body.push(part(lathe([[0.001, 0.6], [0.23, 0.6], [0.2, 0.7], [0.16, 0.9], [0.152, 0.97], [0.165, 1.1], [0.17, 1.2], [0.1, 1.255], [0.001, 1.26]]), HIDE));
  body.push(part(new THREE.TorusGeometry(0.218, 0.018, 4, 20), HIDE_D, 0, 0.62, 0, Math.PI / 2));
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; body.push(part(new THREE.ConeGeometry(0.015, 0.07, 3), HIDE_D, Math.sin(a) * 0.222, 0.575, Math.cos(a) * 0.222, Math.PI)); }
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
  // gear (Section 1 art only)
  for (const g of gearArt) { const b = GEAR[g.art]; if (!b) continue; const o = b(g.color); if (o.body) body.push(...o.body); if (o.rhand) rhand.push(...o.rhand); }

  const torso = new THREE.Group(); root.add(torso);
  const torsoMesh = new THREE.Mesh(merge(body), mat); torsoMesh.castShadow = true; torso.add(torsoMesh);
  const eyes = new THREE.Mesh(eyeGeo, mat); torso.add(eyes);
  const limb = (geos, px, py, pz) => { const piv = new THREE.Group(); piv.position.set(px, py, pz); const m = new THREE.Mesh(merge(geos), mat); m.castShadow = true; piv.add(m); return piv; };
  const legs = [-1, 1].map(s => limb([part(new THREE.CapsuleGeometry(0.056, 0.52, 4, 10), LEG, 0, -0.33, 0), part(new THREE.SphereGeometry(0.07, 10, 8), MOC, 0, -0.66, 0.035, 0, 0, 0, 0.9, 0.62, 1.45)], s * 0.08, 0.72, 0));
  const arms = [-1, 1].map(s => limb([part(new THREE.CapsuleGeometry(0.044, 0.38, 4, 10), HIDE, 0, -0.22, 0), part(new THREE.SphereGeometry(0.045, 10, 8), SKIN, 0, -0.45, 0), ...(s === 1 ? rhand.map(g => g.clone().translate(0, -0.65, 0.05)) : [])], s * 0.205, 1.19, 0));
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
