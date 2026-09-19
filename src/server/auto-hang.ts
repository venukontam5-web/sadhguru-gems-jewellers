import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { capMiddleware } from "@/server/staff";

export const ownerAutoBrief = createServerFn({ method: "GET" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    const { ownerAutoBrief: run } = await import("./auto-hang.server");
    return run();
  });

export const ownerAutoToggle = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(z.object({ on: z.boolean() }))
  .handler(async ({ data }) => {
    const { ownerAutoToggle: run } = await import("./auto-hang.server");
    return run(data);
  });

export const ownerAutoSolve = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(z.object({ log: z.string().max(8000) }))
  .handler(async ({ data }) => {
    const { ownerAutoSolve: run } = await import("./auto-hang.server");
    return run(data);
  });

export const ownerAutoSync = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    const { ownerAutoSync: run } = await import("./auto-hang.server");
    return run();
  });

export const ownerAutoPulse = createServerFn({ method: "GET" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    const { ownerAutoPulse: run } = await import("./auto-hang.server");
    return run();
  });
