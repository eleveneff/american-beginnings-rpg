// world/minigames/index.js — v2.9 "Mini-games along the way": 2 short, hands-on 3D games per level, each at its own
// signposted ring beside a path. world.js has three one-line hooks (ensureBuilt → attach + ringDefs, step → step,
// useRing → action); everything else lives here. A game's arena is built when she starts it and disposed when she leaves.
// Stars go through ABRPG.miniGame (app.js): 10 ⭐ the first win, 2 ⭐ practice replays (3 a day) — never farmable.
// While a game runs: L.pos stays on the ring (so the save / pagehide spot is always walkable), the hero model is moved
// into the arena and put back on exit, and the camera is driven here and snapped back with placeCamera on exit.
import * as THREE from 'three';
import { makeKit, rng } from './lib.js';

// ---- registry: where each game's ring and arena are. arena = [x, z, yaw]: local +z (yaw 0 = world +z) points into the
// play area, so the camera looks along it from the road side. water: arena sits on the water surface.
export const REG = {
  s1: [
    { id: 'atlatl', file: 'atlatl', title: 'Atlatl Dart Throw', icon: '🎯', station: 'herds', ring: [21.9, 17.8], arena: [25.5, 12.3, 2.36] },
    { id: 'stalk', file: 'stalk', title: 'Stalk the Caribou', icon: '🦌', station: 'herds', ring: [25.5, 26], arena: [38, 27, -1.83] },
  ],
  s2: [
    { id: 'salmon', file: 'salmon', title: 'Salmon Dip-Net', icon: '🐟', station: 'nw', ring: [17.2, 30.5], arena: [13.2, 33, -1.0] },
    { id: 'pueblo', file: 'pueblo', title: 'Build a Pueblo Wall', icon: '🧱', station: 'sw', ring: [21.3, -20], arena: [26.8, -16.5, 0.85] },
  ],
  s3: [
    { id: 'quadrant', file: 'quadrant', title: 'Sight the North Star', icon: '⭐', station: 'tower', ring: [-67.5, 49.5], arena: [-65, 46, 2.5], water: true },
    { id: 'tradewinds', file: 'tradewinds', title: 'Ride the Trade Winds', icon: '⛵', station: 'pier', ring: [-31.5, 26.5], arena: [-38, 2, 1.31], water: true },
  ],
  s4: [
    { id: 'canoe', file: 'canoe', title: 'Paddle the St. Lawrence', icon: '🛶', station: 'landing', ring: [-17, 39.5], arena: [-26, 48, -Math.PI / 2], water: true },
    { id: 'adobe', file: 'adobe', title: 'Make Adobe Bricks', icon: '🧱', station: 'santafe', ring: [39.0, -22.6], arena: [35.5, -21.4, 2.3] },
  ],
  s5: [
    { id: 'palisade', file: 'palisade', title: 'Raise the Palisade', icon: '🪵', station: 'jamestown', ring: [-12.5, -20.2], arena: [-9.2, -17.6, 2.2] },
    { id: 'hornworm', file: 'hornworm', title: 'Hornworm Patrol', icon: '🐛', station: 'fields', ring: [7.8, -4.0], arena: [5.6, -0.2, -0.7] },
  ],
  s6: [
    { id: 'bucket', file: 'bucket', title: "Franklin's Bucket Brigade", icon: '🪣', station: 'philadelphia', ring: [-11.0, 19.5], arena: [-10.7, 25.3, 0.4] },
    { id: 'postrider', file: 'postrider', title: 'Ride the Post Road', icon: '✉️', station: 'williamsburg', ring: [18.3, -15.9], arena: [28.5, -15.6, 1.31] },
  ],
};
// levels whose games are switched on (shipped in batches; the other files are present but unused until listed here)
export const LIVE = ['s1', 's2', 's3', 's4', 's5', 's6'];
const PAY = { first: 10, practice: 2, perDay: 3 };   // mirrored from app.js (for the intro card text only)

let A = null, S = null, cssOn = false, lastLvl = null;
const games = {};   // loaded modules, by file
const $ = id => document.getElementById(id);

