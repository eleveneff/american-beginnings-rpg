// world/polish.js — v2.6.2 graphics pass 2 (every element so far), shared by all four outdoor levels.
// Added on top of a built level, with no new save data, no colliders and (almost) no new draw calls:
//  • rings: the light columns are softer (about 60% of the old glow, so sand and decks no longer wash out to white);
//  • floating labels and region boards fade out as the camera comes close (they blocked the view in QC shots);
//  • light: a gentle per-era grade (cool, clear Ice Age air in Beringia; warm late-morning sun from the Native Nations on);
//  • life: one Points mesh of drifting motes round Abigail (ice crystals in Beringia, pollen and seed fluff elsewhere);
//  • QC: freeze(t) pins every animated extra (clouds, ripples, motes, ring pulse) to one moment so before/after shots match.
import * as THREE from 'three';

const GRADE = {   // sun colour, sun intensity, hemisphere sky / ground, exposure
  s1: { rim: '#e8f1ff', sun: '#fff1e0', si: 2.0, sky: '#e2ecf8', gr: '#a49a80', exp: 1.04, mote: '#ffffff', moteN: 70, size: 0.09 },
  s2: { rim: '#fff0d6', sun: '#ffe6c4', si: 2.1, sky: '#eaf0f6', gr: '#a08e6a', exp: 1.06, mote: '#fff4c8', moteN: 60, size: 0.08 },
  s3: { rim: '#fff0d6', sun: '#ffe9c8', si: 2.1, sky: '#e8f2fa', gr: '#a8946c', exp: 1.06, mote: '#fff6d8', moteN: 50, size: 0.08 },
  s4: { rim: '#fff0d6', sun: '#ffe4bf', si: 2.1, sky: '#e9eff5', gr: '#9c8a66', exp: 1.06, mote: '#fff4c8', moteN: 60, size: 0.08 }
};
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function dotTex() { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.45, 'rgba(255,255,255,0.7)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

export const RING_GLOW = 0.62;   // multiplier on the levels' own ring pulse
export const LABEL_FADE = [5, 12];   // a label is hidden nearer than 5 m to the camera and fully shown from 12 m

export function enhancePolish({ lvl, sid, renderer, getCam, getFocus, groundH }) {
  const G = GRADE[sid]; if (!G || !lvl || !lvl.scene) return { update() {}, freeze() {} };
  const scene = lvl.scene, out = { sid, parts: {} };
  // 1 · light grade (the level's sun and hemisphere; gfx.js keeps tone mapping)
  if (lvl.sun) { lvl.sun.color.set(G.sun); lvl.sun.intensity = G.si; }
  if (lvl.hemi) { lvl.hemi.color.set(G.sky); lvl.hemi.groundColor.set(G.gr); }
  out.exposure = G.exp; out.rim = G.rim; out.parts.grade = true;   // rim: Abigail's rim-light tint (cool snow light in Beringia, warm sun later)
  // 2 · labels: overhead boards only (ship names, region labels, La Navidad): sprites at least 2.5 m wide standing more than
  // 3 m above the ground, never ring icons. Mat labels (1.7 m up) stay solid: she reads them while sorting. Opacity only;
  // the levels keep owning .visible (they hide a region label while she is inside that region).
  const labels = [];
  scene.traverse(o => { if (!o.isSprite || !o.material) return; let p = o.parent, ring = false; while (p) { if (p.name && p.name.startsWith('ring:')) { ring = true; break; } p = p.parent; }
    const gy = groundH ? Math.max(0, groundH(o.position.x, o.position.z)) : 0;
    if (!ring && o.scale.x >= 2.5 && o.position.y - gy > 3) { o.material.transparent = true; labels.push(o); } });
  out.labels = labels; out.parts.labels = labels.length;
  // 3 · motes: one Points mesh that follows the hero (wraps round a 24 m box), additive, no depth write
  const N = G.moteN, pos = new Float32Array(N * 3), seed = new Float32Array(N), r = rng(sid.charCodeAt(1) * 131);
  for (let i = 0; i < N; i++) { pos[i * 3] = (r() - 0.5) * 24; pos[i * 3 + 1] = 0.3 + r() * 3.2; pos[i * 3 + 2] = (r() - 0.5) * 24; seed[i] = r() * 100; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const base = pos.slice();
  const motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: G.mote, size: G.size, map: dotTex(), transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending }));
  motes.name = 'gfx-motes'; motes.frustumCulled = false; motes.userData.noMerge = true; motes.renderOrder = 3; scene.add(motes); out.motes = motes; out.parts.motes = N;
  let t = 0, frozen = null; const cpos = new THREE.Vector3();
  out.freeze = v => { frozen = (v === false || v == null) ? null : (typeof v === 'number' ? v : 10); };
  out.time = () => (frozen != null ? frozen : t);
  out.update = (dt) => {
    if (frozen == null) t += dt || 0; const T = out.time();
    // rings: soften the level's own pulse (the level sets the opacity fresh every frame just before this runs)
    for (const rg of (lvl.rings || [])) if (rg.beam && rg.beam.material) { rg.beam.material.opacity *= RING_GLOW; if (rg.disc) rg.disc.scale.setScalar(1 + 0.04 * Math.sin(T * 2.4 + rg.def.x)); }
    // labels fade near the camera
    const cam = getCam && getCam(); if (cam) { cpos.copy(cam.position);
      for (const s of labels) { const d = s.getWorldPosition(TMP).distanceTo(cpos), k = Math.max(0, Math.min(1, (d - LABEL_FADE[0]) / (LABEL_FADE[1] - LABEL_FADE[0]))); s.material.opacity = k; } }
    // motes drift on a slow breeze and bob; the cloud of motes stays centred on her
    const f = getFocus && getFocus(); if (f) { const a = geo.attributes.position.array;
      for (let i = 0; i < N; i++) { const s = seed[i]; let x = base[i * 3] + Math.sin(T * 0.21 + s) * 1.6 + T * 0.35, z = base[i * 3 + 2] + Math.cos(T * 0.17 + s * 1.3) * 1.6 + T * 0.12;
        x = ((x - f.x) % 24 + 36) % 24 - 12 + f.x; z = ((z - f.z) % 24 + 36) % 24 - 12 + f.z;   // wrap into the box round her
        a[i * 3] = x; a[i * 3 + 1] = (f.y || 0) + base[i * 3 + 1] + Math.sin(T * 0.9 + s) * 0.25; a[i * 3 + 2] = z; }
      geo.attributes.position.needsUpdate = true; } };
  return out;
}
const TMP = new THREE.Vector3();
