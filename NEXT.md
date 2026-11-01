# NEXT: resume notes for American Beginnings RPG

- **Live:** v2.6.1 graphics pass 1 (scenery on Levels 1–4), on top of v2.6 Level 4 "Three Empires" (97b8346, live-verified Nov 1 ~1 AM ET:
  every shipped file matches live, marker v2.6, Level 3 hull fix and "about five weeks from the Canaries" wording live).
- Before/after shots: /workspace/abrpg-report/v26-gfx-before-*.png, v26-gfx-after-*.png, v26-gfx-compare-*.jpg.

## Open items, in order
1. Graphics pass 2 (every element, v2.6.2): world/polish.js (ring light, label fade, light grade, motes, QC freeze),
   sails sewn from cloths, 2D panel finish (paper grain), floating joystick, clear-transients. Shots v27-gfx2-*.
   Write graphics-lessons.md. **Report to John before Level 5.**
2. Level 5 Jamestown and Plymouth (v2.7), then Level 6 Colonial growth (v2.8).
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
