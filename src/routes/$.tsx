import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p className="text-xs tracking-[0.2em] text-garnet uppercase">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">This tray is empty.</h1>
        <p className="mt-4 text-ink-muted">The page is not in the cabinet. Start from the shop floor.</p>
        <Link to="/" className={cn(buttonVariants(), "mt-8")}>
          Back to home
        </Link>
      </section>
    </SiteShell>
  );
}
