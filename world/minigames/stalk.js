// Mini-game s1 · Stalk the Caribou. Red light / green light: creep toward a grazing herd while the lead cow's head is down,
// freeze when she looks up. Get within throwing range and press E. History: Ice Age hunters on the Beringian grassland
// followed herds of caribou, bison and mammoths; they moved quietly, stayed downwind and worked as a team.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';

function caribou(kit, big) {
  const g = new THREE.Group(), c = '#8a6a48', d = '#5a4430', w = '#e8e0cc';
  // rounded body, chest, rump, neck and thicker tapered legs so the herd reads as caribou, not boxes
  g.add(kit.mesh([
    P(SPH(0.55, 10, 8), c, 0, 1.18, 0.05, 0, 0, 0, 0.72, 0.62, 1.35),
    P(SPH(0.28, 8, 6), w, 0, 0.95, 0.1, 0, 0, 0, 0.9, 0.4, 1.15),
    P(SPH(0.34, 8, 6), c, 0, 1.32, 0.55, 0, 0, 0, 0.9, 0.7, 0.85),
    P(CYL(0.13, 0.2, 0.5, 8), c, 0, 1.38, 0.78, 0.85),
    P(SPH(0.1, 6, 4), w, 0, 1.08, -0.72, 0.4, 0, 0, 0.7, 0.5, 1.1),
    ...[[-0.2, 0.42], [0.2, 0.42], [-0.2, -0.48], [0.2, -0.48]].map(([x, z]) => P(CYL(0.07, 0.05, 0.95, 6), d, x, 0.48, z)),
  ]));
  const head = new THREE.Group(); head.position.set(0, 1.48, 0.95);
  head.add(kit.mesh([
    P(SPH(0.16, 8, 6), c, 0, 0.08, 0.05, 0, 0, 0, 0.95, 0.85, 1.15),
    P(SPH(0.11, 6, 5), d, 0, -0.02, 0.28, 0.4, 0, 0, 0.7, 0.55, 1.15),
    P(SPH(0.035, 5, 4), '#1a120a', 0, 0.04, 0.48),
    P(CONE(0.04, 0.14, 4), c, -0.1, 0.22, 0.12, 0, 0, 0.5), P(CONE(0.04, 0.14, 4), c, 0.1, 0.22, 0.12, 0, 0, -0.5),
    ...(big ? [-1, 1].flatMap(s => [P(CYL(0.025, 0.035, 0.85, 5), '#d8c8a0', s * 0.12, 0.55, 0.0, -0.35, 0, -s * 0.45), P(CYL(0.02, 0.025, 0.42, 4), '#d8c8a0', s * 0.38, 0.85, 0.18, 0.55, 0, -s * 0.25), P(CYL(0.018, 0.022, 0.32, 4), '#d8c8a0', s * 0.22, 0.95, -0.15, -0.55, 0, -s * 0.15)]) : [-1, 1].map(s => P(CYL(0.02, 0.028, 0.42, 4), '#d8c8a0', s * 0.1, 0.4, 0.05, -0.25, 0, -s * 0.35)))
  ]));
  g.add(head); g.userData.head = head; kit.ink(g); return g;
}