export function attach(api) {
  A = api;
  if (!cssOn) { cssOn = true; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./mg.css', import.meta.url).href; document.head.appendChild(l); ensureUi(); window.addEventListener('keydown', onKey, true); }
  window.__mg = hook;
}
export const active = () => !!S;

// ring defs for one level (called while the level is being built)
export function ringDefs(sid) {
  if (S) exit(true);
  return (LIVE.includes(sid) && REG[sid] || []).map(g => ({
    id: 'mg-' + sid + '-' + g.id, mg: true, x: g.ring[0], z: g.ring[1], station: g.station, icon: g.icon, scored: false,
    text: null, label: () => 'Mini-game: ' + g.title + (won(sid, g.id) ? ' ✅' : ''),
    act: () => open(sid, g), state: () => won(sid, g.id) ? 'mgwon' : 'mg'
  }));
}
function won(sid, id) { try { const r = window.ABRPG && window.ABRPG.miniGameRec && window.ABRPG.miniGameRec(sid, id); return !!(r && r.won); } catch (e) { return false; } }

// ---- per-frame: signs + ring tint always; the whole game while a session is open ----
const TINT = { mg: '#3ee0b0', mgwon: '#a6f0d8' };
export function step(dt, raw) {
  const L = A.L; if (!L.lvl) return false;
  if (L.lvl !== lastLvl) { lastLvl = L.lvl; if (S && S.lvl !== L.lvl) exit(true); }
  if (L.zone === 'out' && !L.lvl._mgSigns) signs(L);
  for (const r of L.lvl.rings) if (r.def.mg) { L.mods.B.setRingState(r, r.def.state()); if (r._mgTint !== r.state) { r._mgTint = r.state; r.disc.material.color.set(TINT[r.state]); r.beam.material.color.set(TINT[r.state]); } }
  // rings (and their floating icons) would sit in the game camera's view: hide them while a game is open
  const vis = !S; if (L.lvl._mgVis !== vis) { L.lvl._mgVis = vis; for (const r of L.lvl.rings) if (r.group) { if (!vis) { r._mgWas = r.group.visible; r.group.visible = false; } else if (r._mgWas !== undefined) { r.group.visible = r._mgWas; r._mgWas = undefined; } } }
  if (S && S.hidden) for (const o of S.hidden) o.visible = false; // labels re-show themselves per frame
  if (!S) return false;
  if (L.phase !== 'active') return true;
  if (L.lvl.update) L.lvl.update(raw, L.pos);
  const inp = readInput(); S.inp = inp;
  if (S.game && S.phase === 'play') { S.t += dt; try { S.game.update(Math.min(dt, 0.05), inp); } catch (e) { console.error('[mg]', e); fail('Oops, something went wrong. Try again!'); } }
  else if (S.game && S.game.idle) try { S.game.idle(Math.min(dt, 0.05)); } catch (e) { }
  if (S.kit) S.kit.tickPuffs(dt);
  if (L.hero && S.heroOn) L.hero.animate(dt, S.heroSpeed || 0);
  // camera: ease toward the game's target
  if (S.camT) { const k = S.camSnap ? 1 : 1 - Math.exp(-dt * 5); S.camSnap = false; S.camP.lerp(S.camT.p, k); S.camL.lerp(S.camT.l, k); L.cam.position.copy(S.camP); L.cam.lookAt(S.camL); if (L.camPos) L.camPos.copy(S.camP); }
  inp.act = false; return true;
}
export function action() { if (!S) return; if (S.phase === 'play') press(); else if (S.cardPrimary) S.cardPrimary(); }

function readInput() {
  const k = A.keys, j = A.joy; let x = 0, y = 0;
  if (k.has('f')) y += 1; if (k.has('b')) y -= 1; if (k.has('r')) x += 1; if (k.has('l')) x -= 1; x += j.x || 0; y += j.y || 0;
  return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), act: S && S.inp ? S.inp.act : false };
}
function press() { if (!S || S.phase !== 'play') return; S.inp = S.inp || {}; S.inp.act = true; S.presses = (S.presses || 0) + 1; if (S.game && S.game.action) try { S.game.action(); } catch (e) { console.error(e); } const b = $('mg-act'); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 120); }

