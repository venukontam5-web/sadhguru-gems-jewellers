import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";

export type SiteSettings = {
  gaId: string;
  adsId: string;
  adsLabel: string;
  gtmId: string;
  searchConsole: string;
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [row] = await sql<{
    ga_id: string;
    ads_id: string;
    ads_label: string;
    gtm_id: string;
    search_console: string;
  }>`select ga_id, ads_id, ads_label, gtm_id, search_console from shop_settings where id = 1`;
  return {
    gaId: row?.ga_id ?? "",
    adsId: row?.ads_id ?? "",
    adsLabel: row?.ads_label ?? "",
    gtmId: row?.gtm_id ?? "",
    searchConsole: row?.search_console ?? "",
  } satisfies SiteSettings;
});

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(
    z.object({
      gaId: z.string().max(40),
      adsId: z.string().max(40),
      adsLabel: z.string().max(80),
      gtmId: z.string().max(40),
      searchConsole: z.string().max(120),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      insert into shop_settings (id, ga_id, ads_id, ads_label, gtm_id, search_console, updated_at)
      values (1, ${data.gaId.trim()}, ${data.adsId.trim()}, ${data.adsLabel.trim()}, ${data.gtmId.trim()}, ${data.searchConsole.trim()}, now())
      on conflict (id) do update set
        ga_id = excluded.ga_id,
        ads_id = excluded.ads_id,
        ads_label = excluded.ads_label,
        gtm_id = excluded.gtm_id,
        search_console = excluded.search_console,
        updated_at = now()`;
    return { ok: true as const };
  });

export const listCategories = createServerFn({ method: "GET" })
  .middleware([capMiddleware("products")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      name: string;
      sort_order: number;
      active: boolean;
      n: number;
    }>`
      select c.id, c.name, c.sort_order, c.active,
        (select count(*)::int from products p where p.category = c.name) as n
      from shop_categories c
      order by c.sort_order, c.id`;
    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      sortOrder: Number(r.sort_order),
      active: Boolean(r.active),
      count: Number(r.n),
    }));
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([capMiddleware("products")])
  .validator(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1).max(40),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const name = data.name.trim();
    if (data.id) {
      await sql`update shop_categories set name = ${name}, active = ${data.active ?? true} where id = ${data.id}`;
    } else {
      await sql`insert into shop_categories (name, sort_order, active)
        values (${name}, 99, ${data.active ?? true})
        on conflict (name) do update set active = excluded.active`;
    }
    return { ok: true as const };
  });

export const listVendors = createServerFn({ method: "GET" })
  .middleware([capMiddleware("inventory")])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      name: string;
      phone: string;
      city: string;
      notes: string;
    }>`select id, name, phone, city, notes from shop_vendors order by id desc`;
    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      phone: r.phone,
      city: r.city,
      notes: r.notes,
    }));
  });

export const saveVendor = createServerFn({ method: "POST" })
  .middleware([capMiddleware("inventory")])
  .validator(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1).max(80),
      phone: z.string().max(40),
      city: z.string().max(60),
      notes: z.string().max(400),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (data.id) {
      await sql`update shop_vendors set name = ${data.name.trim()}, phone = ${data.phone.trim()}, city = ${data.city.trim()}, notes = ${data.notes.trim()} where id = ${data.id}`;
    } else {
      await sql`insert into shop_vendors (name, phone, city, notes) values (${data.name.trim()}, ${data.phone.trim()}, ${data.city.trim()}, ${data.notes.trim()})`;
    }
    return { ok: true as const };
  });

export const deleteVendor = createServerFn({ method: "POST" })
  .middleware([capMiddleware("inventory")])
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from shop_vendors where id = ${data.id}`;
    return { ok: true as const };
  });

export const getAstrologyCopy = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [row] = await sql<{ heading: string; lede: string; offer_note: string }>`
    select heading, lede, offer_note from shop_astrology where id = 1`;
  return {
    heading: row?.heading ?? "A rashi is a starting point, not a prescription.",
    lede:
      row?.lede ??
      "We will sit with a chart if you have one. We will not sell a blue sapphire in a hurry.",
    offerNote: row?.offer_note ?? "Ask for a reading at the counter. Tradition, not a medical claim.",
  };
});

export const saveAstrologyCopy = createServerFn({ method: "POST" })
  .middleware([capMiddleware("slides")])
  .validator(
    z.object({
      heading: z.string().min(1).max(160),
      lede: z.string().min(1).max(600),
      offerNote: z.string().max(240),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      insert into shop_astrology (id, heading, lede, offer_note, updated_at)
      values (1, ${data.heading.trim()}, ${data.lede.trim()}, ${data.offerNote.trim()}, now())
      on conflict (id) do update set
        heading = excluded.heading,
        lede = excluded.lede,
        offer_note = excluded.offer_note,
        updated_at = now()`;
    return { ok: true as const };
  });
