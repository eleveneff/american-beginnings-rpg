# NEXT: resume notes for American Beginnings RPG

- **Live:** v2.7, Level 5 "Jamestown and Plymouth" (Roanoke 1587, James Fort 1607, tobacco fields and Powhatan town,
  the 1619 General Assembly, Cape Cod and the Mayflower Compact 1620, Plymouth, the Wampanoag homesite, the Trial).
  QC Nov 1, 4:35–5:00 AM ET: world test ALL WORLD TESTS PASSED (279 ok), smoke ALL PASSED, live md5 OK (38 files), live3 0 page errors.
  fps over 3 runs (median avg, spread): s1 25.9 (22.6–26.4), s2 19.8 (18.3–20.3), s3 20.7 (20.1–22.3), s4 26.5 (25.1–26.9),
  s5 23.0 (22.2–25.3). Worst spot: s2/fire, median 9.4. The first view on each level always reads about 10, which is load or warm-up.
- Shots: /workspace/abrpg-report/v27-shot-*.png (roanoke, jamesfort, jamesfort-ships, plymouth, wampanoag, mayflower) and v27-s5-*.png (fps views).
- Lessons: /workspace/shared/abrpg-lessons/lessons-learned.md (Level 5 section), fps-tips-ocean-islands.md (for Princess Prep).

## Open items, in order
1. Level 6 "The Thirteen Colonies to 1754" (v2.8): worktree /workspace/abrpg-l6 (branch level6, served on :8785).
   Main has been merged in (0494ca0). Not pushed yet. Sketch: /workspace/abrpg-design/sketches/s6-thirteen-colonies-level-map.jpg.
   Steps: world test (log /tmp/abperf/v28-world.log, shots /tmp/wshots6/v28-*.png), review the shots, smoke,
   fps with LEVELS=s1,...,s6 RUNS=3, then merge into main, push, live check.
   Layout checker: /tmp/abperf/l6chk (chk.mjs, cam.mjs).
2. Princess Prep review items not done yet: a `?debug=nogate,nocost` URL flag, plant sway, animal gait.
   Already met: labels the player acts on never fade (only overhead boards fade; ring icons, mat labels and the press-E prompt stay solid).
   fpsall now reports the median and spread of 3 runs, a worst-spot row and the load average (RUNS=3).
3. Still deferred: the interior clear-line camera yaw.

## How to run heavy QC (only 1–3 AM or 3:15–7 AM ET unless John says otherwise; Princess Prep tests from 7 AM)
- `bash /tmp/abperf/myrun.sh <label> bash -c 'cd <repo> && node tests/world-test.js' > log 2>&1 &`
  (myrun owns /workspace/shared/qc.lock for the run and refuses in the quiet windows; use absolute paths, and always log).
- One test at a time: world-test, then smoke-test, then fpsall (`LEVELS=s1,...,s5 RUNS=3 TAG=... SHOTS=... node /tmp/abperf/fpsall.js`).
- Never edit served files while a test runs (tests/serve.py serves the working tree).
- After push: `bash tests/live-md5.sh`, then `node /tmp/abperf/live3.js` (0 page errors).
- `git pull --rebase --autostash` straightens a local merge commit into a line of commits. That is fine (nothing pushed is rewritten).

## Rules
- No new save fields. The save key is americanBeginningsRPG_v1; the world key americanBeginningsRPG_world holds read/seen/at only.
- Copy from the shared graphics kit only; never modify it or other bots' folders.
- Never force-push.
