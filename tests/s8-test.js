/* American Beginnings RPG v3.1 Level 8 test (Section 8: The Road to Revolution).
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8765/ SHOTS=/tmp/wshots/ node tests/s8-test.js
   Run it on its own (SwiftShader is slow). */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const SHOTS = process.env.SHOTS || '/tmp/wshots/'; fs.mkdirSync(SHOTS, { recursive: true });
const BASE = process.env.BASE || 'http://localhost:8765/';
const KEY = 'americanBeginningsRPG_v1', WKEY = 'americanBeginningsRPG_world';
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(c, m) { if (!c) throw new Error('ASSERT: ' + m); console.log('  ok -', m); }
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|assets\/video\//.test(m.text() + ((m.location() || {}).url || ''))) errs.push(m.text()); });
  const url = () => BASE + (BASE.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  const go = async () => { await p.goto(url(), { waitUntil: 'domcontentloaded' }); await sleep(1200); await p.evaluate(() => { if (window.__world) __world.quiet = true; }); };
  const click = async sel => { await p.waitForSelector(sel, { timeout: 10000 }); await p.$eval(sel, e => e.click()); await sleep(60); };
  const W = () => p.evaluate(() => ({ mode: __world.mode, phase: __world.phase, zone: __world.zone, pos: __world.pos, near: __world.near, card: __world.card(), failed: __world.failed }));
  const waitPhase = async (ph, ms = 20000) => { const t = Date.now(); while (Date.now() - t < ms) { if ((await p.evaluate(() => __world.phase)) === ph) return true; await sleep(150); } throw new Error('timeout waiting for phase ' + ph); };
  const closeCards = async () => { await p.evaluate(() => __world.closeCard()); };
  const seed = async (save, world) => { await go(); await p.evaluate((k, wk, s, w) => { localStorage.clear(); if (s) localStorage.setItem(k, JSON.stringify(s)); if (w) localStorage.setItem(wk, JSON.stringify(w)); }, KEY, WKEY, save, world); await go(); };
  const base = (extra = {}) => Object.assign({ version: 3, players: { s1: { gender: 'girl', name: 'Abigail' } }, sections: {}, owned: [], equip: {} }, extra);
  const hold = async (key, ms) => { await closeCards(); await p.keyboard.down(key); await sleep(ms); await p.keyboard.up(key); await sleep(100); };
  const tp = async (x, z) => { await p.evaluate((x, z) => __world.teleport(x, z), x, z); await sleep(250); };
  const shot = async name => { await closeCards(); await sleep(400); await p.screenshot({ path: SHOTS + name }); };
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

  console.log('v3.1 Section 8: The Road to Revolution:');
  const G = { gender: 'girl', name: 'Abigail' }, DONE = () => ({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} });
  const s8base = (extra = {}) => base({ players: { s1: G, s2: G, s3: G, s4: G, s5: G, s6: G, s7: G, s8: G }, sections: { s1: DONE(), s2: DONE(), s3: DONE(), s4: DONE(), s5: DONE(), s6: DONE(), s7: DONE() }, ...extra });
  const enterS8 = async () => { await p.evaluate(() => document.querySelector('.node[data-sid="s8"]').click()); await waitPhase('active', 60000); await sleep(800); await closeCards(); };
  const ringAt = id => p.evaluate(id => __world.rings().find(r => r.id === id), id);
  const tpRing = async id => { const r = await ringAt(id); await tp(r.x, r.z); await sleep(200); return r; };
  const useCard = async id => { await tpRing(id); await p.evaluate(() => __world.use()); await sleep(300); return (await W()).card || ''; };
  await seed(s8base(), null);
  assert(/^v3\.1/.test(await p.$eval('#game-version', e => e.textContent)), 'version marker v3.1');
  const before8 = await p.evaluate(k => localStorage.getItem(k), KEY);
  await enterS8(); let w = await W();
  assert((await p.evaluate(() => __world.level)) === 's8' && w.phase === 'active' && Math.abs(w.pos.x + 6) < 0.01 && Math.abs(w.pos.z + 64) < 0.01, 'tapping Section 8 opens Boston by the Liberty Tree (-6, -64)');
  assert(/Section 8 · The Road to Revolution/.test(await p.$eval('#w-era', e => e.textContent)), 'era label names Section 8');
  { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 1 · /.test(bn), 'at the start the banner names a Marker 1 ring at the Liberty Tree ("' + bn + '")'); }
  { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/"wool"/.test(hk), 'in the 1760s she wears the wool dress (' + hk + ')'); }
  await p.evaluate(() => __world.faceCam(0)); await sleep(600); await shot('v31-liberty-tree.png');
  // geography: north = +z, WEST = +x, so Boston Harbor is east (-x). Liberty Tree south, Faneuil Hall north, the wharves on the harbor; Philadelphia over the river.
  { const S = await p.evaluate(() => __world.stations());
    assert(S.libertytree.z < S.kingstreet.z && S.faneuil.z > S.kingstreet.z && S.longwharf.x < S.kingstreet.x && S.griffins.x < S.faneuil.x && S.gate.z > S.faneuil.z + 30, 'the places sit as planned (Liberty Tree south, Faneuil Hall north, the wharves on the harbor to the east, Philadelphia beyond the river)'); }
  { const sea = await p.evaluate(() => [__world.walkable(-55, -34), __world.walkable(-55, 22)]); assert(!sea[0] && !sea[1], 'the harbor east of Long Wharf and Griffin’s Wharf is water'); }
  { const rs = await p.evaluate(() => __world.rings().map(r => ({ id: r.id, w: __world.walkable(r.x, r.z), s: __world.solid(r.x, r.z) })));
    const off = rs.filter(r => !r.w || r.s); assert(rs.length === 28 && !off.length, 'all 28 rings are on dry, open land (' + rs.length + ' rings; ' + JSON.stringify(off) + ')'); }
  { const rs = await p.evaluate(() => __world.rings()), close = [];
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) if (Math.hypot(rs[i].x - rs[j].x, rs[i].z - rs[j].z) < 2.6) close.push(rs[i].id + '/' + rs[j].id);
    assert(!close.length, 'no two rings overlap (' + close.join(', ') + ')'); }
  { let bad = [], n = 0; const ids = (await p.evaluate(() => __world.rings().map(r => r.id)));
    for (const id of ids) { await tpRing(id);
      for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { await p.evaluate(a => __world.faceCam(a), a); await sleep(260); const c = await p.evaluate(() => __world.cam); n++; if (c.blocked) bad.push(id + '@' + a.toFixed(1)); } }
    assert(n === ids.length * 4 && !bad.length, 'camera never inside a building, wall or tree at ' + ids.length + ' rings × 4 views (' + bad.join(', ') + ')'); }
  { await tp(-6, -64); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 6000); w = await W();
    assert(w.pos.z > -58, 'she can walk north from the Liberty Tree (z ' + w.pos.z.toFixed(2) + ')'); }
  console.log('  the post road to Philadelphia:');
  { await tp(9, 43.5); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 3000); w = await W();
    assert(w.pos.z < 47.5, 'the river keeps her from walking to Philadelphia (z ' + w.pos.z.toFixed(2) + ')'); }
  { const cd = await useCard('ride-south'); assert(/story jump/i.test(cd) && /Philadelphia/.test(cd), 'the Faneuil Hall horse explains the 1774 story jump');
    await p.evaluate(() => __world.ride8('north')); await sleep(1600); await closeCards(); w = await W();
    assert(w.pos.z > 57 && w.pos.z < 62 && !(await p.evaluate(() => __world.solid(__world.pos.x, __world.pos.z))), 'the ride lands her in Philadelphia (' + w.pos.x.toFixed(1) + ', ' + w.pos.z.toFixed(1) + ')');
    const bn = await p.evaluate(() => __world.banner); assert(/^Marker \d · /.test(bn), 'in Philadelphia the banner still names a marker ("' + bn + '")');
    await p.evaluate(() => __world.ride8('south')); await sleep(1600); await closeCards(); w = await W();
    assert(w.pos.z < 47 && w.pos.z > 40, 'the ride back lands her in Boston (z ' + w.pos.z.toFixed(1) + ')'); }
  console.log('  scrolls and cards:');
  for (const [id, re, i] of [['s8-l0', /debt|Empire/, 0], ['s8-l1', /Stamp Act/, 1]]) {
    await tpRing(id); await p.evaluate(() => __world.use()); await sleep(400);
    assert((await W()).phase === 'panel' && re.test(await p.$eval('#screen', e => e.textContent)), id + ' ring opens its scroll');
    if (i === 0) assert(/Back to Boston/.test(await p.$eval('#w-back', e => e.textContent)), '"Back to Boston" chip shows while a Section 8 panel is open');
    assert((await p.evaluate(() => __world.readL('s8'))).includes(i), 'scroll ' + (i + 1) + ' marked read for Section 8 (world key)');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
  for (const [id, re] of [['tree', /August 14, 1765/], ['troops', /October 1, 1768/], ['massacre8', /Crispus Attucks/], ['engraving', /propaganda/], ['oldsouth8', /1729/], ['wheatley', /Samson Occom/], ['teaships', /342 chests/], ['gifts', /grasshopper/], ['edenton', /Penelope Barker/], ['carpenters', /twelve colonies/]]) {
    const cd = await useCard(id); assert(re.test(cd) && (await p.evaluate(id => __world.seen()[id], id)), id + ' card tells its fact (' + re + ')'); await closeCards(); }
  { const cd = await useCard('engraving'); assert(/not what happened/.test(cd) && /defended the soldiers/.test(cd), 'the engraving card is honest that the print was misleading, and that Adams defended the soldiers'); await closeCards(); }
  { const cd = await useCard('tree'); assert(/Hutchinson/.test(cd) && /too far/.test(cd), 'the Liberty Tree card is honest that some protests turned violent'); await closeCards(); }
  { await tp(0, -19); await p.evaluate(() => __world.faceCam(0)); await sleep(600); await shot('v31-king-street.png'); }
  { await tp(-20, 22); await p.evaluate(() => __world.faceCam(-Math.PI / 2)); await sleep(600); await shot('v31-tea-ships.png'); }
  { await tp(26, 1); await p.evaluate(() => __world.faceCam(0)); await sleep(600); await shot('v31-old-south.png'); }
  { await tp(-17, -37); await p.evaluate(() => __world.faceCam(-Math.PI / 2)); await sleep(600); await shot('v31-long-wharf.png'); }
  { await tp(8, 64); await p.evaluate(() => __world.faceCam(0)); await sleep(600); await shot('v31-carpenters-hall.png'); }
  { await tpRing('market'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel' && /Long Wharf/.test(await p.$eval('#screen', e => e.textContent)), 'the market ring opens Mistress Crane’s Shop on Long Wharf');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
  const after8 = await p.evaluate(k => localStorage.getItem(k), KEY);
  assert(Object.keys(JSON.parse(after8)).sort().join(',') === Object.keys(JSON.parse(before8)).sort().join(','), 'no new progress-save fields from exploring Section 8');
  console.log('  Carpenters’ Hall (Trial):');
  { const cd = await useCard('trial'); assert(/all 9 scrolls/.test(cd) && (await W()).phase === 'active', 'the Trial ring stays locked until all 9 scrolls are read'); await closeCards(); }
  for (const i of [0, 1, 2, 3, 4, 5, 6]) { await p.evaluate(i => ABRPG.lesson('s8', i, false), i); await sleep(80); }
  await p.evaluate(() => ABRPG.home()); await waitPhase('active');
  assert(!(await p.evaluate(() => __world.gateOpenS8())), 'with 7 of 9 scrolls the Trial is still shut');
  for (const i of [7, 8]) { await p.evaluate(i => ABRPG.lesson('s8', i, false), i); await sleep(80); }
  await p.evaluate(() => ABRPG.home()); await waitPhase('active');
  assert(await p.evaluate(() => __world.gateOpenS8()) && (await ringAt('trial')).state === 'new', 'with all 9 scrolls read the Trial opens');
  await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500);
  assert((await W()).phase === 'panel', 'the Trial opens as the real Section 8 trial panel');
  if (await p.$('#b-trial')) await click('#b-trial');
  for (let i = 0; i < 3; i++) await answer(true);
  await go(); await enterS8(); w = await W();
  { const t = await ringAt('trial'); assert((await p.evaluate(() => __world.level)) === 's8' && Math.hypot(w.pos.x - t.x, w.pos.z - t.z + 4) < 1, 'reload mid-trial: entering Section 8 puts her by the Trial ring'); }
  await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500); if (await p.$('#b-resume')) await click('#b-resume');
  assert((await p.evaluate(() => ABRPG.state().run.idx)) === 3, 'the Section 8 Trial resumes at question 4');
  await p.evaluate(() => ABRPG.home()); await waitPhase('active');
  { const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY); assert(wk.read.s8.length === 9 && wk.seen.tree && wk.seen.carpenters && wk.at && wk.at.s8, 'Section 8 scrolls, cards and position live in the world key'); }
  console.log('  world key safety + Boston gear:');
  await seed(s8base(), { ver: 1, mode: 'walk', at: { s8: { x: 1e9, z: 3, yaw: 'q' } }, read: { s8: [0, 9, 'a', 8, 8] }, seen: { help8: true, tree: 'yes', bogus: true } });
  await enterS8(); w = await W();
  assert(Math.abs(w.pos.x + 6) < 0.01 && Math.abs(w.pos.z + 64) < 0.01 && JSON.stringify(await p.evaluate(() => __world.readL('s8'))) === '[0,8]' && !(await p.evaluate(() => __world.seen())).bogus, 'junk Section 8 world data is cleaned (start spot, only valid scroll ids)');
  await seed(s8base({ owned: ['homespun-gown', 'red-cloak'], equip: { dress: 'homespun-gown', cloak: 'red-cloak' } }), { ver: 1, mode: 'walk', at: { s8: { x: 8, z: 74, yaw: 0 } }, seen: { help8: true } });
  await enterS8(); w = await W();
  assert(Math.abs(w.pos.x - 8) < 0.01 && Math.abs(w.pos.z - 74) < 0.01, 'a saved spot in Philadelphia (north of the river) is restored');
  { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/plain-gown|homespun/.test(hk) && /hooded-cloak|red-cloak/.test(hk), 'the Long Wharf gown and red cloak show in Level 8 (' + hk + ')'); }
  await p.evaluate(() => __world.faceCam(Math.PI / 2)); await sleep(900); await shot('v31-hero.png');
  { await p.setViewport({ width: 390, height: 844 }); await p.evaluate(() => document.body.classList.add('touch')); await tpRing('massacre8'); await sleep(700); await shot('v31-phone-390x844.png');
    await p.evaluate(() => document.body.classList.remove('touch')); await p.setViewport({ width: 1280, height: 800 }); await sleep(300); }
  console.log('errors:'); assert(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); console.log('ALL S8 TESTS PASSED');
})().catch(async e => { console.error('FAIL', e.message); process.exit(1); });
