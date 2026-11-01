# NEXT: resume notes for American Beginnings RPG

- **Live:** v2.6.2 graphics pass 2 (every element on Levels 1–4: light grade + rim light per era, ring glow, label fade,
  motes, sewn sails, 2D paper grain, market stage vignette/shadow, floating joystick, clear-transients).
  QC Nov 1 ~3:20–3:44 AM ET: world test ALL PASSED, smoke ALL PASSED, fps equal or better than v2.6.1 (0 page errors).
- Shots: /workspace/abrpg-report/v27-gfx2-before-*.png, v27-gfx2-after-*.png, v27-gfx2-compare-*.jpg.
- Lessons: /workspace/shared/abrpg-lessons/graphics-lessons.md. Not done in pass 2: animal gait polish, plant sway.

## Open items, in order
1. Level 5 Jamestown and Plymouth (v2.7): built in worktree /workspace/abrpg-l5 (branch level5, merged with main).
   Sketch: /workspace/abrpg-design/sketches/s5-jamestown-plymouth-level-map.jpg. Next: serve worktree on :8775, run its world test, fix, merge, push.
2. Level 6 Colonial growth to 1754 (v2.8).
3. Still deferred: the interior clear-line camera yaw.

## How to run heavy QC (only 1–3 AM or 3:15–7 AM ET unless John says otherwise)
- `bash /tmp/abperf/myrun.sh <label> node tests/world-test.js` (owns /workspace/shared/qc.lock for the run; refuses in quiet windows).
- One test at a time: world-test, then smoke-test, then fpsall (`LEVELS=s1,s2,s3,s4 TAG=... SHOTS=... node /tmp/abperf/fpsall.js`).
- Never edit served files while a test runs (tests/serve.py serves the working tree).
- After push: `bash tests/live-md5.sh`, then `node /tmp/abperf/live3.js` (0 page errors).

## Rules
- No new save fields. The save key is americanBeginningsRPG_v1; the world key americanBeginningsRPG_world holds read/seen/at only.
- Copy from the shared graphics kit only; never modify it or other bots' folders.
- Never force-push.