// ---- signposts beside each mini-game ring ----
function signs(L) {
  L.lvl._mgSigns = true; const defs = L.lvl.rings.filter(r => r.def.mg); if (!defs.length) return;
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  for (const r of defs) {
    const g = REG[L.sid].find(q => 'mg-' + L.sid + '-' + q.id === r.def.id); if (!g) continue;
    const ay = g.arena[2] + Math.PI, sx = r.def.x + Math.cos(ay) * 1.9, sz = r.def.z - Math.sin(ay) * 1.9;
    const root = new THREE.Group(); root.name = 'mg-sign:' + g.id; root.position.set(sx, A.supportY(sx, sz), sz); root.rotation.y = ay;
    const kit = { list: [] };
    const box = (w, h, d, c, x, y, z) => { const b = new THREE.BoxGeometry(w, h, d).toNonIndexed(); b.translate(x, y, z); const n = b.attributes.position.count, col = new Float32Array(n * 3), cc = new THREE.Color(c); for (let i = 0; i < n; i++) { const j = 0.93 + 0.14 * ((i / 6 | 0) % 3) / 2; col.set([cc.r * j, cc.g * j, cc.b * j], i * 3); } b.setAttribute('color', new THREE.BufferAttribute(col, 3)); b.deleteAttribute('uv'); kit.list.push(b); };
    box(0.14, 2.2, 0.14, '#6b4a2a', 0, 1.1, 0); box(1.7, 0.85, 0.08, '#8a6238', 0, 1.85, 0); box(1.84, 0.1, 0.12, '#5a3a1e', 0, 2.31, 0);
    const geo = mergeList(kit.list); const m = new THREE.Mesh(geo, mat); m.castShadow = true; root.add(m);
    const c = document.createElement('canvas'); c.width = 320; c.height = 160; const x = c.getContext('2d');
    x.fillStyle = '#d9b27a'; x.fillRect(0, 0, 320, 160); x.strokeStyle = '#5a3a1e'; x.lineWidth = 8; x.strokeRect(4, 4, 312, 152);
    x.fillStyle = '#2a7a5a'; x.font = 'bold 30px Trebuchet MS, sans-serif'; x.textAlign = 'center'; x.fillText('🎮 MINI-GAME', 160, 46);
    x.fillStyle = '#2a1d0e'; let fs = 34; x.font = 'bold ' + fs + 'px Trebuchet MS, sans-serif'; while (x.measureText(g.title).width > 296 && fs > 18) { fs -= 2; x.font = 'bold ' + fs + 'px Trebuchet MS, sans-serif'; } x.fillText(g.title, 160, 98);
    x.font = '34px serif'; x.fillText(g.icon, 160, 142);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.78), new THREE.MeshLambertMaterial({ map: t })); face.position.set(0, 1.85, 0.045); root.add(face);
    const back = face.clone(); back.position.z = -0.045; back.rotation.y = Math.PI; root.add(back);
    if (L.toon && L.toon.decorate) try { L.toon.decorate(root, { rim: false, width: 0.02 }); } catch (e) { }
    L.lvl.scene.add(root);
  }
}
function mergeList(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0; for (const g of list) { pos.set(g.attributes.position.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); } const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.computeVertexNormals(); return out; }

