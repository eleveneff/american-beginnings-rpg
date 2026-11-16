// Mini-game s9 · The Midnight Ride. Steer the Bay Road at night, dodge British patrols,
// and get the alarm through to Lexington and then Concord.
// History: on the night of April 18, 1775, Paul Revere and William Dawes rode out of Boston.
// Dr. Samuel Prescott joined them. Revere was captured in Lincoln; Prescott reached Concord.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, person } from './lib.js';
import { makeRunner, scrollStrip } from './runner.js';

export default {
  title: 'The Midnight Ride', icon: '🐎', era: 'April 18–19, 1775', act: 'Steer past the patrol',
  intro: 'On the night of <b>April 18, 1775</b>, <b>Paul Revere</b> and <b>William Dawes</b> rode to warn the countryside that British regulars were marching to <b>Concord</b>. Dr. <b>Samuel Prescott</b> joined them. Revere was captured; Prescott got through.',
  how: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> (or ◀ ▶) to stay on the road and wake <b>houses</b> with the alarm. Dodge the <b>redcoat patrols</b>. Reach Lexington, then Concord!',
  tryit: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> toward the glowing houses. Slide around a redcoat patrol — do not ride into the lanterns.',
  hint: 'Look ahead, not at the horse. Move early toward the next house, and slide around a patrol before it gets close. You can be stopped 3 times.',
  fact: 'The ride was a team, not one man. Revere was captured in Lincoln and lost his horse. Dawes escaped but did not reach Concord. Prescott got through and raised the alarm there.',
  build(ctx) {
    const { kit, root, easy } = ctx, NEED = easy ? 7 : 10, LIVES = easy ? 5 : 3, LEN = easy ? 64 : 58;
    ctx.heroVisible(false);
    ctx.isolate([], ['sky']);
    // night ground and a dark sky disc so the level scenery cannot leak in
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 90), kit.mat({ color: '#1a2418' })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; root.add(ground);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 16, 10), kit.mat({ color: '#0b1220', side: THREE.BackSide, fog: false })); sky.position.y = 10; root.add(sky);
    const moon = kit.mesh([P(SPH(1.3, 10, 8), '#e8e4c8', 0, 0, 0)], { cast: false }); moon.position.set(-10, 16, 18); root.add(moon);
    const road = scrollStrip(ctx, { w: 6.6, z0: -12, z1: 34, rep: 6, follow: false, y: 0.05, draw: (x, w, h) => {
      x.fillStyle = '#3a2e22'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 360; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(20,16,10,.4)' : 'rgba(90,70,48,.3)'; x.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 6, 2 + Math.random() * 4); }
      x.fillStyle = '#152010'; x.fillRect(0, 0, 12, h); x.fillRect(w - 12, 0, 12, h);
    } });
    const horse = new THREE.Group();
    const body = kit.mesh([P(CYL(0.36, 0.34, 1.5, 10), '#2a1a10', 0, 1.25, 0, Math.PI / 2), P(CYL(0.16, 0.22, 0.8, 8), '#2a1a10', 0, 1.7, 0.78, -0.75), P(BOX(0.24, 0.26, 0.56), '#1a1008', 0, 1.98, 1.14, 0.35),
      P(BOX(0.08, 0.5, 0.24), '#1a1008', 0, 1.88, 0.66, -0.75), P(CONE(0.07, 0.2, 4), '#1a1008', 0.08, 2.18, 0.96), P(CONE(0.07, 0.2, 4), '#1a1008', -0.08, 2.18, 0.96), P(CYL(0.05, 0.1, 0.7, 5), '#1a1008', 0, 1.15, -0.95, 0.6),
      P(BOX(0.74, 0.08, 0.56), '#3a2414', 0, 1.6, -0.05)]);
    horse.add(body); const legs = [];
    for (const [x, z] of [[0.2, 0.55], [-0.2, 0.55], [0.2, -0.55], [-0.2, -0.55]]) { const l = new THREE.Group(); l.position.set(x, 1.0, z); l.add(kit.mesh([P(BOX(0.13, 0.95, 0.15), '#1a1008', 0, -0.48, 0), P(BOX(0.15, 0.1, 0.17), '#0a0806', 0, -0.95, 0.01)])); horse.add(l); legs.push(l); }
    const rider = person(kit, { coat: '#2a2a38', pants: '#1e1a14', hat: 'tricorn', skin: '#e2b48c' }); rider.position.set(0, 1.18, -0.05); rider.userData.armL.rotation.x = -0.9; rider.userData.armR.rotation.x = -0.9; horse.add(rider);
    root.add(horse); kit.ink(horse);
    const blob = kit.blob(0.9, 0.35); blob.scale.set(0.8, 1.6, 1); horse.add(blob); blob.position.y = 0.06;

    const geoHouse = () => {
      const g = new THREE.Group();
      g.add(kit.mesh([P(BOX(2.2, 1.8, 1.8), '#3a3228', 0, 0.9, 0), P(CONE(1.8, 1.1, 4), '#2a2218', 0, 2.35, 0, 0, Math.PI / 4), P(BOX(0.4, 0.5, 0.06), '#3a2a10', 0, 1.0, 0.92)]));
      const win = kit.mesh([P(BOX(0.36, 0.44, 0.05), '#3a2a10', 0, 0, 0)], { cast: false }); win.position.set(0, 1.0, 0.95); g.add(win); g.userData.win = win;
      g.add(kit.blob(1.0, 0.4)); g.children[g.children.length - 1].position.y = 0.04;
      return g;
    };
    const geoPatrol = () => {
      const g = new THREE.Group();
      const man = person(kit, { coat: '#b22222', pants: '#e8e2d2', hat: 'tricorn', skin: '#e0b890' }); man.scale.setScalar(0.95); g.add(man);
      const lamp = kit.mesh([P(CYL(0.05, 0.05, 0.7, 5), '#5a4634', 0, 0.9, 0), P(SPH(0.14, 6, 5), '#f2d27a', 0, 1.35, 0)], { cast: false });
      lamp.position.set(0.35, 0.2, 0.1); g.add(lamp);
      g.add(kit.blob(0.45, 0.3));
      return g;
    };
    const geoTree = (r) => kit.mesh([P(CYL(0.15, 0.2, 1.6, 6), '#1a120c', 0, 0.8, 0), P(CONE(1.3 * r, 2.6 * r, 7), '#0e2a14', 0, 2.3, 0), P(CONE(1.0 * r, 2.0 * r, 7), '#16361c', 0, 3.2, 0)]);
    const geoFence = () => kit.mesh([P(BOX(0.1, 0.9, 0.1), '#3a2a18', 0, 0.45, -1.6), P(BOX(0.1, 0.9, 0.1), '#3a2a18', 0, 0.45, 1.6), P(BOX(0.08, 0.08, 3.4), '#4a3a22', 0, 0.75, 0, 0.1), P(BOX(0.08, 0.08, 3.4), '#4a3a22', 0, 0.42, 0, -0.08)]);
    const town = new THREE.Group(); root.add(town); town.visible = false;
    town.add(kit.mesh([P(BOX(4, 3, 3), '#4a3a2a', -4.0, 1.5, 0), P(CONE(3.0, 1.6, 4), '#2a2218', -4.0, 3.8, 0, 0, Math.PI / 4), P(BOX(3.6, 2.6, 3), '#5a4a38', 4.0, 1.3, 0), P(CONE(2.7, 1.4, 4), '#2a2218', 4.0, 3.3, 0, 0, Math.PI / 4), P(BOX(0.12, 4.4, 0.12), '#3a2a18', 0, 2.2, -1.4), P(BOX(1.2, 0.8, 0.08), '#efe4c8', 0, 4.0, -1.4)]));
    kit.ink(town);

    let got = 0, bumps = 0, spawnT = 0.9, decoT = 0, ended = false, n = 0, toldCapture = false, lexDone = false;
    const R = makeRunner(ctx, { W: 2.4, speed: easy ? 8.2 : 9.6, lat: 5.0, player: horse, py: () => 0, pr: 0.4,
      spawn(dt, sp, R) {
        if (R.t > LEN - 4) { if (!town.visible) { town.visible = true; town.position.set(0, ctx.gy(0, 34), 34); ctx.msg('Concord is just ahead!', 'info', 1.2); } town.position.z -= sp * dt; return; }
        spawnT -= dt; decoT -= dt;
        // first stretch is slower and more generous (teach-by-doing), then tighter patrols
        const late = R.t > (easy ? 22 : 18);
        if (spawnT <= 0) { n++; spawnT = (late ? (easy ? 1.05 : 0.85) : (easy ? 1.35 : 1.15)) + ctx.rnd() * 0.4;
          const x = (ctx.rnd() - 0.5) * 4.6, bad = ctx.rnd() < (late ? (easy ? 0.48 : 0.56) : (easy ? 0.32 : 0.38)) && R.t > 2.2;
          if (bad) R.add(geoPatrol(), { x, z: 33, y: 0, r: 0.5, kind: 'bad', what: 'patrol' });
          else { const h = geoHouse(); R.add(h, { x, z: 33, y: 0, r: 0.7, kind: 'good', what: 'house', lit: false }); }
        }
        if (decoT <= 0) { decoT = 0.65 + ctx.rnd() * 0.7; const side = ctx.rnd() < 0.5 ? 1 : -1, x = side * (5.0 + ctx.rnd() * 3);
          R.add(ctx.rnd() < 0.3 ? geoFence() : geoTree(0.8 + ctx.rnd() * 0.5), { x, z: 34, y: 0, kind: 'deco' }); }
      },
      onGood(it) {
        got++; if (it.obj && it.obj.userData.win) try { it.obj.userData.win.material = kit.mat({ color: '#f2d27a' }); } catch (e) {}
        kit.puff(new THREE.Vector3(it.x, 1.2, 0.3), '#fff6d8', 8, { up: 1.4 }); ctx.msg('The house is awake! ' + got + '/' + NEED, 'good', 0.7); ctx.sfx('hit');
        if (!lexDone && got >= Math.ceil(NEED / 2)) { lexDone = true; ctx.msg('Lexington is warned! Ride on toward Concord.', 'info', 1.6); }
      },
      onBad(it) {
        kit.puff(new THREE.Vector3(it.x, 0.4, 0.4), '#f2d27a', 10, { spread: 0.8, up: 1.2 });
        if (ctx.grace('A patrol steps into the road! Steer around the lantern — this first stop does not count.')) return;
        bumps++; ctx.msg('A patrol! Ride around the lantern.', 'bad', 0.9); ctx.flash('bad'); ctx.sfx('miss');
      },
    });
    for (let z = -6; z < 34; z += 2.2) { const side = (z * 7 | 0) % 2 ? 1 : -1, x = side * (5.0 + ((z * 13) % 3 + 3) % 3); R.add(geoTree(0.9), { x, z, y: 0, kind: 'deco' }); }
    const mile = kit.mesh([P(BOX(0.18, 1.6, 0.12), '#6a5a3a', 0, 0.8, 0), P(BOX(0.95, 0.5, 0.08), '#d8c9a0', 0, 1.45, 0.04)]);
    const mileLab = kit.label('Concord →', { size: 1.2, bg: 'rgba(20,16,10,.85)', color: '#f2ead6', font: 'bold 36px Trebuchet MS, sans-serif' }); mile.add(mileLab); mileLab.position.set(0, 2.15, 0);
    R.add(mile, { x: 4.0, z: 20, y: 0, kind: 'deco' });
    const st = () => ctx.status('🏠 ' + got + '/' + NEED + ' · ❤️ ' + Math.max(0, LIVES - bumps) + ' · 🏁 ' + Math.min(100, Math.round(R.t / LEN * 100)) + '%');
    ctx.cam(0, 3.6, -6.6, 0, 1.2, 9, true);
    let gal = 0;
    return {
      start() { st(); ctx.actLabel('Steer past the patrol'); ctx.prompt('Steer with A/S toward the glowing houses. Slide around a redcoat patrol.', 3.2); ctx.msg('Ride for Lexington — then Concord!', 'info', 1.5); },
      bot: lose => R.bot(lose),
      action() { if (!ended && R.jump && R.jump()) { kit.puff(new THREE.Vector3(R.px, 0.1, -0.6), '#b89a70', 6, { up: 0.8 }); ctx.sfx('jump'); } },
      update(dt, inp) {
        if (ended) return; R.update(dt, inp); road.tick(R.dist); st();
        gal += dt * 11; legs.forEach((l, i) => l.rotation.x = Math.sin(gal + (i < 2 ? 0 : Math.PI) + (i % 2) * 0.6) * 0.6); body.rotation.x = Math.sin(gal * 2) * 0.03;
        if (!toldCapture && R.t > LEN * 0.45) { toldCapture = true; ctx.msg('A patrol has taken Revere! Ride on with Prescott toward Concord.', 'info', 2.0); }
        if (bumps >= LIVES) { ended = true; return ctx.lose('Too many patrols! The alarm did not get through. You woke ' + got + ' houses.'); }
        if (R.t >= LEN) { ended = true; return got >= NEED ? ctx.win('Prescott got through! You woke ' + got + ' houses, and Concord is warned.') : ctx.lose('You reached Concord, but only ' + got + ' houses were warned. You need ' + NEED + '.'); }
      },
    };
  }
};
