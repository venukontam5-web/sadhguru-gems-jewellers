import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import {
  billTotals,
  lineAmount,
  billPrefix,
  type Bill,
  type BillKind,
  type BillLine,
  type BillSummary,
} from "@/lib/bills";
import { applyBillStock, undoBillStock } from "@/server/stock";

type BillRow = {
  id: number;
  kind: string;
  number: string;
  bill_date: unknown;
  party_name: string;
  phone: string;
  gstin: string;
  address: string;
  notes: string;
  payment: string;
  status: string;
  ref_number: string;
  against_id: number | null;
  against_number: string;
  subtotal: number;
  making: number;
  discount: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  created_at: unknown;
};

type LineRow = {
  id: number;
  bill_id: number;
  sort_order: number;
  description: string;
  hsn: string;
  purity: string;
  qty: unknown;
  weight_g: unknown;
  rate: number;
  making: number;
  amount: number;
  product_id?: number | null;
};

function asIso(v: unknown) {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? "");
}

function asDate(v: unknown) {
  const s = asIso(v);
  return s.slice(0, 10);
}

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapLine(r: LineRow): BillLine {
  return {
    id: Number(r.id),
    sortOrder: Number(r.sort_order),
    description: r.description,
    hsn: r.hsn ?? "",
    purity: r.purity ?? "",
    qty: num(r.qty),
    weightG: num(r.weight_g),
    rate: num(r.rate),
    making: num(r.making),
    amount: num(r.amount),
    productId: r.product_id == null ? null : Number(r.product_id),
  };
}

function mapBill(r: BillRow, lines: BillLine[] = []): Bill {
  return {
    id: Number(r.id),
    kind: (r.kind as BillKind) || "sale",
    number: r.number,
    billDate: asDate(r.bill_date),
    partyName: r.party_name,
    phone: r.phone ?? "",
    gstin: r.gstin ?? "",
    address: r.address ?? "",
    notes: r.notes ?? "",
    payment: r.payment,
    status: r.status,
    refNumber: r.ref_number ?? "",
    againstId: r.against_id == null ? null : Number(r.against_id),
    againstNumber: r.against_number ?? "",
    subtotal: num(r.subtotal),
    making: num(r.making),
    discount: num(r.discount),
    gstRate: num(r.gst_rate),
    gstAmount: num(r.gst_amount),
    total: num(r.total),
    createdAt: asIso(r.created_at),
    lines,
  };
}

async function loadLines(billId: number): Promise<BillLine[]> {
  const sql = await getSql();
  const rows = await sql<LineRow>`
    select * from bill_lines where bill_id = ${billId} order by sort_order, id`;
  return rows.map(mapLine);
}

async function nextNumber(kind: BillKind) {
  const sql = await getSql();
  const prefix = billPrefix(kind);
  const year = new Date().getFullYear();
  const like = `${prefix}/${year}/%`;
  const rows = await sql<{ number: string }>`
    select number from bills where number like ${like} order by id desc limit 1`;
  const last = rows[0]?.number?.split("/").pop();
  const n = (Number(last) || 0) + 1;
  return `${prefix}/${year}/${String(n).padStart(4, "0")}`;
}

const lineInput = z.object({
  description: z.string().min(1).max(160),
  hsn: z.string().max(12).default("7113"),
  purity: z.string().max(40).default(""),
  qty: z.number().min(0).max(99999),
  weightG: z.number().min(0).max(99999),
  rate: z.number().min(0),
  making: z.number().min(0),
  productId: z.number().nullable().optional(),
});

const billInput = z.object({
  id: z.number().optional(),
  kind: z.enum(["sale", "purchase", "return", "stock", "repair", "expense"]),
  billDate: z.string().min(8).max(10),
  partyName: z.string().min(1).max(120),
  phone: z.string().max(20).default(""),
  gstin: z.string().max(20).default(""),
  address: z.string().max(240).default(""),
  notes: z.string().max(500).default(""),
  payment: z.string().max(20).default("Cash"),
  refNumber: z.string().max(40).default(""),
  againstId: z.number().nullable().optional(),
  discount: z.number().min(0).default(0),
  gstRate: z.number().min(0).max(28).default(3),
  lines: z.array(lineInput).min(1).max(40),
});

