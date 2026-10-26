/* v2.1: Primary-source scrolls. One per land, and two in Lands 5 and 6.
   Every excerpt is copied word for word from the source URL listed in each
   scroll (see the sources log). "…" marks words left out, and [brackets] mark
   an editor's change. A lesson's `source` object is drawn as a parchment by
   app.js (scrollBody). Each scroll has 3–5 exam-style questions. They join the
   land's question pool, so they also show up in Trials, Review and the Grand
   Trial. */
GAME_CONTENT.extend("s1", {
  lessons: [{
    topic: "src1", title: "Scroll 8: Evidence Scroll: The Clovis Points of Blackwater Draw", video: null,
    source: {
      kind: "artifact",
      title: "Clovis spear points found with mammoth bones",
      author: "Made by Clovis-culture hunters. The site is described here by Eastern New Mexico University's Blackwater Draw archaeologists.",
      date: "Made about 13,000 years ago · found 1929 · digging began 1932",
      context: "The Clovis people left no writing. Here, the primary source is the evidence itself: stone tools found in the ground beside the bones of animals they hunted.",
      clues: [
        "📍 **Where:** Blackwater Draw, near Clovis and Portales, New Mexico. A local rancher, **Ridgley Whiteman**, reported the find in **1929**.",
        "🦣 **What lay together:** fluted stone spear points mixed in with the bones of **mammoths** and other Ice Age animals.",
        "🔍 **Clue in the stone:** each point has a groove (a *flute*) chipped up its base, probably to help fit it onto a wooden spear shaft."
      ],
      excerptLabel: "What the site's archaeologists write",
      excerpt: [
        "\"Blackwater Draw Locality 1 is the type site of the Clovis Culture, the oldest positively defined cultural group in North America. It was discovered in 1929, and excavations began in 1932.\"",
        "\"The Clovis point is the oldest and most widely distributed single artifact type in North America.\""
      ],
      note: "Artifacts are primary sources, but people have to interpret them. Newer finds, such as Monte Verde in Chile and the White Sands footprints, show that people were in the Americas even before Clovis.",
      url: "https://www.bwdarchaeology.com/bwdnationalhistoriclandmark"
    },
    text: [
      "A **type site** is the place a culture is named after. Its finds become the standard examples that other sites are compared to. Because of Blackwater Draw, any spear point shaped like these is called a **Clovis point**.",
      "Read the evidence like a detective. Spear points lying *with* mammoth bones show that people **hunted Ice Age animals**. Clovis points have been found across much of North America, so the way of life spread widely."
    ]
  }],
  questions: [
    { id: "s1src1", type: "mc", topic: "src1", q: "Blackwater Draw is the \"type site\" of the Clovis culture. What is a type site?", choices: ["The place a culture is named after, whose finds become the standard examples", "A place where printing type was invented", "Any site with more than one type of tool", "The place where a culture's people were buried"], explain: "Because of Blackwater Draw near Clovis, New Mexico, these points are called Clovis points." },
    { id: "s1src2", type: "mc", topic: "src1", q: "Clovis spear points were found mixed in with mammoth bones. What does that evidence best show?", choices: ["People lived in the same time as Ice Age animals and hunted them", "Mammoths made stone tools", "The Clovis people kept mammoths as pets", "The points were made by Europeans"], explain: "Tools found together with the bones show that people hunted mammoths and other Ice Age animals." },
    { id: "s1src3", type: "fill", topic: "src1", q: "Blackwater Draw, the type site of the Clovis culture, is in the present-day state of ____.", accept: ["New Mexico", "NM"], display: "New Mexico", explain: "It is near Clovis and Portales, New Mexico. It was found in 1929, and digging began in 1932." },
    { id: "s1src4", type: "mc", topic: "src1", q: "The Clovis people left no writing. What kind of primary source do historians use to learn about them?", choices: ["Artifacts, such as stone points and bones found at sites", "Their diaries", "Letters they sent to Spain", "Newspapers from the time"], explain: "Artifacts are objects people made or used. For people who left no writing, artifacts are the main evidence." },
    { id: "s1src5", type: "mc", topic: "src1", q: "Why do scientists no longer say for certain that the Clovis people were the very first Americans?", choices: ["Older sites, such as Monte Verde and the White Sands footprints, were found", "Clovis points were proven fake", "The Clovis people left records saying others came first", "Mammoths never lived in North America"], explain: "New evidence can change what historians conclude. Some sites appear to be thousands of years older than Clovis." }
  ]
});

