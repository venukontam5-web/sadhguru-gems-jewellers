export const DESK_ROLES = ["owner", "counter", "cabinet", "shop", "viewer"] as const;
export type DeskRole = (typeof DESK_ROLES)[number];

export const DESK_CAPS = [
  "desk",
  "appearance",
  "bills",
  "inventory",
  "products",
  "slides",
  "enquiries",
  "orders",
  "visitors",
  "reviews",
  "social",
  "team",
] as const;
export type DeskCap = (typeof DESK_CAPS)[number];

export const ROLE_COPY: Record<DeskRole, { label: string; ring: string }> = {
  owner: { label: "Owner", ring: "Every key. Team, bills, stock, and the look of the shop." },
  counter: { label: "Counter", ring: "Sale and purchase bills, scan, orders, enquiries." },
  cabinet: { label: "Cabinet", ring: "Stock book, ledger, products on the tray." },
  shop: { label: "Shop front", ring: "Slides, reviews, visitors, the public cabinet." },
  viewer: { label: "Watcher", ring: "The desk overview only. No bills, no stock, no style." },
};

const ROLE_CAPS: Record<DeskRole, readonly DeskCap[]> = {
  owner: DESK_CAPS,
  counter: ["desk", "bills", "inventory", "products", "enquiries", "orders"],
  cabinet: ["desk", "inventory", "products"],
  shop: ["desk", "products", "slides", "visitors", "reviews", "social"],
  viewer: ["desk"],
};

export function isDeskRole(value: string | null | undefined): value is DeskRole {
  return !!value && (DESK_ROLES as readonly string[]).includes(value);
}

export function hasCap(role: DeskRole | null | undefined, cap: DeskCap): boolean {
  if (!role) return false;
  return ROLE_CAPS[role].includes(cap);
}

export function capsFor(role: DeskRole): readonly DeskCap[] {
  return ROLE_CAPS[role];
}

const PATH_CAP: { prefix: string; cap: DeskCap }[] = [
  { prefix: "/owner/appearance", cap: "appearance" },
  { prefix: "/owner/settings", cap: "appearance" },
  { prefix: "/owner/security", cap: "desk" },
  { prefix: "/owner/ads", cap: "appearance" },
  { prefix: "/owner/payments", cap: "appearance" },
  { prefix: "/owner/keys", cap: "appearance" },
  { prefix: "/owner/live", cap: "appearance" },
  { prefix: "/owner/auto", cap: "appearance" },
  { prefix: "/owner/bills", cap: "bills" },
  { prefix: "/owner/gst", cap: "bills" },
  { prefix: "/owner/selling", cap: "bills" },
  { prefix: "/owner/print", cap: "inventory" },
  { prefix: "/owner/inventory", cap: "inventory" },
  { prefix: "/owner/vendors", cap: "inventory" },
  { prefix: "/owner/products", cap: "products" },
  { prefix: "/owner/catalog", cap: "products" },
  { prefix: "/owner/discounts", cap: "products" },
  { prefix: "/owner/categories", cap: "products" },
  { prefix: "/owner/slides", cap: "slides" },
  { prefix: "/owner/astrology", cap: "slides" },
  { prefix: "/owner/enquiries", cap: "enquiries" },
  { prefix: "/owner/leads", cap: "enquiries" },
  { prefix: "/owner/ai", cap: "enquiries" },
  { prefix: "/owner/orders", cap: "orders" },
  { prefix: "/owner/visitors", cap: "visitors" },
  { prefix: "/owner/performance", cap: "visitors" },
  { prefix: "/owner/reviews", cap: "reviews" },
  { prefix: "/owner/social", cap: "social" },
  { prefix: "/owner/users", cap: "team" },
  { prefix: "/owner/staff", cap: "team" },
];

export function capForPath(pathname: string): DeskCap {
  const hit = PATH_CAP.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`));
  return hit?.cap ?? "desk";
}
