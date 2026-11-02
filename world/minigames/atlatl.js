// Mini-game s1 · Atlatl Dart Throw. Two taps per dart: stop the swinging aim line on the target, then stop the power
// needle in the green. Three practice targets (8, 11, 14 m). History: Ice Age hunters in the Americas threw darts with an
// atlatl (spear-thrower); the bow and arrow came into common use in most of North America thousands of years later.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';

export default {
  title: 'Atlatl Dart Throw', icon: '🎯', era: 'Beringia & the first Americans · Ice Age', act: 'Throw',
  intro: 'Hunters in the Ice Age Americas threw darts with an <b>atlatl</b> (AT-lat-ul), a <b>spear-thrower</b>. Its hook holds the end of the dart and works like a longer arm, so the dart flies faster and farther than a throw by hand.',
  how: 'Press <kbd>E</kbd> to stop the swinging aim line on the glowing target, then <kbd>E</kbd> again when the needle is in the <b>green</b>. Hit all 3 targets.',
  hint: 'Stop the aim line when it points right at the glowing ring. Then wait for the needle to reach the green part of the bar: green is the right strength for this target.',
  fact: 'People used the atlatl for thousands of years. Hunters tied sharp stone points to the tips of their darts. The <b>bow and arrow</b> came into common use in most of North America much later.',
  build(ctx) {
    const { kit, root, easy } = ctx;
    const DARTS = easy ? 10 : 7, SWEEP = easy ? 3.4 : 2.5, PWR = easy ? 2.3 : 1.7, RAD = easy ? 1.25 : 0.9, TOL = easy ? 1.7 : 1.15;
    const HX = 0, HZ = -1.5, tgts = [];
    // ---- targets: grass bundles wrapped in hide, on two stakes, a red ochre ring painted on
    const dists = [8, 11, 14];
    dists.forEach((d, i) => {
      const x = (ctx.rnd() - 0.5) * (i === 0 ? 2 : 4.4), z = HZ + d, y = ctx.gy(x, z);
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = Math.atan2(HX - x, HZ - z) + Math.PI;
      g.add(kit.mesh([P(CYL(0.05, 0.06, 1.7, 6), '#6b4a2a', -0.55, 0.85, 0, 0, 0, 0.1), P(CYL(0.05, 0.06, 1.7, 6), '#6b4a2a', 0.55, 0.85, 0, 0, 0, -0.1),
        P(CYL(0.62, 0.66, 0.42, 14), '#c9a46a', 0, 1.05, 0, Math.PI / 2), P(CYL(0.5, 0.5, 0.44, 14), '#8a3b22', 0, 1.05, 0.0, Math.PI / 2, 0, 0, 1, 1.0, 1),
        P(CYL(0.36, 0.36, 0.46, 14), '#d8b67c', 0, 1.05, 0, Math.PI / 2), P(CYL(0.15, 0.15, 0.48, 10), '#3a2414', 0, 1.05, 0, Math.PI / 2),
        P(CONE(0.12, 0.5, 5), '#b9a24a', -0.5, 1.55, 0, 0, 0, 0.5), P(CONE(0.12, 0.5, 5), '#a8943e', 0.45, 1.6, 0, 0, 0, -0.4), P(CONE(0.1, 0.4, 5), '#c2ae58', 0.1, 1.62, 0)]));
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 32), kit.basic({ color: '#3ee0b0', transparent: true, opacity: 0.8, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.06; g.add(glow);
      kit.ink(g); root.add(g); tgts.push({ g, x, z, d: Math.hypot(x - HX, z - HZ), glow, hit: false });
    });
    // little camp props behind her: a hide rack and a pile of spare darts
    const camp = kit.mesh([P(CYL(0.05, 0.05, 1.6, 6), '#5a3a1e', 1.6, 0.8, -3.6), P(CYL(0.05, 0.05, 1.6, 6), '#5a3a1e', 2.8, 0.8, -3.6), P(CYL(0.04, 0.04, 1.4, 6), '#5a3a1e', 2.2, 1.5, -3.6, 0, 0, Math.PI / 2), P(BOX(1.1, 0.9, 0.04), '#a77d4f', 2.2, 1.0, -3.58, 0.05),
      P(CYL(0.02, 0.02, 1.8, 4), '#8a6238', -1.6, 0.06, -2.6, 0, 0.2, Math.PI / 2), P(CYL(0.02, 0.02, 1.8, 4), '#8a6238', -1.6, 0.1, -2.5, 0, 0.3, Math.PI / 2)]);
    camp.position.set(2.2, ctx.gy(4.4, -1.2), 2.4); root.add(camp); kit.ink(camp);
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
      start() { st(); ctx.msg('Aim at target 1', 'info', 1.4); },
      bot() {   // test autoplayer: when would a careful kid press?
        if (pend || fly) return {};
        const T = tg(); if (!T) return {};
        if (phase === 'aim') return { press: Math.abs(ang - Math.atan2(T.x - HX, T.z - HZ)) < 0.03 };
        if (phase === 'power') { const z = zoneFor(T); return { press: Math.abs(pwr - (z[0] + z[1]) / 2) < 0.03 }; }
        return {};
      },
      idle(dt) { t += dt; aimG.rotation.y = Math.sin(t * 1.3) * 0.3; },
      action() {
        if (phase === 'aim') { phase = 'power'; t = 0; return; }
        if (phase === 'power') {
          phase = 'throw'; t = 0; darts--; st(); ctx.meter(null);
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
        if (phase === 'aim') { ang = Math.sin(t * Math.PI * 2 / SWEEP) * 0.42; aimG.rotation.y = ang; const len = clamp(tg().d, 6, 15); aim.scale.y = len; tip.position.set(0, 0, len); }
        if (phase === 'power') { pwr = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 / PWR); const z = zoneFor(tg()); ctx.meter(pwr, { zone: z, label: 'Power' }); arm.rotation.x = -0.4 * pwr; }
        if (phase === 'throw' && fly) {
          fly.k = Math.min(1, fly.k + dt / fly.dur); const k = fly.k;
          const p = new THREE.Vector3().lerpVectors(fly.from, fly.end, k); p.y += Math.sin(k * Math.PI) * fly.arc;
          const q = new THREE.Vector3().lerpVectors(fly.from, fly.end, Math.min(1, k + 0.02)); q.y += Math.sin(Math.min(1, k + 0.02) * Math.PI) * fly.arc;
          fly.m.position.copy(p); if (k < 1) { const w = root.localToWorld(q.clone()); fly.m.lookAt(w); }
          arm.rotation.x = lerp(arm.rotation.x, 0.9, Math.min(1, dt * 14));
          if (k >= 1) {
            const f = fly; fly = null;
            if (f.hit) { f.T.hit = true; kit.puff(f.end, '#e8d9a8', 10, { spread: 0.7, up: 1.2 }); ctx.msg(['Hit!', 'Great shot!', 'Bullseye!'][cur], 'good'); f.T.glow.visible = false; cur++; }
            else { kit.puff(f.end, '#b7a07a', 6, { spread: 0.4, up: 0.9 }); ctx.msg(Math.abs(5 + pwr * 13 - f.T.d) > TOL ? (5 + pwr * 13 < f.T.d ? 'Too short!' : 'Too far!') : 'Missed: aim closer!', 'bad'); }
            pend = { t: 0.75, f: () => {
              if (cur >= 3) return ctx.win('You hit all 3 targets with ' + (DARTS - darts) + ' darts.');
              if (darts <= 0) return ctx.lose('Out of darts! You hit ' + cur + ' of 3 targets.');
              tgts.forEach((T, i) => T.glow.visible = i === cur); held.visible = true; arm.rotation.x = 0; phase = 'aim'; t = 0; st();
            } };
          }
        }
        for (const T of tgts) if (T.glow.visible) T.glow.material.opacity = 0.55 + 0.3 * Math.sin(performance.now() / 180);
      },
    };
  }
};
