# NEXT: resume notes for American Beginnings RPG

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

## Open items, in order
1. Level 7 (next era) — not started. Copy the Level 6 flow: sketch → layout checker (/tmp/abperf/l6chk) → world test → smoke → fps → merge.
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
