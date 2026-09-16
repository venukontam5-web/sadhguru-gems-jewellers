import { SITE } from "@/data/site";

export const LEAD_SOURCES = [
  "website",
  "enquiry",
  "whatsapp",
  "instagram",
  "facebook",
  "youtube",
  "x",
  "linkedin",
  "walk-in",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = ["New", "Reached", "Remind", "Closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type SalesLead = {
  id: number;
  name: string;
  source: string;
  handle: string;
  phone: string;
  email: string;
  interest: string;
  place: string;
  notes: string;
  status: string;
  nextAt: string | null;
  lastReachedAt: string | null;
  sourceKey: string;
  createdAt: string;
  heat: number;
};

export function digitsPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.length === 11 && d.startsWith("0")) return `91${d.slice(1)}`;
  return d;
}

export function leadHeat(row: {
  phone: string;
  email: string;
  name: string;
  interest: string;
  status: string;
}) {
  let n = 1;
  if (row.phone) n += 2;
  if (row.email) n += 1;
  if (row.name) n += 1;
  if (/gem|ruby|emerald|navratna|stone|mala/i.test(row.interest)) n += 1;
  if (row.status === "Closed") n = 0;
  return Math.min(n, 5);
}

export function reachWhatsApp(lead: { name: string; interest: string; phone: string }) {
  const phone = digitsPhone(lead.phone);
  const text = `Namaste${lead.name ? ` ${lead.name}` : ""},

This is Sadhguru Gems & Jewellers, Akkalkot Road, Solapur.

You asked about ${lead.interest || "a stone from the cabinet"}. The pieces are here:

${SITE.url}/shop

WhatsApp us if you would like it named on the bill.

Happiness Auspicious Moment
${SITE.phone}`;
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : "";
}

export function reachMail(lead: { name: string; interest: string; email: string }) {
  if (!lead.email) return "";
  const subject = `Sadhguru Gems — ${lead.interest || "the cabinet"}`;
  const body = `Namaste${lead.name ? ` ${lead.name}` : ""},

The Solapur cabinet is online:

${SITE.url}/shop

You asked about ${lead.interest || "a gemstone"}. Write back or WhatsApp ${SITE.phone}.

Happiness Auspicious Moment
Sadhguru Gems & Jewellers`;
  return `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const SITE_SHARE = `${SITE.url}

Sadhguru Gems & Jewellers — Akkalkot Road, Kumbhari, Solapur.
Certified gemstones. Named on the bill.
WhatsApp ${SITE.phone}

#SadhguruGems #Navratna #Solapur`;

export const NAVIGATOR_HOME = "https://www.linkedin.com/sales/";

export const NAVIGATOR_SEARCHES = [
  {
    label: "Gemstone buyers · India",
    href: "https://www.linkedin.com/search/results/people/?keywords=gemstone%20buyer%20India",
  },
  {
    label: "Jewellery retailers",
    href: "https://www.linkedin.com/search/results/people/?keywords=jewellery%20retailer%20India",
  },
  {
    label: "Corporate gifting",
    href: "https://www.linkedin.com/search/results/people/?keywords=corporate%20gifting%20jewellery",
  },
  {
    label: "Solapur business",
    href: "https://www.linkedin.com/search/results/people/?keywords=Solapur%20business%20owner",
  },
] as const;
