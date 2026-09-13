import { createHmac } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import { SITE } from "@/data/site";

const MERCHANT = SITE.razorpayMerchantId;

function asKeyId(raw: string) {
  const k = raw.trim();
  return k.startsWith("rzp_") ? k : "";
}

async function loadKeys() {
  const sql = await getSql();
  const [row] = await sql<{
    rzp_merchant_id: string | null;
    rzp_key_id: string | null;
    rzp_key_secret: string | null;
  }>`select rzp_merchant_id, rzp_key_id, rzp_key_secret from shop_settings where id = 1`;
  const merchantId = (row?.rzp_merchant_id || MERCHANT).trim() || MERCHANT;
  const keyId = asKeyId(row?.rzp_key_id ?? "");
  const keySecret = (row?.rzp_key_secret || "").trim();
  return { merchantId, keyId, keySecret };
}

async function rzpApi(path: string, init: { method?: string; body?: unknown } = {}) {
  const keys = await loadKeys();
  if (!keys.keyId || !keys.keySecret) {
    throw new Error("Paste the Razorpay Key ID and Key Secret on the desk first.");
  }
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    amount?: number;
    error?: { description?: string; code?: string };
    items?: unknown[];
    count?: number;
  };
  if (!res.ok) {
    throw new Error(json.error?.description || `Razorpay ${res.status}`);
  }
  return json;
}

const lineZ = z.object({
  productId: z.number(),
  slug: z.string().max(80),
  name: z.string().max(120),
  priceInr: z.number().min(0),
  imagePath: z.string().max(200),
  qty: z.number().min(1).max(99),
});

export const getRazorpayPublic = createServerFn({ method: "GET" }).handler(async () => {
  const keys = await loadKeys();
  return {
    merchantId: keys.merchantId,
    keyId: keys.keyId,
    ready: Boolean(keys.keyId),
    api: Boolean(keys.keyId && keys.keySecret),
  };
});

export const getRazorpaySettings = createServerFn({ method: "GET" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    const keys = await loadKeys();
    return {
      merchantId: keys.merchantId,
      keyId: keys.keyId,
      hasSecret: Boolean(keys.keySecret),
      ready: Boolean(keys.keyId),
      api: Boolean(keys.keyId && keys.keySecret),
    };
  });

export const saveRazorpaySettings = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(
    z.object({
      merchantId: z.string().max(80),
      keyId: z.string().max(80),
      keySecret: z.string().max(120),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const merchantId = data.merchantId.trim() || MERCHANT;
    const keyId = asKeyId(data.keyId);
    const incoming = data.keySecret.trim();
    const [cur] = await sql<{ rzp_key_secret: string | null }>`
      select rzp_key_secret from shop_settings where id = 1`;
    const secret = incoming || cur?.rzp_key_secret || "";
    await sql`
      insert into shop_settings (id, rzp_merchant_id, rzp_key_id, rzp_key_secret, updated_at)
      values (1, ${merchantId}, ${keyId}, ${secret}, now())
      on conflict (id) do update set
        rzp_merchant_id = excluded.rzp_merchant_id,
        rzp_key_id = excluded.rzp_key_id,
        rzp_key_secret = excluded.rzp_key_secret,
        updated_at = now()`;
    return { ok: true as const, keyId, merchantId, hasSecret: Boolean(secret) };
  });

export const testRazorpayApi = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .handler(async () => {
    const keys = await loadKeys();
    if (!keys.keyId) throw new Error("Key ID is missing. It starts with rzp_live_ or rzp_test_.");
    if (!keys.keySecret) throw new Error("Key Secret is missing. Paste it from Razorpay → API Keys.");
    const json = await rzpApi("/orders?count=1");
    return {
      ok: true as const,
      mode: keys.keyId.startsWith("rzp_test_") ? "test" : "live",
      merchantId: keys.merchantId,
      keyId: keys.keyId,
      ordersSeen: Number(json.count ?? json.items?.length ?? 0),
    };
  });

export const startRazorpayOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      customerName: z.string().min(1).max(80),
      phone: z.string().min(8).max(20),
      email: z.string().max(120).default(""),
      address: z.string().min(4).max(240),
      city: z.string().min(2).max(80),
      pincode: z.string().min(4).max(12),
      payment: z.enum(["upi", "card"]),
      lines: z.array(lineZ).min(1).max(40),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const keys = await loadKeys();
    if (!keys.keyId) {
      throw new Error("Razorpay Key ID is not on the desk. Open Dashboard → Razorpay and paste rzp_live_…");
    }
    const amount = data.lines.reduce((s, l) => s + Math.round(l.qty * l.priceInr), 0);
    if (amount < 1) throw new Error("The bag is empty of value.");
    const amountPaise = amount * 100;
    const item = data.lines.map((l) => `${l.qty} × ${l.name}`).join(", ").slice(0, 220);
    const payLabel = data.payment === "upi" ? "UPI · Razorpay" : "Card · Razorpay";
    const [{ n }] = await sql<{ n: number }>`select coalesce(max(id), 1800)::int + 42 as n from orders`;
    const code = `SGJ-${n}`;
    const linesJson = JSON.stringify(data.lines);
    await sql`
      insert into orders (
        code, customer_name, phone, email, item, status,
        address, city, pincode, payment, payment_status, amount, lines_json
      ) values (
        ${code}, ${data.customerName.trim()}, ${data.phone.trim()}, ${data.email.trim()},
        ${item}, 'New', ${data.address.trim()}, ${data.city.trim()}, ${data.pincode.trim()},
        ${payLabel}, 'Pending', ${amount}, ${linesJson}
      )`;

    await sql`
      insert into visitors (path, country, requirement, place, name, contact, email)
      values (
        '/checkout',
        'India',
        ${item.slice(0, 120)},
        ${data.city.trim() || "India"},
        ${data.customerName.trim()},
        ${data.phone.trim()},
        ${data.email.trim()}
      )`;

    let rzpOrderId = "";
    if (keys.keySecret) {
      const body = await rzpApi("/orders", {
        method: "POST",
        body: {
          amount: amountPaise,
          currency: "INR",
          receipt: code,
          payment_capture: 1,
          notes: { shop: SITE.shortName, code, city: data.city },
        },
      });
      rzpOrderId = body.id ?? "";
      if (!rzpOrderId) throw new Error("Razorpay did not return an order id.");
      await sql`update orders set rzp_order_id = ${rzpOrderId} where code = ${code}`;
    }

    return {
      code,
      keyId: keys.keyId,
      merchantId: keys.merchantId,
      amount,
      amountPaise,
      item,
      rzpOrderId,
      name: SITE.name,
      api: Boolean(keys.keySecret),
    };
  });

