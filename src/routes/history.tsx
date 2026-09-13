import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { NAVRATNA } from "@/data/gemstones";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () =>
    pageHead(
      "History of Gemstones",
      "A short history of gemstones in India — from the Ratnapariksha to the Navratna, and how a Solapur cabinet still uses those names.",
      "/history",
    ),
});

const ERAS = [
  {
    year: "c. 6th century",
    title: "Buddhabhatta’s Ratnapariksha",
    body: "One of the earliest surviving Indian gem treatises. It names ruby, pearl, coral, emerald, yellow sapphire, diamond, blue sapphire, hessonite and cat’s eye — the nine that still sit in a Navratna tray — and teaches how to look at colour, weight and inclusion.",
  },
  {
    year: "Temple centuries",
    title: "Stones as architecture",
    body: "South Indian and Deccan temples set uncut diamonds, rubies and emeralds into gold as offerings, not as fashion. The stone was a graha, a vow, a treasury. Kundan and polki grow from this habit of leaving the crystal close to the way it came from the earth.",
  },
  {
    year: "Mughal ateliers",
    title: "The carved emerald and the spinel",
    body: "Imperial workshops in Agra and Delhi favoured large Colombian emeralds, Balas rubies (spinels), and diamonds from Golconda. Inscriptions were cut into the table of a stone. The idea that a gem could carry a name — of a king, a saint, a house — is not new.",
  },
  {
    year: "Golconda",
    title: "The old Indian diamond",
    body: "Before Brazil and South Africa, the Krishna delta supplied the world’s diamonds. Golconda stones are typically type IIa — without the nitrogen that tints a cape yellow. They are why Indian jewellery still prefers a living fire to a laboratory’s “ideal cut” diagram.",
  },
  {
    year: "Colonial trade",
    title: "Ceylon, Burma, Siam",
    body: "Colombo, Mogok and Chanthaburi became the ports through which sapphires and rubies entered Bombay and Madras. Heat treatment of corundum, already known to older burners, became an industry. Honest cabinets have been declaring it ever since.",
  },
  {
    year: "Today",
    title: "A report, a loupe, a north window",
    body: "Laboratories in Jaipur, Mumbai and Surat issue notes on origin and treatment. They do not replace looking. A stone that only lives under a spot will fail in a Solapur noon. That is still the test we use.",
  },
];

function HistoryPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="History of gemstones"
        title="Nine stones, and a few centuries of looking carefully."
        lede="India did not invent gems. It did invent a language for them — graha, rashi, navratna — that a jewellery house is still obliged to speak without theatre."
        image="/images/heritage.jpg"
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ol className="relative border-l border-line pl-8">
          {ERAS.map((era) => (
            <li key={era.title} className="mb-12 last:mb-0">
              <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-garnet" />
              <p className="text-xs font-medium tracking-[0.18em] text-garnet uppercase">
                {era.year}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">{era.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">{era.body}</p>
            </li>
          ))}
        </ol>
      </div>
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">The Navratna, as we keep it</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            A complete Navratna is nine stones in one setting, each for a graha. Most clients
            begin with a single stone. Both are traditional. Neither is a medical device.{" "}
            <Link to="/navratna" className="font-medium text-garnet hover:text-garnet-deep">
              Explore traditional benefits
            </Link>
            .
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs tracking-[0.14em] text-stone uppercase">
                  <th className="py-3 pr-4 font-medium">Stone</th>
                  <th className="py-3 pr-4 font-medium">Sanskrit</th>
                  <th className="py-3 pr-4 font-medium">Graha</th>
                  <th className="py-3 font-medium">Day</th>
                </tr>
              </thead>
              <tbody>
                {NAVRATNA.map((g) => (
                  <tr key={g.slug} className="border-b border-line/70">
                    <td className="py-3 pr-4 font-medium text-ink">{g.name}</td>
                    <td className="py-3 pr-4 text-ink-muted">{g.sanskrit}</td>
                    <td className="py-3 pr-4 text-ink-muted">
                      {g.planet} ({g.planetSanskrit})
                    </td>
                    <td className="py-3 text-ink-muted">{g.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
