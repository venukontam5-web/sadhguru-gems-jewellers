export type GemGroup = "navratna" | "precious" | "semi";

export type Gemstone = {
  slug: string;
  name: string;
  sanskrit: string;
  planet: string;
  planetSanskrit: string;
  group: GemGroup;
  color: string;
  hardness: string;
  metal: string;
  finger: string;
  day: string;
  image: string;
  excerpt: string;
  description: string;
  tradition: string;
  origin: string;
  note: string;
};

export const GEMSTONES: Gemstone[] = [
  {
    slug: "ruby",
    name: "Ruby",
    sanskrit: "Manikya",
    planet: "Sun",
    planetSanskrit: "Surya",
    group: "navratna",
    color: "Pigeon-blood red",
    hardness: "9 Mohs",
    metal: "Gold (yellow)",
    finger: "Ring finger",
    day: "Sunday",
    image: "/images/ruby.jpg?v=ivory",
    excerpt: "The king of gems. Warm, commanding, and the stone of the Sun.",
    description:
      "Ruby is corundum coloured by chromium. The most prized stones show a vivid pigeon-blood red with a lively silk of rutile. We source untreated and heat-treated material with full disclosure, and set only those that hold colour in daylight and incandescent light alike.",
    tradition:
      "In the Navratna, ruby stands for Surya. Classical texts associate it with vitality, honour, and a clear sense of purpose. It is traditionally worn on the ring finger in gold, on a Sunday morning after due consultation.",
    origin: "Mozambique, Myanmar, Thailand, Madagascar",
    note: "Ask to see the stone in north daylight before you decide. Colour that only lives under spotlights will disappoint at home.",
  },
  {
    slug: "pearl",
    name: "Pearl",
    sanskrit: "Moti",
    planet: "Moon",
    planetSanskrit: "Chandra",
    group: "navratna",
    color: "Cream to silver-white",
    hardness: "2.5–4.5 Mohs",
    metal: "Silver",
    finger: "Little finger",
    day: "Monday",
    image: "/images/pearl.jpg?v=ivory",
    excerpt: "The Moon’s gem — luminous, calm, and grown rather than cut.",
    description:
      "A pearl is nacre built layer by layer inside a mollusc. We offer natural Basra-type pearls when they appear, and fine cultured pearls with tight luster and clean skin. Shape, orient, and surface decide value more than size alone.",
    tradition:
      "Pearl is Chandra’s stone in the Navratna. It is linked with composure, sleep, and the mind’s tides. Traditionally set in silver and worn on a Monday.",
    origin: "Basra, Hyderabad, Japan, Tahiti (cultured)",
    note: "Keep pearls away from perfume, sweat, and ultrasonic cleaners. Wipe with a soft cloth after wear.",
  },
  {
    slug: "red-coral",
    name: "Red Coral",
    sanskrit: "Moonga",
    planet: "Mars",
    planetSanskrit: "Mangala",
    group: "navratna",
    color: "Oxblood to salmon",
    hardness: "3.5–4 Mohs",
    metal: "Gold or copper",
    finger: "Ring finger",
    day: "Tuesday",
    image: "/images/coral.jpg?v=ivory",
    excerpt: "An organic gem of Mars — dense, warm, and unmistakably alive.",
    description:
      "Precious coral is the calcium skeleton of marine polyps, polished to a waxy cabochon. The finest Italian and Pacific reds hold a deep oxblood that does not chalk in sunlight. We do not sell dyed bamboo coral as Moonga.",
    tradition:
      "Moonga is Mangala’s gem. It is traditionally chosen for courage, blood, and decisive action, and worn on Tuesday in gold or copper.",
    origin: "Mediterranean, Pacific, Japanese waters",
    note: "Coral is organic and relatively soft. Remove it before gym work, and never soak it in acids or bleach.",
  },
  {
    slug: "emerald",
    name: "Emerald",
    sanskrit: "Panna",
    planet: "Mercury",
    planetSanskrit: "Budha",
    group: "navratna",
    color: "Vivid garden green",
    hardness: "7.5–8 Mohs",
    metal: "Gold",
    finger: "Little finger",
    day: "Wednesday",
    image: "/images/emerald.jpg?v=ivory",
    excerpt: "Mercury’s garden — the green that jewellers measure all others against.",
    description:
      "Emerald is beryl coloured by chromium and vanadium. Garden inclusions are expected; they are the stone’s handwriting, not a flaw to hide. We prefer stones with strong colour first, then clarity, and we always declare oil or resin filling.",
    tradition:
      "Panna is Budha’s stone: speech, trade, intellect. Classical wearing is on the little finger, in gold, on a Wednesday.",
    origin: "Colombia, Zambia, Brazil, Afghanistan",
    note: "Emeralds are often oiled. Ask us for the treatment grade. Avoid sudden heat and ultrasonic baths.",
  },
  {
    slug: "yellow-sapphire",
    name: "Yellow Sapphire",
    sanskrit: "Pukhraj",
    planet: "Jupiter",
    planetSanskrit: "Guru",
    group: "navratna",
    color: "Honey to lemon gold",
    hardness: "9 Mohs",
    metal: "Gold",
    finger: "Index finger",
    day: "Thursday",
    image: "/images/yellow-sapphire.jpg?v=ivory",
    excerpt: "Guru’s stone — a yellow sapphire of weight, fire, and unforced colour.",
    description:
      "Yellow sapphire is corundum. The best stones are a saturated honey-gold without brown, with sharp brilliance. Bangkok and Sri Lankan material dominate the market; Kashmir and Burma yellows are rare. We sell natural stones with laboratory reports on request.",
    tradition:
      "Pukhraj is Guru’s gem in the Navratna — wisdom, teachers, and expansion. It is traditionally worn on the index finger in gold, on a Thursday.",
    origin: "Sri Lanka, Thailand, Madagascar, Australia",
    note: "Heat treatment is common and stable. Unheated stones carry a premium and should be reported as such.",
  },
  {
    slug: "diamond",
    name: "Diamond",
    sanskrit: "Heera",
    planet: "Venus",
    planetSanskrit: "Shukra",
    group: "navratna",
    color: "Colourless to faint cape",
    hardness: "10 Mohs",
    metal: "Platinum, white or yellow gold",
    finger: "Middle finger",
    day: "Friday",
    image: "/images/diamond.jpg?v=ivory",
    excerpt: "Venus in crystal form — light broken into fire, life, and scintillation.",
    description:
      "We offer natural diamonds graded for cut, colour, clarity and carat, and we say so when a stone is lab-grown. For Vedic use, a white diamond of clean make is preferred over size. Polki and uncut diamonds are available for traditional kundan work.",
    tradition:
      "Heera is Shukra’s stone: beauty, partnership, the arts. Friday is the classical day to first wear it.",
    origin: "India (historical), Botswana, Russia, Canada, Australia",
    note: "Always ask whether a diamond is natural or laboratory-grown. Both have a place; they are not the same thing.",
  },
  {
    slug: "blue-sapphire",
    name: "Blue Sapphire",
    sanskrit: "Neelam",
    planet: "Saturn",
    planetSanskrit: "Shani",
    group: "navratna",
    color: "Royal to cornflower blue",
    hardness: "9 Mohs",
    metal: "Silver or white gold",
    finger: "Middle finger",
    day: "Saturday",
    image: "/images/blue-sapphire.jpg?v=ivory",
    excerpt: "Saturn’s blue — velvety, serious, and never to be chosen in a hurry.",
    description:
      "Blue sapphire is corundum coloured by iron and titanium. Kashmir, Burma and Ceylon set the language of quality; Madagascar and Australia supply much of what is worn today. Colour should be a true blue, not inky, with a window of light through the crown.",
    tradition:
      "Neelam is Shani’s gem and is treated with care in the classical system. Many clients trial a stone before a full setting. Saturday is the traditional day.",
    origin: "Kashmir (historic), Sri Lanka, Madagascar, Myanmar, Australia",
    note: "We will not pressure you into a blue sapphire. If the stone is right, it remains right after a trial.",
  },
  {
    slug: "hessonite",
    name: "Hessonite",
    sanskrit: "Gomed",
    planet: "Rahu",
    planetSanskrit: "Rahu",
    group: "navratna",
    color: "Cinnamon honey",
    hardness: "7–7.5 Mohs",
    metal: "Gold or silver",
    finger: "Middle finger",
    day: "Saturday",
    image: "/images/hessonite.jpg?v=ivory",
    excerpt: "Rahu’s cinnamon garnet — warm, slightly sleepy in lustre, never glassy.",
    description:
      "Hessonite is a variety of grossular garnet. Fine Gomed is a transparent cinnamon with a characteristic sleepy, treacly lustre — not the harsh sparkle of citrine. Sri Lankan stones lead the market. We reject glass and zircon sold as hessonite.",
    tradition:
      "Gomed is Rahu’s gem in the Navratna. It is chosen after a reading, traditionally worn on a Saturday.",
    origin: "Sri Lanka, India, Brazil, Madagascar",
    note: "If a ‘Gomed’ sparkles like a diamond, it is probably not hessonite. Ask to see it beside a known stone.",
  },
  {
    slug: "cats-eye",
    name: "Cat’s Eye",
    sanskrit: "Lehsunia",
    planet: "Ketu",
    planetSanskrit: "Ketu",
    group: "navratna",
    color: "Honey green with a silver band",
    hardness: "8.5 Mohs",
    metal: "Gold",
    finger: "Little finger",
    day: "Thursday",
    image: "/images/cats-eye.jpg?v=ivory",
    excerpt: "Ketu’s chatoyant chrysoberyl — one living band of light across the dome.",
    description:
      "True Lehsunia is chrysoberyl cat’s eye, not quartz. The sharp silvery band should open and close as the stone is turned, and sit centred on a honey or green-honey body. Cabochons are cut to hold the eye; faceting destroys it.",
    tradition:
      "Lehsunia is Ketu’s stone. It is a specialist gem, traditionally worn after counsel, often on a Thursday.",
    origin: "Sri Lanka, Brazil, India, Madagascar",
    note: "Quartz cat’s eye is inexpensive and useful in costume work. It is not chrysoberyl. We label both honestly.",
  },
  {
    slug: "turquoise",
    name: "Turquoise",
    sanskrit: "Firoza",
    planet: "Jupiter / Venus",
    planetSanskrit: "Firoza",
    group: "semi",
    color: "Sky blue with matrix",
    hardness: "5–6 Mohs",
    metal: "Silver",
    finger: "Index or ring finger",
    day: "Thursday",
    image: "/images/turquoise.jpg?v=ivory",
    excerpt: "The old sky-stone of Persia and Tibet — opaque, veined, and calm.",
    description:
      "Turquoise is a hydrated copper-aluminium phosphate. Nishapur Persian material, with even robin-egg colour and tight spiderweb, remains the reference. We sell natural and stabilised stones and say which is which.",
    tradition:
      "Firoza has a long life in Indian, Persian and Himalayan jewellery. It is worn for protection on the road and for a quiet mind, usually in silver.",
    origin: "Iran, Tibet, Egypt (historic), Arizona, China",
    note: "Turquoise drinks oil, perfume and soap. Put it on after you dress, not before.",
  },
  {
    slug: "amethyst",
    name: "Amethyst",
    sanskrit: "Jamuniya",
    planet: "Saturn / Jupiter",
    planetSanskrit: "Shani / Guru",
    group: "semi",
    color: "Deep violet",
    hardness: "7 Mohs",
    metal: "Silver or gold",
    finger: "Middle finger",
    day: "Saturday",
    image: "/images/amethyst.jpg?v=ivory",
    excerpt: "A purple quartz of cathedral colour — the accessible cousin of sapphire.",
    description:
      "Amethyst is quartz coloured by iron. The most loved stones are a saturated royal violet with flashes of red, not a pale lilac. Brazilian and Zambian material can be excellent; Siberian colour is the old standard.",
    tradition:
      "Jamuniya is sometimes worn as a gentler stand-in where blue sapphire is not advised. It is a stone of temperance in both European and Indian cabinets.",
    origin: "Brazil, Zambia, Uruguay, India",
    note: "Strong heat can turn amethyst to citrine. Keep it out of prolonged, fierce sun.",
  },
  {
    slug: "citrine",
    name: "Citrine",
    sanskrit: "Sunela",
    planet: "Jupiter",
    planetSanskrit: "Guru",
    group: "semi",
    color: "Madeira gold",
    hardness: "7 Mohs",
    metal: "Gold",
    finger: "Index finger",
    day: "Thursday",
    image: "/images/citrine.jpg?v=ivory",
    excerpt: "A golden quartz — warm, generous, and often confused with sapphire.",
    description:
      "Natural citrine is uncommon; much of the market is heated amethyst. We disclose treatment. Madeira and paler lemon colours both have their place. It is not yellow sapphire, and we will not sell it as such.",
    tradition:
      "Sunela is sometimes chosen as a more approachable Jupiter stone when Pukhraj is beyond reach. The two are different minerals and should be named honestly.",
    origin: "Brazil, Madagascar, Spain, India",
    note: "If a ‘yellow sapphire’ is priced like quartz, it is quartz. Ask for a refractive test.",
  },
  {
    slug: "garnet",
    name: "Garnet",
    sanskrit: "Gomedak / Tamra",
    planet: "Mars / Sun",
    planetSanskrit: "Mangala",
    group: "semi",
    color: "Wine red",
    hardness: "6.5–7.5 Mohs",
    metal: "Gold",
    finger: "Ring finger",
    day: "Tuesday",
    image: "/images/garnet.jpg?v=ivory",
    excerpt: "A wine-dark silicate — fire without ruby’s price, and a character of its own.",
    description:
      "Garnet is a family, not a single stone: pyrope, almandine, spessartine, tsavorite, demantoid. The deep reds are the ones most asked for in our Solapur cabinet. They take a bright polish and wear well in daily gold jewellery.",
    tradition:
      "Red garnet is an old companion of Mars-aligned jewellery in India, and a favoured January birthstone in the Western calendar.",
    origin: "India, Tanzania, Sri Lanka, Russia",
    note: "Tsavorite and demantoid are garnets too — green, rare, and priced accordingly.",
  },
  {
    slug: "opal",
    name: "Opal",
    sanskrit: "Upala",
    planet: "Venus",
    planetSanskrit: "Shukra",
    group: "semi",
    color: "Play-of-colour on white or black",
    hardness: "5.5–6.5 Mohs",
    metal: "Gold or silver",
    finger: "Middle finger",
    day: "Friday",
    image: "/images/opal.jpg?v=ivory",
    excerpt: "A hydrated silica that carries a weather of colour inside it.",
    description:
      "Precious opal shows play-of-colour from microscopic silica spheres. Australian white and black opals lead the tradition; Ethiopian material is more porous. We prefer solid stones over doublets and triplets for rings.",
    tradition:
      "Opal appears in Indian texts as Upala, a precious stone of beauty and Venusian pleasure. It is also October’s birthstone.",
    origin: "Australia, Ethiopia, Mexico",
    note: "Opal contains water. Avoid ultrasonic cleaners, sudden dryness, and hard knocks.",
  },
  {
    slug: "moonstone",
    name: "Moonstone",
    sanskrit: "Chandrakant",
    planet: "Moon",
    planetSanskrit: "Chandra",
    group: "semi",
    color: "Adularescent blue on white",
    hardness: "6–6.5 Mohs",
    metal: "Silver",
    finger: "Little finger",
    day: "Monday",
    image: "/images/moonstone.jpg?v=ivory",
    excerpt: "Feldspar with a floating blue sheen — the Moon, seen through water.",
    description:
      "The finest moonstone is a colourless body with a floating blue adularescence, usually from Sri Lanka. Rainbow moonstone (labradorite) is a cousin with a different look. We keep both, labelled as such.",
    tradition:
      "Chandrakant, the beloved of the Moon, is an old Indian name for a stone that brightens with lunar light. It is worn for calm and for the mind’s ease.",
    origin: "Sri Lanka, India, Madagascar, Myanmar",
    note: "Moonstone has two cleavage directions. Protective settings are kinder than thin bezel-less rings.",
  },
  {
    slug: "peridot",
    name: "Peridot",
    sanskrit: "Putika",
    planet: "Mercury / Sun",
    planetSanskrit: "Budha",
    group: "semi",
    color: "Lime olive",
    hardness: "6.5–7 Mohs",
    metal: "Gold",
    finger: "Little finger",
    day: "Wednesday",
    image: "/images/peridot.jpg?v=ivory",
    excerpt: "A volcanic green olivine — the evening emerald of older cabinets.",
    description:
      "Peridot is gem olivine, born in lava and, rarely, in meteorites. The best stones are a pure lime without too much brown, usually from Pakistan’s Kaghan valley or Arizona. It is August’s birthstone.",
    tradition:
      "Older jewellers called fine peridot evening emerald. In some Indian lists it is worn as a lighter Mercury stone.",
    origin: "Pakistan, Arizona, Myanmar, Egypt (historic)",
    note: "Peridot can look sleepy under cool LEDs. Judge it in mixed daylight.",
  },
];

