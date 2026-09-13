import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { COLOUR_NOTES, COLOUR_TRAY, getColourNote } from "@/data/colours";
import { getGemstone } from "@/data/gemstones";
import { whatsappHref } from "@/data/site";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/colours")({
  component: ColoursPage,
  head: () =>
    pageHead(
      "Colour psychology",
      "How gem colours are felt in a room, and what the old books named them — ruby, pearl, emerald, pukhraj, neelam. Tradition and the tray, not a medical claim. Sadhguru Gems & Jewellers, Solapur.",
      "/colours",
    ),
});

function ColoursPage() {
  const [id, setId] = useState("green");

  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (fromHash && COLOUR_NOTES.some((c) => c.id === fromHash)) setId(fromHash);
  }, []);

  function select(next: string) {
    setId(next);
    window.history.replaceState(null, "", `#${next}`);
  }

  const note = getColourNote(id);
  const gem = getGemstone(note.slug);

  return (
    <SiteShell>
      <PageHero
        kicker="Colour psychology"
        title="A colour is felt before it is named."
        lede="Tap a hue in the tray. What follows is how that colour sits in a room — and the graha the old books gave it. Tradition and the cabinet. Not a diagnosis, not a guarantee."
        image="/images/navratna.jpg"
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.2em] text-garnet uppercase">The tray</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Choose a colour</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Nine hues from the Navratna cabinet. Green is Mercury’s garden — and the sage the shop
              is dressed in now. The centre of a full Navratna is still red: ruby for Surya.
            </p>
            <div
              className="mt-6 grid max-w-[22rem] grid-cols-3 gap-2 rounded-[24px] bg-ink p-3 sm:p-3.5"
              role="listbox"
              aria-label="Colour tray"
            >
              {COLOUR_TRAY.flat().map((cid) => {
                const c = getColourNote(cid);
                const active = c.id === id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-label={`${c.name}, ${c.stone}`}
                    aria-selected={active}
                    onClick={() => select(c.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-[14px] transition-transform duration-150",
                      active
                        ? "ring-2 ring-bronze ring-offset-2 ring-offset-ink"
                        : "opacity-85 hover:opacity-100",
                    )}
                    style={{ background: c.hue, color: c.onHue }}
                  >
                    <span className="absolute inset-x-0 bottom-0 bg-ink/55 px-1 py-1 text-center text-[10px] tracking-wide text-parchment uppercase">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-stone">Green · White · Yellow / Clear · Red · Coral / Blue · Cinnamon · Honey-eye</p>
          </div>

          <article className="lg:col-span-7">
            <div className="overflow-hidden rounded-[24px] bg-ivory shadow-card">
              <div className="flex gap-5 p-5 sm:p-7">
                <div
                  className="size-28 shrink-0 rounded-[16px] ring-1 ring-ink/10 sm:size-36"
                  style={{ background: note.hue }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-[0.18em] text-garnet uppercase">
                    {note.graha}
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{note.name}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{note.felt}</p>
                  <p className="mt-3 text-xs text-stone">{note.stone}</p>
                </div>
              </div>
              <div className="border-t border-line px-5 py-6 sm:px-7">
                <p className="text-sm leading-relaxed text-ink">{note.body}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">{note.room}</p>
                <p className="mt-4 rounded-[14px] bg-parchment px-4 py-3 text-sm text-ink-muted">
                  <span className="font-medium text-ink">From the counter. </span>
                  {note.caution}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {gem ? (
                    <Link
                      to="/gemstones/$slug"
                      params={{ slug: gem.slug }}
                      className={cn(buttonVariants())}
                    >
                      See {gem.name}
                    </Link>
                  ) : null}
                  <Link to="/navratna" className={cn(buttonVariants({ variant: "outline" }))}>
                    Navratna benefits
                  </Link>
                  <a
                    href={whatsappHref(
                      `Namaste, I would like to ask about ${note.stone} and the colour ${note.name}.`,
                    )}
                    className={cn(buttonVariants({ variant: "ghost" }))}
                  >
                    Enquire
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-line bg-ivory py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">The shop, today</p>
          <h2 className="mt-3 font-display text-4xl font-semibold">Ivory, sage, gold, moss.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">
            The public shop is dressed in this combination now. These four are not a mood board.
            They are how a jewellery house stays quiet enough for a stone to be seen.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HouseSwatch
              label="Ivory"
              felt="The field. Paper, pearl, a tray that does not compete."
              fill="var(--color-parchment)"
              ink="var(--color-ink)"
            />
            <HouseSwatch
              label="Sage"
              felt="Mercury’s garden. Speech, trade, a green that still works as a button."
              fill="var(--color-garnet)"
              ink="var(--color-ivory)"
            />
            <HouseSwatch
              label="Gold"
              felt="Metal. Reserve, kundan, the warmth of the counter scale."
              fill="var(--color-bronze)"
              ink="var(--color-ink)"
            />
            <HouseSwatch
              label="Moss"
              felt="Type and the top bar. Ink that grew in a garden, not in a printer."
              fill="var(--color-ink)"
              ink="var(--color-parchment)"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">Nine hues, in one glance</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Felt in the body of the room first. Named by the graha second. Worn only after the stone
          has been looked at in north light.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-[0.14em] text-stone uppercase">
                <th className="py-3 pr-4 font-medium">Colour</th>
                <th className="py-3 pr-4 font-medium">Felt as</th>
                <th className="py-3 pr-4 font-medium">Graha</th>
                <th className="py-3 font-medium">Stone</th>
              </tr>
            </thead>
            <tbody>
              {COLOUR_NOTES.map((c) => (
                <tr key={c.id} className="border-b border-line/70">
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => select(c.id)}
                      className="inline-flex min-h-11 items-center gap-2 text-left font-medium"
                    >
                      <span
                        className="size-4 rounded-full ring-1 ring-ink/15"
                        style={{ background: c.hue }}
                      />
                      {c.name}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-ink-muted">{c.felt}</td>
                  <td className="py-3 pr-4">{c.graha}</td>
                  <td className="py-3">{c.stone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Colour psychology is a language for rooms and dress. Jyotisha is a language for grahas.
          Neither replaces a laboratory note, a weight on the counter, or a trial for Saturn stones.
        </p>
      </section>
    </SiteShell>
  );
}

function HouseSwatch({
  label,
  felt,
  fill,
  ink,
}: {
  label: string;
  felt: string;
  fill: string;
  ink: string;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] shadow-card">
      <div className="grid h-24 place-items-center" style={{ background: fill, color: ink }}>
        <span className="font-display text-2xl">{label}</span>
      </div>
      <div className="bg-ivory px-4 py-4">
        <p className="text-sm leading-relaxed text-ink-muted">{felt}</p>
      </div>
    </div>
  );
}
