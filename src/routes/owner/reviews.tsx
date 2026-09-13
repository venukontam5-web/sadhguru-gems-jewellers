import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SEED_REVIEWS } from "@/data/reviews";
import { DeskTabs } from "@/components/owner-tabs";

export const Route = createFileRoute("/owner/reviews")({
  component: OwnerReviews,
});

function OwnerReviews() {
  const [tab, setTab] = useState<"All" | "store" | "guest">("All");
  const list = useMemo(
    () => (tab === "All" ? SEED_REVIEWS : SEED_REVIEWS.filter((r) => r.source === tab)),
    [tab],
  );
  const tabs = [
    { id: "All" as const, label: "All", count: SEED_REVIEWS.length },
    {
      id: "store" as const,
      label: "From the shop",
      count: SEED_REVIEWS.filter((r) => r.source === "store").length,
    },
    {
      id: "guest" as const,
      label: "Guests",
      count: SEED_REVIEWS.filter((r) => r.source === "guest").length,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Reviews</h1>
      <p className="mt-2 max-w-xl text-sm text-parchment/60">
        Public reviews shown on the website. Reply on Google; this panel does not invent ratings.
      </p>
      <Link to="/reviews" className="mt-3 inline-flex min-h-11 items-center text-sm text-bronze">
        View public reviews page
      </Link>
      <DeskTabs tabs={tabs} value={tab} onChange={setTab} label="Review source" />
      <ul className="mt-6 space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-2xl border border-white/8 p-4">
            <p className="font-medium">
              {r.name} · {r.rating}/5
            </p>
            <p className="mt-1 text-xs tracking-wide text-parchment/45 uppercase">
              {r.city} · {r.date}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-parchment/75">{r.body}</p>
          </li>
        ))}
        {!list.length ? (
          <li className="rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-parchment/50">
            Nothing in this tab.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
