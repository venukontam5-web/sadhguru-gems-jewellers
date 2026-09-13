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
      { name: "robots", content: "index,follow" },
      { name: "theme-color", content: "#1A1410" },
      { name: "geo.region", content: "IN-MH" },
      { name: "geo.placename", content: "Solapur" },
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
    links: [{ rel: "canonical", href: url }],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: SITE.legalName,
    url: SITE.url,
    image: `${SITE.url}/images/showroom.jpg`,
    telephone: SITE.phone,
    email: SITE.email,
    foundingDate: String(SITE.established),
    founder: {
      "@type": "Person",
      name: FOUNDER.name,
      jobTitle: FOUNDER.role,
      url: `${SITE.url}/about`,
    },
    priceRange: "₹₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      addressCountry: "IN",
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
