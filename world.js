// world.js — v2.2–v2.4 3D layer for American Beginnings RPG.
// (1) Classic: the low-poly N64-style background behind the screens (paused while panels / videos cover it).
// (2) Walk: the walkable levels, loaded on first use: Section 1 Beringia (world/beringia.js) and, new in v2.4,
//     Section 2 Native Nations (world/nations.js). Each level keeps its own scene, rings, graphics and sparks (LV);
//     useLevel() swaps them in, so the Beringia code paths below run exactly as in v2.3.
// three.js is vendored (vendor/, mapped by the import map in index.html). If anything here fails, the CSS
// gradient fallback is shown and the game plays exactly as before (Classic screens).
// The progress save (americanBeginningsRPG_v1) is never written here except through the game's own functions;
// world position / mode / scrolls-read live in americanBeginningsRPG_world, graphics in americanBeginningsRPG_gfx.
import * as THREE from "three";
import { makeClock, subSteps, wrapA, followAngle, makeDeadzoneYaw, makeTravelHeading, camRelative, Z } from "./world/kit.js";

const canvas = document.getElementById("world");
const DEFAULT = { sky: "#f6d28a", sky2: "#7ec8f0", ground: "#8fc46a", ground2: "#3f8a4a", accent: "#e0b23a", snow: false, water: true };
const WKEY = "americanBeginningsRPG_world";
const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const gfxPref = (() => { try { return localStorage.getItem("americanBeginningsRPG_gfx") || "auto"; } catch (e) { return "auto"; } })();
const rawDPR = window.devicePixelRatio || 1;
// v2.3: on a software rasterizer (SwiftShader / llvmpipe: no GPU) 4x MSAA roughly halves the frame rate, which made Auto
// throw away shadows and ink outlines instead. Auto skips MSAA there and keeps them; High keeps MSAA everywhere.
const SOFT_GL = (() => { try { const c = document.createElement("canvas"); const gl = c.getContext("webgl2") || c.getContext("webgl"); if (!gl) return false; const e = gl.getExtension("WEBGL_debug_renderer_info"); const r = String((e && gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || ""); const lc = gl.getExtension("WEBGL_lose_context"); if (lc) lc.loseContext(); return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r); } catch (e) { return false; } })();
const AA = rawDPR < 1.5 && (gfxPref === "high" || (gfxPref !== "low" && !SOFT_GL));
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: AA, powerPreference: "high-performance" }); } catch (e) { canvas.style.display = "none"; throw e; }
const webgl2 = !!(renderer.capabilities && renderer.capabilities.isWebGL2);
const BG_DPR = Math.min(rawDPR, 1.5);
renderer.setPixelRatio(BG_DPR);

/* ============================ (1) Classic background ============================ */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445533, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(30, 50, 20); scene.add(sun);
let group = new THREE.Group(); scene.add(group);
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function flat(color) { return new THREE.MeshLambertMaterial({ color, flatShading: true }); }
function build(p) {
  scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  group = new THREE.Group(); scene.add(group);
  const sky = new THREE.Color(p.sky2), horizon = new THREE.Color(p.sky);
  scene.background = sky; scene.fog = new THREE.Fog(horizon, 60, 170);
  const r = rnd(7 + (p.ground.charCodeAt(2) || 1));
  const g = new THREE.PlaneGeometry(260, 260, 48, 48); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, colors = [], c1 = new THREE.Color(p.ground), c2 = new THREE.Color(p.ground2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), d = Math.hypot(x, z);
    let y = Math.sin(x * 0.06) * Math.cos(z * 0.05) * 3 + (r() - 0.5) * 1.6;
    if (d > 70) y += (d - 70) * 0.35 * (0.6 + r());
    if (p.water && z < -25 && Math.abs(x) < 120) y -= 6;
    pos.setY(i, y);
    const c = c1.clone().lerp(c2, Math.min(1, Math.max(0, (y + 2) / 14)));
    if (p.snow && y > 8) c.set(0xf4f9ff);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3)); g.computeVertexNormals();
  group.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  if (p.water) { const w = new THREE.Mesh(new THREE.PlaneGeometry(260, 120), new THREE.MeshLambertMaterial({ color: 0x2f8fd8, transparent: true, opacity: 0.85 })); w.rotation.x = -Math.PI / 2; w.position.set(0, -2.5, -80); group.add(w); }
  for (let i = 0; i < 70; i++) {
    const x = (r() - 0.5) * 160, z = (r() - 0.5) * 160; if (Math.hypot(x, z) < 12 || (p.water && z < -20)) continue;
    if (p.snow && r() < 0.5) { const ice = new THREE.Mesh(new THREE.IcosahedronGeometry(2 + r() * 4, 0), flat(0xdff3ff)); ice.position.set(x, 1, z); group.add(ice); continue; }
    const h = 3 + r() * 4, t = new THREE.Mesh(new THREE.ConeGeometry(1.2 + r(), h, 6), flat(p.snow ? 0x2f6b4f : 0x2e7d32)); t.position.set(x, h / 2 + 1, z); group.add(t);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 5), flat(0x6b4a2b)); tr.position.set(x, 0.8, z); group.add(tr);
  }
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(14 + r() * 10, 30 + r() * 25, 5), flat(p.snow ? 0xeaf6ff : 0x6d8a5a)); m.position.set((r() - 0.5) * 240, 10, 110 + r() * 30); group.add(m); }
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), new THREE.MeshLambertMaterial({ color: p.accent, emissive: p.accent, emissiveIntensity: 0.4, flatShading: true }));
  gem.position.set(0, 6, 0); gem.name = "gem"; group.add(gem);
  for (let i = 0; i < 12; i++) { const cl = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + r() * 3, 0), flat(0xffffff)); cl.position.set((r() - 0.5) * 200, 35 + r() * 10, (r() - 0.5) * 200); cl.scale.y = 0.5; group.add(cl); }
  bgDirty = true;
}
let bgDirty = true, bgT = 0, bgPal = window.CURRENT_PALETTE || DEFAULT, bgBuiltFor = null;
function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); if (L.cam) { L.cam.aspect = w / h; L.cam.updateProjectionMatrix(); } bgDirty = true; L.dirty = true; }
// ---- quick win: pause the background while it can't be seen ----
function mediaPlaying() { for (const m of document.querySelectorAll("video, audio")) if (!m.paused && !m.ended && m.readyState > 2) return true; return false; }
let covered = false, coverT = 0;
function checkCover() {
  const vw = window.innerWidth, vh = window.innerHeight; let area = 0;
  const modal = document.getElementById("modal"); if (modal && !modal.classList.contains("hidden")) { covered = true; return; }
  for (const id of ["screen", "hero-panel"]) { const el = document.getElementById(id); if (!el || el.offsetParent === null) continue; const r = el.getBoundingClientRect(); const w = Math.max(0, Math.min(vw, r.right) - Math.max(0, r.left)), h = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top)); area += w * h; }
  covered = area > vw * vh * 0.5;
}
const bgStats = { frames: 0, skipped: 0 };
function bgFrame(dt) {
  if (bgBuiltFor !== bgPal) { build(bgPal || DEFAULT); bgBuiltFor = bgPal; }
  if (document.hidden) return;
  coverT -= dt; if (coverT <= 0) { coverT = 0.5; checkCover(); }
  const still = reduce || covered || mediaPlaying();
  if (still && !bgDirty) { bgStats.skipped++; return; }
  if (!still) bgT += dt * 0.096;
  camera.position.set(Math.sin(bgT) * 45, 18, Math.cos(bgT) * 45); camera.lookAt(0, 4, 0);
  const gem = group.getObjectByName("gem"); if (gem) { gem.rotation.y = bgT * 12; gem.position.y = 6 + Math.sin(performance.now() / 600) * 0.6; }
  renderer.render(scene, camera); bgDirty = false; bgStats.frames++;
}

/* ============================ (2) Walk mode: Beringia + Native Nations ============================ */
const W = loadW();
function loadW() {
  // x / z / yaw / zone are Beringia's spot (as in v2.2); other levels keep theirs in at[sid] (v2.4)
  const d = { ver: 1, mode: null, zone: "out", x: null, z: null, yaw: 0, seenIntro: false, season: { tracks: [] }, read: { s1: [], s2: [] }, seen: {}, at: {} };
  let w = null; try { w = JSON.parse(localStorage.getItem(WKEY) || "null"); } catch (e) { w = null; }
  if (!w || typeof w !== "object" || Array.isArray(w)) return d;
  if (w.mode === "walk" || w.mode === "classic") d.mode = w.mode;
  if (w.zone === "cave") d.zone = "cave";
  if (Number.isFinite(w.x) && Number.isFinite(w.z) && Math.abs(w.x) < 5000 && Math.abs(w.z) < 500) { d.x = w.x; d.z = w.z; }
  if (Number.isFinite(w.yaw)) d.yaw = wrapA(w.yaw);
  d.seenIntro = w.seenIntro === true;
  if (w.season && Array.isArray(w.season.tracks)) d.season.tracks = [...new Set(w.season.tracks.filter(t => ["t1", "t2", "t3"].includes(t)))];
  if (w.read && Array.isArray(w.read.s1)) d.read.s1 = [...new Set(w.read.s1.filter(i => Number.isInteger(i) && i >= 0 && i < 8))].sort();
  if (w.read && Array.isArray(w.read.s2)) d.read.s2 = [...new Set(w.read.s2.filter(i => Number.isInteger(i) && i >= 0 && i < 7))].sort();
  if (w.seen && typeof w.seen === "object" && !Array.isArray(w.seen)) for (const k of ["sign", "journey", "gate", "help", "help2", "kiva", "mound", "chunkey"]) if (w.seen[k] === true) d.seen[k] = true;
  const a2 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s2 : null;   // Native Nations bounds (world/nations.js BOUNDS)
  if (a2 && typeof a2 === "object" && Number.isFinite(a2.x) && Number.isFinite(a2.z) && a2.x > -80 && a2.x < 86 && a2.z > -66 && a2.z < 70) d.at.s2 = { x: a2.x, z: a2.z, yaw: Number.isFinite(a2.yaw) ? wrapA(a2.yaw) : 0 };
  return d;
}
function saveW() { try { localStorage.setItem(WKEY, JSON.stringify(W)); } catch (e) { } }
let failed = !webgl2 ? "no-webgl2" : null;
const mode = () => (failed ? "classic" : (W.mode || "walk"));
window.addEventListener("ab:lesson", e => { const d = e.detail || {}, r = W.read[d.sid]; if (r && Number.isInteger(d.i) && !r.includes(d.i)) { r.push(d.i); r.sort(); saveW(); } });

