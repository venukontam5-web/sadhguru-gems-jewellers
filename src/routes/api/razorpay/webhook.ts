import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { loadKeys, markPaidFromWebhook } from "@/server/razorpay";

function goodSig(secret: string, raw: string, sig: string) {
  if (!secret || !sig) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/razorpay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const sig = request.headers.get("x-razorpay-signature") || "";
        const keys = await loadKeys();
        const secret = keys.webhookSecret || keys.keySecret;
        if (secret && !goodSig(secret, raw, sig)) {
          return new Response("bad signature", { status: 400 });
        }
        let payload: {
          event?: string;
          payload?: {
            payment?: { entity?: { id?: string; order_id?: string; notes?: { code?: string } } };
            order?: { entity?: { id?: string; notes?: { code?: string } } };
          };
        };
        try {
          payload = JSON.parse(raw) as typeof payload;
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const event = payload.event ?? "";
        if (event === "payment.captured" || event === "order.paid" || event === "payment.authorized") {
          const payment = payload.payload?.payment?.entity;
          const order = payload.payload?.order?.entity;
          await markPaidFromWebhook(
            payment?.id ?? "",
            order?.id || payment?.order_id || "",
            payment?.notes?.code || order?.notes?.code,
          );
        }
        return new Response("ok");
      },
    },
  },
});
