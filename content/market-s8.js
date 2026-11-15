/* v3.1 Level 8 market: a shop on Long Wharf, Boston, 1768–1774, in the years of the boycotts. Loaded after market.js
   and market-s7.js, so it adds its own prices, teaching cards, dye, and market, and applies the same price/fact rules. */
(function () {
  var C = GAME_CONTENT, P = C.prices;
  var add = {
    /* section gear (unlocked every 5 correct in Level 8, then bought) */
    "correspondence-quill": 25, "homespun-shawl": 25, "liberty-cap": 30, "broadside-roll": 35, "spinning-distaff": 40,
    "dye-s8": 30,
    /* m7 Long Wharf shop */
    "striped-kerchief": 20, "ruffled-cap": 25, "embroidered-pocket": 25, "lynn-shoes": 35, "homespun-gown": 55, "red-cloak": 60,
    "hair-ribbon-queue": 30,
    "liberty-tea": 20, "homespun-yarn": 20, "edenton-teapot": 30, "boston-gazette": 30,
    "dickinson-letters": 45, "wheatley-poems": 45, "liberty-bowl": 50
  };
  Object.keys(add).forEach(function (k) { P[k] = add[k]; });
  var T = C.gearTeach = C.gearTeach || {};
  T["correspondence-quill"] = ["A goose feather cut to a point, dipped in iron-gall ink made from oak galls and iron.", "Members of the committees of correspondence, which Samuel Adams helped start in Boston in 1772, who wrote letters town to town and colony to colony."];
  T["homespun-shawl"] = ["Wool spun into yarn and woven at home, then fringed at the ends.", "Women and girls who refused to buy British cloth during the boycotts wore homespun to show it."];
  T["liberty-cap"] = ["Red wool, knitted or sewn into a soft cap.", "An old symbol of freedom. The Sons of Liberty raised caps like it on Liberty Poles."];
  T["broadside-roll"] = ["Rag paper printed on one side on a hand press, then rolled up.", "Printers like Benjamin Edes and John Gill of the Boston Gazette. Broadsides were posted on walls, trees, and Liberty Poles for everyone to read."];
  T["spinning-distaff"] = ["A wooden staff that holds the flax or wool, and a weighted spindle that twists it into thread.", "Girls and women at spinning bees, where the Daughters of Liberty spun in public to make cloth at home instead of buying British goods."];
  C.dyes.push({ key: "dye-s8", badge: "s8", market: "m7", name: "Liberty Elm Green Tunic Dye", icon: "🟢", fact: "The Liberty Tree Badge color. Colonial dyers often made green by dyeing cloth twice: first blue with indigo, then yellow with a plant such as weld or goldenrod." });
  var m7 = { id: "m7", era: "s8", unlock: "s8", name: "Mistress Crane's Shop on Long Wharf", place: "Long Wharf, Boston", year: "1768–1774", icon: "🧶",
    scene: "boston",
    blurb: "Long Wharf ran a third of a mile out into Boston Harbor, lined with warehouses and shops. In the boycott years, many Boston shops stopped selling British goods, and families bought homespun and American-made things instead. Here, stars stand in for shillings.",
    keeper: { name: "Mistress Hannah Crane", role: "shopkeeper (a made-up character)", look: { gender: "girl", tunic: "#6a4a3a", hair: "#4a3022", equip: { head: { art: "mob-cap", color: "#efe6d2" }, neck: { art: "kerchief", color: "#8a6a4a" }, belt: { art: "plain-apron", color: "#d8cfb8" } } },
      greet: "Good day to you! Mind the soldiers on the wharf. Nothing from London on my shelves while the agreement holds: homespun, Boston shoes, and Liberty Tea.",
      thanks: "Well chosen! Wear it proudly. Every bit of homespun tells Parliament we can do without their goods.",
      poor: "Not quite enough, I'm afraid. Come back when you've earned a few more stars.",
      bye: "Go carefully, child. The town is restless, and the redcoats are restless too." },
    items: [
      { key: "homespun-gown", name: "Homespun Gown", icon: "👗", slot: "dress", art: "plain-gown", color: "#7a5a42", tier: "premium", cat: "clothing",
        made: "Linen and wool spun into thread and woven into cloth at home, then dyed brown with walnut hulls or bark.",
        who: "Women and girls who joined the boycotts. Students graduating from Harvard in 1768 also wore homespun, to show they supported American cloth." },
      { key: "red-cloak", name: "Red Wool Cloak", icon: "🧥", slot: "cloak", art: "hooded-cloak", color: "#9a1f1f", tier: "premium", cat: "clothing",
        made: "Wool broadcloth, dyed red with madder root, with a hood and a tie at the neck.",
        who: "Women and girls all over New England wore red cloaks in winter. During the boycotts, families chose cloth woven in the colonies when they could." },
      { key: "lynn-shoes", name: "Lynn-Made Leather Shoes", icon: "👞", slot: "feet", art: "latchet-shoes", color: "#3a2a1a", tier: "mid", cat: "clothing",
        made: "Calfskin and leather soles, sewn by hand, tied with latchets over the tongue.",
        who: "Lynn, Massachusetts, near Boston, was a busy shoemaking town. Buying shoes made in the colonies instead of in England was one way to join the boycott." },
      { key: "ruffled-cap", name: "Ruffled Linen Cap", icon: "🤍", slot: "head", art: "mob-cap", color: "#f2eee2", tier: "basic", cat: "clothing",
        made: "Fine white linen gathered with a ruffle around the face and tied with a ribbon.",
        who: "Almost every woman and girl in Boston wore a cap indoors and under a hat outdoors." },
      { key: "striped-kerchief", name: "Striped Linen Kerchief", icon: "🧣", slot: "neck", art: "kerchief", color: "#6a4a6a", tier: "basic", cat: "clothing",
        made: "Linen woven with colored stripes, folded into a triangle and tucked into the gown.",
        who: "Women and girls wore kerchiefs around the neck and shoulders for warmth and modesty." },
      { key: "embroidered-pocket", name: "Embroidered Tie-On Pocket", icon: "👝", slot: "belt", art: "tie-pocket", color: "#d8cfb8", tier: "basic", cat: "clothing",
        made: "Two layers of linen, embroidered with wool flowers, tied around the waist under the gown.",
        who: "Girls and women had no pockets sewn into their clothes, so they tied one on and reached it through a slit in the gown." },
      { key: "hair-ribbon-queue", name: "Tied with a Silk Ribbon", icon: "🎀", slot: "hair", art: "ribbon", color: null, tier: "mid", cat: "hair",
        fact: "Girls in Boston often wore their hair tied back with a ribbon. Silk ribbon came from abroad, so in the boycott years some girls used plain linen tape instead." },
      { key: "liberty-tea", name: "Liberty Tea", icon: "🍵", slot: "pack", art: null, color: "#7a8a4a", tier: "basic", cat: "keepsake",
        fact: "When patriots stopped drinking British tea, many brewed \"Liberty Tea\" from American plants instead, such as loosestrife, raspberry leaves, or mint." },
      { key: "homespun-yarn", name: "Skein of Homespun Yarn", icon: "🧶", slot: "pack", art: null, color: "#c8b088", tier: "basic", cat: "gear",
        fact: "Spinning bees were public events. In 1768 and 1769, newspapers reported groups of women and girls spinning from dawn to dusk to show the colonies could make their own cloth." },
      { key: "edenton-teapot", name: "Teapot Put Away", icon: "🫖", slot: "pack", art: null, color: "#e8e4da", tier: "mid", cat: "keepsake",
        fact: "In October 1774, 51 women in Edenton, North Carolina, led by Penelope Barker, signed a pledge to support the boycott of British goods, including tea. It was one of the first political actions organized by women in the colonies." },
      { key: "boston-gazette", name: "The Boston Gazette", icon: "📰", slot: "pack", art: null, color: "#e8e0cc", tier: "mid", cat: "keepsake",
        fact: "Printed by Benjamin Edes and John Gill, the Boston Gazette was the favorite newspaper of the Sons of Liberty. Samuel Adams and other patriots wrote essays for it, often under made-up names." },
      { key: "dickinson-letters", name: "Letters from a Farmer in Pennsylvania", icon: "📕", slot: "pack", art: null, color: "#6b2a2a", tier: "premium", cat: "keepsake", study: "s8",
        fact: "In 1767 and 1768, John Dickinson wrote twelve letters arguing that Parliament had no right to tax the colonies to raise money. They were printed in newspapers all over the colonies. Study it to review the key words of this time." },
      { key: "wheatley-poems", name: "Phillis Wheatley's Poems", icon: "📖", slot: "pack", art: null, color: "#3a3a5a", tier: "premium", cat: "keepsake",
        fact: "Poems on Various Subjects, Religious and Moral was printed in London in 1773. Its author, Phillis Wheatley of Boston, was the first African American woman to publish a book of poetry. She had been kidnapped from West Africa as a child and enslaved; she was freed in 1773." },
      { key: "liberty-bowl", name: "Liberty Bowl (a copy)", icon: "🥣", slot: "pack", art: null, color: "#d8dde2", tier: "premium", cat: "keepsake",
        fact: "In 1768 the silversmith Paul Revere made a silver punch bowl honoring the 92 members of the Massachusetts House who refused to take back their Circular Letter against the Townshend Acts. The real bowl is at the Museum of Fine Arts, Boston." }
    ] };
  C.markets.push(m7);
  m7.items.forEach(function (x) {
    x.price = P[x.key];
    if (!x.fact) x.fact = (x.made ? "Made of: " + x.made + " " : "") + (x.who ? "Who wore it: " + x.who : "");
  });
})();