// ---- UI ----
function ensureUi() {
  if ($('mg-ui')) return;
  const d = document.createElement('div'); d.id = 'mg-ui'; d.hidden = true;
  d.innerHTML = '<div id="mg-top"><span class="mg-t" id="mg-title"></span><span class="mg-s" id="mg-status"></span><button id="mg-hint" type="button" title="Hint (H)">💡 Hint</button><button id="mg-quit" class="q" type="button" title="Quit (Esc)">✖ Quit</button></div>' +
    '<div id="mg-meter" hidden></div><div id="mg-msg" hidden></div><button id="mg-act" type="button" hidden></button><div id="mg-card" hidden></div>';
  document.body.appendChild(d);
  $('mg-act').addEventListener('pointerdown', e => { e.preventDefault(); press(); });
  $('mg-act').addEventListener('click', e => { if (e.detail === 0) press(); });   // keyboard-activated click only (pointer already handled)
  $('mg-hint').onclick = () => hint(); $('mg-quit').onclick = () => quit();
}
function hint() { if (!S) return; S.hints = (S.hints || 0) + 1; msg('💡 ' + (S.mod.hint || 'Take your time!'), 'info', 5); }
let msgT = null;
function msg(t, cls = '', secs = 1.1) { const m = $('mg-msg'); m.hidden = false; m.className = cls; m.innerHTML = t; m.style.animation = 'none'; void m.offsetWidth; m.style.animation = ''; clearTimeout(msgT); msgT = setTimeout(() => { m.hidden = true; }, secs * 1000); }
function meter(v, o) {
  const el = $('mg-meter'); if (v == null) { el.hidden = true; el._k = ''; return; }
  el.hidden = false; o = o || {};
  const k = JSON.stringify([o.zone, o.zone2, o.label, o.fill]); if (el._k !== k) { el._k = k;
    el.innerHTML = (o.zone2 ? '<div class="z2" style="left:' + o.zone2[0] * 100 + '%;width:' + (o.zone2[1] - o.zone2[0]) * 100 + '%"></div>' : '') + (o.zone ? '<div class="z" style="left:' + o.zone[0] * 100 + '%;width:' + (o.zone[1] - o.zone[0]) * 100 + '%"></div>' : '') + (o.fill ? '<div class="f"></div>' : '<div class="n"></div>') + '<div class="lb">' + (o.label || '') + '</div>'; }
  const c = el.firstChild && el.querySelector(o.fill ? '.f' : '.n'); if (o.fill) c.style.width = Math.max(0, Math.min(1, v)) * 100 + '%'; else c.style.left = Math.max(0, Math.min(1, v)) * 100 + '%';
}
function status(h) { const el = $('mg-status'); if (el._h !== h) { el._h = h; el.innerHTML = h; } }
function actLabel(t) { const el = $('mg-act'); const h = '<span class="k">' + (A.L.touch ? 'tap' : 'E') + '</span>' + t; if (el._h !== h) { el._h = h; el.innerHTML = h; } }
function card(html, btns) {
  const c = $('mg-card'); c.hidden = false;
  c.innerHTML = '<div class="in" role="dialog">' + html + '<div class="btns">' + btns.map((b, i) => '<button type="button" class="btn ' + (b.cls || '') + '" data-i="' + i + '">' + b.t + '</button>').join('') + '</div></div>';
  c.querySelectorAll('button').forEach(b => b.onclick = () => btns[+b.dataset.i].f());
  S.cardPrimary = btns[0].f; S.cardBack = (btns.find(b => b.back) || btns[btns.length - 1]).f;
  $('mg-act').hidden = true; $('mg-meter').hidden = true;
}
function hideCard() { $('mg-card').hidden = true; if (S) { S.cardPrimary = null; S.cardBack = null; } }

function onKey(e) {
  if (!S || !A || A.L.phase !== 'active') return;
  const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
  const go = e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space';
  if (!$('mg-card').hidden) {
    if (go || e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (e.repeat) return; if (go && t && t.tagName === 'BUTTON' && t.closest('#mg-card') && e.code !== 'KeyE') { t.click(); return; } (go ? S.cardPrimary : S.cardBack) && (go ? S.cardPrimary() : S.cardBack()); }
    else if (/^(Key[WASDZ]|Arrow)/.test(e.code)) { e.stopImmediatePropagation(); }
    return;
  }
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); quit(); return; }
  if (e.code === 'KeyH') { e.preventDefault(); e.stopImmediatePropagation(); hint(); return; }
  if (go) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) press(); }
}

