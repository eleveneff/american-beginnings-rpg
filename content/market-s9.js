/* v3.4-l9 Level 9 market: a shop near the Pennsylvania State House, Philadelphia, 1776.
   Loaded after market.js and market-s8.js, so it adds its own prices, teaching cards, dye, and market. */
(function () {
  var C = GAME_CONTENT, P = C.prices;
  var add = {
    /* section gear (unlocked every 5 correct in Level 9, then bought) */
    "signal-lantern": 25, "militia-horn": 25, "continental-cockade": 30, "common-sense-book": 35, "declaration-quill": 40,
    "dye-s9": 30,
    /* m8 State House shop */
    "hunting-shirt": 55, "blue-cloak": 60, "buckle-shoes-s9": 35, "linen-cap-s9": 25,
    "striped-kerchief-s9": 20, "tie-pocket-s9": 25, "cockade-ribbon": 30,
    "olive-branch": 20, "powder-horn-keep": 20, "dunlap-broadside": 30, "ink-horn": 30,
    "paine-common-sense": 45, "state-house-key": 50
  };
  Object.keys(add).forEach(function (k) { P[k] = add[k]; });
  var T = C.gearTeach = C.gearTeach || {};
  T["signal-lantern"] = ["A tin lantern with a glass window, hung in a church steeple.", "Sexton Robert Newman and vestryman Captain John Pulling hung two lanterns in the Old North Church on April 18, 1775, to show the British were leaving Boston by water."];
  T["militia-horn"] = ["A hollow cow horn, scraped thin, fitted with a wooden plug and a spout, used to carry black powder.", "A militiaman measured a charge from the horn into his musket. At Bunker Hill, when the horns ran empty, the hill was lost."];
  T["continental-cockade"] = ["A knotted ribbon, often black or later black-and-white, pinned to a hat.", "Soldiers of the new Continental Army wore cockades so they could tell their own side in a crowd."];
  T["common-sense-book"] = ["A short pamphlet, printed on a hand press and sewn, not a bound book.", "Thomas Paine's Common Sense appeared in January 1776 and sold on the order of 100,000 copies."];
  T["declaration-quill"] = ["A goose feather cut to a point, dipped in iron-gall ink.", "Jefferson drafted with a quill; Hancock and the other signers used one too."];
  C.dyes.push({ key: "dye-s9", badge: "s9", market: "m8", name: "Independence Blue Tunic Dye", icon: "🔵", fact: "The Independence Badge color. Colonial dyers made a deep blue with indigo, a plant whose leaves were fermented and then used to dye wool and linen." });
  var m8 = { id: "m8", era: "s9", unlock: "s9", name: "Mistress Leah Biddle's Shop, near the State House", place: "Philadelphia", year: "1776", icon: "🔔",
    scene: "philadelphia",
    blurb: "Just off Chestnut Street, a short walk from the Pennsylvania State House, shops sold cloth, ink, and printed papers to the busiest city in the colonies. In 1776, stars stand in for Pennsylvania shillings.",
    keeper: { name: "Mistress Leah Biddle", role: "shopkeeper (a made-up character)", look: { gender: "girl", tunic: "#3a4a6a", hair: "#3a2a1a", equip: { head: { art: "mob-cap", color: "#efe6d2" }, neck: { art: "kerchief", color: "#2a4a7a" }, belt: { art: "plain-apron", color: "#d8cfb8" } } },
      greet: "Welcome, child. Congress is sitting just up the street. I sell no stamps and no taxed tea: hunting shirts, ink, and Mr. Paine's pamphlet, if I have a copy left.",
      thanks: "Well chosen. Wear it as if the whole city were watching, for it is.",
      poor: "Not quite enough, I'm afraid. Come back when you've earned a few more stars.",
      bye: "Go carefully. These are serious days, and even the cobbles seem to listen." },
    items: [
      { key: "hunting-shirt", name: "Linen Hunting Shirt", icon: "👕", slot: "dress", art: "jerkin", color: "#c8b888", tier: "premium", cat: "clothing",
        made: "A loose, fringed linen overshirt, worn like a coat, common among frontier riflemen and some militiamen.",
        who: "Rifle companies that joined Washington's army often wore hunting shirts instead of a formal uniform. They were cheap, tough, and American-made." },
      { key: "blue-cloak", name: "Deep Blue Wool Cloak", icon: "🧥", slot: "cloak", art: "hooded-cloak", color: "#2a4a7a", tier: "premium", cat: "clothing",
        made: "Wool broadcloth dyed deep blue with indigo, with a hood and a clasp at the neck.",
        who: "Men and women in Philadelphia wore cloaks in cool weather. Indigo blue was a favorite color in the middle colonies." },
      { key: "buckle-shoes-s9", name: "Buckled Leather Shoes", icon: "👞", slot: "feet", art: "buckle-shoes", color: "#2b2b2b", tier: "mid", cat: "clothing",
        made: "Calfskin uppers and leather soles, fastened with a pewter or brass buckle.",
        who: "Townspeople in Philadelphia wore buckled shoes to church, to market, and to the State House yard." },
      { key: "linen-cap-s9", name: "Plain Linen Cap", icon: "🤍", slot: "head", art: "mob-cap", color: "#f2eee2", tier: "basic", cat: "clothing",
        made: "White linen, gathered and tied, worn indoors and under a hat outdoors.",
        who: "Almost every woman and girl in the city wore a cap." },
      { key: "striped-kerchief-s9", name: "Indigo-Striped Kerchief", icon: "🧣", slot: "neck", art: "kerchief", color: "#2a4a7a", tier: "basic", cat: "clothing",
        made: "Linen woven with indigo stripes, folded into a triangle and tucked into the gown.",
        who: "Women and girls wore kerchiefs for warmth and modesty, in town and at market." },
      { key: "tie-pocket-s9", name: "Linen Tie-On Pocket", icon: "👝", slot: "belt", art: "tie-pocket", color: "#d8cfb8", tier: "basic", cat: "clothing",
        made: "Two layers of linen, sometimes embroidered, tied around the waist under the gown.",
        who: "A girl reached her pocket through a slit in her skirt. It might hold a thimble, a letter, or a folded broadside." },
      { key: "cockade-ribbon", name: "Hat Ribbon and Cockade", icon: "🎀", slot: "hair", art: "ribbon", color: null, tier: "mid", cat: "hair",
        fact: "A cockade is a knotted ribbon worn on a hat. Continental soldiers used them as a simple badge of the new army, since few had matching uniforms in 1775–76." },
      { key: "olive-branch", name: "Olive Branch (a token)", icon: "🌿", slot: "pack", art: null, color: "#7a8a4a", tier: "basic", cat: "keepsake",
        fact: "In July 1775 Congress sent the Olive Branch Petition to King George III, a last appeal for peace. The king would not receive it, and he declared the colonies in rebellion." },
      { key: "powder-horn-keep", name: "Carved Powder Horn", icon: "📯", slot: "pack", art: null, color: "#c8b080", tier: "basic", cat: "gear",
        fact: "Militiamen carved maps, names, and dates into powder horns. At Breed's Hill, when the horns ran empty on the third British assault, the hill was lost." },
      { key: "dunlap-broadside", name: "A Dunlap Broadside (a copy)", icon: "📰", slot: "pack", art: null, color: "#e8e0cc", tier: "mid", cat: "keepsake",
        fact: "On the night of July 4, 1776, the Philadelphia printer John Dunlap set the Declaration as a broadside, a sheet printed on one side, so the new nation could read it at once." },
      { key: "ink-horn", name: "Inkhorn and Quills", icon: "🪶", slot: "pack", art: null, color: "#2a2a3a", tier: "mid", cat: "gear",
        fact: "Delegates and clerks at the State House wrote with goose quills and iron-gall ink. Jefferson drafted the Declaration this way." },
      { key: "paine-common-sense", name: "Common Sense (a worn copy)", icon: "📘", slot: "pack", art: null, color: "#3a2a1a", tier: "premium", cat: "keepsake", study: "s9",
        fact: "Thomas Paine's January 1776 pamphlet argued for an independent republic in plain words. It sold on the order of 100,000 copies. Study it to review the key words of this time." },
      { key: "state-house-key", name: "State House Tour Token", icon: "🔑", slot: "pack", art: null, color: "#c9a227", tier: "premium", cat: "keepsake",
        fact: "The Pennsylvania State House, begun in 1732, is the building we call Independence Hall. The Second Continental Congress met there in 1775 and 1776. Its wooden steeple, already aging in 1776, was taken down in 1781 as unsafe and later rebuilt." }
    ] };
  C.markets.push(m8);
  m8.items.forEach(function (x) {
    x.price = P[x.key];
    if (!x.fact) x.fact = (x.made ? "Made of: " + x.made + " " : "") + (x.who ? "Who wore it: " + x.who : "");
  });
})();
