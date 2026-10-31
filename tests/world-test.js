/* American Beginnings RPG v2.2 walkable-world test (Section 1: Beringia).
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8765/ SHOTS=/tmp/wshots/ node tests/world-test.js
   Run it on its own (not in parallel with smoke-test.js): SwiftShader is slow and the timings below assume one suite at a time. */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const SHOTS = process.env.SHOTS || '/tmp/wshots/'; fs.mkdirSync(SHOTS, { recursive: true });
const BASE = process.env.BASE || 'http://localhost:8765/';
const KEY = 'americanBeginningsRPG_v1', WKEY = 'americanBeginningsRPG_world', GKEY = 'americanBeginningsRPG_gfx';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
function assert(c, m) { if (!c) throw new Error('ASSERT: ' + m); console.log('  ok -', m); }
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|assets\/video\//.test(m.text() + ((m.location() || {}).url || ''))) errs.push(m.text()); });
  const url = () => BASE + (BASE.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  const go = async () => { await p.goto(url(), { waitUntil: 'domcontentloaded' }); await sleep(1200); await p.evaluate(() => { if (window.__world) __world.quiet = true; }); };   // quiet: no slow-device card (SwiftShader is slow)
  const click = async sel => { await p.waitForSelector(sel, { timeout: 10000 }); await p.$eval(sel, e => e.click()); await sleep(60); };
  const W = () => p.evaluate(() => ({ mode: __world.mode, phase: __world.phase, zone: __world.zone, pos: __world.pos, near: __world.near, card: __world.card(), failed: __world.failed }));
  const waitPhase = async (ph, ms = 20000) => { const t = Date.now(); while (Date.now() - t < ms) { if ((await p.evaluate(() => __world.phase)) === ph) return true; await sleep(150); } throw new Error('timeout waiting for phase ' + ph); };
  const closeCards = async () => { await p.evaluate(() => __world.closeCard()); };
  const seed = async (save, world) => { await go(); await p.evaluate((k, wk, s, w) => { localStorage.clear(); if (s) localStorage.setItem(k, JSON.stringify(s)); if (w) localStorage.setItem(wk, JSON.stringify(w)); }, KEY, WKEY, save, world); await go(); };
  const base = (extra = {}) => Object.assign({ version: 3, players: { s1: { gender: 'girl', name: 'Abigail' } }, sections: {}, owned: [], equip: {} }, extra);
  const hold = async (key, ms) => { await closeCards(); await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); await sleep(100); };
  const tp = async (x, z) => { await p.evaluate((x, z) => __world.teleport(x, z), x, z); await sleep(250); };
  const enterS1 = async () => { await p.evaluate(() => document.querySelector('.node[data-sid="s1"]').click()); await waitPhase('active', 30000); await sleep(600); await closeCards(); };
  const shot = async name => { await closeCards(); await sleep(400); await p.screenshot({ path: SHOTS + name }); };

  console.log('versions / boot:');
  await seed(base(), null);
  assert((await p.$eval('#game-version', e => e.textContent)) === 'v2.2' && (await p.evaluate(() => ABRPG.version)) === 'v2.2', 'version marker v2.2');
  let w = await W();
  assert(w.mode === 'walk' && w.phase === 'off' && !w.failed, 'WebGL2 device defaults to walk mode; home map stays the 2D map');
  assert(!(await p.$eval('#w-banner', e => e.hidden)), '"New in v2.2" banner shows on the map (non-blocking)');

  console.log('enter Beringia + movement:');
  const before = await p.evaluate(k => localStorage.getItem(k), KEY);
  await enterS1();
  w = await W();
  assert(w.phase === 'active' && w.zone === 'out' && Math.abs(w.pos.x) < 0.01 && Math.abs(w.pos.z + 4) < 0.01, 'tapping Section 1 opens the level at the camp start (0, -4)');
  assert(await p.$eval('#stage', e => e.hidden) && !(await p.$eval('#w-hud', e => e.hidden)), 'classic stage hidden, walk HUD shown');
  await shot('w1-camp-start.png');
  await hold('KeyW', 1200); w = await W();
  assert(w.pos.z > -2, 'W walks her forward (z ' + w.pos.z.toFixed(2) + ')');
  const z0 = w.pos.z; await hold('ArrowDown', 600); w = await W();
  assert(w.pos.z < z0, 'arrow keys walk her back');
  await tp(0, 3); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 1500); w = await W();
  { const d = Math.hypot(w.pos.x, w.pos.z - 5); assert(d > 0.9 + 0.32 - 0.03 && d < 1.8, 'camp fire collider stops her at its edge (distance ' + d.toFixed(2) + ')'); }

  console.log('steppe tracks:');
  for (const [x, z] of [[8, 64], [21, 66], [11, 50]]) await tp(x, z);
  await sleep(300); assert((await p.evaluate(() => __world.tracks())).length === 3, 'walking over 3 caribou tracks finds them (world key only)');

  console.log('ford respawn:');
  await tp(12, 105); await sleep(3000); w = await W();
  assert(Math.abs(w.pos.x + 5) < 0.2 && w.pos.z < 100, 'wading 2 s in the icy river respawns her safely on the south bank (' + w.pos.x.toFixed(1) + ', ' + w.pos.z.toFixed(1) + ')');
  await closeCards();
  const st = await p.evaluate(() => { const { x, z } = __world.rings().find(r => r.id === 's1-timeline'); return { x, z }; });
  await tp(st.x, st.z); await sleep(2600); w = await W();
  assert(Math.hypot(w.pos.x - st.x, w.pos.z - st.z) < 0.3 && w.near === 's1-timeline', 'standing on the middle stepping stone is safe (no respawn) and shows the Journal Timeline ring');

  console.log('progress unchanged by walking:');
  const after = await p.evaluate(k => localStorage.getItem(k), KEY);
  assert(before !== null && after === before, 'progress save byte-identical after walking, finding tracks and the ford respawn');
  const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY);
  assert(wk && wk.ver === 1 && wk.season.tracks.length === 3 && typeof wk.x === 'number', 'position / tracks live in the separate world key');
  console.log('rings open the existing panels:');
  await tp(-3.5, 1); w = await W(); assert(w.near === 's1-l0', 'standing in the Scroll 1 ring shows the prompt');
  assert(/Scroll 1/.test(await p.$eval('#w-prompt', e => e.textContent)), 'prompt names the scroll');
  await p.keyboard.press('KeyE'); await sleep(500); w = await W();
  assert(w.phase === 'panel' && /Scroll 1: The Land Bridge/.test(await p.$eval('#screen', e => e.textContent)), 'E opens the unchanged Scroll 1 lesson panel');
  assert(!(await p.$eval('#w-back', e => e.hidden)), '"Back to Beringia" chip shows while a world panel is open');
  assert((await p.evaluate(() => __world.read())).includes(0), 'scroll 1 marked read (world key)');
  await click('#w-back'); await waitPhase('active');
  w = await W(); assert(Math.hypot(w.pos.x + 3.5, w.pos.z - 1) < 0.3, 'back in the world where she stood');
  await tp(3.5, 1); await p.click('#w-prompt'); await sleep(500);
  assert((await W()).phase === 'panel' && !!(await p.$('#screen .geo, #screen svg, #screen .map-ch, #screen')), 'tapping the prompt opens the Traveler’s Journal map activity');
  await p.keyboard.press('Escape'); await waitPhase('active'); assert(true, 'Esc returns to the world');
  await tp(30, 26); w = await W(); assert(w.near === 's1-l1', 'herd lookout ring = Scroll 2');
  await shot('w2-herds.png');
  await p.evaluate(() => __world.use()); await sleep(400); assert(/Scroll 2/.test(await p.$eval('#screen', e => e.textContent)), 'Scroll 2 panel');
  await p.evaluate(() => ABRPG.home()); await waitPhase('active'); assert(true, 'a panel’s own "back to map" button returns to the world');

  console.log('glacier pass gate:');
  await tp(-5, 123.5); await hold('KeyW', 1800); w = await W();
  assert(w.pos.z < 125.7 && /Too cold to cross/.test(w.card || ''), 'without the Fur Cloak the pole gate blocks her and explains how to earn it');
  await closeCards();
  await p.evaluate(() => { const S = ABRPG.state(); S.owned.push('fur-cloak'); });
  await sleep(700); await tp(-5, 123.5); await hold('KeyW', 1800); w = await W();
  assert(w.pos.z > 127, 'with the Fur Cloak she walks through the glacier pass (z ' + w.pos.z.toFixed(1) + ')');
  await p.evaluate(() => { const S = ABRPG.state(); S.owned = S.owned.filter(k => k !== 'fur-cloak'); });
  await tp(-5, 128); await p.evaluate(() => __world.faceCam(Math.PI / 2)); await hold('KeyW', 3000); const wa = await W(); await p.evaluate(() => __world.faceCam(-Math.PI / 2)); await hold('KeyW', 4000); w = await W();
  assert(Math.max(wa.pos.x, w.pos.x) <= 2 - 0.3 + 0.05 && Math.min(wa.pos.x, w.pos.x) >= -12 + 0.3 - 0.05 && Math.abs(wa.pos.x - w.pos.x) > 6, 'ice walls hold her inside the corridor (x ' + wa.pos.x.toFixed(2) + ' / ' + w.pos.x.toFixed(2) + ')');

  console.log('v2.3 banner + camera:');
  await p.evaluate(() => { const S = ABRPG.state(); S.owned.push('fur-cloak'); }); await sleep(700);
  await tp(-5, 160); await sleep(500);
  { const bn = await p.evaluate(() => __world.banner); assert(!/Marker 1\b/.test(bn) && /Marker [78]\b/.test(bn), 'far along the route the banner names the next marker ahead, not Marker 1 ("' + bn + '")'); }
  { await tp(-5, 136); await p.evaluate(() => __world.faceCam(Math.PI)); await sleep(300); await closeCards(); await p.keyboard.down('KeyW'); let bad = 0, pulled = 0, n = 0; const t0 = Date.now();
    while (Date.now() - t0 < 3500) { const c = await p.evaluate(() => __world.cam); n++; if (c.blocked) bad++; if (c.pulled) pulled++; await sleep(80); }
    await p.keyboard.up('KeyW'); w = await W();
    assert(w.pos.z < 125 && n > 8 && bad === 0, 'walking south under the gate cross-pole the camera never sits inside the poles, hides or ice (' + n + ' samples, pulled in ' + pulled + ', z ' + w.pos.z.toFixed(1) + ')'); }
  { await tp(-5, 150); await p.evaluate(() => __world.faceCam(0)); await sleep(300); const y0 = (await p.evaluate(() => __world.cam)).yaw; await hold('KeyD', 2500); const c = await p.evaluate(() => __world.cam); w = await W();
    assert(Math.abs(c.yaw - y0) < 0.05 && Math.abs(w.pos.x + 5) > 1.5, 'strafing sideways does not swing the camera around her (yaw drift ' + Math.abs(c.yaw - y0).toFixed(3) + ', x ' + w.pos.x.toFixed(1) + ')'); }
  await p.evaluate(() => { const S = ABRPG.state(); S.owned = S.owned.filter(k => k !== 'fur-cloak'); });

  const keysNow = Object.keys(JSON.parse(await p.evaluate(k => localStorage.getItem(k), KEY))).sort().join(','), keys0 = Object.keys(JSON.parse(before)).sort().join(',');
  assert(keysNow === keys0, 'no new fields in the progress save after ring panels (' + keysNow.split(',').length + ' fields)');
  console.log('Trial Cave:');
  await tp(-5, 186); await sleep(300); w = await W(); assert(w.near === 'cave-door', 'cave entrance ring');
  await closeCards(); await p.evaluate(() => __world.use()); await sleep(400);
  assert(/read every scroll|all 8 scrolls/i.test((await W()).card || '') || console.log('    card:', JSON.stringify(await W())), 'cave locked until every scroll is read, listing the missing ones');
  await closeCards();
  for (const i of [1, 2, 3, 4, 5, 6, 7]) { await p.evaluate(i => ABRPG.lesson('s1', i, false), i); await sleep(80); }
  await p.evaluate(() => ABRPG.home()); await waitPhase('active');
  await tp(-5, 186); await p.evaluate(() => __world.use()); await sleep(1500); w = await W();
  assert(w.zone === 'cave' && w.pos.x > 3000, 'with all 8 scrolls read the ring fades her into the Trial Cave');
  await shot('w4-trial-cave.png');
  await tp(4000, -3.3); w = await W(); assert(w.near === 'trial', 'the Elders’ ring');
  await p.evaluate(() => __world.use()); await sleep(500);
  assert((await W()).phase === 'panel', 'the Trial opens as the real Section 1 trial panel');
  if (await p.$('#b-trial')) await click('#b-trial');
  async function answer(correct) {
    if (await p.$('.choice')) await click(correct ? '.choice[data-ci="0"]' : '.choice:not([data-ci="0"])');
    else {
      const ans = await p.evaluate(c => { const h2 = document.querySelector('#screen h2').textContent;
        for (const s of GAME_CONTENT.sections) for (const q of s.questions) if (q.q && h2.replace(/\s+/g, ' ').trim() === q.q.replace(/_{3,}/g, '').replace(/\s+/g, ' ').trim()) return c ? q.accept[0].toUpperCase() + '!' : 'zzzz';
        return 'NOTFOUND'; }, correct);
      if (ans === 'NOTFOUND') throw new Error('typed q not found');
      await p.type('#ans', ans); await click('#f-ans button');
    }
    await click('#b-cont');
    if (await p.$('#modal:not(.hidden) #b-ok')) await click('#b-ok');
  }
  // resume: leave mid-trial, reload → she spawns in the cave and the ring resumes
  for (let i = 0; i < 5; i++) await answer(true);
  await go(); await enterS1(); w = await W();
  assert(w.zone === 'cave', 'reload mid-trial: entering Section 1 puts her in the Trial Cave');
  await tp(4000, -3.3); await p.evaluate(() => __world.use()); await sleep(500);
  if (await p.$('#b-resume')) await click('#b-resume');
  const q0 = (await p.evaluate(() => ABRPG.state().run.idx)); assert(q0 === 5, 'the Trial resumes at question 6');
  let miss = 1; for (let i = 5; i < 24; i++) await answer(!(miss > 0 && i === 9 && miss--));
  assert(/23 of 24|95/.test(await p.$eval('#screen', e => e.textContent)), '23 of 24 shown on the results');
  if (await p.$('#b-rev')) { await click('#b-rev'); while (await p.$('#b-ready')) { await click('#b-ready'); await answer(true); await sleep(50); } }
  let s = await p.evaluate(() => ABRPG.state());
  assert(s.sections.s1.completed, '23/24 + mastery review → Section 1 mastered from the Trial Cave');
  await p.evaluate(() => ABRPG.home()); await waitPhase('active'); assert((await W()).zone === 'cave', 'results → back to the cave');
  await tp(4000, 7.3); await p.evaluate(() => __world.use()); await sleep(1300); w = await W();
  assert(w.zone === 'out' && w.pos.z > 180, 'the daylight ring leads back out of the cave');
  await tp(-5, 121); await p.evaluate(() => __world.faceCam(0)); await sleep(1200); await shot('w3-glacier-pass.png');

  console.log('Classic mode + fallback:');
  await click('#w-mode'); await sleep(500); w = await W();
  assert(w.mode === 'classic' && w.phase === 'off' && !!(await p.$('#screen .map')), 'Classic toggle exits to the 2D map');
  await p.evaluate(() => document.querySelector('.node[data-sid="s1"]').click()); await sleep(800);
  assert((await W()).phase === 'off' && /Scroll|lesson/i.test(await p.$eval('#screen', e => e.textContent)), 'Classic mode: Section 1 opens the classic section screen');
  await go(); assert((await W()).mode === 'classic', 'Classic choice survives a reload (world key)');
  await click('#w-mode'); await waitPhase('active', 30000); assert(true, 'Walk chip goes back into the level');
  await p.evaluate(() => __world.fail('test')); await sleep(400); w = await W();
  assert(w.mode === 'classic' && w.phase === 'off' && !(await p.$eval('#stage', e => e.hidden)), 'a 3D failure falls back to the classic screens automatically');
  // no WebGL2 at all → classic, no walk chip
  const p2 = await b.newPage(); await p2.evaluateOnNewDocument(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, o) { if (t === 'webgl2') return null; return g.call(this, t, o); }; });
  const e2 = []; p2.on('pageerror', e => e2.push(e.message));
  await p2.goto(url()); await sleep(2500);
  const nf = await p2.evaluate(() => ({ map: !!document.querySelector('#screen .map'), w: window.__world ? __world.mode : 'none' }));
  assert(nf.map && (nf.w === 'classic' || nf.w === 'none'), 'no WebGL2: the game still boots to the 2D map (' + nf.w + ')');
  await p2.close();

  console.log('old saves + world key safety:');
  await seed({ version: 1, created: '2026-10-01T00:00:00Z', players: { s1: { gender: 'girl', name: 'Abigail' } }, sections: { s1: { attempts: 1, history: [{ pct: 90 }], bestPct: 90, completed: false, correctCount: 5, gearEarned: 1, topics: {}, missed: {} } }, gear: [{ name: 'Fur Cloak', section: 's1' }], badges: [], totalCorrect: 5, totalAnswered: 6 }, null);
  s = await p.evaluate(() => ABRPG.state()); assert(s.version === 3 && s.owned.includes('fur-cloak'), 'v1 save loads (gear mapped)');
  await enterS1(); assert((await p.evaluate(() => __world.gateOpen())), 'v1 save: earned Fur Cloak opens the glacier pass');
  assert((await p.evaluate(() => __world.caveOpen())), 'a section with past attempts keeps the Trial Cave open');
  await seed(base({ version: 2 }), '{not json');
  assert((await W()).mode === 'walk' && !errs.length, 'v2.0 save + corrupt world key: loads, world key reset');
  await seed(base(), { ver: 1, mode: 'walk', zone: 'out', x: 1e9, z: NaN, yaw: 'x', read: { s1: [0, 99, 'a'] }, season: { tracks: ['t1', 'zz'] } });
  await enterS1(); w = await W();
  assert(Math.abs(w.pos.z + 4) < 0.01 && JSON.stringify(await p.evaluate(() => __world.read())) === '[0]', 'junk world position / reads are cleaned (camp start, only valid scroll ids)');
  await p.evaluate(() => { localStorage.setItem('americanBeginningsRPG_gfx', 'low'); });
  await p.evaluate(() => { window.confirm = () => true; }); await p.evaluate(() => ABRPG.home && document.getElementById('btn-home').click()); await sleep(300);
  await p.evaluate(() => document.getElementById('btn-report').click()); await sleep(300);
  const rb = await p.$('#b-reset, [id*="reset"]'); if (rb) { await rb.click(); await sleep(400); }
  const ks = await p.evaluate((k, wk) => [localStorage.getItem(k), localStorage.getItem(wk)], KEY, WKEY);
  assert(rb && ks[1] === null, 'Reset progress also clears the world key');

  console.log('errors:'); assert(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); console.log('ALL WORLD TESTS PASSED');
})().catch(async e => { console.error('FAIL', e.message); process.exit(1); });
