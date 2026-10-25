# American Beginnings: A Unit 1 History Quest 🦣⛵🕯️

A low-poly, Zelda-style learning RPG for a 7th grader. It follows McGraw Hill *United States History: Voices and Perspectives*, **Unit 1**: the First Americans through the English colonies (up to 1754, before the French and Indian War).

**Play:** https://eleveneff.github.io/american-beginnings-rpg/ (works on desktop and tablet; no install or login)

## How it plays
1. **World map.** Six lands unlock in order, then the **Grand Trial** (end-of-unit quiz).
2. **Choose a hero** for each land: girl or boy, then a period name (or type your own). The hero lives in that era.
3. **Scene and lesson scrolls.** Each land opens with a short story scene, then lesson scrolls. Seven scrolls have a **lesson video player** (3 in Section 1, 4 in Section 5). While a clip plays, 4–5 timed **fact captions** appear in a lower third (names, dates, places, cause and effect, why it matters). A **🔑 Key Facts** card sits below the clip. When the clip ends, a 1–2 question **"🎬 What did you see?"** check opens. If a clip file is missing, a **"▶ Play the fact tour"** placeholder runs the same captions, about 4 s each, and then the check. Three verified clips are embedded: Clovis points, Jamestown 1607, and early Virginia's struggles and recovery. The other four slots are placeholders until verified files arrive: Beringia and early maize in Section 1, the Mayflower voyage and New England in Section 5. Captions are timed to play time, at least 4 s each, and a short clip replays until all of its captions have shown. The earlier Section 1 clips were removed after failing accuracy review. Other scrolls show a "video idea" card.
4. **History Activities (v2).** Every land has 3–4 hands-on activities (19 in all): put steps in order (knap a Clovis point, plant a Three Sisters garden, dip candles, run Franklin's press), drag-and-drop sorts and maps (culture regions, the three empires' claims, the 13 colonies, the Columbian Exchange), choose-your-path scenarios (sail a caravel, survive Jamestown, draft the Mayflower Compact clause by clause), and conversations with historical figures (a Maya scribe, a Haudenosaunee clan mother, Pigafetta, Champlain, Tisquantum, Ben Franklin). Cards can be dragged, or tapped and then tapped onto a bin.
5. **Trial.** 24 of the land's questions come in random order (questions never answered right and earlier misses come first), exam-style: multiple choice, vocabulary, fill in the blank, and short answer. Every answer shows a short explanation.
6. **Gear.** Every **5 correct answers** in a land earns new gear that appears on the hero (cloak, spear, basket, necklace, hats, and more). Mastering a land earns a **badge**, and the hero's tunic changes color.
7. **Mastery rule.** Every missed question goes into a **review queue**. For each miss she re-reads the matching scroll and answers again until the queue is empty. The next land unlocks only when the **first-try trial score is at least 80% AND every miss has been cleared**. If she scores under 80%, she clears the review and then retakes the trial. Her gear is kept.
8. **Grand Trial.** This unlocks after all six lands. It has 24 questions (4 random ones per land). Scoring 80% or better earns the golden Crown.