export const confirmRazorpayPayment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().min(3).max(24),
      razorpay_payment_id: z.string().min(6).max(40),
      razorpay_order_id: z.string().max(40).optional(),
      razorpay_signature: z.string().max(128).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const keys = await loadKeys();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<{
      id: number;
      rzp_order_id: string;
      payment_status: string;
      amount: number;
    }>`select id, rzp_order_id, payment_status, amount from orders where code = ${code} limit 1`;
    const cur = rows[0];
    if (!cur) throw new Error("No order with that code.");
    if (cur.payment_status === "Paid") return { ok: true as const, code };

    const orderId = data.razorpay_order_id || cur.rzp_order_id;
    if (keys.keySecret && data.razorpay_signature && orderId) {
      const expected = createHmac("sha256", keys.keySecret)
        .update(`${orderId}|${data.razorpay_payment_id}`)
        .digest("hex");
      if (expected !== data.razorpay_signature) {
        throw new Error("Razorpay signature did not match. The money is not booked.");
      }
    }

    if (keys.keySecret) {
      const pay = await rzpApi(`/payments/${data.razorpay_payment_id}`);
      const status = pay.status ?? "";
      if (status !== "captured" && status !== "authorized") {
        throw new Error(`Razorpay says ${status || "unpaid"}. The stone is not reserved.`);
      }
      if (typeof pay.amount === "number" && pay.amount < Number(cur.amount) * 100) {
        throw new Error("The paid amount is short of the bill.");
      }
    }

    await sql`
      update orders set
        payment_status = 'Paid',
        status = 'Paid',
        rzp_payment_id = ${data.razorpay_payment_id},
        rzp_order_id = ${orderId || cur.rzp_order_id}
      where code = ${code}`;
    return { ok: true as const, code };
  });

export const refundRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([capMiddleware("orders")])
  .validator(z.object({ code: z.string().min(3).max(24) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<{
      rzp_payment_id: string;
      payment_status: string;
      amount: number;
    }>`select rzp_payment_id, payment_status, amount from orders where code = ${code} limit 1`;
    const cur = rows[0];
    if (!cur) throw new Error("No order with that code.");
    if (!cur.rzp_payment_id) throw new Error("This bill was not paid through Razorpay.");
    await rzpApi(`/payments/${cur.rzp_payment_id}/refund`, {
      method: "POST",
      body: { amount: Number(cur.amount) * 100, notes: { code } },
    });
    await sql`
      update orders set payment_status = 'Refunded', status = 'Cancelled'
      where code = ${code}`;
    return { ok: true as const, code };
  });

export async function markPaidFromWebhook(paymentId: string, rzpOrderId: string, notesCode?: string) {
  const sql = await getSql();
  if (notesCode) {
    await sql`
      update orders set
        payment_status = 'Paid',
        status = 'Paid',
        rzp_payment_id = ${paymentId},
        rzp_order_id = ${rzpOrderId}
      where code = ${notesCode.trim().toUpperCase()}`;
    return;
  }
  if (rzpOrderId) {
    await sql`
      update orders set
        payment_status = 'Paid',
        status = 'Paid',
        rzp_payment_id = ${paymentId}
      where rzp_order_id = ${rzpOrderId}`;
  }
}

export { loadKeys };