export const NAVRATNA = GEMSTONES.filter((g) => g.group === "navratna");

export function getGemstone(slug: string) {
  return GEMSTONES.find((g) => g.slug === slug);
}

export const RASHI_GUIDE: { rashi: string; english: string; slug: string }[] = [
  { rashi: "Mesha", english: "Aries", slug: "red-coral" },
  { rashi: "Vrishabha", english: "Taurus", slug: "diamond" },
  { rashi: "Mithuna", english: "Gemini", slug: "emerald" },
  { rashi: "Karka", english: "Cancer", slug: "pearl" },
  { rashi: "Simha", english: "Leo", slug: "ruby" },
  { rashi: "Kanya", english: "Virgo", slug: "emerald" },
  { rashi: "Tula", english: "Libra", slug: "diamond" },
  { rashi: "Vrischika", english: "Scorpio", slug: "red-coral" },
  { rashi: "Dhanu", english: "Sagittarius", slug: "yellow-sapphire" },
  { rashi: "Makara", english: "Capricorn", slug: "blue-sapphire" },
  { rashi: "Kumbha", english: "Aquarius", slug: "blue-sapphire" },
  { rashi: "Meena", english: "Pisces", slug: "yellow-sapphire" },
];

export const WEEKDAY_GUIDE: { day: string; slug: string }[] = [
  { day: "Sunday", slug: "ruby" },
  { day: "Monday", slug: "pearl" },
  { day: "Tuesday", slug: "red-coral" },
  { day: "Wednesday", slug: "emerald" },
  { day: "Thursday", slug: "yellow-sapphire" },
  { day: "Friday", slug: "diamond" },
  { day: "Saturday", slug: "blue-sapphire" },
];
