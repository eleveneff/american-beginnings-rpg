/* v2 additions: Exploration */
GAME_CONTENT.extend("s3", {
  gear: [
    { key: "brass-compass", name: "Brass Compass", icon: "🧭", slot: "belt", art: "compass", color: "#d4a017", desc: "Always points north. Hangs from your belt." },
    { key: "astrolabe", name: "Astrolabe", icon: "🌐", slot: "offhand", art: "astrolabe", color: "#c9a227", desc: "Hold it up by its ring to measure a star's height." },
    { key: "sea-chart", name: "Sea Chart", icon: "🗺️", slot: "back", art: "map-tube", color: "#7a4a24", desc: "A rolled chart of the coastlines in a leather tube." },
    { key: "sounding-lead", name: "Sounding Lead & Line", icon: "⚓", slot: "hand", art: "sounding-lead", color: "#8a8f99", desc: "Drop the lead to measure the water's depth near shore.", oldNames: ["Spyglass"] },
    { key: "nav-cap", name: "Navigator's Cap", icon: "🧢", slot: "head", art: "nav-cap", color: "#1e3a6e", desc: "Worn by those who read the stars." }
  ],
  addText: {
    motives: [
      "Before Europe's ocean voyages, Muslim, Venetian, and Genoese merchants controlled much of the **spice trade** through the Mediterranean, so spices were very expensive. Finding a **sea route to Asia** would cut out the middlemen.",
      "The **printing press** (Johannes Gutenberg, around 1450) helped too: printed maps and travel books, like **Marco Polo's** stories of Asia, spread quickly and sparked curiosity."
    ],
    navigation: [
      "Navigators found **latitude** (how far north or south they were) by measuring the height of the **North Star (Polaris)** at night or the Sun at noon. To estimate distance they used **dead reckoning**: figuring position from **speed, time, and direction**. A ship's boy turned a half-hour **sandglass** to keep time.",
      "Portuguese ships worked their way down the coast of West Africa, building trading forts. In the **1440s** Portuguese traders began carrying captive Africans to Europe, the start of the **Atlantic trade in enslaved Africans**, one of history's greatest wrongs."
    ],
    columbus: [
      "Columbus sailed from **Palos, Spain, on August 3, 1492**, stopped in the **Canary Islands**, and then crossed the ocean for more than **five weeks**. The crew grew afraid; floating branches and flocks of birds gave them hope. On October 12 a lookout spotted land.",
      "The **Taíno** lived in villages led by chiefs called **caciques** and grew **cassava (yuca)**. On Christmas 1492 the **Santa María** ran aground off **Hispaniola**; Columbus left 39 men at a small fort called **La Navidad**.",
      "Within a few decades, the Taíno population collapsed from **disease, forced labor, and violence**. Today many people in Puerto Rico, Cuba, and the Dominican Republic honor their Taíno heritage."
    ],
    afterColumbus: [
      "In **1513**, **Vasco Núñez de Balboa** crossed the narrow land of **Panama** and became the first European to see the **Pacific Ocean** from the Americas.",
      "Magellan's fleet left Spain in **1519** with five ships and about 270 men. Magellan was killed in the **Philippines** in 1521 in a battle with the forces of **Lapulapu**, who is honored as a hero in the Philippines today. **Juan Sebastián Elcano** captained the last ship, the **Victoria**, home in **1522** with only 18 of the original crew."
    ],
    exchange: [
      "The Columbian Exchange changed the whole world: **potatoes** became a main food in **Ireland**, **tomatoes** went into Italian cooking, **chili peppers** spread to India and Asia, and **cassava** and **peanuts** became important in Africa.",
      "European planters built huge **sugar plantations** in the Caribbean and Brazil and forced **enslaved Africans** to do the brutal work. The Exchange also carried **bananas, coffee, and honeybees** to the Americas."
    ]
  },
  lessons: [
    { topic: "voices3", title: "Scroll 6: Voices from the Age of Exploration", video: null,
      text: [
        "**Primary sources** are records made by people who were there. Columbus's journal survives only as a summary copied by the priest **Bartolomé de las Casas**. In it, Columbus described the Taíno as gentle and generous, and also wrote that they **\"should be good servants.\"** From the very first days, he was thinking about using their labor.",
        "The Taíno did not use writing, so **their side of the story** comes from archaeology, from Spanish accounts (read carefully), and from the traditions of Taíno descendants. Historians compare many sources to understand **multiple perspectives**.",
        "**Antonio Pigafetta** kept a journal on Magellan's voyage. Crossing the Pacific, he wrote, the crew ate biscuit that was no longer biscuit but powder **\"swarming with worms,\"** and even chewed leather to survive.",
        "Europeans were not the only great explorers. From **1405 to 1433**, the Chinese admiral **Zheng He** led giant fleets of treasure ships to India, Arabia, and East Africa, decades before Columbus."
      ] }
  ],
  questions: [
    { id: "s3q21", topic: "motives", type: "mc", q: "How did the printing press (around 1450) help encourage exploration?",
      choices: ["Printed maps and travel books spread quickly and sparked curiosity", "It printed money to pay sailors", "It made ships faster", "It printed compasses"],
      explain: "Books like Marco Polo's travels became widely read." },
    { id: "s3q22", topic: "navigation", type: "vocab", term: "dead reckoning",
      choices: ["Estimating a ship's position from its speed, time, and direction", "A pirate's treasure map", "Measuring the depth of the sea", "Sailing only at night"],
      explain: "Columbus relied heavily on dead reckoning." },
    { id: "s3q23", topic: "navigation", type: "short", q: "At night, sailors measured the height of which star to find their latitude?",
      accept: ["north star", "polaris", "the north star", "pole star", "the pole star"], display: "The North Star (Polaris)", explain: "The higher Polaris appears, the farther north you are." },
    { id: "s3q24", topic: "navigation", type: "mc", q: "What terrible trade did Portuguese voyages along West Africa begin in the 1440s?",
      choices: ["The Atlantic trade in enslaved Africans", "The fur trade", "The tea trade", "The trade in printing presses"],
      explain: "This trade later grew enormously with plantations in the Americas." },
    { id: "s3q25", topic: "columbus", type: "mc", q: "What happened to the Santa María on Christmas 1492?",
      choices: ["It ran aground off Hispaniola", "It sailed to China", "It was captured by pirates", "It returned to Spain first"],
      explain: "Columbus used its timbers for the fort of La Navidad." },
    { id: "s3q26", topic: "columbus", type: "vocab", term: "cacique",
      choices: ["A Taíno chief", "A Spanish ship", "A kind of spice", "A navigation tool"],
      explain: "Caciques led Taíno villages and regions." },
    { id: "s3q27", topic: "afterColumbus", type: "mc", q: "In 1513, Balboa crossed Panama and became the first European to see what from the Americas?",
      choices: ["The Pacific Ocean", "The Mississippi River", "The Grand Canyon", "The Great Lakes"],
      explain: "Balboa claimed the Pacific for Spain." },
    { id: "s3q28", topic: "afterColumbus", type: "mc", q: "After Magellan was killed in the Philippines, who captained the Victoria home in 1522?",
      choices: ["Juan Sebastián Elcano", "Hernán Cortés", "John Cabot", "Henry Hudson"],
      explain: "Only 18 of about 270 men made it home on the Victoria." },
    { id: "s3q29", topic: "exchange", type: "mc", q: "Which crop from the Americas became a main food in Ireland?",
      choices: ["The potato", "Wheat", "Rice", "Sugarcane"],
      explain: "Potatoes came from the Andes and fed millions in Europe." },
    { id: "s3q30", topic: "exchange", type: "mc", q: "How were Caribbean sugar plantations connected to the slave trade?",
      choices: ["Planters forced enslaved Africans to do the brutal work", "Sugar was traded only for spices", "Plantations used no workers", "Sugar was grown only in Europe"],
      explain: "Sugar demand drove the growth of the Atlantic slave trade." },
    { id: "s3q31", topic: "voices3", type: "mc", q: "Who kept a journal of Magellan's voyage describing biscuits \"swarming with worms\"?",
      choices: ["Antonio Pigafetta", "Bartolomé de las Casas", "Prince Henry", "Amerigo Vespucci"],
      explain: "Pigafetta was one of the 18 survivors who returned on the Victoria." },
    { id: "s3q32", topic: "voices3", type: "mc", q: "Which Chinese admiral led huge treasure fleets to India and East Africa from 1405 to 1433?",
      choices: ["Zheng He", "Marco Polo", "Kublai Khan", "Vasco da Gama"],
      explain: "Zheng He's voyages came decades before Columbus." },
    { id: "s3q33", topic: "voices3", type: "mc", q: "Why do historians have few written sources from the Taíno point of view?",
      choices: ["The Taíno did not use writing, so we learn from archaeology, Spanish accounts, and descendants' traditions", "The Taíno wrote everything in Latin", "The Taíno never met Europeans", "All Taíno books are in a museum in China"],
      explain: "Comparing many sources helps us see multiple perspectives." },
    { id: "s3q34", topic: "voices3", type: "mc", q: "Columbus's journal survives as a summary copied by which priest?",
      choices: ["Bartolomé de las Casas", "Martin Luther", "Junípero Serra", "John Winthrop"],
      explain: "Las Casas later became a famous defender of Native peoples." }
  ],
  activities: [
    { id: "s3-caravel", type: "scenario", stage: "voyage", icon: "⛵", title: "Navigate the Caravel", topic: "navigation",
      intro: "It is September 1492. You are the ship's boy on the Niña, sailing west from the Canary Islands. Make the right navigation choices to reach land!",
      nodes: [
        { say: "Clouds hide the sun. Which instrument keeps the ship heading west?",
          choices: [ { t: "The magnetic compass", ok: true, r: "Right! The compass needle points north even under clouds, so west is easy to find." },
                     { t: "The astrolabe", r: "The astrolabe measures star height for latitude, not direction." },
                     { t: "A telescope", r: "Telescopes would not be invented until 1608!" } ] },
        { say: "Night falls. The pilot wants to check how far north you are. What do you measure?",
          choices: [ { t: "The height of the North Star with a quadrant", ok: true, r: "Yes! The North Star's height above the horizon tells your latitude." },
                     { t: "The color of the Moon", r: "The Moon's color tells you nothing about latitude. Measure Polaris!" },
                     { t: "The temperature of the water", r: "Water temperature will not give your latitude. Measure the North Star." } ] },
        { say: "You turn the half-hour sandglass. How does the pilot estimate today's distance?",
          choices: [ { t: "Dead reckoning: speed × time in the compass direction", ok: true, r: "Exactly. Columbus estimated distance this way every day." },
                     { t: "Ask a passing ship", r: "There are no other ships out here! Use dead reckoning." },
                     { t: "Count the waves", r: "Waves are not a measure of distance. Use speed and time." } ] },
        { say: "The wind shifts and blows right at the bow. What can a caravel do?",
          choices: [ { t: "Use its triangular lateen sails to zig-zag (tack) against the wind", ok: true, r: "Yes! Lateen sails let caravels sail closer to the wind than older ships." },
                     { t: "Row the whole ship", r: "Caravels are sailing ships with small crews. Tack with the lateen sails." },
                     { t: "Wait for months", r: "Food would run out! Tack with the lateen sails." } ] },
        { say: "After weeks at sea, the crew is afraid and wants to turn back. What gives them hope?",
          choices: [ { t: "Floating branches and flocks of birds are signs land is near", ok: true, r: "On October 11 sailors saw a branch with flowers and many birds. Land was close." },
                     { t: "The water turned into chocolate", r: "Ha! Signs of land were birds and floating branches." },
                     { t: "They saw a lighthouse", r: "There were no lighthouses there. Birds and branches gave hope." } ] },
        { say: "\"Tierra! Tierra!\" It is October 12, 1492. Who already lives on this island in the Bahamas?",
          choices: [ { t: "The Taíno people", ok: true, r: "Yes. The Taíno had lived in the Caribbean for centuries. Columbus had not found Asia, and the Taíno's world was about to change forever." },
                     { t: "No one", r: "Not true! The Taíno people lived there." },
                     { t: "Chinese merchants", r: "Columbus hoped so, but this was not Asia. The Taíno lived there." } ] }
      ] },
    { id: "s3-exchange", type: "sort", icon: "🔄", title: "Columbian Exchange Sort", topic: "exchange",
      intro: "Which way did each item travel across the Atlantic after 1492? Sort them!",
      bins: [ { id: "west", label: "Americas → Europe, Africa, Asia", icon: "⬅️🌎" }, { id: "east", label: "Europe, Africa, Asia → Americas", icon: "🌍➡️" } ],
      items: [
        { t: "🌽 Corn (maize)", bin: "west", fact: "Maize became a staple food in Africa and Europe." },
        { t: "🥔 Potatoes", bin: "west", fact: "Potatoes came from the Andes." },
        { t: "🍅 Tomatoes", bin: "west", fact: "Italian tomato sauce came after 1492!" },
        { t: "🍫 Cacao", bin: "west", fact: "Chocolate drinks became a craze in Europe." },
        { t: "🌶️ Chili peppers", bin: "west", fact: "Chilies spread to India, Thailand, and Korea." },
        { t: "🦃 Turkeys", bin: "west", fact: "Turkeys were domesticated in Mexico." },
        { t: "🥜 Peanuts", bin: "west", fact: "Peanuts came from South America." },
        { t: "🐎 Horses", bin: "east", fact: "Horses transformed life on the Great Plains." },
        { t: "🐄 Cattle", bin: "east", fact: "Cattle ranching spread through New Spain." },
        { t: "🐖 Pigs", bin: "east", fact: "Pigs ran wild and multiplied quickly." },
        { t: "🌾 Wheat", bin: "east", fact: "Wheat became a major crop in the Americas." },
        { t: "🎋 Sugarcane", bin: "east", fact: "Sugar plantations drove the slave trade." },
        { t: "🦠 Smallpox", bin: "east", fact: "Native Americans had no immunity. Millions died." },
        { t: "🐝 Honeybees", bin: "east", fact: "Some Native people called honeybees \"the white man's flies.\"" },
        { t: "🍌 Bananas", bin: "east", fact: "Bananas came from Asia by way of Africa." }
      ] },
    { id: "s3-pigafetta", type: "dialogue", icon: "🌏", title: "Talk with Antonio Pigafetta", topic: "afterColumbus",
      who: { name: "Antonio Pigafetta", role: "chronicler of Magellan's voyage, 1522", portrait: "🧔🏻", look: { gender: "boy", tunic: "#7a1f2b", equip: { head: { art: "wool-cap", color: "#b3262b" }, cloak: { art: "wool-cape", color: "#2b4a8a" }, offhand: { art: "almanack", color: "#5b3a1a" } } } },
      lines: [
        { say: "Greetings, young sailor! I have just returned to Spain in 1522 after sailing all the way around the world. Whose expedition was I on?",
          choices: [ { t: "Ferdinand Magellan's", ok: true, r: "Yes. Magellan, a Portuguese captain sailing for Spain, led us out in 1519 with five ships." },
                     { t: "Christopher Columbus's", r: "Columbus sailed almost 30 years earlier. I sailed with Magellan." },
                     { t: "Henry Hudson's", r: "Hudson sailed about 90 years later. I sailed with Magellan." } ] },
        { say: "At the tip of South America we found a twisting passage between the oceans. What is it called today?",
          choices: [ { t: "The Strait of Magellan", ok: true, r: "Correct. It took us 38 days to get through its cold, winding channels." },
                     { t: "The Panama Canal", r: "That canal was not built until 1914! We used the Strait of Magellan." },
                     { t: "The Bering Strait", r: "That strait is far to the north. We sailed the Strait of Magellan." } ] },
        { say: "Then we crossed an ocean so calm that Magellan named it 'peaceful.' What was crossing it like?",
          choices: [ { t: "Months without fresh food. We ate wormy biscuit and even leather", ok: true, r: "It was terrible. Many men died of hunger and scurvy. I wrote it all in my journal." },
                     { t: "Short and easy, just three days", r: "I wish! The Pacific was far bigger than anyone expected. It took more than three months." },
                     { t: "We stopped at many restaurants", r: "Ha! We nearly starved. We ate wormy biscuit and leather." } ] },
        { say: "In the Philippines, Magellan was killed in 1521. Who led the people who defeated him at Mactan?",
          choices: [ { t: "Lapulapu", ok: true, r: "Yes. Lapulapu defended his island, and Filipinos honor him as a hero today. Two perspectives on one battle!" },
                     { t: "Montezuma", r: "Montezuma ruled the Aztec in Mexico. At Mactan it was Lapulapu." },
                     { t: "Queen Isabella", r: "Isabella was queen of Spain and had died in 1504. It was Lapulapu." } ] },
        { say: "Of about 270 men, only 18 of us came home on the Victoria with Captain Elcano. What did our voyage prove?",
          choices: [ { t: "Ships could sail around the world, and Earth is much bigger than Columbus thought", ok: true, r: "Exactly! Our voyage was the first circumnavigation of the globe." },
                     { t: "That the Earth is flat", r: "Educated Europeans already knew Earth is round. We proved it could be sailed around, and that it is huge." },
                     { t: "That Asia was close to Spain", r: "The opposite! Asia was very far by the western route." } ] }
      ] }
  ]
});
