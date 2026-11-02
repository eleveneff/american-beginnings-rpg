/* v3.1 Level 8 lesson videos. Same format as videos.js. Until a verified file is in
   assets/video/<key>.mp4, each runs as a timed fact tour of its captions. */
(function () {
  var V = GAME_CONTENT.videos;
  V["s8-new-taxes"] = {
    title: "Paying for an Empire",
    cues: [
      "1763: Britain has won the French and Indian War, but it owes a huge **war debt**.",
      "King **George III** draws the **Proclamation Line** along the **Appalachian Mountains**. No colonial settlers west of it.",
      "**10,000** British troops stay in America, and Parliament wants the colonists to help pay for them.",
      "Prime Minister **George Grenville** cracks down on **smuggling**, with royal judges instead of local juries.",
      "1764: the **Sugar Act** lowers the molasses tax, but enforces it hard. Colonists say their **rights** are under attack."
    ],
    facts: [
      "**Writs of assistance** let customs officers search almost anywhere, even homes, for smuggled goods.",
      "Molasses from the West Indies was made into **rum** in New England distilleries.",
      "The Proclamation left the land west of the line to **Native nations**. Many settlers ignored it.",
      "In **1768**, at **Fort Stanwix**, the Iroquois sold Britain land south of the Ohio where Shawnee, Delaware, and Cherokee people hunted, without asking them."
    ],
    check: [
      { q: "Why did Britain want the colonists to pay new taxes after 1763?",
        choices: ["To help pay the war debt and the cost of troops in America", "To build a palace for the king", "To pay for a war with Spain in Florida", "To buy land from France"],
        explain: "Parliament thought the colonists should share the cost." },
      { q: "Which mountains did the Proclamation Line of 1763 follow?",
        choices: ["The Appalachian Mountains", "The Rocky Mountains", "The Alps", "The Andes"],
        explain: "Settlers were not supposed to cross it." }
    ]
  };
  V["s8-stamp-act"] = {
    title: "The Stamp Act Crisis",
    cues: [
      "1765: Parliament passes the **Stamp Act**. Newspapers, wills, licenses, and even **playing cards** must carry a tax stamp.",
      "Colonists cry **\"No taxation without representation!\"** They have no vote in Parliament.",
      "In Williamsburg, **Patrick Henry** says only Virginia's own assembly may tax Virginians.",
      "In Boston, the **Sons of Liberty** hang an effigy of the stamp officer from the **Liberty Tree**.",
      "October 1765: nine colonies meet at the **Stamp Act Congress** in New York. A boycott follows, and in **March 1766** the act is **repealed**."
    ],
    facts: [
      "The Liberty Tree was a great **elm** near Boston Common, where Sons of Liberty met and posted notices.",
      "Some protests turned violent: in August 1765 a crowd wrecked the house of Lieutenant Governor **Thomas Hutchinson**.",
      "British merchants, losing sales to the **boycott**, asked Parliament to repeal the tax.",
      "The same day as the repeal, Parliament passed the **Declaratory Act**, claiming power over the colonies \"in all cases whatsoever.\""
    ],
    check: [
      { q: "What did the Stamp Act tax?",
        choices: ["Printed materials like newspapers, wills, and playing cards", "Only tea", "Only glass and paint", "Land and houses"],
        explain: "Each paper needed a stamp to show the tax was paid." },
      { q: "Where did the Stamp Act Congress meet in October 1765?",
        choices: ["New York", "Boston", "Philadelphia", "London"],
        explain: "Delegates from nine colonies attended." }
    ]
  };
  V["s8-daughters-liberty"] = {
    title: "Homespun and Redcoats",
    cues: [
      "1767: the **Townshend Acts** tax **glass, lead, paint, paper, and tea** arriving in colonial ports.",
      "Merchants promise not to import British goods. **John Dickinson** writes the **Letters from a Farmer in Pennsylvania**.",
      "The **Daughters of Liberty** hold **spinning bees**, making **homespun** cloth instead of buying British cloth.",
      "They brew tea from local herbs and leaves, instead of taxed tea.",
      "October 1768: British troops land at Boston's **Long Wharf** and camp in the middle of town."
    ],
    facts: [
      "A spinning bee could bring dozens of girls and women together to spin from dawn until dark.",
      "Wearing homespun became a sign of patriotism, even for wealthy families.",
      "The **Quartering Act** made colonists provide soldiers with housing, food, and fuel.",
      "Off-duty soldiers took part-time jobs for low pay, which angered Boston's working men."
    ],
    check: [
      { q: "How did the Daughters of Liberty fight the Townshend Acts?",
        choices: ["They spun homespun cloth and boycotted British goods", "They joined the British navy", "They paid extra taxes", "They moved to England"],
        explain: "Their spinning bees made homespun fashionable." },
      { q: "Which of these was taxed by the Townshend Acts?",
        choices: ["Glass", "Playing cards", "Molasses", "Furs"],
        explain: "Glass, lead, paint, paper, and tea." }
    ]
  };
  V["s8-boston-massacre"] = {
    title: "The Boston Massacre",
    cues: [
      "A cold night, **March 5, 1770**: a crowd surrounds a British sentry outside the Custom House on **King Street**.",
      "People shout and throw snowballs, ice, and sticks. Captain **Thomas Preston** brings soldiers to help.",
      "A soldier is knocked down. The soldiers fire. **Five colonists** die, among them **Crispus Attucks**.",
      "**Paul Revere** sells an engraving of soldiers firing on a calm crowd: powerful **propaganda**.",
      "The patriot lawyer **John Adams** defends the soldiers, because everyone deserves a **fair trial**."
    ],
    facts: [
      "Crispus Attucks was a sailor and dockworker of **African and Native American** descent.",
      "Revere's engraving was based on a drawing by the Boston artist **Henry Pelham**.",
      "Preston and six soldiers were found **not guilty**; two were convicted of manslaughter.",
      "Parliament then repealed every Townshend tax **except the tax on tea**."
    ],
    check: [
      { q: "How many colonists died as a result of the Boston Massacre?",
        choices: ["Five", "Fifty", "One", "Three hundred"],
        explain: "One of them was Crispus Attucks." },
      { q: "Who defended the British soldiers in court?",
        choices: ["John Adams", "Samuel Adams", "Paul Revere", "Patrick Henry"],
        explain: "He believed everyone deserved a fair trial." }
    ]
  };
  V["s8-tea-party"] = {
    title: "The Boston Tea Party",
    cues: [
      "1773: the **Tea Act** gives the British East India Company control of the tea trade. The tea still carries a tax.",
      "Three ships, the **Dartmouth**, **Eleanor**, and **Beaver**, tie up at **Griffin's Wharf**.",
      "December 16, 1773: thousands crowd the **Old South Meeting House**. Governor Hutchinson won't let the ships leave.",
      "That night, men disguised roughly as **Mohawk** board the ships with hatchets.",
      "They dump **342 chests** of tea into Boston Harbor, and break nothing else."
    ],
    facts: [
      "The tea was worth nearly **£10,000**, a huge sum then.",
      "In New York and Philadelphia, colonists made the tea ships **turn back**; in Charleston the tea was locked away.",
      "Even some patriots, like **Benjamin Franklin**, said the tea should be paid for.",
      "Witnesses said the protesters swept the decks clean when they were done."
    ],
    check: [
      { q: "How many chests of tea were dumped in the Boston Tea Party?",
        choices: ["342", "13", "1,000", "56"],
        explain: "On December 16, 1773." },
      { q: "Where did Bostonians meet just before the Tea Party?",
        choices: ["The Old South Meeting House", "Carpenters' Hall", "Independence Hall", "The House of Burgesses"],
        explain: "Thousands of people crowded inside and outside." }
    ]
  };
  V["s8-intolerable-acts"] = {
    title: "The Intolerable Acts",
    cues: [
      "King George III: \"We must either master them or totally leave them to themselves.\"",
      "1774: the **Coercive Acts** close **Boston Harbor** until the tea is paid for.",
      "Town meetings are limited, and General **Thomas Gage** becomes governor of Massachusetts.",
      "The **Quebec Act** stretches Canada south to the **Ohio River**.",
      "Colonists call them the **Intolerable Acts**, and other colonies send **food** to Boston."
    ],
    facts: [
      "With the harbor closed, Boston's sailors, dockworkers, and merchants lost their work.",
      "Connecticut towns drove flocks of **sheep** to Boston; South Carolina sent **rice**.",
      "In **Edenton, North Carolina**, 51 women led by **Penelope Barker** pledged not to drink British tea or wear British cloth.",
      "Most colonists still saw themselves as **loyal British subjects** who wanted their rights back."
    ],
    check: [
      { q: "What did the Coercive Acts do to Boston?",
        choices: ["Closed its harbor until the tea was paid for", "Made it the capital of the colonies", "Removed all British soldiers", "Ended its taxes"],
        explain: "Colonists called them the Intolerable Acts." },
      { q: "How did other colonies respond to the closing of Boston Harbor?",
        choices: ["They sent food and supplies", "They cheered the British", "They closed their own ports to Boston", "They ignored it"],
        explain: "The acts drew the colonies together." }
    ]
  };
  V["s8-first-congress"] = {
    title: "The First Continental Congress",
    cues: [
      "September 1774: **56 delegates** from **12 colonies** meet at **Carpenters' Hall** in **Philadelphia**.",
      "Among them: **Samuel** and **John Adams**, **George Washington**, **Patrick Henry**, and **John Jay**.",
      "Patrick Henry: \"I am not a Virginian, but an American.\"",
      "Congress votes to **boycott** British trade and asks Parliament to repeal **13 acts**.",
      "It backs the **Suffolk Resolves**, and colonies begin training **militias**."
    ],
    facts: [
      "**Georgia**, which wanted British help on its frontier, did not send delegates.",
      "The delegates agreed to meet again in **May 1775** if their complaints were not answered.",
      "Patriots said Britain wanted to make them \"slaves,\" while about **one in five** colonists was **enslaved**.",
      "**Phillis Wheatley**, a Boston poet who had been enslaved until 1773, wrote in 1774 that God put \"Love of Freedom\" in \"every human Breast.\""
    ],
    check: [
      { q: "Where did the First Continental Congress meet?",
        choices: ["Carpenters' Hall in Philadelphia", "Faneuil Hall in Boston", "City Hall in New York", "The Capitol in Williamsburg"],
        explain: "September 1774." },
      { q: "Which colony did not send delegates?",
        choices: ["Georgia", "Virginia", "Massachusetts", "New Jersey"],
        explain: "Twelve of the thirteen colonies came." }
    ]
  };
  var A = { newlaws: "s8-new-taxes", stamp: "s8-stamp-act", townshend: "s8-daughters-liberty", massacre: "s8-boston-massacre", tea: "s8-tea-party", intolerable: "s8-intolerable-acts", congress: "s8-first-congress" };
  GAME_CONTENT.videoAttach.s8 = A;
  GAME_CONTENT.sections.forEach(function (s) {
    if (s.id !== "s8") return;
    s.lessons.forEach(function (l) {
      var key = A[l.topic], v = key && V[key]; if (!v) return;
      l.videoKey = key; v.section = s.id; v.topic = l.topic;
      v.check.forEach(function (c, i) {
        c.id = key + "-q" + (i + 1); c.topic = l.topic; c.type = "mc"; c.fromVideo = key;
        if (!s.questions.some(function (q) { return q.id === c.id; })) s.questions.push(c);
      });
    });
  });
})();
