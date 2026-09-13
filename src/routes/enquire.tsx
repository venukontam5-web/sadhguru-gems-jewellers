import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { EnquireForm } from "@/components/enquire-form";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/enquire")({
  component: EnquirePage,
  head: () =>
    pageHead(
      "Enquire",
      "Write to Sadhguru Gems & Jewellers, Solapur — gemstones, malas, brass and copper.",
      "/enquire",
    ),
});

function EnquirePage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Enquire"
        title="Write to the cabinet."
        lede={`The fastest reply is WhatsApp. The shop is open ${SITE.hours}, all seven days.`}
        image="/images/showroom.jpg"
      />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EnquireForm heading="Send a note" />
      </div>
    </SiteShell>
  );
}
