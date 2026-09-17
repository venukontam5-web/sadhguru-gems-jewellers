import { SITE } from "./site";

/** Paste-ready Google Business Profile copy. Do not create a second listing. */
export const GBP = {
  name: SITE.legalName,
  primaryCategory: "Jewelry store",
  extraCategories: ["Gemstone", "Goldsmith", "Silversmith", "Jewelry designer"],
  phone: SITE.phone,
  website: SITE.url,
  address: `${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}`,
  hours: "09:30–20:30 · Monday–Sunday",
  fromTheBusiness: `Official certified gemstone house in Solapur, established ${SITE.established}. Sadhguru Gems And Jewellers keeps Navratna stones — ruby (Manikya), pearl, red coral, emerald, yellow sapphire (Pukhraj), diamond, blue sapphire (Neelam), hessonite (Gomed) and cat's eye — with treatments disclosed. Gold and silver jewellery made to the stone. Brass and copper ware for the home. Visit 106 New Sunil Nagar, Akkalkot Road, Kumbhari, Solapur 413006, or ${SITE.url}. Open 9:30 AM to 8:30 PM, all seven days. Call ${SITE.phone}.`,
  services: [
    "Certified gemstones",
    "Navratna jewellery",
    "Ruby / Manikya",
    "Yellow sapphire / Pukhraj",
    "Blue sapphire / Neelam",
    "Emerald / Panna",
    "Pearl / Moti",
    "Gold jewellery",
    "Silver jewellery",
    "Brass pooja items",
    "Copper ware",
    "Custom jewellery setting",
    "Gemstone certification",
    "In-store consultation",
  ],
  products: [
    { name: "Certified Ruby (Manikya)", body: "Navratna stone of the Sun. Untreated and heat-treated with full disclosure. Solapur cabinet." },
    { name: "Yellow Sapphire (Pukhraj)", body: "Navratna stone of Jupiter. Certified Pukhraj for traditional setting in gold." },
    { name: "Blue Sapphire (Neelam)", body: "Navratna stone of Saturn. Shown in daylight at the Akkalkot Road shop." },
    { name: "Emerald (Panna)", body: "Navratna stone of Mercury. Certified emerald, treatments told before the sale." },
    { name: "Gold jewellery", body: "Gold made to the stone at Sadhguru Gems And Jewellers, Solapur." },
    { name: "Silver jewellery", body: "Silver pieces and settings from the Solapur cabinet." },
  ],
  attributes: [
    "Women-owned: no (leave blank unless true)",
    "Identifies as LGBTQ+: no",
    "On-site parking: if you have it, Yes",
    "In-store shopping: Yes",
    "Delivery: Yes (shipping page)",
    "Appointment required: No",
    "Wheelchair accessible: set honestly",
  ],
  qa: [
    {
      q: "Where is Sadhguru Gems And Jewellers?",
      a: "106 / New Sunil Nagar, Near Aadam Kirana Shop, MIDC, Akkalkot Road, Kumbhari, Solapur 413006. Official website sadhgurugemsandjewellers.com",
    },
    {
      q: "Do you sell certified Navratna gemstones?",
      a: "Yes. Ruby, pearl, red coral, emerald, yellow sapphire, diamond, blue sapphire, hessonite and cat's eye, with treatments disclosed.",
    },
    {
      q: "What are the shop hours?",
      a: "9:30 AM to 8:30 PM, open all seven days.",
    },
    {
      q: "Is this the official website?",
      a: "Yes. https://www.sadhgurugemsandjewellers.com is the official website. Do not use old sgj.world links.",
    },
  ],
  weeklyPosts: [
    "Certified Navratna gemstones in Solapur — ruby, Pukhraj, Neelam — at Sadhguru Gems And Jewellers, Akkalkot Road. Official site sadhgurugemsandjewellers.com",
    "Looking for Pukhraj (yellow sapphire) in Solapur? Visit the cabinet on Akkalkot Road or enquire on WhatsApp 7020735981.",
    "Gold and silver made to the stone. Certified gems. Open 9:30–8:30 every day. Sadhguru Gems And Jewellers, Kumbhari, Solapur.",
  ],
  photoShots: [
    "Shop front with the lockup clearly readable",
    "Interior cabinet, ivory trays",
    "Close stones: ruby, Pukhraj, Neelam (no fake stock photos)",
    "Staff at the counter (consent)",
    "Street / Akkalkot Road so Maps can match the pin",
    "Logo square 720×720 for the profile",
  ],
} as const;