const L = { sid: "s1", phase: "off", built: false, building: null, cam: null, mods: null, dirty: true, zone: "out", pos: new THREE.Vector3(), yaw: 0, vel: 0, wade: 0, hintT: 0, saveT: 0, fps: { n: 0, t: 0, last: 0 }, ctxLost: 0, userMap: false, bypass: false };
const S1 = () => window.ABRPG && window.ABRPG.sectionById("s1");
const WALK = ["s1", "s2"];                                        // sections with a walkable level
const CUR = () => window.ABRPG && window.ABRPG.sectionById(L.sid);
const ST = () => window.ABRPG && window.ABRPG.state();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const toast = m => window.ABRPG && window.ABRPG.toast(m);

// ---- ring definitions (marker order: camp → herds → steppe → hearth → ford → gate → corridor → cave) ----
const SRC_LESSON = { s1: [7, "src1"], s2: [6, "src2"] };      // the primary-source scroll also counts once its questions were played
const scrollRead = (sid, i) => W.read[sid].includes(i) || (i === SRC_LESSON[sid][0] && !!(ST().srcQ && ST().srcQ[SRC_LESSON[sid][1]] && ST().srcQ[SRC_LESSON[sid][1]].plays > 0));
function lessonRing(id, i, x, z, station, sid = "s1") { return { id, x, z, station, icon: "📜", scored: true, label: () => window.ABRPG.sectionById(sid).lessons[i].title, act: () => openPanel(() => window.ABRPG.lesson(sid, i, false)), state: () => scrollRead(sid, i) ? "done" : "new" }; }
function actRing(id, actId, icon, title, x, z, station, sid = "s1") { return { id, x, z, station, icon, scored: true, label: () => title, act: () => openPanel(() => window.ABRPG.runActivity(sid, actId, resume)), state: () => { const a = ST().acts && ST().acts[actId]; return a && a.plays ? (a.best >= 3 ? "star" : "done") : "new"; } }; }
let RINGS = null;
function ringDefs(B) {
  return [
    lessonRing("s1-l0", 0, -3.5, 1, "camp"),
    actRing("s1-geomap", "s1-geomap", "🗺️", "Traveler’s Journal: Map the First Americans", 3.5, 1, "camp"),
    lessonRing("s1-l1", 1, 30, 26, "herds"),
    { id: "tracks", x: 14, z: 58, station: "steppe", icon: "🦌", label: () => "Caribou trail: read the tracks", act: () => card(tracksCard()), state: () => W.season.tracks.length >= 3 ? "done" : "new" },
    lessonRing("s1-l2", 2, -19, 82, "hearth"),
    actRing("s1-clovis", "s1-clovis", "🪨", "Craft a Clovis Point", -11, 82, "hearth"),
    lessonRing("s1-l7", 7, -15, 90.6, "hearth"),
    { ...actRing("s1-timeline", "s1-timeline", "📓", "Traveler’s Journal: Timeline of the First Americans", -1.6, B.riverZ(-5) - 6.9, "ford"), act: () => card(fordCard()) },
    { id: "gate", x: -5, z: 123, station: "gate", icon: "🧥", label: () => "The glacier pass", act: () => card(gateCard()), state: () => hasCloak() ? "done" : "locked" },
    { id: "sign", x: -7, z: 150, station: "corridor", icon: "🧭", label: () => "Two ideas: an ice-free corridor or the coast?", act: () => { W.seen.sign = true; saveW(); card(signCard()); }, state: () => W.seen.sign ? "done" : "new" },
    { id: "journey", x: -5, z: 169.5, station: "corridor", icon: "🌽", label: () => "Journey South: thousands of years later", act: () => { W.seen.journey = true; saveW(); card(journeyCard()); }, state: () => journeyDone() ? "done" : "new" },
    { id: "cave-door", x: -5, z: 187.6, station: "cave", icon: "🔥", label: () => caveOpen() ? "Enter the Trial Cave" : "The Trial Cave (read every scroll first)", act: () => caveOpen() ? teleport("cave") : card(caveLockedCard()), state: () => !caveOpen() ? "locked" : (sec().completed ? "star" : "new") },
    { id: "trial", zone: "cave", x: B.CAVE_X, z: -3.3, station: "cave", icon: "⚔️", label: () => trialLabel(), act: () => openPanel(() => { L.bypass = true; try { window.ABRPG.trial("s1"); } finally { L.bypass = false; } }), state: () => sec().completed ? "star" : "new" },
    { id: "cave-exit", zone: "cave", x: B.CAVE_X, z: 7.3, station: "cave", icon: "☀️", label: () => "Leave the cave", act: () => teleport("out"), state: () => "done" }
  ];
}
const sec = (sid = "s1") => (ST().sections && ST().sections[sid]) || {};
const hasCloak = () => (ST().owned || []).includes("fur-cloak");
const trialActive = (sid = "s1") => { const r = ST().run; return !!(r && r.sid === sid && (r.phase === "trial" || r.phase === "review")); };
const missingScrolls = () => [0, 1, 2, 3, 4, 5, 6, 7].filter(i => !(W.read.s1.includes(i) || (i === 7 && ST().srcQ && ST().srcQ.src1 && ST().srcQ.src1.plays > 0)));
const caveOpen = () => missingScrolls().length === 0 || (sec().attempts || 0) > 0 || !!sec().completed || trialActive();
const journeyDone = () => [3, 4, 5, 6].every(i => W.read.s1.includes(i)) && ["s1-garden", "s1-maya"].every(a => ST().acts && ST().acts[a] && ST().acts[a].plays);
function trialLabel(sid = "s1") { const st = sec(sid); if (trialActive(sid)) return "Resume the Elders’ Trial"; if (st.completed) return "The Elders’ Trial (mastered " + st.bestPct + "%) — try again"; return "Take the Elders’ Trial (" + ((window.GAME_CONTENT && GAME_CONTENT.passPercent) || 95) + "% to master)"; }

// ---- v2.4 Section 2: Native Nations (world/nations.js) ----
// Marker order: council fire → Northwest Coast → Plains → Southwest → Eastern Woodlands → mound town → trade plaza →
// tree-ring meeting ground. Rings open the very same lesson / activity / trial panels as the Classic screens.
function ringDefsS2(B) {
  const A = B.RING_AT, at = (id, o) => ({ ...o, x: A[id][0], z: A[id][1] });
  const info = (id, key, station, icon, title, cardFn) => at(id, { id, station, icon, label: () => title, act: () => { W.seen[key] = true; saveW(); card(cardFn()); }, state: () => W.seen[key] ? "done" : "new" });
  const L2 = (id, i, st) => lessonRing("s2-" + id, i, A[id][0], A[id][1], st, "s2");
  const A2 = (id, icon, title, st) => actRing("s2-" + id, "s2-" + id, icon, title, A[id][0], A[id][1], st, "s2");
  return [
    L2("l0", 0, "fire"), A2("geomap", "🧭", "Find the Homelands (painted hide map)", "fire"), A2("map", "🗺️", "Map the Native Nations", "fire"),
    L2("l1", 1, "nw"),
    L2("l2", 2, "plains"),
    L2("l3", 3, "sw"), info("kiva", "kiva", "sw", "🪜", "A kiva (seen from outside)", kivaCard),
    L2("l4", 4, "ew"), A2("clanmother", "🪶", "Council with a Clan Mother", "ew"), L2("l6", 6, "ew"),
    L2("l5", 5, "mound"), info("moundinfo", "mound", "mound", "⛰️", "The great platform mound", moundCard),
    { ...A2("clues", "🧺", "Culture Clues: carry the bundles to their mats", "plaza"), act: () => card(cluesCard()) },
    at("market", { id: "market", station: "plaza", icon: "🛍️", label: () => "Trade blanket: Cahokia Trade Gathering", act: () => openPanel(() => { L.inMarket = true; window.ABRPG.market("m1"); }), state: () => "done" }),
    info("chunkey", "chunkey", "plaza", "🥏", "The chunkey yard", chunkeyCard),
    A2("timeline", "📓", "Game review: Timeline of the Nations", "council"),
    at("trial", { id: "trial", station: "council", icon: "⚔️", label: () => trialLabel("s2"), act: () => meetOpen() ? openPanel(() => { L.bypass = true; try { window.ABRPG.trial("s2"); } finally { L.bypass = false; } }) : card(meetLockedCard()), state: () => !meetOpen() ? "locked" : (sec("s2").completed ? "star" : "new") })
  ];
}
const missingS2 = () => [0, 1, 2, 3, 4, 5, 6].filter(i => !scrollRead("s2", i));
const meetOpen = () => missingS2().length === 0 || (sec("s2").attempts || 0) > 0 || !!sec("s2").completed || trialActive("s2");
const lessonBtnS = (sid, i) => ({ t: "📜 " + esc(window.ABRPG.sectionById(sid).lessons[i].title), f: () => { closeCard(); openPanel(() => window.ABRPG.lesson(sid, i, false)); } });
function meetLockedCard() { return { title: "🌳 The tree-ring meeting ground", body: "<p>The Elders will hear what you have learned once you have read <b>all 7 scrolls</b> of this land. Still to read:</p>", btns: missingS2().map(i => lessonBtnS("s2", i)) }; }
function kivaCard() { return { title: "🪜 A kiva, seen from outside", body: "<p>A <b>kiva</b> is a round room, built partly underground, where Pueblo people meet and hold ceremonies. People climb down a ladder through the opening in the roof.</p><p>Kivas are sacred places, and Pueblo communities still use them today. Visitors stay outside, so you will not go in. You can see the ladder poking out of the roof.</p>" }; }
function moundCard() { return { title: "⛰️ A Mississippian platform mound", body: "<p>Mississippian people built huge flat-topped mounds out of earth, carried up basket by basket. A temple or a leader’s house stood on top, looking over a big open plaza.</p><p>The greatest mound city was <b>Cahokia</b>, near present-day St. Louis. At its peak (about 1100) it was the <b>largest city north of Mexico</b>. Its biggest mound, Monks Mound, is about 100 feet tall.</p><p>Cahokia was empty long before Europeans came, but when Spanish explorers arrived in the 1500s, many towns in the Southeast still had mounds and plazas.</p>" }; }
function chunkeyCard() { return { title: "🥏 The chunkey yard", body: "<p><b>Chunkey</b> was a favourite game in Mississippian towns. One player rolled a smooth stone disc across the yard. Players threw long poles at the spot where they thought the stone would stop, and the closest pole won.</p><p>Crowds came to watch, and chunkey stones have been found at Cahokia. People across the Southeast kept playing for hundreds of years.</p>" }; }
function helpCardS2() {
  card({ title: "❔ How to explore the Native Nations", body: "<p>You are <b>" + esc(heroName()) + "</b>, visiting the homelands of Native nations of North America, about 1000 to the 1500s. In real life these regions are hundreds or thousands of miles apart. Here they sit around one council fire so you can walk to each, but the directions are true: <b>north is ahead</b> when you start, so <b>west is on your left</b>, just like on a map. The painted compass by the fire shows it.</p><ul><li><b>Walk:</b> WASD or arrow keys, or the joystick (touch). <b>Look:</b> drag on the world.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap ✋.</li><li>Gold rings are new, blue rings are done, pale-gold rings have 3 ⭐, grey rings are locked.</li><li>The banner at the top points to the nearest marker you still need. The Elders’ Trial is at the <b>tree-ring meeting ground</b> once you have read all 7 scrolls.</li><li>The 🗂️ chip at the top switches to the classic screens any time. Your progress is the same in both.</li></ul>" });
  W.seen.help2 = true; saveW();
}

