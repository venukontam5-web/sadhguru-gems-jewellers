import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { EnquireForm } from "@/components/enquire-form";
import { inr } from "@/lib/shop";
import { getProductBySlug } from "@/server/catalogue";
import { whatsappHref } from "@/data/site";
import { pageHead } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCartButton } from "@/components/add-to-cart";

export const Route = createFileRoute("/shop/$slug")({
  component: ShopItem,
  loader: async ({ params }) => {
    const p = await getProductBySlug({ data: { slug: params.slug } });
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(
          loaderData.name,
          `${loaderData.name} — ${inr(loaderData.priceInr)}. ${loaderData.description}`,
          `/shop/${loaderData.slug}`,
        )
      : pageHead("Piece", "A piece from the Solapur cabinet.", "/shop"),
});

function ShopItem() {
  const p = Route.useLoaderData();
  return (
    <SiteShell>
      <article className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <ProductGallery images={p.images?.length ? p.images : [p.imagePath]} alt={p.name} />
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-garnet uppercase">
            {p.category}
            {p.badge ? ` · ${p.badge}` : ""}
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold">{p.name}</h1>
          <p className="mt-4 text-2xl font-medium">
            {inr(p.priceInr)}
            {p.compareAt ? (
              <span className="ml-3 text-base text-stone line-through">{inr(p.compareAt)}</span>
            ) : null}
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{p.description}</p>
          <p className="mt-3 text-sm text-ink-muted">
            {p.stock > 0 ? `${p.stock} in the cabinet today.` : "Currently spoken for — ask for the next."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton product={p} size="lg" />
            <a
              href={whatsappHref(`Namaste, I would like to reserve ${p.name} (${inr(p.priceInr)}).`)}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Reserve on WhatsApp
            </a>
            <Link to="/checkout" className={cn(buttonVariants({ variant: "gold" }))}>
              Checkout
            </Link>
          </div>
        </div>
      </article>
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <EnquireForm subject={p.name} heading={`Ask about ${p.name}`} />
      </section>
    </SiteShell>
  );
}
