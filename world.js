// world.js — v2.2–v2.6 3D layer for American Beginnings RPG.
// (1) Classic: the low-poly N64-style background behind the screens (paused while panels / videos cover it).
// (2) Walk: the walkable levels, loaded on first use: Section 1 Beringia (world/beringia.js), Section 2 Native
//     Nations (world/nations.js, v2.4) and, new in v2.5, Section 3 The Voyage of 1492 (world/voyage.js) and, new in v2.6, Section 4 Three Empires (world/empires.js). Each level keeps its own scene, rings, graphics and sparks (LV);
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
  const d = { ver: 1, mode: null, zone: "out", x: null, z: null, yaw: 0, seenIntro: false, season: { tracks: [] }, read: { s1: [], s2: [], s3: [], s4: [] }, seen: {}, at: {} };
  let w = null; try { w = JSON.parse(localStorage.getItem(WKEY) || "null"); } catch (e) { w = null; }
  if (!w || typeof w !== "object" || Array.isArray(w)) return d;
  if (w.mode === "walk" || w.mode === "classic") d.mode = w.mode;
  if (w.zone === "cave") d.zone = "cave";
  if (Number.isFinite(w.x) && Number.isFinite(w.z) && Math.abs(w.x) < 5000 && Math.abs(w.z) < 500) { d.x = w.x; d.z = w.z; }
  if (Number.isFinite(w.yaw)) d.yaw = wrapA(w.yaw);
  d.seenIntro = w.seenIntro === true;
  if (w.season && Array.isArray(w.season.tracks)) d.season.tracks = [...new Set(w.season.tracks.filter(t => ["t1", "t2", "t3"].includes(t)))];
  if (w.read && Array.isArray(w.read.s1)) d.read.s1 = [...new Set(w.read.s1.filter(i => Number.isInteger(i) && i >= 0 && i < 8))].sort();
  for (const k of ["s2", "s3", "s4"]) if (w.read && Array.isArray(w.read[k])) d.read[k] = [...new Set(w.read[k].filter(i => Number.isInteger(i) && i >= 0 && i < 7))].sort();
  if (w.seen && typeof w.seen === "object" && !Array.isArray(w.seen)) for (const k of ["sign", "journey", "gate", "help", "help2", "kiva", "mound", "chunkey", "help3", "royal", "perez", "stars", "sails", "ships", "rudder", "taino", "after", "wreck", "sail-canary", "sail-ss", "sail-hisp", "help4", "fort", "timucua", "palace", "adobe", "beaver", "furtrade", "wendat", "windmill", "manhattan"]) if (w.seen[k] === true) d.seen[k] = true;
  const a2 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s2 : null;   // Native Nations bounds (world/nations.js BOUNDS)
  if (a2 && typeof a2 === "object" && Number.isFinite(a2.x) && Number.isFinite(a2.z) && a2.x > -80 && a2.x < 86 && a2.z > -66 && a2.z < 70) d.at.s2 = { x: a2.x, z: a2.z, yaw: Number.isFinite(a2.yaw) ? wrapA(a2.yaw) : 0 };
  const a3 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s3 : null;   // Voyage of 1492 bounds (world/voyage.js BOUNDS)
  if (a3 && typeof a3 === "object" && Number.isFinite(a3.x) && Number.isFinite(a3.z) && a3.x > -92 && a3.x < 92 && a3.z > -72 && a3.z < 92) d.at.s3 = { x: a3.x, z: a3.z, yaw: Number.isFinite(a3.yaw) ? wrapA(a3.yaw) : 0 };
  const a4 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s4 : null;   // Three Empires bounds (world/empires.js BOUNDS)
  if (a4 && typeof a4 === "object" && Number.isFinite(a4.x) && Number.isFinite(a4.z) && a4.x > -68 && a4.x < 92 && a4.z > -72 && a4.z < 63) d.at.s4 = { x: a4.x, z: a4.z, yaw: Number.isFinite(a4.yaw) ? wrapA(a4.yaw) : 0 };
  return d;
}
function saveW() { try { localStorage.setItem(WKEY, JSON.stringify(W)); } catch (e) { } }
let failed = !webgl2 ? "no-webgl2" : null;
const mode = () => (failed ? "classic" : (W.mode || "walk"));
window.addEventListener("ab:lesson", e => { const d = e.detail || {}, r = W.read[d.sid]; if (r && Number.isInteger(d.i) && !r.includes(d.i)) { r.push(d.i); r.sort(); saveW(); } });

const L = { sid: "s1", phase: "off", built: false, building: null, cam: null, mods: null, dirty: true, zone: "out", pos: new THREE.Vector3(), yaw: 0, vel: 0, wade: 0, hintT: 0, saveT: 0, fps: { n: 0, t: 0, last: 0 }, ctxLost: 0, userMap: false, bypass: false };
const S1 = () => window.ABRPG && window.ABRPG.sectionById("s1");
const WALK = ["s1", "s2", "s3", "s4"];                                       // sections with a walkable level
const CUR = () => window.ABRPG && window.ABRPG.sectionById(L.sid);
const ST = () => window.ABRPG && window.ABRPG.state();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const toast = m => window.ABRPG && window.ABRPG.toast(m);

// ---- ring definitions (marker order: camp → herds → steppe → hearth → ford → gate → corridor → cave) ----
const SRC_LESSON = { s1: [7, "src1"], s2: [6, "src2"], s3: [6, "src3"], s4: [6, "src4"] };      // the primary-source scroll also counts once its questions were played
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
function chunkeyCard() { return { title: "🥏 The chunkey yard", body: "<p><b>Chunkey</b> was a favorite game in Mississippian towns. One player rolled a smooth stone disc across the yard. Players threw long poles at the spot where they thought the stone would stop, and the closest pole won.</p><p>Crowds came to watch, and chunkey stones have been found at Cahokia. People across the Southeast kept playing for hundreds of years.</p>" }; }
function helpCardS2() {
  card({ title: "❔ How to explore the Native Nations", body: "<p>You are <b>" + esc(heroName()) + "</b>, visiting the homelands of Native nations of North America, about 1000 to the 1500s. In real life these regions are hundreds or thousands of miles apart. Here they sit around one council fire so you can walk to each, but the directions are true: <b>north is ahead</b> when you start, so <b>west is on your left</b>, just like on a map. The painted compass by the fire shows it.</p><ul><li><b>Walk:</b> WASD or arrow keys, or the joystick (touch). <b>Look:</b> drag on the world.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap ✋.</li><li>Gold rings are new, blue rings are done, pale-gold rings have 3 ⭐, gray rings are locked.</li><li>The banner at the top points to the nearest marker you still need. The Elders’ Trial is at the <b>tree-ring meeting ground</b> once you have read all 7 scrolls.</li><li>The 🗂️ chip at the top switches to the classic screens any time. Your progress is the same in both.</li></ul>" });
  W.seen.help2 = true; saveW();
}

