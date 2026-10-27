/* v2.1: Map challenges ("geomap" activities). Real coastlines come from
   content/v21-geo.js (Natural Earth). Each target is a [lat, lon] point;
   the player drags (or taps) a label onto the right dot. A drop counts if the
   nearest dot is the right one and it is within the tolerance. `q` links a
   target to a question, so a missed placement also goes to mastery review.
   Dots for nations mark the general homeland area, not a border. Routes are
   simplified; several (de Soto, Coronado, the first migrations) are debated. */
GAME_CONTENT.extend("s1", {
  activities: [{
    id: "s1-geomap", type: "geomap", geo: "s1", icon: "🧭", title: "Map the First Americans", topic: "paleo",
    intro: "Drag each label onto its dot on the map (or tap a label, then tap the spot). The dashed lines are two **routes scientists propose** for the first migrations. They are theories, still being tested.",
    routes: [
      { name: "Ice-free corridor (theory)", color: "#2b5fae", pts: [[65.5, -168], [65, -150], [63, -138], [58, -124], [53, -116], [48, -110], [40, -104]] },
      { name: "Pacific coast route (theory)", color: "#c0392b", pts: [[63, -172], [58, -154], [57, -137], [51, -130], [42, -125.5], [32, -118.5], [20, -106], [12, -90], [0, -81.5], [-18, -71.5], [-40, -74.5]] }
    ],
    targets: [
      { id: "beringia", label: "Beringia (land bridge)", lat: 65.5, lon: -169, fact: "During the Ice Age, Beringia joined **Siberia (Asia)** and **Alaska (North America)**. Today the Bering Strait covers it.", q: "s1mp5" },
      { id: "blackwater", label: "Blackwater Draw (Clovis points)", lat: 34.28, lon: -103.33, fact: "Near **Clovis, New Mexico**. Clovis points were found here with mammoth bones.", q: "s1q12" },
      { id: "monteverde", label: "Monte Verde (14,000+ year-old camp)", lat: -41.5, lon: -73.2, fact: "Monte Verde in **Chile** shows people reached far into South America very early.", q: "s1mp2" },
      { id: "cahokia", label: "Cahokia (Mississippian city)", lat: 38.66, lon: -90.06, fact: "Cahokia stood near the **Mississippi River**, close to present-day St. Louis.", q: "s1mp3" },
      { id: "tenochtitlan", lpos: "t", label: "Tenochtitlán (Aztec capital)", lat: 19.43, lon: -99.13, fact: "Built on an island in Lake Texcoco in 1325. Mexico City stands there today.", q: "s1q21" },
      { id: "tikal", label: "Tikal (Maya city)", lat: 17.22, lon: -89.62, fact: "A great **Maya** city of the Classic Age, in the rain forest of present-day Guatemala.", q: "s1mp1" },
      { id: "cusco", label: "Cusco (Inca capital)", lat: -13.53, lon: -71.97, fact: "High in the **Andes Mountains** of Peru.", q: "s1mp4" }
    ]
  }],
  questions: [
    { id: "s1mp1", topic: "meso", type: "mc", q: "Tikal was a great city built by which people?", choices: ["The Maya", "The Inca", "The Aztec", "The Haudenosaunee"], explain: "Tikal, in present-day Guatemala, flourished during the Maya Classic Age (about 250–900 CE)." },
    { id: "s1mp2", topic: "paleo", type: "mc", q: "Monte Verde, a camp more than 14,000 years old, is in which country?", choices: ["Chile", "Canada", "Mexico", "The United States"], explain: "Monte Verde is in southern Chile. It shows people reached far into South America very early." },
    { id: "s1mp3", topic: "mounds", type: "mc", q: "The Mississippian city of Cahokia was built near which river?", choices: ["The Mississippi River", "The Amazon River", "The Rio Grande", "The Hudson River"], explain: "Cahokia stood on the Mississippi River floodplain, near present-day St. Louis." },
    { id: "s1mp4", topic: "inca", type: "mc", q: "Cusco, the capital of the Inca Empire, is in which mountains?", choices: ["The Andes", "The Rocky Mountains", "The Appalachian Mountains", "The Alps"], explain: "The Inca Empire stretched along the Andes Mountains of South America." },
    { id: "s1mp5", topic: "beringia", type: "mc", q: "During the Ice Age, Beringia connected which two places?", choices: ["Siberia (Asia) and Alaska (North America)", "Europe and Greenland", "Africa and South America", "Florida and Cuba"], explain: "Low sea levels uncovered a wide land bridge between Siberia and Alaska." }
  ]
});
GAME_CONTENT.extend("s2", {
  activities: [{
    id: "s2-geomap", type: "geomap", geo: "s2", icon: "🧭", title: "Find the Homelands", topic: "regions",
    intro: "Drag each nation onto its homeland (or tap a label, then tap the spot). Each dot marks the **general area** where the nation lived. Many of these nations still live there today.",
    targets: [
      { id: "inuit", label: "Inuit (Arctic)", lat: 66, lon: -95, fact: "The Inuit live across the far north **Arctic**, from Alaska to Greenland.", q: "s2q2" },
      { id: "haida", label: "Haida (Northwest Coast)", lat: 53.3, lon: -132.1, fact: "The Haida homeland is the islands of **Haida Gwaii** off the Pacific Northwest coast.", q: "s2mp2" },
      { id: "chumash", label: "Chumash (California)", lat: 34.6, lon: -120.0, fact: "The Chumash lived along the coast of **southern California** and paddled plank canoes called tomols.", q: "s2mp4" },
      { id: "shoshone", label: "Shoshone (Great Basin)", lat: 40.5, lon: -116.5, fact: "In the dry **Great Basin**, groups like the Shoshone gathered seeds, nuts, and roots.", q: "s2mp5" },
      { id: "lakota", label: "Lakota (Great Plains)", lat: 44.0, lon: -101.5, fact: "The Lakota depended on the **buffalo** of the Great Plains.", q: "s2q7" },
      { id: "hopi", label: "Hopi (Southwest)", lat: 35.85, lon: -110.5, fact: "The Hopi live in northeastern **Arizona**. Oraibi, founded around 1100, is one of the oldest lived-in towns in the U.S.", q: "s2mp3" },
      { id: "haudenosaunee", label: "Haudenosaunee (Eastern Woodlands)", lat: 42.9, lon: -76.0, fact: "The Haudenosaunee homeland is in present-day **upstate New York**. The Onondaga were the Firekeepers.", q: "s2mp1" },
      { id: "cherokee", label: "Cherokee (Southeast)", lat: 35.3, lon: -83.5, fact: "The Cherokee homeland was in the southern **Appalachian Mountains**.", q: "s2q18" }
    ]
  }],
  questions: [
    { id: "s2mp1", topic: "iroquois", type: "mc", q: "The homeland of the Haudenosaunee (Iroquois) is in present-day ____.", choices: ["Upstate New York", "Arizona", "Florida", "Alaska"], explain: "The Mohawk, Oneida, Onondaga, Cayuga, and Seneca lived across what is now upstate New York." },
    { id: "s2mp2", topic: "northwest", type: "mc", q: "The Haida homeland, Haida Gwaii, is a group of islands off which coast?", choices: ["The Pacific Northwest coast", "The Gulf of Mexico coast", "The Atlantic coast of Georgia", "The coast of Greenland"], explain: "Haida Gwaii lies off the coast of British Columbia, in the Pacific Northwest." },
    { id: "s2mp3", topic: "southwest", type: "mc", q: "The Hopi homeland is in which culture region?", choices: ["The Southwest", "The Great Plains", "The Eastern Woodlands", "The Arctic"], explain: "The Hopi live in northeastern Arizona, in the dry Southwest." },
    { id: "s2mp4", topic: "regions", type: "mc", q: "The Chumash lived along the coast of present-day ____.", choices: ["Southern California", "Maine", "Texas", "Alaska"], explain: "The Chumash lived on the southern California coast and the Channel Islands." }
  ]
});
GAME_CONTENT.extend("s3", {
  activities: [{
    id: "s3-geomap", type: "geomap", geo: "s3", icon: "🧭", title: "Chart the Great Voyages", topic: "afterColumbus",
    intro: "Follow the four colored voyages, then drag each label onto its dot (or tap a label, then tap the spot). Routes are simplified.",
    routes: [
      { name: "Columbus, 1492", color: "#c0392b", pts: [[37.23, -6.89], [28.1, -15.4], [27, -40], [24.05, -74.5]] },
      { name: "Cabot, 1497", color: "#2b5fae", pts: [[51.45, -2.59], [52, -20], [50.5, -40], [48.5, -56]] },
      { name: "Vasco da Gama, 1497–1498", color: "#1e8449", pts: [[38.7, -9.14], [15, -23.5], [-10, -28], [-28, -15], [-34.36, 18.47], [-26, 33], [-15, 40.7], [-3.2, 40.1], [5, 60], [11.25, 75.78]] },
      { name: "Magellan–Elcano, 1519–1522", color: "#b7860b", pts: [[36.78, -6.35], [28.3, -16.5], [5, -25], [-22.9, -43.2], [-49.3, -67.7], [-53.5, -70.9], [-52.5, -75.5], [-35, -80], [-15, -125], [5, -170], [13.4, -215.2], [10.3, -236.1], [0.7, -232.6], [-9.5, -235.5], [-30, -285], [-34.36, -341.53], [-20, -350], [0, -355], [15, -383.5], [30, -375], [36.78, -366.35]] }
    ],
    targets: [
      { id: "palos", label: "Palos, Spain (Columbus sails, Aug. 3, 1492)", lat: 37.23, lon: -6.89, fact: "Columbus left **Palos, Spain**, on August 3, 1492.", q: "s3mp1" },
      { id: "canaries", label: "Canary Islands (Columbus's last stop)", lat: 28.1, lon: -15.4, fact: "Columbus stopped in the **Canary Islands** before crossing the ocean.", q: "s3mp1" },
      { id: "sansalvador", label: "San Salvador (landfall, Oct. 12, 1492)", lat: 24.05, lon: -74.5, fact: "An island in the **Bahamas**, home of the Taíno.", q: "s3q12" },
      { id: "newfoundland", label: "Newfoundland (Cabot, 1497, probably)", lat: 48.5, lon: -56, fact: "Cabot's landfall is debated, but it was probably **Newfoundland**. It gave England a claim.", q: "s3mp4" },
      { id: "goodhope", label: "Cape of Good Hope (Dias, 1488)", lat: -34.36, lon: 18.47, fact: "Bartolomeu Dias sailed around this cape near the southern tip of **Africa** in 1488.", q: "s3mp2" },
      { id: "calicut", label: "Calicut, India (da Gama, 1498)", lat: 11.25, lon: 75.78, fact: "Vasco da Gama reached India by sea in **1498**, opening a sea route for the spice trade.", q: "s3tl3" },
      { id: "strait", label: "Strait of Magellan (1520)", lat: -53.5, lon: -70.9, fact: "Magellan's fleet passed from the Atlantic to the Pacific near the tip of **South America**.", q: "s3mp3" },
      { id: "philippines", lpos: "t", label: "Philippines (Magellan killed, 1521)", lat: 10.3, lon: 123.97, fact: "Magellan was killed in 1521 in a battle with the forces of **Lapulapu**. Elcano brought the Victoria home in **1522**.", q: "s3q28" }
    ]
  }],
  questions: [
    { id: "s3mp1", topic: "columbus", type: "mc", q: "Columbus sailed from Palos, Spain, and stopped at which islands before crossing the Atlantic?", choices: ["The Canary Islands", "The Philippines", "The British Isles", "The Hawaiian Islands"], explain: "He stopped in the Canary Islands, then sailed west for more than five weeks." },
    { id: "s3mp2", topic: "navigation", type: "mc", q: "Bartolomeu Dias sailed around the Cape of Good Hope, near the southern tip of which continent?", choices: ["Africa", "South America", "Asia", "Australia"], explain: "In 1488 Dias rounded the Cape of Good Hope, near Africa's southern tip." },
    { id: "s3mp3", topic: "afterColumbus", type: "mc", q: "Magellan's fleet passed from the Atlantic Ocean to the Pacific through a strait near the southern tip of ____.", choices: ["South America", "Africa", "Asia", "North America"], explain: "The Strait of Magellan cuts through the southern tip of South America." },
    { id: "s3mp4", topic: "afterColumbus", type: "mc", q: "Sailing for England in 1497, John Cabot probably reached ____.", choices: ["Newfoundland", "Florida", "Brazil", "Cuba"], explain: "Cabot probably landed on Newfoundland, giving England a claim in North America." }
  ]
});
GAME_CONTENT.extend("s4", {
  activities: [{
    id: "s4-geomap", type: "geomap", geo: "s4", icon: "🧭", title: "Explorers and Settlements Map", topic: "spanishNA",
    intro: "Drag each label onto its dot (or tap a label, then tap the spot). The colored lines are **approximate** routes; historians still debate the exact paths of de Soto and Coronado.",
    routes: [
      { name: "Cartier, 1535", color: "#2b5fae", pts: [[48.5, -62], [49.2, -66], [48, -69.5], [46.81, -71.21], [45.5, -73.6]] },
      { name: "Hudson, 1609", color: "#e67e22", pts: [[40.45, -73.9], [41.4, -73.95], [42.65, -73.75]] },
      { name: "De Soto, 1539–1542", color: "#c0392b", pts: [[27.7, -82.6], [30.4, -84.3], [32.5, -83], [34.0, -80.8], [35.6, -82.5], [34.5, -84.9], [31.9, -87.6], [34.2, -88.7], [34.6, -90.6], [35.0, -93.5]] },
      { name: "Coronado, 1540–1542", color: "#b7860b", pts: [[21.2, -104.9], [24.8, -107.4], [31.3, -109.5], [34.97, -108.9], [35.3, -106.6], [34.9, -101.6], [38.3, -98.2]] }
    ],
    targets: [
      { id: "staugustine", label: "St. Augustine (Spain, 1565)", lat: 29.9, lon: -81.31, fact: "The **oldest continuously occupied European-founded city** in the United States.", q: "s4q7" },
      { id: "santafe", label: "Santa Fe (Spain, about 1610)", lat: 35.69, lon: -105.94, fact: "The capital of Spanish New Mexico, at the north end of El Camino Real.", q: "s4mp5" },
      { id: "mexicocity", label: "Mexico City (capital of New Spain)", lat: 19.43, lon: -99.13, fact: "Built on the ruins of Tenochtitlán after 1521.", q: "s4mp6" },
      { id: "quebec", label: "Quebec (France, 1608)", lat: 46.81, lon: -71.21, fact: "Champlain founded Quebec on the **St. Lawrence River**.", q: "s4mp2" },
      { id: "newamsterdam", label: "New Amsterdam (Dutch, 1620s)", lat: 40.70, lon: -74.01, fact: "On **Manhattan Island**, at the mouth of the Hudson River. It became New York in 1664.", q: "s4mp1" },
      { id: "neworleans", label: "New Orleans (France, 1718)", lat: 29.95, lon: -90.07, fact: "Founded near the mouth of the Mississippi, in the land La Salle had named Louisiana.", q: "s4mp7" },
      { id: "desoto", label: "De Soto reaches the Mississippi (1541)", lat: 34.6, lon: -90.6, fact: "De Soto's army crossed the Mississippi River in 1541 after marching across the **Southeast**.", q: "s4mp3" },
      { id: "quivira", label: "Quivira (Coronado's farthest point, 1541)", lat: 38.3, lon: -98.2, fact: "Coronado hunted for the Seven Cities of Gold and reached present-day **Kansas**, finding grass-house villages, not gold.", q: "s4mp4" }
    ]
  }],
  questions: [
    { id: "s4mp1", topic: "dutch", type: "mc", q: "The Dutch town of New Amsterdam was built on which island?", choices: ["Manhattan", "Roanoke Island", "Cuba", "Newfoundland"], explain: "New Amsterdam stood at the southern tip of Manhattan, at the mouth of the Hudson River." },
    { id: "s4mp2", topic: "france", type: "mc", q: "Quebec was founded on which river?", choices: ["The St. Lawrence River", "The Mississippi River", "The Hudson River", "The Rio Grande"], explain: "Champlain built Quebec on the St. Lawrence River in 1608." },
    { id: "s4mp3", topic: "spanishNA", type: "mc", q: "Hernando de Soto explored which region of today's United States before reaching the Mississippi River in 1541?", choices: ["The Southeast", "The Pacific Northwest", "New England", "Alaska"], explain: "De Soto landed in Florida in 1539 and marched through the Southeast." },
    { id: "s4mp4", topic: "spanishNA", type: "mc", q: "Searching for the Seven Cities of Gold, Coronado's expedition traveled through the Southwest and onto the ____.", choices: ["Great Plains", "Arctic coast", "Florida Keys", "Atlantic coast of Maine"], explain: "Coronado crossed the Southwest and the southern Great Plains, reaching present-day Kansas in 1541." }
  ]
});
GAME_CONTENT.extend("s5", {
  activities: [{
    id: "s5-geomap", type: "geomap", geo: "s5", icon: "🧭", title: "Map Virginia and Plymouth", topic: "pilgrims",
    intro: "Drag each label onto its dot (or tap a label, then tap the spot). The gold line shows the Mayflower's path along Cape Cod in November and December 1620 (simplified).",
    routes: [
      { name: "Mayflower, Nov.–Dec. 1620", color: "#b7860b", pts: [[41.35, -69.4], [41.85, -69.88], [41.55, -69.93], [41.85, -69.92], [42.05, -70.17], [41.98, -70.45], [41.96, -70.64]] }
    ],
    targets: [
      { id: "roanoke", label: "Roanoke Island (\"Lost Colony,\" 1587)", lat: 35.88, lon: -75.66, fact: "Roanoke Island is in present-day **North Carolina**.", q: "s5mp1" },
      { id: "jamestown", label: "Jamestown (1607)", lat: 37.21, lon: -76.78, fact: "Built on the **James River** in Virginia, the first permanent English settlement in North America.", q: "s5mp2" },
      { id: "chesapeake", label: "Chesapeake Bay (mapped by John Smith)", lat: 38.0, lon: -76.25, fact: "John Smith explored and **mapped the Chesapeake Bay** in 1608.", q: "s5mp5" },
      { id: "hudson", label: "Mouth of the Hudson River (where the Pilgrims aimed)", lat: 40.55, lon: -74.0, fact: "The Pilgrims planned to settle near the Hudson River, inside Virginia Company land.", q: "s5mp3" },
      { id: "capecod", lpos: "t", label: "Cape Cod (Compact signed, Nov. 11, 1620)", lat: 42.0, lon: -70.1, fact: "The Mayflower anchored in today's Provincetown Harbor at the tip of Cape Cod, where 41 men signed the Compact.", q: "s5q16" },
      { id: "plymouth", lpos: "b", label: "Plymouth (Dec. 1620)", lat: 41.96, lon: -70.67, fact: "Plymouth Colony was built on the land of **Patuxet**, in present-day Massachusetts.", q: "s5mp4" }
    ]
  }],
  questions: [
    { id: "s5mp1", topic: "roanoke", type: "mc", q: "Roanoke Island, home of the \"Lost Colony,\" is in present-day ____.", choices: ["North Carolina", "Virginia", "Massachusetts", "Florida"], explain: "Roanoke Island lies off the coast of North Carolina." },
    { id: "s5mp2", topic: "jamestown", type: "mc", q: "Jamestown was built on which river?", choices: ["The James River", "The Hudson River", "The Mississippi River", "The St. Lawrence River"], explain: "The colonists named both the river and the town after King James I." },
    { id: "s5mp3", topic: "pilgrims", type: "mc", q: "The Pilgrims planned to settle near the mouth of which river, inside Virginia Company land?", choices: ["The Hudson River", "The James River", "The Mississippi River", "The St. Lawrence River"], explain: "William Bradford wrote that they aimed for \"some place about Hudson's River,\" but they ended up at Cape Cod." },
    { id: "s5mp4", topic: "plymouth", type: "mc", q: "Plymouth Colony was built in present-day ____.", choices: ["Massachusetts", "Virginia", "New York", "North Carolina"], explain: "Plymouth is on the Massachusetts coast, on the land of the Patuxet village." }
  ]
});
GAME_CONTENT.extend("s6", {
  activities: [{
    id: "s6-geomap", type: "geomap", geo: "s6", icon: "🧭", title: "Label the Thirteen Colonies", topic: "middle",
    intro: "Drag each colony's name onto its dot (or tap a name, then tap the dot). Dots mark roughly where each colony was; colonial borders changed over time, so they are not drawn. Massachusetts also included Maine.",
    targets: [
      { id: "nh", label: "New Hampshire", lat: 43.4, lon: -71.6, region: "ne", fact: "A **New England** colony.", q: "s6mp4" },
      { id: "ma", label: "Massachusetts", lat: 42.35, lon: -72.0, region: "ne", fact: "**New England**. Massachusetts Bay (Boston) was founded in 1630.", q: "s6mp5" },
      { id: "ri", lpos: "b", label: "Rhode Island", lat: 41.65, lon: -71.5, region: "ne", fact: "**New England**. Roger Williams founded it in 1636 with religious freedom.", q: "s6mp3" },
      { id: "ct", label: "Connecticut", lat: 41.6, lon: -72.7, region: "ne", fact: "**New England**. Its Fundamental Orders (1639) were the first written constitution in the colonies.", q: "s6mp6" },
      { id: "ny", label: "New York", lat: 42.3, lon: -74.3, region: "mid", fact: "A **Middle Colony**, once Dutch New Netherland (until 1664).", q: "s6mp7" },
      { id: "nj", label: "New Jersey", lat: 40.2, lon: -74.6, region: "mid", fact: "A **Middle Colony**, across the Delaware River from Pennsylvania.", q: "s6mp2" },
      { id: "pa", label: "Pennsylvania", lat: 40.6, lon: -77.0, region: "mid", fact: "A **Middle Colony**, founded by William Penn in 1681.", q: "s6mp8" },
      { id: "de", label: "Delaware", lat: 38.95, lon: -75.45, region: "mid", fact: "A **Middle Colony**, once part of New Sweden.", q: "s6mp9" },
      { id: "md", label: "Maryland", lat: 39.2, lon: -76.8, region: "south", fact: "A **Southern Colony**, founded in 1634 as a refuge for Catholics.", q: "s6mp10" },
      { id: "va", label: "Virginia", lat: 37.5, lon: -78.3, region: "south", fact: "A **Southern Colony**, home of Jamestown (1607).", q: "s6mp11" },
      { id: "nc", label: "North Carolina", lat: 35.6, lon: -79.3, region: "south", fact: "A **Southern Colony**. Its pine forests made tar, pitch, and turpentine.", q: "s6mp12" },
      { id: "sc", label: "South Carolina", lat: 33.9, lon: -80.9, region: "south", fact: "A **Southern Colony**. Charles Town (Charleston) was founded in 1670.", q: "s6mp13" },
      { id: "ga", label: "Georgia", lat: 32.4, lon: -82.3, region: "south", fact: "The **southernmost** colony, founded by James Oglethorpe in 1732 as a buffer against Spanish Florida.", q: "s6mp1" }
    ]
  }],
  questions: [
    { id: "s6mp1", topic: "southern", type: "mc", q: "Which of the thirteen colonies was the farthest south?", choices: ["Georgia", "Virginia", "Maryland", "Delaware"], explain: "Georgia, founded in 1732, was a buffer between the Carolinas and Spanish Florida." },
    { id: "s6mp2", topic: "middle", type: "mc", q: "Which colony lay across the Delaware River from Pennsylvania?", choices: ["New Jersey", "Georgia", "Connecticut", "South Carolina"], explain: "New Jersey is on the east bank of the Delaware River, across from Pennsylvania." },
    { id: "s6mp3", topic: "newengland", type: "mc", q: "In which region was the colony of Rhode Island?", choices: ["New England", "The Middle Colonies", "The Southern Colonies", "New France"], explain: "Rhode Island was one of the four New England colonies, with Massachusetts, Connecticut, and New Hampshire." }
  ]
});
/* Facts the map and timeline items use that the lessons did not yet say. */
GAME_CONTENT.extend("s2", { addText: {
  northwest: ["**Map fact:** The Haida homeland is **Haida Gwaii**, a group of islands off the coast of present-day British Columbia, in the Pacific Northwest."],
  iroquois: ["**Timeline fact:** Around **1722** the **Tuscarora**, who had moved north from the Carolinas, joined the Confederacy as its **sixth nation**. The date the first five nations united is debated: some say 1142, and many historians say between 1450 and 1600."]
} });
GAME_CONTENT.extend("s3", { addText: {
  navigation: ["**Map fact:** Vasco da Gama landed at **Calicut**, a spice-trading city on the southwest coast of India, in **1498**."]
} });
GAME_CONTENT.extend("s4", { addText: {
  spanishNA: ["**Map fact:** Coronado (1540–1542) crossed the Southwest and the southern **Great Plains**, reaching a place called **Quivira** in present-day **Kansas** in 1541. He found grass-house villages, not gold. Historians still debate the exact routes of Coronado and de Soto."]
} });
GAME_CONTENT.extend("s5", { addText: {
  pilgrims: ["**Map fact:** The Pilgrims had planned to settle near the mouth of the **Hudson River**, at the northern edge of Virginia Company land. When they tried to sail south from Cape Cod, dangerous shoals turned them back, so they anchored at the tip of Cape Cod (today's **Provincetown Harbor**). There, on **November 11, 1620**, the men signed the Compact. In December they settled at **Plymouth**."]
} });

