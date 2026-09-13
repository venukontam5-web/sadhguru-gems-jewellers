export const GUEST_KEY = "sgj-guest-v1";

export type GuestCard = {
  name: string;
  phone: string;
  email: string;
};

export function readGuest(): GuestCard {
  if (typeof window === "undefined") return { name: "", phone: "", email: "" };
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return { name: "", phone: "", email: "" };
    const parsed = JSON.parse(raw) as GuestCard;
    return {
      name: String(parsed.name || ""),
      phone: String(parsed.phone || ""),
      email: String(parsed.email || ""),
    };
  } catch {
    return { name: "", phone: "", email: "" };
  }
}

export function writeGuest(card: GuestCard) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_KEY, JSON.stringify(card));
}

export function requirementFromPath(path: string) {
  const p = (path || "/").split("?")[0];
  if (p === "/") return "Home";
  if (p.startsWith("/shop/")) return decodeURIComponent(p.slice(6).replace(/-/g, " "));
  if (p.startsWith("/gemstones/")) return decodeURIComponent(p.slice(11).replace(/-/g, " "));
  const map: Record<string, string> = {
    "/shop": "Shop",
    "/gemstones": "Gemstones",
    "/navratna": "Navratna",
    "/astrology": "Astrology",
    "/colours": "Colours",
    "/brass": "Brass",
    "/copper": "Copper",
    "/enquire": "Enquiry",
    "/contact": "Contact",
    "/about": "About",
    "/cart": "Cart",
    "/checkout": "Checkout",
    "/reviews": "Reviews",
    "/account": "Account",
    "/track": "Track order",
  };
  return map[p] || p.replace(/^\//, "").replace(/-/g, " ") || "Shop";
}

export function placeFromTimeZone(tz: string) {
  const t = tz.toLowerCase();
  if (t.includes("kolkata") || t.includes("calcutta")) return "India · Maharashtra";
  if (t.includes("calcutta")) return "India";
  if (t.includes("dubai")) return "United Arab Emirates · Dubai";
  if (t.includes("qatar")) return "Qatar";
  if (t.includes("muscat")) return "Oman";
  if (t.includes("singapore")) return "Singapore";
  if (t.includes("london")) return "United Kingdom";
  if (t.includes("new_york") || t.includes("chicago") || t.includes("los_angeles")) return "United States";
  if (t.includes("sydney") || t.includes("melbourne")) return "Australia";
  if (t.includes("tokyo")) return "Japan";
  if (t.includes("shanghai") || t.includes("hong_kong")) return "China";
  return tz.replace(/_/g, " ") || "Unknown";
}
