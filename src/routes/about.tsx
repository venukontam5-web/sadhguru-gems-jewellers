import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { BrandMark } from "@/components/logo";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { FOUNDER, FOUNDER_TIMELINE } from "@/data/founder";
import { SITE } from "@/data/site";
import { pageHead, personJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { MediaImg } from "@/components/product-photo";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () =>
    pageHead(
      "About Us — Venugopal Nagnath Kontam",
      "The story of Venugopal Nagnath Kontam, Founder & CEO of Sadhguru Gems & Jewellers — from the jewellery floor in 2007 to the house on Akkalkot Road, Solapur, in 2016.",
      "/about",
    ),
});

function AboutPage() {
  return (
    <SiteShell>
      <JsonLd data={personJsonLd()} />
      <PageHero
        kicker="About us"
        title="The story of Venugopal Nagnath Kontam"
        lede={`${FOUNDER.role} — ${FOUNDER.house}. A Solapur jewellery professional, entrepreneur, and lifelong learner.`}
        image="/images/heritage.jpg"
      />

      <article>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-display text-2xl italic leading-snug text-ink sm:text-3xl">
              {FOUNDER.greeting}
            </p>
            <p className="mt-8 text-lg leading-relaxed text-ink">
              Venugopal Nagnath Kontam is a jewellery professional, entrepreneur, and lifelong
              learner from Solapur, Maharashtra. Born on {FOUNDER.bornLabel}, his working life has
              been bound to gems and jewellery — retail, sales, purchasing, store operations, team
              management, training, and the quiet work of customer service.
            </p>

            <h2 className="mt-14 font-display text-3xl font-semibold">
              From experience to entrepreneurship
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              The journey began in {FOUNDER.industryStart}, on a jewellery floor. Starting from the
              fundamentals of retail, he took on greater responsibility in turn:{" "}
              {FOUNDER.roles.slice(0, -1).join(", ")}, and {FOUNDER.roles[FOUNDER.roles.length - 1]}.
              Each desk taught a different part of the trade — the stone, the customer, the
              operations, the team, and why trust is the only currency that lasts in jewellery.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              His professional experience includes association with {FOUNDER.exposure}, where he
              saw organised jewellery retail and a customer-centric floor at scale.
            </p>

            <ol className="relative mt-12 border-l border-line pl-8">
              {FOUNDER_TIMELINE.map((era) => (
                <li key={era.year} className="mb-10 last:mb-0">
                  <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-garnet" />
                  <p className="text-xs font-medium tracking-[0.18em] text-garnet uppercase">
                    {era.year}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">{era.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">{era.body}</p>
                </li>
              ))}
            </ol>

            <h2 className="mt-14 font-display text-3xl font-semibold">
              A passion for learning
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Professional growth does not stop at a title. Alongside the floor, Venugopal has kept
              studying marketing, customer relationship management, business strategy, and the
              tools of a modern shop. An {FOUNDER.education} gave a formal language for customer
              behaviour, branding, sales, and growth.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              He has been an active learner in the Salesforce Trailblazer Community — exploring how
              CRM and marketing can deepen a relationship rather than merely log it. Work as a
              Training Partner and Assessor with the {FOUNDER.training} confirmed a second calling:
              teaching the craft, and holding the industry to a standard.
            </p>

            <h2 className="mt-14 font-display text-3xl font-semibold">
              The birth of Sadhguru Gems & Jewellers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              With those years behind him, Venugopal established {FOUNDER.house} in{" "}
              {FOUNDER.founded}. The shop was never meant to be simply another jewellery store. It
              was imagined as a place where jewellery, trust, craftsmanship, service, and customer
              happiness come together.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Every piece can stand for love, tradition, achievement, celebration, or a lifelong
              memory. Understanding that responsibility has shaped how the cabinet is kept, and how
              a customer is received.
            </p>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-[24px] bg-ivory p-7 shadow-card">
                <div className="flex items-center gap-4">
                  <BrandMark className="size-14 rounded-2xl" />
                  <div>
                    <p className="text-xs tracking-[0.2em] text-garnet uppercase">At a glance</p>
                    <p className="mt-1 font-display text-2xl font-semibold leading-tight">
                      {FOUNDER.shortName}
                    </p>
                    <p className="text-sm text-ink-muted">{FOUNDER.role}</p>
                  </div>
                </div>
                <dl className="mt-6 space-y-3 text-sm">
                  {FOUNDER.glance.map(([k, v]) => (
                    <div key={k} className="border-t border-line pt-3 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-3">
                      <dt className="text-stone">{k}</dt>
                      <dd className="mt-0.5 text-ink sm:mt-0">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-6 rounded-[24px] bg-ivory p-7 shadow-card">
                <p className="text-xs tracking-[0.2em] text-garnet uppercase">The shop</p>
                <address className="mt-3 not-italic text-sm leading-relaxed text-ink-muted">
                  {SITE.address.line1}
                  <br />
                  {SITE.address.line2}
                  <br />
                  {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
                </address>
                <p className="mt-3 text-sm text-ink-muted">
                  {SITE.hours} · {SITE.hoursNote}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/contact" className={cn(buttonVariants())}>
                    Visit the shop
                  </Link>
                  <Link to="/why-us" className={cn(buttonVariants({ variant: "outline" }))}>
                    Why us
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <MediaImg
            src="/images/gold-necklace.jpg"
            alt="A kundan necklace held in the light"
            className="aspect-[21/9] w-full rounded-[24px] object-cover"
            sizes="100vw"
          />
        </div>

        <section className="bg-ink px-4 py-16 text-parchment sm:px-6 sm:py-20">
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-[0.22em] text-bronze-soft uppercase">His philosophy</p>
            <p className="mt-5 font-display text-3xl font-semibold leading-snug sm:text-4xl">
              “{FOUNDER.quoteJewellery}”
            </p>
            <footer className="mt-6 text-sm text-parchment/60">{FOUNDER.name}</footer>
          </blockquote>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">
            A customer-first philosophy
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            The measure is the relationship, not only the sale.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            At {FOUNDER.house}, the vision is customer satisfaction, transparency, service, quality,
            and trust. From understanding a requirement to finding the right design, the method is
            to listen first and serve with care. A customer should leave feeling:
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {FOUNDER.feelings.map((f) => (
              <li
                key={f}
                className="rounded-full border border-line bg-ivory px-5 py-2.5 text-sm font-medium"
              >
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">
                Tradition, creativity & modern design
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">
                Heritage in one hand, a living design in the other.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                The house aspires to distinctive work across Indian jewellery traditions and
                contemporary sense — for men and for women. The aim is not to chase every trend,
                but to understand how jewellery is evolving, and to keep a thread between heritage
                and modern elegance.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FOUNDER.styles.map((s) => (
                <li
                  key={s}
                  className="rounded-[20px] bg-ivory px-4 py-6 text-center shadow-card"
                >
                  <span className="font-display text-xl font-semibold">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y border-line bg-ivory">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
            <div>
              <p className="text-xs tracking-[0.22em] text-garnet uppercase">Our vision</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">What the house is for</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">{FOUNDER.vision}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.22em] text-garnet uppercase">Our promise</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">More than a transaction</h2>
              <ul className="mt-4 space-y-2 text-base leading-relaxed text-ink-muted">
                {FOUNDER.promise.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-xs tracking-[0.22em] text-garnet uppercase">The vision ahead</p>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            The future of jewellery, as Venugopal sees it, is traditional craftsmanship, clear
            thinking, exceptional service, useful technology, and customer trust held in the same
            hand. From a learner on the floor to an entrepreneur with a house of his own — the
            work is still to grow, and still to stay honest.
          </p>
          <blockquote className="mt-10">
            <p className="font-display text-3xl font-semibold leading-snug text-ink sm:text-4xl">
              “{FOUNDER.quoteLegacy}”
            </p>
            <footer className="mt-5 text-sm text-ink-muted">{FOUNDER.name}</footer>
          </blockquote>
          <Link to="/contact" className={cn(buttonVariants({ size: "lg" }), "mt-10")}>
            Come to the cabinet
          </Link>
        </section>

        <section className="bg-parchment-deep px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-semibold">What this house will not do</h2>
            <ul className="mt-5 space-y-2 text-ink-muted">
              <li>Sell citrine as yellow sapphire, or quartz cat’s eye as chrysoberyl.</li>
              <li>Promise that a stone will change a career, a marriage, or a medical report.</li>
              <li>Hide making charges inside a “package” rate for gold.</li>
              <li>Press a blue sapphire on a first visit.</li>
            </ul>
          </div>
        </section>
      </article>
    </SiteShell>
  );
}
