import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, MessageSquare, Star, ShoppingBag } from "lucide-react";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { UserButton, RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isStaffUser } from "@/data/staff";
import { useIsStaff } from "@/lib/use-staff";
import { HouseAccountDesk } from "@/components/house-account-desk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Your account · Sadhguru Gems & Jewellers" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const { staff, isPending: staffPending } = useIsStaff();
  if (isPending || staffPending) {
    return (
      <SiteShell>
        <div className="grid min-h-[40vh] place-items-center text-sm text-ink-muted">Opening your account…</div>
      </SiteShell>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;

  const house = staff || isStaffUser(user);
  const name = user.displayName || "friend";

  return (
    <SiteShell>
      <PageHero
        kicker={house ? "Admin dashboard" : "Your account"}
        title={`Namaste, ${name}.`}
        lede={
          house
            ? "The house books on this account — customers who visited, bills, stock, and barcode. Shoppers never see this."
            : "This is your cabinet on the site — orders, enquiries, and a review if the stone has settled."
        }
        compact
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {house ? (
          <HouseAccountDesk user={user} />
        ) : (
          <CustomerCabinet email={user.primaryEmail} />
        )}
      </section>
    </SiteShell>
  );
}

function CustomerCabinet({ email }: { email?: string | null }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-ivory p-5 shadow-card">
        <div>
          <p className="text-xs tracking-[0.18em] text-garnet uppercase">Signed in</p>
          <p className="mt-1 text-sm text-ink-muted">{email}</p>
        </div>
        <UserButton />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/cart" as const, icon: ShoppingBag, t: "Your bag", d: "Pieces waiting for checkout." },
          { to: "/track" as const, icon: Package, t: "Track an order", d: "Paste the code from your bill." },
          { to: "/enquire" as const, icon: MessageSquare, t: "Enquire", d: "A note to the cabinet. WhatsApp is faster." },
          { to: "/reviews" as const, icon: Star, t: "Leave a review", d: "If the stone has been worn, say so." },
          { to: "/shop" as const, icon: ShoppingBag, t: "Shop the cabinet", d: "Gemstones, gold, brass and copper." },
        ].map((c) => (
          <Link
            key={c.t}
            to={c.to}
            className="rounded-[22px] bg-ivory p-5 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
          >
            <c.icon className="size-5 text-bronze" />
            <h2 className="mt-3 font-display text-xl font-semibold">{c.t}</h2>
            <p className="mt-1 text-sm text-ink-muted">{c.d}</p>
          </Link>
        ))}
      </div>
      <Link to="/" className={cn(buttonVariants({ variant: "ghost" }), "mt-10")}>
        ← Back to the shop
      </Link>
    </>
  );
}
