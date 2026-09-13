export type NavratnaLore = {
  slug: string;
  house: string;
  benefits: string[];
  body: string;
  caution: string;
};

/** 3×3 tray as commonly set in a North Indian Navratna, Sun at the centre. */
export const NAVRATNA_TRAY: string[][] = [
  ["emerald", "pearl", "yellow-sapphire"],
  ["diamond", "ruby", "red-coral"],
  ["blue-sapphire", "hessonite", "cats-eye"],
];

export const NAVRATNA_LORE: Record<string, NavratnaLore> = {
  ruby: {
    slug: "ruby",
    house: "Surya — honour, vitality, the father",
    benefits: [
      "A clear sense of purpose and the courage to be seen",
      "Name, rank, and the warmth of a well-run household",
      "Stamina for long work — the stone of the king in the tray",
    ],
    body: "Classical texts give ruby to the Sun. It is worn for dignity, not for volume. A good Manikya is judged in daylight: if the red dies under a kitchen lamp, it will not carry the graha it is named for. In a full Navratna it sits at the centre, because the other eight turn around Surya.",
    caution:
      "Ruby is a strong stone. It is not a tonic, and it is not for every chart. If a reader has asked you to wait, we wait.",
  },
  pearl: {
    slug: "pearl",
    house: "Chandra — mind, sleep, the mother",
    benefits: [
      "A quieter mind and a kinder night’s sleep",
      "Ease with water, travel, and the people one belongs to",
      "Composure when the month is loud",
    ],
    body: "Pearl is the Moon’s gem — grown, not cut. Jyotisha links it to the mind’s tides, to milk, to the mother, and to the body’s cooling. A tight-skinned pearl with living orient is preferred over a large, chalky one. It is traditionally set in silver.",
    caution:
      "Pearl is organic and soft. Perfume, sweat, and ultrasonic cleaners undo it. It will not settle an illness; it may settle a dressing table.",
  },
  "red-coral": {
    slug: "red-coral",
    house: "Mangala — courage, land, decisive action",
    benefits: [
      "Energy to begin, and to finish, without theatre",
      "A traditional companion for land, siblings, and the blood",
      "Warmth in a chart that has gone cold or timid",
    ],
    body: "Moonga is Mars. The old cabinet wanted an oxblood cabochon that does not chalk in the sun — not dyed bamboo. It is worn for courage and for the body’s heat, usually in gold or copper, often on a Tuesday.",
    caution:
      "Coral is relatively soft. It is not a medicine for blood. We will not sell pink-dyed sponge as Moonga.",
  },
  emerald: {
    slug: "emerald",
    house: "Budha — speech, trade, the intellect",
    benefits: [
      "Clearer speech, writing, and the work of the market",
      "A traditional aid to study, accounts, and nervous hurry",
      "Wit without cruelty — Mercury’s better face",
    ],
    body: "Panna is Mercury’s garden. Garden inclusions are expected; they are the stone’s handwriting. Jyotisha gives it to merchants, students, and anyone whose living is made with words. Classical wearing is the little finger, in gold, on a Wednesday.",
    caution:
      "Most emeralds are oiled. That is ordinary, and it should be on the bill. Emerald is not a cure for anxiety.",
  },
  "yellow-sapphire": {
    slug: "yellow-sapphire",
    house: "Guru — wisdom, teachers, expansion",
    benefits: [
      "Favour of teachers, children, and well-timed growth",
      "A traditional stone for marriage, dharma, and honest wealth",
      "Judgement that is slow enough to be kind",
    ],
    body: "Pukhraj is Jupiter’s gem — honey-gold corundum, not citrine. The old books give it to the guru, to children, and to the kind of prosperity that does not arrive as a trick. It is worn on the index finger in gold, on a Thursday, after the stone has been looked at in north light.",
    caution:
      "If a ‘yellow sapphire’ is priced like quartz, it is quartz. Pukhraj does not guarantee a wedding date.",
  },
  diamond: {
    slug: "diamond",
    house: "Shukra — beauty, partnership, the arts",
    benefits: [
      "Harmony in love and in the making of beautiful things",
      "A traditional blessing on speech that persuades without force",
      "Pleasure that does not sour the next morning",
    ],
    body: "Heera is Venus. For Vedic use a white diamond of clean make is preferred over carat weight; polki and uncut stones are at home in kundan. Friday is the classical day to first wear it. Laboratory-grown diamonds have a place in jewellery — they are not the same mineral story, and we name them.",
    caution:
      "Ask whether the stone is natural or grown. Venus is not a shortcut through a difficult marriage.",
  },
  "blue-sapphire": {
    slug: "blue-sapphire",
    house: "Shani — discipline, time, a long life well-structured",
    benefits: [
      "Patience, craft, and the dignity of delayed reward",
      "A traditional companion through Saturn periods, if the stone agrees",
      "Order where a life has been all weather and no roof",
    ],
    body: "Neelam is Saturn’s blue — velvety, serious, never chosen in a hurry. Many clients trial a small stone before a ring. Colour should be a true blue with a window of light, not an ink that swallows the room. Saturday is the traditional day.",
    caution:
      "This house will not press a blue sapphire on a first visit. If a reader has forbidden it, we keep it in the tray.",
  },
  hessonite: {
    slug: "hessonite",
    house: "Rahu — ambition, foreign roads, untying confusion",
    benefits: [
      "A clearer path through fog, rumour, and sudden change",
      "Traditional support for work across borders and screens",
      "Ambition that can be named, and therefore steered",
    ],
    body: "Gomed is Rahu’s cinnamon garnet. Fine stones look a little sleepy — treacle, not glass fire. It is chosen after a reading, not from a catalogue photograph, and traditionally worn on a Saturday.",
    caution:
      "If a ‘Gomed’ sparkles like a diamond, it is probably not hessonite. Rahu is not a lottery ticket.",
  },
  "cats-eye": {
    slug: "cats-eye",
    house: "Ketu — insight, hidden trouble, the inner road",
    benefits: [
      "A traditional guard against what one cannot yet see",
      "Sharper intuition, and less appetite for false certainty",
      "Company in periods of withdrawal, study, or grief",
    ],
    body: "Lehsunia is Ketu’s chatoyant chrysoberyl — one living band of light across the dome. Quartz cat’s eye is a different, cheaper stone; we label both. Cabochons are cut to hold the eye. It is a specialist gem, often worn on a Thursday after counsel.",
    caution:
      "Ketu stones are not sold as a shield against every accident. A quartz eye is not chrysoberyl.",
  },
};

export function getNavratnaLore(slug: string) {
  return NAVRATNA_LORE[slug];
}
