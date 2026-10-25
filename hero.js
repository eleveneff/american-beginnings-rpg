/* American Beginnings v2 — hero renderer.
   Draws a full-body hero (girl or boy) as layered SVG in a 300x520 box.
   Every gear "art" is drawn in the hero's own body coordinates so it fits:
   cloaks hang from the shoulders, belts sit at the waist (y≈250), straps
   cross the chest, hats sit on the head (brim y≈62), tools sit in the hands
   (right hand at x≈90,y≈312; left hand at x≈210,y≈312).
   window.HeroArt.render({gender, tunic, equip:{slot:{art,color}}}) -> svg string */
(function () {
  "use strict";
  function sh(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  var INK = "#2a1a0c";
  function P(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" ' + (extra || "") + "/>"; }
  function Pn(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '" ' + (extra || "") + "/>"; }
  function L(d, col, w, extra) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round" ' + (extra || "") + "/>"; }
  function C(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="2" ' + (extra || "") + "/>"; }
  function E(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="2" ' + (extra || "") + "/>"; }
  /* mirror an x coordinate around the body's center line */
  function M(x) { return 300 - x; }

  /* ---------- gear art: each returns {layer: svg} ----------
     layers (back to front): cloakBack, back, hairBack(body), feet, body,
     belt, neck, strap, cloakFront, arms(body), head(hat), handR, handL */
  var ART = {};
  /* HEAD */
  ART["feather-band"] = function (c) { return { head:
    P("M178,66 Q196,26 190,2 Q174,24 172,66Z", "#d9472b") + L("M175,64 Q186,30 189,6", "#7a1d10", 1.5) +
    P("M168,62 Q176,22 164,4 Q156,28 160,62Z", "#2b7fd8") + L("M164,60 Q168,30 165,8", "#123d6e", 1.5) +
    P("M114,70 Q150,58 186,70 L186,80 Q150,68 114,80Z", c) + Pn("M120,72 L130,70 L130,76 L120,78Z M140,68 L150,67 L150,73 L140,74Z M160,67 L170,68 L170,74 L160,73Z", "#f3e6c8") }; };
  ART["copper-plume"] = function (c) { return { head:
    P("M150,56 Q140,20 150,0 Q160,20 150,56Z", "#f4f1e8") + P("M138,58 Q118,26 122,6 Q138,26 146,58Z", "#2f2f2f") + P("M162,58 Q182,26 178,6 Q162,26 154,58Z", "#2f2f2f") +
    P("M114,70 Q150,58 186,70 L186,80 Q150,68 114,80Z", "#7a3b1e") + P("M136,46 L164,46 L168,74 L150,82 L132,74Z", c) + L("M140,52 L160,52 M142,60 L158,60 M146,68 L154,68", sh(c, -60), 2) }; };
  ART["nav-cap"] = function (c) { return { head:
    P("M113,72 Q110,32 150,28 Q190,32 187,72 Q150,62 113,72Z", c) + L("M128,40 Q150,30 172,40", sh(c, 40), 3) +
    P("M110,66 Q150,56 190,66 L190,78 Q150,68 110,78Z", sh(c, -30)) }; };
  ART["wool-cap"] = function (c) { return { head:
    P("M114,70 Q112,34 152,28 Q182,28 196,48 Q206,66 200,90 Q190,70 186,64 Q150,58 114,70Z", c) +
    L("M126,46 Q150,36 176,42", sh(c, 40), 3) + P("M110,64 Q150,54 190,64 L190,76 Q150,66 110,76Z", sh(c, -35)) }; };
  ART["beaver-cap"] = function (c) {
    var fur = ""; for (var i = 0; i < 12; i++) { var x = 116 + i * 6; fur += L("M" + x + ",70 l" + (i % 2 ? 2 : -2) + ",-8", sh(c, 35), 1.6); }
    return { head: P("M110,76 Q106,28 150,24 Q194,28 190,76 Q150,64 110,76Z", c) + L("M124,44 Q150,32 176,44", sh(c, 30), 4) +
      P("M106,66 Q150,54 194,66 Q196,78 190,84 Q150,72 110,84 Q104,78 106,66Z", sh(c, -22)) + fur }; };
  ART["beaver-hat"] = function (c) { return { head:
    E(150, 62, 62, 12, sh(c, -10)) + P("M120,62 L124,14 Q150,6 176,14 L180,62 Q150,70 120,62Z", c) +
    P("M121,50 Q150,56 179,50 L180,60 Q150,66 120,60Z", "#2a1a0c") + L("M128,22 Q150,16 160,18", sh(c, 35), 3) }; };
  ART["capotain"] = function (c) { return { head:
    E(150, 64, 58, 11, sh(c, -8)) + P("M122,64 L130,6 Q150,0 170,6 L178,64 Q150,72 122,64Z", c) +
    P("M124,48 Q150,54 176,48 L177,60 Q150,66 123,60Z", sh(c, -30)) + P("M142,48 L158,48 L158,61 L142,61Z", "#d9b44a") + Pn("M146,52 L154,52 L154,57 L146,57Z", sh(c, -30)) +
    L("M134,14 Q146,8 156,9", sh(c, 45), 3) }; };
  ART["tricorn"] = function (c) { return { head:
    P("M118,60 Q120,26 150,22 Q180,26 182,60Z", c) +
    P("M80,54 Q100,30 124,38 Q150,50 176,38 Q200,30 220,54 Q190,62 170,80 Q150,66 130,80 Q110,62 80,54Z", sh(c, 10)) +
    L("M82,54 Q110,62 130,80 Q150,66 170,80 Q190,62 218,54", "#d9b44a", 3) + C(196, 46, 5, "#f3e6c8") }; };
  /* CLOAK */
  function cloakBack(c) { return P("M104,148 Q150,136 196,148 Q214,160 222,240 L232,438 Q150,456 68,438 L78,240 Q86,160 104,148Z", sh(c, -28)); }
  function capelet(c) { return P("M108,144 Q150,130 192,144 Q210,152 214,186 Q196,198 176,186 Q164,164 150,164 Q136,164 124,186 Q104,198 86,186 Q90,152 108,144Z", c); }
  ART["fur-cloak"] = function (c) {
    var trim = "M86,186 "; for (var i = 0; i <= 8; i++) { trim += "L" + (90 + i * 4.2) + "," + (190 + (i % 2) * 6) + " "; }
    var tr2 = "M214,186 "; for (var j = 0; j <= 8; j++) { tr2 += "L" + (210 - j * 4.2) + "," + (190 + (j % 2) * 6) + " "; }
    return { cloakBack: cloakBack(c) + L("M70,436 L78,444 L86,436 L94,444 L102,436 M198,436 L206,444 L214,436 L222,444 L230,436", "#efe4cf", 4),
      cloakFront: capelet(c) + L(trim, "#efe4cf", 5) + L(tr2, "#efe4cf", 5) + P("M120,146 Q150,158 180,146 Q176,136 150,136 Q124,136 120,146Z", "#efe4cf") + L("M110,160 l6,6 M120,170 l5,6 M184,168 l-5,6 M192,158 l-6,6", sh(c, 35), 2) + C(150, 156, 5, "#c9a227") }; };
  ART["buffalo-robe"] = function (c) {
    var tri = ""; for (var i = 0; i < 4; i++) { tri += Pn("M" + (74 + i * 6) + "," + (300 + i * 30) + " l10,-16 l10,16Z", "#e8d18a") + Pn("M" + (206 - i * 6) + "," + (300 + i * 30) + " l10,-16 l10,16Z", "#b33a2b"); }
    return { cloakBack: cloakBack(c) + tri + L("M72,420 Q150,436 228,420", "#2b5fae", 4),
      cloakFront: capelet(c) + Pn("M118,176 l8,-12 l8,12Z M166,176 l8,-12 l8,12Z", "#e8d18a") + L("M92,182 Q104,192 122,186 M178,186 Q196,192 208,182", "#b33a2b", 3) }; };
  ART["feather-mantle"] = function (c) {
    var sc = ""; for (var r = 0; r < 9; r++) for (var k = 0; k < 2; k++) { var x = k ? 214 - (r % 2) * 4 : 86 + (r % 2) * 4, y = 190 + r * 28; sc += Pn("M" + (x - 9) + "," + y + " Q" + x + "," + (y + 22) + " " + (x + 9) + "," + y + "Z", r % 2 ? sh(c, 25) : sh(c, -15), 'stroke="' + INK + '" stroke-width="1"'); }
    var cf = ""; for (var q = 0; q < 6; q++) { cf += Pn("M" + (100 + q * 20) + ",172 Q" + (108 + q * 20) + ",196 " + (116 + q * 20) + ",172Z", q % 2 ? sh(c, 30) : sh(c, -10), 'stroke="' + INK + '" stroke-width="1"'); }
    return { cloakBack: cloakBack(c) + sc, cloakFront: capelet(c) + cf.replace(/M1[34]\d,172[^Z]*Z/g, "") }; };
  ART["wool-cape"] = function (c) { return { cloakBack: cloakBack(c) + L("M76,300 Q74,370 72,430 M224,300 Q226,370 228,430", sh(c, -50), 2),
    cloakFront: capelet(c) + L("M98,176 Q110,186 122,182 M178,182 Q190,186 202,176", sh(c, 35), 2) + C(150, 156, 5, "#c9a227") + C(150, 156, 2, "#fff6c8") }; };
  ART["hooded-cloak"] = function (c) { return { cloakBack: P("M112,130 Q104,64 150,52 Q196,64 188,130Z", sh(c, -40)) + cloakBack(c),
    cloakFront: capelet(c) + L("M98,176 Q110,186 122,182 M178,182 Q190,186 202,176", sh(c, 40), 2) + L("M146,152 Q142,176 138,200 M154,152 Q158,176 162,200", "#f3e6c8", 2.5) + C(150, 154, 4, "#f3e6c8") }; };
  ART["blanket-coat"] = function (c) { return { cloakBack: cloakBack(c) + L("M70,404 Q150,420 230,404", "#c0392b", 6) + L("M69,418 Q150,434 231,418", "#1f3f8a", 5),
    cloakFront: capelet(c) + L("M94,180 Q104,190 122,186", "#c0392b", 4) + L("M178,186 Q196,190 206,180", "#c0392b", 4) }; };
  /* BODY overlay (vest/jerkin/waistcoat) */
  ART["jerkin"] = function (c) { return { body:
    P("M112,148 Q128,144 140,150 L150,182 L160,150 Q172,144 188,148 Q196,200 194,292 Q170,300 150,298 Q130,300 106,292 Q104,200 112,148Z", c) +
    L("M150,186 L150,296", sh(c, -50), 2) + L("M144,200 l12,6 M156,200 l-12,6 M144,224 l12,6 M156,224 l-12,6 M144,248 l12,6 M156,248 l-12,6", "#e8d18a", 1.6) +
    L("M114,160 Q110,220 112,286", sh(c, 30), 2) }; };
  ART["waistcoat"] = function (c) { var b = ""; for (var i = 0; i < 6; i++) b += C(152, 194 + i * 16, 2.6, "#e0c060"); return { body:
    P("M114,150 Q128,144 140,150 L150,184 L160,150 Q172,144 186,150 Q194,204 192,276 L150,290 L108,276 Q106,204 114,150Z", c) +
    L("M150,186 L150,288", sh(c, -50), 1.6) + b + L("M120,180 q4,-6 8,0 q4,6 8,0 M164,206 q4,-6 8,0 q4,6 8,0 M120,238 q4,-6 8,0 q4,6 8,0", sh(c, 45), 1.4) +
    P("M118,250 L138,250 L138,258 L118,258Z", sh(c, -25)) }; };
  /* BELT (waist ~ y 246-262) */
  function belt(c) { return P("M108,244 Q150,252 192,244 L193,260 Q150,268 107,260Z", c); }
  ART["wampum-belt"] = function (c) { var w = ""; for (var i = 0; i < 10; i++) w += Pn("M" + (112 + i * 8) + "," + (247 + (i < 5 ? i * .3 : (9 - i) * .3)) + " h6 v11 h-6Z", i % 3 === 1 ? "#f3efe6" : c);
    return { belt: belt(sh(c, -20)) + w + L("M108,244 Q150,252 192,244 M107,260 Q150,268 193,260", INK, 2) + L("M118,262 l-4,22 M124,262 l-1,24", "#f3efe6", 2) }; };
  ART["compass"] = function (c) { return { belt: belt("#6b4226") + P("M142,246 L158,246 L158,262 L142,262Z", "#c9a227") +
    L("M180,262 L182,272", INK, 2) + C(182, 284, 13, c) + C(182, 284, 9, "#f8f1dc") + Pn("M182,276 L185,284 L182,292 L179,284Z", "#c0392b") + C(182, 284, 1.5, INK) }; };
  ART["journal"] = function (c) { return { belt: belt("#5b3a1a") + P("M142,246 L158,246 L158,262 L142,262Z", "#c9a227") +
    P("M168,262 L196,258 L200,300 L172,304Z", c) + L("M172,266 L196,262", "#f3e6c8", 2) + L("M176,280 L194,278 M177,288 L195,286", sh(c, 40), 1.5) + L("M184,252 L186,262", "#3b2414", 3) }; };
  ART["apron"] = function (c, girl) { var hem = girl ? 392 : 352; return { belt:
    P("M116,250 Q150,258 184,250 L194," + hem + " Q150," + (hem + 10) + " 106," + hem + "Z", c) + L("M108,248 Q150,256 192,248", "#c9b28a", 5) +
    P("M132,282 L168,282 L168,318 L132,318Z", "#fffaf0") + '<text x="150" y="297" font-size="10" font-family="Georgia" text-anchor="middle" fill="#7a1f2b">ABC</text><text x="150" y="311" font-size="9" font-family="Georgia" text-anchor="middle" fill="#1f5f3a">1 2 3</text>' +
    L("M134,284 L166,284 L166,316 L134,316Z", "#c0392b", 1, 'stroke-dasharray="2 2"') }; };
  ART["pouch"] = function (c) { return { belt: belt("#6b4226") + P("M142,246 L158,246 L158,262 L142,262Z", "#bfa07a") +
    P("M168,262 Q166,296 184,300 Q200,296 198,262Z", c) + L("M166,266 Q182,274 200,266", sh(c, -40), 2.5) + L("M182,262 L182,252", "#3b2414", 3) }; };
  ART["wampum-purse"] = function (c) { return { belt: belt("#6b4226") +
    P("M166,262 L200,262 L196,302 L170,302Z", c) + Pn("M172,272 h22 v6 h-22Z M172,286 h22 v6 h-22Z", "#f3efe6") + L("M174,262 L180,252 M192,262 L186,252", "#3b2414", 2.5) }; };
  /* NECK */
  ART["shell-necklace"] = function (c) { var s = ""; for (var i = 0; i <= 10; i++) { var t = i / 10, x = (1 - t) * (1 - t) * 126 + 2 * (1 - t) * t * 150 + t * t * 174, y = (1 - t) * (1 - t) * 146 + 2 * (1 - t) * t * 196 + t * t * 146; s += E(x, y, 4, 5, i % 2 ? c : "#e0cfa8", 'stroke-width="1.2"'); }
    return { neck: L("M126,146 Q150,196 174,146", "#5b3a1a", 1.5) + s }; };
  ART["turquoise"] = function (c) { return { neck: L("M128,146 Q150,188 172,146", "#3b2414", 2) + P("M150,176 Q160,186 150,204 Q140,186 150,176Z", c) + L("M147,184 l3,4", "#ffffff", 1.5) + C(150, 174, 3, "#c0c0c0") }; };
  ART["gorget"] = function (c) { return { neck: L("M128,146 Q150,174 172,146", "#3b2414", 2) + C(150, 184, 16, c) + C(150, 184, 9, "none", 'stroke="#8a7550" stroke-width="1.4"') + L("M141,184 L159,184 M150,175 L150,193", "#8a7550", 1.4) + C(150, 184, 2.5, "#8a7550") }; };
  ART["collar"] = function (c) { return { neck: P("M118,140 Q150,152 182,140 L202,168 Q172,184 150,172 Q128,184 98,168Z", c) + L("M150,152 L150,172", "#c8c8c8", 1.5) + L("M126,150 Q118,160 112,168 M174,150 Q182,160 188,168", "#d8d8d8", 1.3) }; };
  ART["bead-necklace"] = function (c) { var s = ""; for (var i = 0; i <= 12; i++) { var t = i / 12, x = (1 - t) * (1 - t) * 128 + 2 * (1 - t) * t * 150 + t * t * 172, y = (1 - t) * (1 - t) * 146 + 2 * (1 - t) * t * 190 + t * t * 146; s += C(x, y, 3.4, ["#2b5fae", "#e8452c", "#f3efe6", "#2ec4b6"][i % 4], 'stroke-width="1"'); } return { neck: s }; };
  /* BACK (+ strap across chest) */
  function strap(c) { return P("M178,142 L190,146 L122,268 L110,262Z", c); }
  ART["basket"] = function (c) { var w = ""; for (var i = 0; i < 6; i++) w += L("M" + (172 + i * 7) + ",106 L" + (176 + i * 6) + ",196", sh(c, -40), 1.4); for (var j = 0; j < 6; j++) w += L("M170," + (114 + j * 14) + " Q192," + (118 + j * 14) + " 214," + (114 + j * 14), sh(c, -30), 1.4);
    return { back: P("M166,100 L218,100 L210,198 L174,198Z", c) + w + E(192, 100, 26, 6, sh(c, 20)) + L("M178,98 Q192,72 206,98", "#7a3b1e", 2) + '<circle cx="186" cy="90" r="5" fill="#c0392b"/><circle cx="196" cy="88" r="5" fill="#7a2b8a"/>',
      strap: L("M130,146 Q124,178 122,214 M170,146 Q176,178 178,214", "#7a5a2a", 5) }; };
  ART["paddle"] = function (c) { return { back: L("M214,86 L92,420", sh(c, -30), 9) + L("M214,86 L92,420", c, 6) + P("M204,74 L228,82 L224,92 L200,84Z", c) + P("M100,392 Q70,410 74,446 Q90,456 104,430 Q112,404 100,392Z", c) + L("M86,410 L96,436", sh(c, 40), 2),
    strap: strap("#6b4226") }; };
  ART["quiver"] = function (c) { return { back: L("M204,94 L212,64 M212,98 L224,70 M196,96 L198,66", "#6b4a2b", 3) +
      P("M206,60 l10,-10 l2,14Z M218,66 l12,-8 l-2,14Z M194,62 l6,-12 l4,14Z", "#e8e0d0") + P("M190,92 L220,104 L150,262 L126,250Z", c) + L("M196,108 L214,116 M150,236 L134,228", "#e8d18a", 3),
    strap: strap(sh(c, -30)) }; };
  ART["map-tube"] = function (c) { return { back: P("M196,74 L222,86 L142,280 L120,270Z", c) + P("M194,66 L226,80 L222,90 L190,76Z", sh(c, -30)) + P("M200,62 Q210,52 222,62 L216,74 L204,70Z", "#efe0b0") + L("M180,130 L202,140 M160,180 L182,190", sh(c, -40), 2),
    strap: strap("#5b3a1a") }; };
  ART["satchel"] = function (c) { return { strap: strap(sh(c, -25)) + P("M86,258 Q86,250 96,250 L138,250 Q146,250 146,258 L144,304 Q116,312 88,304Z", c) +
      P("M86,256 Q116,246 146,256 L144,282 Q116,290 88,282Z", sh(c, -18)) + C(116, 282, 4, "#c9a227") + L("M100,300 Q106,290 112,300", "#efe0b0", 2) }; };
  ART["kite"] = function (c) { return { back: P("M210,40 L238,88 L210,150 L182,88Z", c) + L("M210,40 L210,150 M182,88 L238,88", "#f3e6c8", 2) + L("M210,150 Q230,180 214,210 Q200,236 222,260", "#f3e6c8", 2) +
      P("M218,182 l8,-4 l-2,8Z M208,224 l8,-2 l-4,8Z", "#2b5fae") + L("M226,262 L230,274", "#8a8a8a", 2) + P("M228,272 L236,272 L236,288 L228,288Z", "#c9a227"),
    strap: strap("#6b4a2b") }; };
  /* RIGHT HAND (image left, hand ~90,312) */
  ART["spear"] = function (c) { return { handR: L("M86,476 L94,96", "#5a3a1c", 8) + L("M86,476 L94,96", "#8a5a32", 5) + L("M90,300 l2,-10 M89,322 l2,-10", "#c9a227", 3) +
      P("M94,30 Q108,62 98,98 L90,98 Q80,62 94,30Z", c) + Pn("M94,44 L97,90 L92,90Z", sh(c, -40)) + L("M88,96 L100,104 M88,104 L100,96", "#3b2414", 2) }; };
  ART["hoe"] = function (c) { return { handR: L("M84,470 L96,160", "#5a3a1c", 8) + L("M84,470 L96,160", "#a07040", 5) + P("M60,458 L96,452 L98,472 L64,478Z", c) + L("M84,466 L84,456", INK, 4) }; };
  ART["axe"] = function (c) { return { handR: L("M92,298 L80,420", "#5a3a1c", 8) + L("M92,298 L80,420", "#a07040", 5) + P("M84,400 L56,394 Q48,412 56,432 L84,424Z", c) + L("M58,398 Q52,412 58,428", "#e0e0e0", 2) }; };
  ART["spyglass"] = function (c) { return { handR: P("M82,262 L100,262 L98,300 L84,300Z", "#3b2414") + P("M80,300 L102,300 L100,352 L82,352Z", c) + P("M78,352 L104,352 L102,386 L80,386Z", sh(c, 20)) +
      L("M80,312 L102,312 M80,340 L102,340 M79,370 L103,370", "#e0c060", 3) + E(91, 386, 11, 3, "#9fd8ff") }; };
  ART["sounding-lead"] = function (c) { var coil = ""; for (var i = 0; i < 4; i++) coil += '<ellipse cx="90" cy="' + (300 + i * 3) + '" rx="' + (15 - i) + '" ry="8" fill="none" stroke="#a88f5a" stroke-width="3"/>';
    return { handR: coil + L("M88,312 Q84,360 92,404", "#c9b07a", 2.4) + L("M86,330 l8,0 M87,352 l8,0 M88,374 l8,0", "#b3261e", 2.2) + P("M84,404 L100,404 L98,446 Q92,452 86,446Z", c) + L("M88,410 L88,440", "#9aa0a8", 1.5) }; };
  ART["candle"] = function (c) { return { handR: '<circle cx="90" cy="226" r="26" fill="#ffe9a0" opacity=".35"/>' + P("M82,234 L98,234 L98,300 L82,300Z", c) + L("M86,240 L86,296", "#fff6c8", 2) +
      P("M90,206 Q100,222 90,232 Q80,222 90,206Z", "#ffb703") + Pn("M90,216 Q94,224 90,230 Q86,224 90,216Z", "#fff2a8") + E(90, 300, 18, 5, "#c9a227") }; };
  ART["bow"] = function (c) { return { handR: L("M72,180 Q120,312 72,444", "#5a3a1c", 7) + L("M72,180 Q120,312 72,444", c, 4) + L("M72,180 L72,444", "#f3e6c8", 1.2) }; };
  /* LEFT HAND (image right, hand ~210,312) */
  ART["astrolabe"] = function (c) { return { handL: L("M210,316 L212,332", "#5b3a1a", 2) + C(212, 336, 4, "none", 'stroke="' + c + '" stroke-width="3"') + C(212, 362, 24, c) + C(212, 362, 17, sh(c, -30)) +
      L("M212,345 L212,379 M195,362 L229,362", c, 2) + L("M196,376 L228,348", "#3b2414", 3) + C(212, 362, 3, "#3b2414") }; };
  ART["quadrant"] = function (c) { return { handL: P("M206,300 L206,372 Q240,368 248,330Z", c) + L("M206,300 L246,332", sh(c, -40), 1.5) + L("M206,300 L232,376", "#3b2414", 1.2) + C(232, 378, 3, "#555") + L("M212,360 Q236,354 242,334", sh(c, -50), 1.4, 'stroke-dasharray="2 3"') }; };
  ART["lantern"] = function (c) { return { handL: '<circle cx="212" cy="360" r="34" fill="#ffd166" opacity=".35"/>' + L("M212,316 L212,326", INK, 2.5) + P("M200,326 L224,326 L220,336 L204,336Z", "#3b3b3b") +
      P("M198,336 L226,336 L228,378 L196,378Z", c) + L("M212,336 L212,378 M198,357 L226,357", "#3b3b3b", 2) + P("M194,378 L230,378 L226,388 L198,388Z", "#3b3b3b") + Pn("M212,346 Q218,356 212,366 Q206,356 212,346Z", "#fff6c8") }; };
  ART["charter"] = function (c) { return { handL: P("M226,240 Q236,262 222,300 Q216,292 220,276 Q210,262 226,240Z", "#f3efe6") + L("M226,244 L214,318", "#8a7550", 1.6) +
      P("M188,306 L234,300 L236,326 L190,332Z", c) + E(189, 319, 5, 13, sh(c, -20)) + E(235, 313, 5, 13, sh(c, -20)) + C(212, 330, 5, "#b33a2b") }; };
  ART["almanack"] = function (c) { return { handL: P("M194,286 L232,282 L236,338 L198,342Z", c) + L("M198,290 L230,287", "#e0c060", 2) + '<text x="215" y="312" font-size="8" font-family="Georgia" text-anchor="middle" fill="#f3e6c8" transform="rotate(-5 215 312)">POOR</text><text x="216" y="322" font-size="8" font-family="Georgia" text-anchor="middle" fill="#f3e6c8" transform="rotate(-5 216 322)">RICHARD</text>' + L("M236,286 L240,340", "#efe4cf", 3) }; };
  ART["hornbook"] = function (c) { return { handL: P("M198,300 L226,300 L226,348 L198,348Z", c) + P("M207,348 L217,348 L216,370 L208,370Z", c) + P("M202,304 L222,304 L222,344 L202,344Z", "#f8f1dc") + '<text x="212" y="318" font-size="8" text-anchor="middle" font-family="Georgia">ABC</text><text x="212" y="330" font-size="7" text-anchor="middle" font-family="Georgia">abc</text>' }; };
  /* FEET */
  function shoes(fill, extra) { return P("M120,470 Q116,488 132,492 L154,490 Q156,478 148,468Z", fill) + P("M180,470 Q184,488 168,492 L146,490 Q144,478 152,468Z", fill) + (extra || ""); }
  ART["moccasins"] = function (c) { return { feet: shoes(c, L("M126,478 Q136,472 146,478 M174,478 Q164,472 154,478", "#2b5fae", 2.5) + C(136, 474, 1.8, "#e8452c") + C(164, 474, 1.8, "#e8452c")) }; };
  ART["clogs"] = function (c) { return { feet: P("M116,468 Q108,492 128,496 L156,492 Q160,476 150,466Z", c) + P("M184,468 Q192,492 172,496 L144,492 Q140,476 150,466Z", c) + L("M124,476 Q136,470 148,476 M176,476 Q164,470 152,476", sh(c, -40), 1.6) }; };
  ART["latchet-shoes"] = function (c) { return { feet: shoes(c, L("M130,470 L142,474 M170,470 L158,474", "#8a6a3a", 3)) }; };
  ART["buckle-shoes"] = function (c) { return { feet: shoes(c, P("M130,470 L144,470 L144,478 L130,478Z", "#d8d8d8") + P("M156,470 L170,470 L170,478 L156,478Z", "#d8d8d8")) }; };

  /* ---------- body ---------- */
  var uid = 0;
  function render(o) {
    o = o || {}; var U = "h" + (++uid);
    var girl = o.gender !== "boy";
    var tunic = o.tunic || "#a68a64", tD = sh(tunic, -32), tL = sh(tunic, 28);
    var skin = o.skin || "#f0c49c", skinD = sh(skin, -26), hair = o.hair || (girl ? "#7a3e1d" : "#4e2c14"), hairD = sh(hair, -22);
    var eq = o.equip || {}, lay = { cloakBack: "", back: "", feet: "", body: "", belt: "", neck: "", strap: "", cloakFront: "", head: "", handR: "", handL: "" };
    Object.keys(eq).forEach(function (slot) { var it = eq[slot]; if (!it || !ART[it.art]) return; var r = ART[it.art](it.color || "#888888", girl); Object.keys(r).forEach(function (k) { lay[k] += r[k]; }); });
    var hasHat = !!lay.head, s = [];
    s.push('<svg viewBox="0 0 300 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your hero">');
    s.push('<defs><radialGradient id="' + U + 'sk" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="' + sh(skin, 14) + '"/><stop offset="1" stop-color="' + skinD + '"/></radialGradient>' +
      '<linearGradient id="' + U + 'tu" x1="0" x2="1"><stop offset="0" stop-color="' + tL + '"/><stop offset=".55" stop-color="' + tunic + '"/><stop offset="1" stop-color="' + tD + '"/></linearGradient></defs>');
    s.push('<ellipse cx="150" cy="494" rx="78" ry="12" fill="rgba(0,0,0,.28)"/>');
    s.push(lay.cloakBack, lay.back);
    if (girl) s.push(P("M112,80 Q100,150 104,236 Q150,250 196,236 Q200,150 188,80Z", hairD));
    /* legs + default shoes */
    var legC = girl ? "#7a5c46" : "#5a4632";
    s.push(P("M124,300 L148,300 L147,472 L128,472Z", legC), P("M152,300 L176,300 L172,472 L153,472Z", sh(legC, -14)));
    if (!girl) s.push(P("M120,300 L150,300 L149,392 L124,392Z", "#4a3a5a"), P("M150,300 L180,300 L176,392 L151,392Z", "#3c2f4a"), L("M126,388 L148,388 M152,388 L174,388", "#c9a227", 2.5));
    s.push(lay.feet || P("M120,470 Q116,488 132,492 L154,490 Q156,478 148,468Z", "#5b3a1a") + P("M180,470 Q184,488 168,492 L146,490 Q144,478 152,468Z", "#4a2f15"));
    /* neck */
    s.push(P("M139,116 L139,148 L161,148 L161,116Z", skinD));
    /* torso: tunic (boy) or dress (girl) */
    if (girl) {
      s.push(P("M108,146 Q150,136 192,146 Q204,156 200,176 L188,246 Q206,320 214,408 Q150,424 86,408 Q94,320 112,246 L100,176 Q96,156 108,146Z", "url(#" + U + "tu)"));
      s.push(L("M112,252 Q150,262 188,252", tD, 2), L("M122,280 Q114,350 108,404 M150,268 L150,414 M178,280 Q186,350 192,404", tD, 1.6, 'opacity=".7"'));
      s.push(P("M126,146 Q150,174 174,146 Q160,142 150,154 Q140,142 126,146Z", "#f6efe0"));
    } else {
      s.push(P("M108,146 Q150,136 192,146 Q204,156 200,176 L190,250 Q200,290 204,334 Q150,346 96,334 Q100,290 110,250 L100,176 Q96,156 108,146Z", "url(#" + U + "tu)"));
      s.push(L("M150,160 L150,214", tD, 2), P("M126,146 Q150,176 174,146 Q160,142 150,156 Q140,142 126,146Z", "#f6efe0"), L("M144,170 L156,178 M144,184 L156,192 M156,170 L144,178 M156,184 L144,192", "#8a6a3a", 1.4));
    }
    s.push(lay.body);
    s.push(lay.belt || P("M110,244 Q150,252 190,244 L191,258 Q150,266 109,258Z", "#6b4a2b") + L("M150,262 Q146,280 142,292 M150,262 Q156,282 160,290", "#6b4a2b", 3));
    s.push(lay.strap);
    /* arms (sleeves + hands) */
    function arm(m) {
      var X = m ? M : function (x) { return x; };
      return P("M" + X(110) + ",150 Q" + X(92) + ",156 " + X(88) + ",186 L" + X(80) + ",296 L" + X(100) + ",298 L" + X(108) + ",204 Q" + X(114) + ",182 " + X(118) + ",170Z", m ? "url(#" + U + "tu)" : tL) +
        P("M" + X(79) + ",290 L" + X(101) + ",292 L" + X(100) + ",302 L" + X(79) + ",300Z", "#f6efe0");
    }
    s.push(arm(false), arm(true));
    s.push(lay.handR, lay.handL);
    function hand(m) { var X = m ? M : function (x) { return x; };
      return P("M" + X(80) + ",300 Q" + X(78) + ",318 " + X(86) + ",326 Q" + X(96) + ",330 " + X(101) + ",320 L" + X(100) + ",302Z", "url(#" + U + "sk)") + L("M" + X(84) + ",312 Q" + X(90) + ",316 " + X(98) + ",312", skinD, 1.4); }
    s.push(hand(false), hand(true));
    s.push(lay.cloakFront);
    s.push(lay.neck);
    /* head */
    s.push(E(115, 92, 7, 11, skin), E(185, 92, 7, 11, skin));
    s.push(P("M116,84 C116,56 132,44 150,44 C168,44 184,56 184,84 C184,110 170,128 150,128 C130,128 116,110 116,84Z", "url(#" + U + "sk)"));
    /* eyes */
    [[136, 1], [164, -1]].forEach(function (e) {
      var x = e[0];
      s.push('<ellipse cx="' + x + '" cy="91" rx="7" ry="5" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>',
        '<circle cx="' + x + '" cy="91.5" r="3.8" fill="' + (girl ? "#3d6e3a" : "#4a3420") + '"/><circle cx="' + x + '" cy="91.5" r="1.8" fill="#111"/><circle cx="' + (x - 1.2) + '" cy="90" r="1.1" fill="#fff"/>',
        L("M" + (x - 8) + ",88 Q" + x + ",84 " + (x + 8) + ",88", INK, 1.6));
      s.push(L("M" + (x - 8) + "," + (girl ? 81 : 80) + " Q" + x + "," + (girl ? 76 : 77) + " " + (x + 8) + "," + (girl ? 80 : 81), hairD, girl ? 2.2 : 3));
      if (girl) s.push(L("M" + (x + 6 * e[1] * -1) + ",87 l" + (-3 * e[1]) + ",-2", INK, 1.2));
    });
    s.push(L("M150,94 Q147,104 146,108 Q150,111 155,108", skinD, 2));
    s.push('<ellipse cx="128" cy="106" rx="6" ry="3.5" fill="#f08a8a" opacity=".45"/><ellipse cx="172" cy="106" rx="6" ry="3.5" fill="#f08a8a" opacity=".45"/>');
    s.push(P("M139,114 Q150,123 161,114 Q150,118 139,114Z", "#b5483a", 'stroke-width="1.4"'));
    /* hair front */
    if (girl) {
      s.push(P("M114,90 Q108,46 150,40 Q192,46 186,90 Q182,70 172,62 Q156,72 132,64 Q120,72 114,90Z", hair));
      s.push(P("M114,88 Q110,120 116,150 Q106,170 112,196 Q122,170 122,148 Q124,118 120,94Z", hair), P("M186,88 Q194,116 190,146 Q200,176 192,208 Q180,214 180,196 Q186,172 178,148 Q180,118 180,94Z", hair));
      s.push(L("M182,196 Q186,190 190,196", "#c0392b", 4));
      s.push(L("M130,52 Q150,46 170,54", sh(hair, 30), 2.5));
    } else {
      s.push(P("M114,90 Q106,44 150,38 Q194,44 186,90 Q184,72 176,64 Q168,70 156,64 Q146,72 134,64 Q122,72 114,90Z", hair));
      s.push(L("M128,50 Q150,42 172,50", sh(hair, 30), 2.5));
    }
    s.push(lay.head);
    s.push("</svg>");
    return s.join("");
  }
  window.HeroArt = { render: render, arts: Object.keys(ART) };
})();
