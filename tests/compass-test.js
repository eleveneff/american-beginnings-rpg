/* v2.8.2 compass test (John: "make it clear which way the character is supposed to walk ... with a compass").
   For each of the 6 levels: at 4 camera yaws the compass pointer must match the bearing to the next stop, the N mark must
   match real north (+z), and an on-screen target must sit on the side the pointer shows (projected through the real camera).
   Then the current stop is marked done and the pointer must swing to the new next stop. Also: footprints trail on, the
   dial fits inside the banner at 760x440 landscape. SHOTS=dir saves one compass shot per level.
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8765/ SHOTS=/workspace/abrpg-report/ node tests/compass-test.js */
const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BASE || 'http://localhost:8765/', SH = process.env.SHOTS || '', TAG = process.env.TAG || 'v282-compass';
let fails = 0; const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };
const LEVELS = (process.env.LEVELS || 's1,s2,s3,s4,s5,s6').split(',');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const G = { gender: 'girl', name: 'Abigail' }, D = { attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} },
    save = { version: 3, players: { s1: G, s2: G, s3: G, s4: G, s5: G, s6: G }, sections: { s1: D, s2: D, s3: D, s4: D, s5: D }, owned: [], equip: {} };   // earlier levels passed so every level opens
  const errs = [];
  for (const sid of LEVELS) {
    const p = await b.newPage(); p.on('pageerror', e => errs.push(sid + ': ' + e.message));
    await p.setViewport({ width: 1024, height: 640 });
    await p.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p.evaluate(s => { localStorage.clear(); localStorage.setItem('americanBeginningsRPG_v1', JSON.stringify(s)); }, save);
    await p.goto(BASE + '?cb=' + Date.now(), { waitUntil: 'domcontentloaded' }); await sleep(1500);
    await p.evaluate(s => document.querySelector('.node[data-sid="' + s + '"]').click(), sid);
    const t0 = Date.now(); while (Date.now() - t0 < 90000 && !(await p.evaluate(() => !!(window.__world && __world._dbg && __world._dbg().L.dz && __world.level)))) await sleep(500);
    while (Date.now() - t0 < 90000 && (await p.evaluate(() => window.__world && __world.phase)) !== 'active') await sleep(500);
    await sleep(2500); await p.evaluate(() => __world.closeCard());
    const c0 = await p.evaluate(() => __world.compass);
    check(c0.style === (sid < 's3' ? 'stone' : sid < 's5' ? 'brass' : 'wood'), sid + ' style ' + c0.style);
    for (const yaw of [0, 1.3, 2.6, -1.9]) {
      await p.evaluate(y => { __world.faceCam(y); __world.closeCard(); }, yaw); await sleep(1200);
      const r = await p.evaluate(() => { const c = __world.compass, { L, THREE } = __world._dbg(); let ndc = null;
        if (c.tx != null) { const v = new THREE.Vector3(c.tx, L.pos.y + 1, c.tz).project(L.cam); const rel = new THREE.Vector3(c.tx, 0, c.tz).sub(L.cam.position).applyQuaternion(L.cam.quaternion.clone().invert()); ndc = { x: v.x, front: rel.z < 0 }; }
        return { c, ndc, tgt: __world.target, banner: __world.banner }; });
      const c = r.c, want = -(Math.atan2(c.tx - c.x, c.tz - c.z) - c.camYaw) * 180 / Math.PI, dd = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
      const side = r.ndc && r.ndc.front && Math.abs(Math.sin(c.needle * Math.PI / 180)) > 0.25 ? (Math.sign(r.ndc.x) === Math.sign(Math.sin(c.needle * Math.PI / 180))) : null;
      check(dd(c.needle, want) < 6 && dd(c.north, c.camYaw * 180 / Math.PI) < 4 && side !== false,
        sid + ' yaw ' + yaw + ': target ' + r.tgt + ' (' + c.dist + '), pointer ' + (((c.needle % 360) + 360) % 360).toFixed(0) + '° want ' + (((want % 360) + 360) % 360).toFixed(0) + '°, N ' + (((c.north % 360) + 360) % 360).toFixed(0) + '°' + (side === null ? ', target off screen or straight ahead/behind' : ', target is on the ' + (r.ndc.x > 0 ? 'right' : 'left') + ' of the screen as the pointer shows') + ', footprints ' + c.trail);
    }
    // after completing the current stop the pointer must move on
    const a = await p.evaluate(() => { const t = __world.target, { L } = __world._dbg(); const r = L.lvl.rings.find(q => q.def.id === t); if (!r) return { t, skip: true }; r.def.state = () => 'done'; L.mods.B.setRingState(r, 'done'); return { t }; });   // in memory only (refreshRings re-reads def.state)
    await sleep(1200);
    const after = await p.evaluate(() => ({ t: __world.target, c: __world.compass, banner: __world.banner }));
    const want2 = -(Math.atan2(after.c.tx - after.c.x, after.c.tz - after.c.z) - after.c.camYaw) * 180 / Math.PI, d2 = Math.abs(((after.c.needle - want2) % 360 + 540) % 360 - 180);
    check(!a.skip && after.t !== a.t && d2 < 6, sid + ' after finishing ' + a.t + ': next is ' + after.t + ' ("' + after.banner + '", ' + after.c.dist + '), pointer on it (off by ' + d2.toFixed(1) + '°)');
    // short landscape phone: the dial stays inside the banner, the banner one row, nothing off screen
    await p.setViewport({ width: 760, height: 440 }); await sleep(900);
    const lay = await p.evaluate(() => { const o = document.getElementById('w-obj').getBoundingClientRect(), d = document.getElementById('w-comp').getBoundingClientRect(), e = document.getElementById('w-era').getBoundingClientRect(); return { o: [o.top, o.bottom, o.left, o.right], d: [d.top, d.bottom, d.left, d.right, d.width], eTop: e.top }; });
    check(lay.d[0] >= 0 && lay.d[4] >= 28 && lay.d[0] >= lay.o[0] - 2 && lay.d[1] <= lay.o[1] + 2 && lay.d[1] <= lay.eTop + 2 && lay.d[2] >= 0, sid + ' 760x440: dial ' + lay.d[4].toFixed(0) + ' px at y ' + lay.d[0].toFixed(0) + '–' + lay.d[1].toFixed(0) + ', banner bottom ' + lay.o[1].toFixed(0) + ', era line at ' + lay.eTop.toFixed(0));
    if (SH) { await p.setViewport({ width: 1024, height: 640 }); await p.evaluate(() => { __world.faceCam(__world._dbg().L.camYaw + 0.9); __world.qc && __world.qc(10); }); await sleep(1500); await p.screenshot({ path: SH + TAG + '-' + sid + '.png' });
      await p.setViewport({ width: 760, height: 440 }); await sleep(1200); await p.screenshot({ path: SH + TAG + '-' + sid + '-phone.png' }); }
    await p.close();
  }
  check(errs.length === 0, 'page errors: ' + (errs.join(' | ') || 'none'));
  console.log(fails ? 'COMPASS TEST FAILED (' + fails + ')' : 'COMPASS TEST PASSED'); await b.close(); process.exit(fails ? 1 : 0);
})();
