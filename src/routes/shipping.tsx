import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/shipping")({
  component: ShippingPage,
  head: () =>
    pageHead(
      "Shipping",
      "How Sadhguru Gems & Jewellers sends stones and metals across India — insured, photographed, and packed as if they were going a long way.",
      "/shipping",
    ),
});

function ShippingPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Shipping"
        title="India delivery, packed as if it were going a long way."
        lede="We prefer you to collect from Akkalkot Road. When a piece must travel, it goes insured, photographed, and named on the bill."
        image="/images/showroom.jpg"
      />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        {[
          {
            t: "Collect in Solapur",
            d: "The shop is open all seven days, 9:30 AM – 8:30 PM. A stone should be seen in north daylight before it is paid for. That is still the best way.",
          },
          {
            t: "India post and courier",
            d: "Malas, brass, copper and confirmed gemstones ship by insured courier. You receive photographs of the packed piece and a tracking number on WhatsApp.",
          },
          {
            t: "Gemstones",
            d: "Loose stones travel in a sealed pouch with a copy of any laboratory note. We do not put a Neelam in a padded envelope and hope.",
          },
          {
            t: "Returns",
            d: "A piece that is not what was described comes back. A change of mind after a stone has been set is a conversation, not a policy page.",
          },
        ].map((s) => (
          <article key={s.t}>
            <h2 className="font-display text-3xl font-semibold">{s.t}</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">{s.d}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
