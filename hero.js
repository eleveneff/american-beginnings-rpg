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

  /* ===== v2.9 contemporaneous wardrobe (each fitted to the same body coordinates) ===== */
  /* HEAD: caps that COVER the hair (the hair is then drawn as a thin fringe only) */
  var COVER = { "fox-hood": 1, "toca": 1, "dutch-cap": 1, "coif": 1, "mob-cap": 1 };
  ART["fox-hood"] = function (c) { var tuft = ""; for (var i = 0; i < 14; i++) { var a = Math.PI * (0.05 + i / 13 * 0.9), x = 150 - Math.cos(a) * 52, y = 92 - Math.sin(a) * 60; tuft += L("M" + x.toFixed(1) + "," + y.toFixed(1) + " l" + (-Math.cos(a) * 7).toFixed(1) + "," + (-Math.sin(a) * 7).toFixed(1), sh(c, -30), 2); }
    return { head: '<path d="M98,100 Q92,28 150,22 Q208,28 202,100 Q206,142 180,152 Q150,162 120,152 Q94,142 98,100Z M120,86 C120,60 134,52 150,52 C166,52 180,60 180,86 C180,110 168,126 150,126 C132,126 120,110 120,86Z" fill="' + c + '" fill-rule="evenodd" stroke="' + INK + '" stroke-width="2.2"/>' +
      tuft + L("M122,88 C122,64 134,56 150,56 C166,56 178,64 178,88", sh(c, -45), 2) + P("M112,40 L104,12 L128,30Z", c) + P("M188,40 L196,12 L172,30Z", c) + Pn("M112,36 L108,20 L120,30Z M188,36 L192,20 L180,30Z", "#d8a0a0") }; };
  ART["toca"] = function (c) { return { head: P("M206,92 Q214,150 202,196 Q196,200 190,192 Q198,150 188,100Z", sh(c, -12)) +
      P("M112,96 Q104,38 150,32 Q196,38 190,96 Q186,104 180,100 Q180,62 150,58 Q120,62 120,100 Q116,104 112,96Z", c) +
      L("M120,48 Q150,38 182,50 M114,70 Q150,56 188,72", sh(c, -30), 1.6) + L("M118,90 Q150,78 182,90", sh(c, -40), 1.4, 'stroke-dasharray="3 3"') }; };
  ART["dutch-cap"] = function (c) { return { head: P("M110,104 Q102,40 150,34 Q198,40 190,104 L180,108 Q182,66 150,62 Q118,66 120,108Z", c) +
      L("M116,58 Q150,46 184,58", sh(c, -30), 1.6) + P("M112,98 L122,98 L124,118 L112,116Z M188,98 L178,98 L176,118 L188,116Z", sh(c, -8)) + C(118, 100, 2.6, "#c9a227") + C(182, 100, 2.6, "#c9a227") }; };
  ART["coif"] = function (c) { return { head: P("M112,100 Q104,42 150,36 Q196,42 188,100 L180,102 Q182,66 150,62 Q118,66 120,102Z", c) +
      L("M150,38 L150,62", sh(c, -30), 1.4) + L("M116,100 Q122,128 146,134 M184,100 Q178,128 154,134", "#e8e0d0", 2.2) + Pn("M144,132 l6,6 l6,-6 l-6,-3Z", "#e8e0d0") }; };
  ART["mob-cap"] = function (c) { var fr = "M104,86"; for (var i = 0; i <= 12; i++) { var a = Math.PI * (1 - i / 12), x = 150 + Math.cos(a) * 48, y = 84 - Math.sin(a) * 50; fr += " Q" + (150 + Math.cos(a + .13) * 56).toFixed(1) + "," + (84 - Math.sin(a + .13) * 58).toFixed(1) + " " + x.toFixed(1) + "," + y.toFixed(1); }
    return { head: P("M108,86 Q100,18 150,14 Q200,18 192,86 Q170,64 150,64 Q130,64 108,86Z", c) + L(fr, sh(c, -25), 2) + P("M112,72 Q150,56 188,72 L188,78 Q150,62 112,78Z", "#c0392b") + Pn("M118,40 Q150,28 182,40", "none", 'stroke="' + sh(c, -30) + '" stroke-width="1.4"') }; };
  /* HEAD: hats worn over the hair */
  ART["basket-hat"] = function (c) { var z = "M114,58"; for (var i = 1; i <= 12; i++) z += " L" + (114 + i * 6) + "," + (i % 2 ? 50 : 58); var r = ""; for (var j = 0; j < 7; j++) r += L("M" + (120 + j * 10) + ",70 L" + (126 + j * 8) + ",28", sh(c, -30), 1.2);
    return { head: P("M106,74 Q150,62 194,74 L174,26 Q150,18 126,26Z", c) + r + L(z, "#3b2414", 3) + L("M110,68 Q150,58 190,68", "#7a2b1e", 2.5) + E(150, 24, 24, 5, sh(c, -15)) }; };
  ART["straw-hat"] = function (c) { var r = ""; for (var i = 0; i < 6; i++) r += '<ellipse cx="150" cy="64" rx="' + (30 + i * 6) + '" ry="' + (6 + i * 1.2) + '" fill="none" stroke="' + sh(c, -30) + '" stroke-width="1"/>';
    return { head: E(150, 64, 64, 14, c) + r + P("M122,64 L126,30 Q150,22 174,30 L178,64 Q150,70 122,64Z", c) + P("M123,54 Q150,60 177,54 L178,62 Q150,68 122,62Z", "#3b2414") }; };
  ART["bergere"] = function (c) { var r = ""; for (var i = 0; i < 5; i++) r += '<ellipse cx="150" cy="56" rx="' + (34 + i * 7) + '" ry="' + (6 + i * 1.3) + '" fill="none" stroke="' + sh(c, -28) + '" stroke-width="1"/>';
    return { head: '<g transform="rotate(-6 150 56)">' + E(150, 56, 72, 13, c) + r + E(150, 50, 28, 9, sh(c, 10)) + P("M122,52 Q150,60 178,52 L178,58 Q150,66 122,58Z", "#2b5fae") + "</g>" +
      L("M108,70 Q112,110 132,128 M192,62 Q190,110 168,128", "#2b5fae", 3) + P("M140,126 Q150,120 160,126 Q150,134 140,126Z", "#2b5fae") }; };
  /* CLOAKS (v2.9) */
  ART["cedar-cape"] = function (c) { var fr = "", w = ""; for (var i = 0; i < 20; i++) fr += L("M" + (86 + i * 6.6) + "," + (214 + Math.sin(i / 19 * Math.PI) * 10) + " l" + (i % 2 ? 1 : -1) + ",16", sh(c, -30), 2);
    for (var j = 0; j < 4; j++) w += L("M" + (94 + j * 2) + "," + (166 + j * 12) + " Q150," + (150 + j * 14) + " " + (206 - j * 2) + "," + (166 + j * 12), sh(c, -25), 1.4);
    return { cloakFront: P("M108,142 Q150,128 192,142 Q214,156 218,214 Q150,236 82,214 Q86,156 108,142Z", c) + w + fr + P("M126,146 Q150,166 174,146 Q162,138 150,146 Q138,138 126,146Z", sh(c, -20)) }; };
  ART["huik"] = function (c) { return { cloakBack: P("M150,4 Q160,10 156,24 Q204,32 206,100 Q214,170 222,240 L232,446 Q150,464 68,446 L78,240 Q86,170 94,100 Q96,32 144,24 Q140,10 150,4Z", c) + L("M100,110 Q92,250 80,440 M200,110 Q208,250 220,440", sh(c, 30), 1.6),
    cloakFront: P("M104,150 Q96,240 94,330 L108,330 Q110,240 118,156Z M196,150 Q204,240 206,330 L192,330 Q190,240 182,156Z", c) }; };
  /* DRESSES: drawn in place of the tunic. d = {color, top, skirt} */
  var DRESS = {};
  function bodice(top) { return P("M108,146 Q150,136 192,146 Q204,156 200,176 L190,252 Q150,262 110,252 L100,176 Q96,156 108,146Z", top); }
  function skirtP(col, hem) { var w = 86 - (hem - 408) * 0.18; return P("M112,244 Q" + (w + 8) + "," + (244 + (hem - 244) * .5) + " " + w.toFixed(1) + "," + hem + " Q150," + (hem + 14) + " " + (300 - w).toFixed(1) + "," + hem + " Q" + (292 - w) + "," + (244 + (hem - 244) * .5) + " 188,244Z", col); }
  function folds(col, hem) { return L("M124,276 Q116,350 108," + (hem - 6) + " M150,266 L150," + (hem + 6) + " M176,276 Q184,350 192," + (hem - 6), col, 1.5, 'opacity=".7"'); }
  DRESS["parka"] = function (d) { var c = d.color, hem = 380, z = "M92," + hem; for (var i = 1; i <= 16; i++) z += " L" + (92 + i * 7.25) + "," + (hem + (i % 2 ? 9 : 2)); var fr = ""; for (var j = 0; j < 14; j++) fr += L("M" + (98 + j * 8) + "," + (hem + 6) + " l" + (j % 2 ? 1 : -1) + ",16", sh(c, -30), 2);
    return skirtP(c, hem) + fr + L(z, "#efe8dc", 7) + bodice(c) + folds(sh(c, -30), hem) + P("M118,146 Q150,170 182,146 Q176,132 150,130 Q124,132 118,146Z", "#efe8dc") + L("M112,250 Q150,260 188,250", sh(c, -40), 3) + L("M150,170 L150,240", sh(c, -40), 1.6, 'stroke-dasharray="4 4"'); };
  DRESS["manta"] = function (d) { var c = d.color, hem = 404;
    return skirtP(c, hem) + L("M90," + (hem - 14) + " Q150," + hem + " 210," + (hem - 14), "#2a2a2a", 7) + L("M92," + (hem - 24) + " Q150," + (hem - 10) + " 208," + (hem - 24), "#b3261e", 3) +
      P("M100,176 Q96,156 108,146 L130,142 L196,190 L190,252 Q150,262 110,252Z", c) + P("M168,140 Q192,142 200,160 Q200,176 196,190 L130,142 Q150,136 168,140Z", sh(c, -12)) + L("M132,146 L196,192", sh(c, -40), 2) +
      P("M110,240 Q150,250 190,240 L190,258 Q150,268 110,258Z", "#b3261e") + Pn("M118,246 h8 v8 h-8Z M136,248 h8 v8 h-8Z M154,248 h8 v8 h-8Z M172,246 h8 v8 h-8Z", "#1f6f5a") + L("M180,258 l2,30 M186,258 l4,28", "#b3261e", 3) + folds(sh(c, -25), hem); };
  DRESS["quill-dress"] = function (d) { var c = d.color, hem = 400, fr = ""; for (var j = 0; j < 18; j++) fr += L("M" + (90 + j * 7) + "," + (hem + 4) + " l" + (j % 2 ? 1 : -1) + ",20", sh(c, -35), 2);
    var q = ""; for (var i = 0; i < 10; i++) q += Pn("M" + (116 + i * 7) + ",168 h5 v12 h-5Z", ["#b3261e", "#f3efe6", "#1f3f8a", "#e8b923"][i % 4]);
    return skirtP(c, hem) + fr + bodice(c) + P("M110,164 Q150,176 190,164 L190,184 Q150,196 110,184Z", sh(c, -18)) + q + L("M126,146 Q150,160 174,146", sh(c, -40), 2) + folds(sh(c, -30), hem) + L("M100,176 l-10,8 M200,176 l10,8", sh(c, -35), 2); };
  DRESS["saya"] = function (d) { var c = d.color, hem = 440;
    return skirtP(c, hem) + L("M86," + (hem - 22) + " Q150," + (hem - 6) + " 214," + (hem - 22), "#1a1a1a", 7) + L("M90," + (hem - 44) + " Q150," + (hem - 28) + " 210," + (hem - 44), "#1a1a1a", 5) +
      bodice(sh(c, -10)) + P("M136,150 L164,150 L156,246 L144,246Z", "#1a1a1a") + C(150, 172, 2.4, "#d9b44a") + C(150, 196, 2.4, "#d9b44a") + C(150, 220, 2.4, "#d9b44a") + P("M124,146 Q150,160 176,146 Q164,140 150,148 Q136,140 124,146Z", "#f6efe0") + folds(sh(c, -35), hem); };
  DRESS["jak"] = function (d) { var c = d.color, t = d.top || sh(c, -20), hem = 440;
    return skirtP(c, hem) + folds(sh(c, -30), hem) + bodice(t) + P("M110,246 Q150,256 190,246 L198,280 Q150,290 102,280Z", t) + L("M150,152 L150,280", sh(t, -40), 2) + L("M110,248 Q150,258 190,248", sh(t, -40), 1.6) +
      P("M126,146 Q150,168 174,146 Q160,142 150,152 Q140,142 126,146Z", "#f6efe0") + C(150, 176, 2.2, "#d9b44a") + C(150, 200, 2.2, "#d9b44a") + C(150, 224, 2.2, "#d9b44a"); };
  DRESS["waistcoat-dress"] = function (d) { var c = d.color, t = d.top || sh(c, 20), hem = 436, b = ""; for (var i = 0; i < 5; i++) b += C(150, 168 + i * 16, 2.2, "#3b2414");
    return skirtP(c, hem) + folds(sh(c, -30), hem) + bodice(t) + P("M110,246 Q150,256 190,246 L194,268 Q150,278 106,268Z", t) + L("M150,154 L150,270", sh(t, -40), 1.6) + b + P("M126,146 Q150,166 174,146 Q160,142 150,152 Q140,142 126,146Z", "#f6efe0"); };
  DRESS["gown"] = function (d) { var t = d.top || d.color, k = d.skirt || "#8a2b3a", hem = 440, qz = "";
    for (var i = 0; i < 6; i++) qz += L("M" + (126 + i * 10) + ",262 L" + (110 + i * 16) + "," + (hem - 4), sh(k, 30), 1, 'opacity=".8"') + L("M" + (174 - i * 10) + ",262 L" + (190 - i * 16) + "," + (hem - 4), sh(k, 30), 1, 'opacity=".8"');
    return skirtP(t, hem) + P("M132,250 Q122,340 112," + (hem + 4) + " L188," + (hem + 4) + " Q178,340 168,250Z", k) + qz + folds(sh(t, -30), hem).replace("M150,266 L150," + (hem + 6), "") + bodice(t) +
      P("M134,150 L166,150 L154,252 L146,252Z", "#e8d18a") + L("M138,168 L162,168 M140,188 L160,188 M142,208 L158,208 M144,228 L156,228", "#b3261e", 1.8) + P("M122,146 Q150,162 178,146 Q164,140 150,150 Q136,140 122,146Z", "#fbf8f0"); };
  /* v3.0: frontier short gown: a loose jacket to the hips over a wool petticoat */
  DRESS["short-gown"] = function (d) { var t = d.top || d.color, k = d.skirt || "#3a4a6a", hem = 440;
    return skirtP(k, hem) + folds(sh(k, -30), hem) + bodice(t) + P("M110,246 Q150,258 190,246 L198,302 Q150,314 102,302Z", t) + L("M150,154 L150,306", sh(t, -40), 1.6) + L("M106,280 Q150,292 194,280", sh(t, -25), 1.2, 'opacity=".6"') + P("M122,146 Q150,162 178,146 Q164,140 150,150 Q136,140 122,146Z", "#fbf8f0"); };
  DRESS["plain-gown"] = function (d) { var c = d.color, hem = 438;
    return skirtP(c, hem) + folds(sh(c, -25), hem) + bodice(c) + L("M150,156 L150,250", sh(c, -30), 1.4) + P("M114,146 Q150,138 186,146 L196,170 Q150,202 104,170Z", "#fbf8f0") + L("M150,160 L150,190", "#e0d8c8", 1.4); };
  /* NECK */
  function strand(n, depth, bead) { var s = ""; for (var i = 0; i <= n; i++) { var t = i / n, x = (1 - t) * (1 - t) * 128 + 2 * (1 - t) * t * 150 + t * t * 172, y = (1 - t) * (1 - t) * 146 + 2 * (1 - t) * t * depth + t * t * 146; s += bead(x, y, i); } return s; }
  ART["ivory-beads"] = function (c) { return { neck: L("M128,146 Q150,192 172,146", "#5b3a1a", 1.4) + strand(9, 192, function (x, y) { return E(x, y, 3.2, 5.5, c, 'stroke-width="1.1"'); }) }; };
  ART["coral-beads"] = function (c) { return { neck: strand(12, 178, function (x, y) { return C(x, y, 3.2, c, 'stroke-width="1"'); }) + strand(10, 196, function (x, y, i) { return C(x, y, 2.6, i % 3 ? c : "#d9b44a", 'stroke-width="1"'); }) }; };
  ART["kerchief"] = function (c) { return { neck: P("M106,148 Q150,140 194,148 L198,166 Q174,196 150,214 Q126,196 102,166Z", c) + L("M112,156 Q150,186 188,156", sh(c, -20), 1.4) + L("M150,190 L150,212", sh(c, -25), 1.4) }; };
  /* BELT */
  ART["sash"] = function (c) { return { belt: P("M108,240 Q150,250 192,240 L194,264 Q150,274 106,264Z", c) + L("M110,248 Q150,258 190,248", sh(c, -30), 1.4) + P("M172,262 L180,262 L176,318 L166,316Z M182,262 L190,262 L192,312 L182,314Z", c) + L("M168,316 l2,8 M174,318 l0,8 M184,314 l0,8 M190,312 l2,8", sh(c, -30), 1.6) }; };
  ART["girdle"] = function (c) { return { belt: L("M108,248 Q150,258 192,248", c, 5) + L("M150,256 Q148,300 146,330", c, 3) + P("M134,330 Q132,356 146,360 Q160,356 158,330Z", "#7a1f2b") + L("M134,332 Q146,338 158,332", "#d9b44a", 2) + C(146, 324, 3, "#d9b44a") }; };
  ART["chatelaine"] = function (c) { return { belt: belt("#3b2414") + P("M168,244 L186,244 L184,262 L170,262Z", c) +
      L("M172,262 L166,330 M177,262 L178,340 M182,262 L192,322", sh(c, -40), 1.6) + P("M162,330 L170,330 L172,348 L160,348Z", c) + C(178, 346, 5, "none", 'stroke="' + c + '" stroke-width="2.4"') + L("M178,351 L178,364 l4,0", c, 2.4) + E(192, 326, 5, 6, "#b3261e") }; };
  ART["tie-pocket"] = function (c) { return { belt: L("M108,248 Q150,256 192,248", "#e8e0d0", 3) + P("M162,252 Q156,266 158,300 Q162,322 178,322 Q194,322 196,300 Q198,266 192,252Z", c) +
      L("M177,262 L177,300", "#5b3a1a", 2.4) + L("M168,282 q4,-6 8,0 M180,296 q4,-6 8,0 M168,306 q4,-6 8,0", "#2b6f3a", 1.6) + C(170, 290, 2, "#b3261e") + C(186, 280, 2, "#b3261e") }; };
  ART["plain-apron"] = function (c, girl) { var hem = girl ? 404 : 352; return { belt: P("M116,250 Q150,258 184,250 L192," + hem + " Q150," + (hem + 8) + " 108," + hem + "Z", c) + L("M108,248 Q150,256 192,248", sh(c, -25), 4) + L("M132,262 L128," + (hem - 6) + " M168,262 L172," + (hem - 6), sh(c, -18), 1.2, 'opacity=".7"') + L("M190,250 l6,22 M192,250 l12,18", sh(c, -25), 3) }; };
  /* FEET */
  ART["fur-boots"] = function (c) { return { feet: P("M122,410 L150,410 L152,470 Q156,480 150,492 L124,492 Q114,488 120,470Z", c) + P("M178,410 L150,410 L148,470 Q144,480 150,492 L176,492 Q186,488 180,470Z", sh(c, -12)) +
      L("M120,412 L152,412 M148,412 L180,412", "#efe8dc", 8) + L("M126,440 l4,6 M140,450 l4,6 M160,440 l4,6 M172,452 l4,6", sh(c, 30), 1.6) }; };
  ART["sandals"] = function (c) { return { feet: P("M122,474 Q116,486 128,490 L152,490 Q156,480 148,472Z", "#e8b890") + P("M178,474 Q184,486 172,490 L148,490 Q144,480 152,472Z", "#dcac84") +
      P("M114,488 L156,488 L156,496 L114,496Z", c) + P("M186,488 L144,488 L144,496 L186,496Z", c) + L("M124,478 L146,486 M146,476 L126,488 M176,478 L154,486 M154,476 L174,488", sh(c, -50), 2.4) }; };
  ART["chapines"] = function (c) { return { feet: P("M118,488 L156,488 L154,506 L120,506Z", "#c8a27a") + P("M182,488 L144,488 L146,506 L180,506Z", "#b8926a") + shoes(c, L("M126,478 Q136,472 146,478 M174,478 Q164,472 154,478", "#d9b44a", 2)) }; };
  ART["pattens"] = function (c) { return { feet: shoes("#3a2a1e") + P("M116,488 L158,488 L158,494 L116,494Z", c) + P("M184,488 L142,488 L142,494 L184,494Z", c) + E(136, 502, 12, 6, "none", 'stroke="#6a6a6a" stroke-width="3"') + E(164, 502, 12, 6, "none", 'stroke="#6a6a6a" stroke-width="3"') + L("M126,494 l4,6 M146,494 l-4,6 M154,494 l4,6 M174,494 l-4,6", "#6a6a6a", 2.4) }; };
  /* HAND */
  ART["atlatl"] = function (c) { return { handR: L("M70,250 L104,382", "#5a3a1c", 7) + L("M70,250 L104,382", c, 4) + P("M66,242 L76,240 L74,256Z", sh(c, -30)) + L("M64,236 L118,450", "#a07040", 3) + P("M60,214 L68,212 L66,240 L60,240Z", "#3a3a40") + L("M114,440 l-8,14 M118,440 l2,16 M116,440 l8,12", "#c0392b", 2) }; };
  ART["chert-hoe"] = function (c) { return { handR: L("M84,470 L96,160", "#5a3a1c", 8) + L("M84,470 L96,160", "#a07040", 5) + P("M58,452 Q76,444 92,450 L94,470 Q76,474 62,472Z", c) + L("M84,452 L90,470 M90,452 L82,470", "#c8a060", 2.4) }; };
  /* HAIR STYLES (girl). Each returns {back, front}; braids default is drawn by render. */
  var HAIR = {};
  function frontTop(h) { return P("M114,90 Q108,46 150,40 Q192,46 186,90 Q182,70 172,62 Q156,72 132,64 Q120,72 114,90Z", h); }
  function frontPart(h) { return P("M114,96 Q106,48 150,40 Q194,48 186,96 Q182,66 152,50 L150,44 L148,50 Q118,66 114,96Z", h) + L("M150,44 L150,50", sh(h, -30), 1.4); }
  function shortBack(h) { return P("M112,80 Q106,126 124,132 L176,132 Q194,126 188,80Z", sh(h, -22)); }
  HAIR["loose"] = function (h) { return { back: P("M108,80 Q92,160 98,250 Q150,264 202,250 Q208,160 192,80Z", sh(h, -22)),
    front: frontPart(h) + P("M114,92 Q104,140 108,190 Q100,214 110,236 Q124,214 124,186 Q126,140 122,98Z", h) + P("M186,92 Q196,140 192,190 Q200,214 190,236 Q176,214 176,186 Q174,140 178,98Z", h) + L("M112,150 Q108,190 112,220 M188,150 Q192,190 188,220", sh(h, -30), 1.4) }; };
  HAIR["one-braid"] = function (h) { var b = ""; for (var i = 0; i < 7; i++) b += E(188 - i * .6, 112 + i * 18, 9 - i * .4, 11, h, 'stroke-width="1.6"');
    return { back: shortBack(h), front: frontPart(h) + b + L("M180,232 Q186,226 192,232", "#a8452c", 4) + P("M182,234 Q186,252 180,262 Q190,256 192,236Z", h) }; };
  HAIR["tranzado"] = function (h) { var w = ""; for (var i = 0; i < 9; i++) w += L("M" + (205 + i * 1.6) + "," + (122 + i * 20) + " l14,9", "#b8a888", 1.6);
    return { back: shortBack(h) + P("M184,94 Q212,170 216,304 L232,304 Q228,170 200,90Z", "#f6f1e6") + w + P("M216,304 L232,304 L228,326 L220,326Z", h), front: frontPart(h) }; };
  HAIR["bun"] = function (h, hat) { return { back: shortBack(h) + (hat ? "" : E(170, 40, 19, 15, sh(h, -10)) + L("M156,40 Q170,30 186,42", sh(h, 25), 1.6)), front: frontTop(h) + L("M130,52 Q150,46 170,54", sh(h, 30), 2.5) }; };
  HAIR["pinned"] = function (h, hat) { return { back: shortBack(h) + (hat ? "" : C(150, 30, 13, sh(h, -8)) + L("M140,22 L162,38", "#c9a227", 2)), front: frontPart(h) + L("M120,74 Q130,58 146,52 M180,74 Q170,58 154,52", sh(h, 25), 1.6) }; };
  HAIR["ribbon"] = function (h) { return { back: P("M110,80 Q98,140 106,186 Q150,198 194,186 Q202,140 190,80Z", sh(h, -22)),
    front: frontTop(h) + P("M114,90 Q106,130 112,170 Q122,180 124,160 Q118,130 120,98Z", h) + P("M186,90 Q194,130 188,170 Q178,180 176,160 Q182,130 180,98Z", h) + P("M176,52 L198,38 L196,64Z", "#2b5fae") + P("M176,52 L160,36 L158,62Z", "#2b5fae") + C(176, 52, 4, "#1f4f8e") + L("M178,56 L188,84 M176,56 L172,86", "#2b5fae", 3) }; };
  HAIR["center-part"] = function (h) { return { back: shortBack(h) + P("M140,124 Q150,140 160,124Z", sh(h, -10)), front: frontPart(h) + L("M118,88 Q126,64 148,50 M182,88 Q174,64 152,50", sh(h, 25), 1.6) }; };

  /* ---------- body ---------- */
  var uid = 0;
  function render(o) {
    o = o || {}; var U = "h" + (++uid);
    var girl = o.gender !== "boy";
    var eq = o.equip || {};
    /* v2.9: a bought dress replaces the tunic; a bought dye recolors it; hair style/color are bought too */
    var dress = eq.dress && DRESS[eq.dress.art] ? eq.dress : null;
    var tunic = dress ? (dress.top || dress.color) : (eq.dye && eq.dye.color) || o.tunic || "#a68a64", tD = sh(tunic, -32), tL = sh(tunic, 28);
    var skin = o.skin || "#f0c49c", skinD = sh(skin, -26), hair = (eq.haircolor && eq.haircolor.color) || o.hair || (girl ? "#7a3e1d" : "#4e2c14"), hairD = sh(hair, -22);
    var headArt = eq.head && ART[eq.head.art] ? eq.head.art : "", covered = !!COVER[headArt], hs = eq.hair && HAIR[eq.hair.art] ? HAIR[eq.hair.art](hair, !!headArt || !!(eq.cloak && eq.cloak.art === "huik")) : null;
    var lay = { cloakBack: "", back: "", feet: "", body: "", belt: "", neck: "", strap: "", cloakFront: "", head: "", handR: "", handL: "" };
    Object.keys(eq).forEach(function (slot) { var it = eq[slot]; if (!it || slot === "dress" || slot === "dye" || slot === "hair" || slot === "haircolor" || !ART[it.art]) return; var r = ART[it.art](it.color || "#888888", girl); Object.keys(r).forEach(function (k) { lay[k] += r[k]; }); });
    var hasHat = !!lay.head, s = [];
    s.push('<svg viewBox="0 0 300 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your hero">');
    s.push('<defs><radialGradient id="' + U + 'sk" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="' + sh(skin, 14) + '"/><stop offset="1" stop-color="' + skinD + '"/></radialGradient>' +
      '<linearGradient id="' + U + 'tu" x1="0" x2="1"><stop offset="0" stop-color="' + tL + '"/><stop offset=".55" stop-color="' + tunic + '"/><stop offset="1" stop-color="' + tD + '"/></linearGradient></defs>');
    s.push('<ellipse cx="150" cy="494" rx="78" ry="12" fill="rgba(0,0,0,.28)"/>');
    s.push(lay.cloakBack, lay.back);
    if (girl && !covered) s.push(hs ? hs.back : P("M112,80 Q100,150 104,236 Q150,250 196,236 Q200,150 188,80Z", hairD));
    /* legs + default shoes */
    var legC = girl ? "#7a5c46" : "#5a4632";
    s.push(P("M124,300 L148,300 L147,472 L128,472Z", legC), P("M152,300 L176,300 L172,472 L153,472Z", sh(legC, -14)));
    if (!girl) s.push(P("M120,300 L150,300 L149,392 L124,392Z", "#4a3a5a"), P("M150,300 L180,300 L176,392 L151,392Z", "#3c2f4a"), L("M126,388 L148,388 M152,388 L174,388", "#c9a227", 2.5));
    s.push(lay.feet || P("M120,470 Q116,488 132,492 L154,490 Q156,478 148,468Z", "#5b3a1a") + P("M180,470 Q184,488 168,492 L146,490 Q144,478 152,468Z", "#4a2f15"));
    /* neck */
    s.push(P("M139,116 L139,148 L161,148 L161,116Z", skinD));
    /* torso: tunic (boy) or dress (girl) */
    if (dress) s.push(DRESS[dress.art](dress, girl));
    else if (girl) {
      s.push(P("M108,146 Q150,136 192,146 Q204,156 200,176 L188,246 Q206,320 214,408 Q150,424 86,408 Q94,320 112,246 L100,176 Q96,156 108,146Z", "url(#" + U + "tu)"));
      s.push(L("M112,252 Q150,262 188,252", tD, 2), L("M122,280 Q114,350 108,404 M150,268 L150,414 M178,280 Q186,350 192,404", tD, 1.6, 'opacity=".7"'));
      s.push(P("M126,146 Q150,174 174,146 Q160,142 150,154 Q140,142 126,146Z", "#f6efe0"));
    } else {
      s.push(P("M108,146 Q150,136 192,146 Q204,156 200,176 L190,250 Q200,290 204,334 Q150,346 96,334 Q100,290 110,250 L100,176 Q96,156 108,146Z", "url(#" + U + "tu)"));
      s.push(L("M150,160 L150,214", tD, 2), P("M126,146 Q150,176 174,146 Q160,142 150,156 Q140,142 126,146Z", "#f6efe0"), L("M144,170 L156,178 M144,184 L156,192 M156,170 L144,178 M156,184 L144,192", "#8a6a3a", 1.4));
    }
    s.push(lay.body);
    s.push(lay.belt || (dress ? "" : P("M110,244 Q150,252 190,244 L191,258 Q150,266 109,258Z", "#6b4a2b") + L("M150,262 Q146,280 142,292 M150,262 Q156,282 160,290", "#6b4a2b", 3)));
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
    if (covered) s.push(P("M118,92 Q118,64 150,62 Q182,64 182,92 Q172,76 150,74 Q128,76 118,92Z", hair));
    else if (girl && hs) s.push(hs.front);
    else if (girl) {
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
  window.HeroArt = { render: render, arts: Object.keys(ART).concat(Object.keys(DRESS), Object.keys(HAIR)), dresses: Object.keys(DRESS), hairs: Object.keys(HAIR), covers: Object.keys(COVER) };
})();
