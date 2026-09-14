import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getSiteSettings, saveSiteSettings } from "@/server/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/owner/ads")({
  component: OwnerAds,
});

function OwnerAds() {
  const [gaId, setGaId] = useState("");
  const [adsId, setAdsId] = useState("");
  const [adsLabel, setAdsLabel] = useState("");
  const [gtmId, setGtmId] = useState("");
  const [searchConsole, setSearchConsole] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getSiteSettings().then((s) => {
      setGaId(s.gaId);
      setAdsId(s.adsId);
      setAdsLabel(s.adsLabel);
      setGtmId(s.gtmId);
      setSearchConsole(s.searchConsole);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await saveSiteSettings({ data: { gaId, adsId, adsLabel, gtmId, searchConsole } });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Campaigns</p>
      <h1 className="font-display text-4xl font-semibold">Google Analytics & Ads</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        Paste a GA4 Measurement ID (G-…). Empty keeps the shop script-free. Enquiries, careers and
        reviews already fire a lead event once this is on.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="ga">Google Analytics (G-…)</Label>
          <Input id="ga" value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-" className="bg-white/5 text-parchment" />
          <p className="mt-1 text-xs text-parchment/50">
            DebugView: live shop add ?ga_debug=1. Previews send debug automatically. Analytics → Admin → DebugView.
          </p>
        </div>
        <div>
          <Label htmlFor="ads">Google Ads (AW-…)</Label>
          <Input id="ads" value={adsId} onChange={(e) => setAdsId(e.target.value)} placeholder="AW-" className="bg-white/5 text-parchment" />
        </div>
        <div>
          <Label htmlFor="label">Conversion label</Label>
          <Input id="label" value={adsLabel} onChange={(e) => setAdsLabel(e.target.value)} className="bg-white/5 text-parchment" />
        </div>
        <div>
          <Label htmlFor="gtm">Google Tag Manager (GTM-…)</Label>
          <Input id="gtm" value={gtmId} onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-" className="bg-white/5 text-parchment" />
          <p className="mt-1 text-xs text-parchment/50">
            If GTM is filled, put GA4 and Ads tags inside GTM and leave G-/AW- empty here — avoids double counting.
          </p>
        </div>
        <div>
          <Label htmlFor="sc">Search Console verification (content=…)</Label>
          <Input
            id="sc"
            value={searchConsole}
            onChange={(e) => setSearchConsole(e.target.value)}
            placeholder="google-site-verification code"
            className="bg-white/5 text-parchment"
          />
          <p className="mt-1 text-xs text-parchment/50">
            HTML tag method only. DNS TXT can verify the name even before the padlock is on.
          </p>
        </div>
        {saved ? <p className="text-sm text-bronze">Saved. The shop will pick this up on the next load.</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save IDs"}
        </Button>
      </form>
    </div>
  );
}