// v2.4 plaza puzzle: the Culture Clues Sort, played by carrying each clue bundle onto its region mat. It runs through
// ABRPG.worldSort, which scores with the card version's own finishActivity (same stars, plays, mistakes; no new save fields).
const SP = { active: false, h: null, queue: [], cur: null, onMat: null, carry: null, hintBin: null };
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
function cluesCard() {
  const a = ST().acts && ST().acts["s2-clues"], played = !!(a && a.plays);
  const body = (played ? "<p>You have sorted these bundles before. Want to practise? Carry them again, or use the card version.</p>" : "<p>Traders brought these bundles from all over the continent. Each one has a <b>clue</b> on its tag.</p>") +
    "<p>Carry each bundle to the mat of the <b>region it comes from</b>: stand on the mat for a moment to set it down. The mats are laid out like a map: the northern regions are on the row nearer the market (<b>north</b>), and <b>west is on your left</b> when you face north.</p>";
  return { title: "🧺 Culture Clues: carry the bundles", body, btns: [{ t: "🧺 " + (played ? "Carry the bundles again" : "Carry the clue bundles"), f: () => { closeCard(); sortStart(); } }, actBtn2("s2-clues", "🗂️ Card version")] };
}
const actBtn2 = (id, label) => ({ t: label, f: () => { closeCard(); openPanel(() => window.ABRPG.runActivity("s2", id, resume)); } });
function sortStart() {
  const h = window.ABRPG.worldSort && window.ABRPG.worldSort("s2", "s2-clues", resume); if (!h) { openPanel(() => window.ABRPG.runActivity("s2", "s2-clues", resume)); return; }
  L.lvl.clearBundles(); for (const m of L.lvl.mats) m.glowOn = false;
  Object.assign(SP, { active: true, h, queue: h.items.slice(), cur: null, onMat: null, hintBin: null });
  const m = L.lvl.mats.find(q => Math.abs(L.pos.x - q.x) < L.mods.B.MAT_HALF && Math.abs(L.pos.z - q.z) < L.mods.B.MAT_HALF); SP.onMat = m ? m.bin : null;   // standing on a mat: not a drop
  nextClue(true);
}
function carryLabel(text) {
  if (SP.carry) { L.lvl.scene.remove(SP.carry.lab); SP.carry.lab.material.map.dispose(); }
  const lab = L.mods.B.labelSprite(text, 4.6, "carry it to its region mat"); lab.renderOrder = 7; lab.material.depthTest = false; L.lvl.scene.add(lab);
  if (!SP.carry) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshLambertMaterial({ color: "#b08a5c", flatShading: true })); b.scale.set(1.2, 0.8, 1); b.userData.noMerge = true; L.lvl.scene.add(b); SP.carry = { lab, b }; }
  else SP.carry.lab = lab;
}
function carryHide() { if (!SP.carry) return; L.lvl.scene.remove(SP.carry.lab); L.lvl.scene.remove(SP.carry.b); SP.carry = null; }
function nextClue(first) {
  for (const m of L.lvl.mats) m.glowOn = false; SP.hintBin = null;
  SP.cur = SP.queue.shift() || null; if (!SP.cur) return;
  carryLabel("📦 " + SP.cur.t);
  toast((first ? "🧺 First bundle: " : "📦 Next bundle: ") + "<b>" + esc(SP.cur.t) + "</b>. Stand on the mat for its region.");
}
function sortStep(dt) {
  SP.dt = dt;
  if (!SP.active || L.sid !== "s2") return;
  if (SP.carry) { SP.carry.lab.position.set(L.pos.x, L.pos.y + 2.75, L.pos.z); SP.carry.b.position.set(L.pos.x + Math.sin(L.yaw) * 0.32, L.pos.y + 0.95, L.pos.z + Math.cos(L.yaw) * 0.32); SP.carry.b.visible = SP.carry.lab.visible = true; }
  if (L.cardOpen || L.frozen || !SP.cur) return;
  const B = L.mods.B, m = L.lvl.mats.find(q => Math.abs(L.pos.x - q.x) < B.MAT_HALF && Math.abs(L.pos.z - q.z) < B.MAT_HALF);
  // she sets a bundle down by standing on a mat for a moment, so just walking across one is not a guess
  if (!m) { SP.onMat = null; SP.dwell = 0; return; }
  if (SP.onMat === m.bin) return;
  SP.dwell = (SP.dwell || 0) + SP.dt; if (SP.dwell < 0.6) return; SP.dwell = 0; SP.onMat = m.bin;
  const cur = SP.cur, r = SP.h.place(cur.key, m.bin); if (!r) return;
  if (r.ok) {
    L.lvl.dropBundle(m.bin); L.sparks && L.sparks.emit(new THREE.Vector3(m.x, L.pos.y + 0.4, m.z), 40, ["#ffd84a", "#fff2b0", "#ffffff"], { speed: 0.5, life: 0.9, up: 0.9 });
    toast("✅ <b>" + esc(cur.t) + "</b> belongs to " + esc(r.bin) + ". " + md(r.fact || ""));
    if (SP.h.left() === 0) { SP.active = false; SP.cur = null; carryHide(); const h = SP.h; setTimeout(() => { if (L.phase === "active") openPanel(() => h.finish()); }, 1400); }
    else setTimeout(() => { if (SP.active) nextClue(false); }, 900);
    SP.cur = null;
  } else {
    if (r.hint) { SP.hintBin = r.hint; for (const q of L.lvl.mats) q.glowOn = q.bin === r.hint; }
    toast("🤔 <b>" + esc(cur.t) + "</b> doesn’t belong on the " + esc(r.bin) + " mat." + (r.hint ? " Hint: try the glowing mat, <b>" + esc(r.hintLabel || r.hint) + "</b>." : " Think about what that region is like and try another mat."));
  }
}
function sortStop() { if (!SP.active) return; SP.active = false; SP.cur = null; carryHide(); for (const m of L.lvl.mats) m.glowOn = false; }

