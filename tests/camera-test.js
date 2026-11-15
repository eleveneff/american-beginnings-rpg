/* v2.8.1 camera smoothness test (John: "the camera gets glitchy when the character gets close to a tree or building").
   On every level, stands her beside up to 3 trees and 3 buildings with the camera swung toward them, then (a) strafes
   past (S), (b) walks along (W) and (c) turns the camera slowly, sampling the camera every frame. Reports per-frame
   pull-in reversals (in-out-in flutter) and the fastest camera move beyond her own (m/s, so slow frames don't hide snaps).
   Usage: NODE_PATH=... BASE=http://localhost:8765/ [STRICT=1] node tests/camera-test.js */
const puppeteer = require('puppeteer-core');
const BASE = process.env.BASE || 'http://localhost:8765/', STRICT = process.env.STRICT !== '0';
const KEY = 'americanBeginningsRPG_v1', WKEY = 'americanBeginningsRPG_world';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; function check(c, m) { console.log((c ? '  ok - ' : '  FAIL - ') + m); if (!c) fails++; }
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const url = () => BASE + (BASE.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  const go = async () => { await p.goto(url(), { waitUntil: 'domcontentloaded' }); await sleep(1200); await p.evaluate(() => { if (window.__world) __world.quiet = true; }); };
  const G = { gender: 'girl', name: 'Abigail' }, DONE = () => ({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} });
  const SIDS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
  const save = n => { const players = {}, sections = {}; SIDS.slice(0, n).forEach((s, i) => { players[s] = G; if (i < n - 1) sections[s] = DONE(); }); return { version: 3, players, sections, owned: ['fur-cloak'], equip: {} }; };
  const seen = { help: true, help2: true, help3: true, help4: true, help5: true, help6: true, help7: true };
  const tot = { rev: 0, jump: 0, runs: 0 };
  for (let i = 0; i < SIDS.length; i++) {
    const sid = SIDS[i]; console.log('Level ' + (i + 1) + ' (' + sid + '):');
    await go(); await p.evaluate((k, wk, s, w) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(s)); localStorage.setItem(wk, JSON.stringify(w)); }, KEY, WKEY, save(i + 1), { ver: 1, mode: 'walk', seen, read: {} }); await go();
    await p.evaluate(s => document.querySelector('.node[data-sid="' + s + '"]').click(), sid);
    { const t = Date.now(); while (Date.now() - t < 45000 && (await p.evaluate(() => __world.phase)) !== 'active') await sleep(200); }
    await sleep(800); await p.evaluate(() => __world.closeCard());
    // spots: beside trees (raised round canopies) and buildings (boxes), open ground on her side, camera swung toward them
    const spots = await p.evaluate(() => { const { L } = __world._dbg(), out = { tree: [], bldg: [] };
      for (const o of L.lvl.camOcc || []) { const tree = !!(o.r && !o.arc && o.y0 > -4.5 && o.r >= 1.0), bldg = !o.r && !o.arc && o.hx > 1.5 && o.hz > 1.5 && o.y0 < -4; if (!tree && !bldg) continue;
        const list = tree ? out.tree : out.bldg; if (list.length >= 3) continue;
        for (let a = 0; a < 6.28; a += 0.4) { const off = tree ? 1.4 : 0, rx = tree ? o.r * 0.6 + off : o.hx + 0.9, rz = tree ? o.r * 0.6 + off : o.hz + 0.9;
          const x = o.x + Math.cos(a) * (tree ? rx : 1) * (tree ? 1 : rx), z = o.z + Math.sin(a) * (tree ? rz : 1) * (tree ? 1 : rz);
          if (Math.abs(x) > 1e3) continue; let ok = __world.walkable(x, z); for (const d of [1, 2.5]) for (let c = 0; ok && c < 6.28; c += 0.8) { const xx = x + Math.cos(c) * d, zz = z + Math.sin(c) * d; if (Math.hypot(xx - o.x, zz - o.z) > Math.hypot(x - o.x, z - o.z) - 0.2 && !__world.walkable(xx, zz)) ok = false; }
          if (ok) { list.push({ x, z, yaw: Math.atan2(x - o.x, z - o.z) + Math.PI, kind: tree ? 'tree' : 'building' }); break; } } }
      return out.tree.concat(out.bldg); });
    for (const s of spots) {
      for (const mode of ['strafe', 'walk', 'turn']) {
        await p.evaluate((x, z) => __world.teleport(x, z), s.x, s.z);
        // camera behind her points back at the occluder: camYaw is her view direction, so the camera sits on the occluder side
        await p.evaluate(a => __world.faceCam(a), s.yaw); await sleep(400);
        await p.evaluate(mode => { const { L } = __world._dbg(); window.__camLog = []; window.__camOn = true; window.__turn = mode === 'turn';
          const f = () => { if (!window.__camOn) return; const c = L.cam.position; if (window.__turn) { L.camYaw += 0.012; L.manualT = 2.5; if (L.dz && L.dz.snap) L.dz.snap(L.camYaw); }
            __camLog.push({ t: performance.now() / 1000, x: c.x, y: c.y, z: c.z, hx: L.pos.x, hy: L.pos.y, hz: L.pos.z }); requestAnimationFrame(f); }; requestAnimationFrame(f); }, mode);
        const key = mode === 'strafe' ? (process.env.OLDKEYS ? 'KeyD' : 'KeyS') : mode === 'walk' ? 'KeyW' : null;
        if (key) { await p.keyboard.down(key); await sleep(2200); await p.keyboard.up(key); } else await sleep(2200);
        await sleep(300);
        const log = await p.evaluate(() => { window.__camOn = false; return window.__camLog; });
        let rev = 0, lastSign = 0, jump = 0, pulled = 0; const d = log.map(q => Math.hypot(q.x - q.hx, q.y - q.hy - 1.25, q.z - q.hz));
        for (let k = 1; k < log.length; k++) { const dd = d[k] - d[k - 1]; if (Math.abs(dd) > 0.04) { const sg = Math.sign(dd); if (lastSign && sg !== lastSign) rev++; lastSign = sg; }
          const cs = Math.hypot(log[k].x - log[k - 1].x, log[k].y - log[k - 1].y, log[k].z - log[k - 1].z), hs = Math.hypot(log[k].hx - log[k - 1].hx, log[k].hz - log[k - 1].hz); const fdt = Math.max(1 / 60, log[k].t - log[k - 1].t); jump = Math.max(jump, (cs - hs) / fdt); if (d[k] < 6.8) pulled++; }
        tot.rev += rev; tot.jump = Math.max(tot.jump, jump); tot.runs++;
        const minD = Math.min(...d);
        check(rev <= 2 && jump < 12 && minD > 1.1, s.kind + ' at (' + s.x.toFixed(1) + ', ' + s.z.toFixed(1) + ') ' + mode + ': ' + log.length + ' frames, in/out reversals ' + rev + ', fastest extra camera speed ' + jump.toFixed(1) + ' m/s, closest ' + minD.toFixed(2) + ' m, pulled in ' + pulled + ' frames');
      }
    }
  }
  console.log('TOTAL runs ' + tot.runs + ', reversals ' + tot.rev + ', fastest extra camera speed ' + tot.jump.toFixed(1) + ' m/s, page errors ' + errs.length);
  await b.close(); if (errs.length) console.log(errs.join('\n'));
  console.log(fails ? 'CAMERA TEST: ' + fails + ' FAIL' : 'CAMERA TEST PASSED'); process.exit(fails && STRICT ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
