import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import { stockStatus, type InventorySummary, type StockKind, type StockMove, type StockRow } from "@/lib/inventory";
import { normalizeSku } from "@/lib/barcode";

type ProductInvRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price_inr: number;
  stock: number;
  image_path: string;
  active: boolean;
  sku: string;
  unit: string;
  weight_g: unknown;
  reorder_at: number;
  cost_inr: number;
  location: string;
};

type MoveRow = {
  id: number;
  product_id: number;
  kind: string;
  qty: unknown;
  weight_g: unknown;
  bill_id: number | null;
  bill_number: string;
  note: string;
  created_at: unknown;
  name?: string;
  sku?: string;
};

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asIso(v: unknown) {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? "");
}

function mapRow(r: ProductInvRow): StockRow {
  const stock = num(r.stock);
  const reorderAt = num(r.reorder_at);
  const priceInr = num(r.price_inr);
  const costInr = num(r.cost_inr);
  return {
    id: Number(r.id),
    slug: r.slug,
    name: r.name,
    category: r.category,
    sku: r.sku || `SGJ-${String(r.id).padStart(4, "0")}`,
    unit: r.unit || "pc",
    location: r.location || "Cabinet",
    stock,
    weightG: num(r.weight_g),
    reorderAt,
    costInr,
    priceInr,
    imagePath: r.image_path,
    active: Boolean(r.active),
    retailValue: stock * priceInr,
    costValue: stock * costInr,
    status: stockStatus(stock, reorderAt),
  };
}

function mapMove(r: MoveRow): StockMove {
  return {
    id: Number(r.id),
    productId: Number(r.product_id),
    productName: r.name ?? "",
    sku: r.sku ?? "",
    kind: (r.kind as StockKind) || "adjust",
    qty: num(r.qty),
    weightG: num(r.weight_g),
    billId: r.bill_id == null ? null : Number(r.bill_id),
    billNumber: r.bill_number ?? "",
    note: r.note ?? "",
    createdAt: asIso(r.created_at),
  };
}

export async function recordStockMove(
  sql: Sql,
  move: {
    productId: number;
    kind: StockKind;
    qty: number;
    weightG?: number;
    billId?: number | null;
    billNumber?: string;
    note?: string;
    userId?: string;
    costInr?: number;
    apply?: boolean;
  },
) {
  const qty = Math.round(move.qty);
  const weight = num(move.weightG);
  if (qty === 0 && weight === 0) return;
  if (move.apply !== false) {
    const rows = await sql<{ stock: number; weight_g: unknown }>`
      select stock, weight_g from products where id = ${move.productId} limit 1`;
    const cur = rows[0];
    if (!cur) return;
    const nextStock = Math.max(0, num(cur.stock) + qty);
    const nextWeight = Math.max(0, num(cur.weight_g) + weight);
    if (move.costInr != null && move.costInr > 0) {
      await sql`
        update products set
          stock = ${nextStock},
          weight_g = ${nextWeight},
          cost_inr = ${Math.round(move.costInr)}
        where id = ${move.productId}`;
    } else {
      await sql`
        update products set stock = ${nextStock}, weight_g = ${nextWeight}
        where id = ${move.productId}`;
    }
  } else if (move.costInr != null && move.costInr > 0) {
    await sql`update products set cost_inr = ${Math.round(move.costInr)} where id = ${move.productId}`;
  }
  await sql`
    insert into stock_moves (product_id, kind, qty, weight_g, bill_id, bill_number, note, created_by)
    values (
      ${move.productId}, ${move.kind}, ${qty}, ${weight},
      ${move.billId ?? null}, ${move.billNumber ?? ""}, ${move.note ?? ""}, ${move.userId ?? null}
    )`;
}

async function findProductId(sql: Sql, productId: number | null | undefined, description: string) {
  if (productId) {
    const rows = await sql<{ id: number }>`select id from products where id = ${productId} limit 1`;
    if (rows[0]) return Number(rows[0].id);
  }
  const name = description.trim();
  if (!name) return null;
  const rows = await sql<{ id: number }>`
    select id from products where lower(name) = ${name.toLowerCase()} limit 1`;
  return rows[0] ? Number(rows[0].id) : null;
}

export async function undoBillStock(sql: Sql, billId: number) {
  const moves = await sql<MoveRow>`select * from stock_moves where bill_id = ${billId}`;
  if (!moves.length) return false;
  for (const m of moves) {
    const rows = await sql<{ stock: number; weight_g: unknown }>`
      select stock, weight_g from products where id = ${Number(m.product_id)} limit 1`;
    const cur = rows[0];
    if (!cur) continue;
    const nextStock = Math.max(0, num(cur.stock) - num(m.qty));
    const nextWeight = Math.max(0, num(cur.weight_g) - num(m.weight_g));
    await sql`
      update products set stock = ${nextStock}, weight_g = ${nextWeight}
      where id = ${Number(m.product_id)}`;
  }
  await sql`delete from stock_moves where bill_id = ${billId}`;
  return true;
}

export async function applyBillStock(
  sql: Sql,
  args: {
    billId: number;
    kind: "sale" | "purchase" | "return" | "stock" | "repair" | "expense";
    number: string;
    userId?: string;
    replace?: boolean;
    lines: {
      productId?: number | null;
      description: string;
      qty: number;
      weightG: number;
      rate: number;
    }[];
  },
) {
  if (args.replace) await undoBillStock(sql, args.billId);
  if (args.kind === "repair" || args.kind === "expense") return;
  const sign = args.kind === "sale" ? -1 : 1;
  const kind: StockKind =
    args.kind === "sale" ? "sale" : args.kind === "return" ? "return" : args.kind === "stock" ? "opening" : "purchase";
  for (const line of args.lines) {
    const productId = await findProductId(sql, line.productId, line.description);
    if (!productId) continue;
    const pieces = Math.max(1, Math.round(line.qty || 1));
    await recordStockMove(sql, {
      productId,
      kind,
      qty: sign * pieces,
      weightG: sign * num(line.weightG),
      billId: args.billId,
      billNumber: args.number,
      note: line.description,
      userId: args.userId,
      costInr: args.kind === "purchase" ? Math.round(line.rate) : undefined,
    });
  }
}

