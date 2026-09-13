export type Review = {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  source: "store" | "guest";
};

export const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Anjali Deshmukh",
    city: "Solapur",
    rating: 5,
    date: "March 2026",
    title: "The stone I was shown matched the report",
    body: "I came for a yellow sapphire after two shops in the city showed me citrine. Here they put both stones on the table and explained the difference without making me feel foolish. The Pukhraj I took has a laboratory note, and it still looks the same in my kitchen light.",
    source: "store",
  },
  {
    id: "r2",
    name: "Rafiq Shaikh",
    city: "Akkalkot",
    rating: 5,
    date: "January 2026",
    title: "Quiet shop, serious cabinet",
    body: "Good atmosphere and a real variety — gold, silver, and the Navratna tray. They did not rush the sale. I bought a coral and a small Ganesha. Both were packed as if they were going a long way.",
    source: "store",
  },
  {
    id: "r3",
    name: "Poonam K.",
    city: "Solapur",
    rating: 5,
    date: "November 2025",
    title: "They keep 1 gram gold for offerings",
    body: "Needed a one-gram gold piece for a vow. Many places send you away. Sadhguru Gems had it, billed it cleanly, and the weight was exact on their scale in front of me.",
    source: "store",
  },
  {
    id: "r4",
    name: "Suresh Patil",
    city: "Barshi",
    rating: 5,
    date: "August 2025",
    title: "Copper bottle that is actually copper",
    body: "I have been sold coated steel before. This bottle is heavy, the seam is honest, and they told me how to clean it. Water tastes as it should after a night in the metal.",
    source: "store",
  },
  {
    id: "r5",
    name: "Meera Iyer",
    city: "Pune",
    rating: 5,
    date: "June 2025",
    title: "Came from Pune for a Neelam trial",
    body: "I was nervous about blue sapphire. They let me trial a small stone before committing to a ring. No drama, no fear-selling. When I returned, the same person remembered the conversation.",
    source: "store",
  },
  {
    id: "r6",
    name: "Vikas Jadhav",
    city: "Hotgi",
    rating: 4,
    date: "April 2025",
    title: "Fair on gold making charges",
    body: "Making charges were explained before the piece went to the bench. The kundan work on my wife’s bangles is tight. I would have liked a slightly faster turnaround during Diwali week — that is the only mark down.",
    source: "store",
  },
  {
    id: "r7",
    name: "Fatima Inamdar",
    city: "Solapur",
    rating: 5,
    date: "February 2025",
    title: "They named the treatment on my emerald",
    body: "The emerald has oil, and they wrote that on the bill. I have never had a jeweller volunteer that. The colour is a real green, not a window of glass.",
    source: "store",
  },
  {
    id: "r8",
    name: "Ganesh Kulkarni",
    city: "Pandharpur",
    rating: 5,
    date: "December 2024",
    title: "Brass lamps that ring when you tap them",
    body: "Bought two deepams and a bell for the wada. The brass is temple-grade, not the thin festival-market kind. They heat evenly and the bell has a long note.",
    source: "store",
  },
];

export const STORAGE_KEY = "sgj-guest-reviews";
