import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getLiveSettings, publishLive, saveLiveSettings } from "@/server/live";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GbpKit } from "@/components/gbp-kit";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/owner/live")({
  component: OwnerLive,
});

function OwnerLive() {
  const [accountId, setAccountId] = useState<string>(SITE.vercelAccountId);
  const [domain, setDomain] = useState<string>(SITE.domain);
  const [token, setToken] = useState("");
  const [hook, setHook] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [hasHook, setHasHook] = useState(false);
  const [githubUrl, setGithubUrl] = useState<string>(SITE.githubUrl);
  const [vercelUrl, setVercelUrl] = useState(
    `https://vercel.com/venukontam5-3188s-projects/${SITE.vercelProject}`,
  );
  const [importUrl, setImportUrl] = useState(
    `https://vercel.com/new/import?s=${SITE.githubUrl}`,
  );
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getLiveSettings()
      .then((s) => {
        setAccountId(s.accountId);
        setDomain(s.domain);
        setHasToken(s.hasToken);
        setHasHook(s.hasHook);
        setGithubUrl(s.githubUrl);
        setVercelUrl(s.vercelUrl);
        setImportUrl(s.importUrl);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load."));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const res = await saveLiveSettings({ data: { accountId, domain, token, hook } });
      setAccountId(res.accountId);
      setDomain(res.domain);
      if (token.trim()) setHasToken(true);
      if (hook.trim()) setHasHook(true);
      setToken("");
      setHook("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function onPublish() {
    setPublishing(true);
    setNote(null);
    setError(null);
    try {
      const res = await publishLive();
      setNote(`Publish started · ${res.state}${res.jobId ? ` · ${res.jobId}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish.");
    } finally {
      setPublishing(false);
    }
  }

  const liveUrl = `https://${domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return (
    <div className="max-w-2xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">Live website</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        The official name is live. GitHub holds the book. Vercel hangs the padlock. Do not import a
        second hang.
      </p>

      <a
        href="https://www.sadhgurugemsandjewellers.com"
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-garnet px-5 text-sm font-medium text-parchment"
      >
        Open the live shop
      </a>
      <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Hang strategy</p>
        <h2 className="mt-1 font-display text-2xl">How the shop ships</h2>
        <ul className="mt-3 space-y-3">
          <li>
            <strong>Git production (this shop).</strong> Push to <span className="font-mono text-xs">main</span>{" "}
            on GitHub. Vercel packs the hang with Nitro — a function cabinet, not a{" "}
            <span className="font-mono text-xs">dist</span> folder. Mumbai (bom1). www is the name.
          </li>
          <li>
            <strong>Do not use Vite / TanStack Start preset.</strong> That looks for{" "}
            <span className="font-mono text-xs">dist</span> and the build goes red even when the pack is ready.
            Preset Other. Output Directory empty.
          </li>
          <li>
            <strong>Do not import a second hang.</strong> One project: <span className="font-mono text-xs">sgj-live</span>.
            The spare “www-sadhgurugemsandjewellers-com” import can be deleted.
          </li>
          <li>
            <strong>Desk Publish</strong> uses a Deploy Hook if you pasted one. Same hang, no new project.
          </li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-bronze/40 bg-ivory p-5 text-sm text-ink">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Vercel desk key</p>
        <h2 className="mt-1 font-display text-2xl">Allow this hang to read sgj-live</h2>
        <p className="mt-2 text-ink-muted">
          The hang exists. GitHub is tagged. This Grok key can write but cannot list your Hobby
          projects (403). That is why Get Project says 404.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>In this Grok chat, open Connectors → Vercel → reconnect.</li>
          <li>When Vercel asks, allow team <strong>venukontam5-3188's projects</strong>.</li>
          <li>Come back and say “read the hang” — Get Project will then find sgj-live.</li>
        </ol>
      </section>

      <dl className="mt-6 grid gap-3 rounded-2xl border border-bronze/40 bg-white p-5 text-sm text-ink">
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">1 · Domain · HTTPS</dt>
          <dd>
            <a href="https://www.sadhgurugemsandjewellers.com" className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              www.sadhgurugemsandjewellers.com
            </a>
            <span className="mt-1 block text-xs text-ink-muted">
              Also{" "}
              <a href="https://sadhgurugemsandjewellers.com" className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                sadhgurugemsandjewellers.com
              </a>
              . Padlock is on. Apex redirects to www.
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">2 · GitHub book</dt>
          <dd>
            <a href={githubUrl} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {SITE.githubRepo}
            </a>
            <span className="mt-1 block text-xs text-ink-muted">Public shop book. Never paste tokens here.</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">3 · Vercel hang</dt>
          <dd>
            <a href={`https://vercel.com/${SITE.vercelTeamSlug}/sgj-live`} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              sgj-live
            </a>
            <span className="mt-1 block font-mono text-xs text-ink-muted">{SITE.vercelProjectId}</span>
            <a
              href={`https://vercel.com/${SITE.vercelTeamSlug}/www-sadhgurugemsandjewellers-com/settings/domains`}
              className="mt-2 inline-block text-xs text-garnet underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Add the domain on this hang
            </a>
          </dd>
        </div>
      </dl>

      <section className="mt-6 rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">DNS · one chain</p>
        <h2 className="mt-1 font-display text-2xl">Point the name at Vercel</h2>
        <p className="mt-2 text-ink-muted">
          At your domain desk (where you bought the name). After this, Vercel hangs the padlock.
        </p>
        <ul className="mt-3 space-y-2 font-mono text-xs">
          <li>A · @ · 76.76.21.21</li>
          <li>CNAME · www · cname.vercel-dns.com</li>
        </ul>
      </section>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-5">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Google</p>
        <h2 className="mt-2 font-display text-2xl">Show the official shop in search</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink">
          <li>
            Claim{" "}
            <a className="text-garnet underline-offset-4 hover:underline" href="https://business.google.com" target="_blank" rel="noreferrer">
              Google Business Profile
            </a>{" "}
            as Sadhguru Gems And Jewellers, Akkalkot Road, Solapur. Website {liveUrl}
          </li>
          <li>
            Open{" "}
            <a className="text-garnet underline-offset-4 hover:underline" href="https://search.google.com/search-console" target="_blank" rel="noreferrer">
              Search Console
            </a>
            , add {domain}, submit sitemap {liveUrl}/sitemap.xml
          </li>
          <li>Ask every happy hand for a Google review. Local gemstone searches follow the map pin first.</li>
        </ol>
      </div>

      <GbpKit />

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="domain">Live domain</Label>
          <Input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} autoComplete="off" />
        </div>
        <div>
          <Label htmlFor="vid">Vercel ID</Label>
          <Input
            id="vid"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="hook">Deploy hook (publish doorbell)</Label>
          <Input
            id="hook"
            type="password"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder={hasHook ? "Saved · paste a new one to replace" : "https://api.vercel.com/v1/integrations/deploy/…"}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-parchment/50">
            Vercel project → Settings → Git → Deploy Hooks → name sgj-live → branch main.
          </p>
        </div>
        <div>
          <Label htmlFor="vtok">Vercel token (optional)</Label>
          <Input
            id="vtok"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={hasToken ? "Saved · paste a new one to replace" : "Account Settings → Tokens"}
            autoComplete="off"
          />
        </div>
        {error ? <p className="text-sm text-garnet">{error}</p> : null}
        {saved ? <p className="text-sm text-bronze">Saved. GitHub and Vercel stay on this desk.</p> : null}
        {note ? <p className="text-sm text-bronze">{note}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save live access"}
          </Button>
          <Button type="button" variant="ivory" disabled={publishing || !hasHook} onClick={() => void onPublish()}>
            {publishing ? "Publishing…" : "Publish now"}
          </Button>
        </div>
      </form>

      <section className="mt-8 rounded-2xl border border-bronze/40 bg-white p-5 text-ink">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">If Vercel says no dist folder</p>
        <h2 className="mt-1 font-display text-2xl">Do not pick TanStack Start</h2>
        <p className="mt-2 text-sm text-ink-muted">
          That preset looks for a <span className="font-mono text-xs">dist</span> cabinet this shop
          never builds. The hang writes a Vercel function pack instead.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
          <li>
            Project name can stay <span className="font-mono text-xs">www-sadhgurugemsandjewellers-com</span>.
          </li>
          <li>
            Application Preset: <strong>Other</strong> — not TanStack Start, not Vite.
          </li>
          <li>
            Root Directory: <span className="font-mono text-xs">./</span>
          </li>
          <li>
            Build and Output Settings: leave Output Directory <strong>empty</strong>.
          </li>
          <li>Environment Variables: leave blank. Do not paste EXAMPLE_NAME.</li>
          <li>Tap Deploy. Wait for Ready. Then Domains → {SITE.domain}.</li>
        </ol>
        <p className="mt-3 text-sm">
          <a href={importUrl} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Open the import again
          </a>
        </p>
      </section>
    </div>
  );
}