GAME_CONTENT.extend("s2", {
  lessons: [{
    topic: "src2", title: "Scroll 7: Source Scroll: The Hiawatha Belt", video: null,
    source: {
      kind: "artifact",
      title: "The Hiawatha Belt (a wampum belt)",
      author: "Made by the Haudenosaunee (Iroquois Confederacy). Described in the Onondaga Nation's own words.",
      date: "Date unknown. Made before Europeans arrived.",
      context: "Wampum belts are woven from purple and white shell beads. They record important agreements, so that speakers could \"read\" them aloud at councils.",
      clues: [
        "🟪 **Five symbols in a row**, read from east to west: the **Mohawk** (Keepers of the Eastern Door), the **Oneida**, the **Onondaga** (the center symbol, a tree), the **Cayuga** and the **Seneca** (Keepers of the Western Door).",
        "🌲 **The center tree** is the **Tree of Peace**. The Onondaga are the **Firekeepers**, who host the Grand Council.",
        "🔗 **White bands link the symbols**, showing the nations joined together. Today the Haudenosaunee fly the belt's design as their **flag**."
      ],
      excerptLabel: "In the Onondaga Nation's words",
      excerpt: [
        "\"This belt is a national belt of the Haudenosaunee. The belt is named after Hiawatha, an Onondaga who was the Peacemaker's helper in spreading the good words of Peace. In this belt, it records when five warring nations; the Seneca, Cayuga, Onondaga, Oneida, and Mohawk, buried their weapons of war to live in peace.\"",
        "\"We do not know when this belt created, but we know we have had this belt long before the French, Dutch and English explorers made their way to our lands.\""
      ],
      note: "The words are quoted exactly as the Onondaga Nation wrote them.",
      url: "https://www.onondaganation.org/culture/wampum/hiawatha-belt/"
    },
    text: [
      "A wampum belt has no written words, but it is still a **primary source**. The nations made it themselves, at the time, to record their union under the **Great Law of Peace**.",
      "Notice the **point of view**. This description comes from the Onondaga Nation itself, the people whose history the belt records."
    ]
  }],
  questions: [
    { id: "s2src1", type: "mc", topic: "src2", q: "According to the Onondaga Nation, what does the Hiawatha Belt record?", choices: ["The time five warring nations buried their weapons of war to live in peace", "A trade deal with Dutch fur traders", "The first buffalo hunt on horseback", "A war against the English colonists"], explain: "The belt records the union of the Seneca, Cayuga, Onondaga, Oneida and Mohawk under the Great Law of Peace." },
    { id: "s2src2", type: "mc", topic: "src2", q: "The center symbol of the Hiawatha Belt stands for the Onondaga, the Firekeepers. What is it?", choices: ["A tree: the Tree of Peace", "A sailing ship", "A buffalo", "A crown"], explain: "The Tree of Peace sits at the center, and the Onondaga host the Grand Council." },
    { id: "s2src3", type: "fill", topic: "src2", q: "The belt is named after Hiawatha, an Onondaga who was the ____'s helper in spreading the good words of Peace.", accept: ["Peacemaker", "the Peacemaker", "Dekanawida", "Deganawida"], display: "Peacemaker", explain: "Hiawatha helped the Peacemaker unite the five nations." },
    { id: "s2src4", type: "mc", topic: "src2", q: "The Onondaga write, \"we have had this belt long before the French, Dutch and English explorers made their way to our lands.\" What point are they making?", choices: ["Their union and its records are their own, and older than European colonies", "The Europeans made the belt", "The belt was a gift from the French king", "They are not sure the belt is real"], explain: "The Haudenosaunee union was formed before Europeans arrived." },
    { id: "s2src5", type: "mc", topic: "src2", q: "Why is a wampum belt a primary source, even though it has no written words?", choices: ["The people involved made it at the time to record an event and agreement", "A historian wrote it 500 years later", "It is printed in a modern textbook", "It is a movie about the past"], explain: "A primary source is created by people who lived through the events. Wampum recorded agreements." }
  ]
});

