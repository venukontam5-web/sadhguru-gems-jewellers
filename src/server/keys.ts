import { createHash, randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import { memoClear } from "@/lib/public-cache";
import { SITE } from "@/data/site";

const KEY_SLOTS = [
  { slot: "razorpay_merchant", label: "Razorpay merchant ID", hint: "Public till ID", kind: "public" as const },
  { slot: "vercel_account", label: "Vercel account ID", hint: "Hobby user ID you pasted", kind: "public" as const },
  { slot: "vercel_team", label: "Vercel team ID", hint: "venukontam5-3188's projects", kind: "public" as const },
  { slot: "vercel_project", label: "Vercel project ID", hint: "sadhguru-official", kind: "public" as const },
  { slot: "github_repo", label: "GitHub book", hint: "Official repo", kind: "public" as const },
  { slot: "razorpay_key_id", label: "Razorpay Key ID", hint: "rzp_live_… or rzp_test_…", kind: "paste" as const },
  { slot: "razorpay_key_secret", label: "Razorpay Key Secret", hint: "From Razorpay dashboard → API keys", kind: "paste" as const },
  { slot: "razorpay_webhook", label: "Razorpay webhook secret", hint: "Webhook signing secret", kind: "paste" as const },
  { slot: "vercel_token", label: "Vercel token", hint: "Account Settings → Tokens", kind: "paste" as const },
  { slot: "vercel_hook", label: "Vercel deploy hook", hint: "https://api.vercel.com/v1/integrations/deploy/…", kind: "paste" as const },
  { slot: "ga_id", label: "Google Analytics (GA4)", hint: "G-XXXXXXXX", kind: "paste" as const },
  { slot: "gtm_id", label: "Google Tag Manager", hint: "GTM-XXXX", kind: "paste" as const },
  { slot: "ads_id", label: "Google Ads ID", hint: "AW-XXXXXXXX", kind: "paste" as const },
  { slot: "search_console", label: "Search Console verification", hint: "HTML tag content", kind: "paste" as const },
  { slot: "house_webhook", label: "House webhook (generated)", hint: "Trusted secret we mint for inbound hooks", kind: "generate" as const },
] as const;

function mask(secret: string) {
  const s = secret.trim();
  if (!s) return "";
  if (s.length <= 8) return "••••";
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function fingerprint(secret: string) {
  return createHash("sha256").update(secret).digest("hex").slice(0, 16);
}

function accessLink(slot: string): { href: string; label: string } {
  if (slot.startsWith("razorpay")) {
    return { href: "https://dashboard.razorpay.com/app/keys", label: "Razorpay dashboard" };
  }
  if (slot.startsWith("vercel")) {
    return { href: `https://vercel.com/${SITE.vercelTeamSlug}`, label: "Vercel hang" };
  }
  if (slot === "github_repo") return { href: SITE.githubUrl, label: "GitHub book" };
  if (slot === "ga_id") return { href: "https://analytics.google.com/", label: "Google Analytics" };
  if (slot === "gtm_id") return { href: "https://tagmanager.google.com/", label: "Tag Manager" };
  if (slot === "ads_id") return { href: "https://ads.google.com/", label: "Google Ads" };
  if (slot === "search_console") return { href: "https://search.google.com/search-console", label: "Search Console" };
  if (slot === "house_webhook") return { href: `${SITE.url}/api/house/hook`, label: "House webhook" };
  return { href: SITE.url, label: "Live shop" };
}

function detectSlot(raw: string): { slot: string; label: string } | null {
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("rzp_")) return { slot: "razorpay_key_id", label: "Razorpay Key ID" };
  if (v.startsWith("https://api.vercel.com/v1/integrations/deploy/")) {
    return { slot: "vercel_hook", label: "Vercel deploy hook" };
  }
  if (/^G-[A-Z0-9]+$/i.test(v)) return { slot: "ga_id", label: "Google Analytics (GA4)" };
  if (/^GTM-[A-Z0-9]+$/i.test(v)) return { slot: "gtm_id", label: "Google Tag Manager" };
  if (/^AW-/i.test(v)) return { slot: "ads_id", label: "Google Ads ID" };
  if (v.startsWith("sgj_")) return { slot: "house_webhook", label: "House webhook (generated)" };
  if (v.startsWith("prj_")) return { slot: "vercel_project", label: "Vercel project ID" };
  if (v.startsWith("team_")) return { slot: "vercel_team", label: "Vercel team ID" };
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(v)) return { slot: "github_repo", label: "GitHub book" };
  if (v.includes("google-site-verification")) {
    return { slot: "search_console", label: "Search Console verification" };
  }
  if (v.startsWith("vercel_") || (v.length >= 40 && /^[A-Za-z0-9_]+$/.test(v))) {
    return { slot: "vercel_token", label: "Vercel token" };
  }
  if (v.length >= 16) return { slot: "razorpay_key_secret", label: "Razorpay Key Secret" };
  return null;
}

