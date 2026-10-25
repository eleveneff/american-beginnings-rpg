GAME_CONTENT.sections.push({
  id: "s2",
  title: "Native Nations of North America",
  era: "About 1000 to 1500s",
  icon: "🪶",
  palette: { sky: "#ffd27a", sky2: "#74c2ff", ground: "#5fae4e", ground2: "#a7d86f", accent: "#2f7d4a", snow: false },
  scene: [
    "Morning mist rises over a river lined with cedar and pine. Smoke curls from the roofs of long bark-covered houses, and the smell of roasting corn drifts on the breeze.",
    "You are {name}. Traders have arrived in your village carrying goods from every direction: salmon oil from the far Northwest, buffalo robes from the Plains, turquoise from the Southwest. Each trader tells stories of how their people live. Listen closely: the council will question you tonight."
  ],
  lessons: [
    { topic: "regions", title: "Scroll 1: Land Shapes Life", video: null,
      videoIdea: "Low-poly N64-style flyover of North America's culture regions: Arctic ice, Northwest forests, Plains grass, Southwest desert, Eastern forests.",
      text: [
        "By the 1400s, millions of Native Americans lived in North America, speaking hundreds of languages. Historians group them into **culture regions**: areas where groups shared similar ways of life because of their environment.",
        "The land, climate, plants, and animals of each region shaped people's food, homes, clothing, and traditions.",
        "In the far north **Arctic**, the **Inuit** hunted seals, whales, and caribou. They traveled in **kayaks** and built snow houses (igloos) for shelter while hunting in winter.",
        "In the dry **Great Basin**, groups such as the Shoshone and Ute moved often, gathering seeds, nuts, and roots and hunting small animals."
      ] },
    { topic: "northwest", title: "Scroll 2: The Pacific Northwest", video: null,
      videoIdea: "Low-poly N64-style coastal village with cedar plank houses, tall carved totem poles, and canoes full of salmon.",
      text: [
        "Along the rainy Pacific Northwest coast, peoples such as the **Kwakiutl (Kwakwaka'wakw), Haida, and Tlingit** found plenty of food: **salmon**, shellfish, whales, and berries.",
        "Giant **cedar** trees gave them wood for large **plank houses**, ocean-going canoes, and tall carved **totem poles** that told family histories.",
        "At a **potlatch**, a family held a great feast and **gave away gifts** to show its wealth and status."
      ] },
    { topic: "plains", title: "Scroll 3: The Great Plains", video: null,
      videoIdea: "Low-poly N64-style grassland with a herd of buffalo and painted tepees.",
      text: [
        "On the wide grasslands of the **Great Plains**, peoples such as the **Lakota (Sioux), Cheyenne, and Comanche** depended on the **buffalo (bison)**. They used nearly every part: meat for food, hides for clothing and shelters, bones for tools.",
        "Many Plains peoples lived in **tepees**, cone-shaped homes of poles and buffalo hides that could be packed up and moved quickly.",
        "Later, **horses brought by the Spanish** spread north in the 1600s. Horses changed Plains life, making hunting and travel much faster."
      ] },
    { topic: "southwest", title: "Scroll 4: The Southwest", video: null,
      videoIdea: "Low-poly N64-style desert pueblo village of adobe, with a ladder into a round kiva.",
      text: [
        "In the dry **Southwest**, the **Hopi, Zuni, and other Pueblo peoples** farmed corn, beans, and squash using careful water-saving methods.",
        "They built homes from **adobe**: sun-dried bricks made of clay and straw. Many-family adobe buildings are called **pueblos**.",
        "A **kiva** is a round, often underground room used for religious ceremonies and meetings.",
        "Later arrivals to the region, the **Navajo (Diné) and Apache**, became skilled hunters and traders, and (after the Spanish arrived) sheep herders and weavers."
      ] },
    { topic: "iroquois", title: "Scroll 5: Eastern Woodlands and the Iroquois", video: null,
      videoIdea: "Low-poly N64-style forest village with longhouses and a council fire where leaders pass a wampum belt.",
      text: [
        "In the forests of the **Eastern Woodlands**, people hunted deer, fished, and farmed the Three Sisters. Many spoke **Algonquian** languages (such as the Wampanoag, Lenape, and Powhatan) or **Iroquoian** languages.",
        "The **Iroquois (Haudenosaunee)** lived in **longhouses**, long bark-covered homes shared by several related families.",
        "After years of fighting, five nations (the **Mohawk, Oneida, Onondaga, Cayuga, and Seneca**) formed the **Iroquois Confederacy**, later joined by the Tuscarora. Tradition says the **Peacemaker (Dekanawida) and Hiawatha** brought them the **Great Law of Peace**, which set up a Grand Council to settle disputes peacefully.",
        "Women held real power: **clan mothers** chose the male leaders (sachems) and could remove them.",
        "**Wampum**, beads made from shells, was woven into belts to record agreements and used in ceremonies and trade."
      ] },
    { topic: "southeast", title: "Scroll 6: The Southeast", video: null,
      videoIdea: "Low-poly N64-style Cherokee farming town with corn fields and a ceremonial square.",
      text: [
        "In the warm, fertile **Southeast**, peoples such as the **Cherokee, Creek (Muscogee), and Choctaw** lived in farming towns, growing corn, beans, and squash.",
        "Each summer, many Southeastern peoples held the **Green Corn Ceremony** to give thanks for the harvest and begin a new year."
      ] }
  ],
  gear: [
    { name: "Wampum Belt", icon: "🎗️", slot: "belt", color: "#5a3ea8", desc: "Purple and white shells telling a story of peace." },
    { name: "Cedar Paddle", icon: "🛶", slot: "back", color: "#a0522d", desc: "Carved for long canoe journeys." },
    { name: "Painted Buffalo Robe", icon: "🦬", slot: "cloak", color: "#9c6b3c", desc: "Warm hide decorated with painted stories." },
    { name: "Turquoise Pendant", icon: "💎", slot: "neck", color: "#2ec4b6", desc: "A trade treasure from the Southwest." }
  ],
  badge: { name: "Council Fire Badge", icon: "🔥", tunic: "#c0632b", desc: "Mastered Native Nations! Your tunic turns sunset orange." },
  questions: [
    { id: "s2q1", topic: "regions", type: "vocab", term: "culture region",
      choices: ["An area where groups of people share similar ways of life", "A city surrounded by walls", "A colony owned by a king", "A trade route across the ocean"],
      explain: "Environment shaped the shared ways of life in each region." },
    { id: "s2q2", topic: "regions", type: "mc", q: "How did the Inuit of the Arctic get much of their food?",
      choices: ["By hunting seals, whales, and caribou", "By growing large fields of corn", "By herding cattle", "By trading for wheat from Europe"],
      explain: "The frozen Arctic is too cold for farming." },
    { id: "s2q3", topic: "regions", type: "short", q: "What kind of small, covered boat did the Inuit use for hunting on the water?",
      accept: ["kayak", "kayaks"], display: "kayak", explain: "Kayaks were light boats made of a frame covered with animal skins." },
    { id: "s2q4", topic: "northwest", type: "mc", q: "Which resources were plentiful for peoples of the Pacific Northwest?",
      choices: ["Salmon and giant cedar trees", "Buffalo and tall grass", "Cactus and desert clay", "Gold and silver mines"],
      explain: "Fish and forests provided food, homes, and canoes." },
    { id: "s2q5", topic: "northwest", type: "vocab", term: "potlatch",
      choices: ["A ceremony where a family gave away gifts to show its wealth and status", "A cone-shaped home made of buffalo hide", "A round underground room for ceremonies", "A knotted cord used to keep records"],
      explain: "Giving gifts generously brought honor." },
    { id: "s2q6", topic: "northwest", type: "fill", q: "Pacific Northwest peoples carved tall totem poles and built plank houses from ____ trees.",
      accept: ["cedar", "cedars", "red cedar"], display: "cedar", explain: "Cedar wood is strong and resists rot." },
    { id: "s2q7", topic: "plains", type: "mc", q: "Which animal was the center of life for peoples of the Great Plains?",
      choices: ["The buffalo (bison)", "The salmon", "The seal", "The woolly mammoth"],
      explain: "Buffalo provided food, clothing, shelter, and tools." },
    { id: "s2q8", topic: "plains", type: "short", q: "What was the cone-shaped, movable home of many Plains peoples called?",
      accept: ["tepee", "teepee", "tipi", "tepees", "teepees", "tipis"], display: "tepee", explain: "Tepees could be taken down and moved quickly." },
    { id: "s2q9", topic: "plains", type: "mc", q: "How did horses arrive on the Great Plains?",
      choices: ["They were brought to the Americas by the Spanish and spread north", "They were tamed by the Inca and traded north", "They came across Beringia with the first people", "The English brought them to Jamestown"],
      explain: "Horses arrived with the Spanish and transformed Plains life in the 1600s and 1700s." },
    { id: "s2q10", topic: "southwest", type: "fill", q: "Pueblo peoples built homes from sun-dried bricks of clay and straw called ____.",
      accept: ["adobe", "adobes"], display: "adobe", explain: "Adobe keeps homes cool by day and warm at night." },
    { id: "s2q11", topic: "southwest", type: "vocab", term: "kiva",
      choices: ["A round, often underground room used for religious ceremonies", "A long bark-covered house", "A floating garden", "A canoe made from a cedar log"],
      explain: "Kivas were important gathering places for Pueblo peoples." },
    { id: "s2q12", topic: "southwest", type: "mc", q: "Which peoples are known as Pueblo peoples of the Southwest?",
      choices: ["The Hopi and Zuni", "The Mohawk and Seneca", "The Haida and Tlingit", "The Lakota and Cheyenne"],
      explain: "The Hopi and Zuni farmed and lived in adobe pueblos." },
    { id: "s2q13", topic: "iroquois", type: "mc", q: "Which five nations first formed the Iroquois Confederacy?",
      choices: ["Mohawk, Oneida, Onondaga, Cayuga, and Seneca", "Hopi, Zuni, Navajo, Apache, and Ute", "Cherokee, Creek, Choctaw, Seminole, and Chickasaw", "Haida, Tlingit, Kwakiutl, Chumash, and Inuit"],
      explain: "The Tuscarora joined later as the sixth nation." },
    { id: "s2q14", topic: "iroquois", type: "short", q: "What were the long, bark-covered homes shared by several Iroquois families called?",
      accept: ["longhouse", "longhouses", "long house", "long houses"], display: "longhouses", explain: "Several related families lived together in each longhouse." },
    { id: "s2q15", topic: "iroquois", type: "mc", q: "What was the purpose of the Great Law of Peace?",
      choices: ["To unite the Iroquois nations and settle disputes peacefully through a council", "To divide the Americas between Spain and Portugal", "To set up the first English colony", "To start a war with the Aztec"],
      explain: "Tradition credits the Peacemaker and Hiawatha with bringing the Great Law." },
    { id: "s2q16", topic: "iroquois", type: "mc", q: "What power did Iroquois clan mothers have?",
      choices: ["They chose the male leaders (sachems) and could remove them", "They commanded all warriors in battle", "They had no role in government", "They were chosen by Europeans"],
      explain: "Iroquois women held important political power." },
    { id: "s2q17", topic: "iroquois", type: "vocab", term: "wampum",
      choices: ["Shell beads used to record agreements and in ceremonies and trade", "Dried buffalo meat", "A Spanish silver coin", "A type of corn"],
      explain: "Wampum belts recorded important events and treaties." },
    { id: "s2q18", topic: "southeast", type: "mc", q: "The Green Corn Ceremony was held by peoples of which region?",
      choices: ["The Southeast, such as the Cherokee and Creek", "The Arctic, such as the Inuit", "The Pacific Northwest, such as the Haida", "The Great Basin, such as the Shoshone"],
      explain: "It celebrated the corn harvest and a fresh start." }
  ]
});
