/* American Beginnings RPG v2.1 headless smoke test.
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8765/ SHOTS=/tmp/shots/ node tests/smoke-test.js */
const puppeteer = require('puppeteer-core') /* executablePath below: adjust to your Chrome */;
const SHOTS = process.env.SHOTS || '/tmp/smoke/';
const BASE = process.env.BASE || 'http://localhost:8765/';
const KEY = 'americanBeginningsRPG_v1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(c, m) { if (!c) throw new Error('ASSERT: ' + m); console.log('  ok -', m); }
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 860 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text()) && !/assets\/video\//.test((m.location() || {}).url || '')) errs.push(m.text()); });
  const url = BASE + (BASE.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  const go = async () => { await p.goto(url, { waitUntil: 'domcontentloaded' }); await sleep(1500); };
  const click = async sel => { await p.waitForSelector(sel, { timeout: 8000 }); await p.$eval(sel, e => e.click ? e.click() : e.dispatchEvent(new MouseEvent('click', { bubbles: true }))); await sleep(50); };
  const st = () => p.evaluate(() => JSON.parse(JSON.stringify(ABRPG.state())));

  /* 1. migration from a synthetic v1 save */
  await go();
  await p.evaluate(k => { localStorage.setItem(k, JSON.stringify({ version: 1, created: '2026-10-01T00:00:00Z', lastPlayed: '2026-10-02T00:00:00Z', players: { s1: { gender: 'girl', name: 'Ava' }, s2: { gender: 'girl', name: 'Ava' }, s3: { gender: 'girl', name: 'Ava' } },
    sections: { s1: { attempts: 1, history: [{ pct: 90 }], bestPct: 90, completed: true, completedAt: '2026-10-01T00:00:00Z', correctCount: 25, gearEarned: 5, topics: {}, missed: {} }, s2: { attempts: 1, history: [], bestPct: 85, completed: true, correctCount: 20, gearEarned: 4, topics: {}, missed: {} }, s3: { attempts: 0, history: [], bestPct: 0, completed: false, correctCount: 5, gearEarned: 1, topics: {}, missed: {} } },
    final: { attempts: 0, bestPct: 0, passed: false, history: [] },
    gear: [['Fur Cloak', 's1'], ['Clovis Spear Point', 's1'], ['Woven Basket', 's1'], ['Shell Necklace', 's1'], ['Feathered Headband', 's1'], ['Spyglass', 's3']].map(g => ({ name: g[0], section: g[1], at: '2026-10-01T00:00:00Z' })),
    badges: [{ name: 'Mammoth Trail Badge', icon: '🦣', section: 's1', at: '2026-10-01T00:00:00Z' }, { name: 'B2', icon: '🌽', section: 's2', at: '2026-10-01T00:00:00Z' }], totalCorrect: 60, totalAnswered: 70, run: null })); }, KEY);
  await go();
  let s = await st();
  console.log('migration:');
  assert(s.version >= 2, 'version upgraded');
  assert(s.sections.s1.completed && s.sections.s2.completed, 'section progress kept');
  assert(s.owned.length === 6 && s.owned.includes('sounding-lead') && s.owned.includes('fur-cloak'), 'v1 gear names mapped to item keys (Spyglass -> sounding-lead)');
  assert(s.equip.cloak === 'fur-cloak' && s.equip.head === 'feather-band', 'migrated gear is worn');
  assert(s.stars.balance === 60 + 60 && s.stars.bySource.carried === 120, 'retro stars = totalCorrect + 30/badge (120)');
  assert(s.badges.length === 2 && s.migratedFrom === 1, 'badges kept, migratedFrom set');
  assert(s.sections.s2.completed && s.sections.s2.passMark === 80 && s.sections.s1.passMark === 80 && !s.sections.s3.passMark, 'lands passed at the old 80% mark keep their pass (s2 at 85%), tagged passMark 80');
  assert(await p.evaluate(() => GAME_CONTENT.passPercent === 95 && [24, 20, 10, 40, 23].map(ABRPG.passNeed).join() === '23,19,10,38,22'), 'pass mark 95% computed from the percentage: 24->23, 20->19, 10->10, 40->38, 23->22');
  await p.screenshot({ path: SHOTS + 'm-migrated-map.png' });
  await go(); s = await st();
  assert(s.stars.balance === 120, 'no double retro stars after second load');
  assert(s.version === 3 && s.srcQ && s.skills, 'v1 save lands on save format v3 (srcQ + skills added)');

  /* 1b. a v2.0 save (format 2: no srcQ / skills) loads in v2.1 with nothing lost */
  await p.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); d.version = 2; delete d.srcQ; delete d.skills; d.stars.balance = 77; d.owned.push('moccasins'); localStorage.setItem(k, JSON.stringify(d)); }, KEY);
  await go(); s = await st();
  console.log('v2.0 save:');
  assert(s.version === 3 && typeof s.srcQ === 'object' && typeof s.skills === 'object', 'v2 save upgraded to format 3 with empty srcQ and skills');
  assert(s.stars.balance === 77 && s.owned.includes('moccasins') && s.sections.s1.completed && s.badges.length === 2, 'v2 save keeps stars, items, progress and badges');
  assert(errs.length === 0, 'old saves load without page errors ' + JSON.stringify(errs));

  /* 2. fresh game */
  await p.evaluate(k => localStorage.removeItem(k), KEY); await go();
  assert((await p.$eval('#game-version', e => e.textContent)) === 'v2.1' && (await p.evaluate(() => ABRPG.version)) === 'v2.1', 'version marker v2.1');
  await p.screenshot({ path: SHOTS + '1-map.png' });
  await click('.node[data-sid="s1"]');
  await click('#pg button[data-g="boy"]'); await click('#pn button'); await p.screenshot({ path: SHOTS + '2-char.png' });
  await click('#b-go'); await p.screenshot({ path: SHOTS + '3-intro.png', fullPage: true });
  const actIds = await p.$$eval('.act-card', els => els.map(e => e.getAttribute('data-act')));
  assert(actIds.length === 5, 's1 shows 5 activities (3 classic + map + timeline)');
  assert((await p.evaluate(ids => ids.map(id => GAME_CONTENT.sections[0].activities.find(a => a.id === id).type).slice(3).join(), actIds)) === 'geomap,timeline', 's1 has a map challenge and a timeline challenge');

  /* activity solver: plays perfectly, or with `miss` deliberate mistakes */
  /* v2.1 map challenge: places every label with real input, cycling tap -> touch drag -> mouse drag.
     `miss` deliberate wrong taps go on the first label (dropped on the farthest dot). Drops land a few px off the dot to exercise tolerance. */
  const geoActOnScreen = () => p.evaluate(() => { const h2 = document.querySelector('#screen h2').textContent; let a = null; GAME_CONTENT.sections.forEach(s => (s.activities || []).forEach(x => { if (x.type === 'geomap' && h2.includes(x.title)) a = x; })); return a; });
  const dotXY = ti => p.evaluate(ti => { const el = document.querySelector('.geo-t[data-ti="' + ti + '"]'); el.scrollIntoView({ block: 'center' }); const r = el.querySelector('.dot').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, ti);
  const fbText = () => p.$eval('#a-fb', e => e.innerText);
  async function solveGeo(miss, log) {
    let step = 0;
    for (let guard = 0; guard < 40; guard++) {
      const c = await p.$('.geo-tray .drag-item'); if (!c) break;
      const ii = await p.evaluate(c => +c.getAttribute('data-ii'), c);
      while (miss > 0) {
        const far = await p.evaluate(ii => { const me = document.querySelector('.geo-t[data-ti="' + ii + '"] .dot').getBoundingClientRect(); let best = -1, bd = -1; document.querySelectorAll('.geo-t').forEach(t => { const r = t.querySelector('.dot').getBoundingClientRect(), d = Math.hypot(r.x - me.x, r.y - me.y); if (d > bd) { bd = d; best = +t.getAttribute('data-ti'); } }); return best; }, ii);
        await p.click('.geo-tray .drag-item[data-ii="' + ii + '"]'); const o = await dotXY(far); await p.mouse.click(o[0], o[1]); await sleep(80); miss--;
        if (log) log.wrong.push(await fbText());
      }
      const o = await dotXY(ii); const tx = o[0] + 6, ty = o[1] - 5;
      const box = await (await p.$('.geo-tray .drag-item[data-ii="' + ii + '"]')).boundingBox();
      const vp = p.viewport(), vis = box && box.y > 0 && box.y + box.height < vp.height;
      const mode = (log && vis) ? step % 3 : 0; // bulk solves use tap only (reliable); dedicated test cycles modes
      const left0 = await p.$$eval('.geo-tray .drag-item', x => x.length);
      if (mode === 0) { await p.evaluate(ii => document.querySelector('.geo-tray .drag-item[data-ii="' + ii + '"]').click(), ii); const q = await dotXY(ii); await p.mouse.click(q[0] + 6, q[1] - 5); }
      else if (mode === 1) { await p.touchscreen.touchStart(box.x + 6, box.y + 6); await p.touchscreen.touchMove((box.x + tx) / 2, (box.y + ty) / 2); await p.touchscreen.touchMove(tx, ty); await p.touchscreen.touchEnd(); }
      else { await p.mouse.move(box.x + 6, box.y + 6); await p.mouse.down(); await p.mouse.move(tx, ty, { steps: 5 }); await p.mouse.up(); }
      await sleep(90);
      const f = await fbText(); if (!f.includes('✅')) throw new Error('map placement failed (' + ['tap', 'touch', 'mouse'][mode] + '): ' + f);
      const left1 = await p.$$eval('.geo-tray .drag-item', x => x.length);
      if (left1 !== left0 - 1 && !(await p.$('#a-again'))) throw new Error('map label not consumed after ' + ['tap', 'touch', 'mouse'][mode] + ' (left ' + left1 + '/' + left0 + ')');
      if (log) log.modes[mode]++;
      step++;
    }
    await p.waitForSelector('#a-again', { timeout: 8000 });
  }
  /* v2.1 timeline: puts each card in its gap by date with tap / touch drag / mouse drag; `miss` wrong gaps first */
  async function solveTL(miss, log) {
    let step = 0;
    for (let guard = 0; guard < 30; guard++) {
      const t = await p.evaluate(() => { const h2 = document.querySelector('#screen h2').textContent; let a = null; GAME_CONTENT.sections.forEach(s => (s.activities || []).forEach(x => { if (x.type === 'timeline' && h2.includes(x.title)) a = x; })); (GAME_CONTENT.finalActivities || []).forEach(x => { if (h2.includes(x.title)) a = x; });
        const Y = {}; a.events.forEach(e => Y[e.t] = e.y); const line = [...document.querySelectorAll('.tl-ev b')].map(x => Y[x.textContent]); const card = document.querySelector('.tl-card'); if (!card) return null;
        const y = Y[card.textContent]; let g = 0; while (g < line.length && line[g] < y) g++; return { ti: +card.getAttribute('data-ti'), g, sorted: line.every((v, i) => !i || line[i - 1] <= v) }; });
      if (!t) break;
      if (!t.sorted) throw new Error('timeline line out of order');
      while (miss > 0) { await p.evaluate((ti, g) => { document.querySelector('.tl-card[data-ti="' + ti + '"]').click(); document.querySelector('.tl-gap[data-gap="' + g + '"]').click(); }, t.ti, t.g === 0 ? 1 : 0); await sleep(80); miss--; if (log) log.wrong.push(await fbText()); }
      const mode = log ? step % 3 : 0; // bulk solves use tap only
      const left0 = await p.$$eval('.tl-card', x => x.length);
      if (mode === 0) { await p.evaluate((ti, g) => { document.querySelector('.tl-card[data-ti="' + ti + '"]').click(); document.querySelector('.tl-gap[data-gap="' + g + '"]').click(); }, t.ti, t.g); }
      else { const gap = await p.$('.tl-gap[data-gap="' + t.g + '"]'); await gap.evaluate(e => e.scrollIntoView({ block: 'center' })); const gb = await gap.boundingBox(); const cb = await (await p.$('.tl-card[data-ti="' + t.ti + '"]')).boundingBox(); const gx = gb.x + gb.width / 2, gy = gb.y + gb.height / 2;
        if (mode === 1) { await p.touchscreen.touchStart(cb.x + 8, cb.y + 8); await p.touchscreen.touchMove(gx, (cb.y + gy) / 2); await p.touchscreen.touchMove(gx, gy); await p.touchscreen.touchEnd(); }
        else { await p.mouse.move(cb.x + 8, cb.y + 8); await p.mouse.down(); await p.mouse.move(gx, gy, { steps: 6 }); await p.mouse.up(); } }
      await sleep(90);
      const f = await fbText(); if (!f.includes('✅')) throw new Error('timeline placement failed (' + ['tap', 'touch', 'mouse'][mode] + '): ' + f);
      let left1 = await p.$$eval('.tl-card', x => x.length);
      if (left1 !== left0 - 1 && !(await p.$('#a-again'))) {
        // sticky tray / overlay can eat a Puppeteer hit; retry once via element.click
        await p.evaluate((ti, g) => { const c = document.querySelector('.tl-card[data-ti="' + ti + '"]'); if (c) c.click(); const gp = document.querySelector('.tl-gap[data-gap="' + g + '"]'); if (gp) gp.click(); }, t.ti, t.g);
        await sleep(100);
        left1 = await p.$$eval('.tl-card', x => x.length);
        if (left1 !== left0 - 1 && !(await p.$('#a-again'))) throw new Error('timeline card not consumed after ' + ['tap', 'touch', 'mouse'][mode] + ' (left ' + left1 + '/' + left0 + ', fb=' + (await fbText()).slice(0, 60) + ')');
      }
      if (log) log.modes[mode]++;
      step++;
    }
    await p.waitForSelector('#a-again', { timeout: 8000 });
  }
  async function solve(miss) {
    if (await p.$('.geo-tray')) return solveGeo(miss);
    if (await p.$('.tl-tray')) return solveTL(miss);
    for (let guard = 0; guard < 200; guard++) {
      if (await p.$('#a-again')) return;
      const info = await p.evaluate(() => {
        const sid = Object.keys(ABRPG.state().sections).length ? null : null;
        if (document.querySelector('#a-again')) return { fin: true };
        const H = document.querySelector('#screen h2'); if (!H) return { none: document.getElementById('screen').innerHTML.slice(0, 400) };
        const h2 = H.textContent;
        let act = null; GAME_CONTENT.sections.forEach(s => (s.activities || []).forEach(a => { if (h2.includes(a.title)) act = a; }));
        return { act, seq: !!document.querySelector('.seq-card'), drag: !!document.querySelector('.drag-item:not(.ghost)'), sc: !!document.querySelector('.sc-choice:not([disabled])'), next: !!document.querySelector('#a-next') };
      });
      if (info.fin) return;
      if (info.none !== undefined) throw new Error('no activity on screen: ' + info.none);
      const a = info.act;
      if (info.next) { await click('#a-next'); continue; }
      if (info.seq) {
        const done = await p.$$eval('.seq-done li', l => l.length);
        if (done >= a.steps.length) { await sleep(300); continue; }
        const want = a.steps[done].t;
        const hit = await p.evaluate((want, wrong) => { const cs = [...document.querySelectorAll('.seq-card')]; const c = wrong ? cs.find(x => x.textContent !== want) : cs.find(x => x.textContent === want); if (!c) return cs.map(x => x.textContent).join(' | '); c.click(); return ''; }, want, miss > 0);
        if (hit) { console.log('  seq retry, want "' + want + '" cards: ' + hit); await sleep(300); continue; }
        if (miss > 0) miss--; await sleep(30); continue;
      }
      if (info.drag) {
        if (await p.$$eval('.drag-item:not(.ghost)', e => e.length) === 0) { await sleep(300); continue; }
        const t = await p.$eval('.drag-item:not(.ghost)', e => e.textContent);
        const it = a.items.find(x => x.t === t);
        const bins = a.bins.map(x => x.id); const bin = miss > 0 ? bins.find(x => x !== it.bin) : it.bin; if (miss > 0) miss--;
        await p.evaluate(t => [...document.querySelectorAll('.drag-item')].find(x => x.textContent === t).click(), t);
        await p.evaluate(bin => { const el = document.querySelector('#a-body [data-bin="' + bin + '"]'); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }, bin);
        await sleep(30); continue;
      }
      if (info.sc) {
        await p.evaluate((wrong) => {
          const h2 = document.querySelector('#screen h2').textContent; let act; GAME_CONTENT.sections.forEach(s => (s.activities || []).forEach(a => { if (h2.includes(a.title)) act = a; }));
          const nodes = act.nodes || act.lines; const say = document.querySelector('.bubble, .sc-say').innerText;
          const nd = nodes.find(n => say.includes(n.say.replace(/\*+/g, '').slice(0, 40))) || nodes[0];
          const btns = [...document.querySelectorAll('.sc-choice:not([disabled])')];
          const b = btns.find(x => !!nd.choices[+x.getAttribute('data-c')].ok === !wrong) || btns[0]; b.click();
        }, miss > 0);
        if (miss > 0) miss--; await sleep(30); continue;
      }
      await sleep(400);
    }
    throw new Error('activity solver stuck');
  }
  const bal0 = (await st()).stars.balance;
  await click('#act-' + actIds[0]); await p.screenshot({ path: SHOTS + 'a1-' + actIds[0] + '.png', fullPage: true });
  await solve(0); await p.screenshot({ path: SHOTS + 'a1-done.png' });
  s = await st();
  assert(s.stars.balance - bal0 === 20 && s.acts[actIds[0]].best === 3, 'perfect first play = 20 stars');
  await click('#a-again'); await solve(0); s = await st();
  assert(s.stars.balance - bal0 === 22, 'replay = 2 practice stars only');
  for (let i = 0; i < 3; i++) { await click('#a-again'); await solve(0); }
  s = await st(); assert(s.stars.balance - bal0 === 26 && s.acts[actIds[0]].practiceCount === 3, 'practice capped at 3 per day (anti-farm)');
  await click('#a-back');
  await click('#act-' + actIds[1]); await p.screenshot({ path: SHOTS + 'a2-' + actIds[1] + '.png', fullPage: true }); await solve(2);
  s = await st(); assert(s.acts[actIds[1]].best === 2 && s.stars.balance - bal0 === 26 + 14, '2 mistakes = 14 stars');
  await click('#a-back');
  await click('#act-' + actIds[2]); await p.screenshot({ path: SHOTS + 'a3-' + actIds[2] + '.png', fullPage: true }); await solve(0);
  await click('#a-back');

  /* trial: 24 questions, 2 misses */
  await click('#b-l'); await p.screenshot({ path: SHOTS + '4-lesson.png', fullPage: true });
  while (await p.$('#b-next')) await click('#b-next');
  await click('#b-trial');
  let gearN = 0;
  async function answer(correct) {
    if (await p.$('.choice')) await click(correct ? '.choice[data-ci="0"]' : '.choice:not([data-ci="0"])');
    else {
      const ans = await p.evaluate(c => { const h2 = document.querySelector('#screen h2').textContent;
        for (const s of GAME_CONTENT.sections) for (const q of s.questions) if (q.q && h2.replace(/\s+/g, ' ').trim() === q.q.replace(/_{3,}/g, '').replace(/\s+/g, ' ').trim()) return c ? q.accept[0].toUpperCase() + '!' : 'zzzz';
        return 'NOTFOUND'; }, correct);
      if (ans === 'NOTFOUND') throw new Error('typed q not found');
      await p.type('#ans', ans); await click('#f-ans button');
    }
    const ok = await p.$eval('.feedback', e => e.classList.contains('ok'));
    if (ok !== correct) throw new Error('feedback mismatch, expected ' + correct);
    await click('#b-cont');
    if (await p.$('#modal:not(.hidden) #b-ok')) { gearN++; if (gearN === 1) await p.screenshot({ path: SHOTS + '5-gear.png' }); await click('#b-ok'); }
  }
  const balT = (await st()).stars.balance;
  let missLeft = 1;   /* 23 of 24 = 95.8%: exactly the pass mark (95% -> 23 of 24) */
  for (let i = 0; i < 24; i++) await answer(!(missLeft > 0 && i % 5 === 2 && missLeft--));
  s = await st(); assert(s.stars.balance - balT === 46, '23 first-time correct answers = 46 stars');
  await p.screenshot({ path: SHOTS + '6-results.png' });
  await click('#b-rev');
  while (await p.$('#b-ready')) { await click('#b-ready'); await answer(true); await sleep(60); }
  await p.screenshot({ path: SHOTS + '7-badge.png' });
  s = await st();
  assert(s.sections.s1.completed && s.badges.length === 1, 's1 mastered with badge');
  assert(s.stars.bySource.badge === 30, 'badge bonus 30 stars');
  assert(gearN === 4 && s.owned.length === 4, '4 gear items from 24 correct (1 per 5)');

  /* market */
  await click('#b-map'); await click('#btn-market'); await sleep(200);
  await p.screenshot({ path: SHOTS + 'mk-1-cahokia.png', fullPage: true });
  assert(await p.$eval('.mk-tab[data-mid="m2"]', e => e.classList.contains('locked')), 'Seville market locked until s2');
  const bal = (await st()).stars.balance;
  const items = await p.evaluate(() => GAME_CONTENT.markets[0].items.map(i => ({ key: i.key, price: i.price })));
  const cheap = items.filter(i => i.price <= bal).sort((a, b) => a.price - b.price)[0];
  const dear = items.filter(i => i.price > bal)[0];
  await click('[data-ask="' + cheap.key + '"]');
  assert((await p.$eval('#mk-say', e => e.innerText)).length > 60, 'shopkeeper tells a fact');
  if (dear) {
    await click('[data-buy="' + dear.key + '"]'); s = await st();
    assert(s.stars.balance === bal && !s.owned.includes(dear.key) && !(await p.$('#modal:not(.hidden)')), 'cannot buy without enough stars (no charge)');
  }
  await click('[data-buy="' + cheap.key + '"]'); await p.screenshot({ path: SHOTS + 'mk-2-confirm.png' });
  await click('#b-buy-yes'); await sleep(150); s = await st();
  assert(s.stars.balance === bal - cheap.price && s.owned.includes(cheap.key) && s.purchases.length === 1, 'purchase deducts ' + cheap.price + ' stars and adds item');
  const it = await p.evaluate(k => ({ slot: ABRPG.items[k].slot, art: !!ABRPG.items[k].art }), cheap.key);
  if (it.art && it.slot !== 'pack') assert(s.equip[it.slot] === cheap.key, 'bought item is worn on hero');
  await p.screenshot({ path: SHOTS + 'mk-3-bought.png', fullPage: true });
  assert(!(await p.evaluate(() => ABRPG.buy('moccasins') && ABRPG.buy('moccasins'))), 'cannot buy same item twice');
  assert((await st()).stars.balance >= 0, 'balance never negative');
  await p.evaluate(() => { const s = ABRPG.state(); s.stars.balance = 5; }); 
  assert(!(await p.evaluate(() => ABRPG.buy('copper-plate') || ABRPG.buy(GAME_CONTENT.markets[0].items.slice(-1)[0].key))), 'buy() refuses when balance too low');
  await go();
  s = await st();

  /* character screen */
  await click('#btn-inv'); await p.screenshot({ path: SHOTS + 'c-1-character.png', fullPage: true });
  const eq = await p.$$eval('.eq-btn[data-key=""]', e => e.length); assert(eq >= 1, 'character screen has equip controls');
  await click('.eq-btn[data-slot="cloak"][data-key=""]'); s = await st(); assert(!s.equip.cloak, 'unequip works');
  await click('.eq-btn[data-slot="cloak"][data-key="fur-cloak"]'); s = await st(); assert(s.equip.cloak === 'fur-cloak', 're-equip works');

  /* report */
  await click('#btn-report'); await p.screenshot({ path: SHOTS + '9-report.png' });
  const rep = await p.$eval('#rep-text', e => e.textContent);
  assert(/STARS: balance/.test(rep) && /HISTORY ACTIVITIES/.test(rep) && /MARKETPLACE PURCHASES/.test(rep), 'report shows stars, activities, purchases');
  console.log(rep.slice(0, 1400));
  const t = await p.evaluate(() => { const q = { accept: ['francisco pizarro', 'pizarro'] }; const A = window.ABRPG; return [A.checkTyped(q, 'The Pizarro.'), A.checkTyped(q, 'Pizaro'), A.checkTyped(q, 'cortes'), A.checkTyped({ accept: ['1607'] }, '1608')]; });
  console.log('  typed checks', t.join()); assert(t[0] && t[1] && !t[2] && !t[3], 'typed answer checks');
  await click('#b-close');

  /* tablet */
  await p.setViewport({ width: 820, height: 1180 }); await click('#btn-market'); await p.screenshot({ path: SHOTS + '10-tablet-market.png' });
  await click('#btn-home'); await click('.node[data-sid="s2"]'); await click('#pn button'); await click('#b-go');
  await p.screenshot({ path: SHOTS + '10-tablet-s2.png' });
  /* real pointer drag on a sort/map activity (s1 has a sort?) */
  const dragAct = await p.evaluate(() => (GAME_CONTENT.sections[1].activities.find(a => a.type === 'sort' || a.type === 'map') || {}).id);
  if (dragAct) {
    await click('#act-' + dragAct);
    const t = await p.$eval('.drag-item', e => e.textContent);
    const bin = await p.evaluate((t, id) => GAME_CONTENT.sections[1].activities.find(a => a.id === id).items.find(x => x.t === t).bin, t, dragAct);
    const src = await (await p.$('.drag-item')).boundingBox(); const dst = await (await p.$('#a-body [data-bin="' + bin + '"]')).boundingBox();
    await p.mouse.move(src.x + 10, src.y + 10); await p.mouse.down(); await p.mouse.move(src.x + 40, src.y + 40, { steps: 5 });
    await p.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, { steps: 10 }); await p.mouse.up(); await sleep(100);
    assert(await p.$eval('#a-fb', e => e.innerText.includes('✅')), 'pointer drag-and-drop places a card');
    await click('#a-quit');
  }

  const s2acts = await p.$$eval('.act-card', els => els.map(e => e.getAttribute('data-act')));
  for (const id of s2acts) { await click('#act-' + id); await solve(0); await click('#a-back'); }
  console.log('  s2 activities solved:', s2acts.join(','));
  await p.setViewport({ width: 1280, height: 860 });

  /* persistence */
  await go(); s = await st();
  assert(s.sections.s1.completed && s.owned.includes(cheap.key) && s.purchases.length === 1 && Object.keys(s.acts).length === 8, 'progress, purchases, activities persist after reload');

  /* under-95% path in s2: miss 2 of 24 (22/24 = 91.7%, a pass under the old 80% mark) -> must review, then retake */
  await click('.node[data-sid="s2"]'); if (await p.$('#pn button')) { await click('#pn button'); await click('#b-go'); }
  if (await p.$('#b-resume')) await click('#b-resume');
  await click('#b-t'); if (await p.$('#b-trial')) await click('#b-trial');
  for (let i = 0; i < 24; i++) await answer(i >= 2);
  assert(/95% \(23 of 24/.test(await p.$eval('#screen', e => e.textContent)), 'results screen says 95% (23 of 24)');
  await click('#b-rev');
  while (await p.$('#b-ready')) { await click('#b-ready'); await answer(true); await sleep(50); }
  assert(!!(await p.$('#b-again')) && !(await st()).sections.s2.completed, '22/24 (91.7%) is under 95% -> review then retake, s2 not mastered');
  await click('#b-map');

  /* every activity in every section solves */
  await p.evaluate(k => { const s = ABRPG.state(); GAME_CONTENT.sections.forEach(x => { s.sections[x.id] = Object.assign(s.sections[x.id] || { attempts: 1, history: [], bestPct: 90, correctCount: 0, gearEarned: 0, topics: {}, missed: {} }, { completed: true }); s.players[x.id] = s.players[x.id] || { gender: 'girl', name: 'Ava' }; }); localStorage.setItem(k, JSON.stringify(s)); }, KEY);
  await go();
  const all = await p.evaluate(() => GAME_CONTENT.sections.map(s => ({ sid: s.id, ids: (s.activities || []).map(a => a.id) })));
  let solvedN = 0;
  for (const sec of all) for (const id of sec.ids) {
    await p.evaluate((sid, id) => ABRPG.runActivity(sid, id, ABRPG.home), sec.sid, id); await sleep(200);
    if (solvedN % 4 === 0) await p.screenshot({ path: SHOTS + 'act-' + id + '.png', fullPage: true });
    try { await solve(0); } catch (e) { throw new Error('activity ' + id + ' failed: ' + e.message); } solvedN++;
  }
  assert(solvedN === 31, 'all 31 activities completed (19 classic + 6 maps + 6 timelines)');

  /* v2.1 primary-source scroll: shows the source, its quiz pays and records srcQ, a miss comes back until cleared */
  console.log('primary-source scrolls:');
  const srcL = await p.evaluate(() => { const o = []; GAME_CONTENT.sections.forEach(s => s.lessons.forEach((l, i) => { if (l.source) o.push({ sid: s.id, i, topic: l.topic, n: s.questions.filter(q => q.topic === l.topic).length }); })); return o; });
  assert(srcL.length >= 8 && srcL.every(x => x.n >= 3), srcL.length + ' source scrolls, each with at least 3 source questions');
  const sc = srcL[0];
  await p.evaluate((sid, i) => ABRPG.lesson(sid, i), sc.sid, sc.i); await sleep(200);
  assert(await p.evaluate(() => !!document.querySelector('.src-q #b-srcq') && document.querySelector('#screen').innerText.length > 400), 'scroll shows the source and a source-questions button');
  await p.screenshot({ path: SHOTS + 'v21-primary-source.png', fullPage: true });
  const srcBal = (await st()).stars.balance;
  await click('#b-srcq'); await answer(false);
  let srcAns = 0; while (await p.$('#screen .qtype')) { await answer(true); srcAns++; await sleep(30); if (srcAns > 40) throw new Error('source quiz loop'); }
  assert(/Source questions complete/.test(await p.$eval('#screen', e => e.innerText)) && srcAns === sc.n, 'source quiz: missed question came back, all ' + sc.n + ' cleared');
  s = await st(); assert(s.srcQ[sc.topic].plays === 1 && s.srcQ[sc.topic].last === sc.n - 1 && s.srcQ[sc.topic].wrong === 1, 'srcQ records first-try score ' + (sc.n - 1) + '/' + sc.n + ' and the miss');
  assert(s.stars.balance >= srcBal, 'source quiz never costs stars');

  /* v2.1 map challenge: wrong drops count, hint, tolerance, mouse + touch + tap, review of misses */
  console.log('map challenges:');
  await p.setViewport({ width: 1100, height: 900 });
  await p.evaluate(() => ABRPG.runActivity('s6', 's6-geomap', ABRPG.home)); await sleep(250);
  const sk0 = JSON.parse(JSON.stringify((await st()).skills['s6-geomap'] || { right: 0, wrong: 0 }));
  const gLog = { wrong: [], modes: [0, 0, 0] }, nT = await p.$$eval('.geo-tray .drag-item', x => x.length);
  await solveGeo(2, gLog);
  assert(gLog.wrong.length === 2 && gLog.wrong.every(w => !w.includes('✅')), 'wrong drops are rejected with feedback');
  assert(gLog.modes.every(n => n > 0), 'labels placed by tap (' + gLog.modes[0] + '), touch drag (' + gLog.modes[1] + ') and mouse drag (' + gLog.modes[2] + ')');
  s = await st(); let sk = s.skills['s6-geomap'];
  assert(sk && sk.right - sk0.right === nT - 1 && sk.wrong - sk0.wrong === 1 && Object.keys(sk.missed).length === 1 && s.acts['s6-geomap'].history.slice(-1)[0].mistakes === 2, 'map scoring: ' + nT + ' labels, 2 wrong drops on 1 label = ' + (nT - 1) + ' right first try, 1 missed label logged');
  await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: SHOTS + 'v21-map.png' });
  assert(!!(await p.$('#a-review')), 'missed label offers mastery review');
  await click('#a-review'); await sleep(150);
  assert(!!(await p.$('#screen .qtype')), 'review opens the linked exam question');
  const geoTol = await p.evaluate(() => { const a = GAME_CONTENT.sections.find(s => s.id === 's6').activities.find(a => a.type === 'geomap'); const g = GAME_CONTENT.mapGeo[a.geo]; return !!g && a.targets.every(t => typeof t.lat === 'number' && typeof t.lon === 'number' && t.q); });
  assert(geoTol, 'every s6 map target has coordinates and a linked review question');

  /* v2.1 timelines: events ordered by date, wrong gap feedback, review, cumulative Grand Timeline */
  console.log('timelines:');
  const tlCheck = await p.evaluate(() => GAME_CONTENT.sections.map(s => { const a = s.activities.find(a => a.type === 'timeline'); return a ? a.events.length : 0; }).concat([(GAME_CONTENT.finalActivities || [])[0] ? GAME_CONTENT.finalActivities[0].events.length : 0]));
  assert(tlCheck.slice(0, 6).every(n => n >= 5 && n <= 8) && tlCheck[6] >= 8, 'each section timeline has 5-8 events; Grand Timeline has ' + tlCheck[6]);
  assert(await p.evaluate(() => (GAME_CONTENT.finalActivities[0].events).every(e => e.y >= 1492 && e.y <= 1754)), 'Grand Timeline spans 1492-1754');
  await p.evaluate(() => ABRPG.runActivity('s3', 's3-timeline', ABRPG.home)); await sleep(250);
  const tLog = { wrong: [], modes: [0, 0, 0] };
  await solveTL(2, tLog);
  assert(tLog.wrong.length === 2 && tLog.wrong.every(w => /before|after/i.test(w)), 'wrong gaps explain before/after');
  assert(tLog.modes.every(n => n > 0), 'cards placed by tap, touch drag and mouse drag');
  await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: SHOTS + 'v21-timeline.png' });
  s = await st(); sk = s.skills['s3-timeline'];
  assert(sk && sk.wrong === 1 && Object.keys(sk.missed).length === 1 && !!(await p.$('#a-review')), 'timeline mistakes logged and offered for review');
  await click('#a-review'); await sleep(150); assert(!!(await p.$('#screen .qtype')), 'timeline review opens the linked question');
  await p.evaluate(() => ABRPG.finalIntro()); await sleep(200); await click('#b-fa-final-timeline'); await sleep(200);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: SHOTS + 'v21-timeline-start.png' });
  await solveTL(0); s = await st();
  assert(s.acts['final-timeline'] && s.acts['final-timeline'].best === 3, 'Grand Timeline (final) completed perfectly before the Grand Trial');
  await p.setViewport({ width: 1280, height: 860 });
  for (const m of ['m2', 'm3', 'm4', 'm5']) { await click('#btn-market'); await click('.mk-tab[data-mid="' + m + '"]'); await sleep(150); await p.screenshot({ path: SHOTS + 'mk-' + m + '.png', fullPage: true }); }
  assert(!(await p.$eval('.mk-tab[data-mid="m5"]', e => e.classList.contains('locked'))), 'all markets open when all lands mastered');

  /* video player component: every video slot shows timed lower-third captions, a Key Facts card,
     and a "What did you see?" check that pays stars once per question. A real file plays, and a missing
     file falls back to a placeholder fact tour. */
  await p.evaluate(() => { window.GAME_CONTENT.videoTourSeconds = 0.25; });
  const vids = await p.evaluate(() => { const o = []; window.GAME_CONTENT.sections.forEach(s => s.lessons.forEach((l, i) => { if (l.videoKey) o.push({ sid: s.id, i, key: l.videoKey, nq: window.GAME_CONTENT.videos[l.videoKey].check.length }); })); return o; });
  assert(vids.length === 8 && ['s5-jamestown-settlers', 's5-virginia-founders', 's5-virginia-struggles', 's5-pilgrim-voyage', 's5-new-england', 's1-beringia', 's1-clovis-points', 's1-early-maize'].every(k => vids.some(v => v.key === k)), 'all 8 video slots use the player (3 in s1, 5 in s5)'); const realWant = { 's1-beringia': 1, 's1-clovis-points': 1, 's1-early-maize': 1, 's5-jamestown-settlers': 1, 's5-virginia-founders': 1, 's5-virginia-struggles': 1, 's5-pilgrim-voyage': 1, 's5-new-england': 1 }; assert(true, 'all 8 verified clips are embedded');
  for (const v of vids) {
    const before = (await st()).stars.balance;
    await p.evaluate((sid, i) => ABRPG.lesson(sid, i), v.sid, v.i); await sleep(1500);
    const m = await p.evaluate(() => { const s = document.querySelector('.vslot'); return { real: s.classList.contains('has-video'), facts: s.querySelectorAll('.video-facts li').length, locked: s.querySelector('.vcheck-btn').disabled }; });
    let capSeen = '';
    if (m.real) {
      /* narrated clip: the "Play with sound" button starts it unmuted from the click, the audio really
         decodes, every caption is on screen at its cueTimes, then jump near the end to open the check */
      assert(await p.$eval('.vslot .vplay', e => !e.hidden), 'video ' + v.key + ': "Play with sound" button shown');
      await p.click('.vslot .vplay'); await sleep(1800); // a real mouse click, so Chrome allows sound
      const snd = await p.evaluate(key => { const vd = document.querySelector('.vslot video'); return { playing: !vd.paused, muted: vd.muted, bytes: vd.webkitAudioDecodedByteCount || 0, dur: vd.duration, sound: !document.querySelector('.vslot .vsound').hidden }; }, v.key);
      const sync = await p.evaluate(async key => { const V = window.GAME_CONTENT.videos[key], vd = document.querySelector('.vslot video'), bad = []; vd.pause();
        for (let k = 0; k < V.cueTimes.length; k++) { vd.currentTime = V.cueTimes[k] + 0.6; await new Promise(r => vd.addEventListener('seeked', r, { once: true })); vd.dispatchEvent(new Event('timeupdate')); const t = document.querySelector('.lower3.on .l3-t'); const want = V.cues[k].replace(/\*/g, ''); if (!t || t.textContent !== want) bad.push(k); }
        const t = document.querySelector('.lower3.on .l3-t'); const c = t ? t.textContent : '';
        vd.currentTime = vd.duration - 1.2; await new Promise(r => vd.addEventListener('seeked', r, { once: true })); await vd.play().catch(() => {}); return { bad, c, last: V.cueTimes[V.cueTimes.length - 1] }; }, v.key);
      capSeen = sync.c;
      assert(snd.playing && !snd.muted && snd.bytes > 0 && !snd.sound && sync.bad.length === 0 && snd.dur > sync.last + 3,
        'video ' + v.key + ': plays unmuted with sound (' + snd.bytes + ' audio bytes decoded), ' + snd.dur.toFixed(1) + ' s, captions in sync at every cueTime' + (sync.bad.length ? ' BAD ' + sync.bad : ''));
      await p.waitForSelector('.vcheck:not([hidden]) .vc-ch button', { timeout: 15000 });
    } else {
      await p.click('.vtour'); await sleep(1500);
      const tour = await p.evaluate(async key => { const V = window.GAME_CONTENT.videos[key], au = document.querySelector('.vslot audio'); const t = document.querySelector('.lower3.on .l3-t'); const r = { c: t ? t.textContent : '', audio: !!V.audio, playing: !!au && !au.paused && au.currentTime > 0.3, muted: !!au && au.muted };
        if (au) { au.currentTime = Math.max(0, au.duration - 0.8); } return r; }, v.key);
      capSeen = tour.c;
      if (tour.audio) assert(tour.playing && !tour.muted, 'video ' + v.key + ': narrated fact tour plays its narration track');
      await p.waitForSelector('.vcheck:not([hidden]) .vc-ch button', { timeout: 15000 });
    }
    if (v.key === 's1-beringia' || v.key === 's5-pilgrim-voyage' || v.key === 's5-jamestown-settlers' || v.key === 's5-virginia-founders') await p.screenshot({ path: SHOTS + 'v-' + v.key + '.png', fullPage: true });
    for (let q = 0; q < v.nq; q++) {
      await p.evaluate(key => { const c = window.GAME_CONTENT.videos[key].check; const qt = document.querySelector('.vc-q b').textContent; const qq = c.find(x => x.q.replace(/\*/g, '') === qt) || c[0]; [...document.querySelectorAll('.vc-ch button')].find(b => b.textContent === qq.choices[0].replace(/\*/g, '')).click(); }, v.key);
      await sleep(80); await click('.vc-next');
    }
    if (v.key === 's1-beringia') await p.screenshot({ path: SHOTS + 'v-check-done.png', fullPage: true });
    const after = await st();
    assert(m.real === !!realWant[v.key] && m.locked && m.facts >= 3 && capSeen.length > 10 && after.stars.balance - before === 5 * v.nq && after.videos[v.key].best === v.nq,
      'video ' + v.key + (m.real ? ' (real file)' : ' (placeholder tour)') + ': caption "' + capSeen.slice(0, 40) + '...", ' + m.facts + ' facts, check +' + (after.stars.balance - before) + '⭐');
  }
  /* retaking a check pays nothing */
  const b0 = (await st()).stars.balance;
  await p.evaluate(() => ABRPG.lesson('s5', 1)); await sleep(800); await click('.vcheck-btn');
  await p.evaluate(() => { const c = window.GAME_CONTENT.videos['s5-jamestown-settlers'].check; const qt = document.querySelector('.vc-q b').textContent; const qq = c.find(x => x.q === qt); [...document.querySelectorAll('.vc-ch button')].find(b => b.textContent === qq.choices[0]).click(); });
  await sleep(80);
  const vs = await st();
  assert(vs.stars.balance === b0 && vs.stars.bySource.video === 5 * vids.reduce((t, v) => t + v.nq, 0), 'a video check retake pays no stars; ' + vs.stars.bySource.video + ' video stars in total');
  const vq = await p.evaluate(() => window.GAME_CONTENT.sections.find(s => s.id === 's5').questions.filter(q => q.fromVideo).length);
  assert(vq === 12, 'video check questions are also in the Section 5 trial pool (' + vq + ')');
  await p.evaluate(() => ABRPG.home());

  /* final */
  await click('#btn-home'); await click('.node[data-sid="final"]'); await click('#b-go');
  for (let i = 0; i < 24; i++) await answer(true);
  await p.screenshot({ path: SHOTS + '11-final.png' });
  s = await st(); assert(s.final.passed && s.stars.bySource.crown === 50, 'final passed, crown bonus 50');
  assert(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await click('#btn-report'); await sleep(600); const rp = await p.evaluate(() => document.body.innerText + (document.querySelector('#rep-text') || {}).textContent); assert(/lesson videos/i.test(rp), 'Parent Report lists lesson videos');
  assert(/PRIMARY-SOURCE SCROLLS/.test(rp) && /MAP & TIMELINE CHALLENGES/.test(rp), 'Parent Report has source-scroll and map & timeline sections');
  const rs = await p.$$eval('#rep-skills tr', r => r.map(x => x.innerText));
  assert(rs.length >= 14 && rs.some(x => /Label the Thirteen Colonies/.test(x) && /%/.test(x)) && /Weak areas[\s\S]*(Map|Timeline)/.test(rp), 'Parent Report table shows map/timeline accuracy and weak areas');
  await p.screenshot({ path: SHOTS + 'v21-report.png', fullPage: true });
  console.log('ALL PASSED');
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
