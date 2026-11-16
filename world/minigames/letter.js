// Mini-game s7 · Washington's Winter Mission, 1753. Walk the snow path, ford icy creeks, and deliver
// Governor Dinwiddie's letter to the French at Fort Le Boeuf. History: 21-year-old George Washington
// and the guide Christopher Gist; the French commander politely refused; Washington nearly drowned
// in the Allegheny on the way home. Courage and diplomacy first; the same young officer later led
// the Continental Army.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';

export default {
  title: "Washington's Winter Mission", icon: '✉️', era: 'Ohio Country · winter 1753', act: 'Steer toward the fort',
  intro: 'In late <b>1753</b>, Virginia’s governor sent 21-year-old <b>George Washington</b> through the winter woods to <b>Fort Le Boeuf</b> with a letter telling the French to leave. The guide <b>Christopher Gist</b> went with him. You walk that same icy road.',
  how: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> to stay on the packed-snow path. At each creek, press <kbd>E</kbd> in the <b>green</b> to ford. At the fort, press <kbd>E</kbd> to deliver the letter. Ford <b>3 creeks</b> and deliver it.',
  tryit: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> to stay on the path. At the first creek, press <kbd>E</kbd> when the needle is in the green — to ford the water.',
  hint: 'Keep to the packed snow (the lighter strip). At a creek, wait for the needle to enter the green, then press E — not before. The first creek is slower on purpose.',
  fact: 'Washington reached <b>Fort Le Boeuf</b> (near today’s Waterford, Pennsylvania) in December 1753. The French commander, <b>Legardeur de Saint-Pierre</b>, received him politely and <b>refused</b> to leave. On the way home Washington fell into the icy <b>Allegheny</b> and was pulled out by Gist. The mission failed, but the young officer learned hard lessons of duty, weather, and command — lessons he later carried into the Continental Army.',
  build(ctx) {
    const { kit, root, easy } = ctx, CREEKS = [9, 18, 27], FORT = 38, MISS = easy ? 5 : 3;
    ctx.isolate([], ['sky', 'sea', 'sea-floor']);
    const g = [];
    // snow ground + a slightly raised packed-snow path (judge scale from the gameplay camera)
    g.push(P(CYL(48, 48, 0.4, 20), '#e8eef4', 0, -0.2, 20, 0, 0, 0, 1, 1, 1, 0.03));
    g.push(P(BOX(3.2, 0.08, 50), '#d4dde6', 0, 0.02, 20, 0, 0, 0, 1, 1, 1, 0.02));
    // overcast hills
    for (const [x, z, s] of [[-22, 44, 9], [24, 46, 11], [-16, 52, 8], [18, 54, 10]]) g.push(P(CONE(s, s * 0.7, 6), '#c5d0dc', x, s * 0.25, z));
    // pines cleared off the path (|x| > 3.2) — never plant on the trail
    for (let i = 0; i < 28; i++) {
      const x = (i % 2 ? 1 : -1) * (4.2 + (i * 1.7) % 9), z = 2 + (i * 1.9) % 44, h = 2.4 + (i % 5) * 0.4;
      g.push(P(CYL(0.16, 0.2, 0.8, 6), '#4a3020', x, 0.4, z), P(CONE(1.1, h, 6), i % 3 ? '#2d4a38' : '#355544', x, 0.8 + h / 2, z));
    }
    // three creeks: bright water lifted just above a thin dark bank lip (Princess water lesson)
    CREEKS.forEach((cz, i) => {
      g.push(P(BOX(16, 0.4, 0.45), '#5a4a3a', 0, -0.15, cz)); // bank lip
      g.push(P(BOX(14, 0.08, 1.5), '#3aa0c8', 0, 0.06, cz));  // bright water slightly above the lip
    });
    // Fort Le Boeuf: small palisade, storehouse, white Bourbon flag — grounded on the snow
    const FZ = FORT + 3;
    for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = 3.4; g.push(P(CYL(0.12, 0.08, 1.8, 5), '#6b4a2e', Math.cos(a) * r, 0.9, FZ + Math.sin(a) * r)); }
    g.push(P(BOX(2.2, 1.6, 1.8), '#7a5a38', 0, 0.8, FZ), P(BOX(2.5, 0.2, 2.1), '#5a3a22', 0, 1.65, FZ));
    g.push(P(CYL(0.06, 0.06, 2.6, 6), '#6b4f36', 1.1, 2.1, FZ));
    g.push(P(BOX(0.9, 0.55, 0.04), '#f6f3ea', 1.6, 3.1, FZ)); // white flag cloth
    for (const [dx, dy] of [[-0.2, 0.1], [0.15, -0.08], [0, 0.18]]) g.push(P(SPH(0.05, 6, 4), '#c9a227', 1.6 + dx, 3.1 + dy, FZ + 0.04));
    // solid post sign (not a translucent billboard)
    g.push(P(CYL(0.05, 0.05, 1.5, 6), '#5a3a22', -2.2, 0.75, FORT - 0.6), P(BOX(1.5, 0.7, 0.08), '#c8b48a', -2.2, 1.55, FORT - 0.6));
    root.add(kit.mesh(g, { cast: false, recv: true }));
    const letters = kit.mesh([
      P(BOX(1.36, 0.14, 0.03), '#3a2a18', -2.2, 1.62, FORT - 0.55),
      P(BOX(1.1, 0.08, 0.03), '#5a3a22', -2.2, 1.42, FORT - 0.55)
    ]); root.add(letters);

    const gist = person(kit, { coat: '#4a3a2a', pants: '#3a3028', hat: 'brim', skin: '#c4a07a' });
    gist.position.set(0.9, 0, CREEKS[0] + 1.6); gist.rotation.y = Math.PI; root.add(gist);
    const cmdr = person(kit, { coat: '#e2ded2', pants: '#b8302a', hat: 'tricorn', skin: '#e0c4a0' });
    cmdr.position.set(0, 0, FZ + 0.4); cmdr.rotation.y = Math.PI; root.add(cmdr);

    let px = 0, pz = 0, miss = 0, ci = 0, phase = 'walk', nd = 0, nv = 1, ended = false, pend = null, slipT = 0, gistWave = 0, t = 0, bounce = 0;
    const zW = () => (ci === 0 ? (easy ? 0.42 : 0.34) : ci >= 2 ? (easy ? 0.3 : 0.22) : (easy ? 0.34 : 0.26));
    const zone = () => { const c = 0.5, w = zW(); return [c - w / 2, c + w / 2]; };
    const st = () => ctx.status('✉️ ' + Math.min(ci, 3) + '/3 creeks · ' + (phase === 'fort' ? 'Deliver the letter' : phase === 'ford' ? 'Ford the creek' : 'Stay on the path') + ' · ❄ ' + miss + '/' + MISS);
    const camSet = snap => {
      const port = ctx.portrait();
      if (phase === 'fort') ctx.cam(port ? 0.6 : 1.4, port ? 4.2 : 2.6, FORT - (port ? 8 : 5.2), 0, 1.1, FORT + 2.2, snap);
      else ctx.cam(px + (port ? 0.4 : 0.8), port ? 5.2 : 3.2, pz - (port ? 9 : 6.2), px, 0.6, pz + 3.5, snap);
    };
    const hero = (speed = 0) => ctx.placeHero(px, 0, pz, 0, speed);
    const look = () => { hero(phase === 'walk' ? 2.2 : 0); camSet(false); };
    const puffAt = (c, n) => kit.puff(new THREE.Vector3(px, 0.2, pz + 0.4), c, n, { spread: 0.6, up: 1.1, life: 0.9 });
    const fail = why => {
      if (ctx.grace(why + ' This first slip does not count — try again.')) { st(); bounce = 0.25; return; }
      miss++; ctx.msg(why, 'bad', 1.1); ctx.flash('bad'); ctx.sfx('miss'); puffAt('#c8e0f0', 10); bounce = 0.28; st();
      if (miss >= MISS && !ended) { ended = true; pend = { t: 0.9, f: () => ctx.lose('The icy creeks were too much this time. Washington and Gist kept going — you can too. Try again!') }; }
    };
    camSet(true); hero(); st();
    return {
      start() { st(); ctx.msg('Follow Gist along the packed-snow path!', 'info', 1.6); ctx.actLabel('Steer toward the fort', 'A/S'); },
      bot(lose) {
        if (pend || ended) return {};
        if (phase === 'fort') return { press: !lose };
        if (phase === 'ford') { const z = zone(), c = (z[0] + z[1]) / 2; return { press: lose ? (nd < z[0] - 0.04 || nd > z[1] + 0.04) && nd > 0.08 && nd < 0.92 : Math.abs(nd - c) < zW() * 0.25 }; }
        return { x: px > 0.25 ? 1 : px < -0.25 ? -1 : 0 };
      },
      action() {
        if (ended || pend) return;
        if (phase === 'ford') {
          const z = zone();
          if (nd >= z[0] && nd <= z[1]) {
            ctx.msg(['Made it across!', 'Good ford!', 'On to the next creek!'][ci % 3], 'good', 0.9);
            ctx.flash('good'); ctx.sfx('splash'); puffAt('#8fd4e8', 14); gistWave = 1.2; ci++; bounce = 0.2;
            phase = ci >= 3 ? 'fort' : 'walk'; nd = 0; nv = 1;
            if (phase === 'fort') { ctx.actLabel('Deliver the letter'); ctx.prompt('Press E to deliver the letter to the commandant.', 3.2); }
            else { gist.position.z = (CREEKS[ci] || FORT) + 1.6; ctx.actLabel('Steer toward the fort', 'A/S'); }
            st();
          } else fail(nd < z[0] ? 'Too soon! The ice is still thin.' : 'Too late — the current caught you!');
          return;
        }
        if (phase === 'fort') {
          ctx.sfx('hit'); ctx.flash('good'); kit.puff(new THREE.Vector3(0, 1.2, FZ), '#ffd700', 16, { spread: 0.5, up: 1.4, life: 1.1 });
          cmdr.userData.armR.rotation.x = -1.1; ended = true;
          pend = { t: 1.15, f: () => ctx.win('The commandant bows, reads the letter, and <b>politely refuses</b> to leave. The mission is done: you delivered Washington’s message, just as he did in 1753.') }; st();
        }
      },
      update(dt, inp) {
        t += dt; bounce = Math.max(0, bounce - dt); gistWave = Math.max(0, gistWave - dt);
        if (gist.userData.armR) gist.userData.armR.rotation.x = lerp(gist.userData.armR.rotation.x, gistWave > 0 ? -2.2 : -0.3, dt * 8);
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } look(); return; }
        if (ended) return;
        if (phase === 'walk') {
          const spd = (easy ? 3.4 : 4.1);
          pz += spd * dt; px = clamp(px - (inp.x || 0) * 3.6 * dt, -2.4, 2.4);
          if (Math.abs(px) > 1.55) { slipT += dt; if (slipT > 0.55) { fail('You slipped off the packed path into the deep snow!'); px = lerp(px, 0, 0.8); slipT = 0; } }
          else slipT = 0;
          if (ci < 3 && pz >= CREEKS[ci] - 0.35) { phase = 'ford'; nd = 0; nv = 1; pz = CREEKS[ci] - 0.2; ctx.actLabel('Ford the creek'); ctx.prompt('Press E to ford the creek — when the needle is in the green.', 2.8); ctx.sfx('wind'); }
          if (ci >= 3 && pz >= FORT - 0.4) { phase = 'fort'; pz = FORT - 0.2; ctx.actLabel('Deliver the letter'); ctx.prompt('Press E to deliver the letter to the commandant.', 3.2); }
        } else if (phase === 'ford') {
          const sp = (ci === 0 ? 0.48 : ci >= 2 ? 0.7 : 0.58) * (easy ? 0.85 : 1);
          nd += nv * sp * dt; if (nd > 1) { nd = 1; nv = -1; } if (nd < 0) { nd = 0; nv = 1; }
          ctx.meter(nd, { zone: zone(), label: 'too soon ← ford the creek → too late' });
        } else ctx.meter(null);
        // a little bounce on success/miss so the action feels physical within 100 ms
        const yOff = bounce > 0 ? Math.sin(bounce * 28) * 0.08 : 0;
        ctx.placeHero(px, yOff, pz, 0, phase === 'walk' ? 2.2 : 0);
        camSet(false); st();
        if (ctx.rnd() < dt * 0.15) ctx.sfx('wind');
      },
    };
  }
};