// ---- v2.5 Section 3: The Voyage of 1492 (world/voyage.js) ----
// Marker order: San Jorge church → La Rábida → lookout tower → rope & sail shop → Palos pier → La Gomera (Canaries) →
// San Salvador → Hispaniola. Four islands; the sail rings fade her between harbors (the ocean is shrunk for play).
const ISLE_OF = { church: "palos", rabida: "palos", tower: "palos", rope: "palos", pier: "palos", canary: "canary", ss: "ss", hisp: "hisp" };
const ISLES3 = ["palos", "canary", "ss", "hisp"];
const ISLE_NAME = { palos: "Palos, Spain", canary: "La Gomera, Canary Islands", ss: "San Salvador", hisp: "Hispaniola" };
const ISLE_WHEN = { palos: "Sailed August 3, 1492, and came home March 15, 1493", canary: "Repairs and supplies, August to September 6, 1492", ss: "Landfall, October 12, 1492", hisp: "December 1492 and the wreck at Christmas" };
function ringDefsS3(B) {
  const A = B.RING_AT, at = (id, o) => ({ ...o, x: A[id][0], z: A[id][1] });
  const info = (id, key, station, icon, title, cardFn) => at(id, { id, station, icon, scored: true, label: () => title, act: () => { W.seen[key] = true; saveW(); card(cardFn()); }, state: () => W.seen[key] ? "done" : "new" });
  const L3 = (id, i, st) => lessonRing("s3-" + id, i, A[id][0], A[id][1], st, "s3");
  const A3 = (id, icon, title, st) => actRing("s3-" + id, "s3-" + id, icon, title, A[id][0], A[id][1], st, "s3");
  const sail = (isle, station) => at("sail-" + isle, { id: "sail-" + isle, station, icon: "⛵", label: () => isle === "palos" && !boardOpen() ? "Board the fleet (learn to navigate first)" : "Set sail", act: () => card(sailCard(isle)), state: () => isle === "palos" && !boardOpen() ? "locked" : "done" });
  return [
    L3("l0", 0, "church"), info("royal", "royal", "church", "📯", "The royal order, read at San Jorge", royalCard),
    L3("l2", 2, "rabida"), info("perez", "perez", "rabida", "✝️", "Fray Juan Pérez of La Rábida", perezCard), A3("geomap", "🧭", "Chart the Great Voyages", "rabida"),
    L3("l1", 1, "tower"), info("stars", "stars", "tower", "⭐", "Finding the way by the stars", starsCard),
    info("sails", "sails", "rope", "🪢", "Square sails and lateen sails", sailsCard), at("market", { id: "market", station: "rope", icon: "🛍️", label: () => "Seville Chandlery: a ship’s supplier", act: () => openPanel(() => { L.inMarket = true; window.ABRPG.market("m2"); }), state: () => "done" }),
    info("ships", "ships", "pier", "🚢", "Meet the Niña, the Pinta and the Santa María", shipsCard), A3("caravel", "⛵", "Navigate the Caravel", "pier"), L3("l6", 6, "pier"), sail("palos", "pier"),
    info("rudder", "rudder", "canary", "🔧", "The Pinta’s broken rudder", rudderCard), L3("l5", 5, "canary"), A3("pigafetta", "🌏", "Talk with Antonio Pigafetta", "canary"), sail("canary", "canary"),
    L3("l3", 3, "ss"), info("taino", "taino", "ss", "🛶", "October 12, 1492: Land! The Taíno of Guanahaní", tainoCard), info("after", "after", "ss", "⚖️", "What came after: the honest history", afterCard), sail("ss", "ss"),
    L3("l4", 4, "hisp"), info("wreck", "wreck", "hisp", "🎄", "Christmas 1492: the wreck of the Santa María", wreckCard),
    { ...A3("exchange", "🔄", "Columbian Exchange: carry the crates to the dock mats", "hisp"), act: () => card(exchangeCard()) },
    A3("timeline", "📓", "Ship’s log: Timeline of the Age of Exploration", "hisp"),
    at("trial", { id: "trial", station: "hisp", icon: "⛈️", label: () => trialLabelS3(), act: () => stormOpen() ? openPanel(() => { L.bypass = true; try { window.ABRPG.trial("s3"); } finally { L.bypass = false; } }) : card(stormLockedCard()), state: () => !stormOpen() ? "locked" : (sec("s3").completed ? "star" : "new") }),
    sail("hisp", "hisp")
  ];
}
const missingS3 = () => [0, 1, 2, 3, 4, 5, 6].filter(i => !scrollRead("s3", i));
const stormOpen = () => missingS3().length === 0 || (sec("s3").attempts || 0) > 0 || !!sec("s3").completed || trialActive("s3");
// boarding at Palos: the Astrolabe (Section 3 gear) or Scrolls 1–3 read (why explore, the science of sailing, Columbus)
const boardOpen = () => (ST().owned || []).includes("astrolabe") || [0, 1, 2].every(i => scrollRead("s3", i)) || stormOpen() || ISLES3.slice(1).some(k => W.seen["sail-" + k]);
function trialLabelS3() { const st = sec("s3"); if (trialActive("s3")) return "Resume the Trial: the storm home"; if (st.completed) return "Board the Niña: the storm home (mastered " + st.bestPct + "%) — try again"; return "Board the Niña: the storm home (" + ((window.GAME_CONTENT && GAME_CONTENT.passPercent) || 95) + "% to master)"; }
function stormLockedCard() { return { title: "⛈️ The voyage home", body: "<p>On January 16, 1493, Columbus sailed for Spain in the little <b>Niña</b>. On February 14 a terrible storm near the Azores nearly sank her. Columbus wrote an account of his voyage, sealed it in a barrel and threw it into the sea, in case the ship went down.</p><p>You will face the storm (the Trial) once you have read <b>all 7 scrolls</b> of this voyage. Still to read:</p>", btns: missingS3().map(i => lessonBtnS("s3", i)) }; }
function sailCard(from) {
  if (from === "palos" && !boardOpen()) return { title: "⛵ Not yet, sailor!", body: "<p>Every crew needs to know <b>why</b> they sail and <b>how</b> to find the way home. Read <b>Scrolls 1–3</b> (the church, La Rábida and the lookout tower) or earn the <b>Astrolabe</b>, then come back to board.</p>", btns: [0, 1, 2].filter(i => !scrollRead("s3", i)).map(i => lessonBtnS("s3", i)) };
  const btns = ISLES3.filter(k => k !== from).map(k => ({ t: "⛵ " + ISLE_NAME[k], f: () => { closeCard(); sailTo(k); } }));
  return { title: "⛵ Set sail", body: "<p>Where to? The ports are listed in the order of the voyage:</p><ul>" + ISLES3.map(k => "<li><b>" + ISLE_NAME[k] + "</b>: " + ISLE_WHEN[k] + (k === from ? " (you are here)" : "") + "</li>").join("") + "</ul><p class=\"muted\">The real crossing from the Canaries to San Salvador was about 3,000 miles and took about five weeks from the Canaries (33 days after losing sight of land). Here the ocean is shrunk so you can sail it in a moment.</p>", btns };
}
const ARRIVE = {
  palos: "⚓ Palos, Spain. The Niña came home here on <b>March 15, 1493</b>, and the Pinta sailed in later that same day.",
  canary: "⚓ The Canary Islands, August 1492. Fix the Pinta’s rudder and load fresh water. Next: the open ocean!",
  ss: "🏝️ <b>October 12, 1492.</b> After about five weeks from the Canaries (33 days after losing sight of land), “¡Tierra! ¡Tierra!” Land!",
  hisp: "⚓ Hispaniola, December 1492. Look for the Santa María on the reef."
};
function sailTo(k) { const h = L.mods.B.HARBORS[k]; if (!h) return false; W.seen["sail-" + k] = true; teleport("out", h); setTimeout(() => toast(ARRIVE[k]), 600); return true; }
function royalCard() { return { title: "📯 The royal order, May 23, 1492", body: "<p>In this church of <b>San Jorge</b>, a royal order was read aloud to the people of Palos. The town owed the crown a penalty, so it had to provide <b>two caravels</b>, with their crews, for Columbus’s voyage.</p><p>Many sailors were afraid to sail west into the unknown Ocean Sea. Then <b>Martín Alonso Pinzón</b>, a respected Palos captain, joined and helped sign up the crew. He captained the <b>Pinta</b>, and his brother <b>Vicente Yáñez Pinzón</b> captained the <b>Niña</b>. About <b>90 men</b> sailed in all, most of them from Palos and the towns nearby.</p><p>Ordinary sailors, risking everything on a bold idea: that took real courage.</p>" }; }
function perezCard() { return { title: "✝️ Fray Juan Pérez of La Rábida", body: "<p>Columbus spent more than <b>six years</b> asking Spain’s rulers to pay for his plan to reach Asia by sailing west. Experts said the trip was much longer than he thought (and they were right about that!).</p><p>In 1491, almost ready to give up and try France, he came to this friary of <b>La Rábida</b>. Its friar, <b>Juan Pérez</b>, had once been Queen Isabella’s confessor. He wrote to the Queen and won Columbus another hearing.</p><p>In April 1492, <b>Ferdinand and Isabella</b> signed an agreement to back the voyage. Persistence paid off.</p>" }; }
function starsCard() { return { title: "⭐ Finding the way by the stars", body: "<p>How far north or south are you? That is your <b>latitude</b>. At night a sailor measured how high the <b>North Star</b> stood above the horizon with a <b>quadrant</b> or an <b>astrolabe</b>. The higher the star, the farther north the ship was.</p><p>East and west were harder. Pilots used <b>dead reckoning</b>: the <b>compass</b> gave the direction, a half-hour <b>sandglass</b> (turned by a ship’s boy) kept the time, and they estimated the speed. Direction × speed × time = where you are, more or less. Columbus was a superb dead-reckoning navigator.</p><p>No one could measure longitude well at sea until clockmakers built reliable sea clocks in the 1700s.</p>" }; }
function sailsCard() { return { title: "🪢 Square sails and lateen sails", body: "<p>Look at the two model rigs here. A <b>square sail</b> catches wind from behind and pushes hard. It is perfect for the steady <b>trade winds</b> that blow from the northeast and carry ships west from the Canary Islands.</p><p>A triangular <b>lateen sail</b> can sail closer into the wind, which helps along coasts. The <b>Niña</b> left Palos with lateen sails. At Gran Canaria her crew switched her to <b>square sails</b> for the long run west.</p><p>The ships also loaded stores: water and wine in barrels, hard ship’s biscuit, salted meat and fish, cheese, beans and olive oil.</p>" }; }
function shipsCard() { return { title: "🚢 The Niña, the Pinta and the Santa María", body: "<p>The <b>Santa María</b> was a <b>nao</b>: the biggest, slowest ship and Columbus’s flagship. The <b>Niña</b> and the <b>Pinta</b> were <b>caravels</b>: smaller, faster and easier to handle. “Niña” was a nickname. Her real name was <b>Santa Clara</b>!</p><p>Before sunrise on <b>August 3, 1492</b>, the three ships slipped away from Palos and sailed down the river to the sea.</p><p>The <b>Niña</b> was Columbus’s favorite. She brought him safely home through a terrible storm in 1493, back to this very spot.</p>" }; }
function rudderCard() { return { title: "🔧 The Pinta’s broken rudder", body: "<p>Only three days out of Palos, the <b>Pinta’s rudder</b> came loose. Columbus suspected that the ship’s owners, who had not wanted to sail, had damaged it on purpose. Captain Pinzón kept her going until the crew could repair it at <b>Gran Canaria</b>.</p><p>The Canary Islands belonged to Spain and sat right in the path of the <b>trade winds</b>. At <b>La Gomera</b> the fleet loaded fresh water, firewood and food.</p><p>On <b>September 6, 1492</b>, they sailed west into the open ocean, farther than any of the crew had ever gone.</p>" }; }
function tainoCard() { return { title: "🛶 Land! The Taíno of Guanahaní", body: "<p>At about <b>2 a.m. on October 12, 1492</b>, <b>Rodrigo de Triana</b>, the lookout on the Pinta, shouted “¡Tierra! ¡Tierra!” After about five weeks from the Canaries (33 days after losing sight of land), and a crew that had begged to turn back, they had found land.</p><p>The island’s people were the <b>Taíno</b>, and they called it <b>Guanahaní</b>. Columbus named it San Salvador. The Taíno lived in villages of round houses called <b>bohíos</b>, with a larger house for the <b>cacique</b> (chief). They grew cassava in mounded fields, baked it into flat bread on a clay griddle, fished from <b>dugout canoes</b> carved from single trees, and slept in <b>hammocks</b>.</p><p>English still uses Taíno words: <b>canoe, hammock, hurricane, barbecue</b> and <b>tobacco</b>. Columbus wrote that the people were friendly and generous.</p>" }; }
function afterCard() { return { title: "⚖️ What came after: the honest history", body: "<p>On this very first visit, Columbus wrote that the Taíno would make good servants, and he took several of them captive to guide him and to show in Spain.</p><p>In the years that followed, Spanish settlers forced Taíno people to work in gold mines and fields. Diseases from Europe, such as <b>smallpox</b>, killed huge numbers, because their bodies had never met these germs. Within about 50 years, most Taíno of the Caribbean islands had died.</p><p>Brave people spoke out. In 1511 a friar named <b>Antonio de Montesinos</b> preached against the cruelty on Hispaniola, and <b>Bartolomé de las Casas</b> spent his life defending Native peoples.</p><p>Taíno heritage lives on today in Puerto Rico, Cuba and the Dominican Republic, in words, foods and family roots. A true historian admires real courage and tells the hard parts, too.</p>" }; }
function wreckCard() { return { title: "🎄 Christmas 1492: the wreck of the Santa María", body: "<p>Late on <b>December 24, 1492</b>, while a ship’s boy held the tiller, the <b>Santa María</b> drifted onto a coral reef off Hispaniola. By <b>Christmas Day</b> she was lost. (The Pinta had sailed off on her own in November.)</p><p>The cacique <b>Guacanagarí</b> sent his people in canoes to help unload the ship. Columbus wrote that nothing at all was stolen.</p><p>The little Niña could not carry everyone, so <b>39 men</b> stayed behind. They built a fort from the wreck’s timbers and named it <b>La Navidad</b> (“Christmas”), the first Spanish settlement in the Americas. When Columbus came back in November 1493, the fort was burned and all 39 men were dead, after fighting among themselves and with Taíno people.</p>" }; }
function exchangeCard() {
  const a = ST().acts && ST().acts["s3-exchange"], played = !!(a && a.plays);
  const body = (played ? "<p>You have loaded these crates before. Want to practice? Carry them again, or use the card version.</p>" : "<p>Columbus’s second voyage, in 1493, brought <b>17 ships</b> to Hispaniola, loaded with horses, cattle, pigs, wheat and sugarcane. For the next hundred years, plants, animals and germs crossed the ocean both ways. Historians call it the <b>Columbian Exchange</b>.</p>") +
    "<p>Carry each crate to the dock mat for the way it crossed the ocean: stand on the mat for a moment to set it down. Facing north, the <b>Americas → Europe, Africa, Asia</b> mat is on your right (east, toward Spain), and the <b>Europe, Africa, Asia → Americas</b> mat is on your left (west).</p>";
  return { title: "🔄 Columbian Exchange: load the ships", body, btns: [{ t: "📦 " + (played ? "Carry the crates again" : "Carry the crates"), f: () => { closeCard(); sortStart("s3", "s3-exchange"); } }, { t: "🗂️ Card version", f: () => { closeCard(); openPanel(() => window.ABRPG.runActivity("s3", "s3-exchange", resume)); } }] };
}
function helpCardS3() {
  card({ title: "❔ How to sail the Voyage of 1492", body: "<p>You are <b>" + esc(heroName()) + "</b>, in the port of <b>Palos, Spain</b>, in 1492. Columbus’s voyage took courage, skill and the daring of ordinary sailors. It opened the Atlantic, and more than a century later that ocean road carried English settlers to the colonies where <b>American self-government</b> took root. A good historian admires the courage and tells the whole truth, including what it cost the Taíno.</p><ul><li><b>Walk:</b> WASD or arrow keys, or the joystick (touch). <b>Look:</b> drag on the world. <b>North is ahead</b> when you start, so <b>west is on your left</b>.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap ✋.</li><li>Explore Palos, then board at the <b>pier</b> (⛵ ring). The sail rings carry you to the Canaries, San Salvador and Hispaniola. The ocean is shrunk so you can cross it in a moment.</li><li>Gold rings are new, blue rings are done, pale-gold rings have 3 ⭐, gray rings are locked. The banner points to your next marker.</li><li>The Trial, the storm on the way home, waits by the Niña at Hispaniola once you have read all 7 scrolls.</li><li>The 🗂️ chip at the top switches to the classic screens any time. Your progress is the same in both.</li></ul>" });
  W.seen.help3 = true; saveW();
}
// Level 3 banner: the next unfinished marker on the island she is on; when that island is done, the sail ring for the
// next port in voyage order that still has work; with nothing left, the Trial ring by the Niña.
function nextTargetS3() {
  const B = L.mods.B, rings = L.lvl.rings, S = B.STATIONS, byId = id => rings.find(r => r.def.id === id);
  const isleAt = (x, z) => x < -15 && z > 10 ? "palos" : x < 25 ? "canary" : z > -20 ? "ss" : "hisp";
  const here = isleAt(L.pos.x, L.pos.z);
  if (SP.active && SP.sid === "s3") { const hm = SP.hintBin && L.lvl.mats.find(m => m.bin === SP.hintBin), cl = byId("s3-exchange");
    return { def: { id: "s3-exchange", station: "hisp", x: hm ? hm.x : cl.def.x, z: hm ? hm.z : cl.def.z, text: "Marker 8 · Hispaniola: carry the crate to its dock mat" + (hm ? " (hint: the glowing mat)" : "") } }; }
  const todo = rings.filter(r => r.def.scored && r.state === "new"), isle = r => ISLE_OF[r.def.station];
  const sailRing = (to) => { const r = byId("sail-" + here); return r && { def: { ...r.def, text: "Marker " + S[r.def.station].n + " · " + (here === "palos" && !boardOpen() ? "Read Scrolls 1–3 or earn the Astrolabe, then board at the pier" : "Set sail for " + ISLE_NAME[to]) } }; };
  const pick = pool => { let best = null, bd = 1e9; for (const r of pool) { const d = Math.hypot(r.def.x - L.pos.x, r.def.z - L.pos.z); if (d < bd) { bd = d; best = r; } } return best; };
  if (!todo.length) return here === "hisp" ? byId("trial") : sailRing("hisp");
  const local = todo.filter(r => isle(r) === here);
  if (local.length) { const st = Object.keys(S).find(k => Math.hypot(L.pos.x - S[k].x, L.pos.z - S[k].z) < S[k].r + 3); const inSt = st && local.filter(r => r.def.station === st); if (inSt && inSt.length) return pick(inSt); const n0 = Math.min(...local.map(r => S[r.def.station].n)); return pick(local.filter(r => S[r.def.station].n === n0)); }   // story order: the lowest-numbered marker on this island
  if (here === "palos" && !boardOpen()) return sailRing("canary");
  const next = ISLES3.find(k => todo.some(r => isle(r) === k));
  return sailRing(next);
}

