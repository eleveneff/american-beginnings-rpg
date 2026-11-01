// world/gfx.js — adapted copy of /workspace/shared/graphics-kit/helpers/gfx.js (Princess Explorer v3.6.6), 2026-10-31.
// AB changes (see /workspace/abrpg-design/graphics-kit-review.md §2):
//  • own key 'americanBeginningsRPG_gfx' (never inside the progress save); button '#gfx-mode' lives in the walk HUD;
//  • Auto caps the pixel ratio at 1.5 (2 only in High); Low = one 1024 hard (PCF) sun shadow, no ink outlines, pixel ratio 1 (v2.6: shadows kept so props don't float);
//  • ACES tone mapping at exposure ~1.05 with a cooler Ice Age sun (#ffe9d0), cool fill + hemisphere;
//  • follow-shadow box ±25 m, snapped to shadow texels (unchanged from the kit);
//  • adaptive DPR reports slow streaks to onSlow() so the world can offer Classic mode (never forced).
export const GFX_KEY = 'americanBeginningsRPG_gfx';
export function readGfxMode() { let m = 'auto'; try { m = localStorage.getItem(GFX_KEY) || 'auto'; } catch (e) { } return ['auto', 'high', 'low'].includes(m) ? m : 'auto'; }
export function createGfx({ THREE, renderer, scene, sun, hemi, getFocus, isTouch, toon, chars, sparks, onSlow, onApply }) {
  const rawDPR = window.devicePixelRatio || 1;
  const phone = !!(isTouch && isTouch()) || Math.min(screen.width || 9999, screen.height || 9999) < 600;
  const st = { mode: readGfxMode(), dpr: renderer.getPixelRatio(), cap: 1.5, floor: 0.75, acc: 0, n: 0, slowFor: 0, changes: 0, shadowSize: 2048, phone, shadows: true };

  // ---- 1: tone mapping + light rebalance (cooler than the kit's pastel castle)
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  if (hemi) { hemi.color.set('#e4eefc'); hemi.groundColor.set('#9a8f74'); hemi.intensity = 1.1; }
  sun.color.set('#ffe9d0'); sun.intensity = 2.0;
  const fill = new THREE.DirectionalLight('#c9dcff', 0.4); fill.position.set(-30, 18, -25); scene.add(fill);

  // ---- 2: shadow box follows the hero
  const HALF = 25, OFF = new THREE.Vector3(22, 38, 14);
  Object.assign(sun.shadow.camera, { left: -HALF, right: HALF, top: HALF, bottom: -HALF, near: 1, far: 110 });
  sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  scene.add(sun.target);
  const texel = () => (2 * HALF) / st.shadowSize;
  function follow() {
    const f = getFocus(); if (!f) return;
    const s = texel(), x = Math.round(f.x / s) * s, z = Math.round(f.z / s) * s;
    sun.target.position.set(x, f.y || 0, z); sun.position.set(x + OFF.x, (f.y || 0) + OFF.y, z + OFF.z); sun.target.updateMatrixWorld();
  }
  function setShadowSize(n) {
    if (st.shadowSize === n && sun.shadow.mapSize.x === n) return; st.shadowSize = n; sun.shadow.mapSize.set(n, n);
    if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
  }
  function setDPR(d) { d = Math.round(Math.max(st.floor, Math.min(st.cap, d)) * 100) / 100; if (d === st.dpr) return; st.dpr = d; renderer.setPixelRatio(d); renderer.setSize(window.innerWidth, window.innerHeight, false); st.changes++; }
  function setShadows(on) { st.shadows = on; renderer.shadowMap.enabled = on; sun.castShadow = on; }
  let degMode = null;
  function apply() {
    if (st.mode === 'high') { st.cap = Math.min(rawDPR, 2); st.floor = st.cap; setShadows(true); setShadowSize(2048); renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
    else if (st.mode === 'low') { st.cap = 1; st.floor = Math.min(1, rawDPR) * 0.75; setShadows(true); setShadowSize(1024); renderer.shadowMap.type = THREE.PCFShadowMap; }   // v2.6: Low keeps one 1024 hard shadow (grounding); drops ink, extras, DPR
    else { st.cap = Math.min(rawDPR, 1.5); st.floor = Math.min(0.75, st.cap); setShadows(true); setShadowSize(phone ? 1024 : 2048); renderer.shadowMap.type = phone ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap; }
    // v2.3: a step-down sticks for this visit (coming back from a lesson panel used to reset it and re-run the slow ramp)
    st.dpr = renderer.getPixelRatio();   // the Classic background may have changed it behind our back
    if (degMode !== st.mode) { degMode = st.mode; st.deg = 0; setDPR(st.cap); } else if (st.mode === 'auto' && st.deg) { setDPR(st.floor); reDeg(); } else setDPR(st.cap);
    st.slowFor = 0; st.skip = 1;
    renderer.shadowMap.needsUpdate = true; scene.traverse(o => { if (o.material && !Array.isArray(o.material)) o.material.needsUpdate = true; });
    inkT = 0;
    const b = document.getElementById('gfx-mode'); if (b) b.textContent = '✨ ' + ({ auto: 'Auto', high: 'High', low: 'Low' })[st.mode];
    if (onApply) onApply(st);
  }
  function reDeg() {
    if (st.deg >= 1) { renderer.shadowMap.type = THREE.PCFShadowMap; setShadowSize(1024); }
    if (st.deg >= 2) setShadows(false);
    if (st.deg >= 3) inkPass();
  }
  let inkT = 0; const inkOn = () => st.mode !== 'low' && !(st.deg >= 3);
  function inkPass() { if (!toon || !chars) return; for (const c of chars()) { if (!c) continue; if (inkOn()) toon.decorate(c, { width: 0.012, rimMin: 0.18 }); toon.setVisible(c, inkOn()); } }
  function frame(dt) {
    follow(); if (sparks) sparks.step(dt || 0);
    inkT -= dt || 0; if (inkT <= 0) { inkT = 1; inkPass(); }
    if (!(dt > 0) || dt > 0.25) return;   // v2.3: a one-off stall (shader compile, tab switch) is not a slow device
    st.acc += dt; st.n++;
    if (st.acc < 1.5) return;
    const avg = st.acc / st.n, span = st.acc; st.acc = 0; st.n = 0;
    if (st.skip > 0) { st.skip--; return; }   // v2.3: let a change settle (recompiles) before judging it
    if (st.mode === 'auto') {
      if (avg > 1 / 40) setDPR(st.dpr - 0.25);
      else if (avg < 1 / 56 && st.dpr < st.cap) setDPR(st.dpr + 0.125);
      // v2.2: still slow at the DPR floor → step features down once each (hard shadows, no shadows, no ink); never back up in this visit.
      // v2.3: thresholds per step (24 / 13 / 10 fps) so a playable 13–24 fps keeps shadows and ink outlines.
      const need = [24, 13, 10][st.deg || 0];
      if ((st.deg || 0) < 3 && avg > 1 / need && st.dpr <= st.floor + 0.001) {
        st.deg = (st.deg || 0) + 1; reDeg(); st.skip = 1;
        renderer.shadowMap.needsUpdate = true; scene.traverse(o => { if (o.material && !Array.isArray(o.material)) o.material.needsUpdate = true; });
        st.changes++;
      }
    }
    // under 20 fps at the floor (or in Low / High) for 10 s → offer Classic once
    if (avg > 1 / 20 && st.dpr <= st.floor + 0.001) { st.slowFor += span; if (st.slowFor >= 10 && onSlow) { onSlow(1 / avg); st.slowFor = -1e9; } }
    else if (st.slowFor > 0) st.slowFor = 0;
  }
  function setMode(m) { st.mode = m; try { localStorage.setItem(GFX_KEY, m); } catch (e) { } apply(); }
  function cycle() { setMode(({ auto: 'high', high: 'low', low: 'auto' })[st.mode]); }
  apply(); follow();
  return { frame, inkPass, setMode, cycle, follow, st, fill, apply, get mode() { return st.mode; }, get dpr() { return renderer.getPixelRatio(); } };
}
