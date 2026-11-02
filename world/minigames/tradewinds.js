// Mini-game s3 · Sail the Trade Winds (1492). Steer the Santa María into gusts of wind to keep the sails full; slide around
// calm patches. A date counter runs from 9 Sept (land lost from sight) to 2 a.m. 12 Oct (land sighted from the Pinta).
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';
import { makeRunner, scrollStrip } from './runner.js';

const START = Date.UTC(1492, 8, 9), END = Date.UTC(1492, 9, 12);
const SIGNS = [   // [fraction of the trip, message]
  [0.24, '🌿 Mid-September: floating seaweed everywhere! (the Sargasso Sea)'],
  [0.84, '🐦 Oct 7: flocks of birds fly southwest. Columbus turns to follow them.'],
  [0.95, '🌿 Oct 11: a green branch with berries floats by. Land must be near!'],
];
export default {
  title: 'Sail the Trade Winds', icon: '⛵', era: 'Columbus · 1492', act: 'Steer',
  intro: 'In 1492 <b>Columbus</b> sailed west with three ships: the <b>Santa María</b>, the <b>Pinta</b> and the <b>Niña</b>. Steady winds from the east, the <b>trade winds</b>, pushed them across the Atlantic.',
  how: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> (or ◀ ▶) into the <b>💨 wind gusts</b> to keep your sails full. Go around the glassy <b>calm patches</b>. If the wind runs out, the crew wants to turn back!',
  hint: 'Keep the wind bar from running out: steer early toward each gust, and slide around the smooth, dark calm patches.',
  fact: 'On <b>October 10</b> the tired crew grumbled and wanted to turn back. Two days later, at about <b>2 a.m. on October 12, 1492</b>, the lookout <b>Rodrigo de Triana</b> on the Pinta saw land: an island in the Bahamas.',
  build(ctx) {
    const { kit, root, easy } = ctx, LEN = easy ? 62 : 58, DECAY = easy ? 0.045 : 0.06;
    ctx.heroVisible(true); ctx.isolate();
    const sea = scrollStrip(ctx, { w: 14, z0: -12, z1: 34, rep: 4, y: 0.05, opacity: 0.45, draw: (x, w, h) => {
      x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 2.5; for (let i = 0; i < 30; i++) { const a = Math.random() * w, b = Math.random() * h; x.beginPath(); x.arc(a, b, 10 + Math.random() * 10, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } } });
    // a small nao (Santa María): hull, castles, three masts, square sails
    const ship = new THREE.Group(), sails = [];
    ship.add(kit.mesh([P(SPH(1, 12, 8), '#6a4526', 0, 0.35, 0, 0, 0, 0, 1.45, 0.95, 4.2), P(BOX(2.7, 0.3, 7.2), '#8a6238', 0, 1.15, 0), P(BOX(2.7, 1.1, 1.9), '#6a4526', 0, 1.7, -2.9), P(BOX(2.8, 0.12, 2.0), '#4a2e18', 0, 2.3, -2.9),
      P(BOX(2.2, 0.8, 1.3), '#6a4526', 0, 1.5, 3.0), P(BOX(2.8, 0.25, 7.6), '#3e2614', 0, 0.75, 0), P(CYL(0.1, 0.13, 7.4, 6), '#4a2e18', 0, 4.6, 0.3), P(CYL(0.07, 0.09, 4.6, 6), '#4a2e18', 0, 3.4, 2.7),
      P(CYL(0.06, 0.08, 4.2, 6), '#4a2e18', 0, 3.6, -2.7), P(CYL(0.05, 0.05, 3.6, 5), '#4a2e18', 0, 1.6, 4.9, 1.1), P(CYL(0.04, 0.04, 4.2, 5), '#3e2614', 0, 7.4, 0.3, 0, 0, Math.PI / 2), P(CYL(0.04, 0.04, 3.4, 5), '#3e2614', 0, 5.1, 2.7, 0, 0, Math.PI / 2)]));
    const sailGeo = (w, h) => { const g = new THREE.PlaneGeometry(w, h, 6, 4); return g; };
    for (const [w, h, y, z] of [[3.8, 3.2, 5.7, 0.3], [2.9, 2.4, 3.8, 2.7]]) { const m = new THREE.Mesh(sailGeo(w, h), kit.mat({ color: '#f2ead6', side: THREE.DoubleSide })); m.position.set(0, y, z + 0.1); m.castShadow = true; m.userData.base = m.geometry.attributes.position.array.slice(); ship.add(m); sails.push(m); }
    const lat = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 6.2, -2.4), new THREE.Vector3(0, 2.2, -1.4), new THREE.Vector3(0, 2.6, -3.9)]), kit.mat({ color: '#efe6d0', side: THREE.DoubleSide })); lat.geometry.computeVertexNormals(); ship.add(lat);
    root.add(ship); kit.ink(ship);
    const wakeM = kit.basic({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false });
    for (const sx of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 6), wakeM); m.rotation.x = -Math.PI / 2; m.rotation.z = sx * 0.25; m.position.set(sx * 1.2, 0.08, -6); ship.add(m); }
    // the other two ships sailing alongside, far off
    const mini = () => { const g = new THREE.Group(); g.add(kit.mesh([P(SPH(1, 10, 6), '#6a4526', 0, 0.3, 0, 0, 0, 0, 1.1, 0.8, 3.2), P(BOX(2, 0.8, 1.3), '#6a4526', 0, 1.2, -2.2), P(CYL(0.08, 0.1, 5.5, 6), '#4a2e18', 0, 3.4, 0.2)])); const s = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.6), kit.mat({ color: '#efe6d0', side: THREE.DoubleSide })); s.position.set(0, 4, 0.3); g.add(s); kit.ink(g); return g; };
    const pinta = mini(); pinta.position.set(-11, 0, 14); root.add(pinta); const nina = mini(); nina.position.set(12, 0, 6); nina.scale.setScalar(0.85); root.add(nina);
    const gustTex = kit.canvasTex(128, 64, (x, w, h) => { x.strokeStyle = '#fff'; x.lineCap = 'round'; for (const [y, l] of [[16, 90], [32, 110], [48, 80]]) { x.lineWidth = 7; x.beginPath(); x.moveTo(10, y); x.lineTo(10 + l * 0.7, y); x.arc(10 + l * 0.7, y - 8, 8, Math.PI / 2, -Math.PI, true); x.stroke(); } });
    const geoGust = () => { const s = new THREE.Sprite(kit.track(new THREE.SpriteMaterial({ map: gustTex, color: '#bff4ff', transparent: true, depthWrite: false }))); s.scale.set(2.4, 1.2, 1); const g = new THREE.Group(); g.add(s); s.position.y = 2.2; return g; };
    const calmMat = kit.basic({ color: '#1d4e6a', transparent: true, opacity: 0.55, depthWrite: false });
    const geoCalm = () => { const m = new THREE.Mesh(new THREE.CircleGeometry(1.6, 20), calmMat); m.rotation.x = -Math.PI / 2; m.scale.set(1, 1.5, 1); m.position.y = 0.09; const g = new THREE.Group(); g.add(m); return g; };
    const geoWeed = () => kit.mesh([P(SPH(0.5, 6, 4), '#b8962e', 0, 0.05, 0, 0, 0, 0, 1.8, 0.2, 1), P(SPH(0.4, 6, 4), '#9a7a24', 0.9, 0.05, 0.4, 0, 0, 0, 1.4, 0.2, 1), P(SPH(0.4, 6, 4), '#c0a040', -0.7, 0.05, -0.3, 0, 0, 0, 1.2, 0.2, 1.3)], { cast: false });
    const geoBirds = () => { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const b = kit.mesh([P(BOX(0.6, 0.04, 0.12), '#2a2a2a', 0, 0, 0, 0, 0, 0.3), P(BOX(0.6, 0.04, 0.12), '#2a2a2a', -0.5, 0, 0, 0, 0, -0.3)], { cast: false }); b.position.set(i * 0.9 - 2, 7 + (i % 3) * 0.6, i % 2 * 1.2); g.add(b); } return g; };
    const geoBranch = () => kit.mesh([P(CYL(0.04, 0.05, 1.6, 5), '#5a3a1e', 0, 0.1, 0, 0, 0, Math.PI / 2), P(SPH(0.25, 6, 4), '#3e8a34', 0.4, 0.2, 0), P(SPH(0.2, 6, 4), '#4a9a3a', -0.3, 0.2, 0.1), P(SPH(0.06, 5, 4), '#c0242a', 0.5, 0.35, 0.1), P(SPH(0.06, 5, 4), '#c0242a', 0.3, 0.38, -0.1)], { cast: false });
    const land = new THREE.Group(); land.add(kit.mesh([P(SPH(1, 14, 6), '#d8c890', 0, -0.3, 0, 0, 0, 0, 16, 1.4, 5), P(SPH(1, 12, 6), '#3e7a3a', 0, 0.2, 1, 0, 0, 0, 12, 2.6, 3.5), P(CYL(0.12, 0.16, 3.4, 5), '#6a4a2a', -3, 2, 0), P(CONE(1.6, 0.7, 7), '#2e7a32', -3, 3.8, 0), P(CYL(0.12, 0.16, 3.0, 5), '#6a4a2a', 4, 1.8, 0.5), P(CONE(1.5, 0.6, 7), '#2e7a32', 4, 3.4, 0.5)]));
    land.visible = false; root.add(land); kit.ink(land);
    let wind = 1, sT = 0.6, ended = false, si = 0, dayShown = '';
    const R = makeRunner(ctx, { W: 3.6, speed: easy ? 7.5 : 8.5, lat: 3.6, player: ship, py: () => 0, pr: 1.0, lean: 0.5,
      spawn(dt, sp, R) {
        const f = R.t / LEN;
        if (f > 0.97) { if (!land.visible) { land.visible = true; land.position.set(0, 0, 34); } land.position.z = Math.max(20, land.position.z - sp * dt * 0.5); return; }
        if (si < SIGNS.length && f >= SIGNS[si][0]) { const [, m] = SIGNS[si]; const k = si++; ctx.msg(m, 'info', 3.2);
          if (k === 0) for (let i = 0; i < 8; i++) R.add(geoWeed(), { x: (ctx.rnd() - 0.5) * 12, z: 22 + i * 3, kind: 'deco' });
          if (k === 1) R.add(geoBirds(), { x: 0, z: 30, kind: 'deco' });
          if (k === 2) R.add(geoBranch(), { x: R.px + 2.2, z: 30, kind: 'deco', bob: 0.06 }); }
        sT -= dt; if (sT <= 0) { sT = (easy ? 0.95 : 1.05) + ctx.rnd() * 0.5; const x = (ctx.rnd() - 0.5) * 7.2;
          if (ctx.rnd() < 0.62 || R.t < 3) R.add(geoGust(), { x, z: 33, r: 0.9, kind: 'good', bob: 0.25 }); else R.add(geoCalm(), { x, z: 33, r: 1.2, rz: 1.6, kind: 'bad', jumpable: false }); }
      },
      onGood(it) { wind = Math.min(1, wind + (easy ? 0.3 : 0.25)); kit.puff(new THREE.Vector3(it.x, 2.5, 0.5), '#dff8ff', 8, { up: 0.6, grav: 0 }); ctx.msg('💨 Full sails!', 'good', 0.6); },
      onBad() { wind = Math.max(0, wind - 0.22); ctx.msg('😶 Calm water: the sails go slack.', 'bad', 1); },
    });
    R.bumpT = 0;
    const date = () => { const d = new Date(START + (END - START) * clamp(R.t / LEN, 0, 1)); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); };
    const st = () => { const d = date(); ctx.status('📅 ' + d + ', 1492'); if (!ended) ctx.meter(wind, { fill: true, zone: [0, 0.2], label: '💨 Wind in the sails' }); };
    ctx.placeHero(0, 1.3, -1.2, 0); ctx.cam(0, 6.5, -12.5, 0, 2.6, 10, true);
    let pt = 0, grumbled = false;
    return {
      start() { st(); ctx.msg('Sept 9, 1492: land drops out of sight. Sail west!', 'info', 2.4); },
      bot: lose => R.bot(lose),
      action() { ctx.msg('Use ◀ ▶ (A / S) to steer into the gusts.', 'info', 1.4); },
      idle(dt) { pt += dt; ship.position.y = Math.sin(pt * 1.4) * 0.08; },
      update(dt, inp) {
        if (ended) return; pt += dt;
        R.bumpT = 0; R.speed = (easy ? 7.5 : 8.5) * (0.45 + 0.55 * wind);
        R.update(dt, inp); sea.tick(R.dist);
        wind = Math.max(0, wind - DECAY * dt); st();
        ship.rotation.x = Math.sin(pt * 1.3) * 0.03; ship.rotation.z += Math.sin(pt * 1.1) * 0.04; ship.position.y = Math.sin(pt * 1.4) * 0.08;
        for (const s of sails) { const a = s.geometry.attributes.position, b = s.userData.base, puff = 0.25 + 0.55 * wind; for (let i = 0; i < a.count; i++) { const x = b[i * 3], y = b[i * 3 + 1], w = s.geometry.parameters.width / 2, h = s.geometry.parameters.height / 2; a.setZ(i, puff * (1 - (x / w) ** 2) * (1 - 0.6 * (y / h) ** 2) + Math.sin(pt * 3 + y) * 0.03 * (1 - wind)); } a.needsUpdate = true; }
        for (const s of [pinta, nina]) s.position.y = Math.sin(pt * 1.2 + s.position.x) * 0.1;
        ctx.placeHero(R.px, 1.3 + ship.position.y, -1.2, 0);
        if (wind < 0.2 && !grumbled) { grumbled = true; ctx.msg('😟 The crew grumbles... catch some wind!', 'bad', 1.8); } if (wind > 0.35) grumbled = false;
        if (wind <= 0) { ended = true; return ctx.lose('The wind died, and the tired crew wanted to turn back. On the real voyage, Columbus kept sailing west.'); }
        if (R.t >= LEN) { ended = true; ctx.msg('🏝️ ¡Tierra! Land!', 'good', 2); return ctx.win('Oct 12, 1492, 2 a.m.: ¡Tierra! Land, 33 days after the last land dropped out of sight!'); }
      },
    };
  }
};
