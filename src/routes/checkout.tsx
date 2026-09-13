import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { PAY_METHODS, type PayMethod } from "@/lib/cart";
import { inr } from "@/lib/shop";
import { SITE } from "@/data/site";
import { writeGuest } from "@/lib/visit";
import { placeShopOrder } from "@/server/shop-orders";
import { confirmRazorpayPayment, getRazorpayPublic, startRazorpayOrder } from "@/server/razorpay";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () =>
    pageHead(
      "Checkout",
      "Reserve a piece from Sadhguru Gems & Jewellers. Pay with Razorpay (UPI or card) or at the shop.",
      "/checkout",
    ),
});

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.primaryEmail ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Solapur");
  const [pincode, setPincode] = useState("413006");
  const [pay, setPay] = useState<PayMethod>("upi");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rzp, setRzp] = useState<{ merchantId: string; ready: boolean; api: boolean } | null>(null);

  useEffect(() => {
    void getRazorpayPublic().then(setRzp);
  }, []);

  if (!cart.lines.length) {
    return (
      <SiteShell>
        <PageHero kicker="Checkout" title="Nothing to bill." lede="Add a piece first." compact />
        <div className="mx-auto max-w-lg px-4 py-12">
          <Link to="/shop" className={cn(buttonVariants())}>
            Open the shop
          </Link>
        </div>
      </SiteShell>
    );
  }

  async function placeShop() {
    writeGuest({ name, phone, email });
    const res = await placeShopOrder({
      data: {
        customerName: name,
        phone,
        email,
        address,
        city,
        pincode,
        payment: "shop",
        lines: cart.lines,
      },
    });
    cart.clear();
    await navigate({ to: "/order/$code", params: { code: res.code } });
  }

  async function payRazorpay(method: "upi" | "card") {
    writeGuest({ name, phone, email });
    const start = await startRazorpayOrder({
      data: {
        customerName: name,
        phone,
        email,
        address,
        city,
        pincode,
        payment: method,
        lines: cart.lines,
      },
    });
    await openRazorpayCheckout({
      start,
      name,
      email,
      phone,
      method,
      onPaid: async (h) => {
        await confirmRazorpayPayment({
          data: {
            code: start.code,
            razorpay_payment_id: h.razorpay_payment_id,
            razorpay_order_id: h.razorpay_order_id,
            razorpay_signature: h.razorpay_signature,
          },
        });
        cart.clear();
        await navigate({ to: "/order/$code", params: { code: start.code } });
      },
      onFail: (msg) => setError(msg),
    });
  }

  async function onDetails(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (pay === "shop") await placeShop();
      else await payRazorpay(pay);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The order did not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <PageHero
        kicker="Checkout"
        title="Bill and payment."
        lede="Name, a phone, and Razorpay — UPI or card. The stone is reserved when the bank confirms."
        compact
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <form onSubmit={(e) => void onDetails(e)} className="rounded-[22px] bg-ivory p-6 shadow-card sm:p-8">
          <h2 className="font-display text-3xl">Where it should go</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="text-sm">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" />
            </label>
            <label className="text-sm">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="text-sm sm:col-span-2">
              <Label>Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </label>
            <label className="text-sm">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required />
            </label>
            <label className="text-sm">
              <Label>PIN</Label>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            </label>
          </div>
          <h3 className="mt-8 font-display text-2xl">Payment</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Razorpay merchant {rzp?.merchantId || SITE.razorpayMerchantId}
            {rzp?.api ? " · API connected" : rzp?.ready ? " · Key ID on file — add the secret on the desk" : " · paste Key ID on the desk"}
          </p>
          <div className="mt-3 grid gap-2">
            {PAY_METHODS.map((m) => (
              <label
                key={m.id}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-[16px] border p-4",
                  pay === m.id ? "border-garnet bg-garnet/5" : "border-ink/12",
                )}
              >
                <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} className="mt-1" />
                <span>
                  <span className="block font-medium">{m.label}</span>
                  <span className="text-sm text-ink-muted">{m.note}</span>
                </span>
              </label>
            ))}
          </div>
          {error ? <p className="mt-4 text-sm text-garnet">{error}</p> : null}
          <Button type="submit" disabled={busy} className="mt-6 w-full" size="lg">
            {busy ? "Opening…" : pay === "shop" ? "Place order" : `Pay ${inr(cart.total)} with Razorpay`}
          </Button>
        </form>
        <aside className="h-fit rounded-[22px] bg-ivory p-5 shadow-card">
          <h2 className="font-display text-2xl">Bag</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {cart.lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-3">
                <span>
                  {l.qty} × {l.name}
                </span>
                <span>{inr(l.qty * l.priceInr)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-display text-3xl">{inr(cart.total)}</p>
        </aside>
      </section>
    </SiteShell>
  );
}
