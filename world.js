// world.js — v2.2–v2.8 3D layer for American Beginnings RPG.
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
  const d = { ver: 1, mode: null, zone: "out", x: null, z: null, yaw: 0, seenIntro: false, season: { tracks: [] }, read: { s1: [], s2: [], s3: [], s4: [], s5: [], s6: [], s7: [] }, seen: {}, at: {} };
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
  if (w.read && Array.isArray(w.read.s5)) d.read.s5 = [...new Set(w.read.s5.filter(i => Number.isInteger(i) && i >= 0 && i < 10))].sort((a, b) => a - b);   // v2.7: Section 5 has 10 scrolls
  if (w.read && Array.isArray(w.read.s6)) d.read.s6 = [...new Set(w.read.s6.filter(i => Number.isInteger(i) && i >= 0 && i < 9))].sort((a, b) => a - b);   // v2.8: Section 6 has 9 scrolls
  if (w.read && Array.isArray(w.read.s7)) d.read.s7 = [...new Set(w.read.s7.filter(i => Number.isInteger(i) && i >= 0 && i < 9))].sort((a, b) => a - b);   // v3.0: Section 7 has 9 scrolls
  if (w.seen && typeof w.seen === "object" && !Array.isArray(w.seen)) for (const k of ["sign", "journey", "gate", "help", "help2", "kiva", "mound", "chunkey", "help3", "royal", "perez", "stars", "sails", "ships", "rudder", "taino", "after", "wreck", "sail-canary", "sail-ss", "sail-hisp", "help4", "fort", "timucua", "palace", "adobe", "beaver", "furtrade", "wendat", "windmill", "manhattan", "help5", "croatoan", "ships", "fort5", "starving", "assembly", "tobacco", "powhatan", "mayship", "plymouth", "colonies", "wampanoag", "cornhills", "help6", "rice", "indigo", "port6", "capitol", "trade6", "whitefield", "library", "penn", "hornbook", "townmeeting", "joinordie", "help7", "cabin", "furtrade7", "necessity", "duquesne", "braddock", "hendrick", "snake7", "wolfe", "plains"]) if (w.seen[k] === true) d.seen[k] = true;
  const a2 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s2 : null;   // Native Nations bounds (world/nations.js BOUNDS)
  if (a2 && typeof a2 === "object" && Number.isFinite(a2.x) && Number.isFinite(a2.z) && a2.x > -80 && a2.x < 86 && a2.z > -66 && a2.z < 70) d.at.s2 = { x: a2.x, z: a2.z, yaw: Number.isFinite(a2.yaw) ? wrapA(a2.yaw) : 0 };
  const a3 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s3 : null;   // Voyage of 1492 bounds (world/voyage.js BOUNDS)
  if (a3 && typeof a3 === "object" && Number.isFinite(a3.x) && Number.isFinite(a3.z) && a3.x > -92 && a3.x < 92 && a3.z > -72 && a3.z < 92) d.at.s3 = { x: a3.x, z: a3.z, yaw: Number.isFinite(a3.yaw) ? wrapA(a3.yaw) : 0 };
  const a4 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s4 : null;   // Three Empires bounds (world/empires.js BOUNDS)
  if (a4 && typeof a4 === "object" && Number.isFinite(a4.x) && Number.isFinite(a4.z) && a4.x > -68 && a4.x < 92 && a4.z > -72 && a4.z < 63) d.at.s4 = { x: a4.x, z: a4.z, yaw: Number.isFinite(a4.yaw) ? wrapA(a4.yaw) : 0 };
  const a5 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s5 : null;   // Jamestown and Plymouth bounds (world/colonies.js BOUNDS)
  if (a5 && typeof a5 === "object" && Number.isFinite(a5.x) && Number.isFinite(a5.z) && a5.x > -70 && a5.x < 70 && a5.z > -72 && a5.z < 70) d.at.s5 = { x: a5.x, z: a5.z, yaw: Number.isFinite(a5.yaw) ? wrapA(a5.yaw) : 0 };
  const a6 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s6 : null;   // Thirteen Colonies bounds (world/thirteen.js BOUNDS)
  if (a6 && typeof a6 === "object" && Number.isFinite(a6.x) && Number.isFinite(a6.z) && a6.x > -70 && a6.x < 70 && a6.z > -72 && a6.z < 70) d.at.s6 = { x: a6.x, z: a6.z, yaw: Number.isFinite(a6.yaw) ? wrapA(a6.yaw) : 0 };
  const a7 = w.at && typeof w.at === "object" && !Array.isArray(w.at) ? w.at.s7 : null;   // Frontier bounds (world/frontier.js BOUNDS)
  if (a7 && typeof a7 === "object" && Number.isFinite(a7.x) && Number.isFinite(a7.z) && a7.x > -70 && a7.x < 70 && a7.z > -72 && a7.z < 90) d.at.s7 = { x: a7.x, z: a7.z, yaw: Number.isFinite(a7.yaw) ? wrapA(a7.yaw) : 0 };
  return d;
}
function saveW() { try { localStorage.setItem(WKEY, JSON.stringify(W)); } catch (e) { } }
let failed = !webgl2 ? "no-webgl2" : null;
const mode = () => (failed ? "classic" : (W.mode || "walk"));
window.addEventListener("ab:lesson", e => { const d = e.detail || {}, r = W.read[d.sid]; if (r && Number.isInteger(d.i) && !r.includes(d.i)) { r.push(d.i); r.sort(); saveW(); } });

const L = { sid: "s1", phase: "off", built: false, building: null, cam: null, mods: null, dirty: true, zone: "out", pos: new THREE.Vector3(), yaw: 0, vel: 0, wade: 0, hintT: 0, saveT: 0, fps: { n: 0, t: 0, last: 0 }, ctxLost: 0, userMap: false, bypass: false };
const S1 = () => window.ABRPG && window.ABRPG.sectionById("s1");
const WALK = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];                                       // sections with a walkable level
const CUR = () => window.ABRPG && window.ABRPG.sectionById(L.sid);
const ST = () => window.ABRPG && window.ABRPG.state();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const toast = m => window.ABRPG && window.ABRPG.toast(m);

// ---- ring definitions (marker order: camp → herds → steppe → hearth → ford → gate → corridor → cave) ----
const SRC_LESSON = { s1: [[7, "src1"]], s2: [[6, "src2"]], s3: [[6, "src3"]], s4: [[6, "src4"]], s5: [[8, "src5a"], [9, "src5b"]], s6: [[7, "src6a"], [8, "src6b"]], s7: [[7, "src7a"], [8, "src7b"]] };      // a primary-source scroll also counts once its questions were played (v2.7: Section 5 has two)
const scrollRead = (sid, i) => W.read[sid].includes(i) || (SRC_LESSON[sid] || []).some(([j, t]) => i === j && !!(ST().srcQ && ST().srcQ[t] && ST().srcQ[t].plays > 0));
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
  card({ title: "❔ How to explore the Native Nations", body: "<p>You are <b>" + esc(heroName()) + "</b>, visiting the homelands of Native nations of North America, about 1000 to the 1500s. In real life these regions are hundreds or thousands of miles apart. Here they sit around one council fire so you can walk to each, but the directions are true: <b>north is ahead</b> when you start, so <b>west is on your left</b>, just like on a map. The painted compass by the fire shows it.</p><ul><li><b>Walk:</b> <b>W</b> forward, <b>Z</b> back, <b>A</b> left, <b>S</b> right (the way the camera faces), or the arrow keys, or the joystick (touch). <b>Look:</b> drag on the world.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap ✋.</li><li>Gold rings are new, blue rings are done, pale-gold rings have 3 ⭐, gray rings are locked.</li><li>The banner at the top points to the nearest marker you still need. The Elders’ Trial is at the <b>tree-ring meeting ground</b> once you have read all 7 scrolls.</li><li>The 🗂️ chip at the top switches to the classic screens any time. Your progress is the same in both.</li></ul>" });
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
  card({ title: "❔ How to sail the Voyage of 1492", body: "<p>You are <b>" + esc(heroName()) + "</b>, in the port of <b>Palos, Spain</b>, in 1492. Columbus’s voyage took courage, skill and the daring of ordinary sailors. It opened the Atlantic, and more than a century later that ocean road carried English settlers to the colonies where <b>American self-government</b> took root. A good historian admires the courage and tells the whole truth, including what it cost the Taíno.</p><ul><li><b>Walk:</b> <b>W</b> forward, <b>Z</b> back, <b>A</b> left, <b>S</b> right (the way the camera faces), or the arrow keys, or the joystick (touch). <b>Look:</b> drag on the world. <b>North is ahead</b> when you start, so <b>west is on your left</b>.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap ✋.</li><li>Explore Palos, then board at the <b>pier</b> (⛵ ring). The sail rings carry you to the Canaries, San Salvador and Hispaniola. The ocean is shrunk so you can cross it in a moment.</li><li>Gold rings are new, blue rings are done, pale-gold rings have 3 ⭐, gray rings are locked. The banner points to your next marker.</li><li>The Trial, the storm on the way home, waits by the Niña at Hispaniola once you have read all 7 scrolls.</li><li>The 🗂️ chip at the top switches to the classic screens any time. Your progress is the same in both.</li></ul>" });
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
  card({ title: "❔ How to explore the Three Empires", body: "<p>You are <b>" + esc(heroName()) + "</b>, exploring North America around <b>1610</b>, when three European empires were planting colonies. <b>Spain</b> wanted gold, converts and a guard for its treasure fleets; <b>France</b> wanted furs; the <b>Dutch</b> wanted trade. Each one met Native nations who had lived here for thousands of years. Soon the English would arrive too, and their colonies would grow the <b>self-government</b> that became America (that’s the next level!).</p><ul><li><b>Walk:</b> <b>W</b> forward, <b>Z</b> back, <b>A</b> left, <b>S</b> right (the way the camera faces), or the arrow keys (or the joystick). <b>Space</b> or the ✋ button uses a glowing ring.</li><li><b>Gold</b> rings are new, <b>blue</b> are done, a <b>star</b> means 3 stars. The banner at the top names your next marker.</li><li>In real life these places are hundreds or thousands of miles apart. Here they are close together, but the directions are true: <b>north is ahead</b> when you start in St. Augustine, so <b>west is on your left</b>.</li><li>Cross the <b>St. Lawrence</b> by canoe at the landing. Read all <b>7 scrolls</b> to open the <b>palisade gate</b> for the Trial.</li></ul>" });
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

