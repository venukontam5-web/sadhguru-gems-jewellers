import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import { authMiddleware } from "@/lib/auth/middleware";
import type { ShopOrder } from "@/lib/shop";
import type { CartLine } from "@/lib/cart";

type OrderRow = {
  id: number;
  code: string;
  customer_name: string;
  phone: string;
  email?: string;
  item: string;
  status: string;
  address?: string;
  city?: string;
  pincode?: string;
  payment?: string;
  payment_status?: string;
  amount?: number;
  satisfied?: string;
  feedback?: string;
  lines_json?: string;
  rzp_order_id?: string;
  rzp_payment_id?: string;
  created_at: unknown;
};

function asIso(v: unknown) {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? "");
}

export function mapShopOrder(r: OrderRow): ShopOrder {
  return {
    id: Number(r.id),
    code: r.code,
    customerName: r.customer_name,
    phone: r.phone ?? "",
    email: r.email ?? "",
    item: r.item,
    status: r.status,
    address: r.address ?? "",
    city: r.city ?? "",
    pincode: r.pincode ?? "",
    payment: r.payment ?? "",
    paymentStatus: r.payment_status ?? "Unpaid",
    amount: Number(r.amount) || 0,
    satisfied: r.satisfied ?? "",
    feedback: r.feedback ?? "",
    rzpOrderId: r.rzp_order_id ?? "",
    rzpPaymentId: r.rzp_payment_id ?? "",
    createdAt: asIso(r.created_at),
  };
}

const lineZ = z.object({
  productId: z.number(),
  slug: z.string().max(80),
  name: z.string().max(120),
  priceInr: z.number().min(0),
  imagePath: z.string().max(200),
  qty: z.number().min(1).max(99),
});

export const placeShopOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      customerName: z.string().min(1).max(80),
      phone: z.string().min(8).max(20),
      email: z.string().max(120).default(""),
      address: z.string().min(4).max(240),
      city: z.string().min(2).max(80),
      pincode: z.string().min(4).max(12),
      payment: z.enum(["upi", "card", "shop"]),
      lines: z.array(lineZ).min(1).max(40),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const amount = data.lines.reduce((s, l) => s + Math.round(l.qty * l.priceInr), 0);
    const item = data.lines.map((l) => `${l.qty} × ${l.name}`).join(", ").slice(0, 220);
    const paid = data.payment !== "shop";
    const paymentStatus = paid ? "Paid" : "Unpaid";
    const status = paid ? "Paid" : "New";
    const payLabel = data.payment === "upi" ? "UPI" : data.payment === "card" ? "Card" : "Pay at shop";
    const [{ n }] = await sql<{ n: number }>`select coalesce(max(id), 1800)::int + 42 as n from orders`;
    const code = `SGJ-${n}`;
    const linesJson = JSON.stringify(data.lines);
    await sql`
      insert into orders (
        code, customer_name, phone, email, item, status,
        address, city, pincode, payment, payment_status, amount, lines_json
      ) values (
        ${code}, ${data.customerName.trim()}, ${data.phone.trim()}, ${data.email.trim()},
        ${item}, ${status}, ${data.address.trim()}, ${data.city.trim()}, ${data.pincode.trim()},
        ${payLabel}, ${paymentStatus}, ${amount}, ${linesJson}
      )`;
    await sql`
      insert into visitors (path, country, requirement, place, name, contact, email)
      values (
        '/checkout',
        'India',
        ${item.slice(0, 120)},
        ${data.city.trim() || "India"},
        ${data.customerName.trim()},
        ${data.phone.trim()},
        ${data.email.trim()}
      )`;
    return { ok: true as const, code, amount, paymentStatus };
  });

export const getShopOrder = createServerFn({ method: "GET" })
  .validator(z.object({ code: z.string().min(3).max(24) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<OrderRow>`select * from orders where code = ${code} limit 1`;
    const r = rows[0];
    if (!r) return null;
    let lines: CartLine[] = [];
    try {
      lines = JSON.parse(r.lines_json || "[]") as CartLine[];
    } catch {
      lines = [];
    }
    return { ...mapShopOrder(r), lines };
  });

export const saveOrderFeedback = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().min(3).max(24),
      satisfied: z.enum(["yes", "no"]),
      feedback: z.string().max(800).default(""),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<{ id: number }>`select id from orders where code = ${code} limit 1`;
    if (!rows[0]) throw new Error("No order with that code.");
    await sql`
      update orders set
        satisfied = ${data.satisfied},
        feedback = ${data.feedback.trim()}
      where code = ${code}`;
    return { ok: true as const };
  });

export const myShopOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<OrderRow>`
      select * from orders where user_id = ${context.userId} order by id desc limit 20`;
    return rows.map(mapShopOrder);
  });

export const ownerListShopOrders = createServerFn({ method: "GET" })
  .middleware([capMiddleware("orders")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<OrderRow>`select * from orders order by id desc`;
    return rows.map(mapShopOrder);
  });
