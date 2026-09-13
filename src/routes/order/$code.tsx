import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { SatisfactionAsk } from "@/components/satisfaction";
import { getShopOrder } from "@/server/shop-orders";
import { inr } from "@/lib/shop";
import { pageHead } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order/$code")({
  component: OrderThanks,
  loader: async ({ params }) => getShopOrder({ data: { code: params.code } }),
  head: ({ params }) => pageHead(`Order ${params.code}`, "Your bill from Sadhguru Gems & Jewellers.", `/order/${params.code}`),
});

function OrderThanks() {
  const order = Route.useLoaderData();
  if (!order) {
    return (
      <SiteShell>
        <PageHero kicker="Order" title="No bill with that code." compact />
        <div className="mx-auto max-w-lg px-4 py-12">
          <Link to="/track" className={cn(buttonVariants())}>
            Track an order
          </Link>
        </div>
      </SiteShell>
    );
  }
  return (
    <SiteShell>
      <PageHero
        kicker={order.code}
        title={order.paymentStatus === "Paid" ? "The house has the payment." : "The house has the order."}
        lede={`${order.item}. Track with ${order.code}.`}
        compact
      />
      <section className="mx-auto grid max-w-3xl gap-6 px-4 py-12 sm:px-6">
        <div className="rounded-[22px] bg-ivory p-6 shadow-card">
          <p className="text-xs tracking-[0.18em] text-garnet uppercase">{order.status}</p>
          <p className="mt-2 font-display text-4xl">{order.amount ? inr(order.amount) : order.item}</p>
          <p className="mt-2 text-sm text-ink-muted">
            {order.customerName}
            {order.phone ? ` · ${order.phone}` : ""}
            {order.payment ? ` · ${order.payment}` : ""}
            {order.paymentStatus ? ` · ${order.paymentStatus}` : ""}
          </p>
          {order.address ? (
            <p className="mt-3 text-sm text-ink-muted">
              {order.address}, {order.city} {order.pincode}
            </p>
          ) : null}
          <Link to="/track" className={cn(buttonVariants({ variant: "outline" }), "mt-5")}>
            Track this order
          </Link>
        </div>
        <SatisfactionAsk code={order.code} initialSatisfied={order.satisfied} initialFeedback={order.feedback} />
      </section>
    </SiteShell>
  );
}
