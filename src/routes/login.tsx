import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { CustomerLoginForm } from "@/components/customer-login-form";
import { pageHead } from "@/lib/seo";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/login")({
  component: CustomerLoginPage,
  head: () =>
    pageHead(
      "Sign in",
      "Sign in to your Sadhguru Gems & Jewellers account to track an order or leave a review.",
      "/login",
    ),
});

function CustomerLoginPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Your account"
        title="Sign in to the cabinet."
        lede="Track an order, pick up a conversation, or leave a review. No account is required to browse the cabinet."
        compact
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div className="rounded-[24px] bg-ivory p-6 shadow-card sm:p-8">
          <CustomerLoginForm />
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold">Why an account</h2>
          <ul className="mt-5 space-y-4 text-sm leading-relaxed text-ink-muted">
            <li>A tracking code from a courier sits in one place.</li>
            <li>An enquiry can be continued without starting again on WhatsApp.</li>
            <li>A review is signed with your name, not a stranger’s.</li>
          </ul>
          <p className="mt-8 text-sm text-ink-muted">
            Prefer the counter? Walk in at Kumbhari, or{" "}
            <Link to="/contact" className="font-medium text-garnet hover:text-garnet-deep">
              visit the shop
            </Link>
            .
          </p>
          <p className="mt-10 text-[11px] tracking-[0.18em] text-stone uppercase">
            <Link to="/admin" className="hover:text-bronze">
              Est. {SITE.established}
            </Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
