import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getAstrologyCopy, saveAstrologyCopy } from "@/server/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/owner/astrology")({
  component: OwnerAstrology,
});

function OwnerAstrology() {
  const [heading, setHeading] = useState("");
  const [lede, setLede] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getAstrologyCopy().then((c) => {
      setHeading(c.heading);
      setLede(c.lede);
      setOfferNote(c.offerNote);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await saveAstrologyCopy({ data: { heading, lede, offerNote } });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Jyotisha</p>
      <h1 className="font-display text-4xl font-semibold">Astrology</h1>
      <p className="mt-2 text-sm text-parchment/60">
        Words on the public rashi page. Tradition, not a medical claim. The nine-stone tray stays
        as it is.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="ah">Heading</Label>
          <Input id="ah" required value={heading} onChange={(e) => setHeading(e.target.value)} className="bg-white/5 text-parchment" />
        </div>
        <div>
          <Label htmlFor="al">Lede</Label>
          <Textarea id="al" required value={lede} onChange={(e) => setLede(e.target.value)} className="bg-white/5 text-parchment" />
        </div>
        <div>
          <Label htmlFor="ao">Offer note</Label>
          <Input id="ao" value={offerNote} onChange={(e) => setOfferNote(e.target.value)} className="bg-white/5 text-parchment" />
        </div>
        {saved ? <p className="text-sm text-bronze">On the shop.</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save copy"}
        </Button>
      </form>
      <Link to="/astrology" className="mt-6 inline-block text-sm text-bronze">
        View the public page →
      </Link>
    </div>
  );
}
