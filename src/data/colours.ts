export type ColourNote = {
  id: string;
  name: string;
  hue: string;
  onHue: string;
  felt: string;
  graha: string;
  stone: string;
  slug: string;
  body: string;
  room: string;
  caution: string;
};

/** Nine cabinet colours — felt in a room, named in the old books. Not a diagnosis. */
export const COLOUR_NOTES: ColourNote[] = [
  {
    id: "red",
    name: "Red",
    hue: "#8c2a32",
    onHue: "#f6f1e8",
    felt: "Warmth, being seen, a pulse that does not hide.",
    graha: "Surya — the Sun",
    stone: "Ruby (Manikya)",
    slug: "ruby",
    body: "Red is the colour the eye meets first. In a shop it is the colour of the king in the tray; on a hand it reads as heat and rank. Psychology books call it arousal and appetite. Jyotisha gives it to Surya — honour, the father, the will to stand in daylight. A good ruby does not shout under a spotlight and die in a kitchen. If the red lives in north light, it will live at home.",
    room: "A grain of red on ivory is enough. A wall of it is a bazaar.",
    caution: "Red is not a tonic and it is not for every chart. Vitality is a feeling, not a prescription.",
  },
  {
    id: "white",
    name: "White",
    hue: "#f3eee4",
    onHue: "#1a241c",
    felt: "Quiet, milk, a mind that can sleep.",
    graha: "Chandra — the Moon",
    stone: "Pearl (Moti)",
    slug: "pearl",
    body: "White and cream cool a room. They ask less of the eye, which is why a pearl sits well on silver and why an ivory field lets a stone speak. Western colour talk names white as cleanliness and calm; the old books give pearl to Chandra — mind, mother, the tides of sleep. Chalky white is a dead pearl. Living white has orient: a soft inner light, not bleach.",
    room: "Ivory behind a gem is a tray. Stark gallery white is a hospital. The house prefers the first.",
    caution: "White does not settle an illness. It may settle a dressing table.",
  },
  {
    id: "coral",
    name: "Coral",
    hue: "#c45a3c",
    onHue: "#faf4ee",
    felt: "Heat to begin, and to finish, without theatre.",
    graha: "Mangala — Mars",
    stone: "Red coral (Moonga)",
    slug: "red-coral",
    body: "Coral sits between red and flesh — oxblood, salmon, the colour of effort. It warms a timid palette the way Mars is asked to warm a timid chart. Psychology treats orange-red as energy and appetite; the cabinet treats Moonga as courage and land, never as dyed bamboo. If it chalks in the sun, it is not the stone.",
    room: "A coral cabochon on gold is a spark. A coral wall is a warning.",
    caution: "Coral is not a medicine for blood. We will not sell pink sponge as Moonga.",
  },
  {
    id: "green",
    name: "Green",
    hue: "#3e7350",
    onHue: "#f8f4e8",
    felt: "Growth, speech, a garden that still works as a shop.",
    graha: "Budha — Mercury",
    stone: "Emerald (Panna)",
    slug: "emerald",
    body: "Green is the colour of a well-kept tray and of Mercury’s garden. It rests the eye after gold and red; it is why a jeweller’s cloth is often dark green, and why this shop can dress in ivory and sage without looking like a clinic. Colour psychology names green as balance and recovery. Jyotisha gives Panna to Budha — speech, trade, the intellect. Garden inclusions are the stone’s handwriting, not a flaw.",
    room: "Sage on ivory is a conversation. Neon mint is a hoarding. The house uses the first.",
    caution: "Emerald is often oiled — that belongs on the bill. Green is not a cure for hurry.",
  },
  {
    id: "yellow",
    name: "Yellow",
    hue: "#c4a12a",
    onHue: "#1a241c",
    felt: "Warm judgement, teachers, a wealth that does not arrive as a trick.",
    graha: "Guru — Jupiter",
    stone: "Yellow sapphire (Pukhraj)",
    slug: "yellow-sapphire",
    body: "Yellow and honey-gold expand a room the way Jupiter is asked to expand a life. Too much is a bazaar lamp; a measured honey is wisdom. Psychology links yellow to attention and optimism. The old books give Pukhraj to Guru — dharma, children, honest growth. Citrine is quartz. If a ‘yellow sapphire’ is priced like quartz, it is quartz.",
    room: "A honey stone on gold is daylight. A lemon wall is a warning sign.",
    caution: "Pukhraj does not guarantee a wedding date. It is a colour of patience, not a spell.",
  },
  {
    id: "clear",
    name: "Clear",
    hue: "#e8e4dc",
    onHue: "#1a241c",
    felt: "Light, partnership, beauty that does not need to explain itself.",
    graha: "Shukra — Venus",
    stone: "Diamond (Heera)",
    slug: "diamond",
    body: "A colourless stone is not empty. It breaks light into fire. Psychology treats white-clear as truth and polish; Venus claims diamond for beauty, arts, and the pair. Lab-grown diamonds have a place in jewellery — they are not the same mineral story, and we name them. Polki and uncut stones are at home in kundan, where fire is felt rather than graded.",
    room: "Clear on ivory is a quiet spark. Clear on chrome is a showroom.",
    caution: "Always ask whether a diamond is natural or laboratory-grown. Both have a place; they are not the same thing.",
  },
  {
    id: "blue",
    name: "Blue",
    hue: "#1e3f73",
    onHue: "#eef1f6",
    felt: "Depth, delay, a seriousness that will not be rushed.",
    graha: "Shani — Saturn",
    stone: "Blue sapphire (Neelam)",
    slug: "blue-sapphire",
    body: "Blue recedes. It makes a room feel larger and a decision feel slower — which is why Saturn’s stone is never sold in a hurry here. Colour talk names blue as trust and calm; the classical cabinet treats Neelam as a weight. A trial is ordinary. Inky blue that only lives under a lamp is not the velvet of a good Ceylon or Madagascar stone.",
    room: "A blue cabochon on silver is night. A blue-lit shop is a phone screen.",
    caution: "Blue sapphire is not sold in a hurry. If a reader has asked you to wait, we wait.",
  },
  {
    id: "cinnamon",
    name: "Cinnamon",
    hue: "#a35a28",
    onHue: "#f6efe4",
    felt: "Appetite, the unusual, a warmth that is a little sleepy.",
    graha: "Rahu",
    stone: "Hessonite (Gomed)",
    slug: "hessonite",
    body: "Cinnamon and honey-brown sit close to wood, spice, and old gold. They feel like appetite without the shout of red. Psychology puts brown with comfort and earth; the Navratna gives this sleepy treacle to Rahu. Fine Gomed does not sparkle like citrine. If a ‘Gomed’ flashes like a diamond, it is probably not hessonite.",
    room: "Cinnamon on gold is a cabinet. Cinnamon on orange is a sweet shop.",
    caution: "Gomed is chosen after a reading. Colour here is a starting point, not a chart.",
  },
  {
    id: "honey",
    name: "Honey-eye",
    hue: "#7a6a32",
    onHue: "#f4efe0",
    felt: "A single band of attention. Looking away, then looking true.",
    graha: "Ketu",
    stone: "Cat’s eye (Lehsunia)",
    slug: "cats-eye",
    body: "This is not a flat colour. It is a living line of light across a honey or green-honey dome. Psychology has little to say about chatoyancy; the old books give it to Ketu — detachment, the cut that reveals. Quartz cat’s eye is inexpensive and honest in costume work. It is not chrysoberyl. We label both.",
    room: "One band, well cut, is enough. A tray of fake eyes is a fair stall.",
    caution: "Lehsunia is a specialist gem. Colour and the eye must both be right, and a reader should have been asked.",
  },
];

export function getColourNote(id: string) {
  return COLOUR_NOTES.find((c) => c.id === id) ?? COLOUR_NOTES[0];
}

export const COLOUR_TRAY: string[][] = [
  ["green", "white", "yellow"],
  ["clear", "red", "coral"],
  ["blue", "cinnamon", "honey"],
];
