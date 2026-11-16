// Mini-game s5 · Raise the Palisade. Carry an upright log along the trench (A/S); it sways when you start and stop.
// Press E over the glowing gap while the log stands straight to drop it in. Six gaps. History: James Fort, Jamestown, 1607.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp, person } from './lib.js';

export default {
  title: 'Raise the Palisade', icon: '🪵', era: 'Jamestown, Virginia · June 1607', act: 'Drop',
  intro: 'In May 1607 English colonists landed at <b>Jamestown</b>. After an attack in late May, they hurried to build <b>James Fort</b>: a three-sided wall, or <b>palisade</b>, of tall logs stood upright in a trench.',
  how: 'Walk along the trench with <kbd>A</kbd> and <kbd>S</kbd> (or the arrows). Stop over the <b>glowing gap</b>, wait until the log stands <b>straight</b>, then press <kbd>E</kbd> to drop it in. Fill <b>6 gaps</b>.',
  tryit: 'Move with <kbd>A</kbd> / <kbd>S</kbd> to the glowing gap, then press <kbd>E</kbd> when the log is straight.',
  hint: 'Slow down before you reach the gap: a sudden stop makes the log swing. Watch the tilt bar and drop the log when the needle is in the green.',
  fact: 'James Fort was a <b>triangle</b> with a round lookout bastion for cannon at each corner. The colonists finished the wall in about <b>19 days</b>. In the 1990s archaeologists found the dark stains left in the soil by its rotted posts, so we know where the fort really stood.',
  build(ctx) {
    const { kit, root, easy } = ctx, N = 6, MISS = easy ? 5 : 3, TIME = easy ? 120 : 90, TOL = easy ? 0.3 : 0.2, TILT = easy ? 0.3 : 0.2;
    const WZ = 3.2, HZ = WZ - 0.75, LH = 2.4, SP = easy ? 1.8 : 2.2, XMAX = 3.6;
    ctx.isolate();
    const g = [];
    // ground, the James River behind, the woods beyond, sand bank
    g.push(P(BOX(90, 0.4, 70), '#6f8a46', 0, -0.2, 6, 0, 0, 0, 1, 1, 1, 0.05));
    // faint triangular footprint of James Fort so the 'triangle' fact is shown, not only told
    g.push(P(BOX(0.35, 0.04, 22), '#5a4a30', -11, 0.03, WZ + 7, 0, 0.55, 0), P(BOX(0.35, 0.04, 22), '#5a4a30', 11, 0.03, WZ + 7, 0, -0.55, 0), P(BOX(24, 0.04, 0.35), '#5a4a30', 0, 0.03, WZ));
    g.push(P(BOX(120, 0.1, 50), '#4a7a9a', 0, -0.05, 44), P(BOX(120, 0.3, 3), '#c8b47a', 0, -0.1, 18.5));
    for (let i = 0; i < 34; i++) { const x = -40 + i * 2.4 + (ctx.rnd() - 0.5), z = -10 - ctx.rnd() * 6, h = 4 + ctx.rnd() * 3;
      g.push(P(CYL(0.15, 0.2, h, 5), '#5a3e26', x, h / 2, z), P(CONE(1.3 + ctx.rnd() * 0.5, 3.2, 7), ['#2f5a2a', '#3a6a30', '#2a4e26'][i % 3], x, h + 0.6, z)); }
    for (let i = 0; i < 14; i++) { const s = i < 7 ? -1 : 1, x = s * (9 + (i % 7) * 2.6), z = 22 + (ctx.rnd() - 0.5) * 2, h = 4 + ctx.rnd() * 2.5;
      g.push(P(CYL(0.15, 0.2, h, 5), '#5a3e26', x, h / 2, z), P(SPH(1.5, 7, 5), ['#3a6a30', '#4a7a36'][i % 2], x, h + 0.4, z)); }
    // the finished palisade running off both ways, and a corner bastion with a cannon
    const post = (x, z, h, ry = 0) => { g.push(P(CYL(0.16, 0.18, h, 6), ['#8a6238', '#7a5634', '#94683e'][Math.abs(Math.round(x * 3)) % 3], x, h / 2, z), P(CONE(0.17, 0.3, 6), '#6b4a2a', x, h + 0.15, z)); };
    const slots = [-3, -1.8, -0.6, 0.6, 1.8, 3];
    for (let x = -11; x <= 11.01; x += 0.36) { if (slots.some(s => Math.abs(s - x) < 0.3)) continue; post(x, WZ, LH + (ctx.rnd() - 0.5) * 0.25); }
    for (let i = 0; i < 26; i++) post(-11 - i * 0.3, WZ + i * 0.22, LH);
    g.push(P(CYL(2.6, 2.8, 1.0, 16), '#7a5a3a', 11.5, 0.5, WZ + 1.5), P(CYL(0.12, 0.15, 1.4, 8), '#2a2a2a', 11.0, 1.15, WZ + 0.2, Math.PI / 2 - 0.15), P(BOX(0.5, 0.25, 0.8), '#5a3e26', 11.0, 1.05, WZ + 0.6));
    for (let a = 0; a < 18; a++) { const r = 2.7, ang = Math.PI * 0.55 + a * 0.2; post(11.5 + Math.cos(ang) * r, WZ + 1.5 + Math.sin(ang) * r * 0.9, LH * 0.9); }
    // the trench, a dirt pile, felled logs, a wattle-and-daub hut with a thatched roof, a tent, a flag (English, 1607)
    g.push(P(BOX(8.2, 0.06, 0.5), '#4a3420', 0, 0.01, WZ), P(SPH(1.2, 8, 5), '#6a4a2a', -5.6, -0.2, WZ - 1.2, 0, 0, 0, 1.3, 0.45, 0.8));
    for (let i = 0; i < 5; i++) g.push(P(CYL(0.17, 0.17, 2.6, 6), '#8a6238', 5.4, 0.18 + (i % 3) * 0.3, 0.8 + i * 0.36 - (i > 2 ? 0.9 : 0), 0, 0.1, Math.PI / 2));
    g.push(P(BOX(3, 1.6, 2.2), '#c8b48a', -6, 0.8, -3.2), P(CONE(2.5, 1.6, 4), '#c9a85a', -6, 2.4, -3.2, 0, Math.PI / 4), P(BOX(0.6, 1.1, 0.06), '#4a3420', -6, 0.55, -2.08));
    g.push(P(CONE(1.3, 1.6, 4), '#e8dcc0', 4.2, 0.8, -3.6, 0, Math.PI / 4));
    g.push(P(CYL(0.05, 0.05, 6, 5), '#5a3e26', -2.2, 3, 9.5), P(BOX(1.4, 0.9, 0.04), '#f2f2f2', -1.5, 5.4, 9.5), P(BOX(1.4, 0.18, 0.05), '#c8202a', -1.5, 5.4, 9.5), P(BOX(0.18, 0.9, 0.05), '#c8202a', -1.5, 5.4, 9.5));
    root.add(kit.mesh(g, { cast: false, recv: true }));
    // two fellow settlers digging (helpers, for life)
    const crew = [];
    for (const [x, z, c] of [[-4.6, WZ - 1.3, '#6b5a3a'], [5.0, 1.6, '#5a4a6a']]) { const p = person(kit, { coat: c, pants: '#4a3a2a', hat: 'brim', skin: '#e2b48c' }); p.position.set(x, 0, z); p.rotation.y = x < 0 ? 0.6 : -2.4; root.add(p); crew.push(p); }
    // the gap marker and the log she carries
    const glow = kit.mesh([P(CYL(0.26, 0.26, 0.04, 14), '#ffe066', 0, 0.03, 0)]); root.add(glow);
    const arrow = kit.mesh([P(CONE(0.18, 0.35, 8), '#ffd23a', 0, 0, 0, Math.PI)]); root.add(arrow);
    const mkLog = () => { const m = kit.mesh([P(CYL(0.16, 0.18, LH, 7), '#9a6e40', 0, LH / 2, 0), P(CONE(0.17, 0.3, 7), '#7a5634', 0, LH + 0.15, 0), P(CYL(0.14, 0.14, 0.02, 7), '#d8b880', 0, 0.005, 0)]); kit.ink(m); const grp = new THREE.Group(); grp.add(m); root.add(grp); return grp; };
    let log = mkLog();
    const order = slots.map((s, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(ctx.rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let done = 0, miss = 0, t = 0, hx = 0, v = 0, th = 0, w = 0, ended = false, pend = null, drop = null; const falls = [];
    const tx = () => slots[order[done]];
    const st = () => ctx.status('🪵 ' + done + '/' + N + ' logs · ❌ ' + miss + '/' + MISS + ' · ⏱ ' + Math.max(0, Math.ceil(TIME - t)));
    const camSet = snap => ctx.cam(hx + 1.0, 3.4, HZ - 4.4, hx - 0.1, 0.9, WZ + 0.3, snap);
    const holdLog = () => { if (!log || drop) return; log.position.set(hx, 0.1, HZ + 0.3); log.rotation.set(0, 0, th); };
    const hero = () => ctx.placeHero(hx + 0.5, 0, HZ - 0.05, -0.35, Math.min(1, Math.abs(v) / SP) * 2.5);
    camSet(true); hero(); holdLog();
    const missed = why => {
      if (ctx.grace(why + ' This first miss does not count — wait for the needle to sit in the green.')) { pend = { t: 0.9, f: () => { log = mkLog(); th = 0; w = 0; holdLog(); } }; return; }
      miss++; ctx.msg(why, 'bad', 1.2); ctx.flash('bad'); ctx.sfx('miss'); st();
      if (miss >= MISS) { ended = true; pend = { t: 1.1, f: () => ctx.lose('Too many logs toppled. You set ' + done + ' of ' + N + '.') }; return; }
      pend = { t: 0.9, f: () => { log = mkLog(); th = 0; w = 0; holdLog(); } }; };
    return {
      start() { st(); ctx.msg('Carry the log to the glowing gap', 'info', 1.6); },
      bot(lose) { if (pend || ended || drop || !log) return {}; const d = hx - tx();
        if (lose) return { x: Math.abs(d) < 1.2 ? (d >= 0 ? 1 : -1) : 0, press: Math.abs(d) > 1.0 };
        const x = Math.abs(d) > 0.05 ? clamp(d * 1.6, -1, 1) : 0; return { x: Math.abs(x) < 0.35 && Math.abs(d) > 0.05 ? Math.sign(x) : x, press: Math.abs(d) < TOL * 0.5 && Math.abs(th) < TILT * 0.5 && Math.abs(v) < 0.2 }; },
      action() { if (ended || pend || drop || !log) return;
        drop = { t: 0, x: hx, th, ok: Math.abs(hx - tx()) <= TOL && Math.abs(th) <= TILT, why: Math.abs(hx - tx()) > TOL ? 'Missed the gap! The log toppled.' : 'It was leaning! The log toppled.' }; },
      update(dt, inp) {
        t += dt;
        for (const p of crew) { const k = Math.sin(t * 3 + p.position.x); p.userData.armL.rotation.x = -0.6 + k * 0.5; p.userData.armR.rotation.x = -0.6 + k * 0.5; }
        for (let i = falls.length - 1; i >= 0; i--) { const f = falls[i]; f.r += f.s * dt * 2.2; f.s *= 1.08; f.m.rotation.x = -Math.abs(f.r) * 0.4; f.m.rotation.z = f.r;
          if (Math.abs(f.r) > 1.45) { kit.puff(new THREE.Vector3(f.m.position.x - Math.sin(f.r) * 1.6, 0.2, f.m.position.z), '#8a6a44', 10, { spread: 0.8, up: 0.8 }); root.remove(f.m); falls.splice(i, 1); } }
        const pulse = 0.5 + 0.5 * Math.sin(t * 6);
        if (done < N) { glow.position.set(tx(), 0, WZ); glow.scale.setScalar(0.9 + pulse * 0.3); arrow.position.set(tx(), LH + 0.9 + pulse * 0.2, WZ); arrow.visible = glow.visible = true; } else arrow.visible = glow.visible = false;
        if (drop) { drop.t += dt; const k = Math.min(1, drop.t / 0.3);
          log.position.set(lerp(drop.x, drop.ok ? tx() : drop.x, k), 0.1 - 0.35 * k, lerp(HZ + 0.3, WZ, k)); log.rotation.z = lerp(drop.th, drop.ok ? 0 : drop.th, k);
          if (k >= 1) { const ok = drop.ok, why = drop.why; drop = null;
            if (ok) { done++; kit.puff(new THREE.Vector3(log.position.x, 0.15, WZ), '#7a5a34', 10, { spread: 0.5, up: 0.7 }); log = null; ctx.msg(['Thunk! It\'s in.', 'Solid!', 'Straight and true!', 'Nice!'][done % 4], 'good', 0.9); ctx.flash('good'); ctx.sfx('thunk'); st();
              if (done >= N) { ended = true; pend = { t: 1.0, f: () => ctx.win('You set all ' + N + ' logs. The wall is closed, and the fort is safer tonight.') }; }
              else pend = { t: 0.6, f: () => { log = mkLog(); th = (ctx.rnd() - 0.5) * 0.2; w = 0; holdLog(); } }; }
            else { falls.push({ m: log, r: log.rotation.z || 0.05 * (ctx.rnd() < 0.5 ? -1 : 1), s: Math.sign(log.rotation.z || 1) * 0.6 }); log = null; missed(why); } } }
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } }
        // walking and the log's sway (an upside-down pendulum she keeps upright; starts and stops push it over)
        const ok = !ended && !drop && log;
        const vT = ok ? -clamp(inp.x, -1, 1) * SP : 0, v0 = v; v = lerp(v, vT, Math.min(1, dt * 5)); hx = clamp(hx + v * dt, -XMAX, XMAX); if (Math.abs(hx) >= XMAX) v = 0;
        const acc = (v - v0) / Math.max(dt, 1e-3);
        const wob = (easy ? 0.5 : 0.8) * (Math.sin(t * 1.7) + 0.6 * Math.sin(t * 2.9 + 1)) * (0.6 + done * 0.1);
        w += (-7 * th - 1.1 * w + acc * 0.32 + wob) * dt; th = clamp(th + w * dt, -0.8, 0.8);
        holdLog(); hero(); camSet(false);
        if (log && !drop && !pend) ctx.meter(0.5 + th / 1.2, { zone: [0.5 - TILT / 1.2, 0.5 + TILT / 1.2], label: 'Keep the log straight' }); else ctx.meter(null);
        if (!ended && !drop) st();
        if (!ended && t >= TIME) { ended = true; ctx.lose('Night fell before the wall was done. You set ' + done + ' of ' + N + ' logs.'); }
      },
    };
  }
};