// ---- v2.3 ford timeline: the stepping stones ARE the Section 1 timeline activity ----
// Each row of stones is one step in time, oldest on the south bank. One stone in a row is the right event and the
// other is a later one; stepping on the later one is a timeline mistake (splash, back to the bank). It runs through
// ABRPG.worldTimeline, which uses the very same star credit, first-miss logging, mastery review and results screen as
// the card version, so there are no new save fields. Once the timeline has been played, the stones are safe and show
// the dates; the ring on the bank offers a replay on the stones or the card version.
const FORD_SHORT = { s1tl1: "Monte Verde (southern Chile)", s1tl2: "Clovis spear points", s1q15: "Maize farming begins", s1q19: "Olmec stone heads", s1tl4: "Maya Classic Age", s1q25: "Cahokia at its peak", s1tl3: "Aztecs found Tenochtitlán", s1tl5: "Inca Empire expands" };
const F = { lay: null, armed: false, replay: false, row: 0, miss: [], last: null, started: false, vis: null, done: false };
const fordSolved = () => { const a = ST().acts && ST().acts["s1-timeline"]; return !!(a && a.plays); };
const fordName = e => FORD_SHORT[e.q] || e.label;
function fordNew() {
  const B = L.mods.B, h = window.ABRPG.worldTimeline && window.ABRPG.worldTimeline("s1", "s1-timeline", resume);
  if (!h || h.events.length !== B.FORD_ROWS) return null;
  const ev = h.events, rows = ev.map((e, k) => { const later = ev.slice(k + 1); return { ev: e, right: k < ev.length - 1 ? (Math.random() < 0.5 ? 0 : 1) : -1, wrong: later.length ? later[Math.floor(Math.random() * later.length)] : null }; });
  F.lay = { h, rows }; F.row = 0; F.miss = rows.map(() => 0); F.started = false; F.done = false; return F.lay;
}
function fordCard() {
  const solved = fordSolved();
  const body = solved
    ? "<p>You have built this timeline before. The stones are safe now and show their dates as you cross.</p><p>Want to practise? Replay it on the stones, or use the card version.</p>"
    : "<p>Cross the river on the stepping stones <b>in time order</b>. Each row of stones is the next step in time, starting with the oldest event on this bank.</p><p>Read the two labels and step on the one that happened <b>first</b>. Step on a later one and you fall in the cold river and wash back to this bank. Right stones stay lit.</p>";
  const btns = [{ t: "🪨 " + (solved ? "Replay on the river stones" : "Start on the river stones"), f: () => { closeCard(); F.replay = true; fordNew(); F.armed = true; toast("🪨 Step on the stones from <b>oldest</b> to <b>newest</b>. Start at the row nearest you."); } }, actBtn("s1-timeline", "📓 Card version")];
  return { title: "📓 Timeline on the river stones", body, btns };
}
function fordLabelTex(top, bottom, tone) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 160; const x = c.getContext("2d");
  x.fillStyle = tone === "ok" ? "rgba(32,74,40,0.86)" : tone === "hint" ? "rgba(140,96,10,0.9)" : "rgba(40,30,22,0.82)";
  x.beginPath(); x.roundRect(6, 6, 500, 148, 26); x.fill(); x.strokeStyle = tone === "hint" ? "#ffd75e" : "rgba(255,236,200,0.75)"; x.lineWidth = 5; x.stroke();
  x.fillStyle = "#fff6e4"; x.textAlign = "center"; x.textBaseline = "middle";
  let fs = 46; x.font = "700 " + fs + "px system-ui, sans-serif"; while (x.measureText(top).width > 470 && fs > 26) { fs -= 2; x.font = "700 " + fs + "px system-ui, sans-serif"; }
  x.fillText(top, 256, bottom ? 58 : 80);
  if (bottom) { x.font = "600 34px system-ui, sans-serif"; x.fillStyle = tone === "ok" ? "#bff0b4" : "#ffe3a3"; x.fillText(bottom, 256, 114); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function fordVisuals() {
  if (F.vis) return F.vis; const B = L.mods.B, sc = L.lvl.scene;
  const glowG = new THREE.RingGeometry(0.42, 0.6, 24); glowG.rotateX(-Math.PI / 2);
  const items = B.STONES.map(s => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: true }));
    sp.position.set(s.x, s.top + 1.35, s.z); sp.scale.set(2.05, 0.64, 1); sp.visible = false; sp.renderOrder = 6; sp.userData.noMerge = true; sp.name = "ford-label"; sc.add(sp);
    const gl = new THREE.Mesh(glowG, new THREE.MeshBasicMaterial({ color: "#ffd75e", transparent: true, opacity: 0.7, depthWrite: false }));
    gl.position.set(s.x, s.top + 0.015, s.z); gl.visible = false; gl.userData.noMerge = true; gl.name = "ford-glow"; sc.add(gl);
    return { s, sp, gl, key: "" };
  });
  F.vis = { items }; return F.vis;
}
function fordSet(it, key, top, bottom, tone) { if (it.key === key) return; it.key = key; if (it.sp.material.map) it.sp.material.map.dispose(); it.sp.material.map = fordLabelTex(top, bottom, tone); it.sp.material.needsUpdate = true; }
function fordStoneEvent(s) { const r = F.lay && F.lay.rows[s.row]; if (!r) return null; return (r.right === -1 || s.side === r.right) ? r.ev : r.wrong; }
function fordSplash(s, html) {
  const B = L.mods.B; L.sparks && L.sparks.emit(new THREE.Vector3(s.x, B.WATER_Y + 0.1, s.z), 60, ["#dfefff", "#a9d4f5", "#ffffff"], { speed: 0.55, life: 1.1, up: 0.8 });
  L.pos.y = B.WATER_Y - 0.25; toast(html); L.frozen = true; L.fordFall = true;
  setTimeout(() => { L.fordFall = false; teleport("out", B.FORD_RESPAWN); }, 420);
}
function fordStep() {
  if (L.sid !== "s1") return;
  const B = L.mods.B; if (L.zone !== "out" || !F.vis && Math.hypot(L.pos.x + 5, L.pos.z - B.riverZ(-5)) > 30) return;
  const v = fordVisuals(), zc = B.riverZ(-5), near = Math.abs(L.pos.x + 5) < 12 && Math.abs(L.pos.z - zc) < 14;
  // arm on the south bank (she meets the oldest event first); coming back from the north the stones are just stones
  if (!F.armed && !F.done && near && L.pos.z < zc - 5.4 && Math.abs(L.pos.x + 5) < 8 && (!fordSolved() || F.replay)) { if (!F.lay) fordNew(); if (F.lay) { F.armed = true; if (!F.started && !F.hinted) { F.hinted = true; toast("🪨 The river stones are a <b>timeline</b>: step on the event that happened first, row by row. A later one means a splash!"); } } }
  if (F.armed && L.pos.z < zc - 16) F.armed = false;   // walked away: progress on lit rows stays for this visit
  const play = F.armed && F.lay;
  // labels: only the row she is about to step on; lit rows get a gold ring. Safe mode shows dates just ahead of her
  for (const it of v.items) {
    const s = it.s; let show = false;
    if (near) {
      if (play) {
        const ev = fordStoneEvent(s), r = F.lay.rows[s.row], right = ev === r.ev;
        if (s.row < F.row) { it.gl.visible = right; }   // lit rows: a gold ring on the right stone (the date was in the toast)
        else if (s.row === F.row) { show = true; const hint = right && F.miss[s.row] >= 2; fordSet(it, (hint ? "h" : "q") + ev.key, fordName(ev), hint ? "Hint: this one came first" : "", hint ? "hint" : ""); it.gl.visible = false; }
        else { it.gl.visible = false; }
      } else {
        const r = F.lay && F.lay.rows[s.row], ev = r ? fordStoneEvent(s) : null;
        // safe crossing: no puzzle, the middle line of stones shows the timeline in order
        const evs = window.ABRPG.worldTimeline ? (F.safe || (F.safe = window.ABRPG.worldTimeline("s1", "s1-timeline", resume))) : null;
        const e = evs && evs.events[s.row];
        const dz = (s.z - L.pos.z) * (Math.cos(L.yaw) >= 0 ? 1 : -1); show = !!e && dz > 0.4 && dz < 3.1 && (s.side === 1 || s.side === -1); if (show) fordSet(it, "safe" + e.key, e.when, fordName(e), "ok"); it.gl.visible = false;
      }
    } else it.gl.visible = false;
    it.sp.visible = show;
  }
  if (!play || L.frozen || L.cardOpen) { F.last = null; return; }
  const s = B.onStone(L.pos.x, L.pos.z, -0.15);
  if (!s || s === F.last) { if (!s) F.last = null; return; }
  F.last = s; const h = F.lay.h, r = F.lay.rows[s.row];
  if (s.row < F.row) return;                        // lit rows are safe
  if (!F.started) { F.started = true; h.start(); }
  if (s.row > F.row) { fordSplash(s, "💦 Splash! Step on the stones <b>row by row</b>, oldest first. That row was skipped."); return; }
  const ev = fordStoneEvent(s);
  if (ev === r.ev) {
    const star = h.right(ev.key); F.row++;
    toast("✅ " + star + "<b>" + esc(ev.when) + ":</b> " + esc(ev.label) + ".");
    if (F.row >= F.lay.rows.length) { F.armed = false; F.done = true; F.replay = false; const done = F.lay; setTimeout(() => { if (L.phase === "active") openPanel(() => done.h.finish()); F.lay = null; F.done = false; }, 1100); }
  } else {
    h.miss(ev.key); F.miss[s.row]++;
    fordSplash(s, "💦 Splash! <b>" + esc(fordName(ev)) + "</b> happened <b>later</b> than the other stone in that row." + (F.miss[s.row] >= 2 ? " Look for the <b>gold</b> hint label." : " Back to the bank. Your lit stones stay lit."));
  }
}

// ---- world cards (small overlays inside the world; never block the game) ----
function cardBtns(list) { return '<div class="w-card-btns">' + list.map((b, i) => '<button class="btn ' + (b.cls || "") + '" data-wb="' + i + '">' + b.t + "</button>").join("") + "</div>"; }
let cardActs = [];
function card(c) {
  const el = document.getElementById("w-card"); cardActs = c.btns || [];
  el.innerHTML = '<div class="w-card-in" role="dialog" aria-label="' + esc(c.title) + '"><h3>' + c.title + "</h3>" + c.body + cardBtns(cardActs.concat([{ t: c.close || "Keep exploring ▶", cls: "alt", f: closeCard }])) + "</div>";
  cardActs = cardActs.concat([{ f: closeCard }]);
  el.hidden = false; L.cardOpen = true;
  el.querySelectorAll("[data-wb]").forEach(b => b.onclick = () => { const a = cardActs[+b.dataset.wb]; if (a && a.f) a.f(); });
  const first = el.querySelector("button"); if (first) first.focus({ preventScroll: true });
}
function closeCard() { const el = document.getElementById("w-card"); el.hidden = true; el.innerHTML = ""; L.cardOpen = false; }
const lessonBtn = i => ({ t: "📜 " + esc(S1().lessons[i].title), f: () => { closeCard(); openPanel(() => window.ABRPG.lesson("s1", i, false)); } });
const actBtn = (id, label) => ({ t: label, f: () => { closeCard(); openPanel(() => window.ABRPG.runActivity("s1", id, resume)); } });
function tracksCard() { const n = W.season.tracks.length; return { title: "🦌 The caribou trail", body: "<p>Herds of caribou walk this trail with the seasons, and hunters followed them. Look on the ground near this trail: can you find <b>3 sets of caribou tracks</b>?</p><p><b>Found: " + n + " of 3</b>" + (n >= 3 ? " — great tracking! Following herds is how Ice Age hunters lived." : "") + "</p><p><small>This is an exploring game (no stars). Walk over a set of tracks to find it.</small></p>" }; }
function gateCard() {
  if (hasCloak()) return { title: "🧥 The glacier pass is open", body: "<p>Your <b>Fur Cloak</b> keeps out the icy wind. Walk through the pole gate and follow the path between the ice sheets.</p>" };
  return { title: "🧥 Too cold to cross", body: "<p>The wind in the glacier pass is too strong and cold. You need a <b>Fur Cloak</b> first.</p><p>Earn it with <b>" + ((window.GAME_CONTENT && GAME_CONTENT.correctPerGear) || 5) + " correct answers</b>: try the Traveler’s Journal at camp, Craft a Clovis Point at the hearth, the Evidence Scroll questions, or the Timeline on the river’s stepping stones.</p>", btns: [actBtn("s1-clovis", "🪨 Craft a Clovis Point"), actBtn("s1-timeline", "📓 Journal Timeline"), { t: "🗂️ Switch to Classic screens", cls: "alt", f: () => { closeCard(); setMode("classic"); } }] };
}
function signCard() { return { title: "🧭 Two ideas scientists are still testing", body: "<p><b>Ice-free corridor:</b> as the great ice sheets melted, a gap may have opened between them, and people walked south through it. That is the path you are walking now.</p><p><b>Coastal route:</b> people may have traveled south by boat along the Pacific shore, where fish, shellfish, and seals gave them food.</p><p><b>Monte Verde</b>, an early site in southern Chile dated to about <b>14,500 years ago</b>, is widely accepted by archaeologists as older than Clovis. People that far south so early make many scientists think the coast may have come first.</p><p>Both routes are still <b>theories</b> based on evidence. Scientists keep testing them with new finds, and people may have used both.</p>" }; }
function journeyCard() {
  const b = [3, 4, 5, 6].map(lessonBtn); b.push(actBtn("s1-garden", "🌱 Plant a Three Sisters Garden"), actBtn("s1-maya", "🗿 Talk with a Maya Scribe"));
  return { title: "🌽 Journey South: thousands of years later", body: "<p>Over many thousands of years, the descendants of people like you spread across North and South America. Some learned to <b>farm</b>, and great cities and empires rose. These scrolls tell their stories (you will not walk there, so read them here):</p>", btns: b };
}
function caveLockedCard() { const m = missingScrolls(); return { title: "🔥 The Elders’ Trial Cave", body: "<p>The Elders will test what you have learned once you have read <b>all 8 scrolls</b>. Still to read:</p>", btns: m.map(lessonBtn) }; }

