import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { PRODUCT_CATEGORIES, inr } from "@/lib/shop";
import { listActiveProducts } from "@/server/catalogue";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { ProductPhoto } from "@/components/product-photo";
import { AddToCartButton } from "@/components/add-to-cart";

export const Route = createFileRoute("/shop/")({
  component: ShopPage,
  validateSearch: (s: Record<string, unknown>): { category?: string } => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  loaderDeps: ({ search }) => ({ category: search.category ?? "all" }),
  loader: ({ deps }) => listActiveProducts({ data: { category: deps.category } }),
  head: () =>
    pageHead(
      "Shop",
      "Gemstones, crystals, malas, pearls and brass from Sadhguru Gems & Jewellers, Solapur. Enquire to reserve.",
      "/shop",
    ),
});

function ShopPage() {
  const products = Route.useLoaderData();
  const { category } = Route.useSearch();
  const current = category ?? "all";

  return (
    <SiteShell>
      <PageHero
        kicker="Shop"
        title="The working cabinet, with prices."
        lede="Enquire to reserve a stone or a mala. We do not take a card over the internet — the piece leaves after you have seen it, or after a clear photograph and a conversation."
        image="/images/showroom.jpg"
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/shop"
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              current === "all" ? "bg-ink text-parchment" : "bg-ivory text-ink",
            )}
          >
            All
          </Link>
          {PRODUCT_CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/shop"
              search={{ category: c }}
              className={cn(
                "rounded-full px-4 py-2 text-sm",
                current === c ? "bg-ink text-parchment" : "bg-ivory text-ink",
              )}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <article key={p.id} className="group overflow-hidden rounded-[22px] bg-ivory shadow-card">
              <Link to="/shop/$slug" params={{ slug: p.slug }} className="block">
                <div className="relative aspect-square overflow-hidden bg-ivory">
                  <ProductPhoto
                    src={p.imagePath}
                    alt={p.name}
                    rounded="rounded-none"
                    className="aspect-square"
                    imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                    priority={i < 2}
                  />
                  {p.badge ? (
                    <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-2 py-1 text-[10px] tracking-wide text-parchment uppercase">
                      {p.badge}
                    </span>
                  ) : null}
                </div>
              </Link>
              <div className="p-5">
                <p className="text-xs tracking-wide text-stone uppercase">{p.category}</p>
                <Link to="/shop/$slug" params={{ slug: p.slug }}>
                  <h2 className="mt-1 font-display text-2xl font-semibold">{p.name}</h2>
                </Link>
                <p className="mt-2 text-sm">
                  <span className="font-medium">{inr(p.priceInr)}</span>
                  {p.compareAt ? (
                    <span className="ml-2 text-stone line-through">{inr(p.compareAt)}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {p.stock > 0 ? `${p.stock} in cabinet` : "Ask for the next piece"}
                </p>
                <AddToCartButton product={p} className="mt-4 w-full" size="sm" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
