// world/toon.js — copied from /workspace/shared/graphics-kit/helpers/toon.js (Princess Explorer v3.6.6), 2026-10-31.
// AB: default ink colour is the game's SVG ink #2a1a0c (hero.js INK); rim tint is a cool snow-light. Used on Abigail only;
// the instanced herds get their own instanced ink hull in beringia.js (same shader idea).
// v3.6.3 — character pop: ink outlines (inverted hull, pushed out along normals) + soft rim light shell.
// Works on any character group without touching its own materials (outfits / setLook keep working).
export function createToon(THREE) {
  const outMats = new Map(), rimMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#e8f1ff') }, uPow: { value: 2.6 }, uAmt: { value: 0.42 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position + normal * 0.004, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uPow; uniform float uAmt; varying vec3 vN; varying vec3 vV; void main(){ float r = pow(1.0 - clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPow) * uAmt; gl_FragColor = vec4(uColor * r, r); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  function outMat(color, w) {
    const k = color + '|' + w; if (outMats.has(k)) return outMats.get(k);
    const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normalize(normal) * ${w.toFixed(4)};`); };
    m.customProgramCacheKey = () => 'ink' + w; outMats.set(k, m); return m;
  }
  const _ws = new THREE.Vector3();
  const SKIP = /Plane|Circle|Ring|Shape|Text/;
  // decorate(root): adds .userData.ink / .userData.rim children to each solid mesh (idempotent)
  function decorate(root, { color = '#2a1a0c', width = 0.016, rim = true, minSize = 0.05, rimMin = 0.22 } = {}) {
    let added = 0; const list = [];
    root.traverse(o => { if (o.isMesh && !o.userData.fxPart && !o.userData.inked && o.geometry && o.geometry.attributes.normal && !SKIP.test(o.geometry.type) && !(o.material && (o.material.transparent || Array.isArray(o.material) || o.material.isSpriteMaterial))) list.push(o); });
    for (const o of list) {
      const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (g.boundingSphere.radius < minSize) { o.userData.inked = true; continue; }
      const s = Math.max(Math.abs(o.scale.x), Math.abs(o.scale.y), Math.abs(o.scale.z)) || 1;
      const ink = new THREE.Mesh(g, outMat(color, width / s)); ink.userData.fxPart = 'ink'; ink.castShadow = false; ink.receiveShadow = false; ink.raycast = () => { }; ink.renderOrder = -1;
      o.add(ink); o.userData.inked = true; o.userData.ink = ink; added++;
      // rim shells only on the big parts (dress, body, head, hair...): small bits barely show a rim but each shell is an extra
      // transparent draw — v3.6.3 perf fix (66 → ~25 shells on her; slow devices were ~20% slower with all of them)
      if (rim && g.boundingSphere.radius * Math.max(...o.getWorldScale(_ws).toArray().map(Math.abs)) >= rimMin) { const r = new THREE.Mesh(g, rimMat); r.userData.fxPart = 'rim'; r.raycast = () => { }; r.renderOrder = 2; o.add(r); o.userData.rim = r; }
    }
    return added;
  }
  function setVisible(root, on) { root.traverse(o => { if (o.userData.fxPart) o.visible = on; }); }
  return { decorate, setVisible, rimMat };
}
