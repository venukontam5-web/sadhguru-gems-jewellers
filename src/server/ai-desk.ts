import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";

export const ownerAiBrief = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { ownerAiBrief: run } = await import("./ai-desk.server");
    return run();
  });

export const ownerAiToggle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ on: z.boolean() }))
  .handler(async ({ data }) => {
    const { ownerAiToggle: run } = await import("./ai-desk.server");
    return run(data);
  });

export const ownerAiReach = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number(), channel: z.enum(["mail", "whatsapp"]) }))
  .handler(async ({ data }) => {
    const { ownerAiReach: run } = await import("./ai-desk.server");
    return run(data);
  });

export const ownerAiSolve = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ q: z.string().max(400) }))
  .handler(async ({ data }) => {
    const { ownerAiSolve: run } = await import("./ai-desk.server");
    return run(data);
  });
