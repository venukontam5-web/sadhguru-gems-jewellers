export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  priceInr: number;
  imagePath: string;
  qty: number;
};

export const CART_KEY = "sgj-cart-v1";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((l) => l && l.slug && l.qty > 0) : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.qty, 0);
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.qty * l.priceInr, 0);
}

export function upsertLine(lines: CartLine[], add: Omit<CartLine, "qty"> & { qty?: number }): CartLine[] {
  const qty = Math.max(1, add.qty ?? 1);
  const i = lines.findIndex((l) => l.productId === add.productId);
  if (i < 0) return [...lines, { ...add, qty }];
  const next = [...lines];
  next[i] = { ...next[i], qty: next[i].qty + qty };
  return next;
}

export const PAY_METHODS = [
  { id: "upi", label: "UPI (Razorpay)", note: "GPay, PhonePe, BHIM — the bank confirms." },
  { id: "card", label: "Card (Razorpay)", note: "Visa, Mastercard, RuPay. We never keep the number." },
  { id: "shop", label: "Pay at the shop", note: "See the stone on Akkalkot Road, then pay." },
] as const;

export type PayMethod = (typeof PAY_METHODS)[number]["id"];