GAME_CONTENT.extend("s3", {
  lessons: [{
    topic: "src3", title: "Scroll 7: Source Scroll: Columbus's Letter (1493)", video: null,
    source: {
      kind: "text",
      title: "Letter to Luis de Santángel",
      author: "Christopher Columbus",
      date: "1493, written on the voyage home",
      context: "Santángel was a royal official who helped pay for the 1492 voyage. Columbus wrote to announce what he had found. Printed copies spread the news across Europe.",
      excerpt: [
        "\"SIR: Since I know that you will be pleased at the great victory with which Our Lord has crowned my voyage, I write this to you, from which you will learn how in thirty-three days I passed from the Canary Islands to the Indies… There I found very many islands, filled with people innumerable, and of them all I have taken possession for their highnesses, by proclamation made and with the royal standard unfurled, and no opposition was offered to me.\"",
        "\"To the first island which I found I gave the name “San Salvador,” in remembrance of the Divine Majesty, Who had marvelously bestowed all this; the Indians call it “Guanahani.”\"",
        "\"…they are so guileless and so generous with all that they possess, that no one would believe it who has not seen it. They refuse nothing that they possess, if it be asked of them…\"",
        "\"…I will give them as much gold as they may need, if their highness will render me very slight assistance; … and slaves, as many as they shall order to be shipped and who will be from the idolaters.\""
      ],
      note: "English translation by Cecil Jane (1930). \"…\" marks words left out. Columbus believed he had reached Asia (\"the Indies\"). That is why he called the Taíno \"Indians.\"",
      url: "https://eada.lib.umd.edu/text-entries/columbus-letter-to-santangel/"
    },
    text: [
      "Ask the historian's questions. **Who** wrote this? **Why?** Columbus wanted the king and queen to keep paying for voyages, so he described rich lands and easy success.",
      "Read for what is **missing**, too. The Taíno were never asked whether Spain could \"take possession\" of their islands. Columbus praised their generosity, yet in the same letter he offered to ship island people (those he called \"idolaters\") to Spain as **slaves**. Within a few years, Spain was enslaving many Taíno. The full truth includes both his courage at sea and the harm that followed."
    ]
  }],
  questions: [
    { id: "s3src1", type: "mc", topic: "src3", q: "What was a main purpose of Columbus's 1493 letter to Santángel?", choices: ["To report his success and win support for more voyages", "To apologize for getting lost", "To describe the fall of Constantinople", "To ask Portugal to pay for his next trip"], explain: "He described a \"great victory\" and promised gold, hoping the monarchs would fund more voyages." },
    { id: "s3src2", type: "mc", topic: "src3", q: "Columbus wrote that the islands were \"filled with people innumerable.\" What does innumerable mean?", choices: ["Too many to count", "Unfriendly", "Very few", "Unable to read"], explain: "In-numer-able means not able to be numbered, or counted." },
    { id: "s3src3", type: "fill", topic: "src3", q: "Columbus wrote that he named the first island \"San Salvador,\" but \"the Indians call it ____.\"", accept: ["Guanahani"], display: "Guanahani", explain: "The Taíno already had a name for their island: Guanahani." },
    { id: "s3src4", type: "mc", topic: "src3", q: "Columbus wrote that he took possession of the islands and \"no opposition was offered to me.\" Whose point of view is missing?", choices: ["The Taíno people's, who were never asked if they agreed", "The Spanish king's", "Santángel's", "The ship's crew's"], explain: "The Taíno likely did not understand the ceremony, and they were not asked. A careful reader notices whose voice is missing." },
    { id: "s3src5", type: "mc", topic: "src3", q: "Besides gold, what did Columbus offer to send the king and queen?", choices: ["Slaves, as many as they ordered", "Silk from China", "Maps of Africa", "Printed books"], explain: "In the same letter that praised the islanders as generous, Columbus offered to ship people he called \"idolaters\" as slaves. Spain soon enslaved many Taíno, which began great harm." }
  ]
});

