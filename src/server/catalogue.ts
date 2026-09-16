import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import type { ShopEnquiry, ShopOrder, ShopProduct, ShopSlide, ShopVisit } from "@/lib/shop";
import { recordStockMove } from "@/server/stock";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price_inr: number;
  compare_at: number | null;
  stock: number;
  image_path: string;
  badge: string;
  active: boolean;
  description: string;
  sku?: string;
  unit?: string;
  weight_g?: unknown;
  reorder_at?: number;
  cost_inr?: number;
  location?: string;
  vendor_id?: number | null;
  vendor_name?: string;
  gallery?: string;
};

type SlideRow = {
  id: number;
  kicker: string;
  title: string;
  image_path: string;
  link: string;
  sort_order: number;
  active: boolean;
  kind?: string;
  media_type?: string;
  video_path?: string;
};

function mapVisit(r: {
  id: number;
  path: string;
  country?: string;
  name?: string;
  requirement?: string;
  place?: string;
  contact?: string;
  email?: string;
  created_at: unknown;
}): ShopVisit {
  return {
    id: Number(r.id),
    path: r.path,
    country: r.country ?? "",
    name: r.name ?? "",
    requirement: r.requirement || r.path,
    place: r.place || r.country || "",
    contact: r.contact ?? "",
    email: r.email ?? "",
    createdAt: asIso(r.created_at),
  };
}

function parseGallery(raw: unknown, cover: string): string[] {
  let extra: string[] = [];
  if (Array.isArray(raw)) {
    extra = raw.filter((x): x is string => typeof x === "string" && x.length > 0);
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) extra = parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
    } catch {
      extra = [];
    }
  }
  const all = [cover, ...extra].filter(Boolean);
  return [...new Set(all)].slice(0, 5);
}

function galleryJson(paths: string[] | undefined, cover: string) {
  return JSON.stringify(parseGallery(paths ?? [], cover));
}

function mapProduct(r: ProductRow): ShopProduct {
  const images = parseGallery(r.gallery, r.image_path);
  return {
    id: Number(r.id),
    slug: r.slug,
    name: r.name,
    category: r.category,
    priceInr: Number(r.price_inr),
    compareAt: r.compare_at == null ? null : Number(r.compare_at),
    stock: Number(r.stock),
    imagePath: images[0] || r.image_path,
    images,
    badge: r.badge ?? "",
    active: Boolean(r.active),
    description: r.description ?? "",
    sku: r.sku ?? "",
    unit: r.unit ?? "pc",
    weightG: Number(r.weight_g ?? 0),
    reorderAt: Number(r.reorder_at ?? 2),
    costInr: Number(r.cost_inr ?? 0),
    location: r.location ?? "Cabinet",
    vendorId: r.vendor_id == null ? null : Number(r.vendor_id),
    vendorName: r.vendor_name ?? "",
  };
}

function mapSlide(r: SlideRow): ShopSlide {
  const kind = r.kind === "poster" || r.kind === "video" ? r.kind : "story";
  const mediaType =
    r.media_type === "video" || r.media_type === "youtube" ? r.media_type : "image";
  return {
    id: Number(r.id),
    kicker: r.kicker,
    title: r.title,
    imagePath: r.image_path,
    link: r.link,
    sortOrder: Number(r.sort_order),
    active: Boolean(r.active),
    kind,
    mediaType,
    videoPath: r.video_path ?? "",
  };
}

function asIso(v: unknown) {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? "");
}

