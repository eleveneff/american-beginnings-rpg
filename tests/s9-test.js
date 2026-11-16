/* American Beginnings RPG v3.4-l9 Level 9 test (Section 9: Independence Declared).
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8878/ SHOTS=/tmp/wshots/ node tests/s9-test.js
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

  console.log('v3.4-l9 Section 9: Independence Declared:');
  const G = { gender: 'girl', name: 'Abigail' }, DONE = () => ({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} });
  const s9base = (extra = {}) => base({ players: { s1: G, s2: G, s3: G, s4: G, s5: G, s6: G, s7: G, s8: G, s9: G }, sections: { s1: DONE(), s2: DONE(), s3: DONE(), s4: DONE(), s5: DONE(), s6: DONE(), s7: DONE(), s8: DONE() }, ...extra });
  const enterS9 = async () => { await p.evaluate(() => document.querySelector('.node[data-sid="s9"]').click()); await waitPhase('active', 60000); await sleep(800); await closeCards(); };
  const ringAt = id => p.evaluate(id => __world.rings().find(r => r.id === id), id);
  const tpRing = async id => { const r = await ringAt(id); await tp(r.x, r.z); await sleep(200); return r; };
  const useCard = async id => { await tpRing(id); await p.evaluate(() => __world.use()); await sleep(300); return (await W()).card || ''; };
  await seed(s9base(), null);
  assert(/^v3\.4-l9/.test(await p.$eval('#game-version', e => e.textContent)), 'version marker v3.4-l9');
  const before9 = await p.evaluate(k => localStorage.getItem(k), KEY);
  await enterS9(); let w = await W();
  assert((await p.evaluate(() => __world.level)) === 's9' && w.phase === 'active' && Math.abs(w.pos.x + 6) < 0.01 && Math.abs(w.pos.z + 64) < 0.01, 'tapping Section 9 opens Lexington, south of the Green (-6, -64)');
  assert(/Section 9 · Independence Declared/.test(await p.$eval('#w-era', e => e.textContent)), 'era label names Section 9');
  { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 1 · /.test(bn), 'at the start the banner names a Marker 1 ring at Lexington ("' + bn + '")'); }
  { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/"wool"/.test(hk), 'in 1775–76 she wears the wool dress (' + hk + ')'); }
  await p.evaluate(() => __world.faceCam(0)); await sleep(600); await shot('l9-lexington-green.png');
  { const S = await p.evaluate(() => __world.stations());
    assert(S.lexington.z < S.concord.z && S.concord.z < S.bunkerhill.z && S.cambridge.z > S.bunkerhill.z && S.gate.z > S.cambridge.z + 30, 'the places sit in story order south to north (Lexington, Concord, Breed’s Hill, Cambridge, then Philadelphia beyond the river)'); }
  { const river = await p.evaluate(() => [__world.walkable(8, 51), __world.solid(8, 51)]); assert(!river[0] && river[1], 'the story-jump river between Cambridge and Philadelphia is water'); }
  { const deck = await p.evaluate(() => [__world.walkable(-32, -24), __world.solid(-32, -24), __world.pathDist(-32, -24)]);
    assert(deck[0] && !deck[1] && deck[2] <= 1.6, 'the North Bridge deck is walkable and the path runs over it (walkable ' + deck[0] + ', solid ' + deck[1] + ', pathDist ' + deck[2] + ')'); }
  { const water = await p.evaluate(() => {
      const B = __world._dbg().L.mods.B, zn = B.CONCORD_BZ + 6, zs = B.CONCORD_BZ - 6;
      const xn = B.concordCenterX(zn), xs = B.concordCenterX(zs);
      return [__world.walkable(xn, zn), __world.solid(xn, zn), __world.walkable(xs, zs), __world.solid(xs, zs)];
    });
    assert(!water[0] && water[1] && !water[2] && water[3], 'the Concord River is water under and beyond the North Bridge (north and south of the deck)'); }
  { await tp(-46, -24); await p.evaluate(() => __world.faceCam(Math.PI / 2)); await sleep(400);
    const land = await p.evaluate(() => [__world.walkable(-46, -24), __world.solid(-46, -24)]);
    assert(land[0] && !land[1], 'the east-bank viewpoint is dry land (walkable ' + land[0] + ', solid ' + land[1] + ')');
    const bn = await p.evaluate(() => __world.banner);
    assert(/Concord|North Bridge/i.test(bn) && !/Lexington/i.test(bn), 'at the North Bridge the compass names Concord, not Lexington ("' + bn + '")'); }
  { const rs = await p.evaluate(() => __world.rings().map(r => ({ id: r.id, w: __world.walkable(r.x, r.z), s: __world.solid(r.x, r.z) })));
    const off = rs.filter(r => !r.w || r.s); assert(rs.length === 25 && !off.length, 'all 25 rings are on dry, open land (' + rs.length + ' rings; ' + JSON.stringify(off) + ')'); }
  { const rs = await p.evaluate(() => __world.rings()), close = [];
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) if (Math.hypot(rs[i].x - rs[j].x, rs[i].z - rs[j].z) < 2.6) close.push(rs[i].id + '/' + rs[j].id);
    assert(!close.length, 'no two rings overlap (' + close.join(', ') + ')'); }
  { await tp(-6, -64); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 6000); w = await W();
    assert(w.pos.z > -58, 'she can walk north from Lexington Green (z ' + w.pos.z.toFixed(2) + ')'); }
  console.log('  the post road to Philadelphia:');
  { await tp(6, 43.5); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 3000); w = await W();
    assert(w.pos.z < 47.5, 'the river keeps her from walking to Philadelphia (z ' + w.pos.z.toFixed(2) + ')'); }
  { const cd = await useCard('ride-south'); assert(/story jump/i.test(cd) && /Philadelphia/.test(cd), 'the Cambridge horse explains the 1776 story jump');
    await p.evaluate(() => __world.ride9('north')); await sleep(1600); await closeCards(); w = await W();
    assert(w.pos.z > 57 && w.pos.z < 62 && !(await p.evaluate(() => __world.solid(__world.pos.x, __world.pos.z))), 'the ride lands her in Philadelphia (' + w.pos.x.toFixed(1) + ', ' + w.pos.z.toFixed(1) + ')');
    const bn = await p.evaluate(() => __world.banner); assert(/^Marker \d · /.test(bn), 'in Philadelphia the banner still names a marker ("' + bn + '")');
    await p.evaluate(() => __world.ride9('south')); await sleep(1600); await closeCards(); w = await W();
    assert(w.pos.z < 47 && w.pos.z > 40, 'the ride back lands her in Cambridge (z ' + w.pos.z.toFixed(1) + ')'); }
  console.log('  scrolls and cards:');
  for (const [id, re, i] of [['s9-l0', /Revere|Lexington|April 18/, 0], ['s9-l1', /North Bridge|Concord/, 1]]) {
    await tpRing(id); await p.evaluate(() => __world.use()); await sleep(400);
    assert((await W()).phase === 'panel' && re.test(await p.$eval('#screen', e => e.textContent)), id + ' ring opens its scroll');
    if (i === 0) assert(/Back to 1776/.test(await p.$eval('#w-back', e => e.textContent)), '"Back to 1776" chip shows while a Section 9 panel is open');
    assert((await p.evaluate(() => __world.readL('s9'))).includes(i), 'scroll ' + (i + 1) + ' marked read for Section 9 (world key)');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
  for (const [id, re] of [['buckman', /April 19, 1775|Buckman/], ['bridge9', /shot heard/], ['hill9', /Breed/], ['washington9', /July 3, 1775/], ['hall9', /State House|July 4|Dunlap/]]) {
    const cd = await useCard(id); assert(re.test(cd) && (await p.evaluate(id => __world.seen()[id], id)), id + ' card tells its fact (' + re + ')'); await closeCards(); }
  { const cd = await useCard('hill9'); assert(/powder ran out/.test(cd) && /Breed/.test(cd), 'the Breed’s Hill card is honest that the British took the hill when the powder ran out, and that the fight was on Breed’s Hill'); await closeCards(); }
  { const cd = await useCard('hall9'); assert(/1777/.test(cd) && /Stars and Stripes/.test(cd) && /1781/.test(cd) && !/Grand Union/.test(cd), 'the State House card is honest about the 1776 steeple (taken down in 1781) and that the Stars and Stripes is 1777, with no invented flag'); await closeCards(); }
  { await tpRing('market'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel' && /State House|Biddle|Philadelphia/.test(await p.$eval('#screen', e => e.textContent)), 'the market ring opens Mistress Biddle’s Shop near the State House');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
  const after9 = await p.evaluate(k => localStorage.getItem(k), KEY);
  assert(Object.keys(JSON.parse(after9)).sort().join(',') === Object.keys(JSON.parse(before9)).sort().join(','), 'no new progress-save fields from exploring Section 9');
  console.log('  Independence Hall (Trial):');
  { const cd = await useCard('trial'); assert(/all 9 scrolls/.test(cd) && (await W()).phase === 'active', 'the Trial ring stays locked until all 9 scrolls are read'); await closeCards(); }
  for (const i of [0, 1, 2, 3, 4, 5, 6]) { await p.evaluate(i => ABRPG.lesson('s9', i, false), i); await sleep(80); }
  await p.evaluate(() => ABRPG.home()); await waitPhase('active');
  assert(!(await p.evaluate(() => __world.gateOpenS9())), 'with 7 of 9 scrolls the Trial is still shut');
  for (const i of [7, 8]) { await p.evaluate(i => ABRPG.lesson('s9', i, false), i); await sleep(80); }
  await p.evaluate(() => ABRPG.home()); await waitPhase('active');
  assert(await p.evaluate(() => __world.gateOpenS9()) && (await ringAt('trial')).state === 'new', 'with all 9 scrolls read the Trial opens');
  await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500);
  assert((await W()).phase === 'panel', 'the Trial opens as the real Section 9 trial panel');
  if (await p.$('#b-trial')) await click('#b-trial');
  for (let i = 0; i < 3; i++) await answer(true);
  await go(); await enterS9(); w = await W();
  { const t = await ringAt('trial'); assert((await p.evaluate(() => __world.level)) === 's9' && Math.hypot(w.pos.x - t.x, w.pos.z - t.z + 4) < 1, 'reload mid-trial: entering Section 9 puts her by the Trial ring'); }
  await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500); if (await p.$('#b-resume')) await click('#b-resume');
  assert((await p.evaluate(() => ABRPG.state().run.idx)) === 3, 'the Section 9 Trial resumes at question 4');
  await p.evaluate(() => ABRPG.home()); await waitPhase('active');
  { const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY); assert(wk.read.s9.length === 9 && wk.seen.buckman && wk.seen.hall9 && wk.at && wk.at.s9, 'Section 9 scrolls, cards and position live in the world key'); }
  console.log('  world key safety + Philadelphia gear:');
  await seed(s9base(), { ver: 1, mode: 'walk', at: { s9: { x: 1e9, z: 3, yaw: 'q' } }, read: { s9: [0, 9, 'a', 8, 8] }, seen: { help9: true, buckman: 'yes', bogus: true } });
  await enterS9(); w = await W();
  assert(Math.abs(w.pos.x + 6) < 0.01 && Math.abs(w.pos.z + 64) < 0.01 && JSON.stringify(await p.evaluate(() => __world.readL('s9'))) === '[0,8]' && !(await p.evaluate(() => __world.seen())).bogus, 'junk Section 9 world data is cleaned (start spot, only valid scroll ids)');
  await seed(s9base({ owned: ['hunting-shirt', 'blue-cloak'], equip: { dress: 'hunting-shirt', cloak: 'blue-cloak' } }), { ver: 1, mode: 'walk', at: { s9: { x: 8, z: 74, yaw: 0 } }, seen: { help9: true } });
  await enterS9(); w = await W();
  assert(Math.abs(w.pos.x - 8) < 0.01 && Math.abs(w.pos.z - 74) < 0.01, 'a saved spot in Philadelphia (north of the river) is restored');
  { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/hunting-shirt|jerkin/.test(hk) && /hooded-cloak|blue-cloak/.test(hk), 'the hunting shirt and blue cloak show in Level 9 (' + hk + ')'); }
  await p.evaluate(() => __world.faceCam(Math.PI / 2)); await sleep(900); await shot('l9-hero.png');
  { await p.setViewport({ width: 390, height: 844 }); await p.evaluate(() => document.body.classList.add('touch')); await tpRing('hill9'); await sleep(700); await shot('l9-phone-390x844.png');
    await p.evaluate(() => document.body.classList.remove('touch')); await p.setViewport({ width: 1280, height: 800 }); await sleep(300); }
  console.log('errors:'); assert(!errs.length, 'no page errors (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); console.log('ALL S9 TESTS PASSED');
})().catch(e => { console.error(e); process.exit(1); });
