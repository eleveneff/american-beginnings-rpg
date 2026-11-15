/* v3.1.5 Level 8 lesson videos. Same format as videos.js. All seven scrolls have files in
   assets/video/<key>.mp4. */
(function () {
  var V = GAME_CONTENT.videos;
  V["s8-new-taxes"] = {
    title: "New Taxes After the War",
    cueTimes: [0, 7.98, 16.86, 23.89, 31.49, 42.33, 51.94], // narration starts 0.5 s after each cue
    cues: [
      "In **1763**, Britain has won the French and Indian War, but the victory leaves a huge **war debt**.",
      "King **George III** draws the **Proclamation Line** along the **Appalachian Mountains**. No colonial settlers may go west of it.",
      "The land west of the line is left to **Native nations**, though many settlers ignore the order.",
      "**10,000** British troops stay in America, and Parliament wants the colonists to help pay for them.",
      "Prime Minister **George Grenville** cracks down on **smuggling**. **Writs of assistance** let officers search almost anywhere, and royal judges replace local juries.",
      "In **1764**, the **Sugar Act** lowers the molasses tax, but enforces it hard. New England turns molasses into **rum**.",
      "Colonists say their rights as Englishmen are under attack. They will not quietly surrender self-government."
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
    cueTimes: [0, 9.86, 18.44, 26.96, 34.25, 42.25, 50.35], // narration starts 0.5 s after each cue
    cues: [
      "In **1765**, Parliament passes the **Stamp Act**. Newspapers, wills, licenses, and even **playing cards** must carry a tax stamp.",
      "Colonists cry **\"No taxation without representation!\"** They have no vote in Parliament, yet Parliament taxes them.",
      "In Williamsburg, young **Patrick Henry** tells the **House of Burgesses** that only Virginia's own assembly may tax Virginians.",
      "In Boston, the **Sons of Liberty** hang an effigy of the stamp officer from a great elm, the **Liberty Tree**.",
      "Some protests turn violent. A crowd wrecks the house of Lieutenant Governor **Thomas Hutchinson**.",
      "In **October 1765**, nine colonies meet at the **Stamp Act Congress** in New York, and a boycott of British goods begins.",
      "British merchants, losing sales, ask Parliament to repeal the tax. In **March 1766** the Stamp Act is **repealed**, but the same day Parliament claims power over the colonies \"in all cases whatsoever.\""
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
    title: "The Daughters of Liberty",
    cueTimes: [0, 9.03, 18.65, 26.39, 36.09, 43.29, 51.83], // narration starts 0.5 s after each cue
    cues: [
      "In **1767**, the **Townshend Acts** tax **glass, lead, paint, paper, and tea** arriving in colonial ports.",
      "Merchants promise not to import British goods. **John Dickinson** writes the **Letters from a Farmer in Pennsylvania**, defending colonial rights.",
      "The **Daughters of Liberty** hold **spinning bees**, making **homespun** cloth instead of buying British cloth.",
      "Wearing homespun becomes a sign of patriotism, even for wealthy families. They also brew tea from local herbs and leaves.",
      "The **Quartering Act** makes colonists provide soldiers with housing, food, and fuel.",
      "In **October 1768**, British troops land at Boston's **Long Wharf** and camp in the middle of town.",
      "Off-duty soldiers take part-time jobs for low pay, which angers Boston's working men. Tension in the streets is rising."
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
    cueTimes: [0, 10.5, 19.92, 31.04, 41.9, 49.58, 56.83], // narration starts 0.5 s after each cue
    cues: [
      "On a cold night, **March 5, 1770**, a crowd surrounds a British sentry outside the Custom House on **King Street**, near the Old State House.",
      "People shout and throw snowballs, ice, and sticks. Captain **Thomas Preston** brings a small file of soldiers to help the sentry.",
      "A soldier is knocked down. In the confusion, the soldiers fire. **Five colonists** die, among them **Crispus Attucks**, a sailor of African and Native American descent.",
      "**Paul Revere** sells an engraving of soldiers firing in a neat line on a calm crowd. It is powerful **propaganda**, not a precise record of the chaos.",
      "The patriot lawyer **John Adams** defends the soldiers, because everyone deserves a **fair trial** under the law.",
      "Preston and six soldiers are found **not guilty**. Two are convicted of manslaughter.",
      "Parliament then repeals every Townshend tax **except the tax on tea**. The quarrel over rights is not over."
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
    cueTimes: [0, 9.83, 18.01, 27.86, 35.92, 44.86, 51.68], // narration starts 0.5 s after each cue
    cues: [
      "In **1773**, the **Tea Act** lowers the price of British tea, but it keeps the tax and gives the East India Company a monopoly.",
      "In late autumn, three ships, the **Dartmouth**, the **Eleanor**, and the brig **Beaver**, tie up at **Griffin's Wharf** in Boston.",
      "On **December 16**, thousands crowd the **Old South Meeting House**. Governor **Hutchinson** will not let the ships leave without paying the tax.",
      "That night, men with soot-darkened faces and blankets, loosely disguised as **Mohawk**, board the ships with hatchets.",
      "They split open **342 chests** and dump the tea into the cold harbor. They break nothing else.",
      "When they finish, they sweep the decks clean. A padlock they broke is later replaced.",
      "The destroyed tea is worth nearly **10,000** pounds. In other ports, colonists turn the tea ships back. The quarrel over rights grows sharper."
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
    cueTimes: [0, 9.01, 18.74, 26.33, 36.36, 43.54, 53.13], // narration starts 0.5 s after each cue
    cues: [
      "Early in **1774**, news of the Tea Party reaches London. King **George III** and Parliament decide to punish Boston.",
      "The **Coercive Acts** close **Boston Harbor** on **June 1, 1774**, until the tea is paid for. Wharves fall silent.",
      "The **Massachusetts Government Act** takes away parts of the colony's charter and limits town meetings.",
      "A new **Administration of Justice Act** lets officials be tried in Britain, and a new **Quartering Act** requires colonists to house soldiers.",
      "**General Thomas Gage** arrives as governor, and British tents spread across Boston Common.",
      "Colonists call the laws the **Intolerable Acts**. Other colonies send food to Boston: sheep from Connecticut, rice from South Carolina.",
      "Parliament's **Quebec Act** stretches Canada south to the **Ohio River**. In November, the king writes, \"We must either master them, or totally leave them to themselves.\""
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
    cueTimes: [0, 9.66, 19.2, 28.75, 37.07, 46.55, 54.84], // narration starts 0.5 s after each cue
    cues: [
      "In **September 1774**, delegates gather at **Carpenters' Hall** in **Philadelphia**, a modest red-brick hall, not the great State House.",
      "**56** men take their seats, from **12** colonies. **Georgia**, wanting British help on its frontier, does not send delegates.",
      "Among them are **Samuel Adams**, now fifty-one, his cousin **John Adams**, **George Washington** in a Virginia blue coat, **Patrick Henry**, and **John Jay**.",
      "**Patrick Henry** tells the Congress, \"I am not a Virginian, but an American.\" The room hears a new kind of union.",
      "Congress adopts a Declaration and Resolves, and asks Parliament to repeal **13** acts that violate colonial rights.",
      "The delegates sign the **Continental Association**, a shared boycott of British trade, and they endorse the **Suffolk Resolves**.",
      "They agree to meet again in **May 1775** if Britain does not answer. At home, **militias** begin to drill."
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