// ---- v2.7 Level 5 (Jamestown and Plymouth): Roanoke 1587 → James Fort 1607 → the tobacco fields → Cape Cod Harbor 1620 →
// Plymouth → a Wampanoag homesite → the fort-meetinghouse (Trial). The James River is crossed by ship (the "Sail" rings fade
// her across; nothing is saved but at.s5). Info cards mark W.seen like the other levels; no new progress-save fields.
function ringDefsS5(B) {
  const A = B.RING_AT, at = (id, o) => ({ ...o, x: A[id][0], z: A[id][1] });
  const info = (id, station, icon, title, cardFn) => at(id, { id, station, icon, scored: true, label: () => title, act: () => { W.seen[id] = true; saveW(); card(cardFn()); }, state: () => W.seen[id] ? "done" : "new" });
  const L5 = (id, i, st) => lessonRing("s5-" + id, i, A[id][0], A[id][1], st, "s5");
  const A5 = (id, actId, icon, title, st) => actRing("s5-" + id, actId, icon, title, A[id][0], A[id][1], st, "s5");
  const ship = (side, station) => at("ship-" + side, { id: "ship-" + side, station, icon: "⛵", label: () => side === "south" ? "Sail north and up the James River to James Fort" : "Sail back to Roanoke Island", act: () => card(shipCardS5(side)), state: () => "done" });
  return [
    L5("l0", 0, "roanoke"), info("croatoan", "roanoke", "🪵", "CROATOAN: the Lost Colony", croatoanCard), ship("south", "roanoke"),
    ship("north", "jamestown"), info("ships", "jamestown", "⛵", "The three ships of 1607", ships5Card), A5("jamestown", "s5-jamestown", "🏰", "Jamestown Survival", "jamestown"),
    L5("l1", 1, "jamestown"), info("fort5", "jamestown", "🔺", "James Fort: a triangle of logs", jfortCard), L5("l9", 9, "jamestown"), info("starving", "jamestown", "🥀", "The Starving Time, 1609–1610", starvingCard),
    at("market", { id: "market", station: "jamestown", icon: "🛍️", label: () => "The Jamestown Storehouse", act: () => openPanel(() => { L.inMarket = true; window.ABRPG.market("m4"); }), state: () => "done" }),
    info("assembly", "jamestown", "🏛️", "The General Assembly, July 30, 1619", assemblyCard), L5("l7", 7, "jamestown"),
    L5("l2", 2, "fields"), L5("l3", 3, "fields"), info("tobacco", "fields", "🌿", "John Rolfe’s tobacco", tobaccoCard), info("powhatan", "fields", "🏹", "The Powhatan people", powhatanCard),
    L5("l4", 4, "mayflower"), A5("compact", "s5-compact", "📜", "Draft and sign the Mayflower Compact", "mayflower"), L5("l8", 8, "mayflower"), info("mayship", "mayflower", "⛵", "The Mayflower, 1620", mayshipCard),
    L5("l5", 5, "plymouth"), info("plymouth", "plymouth", "🏡", "Plymouth’s first winter", plymouthCard), info("colonies", "plymouth", "⚖️", "Two colonies, two beginnings", coloniesCard),
    A5("squanto", "s5-squanto", "🌽", "Talk with Tisquantum (Squanto)", "wampanoag"), info("wampanoag", "wampanoag", "🏠", "The Wampanoag, People of the First Light", wampanoagCard), info("cornhills", "wampanoag", "🌱", "The Three Sisters: corn, beans and squash", cornhillsCard),
    L5("l6", 6, "gate"), A5("geomap", "s5-geomap", "🧭", "Map the First Colonies", "gate"), A5("timeline", "s5-timeline", "📓", "Timeline of Jamestown and Plymouth", "gate"),
    at("trial", { id: "trial", station: "gate", icon: "⚔️", label: () => trialLabelS5(), act: () => gateOpenS5() ? openPanel(() => { L.bypass = true; try { window.ABRPG.trial("s5"); } finally { L.bypass = false; } }) : card(gateLockedCardS5()), state: () => !gateOpenS5() ? "locked" : (sec("s5").completed ? "star" : "new") })
  ];
}
const S5_ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const missingS5 = () => S5_ALL.filter(i => !scrollRead("s5", i));
const gateOpenS5 = () => missingS5().length === 0 || (sec("s5").attempts || 0) > 0 || !!sec("s5").completed || trialActive("s5");
function trialLabelS5() { const st = sec("s5"); if (trialActive("s5")) return "Resume the Trial at the fort-meetinghouse"; if (st.completed) return "The fort-meetinghouse Trial (mastered " + st.bestPct + "%) — try again"; return "Enter the fort-meetinghouse: the Trial (" + ((window.GAME_CONTENT && GAME_CONTENT.passPercent) || 95) + "% to master)"; }
function gateLockedCardS5() { return { title: "🏛️ The fort-meetinghouse", body: "<p>Plymouth’s fort on the hill was also its meetinghouse, where the colonists met to worship and to govern themselves. Its door opens for the Trial once you have read <b>all 10 scrolls</b> of Jamestown and Plymouth. Still to read:</p>", btns: missingS5().map(i => lessonBtnS("s5", i)) }; }
function shipCardS5(side) {
  if (side === "north") return { title: "⛵ Back to Roanoke", body: "<p>Ready to sail back to <b>Roanoke Island</b>, where John White’s colony vanished in the 1580s?</p>", btns: [{ t: "⛵ Sail to Roanoke Island", f: () => { closeCard(); shipToS5("south"); } }] };
  return { title: "⛵ North to the James River", body: "<p>Roanoke failed, but England did not give up. Twenty years later, in <b>1607</b>, three ships of the <b>Virginia Company of London</b> sailed into Chesapeake Bay and up a broad river the colonists named the <b>James</b>, for King James I.</p><p>In real life that is a voyage of about 150 miles north along the coast. Here it is a short sail.</p>", btns: [{ t: "⛵ Sail up the James River", f: () => { closeCard(); shipToS5("north"); } }] };
}
const ARRIVE5 = {
  north: "⚓ James Fort, 1607. On <b>May 14, 1607</b>, about 104 English men and boys came ashore here to build the first lasting English colony in America.",
  south: "⛵ Roanoke Island, 1587: the Lost Colony."
};
function shipToS5(side) { const h = L.mods.B.HARBORS[side]; if (!h) return false; teleport("out", h); setTimeout(() => toast(ARRIVE5[side]), 600); return true; }
function croatoanCard() { return { title: "🪵 CROATOAN: the Lost Colony", body: "<p>In <b>1587</b>, about <b>115</b> English men, women and children settled on <b>Roanoke Island</b>, in today’s North Carolina, with Governor <b>John White</b>. On <b>August 18, 1587</b>, his granddaughter <b>Virginia Dare</b> was born: the first English child born in the Americas.</p><p>White sailed home for supplies, but England’s war with the <b>Spanish Armada</b> kept him away for three years. When he came back in <b>August 1590</b>, the houses were gone and the place was closed in by a wall of posts. On a post by the entrance one word was carved: <b>CROATOAN</b>.</p><p>Croatoan was a nearby island, home of a friendly Native people and of <b>Manteo</b>, who had helped the English. The colonists had promised to carve a cross if they left in danger, and White found none. Storms kept him from searching Croatoan, and no one knows for sure what happened. It is still one of America’s great mysteries.</p>" }; }
function ships5Card() { return { title: "⛵ The three ships of 1607", body: "<p>On <b>December 20, 1606</b>, three small ships left London: the <b>Susan Constant</b> (the largest, about 120 tons), the <b>Godspeed</b> and the little <b>Discovery</b>. Captain <b>Christopher Newport</b> commanded them for the <b>Virginia Company of London</b>, a business whose investors hoped to find gold, a passage to Asia and goods to trade.</p><p>After about four months at sea they reached Virginia in late April 1607. On <b>May 14, 1607</b>, about <b>104</b> men and boys came ashore on a narrow peninsula in the James River and began <b>James Towne</b>, the first permanent English settlement in America. The first two Englishwomen arrived in 1608.</p>" }; }
function jfortCard() { return { title: "🔺 James Fort: a triangle of logs", body: "<p>On <b>May 26, 1607</b>, warriors attacked the new camp. The settlers worked fast, and in about <b>19 days</b> they finished a fort: a <b>triangle</b> of tall upright logs called a <b>palisade</b>, with a round <b>bulwark</b> at each corner where cannon could guard the walls. Its long side faced the river.</p><p>In 1610 the colonist <b>William Strachey</b> wrote that the fort was “cast almost into the form of a triangle.” For centuries people believed the river had washed it away. Then in <b>1994</b> the archaeologists of <b>Jamestown Rediscovery</b> began to dig, and they found the lines of the fort’s walls, its wells and buildings, and well over a million artifacts.</p>" }; }
function starvingCard() { return { title: "🥀 The Starving Time, 1609–1610", body: "<p>Jamestown nearly failed. The swampy site had bad water, and many of the first settlers were gentlemen who had never farmed. Captain <b>John Smith</b> led the colony in 1608–1609 with a firm rule: <b>“He that will not work shall not eat.”</b> In the fall of 1609 he was badly burned by gunpowder and sailed home.</p><p>The winter of <b>1609–1610</b> is called the <b>Starving Time</b>. Powhatan’s warriors besieged the fort, and the food ran out. Of the roughly <b>240 to 300</b> people crowded into James Fort, only about <b>60</b> were still alive by <b>May 1610</b>.</p><p>In June 1610 the survivors were sailing away when they met <b>Lord De La Warr</b> arriving with new settlers and supplies, and they turned back. Jamestown survived, and it never gave up again.</p>" }; }
function assemblyCard() { return { title: "🏛️ The General Assembly, July 30, 1619", body: "<p>On <b>July 30, 1619</b>, in the church at James Towne, the first elected lawmaking assembly in English America met: the <b>General Assembly</b> of Virginia. Its elected members were called <b>burgesses</b>, and the elected house later became known as the <b>House of Burgesses</b>.</p><p>Governor <b>George Yeardley</b> called it under the Virginia Company’s new rules. <b>22 burgesses</b>, two from each of 11 settlements, sat with the governor and his council for six hot summer days, and the speaker, <b>John Pory</b>, kept the record.</p><p>It was a first seed of <b>self-government</b> in America: colonists choosing representatives to help make their own laws. That idea grew into our state legislatures and the U.S. Congress.</p><p>The honest history: that same August, the first recorded <b>Africans</b> in English Virginia arrived, about 20 people captured from a Portuguese slave ship and brought against their will. Liberty and slavery both took root in Virginia, and it took Americans a long struggle to make freedom belong to all.</p>" }; }
function tobaccoCard() { return { title: "🌿 John Rolfe’s tobacco", body: "<p>Jamestown needed a way to pay its own way. In <b>1612</b> <b>John Rolfe</b> planted a sweeter kind of tobacco grown from Caribbean seeds. English smokers loved it, and by 1617 Virginia shipped about <b>20,000 pounds</b> of it to England. Tobacco became Virginia’s <b>cash crop</b>, and hard work and enterprise kept the colony alive. (Today we know smoking is very harmful to health.)</p><p>In <b>1614</b> Rolfe married <b>Pocahontas</b>, daughter of the paramount chief Powhatan, and her marriage brought several years of peace.</p><p>Tobacco needed a lot of land and workers. Planters paid the voyage of <b>indentured servants</b>, who worked for several years and then went free, and later many planters used enslaved Africans.</p>" }; }
function powhatanCard() { return { title: "🏹 The Powhatan people", body: "<p>Jamestown was built in <b>Tsenacommacah</b>, the homeland of the Powhatan. More than <b>14,000</b> Algonquian-speaking people lived in about 30 tribes led by the paramount chief <b>Wahunsenacah</b>, whom the English called <b>Powhatan</b>.</p><p>They lived in towns of long, rounded houses called <b>yehakins</b>, covered with bark or woven reed mats, like the ones here. They grew corn, beans and squash, and fished and hunted along the rivers. At first they traded corn to the hungry English for copper, glass beads and iron tools.</p><p>The two peoples traded, quarreled and fought. After Pocahontas married John Rolfe there was peace for a time, but war came again in <b>1622</b>. The Powhatan people never disappeared: the <b>Pamunkey</b>, <b>Mattaponi</b> and other Virginia tribes live there still.</p>" }; }
function mayshipCard() { return { title: "⛵ The Mayflower, 1620", body: "<p>In <b>September 1620</b> the <b>Mayflower</b>, a three-masted merchant ship, sailed from Plymouth, England, with <b>102 passengers</b>. About 40 of them were <b>Separatists</b>, later called the <b>Pilgrims</b>, who wanted to worship God freely, apart from the Church of England. The others, called <b>Strangers</b>, came for land and a new start.</p><p>The crossing took <b>66 days</b> through autumn storms. A main beam cracked, and they forced it back into place with a great iron screw. A young man, <b>John Howland</b>, was swept overboard and saved himself by grabbing a rope.</p><p>On <b>November 11, 1620</b>, they anchored here in <b>Cape Cod Harbor</b>, far north of the land their charter covered. That is why they needed the Mayflower Compact.</p>" }; }
function plymouthCard() { return { title: "🏡 Plymouth’s first winter", body: "<p>After exploring the coast, the Pilgrims chose <b>Plymouth</b> harbor in December 1620. It had fresh water, a hill for a fort and cleared fields. The fields were empty because a terrible sickness from 1616 to 1619 had killed most of the <b>Patuxet</b> people who had lived there.</p><p>The first winter was brutal. While they built their houses, about <b>half</b> of the 102 passengers died. When the Mayflower sailed home in April 1621, not one of the survivors went back with it. That is courage.</p><p><b>William Bradford</b> was chosen governor in 1621, and the colonists re-elected him again and again for about 30 years. His book <i>Of Plymouth Plantation</i> tells their story.</p>" }; }
function coloniesCard() { return { title: "⚖️ Two colonies, two beginnings", body: "<p><b>Jamestown (1607)</b> was a business venture: men sent by the Virginia Company to make a profit. It survived through hard work and tobacco, and in 1619 it gave America its first elected assembly.</p><p><b>Plymouth (1620)</b> was settled by families who came for <b>faith</b> and freedom of worship. Before landing, the men signed the <b>Mayflower Compact</b>, agreeing to make “just and equal laws” for the good of all.</p><p>Plymouth learned a lesson about <b>enterprise</b> too. At first everyone farmed for one shared store. In <b>1623</b> Governor Bradford gave each family its own plot of land, and Bradford wrote that the colonists became much more industrious and planted far more corn.</p><p>Two different beginnings, one shared gift: Americans governing themselves.</p>" }; }
function wampanoagCard() { return { title: "🏠 The Wampanoag, People of the First Light", body: "<p>The <b>Wampanoag</b>, “People of the First Light,” had lived in what is now southeastern Massachusetts and Rhode Island for thousands of years. They lived in domed houses called <b>wetus</b>, covered with bark or woven mats, and moved between summer fields by the coast and sheltered winter homes inland.</p><p>Their great sachem (leader) <b>Ousamequin</b>, known as <b>Massasoit</b>, visited Plymouth in <b>March 1621</b>. He and Governor <b>John Carver</b> agreed to a treaty of peace and to help defend each other. It lasted more than 50 years.</p><p>In the fall of 1621, about 90 Wampanoag men came to the Pilgrims’ harvest celebration and brought five deer. The Wampanoag Nation lives in Massachusetts today, including the Mashpee and Aquinnah tribes.</p>" }; }
function cornhillsCard() { return { title: "🌱 The Three Sisters: corn, beans and squash", body: "<p>Native farmers planted <b>corn, beans and squash</b> together in low hills, the “Three Sisters.” The tall corn gives the beans a pole to climb, the beans help keep the soil rich, and the big squash leaves shade out weeds and hold in water.</p><p>In the spring of 1621, <b>Tisquantum (Squanto)</b> showed the Pilgrims how to plant corn in hills and put fish in each hill to feed the soil. He spoke English because, years before, he had been kidnapped and taken to Europe. When he came home, he found his Patuxet people gone. He chose to help the newcomers, and William Bradford called him “a special instrument sent of God.”</p>" }; }
function helpCardS5() {
  card({ title: "❔ How to explore Jamestown and Plymouth", body: "<p>You are <b>" + esc(heroName()) + "</b>, visiting the first lasting English colonies in America. You will see the Lost Colony of <b>Roanoke</b> (1587), <b>James Fort</b> in Virginia (1607) and <b>Plymouth</b> in New England (1620). Here Americans first learned to <b>govern themselves</b>: the General Assembly of 1619 and the Mayflower Compact of 1620.</p><ul><li><b>Walk:</b> <b>W</b> forward, <b>Z</b> back, <b>A</b> left, <b>S</b> right (the way the camera faces), or the arrow keys (or the joystick). <b>Space</b> or the ✋ button uses a glowing ring.</li><li><b>Gold</b> rings are new, <b>blue</b> are done, a <b>star</b> means 3 stars. The banner at the top names your next marker.</li><li>In real life Virginia and New England are hundreds of miles apart. Here they are close together, but the directions are true: <b>north is ahead</b> when you start on Roanoke Island, so <b>west is on your left</b> and the Atlantic (east) is on your right.</li><li>Sail across the <b>James River</b> at the landing. Read all <b>10 scrolls</b> to open the <b>fort-meetinghouse</b> for the Trial.</li></ul>" });
  W.seen.help5 = true; saveW();
}
// Level 5 banner: like Level 4 (the station she stands in, else the lowest-numbered station with work left); across the James
// River it points at the ship ring on her bank. With nothing left: the fort-meetinghouse.
function nextTargetS5() {
  const B = L.mods.B, rings = L.lvl.rings, S = B.STATIONS, byId = id => rings.find(r => r.def.id === id);
  const north = z => z > B.riverZ(L.pos.x), meN = north(L.pos.z);
  const pick = pool => { let best = null, bd = 1e9; for (const r of pool) { const d = Math.hypot(r.def.x - L.pos.x, r.def.z - L.pos.z); if (d < bd) { bd = d; best = r; } } return best; };
  const cross = () => { const r = byId(meN ? "ship-north" : "ship-south"); return { def: { ...r.def, text: "Marker " + (meN ? "2 · Sail back to Roanoke Island" : "1 · Sail up the James River to James Fort") } }; };
  const todo = rings.filter(r => r.def.scored && r.state === "new");
  let best;
  if (!todo.length) best = byId("trial");
  else { const st = Object.keys(S).find(k => Math.hypot(L.pos.x - S[k].x, L.pos.z - S[k].z) < S[k].r + 3), inSt = st && todo.filter(r => r.def.station === st);
    if (inSt && inSt.length) best = pick(inSt); else { const n0 = Math.min(...todo.map(r => S[r.def.station].n)); best = pick(todo.filter(r => S[r.def.station].n === n0)); } }
  return best && north(best.def.z) !== meN ? cross() : best;
}