// ---- DOM: HUD, chips, fade ----
function ui() {
  if (document.getElementById("w-hud")) return;
  const tb = document.getElementById("topbar");
  const back = document.createElement("button"); back.id = "w-back"; back.className = "chip w-back"; back.hidden = true; back.textContent = BACK.s1; back.title = "Return to the 3D world"; back.onclick = () => { back.blur(); resumeOrEnter(); };
  const mb = document.createElement("button"); mb.id = "w-mode"; mb.className = "chip"; mb.title = "Switch between walking the 3D world and the classic screens"; mb.onclick = () => { mb.blur(); setMode(mode() === "walk" ? "classic" : "walk", true); };
  tb.insertBefore(back, document.getElementById("btn-inv")); tb.appendChild(mb);
  const h = document.createElement("div"); h.id = "w-hud"; h.hidden = true;
  h.innerHTML = '<div id="w-obj" aria-live="polite"><span id="w-arrow" aria-hidden="true">➤</span><span id="w-obj-t"></span></div><div id="w-era"></div>' +
    '<button id="w-prompt" hidden></button>' +
    '<div id="w-joy" aria-hidden="true"><div id="w-knob"></div></div><button id="w-use" aria-label="Use">✋ Use</button>' +
    '<div id="w-tools"><button id="gfx-mode" class="chip" title="Graphics: Auto / High / Low">✨ Auto</button><button id="w-help" class="chip" title="How to play">❔ Help</button></div>' +
    '<div id="w-keys">WASD / arrow keys to walk · drag to look · <b>E</b> to use</div>';
  document.body.appendChild(h);
  const c = document.createElement("div"); c.id = "w-card"; c.hidden = true; document.body.appendChild(c);
  const f = document.createElement("div"); f.id = "w-fade"; document.body.appendChild(f);
  const ban = document.createElement("div"); ban.id = "w-banner"; ban.hidden = true; document.body.appendChild(ban);
  document.getElementById("w-prompt").onclick = e => { e.currentTarget.blur(); useRing(); };
  document.getElementById("w-use").onclick = e => { e.currentTarget.blur(); useRing(); };
  document.getElementById("w-help").onclick = e => { e.currentTarget.blur(); helpCard(); };
  document.getElementById("gfx-mode").onclick = e => { e.currentTarget.blur(); if (L.gfx) L.gfx.cycle(); };
  syncChips();
}
const BACK = { s1: "🏕️ Back to Beringia", s2: "🔥 Back to the Council Fire" }, WALKNAME = { s1: "🚶 Walk Beringia", s2: "🚶 Walk Native Nations" };
function helpCard() { if (L.sid === "s2") return helpCardS2(); card({ title: "❔ How to explore Beringia", body: "<p>You are <b>" + esc(heroName()) + "</b>, living in Beringia during the last Ice Age. Follow the worn path north, marker by marker.</p><ul><li><b>Walk:</b> WASD or arrow keys, or the joystick (touch).</li><li><b>Look around:</b> drag on the world.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap the ✋ button.</li><li>Gold rings are new, blue rings are done, and pale-gold rings have 3 ⭐. Grey rings are still locked.</li><li>The 🗂️ chip at the top switches back to the classic screens any time. Your progress is the same in both.</li></ul>" }); W.seen.help = true; saveW(); }
function heroName() { const p = ST() && ST().players && ST().players[L.sid]; return (p && p.name) || "Abigail"; }
function syncChips() {
  const mb = document.getElementById("w-mode"), back = document.getElementById("w-back"); if (!mb) return;
  mb.hidden = !!failed; mb.textContent = mode() === "walk" ? "🗂️ Classic screens" : WALKNAME[L.sid];
  if (back.textContent !== BACK[L.sid]) back.textContent = BACK[L.sid];
  back.hidden = !(mode() === "walk" && L.phase !== "active" && (L.phase === "panel" || isLvlScreen()));
  const ban = document.getElementById("w-banner");
  if (ban) { const show = mode() === "walk" && L.phase === "off" && !W.seenIntro && onMapScreen(); ban.hidden = !show;
    if (show && !ban.innerHTML) { ban.innerHTML = '<b>New in v2.4:</b> walk Section 2, the Native Nations, in 3D (plus Beringia, with its glacier walls and river-stone timeline)! <button class="btn small gold" id="w-ban-go">🚶 Walk Beringia</button><button class="btn small alt" id="w-ban-no">🗂️ Keep classic screens</button>'; document.getElementById("w-ban-go").onclick = () => { W.seenIntro = true; saveW(); ban.hidden = true; setMode("walk", true); }; document.getElementById("w-ban-no").onclick = () => { W.seenIntro = true; saveW(); ban.hidden = true; setMode("classic"); }; } }
}
const onMapScreen = () => !!document.querySelector("#screen .map");
const isLvlScreen = () => window.CURRENT_PALETTE && CUR() && window.CURRENT_PALETTE === CUR().palette;

function setMode(m, enterNow) {
  if (failed && m === "walk") { toast("Walk mode isn’t available on this device, so the classic screens are on."); return; }
  W.mode = m; W.seenIntro = true; saveW();
  if (m === "classic") { if (L.phase !== "off") exitLevel(true); toast("🗂️ Classic screens are on. Tap " + WALKNAME[L.sid] + " at the top any time."); }
  else if (enterNow) window.ABRPG.enterSection(L.sid);
  syncChips();
}

// ---- bridge: app.js asks before showing some screens ----
window.ABWorld = {
  claim(kind, sid) {
    try {
      if (failed || mode() !== "walk") return false;
      if (kind === "home") {
        if (L.userMap || L.phase === "off") { L.userMap = false; if (L.phase !== "off") exitLevel(false); return false; }
        resume(); return true;
      }
      if (!WALK.includes(sid)) { if (L.phase !== "off") exitLevel(false); return false; }
      if (kind === "enter") { const p = ST().players && ST().players[sid]; if (!p) return false; enterLevel(sid); return true; }
      if (kind === "intro") { enterLevel(sid); return true; }
      if (kind === "trial" && sid === "s2") {
        if (L.bypass || L.phase === "off") return false;
        if (L.sid !== "s2") { enterLevel("s2"); return true; }
        resume(); if (meetOpen()) setTimeout(() => toast("🌳 The Elders hear the Trial at the <b>tree-ring meeting ground</b>, marker 8. Follow the arrow!"), 50); else setTimeout(() => card(meetLockedCard()), 50);
        return true;
      }
      if (kind === "trial") {
        if (L.bypass || L.zone === "cave" || L.phase === "off") return false;
        if (L.sid !== "s1") { enterLevel("s1"); return true; }
        resume(); if (caveOpen()) { setTimeout(() => toast("🔥 The Elders give the Trial in the <b>Trial Cave</b> at the end of the corridor. Follow the arrow!"), 50); } else setTimeout(() => card(caveLockedCard()), 50);
        return true;
      }
    } catch (e) { console.warn("[world] claim failed, using classic", e); }
    return false;
  },
  get mode() { return mode(); }, get phase() { return L.phase; }
};
// the topbar 🗺️ Map button is the player choosing the map: let it through (capture phase runs first)
document.addEventListener("click", e => { if (e.target && e.target.closest && e.target.closest("#btn-home")) { L.userMap = true; setTimeout(() => { L.userMap = false; }, 0); } }, true);
// v2.3: inside a world panel, the results' own "🗺️ Map" buttons return to Beringia (the top-bar 🗺️ Map is the real map), so say so
const relabelMap = () => { if (failed || mode() !== "walk" || L.phase !== "panel") return;
  document.querySelectorAll("#screen #b-map").forEach(b => { if (b.dataset.wmap) return; b.dataset.wmap = "1"; b.textContent = BACK[L.sid]; b.title = "Back into the walkable world. The 🗺️ Map button at the top opens the world map."; }); };
{ const sc = document.getElementById("screen"); if (sc) new MutationObserver(relabelMap).observe(sc, { childList: true }); }
window.addEventListener("palette", e => {
  const p = e.detail; bgPal = p || DEFAULT;
  // the market paints its own era's sky (and its tabs other eras'): opened from a world ring that is still a world panel
  if (L.phase !== "off" && !(CUR() && p === CUR().palette) && !(L.inMarket && L.phase === "panel")) exitLevel(false);
  setTimeout(syncChips, 0);
});

