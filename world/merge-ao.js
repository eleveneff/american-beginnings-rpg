// world/merge-ao.js — copied from /workspace/shared/graphics-kit/helpers/world-merge-ao.js (Captain Adventure v3.5), 2026-10-31.
// Kept: mergeStatic() (one mesh per material for static groups; anything tagged userData.noMerge stays separate),
// decal() (polygon offset for flat-on-surface pieces) and the contact-AO InstancedMesh.
// AB changes: import through the page's import map; NO wood-plank / lawn textures (planks are anachronistic in
// Ice Age Beringia); AO heights come from groundH(x, z) — the same function that built the terrain — instead of a
// y = 12 raycast (our hills are taller than 12 m); a blue-grey AO colour option for snow; decals lift >= 3 cm.
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

export function createMergeAO(THREE, scene, { groundH, color = '#2b3a24', opacity = 0.4 } = {}) {
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  // flat-on-surface material: pulled toward the camera in depth so it never fights the surface below
  function decal(mat, f = -1, u = -2) { mat.polygonOffset = true; mat.polygonOffsetFactor = f; mat.polygonOffsetUnits = u; return mat; }
  // ---------- static merge ----------
  const stats = { groups: 0, meshesIn: 0, meshesOut: 0 };
  function mergeStatic(root, { minCount = 2 } = {}) {
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const buckets = new Map(); const victims = [];
    root.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o === root || o.userData.noMerge || o.children.length) return; // meshes with children (e.g. a part carrying a light) stay
      const m = o.material; if (Array.isArray(m) || !m || m.transparent || o.morphTargetInfluences) return;
      for (let p = o.parent; p && p !== root; p = p.parent) if (p.userData.noMerge || !p.visible) return;
      if (!o.visible) return;
      const k = m.uuid + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0) + '|' + o.renderOrder;
      if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(o);
    });
    let made = 0;
    for (const [, list] of buckets) {
      if (list.length < minCount) continue;
      const keep = ['position', 'normal', 'uv', 'color'].filter(n => n === 'position' || n === 'normal' || list.every(o => o.geometry.attributes[n] && o.geometry.attributes[n].itemSize === list[0].geometry.attributes[n].itemSize));
      if (list[0].material.vertexColors && !keep.includes('color')) continue;
      const geos = list.map(o => {
        let g = o.geometry.clone(); if (g.index) g = g.toNonIndexed();
        for (const n of Object.keys(g.attributes)) if (!keep.includes(n)) g.deleteAttribute(n);
        if (!g.attributes.normal) g.computeVertexNormals();
        g.morphAttributes = {}; g.clearGroups();
        g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); return g;
      });
      const merged = mergeGeometries(geos, false); geos.forEach(g => g.dispose()); if (!merged) continue;
      const mm = new THREE.Mesh(merged, list[0].material); mm.castShadow = list[0].castShadow; mm.receiveShadow = list[0].receiveShadow; mm.renderOrder = list[0].renderOrder;
      mm.userData.merged = list.length; mm.name = 'v35-merged';
      root.add(mm); made++;
      list.forEach(o => victims.push(o));
    }
    victims.forEach(o => { if (o.parent) o.parent.remove(o); });
    // drop now-empty sub-groups
    const empties = []; root.traverse(o => { if (o !== root && !o.isMesh && o.children.length === 0 && o.type === 'Group') empties.push(o); });
    empties.forEach(o => o.parent && o.parent.remove(o));
    stats.groups++; stats.meshesIn += victims.length; stats.meshesOut += made;
    return made;
  }

  // ---------- contact AO (AB: groundH instead of a raycast) ----------
  const aoSpots = [];
  // spot = an Object3D (world position + scale read at build time) or {x, z}; snow = blue-grey instead of earth-dark
  function addAO(obj, radius, strength = 1, snow = false) { aoSpots.push({ obj, r: radius, s: strength, snow }); }
  const aoTex = canvasTex(64, 64, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
  const aoMat = decal(new THREE.MeshBasicMaterial({ color: '#ffffff', alphaMap: aoTex, transparent: true, opacity, depthWrite: false, fog: true }), -2, -4);
  const EARTH = new THREE.Color(color), SNOW = new THREE.Color('#5a6f8a');
  let aoMesh = null;
  function buildAO() {
    if (aoMesh) { scene.remove(aoMesh); aoMesh.geometry.dispose(); aoMesh = null; }
    const hits = [], wp = new THREE.Vector3(), ws = new THREE.Vector3();
    for (const a of aoSpots) {
      let x, z, sc = 1;
      if (a.obj && a.obj.isObject3D) { if (!a.obj.parent) continue; a.obj.updateWorldMatrix(true, false); a.obj.getWorldPosition(wp); a.obj.getWorldScale(ws); x = wp.x; z = wp.z; sc = (ws.x + ws.z) / 2; }
      else { x = a.obj.x; z = a.obj.z; }
      hits.push({ x, y: groundH(x, z) + 0.04, z, r: a.r * sc, s: a.s, snow: a.snow }); // 4 cm lift: never fights the ground
    }
    const geo = new THREE.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
    aoMesh = new THREE.InstancedMesh(geo, aoMat, Math.max(1, hits.length)); aoMesh.name = 'ab-contact-ao'; aoMesh.userData.noMerge = true;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
    hits.forEach((h, i) => { s.set(h.r * 2, 1, h.r * 2); p.set(h.x, h.y, h.z); m4.compose(p, q, s); aoMesh.setMatrixAt(i, m4); c.copy(h.snow ? SNOW : EARTH).multiplyScalar(Math.max(0.4, Math.min(1.2, h.s))); aoMesh.setColorAt(i, c); });
    aoMesh.count = hits.length; aoMesh.renderOrder = 1; aoMesh.frustumCulled = false; scene.add(aoMesh);
    return hits.length;
  }
  return { decal, mergeStatic, addAO, buildAO, stats, canvasTex, get aoMesh() { return aoMesh; }, aoSpots };
}
