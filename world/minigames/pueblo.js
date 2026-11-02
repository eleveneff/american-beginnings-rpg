// Mini-game s2 · Build a Pueblo Wall. A sandstone wall section slides back and forth above the wall; press E to set it
// down on the course below. Land it mostly on top and it sticks; too far off and it tumbles (a gentle miss).
// History: Ancestral Puebloans at Chaco Canyon (about 850–1150) built great houses like Pueblo Bonito: hundreds of rooms,
// four to five stories, shaped sandstone set in mud mortar, roof beams carried by hand from distant mountain forests.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';

export default {
  title: 'Build a Pueblo Wall', icon: '🧱', era: 'Ancestral Puebloans · Chaco Canyon, about 850–1150', act: 'Set',
  intro: 'At <b>Chaco Canyon</b> in today\'s New Mexico, Ancestral Puebloan builders raised <b>great houses</b> of shaped <b>sandstone</b> set in <b>mud mortar</b>. Each new course of stone had to sit squarely on the one below, or the wall would not stand.',
  how: 'A wall stone slides back and forth. Press <kbd>E</kbd> to set it down right on top of the course below. Build <b>7 courses</b>. If a stone is too far off, it tumbles.',
  hint: 'Don\'t watch the moving stone alone: watch the gap between it and the wall below. Press E just as their edges line up. It slides back and forth at the same speed, so you can count the rhythm.',
  fact: 'Pueblo Bonito, the biggest great house at Chaco, had hundreds of rooms and rose four to five stories. Builders had no metal tools, wheels or horses: they shaped stone with harder stones and carried pine logs for roof beams by hand from mountains about 50 miles away. Pueblo peoples today still live in New Mexico and Arizona.',
  build(ctx) {
    const { kit, root, easy } = ctx, N = 7, LIVES = easy ? 5 : 3, W = 2.6, H = 0.42, D = 0.7, TOL = W * (easy ? 0.42 : 0.35), WZ = 5;
    ctx.isolate();
    const g = [];
    // canyon floor, the tall tan cliff behind, sage and rocks
    g.push(P(BOX(70, 0.4, 60), '#d6b07a', 0, -0.2, 10, 0, 0, 0, 1, 1, 1, 0.04));
    for (let i = 0; i < 9; i++) { const x = -24 + i * 6 + (ctx.rnd() - 0.5) * 2, h = 9 + ctx.rnd() * 5; g.push(P(BOX(7.4, h, 4), ['#c98a52', '#b8784a', '#d49a62'][i % 3], x, h / 2, 22 + ctx.rnd() * 1.5, 0, 0, 0, 1, 1, 1, 0.05)); g.push(P(BOX(6.6, 0.8, 4.2), '#e2b07a', x, h + 0.4, 22.2)); }
    for (let i = 0; i < 26; i++) { const x = (ctx.rnd() - 0.5) * 30, z = -4 + ctx.rnd() * 22; if (Math.abs(x) < 4 && z > 2 && z < 9) continue; g.push(P(SPH(0.35 + ctx.rnd() * 0.25, 6, 4), ['#8a9a6a', '#9aa878', '#7a8a5e'][i % 3], x, 0.2, z, 0, 0, 0, 1, 0.7, 1)); }
    // finished great-house rooms on both sides: stepped stories, T-shaped doorways, beam ends (vigas), a ladder
    const room = (x, z, w, d, st) => { for (let s = 0; s < st; s++) { const ww = w - s * 1.2, zz = z + s * 0.9; g.push(P(BOX(ww, 2.2, d - s * 0.9), s % 2 ? '#c99a64' : '#d2a46c', x, 1.1 + s * 2.2, zz, 0, 0, 0, 1, 1, 1, 0.05));
        for (let b = -2; b <= 2; b++) g.push(P(CYL(0.07, 0.07, 0.5, 5), '#6b4a2a', x + b * ww / 5.5, 2.05 + s * 2.2, zz - (d - s * 0.9) / 2 - 0.15, Math.PI / 2));
        g.push(P(BOX(0.5, 0.7, 0.1), '#3a2414', x - ww / 4, 1.25 + s * 2.2, zz - (d - s * 0.9) / 2 - 0.01), P(BOX(0.9, 0.35, 0.1), '#3a2414', x - ww / 4, 1.7 + s * 2.2, zz - (d - s * 0.9) / 2 - 0.01)); } };
    room(-8.5, 9, 6, 4.5, 3); room(8.6, 9.5, 6, 4.5, 2); room(-15, 12, 6, 4, 2);
    for (const [x, z, h] of [[-6.6, 6.5, 3.2], [6.8, 7, 2.8]]) { g.push(P(CYL(0.05, 0.05, h, 5), '#8a6238', x - 0.3, h / 2, z, 0, 0, 0.08), P(CYL(0.05, 0.05, h, 5), '#8a6238', x + 0.3, h / 2, z, 0, 0, -0.08)); for (let r = 0.4; r < h; r += 0.45) g.push(P(CYL(0.035, 0.035, 0.62, 4), '#8a6238', x, r, z, 0, 0, Math.PI / 2)); }
    // her work site: a stack of shaped stones, a mortar pot, a stone hammer
    g.push(P(CYL(0.4, 0.3, 0.45, 10), '#a0603a', 3.2, 0.22, 2.2), P(CYL(0.36, 0.36, 0.05, 10), '#7a5a3a', 3.2, 0.44, 2.2));
    for (let i = 0; i < 6; i++) g.push(P(BOX(0.7, 0.16, 0.4), ['#cf9a5e', '#b98250', '#dcae72'][i % 3], -3.4 + (i % 2) * 0.1, 0.08 + i * 0.16, 2.6, 0, i * 0.2));
    root.add(kit.mesh(g, { cast: false, recv: true }));
    // the wall's foundation course
    const wall = new THREE.Group(); wall.position.set(0, 0, WZ); root.add(wall);
    const tones = ['#d9a66a', '#c8925a', '#e0b47c', '#bf8650', '#d39c60'];
    const stone = (w) => { const parts = [P(BOX(w, H, D), '#8a6a4a', 0, H / 2, 0, 0, 0, 0, 1, 1, 1, 0.02)];   // mortar core
      let x = -w / 2; let r = (ctx.rnd() * 5) | 0; while (x < w / 2 - 0.05) { const sw = Math.min(w / 2 - x, 0.3 + ctx.rnd() * 0.45); const two = ctx.rnd() < 0.35;
          if (two) { parts.push(P(BOX(sw - 0.04, H / 2 - 0.04, D + 0.04), tones[r % 5], x + sw / 2, H * 0.27, 0), P(BOX(sw - 0.04, H / 2 - 0.04, D + 0.04), tones[(r + 2) % 5], x + sw / 2, H * 0.73, 0)); }
          else parts.push(P(BOX(sw - 0.04, H - 0.06, D + 0.04), tones[r % 5], x + sw / 2, H / 2, 0)); x += sw; r++; }
      const m = kit.mesh(parts); kit.ink(m); return m; };
    const base = stone(W + 0.6); base.position.y = -H + 0.01; base.scale.y = 1; wall.add(base);
    const baseFoot = kit.mesh([P(BOX(W + 1.2, 0.3, D + 0.6), '#9a7a58', 0, -0.15, 0)]); wall.add(baseFoot);
    let course = 0, lives = LIVES, cx = 0, t = 0, ended = false, pend = null, perfect = 0, drops = 0;
    let mv = null, mx = 0, dir = 1; const fall = [];
    const SPEED = () => (easy ? 1.9 : 2.3) + course * (easy ? 0.12 : 0.2), SPAN = 2.4;
    const topY = () => course * H;
    const newStone = () => { mv = stone(W); wall.add(mv); dir = ctx.rnd() < 0.5 ? 1 : -1; mx = -dir * SPAN; mv.position.set(mx, topY() + 0.9, 0); };
    const st = () => ctx.status('🧱 ' + course + '/' + N + ' courses · ❤️ ' + lives);
    ctx.placeHero(2.6, 0, 3.4, -0.5);
    let camY = 0; const camSet = (snap) => ctx.cam(-1.4, camY + 3.0, -1.6, 0, camY + 0.7, WZ + 2, snap);
    camSet(true); newStone();
    return {
      start() { st(); ctx.msg('Set each stone on the course below', 'info', 1.6); },
      bot(lose) { if (!mv || pend || ended) return {}; const off = mx - cx; return { press: lose ? Math.abs(off) > TOL * 1.4 && Math.abs(off) < TOL * 1.8 : Math.abs(off) < W * 0.08 }; },
      action() { if (ended || pend || !mv) return; drops++;
        const off = mx - cx;
        if (Math.abs(off) <= TOL) {
          let x = mx; if (Math.abs(off) < W * 0.1) { x = cx; perfect++; ctx.msg('✨ Perfect fit!', 'good'); } else ctx.msg(['Set!', 'Nice!', 'Solid!', 'Good!'][course % 4], 'good', 0.8);
          mv.position.set(x, topY(), 0); cx = x; course++; mv = null;
          kit.puff(new THREE.Vector3(x, topY() + 0.05, WZ - D / 2), '#e8cfa0', 8, { spread: 0.8, up: 0.6 });
          st(); if (course >= N) { ended = true; pend = { t: 0.9, f: () => ctx.win('Your wall stands ' + N + ' courses high' + (perfect ? ', with ' + perfect + ' perfect fits' : '') + '. A great house rose this way, one course at a time.') }; return; }
          pend = { t: 0.35, f: newStone };
        } else {
          lives--; fall.push({ m: mv, vy: 1.5, vx: Math.sign(off) * 1.5, r: Math.sign(off) }); mv = null; ctx.msg('It tumbled off!', 'bad', 1.0); st();
          if (lives <= 0) { ended = true; pend = { t: 1.0, f: () => ctx.lose('Too many stones tumbled off. You built ' + course + ' of ' + N + ' courses.') }; return; }
          pend = { t: 0.8, f: newStone };
        }
      },
      update(dt, inp) {
        t += dt;
        for (let i = fall.length - 1; i >= 0; i--) { const f = fall[i]; f.vy -= 9 * dt; f.m.position.y += f.vy * dt; f.m.position.x += f.vx * dt; f.m.rotation.z -= f.r * dt * 2.5; f.m.position.z -= dt * 0.6;
          if (f.m.position.y < -0.2) { kit.puff(new THREE.Vector3(f.m.position.x, 0.2, WZ + f.m.position.z), '#d8b07a', 10, { spread: 1, up: 1 }); wall.remove(f.m); f.m.geometry.dispose(); fall.splice(i, 1); } }
        camY = lerp(camY, Math.max(0, topY() - 1.2), Math.min(1, dt * 3)); camSet(false);
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } return; }
        if (ended || !mv) return;
        mx += dir * SPEED() * dt; if (mx > SPAN) { mx = SPAN; dir = -1; } if (mx < -SPAN) { mx = -SPAN; dir = 1; }
        mv.position.set(mx, topY() + 0.04 + Math.abs(Math.sin(t * 3)) * 0.04, 0);
        ctx.placeHero(2.6, 0, 3.4, -0.5 + mx * 0.08);
      },
    };
  }
};