export const listActiveProducts = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const category = data.category && data.category !== "all" ? data.category : null;
    const rows = category
      ? await sql<ProductRow>`
          select * from products
          where active = true and category = ${category}
          order by id asc`
      : await sql<ProductRow>`
          select * from products
          where active = true
          order by id asc`;
    return rows.map(mapProduct);
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      select * from products where slug = ${data.slug} and active = true limit 1`;
    return rows[0] ? mapProduct(rows[0]) : null;
  });

export const listActiveSlides = createServerFn({ method: "GET" })
  .validator(z.object({ kind: z.enum(["poster", "video", "story"]).optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const kind = data.kind ?? null;
    const rows = kind
      ? await sql<SlideRow>`
          select * from slides
          where active = true and kind = ${kind}
          order by sort_order asc, id asc`
      : await sql<SlideRow>`
          select * from slides
          where active = true
          order by sort_order asc, id asc`;
    return rows.map(mapSlide);
  });

export const logVisit = createServerFn({ method: "POST" })
  .validator(
    z.object({
      path: z.string().max(200),
      country: z.string().max(80),
      requirement: z.string().max(120).optional(),
      place: z.string().max(120).optional(),
      name: z.string().max(80).optional(),
      contact: z.string().max(20).optional(),
      email: z.string().max(120).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const path = data.path.startsWith("/") ? data.path.slice(0, 200) : "/";
    await sql`
      insert into visitors (path, country, requirement, place, name, contact, email)
      values (
        ${path},
        ${data.country.slice(0, 80)},
        ${(data.requirement || "").slice(0, 120)},
        ${(data.place || data.country || "").slice(0, 120)},
        ${(data.name || "").slice(0, 80)},
        ${(data.contact || "").slice(0, 20)},
        ${(data.email || "").slice(0, 120)}
      )`;
    return { ok: true as const };
  });

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(80),
      phone: z.string().min(6).max(20),
      email: z.string().max(120).optional(),
      subject: z.string().max(80),
      message: z.string().min(1).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      insert into enquiries (name, phone, email, subject, message)
      values (
        ${data.name.trim()},
        ${data.phone.trim()},
        ${data.email?.trim() ?? ""},
        ${data.subject.trim() || "General"},
        ${data.message.trim()}
      )`;
    await sql`
      insert into visitors (path, country, requirement, place, name, contact, email)
      values (
        '/enquire',
        'India',
        ${data.subject.trim() || "Enquiry"},
        'India',
        ${data.name.trim()},
        ${data.phone.trim()},
        ${data.email?.trim() ?? ""}
      )`;
    return { ok: true as const };
  });

export const getOrderByCode = createServerFn({ method: "GET" })
  .validator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<{
      id: number;
      code: string;
      customer_name: string;
      phone: string;
      item: string;
      status: string;
      created_at: unknown;
    }>`select * from orders where code = ${code} limit 1`;
    const r = rows[0];
    if (!r) return null;
    return {
      id: Number(r.id),
      code: r.code,
      customerName: r.customer_name,
      phone: r.phone,
      email: "",
      item: r.item,
      status: r.status,
      address: "",
      city: "",
      pincode: "",
      payment: "",
      paymentStatus: "",
      amount: 0,
      satisfied: "",
      feedback: "",
      createdAt: asIso(r.created_at),
    } satisfies ShopOrder;
  });

export const ownerDashboard = createServerFn({ method: "GET" })
  .middleware([capMiddleware("desk")])
  .handler(async () => {
    const sql = await getSql();
    const [products] = await sql<{ n: number }>`select count(*)::int as n from products where active = true`;
    const [slides] = await sql<{ n: number }>`select count(*)::int as n from slides where active = true`;
    const [enquiries] = await sql<{ n: number }>`select count(*)::int as n from enquiries`;
    const [visits] = await sql<{ n: number }>`select count(*)::int as n from visitors`;
    const [orders] = await sql<{ n: number }>`select count(*)::int as n from orders`;
    const recent = await sql<{
      id: number;
      name: string;
      subject: string;
      status: string;
      created_at: unknown;
    }>`select id, name, subject, status, created_at from enquiries order by id desc limit 6`;
    const slideRows = await sql<SlideRow>`select * from slides order by sort_order, id`;
    const recentVisits = await sql<{
      id: number;
      path: string;
      country: string;
      name: string;
      requirement: string;
      place: string;
      contact: string;
      email: string;
      created_at: unknown;
    }>`select * from visitors order by id desc limit 8`;
    const places = await sql<{ country: string; n: number }>`
      select coalesce(nullif(place, ''), nullif(country, ''), 'Unknown') as country, count(*)::int as n
      from visitors group by 1 order by n desc limit 8`;
    return {
      products: Number(products?.n ?? 0),
      slides: Number(slides?.n ?? 0),
      enquiries: Number(enquiries?.n ?? 0),
      visits: Number(visits?.n ?? 0),
      orders: Number(orders?.n ?? 0),
      recentEnquiries: recent.map((r) => ({
        id: Number(r.id),
        name: r.name,
        subject: r.subject,
        status: r.status,
        createdAt: asIso(r.created_at),
      })),
      slideList: slideRows.map(mapSlide),
      places: places.map((p) => ({ country: p.country, count: Number(p.n) })),
      recentVisits: recentVisits.map(mapVisit),
    };
  });

