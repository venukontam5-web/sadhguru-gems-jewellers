import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Scale, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/layout/header";
import { HomeHero } from "@/components/home-hero";
import { GemCard } from "@/components/product-card";
import { RashiGuide } from "@/components/rashi-guide";
import { buttonVariants } from "@/components/ui/button";
import { NAVRATNA } from "@/data/gemstones";
import { SITE } from "@/data/site";
import { COLLECTION_CARDS } from "@/lib/shop";
import { ProductPhoto, MediaImg } from "@/components/product-photo";
import { SEED_REVIEWS } from "@/data/reviews";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => {
    const base = pageHead(
      "Certified Gemstones in Solapur",
      "Sadhguru Gems & Jewellers — Navratna gemstones, gold and silver jewellery, brass and copper ware. Akkalkot Road, Solapur.",
      "/",
    );
    return {
      ...base,
      links: [
        ...base.links,
        { rel: "preload", href: "/images/hero-ring.webp", as: "image", type: "image/webp" },
      ],
    };
  },
});

function Home() {
  return (
    <SiteShell>
      <HomeHero />

      <section id="collections" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">
              Our expertise
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold">Our sacred collections</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-ink-muted">
            Gemstones, crystal, mala, pearls, beads and brass pooja items from Solapur.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTION_CARDS.map((c, i) => (
            <Link
              key={c.title}
              to="/shop"
              search={{ category: c.category }}
              className="group overflow-hidden rounded-[24px] bg-ivory shadow-card"
            >
              <ProductPhoto
                src={c.image}
                alt={c.title}
                rounded="rounded-none"
                className="aspect-[4/3]"
                imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                priority={i < 2}
              />
              <div className="p-6">
                <h3 className="font-display text-2xl font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ivory py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">
                Navratna
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold">Nine stones, nine grahas</h2>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link to="/navratna" className="text-sm font-medium text-garnet hover:text-garnet-deep">
                Explore benefits
              </Link>
              <Link to="/colours" className="text-sm font-medium text-garnet hover:text-garnet-deep">
                Colour psychology
              </Link>
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {NAVRATNA.slice(0, 6).map((gem) => (
              <GemCard key={gem.slug} gem={gem} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <MediaImg
          src="/images/showroom.jpg"
          alt="The jewellery atelier interior"
          className="aspect-[4/3] w-full rounded-[28px] object-cover"
          sizes="(max-width: 1024px) 92vw, 560px"
        />
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">The house</p>
          <h2 className="mt-3 font-display text-4xl font-semibold">A cabinet, not a bazaar.</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Venugopal Nagnath Kontam opened the house in {SITE.established} after nine years on
            jewellery floors — from purchase assistant to store manager, including a season at
            Malabar Gold & Diamonds. We sell certified gemstones, make gold and silver to the
            stone, and keep brass and copper that is meant to be used.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: BadgeCheck, t: "Disclosure first", d: "Heat, oil, glass filling, lab-grown — written on the bill." },
              { icon: Scale, t: "Weight in front of you", d: "Gold and silver weighed on the counter scale, not in the back." },
              { icon: Sparkles, t: "Trial for Saturn stones", d: "Blue sapphire is not sold in a hurry. A trial is ordinary here." },
              { icon: MapPin, t: "One address", d: "106 / New Sunil Nagar, Kumbhari — not a franchise row." },
            ].map((item) => (
              <li key={item.t} className="flex gap-3">
                <item.icon className="mt-0.5 size-5 shrink-0 text-garnet" />
                <span>
                  <span className="block font-medium">{item.t}</span>
                  <span className="text-sm text-ink-muted">{item.d}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/about" className={cn(buttonVariants({ variant: "outline" }))}>
              The founder’s story
            </Link>
            <Link to="/why-us" className={cn(buttonVariants({ variant: "ghost" }))}>
              Why clients return
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <RashiGuide />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">
              From the book
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold">What people say</h2>
          </div>
          <Link to="/reviews" className="text-sm font-medium text-garnet">
            All reviews
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SEED_REVIEWS.slice(0, 3).map((r) => (
            <blockquote key={r.id} className="rounded-[22px] bg-ivory p-6 shadow-card">
              <p className="font-display text-xl font-semibold text-ink">{r.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{r.body}</p>
              <footer className="mt-5 text-xs tracking-wide text-stone uppercase">
                {r.name} · {r.city}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="blend-field overflow-hidden">
        <MediaImg src="/images/gold-necklace.jpg" alt="" className="blend-photo hero-media" sizes="100vw" />
        <div className="blend-gilt" aria-hidden="true" />
        <div className="blend-wash" aria-hidden="true" />
        <div className="blend-stage mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="blend-kicker text-xs tracking-[0.22em] uppercase">Visit</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold">
            Akkalkot Road, Kumbhari. The door is open seven days.
          </h2>
          <p className="mt-4 max-w-md text-parchment/75">
            {SITE.address.line1}, {SITE.address.line2}, {SITE.address.locality}. {SITE.hours}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className={cn(buttonVariants({ size: "lg" }))}>
              Contact & map
            </Link>
            <Link to="/about" className={cn(buttonVariants({ variant: "ivory", size: "lg" }))}>
              About the house
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
