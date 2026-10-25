/* v2 additions: First Peoples */
GAME_CONTENT.extend("s1", {
  gear: [
    { key: "fur-cloak", name: "Fur Cloak", icon: "🧥", slot: "cloak", art: "fur-cloak", color: "#8a5a32", desc: "Warm mammoth-country fur against the Ice Age wind." },
    { key: "clovis-spear", name: "Clovis Spear Point", icon: "🗡️", slot: "hand", art: "spear", color: "#6d6d78", desc: "A fluted stone point, chipped with skill and lashed to a spear." },
    { key: "woven-basket", name: "Woven Basket", icon: "🧺", slot: "back", art: "basket", color: "#c79a4a", desc: "Carried on your back for seeds, berries, and maize." },
    { key: "shell-necklace", name: "Shell Necklace", icon: "📿", slot: "neck", art: "shell-necklace", color: "#f3e6c8", desc: "Shell beads traded from far-off coasts." },
    { key: "feather-band", name: "Feathered Headband", icon: "🪶", slot: "head", art: "feather-band", color: "#d9472b", desc: "A mark of a sharp-eyed learner." }
  ],
  addText: {
    beringia: [
      "Beringia was not a skinny bridge. At its biggest it was up to about **600 miles (1,000 km) wide** from north to south: a cold, grassy plain scientists call the **mammoth steppe**.",
      "**Another perspective:** Many Native American nations have their own **origin stories** that teach their people have always lived in their homelands. These traditions are respected histories passed down by elders, alongside the theories scientists study."
    ],
    paleo: [
      "At **White Sands National Park in New Mexico**, scientists found human footprints that may be about **21,000 to 23,000 years old**. Scientists are still studying and debating them, which shows how history can change when new evidence is found."
    ],
    clovis: [
      "**How a Clovis point was made:** a toolmaker chose fine stone such as **chert, jasper, or obsidian**, struck off a big flake with a **hammerstone**, thinned it with a softer **antler billet**, knocked a long groove called the **flute** out of the base, **pressure-flaked** the edges sharp with an antler tip, and finally **ground the base smooth** so it would not cut the **sinew** cords that tied it to the spear.",
      "Some Clovis points were made from stone carried **hundreds of miles** from where it was quarried, a clue that people traveled far or traded."
    ],
    agriculture: [
      "Farmers often planted the Three Sisters together in small **mounds**: corn first, then beans once the corn was a few inches tall, then squash around the edge. The beans climbed the corn, **beans added nutrients (nitrogen) to the soil**, and the big squash leaves shaded out weeds and kept the soil damp.",
      "In the **Andes Mountains of South America**, farmers developed the **potato** thousands of years ago, along with quinoa. These crops later changed diets all around the world."
    ],
    meso: [
      "The Maya Classic Age lasted from about **250 to 900 CE**, when great cities such as **Tikal** flourished. Many southern cities were later abandoned, probably because of **drought, warfare, and worn-out land**, but the Maya people did not disappear: **millions of Maya people live in Mexico and Central America today**.",
      "The Aztec used **cacao beans** (the seeds that chocolate comes from) as a kind of money. The huge market at **Tlatelolco** amazed Spanish soldiers later; one of them, **Bernal Díaz del Castillo**, wrote that soldiers who had seen Rome and Constantinople had never seen a market so large and orderly."
    ],
    inca: [
      "The emperor **Pachacuti** greatly expanded the Inca Empire in the 1400s. Inca roads stretched more than **20,000 miles**, with rope **suspension bridges** over deep canyons.",
      "Relay runners called **chasquis** carried messages and quipus along the roads, each running a short distance and handing off to the next runner. Instead of money taxes, people paid a **labor tax called mit'a**, working on roads, farms, and buildings."
    ],
    mounds: [
      "**Serpent Mound** in Ohio is an **effigy mound**, an earthwork shaped like an animal. It looks like a giant snake about a quarter of a mile long.",
      "At **Chaco Canyon** in New Mexico, Ancestral Puebloans built great houses such as **Pueblo Bonito**, with hundreds of rooms, connected to other towns by long straight roads."
    ]
  },
  questions: [
    { id: "s1q28", topic: "beringia", type: "mc", q: "What do many Native American origin stories teach about where their people came from?",
      choices: ["That their people have always lived in their homelands", "That they sailed from England", "That they came on Spanish ships", "That they arrived in the 1600s"],
      explain: "Origin stories are another perspective, passed down by elders, alongside scientists' migration theories." },
    { id: "s1q29", topic: "paleo", type: "mc", q: "Ancient human footprints, perhaps 21,000 to 23,000 years old, were found at White Sands in which state?",
      choices: ["New Mexico", "Florida", "Maine", "Alaska"],
      explain: "The White Sands footprints are still being studied. New evidence can change what we know." },
    { id: "s1q30", topic: "clovis", type: "mc", q: "Why did Clovis toolmakers grind the base of a point smooth?",
      choices: ["So the sharp edges would not cut the cords that tied it to the spear", "To make it shiny for trading", "So it would float", "To carve their names into it"],
      explain: "A smooth base protected the sinew lashing that held the point to the shaft." },
    { id: "s1q31", topic: "clovis", type: "mc", q: "To press off tiny flakes and sharpen a point's edges, toolmakers used a pointed piece of...",
      choices: ["Antler or bone", "Iron", "Steel", "Glass"],
      explain: "This is called pressure flaking. Metal tools did not exist in the Americas then." },
    { id: "s1q32", topic: "agriculture", type: "mc", q: "In a Three Sisters garden, what did the beans do?",
      choices: ["Climbed the corn and added nutrients to the soil", "Shaded out weeds with big leaves", "Grew tall like a pole", "Scared away birds"],
      explain: "Corn was the pole, beans added nitrogen, and squash leaves shaded the soil." },
    { id: "s1q33", topic: "agriculture", type: "mc", q: "Where were potatoes first grown as a crop?",
      choices: ["In the Andes Mountains of South America", "In Ireland", "In China", "In Egypt"],
      explain: "Andean farmers developed the potato thousands of years ago. It reached Europe only after 1492." },
    { id: "s1q34", topic: "meso", type: "short", q: "What did the Aztec use as a kind of money? (Hint: chocolate comes from them.)",
      accept: ["cacao beans", "cacao", "cocoa beans", "cocoa", "cacao seeds", "chocolate beans", "cacao bean", "cocoa bean"], display: "Cacao beans", explain: "Cacao beans were valuable enough to trade like coins." },
    { id: "s1q35", topic: "meso", type: "mc", q: "What happened to the Maya people after many of their southern cities were abandoned around 900 CE?",
      choices: ["They lived on. Millions of Maya people live in Mexico and Central America today", "They all vanished forever", "They moved to Europe", "They became the Inca"],
      explain: "Cities declined, probably from drought and war, but Maya communities continued." },
    { id: "s1q36", topic: "inca", type: "fill", q: "Inca relay runners who carried messages along the roads were called ____.",
      accept: ["chasquis", "chasqui", "chaskis", "chaski"], display: "chasquis", explain: "Chasquis handed messages to the next runner, like a relay race." },
    { id: "s1q37", topic: "inca", type: "mc", q: "Which Inca ruler greatly expanded the empire in the 1400s?",
      choices: ["Pachacuti", "Montezuma", "Hiawatha", "Popé"],
      explain: "Pachacuti built much of the empire and is linked to Machu Picchu." },
    { id: "s1q38", topic: "mounds", type: "mc", q: "Serpent Mound in Ohio is an effigy mound. What is it shaped like?",
      choices: ["A giant snake", "A pyramid", "A turtle shell", "A canoe"],
      explain: "Effigy mounds are earthworks shaped like animals." }
  ],
  activities: [
    { id: "s1-clovis", type: "sequence", stage: "clovis", icon: "🪨", title: "Craft a Clovis Point", topic: "clovis",
      intro: "Grandfather hands you a lump of chert. \"Make the steps in the right order, or the stone will snap!\" Tap the steps in order.",
      steps: [
        { t: "Choose fine-grained stone like chert or obsidian", fact: "Clovis makers chose beautiful chert, jasper, or obsidian, sometimes from quarries hundreds of miles away." },
        { t: "Strike off a big flake with a hammerstone", fact: "Hitting stone with harder stone is called percussion flaking." },
        { t: "Thin the flake into a leaf shape with an antler billet", fact: "A softer antler hammer takes off thin flakes without shattering the stone." },
        { t: "Knock the long flute groove out of the base", fact: "The flute is what makes a Clovis point special. It helped seat the point in a split spear shaft." },
        { t: "Pressure-flake the edges sharp with an antler tip", fact: "Pressing, not hitting, removes tiny careful flakes for a razor edge." },
        { t: "Grind the base smooth", fact: "A smooth base will not cut the sinew lashing." },
        { t: "Lash the point to a wooden shaft with sinew", fact: "Sinew (animal tendon) shrinks as it dries and grips tightly." }
      ],
      distractors: [
        { t: "Melt iron in a furnace", why: "Ice Age people had no metal tools. Clovis points are stone." },
        { t: "Glue it on with plastic", why: "Plastic was invented thousands of years later!" }
      ] },
    { id: "s1-garden", type: "sequence", stage: "garden", icon: "🌽", title: "Plant a Three Sisters Garden", topic: "agriculture",
      intro: "It is spring planting time. Plant the Three Sisters in the right order so they help each other grow.",
      steps: [
        { t: "Hoe up a small mound of soil", fact: "Many farmers, like the Haudenosaunee, planted in small hills or mounds." },
        { t: "Plant corn seeds in the center of the mound", fact: "Corn goes first so it can grow tall and strong." },
        { t: "When the corn is a hand tall, plant beans around it", fact: "Beans climb the corn stalk like a ladder and add nutrients to the soil." },
        { t: "Plant squash around the edge of the mound", fact: "Big prickly squash leaves shade the soil, hold in water, and block weeds." },
        { t: "Harvest, then dry corn and beans for winter", fact: "Dried corn and beans could be stored for months. That surplus let villages grow." }
      ],
      distractors: [
        { t: "Plow the field with a horse", why: "There were no horses in the Americas then. Spanish ships brought them after 1492." },
        { t: "Plant wheat seeds", why: "Wheat came from Europe and Asia much later." }
      ] },
    { id: "s1-maya", type: "dialogue", icon: "📜", title: "Talk with a Maya Scribe", topic: "meso",
      who: { name: "The Scribe of Tikal", role: "a scribe of Tikal, about 700 CE", portrait: "🧑🏽‍🎨", look: { gender: "girl", tunic: "#2a9d8f", equip: { head: { art: "copper-plume", color: "#2ec4b6" }, neck: { art: "gorget", color: "#2ec4b6" } } } },
      lines: [
        { say: "Welcome to Tikal, traveler! I paint our history in glyphs on stone and bark-paper books. What are our glyphs?",
          choices: [ { t: "Symbols that stand for words and sounds", ok: true, r: "Yes! Our glyphs are a complete writing system. Scholars today can read most of them." },
                     { t: "Just decorations", r: "No, they are true writing. We record kings, battles, and dates." },
                     { t: "Letters of the Latin alphabet", r: "That alphabet comes from Rome, across the ocean. We made our own writing." } ] },
        { say: "We draw a shell for one special number. Which number does the shell stand for?",
          choices: [ { t: "Zero", ok: true, r: "Correct! The Maya were among the first people in the world to use zero." },
                     { t: "Ten", r: "Not ten. Ten is two bars. The shell stands for zero, an amazing idea!" },
                     { t: "One hundred", r: "No, the shell means zero. We count in twenties, too." } ] },
        { say: "Our sky-watchers track the Sun, Moon, and Venus. Why keep such careful calendars?",
          choices: [ { t: "To plan planting, ceremonies, and record history", ok: true, r: "Right. Our 365-day calendar guides farming and festivals, and we can even predict eclipses." },
                     { t: "To know when Spanish ships arrive", r: "Spanish ships will not come for about 800 years! We watch the sky for our own seasons." },
                     { t: "Because we have nothing else to do", r: "Ha! Calendars are serious work. They guide farming and ceremonies." } ] },
        { say: "What do our farmers grow most in their milpa fields?",
          choices: [ { t: "Maize, beans, and squash", ok: true, r: "Yes! Maize is so important that our stories say people were made from maize dough." },
                     { t: "Wheat and barley", r: "Those grains grow across the sea. Here we grow maize, beans, and squash." },
                     { t: "Rice", r: "Rice was not grown here then. Maize is our main crop." } ] },
        { say: "Someday many southern cities like mine will be left empty. What do scholars think caused that?",
          choices: [ { t: "Long droughts, wars, and worn-out land", ok: true, r: "That is what the evidence suggests. But the Maya people live on: millions of Maya still live today!" },
                     { t: "Spanish conquistadors destroyed them", r: "No, that came about 600 years later. The decline around 900 CE came from drought, war, and worn-out farmland." },
                     { t: "Everyone moved to the moon", r: "Silly traveler! Drought and war are the likely causes." } ] }
      ] }
  ]
});
