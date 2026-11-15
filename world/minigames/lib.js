// world/minigames/lib.js — small shared kit for the 3D mini-games: vertex-coloured toon props in the same style as the
// levels (MeshLambert + per-vertex colour jitter, merged per prop), canvas text boards, puff particles and the easing
// bits the engines share. Every material/texture made here is tracked by the arena that made it, so dispose() frees all.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

export { THREE };
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t * t * (3 - 2 * t);
export function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// colour every vertex of geo (non-indexed so faces get their own shade) with a little jitter for the hand-painted look
export function vc(geo, color, jitter = 0.06, rnd = Math.random) {
  const g = geo.index ? geo.toNonIndexed() : geo; if (g !== geo) geo.dispose();
  const n = g.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(color), t = new THREE.Color();
  for (let i = 0; i < n; i += 3) { const j = 1 + (rnd() - 0.5) * 2 * jitter; t.setRGB(clamp(c.r * j, 0, 1), clamp(c.g * j, 0, 1), clamp(c.b * j, 0, 1)); for (let k = 0; k < 3 && i + k < n; k++) col.set([t.r, t.g, t.b], (i + k) * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); if (g.attributes.uv) g.deleteAttribute('uv'); return g;
}
// P(geo, colour, position, rotation, scale) → a coloured, transformed geometry ready to merge
export function P(geo, color, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, jitter = 0.06) {
  const g = vc(geo, color, jitter); const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  g.applyMatrix4(m); return g;
}
export const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const CYL = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
export const SPH = (r, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
export const CONE = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
export function M(list) { const g = mergeGeometries(list.map(x => x.index ? x.toNonIndexed() : x), false); for (const x of list) x.dispose(); g.computeVertexNormals(); return g; }

// one arena = one tracker: everything it makes goes in root and is freed by dispose()
export function makeKit(ctx) {
  const mats = new Set(), texs = new Set();
  const lam = () => { const m = new THREE.MeshLambertMaterial({ vertexColors: true }); mats.add(m); return m; };
  const LAM = lam();
  const kit = {
    mesh(list, { cast = true, recv = false, mat } = {}) { const m = new THREE.Mesh(Array.isArray(list) ? M(list) : list, mat || LAM); m.castShadow = cast; m.receiveShadow = recv; return m; },
    mat(o) { const m = new THREE.MeshLambertMaterial(o); mats.add(m); return m; },
    basic(o) { const m = new THREE.MeshBasicMaterial(o); mats.add(m); return m; },
    track(m) { if (m.isTexture) texs.add(m); else mats.add(m); return m; },
    ink(obj, o) { if (ctx.L.toon && ctx.L.toon.decorate) try { ctx.L.toon.decorate(obj, Object.assign({ rim: false, width: 0.02 }, o || {})); } catch (e) { } return obj; },
    // a canvas board / label sprite
    canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; texs.add(t); return t; },
    label(text, { size = 1, color = '#fff', bg = 'rgba(20,30,50,.82)', font = 'bold 44px Trebuchet MS, sans-serif' } = {}) {
      const t = kit.canvasTex(512, 96, (x, w, h) => { x.font = font; const tw = Math.min(w - 20, x.measureText(text).width + 40); x.fillStyle = bg; const l = (w - tw) / 2; x.beginPath(); x.roundRect(l, 8, tw, h - 16, 30); x.fill(); x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 2); });
      const s = new THREE.Sprite(kit.track(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }))); s.scale.set(size * 5.33, size, 1); s.renderOrder = 5; return s;
    },
    // a soft round blob shadow (cheap, and reads well under props that move)
    blob(r = 0.6, op = 0.35) { const t = kit.canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), kit.track(new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))); m.rotation.x = -Math.PI / 2; m.renderOrder = 1; return m; },
    // puffs: dust, splash, sparkle. puff(pos, colour, n) — pooled sprites that drift up and fade
    puffs: null,
    dispose() {
      ctx.root.traverse(o => { if (o.geometry && !o.userData.fxPart) o.geometry.dispose(); });
      for (const m of mats) m.dispose(); for (const t of texs) t.dispose(); mats.clear(); texs.clear();
    }
  };
  // particle pool
  const dot = kit.canvasTex(32, 32, x => { const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); });
  const pool = [];
  kit.puff = (pos, color = '#fff', n = 8, { spread = 0.6, up = 1.6, life = 0.8, size = 0.35, grav = 2 } = {}) => {
    for (let i = 0; i < n; i++) {
      let p = pool.find(q => !q.alive);
      if (!p) { if (pool.length > 80) break; const m = kit.track(new THREE.SpriteMaterial({ map: dot, transparent: true, depthWrite: false })); p = { s: new THREE.Sprite(m), v: new THREE.Vector3() }; ctx.root.add(p.s); pool.push(p); }
      p.alive = true; p.t = 0; p.life = life * (0.7 + Math.random() * 0.6); p.size = size; p.grav = grav; p.s.visible = true; p.s.material.color.set(color);
      p.s.position.copy(pos); p.v.set((Math.random() - 0.5) * spread * 2, up * (0.5 + Math.random() * 0.8), (Math.random() - 0.5) * spread * 2);
    }
  };
  kit.tickPuffs = dt => { for (const p of pool) { if (!p.alive) continue; p.t += dt; if (p.t >= p.life) { p.alive = false; p.s.visible = false; continue; } p.v.y -= p.grav * dt; p.s.position.addScaledVector(p.v, dt); const k = p.t / p.life; p.s.material.opacity = 1 - k; const sc = p.size * (0.6 + k); p.s.scale.set(sc, sc, 1); } };
  return kit;
}

