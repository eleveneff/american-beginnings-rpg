/* v2 additions: Spain, France, and the Netherlands */
GAME_CONTENT.extend("s4", {
  gear: [
    { key: "beaver-cap", name: "Beaver-Fur Cap", icon: "🦫", slot: "head", art: "beaver-cap", color: "#6b4226", desc: "Warm, and the height of fashion in Paris." },
    { key: "explorer-journal", name: "Explorer's Journal", icon: "📔", slot: "belt", art: "journal", color: "#7a3b2e", desc: "Full of sketches and notes. Clipped to your belt." },
    { key: "lantern", name: "Traveler's Lantern", icon: "🏮", slot: "offhand", art: "lantern", color: "#ffb703", desc: "Lights the way on dark river nights." },
    { key: "satchel", name: "Mapmaker's Satchel", icon: "👜", slot: "back", art: "satchel", color: "#8d6e4a", desc: "Its strap crosses your chest. Holds quills, ink, and rolled maps." }
  ],
  addText: {
    conquest: [
      "Tenochtitlán may have held **200,000 people**, bigger than any city in Spain. In June 1520 the Aztec drove the Spanish out in a night of fighting the Spanish called **La Noche Triste** (\"the Sad Night\"). Then a **smallpox epidemic** swept the city, killing many people, including the new emperor **Cuitláhuac**. After a long siege, Tenochtitlán fell on **August 13, 1521**.",
      "When **Francisco Pizarro** arrived in 1532, the Inca Empire had just been weakened by smallpox and a **civil war** between two brothers, **Atahualpa and Huáscar**. Pizarro captured Atahualpa at **Cajamarca**. Atahualpa filled a room with gold and silver to win his freedom, but the Spanish executed him in **1533**."
    ],
    spanishNA: [
      "After a shipwreck in 1528, **Álvar Núñez Cabeza de Vaca** and a few survivors, including an enslaved African man named **Estevanico**, spent about **eight years** walking across Texas and northern Mexico, living among Native peoples.",
      "In **1598**, **Juan de Oñate** led settlers into New Mexico and ruled harshly. Spanish missions were later built in **Texas**, such as **San Antonio de Valero (the Alamo), founded in 1718**. A long trade road called **El Camino Real** linked Mexico City to Santa Fe."
    ],
    spanishLife: [
      "Huge **silver mines** at **Potosí** (in present-day Bolivia) and **Zacatecas** (Mexico) made Spain the richest power in Europe. Native workers and enslaved Africans did the dangerous mining work.",
      "In **1542**, Spain's **New Laws** tried to limit the encomienda system and protect Native people, partly because of Las Casas's protests. Many colonists ignored or fought the laws.",
      "After the Pueblo Revolt of 1680, the Spanish returned in **1692** under **Diego de Vargas**. Afterward, Spanish rule in New Mexico became somewhat less harsh toward Pueblo religion."
    ],
    france: [
      "The name **Canada** comes from the Iroquoian word **kanata**, meaning \"village,\" which Cartier heard in 1535. Young French traders called **coureurs de bois** (\"runners of the woods\") paddled deep into the interior, learned Native languages, and often married into Native families.",
      "In 1609 Champlain joined his **Huron (Wendat) and Algonquin allies** in a battle against the **Haudenosaunee**, which made the Haudenosaunee long-time enemies of New France. By the 1750s New France had only about **70,000** colonists, compared with more than **a million** people in the English colonies."
    ],
    dutch: [
      "The **Dutch West India Company** was created in **1621**. In 1624 it built **Fort Orange** (today's **Albany**) to trade for furs with the **Mohawk**, and soon after founded New Amsterdam. Lenape and Dutch probably understood the 1626 Manhattan deal differently: the Lenape may have thought they were agreeing to **share** the land, not give it up forever.",
      "New Amsterdam's settlers built a defensive **wall** in 1653; the street beside it became **Wall Street**. Enslaved Africans were brought there from **1626**, and some later won a limited \"half-freedom.\" In **1657**, residents of Flushing signed the **Flushing Remonstrance**, protesting Governor Stuyvesant's persecution of Quakers, an early plea for religious freedom.",
      "Sweden also had a colony: **New Sweden** on the Delaware River (1638), which the Dutch captured in **1655**."
    ]
  },
  lessons: [
    { topic: "voices4", title: "Scroll 6: Voices and Perspectives", video: null,
      text: [
        "The **Florentine Codex**, made in the 1570s by the friar **Bernardino de Sahagún** working with **Nahua (Aztec) scholars**, tells the story of the conquest from the Aztec point of view, in the Nahuatl language with pictures.",
        "People see **Malintzin (La Malinche)** in different ways. Some later Mexicans called her a traitor; many historians today see an enslaved young woman who survived by her intelligence and became a bridge between two worlds.",
        "In his book **A Short Account of the Destruction of the Indies** (written in 1542), **Las Casas** described Spanish cruelty to persuade the king to protect Native people. Sadly, he once suggested using enslaved Africans instead of Native workers, an idea he later deeply regretted.",
        "For **Popé** and the Pueblo people, the 1680 revolt was a fight to protect their own religion and freedom. Spanish accounts called it a rebellion. Historians use both perspectives."
      ] }
  ],
  questions: [
    { id: "s4q20", topic: "conquest", type: "mc", q: "What disaster struck Tenochtitlán in 1520, weakening the Aztec before the final siege?",
      choices: ["A smallpox epidemic", "A volcanic eruption", "A flood from the ocean", "A famous snowstorm"],
      explain: "Smallpox killed many people, including the emperor Cuitláhuac." },
    { id: "s4q21", topic: "conquest", type: "mc", q: "What weakened the Inca Empire just before Pizarro arrived in 1532?",
      choices: ["Smallpox and a civil war between Atahualpa and Huáscar", "An invasion by the Aztec", "A war with France", "A great flood"],
      explain: "The empire was divided and sick when the Spanish came." },
    { id: "s4q22", topic: "spanishNA", type: "mc", q: "Who survived a shipwreck in 1528 and walked across Texas and northern Mexico for about eight years?",
      choices: ["Álvar Núñez Cabeza de Vaca", "Samuel de Champlain", "Henry Hudson", "Peter Minuit"],
      explain: "Cabeza de Vaca traveled with Estevanico and two other survivors." },
    { id: "s4q23", topic: "spanishLife", type: "mc", q: "What made Spain the richest power in Europe in the 1500s?",
      choices: ["Silver from mines like Potosí and Zacatecas", "Beaver furs", "Tobacco from Virginia", "Tea from China"],
      explain: "Native and enslaved African workers did the dangerous mining." },
    { id: "s4q24", topic: "spanishLife", type: "mc", q: "What were Spain's New Laws of 1542 meant to do?",
      choices: ["Limit the encomienda system and protect Native people", "Start the fur trade", "Create the House of Burgesses", "Ban horses in New Spain"],
      explain: "Las Casas's protests helped bring the New Laws, though many colonists resisted them." },
    { id: "s4q25", topic: "france", type: "vocab", term: "coureurs de bois",
      choices: ["French fur traders who traveled deep into the forests (\"runners of the woods\")", "Spanish soldiers", "Dutch farmers", "English judges"],
      explain: "They learned Native languages and traded for beaver furs." },
    { id: "s4q26", topic: "france", type: "mc", q: "The name \"Canada\" comes from an Iroquoian word, kanata. What does it mean?",
      choices: ["Village", "Beaver", "Big river", "Snow"],
      explain: "Cartier heard the word in 1535." },
    { id: "s4q27", topic: "france", type: "mc", q: "By the 1750s, how did New France's population compare with the English colonies?",
      choices: ["New France had far fewer people, about 70,000 compared with over a million", "New France had more people", "They were exactly the same", "New France had no settlers at all"],
      explain: "Few French settlers came; the fur trade needed few colonists." },
    { id: "s4q28", topic: "dutch", type: "mc", q: "How did Wall Street in New York City get its name?",
      choices: ["From a defensive wall the Dutch built in 1653", "From a famous banker named Wall", "From a wall of gold", "From the Great Wall of China"],
      explain: "The wall protected the north edge of New Amsterdam." },
    { id: "s4q29", topic: "dutch", type: "mc", q: "What was the Flushing Remonstrance of 1657?",
      choices: ["A protest against Governor Stuyvesant's persecution of Quakers", "A treaty with Spain", "A list of fur prices", "A map of the Hudson River"],
      explain: "It was an early plea for religious freedom in America." },
    { id: "s4q30", topic: "dutch", type: "short", q: "The Dutch trading post of Fort Orange later became which New York city?",
      accept: ["albany", "albany new york", "albany, new york", "albany ny"], display: "Albany", explain: "Fort Orange traded for furs with the Mohawk." },
    { id: "s4q31", topic: "voices4", type: "mc", q: "Which source tells the story of the Spanish conquest from the Aztec (Nahua) point of view?",
      choices: ["The Florentine Codex", "The Mayflower Compact", "Poor Richard's Almanack", "The Magna Carta"],
      explain: "Nahua scholars helped create it in the 1570s." },
    { id: "s4q32", topic: "dutch", type: "mc", q: "Which European colony on the Delaware River did the Dutch capture in 1655?",
      choices: ["New Sweden", "New France", "New Spain", "Plymouth"],
      explain: "New Sweden was founded in 1638." }
  ],
  activities: [
    { id: "s4-map", type: "map", map: "claims", icon: "🗺️", title: "Map the Three Empires", topic: "france",
      intro: "Place each town or clue in the right empire: New Spain, New France, or New Netherland. Drag it onto the map, or tap it and then tap a region.",
      bins: [ { id: "spain", label: "New Spain" }, { id: "france", label: "New France" }, { id: "dutch", label: "New Netherland" } ],
      items: [
        { t: "St. Augustine (1565)", bin: "spain", fact: "The oldest continuously occupied European-founded city in the U.S." },
        { t: "Santa Fe (about 1610)", bin: "spain", fact: "The capital of Spanish New Mexico." },
        { t: "Mexico City", bin: "spain", fact: "Built on the ruins of Tenochtitlán." },
        { t: "Missions and presidios", bin: "spain", fact: "Spanish religious missions and forts." },
        { t: "Quebec (1608)", bin: "france", fact: "Founded by Samuel de Champlain." },
        { t: "Montreal (1642)", bin: "france", fact: "A fur-trading center on the St. Lawrence River." },
        { t: "New Orleans (1718)", bin: "france", fact: "Near the mouth of the Mississippi River." },
        { t: "Coureurs de bois", bin: "france", fact: "French fur traders in the forests." },
        { t: "New Amsterdam", bin: "dutch", fact: "Later renamed New York City." },
        { t: "Fort Orange", bin: "dutch", fact: "Today's Albany." },
        { t: "Dutch West India Company", bin: "dutch", fact: "The company that ran New Netherland." }
      ] },
    { id: "s4-goals", type: "sort", icon: "⚖️", title: "What Did Each Empire Want?", topic: "spanishLife",
      intro: "Spain, France, and the Netherlands had different goals in America. Sort each clue.",
      bins: [ { id: "spain", label: "Spain", icon: "🇪🇸" }, { id: "france", label: "France", icon: "⚜️" }, { id: "dutch", label: "Netherlands", icon: "🌷" } ],
      items: [
        { t: "Gold and silver mines", bin: "spain", fact: "Silver from Potosí and Zacatecas made Spain rich." },
        { t: "Encomienda labor system", bin: "spain", fact: "Colonists demanded Native labor or tribute." },
        { t: "Conquistadors conquer empires", bin: "spain", fact: "Cortés and Pizarro toppled the Aztec and Inca." },
        { t: "Beaver furs for European hats", bin: "france", fact: "Beaver felt hats were the fashion." },
        { t: "Jesuit missionaries living among the Huron", bin: "france", fact: "Jesuits wrote reports called the Jesuit Relations." },
        { t: "Alliances with Huron and Algonquin", bin: "france", fact: "Trade partnerships depended on alliances." },
        { t: "A trading company seeking profits", bin: "dutch", fact: "The Dutch West India Company ran New Netherland." },
        { t: "Wampum used as money", bin: "dutch", fact: "New Netherland even set official values for wampum." },
        { t: "A busy, diverse port on Manhattan", bin: "dutch", fact: "Many languages were spoken in New Amsterdam." }
      ] },
    { id: "s4-champlain", type: "dialogue", icon: "⚜️", title: "Talk with Samuel de Champlain", topic: "france",
      who: { name: "Samuel de Champlain", role: "founder of Quebec, about 1610", portrait: "🧔🏻", look: { gender: "boy", tunic: "#8a3fa0", equip: { head: { art: "beaver-hat", color: "#3a2a1e" }, cloak: { art: "wool-cape", color: "#2b2b4a" }, belt: { art: "journal", color: "#7a3b2e" } } } },
      lines: [
        { say: "Bonjour! I am Champlain. In 1608 I built a habitation on the St. Lawrence River. What is it called?",
          choices: [ { t: "Quebec", ok: true, r: "Oui! Quebec is the heart of New France." },
                     { t: "New Orleans", r: "New Orleans will not be founded until 1718, far to the south. I founded Quebec." },
                     { t: "Jamestown", r: "Jamestown is an English fort in Virginia. Mine is Quebec." } ] },
        { say: "What is the main business that keeps New France alive?",
          choices: [ { t: "The fur trade, especially beaver pelts", ok: true, r: "Exactly. In Europe, beaver fur is made into fashionable felt hats." },
                     { t: "Gold mining", r: "We have found no gold here! Furs are our treasure." },
                     { t: "Growing tobacco", r: "That is what the English do in Virginia. We trade furs." } ] },
        { say: "Why do we French need Native allies like the Huron (Wendat)?",
          choices: [ { t: "They trap and trade the furs, and know the rivers and land", ok: true, r: "Yes. Our colony depends on trade partnerships and alliances." },
                     { t: "We do not need anyone", r: "We would starve and get lost! Our Native partners are essential." },
                     { t: "To help us find the Seven Cities of Gold", r: "That was a Spanish legend. We need partners for the fur trade." } ] },
        { say: "Like Cartier before me, I hope to find a water route through America to Asia. What is it called?",
          choices: [ { t: "The Northwest Passage", ok: true, r: "Yes, but no one has found an easy one. Explorers kept searching for centuries." },
                     { t: "The Silk Road", r: "The Silk Road is a land route across Asia. We seek the Northwest Passage." },
                     { t: "The Oregon Trail", r: "That trail comes much later. We seek the Northwest Passage." } ] },
        { say: "Few French farmers want to come here. What does that mean for New France?",
          choices: [ { t: "It stays small in population, with far fewer people than the English colonies", ok: true, r: "C'est vrai. By the 1750s, about 70,000 French colonists faced more than a million English colonists." },
                     { t: "It becomes the biggest colony", r: "Sadly, no. New France stayed small." },
                     { t: "Everyone moves to Paris", r: "Ha! But yes, few settlers came, so New France stayed small." } ] }
      ] }
  ]
});
