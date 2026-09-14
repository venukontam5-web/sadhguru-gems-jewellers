import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getLiveSettings, publishLive, saveLiveSettings } from "@/server/live";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/owner/live")({
  component: OwnerLive,
});

function OwnerLive() {
  const [accountId, setAccountId] = useState(SITE.vercelAccountId);
  const [domain, setDomain] = useState(SITE.domain);
  const [token, setToken] = useState("");
  const [hook, setHook] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [hasHook, setHasHook] = useState(false);
  const [githubUrl, setGithubUrl] = useState(SITE.githubUrl);
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
    <div className="max-w-xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">Live website</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        GitHub holds the book. Vercel hangs the name. They are tagged together on this desk.
      </p>

      <dl className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 text-sm">
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">GitHub</dt>
          <dd>
            <a href={githubUrl} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {SITE.githubRepo}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">Vercel</dt>
          <dd>
            <a href={vercelUrl} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {SITE.vercelProject}
            </a>
            <span className="mt-1 block font-mono text-xs text-ink-muted">{SITE.vercelProjectId}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">Live name</dt>
          <dd>
            <a href={liveUrl} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {liveUrl}
            </a>
          </dd>
        </div>
      </dl>

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

      <p className="mt-8 text-sm">
        <a href={importUrl} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
          Connect GitHub inside Vercel (one import)
        </a>
      </p>
    </div>
  );
}
