import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { capMiddleware } from "@/server/staff";

export const ownerAiBrief = createServerFn({ method: "GET" })
  .middleware([capMiddleware("enquiries")])
  .handler(async () => {
    const { ownerAiBrief: run } = await import("./ai-desk.server");
    return run();
  });

export const ownerAiToggle = createServerFn({ method: "POST" })
  .middleware([capMiddleware("enquiries")])
  .validator(z.object({ on: z.boolean() }))
  .handler(async ({ data }) => {
    const { ownerAiToggle: run } = await import("./ai-desk.server");
    return run(data);
  });

export const ownerAiReach = createServerFn({ method: "POST" })
  .middleware([capMiddleware("enquiries")])
  .validator(z.object({ id: z.number(), channel: z.enum(["mail", "whatsapp"]) }))
  .handler(async ({ data }) => {
    const { ownerAiReach: run } = await import("./ai-desk.server");
    return run(data);
  });

export const ownerAiSolve = createServerFn({ method: "POST" })
  .middleware([capMiddleware("enquiries")])
  .validator(z.object({ q: z.string().max(400) }))
  .handler(async ({ data }) => {
    const { ownerAiSolve: run } = await import("./ai-desk.server");
    return run(data);
  });
