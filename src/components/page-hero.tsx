import { cn } from "@/lib/utils";
import { MediaImg } from "@/components/product-photo";

export function PageHero({
  kicker,
  title,
  lede,
  image,
  compact,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  image?: string;
  compact?: boolean;
}) {
  if (image) {
    return (
      <section className="blend-field overflow-hidden">
        <MediaImg src={image} alt="" className="blend-photo hero-media" priority sizes="100vw" />
        <div className="blend-gilt" aria-hidden="true" />
        <div className="blend-wash" aria-hidden="true" />
        <div className="blend-stage mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          {kicker ? (
            <p className="blend-kicker text-xs font-medium tracking-[0.22em] uppercase">
              {kicker}
            </p>
          ) : null}
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
            {title}
          </h1>
          {lede ? (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-parchment/80 sm:text-lg">
              {lede}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("border-b border-line bg-ivory", compact ? "py-10" : "py-16 sm:py-20")}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {kicker ? (
          <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">{kicker}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
          {title}
        </h1>
        {lede ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">{lede}</p>
        ) : null}
      </div>
    </section>
  );
}
