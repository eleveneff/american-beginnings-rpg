/* v3.0 Level 7 lesson videos. Same format as videos.js. Until a verified file is in
   assets/video/<key>.mp4, each runs as a timed fact tour of its captions. */
(function () {
  var V = GAME_CONTENT.videos;
  V["s7-fort-necessity"] = {
    title: "Washington at Fort Necessity",
    cues: [
      "1753: Major **George Washington**, age 21, carries Virginia's letter to the French at **Fort Le Boeuf**.",
      "He judges the **Forks of the Ohio** perfect for a fort, but in 1754 the French build **Fort Duquesne** there.",
      "May 28, 1754: at **Jumonville Glen**, Washington and the Seneca leader **Tanacharison** clash with a French party.",
      "Washington builds a small round fort of upright logs: **Fort Necessity**, at Great Meadows.",
      "July 3, 1754: a larger French and Native force attacks in the rain. Washington **surrenders**, and his men march home."
    ],
    facts: [
      "Fort Necessity was a **circle of upright logs** about **53 feet** across, with a small storehouse inside.",
      "Washington's men were Virginia **militia**: ordinary citizens trained to fight in emergencies.",
      "The surrender paper, written in French, said Washington had \"assassinated\" Jumonville. His translator explained it poorly, and Washington said he never knowingly admitted it.",
      "Washington learned from defeat. Twenty-one years later he took command of the Continental Army."
    ],
    check: [
      { q: "What was the name of Washington's small round fort at Great Meadows?",
        choices: ["Fort Necessity", "Fort Duquesne", "Fort Pitt", "Fort Frontenac"],
        explain: "He surrendered it on July 3, 1754." },
      { q: "Which Seneca leader was with Washington at Jumonville Glen?",
        choices: ["Tanacharison, the \"Half King\"", "Pontiac", "Hendrick Theyanoguin", "Squanto"],
        explain: "Tanacharison was an ally of the British in 1754." }
    ]
  };
  V["s7-albany-plan"] = {
    title: "The Albany Plan of Union",
    cues: [
      "June 1754: delegates from **seven colonies** meet Iroquois leaders at **Albany, New York**.",
      "The Mohawk leader **Hendrick** scolds the British for leaving the frontier undefended.",
      "The Iroquois refuse an alliance, but promise to stay **neutral**.",
      "**Benjamin Franklin** proposes one **Grand Council** for the colonies: the **Albany Plan of Union**.",
      "Every colonial assembly says **no**. None will give up its power. But the idea of union is born."
    ],
    facts: [
      "The Albany Congress met from **June 19 to July 11, 1754**.",
      "Franklin's **\"JOIN, or DIE\"** snake appeared in his Pennsylvania Gazette on **May 9, 1754**.",
      "The plan's Grand Council would have handled **defense, Native relations, and western lands**.",
      "Franklin later wrote it would have been \"happy for both sides the water\" if the plan had been adopted."
    ],
    check: [
      { q: "Where did the colonial delegates and Iroquois leaders meet in 1754?",
        choices: ["Albany, New York", "Boston, Massachusetts", "Quebec", "Williamsburg, Virginia"],
        explain: "Albany was close to Iroquois country on the Hudson River." },
      { q: "What did the Iroquois promise at Albany?",
        choices: ["To stay neutral", "To join the French", "To sell the Ohio Valley", "To attack Quebec"],
        explain: "Neutral means taking no side." }
    ]
  };
  V["s7-fall-of-quebec"] = {
    title: "The Fall of Quebec, 1759",
    cues: [
      "**Quebec**, capital of New France, sits high on a **cliff** above the St. Lawrence River.",
      "September 1759: British scouts find a **poorly guarded path** up the cliff at the Anse au Foulon.",
      "At night, General **James Wolfe's** soldiers climb the path and overwhelm the guards.",
      "September 13: the British defeat the French on the **Plains of Abraham**. **Wolfe** and **Montcalm** are both killed.",
      "Montreal surrenders in **1760**. France's empire in North America is ending."
    ],
    facts: [
      "The battle on the Plains of Abraham lasted **less than an hour**.",
      "Wolfe's army had to row past French guards in the dark. A French-speaking officer is said to have answered a sentry's challenge.",
      "Many Canadian **militia** fought bravely to defend their homes beside French regular soldiers.",
      "Quebec is still a French-speaking city today."
    ],
    check: [
      { q: "On which field did the British defeat the French at Quebec?",
        choices: ["The Plains of Abraham", "Great Meadows", "Jumonville Glen", "Bunker Hill"],
        explain: "September 13, 1759." },
      { q: "What happened to Wolfe and Montcalm?",
        choices: ["Both were killed", "Both became governors", "Both went home to Europe", "They signed the Treaty of Paris"],
        explain: "Both commanders died of their wounds." }
    ]
  };
  V["s7-treaty-1763"] = {
    title: "1763: A New Map, and New Troubles",
    cues: [
      "February 1763: the **Treaty of Paris**. France gives Britain **Canada** and its lands **east of the Mississippi**.",
      "Britain gets **Florida** from Spain. Spain gets **Louisiana** and **New Orleans**.",
      "**Pontiac**, an Ottawa leader, unites nations to fight British forts around the Great Lakes.",
      "October 1763: King George III's **Proclamation** bans settlement **west of the Appalachians**.",
      "Britain is deep in **debt** and plans to **tax** the colonies. The road to revolution begins."
    ],
    facts: [
      "Pontiac's forces besieged **Detroit** for about **six months**.",
      "Britain planned to keep **10,000 troops** in America after the war.",
      "Many colonists felt the Proclamation took away land they had fought for, and some crossed the line anyway.",
      "Britain's national debt nearly **doubled** during the Seven Years' War."
    ],
    check: [
      { q: "What did the Proclamation of 1763 forbid?",
        choices: ["Settling west of the Appalachian Mountains", "Trading with Native nations", "Printing newspapers", "Speaking French"],
        explain: "King George III wanted to calm the frontier." },
      { q: "Which leader besieged Detroit in 1763?",
        choices: ["Pontiac", "Montcalm", "Washington", "Braddock"],
        explain: "Pontiac was an Ottawa (Odawa) leader." }
    ]
  };
  V["s7-ohio-rivals"] = {
    title: "Rivals for the Ohio Valley",
    cues: [
      "The 1750s: **Britain** and **France**, Europe's great rivals, both claim the **Ohio River Valley**, beyond the **Appalachian Mountains**.",
      "Virginians want its rich land for farms. French traders want its **fur trade**, and the Ohio links **New France** with **Louisiana**.",
      "The French build a **chain of forts** from **Lake Ontario** south toward the Ohio.",
      "Shawnee, Delaware, and Mingo towns already stand in the valley. It is **their home**.",
      "April 1754: the French seize the **Forks of the Ohio** and build **Fort Duquesne**. Today it is **Pittsburgh**."
    ],
    facts: [
      "In **1749** the king granted Virginia's **Ohio Company** 200,000 acres near the Forks.",
      "The Ohio Company's storehouse at **Wills Creek** on the Potomac later became **Fort Cumberland**.",
      "The **Allegheny** and **Monongahela** rivers meet at the Forks to form the **Ohio**.",
      "France had far fewer colonists than Britain, so it relied on forts, traders, and **Native allies**."
    ],
    check: [
      { q: "Which two European powers both claimed the Ohio Valley?",
        choices: ["Britain and France", "Spain and Portugal", "The Netherlands and Sweden", "Russia and Spain"],
        explain: "Their rivalry led to the French and Indian War." },
      { q: "Which fort did the French build at the Forks of the Ohio in 1754?",
        choices: ["Fort Duquesne", "Fort Necessity", "Fort Cumberland", "Fort Ticonderoga"],
        explain: "Pittsburgh stands there today." }
    ]
  };
  V["s7-native-nations"] = {
    title: "Native Nations Choose Sides",
    cues: [
      "For Native nations, the war is a fight over **their own homelands**.",
      "Many nations side with the **French**, who mostly came to **trade**, not to clear farms.",
      "The French also sent missionaries hoping to **convert** Native people to Christianity.",
      "The **Iroquois Confederacy**, six nations in New York, has long traded with the British.",
      "Each nation chooses for its own people, and some change sides as the war goes on."
    ],
    facts: [
      "The six Iroquois nations: **Mohawk, Oneida, Onondaga, Cayuga, Seneca**, and **Tuscarora** (joined about 1722).",
      "The Seneca leader **Tanacharison** was with Washington at Jumonville Glen in May 1754.",
      "The Mohawk leader **Hendrick Theyanoguin** fought beside the British and was killed at **Lake George** in 1755.",
      "By war's end, the nations of the Ohio Valley had lost their French allies and faced **settlers** moving onto their land."
    ],
    check: [
      { q: "Why did many Native nations side with the French?",
        choices: ["The French mostly came to trade, not to clear land for farms", "The French paid them in gold", "The French promised them seats in Parliament", "The French lived in Britain"],
        explain: "British settlers wanted the land itself." },
      { q: "How many nations were in the Iroquois Confederacy in 1754?",
        choices: ["Six", "Two", "Thirteen", "Twenty"],
        explain: "The Tuscarora had joined the original five." }
    ]
  };
  V["s7-braddock-pitt"] = {
    title: "Defeats, Then a Turning Point",
    cues: [
      "1755: British General **Edward Braddock** marches on **Fort Duquesne** with redcoats and colonial militia.",
      "July 9, 1755: near the Monongahela, **French and Native** fighters attack from the forest. Braddock is **killed**.",
      "Washington rides through the battle and helps lead the survivors back.",
      "1756: the war spreads to Europe and the world as the **Seven Years' War**.",
      "1757: **William Pitt** takes charge. British and colonial forces take **Louisbourg**, **Fort Frontenac**, and the Forks in **1758**."
    ],
    facts: [
      "Braddock's army cut a road through the mountains for its wagons and cannons. Parts of it later became a pioneer route west.",
      "Washington wrote that he had \"4 Bullets through my Coat, and two Horses shot under me.\"",
      "In **1758** the French **blew up Fort Duquesne** and left. The British built **Fort Pitt**, named for William Pitt.",
      "Pitt paid for colonial troops and sent Britain's best generals and ships."
    ],
    check: [
      { q: "What happened to General Braddock's army near Fort Duquesne in 1755?",
        choices: ["It was ambushed and Braddock was killed", "It captured the fort", "It sailed to Quebec", "It made peace with the French"],
        explain: "July 9, 1755." },
      { q: "Who took charge of Britain's war effort in 1757 and turned the war around?",
        choices: ["William Pitt", "George Grenville", "Edward Braddock", "James Wolfe"],
        explain: "Fort Pitt and Pittsburgh are named for him." }
    ]
  };
  var A = { rivalry: "s7-ohio-rivals", allies: "s7-native-nations", war: "s7-braddock-pitt", washington: "s7-fort-necessity", albany: "s7-albany-plan", quebec: "s7-fall-of-quebec", results: "s7-treaty-1763" };
  GAME_CONTENT.videoAttach.s7 = A;
  GAME_CONTENT.sections.forEach(function (s) {
    if (s.id !== "s7") return;
    s.lessons.forEach(function (l) {
      var key = A[l.topic], v = key && V[key]; if (!v) return;
      l.videoKey = key; v.section = s.id; v.topic = l.topic;
      v.check.forEach(function (c, i) {
        c.id = key + "-q" + (i + 1); c.topic = l.topic; c.type = "mc"; c.fromVideo = key;
        if (!s.questions.some(function (q) { return q.id === c.id; })) s.questions.push(c);
      });
    });
  });
})();
