/* v2 additions: founding ideals, self-government, courage and perseverance.
   Truth first: accurate facts and real quotes; hardships and other peoples'
   perspectives stay in the lessons (see v2-s*.js). */
GAME_CONTENT.extend("s3", {
  addText: {
    columbus: [
      "**Perseverance:** Columbus spent years asking for support. Portugal turned him down, and Spain's experts said his plan would fail, until Ferdinand and Isabella agreed in **1492**. On the voyage his worried crews pushed to turn back, but he kept sailing west until land was sighted on **October 12, 1492**."
    ]
  },
  questions: [
    { id: "s3q35", topic: "columbus", type: "mc", q: "What shows Columbus's perseverance before his 1492 voyage?",
      choices: ["He kept asking rulers for support for years after being turned down", "He was given ships the first time he asked", "He sailed alone in a rowboat", "He waited for Magellan to go first"],
      explain: "Portugal turned him down, and Spain's advisors doubted him, but he kept trying until Ferdinand and Isabella agreed in 1492." }
  ]
});

GAME_CONTENT.extend("s5", {
  lessons: [
    { topic: "selfgov5", title: "Scroll 7: Seeds of Self-Government", video: null,
      text: [
        "Two of America's founding ideals, **self-government** and **the rule of law**, took root in these first colonies, long before the American Revolution.",
        "**House of Burgesses, 1619.** On **July 30, 1619**, elected **burgesses** (two from each settlement) met with Governor **George Yeardley** in the church at **Jamestown**. It was the **first elected representative assembly** in English America: colonists chose people to make laws for them.",
        "**Mayflower Compact, 1620.** Before landing, 41 men agreed to form a \"civil body politic\" and to make **\"just and equal laws\"** for \"the general good of the colony.\" The idea that the people agree to be governed by laws they make together is called **government by consent**.",
        "**Town meetings.** As New England grew, the voting men of each town met to discuss problems, choose officials, and vote, an early form of **direct democracy** (see Land 6).",
        "**Perseverance and ingenuity.** Jamestown survived the Starving Time and found a crop that could support it. At Plymouth, after two years of shared farming and hunger, Governor Bradford gave each family its own plot in **1623**. He wrote: **\"This had very good success, for it made all hands very industrious.\"**",
        "**Faith.** Many settlers believed God guided their work. Bradford hoped their small colony would inspire others: **\"as one small candle may light a thousand, so the light here kindled hath shone unto many, yea in some sort to our whole nation.\"**",
        "**The full truth.** These freedoms did not include everyone. Women could not vote, enslaved Africans had no voice, and Native nations lost land as the colonies grew. Americans later worked to extend these ideals to more people."
      ] }
  ],
  questions: [
    { id: "s5q31", topic: "selfgov5", type: "mc", q: "When and where did the House of Burgesses first meet?",
      choices: ["In 1619, in the church at Jamestown", "In 1620, aboard the Mayflower", "In 1639, in Hartford, Connecticut", "In 1607, aboard the Susan Constant"],
      explain: "On July 30, 1619, the first elected representative assembly in English America met at Jamestown." },
    { id: "s5q32", topic: "selfgov5", type: "fill", q: "The elected representatives in Virginia's first assembly were called ____.",
      accept: ["burgesses", "burgess", "the burgesses"], display: "burgesses", explain: "That is why it was called the House of Burgesses." },
    { id: "s5q33", topic: "selfgov5", type: "mc", q: "Which three are early examples of self-government in the English colonies?",
      choices: ["The House of Burgesses, the Mayflower Compact, and town meetings", "The encomienda, the viceroy, and the Spanish Armada", "The Columbian Exchange, the caravel, and the astrolabe", "The Starving Time, the Lost Colony, and the headright system"],
      explain: "Each one let colonists take part in making their own laws or decisions." },
    { id: "s5q34", topic: "selfgov5", type: "mc", q: "In 1623, Bradford gave each Plymouth family its own plot of land. What happened, according to Bradford?",
      choices: ["People worked harder and much more corn was planted", "The colony was abandoned", "Everyone stopped farming", "The Wampanoag took over the fields"],
      explain: "Bradford wrote that it \"made all hands very industrious.\"" },
    { id: "s5q35", topic: "selfgov5", type: "fill", q: "Bradford wrote: \"as one small ____ may light a thousand, so the light here kindled hath shone unto many.\"",
      accept: ["candle"], display: "candle", explain: "He hoped Plymouth's small beginning would inspire many others." },
    { id: "s5q36", topic: "selfgov5", type: "mc", q: "\"Government by consent\" means...",
      choices: ["People agree to be governed by laws they help make", "A king rules without asking anyone", "Only soldiers make the laws", "There are no laws at all"],
      explain: "The Mayflower Compact is an early example: the signers agreed together to make and obey just and equal laws." }
  ]
});

GAME_CONTENT.extend("s6", {
  addText: {
    newengland: [
      "In **1633**, **Dorchester, Massachusetts**, set up one of the first **town meetings**. Voting men met regularly to make local rules, choose officials called **selectmen**, and set taxes for roads and schools. At first, voting was usually limited to men who owned property or belonged to the church.",
      "In **1641**, Massachusetts adopted the **Body of Liberties**, an early written list of rights, including the right of anyone to speak or petition at a town meeting."
    ]
  },
  questions: [
    { id: "s6q40", topic: "newengland", type: "mc", q: "What was the Massachusetts Body of Liberties (1641)?",
      choices: ["An early written list of the colonists' rights", "A tax on tea", "A treaty with France", "A list of tobacco prices"],
      explain: "Like the Fundamental Orders of Connecticut, it put the rules and rights of the colony in writing." },
    { id: "s6q41", topic: "newengland", type: "mc", q: "At a New England town meeting, who decided local issues?",
      choices: ["The town's voting men, by discussing and voting", "The king of England alone", "A Spanish viceroy", "The ship's captain"],
      explain: "Town meetings were an early form of direct democracy. At first only certain men could vote." }
  ]
});
