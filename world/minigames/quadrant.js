// Mini-game s3 · Sight the North Star. Night on the deck of the Santa María. Find Polaris by following the Big Dipper's two
// pointer stars, then hold the quadrant's sight on it while the ship rolls, for 2 steady readings.
// History: Columbus carried a quadrant in 1492. Polaris' height above the horizon is roughly your latitude, but readings
// on a rolling deck were hard; he mostly navigated by dead reckoning (compass heading, speed and time).
import { THREE, P, BOX, CYL, SPH, CONE, clamp, lerp } from './lib.js';

const D2R = Math.PI / 180;
// [az, el] in degrees as seen from the deck facing north (az > 0 = to the left on screen)
const POL = [0, 28];
const NAMED = {
  Dubhe: [16.3, 20.4], Merak: [20.4, 18.5], Phecda: [18.3, 14.0], Megrez: [14.0, 15.4], Alioth: [10.6, 13.6], Mizar: [7.6, 12.6], Alkaid: [4.4, 10.2],
  Kochab: [-9.4, 22.6], Caph: [-18, 35], Schedar: [-21.5, 32], Navi: [-24, 35.5], Ruchbah: [-27, 33], Segin: [-30, 36.5],
};
const LITTLE = [[-2.4, 26.3], [-4.6, 24.8], [-6.2, 21.2], [-9.4, 22.6], [-8.6, 19.8]];

