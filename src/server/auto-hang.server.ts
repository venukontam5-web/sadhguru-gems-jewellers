import { getSql } from "@/lib/db";
import { SITE } from "@/data/site";

export type HangBug = {
  id: string;
  title: string;
  match: string;
  fix: string;
  solvedInBook: boolean;
};

export const HANG_BUGS: HangBug[] = [
  {
    id: "dist",
    title: "No dist cabinet",
    match: "No Output Directory named dist",
    fix: "Preset Other, not TanStack Start. Output Directory empty. The book now writes a spare dist cabinet after Nitro packs.",
    solvedInBook: true,
  },
  {
    id: "tanstack",
    title: "TanStack Start preset",
    match: "TanStack Start",
    fix: "On New Project, change Application Preset to Other. Then Redeploy. Do not import a second hang.",
    solvedInBook: true,
  },
  {
    id: "fs",
    title: "node:fs on the shop floor",
    match: "node:fs",
    fix: "API keys and Advanced AI load on the server only. Hard refresh the desk after the hang is Ready.",
    solvedInBook: true,
  },
  {
    id: "crypto",
    title: "node:crypto leaked",
    match: "node:crypto",
    fix: "Same as node:fs — server pack, not the shop floor. Redeploy, then hard refresh.",
    solvedInBook: true,
  },
  {
    id: "read",
    title: "Grok cannot read the hang",
    match: "Failed to fetch project: 404",
    fix: "Connectors → Vercel → Allow venukontam5-3188's projects. Redeploy on the phone. This desk cannot list Hobby hangs without that Allow.",
    solvedInBook: false,
  },
  {
    id: "forbidden",
    title: "Cannot list deployments",
    match: "403 Forbidden",
    fix: "Same Allow on the Vercel connector. Git push still hangs if Git is connected on the project.",
    solvedInBook: false,
  },
];

function asHook(raw: string) {
  const u = raw.trim();
  if (!u.startsWith("https://api.vercel.com/v1/integrations/deploy/")) return "";
  return u.slice(0, 200);
}

async function ensureCols() {
  const sql = await getSql();
  await sql.query(
    `alter table shop_settings add column if not exists hang_auto_on boolean not null default false`,
  ).catch(() => undefined);
  await sql.query(`alter table shop_settings add column if not exists hang_last_sha text`).catch(() => undefined);
  await sql.query(`alter table shop_settings add column if not exists hang_last_note text`).catch(() => undefined);
  await sql.query(
    `alter table shop_settings add column if not exists hang_last_at timestamptz`,
  ).catch(() => undefined);
  await sql.query(`alter table shop_settings add column if not exists vercel_deploy_hook text`).catch(() => undefined);
  return sql;
}

async function githubHead() {
  const res = await fetch(`https://api.github.com/repos/${SITE.githubRepo}/commits/main`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "sgj-auto-hang",
    },
  });
  if (!res.ok) {
    throw new Error(res.status === 403 ? "GitHub is rate-limiting this desk. Try again in a minute." : `GitHub ${res.status}`);
  }
  const json = (await res.json()) as {
    sha?: string;
    commit?: { message?: string; author?: { date?: string } };
    html_url?: string;
  };
  const sha = (json.sha || "").slice(0, 40);
  if (!sha) throw new Error("GitHub did not return a commit.");
  return {
    sha,
    short: sha.slice(0, 7),
    message: (json.commit?.message || "commit").split("\n")[0].slice(0, 120),
    at: json.commit?.author?.date || "",
    href: json.html_url || SITE.githubUrl,
  };
}

export async function ownerAutoBrief() {
  const sql = await ensureCols();
  const [row] = await sql<{
    hang_auto_on: boolean | null;
    hang_last_sha: string | null;
    hang_last_note: string | null;
    hang_last_at: string | null;
    vercel_deploy_hook: string | null;
  }>`
    select hang_auto_on, hang_last_sha, hang_last_note, hang_last_at::text, vercel_deploy_hook
    from shop_settings where id = 1`.catch(() => []);
  let github: Awaited<ReturnType<typeof githubHead>> | null = null;
  let githubError: string | null = null;
  try {
    github = await githubHead();
  } catch (err) {
    githubError = err instanceof Error ? err.message : "GitHub unreachable.";
  }
  const lastSha = (row?.hang_last_sha || "").trim();
  const behind = Boolean(github && lastSha && github.sha !== lastSha);
  const neverHung = Boolean(github && !lastSha);
  return {
    autoOn: Boolean(row?.hang_auto_on),
    hasHook: Boolean(asHook(row?.vercel_deploy_hook || "")),
    lastSha,
    lastShort: lastSha.slice(0, 7),
    lastNote: row?.hang_last_note || "",
    lastAt: row?.hang_last_at || "",
    github,
    githubError,
    behind,
    neverHung,
    bugs: HANG_BUGS,
    liveUrl: SITE.url,
    githubUrl: SITE.githubUrl,
    vercelGit: `https://vercel.com/${SITE.vercelTeamSlug}/${SITE.vercelProjectSlug}/settings/git`,
    vercelHang: `https://vercel.com/${SITE.vercelTeamSlug}/${SITE.vercelProjectSlug}`,
  };
}

