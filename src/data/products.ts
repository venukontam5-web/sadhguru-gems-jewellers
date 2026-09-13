export type MetalProduct = {
  slug: string;
  name: string;
  category: "brass" | "copper";
  image: string;
  priceNote: string;
  excerpt: string;
  description: string;
  care: string;
};

export const BRASS_ITEMS: MetalProduct[] = [
  {
    slug: "deepam-lamp",
    name: "Multi-wick Deepam",
    category: "brass",
    image: "/images/brass-lamp.jpg?v=ivory",
    priceNote: "Made to order in three sizes",
    excerpt: "A temple lamp with a steady, generous flame.",
    description:
      "Cast and hand-finished brass deepam for daily puja and festival lighting. The reservoir holds oil for a long evening, and the wicks sit in a stable crown so the flame does not wander.",
    care: "Wash with warm water and a drop of lemon; dry at once. A thin film of coconut oil keeps the gold tone.",
  },
  {
    slug: "ganesha-murti",
    name: "Ganesha Murti",
    category: "brass",
    image: "/images/brass-collection.jpg?v=ivory",
    priceNote: "Several heights from 4 to 18 inches",
    excerpt: "A seated Ganesha in temple brass, for the threshold.",
    description:
      "Lost-wax and sand-cast figures, chased by hand so the trunk, jewellery and vahana read clearly. Suitable for a home shrine or a shop doorway.",
    care: "Dust with a dry cloth. Avoid abrasive powders that cut the patina.",
  },
  {
    slug: "kalash",
    name: "Kalash & Coconut Set",
    category: "brass",
    image: "/images/brass-collection.jpg?v=ivory",
    priceNote: "Sold as a complete puja set",
    excerpt: "The vessel of abundance, with matching lid and stand.",
    description:
      "A traditional kalash in heavy-gauge brass, proportioned to hold water, mango leaves and coconut for sankalpa and griha pravesh.",
    care: "Rinse after each ritual. Do not leave standing water overnight.",
  },
  {
    slug: "urli",
    name: "Urli Bowl",
    category: "brass",
    image: "/images/brass-collection.jpg?v=ivory",
    priceNote: "Diameter from 8 to 24 inches",
    excerpt: "A wide bowl for flowers, water, and a quiet table.",
    description:
      "Spun and hammered urli bowls, used in courtyards and foyers. Fill with water and loose flowers, or with oil and floating wicks for the evening.",
    care: "Dry fully between uses to avoid water spots. A soft brass polish twice a year is enough.",
  },
  {
    slug: "temple-bells",
    name: "Temple Bells",
    category: "brass",
    image: "/images/brass-lamp.jpg?v=ivory",
    priceNote: "Tuned by ear, not by machine",
    excerpt: "A clear, lingering note for the start of puja.",
    description:
      "Hand-cast bells with a long sustain. Each piece is struck and listened to before it leaves the workshop — thin, tinny bells are melted back.",
    care: "Keep the clapper free of thread and dust. Do not lacquer if you want the living sound.",
  },
  {
    slug: "pooja-thali",
    name: "Pooja Thali",
    category: "brass",
    image: "/images/brass-collection.jpg?v=ivory",
    priceNote: "Plain, engraved, or with nested bowls",
    excerpt: "The daily tray — diya, akshata, kumkum, and flower.",
    description:
      "A balanced thali with a low rim so nothing rolls off during aarti. Nested katoris for kumkum, turmeric and rice can be added.",
    care: "Hand wash. The inner bowls can go in warm soapy water; the tray prefers a wipe.",
  },
];

export const COPPER_ITEMS: MetalProduct[] = [
  {
    slug: "water-bottle",
    name: "Ayurvedic Water Bottle",
    category: "copper",
    image: "/images/copper-bottle.jpg?v=ivory",
    priceNote: "700 ml and 1 litre",
    excerpt: "Store water overnight; drink it in the morning.",
    description:
      "Seamless and hammered copper bottles made for daily drinking water. The interior is unlined so the metal can do what Ayurveda asks of it. Caps are leak-tested.",
    care: "Fill with water and a spoon of lemon juice or tamarind once a week, rest, rinse. Never the dishwasher.",
  },
  {
    slug: "tumbler-set",
    name: "Tumbler & Lota",
    category: "copper",
    image: "/images/copper-bottle.jpg?v=ivory",
    priceNote: "Sold as a pair or a set of four",
    excerpt: "The old way to serve water at the table.",
    description:
      "Hand-beaten tumblers with a matching lota. The hammer marks are not decoration — they work-harden the sheet so the vessel keeps its round.",
    care: "Wash and dry at once. A dulling of the outside is honest; polish only if you prefer a high shine.",
  },
  {
    slug: "thali",
    name: "Copper Thali",
    category: "copper",
    image: "/images/copper-collection.jpg?v=ivory",
    priceNote: "Dinner and puja sizes",
    excerpt: "A warm plate for serving, offering, and daily meals.",
    description:
      "Broad copper thalis with a rolled rim. Used for naivedya, and by those who keep a copper plate for meals as part of a household practice.",
    care: "Acidic foods should not sit for hours. Serve, eat, wash.",
  },
  {
    slug: "handi",
    name: "Cooking Handi",
    category: "copper",
    image: "/images/copper-collection.jpg?v=ivory",
    priceNote: "Tin-lined interiors available",
    excerpt: "A pot that holds heat the way a good kitchen needs.",
    description:
      "Heavy copper handis for slow cooking. We offer tin-lined interiors for everyday food, and unlined pieces for water and ritual use.",
    care: "If tin-lined, do not scour the inside. Re-tinning is a service we can arrange.",
  },
  {
    slug: "yantra",
    name: "Copper Yantra",
    category: "copper",
    image: "/images/copper-collection.jpg?v=ivory",
    priceNote: "Sri Yantra and graha plates",
    excerpt: "Engraved plates for the shrine, not for the wall as décor.",
    description:
      "Etched and hand-finished copper yantras. Lines are checked for continuity — a broken bindu is not a bargain, it is a mistake.",
    care: "Keep dry. A drop of ghee on the plate is a ritual choice, not a polish.",
  },
  {
    slug: "glass-set",
    name: "Drinking Glasses",
    category: "copper",
    image: "/images/copper-collection.jpg?v=ivory",
    priceNote: "Set of two or six",
    excerpt: "Small beakers for the morning copper water.",
    description:
      "Short copper glasses that sit steadily in the hand. A practical companion to the bottle, and a gift that is used rather than displayed.",
    care: "Rinse after each use. Do not store sour liquids.",
  },
];

export function getMetalProduct(category: "brass" | "copper", slug: string) {
  const list = category === "brass" ? BRASS_ITEMS : COPPER_ITEMS;
  return list.find((p) => p.slug === slug);
}