// ---- session ----
async function open(sid, g) {
  const L = A.L; if (S || L.phase !== 'active') return;
  S = { sid, g, lvl: L.lvl, phase: 'load', fails: 0, easy: false, camP: L.cam.position.clone(), camL: new THREE.Vector3(), camT: null };
  const fwd = new THREE.Vector3(); L.cam.getWorldDirection(fwd); S.camL.copy(L.cam.position).addScaledVector(fwd, 10);
  document.body.classList.add('mg-on'); $('mg-ui').hidden = false; $('mg-top').hidden = true; A.clearHeld();
  try { S.mod = games[g.file] || (games[g.file] = (await import('./' + g.file + '.js')).default); }
  catch (e) { console.error('[mg] load', e); exit(); A.toast('Sorry, that mini-game would not load. Try again later.'); return; }
  if (!S) return;
  build(); intro();
}
function build() {
  const L = A.L, g = S.g, m = S.mod;
  if (S.root) teardown();
  const [ax, az, yaw] = g.arena;
  const ay = g.water ? L.mods.B.WATER_Y : A.supportY(ax, az);
  const root = new THREE.Group(); root.name = 'mg-arena:' + g.id; root.position.set(ax, ay, az); root.rotation.y = yaw; L.lvl.scene.add(root); root.updateMatrixWorld(true);
  S.root = root; S.heroOn = true; S.heroSpeed = 0;
  const ctx = S.ctx = {
    THREE, L, root, sid: S.sid, easy: S.easy, tries: S.fails, rnd: rng((Date.now() & 0xffff) + 7), water: !!g.water,
    gy: (lx, lz) => { if (g.water) return 0; const w = root.localToWorld(new THREE.Vector3(lx, 0, lz)); return A.supportY(w.x, w.z) - ay; },
    hero: L.hero,
    placeHero(lx, ly, lz, lyaw = 0, speed = 0) { const h = L.hero; if (!h) return; const w = root.localToWorld(new THREE.Vector3(lx, ly, lz)); h.root.position.copy(w); h.root.rotation.y = yaw + lyaw; S.heroSpeed = speed; },
    heroVisible(on) { if (L.hero) L.hero.root.visible = on; S.heroOn = on; },
    cam(px, py, pz, lx, ly, lz, snap) { const p = root.localToWorld(new THREE.Vector3(px, py, pz)), l = root.localToWorld(new THREE.Vector3(lx, ly, lz)); S.camT = { p, l }; if (snap) S.camSnap = true; },
    // open-sea / night games: hide the level's own scenery (lights, sky and the hero stay) until the game closes
    isolate(keep = [], drop = []) { if (S.hidden) return; S.hidden = []; for (const o of L.lvl.scene.children) { if (o === root || o.isLight || o.isCamera || (/^(sky|sea|sea-floor)$/.test(o.name) && !drop.includes(o.name)) || keep.includes(o.name) || o.type === 'Object3D' || (L.hero && o === L.hero.root)) continue; o._mgIso = o.visible; o._mgLay = o.layers.mask; o.visible = false; o.layers.mask = 0; S.hidden.push(o); } },
    status, meter, msg, actLabel,
    win: (summary) => win(summary), lose: (why) => fail(why),
  };
  ctx.kit = S.kit = makeKit(ctx);
  S.game = m.build(ctx);
  root.updateMatrixWorld(true);
}
function teardown() {
  if (!S || !S.root) return;
  try { S.game && S.game.dispose && S.game.dispose(); } catch (e) { }
  try { S.kit && S.kit.dispose(); } catch (e) { }
  if (S.hidden) { for (const o of S.hidden) { o.visible = o._mgIso; o.layers.mask = o._mgLay; } S.hidden = null; }
  if (S.root.parent) S.root.parent.remove(S.root); S.root = null; S.game = null; S.kit = null;
}
const payLine = () => { const r = window.ABRPG && window.ABRPG.miniGameRec ? window.ABRPG.miniGameRec(S.sid, S.g.id) : null;
  return r && r.won ? '✅ You won this one before. Replays pay ' + PAY.practice + ' ⭐ (' + r.practiceLeft + ' left today).' : 'Win it once for <b>' + PAY.first + ' ⭐</b>. Replays pay ' + PAY.practice + ' ⭐ (up to ' + PAY.perDay + ' a day).'; };
