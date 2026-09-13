import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SITE } from "@/data/site";
import { Button } from "@/components/ui/button";
import { DeskTabs } from "@/components/owner-tabs";

export const Route = createFileRoute("/owner/social")({
  component: OwnerSocial,
});

const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    href: SITE.instagram,
    caption:
      "A stone from the Solapur cabinet. Named honestly.\n\nSadhguru Gems & Jewellers — Akkalkot Road, Kumbhari.\nHappiness Auspicious Moment.\n\n#SadhguruGems #Navratna #Solapur",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: SITE.facebook,
    caption:
      "From the cabinet on Akkalkot Road, Kumbhari, Solapur.\n\nCertified gemstones, gold and silver made to the stone, and brass that is meant to be used. We name heat, oil, glass filling and lab-grown on the bill.\n\nVisit 9:30 AM – 8:30 PM, all seven days. Sadhguru Gems & Jewellers.",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: SITE.youtube,
    caption:
      "Sadhguru Gems & Jewellers, Akkalkot Road, Solapur.\n\nA look at a piece from the house cabinet. Stones with names — not stories invented at the counter.\n\nVisit: 106 / New Sunil Nagar, Kumbhari, Solapur 413006\nWhatsApp: +91 70207 35981",
  },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

function OwnerSocial() {
  const [tab, setTab] = useState<PlatformId>("instagram");
  const platform = PLATFORMS.find((p) => p.id === tab) ?? PLATFORMS[0];
  const [caption, setCaption] = useState<string>(platform.caption);
  const [copied, setCopied] = useState(false);

  function switchTab(id: PlatformId) {
    const next = PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
    setTab(id);
    setCaption(next.caption);
    setCopied(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl font-semibold">Social post</h1>
      <p className="mt-2 text-sm text-parchment/60">
        We cannot post from here. Write the caption, copy it, and open the account.
      </p>
      <DeskTabs
        tabs={PLATFORMS.map((p) => ({ id: p.id, label: p.label }))}
        value={tab}
        onChange={switchTab}
        label="Platform"
      />
      <textarea
        className="mt-6 min-h-44 w-full rounded-2xl border border-white/12 bg-black/30 p-4 text-sm"
        value={caption}
        onChange={(e) => {
          setCaption(e.target.value);
          setCopied(false);
        }}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => void copy()} className="bg-bronze text-ink hover:bg-bronze-soft">
          {copied ? "Copied" : "Copy caption"}
        </Button>
        <a
          href={platform.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center rounded-xl border border-white/15 px-4 text-sm"
        >
          Open {platform.label}
        </a>
      </div>
    </div>
  );
}
