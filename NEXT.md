# NEXT: resume notes for American Beginnings RPG

- **v3.0, Level 7 "The French and Indian War" (Nov 1 night, John: "start with chapters 7 and 8 only"):** Unit 2 begins (unit: 2;
  the Grand Trial still covers Levels 1-6). content/s7.js (7 narrative scrolls + 2 source scrolls: Washington's journal 1754 and
  "Join, or Die" 1754; 36 exam-style questions; s7-geomap map + s7-timeline + s7-sides sort + s7-washington dialogue + s7-mission;
  Join-or-Die Badge, butternut dye), content/s7-geo.js, content/s7-videos.js (7 fact-tour placeholders, videoKey s7-<topic>; the
  tour runs until assets/video/<key>.mp4 lands; briefs for the video job: /workspace/abrpg-videos/l7/briefs.md), content/market-s7.js
  (m6 Trading Post at Wills Creek, v2.9 tabs, every item 20+ stars with a teaching card), world/frontier.js (frontier farm, Wills
  Creek, Fort Necessity at Great Meadows, the Forks of the Ohio, Albany 1754, Plains of Abraham/Levis at Quebec; story jumps, no time
  travel), tools/gen_map_s7.py. No new save fields (W.seen keys + read/at for s7 whitelisted only).
  QC Nov 1, 9:45-11:00 PM ET on :8807: tests/s7-test.js ALL S7 TESTS PASSED, smoke ALL PASSED, market ALL PASSED (cards at 440 px
  and 375 px), keys PASSED (s1-s7), camera PASSED (108 runs, 0 page errors), world-test: every check passes except the camera-inside
  checks that already fail on main (Beringia gate cross-pole + s2/s4/s5/s6 ring views; owned by the camera job, not touched).
  fps s7 over 3 runs: median 26.6 (24.4-28.4); worst spot s7/farm 10.3 (the first view = warm-up, like s1/camp). Shots:
  /workspace/abrpg-report/v30-*.png. Mini-games are NOT in Level 7: the framework is only on the unmerged minigames branch.
  Simplifications: the L7 map shrinks distances (Virginia to Quebec in one walk) and joins places by story order.
  smoke-test now counts activities and video slots from the content (was a fixed 31 / 12) and reads a short tour's caption early.
- **Live:** v2.8, Level 6 "The Thirteen Colonies to 1754" (Charles Town rice and indigo, Williamsburg's Capitol, a 1740 field
  meeting, Penn's Philadelphia and Franklin, a village lane, Boston's town meeting and Long Wharf, the Albany Congress 1754 Trial).
  QC Nov 1, 5:25–6:10 AM ET on :8785: world test ALL WORLD TESTS PASSED (twice, the 2nd after the Philadelphia shot fix), smoke ALL PASSED,
  fps over 3 runs (median avg, spread): s1 24.4 (24.4–26.7), s2 21.2 (19.4–21.2), s3 21.4 (20.5–23.0), s4 27.8 (22.2–28.3),
  s5 24.4 (23.8–24.4), s6 28.8 (23.8–29.0); worst spot s1/camp, median 9.3 (first view of a level = warm-up); 0 page errors.
  Merged (186c405, a --no-ff merge) and pushed 6:15 AM ET; live md5 LIVE OK (39 files), live3 0 page errors, the live site reports v2.8.
