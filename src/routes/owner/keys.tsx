import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  clearApiKey,
  generateApiKey,
  listApiKeys,
  saveApiKey,
  verifyApiKey,
  type KeyCard,
} from "@/server/keys";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/owner/keys")({
  component: OwnerKeys,
});

function OwnerKeys() {
  const [cards, setCards] = useState<KeyCard[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [customSecret, setCustomSecret] = useState("");

  async function load() {
    const res = await listApiKeys();
    setCards(res.cards);
    if (res.minted) {
      setRevealed(res.minted);
      setFlash("House webhook minted. Copy it once — it will not be shown in full again.");
    }
  }

  useEffect(() => {
    void load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load keys."));
  }, []);

  async function saveSlot(slot: string, secret?: string) {
    const value = (secret ?? drafts[slot] ?? "").trim();
    if (!value) {
      setError("Paste a key first.");
      return;
    }
    setBusy(slot);
    setError(null);
    setFlash(null);
    try {
      const res = await saveApiKey({ data: { slot, secret: value } });
      setDrafts((d) => ({ ...d, [slot]: "" }));
      setFlash(`${res.verified ? "Verified" : "Saved"} · ${res.note}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(null);
    }
  }

  async function mint(slot: string) {
    setBusy(slot);
    setError(null);
    setFlash(null);
    try {
      const res = await generateApiKey({ data: { slot } });
      setRevealed(res.secret);
      setFlash(res.note);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mint.");
    } finally {
      setBusy(null);
    }
  }

  async function check(slot: string) {
    setBusy(slot);
    setError(null);
    try {
      const res = await verifyApiKey({ data: { slot } });
      setFlash(res.note);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify.");
    } finally {
      setBusy(null);
    }
  }

  async function onCustom(e: FormEvent) {
    e.preventDefault();
    const label = customLabel.trim();
    const secret = customSecret.trim();
    if (!label || !secret) {
      setError("Name and key both needed.");
      return;
    }
    const slot = `custom:${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
    setBusy(slot);
    setError(null);
    try {
      await saveApiKey({ data: { slot, label, secret } });
      setCustomLabel("");
      setCustomSecret("");
      setFlash("Custom key saved. Add more whenever you like.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">API keys</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        Paste one key at a time. Each save wires that service — Razorpay, Google, Vercel — without
        waiting for the rest. Secrets stay on the server. The desk only shows a mask. Generate a
        house webhook when you need a trusted secret of our own.
      </p>

      {error ? <p className="mt-4 text-sm text-garnet">{error}</p> : null}
      {flash ? <p className="mt-4 text-sm text-bronze">{flash}</p> : null}
      {revealed ? (
        <div className="mt-4 rounded-2xl border border-bronze/40 bg-white p-4">
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Copy once</p>
          <p className="mt-2 break-all font-mono text-sm text-ink">{revealed}</p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => void navigator.clipboard.writeText(revealed)}
          >
            Copy
          </Button>
        </div>
      ) : null}

      <ul className="mt-8 space-y-4">
        {cards.map((card) => (
          <li key={card.slot} className="rounded-2xl border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{card.label}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{card.hint}</p>
              </div>
              <span
                className={
                  card.verified
                    ? "rounded-full bg-bronze/15 px-2.5 py-0.5 text-[10px] tracking-[0.14em] text-bronze uppercase"
                    : card.hasSecret
                      ? "rounded-full bg-ink/5 px-2.5 py-0.5 text-[10px] tracking-[0.14em] text-ink-muted uppercase"
                      : "rounded-full bg-ivory px-2.5 py-0.5 text-[10px] tracking-[0.14em] text-stone uppercase"
                }
              >
                {card.verified ? "Verified" : card.hasSecret ? "Saved" : "Empty"}
              </span>
            </div>
            {card.hasSecret ? (
              <p className="mt-2 font-mono text-xs text-ink-muted">
                {card.kind === "public" ? card.masked : card.masked}
                {card.fingerprint && card.kind !== "public" ? ` · ${card.fingerprint}` : ""}
              </p>
            ) : null}
            {card.note ? <p className="mt-1 text-xs text-ink-muted">{card.note}</p> : null}

            {card.kind === "public" ? (
              <p className="mt-3 text-xs text-ink-muted">Public house ID — already on the shop.</p>
            ) : card.kind === "generate" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={busy === card.slot} onClick={() => void mint("house_webhook")}>
                  {card.hasSecret ? "Mint a new one" : "Generate trusted key"}
                </Button>
                {card.hasSecret ? (
                  <Button type="button" size="sm" variant="outline" disabled={busy === card.slot} onClick={() => void check(card.slot)}>
                    Verify
                  </Button>
                ) : null}
              </div>
            ) : (
              <form
                className="mt-4 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void saveSlot(card.slot);
                }}
              >
                <Label htmlFor={card.slot}>Paste key</Label>
                <Input
                  id={card.slot}
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={drafts[card.slot] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [card.slot]: e.target.value }))}
                  placeholder={card.hasSecret ? "Saved · paste a new one to replace" : "Paste here"}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" size="sm" disabled={busy === card.slot}>
                    {busy === card.slot ? "Saving…" : "Save & wire"}
                  </Button>
                  {card.hasSecret ? (
                    <Button type="button" size="sm" variant="outline" disabled={busy === card.slot} onClick={() => void check(card.slot)}>
                      Verify
                    </Button>
                  ) : null}
                  {card.kind === "custom" && card.hasSecret ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy === card.slot}
                      onClick={() => void clearApiKey({ data: { slot: card.slot } }).then(load)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={(e) => void onCustom(e)} className="mt-8 space-y-3 rounded-2xl border border-ink/10 bg-white p-5">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Any other key</p>
        <p className="text-sm text-ink-muted">Name it, paste it, save. Work progressive — one service at a time.</p>
        <div>
          <Label htmlFor="ck-name">Name</Label>
          <Input id="ck-name" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Maps, WhatsApp Cloud, Shiprocket…" />
        </div>
        <div>
          <Label htmlFor="ck-secret">Key</Label>
          <Input
            id="ck-secret"
            type="password"
            autoComplete="off"
            value={customSecret}
            onChange={(e) => setCustomSecret(e.target.value)}
            placeholder="Paste the secret"
          />
        </div>
        <Button type="submit" disabled={busy?.startsWith("custom:")}>
          Save custom key
        </Button>
      </form>
    </div>
  );
}
