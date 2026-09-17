import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

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
  .middleware([authMiddleware])
  .handler(async () => {
    const { listApiKeys: run } = await import("./keys.server");
    return run();
  });

export const saveApiKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      slot: z.string().max(60).optional(),
      label: z.string().max(80).optional(),
      secret: z.string().max(400),
    }),
  )
  .handler(async ({ data }) => {
    const { saveApiKey: run } = await import("./keys.server");
    return run(data);
  });

export const generateApiKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ slot: z.string().min(2).max(60) }))
  .handler(async ({ data }) => {
    const { generateApiKey: run } = await import("./keys.server");
    return run(data);
  });

export const verifyApiKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ slot: z.string().min(2).max(60) }))
  .handler(async ({ data }) => {
    const { verifyApiKey: run } = await import("./keys.server");
    return run(data);
  });

export const clearApiKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ slot: z.string().min(2).max(60) }))
  .handler(async ({ data }) => {
    const { clearApiKey: run } = await import("./keys.server");
    return run(data);
  });
