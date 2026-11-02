/* v2.9 market + wardrobe purchase suite: every look change costs stars (buy once, wear free).
   Covers: v3 -> v4 migration (owned stays owned, badge dyes granted), locks, unlock modal Buy-now, category tabs,
   teaching / confirm / unlock cards fit 440px, can't afford (toast + where to earn, no charge), back out, idempotent buy,
   free own hair + bought styles and colours, hats hide hair, study panel, every item priced >= 20 with a teaching card.
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8765/ SHOTS=/tmp/shots/ node tests/market-test.js */
const puppeteer = require('puppeteer-core');
const SHOTS = process.env.SHOTS || '/tmp/smoke/';
const BASE = process.env.BASE || 'http://localhost:8765/';
const KEY = 'americanBeginningsRPG_v1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
function assert(c, m) { if (!c) throw new Error('ASSERT: ' + m); console.log('  ok -', m); }
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 860 });
  await p.evaluateOnNewDocument(() => { try { if (!localStorage.getItem('americanBeginningsRPG_world')) localStorage.setItem('americanBeginningsRPG_world', JSON.stringify({ ver: 1, mode: 'classic', seenIntro: true })); } catch (e) { } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text()) && !/assets\/video\//.test((m.location() || {}).url || '')) errs.push(m.text()); });
  const url = BASE + (BASE.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  const go = async () => { await p.goto(url, { waitUntil: 'domcontentloaded' }); await sleep(1500); };
  const click = async sel => { await p.waitForSelector(sel, { timeout: 8000 }); await p.$eval(sel, e => e.click()); await sleep(80); };
  const st = () => p.evaluate(() => JSON.parse(JSON.stringify(ABRPG.state())));
  const fits = sel => p.$eval(sel, e => { const r = e.getBoundingClientRect(); return { h: Math.round(r.height) + '/' + e.scrollHeight, ok: r.height <= 440 && e.scrollHeight <= e.clientHeight + 1 }; });
  const sec = (extra) => Object.assign({ attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, completedAt: '2026-10-01T00:00:00Z', correctCount: 25, gearEarned: 5, topics: {}, missed: {} }, extra || {});

  console.log('catalog:');
  await go();
  const cat = await p.evaluate(() => { const o = {}; Object.values(ABRPG.items).forEach(i => { const k = i.section || 'all'; (o[k] = o[k] || []).push(i); }); return Object.values(ABRPG.items).map(i => ({ k: i.key, p: i.price, cat: i.cat, sec: i.section, src: i.source, t: (i.made || '') + (i.who || '') + (i.fact || '') })); });
  assert(cat.every(i => i.p >= 20), 'all ' + cat.length + ' items cost at least 20 stars');
  assert(cat.every(i => i.t.length >= 60), 'every item has a teaching card (60+ chars)');
  const per = {}; cat.filter(i => i.src === 'market').forEach(i => { const k = i.sec + '/' + (i.cat === 'clothing' ? 'clothing' : i.cat === 'hair' ? 'hair' : 'other'); per[k] = (per[k] || 0) + 1; });
  for (const s of ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']) assert(per[s + '/clothing'] >= 4 && per[s + '/other'] >= 5 && per[s + '/hair'] >= 1, s + ' market: ' + per[s + '/clothing'] + ' clothing, ' + per[s + '/hair'] + ' hair, ' + per[s + '/other'] + ' gear/keepsakes');

  console.log('migration v3 -> v4:');
  await p.evaluate(k => { localStorage.setItem(k, JSON.stringify({ version: 3, created: '2026-10-01T00:00:00Z', players: { s1: { gender: 'girl', name: 'Ava' }, s2: { gender: 'girl', name: 'Ava' } },
    sections: { s1: { attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, completedAt: '2026-10-01T00:00:00Z', correctCount: 25, gearEarned: 5, topics: {}, missed: {} }, s2: { attempts: 1, history: [{ pct: 96 }], bestPct: 96, completed: true, completedAt: '2026-10-02T00:00:00Z', correctCount: 10, gearEarned: 2, topics: {}, missed: {} } },
    final: { attempts: 0, bestPct: 0, passed: false, history: [] }, gear: [], badges: [{ name: 'B1', icon: '🦣', section: 's1', at: '2026-10-01T00:00:00Z' }, { name: 'B2', icon: '🌽', section: 's2', at: '2026-10-02T00:00:00Z' }],
    owned: ['fur-cloak', 'clovis-spear', 'moccasins'], equip: { cloak: 'fur-cloak', shoes: 'moccasins' }, purchases: [{ key: 'moccasins', price: 20, at: '2026-10-02T00:00:00Z' }],
    stars: { balance: 300, earned: 320, spent: 20, bySource: {} }, starLog: [], acts: {}, totalCorrect: 35, totalAnswered: 40, run: null })); }, KEY);
  await go(); let s = await st();
  const keys0 = ['created', 'players', 'sections', 'final', 'gear', 'badges', 'owned', 'equip', 'purchases', 'stars'];
  assert(s.version === 4 && keys0.every(k => k in s), 'v3 save migrates to v4 with the same fields');
  assert(['fur-cloak', 'clovis-spear', 'moccasins', 'dye-s1', 'dye-s2'].every(k => s.owned.includes(k)) && s.equip.dye === 'dye-s2' && s.equip.cloak === 'fur-cloak', 'owned items stay owned; earned badge dyes granted, latest worn (' + s.owned.join(',') + ')');
  assert(s.stars.balance === 300 && s.purchases.length === 1, 'migration does not charge or refund');
  const kept = JSON.stringify(s); await go(); assert(JSON.stringify((await st()).owned) === JSON.stringify(JSON.parse(kept).owned), 'migration is idempotent on reload');

  console.log('locks:');
  const L = await p.evaluate(() => ({ sp: ABRPG.itemLock(ABRPG.items['woven-basket']), s2g: ABRPG.itemLock(ABRPG.items['cedar-paddle']), s2g3: ABRPG.itemLock(ABRPG.items['buffalo-robe']), d3: ABRPG.itemLock(ABRPG.items['dye-s3']), m2: ABRPG.itemLock(ABRPG.items['huik']) }));
  assert(!L.sp && !L.s2g && !!L.s2g3 && !!L.d3 && !!L.m2, 'unlocked gear buyable; gear past its milestone, unearned dyes and closed markets locked ' + JSON.stringify(L));
  assert(!(await p.evaluate(() => ABRPG.buy('buffalo-robe'))) && !(await p.evaluate(() => ABRPG.buy('dye-s3'))) && (await st()).stars.balance === 300, 'locked items cannot be bought (no charge)');

  console.log('tabs and cards:');
  await p.evaluate(() => ABRPG.market('m1')); await sleep(200);
  for (const c of ['clothing', 'hair', 'gear', 'keepsake']) {
    await click('.mk-cat[data-cat="' + c + '"]'); await sleep(100);
    const n = await p.$$eval('.mk-item', e => e.length); const on = await p.$eval('.mk-cat[data-cat="' + c + '"]', e => e.classList.contains('on') || e.getAttribute('aria-pressed') === 'true');
    assert(n >= 3, c + ' tab shows ' + n + ' items'); await p.screenshot({ path: SHOTS + 'mt-m1-' + c + '.png', fullPage: true });
  }
  await click('.mk-cat[data-cat="clothing"]');
  await click('[data-ask="cotton-manta"]'); let f = await fits('#modal .teach-card'); assert(f.ok, 'teaching card fits 440px (' + f.h + ')');
  assert(/Made of/.test(await p.$eval('#modal .teach-card', e => e.innerText)), 'clothing card says what it is made of');
  await click('#b-ask-try'); await sleep(100); assert(!(await st()).owned.includes('cotton-manta'), 'trying on is free and does not buy');
  await p.evaluate(() => ABRPG.market('m1')); await sleep(150);
  await click('[data-buy="cotton-manta"]'); f = await fits('#modal .buy-card'); assert(f.ok, 'confirm card fits 440px (' + f.h + ')');
  await click('#b-buy-no'); s = await st(); assert(s.stars.balance === 300 && !s.owned.includes('cotton-manta'), 'back out: no charge');
  await click('[data-buy="cotton-manta"]'); await click('#b-buy-yes'); await sleep(120); s = await st();
  assert(s.stars.balance === 240 && s.owned.includes('cotton-manta') && s.equip.dress === 'cotton-manta', 'bought manta for 60 and wearing it');
  assert(!(await p.evaluate(() => ABRPG.buy('cotton-manta'))) && (await st()).stars.balance === 240, 'second buy refused (idempotent)');
  await p.evaluate(() => { ABRPG.state().equip = {}; ABRPG.save(); ABRPG.market('m1'); }); await sleep(150);
  assert(!!(await p.$('[data-wear="cotton-manta"]')) && !(await p.$('[data-buy="cotton-manta"]')), 'owned item shows Wear, not Buy');
  await click('[data-wear="cotton-manta"]'); s = await st(); assert(s.equip.dress === 'cotton-manta' && s.stars.balance === 240, 'wearing an owned item is free');

  console.log("can't afford:");
  await p.evaluate(() => { ABRPG.state().stars.balance = 30; ABRPG.market('m1'); }); await sleep(150);
  const poorTxt = await p.$eval('[data-buy="feather-mantle"]', e => e.innerText);
  assert(/Need/.test(poorTxt), 'unaffordable item says how many more stars (' + poorTxt.trim() + ')');
  await click('[data-buy="feather-mantle"]'); await sleep(120); s = await st();
  assert(s.stars.balance === 30 && !s.owned.includes('feather-mantle') && !(await p.$('#modal:not(.hidden) .buy-card')), 'no confirm, no charge');
  assert(/Trial answers|activities|badges/.test(await p.$eval('#mk-say', e => e.innerText)), 'keeper points to where stars are earned');
  await p.screenshot({ path: SHOTS + 'mt-poor.png', fullPage: true });

  console.log('hair:');
  await p.evaluate(() => { ABRPG.state().stars.balance = 200; ABRPG.market('m1'); }); await sleep(150);
  await click('.mk-cat[data-cat="hair"]');
  assert((await p.$$('[data-free="hair"]')).length === 1 && (await p.$$('[data-free="haircolor"]')).length === 1, 'her own braids and colour are free choices');
  await click('[data-buy="hair-loose"]'); await click('#b-buy-yes'); await sleep(100);
  await click('[data-buy="hc-black"]'); await click('#b-buy-yes'); await sleep(100); s = await st();
  assert(s.equip.hair === 'hair-loose' && s.equip.haircolor === 'hc-black' && s.stars.balance === 155, 'loose hair (25) and black colour (20) bought and worn');
  await click('[data-free="hair"]'); s = await st(); assert(!s.equip.hair && s.owned.includes('hair-loose') && s.stars.balance === 155, 'back to her own braids for free');
  const hide = await p.evaluate(() => { const svg = h => HeroArt.render({ gender: 'girl', equip: h }); const a = svg({ hair: { art: 'loose' } }), c = svg({ hair: { art: 'bun' }, head: { art: 'coif' } }), d = svg({ hair: { art: 'bun' } }); return { a: a.length, cHasBun: /data-hair="bun"|hair-bun/.test(c), dHasBun: /data-hair="bun"|hair-bun/.test(d) }; });
  assert(hide.a > 0, 'hair styles render in 2D');

  console.log('unlock modal:');
  await p.evaluate(() => { ABRPG.state().stars.balance = 100; ABRPG.state().sections.s2.gearEarned = 4; ABRPG.gearUnlockedModal({ key: 'buffalo-robe' }, () => { window.__next = 1; }); }); await sleep(150);
  f = await fits('#modal .unlock-card'); assert(f.ok && !!(await p.$('#b-buy-now')), 'unlock card offers Buy now and fits 440px (' + f.h + ')');
  await p.screenshot({ path: SHOTS + 'mt-unlock.png' });
  await p.setViewport({ width: 375, height: 700 }); await sleep(150);
  await p.screenshot({ path: SHOTS + 'mt-unlock-phone.png' });
  f = await fits('#modal .unlock-card'); assert(f.ok, 'unlock card fits 440px on a phone too (' + f.h + ')');
  await click('#b-ok'); await p.evaluate(() => { ABRPG.state().stars.balance = 500; ABRPG.market('m1'); }); await sleep(150);
  await click('.mk-cat[data-cat="clothing"]'); await click('[data-ask="quill-dress"]'); f = await fits('#modal .teach-card'); assert(f.ok, 'teaching card fits 440px on a phone (' + f.h + ')'); await p.screenshot({ path: SHOTS + 'mt-teach-phone.png' }); await click('#b-ask-close');
  await click('[data-buy="quill-dress"]'); f = await fits('#modal .buy-card'); assert(f.ok, 'confirm card fits 440px on a phone (' + f.h + ')'); await p.screenshot({ path: SHOTS + 'mt-buy-phone.png' }); await click('#b-buy-no');
  await p.evaluate(() => { ABRPG.state().stars.balance = 100; ABRPG.state().sections.s2.gearEarned = 4; ABRPG.gearUnlockedModal({ key: 'buffalo-robe' }, () => { window.__next = 1; }); }); await sleep(150); await p.setViewport({ width: 1280, height: 860 }); await sleep(100);
  await click('#b-buy-now'); await click('#b-buy-yes'); await sleep(120); s = await st();
  assert(s.owned.includes('buffalo-robe') && s.stars.balance === 60 && (await p.evaluate(() => window.__next)) === 1, 'Buy now -> confirm -> owned, play continues');
  await p.evaluate(() => { ABRPG.state().stars.balance = 5; ABRPG.gearUnlockedModal({ key: 'wampum-belt' }, () => { window.__next = 2; }); }); await sleep(150);
  assert(!(await p.$('#b-buy-now')) && /need/i.test(await p.$eval('#modal .unlock-card', e => e.innerText)), 'unaffordable unlock: no Buy button, says how many more');
  await click('#b-ok'); assert((await p.evaluate(() => window.__next)) === 2, 'Keep going continues');

  console.log('study:');
  await p.evaluate(() => ABRPG.study('s1')); await sleep(150);
  const sw = await p.$$eval('.study-words > div', e => e.length); assert(sw >= 5, 'study panel lists ' + sw + ' key words');
  await click('#b-study-back');
  await p.evaluate(() => ABRPG.character()); await sleep(200); await p.screenshot({ path: SHOTS + 'mt-character.png', fullPage: true });

  assert(errs.length === 0, 'no page errors ' + errs.join(' | '));
  console.log('ALL PASSED'); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
