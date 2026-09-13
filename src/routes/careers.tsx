import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/header";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SITE } from "@/data/site";
import { pageHead } from "@/lib/seo";
import { trackLead } from "@/lib/analytics";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  head: () =>
    pageHead(
      "Careers",
      "Work with Sadhguru Gems & Jewellers in Solapur — gemologist, counter, bench, and studio roles.",
      "/careers",
    ),
});

const ROLES = [
  {
    title: "Gemologist / Cabinet assistant",
    type: "Full-time · Solapur",
    body: "Loupe work, stock notes, and sitting with clients who have a laboratory report. GIA, IIG or equivalent is welcome; a calm manner is required.",
  },
  {
    title: "Gold & silver bench",
    type: "Full-time · Workshop",
    body: "Setting, kundan, and small repairs. Bring a tray of your own work. We do not train from zero on client stones.",
  },
  {
    title: "Counter & Marathi/Kannada sales",
    type: "Full-time · Shop floor",
    body: "Weight, billing, and the patience to explain why a stone is not what a cousin on WhatsApp said it was.",
  },
  {
    title: "Open application",
    type: "When the work fits",
    body: "Polishing, accounts, photography, or digital marketing for the house. Write and tell us what you actually do.",
  },
];

function CareersPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0].title);
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const prev = JSON.parse(localStorage.getItem("sgj-applications") || "[]") as unknown[];
      localStorage.setItem(
        "sgj-applications",
        JSON.stringify([{ name, role, contact, note, at: new Date().toISOString() }, ...prev].slice(0, 30)),
      );
    } catch {
      /* ignore */
    }
    trackLead("career");
    setSent(true);
  }

  return (
    <SiteShell>
      <PageHero
        kicker="Careers"
        title="Come and work where the stones are named."
        lede="A small house on Akkalkot Road. We hire slowly. The work is real — weight, setting, conversation — not a script."
      />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:px-6 lg:grid-cols-2">
        {ROLES.map((r) => (
          <article key={r.title} className="rounded-[22px] bg-ivory p-7 shadow-card">
            <p className="text-xs tracking-[0.16em] text-garnet uppercase">{r.type}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">{r.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{r.body}</p>
          </article>
        ))}
      </section>
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          {sent ? (
            <div className="rounded-[22px] bg-parchment p-8 shadow-card">
              <h2 className="font-display text-3xl font-semibold">We have your note.</h2>
              <p className="mt-3 text-sm text-ink-muted">
                If the work fits, we will call. You can also write to {SITE.email}.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="rounded-[22px] bg-parchment p-6 shadow-card sm:p-8">
              <h2 className="font-display text-3xl font-semibold">Apply</h2>
              <p className="mt-2 text-sm text-ink-muted">No portal. A letter is enough.</p>
              <div className="mt-6">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="mt-4">
                <Label htmlFor="c-role">Role</Label>
                <select
                  id="c-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11 w-full rounded-[12px] border border-ink/12 bg-ivory px-3 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.title}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <Label htmlFor="c-contact">Phone or email</Label>
                <Input
                  id="c-contact"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="c-note">A few lines about your work</Label>
                <Textarea id="c-note" required value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <Button type="submit" className="mt-6">
                Send application
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
