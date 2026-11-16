// Mini-game s7 · Scale the Heights of Abraham, 1759. Row into the Anse au Foulon at night, then climb
// the narrow cliff path. History: Wolfe's soldiers found a poorly guarded path up the cliff on the night
// of 12–13 September 1759; at dawn they formed on the Plains of Abraham and defeated Montcalm. Both
// commanders were killed. The fall of Quebec ended French power in Canada and opened the continent;
// Britain's war debt and colonial officers like Washington were steps on the road to independence.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';

export default {
  title: 'Scale the Heights of Abraham', icon: '⛰️', era: 'Quebec · 12–13 September 1759', act: 'Steer to the cove',
  intro: 'Quebec sits high on a <b>cliff</b> above the <b>St. Lawrence</b>. In the dark of <b>13 September 1759</b>, General <b>James Wolfe</b>’s soldiers drifted to a little cove, the <b>Anse au Foulon</b>, and climbed a narrow path. You go with them.',
  how: 'First, steer the boat with <kbd>A</kbd> / <kbd>S</kbd> and stay between the rocks to reach the cove. Then press <kbd>E</kbd> in the <b>green</b> to climb each ledge. Reach the top of the path.',
  tryit: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> to keep the boat off the rocks. When you reach the cove, press <kbd>E</kbd> in the green to climb the first ledge.',
  hint: 'In the boat, stay near the middle of the water. On the path, wait for the needle to enter the green, then press E. The first ledge is slower on purpose.',
  fact: 'British scouts found the path at the <b>Anse au Foulon</b> (Wolfe’s Cove). At dawn on <b>13 September 1759</b> the army formed on the <b>Plains of Abraham</b> and defeated the French. Both <b>Wolfe</b> and the French general <b>Montcalm</b> were killed. Quebec’s fall, and Montreal’s the next year, ended France as a power in Canada. Britain’s war debt, and the experience of colonial officers like Washington, were among the first steps toward American independence.',
  build(ctx) {
    const { kit, root, easy } = ctx, LEDGES = 6, MISS = easy ? 5 : 3, COVE = 22;
    ctx.isolate([], ['sky', 'sea', 'sea-floor']);
    const g = [];
    // night sky dome + bright river water slightly above a thin bank lip
    g.push(P(SPH(70, 16, 10), '#0b1830', 0, 20, 20, 0, 0, 0, 1, 0.7, 1));
    g.push(P(BOX(80, 0.4, 80), '#1a3040', 0, -0.35, 16)); // bank / river bed
    g.push(P(BOX(70, 0.08, 36), '#2f9ec8', 0, 0.08, 8));  // bright water, slightly above the lip
    // cliff wall on +x, grounded on stacked rounded boulders (not a floating box)
    for (let i = 0; i < 14; i++) g.push(P(SPH(1.3 + (i % 3) * 0.2, 8, 6), '#4a453c', 6.2 + (i % 2) * 0.4, 0.3, i * 2.4 - 2));
    g.push(P(BOX(10, 28, 70), '#5a5348', 11.5, 12, 18, 0, 0, 0, 1, 1, 1, 0.04));
    // narrow path cut into the cliff, starting at the cove
    for (let i = 0; i < 8; i++) g.push(P(BOX(1.6, 0.18, 2.4), '#6a6358', 5.4, 0.5 + i * 1.35, COVE + 1.2 + i * 1.7, 0, 0.15));
    // Plains silhouette at the top
    g.push(P(BOX(18, 0.3, 10), '#6e7a58', 4, 11.2, COVE + 16));
    g.push(P(BOX(8, 4.5, 2.5), '#6a5a4e', 8, 13.2, COVE + 20)); // city wall suggestion
    // rocks in the river (hazards), cleared off the landing
    const ROCKS = easy ? [[-3.2, 7], [3.4, 13]] : [[-3.2, 6.5], [3.5, 11], [-2.8, 16]];
    ROCKS.forEach(([x, z]) => g.push(P(SPH(0.7, 7, 5), '#3a4248', x, 0.35, z, 0, 0, 0, 1, 0.7, 1.2)));
    root.add(kit.mesh(g, { cast: false, recv: true }));
    // stars
    for (let i = 0; i < 18; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.08, 5, 4), kit.basic({ color: '#e8eef8' })); s.position.set(-20 + (i * 7) % 40, 10 + (i % 5) * 1.4, -8 - (i % 4)); root.add(s); }
    // boat (a bit undersized vs the river — scale judged from the gameplay camera)
    const boat = kit.mesh([P(BOX(1.5, 0.28, 3.4), '#6b4a2a', 0, 0.2, 0), P(BOX(1.2, 0.16, 0.2), '#5a3a1e', 0, 0.42, 1.5), P(BOX(0.08, 1.1, 0.08), '#3a2a1a', 0, 0.9, 0.2)]);
    kit.ink(boat); root.add(boat);
    const oar = kit.mesh([P(CYL(0.03, 0.03, 1.6, 5), '#5a3a1e', 0.7, 0.5, 0, 0, 0, 0.9)]); root.add(oar);
    // a redcoat ahead on the path who turns and waves on a good climb (mascot reaction)
    const scout = person(kit, { coat: '#b8302a', pants: '#e8e2d2', hat: 'tricorn', skin: '#e0c4a0' });
    scout.position.set(5.2, 0.6, COVE + 3.4); scout.rotation.y = Math.PI; scout.visible = false; root.add(scout);

    let phase = 'row', bx = 0, bz = 0, miss = 0, led = 0, nd = 0, nv = 1, ended = false, pend = null, wave = 0, t = 0, bounce = 0, hitCool = 0;
    const zW = () => (led === 0 ? (easy ? 0.42 : 0.34) : led >= 4 ? (easy ? 0.3 : 0.22) : (easy ? 0.34 : 0.26));
    const zone = () => { const c = 0.5, w = zW(); return [c - w / 2, c + w / 2]; };
    const st = () => ctx.status(phase === 'row' ? '🛶 Steer to the cove · ❄ ' + miss + '/' + MISS : '⛰️ ' + led + '/' + LEDGES + ' ledges · ❄ ' + miss + '/' + MISS);
    const camSet = snap => {
      const port = ctx.portrait();
      if (phase === 'row') ctx.cam(port ? 0.4 : 0.2, port ? 6.2 : 3.6, bz - (port ? 10 : 7.2), bx, 0.6, bz + 3, snap);
      else { const ly = 0.6 + led * 1.35, lz = COVE + 1.2 + led * 1.7; ctx.cam(port ? 2.2 : 3.6, ly + (port ? 3.8 : 2.4), lz - (port ? 7 : 4.6), 5.2, ly + 0.8, lz + 1.6, snap); }
    };
    const fail = why => {
      if (ctx.grace(why + ' This first miss does not count — try again.')) { st(); bounce = 0.22; return; }
      miss++; ctx.msg(why, 'bad', 1.1); ctx.flash('bad'); ctx.sfx('miss'); bounce = 0.28; st();
      if (miss >= MISS && !ended) { ended = true; pend = { t: 0.9, f: () => ctx.lose('The path was too steep this time. Wolfe’s men kept climbing in the dark — you can too. Try again!') }; }
    };
    const placeBoat = () => { boat.position.set(bx, 0.12 + Math.sin(t * 3) * 0.03, bz); oar.position.set(bx, 0.4, bz); oar.rotation.z = Math.sin(t * 5) * 0.4; };
    camSet(true); ctx.placeHero(bx, 0.15, bz - 0.4, 0, 0); ctx.heroVisible(false);
    return {
      start() { st(); ctx.msg('Steer for the dark cove under the cliff!', 'info', 1.6); ctx.actLabel('Steer to the cove', 'A/S'); },
      bot(lose) {
        if (pend || ended) return {};
        if (phase === 'climb') { const z = zone(), c = (z[0] + z[1]) / 2; return { press: lose ? (nd < z[0] - 0.04 || nd > z[1] + 0.04) && nd > 0.08 && nd < 0.92 : Math.abs(nd - c) < zW() * 0.25 }; }
        // steer toward x=0, or into the nearest rock if losing
        if (lose) { const r = ROCKS.find(q => Math.abs(q[1] - bz) < 5 && q[1] > bz - 0.5) || ROCKS[0]; return { x: (bx - r[0]) > 0 ? -1 : 1 }; }
        return { x: bx > 0.2 ? 1 : bx < -0.2 ? -1 : 0 };
      },
      action() {
        if (ended || pend || phase !== 'climb') return;
        const z = zone();
        if (nd >= z[0] && nd <= z[1]) {
          led++; ctx.msg(['Up you go!', 'Good hold!', 'On to the next ledge!'][led % 3], 'good', 0.8);
          ctx.flash('good'); ctx.sfx('jump'); wave = 1.1; bounce = 0.2;
          kit.puff(new THREE.Vector3(5.2, 0.8 + led * 1.35, COVE + led * 1.7), '#d8c8a0', 8, { spread: 0.4, up: 0.8 });
          nd = 0; nv = 1; st();
          if (led >= LEDGES) { ended = true; pend = { t: 1.15, f: () => ctx.win('You reach the top as dawn breaks. Below is the St. Lawrence; ahead, the <b>Plains of Abraham</b>, where the battle that decided New France will be fought at sunrise.') }; }
          else ctx.prompt('Press E to climb the next ledge — when the needle is in the green.', 2.4);
        } else fail(nd < z[0] ? 'Too soon — the foothold is still out of reach.' : 'Too late — the dirt crumbled under your boot!');
      },
      update(dt, inp) {
        t += dt; wave = Math.max(0, wave - dt); bounce = Math.max(0, bounce - dt);
        if (scout.userData.armR) scout.userData.armR.rotation.x = lerp(scout.userData.armR.rotation.x, wave > 0 ? -2.1 : -0.3, dt * 8);
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } return; }
        if (ended) return;
        if (phase === 'row') {
          const spd = easy ? 3.6 : 4.4;
          bz += spd * dt; bx = clamp(bx - (inp.x || 0) * 4.2 * dt, -4.2, 4.2);
          placeBoat();
          ctx.placeHero(bx, 0.2, bz - 0.3, 0, 0);
          hitCool -= dt;
          if (hitCool <= 0) {
            for (const [rx, rz] of ROCKS) {
              if (Math.abs(bz - rz) < 0.8 && Math.abs(bx - rx) < 1.05) {
                kit.puff(new THREE.Vector3(bx, 0.4, bz), '#c8e0f0', 12, { spread: 0.7, up: 1.2 }); ctx.sfx('splash');
                fail('You struck a rock in the dark river!'); bx = lerp(bx, 0, 0.7); bz += 1.2; hitCool = 1.1; break;
              }
            }
          }
          if (bz >= COVE - 0.4) {
            phase = 'climb'; bz = COVE; scout.visible = true; ctx.heroVisible(true);
            ctx.placeHero(5.0, 0.55, COVE + 0.6, 0.2, 0);
            ctx.actLabel('Climb the ledge'); ctx.prompt('Press E to climb the first ledge — when the needle is in the green.', 3.0);
            ctx.msg('The boat is in. Now the path!', 'info', 1.4); ctx.sfx('hit'); nd = 0; nv = 1;
          }
        } else {
          const sp = (led === 0 ? 0.48 : led >= 4 ? 0.7 : 0.58) * (easy ? 0.85 : 1);
          nd += nv * sp * dt; if (nd > 1) { nd = 1; nv = -1; } if (nd < 0) { nd = 0; nv = 1; }
          ctx.meter(nd, { zone: zone(), label: 'too soon ← climb the ledge → too late' });
          const ly = 0.55 + led * 1.35 + (bounce > 0 ? Math.sin(bounce * 28) * 0.08 : 0);
          ctx.placeHero(5.0, ly, COVE + 0.8 + led * 1.7, 0.15, 0);
          scout.position.set(5.3, 0.6 + Math.min(led + 1, LEDGES) * 1.35, COVE + 2.0 + Math.min(led + 1, LEDGES) * 1.7);
        }
        camSet(false); st();
      },
    };
  }
};
