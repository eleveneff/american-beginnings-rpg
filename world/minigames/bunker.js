// Mini-game s9 · Hold the Hill ("Whites of Their Eyes"). Time volleys from the Breed's Hill
// redoubt as British regulars advance in three assaults. Powder is scarce; the third assault
// takes the hill when the horns run empty — historically honest, no gore.
// History: June 17, 1775. The battle called Bunker Hill was fought on Breed's Hill. Tradition
// gives "don't fire until you see the whites of their eyes" to Prescott or Putnam. The British
// took the hill on the third attack, at a cost of about 1,000 killed or wounded.
import { THREE, P, BOX, CYL, SPH, CONE, clamp, person } from './lib.js';

export default {
  title: 'Hold the Hill', icon: '⛰️', era: "Breed's Hill · June 17, 1775", act: 'Fire when the needle is green',
  intro: 'It is <b>June 17, 1775</b>, on <b>Breed\'s Hill</b> (the battle is called Bunker Hill). Powder is scarce. Tradition says the order was, "Don\'t fire until you see the <b>whites of their eyes</b>." The British will take the hill on the third assault when the powder runs out — your job is to hold with discipline until then.',
  how: 'Watch the <b>aim needle</b>. Press <kbd>E</kbd> or <kbd>Space</kbd> (or the ✋ button) when it is in the <b>green</b> to fire a volley. Fire too early and you waste powder. Hold the first two assaults; on the third, the horns run empty.',
  tryit: 'Wait until the needle is in the green, then press <kbd>E</kbd> or <kbd>Space</kbd> to fire. The first wave is slower, so you can learn the timing.',
  hint: 'Do not mash the key. Watch the needle, wait for green, then fire once. A wasted shot costs powder you will need later.',
  fact: 'The militia threw back the first two British assaults. On the third, their powder ran out and the regulars took the hill at the bayonet. It was a British victory at a terrible cost: about 1,000 British killed or wounded, and about 400 colonists.',
  build(ctx) {
    const { kit, root, easy } = ctx;
    ctx.heroVisible(false);
    ctx.isolate([], ['sky']);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), kit.mat({ color: '#6a8a46' })); ground.rotation.x = -Math.PI / 2; root.add(ground);
    const slope = kit.mesh([P(BOX(22, 0.4, 16), '#6a7a44', 0, 0.1, 6)], { cast: false }); root.add(slope);
    const earth = kit.mesh([P(BOX(10, 1.2, 1.4), '#6a5a3a', 0, 0.5, -1.2), P(BOX(1.4, 1.2, 6), '#6a5a3a', -5.2, 0.5, 1.4), P(BOX(1.4, 1.2, 6), '#6a5a3a', 5.2, 0.5, 1.4)]);
    earth.position.set(0, 0, 0); root.add(earth);
    const rail = kit.mesh([P(BOX(0.12, 1.0, 0.12), '#7a5a3a', -3, 0.5, 0.6), P(BOX(0.12, 1.0, 0.12), '#7a5a3a', 3, 0.5, 0.6), P(BOX(6.4, 0.1, 0.1), '#8a6a44', 0, 0.85, 0.6)]);
    root.add(rail);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 16, 10), kit.mat({ color: '#9eb8d4', side: THREE.BackSide, fog: false })); sky.position.y = 4; root.add(sky);

    const crew = [];
    for (let i = 0; i < 5; i++) {
      const m = person(kit, { coat: i === 2 ? '#4a3a2a' : '#c8b888', pants: '#3a2a1a', hat: i % 2 ? 'cap' : 'brim', skin: '#e0b890' });
      m.position.set(-2.4 + i * 1.2, 0, -0.1); m.rotation.y = Math.PI; root.add(m); kit.ink(m); crew.push(m);
    }
    const lines = [];
    function makeLine(z, n, spread) {
      const g = new THREE.Group();
      for (let i = 0; i < n; i++) {
        const p = person(kit, { coat: '#b22222', pants: '#e8e2d2', hat: 'tricorn', skin: '#e0b890' });
        p.position.set((i - (n - 1) / 2) * spread, 0, 0); g.add(p);
      }
      kit.ink(g); g.position.set(0, 0, z); root.add(g); return g;
    }
    lines.push(makeLine(16, 7, 0.9));
    lines.push(makeLine(22, 7, 0.9));
    lines.push(makeLine(28, 8, 0.85));
    lines.forEach((g, i) => { g.visible = i === 0; g.userData.home = g.position.z; });

    const flag = kit.mesh([P(CYL(0.06, 0.06, 3.4, 6), '#6b4f36', 0, 1.7, 0), P(BOX(1.4, 0.85, 0.04), '#1f3a7a', 0.75, 3.0, 0)]);
    flag.position.set(6.5, 0, 14); root.add(flag);

    // aim meter: a swinging needle, green band in the middle (wider on wave 1)
    const hud = { wave: 1, need: easy ? 3 : 4, hits: 0, powder: easy ? 10 : 8, wasted: 0, needle: 0, dir: 1, cool: 0, ended: false, graceUsed: false, advancing: true, pending: 0 };
    const st = () => ctx.status('Wave ' + hud.wave + '/3 · Volleys ' + hud.hits + '/' + hud.need + ' · 🪔 Powder ' + hud.powder);
    const band = (wave) => wave === 1 ? 0.34 : wave === 2 ? 0.22 : 0.16;   // half-width of the green, in needle units -1..1
    const speed = (wave) => (wave === 1 ? (easy ? 0.9 : 1.05) : wave === 2 ? (easy ? 1.25 : 1.45) : (easy ? 1.5 : 1.7));
    const zoneOf = (wave) => { const g = band(wave) / 2; return [0.5 - g, 0.5 + g]; };

    ctx.cam(0, 3.2, -7.2, 0, 1.1, 8, true);

    function puffVolley() {
      kit.puff(new THREE.Vector3(0, 1.4, 1.2), '#d8d4c8', 14, { spread: 1.4, up: 1.0 });
      crew.forEach(m => { if (m.userData.armR) m.userData.armR.rotation.x = -1.2; });
      ctx.sfx('hit');
    }
    function smokeFail() {
      kit.puff(new THREE.Vector3((ctx.rnd() - 0.5) * 2, 1.2, 0.8), '#9a9a90', 8, { spread: 0.8, up: 0.8 });
      ctx.sfx('miss');
    }
    function nextWave() {
      hud.wave++; hud.hits = 0; hud.need = hud.wave === 2 ? (easy ? 4 : 5) : 3;
      lines.forEach((g, i) => { g.visible = i === hud.wave - 1; g.position.z = g.userData.home; });
      hud.advancing = true;
      if (hud.wave === 3) {
        ctx.msg('The third assault! Powder is almost gone — hold as long as you can.', 'info', 2.2);
        hud.need = 0;   // third wave is scripted: fire until powder is low, then the hill is lost honorably
      } else ctx.msg('They are coming again! The green will be tighter.', 'info', 1.6);
      st();
    }
    function finishWin() {
      hud.ended = true;
      ctx.win('You held through two assaults. On the third, the powder ran out and the British took the hill — at a terrible cost. That is what happened on Breed\'s Hill.');
    }
    function finishLose(why) { hud.ended = true; ctx.lose(why); }

    return {
      start() {
        st(); ctx.actLabel('Fire when the needle is green');
        ctx.prompt('Wait until the needle is in the green, then press E or Space to fire a volley. The first wave is slower.', 3.4);
        ctx.msg('Hold your fire until you see the whites of their eyes!', 'info', 1.8);
      },
      bot(lose) {
        // a winning bot waits for green and fires; a losing bot fires early
        hud._bot = lose ? 'lose' : 'win';
      },
      action() {
        if (hud.ended || hud.cool > 0 || hud.powder <= 0) return;
        const g = band(hud.wave), inGreen = Math.abs(hud.needle) <= g;
        hud.cool = 0.7;
        if (inGreen) {
          puffVolley(); hud.hits++; hud.powder--; ctx.flash('good');
          ctx.msg('Volley! The line staggers.', 'good', 0.8);
          // NPC reaction: the current British line flinches back a little
          const line = lines[hud.wave - 1]; if (line) line.position.z += 1.1;
        } else {
          smokeFail();
          const early = hud.needle < 0;
          const msg = early ? 'Too soon! The shot is wasted, and powder is scarce.' : 'Too late — they are into the smoke. Wait for green.';
          if (ctx.grace(msg + ' This first miss does not cost a charge.')) { st(); return; }
          hud.powder--; hud.wasted++; ctx.flash('bad'); ctx.msg(msg, 'bad', 0.9);
        }
        st();
        if (hud.wave < 3 && hud.powder <= 0) return finishLose('The powder is gone too soon. The first waves reach the redoubt. Wait for the green, and save your charges.');
        if (hud.wave < 3 && hud.hits >= hud.need) {
          ctx.msg('The assault breaks! They fall back down the hill.', 'good', 1.4);
          hud.pending = 0.9;
        }
      },
      update(dt, inp) {
        if (hud.ended) return;
        hud.cool = Math.max(0, hud.cool - dt);
        crew.forEach(m => { if (m.userData.armR && m.userData.armR.rotation.x < 0) m.userData.armR.rotation.x = Math.min(0, m.userData.armR.rotation.x + dt * 2); });
        const spd = speed(hud.wave);
        hud.needle += hud.dir * spd * dt * 1.15;
        if (hud.needle > 1) { hud.needle = 1; hud.dir = -1; }
        if (hud.needle < -1) { hud.needle = -1; hud.dir = 1; }
        if (hud.pending) { hud.pending -= dt; if (hud.pending <= 0) { hud.pending = 0; if (!hud.ended) nextWave(); } return; }
        const g = band(hud.wave);
        ctx.meter((hud.needle + 1) / 2, { zone: zoneOf(hud.wave), label: Math.abs(hud.needle) <= g ? 'NOW — fire!' : 'Wait for the green…' });
        const line = lines[hud.wave - 1];
        if (line && hud.advancing) {
          const closeZ = hud.wave === 3 ? 3.2 : 5.5;
          line.position.z = Math.max(closeZ, line.position.z - dt * (hud.wave === 1 ? 1.15 : hud.wave === 2 ? 1.4 : 1.7));
          if (hud.wave === 3 && line.position.z <= closeZ + 0.05) {
            hud.advancing = false;
            return finishWin();
          }
          if (hud.wave < 3 && line.position.z <= closeZ + 0.05 && hud.hits < hud.need) {
            return finishLose('The line reaches the redoubt before you can fire enough disciplined volleys. Wait for the green.');
          }
        }
        // bot play
        if (hud._bot && hud.cool <= 0) {
          if (hud._bot === 'win' && Math.abs(hud.needle) <= g * 0.7) this.action();
          else if (hud._bot === 'lose' && hud.needle < -0.55) this.action();
        }
        if (inp && (inp.act || inp.use) && hud.cool <= 0) { /* action hook already handles E */ }
        st();
      },
    };
  }
};
