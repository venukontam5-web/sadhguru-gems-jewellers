import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { RashiGuide } from "@/components/rashi-guide";
import { buttonVariants } from "@/components/ui/button";
import { NAVRATNA, getGemstone } from "@/data/gemstones";
import { NAVRATNA_LORE, NAVRATNA_TRAY, getNavratnaLore } from "@/data/navratna";
import { whatsappHref } from "@/data/site";
import { pageHead, itemListJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { cn } from "@/lib/utils";
import { MediaImg } from "@/components/product-photo";

export const Route = createFileRoute("/navratna")({
  component: NavratnaPage,
  head: () =>
    pageHead(
      "Navratna gemstones in Solapur — nine graha stones",
      "Official Navratna cabinet in Solapur: ruby, pearl, coral, emerald, yellow sapphire (Pukhraj), diamond, blue sapphire (Neelam), hessonite and cat’s eye. Sadhguru Gems & Jewellers.",
      "/navratna",
    ),
});

function NavratnaPage() {
  const [slug, setSlug] = useState("ruby");

  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (fromHash && NAVRATNA_LORE[fromHash]) setSlug(fromHash);
  }, []);

  function select(next: string) {
    setSlug(next);
    window.history.replaceState(null, "", `#${next}`);
  }

  const gem = getGemstone(slug);
  const lore = getNavratnaLore(slug);
  if (!gem || !lore) return null;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Navratna gemstones Solapur", path: "/navratna" },
        ])}
      />
      <JsonLd
        data={itemListJsonLd(
          "Nine Navratna gemstones",
          NAVRATNA.map((g) => ({ name: `${g.name} (${g.sanskrit})`, path: `/gemstones/${g.slug}` })),
        )}
      />
      <JsonLd
        data={faqJsonLd([
          {
            q: "What are Navratna gemstones?",
            a: "The nine Navratna are ruby, pearl, red coral, emerald, yellow sapphire, diamond, blue sapphire, hessonite and cat’s eye. Sadhguru Gems & Jewellers keeps a certified cabinet of them in Solapur.",
          },
          {
            q: "Where to buy Navratna in Solapur?",
            a: "At Sadhguru Gems & Jewellers, 106 New Sunil Nagar, Akkalkot Road, Kumbhari, Solapur 413006, or at the official website sadhgurugemsandjewellers.com.",
          },
        ])}
      />
      <PageHero
        kicker="Navratna"
        title="Nine stones. Nine grahas. Benefits as the old books named them."
        lede="A Navratna is a small solar system in gold: Sun at the centre, the other eight around it. Tap a stone in the tray. What follows is classical Indian gem lore — not a diagnosis, not a guarantee."
        image="/images/navratna.jpg"
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.2em] text-garnet uppercase">
              The tray · Sun at centre
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Choose a stone</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              This is a common North Indian setting. Regional houses shift the outer eight.
              The centre does not move: ruby for Surya.
            </p>
            <div
              className="mt-6 grid max-w-[22rem] grid-cols-3 gap-2 rounded-[24px] bg-ink p-3 sm:gap-2.5 sm:p-3.5"
              role="listbox"
              aria-label="Navratna tray"
            >
              {NAVRATNA_TRAY.flat().map((s) => {
                const g = getGemstone(s);
                if (!g) return null;
                const active = s === slug;
                return (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-label={`${g.name}, ${g.sanskrit}`}
                    aria-selected={active}
                    onClick={() => select(s)}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-[14px] text-left transition-transform duration-150",
                      active
                        ? "ring-2 ring-bronze ring-offset-2 ring-offset-ink"
                        : "opacity-80 hover:opacity-100",
                    )}
                  >
                    <MediaImg src={g.image} alt="" className="product-shot size-full bg-ivory object-contain" sizes="20vw" />
                    <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-1.5 py-1 text-center text-[10px] tracking-wide text-parchment uppercase sm:text-[11px]">
                      {g.sanskrit}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-stone">
              Emerald · Pearl · Pukhraj / Diamond · Ruby · Coral / Neelam · Gomed · Lehsunia
            </p>
          </div>

          <article className="lg:col-span-7">
            <div className="overflow-hidden rounded-[24px] bg-ivory shadow-card">
              <div className="flex gap-5 p-5 sm:p-7">
                <MediaImg
                  src={gem.image}
                  alt={gem.name}
                  className="product-shot size-28 shrink-0 rounded-[16px] bg-ivory object-contain sm:size-36"
                  sizes="144px"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-[0.18em] text-garnet uppercase">
                    {gem.sanskrit} · {gem.planetSanskrit}
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{gem.name}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{lore.house}</p>
                  <p className="mt-3 text-xs text-stone">
                    {gem.metal} · {gem.finger} · {gem.day}
                  </p>
                </div>
              </div>
              <div className="border-t border-line px-5 py-6 sm:px-7">
                <h4 className="text-xs font-medium tracking-[0.18em] text-garnet uppercase">
                  Traditional benefits
                </h4>
                <ul className="mt-3 space-y-2">
                  {lore.benefits.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-bronze" />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm leading-relaxed text-ink-muted">{lore.body}</p>
                <p className="mt-4 rounded-[14px] bg-parchment px-4 py-3 text-sm text-ink-muted">
                  <span className="font-medium text-ink">From the counter. </span>
                  {lore.caution}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/gemstones/$slug"
                    params={{ slug: gem.slug }}
                    className={cn(buttonVariants())}
                  >
                    See this stone
                  </Link>
                  <a
                    href={whatsappHref(
                      `Namaste, I would like to ask about ${gem.name} (${gem.sanskrit}) in the Navratna.`,
                    )}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Enquire
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">All nine, in one glance</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            A complete Navratna is nine stones in one setting. Most people begin with a single
            graha. Both are traditional.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs tracking-[0.14em] text-stone uppercase">
                  <th className="py-3 pr-4 font-medium">Stone</th>
                  <th className="py-3 pr-4 font-medium">Graha</th>
                  <th className="py-3 pr-4 font-medium">Asked for</th>
                  <th className="py-3 font-medium">First wear</th>
                </tr>
              </thead>
              <tbody>
                {NAVRATNA.map((g) => {
                  const l = getNavratnaLore(g.slug);
                  return (
                    <tr key={g.slug} className="border-b border-line/70">
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => {
                            select(g.slug);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="font-medium text-ink hover:text-garnet"
                        >
                          {g.name}
                          <span className="ml-2 text-stone">({g.sanskrit})</span>
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-ink-muted">
                        {g.planet} · {g.planetSanskrit}
                      </td>
                      <td className="py-3 pr-4 text-ink-muted">{l?.benefits[0]}</td>
                      <td className="py-3 text-ink-muted">
                        {g.day} · {g.finger}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          {
            t: "The full set",
            d: "Nine stones, one gold. Worn as a ring, pendant, or kundan plaque. It is a complete statement of the grahas — usually after a reading, not the week of a wedding.",
          },
          {
            t: "A single stone",
            d: "Most of our cabinet work is one graha, well chosen. A Pukhraj or a Moonga, named honestly, will do more than nine doubtful chips glued in a hurry.",
          },
          {
            t: "What we will not say",
            d: "A gem is not a medicine, a court order, or a fixed deposit. We speak the old associations because that is the language of this craft. We will not promise a result.",
          },
        ].map((c) => (
          <article key={c.t} className="rounded-[22px] bg-ivory p-6 shadow-card">
            <h3 className="font-display text-2xl font-semibold">{c.t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{c.d}</p>
          </article>
        ))}
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <RashiGuide />
        </div>
      </section>
    </SiteShell>
  );
}