export const ownerBillsSummary = createServerFn({ method: "GET" })
  .middleware([capMiddleware("bills")])
  .handler(async () => {
    const sql = await getSql();
    const [sale] = await sql<{ n: number; t: number }>`
      select count(*)::int as n, coalesce(sum(total), 0)::int as t
      from bills where kind = 'sale' and status <> 'Cancelled'`;
    const [saleToday] = await sql<{ t: number }>`
      select coalesce(sum(total), 0)::int as t
      from bills
      where kind = 'sale' and status not in ('Cancelled') and bill_date = current_date`;
    const [purchase] = await sql<{ n: number; t: number }>`
      select count(*)::int as n, coalesce(sum(total), 0)::int as t
      from bills where kind = 'purchase' and status <> 'Cancelled'`;
    const [stock] = await sql<{ n: number; t: number }>`
      select count(*)::int as n, coalesce(sum(total), 0)::int as t
      from bills where kind = 'stock' and status <> 'Cancelled'`;
    const [repair] = await sql<{ n: number; t: number }>`
      select count(*)::int as n, coalesce(sum(total), 0)::int as t
      from bills where kind = 'repair' and status <> 'Cancelled'`;
    const [ret] = await sql<{ n: number; t: number }>`
      select count(*)::int as n, coalesce(sum(total), 0)::int as t
      from bills where kind = 'return'`;
    const [expense] = await sql<{ n: number; t: number }>`
      select count(*)::int as n, coalesce(sum(total), 0)::int as t
      from bills where kind = 'expense' and status <> 'Cancelled'`;
    const [cancelled] = await sql<{ n: number }>`
      select count(*)::int as n from bills where status = 'Cancelled'`;
    const recent = await sql<BillRow>`
      select * from bills order by id desc limit 6`;
    return {
      saleCount: num(sale?.n),
      saleTotal: num(sale?.t),
      saleToday: num(saleToday?.t),
      purchaseCount: num(purchase?.n),
      purchaseTotal: num(purchase?.t),
      stockCount: num(stock?.n),
      stockTotal: num(stock?.t),
      repairCount: num(repair?.n),
      repairTotal: num(repair?.t),
      returnCount: num(ret?.n),
      returnTotal: num(ret?.t),
      expenseCount: num(expense?.n),
      expenseTotal: num(expense?.t),
      cancelledCount: num(cancelled?.n),
      recent: recent.map((r) => mapBill(r)),
    } satisfies BillSummary;
  });

export const ownerListBills = createServerFn({ method: "GET" })
  .middleware([capMiddleware("bills")])
  .validator(
    z.object({
      kind: z.enum(["sale", "purchase", "return", "stock", "repair", "expense"]).optional(),
      status: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const kind = data.kind ?? null;
    const status = data.status ?? null;
    const rows = kind && status
      ? await sql<BillRow>`
          select * from bills where kind = ${kind} and status = ${status} order by bill_date desc, id desc`
      : kind
        ? await sql<BillRow>`
            select * from bills where kind = ${kind} order by bill_date desc, id desc`
        : status
          ? await sql<BillRow>`
              select * from bills where status = ${status} order by bill_date desc, id desc`
          : await sql<BillRow>`select * from bills order by bill_date desc, id desc`;
    return rows.map((r) => mapBill(r));
  });

export const ownerGetBill = createServerFn({ method: "GET" })
  .middleware([capMiddleware("bills")])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<BillRow>`select * from bills where id = ${data.id} limit 1`;
    const r = rows[0];
    if (!r) return null;
    return mapBill(r, await loadLines(Number(r.id)));
  });

