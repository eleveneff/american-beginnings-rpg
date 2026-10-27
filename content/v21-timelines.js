/* v2.1: Timeline challenges ("timeline" activities). One event starts on the
   timeline; the player drags (or taps) each card into the right gap. `y` is a
   sort key only (years CE; "years ago" dates use 2000 minus the number), and
   `when` is the date shown to the player. Dates were checked against the
   lessons and standard references; debated dates (such as the founding of the
   Haudenosaunee Confederacy) are left out on purpose. */
GAME_CONTENT.extend("s1", {
  activities: [{
    id: "s1-timeline", type: "timeline", icon: "📜", title: "Timeline of the First Americans", topic: "meso",
    intro: "Put each event in the right place on the timeline. Older events go at the **top**. Dates this old are estimates from archaeology.",
    events: [
      { t: "People camp at Monte Verde, Chile", when: "more than 14,000 years ago", y: -12100, q: "s1tl1" },
      { t: "Clovis hunters make fluted spear points", when: "about 13,000 years ago", y: -11000, q: "s1tl2" },
      { t: "Farmers in Mexico begin growing maize (corn) from a wild grass", when: "about 9,000 years ago", y: -7000, q: "s1q15" },
      { t: "The Olmec carve giant stone heads", when: "about 3,000 years ago", y: -1000, q: "s1q19" },
      { t: "The Maya Classic Age", when: "about 250–900 CE", y: 250, q: "s1tl4" },
      { t: "Cahokia is at its peak", when: "about 1100 CE", y: 1100, q: "s1q25" },
      { t: "The Aztec found Tenochtitlán", when: "1325", y: 1325, q: "s1tl3" },
      { t: "Pachacuti greatly expands the Inca Empire", when: "1400s", y: 1438, q: "s1tl5" }
    ]
  }],
  questions: [
    { id: "s1tl1", topic: "paleo", type: "mc", q: "Which came first?", choices: ["People camping at Monte Verde, Chile", "The Maya Classic Age", "Cahokia at its peak", "The founding of Tenochtitlán"], explain: "Monte Verde is more than 14,000 years old, thousands of years before the others." },
    { id: "s1tl2", topic: "clovis", type: "mc", q: "Which came first: Clovis spear points or the Maya Classic Age?", choices: ["Clovis spear points (about 13,000 years ago)", "The Maya Classic Age (about 250–900 CE)"], explain: "Clovis points are about 13,000 years old. The Maya Classic Age began about 250 CE." },
    { id: "s1tl3", topic: "meso", type: "fill", q: "The Aztec founded their capital, Tenochtitlán, in the year ____.", accept: ["1325"], display: "1325", explain: "Tenochtitlán was founded in 1325 on an island in Lake Texcoco." },
    { id: "s1tl4", topic: "meso", type: "fill", q: "The Maya Classic Age lasted from about 250 to ____ CE.", accept: ["900", "900 ce", "900ce"], display: "900", explain: "The Maya Classic Age ran from about 250 to 900 CE." },
    { id: "s1tl5", topic: "inca", type: "mc", q: "Which of these happened LAST?", choices: ["Pachacuti expands the Inca Empire (1400s)", "Cahokia is at its peak (about 1100)", "Clovis hunters make spear points", "The Olmec carve giant stone heads"], explain: "Pachacuti ruled in the 1400s, shortly before the Spanish arrived." }
  ]
});
GAME_CONTENT.extend("s2", {
  activities: [{
    id: "s2-timeline", type: "timeline", icon: "📜", title: "Timeline of the Nations", topic: "southwest",
    intro: "Put each event in the right place on the timeline. Earlier events go at the **top**.",
    events: [
      { t: "The Hopi village of Oraibi is founded", when: "about 1100", y: 1100, q: "s2tl1" },
      { t: "Most of the cliff dwellings at Mesa Verde are built", when: "about 1190–1280", y: 1190, q: "s1q26" },
      { t: "Columbus reaches the Caribbean; the Taíno meet Europeans", when: "1492", y: 1492, q: "s2tl2" },
      { t: "Cabeza de Vaca and Estevanico are shipwrecked on the Gulf Coast", when: "1528", y: 1528, q: "s4q22" },
      { t: "The Pueblo Revolt drives the Spanish out of New Mexico", when: "1680", y: 1680, q: "s4q12" },
      { t: "The Tuscarora join the Haudenosaunee as the sixth nation", when: "about 1722", y: 1722, q: "s2tl3" }
    ]
  }],
  questions: [
    { id: "s2tl1", topic: "southwest", type: "fill", q: "The Hopi village of Oraibi was founded around the year ____.", accept: ["1100"], display: "1100", explain: "Oraibi was founded around 1100 and is one of the oldest continuously lived-in towns in the United States." },
    { id: "s2tl2", topic: "southwest", type: "mc", q: "Which came first?", choices: ["The founding of Oraibi (about 1100)", "Columbus's first voyage (1492)", "The Pueblo Revolt (1680)", "The Tuscarora join the Haudenosaunee (about 1722)"], explain: "Oraibi was already about 400 years old when Columbus sailed." },
    { id: "s2tl3", topic: "iroquois", type: "mc", q: "About when did the Tuscarora become the sixth nation of the Haudenosaunee Confederacy?", choices: ["About 1722", "About 1142", "About 1492", "About 1607"], explain: "The Tuscarora moved north from the Carolinas and joined the Confederacy around 1722." },
    { id: "s2tl4", topic: "iroquois", type: "mc", q: "Why is the founding of the Haudenosaunee Confederacy left off our timeline?", choices: ["Historians disagree about the date: some say 1142, many say between 1450 and 1600", "It happened after 1754", "It was founded by the Spanish", "It never had a founding"], explain: "Oral history, eclipse studies, and archaeology point to different dates, so honest historians give a range." }
  ]
});
GAME_CONTENT.extend("s3", {
  activities: [{
    id: "s3-timeline", type: "timeline", icon: "📜", title: "Timeline of the Age of Exploration", topic: "navigation",
    intro: "Put each event in the right place on the timeline. Earlier events go at the **top**.",
    events: [
      { t: "Zheng He's great Chinese fleets begin their voyages", when: "1405", y: 1405, q: "s3tl5" },
      { t: "The Ottoman Turks capture Constantinople", when: "1453", y: 1453, q: "s3tl6" },
      { t: "Bartolomeu Dias sails around the Cape of Good Hope", when: "1488", y: 1488, q: "s3tl1" },
      { t: "Columbus lands on San Salvador", when: "October 12, 1492", y: 1492, q: "s3q12" },
      { t: "Spain and Portugal sign the Treaty of Tordesillas", when: "1494", y: 1494, q: "s3tl2" },
      { t: "Vasco da Gama reaches India by sea", when: "1498", y: 1498, q: "s3tl3" },
      { t: "Balboa sees the Pacific Ocean", when: "1513", y: 1513, q: "s3q27" },
      { t: "The Victoria returns to Spain after sailing around the world", when: "1522", y: 1522, q: "s3tl4" }
    ]
  }],
  questions: [
    { id: "s3tl1", topic: "navigation", type: "mc", q: "Which came first?", choices: ["Dias sails around the Cape of Good Hope (1488)", "Columbus lands on San Salvador (1492)", "Vasco da Gama reaches India (1498)", "Balboa sees the Pacific (1513)"], explain: "Dias rounded the cape in 1488, four years before Columbus sailed west." },
    { id: "s3tl2", topic: "afterColumbus", type: "fill", q: "Spain and Portugal signed the Treaty of Tordesillas in the year ____.", accept: ["1494"], display: "1494", explain: "1494, two years after Columbus's first voyage." },
    { id: "s3tl3", topic: "navigation", type: "fill", q: "Vasco da Gama reached India by sea in the year ____.", accept: ["1498"], display: "1498", explain: "Da Gama sailed around Africa and reached Calicut, India, in 1498." },
    { id: "s3tl4", topic: "afterColumbus", type: "fill", q: "The Victoria returned to Spain, finishing the first voyage around the world, in the year ____.", accept: ["1522"], display: "1522", explain: "Juan Sebastián Elcano brought the Victoria home in 1522, three years after the fleet left." },
    { id: "s3tl5", topic: "voices3", type: "mc", q: "Which came first: Zheng He's voyages or Columbus's first voyage?", choices: ["Zheng He's voyages (1405–1433)", "Columbus's first voyage (1492)"], explain: "Zheng He's fleets sailed decades before Columbus, from 1405 to 1433." }
  ]
});
GAME_CONTENT.extend("s4", {
  activities: [{
    id: "s4-timeline", type: "timeline", icon: "📜", title: "Timeline of the Empires", topic: "dutch",
    intro: "Put each event in the right place on the timeline. Earlier events go at the **top**.",
    events: [
      { t: "Tenochtitlán falls to Cortés and his Native allies", when: "1521", y: 1521, q: "s4tl3" },
      { t: "Hernando de Soto reaches the Mississippi River", when: "1541", y: 1541, q: "s4tl2" },
      { t: "The Spanish found St. Augustine, Florida", when: "1565", y: 1565, q: "s4tl1" },
      { t: "Champlain founds Quebec", when: "1608", y: 1608, q: "s4q14" },
      { t: "Peter Minuit's Manhattan deal with the Lenape", when: "1626", y: 1626, q: "s4tl6" },
      { t: "England takes New Netherland and renames it New York", when: "1664", y: 1664, q: "s4tl5" },
      { t: "The Pueblo Revolt", when: "1680", y: 1680, q: "s4q12" },
      { t: "La Salle claims the Mississippi basin for France as \"Louisiana\"", when: "1682", y: 1682, q: "s4tl4" }
    ]
  }],
  questions: [
    { id: "s4tl1", topic: "spanishNA", type: "fill", q: "The Spanish founded St. Augustine, Florida, in the year ____.", accept: ["1565"], display: "1565", explain: "1565, making it the oldest continuously occupied European-founded city in the United States." },
    { id: "s4tl2", topic: "spanishNA", type: "fill", q: "Hernando de Soto's expedition reached the Mississippi River in the year ____.", accept: ["1541"], display: "1541", explain: "De Soto reached the Mississippi in 1541 and died beside it in 1542." },
    { id: "s4tl3", topic: "conquest", type: "mc", q: "Which came first?", choices: ["The fall of Tenochtitlán (1521)", "The founding of St. Augustine (1565)", "The founding of Quebec (1608)", "The Pueblo Revolt (1680)"], explain: "Tenochtitlán fell in 1521, decades before any of the others." },
    { id: "s4tl4", topic: "france", type: "mc", q: "Which of these happened LAST?", choices: ["La Salle claims Louisiana for France (1682)", "England takes New Netherland (1664)", "Peter Minuit's Manhattan deal (1626)", "Henry Hudson sails up the Hudson River (1609)"], explain: "La Salle reached the mouth of the Mississippi and claimed Louisiana in 1682." },
    { id: "s4tl5", topic: "dutch", type: "fill", q: "England took New Netherland and renamed it New York in the year ____.", accept: ["1664"], display: "1664", explain: "In 1664 English warships arrived and Peter Stuyvesant surrendered without a fight." }
  ]
});
GAME_CONTENT.extend("s5", {
  activities: [{
    id: "s5-timeline", type: "timeline", icon: "📜", title: "Timeline of Jamestown and Plymouth", topic: "jamestown",
    intro: "Put each event in the right place on the timeline. Earlier events go at the **top**.",
    events: [
      { t: "John White's colonists land at Roanoke Island", when: "1587", y: 1587, q: "s5tl1" },
      { t: "Jamestown is founded", when: "May 1607", y: 1607, q: "s5q4" },
      { t: "The \"Starving Time\" at Jamestown", when: "winter 1609–1610", y: 1609.9, q: "s5tl4" },
      { t: "Pocahontas marries John Rolfe", when: "1614", y: 1614, q: "s5tl3" },
      { t: "The House of Burgesses first meets", when: "July 30, 1619", y: 1619.58, q: "s5tl2" },
      { t: "The Mayflower Compact is signed", when: "November 11, 1620", y: 1620.86, q: "s5q16" },
      { t: "Pilgrims and Wampanoag share a harvest feast", when: "fall 1621", y: 1621.8, q: "s5q18" },
      { t: "Virginia becomes a royal colony", when: "1624", y: 1624, q: "s5tl5" }
    ]
  }],
  questions: [
    { id: "s5tl1", topic: "roanoke", type: "mc", q: "Which came first?", choices: ["The Roanoke colony (1587)", "Jamestown (1607)", "The House of Burgesses (1619)", "The Mayflower Compact (1620)"], explain: "Roanoke came twenty years before Jamestown." },
    { id: "s5tl2", topic: "selfgov5", type: "fill", q: "Virginia's House of Burgesses first met on July 30, ____.", accept: ["1619"], display: "1619", explain: "It met in Jamestown's church on July 30, 1619, the first elected assembly in English America." },
    { id: "s5tl3", topic: "tobacco", type: "fill", q: "Pocahontas married John Rolfe in the year ____.", accept: ["1614"], display: "1614", explain: "Their marriage in 1614 brought several years of peace." },
    { id: "s5tl4", topic: "jamestown", type: "mc", q: "Which came first: the Starving Time or Pocahontas's marriage to John Rolfe?", choices: ["The Starving Time (winter 1609–1610)", "Pocahontas marries John Rolfe (1614)"], explain: "The Starving Time was the winter of 1609–1610; the marriage came in 1614." },
    { id: "s5tl5", topic: "tobacco", type: "fill", q: "King James I made Virginia a royal colony in the year ____.", accept: ["1624"], display: "1624", explain: "In 1624 the king took over from the Virginia Company." }
  ]
});
GAME_CONTENT.extend("s6", {
  activities: [{
    id: "s6-timeline", type: "timeline", icon: "📜", title: "Timeline of the Thirteen Colonies", topic: "newengland",
    intro: "Put each event in the right place on the timeline. Earlier events go at the **top**.",
    events: [
      { t: "The Massachusetts Bay Colony is founded", when: "1630", y: 1630, q: "s6tl3" },
      { t: "Roger Williams founds Rhode Island", when: "1636", y: 1636, q: "s6tl5" },
      { t: "Connecticut adopts the Fundamental Orders", when: "1639", y: 1639, q: "s6q5" },
      { t: "King Charles II grants the Carolina charter", when: "1663", y: 1663, q: "s6tl6" },
      { t: "King Philip's War", when: "1675–1676", y: 1675, q: "s6q27" },
      { t: "William Penn founds Pennsylvania", when: "1681", y: 1681, q: "s6tl2" },
      { t: "The Salem witch trials", when: "1692", y: 1692, q: "s6tl4" },
      { t: "James Oglethorpe founds Georgia", when: "1732", y: 1732, q: "s6tl1" }
    ]
  }],
  questions: [
    { id: "s6tl1", topic: "southern", type: "fill", q: "James Oglethorpe founded Georgia in the year ____.", accept: ["1732"], display: "1732", explain: "Georgia, founded in 1732, was the last of the thirteen colonies." },
    { id: "s6tl2", topic: "middle", type: "fill", q: "William Penn founded Pennsylvania in the year ____.", accept: ["1681"], display: "1681", explain: "King Charles II granted Penn the land in 1681." },
    { id: "s6tl3", topic: "newengland", type: "mc", q: "Which came first?", choices: ["The Massachusetts Bay Colony (1630)", "Rhode Island (1636)", "Pennsylvania (1681)", "Georgia (1732)"], explain: "John Winthrop's Puritans founded Massachusetts Bay in 1630." },
    { id: "s6tl4", topic: "ideas", type: "mc", q: "Which of these happened LAST?", choices: ["Franklin's kite experiment (1752)", "The Salem witch trials (1692)", "King Philip's War (1675–1676)", "The Fundamental Orders of Connecticut (1639)"], explain: "Franklin's kite experiment was in 1752, just before the end of this unit." },
    { id: "s6tl5", topic: "newengland", type: "fill", q: "Roger Williams founded Rhode Island in the year ____.", accept: ["1636"], display: "1636", explain: "Banished from Massachusetts, Williams founded Providence in 1636." }
  ]
});
/* The Grand Timeline (1492–1754) is practice before the Grand Trial. Each
   event links to a question in its land, so a miss feeds that land's review. */
GAME_CONTENT.finalActivities = [{
  id: "final-timeline", type: "timeline", icon: "🏛️", title: "The Grand Timeline, 1492–1754", topic: null,
  intro: "Warm up for the Grand Trial: build the whole story of American beginnings, from Columbus to the eve of the French and Indian War. Earlier events go at the **top**.",
  events: [
    { t: "Columbus reaches the Americas", when: "1492", y: 1492, q: "s3tl1" },
    { t: "Tenochtitlán falls to Cortés and his allies", when: "1521", y: 1521, q: "s4tl3" },
    { t: "The Spanish found St. Augustine", when: "1565", y: 1565, q: "s4tl1" },
    { t: "Jamestown is founded", when: "1607", y: 1607, q: "s5q4" },
    { t: "The Mayflower Compact is signed", when: "1620", y: 1620, q: "s5tl1" },
    { t: "The Massachusetts Bay Colony is founded", when: "1630", y: 1630, q: "s6tl3" },
    { t: "New Netherland becomes New York", when: "1664", y: 1664, q: "s4tl5" },
    { t: "William Penn founds Pennsylvania", when: "1681", y: 1681, q: "s6tl2" },
    { t: "Georgia, the last of the thirteen colonies, is founded", when: "1732", y: 1732, q: "s6tl1" },
    { t: "Ben Franklin's kite experiment", when: "1752", y: 1752, q: "s6tl4" }
  ]
}];

/* v2.1: questions linked to timeline events so every ordering mistake has a review question */
GAME_CONTENT.extend("s3", { questions: [
    { id: "s3tl6", topic: "motives", type: "fill", q: "The Ottoman Turks captured Constantinople in the year ____.", accept: ["1453"], display: "1453", explain: "After 1453, trade with Asia became even harder, so Europeans looked for an all-water route." }
] });
GAME_CONTENT.extend("s4", { questions: [
    { id: "s4tl6", topic: "dutch", type: "fill", q: "In 1626, Peter Minuit traded goods to the ____ people for the use of Manhattan.", accept: ["lenape", "the lenape", "lenni lenape", "lenni-lenape"], display: "Lenape", explain: "Minuit's 1626 deal was with the Lenape. The two sides probably understood the deal differently." }
] });
GAME_CONTENT.extend("s6", { addText: {
  southern: ["**Timeline fact:** In **1663**, King **Charles II** of England granted the Carolina charter to eight of his supporters, called the **Lords Proprietors**."]
}, questions: [
    { id: "s6tl6", topic: "southern", type: "fill", q: "King Charles II granted the Carolina charter in the year ____.", accept: ["1663"], display: "1663", explain: "Carolina was chartered in 1663. Charles Town (Charleston) was founded in 1670." }
] });
