# American Beginnings: A Unit 1 History Quest 🦣⛵🕯️

A low-poly, Zelda-style learning RPG for a 7th grader. It follows McGraw Hill *United States History: Voices and Perspectives*, **Unit 1**: the First Americans through the English colonies (up to 1754, before the French and Indian War).

**Play:** https://eleveneff.github.io/american-beginnings-rpg/ (works on desktop and tablet; no install or login)

## How it plays
1. **World map.** Six lands unlock in order, then the **Grand Trial** (end-of-unit quiz).
2. **Choose a hero** for each land: girl or boy, then a period name (or type your own). The hero lives in that era.
3. **Scene and lesson scrolls.** Each land opens with a short story scene, then lesson scrolls. Each scroll has a video slot: Section 1 has two real generated clips, and the other scrolls show a labeled "Video coming soon" placeholder.
4. **Trial.** All of the land's questions come in random order, exam-style: multiple choice, vocabulary, fill in the blank, and short answer. Every answer shows a short explanation.
5. **Gear.** Every **5 correct answers** in a land earns new gear that appears on the hero (cloak, spear, basket, necklace, hats, and more). Mastering a land earns a **badge**, and the hero's tunic changes color.
6. **Mastery rule.** Every missed question goes into a **review queue**. For each miss she re-reads the matching scroll and answers again until the queue is empty. The next land unlocks only when the **first-try trial score is at least 80% AND every miss has been cleared**. If she scores under 80%, she clears the review and then retakes the trial. Her gear is kept.
7. **Grand Trial.** This unlocks after all six lands. It has 24 questions (4 random ones per land). Scoring 80% or better earns the golden Crown.

## Parent Report 📋
Tap **📋 Parent** (top right) to see:
- overall accuracy
- each section's status, trial attempts, the history of first-try scores, and best score
- per-topic right and missed counts
- flagged weak areas, and questions missed more than once
- gear and badges earned, with timestamps

**Copy report to clipboard** gives you plain text to paste into a message. **Reset all progress** asks you to confirm twice.

Progress is saved in the browser's localStorage under the key `americanBeginningsRPG_v1`, so it stays on the device and browser being used. Clearing site data or switching devices starts fresh.

## Content
| Section | Questions | Lessons |
|---|---|---|
| 1. First Peoples of the Americas | 27 | 7 (2 with video) |
| 2. Native Nations of North America | 18 | 6 |
| 3. The Age of Exploration & Columbian Exchange | 20 | 5 |
| 4. Spain, France, and the Netherlands | 19 | 5 |
| 5. Jamestown and Plymouth | 19 | 5 |
| 6. The Thirteen Colonies Grow | 26 | 6 |

**Answer checking for typed answers:**
- Capital letters, punctuation, accents, and a leading "the/a/an" are ignored.
- Several accepted variants are listed per question (for example "Quakers", "Quaker", "Society of Friends").
- One small typo (one letter wrong, added, missing, or swapped) is forgiven for answers of 6 or more letters.
- Multiple-choice answers are shuffled every time.

## Editing or adding content
Content lives in `content/` (one file per section, plain JavaScript objects). The header comment in `content/00-header.js` explains the format. To add a video, drop an `.mp4` in `videos/` and set `video: "videos/name.mp4"` on a lesson. Each placeholder's `videoIdea` text describes the clip to make.

## Tech
Plain static HTML/CSS/JS with no build step. The 3D low-poly background uses Three.js from a CDN; if it can't load, a gradient sky is shown and the game still works. The hero is a low-poly SVG that changes as gear is earned. Version marker: bottom-right corner (`v1.0`). Test: `tests/smoke-test.js`.
