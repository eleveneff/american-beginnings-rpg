/* =====================================================================
   AMERICAN BEGINNINGS — game content (one file per section)
   Aligned to McGraw Hill "United States History: Voices and Perspectives",
   Unit 1 (First Americans through the English Colonies, before the
   French and Indian War).

   HOW TO EDIT / EXTEND
   - Each section file calls GAME_CONTENT.sections.push({...}).
   - Section fields: id, title, era, icon, palette, scene (intro story,
     {name} = player's name), lessons (scrolls), gear (small upgrades),
     badge (big upgrade), questions.
   - Question types:
       mc    : multiple choice. choices[0] MUST be the correct answer
               (choices are shuffled when shown).
       vocab : vocabulary. term + choices (choices[0] = correct definition).
       fill  : fill-in-the-blank. Use ____ in q. accept = accepted answers
               (case-insensitive; punctuation/accents ignored).
       short : very short answer. accept = accepted answers.
   - topic must match a lesson's topic so missed questions send the
     player back to the right lesson scroll.
   - Lesson video: path to an .mp4 in /videos, or null for a labeled
     placeholder (videoIdea describes the clip to generate later).
   ===================================================================== */
/* v2: content/v2-*.js files call GAME_CONTENT.extend(id, {...}) to add lesson
   paragraphs (addText by topic), new lessons, questions, activities, and to
   replace the gear list (each gear has art + slot so it is drawn on the hero).
   Activity types: sequence, sort, map, scenario, dialogue (see content/v2-s1.js). */
window.GAME_CONTENT = {
  title: "American Beginnings",
  subtitle: "A Quest Through Unit 1: First Americans to the English Colonies",
  girlNames: ["Eleanor", "Abigail", "Hope", "Mercy", "Prudence", "Aurora"],
  boyNames: ["Nathaniel", "Josiah", "Isaac", "Benjamin", "Drake"],
  passPercent: 80,
  correctPerGear: 5,
  trialSize: 24,            /* v2: questions per trial (missed/unseen served first) */
  stars: { perQuestion: 2, badge: 30, crown: 50, actPerfect: 20, actGood: 14, actDone: 8, practice: 2, practicePerDay: 3 },
  sections: [],
  final: {
    title: "The Grand Trial: End-of-Unit Quiz",
    icon: "🏆",
    questionsPerSection: 4,
    badge: { name: "Crown of American Beginnings", icon: "👑", tunic: "#d4a017", desc: "Passed the Grand Trial! Your tunic shines royal gold." },
    scene: [
      "All the paths you have walked meet at last on a high green hill. Below you spread the glaciers, the longhouses, the tall ships, the stone forts, the log walls of Jamestown, and the bustling colonial towns.",
      "A golden gate glows at the top of the hill. To open it, you must show that you remember the whole journey of American beginnings."
    ]
  }
};
GAME_CONTENT.extend = function (id, x) {
  var s = null; GAME_CONTENT.sections.forEach(function (z) { if (z.id === id) s = z; });
  if (!s) throw new Error("extend: no section " + id);
  if (x.addText) Object.keys(x.addText).forEach(function (t) { s.lessons.forEach(function (l) { if (l.topic === t) l.text = l.text.concat(x.addText[t]); }); });
  if (x.replaceText) x.replaceText.forEach(function (r) { s.lessons.forEach(function (l) { l.text = l.text.map(function (p) { return p.split(r[0]).join(r[1]); }); }); });
  if (x.lessons) s.lessons = s.lessons.concat(x.lessons);
  if (x.questions) s.questions = s.questions.concat(x.questions);
  if (x.gear) s.gear = x.gear;
  s.activities = (s.activities || []).concat(x.activities || []);
};

