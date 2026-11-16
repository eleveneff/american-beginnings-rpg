// Mini-game s1 · Atlatl Dart Throw. Two taps per dart: stop the swinging aim line on the target, then stop the power
// needle in the green. Three practice targets (8, 11, 14 m). History: Ice Age hunters in the Americas threw darts with an
// atlatl (spear-thrower); the bow and arrow came into common use in most of North America thousands of years later.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';

export default {
  title: 'Atlatl Dart Throw', icon: '🎯', era: 'Beringia & the first Americans · Ice Age', act: 'Throw the dart',
  intro: 'Hunters in the Ice Age Americas threw darts with an <b>atlatl</b> (AT-lat-ul), a <b>spear-thrower</b>. Its hook holds the end of the dart and works like a longer arm, so the dart flies faster and farther than a throw by hand.',
  how: 'Press <kbd>E</kbd> to stop the swinging aim line on the glowing target, then <kbd>E</kbd> again when the needle is in the <b>green</b>. Hit all 3 targets.',
  tryit: 'Press <kbd>E</kbd> when the aim line points at the glowing hide, then <kbd>E</kbd> again in the green.',
  hint: 'Stop the aim line when it points right at the glowing ring. Then wait for the needle to reach the green part of the bar: green is the right strength for this target.',
  fact: 'People used the atlatl for thousands of years. Hunters tied sharp stone points to the tips of their darts. The <b>bow and arrow</b> came into common use in most of North America much later.',
  build(ctx) {
    const { kit, root, easy } = ctx;
    const DARTS = easy ? 10 : 7, SWEEP = easy ? 3.4 : 2.5, PWR = easy ? 2.3 : 1.7, RAD = easy ? 1.25 : 0.9, TOL = easy ? 1.7 : 1.15;
    const HX = 0, HZ = -1.5, tgts = [];
    ctx.isolate();
    // own tundra floor + snow mountains so level props (and any leftover signs) cannot leak into the range
    const land = [];
    land.push(P(BOX(90, 0.5, 90), '#c8c29a', 0, -0.25, 10, 0, 0, 0, 1, 1, 1, 0.04));
    for (let i = 0; i < 8; i++) { const x = -28 + i * 8, h = 10 + (i % 3) * 4; land.push(P(new THREE.ConeGeometry(7 + (i % 2) * 2, h, 5), '#e8eef4', x, h * 0.35, 28 + (i % 2) * 3)); land.push(P(new THREE.ConeGeometry(5, h * 0.55, 5), '#f4f7fb', x + 2, h * 0.55, 30)); }
    for (let i = 0; i < 40; i++) { const x = (ctx.rnd() - 0.5) * 28, z = ctx.rnd() * 22 - 2; land.push(P(CONE(0.16, 0.35 + ctx.rnd() * 0.3, 4), ['#a8a060', '#8a9a50', '#c4b888'][i % 3], x, 0.15, z)); }
    root.add(kit.mesh(land, { cast: false, recv: true }));
    // ---- period targets (not modern bullseyes): 0 hide-wrapped grass bundle, 1 stone cairn, 2 brush-and-hide frame
    const dists = [8, 11, 14];
    const hideTex = kit.canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#c9a46a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(90,50,20,.25)'; for (let i = 0; i < 30; i++) { x.beginPath(); x.ellipse(Math.random()*w, Math.random()*h, 8+Math.random()*18, 4+Math.random()*8, Math.random(), 0, 6.3); x.fill(); } x.strokeStyle = '#8a3b22'; x.lineWidth = 8; x.beginPath(); x.arc(64, 64, 28, 0, 6.3); x.stroke(); });
    dists.forEach((d, i) => {
      const x = (ctx.rnd() - 0.5) * (i === 0 ? 2 : 4.4), z = HZ + d, y = ctx.gy(x, z);
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = Math.atan2(HX - x, HZ - z) + Math.PI;
      if (i === 0) { // hide bundle on two stakes, ochre ring painted on the hide
        g.add(kit.mesh([P(CYL(0.05, 0.06, 1.7, 6), '#6b4a2a', -0.45, 0.85, 0, 0, 0, 0.08), P(CYL(0.05, 0.06, 1.7, 6), '#6b4a2a', 0.45, 0.85, 0, 0, 0, -0.08),
          P(SPH(0.7, 10, 8), '#c9a46a', 0, 1.15, 0, 0, 0, 0, 1.05, 0.85, 0.35), P(CONE(0.14, 0.55, 5), '#b9a24a', -0.45, 1.55, 0, 0, 0, 0.4), P(CONE(0.12, 0.45, 5), '#a8943e', 0.4, 1.58, 0, 0, 0, -0.35)]));
        const hide = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), kit.mat({ map: hideTex })); hide.position.set(0, 1.15, 0.22); g.add(hide);
      } else if (i === 1) { // cairn of river stones with a hide flap
        g.add(kit.mesh([P(new THREE.DodecahedronGeometry(0.45, 0), '#8a8780', 0, 0.28, 0, 0.2, 0.4, 0, 1.3, 0.7, 1), P(new THREE.DodecahedronGeometry(0.32, 0), '#7a7670', -0.25, 0.55, 0.05, 0.4, 1, 0), P(new THREE.DodecahedronGeometry(0.28, 0), '#9a9488', 0.22, 0.58, 0, 0.2, 0.5, 0), P(new THREE.DodecahedronGeometry(0.22, 0), '#6a6660', 0, 0.88, 0, 0.5, 0.2, 0), P(BOX(0.7, 0.55, 0.04), '#b8945a', 0, 1.05, 0.28, 0.1)]));
      } else { // brush pile on a frame
        g.add(kit.mesh([P(CYL(0.05, 0.06, 1.5, 5), '#6b4a2a', -0.5, 0.75, 0), P(CYL(0.05, 0.06, 1.5, 5), '#6b4a2a', 0.5, 0.75, 0), P(CYL(0.04, 0.04, 1.15, 5), '#5a3a1e', 0, 1.45, 0, 0, 0, Math.PI / 2),
          P(CONE(0.2, 0.8, 5), '#8a9a40', -0.3, 1.1, 0.1, 0.4), P(CONE(0.18, 0.7, 5), '#a8a050', 0.25, 1.15, 0.05, -0.3), P(CONE(0.16, 0.6, 5), '#7a8a38', 0, 1.0, 0.15), P(BOX(0.85, 0.7, 0.03), '#c9a46a', 0, 1.05, 0.22, 0.08)]));
      }
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 32), kit.basic({ color: '#3ee0b0', transparent: true, opacity: 0.8, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.06; g.add(glow);
      kit.ink(g); root.add(g); tgts.push({ g, x, z, d: Math.hypot(x - HX, z - HZ), glow, hit: false });
    });
    // hide rack with a marked hide (not a blank board) and a pile of spare darts
    const hideFace = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), kit.mat({ map: hideTex, side: THREE.DoubleSide }));
    const campG = new THREE.Group();
    campG.add(kit.mesh([P(CYL(0.05, 0.05, 1.6, 6), '#5a3a1e', -0.6, 0.8, 0), P(CYL(0.05, 0.05, 1.6, 6), '#5a3a1e', 0.6, 0.8, 0), P(CYL(0.04, 0.04, 1.4, 6), '#5a3a1e', 0, 1.5, 0, 0, 0, Math.PI / 2),
      P(CYL(0.02, 0.02, 1.8, 4), '#8a6238', -3.8, 0.06, 1.0, 0, 0.2, Math.PI / 2), P(CYL(0.02, 0.02, 1.8, 4), '#8a6238', -3.8, 0.1, 1.1, 0, 0.3, Math.PI / 2)]));
    hideFace.position.set(0, 1.0, 0.04); campG.add(hideFace);
    campG.position.set(4.4, ctx.gy(4.4, -1.2), 2.4); root.add(campG); kit.ink(campG);
    // aim line on the ground
    const aimMat = kit.basic({ color: '#ffe680', transparent: true, opacity: 0.85, depthWrite: false });
    const aim = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1), aimMat); aim.geometry.translate(0, 0.5, 0); aim.rotation.x = -Math.PI / 2;
    const aimG = new THREE.Group(); aimG.position.set(HX, ctx.gy(HX, HZ) + 0.08, HZ); aimG.add(aim); root.add(aimG);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 3), aimMat); tip.rotation.x = Math.PI / 2; aimG.add(tip);
    // the atlatl + dart in her throwing hand (a prop beside her; her own arms are not rigged for it)
    const arm = new THREE.Group(); arm.position.set(HX - 0.32, ctx.gy(HX, HZ) + 1.2, HZ); root.add(arm);
    const atl = kit.mesh([P(BOX(0.05, 0.04, 0.62), '#7a5230', 0, 0, 0.2), P(BOX(0.05, 0.08, 0.05), '#5a3a1e', 0, 0.05, 0.5), P(BOX(0.07, 0.07, 0.1), '#4a2a14', 0, 0, -0.08)]);
    arm.add(atl);
    const dartGeo = () => kit.mesh([P(CYL(0.018, 0.018, 1.8, 5), '#9a7040', 0, 0, 0, Math.PI / 2), P(CONE(0.05, 0.18, 4), '#e8e2d0', 0, 0, 0.98, Math.PI / 2), P(BOX(0.005, 0.1, 0.22), '#d04a2a', 0, 0.04, -0.8), P(BOX(0.1, 0.005, 0.22), '#3a3a3a', 0, 0.0, -0.8)]);
    const held = dartGeo(); held.position.set(0, 0.06, 0.55); arm.add(held);
    let phase = 'aim', t = 0, ang = 0, pwr = 0, darts = DARTS, cur = 0, fly = null; const flown = []; let pend = null;
    const tg = () => tgts[cur];
    const zoneFor = T => { const lo = (T.d - TOL - 5) / 13, hi = (T.d + TOL - 5) / 13; return [clamp(lo, 0, 1), clamp(hi, 0, 1)]; };
    const st = () => ctx.status('🎯 Target ' + Math.min(3, cur + 1) + '/3 · 🪶 Darts ' + darts);
    ctx.placeHero(HX + 0.15, ctx.gy(HX, HZ), HZ - 0.1, 0);
    ctx.cam(HX + 1.5, ctx.gy(HX, HZ) + 2.7, HZ - 5.2, HX - 0.4, 0.9, HZ + 9, true);
    tgts.forEach((T, i) => T.glow.visible = i === 0);
    return {
      start() { st(); ctx.actLabel('Stop the aim'); ctx.prompt('Press E to stop the aim line on the glowing target.', 3.0); ctx.msg('Aim at target 1', 'info', 1.4); },
      bot(lose) {   // test autoplayer: when would a careful kid press? (lose: throws way off target)
        if (pend || fly) return {};
        const T = tg(); if (!T) return {};
        if (lose) return { press: phase === 'aim' ? Math.abs(ang - Math.atan2(T.x - HX, T.z - HZ)) > 0.25 : phase === 'power' };
        if (phase === 'aim') return { press: Math.abs(ang - Math.atan2(T.x - HX, T.z - HZ)) < 0.03 };
        if (phase === 'power') { const z = zoneFor(T); return { press: Math.abs(pwr - (z[0] + z[1]) / 2) < 0.03 }; }
        return {};
      },
      idle(dt) { t += dt; aimG.rotation.y = Math.sin(t * 1.3) * 0.3; },
      action() {
        if (phase === 'aim') { phase = 'power'; t = 0; ctx.actLabel('Throw the dart'); ctx.prompt('Press E to throw when the needle is in the green.', 3.0); return; }
        if (phase === 'power') {
          phase = 'throw'; t = 0; darts--; st(); ctx.meter(null); ctx.sfx('whoosh');
          const d = 5 + pwr * 13, a = ang, from = arm.localToWorld(new THREE.Vector3(0, 0.06, 0.6)); root.worldToLocal(from);
          const T = tg(); const along = (T.x - HX) * Math.sin(a) + (T.z - HZ) * Math.cos(a), lat = Math.abs(-(T.x - HX) * Math.cos(a) + (T.z - HZ) * Math.sin(a));
          const hit = lat < RAD && Math.abs(d - T.d) < TOL + 0.1;
          const end = hit ? new THREE.Vector3(HX + Math.sin(a) * (along - 0.2), T.g.position.y + 1.05, HZ + Math.cos(a) * (along - 0.2)) : new THREE.Vector3(HX + Math.sin(a) * d, 0, HZ + Math.cos(a) * d);
          if (!hit) end.y = ctx.gy(end.x, end.z) + 0.25;
          held.visible = false; const m = dartGeo(); root.add(m); m.position.copy(from);
          fly = { m, from, end, dur: 0.45 + from.distanceTo(end) * 0.028, k: 0, hit, T, arc: 1.2 + from.distanceTo(end) * 0.1 }; flown.push(m);
        }
      },
      update(dt) {
        t += dt;
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } }
        if (phase === 'aim') { const sw = SWEEP + (cur === 0 ? 0.6 : 0); ang = Math.sin(t * Math.PI * 2 / sw) * 0.42; aimG.rotation.y = ang; const len = clamp(tg().d, 6, 15); aim.scale.y = len; tip.position.set(0, 0, len); }
        if (phase === 'power') { const pw = PWR + (cur === 0 ? 0.4 : 0); pwr = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 / pw); const z = zoneFor(tg()); ctx.meter(pwr, { zone: z, label: 'Power' }); arm.rotation.x = -0.4 * pwr; }
        if (phase === 'throw' && fly) {
          fly.k = Math.min(1, fly.k + dt / fly.dur); const k = fly.k;
          const p = new THREE.Vector3().lerpVectors(fly.from, fly.end, k); p.y += Math.sin(k * Math.PI) * fly.arc;
          const q = new THREE.Vector3().lerpVectors(fly.from, fly.end, Math.min(1, k + 0.02)); q.y += Math.sin(Math.min(1, k + 0.02) * Math.PI) * fly.arc;
          fly.m.position.copy(p); if (k < 1) { const w = root.localToWorld(q.clone()); fly.m.lookAt(w); }
          arm.rotation.x = lerp(arm.rotation.x, 0.9, Math.min(1, dt * 14));
          if (k >= 1) {
            const f = fly; fly = null;
            if (f.hit) { f.T.hit = true; kit.puff(f.end, '#e8d9a8', 10, { spread: 0.7, up: 1.2 }); ctx.msg(['Hit!', 'Great shot!', 'True!'][cur], 'good'); ctx.flash('good'); ctx.sfx('hit'); f.T.glow.visible = false; cur++; }
            else { kit.puff(f.end, '#b7a07a', 6, { spread: 0.4, up: 0.9 }); ctx.msg(Math.abs(5 + pwr * 13 - f.T.d) > TOL ? (5 + pwr * 13 < f.T.d ? 'Too short!' : 'Too far!') : 'Missed: aim closer!', 'bad'); ctx.flash('bad'); ctx.sfx('miss'); if (ctx.grace('The dart missed. Watch the glowing target — this first miss does not count.')) darts++; }
            pend = { t: 0.75, f: () => {
              if (cur >= 3) return ctx.win('You hit all 3 targets with ' + (DARTS - darts) + ' darts.');
              if (darts <= 0) return ctx.lose('Out of darts! You hit ' + cur + ' of 3 targets.');
              tgts.forEach((T, i) => T.glow.visible = i === cur); held.visible = true; arm.rotation.x = 0; phase = 'aim'; t = 0; st(); ctx.actLabel('Stop the aim'); ctx.prompt('Press E to stop the aim line on the glowing target.', 2.6);
            } };
          }
        }
        for (const T of tgts) if (T.glow.visible) T.glow.material.opacity = 0.55 + 0.3 * Math.sin(performance.now() / 180);
      },
    };
  }
};
