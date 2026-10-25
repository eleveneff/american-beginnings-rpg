/* American Beginnings — game engine. Plain JS, no build step.
   Content lives in content/*.js (window.GAME_CONTENT). */
(function () {
  "use strict";
  var C = window.GAME_CONTENT;
  var SAVE_KEY = "americanBeginningsRPG_v1";
  var DEFAULT_TUNIC = "#a68a64"; /* undyed homespun until the first badge */
  var GAME_VERSION = "v2.0";
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
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------- item registry (section gear + market goods) ---------------- */
  var SLOTS = ["head", "cloak", "neck", "body", "back", "belt", "hand", "offhand", "feet"];
  var SLOT_LABEL = { head: "Head", cloak: "Cloak", neck: "Neck", body: "Body", back: "Back", belt: "Belt", hand: "Right hand", offhand: "Left hand", feet: "Feet", pack: "Pack" };
  var ITEMS = {}, BY_NAME = {};
  C.sections.forEach(function (s) {
    s.gear.forEach(function (g) {
      var it = { key: g.key, name: g.name, icon: g.icon, slot: g.slot, art: g.art, color: g.color, desc: g.desc, section: s.id, source: "gear" };
      ITEMS[g.key] = it; BY_NAME[s.id + "|" + g.name] = it; BY_NAME["*|" + g.name] = BY_NAME["*|" + g.name] || it;
      (g.oldNames || []).forEach(function (n) { BY_NAME[s.id + "|" + n] = it; BY_NAME["*|" + n] = it; });
    });
  });
  (C.markets || []).forEach(function (m) {
    m.items.forEach(function (x) { ITEMS[x.key] = { key: x.key, name: x.name, icon: x.icon, slot: x.slot, art: x.art, color: x.color, desc: x.fact, fact: x.fact, price: x.price, tier: x.tier, market: m.id, source: "market" }; });
  });
  function marketById(id) { var r = null; (C.markets || []).forEach(function (m) { if (m.id === id) r = m; }); return r; }

  /* ---------------- save data ---------------- */
  function blankSave() {
    return { version: 2, created: now(), lastPlayed: now(), players: {}, sections: {}, final: { attempts: 0, bestPct: 0, passed: false, passedAt: null, history: [] }, gear: [], badges: [], totalCorrect: 0, totalAnswered: 0, run: null,
      stars: { balance: 0, earned: 0, spent: 0, bySource: {} }, starLog: [], qStar: {}, acts: {}, owned: [], equip: {}, purchases: [], videos: {}, vidQ: {} };
  }
  var S;
  function load() {
    try { S = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { S = null; }
    S = migrate(S);
  }
  /* Save migration: older saves are upgraded in place so progress is never lost.
     v1 -> v2: gear names become item keys (and are worn), stars are granted
     retroactively (1 per correct answer so far, 30 per badge, 50 for the crown). */
  function migrate(d) {
    if (!d || typeof d !== "object" || !d.version) return blankSave();
    var b = blankSave(), wasV1 = d.version < 2;
    Object.keys(b).forEach(function (k) { if (d[k] === undefined) d[k] = b[k]; });
    if (!d.final.history) d.final.history = [];
    ["balance", "earned", "spent"].forEach(function (k) { if (typeof d.stars[k] !== "number" || isNaN(d.stars[k])) d.stars[k] = 0; });
    if (!d.stars.bySource) d.stars.bySource = {};
    d.gear.forEach(function (g) {
      if (!g.key) { var it = BY_NAME[(g.section || "*") + "|" + g.name] || BY_NAME["*|" + g.name]; if (it) { g.key = it.key; g.name = it.name; g.slot = it.slot; g.icon = it.icon; } }
      if (g.key && ITEMS[g.key] && d.owned.indexOf(g.key) < 0) { d.owned.push(g.key); if (ITEMS[g.key].slot !== "pack") d.equip[ITEMS[g.key].slot] = g.key; }
    });
    d.owned = d.owned.filter(function (k) { return !!ITEMS[k]; });
    Object.keys(d.equip).forEach(function (sl) { if (!ITEMS[d.equip[sl]] || d.owned.indexOf(d.equip[sl]) < 0) delete d.equip[sl]; });
    if (wasV1) {
      var retro = (d.totalCorrect || 0) + 30 * d.badges.filter(function (x) { return x.section !== "final"; }).length + (d.final.passed ? 50 : 0);
      if (retro > 0) { d.stars.balance += retro; d.stars.earned += retro; d.stars.bySource.carried = (d.stars.bySource.carried || 0) + retro; d.starLog.push({ at: now(), n: retro, src: "carried", note: "Stars for progress made before v2" }); d.migratedFrom = 1; d.migratedAt = now(); }
    }
    if (d.stars.balance < 0) d.stars.balance = 0;
    d.version = Math.max(2, d.version); return d;
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

  /* ---------------- stars economy ---------------- */
  var SRC_LABEL = { question: "Quiz answers (first time right)", activity: "Activities (first play / better score)", practice: "Activity practice replays", badge: "Badges", crown: "Grand Trial crown", carried: "Carried over from v1 progress", video: "Video checks (first time right)" };
  function addStars(n, src, note) {
    n = Math.max(0, Math.floor(n || 0)); if (!n) return 0;
    S.stars.balance += n; S.stars.earned += n; S.stars.bySource[src] = (S.stars.bySource[src] || 0) + n;
    S.starLog.push({ at: now(), n: n, src: src, note: note || "" }); if (S.starLog.length > 300) S.starLog = S.starLog.slice(-300);
    return n;
  }
  function spendStars(n) {
    if (!(n > 0) || S.stars.balance < n) return false;
    S.stars.balance -= n; S.stars.spent += n; return true;
  }
  function questionStar(q) {
    if (S.qStar[q.id]) return 0;
    S.qStar[q.id] = 1; return addStars(C.stars.perQuestion, "question", q.id);
  }
  function own(key) { return S.owned.indexOf(key) >= 0; }
  function grantItem(key, wear) {
    var it = ITEMS[key]; if (!it) return;
    if (!own(key)) S.owned.push(key);
    if (wear !== false && it.slot !== "pack" && it.art) S.equip[it.slot] = key;
  }

  /* ---------------- hero (HeroArt, gear drawn fitted at full scale) ---------------- */
  function currentPlayer() {
    var sid = S.run && S.run.sid; if (sid && S.players[sid]) return S.players[sid];
    var last = null; Object.keys(S.players).forEach(function (k) { var p = S.players[k]; if (!last || (p.at || "") > (last.at || "")) last = p; });
    return last || { gender: "girl", name: "Adventurer" };
  }
  function heroTunic() { var t = DEFAULT_TUNIC; if (S.badges.length) t = S.badges[S.badges.length - 1].tunic || t; return t; }
  function equipArt(eq) { var o = {}; Object.keys(eq || {}).forEach(function (sl) { var it = ITEMS[eq[sl]]; if (it && it.art) o[sl] = { art: it.art, color: it.color }; }); return o; }
  function heroSVG(over) {
    var p = currentPlayer(); over = over || {};
    return window.HeroArt.render({ gender: over.gender || (p.gender === "boy" ? "boy" : "girl"), tunic: heroTunic(), equip: equipArt(over.equip || S.equip) });
  }
  function renderHero() {
    var p = currentPlayer();
    document.getElementById("hero").innerHTML = heroSVG();
    document.getElementById("hero-name").innerHTML = esc(p.name) + '<div class="hero-stars" id="star-balance">⭐ ' + S.stars.balance + "</div>" +
      (S.badges.length ? '<div class="hero-badges">' + S.badges.map(function (b) { return '<span title="' + esc(b.name) + '">' + b.icon + "</span>"; }).join("") + "</div>" : "");
    var gp = document.getElementById("gear-progress");
    if (S.run && S.run.sid && S.run.sid !== "final" && sectionById(S.run.sid)) {
      var s = sectionById(S.run.sid), st = sec(s.id), per = C.correctPerGear;
      if (st.gearEarned < s.gear.length) {
        var into = st.correctCount - st.gearEarned * per;
        gp.innerHTML = "Next gear: " + Math.max(0, per - into) + " more correct" + '<div class="bar"><i style="width:' + Math.min(100, (into / per) * 100) + '%"></i></div>';
      } else gp.innerHTML = "All " + esc(s.title) + " gear earned! ✨";
    } else gp.innerHTML = S.owned.length + " items · " + S.badges.length + " badges";
    renderHUD();
  }
  function renderHUD() {
    document.getElementById("hud").innerHTML = '<span class="hud-stars">⭐ ' + S.stars.balance + " stars</span><span>✅ " + S.totalCorrect + " correct</span><span>🎯 " + pct(S.totalCorrect, S.totalAnswered) + "%</span><span>🏅 " + S.badges.length + "/" + C.sections.length + "</span>";
  }
  function setWorld(palette) { window.CURRENT_PALETTE = palette; try { window.dispatchEvent(new CustomEvent("palette", { detail: palette })); } catch (e) { }
    var fb = document.getElementById("sky-fallback"); if (palette) fb.style.background = "linear-gradient(" + palette.sky + "," + palette.sky2 + " 55%," + palette.ground + " 55%," + palette.ground2 + ")"; }

  /* ---------------- modal / toast ---------------- */
  function modal(html) { document.getElementById("modal-box").innerHTML = html; document.getElementById("modal").classList.remove("hidden"); }
  function closeModal() { document.getElementById("modal").classList.add("hidden"); document.getElementById("modal-box").innerHTML = ""; }
  var toastT; function toast(msg) { var t = document.getElementById("toast"); t.innerHTML = msg; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.add("hidden"); }, 3200); }
  var vidTimers = [];
  function show(html) { vidTimers.forEach(clearInterval); vidTimers = []; $screen.innerHTML = html; wireVideos($screen); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function vrec(key) { return S.videos[key] || (S.videos[key] = { views: 0, captions: 0, ended: 0, checked: 0, best: 0, right: 0, wrong: 0, stars: 0, firstAt: now(), lastAt: null }); }
  function wireVideos(root) {
    $all(".vslot", root).forEach(function (slot) {
      var key = slot.getAttribute("data-vkey"), v = C.videos[key], cues = v.cues || [], n = cues.length;
      var vid = slot.querySelector("video"), ph = slot.querySelector(".video-ph"), l3 = slot.querySelector(".lower3"), prog = slot.querySelector(".vprog i");
      var cbtn = slot.querySelector(".vcheck-btn"), shown = -1, counted = false, maxCue = -1;
      if (!vrec(key).ended) cbtn.disabled = true;
      function cue(i) {
        if (i === shown) return; shown = i;
        if (i < 0 || i >= n) { l3.classList.remove("on"); return; }
        maxCue = Math.max(maxCue, i);
        l3.querySelector(".l3-n").textContent = (i + 1) + "/" + n; l3.querySelector(".l3-t").innerHTML = md(cues[i]);
        l3.classList.remove("on"); void l3.offsetWidth; l3.classList.add("on");
      }
      function started() { if (!counted) { counted = true; var r = vrec(key); r.views++; r.lastAt = now(); save(); } }
      function ended() {
        var r = vrec(key); r.ended++; r.captions = Math.max(r.captions, maxCue + 1); r.lastAt = now(); save();
        cue(-1); cbtn.disabled = false; slot.querySelector(".vcheck-hint").textContent = "Answer to earn stars!"; openCheck(slot, key);
      }
      vid.addEventListener("loadedmetadata", function () { vid.hidden = false; ph.hidden = true; slot.classList.add("has-video"); });
      vid.addEventListener("error", function () { slot.classList.add("no-video"); });
      vid.addEventListener("play", started);
      /* Captions run on play time, at least videoTourSeconds each, so they stay readable. A short clip
         replays until every caption has been shown, and only then does the check open. */
      var played = 0, lastT = 0;
      function per() { return Math.max((vid.duration || 1) / n, C.videoTourSeconds || 4); }
      vid.addEventListener("seeked", function () { lastT = vid.currentTime; });
      vid.addEventListener("timeupdate", function () {
        var dt = vid.currentTime - lastT; lastT = vid.currentTime;
        if (dt > 0 && dt < 1) played += dt;
        cue(Math.min(n - 1, Math.floor(played / per()))); prog.style.width = Math.min(100, played / (per() * n) * 100) + "%";
      });
      vid.addEventListener("ended", function () {
        if (played + 0.3 < per() * n) { vid.currentTime = 0; lastT = 0; vid.play().catch(function () {}); return; }
        prog.style.width = "0"; ended();
      });
      vid.src = vid.getAttribute("data-src");
      var tb = slot.querySelector(".vtour");
      tb.onclick = function () {
        started(); tb.hidden = true; var i = 0, per = (C.videoTourSeconds || 4) * 1000, t0 = Date.now(); cue(0);
        var T = setInterval(function () {
          var f = (Date.now() - t0) / (per * n); prog.style.width = Math.min(100, f * 100) + "%";
          var k = Math.floor(f * n); if (k !== i && k < n) { i = k; cue(k); }
          if (f >= 1) { clearInterval(T); prog.style.width = "0"; tb.hidden = false; tb.textContent = "🔁 Replay the fact tour"; ended(); }
        }, 100);
        vidTimers.push(T);
      };
      cbtn.onclick = function () { openCheck(slot, key); };
    });
  }
  function openCheck(slot, key) {
    var v = C.videos[key], box = slot.querySelector(".vcheck"), qs = v.check, i = 0, right = 0, got = 0;
    box.hidden = false;
    function ask() {
      if (i >= qs.length) {
        var r = vrec(key); r.checked++; r.best = Math.max(r.best, right); r.lastAt = now(); save(); renderHero();
        slot.querySelector(".vcheck-hint").textContent = "✅ Check done " + r.best + "/" + qs.length;
        box.innerHTML = '<div class="vc-done"><b>' + (right === qs.length ? "🌟 Sharp eyes!" : "Good effort!") + "</b> You got " + right + " of " + qs.length + " right" +
          (got ? ' · <span class="star-pop">+' + got + " ⭐</span>" : " · no new stars (stars are paid once per question)") + '. <button class="btn small alt vc-again">🔁 Try the check again</button></div>';
        box.querySelector(".vc-again").onclick = function () { openCheck(slot, key); };
        return;
      }
      var c = qs[i], ch = shuffle(c.choices);
      box.innerHTML = '<div class="vc-q"><span class="vc-tag">🎬 What did you see? ' + (i + 1) + "/" + qs.length + "</span><p><b>" + md(c.q) + '</b></p><div class="vc-ch">' +
        ch.map(function (x, k) { return '<button class="btn alt small" data-k="' + k + '">' + md(x) + "</button>"; }).join("") + '</div><div class="vc-fb"></div></div>';
      $all(".vc-ch button", box).forEach(function (b) {
        b.onclick = function () {
          var pick = ch[+b.getAttribute("data-k")], ok = pick === c.choices[0], r = vrec(key), n = 0;
          $all(".vc-ch button", box).forEach(function (x) { x.disabled = true; if (ch[+x.getAttribute("data-k")] === c.choices[0]) x.classList.add("right"); });
          if (!ok) b.classList.add("wrong");
          recordTopic(v.section, c, ok);
          if (ok) { right++; r.right++; if (!S.vidQ[c.id]) { S.vidQ[c.id] = 1; n = addStars(C.stars.videoCheck, "video", c.id); got += n; r.stars += n; } } else r.wrong++;
          save(); renderHUD();
          box.querySelector(".vc-fb").innerHTML = (ok ? "✅ Correct!" + (n ? ' <span class="star-pop">+' + n + " ⭐</span>" : "") : "❌ The answer is: <b>" + md(c.choices[0]) + "</b>") + " " + md(c.explain || "") +
            ' <button class="btn small vc-next">' + (i < qs.length - 1 ? "Next ▶" : "Finish") + "</button>";
          box.querySelector(".vc-next").onclick = function () { i++; ask(); };
        };
      });
    }
    ask();
  }
  function on(id, fn) { var el = document.getElementById(id); if (el) el.onclick = fn; }

  /* ---------------- world map ---------------- */
  function actsDone(s) { return (s.activities || []).filter(function (a) { return S.acts[a.id] && S.acts[a.id].plays; }).length; }
  function home() {
    setWorld(null);
    var h = '<div class="panel map-head"><div><h1>🗺️ ' + esc(C.title) + "</h1><p>" + esc(C.subtitle) + "</p>" +
      "<p>Pick a glowing land. Read the lesson scrolls, play the <b>activities</b>, then pass the Trial. Master a land with <b>" + C.passPercent + "% or better</b> and by clearing every missed question. Every <b>" + C.correctPerGear + " correct answers</b> earns new gear, and every new right answer, activity, and badge earns <b>⭐ stars</b> to spend in the marketplace!</p>" +
      '<button class="btn gold" id="b-market">🏪 Visit the Marketplace</button><button class="btn alt" id="b-char">🧍 My Character</button></div>' +
      '<div class="map-stars"><div class="big">⭐ ' + S.stars.balance + '</div><small>stars to spend</small></div></div>';
    h += '<div class="map">';
    C.sections.forEach(function (s, i) {
      var st = S.sections[s.id], un = isUnlocked(i), done = st && st.completed, na = (s.activities || []).length;
      var tag = done ? "✅ " + st.bestPct + "%" : (un ? (S.run && S.run.sid === s.id && S.run.phase !== "lessons" ? "▶ Resume" : "Open") : "🔒 Locked");
      h += '<button class="node ' + (un ? "" : "locked ") + (done ? "done" : "") + '" data-sid="' + s.id + '" ' + (un ? "" : 'aria-disabled="true"') + '><span class="tag">' + tag + '</span><div class="ic">' + s.icon + "</div><small>Section " + (i + 1) + " · " + esc(s.era) + "</small><h3>" + esc(s.title) + "</h3><small>" + s.lessons.length + " scrolls · " + s.questions.length + " questions · 🎮 " + actsDone(s) + "/" + na + " activities</small></button>";
    });
    var fu = allDone(), fp = S.final.passed;
    h += '<button class="node ' + (fu ? "" : "locked ") + (fp ? "done" : "") + '" data-sid="final"><span class="tag">' + (fp ? "👑 " + S.final.bestPct + "%" : (fu ? "Open" : "🔒 Finish all 6")) + '</span><div class="ic">' + C.final.icon + "</div><small>End of Unit</small><h3>" + esc(C.final.title) + "</h3><small>" + C.final.questionsPerSection * C.sections.length + " questions from every land</small></button>";
    h += "</div>";
    show(h);
    on("b-market", function () { market(); }); on("b-char", character);
    $all(".node", $screen).forEach(function (b) {
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
    var s = sectionById(sid), gender = currentPlayer().gender === "boy" ? "boy" : "girl", name = null;
    function draw() {
      var names = gender === "girl" ? C.girlNames : C.boyNames;
      var h = '<div class="panel"><h2>' + s.icon + " " + esc(s.title) + " · Who are you?</h2><p>You live in this time and place. Choose your hero for this land.</p>" +
        '<div class="pick" id="pg"><button data-g="girl" class="' + (gender === "girl" ? "sel" : "") + '">👧 Girl</button><button data-g="boy" class="' + (gender === "boy" ? "sel" : "") + '">👦 Boy</button></div><p><b>Pick a name:</b></p><div class="pick" id="pn">';
      names.forEach(function (n) { h += '<button data-n="' + esc(n) + '" class="' + (name === n ? "sel" : "") + '">' + esc(n) + "</button>"; });
      h += '</div><p><b>…or type your own:</b></p><input class="answer" id="custom" maxlength="20" placeholder="Custom name" value="' + (name && names.indexOf(name) < 0 ? esc(name) : "") + '"><br><br><button class="btn" id="b-go">Begin the adventure ▶</button></div>';
      show(h);
      $all("#pg button").forEach(function (b) { b.onclick = function () { gender = b.getAttribute("data-g"); name = null; document.getElementById("hero").innerHTML = heroSVG({ gender: gender }); draw(); }; });
      $all("#pn button").forEach(function (b) { b.onclick = function () { name = b.getAttribute("data-n"); draw(); }; });
      document.getElementById("hero").innerHTML = heroSVG({ gender: gender });
      on("b-go", function () {
        var c = document.getElementById("custom").value.trim();
        var nm = c || name; if (!nm) { toast("Pick a name or type your own!"); return; }
        S.players[sid] = { gender: gender, name: nm.slice(0, 20), at: now() }; save(); renderHero(); sectionIntro(sid);
      });
    }
    renderHero(); draw();
  }
  function actCard(a) {
    var r = S.acts[a.id], best = r && r.best ? "⭐".repeat(r.best) + "☆".repeat(3 - r.best) : "New!";
    var kind = { sequence: "Put in order", sort: "Sort it", map: "Map it", scenario: "Make choices", dialogue: "Talk with a person" }[a.type] || a.type;
    return '<button class="act-card" id="act-' + a.id + '" data-act="' + a.id + '"><span class="ic">' + a.icon + "</span><b>" + esc(a.title) + "</b><small>" + kind + " · " + best + "</small><small>" + (r && r.plays ? "Played " + r.plays + "× · earned ⭐ " + (r.earned || 0) : "Up to ⭐ " + C.stars.actPerfect) + "</small></button>";
  }
  function sectionIntro(sid) {
    var s = sectionById(sid), p = S.players[sid], st = sec(sid);
    if (!st.startedAt) { st.startedAt = now(); save(); }
    S.run = { sid: sid, phase: "lessons" }; save();
    var h = '<div class="scene"><div class="who">' + s.icon + " " + esc(s.title) + " · " + esc(s.era) + "</div>";
    s.scene.forEach(function (para) { h += "<p>" + md(para.replace(/\{name\}/g, p.name)) + "</p>"; });
    h += '</div><div class="panel"><button class="btn" id="b-l">📜 Open the lesson scrolls</button>' + (st.attempts ? '<button class="btn alt" id="b-t">⚔️ Skip to the Trial</button>' : '<button class="btn alt" id="b-t">⚔️ Go to the Trial</button>') + '<button class="btn gold" id="b-c">🔄 Change hero</button></div>';
    if ((s.activities || []).length) {
      h += '<div class="panel"><h2>🎮 History Activities</h2><p>Learn by doing! Each activity pays up to <b>⭐ ' + C.stars.actPerfect + "</b> the first time (fewer mistakes = more stars). Beat your best score later to earn the difference. Practice replays pay ⭐ " + C.stars.practice + " (up to " + C.stars.practicePerDay + " a day per activity).</p><div class=\"acts\">";
      s.activities.forEach(function (a) { h += actCard(a); });
      h += "</div></div>";
    }
    show(h);
    on("b-l", function () { lesson(sid, 0, false); });
    on("b-t", function () { startTrial(sid); });
    on("b-c", function () { delete S.players[sid]; save(); charSelect(sid); });
    $all(".act-card", $screen).forEach(function (b) { b.onclick = function () { runActivity(sid, b.getAttribute("data-act")); }; });
    renderHero();
  }
  /* v2 video player component. Every lesson video is an entry in
     GAME_CONTENT.videos (content/videos.js). It shows timed fact captions in
     a lower third and a Key Facts card, then a "What did you see?" check that
     pays stars and feeds topic and mastery stats. Without a src, the file
     assets/video/<key>.mp4 is used if it exists. Otherwise a placeholder runs
     the same captions as a timed fact tour. */
  function videoBlock(l) {
    var v = l.videoKey && C.videos && C.videos[l.videoKey];
    if (v) {
      var key = l.videoKey, src = v.src || "assets/video/" + key + ".mp4", rec = S.videos[key] || {};
      var facts = (v.facts || []).map(function (f) { return "<li>" + md(f) + "</li>"; }).join("");
      var left = v.check.filter(function (c) { return !S.vidQ[c.id]; }).length;
      return '<div class="vslot" data-vkey="' + esc(key) + '">' +
        '<div class="vstage"><video controls playsinline preload="metadata" hidden data-src="' + esc(src) + '"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : "") + "></video>" +
        '<div class="video-ph vph2"><div class="vph-ic">🎞️</div><b>' + esc(v.title) + '</b><span class="vph-soon">Video coming soon</span><button class="btn small gold vtour">▶ Play the fact tour</button></div>' +
        '<div class="lower3" aria-live="polite"><span class="l3-n"></span><span class="l3-t"></span></div><div class="vprog"><i></i></div></div>' +
        '<div class="video-facts"><b>🔑 Key Facts: ' + esc(v.title) + "</b><ul>" + facts + "</ul></div>" +
        '<div class="vcheck-bar"><button class="btn small vcheck-btn">🎬 What did you see? ' + (left ? "(+" + left * C.stars.videoCheck + " ⭐)" : "(review)") + "</button>" +
        '<span class="vcheck-hint">' + (rec.checked ? "✅ Check done " + rec.best + "/" + v.check.length : "Watch to the end to unlock the check.") + "</span></div>" +
        '<div class="vcheck" hidden></div></div>';
    }
    if (l.video) return '<div class="video-wrap"><video controls playsinline preload="metadata" ' + (l.poster ? 'poster="' + esc(l.poster) + '"' : "") + ' src="' + esc(l.video) + '"></video></div>' + (l.videoCaption ? '<div class="video-cap">🎬 ' + esc(l.videoCaption) + "</div>" : "");
    return '<div class="video-ph"><b>🎬 Video coming soon</b>' + esc(l.videoIdea || "A short animated clip for this lesson will appear here.") + "</div>";
  }
  function lesson(sid, i, resumeAfter) {
    var s = sectionById(sid), l = s.lessons[i];
    var acts = (s.activities || []).filter(function (a) { return a.topic === l.topic; });
    var h = '<div class="panel"><div class="qmeta"><span>' + s.icon + " " + esc(s.title) + "</span><span>Scroll " + (i + 1) + " of " + s.lessons.length + "</span></div><h2>📜 " + esc(l.title) + "</h2>" + videoBlock(l);
    l.text.forEach(function (t) { h += "<p>" + md(t) + "</p>"; });
    if (acts.length && !resumeAfter) h += '<div class="try-act">🎮 Try it: ' + acts.map(function (a) { return '<button class="btn alt small" data-act="' + a.id + '">' + a.icon + " " + esc(a.title) + "</button>"; }).join("") + "</div>";
    h += '<div class="scroll-nav"><span>' + (i > 0 ? '<button class="btn alt" id="b-prev">◀ Back</button>' : "") + "</span><span>" +
      (i < s.lessons.length - 1 ? '<button class="btn" id="b-next">Next scroll ▶</button>' : '<button class="btn gold" id="b-trial">⚔️ ' + (resumeAfter ? "Return to my trial" : "Begin the Trial!") + "</button>") + "</span></div></div>";
    show(h);
    on("b-prev", function () { lesson(sid, i - 1, resumeAfter); });
    on("b-next", function () { lesson(sid, i + 1, resumeAfter); });
    on("b-trial", function () { if (resumeAfter) { S.run.phase === "review" ? nextReview() : nextQuestion(); } else startTrial(sid); });
    $all(".try-act button", $screen).forEach(function (b) { b.onclick = function () { runActivity(sid, b.getAttribute("data-act"), function () { lesson(sid, i, false); }); }; });
    renderHero();
  }

  /* ---------------- trial ---------------- */
  function startTrial(sid) {
    var s = sectionById(sid), st = sec(sid), size = Math.min(C.trialSize || s.questions.length, s.questions.length);
    st.attempts++;
    /* questions never answered right yet, or missed before, come first */
    var pri = [], rest = [];
    s.questions.forEach(function (q) { (!S.qStar[q.id] || st.missed[q.id] ? pri : rest).push(q.id); });
    var order = shuffle(shuffle(pri).concat(shuffle(rest)).slice(0, size));
    S.run = { sid: sid, phase: "trial", order: order, idx: 0, right: 0, wrong: 0, queue: [], startedAt: now() };
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
      S.gear.push({ key: g.key, name: g.name, icon: g.icon, slot: g.slot, color: g.color, desc: g.desc, section: sid, at: now() });
      grantItem(g.key, true);
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
    function done(ok) {
      if (answered) return; answered = true;
      var fb = document.getElementById("fb");
      var correct = (q.type === "mc" || q.type === "vocab") ? q.choices[0] : (q.display || q.accept[0]);
      var star = ok && !S.qStar[q.id] ? ' <span class="star-pop">+' + C.stars.perQuestion + " ⭐</span>" : "";
      fb.innerHTML = '<div class="feedback ' + (ok ? "ok" : "no") + '">' + (ok ? "✅ <b>Correct!</b>" + star + " " : "❌ <b>Not quite.</b> The answer is <b>" + esc(correct) + "</b>. ") + esc(q.explain || "") + '</div><button class="btn" id="b-cont">Continue ▶</button>';
      on("b-cont", function () { cb(ok); });
      var bc = document.getElementById("b-cont"); if (bc) bc.focus();
    }
    var chs = $all(".choice", $screen);
    chs.forEach(function (b) {
      b.onclick = function () {
        var ok = b.getAttribute("data-ci") === "0";
        chs.forEach(function (x) { x.disabled = true; if (x.getAttribute("data-ci") === "0") x.classList.add("right"); });
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
        inp.disabled = true; done(checkTyped(q, inp.value));
      };
    }
  }
  function afterAnswer(sid, q, ok, next) {
    recordTopic(sid, q, ok);
    if (ok) questionStar(q);
    var g = ok ? awardGear(sid) : null;
    save(); renderHero();
    if (g) {
      modal('<div class="panel big-reward"><div class="reward-hero">' + heroSVG() + '</div><h2>' + g.icon + " New gear: " + esc(g.name) + "!</h2><p>" + esc(g.desc) + "</p><p>You earned it with " + C.correctPerGear + " more correct answers. It's on your hero now!</p><button class=\"btn gold\" id=\"b-ok\">Awesome! ▶</button></div>");
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
      if (first) { S.badges.push({ name: s.badge.name, icon: s.badge.icon, tunic: s.badge.tunic, section: s.id, at: now() }); addStars(C.stars.badge, "badge", s.id); }
      S.run = null; save(); renderHero();
      var idx = C.sections.indexOf(s), nxt = C.sections[idx + 1];
      show('<div class="panel big-reward"><div class="ic">' + s.badge.icon + "</div><h1>" + (first ? "Badge earned: " : "Mastered again: ") + esc(s.badge.name) + "!</h1><p>" + esc(s.badge.desc) + "</p>" + (first ? "<p class=\"star-pop\">+" + C.stars.badge + " ⭐ badge bonus!</p>" : "") + "<p>Trial score: <b>" + r.firstPct + "%</b> · all misses cleared.</p>" +
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
      r.idx++; recordTopic(hit.s.id, q, ok); if (ok) questionStar(q); save(); renderHero(); nextFinal();
    });
  }
  function finalResults() {
    var r = S.run, p = pct(r.right, r.order.length), pass = p >= C.passPercent, first = pass && !S.final.passed;
    S.final.history.push({ at: now(), right: r.right, total: r.order.length, pct: p });
    S.final.bestPct = Math.max(S.final.bestPct, p);
    if (pass) { S.final.passed = true; if (!S.final.passedAt) S.final.passedAt = now(); }
    if (first) { S.badges.push({ name: C.final.badge.name, icon: C.final.badge.icon, tunic: C.final.badge.tunic, section: "final", at: now() }); addStars(C.stars.crown, "crown", "final"); }
    var missed = r.missed; S.run = null; save(); renderHero();
    var h = '<div class="panel big-reward">' + (pass ? '<div class="ic">' + C.final.badge.icon + "</div><h1>You passed the Grand Trial!</h1><p>" + esc(C.final.badge.desc) + "</p>" + (first ? "<p class=\"star-pop\">+" + C.stars.crown + " ⭐ crown bonus!</p>" : "") : "<h1>So close!</h1><p>You need " + C.passPercent + "% to win the crown. Review the topics below and try again.</p>") +
      "<p>Score: <b>" + r.right + " / " + r.order.length + " (" + p + "%)</b></p></div>";
    if (missed.length) {
      h += '<div class="panel"><h2>Questions to review</h2>';
      missed.forEach(function (id) { var x = qById(id), q = x.q; h += "<p>" + x.s.icon + " <b>" + esc(q.type === "vocab" ? "Define: " + q.term : q.q) + "</b><br>✔ " + esc(q.type === "mc" || q.type === "vocab" ? q.choices[0] : (q.display || q.accept[0])) + " · <i>" + esc(topicTitle(x.s, q.topic)) + "</i></p>"; });
      h += "</div>";
    }
    h += '<div class="panel"><button class="btn gold" id="b-map">🗺️ Map</button><button class="btn" id="b-again">⚔️ Try the Grand Trial again</button><button class="btn alt" id="b-rep">📋 Parent Report</button></div>';
    show(h); on("b-map", home); on("b-again", startFinal); on("b-rep", report);
  }


  /* ---------------- activity stages (simple low-poly scenes) ---------------- */
  function svgWrap(inner, vb) { return '<svg viewBox="' + (vb || "0 0 320 160") + '" xmlns="http://www.w3.org/2000/svg" class="stage-svg">' + inner + "</svg>"; }
  function pg(pts, fill, ex) { return '<polygon points="' + pts + '" fill="' + fill + '" stroke="#2a1a0c" stroke-width="2" stroke-linejoin="round" ' + (ex || "") + "/>"; }
  function ln(x1, y1, x2, y2, c, w) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + (w || 2) + '" stroke-linecap="round"/>'; }
  function tx(x, y, t, sz, fill, ex) { return '<text x="' + x + '" y="' + y + '" font-size="' + (sz || 12) + '" text-anchor="middle" font-family="Georgia,serif" fill="' + (fill || "#2a1a0c") + '" ' + (ex || "") + ">" + esc(t) + "</text>"; }
  function stageSVG(name, k, n) {
    var o = [], i, f = n ? k / n : 0;
    if (name === "clovis") {
      o.push('<rect width="320" height="160" fill="#e9d8a6"/>', pg("0,120 320,112 320,160 0,160", "#a07a4a"));
      for (i = 0; i < k * 3; i++) o.push(pg((40 + (i * 37) % 240) + "," + (128 + (i * 13) % 22) + " " + (48 + (i * 37) % 240) + "," + (124 + (i * 13) % 22) + " " + (46 + (i * 37) % 240) + "," + (134 + (i * 13) % 22), "#6d6875"));
      if (k < 2) o.push(pg("110,110 130,62 180,52 214,74 220,108 170,122", "#5c5470"), pg("130,62 180,52 170,80", "#7d7393"));
      else {
        var w = k >= 3 ? 26 : 38;
        o.push(pg("160," + (k >= 5 ? 22 : 30) + " " + (160 + w) + ",92 " + (160 + w * .7) + ",118 " + (160 - w * .7) + ",118 " + (160 - w) + ",92", "#4a4e69"), pg("160," + (k >= 5 ? 22 : 30) + " " + (160 + w) + ",92 160,96", "#6c7096"));
        if (k >= 4) o.push(ln(160, 116, 160, 74, "#9a8c98", 6));
        if (k >= 5) for (i = 0; i < 6; i++) o.push(ln(160 - w + i * 3, 90 - i * 10, 160 - w + i * 3 + 4, 94 - i * 10, "#c9c3d6", 2), ln(160 + w - i * 3, 90 - i * 10, 160 + w - i * 3 - 4, 94 - i * 10, "#c9c3d6", 2));
        if (k >= 6) o.push(ln(160 - w * .7 + 3, 117, 160 + w * .7 - 3, 117, "#e0dce8", 3));
        if (k >= 7) o.push(ln(160, 118, 160, 158, "#8a5a32", 10), ln(150, 124, 170, 132, "#d6c08a", 3), ln(150, 132, 170, 124, "#d6c08a", 3));
      }
    } else if (name === "garden") {
      o.push('<rect width="320" height="160" fill="#bfe3ff"/>', '<circle cx="280" cy="30" r="16" fill="#ffd166"/>', pg("0,118 320,118 320,160 0,160", "#7a5230"));
      if (k >= 1) o.push('<path d="M100,120 Q160,70 220,120Z" fill="#8c5e34" stroke="#2a1a0c" stroke-width="2"/>');
      if (k >= 2) o.push(ln(160, 100, 160, 30, "#3f8f3f", 6), pg("160,70 196,52 162,62", "#57b05a"), pg("160,56 126,40 158,50", "#57b05a"), pg("156,44 170,22 172,46", "#f2c14e"));
      if (k >= 3) o.push('<path d="M146,104 Q138,86 164,80 Q186,72 160,62 Q138,54 162,44" fill="none" stroke="#2e7d32" stroke-width="3"/>', '<circle cx="164" cy="80" r="4" fill="#9ccc65"/><circle cx="160" cy="62" r="4" fill="#9ccc65"/>');
      if (k >= 4) o.push(pg("96,118 118,100 132,116", "#2e7d32"), pg("196,116 214,98 234,118", "#2e7d32"), '<ellipse cx="236" cy="124" rx="16" ry="10" fill="#f4a259" stroke="#2a1a0c" stroke-width="2"/>');
      if (k >= 5) o.push(pg("24,96 70,96 64,132 30,132", "#c79a5a"), '<circle cx="38" cy="94" r="5" fill="#f2c14e"/><circle cx="50" cy="92" r="5" fill="#e76f51"/><circle cx="60" cy="94" r="5" fill="#f2c14e"/>');
    } else if (name === "candle") {
      o.push('<rect width="320" height="160" fill="#3b2a1a"/>', pg("0,140 320,140 320,160 0,160", "#5a3a22"), ln(100, 22, 200, 22, "#8a5a32", 8));
      o.push(pg("226,96 300,96 292,140 234,140", "#555"), '<ellipse cx="263" cy="98" rx="36" ry="7" fill="#f3e6b0" stroke="#2a1a0c" stroke-width="2"/>');
      var h = Math.round(8 + f * 80);
      o.push(ln(150, 22, 150, 30 + (k ? h : 10), "#f3efe6", 2));
      if (k >= 1) o.push(pg("142,30 158,30 " + (158 + f * 2) + "," + (30 + h) + " " + (142 - f * 2) + "," + (30 + h), "#f7e7b4"));
      if (k >= n && n) o.push('<circle cx="60" cy="70" r="26" fill="#ffd166" opacity=".35"/>', pg("54,100 66,100 66,130 54,130", "#f7e7b4"), '<path d="M60,78 Q68,90 60,98 Q52,90 60,78Z" fill="#ffb703" stroke="#e85d04" stroke-width="2"/>');
    } else if (name === "press") {
      o.push('<rect width="320" height="160" fill="#efe1c1"/>', pg("40,20 70,20 70,150 40,150", "#6b4226"), pg("250,20 280,20 280,150 250,150", "#6b4226"), pg("40,14 280,14 280,30 40,30", "#8a5a32"), ln(160, 30, 160, 60, "#444", 6), ln(130, 46, 190, 40, "#444", 4));
      o.push(pg("90," + (k >= 4 ? 84 : 64) + " 230," + (k >= 4 ? 84 : 64) + " 230," + (k >= 4 ? 96 : 76) + " 90," + (k >= 4 ? 96 : 76), "#5a5a5a"), pg("80,100 240,100 240,140 80,140", "#a98a5a"));
      if (k >= 1) for (i = 0; i < Math.min(k, 3) * 3; i++) o.push('<rect x="' + (96 + (i % 9) * 14) + '" y="104" width="10" height="10" fill="#333"/>');
      if (k >= 2) o.push('<ellipse cx="106" cy="118" rx="10" ry="6" fill="#111"/>');
      if (k >= 3) o.push(pg("96,100 224,100 224,138 96,138", "#fbf6e8", 'opacity=".95"'));
      if (k >= 5) for (i = 0; i < 6; i++) o.push(ln(104, 108 + i * 5, 216 - (i % 3) * 18, 108 + i * 5, "#222", 2));
      if (k >= n && n) o.push(ln(10, 10, 110, 6, "#8a5a32", 2), pg("20,8 52,6 54,44 22,46", "#fbf6e8"), ln(26, 16, 48, 15, "#222", 1.5), ln(26, 22, 48, 21, "#222", 1.5), ln(26, 28, 44, 27, "#222", 1.5));
    } else if (name === "voyage") {
      o.push('<rect width="320" height="160" fill="#8fd3ff"/>', pg("0,96 320,96 320,160 0,160", "#1f6fb2"));
      for (i = 0; i < 8; i++) o.push('<path d="M' + (i * 44) + ',118 q11,-6 22,0 t22,0" fill="none" stroke="#bfe6ff" stroke-width="2"/>');
      if (k >= n && n) o.push(pg("250,98 280,80 316,84 320,98", "#e9c46a"), ln(290, 82, 292, 58, "#6b4a2b", 3), pg("292,58 278,66 304,64", "#2e7d32"), tx(286, 112, "Guanahani", 10, "#fff"));
      var x = 20 + f * 210;
      o.push(pg((x) + ",96 " + (x + 60) + ",96 " + (x + 52) + ",112 " + (x + 8) + ",112", "#8a5a32"), ln(x + 30, 96, x + 30, 44, "#5a3a1c", 3), pg((x + 32) + ",48 " + (x + 54) + ",62 " + (x + 32) + ",86", "#f3efe6"), pg((x + 28) + ",52 " + (x + 8) + ",80 " + (x + 28) + ",84", "#f3efe6"), '<path d="M' + (x + 34) + ',56 l8,8 m0,-8 l-8,8" stroke="#c0392b" stroke-width="2"/>');
      o.push(tx(160, 20, "Day " + (1 + Math.round(f * 32)) + " at sea", 12, "#123"));
    } else if (name === "fort") {
      o.push('<rect width="320" height="160" fill="#cfe8ff"/>', pg("0,100 320,92 320,160 0,160", "#6a9f4b"), pg("0,130 320,122 320,160 0,160", "#3a7bbf"));
      var sides = [[160, 30, 250, 112], [250, 112, 70, 112], [70, 112, 160, 30]], segs = Math.max(0, Math.round(f * 3 * 4));
      for (i = 0; i < segs && i < 12; i++) { var sd = sides[Math.floor(i / 4)], t1 = (i % 4) / 4, t2 = (i % 4 + 1) / 4; o.push(ln(sd[0] + (sd[2] - sd[0]) * t1, sd[1] + (sd[3] - sd[1]) * t1, sd[0] + (sd[2] - sd[0]) * t2, sd[1] + (sd[3] - sd[1]) * t2, "#7a4e2a", 7)); }
      if (k >= 2) o.push(pg("130,96 150,96 150,80 140,72 130,80", "#b08a5a"));
      if (k >= 4) o.push(pg("166,96 190,96 190,78 178,68 166,78", "#b08a5a"));
      if (k >= 5) o.push(ln(160, 70, 160, 40, "#555", 2), pg("160,40 182,46 160,52", "#c0392b"));
      if (k >= 3) o.push(pg("40,120 90,120 84,128 46,128", "#8a5a32"), ln(64, 120, 64, 100, "#5a3a1c", 2));
    } else {
      o.push('<rect width="320" height="160" fill="#f3e6c8"/>');
      for (i = 0; i < n; i++) o.push('<circle cx="' + (30 + i * (260 / Math.max(1, n - 1))) + '" cy="80" r="12" fill="' + (i < k ? "#2f9e44" : "#d9c79e") + '" stroke="#2a1a0c" stroke-width="2"/>');
    }
    return svgWrap(o.join(""));
  }

  /* stylized North America maps; each region is a [data-bin] target */
  var MAPS = {
    regions: { land: "", regions: [
      { id: "arctic", pts: "18,40 120,18 260,14 380,24 392,70 300,78 200,70 110,84 40,96", c: "#dfe9f2", lx: 200, ly: 46 },
      { id: "nw", pts: "40,96 110,84 118,112 102,206 78,210 56,150", c: "#6fae6a", lx: 84, ly: 150 },
      { id: "plains", pts: "110,84 200,70 236,96 238,228 150,236 124,202 118,112", c: "#e2c46a", lx: 178, ly: 160 },
      { id: "sw", pts: "78,210 102,206 124,202 150,236 160,296 124,304 86,252", c: "#e09a5a", lx: 120, ly: 250 },
      { id: "ew", pts: "200,70 300,78 392,70 372,140 334,176 238,180 236,96", c: "#4f9a58", lx: 300, ly: 124 },
      { id: "se", pts: "238,180 334,176 322,232 302,252 312,292 292,296 272,246 238,228", c: "#8cc56c", lx: 282, ly: 212 } ],
      water: '<path d="M246,104 q10,-6 20,0 q6,8 -4,12 q-10,2 -16,-12Z M270,112 q12,-4 18,4 q-6,8 -18,-4Z" fill="#7cc2ef" stroke="#2a1a0c" stroke-width="1.5"/>' },
    claims: { land: "18,40 120,18 260,14 380,24 392,70 372,140 334,176 322,232 302,252 312,292 292,296 272,246 238,228 190,250 170,300 124,304 86,252 56,150 40,96",
      regions: [
        { id: "spain", pts: "60,196 176,188 194,246 176,300 150,312 112,284 82,240", c: "#f2c14e", lx: 132, ly: 250, extra: "274,250 300,246 306,288 292,294" },
        { id: "france", pts: "190,84 370,74 362,114 302,124 272,136 270,248 240,250 232,142 196,122", c: "#5b8bd9", lx: 300, ly: 98 },
        { id: "dutch", pts: "304,132 324,128 330,170 308,172", c: "#ef8a3a", lx: 316, ly: 150 } ],
      label: '<polygon points="302,124 362,114 346,170 330,200 302,240 276,246 276,200 300,172" fill="#c9c3b5" stroke="#2a1a0c" stroke-width="1.5" stroke-dasharray="4 3"/><text x="292" y="214" font-size="9" text-anchor="middle" font-family="Georgia" fill="#333">English</text><text x="292" y="224" font-size="9" text-anchor="middle" font-family="Georgia" fill="#333">colonies</text>' }
  };
  function mapSVG(a, counts) {
    var m = MAPS[a.map] || MAPS.regions, o = ['<rect width="400" height="320" fill="#8ccbf0"/>'];
    if (m.land) o.push('<polygon points="' + m.land + '" fill="#a9c98a" stroke="#2a1a0c" stroke-width="2"/>');
    if (m.label) o.push(m.label);
    m.regions.forEach(function (r) {
      var bin = null; a.bins.forEach(function (b) { if (b.id === r.id) bin = b; });
      o.push('<g class="map-region" data-bin="' + r.id + '"><polygon points="' + r.pts + '" fill="' + r.c + '" stroke="#2a1a0c" stroke-width="2"/>' + (r.extra ? '<polygon points="' + r.extra + '" fill="' + r.c + '" stroke="#2a1a0c" stroke-width="2"/>' : "") +
        tx(r.lx, r.ly, bin ? bin.label : r.id, 11, "#1a1208", 'font-weight="bold" paint-order="stroke" stroke="#fff" stroke-width="3"') +
        (counts[r.id] ? '<circle cx="' + r.lx + '" cy="' + (r.ly + 14) + '" r="9" fill="#2f9e44" stroke="#fff" stroke-width="2"/>' + tx(r.lx, r.ly + 18, String(counts[r.id]), 11, "#fff") : "") + "</g>");
    });
    if (m.water) o.push(m.water);
    return svgWrap(o.join(""), "0 0 400 320");
  }

  /* ---------------- activity engine ---------------- */
  function actById(sid, id) { var s = sectionById(sid), r = null; (s.activities || []).forEach(function (a) { if (a.id === id) r = a; }); return r; }
  function runActivity(sid, id, back) {
    var s = sectionById(sid), a = actById(sid, id); if (!a) return;
    back = back || function () { sectionIntro(sid); };
    setWorld(s.palette);
    var st = { mistakes: 0 };
    show('<div class="panel act"><div class="qmeta"><span>' + s.icon + " " + esc(s.title) + ' · 🎮 Activity</span><span id="a-mis">Mistakes: 0</span></div><h2>' + a.icon + " " + esc(a.title) + "</h2>" + (a.intro ? "<p>" + md(a.intro) + "</p>" : "") +
      '<div id="a-body"></div><div id="a-fb"></div><div class="act-foot"><button class="btn warn small" id="a-quit">✖ Quit activity</button></div></div>');
    on("a-quit", back);
    function miss() { st.mistakes++; document.getElementById("a-mis").textContent = "Mistakes: " + st.mistakes; }
    function fb(ok, html) { document.getElementById("a-fb").innerHTML = '<div class="feedback ' + (ok ? "ok" : "no") + '">' + html + "</div>"; }
    var api = { body: document.getElementById("a-body"), miss: miss, fb: fb, done: function () { finishActivity(sid, a, st.mistakes, back); } };
    ({ sequence: actSequence, sort: actSort, map: actSort, scenario: actScenario, dialogue: actScenario }[a.type] || actSequence)(a, api);
    renderHero();
  }
  function actSequence(a, api) {
    var n = a.steps.length, k = 0, log = [];
    var cards = shuffle(a.steps.map(function (x, i) { return { t: x.t, i: i, fact: x.fact }; }).concat((a.distractors || []).map(function (d) { return { t: d.t, why: d.why, i: -1 }; })));
    function draw() {
      var h = '<div class="stage">' + stageSVG(a.stage, k, n) + '</div><div class="seq-wrap"><ol class="seq-done">';
      log.forEach(function (c) { h += "<li><b>" + esc(c.t) + "</b><small>" + md(c.fact || "") + "</small></li>"; });
      h += "</ol>" + (k < n ? "<p><b>Step " + (k + 1) + " of " + n + ":</b> what comes next?</p>" : "") + '<div class="seq-cards">';
      cards.forEach(function (c, ci) { if (!c.done && !c.gone) h += '<button class="seq-card" data-ci="' + ci + '">' + esc(c.t) + "</button>"; });
      h += "</div></div>";
      api.body.innerHTML = h;
      $all(".seq-card", api.body).forEach(function (b) { b.onclick = function () { pick(cards[+b.getAttribute("data-ci")]); }; });
    }
    function pick(c) {
      if (c.i === k) { c.done = true; log.push(c); k++; api.fb(true, "✅ <b>Yes!</b> " + md(c.fact || "")); draw(); if (k >= n) setTimeout(api.done, 900); }
      else if (c.i < 0) { c.gone = true; api.miss(); api.fb(false, "❌ <b>That doesn't belong!</b> " + md(c.why || "")); draw(); }
      else { api.miss(); api.fb(false, "❌ <b>Not yet!</b> That step comes later. What has to happen first?"); }
    }
    draw();
  }
  function actSort(a, api) {
    var items = shuffle(a.items.map(function (x, i) { return { t: x.t, bin: x.bin, fact: x.fact, i: i, tries: 0 }; })), sel = null, placed = 0;
    function binLabel(id) { var r = id; a.bins.forEach(function (b) { if (b.id === id) r = (b.icon ? b.icon + " " : "") + b.label; }); return r; }
    function draw() {
      var counts = {}; items.forEach(function (it) { if (it.placed) counts[it.bin] = (counts[it.bin] || 0) + 1; });
      var h = '<div class="tray">' + (placed < items.length ? "" : "<i>All sorted!</i>");
      items.forEach(function (it, ii) { if (!it.placed) h += '<button class="drag-item' + (sel === ii ? " sel" : "") + '" data-ii="' + ii + '">' + esc(it.t) + "</button>"; });
      h += "</div>";
      if (a.type === "map") h += '<div class="map-stage">' + mapSVG(a, counts) + "</div>";
      h += '<div class="bins' + (a.type === "map" ? " map-bins" : "") + '">';
      a.bins.forEach(function (b) {
        h += '<div class="bin" data-bin="' + b.id + '" role="button" tabindex="0"><div class="bin-h">' + (b.icon ? b.icon + " " : "") + esc(b.label) + "</div>";
        items.forEach(function (it) { if (it.placed && it.bin === b.id) h += '<span class="placed">' + esc(it.t) + "</span>"; });
        h += "</div>";
      });
      h += "</div>";
      api.body.innerHTML = h;
      $all(".drag-item", api.body).forEach(function (b) { wireDrag(b, +b.getAttribute("data-ii")); });
      $all("[data-bin]", api.body).forEach(function (b) { b.onclick = function () { if (sel === null) { toast("First tap a card, then tap where it belongs."); return; } place(sel, b.getAttribute("data-bin")); }; });
    }
    function place(ii, bin) {
      var it = items[ii]; if (!it || it.placed) return;
      sel = null;
      if (it.bin === bin) { it.placed = true; placed++; api.fb(true, "✅ <b>" + esc(it.t) + "</b> → " + esc(binLabel(bin)) + ". " + md(it.fact || "")); draw(); if (placed >= items.length) setTimeout(api.done, 900); }
      else { it.tries++; api.miss(); api.fb(false, "❌ <b>" + esc(it.t) + "</b> doesn't go in " + esc(binLabel(bin)) + "." + (it.tries >= 2 ? " Hint: it belongs in <b>" + esc(binLabel(it.bin)) + "</b>." : " Think about the clues in the lesson and try again!")); draw(); }
    }
    function wireDrag(el, ii) {
      el.style.touchAction = "none";
      el.addEventListener("click", function (e) { if (e.detail === 0) { sel = sel === ii ? null : ii; draw(); } }); /* keyboard / assistive tap */
      el.addEventListener("pointerdown", function (e) {
        var sx = e.clientX, sy = e.clientY, ghost = null, moved = false;
        function mv(ev) {
          if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 8) return;
          if (!moved) { moved = true; ghost = el.cloneNode(true); ghost.className = "drag-item ghost"; document.body.appendChild(ghost); }
          ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px";
          $all(".bin.over, .map-region.over", api.body).forEach(function (x) { x.classList.remove("over"); });
          var t = document.elementFromPoint(ev.clientX, ev.clientY), b = t && t.closest ? t.closest("[data-bin]") : null; if (b) b.classList.add("over");
        }
        function up(ev) {
          document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
          if (ghost) ghost.remove();
          if (moved) { var t = document.elementFromPoint(ev.clientX, ev.clientY), b = t && t.closest ? t.closest("[data-bin]") : null; if (b) place(ii, b.getAttribute("data-bin")); else draw(); }
          else { sel = sel === ii ? null : ii; draw(); }
        }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
        e.preventDefault();
      });
    }
    draw();
  }
  function actScenario(a, api) {
    var nodes = a.nodes || a.lines, n = nodes.length, k = 0, parch = (a.parchment || []).slice(), orders = nodes.map(function (nd) { return shuffle(nd.choices.map(function (c, i) { return i; })); }), solved = false, gone = {};
    function draw() {
      var nd = nodes[k], h = "";
      if (a.type === "dialogue") {
        var who = a.who || {};
        h += '<div class="dlg"><div class="dlg-portrait">' + (who.look ? window.HeroArt.render(who.look) : '<div class="ic">' + (who.portrait || "🧑") + "</div>") + '<b>' + esc(who.name || "") + "</b><small>" + esc(who.role || "") + '</small></div><div class="bubble">' + md(nd.say) + '<div class="dlg-step">' + (k + 1) + " / " + n + "</div></div></div>";
      } else {
        h += '<div class="stage">' + (a.stage === "compact" ? '<div class="parchment"><div class="parch-h">📜 The Agreement</div>' + (parch.length ? parch.map(function (l) { return "<p>" + md(l) + "</p>"; }).join("") : "<p class=\"dim\">(blank parchment: choose the words!)</p>") + "</div>" : stageSVG(a.stage, k + (solved ? 1 : 0), n)) + "</div>";
        h += '<div class="scene sc-say"><div class="who">Step ' + (k + 1) + " of " + n + "</div>" + md(nd.say) + "</div>";
      }
      h += '<div class="choices">';
      orders[k].forEach(function (ci, j) { var c = nd.choices[ci]; h += '<button class="choice sc-choice' + (gone[ci] ? " wrong" : "") + (solved && c.ok ? " right" : "") + '" data-c="' + ci + '"' + (solved || gone[ci] ? " disabled" : "") + ">" + "ABCDEF"[j] + ". " + esc(c.t) + "</button>"; });
      h += "</div>" + (solved ? '<button class="btn" id="a-next">' + (k < n - 1 ? "Continue ▶" : "Finish ▶") + "</button>" : "");
      api.body.innerHTML = h;
      $all(".sc-choice", api.body).forEach(function (b) { b.onclick = function () { choose(+b.getAttribute("data-c")); }; });
      on("a-next", function () { if (k < n - 1) { k++; solved = false; gone = {}; document.getElementById("a-fb").innerHTML = ""; draw(); } else api.done(); });
    }
    function choose(ci) {
      var c = nodes[k].choices[ci];
      if (c.ok) { solved = true; if (c.add) parch = parch.concat(c.add); else if (nodes[k].add) parch = parch.concat(nodes[k].add); api.fb(true, "✅ " + md(c.r || "Good choice!")); }
      else { gone[ci] = true; api.miss(); api.fb(false, "❌ " + md(c.r || "Not the best choice. Try again!")); }
      draw();
    }
    draw();
  }
  function finishActivity(sid, a, mistakes, back) {
    var SC = C.stars, rating = mistakes === 0 ? 3 : (mistakes <= 2 ? 2 : 1), value = [0, SC.actDone, SC.actGood, SC.actPerfect][rating];
    var r = S.acts[a.id] || (S.acts[a.id] = { best: 0, bestStars: 0, plays: 0, firstAt: now(), lastAt: null, earned: 0, practiceDay: "", practiceCount: 0, history: [] });
    var n = 0, why;
    if (value > r.bestStars) { n = addStars(value - r.bestStars, "activity", a.id); why = r.plays ? "You beat your best score, so you earn the difference!" : "First play reward!"; r.bestStars = value; }
    else {
      if (r.practiceDay !== today()) { r.practiceDay = today(); r.practiceCount = 0; }
      if (r.practiceCount < SC.practicePerDay) { r.practiceCount++; n = addStars(SC.practice, "practice", a.id); why = "Practice bonus (" + r.practiceCount + " of " + SC.practicePerDay + " today)."; }
      else why = "You've used today's practice stars for this activity. Try another activity, or answer new trial questions to earn more!";
    }
    r.best = Math.max(r.best, rating); r.plays++; r.lastAt = now(); r.earned += n;
    r.history.push({ at: now(), mistakes: mistakes, rating: rating, stars: n }); if (r.history.length > 20) r.history = r.history.slice(-20);
    save(); renderHero();
    show('<div class="panel big-reward act-done"><div class="ic">' + a.icon + "</div><h1>" + esc(a.title) + ' complete!</h1><div class="rating">' + "⭐".repeat(rating) + '<span class="dim">' + "☆".repeat(3 - rating) + "</span></div><p>Mistakes: <b>" + mistakes + "</b> · " + (n ? '<span class="star-pop">+' + n + " ⭐ stars</span>" : "no new stars") + "</p><p>" + esc(why) + "</p><p>Your balance: <b>⭐ " + S.stars.balance + "</b></p>" +
      '<button class="btn" id="a-again">🔁 Play again</button><button class="btn alt" id="a-back">◀ Back</button><button class="btn gold" id="a-market">🏪 Marketplace</button></div>');
    on("a-again", function () { runActivity(sid, a.id, back); }); on("a-back", back); on("a-market", function () { market(); });
  }

  /* ---------------- character screen ---------------- */
  function character() {
    closeModal(); setWorld(null);
    var p = currentPlayer();
    var h = '<div class="panel char"><h2>🧍 ' + esc(p.name) + "'s Character</h2><div class=\"char-grid\"><div class=\"char-hero\" id=\"char-hero\">" + heroSVG() + '<div class="hero-stars">⭐ ' + S.stars.balance + " stars</div></div><div class=\"char-slots\">";
    SLOTS.forEach(function (sl) {
      var mine = S.owned.filter(function (k) { return ITEMS[k].slot === sl && ITEMS[k].art; });
      h += '<div class="slot-row"><div class="slot-name">' + SLOT_LABEL[sl] + '</div><div class="slot-opts">';
      if (!mine.length) h += '<span class="dim">empty: earn or buy an item</span>';
      else {
        h += '<button class="eq-btn' + (!S.equip[sl] ? " sel" : "") + '" data-slot="' + sl + '" data-key="">None</button>';
        mine.forEach(function (k) { var it = ITEMS[k]; h += '<button class="eq-btn' + (S.equip[sl] === k ? " sel" : "") + '" data-slot="' + sl + '" data-key="' + k + '" title="' + esc(it.desc || "") + '">' + it.icon + " " + esc(it.name) + "</button>"; });
      }
      h += "</div></div>";
    });
    h += "</div></div>";
    var pack = S.owned.filter(function (k) { return ITEMS[k].slot === "pack" || !ITEMS[k].art; });
    h += "<h3>🎒 Pack</h3>" + (pack.length ? '<div class="inv">' + pack.map(function (k) { var it = ITEMS[k]; return '<div class="item"><div class="ic">' + it.icon + "</div><b>" + esc(it.name) + "</b><small>" + esc(it.desc || "") + "</small></div>"; }).join("") + "</div>" : "<p class=\"dim\">Nothing in your pack yet. Some market goods (like trade goods and books) are carried in the pack.</p>");
    h += "<h3>🏅 Badges</h3>" + (S.badges.length ? '<div class="inv">' + S.badges.map(function (b) { return '<div class="item badge"><div class="ic">' + b.icon + "</div><b>" + esc(b.name) + "</b><small>" + fmtDate(b.at) + "</small></div>"; }).join("") + "</div>" : "<p class=\"dim\">Master a land to earn a badge (and dye your tunic!).</p>");
    h += '<p><button class="btn gold" id="b-market">🏪 Marketplace</button><button class="btn alt" id="b-map">🗺️ Map</button></p></div>';
    show(h);
    $all(".eq-btn", $screen).forEach(function (b) { b.onclick = function () { var sl = b.getAttribute("data-slot"), k = b.getAttribute("data-key"); if (k) S.equip[sl] = k; else delete S.equip[sl]; save(); character(); }; });
    on("b-market", function () { market(); }); on("b-map", home);
    renderHero();
  }
  function inventory() { character(); }

  /* ---------------- marketplace ---------------- */
  function marketOpen(m) { var i = C.sections.indexOf(sectionById(m.unlock)); return i >= 0 && isUnlocked(i); }
  function marketScene(m) {
    var o = [], sc = m.scene, sky = { cahokia: ["#ffd9a0", "#9fd3f5"], seville: ["#ffe6b0", "#7cc7f0"], amsterdam: ["#dfe8f0", "#9ab8d8"], jamestown: ["#f6e2b0", "#a8d4ef"], boston: ["#f3dcc0", "#a5c8e8"] }[sc] || ["#ffe6b0", "#9fd3f5"];
    o.push('<defs><linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky[1] + '"/><stop offset="1" stop-color="' + sky[0] + '"/></linearGradient></defs><rect width="600" height="220" fill="url(#msky)"/>');
    if (sc === "cahokia") {
      o.push(pg("300,120 340,70 470,70 520,120", "#8a6a3a"), pg("370,70 380,52 430,52 440,70", "#7a5a2a"), pg("392,52 405,34 418,52", "#c8a060"));
      [60, 130, 540].forEach(function (x) { o.push(pg((x - 24) + ",150 " + (x + 24) + ",150 " + (x + 20) + ",124 " + (x - 20) + ",124", "#b08a5a"), pg((x - 28) + ",126 " + x + ",96 " + (x + 28) + ",126", "#d9b36a")); });
      o.push(pg("0,150 600,146 600,220 0,220", "#a6884f"));
    } else if (sc === "seville") {
      o.push(pg("0,140 600,140 600,220 0,220", "#2b6fae"), pg("420,140 420,40 446,40 446,140", "#d9a46a"), pg("424,40 433,18 442,40", "#c97a3a"));
      [80, 180].forEach(function (x) { o.push(pg((x - 50) + ",140 " + (x + 50) + ",140 " + (x + 40) + ",160 " + (x - 40) + ",160", "#7a4e2a"), ln(x, 140, x, 60, "#5a3a1c", 4), pg(x + ",66 " + (x + 34) + ",92 " + x + ",124", "#f3efe6")); });
      o.push(pg("250,150 600,150 600,220 250,220", "#cfa877"));
    } else if (sc === "amsterdam") {
      [[40, "#a0442c"], [110, "#7a3020"], [180, "#b8643a"], [430, "#8a3a26"], [500, "#a0442c"]].forEach(function (g) { var x = g[0]; o.push(pg(x + ",150 " + (x + 60) + ",150 " + (x + 60) + ",80 " + (x + 48) + ",80 " + (x + 48) + ",66 " + (x + 36) + ",66 " + (x + 30) + ",52 " + (x + 24) + ",66 " + (x + 12) + ",66 " + (x + 12) + ",80 " + x + ",80", g[1])); o.push('<rect x="' + (x + 12) + '" y="96" width="12" height="16" fill="#fff4c0"/><rect x="' + (x + 36) + '" y="96" width="12" height="16" fill="#fff4c0"/>'); });
      o.push(pg("320,150 340,60 356,60 376,150", "#7a6a5a"), ln(348, 62, 300, 20, "#f3efe6", 6), ln(348, 62, 396, 104, "#f3efe6", 6), ln(348, 62, 390, 18, "#f3efe6", 6), ln(348, 62, 306, 106, "#f3efe6", 6));
      o.push(pg("0,150 600,150 600,220 0,220", "#9a8a72"));
    } else if (sc === "jamestown") {
      for (var i = 0; i < 30; i++) o.push(pg((i * 20) + ",150 " + (i * 20 + 16) + ",150 " + (i * 20 + 16) + ",86 " + (i * 20 + 8) + ",76 " + (i * 20) + ",86", "#8a5a32"));
      o.push(pg("380,150 520,150 520,110 380,110", "#b08a5a"), pg("370,112 450,70 530,112", "#d9b36a"), pg("0,150 600,150 600,220 0,220", "#8c7a4a"));
    } else {
      [[20, "#9b3b2a"], [150, "#8a3424"], [440, "#a2452e"]].forEach(function (g) { var x = g[0]; o.push(pg(x + ",150 " + (x + 120) + ",150 " + (x + 120) + ",70 " + x + ",70", g[1]), pg((x - 6) + ",72 " + (x + 60) + ",46 " + (x + 126) + ",72", "#4a3a3a")); for (var j = 0; j < 3; j++) o.push('<rect x="' + (x + 14 + j * 36) + '" y="88" width="18" height="22" fill="#fff4c0" stroke="#2a1a0c"/>'); });
      o.push(pg("320,150 360,150 360,60 340,20 320,60", "#e8e0d0"), pg("0,150 600,150 600,220 0,220", "#8f8a80"));
    }
    o.push(pg("150,150 600,150 600,170 150,170", "#6b4226"), pg("160,120 600,120 600,150 160,150", "#a0703a"));
    for (var s2 = 0; s2 < 9; s2++) o.push(pg((160 + s2 * 50) + ",104 " + (210 + s2 * 50) + ",104 " + (205 + s2 * 50) + ",122 " + (165 + s2 * 50) + ",122", s2 % 2 ? "#e8d9b0" : (sc === "cahokia" ? "#b5543a" : "#c0392b")));
    return svgWrap(o.join(""), "0 0 600 220");
  }
  var marketTab = null;
  function market(mid, say) {
    closeModal();
    var ms = C.markets || [];
    var open = ms.filter(marketOpen);
    if (!mid) mid = (marketTab && marketOpen(marketById(marketTab))) ? marketTab : (open.length ? open[open.length - 1].id : ms[0].id);
    var m = marketById(mid); marketTab = mid;
    var sIdx = C.sections.indexOf(sectionById(m.unlock)); setWorld(C.sections[sIdx].palette);
    var h = '<div class="panel market"><div class="mk-tabs">';
    ms.forEach(function (x) { var op = marketOpen(x); h += '<button class="mk-tab' + (x.id === mid ? " sel" : "") + (op ? "" : " locked") + '" data-mid="' + x.id + '">' + x.icon + " " + esc(x.name) + (op ? "" : " 🔒") + "</button>"; });
    h += "</div>";
    if (!marketOpen(m)) {
      h += "<h2>" + m.icon + " " + esc(m.name) + " 🔒</h2><p>This market opens when you reach <b>" + esc(C.sections[sIdx].title) + "</b> (Section " + (sIdx + 1) + ").</p></div>";
      show(h); wireTabs(); renderHero(); return;
    }
    var k = m.keeper;
    h += "<h2>" + m.icon + " " + esc(m.name) + "</h2><div class=\"mk-sub\">📍 " + esc(m.place) + " · " + esc(m.year) + '</div><div class="mk-scene">' + marketScene(m) +
      '<div class="mk-keeper">' + window.HeroArt.render(k.look) + '</div><div class="mk-bubble" id="mk-say"><b>' + esc(k.name) + "</b> <small>(" + esc(k.role) + ")</small><br>“" + esc(say || k.greet) + "”</div>" +
      '<div class="mk-bal">⭐ <span id="mk-balance">' + S.stars.balance + "</span></div></div><p class=\"mk-blurb\">" + md(m.blurb) + "</p><div class=\"mk-items\">";
    m.items.forEach(function (x) {
      var have = own(x.key), can = S.stars.balance >= x.price, worn = S.equip[x.slot] === x.key;
      h += '<div class="mk-item tier-' + x.tier + (have ? " owned" : "") + '" data-key="' + x.key + '"><div class="ic">' + x.icon + '</div><b>' + esc(x.name) + '</b><small class="tier">' + esc(x.tier) + " · " + (x.slot === "pack" ? "carried in pack" : "worn: " + SLOT_LABEL[x.slot]) + '</small><div class="price">⭐ ' + x.price + "</div>" +
        '<div class="mk-btns"><button class="btn small alt" data-ask="' + x.key + '">💬 Ask about it</button>' + (x.art && !have ? '<button class="btn small" data-try="' + x.key + '">👀 Try on</button>' : "") +
        (have ? (x.art && x.slot !== "pack" ? '<button class="btn small gold" data-wear="' + x.key + '">' + (worn ? "✓ Wearing" : "Wear it") + "</button>" : "") + '<span class="owned-tag">✓ Owned</span>'
          : '<button class="btn small gold buy' + (can ? "" : " poor") + '" data-buy="' + x.key + '" aria-disabled="' + (!can) + '">' + (can ? "Buy ⭐ " + x.price : "Need ⭐ " + (x.price - S.stars.balance) + " more") + "</button>") + "</div></div>";
    });
    h += '</div><p><button class="btn alt" id="b-char">🧍 My Character</button><button class="btn alt" id="b-map">🗺️ Leave the market</button></p></div>';
    show(h); wireTabs();
    function sayIt(t) { document.getElementById("mk-say").innerHTML = "<b>" + esc(k.name) + "</b> <small>(" + esc(k.role) + ")</small><br>“" + esc(t) + "”"; }
    $all("[data-ask]", $screen).forEach(function (b) { b.onclick = function () { sayIt(ITEMS[b.getAttribute("data-ask")].fact); }; });
    $all("[data-try]", $screen).forEach(function (b) { b.onclick = function () { var it = ITEMS[b.getAttribute("data-try")], eq = Object.assign({}, S.equip); eq[it.slot] = it.key; document.getElementById("hero").innerHTML = heroSVG({ equip: eq }); document.getElementById("gear-progress").innerHTML = "👀 Trying on: " + esc(it.name); }; });
    $all("[data-wear]", $screen).forEach(function (b) { b.onclick = function () { var it = ITEMS[b.getAttribute("data-wear")]; S.equip[it.slot] = it.key; save(); market(mid, "That looks very fine on you!"); }; });
    $all("[data-buy]", $screen).forEach(function (b) { b.onclick = function () {
      var it = ITEMS[b.getAttribute("data-buy")];
      if (S.stars.balance < it.price) { sayIt(k.poor); toast("You need ⭐ " + (it.price - S.stars.balance) + " more stars for the " + esc(it.name) + "."); return; }
      modal('<div class="panel"><h2>' + it.icon + " Buy the " + esc(it.name) + "?</h2><p>Price: <b>⭐ " + it.price + "</b>. You have ⭐ " + S.stars.balance + " and will have <b>⭐ " + (S.stars.balance - it.price) + "</b> left.</p><p>" + esc(it.fact) + '</p><button class="btn gold" id="b-buy-yes">Yes, buy it!</button><button class="btn alt" id="b-buy-no">Not now</button></div>');
      on("b-buy-no", closeModal);
      on("b-buy-yes", function () { closeModal(); buy(it.key) ? (toast(it.icon + " You bought the " + esc(it.name) + "!" + (it.slot !== "pack" && it.art ? " It's on your hero now." : " It's in your pack.")), market(mid, k.thanks)) : market(mid, k.poor); });
    }; });
    on("b-char", character); on("b-map", function () { toast("“" + esc(k.bye) + "”"); home(); });
    renderHero();
  }
  function wireTabs() { $all(".mk-tab", $screen).forEach(function (b) { b.onclick = function () { market(b.getAttribute("data-mid")); }; }); }
  function buy(key) {
    var it = ITEMS[key]; if (!it || !it.price || own(key)) return false;
    var m = marketById(it.market); if (!m || !marketOpen(m)) return false;
    if (!spendStars(it.price)) return false;
    grantItem(key, true);
    S.purchases.push({ key: key, name: it.name, price: it.price, market: it.market, at: now() });
    save(); renderHero(); return true;
  }
  /* ---------------- parent report ---------------- */
  function allActs() { var o = []; C.sections.forEach(function (s) { (s.activities || []).forEach(function (a) { o.push({ s: s, a: a }); }); }); return o; }
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
    L.push("STARS: balance " + S.stars.balance + " | earned " + S.stars.earned + " | spent " + S.stars.spent);
    Object.keys(S.stars.bySource).forEach(function (k) { L.push(" - " + (SRC_LABEL[k] || k) + ": " + S.stars.bySource[k]); });
    L.push("");
    L.push("HISTORY ACTIVITIES (" + Object.keys(S.acts).length + " of " + allActs().length + " tried; 3 stars = no mistakes):");
    allActs().forEach(function (x) { var r = S.acts[x.a.id]; if (r && r.plays) L.push(" - [" + x.s.title + "] " + x.a.title + ": played " + r.plays + "x, best " + r.best + "/3, last " + r.history[r.history.length - 1].mistakes + " mistakes, stars " + r.earned); });
    L.push("");
    var vk = Object.keys(C.videos || {});
    L.push("LESSON VIDEOS (" + vk.filter(function (k) { return S.videos[k] && S.videos[k].views; }).length + " of " + vk.length + " watched):");
    vk.forEach(function (k) { var r = S.videos[k]; if (r && (r.views || r.checked)) L.push(" - " + C.videos[k].title + ": watched " + r.views + "x, finished " + r.ended + "x, check best " + r.best + "/" + C.videos[k].check.length + " (" + r.right + " right, " + r.wrong + " missed), stars " + r.stars); });
    L.push("");
    L.push("MARKETPLACE PURCHASES: " + (S.purchases.length ? "" : "none yet"));
    S.purchases.forEach(function (x) { var m = marketById(x.market); L.push(" - " + x.name + " (" + x.price + " stars) at " + (m ? m.name : x.market) + ", " + fmtDate(x.at)); });
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
      "<h3>⭐ Stars</h3><p>Balance <b>" + S.stars.balance + "</b> · earned " + S.stars.earned + " · spent " + S.stars.spent + "</p>" +
      '<table class="rep"><tr><th>Earned from</th><th>Stars</th></tr>' + Object.keys(S.stars.bySource).map(function (k) { return "<tr><td>" + esc(SRC_LABEL[k] || k) + "</td><td>" + S.stars.bySource[k] + "</td></tr>"; }).join("") + "</table>" +
      "<h3>🎮 Activities</h3>" + '<table class="rep"><tr><th>Activity</th><th>Plays</th><th>Best</th><th>Stars</th></tr>' + allActs().map(function (x) { var r = S.acts[x.a.id] || {}; return "<tr><td>" + x.a.icon + " " + esc(x.a.title) + "</td><td>" + (r.plays || 0) + "</td><td>" + (r.best ? "⭐".repeat(r.best) : "—") + "</td><td>" + (r.earned || 0) + "</td></tr>"; }).join("") + "</table>" +
      "<h3>🎬 Lesson Videos</h3>" + '<table class="rep"><tr><th>Video</th><th>Watched</th><th>Check best</th><th>Stars</th></tr>' + Object.keys(C.videos || {}).map(function (k) { var r = S.videos[k] || {}; return "<tr><td>" + esc(C.videos[k].title) + "</td><td>" + (r.views || 0) + "</td><td>" + (r.checked ? r.best + "/" + C.videos[k].check.length : "–") + "</td><td>" + (r.stars || 0) + "</td></tr>"; }).join("") + "</table>" +
      "<h3>🏪 Purchases</h3>" + (S.purchases.length ? "<ul>" + S.purchases.map(function (x) { return "<li>" + esc(x.name) + " · ⭐ " + x.price + " · " + fmtDate(x.at) + "</li>"; }).join("") + "</ul>" : "<p>None yet.</p>") +
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
      if (confirm("Erase ALL progress, gear, badges, stars, and purchases on this device? This cannot be undone.") && confirm("Are you really sure?")) { localStorage.removeItem(SAVE_KEY); load(); closeModal(); home(); toast("Progress reset."); }
    });
  }

  /* ---------------- boot ---------------- */
  load(); save();
  on("btn-home", function () { closeModal(); home(); });
  on("btn-inv", character);
  on("btn-market", function () { market(); });
  on("btn-report", report);
  document.getElementById("modal").addEventListener("click", function (e) { if (e.target.id === "modal") closeModal(); });
  document.getElementById("game-version").textContent = GAME_VERSION;
  window.ABRPG = { version: GAME_VERSION, norm: norm, checkTyped: checkTyped, state: function () { return S; }, items: ITEMS, migrate: migrate, buy: buy, market: market, character: character, runActivity: runActivity, home: home, lesson: lesson };
  home();
})();
