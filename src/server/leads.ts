import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import { LEAD_SOURCES, LEAD_STATUSES, leadHeat, type SalesLead } from "@/lib/leads";

type Row = {
  id: number;
  name: string;
  source: string;
  handle: string;
  phone: string;
  email: string;
  interest: string;
  place: string;
  notes: string;
  status: string;
  next_at: unknown;
  last_reached_at: unknown;
  source_key: string;
  created_at: unknown;
};

function asIso(v: unknown) {
  if (v instanceof Date) return v.toISOString();
  return v ? String(v) : null;
}

function asDay(v: unknown) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

function mapLead(r: Row): SalesLead {
  return {
    id: Number(r.id),
    name: r.name ?? "",
    source: r.source ?? "website",
    handle: r.handle ?? "",
    phone: r.phone ?? "",
    email: r.email ?? "",
    interest: r.interest ?? "Gemstones",
    place: r.place ?? "",
    notes: r.notes ?? "",
    status: r.status ?? "New",
    nextAt: asDay(r.next_at),
    lastReachedAt: asIso(r.last_reached_at),
    sourceKey: r.source_key,
    createdAt: asIso(r.created_at) ?? "",
    heat: leadHeat(r),
  };
}

async function ensureLeadsTable() {
  const sql = await getSql();
  await sql.query(`
    create table if not exists sales_leads (
      id serial primary key,
      name text not null default '',
      source text not null default 'website',
      handle text not null default '',
      phone text not null default '',
      email text not null default '',
      interest text not null default 'Gemstones',
      place text not null default '',
      notes text not null default '',
      status text not null default 'New',
      next_at date,
      last_reached_at timestamptz,
      source_key text not null unique,
      created_at timestamptz not null default now()
    )`);
  return sql;
}

export const ownerListLeads = createServerFn({ method: "GET" })
  .middleware([capMiddleware("enquiries")])
  .handler(async () => {
    const sql = await ensureLeadsTable();
    const rows = await sql<Row>`select * from sales_leads order by id desc limit 400`;
    return rows.map(mapLead);
  });

export const ownerCollectLeads = createServerFn({ method: "POST" })
  .middleware([capMiddleware("enquiries")])
  .handler(async () => {
    const sql = await ensureLeadsTable();
    await sql.query(`
      insert into sales_leads (name, source, phone, email, interest, place, status, next_at, source_key)
      select
        coalesce(nullif(name, ''), 'Visitor'),
        'website',
        coalesce(contact, ''),
        coalesce(email, ''),
        coalesce(nullif(requirement, ''), path, 'Gemstones'),
        coalesce(nullif(place, ''), country, ''),
        'New',
        (current_date + 1),
        'visit:' || id::text
      from visitors
      where coalesce(contact, '') <> '' or coalesce(email, '') <> ''
      on conflict (source_key) do update set
        phone = excluded.phone,
        email = excluded.email,
        interest = excluded.interest,
        place = excluded.place`);
    await sql.query(`
      insert into sales_leads (name, source, phone, email, interest, notes, status, next_at, source_key)
      select
        name,
        'enquiry',
        phone,
        coalesce(email, ''),
        coalesce(nullif(subject, ''), 'Gemstones'),
        coalesce(message, ''),
        case when status = 'Closed' then 'Closed' when status = 'Replied' then 'Reached' else 'New' end,
        (current_date + 1),
        'enquiry:' || id::text
      from enquiries
      where coalesce(phone, '') <> '' or coalesce(email, '') <> ''
      on conflict (source_key) do update set
        phone = excluded.phone,
        email = excluded.email,
        interest = excluded.interest,
        notes = excluded.notes`);
    const [n] = await sql<{ n: number }>`select count(*)::int as n from sales_leads`;
    return { ok: true as const, count: Number(n?.n ?? 0) };
  });

export const ownerSaveLead = createServerFn({ method: "POST" })
  .middleware([capMiddleware("enquiries")])
  .validator(
    z.object({
      name: z.string().max(80),
      source: z.enum(LEAD_SOURCES),
      handle: z.string().max(80).optional(),
      phone: z.string().max(20),
      email: z.string().max(120),
      interest: z.string().max(80),
      place: z.string().max(80).optional(),
      notes: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await ensureLeadsTable();
    const phone = data.phone.replace(/\s/g, "");
    const email = data.email.trim().toLowerCase();
    if (!phone && !email) throw new Error("Need a WhatsApp number or a mail ID — given by the person.");
    const key = phone ? `manual:p:${phone}` : `manual:e:${email}`;
    await sql`
      insert into sales_leads (
        name, source, handle, phone, email, interest, place, notes, status, next_at, source_key
      )
      values (
        ${data.name.trim() || "Lead"},
        ${data.source},
        ${data.handle?.trim() ?? ""},
        ${phone},
        ${email},
        ${data.interest.trim() || "Gemstones"},
        ${data.place?.trim() ?? ""},
        ${data.notes?.trim() ?? ""},
        'New',
        ${new Date().toISOString().slice(0, 10)},
        ${key}
      )
      on conflict (source_key) do update set
        name = excluded.name,
        handle = excluded.handle,
        interest = excluded.interest,
        notes = excluded.notes`;
    return { ok: true as const };
  });

export const ownerSetLead = createServerFn({ method: "POST" })
  .middleware([capMiddleware("enquiries")])
  .validator(
    z.object({
      id: z.number().int().positive(),
      status: z.enum(LEAD_STATUSES),
      nextAt: z.string().max(12).nullable().optional(),
      notes: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await ensureLeadsTable();
    const next =
      data.nextAt ??
      (data.status === "Closed"
        ? null
        : new Date(Date.now() + (data.status === "Reached" ? 3 : 1) * 86400000).toISOString().slice(0, 10));
    await sql`
      update sales_leads set
        status = ${data.status},
        next_at = ${next},
        notes = coalesce(${data.notes ?? null}, notes),
        last_reached_at = case when ${data.status} = 'Reached' then now() else last_reached_at end
      where id = ${data.id}`;
    return { ok: true as const };
  });
