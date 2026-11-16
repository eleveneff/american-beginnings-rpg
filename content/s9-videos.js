/* v3.4-l9 Level 9 lesson videos. Same format as s8-videos.js. The seven narrative scrolls have
   videoKey slots; finished files go at assets/video/<key>.mp4. Until then the fact-tour
   placeholder runs the same captions, Key Facts, and "What did you see?" checks. */
(function () {
  var V = GAME_CONTENT.videos;
  V["s9-lexington"] = {
    title: "The Midnight Ride and Lexington Green",
    cueTimes: [0, 8, 16, 24, 32, 40],
    cues: [
      "On the night of **April 18, 1775**, General **Thomas Gage** orders troops to **Concord** to seize hidden militia stores.",
      "**Paul Revere** and **William Dawes** ride to spread the alarm. Dr. **Samuel Prescott** joins them on the road to Concord.",
      "A British patrol stops the riders. **Revere is captured**. Dawes does not reach Concord. **Prescott gets through**.",
      "At dawn on **April 19**, about **70** militiamen under Captain **John Parker** stand on **Lexington Green**.",
      "A shot rings out. No one is sure who fired first. British regulars volley and charge.",
      "**Eight** Lexington men are killed and ten are wounded. The regulars march on toward Concord. The war has begun."
    ],
    facts: [
      "Gage's written order told Lieutenant Colonel **Francis Smith** to seize and destroy stores, and not to plunder the inhabitants.",
      "The ride was a **team**, not one man. Prescott, not Revere, raised the alarm in Concord.",
      "Captain Parker's men were told not to fire unless fired upon.",
      "The first shot on the Green is still uncertain."
    ],
    check: [
      { q: "Who actually reached Concord and raised the alarm there?",
        choices: ["Dr. Samuel Prescott", "Paul Revere alone", "General Gage", "John Hancock"],
        explain: "Revere was captured; Dawes did not reach Concord." },
      { q: "How many Lexington militiamen were killed on the Green?",
        choices: ["Eight", "Seventy", "None", "About a thousand"],
        explain: "Ten more were wounded." }
    ]
  };
  V["s9-concord"] = {
    title: "The North Bridge",
    cueTimes: [0, 8, 16, 24, 32, 40],
    cues: [
      "At **Concord**, militia gather on a ridge above the **North Bridge**. British soldiers search the town for hidden stores.",
      "Smoke from burned gun carriages makes the militia think the town is on fire. They advance toward the bridge.",
      "The British fire. The militia fire back. Emerson later called it \"the **shot heard round the world**.\"",
      "The regulars turn back toward **Boston**, sixteen miles away. Militia fire from stone walls, trees, and houses all along the road.",
      "By night the British have lost about **73 killed**, plus many wounded and missing. The colonists have lost about **49 killed**.",
      "News flies down the post roads. Thousands of militiamen surround Boston and **besiege** the British in the city."
    ],
    facts: [
      "Most of the stores at Concord had already been **hidden**. The British found little.",
      "Colonial leaders at the bridge included Colonel **James Barrett** and Major **John Buttrick**.",
      "The running fight passed back through Lexington and **Menotomy** (today Arlington).",
      "The siege of Boston began in the days after April 19."
    ],
    check: [
      { q: "Where did colonial militia fire on British regulars in Concord?",
        choices: ["The North Bridge", "Faneuil Hall", "Breed's Hill", "Carpenters' Hall"],
        explain: "That fight began the British retreat to Boston." },
      { q: "About how many British soldiers were killed on April 19, 1775?",
        choices: ["About 73 killed (plus many wounded and missing)", "Eight", "None", "About 1,000"],
        explain: "Colonial losses were about 49 killed and 39 wounded." }
    ]
  };
  V["s9-second-congress"] = {
    title: "The Second Continental Congress",
    cueTimes: [0, 8, 16, 24, 32, 40],
    cues: [
      "The **Second Continental Congress** opens on **May 10, 1775**, in the **Pennsylvania State House** in Philadelphia, the building we call **Independence Hall**.",
      "The First Congress had met at **Carpenters' Hall** in 1774 and agreed to return in May. By now, the shooting has started.",
      "In July the delegates send the **Olive Branch Petition** to King **George III**, a last appeal for peace. The king will not receive it.",
      "On **June 15, 1775**, Congress chooses **George Washington** of Virginia to command a new **Continental Army**.",
      "A Virginian at the head of a New England army is meant to show that this is a cause for **all** the colonies.",
      "Washington takes command on **Cambridge Common** on **July 3, 1775**. He finds courage, short enlistments, and little powder."
    ],
    facts: [
      "The king declared the colonies in **rebellion** after rejecting the Olive Branch.",
      "Congress was not yet ready, in 1775, to vote for independence.",
      "Choosing Washington was a political act of **union** as well as a military choice.",
      "The State House, not Carpenters' Hall, was the meeting place of the Second Congress."
    ],
    check: [
      { q: "Where did the Second Continental Congress meet?",
        choices: ["The Pennsylvania State House in Philadelphia (Independence Hall)", "Carpenters' Hall", "Faneuil Hall", "The Old South Meeting House"],
        explain: "The First Congress had met at Carpenters' Hall in 1774." },
      { q: "Whom did Congress choose as commander of the Continental Army?",
        choices: ["George Washington", "Thomas Gage", "Thomas Paine", "John Hancock"],
        explain: "He took command in Cambridge on July 3, 1775." }
    ]
  };
  V["s9-bunker-hill"] = {
    title: "The Battle of Bunker Hill",
    cueTimes: [0, 8, 16, 24, 32, 40],
    cues: [
      "On the night of **June 16–17, 1775**, colonial troops are told to fortify **Bunker Hill**. Instead they dig a redoubt on **Breed's Hill**, closer to Boston.",
      "In the morning, General **William Howe** lands about **2,200** British regulars. Warships fire on the hill.",
      "Tradition says the defenders are told, \"Don't fire until you see the **whites of their eyes**.\" The point is discipline, and scarce powder.",
      "The militia throws back the **first two** assaults with terrible volleys.",
      "On the **third** attack the defenders' **powder runs out**. The British take the hill at the point of the bayonet.",
      "It is a British victory at a terrible cost: about **1,000** British killed or wounded, and about **400** colonists, including Dr. **Joseph Warren**."
    ],
    facts: [
      "The battle is still called Bunker Hill, but it was fought on **Breed's Hill**.",
      "The famous order is traditional; it is given to Colonel **William Prescott** or General **Israel Putnam**.",
      "The British could not easily afford another such \"victory.\"",
      "The battle did not end the **siege of Boston**. The war went on."
    ],
    check: [
      { q: "Where was the Battle of Bunker Hill actually fought?",
        choices: ["On Breed's Hill, closer to Boston than Bunker Hill", "On Bunker Hill, exactly as planned", "On Lexington Green", "At the North Bridge"],
        explain: "The troops were told to fortify Bunker Hill but dug in on Breed's Hill." },
      { q: "Why did the British take the hill on the third assault?",
        choices: ["The colonial defenders ran out of powder", "The militia ran away at the first shot", "Washington ordered a retreat", "A storm flooded the redoubt"],
        explain: "It was a costly British victory: about 1,000 British killed or wounded." }
    ]
  };
  V["s9-common-sense"] = {
    title: "Common Sense",
    cueTimes: [0, 8, 16, 24, 32, 40],
    cues: [
      "In **January 1776**, a short pamphlet called **Common Sense** appears in Philadelphia.",
      "Its author is **Thomas Paine**, an English immigrant who arrived only in 1774.",
      "Paine writes in plain words: a hereditary king is absurd, and an island should not rule a continent.",
      "He says the time has come to break with Britain and build an independent **republic**. He calls George III \"the royal brute.\"",
      "**Common Sense** sells on the order of **100,000** copies in a few months and is read aloud in taverns, camps, and homes.",
      "**Loyalists** call Paine a dangerous radical. But he has changed the question: not how to get English rights, but whether to be English at all."
    ],
    facts: [
      "Paine was not a delegate in Congress; his pamphlet moved **public opinion**.",
      "A **republic** is a government without a king, based on law and the people.",
      "Many colonists were still hoping for peace when the pamphlet appeared.",
      "Paine's later writings also attacked **slavery** and defended a wide right to liberty."
    ],
    check: [
      { q: "Who wrote Common Sense?",
        choices: ["Thomas Paine, an English immigrant", "Thomas Jefferson", "John Adams", "Benjamin Franklin"],
        explain: "It appeared in January 1776." },
      { q: "What did Common Sense argue the colonies should do?",
        choices: ["Become an independent republic and break with the king", "Send another Olive Branch Petition", "Pay the Stamp Tax", "Let only Massachusetts fight"],
        explain: "Paine said an island should not rule a continent." }
    ]
  };
  V["s9-decision"] = {
    title: "Lee's Resolution and the Committee of Five",
    cueTimes: [0, 8, 16, 24, 32, 40],
    cues: [
      "On **June 7, 1776**, **Richard Henry Lee** of Virginia offers a resolution: the colonies \"are, and of right ought to be, **free and independent States**.\"",
      "Congress postpones the vote so wavering colonies can be brought along, and names a **Committee of Five** to draft a declaration.",
      "The five are **Thomas Jefferson**, **John Adams**, **Benjamin Franklin**, **Roger Sherman**, and **Robert R. Livingston**.",
      "The committee asks **Jefferson**, only 33, to write the first draft. Adams and Franklin suggest changes.",
      "On **July 2, 1776**, Congress **votes for independence**. Twelve colonies are in favor; New York agrees a few days later.",
      "**John Adams** writes to his wife **Abigail** that July 2 will be remembered with parades and fireworks. He is off by two days."
    ],
    facts: [
      "The vote of **July 2** made the United States; **July 4** is the day the Declaration was adopted.",
      "Jefferson later said he was setting down the **common sense** of the matter, beliefs Americans already shared.",
      "Lee's words were the formal claim to nationhood.",
      "Adams wanted a Virginian to draft the paper so the cause looked continental."
    ],
    check: [
      { q: "Who offered the June 7, 1776, resolution for independence?",
        choices: ["Richard Henry Lee of Virginia", "Thomas Paine", "John Hancock", "Paul Revere"],
        explain: "Congress then named a committee to draft a declaration." },
      { q: "On which date did Congress vote for independence?",
        choices: ["July 2, 1776", "July 4, 1776", "June 7, 1776", "April 19, 1775"],
        explain: "July 4 is when Congress adopted the Declaration that explained the vote." }
    ]
  };
  V["s9-declaration"] = {
    title: "The Declaration of Independence",
    cueTimes: [0, 8, 16, 24, 32, 40],
    cues: [
      "On **July 4, 1776**, Congress adopts the **Declaration of Independence**. **John Hancock** signs first, in a large, clear hand.",
      "The printer **John Dunlap** works through the night to set the text as a **broadside** for the new nation to read.",
      "The **preamble** says all men are **created equal**, with **unalienable rights** to **life, liberty, and the pursuit of happiness**.",
      "Governments, it says, derive their just powers from the **consent of the governed**.",
      "Hard truth: **Jefferson himself enslaved people**, and Congress **struck out** a clause blaming the king for the **slave trade**.",
      "The signers pledge \"our Lives, our Fortunes, and our sacred Honor.\" If the war is lost, they can be hanged as traitors."
    ],
    facts: [
      "Most delegates signed the formal copy on **August 2**, not on July 4.",
      "About **56** men signed. Many **Loyalists** still sided with the king.",
      "About **one in five** people in the colonies was enslaved in 1776.",
      "The promise of equality is the nation's standard, and 1776 did not yet live up to it."
    ],
    check: [
      { q: "According to the Declaration, governments derive their just powers from what?",
        choices: ["The consent of the governed", "The king's divine right", "The richest landowners", "The British Parliament"],
        explain: "That is the heart of the American idea of self-government." },
      { q: "What happened to Jefferson's clause blaming the king for the slave trade?",
        choices: ["Congress struck it out", "It became the first amendment", "George III agreed to it", "It opened the preamble"],
        explain: "South Carolina, Georgia, and some New England merchants would not accept it." }
    ]
  };
  var A = { lexington: "s9-lexington", concord: "s9-concord", congress2: "s9-second-congress", bunker: "s9-bunker-hill", sense: "s9-common-sense", decision: "s9-decision", declaration: "s9-declaration" };
  GAME_CONTENT.videoAttach.s9 = A;
  GAME_CONTENT.sections.forEach(function (s) {
    if (s.id !== "s9") return;
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
