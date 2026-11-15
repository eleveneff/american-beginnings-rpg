// Mini-game s4 · Make Adobe Bricks. Three steps per brick: stop the mixing needle in the green (mud just right), tap to pack
// the wooden mold, then lift the mold at the right moment. Three bricks. History: Pueblo peoples built with mud long before
// the Spanish came; Spanish settlers brought wooden brick molds; Santa Fe (about 1610) and its Palace of the Governors.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';

export default {
  title: 'Make Adobe Bricks', icon: '🧱', era: 'Spanish New Mexico · Santa Fe, about 1610', act: 'Mix',
  intro: '<b>Adobe</b> is mud made of <b>clay, sand, water and straw</b>, dried hard in the sun. Pueblo peoples had built with mud for centuries. Spanish settlers brought <b>wooden molds</b> that shaped it into bricks, and they built <b>Santa Fe</b> from them.',
  how: 'For each brick: press <kbd>E</kbd> when the needle is in the <b>green</b> to get the mix right, tap <kbd>E</kbd> fast to <b>pack</b> the mold, then press <kbd>E</kbd> in the green to <b>lift</b> the mold. Make <b>3 bricks</b>.',
  hint: 'The needle swings the same way every time: wait for it to come back toward the green and press just before it gets there. Packing: tap, tap, tap! Lifting: wait until the mud has settled into the green.',
  fact: 'The <b>Palace of the Governors</b> in Santa Fe was built of adobe starting around 1610. It is one of the oldest public buildings in the United States still in use. Thick adobe walls stay cool in summer and hold warmth in winter.',
  build(ctx) {
    const { kit, root, easy } = ctx, N = 3, BAD = easy ? 5 : 3, ZW = easy ? 0.26 : 0.18, PACK = 5, TIME = easy ? 150 : 120;
    ctx.isolate();
    const g = [];
    g.push(P(BOX(80, 0.4, 70), '#c8a674', 0, -0.2, 8, 0, 0, 0, 1, 1, 1, 0.04));
    // the plaza edge: a long adobe building with a portal of wooden posts and vigas (like the Palace of the Governors)
    g.push(P(BOX(22, 3.6, 4), '#c89a68', 0, 1.8, 13), P(BOX(22.4, 0.3, 4.4), '#b58858', 0, 3.75, 13));
    for (let x = -10; x <= 10; x += 0.8) g.push(P(CYL(0.08, 0.08, 0.5, 5), '#6b4a2a', x, 3.3, 10.75, Math.PI / 2));
    g.push(P(BOX(22, 0.2, 2.6), '#7a5a3a', 0, 3.0, 9.8)); for (let x = -10; x <= 10; x += 2.5) g.push(P(CYL(0.12, 0.12, 2.9, 6), '#7a5230', x, 1.45, 8.7), P(BOX(0.6, 0.14, 0.3), '#6b4a2a', x, 2.9, 8.7));
    for (let x = -8; x <= 8; x += 4) g.push(P(BOX(0.9, 1.9, 0.12), '#5a3a1e', x, 0.95, 10.96), P(BOX(0.6, 0.6, 0.12), '#3a2a20', x + 1.6, 1.8, 10.96));
    // a horno (beehive oven) and a church bell wall far off
    g.push(P(SPH(1.1, 10, 6), '#cfa070', -7.5, 0.1, 5.8, 0, 0, 0, 1, 0.95, 1), P(BOX(0.5, 0.45, 0.2), '#3a2414', -7.5, 0.4, 4.75), P(BOX(1.8, 0.3, 1.8), '#b58858', -7.5, 0.15, 5.8));
    g.push(P(BOX(5, 6, 2), '#d2a46c', 9, 3, 22), P(BOX(1.2, 1.4, 2.1), '#c09060', 9, 6.7, 22), P(BOX(0.12, 1.6, 0.12), '#5a3a1e', 9, 8.2, 21));
    // the mud pit, straw bundles, a water jar, rows of drying bricks
    g.push(P(CYL(1.5, 1.6, 0.25, 14), '#7a5634', -4.2, 0.06, 3.6), P(CYL(1.35, 1.35, 0.06, 14), '#8a6038', -4.2, 0.19, 3.6));
    for (let i = 0; i < 3; i++) g.push(P(CYL(0.35, 0.35, 0.9, 8), '#d8c070', 3.6 + i * 0.5, 0.35, 3.6 + (i % 2) * 0.4, 0, 0, Math.PI / 2 + 0.2 * i));
    g.push(P(SPH(0.4, 10, 8), '#a8603a', 3.2, 0.35, 1.2, 0, 0, 0, 1, 1.1, 1), P(CYL(0.18, 0.22, 0.2, 10), '#a8603a', 3.2, 0.8, 1.2));
    const dryB = (x, z) => g.push(P(BOX(0.5, 0.18, 0.28), ['#b88c5a', '#c4966a', '#ad8250'][(x * 7 + z * 3 & 7) % 3], x, 0.09, z, 0, (ctx.rnd() - 0.5) * 0.1));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) dryB(-5.5 + c * 0.65, 5.8 + r * 0.45);
    for (let c = 0; c < 6; c++) for (let h = 0; h < 3; h++) g.push(P(BOX(0.5, 0.18, 0.28), '#c09460', 4.4 + (c % 3) * 0.55 + (h % 2) * 0.2, 0.09 + h * 0.19, 6 + Math.floor(c / 3) * 0.6));
    root.add(kit.mesh(g, { cast: false, recv: true }));
    // the mold (moves), the mud in it, the bricks she has made
    const MZ = 2.2;
    const mold = kit.mesh([P(BOX(0.06, 0.2, 0.42), '#8a6238', -0.31, 0.1, 0), P(BOX(0.06, 0.2, 0.42), '#8a6238', 0.31, 0.1, 0), P(BOX(0.68, 0.2, 0.06), '#7a5230', 0, 0.1, -0.24), P(BOX(0.68, 0.2, 0.06), '#7a5230', 0, 0.1, 0.24), P(BOX(0.1, 0.06, 0.06), '#6b4a2a', -0.42, 0.18, 0), P(BOX(0.1, 0.06, 0.06), '#6b4a2a', 0.42, 0.18, 0)]);
    kit.ink(mold); root.add(mold);
    const mudM = kit.mat({ color: '#8a5e3a' }), mud = new THREE.Mesh(new THREE.BoxGeometry(0.56, 1, 0.42), mudM); mud.geometry.translate(0, 0.5, 0); root.add(mud);
    const straw = kit.mesh(Array.from({ length: 14 }, (_, i) => P(BOX(0.18, 0.012, 0.012), '#e0c870', (ctx.rnd() - 0.5) * 0.45, 0.0, (ctx.rnd() - 0.5) * 0.3, 0, ctx.rnd() * 3, 0))); mud.add(straw);
    const tamp = kit.mesh([P(CYL(0.025, 0.025, 0.7, 5), '#7a5230', 0, 0.35, 0), P(BOX(0.22, 0.06, 0.16), '#5a3a1e', 0, 0, 0)]); root.add(tamp);
    const made = [];
    let brick = 0, bad = 0, step = 'mix', t = 0, nd = 0, nv = 1, packs = 0, packT = 0, fill = 0, lift = 0, ended = false, pend = null, zone = [0, 0], spot = 0;
    const SPOTS = [1.1, 0, -1.1];
    const newZone = () => { const c = 0.3 + ctx.rnd() * 0.4; zone = [c - ZW / 2, c + ZW / 2]; };
    const setStep = s => { step = s; nd = 0; nv = 1; packs = 0; packT = 0; lift = 0;
      if (s === 'mix') { newZone(); fill = 0; } ctx.actLabel({ mix: 'Mix', pack: 'Pack', lift: 'Lift' }[s]); };
    const st = () => ctx.status('🧱 ' + brick + '/' + N + ' bricks · ' + { mix: '🥣 Mix', pack: '👐 Pack', lift: '⬆️ Lift' }[step] + ' · ❌ ' + bad + '/' + BAD + ' · ⏱ ' + Math.max(0, Math.ceil(TIME - t)));
    const mx = () => SPOTS[spot];
    const place = () => { mold.position.set(mx(), 0, MZ); mud.position.set(mx(), 0.01, MZ); mud.scale.y = Math.max(0.001, fill * 0.18); mud.visible = fill > 0.01; tamp.position.set(mx(), 0.6, MZ - 0.05); tamp.visible = step === 'pack'; };
    const hero = () => ctx.placeHero(mx() - 0.95, 0, MZ + 0.15, Math.PI / 2 - 0.2); hero();
    const camSet = snap => ctx.cam(mx() + 0.35, 2.3, MZ - 2.0, mx() - 0.15, 0.1, MZ + 0.7, snap);
    camSet(true); setStep('mix'); place();
    const badMix = why => { bad++; ctx.msg(why, 'bad', 1.2); kit.puff(new THREE.Vector3(-4.2, 0.4, 3.6), '#8a6038', 8, { spread: 0.6, up: 0.8 }); st();
      if (bad >= BAD) { ended = true; pend = { t: 0.9, f: () => ctx.lose('Too many batches went wrong. You made ' + brick + ' of ' + N + ' bricks.') }; } };
    return {
      start() { st(); ctx.msg('Brick 1: mix the mud', 'info', 1.4); },
      bot(lose) { if (pend || ended) return {};
        if (step === 'pack') return { press: !lose && packT > 0.12 };
        const c = (zone[0] + zone[1]) / 2; if (lose) return { press: Math.abs(nd - c) > 0.35 && nd > 0.05 && nd < 0.95 };
        return { press: Math.abs(nd - c) < ZW * 0.2 }; },
      action() { if (ended || pend) return;
        if (step === 'mix') { if (nd >= zone[0] && nd <= zone[1]) { ctx.msg('👌 Just right!', 'good'); fill = 0.25; setStep('pack'); kit.puff(new THREE.Vector3(mx(), 0.3, MZ), '#9a6a40', 6, { spread: 0.3, up: 0.6 }); }
          else badMix(nd < zone[0] ? 'Too dry! It will crumble. Mix again.' : 'Too wet! It will slump. Mix again.'); st(); return; }
        if (step === 'pack') { if (packT < 0.08) return; packT = 0; packs++; fill = Math.min(1, 0.25 + packs / PACK * 0.75); tamp.position.y = 0.25;
          kit.puff(new THREE.Vector3(mx(), 0.2, MZ), '#8a6038', 4, { spread: 0.3, up: 0.5 });
          if (packs >= PACK) { ctx.msg('Packed tight!', 'good', 0.8); setStep('lift'); newZone(); zone = [0.62 - ZW / 2, 0.62 + ZW / 2]; } st(); return; }
        if (step === 'lift') { if (nd >= zone[0] && nd <= zone[1]) {
            brick++; ctx.msg(['A perfect brick!', 'Nice and square!', 'That one is solid!'][brick % 3], 'good');
            const b = kit.mesh([P(BOX(0.56, 0.18, 0.42), '#9a6a40', 0, 0.09, 0), ...Array.from({ length: 6 }, () => P(BOX(0.12, 0.01, 0.01), '#e0c870', (ctx.rnd() - 0.5) * 0.45, 0.181, (ctx.rnd() - 0.5) * 0.3, 0, ctx.rnd() * 3, 0))]);
            b.position.set(mx(), 0, MZ); root.add(b); made.push(b); fill = 0; st();
            if (brick >= N) { ended = true; pend = { t: 1.0, f: () => ctx.win('You made ' + N + ' adobe bricks. Left in the sun for a few weeks, they dry hard enough to build a house.') }; return; }
            pend = { t: 0.7, f: () => { spot = brick; setStep('mix'); camSet(false); hero(); ctx.msg('Brick ' + (brick + 1) + ': mix the mud', 'info', 1.2); st(); } };
          } else { badMix(nd < zone[0] ? 'Too soon! The brick slumped. Make it again.' : 'Too late! It stuck in the mold. Make it again.'); if (!ended) { fill = 0; setStep('mix'); } st(); } }
      },
      update(dt, inp) {
        t += dt; packT += dt;
        tamp.position.y = lerp(tamp.position.y, 0.6, Math.min(1, dt * 10));
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } place(); tamp.position.y = 0.6; return; }
        if (ended) return;
        if (step === 'mix' || step === 'lift') { const sp = step === 'mix' ? (easy ? 0.55 : 0.75) : (easy ? 0.45 : 0.6); nd += nv * sp * dt; if (nd > 1) { nd = 1; nv = -1; } if (nd < 0) { nd = 0; nv = 1; }
          ctx.meter(nd, { zone, label: step === 'mix' ? 'too dry ← mix → too wet' : 'too soon ← lift → too late' }); }
        else ctx.meter(packs / PACK, { fill: true, label: 'Tap to pack! ' + packs + '/' + PACK });
        if (step === 'lift') mold.position.y = 0;
        place(); hero();
        st();
        if (t >= TIME) { ended = true; return ctx.lose('The sun went down before the bricks were done. You made ' + brick + ' of ' + N + '.'); }
      },
    };
  }
};