// ---- v2.6 Section 4: Three Empires c. 1610 (world/empires.js) ----
// Marker order: St. Augustine → Santa Fe → beaver pond → canoe landing / Quebec → New Amsterdam market → Fort Amsterdam →
// palisade gate (Trial). The St. Lawrence is crossed by canoe (the canoe rings fade her across; nothing is saved but at.s4).
function ringDefsS4(B) {
  const A = B.RING_AT, at = (id, o) => ({ ...o, x: A[id][0], z: A[id][1] });
  const info = (id, station, icon, title, cardFn) => at(id, { id, station, icon, scored: true, label: () => title, act: () => { W.seen[id] = true; saveW(); card(cardFn()); }, state: () => W.seen[id] ? "done" : "new" });
  const L4 = (id, i, st) => lessonRing("s4-" + id, i, A[id][0], A[id][1], st, "s4");
  const A4 = (id, icon, title, st) => actRing("s4-" + id, "s4-" + id, icon, title, A[id][0], A[id][1], st, "s4");
  const canoe = (side, station) => at("canoe-" + side, { id: "canoe-" + side, station, icon: "🛶", label: () => side === "south" ? "Paddle across the St. Lawrence to Quebec" : "Paddle back to the south bank", act: () => card(canoeCard(side)), state: () => "done" });
  return [
    L4("l0", 0, "staug"), L4("l1", 1, "staug"), info("fort", "staug", "🏰", "St. Augustine, 1565: the oldest city", fortCard), info("timucua", "staug", "🌴", "The Timucua people of Florida", timucuaCard), A4("map", "🗺️", "Map the Three Empires", "staug"),
    L4("l2", 2, "santafe"), info("palace", "santafe", "🏛️", "Santa Fe and the Palace of the Governors", palaceCard), info("adobe", "santafe", "🧱", "How adobe bricks are made", adobeCard),
    info("beaver", "beaver", "🦫", "Why Europe wanted beaver", beaverCard), info("furtrade", "beaver", "🤝", "The fur trade: partners in the woods", furTradeCard),
    canoe("south", "landing"),
    L4("l3", 3, "quebec"), A4("champlain", "⚜️", "Talk with Samuel de Champlain", "quebec"), L4("l6", 6, "quebec"), info("wendat", "quebec", "🏹", "Champlain’s allies: the Wendat and Algonquin", wendatCard), canoe("north", "quebec"),
    at("market", { id: "market", station: "market", icon: "🛍️", label: () => "New Amsterdam Market: Mevrouw Annetje’s stall", act: () => openPanel(() => { L.inMarket = true; window.ABRPG.market("m3"); }), state: () => "done" }),
    info("windmill", "market", "🌬️", "The windmill and the Dutch trading town", windmillCard),
    { ...A4("goals", "⚖️", "What did each empire want? Carry the crates", "market"), act: () => card(goalsCard()) },
    L4("l4", 4, "fort"), A4("geomap", "🧭", "Explorers and Settlements Map", "fort"), info("manhattan", "fort", "🏞️", "Fort Amsterdam and Manhattan, 1626", manhattanCard),
    L4("l5", 5, "gate"), A4("timeline", "📓", "Timeline of the Empires", "gate"),
    at("trial", { id: "trial", station: "gate", icon: "⚔️", label: () => trialLabelS4(), act: () => gateOpenS4() ? openPanel(() => { L.bypass = true; try { window.ABRPG.trial("s4"); } finally { L.bypass = false; } }) : card(gateLockedCard()), state: () => !gateOpenS4() ? "locked" : (sec("s4").completed ? "star" : "new") })
  ];
}
const missingS4 = () => [0, 1, 2, 3, 4, 5, 6].filter(i => !scrollRead("s4", i));
const gateOpenS4 = () => missingS4().length === 0 || (sec("s4").attempts || 0) > 0 || !!sec("s4").completed || trialActive("s4");
function trialLabelS4() { const st = sec("s4"); if (trialActive("s4")) return "Resume the Trial at the palisade gate"; if (st.completed) return "The palisade gate Trial (mastered " + st.bestPct + "%) — try again"; return "Pass the palisade gate: the Trial (" + ((window.GAME_CONTENT && GAME_CONTENT.passPercent) || 95) + "% to master)"; }
function gateLockedCard() { return { title: "🚪 The palisade gate", body: "<p>The gate opens for the Trial once you have read <b>all 7 scrolls</b> of the three empires. Still to read:</p>", btns: missingS4().map(i => lessonBtnS("s4", i)) }; }
function canoeCard(side) {
  if (side === "north") return { title: "🛶 Back across the river", body: "<p>Ready to paddle back to the south bank? From there the trail runs east to New Amsterdam on Manhattan.</p>", btns: [{ t: "🛶 Paddle to the south bank", f: () => { closeCard(); canoeTo("south"); } }] };
  return { title: "🛶 The St. Lawrence River", body: "<p>The <b>St. Lawrence</b> was the highway of New France. Birch-bark canoes, made by Algonquian and Wendat builders, were light enough to carry around rapids and strong enough to carry a load of furs.</p><p>Across the water is <b>Quebec</b>. Its name comes from an Algonquian word for <b>“where the river narrows.”</b> There, a high cliff looks down on the narrows, a perfect spot to guard the river. <b>Samuel de Champlain</b> arrived on <b>July 3, 1608</b>.</p>", btns: [{ t: "🛶 Paddle across to Quebec", f: () => { closeCard(); canoeTo("north"); } }] };
}
const ARRIVE4 = {
  north: "⚓ Quebec, 1608. Champlain built his <b>Habitation</b> here, at the foot of the cliff. Only 8 of his 28 men lived through the first hard winter, but he stayed.",
  south: "🛶 The south bank. The trail east leads to <b>New Amsterdam</b> on Manhattan."
};
function canoeTo(side) { const h = L.mods.B.HARBORS[side]; if (!h) return false; teleport("out", h); setTimeout(() => toast(ARRIVE4[side]), 600); return true; }
function fortCard() { return { title: "🏰 St. Augustine, 1565: the oldest city", body: "<p>On <b>September 8, 1565</b>, <b>Pedro Menéndez de Avilés</b> came ashore here with soldiers and settlers and founded <b>St. Augustine</b>. It is the oldest city founded by Europeans in the United States that people have lived in ever since: <b>42 years before Jamestown</b> and 55 years before the Pilgrims.</p><p>A Mass was said on the day they landed. Spain wanted the fort to guard its treasure fleets sailing home past Florida. Menéndez’s soldiers soon destroyed <b>Fort Caroline</b>, a French settlement to the north, and killed most of its men.</p><p>The first forts here were made of <b>wood</b>, like this one. The great stone <b>Castillo de San Marcos</b>, built of <b>coquina</b> (a rock made of tiny seashells), came much later, from <b>1672 to 1695</b>, and it still stands today.</p>" }; }
function timucuaCard() { return { title: "🌴 The Timucua people of Florida", body: "<p>The <b>Timucua</b> had lived in north Florida for thousands of years before the Spanish came. They lived in villages of round houses roofed with palmetto, farmed maize, beans and squash, and fished and hunted along the rivers and coast.</p><p>St. Augustine was founded beside the Timucua town of the chief <b>Seloy</b>, and the Spanish first set up camp in a large Timucua house. Spanish friars later built missions among the Timucua.</p><p>The honest history: war and new diseases from Europe struck the Timucua very hard. By the 1700s only a few hundred were left. Historians know about their language today partly because a friar, <b>Francisco Pareja</b>, wrote books in Timucua.</p>" }; }
function palaceCard() { return { title: "🏛️ Santa Fe and the Palace of the Governors", body: "<p>Around <b>1610</b>, New Mexico’s governor <b>Pedro de Peralta</b> founded <b>Santa Fe</b> (“holy faith”) as the capital of the Spanish province of New Mexico. The adobe <b>Palace of the Governors</b>, begun about then, is the oldest public building in the United States still in use. Look for the shady wooden <b>portal</b> (porch) along its front.</p><p>Santa Fe sat at the north end of the <b>Camino Real</b>, the Royal Road, about 1,600 miles long, to Mexico City.</p><p>The <b>Pueblo peoples</b> had farmed this land for centuries. In <b>1680</b>, led by <b>Popé</b>, they rose up against harsh Spanish rule, forced labor and attacks on their religion, and drove the Spanish out for 12 years. The Spanish returned in 1692. Today the Pueblos still live in their homelands.</p>" }; }
function adobeCard() { return { title: "🧱 How adobe bricks are made", body: "<p><b>Adobe</b> is earth and water mixed with straw, shaped into bricks in wooden molds and left to bake dry in the hot sun. Thick adobe walls stay cool on summer days and hold warmth on cold desert nights.</p><p>Pueblo builders had made earth walls for centuries, building them up layer by layer. The Spanish brought the <b>brick mold</b>, and both ways of building mixed into the style you still see in Santa Fe today.</p><p>The wooden beams that stick out of the walls are called <b>vigas</b>. They hold up the flat roof.</p>" }; }
function beaverCard() { return { title: "🦫 Why Europe wanted beaver", body: "<p>Why cross an ocean for beavers? <b>Hats!</b> Beaver underfur is covered in tiny barbs. When hatters pressed it with heat and moisture, the hairs locked together into a thick, waterproof <b>felt</b> that held its shape. Beaver felt hats were the height of fashion in Europe, and Europe’s own beavers had been hunted almost to the end.</p><p>Beavers are amazing engineers. They cut trees with their teeth (see the pointed stumps?), build <b>dams</b> of sticks and mud to make a pond, and live in a <b>lodge</b> whose door is underwater, safe from wolves.</p>" }; }
function furTradeCard() { return { title: "🤝 The fur trade: partners in the woods", body: "<p>The French were few, and the land was huge. So the fur trade was a partnership. <b>Wendat (Huron)</b>, <b>Algonquin</b> and <b>Innu</b> hunters trapped the beaver and traded the pelts for iron kettles, axes, knives, wool cloth and glass beads. Both sides wanted what the other had.</p><p>Bold young Frenchmen paddled deep into the interior to trade. They learned Native languages and canoe skills, and later they were called <b>coureurs des bois</b>, “runners of the woods.”</p><p>The trade had costs too: competition for beaver helped cause wars between nations, and European diseases traveled along the trade routes.</p>" }; }
function wendatCard() { return { title: "🏹 Champlain’s allies: the Wendat and Algonquin", body: "<p>Champlain knew New France could not survive without Native friends. He made alliances with the <b>Wendat (Huron)</b>, the <b>Algonquin</b> and the <b>Innu</b>, who came to Quebec to trade. Their bark-covered longhouses and birch-bark canoes are on the shore here.</p><p>In <b>1609</b> Champlain joined his allies in a battle against the <b>Mohawk</b> at the lake now named Lake Champlain. That made the <b>Haudenosaunee (Iroquois)</b> enemies of New France for many years.</p><p>In 1610 a young Frenchman, <b>Étienne Brûlé</b>, went to live with the Wendat to learn their language and ways, the first of many.</p>" }; }
function windmillCard() { return { title: "🌬️ The windmill and the Dutch trading town", body: "<p>The Dutch were famous millers, shipbuilders and traders. Within a few years of settling Manhattan they put up windmills to grind grain and saw timber, just like the mills back home in the Netherlands.</p><p>New Amsterdam was run by the <b>Dutch West India Company</b>, which wanted <b>trade</b>, above all beaver furs brought down the Hudson River. People came from many lands. A visiting priest wrote in 1643 that <b>18 languages</b> were spoken in the town!</p><p>That Dutch habit of welcoming many peoples and trading with everyone lived on when New Amsterdam later became <b>New York</b>.</p>" }; }
function manhattanCard() { return { title: "🏞️ Fort Amsterdam and Manhattan, 1626", body: "<p>In <b>1624</b> the first Dutch families arrived in New Netherland. In <b>1625</b> work began on <b>Fort Amsterdam</b> at the tip of Manhattan: walls of packed earth with four pointed corners, called <b>bastions</b>, so defenders could see along every wall.</p><p>In <b>1626</b> the colony’s director, <b>Peter Minuit</b>, traded goods worth <b>60 guilders</b> to <b>Lenape</b> (Munsee) people for Manhattan. (The famous “$24” came from a much later calculation.)</p><p>The Lenape probably understood the deal as sharing the land and its use, not giving it up forever, as the Dutch believed. Misunderstandings like this led to conflict later on.</p>" }; }
function goalsCard() {
  const a = ST().acts && ST().acts["s4-goals"], played = !!(a && a.plays);
  const body = (played ? "<p>You have sorted these crates before. Want to practice? Carry them again, or use the card version.</p>" : "<p>Spain, France and the Netherlands came to North America for different reasons. Each crate has a clue on its tag.</p>") +
    "<p>Carry each crate to the mat of the <b>empire that wanted it</b>: stand on the mat for a moment to set it down. The mats are laid out like a map. Facing north, <b>Spain</b> is on your left (west), <b>France</b> is ahead (north) and the <b>Netherlands</b> is on your right (east).</p>";
  return { title: "⚖️ What did each empire want?", body, btns: [{ t: "📦 " + (played ? "Carry the crates again" : "Carry the crates"), f: () => { closeCard(); sortStart("s4", "s4-goals"); } }, { t: "🗂️ Card version", f: () => { closeCard(); openPanel(() => window.ABRPG.runActivity("s4", "s4-goals", resume)); } }] };
}
function helpCardS4() {
  card({ title: "❔ How to explore the Three Empires", body: "<p>You are <b>" + esc(heroName()) + "</b>, exploring North America around <b>1610</b>, when three European empires were planting colonies. <b>Spain</b> wanted gold, converts and a guard for its treasure fleets; <b>France</b> wanted furs; the <b>Dutch</b> wanted trade. Each one met Native nations who had lived here for thousands of years. Soon the English would arrive too, and their colonies would grow the <b>self-government</b> that became America (that’s the next level!).</p><ul><li><b>Walk</b> with the arrow keys or WASD (or the joystick). <b>Space</b> or the ✋ button uses a glowing ring.</li><li><b>Gold</b> rings are new, <b>blue</b> are done, a <b>star</b> means 3 stars. The banner at the top names your next marker.</li><li>In real life these places are hundreds or thousands of miles apart. Here they are close together, but the directions are true: <b>north is ahead</b> when you start in St. Augustine, so <b>west is on your left</b>.</li><li>Cross the <b>St. Lawrence</b> by canoe at the landing. Read all <b>7 scrolls</b> to open the <b>palisade gate</b> for the Trial.</li></ul>" });
  W.seen.help4 = true; saveW();
}
// Level 4 banner: the unfinished marker in the station she stands in, else the lowest-numbered station with work left
// (nearest ring there); if that is across the St. Lawrence, the canoe ring on her bank. With nothing left: the gate.
function nextTargetS4() {
  const B = L.mods.B, rings = L.lvl.rings, S = B.STATIONS, byId = id => rings.find(r => r.def.id === id);
  if (SP.active && SP.sid === "s4") { const hm = SP.hintBin && L.lvl.mats.find(m => m.bin === SP.hintBin), cl = byId("s4-goals");
    return { def: { id: "s4-goals", station: "market", x: hm ? hm.x : cl.def.x, z: hm ? hm.z : cl.def.z, text: "Marker 5 · New Amsterdam: carry the crate to its empire’s mat" + (hm ? " (hint: the glowing mat)" : "") } }; }
  const north = z => z > B.riverZ(L.pos.x), meN = north(L.pos.z);
  const pick = pool => { let best = null, bd = 1e9; for (const r of pool) { const d = Math.hypot(r.def.x - L.pos.x, r.def.z - L.pos.z); if (d < bd) { bd = d; best = r; } } return best; };
  const cross = () => { const r = byId(meN ? "canoe-north" : "canoe-south"); return { def: { ...r.def, text: "Marker 4 · " + (meN ? "Paddle back across the St. Lawrence" : "Paddle across the St. Lawrence to Quebec") } }; };
  const todo = rings.filter(r => r.def.scored && r.state === "new");
  let best;
  if (!todo.length) best = byId("trial");
  else { const st = Object.keys(S).find(k => Math.hypot(L.pos.x - S[k].x, L.pos.z - S[k].z) < S[k].r + 3), inSt = st && todo.filter(r => r.def.station === st);
    if (inSt && inSt.length) best = pick(inSt); else { const n0 = Math.min(...todo.map(r => S[r.def.station].n)); best = pick(todo.filter(r => S[r.def.station].n === n0)); } }
  return best && north(best.def.z) !== meN ? cross() : best;
}

