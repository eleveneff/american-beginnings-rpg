/* v2 additions: Native Nations */
GAME_CONTENT.extend("s2", {
  gear: [
    { key: "wampum-belt", name: "Wampum Belt", icon: "🎗️", slot: "belt", art: "wampum-belt", color: "#5a3ea8", desc: "Purple and white shell beads telling a story of peace." },
    { key: "cedar-paddle", name: "Cedar Paddle", icon: "🛶", slot: "back", art: "paddle", color: "#a0522d", desc: "Carved for long canoe journeys. Slung across your back." },
    { key: "buffalo-robe", name: "Painted Buffalo Robe", icon: "🦬", slot: "cloak", art: "buffalo-robe", color: "#9c6b3c", desc: "Warm hide decorated with painted stories." },
    { key: "turquoise", name: "Turquoise Pendant", icon: "💎", slot: "neck", art: "turquoise", color: "#2ec4b6", desc: "A trade treasure from the Southwest." }
  ],
  addText: {
    regions: [
      "Historians estimate that **millions of people** lived north of Mexico before 1492, speaking **hundreds of languages**. Estimates vary widely because the evidence is incomplete.",
      "Other culture regions include **California**, where the **Chumash** built plank canoes called **tomols** and gathered **acorns**, and the **Great Basin** and **Plateau**. Long **trade networks** moved copper, shells, obsidian, and turquoise across the continent."
    ],
    northwest: [
      "The **Haida** carved huge ocean-going canoes from **single red cedar logs**, some more than 50 feet long, to fish, trade, and travel along the coast."
    ],
    plains: [
      "Before horses arrived, Plains people used **dogs** to pull a **travois**, a frame of two poles, to carry belongings. Hunters sometimes drove bison herds over cliffs at **buffalo jumps**, such as Head-Smashed-In Buffalo Jump in Alberta, Canada.",
      "Not all Plains peoples were nomads. The **Mandan** and **Hidatsa** were farmers who lived in round **earth lodges** in villages along the **Missouri River**."
    ],
    southwest: [
      "The **Hopi** village of **Oraibi**, founded around 1100, is one of the **oldest continuously lived-in towns** in the United States. Hopi farmers used **dry farming**, planting corn deep in the sandy soil to reach moisture.",
      "The **Navajo (Diné)** lived in round homes called **hogans**, with the doorway facing east toward the rising sun."
    ],
    iroquois: [
      "**Haudenosaunee** means **\"People of the Longhouse.\"** Each nation had a role: the **Mohawk** were Keepers of the Eastern Door, the **Seneca** Keepers of the Western Door, and the **Onondaga** the **Firekeepers** who hosted the Grand Council.",
      "The **Great White Pine**, the Tree of Peace, is a symbol of the Confederacy; the nations \"buried their weapons\" beneath it. Historians debate when the Confederacy formed: many say between **1450 and 1600**, while some Haudenosaunee and scholars point to **1142**."
    ],
    southeast: [
      "Southeastern towns often centered on a **council house** or a **square ground** used for meetings and ceremonies. Many Southeastern peoples played **stickball**, a rough team game nicknamed **\"the little brother of war.\"**"
    ]
  },
  questions: [
    { id: "s2q19", topic: "regions", type: "mc", q: "The Chumash of California built plank canoes called tomols. Which food did they gather in large amounts?",
      choices: ["Acorns", "Buffalo", "Rice", "Wheat"],
      explain: "Acorns were ground and washed to make a nutritious meal." },
    { id: "s2q20", topic: "plains", type: "vocab", term: "travois",
      choices: ["A frame of poles pulled by a dog (later a horse) to carry belongings", "A cedar canoe", "A clay pot", "A type of shell money"],
      explain: "The travois let Plains families move camp before and after horses." },
    { id: "s2q21", topic: "plains", type: "mc", q: "Before horses, how did some Plains hunters hunt large numbers of bison?",
      choices: ["They drove herds over cliffs at buffalo jumps", "They used rifles", "They raised bison on farms", "They bought them from the Spanish"],
      explain: "Buffalo jumps like Head-Smashed-In in Alberta were used for thousands of years." },
    { id: "s2q22", topic: "plains", type: "mc", q: "Which Plains people were farmers who lived in earth lodges along the Missouri River?",
      choices: ["The Mandan", "The Inuit", "The Haida", "The Aztec"],
      explain: "The Mandan grew corn, beans, and squash in river villages." },
    { id: "s2q23", topic: "southwest", type: "mc", q: "Why is the Hopi village of Oraibi famous?",
      choices: ["It is one of the oldest continuously lived-in towns in the United States", "It was the Aztec capital", "It is made of ice", "It was founded by Columbus"],
      explain: "People have lived at Oraibi since about 1100." },
    { id: "s2q24", topic: "southwest", type: "short", q: "What is the name of the traditional round Navajo (Diné) home with its door facing east?",
      accept: ["hogan", "hogans"], display: "Hogan", explain: "The hogan's east-facing door greets the rising sun." },
    { id: "s2q25", topic: "iroquois", type: "mc", q: "What does the name \"Haudenosaunee\" mean?",
      choices: ["People of the Longhouse", "People of the Plains", "Children of the Sun", "Keepers of the Ocean"],
      explain: "The longhouse was a symbol of the whole Confederacy." },
    { id: "s2q26", topic: "iroquois", type: "mc", q: "Which nation were the \"Firekeepers\" who hosted the Grand Council of the Haudenosaunee?",
      choices: ["Onondaga", "Mohawk", "Seneca", "Cherokee"],
      explain: "The Onondaga sat at the center. The Mohawk guarded the east and the Seneca the west." },
    { id: "s2q27", topic: "southeast", type: "mc", q: "Which Southeastern team game was nicknamed \"the little brother of war\"?",
      choices: ["Stickball", "Baseball", "Chess", "Soccer"],
      explain: "Stickball games could settle disputes between towns." },
    { id: "s2q28", topic: "northwest", type: "mc", q: "How did the Haida make their great ocean-going canoes?",
      choices: ["By carving each one from a single huge cedar log", "By sewing buffalo hides together", "By weaving reeds", "By buying them from European traders"],
      explain: "Some Haida canoes were more than 50 feet long." }
  ],
  activities: [
    { id: "s2-map", type: "map", map: "regions", icon: "🗺️", title: "Map the Native Nations", topic: "regions",
      intro: "Place each nation in its homeland's culture region. Drag a nation onto the map, or tap it and then tap a region.",
      bins: [ { id: "arctic", label: "Arctic" }, { id: "nw", label: "Northwest Coast" }, { id: "plains", label: "Great Plains" },
              { id: "sw", label: "Southwest" }, { id: "ew", label: "Eastern Woodlands" }, { id: "se", label: "Southeast" } ],
      items: [
        { t: "Inuit", bin: "arctic", fact: "Inuit hunted seals and whales by kayak and built snow houses for winter hunts." },
        { t: "Haida", bin: "nw", fact: "The Haida carved cedar canoes and totem poles." },
        { t: "Tlingit", bin: "nw", fact: "The Tlingit fished for salmon and held potlatches." },
        { t: "Lakota", bin: "plains", fact: "The Lakota followed the bison and lived in tepees." },
        { t: "Cheyenne", bin: "plains", fact: "The Cheyenne became famous horse-riding bison hunters on the Plains." },
        { t: "Hopi", bin: "sw", fact: "The Hopi built adobe pueblos and dry-farmed corn." },
        { t: "Navajo (Diné)", bin: "sw", fact: "The Diné lived in hogans and later became known for weaving and sheep herding." },
        { t: "Haudenosaunee", bin: "ew", fact: "The Haudenosaunee lived in longhouses in present-day New York." },
        { t: "Wampanoag", bin: "ew", fact: "The Wampanoag lived in present-day Massachusetts and Rhode Island." },
        { t: "Cherokee", bin: "se", fact: "The Cherokee lived in towns in the southern Appalachian Mountains." },
        { t: "Muscogee (Creek)", bin: "se", fact: "The Muscogee held the Green Corn Ceremony each summer." }
      ] },
    { id: "s2-clues", type: "sort", icon: "🏕️", title: "Culture Clues Sort", topic: "regions",
      intro: "Each clue belongs to one culture region. Sort the homes, tools, and traditions!",
      bins: [ { id: "arctic", label: "Arctic", icon: "❄️" }, { id: "nw", label: "Northwest Coast", icon: "🌲" }, { id: "plains", label: "Great Plains", icon: "🦬" },
              { id: "sw", label: "Southwest", icon: "🌵" }, { id: "ew", label: "Eastern Woodlands", icon: "🍁" }, { id: "se", label: "Southeast", icon: "🌾" } ],
      items: [
        { t: "Kayak and snow house", bin: "arctic", fact: "Arctic peoples used every part of seals and whales." },
        { t: "Cedar plank house and totem pole", bin: "nw", fact: "Totem poles told family histories." },
        { t: "Potlatch gift-giving feast", bin: "nw", fact: "Potlatches showed a family's wealth and rank." },
        { t: "Tepee and travois", bin: "plains", fact: "Tepees could be taken down and moved quickly." },
        { t: "Adobe pueblo and kiva", bin: "sw", fact: "Kivas were underground rooms for ceremonies." },
        { t: "Longhouse and wampum", bin: "ew", fact: "Wampum belts recorded agreements and history." },
        { t: "Green Corn Ceremony", bin: "se", fact: "A summer festival of thanks and new beginnings." },
        { t: "Stickball, \"the little brother of war\"", bin: "se", fact: "Towns sometimes settled disputes with stickball." }
      ] },
    { id: "s2-clanmother", type: "dialogue", icon: "🔥", title: "Council with a Clan Mother", topic: "iroquois",
      who: { name: "Clan Mother of the Turtle Clan", role: "a Mohawk clan mother of the Haudenosaunee", portrait: "👵🏽", look: { gender: "girl", tunic: "#3f6f5a", equip: { cloak: { art: "buffalo-robe", color: "#7a5230" }, belt: { art: "wampum-belt", color: "#5a3ea8" } } } },
      lines: [
        { say: "Shé:kon! (That is how we Mohawk say hello.) Welcome to our longhouse. Who lives in a longhouse like this one?",
          choices: [ { t: "Several related families of the same clan, each with its own fire", ok: true, r: "Yes. Families are related through the mothers, and each family shares a cooking fire with the family across from it." },
                     { t: "Only the chief", r: "No, a longhouse holds many related families of one clan, sometimes dozens of people." },
                     { t: "Soldiers from France", r: "No, our longhouses are homes for our clan families." } ] },
        { say: "Long ago, our nations fought one another. Who brought us the Great Law of Peace?",
          choices: [ { t: "The Peacemaker and Hiawatha", ok: true, r: "Yes. The Peacemaker's message, carried with Hiawatha, united our nations." },
                     { t: "Christopher Columbus", r: "No, Columbus never came here. Our peace came from the Peacemaker and Hiawatha." },
                     { t: "The King of England", r: "No, our Great Law is our own. The Peacemaker and Hiawatha brought it." } ] },
        { say: "Can you name the first five nations of our Confederacy?",
          choices: [ { t: "Mohawk, Oneida, Onondaga, Cayuga, and Seneca", ok: true, r: "Wonderful! Around 1722 the Tuscarora joined, making six nations." },
                     { t: "Aztec, Maya, Inca, Olmec, and Hopi", r: "Those peoples live far to the south and west. Our nations are Mohawk, Oneida, Onondaga, Cayuga, and Seneca." },
                     { t: "Lakota, Cheyenne, Comanche, Crow, and Pawnee", r: "Those are Plains nations. Ours are Mohawk, Oneida, Onondaga, Cayuga, and Seneca." } ] },
        { say: "As clan mother, what important duty do I have?",
          choices: [ { t: "I choose our chiefs (sachems) and can remove them if they fail the people", ok: true, r: "Yes. Women hold real political power in our nations." },
                     { t: "I am not allowed to speak in council matters", r: "Not so! Clan mothers choose the chiefs and can remove them." },
                     { t: "I only make baskets", r: "I do many things, but my special duty is choosing and advising chiefs." } ] },
        { say: "When we make an agreement, how do we remember it for generations?",
          choices: [ { t: "We weave wampum belts that record it", ok: true, r: "Yes. Wampum belts of purple and white shell beads hold our promises and history." },
                     { t: "We write it in a printed book", r: "We do not use printing. Wampum belts and the memory of speakers record our agreements." },
                     { t: "We forget it after one year", r: "Never! Wampum belts keep our agreements alive." } ] }
      ] }
  ]
});
