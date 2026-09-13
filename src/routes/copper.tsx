import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { EnquireForm } from "@/components/enquire-form";
import { COPPER_ITEMS } from "@/data/products";
import { pageHead } from "@/lib/seo";
import { ProductPhoto } from "@/components/product-photo";

export const Route = createFileRoute("/copper")({
  component: CopperPage,
  head: () =>
    pageHead(
      "Copper Made Items",
      "Ayurvedic copper ware from Sadhguru Gems & Jewellers — water bottles, tumblers, thalis, handis and yantras.",
      "/copper",
    ),
});

function CopperPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Collection · Copper"
        title="Copper that is copper all the way through."
        lede="Bottles for overnight water, thalis, lotas, cooking handis and yantras. Lined or unlined is written on the ticket. Plated steel is not sold as copper."
        image="/images/copper-collection.jpg"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-12 max-w-2xl text-base leading-relaxed text-ink-muted">
          Ayurveda asks for water that has rested in copper. That only works if the wall of the
          vessel is the metal, not a wash. We keep bottles and glasses for that use, and tin-lined
          pots for food.
        </div>
        <div className="grid gap-8">
          {COPPER_ITEMS.map((item) => (
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
          <EnquireForm subject="Copper ware" heading="Ask for a set" />
        </div>
      </section>
    </SiteShell>
  );
}