export const ownerSaveBill = createServerFn({ method: "POST" })
  .middleware([capMiddleware("bills")])
  .validator(billInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const lines = data.lines.map((l, i) => ({
      ...l,
      hsn: l.hsn || "7113",
      purity: l.purity || "",
      amount: lineAmount(l),
      sortOrder: i,
      productId: l.productId ?? null,
    }));
    const t = billTotals(lines, data.discount, data.gstRate);
    const payment = data.payment || "Cash";
    let status = payment === "Credit" ? "Issued" : "Paid";
    let againstNumber = "";
    let againstId = data.againstId ?? null;

    if (data.kind === "return") {
      status = "Issued";
      if (againstId) {
        const orig = await sql<BillRow>`select * from bills where id = ${againstId} limit 1`;
        const o = orig[0];
        if (!o || o.kind !== "sale") throw new Error("Return must be against a sale bill.");
        if (o.status === "Cancelled") throw new Error("That sale is already cancelled.");
        againstNumber = o.number;
      }
    }

    if (data.id) {
      const existing = await sql<BillRow>`select * from bills where id = ${data.id} limit 1`;
      const cur = existing[0];
      if (!cur) throw new Error("Bill not found.");
      if (cur.status === "Cancelled") throw new Error("A cancelled bill cannot be edited.");
      await sql`
        update bills set
          bill_date = ${data.billDate}::date,
          party_name = ${data.partyName.trim()},
          phone = ${data.phone.trim()},
          gstin = ${data.gstin.trim()},
          address = ${data.address.trim()},
          notes = ${data.notes.trim()},
          payment = ${payment},
          status = ${cur.status === "Returned" ? "Returned" : status},
          ref_number = ${data.refNumber.trim()},
          against_id = ${againstId},
          against_number = ${againstNumber || cur.against_number},
          subtotal = ${t.subtotal},
          making = ${t.making},
          discount = ${t.discount},
          gst_rate = ${t.gstRate},
          gst_amount = ${t.gstAmount},
          total = ${t.total},
          updated_at = now()
        where id = ${data.id}`;
      await sql`delete from bill_lines where bill_id = ${data.id}`;
      for (const l of lines) {
        await sql`
          insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount, product_id)
          values (
            ${data.id}, ${l.sortOrder}, ${l.description.trim()}, ${l.hsn}, ${l.purity},
            ${l.qty}, ${l.weightG}, ${Math.round(l.rate)}, ${Math.round(l.making)}, ${l.amount}, ${l.productId}
          )`;
      }
      const hadMoves = await undoBillStock(sql, data.id);
      if (hadMoves) {
        await applyBillStock(sql, {
          billId: data.id,
          kind: data.kind,
          number: cur.number,
          userId: context.userId,
          lines,
        });
      }
      return { ok: true as const, id: data.id, number: cur.number };
    }

    const number = await nextNumber(data.kind);
    const inserted = await sql<{ id: number }>`
      insert into bills (
        kind, number, bill_date, party_name, phone, gstin, address, notes, payment, status,
        ref_number, against_id, against_number, subtotal, making, discount, gst_rate, gst_amount, total, created_by
      ) values (
        ${data.kind}, ${number}, ${data.billDate}::date, ${data.partyName.trim()}, ${data.phone.trim()},
        ${data.gstin.trim()}, ${data.address.trim()}, ${data.notes.trim()}, ${payment}, ${status},
        ${data.refNumber.trim()}, ${againstId}, ${againstNumber},
        ${t.subtotal}, ${t.making}, ${t.discount}, ${t.gstRate}, ${t.gstAmount}, ${t.total}, ${context.userId}
      ) returning id`;
    const id = Number(inserted[0]?.id ?? 0);
    for (const l of lines) {
      await sql`
        insert into bill_lines (bill_id, sort_order, description, hsn, purity, qty, weight_g, rate, making, amount, product_id)
        values (
          ${id}, ${l.sortOrder}, ${l.description.trim()}, ${l.hsn}, ${l.purity},
          ${l.qty}, ${l.weightG}, ${Math.round(l.rate)}, ${Math.round(l.making)}, ${l.amount}, ${l.productId}
        )`;
    }
    if (data.kind === "return" && againstId) {
      await sql`update bills set status = 'Returned', updated_at = now() where id = ${againstId}`;
    }
    await applyBillStock(sql, {
      billId: id,
      kind: data.kind,
      number,
      userId: context.userId,
      lines,
    });
    return { ok: true as const, id, number };
  });

export const ownerCancelBill = createServerFn({ method: "POST" })
  .middleware([capMiddleware("bills")])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<BillRow>`select * from bills where id = ${data.id} limit 1`;
    const cur = rows[0];
    if (!cur) throw new Error("Bill not found.");
    if (cur.kind === "return") throw new Error("A credit note is not cancelled this way.");
    if (cur.status === "Cancelled") return { ok: true as const };
    await undoBillStock(sql, data.id);
    await sql`update bills set status = 'Cancelled', updated_at = now() where id = ${data.id}`;
    return { ok: true as const };
  });

export const ownerMostSold = createServerFn({ method: "GET" })
  .middleware([capMiddleware("bills")])
  .validator(z.object({ month: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const month = Boolean(data.month);
    const rows = month
      ? await sql<{
          name: string;
          sku: string | null;
          image_path: string | null;
          product_id: number | null;
          qty: number;
          amount: number;
          bills: number;
        }>`
          select
            coalesce(nullif(p.name, ''), l.description) as name,
            p.sku,
            p.image_path,
            l.product_id,
            coalesce(sum(l.qty), 0)::float as qty,
            coalesce(sum(l.amount), 0)::int as amount,
            count(distinct l.bill_id)::int as bills
          from bill_lines l
          join bills b on b.id = l.bill_id
          left join products p on p.id = l.product_id
          where b.kind = 'sale'
            and b.status not in ('Cancelled', 'Returned')
            and date_trunc('month', b.bill_date) = date_trunc('month', current_date)
          group by 1, 2, 3, 4
          order by amount desc, qty desc
          limit 24`
      : await sql<{
          name: string;
          sku: string | null;
          image_path: string | null;
          product_id: number | null;
          qty: number;
          amount: number;
          bills: number;
        }>`
          select
            coalesce(nullif(p.name, ''), l.description) as name,
            p.sku,
            p.image_path,
            l.product_id,
            coalesce(sum(l.qty), 0)::float as qty,
            coalesce(sum(l.amount), 0)::int as amount,
            count(distinct l.bill_id)::int as bills
          from bill_lines l
          join bills b on b.id = l.bill_id
          left join products p on p.id = l.product_id
          where b.kind = 'sale'
            and b.status not in ('Cancelled', 'Returned')
          group by 1, 2, 3, 4
          order by amount desc, qty desc
          limit 24`;
    return rows.map((r) => ({
      name: r.name,
      sku: r.sku ?? "",
      imagePath: r.image_path ?? "/images/ruby.jpg",
      productId: r.product_id == null ? null : Number(r.product_id),
      qty: Number(r.qty) || 0,
      amount: Number(r.amount) || 0,
      bills: Number(r.bills) || 0,
    }));
  });
