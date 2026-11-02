/* American Beginnings RPG v2.9 mini-games test: every game in world/minigames/ (2 per level, 12 in all).
   For each game: open from its ring, intro card fits, Esc on the intro, Quit button, a real bot win with keys (E + arrows),
   a real bot loss, retry, the easy-mode offer after 2 misses, stars (+10 first win, +2 practice, no new save fields),
   card heights at a 440 px-tall viewport, and the level scene (visibility, layers, fog, lights) put back exactly on exit.
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8765/ [ONLY=s5] [NOBOT=1] node tests/minigames-test.js
   Run it on its own (SwiftShader is slow). */
const puppeteer = require('puppeteer-core');
const BASE = process.env.BASE || 'http://localhost:8765/';
const KEY = 'americanBeginningsRPG_v1', WKEY = 'americanBeginningsRPG_world';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const t0 = Date.now();
function check(c, m) { if (!c) { fails++; console.log('  FAIL -', m); } else console.log('  ok -', m); }
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: 1100, height: 720 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|assets\/video\//.test(m.text() + ((m.location() || {}).url || ''))) errs.push(m.text()); });
  const go = async () => { await p.goto(BASE + (BASE.includes('?') ? '&' : '?') + 'cb=' + Date.now(), { waitUntil: 'domcontentloaded' }); await sleep(1200); await p.evaluate(() => { if (window.__world) __world.quiet = true; }); };
  const players = {}; for (const s of ['s1', 's2', 's3', 's4', 's5', 's6']) players[s] = { gender: 'girl', name: 'Abigail' };
  const sections = {}; for (const s of ['s1', 's2', 's3', 's4', 's5']) sections[s] = { attempts: 1, history: [], bestPct: 96, completed: true, correctCount: 30, gearEarned: 5, topics: {}, missed: {} };
  await go(); await p.evaluate((k, wk, s) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(s)); localStorage.setItem(wk, JSON.stringify({ ver: 1, mode: 'walk', seenIntro: true, seen: { help: 1, help2: 1, help3: 1, help4: 1, help5: 1, help6: 1 } })); }, KEY, WKEY, { version: 3, players, sections, owned: [], equip: {} }); await go();
  const saveKeys0 = await p.evaluate(k => Object.keys(JSON.parse(localStorage.getItem(k))).sort().join(','), KEY);
  const enter = async sid => { await p.evaluate(() => { const b = document.getElementById('w-map') || document.querySelector('[data-act="map"]'); if (window.__world && __world.phase === 'active' && __world.exitLevel) __world.exitLevel(); });
    await sleep(500); await p.evaluate(s => document.querySelector('.node[data-sid="' + s + '"]').click(), sid);
    const t = Date.now(); while (Date.now() - t < 60000) { if ((await p.evaluate(() => __world.phase)) === 'active' && (await p.evaluate(() => __world.level)) === sid) break; await sleep(200); } await sleep(800); await p.evaluate(() => __world.closeCard()); };
  const stars = () => p.evaluate(k => (JSON.parse(localStorage.getItem(k)).stars || {}).balance || 0, KEY);
  const cardH = () => p.evaluate(() => { const c = document.querySelector('#mg-card .in'); return c ? Math.round(c.getBoundingClientRect().height) : 0; });
  const fitsIn = () => p.evaluate(() => { const c = document.querySelector('#mg-card .in'); if (!c) return true; const r = c.getBoundingClientRect(); const bs = [...c.querySelectorAll('button')].map(x => x.getBoundingClientRect()); return r.top >= 0 && r.bottom <= innerHeight + 1 && bs.every(q => q.bottom <= innerHeight + 1); });
  const snap = () => p.evaluate(() => { const sc = __mg.L().lvl.scene; return JSON.stringify({ n: sc.children.length, ch: sc.children.filter(o => !/^(region-label|ring:)/.test(o.name)).map(o => [o.name || o.type, o.visible, o.layers.mask])   /* labels and rings show by distance (world LOD) */, fog: sc.fog ? [sc.fog.color.getHexString(), sc.fog.near, sc.fog.far, sc.fog.density] : null, li: sc.children.filter(o => o.isLight).map(o => +o.intensity.toFixed(3)), bg: sc.background && sc.background.isColor ? sc.background.getHexString() : null }); });
  const same = async (S0, m) => { const S1 = await snap(); if (S1 === S0) return check(true, m); const a = JSON.parse(S0), c = JSON.parse(S1); const d = [];
    for (const k of ['n', 'fog', 'li', 'bg']) if (JSON.stringify(a[k]) !== JSON.stringify(c[k])) d.push(k + ' ' + JSON.stringify(a[k]) + '→' + JSON.stringify(c[k]));
    a.ch.forEach((x, i) => { if (JSON.stringify(x) !== JSON.stringify(c.ch[i])) d.push(JSON.stringify(x) + '→' + JSON.stringify(c.ch[i])); }); check(false, m + ' [' + d.slice(0, 4).join('; ') + ']'); };
  const waitEnd = async (lose, maxS) => { const held = new Set(); const setKey = async (k, on) => { if (on && !held.has(k)) { held.add(k); await p.keyboard.down(k); } if (!on && held.has(k)) { held.delete(k); await p.keyboard.up(k); } };
    const ts = Date.now(); let ph = 'play';
    while (Date.now() - ts < maxS * 1000) { const r = await p.evaluate(l => { if (__mg.phase !== 'play') return { ph: __mg.phase }; const g = __mg.game(); return Object.assign({ ph: 'play' }, g && g.bot ? g.bot(l) : {}); }, lose);
      if (r.ph !== 'play') { ph = r.ph; break; }
      await setKey('ArrowRight', r.x > 0.3); await setKey('ArrowLeft', r.x < -0.3); await setKey('ArrowUp', r.y > 0.3); await setKey('ArrowDown', r.y < -0.3);
      if (r.press) await p.keyboard.press('KeyE'); await sleep(25); }
    for (const k of [...held]) await p.keyboard.up(k); return { ph, secs: (Date.now() - ts) / 1000 }; };
  { const first = (process.env.ONLY || 's1').split(',')[0]; await enter(first); }   // the mini-game module loads with the first walkable level
  const REG = await p.evaluate(() => { const o = {}; for (const s in __mg.reg) o[s] = __mg.reg[s].map(g => g.id); return o; });
  check(Object.keys(REG).length === 6 && Object.values(REG).every(a => a.length >= 2 && a.length <= 3), 'registry: 2–3 games in each of the 6 levels (' + Object.values(REG).flat().length + ' games)');
  for (const sid of Object.keys(REG)) {
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(sid)) continue;
    console.log(sid + ':'); if ((await p.evaluate(() => __world.level)) !== sid) await enter(sid);
    const rings = await p.evaluate(() => __world.rings().filter(r => /^mg-/.test(r.id)).map(r => r.id));
    check(rings.length === REG[sid].length, sid + ': a ring for each mini-game (' + rings.join(', ') + ')');
    for (const id of REG[sid]) {
      const st0 = await stars();
      // open from the ring (the world's own action), intro card, Esc on the intro
      await p.evaluate(rid => { const r = __world.rings().find(q => q.id === rid); __world.teleport(r.x, r.z); }, 'mg-' + sid + '-' + id); await sleep(600);
      const S0 = await snap();
      await p.evaluate((s, i) => __mg.open(s, i), sid, id); await sleep(1200);
      check(await p.evaluate(() => __mg.phase === 'intro'), id + ': intro card opens'); check((await cardH()) <= 420 && await fitsIn(), id + ': intro card fits (' + (await cardH()) + ' px)');
      await p.keyboard.press('Escape'); await sleep(400); check(!(await p.evaluate(() => __mg.active)) && (await p.evaluate(() => __world.phase)) === 'active', id + ': Esc on the intro returns to exploring');
      await same(S0, id + ': scene put back after Esc');
      // Quit button mid-game
      await p.evaluate((s, i) => __mg.open(s, i), sid, id); await sleep(900); await p.keyboard.press('KeyE'); await sleep(500);
      check(await p.evaluate(() => __mg.phase === 'play'), id + ': E starts the game'); await p.click('#mg-quit'); await sleep(400);
      check(!(await p.evaluate(() => __mg.active)), id + ': Quit button leaves the game'); await same(S0, id + ': scene (visibility, layers, fog, lights) put back after Quit');
      // a real loss with keys, then the gentle retry, then a second loss offers easy mode
      await p.evaluate((s, i) => __mg.open(s, i), sid, id); await sleep(900); await p.keyboard.press('KeyE'); await sleep(400);
      if (!process.env.NOBOT) { const r = await waitEnd(true, 170); await sleep(1500); check(r.ph === 'lost', id + ': a careless player loses (' + r.secs.toFixed(1) + ' s)'); }
      else { await p.evaluate(() => __mg.cheatLose()); await sleep(1400); }
      check(/Try again/.test(await p.evaluate(() => __mg.card()) || ''), id + ': the lose card offers a retry');
      await p.keyboard.press('KeyE'); await sleep(500); check(await p.evaluate(() => __mg.phase === 'play'), id + ': E retries');
      await p.evaluate(() => __mg.cheatLose()); await sleep(1400);
      check(/easy mode/i.test(await p.evaluate(() => __mg.card()) || '') && /💡/.test(await p.evaluate(() => __mg.card()) || ''), id + ': after 2 misses a hint and easy mode are offered');
      await p.setViewport({ width: 1000, height: 440 }); await sleep(400); check(await fitsIn(), id + ': lose card fits a 440 px-tall screen (' + (await cardH()) + ' px)'); await p.setViewport({ width: 1100, height: 720 }); await sleep(300);
      await p.evaluate(() => [...document.querySelectorAll('#mg-card button')].find(x => /easy/i.test(x.textContent)).click()); await sleep(500);
      check(await p.evaluate(() => __mg.phase === 'play' && __mg.easy === true), id + ': easy mode starts');
      // a real win in easy mode pays 10 stars the first time
      if (!process.env.NOBOT) { const r = await waitEnd(false, 200); await sleep(1600); check(r.ph === 'won', id + ': the bot wins with real keys (' + r.secs.toFixed(1) + ' s, easy)'); }
      else { await p.evaluate(() => __mg.cheatWin()); await sleep(1500); }
      const st1 = await stars(); check(st1 - st0 === 10, id + ': first win pays 10 ⭐ (' + (st1 - st0) + ')');
      await p.setViewport({ width: 1000, height: 440 }); await sleep(400); check(await fitsIn(), id + ': win card fits a 440 px-tall screen (' + (await cardH()) + ' px)'); await p.setViewport({ width: 1100, height: 720 }); await sleep(300);
      // practice: play again pays 2
      await p.evaluate(() => [...document.querySelectorAll('#mg-card button')].find(x => /again/i.test(x.textContent)).click()); await sleep(500);
      await p.evaluate(() => __mg.cheatWin()); await sleep(1500); const st2 = await stars(); check(st2 - st1 === 2, id + ': a practice win pays 2 ⭐');
      await p.keyboard.press('Escape'); await sleep(500);
      check(!(await p.evaluate(() => __mg.active)) && (await p.evaluate(() => __world.phase)) === 'active', id + ': Esc on the win card returns to exploring');
      await same(S0, id + ': scene put back after a full game');
      const rec = await p.evaluate((s, i) => ABRPG.miniGameRec(s, i), sid, id); check(rec && rec.won && rec.practiceLeft === 2, id + ': record says won, 2 practice wins left today');
      const lbl = await p.evaluate(rid => __world.rings().find(r => r.id === rid), 'mg-' + sid + '-' + id); check(!!lbl, id + ': ring still there after the game');
    }
    // walking still works after the games
    const a = await p.evaluate(() => [__world.pos.x, __world.pos.z]); await p.keyboard.down('ArrowUp'); await sleep(700); await p.keyboard.up('ArrowUp');
    const c = await p.evaluate(() => [__world.pos.x, __world.pos.z]); check(Math.hypot(c[0] - a[0], c[1] - a[1]) > 0.5, sid + ': she can walk after the games');
  }
  // practice cap: 3 a day, then 0 stars
  { const sid = Object.keys(REG).find(s => !process.env.ONLY || process.env.ONLY.split(',').includes(s)), id = REG[sid][0];
    let paid = []; for (let i = 0; i < 3; i++) { const s0 = await stars(); await p.evaluate((s, i) => __mg.open(s, i), sid, id); await sleep(800); await p.keyboard.press('KeyE'); await sleep(400); await p.evaluate(() => __mg.cheatWin()); await sleep(1400); paid.push((await stars()) - s0); await p.keyboard.press('Escape'); await sleep(400); }
    check(paid.join(',') === '2,2,0', 'practice stars stop after 3 a day (' + paid.join(',') + ' after the first practice)'); }
  check((await p.evaluate(k => Object.keys(JSON.parse(localStorage.getItem(k))).sort().join(','), KEY)) === saveKeys0, 'no new top-level save fields');
  check(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  console.log('\n' + (fails ? fails + ' FAILED' : 'ALL PASSED') + ' in ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s');
  await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
