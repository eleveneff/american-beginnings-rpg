Headless Chromium smoke test (puppeteer-core, v2.1). It checks:

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
- the video player on all 8 slots: the eight embedded clips (Beringia, Clovis points, early maize, Jamestown, Founders of Virginia, Virginia struggles, the Mayflower voyage, and New England) start unmuted from the "Play with sound" click, decode their narration track, and show each caption at its `cueTimes`. Each slot shows a lower-third caption, at least 3 Key Facts, a check that stays locked until the end, +5★ per check question answered right, and no stars on a retake (90 video stars in total). The check questions are in the Section 5 trial pool, and the Parent Report lists the videos
- every one of the 31 activities solved (19 classic + 6 geomaps + 6 timelines)
- all 5 markets
- the Grand Trial and its 50-star Crown
- v2.1 primary-source scrolls: source block on the lesson, in-scroll quiz records `srcQ`, a miss is re-asked until cleared
- v2.1 map challenges: wrong drops rejected, labels placed by tap / touch drag / mouse drag (with tolerance), mistakes logged to `skills` and mastery review, Parent Report accuracy
- v2.1 timeline challenges: 5–8 events per section, cumulative Grand Timeline (1492–1754) before the Grand Trial, wrong-gap before/after feedback, tap / touch / mouse, review of misses
- GAME_VERSION / on-page marker is v2.1
- no page errors

Commands:

    python3 tests/serve.py 8765 &          # from the repo root (supports Range requests, so the narrated videos can seek)
    npm i puppeteer-core@22
    BASE=http://localhost:8765/ SHOTS=/tmp/ node tests/smoke-test.js
