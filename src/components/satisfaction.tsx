import { useState, type FormEvent } from "react";
import { saveOrderFeedback } from "@/server/shop-orders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SatisfactionAsk({
  code,
  initialSatisfied = "",
  initialFeedback = "",
}: {
  code: string;
  initialSatisfied?: string;
  initialFeedback?: string;
}) {
  const [satisfied, setSatisfied] = useState(initialSatisfied);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [sent, setSent] = useState(Boolean(initialSatisfied));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (satisfied !== "yes" && satisfied !== "no") {
      setError("Please say whether you are satisfied.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveOrderFeedback({
        data: { code, satisfied, feedback },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that note.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[22px] bg-ivory p-6 shadow-card">
        <p className="text-xs tracking-[0.18em] text-garnet uppercase">Thank you</p>
        <h2 className="mt-2 font-display text-2xl">
          {satisfied === "yes" ? "We are glad the piece sits well." : "We will look into this with care."}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {feedback ? `Your note: “${feedback}”` : "If you wish to say more, write a review on the shop."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="rounded-[22px] bg-ivory p-6 shadow-card">
      <p className="text-xs tracking-[0.18em] text-garnet uppercase">After the piece</p>
      <h2 className="mt-2 font-display text-3xl">Are you satisfied?</h2>
      <p className="mt-2 text-sm text-ink-muted">Yes or no is enough. A sentence helps the house.</p>
      <div className="mt-5 flex gap-3">
        {(
          [
            ["yes", "Yes — satisfied"],
            ["no", "No — not yet"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSatisfied(id)}
            className={cn(
              "h-12 flex-1 rounded-[14px] border text-sm font-medium",
              satisfied === id
                ? id === "yes"
                  ? "border-garnet bg-garnet text-ivory"
                  : "border-ink bg-ink text-parchment"
                : "border-ink/15 bg-transparent text-ink hover:bg-ink/[0.04]",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="mt-5 block text-sm">
        Please give us feedback
        <textarea
          className="mt-1.5 min-h-24 w-full rounded-[16px] border border-ink/12 bg-ivory px-3.5 py-3 text-sm outline-none focus:border-garnet"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="The stone, the setting, the packing — whatever you wish to say."
          maxLength={800}
        />
      </label>
      {error ? <p className="mt-2 text-sm text-garnet">{error}</p> : null}
      <Button type="submit" disabled={busy} className="mt-4">
        {busy ? "Sending…" : "Send feedback"}
      </Button>
    </form>
  );
}
