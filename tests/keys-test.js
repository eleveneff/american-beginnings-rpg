/* v2.8.1 controls test (John): W forward, Z back, A left, S right, all relative to the camera, on every level (1-6).
   For each level and three camera headings, holds each key and checks the hero's move on screen and in the world:
   W moves her away from the camera, Z toward it, A to screen-left, S to screen-right. D must not move her.
   Also: typing in a text field does not move her. Usage: NODE_PATH=... BASE=http://localhost:8765/ node tests/keys-test.js */
const puppeteer = require('puppeteer-core');
const BASE = process.env.BASE || 'http://localhost:8765/';
const KEY = 'americanBeginningsRPG_v1', WKEY = 'americanBeginningsRPG_world';
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(c, m) { if (!c) throw new Error('ASSERT: ' + m); console.log('  ok -', m); }
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const url = () => BASE + (BASE.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  const go = async () => { await p.goto(url(), { waitUntil: 'domcontentloaded' }); await sleep(1200); await p.evaluate(() => { if (window.__world) __world.quiet = true; }); };
  const G = { gender: 'girl', name: 'Abigail' }, DONE = () => ({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} });
  const SIDS = ['s1', 's2', 's3', 's4', 's5', 's6'];
  const save = n => { const players = {}, sections = {}; SIDS.slice(0, n).forEach((s, i) => { players[s] = G; if (i < n - 1) sections[s] = DONE(); }); return { version: 3, players, sections, owned: [], equip: {} }; };
  const seen = { help: true, help2: true, help3: true, help4: true, help5: true, help6: true };
  const W = () => p.evaluate(() => { const { L, THREE } = __world._dbg(); L.cam.updateMatrixWorld(); const r = new THREE.Vector3().setFromMatrixColumn(L.cam.matrixWorld, 0), f = new THREE.Vector3(); L.cam.getWorldDirection(f); return { x: L.pos.x, z: L.pos.z, rx: r.x, rz: r.z, fx: f.x, fz: f.z, cx: L.cam.position.x, cz: L.cam.position.z, yaw: L.camYaw }; });
  const hold = async (key, ms) => { await p.evaluate(() => __world.closeCard()); await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); await sleep(150); };
  for (let i = 0; i < 6; i++) {
    const sid = SIDS[i]; console.log('Level ' + (i + 1) + ' (' + sid + '):');
    await go(); await p.evaluate((k, wk, s, w) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(s)); localStorage.setItem(wk, JSON.stringify(w)); }, KEY, WKEY, save(i + 1), { ver: 1, mode: 'walk', seen, read: {} }); await go();
    await p.evaluate(s => document.querySelector('.node[data-sid="' + s + '"]').click(), sid);
    { const t = Date.now(); while (Date.now() - t < 45000 && (await p.evaluate(() => __world.phase)) !== 'active') await sleep(200); }
    await sleep(800); await p.evaluate(() => __world.closeCard());
    const start = await W();
    // find an open spot near the start: 4 m clear in every direction
    const spot = await p.evaluate((x0, z0) => { for (let r = 0; r < 30; r += 2) for (let a = 0; a < 6.28; a += 0.5) { const x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r; let ok = __world.walkable(x, z); for (let b = 0; ok && b < 6.28; b += 0.4) for (const d of [1.5, 3, 4]) if (!__world.walkable(x + Math.cos(b) * d, z + Math.sin(b) * d)) { ok = false; break; } if (ok) return { x, z }; } return { x: x0, z: z0 }; }, start.x, start.z);
    for (const yaw of [0, 2.1, -1.3]) {
      const res = {};
      for (const k of ['KeyW', 'KeyZ', 'KeyA', 'KeyS', 'KeyD']) {
        await p.evaluate((x, z) => __world.teleport(x, z), spot.x, spot.z); await p.evaluate(a => __world.faceCam(a), yaw); await sleep(500);
        const a = await W(); await hold(k, 650); const c = await W();
        const fx = Math.sin(yaw), fz = Math.cos(yaw), dx = c.x - a.x, dz = c.z - a.z;
        res[k] = { fwd: dx * fx + dz * fz, right: dx * -fz + dz * fx, dist: Math.hypot(dx, dz), dCam: Math.hypot(c.x - a.cx, c.z - a.cz) - Math.hypot(a.x - a.cx, a.z - a.cz), dsx: (dx * a.rx + dz * a.rz) / (Math.hypot(a.rx, a.rz) || 1), dlook: (dx * a.fx + dz * a.fz) / (Math.hypot(a.fx, a.fz) || 1) };
      }
      const f = n => n.toFixed(2), R = res;
      assert(R.KeyW.fwd > 1 && Math.abs(R.KeyW.right) < 0.3 * R.KeyW.fwd && R.KeyW.dCam > 0.8 && R.KeyW.dlook > 1, 'yaw ' + yaw + ': W walks away from the camera (fwd ' + f(R.KeyW.fwd) + ', side ' + f(R.KeyW.right) + ')');
      assert(R.KeyZ.fwd < -1 && Math.abs(R.KeyZ.right) < 0.3 * -R.KeyZ.fwd && R.KeyZ.dlook < -1, 'yaw ' + yaw + ': Z walks back toward the camera (fwd ' + f(R.KeyZ.fwd) + ', along camera view ' + f(R.KeyZ.dlook) + ')');
      assert(R.KeyA.right < -1 && Math.abs(R.KeyA.fwd) < 0.3 * -R.KeyA.right && R.KeyA.dsx < -1, 'yaw ' + yaw + ': A walks to screen-left (side ' + f(R.KeyA.right) + ', along camera right ' + f(R.KeyA.dsx) + ')');
      assert(R.KeyS.right > 1 && Math.abs(R.KeyS.fwd) < 0.3 * R.KeyS.right && R.KeyS.dsx > 1, 'yaw ' + yaw + ': S walks to screen-right (side ' + f(R.KeyS.right) + ', along camera right ' + f(R.KeyS.dsx) + ')');
      assert(R.KeyD.dist < 0.05, 'yaw ' + yaw + ': D no longer moves her (' + f(R.KeyD.dist) + ' m)');
    }
    { await p.evaluate((x, z) => __world.teleport(x, z), spot.x, spot.z); await p.evaluate(() => { const i = document.createElement('input'); i.id = 'kt-input'; i.style.cssText = 'position:fixed;top:0;left:0;z-index:99'; document.body.appendChild(i); i.focus(); });
      const a = await W(); await p.keyboard.type('wasz wasz', { delay: 60 }); await p.keyboard.down('KeyW'); await sleep(500); await p.keyboard.up('KeyW'); await sleep(150); const c = await W();
      const val = await p.evaluate(() => { const i = document.getElementById('kt-input'), v = i.value; i.remove(); return v; });
      assert(Math.hypot(c.x - a.x, c.z - a.z) < 0.05 && val.startsWith('wasz wasz'), 'typing W/A/S/Z in a text box types letters and does not move her'); }
  }
  assert(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); console.log('KEYS TEST PASSED');
})().catch(e => { console.error(e); process.exit(1); });
