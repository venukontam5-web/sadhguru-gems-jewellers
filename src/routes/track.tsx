import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { getOrderByCode } from "@/server/catalogue";
import { getShopOrder } from "@/server/shop-orders";
import { SatisfactionAsk } from "@/components/satisfaction";
import type { ShopOrder } from "@/lib/shop";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/track")({
  component: TrackPage,
  head: () =>
    pageHead(
      "Track order",
      "Track a piece from Sadhguru Gems & Jewellers with the code written on your bill.",
      "/track",
    ),
});

function TrackPage() {
  const [code, setCode] = useState("SGJ-1842");
  const [order, setOrder] = useState<ShopOrder | null | undefined>(undefined);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const row = (await getShopOrder({ data: { code } }).catch(() => null)) ?? (await getOrderByCode({ data: { code } }));
    setOrder(row);
  }

  return (
    <SiteShell>
      <PageHero
        kicker="Orders"
        title="Track a piece."
        lede="Enter the code from your bill or WhatsApp note. Sample in the cabinet: SGJ-1842."
        image="/images/showroom.jpg"
      />
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <form onSubmit={(e) => void onSubmit(e)} className="rounded-[22px] bg-ivory p-6 shadow-card">
          <Label htmlFor="code">Order code</Label>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Button type="submit" className="mt-4">
            Look up
          </Button>
        </form>
        {order === null ? (
          <p className="mt-6 text-sm text-ink-muted">No order with that code. Ask the shop on WhatsApp.</p>
        ) : null}
        {order ? (
          <>
          <div className="mt-6 rounded-[22px] bg-ivory p-6 shadow-card">
            <p className="text-xs tracking-[0.16em] text-garnet uppercase">{order.code}</p>
            <h2 className="mt-2 font-display text-3xl">{order.item}</h2>
            <p className="mt-2 text-sm text-ink-muted">For {order.customerName}</p>
            <p className="mt-4 text-lg font-medium">{order.status}</p>
            {order.paymentStatus ? (
              <p className="mt-1 text-sm text-ink-muted">{order.payment} · {order.paymentStatus}</p>
            ) : null}
          </div>
          <div className="mt-6">
            <SatisfactionAsk code={order.code} initialSatisfied={order.satisfied} initialFeedback={order.feedback} />
          </div>
          </>
        ) : null}
      </div>
    </SiteShell>
  );
}
