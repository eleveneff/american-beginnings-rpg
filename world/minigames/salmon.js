// Mini-game s2 · Salmon Dip-Net. Stand on a wooden platform over a waterfall; salmon leap up the falls. Slide the long-handled
// net with A / S and press E to scoop a fish while it is in the air. History: Columbia River peoples fished from platforms at
// Celilo Falls for thousands of years; salmon was dried and smoked for winter; the First Salmon Ceremony.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';

export default {
  title: 'Salmon Dip-Net', icon: '🐟', era: 'Pacific Northwest · long before 1492', act: 'Scoop the salmon',
  intro: 'Every year, huge runs of <b>salmon</b> swam up the rivers of the Pacific Northwest. At waterfalls like <b>Celilo Falls</b> on the Columbia River, fishers stood on <b>wooden platforms</b> and caught leaping salmon with long-handled <b>dip nets</b>.',
  how: 'Slide the net with <kbd>A</kbd> / <kbd>S</kbd> (or ◀ ▶). When a salmon <b>leaps</b> into your net\'s glowing ring, press <kbd>E</kbd> to scoop!',
  tryit: 'Move the net with <kbd>A</kbd> / <kbd>S</kbd>. Press <kbd>E</kbd> when a salmon leaps through the glowing ring.',
  hint: 'Watch for the splash: a fish jumps from that spot a moment later. Move the net over the splash, then press E while the fish is up in the air.',
  fact: 'People fished at Celilo Falls for more than 10,000 years. They dried and smoked salmon to eat all winter and traded it far and wide. Many peoples held a <b>First Salmon Ceremony</b> to give thanks, and they let plenty of fish swim on upriver so the salmon would return the next year.',
  build(ctx) {
    const { kit, root, easy } = ctx, NEED = easy ? 6 : 8, TIME = easy ? 70 : 60, NR = easy ? 0.95 : 0.7, NETZ = 4.2;
    ctx.isolate();
    // river below the falls, the falls, basalt cliffs, the platform
    const bed = -2.0, GL = bed + 2.6;   // river surface, ground level of the gorge rim
    const gr = [P(BOX(80, 3, 30), '#5a8a3a', 0, GL - 1.5, -14.6), P(BOX(80, 3, 40), '#5a8a3a', 0, GL - 1.2, 30.5), P(BOX(30, 3, 10.4), '#5a8a3a', -23, GL - 1.5, 5.4), P(BOX(30, 3, 10.4), '#5a8a3a', 23, GL - 1.5, 5.4),
      P(BOX(80, 2.6, 0.6), '#5a5248', 0, GL - 1.3, 0.1), P(BOX(0.6, 2.6, 10.4), '#5a5248', 7.9, GL - 1.3, 5.4), P(BOX(0.6, 2.6, 10.4), '#5a5248', -7.9, GL - 1.3, 5.4)];
    for (let i = 0; i < 26; i++) { const sd = i % 2 ? 1 : -1, x = sd * (9.5 + ctx.rnd() * 18), z = -6 + ctx.rnd() * 34, h = 3 + ctx.rnd() * 3; if (z < 0 && Math.abs(x) < 12) continue;
      gr.push(P(CYL(0.15, 0.22, 1.2, 5), '#4a3220', x, GL + 0.6 + (z > 10.5 ? 0.3 : 0), z), P(CONE(0.9 + h * 0.12, h, 7), i % 3 ? '#1f4a2e' : '#2a5a36', x, GL + 1.2 + h / 2 + (z > 10.5 ? 0.3 : 0), z)); }
    root.add(kit.mesh(gr, { recv: true }));
    const water = new THREE.Mesh(new THREE.PlaneGeometry(15.4, 10.6), kit.mat({ color: '#3a7aa0' })); water.rotation.x = -Math.PI / 2; water.position.set(0, bed, 5); root.add(water);
    const fallsTex = kit.canvasTex(128, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d8f0fa'); gr.addColorStop(0.4, '#9fd0e8'); gr.addColorStop(1, '#eef8ff'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 70; i++) { x.lineWidth = 1.5 + Math.random() * 3; const a = Math.random() * w; x.beginPath(); x.moveTo(a, 0); x.quadraticCurveTo(a + (Math.random()-0.5)*14, h*0.5, a + (Math.random()-0.5)*8, h); x.stroke(); } });
    fallsTex.wrapT = THREE.RepeatWrapping; fallsTex.repeat.set(4, 1);
    const falls = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 2.95), kit.track(new THREE.MeshBasicMaterial({ map: fallsTex }))); falls.position.set(0, bed + 1.47, 10.25); falls.rotation.y = Math.PI; root.add(falls);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 20), kit.mat({ color: '#4a8ab0' })); top.rotation.x = -Math.PI / 2; top.position.set(0, GL + 0.33, 20.6); root.add(top);
    const cl = []; for (let i = 0; i < 9; i++) { const x = -8 + i * 2; cl.push(P(new THREE.DodecahedronGeometry(1.1, 0), i % 2 ? '#3e3a36' : '#4a4540', x, bed + 2.3, 10.6, 0, i, 0, 1, 0.5, 0.7)); }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) cl.push(P(new THREE.DodecahedronGeometry(1.4, 0), '#4a4540', s * (8.4 + ctx.rnd()), bed + 1 + i * 0.3, 2 + i * 3, 0, i, 0, 1, 1.4, 1));
    root.add(kit.mesh(cl));
    const foam = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.9, 10), kit.basic({ color: '#fff', transparent: true, opacity: 0.6, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(-7 + i * 2.8, bed + 0.04, 9.3); root.add(m); foam.push(m); }
    const plat = kit.mesh([P(BOX(3.4, 0.14, 2.4), '#8a6238', 0, bed + 2.0, 1.4), P(BOX(3.4, 0.08, 0.1), '#5a3a1e', 0, bed + 2.5, 2.55), ...[[-1.6, 0.3], [1.6, 0.3], [-1.6, 2.5], [1.6, 2.5]].map(([x, z]) => P(CYL(0.1, 0.12, 2.6, 6), '#5a3a1e', x, bed + 0.9, z)),
      P(BOX(0.06, 0.6, 0.06), '#5a3a1e', -1.6, bed + 2.3, 2.55), P(BOX(0.06, 0.6, 0.06), '#5a3a1e', 1.6, bed + 2.3, 2.55),
      // drying rack with salmon on the bank
      P(CYL(0.05, 0.05, 1.8, 5), '#5a3a1e', 4.4, bed + 2.9, -0.5), P(CYL(0.05, 0.05, 1.8, 5), '#5a3a1e', 6.6, bed + 2.9, -0.5), P(CYL(0.04, 0.04, 2.4, 5), '#5a3a1e', 5.5, bed + 3.7, -0.5, 0, 0, Math.PI / 2),
      ...[0, 1, 2, 3].map(i => P(BOX(0.12, 0.7, 0.04), '#d8603a', 4.8 + i * 0.45, bed + 3.3, -0.5))]);
    root.add(plat); kit.ink(plat);
    // the net: handle + hoop + mesh bag, slides along x on the platform edge
    const net = new THREE.Group(); root.add(net);
    net.add(kit.mesh([P(CYL(0.035, 0.035, 3.2, 5), '#9a7040', 0, 0.8, -1.4, 1.05), P(new THREE.TorusGeometry(NR * 0.75, 0.04, 5, 16), '#7a5230', 0, 0, 0, Math.PI / 2)]));
    const bag = new THREE.Mesh(new THREE.ConeGeometry(NR * 0.72, 0.9, 12, 1, true), kit.mat({ color: '#d8cfa8', transparent: true, opacity: 0.75, side: THREE.DoubleSide })); bag.rotation.x = Math.PI; bag.position.y = -0.45; net.add(bag);
    const glow = new THREE.Mesh(new THREE.RingGeometry(NR - 0.12, NR, 24), kit.basic({ color: '#3ee0b0', transparent: true, opacity: 0.7, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.05; net.add(glow);
    const fishGeo = () => kit.mesh([P(SPH(0.22, 8, 6), '#c0504a', 0, 0, 0, 0, 0, 0, 0.7, 0.8, 2.2), P(SPH(0.2, 8, 6), '#9aa0a8', 0, 0.06, 0, 0, 0, 0, 0.68, 0.6, 2.1), P(CONE(0.2, 0.32, 4), '#7a3a34', 0, 0, -0.6, -Math.PI / 2, 0, 0, 0.3, 1, 1), P(BOX(0.04, 0.04, 0.04), '#111', 0.11, 0.08, 0.36)]);
    let nx = 0, caught = 0, missed = 0, t = 0, sT = 1.2, ended = false, scoop = 0, pend = null; const fish = [];
    const NY = bed + 1.6;
    const st = () => ctx.status('🐟 ' + caught + '/' + NEED + ' · ⏱ ' + Math.max(0, Math.ceil(TIME - t)));
    ctx.placeHero(0.4, bed + 2.07, 1.0, 0);
    ctx.cam(-0.8, bed + 6.0, -2.6, 0, bed + 0.4, 7.2, true);
    return {
      start() { st(); ctx.actLabel('Scoop the salmon'); ctx.prompt('Steer with A/S under the splash, then press E to scoop the leaping salmon.', 3.2); ctx.msg('Watch for leaping salmon!', 'info', 1.5); },
      bot(lose) { if (lose) return {}; const f = fish.filter(f => !f.done).sort((a, b) => a.t0 - b.t0)[0]; if (!f) return {}; const dx = f.x - nx; const up = f.k > 0 && f.k < 1;
        return { x: Math.abs(dx) < 0.15 ? 0 : (dx > 0 ? -1 : 1), press: up && Math.abs(dx) < NR * 0.6 && f.k > 0.25 && f.k < 0.75 && scoop <= 0 }; },
      action() { if (ended || scoop > 0) return; scoop = 0.45;
        let got = null; for (const f of fish) if (!f.done && f.k > 0.12 && f.k < 0.9 && Math.abs(f.x - nx) < NR) { got = f; break; }
        if (got) { got.done = true; got.caught = true; caught++; kit.puff(new THREE.Vector3(nx, NY, NETZ), '#bfe6ff', 12, { spread: 0.6, up: 1.6 }); ctx.msg(['Got one!', 'Nice scoop!', 'Salmon!', 'Great catch!'][caught % 4], 'good'); ctx.flash('good'); ctx.sfx('scoop'); st();
          if (caught >= NEED) { ended = true; pend = { t: 0.8, f: () => ctx.win('You scooped ' + caught + ' salmon, and ' + missed + ' swam on upriver.') }; } }
        else { ctx.msg('Missed! Wait for a leap.', 'bad', 0.9); ctx.sfx('miss'); }
      },
      update(dt, inp) {
        t += dt; if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } return; }
        if (ended) return;
        nx = clamp(nx - inp.x * 4.2 * dt, -5.5, 5.5);
        scoop = Math.max(0, scoop - dt); const sk = scoop > 0 ? Math.sin((0.45 - scoop) / 0.45 * Math.PI) : 0;
        net.position.set(nx, NY + 0.1 + sk * 0.6, NETZ - sk * 0.4); net.rotation.x = -sk * 0.5;
        ctx.placeHero(clamp(nx * 0.25, -1.2, 1.2) + 1.0, bed + 2.07, 1.2, 0);
        fallsTex.offset.y = (fallsTex.offset.y + dt * 1.4) % 1; foam.forEach((f, i) => { const s = 1 + 0.15 * Math.sin(t * 5 + i); f.scale.set(s, s, 1); });
        sT -= dt;
        if (sT <= 0 && t < TIME - 1.5) { sT = (easy ? 1.6 : 1.3) + ctx.rnd() * 0.9; const x = (ctx.rnd() - 0.5) * 9.6; const m = fishGeo(); m.visible = false; root.add(m);
          fish.push({ m, x, k: -0.7, t0: t, dur: easy ? 1.5 : 1.25, done: false }); kit.puff(new THREE.Vector3(x, bed + 0.1, NETZ), '#ffffff', 6, { spread: 0.4, up: 1.0 }); }
        for (const f of fish) {
          if (f.caught) { f.m.position.lerp(new THREE.Vector3(nx, NY - 0.2, NETZ), Math.min(1, dt * 10)); f.fade = (f.fade || 0) + dt; if (f.fade > 0.5) { f.m.visible = false; f.gone = true; } continue; }
          f.k += dt / f.dur; if (f.k < 0) continue; f.m.visible = f.k <= 1.05;
          // leap: from the pool below the platform up toward the falls lip
          const k = Math.min(f.k, 1); f.m.position.set(f.x, bed + Math.sin(k * Math.PI) * 2.3 + k * 0.5, NETZ - 1.2 + k * 5.6); f.m.rotation.x = -Math.cos(k * Math.PI) * 0.9; f.m.rotation.z = Math.sin(t * 20) * 0.15;
          if (f.k > 1 && !f.done) { f.done = true; missed++; kit.puff(new THREE.Vector3(f.x, bed + 2.6, 9.8), '#ffffff', 5, { spread: 0.3, up: 0.8 }); }
          if (f.k > 1.1) { f.m.visible = false; f.gone = true; }
        }
        for (let i = fish.length - 1; i >= 0; i--) if (fish[i].gone) { root.remove(fish[i].m); fish[i].m.geometry.dispose(); fish.splice(i, 1); }
        glow.material.opacity = 0.5 + 0.3 * Math.sin(t * 7); st();
        if (t >= TIME) { ended = true; return ctx.lose('Time is up! You caught ' + caught + ' of ' + NEED + ' salmon. Move the net under the splash before the fish jumps.'); }
      },
    };
  }
};
