import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { GemCard } from "@/components/product-card";
import { RashiGuide } from "@/components/rashi-guide";
import { GEMSTONES, type GemGroup } from "@/data/gemstones";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Filter = "all" | GemGroup;

export const Route = createFileRoute("/gemstones/")({
  component: GemstonesPage,
  head: () =>
    pageHead(
      "Gemstones",
      "Navratna and cabinet gemstones at Sadhguru Gems & Jewellers, Solapur — ruby, pearl, coral, emerald, yellow sapphire, diamond, blue sapphire, hessonite and cat’s eye.",
      "/gemstones",
    ),
  validateSearch: (search: Record<string, unknown>): { group?: Filter } => ({
    group: search.group === "navratna" || search.group === "semi" || search.group === "precious" || search.group === "all"
      ? (search.group as Filter)
      : undefined,
  }),
});

function GemstonesPage() {
  const { group } = Route.useSearch();
  const [filter, setFilter] = useState<Filter>(group ?? "all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return GEMSTONES.filter((g) => {
      if (filter !== "all" && g.group !== filter) return false;
      if (!q.trim()) return true;
      const blob = `${g.name} ${g.sanskrit} ${g.planet} ${g.color}`.toLowerCase();
      return blob.includes(q.toLowerCase());
    });
  }, [filter, q]);

  return (
    <SiteShell>
      <PageHero
        kicker="Collection"
        title="Gemstones, named and described."
        lede="The nine Navratna stones, and a working cabinet of turquoise, amethyst, citrine, garnet, opal, moonstone and peridot. Treatments are disclosed. Traditional associations are offered as tradition — not as a guarantee. Open the Navratna guide to explore each graha’s benefits."
        image="/images/hero-gems.jpg"
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All stones"],
                ["navratna", "Navratna"],
                ["semi", "Cabinet"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "h-10 rounded-full px-4 text-sm font-medium",
                  filter === id ? "bg-ink text-parchment" : "bg-ivory text-ink shadow-card",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, graha, colour"
            className="h-11 w-full rounded-[12px] border border-ink/12 bg-ivory px-3.5 text-sm sm:max-w-xs"
          />
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          {list.length} stones
          {" · "}
          <Link to="/navratna" className="font-medium text-garnet hover:text-garnet-deep">
            Navratna benefits
          </Link>
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((gem) => (
            <GemCard key={gem.slug} gem={gem} />
          ))}
        </div>
        {list.length === 0 ? (
          <p className="mt-10 text-ink-muted">No stone by that name. Try ruby, pukhraj, or Shani.</p>
        ) : null}
        <div className="mt-16">
          <RashiGuide />
        </div>
      </section>
    </SiteShell>
  );
}
