/* v3.4-l9 Level 9 (Unit 2): Independence Declared, 1775–1776.
   Aligned to McGraw Hill "United States History: Voices and Perspectives", Topic 4 Lesson 05,
   "Declaring Independence" (p. 127, with the Declaration of Independence on p. 133).
   Flag: Level 8 already used the opening of Lesson 05 (the First Continental Congress, p. 127).
   This level recaps the First Congress only briefly, then covers Lexington and Concord, the
   Second Continental Congress, Bunker Hill (fought on Breed's Hill), Common Sense, Lee's
   resolution, and the Declaration. It does NOT include Topic 4 Lesson 06, "The War for
   Independence" (p. 139): no Dorchester Heights, no evacuation of Boston, no New York campaign.
   Truth first with an American Exceptionalism lens: the promise of "all men are created equal,"
   AND the hard truths (Revere was captured; the British took the hill; Loyalists existed; the
   contradiction of slavery). */
GAME_CONTENT.sections.push({
  id: "s9",
  unit: 2,
  title: "Independence Declared",
  era: "1775 to 1776",
  icon: "🔔",
  palette: { sky: "#c8d8ec", sky2: "#7fa4c8", ground: "#6a8a4a", ground2: "#8a7a54", accent: "#1a3a6a", snow: false },
  scene: [
    "It is April 1775. Riders pound along the Lexington road in the dark, church bells will ring at dawn, and in Philadelphia men who still call themselves Englishmen are about to decide whether they will be Americans.",
    "You are {name}, traveling the road from Lexington Green to Independence Hall. Learn how the fighting started, how a Continental Army was born, and why the colonies declared themselves a new nation in 1776!"
  ],
  lessons: [
    { topic: "lexington", title: "Scroll 1: The Midnight Ride and Lexington Green", video: null,
      text: [
        "On the night of **April 18, 1775**, General **Thomas Gage**, the British governor of Massachusetts, ordered Lieutenant Colonel **Francis Smith** to march about 700 regulars west to **Concord**. Their job was to seize and destroy the militia's hidden **cannon, powder, and stores**.",
        "Boston patriots had been watching. **Paul Revere** and **William Dawes** rode out to warn the countryside. In Lexington they woke Captain **John Parker** and his militia. Dr. **Samuel Prescott** joined them on the road to Concord.",
        "Hard truth: British patrols stopped the riders. **Revere was captured** in Lincoln and later released without his horse. Dawes escaped but did not reach Concord. **Prescott got through** and raised the alarm there. The famous ride was a team, not one man.",
        "At dawn on **April 19**, about 70 Lexington militiamen stood on the town **Green**. A British advance under Major **John Pitcairn** ordered them to drop their arms and leave. Parker told his men not to fire unless fired upon. Then a shot rang out. No one is sure who fired first.",
        "The British volleyed and charged with bayonets. **Eight** Lexington men were killed and ten were wounded. The regulars marched on toward Concord. The war had begun."
      ] },
    { topic: "concord", title: "Scroll 2: The North Bridge", video: null,
      text: [
        "At **Concord**, militia from nearby towns gathered on a ridge above the **North Bridge**. British companies searched the town. They found few stores (most had already been hidden) and burned some gun carriages. The smoke made the militia think the town was on fire.",
        "Militiamen under Colonel **James Barrett** and Major **John Buttrick** advanced. At the **North Bridge**, the British fired. The militia fired back. Emerson later called it \"the **shot heard round the world**.\" Two colonists and three British soldiers were killed at the bridge.",
        "The regulars turned back toward Boston, about 16 miles away. All along the road, colonial militia fired from behind stone walls, trees, and houses. At **Meriam's Corner** and through **Lexington** and **Menotomy** (today Arlington), the running fight grew worse for the British.",
        "By the time the column reached safety in Charlestown, it had lost about **73 killed**, 174 wounded, and 26 missing. The colonists lost about **49 killed** and 39 wounded. Farmers and townsmen had stood up to British regulars.",
        "News of the day flew down the post roads. In the weeks that followed, thousands of militiamen camped around Boston and **besieged** the British in the city. The fight was no longer one town's quarrel."
      ] },
    { topic: "congress2", title: "Scroll 3: The Second Continental Congress", video: null,
      text: [
        "The **First Continental Congress** had already met at **Carpenters' Hall** in September 1774 and agreed to meet again in **May 1775** if Britain did not change course. By then, the shooting had started. The **Second Continental Congress** opened on **May 10, 1775**, in the **Pennsylvania State House** in Philadelphia (the building we call **Independence Hall**).",
        "The delegates now had a war on their hands, but they were not yet ready to declare independence. In July they sent the **Olive Branch Petition** to King **George III**, a last appeal for peace. The king would not receive it. He declared the colonies in **rebellion**.",
        "Congress also created a **Continental Army** from the militias camped around Boston and, on **June 15, 1775**, chose **George Washington** of Virginia as its commander. A Virginian at the head of a New England army was meant to show that this was a cause for all the colonies, not just Massachusetts.",
        "Washington took command on **Cambridge Common** on **July 3, 1775**. He found spirit and courage, but also short enlistments, little powder, and no true national army yet. He set to work turning militiamen into soldiers.",
        "Other work of this Congress would come later: a navy, posts, and, in 1776, the vote for independence. For now, the men in Philadelphia were trying to fight a war and still call themselves loyal subjects. That would not last."
      ] },
    { topic: "bunker", title: "Scroll 4: The Battle of Bunker Hill", video: null,
      text: [
        "On the night of **June 16–17, 1775**, colonial troops slipped onto the Charlestown peninsula to threaten the British in Boston. They were told to fortify **Bunker Hill**, the higher hill. Instead they dug a redoubt on **Breed's Hill**, closer to the city. The battle is still called Bunker Hill, but it was fought on Breed's Hill.",
        "In the morning, British warships fired, and General **William Howe** landed about 2,200 regulars. Tradition says Colonel **William Prescott** (or General **Israel Putnam**) told the defenders, \"Don't fire until you see the **whites of their eyes**.\" The point was discipline: wait until the enemy is close, then fire together, because powder was scarce.",
        "The militia threw back the first two assaults with terrible volleys. On the **third** attack the defenders' **powder ran out**. The British took the hill at the point of the bayonet. It was a British victory, bought at a terrible cost: about **1,000** British soldiers killed or wounded, including many officers. The colonists lost about **400**.",
        "Among the Americans killed was **Dr. Joseph Warren**, a popular Boston leader who fought that day as a volunteer. The British could not easily afford another such \"victory.\" Americans learned they could stand against regulars, and also that courage without powder is not enough.",
        "The battle did not free Boston. The siege went on. But it made clear that this was no street riot. It was a war."
      ] },
    { topic: "sense", title: "Scroll 5: Common Sense", video: null,
      text: [
        "By the winter of 1775–76, many colonists still hoped to make peace with the king. Then, in **January 1776**, a short pamphlet called **Common Sense** appeared in Philadelphia. Its author was **Thomas Paine**, an English immigrant who had arrived only in 1774.",
        "Paine wrote in plain words, not lawyer's Latin. He said a hereditary king was absurd, that an island should not rule a continent, and that the time had come to dissolve the connection with Britain and build an independent **republic**. He called George III \"the royal brute.\"",
        "**Common Sense** was a sensation. It sold on the order of **100,000** copies in a few months, an enormous number for the time, and was read aloud in taverns, camps, and homes. People who had never spoken the word **independence** out loud began to argue for it.",
        "Not everyone was convinced. **Loyalists**, colonists who stayed loyal to the king, called Paine a dangerous radical. Some moderate patriots still hoped for a settlement. But Paine had changed the question from \"How do we get our rights as Englishmen?\" to \"Should we be Englishmen at all?\"",
        "Paine's later writings would also attack slavery and defend a wide right to liberty. The argument he started in January 1776 helped make independence thinkable just as Congress was about to debate it."
      ] },
    { topic: "decision", title: "Scroll 6: Lee's Resolution and the Committee of Five", video: null,
      text: [
        "On **June 7, 1776**, **Richard Henry Lee** of Virginia offered a resolution in Congress: \"That these United Colonies are, and of right ought to be, **free and independent States**.\" The words were the colonies' formal claim to nationhood.",
        "Congress postponed the vote so wavering colonies could be brought along. Meanwhile it named a **Committee of Five** to draft a declaration explaining the step: **Thomas Jefferson** of Virginia, **John Adams** of Massachusetts, **Benjamin Franklin** of Pennsylvania, **Roger Sherman** of Connecticut, and **Robert R. Livingston** of New York.",
        "The committee asked **Jefferson**, a skilled writer, only 33 years old, to prepare the first draft. Adams and Franklin suggested changes. Jefferson later remembered that he was trying to set down the **common sense** of the matter, the beliefs Americans already shared.",
        "On **July 2, 1776**, Congress voted for independence, 12 colonies in favor (New York's delegates waited for instructions and agreed a few days later). **John Adams** wrote to his wife **Abigail** that July 2 would be remembered with parades and fireworks. He was off by two days.",
        "The vote of July 2 made the United States. The paper adopted on July 4 would tell the world **why**."
      ] },
    { topic: "declaration", title: "Scroll 7: The Declaration of Independence", video: null,
      text: [
        "On **July 4, 1776**, Congress adopted the **Declaration of Independence**. (Most delegates signed the formal copy later, on **August 2**.) **John Hancock**, president of Congress, signed first, in a large, clear hand. The printer **John Dunlap** worked through the night to set the text as a **broadside** for the new nation to read.",
        "The Declaration's heart is its **preamble**. It says that all men are **created equal**, that they are endowed by their Creator with **unalienable rights**, including **life, liberty, and the pursuit of happiness**, and that governments are instituted to secure those rights, deriving their just powers from the **consent of the governed**.",
        "That promise is the American idea at its best. It has called Americans to live up to it ever since. Hard truth: in 1776 it was also a contradiction. **Jefferson himself enslaved people**. About **one in five** people in the colonies was enslaved. Jefferson's draft even blamed the king for the **slave trade**; Congress **struck that clause out**, because South Carolina, Georgia, and some New England merchants would not accept it.",
        "The rest of the Declaration is a list of **grievances**, formal complaints against **George III**: keeping standing armies in peacetime, taxing without consent, cutting off trade, denying trial by jury, and more. The signers pledged to each other \"our Lives, our Fortunes, and our sacred Honor.\"",
        "They knew the cost. If the war was lost, they could be hanged as traitors. About **56** men signed. Not every colonist agreed: many **Loyalists** still sided with the king, and some people just hoped to be left alone. But a new nation had been declared, and it would have to be made real."
      ] }
  ],
  gear: [
    { key: "signal-lantern", name: "Signal Lantern", icon: "🏮", slot: "belt", art: "pouch", color: "#c9a227", desc: "One if by land, two if by sea: lanterns hung in the steeple of the Old North Church." },
    { key: "militia-horn", name: "Militia Powder Horn", icon: "📯", slot: "belt", art: "pouch", color: "#c8b080", desc: "A cow-horn flask that held the black powder a militiaman needed to fire." },
    { key: "continental-cockade", name: "Continental Cockade", icon: "🔵", slot: "head", art: "wool-cap", color: "#1a3a6a", desc: "A ribbon knot worn on a hat to show service in the new Continental Army." },
    { key: "common-sense-book", name: "Common Sense", icon: "📘", slot: "pack", art: "hornbook", color: "#3a2a1a", desc: "Thomas Paine's January 1776 pamphlet that made independence thinkable." },
    { key: "declaration-quill", name: "Declaration Quill", icon: "🪶", slot: "belt", art: "pouch", color: "#2a2a3a", desc: "A goose-quill, like the one used to draft and sign the Declaration." }
  ],
  badge: { name: "Independence Badge", icon: "🔔", tunic: "#2a4a7a", desc: "Mastered Independence Declared! Unlocks a new tunic dye at the market." },
  questions: [
    { id: "s9q1", topic: "lexington", type: "mc", q: "What was General Gage's goal in sending troops to Concord on April 18–19, 1775?",
      choices: ["To seize and destroy the militia's hidden cannon, powder, and stores", "To arrest George Washington", "To burn Philadelphia", "To collect the Stamp Tax"],
      explain: "Lieutenant Colonel Francis Smith was ordered to Concord for the stores." },
    { id: "s9q2", topic: "lexington", type: "short", q: "Which rider was captured by a British patrol and did not reach Concord?",
      accept: ["paul revere", "revere"], display: "Paul Revere", explain: "Dr. Samuel Prescott got through and raised the alarm in Concord." },
    { id: "s9q3", topic: "lexington", type: "mc", q: "Who actually reached Concord and raised the alarm there?",
      choices: ["Dr. Samuel Prescott", "Paul Revere alone", "General Gage", "John Hancock"],
      explain: "Revere was captured; Dawes did not reach Concord; Prescott did." },
    { id: "s9q4", topic: "lexington", type: "fill", q: "On the morning of April 19, 1775, about 70 militiamen stood on Lexington ____.",
      accept: ["green", "the green", "lexington green", "the town green"], display: "Green", explain: "Captain John Parker commanded them." },
    { id: "s9q5", topic: "lexington", type: "mc", q: "How many Lexington militiamen were killed on the Green?",
      choices: ["Eight", "Seventy", "None", "Two hundred"],
      explain: "Ten more were wounded. No one is sure who fired first." },
    { id: "s9q6", topic: "lexington", type: "vocab", term: "militia",
      choices: ["Citizen soldiers who train part-time and can be called out in an emergency", "Full-time British regulars in red coats", "A meeting of Congress", "A tax on tea"],
      explain: "Parker's men at Lexington were militia, not a standing army." },
    { id: "s9q7", topic: "concord", type: "mc", q: "Where did colonial militia fire on British regulars in Concord?",
      choices: ["The North Bridge", "Faneuil Hall", "Breed's Hill", "Carpenters' Hall"],
      explain: "The fight at the North Bridge began the British retreat to Boston." },
    { id: "s9q8", topic: "concord", type: "short", q: "What did Ralph Waldo Emerson later call the first colonial volley at the North Bridge?",
      accept: ["the shot heard round the world", "shot heard round the world", "the shot heard around the world", "shot heard around the world"], display: "the shot heard round the world", explain: "Emerson wrote the line decades later in a Concord hymn." },
    { id: "s9q9", topic: "concord", type: "mc", q: "About how many British soldiers were killed in the fighting of April 19, 1775?",
      choices: ["About 73 killed (plus many wounded and missing)", "About 8 killed", "None", "About 1,000 killed"],
      explain: "Colonial losses were about 49 killed and 39 wounded." },
    { id: "s9q10", topic: "concord", type: "fill", q: "After April 19, colonial militia surrounded Boston and ____ the British in the city.",
      accept: ["besieged", "besiege", "siege", "laid siege to", "laid siege"], display: "besieged", explain: "Thousands of militiamen camped around the city." },
    { id: "s9q11", topic: "concord", type: "vocab", term: "regulars",
      choices: ["Full-time, trained professional soldiers", "Farmers who fought only one day", "Members of Congress", "Printers of pamphlets"],
      explain: "The British troops on the Concord march were regulars." },
    { id: "s9q12", topic: "congress2", type: "mc", q: "Where did the Second Continental Congress meet, beginning May 10, 1775?",
      choices: ["The Pennsylvania State House in Philadelphia (Independence Hall)", "Carpenters' Hall", "Faneuil Hall in Boston", "The Old South Meeting House"],
      explain: "The First Congress had met at Carpenters' Hall in 1774; the Second met in the State House." },
    { id: "s9q13", topic: "congress2", type: "mc", q: "What was the Olive Branch Petition?",
      choices: ["A last appeal for peace that Congress sent to King George III in July 1775", "A plan to attack Boston", "Thomas Paine's pamphlet", "Lee's resolution for independence"],
      explain: "The king would not receive it and declared the colonies in rebellion." },
    { id: "s9q14", topic: "congress2", type: "short", q: "Whom did Congress choose, on June 15, 1775, as commander of the Continental Army?",
      accept: ["george washington", "washington", "general washington"], display: "George Washington", explain: "A Virginian at the head of a New England army showed this was a cause for all the colonies." },
    { id: "s9q15", topic: "congress2", type: "fill", q: "Washington took command of the army on Cambridge Common on July 3, ____.",
      accept: ["1775"], display: "1775", explain: "He found spirit, short enlistments, and little powder." },
    { id: "s9q16", topic: "congress2", type: "vocab", term: "petition",
      choices: ["A formal written request, often to a ruler or government", "A surprise attack", "A tax stamp", "A kind of musket"],
      explain: "The Olive Branch Petition asked the king for peace." },
    { id: "s9q17", topic: "congress2", type: "mc", q: "Why did Congress choose a Virginian to command an army that was mostly New England militia at first?",
      choices: ["To show that the cause belonged to all the colonies, not just Massachusetts", "Because no New Englander would fight", "Because Virginia had already declared independence", "Because the king asked for Washington"],
      explain: "Unity among the colonies mattered as much as military skill." },
    { id: "s9q18", topic: "bunker", type: "mc", q: "Where was the Battle of Bunker Hill actually fought?",
      choices: ["On Breed's Hill, closer to Boston than Bunker Hill", "On Bunker Hill, exactly as planned", "On Lexington Green", "At the North Bridge in Concord"],
      explain: "The troops were told to fortify Bunker Hill but dug in on Breed's Hill." },
    { id: "s9q19", topic: "bunker", type: "mc", q: "What did \"Don't fire until you see the whites of their eyes\" mean?",
      choices: ["Wait until the enemy is close, then fire together, because powder was scarce", "Never fire at all", "Only officers may shoot", "Fire as soon as you see a red coat, even at long range"],
      explain: "Tradition gives the line to Prescott or Putnam. The point was discipline." },
    { id: "s9q20", topic: "bunker", type: "mc", q: "Why did the British finally take the hill on the third assault?",
      choices: ["The colonial defenders ran out of powder", "The militia ran away at the first shot", "Washington told them to retreat", "A storm flooded the redoubt"],
      explain: "It was a British victory at a terrible cost: about 1,000 British killed or wounded." },
    { id: "s9q21", topic: "bunker", type: "short", q: "About how many British soldiers were killed or wounded at Bunker Hill?",
      accept: ["1000", "1,000", "about 1000", "about 1,000", "one thousand"], display: "about 1,000", explain: "Colonial losses were about 400. The British could not easily afford another such victory." },
    { id: "s9q22", topic: "bunker", type: "fill", q: "The popular Boston leader Dr. Joseph ____ was killed fighting as a volunteer at Bunker Hill.",
      accept: ["warren"], display: "Warren", explain: "He was a patriot doctor and organizer, not a career officer." },
    { id: "s9q23", topic: "bunker", type: "vocab", term: "redoubt",
      choices: ["A small, hastily built fort of earth and timber", "A kind of pamphlet", "A British warship", "A peace petition"],
      explain: "The colonists dug a redoubt on Breed's Hill in the night." },
    { id: "s9q24", topic: "sense", type: "mc", q: "Who wrote the pamphlet Common Sense in January 1776?",
      choices: ["Thomas Paine, an English immigrant", "Thomas Jefferson", "John Adams", "Benjamin Franklin"],
      explain: "Paine had arrived in America only in 1774." },
    { id: "s9q25", topic: "sense", type: "mc", q: "What did Common Sense argue?",
      choices: ["That the colonies should become an independent republic and break with the king", "That the Olive Branch Petition should be tried once more", "That only Massachusetts should fight", "That colonists should pay the Stamp Tax"],
      explain: "Paine said an island should not rule a continent." },
    { id: "s9q26", topic: "sense", type: "fill", q: "Common Sense sold on the order of ____ copies in a few months, an enormous number for the time.",
      accept: ["100000", "100,000", "100000 copies", "a hundred thousand", "100000-120000", "120000", "120,000"], display: "100,000", explain: "It was read aloud in taverns, camps, and homes." },
    { id: "s9q27", topic: "sense", type: "vocab", term: "Loyalist",
      choices: ["A colonist who stayed loyal to the king", "A member of the Continental Army", "A writer of Common Sense", "A signer of the Declaration"],
      explain: "Loyalists thought independence was rebellion and a mistake." },
    { id: "s9q28", topic: "sense", type: "short", q: "What form of government did Paine say the colonies should build after breaking with the king?",
      accept: ["republic", "a republic", "republican", "an independent republic"], display: "a republic", explain: "He also said a hereditary king was absurd." },
    { id: "s9q29", topic: "decision", type: "mc", q: "Who offered the June 7, 1776, resolution that the colonies \"are, and of right ought to be, free and independent States\"?",
      choices: ["Richard Henry Lee of Virginia", "Thomas Paine", "John Hancock", "Paul Revere"],
      explain: "Congress postponed the vote so wavering colonies could be brought along." },
    { id: "s9q30", topic: "decision", type: "mc", q: "Who wrote the first draft of the Declaration of Independence for the Committee of Five?",
      choices: ["Thomas Jefferson", "John Adams", "Benjamin Franklin", "Roger Sherman"],
      explain: "Adams and Franklin suggested changes to Jefferson's draft." },
    { id: "s9q31", topic: "decision", type: "mc", q: "On which date did Congress actually vote for independence?",
      choices: ["July 2, 1776", "July 4, 1776", "June 7, 1776", "April 19, 1775"],
      explain: "July 4 is when Congress adopted the Declaration that explained the vote." },
    { id: "s9q32", topic: "decision", type: "short", q: "Name one of the five men on the committee named to draft the Declaration.",
      accept: ["jefferson", "adams", "john adams", "thomas jefferson", "franklin", "benjamin franklin", "sherman", "roger sherman", "livingston", "robert livingston", "robert r. livingston"], display: "Jefferson, Adams, Franklin, Sherman, or Livingston", explain: "The Committee of Five was Jefferson, Adams, Franklin, Sherman, and Livingston." },
    { id: "s9q33", topic: "decision", type: "fill", q: "John Adams wrote to his wife ____ that July 2 would be celebrated with parades and fireworks.",
      accept: ["abigail", "abigail adams"], display: "Abigail", explain: "He was off by two days: we celebrate July 4." },
    { id: "s9q34", topic: "declaration", type: "mc", q: "According to the Declaration's preamble, governments derive their just powers from what?",
      choices: ["The consent of the governed", "The king's divine right", "The richest landowners", "The British Parliament"],
      explain: "That is the heart of the American idea of self-government." },
    { id: "s9q35", topic: "declaration", type: "mc", q: "The Declaration says all men are created equal and have unalienable rights to life, liberty, and what else?",
      choices: ["The pursuit of happiness", "A vote in Parliament", "Free tea", "A title of nobility"],
      explain: "Jefferson's phrase became one of the most famous in the world." },
    { id: "s9q36", topic: "declaration", type: "mc", q: "What happened to the clause in Jefferson's draft that blamed the king for the slave trade?",
      choices: ["Congress struck it out", "It became the first amendment", "George III agreed to it", "It was the first line of the preamble"],
      explain: "South Carolina, Georgia, and some New England merchants would not accept it." },
    { id: "s9q37", topic: "declaration", type: "vocab", term: "grievances",
      choices: ["Formal complaints, like the list of charges against George III", "Peace talks", "Army enlistments", "Tax stamps"],
      explain: "Most of the Declaration is a list of grievances against the king." },
    { id: "s9q38", topic: "declaration", type: "short", q: "Who was president of Congress and signed the Declaration first, in a large, clear hand?",
      accept: ["john hancock", "hancock"], display: "John Hancock", explain: "Printer John Dunlap then set the text as a broadside." },
    { id: "s9q39", topic: "declaration", type: "fill", q: "Most delegates signed the formal copy of the Declaration on ____ 2, 1776, not on July 4.",
      accept: ["august"], display: "August", explain: "July 4 is the day Congress adopted the text." },
    { id: "s9q40", topic: "declaration", type: "mc", q: "Which of these hard truths belongs with the story of July 1776?",
      choices: ["Jefferson enslaved people, and about one in five people in the colonies was enslaved", "Every colonist signed the Declaration", "There were no Loyalists left in 1776", "The Declaration immediately ended slavery"],
      explain: "The promise of equality is the nation's standard, and 1776 did not yet live up to it." }
  ]
});
GAME_CONTENT.extend("s9", {
  lessons: [{
    topic: "src9a", title: "Scroll 8: Source Scroll: Gage's Order, April 18, 1775", video: null,
    source: {
      kind: "text",
      title: "General Thomas Gage to Lieutenant Colonel Francis Smith",
      author: "General Thomas Gage, military governor of Massachusetts",
      date: "April 18, 1775",
      context: "Gage, in Boston, ordered Lieutenant Colonel Francis Smith to march west that night and seize the militia stores hidden at Concord. This is the actual order that sent the regulars on the road to Lexington and Concord.",
      clues: ["What had been collected at Concord, according to Gage?", "What was Smith told to do with those stores?", "What were the soldiers told not to do to the inhabitants?"],
      excerpt: [
        "\"Having received intelligence, that a quantity of Ammunition, Provisions, Artillery, Tents and small Arms, have been collected at Concord, for the Avowed Purpose of raising and supporting a Rebellion against His Majesty, you will March with a Corps of Grenadiers and Light Infantry, put under your Command, with the utmost expedition and Secrecy to Concord, where you will seize and destroy all Artillery, Ammunition, Provisions, Tents, Small Arms, and all Military Stores whatever.\"",
        "\"But you will take care that the Soldiers do not plunder the Inhabitants, or hurt private property.\""
      ],
      note: "Spelling of the 1775 order is kept. A \"Corps of Grenadiers and Light Infantry\" was a picked force of about 700 men.",
      url: "https://www.masshist.org/database/viewer.php?item_id=396"
    },
    text: [
      "Gage wanted a **quiet raid** on hidden **military stores**, not a battle. He told Smith to move in **secrecy** and not to plunder the townspeople.",
      "The raid did not stay quiet. Riders spread the alarm, and by dawn the militia was on Lexington Green. An order meant to prevent rebellion helped start a war."
    ]
  }, {
    topic: "src9b", title: "Scroll 9: Source Scroll: The Declaration of Independence (1776)", video: null,
    source: {
      kind: "text",
      title: "The Unanimous Declaration of the Thirteen United States of America",
      author: "The Continental Congress; drafted by Thomas Jefferson, with changes by the committee and by Congress",
      date: "July 4, 1776",
      context: "Congress adopted this Declaration in Philadelphia on July 4, 1776, two days after voting for independence. Most delegates signed the formal copy on August 2. The printer John Dunlap set the text as a broadside that same night.",
      clues: ["Where do governments get their just powers?", "Which unalienable rights does the preamble name?", "Name one grievance against the king in this excerpt."],
      excerpt: [
        "\"We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. That to secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the governed.\"",
        "\"The history of the present King of Great Britain is a history of repeated injuries and usurpations.\"",
        "\"He has kept among us, in times of peace, Standing Armies without the Consent of our legislatures. ... For imposing Taxes on us without our Consent. ... For cutting off our Trade with all parts of the world.\"",
        "\"And for the support of this Declaration, with a firm reliance on the protection of divine Providence, we mutually pledge to each other our Lives, our Fortunes and our sacred Honor.\""
      ],
      note: "A short excerpt. The full Declaration lists many more grievances. The promise of equality is the nation's standard; in 1776 it was also a contradiction, because slavery continued.",
      url: "https://www.archives.gov/founding-docs/declaration-transcript"
    },
    text: [
      "The **preamble** states the American idea: **equality**, **unalienable rights**, and government by **consent**. The rest of the paper lists **grievances** against **George III** and pledges the signers' lives, fortunes, and honor.",
      "Hard truth: the promise did not yet include everyone. **Jefferson enslaved people**, and Congress **struck out** his clause blaming the king for the **slave trade**. The Declaration set a standard the nation would have to grow into."
    ]
  }],
  questions: [
    { id: "s9s1", topic: "src9a", type: "mc", q: "According to Gage's order, what had been collected at Concord?",
      choices: ["Ammunition, provisions, artillery, tents, and small arms", "Tea to be taxed", "Gold for the king", "Copies of Common Sense"],
      explain: "Gage believed the stores were for \"raising and supporting a Rebellion.\"" },
    { id: "s9s2", topic: "src9a", type: "mc", q: "What did Gage tell Smith to do with those stores?",
      choices: ["Seize and destroy them", "Buy them for the army", "Leave them alone", "Ship them to Philadelphia"],
      explain: "The march of April 18–19 was a raid on military stores, not a plan to burn the town." },
    { id: "s9s3", topic: "src9a", type: "short", q: "What did Gage tell the soldiers not to do to the inhabitants?",
      accept: ["plunder", "plunder the inhabitants", "hurt private property", "plunder or hurt private property", "not plunder", "do not plunder"], display: "plunder the inhabitants, or hurt private property", explain: "Gage wanted a quiet raid. It did not stay quiet." },
    { id: "s9s4", topic: "src9b", type: "mc", q: "According to the preamble, where do governments get their just powers?",
      choices: ["From the consent of the governed", "From the king's birth", "From the largest army", "From Parliament alone"],
      explain: "That sentence is the core of American self-government." },
    { id: "s9s5", topic: "src9b", type: "mc", q: "Which of these is one of the unalienable rights named in the preamble?",
      choices: ["Liberty", "A seat in the House of Lords", "Free land in the West", "A royal title"],
      explain: "The three named rights are life, liberty, and the pursuit of happiness." },
    { id: "s9s6", topic: "src9b", type: "short", q: "Name one grievance against the king in this excerpt.",
      accept: ["standing armies", "standing armies without the consent", "taxes", "imposing taxes", "taxes without our consent", "cutting off our trade", "trade", "injuries and usurpations"], display: "standing armies, taxes without consent, or cutting off trade", explain: "The signers listed many injuries; these are three of them." }
  ]
});
GAME_CONTENT.extend("s9", {
  activities: [
    { id: "s9-riders", type: "sort", icon: "🐎", title: "Who Rode, Who Fought?", topic: "lexington",
      intro: "Sort each name or fact into the right group. Some people are famous for the ride; some for the fighting that followed.",
      bins: [
        { id: "ride", label: "The midnight ride", color: "#2a4a7a" },
        { id: "fight", label: "The fighting of April 19", color: "#8b1a1a" }
      ],
      items: [
        { t: "Paul Revere", bin: "ride", fact: "He rode from Boston and was later captured in Lincoln." },
        { t: "William Dawes", bin: "ride", fact: "He took a different road out of Boston the same night." },
        { t: "Dr. Samuel Prescott", bin: "ride", fact: "He joined the ride and was the one who reached Concord." },
        { t: "Captain John Parker", bin: "fight", fact: "He commanded the Lexington militia on the Green." },
        { t: "Major John Pitcairn", bin: "fight", fact: "He led the British advance at Lexington." },
        { t: "Major John Buttrick", bin: "fight", fact: "He helped lead the militia at the North Bridge." }
      ] },
    { id: "s9-road", type: "sequence", icon: "📜", title: "The Road to Independence", topic: "declaration",
      intro: "Put these events in the order they happened, from first to last. Watch out for things that don't belong in 1775–76!",
      steps: [
        { t: "The fighting at Lexington and Concord", fact: "April 19, 1775. The war begins." },
        { t: "The Second Continental Congress opens in Philadelphia", fact: "May 10, 1775, at the Pennsylvania State House." },
        { t: "The Battle of Bunker Hill, fought on Breed's Hill", fact: "June 17, 1775. A costly British victory." },
        { t: "Washington takes command in Cambridge", fact: "July 3, 1775." },
        { t: "Thomas Paine publishes Common Sense", fact: "January 1776." },
        { t: "Richard Henry Lee offers his resolution for independence", fact: "June 7, 1776." },
        { t: "Congress adopts the Declaration of Independence", fact: "July 4, 1776, after the July 2 vote." }
      ],
      distractors: [
        { t: "The British leave Boston after cannons are dragged to Dorchester Heights", why: "That is Topic 4 Lesson 06, March 1776: the war for independence, not this lesson." },
        { t: "Post the Declaration as a status update on the internet", why: "The printer John Dunlap set a broadside by hand. The internet is more than two centuries later!" }
      ] },
    { id: "s9-adams", type: "dialogue", icon: "🗣️", title: "Talk with John Adams", topic: "decision",
      intro: "It is early July 1776 in Philadelphia. John Adams of Massachusetts has a few minutes to talk.",
      who: { name: "John Adams", role: "delegate from Massachusetts, July 1776", portrait: "👨🏻", look: { gender: "boy", tunic: "#2a2a3a", hair: "#3a3028", equip: { body: { art: "waistcoat", color: "#3a3a4a" }, head: { art: "tricorn", color: "#1d1d2b" }, feet: { art: "buckle-shoes", color: "#2b2b2b" } } } },
      lines: [
        { say: "We have voted for independence, but the world will ask why. Who should write our declaration?",
          choices: [ { t: "Jefferson of Virginia: a fine writer, and a southerner helps the cause look continental", ok: true, r: "Yes. I urged Jefferson for those reasons, and because I was too debated myself." },
                     { t: "I will write it myself tonight. Virginia has nothing to do with this", r: "No: a Virginian on the draft shows this is not only New England's cause." },
                     { t: "Let Thomas Paine write it. Common Sense is already the Declaration", r: "Paine moved opinion, but Congress named its own committee." } ] },
        { say: "Some still say we should wait. What if the king offers terms?",
          choices: [ { t: "We already sent the Olive Branch last year. The king would not hear us, and he has declared us in rebellion", ok: true, r: "Exactly so. Reconciliation is a closed door." },
                     { t: "Then we should send another petition at once and delay the vote", r: "By July 1776 I wanted the decision made, not postponed again." },
                     { t: "The fighting at Lexington was a misunderstanding. We can still go home", r: "A year of war has passed. It was no misunderstanding." } ] },
        { say: "Will July 2 be the day Americans remember, with parades and fireworks?",
          choices: [ { t: "I think so, though the Declaration we adopt may be the paper people read", ok: true, r: "I wrote as much to my wife Abigail. In the end the country chose July 4, the day the text was adopted." },
                     { t: "No one will remember any of this. It is only a committee report", r: "I believed the step was historic, and said so." },
                     { t: "We should celebrate April 19 instead and skip a written declaration", r: "The fighting started the war; a public declaration tells the world why." } ] }
      ] }
  ]
});
GAME_CONTENT.extend("s9", {
  activities: [{
    id: "s9-geomap", type: "geomap", geo: "s6", icon: "🧭", title: "Map the Fight for Independence", topic: "concord",
    intro: "Drag each label onto its dot (or tap a label, then tap the dot). Blue dots are in New England, green in the Middle Colonies, and red in the Southern Colonies. Nearby towns are grouped so the dots do not sit on top of each other on this wide map of the thirteen colonies.",
    targets: [
      { id: "lexconcord", label: "Lexington and Concord, April 19, 1775", lat: 42.46, lon: -71.35, region: "ne", fact: "The war began on the **Green** and at the **North Bridge**. Revere was captured; **Prescott** reached Concord.", q: "s9q7" },
      { id: "bostonhill", lpos: "b", label: "Boston, Breed's Hill, and Cambridge", lat: 42.36, lon: -71.06, region: "ne", fact: "The Battle of **Bunker Hill** was fought on **Breed's Hill** on June 17, 1775. Washington took command in nearby **Cambridge** on **July 3**.", q: "s9q18" },
      { id: "philadelphia", label: "Philadelphia (Congress and the Declaration)", lat: 39.95, lon: -75.15, region: "mid", fact: "The Second Congress met in the **Pennsylvania State House**.", q: "s9q12" },
      { id: "williamsburg", label: "Williamsburg (Lee's home colony)", lat: 37.27, lon: -76.7, region: "south", fact: "**Richard Henry Lee** of Virginia offered the independence resolution on **June 7, 1776**.", q: "s9q29" },
      { id: "newyork", lpos: "l", label: "New York (delayed the July 2 vote)", lat: 40.71, lon: -74.0, region: "mid", fact: "Twelve colonies voted for independence on **July 2**; New York agreed a few days later.", q: "s9q31" }
    ]
  }, {
    id: "s9-timeline", type: "timeline", icon: "📜", title: "Timeline: Independence Declared", topic: "declaration",
    intro: "Put each event in the right place on the timeline. Earlier events go at the **top**.",
    events: [
      { t: "The midnight ride; Lexington and Concord", when: "April 18–19, 1775", y: 1775.3, q: "s9q1" },
      { t: "The Second Continental Congress opens", when: "May 10, 1775", y: 1775.36, q: "s9q12" },
      { t: "Congress names Washington commander", when: "June 15, 1775", y: 1775.45, q: "s9q14" },
      { t: "The Battle of Bunker Hill (Breed's Hill)", when: "June 17, 1775", y: 1775.46, q: "s9tl1" },
      { t: "Washington takes command in Cambridge", when: "July 3, 1775", y: 1775.51, q: "s9q15" },
      { t: "Thomas Paine publishes Common Sense", when: "January 1776", y: 1776.05, q: "s9q24" },
      { t: "Richard Henry Lee offers his resolution", when: "June 7, 1776", y: 1776.43, q: "s9q29" },
      { t: "Congress votes for independence", when: "July 2, 1776", y: 1776.5, q: "s9q31" },
      { t: "Congress adopts the Declaration of Independence", when: "July 4, 1776", y: 1776.51, q: "s9tl2" }
    ]
  }]
});
GAME_CONTENT.extend("s9", {
  questions: [
    { id: "s9tl1", topic: "bunker", type: "mc", q: "On what date was the Battle of Bunker Hill fought?",
      choices: ["June 17, 1775", "April 19, 1775", "July 4, 1776", "June 7, 1776"],
      explain: "It was fought on Breed's Hill, two days after Washington was chosen commander (he was not yet in Massachusetts that day)." },
    { id: "s9tl2", topic: "declaration", type: "mc", q: "What happened on July 4, 1776?",
      choices: ["Congress adopted the Declaration of Independence", "Congress first voted for independence", "Washington took command", "Paine published Common Sense"],
      explain: "The vote for independence was July 2; July 4 is the day the Declaration was adopted." },
    { id: "s9mp1", topic: "lexington", type: "mc", q: "Lexington and Concord are in which colony?",
      choices: ["Massachusetts", "Virginia", "Pennsylvania", "New York"],
      explain: "Both towns lie west of Boston." }
  ]
});