GAME_CONTENT.extend("s4", {
  lessons: [{
    topic: "src4", title: "Scroll 7: Source Scroll: Champlain Founds Quebec (1608)", video: null,
    source: {
      kind: "text",
      title: "The Voyages of Samuel de Champlain",
      author: "Samuel de Champlain",
      date: "Describes July 3, 1608 · published 1613",
      context: "Champlain sailed up the St. Lawrence River for France to build a base for the fur trade. This passage describes the founding of Quebec.",
      excerpt: [
        "\"I arrived there on the 3d of July, when I searched for a place suitable for our settlement, but I could find none more convenient or better situated than the point of Quebec, so called by the [Native people], which was covered with nut-trees. I at once employed a portion of our workmen in cutting them down, that we might construct our habitation there: one I set to sawing boards, another to making a cellar and digging ditches, another I sent to Tadoussac with the barque to get supplies. The first thing we made was the storehouse for keeping under cover our supplies…\""
      ],
      note: "English translation by Charles P. Otis. The old translation uses an outdated word for Native people. Here it is replaced with [Native people]. \"…\" marks words left out.",
      url: "https://www.gutenberg.org/cache/epub/6749/pg6749.txt"
    },
    text: [
      "**Quebec**, founded in **1608**, became the heart of **New France**. The name comes from a Native word meaning \"where the river narrows,\" and Champlain kept the name the Native people already used.",
      "A **habitation** was a fortified building where the French lived and stored their goods. Champlain's journal is a **primary source** because he was there and wrote what he saw and did."
    ]
  }],
  questions: [
    { id: "s4src1", type: "mc", topic: "src4", q: "According to Champlain, what did his workers build first at Quebec?", choices: ["A storehouse to keep their supplies under cover", "A church", "A fort with cannons", "A school"], explain: "\"The first thing we made was the storehouse for keeping under cover our supplies.\"" },
    { id: "s4src2", type: "mc", topic: "src4", q: "Why did Champlain choose the point of Quebec for his settlement?", choices: ["He could find no place more convenient or better situated", "It was the only place with gold", "The king of Spain told him to", "It was already a French town"], explain: "He searched the area and judged Quebec the best spot on the St. Lawrence River." },
    { id: "s4src3", type: "fill", topic: "src4", q: "Champlain arrived at Quebec and began building on July 3, ____.", accept: ["1608"], display: "1608", explain: "Quebec was founded in 1608, one year after Jamestown." },
    { id: "s4src4", type: "mc", topic: "src4", q: "Champlain's men built \"our habitation there.\" In this passage, what is a habitation?", choices: ["A building to live in and store goods", "A ship", "A trading partner", "A religious ceremony"], explain: "Habitation comes from \"inhabit,\" which means to live in a place." },
    { id: "s4src5", type: "mc", topic: "src4", q: "Champlain writes that it was \"the point of Quebec, so called by the [Native people].\" What does this detail tell you?", choices: ["The place already had a Native name before the French came", "The French invented the name Quebec", "No one lived near Quebec", "The Native people asked the French to leave"], explain: "Native peoples had long lived along the St. Lawrence and had already named the place." }
  ]
});

