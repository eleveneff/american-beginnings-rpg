// Mini-game s8 · The Boston Tea Party, 16 December 1773. On the deck of the Dartmouth at Griffin's
// Wharf, hoist tea chests and dump them into the harbor. History: three ships (Dartmouth, Eleanor,
// Beaver), 342 chests, Sons of Liberty in a rough disguise; they were careful to break nothing else.
// A protest of principle — no taxation without representation — not a riot. Some, including Franklin,
// thought the tea should be paid for; Britain was furious.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';

export default {
  title: 'The Boston Tea Party', icon: '🫖', era: "Griffin's Wharf, Boston · 16 December 1773", act: 'Dump the tea chest',
  intro: 'Three tea ships, the <b>Dartmouth</b>, <b>Eleanor</b>, and <b>Beaver</b>, sit at <b>Griffin’s Wharf</b>. Tonight about a hundred men, many of them Sons of Liberty, board the ships and dump <b>342 chests of tea</b> into the harbor. They are careful to break nothing else.',
  how: 'Chests come up from the hold. Press <kbd>E</kbd> when a chest reaches <b>your hands</b> (the needle in the green) to dump it over the rail. Dump <b>10 chests</b>. If a chest is dropped on the deck, it counts as a miss — they broke nothing but the tea.',
  tryit: 'Watch the chest coming from the hatch. Press <kbd>E</kbd> when the needle is in the green — to dump the tea chest over the rail.',
  hint: 'Watch the chest, not the other ships. Press E when the needle reaches the green, not before. The first chest comes more slowly on purpose.',
  fact: 'On the night of <b>16 December 1773</b>, after a meeting at the <b>Old South Meeting House</b>, the men dumped <b>342 chests</b> from the <b>Dartmouth</b>, <b>Eleanor</b>, and <b>Beaver</b>. They wore a <b>rough disguise</b> (blankets and soot), not a full Mohawk costume, and they damaged nothing but the tea. Many colonists cheered. Others, even patriots like <b>Benjamin Franklin</b>, thought the tea should be paid for. Britain answered with the Coercive Acts. The protest was about a principle: <b>no taxation without representation</b>.',
  build(ctx) {
    const { kit, root, easy } = ctx, N = 10, MISS = easy ? 6 : 4, HX = 0, LZ = 0.6, W0 = easy ? 0.55 : 0.42, W = easy ? 0.42 : 0.32;
    ctx.isolate([], ['sky', 'sea', 'sea-floor']);
    const g = [];
    // night harbor: bright water slightly above a dark bank / wharf lip
    g.push(P(SPH(80, 16, 10), '#0b1830', 0, 18, 8, 0, 0, 0, 1, 0.65, 1));
    g.push(P(BOX(90, 0.4, 70), '#1a2830', 0, -0.5, 4));
    g.push(P(BOX(80, 0.08, 50), '#2a8ab0', 0, 0.02, 8)); // bright water
    // Griffin's Wharf (solid, grounded)
    g.push(P(BOX(14, 0.35, 8), '#6b5340', 0, 0.28, -4.2));
    for (let i = -5; i <= 5; i++) g.push(P(CYL(0.12, 0.12, 1.4, 6), '#4a3a28', i * 1.2, -0.3, -1.2));
    // solid post sign on the wharf (not a billboard)
    g.push(P(CYL(0.07, 0.07, 2.2, 6), '#4a3a28', 4.6, 1.2, -3.6), P(BOX(1.8, 0.8, 0.1), '#c8b48a', 4.6, 2.2, -3.6), P(BOX(1.5, 0.12, 0.04), '#3a2a18', 4.6, 2.28, -3.5), P(BOX(1.2, 0.08, 0.04), '#5a3a22', 4.6, 2.08, -3.5));
    // Dartmouth deck underfoot (player ship): a small nao-like hull, slightly oversized chests, deck roomy
    g.push(P(BOX(7.2, 0.28, 12), '#6b4a2e', 0, 0.55, 1.6)); // deck
    g.push(P(BOX(7.4, 1.2, 0.3), '#5a3a22', 0, 1.1, 7.4)); // stern
    g.push(P(BOX(0.8, 1.1, 0.3), '#5a3a22', -3.5, 1.05, 1.6), P(BOX(0.8, 1.1, 0.3), '#5a3a22', 3.5, 1.05, 1.6)); // rails
    g.push(P(CYL(0.16, 0.18, 7, 8), '#4a3a28', 0, 4.1, 3.2)); // mast
    g.push(P(BOX(0.08, 3.2, 2.4), '#e8e0d0', 0.1, 5.2, 3.2)); // furled-ish sail hanging
    // hatch
    g.push(P(BOX(1.6, 0.08, 1.4), '#3a2a1a', 0, 0.72, 4.4));
    // Union flag of 1707 (no St Patrick saltire)
    g.push(P(BOX(1.1, 0.7, 0.04), '#1f3a7a', 0.6, 7.3, 3.2), P(BOX(1.1, 0.14, 0.05), '#f4f1e6', 0.6, 7.3, 3.2), P(BOX(0.14, 0.7, 0.05), '#f4f1e6', 0.6, 7.3, 3.2), P(BOX(1.1, 0.08, 0.06), '#c0302a', 0.6, 7.3, 3.2), P(BOX(0.08, 0.7, 0.06), '#c0302a', 0.6, 7.3, 3.2));
    // two other ships (Eleanor, Beaver): smaller, distinct, at anchor with furled sails
    const ship = (x, z, hull) => {
      g.push(P(BOX(3.4, 0.7, 6.2), hull, x, 0.5, z), P(BOX(3.6, 0.9, 0.3), '#4a3220', x, 1.1, z + 2.9), P(CYL(0.1, 0.1, 4.4, 6), '#4a3a28', x, 2.8, z), P(BOX(0.06, 1.8, 1.5), '#d8d0c0', x + 0.08, 3.4, z));
    };
    ship(-9.5, 3.5, '#5a3a28'); ship(9.2, 5.0, '#6a4630');
    // lanterns
    g.push(P(CYL(0.08, 0.08, 0.5, 6), '#3a2a1a', 2.4, 1.5, -0.4), P(SPH(0.16, 8, 6), '#ffc878', 2.4, 1.85, -0.4));
    root.add(kit.mesh(g, { cast: false, recv: true }));
    const glow = new THREE.PointLight('#ffb060', 1.4, 10); glow.position.set(2.4, 2.2, -0.2); root.add(glow);
    // Sons of Liberty in blankets and caps (rough disguise — not a feathered costume)
    const folk = [-2.4, 2.4, -3.2, 3.2].map((x, i) => {
      const p = person(kit, { coat: ['#4a3a2a', '#3a3a32', '#5a4a38', '#2a2a28'][i], pants: '#2a2018', hat: i % 2 ? 'cap' : 'brim', skin: ['#c8946a', '#8a5a3a', '#e0b48c', '#6a4a32'][i] });
      p.position.set(x, 0.7, LZ + (i < 2 ? 1.8 : -1.4)); p.rotation.y = i < 2 ? Math.PI : 0; root.add(p); return p;
    });
    ctx.placeHero(HX, 0.7, LZ, Math.PI);
    const camSet = snap => { const port = ctx.portrait(); ctx.cam(port ? 0.6 : 0.3, port ? 5.8 : 3.2, LZ - (port ? 9.5 : 6.2), 0, 1.1, LZ + 1.4, snap); };
    camSet(true);
    const mkC = () => { const m = kit.mesh([P(BOX(0.7, 0.42, 0.5), '#7a5230', 0, 0, 0), P(BOX(0.72, 0.06, 0.52), '#5a3a1e', 0, 0.22, 0), P(BOX(0.3, 0.08, 0.08), '#c8a040', 0, 0.05, 0.26)]); kit.ink(m); root.add(m); return m; };
    const bk = []; let done = 0, miss = 0, t = 0, spawnT = 0.7, ended = false, pend = null, cool = 0, wave = 0, first = true;
    const winW = () => (first ? W0 : W);
    const SPD = () => ((easy ? 1.5 : 1.85) + done * (easy ? 0.04 : 0.07)) * (first ? 0.82 : 1);
    const st = () => ctx.status('🫖 ' + done + '/' + N + ' chests · 💥 ' + miss + '/' + MISS + ' dropped');
    const end = (win) => { ended = true; for (const b of bk) b.m.visible = false; pend = { t: 1.1, f: () => win ? ctx.win('Ten chests over the rail — and nothing else broken. Across the harbor, 342 chests from three ships will go into the water tonight.') : ctx.lose('Too many chests broke on the deck. The Sons of Liberty were careful to damage only the tea. Try again!') }; };
    return {
      start() { st(); ctx.msg('Here come the chests from the hold!', 'info', 1.5); ctx.actLabel('Dump the tea chest'); },
      bot(lose) { if (pend || ended || lose || cool > 0) return {}; return { press: bk.some(b => b.s === 'in' && Math.abs(b.x - HX) < winW() * 0.7) }; },
      action() {
        if (ended || pend || cool > 0 || done >= N) return;
        const b = bk.filter(b => b.s === 'in').sort((a, c) => Math.abs(a.x - HX) - Math.abs(c.x - HX))[0];
        if (b && Math.abs(b.x - HX) <= winW()) {
          b.s = 'out'; done++; first = false; wave = 0.8;
          ctx.msg(Math.abs(b.x - HX) < winW() * 0.35 ? '✨ Over the rail!' : ['Dumped!', 'Into the harbor!', 'That’s the tea!'][done % 3], 'good', 0.7);
          ctx.flash('good'); ctx.sfx('splash'); st();
        } else { cool = 0.45; ctx.msg(b && b.x > HX ? 'Too early! Wait for the chest.' : 'No chest here yet', 'info', 0.7); }
      },
      update(dt, inp) {
        t += dt; cool -= dt; wave = Math.max(0, wave - dt);
        folk.forEach((p, i) => { if (p.userData.armR) p.userData.armR.rotation.x = lerp(p.userData.armR.rotation.x, wave > 0 ? -2.0 : -0.4, dt * 10); });
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } }
        if (!ended) { spawnT -= dt; const inFlight = bk.filter(b => b.s === 'in').length;
          if (spawnT <= 0 && inFlight < 2 && done + inFlight < N) { bk.push({ m: mkC(), x: 3.6, s: 'in' }); spawnT = (easy ? 1.55 : 1.2) + ctx.rnd() * 0.8 - Math.min(0.3, done * 0.03); } }
        for (let i = bk.length - 1; i >= 0; i--) {
          const b = bk[i];
          if (b.s === 'in') {
            b.x -= SPD() * dt;
            if (b.x < HX - winW()) {
              b.s = 'spill'; b.vy = 0;
              kit.puff(new THREE.Vector3(b.x, 0.9, LZ - 0.2), '#7a5230', 10, { spread: 0.5, up: 0.8 });
              if (ctx.grace('The chest hit the deck! This first drop does not count — wait for the green.')) { first = false; st(); }
              else { miss++; ctx.msg('Dropped on the deck!', 'bad', 0.9); ctx.flash('bad'); ctx.sfx('thunk'); st(); if (miss >= MISS && !ended) end(false); }
            }
          } else if (b.s === 'out') { b.x -= SPD() * 1.3 * dt; if (b.x < -2.6) { b.s = 'throw'; b.tt = 0; } }
          if (b.s === 'throw') {
            b.tt += dt; b.m.position.set(b.x - b.tt * 1.4, 1.4 + b.tt * 1.2, LZ + 0.6 + b.tt); b.m.rotation.z = b.tt * 5;
            if (b.tt > 0.45) { kit.puff(new THREE.Vector3(-3.2, 0.4, 1.2), '#8fd4e8', 14, { spread: 0.8, up: 1.0 }); root.remove(b.m); bk.splice(i, 1); if (done >= N && !ended && !bk.some(q => q.s !== 'spill')) end(true); }
            continue;
          }
          if (b.s === 'spill') { b.vy -= 9 * dt; b.m.position.set(b.x, Math.max(0.85, (b.m.position.y || 1.1) + b.vy * dt), LZ - 0.2); b.m.rotation.z = Math.min(1.4, (b.m.rotation.z || 0) + dt * 6); b.tt = (b.tt || 0) + dt; if (b.tt > 1.1) { root.remove(b.m); bk.splice(i, 1); } continue; }
          b.m.position.set(b.x, 1.15, LZ - 0.15);
        }
        if (done >= N && !ended && !bk.some(q => q.s === 'out' || q.s === 'throw')) end(true);
        const inc = bk.filter(b => b.s === 'in').sort((a, c) => a.x - c.x)[0];
        const w = winW();
        if (inc && !ended) ctx.meter(clamp(0.5 - (inc.x - HX) / 3.4, 0, 1), { zone: [0.5 - w / 3.4, 0.5 + w / 3.4], label: '🫖 Dump the tea chest in the green' }); else ctx.meter(null);
        camSet(false);
      },
    };
  }
};