// ---- enter / exit / panels ----
// v2.4: each level is built once on first visit and kept (LV[sid]); useLevel() swaps its scene, rings, module,
// graphics and sparks into L, so every function below works on whichever level she is in.
const LV = {}, LVBUILD = {};
function useLevel(sid) {
  const v = LV[sid]; if (!v) return;
  if (L.sid !== sid && SP.active) sortStop();
  L.sid = sid; L.mods.B = v.B; L.lvl = v.lvl; L.cave = v.cave; L.sparks = v.sparks; L.gfx = v.gfx; RINGS = v.rings;
  const m = L.mods.G.readGfxMode ? L.mods.G.readGfxMode() : null; if (m && v.gfx.st.mode !== m) v.gfx.st.mode = m;   // one graphics setting for all levels
  syncChips();
}
async function ensureBuilt(sid = L.sid) {
  if (LV[sid]) { useLevel(sid); return true; }
  if (!LVBUILD[sid]) LVBUILD[sid] = (async () => {
    const [B, H, G, T, SPK, MA] = await Promise.all([import(sid === "s2" ? "./world/nations.js" : "./world/beringia.js"), import("./world/hero3d.js"), import("./world/gfx.js"), import("./world/toon.js"), import("./world/sparks.js"), import("./world/merge-ao.js")]);
    if (!L.mods) L.mods = { B, H, G };
    const rings = sid === "s2" ? ringDefsS2(B) : ringDefs(B);
    const aoHolder = new THREE.Group(); aoHolder.name = "contact-ao"; aoHolder.userData.noMerge = true;   // the AO helper adds its mesh here
    const mergeAO = MA.createMergeAO(THREE, aoHolder, { groundH: B.groundH });
    let lvl, cave;
    if (sid === "s2") {
      const S2 = window.ABRPG.sectionById("s2"), clues = S2 && (S2.activities || []).find(a => a.id === "s2-clues"), matLabels = {};
      if (clues) for (const b of clues.bins) matLabels[b.id] = (b.icon ? b.icon + " " : "") + b.label;
      lvl = B.buildNations({ mergeAO, rings, matLabels });
      cave = { scene: lvl.scene, rings: [], colliders: [], radius: 1, update() {} };   // no cave in this level
    } else { lvl = B.buildBeringia({ mergeAO, rings }); cave = B.buildCave({ rings }); }
    lvl.scene.add(aoHolder);
    if (!L.cam) {
      L.cam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.3, 420);
      L.toon = T.createToon ? T.createToon(THREE) : null;
      L.dz = makeDeadzoneYaw({ enter: 0.4, exit: 0.06, maxRate: 1.9 }); L.th = makeTravelHeading(3.5);
    }
    const sparks = SPK.createSparks(THREE, lvl.scene, renderer, 400, L.cam);
    const gfx = G.createGfx({ THREE, renderer, scene: lvl.scene, sun: lvl.sun, hemi: lvl.hemi, getFocus: () => L.pos, isTouch: () => L.touch, toon: L.toon, chars: () => [L.hero && L.hero.root], sparks, onSlow: fps => offerClassic(fps), onApply: () => { L.dirty = true; } });
    LV[sid] = { B, lvl, cave, sparks, gfx, rings };
    useLevel(sid);
    buildHero();
    L.built = true;
  })();
  try { await LVBUILD[sid]; useLevel(sid); return true; } catch (e) { console.error("[world] build failed", e); LVBUILD[sid] = null; fail("build", e); return false; }
}
function gearArt() {
  const S = ST(), it = (window.ABRPG && window.ABRPG.items) || {}, out = [];
  // era gear only: Ice Age gear in Beringia; in later levels the gear of that era and the eras before it (v2.4)
  const ok = L.sid === "s2" ? ["s1", "s2"] : ["s1"];
  for (const sl of Object.keys(S.equip || {})) { const k = S.equip[sl], i = it[k]; if (i && ok.includes(i.section) && i.art) out.push({ art: i.art, color: i.color }); }
  return out;
}
function buildHero() {
  const p = ST().players && (ST().players[L.sid] || ST().players.s1), art = gearArt(), key = JSON.stringify([p && p.gender, art]);
  if (L.hero && L.heroKey === key) { const sc = L.zone === "cave" ? L.cave.scene : L.lvl.scene; if (L.hero.root.parent !== sc) sc.add(L.hero.root); return; }
  const parent = L.hero && L.hero.root.parent; if (L.hero) { if (parent) parent.remove(L.hero.root); L.hero.dispose(); }
  L.hero = L.mods.H.createHero({ gender: p && p.gender === "boy" ? "boy" : "girl", gearArt: art }); L.heroKey = key;
  L.hero.root.position.copy(L.pos); L.hero.root.rotation.y = L.yaw;
  (L.zone === "cave" ? L.cave.scene : L.lvl.scene).add(L.hero.root);
  if (L.gfx) L.gfx.inkPass();
}
function placeStart(zone) {
  const B = L.mods.B;
  if (L.sid === "s2") { L.zone = "out"; L.pos.set(0, B.groundH(0, -8), -8); L.yaw = 0; return; }   // south of the council fire, facing north
  if (zone === "cave") { L.zone = "cave"; L.pos.set(B.CAVE_X, 0, 5); L.yaw = Math.PI; }
  else { L.zone = "out"; L.pos.set(0, B.groundH(0, -4), -4); L.yaw = 0; }
}
async function enterLevel(sid = L.sid) {
  const from = L.sid; if (L.phase !== "off" && from !== sid) saveWorldPos();
  if (!(await ensureBuilt(sid))) { window.ABRPG.enterSection(sid, true); return; }
  const B = L.mods.B;
  window.ABRPG.closeModal && document.getElementById("modal") && !document.getElementById("modal").classList.contains("hidden") && window.ABRPG.closeModal();
  if (sid === "s2" && (L.phase === "off" || from !== sid)) {
    // spawn: a Trial in progress → the meeting ground; else her saved spot (if valid) or the council fire
    const a = W.at.s2, t = B.RING_AT.trial;
    if (trialActive("s2")) { L.zone = "out"; L.pos.set(t[0], 0, t[1] - 4); L.yaw = 0; setTimeout(() => toast("⚔️ Your Trial is waiting. Step into the Elders’ ring at the meeting ground to resume."), 300); }
    else if (a && walkable(a.x, a.z)) { L.zone = "out"; L.pos.set(a.x, 0, a.z); L.yaw = a.yaw; }
    else placeStart("out");
    L.camYaw = L.yaw; L.dz.snap(L.yaw); L.th.reset(); L.manualT = 0;
  } else if (L.phase === "off" || from !== sid) {
    // spawn: a Trial in progress → the cave; else the saved spot (if valid) or camp start
    if (trialActive()) { placeStart("cave"); setTimeout(() => toast("⚔️ Your Trial is waiting. Step into the Elders’ ring to resume."), 300); }
    else if (W.x != null && (W.zone === "cave" || (W.x > B.BOUNDS.x0 && W.x < B.BOUNDS.x1 && W.z > B.BOUNDS.z0 && W.z < B.BOUNDS.z1))) { L.zone = W.zone; L.pos.set(W.x, 0, W.z); L.yaw = W.yaw; if (!walkable(L.pos.x, L.pos.z)) placeStart(W.zone); }
    else placeStart("out");
    L.camYaw = L.yaw; L.dz.snap(L.yaw); L.th.reset(); L.manualT = 0;
  }
  buildHero(); moveHeroTo(L.pos.x, L.pos.z, L.zone);
  document.getElementById("w-era").textContent = sid === "s2" ? "Section 2 · Native Nations of North America · about 1000 to the 1500s" : "Section 1 · Ice Age Beringia · more than 14,000 years ago";
  setPhase("active");
  if (!W.seen[sid === "s2" ? "help2" : "help"]) setTimeout(() => { if (L.phase === "active" && !L.cardOpen) helpCard(); }, 400);
}
function resume() { if (!L.built) { enterLevel(); return; } buildHero(); setPhase("active"); }
function resumeOrEnter() { if (L.phase === "panel") resume(); else window.ABRPG.enterSection(L.sid); }
function openPanel(fn) {
  closeCard(); saveWorldPos();
  window.ABRPG.touchSection(L.sid);      // same "lessons" bookkeeping a Classic section visit does (never touches a running Trial)
  setPhase("panel"); fn(); window.scrollTo(0, 0);
}
function exitLevel(toClassic) {
  saveWorldPos(); closeCard(); setPhase("off");
  if (toClassic) window.ABRPG.home();
}
function setPhase(p) {
  const was = L.phase; L.phase = p; if (p !== "panel") L.inMarket = false;
  const stage = document.getElementById("stage"), hud = document.getElementById("w-hud");
  document.body.classList.toggle("walking", p === "active");
  document.body.classList.toggle("world-linked", p === "panel");
  if (stage) stage.hidden = p === "active";
  if (hud) hud.hidden = p !== "active";
  if (p === "active") { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; if (L.gfx) L.gfx.apply(); L.dirty = true; L.clock = makeClock(); }
  if (p === "off") { renderer.toneMapping = THREE.NoToneMapping; renderer.shadowMap.enabled = false; renderer.setPixelRatio(BG_DPR); resize(); bgBuiltFor = null; bgDirty = true; }
  if (p === "panel") L.dirty = true;
  if (was !== p) syncChips();
}
function offerClassic(fps) { if (L.phase !== "active" || window.__world.quiet) return; card({ title: "🐢 The 3D world is running slowly", body: "<p>This device is drawing about " + Math.round(fps) + " frames a second. Would you like the classic screens instead? Your progress is the same in both.</p>", btns: [{ t: "🗂️ Switch to Classic", f: () => { closeCard(); setMode("classic"); } }], close: "Keep walking" }); }
function fail(why, e) {
  failed = why; if (L.phase !== "off") { setPhase("off"); try { window.ABRPG.enterSection(L.sid, true); } catch (x) { } }
  toast("🗂️ The 3D world couldn’t start here, so the classic screens are on."); syncChips();
}
canvas.addEventListener("webglcontextlost", ev => { ev.preventDefault(); L.ctxLost++; if (L.ctxLost >= 2) fail("context-lost"); });
function saveWorldPos() { if (!L.built) return; if (L.sid !== "s1") { W.at[L.sid] = { x: Math.round(L.pos.x * 100) / 100, z: Math.round(L.pos.z * 100) / 100, yaw: Math.round(L.yaw * 1000) / 1000 }; saveW(); return; } W.zone = L.zone; W.x = Math.round(L.pos.x * 100) / 100; W.z = Math.round(L.pos.z * 100) / 100; W.yaw = Math.round(L.yaw * 1000) / 1000; saveW(); }
window.addEventListener("pagehide", () => { if (L.phase !== "off") saveWorldPos(); });

// ---- teleport (fade) between the steppe and the Trial Cave ----
function teleport(zone, at) {
  const f = document.getElementById("w-fade"); f.classList.add("on"); L.frozen = true;
  setTimeout(() => {
    const B = L.mods.B;
    if (zone === "cave") placeStart("cave");
    else if (at) { L.zone = "out"; L.pos.set(at.x, 0, at.z); L.yaw = at.yaw || 0; }
    else { L.zone = "out"; L.pos.set(-5, 0, 185.5); L.yaw = Math.PI; }
    L.camYaw = L.yaw; L.dz.snap(L.yaw); L.th.reset(); L.wade = 0;
    L.cam.near = zone === "cave" ? 0.3 : 0.3; L.cam.far = zone === "cave" ? 160 : 420; L.cam.updateProjectionMatrix();
    moveHeroTo(L.pos.x, L.pos.z, L.zone); saveWorldPos();
    setTimeout(() => { f.classList.remove("on"); L.frozen = false; }, 120);
  }, 360);
}
function moveHeroTo(x, z, zone) {
  const sc = zone === "cave" ? L.cave.scene : L.lvl.scene; if (L.hero.root.parent !== sc) { if (L.hero.root.parent) L.hero.root.parent.remove(L.hero.root); sc.add(L.hero.root); }
  L.pos.y = supportY(x, z); L.hero.root.position.copy(L.pos); L.hero.root.rotation.y = L.yaw; placeCamera(0, true);
}

// ---- collision (only the active zone's colliders) ----
const PR = 0.32;
function zoneColliders() { return L.zone === "cave" ? L.cave.colliders : L.lvl.colliders.out; }
function resolve(p) {
  const B = L.mods.B;
  for (let it = 0; it < 3; it++) for (const c of zoneColliders()) {
    if (c.disabled) continue;
    if (c.type === "arc") {   // v2.4 palisade: a ring wall with one gap (gapA = direction of the gap from the centre)
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz) || 1e-6, off = d - c.r, m = c.w + PR;
      if (Math.abs(off) < m && Math.abs(wrapA(Math.atan2(dz, dx) - c.gapA)) > c.gapHalf) { const to = off >= 0 ? c.r + m : c.r - m; p.x = c.x + dx / d * to; p.z = c.z + dz / d * to; p.blocked = c; }
      continue;
    }
    if (c.type === "c") { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + PR; if (d < m) { if (d < 1e-6) { p.x += m; continue; } p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } }
    else { const dx = p.x - c.x, dz = p.z - c.z, ox = c.hx + PR - Math.abs(dx), oz = c.hz + PR - Math.abs(dz); if (ox > 0 && oz > 0) { if (ox < oz) p.x += Math.sign(dx || 1) * ox; else p.z += Math.sign(dz || 1) * oz; p.blocked = c; } }
  }
  if (L.zone === "cave") { const dx = p.x - B.CAVE_X, d = Math.hypot(dx, p.z), R = L.cave.radius; if (d > R) { p.x = B.CAVE_X + dx / d * R; p.z = p.z / d * R; } }
  else { p.x = Math.max(B.BOUNDS.x0, Math.min(B.BOUNDS.x1, p.x)); p.z = Math.max(B.BOUNDS.z0, Math.min(B.BOUNDS.z1, p.z)); }
}
function walkable(x, z) { const p = { x, z }; resolve(p); return Math.hypot(p.x - x, p.z - z) < 0.05 && !solidAt(x, z); }
const solidAt = (x, z) => L.zone === "out" && !!L.mods.B.solid && L.mods.B.solid(x, z);   // v2.4: the sea off the Northwest Coast
function supportY(x, z) { const B = L.mods.B; if (L.zone === "cave") return 0; const s = B.onStone(x, z); return s ? s.top : B.groundH(x, z); }
function inWater(x, z) { const B = L.mods.B; return L.sid === "s1" && L.zone === "out" && !B.onStone(x, z, 0.05) && B.groundH(x, z) < B.WATER_Y - 0.12; }

