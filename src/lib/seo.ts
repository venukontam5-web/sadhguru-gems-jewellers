import { SITE } from "@/data/site";
import { FOUNDER } from "@/data/founder";

export function pageHead(title: string, description: string, path = "/") {
  const url = `${SITE.url}${path === "/" ? "" : path}`;
  const image = `${SITE.url}/og.jpg`;
  return {
    meta: [
      { title: `${title} · ${SITE.name}` },
      { name: "description", content: description },
      { name: "author", content: SITE.legalName },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { name: "theme-color", content: "#1A1410" },
      { name: "geo.region", content: "IN-MH" },
      { name: "geo.placename", content: "Solapur" },
      { name: "ICBM", content: "17.6599, 75.9064" },
      { name: "language", content: "en-IN" },
      {
        name: "keywords",
        content:
          "Sadhguru Gems and Jewellers, certified gemstones Solapur, Navratna Solapur, ruby Manikya, yellow sapphire Pukhraj, emerald Panna, blue sapphire Neelam, pearl Moti, red coral Moonga, hessonite Gomed, cat's eye Lehsunia, gold jewellery Solapur, official website",
      },
      { property: "og:locale", content: "en_IN" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:title", content: `${title} · ${SITE.name}` },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${title} · ${SITE.name}` },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "en-IN", href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: [
      "Sadhguru Gems And Jewellers",
      "SGJ Solapur",
      "Sadhguru Gems official website",
    ],
    url: SITE.url,
    inLanguage: "en-IN",
    publisher: {
      "@type": "JewelryStore",
      name: SITE.legalName,
      url: SITE.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/gemstones?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["JewelryStore", "LocalBusiness", "Store"],
    "@id": `${SITE.url}/#shop`,
    name: SITE.legalName,
    alternateName: ["Sadhguru Gems & Jewellers", "SGJ", "Sadhguru Gems Solapur"],
    url: SITE.url,
    image: [`${SITE.url}/images/showroom.jpg`, `${SITE.url}/og.jpg`, `${SITE.url}/images/logo.png`],
    logo: `${SITE.url}/images/logo.png`,
    telephone: SITE.phone,
    email: SITE.email,
    foundingDate: String(SITE.established),
    slogan: SITE.tagline,
    description: SITE.description,
    founder: {
      "@type": "Person",
      name: FOUNDER.name,
      jobTitle: FOUNDER.role,
      url: `${SITE.url}/about`,
    },
    priceRange: "₹₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Razorpay, Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
      addressLocality: "Solapur",
      addressRegion: "Maharashtra",
      postalCode: SITE.address.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.6599,
      longitude: 75.9064,
      addressCountry: "IN",
    },
    hasMap: SITE.mapsLink,
    areaServed: [
      { "@type": "City", name: "Solapur" },
      { "@type": "State", name: "Maharashtra" },
      { "@type": "Country", name: "India" },
    ],
    knowsAbout: [
      "Certified gemstones",
      "Navratna",
      "Ruby",
      "Pearl",
      "Red coral",
      "Emerald",
      "Yellow sapphire",
      "Diamond",
      "Blue sapphire",
      "Hessonite",
      "Cat's eye",
      "Gold jewellery",
      "Silver jewellery",
      "Brass pooja items",
      "Copper ware",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Certified gemstones and jewellery",
      itemListElement: [
        { "@type": "OfferCatalog", name: "Navratna gemstones" },
        { "@type": "OfferCatalog", name: "Gold and silver jewellery" },
        { "@type": "OfferCatalog", name: "Brass and copper ware" },
      ],
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:30",
      closes: "20:30",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(SITE.rating),
      reviewCount: String(SITE.reviewCount),
      bestRating: "5",
    },
    sameAs: [SITE.instagram, SITE.facebook, SITE.youtube, SITE.x],
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${c.path === "/" ? "" : c.path}`,
    })),
  };
}

export function gemstoneJsonLd(gem: {
  slug: string;
  name: string;
  sanskrit: string;
  excerpt: string;
  image: string;
  planet: string;
}) {
  const url = `${SITE.url}/gemstones/${gem.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${gem.name} (${gem.sanskrit}) certified gemstone`,
    description: `${gem.excerpt} Official certified ${gem.name} from Sadhguru Gems & Jewellers, Solapur. Stone of ${gem.planet}.`,
    image: gem.image.startsWith("http") ? gem.image : `${SITE.url}${gem.image.split("?")[0]}`,
    url,
    brand: { "@type": "Brand", name: SITE.legalName },
    category: "Certified gemstones",
    material: gem.name,
    offers: {
      "@type": "Offer",
      url,
      availability: "https://schema.org/InStoreOnly",
      priceCurrency: "INR",
      seller: { "@type": "JewelryStore", name: SITE.legalName, url: SITE.url },
      areaServed: { "@type": "City", name: "Solapur" },
    },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER.name,
    jobTitle: FOUNDER.role,
    description: `${FOUNDER.role} of ${FOUNDER.house}. Jewellery professional from Solapur since ${FOUNDER.industryStart}; established the house in ${FOUNDER.founded}.`,
    birthDate: FOUNDER.birthDate,
    url: `${SITE.url}/about`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Solapur",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    worksFor: {
      "@type": "JewelryStore",
      name: SITE.legalName,
      url: SITE.url,
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: FOUNDER.education,
    },
    sameAs: [SITE.instagram, SITE.facebook, SITE.youtube, SITE.x],
  };
}
