// Low-poly N64-style 3D background (Three.js from CDN). If it fails to load,
// the CSS gradient fallback behind it is shown instead and the game still works.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("world");
const DEFAULT = { sky: "#f6d28a", sky2: "#7ec8f0", ground: "#8fc46a", ground2: "#3f8a4a", accent: "#e0b23a", snow: false, water: true };
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { canvas.style.display = "none"; throw e; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445533, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(30, 50, 20); scene.add(sun);
let group = new THREE.Group(); scene.add(group);

function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function flat(color) { return new THREE.MeshLambertMaterial({ color, flatShading: true }); }

function build(p) {
  scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  group = new THREE.Group(); scene.add(group);
  const sky = new THREE.Color(p.sky2), horizon = new THREE.Color(p.sky);
  scene.background = sky; scene.fog = new THREE.Fog(horizon, 60, 170);
  const r = rnd(7 + (p.ground.charCodeAt(2) || 1));
  // terrain
  const g = new THREE.PlaneGeometry(260, 260, 48, 48); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, colors = [], c1 = new THREE.Color(p.ground), c2 = new THREE.Color(p.ground2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), d = Math.hypot(x, z);
    let y = Math.sin(x * 0.06) * Math.cos(z * 0.05) * 3 + (r() - 0.5) * 1.6;
    if (d > 70) y += (d - 70) * 0.35 * (0.6 + r());
    if (p.water && z < -25 && Math.abs(x) < 120) y -= 6;
    pos.setY(i, y);
    const c = c1.clone().lerp(c2, Math.min(1, Math.max(0, (y + 2) / 14)));
    if (p.snow && y > 8) c.set(0xf4f9ff);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3)); g.computeVertexNormals();
  group.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  if (p.water) { const w = new THREE.Mesh(new THREE.PlaneGeometry(260, 120), new THREE.MeshLambertMaterial({ color: 0x2f8fd8, transparent: true, opacity: 0.85 })); w.rotation.x = -Math.PI / 2; w.position.set(0, -2.5, -80); group.add(w); }
  // trees / rocks / glaciers
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * 160, z = (r() - 0.5) * 160; if (Math.hypot(x, z) < 12 || (p.water && z < -20)) continue;
    if (p.snow && r() < 0.5) { const ice = new THREE.Mesh(new THREE.IcosahedronGeometry(2 + r() * 4, 0), flat(0xdff3ff)); ice.position.set(x, 1, z); group.add(ice); continue; }
    const h = 3 + r() * 4, t = new THREE.Mesh(new THREE.ConeGeometry(1.2 + r(), h, 6), flat(p.snow ? 0x2f6b4f : 0x2e7d32)); t.position.set(x, h / 2 + 1, z); group.add(t);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 5), flat(0x6b4a2b)); tr.position.set(x, 0.8, z); group.add(tr);
  }
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(14 + r() * 10, 30 + r() * 25, 5), flat(p.snow ? 0xeaf6ff : 0x6d8a5a)); m.position.set((r() - 0.5) * 240, 10, 110 + r() * 30); group.add(m); }
  // accent landmark (a glowing crystal like a Zelda shrine)
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), new THREE.MeshLambertMaterial({ color: p.accent, emissive: p.accent, emissiveIntensity: 0.4, flatShading: true }));
  gem.position.set(0, 6, 0); gem.name = "gem"; group.add(gem);
  for (let i = 0; i < 12; i++) { const cl = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + r() * 3, 0), flat(0xffffff)); cl.position.set((r() - 0.5) * 200, 35 + r() * 10, (r() - 0.5) * 200); cl.scale.y = 0.5; group.add(cl); }
}
function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener("resize", resize); resize();
window.addEventListener("palette", e => build(e.detail || DEFAULT));
build(window.CURRENT_PALETTE || DEFAULT);
const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let t = 0;
(function loop() {
  t += reduce ? 0 : 0.0016;
  camera.position.set(Math.sin(t) * 45, 18, Math.cos(t) * 45); camera.lookAt(0, 4, 0);
  const gem = group.getObjectByName("gem"); if (gem) { gem.rotation.y += 0.02; gem.position.y = 6 + Math.sin(performance.now() / 600) * 0.6; }
  renderer.render(scene, camera); requestAnimationFrame(loop);
})();
