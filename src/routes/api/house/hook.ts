import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { loadHouseWebhook } from "@/server/keys.server";

function match(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

export const Route = createFileRoute("/api/house/hook")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          ok: true,
          house: "Sadhguru Gems & Jewellers",
          needs: "x-sgj-secret",
        }),
      POST: async ({ request }) => {
        const secret = await loadHouseWebhook();
        const given = request.headers.get("x-sgj-secret") || "";
        if (!secret || !match(secret, given)) {
          return Response.json({ ok: false, error: "bad secret" }, { status: 401 });
        }
        return Response.json({ ok: true, wired: true });
      },
    },
  },
});
