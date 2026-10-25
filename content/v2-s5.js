/* v2 additions: Jamestown and Plymouth */
GAME_CONTENT.extend("s5", {
  gear: [
    { key: "pilgrim-collar", name: "Pilgrim Collar", icon: "🤍", slot: "neck", art: "collar", color: "#ffffff", desc: "A crisp white linen falling band, laid over your shoulders." },
    { key: "iron-hoe", name: "Iron Garden Hoe", icon: "⛏️", slot: "hand", art: "hoe", color: "#5b5b5b", desc: "He that will not work shall not eat!" },
    { key: "capotain", name: "Capotain Hat", icon: "🎩", slot: "head", art: "capotain", color: "#2b2b2b", desc: "A tall hat with a buckle band." },
    { key: "quill-charter", name: "Quill and Charter", icon: "🪶", slot: "offhand", art: "charter", color: "#e9d9a6", desc: "For signing agreements of self-government." }
  ],
  addText: {
    roanoke: [
      "Roanoke was sponsored by **Sir Walter Raleigh**. A first group (1585–1586) gave up and sailed home. John White's 1590 return was delayed for three years by England's war with Spain. **Croatoan** was the name of a nearby island and its people, so some colonists may have gone to live with them.",
      "White, an artist, painted **watercolors of Algonquian villages**, and the scientist **Thomas Harriot** described Native life, giving Europeans some of their first detailed pictures of the region."
    ],
    jamestown: [
      "The colonists arrived in **May 1607** on three ships: the **Susan Constant, Godspeed, and Discovery**. All were men and boys, and many were \"gentlemen\" who had never done hard labor.",
      "In December 1607, Smith was captured by **Opechancanough** and brought before Powhatan. The famous story that **Pocahontas saved his life** comes only from Smith's own writing years later, and many historians doubt it or think it may have been a ceremony Smith misunderstood. Smith left in 1609 after a gunpowder burn.",
      "In June 1610 the starving survivors were actually leaving Jamestown when ships under **Lord De La Warr** arrived with supplies, and the colony continued."
    ],
    tobacco: [
      "Pocahontas (also called **Matoaka**) was baptized **Rebecca**. In 1616 she traveled to England with Rolfe, where she met important people, and she died at **Gravesend in 1617**.",
      "As tobacco farms spread onto Powhatan land, conflict grew. In **1622** Powhatan's brother **Opechancanough** led a surprise attack that killed about **347 colonists**. In **1624** the king took over and made Virginia a **royal colony**.",
      "John Rolfe wrote that in August 1619 a ship brought **\"20. and odd\"** Africans to Point Comfort. They had been captured from a Portuguese slave ship."
    ],
    pilgrims: [
      "The Mayflower left **Plymouth, England, in September 1620** with **102 passengers**. A second ship, the **Speedwell**, leaked and turned back. The crossing took **66 days**.",
      "Not all passengers were Separatists. The Pilgrims called themselves **\"Saints\"** and the others **\"Strangers.\"** Some Strangers said that once ashore no one had power to command them, since they had landed outside Virginia. The **Mayflower Compact** solved this. **John Carver** became the first governor, and **Myles Standish** led the colony's defense."
    ],
    plymouth: [
      "Squanto had been kidnapped in **1614** by the English captain **Thomas Hunt** and sold in Spain. He escaped to England and returned home in **1619**, only to find his village of **Patuxet** empty: an epidemic had killed nearly everyone. Plymouth was built on Patuxet's land.",
      "**The Wampanoag perspective:** Massasoit's people had also been weakened by disease, and the rival **Narragansett** were powerful. The 1621 treaty promised **mutual defense**, so the alliance was a smart strategic choice for the Wampanoag, too. Squanto died in 1622."
    ]
  },
  lessons: [
    { topic: "voices5", title: "Scroll 6: Voices of Virginia and Plymouth", video: null,
      text: [
        "John Smith recorded Powhatan asking the English: **\"Why will you take by force what you may have quietly by love?\"** Remember that we only have Smith's version of Powhatan's words.",
        "The **Mayflower Compact** (1620) says the signers **\"covenant and combine ourselves together into a civil body politic\"** to make **\"just and equal laws\"** for the general good, promising **\"all due submission and obedience.\"** They still called themselves loyal subjects of King James. Only the men signed; women and children were not asked.",
        "**William Bradford** called Squanto **\"a special instrument sent of God for their good beyond their expectation.\"**",
        "**Edward Winslow** wrote one of only two eyewitness accounts of the 1621 harvest feast. Massasoit came \"with some ninety men, whom for three days we entertained and feasted,\" and the Wampanoag \"killed five deer\" to share."
      ] }
  ],
  questions: [
    { id: "s5q20", topic: "roanoke", type: "mc", q: "Who sponsored the Roanoke colony?",
      choices: ["Sir Walter Raleigh", "King Philip II of Spain", "Samuel de Champlain", "William Penn"],
      explain: "Raleigh had a charter from Queen Elizabeth I." },
    { id: "s5q21", topic: "jamestown", type: "mc", q: "Which three ships brought the first Jamestown colonists in 1607?",
      choices: ["Susan Constant, Godspeed, and Discovery", "Niña, Pinta, and Santa María", "Mayflower and Speedwell", "Half Moon, Victoria, and Golden Hind"],
      explain: "They sailed up the James River in May 1607." },
    { id: "s5q22", topic: "jamestown", type: "mc", q: "Why do many historians question the story of Pocahontas saving John Smith's life?",
      choices: ["It comes only from Smith's own account, written years later", "Pocahontas wrote that it never happened", "Smith was never in Virginia", "It happened in England"],
      explain: "Historians check whether a source is reliable and when it was written." },
    { id: "s5q23", topic: "tobacco", type: "mc", q: "Who led the 1622 Powhatan attack on the spreading English settlements?",
      choices: ["Opechancanough", "Massasoit", "Squanto", "Popé"],
      explain: "He was Powhatan's brother. The attack killed about 347 colonists." },
    { id: "s5q24", topic: "tobacco", type: "mc", q: "What happened to Virginia in 1624?",
      choices: ["The king made it a royal colony", "It became independent", "It was sold to France", "It joined New Netherland"],
      explain: "The Virginia Company lost its charter." },
    { id: "s5q25", topic: "pilgrims", type: "mc", q: "What did the Separatist Pilgrims call the other Mayflower passengers who were not part of their church?",
      choices: ["Strangers", "Burgesses", "Patroons", "Conquistadors"],
      explain: "They called themselves Saints." },
    { id: "s5q26", topic: "pilgrims", type: "mc", q: "What was Myles Standish's job in Plymouth Colony?",
      choices: ["He led the colony's military defense", "He was the ship's cook", "He was the Wampanoag leader", "He printed newspapers"],
      explain: "Standish was a professional soldier hired by the Pilgrims." },
    { id: "s5q27", topic: "plymouth", type: "mc", q: "Why was an alliance with the Pilgrims a smart choice for Massasoit and the Wampanoag?",
      choices: ["Disease had weakened them, and allies could help against the powerful Narragansett", "The Pilgrims had a huge army", "The Pilgrims paid them in gold", "The king of England ordered it"],
      explain: "The 1621 treaty promised mutual defense." },
    { id: "s5q28", topic: "voices5", type: "mc", q: "\"Why will you take by force what you may have quietly by love?\" According to John Smith, who said this?",
      choices: ["Powhatan", "King James", "Columbus", "William Bradford"],
      explain: "We only have Smith's record of Powhatan's words." },
    { id: "s5q29", topic: "voices5", type: "fill", q: "In the Mayflower Compact, the signers agreed to \"combine ourselves together into a civil body ____.\"",
      accept: ["politic", "politick"], display: "politic", explain: "A \"civil body politic\" is an organized community with its own government." },
    { id: "s5q30", topic: "voices5", type: "mc", q: "According to Edward Winslow, about how many Wampanoag men came with Massasoit to the 1621 harvest feast?",
      choices: ["About 90", "About 5", "About 1,000", "None"],
      explain: "They feasted for three days, and the Wampanoag brought five deer." }
  ],
  activities: [
    { id: "s5-jamestown", type: "scenario", stage: "fort", icon: "🏰", title: "Jamestown Survival", topic: "jamestown",
      intro: "May 1607. You are a young colonist at Jamestown. Every choice decides whether the colony survives!",
      nodes: [
        { say: "The Virginia Company wants a fort that is easy to defend from Spanish ships, so the leaders choose swampy Jamestown Island. What danger will this spot bring?",
          choices: [ { t: "Bad drinking water and mosquitoes that spread disease", ok: true, r: "Sadly true. Salty, dirty river water and disease killed many colonists." },
                     { t: "Too many shops", r: "There are no shops! The danger is bad water and disease." },
                     { t: "Volcanoes", r: "No volcanoes in Virginia. The danger is bad water and disease." } ] },
        { say: "Many \"gentlemen\" want to dig for gold instead of working. What does Captain John Smith say?",
          choices: [ { t: "\"He that will not work shall not eat.\"", ok: true, r: "Smith's strict rule got colonists planting and building." },
                     { t: "\"Keep digging for gold!\"", r: "There was no gold. Smith made everyone work for food." },
                     { t: "\"Let's all go home.\"", r: "Smith wanted the colony to survive. Work or don't eat!" } ] },
        { say: "Food is running low before winter. What is the best plan?",
          choices: [ { t: "Trade copper and glass beads with the Powhatan for corn", ok: true, r: "Smith traded for corn, and Powhatan corn kept the colony alive." },
                     { t: "Wait for a supply ship that may take months", r: "Waiting could mean starving. Trade with the Powhatan." },
                     { t: "Eat the seed corn", r: "Then there would be nothing to plant! Trade for corn." } ] },
        { say: "1612: Investors in London want profits. What saves the colony's economy?",
          choices: [ { t: "John Rolfe's sweeter tobacco, a cash crop sold in England", ok: true, r: "Tobacco sold so well that colonists planted it everywhere, even in the streets." },
                     { t: "Gold from Jamestown mines", r: "Jamestown had no gold. Tobacco was the colony's \"gold.\"" },
                     { t: "Selling beaver hats to France", r: "That's New France's business. Virginia grew tobacco." } ] },
        { say: "Tobacco needs lots of workers. How does the Company attract more settlers?",
          choices: [ { t: "The headright system: 50 acres for each person whose passage you pay", ok: true, r: "Yes. Headrights brought many settlers and indentured servants." },
                     { t: "Free airplane tickets", r: "Ha! Airplanes are 300 years away. Headrights offered land." },
                     { t: "Banning new settlers", r: "That would doom the colony. Headrights offered 50 acres." } ] },
        { say: "1619: Colonists want a say in local laws. What do they create?",
          choices: [ { t: "The House of Burgesses, the first elected assembly in the English colonies", ok: true, r: "It met in the Jamestown church on July 30, 1619. That was a seed of self-government!" },
                     { t: "A king of Virginia", r: "No, they elected representatives called burgesses." },
                     { t: "Nothing; they let London decide everything", r: "They wanted a voice, so they created the House of Burgesses." } ] },
        { say: "Tobacco fields spread onto Powhatan land. How do the Powhatan see this?",
          choices: [ { t: "As a threat to their land and way of life", ok: true, r: "Yes. Growing anger led to Opechancanough's attack in 1622. Every history has more than one perspective." },
                     { t: "As a wonderful gift", r: "Losing land was a serious threat to the Powhatan people." },
                     { t: "They did not notice", r: "They certainly noticed. Their land was being taken." } ] }
      ] },
    { id: "s5-compact", type: "scenario", stage: "compact", icon: "📜", title: "Draft and Sign the Mayflower Compact", topic: "pilgrims",
      intro: "November 1620, in the Mayflower's cabin. Help William Bradford and the passengers write their agreement, line by line, then sign it!",
      nodes: [
        { say: "We have landed at Cape Cod, far outside Virginia. Why do we need an agreement before going ashore?",
          choices: [ { t: "Our charter is for Virginia, so no government has power here", ok: true, add: "In the name of God, Amen.", r: "Exactly. Some Strangers said no one could command them here, so we need our own agreement." },
                     { t: "To declare independence from England", r: "No! We are loyal to King James. We need order because we landed outside our charter." },
                     { t: "To divide up treasure", r: "There is no treasure. We need laws because we landed outside Virginia." } ] },
        { say: "How should we describe ourselves at the start?",
          choices: [ { t: "As \"loyal subjects\" of King James", ok: true, add: "We... the loyal subjects of our dread sovereign Lord King James...", r: "Right. The Pilgrims stayed loyal to the king. Independence was more than 150 years away." },
                     { t: "As citizens of the United States", r: "The United States did not exist until 1776!" },
                     { t: "As subjects of the King of Spain", r: "We are English! Loyal subjects of King James." } ] },
        { say: "What do we promise to form together?",
          choices: [ { t: "\"Covenant and combine ourselves together into a civil body politic\"", ok: true, add: "...covenant and combine ourselves together into a civil body politic...", r: "Yes, an organized community that governs itself." },
                     { t: "An army to conquer the Wampanoag", r: "No, the Compact created a government, not an army." },
                     { t: "A company to search for gold", r: "No, we form a civil body politic, a government." } ] },
        { say: "What kind of laws will this body make?",
          choices: [ { t: "\"Just and equal laws\" for the general good of the colony", ok: true, add: "...to enact... such just and equal laws... for the general good of the Colony...", r: "Those famous words are an early example of self-government." },
                     { t: "Laws only the ship's captain can change", r: "No, the colonists themselves would make just and equal laws." },
                     { t: "No laws at all", r: "Without laws there would be chaos. Just and equal laws!" } ] },
        { say: "And what do we each promise about those laws?",
          choices: [ { t: "\"All due submission and obedience\"", ok: true, add: "...unto which we promise all due submission and obedience.", r: "Yes. Everyone agrees to obey the laws they make together, a form of majority rule." },
                     { t: "To obey only the laws we like", r: "That would not work! We promise all due submission and obedience." },
                     { t: "To obey the Wampanoag", r: "No, we promise to obey our own colony's laws." } ] },
        { say: "Who will sign the Compact?",
          choices: [ { t: "The 41 adult men aboard", ok: true, add: "✍ John Carver · William Bradford · William Brewster · Myles Standish · Edward Winslow · ... (41 men)", r: "Signed November 11, 1620! Women, children, and servants could not sign, a reminder of who was left out." },
                     { t: "Every passenger, including children", r: "Actually only the 41 adult men signed. Women and children were not asked." },
                     { t: "Only the captain", r: "No, 41 adult men signed, showing self-government by consent." } ] }
      ] },
    { id: "s5-squanto", type: "dialogue", icon: "🌽", title: "Talk with Tisquantum (Squanto)", topic: "plymouth",
      who: { name: "Tisquantum (Squanto)", role: "Patuxet interpreter, Plymouth, 1621", portrait: "🧑🏽", look: { gender: "boy", tunic: "#7a5230", equip: { cloak: { art: "buffalo-robe", color: "#8a6440" }, neck: { art: "shell-necklace", color: "#f3e6c8" }, feet: { art: "moccasins", color: "#c9a06a" } } } },
      lines: [
        { say: "You are surprised I speak English? I learned it the hard way. In 1614 an English captain kidnapped me. What happened next?",
          choices: [ { t: "You were sold in Spain, escaped to England, and finally came home in 1619", ok: true, r: "Yes. It took me five years to return home." },
                     { t: "You went to school in London on purpose", r: "No, I was kidnapped and sold in Spain, then made my way to England." },
                     { t: "You sailed on the Mayflower", r: "No, I came home in 1619, before the Mayflower arrived." } ] },
        { say: "When I came home, my village of Patuxet was empty. Why?",
          choices: [ { t: "An epidemic had killed nearly everyone", ok: true, r: "Yes. A terrible sickness, likely brought by European sailors, swept the coast from 1616 to 1619. Plymouth is built where Patuxet stood." },
                     { t: "Everyone moved to Spain", r: "No, a disease epidemic killed almost all my people." },
                     { t: "A flood washed it away", r: "No, sickness emptied my village." } ] },
        { say: "This spring I am teaching the newcomers to plant corn. What trick helps the corn grow in this rocky soil?",
          choices: [ { t: "Bury small fish in each mound as fertilizer", ok: true, r: "Right! Herring-like fish called alewives run up the brook in spring." },
                     { t: "Plant it in the snow", r: "Corn needs warm soil. Plant in spring with fish fertilizer." },
                     { t: "Water it with seawater", r: "Salt water kills plants! Use fish as fertilizer." } ] },
        { say: "I helped Massasoit and Governor Carver make a treaty in March 1621. What did it promise?",
          choices: [ { t: "Peace and mutual defense: each side would help the other if attacked", ok: true, r: "Yes. The peace lasted for many years." },
                     { t: "That the Wampanoag would leave forever", r: "No, it was an alliance of peace and mutual defense." },
                     { t: "That the Pilgrims would pay taxes to Massasoit", r: "No, it promised peace and mutual defense." } ] },
        { say: "Why did Massasoit want this alliance?",
          choices: [ { t: "Disease had weakened the Wampanoag, and the rival Narragansett were powerful", ok: true, r: "Exactly. Both sides had reasons. That is the Wampanoag perspective." },
                     { t: "He wanted to move to England", r: "No, he needed allies against the powerful Narragansett." },
                     { t: "The Pilgrims had a giant army", r: "The Pilgrims were few and weak! Massasoit wanted allies against the Narragansett." } ] }
      ] }
  ]
});
