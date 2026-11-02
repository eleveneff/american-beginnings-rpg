/* v3.0 Level 7 lesson videos. Same format as videos.js. Until a verified file is in
   assets/video/<key>.mp4, each runs as a timed fact tour of its captions. */
(function () {
  var V = GAME_CONTENT.videos;
  V["s7-fort-necessity"] = {
    title: "Washington at Fort Necessity",
    cues: [
      "In 1753, a young Major **George Washington**, just 21 years old, carries Virginia's letter to the French at **Fort Le Boeuf**. The French refuse to leave.",
      "Heading home, he tumbles off a raft into the icy **Allegheny River**. Then, in 1754, the French grab the **Forks of the Ohio** first.",
      "May 28, 1754. At **Jumonville Glen**, Washington and the Seneca leader **Tanacharison** attack a small French party. Its commander, **Jumonville**, is killed.",
      "Expecting revenge, Washington builds a small round fort of upright logs, **Fort Necessity**. But it sits in a **low, wet meadow**, too close to the woods.",
      "July 3: a larger French and Native force attacks in pouring rain. Washington **surrenders**, and his men march home. He will **learn from defeat**."
    ],
    cueTimes: [0, 10.31, 19.33, 30.21, 39.36], // narration starts 0.5 s after each cue
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
      "The Mohawk leader **Hendrick** scolds the British for leaving the frontier undefended. The Iroquois refuse an alliance, but promise to stay **neutral**.",
      "**Benjamin Franklin** proposes one **Grand Council** to run defense for all the colonies: the **Albany Plan of Union**.",
      "Weeks earlier, his newspaper printed a famous cartoon: a snake cut into pieces, with the words **JOIN, or DIE**.",
      "But every colonial assembly says **no**. None will give up its power. Still, the **idea of union** is born."
    ],
    cueTimes: [0, 6.6, 15.34, 22.73, 29.75], // narration starts 0.5 s after each cue
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
      "**Quebec**, capital of New France, sits high on a cliff above the **Saint Lawrence River**. It seems impossible to attack.",
      "September 1759: British boats slip quietly down the river in the dark. Scouts have found a **poorly guarded path** up the cliff.",
      "General **James Wolfe**'s soldiers climb the steep path at the **Anse au Foulon** and overwhelm the guards.",
      "September 13: on the **Plains of Abraham**, the British defeat the French in less than an hour. Wolfe and **Montcalm** are both killed.",
      "**Montreal** surrenders in 1760. France's **empire in North America** is ending."
    ],
    cueTimes: [0, 7.77, 16.11, 23.01, 30.86], // narration starts 0.5 s after each cue
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
      "February 1763: the **Treaty of Paris**. France gives Britain **Canada** and its lands east of the **Mississippi River**.",
      "**Pontiac**, an Ottawa leader, unites many nations to fight the British forts around the Great Lakes.",
      "His warriors besiege **Fort Detroit** for about six months.",
      "In October, King George III's **Proclamation** bans settlement west of the **Appalachian Mountains**. Many colonists are angry.",
      "And Britain is deep in **debt** from the war. To pay it, Parliament plans to **tax the colonies**. The **road to revolution** begins."
    ],
    cueTimes: [0, 8.05, 14.51, 18.86, 27.24], // narration starts 0.5 s after each cue
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
      "The 1750s! **Britain** and **France**, Europe's great rivals, both claim the **Ohio River Valley**, beyond the Appalachian Mountains.",
      "Virginians want its rich land for farms. French traders want its **fur trade**, and the Ohio links **New France** with **Louisiana**.",
      "So the French build a chain of **forts** and **trading posts**, from Lake Ontario south toward the Ohio.",
      "But **Shawnee**, **Delaware**, and **Mingo** towns already stand in the valley. It is their home.",
      "In April 1754, the French seize the **Forks of the Ohio** and build **Fort Duquesne**. Today, that spot is **Pittsburgh**."
    ],
    cueTimes: [0, 8.79, 17.23, 23.63, 29.86], // narration starts 0.5 s after each cue
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
      "For **Native nations**, this war is not about kings across the sea. It is a fight over their own **homelands**.",
      "Many nations side with the **French**, who mostly came to trade furs, not to clear the forest for farms.",
      "The **French** also sent **missionaries**, hoping to convert Native people to Christianity.",
      "The **Iroquois Confederacy**, six nations in New York, has long traded with the **British**.",
      "Each nation chooses what is best for **its own people**, and some **change sides** as the war goes on."
    ],
    cueTimes: [0, 8.15, 15.42, 21.92, 28.35], // narration starts 0.5 s after each cue
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
      "In 1755, British General **Edward Braddock** marches on **Fort Duquesne** with redcoats and colonial militia, cutting a road through the forest.",
      "On July 9, near the **Monongahela River**, French and Native fighters attack from the woods. **Braddock is killed**, and his army is crushed.",
      "**Washington** rides through the battle with bullets through his coat, and helps lead the survivors back.",
      "The war spreads to Europe and around the world as the **Seven Years' War**. In 1757, **William Pitt** takes charge in London.",
      "Pitt pays for colonial troops and sends Britain's best generals. In 1758, the French blow up **Fort Duquesne** and leave. The British build **Fort Pitt**."
    ],
    cueTimes: [0, 9.36, 18.05, 23.72, 32.14], // narration starts 0.5 s after each cue
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
