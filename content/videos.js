/* v2: every lesson video is one entry here. Each entry has:
   - cueTimes (optional): start second for each cue in the narrated clip (or in the
     narration track for a placeholder fact tour).
   - audio (optional): narration track for a placeholder fact tour.
   - cues: 2-5 timed fact captions shown as a lower third while the video plays.
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
    cueTimes: [0, 5.53, 10.7, 17.84, 22.44, 28.33], // narration starts 0.5 s after each cue
    cues: [
      "Ice Age: glaciers held so much water that the sea dropped hundreds of feet.",
      "A land bridge, **Beringia**, joined **Siberia (Asia)** and **Alaska**.",
      "Many scientists think people crossed it more than **15,000 years ago**, hunting **mammoths** and other big game.",
      "Some may also have traveled **by boat along the Pacific coast**.",
      "As the ice melted, the sea rose and covered the bridge again, about **11,000 years ago**.",
      "Why it matters: these hardy pioneers became the **first peoples of the Americas**."
    ],
    facts: [
      "About **21,000 years ago**, the sea was about **400 feet (120 m)** lower than today.",
      "**Beringia** was a tundra land bridge between Siberia and Alaska, over **1,000 miles** wide from north to south.",
      "Many scientists think the first Americans arrived **more than 15,000 years ago**, on foot across Beringia, by boat along the coast, or both.",
      "They followed herds of **woolly mammoths, mastodons, and bison**.",
      "About **11,000 years ago** rising seas covered the bridge; today the **Bering Strait** is about **51 miles (82 km)** wide.",
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
    cueTimes: [0, 6.35, 12.23, 18.25, 23.39], // narration starts 0.5 s after each cue
    cues: [
      "**Clovis points** are named for finds at **Blackwater Draw**, near **Clovis, New Mexico**, in the early **1930s**.",
      "Most scientists date them to about **13,000 years ago**, near the end of the Ice Age.",
      "Leaf-shaped, chipped from stone such as **chert**, with sharp edges and no notches.",
      "A groove at the base, the **flute**, let the point be tied to a **spear shaft**.",
      "Clovis points have been found with **mammoth bones**, so these hunters took **giant game**."
    ],
    facts: [
      "**Clovis points** are named for **Blackwater Draw**, near **Clovis, New Mexico**, found in 1929 and dug in **1932–1933**.",
      "They date to about **13,000 years ago**, near the end of the Ice Age.",
      "They are **leaf-shaped** and were **chipped from stone** such as **chert, jasper, or obsidian**.",
      "A groove at the base, the **flute**, let them be **tied to a spear shaft**.",
      "Clovis points have been found with **mammoth bones**, so hunters took large Ice Age animals.",
      "Why it matters: they show the **skill and ingenuity** of some of the earliest people in America."
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
  "s1-paleo-indians": {
    title: "The Paleo-Indians: America's First Pioneers",
    cueTimes: [0, 9.83, 15.91, 23.36, 32.67], // narration starts 0.5 s after each cue
    cues: [
      "The first Americans are called **Paleo-Indians**. *Paleo* means **ancient**. They were **nomads**, moving from camp to camp.",
      "They hunted **woolly mammoths, mastodons, and bison**, and gathered **nuts, berries, and roots**.",
      "We learn about them from **archaeologists**, scientists who study **artifacts**: tools, beads, and other objects people made.",
      "At **Monte Verde**, in southern **Chile**, archaeologists found a camp about **14,500 years old**: older than Clovis.",
      "At **White Sands, New Mexico**, ancient footprints may be **21,000–23,000 years old**. Scientists are still testing the evidence."
    ],
    facts: [
      "The first Americans are called **Paleo-Indians**; *paleo* means **ancient**.",
      "They were **nomads** who followed herds and moved from camp to camp.",
      "They hunted **mammoths, mastodons, and bison** and gathered **nuts, berries, and roots**.",
      "**Archaeologists** study **artifacts** (objects people made) to learn about the past.",
      "**Monte Verde, Chile**: a camp about **14,500 years old**, widely accepted as **older than Clovis**.",
      "**White Sands, New Mexico**: footprints that may be **21,000–23,000 years old**; scientists are still testing that date.",
      "Why it matters: bold, resourceful pioneers spread across **two whole continents**."
    ],
    check: [
      { q: "Why is the Monte Verde site in southern Chile important?",
        choices: ["It is a camp about 14,500 years old, older than Clovis", "It is where the Aztec built Tenochtitlán", "It is the oldest Inca city", "It is where Columbus first landed"],
        explain: "Monte Verde shows that people had reached far into South America very early, before the Clovis culture." },
      { q: "What does an archaeologist study?",
        choices: ["Artifacts: tools, beads, and other objects people made", "Only living animals", "Stars and planets", "Modern laws and courts"],
        explain: "Archaeologists study artifacts to learn how people lived long ago." }
    ]
  },
  "s1-olmec-maya-aztec": {
    title: "Olmec, Maya, and Aztec",
    cueTimes: [0, 9.56, 16.48, 24.03, 33.02], // narration starts 0.5 s after each cue
    cues: [
      "About **3,000 years ago**, the **Olmec** of Mexico's Gulf Coast carved **giant stone heads**: the \"mother culture\" of Mesoamerica.",
      "The **Maya** built **stone pyramids** and great cities, such as **Tikal**, in southern Mexico and Central America.",
      "Maya scholars created **glyph writing**, a very accurate **calendar**, and used **zero** in math.",
      "In **1325**, the **Aztec** founded **Tenochtitlán** on an island in **Lake Texcoco**, where Mexico City stands today.",
      "Aztec farmers grew crops on **chinampas**, \"floating gardens.\" Their empire collected **tribute** from conquered peoples."
    ],
    facts: [
      "The **Olmec** (Gulf Coast of Mexico, about **3,000 years ago**) carved **giant stone heads** and are called the **\"mother culture\"** of Mesoamerica.",
      "The **Maya** built **stone pyramids** and cities such as **Tikal** (Classic Age, about **250–900 CE**).",
      "The Maya had **glyph writing**, a very accurate **calendar**, and the idea of **zero**.",
      "The **Aztec** founded **Tenochtitlán** in **1325** on an island in **Lake Texcoco** (today's **Mexico City**).",
      "**Chinampas** were \"floating gardens\" built up from the lake bed.",
      "The Aztec Empire collected **tribute** (payments) from conquered peoples.",
      "The page of glyphs shown is from the real **Dresden Codex**, one of the few Maya books that survive."
    ],
    check: [
      { q: "Which group is often called the \"mother culture\" of Mesoamerica?",
        choices: ["The Olmec", "The Aztec", "The Inca", "The Hohokam"],
        explain: "The Olmec came first, about 3,000 years ago, and later peoples borrowed their ideas." },
      { q: "What were chinampas?",
        choices: ["\"Floating gardens\" built up from a lake bed", "Rope bridges over canyons", "Knotted cords for keeping records", "Stone heads carved by the Olmec"],
        explain: "Aztec farmers built chinampas in Lake Texcoco to grow crops." }
    ]
  },
  "s1-inca-empire": {
    title: "The Inca: Empire of the Andes",
    cueTimes: [0, 7.04, 17.57, 24.39, 32.87], // narration starts 0.5 s after each cue
    cues: [
      "The **Inca** built the **largest empire in the Americas**, along the **Andes Mountains**. Their capital was **Cusco**.",
      "In the **1400s**, the emperor **Pachacuti** expanded the empire. Inca roads stretched more than **20,000 miles**, with **rope bridges**.",
      "Inca engineers carved **terraces** into steep mountainsides to farm, and built **Machu Picchu**.",
      "No written alphabet: relay runners called **chasquis** carried messages and **quipus**, knotted, colored cords.",
      "Instead of paying taxes in money, people paid a **labor tax**, the **mit'a**, working on roads, farms, and buildings."
    ],
    facts: [
      "The **Inca** built the **largest empire in the Americas** along the **Andes Mountains** of South America.",
      "Their capital was **Cusco**.",
      "Emperor **Pachacuti** greatly expanded the empire in the **1400s**.",
      "Inca roads ran more than **20,000 miles**, with **rope bridges** over deep canyons.",
      "**Terraces** (flat steps) turned steep mountainsides into farmland; **Machu Picchu** still stands today.",
      "With no written alphabet, the Inca kept records on **quipus** (knotted, colored cords), carried by relay runners called **chasquis**.",
      "The **mit'a** was a **labor tax**: people worked on roads, farms, and buildings."
    ],
    check: [
      { q: "How did the Inca keep records without a written alphabet?",
        choices: ["With quipus, sets of knotted, colored cords", "With glyphs carved on pyramids", "With printed books", "With clay tablets"],
        explain: "Quipus used knots and colors to record numbers and information; chasquis carried them along Inca roads." },
      { q: "What was the Inca mit'a?",
        choices: ["A labor tax: work on roads, farms, and buildings", "A floating garden", "A type of rope bridge", "The Inca capital city"],
        explain: "Instead of paying money, people paid the government with their work." }
    ]
  },
  "s1-mound-builders": {
    title: "Mound Builders and Ancestral Puebloans",
    cueTimes: [0, 8.82, 19.94, 26.47, 34.71], // narration starts 0.5 s after each cue
    cues: [
      "In the **Ohio and Mississippi River valleys**, the **Adena**, **Hopewell**, and later **Mississippians** built huge earthen **mounds**.",
      "Around **1100**, **Cahokia**, near present-day St. Louis, may have held **10,000–20,000 people**. **Monks Mound** is the largest earthen mound in North America.",
      "In the **Arizona** desert, the **Hohokam** dug long **irrigation canals** to bring river water to their crops.",
      "In the **Four Corners**, **Ancestral Puebloans** built many-story stone **pueblos**, such as **Pueblo Bonito** at **Chaco Canyon**.",
      "Later they built **cliff dwellings** at **Mesa Verde**. Their descendants, the **Pueblo peoples**, live in the Southwest today."
    ],
    facts: [
      "The **Mound Builders** (**Adena**, **Hopewell**, and later **Mississippians**) built earthen mounds for burials and ceremonies.",
      "**Cahokia**, near present-day **St. Louis**, may have held **10,000–20,000 people** around **1100**.",
      "**Monks Mound** at Cahokia is the **largest earthen mound in North America** (about 100 feet tall).",
      "The **Hohokam** of **Arizona** dug long **irrigation canals** to water their crops.",
      "The **Ancestral Puebloans** of the **Four Corners** built **pueblos** such as **Pueblo Bonito** at **Chaco Canyon**, with hundreds of rooms.",
      "They later built **cliff dwellings** at **Mesa Verde**, such as **Cliff Palace** (1200s, about 150 rooms).",
      "Their descendants, the **Pueblo peoples**, still live in the Southwest today."
    ],
    check: [
      { q: "Which Mississippian city near present-day St. Louis may have held 10,000–20,000 people around 1100?",
        choices: ["Cahokia", "Tenochtitlán", "Cusco", "Tikal"],
        explain: "Cahokia's Monks Mound is the largest earthen mound in North America." },
      { q: "How did the Hohokam farm in the dry Arizona desert?",
        choices: ["They dug long irrigation canals to bring river water", "They built chinampas in a lake", "They waited for monsoon floods only", "They traded for all their food"],
        explain: "Hohokam canals carried river water to fields of corn, beans, squash, and cotton." }
    ]
  },
  "s2-culture-regions": {
    title: "Land Shapes Life: Culture Regions",
    cueTimes: [0, 6.58, 15.64, 22.69, 29.13], // narration starts 0.5 s after each cue
    cues: [
      "By the **1400s**, **millions** of Native Americans lived in North America, speaking **hundreds of languages**.",
      "Historians group them into **culture regions**. The land, climate, plants, and animals shaped food, homes, and clothing.",
      "In the far north **Arctic**, the **Inuit** hunted seals, whales, and caribou, using light skin boats called **kayaks**.",
      "In winter, Inuit hunters built **snow houses (igloos)** for shelter while they hunted on the ice.",
      "In the dry **Great Basin**, the **Shoshone** and **Ute** moved often, gathering seeds, nuts, and roots."
    ],
    facts: [
      "By the **1400s**, millions of Native Americans lived in North America, speaking **hundreds of languages**.",
      "A **culture region** is an area where groups shared similar ways of life because of their environment.",
      "The **Inuit** of the **Arctic** hunted seals, whales, and caribou and traveled in **kayaks**.",
      "Inuit hunters built **snow houses (igloos)** for shelter while hunting in winter.",
      "In the **Great Basin**, the **Shoshone** and **Ute** gathered seeds, nuts, and roots and hunted small animals."
    ],
    check: [
      { q: "What do historians call an area where groups shared similar ways of life because of their environment?",
        choices: ["A culture region", "A colony", "A confederacy", "A city-state"],
        explain: "Land, climate, plants, and animals shaped each culture region's food, homes, and clothing." },
      { q: "How did Inuit hunters travel on the Arctic waters?",
        choices: ["In light skin boats called kayaks", "In birchbark canoes with sails", "On horseback along the shore", "In large wooden ships"],
        explain: "Kayaks were light boats of skin stretched over a frame of wood or bone." }
    ]
  },
  "s2-pacific-northwest": {
    title: "The Pacific Northwest: People of the Cedar and Salmon",
    cueTimes: [0, 9.11, 14.97, 20.55, 29.54], // narration starts 0.5 s after each cue
    cues: [
      "Along the rainy **Pacific Northwest** coast, the **Kwakwaka'wakw**, **Haida**, and **Tlingit** found plenty of food: **salmon**, shellfish, whales, and berries.",
      "Giant **cedar** trees gave them wood for large **plank houses**, shared by related families.",
      "From a **single cedar log**, they carved **canoes** big enough to travel the ocean coast.",
      "They carved cedar **house posts** showing **family crests**. The very tall **totem poles** came later, mostly in the **1800s**.",
      "At a **potlatch**, a family held a great feast and **gave away gifts** to show its wealth and status."
    ],
    facts: [
      "Pacific Northwest peoples such as the **Kwakwaka'wakw (Kwakiutl)**, **Haida**, and **Tlingit** lived on salmon, shellfish, whales, and berries.",
      "Giant **cedar** trees gave wood for **plank houses** and ocean-going **canoes** carved from one log.",
      "Carved cedar **house posts** showed **family crests**; very tall freestanding **totem poles** came mostly in the **1800s**.",
      "At a **potlatch**, the host family held a feast and **gave gifts away** to show its wealth and status."
    ],
    check: [
      { q: "What happened at a potlatch?",
        choices: ["A family held a feast and gave gifts away", "Leaders voted on a new constitution", "Hunters raced horses", "Farmers planted the Three Sisters"],
        explain: "Giving gifts away at a potlatch showed a family's wealth and status." },
      { q: "Which tree gave Pacific Northwest peoples wood for plank houses and canoes?",
        choices: ["Cedar", "Palm", "Saguaro cactus", "Birch only"],
        explain: "Giant western red cedars grow in the rainy Northwest forests." }
    ]
  },
  "s2-great-plains": {
    title: "The Great Plains: People of the Buffalo",
    cueTimes: [0, 8.84, 17.29, 23.8, 32.0], // narration starts 0.5 s after each cue
    cues: [
      "On the wide grasslands of the **Great Plains**, the **Lakota**, **Cheyenne**, and **Comanche** depended on the **buffalo (bison)**.",
      "For centuries, Plains hunters had **no horses**. They hunted buffalo **on foot**, sometimes creeping close under wolf skins.",
      "They used nearly **every part**: meat for food, hides for clothing and shelters, and bones for tools.",
      "Many lived in **tepees**, cone-shaped homes of poles and hides. **Dogs** pulled loads on frames called **travois**.",
      "Then **horses, brought by the Spanish**, spread north in the **1600s and 1700s**, making hunting and travel much faster."
    ],
    facts: [
      "Plains peoples such as the **Lakota (Sioux)**, **Cheyenne**, and **Comanche** depended on the **buffalo (bison)**.",
      "**Before horses**, Plains hunters hunted buffalo **on foot**, and **dogs** pulled **travois** loads.",
      "They used nearly every part of the buffalo: meat, hides, and bones.",
      "**Tepees** of poles and hides could be packed up and moved quickly.",
      "**Horses brought by the Spanish** spread north in the **1600s–1700s** and changed Plains life."
    ],
    check: [
      { q: "Where did the Plains peoples' horses come from?",
        choices: ["The Spanish brought them; they spread north in the 1600s and 1700s", "They had always lived wild on the Plains", "The Inuit traded them south", "The English brought them to Plymouth"],
        explain: "Before the Spanish arrived, Plains hunters went on foot and used dogs to pull travois." },
      { q: "Why were tepees a good home for Plains peoples?",
        choices: ["They could be packed up and moved quickly", "They were built of stone to last forever", "They floated on rivers", "They were made of snow blocks"],
        explain: "Tepees of poles and buffalo hides moved with the people as they followed the herds." }
    ]
  },
  "s2-southwest": {
    title: "The Southwest: Pueblos, Kivas, and Corn",
    cueTimes: [0, 8.6, 14.55, 21.14, 27.62], // narration starts 0.5 s after each cue
    cues: [
      "In the dry **Southwest**, the **Hopi**, **Zuni**, and other **Pueblo peoples** farmed corn, beans, and squash, using careful methods to **save water**.",
      "They built homes of stone and **adobe**, sun-dried clay, and women plastered the walls smooth.",
      "Buildings shared by many families, several stories tall and reached by ladders, are called **pueblos**.",
      "A **kiva** is a round room, often underground, used for **religious ceremonies and meetings**.",
      "Later arrivals, the **Navajo (Diné)** and **Apache**, became skilled hunters and traders. After the Spanish came, the Navajo raised **sheep** and wove **wool**."
    ],
    facts: [
      "The **Hopi**, **Zuni**, and other **Pueblo peoples** farmed corn, beans, and squash with water-saving methods.",
      "They built with stone and **adobe** (sun-dried clay); many-family buildings are called **pueblos**.",
      "A **kiva** is a round, often underground room for ceremonies and meetings.",
      "The **Navajo (Diné)** and **Apache** arrived later; after the Spanish came, the Navajo raised **sheep** and wove **wool**."
    ],
    check: [
      { q: "What is a kiva?",
        choices: ["A round, often underground room for ceremonies and meetings", "A cedar canoe", "A buffalo-hide tent", "A shell-bead belt"],
        explain: "Pueblo peoples still use kivas for ceremonies today." },
      { q: "What were many-family adobe buildings in the Southwest called?",
        choices: ["Pueblos", "Longhouses", "Igloos", "Plank houses"],
        explain: "Pueblos were several stories tall and were reached by ladders." }
    ]
  },
  "s2-iroquois": {
    title: "Eastern Woodlands: The Iroquois Confederacy",
    cueTimes: [0, 7.04, 14.07, 23.08, 29.77], // narration starts 0.5 s after each cue
    cues: [
      "In the **Eastern Woodlands**, people hunted deer, fished, and farmed the **Three Sisters**: corn, beans, and squash.",
      "The **Iroquois (Haudenosaunee)** lived in **longhouses**, long bark-covered homes shared by several related families.",
      "Five nations, the **Mohawk, Oneida, Onondaga, Cayuga, and Seneca**, formed the **Iroquois Confederacy** under the **Great Law of Peace**.",
      "Women held real power. **Clan mothers** chose the male leaders, called **sachems**, and could remove them.",
      "**Wampum**, beads made from shells, was woven into **belts** to record agreements."
    ],
    facts: [
      "Eastern Woodlands peoples hunted deer, fished, and farmed the **Three Sisters** (corn, beans, squash).",
      "The **Iroquois (Haudenosaunee)** lived in bark-covered **longhouses** shared by related families.",
      "The **Mohawk, Oneida, Onondaga, Cayuga, and Seneca** formed the **Iroquois Confederacy** under the **Great Law of Peace** (later joined by the Tuscarora).",
      "**Clan mothers** chose the **sachems** (male leaders) and could remove them.",
      "**Wampum** shell-bead belts recorded agreements and were used in ceremonies."
    ],
    check: [
      { q: "Who chose the Iroquois sachems and could remove them?",
        choices: ["The clan mothers", "The Spanish governor", "The youngest warriors", "The English king"],
        explain: "Iroquois women held real political power through the clan mothers." },
      { q: "Which group of nations formed the Iroquois Confederacy?",
        choices: ["Mohawk, Oneida, Onondaga, Cayuga, and Seneca", "Hopi, Zuni, and Navajo", "Lakota, Cheyenne, and Comanche", "Haida, Tlingit, and Kwakwaka'wakw"],
        explain: "These five nations united under the Great Law of Peace; the Tuscarora joined later." }
    ]
  },
  "s2-southeast": {
    title: "The Southeast: Farming Towns and the Green Corn Ceremony",
    cueTimes: [0, 7.49, 13.46, 19.37, 26.4], // narration starts 0.5 s after each cue
    cues: [
      "In the warm, fertile **Southeast**, the **Cherokee**, the **Creek (Muscogee)**, and the **Choctaw** lived in **farming towns** along rivers.",
      "Women farmed fields of **corn, beans, and squash**, while men hunted deer and fished.",
      "Each town had a central **plaza** and a **council house**, where leaders met to make decisions.",
      "Each summer, many Southeastern peoples held the **Green Corn Ceremony**, to give thanks for the harvest and begin a new year.",
      "Towns played **stickball**, a fast team game. The **Cherokee, Muscogee, and Choctaw nations** are still thriving today."
    ],
    facts: [
      "The **Cherokee**, **Creek (Muscogee)**, and **Choctaw** lived in farming towns in the Southeast.",
      "Women farmed **corn, beans, and squash**; men hunted deer and fished.",
      "Each town had a central **plaza** and a **council house** where leaders met.",
      "The summer **Green Corn Ceremony** gave thanks for the harvest and began a new year.",
      "These nations still thrive today."
    ],
    check: [
      { q: "What was the Green Corn Ceremony?",
        choices: ["A summer ceremony giving thanks for the harvest and beginning a new year", "A buffalo hunt on horseback", "A gift-giving feast on the Pacific coast", "A winter igloo festival"],
        explain: "Many Southeastern peoples held it each summer when the new corn ripened." },
      { q: "Where did leaders in a Southeastern town meet to make decisions?",
        choices: ["In the council house by the central plaza", "In a kiva", "On a cedar canoe", "In a snow house"],
        explain: "The council house stood at the heart of the town." }
    ]
  },
  "s1-early-maize": {
    title: "Early Maize: The Gift of Farming",
    cueTimes: [0, 5.37, 13.7, 20.52, 26.93], // narration starts 0.5 s after each cue
    cues: [
      "As the **Ice Age** ended, about 11,700 years ago, many giant animals such as mammoths died out, and people began to **farm**.",
      "In **Mexico's Balsas River valley**, starting about **9,000 years ago**, farmers developed **maize (corn)** from a wild grass called **teosinte**.",
      "Season after season they **saved seeds** from the best plants, and tiny wild ears grew into big **cobs**.",
      "Later farmers planted the **Three Sisters** together, **corn, beans, and squash**, which helped each other grow.",
      "Why it matters: a food **surplus** led to permanent **villages**, and later to cities and **civilizations**."
    ],
    facts: [
      "Maize was developed from **teosinte**, a wild grass of southern Mexico, about **9,000 years ago**.",
      "A teosinte ear holds only **5 to 12 kernels**, each sealed in a stony case; a maize ear can hold **500 or more**.",
      "Ancient maize cobs about **6,250 years old** were found in **Guilá Naquitz** cave in Oaxaca, Mexico.",
      "**Three Sisters:** corn stalks hold up beans, beans enrich the soil, and squash leaves shade out weeds.",
      "Maize farming spread north; after about **AD 900 to 1000** it became a major crop across much of what is now the eastern United States.",
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
    title: "Jamestown: The Colony That Lasted",
    cueTimes: [0, 12.12, 23.92, 33.66, 45.29, 57.44, 69.34], // narration starts 0.5 s after each cue
    cues: [
      "In **April 1606**, **King James the First** granted a charter to the **Virginia Company of London**. That December, **three small ships** sailed from London with **105 settlers** bound for America.",
      "The **Susan Constant**, **Godspeed** and **Discovery** reached **Chesapeake Bay** in late April 1607. On **May 14**, **104 men and boys** came ashore beside a river they named the **James**.",
      "Within weeks they finished **James Fort**, a **triangle** of log walls with a lookout bulwark at each corner. Jamestown became the **first permanent English settlement** in America.",
      "Hard times came fast. Bad water and sickness killed **half the settlers** by fall. **Captain John Smith** ordered, **\"He that will not work shall not eat,\"** and traded with the **Powhatan** people for corn.",
      "In the winter of 1609, the **Starving Time**, about 300 people were in the fort and **only about 60 survived**. In **June 1610**, **Lord De La Warr** arrived with supplies, and the colony held on.",
      "About **1612**, **John Rolfe** began growing a sweeter **tobacco** that sold well in England. His **1614** marriage to **Pocahontas**, daughter of **Chief Powhatan**, brought several years of peace.",
      "In **1619**, America's **first elected assembly** met at Jamestown, the birth of **self-government**. More English women came to build families, and about **20 Africans** were brought here **against their will**."
    ],
    facts: [
      "In **1606**, **King James I** chartered the **Virginia Company of London** to plant a colony in America.",
      "The **Susan Constant**, **Godspeed** and **Discovery** carried **105 settlers**; **104 men and boys** landed at Jamestown on **May 14, 1607**.",
      "Jamestown was the **first permanent English settlement** in America, protected by the triangular **James Fort**.",
      "**Captain John Smith's** rule, **\"He that will not work shall not eat,\"** and trade with the **Powhatan** helped the colony survive.",
      "In the **Starving Time** (winter **1609–1610**), only **about 60 of some 300** people in the fort survived; **Lord De La Warr's** arrival in **June 1610** saved the colony.",
      "In **1619**, the **General Assembly**, the **first elected lawmaking body** in English America, met at Jamestown; the same year the first recorded **Africans** arrived in English Virginia, **brought against their will**."
    ],
    check: [
      { q: "In what year was Jamestown founded?",
        choices: ["1607", "1620", "1492", "1776"],
        explain: "104 men and boys landed on May 14, 1607. Jamestown was England's first permanent settlement in America." },
      { q: "What crop helped Virginia make money and grow?",
        choices: ["Tobacco", "Cotton", "Rice", "Sugar cane"],
        explain: "Starting about 1612, John Rolfe's sweeter tobacco sold well in England and became Virginia's cash crop." },
      { q: "Why is the year 1619 important in Virginia's history?",
        choices: ["The first elected assembly met, and the first recorded Africans arrived", "The Mayflower landed", "The colony was founded", "Virginia became a state"],
        explain: "The General Assembly began self-government in America. The same year about 20 Africans were brought to Virginia against their will." }
    ]
  },
  "s5-virginia-founders": {
    title: "Founders of Virginia",
    cueTimes: [0, 8.90, 19.63, 27.33, 35.46, 42.98, 50.21], // narration starts 0.5 s after each cue
    cues: [
      "**Captain Christopher Newport**, a one-armed sea veteran, commanded the **1607 fleet** and sailed the **supply voyages** that kept Jamestown alive.",
      "**Bartholomew Gosnold**, who named **Cape Cod** in **1602**, rallied support for the voyage and helped choose the colony's leaders. He died in August 1607.",
      "**Captain John Smith** led the colony in **1608**, made every man work, traded for corn, and **mapped the Chesapeake Bay**.",
      "**Pocahontas**, daughter of **Chief Powhatan**, brought food to the hungry fort and later became a **bridge of peace** between two peoples.",
      "**Lord De La Warr** arrived in **June 1610** just as the settlers were leaving. He turned them back and **rebuilt the fort**.",
      "**John Rolfe** planted a sweeter **tobacco** that sold well in England, giving Virginia the **cash crop** it needed to grow.",
      "**Governor George Yeardley** brought the **Great Charter**, backed by **Sir Edwin Sandys**, and called America's **first elected assembly** in **1619**."
    ],
    facts: [
      "**Christopher Newport**, a one-armed veteran sea captain, commanded the **1607 fleet** and the supply voyages that kept Jamestown alive.",
      "**Bartholomew Gosnold**, the \"prime mover\" of the colony, had named **Cape Cod** in **1602**; he died in August 1607.",
      "**Captain John Smith** led the colony in **1608–1609**, made everyone work, traded for corn, and **mapped the Chesapeake Bay**.",
      "**Pocahontas**, daughter of **Chief Powhatan**, brought food to the fort and, by marrying **John Rolfe** in **1614**, helped bring years of peace.",
      "**Lord De La Warr** arrived in **June 1610** just as the colonists were abandoning Jamestown, turned them back, and rebuilt the fort.",
      "**John Rolfe's tobacco** (about 1612) became Virginia's **cash crop**. **Governor George Yeardley**, with reforms backed by **Sir Edwin Sandys**, called America's **first elected assembly** in **1619**."
    ],
    check: [
      { q: "Which Jamestown leader said, \"He that will not work shall not eat\"?",
        choices: ["John Smith", "John Rolfe", "Christopher Newport", "George Yeardley"],
        explain: "As colony president in 1608, Smith made every settler work to grow and gather food." },
      { q: "How did Pocahontas help Jamestown?",
        choices: ["She brought food, and her marriage to John Rolfe helped bring peace", "She was the colony's first governor", "She sailed the ships from England", "She wrote the Great Charter"],
        explain: "Pocahontas brought food to the hungry fort, and her 1614 marriage began the \"Peace of Pocahontas\"." },
      { q: "Who arrived in 1610 and stopped the settlers from abandoning Jamestown?",
        choices: ["Lord De La Warr", "Bartholomew Gosnold", "John Smith", "Edwin Sandys"],
        explain: "In June 1610, De La Warr's ships met the departing settlers on the river, and he ordered them back to rebuild." }
    ]
  },
  "s5-virginia-struggles": {
    title: "Early Virginia: Struggles and Recovery",
    cueTimes: [0, 5.89, 10.35, 18.11, 24.78], // narration starts 0.5 s after each cue
    cues: [
      "Hard early years: **swampy ground, bad water, disease**, and conflict with the **Powhatan**.",
      "**John Smith's rule:** \"He that will not work shall not eat.\"",
      "**Starving Time, winter 1609–1610:** only **about 60 of some 300** colonists survived.",
      "About **1612**, **John Rolfe's** sweeter **tobacco** becomes Virginia's **cash crop** and saves the colony.",
      "**1619:** the **House of Burgesses**, the first elected representative assembly in English America. The first recorded **Africans** also arrive, as forced laborers."
    ],
    facts: [
      "Jamestown's early years were hard: **swampy ground, bad water, disease**, and conflict with the **Powhatan**.",
      "**John Smith** made a rule: **\"He that will not work shall not eat.\"**",
      "In the **Starving Time** (winter **1609–1610**), only **about 60 of some 300** colonists stayed alive.",
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
    title: "The Mayflower Voyage, 1620",
    cueTimes: [0, 9.29, 16.14, 23.62, 30.43, 36.66, 48.06], // narration starts 0.5 s after each cue
    cues: [
      "**Sept 6, 1620:** the **Mayflower** sails alone from **Plymouth, England**; the leaky **Speedwell** had turned back.",
      "About **102 passengers** and **20 to 30 crew** crowd aboard the small merchant ship.",
      "**66 days** of autumn Atlantic storms; a cracked main beam is braced with a great **iron screw**.",
      "**Below deck:** **Separatist** families kept up daily **prayer and Bible reading** through the long, cramped crossing.",
      "**Nov 9, 1620:** land sighted at **Cape Cod**, far north of their Virginia grant.",
      "**Nov 11:** still aboard ship off Cape Cod, **41 men sign the Mayflower Compact**, promising **\"just and equal laws\"** for the general good: a seed of **American self-government**.",
      "They anchor in today's **Provincetown Harbor**, and the first men go ashore."
    ],
    facts: [
      "The leaky **Speedwell** turned back, so the **Mayflower** crossed **alone**.",
      "About **102 passengers** sailed, with a crew of about **20 to 30**.",
      "The crossing took **66 days at sea**.",
      "Many passengers were **Separatists (the Pilgrims)** who crossed to **worship freely**; **prayer and Scripture** sustained them on the voyage.",
      "They reached **Cape Cod** in **November 1620**.",
      "The **Mayflower Compact** was an agreement to make **\"just and equal laws\"** for the general good, an early example of **self-government by consent**, a seed of American self-government.",
      "The Mayflower anchored in what is now **Provincetown Harbor**.",
      "The dates are from the **old calendar** England used then; by today's calendar the Compact was signed on **November 21**."
    ],
    check: [
      { q: "What agreement did the Pilgrims sign before going ashore?",
        choices: ["The Mayflower Compact", "Magna Carta", "The House of Burgesses charter", "The Declaration of Independence"],
        explain: "On November 11, 1620, 41 men signed the Mayflower Compact aboard ship, agreeing to make just and equal laws for the general good. It was a seed of American self-government." },
      { q: "Where did the Mayflower reach land in November 1620?",
        choices: ["Cape Cod", "Jamestown", "Florida", "Hudson Bay"],
        explain: "Cape Cod was far north of their Virginia grant, which is one reason they wrote the Compact." }
    ]
  },
  "s5-new-england": {
    title: "Plymouth and a New England Beginning",
    cueTimes: [0, 6.39, 14.52, 24.82, 33.52, 42.72], // narration starts 0.5 s after each cue
    cues: [
      "**The first winter at Plymouth (1620–1621):** about **half** of the settlers died of disease and hardship.",
      "**March 1621:** the Wampanoag leader **Massasoit** and Governor **John Carver** made a treaty of **peace and mutual defense**.",
      "**Tisquantum (Squanto)**, a **Patuxet** man who had learned English after being kidnapped to Europe, showed the settlers how to **plant corn with fish** to feed the soil.",
      "**Autumn 1621:** Massasoit and **about 90** of his men joined the colonists for **three days** of feasting at the harvest celebration.",
      "**1630:** **John Winthrop** brought a fleet of **Puritans** (11 ships) to found the **Massachusetts Bay Colony**: \"We shall be as a **city upon a hill**.\"",
      "New England towns governed themselves in **town meetings**. A **1647** law required larger towns to keep **schools** so children could learn to read the Bible."
    ],
    facts: [
      "The first winter at Plymouth killed **about half** of the Mayflower's **102 passengers**.",
      "On **March 22, 1621**, **Massasoit** of the **Wampanoag** and Governor **John Carver** made a treaty of **peace and mutual defense**.",
      "**Tisquantum (Squanto)**, a **Patuxet** man, taught the settlers to **plant corn with fish** as fertilizer.",
      "In autumn **1621**, Massasoit and **about 90** Wampanoag men joined the colonists for **three days** of harvest feasting.",
      "In **1630**, **John Winthrop's** fleet of **11 ships** founded the **Massachusetts Bay Colony**, which he hoped would be a **\"city upon a hill.\"**",
      "New England towns governed themselves in **town meetings** (Dorchester's is the earliest on record, **1633**).",
      "Massachusetts's **1647 school law** required towns of **50 households** to provide a teacher of reading and writing."
    ],
    check: [
      { q: "Which Wampanoag leader made a peace treaty with Plymouth in 1621?",
        choices: ["Massasoit", "Powhatan", "Pocahontas", "Metacom"],
        explain: "Massasoit's 1621 treaty of peace and mutual defense lasted for decades." },
      { q: "Who helped the Plymouth survivors after the first hard winter?",
        choices: ["Squanto and Massasoit's Wampanoag", "John Smith and the Powhatan", "Spanish soldiers from Florida", "Dutch traders from New Amsterdam"],
        explain: "Squanto taught them to plant corn, and the Wampanoag made peace with them." }
    ]
  },
  "s3-motives": {
    title: "Why Explore? Spices, Silk, and a Sea Route",
    cueTimes: [0, 7.34, 15.69, 27.51, 32.05], // narration starts 0.5 s after each cue
    cues: [
      "In the **1400s**, Europeans prized goods from Asia: **spices** like pepper, cinnamon, and cloves, and shining **silk**.",
      "**Marco Polo**, an Italian merchant, wrote a famous book about his travels to **China**, and Europeans grew curious about Asia.",
      "But these goods crossed long **overland routes** and passed through many **middlemen**, so prices were high. After the **Ottoman Turks** captured **Constantinople** in **1453**, trade grew even harder.",
      "So Europeans began searching for an **all-water route to Asia**.",
      "Their motives are summed up as **God, gold, and glory**: spreading Christianity, finding wealth, and winning fame. The new learning of the **Renaissance** fed their curiosity."
    ],
    facts: [
      "Europeans wanted Asian **spices** (pepper, cinnamon, cloves) and **silk**.",
      "**Marco Polo** of Venice wrote about his years in **China**, making Asia's riches famous in Europe.",
      "Overland routes passed through many **middlemen**, so prices were high.",
      "The **Ottoman Turks** captured **Constantinople** in **1453**, making trade with Asia even harder.",
      "Explorers' motives are summed up as **\"God, gold, and glory.\"**"
    ],
    check: [
      { q: "What were Europeans searching for to reach Asia more cheaply?",
        choices: ["An all-water route to Asia", "A new road across Africa", "A tunnel under the mountains", "A railroad across Russia"],
        explain: "A sea route would skip the many middlemen on the long overland routes." },
      { q: "What do \"God, gold, and glory\" stand for?",
        choices: ["Spreading Christianity, finding wealth, and winning fame", "Building churches, mining coal, and writing books", "Farming, fishing, and trading furs", "Peace, freedom, and equality"],
        explain: "These three motives drove many European explorers." }
    ]
  }
};
GAME_CONTENT.videoAttach = { s1: { beringia: "s1-beringia", clovis: "s1-clovis-points", agriculture: "s1-early-maize" } }; // newer scrolls use videoKey on the lesson
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
