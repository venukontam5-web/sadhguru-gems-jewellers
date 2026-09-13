import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import { ownerDashboard, ownerListVisitors } from "@/server/catalogue";
import { runPageSpeed } from "@/server/pagespeed";
import { pagespeedUrl, type PsiScores } from "@/lib/pagespeed";
import { SITE } from "@/data/site";
import type { ShopVisit } from "@/lib/shop";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/performance")({
  component: OwnerPerformance,
});

function scoreTone(n: number | null) {
  if (n == null) return "text-parchment/50";
  if (n >= 90) return "text-emerald-300";
  if (n >= 50) return "text-bronze";
  return "text-red-300";
}

function OwnerPerformance() {
  const [dash, setDash] = useState<Awaited<ReturnType<typeof ownerDashboard>> | null>(null);
  const [visits, setVisits] = useState<ShopVisit[]>([]);
  const [psi, setPsi] = useState<PsiScores | null>(null);
  const [busy, setBusy] = useState<"mobile" | "desktop" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    void ownerDashboard().then(setDash);
    void ownerListVisitors().then(setVisits);
  }, []);
  useEffect(load, [load]);

  const byPath = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of visits) map.set(v.path, (map.get(v.path) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [visits]);
  const max = byPath[0]?.[1] ?? 1;

  async function test(strategy: "mobile" | "desktop") {
    setBusy(strategy);
    setError(null);
    try {
      const res = await runPageSpeed({ data: { url: SITE.url, strategy } });
      setPsi(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PageSpeed did not answer.");
    } finally {
      setBusy(null);
    }
  }

  if (!dash) return <p className="text-sm text-parchment/60">Reading the book…</p>;

  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">Performance</h1>
      <p className="mt-2 max-w-2xl text-sm text-parchment/60">
        Google PageSpeed Insights is the exact lab test — Lighthouse on a phone and a computer. Field
        data (LCP, INP, CLS) is what real visitors felt. This preview is not what Google measures;
        the live shop is.
      </p>

      <section className="mt-8 rounded-2xl border border-white/8 bg-white/4 p-5">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Core Web Vitals</p>
        <h2 className="mt-1 font-display text-2xl">What Google ranks</h2>
        <p className="mt-1 max-w-2xl text-sm text-parchment/55">
          Three numbers. Field data is 28 days of real phones. Lab data is one Lighthouse run.
          Good is green on Search.
        </p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-white/8 p-4">
            <p className="text-[10px] tracking-wide text-bronze uppercase">LCP · photograph</p>
            <h3 className="mt-2 font-display text-2xl">Largest paint</h3>
            <p className="mt-1 text-sm text-parchment/60">When the main picture or title appears.</p>
            <p className="mt-3 text-xs text-parchment/50">Good ≤ 2.5s · Poor {'>'} 4s</p>
            <p className="mt-3 text-sm text-bronze">
              At risk on this shop. The ring photograph is ~350 KB, collection stones 400–650 KB,
              and nine Google font families load before the type settles. Mark the hero as high
              priority; compress stones; keep two fonts.
            </p>
          </div>
          <div className="rounded-xl border border-white/8 p-4">
            <p className="text-[10px] tracking-wide text-bronze uppercase">INP · tap</p>
            <h3 className="mt-2 font-display text-2xl">Next paint</h3>
            <p className="mt-1 text-sm text-parchment/60">How soon a tap — bag, menu, bill — answers.</p>
            <p className="mt-3 text-xs text-parchment/50">Good ≤ 200ms · Poor {'>'} 500ms</p>
            <p className="mt-3 text-sm text-parchment/70">
              Watch on the cabinet. Cart, sign-in, and the owner desk all run in the browser. Keep
              the shop JS lean so a finger on Shop the cabinet paints in under 200ms.
            </p>
          </div>
          <div className="rounded-xl border border-white/8 p-4">
            <p className="text-[10px] tracking-wide text-bronze uppercase">CLS · jump</p>
            <h3 className="mt-2 font-display text-2xl">Layout shift</h3>
            <p className="mt-1 text-sm text-parchment/60">Whether the page jumps while it loads.</p>
            <p className="mt-3 text-xs text-parchment/50">Good ≤ 0.1 · Poor {'>'} 0.25</p>
            <p className="mt-3 text-sm text-emerald-300/90">
              Passing on the shop. Ivory trays reserve the photograph’s box (4:3 and square). Fonts
              use display=swap. Do not drop images in without a height.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/8 bg-white/4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Google PageSpeed Insights</p>
            <h2 className="mt-1 font-display text-2xl">Speed of {SITE.domain}</h2>
            <p className="mt-1 text-sm text-parchment/55">
              Lab scores 0–100. Opportunities are the exact issues Google wants fixed.
            </p>
          </div>
          <Gauge className="size-8 text-bronze" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={busy !== null}
            className="bg-bronze text-ink hover:bg-bronze-soft"
            onClick={() => void test("mobile")}
          >
            {busy === "mobile" ? "Google is measuring…" : "Test phone"}
          </Button>
          <Button
            type="button"
            disabled={busy !== null}
            variant="ivory"
            className="border border-white/15 bg-transparent text-parchment"
            onClick={() => void test("desktop")}
          >
            {busy === "desktop" ? "Google is measuring…" : "Test computer"}
          </Button>
          <a
            href={pagespeedUrl(SITE.url, "mobile")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-sm text-parchment/80 hover:bg-white/6"
          >
            Open official report →
          </a>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-300">
            {error}{" "}
            <a href={pagespeedUrl(SITE.url, "mobile")} target="_blank" rel="noreferrer" className="text-bronze underline">
              Open PageSpeed on Google
            </a>
          </p>
        ) : null}
        {psi ? (
          <div className="mt-6 space-y-6">
            <p className="text-xs text-parchment/50">
              {psi.strategy === "mobile" ? "Phone" : "Computer"} · {psi.url}
            </p>
            {psi.field.length ? (
              <div>
                <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">
                  Field · real visitors
                  {psi.fieldSource === "origin" ? " · whole shop" : " · this page"}
                </p>
                <p className="mt-1 text-sm text-parchment/55">
                  Chrome User Experience Report, last 28 days, 75th percentile. This is what Search
                  uses. {psi.fieldOverall === "FAST" ? "Passed." : psi.fieldOverall === "SLOW" ? "Failed." : psi.fieldOverall === "AVERAGE" ? "Needs work." : ""}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-5">
                  {psi.field.map((f) => (
                    <div key={f.name} className="rounded-xl border border-white/8 p-4">
                      <p className={`font-display text-2xl tabular-nums ${
                        f.category === "FAST" ? "text-emerald-300" : f.category === "SLOW" ? "text-red-300" : "text-bronze"
                      }`}>
                        {f.value}
                      </p>
                      <p className="mt-1 text-xs text-parchment/55">{f.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-parchment/55">
                No field data yet. Google needs roughly a thousand Chrome visits in 28 days. Until
                then, only the lab run below exists.
              </p>
            )}
            <div>
              <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">Lab · Lighthouse</p>
              <p className="mt-1 text-sm text-parchment/55">
                One cold load on Google’s phone. Score 0–100 is lab only — not the ranking signal.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {(
                  [
                    ["Performance", psi.performance],
                    ["SEO", psi.seo],
                    ["Accessibility", psi.accessibility],
                    ["Best practices", psi.bestPractices],
                  ] as const
                ).map(([label, n]) => (
                  <div key={label} className="rounded-xl border border-white/8 p-4">
                    <p className={`font-display text-4xl tabular-nums ${scoreTone(n)}`}>{n ?? "—"}</p>
                    <p className="mt-1 text-xs text-parchment/55">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm">
                <p>
                  <span className="block text-[10px] tracking-wide text-parchment/45 uppercase">FCP</span>
                  {psi.fcp}
                </p>
                <p>
                  <span className="block text-[10px] tracking-wide text-parchment/45 uppercase">LCP</span>
                  {psi.lcp}
                </p>
                <p>
                  <span className="block text-[10px] tracking-wide text-parchment/45 uppercase">TBT (lab INP)</span>
                  {psi.tbt}
                </p>
                <p>
                  <span className="block text-[10px] tracking-wide text-parchment/45 uppercase">CLS</span>
                  {psi.cls}
                </p>
                <p>
                  <span className="block text-[10px] tracking-wide text-parchment/45 uppercase">Speed index</span>
                  {psi.si}
                </p>
              </div>
            </div>
            {psi.opportunities.length ? (
              <div>
                <h3 className="text-sm font-medium">Lab opportunities</h3>
                <ul className="mt-2 divide-y divide-white/8 rounded-xl border border-white/8">
                  {psi.opportunities.map((o) => (
                    <li key={o.title} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span>{o.title}</span>
                      <span className="shrink-0 text-bronze">{o.saving}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-parchment/55">No large lab savings on this run.</p>
            )}
          </div>
        ) : null}
      </section>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [dash.visits, "visits"],
          [dash.enquiries, "enquiries"],
          [dash.orders, "orders"],
          [dash.products, "active products"],
        ].map(([n, l]) => (
          <div key={String(l)} className="rounded-2xl border border-white/8 bg-white/4 p-5">
            <p className="font-display text-4xl tabular-nums">{n}</p>
            <p className="mt-1 text-sm text-parchment/60">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <h2 className="text-sm font-medium">Places</h2>
          <ul className="mt-4 space-y-3">
            {dash.places.map((p) => (
              <li key={p.country} className="flex items-center justify-between text-sm">
                <span>{p.country}</span>
                <span className="tabular-nums text-bronze">{p.count}</span>
              </li>
            ))}
            {!dash.places.length ? <li className="text-sm text-parchment/50">No places yet.</li> : null}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <h2 className="text-sm font-medium">Pages</h2>
          <ul className="mt-4 space-y-3">
            {byPath.map(([path, n]) => (
              <li key={path}>
                <div className="flex justify-between text-sm">
                  <span className="truncate pr-3">{path}</span>
                  <span className="tabular-nums text-bronze">{n}</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/8">
                  <div className="h-1 rounded-full bg-bronze" style={{ width: `${Math.max(8, (n / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
