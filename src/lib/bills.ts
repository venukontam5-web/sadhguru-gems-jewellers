import { inr } from "@/lib/shop";

export const BILL_KINDS = ["sale", "purchase", "stock", "repair", "return", "expense"] as const;
export type BillKind = (typeof BILL_KINDS)[number];

export const BILL_PAYMENTS = ["Cash", "UPI", "Card", "Bank", "Credit"] as const;
export const BILL_GST_RATES = [0, 3, 5, 12, 18] as const;
export const BILL_PURITIES = [
  "",
  "24K",
  "22K",
  "18K",
  "14K",
  "Silver 925",
  "Silver 999",
  "Platinum",
  "Gemstone",
  "Pearl",
  "Rudraksha",
  "Brass",
  "Copper",
] as const;

export type BillLine = {
  id?: number;
  sortOrder: number;
  description: string;
  hsn: string;
  purity: string;
  qty: number;
  weightG: number;
  rate: number;
  making: number;
  amount: number;
  productId?: number | null;
};

export type Bill = {
  id: number;
  kind: BillKind;
  number: string;
  billDate: string;
  partyName: string;
  phone: string;
  gstin: string;
  address: string;
  notes: string;
  payment: string;
  status: string;
  refNumber: string;
  againstId: number | null;
  againstNumber: string;
  subtotal: number;
  making: number;
  discount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  createdAt: string;
  lines: BillLine[];
};

export type BillSummary = {
  saleCount: number;
  saleTotal: number;
  saleToday: number;
  purchaseCount: number;
  purchaseTotal: number;
  stockCount: number;
  stockTotal: number;
  repairCount: number;
  repairTotal: number;
  returnCount: number;
  returnTotal: number;
  expenseCount: number;
  expenseTotal: number;
  cancelledCount: number;
  recent: Bill[];
};

export const BILL_COPY: Record<
  BillKind,
  { title: string; party: string; paper: string; kicker: string; newLabel: string; note: string }
> = {
  sale: {
    title: "Sale bill",
    party: "Customer",
    paper: "Tax invoice",
    kicker: "Bills & invoices",
    newLabel: "New sale bill",
    note: "Write a bill from the counter. GST at 3% for jewellery unless you change it.",
  },
  purchase: {
    title: "Purchase bill",
    party: "Supplier",
    paper: "Purchase bill",
    kicker: "Bills & invoices",
    newLabel: "New purchase bill",
    note: "Stock in from Jaipur, Bombay or a local karigar. Keep the supplier’s invoice number.",
  },
  stock: {
    title: "Stock entry bill",
    party: "Cabinet",
    paper: "Stock entry",
    kicker: "Bills & invoices",
    newLabel: "New stock entry",
    note: "Opening stock or a piece that arrived without a supplier bill. It adds to the cabinet.",
  },
  repair: {
    title: "Repair & polished bill",
    party: "Customer",
    paper: "Job bill",
    kicker: "Bills & invoices",
    newLabel: "New repair bill",
    note: "Polish, sizing, rhodium, a broken claw. Service GST is usually 18%. The stone does not leave the book.",
  },
  return: {
    title: "Return & cancellation",
    party: "Customer",
    paper: "Credit note",
    kicker: "Bills & invoices",
    newLabel: "New return bill",
    note: "Credit note against a sale, or a bill you cancelled at the counter.",
  },
  expense: {
    title: "Daily expenses",
    party: "Payee",
    paper: "Expense voucher",
    kicker: "Bills & invoices",
    newLabel: "New expense",
    note: "Tea, courier, diesel, a karigar’s day rate. The cabinet does not move.",
  },
};

export function defaultGst(kind: BillKind) {
  if (kind === "repair") return 18;
  if (kind === "expense" || kind === "stock") return 0;
  return 3;
}

export function billPrefix(kind: BillKind) {
  switch (kind) {
    case "sale":
      return "SGJ/S";
    case "purchase":
      return "SGJ/P";
    case "stock":
      return "SGJ/E";
    case "repair":
      return "SGJ/F";
    case "expense":
      return "SGJ/X";
    default:
      return "SGJ/R";
  }
}

export function emptyLine(sortOrder = 0): BillLine {
  return {
    sortOrder,
    description: "",
    hsn: "7113",
    purity: "",
    qty: 1,
    weightG: 0,
    rate: 0,
    making: 0,
    amount: 0,
    productId: null,
  };
}

export function lineAmount(line: Pick<BillLine, "qty" | "weightG" | "rate" | "making">) {
  const base = line.weightG > 0 ? line.weightG * line.rate : line.qty * line.rate;
  return Math.max(0, Math.round(base + line.making));
}

export function billTotals(
  lines: Pick<BillLine, "qty" | "weightG" | "rate" | "making">[],
  discount: number,
  gstRate: number,
) {
  const subtotal = lines.reduce((s, l) => s + lineAmount(l), 0);
  const making = lines.reduce((s, l) => s + Math.round(Number(l.making) || 0), 0);
  const d = Math.min(Math.max(0, Math.round(discount || 0)), subtotal);
  const taxable = subtotal - d;
  const rate = Number.isFinite(gstRate) ? gstRate : 3;
  const gstAmount = Math.round((taxable * rate) / 100);
  return { subtotal, making, discount: d, taxable, gstAmount, total: taxable + gstAmount, gstRate: rate };
}

export function canAmend(status: string) {
  return status === "Issued" || status === "Paid" || status === "Partial";
}

export function formatBillDate(iso: string) {
  if (!iso) return "";
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return iso;
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowThousand(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`;
  return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${belowThousand(n % 100)}` : ""}`;
}

export function inrWords(n: number): string {
  let x = Math.round(Math.abs(n));
  if (x === 0) return "Rupees Zero Only";
  const crore = Math.floor(x / 1e7);
  x %= 1e7;
  const lakh = Math.floor(x / 1e5);
  x %= 1e5;
  const thousand = Math.floor(x / 1e3);
  const rest = x % 1e3;
  const parts: string[] = [];
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  return `Rupees ${parts.join(" ")} Only`;
}

export function money(n: number) {
  return inr(n);
}