// a little stylised person (no face detail) for helpers in the scene: villagers in the brigade, paddlers, settlers
export function person(kit, { coat = '#6b4a2a', skin = '#c8946a', hair = '#2a1a0c', pants = '#4a3a2a', hat = null, dress = false } = {}) {
  const g = [];
  if (dress) g.push(P(CYL(0.16, 0.34, 0.85, 8), coat, 0, 0.43, 0));
  else { g.push(P(BOX(0.12, 0.5, 0.14), pants, -0.09, 0.25, 0), P(BOX(0.12, 0.5, 0.14), pants, 0.09, 0.25, 0)); g.push(P(BOX(0.36, 0.42, 0.22), coat, 0, 0.7, 0)); }
  if (dress) g.push(P(BOX(0.3, 0.32, 0.2), coat, 0, 0.98, 0));
  g.push(P(SPH(0.14, 8, 6), skin, 0, 1.12, 0, 0, 0, 0, 1, 1.08, 1), P(SPH(0.145, 8, 5), hair, 0, 1.16, -0.02, 0, 0, 0, 1, 0.85, 1));
  if (hat === 'tricorn') g.push(P(CYL(0.24, 0.24, 0.05, 3), '#1d1a18', 0, 1.27, 0), P(CYL(0.11, 0.13, 0.1, 8), '#1d1a18', 0, 1.31, 0));
  if (hat === 'cap') g.push(P(SPH(0.15, 8, 4), '#e8e0cc', 0, 1.2, 0, 0, 0, 0, 1, 0.7, 1));
  if (hat === 'brim') g.push(P(CYL(0.26, 0.26, 0.03, 10), '#3a2a1a', 0, 1.25, 0), P(CYL(0.12, 0.14, 0.14, 8), '#3a2a1a', 0, 1.33, 0));
  const body = kit.mesh(g); const root = new THREE.Group(); root.add(body);
  const armM = kit.mesh([P(BOX(0.1, 0.42, 0.11), coat, 0, -0.18, 0), P(SPH(0.06, 6, 4), skin, 0, -0.42, 0)]);
  const armL = new THREE.Group(), armR = new THREE.Group(); armL.position.set(-0.23, 0.88, 0); armR.position.set(0.23, 0.88, 0);
  armL.add(armM); armR.add(armM.clone()); root.add(armL, armR); root.userData.armL = armL; root.userData.armR = armR; return root;
}
