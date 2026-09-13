import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SEED_REVIEWS, STORAGE_KEY, type Review } from "@/data/reviews";
import { SITE } from "@/data/site";
import { pageHead } from "@/lib/seo";
import { trackLead } from "@/lib/analytics";

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
  head: () =>
    pageHead(
      "Feedback & Reviews",
      `Read and leave a review for Sadhguru Gems & Jewellers, Solapur. Rated ${SITE.rating} from ${SITE.reviewCount} public reviews.`,
      "/reviews",
    ),
});

function loadGuest(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Review[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ReviewsPage() {
  const [guest, setGuest] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setGuest(loadGuest());
  }, []);

  const all = useMemo(() => [...guest, ...SEED_REVIEWS], [guest]);
  const avg =
    all.reduce((s, r) => s + r.rating, 0) / Math.max(all.length, 1);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const row: Review = {
      id: `g-${Date.now()}`,
      name,
      city: city || "Solapur",
      rating,
      date: new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }),
      title,
      body,
      source: "guest",
    };
    const next = [row, ...guest];
    setGuest(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    trackLead("review");
    setSent(true);
    setName("");
    setCity("");
    setTitle("");
    setBody("");
  }

  return (
    <SiteShell>
      <PageHero
        kicker="Feedback & reviews"
        title="The book at the counter, now on the site."
        lede={`Public listings have us at ${SITE.rating} from ${SITE.reviewCount} reviews. Write what happened — we keep the unflattering sentences too.`}
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end gap-6 rounded-[22px] bg-ivory p-6 shadow-card">
          <p className="font-display text-6xl font-semibold tabular-nums">{avg.toFixed(1)}</p>
          <div>
            <Stars n={Math.round(avg)} />
            <p className="mt-1 text-sm text-ink-muted">{all.length} notes on this page</p>
          </div>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            {all.map((r) => (
              <blockquote key={r.id} className="rounded-[22px] bg-ivory p-6 shadow-card">
                <Stars n={r.rating} />
                <h2 className="mt-3 font-display text-2xl font-semibold">{r.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{r.body}</p>
                <footer className="mt-4 text-xs tracking-wide text-stone uppercase">
                  {r.name} · {r.city} · {r.date}
                  {r.source === "guest" ? " · left on this site" : ""}
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="lg:col-span-2">
            {sent ? (
              <div className="rounded-[22px] bg-ivory p-6 shadow-card">
                <p className="text-xs tracking-[0.16em] text-garnet uppercase">Thank you</p>
                <p className="mt-2 font-display text-2xl">Your review is on the page.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="rounded-[22px] bg-ivory p-6 shadow-card">
                <h2 className="font-display text-2xl font-semibold">Leave a note</h2>
                <div className="mt-4">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="size-11 text-bronze"
                        aria-label={`${n} stars`}
                      >
                        <Star className="size-5" fill={n <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <Label htmlFor="rv-name">Name</Label>
                  <Input id="rv-name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mt-3">
                  <Label htmlFor="rv-city">City</Label>
                  <Input id="rv-city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="mt-3">
                  <Label htmlFor="rv-title">Title</Label>
                  <Input id="rv-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="mt-3">
                  <Label htmlFor="rv-body">What happened</Label>
                  <Textarea id="rv-body" required value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <Button type="submit" className="mt-5">
                  Publish review
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-bronze" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-4" fill={i < n ? "currentColor" : "none"} />
      ))}
    </div>
  );
}
