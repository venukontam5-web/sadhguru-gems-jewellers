import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getRazorpaySettings, saveRazorpaySettings, testRazorpayApi } from "@/server/razorpay";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/owner/payments")({
  component: OwnerPayments,
});

function OwnerPayments() {
  const [merchantId, setMerchantId] = useState<string>(SITE.razorpayMerchantId);
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [hasSecret, setHasSecret] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getRazorpaySettings()
      .then((s) => {
        setMerchantId(s.merchantId);
        setKeyId(s.keyId);
        setHasSecret(s.hasSecret);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load keys."));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const res = await saveRazorpaySettings({ data: { merchantId, keyId, keySecret } });
      setKeyId(res.keyId);
      setMerchantId(res.merchantId);
      if (keySecret.trim() || res.hasSecret) setHasSecret(true);
      setKeySecret("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function onTest() {
    setTesting(true);
    setNote(null);
    setError(null);
    try {
      const res = await testRazorpayApi();
      setNote(`API connected · ${res.mode} · merchant ${res.merchantId} · ${res.keyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Razorpay did not answer.");
    } finally {
      setTesting(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : SITE.url;

  return (
    <div className="max-w-xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Counter</p>
      <h1 className="font-display text-4xl font-semibold">Razorpay API</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        Checkout creates a Razorpay order, opens UPI or card, then verifies the signature and the
        payment on their API. Merchant ID is {SITE.razorpayMerchantId}. Paste Key ID and Key Secret
        from Razorpay → Account & Settings → API Keys. The secret never leaves this desk.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="mid">Merchant ID</Label>
          <Input
            id="mid"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="bg-white/5 font-mono text-parchment"
          />
        </div>
        <div>
          <Label htmlFor="kid">Key ID</Label>
          <Input
            id="kid"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="rzp_live_… or rzp_test_…"
            className="bg-white/5 font-mono text-parchment"
          />
        </div>
        <div>
          <Label htmlFor="sec">Key Secret</Label>
          <Input
            id="sec"
            type="password"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            placeholder={hasSecret ? "Saved — paste again only to replace" : "Paste from Razorpay"}
            className="bg-white/5 font-mono text-parchment"
            autoComplete="off"
          />
        </div>
        <p className="text-xs text-parchment/50">
          Webhook in Razorpay (payment.captured, order.paid):{" "}
          <span className="font-mono break-all">{origin}/api/razorpay/webhook</span>
        </p>
        {saved ? <p className="text-sm text-bronze">Saved.</p> : null}
        {note ? <p className="text-sm text-bronze">{note}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy} className="bg-bronze text-ink hover:bg-bronze-soft">
            {busy ? "Saving…" : "Save keys"}
          </Button>
          <Button
            type="button"
            variant="ivory"
            disabled={testing}
            className="border border-white/15 bg-transparent text-parchment"
            onClick={() => void onTest()}
          >
            {testing ? "Talking to Razorpay…" : "Test API"}
          </Button>
        </div>
      </form>
    </div>
  );
}