function intro() {
  const m = S.mod; S.phase = 'intro'; $('mg-title').textContent = m.icon + ' ' + m.title;
  card('<h3>' + m.icon + ' ' + m.title + '</h3><div class="era">' + m.era + '</div><p>' + m.intro + '</p><p class="how">🎮 ' + m.how + '</p><p class="pay">' + payLine() + '</p>',
    [{ t: '▶ Play <kbd>E</kbd>', f: play }, { t: 'Not now <kbd>Esc</kbd>', cls: 'alt', back: true, f: () => exit() }]);
}
function play() {
  hideCard(); if (S.phase !== 'intro') build(); S.phase = 'play'; S.t = 0; S.presses = 0; S.ctx.easy = S.easy;
  $('mg-top').hidden = false; $('mg-act').hidden = false; actLabel(S.mod.act || 'Go'); status(''); A.clearHeld();
  if (S.game.start) S.game.start(); if (S.easy) msg('🐢 Easy mode', 'info', 1.6);
}
function win(summary) {
  if (!S || S.phase !== 'play') return; S.phase = 'won'; meter(null); $('mg-act').hidden = true;
  let res = null; try { res = window.ABRPG.miniGame(S.sid, S.g.id, S.mod.title); } catch (e) { console.error(e); }
  const pay = !res ? '' : res.first ? '<p class="big">+' + res.stars + ' ⭐ for your first win!</p>' : res.stars ? '<p class="big">+' + res.stars + ' ⭐ practice stars</p>' : '<p class="pay">No more practice stars today, but you can always play for fun.</p>';
  S.lastWin = res; msg('🎉 You did it!', 'good', 1.4);
  setTimeout(() => { if (!S || S.phase !== 'won') return;
    card('<h3>🎉 ' + S.mod.title + ': you did it!</h3>' + (summary ? '<p>' + summary + '</p>' : '') + pay + '<p>📜 ' + S.mod.fact + '</p>',
      [{ t: '▶ Keep exploring <kbd>E</kbd>', back: true, f: () => exit() }, { t: '🔁 Play again', cls: 'alt', f: again }]); }, 1100);
}
function fail(why) {
  if (!S || S.phase !== 'play') return; S.phase = 'lost'; S.fails++; meter(null); $('mg-act').hidden = true;
  msg('😅 So close!', 'bad', 1.2);
  setTimeout(() => { if (!S || S.phase !== 'lost') return;
    const btns = [{ t: '🔁 Try again <kbd>E</kbd>', f: again }];
    if (S.fails >= 2 && !S.easy) btns.push({ t: '🐢 Try easy mode', cls: 'alt', f: () => { S.easy = true; again(); } });
    btns.push({ t: 'Back to exploring <kbd>Esc</kbd>', cls: 'alt', back: true, f: () => exit() });
    card('<h3>😅 So close!</h3><p>' + (why || 'Give it another go.') + '</p>' + (S.fails >= 2 ? '<p class="how">💡 ' + S.mod.hint + '</p>' : '') + (S.fails >= 2 && !S.easy ? '<p class="pay">Easy mode still pays the same stars.</p>' : ''), btns); }, 900);
}
function again() { hideCard(); S.phase = 'again'; build(); play(); }
function quit() { if (!S) return; if (S.phase === 'play' || S.phase === 'intro') exit(); }
function exit(silent) {
  if (!S) return; const L = A.L;
  teardown(); hideCard(); meter(null); $('mg-msg').hidden = true; $('mg-ui').hidden = true; $('mg-top').hidden = true; $('mg-act').hidden = true;
  document.body.classList.remove('mg-on');
  if (L.hero) { L.hero.root.visible = true; L.hero.root.position.copy(L.pos); L.hero.root.rotation.y = L.yaw; }
  S = null; A.clearHeld();
  if (!silent) try { A.snapCam(); } catch (e) { }
}

// ---- test hook (tests/minigames-test.js) ----
const hook = {
  get active() { return !!S; }, get phase() { return S ? S.phase : null; }, get id() { return S ? S.g.id : null; },
  get easy() { return S ? S.easy : null; }, get fails() { return S ? S.fails : null; },
  reg: REG, L: () => A && A.L, ctx: () => S && S.ctx, game: () => S && S.game, live: LIVE, open: (sid, id) => { const g = (LIVE.includes(sid) && REG[sid] || []).find(q => q.id === id); return g && open(sid, g); },
  play: () => S && S.phase === 'intro' && play(), press, quit, exit: () => exit(), cheatWin: () => S && S.phase === 'play' && win('(test)'), cheatLose: () => S && S.phase === 'play' && fail('(test)'),
  card: () => { const c = $('mg-card'); return c.hidden ? null : c.innerText; }, primary: () => S && S.cardPrimary && S.cardPrimary(), back: () => S && S.cardBack && S.cardBack(),
};
