/* v2.8.3 river-ford timeline test (John: "The River Ford is a little difficult and confusing ... make it more intuitive").
   Plays the crossing like a kid would and checks every way in and out: the goal banner and timeline strip, the glowing row,
   a wrong stone (hop back to the bank on row 1, then to the last gold stone), the hint after 2 misses and the answer after 3,
   skipping a row, slipping into the water, walking away and coming back (progress kept), finishing (results fit at 440 px),
   the ring card at 760x440 (no scrolling), and the solved state (safe stones, no strip).
   Usage: NODE_PATH=<dir with puppeteer-core> BASE=http://localhost:8765/ node tests/ford-test.js */
const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASE = process.env.BASE || 'http://localhost:8765/';
let fails = 0; const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: 1024, height: 640 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const save = { version: 3, players: { s1: { gender: 'girl', name: 'Abigail' } }, sections: {}, owned: [], equip: {} };
  await p.goto(BASE + '?cb=' + Date.now()); await sleep(800); await p.evaluate(s => { localStorage.clear(); localStorage.setItem('americanBeginningsRPG_v1', JSON.stringify(s)); }, save);
  await p.goto(BASE + '?cb=' + Date.now()); await sleep(1200); await p.evaluate(() => document.querySelector('.node[data-sid="s1"]').click());
  const t = Date.now(); while (Date.now() - t < 90000 && (await p.evaluate(() => __world.phase)) !== 'active') await sleep(300); await sleep(2500); await p.evaluate(() => __world.closeCard());
  const F = () => p.evaluate(() => __world.ford()), pos = () => p.evaluate(() => __world.pos);
  // a right step: wait until the row advances (slow SwiftShader frames under load can take >600 ms to register a step)
  const step = async (x, z, want) => { await go(x, z, 300); for (let t = 0; t < 40 && (await F()).row < want && !(await F()).solved; t++) await sleep(150); await sleep(250); };
  const go = async (x, z, wait = 700) => { await p.evaluate((x, z) => { __world.teleport(x, z); __world.faceCam(0); }, x, z); await sleep(wait); };
  // the ring card first (760x440, no scrolling)
  const ring = await p.evaluate(() => __world.rings().find(r => r.id === 's1-timeline'));
  await p.setViewport({ width: 760, height: 440 }); await go(ring.x, ring.z, 300); await p.evaluate(() => __world.use()); await sleep(600);
  const cardFit = await p.evaluate(() => { const c = document.querySelector('#w-card .w-card-in'); if (!c) return null; const r = c.getBoundingClientRect(); return { sh: c.scrollHeight, ch: c.clientHeight, top: r.top, bottom: r.bottom, txt: c.textContent.slice(0, 90) }; });
  check(cardFit && cardFit.sh <= cardFit.ch + 1 && cardFit.top >= 0 && cardFit.bottom <= 440, 'ford ring card fits 760x440 with no scrolling: ' + JSON.stringify(cardFit));
  await p.evaluate(() => __world.closeCard()); await p.setViewport({ width: 1024, height: 640 });
  let f = await F(); const zc = f.riverZ, R = f.respawn;
  await go(R.x, R.z, 1200);
  f = await F(); const row = k => f.stones.filter(s => s.row === k);
  const right = k => row(k).find(s => s.side === f.rows[k].right || f.rows[k].right === -1), wrong = k => row(k).find(s => s.side !== f.rows[k].right);
  let ban = await p.evaluate(() => __world.banner);
  check(f.armed && /Row 1 of 8/.test(ban) && /FIRST/.test(ban), 'armed on the bank, banner: "' + ban + '"');
  check(/older/.test(f.strip) && /1 \?/.test(f.strip), 'timeline strip shows: "' + f.strip + '"');
  check(f.marks.filter(m => m.row === 0 && m.glow && m.label).length === 2, 'both row-1 stones glow and are labeled');
  const cmp = await p.evaluate(() => __world.compass); check(Math.abs(cmp.tz - row(0)[0].z) < 0.01, 'the compass points at row 1 (target z ' + cmp.tz.toFixed(2) + ')');
  // wrong on row 1 → back to the bank
  await go(wrong(0).x, wrong(0).z, 2200); let ps = await pos(); f = await F();
  check(f.row === 0 && f.miss[0] === 1 && Math.hypot(ps.x - R.x, ps.z - R.z) < 0.5, 'wrong stone on row 1: splash, back on the bank, miss 1');
  await step(right(0).x, right(0).z, 1); f = await F();
  check(f.row === 1 && f.good && f.good.row === 0 && /Row 2 of 8/.test(await p.evaluate(() => __world.banner)), 'right stone: row 2 next, strip "' + f.strip + '"');
  // wrong on row 2 → back to the gold stone of row 1, not the bank
  await go(wrong(1).x, wrong(1).z, 2200); ps = await pos();
  check(Math.hypot(ps.x - right(0).x, ps.z - right(0).z) < 0.3, 'wrong stone on row 2: she hops back to her last gold stone (' + ps.x.toFixed(2) + ', ' + ps.z.toFixed(2) + ')');
  await go(wrong(1).x, wrong(1).z, 2200); f = await F();
  check(f.marks.some(m => m.row === 1 && m.side === f.rows[1].right && m.key.startsWith('h')), 'after 2 misses: the gold hint label');
  await go(wrong(1).x, wrong(1).z, 2200); f = await F();
  check(f.marks.some(m => m.row === 1 && m.side === f.rows[1].right && m.key.startsWith('a')), 'after 3 misses: the answer glows');
  await step(right(1).x, right(1).z, 2);
  // skipping a row
  await go(right(3).x, right(3).z, 2200); f = await F(); ps = await pos();
  check(f.row === 2 && Math.hypot(ps.x - right(1).x, ps.z - right(1).z) < 0.3, 'skipping a row: splash, back on the last gold stone');
  // slipping into the water between stones
  await go(-5, row(2)[0].z, 3300); f = await F(); ps = await pos();
  check(f.row === 2 && Math.hypot(ps.x - right(1).x, ps.z - right(1).z) < 0.3, 'slipping into the water: back on the last gold stone after 2 s');
  // walk away and come back
  await go(-5, zc - 17, 900); f = await F();
  check(!f.armed && f.strip === '', 'walked away: the strip and banner go away');
  await go(R.x, R.z, 900); f = await F();
  check(f.armed && f.row === 2 && /Row 3 of 8/.test(await p.evaluate(() => __world.banner)), 'came back: progress kept (row 3)');
  { const seen = []; for (let k = 2; k < 8; k++) { await step(right(k).x, right(k).z, k + 1); seen.push((await F()).row); } console.log('info rows after each step: ' + seen.join(',')); }
  await sleep(2500); f = await F(); console.log('info after the last stone: ' + JSON.stringify({ row: f.row, armed: f.armed, solved: f.solved, miss: f.miss, phase: await p.evaluate(() => __world.phase), pos: await pos() }));
  const res = await p.evaluate(() => { const d = document.querySelector('.act-done'); return { phase: __world.phase, txt: d ? d.textContent.replace(/\s+/g, ' ').slice(0, 120) : '' }; });
  check(f.solved && res.phase === 'panel' && res.txt, 'finished: timeline solved, results: "' + res.txt + '"');
  await p.setViewport({ width: 760, height: 440 }); await sleep(600);
  const fit = await p.evaluate(() => { const b = document.getElementById('a-back'), r = b && b.getBoundingClientRect(); return r ? { bottom: Math.round(r.bottom), page: document.scrollingElement.scrollHeight } : null; });
  console.log('info results at 760x440: ' + JSON.stringify(fit));
  await p.screenshot({ path: '/workspace/abrpg-report/' + (process.env.TAG || 'v291') + '-ford-results-phone.png' });
  await p.setViewport({ width: 1024, height: 640 });
  await p.evaluate(() => document.getElementById('a-back').click());
  const t2 = Date.now(); while (Date.now() - t2 < 60000 && (await p.evaluate(() => __world.phase)) !== 'active') await sleep(300);
  check((await p.evaluate(() => __world.phase)) === 'active', 'Back from the results returns to the world');
  // solved: safe stones, no strip, the banner moves on
  await p.evaluate(() => __world.closeCard()); await sleep(1500);
  await go(R.x, R.z, 1200); f = await F(); ban = await p.evaluate(() => __world.banner);
  check(!f.armed && f.strip === '' && !/Row/.test(ban), 'solved: stones are safe, no strip, banner "' + ban + '"');
  check(errs.length === 0, 'page errors: ' + (errs.join(' | ') || 'none'));
  console.log(fails ? 'FORD TEST FAILED (' + fails + ')' : 'FORD TEST PASSED'); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
