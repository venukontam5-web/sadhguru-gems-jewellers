import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SITE } from "@/data/site";
import { capMiddleware } from "@/server/staff";
import { parsePsi, type PsiScores } from "@/lib/pagespeed";

export const runPageSpeed = createServerFn({ method: "POST" })
  .middleware([capMiddleware("visitors")])
  .validator(
    z.object({
      url: z.string().url().max(240).optional(),
      strategy: z.enum(["mobile", "desktop"]).default("mobile"),
    }),
  )
  .handler(async ({ data }): Promise<PsiScores> => {
    const target = data.url || SITE.url;
    const params = new URLSearchParams({
      url: target,
      strategy: data.strategy,
      category: "performance",
    });
    params.append("category", "seo");
    params.append("category", "accessibility");
    params.append("category", "best-practices");
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    const json: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = json as { error?: { message?: string; status?: string } };
      const msg = err.error?.message || `PageSpeed ${res.status}`;
      if (res.status === 429 || err.error?.status === "RESOURCE_EXHAUSTED") {
        throw new Error("Google’s free PageSpeed quota is full today. Open the official report instead.");
      }
      throw new Error(msg);
    }
    return parsePsi(json, data.strategy);
  });