## Stars ⭐ and the Marketplace 🏪
**Earning stars**
- Each question answered correctly for the first time: **+2** (repeats earn nothing, so farming doesn't work).
- Activities, first play: **+20** with no mistakes, **+14** with 1–2 mistakes, **+8** otherwise. A replay that beats the best score earns the difference. Other replays earn a **+2** practice bonus, at most 3 times per activity per day.
- Video check question answered right for the first time: **+5** (a retake earns nothing). The check questions are also in that land's trial pool, so they count toward mastery.
- Badge for mastering a land: **+30**. The Grand Trial Crown: **+50**.

**Spending stars.** Tap **🏪 Market**. There is one market for each era, and each opens when its land does:
- Cahokia trade gathering (about 1100 CE)
- Seville harbor chandlery (about 1500)
- New Amsterdam market (1650s)
- Jamestown storehouse (1610s)
- a Boston shop on King Street (1740s)

Each market has a period shopkeeper who tells the history of every item ("💬 Ask about it"). You can "👀 Try on" an item before buying. Prices run from 20★ (basic) and 35–50★ (mid) up to 75–120★ (premium). Bought clothing and tools appear fitted on the hero, and goods like the chunkey stone or the Primer go in the pack. The balance can never go negative, and an item you can't afford shows how many more stars you need. The **🧍 Character** screen lets you put on or take off any item, slot by slot.

## Parent Report 📋
Tap **📋 Parent** (top right) to see:
- overall accuracy
- each section's status, trial attempts, the history of first-try scores, and best score
- per-topic right and missed counts
- flagged weak areas, and questions missed more than once
- gear and badges earned, with timestamps
- stars: balance, earned, and spent, by source
- every activity: plays, best rating, and stars earned
- lesson videos: views, finishes, best check score, and stars
- marketplace purchases

**Copy report to clipboard** gives you plain text to paste into a message. **Reset all progress** asks you to confirm twice.

Progress is saved in the browser's localStorage under the key `americanBeginningsRPG_v1`, so it stays on the device and browser being used. v2 upgrades a v1 save automatically and keeps all progress: v1 gear is mapped onto the new fitted gear, and stars are credited for earlier work (1 per correct answer, 30 per badge, 50 for the Crown). Clearing site data or switching devices starts fresh.

## Content
| Section | Questions (v1 → v2) | Lessons | Activities |
|---|---|---|---|
| 1. First Peoples of the Americas | 27 → 44 | 7 (3 video players) | 3 |
| 2. Native Nations of North America | 18 → 28 | 6 | 3 |
| 3. The Age of Exploration (incl. Columbian Exchange) | 20 → 35 | 6 | 3 |
| 4. Spain, France, and the Netherlands | 19 → 32 | 6 | 3 |
| 5. Jamestown and Plymouth | 19 → 44 | 7 (4 video players) | 3 |
| 6. The Thirteen Colonies Grow | 26 → 41 | 7 | 4 |
| **Total** | **129 → 224** | 39 | 19 |

Counts include the 14 video-check questions (6 in Section 1, 8 in Section 5). The v2 additions (`content/v2-s*.js`) add people, dates, places, causes and effects, and multiple perspectives. Quotes are real and short (for example, the Mayflower Compact, Columbus's log, and Bradford). The unit stops before the French and Indian War.

The history is written **truth first**: accurate facts and real quotes come first. It highlights the founding ideals of self-government and the rule of law: the House of Burgesses (1619), the Mayflower Compact (1620), town meetings, the Fundamental Orders (1639), and the Body of Liberties (1641). It also shows the courage, perseverance, faith, and ingenuity of explorers and settlers. Native and African perspectives and hardships are told plainly, and there is no modern political overlay. Most of this is in `content/v2b-ideals.js`, including Section 5's new Scroll 7, "Seeds of Self-Government."

**Answer checking for typed answers:**
- Capital letters, punctuation, accents, and a leading "the/a/an" are ignored.
- Several accepted variants are listed per question (for example "Quakers", "Quaker", "Society of Friends").
- One small typo (one letter wrong, added, missing, or swapped) is forgiven for answers of 6 or more letters.
- Multiple-choice answers are shuffled every time.

## Editing or adding content
Content lives in `content/`: one file per section, plus `v2-s*.js` extensions (more lessons, questions, and activities) and `market.js` (markets, shopkeepers, and items). All of these are plain JavaScript objects. The header comment in `content/00-header.js` explains the format. **Lesson videos:** every clip is an entry in `content/videos.js`, with a title, `cues` (3–5 timed lower-third captions), `facts` (the Key Facts card), and `check` (1–2 questions, correct answer first). `videoAttach` (or `videoKey` on a lesson) ties each entry to its scroll. A new video only needs a new entry there, and it gets captions, facts, the check, stars, and report tracking automatically. To embed a clip, put the file at `assets/video/<key>.mp4`; the game picks it up with no code change. The keys are `s1-beringia`, `s1-clovis-points`, `s1-early-maize`, `s5-jamestown-settlers`, `s5-virginia-struggles`, `s5-pilgrim-voyage`, and `s5-new-england`; see `assets/video/README.md`. Each placeholder's `videoIdea` text describes the clip to make.

## Tech
Plain static HTML/CSS/JS with no build step. The 3D low-poly background uses Three.js from a CDN; if it can't load, a gradient sky is shown and the game still works. The hero (`hero.js`) is a layered SVG figure: girl or boy, with every item drawn at full scale and fitted to its body slot (head, cloak, neck, body, back, belt, both hands, feet). `tests/hero-gallery.html` previews gear sets. Version marker: bottom-right corner (`v2.0`). Test: `tests/smoke-test.js`.
