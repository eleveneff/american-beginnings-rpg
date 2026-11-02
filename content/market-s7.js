/* v3.0 Level 7 market: a frontier trading post at Wills Creek, 1754. Loaded after market.js, so it
   adds its own prices, teaching cards, dye, and market, and applies the same price/fact rules. */
(function () {
  var C = GAME_CONTENT, P = C.prices;
  var add = {
    /* section gear (unlocked every 5 correct in Level 7, then bought) */
    "field-book": 25, "haversack": 25, "knit-cap": 30, "ohio-map": 35, "surveyor-compass": 40,
    "dye-s7": 30,
    /* m6 frontier trading post */
    "check-kerchief": 20, "traded-moccasins": 25, "checked-apron": 25, "shot-pouch": 30, "short-gown": 50, "frontier-cloak": 60,
    "hair-plait": 30,
    "noggin": 20, "trade-blanket": 30, "camp-kettle": 30, "powder-horn": 35, "trade-hatchet": 40, "snowshoes": 45,
    "maple-sugar": 20, "wampum-string": 30, "gazette-1754": 30, "silver-brooch": 40, "washington-journal": 45
  };
  Object.keys(add).forEach(function (k) { P[k] = add[k]; });
  var T = C.gearTeach = C.gearTeach || {};
  T["field-book"] = ["Rag paper sewn into a small book with a leather cover; notes in iron-gall ink or pencil lead.", "Surveyors like young George Washington, who became a licensed county surveyor in Virginia at 17."];
  T["haversack"] = ["Heavy linen sewn into a shoulder bag with a flap and a strap.", "Soldiers, militia, and travelers carried their food in one on the march."];
  T["knit-cap"] = ["Wool yarn hand-knitted in the round, often red or blue.", "Sailors, soldiers, settlers, and children wore knitted caps in cold weather."];
  T["ohio-map"] = ["Ink on paper, rolled in a leather tube to keep it dry.", "Colonial officers and traders. Joshua Fry and Peter Jefferson (Thomas Jefferson's father) drew Virginia's great map in 1751."];
  T["surveyor-compass"] = ["A brass compass with sights, set on a wooden staff, plus a 66-foot iron chain.", "Surveyors who marked land boundaries in the backcountry."];
  C.dyes.push({ key: "dye-s7", badge: "s7", market: "m6", name: "Butternut Tunic Dye", icon: "🟤", fact: "The Join-or-Die Badge color. Backcountry families dyed homespun cloth a warm tan-brown with the bark and nut hulls of the butternut tree." });
  var m6 = { id: "m6", era: "s7", unlock: "s7", name: "Trading Post at Wills Creek", place: "Wills Creek, on the Potomac (later Fort Cumberland)", year: "1754", icon: "🏕️",
    scene: "frontier",
    blurb: "At the edge of the frontier, traders swapped blankets, kettles, and gunpowder for deerskins and furs from Native hunters, and sold supplies to settlers and soldiers heading west. Many paid in skins, not coins. Here, stars stand in for shillings.",
    keeper: { name: "Mistress Ruth Hollis", role: "trader's wife (a made-up character)", look: { gender: "girl", tunic: "#7a5a3a", hair: "#5a3a22", equip: { head: { art: "mob-cap", color: "#efe6d2" }, neck: { art: "kerchief", color: "#4a6a9a" }, belt: { art: "plain-apron", color: "#6a8ab0" }, feet: { art: "moccasins", color: "#a07a4a" } } },
      greet: "Welcome, child, come in out of the wind! Blankets, kettles, and good wool, packed over the mountains by horse. Trade you a fair price.",
      thanks: "There now, a fine trade. You'll be snug when the snow comes.",
      poor: "Not enough in your purse for that, I'm afraid. On the frontier we pay in skins or not at all. Come back when you've earned more stars.",
      bye: "Mind the trail, and keep your eyes open. There's talk of French soldiers at the Forks." },
    items: [
      { key: "short-gown", name: "Linsey-Woolsey Short Gown", icon: "👚", slot: "dress", art: "short-gown", color: "#8a4a3a", top: "#8a4a3a", skirt: "#3a4a6a", tier: "premium", cat: "clothing",
        made: "Linsey-woolsey, a sturdy homespun cloth woven with a linen warp and a wool weft: a loose jacket to the hips over a wool petticoat.",
        who: "Working women and girls on farms and on the frontier. A short gown was easier to work in than a long gown." },
      { key: "frontier-cloak", name: "Gray Wool Cloak", icon: "🧥", slot: "cloak", art: "hooded-cloak", color: "#6a6a66", tier: "premium", cat: "clothing",
        made: "Thick fulled wool, left in its natural gray, with a hood and a tie at the neck.",
        who: "Backcountry women and girls. Undyed gray wool was cheaper than red and hid the dirt of the trail." },
      { key: "traded-moccasins", name: "Traded Deerskin Moccasins", icon: "🥿", slot: "feet", art: "moccasins", color: "#a07a4a", tier: "basic", cat: "clothing",
        made: "Smoked deerskin sewn with sinew, made by Native women and traded at frontier posts.",
        who: "Native people, and many frontier settlers and soldiers who learned that moccasins were quiet and warm in the woods." },
      { key: "check-kerchief", name: "Blue Checked Neck Kerchief", icon: "🧣", slot: "neck", art: "kerchief", color: "#4a6a9a", tier: "basic", cat: "clothing",
        made: "Linen woven in a blue-and-white check, folded into a triangle.",
        who: "Working women and girls in the colonies wore checked kerchiefs around the neck and shoulders." },
      { key: "checked-apron", name: "Checked Linen Apron", icon: "🧺", slot: "belt", art: "plain-apron", color: "#6a8ab0", tier: "basic", cat: "clothing",
        made: "Blue-checked linen, tied at the waist with linen tape.",
        who: "Girls and women doing farm and kitchen work. A checked apron didn't show stains as much as white." },
      { key: "shot-pouch", name: "Leather Shot Pouch", icon: "👝", slot: "belt", art: "pouch", color: "#6b4a2a", tier: "mid", cat: "clothing",
        made: "Leather, sewn with a flap, worn on a strap.",
        who: "Frontier families carried lead shot, flints, and small tools in one. Many girls learned to help load and to hunt." },
      { key: "hair-plait", name: "Plaited and Tied Back", icon: "🪢", slot: "hair", art: "one-braid", color: null, tier: "mid", cat: "hair",
        fact: "Frontier girls plaited their hair in one braid and tied it with linen tape, to keep it out of the way of chores." },
      { key: "trade-blanket", name: "Wool Trade Blanket", icon: "🛏️", slot: "pack", art: null, color: "#efe6d2", tier: "mid", cat: "gear",
        fact: "English wool blankets, often white with dark stripes, were among the most wanted trade goods. Native families used them as robes and bedding, and traders bought them with deerskins and beaver furs." },
      { key: "powder-horn", name: "Powder Horn", icon: "📯", slot: "pack", art: null, color: "#e8d9b0", tier: "mid", cat: "gear",
        fact: "A cow's horn, hollowed and capped with wood, kept gunpowder dry. Soldiers often carved maps and names into their horns, and some survive today as history records." },
      { key: "camp-kettle", name: "Brass Camp Kettle", icon: "🍲", slot: "pack", art: null, color: "#c9a227", tier: "mid", cat: "gear",
        fact: "Brass and copper kettles were prized trade goods. Native women cooked in them, and worn-out kettles were cut up to make arrowheads, ornaments, and tools." },
      { key: "snowshoes", name: "Snowshoes", icon: "🥾", slot: "pack", art: null, color: "#8a6a3a", tier: "premium", cat: "gear",
        fact: "Snowshoes of ash wood laced with rawhide were a Native invention. Rangers and soldiers on both sides used them in winter raids." },
      { key: "noggin", name: "Wooden Noggin", icon: "🥣", slot: "pack", art: null, color: "#8a5a32", tier: "basic", cat: "gear",
        fact: "A small cup carved from a single piece of wood, often maple burl, with a handle. Soldiers and travelers carried one for water or broth." },
      { key: "trade-hatchet", name: "Trade Hatchet", icon: "🪓", slot: "hand", art: "axe", color: "#5b5b5b", tier: "premium", cat: "gear",
        fact: "Iron hatchets were among the most valued trade goods. Settlers used them to cut firewood and clear land; Native hunters used them every day." },
      { key: "washington-journal", name: "Washington's 1754 Journal", icon: "📕", slot: "pack", art: null, color: "#6b2a2a", tier: "premium", cat: "keepsake", study: "s7",
        fact: "The Journal of Major George Washington was printed in Williamsburg in 1754, telling of his winter mission to the French at Fort Le Boeuf. Study it to review the key words of this land." },
      { key: "gazette-1754", name: "Pennsylvania Gazette, May 9, 1754", icon: "📰", slot: "pack", art: null, color: "#e8e0cc", tier: "mid", cat: "keepsake",
        fact: "Ben Franklin's newspaper. This issue carried his woodcut of a snake in eight pieces: \"JOIN, or DIE.\"" },
      { key: "silver-brooch", name: "Trade Silver Brooch", icon: "📿", slot: "pack", art: null, color: "#d8dde2", tier: "premium", cat: "keepsake",
        fact: "From the 1750s on, silversmiths in Montreal, Albany, and Philadelphia made small silver brooches for the fur trade. Native people wore many of them sewn in rows on their clothing." },
      { key: "wampum-string", name: "Wampum String", icon: "🪬", slot: "pack", art: null, color: "#efe9df", tier: "mid", cat: "keepsake",
        fact: "Strings and belts of white and purple shell beads carried messages at treaty councils, like the Albany Congress. A speaker held up wampum so his words would be remembered." },
      { key: "maple-sugar", name: "Maple Sugar Cake", icon: "🍁", slot: "pack", art: null, color: "#b5803a", tier: "basic", cat: "keepsake",
        fact: "Native women of the Northeast boiled maple sap into sugar each spring and pressed it into cakes. Settlers learned the craft from them." }
    ] };
  C.markets.push(m6);
  m6.items.forEach(function (x) {
    x.price = P[x.key];
    if (!x.fact) x.fact = (x.made ? "Made of: " + x.made + " " : "") + (x.who ? "Who wore it: " + x.who : "");
  });
})();
