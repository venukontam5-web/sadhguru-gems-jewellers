export const PRODUCT_CATEGORIES = [
  "Gemstones",
  "Crystal",
  "Mala",
  "Pearls-Beads",
  "Brass",
  "Copper",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ShopProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  priceInr: number;
  compareAt: number | null;
  stock: number;
  imagePath: string;
  images?: string[];
  badge: string;
  active: boolean;
  description: string;
  sku?: string;
  unit?: string;
  weightG?: number;
  reorderAt?: number;
  costInr?: number;
  location?: string;
  vendorId?: number | null;
  vendorName?: string;
};

export type ShopSlide = {
  id: number;
  kicker: string;
  title: string;
  imagePath: string;
  link: string;
  sortOrder: number;
  active: boolean;
  kind: "poster" | "video" | "story";
  mediaType: "image" | "video" | "youtube";
  videoPath: string;
};

export type ShopEnquiry = {
  id: number;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export type ShopVisit = {
  id: number;
  path: string;
  country: string;
  name: string;
  requirement: string;
  place: string;
  contact: string;
  email: string;
  createdAt: string;
};

export type ShopOrder = {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  email: string;
  item: string;
  status: string;
  address: string;
  city: string;
  pincode: string;
  payment: string;
  paymentStatus: string;
  amount: number;
  satisfied: string;
  feedback: string;
  rzpOrderId?: string;
  rzpPaymentId?: string;
  createdAt: string;
};

export function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function countryFromTimeZone(tz: string) {
  const t = tz.toLowerCase();
  if (t.includes("kolkata") || t.includes("calcutta") || t.includes("colombo")) return "India";
  if (t.includes("dubai") || t.includes("muscat") || t.includes("qatar")) return "United Arab Emirates";
  if (t.includes("singapore")) return "Singapore";
  if (t.includes("shanghai") || t.includes("hong_kong")) return "China";
  if (t.startsWith("america/")) return "United States";
  if (t.includes("london")) return "United Kingdom";
  if (t.includes("tokyo")) return "Japan";
  if (t.includes("sydney") || t.includes("melbourne")) return "Australia";
  return "Unknown";
}

export const COLLECTION_CARDS = [
  {
    category: "Gemstones",
    title: "Gemstones",
    body: "Navratna and cabinet stones, named honestly.",
    image: "/images/hero-gems.jpg?v=ivory",
    to: "/shop?category=Gemstones",
  },
  {
    category: "Crystal",
    title: "Crystal",
    body: "Sphatik, amethyst, citrine and clusters for the shrine.",
    image: "/images/amethyst.jpg?v=ivory",
    to: "/shop?category=Crystal",
  },
  {
    category: "Mala",
    title: "Mala",
    body: "Rudraksha, karungali, sphatik — 108 and daily wear.",
    image: "/images/heritage.jpg?v=ivory",
    to: "/shop?category=Mala",
  },
  {
    category: "Pearls-Beads",
    title: "Pearls & beads",
    body: "Freshwater pearls, gemstone strands, gift-ready.",
    image: "/images/pearl.jpg?v=ivory",
    to: "/shop?category=Pearls-Beads",
  },
  {
    category: "Brass",
    title: "Brass items",
    body: "Pooja diyas, kalash and festival brass from Solapur.",
    image: "/images/brass-collection.jpg?v=ivory",
    to: "/shop?category=Brass",
  },
] as const;