GAME_CONTENT.extend("s5", {
  lessons: [{
    topic: "src5a", title: "Scroll 9: Source Scroll: The Mayflower Compact (1620)", video: null,
    source: {
      kind: "text",
      title: "The Mayflower Compact",
      author: "Signed by 41 men aboard the Mayflower, beginning with John Carver",
      date: "November 11, 1620, off Cape Cod",
      context: "The Pilgrims had landed far north of the land their charter covered. Before going ashore, they agreed in writing to form a government and obey its laws.",
      excerpt: [
        "\"IN THE NAME OF GOD, AMEN. We, whose names are underwritten, the Loyal Subjects of our dread Sovereign Lord King James … Having undertaken for the Glory of God, and Advancement of the Christian Faith, and the Honour of our King and Country, a Voyage to plant the first Colony in the northern Parts of Virginia; Do by these Presents, solemnly and mutually, in the Presence of God and one another, covenant and combine ourselves together into a civil Body Politick, for our better Ordering and Preservation …\"",
        "\"… do enact, constitute, and frame, such just and equal Laws, Ordinances, Acts, Constitutions, and Officers, from time to time, as shall be thought most meet and convenient for the general Good of the Colony; unto which we promise all due Submission and Obedience.\""
      ],
      note: "The original paper is lost. This text survives in early printed accounts. The spelling follows the Avalon Project text (\"Politick\" = politic). \"…\" marks words left out.",
      url: "https://avalon.law.yale.edu/17th_century/mayflower.asp"
    },
    text: [
      "A **compact** is an agreement. To **covenant and combine** means to promise and join together. A **civil body politic** is a group of people organized under one government.",
      "Here is the big idea: the settlers agreed to make laws **for the general good** and to obey them. This is **self-government** by the **consent of the governed**, and it became a building block of American liberty. They still called themselves loyal subjects of King James."
    ]
  }, {
    topic: "src5b", title: "Scroll 10: Source Scroll: John Smith's Rule at Jamestown", video: null,
    source: {
      kind: "text",
      title: "The Generall Historie of Virginia, New-England, and the Summer Isles",
      author: "Captain John Smith",
      date: "Published 1624 · describes 1608–1609",
      context: "Smith led Jamestown's council from September 1608. Many settlers refused to farm or work while the colony faced starvation.",
      excerpt: [
        "\"Countrymen, the long experience of our late miseries, I hope is sufficient to persuade everyone to a present correction of himself, and think not that either my pains, nor the Adventurers' purses, will ever maintain you in idleness and sloth. … the greater part must be more industrious, or starve. … you must obey this now for a Law, that he that will not work shall not eat (except by sickness he be disabled). For the labors of thirty or forty honest and industrious men shall not be consumed to maintain an hundred and fifty idle loiterers.\""
      ],
      note: "Spelling modernized. Smith's original reads \"he that will not worke shall not eate.\" This is Smith's own account, written years later. \"Adventurers\" here means the investors who paid for the colony.",
      url: "https://history.hanover.edu/courses/excerpts/161smith-virginia.html"
    },
    text: [
      "Smith's rule came from the Bible (2 Thessalonians 3:10), and it worked: more settlers planted and gathered food. It was an early lesson in **responsibility and hard work**.",
      "Think about **reliability**. Smith wrote this himself, years later, and he liked to make his own role look large. Historians check his stories against other sources."
    ]
  }],
  questions: [
    { id: "s5srcA1", type: "mc", topic: "src5a", q: "The signers agreed to \"combine ourselves together into a civil Body Politick.\" What is a civil body politic?", choices: ["A group of people organized under one government and its laws", "A church choir", "A ship's crew", "A trading company's warehouse"], explain: "They formed a government that would make laws for the colony." },
    { id: "s5srcA2", type: "mc", topic: "src5a", q: "In the Mayflower Compact, what did the signers promise to the \"just and equal Laws\" they would make?", choices: ["All due submission and obedience", "To ignore them if they disagreed", "To send them to Spain for approval", "To pay a tax in tobacco"], explain: "They promised \"all due Submission and Obedience\" to the laws they agreed to make." },
    { id: "s5srcA3", type: "fill", topic: "src5a", q: "The Compact says the laws would be made \"for the general ____ of the Colony.\"", accept: ["Good"], display: "Good", explain: "The laws were meant to serve the common good of the whole colony." },
    { id: "s5srcA4", type: "mc", topic: "src5a", q: "Why did the Pilgrims sign the Mayflower Compact before going ashore?", choices: ["They had landed outside their charter's lands and needed an agreed government", "The king ordered every ship to sign one", "They were preparing for a war with France", "They wanted to elect a king"], explain: "Their charter was for Virginia's lands farther south, so they made their own agreement to keep order." },
    { id: "s5srcA5", type: "mc", topic: "src5a", q: "The signers call themselves \"Loyal Subjects of our dread Sovereign Lord King James.\" What does this show?", choices: ["They still saw themselves as loyal subjects of the English king", "They had declared independence from England", "They were French settlers", "They rejected all government"], explain: "Self-government in 1620 grew up inside loyalty to the Crown. Independence came much later." },
    { id: "s5srcB1", type: "fill", topic: "src5b", q: "John Smith's law at Jamestown: \"he that will not work shall not ____.\"", accept: ["eat"], display: "eat", explain: "Settlers had to work to get a share of the food." },
    { id: "s5srcB2", type: "mc", topic: "src5b", q: "Smith warned the settlers against \"idleness and sloth.\" What does sloth mean?", choices: ["Laziness", "Hunger", "Courage", "Sickness"], explain: "Sloth means laziness, the opposite of the industry Smith demanded." },
    { id: "s5srcB3", type: "mc", topic: "src5b", q: "According to Smith's rule, which settlers did not have to work for their food?", choices: ["Those disabled by sickness", "Gentlemen", "The investors' friends", "No one, not even the sick"], explain: "He made an exception: \"except by sickness he be disabled.\"" },
    { id: "s5srcB4", type: "mc", topic: "src5b", q: "Why should historians read Smith's Generall Historie carefully?", choices: ["Smith wrote it himself, years later, and may have made his own role look larger", "It was written by Pocahontas", "It is a novel with made-up characters", "It was written in 1900"], explain: "A writer telling his own story may leave things out or exaggerate, so historians compare it with other sources." },
    { id: "s5srcB5", type: "mc", topic: "src5b", q: "Smith said the labor of \"thirty or forty honest and industrious men\" should not feed \"an hundred and fifty idle loiterers.\" What was his main point?", choices: ["Everyone had to work, or the colony would starve", "The colony needed more gold miners", "The settlers should go home to England", "Only 30 people should live at Jamestown"], explain: "A few hard workers could not feed everyone, so all the able settlers had to work." }
  ]
});