// ---- input ----
const keys = new Set();
const KEYMAP = { KeyW: "f", ArrowUp: "f", KeyS: "b", ArrowDown: "b", KeyA: "l", ArrowLeft: "l", KeyD: "r", ArrowRight: "r" };
window.addEventListener("keydown", e => {
  if (L.phase === "panel" && e.key === "Escape" && document.getElementById("modal").classList.contains("hidden")) { resume(); return; }
  if (L.phase !== "active") return;
  if (L.cardOpen) { if (e.key === "Escape") closeCard(); return; }
  const t = e.target; if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
  if (KEYMAP[e.code]) { keys.add(KEYMAP[e.code]); e.preventDefault(); }
  if (e.code === "KeyE" || e.code === "Enter" || e.code === "Space") { if (!e.repeat) useRing(); e.preventDefault(); }
});
window.addEventListener("keyup", e => { if (KEYMAP[e.code]) keys.delete(KEYMAP[e.code]); });
window.addEventListener("blur", () => keys.clear());
const joy = { id: null, x: 0, y: 0, cx: 0, cy: 0 };
const drag = { id: null, x: 0 };
function wireTouch() {
  const j = document.getElementById("w-joy"), knob = document.getElementById("w-knob");
  j.addEventListener("pointerdown", e => { L.touch = true; joy.id = e.pointerId; const r = j.getBoundingClientRect(); joy.cx = r.left + r.width / 2; joy.cy = r.top + r.height / 2; j.setPointerCapture(e.pointerId); moveJoy(e); e.preventDefault(); });
  const moveJoy = e => { if (e.pointerId !== joy.id) return; let dx = e.clientX - joy.cx, dy = e.clientY - joy.cy; const R = 48, d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } knob.style.transform = `translate(${dx}px,${dy}px)`; const m = Math.hypot(dx, dy) / R; const k = m < 0.12 ? 0 : (m - 0.12) / 0.88 / (m || 1); joy.x = dx / R * k; joy.y = -dy / R * k; };
  j.addEventListener("pointermove", moveJoy);
  const end = e => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ""; };
  j.addEventListener("pointerup", end); j.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerdown", e => { if (L.phase !== "active") return; if (e.pointerType === "touch") L.touch = true; drag.id = e.pointerId; drag.x = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => { if (e.pointerId !== drag.id) return; const dx = e.clientX - drag.x; drag.x = e.clientX; L.camYaw = wrapA(L.camYaw - dx * 0.008); L.dz.snap(L.camYaw); L.manualT = 2.5; });
  const dend = e => { if (e.pointerId === drag.id) drag.id = null; }; canvas.addEventListener("pointerup", dend); canvas.addEventListener("pointercancel", dend);
  window.addEventListener("touchstart", () => { if (!L.touch) { L.touch = true; document.body.classList.add("touch"); } }, { passive: true, once: true });
  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) { L.touch = true; document.body.classList.add("touch"); }
}

// ---- rings ----
let near = null;
function activeRings() { const zr = L.zone === "cave" ? L.cave.rings : L.lvl.rings; return zr; }
function findNear() { let best = null, bd = 1.6; for (const r of activeRings()) { const d = Math.hypot(L.pos.x - r.def.x, L.pos.z - r.def.z); if (d < bd) { bd = d; best = r; } } return best; }
function useRing() { if (L.phase !== "active" || L.cardOpen || L.frozen) return; const r = findNear(); if (r) r.def.act(); }
function refreshRings() { const { setRingState } = L.mods.B; for (const r of L.lvl.rings.concat(L.cave.rings)) setRingState(r, r.def.state()); L.lvl.setGateOpen(hasCloak()); }
// v2.3: the objective names the next unfinished marker along the trail at or ahead of her (projected onto the PATH
// polyline), not the first unfinished one from camp. Gate first while she has no cloak; the cave door when nothing is left ahead.
function routeS(x, z) {
  const P = L.mods.B.PATH; let best = 1e9, bs = 0, acc = 0;
  for (let i = 1; i < P.length; i++) { const ax = P[i - 1][0], az = P[i - 1][1], dx = P[i][0] - ax, dz = P[i][1] - az, len = Math.hypot(dx, dz) || 1;
    let t = ((x - ax) * dx + (z - az) * dz) / (len * len); t = Math.max(0, Math.min(1, t)); const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (d < best) { best = d; bs = acc + t * len; } acc += len; }
  return bs;
}
// v2.4 Native Nations: the regions sit around the fire, not along one trail, so the banner names the unfinished
// marker in the station she is standing in, else the nearest unfinished one; with none left, the Trial ring.
// While she carries a clue bundle it points at the plaza (or at the hint mat).
function nextTargetS2() {
  const rings = L.lvl.rings, S = L.mods.B.STATIONS, trial = rings.find(r => r.def.id === "trial");
  if (SP.active) { const hm = SP.hintBin && L.lvl.mats.find(m => m.bin === SP.hintBin), cl = rings.find(r => r.def.id === "s2-clues");
    return { def: { id: "s2-clues", station: "plaza", x: hm ? hm.x : cl.def.x, z: hm ? hm.z : cl.def.z, text: "Marker 7 · Trade plaza: carry the bundle to its region mat" + (hm ? " (hint: the glowing mat)" : "") } }; }
  const todo = rings.filter(r => r.def.scored && r.state === "new");
  if (!todo.length) return trial;
  const here = Object.keys(S).find(k => Math.hypot(L.pos.x - S[k].x, L.pos.z - S[k].z) < S[k].r + 3);
  const pool = here && todo.some(r => r.def.station === here) ? todo.filter(r => r.def.station === here) : todo;
  let best = null, bd = 1e9; for (const r of pool) { const d = Math.hypot(r.def.x - L.pos.x, r.def.z - L.pos.z); if (d < bd) { bd = d; best = r; } }
  return best;
}
function nextTarget() {
  if (L.sid === "s2") return nextTargetS2();
  if (L.zone === "cave") return L.cave.rings.find(r => r.def.id === "trial");
  const rings = L.lvl.rings, hs = routeS(L.pos.x, L.pos.z);
  if (F.armed && F.lay && F.row > 0) { const tl = rings.find(r => r.def.id === "s1-timeline"); if (tl) return tl; }   // mid-crossing: keep pointing at the river timeline
  const gate = rings.find(r => r.def.id === "gate"), door = rings.find(r => r.def.id === "cave-door");
  const unfinished = r => r.def.id !== "gate" && r.def.id !== "cave-door" && (r.state === "new" || (r.def.id === "tracks" && r.state !== "done"));
  let best = null, bs = 1e9;
  for (const r of rings) { if (!unfinished(r)) continue; const rs = r._s != null ? r._s : (r._s = routeS(r.def.x, r.def.z)); if (rs >= hs - 6 && rs < bs) { bs = rs; best = r; } }
  if (!hasCloak()) { const gs = gate._s != null ? gate._s : (gate._s = routeS(gate.def.x, gate.def.z)); if (!best || bs > gs) return gate; }
  return best || door;
}
// ---- per-frame ----
const UP = new THREE.Vector3(0, 1, 0), tgt = new THREE.Vector3();
// v2.3: camera collision. The camera eases toward its spot behind her, then a short march from her head toward the
// camera pulls it in front of anything solid it would pass through (ice walls, the gate cross-pole and flags, poles,
// tents, the cave hill, the ground), so it never ends up inside geometry.
function camBlocked(x, y, z) {
  const B = L.mods.B;
  if (L.zone === "cave") return Math.hypot(x - B.CAVE_X, z) > 8.6 || y > 4.2;
  if (y < B.groundH(x, z) + 0.35) return true;
  if (L.sid === "s1") {
    if (z > B.BOUNDS.iceZ - 0.35 && (x < B.BOUNDS.cx0 + 0.5 || x > B.BOUNDS.cx1 - 0.5)) return true;
    if (z > 189.8) return true;
  }
  for (const o of L.lvl.camOcc || []) {
    if (y <= o.y0 || y >= o.y1) continue;
    if (o.arc) { const d = Math.hypot(x - o.x, z - o.z); if (Math.abs(d - o.r) < o.w && Math.abs(wrapA(Math.atan2(z - o.z, x - o.x) - o.gapA)) > o.gapHalf) return true; continue; }
    if (o.r ? Math.hypot(x - o.x, z - o.z) < o.r : (Math.abs(x - o.x) < o.hx && Math.abs(z - o.z) < o.hz)) return true;
  }
  return false;
}
function placeCamera(dt, snap) {
  const B = L.mods.B, pitch = 0.5, dist = 7, yaw = L.camYaw;
  tgt.set(L.pos.x, L.pos.y + 1.25, L.pos.z);
  const cp = new THREE.Vector3(tgt.x - Math.sin(yaw) * Math.cos(pitch) * dist, tgt.y + Math.sin(pitch) * dist, tgt.z - Math.cos(yaw) * Math.cos(pitch) * dist);
  if (L.zone === "out") { const gh = B.groundH(cp.x, cp.z) + 0.7; if (cp.y < gh) cp.y = gh; if (L.sid === "s1" && cp.z > B.BOUNDS.iceZ - 0.5 && L.pos.z > B.BOUNDS.iceZ - 2) { cp.x = Math.max(B.BOUNDS.cx0 + 0.6, Math.min(B.BOUNDS.cx1 - 0.6, cp.x)); cp.z = Math.min(189.4, cp.z); } }
  else cp.y = Math.min(cp.y, 4.0);
  if (snap || !L.camPos) L.camPos = cp.clone(); else L.camPos.lerp(cp, Math.min(1, dt * 8));
  // march from her head to the camera; stop 0.3 m before the first solid point
  const dx = L.camPos.x - tgt.x, dy = L.camPos.y - tgt.y, dz = L.camPos.z - tgt.z, len = Math.hypot(dx, dy, dz) || 1;
  L.camPulled = false;
  for (let t = 0.4; t <= len + 0.001; t += 0.2) {
    if (camBlocked(tgt.x + dx / len * t, tgt.y + dy / len * t, tgt.z + dz / len * t)) { const k = Math.max(0.9, t - 0.3) / len; L.camPos.set(tgt.x + dx * k, tgt.y + dy * k, tgt.z + dz * k); L.camPulled = true; break; }
  }
  L.cam.position.copy(L.camPos); L.cam.lookAt(tgt);
}
function step(dt, raw) {
  const B = L.mods.B;
  let sx = 0, sf = 0;
  if (!L.cardOpen && !L.frozen) { if (keys.has("f")) sf += 1; if (keys.has("b")) sf -= 1; if (keys.has("r")) sx += 1; if (keys.has("l")) sx -= 1; sx += joy.x; sf += joy.y; }
  const m = Math.min(1, Math.hypot(sx, sf));
  let vx = 0, vz = 0, speed = 0;
  if (m > 0.01) {
    const camFwdTarget = { x: L.pos.x, z: L.pos.z };
    const dir = camRelative(THREE, { position: { x: L.pos.x - Math.sin(L.camYaw), z: L.pos.z - Math.cos(L.camYaw) } }, camFwdTarget, sx / (Math.hypot(sx, sf) || 1), sf / (Math.hypot(sx, sf) || 1));
    const wading = inWater(L.pos.x, L.pos.z); speed = (wading ? 1.6 : 4.4) * m;
    vx = dir.x * speed; vz = dir.z * speed;
    L.yaw = followAngle(L.yaw, Math.atan2(vx, vz), dt, { k: 14, maxRate: 11, snapAbove: 9 });
  }
  const { n, h } = subSteps(dt);
  const p = { x: L.pos.x, z: L.pos.z, blocked: null };
  for (let i = 0; i < n; i++) {
    const ox = p.x, oz = p.z; p.x += vx * h; p.z += vz * h; resolve(p);
    if (solidAt(p.x, p.z)) { if (!solidAt(p.x, oz)) p.z = oz; else if (!solidAt(ox, p.z)) p.x = ox; else { p.x = ox; p.z = oz; } }   // slide along the shore
  }
  if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) { placeStart(L.zone); p.x = L.pos.x; p.z = L.pos.z; }   // stuck / NaN watchdog
  const moved = Math.hypot(p.x - L.pos.x, p.z - L.pos.z);
  L.pos.x = p.x; L.pos.z = p.z; L.pos.y += (supportY(p.x, p.z) - L.pos.y) * Math.min(1, dt * 14);
  L.vel = dt > 0 ? moved / dt : 0;
  // camera: travel heading → deadzone yaw (kit F3); a manual drag holds for 2.5 s
  L.manualT = Math.max(0, (L.manualT || 0) - dt);
  const th = L.th.step(L.pos.x, L.pos.z, dt, L.camYaw);
  // never swing the camera round when she walks back toward it (backing up keeps the view steady)
  // v2.3: only while she is mostly walking forward. Strafing (A / D alone) used to drag the camera after her sideways
  // travel, so she walked in a circle round it; now sideways steps keep the view still.
  if (L.manualT <= 0 && L.vel > 0.8 && sf > 0.25 && Math.abs(sx) < sf * 0.75 && Math.abs(wrapA(th - L.camYaw)) < 2.2) L.camYaw = L.dz.step(th, dt, true);
  // ford: wading in the icy river → safe respawn on the south bank after 2 s
  if (L.fordFall) L.pos.y = L.mods.B.WATER_Y - 0.35;
  if (inWater(L.pos.x, L.pos.z)) { L.wade += dt; if (L.wade > 2 && !L.frozen) { L.wade = 0; toast("🥶 Brr! The river is too cold and fast. Hop across on the <b>stepping stones</b>."); teleport("out", B.FORD_RESPAWN); } } else L.wade = 0;
  fordStep(); sortStep(dt);
  // the glacier pass: bumping the closed gate shows a hint
  L.hintT = Math.max(0, L.hintT - dt);
  if (p.blocked && p.blocked.tag === "gate" && L.hintT <= 0) { L.hintT = 8; card(gateCard()); }
  // caribou tracks (season walk)
  if (L.zone === "out") for (const t of L.lvl.tracks) if (!W.season.tracks.includes(t.id) && Math.hypot(L.pos.x - t.x, L.pos.z - t.z) < 1.4) { W.season.tracks.push(t.id); saveW(); toast("🦌 Caribou tracks! (" + W.season.tracks.length + " of 3)" + (W.season.tracks.length >= 3 ? " You read the trail like a real hunter." : "")); refreshRings(); }
  L.hero.root.position.copy(L.pos); L.hero.root.rotation.y = L.yaw; L.hero.animate(dt, L.vel);
  placeCamera(dt);
  // a ring right next to the camera would fill the screen: hide its light beam and icon until the camera moves off
  for (const r of activeRings()) { const show = Math.hypot(L.cam.position.x - r.def.x, L.cam.position.z - r.def.z) > 2.8; r.beam.visible = show; r.icon.visible = show; }
  if (L.zone === "out") L.lvl.update(raw, L.pos); else L.cave.update(raw);
  // prompt + objective arrow
  near = findNear();
  const pr = document.getElementById("w-prompt");
  if (near && !L.cardOpen) { const lab = near.def.icon + " " + near.def.label(); if (pr.dataset.k !== lab) { pr.dataset.k = lab; pr.innerHTML = esc(lab) + ' <span class="w-key">' + (L.touch ? "tap ✋" : "press E") + "</span>"; } pr.hidden = false; } else if (!pr.hidden) { pr.hidden = true; pr.dataset.k = ""; }
  const tg = nextTarget(); L.target = tg;
  if (tg) {
    const a = Math.atan2(tg.def.x - L.pos.x, tg.def.z - L.pos.z) - L.camYaw;
    document.getElementById("w-arrow").style.transform = `rotate(${(-a * 180 / Math.PI) - 90}deg)`;
    const st = L.mods.B.STATIONS[tg.def.station]; const txt = tg.def.text ? tg.def.text : (tg.def.id === "gate" && !hasCloak()) ? "Earn your Fur Cloak, then cross the glacier pass" : ("Marker " + st.n + " · " + st.label + ": " + tg.def.label());
    const el = document.getElementById("w-obj-t"); if (el.textContent !== txt) el.textContent = txt;
  }
  L.saveT -= dt; if (L.saveT <= 0) { L.saveT = 2; saveWorldPos(); }
}
function renderLevel() { renderer.render(L.zone === "cave" ? L.cave.scene : L.lvl.scene, L.cam); }