// ---- v2.8 Level 6 (The Thirteen Colonies, to 1754): Charles Town → Williamsburg → a field meeting of 1740 → Philadelphia →
// a village lane → Boston → Albany 1754 (Trial at the Stadt Huys). One walk on land, no ships to sail; nothing is saved but at.s6.
// Info cards mark W.seen like the other levels; no new progress-save fields.
function ringDefsS6(B) {
  const A = B.RING_AT, at = (id, o) => ({ ...o, x: A[id][0], z: A[id][1] });
  const info = (id, station, icon, title, cardFn) => at(id, { id, station, icon, scored: true, label: () => title, act: () => { W.seen[id] = true; saveW(); card(cardFn()); }, state: () => W.seen[id] ? "done" : "new" });
  const L6 = (id, i, st) => lessonRing("s6-" + id, i, A[id][0], A[id][1], st, "s6");
  const A6 = (id, actId, icon, title, st) => actRing("s6-" + id, actId, icon, title, A[id][0], A[id][1], st, "s6");
  return [
    L6("l2", 2, "charleston"), info("rice", "charleston", "🌾", "Carolina rice", riceCard), info("indigo", "charleston", "🫙", "Eliza Lucas and indigo", indigoCard), info("port6", "charleston", "⚓", "The port of Charles Town", port6Card),
    L6("l3", 3, "williamsburg"), info("capitol", "williamsburg", "🏛️", "The Capitol at Williamsburg", capitolCard), info("trade6", "williamsburg", "⚖️", "Trade with England", trade6Card),
    L6("l5", 5, "revival"), info("whitefield", "revival", "📣", "George Whitefield preaches, 1740", whitefieldCard),
    L6("l1", 1, "philadelphia"), L6("l8", 8, "philadelphia"), A6("press", "s6-press", "🖨️", "Print a page like Ben Franklin", "philadelphia"), A6("franklin", "s6-franklin", "🪁", "Talk with Benjamin Franklin", "philadelphia"),
    info("library", "philadelphia", "📚", "The Library Company, 1731", libraryCard), info("penn", "philadelphia", "🕊️", "William Penn and the Lenape", pennCard),
    L6("l4", 4, "village"), A6("candle", "s6-candle", "🕯️", "Dip a colonial candle", "village"), info("hornbook", "village", "📜", "School and the hornbook", hornbookCard),
    L6("l0", 0, "boston"), L6("l7", 7, "boston"), info("townmeeting", "boston", "🗳️", "The New England town meeting", townmeetingCard), A6("colonies", "s6-colonies", "🗂️", "Sort the Thirteen Colonies", "boston"),
    at("market", { id: "market", station: "boston", icon: "🛍️", label: () => "Hale’s Shop on King Street", act: () => openPanel(() => { L.inMarket = true; window.ABRPG.market("m5"); }), state: () => "done" }),
    L6("l6", 6, "gate"), A6("geomap", "s6-geomap", "🧭", "Label the Thirteen Colonies", "gate"), A6("timeline", "s6-timeline", "📓", "Timeline of the Thirteen Colonies", "gate"), info("joinordie", "gate", "🐍", "“JOIN, or DIE.” Albany, 1754", joinordieCard),
    at("trial", { id: "trial", station: "gate", icon: "⚔️", label: () => trialLabelS6(), act: () => gateOpenS6() ? openPanel(() => { L.bypass = true; try { window.ABRPG.trial("s6"); } finally { L.bypass = false; } }) : card(gateLockedCardS6()), state: () => !gateOpenS6() ? "locked" : (sec("s6").completed ? "star" : "new") })
  ];
}
const S6_ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const missingS6 = () => S6_ALL.filter(i => !scrollRead("s6", i));
const gateOpenS6 = () => missingS6().length === 0 || (sec("s6").attempts || 0) > 0 || !!sec("s6").completed || trialActive("s6");
function trialLabelS6() { const st = sec("s6"); if (trialActive("s6")) return "Resume the Trial at the Stadt Huys"; if (st.completed) return "The Stadt Huys Trial (mastered " + st.bestPct + "%) — try again"; return "Enter the Stadt Huys: the Trial (" + ((window.GAME_CONTENT && GAME_CONTENT.passPercent) || 95) + "% to master)"; }
function gateLockedCardS6() { return { title: "🏛️ The Stadt Huys at Albany", body: "<p>In the summer of <b>1754</b>, delegates from seven colonies met in Albany’s town hall, the <b>Stadt Huys</b> (Dutch for “city house”), to talk about joining together. Its door opens for the Trial once you have read <b>all 9 scrolls</b> of the Thirteen Colonies. Still to read:</p>", btns: missingS6().map(i => lessonBtnS("s6", i)) }; }
function riceCard() { return { title: "🌾 Carolina rice", body: "<p><b>Charles Town</b> (today’s Charleston, South Carolina) was founded in <b>1670</b>. In the warm, wet Lowcountry, planters found a crop that grew wonderfully in flooded fields: <b>rice</b>. By the 1740s South Carolina shipped tens of thousands of barrels of “Carolina Gold” rice a year, and Charles Town was the richest city in the southern colonies.</p><p>The truth has a hard side. The rice was planted, flooded, weeded and harvested by <b>enslaved Africans</b>, and many came from West African rice-growing regions. Their skill built the rice fields, but they were not free. By 1740 most people in South Carolina were enslaved. Americans would later fight a long struggle to end slavery and live up to the words “all men are created equal.”</p>" }; }
function indigoCard() { return { title: "🫙 Eliza Lucas and indigo", body: "<p>In <b>1739</b>, when she was only <b>16</b>, <b>Eliza Lucas</b> was put in charge of her family’s plantations in South Carolina while her father served as an army officer in the West Indies. She loved botany and tried crop after crop.</p><p>Her best experiment was <b>indigo</b>, a plant that makes a deep blue dye prized by England’s cloth makers. Frost, failed batches and a dishonest dye-maker did not stop her. By <b>1744</b> she had a good crop and shared her seed with other planters. Indigo soon became South Carolina’s second great export, after rice. That is ingenuity and <b>enterprise</b>.</p><p>In these vats the leaves soaked in water, were beaten to bring out the color, and dried into blue cakes. Like the rice, most of the hard work was done by enslaved people.</p>" }; }
function port6Card() { return { title: "⚓ The port of Charles Town", body: "<p>From wharves like this one, ships carried <b>rice, indigo</b> and deerskins (traded from the <b>Cherokee</b> and <b>Creek</b> peoples) across the Atlantic to England. They came back with cloth, tools, tea, books and fine furniture.</p><p>Charles Town was also the busiest port in North America for the cruel <b>slave trade</b>: ships brought thousands of captive Africans there to be sold. Telling the whole story helps us understand how much courage it took, later, to end slavery.</p>" }; }
function capitolCard() { return { title: "🏛️ The Capitol at Williamsburg", body: "<p><b>Williamsburg</b> became the capital of Virginia in <b>1699</b>, after the statehouse at Jamestown burned. Its brick <b>Capitol</b>, finished in <b>1705</b>, was shaped like the letter <b>H</b>: two wings joined by a hall on the second floor.</p><p>One wing held the <b>House of Burgesses</b>, the elected assembly that began at Jamestown in 1619. The other held the <b>Governor’s Council</b>. Colonists who owned land elected the burgesses, who voted on taxes and laws. Young <b>George Washington</b> was elected a burgess in <b>1758</b>, and <b>Patrick Henry</b> and <b>Thomas Jefferson</b> later served here too.</p><p>Every colony had its own elected assembly like this. That is how Americans practiced <b>self-government</b> for more than 150 years before the Revolution.</p>" }; }
function trade6Card() { return { title: "⚖️ Trade with England", body: "<p>England ran its colonies under a system called <b>mercantilism</b>: colonies should send raw materials (tobacco, rice, furs, lumber, fish) to the mother country and buy its manufactured goods. Laws called the <b>Navigation Acts</b> (from <b>1651</b>) said that many colonial goods could be shipped only to England, on English or colonial ships.</p><p>For many years England did not enforce these laws strictly. This is often called <b>salutary neglect</b> (“healthy neglect”). Colonial merchants, shipbuilders and farmers grew prosperous, and the colonists grew used to running their own affairs. When Britain later tried to tighten its grip, they resisted.</p>" }; }
function whitefieldCard() { return { title: "📣 George Whitefield preaches, 1740", body: "<p>In the 1730s and 1740s a wave of religious revival called the <b>Great Awakening</b> swept the colonies. In Massachusetts the minister <b>Jonathan Edwards</b> led revivals, and in <b>1739–1740</b> the young English preacher <b>George Whitefield</b> toured from Georgia to New England.</p><p>Whitefield preached <b>outdoors</b> in fields like this one, because no church could hold the crowds. In Philadelphia <b>Benjamin Franklin</b>, who was not a revivalist, went to hear him and worked out that his voice could reach <b>more than 30,000 people</b> at once.</p><p>The Awakening taught that every person, rich or poor, could stand before God. People began to choose their own churches and question authority, and new colleges were founded, such as the College of New Jersey (today Princeton) in <b>1746</b>. <b>Faith</b> helped build a free people.</p>" }; }
function libraryCard() { return { title: "📚 The Library Company, 1731", body: "<p>Books were expensive in the colonies. In <b>1731</b> <b>Benjamin Franklin</b> and his friends in a club called the <b>Junto</b> each paid in money to buy books from London and share them. They called it the <b>Library Company of Philadelphia</b>, and it was the first <b>subscription library</b> in America. It is still open today.</p><p>Franklin wrote that libraries made “the common tradesmen and farmers as intelligent as most gentlemen from other countries.” This love of learning, part of the <b>Enlightenment</b>, helped ordinary Americans think for themselves.</p>" }; }
function pennCard() { return { title: "🕊️ William Penn and the Lenape", body: "<p>In <b>1681</b> King Charles II granted <b>William Penn</b>, a <b>Quaker</b>, a huge colony to repay a debt to Penn’s father. Penn called it a “holy experiment”: a colony where people of every faith could worship freely. He founded <b>Philadelphia</b>, “city of brotherly love,” in <b>1682</b>.</p><p>The land was the homeland of the <b>Lenape</b> (Delaware) people. Penn learned some of their language and bought land from them instead of simply taking it, and for many years the two peoples lived in peace. Sadly, after his death his sons tricked the Lenape in the <b>Walking Purchase</b> of <b>1737</b> and took far more land than had been agreed.</p><p>Penn’s <b>Charter of Privileges</b> of <b>1701</b> gave Pennsylvania an elected assembly and promised freedom of conscience. In 1751 the assembly ordered a bell for its statehouse with words from the Bible: “Proclaim liberty throughout all the land.” We call it the Liberty Bell.</p>" }; }
function hornbookCard() { return { title: "📜 School and the hornbook", body: "<p>Colonial children learned their letters from a <b>hornbook</b>: a little wooden paddle holding a sheet with the alphabet and the Lord’s Prayer, covered with a thin, clear layer of cow’s horn to keep it clean.</p><p>New England cared a great deal about reading, so that everyone could read the Bible. A Massachusetts law of <b>1647</b> said that every town of <b>50 families</b> must hire a teacher, and every town of 100 families must have a grammar school. Children also learned from the <b>New England Primer</b>, which began “In Adam’s fall, we sinned all.”</p><p>Many girls learned to read at home or at “dame schools” and stitched <b>samplers</b> of letters and verses. By the 1700s New England had some of the highest reading rates in the world.</p>" }; }
function townmeetingCard() { return { title: "🗳️ The New England town meeting", body: "<p>In New England towns, the voters gathered in the meetinghouse at a <b>town meeting</b>. They chose their own officers, set local taxes, and decided about roads, schools and the town’s minister, all by open debate and a vote.</p><p>Boston held its town meetings here, and in the <b>Town House</b> built in <b>1713</b> (today’s Old State House) the Massachusetts assembly met upstairs. Boston’s <b>Long Wharf</b> ran far out into the harbor, and its ships carried <b>cod</b>, lumber, ships and rum around the Atlantic world.</p><p>Thomas Jefferson later called town meetings “the wisest invention ever devised by the wit of man for the perfect exercise of self-government.”</p>" }; }
function joinordieCard() { return { title: "🐍 “JOIN, or DIE.” Albany, 1754", body: "<p>By <b>1754</b> Britain and France were close to war over the Ohio Valley. On <b>May 9, 1754</b>, Benjamin Franklin printed America’s first famous political cartoon in his <b>Pennsylvania Gazette</b>: a snake cut into pieces labeled with the colonies, and the words <b>“JOIN, or DIE.”</b></p><p>That summer, delegates from <b>seven colonies</b> met here in <b>Albany</b> with leaders of the <b>Haudenosaunee</b> (Iroquois) Confederacy, the Six Nations, including the Mohawk leader <b>Hendrick Theyanoguin</b>. Franklin proposed the <b>Albany Plan of Union</b>: one council of delegates from all the colonies to handle defense and Native relations.</p><p>No colony accepted it. They were not yet ready to give up any of their own power. But the idea of the colonies <b>uniting</b> had been planted, and twenty-two years later it grew into the United States.</p>" }; }
function helpCardS6() {
  card({ title: "❔ How to explore the Thirteen Colonies", body: "<p>You are <b>" + esc(heroName()) + "</b>, traveling through the <b>Thirteen Colonies</b> in the 1740s and 1750s, from the rice fields of <b>Charles Town</b> to Williamsburg, Philadelphia and Boston, and on to <b>Albany</b> in 1754. You will see how the colonists worked, worshiped, learned and <b>governed themselves</b>.</p><ul><li><b>Walk:</b> <b>W</b> forward, <b>Z</b> back, <b>A</b> left, <b>S</b> right (the way the camera faces), or the arrow keys (or the joystick). <b>Space</b> or the ✋ button uses a glowing ring.</li><li><b>Gold</b> rings are new, <b>blue</b> are done, a <b>star</b> means 3 stars. The banner at the top names your next marker.</li><li>In real life these towns are hundreds of miles apart. Here they are close together, but the directions are true: <b>north is ahead</b> when you start at Charles Town, so <b>west is on your left</b> and the Atlantic (east) is on your right.</li><li>Follow the road north through markers 1 to 7. Read all <b>9 scrolls</b> to open the <b>Stadt Huys</b> at Albany for the Trial.</li></ul>" });
  W.seen.help6 = true; saveW();
}
// Level 6 banner: like Level 5 without the river crossing (the station she stands in, else the lowest-numbered station
// with work left). With nothing left: the Stadt Huys.
function nextTargetS6() {
  const rings = L.lvl.rings, S = L.mods.B.STATIONS, byId = id => rings.find(r => r.def.id === id);
  const pick = pool => { let best = null, bd = 1e9; for (const r of pool) { const d = Math.hypot(r.def.x - L.pos.x, r.def.z - L.pos.z); if (d < bd) { bd = d; best = r; } } return best; };
  const todo = rings.filter(r => r.def.scored && r.state === "new");
  if (!todo.length) return byId("trial");
  const st = Object.keys(S).find(k => Math.hypot(L.pos.x - S[k].x, L.pos.z - S[k].z) < S[k].r + 3), inSt = st && todo.filter(r => r.def.station === st);
  if (inSt && inSt.length) return pick(inSt);
  const n0 = Math.min(...todo.map(r => S[r.def.station].n)); return pick(todo.filter(r => S[r.def.station].n === n0));
}

