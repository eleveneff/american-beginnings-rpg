// Mini-game s8 · Spin Homespun. A Daughters of Liberty spinning bee, 1767–68. Draw even yarn on a
// walking wheel to replace British cloth during the Townshend boycott. Women led the protest at home:
// spinning bees, herb tea, nonimportation. Self-reliance as political action.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';

export default {
  title: 'Spin Homespun', icon: '🧶', era: 'Boston · Daughters of Liberty, 1767–1768', act: 'Draw the yarn',
  intro: 'Parliament’s <b>Townshend Acts</b> taxed cloth from Britain. The <b>Daughters of Liberty</b> answered at home: they held <b>spinning bees</b> and made <b>homespun</b> so no British cloth was needed. You sit at a walking wheel with them.',
  how: 'The wheel turns. Press <kbd>E</kbd> when the needle is in the <b>green</b> to draw an even length of yarn. Make <b>8 skeins</b>. Too early or too late, the yarn breaks.',
  tryit: 'Watch the needle. Press <kbd>E</kbd> when it is in the green — to draw the yarn, not too tight and not too slack.',
  hint: 'The wheel turns the same way every time. Wait for the needle to come back toward the green and press just before it gets there. The first skein is slower on purpose.',
  fact: 'In <b>1767–68</b>, groups called the <b>Daughters of Liberty</b> held spinning bees, sometimes all day, to make homespun wool and flax instead of buying British cloth. They also brewed tea from local herbs. Boycotts and <b>nonimportation</b> agreements hurt British merchants so much that most Townshend taxes were later repealed — all but the tax on tea. Ordinary work, done together, became a political act of self-reliance.',
  build(ctx) {
    const { kit, root, easy } = ctx, N = 8, MISS = easy ? 5 : 3;
    ctx.isolate([], ['sky', 'sea', 'sea-floor']);
    const g = [];
    // packed-earth yard, clapboard house, hearth — grounded, distinct silhouette
    g.push(P(CYL(36, 36, 0.4, 18), '#c4a878', 0, -0.2, 4, 0, 0, 0, 1, 1, 1, 0.04));
    g.push(P(BOX(10, 4.2, 5), '#d8c8a8', 0, 2.1, 9.2), P(BOX(10.4, 0.3, 5.4), '#6a3a28', 0, 4.35, 9.2));
    g.push(P(BOX(0.9, 2.0, 0.1), '#5a3a22', 0, 1.0, 6.65), P(BOX(0.7, 0.8, 0.08), '#2a3440', -2.2, 2.4, 6.66), P(BOX(0.7, 0.8, 0.08), '#2a3440', 2.2, 2.4, 6.66));
    g.push(P(BOX(1.2, 2.2, 0.8), '#8a4a32', 4.2, 3.4, 9.2)); // chimney
    // cloth on the line
    g.push(P(CYL(0.04, 0.04, 5.5, 6), '#5a3a22', 4.6, 1.6, 2.4, 0, 0, Math.PI / 2));
    for (let i = 0; i < 4; i++) g.push(P(BOX(0.7, 0.9, 0.04), ['#c8b892', '#e8e0d0', '#b08a5a', '#d0c4a0'][i], 3.4 + i * 0.85, 1.15, 2.4));
    // a closed chest of British goods (not for sale today)
    g.push(P(BOX(1.1, 0.6, 0.7), '#5a3a22', -4.2, 0.35, 3.2), P(BOX(1.14, 0.08, 0.74), '#3a2a18', -4.2, 0.68, 3.2));
    // walking wheel: large wheel, maidens, flyer — distinctive silhouette, slightly oversized for the camera
    const WX = 0.6, WZ = 2.0;
    g.push(P(BOX(1.4, 0.12, 0.5), '#6b4a2a', WX, 0.08, WZ)); // bench / base
    root.add(kit.mesh(g, { cast: false, recv: true }));
    const rim = kit.mesh([P(CYL(0.9, 0.9, 0.08, 20), '#7a5230', 0, 0, 0, 0, 0, Math.PI / 2), P(CYL(0.08, 0.08, 1.1, 8), '#5a3a22', 0, -0.55, 0)]);
    rim.position.set(WX - 0.15, 1.15, WZ); root.add(rim); kit.ink(rim);
    const spokes = kit.mesh(Array.from({ length: 8 }, (_, i) => P(BOX(0.04, 1.6, 0.03), '#8a6238', 0, 0, 0, 0, 0, i * Math.PI / 8)));
    rim.add(spokes);
    const flyer = kit.mesh([P(CYL(0.05, 0.05, 0.7, 8), '#c8a040', 0.7, 0.9, 0, 0, 0, Math.PI / 2), P(SPH(0.08, 6, 5), '#d8b050', 1.05, 0.9, 0)]);
    flyer.position.set(WX, 0, WZ); root.add(flyer);
    // other spinners (NPC reaction on a good draw)
    const pals = [person(kit, { coat: '#7a4a3a', dress: true, hat: 'cap', skin: '#e0b48c' }), person(kit, { coat: '#4a5a3a', dress: true, hat: 'cap', skin: '#c8946a' })];
    pals[0].position.set(-2.2, 0, 3.4); pals[0].rotation.y = 0.6; pals[1].position.set(3.1, 0, 3.8); pals[1].rotation.y = -0.5;
    pals.forEach(p => root.add(p));
    ctx.placeHero(-0.7, 0, WZ + 0.35, Math.PI / 2);
    const camSet = snap => { const port = ctx.portrait(); ctx.cam(port ? -0.2 : 0.2, port ? 3.6 : 2.2, WZ - (port ? 5.8 : 3.4), WX - 0.1, 0.7, WZ + 0.2, snap); };
    camSet(true);

    let done = 0, miss = 0, nd = 0, nv = 1, ended = false, pend = null, t = 0, wave = 0, yarn = 0;
    const zW = () => (done === 0 ? (easy ? 0.4 : 0.32) : done >= 6 ? (easy ? 0.28 : 0.2) : (easy ? 0.32 : 0.24));
    const zone = () => { const c = 0.5, w = zW(); return [c - w / 2, c + w / 2]; };
    const st = () => ctx.status('🧶 ' + done + '/' + N + ' skeins · ❌ ' + miss + '/' + MISS + ' breaks');
    const yarnLine = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), kit.mat({ color: '#e8d8b0' })); yarnLine.geometry.translate(0, 0.5, 0); yarnLine.position.set(WX + 0.4, 0.9, WZ); root.add(yarnLine);
    const skeins = [];
    const fail = why => {
      if (ctx.grace(why + ' This first break does not count — watch the green and try again.')) { yarn = 0; st(); return; }
      miss++; yarn = 0; ctx.msg(why, 'bad', 1.1); ctx.flash('bad'); ctx.sfx('miss');
      kit.puff(new THREE.Vector3(WX + 0.5, 1.0, WZ), '#e8d8b0', 8, { spread: 0.4, up: 0.7 }); st();
      if (miss >= MISS && !ended) { ended = true; pend = { t: 0.9, f: () => ctx.lose('The yarn broke too often. The Daughters of Liberty practiced until the thread ran even. Try again!') }; }
    };
    return {
      start() { st(); ctx.msg('The wheel is turning — draw an even yarn!', 'info', 1.5); ctx.actLabel('Draw the yarn'); },
      bot(lose) {
        if (pend || ended) return {};
        const z = zone(), c = (z[0] + z[1]) / 2;
        return { press: lose ? (nd < z[0] - 0.04 || nd > z[1] + 0.04) && nd > 0.08 && nd < 0.92 : Math.abs(nd - c) < zW() * 0.22 };
      },
      action() {
        if (ended || pend) return;
        const z = zone();
        if (nd >= z[0] && nd <= z[1]) {
          done++; yarn = 0; wave = 1.0;
          ctx.msg(['Even and strong!', 'A fine skein!', 'That’s homespun!'][done % 3], 'good', 0.8);
          ctx.flash('good'); ctx.sfx('hit');
          const sk = kit.mesh([P(CYL(0.12, 0.12, 0.28, 10), '#e8d0a8', 0, 0.14, 0), P(CYL(0.14, 0.14, 0.06, 10), '#d0b888', 0, 0.28, 0)]);
          sk.position.set(-1.6 + (done % 4) * 0.4, 0, 1.1 + Math.floor((done - 1) / 4) * 0.4); root.add(sk); skeins.push(sk);
          kit.puff(new THREE.Vector3(WX + 0.5, 1.0, WZ), '#f0e0b8', 10, { spread: 0.35, up: 0.9 }); st();
          if (done >= N) { ended = true; pend = { t: 1.1, f: () => ctx.win('Eight skeins of homespun, spun at the bee. That is cloth a Boston family will wear — and a tax they will not have to pay.') }; }
        } else fail(nd < z[0] ? 'Too tight — the yarn snapped!' : 'Too slack — the yarn drifted and broke!');
      },
      update(dt, inp) {
        t += dt; wave = Math.max(0, wave - dt);
        rim.rotation.z = t * (0.9 + done * 0.08);
        flyer.rotation.y = t * 2;
        yarn = lerp(yarn, nd, dt * 6);
        yarnLine.scale.y = 0.3 + yarn * 0.9;
        pals.forEach(p => { if (p.userData.armR) p.userData.armR.rotation.x = lerp(p.userData.armR.rotation.x, wave > 0 ? -1.8 : -0.35, dt * 8); });
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } return; }
        if (ended) return;
        const sp = (done === 0 ? 0.5 : done >= 6 ? 0.72 : 0.6) * (easy ? 0.85 : 1);
        nd += nv * sp * dt; if (nd > 1) { nd = 1; nv = -1; } if (nd < 0) { nd = 0; nv = 1; }
        ctx.meter(nd, { zone: zone(), label: 'too tight ← draw the yarn → too slack' });
        camSet(false); st();
      },
    };
  }
};