export default {
  title: 'Stalk the Caribou', icon: '🦌', era: 'Beringia & the first Americans · Ice Age', act: 'Ready',
  intro: 'Ice Age hunters followed <b>caribou</b> herds across the cold grasslands of <b>Beringia</b>. A caribou spooks easily, so a hunter crept close <b>slowly and quietly</b>, freezing whenever the animals looked up.',
  how: 'Hold <kbd>W</kbd> (or ▲) to creep forward while the lead caribou <b>grazes</b>. When she twitches her ears <b>❗</b> and lifts her head, <b>let go and freeze</b>! Get inside the green circle and press <kbd>E</kbd>.',
  tryit: 'Hold <kbd>W</kbd> only while her head is down. Freeze when you see ❗.',
  hint: 'Watch the lead caribou (the one with big antlers). When the ❗ appears, stop right away. Move only while her head is down eating.',
  fact: 'Caribou, bison and mammoths gave Ice Age people meat, warm hides for clothing and tents, and bone and antler for tools. Hunters moved quietly, stayed <b>downwind</b> so the animals could not smell them, and worked together as a team.',
  build(ctx) {
    const { kit, root, easy } = ctx, STR = easy ? 5 : 3, TIME = easy ? 95 : 80, RANGE = 8, SPD = 2.3;
    ctx.isolate(['terrain', 'water', 'river', 'lake']);
    let hz = 0, herdZ = 23, strikes = 0, t = 0, state = 'graze', sT = 3, ended = false, moving = false, spook = 0;
    // herd: the lead with big antlers plus four more, grazing on a gentle rise
    const herd = new THREE.Group(); root.add(herd); const deer = [];
    for (const [x, z, big, ry] of [[0, 0, true, Math.PI], [-2.4, 1.6, false, 2.6], [2.2, 1.2, false, 3.5], [-1.2, 3.6, false, 3.0], [1.4, 4.2, false, 2.8], [3.6, 3.6, false, 3.3]]) {
      const c = caribou(kit, big); c.position.set(x, 0, z); c.rotation.y = ry; c.scale.setScalar(big ? 1.1 : 0.95); herd.add(c); deer.push(c); }
    const lead = deer[0];
    const warn = kit.label('❗', { size: 1.1, bg: 'rgba(200,40,40,.85)' }); warn.scale.set(1.1, 1.1, 1); warn.position.set(0, 3.4, 0); lead.add(warn); warn.visible = false;
    // grass tufts and a few rocks for cover (decor), the range ring
    const tufts = []; for (let i = 0; i < 70; i++) { const x = (ctx.rnd() - 0.5) * 16, z = ctx.rnd() * 34 - 2; tufts.push(P(CONE(0.18, 0.5 + ctx.rnd() * 0.4, 4), ['#a8a060', '#8a9a50', '#b8a870'][i % 3], x, ctx.gy(x, z) + 0.2, z, 0, ctx.rnd() * 3)); }
    for (let i = 0; i < 6; i++) { const x = (i % 2 ? 1 : -1) * (3 + ctx.rnd() * 3), z = 4 + i * 4; tufts.push(P(new THREE.DodecahedronGeometry(0.5 + ctx.rnd() * 0.4, 0), '#8a8780', x, ctx.gy(x, z) + 0.2, z, 0, i, 0, 1.2, 0.7, 1)); }
    root.add(kit.mesh(tufts, { cast: false }));
    const ring = new THREE.Mesh(new THREE.RingGeometry(RANGE - 0.25, RANGE, 48), kit.basic({ color: '#3ee0b0', transparent: true, opacity: 0.5, depthWrite: false })); ring.rotation.x = -Math.PI / 2; root.add(ring);
    const place = () => { herd.position.set(0, ctx.gy(0, herdZ), herdZ); ring.position.set(0, ctx.gy(0, herdZ) + 0.12, herdZ); };
    place();
    const dist = () => herdZ - hz;
    const st = () => ctx.status('📏 ' + Math.max(0, Math.round(dist() - RANGE)) + ' m to go · 👀 ' + Math.max(0, STR - strikes) + ' chances · ⏱ ' + Math.max(0, Math.ceil(TIME - t)));
    const setHeads = k => { for (const c of deer) c.userData.head.rotation.x = lerp(c.userData.head.rotation.x, k, 0.2); };
    ctx.placeHero(0, ctx.gy(0, 0), 0, 0);
    return {
      start() { st(); ctx.msg('Creep up on the herd', 'info', 1.5); },
      bot(lose) { if (lose) return { y: 1 }; if (dist() <= RANGE) return { press: true }; return { y: state === 'graze' && sT > 0.25 ? 1 : 0 }; },
      action() { if (ended) return; if (dist() <= RANGE) { ended = true; ctx.msg('🎯 In range!', 'good'); ctx.flash('good'); ctx.sfx('hit'); return ctx.win('You crept within ' + Math.round(dist()) + ' m of the herd without spooking them. Now the hunters can throw their darts!'); } ctx.msg('Too far! Get inside the green circle first.', 'bad', 1.2); },
      update(dt, inp) {
        if (ended) return; t += dt; sT -= dt;
        // lead caribou cycle: graze → warn (ears twitch, ❗) → look up → graze
        if (state === 'graze' && sT <= 0) { state = 'warn'; sT = easy ? 0.9 : 0.65; }
        else if (state === 'warn' && sT <= 0) { state = 'look'; sT = 1.3 + ctx.rnd() * 1.2; }
        else if (state === 'look' && sT <= 0) { state = 'graze'; sT = 1.8 + ctx.rnd() * 2.2; }
        warn.visible = state !== 'graze'; warn.material.opacity = state === 'warn' ? 0.6 + 0.4 * Math.sin(t * 30) : 1;
        setHeads(state === 'look' ? -0.35 : state === 'warn' ? 0.35 : 0.95);
        lead.userData.head.rotation.z = state === 'warn' ? Math.sin(t * 25) * 0.08 : 0;
        moving = inp.y > 0.3 && spook <= 0;
        if (moving) hz += SPD * dt * (dist() > RANGE ? 1 : 0.3);
        hz = Math.min(hz, herdZ - 3);
        if (spook > 0) { spook -= dt; herdZ += dt * 4.5; place(); }
        if (state === 'look' && moving) {
          strikes++; spook = 1.1; state = 'graze'; sT = 2.5;
          kit.puff(new THREE.Vector3(0, ctx.gy(0, herdZ) + 0.4, herdZ), '#d8c8a0', 14, { spread: 1.5, up: 1 });
          ctx.msg(strikes >= STR ? 'She saw you!' : '😮 She saw you move! The herd trots away.', 'bad', 1.6); ctx.flash('bad'); ctx.sfx('miss');
        }
        for (const c of deer) c.position.y = spook > 0 ? Math.abs(Math.sin(t * 14 + c.position.x)) * 0.25 : 0;
        ctx.placeHero(0, ctx.gy(0, hz), hz, 0, moving ? 0.9 : 0);
        ctx.cam(1.2, ctx.gy(0, hz) + 2.6, hz - 4.6, 0, ctx.gy(0, hz) + 1.1, hz + 9);
        ring.material.opacity = dist() <= RANGE ? 0.75 + 0.2 * Math.sin(t * 8) : 0.4;
        st(); ctx.actLabel(dist() <= RANGE ? 'In range!' : (state === 'look' || state === 'warn' ? 'Hold still' : 'Creep'), dist() <= RANGE ? undefined : 'W');
        if (strikes >= STR) { ended = true; return ctx.lose('The herd got nervous and ran off. Move only while the lead caribou has her head down.'); }
        if (t >= TIME) { ended = true; return ctx.lose('The herd wandered away before you got close enough.'); }
      },
    };
  }
};
