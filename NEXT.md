# NEXT: resume notes for American Beginnings RPG

- **Last pushed (live):** 4152477, v2.5.1 (ships and the crossing wording).
- **Local, not pushed:** the v2.6 Level 4 "Three Empires" WIP commits, plus the robustness items adopted from the Princess Prep suggestions.

## Open items, in order
1. **Heavy QC, only under /workspace/shared/qc.lock and only 1–3 AM or 3:15–7 AM ET.**
   - World test: the s4 camera check and the new phone HUD pass.
   - Smoke test.
   - Check the v26-* shots.
   - Level 4 FPS check.
2. Push v2.6, then run `tests/live-md5.sh` and live3.js (0 page errors).
3. Graphics pass 1 (Levels 1–4): v26-gfx-* shots before and after.
4. Graphics pass 2 (every element) plus graphics-lessons.md: v27-gfx2-* shots. **Report to John before Level 5.**
5. Level 5 Jamestown and Plymouth (v2.7), then Level 6 Colonial growth (v2.8).

## Rules
- No new save fields. The save key is americanBeginningsRPG_v1; the world key americanBeginningsRPG_world holds read/seen/at only.
- Copy from the shared graphics kit only; never modify it or other bots' folders.
- Never force-push.
