import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "node:crypto";
import { loadKeys, markPaidFromWebhook } from "@/server/razorpay";

export const Route = createFileRoute("/api/razorpay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const sig = request.headers.get("x-razorpay-signature") || "";
        const keys = await loadKeys();
        if (keys.keySecret && sig) {
          const expected = createHmac("sha256", keys.keySecret).update(raw).digest("hex");
          if (expected !== sig) return new Response("bad signature", { status: 400 });
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