function looksValid(slot: string, value: string) {
  const v = value.trim();
  if (!v) return false;
  if (slot === "razorpay_key_id") return v.startsWith("rzp_");
  if (slot === "razorpay_key_secret") return v.length >= 16;
  if (slot === "razorpay_webhook") return v.length >= 12;
  if (slot === "vercel_token") return v.length >= 20;
  if (slot === "vercel_hook") return v.startsWith("https://api.vercel.com/v1/integrations/deploy/");
  if (slot === "ga_id") return /^G-[A-Z0-9]+$/i.test(v);
  if (slot === "gtm_id") return /^GTM-[A-Z0-9]+$/i.test(v);
  if (slot === "ads_id") return /^AW-\d+$/i.test(v) || v.startsWith("AW-");
  if (slot === "search_console") return v.length >= 8;
  if (slot === "house_webhook") return v.startsWith("sgj_");
  if (slot === "razorpay_merchant" || slot === "vercel_account" || slot === "vercel_project" || slot === "github_repo" || slot === "vercel_team") {
    return v.length >= 4;
  }
  return v.length >= 8;
}

async function ensureTable() {
  const sql = await getSql();
  await sql`
    create table if not exists api_keys (
      slot text primary key,
      label text not null,
      secret text not null default '',
      fingerprint text not null default '',
      kind text not null default 'paste',
      verified boolean not null default false,
      verified_at timestamptz,
      note text not null default '',
      updated_at timestamptz not null default now()
    )`;
}

async function seedFromSettings() {
  const sql = await getSql();
  const [row] = await sql<{
    rzp_key_id: string | null;
    rzp_key_secret: string | null;
    rzp_webhook_secret: string | null;
    vercel_token: string | null;
    vercel_deploy_hook: string | null;
    ga_id: string | null;
    gtm_id: string | null;
    ads_id: string | null;
    search_console: string | null;
  }>`select rzp_key_id, rzp_key_secret, rzp_webhook_secret, vercel_token, vercel_deploy_hook, ga_id, gtm_id, ads_id, search_console from shop_settings where id = 1`;
  if (!row) return;
  const pairs: [string, string, string][] = [
    ["razorpay_key_id", "Razorpay Key ID", row.rzp_key_id ?? ""],
    ["razorpay_key_secret", "Razorpay Key Secret", row.rzp_key_secret ?? ""],
    ["razorpay_webhook", "Razorpay webhook secret", row.rzp_webhook_secret ?? ""],
    ["vercel_token", "Vercel token", row.vercel_token ?? ""],
    ["vercel_hook", "Vercel deploy hook", row.vercel_deploy_hook ?? ""],
    ["ga_id", "Google Analytics (GA4)", row.ga_id ?? ""],
    ["gtm_id", "Google Tag Manager", row.gtm_id ?? ""],
    ["ads_id", "Google Ads ID", row.ads_id ?? ""],
    ["search_console", "Search Console verification", row.search_console ?? ""],
  ];
  for (const [slot, label, secret] of pairs) {
    const value = secret.trim();
    if (!value) continue;
    const [existing] = await sql<{ secret: string }>`select secret from api_keys where slot = ${slot}`;
    if (existing?.secret) continue;
    const ok = looksValid(slot, value);
    await sql`
      insert into api_keys (slot, label, secret, fingerprint, kind, verified, verified_at, note, updated_at)
      values (${slot}, ${label}, ${value}, ${fingerprint(value)}, 'paste', ${ok}, now(), ${ok ? "Matched shop settings" : ""}, now())
      on conflict (slot) do nothing`;
  }
}

