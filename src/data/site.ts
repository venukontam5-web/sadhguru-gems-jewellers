export const SITE = {
  name: "Sadhguru Gems & Jewellers",
  shortName: "SGJ",
  legalName: "Sadhguru Gems And Jewellers",
  domain: "sadhgurugemsandjewellers.com",
  url: "https://sadhgurugemsandjewellers.com",
  tagline: "Happiness Auspicious Moment",
  description:
    "Official website of Sadhguru Gems & Jewellers, Solapur. Certified Navratna gemstones, ruby, pearl, emerald, yellow sapphire, diamond, blue sapphire, gold and silver jewellery, brass and copper — Akkalkot Road, Kumbhari, Solapur 413006.",
  phone: "+91 70207 35981",
  phoneHref: "tel:+917020735981",
  whatsapp: "917020735981",
  upi: "7020735981@upi",
  razorpayMerchantId: "HKe6Oqo4oHUTM5",
  vercelAccountId: "1SiD1HMOQQ5GVQjNAHkzGboQ",
  vercelProject: "sadhguru-official",
  vercelProjectId: "prj_wpRHwkkiEdlhzaMfg1x1JhV6wzPP",
  githubRepo: "venukontam5-web/www.sadhgurugemsandjewellers.com",
  githubUrl: "https://github.com/venukontam5-web/www.sadhgurugemsandjewellers.com",
  email: "sgjworld@gmail.com",
  emailHref: "mailto:sgjworld@gmail.com",
  instagram: "https://www.instagram.com/sadhguru_gems_and_jewellers/",
  facebook: "https://www.facebook.com/p/Sadhguru-Gems-And-Jewellers-100091624991950/",
  youtube: "https://www.youtube.com/@sadhgurugemsandjewellers",
  x: "https://x.com/Sgjworld",
  established: 2016,
  rating: 4.9,
  reviewCount: 26,
  hours: "9:30 AM – 8:30 PM",
  hoursNote: "Open all seven days",
  address: {
    line1: "106 / New Sunil Nagar",
    line2: "Near Aadam Kirana Shop, MIDC, Akkalkot Road",
    locality: "Kumbhari, Solapur",
    region: "Maharashtra",
    postalCode: "413006",
    country: "India",
  },
  mapsQuery:
    "106 New Sunil Nagar, Near Aadam Kirana Shop, MIDC Akkalkot Road, Kumbhari, Solapur 413006",
  mapsEmbed:
    "https://www.google.com/maps?q=Sadhguru+Gems+And+Jewellers+Sunil+Nagar+Akkalkot+Road+Solapur&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Sadhguru+Gems+And+Jewellers+Sunil+Nagar+Solapur",
} as const;

/** Paste your IDs to activate tracking. Empty strings keep the site script-free. */
export const MARKETING = {
  gaMeasurementId: "",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  gtmId: "",
  searchConsoleVerification: "",
} as const;

export function whatsappHref(message?: string) {
  const text = message ?? "Namaste, I would like to enquire about a gemstone from Sadhguru Gems & Jewellers.";
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function fullAddress() {
  const a = SITE.address;
  return `${a.line1}, ${a.line2}, ${a.locality}, ${a.region} ${a.postalCode}, ${a.country}`;
}

export const NAV = [
  { label: "Shop", to: "/shop" as const },
  { label: "Gemstones", to: "/gemstones" as const },
  { label: "Navratna", to: "/navratna" as const },
  { label: "Colours", to: "/colours" as const },
  { label: "Astrology", to: "/astrology" as const },
  { label: "Brass", to: "/brass" as const },
  { label: "Copper", to: "/copper" as const },
  { label: "Shipping", to: "/shipping" as const },
  { label: "Track order", to: "/track" as const },
  { label: "About", to: "/about" as const },
  { label: "Why Us", to: "/why-us" as const },
  { label: "History", to: "/history" as const },
  { label: "Reviews", to: "/reviews" as const },
  { label: "Careers", to: "/careers" as const },
  { label: "Enquire", to: "/enquire" as const },
  { label: "Contact", to: "/contact" as const },
];

export const FOOTER_COMPANY = [
  { label: "About Us", to: "/about" as const },
  { label: "Why Us", to: "/why-us" as const },
  { label: "History of Gemstones", to: "/history" as const },
  { label: "Careers", to: "/careers" as const },
  { label: "Feedback & Reviews", to: "/reviews" as const },
  { label: "Contact", to: "/contact" as const },
];

export const FOOTER_COLLECTIONS = [
  { label: "All Gemstones", to: "/gemstones" as const },
  { label: "Navratna Stones", to: "/gemstones?group=navratna" as const },
  { label: "Brass Items", to: "/brass" as const },
  { label: "Copper Ware", to: "/copper" as const },
];
