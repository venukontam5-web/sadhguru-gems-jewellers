import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import { SITE } from "@/data/site";

const DEFAULT_ID = SITE.vercelAccountId;
const DEFAULT_DOMAIN = SITE.domain;
const DEFAULT_REPO = SITE.githubRepo;
const DEFAULT_PROJECT = SITE.vercelProjectId;

function asHook(raw: string) {
  const u = raw.trim();
  if (!u) return "";
  if (!u.startsWith("https://api.vercel.com/v1/integrations/deploy/")) return "";
  return u.slice(0, 200);
}

export const getLiveSettings = createServerFn({ method: "GET" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    const sql = await getSql();
    const [row] = await sql<{
      vercel_account_id: string | null;
      vercel_token: string | null;
      live_domain: string | null;
      vercel_deploy_hook: string | null;
      github_repo: string | null;
      vercel_project_id: string | null;
    }>`select vercel_account_id, vercel_token, live_domain, vercel_deploy_hook, github_repo, vercel_project_id from shop_settings where id = 1`;
    const accountId = (row?.vercel_account_id || DEFAULT_ID).trim() || DEFAULT_ID;
    const domain = (row?.live_domain || DEFAULT_DOMAIN).trim() || DEFAULT_DOMAIN;
    const githubRepo = (row?.github_repo || DEFAULT_REPO).trim() || DEFAULT_REPO;
    const projectId = (row?.vercel_project_id || DEFAULT_PROJECT).trim() || DEFAULT_PROJECT;
    return {
      accountId,
      domain,
      githubRepo,
      projectId,
      project: SITE.vercelProject,
      hasToken: Boolean((row?.vercel_token || "").trim()),
      hasHook: Boolean((row?.vercel_deploy_hook || "").trim()),
      liveUrl: `https://${domain.replace(/^https?:\/\//, "")}`,
      githubUrl: `https://github.com/${githubRepo}`,
      vercelUrl: `https://vercel.com/venukontam5-3188s-projects/${SITE.vercelProject}`,
      importUrl: `https://vercel.com/new/import?s=https://github.com/${githubRepo}`,
    };
  });

export const saveLiveSettings = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(
    z.object({
      accountId: z.string().max(80),
      domain: z.string().max(120),
      token: z.string().max(200).optional(),
      hook: z.string().max(220).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const accountId = data.accountId.trim() || DEFAULT_ID;
    const domain =
      data.domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "") || DEFAULT_DOMAIN;
    const token = (data.token ?? "").trim();
    const hook = asHook(data.hook ?? "");
    await sql`
      insert into shop_settings (
        id, vercel_account_id, live_domain, github_repo, vercel_project_id, updated_at
      )
      values (1, ${accountId}, ${domain}, ${DEFAULT_REPO}, ${DEFAULT_PROJECT}, now())
      on conflict (id) do update set
        vercel_account_id = excluded.vercel_account_id,
        live_domain = excluded.live_domain,
        github_repo = excluded.github_repo,
        vercel_project_id = excluded.vercel_project_id,
        updated_at = now()`;
    if (token) {
      await sql`update shop_settings set vercel_token = ${token}, updated_at = now() where id = 1`;
    }
    if (hook) {
      await sql`update shop_settings set vercel_deploy_hook = ${hook}, updated_at = now() where id = 1`;
    }
    return { ok: true as const, accountId, domain };
  });

export const publishLive = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    const sql = await getSql();
    const [row] = await sql<{ vercel_deploy_hook: string | null }>`
      select vercel_deploy_hook from shop_settings where id = 1`;
    const hook = asHook(row?.vercel_deploy_hook ?? "");
    if (!hook) {
      throw new Error("Paste the Vercel deploy hook on this desk first.");
    }
    const res = await fetch(hook, { method: "POST" });
    const json = (await res.json().catch(() => ({}))) as {
      job?: { id?: string; state?: string };
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(json.error?.message || `Vercel ${res.status}`);
    }
    return {
      ok: true as const,
      jobId: json.job?.id ?? "",
      state: json.job?.state ?? "PENDING",
    };
  });