async function seedPublicIds() {
  const sql = await getSql();
  const pubs: [string, string, string, string][] = [
    ["razorpay_merchant", "Razorpay merchant ID", SITE.razorpayMerchantId, "Stamped from the house book."],
    ["vercel_account", "Vercel account ID", SITE.vercelAccountId, "Pasted by the house. Not a team_ ID."],
    ["vercel_team", "Vercel team ID", SITE.vercelTeamId, "Verified against Vercel Hobby: venukontam5-3188s-projects."],
    ["vercel_project", "Vercel project ID", SITE.vercelProjectId, "sadhguru-official. Git hang still empty on this team."],
    ["github_repo", "GitHub book", SITE.githubRepo, "Official shop repo."],
  ];
  for (const [slot, label, secret, note] of pubs) {
    if (!secret) continue;
    await sql`
      insert into api_keys (slot, label, secret, fingerprint, kind, verified, verified_at, note, updated_at)
      values (${slot}, ${label}, ${secret}, ${fingerprint(secret)}, 'public', true, now(), ${note}, now())
      on conflict (slot) do update set
        secret = excluded.secret,
        fingerprint = excluded.fingerprint,
        verified = true,
        note = excluded.note,
        updated_at = now()`;
  }
}

async function mintHouseIfMissing(): Promise<string | null> {
  const sql = await getSql();
  const [row] = await sql<{ secret: string }>`select secret from api_keys where slot = 'house_webhook'`;
  if (row?.secret) return null;
  const secret = `sgj_${randomBytes(24).toString("base64url")}`;
  await sql`
    insert into api_keys (slot, label, secret, fingerprint, kind, verified, verified_at, note, updated_at)
    values ('house_webhook', 'House webhook (generated)', ${secret}, ${fingerprint(secret)}, 'generate', true, now(), 'House-minted on first open. Copy once.', now())
    on conflict (slot) do nothing`;
  return secret;
}

async function writeThrough(slot: string, value: string) {
  const sql = await getSql();
  if (slot === "razorpay_key_id") {
    await sql`update shop_settings set rzp_key_id = ${value}, updated_at = now() where id = 1`;
  } else if (slot === "razorpay_key_secret") {
    await sql`update shop_settings set rzp_key_secret = ${value}, updated_at = now() where id = 1`;
  } else if (slot === "razorpay_webhook") {
    await sql`update shop_settings set rzp_webhook_secret = ${value}, updated_at = now() where id = 1`;
  } else if (slot === "vercel_token") {
    await sql`update shop_settings set vercel_token = ${value}, updated_at = now() where id = 1`;
  } else if (slot === "vercel_hook") {
    await sql`update shop_settings set vercel_deploy_hook = ${value}, updated_at = now() where id = 1`;
  } else if (slot === "ga_id") {
    await sql`update shop_settings set ga_id = ${value}, updated_at = now() where id = 1`;
    memoClear("settings");
  } else if (slot === "gtm_id") {
    await sql`update shop_settings set gtm_id = ${value}, updated_at = now() where id = 1`;
    memoClear("settings");
  } else if (slot === "ads_id") {
    await sql`update shop_settings set ads_id = ${value}, updated_at = now() where id = 1`;
    memoClear("settings");
  } else if (slot === "search_console") {
    await sql`update shop_settings set search_console = ${value}, updated_at = now() where id = 1`;
    memoClear("settings");
  }
}

