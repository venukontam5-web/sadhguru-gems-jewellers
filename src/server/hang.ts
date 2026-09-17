import { createMiddleware } from "@tanstack/react-start";

/** Wraps a desk tap in AsyncLocalStorage.run — SQL on this tap stays on this tap. */
export const hangMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { withHang } = await import("@/lib/hang.server");
  return withHang("desk", () => next());
});
