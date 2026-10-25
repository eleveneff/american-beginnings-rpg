/* American Beginnings RPG v2 headless smoke test.
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
  await p.screenshot({ path: SHOTS + 'm-migrated-map.png' });
  await go(); s = await st();
  assert(s.stars.balance === 120, 'no double retro stars after second load');

  /* 2. fresh game */
  await p.evaluate(k => localStorage.removeItem(k), KEY); await go();
  assert((await p.$eval('#game-version', e => e.textContent)) === 'v2.0', 'version marker v2.0');
  await p.screenshot({ path: SHOTS + '1-map.png' });
  await click('.node[data-sid="s1"]');
  await click('#pg button[data-g="boy"]'); await click('#pn button'); await p.screenshot({ path: SHOTS + '2-char.png' });
  await click('#b-go'); await p.screenshot({ path: SHOTS + '3-intro.png', fullPage: true });
  const actIds = await p.$$eval('.act-card', els => els.map(e => e.getAttribute('data-act')));
  assert(actIds.length === 3, 's1 shows 3 activities');

  /* activity solver: plays perfectly, or with `miss` deliberate mistakes */
  async function solve(miss) {
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
  let missLeft = 2;
  for (let i = 0; i < 24; i++) await answer(!(missLeft > 0 && i % 5 === 2 && missLeft--));
  s = await st(); assert(s.stars.balance - balT === 44, '22 first-time correct answers = 44 stars');
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
  assert(s.sections.s1.completed && s.owned.includes(cheap.key) && s.purchases.length === 1 && Object.keys(s.acts).length === 6, 'progress, purchases, activities persist after reload');

  /* under-80% path in s2: miss 6 of 24 (75%) -> must retake */
  await click('.node[data-sid="s2"]'); if (await p.$('#pn button')) { await click('#pn button'); await click('#b-go'); }
  if (await p.$('#b-resume')) await click('#b-resume');
  await click('#b-t'); if (await p.$('#b-trial')) await click('#b-trial');
  for (let i = 0; i < 24; i++) await answer(i >= 6);
  await click('#b-rev');
  while (await p.$('#b-ready')) { await click('#b-ready'); await answer(true); await sleep(50); }
  assert(!!(await p.$('#b-again')) && !(await st()).sections.s2.completed, 'under 80% -> review then retake, s2 stays locked-in');
  await click('#b-map');

  /* every activity in every section solves */
  await p.evaluate(k => { const s = ABRPG.state(); GAME_CONTENT.sections.forEach(x => { s.sections[x.id] = Object.assign(s.sections[x.id] || { attempts: 1, history: [], bestPct: 90, correctCount: 0, gearEarned: 0, topics: {}, missed: {} }, { completed: true }); s.players[x.id] = s.players[x.id] || { gender: 'girl', name: 'Ava' }; }); localStorage.setItem(k, JSON.stringify(s)); }, KEY);
  await go();
  const all = await p.evaluate(() => GAME_CONTENT.sections.map(s => ({ sid: s.id, ids: (s.activities || []).map(a => a.id) })));
  let solvedN = 0;
  for (const sec of all) for (const id of sec.ids) {
    await p.evaluate((sid, id) => ABRPG.runActivity(sid, id, ABRPG.home), sec.sid, id); await sleep(80);
    if (solvedN % 4 === 0) await p.screenshot({ path: SHOTS + 'act-' + id + '.png', fullPage: true });
    await solve(0); solvedN++;
  }
  assert(solvedN === 19, 'all 19 activities completed');
  for (const m of ['m2', 'm3', 'm4', 'm5']) { await click('#btn-market'); await click('.mk-tab[data-mid="' + m + '"]'); await sleep(150); await p.screenshot({ path: SHOTS + 'mk-' + m + '.png', fullPage: true }); }
  assert(!(await p.$eval('.mk-tab[data-mid="m5"]', e => e.classList.contains('locked'))), 'all markets open when all lands mastered');

  /* video player component: every video slot shows timed lower-third captions, a Key Facts card,
     and a "What did you see?" check that pays stars once per question. A real file plays, and a missing
     file falls back to a placeholder fact tour. */
  await p.evaluate(() => { window.GAME_CONTENT.videoTourSeconds = 0.25; });
  const vids = await p.evaluate(() => { const o = []; window.GAME_CONTENT.sections.forEach(s => s.lessons.forEach((l, i) => { if (l.videoKey) o.push({ sid: s.id, i, key: l.videoKey, nq: window.GAME_CONTENT.videos[l.videoKey].check.length }); })); return o; });
  assert(vids.length === 7 && ['s5-jamestown-settlers', 's5-virginia-struggles', 's5-pilgrim-voyage', 's5-new-england', 's1-beringia', 's1-clovis-points', 's1-early-maize'].every(k => vids.some(v => v.key === k)), 'all 7 video slots use the player (3 in s1, 4 in s5)'); const realWant = { 's1-clovis-points': 1, 's5-jamestown-settlers': 1, 's5-pilgrim-voyage': 1 }; assert(true, 'only the 3 verified clips are embedded');
  for (const v of vids) {
    const before = (await st()).stars.balance;
    await p.evaluate((sid, i) => ABRPG.lesson(sid, i), v.sid, v.i); await sleep(1500);
    const m = await p.evaluate(() => { const s = document.querySelector('.vslot'); return { real: s.classList.contains('has-video'), facts: s.querySelectorAll('.video-facts li').length, locked: s.querySelector('.vcheck-btn').disabled }; });
    let capSeen = '';
    if (m.real) {
      capSeen = await p.evaluate(async () => { const vd = document.querySelector('.vslot video'); vd.muted = true; vd.currentTime = vd.duration * 0.55; await new Promise(r => setTimeout(r, 400)); vd.dispatchEvent(new Event('timeupdate')); const t = document.querySelector('.lower3.on .l3-t'); const c = t ? t.textContent : ''; vd.currentTime = 0; await vd.play().catch(() => {}); await new Promise(r => setTimeout(r, 900)); const t2 = document.querySelector('.lower3.on .l3-t'); return t2 ? t2.textContent : c; });
      await p.waitForSelector('.vcheck:not([hidden]) .vc-ch button', { timeout: 30000 });
    } else {
      await click('.vtour'); await sleep(400);
      capSeen = await p.evaluate(() => { const t = document.querySelector('.lower3.on .l3-t'); return t ? t.textContent : ''; });
      await p.waitForSelector('.vcheck:not([hidden]) .vc-ch button', { timeout: 15000 });
    }
    if (v.key === 's1-beringia' || v.key === 's5-pilgrim-voyage') await p.screenshot({ path: SHOTS + 'v-' + v.key + '.png', fullPage: true });
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
  assert(vq === 8, 'video check questions are also in the Section 5 trial pool (' + vq + ')');
  await p.evaluate(() => ABRPG.home());

  /* final */
  await click('#btn-home'); await click('.node[data-sid="final"]'); await click('#b-go');
  for (let i = 0; i < 24; i++) await answer(true);
  await p.screenshot({ path: SHOTS + '11-final.png' });
  s = await st(); assert(s.final.passed && s.stars.bySource.crown === 50, 'final passed, crown bonus 50');
  assert(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await click('#btn-report'); await sleep(600); const rp = await p.evaluate(() => document.body.innerText + (document.querySelector('#rep-text') || {}).textContent); assert(/lesson videos/i.test(rp), 'Parent Report lists lesson videos');
  console.log('ALL PASSED');
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
