import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ownerAutoBrief,
  ownerAutoPulse,
  ownerAutoSolve,
  ownerAutoSync,
  ownerAutoToggle,
} from "@/server/auto-hang";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/owner/auto")({
  component: OwnerAuto,
});

function OwnerAuto() {
  const [data, setData] = useState<Awaited<ReturnType<typeof ownerAutoBrief>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("");
  const [hits, setHits] = useState<Awaited<ReturnType<typeof ownerAutoSolve>>["hits"]>([]);

  const load = useCallback((pulse = false) => {
    const run = pulse ? ownerAutoPulse : ownerAutoBrief;
    void run()
      .then((res) => {
        setData(res);
        if (res.githubError) setError(res.githubError);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load."));
  }, []);

  useEffect(() => load(false), [load]);
  useEffect(() => {
    if (!data?.autoOn) return;
    const t = window.setInterval(() => load(true), 45000);
    return () => window.clearInterval(t);
  }, [data?.autoOn, load]);

  async function toggle() {
    if (!data) return;
    setBusy(true);
    setError(null);
    try {
      await ownerAutoToggle({ data: { on: !data.autoOn } });
      setNote(data.autoOn ? "Auto mode off." : "Auto mode on. This desk will read GitHub and hang when the book moves.");
      load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not toggle.");
    } finally {
      setBusy(false);
    }
  }

  async function sync() {
    setBusy(true);
    setError(null);
    try {
      const res = await ownerAutoSync();
      setNote(res.note);
      load(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sync.");
    } finally {
      setBusy(false);
    }
  }

  async function onSolve(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await ownerAutoSolve({ data: { log } });
      setHits(res.hits);
      setNote(res.note);
      setData(res.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the log.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">Auto hang</h1>
      <p className="mt-2 text-sm leading-relaxed text-parchment/60">
        GitHub holds the book. This desk reads the latest commit, solves known red logs, and packs
        Vercel when you (or auto mode) say so.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={() => void toggle()} disabled={busy || !data}>
          {data?.autoOn ? "Auto mode on" : "Turn auto mode on"}
        </Button>
        <Button type="button" variant="ivory" onClick={() => void sync()} disabled={busy}>
          {busy ? "Working…" : "Sync GitHub → Vercel"}
        </Button>
        <a
          href={data?.vercelHang || `https://vercel.com/${SITE.vercelTeamSlug}/${SITE.vercelProjectSlug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-[12px] border border-white/15 px-5 text-sm text-parchment"
        >
          Open hang
        </a>
      </div>
      {error ? <p className="mt-3 text-sm text-garnet">{error}</p> : null}
      {note ? <p className="mt-3 text-sm text-bronze">{note}</p> : null}

      <dl className="mt-6 grid gap-3 rounded-2xl border border-bronze/40 bg-white p-5 text-sm text-ink">
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">GitHub book</dt>
          <dd>
            <a href={data?.githubUrl} className="text-garnet underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {data?.github?.short || "reading…"}
            </a>
            <span className="mt-1 block text-xs text-ink-muted">{data?.github?.message}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">Last hung</dt>
          <dd className="font-mono text-xs">
            {data?.lastShort || "never"}
            {data?.behind || data?.neverHung ? (
              <span className="ml-2 text-garnet">behind — tap Sync</span>
            ) : data?.github ? (
              <span className="ml-2 text-bronze">matched</span>
            ) : null}
            {data?.lastNote ? <span className="mt-1 block font-sans text-ink-muted">{data.lastNote}</span> : null}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-bronze uppercase">Deploy hook</dt>
          <dd>
            {data?.hasHook ? (
              "Saved. Sync will pack the hang."
            ) : (
              <>
                Missing. Paste it on{" "}
                <Link to="/owner/live" className="text-garnet underline-offset-4 hover:underline">
                  Live website
                </Link>
                , then Sync.
              </>
            )}
          </dd>
        </div>
      </dl>

      <form onSubmit={(e) => void onSolve(e)} className="mt-6 rounded-2xl border border-ink/10 bg-ivory p-5 text-ink">
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Bugs & red logs</p>
        <h2 className="mt-1 font-display text-2xl">Paste the error. This desk names the fix.</h2>
        <Label htmlFor="log" className="mt-3 block">
          Build log
        </Label>
        <textarea
          id="log"
          value={log}
          onChange={(e) => setLog(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-xl border border-ink/10 bg-white p-3 text-sm text-ink"
          placeholder="No Output Directory named dist…  or  node:fs has been externalized…"
        />
        <Button type="submit" className="mt-3" disabled={busy}>
          Solve
        </Button>
        <ul className="mt-4 space-y-3 text-sm">
          {(hits.length ? hits : data?.bugs || []).map((b) => (
            <li key={b.id} className="rounded-xl border border-ink/10 bg-white p-3">
              <p className="font-medium">
                {b.title}
                {b.solvedInBook ? (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-bronze">in the book</span>
                ) : (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-garnet">needs a tap</span>
                )}
              </p>
              <p className="mt-1 text-ink-muted">{b.fix}</p>
            </li>
          ))}
        </ul>
      </form>

      <p className="mt-6 text-xs text-parchment/50">
        Auto mode reads GitHub from this desk. It cannot press Vercel Allow for you. Keep one hang.
        Preset Other.
      </p>
    </div>
  );
}