/* v2.1: questions linked to map spots so every placement mistake has a review question */
GAME_CONTENT.extend("s2", { questions: [
    { id: "s2mp5", topic: "regions", type: "mc", q: "The Shoshone and Ute moved often, gathering seeds, nuts, and roots. Which dry region was their homeland?", choices: ["The Great Basin", "The Pacific Northwest", "The Arctic", "The Southeast"], explain: "In the dry Great Basin, groups such as the Shoshone and Ute moved often to find food." }
] });
GAME_CONTENT.extend("s4", { addText: {
  conquest: ["**Map fact:** After 1521 the Spanish built **Mexico City** on the ruins of Tenochtitlán. It became the capital of **New Spain**."]
}, questions: [
    { id: "s4mp5", topic: "spanishNA", type: "mc", q: "Around 1610, the Spanish founded which town in New Mexico?", choices: ["Santa Fe", "St. Augustine", "Quebec", "New Orleans"], explain: "Santa Fe, founded around 1610, became the capital of Spanish New Mexico." },
    { id: "s4mp6", topic: "conquest", type: "mc", q: "Mexico City, the capital of New Spain, was built on the ruins of which city?", choices: ["Tenochtitlán", "Cusco", "Cahokia", "Quebec"], explain: "The Spanish built Mexico City on the ruins of the Aztec capital, Tenochtitlán." },
    { id: "s4mp7", topic: "france", type: "mc", q: "New Orleans, founded in 1718 near the mouth of the Mississippi River, was a town of which country?", choices: ["France", "Spain", "The Netherlands", "England"], explain: "New Orleans was founded in French Louisiana, the land La Salle had claimed for France." }
] });
GAME_CONTENT.extend("s5", { questions: [
    { id: "s5mp5", topic: "jamestown", type: "mc", q: "Captain John Smith explored and mapped which large bay near Jamestown?", choices: ["Chesapeake Bay", "Cape Cod Bay", "Hudson Bay", "Delaware Bay"], explain: "Jamestown was on the James River, which flows into the Chesapeake Bay. John Smith mapped the bay in 1608." }
] });
GAME_CONTENT.extend("s6", { questions: [
    { id: "s6mp4", topic: "newengland", type: "mc", q: "In which region was the colony of New Hampshire?", choices: ["New England", "The Middle Colonies", "The Southern Colonies", "New France"], explain: "The New England colonies were Massachusetts, New Hampshire, Connecticut, and Rhode Island." },
    { id: "s6mp5", topic: "newengland", type: "mc", q: "In which region was the colony of Massachusetts?", choices: ["New England", "The Middle Colonies", "The Southern Colonies", "New France"], explain: "The New England colonies were Massachusetts, New Hampshire, Connecticut, and Rhode Island." },
    { id: "s6mp6", topic: "newengland", type: "mc", q: "In which region was the colony of Connecticut?", choices: ["New England", "The Middle Colonies", "The Southern Colonies", "New France"], explain: "The New England colonies were Massachusetts, New Hampshire, Connecticut, and Rhode Island." },
    { id: "s6mp7", topic: "middle", type: "mc", q: "In which region was the colony of New York?", choices: ["The Middle Colonies", "New England", "The Southern Colonies", "New France"], explain: "The Middle Colonies were New York, New Jersey, Pennsylvania, and Delaware." },
    { id: "s6mp8", topic: "middle", type: "mc", q: "In which region was the colony of Pennsylvania?", choices: ["The Middle Colonies", "New England", "The Southern Colonies", "New France"], explain: "The Middle Colonies were New York, New Jersey, Pennsylvania, and Delaware." },
    { id: "s6mp9", topic: "middle", type: "mc", q: "In which region was the colony of Delaware?", choices: ["The Middle Colonies", "New England", "The Southern Colonies", "New France"], explain: "The Middle Colonies were New York, New Jersey, Pennsylvania, and Delaware." },
    { id: "s6mp10", topic: "southern", type: "mc", q: "In which region was the colony of Maryland?", choices: ["The Southern Colonies", "New England", "The Middle Colonies", "New France"], explain: "The Southern Colonies were Maryland, Virginia, North Carolina, South Carolina, and Georgia." },
    { id: "s6mp11", topic: "southern", type: "mc", q: "In which region was the colony of Virginia?", choices: ["The Southern Colonies", "New England", "The Middle Colonies", "New France"], explain: "The Southern Colonies were Maryland, Virginia, North Carolina, South Carolina, and Georgia." },
    { id: "s6mp12", topic: "southern", type: "mc", q: "In which region was the colony of North Carolina?", choices: ["The Southern Colonies", "New England", "The Middle Colonies", "New France"], explain: "The Southern Colonies were Maryland, Virginia, North Carolina, South Carolina, and Georgia." },
    { id: "s6mp13", topic: "southern", type: "mc", q: "In which region was the colony of South Carolina?", choices: ["The Southern Colonies", "New England", "The Middle Colonies", "New France"], explain: "The Southern Colonies were Maryland, Virginia, North Carolina, South Carolina, and Georgia." }
] });
