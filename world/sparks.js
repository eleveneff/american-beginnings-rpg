// world/sparks.js — copied from /workspace/shared/graphics-kit/helpers/sparks.js (Princess Explorer v3.6.6), 2026-10-31.
// AB: step() reads camera.fov (kit hard-coded 55); default colours are ember / snow / gold instead of pastels.
// v3.6.3 — one shared GPU particle pool (THREE.Points). The GPU moves every spark (start + v·t + ½g·t²),
// so a 30-spark burst costs zero new meshes / materials and one draw call for all bursts on screen.
export function createSparks(THREE, scene, renderer, CAP = 600, camera = null) {
  const geo = new THREE.BufferGeometry();
  const P = new Float32Array(CAP * 3), V = new Float32Array(CAP * 3), C = new Float32Array(CAP * 3), B = new Float32Array(CAP * 2);
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('vel', new THREE.BufferAttribute(V, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.setAttribute('birth', new THREE.BufferAttribute(B, 2));
  for (let i = 0; i < CAP; i++) B[i * 2] = -999;
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uScale: { value: 400 }, uG: { value: 9.0 } },
    vertexShader: `attribute vec3 vel; attribute vec3 color; attribute vec2 birth; uniform float uT; uniform float uScale; uniform float uG; varying vec3 vC; varying float vA;
      void main(){ float t = uT - birth.x; float life = birth.y; vA = (t >= 0.0 && t < life) ? 1.0 - t / life : 0.0; vC = color;
        vec3 p = position + vel * t; p.y -= 0.5 * uG * t * t; vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = vA > 0.0 ? (0.32 + 0.12 * vA) * uScale / max(0.5, -mv.z) : 0.0; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ if (vA <= 0.0) discard; vec2 q = gl_PointCoord - 0.5; float d = length(q);
        float star = max(1.0 - d * 2.2, 0.0) + max(0.0, 0.5 - abs(q.x) * 6.0 - abs(q.y) * 1.2) + max(0.0, 0.5 - abs(q.y) * 6.0 - abs(q.x) * 1.2);
        float a = clamp(star, 0.0, 1.0) * min(1.0, vA * 1.6); if (a < 0.03) discard; gl_FragColor = vec4(vC + 0.25 * star, a); }`,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5; pts.name = 'v36-sparks'; scene.add(pts);
  let head = 0, t = 0, emitted = 0; const col = new THREE.Color();
  const DEF = ['#ff9a3c', '#ffd27a', '#ffffff', '#dfefff', '#e0b23a'];
  function emit(pos, n = 30, colors = DEF, { speed = 1, life = 1.4, up = 1 } = {}) {
    n = Math.min(n, CAP); const s = head;
    for (let k = 0; k < n; k++) {
      const i = head; head = (head + 1) % CAP;
      P[i * 3] = pos.x; P[i * 3 + 1] = pos.y; P[i * 3 + 2] = pos.z;
      V[i * 3] = (Math.random() - 0.5) * 6 * speed; V[i * 3 + 1] = (4 + Math.random() * 5) * speed * up; V[i * 3 + 2] = (Math.random() - 0.5) * 6 * speed;
      col.set(colors[k % colors.length]); C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
      B[i * 2] = t; B[i * 2 + 1] = life * (0.75 + Math.random() * 0.5);
    }
    for (const a of ['position', 'vel', 'color', 'birth']) geo.attributes[a].needsUpdate = true; // tiny buffers: full upload is cheap
    emitted += n; return s;
  }
  function step(dt) { t += dt; mat.uniforms.uT.value = t; mat.uniforms.uScale.value = renderer.domElement.height * 0.5 / Math.tan(Math.PI * (camera ? camera.fov : 55) / 360); }
  function alive() { let c = 0; for (let i = 0; i < CAP; i++) { const a = t - B[i * 2]; if (a >= -0.01 && a < B[i * 2 + 1]) c++; } return c; }
  return { emit, step, alive, points: pts, get emitted() { return emitted; }, CAP };
}
