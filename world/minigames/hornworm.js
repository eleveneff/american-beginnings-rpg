// Mini-game s5 · Hornworm Patrol. Nine tobacco plants; fat green hornworms crawl onto the leaves. Walk between the plants
// (W/Z/A/S) and press E to pick the worm off before it chews the leaf. Pick 12 worms. History: John Rolfe's tobacco (1612),
// Virginia's cash crop, and the hard hand labour behind it: indentured servants and, from 1619, enslaved Africans.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';

export default {
  title: 'Hornworm Patrol', icon: '🐛', era: 'Virginia tobacco fields · about 1620', act: 'Pick',
  intro: 'In <b>1612</b> John Rolfe grew a sweeter kind of <b>tobacco</b> in Virginia, from seeds brought from the Caribbean. People in England paid well for it, and tobacco became the crop that kept the colony alive. But fat green <b>hornworms</b> love tobacco leaves.',
  how: 'Walk from plant to plant with <kbd>W</kbd> <kbd>Z</kbd> <kbd>A</kbd> <kbd>S</kbd> (or the arrows). When you reach a plant with a worm, press <kbd>E</kbd> to pick it off. Pick <b>12 worms</b> before the worms ruin too many leaves.',
  tryit: 'Walk with <kbd>W</kbd> <kbd>Z</kbd> <kbd>A</kbd> <kbd>S</kbd> to a worm, then press <kbd>E</kbd> to pick it off.',
  hint: 'Go for the worm that has been there longest first: its plant starts to turn brown. Don\'t wait at one plant; keep moving toward the next worm.',
  fact: 'Tobacco made Virginia rich, but it took endless hand work: planting, picking worms, cutting and drying. Much of it was done by <b>indentured servants</b> from England, and starting in <b>1619</b> by Africans who had been captured and <b>enslaved</b>. That same year Virginia also held the first <b>elected assembly</b> in English America.',
  build(ctx) {
    const { kit, root, easy } = ctx, N = 12, RUIN = easy ? 6 : 4, LIFE = easy ? 7 : 5, GAP = 1.7, Z0 = 2.4;
    ctx.isolate();
    const g = [];
    // field, rows of tobacco beyond, a split-rail fence, a tobacco barn with leaves hanging, woods
    g.push(P(BOX(90, 0.4, 70), '#7a8a48', 0, -0.2, 8, 0, 0, 0, 1, 1, 1, 0.05), P(BOX(9, 0.06, 7.4), '#8a6a44', 0, 0.01, Z0 + GAP));
    const leafy = (x, z, s, a) => { g.push(P(CYL(0.04, 0.05, 1.0 * s, 5), '#6a8a3a', x, 0.5 * s, z)); for (let k = 0; k < 5; k++) { const ang = a + k * 1.26; g.push(P(SPH(0.32 * s, 7, 4), ['#4f8a34', '#5a9a3a', '#47803a'][k % 3], x + Math.cos(ang) * 0.26 * s, (0.25 + k * 0.14) * s, z + Math.sin(ang) * 0.26 * s, 0, -ang, 0.4, 1.4, 0.18, 0.7)); } g.push(P(SPH(0.07 * s, 5, 4), '#e890a8', x, 1.05 * s, z)); };
    for (let r = 0; r < 5; r++) for (let c = -9; c <= 9; c++) { const x = c * 1.3, z = Z0 + 4.6 + r * 1.3; if (ctx.rnd() < 0.1) continue; leafy(x + (ctx.rnd() - 0.5) * 0.3, z, 0.8 + ctx.rnd() * 0.25, ctx.rnd() * 6); }
    for (let r = 0; r < 4; r++) for (const s of [-1, 1]) for (let c = 0; c < 4; c++) leafy(s * (4.6 + c * 1.3), Z0 + r * 1.3, 0.85, ctx.rnd() * 6);
    for (let i = -10; i <= 10; i++) { g.push(P(BOX(0.12, 0.9, 0.12), '#7a5a3a', i * 2.2, 0.45, -1.6)); g.push(P(BOX(2.3, 0.08, 0.06), '#8a6a44', i * 2.2 + 1.1, 0.7, -1.6, 0, 0.12 * (i % 2 ? 1 : -1)), P(BOX(2.3, 0.08, 0.06), '#8a6a44', i * 2.2 + 1.1, 0.35, -1.6, 0, -0.1 * (i % 2 ? 1 : -1))); }
    g.push(P(BOX(5, 2.6, 3.4), '#7a5a3a', -9.5, 1.3, 16), P(CYL(0.1, 2.75, 5.4, 4, 1), '#5a4430', -9.5, 3.0, 16, 0, Math.PI / 4, Math.PI / 2, 1, 1, 0.62));
    for (let i = 0; i < 7; i++) g.push(P(BOX(0.25, 0.7, 0.04), '#a88a3a', -11.4 + i * 0.6, 1.9, 14.25));
    for (let i = 0; i < 26; i++) { const x = -32 + i * 2.6 + (ctx.rnd() - 0.5), z = 24 + ctx.rnd() * 4, h = 4 + ctx.rnd() * 3; g.push(P(CYL(0.15, 0.2, h, 5), '#5a3e26', x, h / 2, z), P(SPH(1.6, 7, 5), ['#3a6a30', '#4a7a36', '#2f5a2a'][i % 3], x, h + 0.4, z)); }
    root.add(kit.mesh(g, { cast: false, recv: true }));
    // two other workers down the rows (servants in work clothes), bent over the plants
    const crew = [];
    for (const [x, z, c] of [[6.2, Z0 + 5.2, '#8a7a5a'], [-6.8, Z0 + 3.4, '#6a5a44']]) { const p = person(kit, { coat: c, pants: '#5a4a34', hat: 'brim', skin: x > 0 ? '#e2b48c' : '#7a4a2a' }); p.position.set(x, 0, z); p.rotation.y = Math.PI + (x > 0 ? 0.4 : -0.4); root.add(p); crew.push(p); }
    // the nine plants she tends: each has its own leaf material so chewed plants turn brown
    const plants = [];
    for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) {
      const x = -c * GAP, z = Z0 + r * GAP, pg = [], a = ctx.rnd() * 6;
      pg.push(P(CYL(0.05, 0.06, 1.2, 5), '#6a8a3a', 0, 0.6, 0));
      for (let k = 0; k < 6; k++) { const ang = a + k * 1.05; pg.push(P(SPH(0.4, 8, 4), k % 2 ? '#5aa03c' : '#4f9036', Math.cos(ang) * 0.33, 0.25 + k * 0.15, Math.sin(ang) * 0.33, 0, -ang, 0.4, 1.5, 0.18, 0.75)); }
      pg.push(P(SPH(0.09, 6, 4), '#f0a0b8', 0, 1.25, 0), P(SPH(0.07, 6, 4), '#f0a0b8', 0.08, 1.2, 0.05));
      const mat = kit.mat({ vertexColors: true }); const m = kit.mesh(pg, { mat }); kit.ink(m); m.position.set(x, 0, z); root.add(m);
      // the worm: fat green segments, white side stripes, a red horn at the tail
      const wg = []; for (let s = 0; s < 6; s++) wg.push(P(SPH(0.075 - Math.abs(s - 2) * 0.006, 7, 5), s % 2 ? '#7ac04a' : '#88cc55', 0, 0, s * 0.1 - 0.25, 0, 0, 0, 1, 0.95, 1.1), P(BOX(0.01, 0.05, 0.03), '#f4f4e0', 0.07, 0, s * 0.1 - 0.25, 0, 0, 0.3));
      wg.push(P(CONE(0.02, 0.12, 5), '#c83a2a', 0, 0.09, 0.28, -0.5), P(SPH(0.07, 6, 4), '#5a8a2a', 0, 0.01, -0.33));
      const worm = kit.mesh(wg); kit.ink(worm); worm.visible = false; root.add(worm);
      const fm = kit.basic({ color: '#ffd23a' }); const flag = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.44, 8), fm); flag.rotation.x = Math.PI; flag.position.set(x, 1.85, z); flag.visible = false; root.add(flag);
      plants.push({ x, z, r, c: c + 1, m, mat, worm, flag, fm, t: -1, dmg: 0, ang: a });
    }
    const sel = kit.mesh([P(CYL(0.62, 0.62, 0.03, 18), '#ffe066', 0, 0.03, 0)]); root.add(sel);
    let picked = 0, ruined = 0, t = 0, cr = 0, cc = 1, hx = 0, hz = Z0 - 0.6, ended = false, pend = null, spawnT = 1.2, rep = 0, lastDir = '';
    const cur = () => plants[cr * 3 + cc];
    const st = () => ctx.status('🐛 ' + picked + '/' + N + ' picked · 🍂 ' + ruined + '/' + RUIN + ' leaves ruined');
    ctx.cam(0.7, 5.6, Z0 - 3.6, 0, 0.2, Z0 + GAP * 1.15, true);
    const spawn = () => { const free = plants.filter(p => p.t < 0); if (!free.length) return; const live = plants.length - free.length; if (live >= (easy ? 2 : 3)) return;
      const p = free[Math.floor(ctx.rnd() * free.length)]; p.t = 0; p.worm.visible = true; };
    const wormAt = p => { const ang = p.ang + 1.05 * 3, k = Math.min(1, p.t / LIFE); p.worm.position.set(p.x + Math.cos(ang) * 0.42, 0.9, p.z + Math.sin(ang) * 0.42); p.worm.rotation.set(0, -ang + Math.PI / 2 + Math.sin(t * 4) * 0.15, 0); p.worm.scale.setScalar(1.6 + k * 0.5); p.flag.visible = true; p.flag.position.y = 1.85 + Math.abs(Math.sin(t * 5)) * 0.15; p.flag.rotation.y = t * 3; p.fm.color.setRGB(1, 0.82 - k * 0.6, 0.23 - k * 0.2); };
    const tint = p => { const k = Math.min(1, p.dmg * 0.34 + (p.t > 0 ? p.t / LIFE * 0.4 : 0)); p.mat.color.setRGB(1 - k * 0.1, 1 - k * 0.35, 1 - k * 0.75); };
    return {
      start() { st(); ctx.msg('Pick the hornworms!', 'info', 1.4); },
      bot(lose) { if (pend || ended) return {}; const live = plants.filter(p => p.t >= 0); if (lose || !live.length) return {};
        const p = live.sort((a, b) => b.t - a.t)[0]; const dc = p.c - cc, dr = p.r - cr;
        if (!dc && !dr) return { press: Math.hypot(hx - p.x, hz - (p.z - 0.6)) < 0.5 };
        return Math.abs(dc) >= Math.abs(dr) ? { x: Math.sign(dc) } : { y: Math.sign(dr) }; },
      action() { if (ended || pend) return; const p = cur();
        if (Math.hypot(hx - p.x, hz - (p.z - 0.6)) > 0.7) return;
        if (p.t < 0) { ctx.msg('No worm on this plant', 'info', 0.7); return; }
        p.t = -1; p.worm.visible = false; p.flag.visible = false; picked++; tint(p);
        kit.puff(new THREE.Vector3(p.x, 0.9, p.z), '#9ad860', 6, { spread: 0.3, up: 0.8 }); ctx.msg(['Got it!', 'Plucked!', 'Off you go!', 'Nice catch!'][picked % 4], 'good', 0.7); ctx.flash('good'); ctx.sfx('hit'); st();
        if (picked >= N) { ended = true; pend = { t: 1.0, f: () => ctx.win('You picked ' + N + ' hornworms' + (ruined ? ' and lost only ' + ruined + ' leaves' : ' and saved every leaf') + '. The crop is safe for now.') }; } },
      update(dt, inp) {
        t += dt;
        for (const p of crew) { p.userData.armL.rotation.x = -1.1 + Math.sin(t * 2.4 + p.position.x) * 0.3; p.userData.armR.rotation.x = -1.1 + Math.cos(t * 2.1 + p.position.x) * 0.3; }
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } }
        // grid moves: one step per tap, repeating while held (screen-right = local −x, so +x input → next column)
        const dir = Math.abs(inp.x) > 0.5 ? (inp.x > 0 ? 'r' : 'l') : Math.abs(inp.y) > 0.5 ? (inp.y > 0 ? 'f' : 'b') : '';
        rep -= dt; if (dir && !ended && (dir !== lastDir || rep <= 0)) { rep = 0.32;
          if (dir === 'r') cc = Math.min(2, cc + 1); if (dir === 'l') cc = Math.max(0, cc - 1); if (dir === 'f') cr = Math.min(2, cr + 1); if (dir === 'b') cr = Math.max(0, cr - 1); }
        lastDir = dir;
        const p = cur(), tx = p.x, tz = p.z - 0.6, d = Math.hypot(tx - hx, tz - hz), sp = Math.min(d, dt * 5.5);
        if (d > 1e-3) { hx += (tx - hx) / d * sp; hz += (tz - hz) / d * sp; }
        ctx.placeHero(hx, 0, hz, d > 0.05 ? Math.atan2(tx - hx, tz - hz) : 0, d > 0.05 ? 2.5 : 0);
        sel.position.set(p.x, 0, p.z); sel.scale.setScalar(1 + Math.sin(t * 6) * 0.05);
        // worms grow and chew
        if (!ended) { spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = (easy ? 2.0 : 1.6) - Math.min(0.5, picked * 0.04); }
          for (const q of plants) { if (q.t < 0) continue; q.t += dt; wormAt(q); tint(q);
            if (q.t >= LIFE) { q.t = -1; q.worm.visible = false; q.flag.visible = false; q.dmg++; ruined++; tint(q); kit.puff(new THREE.Vector3(q.x, 0.8, q.z), '#8a7a3a', 8, { spread: 0.4, up: 0.5 }); ctx.msg('A leaf got chewed up!', 'bad', 1.0); ctx.flash('bad'); ctx.sfx('miss'); st();
              if (ruined >= RUIN) { ended = true; for (const w of plants) w.worm.visible = w.flag.visible = false; pend = { t: 1.1, f: () => ctx.lose('The worms chewed ' + ruined + ' leaves. You picked ' + picked + ' of ' + N + '.') }; break; } } } }
        const near = plants.filter(q => q.t >= 0).sort((a, b) => b.t - a.t)[0];
        if (near && !ended) ctx.meter(1 - near.t / LIFE, { fill: true, label: '🐛 Hungriest worm' }); else ctx.meter(null);
      },
    };
  }
};