export const ownerListProducts = createServerFn({ method: "GET" })
  .middleware([capMiddleware("products")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      select p.*, v.name as vendor_name
      from products p
      left join shop_vendors v on v.id = p.vendor_id
      order by p.id desc`;
    return rows.map(mapProduct);
  });

function tidySlug(raw: string, fallback: string) {
  const s = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return s || fallback;
}

async function uniqueProductSlug(sql: Awaited<ReturnType<typeof getSql>>, wanted: string, exceptId?: number) {
  const base = tidySlug(wanted, `piece-${Date.now().toString(36)}`);
  for (let i = 0; i < 30; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const rows = exceptId
      ? await sql<{ id: number }>`select id from products where slug = ${slug} and id <> ${exceptId} limit 1`
      : await sql<{ id: number }>`select id from products where slug = ${slug} limit 1`;
    if (!rows[0]) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

function trayFor(category: string) {
  if (category === "Gemstones") return "Navratna tray";
  if (category === "Crystal") return "Crystal cabinet";
  if (category === "Mala" || category === "Pearls-Beads") return "Mala drawer";
  if (category === "Brass") return "Brass shelf";
  if (category === "Copper") return "Copper shelf";
  return "Cabinet";
}

const productInput = z.object({
  id: z.number().optional(),
  slug: z.string().max(80).optional(),
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(40),
  priceInr: z.number().min(0),
  compareAt: z.number().min(0).nullable(),
  stock: z.number().int().min(0),
  imagePath: z.string().min(1).max(240),
  gallery: z.array(z.string().max(240)).max(5).optional(),
  badge: z.string().max(40),
  active: z.boolean(),
  description: z.string().max(2000),
  vendorId: z.number().int().positive().nullable().optional(),
});

export const ownerSaveProduct = createServerFn({ method: "POST" })
  .middleware([capMiddleware("products")])
  .validator(productInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql.query(`alter table products add column if not exists gallery text not null default '[]'`);
    const slug = await uniqueProductSlug(sql, data.slug || data.name, data.id);
    const unit = data.category === "Gemstones" ? "ct" : "pc";
    const location = trayFor(data.category);
    const vendorId = data.vendorId ?? null;
    const cover = data.imagePath;
    const gallery = galleryJson(data.gallery, cover);
    if (data.id) {
      const prev = await sql<{ stock: number }>`select stock from products where id = ${data.id} limit 1`;
      if (!prev[0]) throw new Error("That piece is no longer in the book.");
      await sql`
        update products set
          slug = ${slug},
          name = ${data.name.trim()},
          category = ${data.category},
          price_inr = ${data.priceInr},
          compare_at = ${data.compareAt},
          stock = ${data.stock},
          image_path = ${cover},
          gallery = ${gallery},
          badge = ${data.badge},
          active = ${data.active},
          description = ${data.description},
          unit = ${unit},
          location = ${location},
          vendor_id = ${vendorId},
          updated_by = ${context.userId}
        where id = ${data.id}`;
      const before = Number(prev[0]?.stock ?? data.stock);
      if (before !== data.stock) {
        await recordStockMove(sql, {
          productId: data.id,
          kind: "adjust",
          qty: data.stock - before,
          note: "Catalogue stock edit",
          userId: context.userId,
          apply: false,
        });
      }
      return { ok: true as const, id: data.id, slug };
    }
    const inserted = await sql<{ id: number }>`
      insert into products (
        slug, name, category, price_inr, compare_at, stock, image_path,
        badge, active, description, updated_by, unit, location, vendor_id, gallery
      )
      values (
        ${slug}, ${data.name.trim()}, ${data.category}, ${data.priceInr}, ${data.compareAt},
        ${data.stock}, ${cover}, ${data.badge}, ${data.active}, ${data.description},
        ${context.userId}, ${unit}, ${location}, ${vendorId}, ${gallery}
      )
      returning id`;
    const id = Number(inserted[0]?.id ?? 0);
    if (!id) throw new Error("The piece did not save.");
    const sku = `SGJ-${String(id).padStart(4, "0")}`;
    await sql`update products set sku = ${sku} where id = ${id}`;
    if (data.stock > 0) {
      await recordStockMove(sql, {
        productId: id,
        kind: "opening",
        qty: data.stock,
        note: "Opening stock",
        userId: context.userId,
        apply: false,
      });
    }
    return { ok: true as const, id, slug };
  });

export const ownerDeleteProduct = createServerFn({ method: "POST" })
  .middleware([capMiddleware("products")])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from products where id = ${data.id}`;
    return { ok: true as const };
  });

