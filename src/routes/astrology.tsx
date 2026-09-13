import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { RashiGuide } from "@/components/rashi-guide";
import { EnquireForm } from "@/components/enquire-form";
import { pageHead } from "@/lib/seo";
import { getAstrologyCopy } from "@/server/admin";

export const Route = createFileRoute("/astrology")({
  loader: async () => {
    try {
      return await getAstrologyCopy();
    } catch {
      return {
        heading: "A rashi is a starting point, not a prescription.",
        lede: "We will sit with a chart if you have one. We will not sell a blue sapphire in a hurry.",
        offerNote: "Ask for a reading at the counter. Tradition, not a medical claim.",
      };
    }
  },
  component: AstrologyPage,
  head: () =>
    pageHead(
      "Astrology & rashi",
      "Rashi and weekday guidance for Navratna stones at Sadhguru Gems & Jewellers. Tradition, not a medical claim.",
      "/astrology",
    ),
});

function AstrologyPage() {
  const copy = Route.useLoaderData();
  return (
    <SiteShell>
      <PageHero
        kicker="Jyotisha"
        title={copy.heading}
        lede={copy.lede}
        image="/images/navratna.jpg"
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <RashiGuide />
        <div className="mt-12 max-w-2xl">
          <EnquireForm subject="Astrology report" heading={copy.offerNote} />
        </div>
      </div>
    </SiteShell>
  );
}