- **Ship fixes in v2.8 (live in v2.7 before):** shipGeo now takes `opts.flag` — 'spain' (Cross of Burgundy, s3 Columbus only),
  'england' (St George's cross: Roanoke, James Fort ships, Mayflower), 'britain' (1707 Union flag: Thirteen Colonies).
  The James Fort ships are spaced in mid-river (JSHIPS in colonies.js), the Roanoke caravel moved to RSHIP (-48,-43), ships at
  anchor are furled (James ships, Mayflower, Boston), and scattered trees are kept off the river banks in front of the ships.
  Checked every level: only s3, s5 and s6 use shipGeo; s4 uses its own flags (Spain, France, Netherlands); s3 keeps Spain's flag (correct).
- **Flag check, 6:20 AM ET (v2.8.x, content only):** a reported "red saltire" on the Level 6 Union flags was checked at full zoom
  (/workspace/abrpg-report/v28-flag-zoom-charleston.png, -albany.png): the 3D flags (unionFlagGeo in thirteen.js, shipGeo 'britain'
  in voyage.js) are already the 1707 Queen Anne design with no red diagonals. No 🇬🇧 emoji or flag images anywhere. Fixed one text line:
  s6 videoIdea "English flags" → "the British Union flag of 1707". Smoke ALL PASSED; world test skipped (text only, too close to 7 AM).
- Shots: /workspace/abrpg-report/v28-shot-*.png (charleston, williamsburg, revival, philadelphia, village, boston, albany, hero, phone,
  jamesfort-ships-fixed, mayflower-fixed, roanoke) and v28-s*-*.png (fps views). v27 shots are still there for comparison.
- Lessons: /workspace/shared/abrpg-lessons/lessons-learned.md (Level 5 and Level 6 sections, incl. ship flags), copied to /workspace/abrpg-design/.
- **v2.8.1 (Nov 1 evening, John):** controls are W forward, Z back, A left, S right, camera-relative on all 6 levels (arrows +
  joystick kept; D no longer moves; no hotkey used Z, so nothing reassigned; typing in inputs never moves her). tests/keys-test.js.
  Camera near trees/buildings: placeCamera now keeps the eased ideal separate from the pulled-in distance, sphere-casts (pad 0.3)
  with bisection, ignores tree canopies (o.soft), pulls in fast but rate-limited (≤10 m/s, never a one-frame snap), eases out
  slowly after a 0.35 s hold (hysteresis), min distance 1.2 m, look-up scales with distance. tests/camera-test.js (tree/building
  hugging walks on every level): old code 60 in/out reversals, 5–6 m single-frame jumps, 22/90 runs failing; new 8 reversals,
  ≤10.1 m/s extra camera speed, 90/90 ok.
- **v2.9 wardrobe market (Nov 1 evening, John: "clothes and modifications cost stars", "more choices in the market", "hair options"):**
  every look change is bought once with stars (20+), then worn free. Paid now (free before): the 27 section gear items (every 5 correct
  answers now UNLOCKS the item and pays +10 stars; the unlock card offers "Buy it now"), the badge tunic dyes (a badge unlocks its dye,
  30 stars, final gold 40), wardrobe changes to anything not owned. New: Beringia Camp Trade Circle (m0, open from the start; the glacier
  gate card links to it for the Fur Cloak, 20), 4–6 period clothes + 5–8 gear/keepsakes + 1–2 hairstyles per era market (content/market.js,
  each with made/who or fact teaching card), natural hair colors (20, sold everywhere), Clothing/Hair/Gear/Keepsakes tabs, "Need N more"
  + keeper tells where stars are earned, Ask = teaching-card modal, confirm card (Yes/Not now). Her own braids and own hair color are
  always free. Caps/coifs/hoods hide hair (2D and 3D). Cahokia market now opens at Section 2 (m0 covers Section 1).
  **Save:** still version-key americanBeginningsRPG_v1, format v4, NO new fields (owned/equip/purchases reused). Migration v3→v4:
  everything owned stays owned; each earned badge's dye is granted and the latest worn; no charge or refund.
  Tests: tests/market-test.js (new, ALL PASSED: locks, tabs, cards ≤440px desktop + phone, can't afford, back out, idempotent, hair,
  unlock Buy-now, migration), smoke ALL PASSED, keys-test PASSED. world-test: all non-camera checks pass; the camera-inside-object
  checks fail on 5a0c04c too (owned by the camera job, not touched here). Shots: /workspace/abrpg-report/v29-wardrobe-*.png.
- **v2.9.1 → shipped as v3.0.1 with Level 7 (brass compass on L7 too) (Nov 1 evening, John: "a compass of some sort" on each level; "the River Ford is a little difficult and confusing"):**
  Compass HUD in the banner on all 6 levels (L1-2 carved guide stone, L3-4 brass, L5-6 wood): camera-relative needle to the next
  objective, objective name + distance, faint footprint trail toward it; help line added to the "How to" cards. River ford (L1): goal
  banner that never fades, timeline strip (older -> newer, done rows show dates), the row to step on glows, wider stones (r 0.68,
  offset 1.05), a wrong step returns her to the last right stone (not the bank), hint label after 2 misses, answer after 3 (fewer
  stars; the miss is charged to that row's event). faceCam snaps the camera (fixes the s4 "camera inside a building" world-test views);
  placeCamera tests only occluders near the camera segment (s3/s4 fps). No new save fields. Tests: tests/compass-test.js,
  tests/ford-test.js. Shots: /workspace/abrpg-report/v291-compass-*.png, v291-ford-{before,after}-*.png.

## Open items, in order
1. Level 7 shipped in v3.0; Level 8 (Road to Revolution) is v3.1. Levels 9-12 follow /workspace/abrpg-design/chapters-7-12-plan.md. L7/L8 Grok Imagine videos wait for the video job (briefs in /workspace/abrpg-videos/l7, l8).
2. Williamsburg's Capitol reads as two plain red blocks with no windows; give it windows and the cupola a clearer shape.
3. Princess Prep review items not done yet: a `?debug=nogate,nocost` URL flag, plant sway, animal gait.
   Already met: labels the player acts on never fade; fpsall reports the median and spread of 3 runs, a worst-spot row and the load average.
4. Still deferred: the interior clear-line camera yaw.
5. The /workspace/abrpg-l6 worktree (branch level6) is merged; it can be reused or removed for Level 7.

## How to run heavy QC (only 1–3 AM or 3:15–7 AM ET unless John says otherwise; Princess Prep tests from 7 AM)
- `bash /tmp/abperf/myrun.sh <label> bash -c 'cd <repo> && node tests/world-test.js' > log 2>&1 &`
  (myrun owns /workspace/shared/qc.lock for the run and refuses in the quiet windows; it does not wait for a foreign lock, so check first;
  use absolute paths, and always log).
- One test at a time: world-test, then smoke-test, then fpsall (`LEVELS=s1,...,s6 RUNS=3 TAG=... SHOTS=... node /tmp/abperf/fpsall.js`).
- Camera/layout emulator before any 3D test: /tmp/abperf/l6chk (cam.mjs for rings, chk.mjs for s6 layout, pspot.mjs for shot spots).
- Never edit served files while a test runs (tests/serve.py serves the working tree).
- After push: `bash tests/live-md5.sh`, then `node /tmp/abperf/live3.js` (0 page errors).
- Merging: use `git pull --no-rebase` (a merge) when local main contains a merge commit, so its history stays as it is. Never rebase it.

## Rules
- No new save fields. The save key is americanBeginningsRPG_v1; the world key americanBeginningsRPG_world holds read/seen/at only.
- Copy from the shared graphics kit only; never modify it or other bots' folders.
- Never force-push.

## Teaching videos: the 27 scrolls with no clip (John, Nov 1: "Make all 27 missing videos, one per scroll")
Live-action (Grok Imagine), fact cards, Piper en_GB-aru-medium speaker 3 narration, ambience beds. Pipeline: /workspace/abrpg-audio
(scripts.json, hints.json, takes3.py with /home/box/piper-venv/bin/python, cards.py, build.py <key>); work files /workspace/abrpg-videos/l<N>/
(stills, takes, review, frames, research-brief.md, script.md, manifest.md, accuracy-log.md). Wire each scroll with videoKey + videoTitle (s5 style).
- [x] L1 s1 (4): paleo → s1-paleo-indians, meso → s1-olmec-maya-aztec, inca → s1-inca-empire, mounds → s1-mound-builders
- [x] L2 s2 (6): regions → s2-culture-regions, northwest → s2-pacific-northwest, plains → s2-great-plains, southwest → s2-southwest, iroquois → s2-iroquois, southeast → s2-southeast (s1-mound-builders Cahokia shot redone: no smoke from the post)
- Tonight's order (John): L2 videos, then L7/L8 build (other job), then L3 videos, then L7 videos.
- [ ] L3 s3 (5): motives, navigation, columbus, afterColumbus, exchange
- [ ] L4 s4 (5): conquest, spanishNA, spanishLife, france, dutch
- [ ] L5 s5 (1): roanoke
- [ ] L6 s6 (6): newengland, middle, southern, government, dailylife, ideas
- After the last level: run world-test.js once; add a lessons-learned note for Princess Prep.