// ---- main loop ----
const clock = makeClock();
let fpsN = 0, fpsT = 0;
window.addEventListener("resize", resize); resize();
(function loop() {
  requestAnimationFrame(loop);
  const t = clock.tick();
  try {
    if (L.phase === "active") {
      if (!L._refT || (L._refT -= t.raw) <= 0) { L._refT = 0.5; refreshRings(); }
      step(t.walk, t.fx);
      if (L.gfx) L.gfx.frame(t.raw);
      renderLevel(); fpsN++; fpsT += t.raw; if (fpsT >= 1) { L.fps.last = fpsN / fpsT; fpsN = 0; fpsT = 0; }
    } else if (L.phase === "panel") {
      if (L.dirty) { renderLevel(); L.dirty = false; }   // frozen frame behind the panel
    } else bgFrame(t.fx);
  } catch (e) { console.error("[world] frame error", e); if (L.phase !== "off") fail("frame", e); }
})();
ui(); wireTouch();
setInterval(syncChips, 1000);

// ---- debug / test hook ----
window.__world = {
  get mode() { return mode(); }, get phase() { return L.phase; }, get zone() { return L.zone; }, get failed() { return failed; },
  get pos() { return { x: L.pos.x, y: L.pos.y, z: L.pos.z, yaw: L.yaw }; },
  get cam() { const c = L.camPos || { x: 0, y: 0, z: 0 }; return { yaw: L.camYaw, x: c.x, y: c.y, z: c.z, pulled: !!L.camPulled, blocked: !!(L.built && L.camPos && camBlocked(c.x, c.y, c.z)) }; },
  camBlocked: (x, y, z) => camBlocked(x, y, z),
  get banner() { const e = document.getElementById("w-obj-t"); return e ? e.textContent : ""; }, get target() { return L.target && L.target.def.id; }, get fps() { return L.fps.last; }, get near() { return near && near.def.id; },
  rings: () => (L.built ? L.lvl.rings.concat(L.cave.rings).map(r => ({ id: r.def.id, zone: r.def.zone || "out", x: r.def.x, z: r.def.z, state: r.state })) : []),
  teleport(x, z, zone) { if (!L.built) return false; L.zone = zone || (x > 2000 ? "cave" : "out"); L.pos.set(x, 0, z); L.wade = 0; moveHeroTo(x, z, L.zone); return true; },
  faceCam(a) { L.camYaw = a; L.yaw = a; L.dz.snap(a); L.th.reset(); return true; },
  ford: () => ({ armed: F.armed, row: F.row, done: F.done, solved: L.built ? fordSolved() : false, rows: F.lay ? F.lay.rows.map(r => ({ right: r.right, key: r.ev.key, when: r.ev.when, name: fordName(r.ev), wrong: r.wrong && r.wrong.key })) : null, stones: L.built ? L.mods.B.STONES.map(s => ({ x: s.x, z: s.z, row: s.row, side: s.side })) : [], labels: F.vis ? F.vis.items.filter(i => i.sp.visible).length : 0 }),
  use: () => useRing(), card: () => (L.cardOpen ? document.getElementById("w-card").textContent : null), closeCard: () => closeCard(),
  get level() { return L.sid; }, readS2: () => W.read.s2.slice(), at: () => JSON.parse(JSON.stringify(W.at)), seen: () => ({ ...W.seen }),
  sort: () => ({ active: SP.active, cur: SP.cur && SP.cur.t, key: SP.cur && SP.cur.key, left: SP.h ? SP.h.left() : null, mistakes: SP.h ? SP.h.mistakes() : null, hint: SP.hintBin, mats: L.lvl && L.lvl.mats ? L.lvl.mats.map(m => ({ bin: m.bin, x: m.x, z: m.z, bundles: m.bundles, glow: !!m.glowOn })) : [] }),
  stations: () => (L.mods && L.mods.B.STATIONS) || null, solid: (x, z) => solidAt(x, z), walkable: (x, z) => walkable(x, z),
  pathDist: (x, z) => (L.mods && L.mods.B.pathDist ? L.mods.B.pathDist(x, z) : null), meetOpen: () => meetOpen(),
  setMode: (m) => setMode(m), fail: (w) => fail(w || "test"), gateOpen: () => !!(L.built && hasCloak()), caveOpen: () => caveOpen(), read: () => W.read.s1.slice(), tracks: () => W.season.tracks.slice(),
  info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, dpr: renderer.getPixelRatio(), gfx: L.gfx && L.gfx.mode, deg: L.gfx && L.gfx.st.deg, aa: AA, soft: SOFT_GL, bg: bgStats }),
  _dbg: () => ({ L, renderer, THREE }),
  bgStats, quiet: false
};