export const ownerListSlides = createServerFn({ method: "GET" })
  .middleware([capMiddleware("slides")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<SlideRow>`select * from slides order by sort_order, id`;
    return rows.map(mapSlide);
  });

export const ownerSaveSlide = createServerFn({ method: "POST" })
  .middleware([capMiddleware("slides")])
  .validator(
    z.object({
      id: z.number().optional(),
      kind: z.enum(["poster", "video", "story"]),
      kicker: z.string().max(40),
      title: z.string().min(1).max(80),
      imagePath: z.string().min(1).max(500),
      videoPath: z.string().max(500).optional(),
      mediaType: z.enum(["image", "video", "youtube"]),
      link: z.string().max(200),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const video = data.videoPath ?? "";
    const active = data.active ?? true;
    if (data.id) {
      await sql`
        update slides set
          kind = ${data.kind},
          kicker = ${data.kicker},
          title = ${data.title},
          image_path = ${data.imagePath},
          video_path = ${video},
          media_type = ${data.mediaType},
          link = ${data.link},
          active = ${active}
        where id = ${data.id}`;
      return { ok: true as const };
    }
    const [{ n }] = await sql<{ n: number }>`
      select coalesce(max(sort_order), 0)::int + 1 as n from slides where kind = ${data.kind}`;
    await sql`
      insert into slides (kicker, title, image_path, link, sort_order, kind, media_type, video_path, active)
      values (
        ${data.kicker},
        ${data.title},
        ${data.imagePath},
        ${data.link || "/shop"},
        ${n},
        ${data.kind},
        ${data.mediaType},
        ${video},
        ${active}
      )`;
    return { ok: true as const };
  });

export const ownerDeleteSlide = createServerFn({ method: "POST" })
  .middleware([capMiddleware("slides")])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from slides where id = ${data.id}`;
    return { ok: true as const };
  });

export const ownerListEnquiries = createServerFn({ method: "GET" })
  .middleware([capMiddleware("enquiries")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      name: string;
      phone: string;
      email: string;
      subject: string;
      message: string;
      status: string;
      created_at: unknown;
    }>`select * from enquiries order by id desc`;
    return rows.map(
      (r): ShopEnquiry => ({
        id: Number(r.id),
        name: r.name,
        phone: r.phone,
        email: r.email,
        subject: r.subject,
        message: r.message,
        status: r.status,
        createdAt: asIso(r.created_at),
      }),
    );
  });

export const ownerSetEnquiryStatus = createServerFn({ method: "POST" })
  .middleware([capMiddleware("enquiries")])
  .validator(z.object({ id: z.number(), status: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update enquiries set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

export const ownerListVisitors = createServerFn({ method: "GET" })
  .middleware([capMiddleware("visitors")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      path: string;
      country: string;
      name?: string;
      requirement?: string;
      place?: string;
      contact?: string;
      email?: string;
      created_at: unknown;
    }>`select * from visitors order by id desc limit 200`;
    return rows.map(mapVisit);
  });

export const ownerListOrders = createServerFn({ method: "GET" })
  .middleware([capMiddleware("orders")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      code: string;
      customer_name: string;
      phone: string;
      item: string;
      status: string;
      created_at: unknown;
    }>`select * from orders order by id desc`;
    return rows.map(
      (r): ShopOrder => ({
        id: Number(r.id),
        code: r.code,
        customerName: r.customer_name,
        phone: r.phone,
        email: "",
        item: r.item,
        status: r.status,
        address: "",
        city: "",
        pincode: "",
        payment: "",
        paymentStatus: "",
        amount: 0,
        satisfied: "",
        feedback: "",
        createdAt: asIso(r.created_at),
      }),
    );
  });

export const ownerSaveOrder = createServerFn({ method: "POST" })
  .middleware([capMiddleware("orders")])
  .validator(
    z.object({
      customerName: z.string().min(1).max(80),
      phone: z.string().max(20),
      item: z.string().min(1).max(120),
      status: z.string().max(20),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [{ n }] = await sql<{ n: number }>`select coalesce(max(id), 1800)::int + 42 as n from orders`;
    const code = `SGJ-${n}`;
    await sql`
      insert into orders (code, customer_name, phone, item, status)
      values (${code}, ${data.customerName}, ${data.phone}, ${data.item}, ${data.status || "New"})`;
    return { ok: true as const, code };
  });

export const ownerSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([capMiddleware("orders")])
  .validator(z.object({ id: z.number(), status: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update orders set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });
