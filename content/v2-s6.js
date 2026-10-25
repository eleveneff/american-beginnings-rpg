/* v2 additions: The Thirteen Colonies Grow */
GAME_CONTENT.extend("s6", {
  gear: [
    { key: "apron", name: "Linen Apron & Sampler", icon: "🧵", slot: "belt", art: "apron", color: "#e8d7b5", desc: "Tied at the waist and stitched with the whole alphabet." },
    { key: "candle", name: "Beeswax Candle", icon: "🕯️", slot: "hand", art: "candle", color: "#ffe08a", desc: "Dipped by hand, twenty times over." },
    { key: "almanack", name: "Poor Richard's Almanack", icon: "📖", slot: "offhand", art: "almanack", color: "#6b3a2a", desc: "\"Early to bed and early to rise...\"" },
    { key: "tricorn", name: "Tricorn Hat", icon: "🎩", slot: "head", art: "tricorn", color: "#1d1d2b", desc: "The classic colonial three-cornered hat." },
    { key: "kite", name: "Franklin's Kite & Key", icon: "🪁", slot: "back", art: "kite", color: "#d94f4f", desc: "For daring experiments in natural science." }
  ],
  replaceText: [
    ["invented the lightning rod and bifocals, and in 1752", "invented the lightning rod (and, much later in life, bifocals), and in 1752"]
  ],
  addText: {
    newengland: [
      "About **20,000** Puritans crossed the ocean in the **Great Migration** of the 1630s. As English towns spread, conflict grew with Native nations. In **King Philip's War (1675–1676)**, the Wampanoag leader **Metacom**, called King Philip by the English and a son of Massasoit, led a war to defend Native land. It was one of the deadliest wars for its size in American history, and it ended with Native peoples of southern New England losing most of their land.",
      "In **1692**, fear and accusations in **Salem Village** led to the **Salem witch trials**. Twenty people were executed before the colony's leaders admitted the trials had been a terrible mistake."
    ],
    middle: [
      "According to tradition, Penn signed a treaty of friendship with the Lenape leader **Tamanend** at **Shackamaxon** in 1682. Penn's **Charter of Privileges (1701)** gave Pennsylvania an elected assembly and religious freedom.",
      "Many German-speaking settlers came to Pennsylvania. They became known as the **\"Pennsylvania Dutch,\"** from *Deutsch*, the German word for German. In **1688**, Quakers and other settlers in **Germantown** wrote the first protest against slavery in the English colonies."
    ],
    southern: [
      "In **Bacon's Rebellion (1676)**, **Nathaniel Bacon** led poor Virginia colonists, both free and indentured, against Governor Berkeley and burned Jamestown. Afterward, many planters turned from indentured servants to **enslaved Africans**, whom the law held in slavery for life.",
      "**Carolina** was chartered in **1663**, and **Charles Town** (Charleston) was founded in 1670. Enslaved West Africans brought **expert knowledge of growing rice**, which made Carolina planters rich. In the **Stono Rebellion (1739)**, enslaved people near Charleston rose up and marched toward Spanish Florida, where they had been promised freedom.",
      "Georgia **banned slavery in 1735**, but planters pushed to end the ban, and it was lifted in **1751**. North Carolina's pine forests produced **naval stores**: tar, pitch, and turpentine for ships."
    ],
    government: [
      "Colonial assemblies held the **\"power of the purse\"**: they voted on taxes and even on the royal governor's salary, which gave them real power. For many years England enforced its trade laws loosely, a policy later called **salutary neglect**, so colonists grew used to governing themselves."
    ],
    dailylife: [
      "Young children often learned their letters from a **hornbook**, a wooden paddle holding a printed page covered by a thin, clear sheet of horn. Some attended **dame schools** taught by women in their homes.",
      "**Benjamin Franklin** was apprenticed at age 12 to his brother James, a Boston printer. To print, workers set metal letters by hand, inked them, and pressed paper onto them one sheet at a time. Candles were made from **tallow**, beeswax, or fragrant **bayberry** wax gathered from shrubs along the coast."
    ],
    ideas: [
      "Franklin calculated that **George Whitefield's** voice could be heard by more than **30,000 people** outdoors. New colleges such as **Princeton (1746)** were founded during the Great Awakening.",
      "Franklin started the **Library Company of Philadelphia (1731)**, a lending library, and designed the **Franklin stove** (about 1742) to heat homes with less wood. Like many wealthy colonists, Franklin **enslaved people** for much of his life; late in life he became a leader of an **anti-slavery society**."
    ]
  },
  lessons: [
    { topic: "voices6", title: "Scroll 7: Voices of the Colonies", video: null,
      text: [
        "**John Winthrop** (1630): \"we shall be as **a city upon a hill**, the eyes of all people are upon us.\"",
        "**William Penn** called Pennsylvania a **\"holy experiment\"**, a colony where people of different faiths could live in peace.",
        "**Poor Richard's Almanack** (1735): **\"Early to bed and early to rise, makes a man healthy, wealthy, and wise.\"**",
        "**Germantown Protest (1688):** the writers argued that people should be treated as you would want to be treated, and that this applied to Africans as much as anyone. It was a voice against slavery more than 175 years before slavery ended in the United States.",
        "Remember that colonial life looked very different for a Puritan merchant, a Lenape family, an indentured servant, and an enslaved African. Good historians listen to all these voices."
      ] }
  ],
  questions: [
    { id: "s6q27", topic: "newengland", type: "mc", q: "Who led Native nations in King Philip's War (1675–1676)?",
      choices: ["Metacom, a Wampanoag leader and son of Massasoit", "King Philip II of Spain", "Powhatan", "John Winthrop"],
      explain: "The English called Metacom \"King Philip.\"" },
    { id: "s6q28", topic: "newengland", type: "mc", q: "What happened in Salem Village in 1692?",
      choices: ["Witch trials led to the execution of 20 people", "The first Thanksgiving", "The founding of Harvard", "A battle with Spain"],
      explain: "Colony leaders later admitted the trials were a mistake." },
    { id: "s6q29", topic: "middle", type: "mc", q: "Why were German settlers in Pennsylvania called the \"Pennsylvania Dutch\"?",
      choices: ["From \"Deutsch,\" the German word for German", "They came from the Netherlands", "They built windmills", "They spoke only Dutch"],
      explain: "It's a mix-up of the word Deutsch." },
    { id: "s6q30", topic: "middle", type: "mc", q: "Where was the first protest against slavery in the English colonies written in 1688?",
      choices: ["Germantown, Pennsylvania", "Jamestown, Virginia", "Charleston, South Carolina", "St. Augustine, Florida"],
      explain: "Quakers and other settlers in Germantown wrote it." },
    { id: "s6q31", topic: "southern", type: "mc", q: "What did Nathaniel Bacon's followers do in 1676?",
      choices: ["Rebelled against Virginia's governor and burned Jamestown", "Founded Georgia", "Signed the Mayflower Compact", "Explored the Mississippi"],
      explain: "Bacon's Rebellion included poor free and indentured colonists." },
    { id: "s6q32", topic: "southern", type: "mc", q: "What knowledge did enslaved West Africans bring that made South Carolina planters rich?",
      choices: ["How to grow rice", "How to trap beavers", "How to mine silver", "How to build windmills"],
      explain: "Rice had long been grown in parts of West Africa." },
    { id: "s6q33", topic: "southern", type: "vocab", term: "naval stores",
      choices: ["Tar, pitch, and turpentine from pine trees, used for ships", "Shops run by sailors", "Navy uniforms", "Fish packed in salt"],
      explain: "North Carolina's pine forests produced them." },
    { id: "s6q34", topic: "government", type: "mc", q: "What was the \"power of the purse\" that colonial assemblies held?",
      choices: ["They voted on taxes and the governor's salary", "They printed all the money in England", "They owned all the ships", "They chose the king"],
      explain: "Controlling money gave assemblies real power." },
    { id: "s6q35", topic: "government", type: "vocab", term: "salutary neglect",
      choices: ["England's loose enforcement of its trade laws for many years", "A kind of medicine", "Ignoring a church sermon", "A law against reading"],
      explain: "Colonists grew used to running their own affairs." },
    { id: "s6q36", topic: "dailylife", type: "vocab", term: "hornbook",
      choices: ["A wooden paddle with a printed alphabet page under a clear sheet of horn", "A musical horn", "A book about cattle", "A newspaper"],
      explain: "Young children learned their letters from hornbooks." },
    { id: "s6q37", topic: "ideas", type: "mc", q: "Which of these did Benjamin Franklin start in 1731?",
      choices: ["The Library Company of Philadelphia, a lending library", "Harvard College", "The House of Burgesses", "The Dutch West India Company"],
      explain: "Members pooled money to buy books to share." },
    { id: "s6q38", topic: "voices6", type: "fill", q: "Poor Richard said: \"Early to bed and early to rise, makes a man healthy, wealthy, and ____.\"",
      accept: ["wise"], display: "wise", explain: "From Poor Richard's Almanack, 1735." },
    { id: "s6q39", topic: "voices6", type: "mc", q: "What did William Penn call his plan for Pennsylvania?",
      choices: ["A \"holy experiment\"", "A \"city upon a hill\"", "A \"civil body politic\"", "The \"Lost Colony\""],
      explain: "\"A city upon a hill\" was John Winthrop's phrase for Massachusetts Bay." }
  ],
  activities: [
    { id: "s6-colonies", type: "sort", icon: "🗂️", title: "Sort the Thirteen Colonies", topic: "middle",
      intro: "Sort each colony or clue into its region: New England, Middle, or Southern.",
      bins: [ { id: "ne", label: "New England", icon: "🐟" }, { id: "mid", label: "Middle", icon: "🌾" }, { id: "south", label: "Southern", icon: "🌱" } ],
      items: [
        { t: "Massachusetts", bin: "ne", fact: "Founded by Puritans; Boston was its capital." },
        { t: "Rhode Island", bin: "ne", fact: "Roger Williams's colony of religious freedom." },
        { t: "Connecticut", bin: "ne", fact: "Home of the Fundamental Orders, 1639." },
        { t: "Fishing, whaling, and shipbuilding", bin: "ne", fact: "Rocky soil pushed New Englanders to the sea." },
        { t: "Town meetings", bin: "ne", fact: "Citizens voted on local issues." },
        { t: "Pennsylvania", bin: "mid", fact: "William Penn's \"holy experiment.\"" },
        { t: "New York", bin: "mid", fact: "Formerly New Netherland." },
        { t: "Wheat: the \"breadbasket\"", bin: "mid", fact: "Fertile soil grew huge grain harvests." },
        { t: "Most diverse population", bin: "mid", fact: "Dutch, Germans, Swedes, Scots-Irish, English, and more." },
        { t: "Virginia", bin: "south", fact: "England's first permanent colony." },
        { t: "Georgia", bin: "south", fact: "Founded in 1732 by James Oglethorpe." },
        { t: "Rice and indigo plantations", bin: "south", fact: "A long growing season made cash crops pay." },
        { t: "Maryland, a refuge for Catholics", bin: "south", fact: "Founded by the Calvert family in 1634." }
      ] },
    { id: "s6-candle", type: "sequence", stage: "candle", icon: "🕯️", title: "Dip a Colonial Candle", topic: "dailylife",
      intro: "Make candles the colonial way! Tap the steps in the right order. Watch out for things that don't belong in 1740!",
      steps: [
        { t: "Melt tallow (animal fat) or beeswax in a big kettle over the fire", fact: "Tallow smelled smoky; beeswax was cleaner but costly." },
        { t: "Twist cotton or flax threads into wicks", fact: "Wicks were often spun at home." },
        { t: "Tie several wicks to a candle rod", fact: "A rod let you dip many candles at once." },
        { t: "Dip the wicks into the hot wax", fact: "Each dip adds a thin layer." },
        { t: "Hang them to cool and harden", fact: "Cooling between dips is what builds the candle." },
        { t: "Dip and cool again and again, 20 times or more", fact: "Candles grow thicker with every dip, which is why they are called dipped candles." },
        { t: "Trim the bottoms and store them in a candle box", fact: "Families made a whole year's candles at once, often in autumn." }
      ],
      distractors: [
        { t: "Plug the candle maker into the wall", why: "There was no electricity in homes until the late 1800s!" },
        { t: "Pour in paraffin wax from the store", why: "Paraffin wax wasn't made until the 1850s." }
      ] },
    { id: "s6-press", type: "sequence", stage: "press", icon: "🖨️", title: "Print a Page Like Ben Franklin", topic: "dailylife",
      intro: "You are an apprentice in a Philadelphia print shop. Put the printing steps in order!",
      steps: [
        { t: "Pick metal letters (type) from the type case and set them in a composing stick", fact: "Type is set backwards so it prints the right way around!" },
        { t: "Lock the lines of type tightly into an iron frame", fact: "Wooden wedges held every letter in place." },
        { t: "Dab ink on the type with leather ink balls", fact: "Ink was made from soot (lampblack) and oil." },
        { t: "Lay a damp sheet of paper over the type", fact: "Damp paper took the ink better." },
        { t: "Pull the bar so the press pushes the paper onto the type", fact: "A good team could print about 200 sheets an hour." },
        { t: "Hang the printed sheet up to dry", fact: "Franklin printed newspapers, almanacs, and money for Pennsylvania." }
      ],
      distractors: [
        { t: "Type it on a computer keyboard", why: "Computers were invented more than 200 years later." },
        { t: "Send it to a laser printer", why: "Laser printers came in the 1970s!" }
      ] },
    { id: "s6-franklin", type: "dialogue", icon: "⚡", title: "Talk with Benjamin Franklin", topic: "ideas",
      who: { name: "Benjamin Franklin", role: "printer, Philadelphia, about 1750", portrait: "👴🏻", look: { gender: "boy", tunic: "#5a4a3a", hair: "#9a8f80", equip: { body: { art: "waistcoat", color: "#7a5a2a" }, feet: { art: "buckle-shoes", color: "#2b2b2b" }, offhand: { art: "almanack", color: "#6b3a2a" } } } },
      lines: [
        { say: "Good day! I began as an apprentice to my brother James, a printer in Boston. What is an apprentice?",
          choices: [ { t: "A young person who learns a trade by working for a master for several years", ok: true, r: "Just so. I was twelve. At seventeen I ran off to Philadelphia to make my own way." },
                     { t: "A kind of printing press", r: "No, an apprentice is a learner who works for a master craftsman." },
                     { t: "A ship's captain", r: "No, an apprentice learns a trade from a master." } ] },
        { say: "Each year I print Poor Richard's Almanack. Which saying is mine?",
          choices: [ { t: "\"Early to bed and early to rise, makes a man healthy, wealthy, and wise.\"", ok: true, r: "Poor Richard said it in 1735!" },
                     { t: "\"A city upon a hill\"", r: "That was John Winthrop's phrase, in 1630." },
                     { t: "\"He that will not work shall not eat.\"", r: "That was Captain John Smith at Jamestown." } ] },
        { say: "Books cost dearly. In 1731 my friends and I pooled our money to start what?",
          choices: [ { t: "A lending library, the Library Company of Philadelphia", ok: true, r: "Yes! Members could borrow books they could never buy alone." },
                     { t: "A gold mine", r: "No gold in Philadelphia! We started a lending library." },
                     { t: "A fur-trading company", r: "No, a lending library: the Library Company." } ] },
        { say: "In 1752 I flew a kite in a thunderstorm. What did I want to show?",
          choices: [ { t: "That lightning is electricity", ok: true, r: "Right. That led to my lightning rod, which protects buildings. (Never try this yourself!)" },
                     { t: "That kites can fly to the moon", r: "Ha! I wanted to show that lightning is electricity." },
                     { t: "That rain is warm", r: "No, I wanted to show that lightning is electricity." } ] },
        { say: "An honest historian must tell the whole truth about me. Which is true?",
          choices: [ { t: "I enslaved people for much of my life, and later became a leader against slavery", ok: true, r: "Yes. People can change, but we must not hide the past. Late in life I led Pennsylvania's anti-slavery society." },
                     { t: "I was perfect in every way", r: "No one is! I enslaved people for years before turning against slavery." },
                     { t: "I was a king of England", r: "Certainly not. The true answer is about my changing views on slavery." } ] }
      ] }
  ]
});
