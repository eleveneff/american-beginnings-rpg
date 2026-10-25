/* v2: every lesson video is one entry here. Each entry has:
   - cues: 3-5 timed fact captions shown as a lower third while the video plays.
     They are spread evenly over the real video length, or play as a timed
     "fact tour" when the file is still a placeholder.
   - facts: the Key Facts card shown below the video.
   - check: 1-2 "What did you see?" questions, asked after the video. They pay
     stars and are also added to the section's trial pool, so they count toward
     mastery.
   - The file is always assets/video/<key>.mp4. Until a verified file is
     there, a placeholder runs the captions as a fact tour.
   attach maps a section and lesson topic to a key. Lessons that already have a
   videoKey (Section 5) are matched directly. Facts are written truth first. */
GAME_CONTENT.videos = {
  "s1-beringia": {
    title: "Crossing Beringia",
    cues: [
      "Ice Age: glaciers held so much water that the sea dropped hundreds of feet.",
      "A land bridge, **Beringia**, joined **Siberia (Asia)** and **Alaska**.",
      "More than **15,000 years ago**, hunters crossed it following **mammoths** and other big game.",
      "Some may also have traveled **by boat along the Pacific coast**.",
      "Why it matters: these hardy pioneers became the **first peoples of the Americas**."
    ],
    facts: [
      "**Beringia** was a land bridge between Siberia and Alaska during the last Ice Age.",
      "Many scientists think the first Americans arrived **more than 15,000 years ago**, on foot across Beringia, by boat along the coast, or both.",
      "They followed herds of **woolly mammoths, mastodons, and bison**.",
      "Many Native nations also have their own origin stories that teach they have always lived in their homelands."
    ],
    check: [
      { q: "In the video, which two places did Beringia connect?",
        choices: ["Siberia (Asia) and Alaska (North America)", "Spain and Florida", "England and Virginia", "Africa and Brazil"],
        explain: "Beringia joined Asia and North America when sea levels were low." },
      { q: "What were the Ice Age hunters following across Beringia?",
        choices: ["Herds of big game such as woolly mammoths", "Spanish treasure ships", "Herds of cattle and sheep", "Trade caravans with camels"],
        explain: "Mammoths, mastodons, and bison were key food sources." }
    ]
  },
  "s1-clovis-points": {
    title: "Clovis Points: Ice Age Ingenuity",
    cues: [
      "**Clovis points** are named for **Clovis, New Mexico**, where they were found in the **1930s**.",
      "They date to about **13,000 years ago**, near the end of the Ice Age.",
      "Leaf-shaped, chipped from stone such as **chert**, with sharp edges and no notches.",
      "A groove at the base, the **flute**, let the point be tied to a **spear shaft**.",
      "Why it matters: with this **ingenuity**, hunters took **mammoths and bison**."
    ],
    facts: [
      "**Clovis points** are named for **Clovis, New Mexico**, where they were found in the **1930s**.",
      "They date to about **13,000 years ago**.",
      "They are **leaf-shaped** and were **chipped from stone like chert**.",
      "A groove at the base, the **flute**, let them be **tied to a spear shaft**.",
      "Hunters used them on large Ice Age animals such as **mammoths and bison**."
    ],
    check: [
      { q: "What was the groove (flute) at the base of a Clovis point for?",
        choices: ["Tying the point to a spear shaft", "Holding a feather for decoration", "Pouring water", "Marking who owned it"],
        explain: "The flute helped hunters lash the stone point firmly to a wooden shaft." },
      { q: "Which animals did Clovis hunters use these points on?",
        choices: ["Large Ice Age animals such as mammoths and bison", "Horses and cattle brought by the Spanish", "Whales from canoes", "Chickens and pigs"],
        explain: "Clovis points have been found with mammoth and bison bones." }
    ]
  },
  "s1-early-maize": {
    title: "Early Maize: The Gift of Farming",
    cues: [
      "As the Ice Age ended, many giant animals died out, and people began to **farm**.",
      "In **Mexico**, farmers developed **maize (corn)** from a wild grass, starting about **9,000 years ago**.",
      "The **Three Sisters**, corn, beans, and squash, grew together and helped each other.",
      "Why it matters: a food **surplus** led to permanent villages, cities, and **civilizations**."
    ],
    facts: [
      "Maize was developed from **teosinte**, a wild grass, in Mesoamerica.",
      "**Three Sisters:** corn stalks hold up beans, beans enrich the soil, and squash leaves shade out weeds.",
      "Farming let people settle in one place, grow a surplus, and build civilizations."
    ],
    check: [
      { q: "Which three crops are the \"Three Sisters\"?",
        choices: ["Corn, beans, and squash", "Wheat, rice, and barley", "Potatoes, tomatoes, and peppers", "Tobacco, cotton, and indigo"],
        explain: "Native farmers planted them together in the same mounds." },
      { q: "Why did farming change how people lived?",
        choices: ["It let them stay in one place and grow extra food", "It made them move every few days", "It ended all trade", "It made hunting impossible"],
        explain: "A surplus of food supported permanent villages and growing populations." }
    ]
  },
  "s5-jamestown-settlers": {
    title: "The First Settlers of Jamestown, 1607",
    cues: [
      "**May 1607:** about 104 English men and boys reach Virginia on three ships.",
      "The **Susan Constant, Godspeed, and Discovery** were sent by the **Virginia Company of London**.",
      "Within weeks they raise a **triangular wooden fort** on the James River.",
      "**Captain John Smith:** \"He that will not work shall not eat.\"",
      "Why it matters: Jamestown becomes the **first permanent English settlement** in North America."
    ],
    check: [
      { q: "In what year was Jamestown founded?",
        choices: ["1607", "1620", "1492", "1754"],
        explain: "Jamestown was founded in May 1607." },
      { q: "Which three ships brought the first Jamestown settlers?",
        choices: ["Susan Constant, Godspeed, and Discovery", "Niña, Pinta, and Santa María", "Mayflower and Speedwell", "Half Moon, Victoria, and Golden Hind"],
        explain: "The Virginia Company sent all three ships." }
    ]
  },
  "s5-virginia-struggles": {
    title: "Early Virginia: Struggles and Recovery",
    cues: [
      "Hard early years: **swampy ground, bad water, disease**, and conflict with the **Powhatan**.",
      "**John Smith's rule:** \"He that will not work shall not eat.\"",
      "**Starving Time, winter 1609–1610:** only about **60 of some 500** colonists survived.",
      "About **1612**, **John Rolfe's** sweeter **tobacco** becomes Virginia's **cash crop** and saves the colony.",
      "**1619:** the **House of Burgesses**, the first elected representative assembly in English America. The first recorded **Africans** also arrive, as forced laborers."
    ],
    facts: [
      "Jamestown's early years were hard: **swampy ground, bad water, disease**, and conflict with the **Powhatan**.",
      "**John Smith** made a rule: **\"He that will not work shall not eat.\"**",
      "In the **Starving Time** (winter **1609–1610**), only about **60 of some 500** colonists stayed alive.",
      "**John Rolfe's** sweeter **tobacco** (about **1612**) became Virginia's **cash crop** and saved the colony.",
      "**1619:** the **House of Burgesses** met, the **first elected representative assembly** in English America.",
      "Also in **1619**, the first recorded **Africans** arrived in Virginia as **forced laborers**."
    ],
    check: [
      { q: "What cash crop saved the Jamestown colony?",
        choices: ["Tobacco", "Cotton", "Sugar cane", "Wheat"],
        explain: "About 1612, John Rolfe's sweeter tobacco sold well in England and became Virginia's cash crop." },
      { q: "What happened in Virginia in 1619?",
        choices: ["The House of Burgesses, the first elected assembly in English America, met", "The Mayflower landed at Cape Cod", "Jamestown was abandoned forever", "Spain took over Virginia"],
        explain: "It was a seed of American self-government. That same year, the first recorded Africans arrived in Virginia as forced laborers." }
    ]
  },
  "s5-pilgrim-voyage": {
    /* PROVISIONAL: placeholder until a verified clip arrives. The v3 clip was pulled because it showed an inaccurate flag.
       Review these captions against the new file. */
    title: "The Mayflower Voyage, 1620",
    cues: [
      "The **Pilgrims** were Separatists seeking **freedom to worship** as they believed.",
      "**September 1620:** the Mayflower sails from **Plymouth, England**, with about **102 passengers**.",
      "**66 days at sea**, through Atlantic storms; a cracked main beam is braced with a great iron screw.",
      "**November 1620:** they sight **Cape Cod**, far north of their Virginia charter.",
      "Before landing, the men sign the **Mayflower Compact** aboard ship, promising to make and obey \"just and equal laws.\""
    ],
    facts: [
      "About **102 passengers**, Pilgrims and other settlers, sailed on the **Mayflower** in **September 1620**.",
      "The crossing took **66 days**. They sighted **Cape Cod** in **November 1620**.",
      "They had landed outside their charter, so **41 men signed the Mayflower Compact aboard ship before going ashore**.",
      "The Compact made government rest on the **consent of the governed**, a founding American ideal."
    ],
    check: [
      { q: "What did the Pilgrims sign aboard the Mayflower before landing?",
        choices: ["The Mayflower Compact", "The Declaration of Independence", "The Body of Liberties", "The Treaty of Paris"],
        explain: "Signed in November 1620, it promised just and equal laws made by consent." },
      { q: "Where did storms bring the Mayflower in November 1620?",
        choices: ["Cape Cod", "Jamestown", "Florida", "Hudson Bay"],
        explain: "Landing outside their Virginia charter led to the Mayflower Compact." }
    ]
  },
  "s5-new-england": {
    title: "The Mayflower Compact and a New England Beginning",
    cues: [
      "**41 men sign the Mayflower Compact:** \"just and equal laws\" for the general good.",
      "About **half the settlers die** in the first hard winter at Plymouth.",
      "**Squanto (Tisquantum)** teaches them to plant corn with fish as fertilizer.",
      "**Massasoit's Wampanoag** make a peace treaty of mutual defense, 1621.",
      "**Autumn 1621:** a three-day harvest feast, and New England grows town by town."
    ],
    check: [
      { q: "What did the Mayflower Compact promise?",
        choices: ["To make and obey \"just and equal laws\" for the general good", "To return to England in one year", "To obey the king of Spain", "To search for the Northwest Passage"],
        explain: "It is an early example of self-government by consent." },
      { q: "Who taught the Pilgrims to plant corn using fish as fertilizer?",
        choices: ["Squanto (Tisquantum)", "John Smith", "Pocahontas", "Samuel de Champlain"],
        explain: "Squanto had learned English after being kidnapped to Europe." }
    ]
  }
};
GAME_CONTENT.videoAttach = { s1: { beringia: "s1-beringia", clovis: "s1-clovis-points", agriculture: "s1-early-maize" } };
/* Attach entries to lessons and add check questions to each trial pool. */
(function () {
  var V = GAME_CONTENT.videos, A = GAME_CONTENT.videoAttach;
  GAME_CONTENT.sections.forEach(function (s) {
    s.lessons.forEach(function (l) {
      var key = l.videoKey || (A[s.id] && A[s.id][l.topic]);
      var v = key && V[key]; if (!v) return;
      l.videoKey = key; v.section = s.id; v.topic = l.topic;
      if (!v.facts && l.videoFacts) v.facts = l.videoFacts;
      if (!v.title) v.title = l.videoTitle || l.title;
      v.check.forEach(function (c, i) {
        c.id = key + "-q" + (i + 1); c.topic = l.topic; c.type = "mc"; c.fromVideo = key;
        if (!s.questions.some(function (q) { return q.id === c.id; })) s.questions.push(c);
      });
    });
  });
})();