async function probe(slot: string, secret: string): Promise<{ ok: boolean; note: string }> {
  if (!looksValid(slot, secret)) return { ok: false, note: "Shape not trusted yet — check the prefix." };
  try {
    if (slot === "razorpay_key_id") {
      return { ok: true, note: "Key ID shape trusted. Paste the secret to test the till." };
    }
    if (slot === "razorpay_key_secret") {
      const sql = await getSql();
      const [row] = await sql<{ rzp_key_id: string | null }>`select rzp_key_id from shop_settings where id = 1`;
      const keyId = (row?.rzp_key_id || "").trim();
      if (!keyId) return { ok: true, note: "Secret saved. Add Key ID to verify against Razorpay." };
      const res = await fetch("https://api.razorpay.com/v1/payments?count=1", {
        headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}` },
      });
      if (res.ok) return { ok: true, note: "Razorpay accepted the pair." };
      return { ok: false, note: "Razorpay rejected the pair." };
    }
    if (slot === "vercel_token") {
      const res = await fetch("https://api.vercel.com/v2/user", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.ok) return { ok: true, note: "Vercel accepted the token." };
      return { ok: false, note: "Vercel rejected the token." };
    }
    if (slot === "vercel_hook") return { ok: true, note: "Deploy hook URL trusted." };
    if (slot === "github_repo") {
      const res = await fetch(`https://api.github.com/repos/${secret}`, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "sgj-desk" },
      });
      if (res.ok) return { ok: true, note: "GitHub book is live." };
      return { ok: false, note: "GitHub did not find that repo." };
    }
    if (slot === "ga_id" || slot === "gtm_id" || slot === "ads_id" || slot === "search_console") {
      return { ok: true, note: "ID shape trusted. It will fire on the public shop." };
    }
    if (slot === "house_webhook") return { ok: true, note: "House-minted secret. Keep it off the public page." };
    if (slot.startsWith("custom:")) return { ok: true, note: "Saved on the desk. Used when that service is wired." };
  } catch {
    return { ok: false, note: "Could not reach the service to verify." };
  }
  return { ok: looksValid(slot, secret), note: looksValid(slot, secret) ? "Shape trusted." : "Not verified." };
}

export type KeyCard = {
  slot: string;
  label: string;
  hint: string;
  kind: "paste" | "generate" | "custom" | "public";
  hasSecret: boolean;
  masked: string;
  fingerprint: string;
  verified: boolean;
  note: string;
  updatedAt: string | null;
  accessHref: string;
  accessLabel: string;
};

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    await ensureTable();
    await seedFromSettings();
    await seedPublicIds();
    const minted = await mintHouseIfMissing();
    const sql = await getSql();
    const rows = await sql<{
      slot: string;
      label: string;
      secret: string;
      fingerprint: string;
      kind: string;
      verified: boolean;
      note: string;
      updated_at: string | Date;
    }>`select slot, label, secret, fingerprint, kind, verified, note, updated_at from api_keys order by slot`;
    const bySlot = new Map(rows.map((r) => [r.slot, r]));
    const cards: KeyCard[] = KEY_SLOTS.map((meta) => {
      const row = bySlot.get(meta.slot);
      const secret = row?.secret ?? "";
      return {
        slot: meta.slot,
        label: meta.label,
        hint: meta.hint,
        kind: meta.kind,
        hasSecret: Boolean(secret),
        masked: meta.kind === "public" ? secret : mask(secret),
        fingerprint: row?.fingerprint ?? "",
        verified: Boolean(row?.verified),
        note: row?.note ?? "",
        updatedAt: row?.updated_at ? String(row.updated_at) : null,
        accessHref: accessLink(meta.slot).href,
        accessLabel: accessLink(meta.slot).label,
      };
    });
    for (const row of rows) {
      if (KEY_SLOTS.some((s) => s.slot === row.slot)) continue;
      cards.push({
        slot: row.slot,
        label: row.label,
        hint: "Custom house key",
        kind: "custom",
        hasSecret: Boolean(row.secret),
        masked: mask(row.secret),
        fingerprint: row.fingerprint,
        verified: row.verified,
        note: row.note,
        updatedAt: row.updated_at ? String(row.updated_at) : null,
        accessHref: accessLink(row.slot).href,
        accessLabel: accessLink(row.slot).label,
      });
    }
    return { cards, liveUrl: SITE.url, minted };
  });

