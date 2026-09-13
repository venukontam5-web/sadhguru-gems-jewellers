import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { EnquireForm } from "@/components/enquire-form";
import { GEMSTONES, getGemstone } from "@/data/gemstones";
import { getNavratnaLore } from "@/data/navratna";
import { whatsappHref } from "@/data/site";
import { pageHead } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductPhoto, MediaImg } from "@/components/product-photo";

export const Route = createFileRoute("/gemstones/$slug")({
  component: GemstonePage,
  loader: ({ params }) => {
    const gem = getGemstone(params.slug);
    if (!gem) throw notFound();
    return gem;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(
          `${loaderData.name} (${loaderData.sanskrit})`,
          `${loaderData.name} — ${loaderData.sanskrit}, stone of ${loaderData.planet}. ${loaderData.excerpt}`,
          `/gemstones/${loaderData.slug}`,
        )
      : pageHead("Gemstone", "Certified gemstone at Sadhguru Gems & Jewellers.", "/gemstones"),
});

function GemstonePage() {
  const gem = Route.useLoaderData();
  const related = GEMSTONES.filter((g) => g.slug !== gem.slug && g.group === gem.group).slice(0, 3);
  const lore = getNavratnaLore(gem.slug);

  return (
    <SiteShell>
      <article className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <ProductPhoto
            src={gem.image}
            alt={`${gem.name} gemstone`}
            rounded="rounded-[28px]"
            className="aspect-square w-full shadow-card"
            priority
            sizes="(max-width: 1024px) 92vw, 560px"
          />
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-garnet uppercase">
            {gem.group === "navratna" ? "Navratna" : "Cabinet"} · {gem.sanskrit}
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold">{gem.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">{gem.excerpt}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {[
              ["Graha", `${gem.planet} (${gem.planetSanskrit})`],
              ["Colour", gem.color],
              ["Hardness", gem.hardness],
              ["Metal", gem.metal],
              ["Finger", gem.finger],
              ["Day", gem.day],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[16px] bg-ivory px-4 py-3 shadow-card">
                <dt className="text-[11px] tracking-[0.14em] text-stone uppercase">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappHref(`Namaste, I would like to enquire about ${gem.name} (${gem.sanskrit}).`)}
              className={cn(buttonVariants())}
            >
              Enquire on WhatsApp
            </a>
            <Link to="/contact" className={cn(buttonVariants({ variant: "outline" }))}>
              Visit the shop
            </Link>
          </div>
        </div>
      </article>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-3xl font-semibold">In the cabinet</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{gem.description}</p>
          <h2 className="mt-10 font-display text-3xl font-semibold">In the tradition</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{gem.tradition}</p>
          {lore ? (
            <div className="mt-8 rounded-[18px] bg-ivory p-5 shadow-card">
              <p className="text-xs font-medium tracking-[0.16em] text-garnet uppercase">
                Traditional benefits
              </p>
              <ul className="mt-3 space-y-2">
                {lore.benefits.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-bronze" />
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-ink-muted">{lore.caution}</p>
              <Link
                to="/navratna"
                className="mt-4 inline-block text-sm font-medium text-garnet hover:text-garnet-deep"
              >
                Explore all nine Navratna benefits
              </Link>
            </div>
          ) : null}
          <p className="mt-6 text-sm text-ink-muted">
            <span className="font-medium text-ink">Usual origins. </span>
            {gem.origin}
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            <span className="font-medium text-ink">A note from the counter. </span>
            {gem.note}
          </p>
        </div>
        <div className="lg:col-span-2">
          <EnquireForm subject={gem.name} heading={`Ask about ${gem.name}`} />
        </div>
      </section>
      {related.length ? (
        <section className="border-t border-line bg-ivory py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-semibold">Nearby in the tray</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  to="/gemstones/$slug"
                  params={{ slug: g.slug }}
                  className="flex items-center gap-4 rounded-[18px] bg-parchment p-3 shadow-card"
                >
                  <MediaImg src={g.image} alt="" className="size-16 rounded-[12px] object-cover" sizes="64px" />
                  <span>
                    <span className="block font-display text-lg">{g.name}</span>
                    <span className="text-xs text-ink-muted">{g.sanskrit}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
