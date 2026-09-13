import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { MARKETING, SITE } from "@/data/site";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () =>
    pageHead(
      "Privacy",
      "Privacy, cookies, Google Analytics and Google Ads on the Sadhguru Gems & Jewellers website.",
      "/privacy",
    ),
});

function PrivacyPage() {
  const live = Boolean(MARKETING.gaMeasurementId || MARKETING.googleAdsId || MARKETING.gtmId);
  return (
    <SiteShell>
      <PageHero
        kicker="Legal"
        title="Privacy, measurement, and the shop."
        compact
      />
      <article className="mx-auto max-w-2xl px-4 py-12 text-sm leading-relaxed text-ink-muted sm:px-6">
        <p>
          {SITE.legalName} (“we”) runs this website for {SITE.domain}. Enquiries you type into a
          form on these pages are stored in your browser so you can see a confirmation, and may be
          sent on to us by WhatsApp or email if you continue that way. We do not sell lists of
          visitors.
        </p>
        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Google services</h2>
        <p className="mt-3">
          The site is built to accept Google Analytics 4, Google Ads conversion tags, and Google
          Tag Manager, so campaigns can be measured, edited, and run against this website.{" "}
          {live
            ? "Measurement tags are currently active on this deployment."
            : "Those tags are installed in the code and stay silent until a Measurement ID, Ads ID or GTM container is added."}{" "}
          Search Console verification can be set the same way.
        </p>
        <p className="mt-3">
          When tags are live they may set cookies and collect approximate location, device, and
          pages viewed, used to understand which pages help a visitor find a stone — and to
          improve paid campaigns. You can block third-party cookies in the browser.
        </p>
        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Reviews</h2>
        <p className="mt-3">
          Reviews you publish on this site stay in your browser on this device. They are not a
          substitute for a Google Business review, though we welcome both.
        </p>
        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Contact</h2>
        <p className="mt-3">
          Questions about data: {SITE.email}. Shop: {SITE.phone}.
        </p>
      </article>
    </SiteShell>
  );
}