export default {
  title: 'Sight the North Star', icon: '⭐', era: 'Columbus\'s first voyage · 1492', act: 'Sight Polaris',
  intro: 'Out on the dark ocean there are no landmarks. Sailors in <b>1492</b> could look for <b>Polaris</b>, the North Star. How high it sits above the horizon tells you roughly how far north you are (your <b>latitude</b>). Columbus carried a <b>quadrant</b> to measure it.',
  how: 'Move the quadrant sight with <kbd>W</kbd> <kbd>A</kbd> <kbd>Z</kbd> <kbd>S</kbd> (or arrows). Follow the Big Dipper\'s two <b>pointer stars</b> to Polaris and press <kbd>E</kbd>. Then keep Polaris inside the ring while the ship rolls, for <b>2 readings</b>.',
  tryit: 'Move with <kbd>W</kbd> <kbd>A</kbd> <kbd>Z</kbd> <kbd>S</kbd>. Follow the two stars at the end of the Dipper\'s cup up to Polaris, then press <kbd>E</kbd>.',
  hint: 'Find the Big Dipper (the bright cup with a handle, lower left). The two stars on the outer edge of the cup point straight up to Polaris. While holding a reading, move gently against the roll of the ship.',
  fact: 'Columbus brought a quadrant on his 1492 voyage, but it was very hard to use on a rolling deck, and some of his readings were far off. Mostly he found his way by <b>dead reckoning</b>: keeping track of his compass direction, his speed and how much time had passed.',
  build(ctx) {
    const { kit, root, easy, L } = ctx, TIME = (easy ? 120 : 90) + (ctx.tries === 0 ? 25 : 0), FINDR = easy ? 3.0 : 2.2, HOLDR = easy ? 3.6 : 2.6, NEED = easy ? 2.0 : 2.5, ROLL = easy ? 0.6 : 1.0;
    ctx.isolate([], ['sky', 'sea', 'sea-floor']); ctx.heroVisible(true);
    const sc = L.lvl.scene, oldFog = sc.fog, lights = []; sc.fog = null;
    sc.traverse(o => { if (o.isLight && !root.getObjectById(o.id)) { lights.push([o, o.intensity]); o.intensity *= 0.3; } });
    const moon = new THREE.HemisphereLight('#8aa0ff', '#1a2040', 0.9); root.add(moon);
    const CAM = new THREE.Vector3(0, 2.75, -1.2), LOOK_EL = 19, R = 60;
    // ---- the sky: a group centred on the camera that rolls and pitches with the sea
    const skyG = new THREE.Group(); skyG.position.copy(CAM); root.add(skyG);
    const grad = kit.canvasTex(4, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#02040e'); gr.addColorStop(0.42, '#0a1430'); gr.addColorStop(0.5, '#1c2a52'); gr.addColorStop(0.52, '#050a18'); gr.addColorStop(1, '#02040a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(150, 24, 16), kit.basic({ map: grad, side: THREE.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -9; skyG.add(dome);
    const sea = new THREE.Mesh(new THREE.CircleGeometry(140, 40), kit.mat({ color: '#0b1630', emissive: '#050b1a' })); sea.rotation.x = -Math.PI / 2; sea.position.y = -CAM.y + 0.02; skyG.add(sea);
    const dir = (az, el, r = R) => new THREE.Vector3(Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R)).multiplyScalar(r);
    const pts = (list, size, color) => { const pos = [], col = []; const c = new THREE.Color();
      for (const [az, el, b = 1] of list) { const v = dir(az, el); pos.push(v.x, v.y, v.z); c.set(color).multiplyScalar(b); col.push(c.r, c.g, c.b); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      const p = new THREE.Points(geo, kit.track(new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, fog: false, transparent: true, depthWrite: false }))); skyG.add(p); return p; };
    const faint = []; for (let i = 0; i < 260; i++) faint.push([(ctx.rnd() - 0.5) * 90, 2 + Math.pow(ctx.rnd(), 0.8) * 60, 0.35 + ctx.rnd() * 0.5]);
    pts(faint, 2.2, '#cfd8ff');
    pts(LITTLE.map(([a, e]) => [a, e, 0.7]), 3.2, '#e8ecff');
    const brightP = pts([...Object.values(NAMED), POL].map(([a, e]) => [a, e, 1]), 5.5, '#fff8e8');
    // a soft glow on each named star so they read as "bright" at a glance
    const glowT = kit.canvasTex(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,250,230,.9)'); g.addColorStop(0.25, 'rgba(255,240,200,.35)'); g.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
    const glowM = kit.track(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, fog: false }));
    for (const [a, e] of [...Object.values(NAMED), POL]) { const s = new THREE.Sprite(glowM); s.position.copy(dir(a, e)); s.scale.setScalar(2.4); skyG.add(s); }
    // the Big Dipper outline (faint) and the pointer guide line that grows after wrong guesses / in easy mode
    const lineM = kit.track(new THREE.LineBasicMaterial({ color: '#7fa0ff', transparent: true, opacity: 0.35, fog: false }));
    const dip = ['Alkaid', 'Mizar', 'Alioth', 'Megrez', 'Dubhe', 'Merak', 'Phecda', 'Megrez'].map(n => dir(...NAMED[n], R - 0.5));
    skyG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(dip), lineM));
    const cas = ['Caph', 'Schedar', 'Navi', 'Ruchbah', 'Segin'].map(n => dir(...NAMED[n], R - 0.5)); skyG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cas), lineM));
    const guideM = kit.track(new THREE.LineDashedMaterial({ color: '#ffe680', dashSize: 1.2, gapSize: 0.8, transparent: true, opacity: 0.8, fog: false }));
    const guidePts = []; for (let k = 0; k <= 20; k++) { const f = k / 20; guidePts.push(dir(lerp(NAMED.Merak[0], POL[0], f), lerp(NAMED.Merak[1], POL[1], f), R - 0.6)); }
    const guide = new THREE.Line(new THREE.BufferGeometry().setFromPoints(guidePts), guideM); guide.computeLineDistances(); skyG.add(guide);
    let guideK = easy ? 0.35 : 0; guide.geometry.setDrawRange(0, 0);
    const lab = (text, az, el, op = 0.85) => { const s = kit.label(text, { size: 3.6, bg: 'rgba(10,20,50,.55)', color: '#dfe6ff', font: 'bold 40px Trebuchet MS, sans-serif' }); s.material.opacity = op; s.material.fog = false; s.position.copy(dir(az, el, R - 2)); skyG.add(s); return s; };
    lab('Big Dipper', 15, 8.5); lab('Cassiopeia', -24, 28.5, 0.6);
    const polLab = lab('⭐ Polaris, the North Star', POL[0], POL[1] + 3.2, 1); polLab.visible = false;
    // ---- the ship (moves with the camera): bow rail, bowsprit, foremast, rigging, a lantern
    const ship = new THREE.Group(); root.add(ship); const g = [];
    g.push(P(BOX(3.6, 0.2, 7), '#4a3220', 0, 1.0, 2.8));
    for (const s of [-1, 1]) { g.push(P(BOX(0.16, 0.7, 7.4), '#5a3c24', s * 1.8, 1.4, 2.8)); g.push(P(BOX(0.24, 0.1, 7.4), '#6b4a2a', s * 1.8, 1.8, 2.8)); for (let z = 0; z < 7; z += 1.1) g.push(P(BOX(0.1, 0.5, 0.1), '#3a2414', s * 1.8, 1.55, z)); }
    g.push(P(BOX(3.2, 1.2, 0.2), '#5a3c24', 0, 1.6, 6.3), P(CYL(0.12, 0.08, 6.5, 6), '#6b4a2a', 0, 3.2, 9.0, -1.15));
    g.push(P(CYL(0.15, 0.13, 11, 8), '#5a3c24', 4.2, 6.4, 3.4), P(CYL(0.06, 0.06, 4.2, 6), '#5a3c24', 4.2, 8.6, 3.4, 0, 0.6, Math.PI / 2));
    root.add(ship); ship.add(kit.mesh(g));
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.4, 4, 2), kit.mat({ color: '#9a8f78', side: THREE.DoubleSide })); sail.position.set(4.6, 6.8, 3.6); sail.rotation.y = 0.6; sail.scale.set(0.8, 1, 1); ship.add(sail);
    const rig = kit.track(new THREE.LineBasicMaterial({ color: '#2a1d10' }));
    for (const [a, b] of [[[4.2, 11.8, 3.4], [1.8, 1.8, 1.2]], [[4.2, 11.8, 3.4], [1.8, 1.8, 5.8]], [[4.2, 9, 3.4], [1.8, 1.8, 3.4]]])
      ship.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), rig));
    const lantern = kit.mesh([P(BOX(0.22, 0.3, 0.22), '#ffd27a', -1.8, 2.05, 3.2), P(CONE(0.17, 0.16, 4), '#2a1d10', -1.8, 2.28, 3.2, 0, Math.PI / 4)]); ship.add(lantern);
    const lglow = new THREE.Sprite(kit.track(new THREE.SpriteMaterial({ map: glowT, color: '#ffb84a', transparent: true, depthWrite: false, fog: false }))); lglow.position.set(-1.8, 2.05, 3.2); lglow.scale.setScalar(1.4); ship.add(lglow);
    const lamp = new THREE.PointLight('#ffb050', 1.2, 7, 1.5); lamp.position.set(-1.6, 2.3, 3.0); ship.add(lamp);
    kit.ink(ship);
    // ---- the sight: a simple aperture ring (not a modern reticle), plus a period quadrant in the lower-right of the view
    const sightT = kit.canvasTex(128, 128, x => { x.strokeStyle = '#3ee0b0'; x.lineWidth = 7; x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2); x.stroke(); x.strokeStyle = 'rgba(62,224,176,.45)'; x.lineWidth = 3; x.beginPath(); x.arc(64, 64, 20, 0, Math.PI * 2); x.stroke(); });
    const sight = new THREE.Sprite(kit.track(new THREE.SpriteMaterial({ map: sightT, transparent: true, depthWrite: false, depthTest: false, fog: false }))); sight.renderOrder = 9; root.add(sight);
    const quad = new THREE.Group();
    const qFrame = [];
    // wooden quarter-circle frame, degree ticks, a sight vane and a hanging plumb bob — the instrument Columbus carried
    for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI / 2, r = 0.85; qFrame.push(P(CYL(0.012, 0.012, 0.06, 5), '#e8d9a8', Math.cos(a) * r, Math.sin(a) * r, 0, 0, 0, a + Math.PI / 2)); }
    for (let i = 0; i < 16; i++) { const a0 = (i / 16) * Math.PI / 2, a1 = ((i + 1) / 16) * Math.PI / 2, am = (a0 + a1) / 2; qFrame.push(P(BOX(0.12, 0.05, 0.05), '#6b4a2a', Math.cos(am) * 0.88, Math.sin(am) * 0.88, 0, 0, 0, am + Math.PI / 2)); }
    qFrame.push(P(BOX(0.9, 0.05, 0.05), '#5a3a1e', 0.45, 0, 0), P(BOX(0.05, 0.9, 0.05), '#5a3a1e', 0, 0.45, 0));
    qFrame.push(P(BOX(0.08, 0.16, 0.04), '#3a2414', 0.9, 0.02, 0.02)); // sight vane
    const qMesh = kit.mesh(qFrame); quad.add(qMesh);
    const bob = kit.mesh([P(CYL(0.01, 0.01, 0.55, 5), '#c8b060', 0, -0.28, 0), P(SPH(0.05, 6, 4), '#c8b060', 0, -0.58, 0)]); quad.add(bob);
    quad.position.set(1.05, 1.55, 0.15); quad.scale.setScalar(0.85); ship.add(quad); kit.ink(quad);
    let saz = -6, sel = 12, phase = 'find', t = 0, wrong = 0, hold = 0, readings = 0, ended = false, pend = null, hinted = false;
    const polW = new THREE.Vector3(), tmp = new THREE.Vector3(), q = new THREE.Quaternion();
    const polAzEl = () => { tmp.copy(dir(POL[0], POL[1])).applyQuaternion(skyG.quaternion); return [Math.atan2(tmp.x, tmp.z) / D2R, Math.asin(tmp.y / tmp.length()) / D2R]; };
    const starAzEl = (a, e) => { tmp.copy(dir(a, e)).applyQuaternion(skyG.quaternion); return [Math.atan2(tmp.x, tmp.z) / D2R, Math.asin(tmp.y / tmp.length()) / D2R]; };
    const off = () => { const [pa, pe] = polAzEl(); return Math.hypot((pa - saz) * Math.cos(pe * D2R), pe - sel); };
    const st = () => ctx.status((phase === 'find' ? '🔭 Find Polaris' : '📐 Reading ' + Math.min(2, readings + 1) + '/2') + ' · ⏱ ' + Math.max(0, Math.ceil(TIME - t)));
    ctx.placeHero(1.15, 1.1, 0.4, 0.15);
    ctx.cam(CAM.x, CAM.y, CAM.z, CAM.x, CAM.y + Math.sin(LOOK_EL * D2R) * 20, CAM.z + Math.cos(LOOK_EL * D2R) * 20, true);
    const placeSight = () => { const rr = phase === 'find' ? FINDR : HOLDR; sight.position.copy(dir(saz, sel, 40)).add(CAM); sight.scale.setScalar(2 * 40 * Math.tan(rr * D2R) * 1.14); };
    let rollT = 0; const roll = (dt) => { rollT += dt; const amp = phase === 'hold' ? ROLL : 0.25; skyG.rotation.set(Math.sin(rollT * 0.9) * 1.6 * amp * D2R, 0, Math.sin(rollT * 0.62 + 1) * 3.2 * amp * D2R); ship.rotation.set(0, 0, 0); };
    placeSight();
    return {
      start() { st(); ctx.actLabel('Sight Polaris'); ctx.prompt('Follow the Big Dipper\'s two pointer stars up to Polaris, then press E to sight it.', 3.4); ctx.msg('Find Polaris, the North Star', 'info', 1.8); },
      bot(lose) { if (pend || ended) return {}; if (lose) return { x: 0, y: 0, press: false };
        const [pa, pe] = polAzEl(); const dA = pa - saz, dE = pe - sel; const x = Math.abs(dA) < 0.35 ? 0 : (dA > 0 ? -1 : 1), y = Math.abs(dE) < 0.35 ? 0 : (dE > 0 ? 1 : -1);
        return { x, y, press: phase === 'find' && off() < FINDR * 0.5 }; },
      action() { if (ended || pend || phase !== 'find') return;
        if (off() <= FINDR) { phase = 'hold'; hold = 0; polLab.visible = true; guideK = Math.max(guideK, 1); ctx.msg('⭐ That\'s Polaris!', 'good', 1.3); ctx.flash('good'); ctx.sfx('hit'); kit.puff(dir(...POL, 40).add(CAM), '#fff3b0', 10, { spread: 0.8, up: 0.4, grav: 0 }); st(); ctx.actLabel('Hold the reading'); ctx.prompt('Hold steady in the green to take two readings of Polaris.', 3.0); return; }
        // a gentle "not that one": name the bright star if it is one
        let near = null, best = 9; for (const [n, [a, e]] of Object.entries(NAMED)) { const [sa, se] = starAzEl(a, e); const d = Math.hypot(sa - saz, se - sel); if (d < best) { best = d; near = n; } }
        wrong++; guideK = Math.max(guideK, Math.min(1, wrong * 0.35));
        ctx.msg(best < 3 ? 'That\'s ' + near + '. Follow the pointer stars up!' : 'No bright star there. Find the Big Dipper first.', 'bad', 1.6); ctx.sfx('miss');
      },
      update(dt, inp) {
        t += dt; roll(dt);
        if (bob) bob.rotation.z = -skyG.rotation.z; // plumb hangs true while the ship rolls
        if (phase === 'find' && !easy && t > 14 && guideK < 0.75) guideK = Math.max(guideK, Math.min(0.75, (t - 14) / 18));
        if (phase === 'find' && t > 14 && !hinted) { hinted = true; ctx.msg('Follow the two stars at the end of the Dipper\'s cup, straight up to Polaris.', 'info', 3.2); }
        guide.geometry.setDrawRange(0, Math.round(guideK * 21));
        if (pend) { pend.t -= dt; if (pend.t <= 0) { const f = pend.f; pend = null; f(); } return; }
        if (ended) return;
        saz = clamp(saz - inp.x * 13 * dt, -40, 40); sel = clamp(sel + inp.y * 13 * dt, 2, 55); placeSight();
        if (phase === 'hold') {
          const inside = off() <= HOLDR; hold = inside ? hold + dt : Math.max(0, hold - dt * 0.6);
          sight.material.color.set(inside ? '#ffffff' : '#ff9a8a');
          ctx.meter(hold / NEED, { fill: true, label: inside ? '📐 Hold steady…' : '⚠️ Polaris left the ring!' });
          if (hold >= NEED) { readings++; hold = 0; ctx.meter(null);
            const r = (POL[1] + (ctx.rnd() - 0.5) * 1.2).toFixed(0);
            if (readings >= 2) { ended = true; ctx.msg('📐 Reading: ' + r + '°', 'good', 1.4); pend = { t: 1.0, f: () => ctx.win('Polaris stood about ' + POL[1] + '° above the horizon, so the ship was roughly ' + POL[1] + '° north of the equator, near the latitude of the Canary Islands where Columbus started across.') }; return; }
            ctx.msg('📐 Reading 1: ' + r + '°. One more!', 'good', 1.4); }
        } else ctx.meter(null);
        st(); ctx.actLabel(phase === 'find' ? 'Sight Polaris' : 'Hold the reading');
        if (t >= TIME) { ended = true; return ctx.lose(phase === 'find' ? 'The clouds rolled in before you found Polaris. Look for the Big Dipper\'s pointer stars.' : 'Clouds covered Polaris before you got 2 steady readings. Move gently against the roll.'); }
      },
      dispose() { sc.fog = oldFog; for (const [o, i] of lights) o.intensity = i; },
    };
  }
};