export const ownerInventorySummary = createServerFn({ method: "GET" })
  .middleware([capMiddleware("inventory")])
  .handler(async () => {
    const sql = await getSql();
    const products = (await sql<ProductInvRow>`select * from products order by category, name`).map(mapRow);
    const recentRows = await sql<MoveRow>`
      select m.*, p.name, p.sku
      from stock_moves m
      join products p on p.id = m.product_id
      order by m.id desc
      limit 8`;
    const byMap = new Map<string, { category: string; pieces: number; retailValue: number; lowCount: number }>();
    for (const p of products) {
      const cur = byMap.get(p.category) ?? { category: p.category, pieces: 0, retailValue: 0, lowCount: 0 };
      cur.pieces += p.stock;
      cur.retailValue += p.retailValue;
      if (p.status !== "ok") cur.lowCount += 1;
      byMap.set(p.category, cur);
    }
    const low = products.filter((p) => p.status !== "ok");
    return {
      skus: products.length,
      pieces: products.reduce((s, p) => s + p.stock, 0),
      retailValue: products.reduce((s, p) => s + p.retailValue, 0),
      costValue: products.reduce((s, p) => s + p.costValue, 0),
      lowCount: products.filter((p) => p.status === "low").length,
      outCount: products.filter((p) => p.status === "out").length,
      byCategory: [...byMap.values()],
      low: low.slice(0, 8),
      recent: recentRows.map(mapMove),
    } satisfies InventorySummary;
  });

export const ownerListStock = createServerFn({ method: "GET" })
  .middleware([capMiddleware("inventory")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<ProductInvRow>`select * from products order by category, name`;
    return rows.map(mapRow);
  });

export const ownerListStockMoves = createServerFn({ method: "GET" })
  .middleware([capMiddleware("inventory")])
  .validator(z.object({ productId: z.number().optional(), kind: z.string().optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const productId = data.productId ?? null;
    const kind = data.kind && data.kind !== "all" ? data.kind : null;
    const rows = productId && kind
      ? await sql<MoveRow>`
          select m.*, p.name, p.sku from stock_moves m
          join products p on p.id = m.product_id
          where m.product_id = ${productId} and m.kind = ${kind}
          order by m.id desc limit 200`
      : productId
        ? await sql<MoveRow>`
            select m.*, p.name, p.sku from stock_moves m
            join products p on p.id = m.product_id
            where m.product_id = ${productId}
            order by m.id desc limit 200`
        : kind
          ? await sql<MoveRow>`
              select m.*, p.name, p.sku from stock_moves m
              join products p on p.id = m.product_id
              where m.kind = ${kind}
              order by m.id desc limit 200`
          : await sql<MoveRow>`
              select m.*, p.name, p.sku from stock_moves m
              join products p on p.id = m.product_id
              order by m.id desc limit 200`;
    return rows.map(mapMove);
  });

export const ownerAdjustStock = createServerFn({ method: "POST" })
  .middleware([capMiddleware("inventory")])
  .validator(
    z.object({
      productId: z.number(),
      qtyDelta: z.number(),
      weightDelta: z.number().optional(),
      location: z.string().max(40).optional(),
      reorderAt: z.number().int().min(0).optional(),
      costInr: z.number().min(0).optional(),
      note: z.string().max(200).optional(),
      kind: z.enum(["adjust", "opening", "karigar"]).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    if (data.location != null || data.reorderAt != null || data.costInr != null) {
      const loc = data.location ?? null;
      const reorder = data.reorderAt ?? null;
      const cost = data.costInr ?? null;
      if (loc != null) await sql`update products set location = ${loc} where id = ${data.productId}`;
      if (reorder != null) await sql`update products set reorder_at = ${reorder} where id = ${data.productId}`;
      if (cost != null) await sql`update products set cost_inr = ${Math.round(cost)} where id = ${data.productId}`;
    }
    const kind: StockKind = data.kind === "karigar" ? "karigar" : data.kind === "opening" ? "opening" : "adjust";
    await recordStockMove(sql, {
      productId: data.productId,
      kind,
      qty: Math.round(data.qtyDelta),
      weightG: data.weightDelta ?? 0,
      note: data.note || "Count correction",
      userId: context.userId,
    });
    return { ok: true as const };
  });

export const ownerLookupSku = createServerFn({ method: "GET" })
  .middleware([capMiddleware("inventory")])
  .validator(z.object({ sku: z.string().min(1).max(40) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const raw = data.sku.trim();
    const hyphenated = normalizeSku(raw);
    const upper = raw.toUpperCase().replace(/\s+/g, "");
    const digits = upper.replace(/\D/g, "");
    const compact = hyphenated.replace(/-/g, "");
    const slug = raw.toLowerCase();
    const rows = await sql<ProductInvRow>`
      select * from products
      where upper(sku) = ${hyphenated}
         or replace(upper(sku), '-', '') = ${compact}
         or lower(slug) = ${slug}
         or id::text = ${digits || raw}
      limit 1`;
    return rows[0] ? mapRow(rows[0]) : null;
  });

