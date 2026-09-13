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
      <h1 className="font-display text-4xl font-semibold">Google Ads</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        Measurement IDs for the shop. Empty keeps the public site script-free. Paste from Google
        Ads / Analytics — nothing is sent until you Save.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="ga">Google Analytics (G-…)</Label>
          <Input id="ga" value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-" className="bg-white/5 text-parchment" />
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
          <Label htmlFor="gtm">GTM container (GTM-…)</Label>
          <Input id="gtm" value={gtmId} onChange={(e) => setGtmId(e.target.value)} placeholder="GTM-" className="bg-white/5 text-parchment" />
        </div>
        <div>
          <Label htmlFor="sc">Search Console verification</Label>
          <Input id="sc" value={searchConsole} onChange={(e) => setSearchConsole(e.target.value)} className="bg-white/5 text-parchment" />
        </div>
        {saved ? <p className="text-sm text-bronze">Saved. The shop will pick this up on the next load.</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save IDs"}
        </Button>
      </form>
    </div>
  );
}
