Headless Chromium smoke test (puppeteer-core, v2.2; runs in Classic mode). It checks:

- migration of a synthetic v1 save: gear names become fitted items, retro stars are credited, and there is no double credit
- a synthetic v2.0 save (format 2, no `srcQ` / `skills`) upgrades to format 3 with progress, stars, and badges kept
- the star rules for activities: 20 for a first perfect play, 2 per practice replay, a cap of 3 practice bonuses per day, and 14 with 2 mistakes
- a real pointer drag-and-drop
- Section 1 with 2 misses (24-question trial from a 44-question pool): 44 question stars, 4 gear items, the badge plus 30 stars, and the review queue
- the market: a locked tab, the shopkeeper fact, too few stars (no charge), buy and confirm, the item worn, and no double buying
- the Character screen equip and unequip
- the Parent Report (lesson videos, primary-source scrolls, map & timeline challenges, weak areas)
- tablet layout
- persistence after reload
- the 95% pass mark: 23 of 24 passes Section 1; 22 of 24 (91.7%) in Section 2 means review, then retake
- lands passed under the old 80% mark stay passed after loading the save
- the video player on every lesson with a videoKey, including Level 4's five clips, Roanoke, and all six Level 6 scrolls: a real file starts unmuted from the "Play with sound" click, decodes its narration track, and shows each caption at its `cueTimes`. Each slot shows a lower-third caption, at least 3 Key Facts, a check that stays locked until the end, +5★ per check question answered right the first time, and no stars on a retake. Roanoke's check questions join the Section 5 trial pool. The Parent Report lists the videos
- every one of the 31 activities solved (19 classic + 6 geomaps + 6 timelines)
- all 5 markets
- the Grand Trial and its 50-star Crown
- v2.1 primary-source scrolls: source block on the lesson, in-scroll quiz records `srcQ`, a miss is re-asked until cleared
- v2.1 map challenges: wrong drops rejected, labels placed by tap / touch drag / mouse drag (with tolerance), mistakes logged to `skills` and mastery review, Parent Report accuracy
- v2.1 timeline challenges: 5–8 events per section, cumulative Grand Timeline (1492–1754) before the Grand Trial, wrong-gap before/after feedback, tap / touch / mouse, review of misses
- GAME_VERSION and the on-page marker agree and are v2.1 or later
- no page errors

Commands:

    python3 tests/serve.py 8765 &          # from the repo root (supports Range requests, so the narrated videos can seek)
    npm i puppeteer-core@22
    BASE=http://localhost:8765/ SHOTS=/tmp/ node tests/smoke-test.js

## v2.2–v2.4 walkable world test

`tests/world-test.js` checks the Section 1 Beringia level: v2.3 marker, walking (keys), camp-fire collider, caribou tracks, ford respawn, the v2.3 ford timeline puzzle (stones in time order, splash + respawn on a later stone, same stars / mastery review / results as the card timeline, no new save fields), the progress save staying byte-identical after walking, rings opening the existing panels (Scroll 1, Traveler's Journal map), the glacier pass blocked until the Fur Cloak, corridor walls, v2.3 glacier walls (ice faces on the colliders, >9 m tall, corridor floor, meltwater, moving hide flags), objective banner and camera collision / no orbit while strafing, results "Back to Beringia" label, the Trial Cave (locked until all 8 scrolls are read, real 24-question trial, resume after reload, 95% pass + mastery review), Classic toggle and automatic fallback (no WebGL2), v1 / v2 saves and a corrupt world key, Reset clearing the world key. v2.4 adds the Section 2 Native Nations level: entering from the map, stations in their real directions, the hide map facing south, every ring standable and beside a road, palisade wall and gap, the sea shore, camera never blocked at 14 rings, no orbit while strafing, the save byte-identical after walking, rings opening the Section 2 scrolls / activities / market, "Back to the Council Fire" labels, kiva and mound cards (Cahokia wording), the banner naming the nearest unfinished marker, the plaza mat puzzle (wrong mat, hint glow, normal results and stars, no new save fields), the meeting-ground Trial (locked, resume after reload), at.s2 / read.s2 cleaning and restore, and a v1 save. No page errors.

    BASE=http://localhost:8765/ SHOTS=/tmp/wshots/ node tests/world-test.js

Run the two suites one at a time (SwiftShader is slow; the timings assume one suite at once).