// ---- v3.0 Level 7 (The French and Indian War, 1753–1763): a frontier farm → the trading post at Wills Creek → Fort
// Necessity → the Forks of the Ohio → Albany 1754 → a story jump to 1759: Point Lévis → a boat across the St. Lawrence to
// the Anse au Foulon, up the cliff path → the Plains of Abraham (Trial). The boat rings fade her across; nothing is saved
// but at.s7. Info cards mark W.seen like the other levels; no new progress-save fields.
function ringDefsS7(B) {
  const A = B.RING_AT, at = (id, o) => ({ ...o, x: A[id][0], z: A[id][1] });
  const info = (id, station, icon, title, cardFn) => at(id, { id, station, icon, scored: true, label: () => title, act: () => { W.seen[id] = true; saveW(); card(cardFn()); }, state: () => W.seen[id] ? "done" : "new" });
  const L7 = (id, i, st) => lessonRing("s7-" + id, i, A[id][0], A[id][1], st, "s7");
  const A7 = (id, actId, icon, title, st) => actRing("s7-" + id, actId, icon, title, A[id][0], A[id][1], st, "s7");
  const boat = (side, station) => at("boat-" + side, { id: "boat-" + side, station, icon: "🛶", label: () => side === "south" ? "Story jump to 1759: cross the St. Lawrence by boat" : "Take the boat back to Point Lévis", act: () => card(boatCardS7(side)), state: () => "done" });
  return [
    L7("l0", 0, "farm"), info("cabin", "farm", "🏡", "A frontier farm, 1753", cabinCard7), A7("mission", "s7-mission", "✉️", "Washington’s Winter Mission, 1753", "farm"),
    L7("l2", 2, "willscreek"), info("furtrade7", "willscreek", "🦫", "Trading at Wills Creek", furtrade7Card), A7("sides", "s7-sides", "⚔️", "Who fought on which side?", "willscreek"),
    at("market", { id: "market", station: "willscreek", icon: "🛍️", label: () => "The Trading Post at Wills Creek", act: () => openPanel(() => { L.inMarket = true; window.ABRPG.market("m6"); }), state: () => "done" }),
    L7("l1", 1, "meadows"), L7("l7", 7, "meadows"), A7("washington", "s7-washington", "🎖️", "Talk with young George Washington", "meadows"), info("necessity", "meadows", "🪵", "Fort Necessity, July 3, 1754", necessityCard),
    L7("l4", 4, "forks"), info("duquesne", "forks", "⚜️", "The Forks of the Ohio and Fort Duquesne", duquesneCard), info("braddock", "forks", "🥁", "Braddock’s defeat, July 9, 1755", braddockCard),
    L7("l3", 3, "albany"), L7("l8", 8, "albany"), info("hendrick", "albany", "🪶", "Hendrick and the Six Nations", hendrickCard), info("snake7", "albany", "🐍", "“JOIN, or DIE.” and the Albany Plan", snake7Card),
    info("wolfe", "levis", "⛺", "Wolfe’s army at Point Lévis, 1759", wolfeCard), boat("south", "levis"), boat("north", "gate"),
    L7("l5", 5, "gate"), L7("l6", 6, "gate"), info("plains", "gate", "🎖️", "The Plains of Abraham, September 13, 1759", plainsCard),
    A7("geomap", "s7-geomap", "🧭", "Map the French and Indian War", "gate"), A7("timeline", "s7-timeline", "📓", "Timeline of the French and Indian War", "gate"),
    at("trial", { id: "trial", station: "gate", icon: "⚔️", label: () => trialLabelS7(), act: () => gateOpenS7() ? openPanel(() => { L.bypass = true; try { window.ABRPG.trial("s7"); } finally { L.bypass = false; } }) : card(gateLockedCardS7()), state: () => !gateOpenS7() ? "locked" : (sec("s7").completed ? "star" : "new") })
  ];
}
const S7_ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const missingS7 = () => S7_ALL.filter(i => !scrollRead("s7", i));
const gateOpenS7 = () => missingS7().length === 0 || (sec("s7").attempts || 0) > 0 || !!sec("s7").completed || trialActive("s7");
function trialLabelS7() { const st = sec("s7"); if (trialActive("s7")) return "Resume the Trial on the Plains of Abraham"; if (st.completed) return "The Plains of Abraham Trial (mastered " + st.bestPct + "%) — try again"; return "The Plains of Abraham: the Trial (" + ((window.GAME_CONTENT && GAME_CONTENT.passPercent) || 95) + "% to master)"; }
function gateLockedCardS7() { return { title: "🎖️ The Plains of Abraham", body: "<p>Here, outside the walls of <b>Quebec</b>, the battle that decided the French and Indian War was fought on <b>September 13, 1759</b>. The Trial opens once you have read <b>all 9 scrolls</b> of the French and Indian War. Still to read:</p>", btns: missingS7().map(i => lessonBtnS("s7", i)) }; }
function boatCardS7(side) {
  if (side === "north") return { title: "🛶 Back across the St. Lawrence", body: "<p>Ready to row back across the river to the British camp at <b>Point Lévis</b>, and the road south to Albany and the Ohio country?</p>", btns: [{ t: "🛶 Row back to Point Lévis", f: () => { closeCard(); boatToS7("south"); } }] };
  return { title: "🛶 A story jump: 1759", body: "<p>Five years pass. The war that began in the Ohio Valley in 1754 has spread around the world. Britain’s leader <b>William Pitt</b> has sent thousands of soldiers and a great fleet to America, and in the summer of <b>1759</b> General <b>James Wolfe</b> has brought an army up the St. Lawrence River to <b>Quebec</b>, the capital of New France.</p><p>The city sits high on cliffs. In the dark before dawn on <b>September 13, 1759</b>, Wolfe’s soldiers drift downriver in flat-bottomed boats to a little cove, the <b>Anse au Foulon</b>, and climb a narrow path up the cliff. Will you go with them?</p>", btns: [{ t: "🛶 Cross the river to the Anse au Foulon", f: () => { closeCard(); boatToS7("north"); } }] };
}
const ARRIVE7 = {
  north: "🌙 The Anse au Foulon, before dawn on <b>September 13, 1759</b>. Climb the steep path up the cliff, as Wolfe’s soldiers did, to the <b>Plains of Abraham</b>.",
  south: "⛺ Point Lévis, 1759: the British camp on the south shore of the St. Lawrence."
};
function boatToS7(side) { const h = L.mods.B.HARBORS[side]; if (!h) return false; teleport("out", h); setTimeout(() => toast(ARRIVE7[side]), 600); return true; }
function cabinCard7() { return { title: "🏡 A frontier farm, 1753", body: "<p>By the 1750s, colonists were moving west from the coast into the <b>backcountry</b> of Virginia and Pennsylvania. They cleared the forest, built log cabins like this one, fenced their fields with zig-zag split rails, and planted corn. Across the mountains lay the rich <b>Ohio River Valley</b>.</p><p>In <b>1749</b> King George II granted a group of Virginians, the <b>Ohio Company</b>, 200,000 acres there. But <b>France</b> claimed the same land, and in <b>1753</b> French soldiers built a chain of forts south from Lake Erie to hold it.</p><p>The whole truth: the Ohio Valley was the home and hunting ground of the <b>Shawnee</b>, the <b>Delaware</b> (Lenape) and the <b>Mingo</b> (Seneca and other Haudenosaunee people living along the Ohio), and they had never given it to either king. That winter, Virginia’s governor sent a 21-year-old militia officer north to warn the French away: <b>George Washington</b>.</p>" }; }
function furtrade7Card() { return { title: "🦫 Trading at Wills Creek", body: "<p>About <b>1750</b>, the Ohio Company built a storehouse here at <b>Wills Creek</b> on the Potomac River, at the edge of the mountains. Traders brought wool cloth, blankets, kettles, knives, guns and beads to trade with Native hunters for <b>deerskins</b> and <b>beaver furs</b>.</p><p>The French were the great fur traders of North America. New France had <b>far fewer colonists</b> (well under 100,000) than the British colonies (more than a million), and most French traders came to trade, not to clear farms. That is a big reason many Native nations <b>sided with the French</b>: British settlers wanted their land.</p><p>Here in 1754–1755 the British built <b>Fort Cumberland</b>, and in 1755 General Braddock’s army set out from it toward the Forks of the Ohio.</p>" }; }
function necessityCard() { return { title: "🪵 Fort Necessity, July 3, 1754", body: "<p>In the spring of 1754, Lieutenant Colonel <b>George Washington</b>, age 22, led about 160 Virginia soldiers toward the Forks of the Ohio. On <b>May 28, 1754</b>, guided by the Seneca leader <b>Tanacharison</b> (the “Half King”), they surprised a small French party in a rocky glen. The French commander, <b>Jumonville</b>, and nine others were killed. The French called it murder; the first shots of a world war had been fired.</p><p>Washington fell back to the <b>Great Meadows</b> and built this little <b>round stockade</b>, about 53 feet across, around a storehouse, with shallow trenches outside. He named it <b>Fort Necessity</b>.</p><p>On <b>July 3, 1754</b>, about 600 French soldiers and 100 Native allies attacked in pouring rain. The trenches filled with water and the gunpowder got wet. That night Washington <b>surrendered</b>, and his men marched home on July 4. Washington learned hard lessons here, and he never stopped serving his country. A copy of the fort stands on this spot today.</p>" }; }
function duquesneCard() { return { title: "⚜️ The Forks of the Ohio and Fort Duquesne", body: "<p>Here the <b>Allegheny River</b> (from the north) and the <b>Monongahela River</b> (from the south) join to make the <b>Ohio River</b>, which flows west to the Mississippi. Whoever held this point could control the whole Ohio Valley.</p><p>In early 1754 a few Virginians began building a fort here. In April a French force of about 500 arrived, ordered them to leave, and built <b>Fort Duquesne</b>, a square fort of logs and earth with four pointed corners called <b>bastions</b>. It flew the <b>white flag of the French king</b>, with gold <b>fleurs-de-lis</b> (lilies).</p><p>The soldiers in grey-white coats with blue cuffs are French <b>troupes de la Marine</b>; the men in blanket coats and red caps are <b>Canadian militia</b>. In <b>1758</b>, as a British army under General John Forbes closed in, the French <b>blew up</b> Fort Duquesne and left. The British built <b>Fort Pitt</b>, named for William Pitt. Today this point is the city of <b>Pittsburgh</b>.</p>" }; }
function braddockCard() { return { title: "🥁 Braddock’s defeat, July 9, 1755", body: "<p>In 1755 Britain sent General <b>Edward Braddock</b> with two regiments of red-coated regulars. With colonial troops, his army cut a road over the mountains from Wills Creek toward Fort Duquesne. Washington went along as a volunteer aide.</p><p>On <b>July 9, 1755</b>, near the Monongahela River about ten miles from the fort, about 900 French soldiers, Canadians and <b>Native warriors</b> attacked from the woods. Braddock’s men were used to fighting in open fields in neat lines, and they did not know how to fight hidden enemies. Almost two-thirds of them were killed or wounded, and <b>Braddock was mortally wounded</b>.</p><p>Washington rode back and forth through the fire to organize the retreat. He wrote afterward that he had “4 Bullets through my Coat, and two Horses shot under me,” yet he escaped unhurt. Americans remembered his courage.</p>" }; }
function hendrickCard() { return { title: "🪶 Hendrick and the Six Nations", body: "<p>The <b>Haudenosaunee</b> (Iroquois) Confederacy was the most powerful Native alliance in the Northeast: the <b>Mohawk, Oneida, Onondaga, Cayuga, Seneca</b> and, since about 1722, the <b>Tuscarora</b>. That is why it was called the <b>Six Nations</b>. Its Great Law of Peace united them under one council.</p><p>At the <b>Albany Congress</b> in the summer of 1754, the colonies hoped to win the Six Nations to the British side. The Mohawk leader <b>Hendrick Theyanoguin</b>, an old friend of the British, spoke sharply: the British had left their frontier forts weak while the French built strong ones everywhere.</p><p>Most of the Confederacy tried to stay <b>neutral</b> at first. Hendrick himself fought beside the British and was killed at the Battle of Lake George in <b>1755</b>. Later in the war, as the British began winning, more Haudenosaunee joined them.</p>" }; }
function snake7Card() { return { title: "🐍 “JOIN, or DIE.” and the Albany Plan", body: "<p>On <b>May 9, 1754</b>, after news came that the French had taken the Forks of the Ohio, <b>Benjamin Franklin</b> printed this woodcut in his <b>Pennsylvania Gazette</b>. The snake is cut into <b>8 pieces</b>: South Carolina, North Carolina, Virginia, Maryland, Pennsylvania, New Jersey, New York and New England. (Georgia and Delaware are not shown.) An old belief said a cut snake could live again if its pieces were joined before sunset.</p><p>In <b>June and July 1754</b>, delegates from <b>seven colonies</b> met at Albany. Franklin proposed the <b>Albany Plan of Union</b>: one grand council of delegates from all the colonies, with a president chosen by the king, to raise armies and deal with the Native nations.</p><p>The delegates approved it, but <b>every colonial assembly turned it down</b>, and Britain ignored it. The colonies were not yet ready to share power. Twenty-two years later, the idea of union came back.</p>" }; }
function wolfeCard() { return { title: "⛺ Wolfe’s army at Point Lévis, 1759", body: "<p>In the summer of <b>1759</b>, a British fleet carried General <b>James Wolfe</b> and about 9,000 soldiers up the St. Lawrence River. They camped here at <b>Point Lévis</b>, on the south shore across from <b>Quebec</b>, and their cannons fired on the city all summer.</p><p>But Quebec stood on high cliffs, and the French general, the <b>Marquis de Montcalm</b>, kept his army safe behind its defenses. Wolfe’s attacks failed, and autumn was coming, when ice would trap his ships.</p><p>So Wolfe made a bold plan. He found a little cove west of the city, the <b>Anse au Foulon</b>, where a narrow path climbed the cliff. Take the boat to see what happened next.</p>" }; }
function plainsCard() { return { title: "🎖️ The Plains of Abraham, September 13, 1759", body: "<p>In the night of September 12–13, Wolfe’s boats slipped downriver. About <b>4,500</b> soldiers climbed the cliff path and, by morning, stood in lines on this open farmland, the <b>Plains of Abraham</b>, just west of the city walls. (The fields were named for Abraham Martin, a river pilot who had farmed here more than a hundred years before.)</p><p>Montcalm marched out to fight. The British held their fire until the French came close, then fired together. The battle was over in less than an hour. <b>Both generals were mortally wounded</b>: Wolfe died on the field, and Montcalm the next morning. Quebec surrendered five days later.</p><p>In <b>1760</b> Montreal fell too, and in the <b>Treaty of Paris</b> of <b>1763</b> France gave up Canada and its lands east of the Mississippi. The British flag now flew over most of North America east of the Mississippi.</p>" }; }
function helpCardS7() {
  card({ title: "❔ How to explore the French and Indian War", body: "<p>You are <b>" + esc(heroName()) + "</b>, a girl on the <b>Virginia frontier</b> in 1753. Britain and France both claim the Ohio Valley, and war is coming. Walk from your family’s farm to the trading post at Wills Creek, Washington’s <b>Fort Necessity</b>, the <b>Forks of the Ohio</b> and the <b>Albany Congress</b>; then a story jump takes you to <b>Quebec in 1759</b>.</p><ul><li><b>Walk:</b> <b>W</b> forward, <b>Z</b> back, <b>A</b> left, <b>S</b> right (the way the camera faces), or the arrow keys (or the joystick). <b>Space</b> or the ✋ button uses a glowing ring.</li><li><b>Gold</b> rings are new, <b>blue</b> are done, a <b>star</b> means 3 stars. The banner at the top names your next marker.</li><li>In real life these places are hundreds of miles apart. Here they are close together, but the directions are true: <b>north is ahead</b> when you start, so <b>west is on your left</b>.</li><li>At <b>Point Lévis</b> (marker 6) a boat carries you across the St. Lawrence River; climb the cliff path to the <b>Plains of Abraham</b>. Read all <b>9 scrolls</b> to open the Trial there.</li></ul>" });
  W.seen.help7 = true; saveW();
}
// Level 7 banner: like Level 5 (the St. Lawrence is crossed by boat): the station she stands in, else the lowest-numbered
// station with work left; if that is across the river, the boat ring on her side. With nothing left: the Trial.
function nextTargetS7() {
  const rings = L.lvl.rings, S = L.mods.B.STATIONS, byId = id => rings.find(r => r.def.id === id);
  const north = z => z > 55, meN = north(L.pos.z);
  const pick = pool => { let best = null, bd = 1e9; for (const r of pool) { const d = Math.hypot(r.def.x - L.pos.x, r.def.z - L.pos.z); if (d < bd) { bd = d; best = r; } } return best; };
  const cross = () => { const r = byId(meN ? "boat-north" : "boat-south"); return { def: { ...r.def, text: meN ? "Marker 7 · Take the boat back to Point Lévis" : "Marker 6 · Take the boat across the St. Lawrence to 1759" } }; };
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
const F = { lay: null, armed: false, replay: false, row: 0, miss: [], last: null, started: false, vis: null, done: false, good: null };
// v2.8.3 (John: "The River Ford is a little difficult and confusing ... make it more intuitive"): a goal banner that
// never fades ("Row 3 of 8: step on the OLDER event"), the compass points at the row, a timeline strip at the top fills
// in as she crosses, the row to step on glows, wider stones, a wrong stone or a slip sends her back to her last gold
// stone (not the bank), a gold hint after 2 misses and the answer glowing after 3 (the miss costs that row's star only).
const fordShortWhen = w => String(w).replace(/^about /, "").replace(" years ago", " yrs ago");
function fordHud() {
  let el = document.getElementById("w-ford"); const on = L.sid === "s1" && L.zone === "out" && F.armed && F.lay && L.phase === "active";
  if (!el) { if (!on) return; el = document.createElement("div"); el.id = "w-ford"; el.setAttribute("aria-live", "polite"); document.getElementById("w-hud").appendChild(el); }
  if (!on) { if (!el.hidden) el.hidden = true; return; }
  const rows = F.lay.rows, key = F.row + ":" + F.miss.join(",");
  if (el.dataset.k !== key) {
    el.dataset.k = key;
    el.innerHTML = '<span class="wf-end">older</span>' + rows.map((r, k) => k < F.row ? '<span class="wf-s done" title="' + esc(r.ev.when + ": " + r.ev.label) + '">✓' + (k >= F.row - 3 ? " " + esc(fordShortWhen(r.ev.when)) : "") + "</span>"
      : k === F.row ? '<span class="wf-s now">' + (k + 1) + " ?</span>" : '<span class="wf-s">' + (k + 1) + "</span>").join("") + '<span class="wf-end">newer</span>';
  }
  el.hidden = false;
  const er = document.getElementById("w-era"), t = er ? Math.round(er.getBoundingClientRect().bottom + 4) : 120; if (el._top !== t) { el._top = t; el.style.top = t + "px"; }
}
function fordRespawn() { const B = L.mods.B, g = F.armed && F.lay && F.good && F.good.row < F.row ? F.good : null; return g ? { x: g.x, z: g.z, yaw: 0 } : B.FORD_RESPAWN; }
const fordSolved = () => { const a = ST().acts && ST().acts["s1-timeline"]; return !!(a && a.plays); };
const fordName = e => FORD_SHORT[e.q] || e.label;
function fordNew() {
  const B = L.mods.B, h = window.ABRPG.worldTimeline && window.ABRPG.worldTimeline("s1", "s1-timeline", resume);
  if (!h || h.events.length !== B.FORD_ROWS) return null;
  const ev = h.events, rows = ev.map((e, k) => { const later = ev.slice(k + 1); return { ev: e, right: k < ev.length - 1 ? (Math.random() < 0.5 ? 0 : 1) : -1, wrong: later.length ? later[Math.floor(Math.random() * later.length)] : null }; });
  F.lay = { h, rows }; F.good = null; F.row = 0; F.miss = rows.map(() => 0); F.started = false; F.done = false; return F.lay;
}
function fordCard() {
  const solved = fordSolved();
  const body = solved
    ? "<p>You have built this timeline before. The stones are safe now and show their dates as you cross.</p><p>Want to practice? Replay it on the stones, or use the card version.</p>"
    : "<p>Cross on the stones <b>in time order</b>. In each row, read the two labels and step on the event that happened <b>first</b> (the older one). The strip at the top fills in your timeline.</p><p>Wrong stone? Just a splash: you hop back to your last gold stone. After 2 misses a gold <b>hint</b> appears; after 3 the answer glows (no star for that row).</p>";
  const btns = [{ t: "🪨 " + (solved ? "Replay on the river stones" : "Start on the river stones"), f: () => { closeCard(); F.replay = true; fordNew(); F.armed = true; fordHud(); } }, actBtn("s1-timeline", "📓 Card version")];
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
  const glowG = new THREE.RingGeometry(0.5, 0.74, 24); glowG.rotateX(-Math.PI / 2);
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
  setTimeout(() => { L.fordFall = false; teleport("out", fordRespawn()); }, 420);
}
function fordStep() {
  if (L.sid !== "s1") return;
  const B = L.mods.B; if (L.zone !== "out" || !F.vis && Math.hypot(L.pos.x + 5, L.pos.z - B.riverZ(-5)) > 30) return;
  const v = fordVisuals(), zc = B.riverZ(-5), near = Math.abs(L.pos.x + 5) < 12 && Math.abs(L.pos.z - zc) < 14;
  // arm on the south bank (she meets the oldest event first); coming back from the north the stones are just stones
  if (!F.armed && !F.done && near && L.pos.z < zc - 5.4 && Math.abs(L.pos.x + 5) < 8 && (!fordSolved() || F.replay)) { if (!F.lay) fordNew(); if (F.lay) { F.armed = true; if (!F.started && !F.hinted) { F.hinted = true; toast("🪨 The river stones are a <b>timeline</b>. In each row, step on the event that happened <b>first</b>."); } } }
  if (F.armed && L.pos.z < zc - 16) F.armed = false;   // walked away: progress on lit rows stays for this visit
  const play = F.armed && F.lay; const pulse = 0.45 + 0.35 * Math.sin(performance.now() / 260);
  // labels: only the row she is about to step on; lit rows get a gold ring. Safe mode shows dates just ahead of her
  for (const it of v.items) {
    const s = it.s; let show = false;
    if (near) {
      if (play) {
        const ev = fordStoneEvent(s), r = F.lay.rows[s.row], right = ev === r.ev;
        const gm = it.gl.material;
        if (s.row < F.row) { it.gl.visible = right; if (right) { gm.color.set("#ffd75e"); gm.opacity = 0.7; } }   // lit rows: a gold ring on the right stone
        else if (s.row === F.row) {   // the row to step on: both stones glow; a hint after 2 misses, the answer after 3
          show = true; const m = F.miss[s.row] || 0, hint = right && m >= 2, ans = right && m >= 3;
          fordSet(it, (ans ? "a" : hint ? "h" : "q") + ev.key, fordName(ev), ans ? "✔ This one came first" : hint ? "Hint: this one is older" : "", hint ? "hint" : "");
          it.gl.visible = true; gm.color.set(ans ? "#ffd75e" : "#bff4ff"); gm.opacity = ans ? 0.95 : pulse;
        }
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
  const s = B.onStone(L.pos.x, L.pos.z, -0.05);
  if (!s || s === F.last) { if (!s) F.last = null; return; }
  F.last = s; const h = F.lay.h, r = F.lay.rows[s.row];
  if (s.row < F.row) return;                        // lit rows are safe
  if (!F.started) { F.started = true; h.start(); }
  if (s.row > F.row) { fordSplash(s, "💦 Splash! One row at a time: step on a <b>glowing</b> stone first."); return; }
  const ev = fordStoneEvent(s);
  if (ev === r.ev) {
    const star = h.right(ev.key); F.row++; F.good = s;
    toast("✅ " + star + "<b>" + esc(ev.when) + ":</b> " + esc(ev.label) + ".");
    if (F.row >= F.lay.rows.length) { F.armed = false; F.done = true; F.replay = false; const done = F.lay; setTimeout(() => { if (L.phase === "active") openPanel(() => done.h.finish()); F.lay = null; F.done = false; }, 1100); }
  } else {
    h.miss(r.ev.key); F.miss[s.row]++;   // v2.8.3: the miss counts against THIS row's event (it used to cost a later row its star)
    const m = F.miss[s.row];
    fordSplash(s, "💦 Not this one: <b>" + esc(fordName(ev)) + "</b> happened <b>later</b>. " + (m >= 3 ? "The <b>glowing gold</b> stone came first." : m >= 2 ? "Look for the <b>gold hint</b>." : "Try the other stone!"));
  }
}

// ---- world cards (small overlays inside the world; never block the game) ----
function cardBtns(list) { return '<div class="w-card-btns">' + list.map((b, i) => '<button class="btn ' + (b.cls || "") + '" data-wb="' + i + '">' + b.t + "</button>").join("") + "</div>"; }
let cardActs = [];
function card(c) {
  const el = document.getElementById("w-card"); cardActs = c.btns || [];
  if (c.title && c.title.startsWith("❔ How to") && L.sid && COMPASS_HELP[COMPASS[L.sid]] && !c.body.includes("w-ch")) c = { ...c, body: c.body.replace("</ul>", COMPASS_HELP[COMPASS[L.sid]].replace("<li>", '<li class="w-ch">') + "</ul>") };
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
  return { title: "🧥 Too cold to cross", body: "<p>The wind in the glacier pass is too strong and cold. You need a <b>Fur Cloak</b> first.</p><p>Unlock it with <b>" + ((window.GAME_CONTENT && GAME_CONTENT.correctPerGear) || 5) + " correct answers</b>, then trade ⭐ stars for it at the camp trade circle. Earn answers and stars: try the Traveler’s Journal at camp, Craft a Clovis Point at the hearth, the Evidence Scroll questions, or the Timeline on the river’s stepping stones.</p>", btns: [{ t: "🛍️ Trade for the Fur Cloak", f: () => { closeCard(); openPanel(() => { L.inMarket = true; window.ABRPG.market("m0"); }); } }, actBtn("s1-clovis", "🪨 Craft a Clovis Point"), actBtn("s1-timeline", "📓 Journal Timeline"), { t: "🗂️ Switch to Classic screens", cls: "alt", f: () => { closeCard(); setMode("classic"); } }] };
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
  h.innerHTML = '<div id="w-obj" aria-live="polite"><span id="w-comp" aria-hidden="true"></span><span id="w-obj-t"></span><span id="w-dist"></span></div><div id="w-era"></div>' +
    '<button id="w-prompt" hidden></button>' +
    '<div id="w-joy" aria-hidden="true"><div id="w-knob"></div></div><button id="w-use" aria-label="Use">✋ Use</button>' +
    '<div id="w-tools"><button id="gfx-mode" class="chip" title="Graphics: Auto / High / Low">✨ Auto</button><button id="w-help" class="chip" title="How to play">❔ Help</button></div>' +
    '<div id="w-keys">W forward · Z back · A left · S right (or arrows) to walk · drag to look · <b>E</b> to use</div>';
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
const BACK = { s1: "🏕️ Back to Beringia", s2: "🔥 Back to the Council Fire", s3: "⛵ Back to the Voyage", s4: "🗺️ Back to the Three Empires", s5: "🏛️ Back to Jamestown and Plymouth", s6: "🔔 Back to the Thirteen Colonies", s7: "⚔️ Back to the French and Indian War" }, WALKNAME = { s1: "🚶 Walk Beringia", s2: "🚶 Walk Native Nations", s3: "🚶 Walk the Voyage of 1492", s4: "🚶 Walk the Three Empires", s5: "🚶 Walk Jamestown and Plymouth", s6: "🚶 Walk the Thirteen Colonies", s7: "🚶 Walk the French and Indian War" };
function helpCard() { if (L.sid === "s2") return helpCardS2(); if (L.sid === "s3") return helpCardS3(); if (L.sid === "s4") return helpCardS4(); if (L.sid === "s5") return helpCardS5(); if (L.sid === "s6") return helpCardS6(); if (L.sid === "s7") return helpCardS7(); card({ title: "❔ How to explore Beringia", body: "<p>You are <b>" + esc(heroName()) + "</b>, living in Beringia during the last Ice Age. Follow the worn path north, marker by marker.</p><ul><li><b>Walk:</b> <b>W</b> forward, <b>Z</b> back, <b>A</b> left, <b>S</b> right (the way the camera faces), or the arrow keys, or the joystick (touch).</li><li><b>Look around:</b> drag on the world.</li><li><b>Use a glowing ring:</b> stand in it and press <b>E</b>, <b>Enter</b> or <b>Space</b>, or tap the ✋ button.</li><li>Gold rings are new, blue rings are done, and pale-gold rings have 3 ⭐. Gray rings are still locked.</li><li>The 🗂️ chip at the top switches back to the classic screens any time. Your progress is the same in both.</li></ul>" }); W.seen.help = true; saveW(); }
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
    if (show && !ban.innerHTML) { ban.innerHTML = '<b>New in v3.0:</b> walk the French and Indian War in 3D: a frontier farm, Fort Necessity, the Forks of the Ohio, the Albany Congress and the Plains of Abraham at Quebec (plus the Thirteen Colonies, Jamestown and Plymouth, the Three Empires, the Voyage of 1492, the Native Nations and Beringia)! <button class="btn small gold" id="w-ban-go">🚶 Walk Beringia</button><button class="btn small alt" id="w-ban-no">🗂️ Keep classic screens</button>'; document.getElementById("w-ban-go").onclick = () => { W.seenIntro = true; saveW(); ban.hidden = true; setMode("walk", true); }; document.getElementById("w-ban-no").onclick = () => { W.seenIntro = true; saveW(); ban.hidden = true; setMode("classic"); }; } }
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
      if (kind === "trial" && sid === "s7") {
        if (L.bypass || L.phase === "off") return false;
        if (L.sid !== "s7") { enterLevel("s7"); return true; }
        resume(); if (gateOpenS7()) setTimeout(() => toast("🎖️ The Trial waits on the <b>Plains of Abraham</b>, marker 7, across the St. Lawrence. Follow the arrow!"), 50); else setTimeout(() => card(gateLockedCardS7()), 50);
        return true;
      }
      if (kind === "trial" && sid === "s6") {
        if (L.bypass || L.phase === "off") return false;
        if (L.sid !== "s6") { enterLevel("s6"); return true; }
        resume(); if (gateOpenS6()) setTimeout(() => toast("🏛️ The Trial waits at the <b>Stadt Huys</b> in Albany, marker 7. Follow the arrow!"), 50); else setTimeout(() => card(gateLockedCardS6()), 50);
        return true;
      }
      if (kind === "trial" && sid === "s5") {
        if (L.bypass || L.phase === "off") return false;
        if (L.sid !== "s5") { enterLevel("s5"); return true; }
        resume(); if (gateOpenS5()) setTimeout(() => toast("🏛️ The Trial waits at the <b>fort-meetinghouse</b> on the hill, marker 7. Follow the arrow!"), 50); else setTimeout(() => card(gateLockedCardS5()), 50);
        return true;
      }
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
    const [B, H, G, T, SPK, MA] = await Promise.all([import(sid === "s7" ? "./world/frontier.js" : sid === "s6" ? "./world/thirteen.js" : sid === "s5" ? "./world/colonies.js" : sid === "s4" ? "./world/empires.js" : sid === "s3" ? "./world/voyage.js" : sid === "s2" ? "./world/nations.js" : "./world/beringia.js"), import("./world/hero3d.js"), import("./world/gfx.js"), import("./world/toon.js"), import("./world/sparks.js"), import("./world/merge-ao.js")]);
    if (!L.mods) L.mods = { B, H, G };
    const rings = sid === "s7" ? ringDefsS7(B) : sid === "s6" ? ringDefsS6(B) : sid === "s5" ? ringDefsS5(B) : sid === "s4" ? ringDefsS4(B) : sid === "s3" ? ringDefsS3(B) : sid === "s2" ? ringDefsS2(B) : ringDefs(B);
    const aoHolder = new THREE.Group(); aoHolder.name = "contact-ao"; aoHolder.userData.noMerge = true;   // the AO helper adds its mesh here
    const mergeAO = MA.createMergeAO(THREE, aoHolder, { groundH: B.groundH });
    let lvl, cave;
    if (sid === "s2" || sid === "s3" || sid === "s4" || sid === "s5" || sid === "s6" || sid === "s7") {
      const SS = window.ABRPG.sectionById(sid), clues = SS && (SS.activities || []).find(a => a.id === (sid === "s4" ? "s4-goals" : sid === "s3" ? "s3-exchange" : "s2-clues")), matLabels = {};
      if (clues) for (const b of clues.bins) matLabels[b.id] = (b.icon ? b.icon + " " : "") + b.label;
      lvl = sid === "s7" ? B.buildFrontier({ mergeAO, rings, matLabels }) : sid === "s6" ? B.buildThirteen({ mergeAO, rings, matLabels }) : sid === "s5" ? B.buildColonies({ mergeAO, rings, matLabels }) : sid === "s4" ? B.buildEmpires({ mergeAO, rings, matLabels }) : sid === "s3" ? B.buildVoyage({ mergeAO, rings, matLabels }) : B.buildNations({ mergeAO, rings, matLabels });
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
  const ok = L.sid === "s7" ? ["s7"] : L.sid === "s6" ? ["s6"] : L.sid === "s5" ? ["s5"] : L.sid === "s4" ? ["s4"] : L.sid === "s3" ? ["s3"] : L.sid === "s2" ? ["s1", "s2"] : ["s1"];
  for (const sl of Object.keys(S.equip || {})) { const k = S.equip[sl], i = it[k]; if (i && (ok.includes(i.section) || i.allEras) && i.art) out.push({ art: i.art, color: i.color, top: i.top, skirt: i.skirt }); }   // v2.9: dyes + hair colors in every era
  return out;
}
function buildHero() {
  const p = ST().players && (ST().players[L.sid] || ST().players.s1), art = gearArt(), outfit = L.sid === "s3" || L.sid === "s4" || L.sid === "s5" || L.sid === "s6" || L.sid === "s7" ? "wool" : "hide", key = JSON.stringify([p && p.gender, art, outfit]);
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
  if (L.sid === "s4") { L.zone = "out"; L.pos.set(-56, B.groundH(-56, -56), -56); L.yaw = 0; return; }
  if (L.sid === "s7") { L.zone = "out"; L.pos.set(-14, B.groundH(-14, -62), -62); L.yaw = 0; return; }   // the frontier farm, facing north
  if (L.sid === "s6") { L.zone = "out"; L.pos.set(-42, B.groundH(-42, -64), -64); L.yaw = 0; return; }   // Charles Town, facing north up the road
  if (L.sid === "s5") { L.zone = "out"; L.pos.set(-42, B.groundH(-42, -64), -64); L.yaw = 0; return; }   // Roanoke Island, facing north to the empty fort   // St. Augustine, facing north into town
  if (L.sid === "s3") { L.zone = "out"; L.pos.set(-38, B.groundH(-38, 44), 44); L.yaw = 0; return; }   // Palos square, facing north to the church of San Jorge
  if (zone === "cave") { L.zone = "cave"; L.pos.set(B.CAVE_X, 0, 5); L.yaw = Math.PI; }
  else { L.zone = "out"; L.pos.set(0, B.groundH(0, -4), -4); L.yaw = 0; }
}
async function enterLevel(sid = L.sid) {
  const from = L.sid; if (L.phase !== "off" && from !== sid) saveWorldPos();
  if (!(await ensureBuilt(sid))) { window.ABRPG.enterSection(sid, true); return; }
  const B = L.mods.B;
  window.ABRPG.closeModal && document.getElementById("modal") && !document.getElementById("modal").classList.contains("hidden") && window.ABRPG.closeModal();
  if ((sid === "s2" || sid === "s3" || sid === "s4" || sid === "s5" || sid === "s6" || sid === "s7") && (L.phase === "off" || from !== sid)) {
    // spawn: a Trial in progress → the meeting ground (s3: Hispaniola harbor); else her saved spot (if valid) or the start
    const a = W.at[sid], t = B.RING_AT.trial;
    if (trialActive(sid) && sid === "s3") { const h = B.HARBORS.hisp; L.zone = "out"; L.pos.set(h.x, 0, h.z); L.yaw = h.yaw; setTimeout(() => toast("⛈️ Your Trial is waiting. Step into the ring by the Niña to resume."), 300); }
    else if (trialActive(sid) && sid === "s7") { L.zone = "out"; L.pos.set(t[0], 0, t[1] - 4); L.yaw = 0; setTimeout(() => toast("🎖️ Your Trial is waiting. Step into the ring on the Plains of Abraham to resume."), 300); }
    else if (trialActive(sid) && sid === "s6") { L.zone = "out"; L.pos.set(t[0], 0, t[1] - 4); L.yaw = 0; setTimeout(() => toast("🏛️ Your Trial is waiting. Step into the ring at the Stadt Huys door to resume."), 300); }
    else if (trialActive(sid) && sid === "s5") { L.zone = "out"; L.pos.set(t[0], 0, t[1] - 4); L.yaw = 0; setTimeout(() => toast("🏛️ Your Trial is waiting. Step into the ring at the fort-meetinghouse door to resume."), 300); }
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
  buildHero(); moveHeroTo(L.pos.x, L.pos.z, L.zone); compassSetup(sid);
  document.getElementById("w-era").textContent = sid === "s7" ? "Section 7 · The French and Indian War, 1754–1763 · the Ohio frontier, Fort Necessity 1754, Albany 1754, Quebec 1759" : sid === "s6" ? "Section 6 · The Thirteen Colonies to 1754 · Charles Town, Williamsburg, the Great Awakening, Philadelphia, Boston, Albany 1754" : sid === "s5" ? "Section 5 · Jamestown and Plymouth · Roanoke 1587, James Fort 1607, the General Assembly 1619, the Mayflower Compact 1620" : sid === "s4" ? "Section 4 · Three Empires c. 1610 · St. Augustine 1565, Quebec 1608, Santa Fe about 1610, New Amsterdam 1624–26" : sid === "s3" ? "Section 3 · The Voyage of 1492 · Palos, Spain to the Caribbean, 1492–1493" : sid === "s2" ? "Section 2 · Native Nations of North America · about 1000 to the 1500s" : "Section 1 · Ice Age Beringia · more than 14,000 years ago";
  setPhase("active");
  if (!W.seen[sid === "s7" ? "help7" : sid === "s6" ? "help6" : sid === "s5" ? "help5" : sid === "s4" ? "help4" : sid === "s3" ? "help3" : sid === "s2" ? "help2" : "help"]) setTimeout(() => { if (L.phase === "active" && !L.cardOpen) helpCard(); }, 400);
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
  if (p === "active") { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = (L.lvl && L.lvl.polish && L.lvl.polish.exposure) || 1.05; if (L.toon && L.toon.rimMat && L.lvl && L.lvl.polish && L.lvl.polish.rim) L.toon.rimMat.uniforms.uColor.value.set(L.lvl.polish.rim); if (L.gfx) L.gfx.apply(); L.dirty = true; L.clock = makeClock(); if (L.built && L.lvl) { try { refreshRings(); } catch (e) { } L._refT = 0.5; }  requestAnimationFrame(layoutHud); }   // v2.6: ring states are right on the first frame back
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
// v2.8.1 (John): W forward, Z back, A left, S right, all relative to the camera; arrows still work. D no longer moves.
const KEYMAP = { KeyW: "f", ArrowUp: "f", KeyZ: "b", ArrowDown: "b", KeyA: "l", ArrowLeft: "l", KeyS: "r", ArrowRight: "r" };
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
  if (L.sid === "s7") return nextTargetS7();
  if (L.sid === "s6") return nextTargetS6();
  if (L.sid === "s5") return nextTargetS5();
  if (L.zone === "cave") return L.cave.rings.find(r => r.def.id === "trial");
  const rings = L.lvl.rings, hs = routeS(L.pos.x, L.pos.z);
  // v2.8.3: while the timeline is on, the banner and compass point at the row to step on (the banner never fades)
  if (F.armed && F.lay && F.row < F.lay.rows.length) { const st = L.mods.B.STONES.filter(s => s.row === F.row), x = st.reduce((a, s) => a + s.x, 0) / st.length;
    return { def: { id: "s1-timeline", station: "ford", x, z: st[0].z, text: F.row === F.lay.rows.length - 1 ? "🪨 Last stone! Step on it to finish your timeline" : "🪨 Row " + (F.row + 1) + " of " + F.lay.rows.length + ": step on the event that happened FIRST" } }; }
  const gate = rings.find(r => r.def.id === "gate"), door = rings.find(r => r.def.id === "cave-door");
  const unfinished = r => r.def.id !== "gate" && r.def.id !== "cave-door" && (r.state === "new" || (r.def.id === "tracks" && r.state !== "done"));
  let best = null, bs = 1e9;
  for (const r of rings) { if (!unfinished(r)) continue; const rs = r._s != null ? r._s : (r._s = routeS(r.def.x, r.def.z)); if (rs >= hs - 6 && rs < bs) { bs = rs; best = r; } }
  if (!hasCloak()) { const gs = gate._s != null ? gate._s : (gate._s = routeS(gate.def.x, gate.def.z)); if (!best || bs > gs) return gate; }
  return best || door;
}
// ---- v2.8.2 compass (John: "make it clear which way to walk along the paths ... with a compass of some sort") ----
// A dial at the left end of the objective banner. Its gold pointer turns with the camera toward the next stop
// (nextTarget(): the next un-done station in the level's path order, then the gate / exit / Trial); the dial's N mark
// shows real north (+z on every level). Styled per era: Levels 1-2 a carved "guide stone" (no magnetic compass
// existed; the help card says travelers used the sun, landmarks and rivers), Level 3 a brass mariner's compass
// (Columbus steered by one) and Level 4, Levels 5-6 a brass-and-wood compass of the 1600s-1700s. The banner adds the distance.
const COMPASS = { s1: "stone", s2: "stone", s3: "brass", s4: "brass", s5: "wood", s6: "wood", s7: "brass" };
const COMPASS_HELP = {
  stone: "<li><b>Guide stone</b> (top): the gold pointer shows the way to your next stop, and <b>N</b> marks north. It is a game helper: Ice Age and Native travelers had no compass and found their way by the sun, the stars, rivers and landmarks.</li>",
  brass: "<li><b>Compass</b> (top): the gold pointer shows the way to your next stop, and <b>N</b> marks north. Sailors of 1492 really steered by a magnetic compass.</li>",
  wood: "<li><b>Compass</b> (top): the gold pointer shows the way to your next stop, and <b>N</b> marks north. Glowing footprints on the ground lead the first few steps.</li>"
};
function compassSVG(style) {
  const ticks = Array.from({ length: 16 }, (_, k) => { const a = k * Math.PI / 8, r0 = k % 4 === 0 ? 33 : k % 2 === 0 ? 36 : 38; return '<line x1="' + (Math.sin(a) * r0).toFixed(1) + '" y1="' + (-Math.cos(a) * r0).toFixed(1) + '" x2="' + (Math.sin(a) * 41).toFixed(1) + '" y2="' + (-Math.cos(a) * 41).toFixed(1) + '"/>'; }).join("");
  const T = {
    stone: { rim: ["#a9a196", "#6d665c"], face: ["#c9c1b2", "#8f877a"], tick: "#4a4238", n: "#8a2f1c", pt: ["#f3e6c4", "#5a4630"] },
    brass: { rim: ["#f2d27a", "#8a6420"], face: ["#fbf3dc", "#e3d3a6"], tick: "#5b4316", n: "#a3271b", pt: ["#ffd75e", "#3a2a08"] },
    wood:  { rim: ["#b07a45", "#5b3517"], face: ["#f6ecd0", "#dccb9c"], tick: "#4b3214", n: "#a3271b", pt: ["#ffd75e", "#3a2a08"] }
  }[style] || {};
  const rose = style === "stone"
    ? '<path d="M0-30 L5-6 L30 0 L5 6 L0 30 L-5 6 L-30 0 L-5-6Z" fill="none" stroke="' + T.tick + '" stroke-width="2" opacity=".55"/>'
    : '<path d="M0-31 L6-6 L31 0 L6 6 L0 31 L-6 6 L-31 0 L-6-6Z" fill="' + T.tick + '" opacity=".22"/><path d="M0-31 L6-6 L0 0Z M31 0 L6 6 L0 0Z M0 31 L-6 6 L0 0Z M-31 0 L-6-6 L0 0Z" fill="' + T.tick + '" opacity=".55"/>';
  return '<svg viewBox="-50 -50 100 100" width="100%" height="100%"><defs>' +
    '<radialGradient id="wc-r" cx=".4" cy=".35"><stop offset="0" stop-color="' + T.rim[0] + '"/><stop offset="1" stop-color="' + T.rim[1] + '"/></radialGradient>' +
    '<radialGradient id="wc-f" cx=".42" cy=".38"><stop offset="0" stop-color="' + T.face[0] + '"/><stop offset="1" stop-color="' + T.face[1] + '"/></radialGradient></defs>' +
    '<circle r="48" fill="url(#wc-r)" stroke="#000" stroke-width="2.5"/><circle r="42" fill="url(#wc-f)"/>' +
    '<g id="w-rose">' + rose + '<g stroke="' + T.tick + '" stroke-width="2">' + ticks + '</g>' +
    '<path d="M0-44 L6-33 L-6-33Z" fill="' + T.n + '"/><text x="0" y="-19" text-anchor="middle" font-size="15" font-weight="900" font-family="Georgia,serif" fill="' + T.n + '">N</text></g>' +
    '<g id="w-arrow"><path d="M0-36 L11-4 L4-6 L4 22 L-4 22 L-4-6 L-11-4Z" fill="' + T.pt[0] + '" stroke="' + T.pt[1] + '" stroke-width="3" stroke-linejoin="round"/></g>' +
    '<circle r="4.5" fill="' + T.pt[1] + '"/></svg>';
}
const CMP = { style: "", needle: 0, north: 0, nd: null, rd: null, dist: "" };
function compassSetup(sid) { const el = document.getElementById("w-comp"); if (!el) return; const st = COMPASS[sid] || "brass"; if (CMP.style === st && el.firstChild) return; CMP.style = st; el.className = "wc-" + st; el.innerHTML = compassSVG(st); CMP.nd = el.querySelector("#w-arrow"); CMP.rd = el.querySelector("#w-rose"); CMP.needle = CMP.north = 1e9; }
const unwrapDeg = (prev, a) => prev > 1e8 ? a : prev + ((((a - prev) % 360) + 540) % 360 - 180);
function compassStep(tg, dt) {
  if (!CMP.nd) compassSetup(L.sid); if (!CMP.nd) return;
  // screen angles, clockwise from straight up: the camera looks along (sin camYaw, cos camYaw) and +x is on its left
  const north = L.camYaw * 180 / Math.PI;
  const goal = tg ? -(Math.atan2(tg.def.x - L.pos.x, tg.def.z - L.pos.z) - L.camYaw) * 180 / Math.PI : north;
  const k = Math.min(1, dt * 12), sm = (prev, a) => { const u = unwrapDeg(prev, a); return prev > 1e8 ? u : prev + (u - prev) * k; };
  const n2 = sm(CMP.north, north), g2 = sm(CMP.needle, goal);
  if (Math.abs(n2 - CMP.north) > 0.2) { CMP.north = n2; CMP.rd.setAttribute("transform", "rotate(" + n2.toFixed(1) + ")"); }
  if (Math.abs(g2 - CMP.needle) > 0.2) { CMP.needle = g2; CMP.nd.setAttribute("transform", "rotate(" + g2.toFixed(1) + ")"); }
  const d = tg ? Math.hypot(tg.def.x - L.pos.x, tg.def.z - L.pos.z) : 0;
  const txt = !tg ? "" : d < 4 ? "here" : (d < 50 ? Math.round(d) : Math.round(d / 5) * 5) + " m";
  if (txt !== CMP.dist) { CMP.dist = txt; const e = document.getElementById("w-dist"); if (e) { e.textContent = txt; e.hidden = !txt; } }
}
// the in-world guide: six glowing footprints from 1.6 m to about 7 m ahead of her, toward the next stop, stopping at
// water or walls and 2.5 m short of the stop. One InstancedMesh (1 draw call), additive, a wave rolling away from her.
function trailStep(tg, dt) {
  const sc = L.zone === "out" && L.lvl && L.lvl.scene; if (!sc) return;
  let tr = L.lvl._trail;
  if (!tr) {
    const g = new THREE.CircleGeometry(0.5, 12); g.rotateX(-Math.PI / 2); g.scale(0.22, 1, 0.5);
    const m = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    tr = new THREE.InstancedMesh(g, m, 6); tr.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(18), 3);
    tr.frustumCulled = false; tr.renderOrder = 3; tr.userData.noMerge = true; tr.name = "guide-trail"; sc.add(tr); L.lvl._trail = tr; tr._t = 0; tr._m = new THREE.Matrix4(); tr._q = new THREE.Quaternion(); tr._v = new THREE.Vector3(); tr._s = new THREE.Vector3(1, 1, 1);
  }
  const d = tg ? Math.hypot(tg.def.x - L.pos.x, tg.def.z - L.pos.z) : 0;
  const show = !!tg && d > 5 && !L.cardOpen && !(F.armed && F.lay) && L.phase === "active";
  tr.visible = show; if (!show) return;
  tr._t += dt; const ux = (tg.def.x - L.pos.x) / d, uz = (tg.def.z - L.pos.z) / d, yaw = Math.atan2(ux, uz);
  tr._q.setFromAxisAngle(UP, yaw); let n = 0;
  for (let i = 0; i < 6; i++) {
    const s = 1.6 + i * 1.1; if (s > d - 2.5) break;
    const side = i % 2 ? 0.14 : -0.14, x = L.pos.x + ux * s + uz * side, z = L.pos.z + uz * s - ux * side;
    if (!walkable(x, z) || inWater(x, z)) break;
    tr._v.set(x, supportY(x, z) + 0.04, z); tr._m.compose(tr._v, tr._q, tr._s); tr.setMatrixAt(i, tr._m);
    const b = (0.18 + 0.5 * Math.max(0, Math.sin(tr._t * 3.2 - i * 0.8))) * (1 - i / 7); tr.instanceColor.setXYZ(i, b, b * 0.86, b * 0.45); n++;
  }
  tr.count = n; tr.instanceMatrix.needsUpdate = true; tr.instanceColor.needsUpdate = true;
}
// ---- per-frame ----
const UP = new THREE.Vector3(0, 1, 0), tgt = new THREE.Vector3();
// v2.3: camera collision. The camera eases toward its spot behind her, then a short march from her head toward the
// camera pulls it in front of anything solid it would pass through (ice walls, the gate cross-pole and flags, poles,
// tents, the cave hill, the ground), so it never ends up inside geometry.
// v2.8.1 (John: "the camera gets glitchy near a tree or building"): pad > 0 inflates every hard shape (a sphere cast
// along the ray). Tree canopies (raised round occluders, o.soft) no longer pull the camera: brushing past leaves used to
// snap it in and out every few frames. The camera may pass through foliage (back faces are culled, so it just slips by).
function camBlocked(x, y, z, pad = 0, occ = null) {
  const B = L.mods.B;
  if (L.zone === "cave") return Math.hypot(x - B.CAVE_X, z) > 8.6 - pad || y > 4.2 - pad;
  if (y < B.groundH(x, z) + 0.35) return true;
  if (L.sid === "s1") {
    if (z > B.BOUNDS.iceZ - 0.35 - pad && (x < B.BOUNDS.cx0 + 0.5 + pad || x > B.BOUNDS.cx1 - 0.5 - pad)) return true;
    if (z > 189.8 - pad) return true;
  }
  for (const o of occ || L.lvl.camOcc || []) {
    if (o.soft === undefined) o.soft = !!(o.r && !o.arc && o.y0 > -4.5 && o.r >= 1.0);   // tree canopies (and the decorated tree ring)
    if (o.soft || y <= o.y0 - pad || y >= o.y1 + pad) continue;
    if (o.arc) { const d = Math.hypot(x - o.x, z - o.z); if (Math.abs(d - o.r) < o.w + pad && Math.abs(wrapA(Math.atan2(z - o.z, x - o.x) - o.gapA)) > o.gapHalf) return true; continue; }
    if (o.r ? Math.hypot(x - o.x, z - o.z) < o.r + pad : (Math.abs(x - o.x) < o.hx + pad && Math.abs(z - o.z) < o.hz + pad)) return true;
  }
  return false;
}
const LOOK_UP = 2.0;
const CAM_PAD = 0.3, CAM_MIN = 1.2, CAM_IN_MAX = 10, CAM_OCC = [];   // m/s: fastest pull-in
function placeCamera(dt, snap) {
  const B = L.mods.B, pitch = 0.5, dist = 7, yaw = L.camYaw;
  tgt.set(L.pos.x, L.pos.y + 1.25, L.pos.z);
  const cp = new THREE.Vector3(tgt.x - Math.sin(yaw) * Math.cos(pitch) * dist, tgt.y + Math.sin(pitch) * dist, tgt.z - Math.cos(yaw) * Math.cos(pitch) * dist);
  if (L.zone === "out") { const gh = B.groundH(cp.x, cp.z) + 0.7; if (cp.y < gh) cp.y = gh; if (L.sid === "s1" && cp.z > B.BOUNDS.iceZ - 0.5 && L.pos.z > B.BOUNDS.iceZ - 2) { cp.x = Math.max(B.BOUNDS.cx0 + 0.6, Math.min(B.BOUNDS.cx1 - 0.6, cp.x)); cp.z = Math.min(189.4, cp.z); } }
  else cp.y = Math.min(cp.y, 4.0);
  // v2.8.1: the ideal spot (L.camIdeal) eases as before, but the collision pull-in no longer writes into it. Before, the
  // pulled spot was the next frame's starting point, the march found hits only in 0.2 m steps and canopies counted as
  // walls, so the camera pumped in and out (and the view tilted with it) whenever she walked near trees or houses.
  if (snap || !L.camIdeal) L.camIdeal = cp.clone(); else L.camIdeal.lerp(cp, Math.min(1, dt * 8));
  const dx = L.camIdeal.x - tgt.x, dy = L.camIdeal.y - tgt.y, dz = L.camIdeal.z - tgt.z, len = Math.hypot(dx, dy, dz) || 1, ux = dx / len, uy = dy / len, uz = dz / len;
  // sphere cast: march with padded shapes, then refine the first hit by bisection (a smooth, not stepped, distance)
  let allow = len;
  // v2.8.2: only the occluders near this segment are tested (the full list on every march step cost ~8% fps on Levels 3-4)
  const occ = CAM_OCC; occ.length = 0;
  { const x0 = Math.min(tgt.x, tgt.x + dx) - CAM_PAD, x1 = Math.max(tgt.x, tgt.x + dx) + CAM_PAD, z0 = Math.min(tgt.z, tgt.z + dz) - CAM_PAD, z1 = Math.max(tgt.z, tgt.z + dz) + CAM_PAD;
    for (const o of (L.zone !== "cave" && L.lvl.camOcc) || []) { const e = o.arc ? o.r + o.w : o.r ? o.r : Math.max(o.hx, o.hz) * 1.415; if (o.x + e >= x0 && o.x - e <= x1 && o.z + e >= z0 && o.z - e <= z1) occ.push(o); } }
  for (let t = 0.4; t <= len + 0.001; t += 0.25) {
    if (camBlocked(tgt.x + ux * t, tgt.y + uy * t, tgt.z + uz * t, CAM_PAD, occ)) { let lo = Math.max(0, t - 0.25), hi = t; for (let i = 0; i < 5; i++) { const m = (lo + hi) / 2; if (camBlocked(tgt.x + ux * m, tgt.y + uy * m, tgt.z + uz * m, CAM_PAD, occ)) hi = m; else lo = m; } allow = lo; break; }
  }
  allow = Math.max(CAM_MIN, Math.min(len, allow)); L.camAllow = allow;
  // damped distance: fast pull-in, slow ease-out after a short hold (hysteresis: no in/out flutter)
  if (snap || L.camD == null) { L.camD = allow; L.camHold = 0; }
  else if (allow < L.camD) { const gap = L.camD - allow; L.camD -= Math.min(gap, Math.min(CAM_IN_MAX, 3 + gap * 14) * dt); L.camHold = 0.35; }   // quick but never a one-frame snap (a moment inside a wall looks through it: back faces are culled)
  else if (allow > L.camD + 0.15) { L.camHold = Math.max(0, (L.camHold || 0) - dt); if (L.camHold <= 0) L.camD += (allow - L.camD) * Math.min(1, dt * 2.2); }
  L.camD = Math.max(CAM_MIN, Math.min(len, L.camD));
  L.camPulled = L.camD < len - 0.05;
  if (!L.camPos) L.camPos = new THREE.Vector3();
  L.camPos.set(tgt.x + ux * L.camD, tgt.y + uy * L.camD, tgt.z + uz * L.camD);
  // v2.9.1: pinned at the 1.2 m minimum but still inside a wall (she stands right against a house), lift the camera over it
  // (eased up quickly, down slowly), so the view looks down past the roof edge instead of through the back faces
  let lift = 0;
  if (L.zone !== "cave" && L.camD <= CAM_MIN + 0.05 && camBlocked(L.camPos.x, L.camPos.y, L.camPos.z, 0, occ)) { for (let h = 0.25; h <= 2.5; h += 0.25) if (!camBlocked(L.camPos.x, L.camPos.y + h, L.camPos.z, 0.15, occ)) { lift = h; break; } }   // no clear height (ice walls): no lift
  if (snap || L.camLift == null) L.camLift = lift; else if (lift > L.camLift) L.camLift = Math.min(lift, L.camLift + 6 * dt); else L.camLift += (lift - L.camLift) * Math.min(1, dt * 2.2);
  L.camPos.y += L.camLift;
  L.cam.position.copy(L.camPos); L.cam.lookAt(tgt.x, tgt.y + LOOK_UP * Math.min(1, L.camD / 7), tgt.z);   // aim a little above her head (eases with the smoothed distance, so no tilt jumps)
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
  // v2.3: only while she is mostly walking forward. Strafing (A / S alone since v2.8.1; was A / D) used to drag the camera after her sideways
  // travel, so she walked in a circle round it; now sideways steps keep the view still.
  if (L.manualT <= 0 && L.vel > 0.8 && sf > 0.25 && Math.abs(sx) < sf * 0.75 && Math.abs(wrapA(th - L.camYaw)) < 2.2) L.camYaw = L.dz.step(th, dt, true);
  // ford: wading in the icy river → safe respawn on the south bank after 2 s
  if (L.fordFall) L.pos.y = L.mods.B.WATER_Y - 0.35;
  if (inWater(L.pos.x, L.pos.z)) { L.wade += dt; if (L.wade > 2 && !L.frozen) { L.wade = 0; toast("🥶 Brr! The river is too cold. Back onto the <b>stepping stones</b>."); teleport("out", fordRespawn()); } } else L.wade = 0;
  fordStep(); fordHud(); sortStep(dt);
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
  compassStep(tg, dt); trailStep(tg, dt);
  if (tg) {
    const st = L.mods.B.STATIONS[tg.def.station]; const txt = tg.def.text ? tg.def.text : (tg.def.id === "gate" && !hasCloak()) ? "Get your Fur Cloak, then cross the glacier pass" : (() => { const lb = tg.def.label(); return "Marker " + st.n + " · " + (lb.startsWith(st.label) ? lb : st.label + ": " + lb); })();   // v2.6: no "St. Augustine, 1565: St. Augustine, 1565…" doubling
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
  get banner() { const e = document.getElementById("w-obj-t"); return e ? e.textContent : ""; }, get target() { return L.target && L.target.def.id; }, get compass() { const t = L.target; return { style: CMP.style, needle: CMP.needle, north: CMP.north, dist: CMP.dist, camYaw: L.camYaw, tx: t ? t.def.x : null, tz: t ? t.def.z : null, x: L.pos.x, z: L.pos.z, trail: L.lvl && L.lvl._trail ? (L.lvl._trail.visible ? L.lvl._trail.count : 0) : 0 }; }, get fps() { return L.fps.last; }, get near() { return near && near.def.id; },
  rings: () => (L.built ? L.lvl.rings.concat(L.cave.rings).map(r => ({ id: r.def.id, zone: r.def.zone || "out", x: r.def.x, z: r.def.z, state: r.state })) : []),
  teleport(x, z, zone) { if (!L.built) return false; L.zone = zone || (x > 2000 ? "cave" : "out"); L.pos.set(x, 0, z); L.wade = 0; moveHeroTo(x, z, L.zone); return true; },
  faceCam(a) { L.camYaw = a; L.yaw = a; L.dz.snap(a); L.th.reset(); if (L.built && L.hero) placeCamera(0, true); return true; },   // v2.8.2: a scripted view jump snaps the camera (no rate-limited pull-in from the old view)
  ford: () => ({ armed: F.armed, row: F.row, done: F.done, solved: L.built ? fordSolved() : false, rows: F.lay ? F.lay.rows.map(r => ({ right: r.right, key: r.ev.key, when: r.ev.when, name: fordName(r.ev), wrong: r.wrong && r.wrong.key })) : null, stones: L.built ? L.mods.B.STONES.map(s => ({ x: s.x, z: s.z, row: s.row, side: s.side })) : [], labels: F.vis ? F.vis.items.filter(i => i.sp.visible).length : 0, miss: F.miss.slice(), good: F.good && { row: F.good.row, x: F.good.x, z: F.good.z }, marks: F.vis ? F.vis.items.map(i => ({ row: i.s.row, side: i.s.side, key: i.key, label: i.sp.visible, glow: i.gl.visible })) : [], strip: (() => { const e = document.getElementById("w-ford"); return e && !e.hidden ? e.textContent : ""; })(), respawn: L.mods && L.mods.B && L.mods.B.FORD_RESPAWN, riverZ: L.mods && L.mods.B && L.mods.B.riverZ ? L.mods.B.riverZ(-5) : null }),
  use: () => useRing(), card: () => (L.cardOpen ? document.getElementById("w-card").textContent : null), closeCard: () => closeCard(),
  get level() { return L.sid; }, readS2: () => W.read.s2.slice(), at: () => JSON.parse(JSON.stringify(W.at)), seen: () => ({ ...W.seen }),
  sort: () => ({ active: SP.active, cur: SP.cur && SP.cur.t, key: SP.cur && SP.cur.key, left: SP.h ? SP.h.left() : null, mistakes: SP.h ? SP.h.mistakes() : null, hint: SP.hintBin, mats: L.lvl && L.lvl.mats ? L.lvl.mats.map(m => ({ bin: m.bin, x: m.x, z: m.z, bundles: m.bundles, glow: !!m.glowOn })) : [] }),
  stations: () => (L.mods && L.mods.B.STATIONS) || null, solid: (x, z) => solidAt(x, z), walkable: (x, z) => walkable(x, z),
  readL: sid => (W.read[sid] || []).slice(), stormOpen: () => stormOpen(), boardOpen: () => boardOpen(), sail: (k) => sailTo(k), gateOpenS4: () => gateOpenS4(), canoe: (side) => canoeTo(side), gateOpenS5: () => gateOpenS5(), gateOpenS6: () => gateOpenS6(), gateOpenS7: () => gateOpenS7(), boat7: (side) => boatToS7(side), ship5: (side) => shipToS5(side),
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
