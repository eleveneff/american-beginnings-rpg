// Mini-game s4 · Birchbark Canoe. Paddle upriver dodging rocks and logs; at the rapids, press E to portage (carry the canoe).
// History: Wendat, Algonquin and Innu birchbark canoes; French ships could not pass the Lachine Rapids; Champlain (Quebec 1608)
// travelled inland by canoe with Native guides and allies.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';
import { makeRunner, scrollStrip } from './runner.js';

export default {
  title: 'Paddle the St. Lawrence', icon: '🛶', era: 'New France · 1608–1615', act: 'Portage',
  intro: '<b>Wendat</b>, <b>Algonquin</b> and <b>Innu</b> people built canoes of <b>birchbark</b> sewn over a light cedar frame. A canoe was strong enough for heavy loads and light enough for two people to carry.',
  how: 'Steer with <kbd>A</kbd> / <kbd>S</kbd> (or ◀ ▶) around rocks and logs. When the <b>⚠️ Rapids</b> sign appears, press <kbd>E</kbd> to <b>portage</b>: carry the canoe around them on land.',
  tryit: 'Steer with <kbd>A</kbd> / <kbd>S</kbd>. When you see the yellow rapids sign, press <kbd>E</kbd> to portage.',
  hint: 'Stay in the open water between the rocks, and steer early. When the yellow rapids sign comes, press E before you reach the white water.',
  fact: 'French ships could not sail past the <b>Lachine Rapids</b> near today\'s Montreal. <b>Samuel de Champlain</b>, who founded Quebec in <b>1608</b>, traveled farther inland in canoes with Native guides and allies, carrying them around rapids just like you did.',
  build(ctx) {
    const { kit, root, easy } = ctx, LIVES = easy ? 5 : 3, LEN = easy ? 55 : 50, RAP = [LEN * 0.42, LEN * 0.8];
    ctx.heroVisible(false); ctx.isolate();
    const basin = new THREE.Mesh(new THREE.CircleGeometry(80, 24), kit.mat({ color: '#3a6a88' })); basin.rotation.x = -Math.PI / 2; basin.position.y = -0.02; root.add(basin);
    const river = scrollStrip(ctx, { w: 9, z0: -12, z1: 34, rep: 5, y: 0.06, opacity: 0.7, draw: (x, w, h) => {
      x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 3; for (let i = 0; i < 26; i++) { const a = Math.random() * w, b = Math.random() * h; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + 8, b + 10, a, b + 22 + Math.random() * 20); x.stroke(); } } });
    // the canoe, with two paddlers
    const canoe = new THREE.Group(); const hull = new THREE.Group(); canoe.add(hull);
    const half = () => new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    hull.add(kit.mesh([P(half(), '#e6d8b8', 0, 0.36, 0, 0, 0, 0, 0.5, 0.34, 2.3), P(CYL(0.03, 0.03, 4.4, 5), '#5a3a1e', 0.47, 0.37, 0, Math.PI / 2), P(CYL(0.03, 0.03, 4.4, 5), '#5a3a1e', -0.47, 0.37, 0, Math.PI / 2),
      P(BOX(0.1, 0.34, 0.3), '#e6d8b8', 0, 0.48, 2.2, 0.35), P(BOX(0.1, 0.34, 0.3), '#e6d8b8', 0, 0.48, -2.2, -0.35), P(BOX(0.11, 0.06, 0.32), '#3a2414', 0, 0.62, 2.28, 0.35), P(BOX(0.11, 0.06, 0.32), '#3a2414', 0, 0.62, -2.28, -0.35),
      P(BOX(0.94, 0.03, 0.06), '#8a6238', 0, 0.37, 0.9), P(BOX(0.94, 0.03, 0.06), '#8a6238', 0, 0.37, -0.9), P(BOX(0.5, 0.32, 0.6), '#7a5a3a', 0, 0.36, 0.1), P(BOX(0.42, 0.2, 0.5), '#a07a4a', 0, 0.58, 0.1),
      P(BOX(0.012, 0.25, 4.0), '#b8a888', 0.0, 0.22, 0, 0, 0, 0, 1, 1, 1)], { cast: true, mat: kit.mat({ vertexColors: true, side: THREE.DoubleSide }) }));
    const pads = []; for (const [z, c] of [[1.5, '#7a4a2a'], [-1.5, '#4a5a3a']]) { const p = person(kit, { coat: c, skin: '#a8724a', hair: '#1a120a', pants: '#5a3a24' }); p.position.set(0, -0.15, z); p.scale.setScalar(0.95); const pd = kit.mesh([P(CYL(0.025, 0.025, 1.4, 5), '#8a6238', 0, 0, 0), P(BOX(0.16, 0.42, 0.03), '#8a6238', 0, -0.8, 0)]); pd.position.set(0, 0.95, 0.25); p.add(pd); p.userData.pd = pd; hull.add(p); pads.push(p); }
    root.add(canoe); kit.ink(canoe);
    const wake = []; for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 3), kit.basic({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(i ? 0.5 : -0.5, 0.08, -3.6); m.rotation.z = i ? -0.2 : 0.2; canoe.add(m); wake.push(m); }
    const geoRock = () => { const g = new THREE.Group(); g.add(kit.mesh([P(new THREE.DodecahedronGeometry(0.75, 0), '#7d7a74', 0, 0.15, 0, 0.3, 0.5, 0, 1, 0.7, 1), P(new THREE.DodecahedronGeometry(0.4, 0), '#8e8b84', 0.5, 0.05, 0.3, 0.1, 1, 0)])); const f = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.15, 16), kit.basic({ color: '#fff', transparent: true, opacity: 0.6, depthWrite: false })); f.rotation.x = -Math.PI / 2; f.position.y = 0.08; g.add(f); return g; };
    const geoLog = () => kit.mesh([P(CYL(0.22, 0.22, 2.4, 8), '#5a3e24', 0, 0.06, 0, 0, 0, Math.PI / 2), P(CYL(0.2, 0.2, 0.02, 8), '#b08a5a', 1.21, 0.06, 0, 0, 0, Math.PI / 2), P(BOX(0.08, 0.08, 0.6), '#4a3220', 0.4, 0.2, 0.2, 0, 0.8)]);
    const geoSpruce = s => kit.mesh([P(CYL(0.12, 0.16, 1.2, 5), '#4a3220', 0, 0.6, 0), P(CONE(1.0 * s, 2.4 * s, 7), '#1f4a2e', 0, 1.9 * s, 0), P(CONE(0.75 * s, 1.8 * s, 7), '#2a5a36', 0, 2.8 * s, 0), P(CONE(0.45 * s, 1.2 * s, 7), '#2f6a3a', 0, 3.5 * s, 0)]);
    const geoBank = () => kit.mesh([P(new THREE.DodecahedronGeometry(1.6, 1), '#55663a', 0, -0.55, 0, 0, 0.4, 0, 1.3, 0.45, 1.1), P(new THREE.DodecahedronGeometry(0.5, 0), '#7a776f', (Math.random() - 0.5) * 2, 0.05, 0.6, 0.3, 1, 0, 1, 0.7, 1)], { cast: false });
    const geoSign = () => kit.mesh([P(BOX(0.12, 2.2, 0.12), '#5a3a1e', 0, 1.1, 0), P(BOX(1.2, 1.2, 0.08), '#e8c040', 0, 2.0, 0, 0, 0, Math.PI / 4), P(BOX(0.16, 0.6, 0.1), '#2a1a0a', 0, 2.1, -0.02), P(BOX(0.16, 0.16, 0.1), '#2a1a0a', 0, 1.62, -0.02)]);
    const geoRapids = () => { const g = new THREE.Group(); for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.35 + Math.random() * 0.3, 0.5, 5), kit.basic({ color: '#ffffff', transparent: true, opacity: 0.8 })); m.position.set((i % 7 - 3) * 1.3 + Math.random() * 0.4, 0.15, (i / 7 | 0) * 1.6); g.add(m); } g.add(geoRock()); g.children[g.children.length - 1].position.set(-2.4, 0, 0.8); return g; };
    let bumps = 0, sT = 1.5, dT = 0, ended = false, rapIdx = 0, signIt = null, portT = 0, portW = false, rapIt = null;
    const R = makeRunner(ctx, { W: 3.0, speed: easy ? 6.5 : 7.5, lat: 4.2, player: canoe, py: () => 0, pr: 0.5, lean: 0.6,
      spawn(dt, sp, R) {
        sT -= dt; dT -= dt;
        if (rapIdx < 2 && R.t > RAP[rapIdx] - 5 && !signIt) { signIt = R.add(geoSign(), { x: 3.9, z: 33, kind: 'deco' }); rapIt = R.add(geoRapids(), { x: 0, z: 33 + 5 * R.speed * 0.42, kind: 'deco' }); ctx.msg('⚠️ Rapids ahead! Press E to portage', 'info', 2.4); portW = true; }
        if (sT <= 0 && !portW && portT <= 0 && R.t < LEN - 3) { sT = (easy ? 1.6 : 1.25) + ctx.rnd() * 0.6; const x = (ctx.rnd() - 0.5) * 6; const log = ctx.rnd() < 0.35;
          R.add(log ? geoLog() : geoRock(), { x, z: 33, y: log ? 0 : 0, r: log ? 1.1 : 0.7, kind: 'bad', what: log ? 'log' : 'rock', bob: log ? 0.04 : 0 }); }
        if (dT <= 0) { dT = 0.55 + ctx.rnd() * 0.5; const side = ctx.rnd() < 0.5 ? 1 : -1; R.add(geoBank(), { x: side * 6.6, z: 35, y: 0.2, kind: 'deco' }); R.add(geoSpruce(0.8 + ctx.rnd() * 0.6), { x: side * (6.8 + ctx.rnd() * 1.5), z: 35, y: 0.3, kind: 'deco' }); }
      },
      onBad(it) { bumps++; kit.puff(new THREE.Vector3(it.x, 0.3, 0.6), '#ffffff', 12, { spread: 0.9, up: 1.6 }); ctx.msg(it.what === 'log' ? 'Thunk! A log.' : 'Scrape! A rock. Careful of the bark!', 'bad', 1); ctx.flash('bad'); ctx.sfx('splash'); },
    });
    for (let z = -8; z < 34; z += 1.4) { const side = (Math.round(z / 1.4) % 2) ? 1 : -1; R.add(geoBank(), { x: side * 6.6, z, y: 0.2, kind: 'deco' }); R.add(geoSpruce(1), { x: side * 7.2, z: z + 0.5, y: 0.3, kind: 'deco' }); }
    const st = () => ctx.status('❤️ ' + Math.max(0, LIVES - bumps) + ' · 🛶 ' + Math.min(100, Math.round(R.t / LEN * 100)) + '%' + (portW ? ' · ⚠️ Rapids!' : ''));
    ctx.cam(0, 3.6, -6.8, 0, 0.8, 9, true);
    let pt = 0;
    return {
      start() { st(); ctx.msg('Paddle upriver!', 'info', 1.4); },
      bot(lose) { if (!lose && portW && rapIt && rapIt.z < 16) return { press: true }; return R.bot(lose); },
      action() { if (!portW || ended) return; portW = false; portT = 3.2; rapIdx++; ctx.msg('🎒 Portage! Carry the canoe around the rapids.', 'good', 2); ctx.sfx('hit'); },
      update(dt, inp) {
        if (ended) return;
        R.update(dt, portT > 0 ? { x: 0, y: 0 } : inp); river.tick(R.dist); st(); pt += dt;
        // paddling / carrying animation
        if (portT > 0) { portT -= dt; const k = clamp(Math.min(portT, 3.2 - portT) * 2, 0, 1); hull.position.y = k * 1.25; hull.rotation.z = k * Math.PI; pads.forEach((p, i) => { p.position.y = -0.15 - k * 1.85; p.rotation.z = -k * Math.PI; p.userData.armL.rotation.x = p.userData.armR.rotation.x = -k * 2.6; p.userData.pd.visible = k < 0.5; });
          if (rapIt && !rapIt.dead) rapIt.obj.visible = true; if (portT <= 0) { hull.position.y = 0; hull.rotation.z = 0; pads.forEach(p => { p.position.y = -0.15; p.rotation.z = 0; p.userData.pd.visible = true; }); signIt = null; } }
        else pads.forEach((p, i) => { const a = pt * 4 + i * 1.3, sd = (Math.floor(pt * 4 / Math.PI / 2) % 2) ? 1 : -1; p.userData.pd.position.x = 0.35 * sd; p.userData.pd.rotation.x = Math.sin(a) * 0.7; p.userData.armR.rotation.x = p.userData.armL.rotation.x = -0.6 + Math.sin(a) * 0.5; });
        wake.forEach(w => w.material.opacity = portT > 0 ? 0 : 0.25 + 0.1 * Math.sin(pt * 6));
        if (portW && rapIt && rapIt.z < 1.2) { portW = false; rapIdx++; bumps++; signIt = null; kit.puff(new THREE.Vector3(R.px, 0.3, 0.6), '#fff', 14, { spread: 1, up: 2 }); ctx.msg('Whoa! The rapids are too rough. Portage next time!', 'bad', 2); }
        if (bumps >= LIVES) { ended = true; return ctx.lose('The canoe got too many scrapes. Birchbark is light, but it can tear on rocks!'); }
        if (R.t >= LEN) { ended = true; return ctx.win('You paddled upriver and carried your canoe around the rapids!'); }
      },
    };
  }
};