GAME_CONTENT.extend("s6", {
  lessons: [{
    topic: "src6a", title: "Scroll 8: Source Scroll: \"A City upon a Hill\" (1630)", video: null,
    source: {
      kind: "text",
      title: "A Model of Christian Charity",
      author: "John Winthrop, governor of the Massachusetts Bay Colony",
      date: "1630",
      context: "Written for the Puritans crossing the Atlantic in 1630 to found the Massachusetts Bay Colony. Scholars still debate exactly where Winthrop first delivered it.",
      excerpt: [
        "\"For this end, we must be knit together, in this work, as one man. We must entertain each other in brotherly affection. We must be willing to abridge ourselves of our superfluities, for the supply of others' necessities. … We must delight in each other; make others' conditions our own; rejoice together, mourn together, labor and suffer together, always having before our eyes our commission and community in the work, as members of the same body. …\"",
        "\"For we must consider that we shall be as a city upon a hill. The eyes of all people are upon us.\""
      ],
      note: "Spelling modernized (for example, \"wee must be knitt together\" and \"a citty upon a hill\"). \"…\" marks words left out. \"A city on a hill\" comes from Jesus's Sermon on the Mount (Matthew 5:14).",
      url: "https://history.hanover.edu/texts/winthmod.html"
    },
    text: [
      "Winthrop hoped the colony would be a **model community** for the whole world to see. Later Americans, including presidents, borrowed his \"city upon a hill\" to describe America's hope of being an example of liberty.",
      "Look at his **purpose**. He urged the settlers to share, care for one another and work as **one body**, because success or failure would be seen by everyone."
    ]
  }, {
    topic: "src6b", title: "Scroll 9: Source Scroll: Penn's Charter of Privileges (1701)", video: null,
    source: {
      kind: "text",
      title: "Charter of Privileges Granted by William Penn to the Inhabitants of Pennsylvania",
      author: "William Penn, proprietor and governor of Pennsylvania",
      date: "October 28, 1701",
      context: "Penn, a Quaker, founded Pennsylvania in 1681 as a \"holy experiment\" in religious freedom. This charter served as the colony's plan of government until the American Revolution.",
      excerpt: [
        "\"BECAUSE no People can be truly happy, though under the greatest Enjoyment of Civil Liberties, if abridged of the Freedom of their Consciences, as to their Religious Profession and Worship … I do hereby grant and declare, That no Person or Persons, inhabiting in this Province or Territories, who shall confess and acknowledge One almighty God … shall be in any Case molested or prejudiced, in his or their Person or Estate, because of his or their conscientious Persuasion or Practice …\"",
        "\"FOR the well governing of this Province and Territories, there shall be an Assembly yearly chosen, by the Freemen thereof …\""
      ],
      note: "Original 1701 wording (Avalon Project). \"…\" marks words left out. Honest limit: the same article allowed only those who professed belief in Jesus Christ to serve in the government.",
      url: "https://avalon.law.yale.edu/18th_century/pa07.asp"
    },
    text: [
      "**Freedom of conscience** means the right to believe and worship as your conscience tells you. Penn wrote that no people can be truly happy without it. This idea later shaped the **First Amendment**.",
      "The charter also gave Pennsylvania an **elected assembly**, chosen each year by the **freemen** (free men who could vote). It was one of the most free charters of its time, though not free for everyone: officeholders had to be Christian."
    ]
  }],
  questions: [
    { id: "s6srcA1", type: "mc", topic: "src6a", q: "What did John Winthrop mean by \"we shall be as a city upon a hill\"?", choices: ["The whole world would be watching, so the colony should be a good example", "The colony should be built on a mountaintop for defense", "Boston would become the biggest city in the world", "The settlers should hide from their enemies"], explain: "\"The eyes of all people are upon us.\" He wanted Massachusetts to be a model community." },
    { id: "s6srcA2", type: "mc", topic: "src6a", q: "Winthrop wrote that settlers must \"abridge ourselves of our superfluities, for the supply of others' necessities.\" What does that mean?", choices: ["Give up some of our extra things to supply what others need", "Write shorter letters", "Sell our supplies for profit", "Leave the colony if food runs low"], explain: "Abridge means to cut back, and superfluities are extras. He asked people to share." },
    { id: "s6srcA3", type: "fill", topic: "src6a", q: "Winthrop: \"we must be knit together, in this work, as one ____.\"", accept: ["man"], display: "man", explain: "He wanted the colony united as one body, caring for each other." },
    { id: "s6srcA4", type: "mc", topic: "src6a", q: "Who was Winthrop's audience for \"A Model of Christian Charity\"?", choices: ["Puritans setting out to found the Massachusetts Bay Colony", "Quakers in Pennsylvania", "Spanish missionaries in New Mexico", "The Virginia House of Burgesses"], explain: "He wrote it for the Puritan settlers of 1630. He was their governor." },
    { id: "s6srcB1", type: "mc", topic: "src6b", q: "Penn wrote that no people can be truly happy if \"abridged of the Freedom of their Consciences.\" What freedom was he protecting?", choices: ["Freedom of religion: to believe and worship by conscience", "Freedom to own land anywhere", "Freedom from all taxes", "Freedom to trade with France"], explain: "Freedom of conscience is the right to believe and worship freely." },
    { id: "s6srcB2", type: "mc", topic: "src6b", q: "Under Penn's Charter of Privileges, who chose the Assembly each year?", choices: ["The freemen of the colony", "The king of England", "William Penn alone", "The Church of England"], explain: "\"An Assembly yearly chosen, by the Freemen thereof\": representative self-government." },
    { id: "s6srcB3", type: "fill", topic: "src6b", q: "William Penn granted Pennsylvania's Charter of Privileges in the year ____.", accept: ["1701"], display: "1701", explain: "It was dated October 28, 1701." },
    { id: "s6srcB4", type: "mc", topic: "src6b", q: "What was one limit of the Charter's freedoms?", choices: ["Only Christians could serve in the government", "No one was allowed to vote", "Quakers were not allowed to worship", "It banned all churches"], explain: "Religious freedom was wide for its time, but holding office was limited to those who professed belief in Jesus Christ." },
    { id: "s6srcB5", type: "mc", topic: "src6b", q: "The Charter says believers shall not be \"molested or prejudiced\" for their beliefs. Here, what does molested mean?", choices: ["Bothered or harmed", "Rewarded", "Elected", "Taxed"], explain: "No one would be harassed or punished because of their faith." }
  ]
});
