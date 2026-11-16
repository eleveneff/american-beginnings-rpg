// Mini-game s6 · Franklin's Bucket Brigade. A line of neighbours passes leather buckets from the pump to a burning shed.
// Each bucket reaches her hands: press E as it arrives to pass it on. Twelve good passes put the fire out.
// History: Benjamin Franklin's fire-safety letter (1735: "An ounce of prevention is worth a pound of cure") and the Union
// Fire Company he founded in Philadelphia in 1736, volunteers who each kept leather fire buckets at home.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';

export default {
  title: "Franklin's Bucket Brigade", icon: '🪣', era: 'Philadelphia · 1736', act: 'Pass the bucket',
  intro: 'Fire! In <b>Philadelphia</b> most houses stood close together, and a fire could spread down a whole street. In <b>1736</b> Benjamin Franklin started the <b>Union Fire Company</b>: neighbours who promised to come running with their <b>leather buckets</b>.',
  how: 'Buckets come down the line from the pump. Press <kbd>E</kbd> just as a bucket reaches <b>your hands</b> (the needle in the green) to pass it on. <b>12 good passes</b> put the fire out. If a bucket goes by, it spills.',
  tryit: 'Press <kbd>E</kbd> when the needle is in the green — as the bucket reaches your hands.',
  hint: 'Watch the bucket in your neighbour\'s hands, not the fire. Press E when the needle reaches the green, not before. There is always time: the next bucket waits its turn.',
  fact: 'In 1735 Franklin wrote to his newspaper about fire safety: <b>"An ounce of prevention is worth a pound of cure."</b> Each Union Fire Company member kept leather buckets at home with his name painted on them. Volunteer fire companies spread across America, and many towns still have them today.',
  build(ctx) {
    const { kit, root, easy } = ctx, N = 12, MISS = easy ? 6 : 4, W = easy ? 0.5 : 0.36, HX = 0, LZ = 1.2;
    ctx.isolate();
    const g = [];
    // cobbled street, brick row houses with white trim behind, the pump on the left, the burning shed on the right
    g.push(P(BOX(90, 0.4, 70), '#8a8478', 0, -0.2, 8, 0, 0, 0, 1, 1, 1, 0.05));
    for (let r = 0; r < 9; r++) for (let c = 0; c < 34; c++) g.push(P(BOX(0.4, 0.05, 0.4), ['#9a9488', '#8a847a', '#a49e90', '#938c80'][(r * 7 + c * 3) % 4], -8.4 + c * 0.5 + (r % 2) * 0.25, 0.01, -2.4 + r * 0.5));
    g.push(P(BOX(30, 0.12, 1.4), '#a0503a', 0, 0.05, 4.3), P(BOX(30, 0.16, 0.12), '#c8c0b0', 0, 0.08, 3.6));
    for (let i = -4; i <= 4; i++) { const x = i * 3.2, h = 5 + (i % 2 ? 0.8 : 0), c = ['#a0442e', '#8e3a28', '#b0503a'][(i + 9) % 3];
      g.push(P(BOX(3.1, h, 3), c, x, h / 2, 6.5), P(BOX(3.2, 0.25, 3.1), '#f0ece0', x, h, 6.5), P(BOX(3.1, 1.2, 3), '#5a4a44', x, h + 0.6, 6.8, -0.5));
      for (const wx of [-0.8, 0.8]) for (const wy of [1.6, 3.4]) g.push(P(BOX(0.6, 0.9, 0.05), '#2a3a4a', x + wx, wy, 4.98), P(BOX(0.7, 0.08, 0.06), '#f0ece0', x + wx, wy - 0.5, 4.97));
      g.push(P(BOX(0.7, 1.4, 0.05), '#3a2a1e', x, 0.7, 4.98), P(BOX(0.9, 0.1, 0.4), '#d8d0c0', x, 0.05, 4.8)); }
    // pump (left = local +x) and a water trough
    g.push(P(CYL(0.2, 0.22, 1.6, 8), '#5a4a3a', 5.3, 0.8, LZ + 0.3), P(BOX(0.6, 0.08, 0.08), '#3a2a1a', 5.55, 1.45, LZ + 0.3, 0, 0, 0.4), P(BOX(1.4, 0.4, 0.6), '#6b4a2a', 5.1, 0.2, LZ - 0.5), P(BOX(1.3, 0.05, 0.5), '#4a7a9a', 5.1, 0.41, LZ - 0.5));
    // the burning shed (right = local −x)
    g.push(P(BOX(3, 2.2, 2.6), '#6a4a30', -6.1, 1.1, LZ + 1.6), P(CONE(2.3, 1.2, 4), '#4a3a2a', -6.1, 2.8, LZ + 1.6, 0, Math.PI / 4), P(BOX(0.8, 1.4, 0.05), '#1a120a', -5.3, 0.7, LZ + 0.29), P(BOX(1.2, 0.05, 0.05), '#2a1a0a', -6.3, 1.4, LZ + 0.28));
    root.add(kit.mesh(g, { cast: false, recv: true }));
    // flames: a few cones that flicker; their scale follows the fire's strength
    const fire = new THREE.Group(); fire.position.set(-5.9, 0, LZ + 0.2); root.add(fire);
    const flames = []; for (let i = 0; i < 9; i++) { const c = ['#ff7a1a', '#ffb02a', '#ff4a1a'][i % 3]; const m = new THREE.Mesh(new THREE.ConeGeometry(0.35 + (i % 3) * 0.1, 1.4, 6), kit.basic({ color: c, transparent: true, opacity: 0.9 }));
      m.position.set(-1.2 + (i % 5) * 0.6, i > 4 ? 3.2 : 0.75 + (i % 2) * 0.5, i > 4 ? 1.3 : -0.1 - (i % 2) * 0.2); m.userData.ph = i * 1.7; fire.add(m); flames.push(m); }
    const glowL = new THREE.PointLight('#ff8a3a', 2.2, 9); glowL.position.set(-5.0, 2, LZ); root.add(glowL);
    // the line of neighbours (she stands in the middle), each holding out their hands
    const LINE = [4.0, 3.0, 2.0, 1.0, -1.0, -2.0, -3.0, -4.0];
    const folk = LINE.map((x, i) => { const p = person(kit, { coat: ['#2f4a7a', '#6a3a2a', '#4a5a3a', '#7a6a4a', '#3a3a4a', '#8a4a3a', '#5a4a6a', '#3a5a5a'][i], pants: '#3a3028', hat: i % 3 === 0 ? 'tricorn' : i % 3 === 1 ? 'cap' : null, dress: i % 3 === 1, skin: '#e2b48c' });
      p.position.set(x, 0, LZ + (i % 2) * 0.15); p.rotation.y = Math.PI; root.add(p); return p; });
    ctx.placeHero(HX, 0, LZ, Math.PI);
    const camSet = snap => { const port = ctx.portrait(); ctx.cam(port ? 0.5 : 0.2, port ? 5.6 : 2.9, LZ - (port ? 11.2 : 6.8), port ? -2.0 : -0.7, port ? 1.15 : 0.9, LZ + 1.1, snap); };
    camSet(true);
    // leather buckets: black, with a painted name band
    const mkB = () => { const m = kit.mesh([P(CYL(0.17, 0.13, 0.32, 10), '#2a1a12', 0, 0, 0), P(CYL(0.175, 0.175, 0.07, 10), '#c8a040', 0, 0.06, 0), P(BOX(0.36, 0.02, 0.02), '#1a120a', 0, 0.24, 0), P(CYL(0.15, 0.15, 0.01, 10), '#4a7aa8', 0, 0.15, 0)]); kit.ink(m); root.add(m); return m; };
    const bk = []; let done = 0, miss = 0, t = 0, spawnT = 0.6, ended = false, pend = null, cool = 0, str = 1;
    const SPD = () => (easy ? 1.6 : 1.9) + done * (easy ? 0.04 : 0.07);
    const st = () => ctx.status('🪣 ' + done + '/' + N + ' passes · 💧 ' + miss + '/' + MISS + ' spilled');
    const handY = x => 0.68 + Math.abs(Math.sin(x * Math.PI)) * 0.25;
    const end = (win) => { ended = true; for (const b of bk) b.m.visible = false; pend = { t: 1.1, f: () => win ? ctx.win('Twelve buckets, passed hand to hand, and the fire is out. The houses next door are safe!') : ctx.lose('Too many buckets spilled. The neighbours will keep the fire from spreading; try again!') }; };
    return {
      start() { st(); ctx.actLabel('Pass the bucket'); ctx.prompt('Press E to pass the bucket when it reaches your hands (the needle in the green).', 3.0); ctx.msg('Here come the buckets!', 'info', 1.4); },
      bot(lose) { if (pend || ended || lose || cool > 0) return {}; return { press: bk.some(b => b.s === 'in' && Math.abs(b.x - HX) < W * 0.7) }; },
      action() { if (ended || pend || cool > 0 || done >= N) return;
        const b = bk.filter(b => b.s === 'in').sort((a, c) => Math.abs(a.x - HX) - Math.abs(c.x - HX))[0];
        if (b && Math.abs(b.x - HX) <= W) { b.s = 'out'; done++; ctx.msg(Math.abs(b.x - HX) < W * 0.35 ? '✨ Perfect pass!' : ['Passed!', 'Good!', 'Got it!'][done % 3], 'good', 0.7); ctx.flash('good'); ctx.sfx('hit'); st(); }
        else { cool = 0.45; ctx.msg(b && b.x > HX ? 'Too early! Wait for it.' : 'No bucket here yet', 'info', 0.7); } },
      update(dt, inp) {
        t += dt; cool -= dt;
        // fire strength: down with every bucket thrown, a little up with every spill
        const target = ended && done >= N ? 0 : Math.max(0.15, 1 - done / N * 0.85 + miss * 0.05); str = lerp(str, target, Math.min(1, dt * 2));
        flames.forEach((m, i) => { const k = str * (0.8 + 0.25 * Math.sin(t * 9 + m.userData.ph)); m.scale.set(k, k * (1 + 0.15 * Math.sin(t * 13 + i)), k); m.visible = k > 0.05; });
        glowL.intensity = 2.2 * str * (0.85 + 0.15 * Math.sin(t * 11));
        if (str > 0.1 && ctx.rnd() < dt * 6) kit.puff(new THREE.Vector3(-6.1 + (ctx.rnd() - 0.5) * 2, 2.4 + str, LZ + 1.4), '#6a6a6a', 1, { spread: 0.3, up: 1.4, life: 1.6, size: 0.8, grav: -0.3 });
        if (str > 0.15 && ctx.rnd() < dt * 0.7) ctx.sfx('fire');
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } }
        if (!ended) { spawnT -= dt; const inFlight = bk.filter(b => b.s === 'in').length;
          const outF = bk.filter(b => b.s === 'out').length; if (spawnT <= 0 && inFlight < 2 && done + inFlight < N) { bk.push({ m: mkB(), x: 4.6, s: 'in' }); spawnT = (easy ? 1.6 : 1.25) + ctx.rnd() * 0.9 - Math.min(0.35, done * 0.03); } }
        for (let i = bk.length - 1; i >= 0; i--) { const b = bk[i];
          if (b.s === 'in') { b.x -= SPD() * dt; if (b.x < HX - W) { b.s = 'spill'; b.vy = 0; kit.puff(new THREE.Vector3(b.x, 0.2, LZ - 0.3), '#8ab8e0', 10, { spread: 0.5, up: 0.8 }); if (ctx.grace('Spilled! Watch the green — this first spill does not count.')) { st(); } else { miss++; ctx.msg('Spilled! 💦', 'bad', 0.9); ctx.flash('bad'); ctx.sfx('splash'); st(); if (miss >= MISS && !ended) end(false); } } }
          else if (b.s === 'out') { b.x -= SPD() * 1.4 * dt; if (b.x < -4.4) { b.s = 'throw'; b.tt = 0; } }
          if (b.s === 'throw') { b.tt += dt; b.x -= dt * 2; b.m.position.set(b.x, 1.3 + b.tt * 1.5, LZ - 0.2 + b.tt); b.m.rotation.z = b.tt * 4;
            if (b.tt > 0.4) { kit.puff(new THREE.Vector3(-5.7, 1.6, LZ + 1.0), '#c8e0f0', 14, { spread: 0.8, up: 1.0 }); root.remove(b.m); bk.splice(i, 1); if (done >= N && !ended && !bk.some(q => q.s !== 'spill')) end(true); } continue; }
          if (b.s === 'spill') { b.vy -= 9 * dt; const y = Math.max(0.16, b.m.position.y + b.vy * dt); b.m.position.set(b.x, y, LZ - 0.3); b.m.rotation.z = Math.min(1.5, (b.m.rotation.z || 0) + dt * 6); b.tt = (b.tt || 0) + dt; if (b.tt > 1.2) { root.remove(b.m); bk.splice(i, 1); } continue; }
          b.m.position.set(b.x, handY(b.x), LZ - 0.35); b.m.rotation.z = Math.sin(b.x * 3) * 0.1; }
        if (done >= N && !ended && !bk.some(q => q.s === 'out' || q.s === 'throw')) end(true);
        // the neighbours swing their arms as a bucket goes by; she reaches out when one is close
        folk.forEach((p, i) => { const near = bk.some(b => b.s !== 'spill' && Math.abs(b.x - LINE[i]) < 0.6); const a = near ? -1.2 : -0.4; p.userData.armL.rotation.x = lerp(p.userData.armL.rotation.x, a, dt * 10); p.userData.armR.rotation.x = lerp(p.userData.armR.rotation.x, a, dt * 10); });
        const inc = bk.filter(b => b.s === 'in').sort((a, c) => a.x - c.x)[0];
        if (inc && !ended) ctx.meter(clamp(0.5 - (inc.x - HX) / 3.2, 0, 1), { zone: [0.5 - W / 3.2, 0.5 + W / 3.2], label: '🪣 Catch it in the green' }); else ctx.meter(null);
      },
    };
  }
};
