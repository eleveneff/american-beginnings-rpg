// Mini-game s6 · Post Rider. Gallop the post road, steer to grab letters, dodge ruts and stumps.
// History: in 1753 Benjamin Franklin and William Hunter became joint deputy postmasters general for the colonies.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, person } from './lib.js';
import { makeRunner, scrollStrip } from './runner.js';

export default {
  title: 'Post Rider', icon: '✉️', era: 'The Thirteen Colonies · 1753', act: 'Jump',
  intro: 'In <b>1753</b> <b>Benjamin Franklin</b> became one of the two deputy postmasters general for the colonies. Post riders carried letters and newspapers between towns on horseback.',
  how: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> (or ◀ ▶) to grab <b>✉️ letters</b>. Dodge mud ruts and stumps, or press <kbd>E</kbd> to jump them. Collect enough letters before you reach town!',
  hint: 'Look ahead, not at the horse. Move early toward the letters, and slide around a stump before it gets close, or press E just before it to jump. You can bump 3 times.',
  fact: 'Franklin traveled the colonies to inspect post offices and post roads. He worked to make the mail faster and more regular, so colonists in different colonies could share news, newspapers and business letters.',
  build(ctx) {
    const { kit, root, easy } = ctx, NEED = easy ? 7 : 10, LIVES = easy ? 5 : 3, LEN = easy ? 60 : 55;
    ctx.heroVisible(false);
    const road = scrollStrip(ctx, { w: 7.2, z0: -12, z1: 34, rep: 6, follow: true, y: 0.05, draw: (x, w, h) => {
      x.fillStyle = '#9b7a52'; x.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(80,58,34,.35)' : 'rgba(190,160,116,.35)'; x.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 6, 2 + Math.random() * 4); }
      x.fillStyle = 'rgba(70,50,28,.45)'; x.fillRect(w * 0.3, 0, 10, h); x.fillRect(w * 0.66, 0, 10, h); x.fillStyle = '#6f8a3c'; x.fillRect(0, 0, 14, h); x.fillRect(w - 14, 0, 14, h); } });
    // horse + rider
    const horse = new THREE.Group();
    const body = kit.mesh([P(CYL(0.36, 0.34, 1.5, 10), '#6b4126', 0, 1.25, 0, Math.PI / 2), P(CYL(0.16, 0.22, 0.8, 8), '#6b4126', 0, 1.7, 0.78, -0.75), P(BOX(0.24, 0.26, 0.56), '#5f391f', 0, 1.98, 1.14, 0.35),
      P(BOX(0.08, 0.5, 0.24), '#2a1a10', 0, 1.88, 0.66, -0.75), P(CONE(0.07, 0.2, 4), '#5f391f', 0.08, 2.18, 0.96), P(CONE(0.07, 0.2, 4), '#5f391f', -0.08, 2.18, 0.96), P(CYL(0.05, 0.1, 0.7, 5), '#2a1a10', 0, 1.15, -0.95, 0.6),
      P(BOX(0.74, 0.08, 0.56), '#3a2414', 0, 1.6, -0.05), P(BOX(0.22, 0.34, 0.36), '#7a5a2a', 0.42, 1.36, -0.25), P(BOX(0.22, 0.34, 0.36), '#7a5a2a', -0.42, 1.36, -0.25), P(BOX(0.24, 0.06, 0.3), '#b8b0a0', 0.43, 1.52, -0.25)]);
    horse.add(body); const legs = [];
    for (const [x, z] of [[0.2, 0.55], [-0.2, 0.55], [0.2, -0.55], [-0.2, -0.55]]) { const l = new THREE.Group(); l.position.set(x, 1.0, z); l.add(kit.mesh([P(BOX(0.13, 0.95, 0.15), '#5f391f', 0, -0.48, 0), P(BOX(0.15, 0.1, 0.17), '#2a1a10', 0, -0.95, 0.01)])); horse.add(l); legs.push(l); }
    const rider = person(kit, { coat: '#2f4a7a', pants: '#e0d6bd', hat: 'tricorn', skin: '#e2b48c' }); rider.position.set(0, 1.18, -0.05); rider.userData.armL.rotation.x = -0.9; rider.userData.armR.rotation.x = -0.9; horse.add(rider);
    root.add(horse); kit.ink(horse);
    const blob = kit.blob(0.9, 0.35); blob.scale.set(0.8, 1.6, 1); horse.add(blob); blob.position.y = 0.06;
    // things on the road
    const geoLetter = () => { const g = new THREE.Group(); g.add(kit.mesh([P(BOX(0.6, 0.42, 0.05), '#f2ead6', 0, 0, 0), P(CYL(0.08, 0.08, 0.04, 10), '#b3221a', 0, 0, 0.04, Math.PI / 2)], { cast: false })); g.add(kit.blob(0.35, 0.25)); g.children[1].position.y = -0.95; return g; };
    const geoStump = () => kit.mesh([P(CYL(0.32, 0.4, 0.5, 9), '#6a4a2a', 0, 0.25, 0), P(CYL(0.3, 0.3, 0.04, 9), '#c8a26c', 0, 0.51, 0), P(BOX(0.14, 0.12, 0.6), '#5a3a1e', 0.3, 0.06, 0.2, 0, 0.6)]);
    const geoRut = () => { const m = kit.mesh([P(CYL(0.62, 0.62, 0.04, 12), '#4a3420', 0, 0.06, 0, 0, 0, 0, 1, 1, 1.5), P(CYL(0.4, 0.4, 0.05, 10), '#5b5040', 0, 0.07, 0.1, 0, 0, 0, 1, 1, 1.4)], { cast: false }); return m; };
    const geoTree = (r) => kit.mesh([P(CYL(0.15, 0.2, 1.6, 6), '#5a3a1e', 0, 0.8, 0), P(CONE(1.3 * r, 2.6 * r, 7), '#2f6a32', 0, 2.3, 0), P(CONE(1.0 * r, 2.0 * r, 7), '#3a7a3a', 0, 3.2, 0)]);
    const geoFence = () => kit.mesh([P(BOX(0.1, 0.9, 0.1), '#7a5a3a', 0, 0.45, -1.6), P(BOX(0.1, 0.9, 0.1), '#7a5a3a', 0, 0.45, 1.6), P(BOX(0.08, 0.08, 3.4), '#8a6a44', 0, 0.75, 0, 0.1), P(BOX(0.08, 0.08, 3.4), '#8a6a44', 0, 0.42, 0, -0.08)]);
    const town = new THREE.Group(); root.add(town); town.visible = false;
    town.add(kit.mesh([P(BOX(4, 3, 3), '#9a4a32', -4.5, 1.5, 0), P(CONE(3.0, 1.6, 4), '#4a3a32', -4.5, 3.8, 0, 0, Math.PI / 4), P(BOX(3.6, 2.6, 3), '#d8cbb0', 4.5, 1.3, 0), P(CONE(2.7, 1.4, 4), '#5a4a3a', 4.5, 3.3, 0, 0, Math.PI / 4), P(BOX(0.1, 3.2, 0.1), '#5a3a1e', -2.2, 1.6, -1.6), P(BOX(1.4, 0.7, 0.06), '#e8d9a8', -2.2, 2.8, -1.6)]));
    kit.ink(town);
    let got = 0, bumps = 0, spawnT = 0.8, decoT = 0, ended = false, n = 0;
    const R = makeRunner(ctx, { W: 2.5, speed: easy ? 9 : 10.5, lat: 5.2, player: horse, py: (x, z) => ctx.gy(x, z), pr: 0.4,
      spawn(dt, sp, R) {
        if (R.t > LEN - 4) { if (!town.visible) { town.visible = true; town.position.set(0, ctx.gy(0, 34), 34); } town.position.z -= sp * dt; return; }
        spawnT -= dt; decoT -= dt;
        if (spawnT <= 0) { n++; spawnT = (easy ? 1.15 : 0.95) + ctx.rnd() * 0.5;
          const x = (ctx.rnd() - 0.5) * 5, bad = ctx.rnd() < (easy ? 0.42 : 0.5) && R.t > 2.5;
          if (bad) { const st = ctx.rnd() < 0.5; R.add(st ? geoStump() : geoRut(), { x, z: 33, y: ctx.gy(x, 33), r: st ? 0.4 : 0.55, kind: 'bad', what: st ? 'stump' : 'rut' }); }
          else R.add(geoLetter(), { x, z: 33, y: ctx.gy(x, 33) + 1.0, r: 0.45, kind: 'good', bob: 0.12, spin: 2.2 }); }
        if (decoT <= 0) { decoT = 0.7 + ctx.rnd() * 0.8; const side = ctx.rnd() < 0.5 ? 1 : -1, x = side * (5.2 + ctx.rnd() * 3);
          R.add(ctx.rnd() < 0.3 ? geoFence() : geoTree(0.8 + ctx.rnd() * 0.5), { x, z: 34, y: ctx.gy(x, 34), kind: 'deco' }); }
      },
      onGood(it) { got++; kit.puff(new THREE.Vector3(it.x, it.obj.position.y, 0.3), '#fff6d8', 8, { up: 1.4 }); ctx.msg('✉️ ' + got + '/' + NEED, 'good', 0.7); },
      onBad(it) { bumps++; kit.puff(new THREE.Vector3(it.x, ctx.gy(it.x, 0) + 0.3, 0.4), it.what === 'rut' ? '#5a4028' : '#9a7a4a', 10, { spread: 0.8, up: 1.2 }); ctx.msg(it.what === 'rut' ? 'Splash! A muddy rut.' : 'Bump! A stump.', 'bad', 0.9); },
    });
    // fill the roadside at the start so it is not empty
    for (let z = -6; z < 34; z += 2.2) { const side = (z * 7 | 0) % 2 ? 1 : -1, x = side * (5.2 + ((z * 13) % 3 + 3) % 3); R.add(geoTree(0.9), { x, z, y: ctx.gy(x, z), kind: 'deco' }); }
    const st = () => ctx.status('✉️ ' + got + '/' + NEED + ' · ❤️ ' + Math.max(0, LIVES - bumps) + ' · 🏁 ' + Math.min(100, Math.round(R.t / LEN * 100)) + '%');
    ctx.cam(0, ctx.gy(0, -6) + 3.6, -6.6, 0, 1.2, 9, true);
    let gal = 0;
    return {
      start() { st(); ctx.msg('Ride for Philadelphia!', 'info', 1.4); },
      bot: () => R.bot(),
      action() { if (!ended && R.jump()) kit.puff(new THREE.Vector3(R.px, ctx.gy(R.px, 0) + 0.1, -0.6), '#b89a70', 6, { up: 0.8 }); },
      update(dt, inp) {
        if (ended) return; R.update(dt, inp); road.tick(R.dist); st();
        gal += dt * 11; legs.forEach((l, i) => l.rotation.x = Math.sin(gal + (i < 2 ? 0 : Math.PI) + (i % 2) * 0.6) * 0.6); body.rotation.x = Math.sin(gal * 2) * 0.03;
        if (bumps >= LIVES + 0) { ended = true; return ctx.lose('Too many bumps! The mail bags need a gentler ride. You had ' + got + ' letters.'); }
        if (R.t >= LEN) { ended = true; return got >= NEED ? ctx.win('You delivered ' + got + ' letters to town!') : ctx.lose('You reached town with ' + got + ' letters. You need ' + NEED + '.'); }
      },
    };
  }
};
