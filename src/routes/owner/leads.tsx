import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ownerCollectLeads, ownerListLeads, ownerSaveLead, ownerSetLead } from "@/server/leads";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SITE_SHARE,
  reachMail,
  reachWhatsApp,
  type LeadSource,
  type LeadStatus,
  type SalesLead,
} from "@/lib/leads";
import { SITE } from "@/data/site";
import { Button } from "@/components/ui/button";
import { DeskTabs } from "@/components/owner-tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/leads")({
  component: OwnerLeads,
});

const TABS = ["Due", "New", "Reached", "Closed", "All"] as const;
type Tab = (typeof TABS)[number];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function OwnerLeads() {
  const [rows, setRows] = useState<SalesLead[]>([]);
  const [tab, setTab] = useState<Tab>("Due");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    source: "whatsapp" as LeadSource,
    handle: "",
    phone: "",
    email: "",
    interest: "Gemstones",
    place: "",
    notes: "",
  });

  const load = useCallback(() => {
    void ownerListLeads().then(setRows).catch(() => setRows([]));
  }, []);
  useEffect(load, [load]);

  const due = useMemo(() => {
    const d = today();
    return rows.filter((r) => r.status !== "Closed" && r.nextAt && r.nextAt <= d);
  }, [rows]);

  const list = useMemo(() => {
    if (tab === "All") return rows;
    if (tab === "Due") return due;
    return rows.filter((r) => r.status === tab);
  }, [rows, tab, due]);

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

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await ownerSaveLead({ data: form });
      setForm({
        name: "",
        source: "whatsapp",
        handle: "",
        phone: "",
        email: "",
        interest: "Gemstones",
        place: "",
        notes: "",
      });
      setNote("Lead written in the book.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Need a number or mail the person gave you.");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: number, status: LeadStatus) {
    await ownerSetLead({ data: { id, status } });
    load();
  }

  async function copyShare() {
    await navigator.clipboard.writeText(SITE_SHARE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const tabs = TABS.map((id) => ({
    id,
    label: id,
    count: id === "All" ? rows.length : id === "Due" ? due.length : rows.filter((r) => r.status === id).length,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Sales agent</p>
          <h1 className="font-display text-4xl font-semibold">Lead book</h1>
          <p className="mt-2 max-w-xl text-sm text-parchment/60">
            Works people who already came to the house — website visits, the enquiry form, and names you write in.
            It does not pull WhatsApp or mail from Instagram or Facebook. Those houses forbid it.
          </p>
        </div>
        <Button
          type="button"
          disabled={busy}
          onClick={() => void collect()}
          className="bg-bronze text-ink hover:bg-bronze-soft"
        >
          {busy ? "Collecting…" : "Collect from website"}
        </Button>
      </div>

      <section className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-5">
        <h2 className="font-display text-2xl">Show the website</h2>
        <p className="mt-1 text-sm text-parchment/55">
          Post this on the house Instagram, Facebook, YouTube, or X. People who want a stone will write to you.
        </p>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/30 p-3 text-xs text-parchment/80">{SITE_SHARE}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" onClick={() => void copyShare()} className="bg-bronze text-ink hover:bg-bronze-soft">
            {copied ? "Copied" : "Copy post"}
          </Button>
          <a href={SITE.instagram} target="_blank" rel="noreferrer" className="text-sm text-bronze underline">
            Instagram
          </a>
          <a href={SITE.facebook} target="_blank" rel="noreferrer" className="text-sm text-bronze underline">
            Facebook
          </a>
          <a href={SITE.youtube} target="_blank" rel="noreferrer" className="text-sm text-bronze underline">
            YouTube
          </a>
          <a href={SITE.x} target="_blank" rel="noreferrer" className="text-sm text-bronze underline">
            X
          </a>
        </div>
      </section>

      <DeskTabs tabs={tabs} value={tab} onChange={setTab} label="Lead status" />

      {note ? <p className="mt-3 text-sm text-bronze">{note}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 space-y-3">
        {list.map((l) => {
          const wa = reachWhatsApp(l);
          const mail = reachMail(l);
          return (
            <article key={l.id} className="rounded-2xl border border-white/8 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {l.name || "Lead"}{" "}
                    <span className="text-xs font-normal text-parchment/45">
                      · {l.source}
                      {l.handle ? ` @${l.handle}` : ""}
                    </span>
                  </p>
                  <p className="text-sm text-parchment/70">
                    {l.interest}
                    {l.place ? ` · ${l.place}` : ""}
                    {l.phone ? ` · ${l.phone}` : ""}
                    {l.email ? ` · ${l.email}` : ""}
                  </p>
                  {l.nextAt && l.status !== "Closed" ? (
                    <p className={cn("mt-1 text-xs", l.nextAt <= today() ? "text-bronze" : "text-parchment/45")}>
                      Reminder {l.nextAt}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-wide text-bronze uppercase">{l.heat}/5 heat</span>
                  <select
                    value={l.status}
                    onChange={(e) => void setStatus(l.id, e.target.value as LeadStatus)}
                    className="h-10 rounded-lg border border-white/12 bg-black/30 px-2 text-xs"
                    aria-label={`Status for ${l.name}`}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              {l.notes ? <p className="mt-2 text-sm text-parchment/70">{l.notes}</p> : null}
              <div className="mt-3 flex flex-wrap gap-3">
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-bronze"
                    onClick={() => void setStatus(l.id, "Reached")}
                  >
                    Reach on WhatsApp
                  </a>
                ) : null}
                {mail ? (
                  <a href={mail} className="text-sm text-bronze" onClick={() => void setStatus(l.id, "Reached")}>
                    Reach by mail
                  </a>
                ) : null}
                <button
                  type="button"
                  className="text-sm text-parchment/55"
                  onClick={() => void setStatus(l.id, "Remind")}
                >
                  Remind tomorrow
                </button>
              </div>
            </article>
          );
        })}
        {!list.length ? (
          <p className="rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-parchment/50">
            {tab === "Due"
              ? "No reminders due. Collect from the website, or write a name someone gave you."
              : "Nothing in this tray."}
          </p>
        ) : null}
      </div>

      <form onSubmit={(e) => void add(e)} className="mt-10 max-w-xl space-y-3 rounded-2xl border border-white/8 p-5">
        <h2 className="font-display text-2xl">Write a lead by hand</h2>
        <p className="text-sm text-parchment/55">
          Use this when someone on Instagram or WhatsApp gave you their number. Do not guess a stranger’s mail.
        </p>
        <label className="block text-xs text-parchment/60">
          Name
          <input
            className="mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-parchment/60">
            Where you met
            <select
              className="mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-2 text-sm"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as LeadSource }))}
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-parchment/60">
            Handle
            <input
              className="mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm"
              value={form.handle}
              onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
              placeholder="@name"
            />
          </label>
          <label className="text-xs text-parchment/60">
            WhatsApp
            <input
              className="mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="70207 35981"
            />
          </label>
          <label className="text-xs text-parchment/60">
            Mail ID
            <input
              className="mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label className="text-xs text-parchment/60">
            Stone / requirement
            <input
              className="mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm"
              value={form.interest}
              onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}
            />
          </label>
          <label className="text-xs text-parchment/60">
            Place
            <input
              className="mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm"
              value={form.place}
              onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
            />
          </label>
        </div>
        <Button type="submit" disabled={busy} className="bg-bronze text-ink hover:bg-bronze-soft">
          Save lead
        </Button>
      </form>
    </div>
  );
}
