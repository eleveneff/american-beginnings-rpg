/* American Beginnings — game engine. Plain JS, no build step.
   Content lives in content/*.js (window.GAME_CONTENT). */
(function () {
  "use strict";
  var C = window.GAME_CONTENT;
  var SAVE_KEY = "americanBeginningsRPG_v1";
  var DEFAULT_TUNIC = "#a68a64"; /* undyed homespun until the first badge */
  var GAME_VERSION = "v1.0";
  var $screen = document.getElementById("screen");

  /* ---------------- utilities ---------------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>"); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function now() { return new Date().toISOString(); }
  function fmtDate(iso) { if (!iso) return "—"; try { return new Date(iso).toLocaleString(); } catch (e) { return iso; } }
  function pct(r, t) { return t ? Math.round((r / t) * 100) : 0; }
  function sectionById(id) { for (var i = 0; i < C.sections.length; i++) if (C.sections[i].id === id) return C.sections[i]; return null; }
  function qById(id) { for (var i = 0; i < C.sections.length; i++) { var qs = C.sections[i].questions; for (var j = 0; j < qs.length; j++) if (qs[j].id === id) return { q: qs[j], s: C.sections[i] }; } return null; }
  function lessonFor(s, topic) { for (var i = 0; i < s.lessons.length; i++) if (s.lessons[i].topic === topic) return s.lessons[i]; return s.lessons[0]; }
  function topicTitle(s, topic) { return lessonFor(s, topic).title.replace(/^Scroll \d+:\s*/, ""); }

  /* Answer normalization: case-insensitive, ignores accents, punctuation,
     extra spaces and a leading "the/a/an". Allows one typo for answers of
     6+ letters. */
  function norm(s) {
    s = String(s || "").toLowerCase();
    if (s.normalize) s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
    s = s.replace(/^(the|a|an) /, "");
    return s;
  }
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      { d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); }
    return d[m][n];
  }
  function checkTyped(q, input) {
    var x = norm(input); if (!x) return false;
    for (var i = 0; i < q.accept.length; i++) {
      var a = norm(q.accept[i]);
      if (x === a) return true;
      if (a.length >= 6 && lev(x, a) <= 1) return true;
    }
    return false;
  }

  /* ---------------- save data ---------------- */
  function blankSave() {
    return { version: 1, created: now(), lastPlayed: now(), players: {}, sections: {}, final: { attempts: 0, bestPct: 0, passed: false, passedAt: null, history: [] }, gear: [], badges: [], totalCorrect: 0, totalAnswered: 0, run: null };
  }
  var S;
  function load() {
    try { S = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { S = null; }
    S = migrate(S);
  }
  /* Save migration: future versions upgrade older saves here so progress is never lost. */
  function migrate(d) {
    if (!d || typeof d !== "object" || !d.version) return blankSave();
    var b = blankSave();
    Object.keys(b).forEach(function (k) { if (d[k] === undefined) d[k] = b[k]; });
    if (!d.final.history) d.final.history = [];
    d.version = 1; return d;
  }
  function save() { S.lastPlayed = now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
  function sec(id) {
    if (!S.sections[id]) S.sections[id] = { attempts: 0, history: [], bestPct: 0, completed: false, completedAt: null, startedAt: null, correctCount: 0, gearEarned: 0, topics: {}, missed: {} };
    return S.sections[id];
  }
  function isUnlocked(i) {
    if (i === 0) return true;
    var prev = S.sections[C.sections[i - 1].id];
    return !!(prev && prev.completed);
  }
  function allDone() { return C.sections.every(function (s) { return S.sections[s.id] && S.sections[s.id].completed; }); }

  /* ---------------- hero (low-poly SVG) ---------------- */
  function currentPlayer() {
    var sid = S.run && S.run.sid; if (sid && S.players[sid]) return S.players[sid];
    var last = null; Object.keys(S.players).forEach(function (k) { var p = S.players[k]; if (!last || (p.at || "") > (last.at || "")) last = p; });
    return last || { gender: "girl", name: "Adventurer" };
  }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function poly(pts, fill, extra) { return '<polygon points="' + pts + '" fill="' + fill + '" stroke="#1a1208" stroke-width="2" stroke-linejoin="round" ' + (extra || "") + "/>"; }
  function emoji(x, y, size, ch) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle" dominant-baseline="central">' + ch + "</text>"; }
  function heroSVG() {
    var p = currentPlayer(), girl = p.gender !== "boy";
    var tunic = DEFAULT_TUNIC; if (S.badges.length) tunic = S.badges[S.badges.length - 1].tunic || tunic;
    var slots = {}; S.gear.forEach(function (g) { slots[g.slot] = g; });
    var skin = "#f2c79b", hair = girl ? "#7a3e1d" : "#5a3418", o = [];
    o.push('<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your hero">');
    o.push('<ellipse cx="100" cy="248" rx="58" ry="9" fill="rgba(0,0,0,.3)"/>');
    if (slots.cloak) o.push(poly("62,92 138,92 156,232 100,240 44,232", slots.cloak.color), poly("62,92 100,96 100,240 44,232", shade(slots.cloak.color, -25)));
    if (slots.back) { var bc = slots.back.color; o.push(poly("124,88 156,96 158,160 126,156", bc), poly("124,88 140,92 142,158 126,156", shade(bc, -30)), emoji(146, 80, 24, slots.back.icon)); }
    if (girl) o.push(poly("66,52 134,52 140,140 60,140", hair));
    o.push(poly("82,200 98,200 96,236 78,236", "#6b4a2b"), poly("102,200 118,200 122,236 104,236", "#6b4a2b"));
    o.push(poly("74,232 98,232 98,244 70,244", "#3b2414"), poly("102,232 126,232 130,244 102,244", "#3b2414"));
    o.push(poly("70,96 130,96 140,206 60,206", tunic), poly("70,96 100,100 100,206 60,206", shade(tunic, -28)));
    o.push(poly("70,96 100,124 130,96 116,92 100,104 84,92", shade(tunic, 30)));
    o.push(poly("70,98 56,104 46,160 58,164 68,120", tunic), poly("130,98 144,104 156,158 144,162 132,120", shade(tunic, -18)));
    o.push(poly("44,158 60,160 58,174 44,172", skin), poly("142,156 158,158 158,172 142,170", skin));
    o.push(poly("63,166 137,166 138,178 62,178", "#5b3a1a"), poly("94,164 106,164 106,180 94,180", "#e0b23a"));
    o.push(poly("88,84 112,84 110,98 90,98", shade(skin, -20)));
    o.push(poly("72,46 100,30 128,46 132,72 116,92 84,92 68,72", skin), poly("72,46 100,30 100,92 84,92 68,72", shade(skin, -14)));
    o.push('<rect x="84" y="56" width="8" height="10" fill="#1a1208"/><rect x="108" y="56" width="8" height="10" fill="#1a1208"/>');
    o.push(poly("100,62 106,74 98,76", shade(skin, -30)));
    o.push('<circle cx="80" cy="72" r="4" fill="#f29c9c" opacity=".6"/><circle cx="120" cy="72" r="4" fill="#f29c9c" opacity=".6"/>');
    o.push('<polyline points="92,80 100,84 108,80" fill="none" stroke="#8a3b2b" stroke-width="3" stroke-linecap="round"/>');
    if (girl) { o.push(poly("68,50 100,24 132,50 128,58 100,42 72,58", hair)); o.push(poly("62,64 70,56 70,126 60,130", shade(hair, -18))); o.push(poly("130,56 138,64 140,130 130,126", shade(hair, -18))); }
    else o.push(poly("66,54 76,34 100,22 124,34 134,54 120,44 100,40 80,44", hair));
    if (slots.neck) { var nc = slots.neck.color; o.push('<polyline points="78,100 90,116 100,120 110,116 122,100" fill="none" stroke="' + nc + '" stroke-width="5" stroke-linecap="round"/>'); o.push(poly("94,118 106,118 100,130", nc)); o.push(emoji(100, 140, 14, slots.neck.icon)); }
    if (slots.belt) { var b = slots.belt.color; o.push(poly("112,172 132,172 134,196 110,196", b), poly("112,172 122,172 122,196 110,196", shade(b, -25))); o.push(emoji(122, 206, 14, slots.belt.icon)); }
    if (slots.head) {
      var hc = slots.head.color, nm = slots.head.name.toLowerCase();
      if (nm.indexOf("headband") >= 0) { o.push(poly("68,46 132,46 132,56 68,56", hc)); o.push(poly("124,46 134,8 140,12 132,48", "#e8452c"), poly("116,46 120,12 126,14 124,48", "#2b8ae8")); }
      else if (nm.indexOf("tricorn") >= 0) { o.push(poly("56,48 100,26 144,48 100,40", hc)); o.push(poly("74,40 100,14 126,40 100,34", shade(hc, 20))); }
      else if (nm.indexOf("capotain") >= 0) { o.push(poly("58,46 142,46 142,52 58,52", hc), poly("76,46 82,6 118,6 124,46", shade(hc, 15)), poly("78,36 122,36 122,42 78,42", "#c9a227")); }
      else { o.push(poly("62,50 100,18 138,50 128,54 100,40 72,54", hc), poly("66,50 134,50 134,56 66,56", shade(hc, -25))); }
    }
    if (slots.hand) { var hd = slots.hand.color; o.push('<line x1="152" y1="206" x2="166" y2="70" stroke="#6b4a2b" stroke-width="6" stroke-linecap="round"/>'); o.push(poly("160,74 166,44 174,76", hd)); o.push(emoji(170, 34, 26, slots.hand.icon)); }
    S.badges.forEach(function (bd, i) { o.push(emoji(76 + (i % 4) * 16, 140 + Math.floor(i / 4) * 16, 13, bd.icon)); });
    o.push("</svg>");
    return o.join("");
  }
  function renderHero() {
    var p = currentPlayer();
    document.getElementById("hero").innerHTML = heroSVG();
    document.getElementById("hero-name").textContent = p.name;
    var gp = document.getElementById("gear-progress");
    if (S.run && S.run.sid && S.run.sid !== "final") {
      var s = sectionById(S.run.sid), st = sec(s.id), per = C.correctPerGear;
      if (st.gearEarned < s.gear.length) {
        var into = st.correctCount - st.gearEarned * per;
        gp.innerHTML = "Next gear: " + Math.max(0, per - into) + " more correct" + '<div class="bar"><i style="width:' + Math.min(100, (into / per) * 100) + '%"></i></div>';
      } else gp.innerHTML = "All " + esc(s.title) + " gear earned! ✨";
    } else gp.innerHTML = S.gear.length + " gear · " + S.badges.length + " badges";
    renderHUD();
  }
  function renderHUD() {
    document.getElementById("hud").innerHTML = "<span>✅ " + S.totalCorrect + " correct</span><span>🎯 " + pct(S.totalCorrect, S.totalAnswered) + "% overall</span><span>🏅 " + S.badges.length + "/" + C.sections.length + " badges</span>";
  }
  function setWorld(palette) { window.CURRENT_PALETTE = palette; try { window.dispatchEvent(new CustomEvent("palette", { detail: palette })); } catch (e) { } 
    var fb = document.getElementById("sky-fallback"); if (palette) fb.style.background = "linear-gradient(" + palette.sky + "," + palette.sky2 + " 55%," + palette.ground + " 55%," + palette.ground2 + ")"; }

  /* ---------------- modal / toast ---------------- */
  function modal(html) { document.getElementById("modal-box").innerHTML = html; document.getElementById("modal").classList.remove("hidden"); }
  function closeModal() { document.getElementById("modal").classList.add("hidden"); document.getElementById("modal-box").innerHTML = ""; }
  var toastT; function toast(msg) { var t = document.getElementById("toast"); t.innerHTML = msg; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.add("hidden"); }, 3200); }
  function show(html) { $screen.innerHTML = html; window.scrollTo({ top: 0, behavior: "smooth" }); }
  function on(id, fn) { var el = document.getElementById(id); if (el) el.onclick = fn; }

  /* ---------------- world map ---------------- */
  function home() {
    if (S.run && S.run.sid) { /* keep run for resume */ }
    setWorld(null);
    var h = '<div class="panel"><h1>🗺️ ' + esc(C.title) + "</h1><p>" + esc(C.subtitle) + "</p>" +
      "<p>Pick a glowing land to begin. Read each lesson scroll, then pass the Trial. To unlock the next land, you need <b>" + C.passPercent + "% or better</b> on the trial <b>and</b> you must clear every missed question in review. Every <b>" + C.correctPerGear + " correct answers</b> earns new gear!</p></div>";
    h += '<div class="map">';
    C.sections.forEach(function (s, i) {
      var st = S.sections[s.id], un = isUnlocked(i), done = st && st.completed;
      var tag = done ? "✅ " + st.bestPct + "%" : (un ? (S.run && S.run.sid === s.id ? "▶ Resume" : "Open") : "🔒 Locked");
      h += '<button class="node ' + (un ? "" : "locked ") + (done ? "done" : "") + '" data-sid="' + s.id + '" ' + (un ? "" : 'aria-disabled="true"') + '><span class="tag">' + tag + '</span><div class="ic">' + s.icon + "</div><small>Section " + (i + 1) + " · " + esc(s.era) + "</small><h3>" + esc(s.title) + "</h3><small>" + s.lessons.length + " scrolls · " + s.questions.length + " trial questions</small></button>";
    });
    var fu = allDone(), fp = S.final.passed;
    h += '<button class="node ' + (fu ? "" : "locked ") + (fp ? "done" : "") + '" data-sid="final"><span class="tag">' + (fp ? "👑 " + S.final.bestPct + "%" : (fu ? "Open" : "🔒 Finish all 6")) + '</span><div class="ic">' + C.final.icon + "</div><small>End of Unit</small><h3>" + esc(C.final.title) + "</h3><small>" + C.final.questionsPerSection * C.sections.length + " questions from every land</small></button>";
    h += "</div>";
    show(h);
    Array.prototype.forEach.call($screen.querySelectorAll(".node"), function (b) {
      b.onclick = function () {
        var sid = b.getAttribute("data-sid");
        if (sid === "final") { if (allDone()) finalIntro(); else toast("🔒 Master all six lands to open the Grand Trial!"); return; }
        var i = C.sections.indexOf(sectionById(sid));
        if (!isUnlocked(i)) { toast("🔒 Master the previous land first (" + C.passPercent + "% + clear all reviews)."); return; }
        enterSection(sid);
      };
    });
    renderHero();
  }

  /* ---------------- section flow ---------------- */
  function enterSection(sid) {
    var s = sectionById(sid); setWorld(s.palette);
    if (S.run && S.run.sid === sid && (S.run.phase === "trial" || S.run.phase === "review")) {
      show('<div class="panel"><h2>' + s.icon + " " + esc(s.title) + "</h2><p>You have a trial in progress" + (S.run.phase === "review" ? " (review of missed questions)" : "") + ".</p>" +
        '<button class="btn" id="b-resume">▶ Resume where I left off</button><button class="btn alt" id="b-lessons">📜 Re-read the scrolls first</button></div>');
      on("b-resume", function () { S.run.phase === "review" ? nextReview() : nextQuestion(); });
      on("b-lessons", function () { lesson(sid, 0, true); });
      renderHero(); return;
    }
    if (!S.players[sid]) charSelect(sid); else sectionIntro(sid);
  }
  function charSelect(sid) {
    var s = sectionById(sid), gender = "girl", name = null;
    function draw() {
      var names = gender === "girl" ? C.girlNames : C.boyNames;
      var h = '<div class="panel"><h2>' + s.icon + " " + esc(s.title) + " · Who are you?</h2><p>You live in this time and place. Choose your hero for this land.</p>" +
        '<div class="pick" id="pg"><button data-g="girl" class="' + (gender === "girl" ? "sel" : "") + '">👧 Girl</button><button data-g="boy" class="' + (gender === "boy" ? "sel" : "") + '">👦 Boy</button></div><p><b>Pick a name:</b></p><div class="pick" id="pn">';
      names.forEach(function (n) { h += '<button data-n="' + esc(n) + '" class="' + (name === n ? "sel" : "") + '">' + esc(n) + "</button>"; });
      h += '</div><p><b>…or type your own:</b></p><input class="answer" id="custom" maxlength="20" placeholder="Custom name" value="' + (name && names.indexOf(name) < 0 ? esc(name) : "") + '"><br><br><button class="btn" id="b-go">Begin the adventure ▶</button></div>';
      show(h);
      Array.prototype.forEach.call(document.querySelectorAll("#pg button"), function (b) { b.onclick = function () { gender = b.getAttribute("data-g"); name = null; draw(); }; });
      Array.prototype.forEach.call(document.querySelectorAll("#pn button"), function (b) { b.onclick = function () { name = b.getAttribute("data-n"); draw(); }; });
      on("b-go", function () {
        var c = document.getElementById("custom").value.trim();
        var nm = c || name; if (!nm) { toast("Pick a name or type your own!"); return; }
        S.players[sid] = { gender: gender, name: nm.slice(0, 20), at: now() }; save(); renderHero(); sectionIntro(sid);
      });
    }
    draw(); renderHero();
  }
  function sectionIntro(sid) {
    var s = sectionById(sid), p = S.players[sid], st = sec(sid);
    if (!st.startedAt) { st.startedAt = now(); save(); }
    S.run = { sid: sid, phase: "lessons" }; save();
    var h = '<div class="scene"><div class="who">' + s.icon + " " + esc(s.title) + " · " + esc(s.era) + "</div>";
    s.scene.forEach(function (para) { h += "<p>" + md(para.replace(/\{name\}/g, p.name)) + "</p>"; });
    h += '</div><div class="panel"><button class="btn" id="b-l">📜 Open the lesson scrolls</button>' + (st.attempts ? '<button class="btn alt" id="b-t">⚔️ Skip to the Trial</button>' : "") + '<button class="btn gold" id="b-c">🔄 Change hero</button></div>';
    show(h);
    on("b-l", function () { lesson(sid, 0, false); });
    on("b-t", function () { startTrial(sid); });
    on("b-c", function () { delete S.players[sid]; save(); charSelect(sid); });
    renderHero();
  }
  function videoBlock(l) {
    if (l.video) return '<div class="video-wrap"><video controls playsinline preload="metadata" ' + (l.poster ? 'poster="' + esc(l.poster) + '"' : "") + ' src="' + esc(l.video) + '"></video></div>' + (l.videoCaption ? '<div class="video-cap">🎬 ' + esc(l.videoCaption) + "</div>" : "");
    return '<div class="video-ph"><b>🎬 Video coming soon</b>' + esc(l.videoIdea || "A short animated clip for this lesson will appear here.") + "</div>";
  }
  function lesson(sid, i, resumeAfter) {
    var s = sectionById(sid), l = s.lessons[i];
    var h = '<div class="panel"><div class="qmeta"><span>' + s.icon + " " + esc(s.title) + "</span><span>Scroll " + (i + 1) + " of " + s.lessons.length + "</span></div><h2>📜 " + esc(l.title) + "</h2>" + videoBlock(l);
    l.text.forEach(function (t) { h += "<p>" + md(t) + "</p>"; });
    h += '<div class="scroll-nav"><span>' + (i > 0 ? '<button class="btn alt" id="b-prev">◀ Back</button>' : "") + "</span><span>" +
      (i < s.lessons.length - 1 ? '<button class="btn" id="b-next">Next scroll ▶</button>' : '<button class="btn gold" id="b-trial">⚔️ ' + (resumeAfter ? "Return to my trial" : "Begin the Trial!") + "</button>") + "</span></div></div>";
    show(h);
    on("b-prev", function () { lesson(sid, i - 1, resumeAfter); });
    on("b-next", function () { lesson(sid, i + 1, resumeAfter); });
    on("b-trial", function () { if (resumeAfter) { S.run.phase === "review" ? nextReview() : nextQuestion(); } else startTrial(sid); });
    renderHero();
  }

  /* ---------------- trial ---------------- */
  function startTrial(sid) {
    var s = sectionById(sid), st = sec(sid);
    st.attempts++;
    S.run = { sid: sid, phase: "trial", order: shuffle(s.questions.map(function (q) { return q.id; })), idx: 0, right: 0, wrong: 0, queue: [], startedAt: now() };
    save(); nextQuestion();
  }
  function recordTopic(sid, q, ok) {
    var st = sec(sid); var t = st.topics[q.topic] || (st.topics[q.topic] = { right: 0, wrong: 0 });
    if (ok) t.right++; else { t.wrong++; st.missed[q.id] = (st.missed[q.id] || 0) + 1; }
    S.totalAnswered++; if (ok) S.totalCorrect++;
  }
  function awardGear(sid) {
    var s = sectionById(sid), st = sec(sid), per = C.correctPerGear;
    st.correctCount++;
    if (st.gearEarned < s.gear.length && st.correctCount >= (st.gearEarned + 1) * per) {
      var g = s.gear[st.gearEarned]; st.gearEarned++;
      S.gear.push({ name: g.name, icon: g.icon, slot: g.slot, color: g.color, desc: g.desc, section: sid, at: now() });
      return g;
    }
    return null;
  }
  function askHTML(q, label) {
    var h = '<div class="qmeta"><span>' + label + '</span><span class="qtype">' + { mc: "Multiple choice", vocab: "Vocabulary", fill: "Fill in the blank", short: "Short answer" }[q.type] + "</span></div>";
    if (q.type === "vocab") h += "<h2>What does <u>" + esc(q.term) + "</u> mean?</h2>";
    else h += "<h2>" + esc(q.q).replace(/_{3,}/g, '<span style="border-bottom:3px solid #5b3a1a;padding:0 2em"></span>') + "</h2>";
    if (q.type === "mc" || q.type === "vocab") {
      var order = shuffle(q.choices.map(function (c, i) { return i; }));
      h += '<div class="choices">';
      order.forEach(function (ci, k) { h += '<button class="choice" data-ci="' + ci + '">' + "ABCDEF"[k] + ". " + esc(q.choices[ci]) + "</button>"; });
      h += "</div>";
    } else {
      h += '<form id="f-ans" autocomplete="off"><input class="answer" id="ans" placeholder="Type your answer" autocapitalize="off" spellcheck="false"><br><br><button class="btn" type="submit">Check answer</button></form>';
    }
    return h + '<div id="fb"></div>';
  }
  function wireAnswer(q, cb) {
    var answered = false;
    function done(ok, given) {
      if (answered) return; answered = true;
      var fb = document.getElementById("fb");
      var correct = (q.type === "mc" || q.type === "vocab") ? q.choices[0] : (q.display || q.accept[0]);
      fb.innerHTML = '<div class="feedback ' + (ok ? "ok" : "no") + '">' + (ok ? "✅ <b>Correct!</b> " : "❌ <b>Not quite.</b> The answer is <b>" + esc(correct) + "</b>. ") + esc(q.explain || "") + '</div><button class="btn" id="b-cont">Continue ▶</button>';
      on("b-cont", function () { cb(ok); });
      var bc = document.getElementById("b-cont"); if (bc) bc.focus();
    }
    var chs = $screen.querySelectorAll(".choice");
    Array.prototype.forEach.call(chs, function (b) {
      b.onclick = function () {
        var ok = b.getAttribute("data-ci") === "0";
        Array.prototype.forEach.call(chs, function (x) { x.disabled = true; if (x.getAttribute("data-ci") === "0") x.classList.add("right"); });
        if (!ok) b.classList.add("wrong");
        done(ok);
      };
    });
    var f = document.getElementById("f-ans");
    if (f) {
      var inp = document.getElementById("ans"); setTimeout(function () { inp.focus(); }, 50);
      f.onsubmit = function (e) {
        e.preventDefault(); if (answered) return;
        if (!inp.value.trim()) { toast("Type an answer first!"); return; }
        inp.disabled = true; done(checkTyped(q, inp.value), inp.value);
      };
    }
  }
  function afterAnswer(sid, q, ok, next) {
    recordTopic(sid, q, ok);
    var g = ok ? awardGear(sid) : null;
    save(); renderHero();
    if (g) {
      modal('<div class="panel big-reward"><div class="ic">' + g.icon + "</div><h2>New gear: " + esc(g.name) + "!</h2><p>" + esc(g.desc) + "</p><p>You earned it with " + C.correctPerGear + " more correct answers. Look at your hero!</p><button class=\"btn gold\" id=\"b-ok\">Awesome! ▶</button></div>");
      on("b-ok", function () { closeModal(); next(); });
    } else next();
  }
  function nextQuestion() {
    var r = S.run, s = sectionById(r.sid);
    if (r.idx >= r.order.length) return trialResults();
    var q = qById(r.order[r.idx]).q;
    show('<div class="panel">' + askHTML(q, "⚔️ Trial of " + esc(s.title) + " · Question " + (r.idx + 1) + " of " + r.order.length) + "</div>" +
      '<div class="panel" style="padding:.6rem 1rem"><button class="btn alt" id="b-peek">📜 Re-read scrolls (pauses the trial)</button><button class="btn gold" id="b-map">🗺️ Save &amp; return to map</button></div>');
    on("b-peek", function () { lesson(r.sid, 0, true); });
    on("b-map", home);
    wireAnswer(q, function (ok) {
      if (ok) r.right++; else { r.wrong++; r.queue.push(q.id); }
      r.idx++;
      afterAnswer(r.sid, q, ok, nextQuestion);
    });
    renderHero();
  }
  function trialResults() {
    var r = S.run, s = sectionById(r.sid), st = sec(r.sid), p = pct(r.right, r.order.length);
    st.history.push({ at: now(), right: r.right, total: r.order.length, pct: p });
    st.bestPct = Math.max(st.bestPct, p); st.lastPct = p;
    r.firstPct = p; save();
    var pass = p >= C.passPercent;
    var h = '<div class="panel"><h2>⚔️ Trial complete!</h2><p>First-try score: <b>' + r.right + " / " + r.order.length + " (" + p + "%)</b>. You need " + C.passPercent + "% to master this land.</p>";
    if (r.queue.length) {
      h += "<p>You missed <b>" + r.queue.length + "</b> question" + (r.queue.length > 1 ? "s" : "") + ". Next comes <b>Review</b>: for each one you will re-read the right scroll, then answer again until every miss is cleared.</p>";
      h += pass ? "<p>🌟 Your score is high enough! Clear the review to master the land.</p>" : "<p>Your score is under " + C.passPercent + "%. Clear the review for practice, then you'll take the Trial again.</p>";
      h += '<button class="btn" id="b-rev">📜 Start Review</button>';
      r.phase = "review"; save();
    } else {
      h += "<p>🌟 A perfect trial. No misses to review!</p><button class=\"btn gold\" id=\"b-fin\">Claim your reward ▶</button>";
    }
    h += "</div>"; show(h);
    on("b-rev", nextReview); on("b-fin", finishCheck);
    renderHero();
  }
  function nextReview() {
    var r = S.run, s = sectionById(r.sid);
    if (!r.queue.length) return finishCheck();
    var q = qById(r.queue[0]).q, l = lessonFor(s, q.topic);
    var h = '<div class="panel"><span class="review-tag">REVIEW · ' + r.queue.length + " left</span><h2>📜 " + esc(l.title) + "</h2>" + videoBlock(l);
    l.text.forEach(function (t) { h += "<p>" + md(t) + "</p>"; });
    h += '<button class="btn gold" id="b-ready">I\'m ready: ask me again ▶</button></div>';
    show(h);
    on("b-ready", function () {
      show('<div class="panel">' + askHTML(q, '<span class="review-tag">REVIEW</span> ' + esc(topicTitle(s, q.topic))) + "</div>");
      wireAnswer(q, function (ok) {
        r.queue.shift(); if (!ok) r.queue.push(q.id);
        afterAnswer(r.sid, q, ok, nextReview);
      });
    });
    renderHero();
  }
  function finishCheck() {
    var r = S.run, s = sectionById(r.sid), st = sec(r.sid);
    if (r.firstPct >= C.passPercent) {
      var first = !st.completed;
      st.completed = true; if (!st.completedAt) st.completedAt = now();
      if (first) S.badges.push({ name: s.badge.name, icon: s.badge.icon, tunic: s.badge.tunic, section: s.id, at: now() });
      S.run = null; save(); renderHero();
      var idx = C.sections.indexOf(s), nxt = C.sections[idx + 1];
      show('<div class="panel big-reward"><div class="ic">' + s.badge.icon + "</div><h1>" + (first ? "Badge earned: " : "Mastered again: ") + esc(s.badge.name) + "!</h1><p>" + esc(s.badge.desc) + "</p><p>Trial score: <b>" + r.firstPct + "%</b> · all misses cleared.</p>" +
        (nxt ? '<p>🔓 <b>' + esc(nxt.title) + "</b> is now open!</p>" : (allDone() ? "<p>🔓 <b>The Grand Trial</b> is now open!</p>" : "")) +
        '<button class="btn gold" id="b-map">🗺️ Back to the map</button>' + (nxt ? '<button class="btn" id="b-nx">' + nxt.icon + " Go to " + esc(nxt.title) + " ▶</button>" : "") + "</div>");
      on("b-map", home); on("b-nx", function () { enterSection(nxt.id); });
    } else {
      S.run = { sid: r.sid, phase: "lessons" }; save(); renderHero();
      show('<div class="panel"><h2>Review cleared! 💪</h2><p>Great work fixing every miss. Your first-try score was <b>' + r.firstPct + "%</b>, and mastery needs <b>" + C.passPercent + "%</b>. Re-read the scrolls if you like, then take the Trial again. Your gear stays with you!</p>" +
        '<button class="btn" id="b-again">⚔️ Retake the Trial</button><button class="btn alt" id="b-l">📜 Re-read scrolls</button><button class="btn gold" id="b-map">🗺️ Map</button></div>');
      on("b-again", function () { startTrial(r.sid); }); on("b-l", function () { lesson(r.sid, 0, false); }); on("b-map", home);
    }
  }

  /* ---------------- final quiz ---------------- */
  function finalIntro() {
    setWorld({ sky: "#ffd27a", sky2: "#9fd8ff", ground: "#8bd16a", ground2: "#3f8a4a", accent: "#d4a017", snow: false, water: true });
    var p = currentPlayer(), h = '<div class="scene"><div class="who">' + C.final.icon + " " + esc(C.final.title) + "</div>";
    C.final.scene.forEach(function (t) { h += "<p>" + md(t) + "</p>"; });
    h += "</div><div class=\"panel\"><p>" + C.final.questionsPerSection * C.sections.length + " questions, " + C.final.questionsPerSection + " from each land. Score <b>" + C.passPercent + "%</b> or better to win the <b>" + esc(C.final.badge.name) + "</b>.</p><button class=\"btn gold\" id=\"b-go\">⚔️ Begin the Grand Trial</button><button class=\"btn alt\" id=\"b-map\">🗺️ Map</button></div>";
    show(h); on("b-go", startFinal); on("b-map", home); renderHero();
  }
  function startFinal() {
    var ids = [];
    C.sections.forEach(function (s) { shuffle(s.questions).slice(0, C.final.questionsPerSection).forEach(function (q) { ids.push(q.id); }); });
    S.final.attempts++;
    S.run = { sid: "final", phase: "final", order: shuffle(ids), idx: 0, right: 0, missed: [] }; save(); nextFinal();
  }
  function nextFinal() {
    var r = S.run;
    if (r.idx >= r.order.length) return finalResults();
    var hit = qById(r.order[r.idx]), q = hit.q;
    show('<div class="panel">' + askHTML(q, "🏆 Grand Trial · " + (r.idx + 1) + " of " + r.order.length + " · " + hit.s.icon + " " + esc(hit.s.title)) + "</div>");
    wireAnswer(q, function (ok) {
      if (ok) r.right++; else r.missed.push(q.id);
      r.idx++; recordTopic(hit.s.id, q, ok); save(); renderHero(); nextFinal();
    });
  }
  function finalResults() {
    var r = S.run, p = pct(r.right, r.order.length), pass = p >= C.passPercent, first = pass && !S.final.passed;
    S.final.history.push({ at: now(), right: r.right, total: r.order.length, pct: p });
    S.final.bestPct = Math.max(S.final.bestPct, p);
    if (pass) { S.final.passed = true; if (!S.final.passedAt) S.final.passedAt = now(); }
    if (first) S.badges.push({ name: C.final.badge.name, icon: C.final.badge.icon, tunic: C.final.badge.tunic, section: "final", at: now() });
    var missed = r.missed; S.run = null; save(); renderHero();
    var h = '<div class="panel big-reward">' + (pass ? '<div class="ic">' + C.final.badge.icon + "</div><h1>You passed the Grand Trial!</h1><p>" + esc(C.final.badge.desc) + "</p>" : "<h1>So close!</h1><p>You need " + C.passPercent + "% to win the crown. Review the topics below and try again.</p>") +
      "<p>Score: <b>" + r.right + " / " + r.order.length + " (" + p + "%)</b></p></div>";
    if (missed.length) {
      h += '<div class="panel"><h2>Questions to review</h2>';
      missed.forEach(function (id) { var x = qById(id), q = x.q; h += "<p>" + x.s.icon + " <b>" + esc(q.type === "vocab" ? "Define: " + q.term : q.q) + "</b><br>✔ " + esc(q.type === "mc" || q.type === "vocab" ? q.choices[0] : (q.display || q.accept[0])) + " · <i>" + esc(topicTitle(x.s, q.topic)) + "</i></p>"; });
      h += "</div>";
    }
    h += '<div class="panel"><button class="btn gold" id="b-map">🗺️ Map</button><button class="btn" id="b-again">⚔️ Try the Grand Trial again</button><button class="btn alt" id="b-rep">📋 Parent Report</button></div>';
    show(h); on("b-map", home); on("b-again", startFinal); on("b-rep", report);
  }

  /* ---------------- inventory ---------------- */
  function inventory() {
    var h = '<div class="panel"><h2>🎒 Inventory</h2>';
    if (!S.gear.length && !S.badges.length) h += "<p>No gear yet. Answer " + C.correctPerGear + " trial questions correctly to earn your first item!</p>";
    if (S.badges.length) { h += '<h3>Badges</h3><div class="inv">'; S.badges.forEach(function (b) { h += '<div class="item badge"><div class="ic">' + b.icon + "</div><b>" + esc(b.name) + "</b><small>" + fmtDate(b.at) + "</small></div>"; }); h += "</div>"; }
    if (S.gear.length) { h += '<h3>Gear</h3><div class="inv">'; S.gear.forEach(function (g) { h += '<div class="item"><div class="ic">' + g.icon + "</div><b>" + esc(g.name) + "</b><small>" + esc(g.desc) + "</small><small>Worn on: " + esc(g.slot) + "</small></div>"; }); h += "</div>"; }
    h += '<br><button class="btn gold" id="b-close">Close</button></div>';
    modal(h); on("b-close", closeModal);
  }

  /* ---------------- parent report ---------------- */
  function weakAreas() {
    var out = [];
    C.sections.forEach(function (s) {
      var st = S.sections[s.id]; if (!st) return;
      Object.keys(st.topics).forEach(function (t) {
        var x = st.topics[t], tot = x.right + x.wrong;
        if (x.wrong >= 2 || (tot >= 2 && pct(x.right, tot) < C.passPercent)) out.push({ s: s, topic: t, right: x.right, wrong: x.wrong, p: pct(x.right, tot) });
      });
    });
    return out.sort(function (a, b) { return a.p - b.p; });
  }
  function reportText() {
    var L = [], p = currentPlayer();
    L.push("AMERICAN BEGINNINGS — PARENT REPORT");
    L.push("Unit 1: First Americans through the English Colonies (to 1754)");
    L.push("Generated: " + new Date().toLocaleString());
    L.push("Started: " + fmtDate(S.created) + " | Last played: " + fmtDate(S.lastPlayed));
    L.push("Hero names used: " + (Object.keys(S.players).map(function (k) { return S.players[k].name; }).join(", ") || p.name));
    L.push("Overall: " + S.totalCorrect + "/" + S.totalAnswered + " answers correct (" + pct(S.totalCorrect, S.totalAnswered) + "%), including review and Grand Trial answers.");
    L.push("");
    L.push("SECTIONS (mastery = " + C.passPercent + "% first-try trial score + all misses cleared)");
    C.sections.forEach(function (s, i) {
      var st = S.sections[s.id];
      if (!st || !st.attempts) { L.push((i + 1) + ". " + s.title + ": " + (isUnlocked(i) ? "not started" : "locked")); return; }
      var hist = st.history.map(function (h) { return h.pct + "%"; }).join(" → ");
      L.push((i + 1) + ". " + s.title + ": " + (st.completed ? "MASTERED " + fmtDate(st.completedAt) : "in progress") + " | trial attempts: " + st.attempts + " | first-try scores: " + (hist || "—") + " | best: " + st.bestPct + "% | gear: " + st.gearEarned + "/" + s.gear.length);
      var tl = Object.keys(st.topics).map(function (t) { var x = st.topics[t]; return "   - " + topicTitle(s, t) + ": " + x.right + " right, " + x.wrong + " missed (" + pct(x.right, x.right + x.wrong) + "%)"; });
      L.push.apply(L, tl);
    });
    L.push("");
    L.push("GRAND TRIAL (end-of-unit quiz): " + (S.final.passed ? "PASSED " + fmtDate(S.final.passedAt) : (allDone() ? "unlocked" : "locked")) + " | attempts: " + S.final.attempts + (S.final.history.length ? " | scores: " + S.final.history.map(function (h) { return h.pct + "%"; }).join(" → ") : ""));
    L.push("");
    var w = weakAreas();
    L.push("WEAK AREAS TO REVIEW: " + (w.length ? "" : "none flagged yet"));
    w.forEach(function (x) { L.push(" - " + x.s.title + " › " + topicTitle(x.s, x.topic) + " (" + x.p + "%, missed " + x.wrong + "x)"); });
    var miss = [];
    C.sections.forEach(function (s) { var st = S.sections[s.id]; if (!st) return; Object.keys(st.missed).forEach(function (id) { if (st.missed[id] >= 2) { var q = qById(id); if (q) miss.push(" - [" + s.title + "] " + (q.q.type === "vocab" ? "Define: " + q.q.term : q.q.q) + " (missed " + st.missed[id] + "x)"); } }); });
    if (miss.length) { L.push(""); L.push("QUESTIONS MISSED MORE THAN ONCE:"); L.push.apply(L, miss); }
    L.push("");
    L.push("UPGRADES EARNED: " + S.gear.length + " gear, " + S.badges.length + " badges");
    if (S.badges.length) L.push(" Badges: " + S.badges.map(function (b) { return b.icon + " " + b.name; }).join(", "));
    if (S.gear.length) L.push(" Gear: " + S.gear.map(function (g) { return g.icon + " " + g.name; }).join(", "));
    return L.join("\n");
  }
  function report() {
    var rows = "";
    C.sections.forEach(function (s, i) {
      var st = S.sections[s.id] || {};
      rows += "<tr><td>" + s.icon + " " + esc(s.title) + "</td><td>" + (st.completed ? "✅ Mastered" : (st.attempts ? "In progress" : (isUnlocked(i) ? "Not started" : "🔒"))) + "</td><td>" + (st.history && st.history.length ? st.history[st.history.length - 1].pct + "%" : "—") + "</td><td>" + (st.bestPct || 0) + "%</td><td>" + (st.attempts || 0) + "</td><td>" + (st.gearEarned || 0) + "/" + s.gear.length + "</td></tr>";
    });
    rows += "<tr><td>" + C.final.icon + " Grand Trial</td><td>" + (S.final.passed ? "✅ Passed" : (allDone() ? "Unlocked" : "🔒")) + "</td><td>" + (S.final.history.length ? S.final.history[S.final.history.length - 1].pct + "%" : "—") + "</td><td>" + S.final.bestPct + "%</td><td>" + S.final.attempts + "</td><td>—</td></tr>";
    var w = weakAreas();
    var h = '<div class="panel"><h2>📋 Parent Report</h2><p>Overall accuracy: <b>' + pct(S.totalCorrect, S.totalAnswered) + "%</b> (" + S.totalCorrect + "/" + S.totalAnswered + ") · Last played: " + fmtDate(S.lastPlayed) + "</p>" +
      '<table class="rep"><tr><th>Section</th><th>Status</th><th>Last trial</th><th>Best</th><th>Attempts</th><th>Gear</th></tr>' + rows + "</table>" +
      "<h3>Weak areas</h3>" + (w.length ? "<ul>" + w.map(function (x) { return "<li>" + x.s.icon + " " + esc(topicTitle(x.s, x.topic)) + ": " + x.p + "% (missed " + x.wrong + "×)</li>"; }).join("") + "</ul>" : "<p>None flagged yet.</p>") +
      '<h3>Full text report</h3><pre class="report" id="rep-text">' + esc(reportText()) + "</pre>" +
      '<button class="btn gold" id="b-copy">📋 Copy report to clipboard</button><button class="btn alt" id="b-close">Close</button><button class="btn warn" id="b-reset">Reset all progress</button></div>';
    modal(h);
    on("b-close", closeModal);
    on("b-copy", function () {
      var txt = reportText();
      function fallback() { var ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("📋 Report copied!"); } catch (e) { toast("Select the text and copy it manually."); } document.body.removeChild(ta); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("📋 Report copied!"); }, fallback); else fallback();
    });
    on("b-reset", function () {
      if (confirm("Erase ALL progress, gear, and badges on this device? This cannot be undone.") && confirm("Are you really sure?")) { localStorage.removeItem(SAVE_KEY); load(); closeModal(); home(); toast("Progress reset."); }
    });
  }

  /* ---------------- boot ---------------- */
  load();
  on("btn-home", function () { closeModal(); home(); });
  on("btn-inv", inventory);
  on("btn-report", report);
  document.getElementById("modal").addEventListener("click", function (e) { if (e.target.id === "modal") closeModal(); });
  document.getElementById("game-version").textContent = GAME_VERSION;
  window.ABRPG = { version: GAME_VERSION, norm: norm, checkTyped: checkTyped, state: function () { return S; } };
  home();
})();
