import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { isStaffEmail, SEED_STAFF_EMAILS } from "@/data/staff";
import {
  hasCap,
  isDeskRole,
  type DeskCap,
  type DeskRole,
} from "@/lib/rbac";

export type DeskProfile = { email: string; role: DeskRole; name: string };

function forbidden(message = "Forbidden") {
  const err = new Error(message);
  (err as Error & { status: number }).status = 403;
  return err;
}

export async function deskProfile(sql: Sql, userId: string): Promise<DeskProfile | null> {
  if (userId === "dev-user") {
    return { email: "dev@example.com", role: "owner", name: "Dev" };
  }
  const users = await sql<{ email: string | null; name: string | null }>`
    select email, name from "user" where id = ${userId} limit 1`;
  const email = users[0]?.email?.trim().toLowerCase() ?? "";
  if (!email) return null;
  const rows = await sql<{ email: string; name: string; role: string }>`
    select email, name, role from staff_members where lower(email) = ${email} limit 1`;
  const row = rows[0];
  if (row) {
    return {
      email: row.email,
      name: row.name,
      role: isDeskRole(row.role) ? row.role : "viewer",
    };
  }
  if (!isStaffEmail(email)) return null;
  const role: DeskRole = SEED_STAFF_EMAILS.includes(email) ? "owner" : "viewer";
  await sql`
    insert into staff_members (email, name, role)
    values (${email}, ${users[0]?.name ?? ""}, ${role})
    on conflict (email) do nothing`;
  return { email, name: users[0]?.name ?? "", role };
}

/** House team only. Attaches email + role. Customers are rejected. */
export const staffMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const sql = await getSql();
    const profile = await deskProfile(sql, context.userId);
    if (!profile) throw forbidden();
    return next({ context: { ...context, email: profile.email, role: profile.role } });
  });

export function capMiddleware(cap: DeskCap) {
  return createMiddleware({ type: "function" })
    .middleware([staffMiddleware])
    .server(async ({ next, context }) => {
      const role = (context as { role?: DeskRole }).role;
      if (!hasCap(role, cap)) throw forbidden("This key is not on your ring.");
      return next();
    });
}

export const resolveStaffDoor = createServerFn({ method: "POST" })
  .validator(z.object({ key: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    const raw = data.key.trim();
    const sql = await getSql();
    if (raw.includes("@")) {
      const email = raw.toLowerCase();
      if (isStaffEmail(email)) return { ok: true as const, email };
      const rows = await sql<{ email: string }>`
        select email from staff_members where lower(email) = ${email} limit 1`;
      return rows[0]?.email
        ? { ok: true as const, email: rows[0].email.toLowerCase() }
        : { ok: false as const, email: null };
    }
    const id = raw.toUpperCase().startsWith("SGJ-")
      ? raw.toUpperCase()
      : raw.toUpperCase().startsWith("SGJ")
        ? raw.toUpperCase().replace(/^SGJ/, "SGJ-")
        : `SGJ-${raw.replace(/^0+/, "") || raw}`.replace(/SGJ-SGJ-/, "SGJ-");
    const padded = id.match(/^SGJ-(\d+)$/)
      ? `SGJ-${String(id.replace("SGJ-", "")).padStart(2, "0")}`
      : id;
    const rows = await sql<{ email: string }>`
      select email from staff_members
      where lower(login_id) = ${padded.toLowerCase()}
         or lower(login_id) = ${id.toLowerCase()}
         or lower(login_id) = ${raw.toLowerCase()}
      limit 1`;
    return rows[0]?.email
      ? { ok: true as const, email: rows[0].email.toLowerCase() }
      : { ok: false as const, email: null };
  });

export const getDeskAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await deskProfile(sql, context.userId);
    if (!profile) return { staff: false as const, role: null, email: null };
    return { staff: true as const, role: profile.role, email: profile.email };
  });

export const amIStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return Boolean(await deskProfile(sql, context.userId));
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{ email: string; name: string; role: string; login_id: string | null }>`
      select email, name, role, login_id from staff_members order by
        case role when 'owner' then 0 when 'counter' then 1 when 'cabinet' then 2 when 'shop' then 3 else 4 end,
        email`;
    return rows.map((r) => ({
      email: r.email,
      name: r.name,
      loginId: r.login_id || "",
      role: (isDeskRole(r.role) ? r.role : "viewer") as DeskRole,
    }));
  });

const memberInput = z.object({
  email: z.string().email().max(120),
  name: z.string().max(80).optional(),
  role: z.enum(["owner", "counter", "cabinet", "shop", "viewer"]).optional(),
});

async function ownerCount(sql: Sql) {
  const [row] = await sql<{ n: number }>`
    select count(*)::int as n from staff_members where role = 'owner'`;
  return Number(row?.n ?? 0);
}

export const addStaff = createServerFn({ method: "POST" })
  .middleware([capMiddleware("team")])
  .validator(memberInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const email = data.email.trim().toLowerCase();
    const name = (data.name ?? "").trim();
    const role: DeskRole = data.role ?? "viewer";
    const existing = await sql<{ login_id: string | null }>`
      select login_id from staff_members where lower(email) = ${email} limit 1`;
    let loginId = existing[0]?.login_id ?? "";
    if (!loginId) {
      const ids = await sql<{ login_id: string | null }>`select login_id from staff_members`;
      const max = ids.reduce((n, r) => {
        const m = (r.login_id ?? "").match(/(\d+)/);
        return Math.max(n, m ? Number(m[1]) : 0);
      }, 0);
      loginId = `SGJ-${String(max + 1).padStart(2, "0")}`;
    }
    await sql`
      insert into staff_members (email, name, role, login_id)
      values (${email}, ${name}, ${role}, ${loginId})
      on conflict (email) do update set name = excluded.name, role = excluded.role,
        login_id = coalesce(nullif(staff_members.login_id, ''), excluded.login_id)`;
    return { ok: true as const, loginId };
  });

export const setStaffRole = createServerFn({ method: "POST" })
  .middleware([capMiddleware("team")])
  .validator(z.object({ email: z.string().email(), role: z.enum(["owner", "counter", "cabinet", "shop", "viewer"]) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const email = data.email.trim().toLowerCase();
    if (data.role !== "owner") {
      const current = await sql<{ role: string }>`
        select role from staff_members where lower(email) = ${email} limit 1`;
      if (current[0]?.role === "owner" && (await ownerCount(sql)) <= 1) {
        throw forbidden("The house must keep one owner.");
      }
    }
    await sql`update staff_members set role = ${data.role} where lower(email) = ${email}`;
    return { ok: true as const };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .middleware([capMiddleware("team")])
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const email = data.email.trim().toLowerCase();
    const current = await sql<{ role: string }>`
      select role from staff_members where lower(email) = ${email} limit 1`;
    if (current[0]?.role === "owner" && (await ownerCount(sql)) <= 1) {
      throw forbidden("The house must keep one owner.");
    }
    await sql`delete from staff_members where lower(email) = ${email}`;
    return { ok: true as const };
  });
