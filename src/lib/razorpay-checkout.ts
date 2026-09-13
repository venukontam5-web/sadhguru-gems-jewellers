import { SITE } from "@/data/site";

export type RazorpayStart = {
  code: string;
  keyId: string;
  amountPaise: number;
  item: string;
  rzpOrderId: string;
  name: string;
};

type Handler = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => {
      open: () => void;
      on: (ev: string, fn: (resp: { error?: { description?: string } }) => void) => void;
    };
  }
}

export async function loadRazorpayScript() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay did not load."));
    document.head.appendChild(s);
  });
}

export async function openRazorpayCheckout(args: {
  start: RazorpayStart;
  name: string;
  email: string;
  phone: string;
  method: "upi" | "card";
  onPaid: (h: Handler) => void | Promise<void>;
  onFail: (msg: string) => void;
}) {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay did not load.");
  const rzp = new window.Razorpay({
    key: args.start.keyId,
    amount: args.start.amountPaise,
    currency: "INR",
    name: args.start.name || SITE.name,
    description: args.start.item,
    image: "/images/logo.png",
    order_id: args.start.rzpOrderId || undefined,
    prefill: {
      name: args.name,
      email: args.email,
      contact: args.phone,
    },
    notes: { code: args.start.code },
    theme: { color: "#8c2f39" },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    },
    handler: (h: Handler) => {
      void args.onPaid(h);
    },
  });
  rzp.on("payment.failed", (resp) => {
    args.onFail(resp.error?.description || "Payment did not go through.");
  });
  rzp.open();
}
