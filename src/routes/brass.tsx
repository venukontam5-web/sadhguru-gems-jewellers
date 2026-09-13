import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { EnquireForm } from "@/components/enquire-form";
import { BRASS_ITEMS } from "@/data/products";
import { pageHead } from "@/lib/seo";
import { ProductPhoto } from "@/components/product-photo";

export const Route = createFileRoute("/brass")({
  component: BrassPage,
  head: () =>
    pageHead(
      "Brass Items",
      "Temple brass from Sadhguru Gems & Jewellers — deepams, Ganesha murtis, kalash, urli bowls, bells and pooja thalis.",
      "/brass",
    ),
});

function BrassPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Collection · Brass"
        title="Metal that is meant to be lit."
        lede="Deepams, murtis, kalash, bells and thalis in temple-grade brass. We do not sell foil that dents at the first festival."
        image="/images/brass-collection.jpg"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8">
          {BRASS_ITEMS.map((item) => (
            <article
              id={item.slug}
              key={item.slug}
              className="grid scroll-mt-28 overflow-hidden rounded-[24px] bg-ivory shadow-card md:grid-cols-2"
            >
              <ProductPhoto
                src={item.image}
                alt={item.name}
                rounded="rounded-none"
                className="h-64 w-full md:h-full"
              />
              <div className="p-7 sm:p-9">
                <p className="text-xs tracking-[0.18em] text-garnet uppercase">{item.priceNote}</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{item.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.description}</p>
                <p className="mt-4 text-sm text-ink">
                  <span className="text-stone">Care. </span>
                  {item.care}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-14 max-w-xl">
          <EnquireForm subject="Brass items" heading="Commission or stock enquiry" />
        </div>
      </section>
    </SiteShell>
  );
}