export const saveApiKey = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(z.object({ slot: z.string().max(60).optional(), label: z.string().max(80).optional(), secret: z.string().max(400) }))
  .handler(async ({ data }) => {
    await ensureTable();
    const secret = data.secret.trim();
    if (!secret) throw new Error("Paste a key first.");
    const guessed = detectSlot(secret);
    const slot = (data.slot && data.slot !== "auto" ? data.slot.trim() : guessed?.slot || "").slice(0, 60);
    if (!slot) throw new Error("Could not tell which service. Use a known prefix: rzp_, G-, GTM-, AW-.");
    const meta = KEY_SLOTS.find((s) => s.slot === slot);
    const label = (data.label || guessed?.label || meta?.label || slot).trim().slice(0, 80);
    const check = await probe(slot, secret);
    const sql = await getSql();
    await sql`
      insert into api_keys (slot, label, secret, fingerprint, kind, verified, verified_at, note, updated_at)
      values (
        ${slot}, ${label}, ${secret}, ${fingerprint(secret)},
        ${meta?.kind === "generate" ? "generate" : slot.startsWith("custom:") ? "custom" : "paste"},
        ${check.ok}, now(), ${check.note}, now()
      )
      on conflict (slot) do update set
        label = excluded.label,
        secret = excluded.secret,
        fingerprint = excluded.fingerprint,
        verified = excluded.verified,
        verified_at = now(),
        note = excluded.note,
        updated_at = now()`;
    await writeThrough(slot, secret);
    const access = accessLink(slot);
    return {
      slot,
      label,
      hasSecret: true,
      masked: mask(secret),
      verified: check.ok,
      note: check.note,
      accessHref: access.href,
      accessLabel: access.label,
      shopHref: SITE.url,
    };
  });

export const generateApiKey = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(z.object({ slot: z.string().min(2).max(60) }))
  .handler(async ({ data }) => {
    await ensureTable();
    const slot = data.slot.trim() === "house_webhook" ? "house_webhook" : `custom:${data.slot.trim().slice(0, 40)}`;
    const secret = `sgj_${randomBytes(24).toString("base64url")}`;
    const label = slot === "house_webhook" ? "House webhook (generated)" : slot.replace("custom:", "House · ");
    const sql = await getSql();
    await sql`
      insert into api_keys (slot, label, secret, fingerprint, kind, verified, verified_at, note, updated_at)
      values (${slot}, ${label}, ${secret}, ${fingerprint(secret)}, 'generate', true, now(), 'House-minted. Trusted on this desk.', now())
      on conflict (slot) do update set
        secret = excluded.secret,
        fingerprint = excluded.fingerprint,
        kind = 'generate',
        verified = true,
        verified_at = now(),
        note = excluded.note,
        updated_at = now()`;
    return { slot, secret, masked: mask(secret), verified: true, note: "Copy now — the full key is not shown again.", accessHref: accessLink(slot).href, accessLabel: accessLink(slot).label, shopHref: SITE.url };
  });

export const verifyApiKey = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(z.object({ slot: z.string().min(2).max(60) }))
  .handler(async ({ data }) => {
    await ensureTable();
    const sql = await getSql();
    const [row] = await sql<{ secret: string }>`select secret from api_keys where slot = ${data.slot}`;
    if (!row?.secret) throw new Error("No key in that slot yet.");
    const check = await probe(data.slot, row.secret);
    await sql`
      update api_keys
      set verified = ${check.ok}, verified_at = now(), note = ${check.note}, updated_at = now()
      where slot = ${data.slot}`;
    return { slot: data.slot, verified: check.ok, note: check.note, accessHref: accessLink(data.slot).href, accessLabel: accessLink(data.slot).label, shopHref: SITE.url };
  });

export const clearApiKey = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(z.object({ slot: z.string().min(2).max(60) }))
  .handler(async ({ data }) => {
    await ensureTable();
    const sql = await getSql();
    await sql`delete from api_keys where slot = ${data.slot}`;
    return { ok: true as const };
  });
