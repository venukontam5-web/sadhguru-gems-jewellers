import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { ProductPhoto } from "@/components/product-photo";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { inr } from "@/lib/shop";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => pageHead("Cart", "Your bag from Sadhguru Gems & Jewellers, Solapur.", "/cart"),
});

function CartPage() {
  const cart = useCart();
  return (
    <SiteShell>
      <PageHero kicker="Shop" title="Your bag." lede="Pieces held for you on this device. Checkout when you are ready." compact />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {!cart.lines.length ? (
          <div className="rounded-[22px] bg-ivory p-8 text-center shadow-card">
            <p className="text-sm text-ink-muted">The bag is empty. The cabinet is not.</p>
            <Link to="/shop" className={cn(buttonVariants(), "mt-5")}>
              Open the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {cart.lines.map((l) => (
                <li key={l.productId} className="flex gap-4 rounded-[22px] bg-ivory p-4 shadow-card">
                  <ProductPhoto src={l.imagePath} alt="" rounded="rounded-xl" className="size-24 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Link to="/shop/$slug" params={{ slug: l.slug }} className="font-display text-2xl font-semibold hover:text-garnet">
                      {l.name}
                    </Link>
                    <p className="mt-1 text-sm">{inr(l.priceInr)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-lg border border-ink/12"
                        onClick={() => cart.setQty(l.productId, l.qty - 1)}
                        aria-label="Less"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{l.qty}</span>
                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-lg border border-ink/12"
                        onClick={() => cart.setQty(l.productId, l.qty + 1)}
                        aria-label="More"
                      >
                        +
                      </button>
                      <button type="button" className="ml-auto text-sm text-garnet" onClick={() => cart.remove(l.productId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-ivory p-5 shadow-card">
              <p className="font-display text-3xl">{inr(cart.total)}</p>
              <Link to="/checkout" className={cn(buttonVariants({ size: "lg" }))}>
                Checkout
              </Link>
            </div>
            <Button type="button" variant="ghost" className="mt-4" onClick={() => cart.clear()}>
              Empty the bag
            </Button>
          </>
        )}
      </section>
    </SiteShell>
  );
}