// v2.4 plaza puzzle: the Culture Clues Sort, played by carrying each clue bundle onto its region mat. It runs through
// ABRPG.worldSort, which scores with the card version's own finishActivity (same stars, plays, mistakes; no new save fields).
const SP = { active: false, h: null, queue: [], cur: null, onMat: null, carry: null, hintBin: null, sid: "s2", act: "s2-clues" };   // v2.5: also the Level 3 dock sort (sid / act)
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
function cluesCard() {
  const a = ST().acts && ST().acts["s2-clues"], played = !!(a && a.plays);
  const body = (played ? "<p>You have sorted these bundles before. Want to practice? Carry them again, or use the card version.</p>" : "<p>Traders brought these bundles from all over the continent. Each one has a <b>clue</b> on its tag.</p>") +
    "<p>Carry each bundle to the mat of the <b>region it comes from</b>: stand on the mat for a moment to set it down. The mats are laid out like a map: the northern regions are on the row nearer the market (<b>north</b>), and <b>west is on your left</b> when you face north.</p>";
  return { title: "🧺 Culture Clues: carry the bundles", body, btns: [{ t: "🧺 " + (played ? "Carry the bundles again" : "Carry the clue bundles"), f: () => { closeCard(); sortStart(); } }, actBtn2("s2-clues", "🗂️ Card version")] };
}
const actBtn2 = (id, label) => ({ t: label, f: () => { closeCard(); openPanel(() => window.ABRPG.runActivity("s2", id, resume)); } });
function sortStart(sid = "s2", act = "s2-clues") {
  const h = window.ABRPG.worldSort && window.ABRPG.worldSort(sid, act, resume); if (!h) { openPanel(() => window.ABRPG.runActivity(sid, act, resume)); return; }
  L.lvl.clearBundles(); for (const m of L.lvl.mats) m.glowOn = false;
  Object.assign(SP, { active: true, h, queue: h.items.slice(), cur: null, onMat: null, hintBin: null, sid, act });
  const m = L.lvl.mats.find(q => Math.abs(L.pos.x - q.x) < L.mods.B.MAT_HALF && Math.abs(L.pos.z - q.z) < L.mods.B.MAT_HALF); SP.onMat = m ? m.bin : null;   // standing on a mat: not a drop
  nextClue(true);
}
function carryLabel(text) {
  if (SP.carry) { L.lvl.scene.remove(SP.carry.lab); SP.carry.lab.material.map.dispose(); }
  const lab = L.mods.B.labelSprite(text, 3.8, SP.sid === "s3" ? "carry it to the right dock mat" : SP.sid === "s4" ? "carry it to the empire that wanted it" : "carry it to its region mat"); lab.renderOrder = 7; lab.material.depthTest = false; L.lvl.scene.add(lab);
  if (!SP.carry) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshLambertMaterial({ color: "#b08a5c", flatShading: true })); b.scale.set(1.2, 0.8, 1); b.userData.noMerge = true; L.lvl.scene.add(b); SP.carry = { lab, b }; }
  else SP.carry.lab = lab;
}
function carryHide() { if (!SP.carry) return; L.lvl.scene.remove(SP.carry.lab); L.lvl.scene.remove(SP.carry.b); SP.carry = null; }
function nextClue(first) {
  for (const m of L.lvl.mats) m.glowOn = false; SP.hintBin = null;
  SP.cur = SP.queue.shift() || null; if (!SP.cur) return;
  carryLabel("📦 " + SP.cur.t);
  toast((first ? "🧺 First bundle: " : "📦 Next bundle: ") + "<b>" + esc(SP.cur.t) + "</b>. " + (SP.sid === "s3" ? "Which way did it cross the ocean? Stand on that mat." : SP.sid === "s4" ? "Which empire wanted it? Stand on its mat." : "Stand on the mat for its region."));
}
function sortStep(dt) {
  SP.dt = dt;
  if (!SP.active || L.sid !== SP.sid) return;
  if (SP.carry) { SP.carry.lab.position.set(L.pos.x, L.pos.y + 3.0, L.pos.z); SP.carry.b.position.set(L.pos.x + Math.sin(L.yaw) * 0.32, L.pos.y + 0.95, L.pos.z + Math.cos(L.yaw) * 0.32); SP.carry.b.visible = SP.carry.lab.visible = true; }
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
    toast("🤔 <b>" + esc(cur.t) + "</b> doesn’t belong on the " + esc(r.bin) + " mat." + (r.hint ? " Hint: try the glowing mat, <b>" + esc(r.hintLabel || r.hint) + "</b>." : (SP.sid === "s3" ? " Think about where it first grew or lived, then try the other mat." : SP.sid === "s4" ? " Think about what each empire wanted most: gold and converts, furs and allies, or trade. Then try another mat." : " Think about what that region is like and try another mat.")));
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
    ? "<p>You have built this timeline before. The stones are safe now and show their dates as you cross.</p><p>Want to practice? Replay it on the stones, or use the card version.</p>"
    : "<p>Cross the river on the stepping stones <b>in time order</b>. Each row of stones is the next step in time, starting with the oldest event on this bank.</p><p>Read the two labels and step on the one that happened <b>first</b>. Step on a later one and you fall in the cold river and wash back to this bank. Right stones stay lit.</p>";
  const btns = [{ t: "🪨 " + (solved ? "Replay on the river stones" : "Start on the river stones"), f: () => { closeCard(); F.replay = true; fordNew(); F.armed = true; toast("🪨 Step on the stones from <b>oldest</b> to <b>newest</b>. Start at the row nearest you."); } }, actBtn("s1-timeline", "📓 Card version")];
  return { title: "📓 Timeline on the river stones", body, btns };
}
function fordLabelTex(top, bottom, tone) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 160; const x = c.getContext("2d");
  x.fillStyle = tone === "ok" ? "rgba(32,74,40,0.86)" : tone === "hint" ? "rgba(140,96,10,0.9)" : "rgba(40,30,22,0.82)";
  x.beginPath(); x.roundRect(6, 6, 500, 148, 26); x.fill(); x.strokeStyle = tone === "hint" ? "#ffd75e" : "rgba(255,236,200,0.75)"; x.lineWidth = 5; x.stroke();
  x.fillStyle = "#fff6e4"; x.textAlign = "center"; x.textBaseline = "middle";
  const fit = (txt, fs, min) => { x.font = "700 " + fs + "px system-ui, sans-serif"; while (x.measureText(txt).width > 470 && fs > min) { fs -= 2; x.font = "700 " + fs + "px system-ui, sans-serif"; } return fs; };
  // v2.4 QC: a long name with no date line wraps onto two lines instead of shrinking to an unreadable size
  x.font = "700 36px system-ui, sans-serif";
  if (!bottom && x.measureText(top).width > 470) {
    let cut = top.indexOf(" ("); if (cut < 0) { const mid = top.length / 2; let best = -1; for (let i = 0; i < top.length; i++) if (top[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; cut = best; }
    if (cut > 0) { const a = top.slice(0, cut).trim(), b = top.slice(cut).trim(); fit(a.length > b.length ? a : b, 42, 28); x.fillText(a, 256, 56); x.fillText(b, 256, 106); }
    else { fit(top, 46, 26); x.fillText(top, 256, 80); }
  } else { fit(top, 46, 26); x.fillText(top, 256, bottom ? 58 : 80); }
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
  el.hidden = false; L.cardOpen = true; clearHeld();
  el.querySelectorAll("[data-wb]").forEach(b => b.onclick = () => { const a = cardActs[+b.dataset.wb]; if (a && a.f) a.f(); });
  const first = el.querySelector("button"); if (first) first.focus({ preventScroll: true });
}
function closeCard() { const el = document.getElementById("w-card"); el.hidden = true; el.innerHTML = ""; L.cardOpen = false; clearHeld(); }   // v2.6: no walking off on return
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
const BACK = { s1: "🏕️ Back to Beringia", s2: "🔥 Back to the Council Fire", s3: "⛵ Back to the Voyage", s4: "🗺️ Back to the Three Empires" }, WALKNAME = { s1: "🚶 Walk Beringia", s2: "🚶 Walk Native Nations", s3: "🚶 Walk the Voyage of 1492", s4: "🚶 Walk the Three Empires" };
function helpCard() { if (L.sid === "s2") return helpCardS2(); if (L.sid === "s3") return helpCardS3(); if (L.sid === "s4") return helpCardS4(); card({ title: "❔ How to explore Beringia", body: "<p>You are <b>" + esc(heroName()) + "</b>, living in Beringia during the last Ice Age. Follow the worn path north, marker by marker.</p><ul><li><b>Walk:</b> WASD or arrow keys, or the joystick (touch).</li><li><b>Look around:</b> drag on the world.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap the ✋ button.</li><li>Gold rings are new, blue rings are done, and pale-gold rings have 3 ⭐. Gray rings are still locked.</li><li>The 🗂️ chip at the top switches back to the classic screens any time. Your progress is the same in both.</li></ul>" }); W.seen.help = true; saveW(); }
function heroName() { const p = ST() && ST().players && ST().players[L.sid]; return (p && p.name) || "Abigail"; }
// v2.6 phone HUD: the objective and era sit just below the topbar, whatever height it wraps to (one owner per strip)
function layoutHud() {
  if (L.phase !== "active") return; const tb = document.getElementById("topbar"), ob = document.getElementById("w-obj"), er = document.getElementById("w-era"); if (!ob || !er) return;
  const tbB = tb && tb.offsetParent !== null ? tb.getBoundingClientRect().bottom : 0, top = Math.max(8, tbB + 6);
  if (ob._top !== top) { ob.style.top = top + "px"; ob._top = top; }
  const tl = document.getElementById("w-tools"); if (tl) { const t2 = window.matchMedia("(max-width:600px)").matches ? "" : top + "px"; if (tl.style.top !== t2) tl.style.top = t2; }
  const oB = ob.getBoundingClientRect().bottom, et = Math.round(oB + 5); if (er._top !== et) { er.style.top = et + "px"; er._top = et; }
}
window.addEventListener("resize", () => setTimeout(layoutHud, 50));
function syncChips() {
  layoutHud();
  const mb = document.getElementById("w-mode"), back = document.getElementById("w-back"); if (!mb) return;
  mb.hidden = !!failed; mb.textContent = mode() === "walk" ? "🗂️ Classic screens" : WALKNAME[L.sid];
  if (back.textContent !== BACK[L.sid]) back.textContent = BACK[L.sid];
  back.hidden = !(mode() === "walk" && L.phase !== "active" && (L.phase === "panel" || isLvlScreen()));
  const ban = document.getElementById("w-banner");
  if (ban) { const show = mode() === "walk" && L.phase === "off" && !W.seenIntro && onMapScreen(); ban.hidden = !show;
    if (show && !ban.innerHTML) { ban.innerHTML = '<b>New in v2.6:</b> explore the Three Empires in 3D: Spanish St. Augustine and Santa Fe, French Quebec and Dutch New Amsterdam (plus the Voyage of 1492, the Native Nations and Beringia)! <button class="btn small gold" id="w-ban-go">🚶 Walk Beringia</button><button class="btn small alt" id="w-ban-no">🗂️ Keep classic screens</button>'; document.getElementById("w-ban-go").onclick = () => { W.seenIntro = true; saveW(); ban.hidden = true; setMode("walk", true); }; document.getElementById("w-ban-no").onclick = () => { W.seenIntro = true; saveW(); ban.hidden = true; setMode("classic"); }; } }
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
      if (kind === "trial" && sid === "s4") {
        if (L.bypass || L.phase === "off") return false;
        if (L.sid !== "s4") { enterLevel("s4"); return true; }
        resume(); if (gateOpenS4()) setTimeout(() => toast("🚪 The Trial waits at the <b>palisade gate</b>, marker 7. Follow the arrow!"), 50); else setTimeout(() => card(gateLockedCard()), 50);
        return true;
      }
      if (kind === "trial" && sid === "s3") {
        if (L.bypass || L.phase === "off") return false;
        if (L.sid !== "s3") { enterLevel("s3"); return true; }
        resume(); if (stormOpen()) setTimeout(() => toast("⛈️ The Trial is aboard the <b>Niña</b> at Hispaniola, marker 8. Follow the arrow!"), 50); else setTimeout(() => card(stormLockedCard()), 50);
        return true;
      }
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
    const [B, H, G, T, SPK, MA] = await Promise.all([import(sid === "s4" ? "./world/empires.js" : sid === "s3" ? "./world/voyage.js" : sid === "s2" ? "./world/nations.js" : "./world/beringia.js"), import("./world/hero3d.js"), import("./world/gfx.js"), import("./world/toon.js"), import("./world/sparks.js"), import("./world/merge-ao.js")]);
    if (!L.mods) L.mods = { B, H, G };
    const rings = sid === "s4" ? ringDefsS4(B) : sid === "s3" ? ringDefsS3(B) : sid === "s2" ? ringDefsS2(B) : ringDefs(B);
    const aoHolder = new THREE.Group(); aoHolder.name = "contact-ao"; aoHolder.userData.noMerge = true;   // the AO helper adds its mesh here
    const mergeAO = MA.createMergeAO(THREE, aoHolder, { groundH: B.groundH });
    let lvl, cave;
    if (sid === "s2" || sid === "s3" || sid === "s4") {
      const SS = window.ABRPG.sectionById(sid), clues = SS && (SS.activities || []).find(a => a.id === (sid === "s4" ? "s4-goals" : sid === "s3" ? "s3-exchange" : "s2-clues")), matLabels = {};
      if (clues) for (const b of clues.bins) matLabels[b.id] = (b.icon ? b.icon + " " : "") + b.label;
      lvl = sid === "s4" ? B.buildEmpires({ mergeAO, rings, matLabels }) : sid === "s3" ? B.buildVoyage({ mergeAO, rings, matLabels }) : B.buildNations({ mergeAO, rings, matLabels });
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
    // v2.6 graphics pass 1: natural backdrop, ground colour variation, clouds, plants and water ripples for every level (world/scenery.js,
    // its own seeded random so the level layouts never move; no colliders, no save data). A failure only skips the extras.
    try { const SC = await import("./world/scenery.js"), sc = SC.enhanceScenery({ lvl, B, sid, rings }), up = lvl.update;
      lvl.update = (dt, pos) => { up.call(lvl, dt, pos); sc.update(dt); }; lvl.scenery = sc; } catch (e) { console.warn("[world] scenery extras skipped", e); }
    // v2.6.2 graphics pass 2: softer ring light, labels that fade near the camera, a per-era light grade and drifting motes
    // (world/polish.js). While QC freezes the effects (FX.frozen) the level's own animation steps with dt 0.
    try { const PO = await import("./world/polish.js"), po = PO.enhancePolish({ lvl, sid, renderer, getCam: () => L.cam, getFocus: () => L.pos, groundH: B.groundH }), up2 = lvl.update;
      lvl.update = (dt, pos) => { const d = FX.frozen != null ? 0 : dt; up2.call(lvl, d, pos); po.update(d); }; lvl.polish = po;
      if (FX.frozen != null) { po.freeze(FX.frozen); if (lvl.scenery && lvl.scenery.setTime) lvl.scenery.setTime(FX.frozen); } } catch (e) { console.warn("[world] polish skipped", e); }
    LV[sid] = { B, lvl, cave, sparks, gfx, rings };
    useLevel(sid);
    buildHero();
    L.built = true;
  })();
  try { await LVBUILD[sid]; useLevel(sid); return true; } catch (e) { console.error("[world] build failed", e); LVBUILD[sid] = null; fail("build", e); return false; }
}
function gearArt() {
  const S = ST(), it = (window.ABRPG && window.ABRPG.items) || {}, out = [];
  // era gear only: Ice Age gear in Beringia; in the Native Nations the gear of Sections 1–2 (v2.4). In 1492 Spain she wears
  // a wool dress, so only the Section 3 navigator's gear shows there (v2.5): no stone spear or buffalo robe aboard a caravel.
  const ok = L.sid === "s4" ? ["s4"] : L.sid === "s3" ? ["s3"] : L.sid === "s2" ? ["s1", "s2"] : ["s1"];
  for (const sl of Object.keys(S.equip || {})) { const k = S.equip[sl], i = it[k]; if (i && ok.includes(i.section) && i.art) out.push({ art: i.art, color: i.color }); }
  return out;
}
function buildHero() {
  const p = ST().players && (ST().players[L.sid] || ST().players.s1), art = gearArt(), outfit = L.sid === "s3" || L.sid === "s4" ? "wool" : "hide", key = JSON.stringify([p && p.gender, art, outfit]);
  if (L.hero && L.heroKey === key) { const sc = L.zone === "cave" ? L.cave.scene : L.lvl.scene; if (L.hero.root.parent !== sc) sc.add(L.hero.root); return; }
  const parent = L.hero && L.hero.root.parent; if (L.hero) { if (parent) parent.remove(L.hero.root); L.hero.dispose(); }
  L.hero = L.mods.H.createHero({ gender: p && p.gender === "boy" ? "boy" : "girl", gearArt: art, outfit }); L.heroKey = key;
  L.hero.root.position.copy(L.pos); L.hero.root.rotation.y = L.yaw;
  (L.zone === "cave" ? L.cave.scene : L.lvl.scene).add(L.hero.root);
  if (L.gfx) L.gfx.inkPass();
}
function placeStart(zone) {
  const B = L.mods.B;
  if (L.sid === "s2") { L.zone = "out"; L.pos.set(0, B.groundH(0, -8), -8); L.yaw = 0; return; }   // south of the council fire, facing north
  if (L.sid === "s4") { L.zone = "out"; L.pos.set(-56, B.groundH(-56, -56), -56); L.yaw = 0; return; }   // St. Augustine, facing north into town
  if (L.sid === "s3") { L.zone = "out"; L.pos.set(-38, B.groundH(-38, 44), 44); L.yaw = 0; return; }   // Palos square, facing north to the church of San Jorge
  if (zone === "cave") { L.zone = "cave"; L.pos.set(B.CAVE_X, 0, 5); L.yaw = Math.PI; }
  else { L.zone = "out"; L.pos.set(0, B.groundH(0, -4), -4); L.yaw = 0; }
}
async function enterLevel(sid = L.sid) {
  const from = L.sid; if (L.phase !== "off" && from !== sid) saveWorldPos();
  if (!(await ensureBuilt(sid))) { window.ABRPG.enterSection(sid, true); return; }
  const B = L.mods.B;
  window.ABRPG.closeModal && document.getElementById("modal") && !document.getElementById("modal").classList.contains("hidden") && window.ABRPG.closeModal();
  if ((sid === "s2" || sid === "s3" || sid === "s4") && (L.phase === "off" || from !== sid)) {
    // spawn: a Trial in progress → the meeting ground (s3: Hispaniola harbor); else her saved spot (if valid) or the start
    const a = W.at[sid], t = B.RING_AT.trial;
    if (trialActive(sid) && sid === "s3") { const h = B.HARBORS.hisp; L.zone = "out"; L.pos.set(h.x, 0, h.z); L.yaw = h.yaw; setTimeout(() => toast("⛈️ Your Trial is waiting. Step into the ring by the Niña to resume."), 300); }
    else if (trialActive(sid) && sid === "s4") { L.zone = "out"; L.pos.set(t[0], 0, t[1] - 4); L.yaw = 0; setTimeout(() => toast("🚪 Your Trial is waiting. Step into the ring in the palisade gate to resume."), 300); }
    else if (trialActive(sid)) { L.zone = "out"; L.pos.set(t[0], 0, t[1] - 4); L.yaw = 0; setTimeout(() => toast("⚔️ Your Trial is waiting. Step into the Elders’ ring at the meeting ground to resume."), 300); }
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
  document.getElementById("w-era").textContent = sid === "s4" ? "Section 4 · Three Empires c. 1610 · St. Augustine 1565, Quebec 1608, Santa Fe about 1610, New Amsterdam 1624–26" : sid === "s3" ? "Section 3 · The Voyage of 1492 · Palos, Spain to the Caribbean, 1492–1493" : sid === "s2" ? "Section 2 · Native Nations of North America · about 1000 to the 1500s" : "Section 1 · Ice Age Beringia · more than 14,000 years ago";
  setPhase("active");
  if (!W.seen[sid === "s4" ? "help4" : sid === "s3" ? "help3" : sid === "s2" ? "help2" : "help"]) setTimeout(() => { if (L.phase === "active" && !L.cardOpen) helpCard(); }, 400);
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
  const was = L.phase; L.phase = p; if (p !== "panel") L.inMarket = false; if (was !== p) clearHeld();   // v2.6: held keys / stick never carry across a panel
  const stage = document.getElementById("stage"), hud = document.getElementById("w-hud");
  document.body.classList.toggle("walking", p === "active");
  document.body.classList.toggle("world-linked", p === "panel");
  if (stage) stage.hidden = p === "active";
  if (hud) hud.hidden = p !== "active";
  if (p === "active") { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = (L.lvl && L.lvl.polish && L.lvl.polish.exposure) || 1.05; if (L.gfx) L.gfx.apply(); L.dirty = true; L.clock = makeClock(); if (L.built && L.lvl) { try { refreshRings(); } catch (e) { } L._refT = 0.5; }  requestAnimationFrame(layoutHud); }   // v2.6: ring states are right on the first frame back
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
  clearTransients();   // v2.6.2
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
document.addEventListener("visibilitychange", () => { if (document.hidden) clearHeld(); });
const joy = { id: null, x: 0, y: 0, cx: 0, cy: 0 };
// v2.6.2 QC: FX.frozen pins clouds, ripples, motes and the levels' own animation to one moment, so before/after shots match
const FX = { frozen: null };
function freezeFx(t) { FX.frozen = (t === false || t == null) ? null : (typeof t === "number" ? t : 10);
  for (const k of Object.keys(LV)) { const v = LV[k].lvl; if (v.polish) v.polish.freeze(FX.frozen); if (v.scenery && v.scenery.setTime && FX.frozen != null) v.scenery.setTime(FX.frozen); }
  if (L.sparks && L.sparks.clear) try { L.sparks.clear(); } catch (e) { } L.dirty = true; return FX.frozen; }
// v2.6.2: clear-transients helper: hide a leftover toast (it would otherwise sit over a new level or a QC shot for up to 3.2 s)
function clearTransients() { const t = document.getElementById("toast"); if (t) t.classList.add("hidden"); }
function clearHeld() { keys.clear(); joy.x = 0; joy.y = 0; }   // hoisted; only called from events / phase changes after init
const drag = { id: null, x: 0 };
function wireTouch() {
  const j = document.getElementById("w-joy"), knob = document.getElementById("w-knob");
  j.addEventListener("pointerdown", e => { L.touch = true; joy.id = e.pointerId; const r = j.getBoundingClientRect(); joy.cx = r.left + r.width / 2; joy.cy = r.top + r.height / 2; j.setPointerCapture(e.pointerId); moveJoy(e); e.preventDefault(); });
  const moveJoy = e => { if (e.pointerId !== joy.id) return; let dx = e.clientX - joy.cx, dy = e.clientY - joy.cy; const R = 48, d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } knob.style.transform = `translate(${dx}px,${dy}px)`; const m = Math.hypot(dx, dy) / R; const k = m < 0.12 ? 0 : (m - 0.12) / 0.88 / (m || 1); joy.x = dx / R * k; joy.y = -dy / R * k; };
  j.addEventListener("pointermove", moveJoy);
  const end = e => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = "";
    if (j.classList.contains("float")) { j.classList.remove("float"); j.style.left = j.style.top = j.style.bottom = ""; } };
  // v2.6.2 floating joystick: a thumb that lands anywhere in the lower-left of the screen gets the stick right under it
  const floatJoy = e => { if (e.pointerType !== "touch" || joy.id != null || L.phase !== "active" || L.cardOpen) return false;
    if (e.clientX > window.innerWidth * 0.42 || e.clientY < window.innerHeight * 0.4) return false;
    L.touch = true; document.body.classList.add("touch"); joy.id = e.pointerId; j.classList.add("float"); j.style.left = (e.clientX - 64) + "px"; j.style.top = (e.clientY - 64) + "px"; j.style.bottom = "auto";
    joy.cx = e.clientX; joy.cy = e.clientY; knob.style.transform = ""; try { canvas.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); return true; };
  j.addEventListener("pointerup", end); j.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerdown", e => { if (L.phase !== "active") return; if (floatJoy(e)) return; if (e.pointerType === "touch") L.touch = true; drag.id = e.pointerId; drag.x = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => { if (e.pointerId === joy.id) { moveJoy(e); return; } if (e.pointerId !== drag.id) return; const dx = e.clientX - drag.x; drag.x = e.clientX; L.camYaw = wrapA(L.camYaw - dx * 0.008); L.dz.snap(L.camYaw); L.manualT = 2.5; });
  const dend = e => { end(e); if (e.pointerId === drag.id) drag.id = null; }; canvas.addEventListener("pointerup", dend); canvas.addEventListener("pointercancel", dend);
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
  if (L.sid === "s3") return nextTargetS3();
  if (L.sid === "s4") return nextTargetS4();
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
const LOOK_UP = 2.0;
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
  L.cam.position.copy(L.camPos); L.cam.lookAt(tgt.x, tgt.y + LOOK_UP * Math.min(1, len / 7), tgt.z);   // aim a little above her head: more of the land ahead and tall landmarks stay in frame
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
    const st = L.mods.B.STATIONS[tg.def.station]; const txt = tg.def.text ? tg.def.text : (tg.def.id === "gate" && !hasCloak()) ? "Earn your Fur Cloak, then cross the glacier pass" : (() => { const lb = tg.def.label(); return "Marker " + st.n + " · " + (lb.startsWith(st.label) ? lb : st.label + ": " + lb); })();   // v2.6: no "St. Augustine, 1565: St. Augustine, 1565…" doubling
    const el = document.getElementById("w-obj-t"); if (el.textContent !== txt) { el.textContent = txt; const ob = el.parentNode, era = document.getElementById("w-era"); if (era) era.style.top = (ob.offsetTop + ob.offsetHeight + 4) + "px"; }
  }
  L.saveT -= dt; if (L.saveT <= 0) { L.saveT = 2; saveWorldPos(); }
}
function renderLevel() {
  // v2.4 QC: the 500 m sky dome sat past the 420 m far plane, so looking up showed clipped black/grey wedges; keep it centred on the camera, inside the far plane
  const sky = L.zone !== "cave" && L.lvl && L.lvl.sky; if (sky) { sky.position.copy(L.cam.position); sky.scale.setScalar(0.76); sky.frustumCulled = false; }
  renderer.render(L.zone === "cave" ? L.cave.scene : L.lvl.scene, L.cam);
}

