import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ownerAiBrief, ownerAiReach, ownerAiSolve, ownerAiToggle } from "@/server/ai-desk";
import { ownerCollectLeads } from "@/server/leads";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { DeskTabs } from "@/components/owner-tabs";

export const Route = createFileRoute("/owner/ai")({
  component: OwnerAi,
});

const TABS = [
  { id: "control", label: "All in one" },
  { id: "needs", label: "Needs" },
  { id: "mail", label: "Mail autopilot" },
  { id: "deploy", label: "Deploy" },
  { id: "solve", label: "Solve" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function OwnerAi() {
  const [tab, setTab] = useState<Tab>("control");
  const [data, setData] = useState<Awaited<ReturnType<typeof ownerAiBrief>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<Awaited<ReturnType<typeof ownerAiSolve>> | null>(null);

  const load = useCallback(() => {
    void ownerAiBrief()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load."));
  }, []);
  useEffect(load, [load]);

  async function collect() {
    setBusy(true);
    setError(null);
    try {
      const res = await ownerCollectLeads();
      setNote(`Collected ${res.count} from visits and enquiries.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not collect.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle() {
    if (!data) return;
    setBusy(true);
    try {
      await ownerAiToggle({ data: { on: !data.autopilot } });
      setNote(data.autopilot ? "Autopilot off." : "Autopilot on. Queue is ready.");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function reach(id: number, channel: "mail" | "whatsapp") {
    setBusy(true);
    try {
      const res = await ownerAiReach({ data: { id, channel } });
      if (res.href) window.open(res.href, "_blank", "noopener");
      setNote(`Reached ${res.name || "them"}.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach.");
    } finally {
      setBusy(false);
    }
  }

  async function onSolve(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setAnswer(await ownerAiSolve({ data: { q } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not solve.");
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <p className="text-sm text-parchment/60">Loading the house AI…</p>;

  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Advanced AI</p>
      <h1 className="font-display text-4xl font-semibold">All-in-one control</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-parchment/60">
        Website, WhatsApp Business, Facebook, Instagram, and house mail on one desk. AI reads
        customer needs from visits and enquiries — it does not scrape strangers.
      </p>
      {error ? <p className="mt-3 text-sm text-garnet">{error}</p> : null}
      {note ? <p className="mt-3 text-sm text-bronze">{note}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => void collect()} disabled={busy}>
          Find customer needs
        </Button>
        <Button type="button" size="sm" variant={data.autopilot ? "gold" : "outline"} onClick={() => void toggle()} disabled={busy}>
          Mail autopilot {data.autopilot ? "on" : "off"}
        </Button>
      </div>

      <DeskTabs tabs={TABS} value={tab} onChange={setTab} label="AI desk" />

      {tab === "control" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.channels.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
            >
              <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">{c.live ? "Live" : "Off"}</p>
              <h3 className="mt-2 font-display text-2xl">{c.label}</h3>
              <p className="mt-1 text-sm text-parchment/55">{c.note}</p>
            </a>
          ))}
        </div>
      ) : null}

      {tab === "needs" ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.needs.map((n) => (
              <div key={n.need} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="font-display text-2xl">{n.need}</p>
                <p className="mt-1 text-xs text-parchment/50">{n.n} asked</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[10px] tracking-[0.16em] text-parchment/50 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Need</th>
                  <th className="px-4 py-3 font-medium">Place</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Mail</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((p, i) => (
                  <tr key={`${p.email}-${p.contact}-${i}`} className="border-t border-white/8">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.need}</td>
                    <td className="px-4 py-3 text-parchment/70">{p.place || "—"}</td>
                    <td className="px-4 py-3">
                      {p.waHref ? (
                        <a href={p.waHref} target="_blank" rel="noreferrer" className="text-bronze">
                          {p.contact}
                        </a>
                      ) : (
                        p.contact || "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.mailHref ? (
                        <a href={p.mailHref} className="text-bronze">
                          {p.email}
                        </a>
                      ) : (
                        p.email || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "mail" ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-parchment/60">
            Autopilot prepares a Namaste with the stone they asked for. Send next opens Gmail or
            WhatsApp. The desk marks Reached.
          </p>
          {data.mailQueue.slice(0, 12).map((p) => (
            <div key={`m-${p.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-parchment/55">
                  {p.need} · {p.email}
                </p>
              </div>
              <Button type="button" size="sm" disabled={busy} onClick={() => void reach(p.id, "mail")}>
                Send next mail
              </Button>
            </div>
          ))}
          {data.waQueue.slice(0, 8).map((p) => (
            <div key={`w-${p.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-parchment/55">
                  {p.need} · {p.contact}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void reach(p.id, "whatsapp")}>
                WhatsApp
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "deploy" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href={data.liveUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/8 bg-white/4 p-5 hover:border-bronze/40">
            <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">Live</p>
            <h3 className="mt-2 font-display text-2xl">Website</h3>
            <p className="mt-1 text-sm text-parchment/55">{data.liveUrl.replace(/^https?:\/\//, "")}</p>
          </a>
          <a href={data.githubUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/8 bg-white/4 p-5 hover:border-bronze/40">
            <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">Book</p>
            <h3 className="mt-2 font-display text-2xl">GitHub</h3>
            <p className="mt-1 text-sm text-parchment/55">Official shop repo</p>
          </a>
          <a href={data.importUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-bronze/40 bg-white p-5">
            <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">Solve</p>
            <h3 className="mt-2 font-display text-2xl text-ink">Authorize Vercel</h3>
            <p className="mt-1 text-sm text-ink-muted">One Allow tap hangs GitHub on the Hobby team.</p>
          </a>
          <Link to="/owner/live" className="rounded-2xl border border-white/8 bg-white/4 p-5 hover:border-bronze/40">
            <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">Desk</p>
            <h3 className="mt-2 font-display text-2xl">Live website tray</h3>
            <p className="mt-1 text-sm text-parchment/55">Domain, token, deploy hook.</p>
          </Link>
        </div>
      ) : null}

      {tab === "solve" ? (
        <form onSubmit={(e) => void onSolve(e)} className="mt-6 max-w-xl space-y-3">
          <Label htmlFor="ai-q" className="text-parchment/70">
            What is hard?
          </Label>
          <Input
            id="ai-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Deploy, mail, WhatsApp, till, customer needs…"
            className="bg-white"
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Reading the book…" : "Solve"}
          </Button>
          {answer ? (
            <div className="rounded-2xl border border-bronze/40 bg-white p-5">
              <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">Answer</p>
              <h3 className="mt-1 font-display text-2xl text-ink">{answer.title}</h3>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-muted">
                {answer.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                {answer.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target={l.href.startsWith("/") ? undefined : "_blank"}
                    rel={l.href.startsWith("/") ? undefined : "noreferrer"}
                    className="inline-flex h-9 items-center rounded-[10px] bg-bronze px-3 text-xs font-medium text-ink"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
