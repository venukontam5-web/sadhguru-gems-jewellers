import { createFileRoute, Link } from "@tanstack/react-router";
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

type Success = {
  label: string;
  note: string;
  verified: boolean;
  accessHref: string;
  accessLabel: string;
  shopHref: string;
  secret?: string;
};

function OwnerKeys() {
  const [cards, setCards] = useState<KeyCard[]>([]);
  const [paste, setPaste] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const [liveUrl, setLiveUrl] = useState("https://www.sadhgurugemsandjewellers.com");

  async function load() {
    const res = await listApiKeys();
    setCards(res.cards);
    setLiveUrl(res.liveUrl);
    if (res.minted) {
      setSuccess({
        label: "House webhook",
        note: "Minted. Copy once — it will not be shown in full again.",
        verified: true,
        accessHref: `${res.liveUrl}/api/house/hook`,
        accessLabel: "House webhook",
        shopHref: res.liveUrl,
        secret: res.minted,
      });
    }
  }

  useEffect(() => {
    void load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load keys."));
  }, []);

  async function onEasy(e: FormEvent) {
    e.preventDefault();
    const secret = paste.trim();
    if (!secret) {
      setError("Paste a key first.");
      return;
    }
    setBusy("auto");
    setError(null);
    setSuccess(null);
    try {
      const res = await saveApiKey({ data: { slot: "auto", secret } });
      setPaste("");
      setSuccess({
        label: res.label,
        note: res.note,
        verified: res.verified,
        accessHref: res.accessHref,
        accessLabel: res.accessLabel,
        shopHref: res.shopHref,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(null);
    }
  }

  async function saveSlot(slot: string) {
    const value = (drafts[slot] ?? "").trim();
    if (!value) {
      setError("Paste a key first.");
      return;
    }
    setBusy(slot);
    setError(null);
    setSuccess(null);
    try {
      const res = await saveApiKey({ data: { slot, secret: value } });
      setDrafts((d) => ({ ...d, [slot]: "" }));
      setSuccess({
        label: res.label,
        note: res.note,
        verified: res.verified,
        accessHref: res.accessHref,
        accessLabel: res.accessLabel,
        shopHref: res.shopHref,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(null);
    }
  }

  async function mint() {
    setBusy("house_webhook");
    setError(null);
    try {
      const res = await generateApiKey({ data: { slot: "house_webhook" } });
      setSuccess({
        label: "House webhook",
        note: res.note,
        verified: true,
        accessHref: res.accessHref,
        accessLabel: res.accessLabel,
        shopHref: res.shopHref,
        secret: res.secret,
      });
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
      setSuccess({
        label: cards.find((c) => c.slot === slot)?.label ?? slot,
        note: res.note,
        verified: res.verified,
        accessHref: res.accessHref,
        accessLabel: res.accessLabel,
        shopHref: res.shopHref,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">API keys</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        Paste. Save. Open the access link. One key is enough — the rest can wait.
      </p>

      <ol className="mt-5 grid gap-2 text-sm text-parchment/70 sm:grid-cols-3">
        <li className="rounded-xl border border-white/10 bg-white/4 px-3 py-2">1 · Paste any key</li>
        <li className="rounded-xl border border-white/10 bg-white/4 px-3 py-2">2 · Save & wire</li>
        <li className="rounded-xl border border-white/10 bg-white/4 px-3 py-2">3 · Open access link</li>
      </ol>

      <form onSubmit={(e) => void onEasy(e)} className="mt-6 space-y-3 rounded-2xl border border-bronze/30 bg-white p-5">
        <Label htmlFor="easy-key">Paste key</Label>
        <Input
          id="easy-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="rzp_live_…  ·  G-…  ·  GTM-…  ·  Vercel token"
        />
        <p className="text-xs text-ink-muted">
          Prefix is enough: <span className="font-mono">rzp_</span>, <span className="font-mono">G-</span>,{" "}
          <span className="font-mono">GTM-</span>, <span className="font-mono">AW-</span>.
        </p>
        <Button type="submit" disabled={busy === "auto"}>
          {busy === "auto" ? "Wiring…" : "Save & wire"}
        </Button>
      </form>

      {error ? <p className="mt-4 text-sm text-garnet">{error}</p> : null}

      {success ? (
        <div className="mt-5 rounded-2xl border border-bronze/50 bg-white p-5">
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">
            {success.verified ? "Saved · verified" : "Saved"}
          </p>
          <h2 className="mt-1 font-display text-2xl text-ink">{success.label}</h2>
          <p className="mt-1 text-sm text-ink-muted">{success.note}</p>
          {success.secret ? (
            <p className="mt-3 break-all font-mono text-xs text-ink">{success.secret}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={success.accessHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-[10px] bg-bronze px-4 text-sm font-medium text-ink"
            >
              Open {success.accessLabel}
            </a>
            <a
              href={success.shopHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-[10px] border border-ink/15 px-4 text-sm text-ink"
            >
              Live shop
            </a>
            <Link to="/owner/payments" className="inline-flex h-10 items-center rounded-[10px] px-4 text-sm text-bronze">
              Razorpay till
            </Link>
          </div>
        </div>
      ) : null}

      <ul className="mt-8 space-y-3">
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
                {card.masked}
                {card.fingerprint && card.kind !== "public" ? ` · ${card.fingerprint}` : ""}
              </p>
            ) : null}
            {card.note ? <p className="mt-1 text-xs text-ink-muted">{card.note}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={card.accessHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-[10px] border border-ink/15 px-3 text-xs text-ink"
              >
                Access · {card.accessLabel}
              </a>
              {card.kind === "generate" ? (
                <Button type="button" size="sm" disabled={busy === card.slot} onClick={() => void mint()}>
                  {card.hasSecret ? "Mint a new one" : "Generate"}
                </Button>
              ) : null}
              {card.hasSecret && card.kind !== "public" ? (
                <Button type="button" size="sm" variant="outline" disabled={busy === card.slot} onClick={() => void check(card.slot)}>
                  Verify
                </Button>
              ) : null}
            </div>
            {card.kind === "paste" || card.kind === "custom" ? (
              <form
                className="mt-3 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void saveSlot(card.slot);
                }}
              >
                <Input
                  type="password"
                  autoComplete="off"
                  value={drafts[card.slot] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [card.slot]: e.target.value }))}
                  placeholder={card.hasSecret ? "Replace key" : "Paste here"}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" size="sm" disabled={busy === card.slot}>
                    {busy === card.slot ? "Saving…" : "Save & wire"}
                  </Button>
                  {card.kind === "custom" && card.hasSecret ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void clearApiKey({ data: { slot: card.slot } }).then(load)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-parchment/50">
        Live shop · {liveUrl.replace(/^https?:\/\//, "")}
      </p>
    </div>
  );
}
