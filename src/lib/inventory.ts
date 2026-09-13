import { inr } from "@/lib/shop";

export const STOCK_KINDS = [
  "opening",
  "purchase",
  "sale",
  "return",
  "adjust",
  "karigar",
] as const;
export type StockKind = (typeof STOCK_KINDS)[number];

export const STOCK_KIND_LABEL: Record<StockKind, string> = {
  opening: "Opening",
  purchase: "Purchase in",
  sale: "Sale out",
  return: "Return in",
  adjust: "Adjust",
  karigar: "Karigar",
};

export const STOCK_LOCATIONS = [
  "Cabinet",
  "Navratna tray",
  "Crystal cabinet",
  "Mala drawer",
  "Brass shelf",
  "Copper shelf",
  "Safe",
  "Karigar",
] as const;

export const STOCK_REASONS = [
  "Count correction",
  "Found",
  "Lost / breakage",
  "Sent to karigar",
  "Back from karigar",
  "Opening",
  "Other",
] as const;

export type StockStatus = "ok" | "low" | "out";

export type StockRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  location: string;
  stock: number;
  weightG: number;
  reorderAt: number;
  costInr: number;
  priceInr: number;
  imagePath: string;
  active: boolean;
  retailValue: number;
  costValue: number;
  status: StockStatus;
};

export type StockMove = {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  kind: StockKind;
  qty: number;
  weightG: number;
  billId: number | null;
  billNumber: string;
  note: string;
  createdAt: string;
};

export type InventorySummary = {
  skus: number;
  pieces: number;
  retailValue: number;
  costValue: number;
  lowCount: number;
  outCount: number;
  byCategory: { category: string; pieces: number; retailValue: number; lowCount: number }[];
  low: StockRow[];
  recent: StockMove[];
};

export function stockStatus(stock: number, reorderAt: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= reorderAt) return "low";
  return "ok";
}

export function statusLabel(s: StockStatus) {
  if (s === "out") return "Out";
  if (s === "low") return "Low";
  return "In stock";
}

export function money(n: number) {
  return inr(n);
}

export function signedQty(n: number) {
  const v = Math.round(n);
  if (v > 0) return `+${v}`;
  return String(v);
}