// ---- main loop ----
const clock = makeClock();
let fpsN = 0, fpsT = 0;
window.addEventListener("resize", resize); resize();
(function loop() {
  requestAnimationFrame(loop);
  const t = clock.tick();
  try {
    if (document.hidden) return;   // v2.6: nothing renders while the tab is hidden (the clock clamps the step on return)
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
  readL: sid => (W.read[sid] || []).slice(), stormOpen: () => stormOpen(), boardOpen: () => boardOpen(), sail: (k) => sailTo(k), gateOpenS4: () => gateOpenS4(), canoe: (side) => canoeTo(side),
  pathDist: (x, z) => (L.mods && L.mods.B.pathDist ? L.mods.B.pathDist(x, z) : null), meetOpen: () => meetOpen(),
  setMode: (m) => setMode(m), fail: (w) => fail(w || "test"), gateOpen: () => !!(L.built && hasCloak()), caveOpen: () => caveOpen(), read: () => W.read.s1.slice(), tracks: () => W.season.tracks.slice(),
  info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, dpr: renderer.getPixelRatio(), gfx: L.gfx && L.gfx.mode, deg: L.gfx && L.gfx.st.deg, aa: AA, soft: SOFT_GL, bg: bgStats }),
  _dbg: () => ({ L, renderer, THREE }),
  freezeFx: t => freezeFx(t), clearTransients: () => clearTransients(),
  qc: (t = 10) => { freezeFx(t); clearTransients(); return true; },   // v2.6.2: one call before every QC shot
  polish: () => (L.built && L.lvl.polish ? { parts: L.lvl.polish.parts, exposure: L.lvl.polish.exposure, frozen: FX.frozen, labels: L.lvl.polish.labels.map(s => +s.material.opacity.toFixed(2)) } : null),
  get joy() { const j = document.getElementById("w-joy"); return { id: joy.id, x: joy.x, y: joy.y, float: j.classList.contains("float"), left: j.style.left, top: j.style.top }; },
  bgStats, quiet: false
};
