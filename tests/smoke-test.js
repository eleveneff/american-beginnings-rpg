const puppeteer = require('puppeteer-core') /* executablePath below: adjust to your Chrome */;
const SHOTS = process.env.SHOTS || '/tmp/smoke/';
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 860 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto((process.env.BASE||'http://localhost:8765/'), { waitUntil: 'domcontentloaded' });
  await new Promise(r=>setTimeout(r,4000)); await p.screenshot({ path: SHOTS + '1-map.png' });
  const click = async sel => { await p.waitForSelector(sel); await p.$eval(sel, e => e.click()); await new Promise(r=>setTimeout(r,60)); };
  await click('.node[data-sid="s1"]');
  await click('#pn button'); await p.screenshot({ path: SHOTS + '2-char.png' });
  await click('#b-go'); await p.screenshot({ path: SHOTS + '3-scene.png' });
  await click('#b-l'); await p.screenshot({ path: SHOTS + '4-lesson.png' });
  while (await p.$('#b-next')) await click('#b-next');
  await click('#b-trial');
  let n = 0, missLeft = 2;
  async function answer(correct) {
    if (await p.$('.choice')) {
      await click(correct ? '.choice[data-ci="0"]' : '.choice:not([data-ci="0"])');
    } else {
      const ans = await p.evaluate((c) => {
        const h2 = document.querySelector('#screen h2').textContent;
        for (const s of GAME_CONTENT.sections) for (const q of s.questions) if (q.q && h2.replace(/\s+/g,' ').trim() === q.q.replace(/_{3,}/g,'').replace(/\s+/g,' ').trim()) return c ? q.accept[0].toUpperCase() + '!' : 'zzzz';
        return 'NOTFOUND';
      }, correct);
      if (ans === 'NOTFOUND') throw new Error('typed q not found');
      await p.type('#ans', ans); await click('#f-ans button');
    }
    const ok = await p.$eval('.feedback', e => e.classList.contains('ok'));
    if (ok !== correct) throw new Error('feedback mismatch, expected ' + correct);
    await click('#b-cont');
    if (await p.$('#modal:not(.hidden) #b-ok')) { n++; if (n===1) await p.screenshot({ path: SHOTS + '5-gear.png' }); await click('#b-ok'); }
  }
  for (let i = 0; i < 27; i++) { await answer(!(missLeft > 0 && i % 5 === 2 && missLeft--)); }
  await p.screenshot({ path: SHOTS + '6-results.png' });
  console.log('results:', await p.$eval('#screen', e => e.innerText.slice(0, 200)));
  await click('#b-rev');
  while (await p.$('#b-ready')) { await click('#b-ready'); await answer(true); await new Promise(r=>setTimeout(r,80)); }
  await p.screenshot({ path: SHOTS + '7-badge.png' });
  console.log('end:', await p.$eval('#screen', e => e.innerText.slice(0, 250)));
  console.log('gear modals', n);
  await click('#b-map'); await p.screenshot({ path: SHOTS + '8-map2.png' });
  console.log('s2 locked?', await p.$eval('.node[data-sid="s2"]', e => e.className));
  await click('#btn-report'); await p.screenshot({ path: SHOTS + '9-report.png', fullPage: false });
  console.log(await p.$eval('#rep-text', e => e.textContent.slice(0, 900)));
  const t = await p.evaluate(() => { const q = {accept:['francisco pizarro','pizarro']}; const A = window.ABRPG; return [A.checkTyped(q,'The Pizarro.'), A.checkTyped(q,'Pizzaro'), A.checkTyped(q,'cortes'), A.checkTyped({accept:['massasoit']},'MASSASOIT '), A.checkTyped({accept:['1607']},'1608')]; });
  console.log('typed checks', t);
  await p.setViewport({ width: 820, height: 1180 }); await click('#b-close'); await click('.node[data-sid="s2"]'); await p.screenshot({ path: SHOTS + '10-tablet.png' });

  // persistence after reload
  await p.reload({ waitUntil: 'domcontentloaded' }); await new Promise(r=>setTimeout(r,800));
  const st = await p.evaluate(() => { const s = ABRPG.state(); return { done: s.sections.s1.completed, gear: s.gear.length, badges: s.badges.length, ver: document.getElementById('game-version').textContent }; });
  console.log('after reload', JSON.stringify(st));
  if (!st.done || st.gear !== 5 || st.badges !== 1) throw new Error('persistence failed');
  // failing path in s2: miss 6 of 18 -> must retake
  await click('.node[data-sid="s2"]'); await click('#pn button'); await click('#b-go'); await click('#b-l');
  while (await p.$('#b-next')) await click('#b-next');
  await click('#b-trial');
  for (let i = 0; i < 18; i++) await answer(i >= 6);
  await click('#b-rev');
  while (await p.$('#b-ready')) { await click('#b-ready'); await answer(true); await new Promise(r=>setTimeout(r,50)); }
  const txt = await p.$eval('#screen', e => e.innerText);
  console.log('s2 fail path:', txt.slice(0, 120).replace(/\n/g,' '));
  if (!(await p.$('#b-again'))) throw new Error('expected retake');
  const s3open = await p.evaluate(() => ABRPG.state().sections.s2.completed);
  if (s3open) throw new Error('s2 should not be complete');
  // final unlock via injected state
  await p.evaluate(() => { const s = ABRPG.state(); GAME_CONTENT.sections.forEach(x => { s.sections[x.id] = Object.assign(s.sections[x.id] || {attempts:1,history:[],bestPct:90,correctCount:0,gearEarned:0,topics:{},missed:{}}, {completed:true}); }); localStorage.setItem('americanBeginningsRPG_v1', JSON.stringify(s)); });
  await p.reload({ waitUntil: 'domcontentloaded' }); await new Promise(r=>setTimeout(r,800));
  await click('.node[data-sid="final"]'); await click('#b-go');
  for (let i = 0; i < 24; i++) await answer(true);
  await p.screenshot({ path: SHOTS + '11-final.png' });
  console.log('final:', (await p.$eval('#screen', e => e.innerText)).slice(0, 100).replace(/\n/g,' '));
  const vid = await p.evaluate(async () => (await fetch('videos/beringia.mp4', {method:'HEAD'})).status);
  console.log('video', vid, 'errors', errs);
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
