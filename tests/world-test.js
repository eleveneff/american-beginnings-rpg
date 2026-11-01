/* American Beginnings RPG v2.2–v2.6 walkable-world test (Section 1: Beringia; v2.4 adds Section 2: Native Nations; v2.5 adds Section 3: the Voyage of 1492; v2.6 adds Section 4: Three Empires).
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
  assert((await p.$eval('#game-version', e => e.textContent)) === 'v2.7' && (await p.evaluate(() => ABRPG.version)) === 'v2.7', 'version marker v2.7');
  let w = await W();
  { const mv = await p.evaluate(() => { const out = []; const walk = (o, path) => { if (typeof o === 'string') { if (/Monte Verde/.test(o)) out.push(o); } else if (o && typeof o === 'object') for (const k in o) walk(o[k], path + '.' + k); }; walk(window.GAME_CONTENT, ''); return out; });
    assert(mv.length >= 8 && mv.every(t => !/14,000/.test(t)) && mv.some(t => /southern Chile/.test(t) && /14,500/.test(t) && /older than Clovis/.test(t)), 'Monte Verde is labelled consistently (about 14,500 years ago, southern Chile, older than Clovis; ' + mv.length + ' mentions)'); }
  assert(w.mode === 'walk' && w.phase === 'off' && !w.failed, 'WebGL2 device defaults to walk mode; home map stays the 2D map');
  assert(!(await p.$eval('#w-banner', e => e.hidden)) && /New in v2\.7/.test(await p.$eval('#w-banner', e => e.textContent)), '"New in v2.7" banner shows on the map (non-blocking)');

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
  await tp(st.x, st.z); await sleep(900); w = await W();
  { const f = await p.evaluate(() => __world.ford());
    assert(w.near === 's1-timeline' && f.armed && f.row === 0 && f.labels === 2 && f.rows.length === 8, 'south bank: the Timeline ring sits by the ford, the stones arm as a timeline and row 1 shows 2 labels');
    assert(f.rows.every((r, k) => k === 7 ? r.right === -1 : (r.right === 0 || r.right === 1) && +r.wrong > k), 'each row holds its event plus a later one (the last row has one stone)'); }
  await closeCards();

  console.log('progress unchanged by walking:');
  const after = await p.evaluate(k => localStorage.getItem(k), KEY);
  assert(before !== null && after === before, 'progress save byte-identical after walking, finding tracks and the ford respawn');
  const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY);
  assert(wk && wk.ver === 1 && wk.season.tracks.length === 3 && typeof wk.x === 'number', 'position / tracks live in the separate world key');
  console.log('v2.3 ford timeline puzzle:');
  { const keys0 = Object.keys(JSON.parse(before || '{}')).sort().join(',');
    const ford = () => p.evaluate(() => __world.ford());
    const stone = (f, k, ok) => f.stones.find(s => s.row === k && (f.rows[k].right === -1 || (ok ? s.side === f.rows[k].right : s.side !== f.rows[k].right)));
    let f = await ford(); const bad = stone(f, 0, false);
    await tp(bad.x, bad.z); await sleep(1400); w = await W();
    let S = await p.evaluate(() => ABRPG.state());
    const sk = (S.skills || {})['s1-timeline'] || {};
    assert(Math.abs(w.pos.x + 5) < 0.3 && w.pos.z < (await ford()).stones[0].z - 3 && (await ford()).row === 0, 'a wrong (later) stone splashes her back onto the south bank (' + w.pos.x.toFixed(1) + ', ' + w.pos.z.toFixed(1) + ')');
    assert(sk.wrong === 1 && sk.plays === 1 && Object.keys(sk.missed || {}).length === 1, 'the miss is logged like the card timeline: wrong 1, one fact in mastery review');
    for (let k = 0; k < 8; k++) { f = await ford(); const s = stone(f, k, true); await tp(s.x, s.z); await sleep(300); if (k === 4) { f = await ford(); assert(f.row === 5 && f.armed, 'right stones light up row by row (row ' + f.row + ')'); await shot('w-ford-puzzle.png'); } }
    await waitPhase('panel', 8000);
    S = await p.evaluate(() => ABRPG.state()); const a = S.acts['s1-timeline'], sk2 = S.skills['s1-timeline'];
    assert(/Timeline of the First Americans complete/.test(await p.$eval('#screen', e => e.textContent)) && a.plays === 1 && a.history[0].mistakes === 1 && a.history[0].rating === 2, 'crossing in order finishes the timeline: the normal results panel, 1 mistake = 2 stars');
    assert(sk2.right === 7 && Object.keys(sk2.credited).length === 7, 'stars per right event credited once, the missed event earns none (same as the card version)');
    assert(Object.keys(S).sort().join(',') === keys0 && !/ford/i.test(JSON.stringify(S)), 'no new save fields (top-level keys unchanged, nothing ford-specific saved)');
    await p.evaluate(() => document.querySelector('#a-back').click()); await waitPhase('active');
    f = await ford(); const mid = f.stones.find(s => s.row === 3 && s.side === 0);
    await tp(mid.x, mid.z); await sleep(1500); w = await W(); f = await ford();
    assert(!f.armed && f.solved && Math.hypot(w.pos.x - mid.x, w.pos.z - mid.z) < 0.3, 'once played, the stones are a safe crossing (no splash)');
    await tp(st.x, st.z); await sleep(500); await p.evaluate(() => __world.use()); await sleep(400); const cd = (await W()).card || '';
    assert(/Replay on the river stones/.test(cd) && /Card version/.test(cd), 'the bank ring offers a replay on the stones or the card version');
    await closeCards(); }
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
  await p.evaluate(() => { const S = ABRPG.state(); S.owned = S.owned.filter(k => k !== 'fur-cloak'); }); await sleep(700);   // the ford timeline's 5th right answer earned the cloak (gear every 5 correct)
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
  console.log('v2.3 glacier pass:');
  { await tp(-5, 150); await sleep(300);
    const g = await p.evaluate(() => { const { L, THREE } = __world._dbg(), sc = L.lvl.scene, rc = new THREE.Raycaster(), hits = [], hy = L.hero.root.position.y, notHero = o => { let q = o.object; while (q) { if (q === L.hero.root) return false; q = q.parent; } return o.object.isMesh && o.object.visible; }, objs = []; sc.traverse(o => { if (o.isMesh && !o.isSprite) objs.push(o); });
      const by = n => sc.getObjectByName(n);
      for (const [z, dir] of [[135, -1], [158, -1], [172, -1], [135, 1], [158, 1], [166, 1]]) { rc.set(new THREE.Vector3(-5, hy + 1.0, z), new THREE.Vector3(dir, 0, 0)); rc.far = 20;
        const h = rc.intersectObjects(objs, false).find(o => notHero(o) && !(o.object.parent && o.object.parent.name.startsWith('ring')) && o.object.name !== 'hide-flags'); hits.push(h ? +h.point.x.toFixed(2) : null); }
      // tallness: from the corridor the ice reaches above 9 m on both sides
      rc.far = 20; rc.set(new THREE.Vector3(-5, hy + 9.5, 150), new THREE.Vector3(-1, 0, 0)); const tl = rc.intersectObjects(objs, false).find(notHero); rc.set(new THREE.Vector3(-5, hy + 9.5, 150), new THREE.Vector3(1, 0, 0)); const tr = rc.intersectObjects(objs, false).find(notHero);
      const f = by('hide-flags'), a0 = Array.from(f.geometry.attributes.position.array);
      return { hits, tall: !!(tl && tr), floor: !!by('corridor-floor'), melt: !!by('meltwater'), flags: !!f, a0 }; });
    assert(g.hits.every((x, i) => x !== null && (i < 3 ? Math.abs(x + 12) < 0.6 : Math.abs(x - 2) < 0.6)), 'the ice faces she sees sit on the wall colliders (hits at 1 m: ' + g.hits.join(', ') + ')');
    assert(g.tall, 'the ice walls stand taller than 9 m on both sides of the corridor');
    assert(g.floor && g.melt, 'the corridor has its gravel/tundra floor and a meltwater runnel');
    await tp(-5, 132); await sleep(900);
    const a1 = await p.evaluate(() => Array.from(__world._dbg().L.lvl.scene.getObjectByName('hide-flags').geometry.attributes.position.array));
    const moved = a1.reduce((m, v, i) => Math.max(m, Math.abs(v - g.a0[i])), 0);
    assert(g.flags && moved > 0.01, 'the hide flags on the gate move like cloth when she is near (max vertex move ' + moved.toFixed(3) + ' m)'); }
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
  { const lb = await p.evaluate(() => [...document.querySelectorAll('#screen #b-map')].map(b => b.textContent)), top = await p.$eval('#btn-home', e => e.textContent);
    assert(lb.length && lb.every(t => /Back to Beringia/.test(t)) && /Map/.test(top), 'results button says "Back to Beringia" (what it does); the top-bar 🗺️ Map stays the world map (' + lb.join('|') + ')'); }
  await click('#screen #b-map'); await waitPhase('active'); assert((await W()).zone === 'cave', 'results → back to the cave');
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

  console.log('v2.4 Section 2: Native Nations level:');
  { const s2base = () => base({ players: { s1: { gender: 'girl', name: 'Abigail' }, s2: { gender: 'girl', name: 'Abigail' } }, sections: { s1: { attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} } } });
    const enterS2 = async () => { await p.evaluate(() => document.querySelector('.node[data-sid="s2"]').click()); await waitPhase('active', 40000); await sleep(800); await closeCards(); };
    const ringAt = id => p.evaluate(id => __world.rings().find(r => r.id === id), id);
    const tpRing = async id => { const r = await ringAt(id); await tp(r.x, r.z); await sleep(200); return r; };
    await seed(s2base(), null);
    const before2 = await p.evaluate(k => localStorage.getItem(k), KEY);
    await enterS2(); w = await W();
    assert((await p.evaluate(() => __world.level)) === 's2' && w.phase === 'active' && Math.abs(w.pos.x) < 0.01 && Math.abs(w.pos.z + 8) < 0.01, 'tapping Section 2 opens the Native Nations level south of the council fire (0, -8)');
    assert(/Section 2 · Native Nations/.test(await p.$eval('#w-era', e => e.textContent)), 'era label names Section 2');
    { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 1 · Council fire: /.test(bn), 'at the start the banner names a Marker 1 ring at the council fire ("' + bn + '")'); }
    await p.evaluate(() => __world.faceCam(0)); await sleep(500); await shot('v24-hub.png');
    await hold('KeyW', 1000); w = await W(); assert(w.pos.z > -6.5, 'W walks her north toward the fire (z ' + w.pos.z.toFixed(2) + ')');
    // geography drawn in code: north = +z, WEST = +x; the hide map faces south so a reader facing north has west on her left
    { const g = await p.evaluate(() => { const S = __world.stations(), { L, THREE } = __world._dbg(), hm = L.lvl.scene.getObjectByName('hide-map'), n = new THREE.Vector3(0, 0, 1).applyQuaternion(hm.getWorldQuaternion(new THREE.Quaternion()));
      return { S, nz: n.z, hz: hm.getWorldPosition(new THREE.Vector3()).z }; });
      const S = g.S; assert(S.nw.z > 30 && S.nw.x > 20 && S.plains.x > 40 && S.sw.z < -30 && S.sw.x > 20 && S.ew.x < -20 && S.ew.z > 30 && S.mound.x < -20 && S.mound.z < -30 && S.plaza.x < -40, 'stations sit in their real directions (Northwest Coast north-west, Plains west, Southwest south-west, Woodlands north-east, mound town south-east)');
      const gm = await ringAt('s2-geomap'); assert(g.nz < -0.99 && gm.z < g.hz, 'the painted hide map faces south and its ring is on its south side (she reads it facing north, west on her left)'); }
    // rings: on (or right beside) the roads, standable, never in the sea
    { const rs = await p.evaluate(() => { const S = __world.stations(); return __world.rings().map(r => ({ id: r.id, d: __world.pathDist(r.x, r.z), w: __world.walkable(r.x, r.z), s: __world.solid(r.x, r.z) })); });
      const off = rs.filter(r => !(r.d <= 3.2) || !r.w || r.s); assert(rs.length === 17 && !off.length, 'all 17 rings are standable and within 3.2 m of a road (' + JSON.stringify(off) + ')'); }
    console.log('  walls, shore and camera:');
    { await tp(-42, 48 + 17.5); await p.evaluate(() => __world.faceCam(Math.PI)); await hold('KeyW', 2500); w = await W();
      assert(Math.hypot(w.pos.x + 42, w.pos.z - 48) > 15 + 0.25, 'the palisade stops her from the north side (' + Math.hypot(w.pos.x + 42, w.pos.z - 48).toFixed(2) + ' m from the centre)');
      const ga = await p.evaluate(() => __world._dbg().L.mods.B.PALISADE.gapA); await tp(-42 + Math.cos(ga) * 19, 48 + Math.sin(ga) * 19); await p.evaluate(a => __world.faceCam(a), Math.atan2(-Math.cos(ga), -Math.sin(ga))); await hold('KeyW', 2600); w = await W();
      assert(Math.hypot(w.pos.x + 42, w.pos.z - 48) < 14, 'she walks in through the palisade gap (' + Math.hypot(w.pos.x + 42, w.pos.z - 48).toFixed(2) + ' m from the centre)');
      await tp(38, 60); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 3000); w = await W();
      assert(!(await p.evaluate((x, z) => __world.solid(x, z), w.pos.x, w.pos.z)) && w.pos.z < 66, 'the sea north of the Northwest Coast beach stops her at the shore (z ' + w.pos.z.toFixed(2) + ')'); }
    { let bad = [], n = 0;
      for (const id of ['s2-l0', 's2-l1', 's2-l2', 's2-l3', 'kiva', 's2-l4', 's2-clanmother', 's2-l6', 's2-l5', 'moundinfo', 's2-clues', 'market', 'chunkey', 'trial']) { await tpRing(id);
        for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { await p.evaluate(a => __world.faceCam(a), a); await sleep(160); const c = await p.evaluate(() => __world.cam); n++; if (c.blocked) bad.push(id + '@' + a.toFixed(1)); } }
      assert(n === 56 && !bad.length, 'camera never inside a house, tree, wall or the mound at 14 rings × 4 views (' + bad.join(', ') + ')'); }
    { const ga = await p.evaluate(() => __world._dbg().L.mods.B.PALISADE.gapA); await tp(-42 + Math.cos(ga) * 21, 48 + Math.sin(ga) * 21); await p.evaluate(a => __world.faceCam(a), Math.atan2(-Math.cos(ga), -Math.sin(ga))); await sleep(300); await closeCards(); await p.keyboard.down('KeyW'); let bad = 0, n = 0; const t0 = Date.now();
      while (Date.now() - t0 < 3000) { const c = await p.evaluate(() => __world.cam); n++; if (c.blocked) bad++; await sleep(80); }
      await p.keyboard.up('KeyW'); assert(n > 8 && bad === 0, 'walking into the palisade gap and between the longhouses the camera stays clear (' + n + ' samples)'); }
    { await tp(0, -4); await p.evaluate(() => __world.faceCam(0)); await sleep(300); const y0 = (await p.evaluate(() => __world.cam)).yaw; await hold('KeyD', 2000); const c = await p.evaluate(() => __world.cam);
      assert(Math.abs(c.yaw - y0) < 0.05, 'strafing does not swing the camera around her here either (yaw drift ' + Math.abs(c.yaw - y0).toFixed(3) + ')'); }
    const after2 = await p.evaluate(k => localStorage.getItem(k), KEY);
    assert(after2 === before2, 'progress save byte-identical after walking the Native Nations level');
    const keys2 = Object.keys(JSON.parse(before2)).sort().join(',');
    console.log('  banner:');
    { await tp(52, -1); await sleep(400); const bn = await p.evaluate(() => __world.banner);
      assert(/^Marker 3 · Great Plains/.test(bn) && (await p.evaluate(() => __world.target)) === 's2-l2', 'standing in the Plains camp the banner names its unread scroll, not Marker 1 ("' + bn + '")');
      await tp(20, -22); await sleep(400);
      const exp = await p.evaluate(() => { const pos = __world.pos; let best = null, bd = 1e9; for (const r of __world.rings()) if (/^s2-/.test(r.id) && r.state === 'new') { const d = Math.hypot(r.x - pos.x, r.z - pos.z); if (d < bd) { bd = d; best = r.id; } } return best; });
      assert((await p.evaluate(() => __world.target)) === exp, 'between camps the banner points to the nearest unfinished marker (' + exp + ')'); }
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(300);
    assert(/all 7 scrolls/.test((await W()).card || '') && (await W()).phase === 'active', 'the meeting-ground Trial ring stays locked until all 7 scrolls are read');
    await closeCards();   // checked before any Section 2 scroll is read
    console.log('  rings open the existing panels:');
    { await tpRing('s2-l0'); w = await W(); assert(w.near === 's2-l0' && /Scroll 1/.test(await p.$eval('#w-prompt', e => e.textContent)), 'council fire ring = Scroll 1 (prompt names it)');
      await p.keyboard.press('KeyE'); await sleep(500);
      assert((await W()).phase === 'panel' && /Land Shapes Life/.test(await p.$eval('#screen', e => e.textContent)), 'E opens the unchanged Scroll 1 panel');
      assert(!(await p.$eval('#w-back', e => e.hidden)) && /Back to the Council Fire/.test(await p.$eval('#w-back', e => e.textContent)), '"Back to the Council Fire" chip shows while a Section 2 panel is open');
      assert((await p.evaluate(() => __world.readS2())).includes(0), 'Scroll 1 marked read for Section 2 (world key)');
      await click('#w-back'); await waitPhase('active'); }
    await tpRing('s2-geomap'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel' && /Find the Homelands/.test(await p.$eval('#screen', e => e.textContent)), 'the hide-map ring opens Find the Homelands');
    { const lb = await p.evaluate(() => [...document.querySelectorAll('#screen #b-map')].map(b => b.textContent)); assert(lb.every(t => /Back to the Council Fire/.test(t)), 'its map buttons say where they go (' + lb.join('|') + ')'); }
    await p.keyboard.press('Escape'); await waitPhase('active');
    for (const [id, re] of [['s2-l1', /Pacific Northwest/], ['s2-l2', /Great Plains/], ['s2-l3', /Southwest/], ['s2-l4', /Iroquois/], ['s2-l5', /Southeast/], ['s2-l6', /Hiawatha/]]) {
      await tpRing(id); w = await W(); await p.evaluate(() => __world.use()); await sleep(400);
      assert(w.near === id && (await W()).phase === 'panel' && re.test(await p.$eval('#screen', e => e.textContent)), id + ' ring opens its scroll');
      await p.evaluate(() => ABRPG.home()); await waitPhase('active');
      if (id === 's2-l3') { await p.evaluate(() => __world.faceCam(Math.atan2(44 - 34, -52 + 42.5))); await sleep(500); await shot('v24-pueblo.png'); } }   // the pueblo itself, not the scroll panel
    await tpRing('s2-clanmother'); await p.evaluate(() => __world.use()); await sleep(400);
    assert((await W()).phase === 'panel' && /Clan Mother/.test(await p.$eval('#screen', e => e.textContent)), 'inside the palisade the Clan Mother ring opens her council');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    await tpRing('kiva'); await p.evaluate(() => __world.use()); await sleep(300);
    assert(/seen from outside/.test((await W()).card || '') && /Visitors stay outside/.test((await W()).card || '') && (await p.evaluate(() => __world.seen())).kiva, 'the kiva is shown from outside only, with a respectful card');
    await closeCards(); await tpRing('moundinfo'); await p.evaluate(() => __world.use()); await sleep(300);
    { const cd = (await W()).card || ''; assert(/largest city north of Mexico/.test(cd) && /about 1100/.test(cd) && /near present-day St\. Louis/.test(cd), 'mound card uses the same Cahokia wording as the scrolls'); }
    await closeCards(); await tp(-44, -24); await p.evaluate(() => __world.faceCam(Math.PI)); await sleep(500); await shot('v24-mound.png');   // from 30 m back so the whole mound and its temple are in frame
    { const cs = await p.evaluate(() => { const out = []; const walk = o => { if (typeof o === 'string') { if (/Cahokia/.test(o) && /largest city/.test(o)) out.push(o); } else if (o && typeof o === 'object') for (const k in o) walk(o[k]); }; walk(GAME_CONTENT); return out; });   // Cahokia is taught in Section 1 scrolls and the market too
      const tp2 = await p.evaluate(() => JSON.stringify(GAME_CONTENT, (k, v) => k === 'accept' ? undefined : v).match(/\b(teepee|tipi)s?\b/gi));   // typed-answer accept lists may list other spellings
      assert(cs.length >= 1 && cs.every(t => /north of Mexico/.test(t)) && !tp2, 'wording: every "largest" Cahokia line says north of Mexico; "tepee" spelled one way (' + cs.length + ' lines)');
      const tot = await p.evaluate(() => { const out = []; const walk = o => { if (typeof o === 'string') { if (/totem/i.test(o)) out.push(o); } else if (o && typeof o === 'object') for (const k in o) walk(o[k]); }; walk(GAME_CONTENT.sections.find(s => s.id === 's2')); return out; });
      const s2t = await p.evaluate(() => JSON.stringify(GAME_CONTENT.sections.find(s => s.id === 's2')));
      assert(tot.length >= 1 && tot.every(t => /came later, mostly in the \**1800s\** after iron tools arrived/.test(t)) && /house posts\*?\*? and poles showing \*?\*?family crests/.test(s2t) && /carved house posts showing family crests from ____ trees/.test(s2t), 'wording: Section 2 says house posts and crest poles; every totem-pole line says tall freestanding poles came later, mostly in the 1800s after iron tools (' + tot.length + ' lines)'); }
    console.log('  v2.4 plaza puzzle (Culture Clues Sort on the mats):');
    { const clues = await p.evaluate(() => GAME_CONTENT.sections.find(s => s.id === 's2').activities.find(a => a.id === 's2-clues'));
      const binOf = t => clues.items.find(i => i.t === t).bin;
      await tpRing('s2-clues'); await p.evaluate(() => __world.use()); await sleep(300);
      assert(/Carry the clue bundles/.test((await W()).card || '') && /Card version/.test((await W()).card || ''), 'the plaza ring offers the bundles on the mats or the card version');
      await p.evaluate(() => document.querySelector('#w-card [data-wb="0"]').click()); await sleep(300);
      let s = await p.evaluate(() => __world.sort()); assert(s.active && s.left === clues.items.length && s.mats.length === 6, 'carrying starts: ' + s.left + ' bundles, 6 region mats');
      const ring = await ringAt('s2-clues'), off = async () => { await tp(ring.x, ring.z); await sleep(250); };
      const onMat = async bin => { const m = (await p.evaluate(() => __world.sort())).mats.find(q => q.bin === bin); await tp(m.x, m.z); await sleep(1000); };
      const right = binOf(s.cur), wrong = s.mats.map(m => m.bin).find(b => b !== right);
      await onMat(wrong); s = await p.evaluate(() => __world.sort()); assert(s.mistakes === 1 && s.left === clues.items.length && !s.hint, 'a wrong mat: "doesn’t belong", counted as a mistake');
      await off(); await onMat(wrong); s = await p.evaluate(() => __world.sort()); assert(s.mistakes === 2 && s.hint === right && s.mats.find(m => m.bin === right).glow, 'second miss: the right mat glows as a hint');
      await off(); await onMat(right); await sleep(1100); s = await p.evaluate(() => __world.sort()); assert(s.left === clues.items.length - 1 && s.mats.find(m => m.bin === right).bundles === 1, 'the right mat takes the bundle (it stays on the mat)');
      await shot('v24-plaza-puzzle.png');
      while ((s = await p.evaluate(() => __world.sort())).left > 0 && s.cur) { await off(); await onMat(binOf(s.cur)); await sleep(1000); }
      await waitPhase('panel', 8000);
      const S = await p.evaluate(() => ABRPG.state()), a = S.acts['s2-clues'];
      assert(/Culture Clues Sort complete/.test(await p.$eval('#screen', e => e.textContent)) && a.plays === 1 && a.history[0].mistakes === 2 && a.history[0].rating === 2, 'all bundles placed → the normal results panel, 2 mistakes = 2 stars (scored by the card version’s code)');
      assert(Object.keys(S).sort().join(',') === keys2 && !/bundle|mats/i.test(JSON.stringify(S)), 'no new save fields from the puzzle');
      await p.evaluate(() => document.querySelector('#a-back') ? document.querySelector('#a-back').click() : ABRPG.home()); await waitPhase('active'); }
    await tpRing('market'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel' && /Cahokia Trade Gathering/.test(await p.$eval('#screen', e => e.textContent)), 'the trade blanket ring opens the Cahokia Trade Gathering market');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    console.log('  meeting ground + Trial:');
    for (const i of [0, 1, 2, 3, 4, 5, 6]) { await p.evaluate(i => ABRPG.lesson('s2', i, false), i); await sleep(80); }
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    assert(await p.evaluate(() => __world.meetOpen()) && (await ringAt('trial')).state === 'new', 'with all 7 scrolls read the meeting-ground Trial ring opens');
    await tp(-60, 9); await p.evaluate(() => __world.faceCam(0)); await sleep(500); await shot('v24-meeting-ground.png');
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel', 'the Trial opens as the real Section 2 trial panel');
    if (await p.$('#b-trial')) await click('#b-trial');
    for (let i = 0; i < 3; i++) await answer(true);
    await go(); await enterS2(); w = await W(); const tr = await ringAt('trial');
    assert((await p.evaluate(() => __world.level)) === 's2' && Math.hypot(w.pos.x - tr.x, w.pos.z - tr.z) < 5, 'reload mid-trial: entering Section 2 puts her at the meeting ground');
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500); if (await p.$('#b-resume')) await click('#b-resume');
    assert((await p.evaluate(() => ABRPG.state().run.idx)) === 3, 'the Section 2 Trial resumes at question 4');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    console.log('  two levels, one world key:');
    await tp(10, 20); await sleep(2300);
    await p.evaluate(() => { __world._dbg(); }); await click('#btn-home'); await sleep(500);
    assert((await W()).phase === 'off' && !!(await p.$('#screen .map')), 'the top-bar Map leaves the level');
    await enterS1(); w = await W();
    assert((await p.evaluate(() => __world.level)) === 's1' && /Back to Beringia/.test(await p.$eval('#w-back', e => e.textContent)), 'Section 1 still opens Beringia with its own labels');
    { const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY); assert(wk.at && wk.at.s2 && Math.abs(wk.at.s2.x - 10) < 0.5 && Math.abs(wk.at.s2.z - 20) < 0.5 && wk.read.s2.length === 7, 'Section 2 position and scrolls live in the world key (at.s2, read.s2)'); }
    await seed(s2base(), { ver: 1, mode: 'walk', at: { s2: { x: 1e9, z: 3, yaw: 'q' } }, read: { s1: [1], s2: [0, 7, 'a', 3, 3] }, seen: { help2: true, kiva: 'yes' } });
    await enterS2(); w = await W();
    assert(Math.abs(w.pos.z + 8) < 0.01 && JSON.stringify(await p.evaluate(() => __world.readS2())) === '[0,3]' && !(await p.evaluate(() => __world.seen())).kiva, 'junk Section 2 world data is cleaned (start spot, only valid scroll ids)');
    await seed(s2base(), { ver: 1, mode: 'walk', at: { s2: { x: 46, z: 2.2, yaw: 1 } }, seen: { help2: true } });
    await enterS2(); w = await W();
    assert(Math.abs(w.pos.x - 46) < 0.01 && Math.abs(w.pos.z - 2.2) < 0.01, 'a saved Section 2 spot is restored');
    await seed({ version: 1, created: '2026-10-01T00:00:00Z', players: { s1: { gender: 'girl', name: 'Abigail' }, s2: { gender: 'boy', name: 'Sam' } }, sections: { s1: { attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} } }, gear: [{ name: 'Fur Cloak', section: 's1' }], badges: [], totalCorrect: 24, totalAnswered: 25 }, null);
    await enterS2(); assert((await p.evaluate(() => __world.level)) === 's2' && (await p.evaluate(() => ABRPG.state().version)) === 3, 'a v1 save with Section 1 mastered walks into Section 2');
  }

  console.log('v2.5 Section 3: The Voyage of 1492:');
  { const G = { gender: 'girl', name: 'Abigail' }, DONE = () => ({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} });
    const s3base = (extra = {}) => base({ players: { s1: G, s2: G, s3: G }, sections: { s1: DONE(), s2: DONE() }, ...extra });
    const enterS3 = async () => { await p.evaluate(() => document.querySelector('.node[data-sid="s3"]').click()); await waitPhase('active', 40000); await sleep(800); await closeCards(); };
    const ringAt = id => p.evaluate(id => __world.rings().find(r => r.id === id), id);
    const tpRing = async id => { const r = await ringAt(id); await tp(r.x, r.z); await sleep(200); return r; };
    await seed(s3base(), null);
    const before3 = await p.evaluate(k => localStorage.getItem(k), KEY);
    await enterS3(); w = await W();
    assert((await p.evaluate(() => __world.level)) === 's3' && w.phase === 'active' && Math.abs(w.pos.x + 38) < 0.01 && Math.abs(w.pos.z - 44) < 0.01, 'tapping Section 3 opens the Voyage of 1492 in the Palos town square (-38, 44)');
    assert(/Section 3 · The Voyage of 1492/.test(await p.$eval('#w-era', e => e.textContent)), 'era label names Section 3');
    { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 1 · Palos town square: /.test(bn), 'at the start the banner names a Marker 1 ring in the town square ("' + bn + '")'); }
    { const t = await p.evaluate(() => { const o = document.getElementById('w-obj'), e = document.getElementById('w-era'); return [o.getBoundingClientRect().bottom, e.getBoundingClientRect().top]; }); assert(t[1] >= t[0], 'the era line sits below the banner even when it wraps'); }
    await p.evaluate(() => __world.faceCam(0)); await sleep(500); await shot('v25-palos.png');
    { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/"wool"/.test(hk), 'in 1492 Spain she wears the wool dress, not the hide tunic (' + hk + ')'); }
    { const sc = await p.evaluate(() => { const { L } = __world._dbg(), s = L.lvl.scene; const P = (L.lvl.scenery && L.lvl.scenery.parts) || {}; return { ok: !!L.lvl.scenery, det: !!s.getObjectByName('gfx-detail'), cl: !!s.getObjectByName('clouds'), bo: P['gfx-boulders'] || 0, gr: P['gfx-grass'] || 0, w: P.water || 0, mip: (L.lvl.scenery.water || []).some(t => t.generateMipmaps) }; }); assert(sc.ok && sc.det && sc.cl && sc.bo > 10 && sc.gr > 300 && sc.w > 0 && !sc.mip, 'graphics pass 1 scenery extras are built (grass, boulders and plants in one mesh, clouds, water ripples without mipmaps) ' + JSON.stringify(sc)); }
    // v2.6.2 graphics pass 2: softer ring light, era light grade, motes, overhead labels that fade, QC freeze, clear-transients, floating stick
    { const po = await p.evaluate(() => __world.polish()); assert(po && po.parts.grade && po.parts.motes >= 40 && po.parts.labels >= 3 && Math.abs(po.exposure - 1.06) < 1e-6, 'graphics pass 2 is on in 1492 Spain: light grade, ' + (po && po.parts.motes) + ' motes, ' + (po && po.parts.labels) + ' fading labels'); }
    { const rim = await p.evaluate(() => { const { L } = __world._dbg(); return L.toon && L.toon.rimMat ? L.toon.rimMat.uniforms.uColor.value.getHexString() : 'none'; }); assert(rim === 'fff0d6', 'Abigail\'s rim light is warm sun in 1492 Spain (#' + rim + ')'); }
    { const r = await p.evaluate(() => { const { L, renderer } = __world._dbg(); return { exp: renderer.toneMappingExposure, beam: Math.max(...L.lvl.rings.map(x => x.beam.material.opacity)), mats: L.lvl.scene.getObjectByName('gfx-motes') ? 1 : 0 }; });
      assert(Math.abs(r.exp - 1.06) < 1e-6 && r.beam <= 0.39 && r.mats === 1, 'warm era exposure ' + r.exp + ', ring light softened (max beam opacity ' + r.beam.toFixed(2) + ' ≤ 0.39), one motes mesh'); }
    { const fz = await p.evaluate(async () => { __world.qc(10); await new Promise(r => setTimeout(r, 250)); const m = () => Array.from(__world._dbg().L.lvl.scene.getObjectByName('gfx-motes').geometry.attributes.position.array.slice(0, 9)).join(); const a = m(); await new Promise(r => setTimeout(r, 400)); const b = m(); __world.freezeFx(false); await new Promise(r => setTimeout(r, 400)); const c = m(); return { same: a === b, moves: c !== b }; });
      assert(fz.same && fz.moves, 'QC freeze pins the motes for matching shots, and they drift again after (' + JSON.stringify(fz) + ')'); }
    { const tt = await p.evaluate(() => { window.ABRPG.toast('test toast'); const t = document.getElementById('toast'), a = !t.classList.contains('hidden'); __world.clearTransients(); return [a, t.classList.contains('hidden')]; }); assert(tt[0] && tt[1], 'the clear-transients helper hides a leftover toast'); }
    { const gr = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--grain')); assert(/svg/.test(gr), 'panels share the paper-grain tile (--grain)'); }
    { const js = await p.evaluate(async () => { const c = document.getElementById('world'), h = innerHeight, ev = (t, x, y) => c.dispatchEvent(new PointerEvent(t, { pointerId: 77, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, cancelable: true }));
        ev('pointerdown', 90, h - 140); const a = __world.joy; ev('pointermove', 130, h - 140); const b = __world.joy; ev('pointerup', 130, h - 140); const d = __world.joy;
        const { L } = __world._dbg(); L.touch = false; document.body.classList.remove('touch'); return { a, b, d }; });
      assert(js.a.float && js.a.id === 77 && js.a.left === '26px' && js.b.x > 0.5 && !js.d.float && js.d.id === null && js.d.x === 0, 'the floating stick appears under a lower-left thumb, steers, and returns home on release (' + JSON.stringify(js) + ')'); }
    // geography: north = +z, WEST = +x. Canaries south-west of Palos, the Bahamas far west, Hispaniola south-east of San Salvador
    { const S = await p.evaluate(() => __world.stations());
      assert(S.canary.x > S.pier.x && S.canary.z < S.pier.z && S.ss.x > S.canary.x + 40 && S.hisp.z < S.ss.z - 30 && S.hisp.x <= S.ss.x, 'the ports sit in their real directions (Canaries SW of Palos, San Salvador far west, Hispaniola south-east of it)'); }
    { const rs = await p.evaluate(() => __world.rings().map(r => ({ id: r.id, w: __world.walkable(r.x, r.z), s: __world.solid(r.x, r.z) })));
      const off = rs.filter(r => !r.w || r.s); assert(rs.length === 27 && !off.length, 'all 27 rings are on dry, open land (' + JSON.stringify(off) + ')'); }
    { const hb = await p.evaluate(() => { const H = __world._dbg().L.mods.B.HARBORS; return Object.keys(H).map(k => ({ k, w: __world.walkable(H[k].x, H[k].z), s: __world.solid(H[k].x, H[k].z) })); });
      assert(hb.length === 4 && hb.every(h => h.w && !h.s), 'all 4 harbor landing spots are walkable (' + JSON.stringify(hb) + ')'); }
    { let bad = [], n = 0;
      for (const id of ['s3-l0', 'royal', 's3-l1', 'perez', 's3-geomap', 's3-l2', 'stars', 'sails', 'market', 'ships', 's3-l6', 'sail-palos', 'rudder', 's3-l5', 'sail-canary', 's3-l3', 'taino', 'after', 'wreck', 's3-exchange', 'trial', 'sail-hisp']) { await tpRing(id);
        for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { await p.evaluate(a => __world.faceCam(a), a); await sleep(160); const c = await p.evaluate(() => __world.cam); n++; if (c.blocked) bad.push(id + '@' + a.toFixed(1)); } }
      assert(n === 88 && !bad.length, 'camera never inside a house, ship, tree or hill at 22 rings × 4 views (' + bad.join(', ') + ')'); }
    await tp(-34, 24); await p.evaluate(() => __world.faceCam(Math.PI)); await sleep(600); await shot('v25-pier-ships.png');
    { await tp(-40, 40); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 3500); w = await W();
      assert(w.pos.z < 52 + 3 && !(await p.evaluate((x, z) => __world.solid(x, z), w.pos.x, w.pos.z)), 'the church wall stops her (z ' + w.pos.z.toFixed(2) + ')'); }
    console.log('  boarding the fleet:');
    { const r = await tpRing('sail-palos'); assert(r.state === 'locked' && !(await p.evaluate(() => __world.boardOpen())), 'the pier boarding ring is locked at first');
      const bn = await p.evaluate(() => __world.banner); await p.evaluate(() => __world.use()); await sleep(300);
      assert(/Not yet, sailor/.test((await W()).card || '') && /Scrolls 1–3/.test((await W()).card || ''), 'boarding early: "Read Scrolls 1–3 or earn the Astrolabe" card'); await closeCards(); }
    for (const [id, re, i] of [['s3-l0', /Why Explore/, 0], ['s3-l1', /Science of Sailing/, 1], ['s3-l2', /Columbus Sails/, 2]]) {
      await tpRing(id); w = await W(); await p.evaluate(() => __world.use()); await sleep(400);
      assert(w.near === id && (await W()).phase === 'panel' && re.test(await p.$eval('#screen', e => e.textContent)), id + ' ring opens its scroll');
      if (i === 0) assert(!(await p.$eval('#w-back', e => e.hidden)) && /Back to the Voyage/.test(await p.$eval('#w-back', e => e.textContent)), '"Back to the Voyage" chip shows while a Section 3 panel is open');
      assert((await p.evaluate(() => __world.readL('s3'))).includes(i), 'scroll ' + (i + 1) + ' marked read for Section 3 (world key)');
      await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
    for (const [id, re] of [['royal', /May 23, 1492/], ['perez', /Pérez|Perez/], ['stars', /longitude/i], ['sails', /lateen/i], ['ships', /Santa Clara/]]) {
      await tpRing(id); await p.evaluate(() => __world.use()); await sleep(300); const cd = (await W()).card || '';
      assert(re.test(cd) && (await p.evaluate(id => __world.seen()[id], id)), id + ' card tells its fact (' + re + ')'); await closeCards(); }
    { const txt = await p.evaluate(async () => JSON.stringify(GAME_CONTENT) + (await (await fetch('world.js?w=' + Date.now())).text()) + (await (await fetch('world/voyage.js?w=' + Date.now())).text()));   // cards live in world.js, scrolls and sources in GAME_CONTENT
      const d33 = txt.match(/.{0,60}\b33[ -]days?.{0,40}/g) || [], bad = d33.filter(t => !/about five weeks from the Canaries \(33 days after losing sight of land\)/.test(t));
      const t33 = txt.match(/thirty-three days[\s\S]{0,4000}/g) || [];
      assert(d33.length >= 3 && !bad.length && t33.every(t => /lost sight of land, about September 9/.test(t) && /September 6/.test(t)), 'wording: every "33 days" says "about five weeks from the Canaries (33 days after losing sight of land)"; Columbus\'s quoted "thirty-three days" has the Sept 6 / Sept 9 note (' + d33.length + ' lines' + (bad.length ? '; bad: ' + bad.join(' | ') : '') + ')'); }
    { await tpRing('sail-palos'); assert(await p.evaluate(() => __world.boardOpen()), 'with Scrolls 1–3 read she may board');
      await p.evaluate(() => __world.use()); await sleep(300); const cd = (await W()).card || '';
      assert(/Set sail/.test(cd) && /about five weeks from the Canaries \(33 days after losing sight of land\)/.test(cd) && /3,000 miles/.test(cd), 'the sail card lists the ports in voyage order and says the ocean is shrunk (3,000 miles, about five weeks from the Canaries)');
      await p.evaluate(() => [...document.querySelectorAll('#w-card button')].find(b => /Canary/.test(b.textContent)).click()); await sleep(1200); w = await W();
      const hb = await p.evaluate(() => __world._dbg().L.mods.B.HARBORS.canary);
      assert(Math.hypot(w.pos.x - hb.x, w.pos.z - hb.z) < 1 && (await p.evaluate(() => __world.seen()['sail-canary'])), 'she sails to the Canary Islands harbor'); }
    await sleep(400); { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 6 · /.test(bn), 'on La Gomera the banner names Marker 6 ("' + bn + '")'); }
    await p.evaluate(() => __world.faceCam(Math.PI / 2 + 0.3)); await sleep(500); await shot('v25-canary.png');
    await tpRing('rudder'); await p.evaluate(() => __world.use()); await sleep(300);
    assert(/rudder/i.test((await W()).card || ''), 'the rudder card tells the Pinta story'); await closeCards();
    console.log('  San Salvador and Hispaniola:');
    await p.evaluate(() => __world.sail('ss')); await sleep(1200); w = await W();
    assert(await p.evaluate((x, z) => __world.walkable(x, z), w.pos.x, w.pos.z), 'she lands on San Salvador');
    { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 7 · /.test(bn), 'on San Salvador the banner names Marker 7 ("' + bn + '")'); }
    for (const [id, re] of [['taino', /Taíno/], ['after', /las Casas/i]]) { await tpRing(id); await p.evaluate(() => __world.use()); await sleep(300); const cd = (await W()).card || '';
      assert(re.test(cd), id + ' card (' + re + ')'); if (id === 'after') assert(/smallpox/i.test(cd) && /Montesinos/.test(cd) && /forced/i.test(cd), 'the "after" card tells the hard truth (forced labor, smallpox, Montesinos)'); await closeCards(); }
    { const r = await ringAt('s3-l3'); await tp(r.x - 6, r.z - 6); await p.evaluate(() => __world.faceCam(Math.atan2(6, 6))); await sleep(500); await shot('v25-sansalvador.png'); }
    await p.evaluate(() => __world.sail('hisp')); await sleep(1200); w = await W();
    assert(await p.evaluate((x, z) => __world.walkable(x, z), w.pos.x, w.pos.z), 'she lands on Hispaniola');
    await tpRing('wreck'); await p.evaluate(() => __world.use()); await sleep(300);
    { const cd = (await W()).card || ''; assert(/La Navidad/.test(cd) && /39/.test(cd) && /Guacanagar/.test(cd), 'the wreck card: Christmas 1492, Guacanagarí, 39 men at La Navidad'); } await closeCards();
    { await p.evaluate(() => __world.faceCam(Math.atan2(42 - 51, -22 + 37.5))); await sleep(600); await shot('v25-hispaniola-wreck.png'); }
    const after3 = await p.evaluate(k => localStorage.getItem(k), KEY);
    assert(Object.keys(JSON.parse(after3)).sort().join(',') === Object.keys(JSON.parse(before3)).sort().join(','), 'no new progress-save fields from walking and sailing the voyage');
    const keys3 = Object.keys(JSON.parse(after3)).sort().join(',');
    console.log('  dock puzzle (Columbian Exchange on the mats):');
    { const ex = await p.evaluate(() => GAME_CONTENT.sections.find(s => s.id === 's3').activities.find(a => a.id === 's3-exchange'));
      const binOf = t => ex.items.find(i => i.t === t).bin;
      await tpRing('s3-exchange'); await p.evaluate(() => __world.use()); await sleep(300);
      assert(/17 ships/.test((await W()).card || '') && /Card version/.test((await W()).card || ''), 'the dock ring offers the crates on the mats or the card version');
      await p.evaluate(() => document.querySelector('#w-card [data-wb="0"]').click()); await sleep(300);
      let s = await p.evaluate(() => __world.sort()); assert(s.active && s.left === ex.items.length && s.mats.length === 2, 'carrying starts: ' + s.left + ' crates, 2 dock mats');
      assert(s.mats.find(m => m.bin === 'west').x < s.mats.find(m => m.bin === 'east').x, 'the Americas → Europe mat is the east one (smaller x), toward Spain, as the card says');
      const ring = await ringAt('s3-exchange'), off = async () => { await tp(ring.x, ring.z); await sleep(250); };
      const onMat = async bin => { const m = (await p.evaluate(() => __world.sort())).mats.find(q => q.bin === bin); await tp(m.x, m.z); await sleep(1000); };
      const right = binOf(s.cur), wrong = right === 'west' ? 'east' : 'west';
      await onMat(wrong); s = await p.evaluate(() => __world.sort()); assert(s.mistakes === 1 && s.left === ex.items.length, 'a wrong mat counts as a mistake');
      await off(); await onMat(right); await sleep(1100); s = await p.evaluate(() => __world.sort()); assert(s.left === ex.items.length - 1 && s.mats.find(m => m.bin === right).bundles === 1, 'the right mat takes the crate');
      await off(); await p.evaluate(() => __world.faceCam(Math.PI)); await sleep(400); await shot('v25-dock-puzzle.png');
      while ((s = await p.evaluate(() => __world.sort())).left > 0 && s.cur) { await off(); await onMat(binOf(s.cur)); await sleep(1000); }
      await waitPhase('panel', 8000);
      const S = await p.evaluate(() => ABRPG.state()), a = S.acts['s3-exchange'];
      assert(a && a.plays === 1 && a.history[0].mistakes === 1, 'all crates placed → the normal results panel, 1 mistake recorded by the card version’s code');
      assert(Object.keys(S).sort().join(',') === keys3 && !/bundle|mats/i.test(JSON.stringify(S)), 'no new save fields from the dock puzzle');
      await p.evaluate(() => document.querySelector('#a-back') ? document.querySelector('#a-back').click() : ABRPG.home()); await waitPhase('active'); }
    console.log('  the storm home (Trial):');
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(300);
    assert(/all 7 scrolls/.test((await W()).card || '') && /Azores/.test((await W()).card || '') && (await W()).phase === 'active', 'the Niña Trial ring stays locked until all 7 scrolls are read');
    await closeCards();
    for (const i of [0, 1, 2, 3, 4, 5, 6]) { await p.evaluate(i => ABRPG.lesson('s3', i, false), i); await sleep(80); }
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    { const dbg = await p.evaluate(() => ({ open: __world.stormOpen(), read: __world.readL('s3'), sid: __world.state ? __world.state().sid : null })), rt = await ringAt('trial');
      assert(dbg.open && rt && rt.state === 'new', 'with all 7 scrolls read the Trial ring opens' + (dbg.open && rt && rt.state === 'new' ? '' : ' [debug ' + JSON.stringify(dbg) + ' ring ' + JSON.stringify(rt) + ']')); }
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel', 'the Trial opens as the real Section 3 trial panel');
    if (await p.$('#b-trial')) await click('#b-trial');
    for (let i = 0; i < 3; i++) await answer(true);
    await go(); await enterS3(); w = await W();
    { const hb = await p.evaluate(() => __world._dbg().L.mods.B.HARBORS.hisp); assert((await p.evaluate(() => __world.level)) === 's3' && Math.hypot(w.pos.x - hb.x, w.pos.z - hb.z) < 1, 'reload mid-trial: entering Section 3 puts her at the Hispaniola harbor by the Niña'); }
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500); if (await p.$('#b-resume')) await click('#b-resume');
    assert((await p.evaluate(() => ABRPG.state().run.idx)) === 3, 'the Section 3 Trial resumes at question 4');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    { const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY); assert(wk.read.s3.length === 7 && wk.seen['sail-ss'] && wk.seen.wreck && wk.at && wk.at.s3, 'Section 3 scrolls, sailings and position live in the world key'); }
    console.log('  world key safety + navigator gear:');
    await seed(s3base(), { ver: 1, mode: 'walk', at: { s3: { x: 1e9, z: 3, yaw: 'q' } }, read: { s3: [0, 9, 'a', 2, 2] }, seen: { help3: true, 'sail-ss': 'yes', bogus: true } });
    await enterS3(); w = await W();
    assert(Math.abs(w.pos.x + 38) < 0.01 && Math.abs(w.pos.z - 44) < 0.01 && JSON.stringify(await p.evaluate(() => __world.readL('s3'))) === '[0,2]' && !(await p.evaluate(() => __world.seen())).bogus, 'junk Section 3 world data is cleaned (start spot, only valid scroll ids)');
    await seed(s3base({ owned: ['brass-compass', 'astrolabe', 'sea-chart', 'sounding-lead', 'nav-cap'], equip: { belt: 'brass-compass', offhand: 'astrolabe', back: 'sea-chart', hand: 'sounding-lead', head: 'nav-cap' } }), { ver: 1, mode: 'walk', at: { s3: { x: -53, z: 30, yaw: 0 } }, seen: { help3: true } });
    await enterS3(); w = await W();
    assert(Math.abs(w.pos.x + 53) < 0.01 && Math.abs(w.pos.z - 30) < 0.01, 'a saved Section 3 spot is restored');
    { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/astrolabe/.test(hk) && /nav-cap/.test(hk) && /wool/.test(hk) && await p.evaluate(() => __world.boardOpen()), 'the navigator gear shows on the wool dress, and the Astrolabe lets her board (' + hk + ')'); }
    await p.evaluate(() => __world.faceCam(Math.PI)); await sleep(700); await shot('v25-hero.png');
  }

  console.log('v2.6 Section 4: Three Empires:');
  { const G = { gender: 'girl', name: 'Abigail' }, DONE = () => ({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} });
    const s4base = (extra = {}) => base({ players: { s1: G, s2: G, s3: G, s4: G }, sections: { s1: DONE(), s2: DONE(), s3: DONE() }, ...extra });
    const enterS4 = async () => { await p.evaluate(() => document.querySelector('.node[data-sid="s4"]').click()); await waitPhase('active', 40000); await sleep(800); await closeCards(); };
    const ringAt = id => p.evaluate(id => __world.rings().find(r => r.id === id), id);
    const tpRing = async id => { const r = await ringAt(id); await tp(r.x, r.z); await sleep(200); return r; };
    const useCard = async id => { await tpRing(id); await p.evaluate(() => __world.use()); await sleep(300); return (await W()).card || ''; };
    await seed(s4base(), null);
    const before4 = await p.evaluate(k => localStorage.getItem(k), KEY);
    await enterS4(); w = await W();
    assert((await p.evaluate(() => __world.level)) === 's4' && w.phase === 'active' && Math.abs(w.pos.x + 56) < 0.01 && Math.abs(w.pos.z + 56) < 0.01, 'tapping Section 4 opens the Three Empires at St. Augustine (-56, -56)');
    assert(/Section 4 · Three Empires/.test(await p.$eval('#w-era', e => e.textContent)), 'era label names Section 4');
    { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 1 · /.test(bn), 'at the start the banner names a Marker 1 ring in St. Augustine ("' + bn + '")'); }
    { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/"wool"/.test(hk), 'around 1610 she wears the wool dress (' + hk + ')'); }
    await p.evaluate(() => __world.faceCam(0)); await sleep(500); await shot('v26-staugustine.png');
    // geography: north = +z, WEST = +x. Santa Fe far west, Quebec far north, New Amsterdam east on the coast, St. Augustine south-east
    { const S = await p.evaluate(() => __world.stations());
      assert(S.santafe.x > S.staug.x + 60 && S.quebec.z > S.staug.z + 80 && S.market.x < S.beaver.x && S.market.z > S.staug.z + 40 && S.quebec.z > S.market.z, 'the colonies sit in their real directions (Santa Fe far west, Quebec far north, New Amsterdam north of St. Augustine on the east coast)'); }
    { const rs = await p.evaluate(() => __world.rings().map(r => ({ id: r.id, w: __world.walkable(r.x, r.z), s: __world.solid(r.x, r.z) })));
      const off = rs.filter(r => !r.w || r.s); assert(rs.length === 25 && !off.length, 'all 25 rings are on dry, open land (' + rs.length + ' rings; ' + JSON.stringify(off) + ')'); }
    { const hb = await p.evaluate(() => { const H = __world._dbg().L.mods.B.HARBORS; return Object.keys(H).map(k => ({ k, w: __world.walkable(H[k].x, H[k].z), s: __world.solid(H[k].x, H[k].z) })); });
      assert(hb.length === 2 && hb.every(h => h.w && !h.s), 'both canoe landings are walkable (' + JSON.stringify(hb) + ')'); }
    { let bad = [], n = 0; const ids = (await p.evaluate(() => __world.rings().map(r => r.id)));
      for (const id of ids) { await tpRing(id);
        for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { await p.evaluate(a => __world.faceCam(a), a); await sleep(260); const c = await p.evaluate(() => __world.cam); n++; if (c.blocked) bad.push(id + '@' + a.toFixed(1)); } }
      assert(n === ids.length * 4 && !bad.length, 'camera never inside a building, tree or mesa at ' + ids.length + ' rings × 4 views (' + bad.join(', ') + ')'); }
    { await tp(-30, 56); await p.evaluate(() => __world.faceCam(0)); await hold('KeyW', 3000); w = await W();
      assert(w.pos.z < 63.5 && !(await p.evaluate((x, z) => __world.solid(x, z), w.pos.x, w.pos.z)), 'the Quebec cliff stops her (z ' + w.pos.z.toFixed(2) + ')'); }
    console.log('  scrolls and cards:');
    for (const [id, re, i] of [['s4-l0', /Conquistadors/, 0], ['s4-l3', /New France/, 3]]) {
      await tpRing(id); await p.evaluate(() => __world.use()); await sleep(400);
      assert((await W()).phase === 'panel' && re.test(await p.$eval('#screen', e => e.textContent)), id + ' ring opens its scroll');
      if (i === 0) assert(/Back to the Three Empires/.test(await p.$eval('#w-back', e => e.textContent)), '"Back to the Three Empires" chip shows while a Section 4 panel is open');
      assert((await p.evaluate(() => __world.readL('s4'))).includes(i), 'scroll ' + (i + 1) + ' marked read for Section 4 (world key)');
      await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
    for (const [id, re] of [['fort', /September 8, 1565/], ['timucua', /Seloy/], ['palace', /Pueblo Revolt|Popé/], ['adobe', /straw/], ['beaver', /felt/], ['furtrade', /Wendat/], ['wendat', /1609/], ['windmill', /18 languages/], ['manhattan', /60 guilders/]]) {
      const cd = await useCard(id); assert(re.test(cd) && (await p.evaluate(id => __world.seen()[id], id)), id + ' card tells its fact (' + re + ')'); await closeCards(); }
    { const cd = await useCard('manhattan'); assert(/\$24/.test(cd) && /sharing/.test(cd), 'the Manhattan card explains the "$24" myth and the Lenape view'); await closeCards(); }
    await tp(-56, -40); await p.evaluate(() => __world.faceCam(Math.PI)); await sleep(500); await shot('v26-staug-fort.png');
    { const r = await ringAt('s4-l2'); await tp(r.x - 6, r.z - 8); await p.evaluate(() => __world.faceCam(Math.atan2(6, 8))); await sleep(500); await shot('v26-santafe.png'); }
    console.log('  the St. Lawrence canoe:');
    { const cd = await useCard('canoe-south'); assert(/where the river narrows/.test(cd) && /July 3, 1608/.test(cd), 'the canoe card: Kébec, "where the river narrows", July 3, 1608');
      await p.evaluate(() => [...document.querySelectorAll('#w-card button')].find(b => /Quebec/.test(b.textContent)).click()); await sleep(1300); w = await W();
      const hb = await p.evaluate(() => __world._dbg().L.mods.B.HARBORS.north);
      assert(Math.hypot(w.pos.x - hb.x, w.pos.z - hb.z) < 1, 'she paddles to the Quebec landing'); }
    await p.evaluate(() => __world.faceCam(0)); await sleep(600); await shot('v26-quebec.png');
    { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 4 · /.test(bn), 'at Quebec the banner names Marker 4 ("' + bn + '")'); }
    await p.evaluate(() => __world.canoe('south')); await sleep(1300); w = await W();
    { const hb = await p.evaluate(() => __world._dbg().L.mods.B.HARBORS.south); assert(Math.hypot(w.pos.x - hb.x, w.pos.z - hb.z) < 1, 'and paddles back to the south bank'); }
    { const r = await ringAt('windmill'); await tp(r.x - 8, r.z - 10); await p.evaluate(() => __world.faceCam(Math.atan2(8, 10))); await sleep(600); await shot('v26-newamsterdam.png'); }
    const after4 = await p.evaluate(k => localStorage.getItem(k), KEY);
    assert(Object.keys(JSON.parse(after4)).sort().join(',') === Object.keys(JSON.parse(before4)).sort().join(','), 'no new progress-save fields from exploring the three empires');
    const keys4 = Object.keys(JSON.parse(after4)).sort().join(',');
    console.log('  empire goals puzzle (crates on the mats):');
    { const ex = await p.evaluate(() => GAME_CONTENT.sections.find(s => s.id === 's4').activities.find(a => a.id === 's4-goals'));
      const binOf = t => ex.items.find(i => i.t === t).bin;
      const cd = await useCard('s4-goals'); assert(/Spain/.test(cd) && /left \(west\)/.test(cd) && /Card version/.test(cd), 'the goals ring explains the mats (Spain left / west) and offers the card version');
      await p.evaluate(() => document.querySelector('#w-card [data-wb="0"]').click()); await sleep(300);
      let s = await p.evaluate(() => __world.sort()); assert(s.active && s.left === ex.items.length && s.mats.length === 3, 'carrying starts: ' + s.left + ' crates, 3 empire mats');
      { const M = Object.fromEntries(s.mats.map(m => [m.bin, m])); assert(M.spain.x > M.france.x && M.dutch.x < M.france.x && M.france.z > M.spain.z, 'facing north, Spain is left (west, +x), France ahead, the Netherlands right'); }
      const ring = await ringAt('s4-goals'), off = async () => { await tp(ring.x, ring.z); await sleep(250); };
      const onMat = async bin => { const m = (await p.evaluate(() => __world.sort())).mats.find(q => q.bin === bin); await tp(m.x, m.z); await sleep(1000); };
      const right = binOf(s.cur), wrong = right === 'spain' ? 'france' : 'spain';
      await onMat(wrong); s = await p.evaluate(() => __world.sort()); assert(s.mistakes === 1 && s.left === ex.items.length, 'a wrong mat counts as a mistake');
      await off(); await onMat(right); await sleep(1100); s = await p.evaluate(() => __world.sort()); assert(s.left === ex.items.length - 1 && s.mats.find(m => m.bin === right).bundles === 1, 'the right mat takes the crate');
      await off(); await p.evaluate(() => __world.faceCam(0)); await sleep(400); await shot('v26-goals-puzzle.png');
      while ((s = await p.evaluate(() => __world.sort())).left > 0 && s.cur) { await off(); await onMat(binOf(s.cur)); await sleep(1000); }
      await waitPhase('panel', 8000);
      const S = await p.evaluate(() => ABRPG.state()), a = S.acts['s4-goals'];
      assert(a && a.plays === 1 && a.history[0].mistakes === 1, 'all crates placed → the normal results panel, 1 mistake recorded');
      assert(Object.keys(S).sort().join(',') === keys4 && !/bundle|mats/i.test(JSON.stringify(S)), 'no new save fields from the goals puzzle');
      await p.evaluate(() => document.querySelector('#a-back') ? document.querySelector('#a-back').click() : ABRPG.home()); await waitPhase('active'); }
    console.log('  the palisade gate (Trial):');
    { const cd = await useCard('trial'); assert(/all 7 scrolls/.test(cd) && (await W()).phase === 'active', 'the gate Trial ring stays locked until all 7 scrolls are read'); await closeCards(); }
    for (const i of [0, 1, 2, 3, 4, 5, 6]) { await p.evaluate(i => ABRPG.lesson('s4', i, false), i); await sleep(80); }
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    assert(await p.evaluate(() => __world.gateOpenS4()) && (await ringAt('trial')).state === 'new', 'with all 7 scrolls read the gate opens');
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel', 'the Trial opens as the real Section 4 trial panel');
    if (await p.$('#b-trial')) await click('#b-trial');
    for (let i = 0; i < 3; i++) await answer(true);
    await go(); await enterS4(); w = await W();
    { const t = await ringAt('trial'); assert((await p.evaluate(() => __world.level)) === 's4' && Math.hypot(w.pos.x - t.x, w.pos.z - t.z + 4) < 1, 'reload mid-trial: entering Section 4 puts her by the palisade gate'); }
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500); if (await p.$('#b-resume')) await click('#b-resume');
    assert((await p.evaluate(() => ABRPG.state().run.idx)) === 3, 'the Section 4 Trial resumes at question 4');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    { const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY); assert(wk.read.s4.length === 7 && wk.seen.fort && wk.seen.manhattan && wk.at && wk.at.s4, 'Section 4 scrolls, cards and position live in the world key'); }
    console.log('  world key safety + explorer gear:');
    await seed(s4base(), { ver: 1, mode: 'walk', at: { s4: { x: 1e9, z: 3, yaw: 'q' } }, read: { s4: [0, 9, 'a', 2, 2] }, seen: { help4: true, fort: 'yes', bogus: true } });
    await enterS4(); w = await W();
    assert(Math.abs(w.pos.x + 56) < 0.01 && Math.abs(w.pos.z + 56) < 0.01 && JSON.stringify(await p.evaluate(() => __world.readL('s4'))) === '[0,2]' && !(await p.evaluate(() => __world.seen())).bogus, 'junk Section 4 world data is cleaned (start spot, only valid scroll ids)');
    await seed(s4base({ owned: ['beaver-cap', 'explorer-journal', 'lantern', 'satchel'], equip: { head: 'beaver-cap', belt: 'explorer-journal', offhand: 'lantern', back: 'satchel' } }), { ver: 1, mode: 'walk', at: { s4: { x: -52, z: 10, yaw: 0 } }, seen: { help4: true } });
    await enterS4(); w = await W();
    assert(Math.abs(w.pos.x + 52) < 0.01 && Math.abs(w.pos.z - 10) < 0.01, 'a saved Section 4 spot is restored');
    { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/beaver-cap/.test(hk) && /lantern/.test(hk) && /satchel/.test(hk) && /journal/.test(hk) && /wool/.test(hk), 'the explorer gear shows on the wool dress (' + hk + ')'); }
    await tp(-56, -52); await p.evaluate(() => __world.faceCam(Math.PI / 2)); await sleep(900); await shot('v26-hero.png');   // open plaza ground, side-back view of the gear
    assert(!/🇪🇸/.test(await p.evaluate(() => JSON.stringify(GAME_CONTENT.sections.find(s => s.id === 's4')))), 'no modern flag emoji in Section 4 content');
    console.log('  phone HUD (390x844 and 844x390):');
    for (const [vw, vh] of [[390, 844], [844, 390]]) {
      await p.setViewport({ width: vw, height: vh }); await p.evaluate(() => document.body.classList.add('touch')); await tpRing('fort'); await sleep(700);
      const lay = await p.evaluate(() => { const ids = ['w-obj', 'w-era', 'w-prompt', 'w-joy', 'w-use', 'w-tools'], R = {};
        for (const id of ids) { const e = document.getElementById(id); if (!e || e.hidden || getComputedStyle(e).display === 'none') continue; const r = e.getBoundingClientRect(); if (r.width && r.height) R[id] = r.toJSON(); }
        const tb = document.getElementById('topbar'); if (tb && tb.offsetParent !== null && getComputedStyle(tb).display !== 'none') { const r = tb.getBoundingClientRect(); if (r.height) R.topbar = r.toJSON(); }
        return { R, iw: innerWidth, ih: innerHeight }; });
      const k = Object.keys(lay.R), hit = [], outside = [];
      for (let i = 0; i < k.length; i++) { const a = lay.R[k[i]]; if (a.left < -1 || a.top < -1 || a.right > lay.iw + 1 || a.bottom > lay.ih + 1) outside.push(k[i]);
        for (let j = i + 1; j < k.length; j++) { const c = lay.R[k[j]]; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) hit.push(k[i] + '/' + k[j]); } }
      assert(lay.R['w-prompt'] && lay.R['w-use'] && lay.R['w-joy'] && !hit.length && !outside.length, 'phone ' + vw + 'x' + vh + ': prompt, joystick, Use, tools, objective and era never overlap and stay on screen (' + JSON.stringify({ hit, outside, shown: k }) + ')');
      await p.evaluate(() => document.getElementById('w-help').click()); await sleep(300);
      const cf = await p.evaluate(() => { const c = document.querySelector('.w-card-in'), bs = [...document.querySelectorAll('.w-card-btns .btn')]; if (!c || !bs.length) return null; const r = c.getBoundingClientRect(), lb = bs[bs.length - 1].getBoundingClientRect(); return { top: r.top, bottom: r.bottom, btnBottom: lb.bottom, btnTop: lb.top, ih: innerHeight }; });
      assert(cf && cf.top >= 0 && cf.bottom <= cf.ih + 1 && cf.btnTop >= cf.top && cf.btnBottom <= cf.bottom + 1, 'phone ' + vw + 'x' + vh + ': the help card fits the screen and its buttons stay in view (' + JSON.stringify(cf) + ')');
      await shot('v26-phone-' + vw + 'x' + vh + '.png'); await closeCards();
    }
    await p.evaluate(() => document.body.classList.remove('touch')); await p.setViewport({ width: 1280, height: 800 }); await sleep(300);
  }

  console.log('v2.7 Section 5: Jamestown and Plymouth:');
  { const G = { gender: 'girl', name: 'Abigail' }, DONE = () => ({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, correctCount: 24, gearEarned: 4, topics: {}, missed: {} });
    const s5base = (extra = {}) => base({ players: { s1: G, s2: G, s3: G, s4: G, s5: G }, sections: { s1: DONE(), s2: DONE(), s3: DONE(), s4: DONE() }, ...extra });
    const enterS5 = async () => { await p.evaluate(() => document.querySelector('.node[data-sid="s5"]').click()); await waitPhase('active', 40000); await sleep(800); await closeCards(); };
    const ringAt = id => p.evaluate(id => __world.rings().find(r => r.id === id), id);
    const tpRing = async id => { const r = await ringAt(id); await tp(r.x, r.z); await sleep(200); return r; };
    const useCard = async id => { await tpRing(id); await p.evaluate(() => __world.use()); await sleep(300); return (await W()).card || ''; };
    await seed(s5base(), null);
    const before5 = await p.evaluate(k => localStorage.getItem(k), KEY);
    await enterS5(); w = await W();
    assert((await p.evaluate(() => __world.level)) === 's5' && w.phase === 'active' && Math.abs(w.pos.x + 42) < 0.01 && Math.abs(w.pos.z + 64) < 0.01, 'tapping Section 5 opens Jamestown and Plymouth on Roanoke Island (-42, -64)');
    assert(/Section 5 · Jamestown and Plymouth/.test(await p.$eval('#w-era', e => e.textContent)), 'era label names Section 5');
    { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 1 · /.test(bn), 'at the start the banner names a Marker 1 ring on Roanoke ("' + bn + '")'); }
    { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/"wool"/.test(hk), 'in the 1600s she wears the wool dress (' + hk + ')'); }
    await p.evaluate(() => __world.faceCam(0)); await sleep(500); await shot('v27-roanoke.png');
    // geography: north = +z, WEST = +x. Roanoke south, James Fort north of it across the James River, Plymouth far north
    { const S = await p.evaluate(() => __world.stations());
      assert(S.jamestown.z > S.roanoke.z + 20 && S.plymouth.z > S.jamestown.z + 40 && S.mayflower.x < S.plymouth.x && S.fields.x > S.jamestown.x && S.wampanoag.x > S.plymouth.x, 'the places sit in their real directions (Roanoke south, Virginia, then New England north; the Cape Cod coast east)'); }
    { const rs = await p.evaluate(() => __world.rings().map(r => ({ id: r.id, w: __world.walkable(r.x, r.z), s: __world.solid(r.x, r.z) })));
      const off = rs.filter(r => !r.w || r.s); assert(rs.length === 31 && !off.length, 'all 31 rings are on dry, open land (' + rs.length + ' rings; ' + JSON.stringify(off) + ')'); }
    { const rs = await p.evaluate(() => __world.rings()), close = [];
      for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) if (Math.hypot(rs[i].x - rs[j].x, rs[i].z - rs[j].z) < 2.6) close.push(rs[i].id + '/' + rs[j].id);
      assert(!close.length, 'no two rings overlap (' + close.join(', ') + ')'); }
    { const hb = await p.evaluate(() => { const H = __world._dbg().L.mods.B.HARBORS; return Object.keys(H).map(k => ({ k, w: __world.walkable(H[k].x, H[k].z), s: __world.solid(H[k].x, H[k].z) })); });
      assert(hb.length === 2 && hb.every(h => h.w && !h.s), 'both ship landings are walkable (' + JSON.stringify(hb) + ')'); }
    { let bad = [], n = 0; const ids = (await p.evaluate(() => __world.rings().map(r => r.id)));
      for (const id of ids) { await tpRing(id);
        for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { await p.evaluate(a => __world.faceCam(a), a); await sleep(260); const c = await p.evaluate(() => __world.cam); n++; if (c.blocked) bad.push(id + '@' + a.toFixed(1)); } }
      assert(n === ids.length * 4 && !bad.length, 'camera never inside a building, wall or tree at ' + ids.length + ' rings × 4 views (' + bad.join(', ') + ')'); }
    { await tp(-28, -27); await p.evaluate(() => __world.faceCam(Math.PI)); await hold('KeyW', 2500); w = await W();
      assert(w.pos.z > -31.2, 'the triangular palisade stops her away from the gates (z ' + w.pos.z.toFixed(2) + ')'); }
    console.log('  scrolls and cards:');
    for (const [id, re, i] of [['s5-l0', /Roanoke/, 0], ['s5-l4', /Mayflower/, 4]]) {
      await tpRing(id); await p.evaluate(() => __world.use()); await sleep(400);
      assert((await W()).phase === 'panel' && re.test(await p.$eval('#screen', e => e.textContent)), id + ' ring opens its scroll');
      if (i === 0) assert(/Back to Jamestown and Plymouth/.test(await p.$eval('#w-back', e => e.textContent)), '"Back to Jamestown and Plymouth" chip shows while a Section 5 panel is open');
      assert((await p.evaluate(() => __world.readL('s5'))).includes(i), 'scroll ' + (i + 1) + ' marked read for Section 5 (world key)');
      await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
    for (const [id, re] of [['croatoan', /CROATOAN/], ['ships', /Susan Constant/], ['fort5', /triangle/], ['starving', /about <b>60<\/b>|about 60/], ['assembly', /July 30, 1619/], ['tobacco', /1612/], ['powhatan', /Tsenacommacah/], ['mayship', /102 passengers/], ['plymouth', /half/], ['colonies', /1623/], ['wampanoag', /Massasoit/], ['cornhills', /Three Sisters/]]) {
      const cd = await useCard(id); assert(re.test(cd) && (await p.evaluate(id => __world.seen()[id], id)), id + ' card tells its fact (' + re + ')'); await closeCards(); }
    { const cd = await useCard('assembly'); assert(/burgesses/.test(cd) && /22/.test(cd) && /Africans/.test(cd), 'the Assembly card names the burgesses and tells the honest 1619 history'); await closeCards(); }
    console.log('  the ship up the James River:');
    { const cd = await useCard('ship-south'); assert(/James I/.test(cd), 'the ship card: the river named for King James I');
      await p.evaluate(() => [...document.querySelectorAll('#w-card button')].find(b => /James River/.test(b.textContent)).click()); await sleep(1300); w = await W();
      const hb = await p.evaluate(() => __world._dbg().L.mods.B.HARBORS.north);
      assert(Math.hypot(w.pos.x - hb.x, w.pos.z - hb.z) < 1, 'she sails to the James Fort landing'); }
    { const bn = await p.evaluate(() => __world.banner); assert(/^Marker 2 · /.test(bn), 'at James Fort the banner names Marker 2 ("' + bn + '")'); }
    await p.evaluate(() => __world.faceCam(0)); await sleep(600); await shot('v27-jamesfort.png');
    { const r = await ringAt('s5-l1'); await tp(-16, -50.5); await p.evaluate(() => __world.faceCam(0)); await sleep(500); await shot('v27-jamesfort-ships.png'); }
    await p.evaluate(() => __world.ship5('south')); await sleep(1300); w = await W();
    { const hb = await p.evaluate(() => __world._dbg().L.mods.B.HARBORS.south); assert(Math.hypot(w.pos.x - hb.x, w.pos.z - hb.z) < 1, 'and sails back to Roanoke'); }
    { const r = await ringAt('compact'); await tp(-44, 19); await p.evaluate(() => __world.faceCam(-Math.PI / 2)); await sleep(3500); await shot('v27-mayflower.png'); }
    { await tp(-19, 34.5); await p.evaluate(() => __world.faceCam(0)); await sleep(500); await shot('v27-plymouth.png'); }
    { const r = await ringAt('wampanoag'); await tp(r.x - 5, r.z - 4); await p.evaluate(() => __world.faceCam(Math.atan2(5, 4))); await sleep(500); await shot('v27-wampanoag.png'); }
    { const r = await ringAt('market'); await tpRing('market'); await p.evaluate(() => __world.use()); await sleep(500);
      assert((await W()).phase === 'panel' && /Jamestown Storehouse/.test(await p.$eval('#screen', e => e.textContent)), 'the market ring opens the Jamestown Storehouse');
      await p.evaluate(() => ABRPG.home()); await waitPhase('active'); }
    const after5 = await p.evaluate(k => localStorage.getItem(k), KEY);
    assert(Object.keys(JSON.parse(after5)).sort().join(',') === Object.keys(JSON.parse(before5)).sort().join(','), 'no new progress-save fields from exploring Jamestown and Plymouth');
    console.log('  the fort-meetinghouse (Trial):');
    { const cd = await useCard('trial'); assert(/all 10 scrolls/.test(cd) && (await W()).phase === 'active', 'the Trial ring stays locked until all 10 scrolls are read'); await closeCards(); }
    for (const i of [0, 1, 2, 3, 4, 5, 6, 7]) { await p.evaluate(i => ABRPG.lesson('s5', i, false), i); await sleep(80); }
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    assert(!(await p.evaluate(() => __world.gateOpenS5())), 'with 8 of 10 scrolls the door is still shut');
    for (const i of [8, 9]) { await p.evaluate(i => ABRPG.lesson('s5', i, false), i); await sleep(80); }
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    assert(await p.evaluate(() => __world.gateOpenS5()) && (await ringAt('trial')).state === 'new', 'with all 10 scrolls read the fort-meetinghouse opens');
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500);
    assert((await W()).phase === 'panel', 'the Trial opens as the real Section 5 trial panel');
    if (await p.$('#b-trial')) await click('#b-trial');
    for (let i = 0; i < 3; i++) await answer(true);
    await go(); await enterS5(); w = await W();
    { const t = await ringAt('trial'); assert((await p.evaluate(() => __world.level)) === 's5' && Math.hypot(w.pos.x - t.x, w.pos.z - t.z + 4) < 1, 'reload mid-trial: entering Section 5 puts her by the fort-meetinghouse'); }
    await tpRing('trial'); await p.evaluate(() => __world.use()); await sleep(500); if (await p.$('#b-resume')) await click('#b-resume');
    assert((await p.evaluate(() => ABRPG.state().run.idx)) === 3, 'the Section 5 Trial resumes at question 4');
    await p.evaluate(() => ABRPG.home()); await waitPhase('active');
    { const wk = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), WKEY); assert(wk.read.s5.length === 10 && wk.seen.croatoan && wk.seen.assembly && wk.at && wk.at.s5, 'Section 5 scrolls, cards and position live in the world key'); }
    console.log('  world key safety + Pilgrim gear:');
    await seed(s5base(), { ver: 1, mode: 'walk', at: { s5: { x: 1e9, z: 3, yaw: 'q' } }, read: { s5: [0, 12, 'a', 9, 9] }, seen: { help5: true, croatoan: 'yes', bogus: true } });
    await enterS5(); w = await W();
    assert(Math.abs(w.pos.x + 42) < 0.01 && Math.abs(w.pos.z + 64) < 0.01 && JSON.stringify(await p.evaluate(() => __world.readL('s5'))) === '[0,9]' && !(await p.evaluate(() => __world.seen())).bogus, 'junk Section 5 world data is cleaned (start spot, only valid scroll ids)');
    await seed(s5base({ owned: ['pilgrim-collar', 'iron-hoe', 'capotain', 'quill-charter'], equip: { neck: 'pilgrim-collar', hand: 'iron-hoe', head: 'capotain', offhand: 'quill-charter' } }), { ver: 1, mode: 'walk', at: { s5: { x: -19, z: 36, yaw: 0 } }, seen: { help5: true } });
    await enterS5(); w = await W();
    assert(Math.abs(w.pos.x + 19) < 0.01 && Math.abs(w.pos.z - 36) < 0.01, 'a saved Section 5 spot is restored');
    { const hk = await p.evaluate(() => __world._dbg().L.heroKey); assert(/collar/.test(hk) && /hoe/.test(hk) && /capotain/.test(hk) && /charter/.test(hk) && /wool/.test(hk), 'the Pilgrim gear shows on the wool dress (' + hk + ')'); }
    await p.evaluate(() => __world.faceCam(Math.PI / 2)); await sleep(900); await shot('v27-hero.png');
    assert(!/buckle band/.test(await p.evaluate(() => JSON.stringify(GAME_CONTENT.sections.find(s => s.id === 's5')))), 'no buckled Pilgrim hat in Section 5 content');
    { await p.setViewport({ width: 390, height: 844 }); await p.evaluate(() => document.body.classList.add('touch')); await tpRing('plymouth'); await sleep(700); await shot('v27-phone-390x844.png');
      await p.evaluate(() => document.body.classList.remove('touch')); await p.setViewport({ width: 1280, height: 800 }); await sleep(300); }
  }

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