export async function ownerAutoToggle(data: { on: boolean }) {
  const sql = await ensureCols();
  await sql`
    insert into shop_settings (id, hang_auto_on, updated_at)
    values (1, ${data.on}, now())
    on conflict (id) do update set hang_auto_on = excluded.hang_auto_on, updated_at = now()`;
  return { on: data.on };
}

export async function ownerAutoSolve(data: { log: string }) {
  const log = data.log.trim();
  const hits = log
    ? HANG_BUGS.filter((b) => log.toLowerCase().includes(b.match.toLowerCase()) || log.toLowerCase().includes(b.id))
    : HANG_BUGS.filter((b) => b.solvedInBook);
  const brief = await ownerAutoBrief();
  return {
    hits: hits.length ? hits : HANG_BUGS.slice(0, 2),
    note: hits.length
      ? hits.every((h) => h.solvedInBook)
        ? "The book already carries these fixes. Sync to hang them."
        : "Some of these need a tap on Vercel (Allow / Redeploy). The rest are already in the book."
      : "Paste a red log, or Sync to hang the latest book.",
    brief,
  };
}

export async function ownerAutoSync() {
  const sql = await ensureCols();
  const github = await githubHead();
  const [row] = await sql<{ hang_last_sha: string | null; vercel_deploy_hook: string | null }>`
    select hang_last_sha, vercel_deploy_hook from shop_settings where id = 1`.catch(() => []);
  const lastSha = (row?.hang_last_sha || "").trim();
  const hook = asHook(row?.vercel_deploy_hook || "");
  if (lastSha === github.sha) {
    await sql`update shop_settings set hang_last_note = ${"Already on this commit."}, hang_last_at = now(), updated_at = now() where id = 1`.catch(
      () => undefined,
    );
    return {
      ok: true as const,
      skipped: true as const,
      sha: github.sha,
      short: github.short,
      message: github.message,
      note: "GitHub and the last hang already match. Nothing to pack.",
    };
  }
  if (!hook) {
    await sql`update shop_settings set hang_last_sha = ${github.sha}, hang_last_note = ${"GitHub read. Paste a deploy hook to pack Vercel."}, hang_last_at = now(), updated_at = now() where id = 1`.catch(
      () => undefined,
    );
    return {
      ok: false as const,
      skipped: false as const,
      sha: github.sha,
      short: github.short,
      message: github.message,
      note: "GitHub is read. Paste the Vercel deploy hook on Live website, then Sync again. Or tap Redeploy on the hang.",
      needHook: true as const,
    };
  }
  const res = await fetch(hook, { method: "POST" });
  const json = (await res.json().catch(() => ({}))) as {
    job?: { id?: string; state?: string };
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `Vercel ${res.status}`);
  }
  const published = {
    jobId: json.job?.id ?? "",
    state: json.job?.state ?? "PENDING",
  };
  const note = `Hung ${github.short} · job ${published.jobId || published.state}`;
  await sql`
    update shop_settings
    set hang_last_sha = ${github.sha}, hang_last_note = ${note}, hang_last_at = now(), updated_at = now()
    where id = 1`;
  return {
    ok: true as const,
    skipped: false as const,
    sha: github.sha,
    short: github.short,
    message: github.message,
    note,
    jobId: published.jobId,
    state: published.state,
  };
}

export async function ownerAutoPulse() {
  const sql = await ensureCols();
  const [row] = await sql<{ hang_auto_on: boolean | null }>`select hang_auto_on from shop_settings where id = 1`.catch(
    () => [],
  );
  if (!row?.hang_auto_on) {
    return ownerAutoBrief();
  }
  try {
    await ownerAutoSync();
  } catch {
    /* keep brief even if hook fails */
  }
  return ownerAutoBrief();
}
