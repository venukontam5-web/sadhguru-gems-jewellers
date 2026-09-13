import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/why-us")({
  component: WhyUsPage,
  head: () =>
    pageHead(
      "Why Us",
      "Why clients choose Sadhguru Gems & Jewellers in Solapur — disclosure of treatments, daylight viewing, fair gold making charges, and a trial for Saturn stones.",
      "/why-us",
    ),
});

const PILLARS = [
  {
    title: "A name for every stone",
    body: "If it is citrine, it is citrine. If it is heated corundum, the heat is on the bill. Laboratory-grown diamonds are labelled as such. The first reason to come here is that the words on the ticket match the mineral.",
  },
  {
    title: "Daylight before the till",
    body: "Colour is judged at the north window, not only under a spotlight. A ruby that dies in a kitchen is not a ruby we want leaving with you.",
  },
  {
    title: "Gold on the counter scale",
    body: "Making charges are spoken before the piece goes to the bench. Weight is taken in front of you. One-gram offering pieces are kept because vows do not wait for a wholesale lot.",
  },
  {
    title: "Saturn is not a rush",
    body: "Blue sapphire can wait. We offer a trial. A house that needs the sale today is not a house you should trust with Shani.",
  },
  {
    title: "Metals that work",
    body: "Brass lamps that hold oil. Copper bottles that are copper through the wall, not steel with a wash. Tin lining is declared. Plating is declared.",
  },
  {
    title: "One shop, several languages",
    body: "Hindi, Marathi, Kannada, Telugu, English. The gem does not care; the person buying it might. We will sit until the question is finished.",
  },
];

function WhyUsPage() {
  return (
    <SiteShell>
      <PageHero
        kicker="Why us"
        title="Come for the stone. Stay because the bill is boring."
        lede="Jewellery shops often sell atmosphere. We sell a mineral, a weight, and a sentence you can read later."
      />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:px-6 md:grid-cols-2">
        {PILLARS.map((p) => (
          <article key={p.title} className="rounded-[22px] bg-ivory p-7 shadow-card">
            <h2 className="font-display text-2xl font-semibold">{p.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{p.body}</p>
          </article>
        ))}
      </section>
      <section className="bg-ink px-4 py-16 text-parchment sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold">What we will still refuse</h2>
          <p className="mt-4 text-parchment/75">
            Medical claims. Guaranteed planetary results. A Navratna set in a hurry for a wedding
            tomorrow. Glass sold as emerald. If that disappoints you, another street will be happy
            to help.
          </p>
          <Link to="/contact" className={cn(buttonVariants({ variant: "ivory" }), "mt-8")}>
            Ask a straight question
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
