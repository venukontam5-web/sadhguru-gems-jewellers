import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GEMSTONES, RASHI_GUIDE, WEEKDAY_GUIDE, getGemstone } from "@/data/gemstones";
import { Label } from "@/components/ui/input";
import { MediaImg } from "@/components/product-photo";

export function RashiGuide() {
  const [rashi, setRashi] = useState(RASHI_GUIDE[4].rashi);
  const [day, setDay] = useState(WEEKDAY_GUIDE[0].day);

  const byRashi = useMemo(() => {
    const row = RASHI_GUIDE.find((r) => r.rashi === rashi);
    return row ? getGemstone(row.slug) : undefined;
  }, [rashi]);

  const byDay = useMemo(() => {
    const row = WEEKDAY_GUIDE.find((r) => r.day === day);
    return row ? getGemstone(row.slug) : undefined;
  }, [day]);

  return (
    <section className="rounded-[28px] bg-ink px-6 py-10 text-parchment sm:px-10">
      <p className="text-xs font-medium tracking-[0.22em] text-bronze-soft uppercase">
        A first reading
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
        Find a stone by rashi or weekday
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-parchment/70">
        This is the classical pairing used in Indian jewellery cabinets — not a substitute for a
        full horoscope. We are happy to sit with you and a report before a stone is set.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <Label className="text-bronze-soft">Moon sign (rashi)</Label>
          <select
            value={rashi}
            onChange={(e) => setRashi(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-[12px] border border-white/10 bg-ink-soft px-3 text-sm text-parchment"
          >
            {RASHI_GUIDE.map((r) => (
              <option key={r.rashi} value={r.rashi}>
                {r.rashi} · {r.english}
              </option>
            ))}
          </select>
          {byRashi ? <Pick gemSlug={byRashi.slug} label="Often considered" /> : null}
        </div>
        <div>
          <Label className="text-bronze-soft">Day of first wear</Label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-[12px] border border-white/10 bg-ink-soft px-3 text-sm text-parchment"
          >
            {WEEKDAY_GUIDE.map((r) => (
              <option key={r.day} value={r.day}>
                {r.day}
              </option>
            ))}
          </select>
          {byDay ? <Pick gemSlug={byDay.slug} label="Weekday stone" /> : null}
        </div>
      </div>
      <p className="mt-6 text-xs text-stone">
        {GEMSTONES.length} stones in the current cabinet. Traditional belief, not a medical or
        financial promise.
      </p>
    </section>
  );
}

function Pick({ gemSlug, label }: { gemSlug: string; label: string }) {
  const gem = getGemstone(gemSlug);
  if (!gem) return null;
  return (
    <Link
      to="/gemstones/$slug"
      params={{ slug: gem.slug }}
      className="mt-4 flex items-center gap-4 rounded-[16px] bg-white/5 p-3 hover:bg-white/8"
    >
      <MediaImg src={gem.image} alt="" className="size-16 rounded-[12px] object-cover" sizes="64px" />
      <span>
        <span className="block text-[11px] tracking-[0.16em] text-bronze-soft uppercase">
          {label}
        </span>
        <span className="mt-1 block font-display text-xl text-parchment">{gem.name}</span>
        <span className="block text-sm text-parchment/60">{gem.sanskrit}</span>
      </span>
    </Link>
  );
}
